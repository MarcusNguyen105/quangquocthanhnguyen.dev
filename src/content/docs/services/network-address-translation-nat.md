---
title: "Network Address Translation NAT"
description: "NAT rewrites IP addresses in a packet to allow private networks to communicate with public or overlapping networks. It’s commonly used to:"
---

## Overview

NAT rewrites IP addresses in a packet to allow private networks to communicate with public or overlapping networks. It’s commonly used to:

- **Hide private IP addresses** behind a public IP
- **Resolve overlapping subnets**
- **Enable internet access** for internal hosts
- **Redirect traffic** to internal services using destination NAT

#### Source NAT
- Rewrites the **source IP address**
- Most common NAT type
- Used for outbound traffic (e.g., internet, inter-VRF)
#### Port Address Translation (PAT)
- A form of NAT that rewrites both IP and **port number**
- Allows **many internal hosts** to share a **single public IP**
- Enabled by the keyword `overload`
- Most commonly used NAT type in production networks

---
## Types of NAT

- **Static NAT / PAT** – Fixed one-to-one IP or IP+Port mapping
- **Dynamic NAT / PAT** – Allocated from a pool or interface dynamically as traffic flows
- **Policy NAT / PAT** – NAT applied only to traffic matching an access list (ACL)
- **VRF-aware NAT / PAT** – NAT with multi-VRF awareness
- **VASI NAT** – Uses virtual interfaces for inter-VRF translation (IOS XE advanced use)

---
## Configurations

```none
interface Ethernet1
 ip address 10.0.0.1 255.255.255.252
 ip nat outside

interface Ethernet2
 ip address 192.168.1.1 255.255.255.0
 ip nat inside
```

---
### NAT

**Static NAT**

```none
(config)# ip nat inside source static 192.168.1.10 10.0.0.1
```

Maps internal host `192.168.1.10` to outside IP `10.0.0.1` permanently (1:1 mapping).

```none
(config)# ip nat inside source static 192.168.1.10 interface Ethernet1
```

Maps internal host `192.168.1.10` to the **outside interface IP** (dynamic public IP scenario).

**Dynamic NAT**

```none
(config)# access-list 1 permit any
(config)# ip nat inside source list 1 interface Ethernet1
```

Dynamically translates IPs that match ACL 1 to the IP address of Ethernet1.
- Only one translation is allowed at a time unless PAT (`overload`) is used.

---

### PAT

```none
(config)# access-list 1 permit any
(config)# ip nat inside source list 1 interface Ethernet1 overload
```

Applies PAT to any internal IP, allowing multiple internal hosts to share the IP of Ethernet1 using port translation.

---

### Policy

**NAT & PAT (Policy-based using ACL)**

```none
(config)# access-list 100 permit tcp any any eq 80
(config)# ip nat inside source list 100 interface Ethernet1
(config)# ip nat inside source list 100 interface Ethernet1 overload
```

- Translates only **HTTP (TCP port 80)** traffic that matches ACL 100.
- Without `overload`: Dynamic Policy NAT (1:1)
- With `overload`: Dynamic Policy PAT (many-to-one with port translation)

---

### Port Forwarding

```none
ip nat inside source static tcp 192.168.1.10 23 10.0.0.1 12345
	or
ip nat inside source static tcp 192.168.1.10 23 interface Eth1 12345
```

Maps internal **port 23** on `192.168.1.10` to **port 12345** on `10.0.0.1`.
- Commonly used for port forwarding scenarios (e.g., external SSH/RDP access).