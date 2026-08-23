---
title: "Dynamic HOST Configuration Protocol DHCP"
description: "DHCP is a critical network service that automates the assignment of IP addresses and other network configuration parameters to hosts. It eliminates th"
---


DHCP is a critical network service that automates the assignment of IP addresses and other network configuration parameters to hosts. It eliminates the need for manual IP address configuration, especially in large, dynamic networks.

Without DHCP, every device would need to be manually configured with:
- An IP address
- Subnet mask
- Default gateway
- DNS server(s)

## DHCP Process (DORA)

DHCP operates using a four-step process commonly referred to as **DORA**:

1. **Discover** – Client broadcasts to locate available DHCP servers.
2. **Offer** – Server responds with an available IP address and configuration options.
3. **Request** – Client requests to lease the offered IP address.
4. **Acknowledgment** – Server acknowledges and finalizes the lease.

This is all handled using **broadcast and unicast** messages over **UDP port 67 (server)** and **68 (client)**.

## DHCP Roles

- **DHCP Server**: Allocates IP addresses from a defined pool and tracks active leases
- **DHCP Client**: Dynamically requests IP configuration
- **DHCP Relay Agent**: Forwards DHCP packets between clients and servers across different subnets

DHCP is a **Layer 7 (application layer)** protocol but relies heavily on **Layer 2 and 3 broadcast behavior**, which is why relay agents (e.g., `ip helper-address`) are often required in routed environments.

## DHCP Configurations

#### Basic Server Configuration

```none
service dhcp

ip dhcp excluded-address 192.168.1.1 192.168.1.10

ip dhcp pool USERS
  network 192.168.1.0 255.255.255.0
  default-router 192.168.1.1
  dns-server 8.8.8.8 1.1.1.1
  lease 7
```

- `excluded-address` prevents those IPs from being assigned
- `default-router` sets the gateway for clients
- `lease` defines the number of days (or optionally hours and minutes)

#### Basic Client Configuration

```none
interface GigabitEthernet0/0
  ip address dhcp
```

#### Manual Binding on Server

```
debug ip dhcp server packet
```

Then copy the client-identifier that is outputted when a DHCP message is received.
Some devices use the MAC address by default though, including Ubuntu or Linux.

```
ip dhcp pool STATIC1
	host 192.168.1.10 255.255.255.0
	client-identifier [...]
```

> The client identifier can be found by running `debug dhcp detail` on the end host, then wait for it to generate a DHCP Discovery message. Then copy and paste the client-identifier. **If the client ID in the running-config is not even 4 char between periods, add leading zeros.**

## DHCP Relay (Forwarding)

If the DHCP server is on a different subnet, configure a **DHCP relay agent** using:

```none
interface Vlan10
  ip helper-address 192.168.100.10
```

This command causes the router to:
- Convert DHCP broadcasts to unicasts
- Forward them to the server IP
- Translate replies back to the requesting client

> Specifying a VRF in an DHCP pool only works, if the helper address also points to that same VRF locally configured & directly connected.

## DHCP Option Codes

DHCP options are used to send **additional information** to the client beyond just an IP address.

### Option Configurations

```none
ip dhcp pool USERS
  option [option-number] [hex | ascii] [value]
```
#### Common DHCP Options

| Option | Purpose                                     | Example                                    |
| ------ | ------------------------------------------- | ------------------------------------------ |
| 1      | Subnet Mask                                 | Auto-included                              |
| 3      | Default Gateway                             | `default-router`                           |
| 6      | DNS Servers                                 | `dns-server`                               |
| 15     | Domain Name                                 | `domain-name example.com`                  |
| 66     | TFTP Server Name (VoIP, PXE boot)           | `option 66 ascii tftp-server.local`        |
| 67     | Bootfile Name (PXE boot image)              | `option 67 ascii pxelinux.0`               |
| 82     | Relay Agent Info (inserted by switch/relay) | Controlled via `ip dhcp relay information` |

> Options 66 and 67 are frequently tested in **PXE boot**, **IP phone**, and **controller-based** environments.

---
## Troubleshooting

```none
show ip dhcp binding
show ip dhcp pool
debug ip dhcp server events
debug ip dhcp server packet
```

These are useful for checking which clients have active leases, what pools exist, and whether DHCP messages are being exchanged.