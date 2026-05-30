'use client';
export const runtime = 'edge';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import ScorePill from '@/components/ScorePill';
import TurnstileWidget from '@/components/TurnstileWidget';
import { coachingApi } from '@/lib/api';
import SiteNav from '@/components/SiteNav';

// The key maps to the backend's institutionType enum. Labels/descriptions are UI only.
const CONTEXT_TYPES = [
  { key: 'CORPORATE',      label: 'Company / Business',      description: 'Private sector organisations and enterprises' },
  { key: 'ACADEMIC',       label: 'School / University',     description: 'Educational institutions and academic bodies' },
  { key: 'GOVERNMENT',     label: 'Government / Public',     description: 'Public sector and civil service bodies' },
  { key: 'REHABILITATION', label: 'Recovery / Rehab',        description: 'Correctional, recovery, and rehabilitation programmes' },
  { key: 'NGO',            label: 'NGO / Community',         description: 'Non-governmental and community organisations' },
  { key: 'CHURCH',         label: 'Faith Organisation',      description: 'Churches and faith-based communities' },
];

interface CategoryGroup {
  name:      string;
  questions: Array<{ questionKey: string; questionText: string }>;
}

const ANSWER_LABELS = [
  { value: 1, label: 'Never' },
  { value: 2, label: 'Rarely' },
  { value: 3, label: 'Sometimes' },
  { value: 4, label: 'Often' },
  { value: 5, label: 'Almost Always' },
];

function computeCategoryScores(categories: CategoryGroup[], answers: Record<string, number>) {
  return categories.map((cat) => {
    const score = cat.questions.reduce((sum, q) => sum + (answers[q.questionKey] ?? 0), 0);
    return { name: cat.name, score, max: cat.questions.length * 5 };
  });
}

const STEP_ASSESSMENT = 1;
const STEP_SUBMITTED  = 2;

