"use client";

import { Suspense, useState } from "react";
import { CompanyManagement } from "@/components/CompanyManagement";
import Loading from "@/components/Loading";
import { MainShell } from "@/components/layout/MainShell";

export default function CompaniesPage() {
  const [companiesPage, setCompaniesPage] = useState<number>(1);

  return (
    <MainShell>
      <div className="p-4 sm:p-6 lg:p-8">
        <Suspense fallback={<Loading message="Carregando empresas..." />}>
          <div className="backdrop-blur-sm rounded-2xl border shadow-lg p-6 bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700">
            <CompanyManagement
              companiesPage={companiesPage}
              setCompaniesPage={setCompaniesPage}
            />
          </div>
        </Suspense>
      </div>
    </MainShell>
  );
}

