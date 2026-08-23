---
title: "DHCP Snooping Option 82"
description: "DHCP snooping prevents DHCP server spoofing and exhaustion attacks by controlling which ports can respond to DHCP requests. It maintains a binding tab"
---

## Overview

DHCP snooping prevents DHCP server spoofing and exhaustion attacks by controlling which ports can respond to DHCP requests. It maintains a binding table that tracks IP-to-MAC-to-port relationships for security enforcement.

**Key Functions**

- Only trusted ports may respond to DHCP discover messages
- Maintains IP, MAC, and port bindings for verification
- Inspects DHCP messages on untrusted ports

All ports are untrusted by default. Uplinks and DHCP server ports should be configured as trusted so messages are not inspected.

## Basic Configuration

```
ip dhcp snooping
ip dhcp snooping vlan 1

interface Ethernet1/1
 description To-DHCP-Server
 ip dhcp snooping trust
```

**Note:** Always trust the port connected to your DHCP server. In multi-switch scenarios, also trust the uplink side of trunk links between switches.

## DHCP Message Inspection

When DHCP messages arrive on untrusted ports, the switch inspects them according to these rules:

**Server Messages (OFFER, ACK, NACK)**

- Always dropped on untrusted ports

**Client Messages**

- **DISCOVER/REQUEST:** Source MAC must match the DHCP message CHADDR field
- **RELEASE/DECLINE:** Source IP and interface must match the snooping binding table entry
- **Any message with Option 82:** Dropped

## Binding Table

The DHCP snooping binding table records successful DHCP assignments including IP address, MAC address, interface, and lease time. This information is used to verify RELEASE and DECLINE messages from clients.

```
show ip dhcp snooping binding
```

The binding table ensures that only the legitimate client that received an IP address can send RELEASE or DECLINE messages for that address.

## Rate Limiting

DHCP snooping can rate-limit DHCP messages per interface. If the rate limit is exceeded, the port enters error-disabled state.

```
interface Ethernet1/2
 ip dhcp snooping limit rate 10

errdisable recovery cause dhcp-rate-limit
```

This limits the interface to 10 DHCP messages per second. Configure rate limiting on client-facing ports to prevent DHCP exhaustion attacks.

## DHCP Option 82

DHCP Option 82 (relay agent information option) provides additional information about where the DHCP message was received. DHCP relay agents typically add this option when forwarding messages to remote DHCP servers.

> **Default Behavior:** With DHCP snooping enabled, the switch automatically adds Option 82 to messages from untrusted ports, even when not acting as a DHCP relay agent.

**Common Issues**

- Upstream trunk trusted ports will drop messages with Option 82
- DHCP servers will reject messages with Option 82 that weren't added by actual relay agents

### Disabling Insertion

```
no ip dhcp snooping information option
```

Use this command when Option 82 insertion causes issues with your DHCP server or upstream devices.

## Verification

```
show ip dhcp snooping
show ip dhcp snooping binding
show ip dhcp snooping database
show errdisable recovery
```