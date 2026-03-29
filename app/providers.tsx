'use client';
import { createContext, useContext, useEffect, useState } from 'react';

const translations = {
  en: {
    title: "Focus Timer",
    hours: "Hours",
    minutes: "Minutes",
    seconds: "Seconds",
    start: "Start",
    pause: "Pause",
    reset: "Reset",
  },
  zh: {
    title: "专注计时器",
    hours: "小时",
    minutes: "分钟",
    seconds: "秒",
    start: "开始",
    pause: "暂停",
    reset: "重置",
  },
};

const AppContext = createContext({
  t: translations.en,
  toggleLang: () => {},
  theme: "light",
  toggleTheme: () => {},
});

export function AppProvider({ children }) {
  const [lang, setLang] = useState("en");

  // 自动识别浏览器语言
  useEffect(() => {
    if (navigator.language.startsWith("zh")) {
      setLang("zh");
    }
  }, []);

  // 切换语言
  const toggleLang = () => {
    setLang(lang === "en" ? "zh" : "en");
  };

  // 主题
  const [theme, setTheme] = useState("light");
  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <AppContext.Provider
      value={{
        t: translations[lang],
        toggleLang,
        theme,
        toggleTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);