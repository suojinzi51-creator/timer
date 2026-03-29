'use client';

import { useState, useRef, useEffect } from 'react';
import { useAppContext } from './providers';

export default function Home() {
  const { t, lang, toggleLang, theme, toggleTheme } = useAppContext();
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 这里修复了 TS 报错
  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (isRunning) return;
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
  };

  const handlePause = () => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleReset = () => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSeconds(0);
  };

  const playAlarm = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  const handleFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: theme === 'light' ? '#fff' : '#111',
      color: theme === 'light' ? '#000' : '#fff',
      fontSize: 24,
      padding: 20,
      gap: 16
    }}>
      <audio ref={audioRef} src="/alarm.mp3" preload="auto" />
      <div style={{ fontSize: 60, fontWeight: 'bold', letterSpacing: 4 }}>{formatTime(seconds)}</div>
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={handleStart} style={{ padding: '10px 20px', fontSize: 18 }}>{t.start}</button>
        <button onClick={handlePause} style={{ padding: '10px 20px', fontSize: 18 }}>{t.pause}</button>
        <button onClick={handleReset} style={{ padding: '10px 20px', fontSize: 18 }}>{t.reset}</button>
        <button onClick={playAlarm} style={{ padding: '10px 20px', fontSize: 18 }}>{t.alarm}</button>
        <button onClick={handleFullscreen} style={{ padding: '10px 20px', fontSize: 18 }}>{t.fullscreen}</button>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        <button onClick={toggleLang} style={{ padding: '8px 16px' }}>{lang === 'zh' ? '中文' : 'EN'}</button>
        <button onClick={toggleTheme} style={{ padding: '8px 16px' }}>{theme === 'light' ? '🌞 Light' : '🌙 Dark'}</button>
      </div>
    </div>
  );
}
