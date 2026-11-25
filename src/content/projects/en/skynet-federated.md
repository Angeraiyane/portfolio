---
page: skynet-federated
gem: sapphire
lang: en
title: SkyNet-Federated
kicker: Big Data · Real time
summary: Real-time air surveillance. ADS-B ingestion with Kafka, federated learning across two nodes (Morocco, Togo), a Neo4j trajectory graph and a live radar.
badge: Federated learning
tags: [Kafka, Federated Learning, Neo4j, Streamlit]
github: https://github.com/Angeraiyane/SkyNet-Federated
featured: true
order: 2
plane: true
---

## The problem

Thousands of aircraft broadcast their position continuously (**ADS-B** signals). Centralising all that data to train a model is expensive in bandwidth and raises a **data sovereignty** question: every country wants to keep its own data. The idea: **train the model where the data lives**, and only share what it has learned.

Built as part of my Master's in AI & Data Computing (FST Béni Mellal).

## The architecture

1. **High-frequency ingestion**: Apache **Kafka** and ZooKeeper receive raw positions from the OpenSky API, with a replication factor of 3 to keep nodes in sync.
2. **Edge intelligence**: two federated clients simulate two regions, **FST_BM** (Africa, Asia, Americas) and **TOGO** (Europe, Oceania). Each trains a local `SGDRegressor` with incremental, online learning.
3. **Aggregation**: a central server combines the two models' weights without ever seeing raw data.
4. **Geo-AI graph**: **Neo4j** models trajectories, enriched with offline reverse geocoding (local Nominatim).
5. **Monitoring**: a **Streamlit** dashboard shows a near-real-time radar, model metrics and day-over-day traffic stability.

Three Kafka topics, each with its own leader broker: `flight_data_raw` (Morocco), `model_updates` (Togo), `global_model_results` (central cloud).

## What's next: SkyNet 2.0

- **Predictive collision avoidance**: project trajectories 10 minutes ahead and alert when two aircraft converge at the same altitude.
- **Throughput anomaly detection**: spot sensor faults or network flooding.
- **Stateful recovery**: persist weights locally so a node resumes where it stopped.
- **Deep temporal models**: replace the linear model with **LSTMs** to follow turns and holding patterns.
