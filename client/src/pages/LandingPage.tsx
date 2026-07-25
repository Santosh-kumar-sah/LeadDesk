import React from "react";
import { Link } from "react-router-dom";
import { LeadForm } from "../components/LeadForm";
import { Footer } from "../components/Footer";
import { ParticleField } from "../components/ParticleField";
import { Zap, ShieldCheck, TrendingUp, Lock, Sparkles } from "lucide-react";

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#0A0B0D] text-slate-100 selection:bg-amber-500 selection:text-slate-950 relative overflow-hidden font-sans">
      {/* Signature Particle Field Layer */}
      <ParticleField />

      {/* Top Navbar */}
      <header className="w-full border-b border-slate-800/60 bg-[#0A0B0D]/80 backdrop-blur-md sticky top-0 z-50 px-4 sm:px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white font-mono">
              LeadDesk <span className="text-amber-400 font-sans font-semibold text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">Mini</span>
            </span>
          </div>

          <Link
            to="/admin/login"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:text-white transition-all shadow-sm"
          >
            <Lock className="w-3.5 h-3.5 text-blue-400" />
            <span>Admin Portal</span>
          </Link>
        </div>
      </header>

      {/* Main Hero & Form Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-12 sm:py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        {/* Left Hero Pitch */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium backdrop-blur-sm">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Enterprise-Grade Lead Intake Platform</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400 ml-0.5" />
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
            Turn Inquiries into{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-violet-400">
              High-Value Clients
            </span>
          </h1>

          <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-2xl">
            Streamline your project lead capture with real-time validation, intelligent rate limiting, and an admin management dashboard.
          </p>

          <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-800/80">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-sm">
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Instant Processing</h4>
                <p className="text-xs text-slate-400 mt-0.5">Automated validation & instant lead capture storage.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-sm">
              <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Pipeline Tracking</h4>
                <p className="text-xs text-slate-400 mt-0.5">Track status lifecycle from New to Closed in real-time.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="lg:col-span-5 relative z-10">
          <LeadForm />
        </div>
      </main>

      <Footer />
    </div>
  );
};
