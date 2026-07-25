import React, { useState, useRef, useEffect } from "react";
import { api } from "../lib/api";
import { leadFormSchema, LeadFormData, BUDGET_OPTIONS } from "../lib/validation";
import { CheckCircle, AlertCircle, Loader2, Send } from "lucide-react";

export const LeadForm: React.FC = () => {
  const [formData, setFormData] = useState<LeadFormData>({
    name: "",
    email: "",
    budgetRange: "<1k",
    message: "",
    companyWebsite: "",
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // 3D Tilt Card State & Refs
  const cardRef = useRef<HTMLFormElement | null>(null);
  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({
    transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)",
    boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.6), 0 0 25px rgba(59, 130, 246, 0.08)",
    transition: "transform 0.4s ease-out, box-shadow 0.4s ease-out",
  });

  const [isTouchOrReduced, setIsTouchOrReduced] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (prefersReducedMotion || isTouch) {
      setIsTouchOrReduced(true);
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLFormElement>) => {
    if (isTouchOrReduced || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const xPct = (x / rect.width - 0.5) * 2; // -1 to 1
    const yPct = (y / rect.height - 0.5) * 2; // -1 to 1

    const maxTilt = 7.5; // Max 7.5 deg tilt
    const rotX = -yPct * maxTilt;
    const rotY = xPct * maxTilt;

    // Dynamic glow shadow opposite to tilt
    const shadowX = -rotY * 2.5;
    const shadowY = rotX * 2.5;

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`,
      boxShadow: `${shadowX.toFixed(1)}px ${shadowY.toFixed(1)}px 35px rgba(139, 92, 246, 0.18), 0 25px 50px -12px rgba(0, 0, 0, 0.7)`,
      transition: "transform 0.1s ease-out, box-shadow 0.1s ease-out",
      transformStyle: "preserve-3d",
    });
  };

  const handleMouseLeave = () => {
    if (isTouchOrReduced) return;
    setTiltStyle({
      transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)",
      boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.6), 0 0 25px rgba(59, 130, 246, 0.08)",
      transition: "transform 0.5s ease-out, box-shadow 0.5s ease-out",
      transformStyle: "preserve-3d",
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const validate = (): boolean => {
    const result = leadFormSchema.safeParse(formData);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const path = err.path[0] as string;
        if (path && !errors[path]) {
          errors[path] = err.message;
        }
      });
      setFieldErrors(errors);
      return false;
    }
    setFieldErrors({});
    return true;
  };

  const handleSubmit = async () => {
    setGeneralError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post("/leads", formData);
      setIsSubmitted(true);
    } catch (err: any) {
      if (err.response?.status === 429) {
        setGeneralError(
          err.response.data?.error?.message ||
            "Too many submissions. Please wait a few minutes and try again."
        );
      } else if (err.response?.status === 400 && err.response.data?.error?.fields) {
        const serverFields = err.response.data.error.fields;
        const mappedErrors: Record<string, string> = {};
        Object.keys(serverFields).forEach((key) => {
          mappedErrors[key] = serverFields[key][0];
        });
        setFieldErrors(mappedErrors);
      } else {
        setGeneralError(
          err.response?.data?.error?.message ||
            "Something went wrong while submitting your request. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-8 shadow-2xl text-center backdrop-blur-xl animate-fadeIn relative z-10">
        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-400">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Thank You!</h3>
        <p className="text-slate-300 max-w-md mx-auto mb-6 text-sm leading-relaxed">
          Your project inquiry has been received. Our team will review your requirements and respond within 24 business hours.
        </p>
        <button
          onClick={() => {
            setIsSubmitted(false);
            setFormData({
              name: "",
              email: "",
              budgetRange: "<1k",
              message: "",
              companyWebsite: "",
            });
          }}
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold text-sm transition-colors border border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
        >
          Submit Another Request
        </button>
      </div>
    );
  }

  return (
    <form
      action="#"
      method="POST"
      onSubmit={(e) => e.preventDefault()}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={tiltStyle}
      className="bg-[#0D0F14]/90 border border-slate-800/90 rounded-2xl p-6 sm:p-8 backdrop-blur-xl space-y-5 relative z-10 will-change-transform"
      noValidate
    >
      <div className="border-b border-slate-800/80 pb-4 mb-2" style={{ transform: "translateZ(12px)" }}>
        <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <span>Start Your Project</span>
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        </h3>
        <p className="text-xs text-slate-400 mt-1">Fill out the details below to request a tailored proposal.</p>
      </div>

      {generalError && (
        <div
          className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium"
          style={{ transform: "translateZ(10px)" }}
        >
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{generalError}</span>
        </div>
      )}

      {/* Honeypot field - visually hidden via off-screen positioning for bot detection */}
      <div className="absolute -left-[9999px] top-auto w-1 h-1 overflow-hidden" aria-hidden="true">
        <label htmlFor="companyWebsite">Company Website</label>
        <input
          type="text"
          id="companyWebsite"
          name="companyWebsite"
          tabIndex={-1}
          autoComplete="off"
          value={formData.companyWebsite}
          onChange={handleChange}
        />
      </div>

      {/* Name */}
      <div style={{ transform: "translateZ(8px)" }}>
        <label htmlFor="name" className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
          Full Name <span className="text-rose-400">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Jane Doe"
          className={`w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 transition-all ${
            fieldErrors.name
              ? "border-rose-500/60 focus:ring-rose-500/30"
              : "border-slate-800 focus:border-amber-500/80 focus:ring-amber-500/20"
          }`}
        />
        {fieldErrors.name && (
          <p className="text-xs text-rose-400 mt-1.5 font-medium flex items-center gap-1">
            <span>•</span> {fieldErrors.name}
          </p>
        )}
      </div>

      {/* Email */}
      <div style={{ transform: "translateZ(8px)" }}>
        <label htmlFor="email" className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
          Email Address <span className="text-rose-400">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="jane@company.com"
          className={`w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 transition-all ${
            fieldErrors.email
              ? "border-rose-500/60 focus:ring-rose-500/30"
              : "border-slate-800 focus:border-amber-500/80 focus:ring-amber-500/20"
          }`}
        />
        {fieldErrors.email && (
          <p className="text-xs text-rose-400 mt-1.5 font-medium flex items-center gap-1">
            <span>•</span> {fieldErrors.email}
          </p>
        )}
      </div>

      {/* Budget Range */}
      <div style={{ transform: "translateZ(8px)" }}>
        <label htmlFor="budgetRange" className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
          Estimated Budget <span className="text-rose-400">*</span>
        </label>
        <select
          id="budgetRange"
          name="budgetRange"
          value={formData.budgetRange}
          onChange={handleChange}
          className={`w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border text-slate-100 text-sm focus:outline-none focus:ring-2 transition-all ${
            fieldErrors.budgetRange
              ? "border-rose-500/60 focus:ring-rose-500/30"
              : "border-slate-800 focus:border-amber-500/80 focus:ring-amber-500/20"
          }`}
        >
          {BUDGET_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-100">
              {opt.label}
            </option>
          ))}
        </select>
        {fieldErrors.budgetRange && (
          <p className="text-xs text-rose-400 mt-1.5 font-medium flex items-center gap-1">
            <span>•</span> {fieldErrors.budgetRange}
          </p>
        )}
      </div>

      {/* Message */}
      <div style={{ transform: "translateZ(8px)" }}>
        <label htmlFor="message" className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
          Project Details <span className="text-rose-400">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          value={formData.message}
          onChange={handleChange}
          placeholder="Tell us about your project goals, scope, and timeline..."
          className={`w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 transition-all resize-none ${
            fieldErrors.message
              ? "border-rose-500/60 focus:ring-rose-500/30"
              : "border-slate-800 focus:border-amber-500/80 focus:ring-amber-500/20"
          }`}
        />
        {fieldErrors.message && (
          <p className="text-xs text-rose-400 mt-1.5 font-medium flex items-center gap-1">
            <span>•</span> {fieldErrors.message}
          </p>
        )}
      </div>

      {/* Signature CTA Button - Warm Accent Pop against cool background */}
      <div style={{ transform: "translateZ(16px)" }}>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 focus:outline-none focus:ring-2 focus:ring-amber-400/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group mt-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
              <span>Submitting Proposal...</span>
            </>
          ) : (
            <>
              <span>Submit Proposal Request</span>
              <Send className="w-4 h-4 text-slate-950 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </div>
    </form>
  );
};
