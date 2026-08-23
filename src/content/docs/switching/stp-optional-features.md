---
title: "STP Optional Features"
description: "**PortFast** is an optional [[Spanning Tree Protocol (STP)]] feature that lets access ports bypass the usual STP states (Listening → Learning → Forwar"
---

## Topology Protection Features

### PortFast

**PortFast** is an optional [[Spanning Tree Protocol (STP)]] feature that lets access ports bypass the usual STP states (Listening → Learning → Forwarding) and immediately enter the **Forwarding** state. This is ideal for ports that connect directly to end devices (like PCs or printers), where there’s no risk of loops.

> NOTE: When a Portfast enabled port receives a BPDU, it operates as a normal STP port, without Portfast.

Use the following commands to enable PortFast on a specified interface:

```
(config)# interface FastEthernet0/1
(config-if)# spanning-tree portfast
```

> ⚠️ Use only on access ports connected to end devices.

Use the following command to configure PortFast for **all access ports** on the switch:

```
(config)# spanning-tree portfast default
```

In some cases (like connecting to servers that use trunking), you may want to enable PortFast on a **trunk port**:
```
(config)# interface GigabitEthernet0/1
(config-if)# switchport mode trunk
(config-if)# spanning-tree portfast trunk
```

### BPDU Guard

BPDU Guard **shuts down** a port **immediately** if it **receives a BPDU**.

If a PortFast-enabled port (which is supposed to connect to a host, not another switch) sees a BPDU, something is wrong, likely:

- Someone connected a switch or hub to the port
- Someone bridged two ports using a cable
- A misconfiguration exists in your topology

Instead of allowing a potential loop, BPDU Guard will **err-disable** the port as a precaution.

Use the following commands to configure BPDU Guard on a specified interface:

```
(config)# interface FastEthernet0/1
(config-if)# spanning-tree bpduguard enable
```

Use the following commands to configure BPDU Guard globally on **all PortFast-enabled interfaces**:

```
(config)# spanning-tree portfast bpduguard default
```

OPTIONAL: Use the following commands to setup auto recovery from errdiable for BPDU Guard:

```
(config)# errdisable recovery cause bpduguard
(config)# errdisable recovery interval 30
```

### Root Guard

When you place Root Guard on a port, you're saying:

> “I trust the current Root Bridge — I don’t want anything **on this port** trying to become root.”

If a switch connected to that port starts sending **superior BPDUs** (with a lower Bridge ID), the port is **put into Root-Inconsistent (broken)** state. Note that this port will recover automatically when superior BPDUs are no longer being received.

Root Guard is ideally used for:
- Downlinks (ports facing down at other switches (uplinks from their perspective))
- Designated Ports (downstream ports)

Use the following commands to configure Root Guard on a specified interface:

```
(config)# interface GigabitEthernet0/1
(config-if)# spanning-tree guard root
```

### BPDU Filter

There are **two modes** depending on how you configure it:

BPDU filter can be configured **globally** or on the **interface** **level,** and there’s a difference:

- **Global** (soft): Outbound BPDUs are filtered (not sent) on Portfast interfaces. Due to the global configuration mode (soft) it only applies to Portfast. Since BPDU FIlter soft mode still receives BPDUs, this will cause Portfast to disable itself and BPDU Filter, returning to default STP operation.
- **Interface** (hard): Outbound & Inbound BPDUs are filtered (not sent or received). This essentially disables spanning-tree. This type of BPDU Filter is highly dangerous.

 1. **Global BPDU Filter (Soft Mode)**

```
(config)# spanning-tree portfast bpdufilter default
```

2. **Per-Interface BPDU Filter (Hard Mode)**

```
(config)# interface FastEthernet0/1
(config-if)# spanning-tree bpdufilter enable
```

## Loop Protection Mechanisms

### UDLD

**Unidirectional Link Detection** is a mechanism for detecting duplex failures on links, commonly found on fiber cables. From a layer 1 perspective, fiber consists of a pair of strands, one for transmit, and one for receive. If one of these is broken, spanning-tree can get confused.

> This feature is Cisco proprietary.

UDLD must be configured on both sides of the link to operate.
This is because UDLD uses an echo mechanism, where it will send a message across the link, then the receiving devices takes it and throws it back to the sender. UDLD must be enabled on both sides for this operation can occur.

**Timers**
- Sends echo messages every **15 seconds by default**.
- The **holdtime is 3 times** the message time by default.

This totals to detecting an issue in 45 seconds.

UDLD has two modes of operation:
- **Normal**
	- Detect the issue.
	- Places the port into an "**undetermined**" state, continuing to forward traffic.
- **Aggressive**
	- Detect the issue. 
	- Sends 1 echo per second for 8 seconds.
	- Place the port into an **errdisabled** state, continuing to forward traffic.

To enable UDLD globally on all interfaces, use the following command:

```
(config) udld [enable | aggressive]
```

> Note that when you enable Aggressive mode globally, it only applies to Fiber interfaces.

To enable UDLD on an interface specifically, use the following command:

```
(config-if) udld port {aggressive}
```

To configure UDLDs custom recovery mechanism, use the following commands:

```
(config) udld recovery
(config) udld recovery interval [seconds]
```

### Loop Guard

While UDLD detects physical layer 1 issues, what if there is no layer 1 issue, but we are still seeing duplex issues (software issues)?

Normally, if a switch stops receiving BPDUs on a **blocking port**, it will wait the max age timer, then move to forwarding eventually, even if the link is still functional, but for some reason, is not getting BPDUs.

When an interface configured with **Loop Guard** is in a Blocking state stops receiving BPDUs, it will move the blocking port to a **loop-inconsistent** state instead of unblocking, until BPDUs are getting received again on the interface.

> Loop Guard is typically applied on ** Root & Alternate (Blocking)** ports.
> Loop Guard is **ignored** on designated (forwarding) ports.

Use the following commands to configure Loop guard on a specified interface:

```
(config)# interface GigabitEthernet0/2
(config-if)# spanning-tree guard loop
```

Use the following commands to configure Loop Guard **globally for all interfaces**:

```
(config)# spanning-tree loopguard default
```

### Bridge Assurance

This process actually changes how STP works, in that it will have a switch send its BPDUs upstream as well. This means that unlike in normal STP operation, inferior BPDUs will be flowing upstream in a point-to-point fashion (not getting flooded).

Interfaces with Bridge Assurance enabled (should only be point-to-point links between switches) will enter a nerrdisable state if BPDUs are no longer being received.

>Bridge Assurance is only supported on Rapid PVST+ [[Rapid Spanning-Tree Protocol (RSTP)]] and MST [[Multiple Spanning-Tree (MST)]].

```
(config)# spanning-tree mode [rapid-pvst | mst]
(config)# spanning-tree bridge assurance
! The above command enables Bridge Assurance on the bridge.

(config)# interface Ethernet1/1
(config-if)# spanning-tree portfast type network
```

## Resources

[Jeremy's IT Lab - Part 2](https://www.youtube.com/watch?v=nWpldCc8msY&t=2280s)
[Cisco Press STP Whitepaper](https://www.ciscopress.com/articles/article.asp?p=2832407&seqNum=4)
[INE Course - Switched Campus](https://my.ine.com/Networking/courses/3473abc7/switched-campus)