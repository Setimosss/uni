import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { GraduationCap } from "lucide-react";
import type { Curso } from "@/types/curso";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { SimuladorMedias } from "@/components/SimuladorMedias";
import { CalculadoraCandidatura } from "@/components/CalculadoraCandidatura";
import { TendenciaMedias } from "@/components/TendenciaMedias";
import { ExploradorCursos } from "@/components/ExploradorCursos";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "UniCalc PT — Calcula a tua média e entra na Universidade" },
      {
        name: "description",
        content:
          "Simula a média interna, calcula a nota de candidatura ao Ensino Superior e explora cursos e notas dos últimos colocados em Portugal.",
      },
      { property: "og:title", content: "UniCalc PT — O teu futuro na Universidade começa aqui" },
      {
        property: "og:description",
        content:
          "Simulador de médias, calculadora de candidatura e explorador de cursos do Ensino Superior português.",
      },
    ],
  }),
  component: Index,
});

function SectionHeader({
  badge,
  title,
  subtitle,
}: {
  badge: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <span className="text-sm font-semibold uppercase tracking-widest text-primary">
        {badge}
      </span>
      <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">{title}</h2>
      <p className="mt-3 text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function Index() {
  const [media, setMedia] = useState(0);
  const [examGrade, setExamGrade] = useState(0);
  const [selectedCurso, setSelectedCurso] = useState<Curso | null>(null);

  const handleSelectCurso = (curso: Curso) => {
    setSelectedCurso(curso);
    document.getElementById("tendencia")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen">
      <div className="px-4 sm:px-6">
        <Navbar />
      </div>

      <Hero />

      <main className="mx-auto max-w-6xl space-y-24 px-4 py-20 sm:px-6 sm:py-28">
        {/* Calculadoras */}
        <section id="simulador" className="scroll-mt-24">
          <SectionHeader
            badge="Passo 1"
            title="Calcula a tua média"
            subtitle="Simula a média interna e descobre a tua nota final de candidatura em segundos."
          />
          <div className="mt-10 space-y-6">
            <SimuladorMedias onMediaChange={setMedia} onExamChange={setExamGrade} />
            <div id="candidatura" className="mx-auto max-w-2xl scroll-mt-24">
              <CalculadoraCandidatura internalMedia={media} examGrade={examGrade} />
            </div>
          </div>
        </section>

        {/* Tendência */}
        <section id="tendencia" className="scroll-mt-24">
          <SectionHeader
            badge="Dados"
            title="Como evoluem as notas"
            subtitle="Tendência do último colocado nos últimos 3 anos para planeares com confiança."
          />
          <div className="mt-10">
            <TendenciaMedias curso={selectedCurso} />
          </div>
        </section>

        {/* Cursos */}
        <section id="cursos" className="scroll-mt-24">
          <SectionHeader
            badge="Passo 2"
            title="Explora os cursos"
            subtitle="Pesquisa, filtra por área e descobre em que cursos entras com a tua nota."
          />
          <div className="mt-10">
            <ExploradorCursos onSelect={handleSelectCurso} />
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-10 text-center sm:px-6">
          <span className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-brand text-primary-foreground">
              <GraduationCap className="h-4 w-4" />
            </span>
            UniCalc <span className="text-primary">PT</span>
          </span>
          <p className="max-w-md text-sm text-muted-foreground">
            Ferramenta de apoio à candidatura ao Ensino Superior. Dados ilustrativos —
            confirma sempre as notas oficiais na DGES.
          </p>
          <p className="text-xs text-muted-foreground/70">
            © {new Date().getFullYear()} UniCalc PT. Feito para estudantes portugueses.
          </p>
          <div className="pt-4">
            <p className="text-xs font-light tracking-wide text-slate-400">
              Criado com <span className="text-accent">♥</span> por MADS
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}