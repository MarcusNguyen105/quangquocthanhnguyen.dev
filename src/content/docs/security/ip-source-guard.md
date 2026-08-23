---
title: "IP Source Guard"
description: "IP Source Guard prevents IP address spoofing by dynamically filtering IP addresses on switch ports. It uses the DHCP snooping binding table to validat"
---

## Overview

IP Source Guard prevents IP address spoofing by dynamically filtering IP addresses on switch ports. It uses the DHCP snooping binding table to validate that hosts are using their legitimately assigned IP addresses.

**Key Functions:**

- Filters IP traffic based on DHCP snooping binding table
- Prevents hosts from using unauthorized IP addresses
- Can optionally validate MAC addresses when combined with port security

## Basic IP Address Filtering

```
ip dhcp snooping
ip dhcp snooping vlan 1

interface Ethernet1/2
 description Client-Port
 ip verify source
```

**Note:** DHCP snooping must be enabled as IP Source Guard relies on the DHCP snooping binding table for validation.

## Manual (without DHCP snooping)

```
(config)# ip source binding aa.bb.cc.dd.ee.ff vlan 10 192.168.1.10 interface g0/0
```

## How IP Source Guard Works

IP Source Guard creates dynamic access control entries based on the DHCP snooping binding table. Only traffic from IP addresses that match binding table entries is permitted on the interface.

**Validation Process:**

- Checks source IP of incoming packets
- Compares against DHCP snooping binding table entries
- Permits matching traffic, drops non-matching traffic

## IP and MAC Address Filtering

For enhanced security, combine IP Source Guard with port security to validate both IP and MAC addresses:

```
interface Ethernet1/2
 description Client-Port
 switchport port-security
 ip verify source port-security
```

**Requirements:**

- Port security must be enabled on the interface
- Both IP and MAC addresses are validated against binding table

## Verification

```
show ip verify source
show ip dhcp snooping binding
```