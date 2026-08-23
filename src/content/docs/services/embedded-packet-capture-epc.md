---
title: "Embedded Packet Capture EPC"
description: "**Cisco Embedded Packet Capture (EPC)** is a built-in IOS-XE feature that lets routers capture live traffic passing through their interfaces. It's esp"
---


**Cisco Embedded Packet Capture (EPC)** is a built-in IOS-XE feature that lets routers capture live traffic passing through their interfaces. It's especially useful for debugging and protocol analysis without requiring external devices or taps.

> Captures are stored in **DRAM** and are **cleared on reload** unless exported.

## Use Cases

- Troubleshooting NAT, routing, or ACL behavior
- Capturing malformed packets
- Verifying protocol behavior (DHCP, HSRP, etc.)
- Capturing traffic during flaps or intermittent failures

## Capture Workflow

1. **Create a capture buffer**  
2. **(Optional)** Apply a filter using an ACL  
3. **Create a capture point** (interface + direction)  
5. **Start the capture**  
6. **Stop and view/export the capture**

## Step 1: Create a Capture Buffer

```ios
monitor capture MYCAP buffer circular size 100
```

- `size`: Total buffer size in MB
- `circular`: Continues capturing and overwrites oldest data
- Use `linear` instead of `circular` if you want capturing to stop when the buffer is full

## Step 2: Filter with Match or ACL

```ios
ip access-list extended PACKET_FILTER
 permit ip host 192.168.12.1 host 192.168.23.3

monitor capture MYCAP access-list PACKET_FILTER

...or...

monitor capture MYCAP match any
```

## Step 3: Create a Capture Point

```ios
monitor capture MYCAP interface FastEthernet0/1 both
```

- `both`: Capture ingress and egress
- Other options: `in`, `out`

## Step 4: Start and Stop the Capture

```ios
monitor capture MYCAP start
...
monitor capture MYCAP stop
```

## Step 5: View or Export

View packets directly on the router:

```ios
show monitor capture MYCAP buffer
show monitor capture MYCAP buffer brief
show monitor capture MYCAP buffer dump
```

Export to a TFTP server for Wireshark analysis:

```ios
monitor capture MYCAP export tftp://10.100.2.120/capture.pcap
```

## Optional Combination

```
monitor capture MYCAP buffer size 100 circular interface G1 both match any start
```

## Notes

- EPC captures are **volatile**; they are lost on reload.
- **Only one capture per interface/direction** is supported at a time.
- You must have **CEF enabled** on the target interfaces.
- Capture can be done using L2, IP, or ACL filters.

## Reference

[Embedded Packet Capture Whitepaper](https://www.cisco.com/c/en/us/td/docs/ios-xml/ios/epc/configuration/xe-17/epc-xe-17-book/nm-packet-capture-xe.html)
