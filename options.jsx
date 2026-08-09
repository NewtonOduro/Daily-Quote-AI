/**
 * options.jsx
 * ------------------------------------------------------------------
 * Plasmo options page entry point. Renders a full-width tabbed dashboard
 * with a 12-column responsive grid. Supports #welcome hash for the
 * onboarding view opened on install.
 */
import { lazy, Suspense, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./styles/globals.css";
import QuoteAppProvider, { useQuoteApp } from "./context/QuoteContext";
import BackgroundEffects from "./components/BackgroundEffects";
import ToastManager from "./components/Toast";
import Home from "./pages/Home";
import Favorites from "./pages/Favorites";
import History from "./pages/History";
import { PageSkeleton } from "./components/Skeletons";
import styles from "./options.module.css";

/** Lazy-load heavy secondary views. */
const Statistics = lazy(() => import("./pages/Statistics"));
const Settings = lazy(() => import("./pages/Settings"));
const AIStudio = lazy(() => import("./pages/AIStudio"));

/** Tab definitions for the options grid. */
const TABS = [
  { id: "home", label: "Home", icon: "📖" },
  { id: "favorites", label: "Favorites", icon: "💛" },
  { id: "history", label: "History", icon: "🕘" },
  { id: "stats", label: "Statistics", icon: "📊" },
  { id: "ai", label: "AI Studio", icon: "✨" },
  { id: "settings", label: "Settings", icon: "⚙️" }
];

/**
 * Options dashboard shell.
 */
const OptionsShell = () => {
  const { toasts, dismissToast } = useQuoteApp();
  const [activeTab, setActiveTab] = useState("home");

  /** Handle #welcome hash for onboarding. */
  useEffect(() => {
    if (window.location.hash === "#welcome") {
      setActiveTab("home");
    }
  }, []);

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
    <div className={styles.options}>
      <BackgroundEffects />
      <header className={styles.header}>
        <span className={styles.logo} aria-hidden="true">
          ✨
        </span>
        <div>
          <h1 className={styles.brand}>Daily Quotes AI</h1>
          <p className={styles.tagline}>Your daily dose of inspiration.</p>
        </div>
      </header>

      <nav className={styles.nav} aria-label="Dashboard sections">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`${styles.tab} ${tab.id === activeTab ? styles.active : ""}`}
            onClick={() => setActiveTab(tab.id)}
            aria-current={tab.id === activeTab ? "page" : undefined}
          >
            <span className={styles.tabIcon} aria-hidden="true">
              {tab.icon}
            </span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      <main className={styles.main}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className={styles.page}
          >
            <Suspense fallback={<PageSkeleton />}>{renderPage()}</Suspense>
          </motion.div>
        </AnimatePresence>
      </main>

      <ToastManager toasts={toasts} onClose={dismissToast} />
    </div>
  );
};

/**
 * Root options component.
 */
function Options() {
  return (
    <QuoteAppProvider>
      <OptionsShell />
    </QuoteAppProvider>
  );
}

export default Options;
