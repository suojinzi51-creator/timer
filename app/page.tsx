'use client';
import { useApp } from './providers';
import { useTimer } from '@/hooks/useTimer';
import { useEffect, useRef } from 'react';

export default function Home() {
  const { t, toggleLang, theme, toggleTheme } = useApp();
  const { totalSeconds, isRunning, start, pause, reset, setTotalSeconds } = useTimer();
  const audioRef = useRef(null);

  const formatTime = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2, 0)}:${String(m).padStart(2, 0)}:${String(sec).padStart(2, 0)}`;
  };

  const handleInput = (type, val) => {
    const num = parseInt(val) || 0;
    let newTotal = totalSeconds;
    if (type === 'h') newTotal = num * 3600 + (totalSeconds % 3600);
    if (type === 'm') newTotal = Math.floor(totalSeconds / 3600) * 3600 + num * 60 + (totalSeconds % 60);
    if (type === 's') newTotal = Math.floor(totalSeconds / 60) * 60 + num;
    setTotalSeconds(newTotal);
  };

  // 时间到声音 + 闪烁
  useEffect(() => {
    if (totalSeconds === 0 && isRunning) {
      pause();
      if (audioRef.current) {
        audioRef.current.volume = 1;
        audioRef.current.play().catch(console.log);
        setTimeout(() => audioRef.current?.pause(), 5000);
      }
      document.body.style.animation = "flash 0.5s 4";
      setTimeout(() => document.body.style.animation = "", 2000);
    }
  }, [totalSeconds, isRunning]);

  return (
    <div className="page-wrap">
      <audio ref={audioRef} src="https://cdn.pixabay.com/download/audio/2022/03/15/audio_832c97389b.mp3"></audio>

      <div className="header">
        <h1>{t.title}</h1>
        <div className="tools">
          <button onClick={toggleLang} className="btn-icon">🌐</button>
          <button onClick={toggleTheme} className="btn-icon">{theme === 'dark' ? '☀️' : '🌙'}</button>
        </div>
      </div>

      <div className="time-display">{formatTime(totalSeconds)}</div>

      <div className="inputs">
        <div className="item">
          <input type="number" min="0" max="23" value={Math.floor(totalSeconds / 3600)} onChange={(e) => handleInput('h', e.target.value)} />
          <label>{t.hours}</label>
        </div>
        <div className="item">
          <input type="number" min="0" max="59" value={Math.floor((totalSeconds % 3600) / 60)} onChange={(e) => handleInput('m', e.target.value)} />
          <label>{t.minutes}</label>
        </div>
        <div className="item">
          <input type="number" min="0" max="59" value={totalSeconds % 60} onChange={(e) => handleInput('s', e.target.value)} />
          <label>{t.seconds}</label>
        </div>
      </div>

      <div className="buttons">
        <button className="main" onClick={isRunning ? pause : start}>{isRunning ? t.pause : t.start}</button>
        <button className="sub" onClick={reset}>{t.reset}</button>
      </div>

      <style jsx global>{`
        :root { --bg:#fff; --text:#111; --card:#f7f7f7; --primary:#4f46e5; --border:#e5e7eb; }
        [data-theme="dark"] { --bg:#0f172a; --text:#f1f5f9; --card:#1e293b; --primary:#0ea5e9; --border:#334155; }
        *{margin:0;padding:0;box-sizing:border-box;}
        body{background:var(--bg);color:var(--text);font-family:sans-serif;}
        .page-wrap{width:100vw;min-height:100vh;padding:6vh 8vw;display:flex;flex-direction:column;justify-content:center;gap:30px;}
        .header{display:flex;justify-content:space-between;align-items:center;}
        .btn-icon{width:46px;height:46px;border-radius:12px;border:1px solid var(--border);background:var(--card);color:var(--text);font-size:18px;cursor:pointer;}
        .time-display{text-align:center;font-size:clamp(50px,15vw,130px);font-weight:bold;}
        .inputs{display:flex;gap:12px;}
        .item{flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;}
        input{width:100%;height:70px;border-radius:16px;border:1px solid var(--border);background:var(--card);color:var(--text);text-align:center;font-size:26px;outline:none;}
        .buttons{display:flex;gap:12px;}
        button{flex:1;height:56px;border-radius:16px;font-size:18px;border:none;cursor:pointer;}
        .main{background:var(--primary);color:white;}
        .sub{background:var(--card);color:var(--text);border:1px solid var(--border);}
        @keyframes flash{0%{background:#f44;}50%{background:#b11;}100%{background:#f44;}}
      `}</style>
    </div>
  );
}