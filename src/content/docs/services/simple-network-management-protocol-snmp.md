---
title: "Simple Network Management Protocol SNMP"
description: "SNMP (Simple Network Management Protocol) is an application-layer protocol used to monitor and manage network devices. It consists of:"
---

## Overview

SNMP (Simple Network Management Protocol) is an application-layer protocol used to monitor and manage network devices. It consists of:

- **SNMP Manager** – Often part of an NMS (e.g., Cisco Prime)
- **SNMP Agent** – Resides on the switch/router
- **MIB (Management Information Base)** – Database of manageable objects

## Versions & Operations

| Operation        | Description                                                                 |
|------------------|-----------------------------------------------------------------------------|
| `get-request`     | Retrieves a value from a specific variable                                  |
| `get-next-request`| Retrieves a value from the next variable in a table                         |
| `get-bulk-request`| Retrieves large blocks of data (SNMPv2c+)                                   |
| `get-response`    | Response to `get`, `next`, or `set` requests                                |
| `set-request`     | Stores a value in a specific variable                                       |
| `trap`            | Unsolicited message to alert manager of an event                           |

### SNMPv2c

- Uses a shared **community string** for access
- **No encryption/authentication**; plaintext data
- Basic read-only or read-write access control
- Simple to configure, widely supported
- Vulnerable to spoofing and interception
- Suitable for lab or internal environments
- Limited granularity (no user-specific views)

### SNMPv3

- Uses **User-based Security Model (USM)** with usernames/passwords
- Supports:
  - **Authentication**: MD5, SHA
  - **Encryption**: DES, AES (128/192/256), 3DES
- Encrypts/authenticates traffic; secure against tampering/replay
- Complex to configure, but allows fine-grained access
- Can define views to restrict access to specific MIBs
- Recommended for production, public, and regulated networks

### SNMP Community String (v1/v2c)

- **RO (Read-Only)** – View only MIB data  
- **RW (Read-Write)** – Modify MIB data  
- Can restrict by:
  - IP access list
  - MIB view
  - Permission level

**Note:** Avoid `@` symbol in strings due to context delimiter.

## SNMP Notifications

**Traps vs Informs**

| Trap           | Inform                              |
| -------------- | ----------------------------------- |
| Unacknowledged | Acknowledged by manager             |
| Sent once      | Retransmitted until response        |
| Lower overhead | More reliable, higher resource cost |

Use **traps** for low-priority alerts, **informs** when reliability matters.

Use `snmp-server host` to define trap receiver and enable notification types:

**Examples:**
- `snmp-server enable traps snmp`
- `snmp-server enable traps port-security`
- `snmp-server enable traps port-security trap-rate 10`

| Notification Type  | Description                                                   |
|--------------------|---------------------------------------------------------------|
| `bgp`              | BGP state changes                                             |
| `bridge`           | STP bridge changes                                            |
| `cluster`          | Cluster configuration changes                                |
| `config`           | SNMP config changes                                           |
| `copy-config`      | Copy config changes                                           |
| `cpu threshold`    | CPU usage threshold                                           |
| `envmon`           | Environmental (fan, temp, etc.)                               |
| `flash`            | Flash insertion/removal in stack                             |
| `fru-ctrl`         | FRU (e.g., switch insert/remove)                              |
| `hsrp`, `ospf`, etc.| Protocol-specific changes                                   |
| `mac-notification` | MAC address movement                                          |
| `port-security`    | Port security alerts                                          |
| `snmp`             | SNMP-specific traps (auth, cold/warm start, link up/down)     |
| `storm-control`    | Excessive traffic alerts                                      |
| `syslog`, `tty`    | Syslog or TCP connection traps                                |
| `vlancreate`, etc. | VLAN operations (create/delete/membership)                    |
| `vtp`              | VTP changes                                                   |

# Configuration

## SNMPv2c

SNMPv2 must be configured with noAuthNoPriv, which is why an access-list to allow ONLY the NMS is highly suggested.

```
snmp-server enable traps [...]

snmp-server contact [...]
snmp-server location [...]

access-list 10 permit 192.168.100.10

snmp-server community LAB [ro|rw] [access-list]

snmp-server host 192.168.100.10 traps version 2c LAB
```

## SNMPv3

SNMPv3 can be configured with 2 modes:
- authNoPriv
	- **`auth`**
	- Authentication but no encryption
- authPriv
	- **`priv`**
	- Authentication and encryption

```
snmp-server enable traps [TRAP]

snmp-server group [GROUP] v3 [ noauth | auth | priv ] [ read | write ] [VIEW]

snmp-server user [USER] [GROUP] v3 auth [ md5 | sha ] [PASSWORD] priv [ 3des | des | aes {128|192|256} ] [PASSWORD]

snmp-server host [IPADDRESS]] [ traps | informs ] version 3 [ noauth | auth | priv ] [USER] 
```

> **NOTE:** After a SNMP user is configured, it is NOT added to the running-config. To verify and view configured SNMP users, use the `show snmp user` command.

**Full SNMPv3 configuration example:**

```
snmp-server enable traps syslog

snmp-server group ADMINS v3 priv read VIEW1

snmp-server user Adam ADMINS v3 auth sha C1sco12345! priv aes 128 cisco.123

snmp-server host 192.168.1.10 version 3 priv Adam
```

```
IOSvL2# show snmp user 

User name: Adam
Engine ID: 800000090300525400A92A70
storage-type: nonvolatile        active
Authentication Protocol: SHA
Privacy Protocol: AES128
Group-name: ADMINS
```

Here is a file capture of a trap, use the following details to decrypt it in Wireshark:
- Engine ID: *blank*
- Username: *Adam*
- Authentication Model: *SHA1*
- Password: *C1sco12345!*
- Privacy Protocol: *AES*
- Privacy Password: *cisco.123*

![[SNMPv3 PCAP.pcap]]
