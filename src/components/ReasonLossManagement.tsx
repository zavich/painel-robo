import { useEffect, useState } from "react";
import { Search, AlertCircle, Plus } from "lucide-react";
import { Input } from "./ui/input";
import { ReasonLossTable } from "./ReasonLossTable";
import { Button } from "./ui/button";
import { ReasonLossModal } from "./ReasonLossModal";
import { useReasonLoss } from "@/app/api/hooks/reason-loss/useReasonLoss";
import { useTheme } from "@/app/hooks/use-theme-client";

export function ReasonLossManagement() {
  const [search, setSearch] = useState("");
  const [showReasonLossModal, setShowReasonLossModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { theme } = useTheme();
  const {
    data: reasonLossData,
    isLoading: reasonLossLoading,
    refetch,
  } = useReasonLoss({
    page: currentPage,
    limit: 10,
    search: search || undefined,
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const totalCount = reasonLossData?.total || 0;
  const totalPages = reasonLossData?.totalPages || 1;
  const startIndex = reasonLossData?.page && reasonLossData?.limit
    ? (reasonLossData.page - 1) * reasonLossData.limit + 1
    : 1;
  const endIndex = reasonLossData?.page && reasonLossData?.limit
    ? Math.min(reasonLossData.page * reasonLossData.limit, totalCount)
    : totalCount;

  return (
    <section className="mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
          <AlertCircle className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className={`text-3xl font-bold ${
            theme === "dark" ? "text-gray-100" : "text-gray-900"
          }`}>Gestão de Motivos de Recusa</h2>
          <p className={`mt-1 ${
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          }`}>Crie e gerencie motivos de recusa para processos</p>
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
          <h3 className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Buscar Motivos de Recusa</h3>
        </div>
        <div className="relative">
          <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
            theme === "dark" ? "text-gray-500" : "text-gray-400"
          }`} />
          <Input
            placeholder="Buscar por chave ou label..."
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

      {/* Actions Section */}
      <div className="flex justify-end mb-4">
        <Button
          className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 h-12 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          onClick={() => setShowReasonLossModal(true)}
        >
          <Plus className="h-5 w-5 mr-2" />
          Novo Motivo
        </Button>
      </div>

      {/* Table Section */}
      <div className={`rounded-2xl shadow-lg overflow-hidden ${
        theme === "dark" 
          ? "bg-gray-800 border-gray-700 border" 
          : "bg-white border-gray-200 border"
      }`}>
        <ReasonLossTable
          data={reasonLossData?.reasonLoss ?? []}
          onDeleted={refetch}
          isLoading={reasonLossLoading}
          currentPage={reasonLossData?.page || 1}
          totalPages={totalPages}
          totalCount={totalCount}
          startIndex={startIndex}
          endIndex={endIndex}
          onPageChange={setCurrentPage}
        />
      </div>

      <ReasonLossModal
        reasonLoss={null}
        isOpen={showReasonLossModal}
        onClose={() => setShowReasonLossModal(false)}
        onSaved={() => {
          setShowReasonLossModal(false);
          refetch();
        }}
      />
    </section>
  );
}

