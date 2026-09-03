import { track } from "@vercel/analytics";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ClipboardCopy,
  Clock3,
  Lightbulb,
  RotateCcw,
  Sparkles,
} from "lucide-react";

const UNSURE = "unsure";

type EventLogEntry = {
  id: number;
  at: string;
  name: string;
  detail?: Record<string, unknown>;
};

let eventSeq = 0;

function toTrackProps(
  detail?: Record<string, unknown>,
): Record<string, string | number | boolean | null> {
  if (!detail) return {};
  const props: Record<string, string | number | boolean | null> = {};
  for (const [key, value] of Object.entries(detail)) {
    if (
      value === null ||
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      props[key] = value;
    } else {
      props[key] = JSON.stringify(value);
    }
  }
  return props;
}

function logEvent(
  name: string,
  detail?: Record<string, unknown>,
): EventLogEntry {
  const entry: EventLogEntry = {
    id: ++eventSeq,
    at: new Date().toISOString(),
    name,
    detail,
  };
  console.info(`[RoutineLab] ${name}`, detail ?? {});
  track(name, toTrackProps(detail));
  return entry;
}

type ProtocolBlock = {
  timeBlock: string;
  action: string;
};

type TargetCriteria = {
  taskType: string;
  energyPeak: string;
  maxFocusTime: string;
  primaryChallenge: string;
  workStructure: string;
};

export type AnswerKey = keyof TargetCriteria;

export type UserAnswers = Record<AnswerKey, string[]> & {
  notes: Partial<Record<AnswerKey, string>>;
};

type TimeManagementMethod = {
  id: string;
  name: string;
  tagline: string;
  corePrinciples: string[];
  targetCriteria: TargetCriteria;
  dailyProtocol: ProtocolBlock[];
  customTips: string[];
};

type QuestionOption = {
  id: string;
  lead?: string;
  label: string;
  value: string;
};

type QuestionnaireQuestion = {
  id: AnswerKey;
  title: string;
  subtitle: string;
  selection: "single" | "multiple";
  options: QuestionOption[];
};

