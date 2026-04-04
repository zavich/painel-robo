"use client";
import { GetCompaniesResponseType } from "@/app/api/hooks/companies/useCompanies";
import { capitalizeWords } from "@/app/utils/format";
import { mascararCNPJ } from "@/app/utils/masks";
import { Button } from "@/components/ui/button";
import { Eye, Building2 } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTheme } from "@/app/hooks/use-theme-client";

type CompanyTableProps = {
  headers?: string[];
  onRowClick: (id: string) => void;
  data?: GetCompaniesResponseType;
  setCurrentPage?: (page: number) => void;
  isLoading?: boolean;
};

// Componente para skeleton row
const SkeletonRow = ({ columns, theme }: { columns: number; theme: string }) => (
  <TableRow className={theme === "dark" ? "border-gray-700" : "border-gray-200"}>
    {Array.from({ length: columns }, (_, index) => (
      <TableCell key={index} className="py-4 px-6">
        <div className={`h-4 rounded animate-pulse ${
          theme === "dark" ? "bg-gray-700" : "bg-gray-200"
        }`}></div>
      </TableCell>
    ))}
  </TableRow>
);

// Função utilitária para traduzir registrationStatus
function getRegistrationStatusLabel(status?: string | number) {
  switch (String(status)) {
    case "1":
      return "NULA";
    case "2":
      return "ATIVA";
    case "3":
      return "SUSPENSA";
    case "4":
      return "INAPTA";
    case "8":
      return "BAIXADA";
    default:
      return status || "-";
  }
}

export function CompanyTable({
  headers,
  onRowClick,
  data,
  setCurrentPage = () => {},
  isLoading = false,
}: CompanyTableProps) {
  const { theme } = useTheme();
  const {
    page = 1,
    totalCount = 0,
    totalPages = 1,
    companies,
    limit = 10,
  } = data || {};

  const startIndex = (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, totalCount);

  const totalColumns = (headers?.length || 0) + 1;

  return (
    <div>
      <div className="overflow-x-auto">
        <Table className="min-w-[700px] md:min-w-full">
          <TableHeader>
            <TableRow className={theme === "dark" ? "border-gray-700" : "border-gray-200"}>
              {headers?.map((header, index) => (
                <TableHead
                  key={index}
                  className={`font-bold text-sm select-none whitespace-nowrap py-4 px-6 border-b ${
                    theme === "dark"
                      ? "bg-gradient-to-r from-gray-800 to-gray-900 text-gray-300 border-gray-700"
                      : "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-2">{header}</div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: limit }, (_, index) => (
                <SkeletonRow key={index} columns={totalColumns} theme={theme} />
              ))
            ) : companies?.length ? (
              companies.map((process, index) => (
                <TableRow
                  key={process._id || index}
                  className={`border-b transition-all duration-200 cursor-pointer group hover:shadow-sm ${
                    theme === "dark"
                      ? "hover:bg-gray-700/50 border-gray-700"
                      : "hover:bg-blue-50/50 border-gray-100"
                  }`}
                  onClick={() => onRowClick(process?._id || "")}
                  title="Clique para ver detalhes da empresa"
                >
                  <TableCell className="whitespace-nowrap max-w-[120px] overflow-hidden text-ellipsis py-4 px-6">
                    <div className="flex items-center gap-3">
                      <span className={`font-semibold ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
                        {mascararCNPJ(process.cnpj)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap max-w-[180px] overflow-hidden text-ellipsis py-4 px-6">
                    <div className="flex items-center gap-3">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span
                              className={`font-semibold truncate cursor-pointer ${
                                theme === "dark" ? "text-gray-100" : "text-gray-900"
                              }`}
                              style={{
                                maxWidth: 160,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {capitalizeWords(process.name) || "-"}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            className="max-w-xs break-words bg-gray-900 text-white rounded-lg"
                          >
                            {capitalizeWords(process.name) || "-"}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap max-w-[160px] overflow-hidden text-ellipsis py-4 px-6">
                    <div className="flex items-center gap-3">
                      <span className={`font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                        {process.email || "-"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap max-w-[120px] overflow-hidden text-ellipsis py-4 px-6">
                    <div className="flex items-center gap-3">
                      <span className={`font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                        {capitalizeWords(process?.specialRule || "") || "-"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap max-w-[100px] overflow-hidden text-ellipsis py-4 px-6">
                    <div className="flex items-center gap-3">
                      <span className={`font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                        {getRegistrationStatusLabel(process.registrationStatus)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className={`whitespace-nowrap max-w-[120px] overflow-hidden text-ellipsis py-4 px-6 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {process.createdAt
                          ? new Date(process.createdAt).toLocaleDateString(
                              "pt-BR"
                            )
                          : "N/A"}
                      </span>
                      <Eye className={`h-4 w-4 transition-colors opacity-0 group-hover:opacity-100 ${
                        theme === "dark" 
                          ? "text-gray-500 group-hover:text-blue-400" 
                          : "text-gray-400 group-hover:text-blue-600"
                      }`} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={totalColumns}
                  className={`text-center py-16 ${
                    theme === "dark" ? "border-gray-700" : "border-gray-100"
                  }`}
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                      theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                    }`}>
                      <Building2 className={`h-8 w-8 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`} />
                    </div>
                    <div>
                      <p className={`font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}>Nenhuma empresa encontrada</p>
                      <p className={`text-sm ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>Tente ajustar os filtros de busca</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {!isLoading && totalPages > 1 && (
        <div className={`flex flex-col md:flex-row items-center justify-between mt-8 gap-4 md:gap-0 px-6 py-4 border-t ${
          theme === "dark" 
            ? "bg-gray-700/50 border-gray-700" 
            : "bg-gray-50 border-gray-200"
        }`}>
          <p className={`text-sm font-medium ${
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          }`}>
            Mostrando {startIndex} a {endIndex} de {totalCount} empresas
          </p>

          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className={`rounded-xl transition-colors ${
                theme === "dark"
                  ? "border-gray-600 hover:bg-gray-700 hover:border-gray-500"
                  : "border-gray-200 hover:bg-blue-50 hover:border-blue-200"
              }`}
            >
              Anterior
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))
              .map((pageNumber) => (
                <Button
                  key={pageNumber}
                  variant={pageNumber === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`rounded-xl transition-colors ${
                    theme === "dark"
                      ? "border-gray-600 hover:bg-gray-700 hover:border-gray-500"
                      : "border-gray-200 hover:bg-blue-50 hover:border-blue-200"
                  }`}
                >
                  {pageNumber}
                </Button>
              ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className={`rounded-xl transition-colors ${
                theme === "dark"
                  ? "border-gray-600 hover:bg-gray-700 hover:border-gray-500"
                  : "border-gray-200 hover:bg-blue-50 hover:border-blue-200"
              }`}
            >
              Próximo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
