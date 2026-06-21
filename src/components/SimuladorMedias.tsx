import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Calculator,
  ChevronDown,
  GraduationCap,
  Info,
  Plus,
  Target,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { MatrizCenarios } from "./MatrizCenarios";

type Props = {
  onMediaChange: (media: number) => void;
  onExamChange?: (examGrade: number) => void;
};

type Year = "10" | "11" | "12";

type Test = { id: string; label: string; grade: string };
type Subject = {
  id: string;
  name: string;
  goal: string; // meta de nota final (0–20)
  tests: Test[];
};
type Exam = { id: string; name: string; selected: boolean; grade: string };

const years: Year[] = ["10", "11", "12"];

let counter = 0;
const newId = () => `id${++counter}`;

const makeTests = (): Test[] => [
  { id: newId(), label: "1.º Teste", grade: "" },
  { id: newId(), label: "2.º Teste", grade: "" },
];

const makeSubject = (name: string): Subject => ({
  id: newId(),
  name,
  goal: "",
  tests: makeTests(),
});

const initialYears: Record<Year, Subject[]> = {
  "10": [makeSubject("Português"), makeSubject("Matemática A"), makeSubject("Inglês")],
  "11": [makeSubject("Português"), makeSubject("Matemática A"), makeSubject("Biologia e Geologia")],
  "12": [makeSubject("Português"), makeSubject("Matemática A")],
};

const examCatalog = [
  "Matemática A",
  "Português",
  "Biologia e Geologia",
  "Física e Química A",
  "História A",
  "Geografia A",
  "Economia A",
  "Matemática B",
  "Desenho A",
];

const num = (s: string) => parseFloat(s.replace(",", "."));

// média de uma disciplina = média dos testes preenchidos
function subjectAverage(s: Subject): number | null {
  const filled = s.tests.map((t) => num(t.grade)).filter((g) => !isNaN(g) && g >= 0 && g <= 20);
  if (filled.length === 0) return null;
  return filled.reduce((a, b) => a + b, 0) / filled.length;
}

