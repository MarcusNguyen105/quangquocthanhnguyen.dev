---
title: Production RAG Pipeline Architecture
description: Building high-accuracy Retrieval-Augmented Generation systems with hybrid search and re-ranking.
---

## Advanced RAG Architecture

```
[ User Query ] ──► [ Query Rewriter / HyDE ]
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
     [ Dense Vector Search ]    [ Sparse BM25 Search ]
     (pgvector / Qdrant)        (Elasticsearch / Tantivy)
             │                           │
             └─────────────┬─────────────┘
                           ▼
             [ Reciprocal Rank Fusion (RRF) ]
                           │
                           ▼
             [ Cross-Encoder Re-ranker (Cohere / BGE) ]
                           │
                           ▼
             [ Context Compression & Token Packing ]
                           │
                           ▼
             [ LLM Generation (Gemini / Claude / GPT) ]
```

### Key Strategies for RAG Accuracy:
1. **Hybrid Retrieval (Dense + Sparse):** Vector search captures semantic concepts, while BM25 keyword search captures exact names, acronyms, and part numbers.
2. **Context Window Optimization:** Re-ranking truncates irrelevant documents to avoid distracting the LLM or exceeding token limits.
