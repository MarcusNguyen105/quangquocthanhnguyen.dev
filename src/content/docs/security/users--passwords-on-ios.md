---
title: "Users Passwords ON IOS"
description: "Comprehensive technical guide and configuration reference for Users Passwords ON IOS."
---

#### Types of Encryption

- Type 0 - plaintext
	- `username <> password <>`
- Type 5 - MD5
	- `username <> secret <>`
- Type 7 - Vigenere
	- `service password-encryption`
- Type 8 - PBKDF2 with SHA-256
	- `username <> alrgorithm-type sha256 secret <>`
- Type 9 - SCRPYPT
	- `username <> alrgorithm-type scrypt secret <>`

> Type 7 is only used with the `service password-encryption` feature, which can be easily cracked. This is only used for preventing over the shoulder looks, see the below example:

```
show running-config
> username admin password cisco

(config)# service password-encryption

show running-config
> username admin password 7 01100F175804
```
#### Creating a User

```
! Type 0
username {username} password {password}
! Type 5
username {username} secret {password}
! Type 8 or 9
username {username} algorithm-type { sha256 | scrypt } secret {password}
```

#### Enable Passwords

Enable password are a tool for administrators to increase their privileges to the maximum, which is privilege level 15, which has all access to the device.

```none
enable password <>
```

- Stored in **cleartext** unless encrypted with `service password-encryption` (Level 7).
- Not recommended for modern deployments, as it can be cracked easily.

```none
enable secret <>
```

```
show running-config
> username admin secret 5 $9$YeaXVbtVOzNIa
```

- Encrypted using **MD5** by default (level 5).
- Overrides `enable password` if both are configured.

This password can be used by admins by issuing the `enable` command from User EXEC mode. Mor einfo on these privilege levels in [[Local Privilege & Role-Based Access Control (RBAC)]].