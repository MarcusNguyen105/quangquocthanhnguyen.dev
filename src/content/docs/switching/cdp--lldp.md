---
title: "CDP LLDP"
description: "**CDP** is a Layer 2, media- and protocol-independent protocol used by Cisco devices to advertise and discover directly connected neighbors. It operat"
---

## Cisco Discovery Protocol (CDP)

**CDP** is a Layer 2, media- and protocol-independent protocol used by Cisco devices to advertise and discover directly connected neighbors. It operates over interfaces that support **SNAP headers** and is **enabled by default** on most Cisco platforms.

### Key Points

- Devices send **CDP advertisements** every **60 seconds** to the **multicast MAC address** `01:00:0C:CC:CC:CC`.
- Each advertisement includes a **Time-To-Live (TTL)** value, indicating how long the information should be retained.
- CDP **never forwards** packets beyond the local segment.
- CDP supports TLVs (Type-Length-Value structures) to carry various device information.
- CDP is Cisco proprietary. Use **LLDP** for multi-vendor environments.

## CDP Configuration

```none
! Enable CDP globally
cdp run

! Disable CDP on a specific interface
interface Ethernet1/1
  no cdp enable

! Adjust advertisement interval and hold time (in seconds)
cdp timer 5
cdp holdtime 10

! Disable version 2 advertisement extensions
no cdp advertise-v2

! Define a TLV filter group (use '?' to view available TLVs)
cdp tlv-list GROUP_1
  ?

! Apply TLV filter to restrict CDP advertisements
cdp filter-tlv-list GROUP_1

! Apply TLV filter to a specific interface
interface Ethernet1/1
  cdp filter-tlv-list GROUP_1
```

---

## Link Layer Discovery Protocol (LLDP)

**LLDP** is the **IEEE standard (802.1AB)** for Layer 2 device discovery. It functions similarly to CDP but is supported across **multi-vendor** environments. It also uses TLVs for information exchange.

### Key Points

- LLDP is not enabled by default on some platforms — you must enable it globally and per interface.
- LLDP advertisements include a TTL and are **multicast** locally on each supported interface.
- LLDP supports selective TLV advertisement using `tlv-select`.

## LLDP Configuration

```none
! Enable LLDP globally
lldp run

! Disable LLDP on a specific interface
interface Ethernet1/1
  no lldp enable

! Adjust advertisement interval and hold time (in seconds)
lldp timer 5
lldp holdtime 10

! View or restrict TLVs from being advertised
no lldp tlv-select ?

! Disable specific TLVs on an interface
interface Ethernet1/1
  no lldp tlv-select ?
```
