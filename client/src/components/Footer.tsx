import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-800 bg-slate-950/80 backdrop-blur py-6 px-4 mt-auto text-center text-xs text-slate-400">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="font-medium text-slate-300">
          &copy; {new Date().getFullYear()} LeadDesk Mini. All rights reserved.
        </p>
        <p className="flex items-center gap-1.5">
          <span>Built for</span>
          <a
            href="https://digitalheroesco.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-400 hover:text-brand-300 underline font-semibold transition-colors decoration-brand-500/30 underline-offset-4 hover:decoration-brand-300"
          >
            Digital Heroes Training Task
          </a>
        </p>
      </div>
    </footer>
  );
};
