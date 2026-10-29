import { useEffect, useState, useCallback, useRef } from 'react';
import { NavTab } from '../components/BottomNavBar';
import { feedback } from '../utils/haptics';

interface UseAndroidSystemProps {
  isMiniWindowOpen: boolean;
  onCloseMiniWindow: () => void;
  isQuickDrawerOpen: boolean;
  onCloseQuickDrawer: () => void;
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  onTriggerQuickAdd: () => void;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function useAndroidSystem({
  isMiniWindowOpen,
  onCloseMiniWindow,
  isQuickDrawerOpen,
  onCloseQuickDrawer,
  activeTab,
  onChangeTab,
  onTriggerQuickAdd,
}: UseAndroidSystemProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandaloneAndroid, setIsStandaloneAndroid] = useState(false);
  const [isAndroidDevice, setIsAndroidDevice] = useState(false);
  const hasHistoryPushedRef = useRef(false);

  // Detect Android device & standalone mode
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ua = navigator.userAgent.toLowerCase();
    const isAndroid = /android/.test(ua);
    setIsAndroidDevice(isAndroid);

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandaloneAndroid(isStandalone);

    // Capture Android PWA install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  // Parse Android App Launcher Shortcuts from URL query params
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const action = params.get('action');
    const tab = params.get('tab');

    if (action === 'add') {
      setTimeout(() => onTriggerQuickAdd(), 200);
    } else if (tab === 'tasks' || tab === 'analytics' || tab === 'settings' || tab === 'expenses') {
      onChangeTab(tab as NavTab);
    }
  }, [onTriggerQuickAdd, onChangeTab]);

  // Android System Back Button / Edge Swipe Back Navigation
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const anyModalOpen = isMiniWindowOpen || isQuickDrawerOpen;

    if (anyModalOpen) {
      // Push history state so Android back button closes the modal instead of exiting
      window.history.pushState({ modalOpen: true }, '');
      hasHistoryPushedRef.current = true;
    }

    const handlePopState = () => {
      if (isMiniWindowOpen) {
        feedback.vibrate(15);
        onCloseMiniWindow();
        return;
      }
      if (isQuickDrawerOpen) {
        feedback.vibrate(15);
        onCloseQuickDrawer();
        return;
      }
      if (activeTab !== 'expenses') {
        feedback.vibrate(15);
        onChangeTab('expenses');
        return;
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [
    isMiniWindowOpen,
    isQuickDrawerOpen,
    activeTab,
    onCloseMiniWindow,
    onCloseQuickDrawer,
    onChangeTab,
  ]);

  // Install to Android home screen function
  const installToAndroid = useCallback(async () => {
    if (!deferredPrompt) return false;
    feedback.vibrate([20, 40]);
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsStandaloneAndroid(true);
      return true;
    }
    return false;
  }, [deferredPrompt]);

  return {
    isAndroidDevice,
    isStandaloneAndroid,
    isInstallable: !!deferredPrompt,
    installToAndroid,
  };
}
