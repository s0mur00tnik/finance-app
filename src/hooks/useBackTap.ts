import { useEffect, useRef, useCallback } from 'react';
import { feedback } from '../utils/haptics';

interface UseBackTapOptions {
  enabled: boolean;
  sensitivity: 'low' | 'medium' | 'high';
  onGestureTrigger: () => void;
}

export function useBackTap({ enabled, sensitivity, onGestureTrigger }: UseBackTapOptions) {
  const lastTapTimeRef = useRef<number>(0);
  const tapHistoryRef = useRef<number[]>([]);
  const resetTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Calibrated threshold for physical finger strike on the back casing of phone
  // 'high': 6.5 m/s² (very responsive, detects light finger taps)
  // 'medium': 8.5 m/s² (standard, optimal for Android with cases)
  // 'low': 13.0 m/s² (requires firm physical tap)
  const threshold = sensitivity === 'high' ? 6.5 : sensitivity === 'low' ? 13.0 : 8.5;

  const handlePhysicalTap = useCallback(() => {
    if (!enabled) return;

    const now = Date.now();
    const timeSinceLast = now - lastTapTimeRef.current;
    lastTapTimeRef.current = now;

    // Provide immediate physical tactile feedback so user knows the phone felt the tap
    feedback.vibrate(28);
    feedback.playTapSound();

    if (timeSinceLast > 1100) {
      // First tap of a new sequence
      tapHistoryRef.current = [now];
    } else {
      tapHistoryRef.current.push(now);
      const count = tapHistoryRef.current.length;

      if (count >= 3) {
        // 3 consecutive physical taps detected!
        feedback.vibrate([40, 60, 90]);
        feedback.playGestureSuccessSound();
        tapHistoryRef.current = [];
        onGestureTrigger();
        return;
      }
    }

    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    resetTimerRef.current = setTimeout(() => {
      tapHistoryRef.current = [];
    }, 1100);
  }, [enabled, onGestureTrigger]);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    let prevX = 0;
    let prevY = 0;
    let prevZ = 0;
    let lastSensorEventTime = 0;
    let isInitialized = false;

    // Request permissions if running on WebKit/iOS; on Android Chrome it is granted by default
    const initPermission = async () => {
      if (typeof (DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> })?.requestPermission === 'function') {
        try {
          await (DeviceMotionEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission();
        } catch {
          // Ignored
        }
      }
    };

    window.addEventListener('touchstart', initPermission, { once: true, passive: true });
    window.addEventListener('pointerdown', initPermission, { once: true, passive: true });

    const handleDeviceMotion = (event: DeviceMotionEvent) => {
      const now = Date.now();
      const acc = event.acceleration || event.accelerationIncludingGravity;
      if (!acc) return;

      const x = acc.x ?? 0;
      const y = acc.y ?? 0;
      const z = acc.z ?? 0;

      if (!isInitialized) {
        prevX = x;
        prevY = y;
        prevZ = z;
        isInitialized = true;
        return;
      }

      // Compute 3D impulse shockwave from finger striking device back
      const dx = x - prevX;
      const dy = y - prevY;
      const dz = z - prevZ;
      prevX = x;
      prevY = y;
      prevZ = z;

      // Z-axis is perpendicular to the screen; tapping the back produces a sharp impulse
      const zJolt = Math.abs(dz);
      const totalJerk = Math.sqrt(dx * dx + dy * dy + dz * dz);

      // A physical back tap creates either a sharp Z impulse or overall chassis shock
      const isTapImpulse = zJolt > threshold || totalJerk > (threshold * 1.25);

      // Debounce window: must be at least 110ms apart to prevent a single tap ringing twice
      if (isTapImpulse && now - lastSensorEventTime > 110) {
        lastSensorEventTime = now;
        handlePhysicalTap();
      }
    };

    window.addEventListener('devicemotion', handleDeviceMotion, { passive: true });

    return () => {
      window.removeEventListener('devicemotion', handleDeviceMotion);
      window.removeEventListener('touchstart', initPermission);
      window.removeEventListener('pointerdown', initPermission);
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, [enabled, threshold, handlePhysicalTap]);

  return {
    triggerManually: handlePhysicalTap,
  };
}
