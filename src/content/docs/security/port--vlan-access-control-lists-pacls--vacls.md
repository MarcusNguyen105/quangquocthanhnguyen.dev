---
title: "PORT VLAN Access Control Lists PACLS VACLS"
description: "Port Access-Control Lists are the same as RACLs (Router Access-Control Lists), just they are applied to a `switchport`. See the below example of a PAC"
---


## PACL

Port Access-Control Lists are the same as RACLs (Router Access-Control Lists), just they are applied to a `switchport`. See the below example of a PACL:

```
interface Ethernet1/1
 ip access-group 100 in
```

What is the difference then? **PACLs can filter MAC addresses.**

> PACLs will only affect traffic in the INBOUND direction, despite how configured.

## VACL

VACL is a feature that allows access-control filtering to be applied **across an entire VLAN**, including:

- Traffic between ports in the same VLAN (even if not routed)
- Trunk ports
- Access ports
- SVI (Switched Virtual Interface)

Unlike standard port ACLs or router ACLs, **VACLs inspect all traffic within a VLAN**, regardless of L2/L3 boundaries.

> Best Practice: **Avoid relying on implicit deny** in VACLs. Explicitly forward all non-matched traffic using a separate sequence to avoid unintentionally dropping critical traffic.

### Step 1: Create an Extended ACL

The ACL defines the **target traffic** to match. In this example, we target **Telnet** traffic (TCP port 23).

```plaintext
ip access-list extended TELNET
 10 permit tcp any any eq telnet
```

> Note: In the context of a VACL, the ACL's **permitted** traffic is the traffic that will be acted upon by the access-map. Denied traffic is ignored.

### Step 2: Create a VLAN Access Map

VLAN access-maps act like policy maps. They take actions (e.g. drop or forward) based on access-list matches.

```plaintext
vlan access-map DROP_TELNET 10
 match ip address TELNET
 action drop log

vlan access-map DROP_TELNET 20
 action forward
```

Explanation:
- **Sequence 10**: Matches the `TELNET` ACL and drops matching traffic.
- **Sequence 20**: Forwards all other traffic.

### Step 3: Apply the Access Map

Apply the VLAN access-map to one or more VLANs:

```plaintext
vlan filter DROP_TELNET vlan-list 10
```

This enables the access-map on VLAN 10.

### Verifying VACLs

```plaintext
show vlan access-map
show vlan filter
```
