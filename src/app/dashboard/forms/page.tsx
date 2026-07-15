"use client";

import { MainShell } from "@/components/layout/MainShell";
import { FormsList } from "@/components/form-builder/FormsList";

export default function FormsPage() {
  return (
    <MainShell>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="backdrop-blur-sm rounded-2xl border shadow-lg p-6 bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700">
          <FormsList />
        </div>
      </div>
    </MainShell>
  );
}
