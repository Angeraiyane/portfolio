---
page: lapisflow-ai
gem: lapis
lang: en
title: LapisFlow AI
kicker: AI triage · Banking77
summary: A rules → classifier → fallback LLM → human cascade that triages a bank's customer messages. Fraud-related requests are never handled automatically.
badge: 99.14% accuracy
tags: [FastAPI, scikit-learn, SQLite, pytest]
github: https://github.com/Angeraiyane/lapisflow-ai
featured: true
order: 1
---

## The problem

A bank's support team receives thousands of messages. Many are simple and can be handled automatically. Others, especially anything related to fraud, must **always** reach a human. The challenge isn't just automating: it's knowing **when not to automate**.

Built during the Delphi × Aspire Board of Advisors challenge, on the public **Banking77** dataset (13,083 messages, 77 intents grouped into 10 categories).

## The architecture: a cascade

Every message goes through four stages, from the most cautious to the most expensive:

1. **Lexical guard**: 11 regular expressions send sensitive phrasings straight to a human.
2. **Protection gate**: if the probability of a protected (fraud) category reaches 0.0047, the message goes to a human.
3. **Confidence gate**: a message is only auto-routed when the classifier is at least 95% sure.
4. **Fallback LLM**, optional: any failure or invalid output goes to a human.

The service is a **FastAPI** app (`/triage`, `/health`, `/stats`). A **SQLite** audit log records every decision while storing only **SHA-256** hashes, never customers' text.

## Results (test set, evaluated once)

- **58.94%** of messages handled automatically…
- … with **99.14%** accuracy (95% confidence interval: 98.42–99.58%).
- **0 out of 156** fraud-related requests auto-routed.
- Latency: **23.7 ms** median, **47.6 ms** at the 95th percentile.
- **33** automated tests (pytest).

## What I took away

I had set a 99.4% accuracy target on validation: the test gives 99.14%, so the target was **missed**, and I say so. Zero missed fraud cases out of 156 is also **weak** evidence: with a true error rate of 0.41%, that result would happen about half the time by chance. Measuring honestly also means putting a number on what you don't know.
