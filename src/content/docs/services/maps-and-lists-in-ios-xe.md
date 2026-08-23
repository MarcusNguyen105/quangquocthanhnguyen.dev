---
title: "MAPS AND Lists IN IOS XE"
description: "Cisco IOS-XE uses several different configuration structures to deploy dynamic configurations. These structures act as logical functions that evaluate"
---

## Overview

Cisco IOS-XE uses several different configuration structures to deploy dynamic configurations. These structures act as logical functions that evaluate traffic and return values used by other network features. Understanding how these structures work logically helps you design more effective network policies.


| Object      | Purpose                                                                                                                                       |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Access-List | Identify traffic based on first match, then return true or false.                                                                             |
| Route-Map   | Matches based on an ACL then sets an L3 setting like for PBR, BGP Policy, or Redistribution.                                                  |
| Class-Map   | Classification structures that return true or false based on all or any conditions defined, which can be of types ACL, DSCP, CoS, NBAR2, etc. |
| Access-Map  | Functions like a class-map but includes actions forward or drop, for use with VACLs.                                                          |
| Policy-Map  | Takes action on traffic defined by class-maps. Most commonly used for QoS.                                                                    |

## Access List

Access lists are essentially functions that take in a packet and return a true or false value (permit or deny) based on a set of conditions.

#### Creating an Access List

```
ip access-list extended TELNET
 permit tcp 192.168.1.0 0.0.0.255 any eq 23
```

This access list permits TCP traffic from the 192.168.1.0/24 network to any destination on port 23 (Telnet). All other traffic is implicitly denied.

#### Applying to an Interface

```
interface GigabitEthernet1/1
 ip access-group TELNET in
```

Traffic that receives "PERMIT" is forwarded normally. Traffic that receives "DENY" is dropped.

> **Important:** When applied directly to interfaces, ACLs serve to forward or drop traffic. However, ACLs are also used by other features (route-maps, class-maps, NAT, etc.) where they simply return PERMIT or DENY as input for additional logic. The ACL itself doesn't forward or drop traffic in these cases - it just provides a match result.

## Route Map

Route-maps are structures that combine matching criteria with actions. Unlike ACLs which simply return permit or deny, route-maps evaluate conditions and then perform specific actions on matching traffic or routes.

#### Route-Map for PBR

```
ip access-list extended VOICE-TRAFFIC
 permit udp any any range 16384 32767

route-map PBR-EXAMPLE permit 10
 match ip address VOICE-TRAFFIC
 set ip next-hop 10.1.1.1

route-map PBR-EXAMPLE permit 20

interface GigabitEthernet0/1
 ip policy route-map PBR
```

#### Route-Map for BGP Policy

```
route-map BGP-IN permit 10
 match ip address prefix-list CUSTOMERS
 set local-preference 200

router bgp 65000
 neighbor 10.1.1.1 route-map BGP-IN in
```

#### Route-Map for BGP Route Redistribution

```
route-map REDIST-OSPF permit 10
 match ip address prefix-list INTERNAL
 set metric 100

router bgp 65000
 redistribute ospf 1 route-map REDIST-OSPF
```

## Class Map

Class-maps are classification structures that identify and group traffic based on specific criteria. Unlike ACLs which return permit or deny based on the first matching criteria, class-maps return "matches this class" or "does not match this class" for use by policy-maps.

When on the CLI, you'll notice there are multiple options to match against:

```
Router(config)#class-map CLI_CLASS

Router(config-cmap)#?
Class-map configuration commands:
  description  Class-Map description
  exit         Exit from class-map configuration mode
  match        classification criteria
  no           Negate or set default values of a command

Router(config-cmap)#match ?
  access-group         Access group
  any                  Any packets
  class-map            Class map
  cos                  IEEE 802.1Q/ISL class of service/user priority values
  dscp                 Match DSCP in IPv4 and IPv6 packets
  precedence           Match Precedence in IPv4 and IPv6 packets
  protocol             Protocol
  vlan                 VLANs to match
  ...
```

> Note that class-maps can be configured two ways, `match-all` or `match-any`, which correlate to Boolean logic operators. In the above example,  the access-map will return `true` if the traffic is either Telnet or SSH.

#### Class-Map using ACLs

```
ip access-list extended TELNET
 permit tcp any any eq 23
ip access-list extended SSH
 permit tcp any any eq 22

class-map match-any CLI_CLASS
 match access-group name TELNET
 match access-group name SSH
```

#### Class-Map using DSCP/CoS

```
class-map match-all VOICE_CLASS
 match dscp ef
 match cos 5
```

#### Class-Map using Protocol (NBAR2)

```
class-map match-all COLLABORATION_CLASS
 match protocol webex
 match protocol ms-teams
```

> **Important:** Class-maps cannot be applied to interfaces or protocols directly, rather they have to be used with a policy-map.

#### Access-Maps for VLANs

Access-Maps are special subsets of Class-Maps where they can be assigned an action.

```
vlan access-map DROP_TELNET 10
 match ip address TELNET
 action drop log

vlan access-map DROP_TELNET 20
 action forward

vlan filter DROP_TELNET vlan-list 10
```

This behavior is contrary to the normal function of Class-maps, but I have placed it here since the syntax matches that of Class-Maps.

## Policy Map

Policy-maps define actions to take on traffic classified by class-maps. While class-maps identify traffic, policy-maps specify what to do with that traffic. Policy-maps are the action engine of the Modular QoS CLI (MQC) framework.

#### Creating a Policy-Map

```
class-map VOICE
 match dscp ef

class-map VIDEO
 match dscp af41

policy-map QOS-POLICY
 class VOICE
  priority percent 20
  police rate 512000
   conform-action transmit
   exceed-action drop
 class VIDEO
  bandwidth remaining percent 40
 class class-default
  bandwidth remaining percent 60
  random-detect dscp-based
```

#### Policy-Map Actions

Policy-maps can apply various actions depending on the context:

**QoS Actions:**

- `priority` - Priority queueing (LLQ)
- `bandwidth` - Guarantee minimum bandwidth
- `police` - Rate limiting
- `set` - Mark or remark traffic
- `shape` - Traffic shaping
- `random-detect` - WRED configuration

#### Applying a Policy-Map

```
interface GigabitEthernet0/1
 service-policy output QOS-POLICY
```

1. Packet arrives on GigabitEthernet0/1
2. Evaluated against VOICE class-map (DSCP EF?)
	1. If match: Apply priority queueing and policing
3. If no match, evaluate against VIDEO class-map (DSCP AF41?)
	1. If match: Apply bandwidth allocation
4. If no match, traffic goes to class-default
	1. Apply default bandwidth allocation

