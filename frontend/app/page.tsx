'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api, UserProfile } from "../lib/api";

const personalHighlights = [
  "Fitness-goal profile with calories, protein, preferences, allergies, and budget",
  "Explainable meal ranking across nutrition, cost, delivery time, taste, and availability",
  "Swiggy Food MCP checkout with cart review, coupon support, and explicit confirmation"
];

const householdHighlights = [
  "Pantry tracking with low-stock alerts and auto-restock to grocery list",
  "\"What can I cook tonight?\" — recipe intelligence from pantry stock, filtered by family dietary needs",
  "Grocery priority grouping with Instamart cart preview (no real checkout yet)"
];

const platformSteps = [
  {
    title: "Understand the context",
    body: "BiteWise separates personal nutrition context from shared household context, then routes the user to the right product."
  },
  {
    title: "Pick the right surface",
    body: "NutriOrder AI handles ready-to-eat meals. SmartPantry AI handles pantry, recipe, and grocery planning."
  },
  {
    title: "Rank and explain",
    body: "Each product explains its reasoning, from meal macro fit to pantry gaps, recipe readiness, and grocery priority."
  },
  {
    title: "Confirm before action",
    body: "Orders stay behind review, safety locks, payment-method checks, and explicit user confirmation."
  }
];

interface SwiggyConfigStatus {
  use_mock_mcp: boolean;
  swiggy_env: string;
  database_connected: boolean;
  encryption_key_configured: boolean;
  client_id_configured: boolean;
  client_secret_configured: boolean;
  redirect_uri_configured: boolean;
}

