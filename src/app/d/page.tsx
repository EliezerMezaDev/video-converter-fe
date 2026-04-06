import Link from "next/link";
import { Video, ArrowRight, Zap, Shield, Layers, Music2 } from "lucide-react";
import { Card, CardContent } from "@/src/shared/shadcn/components/ui/card";
import { Badge } from "@/src/shared/shadcn/components/ui/badge";

const tools = [
  {
    id: "converter",
    href: "/d/converter",
    icon: Video,
    label: "Video",
    title: "Convertidor de Video",
    description: "Convierte archivos MOV a MP4 de forma instantánea. Soporta lotes de archivos con seguimiento en tiempo real del progreso.",
    features: ["Conversión por lote", "Progreso en tiempo real", "Sin pérdida de calidad"],
    badge: "Disponible",
  },
  {
    id: "music-search",
    href: "/d/music",
    icon: Music2,
    label: "Música",
    title: "Búsqueda de Música",
    description: "Encuentra y descarga música libre de derechos desde la biblioteca de Pixabay. Previsualiza y filtra por género.",
    features: ["Libre de derechos", "Preview en línea", "Filtros por género"],
    badge: "Disponible",
  },
];

const highlights = [
  { icon: Zap,    title: "Rápido",    description: "Procesamiento en background con notificaciones en tiempo real vía WebSocket." },
  { icon: Shield, title: "Seguro",    description: "Los archivos se eliminan del servidor inmediatamente tras la descarga." },
  { icon: Layers, title: "Por lotes", description: "Sube y convierte múltiples archivos en una sola operación." },
];

export default function OverviewPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10 flex flex-col gap-12">

      {/* Hero */}
      <section className="flex flex-col gap-3">
        <Badge variant="outline" className="w-fit text-primary border-primary/40 bg-primary/5">
          Web Utils
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight">Bienvenido al panel de utilidades</h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Un conjunto de herramientas web para simplificar tus flujos de trabajo. Selecciona una utilidad para comenzar.
        </p>
      </section>

      {/* Tool cards */}
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Utilidades disponibles</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link key={tool.id} href={tool.href} className="group focus-visible:outline-none">
                <Card className="h-full border border-border bg-card transition-all duration-200 hover:border-primary/50 hover:shadow-md hover:shadow-primary/5">
                  <CardContent className="flex h-full flex-col gap-4 p-6">
                    <div className="flex items-start justify-between">
                      <div className="grid size-11 place-content-center rounded-xl border border-primary/20 bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                        <Icon className="size-5" />
                      </div>
                      <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs">
                        {tool.badge}
                      </Badge>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{tool.label}</span>
                      <h3 className="text-lg font-semibold leading-tight">{tool.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{tool.description}</p>
                    </div>
                    <div className="mt-auto flex flex-wrap gap-1.5">
                      {tool.features.map(f => (
                        <span key={f} className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">{f}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all duration-150">
                      Abrir utilidad <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}

          {/* Coming soon */}
          <Card className="h-full border border-dashed border-border bg-muted/30">
            <CardContent className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
              <div className="grid size-11 place-content-center rounded-xl border border-border bg-muted text-muted-foreground">
                <Layers className="size-5" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Próximamente</p>
              <p className="text-xs text-muted-foreground/70">Nuevas utilidades en desarrollo</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Highlights */}
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">¿Por qué Web Utils?</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {highlights.map(h => {
            const Icon = h.icon;
            return (
              <div key={h.title} className="flex flex-col gap-2 rounded-xl border border-border bg-card p-5">
                <div className="grid size-9 place-content-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-4" />
                </div>
                <p className="font-semibold text-sm">{h.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{h.description}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}