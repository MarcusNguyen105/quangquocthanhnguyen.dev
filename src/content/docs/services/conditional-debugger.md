---
title: "Conditional Debugger"
description: "**Conditional debugging** is used to filter debug output so you only see messages related to a specific interface, IP address, MAC address, VLAN, or o"
---


**Conditional debugging** is used to filter debug output so you only see messages related to a specific interface, IP address, MAC address, VLAN, or other criteria. This is extremely useful on busy routers where full debug output would overwhelm the console or terminal buffer.

Instead of enabling all debug output for a protocol, you can **limit output to just what you care about**.

## Example Use Case

### Problem

If you enable `debug ip rip`, the router shows RIP updates on **all** interfaces.

```none
R1#debug ip rip
RIP protocol debugging is on
```

Example output:

```none
RIP: sending v2 update to 224.0.0.9 via FastEthernet0/0 (192.168.12.1)
RIP: sending v2 update to 224.0.0.9 via FastEthernet0/1 (192.168.13.1)
```

### Add a Debug Condition

You can limit debug output to only a specific interface:

```none
debug condition interface FastEthernet 0/0
```

Now, only RIP messages from Fa0/0 will show up:

```none
RIP: sending v2 update to 224.0.0.9 via FastEthernet0/0 (192.168.12.1)
```

## Debug Condition Matching Logic

Each `debug condition` adds to the filter, they are **additive** not logical `and` or `or`.

For example:

```none
debug condition interface FastEthernet0/0
debug condition interface FastEthernet0/1
```

This will show debug output **from either** Fa0/0 **or** Fa0/1 — **not just packets matching both**.

> Think of debug conditions like **permit rules in an ACL**: if it matches **any** condition, it is shown.

You can check the current debug statements with:

```
show debug condition
```

## Removing a Debug Condition

To remove a specific condition:

```none
undebug condition interface FastEthernet0/0
```

You'll get a warning that removing debug conditions may expose you to high-volume debug output:

```none
Removing all conditions may cause a flood of debugging messages...
Proceed with removal? [yes/no]: yes
```