export function SimuladorMedias({ onMediaChange, onExamChange }: Props) {
  const [yearsData, setYearsData] = useState<Record<Year, Subject[]>>(initialYears);
  const [activeYear, setActiveYear] = useState<Year>("10");
  const [openSubject, setOpenSubject] = useState<string | null>(null);

  // Modo rápido (frente do cartão): média final direta por ano
  const [quickGrades, setQuickGrades] = useState<Record<Year, string>>({
    "10": "",
    "11": "",
    "12": "",
  });
  const [flipped, setFlipped] = useState(false); // false = frente (rápido) · true = trás (avançado)

  const [exams, setExams] = useState<Exam[]>(
    examCatalog.map((name) => ({ id: newId(), name, selected: false, grade: "" })),
  );

  // Média do modo rápido (0–20)
  const quickMedia = useMemo(() => {
    const vals = years
      .map((y) => num(quickGrades[y]))
      .filter((g) => !isNaN(g) && g >= 0 && g <= 20);
    if (vals.length === 0) return 0;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }, [quickGrades]);

  // Média do modo avançado (0–20): média de todas as disciplinas com notas
  const advancedMedia = useMemo(() => {
    const all = years.flatMap((y) => yearsData[y]);
    const avgs = all.map(subjectAverage).filter((v): v is number => v !== null);
    if (avgs.length === 0) return 0;
    return avgs.reduce((a, b) => a + b, 0) / avgs.length;
  }, [yearsData]);

  const media = flipped ? advancedMedia : quickMedia;

  const selectedExams = exams.filter((e) => e.selected);

  // Média dos exames selecionados com nota preenchida (escala 0–200)
  const examAverage = useMemo(() => {
    const vals = selectedExams
      .map((e) => parseFloat(e.grade.replace(",", ".")))
      .filter((g) => !isNaN(g) && g >= 0 && g <= 200);
    if (vals.length === 0) return 0;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }, [selectedExams]);

  useEffect(() => {
    onMediaChange(media);
  }, [media, onMediaChange]);

  useEffect(() => {
    onExamChange?.(examAverage);
  }, [examAverage, onExamChange]);

  const percent = Math.min(100, (media / 20) * 100);

  // ---- mutadores de disciplinas ----
  const updateSubject = (year: Year, id: string, patch: Partial<Subject>) =>
    setYearsData((d) => ({
      ...d,
      [year]: d[year].map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));

  const updateTest = (year: Year, sid: string, tid: string, grade: string) =>
    setYearsData((d) => ({
      ...d,
      [year]: d[year].map((s) =>
        s.id === sid
          ? { ...s, tests: s.tests.map((t) => (t.id === tid ? { ...t, grade } : t)) }
          : s,
      ),
    }));

  const addTest = (year: Year, sid: string) =>
    setYearsData((d) => ({
      ...d,
      [year]: d[year].map((s) =>
        s.id === sid
          ? { ...s, tests: [...s.tests, { id: newId(), label: `${s.tests.length + 1}.º Teste`, grade: "" }] }
          : s,
      ),
    }));

  const removeSubject = (year: Year, id: string) =>
    setYearsData((d) => ({ ...d, [year]: d[year].filter((s) => s.id !== id) }));

  const addSubject = (year: Year) =>
    setYearsData((d) => ({ ...d, [year]: [...d[year], makeSubject("")] }));

  // ---- exames ----
  const toggleExam = (id: string) =>
    setExams((list) => list.map((e) => (e.id === id ? { ...e, selected: !e.selected } : e)));
  const updateExamGrade = (id: string, grade: string) =>
    setExams((list) => list.map((e) => (e.id === id ? { ...e, grade } : e)));

  return (
    <div className="rounded-3xl glass p-5 sm:p-7">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <Calculator className="h-5 w-5" />
        </span>
        <div>
          <h3 className="font-display text-xl font-bold">Simulador de Médias</h3>
          <p className="text-sm text-muted-foreground">
            Gere exames nacionais e o progresso de cada ano por testes
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {/* ============ COLUNA ESQUERDA — EXAMES NACIONAIS ============ */}
        <div className="rounded-3xl border border-border/60 bg-background/30 p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-accent" />
            <h4 className="font-display text-base font-bold">Exames Nacionais</h4>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Seleciona os exames que precisas (escala 0–200).
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {exams.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => toggleExam(e.id)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                  e.selected
                    ? "border-accent bg-accent/15 text-accent shadow-glow-pink"
                    : "border-input bg-background/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                {e.name}
              </button>
            ))}
          </div>

          <div className="mt-5 space-y-2">
            {selectedExams.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border py-6 text-center text-xs text-muted-foreground">
                Escolhe um ou mais exames acima para inserires as notas.
              </p>
            ) : (
              selectedExams.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-accent/30 bg-accent/5 px-3 py-2.5"
                >
                  <span className="text-sm font-semibold">{e.name}</span>
                  <input
                    inputMode="decimal"
                    value={e.grade}
                    onChange={(ev) => updateExamGrade(e.id, ev.target.value)}
                    placeholder="0–200"
                    className="w-20 rounded-xl border border-input bg-background/60 px-2 py-1.5 text-center text-sm font-bold text-accent outline-none placeholder:text-muted-foreground/50 focus:border-accent focus:ring-2 focus:ring-accent/40"
                  />
                </div>
              ))
            )}
          </div>
        </div>

        {/* ============ COLUNA DIREITA — ANOS E PROGRESSO (CARD FLIP 3D) ============ */}
        <div className="flip-perspective">
          <div className={`flip-inner ${flipped ? "is-flipped" : ""}`}>
            {/* ---------- LADO A (FRENTE) — MODO RÁPIDO ---------- */}
            <div
              className={`flip-face rounded-3xl border border-border/60 bg-background/30 p-4 sm:p-5 ${
                flipped ? "absolute inset-0" : "relative"
              }`}
              aria-hidden={flipped}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  <h4 className="font-display text-base font-bold">Média Direta</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setFlipped(true)}
                  className="flex items-center gap-1.5 rounded-full bg-gradient-brand px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-glow-sky transition-transform hover:scale-105"
                >
                  <TrendingUp className="h-3.5 w-3.5" />
                  Acompanhar por Testes
                </button>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Introduz a média final de cada ano (escala 0–20).
              </p>

              <div className="mt-5 space-y-3">
                {years.map((y) => (
                  <div
                    key={y}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3"
                  >
                    <span className="text-sm font-semibold">{y}.º Ano</span>
                    <input
                      inputMode="decimal"
                      value={quickGrades[y]}
                      onChange={(e) =>
                        setQuickGrades((g) => ({ ...g, [y]: e.target.value }))
                      }
                      placeholder="0–20"
                      className="w-20 rounded-xl border border-input bg-background/60 px-2 py-2 text-center text-base font-bold text-primary outline-none placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* ---------- LADO B (TRÁS) — MODO AVANÇADO ---------- */}
            <div
              className={`flip-face flip-face-back rounded-3xl border border-border/60 bg-background/30 p-4 sm:p-5 ${
                flipped ? "relative" : "absolute inset-0"
              }`}
              aria-hidden={!flipped}
            >
              <div className="flex items-start justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setFlipped(false)}
                  className="flex items-center gap-1.5 rounded-full border border-input bg-background/40 px-3 py-1.5 text-xs font-bold text-muted-foreground transition-colors hover:text-foreground"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Média Direta
                </button>
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  <h4 className="font-display text-base font-bold">Anos &amp; Progresso</h4>
                </div>
              </div>

              {/* tabs */}
              <div className="mt-4 grid grid-cols-3 gap-2">
                {years.map((y) => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => setActiveYear(y)}
                    className={`rounded-2xl border px-3 py-2 text-sm font-semibold transition-all ${
                      activeYear === y
                        ? "border-primary bg-primary/15 text-primary shadow-glow-sky"
                        : "border-input bg-background/40 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {y}.º Ano
                  </button>
                ))}
              </div>

              <div className="mt-4 space-y-2.5">
                {yearsData[activeYear].map((s) => {
                  const avg = subjectAverage(s);
                  const open = openSubject === s.id;
                  return (
                    <SubjectCard
                      key={s.id}
                      subject={s}
                      average={avg}
                      open={open}
                      onToggleOpen={() => setOpenSubject(open ? null : s.id)}
                      onName={(name) => updateSubject(activeYear, s.id, { name })}
                      onGoal={(goal) => updateSubject(activeYear, s.id, { goal })}
                      onTest={(tid, grade) => updateTest(activeYear, s.id, tid, grade)}
                      onAddTest={() => addTest(activeYear, s.id)}
                      onRemove={() => removeSubject(activeYear, s.id)}
                    />
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => addSubject(activeYear)}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <Plus className="h-4 w-4" />
                Adicionar disciplina ao {activeYear}.º ano
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============ RESULTADO ============ */}
      <div className="mt-7">
        <div className="mb-2 flex items-end justify-between">
          <span className="text-sm font-medium text-muted-foreground">Média interna global</span>
          <span className="font-display text-3xl font-bold text-gradient">{media.toFixed(2)}</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-gradient-brand transition-[width] duration-700 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Info className="h-3.5 w-3.5" />
          {flipped ? "Média das disciplinas com notas" : "Média direta dos 3 anos"} · em escala 0–200:{" "}
          {(media * 10).toFixed(0)} pontos.
        </p>
      </div>
    </div>
  );
}

/* ============================================================= */

function SubjectCard({
  subject,
  average,
  open,
  onToggleOpen,
  onName,
  onGoal,
  onTest,
  onAddTest,
  onRemove,
}: {
  subject: Subject;
  average: number | null;
  open: boolean;
  onToggleOpen: () => void;
  onName: (v: string) => void;
  onGoal: (v: string) => void;
  onTest: (tid: string, grade: string) => void;
  onAddTest: () => void;
  onRemove: () => void;
}) {
  const goal = num(subject.goal);
  const hasGoal = !isNaN(goal) && goal >= 0 && goal <= 20;

  // previsão: nota necessária no(s) teste(s) em falta para atingir a meta
  const filled = subject.tests.filter((t) => {
    const g = num(t.grade);
    return !isNaN(g) && g >= 0 && g <= 20;
  });
  const remaining = subject.tests.length - filled.length;
  const sumFilled = filled.reduce((a, t) => a + num(t.grade), 0);

  let prediction: { needed: number; impossible: boolean; achieved: boolean } | null = null;
  if (hasGoal && remaining > 0 && filled.length > 0) {
    const needed = (goal * subject.tests.length - sumFilled) / remaining;
    prediction = {
      needed,
      impossible: needed > 20,
      achieved: needed <= 0,
    };
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card/40">
      {/* header */}
      <div className="flex items-center gap-2 p-2.5">
        <input
          value={subject.name}
          onChange={(e) => onName(e.target.value)}
          placeholder="Nome da disciplina"
          className="min-w-0 flex-1 rounded-xl border border-input bg-background/40 px-3 py-2 text-sm font-medium outline-none placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/40"
        />
        <span
          className={`w-12 shrink-0 rounded-lg px-1 py-1.5 text-center text-sm font-bold tabular-nums ${
            average === null ? "text-muted-foreground/50" : "text-primary"
          }`}
        >
          {average === null ? "–" : average.toFixed(1)}
        </span>
        <button
          type="button"
          onClick={onToggleOpen}
          aria-label="Gerir testes"
          className="flex shrink-0 items-center justify-center rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-primary/15 hover:text-primary"
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remover disciplina"
          className="flex shrink-0 items-center justify-center rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* corpo expandido — micro-simulação por testes */}
      {open && (
        <div className="space-y-3 border-t border-border/60 p-3">
          {/* meta */}
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Target className="h-3.5 w-3.5 text-accent" />
              Nota Meta
            </label>
            <input
              inputMode="decimal"
              value={subject.goal}
              onChange={(e) => onGoal(e.target.value)}
              placeholder="ex.: 15"
              className="w-16 rounded-lg border border-input bg-background/40 px-2 py-1.5 text-center text-sm font-bold text-accent outline-none placeholder:text-muted-foreground/50 focus:border-accent focus:ring-2 focus:ring-accent/40"
            />
            <span className="text-xs text-muted-foreground">/ 20</span>

            {filled.length === 0 && (
              <MatrizCenarios
                subjectName={subject.name}
                goal={hasGoal ? goal : undefined}
                trigger={
                  <button
                    type="button"
                    aria-label="Ver matriz de cenários"
                    className="ml-auto flex h-7 w-7 items-center justify-center rounded-full border border-primary/40 text-primary transition-colors hover:bg-primary/15"
                  >
                    <Info className="h-3.5 w-3.5" />
                  </button>
                }
              />
            )}
          </div>

          {/* testes */}
          <div className="grid gap-2 sm:grid-cols-2">
            {subject.tests.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-border/60 bg-background/30 px-3 py-2"
              >
                <span className="text-xs font-medium text-muted-foreground">{t.label}</span>
                <input
                  inputMode="decimal"
                  value={t.grade}
                  onChange={(e) => onTest(t.id, e.target.value)}
                  placeholder="0–20"
                  className="w-16 rounded-lg border border-input bg-background/40 px-2 py-1.5 text-center text-sm font-semibold outline-none placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/40"
                />
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={onAddTest}
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-primary"
          >
            <Plus className="h-3.5 w-3.5" />
            Adicionar teste
          </button>

          {/* previsão */}
          {prediction && (
            <div
              className={`rounded-xl border px-3 py-2.5 text-xs font-medium ${
                prediction.impossible
                  ? "border-destructive/40 bg-destructive/10 text-destructive"
                  : prediction.achieved
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-accent/40 bg-accent/10 text-accent"
              }`}
            >
              {prediction.achieved ? (
                <>🎉 Meta já garantida! Mesmo com 0 no(s) teste(s) restante(s) atinges os {goal}.</>
              ) : prediction.impossible ? (
                <>
                  ⚠️ Meta inalcançável: precisarias de {prediction.needed.toFixed(1)} (máx. 20). Tenta
                  ajustar a tua meta.
                </>
              ) : (
                <>
                  🎯 Precisas de tirar no mínimo{" "}
                  <span className="font-display text-sm font-bold">
                    {prediction.needed.toFixed(1)}
                  </span>{" "}
                  valores {remaining > 1 ? "em cada teste restante" : "no 2.º Teste"} para atingires a
                  tua meta!
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}