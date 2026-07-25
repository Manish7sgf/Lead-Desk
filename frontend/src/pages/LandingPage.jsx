import React, { useState } from 'react';
import client from '../api/client';
import { 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  CornerDownLeft, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  Zap, 
  Code2, 
  Layers, 
  Check 
} from 'lucide-react';

const PROJECT_TYPES = [
  { id: "Full-Stack Web App", label: "Full-Stack Web App", icon: Code2 },
  { id: "API & Backend", label: "API & Cloud Architecture", icon: Zap },
  { id: "UI/UX Redesign", label: "UI/UX & Product Design", icon: Layers },
  { id: "Custom SaaS", label: "Custom SaaS Platform", icon: Sparkles }
];

const TIMELINE_OPTIONS = [
  "< 2 Weeks",
  "1 Month",
  "2–3 Months",
  "Flexible"
];

const BUDGET_OPTIONS = [
  { value: "< ₹80k (< $1k)", label: "< ₹80,000", desc: "< $1k / Starter MVP" },
  { value: "₹80k–₹4L ($1k–$5k)", label: "₹80k – ₹4 Lakh", desc: "$1k – $5k / Core Build" },
  { value: "₹4L–₹16L ($5k–$20k)", label: "₹4 Lakh – ₹16 Lakh", desc: "$5k – $20k / Full Product" },
  { value: "₹16L+ ($20k+)", label: "₹16 Lakh+", desc: "$20k+ / Enterprise Scale" }
];

const SAMPLE_DATA = [
  {
    name: "Vikram Malhotra",
    email: "vikram@techventures.io",
    project_type: "Full-Stack Web App",
    timeline: "1 Month",
    budget_range: "₹4L–₹16L ($5k–$20k)",
    message: "We are looking to build a high-performance client intake portal with custom workflow triage, automated notifications, and real-time status tracking."
  },
  {
    name: "Sophia Chen",
    email: "sophia@nexusdesign.co",
    project_type: "Custom SaaS",
    timeline: "< 2 Weeks",
    budget_range: "₹16L+ ($20k+)",
    message: "Need a full-stack SaaS platform built with React, FastAPI, and MongoDB Atlas. Must support multi-tenant user authentication and analytics."
  }
];

const LandingPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    project_type: 'Full-Stack Web App',
    timeline: '1 Month',
    budget_range: '< ₹80k (< $1k)',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const fillSampleData = () => {
    const randomSample = SAMPLE_DATA[Math.floor(Math.random() * SAMPLE_DATA.length)];
    setFormData(randomSample);
    setErrors({});
    setServerError('');
  };

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
        project_type: 'Full-Stack Web App',
        timeline: '1 Month',
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
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 transition-colors">
      {/* Top Banner & Stepper Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200 dark:border-zinc-800/60">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-zinc-900 dark:border dark:border-zinc-800 dark:text-zinc-300 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
          <span>Digital Heroes Lead Intake Engine</span>
        </div>

        {/* Form Process Stepper */}
        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-zinc-400">
          <span className="flex items-center gap-1 text-slate-900 dark:text-zinc-200 font-semibold">
            <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-800 border border-slate-300 dark:bg-zinc-800 dark:border-zinc-700 flex items-center justify-center text-[10px] dark:text-zinc-100">1</span>
            Requirements
          </span>
          <span className="text-slate-400 dark:text-zinc-600">&rarr;</span>
          <span className="flex items-center gap-1 text-slate-500 dark:text-zinc-400">
            <span className="w-4 h-4 rounded-full bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-[10px]">2</span>
            Budget & Timeline
          </span>
          <span className="text-slate-400 dark:text-zinc-600">&rarr;</span>
          <span className="flex items-center gap-1 text-slate-500 dark:text-zinc-400">
            <span className="w-4 h-4 rounded-full bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-[10px]">3</span>
            Admin Triage
          </span>
        </div>
      </div>

      {/* Main Grid: Left Value Proposition Column + Right Form Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (Value Proposition, Guarantees & Features) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 dark:text-zinc-100 leading-tight">
              Turn Ideas Into Production-Ready Code
            </h1>
            <p className="text-slate-600 dark:text-zinc-400 text-xs sm:text-sm leading-relaxed">
              Submit your project scope and budget requirements. All inquiries are triaged directly in real-time by our senior engineering queue.
            </p>
          </div>

          {/* Key SLA & Guarantees */}
          <div className="space-y-3 pt-2">
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 dark:bg-[#121215] dark:border-zinc-800/80 flex items-start gap-3 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-200">24-Hour SLA Triage Response</h4>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                  Every submitted lead is reviewed within 24 hours with an actionable technical proposal.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 dark:bg-[#121215] dark:border-zinc-800/80 flex items-start gap-3 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-200">Encrypted MongoDB Atlas Pipeline</h4>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                  Your project data is encrypted in transit and stored inside secure MongoDB Atlas collections.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 dark:bg-[#121215] dark:border-zinc-800/80 flex items-start gap-3 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-600 dark:text-sky-400 flex-shrink-0 mt-0.5">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-200">Modern Stack Architecture</h4>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                  Built on React + Vite, FastAPI asynchronous Python server, and Tailwind CSS design tokens.
                </p>
              </div>
            </div>
          </div>

          {/* Testimonial Quote Badge */}
          <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 dark:bg-zinc-900/60 dark:border-zinc-800/60 text-xs text-slate-700 dark:text-zinc-300 space-y-2">
            <p className="italic text-slate-600 dark:text-zinc-400 leading-relaxed">
              &ldquo;LeadDesk Mini streamlined our entire client onboarding pipeline with direct status triage and real-time updates.&rdquo;
            </p>
            <div className="flex items-center gap-2 pt-1 border-t border-slate-200 dark:border-zinc-800/40">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-mono text-[11px] text-slate-800 dark:text-zinc-300">Digital Heroes Training Task</span>
            </div>
          </div>
        </div>

        {/* Right Column (Interactive Lead Capture Form Card) */}
        <div className="lg:col-span-7">
          <div className="bg-white border border-slate-200 dark:bg-[#121215] dark:border-zinc-800/80 rounded-2xl p-6 sm:p-8 shadow-xl relative transition-colors">
            {/* Sample data button for evaluators */}
            {!isSuccess && (
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-zinc-800/60">
                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-zinc-100">Project Details</h3>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">Complete all required fields below</p>
                </div>

                <button
                  type="button"
                  onClick={fillSampleData}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:border-zinc-700/60 dark:text-zinc-300 text-xs font-mono inline-flex items-center gap-1.5 transition-all shadow-sm"
                  title="Click to auto-fill sample inquiry data for evaluation"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                  <span>Fill Test Sample Data</span>
                </button>
              </div>
            )}

            {isSuccess ? (
              <div className="text-center py-12 space-y-5 animate-fadeIn">
                <div className="w-12 h-12 bg-emerald-50 border border-emerald-300 dark:bg-zinc-900 dark:border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400 shadow-sm">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1.5 max-w-md mx-auto">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-zinc-100">Inquiry Logged Successfully</h2>
                  <p className="text-slate-600 dark:text-zinc-400 text-xs leading-relaxed">
                    Your project details have been recorded in MongoDB database and are now visible inside the admin triage queue.
                  </p>
                </div>
                <div className="pt-4">
                  <button
                    onClick={() => setIsSuccess(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:text-white dark:border-zinc-700 font-medium text-xs transition-all inline-flex items-center gap-1.5"
                  >
                    <span>Submit Another Inquiry</span>
                    <CornerDownLeft className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {serverError && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 dark:bg-red-950/40 dark:border-red-800/50 dark:text-red-300 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-semibold block mb-0.5">Submission Rejected</strong>
                      <span>{serverError}</span>
                    </div>
                  </div>
                )}

                {/* Contact details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="name" className="block text-xs font-medium text-slate-700 dark:text-zinc-300">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Alex Morgan"
                      className={`w-full px-3.5 py-2 rounded-xl bg-slate-50 border text-slate-900 placeholder-slate-400 dark:bg-[#09090b] dark:text-zinc-100 dark:placeholder-zinc-600 text-xs sm:text-sm focus:outline-none transition-all ${
                        errors.name
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-slate-300 dark:border-zinc-800 focus:border-indigo-500 dark:focus:border-zinc-500'
                      }`}
                    />
                    {errors.name && (
                      <p className="text-[11px] text-red-500 font-medium">{errors.name}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="email" className="block text-xs font-medium text-slate-700 dark:text-zinc-300">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="alex@company.com"
                      className={`w-full px-3.5 py-2 rounded-xl bg-slate-50 border text-slate-900 placeholder-slate-400 dark:bg-[#09090b] dark:text-zinc-100 dark:placeholder-zinc-600 text-xs sm:text-sm focus:outline-none transition-all ${
                        errors.email
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-slate-300 dark:border-zinc-800 focus:border-indigo-500 dark:focus:border-zinc-500'
                      }`}
                    />
                    {errors.email && (
                      <p className="text-[11px] text-red-500 font-medium">{errors.email}</p>
                    )}
                  </div>
                </div>

                {/* Project Category Pills */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300">
                    Project Category
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {PROJECT_TYPES.map((pt) => {
                      const IconComp = pt.icon;
                      const isSelected = formData.project_type === pt.id;
                      return (
                        <button
                          key={pt.id}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, project_type: pt.id }))}
                          className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all flex items-center gap-2 ${
                            isSelected
                              ? 'bg-slate-100 border-indigo-500 text-slate-900 dark:bg-zinc-800 dark:border-zinc-500 dark:text-zinc-100 shadow-sm ring-1 ring-indigo-500/40 dark:ring-zinc-500/40'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 dark:bg-[#09090b] dark:border-zinc-800/80 dark:text-zinc-400 dark:hover:text-zinc-200'
                          }`}
                        >
                          <IconComp className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-zinc-500'}`} />
                          <span className="truncate">{pt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Budget Range Segment Pills */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300">
                      Estimated Budget Bracket <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-500 font-mono">INR (₹) / USD ($)</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {BUDGET_OPTIONS.map((opt) => {
                      const isSelected = formData.budget_range === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, budget_range: opt.value }))}
                          className={`p-2 rounded-xl border text-left transition-all flex flex-col justify-between ${
                            isSelected
                              ? 'bg-slate-100 border-indigo-500 text-slate-900 dark:bg-zinc-800 dark:border-zinc-500 dark:text-zinc-100 shadow-sm ring-1 ring-indigo-500/40 dark:ring-zinc-500/40'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 dark:bg-[#09090b] dark:border-zinc-800/80 dark:text-zinc-400 dark:hover:text-zinc-200'
                          }`}
                        >
                          <span className="text-xs font-semibold">{opt.label}</span>
                          <span className="text-[10px] text-slate-500 dark:text-zinc-500 mt-0.5">{opt.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Target Launch Timeline Selector */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300">
                    Target Launch Timeline
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {TIMELINE_OPTIONS.map((tl) => {
                      const isSelected = formData.timeline === tl;
                      return (
                        <button
                          key={tl}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, timeline: tl }))}
                          className={`py-1.5 px-2 rounded-xl border text-center text-xs font-medium transition-all ${
                            isSelected
                              ? 'bg-slate-100 border-indigo-500 text-slate-900 dark:bg-zinc-800 dark:border-zinc-500 dark:text-zinc-100 shadow-sm'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 dark:bg-[#09090b] dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                          }`}
                        >
                          {tl}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Message field with live char counter */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="message" className="block text-xs font-medium text-slate-700 dark:text-zinc-300">
                      Project Requirements <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-500 font-mono">
                      {formData.message.length} / 2000 chars
                    </span>
                  </div>
                  <textarea
                    id="message"
                    name="message"
                    rows="3"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Describe your project goals, technical requirements, and key milestones..."
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border text-slate-900 placeholder-slate-400 dark:bg-[#09090b] dark:text-zinc-100 dark:placeholder-zinc-600 text-xs sm:text-sm focus:outline-none transition-all resize-none ${
                      errors.message
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-slate-300 dark:border-zinc-800 focus:border-indigo-500 dark:focus:border-zinc-500'
                    }`}
                  ></textarea>
                  {errors.message && (
                    <p className="text-[11px] text-red-500 font-medium">{errors.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-2 space-y-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 font-semibold text-xs sm:text-sm shadow-sm transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <span>Saving Lead to Database...</span>
                    ) : (
                      <>
                        <span>Submit Project Inquiry</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 dark:text-zinc-500 font-mono pt-1">
                    <span className="flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-500" /> Direct Triage
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-500" /> SSL Encrypted
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-500" /> No Spam
                    </span>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
