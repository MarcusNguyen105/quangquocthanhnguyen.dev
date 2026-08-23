---
title: "Dynamic ARP Inspection DAI"
description: "Dynamic ARP Inspection (DAI) prevents ARP poisoning attacks by inspecting ARP requests and responses on untrusted ports. It validates ARP messages aga"
---

## Overview

Dynamic ARP Inspection (DAI) prevents ARP poisoning attacks by inspecting ARP requests and responses on untrusted ports. It validates ARP messages against the DHCP snooping binding table to ensure legitimate IP-to-MAC mappings.

For more info on DHCP Snooping, visit [[DHCP Snooping & Option 82]].

**Key Functions**

- Filters ARP messages received on untrusted ports
- Validates sender MAC and IP fields against DHCP snooping binding table
- Drops ARP messages without matching binding table entries

All ports are untrusted by default. Interfaces connected to switches or routers should be trusted, while end host ports should remain untrusted.

## Basic Configuration

```
ip arp inspection vlan 1

interface Ethernet1/1
 description To-Another-Switch
 ip arp inspection trust
```

**Note:** DHCP snooping must be enabled for DAI to function, as it relies on the DHCP snooping binding table for validation.

## How DAI Works

DAI inspects ARP messages on untrusted ports by checking the DHCP snooping binding table, which contains:

- IP address
- MAC address
- Interface
- VLAN
- Lease time

**Validation Process:**

- **Match found:** ARP message forwarded normally
- **No match found:** ARP message dropped
- **Trusted ports:** No inspection performed

## ARP Access Lists

Use ARP ACLs when DHCP snooping is not available or when hosts use static IP assignments.

```
arp access-list ARP-ACL-1
 permit ip host 192.168.1.100 mac host 0001.0002.0003
 permit ip host 192.168.1.101 mac host 0001.0002.0004

ip arp inspection filter ARP-ACL-1 vlan 1
```

ARP ACLs provide an alternative validation method for environments without DHCP.

## Rate Limiting

**Default behavior:** DAI rate limiting is enabled by default on untrusted ports with a limit of 15 packets per second. This differs from DHCP snooping, where rate limiting is disabled by default.

### Configuring Rate Limits

```
interface Ethernet1/2
 ip arp inspection limit rate 25

errdisable recovery cause arp-inspection
errdisable recovery interval 300
```

### Burst Interval Configuration

```
interface Ethernet1/2
 ip arp inspection limit rate 25 burst interval 2
```

This allows 25 ARP messages per 2 seconds before placing the interface into error-disabled state.

## Additional Validation Checks

Enable additional validation checks on untrusted ports for enhanced security:

```
ip arp inspection validate dst-mac src-mac ip
```

**Validation Options:**

- **src-mac:** Checks ARP body source MAC against Ethernet header source MAC
- **dst-mac:** Checks ARP body destination MAC against Ethernet header destination MAC
- **ip:** Validates IP addresses (no 0.0.0.0, 255.255.255.255, or multicast addresses)

**Important:** All specified validations must pass for ARP messages to be forwarded. None are enabled by default.

### Individual Validation Commands

```
ip arp inspection validate src-mac
ip arp inspection validate dst-mac  
ip arp inspection validate ip
```

Note that when configured like this, the newer command will override the last two or previous.

## Logging

```
ip arp inspection vlan 1 logging acl-match matchlog
ip arp inspection vlan 1 logging dhcp-bindings all
```
## Verification

```
show ip arp inspection
show ip arp inspection interfaces
show ip arp inspection vlan 1
show ip arp inspection statistics
```