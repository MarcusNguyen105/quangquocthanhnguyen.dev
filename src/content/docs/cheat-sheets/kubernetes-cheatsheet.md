---
title: Kubernetes CLI Cheat Sheet
description: Rapid diagnosis commands, kubectl tips, and debugging one-liners.
---

## Quick Diagnostics

```bash
# Get pods sorted by restart count
kubectl get pods -A --sort-by='.status.containerStatuses[0].restartCount'

# Stream logs with timestamps and filter errors
kubectl logs -f deployment/api-gateway -n production --timestamps | grep -i "error"

# Run an interactive ephemeral debug pod with network tools
kubectl run debug-box --rm -i --tty --image=nicolaka/netshoot -- /bin/bash

# Port forward a service locally
kubectl port-forward svc/postgres-master 5432:5432 -n database
```
