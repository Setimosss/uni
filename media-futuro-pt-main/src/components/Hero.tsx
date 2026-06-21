import { ArrowRight, Sparkles, TrendingUp, BookOpen } from "lucide-react";

const stats = [
  { value: "2.500+", label: "Cursos & notas" },
  { value: "3 anos", label: "Histórico de médias" },
  { value: "100%", label: "Gratuito" },
];

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-hero">
      {/* glow orbs */}
      <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl animate-float-slow" />
      <div className="pointer-events-none absolute -right-24 top-40 h-72 w-72 rounded-full bg-accent/20 blur-3xl animate-float-slow [animation-delay:-3s]" />

      <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-sm font-medium text-muted-foreground">
            <Sparkles className="h-4 w-4 text-accent" />
            Acesso ao Ensino Superior 2025
          </span>

          <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.05] sm:text-6xl">
            O teu futuro na <span className="text-gradient">Universidade</span> começa aqui
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
            Simula a tua média interna, calcula a nota de candidatura com o peso dos
            exames nacionais e descobre em que cursos entras — tudo num só lugar.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="#simulador"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-brand px-6 py-3 font-semibold text-primary-foreground shadow-glow-sky transition-transform hover:scale-105"
            >
              Calcular a minha média
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#cursos"
              className="inline-flex items-center gap-2 rounded-2xl glass px-6 py-3 font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              <BookOpen className="h-4 w-4 text-primary" />
              Explorar cursos
            </a>
          </div>
        </div>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-3 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl glass p-4 text-center sm:p-6">
              <div className="font-display text-2xl font-bold text-primary sm:text-3xl">
                {s.value}
              </div>
              <div className="mt-1 text-xs text-muted-foreground sm:text-sm">{s.label}</div>
            </div>
          ))}
        </div>

        <p className="mt-8 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
          <TrendingUp className="h-3.5 w-3.5 text-accent" />
          Notas dos últimos colocados baseadas em dados ilustrativos de anos anteriores
        </p>
      </div>
    </section>
  );
}
