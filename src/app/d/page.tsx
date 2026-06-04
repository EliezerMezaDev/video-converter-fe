import type { Metadata } from "next";
import Link from "next/link";
import { Video, ArrowRight, Zap, Shield, Layers, Music2, ImageIcon } from "lucide-react";
import { Card, CardContent } from "@/src/shared/shadcn/components/ui/card";
import { Badge } from "@/src/shared/shadcn/components/ui/badge";
import { constructMetadata } from "@/src/shared/lib/seo/construct-metadata";

export const metadata: Metadata = constructMetadata("dashboard");

const tools = [
  {
    id: "converter",
    href: "/d/converter",
    icon: Video,
    label: "Video",
    title: "Convertidor de video",
    description: "Convierte archivos MOV a MP4 de forma instantánea. Soporta lotes de archivos con seguimiento en tiempo real del progreso.",
    features: ["Conversión por lote", "Progreso en tiempo real", "Sin pérdida de calidad"],
    badge: "Disponible",
  },
  {
    id: "music-search",
    href: "/d/music",
    icon: Music2,
    label: "Música",
    title: "Búsqueda de música",
    description: "Encuentra y descarga música libre de derechos desde la biblioteca de Jamendo. Previsualiza y filtra por género.",
    features: ["Libre de derechos", "Preview en línea", "Filtros por género"],
    badge: "Disponible",
  },
  {
    id: "media",
    href: "/d/media",
    icon: ImageIcon,
    label: "Media",
    title: "Búsqueda de media",
    description: "Encuentra y descarga fotos y videos de alta calidad desde la biblioteca de Pexels. Previsualiza y filtra por orientación.",
    features: ["Imágenes de alta calidad", "Videos de alta calidad", "Filtro por orientación"],
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
    <div className="mx-auto w-full max-w-5xl px-4 py-8 lg:px-8 lg:py-12 flex flex-col gap-10">
      {/* Hero */}
      <section className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Bienvenido al panel de herramientas</h1>
        <p className="text-muted-foreground max-w-2xl leading-relaxed">
          Un conjunto de herramientas web para simplificar tus flujos de trabajo. Selecciona una utilidad para comenzar.
        </p>
      </section>

      {/* Tool cards */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Utilidades disponibles</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link key={tool.id} href={tool.href} title={tool.title} className="group focus-visible:outline-none">
                <Card className="h-full border border-border bg-card transition-colors duration-150 hover:bg-muted/40">
                  <CardContent className="flex h-full flex-col gap-4 p-5">
                    <div className="flex items-start justify-between">
                      <div className="grid size-9 place-content-center rounded-md bg-primary/10 text-primary">
                        <Icon className="size-4" />
                      </div>
                      <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs">
                        {tool.badge}
                      </Badge>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{tool.label}</span>
                      <h3 className="text-base font-medium leading-tight">{tool.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{tool.description}</p>
                    </div>
                    <div className="mt-auto flex flex-wrap gap-1">
                      {tool.features.map(f => (
                        <span key={f} className="rounded-sm border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground">{f}</span>
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
          <Card className="h-full border border-dashed border-border bg-transparent">
            <CardContent className="flex h-full flex-col items-center justify-center gap-2 p-5 text-center">
              <div className="grid size-9 place-content-center rounded-md bg-muted text-muted-foreground">
                <Layers className="size-4" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Próximamente</p>
              <p className="text-xs text-muted-foreground/60">Nuevas herramientas en desarrollo</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Highlights */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">¿Por qué WEB tools?</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {highlights.map(h => {
            const Icon = h.icon;
            return (
              <div key={h.title} className="flex flex-col gap-2 rounded-md border border-border bg-card p-4">
                <div className="grid size-8 place-content-center rounded-md bg-primary/10 text-primary">
                  <Icon className="size-4" />
                </div>
                <p className="font-medium text-sm">{h.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{h.description}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}