export default function LandingPage() {
  const [authLoading, setAuthLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [swiggyStatus, setSwiggyStatus] = useState<SwiggyConfigStatus | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [backendOffline, setBackendOffline] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const loadSessionData = async () => {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const err = params.get("auth_error");
        if (err) {
          setMessage("Swiggy login failed. Please try again.");
        }
      }

      try {
        await api.getHealth();
        setBackendOffline(false);
      } catch {
        setBackendOffline(true);
        setSessionLoading(false);
        return;
      }

      try {
        const [prof, status] = await Promise.all([
          api.getProfile(),
          api.getSwiggyStatus()
        ]);
        setUserProfile(prof);
        setSwiggyStatus(status);
      } catch {
        try {
          const status = await api.getSwiggyStatus();
          setSwiggyStatus(status);
        } catch {
          // ignore
        }
      } finally {
        setSessionLoading(false);
      }
    };
    loadSessionData();
  }, []);

  const startSwiggyLogin = async () => {
    if (backendOffline) return;
    setAuthLoading(true);
    setMessage("");
    try {
      const res = await api.startSwiggyOAuth();
      window.location.href = res.redirect_url;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setMessage(`Swiggy login is not ready yet: ${msg}`);
    } finally {
      setAuthLoading(false);
    }
  };

  const startDemo = async () => {
    if (backendOffline) return;
    setDemoLoading(true);
    setMessage("");
    try {
      await api.demoLogin();
      window.location.href = "/app";
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setMessage(`Sandbox demo is not available in this environment: ${msg}`);
    } finally {
      setDemoLoading(false);
    }
  };

  const showDemoCTA = !backendOffline && swiggyStatus?.use_mock_mcp === true;

  const navLinks = [
    { href: "#products", label: "Products" },
    { href: "#how-it-works", label: "How It Works" },
    { href: "#safety", label: "Safety" },
  ];

  return (
    <main className="min-h-screen bg-[#f7f4ec] text-[#17211c]">
      {/* Sticky Navbar */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#17211c]/95 backdrop-blur-lg shadow-lg shadow-black/10 border-b border-white/8"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 sm:h-20 w-full max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5 group" aria-label="BiteWise home">
            <span className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-[#f4b544] text-sm font-black text-[#17211c] group-hover:scale-105 transition-transform">
              B
            </span>
            <div className="leading-tight">
              <span className="block text-sm sm:text-base font-bold text-white">BiteWise</span>
              <span className="hidden sm:block text-[10px] font-semibold uppercase tracking-wider text-white/40">Food decisions, made smarter</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3.5 py-2 text-sm font-medium text-white/60 rounded-lg transition-all duration-200 hover:text-white hover:bg-white/8"
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/pitch"
              className="px-3.5 py-2 text-sm font-medium text-[#ffd98a] rounded-lg transition-all duration-200 hover:text-[#f4b544] hover:bg-[#f4b544]/10"
            >
              Demo
            </Link>
            <Link
              href="/app"
              className="ml-3 rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:border-white/50 hover:bg-white/10 hover:shadow-md hover:shadow-white/5"
            >
              Open App
            </Link>
          </nav>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-white/10 transition"
            aria-label="Toggle menu"
          >
            <span className={`block w-5 h-0.5 bg-white transition-all duration-200 ${mobileMenuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-5 h-0.5 bg-white transition-all duration-200 ${mobileMenuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-0.5 bg-white transition-all duration-200 ${mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 bg-[#17211c]/98 backdrop-blur-xl border-b border-white/8 ${
            mobileMenuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-5 pb-5 pt-1 flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 text-sm font-medium text-white/70 rounded-lg hover:text-white hover:bg-white/8 transition-all"
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/pitch"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3 text-sm font-medium text-[#ffd98a] rounded-lg hover:bg-[#f4b544]/10 transition-all"
            >
              Demo Walkthrough
            </Link>
            <Link
              href="/app"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-2 text-center rounded-lg bg-white/10 border border-white/20 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/15 transition-all"
            >
              Open App
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        className="relative min-h-svh overflow-hidden bg-[#17211c] text-white"
        style={{
          backgroundImage: "linear-gradient(135deg, rgba(15, 22, 18, 0.96) 0%, rgba(15, 22, 18, 0.80) 40%, rgba(15, 22, 18, 0.40) 100%), url('/landing-food-system.png')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <div className="relative z-10 mx-auto flex min-h-svh max-w-7xl items-center px-5 pb-16 pt-24 sm:px-8">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex rounded-full border border-[#f4b544]/30 bg-[#f4b544]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#ffd98a]">
              NutriOrder AI &middot; SmartPantry AI
            </div>
            <h1 className="max-w-3xl text-4xl font-black leading-[1.08] sm:text-5xl md:text-6xl lg:text-7xl">
              BiteWise
            </h1>
            <p className="mt-5 max-w-xl text-base sm:text-lg leading-7 sm:leading-8 text-white/70">
              One food intelligence platform with two focused products: NutriOrder AI for health-aware meal ordering, and SmartPantry AI for household pantry and grocery planning.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              {sessionLoading ? (
                <div className="h-12 w-48 rounded-xl bg-white/10 animate-pulse" />
              ) : userProfile ? (
                <Link
                  href="/app"
                  className="rounded-xl bg-[#f4b544] px-7 py-3.5 text-sm font-black text-[#17211c] shadow-[0_12px_40px_rgba(244,181,68,0.25)] transition-all duration-200 hover:bg-[#ffd071] hover:shadow-[0_16px_50px_rgba(244,181,68,0.35)] hover:-translate-y-0.5 inline-block text-center"
                >
                  Open Dashboard
                </Link>
              ) : (
                <>
                  <button
                    onClick={startSwiggyLogin}
                    disabled={authLoading || backendOffline}
                    className="rounded-xl bg-[#f4b544] px-7 py-3.5 text-sm font-black text-[#17211c] shadow-[0_12px_40px_rgba(244,181,68,0.25)] transition-all duration-200 hover:bg-[#ffd071] hover:shadow-[0_16px_50px_rgba(244,181,68,0.35)] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                  >
                    {authLoading ? "Starting Swiggy Login" : "Continue with Swiggy"}
                  </button>
                  {showDemoCTA && (
                    <button
                      onClick={startDemo}
                      disabled={demoLoading || backendOffline}
                      className="rounded-xl border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-bold text-white transition-all duration-200 hover:border-white/40 hover:bg-white/10 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {demoLoading ? "Opening Sandbox" : "Try Sandbox Demo"}
                    </button>
                  )}
                  <Link
                    href="/pitch"
                    className="rounded-xl border border-[#f4b544]/25 bg-[#f4b544]/8 px-7 py-3.5 text-sm font-bold text-[#ffd98a] transition-all duration-200 hover:border-[#f4b544]/50 hover:bg-[#f4b544]/14 hover:-translate-y-0.5 inline-block text-center"
                  >
                    Watch the Demo →
                  </Link>
                </>
              )}
            </div>

            {backendOffline && (
              <div className="mt-6 max-w-xl rounded-xl border border-[#df6b57]/40 bg-[#df6b57]/12 px-5 py-4 text-sm text-[#ffd7cf] text-left">
                <p className="font-bold mb-2">Backend is offline. Start FastAPI on port 8000 to use login and demo mode.</p>
                <div className="space-y-2 font-mono text-xs mt-2 bg-black/30 p-3 rounded-lg border border-white/5">
                  <div>
                    <p className="text-white/50 mb-1"># start backend server</p>
                    <code className="text-[#ffd071] select-all">.venv/bin/python -m uvicorn backend.main:app --port 8000 --reload</code>
                  </div>
                  <div className="pt-2 border-t border-white/5">
                    <p className="text-white/50 mb-1"># start frontend server</p>
                    <code className="text-[#ffd071] select-all">cd frontend && npm run dev</code>
                  </div>
                </div>
              </div>
            )}

            {message && !backendOffline && (
              <p className="mt-5 max-w-xl rounded-xl border border-[#df6b57]/40 bg-[#df6b57]/12 px-5 py-3 text-sm text-[#ffd7cf]">
                {message}
              </p>
            )}

            <dl className="mt-10 grid max-w-lg grid-cols-2 sm:grid-cols-4 gap-4 text-white">
              {[
                ["2", "Focused products"],
                ["52+", "Verified tests"],
                ["10", "Recipe templates"],
                ["1", "Safety-gated checkout"],
              ].map(([num, label]) => (
                <div key={label} className="border-l border-white/15 pl-4">
                  <dt className="text-2xl font-black">{num}</dt>
                  <dd className="mt-0.5 text-[11px] text-white/50 leading-tight">{label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 animate-bounce">
          <span className="text-[10px] font-bold uppercase tracking-widest">Scroll</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="text-center mb-12">
          <p className="text-xs font-black uppercase tracking-widest text-[#2f6f5e]">Two focused products</p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-black">Built for different food decisions</h2>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <article className="group rounded-2xl border border-[#d6cdbd] bg-white p-7 sm:p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-[#2f6f5e]/8 hover:-translate-y-1">
            <div className="mb-5 flex items-center justify-between gap-4">
              <p className="text-xs font-black uppercase tracking-wider text-[#2f6f5e]">Personal nutrition ordering</p>
              <span className="rounded-full bg-[#2f6f5e]/10 px-3 py-1 text-xs font-bold text-[#2f6f5e]">
                Food MCP
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black">NutriOrder AI</h3>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#546158]">
              The meal-ordering product helps one user choose high-fit meals, review cart details, apply coupons, place controlled orders, and log nutrition automatically.
            </p>
            <ul className="mt-6 space-y-3">
              {personalHighlights.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-6 text-[#303c35]">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#2f6f5e]" />
                  {item}
                </li>
              ))}
            </ul>
          </article>

          <article className="group rounded-2xl border border-[#d6cdbd] bg-[#fffaf0] p-7 sm:p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-[#b24f3d]/8 hover:-translate-y-1">
            <div className="mb-5 flex items-center justify-between gap-4">
              <p className="text-xs font-black uppercase tracking-wider text-[#b24f3d]">Household pantry intelligence</p>
              <span className="rounded-full bg-[#b24f3d]/10 px-3 py-1 text-xs font-bold text-[#b24f3d]">
                Instamart MCP
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black">SmartPantry AI</h3>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#5d5b51]">
              The household product manages the home food lifecycle: pantry awareness, recipe planning, missing items, family requests, and grocery cart preview.
            </p>
            <ul className="mt-6 space-y-3">
              {householdHighlights.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-6 text-[#39372f]">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#b24f3d]" />
                  {item}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-[#17211c] px-5 py-16 text-white sm:px-8 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-widest text-[#f4b544]">Operating model</p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black">One platform, two focused food products</h2>
            <p className="mt-4 text-sm leading-6 text-white/60">
              BiteWise keeps the experiences separate enough to feel clear, while sharing the same identity, memory, safety patterns, and Swiggy MCP execution layer.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {platformSteps.map((step, index) => (
              <article key={step.title} className="group rounded-2xl border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:border-[#f4b544]/30 hover:bg-white/8">
                <p className="text-sm font-black text-[#f4b544] transition-transform duration-300 group-hover:scale-110 inline-block">0{index + 1}</p>
                <h3 className="mt-4 text-base sm:text-lg font-black">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/55">{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Safety / Why This Works */}
      <section id="safety" className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="flex flex-col justify-center">
            <p className="text-xs font-black uppercase tracking-widest text-[#405c91]">Why this direction works</p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black leading-tight">It becomes a food operating layer, not another ordering wrapper.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["Repeat behavior", "Users eat daily and households restock weekly, so retention can come from recurring decisions."],
              ["Clear MCP usage", "Swiggy is the execution layer for search, cart, coupon, checkout, and tracking instead of a passive data source."],
              ["Defensible memory", "Nutrition logs, preferences, pantry state, go-to items, and feedback make the assistant better over time."],
              ["Controlled trust", "Every mutating action stays behind review, explicit confirmation, order caps, and environment locks."]
            ].map(([title, body]) => (
              <article key={title} className="group rounded-2xl border border-[#d6cdbd] bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                <h3 className="text-base sm:text-lg font-black">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#59645d]">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#17211c] text-white/35 text-xs text-center py-10 px-4 border-t border-white/6">
        <p className="font-semibold text-white/50">BiteWise — NutriOrder AI + SmartPantry AI</p>
        <p className="mt-1.5">Built for the Swiggy MCP Builders Challenge</p>
      </footer>
    </main>
  );
}
