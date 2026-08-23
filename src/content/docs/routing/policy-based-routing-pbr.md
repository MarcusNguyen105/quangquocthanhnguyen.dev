---
title: "Policy Based Routing PBR"
description: "Policy-Based Routing (PBR) allows forwarding decisions to be based on criteria other than destination IP address. While normal IP routing uses destina"
---

## Overview

Policy-Based Routing (PBR) allows forwarding decisions to be based on criteria other than destination IP address. While normal IP routing uses destination-based forwarding with longest match lookup, PBR enables routing decisions based on source, destination, protocol type, or incoming interface.

**Normal IP Routing**

- Find the longest match to destination in routing table
- Route the packet towards the next-hop

**Policy-Based Routing**

- Route based on defined policies and criteria
- Override normal routing table decisions when policies match

## How PBR Works

PBR uses route-maps to define traffic criteria and actions:

**Route-Map Logic**

- **Permit:** Apply policy routing to matching traffic
- **Deny:** Use normal destination-based forwarding for matching traffic

**Traffic Criteria:** Most commonly matched using access lists, but can also match on:

- Packet length
- Source interface
- Destination interface

## Interface Application

PBR should be applied on the **ingress interface** where the intended traffic is being received. This allows the router to make policy decisions before normal routing table lookup occurs.

**Why Ingress Application:**

- PBR processes packets as they enter an interface
- Allows policy decisions before normal routing table lookup
- More efficient than applying on multiple egress interfaces
- Catches traffic at the entry point for consistent policy enforcement

## Configuration Example

```
ip access-list extended ICMP_TRAFFIC
 permit icmp 192.168.1.0 0.0.0.255 host 8.8.8.8

route-map PBR-ICMP permit 10
 match ip address ICMP_TRAFFIC
 set ip next-hop 10.0.0.6

route-map PBR-ICMP permit 20
 ! Deny statement - all other traffic uses normal routing

interface Ethernet0/0
 description LAN-Interface-Ingress
 ip policy route-map PBR-ICMP
```

**Configuration Breakdown:**

- **Access List:** Defines ICMP traffic from 192.168.1.0/24 to 8.8.8.8
- **Route-Map Permit 10:** Matches the ACL and sets specific next-hop
- **Route-Map Permit 20:** Empty permit acts as deny - normal routing for other traffic
- **Interface Application:** Applied to ingress interface where LAN traffic enters

## Optional Default Next-Hop

The `set ip default next-hop` command modifies PBR behavior to check the routing table first before applying the policy route:

- **Standard PBR:** `set ip next-hop` - Forces traffic through specified next-hop regardless of routing table
- **Default PBR:** `set ip default next-hop` - Uses routing table first, only applies PBR if no route exists

```
route-map PBR-DEFAULT permit 10
 match ip address BACKUP_TRAFFIC
 set ip default next-hop 10.0.0.100
```

**How Default Next-Hop Works**

1. Router checks routing table for destination
2. If route exists in RIB, uses normal routing
3. If no route exists in RIB, uses PBR next-hop
4. Provides backup routing when normal paths fail

## Local PBR

For router-generated traffic (such as management, SNMP, or syslog), use local PBR:

```
ip local policy route-map PBR-LOCAL
```

This applies PBR to traffic originated by the router itself rather than transit traffic.

## Verification Commands

```
show ip policy
show route-map
show ip local policy
debug ip policy
show ip route policy
```