import { useEffect, useState } from "react";
import { CompanyTable } from "@/components/CompanyTable";
import { Search, Building2 } from "lucide-react";
import { Input } from "./ui/input";
import { useCompanies } from "@/app/api/hooks/companies/useCompanies";
import { Company } from "../app/interfaces/processes";
import { CompanyModalDialog } from "./process/CompanyModalDialog";
import { useTheme } from "@/app/hooks/use-theme-client";

export interface CompanyManagementProps {
  companiesPage: number;
  setCompaniesPage: (page: number) => void;
}

const headers = ["CNPJ", "Nome", "Email", "Solvência", "Status", "Criado Em"];

export function CompanyManagement({
  companiesPage,
  setCompaniesPage,
}: CompanyManagementProps) {
  const [search, setSearch] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const { theme } = useTheme();
  
  const {
    data: companiesData,
    isLoading: companiesLoading,
    refetch,
  } = useCompanies({
    page: companiesPage,
    limit: 10,
    search,
  });

  useEffect(() => {
    setCompaniesPage(1);
    refetch();
  }, [search]);

  const handleCompanyClick = (companyId: string) => {
    const company = companiesData?.companies?.find((c) => c._id === companyId);
    if (company) {
      setSelectedCompany(company);
      setShowCompanyModal(true);
    }
  };

  return (
    <section className="mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
          <Building2 className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className={`text-3xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Gestão de Empresas</h2>
          <p className={`mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Visualize e gerencie todas as empresas cadastradas</p>
        </div>
      </div>

      {/* Search Section */}
      <div className={`rounded-2xl shadow-lg p-6 mb-8 ${
        theme === "dark" 
          ? "bg-gray-800 border-gray-700 border" 
          : "bg-white border-gray-200 border"
      }`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            theme === "dark" ? "bg-blue-900/50" : "bg-blue-50"
          }`}>
            <Search className={`h-4 w-4 ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`} />
          </div>
          <h3 className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Buscar Empresas</h3>
        </div>
        <div className="relative">
          <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
            theme === "dark" ? "text-gray-500" : "text-gray-400"
          }`} />
          <Input
            placeholder="Digite o nome da empresa, CNPJ ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`pl-12 h-12 rounded-xl transition-all duration-200 shadow-sm ${
              theme === "dark"
                ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400"
                : "border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white"
            }`}
          />
        </div>
      </div>

      {/* Table Section */}
      <div className={`rounded-2xl shadow-lg overflow-hidden ${
        theme === "dark" 
          ? "bg-gray-800 border-gray-700 border" 
          : "bg-white border-gray-200 border"
      }`}>
        <CompanyTable
          headers={headers}
          data={companiesData}
          onRowClick={handleCompanyClick}
          setCurrentPage={setCompaniesPage}
          isLoading={companiesLoading}
        />
      </div>

      <CompanyModalDialog
        cnpj={selectedCompany?.cnpj || ""}
        isOpen={showCompanyModal}
        onClose={() => setShowCompanyModal(false)}
      />
    </section>
  );
}
