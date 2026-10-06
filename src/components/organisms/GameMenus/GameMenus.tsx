import React, { useEffect, useRef } from 'react';
import { useTranslation } from '@context/LanguageContext';
import { useSound } from '@/context/SoundContext';
import logoGame from '@assets/images/game/PortfolioWebXP.png';
import logoGameWebP from '@assets/images/game/PortfolioWebXP.webp';
import iconEmail from '@assets/icons/socials_email-Sheet.png';
import iconGithub from '@assets/icons/socials_github-Sheet.png';
import iconLinkedin from '@assets/icons/socials_linkedin-Sheet.png';
import './GameMenus.css';

interface MenuProps {
  onStart: () => void;
}

export const StartMenu: React.FC<MenuProps> = ({
  onStart,
}) => {
  const { t } = useTranslation();
  const { playSfx } = useSound();

  useEffect(() => {
    playSfx('game_menu_in');
    return () => {
      playSfx('game_menu_out');
    };
  }, [playSfx]);

  const containerRef = useRef<HTMLDivElement>(null);

  const [canStart, setCanStart] = React.useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCanStart(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!canStart) return;

    const handleStart = (event: KeyboardEvent | MouseEvent) => {
      const activeElement = document.activeElement as HTMLElement;

      const interactiveTags = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'];
      if (activeElement && interactiveTags.includes(activeElement.tagName)) return;

      if (event instanceof KeyboardEvent) {
        const ignoredKeys = ['Tab', 'Shift', 'Escape', 'Alt', 'Control', 'Meta'];
        if (ignoredKeys.includes(event.key)) return;
      }

      onStart();
      playSfx('game_confirm');
    };

    window.addEventListener('keydown', handleStart);
    window.addEventListener('click', handleStart);

    return () => {
      window.removeEventListener('keydown', handleStart);
      window.removeEventListener('click', handleStart);
    };
  }, [onStart, canStart]);

  return (
    <main
      ref={containerRef}
      className="game-menu game-menu--start"
      role="dialog"
      aria-modal="true"
      aria-labelledby="start-title"
    >
      <section className="game-menu__header">
        <picture>
          <source srcSet={logoGameWebP} type="image/webp" />
          <img
            src={logoGame}
            alt={t('game_menu_logo_alt')}
            width={550}
            height={225}
            className="game-menu__logo"
          />
        </picture>

        <button
          id="start-title"
          type="button"
          onClick={() => {
            playSfx('game_confirm');
            onStart();
          }}
          className="game-menu__start-btn game-menu__title-text"
        >
          {t('start_prompt')}
        </button>

        <footer className='game-menu__footer'>
          <ul>
            <li>
              <a
                href="mailto:shrawaniwakchaure09@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                title={t('social_email')}
                aria-label={t('social_email')}
                className="game-menu__social-link"
              >
                <div
                  className="game-menu__social-sprite"
                  style={{ backgroundImage: `url(${iconEmail})` }}
                />
              </a>
            </li>
            <li>
              <a
                href="https://www.linkedin.com/in/shrawani-wakchaure"
                target="_blank"
                rel="noopener noreferrer"
                title={t('social_linkedin')}
                aria-label={t('social_linkedin')}
                className="game-menu__social-link"
              >
                <div
                  className="game-menu__social-sprite"
                  style={{ backgroundImage: `url(${iconLinkedin})` }}
                />
              </a>
            </li>
            <li>
              <a
                href="https://github.com/Shrawani-wakchaure"
                target="_blank"
                rel="noopener noreferrer"
                title={t('social_github')}
                aria-label={t('social_github')}
                className="game-menu__social-link"
              >
                <div
                  className="game-menu__social-sprite"
                  style={{ backgroundImage: `url(${iconGithub})` }}
                />
              </a>
            </li>
          </ul>
        </footer>
        <p className="game-menu__credits-text">{t('credits_developed_by')}</p>
      </section>
    </main>
  );
};