export default function DiagnosticPage() {
  const [step, setStep] = useState(0);
  const [institutionType, setInstitutionType] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const [categories, setCategories] = useState<CategoryGroup[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questionsError, setQuestionsError] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'forward' | 'back'>('forward');
  const advanceTimerRef = useRef<number | null>(null);
  useEffect(() => () => { if (advanceTimerRef.current) window.clearTimeout(advanceTimerRef.current); }, []);

  const flatQuestions = useMemo(() => {
    const flat: Array<{ questionKey: string; questionText: string; categoryName: string; questionIdxInCategory: number; totalInCategory: number }> = [];
    for (const cat of categories) {
      cat.questions.forEach((q, i) => {
        flat.push({ questionKey: q.questionKey, questionText: q.questionText, categoryName: cat.name, questionIdxInCategory: i, totalInCategory: cat.questions.length });
      });
    }
    return flat;
  }, [categories]);

  const totalQuestions = flatQuestions.length;
  const currentQuestion = step === STEP_ASSESSMENT && totalQuestions > 0
    ? flatQuestions[Math.min(currentQuestionIdx, totalQuestions - 1)]
    : null;
  const isLastQuestion = currentQuestionIdx === totalQuestions - 1;
  const currentAnswer = currentQuestion ? answers[currentQuestion.questionKey] : undefined;

  useEffect(() => {
    if (!institutionType) return;
    let cancelled = false;
    setQuestionsLoading(true);
    setQuestionsError('');
    coachingApi.diagnostic.fetchQuestions(institutionType)
      .then(res => {
        if (cancelled) return;
        const map = new Map<string, CategoryGroup>();
        for (const q of res.questions) {
          if (!map.has(q.category)) map.set(q.category, { name: q.category, questions: [] });
          map.get(q.category)!.questions.push({ questionKey: q.questionKey, questionText: q.questionText });
        }
        setCategories(Array.from(map.values()));
      })
      .catch(err => { if (!cancelled) setQuestionsError(err instanceof Error ? err.message : 'Failed to load assessment.'); })
      .finally(() => { if (!cancelled) setQuestionsLoading(false); });
    return () => { cancelled = true; };
  }, [institutionType]);

  function handleContextSelect(type: string) { setInstitutionType(type); setStep(-1); }

  function handleContactNext() {
    if (!contactName.trim() || !contactEmail.trim()) return;
    setStep(STEP_ASSESSMENT);
    setCurrentQuestionIdx(0);
  }

  function handleAnswer(key: string, value: number) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    if (advanceTimerRef.current) window.clearTimeout(advanceTimerRef.current);
    if (currentQuestionIdx < totalQuestions - 1) {
      advanceTimerRef.current = window.setTimeout(() => {
        setSlideDirection('forward');
        setCurrentQuestionIdx((i) => Math.min(i + 1, totalQuestions - 1));
        advanceTimerRef.current = null;
      }, 320);
    }
  }

  function handleNextQuestion() {
    if (currentQuestionIdx < totalQuestions - 1) {
      setSlideDirection('forward');
      setCurrentQuestionIdx((i) => i + 1);
    } else { handleSubmit(); }
  }

  function handleBack() {
    if (advanceTimerRef.current) { window.clearTimeout(advanceTimerRef.current); advanceTimerRef.current = null; }
    if (step === STEP_ASSESSMENT && currentQuestionIdx > 0) {
      setSlideDirection('back');
      setCurrentQuestionIdx((i) => i - 1);
    } else if (step === STEP_ASSESSMENT) { setStep(-1); }
    else if (step === -1) { setStep(0); }
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError('');
    try {
      await coachingApi.diagnostic.submit({
        institutionType,
        responses: answers,
        contactName: contactName.trim(),
        contactEmail: contactEmail.trim(),
        organizationName: organizationName.trim() || undefined,
        cfTurnstileToken: turnstileToken ?? undefined,
      });
      setSubmitted(true);
      setStep(STEP_SUBMITTED);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  // ── Submitted ────────────────────────────────────────────────────────────────
  if (submitted || step === STEP_SUBMITTED) {
    const categoryScores = computeCategoryScores(categories, answers);
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <SiteNav />
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-20">
          <div className="max-w-lg w-full">
            <p className="section-label mb-3">Reference Submitted</p>
            <h2 className="section-title mb-4">Submission Confirmed</h2>
            <p className="text-black/70 mb-3 leading-relaxed">Your needs assessment has been received.</p>
            <p className="text-black/70 mb-8 leading-relaxed">
              I&apos;ll review your submission and email you within 48 hours with a tailored
              recommendation and a booking link to schedule a 30-minute discovery call.
            </p>

            <div className="border-t border-black/10 pt-6 mb-6">
              <p className="section-label mb-4">Assessment Summary</p>
              <div className="flex flex-wrap gap-2">
                {categoryScores.map(({ name, score, max }) => (
                  <ScorePill key={name} category={name} score={score} max={max} />
                ))}
              </div>
            </div>

            <div className="border-t border-black/10 pt-6">
              <p className="section-label mb-3">While You Wait</p>
              <p className="text-sm text-black/70 mb-4 leading-relaxed">
                You may browse the full programme catalogue while your recommendation is prepared.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 items-start">
                <Link href="/coaching/programmes" className="btn-outline">Browse the Catalogue →</Link>
                <Link href="/" className="text-sm text-black/60 hover:text-black transition-colors flex items-center pt-3">
                  Return home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Context selector ──────────────────────────────────────────────────────────
  if (step === 0) {
    return (
      <div className="min-h-screen bg-white">
        <SiteNav />
        <div className="px-6 py-16">
          <div className="max-w-2xl mx-auto">
            <Link href="/coaching" className="eyebrow text-black/50 hover:text-black mb-8 inline-block">
              ← Back to Coaching
            </Link>
            <p className="section-label mb-4">Needs Assessment</p>
            <h1 className="section-title mb-3">What&apos;s your context?</h1>
            <p className="text-black/70 mb-10 text-sm leading-relaxed">
              Choose the setting that best describes you. Your selection shapes the
              recommendation you&apos;ll receive.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {CONTEXT_TYPES.map((ctx) => (
                <button
                  key={ctx.key}
                  onClick={() => handleContextSelect(ctx.key)}
                  className="card text-left hover:border-[#C9A84C] transition-colors cursor-pointer"
                >
                  <p className="font-display text-lg font-semibold text-black">{ctx.label}</p>
                  <p className="text-sm text-black/60 mt-1">{ctx.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Contact info ──────────────────────────────────────────────────────────────
  if (step === -1) {
    const canProceed = contactName.trim().length > 0 && contactEmail.trim().length > 0;
    return (
      <div className="min-h-screen bg-white">
        <SiteNav />
        <div className="px-6 py-16">
          <div className="max-w-lg mx-auto">
            <button onClick={() => setStep(0)} className="eyebrow text-black/50 hover:text-black mb-8 inline-block">
              ← Change context
            </button>
            <p className="section-label mb-2">Needs Assessment</p>
            <h1 className="section-title mb-3">Your details</h1>
            <p className="text-black/70 mb-8 text-sm leading-relaxed">
              I&apos;ll review your assessment personally and send a recommendation within 48 hours.
            </p>
            <div className="border border-black/10 p-8 flex flex-col gap-5">
              <div>
                <label className="block text-sm font-medium text-black mb-1.5">
                  Your Name <span className="text-[#C9A84C]">*</span>
                </label>
                <input
                  type="text" required value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Full name"
                  className="w-full border border-black/15 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1.5">
                  Email Address <span className="text-[#C9A84C]">*</span>
                </label>
                <input
                  type="email" required value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="w-full border border-black/15 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1.5">
                  Organisation <span className="text-black/40 font-normal">(optional)</span>
                </label>
                <input
                  type="text" value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder="Your organisation or company"
                  className="w-full border border-black/15 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                />
              </div>
              <button
                onClick={handleContactNext}
                disabled={!canProceed}
                className={`btn-primary w-full justify-center ${!canProceed ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                Begin Assessment →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Assessment (one question per slide) ─────────────────────────────────────
  const progressPct = totalQuestions > 0
    ? Math.round(((currentQuestionIdx + (currentAnswer !== undefined ? 1 : 0)) / totalQuestions) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SiteNav />

      <div className="sticky top-16 z-20 bg-white border-b border-black/8">
        <div className="max-w-3xl mx-auto px-6 pt-5 pb-4">
          <div className="flex items-baseline justify-between mb-2.5">
            <p className="section-label">Needs Assessment</p>
            {totalQuestions > 0 && (
              <p className="text-xs font-bold tracking-widest uppercase text-black/40">
                {Math.min(currentQuestionIdx + 1, totalQuestions)} / {totalQuestions}
              </p>
            )}
          </div>
          <div className="h-1 w-full bg-black/8 overflow-hidden">
            <div className="h-full bg-[#C9A84C] transition-all duration-500 ease-out" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 md:py-20">
        <div className="max-w-2xl w-full">

          {questionsLoading && (
            <div className="text-center py-20">
              <div className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin mx-auto" />
              <p className="text-sm text-black/60 mt-4">Preparing your assessment…</p>
            </div>
          )}

          {questionsError && !questionsLoading && (
            <div className="p-5 bg-red-50 border-l-4 border-[#C9A84C] text-black text-sm">
              <p className="font-semibold mb-1">Unable to load the assessment</p>
              <p>{questionsError}</p>
            </div>
          )}

          {!questionsLoading && !questionsError && currentQuestion && (
            <div key={currentQuestion.questionKey} className={`flex flex-col gap-8 ${slideDirection === 'forward' ? 'slide-forward' : 'slide-back'}`}>
              <div>
                <p className="section-label mb-2">{currentQuestion.categoryName}</p>
                <p className="text-xs tracking-wider uppercase text-black/40 font-semibold">
                  Question {currentQuestion.questionIdxInCategory + 1} of {currentQuestion.totalInCategory} in this section
                </p>
              </div>

              <h2 className="font-display text-2xl md:text-3xl font-semibold text-black leading-tight">
                {currentQuestion.questionText}
              </h2>

              <p className="text-sm text-black/60 -mt-3">
                Indicate the frequency with which this is true.
              </p>

              <div className="flex flex-col gap-2.5 mt-2">
                {ANSWER_LABELS.map((opt) => {
                  const isSelected = currentAnswer === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => handleAnswer(currentQuestion.questionKey, opt.value)}
                      className={`group text-left px-5 py-4 border-2 transition-all duration-150 flex items-center gap-4 ${
                        isSelected
                          ? 'bg-[#C9A84C] text-black border-[#C9A84C] shadow-md'
                          : 'bg-white text-black border-black/10 hover:border-black hover:bg-black/[0.02]'
                      }`}
                    >
                      <span className={`w-7 h-7 flex items-center justify-center text-sm font-bold tracking-wide ${
                        isSelected ? 'bg-black text-white' : 'bg-black/5 text-black group-hover:bg-black group-hover:text-white'
                      } transition-colors`}>
                        {opt.value}
                      </span>
                      <span className="text-sm md:text-base font-semibold text-black">{opt.label}</span>
                    </button>
                  );
                })}
              </div>

              {error && (
                <div className="p-4 bg-red-50 border-l-4 border-[#C9A84C] text-black text-sm">{error}</div>
              )}

              {isLastQuestion && currentAnswer !== undefined && (
                <div className="border-t border-black/10 pt-8 mt-4 flex flex-col gap-6">
                  <div className="flex justify-center">
                    <TurnstileWidget onToken={setTurnstileToken} />
                  </div>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || !turnstileToken}
                    className={`btn-primary w-full justify-center ${submitting || !turnstileToken ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    {submitting ? 'Submitting…' : 'Submit Assessment'}
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button onClick={handleBack} className="text-sm font-semibold text-black/60 hover:text-black flex items-center gap-1 transition-colors">
                  ← Back
                </button>
                {!isLastQuestion && currentAnswer !== undefined && (
                  <button onClick={handleNextQuestion} className="text-sm font-semibold text-[#C9A84C] hover:opacity-80 flex items-center gap-1 transition-opacity">
                    Next →
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
