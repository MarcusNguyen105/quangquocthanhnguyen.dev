---
title: Linux & DevOps Diagnostic Cheat Sheet
description: Essential performance analysis commands, network tracing, and disk diagnostics.
---

## System Performance & Networking

```bash
# Check top memory consuming processes
ps aux --sort=-%mem | head -n 10

# Inspect open network ports and listening processes
ss -tulpn

# Monitor disk I/O in real-time
iostat -xz 1 10

# Test TCP latency and TLS handshake
curl -w "DNS: %{time_namelookup}s | Connect: %{time_connect}s | TLS: %{time_appconnect}s | Total: %{time_total}s\n" -so /dev/null https://quangquocthanhnguyen.dev
```
