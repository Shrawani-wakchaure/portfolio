---
title: Zero-Trust Continuous Behavioral Authentication (AegisTrust)
subtitle: Real-Time ML-Powered Anomaly Detection & Adaptive Policy Decision Point (PDP)
skills: ["Python", "Machine Learning", "Zero Trust (NIST SP 800-207)", "Isolation Forest", "Streamlit", "Risk Scoring Engine", "XAI / Explainable AI", "SIEM"]
banner: https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80
link: https://github.com/Shrawani-wakchaure/zero-trust-behavioral-authentication
---

Enterprise-grade **Zero-Trust Continuous Behavioral Authentication & Anomaly Detection Pipeline (AegisTrust)** engineered to safeguard critical cloud registries, databases, and administrative consoles against credential theft, session hijacking, and insider threats.

Unlike traditional perimeter security that authenticates identity only once at login ($t=0$), AegisTrust continuously monitors and scores post-authentication administrative behavior in real time using an unsupervised **Isolation Forest** model coupled with contextual physics calculations and dynamic risk calculators.

# Architecture & Engineering Highlights

- **NIST SP 800-207 Policy Decision Point (PDP)**: Operates as an asynchronous microsecond-latency security engine evaluating streaming telemetry from API gateways, cloud audit logs, and IAM event streams.
- **Unsupervised Anomaly Detection (Isolation Forest)**: Eliminates dependence on labeled attack datasets. Accurately isolates novel zero-day administrative anomalies, low-and-slow APT data harvesters, and reconnaissance sweeps with **1.0000 ROC-AUC** benchmark discriminative accuracy.
- **Contextual Physics & Impossible Travel Detection**: Computes Haversine great-circle distances and geodesic speeds (>850 km/h) between successive session ingress tokens to detect stolen session cookie replays across geographic regions.
- **Adaptive Multi-Tier Policy Enforcement**:
  - **LOW RISK (0–34)**: Uninterrupted, zero-friction access.
  - **MEDIUM RISK (35–64)**: Triggers instant **Step-Up Authentication Challenge** (TOTP / FIDO2 re-verification) allowing legitimate on-call staff to proceed without lockout.
  - **HIGH RISK (65–100)**: Immediate session revocation, credential quarantine, and SIEM alerting.
- **Explainable AI (XAI)**: Generates real-time Z-score deviation metrics and attribute contribution charts for SOC analysts and compliance auditors.
- **Interactive Security Operations Center (SOC)**: Built with **Streamlit** and **Plotly**, featuring live attack simulators, global geo-ingress maps, telemetry diagnostics, and real-time structured SIEM event feeds.
