---
title: "Access Control Lists ACLS"
description: "Access Control Lists (ACLs) filter traffic based on configured criteria. They process entries top-down and stop at the first match. An implicit 'deny "
---

## Overview

Access Control Lists (ACLs) filter traffic based on configured criteria. They process entries top-down and stop at the first match. An implicit "deny all" exists at the end of every ACL.

#### Numbered vs Named

- Numbered ACLs use numbers for identification
- Named ACLs use descriptive names and allow line editing

#### Standard vs Extended

- Standard ACLs filter on source IP only (1-99, 1300-1999)
- Extended ACLs filter on source, destination, protocol, and ports (100-199, 2000-2699)

Place standard ACLs close to destination, extended ACLs close to source.

## Standard ACLs

Standard ACLs examine source IP addresses using wildcard masks. Use `host` for exact matches and `any` for all addresses.
#### Numbered Standard ACLs

```
access-list 10 permit 192.168.1.0 0.0.0.255
access-list 10 permit host 10.1.1.1
access-list 10 deny any

interface GigabitEthernet0/1
 ip access-group 10 in
```
#### Named Standard ACLs

```
ip access-list standard BRANCH_OFFICE
 permit 192.168.1.0 0.0.0.255
 permit host 10.1.1.1
 deny any

interface GigabitEthernet0/1
 ip access-group BRANCH_OFFICE out
```

**Editing**

```
ip access-list standard BRANCH_OFFICE
 15 permit 10.1.1.0 0.0.0.255
 no permit host 10.1.1.1
```

## Extended ACLs

Extended ACLs filter on source IP, destination IP, protocol, and ports. Use `eq`, `gt`, `lt`, or `range` for port specifications.
#### Numbered Extended ACLs

```
access-list 101 permit tcp 192.168.1.0 0.0.0.255 any eq 80
access-list 101 permit tcp 192.168.1.0 0.0.0.255 any eq 443
access-list 101 permit udp any any eq 53
access-list 101 deny ip any any

interface GigabitEthernet0/0
 ip access-group 101 in
```
#### Named Extended ACLs

```
ip access-list extended WEB_TRAFFIC
 10 permit tcp 192.168.1.0 0.0.0.255 any eq 80
 20 permit tcp 192.168.1.0 0.0.0.255 any eq 443
 30 permit udp any any eq 53
 40 deny ip any any log

interface GigabitEthernet0/2
 ip access-group WEB_TRAFFIC in
```

**Common Examples**

```
ip access-list extended SECURITY_POLICY
 permit tcp any any eq 22
 permit icmp any any
 deny tcp any any eq 23
 permit tcp any any established
 deny ip any any log
```

**Verification**

```
show access-lists
show ip interface GigabitEthernet0/1
```
