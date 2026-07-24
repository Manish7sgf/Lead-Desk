import React, { useState } from 'react';
import client from '../api/client';
import { CheckCircle2, AlertCircle, ArrowRight, CornerDownLeft } from 'lucide-react';

const BUDGET_OPTIONS = [
  { value: "< ₹80k (< $1k)", label: "< ₹80,000", desc: "< $1k / Starter" },
  { value: "₹80k–₹4L ($1k–$5k)", label: "₹80k – ₹4 Lakh", desc: "$1k – $5k / Core Build" },
  { value: "₹4L–₹16L ($5k–$20k)", label: "₹4 Lakh – ₹16 Lakh", desc: "$5k – $20k / Full Product" },
  { value: "₹16L+ ($20k+)", label: "₹16 Lakh+", desc: "$20k+ / Enterprise" }
];

const LandingPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    budget_range: '< ₹80k (< $1k)',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Project description is required';
    } else if (formData.message.trim().length < 5) {
      newErrors.message = 'Description must be at least 5 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) setServerError('');
  };

  const setBudget = (val) => {
    setFormData((prev) => ({ ...prev, budget_range: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setServerError('');

    try {
      await client.post('/leads', formData);
      setIsSuccess(true);
      setFormData({
        name: '',
        email: '',
        budget_range: '< ₹80k (< $1k)',
        message: ''
      });
    } catch (err) {
      console.error("Submission error:", err);
      const detail = err.response?.data?.detail;
      const errList = err.response?.data?.errors;

      if (errList && Array.isArray(errList)) {
        setServerError(errList.join(' | '));
      } else if (detail) {
        setServerError(typeof detail === 'string' ? detail : 'Server validation failed');
      } else {
        setServerError('Unable to connect to server. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
      {/* Hero section */}
      <div className="text-center max-w-xl mx-auto mb-10 space-y-3">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-100">
          Start a Project Inquiry
        </h1>
        <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
          Submit your requirements and estimated budget below. Our team reviews all incoming leads directly inside our admin triage queue.
        </p>
      </div>

      {/* Main Form Card */}
      <div className="bg-[#121215] border border-zinc-800/80 rounded-2xl p-6 sm:p-8 shadow-xl">
        {isSuccess ? (
          <div className="text-center py-12 space-y-5 animate-fadeIn">
            <div className="w-12 h-12 bg-zinc-900 border border-zinc-700/80 rounded-full flex items-center justify-center mx-auto text-emerald-400 shadow-sm">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h2 className="text-xl font-semibold text-zinc-100">Inquiry Received</h2>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Your project details have been logged into the admin dashboard. We will review your message shortly.
              </p>
            </div>
            <div className="pt-4">
              <button
                onClick={() => setIsSuccess(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700 font-medium text-xs transition-all inline-flex items-center gap-1.5"
              >
                <span>Submit Another Inquiry</span>
                <CornerDownLeft className="w-3.5 h-3.5 text-zinc-400" />
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {serverError && (
              <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold block mb-0.5">Submission Rejected</strong>
                  <span>{serverError}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Name field */}
              <div className="space-y-1.5">
                <label htmlFor="name" className="block text-xs font-medium text-zinc-300">
                  Full Name <span className="text-zinc-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Alex Morgan"
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border text-zinc-100 placeholder-zinc-600 text-xs sm:text-sm focus:outline-none transition-all ${
                    errors.name
                      ? 'border-red-500/80 focus:border-red-500'
                      : 'border-zinc-800 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500'
                  }`}
                />
                {errors.name && (
                  <p className="text-[11px] text-red-400 font-medium">{errors.name}</p>
                )}
              </div>

              {/* Email field */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-xs font-medium text-zinc-300">
                  Email Address <span className="text-zinc-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="alex@company.com"
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border text-zinc-100 placeholder-zinc-600 text-xs sm:text-sm focus:outline-none transition-all ${
                    errors.email
                      ? 'border-red-500/80 focus:border-red-500'
                      : 'border-zinc-800 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500'
                  }`}
                />
                {errors.email && (
                  <p className="text-[11px] text-red-400 font-medium">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Budget Range Segment Pills */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-zinc-300">
                Budget Bracket <span className="text-zinc-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {BUDGET_OPTIONS.map((opt) => {
                  const isSelected = formData.budget_range === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setBudget(opt.value)}
                      className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-zinc-800/90 border-zinc-600 text-zinc-100 shadow-sm'
                          : 'bg-[#09090b] border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                      }`}
                    >
                      <span className="text-xs font-semibold">{opt.label}</span>
                      <span className="text-[10px] text-zinc-500 mt-1">{opt.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Message field */}
            <div className="space-y-1.5">
              <label htmlFor="message" className="block text-xs font-medium text-zinc-300">
                Project Overview <span className="text-zinc-500">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                rows="4"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us about your product goals, technical stack, and target timeline..."
                className={`w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border text-zinc-100 placeholder-zinc-600 text-xs sm:text-sm focus:outline-none transition-all resize-none ${
                  errors.message
                    ? 'border-red-500/80 focus:border-red-500'
                    : 'border-zinc-800 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500'
                }`}
              ></textarea>
              {errors.message && (
                <p className="text-[11px] text-red-400 font-medium">{errors.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs sm:text-sm shadow-sm transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span>Submitting Lead...</span>
                ) : (
                  <>
                    <span>Submit Inquiry</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LandingPage;
