import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

export const SEO: React.FC = () => {
    const { t, i18n } = useTranslation();

    const personSchema = {
        "@context": "https://schema.org",
        "@type": "ProfilePage",
        "mainEntity": {
            "@type": "Person",
            "name": "Shrawani Wakchaure",
            "alternateName": "Shrawani",
            "jobTitle": "Cyber Security & Full-Stack Software Engineer",
            "image": "/avatar.png",
            "url": "https://github.com/Shrawani-wakchaure",
            "sameAs": [
                "https://www.linkedin.com/in/shrawani-wakchaure",
                "https://github.com/Shrawani-wakchaure"
            ],
            "description": t('seo_description'),
            "knowsAbout": [
                "Cyber Security",
                "Payload Encryption (AES-256)",
                "Full-Stack Development",
                "Angular",
                "Spring Boot",
                "Python",
                "Machine Learning (Isolation Forest)",
                "Time Series Analysis (AR Models)",
                "Digital Forensics",
                "Blockchain Security",
                "SIEM Monitoring",
                "RESTful API Design",
                "MySQL",
                "Java",
                "TypeScript",
                "Network Security"
            ]
        }
    };

    return (
        <Helmet>
            <html lang={i18n.language || 'en'} />
            <title>{t('app_title', 'Retro Cyber Security & Software Engineer Portfolio | Shrawani Wakchaure')}</title>
            <meta name="description" content={t('seo_description')} />
            <meta name="keywords" content="retro portfolio, Windows 95, PlayStation 2, cyber security, software engineer, angular, spring boot, python" />

            {/* Social Media Banner */}
            <meta property="og:image" content="/avatar.png" />
            <meta property="twitter:image" content="/avatar.png" />

            <script type="application/ld+json">
                {JSON.stringify(personSchema)}
            </script>
        </Helmet>
    );
};
