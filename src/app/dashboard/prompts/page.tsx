"use client";

import { Suspense } from "react";
import { PromptManagement } from "@/components/PromptManagement";
import Loading from "@/components/Loading";
import { MainShell } from "@/components/layout/MainShell";

export default function PromptsPage() {
  return (
    <MainShell>
      <div className="p-4 sm:p-6 lg:p-8">
        <Suspense fallback={<Loading message="Carregando prompts..." />}>
          <div className="backdrop-blur-sm rounded-2xl border shadow-lg p-6 bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700">
            <PromptManagement />
          </div>
        </Suspense>
      </div>
    </MainShell>
  );
}

