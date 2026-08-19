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

  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed as a PWA
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setInstalled(true);
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener(
      'beforeinstallprompt',
      handleBeforeInstallPrompt
    );

    window.addEventListener('appinstalled', () => {
      setInstalled(true);
      setInstallPrompt(null);
    });

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstall = async () => {
    // Browser provided the install prompt
    if (installPrompt) {
      await installPrompt.prompt();

      const { outcome } = await installPrompt.userChoice;

      if (outcome === 'accepted') {
        setInstalled(true);
      }

      setInstallPrompt(null);
      return;
    }

    // No browser prompt available
    alert(
      'To install this app, open your browser menu and select "Install App" or "Add to Home screen".'
    );
  };

  // Don't show button after app is installed
  if (installed) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-100 text-green-700 border border-green-200">
        <span className="material-symbols-outlined text-[18px]">
          check_circle
        </span>
        <span className="text-sm font-bold">App Installed</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleInstall}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary font-bold text-sm shadow-sm hover:bg-primary-container transition-colors whitespace-nowrap"
      title="Install Restaurant Management App"
    >
      <span className="material-symbols-outlined text-[20px]">
        install_mobile
      </span>

      <span className="hidden sm:inline">
        Install App
      </span>
    </button>
  );
};

export default InstallAppButton;