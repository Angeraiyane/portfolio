---
page: rl-cyberdefense
gem: ruby
lang: fr
title: RL CyberDefense
kicker: Reinforcement learning · Cybersécurité
summary: Une étude d'ablation de DQN (Double, Dueling, replay priorisé) où un agent apprend à isoler, restaurer ou patcher des machines à partir d'alertes bruitées.
badge: 8 configurations
tags: [PyTorch, Gymnasium, DQN, Ablation]
github: https://github.com/Angeraiyane/rl-cyberdefense
featured: true
order: 4
---

## La question

Le DQN classique a reçu beaucoup d'améliorations : **Double DQN**, architecture **Dueling**, **replay priorisé** (PER). Mais lesquelles aident vraiment, seules ou combinées, sur un problème concret ? Et l'effet tient-il quand les **fausses alertes** se multiplient ?

Mini-projet de Master, strictement **défensif** : aucun code d'attaque, aucun test sur un vrai système.

## L'environnement

Un environnement **Gymnasium** sur mesure, `CyberDefenseEnv` : une infection se propage sur un graphe de machines. L'agent ne voit que des alertes, parfois fausses, et choisit pour chaque machine de l'**isoler**, la **restaurer** ou la **patcher**.

## La méthode

- Une **ablation** de **8 configurations** : DQN de base, puis chaque amélioration seule et combinée (le replay priorisé est implémenté avec un *sum-tree*).
- Les mêmes hyperparamètres pour tous, dans un seul fichier de configuration, pour une comparaison équitable.
- Deux références sans apprentissage : une politique **aléatoire** et une **heuristique** qui restaure une machine dès qu'elle déclenche une alerte.
- Trois taux de fausses alertes testés : 2 %, 10 % et 25 %.

## Premiers résultats : les références

Sur 100 épisodes d'évaluation (score : plus haut = mieux) :

| Politique | 2 % de fausses alertes | 10 % | 25 % |
|---|---|---|---|
| Aléatoire | −43,3 | −43,3 | −43,3 |
| Restaurer si alerte | −2,3 | −7,1 | −11,6 |

L'heuristique se dégrade quand les fausses alertes augmentent : c'est exactement là qu'un agent qui apprend devrait faire mieux. Les résultats des 8 variantes de DQN seront publiés ici.
