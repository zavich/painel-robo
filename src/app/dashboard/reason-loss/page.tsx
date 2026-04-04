"use client";

import { Suspense } from "react";
import { ReasonLossManagement } from "@/components/ReasonLossManagement";
import Loading from "@/components/Loading";
import { MainShell } from "@/components/layout/MainShell";

export default function ReasonLossPage() {
  return (
    <MainShell>
      <div className="p-4 sm:p-6 lg:p-8">
        <Suspense fallback={<Loading message="Carregando motivos de recusa..." />}>
          <div className="backdrop-blur-sm rounded-2xl border shadow-lg p-6 bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700">
            <ReasonLossManagement />
          </div>
        </Suspense>
      </div>
    </MainShell>
  );
}

