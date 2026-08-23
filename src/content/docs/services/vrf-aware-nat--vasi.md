---
title: "VRF Aware NAT VASI"
description: "**VRF-Aware NAT** is used to allow traffic from a VRF (usually a customer or internal VRF) to be translated **before** it enters the global routing ta"
---

## VRF-Aware NAT

**VRF-Aware NAT** is used to allow traffic from a VRF (usually a customer or internal VRF) to be translated **before** it enters the global routing table.

Why? Because:

- Traffic leaving a VRF **must be NATed first**, or else the global routing table won’t know how to route it (since VRF routes are isolated).
- When return traffic comes back, the NAT process reverses the translation **before** it re-enters the VRF — so it doesn’t get dropped in the global VRF due to a missing route.

This creates a clean edge between the **VRF** and the **global routing table**, using NAT as a handoff between them.

> This NAT method **requires** the configuration of a route that points to an IP address that is not locally on itself. For NATing between VRFs without this limitation, use VASI if on IOS-XE.

### Key Concepts

- The **VRF has no direct routing knowledge** of global, and vice versa.
- A static route using the `global` keyword allows VRF traffic to **exit** toward the global next-hop.
- NAT ensures return traffic is **translated back into the originating VRF** before routing decisions are made globally (dropping the traffic).

### Configurations

```none
interface GigabitEthernet0/0
 description To-WAN
 ip address 10.0.0.2 255.255.255.252
 ip nat outside

interface GigabitEthernet0/1
 description To-LAN
 ip address 192.168.1.1 255.255.255.0
 vrf forwarding INSIDE
 ip nat inside
```

```none
vrf definition INSIDE
 rd 1:1
 address-family ipv4
```

```none
ip route 0.0.0.0 0.0.0.0 10.0.0.1

ip route vrf INSIDE 0.0.0.0 0.0.0.0 10.0.0.1 global
```

> The `global` keyword enables traffic from the VRF to exit into the global space, assuming NAT occurs before it crosses the boundary. Without the following NAT configs, a ping could get out, but could not return, since you cannot have a route from Global pointing to a VRF.

```none
access-list 1 permit 192.168.1.0 0.0.0.255

ip nat inside source list 1 interface g0/0 vrf INSIDE overload
```

Explanation:

- Traffic from `192.168.1.0/24` (inside the VRF) gets **NATed** using the **outside interface IP** (`g0/0`).
- NAT happens **within the context of the `INSIDE` VRF**, ensuring translation occurs BEFORE hitting the global routing table.
- Return traffic from the WAN will be translated **back into the VRF** BEFORE forwarding decisions are made by the Global VRF.

## VRF-Aware Software Infrastructure (VASI)

[VASI Cisco IOS-XE Whitepaper](https://www.cisco.com/c/en/us/support/docs/ip/network-address-translation-nat/200255-Configure-VRF-Aware-Software-Infrastruct.html)

On **Cisco IOS XE**, classical inter-VRF NAT is **not directly supported**. To perform NAT between VRFs, Cisco introduced **VASI**: *VRF-Aware Software Infrastructure*.

### What is VASI?

VASI is a technique that enables **inter-VRF NAT** by creating **VASI interface pairs**:
- Each **VASI interface** is tied to a **different VRF**
- One is used as the **inside NAT** interface, the other as **outside**
- Packets are routed between them just like physical interfaces
- Example interface names: `vasileft1`, `vasiright1`

VASI interfaces act as **loopback-style virtual links**, switching packets between two VRFs at Layer 3.

> VASI is the supported method to implement inter-VRF NAT on IOS XE.

### Configuration

In this example, we are NATing from **VRF_LEFT** to **VRF_RIGHT** only.

![[VASI-CML.png]]

#### **NAT on `vasiright`**

**Typical use case.**

Most common scenario: the WAN or upstream-facing interface is part of **VRF_RIGHT**.

- **Vasiright1** (in VRF_RIGHT) is the **NAT inside**
- **GigabitEthernet2** (WAN-facing) is the **NAT outside**

```none
interface GigabitEthernet1
 vrf forwarding VRF_LEFT
 ip address 192.168.1.2 255.255.255.0

interface GigabitEthernet2
 vrf forwarding VRF_RIGHT
 ip address 172.16.1.2 255.255.255.0
 ip nat outside
```

```
vrf definition VRF_LEFT
 rd 1:1
 address-family ipv4
 
vrf definition VRF_RIGHT
 rd 2:2
 address-family ipv4
```

```
interface vasileft1
 vrf forwarding VRF_LEFT
 ip address 10.1.1.1 255.255.255.252

interface vasiright1
 vrf forwarding VRF_RIGHT
 ip address 10.1.1.2 255.255.255.252
 ip nat inside
```

```
access-list 1 permit any

ip route vrf VRF_LEFT 172.16.0.0 255.255.0.0 vasileft1 10.1.1.2
ip route vrf VRF_RIGHT 192.168.0.0 255.255.0.0 vasiright1 10.1.1.1

ip nat inside source list 1 interface GigabitEthernet2 vrf VRF_RIGHT overload
```

#### **NAT on `vasileft`**

In some designs, NAT is done **entirely within VRF_LEFT**, before sending traffic into VRF_RIGHT.

- **GigabitEthernet1** (LAN-facing) is the **NAT inside**
- **Vasileft1** (link to VRF_RIGHT) is the **NAT outside**

```none
interface GigabitEthernet1
 vrf forwarding VRF_LEFT
 ip address 192.168.1.2 255.255.255.0
 ip nat inside

interface GigabitEthernet2
 vrf forwarding VRF_RIGHT
 ip address 172.16.1.2 255.255.255.0

interface vasileft1
 vrf forwarding VRF_LEFT
 ip address 10.1.1.1 255.255.255.252
 ip nat outside

interface vasiright1
 vrf forwarding VRF_RIGHT
 ip address 10.1.1.2 255.255.255.252

access-list 1 permit any

ip route vrf VRF_LEFT 172.16.0.0 255.255.0.0 vasileft1 10.1.1.2
ip route vrf VRF_RIGHT 192.168.0.0 255.255.0.0 vasiright1 10.1.1.1

ip nat inside source list 1 interface vasileft1 vrf VRF_LEFT overload
```