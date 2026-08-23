---
title: "L2 L3 Maximum Transmissible UNIT MTU"
description: "When talking about L2 MTU (maximum transmissible unit), we are talking about how all frames have to be within that limit. Wheras with L3 MTU, we are t"
---

When talking about L2 MTU (maximum transmissible unit), we are talking about how all frames have to be within that limit. Wheras with L3 MTU, we are talking about the entire L3 packet.

- For example if the L2 MTU is 1500B then a frame with >1500B will be dropped.
- For example if the L3 MTU is 1500B then a packet with >1500B will be fragmented.

The default L2 & L3 MTU MTU is 1500B for most Cisco platforms, but can be increased to usually around >= 9000B.

## Two Types of MTU

**L2** MTU focuses on *frames* coming into a L2 device, determining if it hits the L2 MTU threshold, then **drops** it if it does.

**L3** MTU focuses on *packets* coming into a L2 device, determining if it hits the L3 MTU threshold, then **fragments** it if it does.

## Use Cases

### L2 Example

The ethernet spec allows for a 14B header, a 1500B payload, then 4B for the CRC header. Keep in mind a bonus 4B for 802.1Q if added. 

Lets take a frame like this:

| Header   | 802.1Q  | Payload    | CRC Trailer |
| -------- | ------- | ---------- | ----------- |
| 14 Bytes | 4 Bytes | 1500 Bytes | 4 Bytes     |

--> **L2 MTU applies ONLY to the PAYLOAD** <--

In this situation, all these *frames* would be allowed, but if the L2 MTU was shorted to 1000 Bytes, then the frame would be dropped.

## L3 Example

Take this example standard packet for us to use as a starting point:

| Layer             | Component          | Size (Bytes)                  |
| ----------------- | ------------------ | ----------------------------- |
| Layer 2           | Ethernet Header    | 14                            |
| Layer 3           | IPv4 Header        | 20                            |
| Layer 4           | TCP/UDP Header     | 20                            |
| Layer 7           | App Data (Payload) | 1460                          |
| Layer 2           | CRC Trailer        | 4                             |
| **Total on wire** | --->               | **1518 bytes** (without VLAN) |

--> **L3 MTU applies ONLY to the IP Packet (IP + TCP/UDP + data)** <--

The **default L3 MTU of 1500 bytes** *fits within* the **L2 MTU of 1500 bytes** because:
- L2 payload = **entire L3 packet**
- So 1500 bytes of IP packet (including IP + TCP/UDP + data) fits **exactly** within Ethernet's 1500-byte payload field

## Configurations

**Switch Command Reference**
```
(config)# system mtu [bytes]

# show system mtu
```

**Router Command Reference**

```
interface Ethernet1/1
	mtu [bytes]
	ip mtu [bytes]

ping [ipaddress] size [bytes] {df-bit}
```

Note that L3 MTU (ip mtu) will default to matching the L2 MTU configuration, and will not show up in the show interface command.