/**
 * Web Notification & Audio Synth Helper for QuantumFlow Tasks
 */

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.warn('Trình duyệt của bạn không hỗ trợ Web Notification.');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const getNotificationPermissionState = (): NotificationPermission | 'unsupported' => {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
};

// Play a soft, pleasant 2-tone notification chime sound using Web Audio API
export const playNotificationChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'sine';

    // Tone 1: E5 (659.25Hz), Tone 2: A5 (880Hz)
    osc1.frequency.setValueAtTime(659.25, now);
    osc1.frequency.setValueAtTime(880, now + 0.15);

    osc2.frequency.setValueAtTime(1318.5, now);
    osc2.frequency.setValueAtTime(1760, now + 0.15);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.6);
    osc2.stop(now + 0.6);
  } catch (err) {
    console.error('Không thể phát âm thanh thông báo:', err);
  }
};

export const sendBrowserNotification = (title: string, options?: NotificationOptions) => {
  playNotificationChime();

  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      const notification = new Notification(title, {
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        ...options,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (err) {
      console.error('Lỗi khi phát thông báo trình duyệt:', err);
    }
  }
};
