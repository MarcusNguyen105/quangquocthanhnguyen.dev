---
title: "Local Privilege ROLE Based Access Control RBAC"
description: "These features are for limiting what users can do when logged in."
---

These features are for limiting what users can do when logged in.
## Local Privilege Levels

Uses **privilege levels** to control command access:
#### Level 0
Includes the **disable**, **enable**, **exit**, **help**, and **logout** commands.
#### Level 1
Also known as **User EXEC** mode. The command prompt in this mode includes a greater than sign (R1>). From this mode it is not possible to make configuration changes; in other words, the command **configure terminal** is not available.
#### Levels 2 - 14
These additional privilege levels ranging from 2 to 14 can be configured to provide customized access. The configuration mode command `privilege {mode} level {level} {command}` is used to change or set a privilege level for a command to any of the levels.

The following configuration shows where the user `aspera` is created with the type 9 (scrypt) password of `cisco`. This user is set to be placed into privilege level 5 upon login, and is only able to enter interfaces, shut it down, unshut it, and apply an IP address to it, then save the configs, as defined in privilege level 15.

```
username aspera privilege 5 algorithm-type scrypt secret cisco
privilege exec level 5 configure terminal
privilege exec level 5 copy running-config startup-config
privilege configure level 5 interface
privilege interface level 5 shutdown
privilege interface level 5 no shutdown
privilege interface level 5 ip address
```

```
R1# show running-config
!
username aspera privilege 5 secret 9 $9$FkX9u0j...
!
privilege interface level 5 shutdown
privilege interface level 5 ip address
privilege interface level 5 ip
privilege interface level 5 no shutdown
privilege interface level 5 no ip address
privilege interface level 5 no ip
privilege interface level 5 no
privilege configure level 5 interface
privilege exec level 5 copy running-config startup-config
privilege exec level 5 copy running-config
privilege exec level 5 copy
privilege exec level 5 configure terminal
privilege exec level 5 configure
```

> Note that when you set a privilege level for a multi word command like `no shutdown` each word in the command gets its own privilege level, since the full string cannot be executed without also executing each individual word.

#### Level 15
Also known as **Privileged EXEC** mode. This is the highest privilege level, where **all commands are available**. The command prompt in this mode includes a hash sign (R1#).

## Role-Based Access Control (RBAC)

More granular than privilege levels.

- **Roles = Views**
- Views define command access
- Can be **enabled manually** or **assigned to users**
- Requires **AAA enabled**

###  Parsers & Views

```plaintext
parser view FIRST inclusive
 secret firstpass
 command exec exclude show version
 command exec exclude show all ip
 command exec exclude configure terminal

parser view SECOND
 secret secondpass
 command exec include show version
 command exec include show all ip
 command exec include-exclusive configure terminal
```

> `inclusive` views deny by default, and only allow included commands.  
> `exclusive` views allow by default, and only deny explicitly excluded commands.  
> `include-exclusive` means this command can **only belong to this view**.

### Assigning Views to Users

```plaintext
username admin view SECOND password cisco
aaa authentication login default local
aaa authorization exec default local
```

Note that users can switch views while logged in with the `enable view [view-name]` command, and will have to enter the views specific password.
