---
page: lapisflow-ai
gem: lapis
lang: fr
title: LapisFlow AI
kicker: Triage IA · Banking77
summary: Une cascade règles → classifieur → LLM de secours → humain pour trier les messages clients d'une banque. Les demandes liées à la fraude ne sont jamais traitées automatiquement.
badge: 99,14 % de précision
tags: [FastAPI, scikit-learn, SQLite, pytest]
github: https://github.com/Angeraiyane/lapisflow-ai
featured: true
order: 1
---

## Le problème

Un service client bancaire reçoit des milliers de messages. Beaucoup sont simples et peuvent être traités automatiquement. D'autres, surtout ceux qui touchent à la fraude, doivent **toujours** arriver chez un humain. L'enjeu n'est pas seulement d'automatiser, c'est de savoir **quand ne pas automatiser**.

Projet réalisé pendant le défi Delphi × Aspire Board of Advisors, sur le jeu de données public **Banking77** (13 083 messages, 77 intentions regroupées en 10 catégories).

## L'architecture : une cascade

Chaque message passe par quatre étages, du plus prudent au plus coûteux :

1. **Garde lexicale** : 11 expressions régulières envoient directement à un humain les formulations sensibles.
2. **Seuil de protection** : si la probabilité d'une catégorie protégée (fraude) dépasse 0,0047, le message part chez un humain.
3. **Seuil de confiance** : le message n'est traité automatiquement que si le classifieur est sûr à 95 % ou plus.
4. **LLM de secours**, optionnel : en cas d'échec ou de réponse invalide, direction l'humain.

Le service est une API **FastAPI** (`/triage`, `/health`, `/stats`). Un journal d'audit **SQLite** garde une trace de chaque décision en ne stockant que des empreintes **SHA-256**, jamais le texte des clients.

## Les résultats (jeu de test, évalué une seule fois)

- **58,94 %** des messages traités automatiquement…
- … avec **99,14 %** de précision (intervalle de confiance à 95 % : 98,42–99,58 %).
- **0 sur 156** demandes liées à la fraude traitées automatiquement.
- Latence : **23,7 ms** en médiane, **47,6 ms** au 95ᵉ centile.
- **33 tests** automatisés (pytest).

## Ce que j'en retiens

J'avais fixé un objectif de 99,4 % de précision sur la validation : le test donne 99,14 %, l'objectif est **manqué** et je le dis. Zéro fraude manquée sur 156 est aussi une preuve **faible** : avec un vrai taux d'erreur de 0,41 %, ce résultat arriverait environ une fois sur deux par hasard. Mesurer honnêtement, c'est aussi chiffrer ce qu'on ne sait pas.
