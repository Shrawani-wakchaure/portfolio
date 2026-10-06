---
title: AES-256 REST API Payload Encryption & Security Gateway
subtitle: End-to-End Cryptographic Security Gateway for Angular & Spring Boot
skills: ["Angular", "Spring Boot", "AES-256", "HTTP Interceptors", "Java", "TypeScript", "REST Security", "Insomnia"]
banner: https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80
link: https://github.com/Shrawani-wakchaure
---

Production-grade cryptographic security system developed at **Asmita Solutions** to enforce **end-to-end AES payload encryption** across REST API communication between an Angular client and Spring Boot microservices.

# Engineering Highlights

- **Dual-Layer Payload Cryptography**: Engineered frontend Angular encryption services and custom HTTP interceptors to transparently encrypt request payloads and decrypt response packets.
- **Backend Decryption & Security Filters**: Implemented Spring Boot filter chains that intercept encrypted payloads, validate cryptographic authenticity, and safely decrypt data into strongly-typed DTOs.
- **API Surface Hardening**: Redesigned API endpoints to eliminate exposed numerical and UUID identifiers from URLs and query parameters, embedding sensitive parameters inside encrypted request bodies.
- **XSS & CSRF Mitigation**: Hardened the entire data flow against eavesdropping, MITM attacks, parameter tampering, and cross-site scripting vulnerabilities.
- **Automated Validation**: Tested, debugged, and profiled using **Insomnia** and integration test suites to ensure zero regression in application performance.
