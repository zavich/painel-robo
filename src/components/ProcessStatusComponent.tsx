import React from "react";
import { Process } from "@/app/interfaces/processes";
import { processStatusMapper, ProcessStatusInfo } from "@/app/utils/processStatusMapper";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { useTheme } from "@/app/hooks/use-theme-client";

interface ProcessStatusComponentProps {
  process: Process;
  currentUserId?: string;
  showDetails?: boolean;
  showProgressBar?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ProcessStatusComponent({
  process,
  currentUserId,
  showDetails = true,
  showProgressBar = true,
  size = "md",
  className = ""
}: ProcessStatusComponentProps) {
  const { theme } = useTheme();
  const statusInfo: ProcessStatusInfo = processStatusMapper.mapProcessStatus(process, currentUserId);
  
  const sizeClasses = {
    sm: {
      container: "px-2 py-1",
      icon: "text-xs",
      text: "text-xs",
      progress: "h-1",
      badge: "text-xs px-2 py-1"
    },
    md: {
      container: "px-3 py-2",
      icon: "text-sm",
      text: "text-sm",
      progress: "h-2",
      badge: "text-sm px-3 py-1.5"
    },
    lg: {
      container: "px-4 py-3",
      icon: "text-base",
      text: "text-base",
      progress: "h-3",
      badge: "text-base px-4 py-2"
    }
  };

  const currentSize = sizeClasses[size];
  const colorClasses = processStatusMapper.getStatusColor(statusInfo.color, theme);
  const progressColor = processStatusMapper.getProgressColor(statusInfo.color, theme);

  const getStatusIcon = () => {
    // Para processos rejeitados ou aprovados, usa ícones específicos
    if (process.situation === "LOSS") {
      return <XCircle className={`h-4 w-4 ${theme === "dark" ? "text-red-400" : "text-red-600"}`} />;
    }
    
    if (process.situation === "APPROVED") {
      return <CheckCircle className={`h-4 w-4 ${theme === "dark" ? "text-green-400" : "text-green-600"}`} />;
    }
    
    // Para outros status, usa ícone baseado na cor
    const colorMap = {
      yellow: theme === "dark" ? "text-yellow-400" : "text-yellow-600",
      blue: theme === "dark" ? "text-blue-400" : "text-blue-600",
      green: theme === "dark" ? "text-green-400" : "text-green-600",
      default: theme === "dark" ? "text-gray-400" : "text-gray-600"
    };
    
    const iconColor = colorMap[statusInfo.color as keyof typeof colorMap] || colorMap.default;
    return <Clock className={`h-4 w-4 ${iconColor}`} />;
  };

  return (
    <div className={`${className}`}>
      <div className={`inline-flex items-center gap-2 rounded-lg border ${colorClasses} ${currentSize.container} max-w-full`}>
        {/* Ícone de Status */}
        <div className="flex items-center gap-2">
          {getStatusIcon()}
        <span className={`font-semibold ${currentSize.text} ${
          theme === "dark" ? "text-gray-100" : "text-gray-900"
        }`}>
          {statusInfo.percentage}%
        </span>
        </div>

        {/* Status Text */}
        <span className={`font-medium ${currentSize.text} truncate ${
          theme === "dark" ? "text-gray-200" : "text-gray-700"
        }`}>
          {statusInfo.status}
        </span>

        {/* Tooltip com detalhes */}
        {showDetails && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-help">
                <AlertTriangle className={`h-3 w-3 text-current opacity-60`} />
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className={`rounded-xl max-w-xs ${
              theme === "dark" 
                ? "bg-gray-800 text-gray-100 border-gray-700 border" 
                : "bg-gray-900 text-white"
            }`}>
              <div className="space-y-1">
                <p className={`font-medium text-sm ${theme === "dark" ? "text-gray-100" : "text-white"}`}>{statusInfo.status}</p>
                <p className={`text-xs ${theme === "dark" ? "text-gray-300" : "text-gray-300"}`}>{statusInfo.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-400"}`}>Progresso:</span>
                  <span className="text-xs font-medium">{statusInfo.percentage}%</span>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Barra de Progresso */}
      {showProgressBar && (
        <div className="mt-2">
          <div className={`w-full rounded-full overflow-hidden ${
            theme === "dark" ? "bg-gray-800" : "bg-gray-200"
          }`}>
            <div
              className={`${currentSize.progress} ${progressColor} transition-all duration-500 ease-out rounded-full`}
              style={{ width: `${statusInfo.percentage}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className={`text-xs ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}>
              {statusInfo.stage === "PRE_ANALISE" && "Pré-Análise"}
              {statusInfo.stage === "ANALISE" && "Análise"}
              {statusInfo.stage === "CALCULO" && "Cálculo"}
            </span>
            <span className={`text-xs font-medium ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}>
              {statusInfo.percentage}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente compacto para uso em cards
export function ProcessStatusBadge({ 
  process, 
  currentUserId,
  className = "" 
}: Omit<ProcessStatusComponentProps, "showDetails" | "showProgressBar">) {
  return (
    <ProcessStatusComponent
      process={process}
      currentUserId={currentUserId}
      showDetails={false}
      showProgressBar={false}
      size="sm"
      className={className}
    />
  );
}

// Componente completo para páginas de detalhes
export function ProcessStatusCard({ 
  process, 
  currentUserId,
  className = "" 
}: Omit<ProcessStatusComponentProps, "showDetails" | "showProgressBar">) {
  return (
    <ProcessStatusComponent
      process={process}
      currentUserId={currentUserId}
      showDetails={true}
      showProgressBar={true}
      size="lg"
      className={className}
    />
  );
}
