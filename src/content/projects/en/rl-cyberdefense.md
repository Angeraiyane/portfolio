---
page: rl-cyberdefense
gem: ruby
lang: en
title: RL CyberDefense
kicker: Reinforcement learning · Cybersecurity
summary: A DQN ablation study (Double, Dueling, prioritized replay) where an agent learns to isolate, restore or patch machines from noisy alerts.
badge: 8 configurations
tags: [PyTorch, Gymnasium, DQN, Ablation]
github: https://github.com/Angeraiyane/rl-cyberdefense
featured: true
order: 4
---

## The question

Classic DQN has received many improvements: **Double DQN**, the **Dueling** architecture, **prioritized experience replay** (PER). But which ones actually help, alone or combined, on a concrete problem? And does the effect hold as **false alarms** multiply?

A Master's mini-project, strictly **defensive**: no attack code, no tests on real systems.

## The environment

A custom **Gymnasium** environment, `CyberDefenseEnv`: an infection spreads across a graph of machines. The agent only sees alerts, some of them false, and chooses for each machine whether to **isolate**, **restore** or **patch** it.

## The method

- An **ablation** of **8 configurations**: baseline DQN, then each improvement alone and combined (prioritized replay is implemented with a *sum-tree*).
- The same hyperparameters for all, in a single config file, for a fair comparison.
- Two non-learning baselines: a **random** policy and a **heuristic** that restores a machine as soon as it raises an alert.
- Three false-alarm rates tested: 2%, 10% and 25%.

## First results: the baselines

Over 100 evaluation episodes (score: higher is better):

| Policy | 2% false alarms | 10% | 25% |
|---|---|---|---|
| Random | −43.3 | −43.3 | −43.3 |
| Restore on alert | −2.3 | −7.1 | −11.6 |

The heuristic degrades as false alarms rise: that's exactly where a learning agent should do better. Results for the 8 DQN variants will be published here.
