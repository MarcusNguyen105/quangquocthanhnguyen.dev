---
title: "Virtual LAN VLAN"
description: "When you create a VLAN, it gets added to either:"
---


## VLAN Creation

When you create a VLAN, it gets added to either:
- the **VLAN database** (`vlan.dat` in bootflash)
- or the **running-config** (for extended VLANs)

### Normal VLANs (1–1005)
- Stored in `vlan.dat`
- Not saved in `running-config`
- Persist through reload if `vlan.dat` is present

### Extended VLANs (1006–4094)
- Stored in `running-config`
- Saved to **NVRAM** on `write mem`
- Used for **internal VLANs**, routed ports, etc.

```none
(config)# vlan 10
```

### What Happens Internally?

When a VLAN is created, the switch instantiates:
- A [[Spanning Tree Protocol (STP)]] instance.
- An entry in the [[MAC Address Table]].

You can verify with:
```none
show spanning-tree vlan 10
show mac address-table vlan 10
```

---
## Access vs Trunk Ports

### Access Ports

```none
interface FastEthernet1/0/2
  switchport mode access
  switchport access vlan 30
```

- Forwards only VLAN 30
- Drops all tagged traffic (except [[CDP & LLDP]])
- Can use voice VLAN if configured

### Trunk Ports

```none
interface GigabitEthernet1/0/24
  switchport trunk encapsulation dot1q
  switchport mode trunk
  switchport trunk native vlan 99
  switchport trunk allowed vlan 1-50
```

- Carries **multiple VLANs**
- Tags all VLANs **except** the **native VLAN** (in this case, 99)
	- When untagged traffic is received on a trunk port, it is considered to be a part of the native VLAN (defaults to 1).
- Ideal for switch uplinks and routed links

**Tune trunks with the following:**

```

interface GigabitEthernet1/0/24
  switchport trunk allowed vlan allowed 1-50
  switchport trunk allowed vlan remove 1-5
  switchport trunk allowed vlan add 1-5
```

---

## Internal VLANs

If you apply `no switchport` on a Layer 2 interface, the switch **allocates an internal VLAN** behind the scenes. This is required to bind Layer 3 interfaces to the switching backend.

```none
interface Ethernet1/1
  no switchport
```

This **allocates a VLAN** from the **extended range (1006–4094)**.

By default, internal VLANs are assigned **in ascending order** starting at **1006**, but you can reverse it:

```none
vlan internal allocation policy descending
```

**Verify with:**

```none
show running-config | include internal
show vlan internal usage

VLAN Usage
---- --------------------
1006 GigabitEthernet0/0
4094 GigabitEthernet0/1
```

> Note: In this example, `descending` mode was applied after some internal VLANs were already allocated, which is why you see both high and low VLANs being used.

---

## Voice VLANs

Voice VLANs help IP phones (like Cisco VoIP phones) get placed into the correct VLAN using **CDP** advertisements. These phones often have built-in switches, allowing a PC to daisy-chain through them.

There are multiple ways to design this, depending on how **voice and data** traffic should behave.

### Option 1: Voice and Data on Same VLAN

```none
interface FastEthernet1/0/1
  switchport mode access
  switchport access vlan 10
```

Everything (PC + phone) goes on VLAN 10 — no voice isolation or QoS differentiation.

---

### Option 2: Separate Voice and Data VLANs

```none
interface FastEthernet1/0/1
  switchport mode access
  switchport access vlan 10
  switchport voice vlan 20
```

- PC is untagged on VLAN 10
- Phone tags voice frames as VLAN 20

Clean separation, better for QoS and security.

---

### Option 3: Same VLAN, But QoS via Dot1p

Let’s say you want PC and phone on the same VLAN but **still prioritize voice** traffic.

```none
interface FastEthernet1/0/1
  switchport mode access
  switchport access vlan 10
  switchport voice vlan dot1p
```

In this case:
- PC sends **untagged** frames on VLAN 10
- Phone sends **tagged frames** with VLAN ID **0**, but with CoS = 5
- Switch reclassifies VLAN 0 → VLAN 10 internally, but **preserves QoS**

---
## Commands Reference

| Action                             | Command                                                   |
| ---------------------------------- | --------------------------------------------------------- |
| Create VLAN                        | `vlan [ID]`                                               |
| Assign VLAN to Access Port         | `switchport access vlan [ID]`                             |
| Enable Voice VLAN                  | `switchport voice vlan [ID]`                              |
| Enable Dot1p Voice                 | `switchport voice vlan dot1p`                             |
| Set Internal VLAN Allocation Order | `vlan internal allocation policy [ascending\|descending]` |
| Make Port Routed                   | `no switchport`                                           |
| Show Internal VLAN Usage           | `show vlan internal usage`                                |
| Show VLAN Config                   | `show vlan brief`                                         |

