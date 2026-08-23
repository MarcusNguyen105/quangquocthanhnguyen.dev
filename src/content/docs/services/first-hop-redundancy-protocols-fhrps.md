---
title: "First HOP Redundancy Protocols FHRPS"
description: "This document outlines a collection of **First Hop Redundancy Protocols (FHRPs)** designed to provide seamless default gateway failover for end hosts."
---


This document outlines a collection of **First Hop Redundancy Protocols (FHRPs)** designed to provide seamless default gateway failover for end hosts. These protocols operate by sharing a **virtual IP and MAC address** between routers on the same subnet. With the aid of **gratuitous ARP**, failover occurs quickly and transparently to clients.

---

## FHRP Comparison Table

| Feature             | HSRP                         | VRRP                         |
| ------------------- | ---------------------------- | ---------------------------- |
| Standard            | Cisco proprietary / RFC 2281 | Industry standard / RFC 3768 |
| Terminology         | Active / Standby             | Master / Backup              |
| Priority Range      | 0–255 (default: 100)         | 0–255 (default: 100)         |
| Preemption          | Optional                     | Enabled by default           |
| Timers (hello/hold) | 3s / 10s (default)           | 1s / 3s (default)            |
| Multicast Group     | 224.0.0.2                    | 224.0.0.18                   |
| Transport           | UDP port 1985                | IP Protocol 112              |
| Authentication      | Clear Text / MD5             | Clear Text / MD5             |
| Virtual MAC         | `0000.0c07.acXX`             | `0000.5E00.01XX`             |

---

## HSRP (Hot Standby Router Protocol)

- **Cisco proprietary**, also documented in RFC 2281.
- Uses **active/standby** roles.
- The router with the highest priority becomes **active**. In the event of a tie, the router with the highest IP address wins.
- **Preemption** must be manually enabled.
- Operates using **UDP multicast** to `224.0.0.2`, port `1985`.
- Virtual MAC format: `0000.0c07.acXX` (where `XX` = group ID in hex).
- Supports **Clear Text** and **MD5** authentication.

### Basic HSRP Configuration

```
interface Ethernet1/1
  ip address 192.168.1.10 255.255.255.0
  standby 0 ip 192.168.1.1
  standby 0 priority 110
  standby 0 preempt
  standby 0 timers 5 15
```

> `standby 0 timers 5 15`: 5s hello, 15s hold time.

### HSRP Additional Configs

**Delays and BFD**

```
interface Ethernet1/1
	standby 0 preempt delay minimum 10
	standby delay minimum 30 reload 60
	bfd interval 250 min_rx 250 multiplier 4
```

> `standby delay minimum 30 reload 60` configures the delay period before the initialization of HSRP groups, where `minimum` is after a link comes up, and `reload` is after a device reboot.

> `standby 1 preempt delay minimum 380` determines the amount of seconds a group will wait before initiating preemption. Default is immediately.

**Basic Tracking**

[[IP Service Level Agreement (SLA) & Enhanced Object Tracking (EOT)]]

```
track 100 interface GigabitEthernet 0/0/0 { line-protocol | ip routing }
interface Ethernet1/1
	standby 0 track 100 [ decrement 20 | shutdown ]
```
### HSRP Authentication

**MD5 key-chain:**

```
key chain HSRP1
  key 1
    key-string cisco1234

interface Ethernet1/1
  standby 0 authentication md5 key-chain HSRP1
```

**MD5 key-chain:**

```
interface Ethernet1/1
  standby 0 authentication md5 key-string HSRP1
```

**Plain-text authentication:**

```
interface Ethernet1/1
  standby 0 authentication text cisco1234
```

### HSRP with Object Tracking

[[IP Service Level Agreement (SLA) & Enhanced Object Tracking (EOT)]]

```
ip sla 1
  icmp-echo 10.0.0.1
ip sla schedule 1 start-time now life forever
track 1 ip sla 1

interface Ethernet1/1
  standby 0 track 1 decrement 255
```

---

### HSRPv2 Enhancements

- Supports **more groups per interface**.
- Uses dedicated multicast address: `224.0.0.102`.
- Supports **IPv6**.

```
interface Ethernet1/1
  standby version 2
```

---

## VRRP (Virtual Router Redundancy Protocol)

- Defined in **RFC 3768**, vendor-neutral standard.
- Uses **master/backup** roles.
- Priority-based master election:
  - Higher priority wins; tie-breaker = highest IP address.
  - **Preemptive** behavior is **enabled by default**.
- Uses **IP protocol 112** over multicast `224.0.0.18`.
- Virtual MAC: `0000.5E00.01XX` (where `XX` = group ID in hex).
- Supports **Clear Text** and **MD5** authentication.

> Most configurations copy over from HSR, but with `vrrp` instead of `standby`.

### Priority Behavior

- Valid priority range: **1–254**
- Default: **100**

**255 is reserved** for a special case:
If a router is configured with the **interface IP address as the virtual IP (VIP)**, it **must always be the master**. In this case, VRRP **automatically sets the priority to 255**, and no other router is allowed to override it, not even with a higher manual priority.

This makes sense, because that router is **literally** the owner of the IP and can't have another box claim it.

| Priority Value | Meaning                                                 |
| -------------- | ------------------------------------------------------- |
| 1–254          | Normal configured range (higher wins)                   |
| 255            | **Reserved** — used when a router owns the VIP directly |
| 0              | Resign — causes the router to stop being master         |

### Basic VRRP Configuration

```
interface Ethernet1/1
  ip address 192.168.1.10 255.255.255.0
  vrrp 1 ip 192.168.1.1
  vrrp 1 priority 110
  vrrp 1 preempt
```

### VRRP-Specific Timer Configuration

```
interface Ethernet1/1
  vrrp 1 timers advertise 3
  vrrp 1 timers learn
```

---

### VRRPv3 Enhancements

- Adds **IPv6 support** and protocol extensibility.
- Enable globally with:

```bash
fhrp version vrrp v3
```
