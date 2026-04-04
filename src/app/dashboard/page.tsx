"use client";

import { Suspense } from "react";
import KanbanDashboard from "./KanbanDashboard";
import Loading from "@/components/Loading";
import { MainShell } from "@/components/layout/MainShell";

export default function KanbanPage() {
  return (
    <MainShell>
      <Suspense fallback={<Loading message="Carregando dashboard..." />}>
        <KanbanDashboard />
      </Suspense>
    </MainShell>
  );
}
