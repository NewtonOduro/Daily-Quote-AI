/**
 * popup.jsx
 * ------------------------------------------------------------------
 * Plasmo popup entry point. Renders the 400x600 popup shell with a
 * tabbed navigation between Home, Favorites, History, Statistics and
 * Settings. Lazy-loads heavy pages (Statistics, Settings) via Suspense.
 */
import { lazy, Suspense, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./styles/globals.css";
import QuoteAppProvider, { useQuoteApp } from "./context/QuoteContext";
import BackgroundEffects from "./components/BackgroundEffects";
import ToastManager from "./components/Toast";
import Home from "./pages/Home";
import Favorites from "./pages/Favorites";
import History from "./pages/History";
import { PageSkeleton } from "./components/Skeletons";
import styles from "./popup.module.css";

/** Lazy-load heavy secondary views. */
const Statistics = lazy(() => import("./pages/Statistics"));
const Settings = lazy(() => import("./pages/Settings"));
const AIStudio = lazy(() => import("./pages/AIStudio"));

/** Tab definitions. */
const TABS = [
  { id: "home", label: "Home", icon: "📖" },
  { id: "favorites", label: "Favorites", icon: "💛" },
  { id: "history", label: "History", icon: "🕘" },
  { id: "stats", label: "Stats", icon: "📊" },
  { id: "ai", label: "AI", icon: "✨" },
  { id: "settings", label: "Settings", icon: "⚙️" }
];

/**
 * Main popup shell.
 */
const PopupShell = () => {
  const [activeTab, setActiveTab] = useState("home");
  const { toasts, dismissToast } = useQuoteApp();

  const renderPage = () => {
    switch (activeTab) {
      case "home":
        return <Home />;
      case "favorites":
        return <Favorites />;
      case "history":
        return <History />;
      case "stats":
        return <Statistics />;
      case "ai":
        return <AIStudio />;
      case "settings":
        return <Settings />;
      default:
        return <Home />;
    }
  };

  return (
    <div className={styles.popup}>
      <BackgroundEffects />
      <header className={styles.header}>
        <span className={styles.logo} aria-hidden="true">
          ✨
        </span>
        <span className={styles.title}>Daily Quotes AI</span>
      </header>

      <main className={styles.main}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className={styles.page}
          >
            <Suspense fallback={<PageSkeleton />}>{renderPage()}</Suspense>
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className={styles.nav} aria-label="Primary">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`${styles.tab} ${tab.id === activeTab ? styles.active : ""}`}
            onClick={() => setActiveTab(tab.id)}
            aria-current={tab.id === activeTab ? "page" : undefined}
            aria-label={tab.label}
          >
            <span className={styles.tabIcon} aria-hidden="true">
              {tab.icon}
            </span>
            <span className={styles.tabLabel}>{tab.label}</span>
          </button>
        ))}
      </nav>

      <ToastManager toasts={toasts} onClose={dismissToast} />
    </div>
  );
};

/**
 * Root popup component.
 */
function Popup() {
  return (
    <QuoteAppProvider>
      <PopupShell />
    </QuoteAppProvider>
  );
}

export default Popup;
