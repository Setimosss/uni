import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { LineChart as LineChartIcon, TrendingUp, TrendingDown, MousePointerClick, Minus } from "lucide-react";
import type { Curso } from "@/types/curso";

// Tooltip personalizado com o valor bem visível
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const val: number = payload[0].value;
  return (
    <div
      style={{
        background: "var(--color-popover)",
        border: "1px solid var(--color-border)",
        borderRadius: 14,
        padding: "10px 16px",
        color: "var(--color-foreground)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
      }}
    >
      <p style={{ margin: 0, fontSize: 11, color: "var(--color-muted-foreground)" }}>
        Último colocado {label}
      </p>
      <p style={{ margin: "4px 0 0", fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px" }}>
        {val.toFixed(1)}
        <span style={{ fontSize: 12, fontWeight: 400, marginLeft: 4, color: "var(--color-muted-foreground)" }}>
          pts
        </span>
      </p>
    </div>
  );
}

// Label com o valor diretamente no ponto
function CustomDot(props: any) {
  const { cx, cy, value, index, data } = props;
  const dataLength = data?.length ?? 0;
  const isFirst = index === 0;
  const isLast = index === dataLength - 1;
  const showLabel = isFirst || isLast;

  return (
    <g key={`dot-${index}`}>
      <circle cx={cx} cy={cy} r={8} fill="var(--color-primary)" opacity={0.15} />
      <circle cx={cx} cy={cy} r={5} fill="var(--color-primary)" stroke="var(--color-background)" strokeWidth={2} />
      {showLabel && (
        <text
          x={cx}
          y={cy - 14}
          textAnchor="middle"
          fontSize={11}
          fontWeight={700}
          fill="var(--color-primary)"
        >
          {typeof value === "number" ? value.toFixed(1) : ""}
        </text>
      )}
    </g>
  );
}

export function TendenciaMedias({ curso }: { curso?: Curso | null }) {
  if (!curso) {
    return (
      <div className="rounded-3xl glass p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <LineChartIcon className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-display text-xl font-bold">Tendência das médias</h3>
            <p className="text-sm text-muted-foreground">Último colocado — 3 anos</p>
          </div>
        </div>
        <div className="mt-8 flex h-64 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
          <MousePointerClick className="h-8 w-8" />
          <p>Seleciona um curso no explorador para veres a evolução das notas.</p>
        </div>
      </div>
    );
  }

  const history = [
    { year: "2022", grade: curso.media_2022 },
    { year: "2023", grade: curso.media_2023 },
    { year: "2024", grade: curso.media_2024 },
  ].filter((h): h is { year: string; grade: number } => h.grade != null);

  const first = history[0]?.grade ?? 0;
  const last = history[history.length - 1]?.grade ?? 0;
  const delta = last - first;

  // Domínio dinâmico: amplifica visualmente pequenas variações
  const grades = history.map((h) => h.grade);
  const minGrade = Math.min(...grades);
  const maxGrade = Math.max(...grades);
  const spread = maxGrade - minGrade;
  // Se a variação for pequena (< 5 pts), estreitamos a janela para que pareça mais dramático
  const padding = Math.max(spread * 0.8, 3);
  const yMin = Math.max(0, Math.floor(minGrade - padding));
  const yMax = Math.min(200, Math.ceil(maxGrade + padding));

  // Cor e ícone do delta
  const isUp = delta > 0.5;
  const isDown = delta < -0.5;
  const deltaColor = isUp ? "bg-destructive/15 text-destructive" : isDown ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground";
  const DeltaIcon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;
  // Nota: subida de nota = mais difícil entrar → vermelho. Descida = mais fácil → azul (primary)

  // Mini estatísticas
  const avg = grades.length > 0 ? grades.reduce((a, b) => a + b, 0) / grades.length : 0;
  const maxYear = history.find((h) => h.grade === maxGrade);
  const minYear = history.find((h) => h.grade === minGrade);

  return (
    <div className="rounded-3xl glass p-6 sm:p-8">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <LineChartIcon className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-display text-xl font-bold">{curso.nome_curso}</h3>
            <p className="text-sm text-muted-foreground">{curso.nome_instituicao}</p>
          </div>
        </div>

        {history.length > 1 && (
          <div className="flex items-center gap-2 text-sm">
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold ${deltaColor}`}>
              <DeltaIcon className="h-3.5 w-3.5" />
              {delta >= 0 ? "+" : ""}
              {delta.toFixed(1)} pts
            </span>
            <span className="text-muted-foreground">desde {history[0].year}</span>
          </div>
        )}
      </div>

      {/* Mini estatísticas */}
      {history.length > 1 && (
        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-border/40 bg-background/20 px-3 py-2.5 text-center">
            <div className="text-xs text-muted-foreground">Máximo</div>
            <div className="font-display text-lg font-bold text-primary">{maxGrade.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground/60">{maxYear?.year}</div>
          </div>
          <div className="rounded-2xl border border-border/40 bg-background/20 px-3 py-2.5 text-center">
            <div className="text-xs text-muted-foreground">Média</div>
            <div className="font-display text-lg font-bold">{avg.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground/60">3 anos</div>
          </div>
          <div className="rounded-2xl border border-border/40 bg-background/20 px-3 py-2.5 text-center">
            <div className="text-xs text-muted-foreground">Mínimo</div>
            <div className="font-display text-lg font-bold text-accent">{minGrade.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground/60">{minYear?.year}</div>
          </div>
        </div>
      )}

      {/* Gráfico */}
      {history.length === 0 ? (
        <div className="mt-8 flex h-48 items-center justify-center text-center text-muted-foreground">
          <p>Sem dados históricos para este curso.</p>
        </div>
      ) : (
        <div className="mt-6 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ left: -16, right: 8, top: 24, bottom: 4 }}>
              <defs>
                <linearGradient id="gradMedia" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} opacity={0.5} />
              <XAxis
                dataKey="year"
                stroke="var(--color-muted-foreground)"
                tickLine={false}
                axisLine={false}
                fontSize={12}
              />
              <YAxis
                domain={[yMin, yMax]}
                stroke="var(--color-muted-foreground)"
                tickLine={false}
                axisLine={false}
                fontSize={11}
                tickCount={4}
              />
              {/* Linha de referência na média */}
              {history.length > 1 && (
                <ReferenceLine
                  y={avg}
                  stroke="var(--color-muted-foreground)"
                  strokeDasharray="4 4"
                  strokeOpacity={0.4}
                  label={{
                    value: `média ${avg.toFixed(1)}`,
                    position: "insideTopRight",
                    fontSize: 10,
                    fill: "var(--color-muted-foreground)",
                  }}
                />
              )}
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "var(--color-accent)", strokeWidth: 1 }} />
              <Area
                type="monotone"
                dataKey="grade"
                stroke="var(--color-primary)"
                strokeWidth={2.5}
                fill="url(#gradMedia)"
                dot={(props: any) => (
                  <CustomDot key={`dot-${props.index}`} {...props} />
                )}
                activeDot={{ r: 7, fill: "var(--color-accent)", stroke: "var(--color-background)", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}