---
title: "MAC Address Table"
description: "The MAC address table contains address information that the device uses to forward traffic between ports. All MAC addresses in the address table are a"
---

The MAC address table contains address information that the device uses to forward traffic between ports. All MAC addresses in the address table are associated with one or more ports. The address table includes these types of addresses:

- **Dynamic** address: A source MAC address that the device learns and then ages when it is not in use.
- **Static** address: A manually entered unicast address that does not age and that is not lost when the device resets.

The address table lists the destination MAC address, the associated VLAN ID, and port number associated with the address and the type (static or dynamic).

## Aging Time

The **aging-time** for an entry is the amount of seconds that the entry is valid for, when it expires it will be dropped from the MAC address table.

The default **aging-time** is **300 seconds** which is 5 minutes.

Changing the **aging-time** with the `mac address-table aging-time [seconds] vlan [vlan]` command to a value of 0 seconds will disable MAC address aging-time all together for that VLAN. Note that it is recommended that you disable MAC address learning only in VLANs with two ports. If you disable MAC address learning on a VLAN with more than two ports, every packet entering the switch is flooded in that VLAN domain.

## Configurations

```
interface Ethernet1/1
	mac-address [address]

mac address-table aging-time [seconds] vlan [vlan]

mac address-table static [address] vlan [vlan] interface [interface]

no mac address-table learning vlan [vlan]

mac address-table static [address] vlan [vlan] drop

clear mac address-table dynamic [vlan|interface|address]
```

The `drop` command enables **unicast MAC address filtering** and configure the device to drop a packet with the specified source or destination unicast static address.