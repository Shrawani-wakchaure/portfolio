---
title: Autenticação Comportamental Contínua Zero-Trust (AegisTrust)
subtitle: Detecção de Anomalias com Machine Learning e Ponto de Decisão de Políticas (PDP)
skills: ["Python", "Machine Learning", "Zero Trust (NIST SP 800-207)", "Isolation Forest", "Streamlit", "Motor de Risco", "XAI / Explainable AI", "SIEM"]
banner: https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80
link: https://github.com/Shrawani-wakchaure/zero-trust-behavioral-authentication
---

Pipeline empresarial de **Autenticação Comportamental Contínua Zero-Trust e Detecção de Anomalias (AegisTrust)** desenvolvido para proteger registros em nuvem, bancos de dados e consoles administrativos críticos contra roubo de credenciais, sequestro de sessão e ameaças internas.

Diferente da segurança perimetral clássica que valida credenciais apenas no login ($t=0$), o AegisTrust monitora e pontua continuamente o comportamento administrativo pós-autenticação em tempo real utilizando um modelo não supervisionado **Isolation Forest** aliado a cálculos de física contextual e motores de risco dinâmicos.

# Destaques de Engenharia

- **Ponto de Decisão de Políticas NIST SP 800-207 (PDP)**: Atua como motor de segurança assíncrono de latência na faixa de microssegundos, avaliando telemetria de API gateways, logs de auditoria e fluxos IAM.
- **Detecção de Anomalias Não Supervisionada (Isolation Forest)**: Isola anomalias administrativas de dia zero e varreduras APT sem depender de bases de dados rotuladas, alcançando precisão benchmark de **1.0000 ROC-AUC**.
- **Física Contextual e Detecção de Viagem Impossível**: Calcula distâncias geodésicas de Haversine e velocidades (>850 km/h) entre tokens de sessão sucessivos para detectar sequestro de cookies em regiões geográficas distantes.
- **Aplicação Adaptativa de Políticas em Camadas**:
  - **BAIXO RISCO (0–34)**: Acesso contínuo sem fricção.
  - **MÉDIO RISCO (35–64)**: Desafio de autenticação Step-Up instantâneo (reautenticação TOTP / FIDO2) permitindo que administradores legítimos confirmem sua identidade sem bloqueio.
  - **ALTO RISCO (65–100)**: Revogação imediata de sessão, quarentena de IP e emissão de alertas SIEM.
- **IA Explicável (XAI)**: Geração de desvios Z-score e gráficos de contribuição de atributos para analistas SOC e auditores de conformidade.
- **Centro de Operações de Segurança Interativo (SOC)**: Construído com **Streamlit** e **Plotly**, com simuladores de ataque ao vivo, mapas globais de tráfego e telemetria estruturada para SIEM.
