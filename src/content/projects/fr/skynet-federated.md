---
page: skynet-federated
gem: sapphire
lang: fr
title: SkyNet-Federated
kicker: Big Data · Temps réel
summary: Surveillance aérienne en temps réel. Ingestion ADS-B avec Kafka, apprentissage fédéré sur deux nœuds (Maroc, Togo), graphe de trajectoires Neo4j et radar live.
badge: Apprentissage fédéré
tags: [Kafka, Federated Learning, Neo4j, Streamlit]
github: https://github.com/Angeraiyane/SkyNet-Federated
featured: true
order: 2
plane: true
---

## Le problème

Des milliers d'avions émettent leur position en continu (signaux **ADS-B**). Centraliser toutes ces données pour entraîner un modèle coûte cher en bande passante et pose une question de **souveraineté** : chaque pays veut garder ses données. L'idée : **entraîner le modèle là où sont les données**, et ne partager que ce qu'il a appris.

Projet réalisé dans le cadre du Master AI & Data Computing (FST Béni Mellal).

## L'architecture

1. **Ingestion haute fréquence** : Apache **Kafka** et ZooKeeper reçoivent les positions brutes de l'API OpenSky, avec un facteur de réplication de 3 pour synchroniser les nœuds.
2. **Intelligence en périphérie** : deux clients fédérés simulent deux régions, **FST_BM** (Afrique, Asie, Amériques) et **TOGO** (Europe, Océanie). Chacun entraîne localement un modèle `SGDRegressor` en apprentissage incrémental, au fil de l'eau.
3. **Agrégation** : un serveur central combine les poids des deux modèles, sans jamais voir les données brutes.
4. **Graphe Geo-AI** : **Neo4j** modélise les trajectoires, enrichies par un géocodage inverse hors ligne (Nominatim local).
5. **Supervision** : un tableau de bord **Streamlit** affiche un radar en quasi temps réel, les métriques du modèle et la stabilité du trafic d'un jour sur l'autre.

Trois topics Kafka, chacun avec son broker leader : `flight_data_raw` (Maroc), `model_updates` (Togo), `global_model_results` (cloud central).

## La suite : SkyNet 2.0

- **Anticollision prédictive** : projeter les trajectoires 10 minutes en avance et alerter si deux avions convergent à la même altitude.
- **Détection d'anomalies de flux** : repérer une panne de capteur ou une saturation du réseau.
- **Reprise après panne** : sauvegarder les poids localement pour qu'un nœud redémarre là où il s'était arrêté.
- **Modèles temporels profonds** : remplacer le modèle linéaire par des **LSTM** pour mieux suivre les virages et les attentes en hippodrome.
