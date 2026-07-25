import React from "react";
import { Link } from "react-router-dom";
import { LeadForm } from "../components/LeadForm";
import { Footer } from "../components/Footer";
import { Zap, ShieldCheck, TrendingUp, Lock } from "lucide-react";

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-brand-500 selection:text-white relative overflow-hidden">
      {/* Background glow graphics */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-brand-600/20 via-indigo-500/10 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Top Navbar */}
      <header className="w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur sticky top-0 z-50 px-4 sm:px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">
              LeadDesk <span className="text-brand-400 font-medium text-sm px-2 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/20">Mini</span>
            </span>
          </div>

          <Link
            to="/admin/login"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:text-white transition-all"
          >
            <Lock className="w-3.5 h-3.5 text-brand-400" />
            <span>Admin Portal</span>
          </Link>
        </div>
      </header>

      {/* Main Hero & Form Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-12 sm:py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Hero Pitch */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-medium">
            <ShieldCheck className="w-4 h-4 text-brand-400" />
            <span>Enterprise-Grade Lead Intake Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
            Turn Inquiries into <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-indigo-300 to-purple-400">High-Value Clients</span>
          </h1>

          <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-2xl">
            Streamline your project lead capture with real-time validation, intelligent rate limiting, and an admin management dashboard.
          </p>

          <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-800/80">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-brand-400 shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Instant Processing</h4>
                <p className="text-xs text-slate-400 mt-0.5">Automated validation & instant lead capture storage.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-brand-400 shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Pipeline Pipeline</h4>
                <p className="text-xs text-slate-400 mt-0.5">Track status lifecycle from New to Closed in real-time.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="lg:col-span-5">
          <LeadForm />
        </div>
      </main>

      <Footer />
    </div>
  );
};
