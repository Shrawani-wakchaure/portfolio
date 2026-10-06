---
title: Autenticación Conductual Continua Zero-Trust (AegisTrust)
subtitle: Detección de Anomalías con Machine Learning y Punto de Decisión de Políticas (PDP)
skills: ["Python", "Machine Learning", "Zero Trust (NIST SP 800-207)", "Isolation Forest", "Streamlit", "Motor de Riesgo", "XAI / Explainable AI", "SIEM"]
banner: https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80
link: https://github.com/Shrawani-wakchaure/zero-trust-behavioral-authentication
---

Pipeline empresarial de **Autenticación Conductual Continua Zero-Trust y Detección de Anomalías (AegisTrust)** diseñado para proteger registros en la nube, bases de datos y consolas administrativas críticas contra robo de credenciales, secuestro de sesión y amenazas internas.

A diferencia de la seguridad perimetral tradicional que solo valida credenciales al iniciar sesión ($t=0$), AegisTrust monitorea y califica el comportamiento administrativo post-autenticación en tiempo real mediante un modelo no supervisado **Isolation Forest** acoplado a cálculo de física contextual y motores de riesgo dinámicos.

# Aspectos Técnicos Destacados

- **Punto de Decisión de Políticas NIST SP 800-207 (PDP)**: Funciona como un motor de seguridad asíncrono de baja latencia que evalúa telemetría de gateways API, registros de auditoría cloud y flujos IAM.
- **Detección de Anomalías No Supervisada (Isolation Forest)**: Aísla anomalías administrativas de día cero y ataques APT sigilosos sin requerir conjuntos de datos etiquetados, alcanzando una precisión benchmark de **1.0000 ROC-AUC**.
- **Física Contextual y Detección de Viaje Imposible**: Calcula distancias Haversine y velocidades geodésicas (>850 km/h) entre tokens de sesión para detectar reutilización de cookies robadas en diferentes regiones del mundo.
- **Aplicación de Políticas Adaptativas Multinivel**:
  - **RIESGO BAJO (0–34)**: Acceso transparente y sin fricción.
  - **RIESGO MEDIO (35–64)**: Desafío de autenticación Step-Up inmediato (TOTP / FIDO2) permitiendo a administradores legítimos verificar su identidad sin ser bloqueados.
  - **RIESGO ALTO (65–100)**: Revocación inmediata de sesión, cuarentena de IP y alertas automáticas a SIEM.
- **IA Explicable (XAI)**: Generación de desviaciones de puntuación Z y gráficos de contribución de atributos para analistas SOC y auditores.
- **Centro de Operaciones de Seguridad Interactivo (SOC)**: Desarrollado con **Streamlit** y **Plotly**, integrando simuladores de ataques en vivo, mapas de ingreso geoespaciales y registros SIEM estructurados.