export const timeManagementDatabase: TimeManagementMethod[] = [
  {
    id: "deep-work",
    name: "Deep Work Protocol",
    tagline:
      "Long, quiet focus blocks for the work that actually moves the needle.",
    corePrinciples: [
      "Protect a few core tasks each day instead of scattering attention.",
      "Turn off messages and notifications during focus blocks.",
      "Save your sharpest hours for building, thinking, or solving hard problems.",
    ],
    targetCriteria: {
      taskType: "Deep Work",
      energyPeak: "Early morning",
      maxFocusTime: "90+ min",
      primaryChallenge: "Procrastination and distractions",
      workStructure: "Strict time blocks",
    },
    dailyProtocol: [
      {
        timeBlock: "08:00 – 09:30",
        action:
          "First deep-work block: your main build or thinking task. Notifications off.",
      },
      {
        timeBlock: "09:30 – 09:45",
        action: "Short reset: stretch, water, no screens.",
      },
      {
        timeBlock: "09:45 – 11:15",
        action:
          "Second deep-work block: keep going on the same hard problem.",
      },
      {
        timeBlock: "11:15 – 12:00",
        action: "Batch email, chat, and messages in one sitting.",
      },
      {
        timeBlock: "12:00 – 13:00",
        action: "Lunch and a real break.",
      },
      {
        timeBlock: "13:00 – 15:00",
        action:
          "Lighter work: reviews, admin, or meetings while energy is lower.",
      },
    ],
    customTips: [
      "Decide tonight what you will open first tomorrow, so mornings don’t start with scrolling.",
      "Use a blocker (Freedom, Focus, or your phone’s Focus mode) during the morning blocks.",
      "Set office hours for email so incoming messages don’t cut your train of thought.",
    ],
  },
  {
    id: "pomodoro-flow",
    name: "Pomodoro Focus & Sprint",
    tagline:
      "Short, timed sprints with built-in breaks so you can keep a rhythm all day.",
    corePrinciples: [
      "Work in fixed bursts (25/5 or 50/10) instead of waiting for motivation.",
      "Stack small wins so the day still feels like progress.",
      "Take the breaks on purpose — they keep you from burning out mid-afternoon.",
    ],
    targetCriteria: {
      taskType: "Multi-project",
      energyPeak: "Midday",
      maxFocusTime: "30-45 min",
      primaryChallenge: "Hard to keep a consistent schedule",
      workStructure: "Strict time blocks",
    },
    dailyProtocol: [
      {
        timeBlock: "Cycles 1–2",
        action: "25 minutes on task A, then a 5-minute break.",
      },
      {
        timeBlock: "Cycles 3–4",
        action: "25 minutes on task B, then a 5-minute break.",
      },
      {
        timeBlock: "Midday",
        action: "After four cycles, take a longer 20–30 minute break.",
      },
      {
        timeBlock: "Cycles 5–6",
        action: "Admin and communication in 25-minute chunks.",
      },
      {
        timeBlock: "End of day",
        action: "Write down what finished and what’s first tomorrow.",
      },
    ],
    customTips: [
      "If a full Pomodoro feels too rigid, start with 20 minutes and grow from there.",
      "Keep a scratch pad for distracting thoughts so you can return to them on the break.",
      "Don’t skip breaks even when you’re in the zone — they protect energy for later.",
    ],
  },
  {
    id: "agile-personal",
    name: "Agile Personal Kanban",
    tagline:
      "A simple board that shows what’s next, what’s in progress, and what’s done.",
    corePrinciples: [
      "See all your work in one place: To Do, Doing, Done.",
      "Limit work in progress so you stop starting and start finishing.",
      "Reprioritize as the day changes — that’s a feature, not a failure.",
    ],
    targetCriteria: {
      taskType: "Multi-project",
      energyPeak: "Evening/night",
      maxFocusTime: "45-60 min",
      primaryChallenge: "Too many tasks, no clear priorities",
      workStructure: "Flexible and agile",
    },
    dailyProtocol: [
      {
        timeBlock: "Start of day",
        action:
          "Pick only 3 important tasks from the backlog and move them to Doing.",
      },
      {
        timeBlock: "Morning / midday",
        action:
          "Work the open cards. Don’t start a new one until one is done or parked.",
      },
      {
        timeBlock: "Midday check",
        action:
          "Scan the board, drop noise, and reorder by what is actually urgent.",
      },
      {
        timeBlock: "End of day",
        action:
          "Move finished work to Done and queue a light plan for tomorrow.",
      },
    ],
    customTips: [
      "When the list feels endless, use a hard cap: at most 3 active tasks at once.",
      "Tag items as now / later so urgency is visible, not guessed.",
      "Move a card back to the backlog if the situation changed. That’s allowed.",
    ],
  },
  {
    id: "creative-flow",
    name: "Creative Flow State",
    tagline:
      "A looser rhythm for writing, making, and thinking sideways.",
    corePrinciples: [
      "Give yourself a long, flexible window when energy is high.",
      "Separate drafting from editing — don’t polish while you’re inventing.",
      "Use your peak hours for the messy, generative part of the work.",
    ],
    targetCriteria: {
      taskType: "Creative work",
      energyPeak: "Early morning",
      maxFocusTime: "90+ min",
      primaryChallenge: "Procrastination and distractions",
      workStructure: "Flexible and agile",
    },
    dailyProtocol: [
      {
        timeBlock: "Peak hours",
        action:
          "Draft freely. No editing, no judging, no switching to email.",
      },
      {
        timeBlock: "Reset",
        action: "Walk, change rooms, or step away from the desk.",
      },
      {
        timeBlock: "Second wave",
        action: "Organize, shape, and edit what you made earlier.",
      },
      {
        timeBlock: "End of day",
        action: "Jot leftover ideas so tomorrow’s session has a starting line.",
      },
    ],
    customTips: [
      "Early self-critique kills drafts. Write a bad first version on purpose.",
      "Use a repeatable mood cue: same light, same instrumental playlist.",
      "If you’re stuck, don’t force it — take 10 minutes and come back at a new angle.",
    ],
  },
];

function hasMatch(selected: string[] | undefined, target: string): boolean {
  if (!selected?.length || selected.includes(UNSURE)) return false;
  return selected.includes(target);
}

function scoreMethod(
  method: TimeManagementMethod,
  userAnswers: UserAnswers,
): number {
  const criteria = method.targetCriteria;
  let score = 0;
  if (hasMatch(userAnswers.taskType, criteria.taskType)) score += 3;
  if (hasMatch(userAnswers.energyPeak, criteria.energyPeak)) score += 2;
  if (hasMatch(userAnswers.maxFocusTime, criteria.maxFocusTime)) score += 2;
  if (hasMatch(userAnswers.primaryChallenge, criteria.primaryChallenge))
    score += 2;
  if (hasMatch(userAnswers.workStructure, criteria.workStructure)) score += 1;
  return score;
}

