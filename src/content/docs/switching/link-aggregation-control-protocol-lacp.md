---
title: "LINK Aggregation Control Protocol LACP"
description: "Link Aggregation Control Protocol (LACP) is a protocol that allows multiple physical links to be bundled into one logical link. LACP allows a network "
---

## Overview

Link Aggregation Control Protocol (LACP) is a protocol that allows multiple physical links to be bundled into one logical link. LACP allows a network device to negotiate an automatic bundling of links by sending LACP packets to the peer (directly connected device that also implements LACP).

LACP is defined by the IEEE in the **802.3ad & 802.1AX** standards.

![[EtherChannelCisco.png]]

## LACP Redundancy

LACP redundancy can be controlled via max-bundle and min-link configuration options. These configurations should be considered in any Etherchannel/LACP configuration.

### Max Bundle Size

The following command allows only that number of links to be in an active state, while the extras will go into hot-standby mode.

```
interface port-channel 12
	lacp max-bundle [1-15]
```

**In summary: if the port-channel has 8 links, and max-bundle = 4, then only 4 links will be active.**
### Minimum Bundle Links

If you want to set a minimum number of links for the port-channel to be active, you can use the following command to set that threshold.

```
interface port-channel 13
	port-channel min-links [2-16]
```

**In summary: if the port-channel has less active links than the minimum-links configured, then port-channel will be shutdown.**

## Hot Standby

**LACP can support up to 8 active connections, with up to 16 total links**. The non-active link will be in hot-standby mode.

When a link in active mode goes down, another link in hot-standby mode will automatically fill in the active role based on its link-priority.

## LACP Priorities

> Note that for most Layer 2 protocols, including LACP, lower priorities wins the election.
### Master Election

LACP requires decision making when it comes to activating links, and that decision making falls on the LACP master device.

When the port-channel is formed, the **LACP System ID** is compared. This value is composed of the following:
- LACP Priority : System MAC

The default LACP Priority is 32768, with the range being 0-65535, with no restrictions on increments.

```
(config)# lacp system-priority [0-65535]
```
### Active Link Election

When a port-channel is formed, the LACP Port ID is compared. This value is comprised of the following:
- Port Priority : Port #

The default Port Priority is 32768, with the range being 0-65535, with no restrictions on increments.

```
interface Ethernet1/1
	lacp port-priority [0-65535]
```
## LACP Signaling

LACP sends messages called LACPDUs to multicast 0180.C200.002 for messaging.

These messages are sent at two speeds (configured per interface):
- **Normal: 30 seconds** (default)
- **Fast: 1 second**

A failure is determined after 3x missed LACPDUs. This means that it will take the following amount of time to detect a failed link per speed:
- Normal: 90 seconds
- Fast: 3 seconds

```
interface Ethernet1/1
	lacp rate [normal | fast]
```

> Note that this configuration is a REQUEST, meaning that if this is configured on SW1, then SW2 will start sending fast mode.

By default active links default to Slow / Normal mode, but Hot-Standby links operate at Fast rate.
- **Active: Normal**
- **Hot-Standby: Fast**

## Load Balancing

It's easy to think that a bundle of four 1Gbps links would provide a single 4Gbps connection with each link being perfectly balanced. However, load-balancing brings complexities that can create **polarization**, meaning that one link is more loaded than the rest.

### Flow Parameters

A flow is a series of packets that have the same details of the following:
- Source / Destination MAC
- Source / Destination IP
- Source / Destination Port

### Hash Allocation

When a frame needs to be sent onto an Etherchannel, the network device needs to pick a member link for the transmission.

To determine the link, configured sets of flow parameters are passed into a hash, which outputs the **result of 0-7**. This output is used to determine which port-channel links to send the traffic over.

Given the below table as an example, its easy to see why it is highly recommended to use powers of 2 for the number of links in a port-channel.

| Hash # | Hash # | Link Interfaces |
| ------ | ------ | --------------- |
| 4      | 0      | Eth1/1          |
| 5      | 1      | Eth1/2          |
| 6      | 2      | Eth1/3          |
| 7      | 3      | Eth1/4          |

Below is an example of a port-channel hash allocation that does not follow the recommended number of port-channel links:

| Hash # | Hash # | Link Interfaces |
| ------ | ------ | --------------- |
| 6      | 0      | Eth1/1          |
| 7      | 1      | Eth1/2          |
|        | 2      | Eth1/3          |
|        | 3      | Eth1/4          |
|        | 4      | Eth1/5          |
|        | 5      | Eth1/6          |
Here we can see that the allocation is imbalanced, causing flows to get hashed unevenly to certain links over others solely based off of the hash allocation.

> Based on this, the optimal number of links to use for port-channel links is 2, 4, or 8.

### Types of Hash Inputs

Now to determine which member link is chosen per each flow, you can configure what set of flow parameters are entered in.

**The default on Cisco devices is SRC-MAC, leading to polarization issues.**

For example, reference the below topology to see how using the default SRC-MAC load balancing method can create some issues:

![[PC Load Balancing SRC-MAC Issues.png]]

This is because from an End Hosts to DFGW perspective, there are lots of SRC-MAC addresses, causing even traffic distribution. BUT from the other perspective of DFGW to End Hosts, all the returning traffic is the same SRC-MAC addresses, causing polarization of all return traffic going on the same link.

To combat this, the load balancing method can be tuned to be optimal for your topology.

For most consistent and easy configuration, SRC-DST-MAC is the go-to for most campus switches.

```
(config)# port-channel load-balance [dst-ip, dst-mac, src-ip, src-mac, ...]
```

