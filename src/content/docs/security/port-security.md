---
title: "PORT Security"
description: "Port security allows you to control which source MAC addresses are permitted to enter on switch ports. When an unauthorized source MAC address enters "
---

## Overview

Port security allows you to control which source MAC addresses are permitted to enter on switch ports. When an unauthorized source MAC address enters the port, an action will be taken. By default, the port will be placed into an error-disabled state.

When you enable port security, it will by default only allow one MAC address. If you don't configure it manually, it will allow the first MAC address received and use that as the authorized address. However, you can change the number of allowed addresses.

For example, with an IP phone scenario where you expect both a phone and PC, you would set the MAC limit to 2. In this scenario, if you do not configure them manually, the first 2 MAC addresses detected will be added to the allowed list.

## Basic Configuration

```
interface Ethernet1/1
 switchport mode { access | trunk }
 switchport port-security
 switchport port-security maximum { number }
```

The above configuration block enables the **default port-security settings** for the interface, which includes:

- Allows up to 1 MAC address
- Uses the first received MAC address as the allowed MAC

## Verification

To verify the status of port-security on an interface, use the following verification command:

```
SW1# show port-security interface Ethernet0/1
Port Security              : Enabled
Port Status                : Secure-up
Violation Mode             : Shutdown
Aging Time                 : 0 mins
Aging Type                 : Absolute
SecureStatic Address Aging : Disabled
Maximum MAC Addresses      : 1
Total MAC Addresses        : 0
Configured MAC Addresses   : 0
Sticky MAC Addresses       : 0
Last Source Address:Vlan   : 0000.0000.0000:0
Security Violation Count   : 0
```

After connecting an end host and sending a ping, you can see that the output has changed to record the MAC address and increase the total MAC address count:

```
SW1# show port-security interface Ethernet0/1
Port Security              : Enabled
Port Status                : Secure-up
Violation Mode             : Shutdown
Aging Time                 : 0 mins
Aging Type                 : Absolute
SecureStatic Address Aging : Disabled
Maximum MAC Addresses      : 1
Total MAC Addresses        : 1  <---------
Configured MAC Addresses   : 0
Sticky MAC Addresses       : 0
Last Source Address:Vlan   : 000a.000a.000a:1  <---------
Security Violation Count   : 0
```

To test the shutdown functionality, if you change the MAC address on the router and send another ping, you'll see the following output:

```
%PORT_SECURITY-2-PSECURE_VIOLATION: Security violation occurred, caused by MAC address 000d.000d.000d on port Ethernet0/1.

%PM-4-ERR_DISABLE: psecure-violation error detected on Et0/1, putting Et0/1 in err-disable state

%LINEPROTO-5-UPDOWN: Line protocol on Interface Ethernet0/1, changed state to down

SW1# show port-security interface Ethernet0/1
Port Security              : Enabled
Port Status                : Secure-shutdown
Violation Mode             : Shutdown
Aging Time                 : 0 mins
Aging Type                 : Absolute
SecureStatic Address Aging : Disabled
Maximum MAC Addresses      : 1
Total MAC Addresses        : 0
Configured MAC Addresses   : 0
Sticky MAC Addresses       : 0
Last Source Address:Vlan   : 000d.000d.000d:1  <---------
Security Violation Count   : 1  <---------

SW1# show interface Ethernet0/1 status
Port            Status          Vlan
Ethernet0/1     err-disabled    1
```

> **Note:** After the port is shut down, the initially learned MAC address is cleared. This means that after an error occurs and the port is shut down, a new MAC can be learned again once the port is re-enabled.

## Re-enabling a Disabled Port

To re-enable the port, you can use one of the following methods:

**Manual Reset:**

```
interface Ethernet0/1
 shutdown
 no shutdown
```

**Automatic Recovery:**

```
errdisable recovery cause psecure-violation
errdisable recovery interval 300
```

## Violation Modes

There are three different violation modes that determine what the switch will do if an unauthorized frame enters an interface configured with port security:

### Shutdown

- Default mode.
- Effectively shuts down the interface by placing it into an error-disabled state
- Generates syslog and SNMP messages on initial disable
- Violation counter is set to 1 when the interface is disabled and returns to 0 after being re-enabled

### Restrict

- Switch discards traffic from unauthorized MACs but does not disable the interface
- Generates syslog and SNMP messages every time a frame from an unauthorized MAC is detected
- Violation counter is incremented by 1 for each unauthorized frame

### Protect

- Switch discards traffic from unauthorized MACs but does not disable the interface
- Does NOT generate syslog or SNMP traffic
- Does NOT increment the violation counter

### Configuring Violation Modes 

```
switchport port-security
switchport port-security mac-address 000a.000a.000a
switchport port-security violation { restrict | protect }
```

## Secure MAC Address Aging

By default, secure MAC addresses will not "age out" (aging time of 0).

```
switchport port-security aging-time {minutes}
```

#### Absolute

- Default mode.
- After the secure MAC address is learned, the aging timer starts and the MAC is removed after it expires, even if it continues receiving frames from that source MAC
- After it ages out, it can be re-learned

#### Inactivity

- After the secure MAC address is learned, the aging timer starts, but every time traffic from that MAC is received, the timer is reset

#### Configuring Aging Types

```
switchport port-security aging type { absolute | inactivity }
```

> **Note:** By default, only dynamically learned addresses will age out. Manual entries are not aged out by default. If you want manually configured secure MACs to time out, you can use the `switchport port-security aging static` command to enable that behavior.

## Sticky Secure MAC Addresses

To enable sticky secure MAC addresses, use the following command:

```
switchport port-security mac-address sticky
```

When enabled, all existing and new dynamically learned secure MAC addresses will be added to the running configuration as `switchport port-security mac-address sticky {mac}` entries.

> **Important:** These sticky MAC addresses will **NEVER** age out, even with the `switchport port-security aging static` command. However, since they are added to the running configuration, they will be lost on reload if not saved to the startup configuration.