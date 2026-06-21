import { Grid3x3, Target } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Props = {
  subjectName: string;
  goal?: number; // meta de nota final (0–20)
  trigger: React.ReactNode;
};

// Notas plausíveis no 1.º teste para gerar os cenários
const FIRST_TESTS = [10, 12, 14, 16, 18];

function toneFor(value: number) {
  if (value >= 16) return "text-primary";
  if (value >= 12) return "text-foreground";
  if (value >= 9.5) return "text-accent";
  return "text-destructive";
}

export function MatrizCenarios({ subjectName, goal, trigger }: Props) {
  // Se não houver meta definida, assumimos 14 (positiva sólida) para os cenários
  const meta = goal && goal >= 0 && goal <= 20 ? goal : 14;

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg rounded-3xl glass border-border/60 backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <Grid3x3 className="h-4 w-4" />
            </span>
            Matriz de cenários — {subjectName || "disciplina"}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5 text-accent" />
            Simulações para uma meta de <span className="font-semibold text-accent">{meta}</span>{" "}
            valores na disciplina.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 overflow-hidden rounded-2xl border border-border/60">
          <table className="w-full text-center text-sm">
            <thead>
              <tr className="bg-secondary/60">
                <th className="px-3 py-3 text-xs font-semibold text-muted-foreground">
                  Se tirares no 1.º Teste
                </th>
                <th className="px-3 py-3 text-xs font-semibold text-accent">
                  Precisas no 2.º Teste
                </th>
                <th className="px-3 py-3 text-xs font-semibold text-primary">
                  Média Final
                </th>
              </tr>
            </thead>
            <tbody>
              {FIRST_TESTS.map((t1) => {
                const needed = meta * 2 - t1;
                const impossible = needed > 20;
                const achieved = needed <= 0;
                const final = impossible ? (t1 + 20) / 2 : meta;
                return (
                  <tr key={t1} className="border-t border-border/40">
                    <td className="px-3 py-2.5 font-bold tabular-nums text-foreground">{t1}</td>
                    <td className="px-3 py-2.5 font-bold tabular-nums">
                      {impossible ? (
                        <span className="text-destructive">Impossível</span>
                      ) : achieved ? (
                        <span className="text-primary">Qualquer nota</span>
                      ) : (
                        <span className="text-accent">{needed.toFixed(1)}</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 font-bold tabular-nums">
                      <span className={toneFor(final)}>{final.toFixed(1)}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="mt-1 text-xs text-muted-foreground">
          Cálculo: nota necessária = (meta × 2) − nota do 1.º teste. Se for superior a 20, a meta é
          inalcançável apenas com estes dois testes.
        </p>
      </DialogContent>
    </Dialog>
  );
}
