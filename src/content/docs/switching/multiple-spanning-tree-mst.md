---
title: "Multiple Spanning TREE MST"
description: "The most fundamental difference between **Multiple Spanning Tree (MST)** and **Common Spanning Tree Protocols (CSTP)** like 802.1D [[Spanning Tree Pro"
---


The most fundamental difference between **Multiple Spanning Tree (MST)** and **Common Spanning Tree Protocols (CSTP)** like 802.1D [[Spanning Tree Protocol (STP)]] or 802.1w [[Rapid Spanning-Tree Protocol (RSTP)]] is that **MST allows multiple VLANs to share a single spanning-tree instance**. This reduces resource usage and allows support beyond the traditional **128-instance limit** of PVST+.

## Introduction to MST

An **MST Instance (MSTI)** represents one logical spanning-tree topology — including root election, port roles, path costs, etc.

You can map **VLANs to MSTIs**, so instead of running one STP instance per VLAN (as with PVST+), MST allows you to group VLANs and run fewer STP processes overall.

> MST supports up to **66 MSTIs** per region.

When MST is enabled (`spanning-tree mode mst`), **all VLANs default to MSTI 0 (the IST)** until explicitly assigned to another instance.

> MST uses **long path cost** values by default.

---

### BPDU Flow in MST

Although MST uses **802.1w (RSTP)** [[Rapid Spanning-Tree Protocol (RSTP)]] internally, the **BPDU format** differs:

- In traditional STP/PVST+, a **BPDU is sent per VLAN** out a trunk.
- In MST, a **single untagged BPDU is sent per interface**, and it includes data for **all MSTIs** on that trunk.

---

## Basic MST Configuration

```none
spanning-tree mode mst

spanning-tree mst configuration
  name CCIE
  revision 1
  instance 10 vlan 1-5
  instance 20 vlan 6-10
exit

spanning-tree mst 10 priority 4094

spanning-tree mst hello-time 2
spanning-tree mst forward-time 15
spanning-tree mst max-age 20

interface Ethernet1/1
  spanning-tree mst 10 cost 100000
```

> ⚠️ MST configuration changes take effect **only after exiting** `spanning-tree mst configuration` mode.

- Timers apply **globally** to all MST instances.

---

## MST Regions and Attributes

Each MST **region** is defined by three **region attributes**:

- **Name**
- **Revision number**
- **VLAN-to-Instance mappings**

These are hashed into a **digest**, which is carried in BPDUs. Devices with matching digests are considered in the same MST region.

> MST regions enable hierarchical STP domains. Different MST or CST domains are treated as **external** to one another.

When a BPDU is received from a device in a **different region**, the port becomes a **boundary port**.

---

## MST and STP Compatibility

### MST + CST (802.1D or 802.1w)

CST (Common Spanning Tree) is the term for legacy STP modes with a **single spanning-tree instance**.

MST is backward-compatible with CST via **MST Instance 0 (MST0)**, also called the **IST (Internal Spanning Tree)**.

- MST0 **represents the whole region** to external CST domains.
- MST sends **MST0 BPDUs** out boundary ports to communicate as if it were a single CST switch.

This design lets MST plug into an RSTP/PVST+ domain **without breaking topology**.

> MST0 = IST (Industry term), MST0 (Cisco term)

#### Master Ports in MST

If a **superior BPDU** is received on a **boundary root port**, that port becomes a **Master Port**. All other MSTIs are forced to **forward** on that port to maintain loop-free convergence.

---

### MST vs PVST+/Rapid-PVST+

Since PVST+ runs **one STP per VLAN**, and MST uses **shared topologies per instance**, the topologies don't align directly.

To ensure compatibility, MST uses a feature called **PVST Simulation**, which:

- Sends one **BPDU per VLAN** with **IST (MST0)** information.
- Can be enabled **globally or per-interface**.

```none
spanning-tree mst simulate pvst global
interface Ethernet1/1
  spanning-tree mst simulate pvst
```

> If **PVST simulation is disabled** and a BPDU is received on that interface, it will enter the **STP-inconsistent (blocking)** state.

---

## PVST+ Compatibility Caveat

An MST boundary port will enter **STP_Inconsistent** if:

- The boundary port is **designated** and receives a **superior BPDU** from PVST+.
- The boundary port is **root** and receives an **inferior BPDU** compared to **VLAN 1**.

This commonly happens when **VLAN root priorities differ** slightly.

> Best practice: ensure **VLAN 1 has the lowest priority** in PVST+ to avoid STP inconsistency on MST boundaries.


### Correct PVST+ Interop Configuration

Ensure MST0 connects to a PVST+ domain where:

- **All PVST VLAN roots have higher priority values than VLAN 1.**
- MST0 ports receive **superior BPDUs only from VLAN 1**.

Example:

```none
MST-IST# show running-config interface g0/0
interface GigabitEthernet0/0
 switchport trunk allowed vlan 1-5
 switchport trunk encapsulation dot1q
 switchport trunk native vlan 100
 switchport mode trunk
 switchport nonegotiate
 negotiation auto

RSTP-1-5# show running-config interface g0/0
interface GigabitEthernet0/0
 switchport trunk allowed vlan 1-5
 switchport trunk encapsulation dot1q
 switchport trunk native vlan 100
 switchport mode trunk
 switchport nonegotiate
 negotiation auto
```

```none
MST-IST# show spanning-tree bridge
                                                   Hello  Max  Fwd
MST Instance                 Bridge ID              Time  Age  Dly  Protocol
---------------- --------------------------------- -----  ---  ---  --------
MST0             32768 (32768,   0) 5254.008d.40a5    2    20   15  mstp 

RSTP-1-5# show spanning-tree bridge
                                                   Hello  Max  Fwd
VLAN                         Bridge ID              Time  Age  Dly  Protocol
---------------- --------------------------------- -----  ---  ---  --------
VLAN0001          4097 ( 4096,   1) 5254.00a8.57cd    2    20   15  rstp        
VLAN0002             2 (    0,   2) 5254.00a8.57cd    2    20   15  rstp        
VLAN0003             3 (    0,   3) 5254.00a8.57cd    2    20   15  rstp        
VLAN0004             4 (    0,   4) 5254.00a8.57cd    2    20   15  rstp        
VLAN0005             5 (    0,   5) 5254.00a8.57cd    2    20   15  rstp
```

[CBT Nuggets - STP Compatibility Tutorial](https://learn.adept.at/cbtnuggets/layer-2-ccie-training-vlan-etherchannel-stp-tutorial/skill/configure-stp-compatibility#component-9d7c5)
