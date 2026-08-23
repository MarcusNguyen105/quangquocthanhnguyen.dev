---
title: "Datapath Packet Trace FIA Trace"
description: "The **Packet-Trace** feature provides insight into how packets are processed through the hardware and software data paths on Cisco platforms. It is a "
---


The **Packet-Trace** feature provides insight into how packets are processed through the hardware and software data paths on Cisco platforms. It is a powerful diagnostic tool that can be used in production environments without severely impacting performance.

Packet Trace allows inspection of packet handling using three levels of granularity:

## Packet-Trace Levels

| Level       | Description |
|-------------|-------------|
| **Accounting** | Lightweight and runs continuously. Provides a **count of packets** entering and leaving the network processor. Minimal impact on performance. |
| **Summary**    | Tracks **input/output interfaces**, packet state, and whether it was **punted, dropped, or injected**. Higher resource usage than accounting. Useful for identifying problem interfaces. |
| **Path data**  | Provides the **highest level of detail**, including timestamps, debug IDs, and feature-specific processing data. Optional enhancements include **packet-copy** and **Feature Invocation Array (FIA)** tracing. Highest performance impact and should be used with care. |

> Note: Path data collection is resource intensive. Use sparingly in live environments where performance is critical.

## Guidelines and Memory Considerations

- Use **ingress condition filters** to limit scope and avoid performance degradation.
- Packet trace consumes **data-plane memory**. The memory usage is estimated by:

```
memory required = statistics_overhead + number_of_packets * (summary_size + data_size + packet_copy_size)
```

## Configuration Steps

### Creating a Path Trace

```
c8000v-0# debug platform packet-trace ?
  copy        Copy packet data
  drop        Trace drops only
  inject      Trace injects only
  packet      Packet count
  punt        Trace punts only
  statistics  enable packet trace statistics
```

```
debug platform packet-trace packets 2048 fia-trace circular
```

> You can enable multiple types of data being collected, as seen above.

### Apply Match Conditions

You can limit the packet trace to specific interfaces or traffic flows.

**Example: Match on ingress interface**

```ios
debug platform condition interface g0/0/0 ingress
```

**Example: Match on source IP**

```ios
debug platform condition ipv4 192.168.1.1 ingress
```

> Combine multiple conditions to narrow down further.

### Start and Stop Packet Trace

```ios
debug platform condition start
...
debug platform condition stop
```

### View Packet Trace Data

```ios
show platform packet-trace configuration
show platform packet-trace statistics
show platform packet-trace summary
show platform packet-trace packet all
```

### Clear All Conditions

```ios
clear platform condition all
clear platform packet-trace configuration
```

## Example Workflow

```ios
debug platform packet-trace packets 100 fia-trace circular
debug platform packet-trace statistics
debug platform condition interface GigabitEthernet0/0/0 egress

show platform packet-trace configuration
show platform condition

debug platform condition start

...generate test traffic...

debug platform condition stop
show platform packet-trace summary
show platform packet-trace statistics
show platform packet-trace packet #

...cleanup when done...

clear platform condition all
clear platform packet-trace configuration
```

## Reference

[Cisco Packet Trace Configuration Guide](https://www.cisco.com/c/en/us/td/docs/routers/asr1000/software/configuration/xe-17/asr1000-sw-config-xe-17/packet_trace.html)
