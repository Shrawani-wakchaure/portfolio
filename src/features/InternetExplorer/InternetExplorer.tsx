import { useEffect, useState } from 'react';
import { WinButton } from '@atoms/WinButton/WinButton';
import { useTranslation } from '@context/LanguageContext';
import iconArrowLeft from 'pixelarticons/svg/arrow-left.svg';
import iconArrowRight from 'pixelarticons/svg/arrow-right.svg';
import iconClose from 'pixelarticons/svg/close.svg';
import iconReload from 'pixelarticons/svg/reload.svg';
import iconHome from 'pixelarticons/svg/home.svg';
import iconSearch from 'pixelarticons/svg/search.svg';
import { IconRenderer } from '@atoms/IconRenderer/IconRenderer';

import './InternetExplorer.css';

export const InternetExplorer = () => {
  const { t } = useTranslation();
  const FAKE_URL = 'https://github.com/Shrawani-wakchaure';

  const [inputUrl, setInputUrl] = useState(FAKE_URL);
  const [loading, setLoading] = useState(true);

  const skills = [
    t('skill_html'),
    t('skill_js'),
    t('skill_react'),
    t('skill_a11y'),
    t('skill_perf'),
  ];

  const projects = [
    {
      id: 1,
      title: 'Smart City IoT Cyber Threat Monitoring Platform',
      description: '4-layer security framework, Isolation Forest ML model, and Blockchain SIEM for urban IoT telemetry.',
      url: 'https://github.com/Shrawani-wakchaure/traffic-flow',
    },
    {
      id: 2,
      title: 'AES-256 REST API Payload Encryption',
      description: 'End-to-End Cryptographic Security Gateway with custom Angular interceptors and Spring Boot filters.',
      url: 'https://github.com/Shrawani-wakchaure',
    },
    {
      id: 3,
      title: 'Person Onboarding Enterprise Application',
      description: 'Full-stack enterprise application with role-based access control, MySQL, and RESTful APIs.',
      url: 'https://github.com/Shrawani-wakchaure/simple_webapp',
    },
    {
      id: 4,
      title: 'AutoRegressive Time-Series Anomaly Pipeline',
      description: 'Exploratory data analysis, AR forecasting models, and outlier detection with pandas & matplotlib.',
      url: 'https://github.com/Shrawani-wakchaure/basic-python',
    },
  ];

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  const simulateNavigation = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setLoading(true);
    setInputUrl(FAKE_URL);

    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="ie-root">

      <div className="ie-toolbar">
        <WinButton className="ie-toolbar-btn" title={t('ie_back')}>
          <IconRenderer icon={iconArrowLeft} size={16} />
        </WinButton>

        <WinButton className="ie-toolbar-btn" title={t('ie_forward')}>
          <IconRenderer icon={iconArrowRight} size={16} />
        </WinButton>

        <WinButton className="ie-toolbar-btn" title={t('ie_stop')}>
          <IconRenderer icon={iconClose} size={16} />
        </WinButton>

        <WinButton
          className="ie-toolbar-btn"
          title={t('ie_refresh')}
          onClick={simulateNavigation}
        >
          <IconRenderer icon={iconReload} size={16} />
        </WinButton>

        <WinButton
          className="ie-toolbar-btn"
          title={t('ie_home')}
          onClick={simulateNavigation}
        >
          <IconRenderer icon={iconHome} size={16} />
        </WinButton>

        <div className="ie-toolbar-divider" />

        <WinButton className="ie-toolbar-btn" title={t('ie_search')}>
          <IconRenderer icon={iconSearch} size={16} />
        </WinButton>
      </div>


      <div className="ie-address-bar">
        <label htmlFor="ie-address-input" className="ie-address-label">{t('address_label')}</label>
        <form onSubmit={simulateNavigation} className="ie-address-form">
          <input
            id="ie-address-input"
            name="url"
            type="text"
            className="ie-address-input"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            maxLength={2048}
          />
        </form>
      </div>

      <div className="ie-content">
        {loading && (
          <div className="ie-loading-overlay">
            <div className="ie-loading-box">
              <p>{t('loading_contacting')}</p>
            </div>
          </div>
        )}

        {!loading && (
          <section>
            <div className="ie-page-container">
              <div className="ie-page-header">
                <span className="ie-page-welcome">{t('welcome_to')}</span>
                <h1 className="ie-page-title">
                  Shrawani Wakchaure
                </h1>
                <p className="ie-page-subtitle">{t('frontend_portfolio')}</p>
              </div>

              <div className="ie-page-nav">
                <a href="#summary" className="ie-nav-link">
                  {t('resume_summary_title')}
                </a>
                <a href="#experience" className="ie-nav-link">
                  {t('resume_exp_title')}
                </a>
                <a href="#education" className="ie-nav-link">
                  {t('resume_edu_title')}
                </a>
                <a href="#contact" className="ie-nav-link">
                  {t('contact')}
                </a>
              </div>

              <div id="summary" className="ie-section-box">
                <h2 className="ie-section-title">{t('resume_summary_title')}</h2>
                <p className="ie-page-text">
                  {t('resume_summary_content')}
                </p>
              </div>

              <div id="experience" className="ie-section-box">
                <h2 className="ie-section-title">{t('resume_exp_title')}</h2>

                <div className="ie-resume-item">
                  <h3 className="ie-resume-role">{t('resume_exp_job1_role')}</h3>
                  <p className="ie-resume-company">{t('resume_exp_job1_company')}</p>
                  <p className="ie-resume-desc">{t('resume_exp_job1_desc')}</p>
                </div>

                <div className="ie-resume-item">
                  <h3 className="ie-resume-role">{t('resume_exp_job2_role')}</h3>
                  <p className="ie-resume-company">{t('resume_exp_job2_company')}</p>
                  <p className="ie-resume-desc">{t('resume_exp_job2_desc')}</p>
                </div>

                <div className="ie-resume-item">
                  <h3 className="ie-resume-role">{t('resume_exp_job3_role')}</h3>
                  <p className="ie-resume-company">{t('resume_exp_job3_company')}</p>
                  <p className="ie-resume-desc">{t('resume_exp_job3_desc')}</p>
                </div>
              </div>

              <div id="education" className="ie-section-box">
                <h2 className="ie-section-title">{t('resume_edu_title')}</h2>

                <div className="ie-resume-item">
                  <h3 className="ie-resume-role">{t('resume_edu_college1_course')}</h3>
                  <p className="ie-resume-company">{t('resume_edu_college1_name')} | {t('resume_edu_college1_date')}</p>
                  <p className="ie-resume-desc">{t('resume_edu_college1_desc')}</p>
                </div>

                <div className="ie-resume-item">
                  <h3 className="ie-resume-role">{t('resume_edu_college2_course')}</h3>
                  <p className="ie-resume-company">{t('resume_edu_college2_name')} | {t('resume_edu_college2_date')}</p>
                  <p className="ie-resume-desc">{t('resume_edu_college2_desc')}</p>
                </div>
              </div>


              <div id="volunteering" className="ie-section-box">
                <h2 className="ie-section-title">{t('resume_vol_title')}</h2>
                <div className="ie-resume-item">
                  <h3 className="ie-resume-role">{t('resume_vol_role')}</h3>
                  <p className="ie-resume-company">{t('resume_vol_org')}</p>
                  <p className="ie-resume-desc">{t('resume_vol_desc')}</p>
                </div>
              </div>

              <div id="contact" className="ie-section-box ie-page-text">
                <h2 className="ie-section-title">{t('contact')}</h2>
                <p>
                  {t('label_email')}: <a href="mailto:shrawaniwakchaure09@gmail.com" className="ie-nav-link">shrawaniwakchaure09@gmail.com</a>
                </p>
                <p>
                  Phone: <a href="tel:+919168622662" className="ie-nav-link">+91 9168622662</a>
                </p>
                <p>
                  Linkedin: <a href="https://www.linkedin.com/in/shrawani-wakchaure" className="ie-nav-link" target="_blank" rel="noopener noreferrer">linkedin.com/in/shrawani-wakchaure</a>
                </p>
                <p>
                  GitHub: <a href="https://github.com/Shrawani-wakchaure" className="ie-nav-link" target="_blank" rel="noopener noreferrer">github.com/Shrawani-wakchaure</a>
                </p>

              </div>


              <div className="ie-footer">
                {t('ie_footer_copy')}
              </div>
            </div>
          </section>
        )}
      </div>


      <div className="ie-status-bar">
        {loading ? t('status_opening') : t('status_done')}
      </div>
    </div>
  );
};
