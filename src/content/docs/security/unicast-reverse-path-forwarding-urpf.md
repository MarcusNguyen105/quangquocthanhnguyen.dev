---
title: "Unicast Reverse PATH Forwarding URPF"
description: "Normally when your router receives unicast IP packets, it only cares about one thing:"
---


Normally when your router receives unicast IP packets, it only cares about one thing:

> What is the destination IP address of this IP packet so I can forward it?

If the IP packet has to be routed it will check the routing table for the destination IP address, select the correct interface and it will be forwarded. Your router really doesn’t care about source IP addresses as it’s not important for forwarding decisions.

Because the router doesn’t check the source IP address it is possible for attackers to spoof the source IP address and send packets that normally might have been dropped by the firewall or an access-list.

## Overview

uRPF is a security feature that prevents these spoofing attacks. Whenever your router receives an IP packet it will check if it has a **matching entry in the routing table for the source IP address**. If it doesn’t match, the packet will be discarded. uRPF has two modes:

- **Strict mode**
- **Loose mode**

## Strict Mode

Strict mode means that that router will perform **two checks** for all incoming packets on a certain interface:

- Do I have a matching entry for the source in the **routing table**?
- Do I use the **same interface to reach this source** as where I received this packet?

When the incoming IP packets **pass both checks**, it will be permitted. Otherwise, it will be dropped. This is perfectly fine for  IGP routing protocols since they use the shortest path to the source of IP packets. The interface that you use to reach the source will be the same as the interface where you will receive the packets on.

```
ip cef distributed
interface Ethernet1/1
 ip verify unicast source reachable-viw rx
```
## Loose Mode

Loose mode means that the router will perform only a **single check** when it receives an IP packet on an interface:

- Do I have a matching entry for the source in the **routing table**?

When it passed this check, the packet is permitted. Whether we use this interface to reach the source or not doesn’t matter. Loose mode is useful when you are connected to more than one ISP, and you use **asymmetric routing**. The only exception is the null0 interface, if you have any sources with the null0 interface as the outgoing interface, then the packets will be dropped.

```
ip cef distributed
interface Ethernet1/1
 ip verify unicast source reachable-viw any
```