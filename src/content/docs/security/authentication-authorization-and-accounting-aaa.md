---
title: "Authentication Authorization AND Accounting AAA"
description: "RADIUS and TACACS+ servers can be configured on Cisco IOS XE for centralized authentication and authorization."
---

RADIUS and TACACS+ servers can be configured on Cisco IOS XE for centralized authentication and authorization.

## Old vs New Login Models

#### Old Model
- Uses **line-level** or **username-level** authentication and authorization.
- Simple, but lacks flexibility.
- No centralized control.

#### New Model
- Enables full **AAA (Authentication, Authorization, Accounting)** framework.
- Allows custom **method lists**.
- AAA method lists can be applied to different access technologies like:
  - Console, VTY, PPP, etc.

## Authentication Protocols

#### TACACS+
- Cisco proprietary.
- Used for device admin access.
- Supports:
  - Per-command authorization
  - Per-command accounting
- Encrypts entire payload.
- **Uses port TCP 49**
#### RADIUS
- Open standard (RFC).
- Used for end-user authentication, e.g., VPN.
- Encrypts only the password field.
- Does not support per-command authorization/accounting.
- Uses the following ports:
	- Ciscos Implementation
		- **UDP 1645**: Authentication & Authorization
		- **UDP 1646**: Accounting
	- Industry Standard
		- **UDP 1812**: Authentication & Authorization
		- **UDP 1813**: Accounting

> **Best Practice:** Always configure **local fallback** in case external servers are unreachable.

## Local Login with AAA

```plaintext
aaa new-model

username admin password cisco
enable secret cisco123

aaa authentication login default local
aaa authentication enable default enable
aaa authorization exec default local

line vty 0 4
 login authentication default
```

## RADIUS Example

```plaintext
aaa new-model

radius server RAD-SERVER-1
	address ipv4 192.100.3.51 auth-port 1645 acct-port 1646
	key cisco1
radius server RAD-SERVER-2
	address ipv4 192.100.3.52 auth-port 1645 acct-port 1646
	key cisco2

aaa group server radius RAD-GROUP
 server name RAD-SERVER-1
 server name RAD-SERVER-2
 ip vrf forwarding Mgmt-vrf

aaa authentication login RADIUS-LIST group RAD-GROUP
aaa authentication enable default group RAD-GROUP
aaa authorization exec RADIUS-LIST group RAD-GROUP

line vty 0 4
 login authentication RADIUS-LIST 
```

> Note that the order in which the `server name <>` commands are issues to the group dictates the failover order. This being that, the first one added will have highest priority. In the running-config, the first one in the group, will be tried first.

## TACACS Example

```
aaa new-model

tacacs server TAC-SERVER-1
	address ipv4 172.16.2.78
	key cisco1
tacacs server TAC-SERVER-2
	address ipv4 172.16.2.79
	key cisco2

aaa group server tacacs TAC-GROUP
 server name TAC-SERVER-1
 server name TAC-SERVER-2
 ip vrf forwarding Mgmt-vrf

aaa authentication login TACACS-LIST group TAC-GROUP
aaa authentication enable default group TAC-GROUP
aaa authorization exec TACACS-LIST group TAC-GROUP

line vty 0 4
 login authentication TACACS-LIST 
```

> Note that the order in which the `server name <>` commands are issues to the group dictates the failover order. This being that, the first one added will have highest priority. In the running-config, the first one in the group, will be tried first.

## Default AAA List

The specified default method will be applied to all lines (cty, vty, aux, etc.) but notably does NOT apply to the console.

```
...
aaa authentication login default group TAC-GROUP local

line vty 0 4
 login authentication default
```

To apply a specific list to a line use the explicit config with:

```
...
line vty 0 4
 login authentication TACACS-LIST 
```

> If you want to have AAA apply to the console port, use the following command`aaa authorization console`.

## Command Auth & Accounting

Enable this whole section by issuing:
```
aaa authorization config-commands
```

Setup command authorization with the following:
```
aaa authorization commands {priv} { default | list-name } ... if-authenticated
aaa authorization commands 0 default group TAC-GROUP if-authenticated
aaa authorization commands 1 default group TAC-GROUP if-authenticated
aaa authorization commands 15 default group TAC-GROUP if-authenticated
```

> The command `if-authenticated` allows users to input commands even if a AAA server is offline. This is because with command authorization, if an AAA server cannot be reached, the user will not be able to enter any commands. **The `if-authenticated` command allows them to enter commands without a reachable AAA server, IF the user is already signed-into the device.**

> The command `if-authenticated` can be `local` instead. This works the same, but instead of checking if the user is already logged in, it checks the current users credentials against the local username and password database.
## Login Cosmetics

```
Device> enable
Device# configure terminal
Device(config)# aaa new-model
Device(config)# aaa authentication banner *Unauthorized Access Prohibited*
Device(config)# aaa authentication fail-message *Failed login. Try again.*
Device(config)# aaa authentication login default group radius
```

This configuration displays the following login banner:

```
Unauthorized Access Prohibited
Username:
```

The following example shows how to configure a failed-login banner that is displayed when a user tries to log in to the system and fails, (in this case, the phrase “Failed login. Try again”). The asterisk (*) is used as the delimiting character. RADIUS is specified as the default login authentication method.

This configuration displays the following login and failed-login banner:

```
Unauthorized Access Prohibited
Username: 
Password: 
Failed login. Try again.
```