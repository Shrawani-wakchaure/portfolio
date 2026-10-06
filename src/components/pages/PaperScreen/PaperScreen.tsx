import { useEffect, useRef } from 'react';
import './PaperScreen.css';
import { useTranslation } from '@/context/LanguageContext';

export function PaperFold() {
    const { t } = useTranslation();
    const paperRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (paperRef.current) {
            paperRef.current.focus();
        }
    }, []);

    return (
        <main className="paper-wrapper">
            <article
                ref={paperRef}
                className="paper-fold outline-none"
                aria-label="Curriculum"
                tabIndex={-1}
            >
                <div className="paper-lines">
                    <section
                        className="paper-text"
                        spellCheck={false}
                    >
                        <h1 className="paper-title">
                            Shrawani Wakchaure
                        </h1>
                        <p className="paper-intro font-bold text-gray-700">
                            {t('paper_text_intro')}
                        </p>
                        <p className="paper-contact-text text-sm mb-4">
                            shrawaniwakchaure09@gmail.com | +91 9168622662 | Pune, India
                        </p>

                        <div className="paper-section">
                            <h2 className="paper-section-title">{t('resume_summary_title')}</h2>
                            <p className="paper-section-content">
                                {t('resume_summary_content')}
                            </p>
                        </div>

                        <div className="paper-section">
                            <h2 className="paper-section-title">{t('skills')}</h2>
                            <div className="paper-item text-sm">
                                <p className="paper-description"><strong>Languages:</strong> Python, C, JavaScript, HTML/CSS</p>
                                <p className="paper-description"><strong>Frameworks & Tools:</strong> Angular, Spring Boot, MySQL, Git, Insomnia (API testing)</p>
                                <p className="paper-description"><strong>Security:</strong> AES-256 Payload Encryption, XSS/CSRF Mitigation, Digital Forensics (FTK Imager, PEiD), Network Security</p>
                                <p className="paper-description"><strong>Data & ML:</strong> EDA, Regression Models, Time Series Analysis, AR Models, Isolation Forest, pandas, matplotlib, seaborn</p>
                                <p className="paper-description"><strong>Concepts:</strong> RESTful API Design, Software Design Patterns, Data Structures & Algorithms, Secure Software Development</p>
                            </div>
                        </div>

                        <div className="paper-section">
                            <h2 className="paper-section-title">{t('resume_exp_title')}</h2>
                            <div className="paper-item">
                                <h3 className="paper-role">{t('resume_exp_job1_role')}</h3>
                                <p className="paper-company">{t('resume_exp_job1_company')}</p>
                                <p className="paper-description">{t('resume_exp_job1_desc')}</p>
                            </div>
                            <div className="paper-item">
                                <h3 className="paper-role">{t('resume_exp_job2_role')}</h3>
                                <p className="paper-company">{t('resume_exp_job2_company')}</p>
                                <p className="paper-description">{t('resume_exp_job2_desc')}</p>
                            </div>
                            <div className="paper-item">
                                <h3 className="paper-role">{t('resume_exp_job3_role')}</h3>
                                <p className="paper-company">{t('resume_exp_job3_company')}</p>
                                <p className="paper-description">{t('resume_exp_job3_desc')}</p>
                            </div>
                        </div>

                        <div className="paper-section">
                            <h2 className="paper-section-title">{t('projects')}</h2>
                            <div className="paper-item">
                                <h3 className="paper-role">Zero-Trust Continuous Behavioral Authentication (AegisTrust)</h3>
                                <p className="paper-company">
                                    <a href="https://github.com/Shrawani-wakchaure/zero-trust-behavioral-authentication" target="_blank" rel="noopener noreferrer" className="paper-link">
                                        GitHub: Shrawani-wakchaure/zero-trust-behavioral-authentication
                                    </a> | 2026
                                </p>
                                <p className="paper-description">
                                    • Engineered an unsupervised Isolation Forest ML pipeline to continuously evaluate and score administrative sessions, achieving 1.0000 ROC-AUC benchmark anomaly detection.<br />
                                    • Implemented a NIST SP 800-207 Policy Decision Point (PDP) computing Haversine distances and geodesic velocities (&gt;850 km/h) to flag stolen session cookie replays.<br />
                                    • Architected an adaptive policy engine delivering low-friction normal access, automated Step-Up MFA re-verification for medium risk, and instant session revocation for high-risk vectors.<br />
                                    • Deployed an interactive Streamlit SOC dashboard with real-time attack simulation, geographical ingress tracking, and structured SIEM event logging.
                                </p>
                            </div>
                            <div className="paper-item mt-4">
                                <h3 className="paper-role">Smart City IoT Cyber Threat Monitoring Platform [In Progress]</h3>
                                <p className="paper-company">Symbiosis Skills and Professional University | 2025 – Present</p>
                                <p className="paper-description">
                                    • Designing a 4-layer cybersecurity framework (Perception, Communication, Processing, Security) for smart city IoT traffic infrastructure, simulating DDoS, spoofing, and malware attacks.<br />
                                    • Implementing an Isolation Forest ML model targeting 85–95% anomaly detection accuracy, assigning risk scores (Low/Medium/High/Critical) to MQTT packets.<br />
                                    • Implementing SHA-256 hashed blockchain-logged security alerts for forensic log integrity, and integrating a SIEM rule engine for continuous automated monitoring.<br />
                                    • Building a real-time Streamlit dashboard to visualize live threat feeds, attack timelines, and risk categorization.
                                </p>
                            </div>
                        </div>

                        <div className="paper-section">
                            <h2 className="paper-section-title">{t('resume_edu_title')}</h2>
                            <div className="paper-education-item">
                                <h3 className="paper-role">{t('resume_edu_college1_course')}</h3>
                                <p className="paper-company">{t('resume_edu_college1_name')} | {t('resume_edu_college1_date')}</p>
                                <p className="paper-description">{t('resume_edu_college1_desc')}</p>
                            </div>
                            <div className="paper-education-item mt-2">
                                <h3 className="paper-role">{t('resume_edu_college2_course')}</h3>
                                <p className="paper-company">{t('resume_edu_college2_name')} | {t('resume_edu_college2_date')}</p>
                                <p className="paper-description">{t('resume_edu_college2_desc')}</p>
                            </div>
                        </div>

                        <div className="paper-section">
                            <h2 className="paper-section-title">Certifications & Courses</h2>
                            <div className="paper-item text-sm">
                                <p className="paper-description">• <strong>Anthropic / ITU:</strong> Claude 101 & AI Fluency – Framework & Foundations; AI Governance Fundamentals & Introduction to AI Governance</p>
                                <p className="paper-description">• <strong>NASA Open Science 101:</strong> Completion Badge</p>
                                <p className="paper-description">• <strong>Corizo / SWAYAM (NPTEL):</strong> Blockchain Technology, Web Development, UI/UX Design; Soft Skills Development</p>
                            </div>
                        </div>

                        <div className="paper-section">
                            <h2 className="paper-section-title">{t('contact')}</h2>
                            <p className="paper-contact-text">
                                Email: <a href="mailto:shrawaniwakchaure09@gmail.com" className="paper-link" target="_blank" rel="noopener noreferrer">shrawaniwakchaure09@gmail.com</a>
                            </p>
                            <p className="paper-contact-text">
                                Phone: <a href="tel:+919168622662" className="paper-link">+91 9168622662</a>
                            </p>
                            <p className="paper-contact-text">
                                LinkedIn: <a href="https://www.linkedin.com/in/shrawani-wakchaure" className="paper-link" target="_blank" rel="noopener noreferrer">linkedin.com/in/shrawani-wakchaure</a>
                            </p>
                            <p className="paper-contact-text">
                                Github: <a href="https://github.com/Shrawani-wakchaure" className="paper-link" target="_blank" rel="noopener noreferrer">github.com/Shrawani-wakchaure</a>
                            </p>
                        </div>

                    </section>
                </div>

                <span className="paper-hole hole-top" aria-hidden="true" />
                <span className="paper-hole hole-middle" aria-hidden="true" />
                <span className="paper-hole hole-bottom" aria-hidden="true" />
            </article>
        </main>
    );
}
