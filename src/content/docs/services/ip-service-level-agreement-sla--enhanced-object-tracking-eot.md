---
title: "IP Service Level Agreement SLA Enhanced Object Tracking EOT"
description: "Cisco routers can dynamically react to changing network conditions using **IP SLA** and **Object Tracking**. These features are often used to influenc"
---

Cisco routers can dynamically react to changing network conditions using **IP SLA** and **Object Tracking**. These features are often used to influence **HSRP priorities**, **static routes**, or **routing protocol failover**.

## Basic Object Tracking

### Interface State Tracking

This monitors whether an interface is up at **Layer 1 (line-protocol)** or **Layer 3 (IP routing)**.

```none
track 100 interface GigabitEthernet0/0/0 line-protocol
```

**Use Case:** HSRP will **decrement priority** if the interface goes down.

```none
standby 1 track 100 decrement 10
```

If this tracked interface goes down, the HSRP group will reduce its priority, which may cause it to lose active status — allowing the standby router to take over.

### IP Routing Capability Tracking

This tracks if the interface has a working **IP routing path**, not just a physical link.

```none
track 101 interface GigabitEthernet0/0/0 ip routing
```

**Use Case:** Interface might be physically up, but not routing (e.g., downstream device failure). HSRP can still react based on IP reachability.

### Static Route Reachability Tracking

This tracks the presence of a route in the RIB (routing table).

```none
track 110 ip route 10.10.10.0/24 reachability
```

**Use Case:** If a static route disappears, HSRP will reduce priority, or a tracked static route will be withdrawn entirely.

## IP SLA Integration with Tracking

**IP SLA** generates synthetic probes (ping, TCP, UDP) to verify real-time availability of a remote destination.

### Example: ICMP Echo with Static Route Tracking

```none
ip sla 1
 icmp-echo 8.8.8.8 source-ip 10.100.2.59
 frequency 5
 timeout 6000

ip sla schedule 1 start-time now life forever
```

Tie to tracking:

```none
track 1 ip sla 1

ip route 0.0.0.0 0.0.0.0 10.100.2.1 track 1
```

**Use Case:** If the router cannot reach 8.8.8.8, the static route to 10.100.2.1 is removed — preventing black-hole routing and enabling failover to a backup path.

### Example: TCP/UDP Port Availability Between Routers

#### R2 – Initiator

```none
ip sla 2
 tcp-connect 10.100.1.1 80 source-ip 192.168.1.25 control disable
ip sla schedule 2 start-time now life forever
```

```none
ip sla 3
 udp-connect 10.100.1.1 80 source-ip 192.168.1.25 control disable
ip sla schedule 3 start-time now life forever
```

#### R1 – Responder

```none
ip sla responder tcp-connect ip 10.100.2.1 port 80
ip sla responder udp-echo ip 10.100.2.1 port 80
```

**Use Case:** Track port-level availability of a remote server (e.g., web service). If the service fails, you can withdraw routes or reduce HSRP priority.

## Enhanced Object Tracking (Track Lists)

Track lists allow evaluating multiple objects together, providing more robust failure logic.

### Boolean Tracking (AND, OR, NOT)

```none
track 10 list boolean and
 object 1
 object 2 not
 delay up 10 down 20
```

**Use Case with HSRP:**

```none
standby 1 track 10 decrement 20
```

HSRP priority is reduced only if **object 1 is down and object 2 is up**. This allows refined failover logic — e.g., only fail if a primary path fails but a backup stays up.

### Threshold Tracking – Weight

Objects contribute weighted values. The combined weight is compared against thresholds.

```none
track 20 list threshold weight
 object 1 weight 60
 object 2 weight 40
 threshold weight up 70 down 30
 delay up 5 down 10
```

**Use Case with Static Route:**

```none
ip route 0.0.0.0 0.0.0.0 10.100.2.1 track 20
```

- Route remains up if total object weight is ≥ 70  
- Route is withdrawn if total drops below 30

This provides a **graded failover** strategy — useful when monitoring different link types (e.g., MPLS and Broadband).

### Threshold Tracking – Percentage

Objects are equally weighted; the logic uses percentage of **how many are up**.

```none
track 30 list threshold percentage
 object 1
 object 2
 object 3
 threshold percentage up 100 down 50
 delay up 5 down 5
```

**Use Case with HSRP:**

```none
standby 1 track 30 decrement 15
```

- HSRP priority is reduced if fewer than 50% of monitored services are up  
- All must be up to restore full status

## HSRP Application – Complete Examples

### Interface-Based HSRP Failover

```none
track 100 interface GigabitEthernet1/0/0 ip routing

interface GigabitEthernet0/0/0
 ip address 10.1.0.21 255.255.0.0
 standby 1 preempt
 standby 1 ip 10.1.0.1
 standby 1 priority 110
 standby 1 track 100 decrement 10
```

**Use Case:** Fail HSRP over if routing is lost on the upstream interface.

### Route-Based HSRP Failover

```none
track 100 ip route 10.2.2.0/24 reachability

interface GigabitEthernet0/0/0
 ip address 10.1.1.21 255.255.255.0
 standby 1 preempt
 standby 1 ip 10.1.1.1
 standby 1 priority 110
 standby 1 track 100 decrement 10
```

**Use Case:** Fail HSRP if a **remote site route** is lost due to upstream failure — even if local interfaces are still up.

