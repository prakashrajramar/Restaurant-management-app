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
    const checkStandalone = () => {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;

      setInstalled(isStandalone);
    };

    checkStandalone();

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener(
      'beforeinstallprompt',
      handleBeforeInstallPrompt
    );
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (installPrompt) {
      await installPrompt.prompt();

      const { outcome } = await installPrompt.userChoice;

      if (outcome === 'accepted') {
        setInstalled(true);
      }

      setInstallPrompt(null);
      return;
    }

    alert(
      'Install this Restaurant Management App from your browser menu. In Chrome or Edge, click the Install icon in the address bar or open the browser menu and choose "Install app".'
    );
  };

  if (installed) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-100 text-green-700 border border-green-200 whitespace-nowrap">
        <span className="material-symbols-outlined text-[20px]">
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
      className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary font-bold text-sm shadow-sm hover:bg-primary-container transition-colors whitespace-nowrap"
      title="Install Restaurant Management App"
    >
      <span className="material-symbols-outlined text-[20px]">
        install_mobile
      </span>
      <span>Install App</span>
    </button>
  );
};

export default InstallAppButton;