---
title: Microservices Design Patterns
description: Essential patterns for resilient microservices including Saga, Circuit Breaker, and Outbox.
---

## Key Resilience Patterns

### 1. Circuit Breaker Pattern
Prevents cascading failures when downstream services experience outages or severe degradation.

* **Closed:** Requests pass through normally.
* **Open:** After reaching a failure threshold, calls fail immediately without hitting the downstream server.
* **Half-Open:** After a cool-down period, a few canary requests test if the service has recovered.

### 2. Transactional Outbox Pattern
Solves dual-write inconsistency between a database transaction and publishing to a message broker (e.g. Apache Kafka, RabbitMQ).

```sql
BEGIN TRANSACTION;

-- 1. Mutate business state
INSERT INTO orders (id, customer_id, total, status)
VALUES ('ord_101', 'cust_456', 249.99, 'CREATED');

-- 2. Insert outbox record in same ACID transaction
INSERT INTO outbox_events (event_id, aggregate_type, payload, status)
VALUES ('evt_889', 'Order', '{"order_id": "ord_101", "status": "CREATED"}', 'PENDING');

COMMIT;
```
