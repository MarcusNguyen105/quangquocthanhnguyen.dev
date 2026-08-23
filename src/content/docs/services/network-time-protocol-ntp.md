---
title: "Network TIME Protocol NTP"
description: "Synchronizing time across network devices is a **critical service**. While it might not seem important at first glance, many key network functions rel"
---


Synchronizing time across network devices is a **critical service**. While it might not seem important at first glance, many key network functions rely on **accurate clocks**, including:

- Time-based **ACLs**
- Expiring **passwords** and **certificates**
- **Key exchange validation** for VPNs and secure tunnels
- Accurate **log timestamps** for troubleshooting and correlation

> **NTP uses UDP port 123**

NTP works on a **hierarchical model** called the **Stratum model**, which defines the "distance" a device is from the **reference clock** (usually an atomic or GPS clock).

- **Stratum 0**: Reference clock (atomic, GPS, etc.)
- **Stratum 1**: Directly connected to Stratum 0
- **Stratum 2+**: Syncs to a device at a lower stratum

Each hop **away from the atomic clock** increases the stratum level.

## NTP Roles

Devices can participate in NTP in one of several roles:
#### NTP Client
- Syncs time from a specified server
#### NTP Server
- Provides time to other clients or peers
- Use `ntp master` if you're making a router or switch act as an authoritative clock source
#### NTP Peer
- Two devices at the **same stratum** can peer
- Helps provide **redundancy** and **resilience**
- If both peers lose connection to their stratum-lower server, they can **stay in sync with each other**

> NTP Peering is great for maintaining consistent time across a zone when the upstream clock source is temporarily unreachable.


## NTP Configuration

```none
! Configure as a time source (typically on the "server" side)
ntp master [stratum]     

! Configure as an NTP client
ntp server [ipaddress]  

! Peer with another device (must be same stratum)
ntp peer [ipaddress]    

! Enable NTP authentication & Define authentication key
ntp authenticate
ntp authentication-key [number] md5 [key-string]
ntp trusted-key [number]
ntp server [address] key [number]
```

```none
show ntp status           ! View current sync status and stratum
show ntp associations     ! View peers/servers and their reachability
```

## Precision Time Protocol (PTP)

While NTP provides reasonable time synchronization (typically accurate within milliseconds), the Precision Time Protocol (PTP) is designed for applications that require **much higher precision**, often in the **sub-microsecond** range.

PTP is defined in **IEEE 1588** and is commonly used in environments such as:
- Industrial automation
- Telecommunications (e.g., mobile backhaul, 5G)
- Financial trading systems
- Power distribution networks

| Feature            | NTP                          | PTP                          |
|--------------------|-------------------------------|-------------------------------|
| Accuracy           | Milliseconds                 | Sub-microseconds             |
| Transport Protocol | UDP (port 123)               | UDP (port 319/320) or Ethernet |
| Hardware Support   | Optional                     | Typically hardware-assisted  |
| Use Case           | General network devices       | Precision-critical systems   |