export function findBestMethod(userAnswers: UserAnswers): TimeManagementMethod {
  let bestMatch = timeManagementDatabase[0];
  let maxScore = -1;

  timeManagementDatabase.forEach((method) => {
    const score = scoreMethod(method, userAnswers);
    if (score > maxScore) {
      maxScore = score;
      bestMatch = method;
    }
  });

  return bestMatch;
}

export const questionnaireQuestions: QuestionnaireQuestion[] = [
  {
    id: "taskType",
    title: "What kind of work fills most of your day?",
    subtitle:
      "Pick every type of work that shows up regularly.",
    selection: "multiple",
    options: [
      {
        id: "build",
        lead: "Building & coding",
        label: "Making a product, a system, or solving a hard technical problem.",
        value: "Deep Work",
      },
      {
        id: "juggle",
        lead: "Projects & coordination",
        label: "Many workstreams, people, and moving pieces at the same time.",
        value: "Multi-project",
      },
      {
        id: "create",
        lead: "Writing, design, or making",
        label: "Original work that needs space to invent before you polish.",
        value: "Creative work",
      },
      {
        id: "meetings",
        lead: "Meetings, then focused work",
        label: "Calls and messages first; real work happens in the gaps.",
        value: "Deep Work",
      },
      {
        id: "task-unsure",
        label: "I'm not sure — the mix changes too much to pick one.",
        value: UNSURE,
      },
    ],
  },
  {
    id: "energyPeak",
    title: "When do you usually feel most clear-headed?",
    subtitle:
      "Think about when starting something hard feels easier, not when you wish you were productive.",
    selection: "multiple",
    options: [
      {
        id: "morning",
        label: "In the morning, once I’ve woken up a bit.",
        value: "Early morning",
      },
      {
        id: "midday",
        label: "Around midday or after lunch.",
        value: "Midday",
      },
      {
        id: "evening",
        label: "In the evening or at night, when it’s quieter.",
        value: "Evening/night",
      },
      {
        id: "energy-unsure",
        label: "I'm not sure — it changes from day to day.",
        value: UNSURE,
      },
    ],
  },
  {
    id: "maxFocusTime",
    title: "How long can you stay with one thing?",
    subtitle:
      "Choose the closest match. Be honest about when your mind starts to wander — not the ideal version of you.",
    selection: "single",
    options: [
      {
        id: "short",
        label: "About 30–45 minutes, then I need a reset.",
        value: "30-45 min",
      },
      {
        id: "medium",
        label: "Around 45–60 minutes if the task is clear.",
        value: "45-60 min",
      },
      {
        id: "long",
        label: "Once I’m in, I can go 90 minutes or more.",
        value: "90+ min",
      },
      {
        id: "focus-unsure",
        label: "I'm not sure — it depends on the task.",
        value: UNSURE,
      },
    ],
  },
  {
    id: "primaryChallenge",
    title: "What usually gets in the way?",
    subtitle:
      "Select anything that shows up often. This is the part the protocol will try to help with.",
    selection: "multiple",
    options: [
      {
        id: "distract",
        label:
          "I put things off, or I get pulled into messages, tabs, and interruptions.",
        value: "Procrastination and distractions",
      },
      {
        id: "overload",
        label:
          "I have too much on my list and I’m not sure what should come first.",
        value: "Too many tasks, no clear priorities",
      },
      {
        id: "routine",
        label:
          "I can have a good day, but I struggle to keep a steady routine.",
        value: "Hard to keep a consistent schedule",
      },
      {
        id: "challenge-unsure",
        label: "I'm not sure — a bit of all of this.",
        value: UNSURE,
      },
    ],
  },
  {
    id: "workStructure",
    title: "What kind of day feels easier to stick with?",
    subtitle:
      "There’s no right answer. Pick the setup that sounds less stressful, even if you don’t use it yet.",
    selection: "multiple",
    options: [
      {
        id: "blocks",
        label:
          "A plan with time blocks — I like knowing what I’m supposed to be doing when.",
        value: "Strict time blocks",
      },
      {
        id: "flex",
        label:
          "A flexible list I can rearrange as the day changes.",
        value: "Flexible and agile",
      },
      {
        id: "structure-unsure",
        label: "I'm not sure — I haven’t found a setup that sticks.",
        value: UNSURE,
      },
    ],
  },
];

