---
title: "Flexible Netflow"
description: "NetFlow provides statistics on packets flowing through the router. It is primarily used for:"
---

NetFlow provides statistics on packets flowing through the router. It is primarily used for:
- Network and application monitoring
- Capacity planning
- Security analysis
- Traffic accounting
## Setup Overview

1. **Create a flow record** – defines the fields to match and collect  
2. **Configure a flow exporter** – specifies where to send flow data (e.g., collector IP/port)  
3. **Create a flow monitor** – ties the flow record and exporter together  
4. **Apply flow monitor to interface** – on ingress or egress  
5. **Verify locally** using `show flow monitor NAME cache`

## Configuration

#### 1. Create Flow Record

```
flow record v4_r1
 match ipv4 protocol
 match ipv4 source address
 match ipv4 destination address
 match transport source-port
 match transport destination-port
 collect counter bytes long
 collect counter packets long
```
#### 2. Configure Flow Exporter

```
flow exporter EXPORTER-1
 destination 10.100.2.120 [ vrf ... ]
 transport udp 2055
```
#### 3. Create Flow Monitor and Bind Record

```
flow monitor FLOW-MONITOR-1
 record v4_r1
 exporter EXPORTER-1
 cache timeout active 60
 cache timeout inactive 10
```

> `cache timeout active` -> This means **every 60 seconds**, the router exports ongoing flows.
> `cache timeout inactive` -> So if no more packets come through that flow in 15 seconds, it will export.
#### 4. Apply to Interface

```
interface Ethernet1/1
 ip flow monitor FLOW-MONITOR-1 { input | output }
```
#### 5. Verify Cache Locally

```
show flow monitor FLOW-MONITOR-1 cache format table
```

## Sampler

Flow samplers are created as separate components in a router’s configuration. Flow samplers are used to reduce the load on the device that is running Flexible NetFlow by limiting the number of packets that are selected for analysis.

Flow sampling exchanges monitoring accuracy for router performance. When you apply a sampler to a flow monitor, the overhead load on the router of running the flow monitor is reduced because the number of packets that the flow monitor must analyze is reduced. The reduction in the number of packets that are analyzed by the flow monitor causes a corresponding reduction in the accuracy of the information stored in the flow monitor’s cache.

Samplers are combined with flow monitors when they are applied to an interface with the ip flow monitor command.

```
sampler SAMPLER-1
	mode random 1 out-of { window-size }
interface Ethernet1/1
	ip flow monitor FLOW-MONITOR-1 sampler SAMPLER-1 input
```

```
show sampler SAMPLER-1
```

## Netflow Collector on Ubuntu

```
# Clone and build the container
git clone https://github.com/arktronic/docker-quick-elastic-netflow.git && \
cd docker-quick-elastic-netflow && \
./_build.sh && \

# Run the stack (Elasticsearch + Kibana + Filebeat NetFlow)
docker run \
  --init \
  --name quickelasticnetflow \
  -p 5601:5601 \
  -p 2055:2055/udp \
  -d localhost/arktronic/quick-elastic-netflow:latest
```

Then go to Discover, then filter by `filebreat-*` to see the Netflows collected.