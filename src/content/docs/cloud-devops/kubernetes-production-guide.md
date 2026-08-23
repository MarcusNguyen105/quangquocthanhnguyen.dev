---
title: Kubernetes Production Checklist
description: Hardening, resource limits, high-availability, and zero-downtime rolling updates.
---

## Production Readiness Checklist

:::caution[Security Warning]
Never run containerized workloads with root privileges (`runAsNonRoot: true`). Always enforce a strict `securityContext`.
:::

### 1. Pod Disruption Budgets & Resource Limits

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
  namespace: production
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 25%
      maxUnavailable: 0
  template:
    metadata:
      labels:
        app: api-gateway
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 10001
        readOnlyRootFilesystem: true
      containers:
      - name: gateway
        image: ghcr.io/quangquocthanhnguyen/api-gateway:v1.4.2
        resources:
          requests:
            cpu: "250m"
            memory: "512Mi"
          limits:
            cpu: "1000m"
            memory: "1Gi"
        livenessProbe:
          httpGet:
            path: /healthz
            port: 8080
          initialDelaySeconds: 15
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
```