function valuesFromSelection(
  question: QuestionnaireQuestion,
  selectedIds: string[] | undefined,
): string[] {
  if (!selectedIds?.length) return [];
  const values = question.options
    .filter((option) => selectedIds.includes(option.id))
    .map((option) => option.value);
  return [...new Set(values)];
}

function toUserAnswers(
  selectedIds: Partial<Record<AnswerKey, string[]>>,
  notes: Partial<Record<AnswerKey, string>>,
): UserAnswers {
  return {
    taskType: valuesFromSelection(questionnaireQuestions[0], selectedIds.taskType),
    energyPeak: valuesFromSelection(
      questionnaireQuestions[1],
      selectedIds.energyPeak,
    ),
    maxFocusTime: valuesFromSelection(
      questionnaireQuestions[2],
      selectedIds.maxFocusTime,
    ),
    primaryChallenge: valuesFromSelection(
      questionnaireQuestions[3],
      selectedIds.primaryChallenge,
    ),
    workStructure: valuesFromSelection(
      questionnaireQuestions[4],
      selectedIds.workStructure,
    ),
    notes,
  };
}

function collectedNotes(notes: Partial<Record<AnswerKey, string>>): string[] {
  return questionnaireQuestions.flatMap((question) => {
    const text = notes[question.id]?.trim();
    return text ? [`${question.title}: ${text}`] : [];
  });
}

function formatEta(remainingQuestions: number): string {
  if (remainingQuestions <= 0) return "Almost done — then your protocol";
  const seconds = remainingQuestions * 18;
  if (seconds >= 80) return "About a minute and a half left";
  if (seconds >= 50) return "About a minute left";
  return "Less than a minute left";
}

function formatProtocolText(
  method: TimeManagementMethod,
  notes: Partial<Record<AnswerKey, string>>,
): string {
  const principles = method.corePrinciples
    .map((item) => `• ${item}`)
    .join("\n");
  const protocol = method.dailyProtocol
    .map((block) => `${block.timeBlock}\n${block.action}`)
    .join("\n\n");
  const tips = method.customTips.map((item) => `• ${item}`).join("\n");
  const noteLines = collectedNotes(notes);

  return [
    method.name,
    method.tagline,
    "",
    "Core principles",
    principles,
    "",
    "Daily protocol",
    protocol,
    "",
    "Tips for your challenge",
    tips,
    ...(noteLines.length
      ? ["", "Your notes", ...noteLines.map((item) => `• ${item}`)]
      : []),
  ].join("\n");
}

