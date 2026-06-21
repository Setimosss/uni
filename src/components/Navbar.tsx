import { GraduationCap, Calculator, Compass, Sparkles } from "lucide-react";

const links = [
  { href: "#simulador", label: "Simulador", icon: Calculator },
  { href: "#candidatura", label: "Candidatura", icon: Sparkles },
  { href: "#cursos", label: "Cursos", icon: Compass },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="mx-auto mt-4 flex max-w-6xl items-center justify-between gap-4 rounded-2xl glass px-4 py-3 sm:px-6">
        <a href="#top" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand text-primary-foreground shadow-glow-sky">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">
            UniCalc <span className="text-primary">PT</span>
          </span>
        </a>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <l.icon className="h-4 w-4" />
              {l.label}
            </a>
          ))}
        </nav>

        <a
          href="#simulador"
          className="rounded-xl bg-gradient-brand px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow-sky transition-transform hover:scale-105"
        >
          Começar
        </a>
      </div>
    </header>
  );
}
