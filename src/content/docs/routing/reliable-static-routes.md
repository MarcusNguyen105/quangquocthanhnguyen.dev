---
title: "Reliable Static Routes"
description: "Reliable static routing combines traditional static routes with IP SLA tracking to provide automatic failover when paths become unavailable. While sta"
---

## Overview

Reliable static routing combines traditional static routes with IP SLA tracking to provide automatic failover when paths become unavailable. While standard static routes remain in the routing table regardless of next-hop reachability, reliable static routes are dynamically removed when the tracked object fails.

**Standard Static Route:** Always present in routing table, even if next-hop is unreachable **Reliable Static Route:** Automatically removed from routing table when tracking fails

This provides the simplicity of static routing with automatic failover capabilities similar to dynamic routing protocols.

## How Reliable Static Routing Works

The process involves three components working together:

1. **IP SLA Operation:** Monitors reachability to a target (typically ICMP echo)
2. **Tracking Object:** Links IP SLA results to routing decisions
3. **Static Route:** References the tracking object for conditional installation

**Operation Flow:**

- IP SLA continuously monitors target reachability
- Tracking object reflects IP SLA state (up/down)
- Static route is installed only when tracking object is up
- Route automatically removed when tracking object goes down

## Basic Configuration

```
ip sla 1
 icmp-echo 203.0.113.1 source-interface GigabitEthernet0/1
 frequency 5
 timeout 3000
 threshold 2000
ip sla schedule 1 life forever start-time now

track 1 ip sla 1 reachability
 delay down 1 up 5

ip route 0.0.0.0 0.0.0.0 203.0.113.1 track 1
ip route 0.0.0.0 0.0.0.0 198.51.100.1 10
```

**Configuration Breakdown:**

**IP SLA Operation**

- `icmp-echo 203.0.113.1` - Target to monitor (typically ISP gateway)
- `source-interface` - Ensures ICMP originates from correct interface
- `frequency 5` - Test every 5 seconds
- `timeout 3000` - Wait 3 seconds for response
- `threshold 2000` - Consider response slow if over 2 seconds *does not do anything*

**Tracking Object**

- `track 1 ip sla 1 reachability` - Links tracking to SLA operation
- `delay down 1` - Wait 1 second before declaring down
- `delay up 5` - Wait 5 seconds before declaring up

**Static Routes:**

- Primary route with `track 1` - Removed when tracking fails
- Backup route with AD 10 - Takes over when primary removed

### Administrative Distance

Use consistent AD values to ensure predictable failover:

- Tracked routes: Default AD (1)
- Primary backup: AD 5-10
- Emergency backup: AD 15-20

## Verification Commands

```
show ip sla statistics
show ip sla configuration
show track
show track brief
show ip route track-table
show ip route static
debug ip routing
debug track
```
