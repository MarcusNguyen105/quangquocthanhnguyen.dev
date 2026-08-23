---
title: "Control Plane Policing COPP"
description: "Control Plane Policing (CoPP) is a security mechanism used to protect the **CPU** of a network device by filtering or rate-limiting traffic that is de"
---


Control Plane Policing (CoPP) is a security mechanism used to protect the **CPU** of a network device by filtering or rate-limiting traffic that is destined **to** the control plane. This includes routing updates, management traffic, and protocols like BGP, OSPF, SSH, etc.

## Implementation Flow

1. Create an **ACL** to match traffic
2. Reference it in a **class-map**
3. Define behavior in a **policy-map**
4. Apply the policy to the **control-plane**

## Example: Drop ICMP to Control Plane

```plaintext
ip access-list extended ICMP
 permit icmp any any

class-map match-all ICMP
 match access-group name ICMP

policy-map COPP_POLICY
 class ICMP
  drop

control-plane
 service-policy input COPP_POLICY
```

This will **drop all ICMP traffic** destined to the control plane, protecting the CPU.

## Example: Rate Limit ICMP

```plaintext
policy-map COPP_POLICY
 class ICMP
  police 8000
   conform-action transmit
   exceed-action drop
```

- Limits ICMP to **8000 bps**.
- Conforming packets are **forwarded**, excessive packets are **dropped**.

## Verification

```plaintext
show policy-map control-plane
```

- View counters and hits on CoPP classes.
- Helps confirm traffic is being policed or dropped.

## Notes

- **Control plane policing** only affects **traffic to the device**, not through it.
- Not all match types are supported under `class-map` for CoPP.