export default function App() {
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedIds, setSelectedIds] = useState<
    Partial<Record<AnswerKey, string[]>>
  >({});
  const [notes, setNotes] = useState<Partial<Record<AnswerKey, string>>>({});
  const [result, setResult] = useState<TimeManagementMethod | null>(null);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">(
    "idle",
  );
  const startedRef = useRef(false);
  const lastViewKeyRef = useRef<string | null>(null);

  const question = questionnaireQuestions[stepIndex];
  const currentSelection = selectedIds[question.id] ?? [];
  const canContinue = currentSelection.length > 0;
  const totalSteps = questionnaireQuestions.length;
  const answeredCurrent = canContinue;
  const progressPercent = Math.min(
    100,
    ((stepIndex + (answeredCurrent ? 1 : 0.18)) / totalSteps) * 100,
  );
  const remainingQuestions = totalSteps - stepIndex - (answeredCurrent ? 1 : 0);
  const etaLabel = formatEta(remainingQuestions);

  const protocolText = useMemo(
    () => (result ? formatProtocolText(result, notes) : ""),
    [result, notes],
  );

  function record(name: string, detail?: Record<string, unknown>) {
    logEvent(name, detail);
  }

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    record("session_start", { questionCount: questionnaireQuestions.length });
  }, []);

  useEffect(() => {
    if (result) {
      document.title = `${result.name} | RoutineLab time management quiz`;
    } else {
      document.title = `Question ${stepIndex + 1} of ${questionnaireQuestions.length} | RoutineLab`;
    }
  }, [stepIndex, result]);

  useEffect(() => {
    const key = result ? `results:${result.id}` : `question:${stepIndex}`;
    if (lastViewKeyRef.current === key) return;
    lastViewKeyRef.current = key;

    if (result) {
      record("results_viewed", { methodId: result.id, methodName: result.name });
      return;
    }
    record("question_viewed", {
      step: stepIndex + 1,
      questionId: question.id,
      selection: question.selection,
      title: question.title,
    });
  }, [stepIndex, result?.id]);

  function toggleOption(option: QuestionOption) {
    const existing = selectedIds[question.id] ?? [];
    let next: string[];

    if (question.selection === "single") {
      next = existing.includes(option.id) ? [] : [option.id];
    } else if (option.value === UNSURE) {
      next = existing.includes(option.id) ? [] : [option.id];
    } else {
      const withoutUnsure = existing.filter((id) => {
        const match = question.options.find((item) => item.id === id);
        return match?.value !== UNSURE;
      });
      next = withoutUnsure.includes(option.id)
        ? withoutUnsure.filter((id) => id !== option.id)
        : [...withoutUnsure, option.id];
    }

    record("option_toggled", {
      questionId: question.id,
      step: stepIndex + 1,
      optionId: option.id,
      optionLead: option.lead ?? null,
      optionValue: option.value,
      selected: next.includes(option.id),
      selection: next,
    });
    setSelectedIds((current) => ({ ...current, [question.id]: next }));
  }

  function handleContinue() {
    if (!canContinue) {
      record("continue_blocked", {
        step: stepIndex + 1,
        questionId: question.id,
      });
      return;
    }

    const isLast = stepIndex === questionnaireQuestions.length - 1;
    record("continue_clicked", {
      step: stepIndex + 1,
      questionId: question.id,
      selectedIds: currentSelection,
      isLast,
    });

    if (!isLast) {
      setStepIndex((current) => current + 1);
      return;
    }

    const answers = toUserAnswers(selectedIds, notes);
    const match = findBestMethod(answers);
    const scores = timeManagementDatabase.map((method) => ({
      id: method.id,
      name: method.name,
      score: scoreMethod(method, answers),
    }));
    record("match_computed", {
      methodId: match.id,
      methodName: match.name,
      answers,
      scores,
    });
    setResult(match);
  }

  function handleBack() {
    if (stepIndex === 0 || result) return;
    record("back_clicked", {
      fromStep: stepIndex + 1,
      fromQuestionId: question.id,
      toStep: stepIndex,
    });
    setStepIndex((current) => current - 1);
  }

  function handleReset() {
    record("session_reset", {
      from: result ? "results" : "questionnaire",
      methodId: result?.id ?? null,
      step: stepIndex + 1,
    });
    setStepIndex(0);
    setSelectedIds({});
    setNotes({});
    setResult(null);
    setCopyStatus("idle");
  }

  async function handleCopy() {
    record("copy_clicked", { methodId: result?.id ?? null });
    try {
      await navigator.clipboard.writeText(protocolText);
      setCopyStatus("copied");
      record("protocol_copied", { method: "clipboard", methodId: result?.id });
    } catch {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = protocolText;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.top = "-9999px";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(textarea);
        setCopyStatus(ok ? "copied" : "error");
        record(ok ? "protocol_copied" : "protocol_copy_failed", {
          method: "execCommand",
          methodId: result?.id,
        });
      } catch {
        setCopyStatus("error");
        record("protocol_copy_failed", {
          method: "execCommand",
          methodId: result?.id,
        });
      }
    } finally {
      window.setTimeout(() => setCopyStatus("idle"), 1800);
    }
  }

  return (
    <div className="min-h-dvh bg-[#f4f1ea] text-stone-900">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-teal-800 focus:px-3 focus:py-2 focus:text-white"
      >
        Skip to quiz
      </a>
      <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-4 py-6 sm:px-6 sm:py-10">
        <header className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-wide text-stone-500 sm:text-sm">
              RoutineLab
            </p>
            <h1 className="mt-1 text-xl font-extrabold leading-snug text-stone-900 sm:text-2xl">
              Workflow & time management builder
            </h1>
            {!result ? (
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-stone-600 sm:text-base">
                Your answers shape a daily protocol: when to do deep work, how
                long to stay in a block, and which tips to use for the thing that
                usually gets in the way. Nothing is stored on a server.
              </p>
            ) : null}
          </div>
          {result ? (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 shadow-sm transition hover:bg-stone-50"
            >
              <RotateCcw className="size-4" aria-hidden />
              Start over
            </button>
          ) : null}
        </header>

        {!result ? (
          <div className="mb-5">
            <div className="mb-2 flex flex-col gap-1 text-sm text-stone-600 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Question {stepIndex + 1} of {totalSteps}
                {answeredCurrent ? " · answered" : ""}
              </span>
              <span className="text-stone-500">{etaLabel}</span>
            </div>
            <div
              className="h-2.5 overflow-hidden rounded-full bg-stone-200"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progressPercent)}
              aria-label="Quiz progress"
            >
              <div
                className="h-full rounded-full bg-teal-700 transition-[width] duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs text-stone-500">
              {Math.round(progressPercent)}% complete
            </p>
          </div>
        ) : null}

        <main id="main-content" className="flex-1" tabIndex={-1}>
          {result ? (
            <ResultsView
              method={result}
              notes={collectedNotes(notes)}
              copyStatus={copyStatus}
              onCopy={handleCopy}
              onReset={handleReset}
            />
          ) : (
            <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-8">
              <p className="text-sm font-medium text-teal-800">
                {question.selection === "single"
                  ? "Choose one"
                  : "Select all that apply"}
              </p>
              <h2 className="mt-1 text-2xl font-bold leading-tight text-stone-900 sm:text-3xl">
                {question.title}
              </h2>
              <p className="mt-2 text-base leading-relaxed text-stone-600 sm:text-lg">
                {question.subtitle}
              </p>

              <div
                className="mt-6 grid gap-3"
                role={question.selection === "single" ? "radiogroup" : undefined}
                aria-label={question.title}
              >
                {question.options.map((option) => {
                  const selected = currentSelection.includes(option.id);
                  const isUnsure = option.value === UNSURE;
                  const isSingle = question.selection === "single";

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => toggleOption(option)}
                      aria-pressed={isSingle ? undefined : selected}
                      aria-checked={isSingle ? selected : undefined}
                      role={isSingle ? "radio" : undefined}
                      className={`flex min-h-14 items-start gap-3 rounded-2xl border px-4 py-3 text-left text-base leading-relaxed transition sm:text-lg ${
                        selected
                          ? isUnsure
                            ? "border-stone-500 bg-stone-100 text-stone-900 shadow-sm"
                            : "border-teal-700 bg-teal-50 text-teal-950 shadow-sm"
                          : "border-stone-200 bg-stone-50 text-stone-800 hover:border-teal-600 hover:bg-white"
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex size-5 shrink-0 items-center justify-center border ${
                          isSingle ? "rounded-full" : "rounded-md"
                        } ${
                          selected
                            ? isUnsure
                              ? "border-stone-700 bg-stone-800 text-white"
                              : "border-teal-800 bg-teal-800 text-white"
                            : "border-stone-300 bg-white"
                        }`}
                      >
                        {selected ? (
                          isSingle ? (
                            <span className="size-2 rounded-full bg-white" />
                          ) : (
                            <Check className="size-3.5" aria-hidden />
                          )
                        ) : null}
                      </span>
                      <span className="min-w-0">
                        {option.lead ? (
                          <>
                            <span className="block font-bold text-stone-900">
                              {option.lead}
                            </span>
                            <span className="mt-0.5 block text-[0.95em] text-stone-600">
                              {option.label}
                            </span>
                          </>
                        ) : (
                          option.label
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>

              <label className="mt-5 block">
                <span className="text-sm font-medium text-stone-700">
                  Other / a personal note (optional)
                </span>
                <textarea
                  value={notes[question.id] ?? ""}
                  onChange={(event) => {
                    const value = event.target.value.slice(0, 280);
                    setNotes((current) => ({
                      ...current,
                      [question.id]: value,
                    }));
                  }}
                  onBlur={(event) =>
                    record("note_updated", {
                      questionId: question.id,
                      length: event.target.value.trim().length,
                    })
                  }
                  rows={2}
                  maxLength={280}
                  placeholder="A nuance that the options don’t capture…"
                  className="mt-1.5 w-full resize-y rounded-2xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm leading-relaxed text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-teal-700 focus:bg-white"
                />
              </label>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                {stepIndex > 0 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="inline-flex min-h-11 items-center justify-center gap-2 text-sm font-medium text-stone-600 hover:text-stone-900"
                  >
                    <ArrowLeft className="size-4" aria-hidden />
                    Back
                  </button>
                ) : (
                  <span />
                )}
                <button
                  type="button"
                  onClick={handleContinue}
                  aria-disabled={!canContinue}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-teal-800 px-5 text-base font-semibold text-white shadow-sm transition hover:bg-teal-700 aria-disabled:cursor-not-allowed aria-disabled:bg-stone-300 aria-disabled:text-stone-500 aria-disabled:hover:bg-stone-300"
                >
                  {stepIndex === questionnaireQuestions.length - 1
                    ? "See my protocol"
                    : "Continue"}
                  <ArrowRight className="size-4" aria-hidden />
                </button>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

function ResultsView({
  method,
  notes,
  copyStatus,
  onCopy,
  onReset,
}: {
  method: TimeManagementMethod;
  notes: string[];
  copyStatus: "idle" | "copied" | "error";
  onCopy: () => void;
  onReset: () => void;
}) {
  return (
    <div className="space-y-4 pb-8">
      <section className="rounded-3xl border border-teal-800/10 bg-teal-800 px-5 py-6 text-teal-50 shadow-sm sm:px-8 sm:py-8">
        <p className="inline-flex items-center gap-2 text-sm font-medium text-teal-100">
          <Sparkles className="size-4" aria-hidden />
          A starting system based on your answers
        </p>
        <h2 className="mt-2 text-2xl font-extrabold leading-tight sm:text-4xl">
          {method.name}
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-teal-50/90 sm:text-lg">
          {method.tagline}
        </p>
      </section>

      <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
        <h3 className="text-lg font-bold text-stone-900">Core principles</h3>
        <ul className="mt-4 space-y-3">
          {method.corePrinciples.map((principle) => (
            <li key={principle} className="flex gap-3 text-stone-700">
              <Check className="mt-1 size-5 shrink-0 text-teal-700" aria-hidden />
              <span className="leading-relaxed">{principle}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
        <h3 className="flex items-center gap-2 text-lg font-bold text-stone-900">
          <Clock3 className="size-5 text-teal-700" aria-hidden />
          Daily protocol
        </h3>
        <ol className="relative mt-5 space-y-4 border-l-2 border-teal-100 pl-5">
          {method.dailyProtocol.map((block) => (
            <li key={block.timeBlock} className="relative">
              <span className="absolute top-1.5 -left-[1.4rem] size-3 rounded-full bg-teal-700" />
              <p className="text-sm font-bold text-teal-800">{block.timeBlock}</p>
              <p className="mt-1 leading-relaxed text-stone-700">{block.action}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
        <h3 className="flex items-center gap-2 text-lg font-bold text-stone-900">
          <Lightbulb className="size-5 text-amber-600" aria-hidden />
          Tips for the challenge you described
        </h3>
        <ul className="mt-4 space-y-3">
          {method.customTips.map((tip) => (
            <li
              key={tip}
              className="rounded-2xl bg-amber-50 px-4 py-3 leading-relaxed text-stone-800"
            >
              {tip}
            </li>
          ))}
        </ul>
      </section>

      {notes.length > 0 ? (
        <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
          <h3 className="text-lg font-bold text-stone-900">Your notes</h3>
          <ul className="mt-4 space-y-3">
            {notes.map((note) => (
              <li
                key={note}
                className="rounded-2xl bg-stone-50 px-4 py-3 leading-relaxed text-stone-800"
              >
                {note}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="sticky bottom-4 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-teal-800 px-4 text-base font-semibold text-white shadow-lg transition hover:bg-teal-700"
        >
          {copyStatus === "copied" ? (
            <>
              <Check className="size-5" aria-hidden />
              Copied!
            </>
          ) : copyStatus === "error" ? (
            <>
              <ClipboardCopy className="size-5" aria-hidden />
              Copy failed
            </>
          ) : (
            <>
              <ClipboardCopy className="size-5" aria-hidden />
              Copy protocol
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-stone-300 bg-white px-4 text-base font-semibold text-stone-800 shadow-lg transition hover:bg-stone-50"
        >
          <RotateCcw className="size-5" aria-hidden />
          Start over
        </button>
      </div>
    </div>
  );
}
