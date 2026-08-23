---
title: "L2 Protection Features"
description: "Cisco devices offer a built-in protection mechanism on interfaces called the Err-disable status. An interface that goes into err-disable is effectivel"
---


## Err-Disable Status

Cisco devices offer a built-in protection mechanism on interfaces called the Err-disable status. An interface that goes into err-disable is effectively shutdown, allowing no traffic to enter or exit, with the intent of protecting the network from whatever triggered the response.

Err-disable is a special state that can be applied to an interface by other processes. Commonly you will see ports get entered into err-disabled mode from STP BDU Guard, UDLD, Flapping, or Etherchannel Misconfig ([[STP Optional Features]]).

To clear this Err-disable state, you must enter an interface configuration mode, then run `shutdown ; no shutdown` to restore the interface.

```
errdisable detect cause [...]
errdisable recovery cause [...]
errdisable recovery interval [timer]
```

> Default errdisable recovery time is 300 seconds.

https://www.cisco.com/c/en/us/support/docs/lan-switching/spanning-tree-protocol/69980-errdisable-recovery.html

## Storm Control

Storm Control is able to protect a network interface from receiving too much traffic relative to other traffic types.

Storm Control can limit the following types of traffic:
- **Unicast**
- **Broadcast**
- **Multicast**
- **Unknown Unicast**

You can configure Storm Control for the following metrics:
- **Percentage**
- **Megabits per second**
- **Packets per second**

Thresholds are what is used to determine how Storm Control should behave, aka start taking action or stop taking action. There are two types of thresholds, Rising and Falling.
- **Rising Threshold**: when traffic reaches the configured metric for this value (for example, if Unicast at 500 Mbps is reached) it will start taking the configured action.
- **Falling Threshold**: when traffic already has hit the Rising Threshold, action will be taken UNTIL the event falls below this configured metric.

The following actions can be taken when Storm Control is triggered:
- **"None"** -- default --> will FILTER (**Drop** Excess)
- **Shutdown** -- configurable --> will **Err-disable** (does not have to worry about Falling Threshold)
- **Trap** --configurable --> will send an **SNMP trap** (does not have to worry about Falling Threshold)

```
interface Ethernet1/1	
	storm-control [broadcast|unicast|multicast|unknown-unicast] level {bps|pps} [rising-level] {falling-level}

interface Etherent1/1
	storm-control action [shutdown|trap]
```

https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst9500/software/release/16-12/configuration_guide/sec/b_1612_sec_9500_cg/configuring_port_based_traffic_control.html

## Etherchannel Misconfig

This feature only applies to port-channels that are using the "on" mode.

Unlike LACP, configuration mismatch protection is not enabled, so Spanning-Tree can help out.

Normally, if a port-channel is configured correctly, only one STP BPDU [[Spanning Tree Protocol (STP)]] will be expected. With Etherchannel Misconfig enabled, when spanning-tree hears that there is a BPDU getting received on a port-channel that is expecting only one, but is getting multiple, this feature gets triggered.

When triggered, Etherchannel Misconfig will place all the port-channel interfaces into Err-disabled mode.

This feature is enabled by default!

```
spanning-tree etherchannel guard misconfig
```

https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst9600/software/release/17-3/configuration_guide/lyr2/b_173_lyr2_9600_cg/configuring_etherchannels.html

