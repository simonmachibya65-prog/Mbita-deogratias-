"use client";

import { useState, useEffect } from "react";
import { SUPPORTED_LOCALES, LOCALE_NAMES, LOCALE_FLAGS, type Locale } from "@/lib/i18n";

export default function LanguageSwitcher() {
  const [locale, setLocale] = useState<Locale>("en");
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("locale") as Locale | null;
    if (stored && SUPPORTED_LOCALES.includes(stored)) {
      setLocale(stored);
      document.documentElement.lang = stored;
    }
  }, []);

  function handleSelect(loc: Locale) {
    setLocale(loc);
    localStorage.setItem("locale", loc);
    document.documentElement.lang = loc;
    setOpen(false);
    window.location.reload();
  }

  if (!mounted) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-label="Change language"
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border text-sm text-navy-700 hover:bg-navy-50 dark:hover:bg-navy-800 dark:text-navy-200 dark:border-navy-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <span aria-hidden="true">{LOCALE_FLAGS[locale]}</span>
        <span className="hidden sm:inline font-medium">{LOCALE_NAMES[locale]}</span>
        <svg
          className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden="true" />

          <ul
            role="listbox"
            aria-label="Select language"
            className="absolute top-full mt-1 right-0 bg-white dark:bg-navy-900 border border-border dark:border-navy-700 rounded-xl shadow-lg overflow-hidden z-50 min-w-[160px]"
          >
            {SUPPORTED_LOCALES.map((loc) => (
              <li key={loc}>
                <button
                  role="option"
                  aria-selected={locale === loc}
                  onClick={() => handleSelect(loc)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-navy-50 dark:hover:bg-navy-800 transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    locale === loc
                      ? "bg-primary-light text-primary font-semibold"
                      : "text-navy-700 dark:text-navy-200"
                  }`}
                >
                  <span className="text-lg" aria-hidden="true">{LOCALE_FLAGS[loc]}</span>
                  <span>{LOCALE_NAMES[loc]}</span>
                  {locale === loc && (
                    <svg className="w-4 h-4 ml-auto text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
