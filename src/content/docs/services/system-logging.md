---
title: "System Logging"
description: "Cisco IOS provides flexible logging mechanisms to monitor, store, and export system messages. These messages can assist with troubleshooting, alerting"
---

Cisco IOS provides flexible logging mechanisms to monitor, store, and export system messages. These messages can assist with troubleshooting, alerting, and change tracking.

## Local Logging Outputs

### Console Logging

```none
logging console
```

- Displays log messages to the **console terminal** (when physically connected).
- Enabled by default at level 7.
- Can be **rate-limited** by terminal settings.

### Monitor Logging (vty)

```none
logging monitor [level]
```

- Sends log messages to **vty (Telnet/SSH)** sessions.
- Use with `terminal monitor` inside the vty session to display logs.
- Log level can be specified (0–7):

| Level | Name     | Description             |
|-------|----------|-------------------------|
| 0     | emergencies | System is unusable    |
| 1     | alerts      | Immediate action needed |
| 2     | critical    | Critical conditions    |
| 3     | errors      | Error conditions       |
| 4     | warnings    | Warning conditions     |
| 5     | notifications | Normal but significant events |
| 6     | informational | Informational messages |
| 7     | debugging   | Debug-level messages   |

### Buffered Logging

```none
logging buffered <bytes> [0-7]
```

- Stores log messages in **RAM** (viewed via `show log`).
- Size default is 4096 bytes; you can increase it for deeper history.
- Not persistent across reboots.

> Use `show logging` or `show log` to view buffered logs.

---

## External Logging (Syslog)

```none
logging host <ip>
logging trap <level>
```

- Sends logs to an **external syslog server**.
- `logging trap` controls what severity level messages are sent.

## Timestamps

Timestamps provide time context for each log entry.

```none
service timestamps debug datetime msec
service timestamps log datetime msec
```

- Applies to **debug** and **log** messages.
- `msec` adds **millisecond precision**.

## Configuration Changes

Change notification is a nice feature on Cisco IOS devices that lets you keep track of the changes that have been made to your configuration. It can even track the user who made these changes and it can send this information to a syslog server.

To enable configuration change logging use the following:
```
R1(config)# archive
R1(config-archive)# log config
R1(config-archive-log-cfg)# logging enable
```

By default, devices will store the past 100, but this can be increased with:
```
R1(config-archive-log-cfg)# logging size 5000
```

For exporting these changes as syslog, use the following:
```
R1(config-archive-log-cfg)# notify syslog
```

If you do not want any credentials being logged in these logs, use teh follwoing:
```
R1(config-archive-log-cfg)# hidekeys
```

### Verifications

```
R1# show archive log config all
 idx   sess           user@line      Logged command
    1     1        console@console  |  logging enable 
    2     1        console@console  |  logging size 5000
    3     1        console@console  |  notify syslog 
    4     1        console@console  |  hidekeys 
    5     1        console@console  |  interface g 0  
    6     1        console@console  | shutdown 
    7     1        console@console  | no shutdown 
```

```
R1# show archive log config all provisioning 
archive 
 log config 
  logging enable 
  logging size 5000
  notify syslog 
  hidekeys 
interface g 0/0
 shutdown 
 no shutdown 
```