---
title: "Console VTY AUX SSH SCP"
description: "The **console line** is the physical access method via the device's console port. There is **only one** console line (`line console 0`)."
---

## Console

The **console line** is the physical access method via the device's console port. There is **only one** console line (`line console 0`).

#### Basic Authentication

```none
line console 0
 password cisco
 login
```

- The `login` command tells the router to prompt for the password configured with `password`.
- If `login` is not specified, **no authentication** will be enforced on console access.

#### Local Authentication

```none
username admin password cisco

line console 0
 login local
```

- `login local` uses credentials from locally configured users.
- Users must enter both a **username** and **password** to gain access.

## VTY Lines

VTY lines are **virtual teletype** lines used for remote access.

- VTY line numbers typically range from 0 to 15.
- This means **up to 16 users** can connect simultaneously.

```
line vty 0 15
 login local
 transport input { any | ssh | telnet | none }
 exec-timeout {minutes} {seconds}
 absolute-timeout {minutes}
 logout-warning {seconds}
```

- `login local` - uses will need to sign in with a locally confused user
- `transport input <>` - defined what protocols are allowed to use those lines
- `exec-timeout <> <>` - defines how long to wait before disconnecting inactive sessions
- `absolute-timeout <>` - defined at what time the line will be forcibly closed
- `logout-warning <>` - defined at what time a logout warning is issuesd

## AUX

Usage of the auxiliary port via a cable modem is a legacy use case and technology, and should be disabled for access.

```
line aux 0
 no exec
```

## SSH

```none
hostname R1
ip domain-name adamspera.dev
crypto key generate rsa modulus 2048
ip ssh version 2
username admin password cisco

line vty 0 15
 login local
 transport input ssh
```

- `transport input ssh` allows only SSH (not Telnet).
- `crypto key generate rsa` is required to enable SSH.
- `ip ssh version 2` since IOS devices run both 1 & 2, this command stops v1.

## SCP Server

SCP is a file sharing protocol that runs over SSH, and requires AAA new-model.

The following configuration example shows how you can setup a network device to be an SCP server:

```none
aaa new-model
aaa authentication login default local
aaa authorization exec default local
username admin secret cisco

hostname MyRouter
ip domain-name adamspera.dev
crypto key generate rsa modulus 2048
ip ssh version 2
line vty 0
  transport input ssh
  login authentication default

ip scp server enable
```

##  IOS Login Enhancements

Helps protect against **brute-force attacks**.

```plaintext
login block-for 60 attempts 3 within 10
```

> This means: If 3 failed attempts occur **within 10 seconds**, block logins **for 60 seconds**.
