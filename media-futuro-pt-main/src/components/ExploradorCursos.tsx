import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Users, Compass, CheckCircle2, Target, Loader2, Plus, TrendingUp, TrendingDown, GitCompare, X, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Curso } from "@/types/curso";

type Natureza = "all" | "Público" | "Privado";
type TipoEnsino = "all" | "Universitário" | "Politécnico";

const PAGE_SIZE = 17;
const MAX_COMPARE = 3;

// ============================================================
// MiniBars
// ============================================================
function MiniBars({ curso }: { curso: Curso }) {
  const values = [curso.media_2022, curso.media_2023, curso.media_2024].filter(
    (v): v is number => v != null,
  );
  if (values.length === 0) return null;
  const max = Math.max(...values);
  const min = Math.min(...values) - 4;
  return (
    <div className="flex items-end gap-1" aria-hidden>
      {values.map((grade, i) => {
        const pct = ((grade - min) / (max - min || 1)) * 100;
        return (
          <div key={i} className="w-1.5 rounded-full bg-gradient-brand" style={{ height: `${Math.max(20, pct)}%` }} />
        );
      })}
    </div>
  );
}

// ============================================================
// TrendAlert
// ============================================================
function TrendAlert({ curso }: { curso: Curso }) {
  const v2022 = curso.media_2022;
  const v2024 = curso.media_2024;
  if (v2022 == null || v2024 == null) return null;
  const delta = v2024 - v2022;
  if (Math.abs(delta) < 2) return null;
  const isUp = delta > 0;
  return (
    <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${isUp ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
      {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {isUp ? `+${delta.toFixed(1)} pts em 3 anos` : `${delta.toFixed(1)} pts em 3 anos`}
    </span>
  );
}

// ============================================================
// Barra discreta no fundo (estilo Worten)
// ============================================================
function ComparadorBar({
  cursos,
  onRemove,
  onClear,
  onOpen,
}: {
  cursos: Curso[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onOpen: () => void;
}) {
  if (cursos.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 sm:px-6">
      <div className="mx-auto max-w-5xl rounded-2xl glass border border-border/60 shadow-2xl backdrop-blur-2xl">
        <div className="flex flex-wrap items-center gap-3 px-4 py-3">
          {/* Contador */}
          <div className="shrink-0">
            <div className="text-xs font-semibold text-muted-foreground">Comparador</div>
            <div className="font-display text-sm font-bold">{cursos.length}/{MAX_COMPARE}</div>
          </div>

          <div className="h-8 w-px bg-border/60 shrink-0 hidden sm:block" />

          {/* Slots */}
          <div className="flex flex-1 flex-wrap items-center gap-2">
            {Array.from({ length: MAX_COMPARE }).map((_, i) => {
              const c = cursos[i];
              return c ? (
                <div key={c.id} className="flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-3 py-1.5">
                  <span className="max-w-[160px] truncate text-xs font-semibold">{c.nome_curso}</span>
                  <button
                    type="button"
                    onClick={() => onRemove(c.id)}
                    className="shrink-0 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div key={i} className="hidden sm:flex h-8 w-28 items-center justify-center rounded-xl border border-dashed border-border/40 text-xs text-muted-foreground/40">
                  + curso
                </div>
              );
            })}
          </div>

          {/* Ações */}
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={onClear}
              className="rounded-xl px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              Limpar
            </button>
            <button
              type="button"
              onClick={onOpen}
              disabled={cursos.length < 2}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-brand px-4 py-2 text-sm font-bold text-primary-foreground shadow-glow-sky transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <GitCompare className="h-4 w-4" />
              Comparar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Modal de comparação (sheet que sobe da parte inferior)
// ============================================================
function ComparadorModal({
  cursos,
  onRemove,
  onClose,
  myGrade,
}: {
  cursos: Curso[];
  onRemove: (id: string) => void;
  onClose: () => void;
  myGrade: number;
}) {
  const rows = [
    { label: "Instituição", render: (c: Curso) => c.nome_instituicao ?? "—" },
    { label: "Tipo", render: (c: Curso) => c.grau ?? c.tipo_ensino ?? "—" },
    { label: "Natureza", render: (c: Curso) => c.natureza ?? "—" },
    { label: "Vagas", render: (c: Curso) => c.vagas_estimadas != null ? `${c.vagas_estimadas}` : "—" },
    { label: "2022", render: (c: Curso) => c.media_2022 != null ? c.media_2022.toFixed(1) : "—" },
    { label: "2023", render: (c: Curso) => c.media_2023 != null ? c.media_2023.toFixed(1) : "—" },
    { label: "2024", render: (c: Curso) => c.media_2024 != null ? c.media_2024.toFixed(1) : "—" },
  ] satisfies { label: string; render: (c: Curso) => string }[];

  const numericRows = ["2022", "2023", "2024", "Vagas"];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl mx-4 mb-4 rounded-3xl glass border border-border/60 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <GitCompare className="h-5 w-5 text-primary" />
            <span className="font-display text-lg font-bold">Comparador</span>
            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
              {cursos.length}/{MAX_COMPARE}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-t border-border/40">
                <th className="w-28 px-5 py-4 text-left text-xs font-semibold text-muted-foreground" />
                {cursos.map((c) => {
                  const lastGrade = c.media_2024 ?? c.media_2023 ?? c.media_2022 ?? 0;
                  const eligible = myGrade > 0 && lastGrade > 0 && myGrade >= lastGrade;
                  return (
                    <th key={c.id} className="px-5 py-4 text-left align-top">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-display text-sm font-bold leading-snug">{c.nome_curso}</div>
                          <div className="mt-0.5 text-xs text-muted-foreground">{c.nome_instituicao}</div>
                          {eligible && (
                            <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-xs font-semibold text-accent">
                              <Trophy className="h-3 w-3" />
                              Entras!
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemove(c.id)}
                          className="shrink-0 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const isNumeric = numericRows.includes(row.label);
                const values = cursos.map((c) => {
                  const raw = row.render(c);
                  return raw !== "—" ? parseFloat(raw) : null;
                });
                const validVals = values.filter((v): v is number => v !== null);
                const minVal = validVals.length > 0 ? Math.min(...validVals) : null;
                const maxVal = validVals.length > 0 ? Math.max(...validVals) : null;

                return (
                  <tr key={row.label} className="border-t border-border/20">
                    <td className="px-5 py-2.5 text-xs font-semibold text-muted-foreground">{row.label}</td>
                    {cursos.map((c) => {
                      const val = row.render(c);
                      const numVal = val !== "—" ? parseFloat(val) : null;
                      const isBest = isNumeric && numVal !== null && validVals.length > 1 &&
                        (row.label === "Vagas" ? numVal === maxVal : numVal === minVal);
                      const isWorst = isNumeric && numVal !== null && validVals.length > 1 &&
                        (row.label === "Vagas" ? numVal === minVal : numVal === maxVal);
                      return (
                        <td
                          key={c.id}
                          className={`px-5 py-2.5 font-medium tabular-nums ${
                            isBest ? "font-bold text-primary" : isWorst ? "text-destructive/70" : "text-foreground"
                          }`}
                        >
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {cursos.length < MAX_COMPARE && (
          <p className="px-5 py-3 text-xs text-muted-foreground/60">
            Podes adicionar mais {MAX_COMPARE - cursos.length} curso{MAX_COMPARE - cursos.length !== 1 ? "s" : ""} — clica em "+" nos cards acima.
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Componente principal
// ============================================================
export function ExploradorCursos({
  onSelect,
}: {
  onSelect?: (curso: Curso) => void;
}) {
  const [query, setQuery] = useState("");
  const [natureza, setNatureza] = useState<Natureza>("all");
  const [tipoEnsino, setTipoEnsino] = useState<TipoEnsino>("all");
  const [myGrade, setMyGrade] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [comparar, setComparar] = useState<Curso[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [debouncedQuery, natureza, tipoEnsino]);

  const grade = parseFloat(myGrade.replace(",", ".")) || 0;
  const q = debouncedQuery;
  const isSearching = q.length >= 2 || natureza !== "all" || tipoEnsino !== "all";

  const { data: cursos = [], isLoading, error } = useQuery({
    queryKey: ["cursos", q, natureza, tipoEnsino],
    queryFn: async () => {
      const FETCH_SIZE = 1000;
      let allData: Curso[] = [];
      let from = 0;

      while (true) {
        let req = supabase
          .from("unicalc_cursos")
          .select("id, nome_instituicao, tipo_ensino, natureza, nome_curso, grau, vagas_estimadas, media_2024, media_2023, media_2022");

        if (q.length >= 2) req = req.or(`nome_curso.ilike.%${q}%,nome_instituicao.ilike.%${q}%`);
        if (natureza !== "all") req = req.eq("natureza", natureza);
        if (tipoEnsino !== "all") req = req.eq("tipo_ensino", tipoEnsino);

        const { data, error } = await req.order("nome_curso", { ascending: true }).range(from, from + FETCH_SIZE - 1);

        if (error) throw error;
        if (!data || data.length === 0) break;
        allData = [...allData, ...(data as unknown as Curso[])];
        if (data.length < FETCH_SIZE) break;
        from += FETCH_SIZE;
      }

      if (!isSearching) {
        for (let i = allData.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [allData[i], allData[j]] = [allData[j], allData[i]];
        }
      }
      return allData;
    },
  });

  const visibleCursos = useMemo(() => cursos.slice(0, visibleCount), [cursos, visibleCount]);
  const hasMore = visibleCount < cursos.length;

  const toggleComparar = (curso: Curso, e: React.MouseEvent) => {
    e.stopPropagation();
    setComparar((prev) => {
      const exists = prev.find((c) => c.id === curso.id);
      if (exists) return prev.filter((c) => c.id !== curso.id);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, curso];
    });
  };

  return (
    <div className={comparar.length > 0 ? "pb-24" : ""}>
      {/* Filtros */}
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Procura por curso ou instituição..."
            className="w-full rounded-2xl border border-input bg-background/40 py-3.5 pl-12 pr-4 text-base outline-none transition-shadow placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <FilterChip active={natureza === "all"} onClick={() => setNatureza("all")}>Todas</FilterChip>
            <FilterChip active={natureza === "Público"} onClick={() => setNatureza("Público")}>Público</FilterChip>
            <FilterChip active={natureza === "Privado"} onClick={() => setNatureza("Privado")}>Privado</FilterChip>
            <span className="mx-1 self-center text-muted-foreground/40">|</span>
            <FilterChip active={tipoEnsino === "all"} onClick={() => setTipoEnsino("all")}>Todos</FilterChip>
            <FilterChip active={tipoEnsino === "Universitário"} onClick={() => setTipoEnsino("Universitário")}>Universitário</FilterChip>
            <FilterChip active={tipoEnsino === "Politécnico"} onClick={() => setTipoEnsino("Politécnico")}>Politécnico</FilterChip>
          </div>

          <label className="flex items-center gap-2 rounded-2xl glass px-3 py-2">
            <Target className="h-4 w-4 text-accent" />
            <span className="text-sm text-muted-foreground">A minha nota</span>
            <input
              inputMode="decimal"
              value={myGrade}
              onChange={(e) => setMyGrade(e.target.value)}
              placeholder="0–200"
              className="w-20 rounded-lg border border-input bg-background/40 px-2 py-1 text-sm font-semibold outline-none focus:border-accent"
            />
          </label>
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Não foi possível carregar os cursos. Tenta novamente.
        </div>
      )}

      {isLoading ? (
        <div className="mt-10 flex flex-col items-center gap-2 text-center text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>A carregar cursos…</p>
        </div>
      ) : (
        <>
          {!error && cursos.length > 0 && (
            <p className="mt-4 text-xs text-muted-foreground/60">
              {isSearching
                ? `${cursos.length} curso${cursos.length !== 1 ? "s" : ""} encontrado${cursos.length !== 1 ? "s" : ""}`
                : "A mostrar cursos em destaque"}
            </p>
          )}

          <div className="mt-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleCursos.map((c) => {
              const lastGrade = c.media_2024 ?? c.media_2023 ?? c.media_2022 ?? 0;
              const eligible = grade > 0 && lastGrade > 0 && grade >= lastGrade;
              const isInComparar = comparar.some((x) => x.id === c.id);
              const compareFull = comparar.length >= MAX_COMPARE && !isInComparar;

              return (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => onSelect?.(c)}
                  className={`group relative flex flex-col rounded-3xl glass p-5 text-left transition-all hover:-translate-y-1 ${
                    eligible ? "ring-2 ring-accent/60 shadow-glow-pink" : ""
                  } ${isInComparar ? "ring-2 ring-primary/60 shadow-glow-sky" : ""}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="rounded-full bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary">
                      {c.grau ?? c.tipo_ensino ?? "Curso"}
                    </span>
                    <div className="flex items-center gap-2">
                      <MiniBars curso={c} />
                      <button
                        type="button"
                        onClick={(e) => toggleComparar(c, e)}
                        disabled={compareFull}
                        title={isInComparar ? "Remover do comparador" : "Adicionar ao comparador"}
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all ${
                          isInComparar
                            ? "border-primary bg-primary/20 text-primary"
                            : compareFull
                            ? "border-border/30 text-muted-foreground/30 cursor-not-allowed"
                            : "border-border/60 text-muted-foreground hover:border-primary hover:bg-primary/10 hover:text-primary"
                        }`}
                      >
                        {isInComparar ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  <h3 className="mt-3 font-display text-lg font-bold leading-snug">{c.nome_curso}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{c.nome_instituicao}</p>

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {c.vagas_estimadas != null && (
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {c.vagas_estimadas} vagas
                      </span>
                    )}
                    <TrendAlert curso={c} />
                  </div>

                  <div className="mt-4 flex items-end justify-between border-t border-border pt-4">
                    <div>
                      <div className="text-xs text-muted-foreground">Último colocado (2024)</div>
                      <div className="font-display text-2xl font-bold text-gradient">
                        {lastGrade > 0 ? lastGrade.toFixed(1) : "—"}
                      </div>
                    </div>
                    {eligible && (
                      <span className="flex items-center gap-1 rounded-full bg-accent/15 px-2.5 py-1 text-xs font-semibold text-accent">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Entras!
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {hasMore && (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                className="flex items-center gap-2 rounded-2xl glass px-6 py-3 text-sm font-semibold text-muted-foreground transition-all hover:text-foreground hover:shadow-glow-sky"
              >
                <Plus className="h-4 w-4" />
                Ver mais {Math.min(PAGE_SIZE, cursos.length - visibleCount)} cursos
              </button>
            </div>
          )}
        </>
      )}

      {!isLoading && !error && cursos.length === 0 && (
        <div className="mt-10 flex flex-col items-center gap-2 text-center text-muted-foreground">
          <Compass className="h-8 w-8" />
          <p>Nenhum curso encontrado. Tenta outra pesquisa.</p>
        </div>
      )}

      {/* Barra discreta no fundo */}
      <ComparadorBar
        cursos={comparar}
        onRemove={(id) => setComparar((prev) => prev.filter((c) => c.id !== id))}
        onClear={() => setComparar([])}
        onOpen={() => setModalOpen(true)}
      />

      {/* Modal de comparação */}
      {modalOpen && (
        <ComparadorModal
          cursos={comparar}
          onRemove={(id) => setComparar((prev) => prev.filter((c) => c.id !== id))}
          onClose={() => setModalOpen(false)}
          myGrade={grade}
        />
      )}
    </div>
  );
}

// ============================================================
// FilterChip
// ============================================================
function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-all ${
        active
          ? "bg-gradient-brand text-primary-foreground shadow-glow-sky"
          : "glass text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}