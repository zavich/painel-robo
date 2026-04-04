"use client";

import { Suspense } from "react";
import { MetricsDashboard } from "@/components/MetricsDashboard";
import Loading from "@/components/Loading";
import { MainShell } from "@/components/layout/MainShell";

export default function MetricsPage() {
  return (
    <MainShell>
      <div className="p-4 sm:p-6 lg:p-8">
        <Suspense fallback={<Loading message="Carregando métricas..." />}>
          <MetricsDashboard />
        </Suspense>
      </div>
    </MainShell>
  );
}

