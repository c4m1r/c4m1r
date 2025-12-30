import { useEffect, useState } from 'react';
import './xp.css';

interface WelcomeScreenProps {
  onComplete: () => void;
}

export function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setFadeIn(true);
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="welcome-screen-xp">
      <div className="welcome-screen__gradient">
        <div className="welcome-screen__line-top" />
        <div className="welcome-screen__line-bottom" />

        <span
          className="welcome-screen__title"
          style={{
            opacity: fadeIn ? 1 : 0,
            transition: 'opacity 500ms linear'
          }}
        >
          welcome
        </span>
      </div>
    </div>
  );
}

