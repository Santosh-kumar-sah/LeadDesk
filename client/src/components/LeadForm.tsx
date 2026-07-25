import React, { useState } from "react";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 shadow-2xl text-center backdrop-blur-xl animate-fadeIn">
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
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm transition-colors border border-slate-700"
        >
          Submit Another Request
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-5"
      noValidate
    >
      <div className="border-b border-slate-800/80 pb-4 mb-2">
        <h3 className="text-xl font-bold text-white tracking-tight">Start Your Project</h3>
        <p className="text-xs text-slate-400 mt-1">Fill out the details below to request a tailored proposal.</p>
      </div>

      {generalError && (
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium">
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
      <div>
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
          className={`w-full px-4 py-2.5 rounded-xl bg-slate-950 border text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 transition-all ${
            fieldErrors.name
              ? "border-rose-500/60 focus:ring-rose-500/30"
              : "border-slate-800 focus:border-brand-500 focus:ring-brand-500/20"
          }`}
        />
        {fieldErrors.name && (
          <p className="text-xs text-rose-400 mt-1.5 font-medium flex items-center gap-1">
            <span>•</span> {fieldErrors.name}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
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
          className={`w-full px-4 py-2.5 rounded-xl bg-slate-950 border text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 transition-all ${
            fieldErrors.email
              ? "border-rose-500/60 focus:ring-rose-500/30"
              : "border-slate-800 focus:border-brand-500 focus:ring-brand-500/20"
          }`}
        />
        {fieldErrors.email && (
          <p className="text-xs text-rose-400 mt-1.5 font-medium flex items-center gap-1">
            <span>•</span> {fieldErrors.email}
          </p>
        )}
      </div>

      {/* Budget Range */}
      <div>
        <label htmlFor="budgetRange" className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
          Estimated Budget <span className="text-rose-400">*</span>
        </label>
        <select
          id="budgetRange"
          name="budgetRange"
          value={formData.budgetRange}
          onChange={handleChange}
          className={`w-full px-4 py-2.5 rounded-xl bg-slate-950 border text-slate-100 text-sm focus:outline-none focus:ring-2 transition-all ${
            fieldErrors.budgetRange
              ? "border-rose-500/60 focus:ring-rose-500/30"
              : "border-slate-800 focus:border-brand-500 focus:ring-brand-500/20"
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
      <div>
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
          className={`w-full px-4 py-2.5 rounded-xl bg-slate-950 border text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 transition-all resize-none ${
            fieldErrors.message
              ? "border-rose-500/60 focus:ring-rose-500/30"
              : "border-slate-800 focus:border-brand-500 focus:ring-brand-500/20"
          }`}
        />
        {fieldErrors.message && (
          <p className="text-xs text-rose-400 mt-1.5 font-medium flex items-center gap-1">
            <span>•</span> {fieldErrors.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-brand-600/25 hover:shadow-brand-500/35 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group mt-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Submitting...</span>
          </>
        ) : (
          <>
            <span>Submit Proposal Request</span>
            <Send className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </>
        )}
      </button>
    </form>
  );
};
