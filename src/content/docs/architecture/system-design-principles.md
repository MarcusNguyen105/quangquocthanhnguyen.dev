---
title: System Design Principles
description: Core architectural strategies for building scalable, fault-tolerant distributed systems.
---

## Overview

Designing modern distributed systems requires balancing scalability, availability, data consistency, and operational simplicity.

:::note[Core Principle]
High availability and low latency are achieved through horizontal partitioning, asynchronous message decoupling, and aggressive caching.
:::

---

## The CAP Theorem & Trade-Offs

In distributed data stores, you can only guarantee two out of the three properties simultaneously:

1. **Consistency (C):** Every read receives the most recent write or an error.
2. **Availability (A):** Every non-failing node returns a response for every request without guarantee it contains the most recent write.
3. **Partition Tolerance (P):** The system continues to operate despite network packet loss or communication delays between nodes.

```
       [ Consistency ]
           /       \
          /   CA    \
         / (RDBMS)   \
        /             \
[ Availability ] --- [ Partition Tolerance ]
       (DynamoDB)       (MongoDB/HBase)
          AP                  CP
```

---

## Caching Patterns

### Cache-Aside (Lazy Loading)
The application first queries the cache. If a cache miss occurs, the application fetches the data from the database and populates the cache.

```python
def get_user_profile(user_id: str):
    # 1. Check in-memory Redis cache
    cached_data = redis_client.get(f"user:{user_id}")
    if cached_data:
        return json.loads(cached_data)

    # 2. Cache miss: Fetch from primary database
    user = db.query(User).filter_by(id=user_id).first()
    if user:
        # 3. Populate cache with 15-minute TTL
        redis_client.setex(f"user:{user_id}", 900, json.dumps(user.to_dict()))
    
    return user
```

### Write-Through vs Write-Back
* **Write-Through:** Data is simultaneously written to both cache and primary DB (high consistency, higher write latency).
* **Write-Back (Write-Behind):** Data is written to cache immediately, and asynchronously flushed to DB in background batches (ultra-low write latency, potential data loss risk on sudden failure).
