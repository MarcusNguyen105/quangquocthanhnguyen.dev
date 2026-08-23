---
title: LLM Agents & Tool Use Architecture
description: Designing autonomous agents with planning, stateful scratchpads, and MCP tool execution.
---

## Core Components of an Autonomous Agent

1. **Planning & Decomposition:** Breaking down multi-step user prompts into discrete tool calls.
2. **Tool Execution Loop (ReAct):** Thought $\rightarrow$ Action $\rightarrow$ Observation cycles.
3. **Memory & Context Management:** Differentiating working memory (scratchpad) from long-term memory (vector embeddings/SQL).
