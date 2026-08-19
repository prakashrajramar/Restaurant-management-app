import React, { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}

const InstallAppButton: React.FC = () => {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();

      setInstallPrompt(
        event as BeforeInstallPromptEvent
      );
    };

    window.addEventListener(
      'beforeinstallprompt',
      handleBeforeInstallPrompt
    );

    // Check if already installed
    const checkInstalled = () => {
      const standalone =
        window.matchMedia(
          '(display-mode: standalone)'
        ).matches ||
        (window.navigator as any).standalone === true;

      setIsInstalled(standalone);
    };

    checkInstalled();

    window.addEventListener(
      'appinstalled',
      () => {
        setIsInstalled(true);
        setInstallPrompt(null);
      }
    );

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;

    await installPrompt.prompt();

    const choice = await installPrompt.userChoice;

    if (choice.outcome === 'accepted') {
      setIsInstalled(true);
    }

    setInstallPrompt(null);
  };

  // Don't show if already installed
  if (isInstalled) {
    return null;
  }

  // Browser doesn't currently support the install prompt
  if (!installPrompt) {
    return null;
  }

  return (
    <button
      onClick={handleInstall}
      className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-on-primary shadow-sm transition hover:opacity-90"
      title="Install Restaurant Management App"
    >
      <span className="material-symbols-outlined text-lg">
        install_mobile
      </span>

      <span className="hidden sm:inline">
        Install App
      </span>
    </button>
  );
};

export default InstallAppButton;