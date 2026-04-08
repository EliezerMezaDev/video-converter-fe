"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/src/shared/shadcn/components/ui/breadcrumb";

/** Mapa de segmentos de ruta a etiquetas legibles */
const routeLabels: Record<string, string> = {
  d: "Dashboard",
  converter: "Convertidor de Video",
  music: "Búsqueda de Música",
};

function getRouteLabel(segment: string): string {
  return (
    routeLabels[segment] ??
    segment.charAt(0).toUpperCase() + segment.slice(1)
  );
}

export function DashboardBreadcrumbs() {
  const pathname = usePathname();

  const segments = pathname.split("/").filter(Boolean);

  // Si estamos en la raíz del panel (/d), no mostramos breadcrumb
  if (segments.length <= 1) return null;

  const crumbs = segments.map((segment, index) => ({
    href: `/${segments.slice(0, index + 1).join("/")}`,
    label: getRouteLabel(segment),
    isLast: index === segments.length - 1,
  }));

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, index) => (
          <BreadcrumbItem key={crumb.href}>
            {crumb.isLast ? (
              <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
            ) : (
              <>
                <BreadcrumbLink render={<Link href={crumb.href} />}>
                  {crumb.label}
                </BreadcrumbLink>
                <BreadcrumbSeparator />
              </>
            )}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
