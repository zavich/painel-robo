import { Process, ProcessStatus, StageProcess } from "../interfaces/processes";

export interface ProcessStatusInfo {
  percentage: number;
  status: string;
  stage: StageProcess;
  color: string;
  icon: string;
  description: string;
}

export class ProcessStatusMapper {
  private stepMappings: Record<string, ProcessStatusInfo> = {
    // STEP 0 - Processo inserido para análise (0%)
    "6729096a6c65f9b4740d6fa4": {
      percentage: 0,
      status: "Processo inserido",
      stage: StageProcess.PRE_ANALYSIS,
      color: "gray",
      icon: "📥",
      description: "Processo inserido para análise"
    },

    // STEP 1 - Análise inicial (25%)
    "6723c4edbb7115e185f89d08": {
      percentage: 25,
      status: "Análise inicial",
      stage: StageProcess.PRE_ANALYSIS,
      color: "yellow",
      icon: "🔍",
      description: "Iniciando análise do processo"
    },

    // STEP 2 - Verificação de solvência (50%)
    "6723c4edbb7115e185f89d0a": {
      percentage: 50,
      status: "Verificação de solvência",
      stage: StageProcess.ANALYSIS,
      color: "blue",
      icon: "🏢",
      description: "Verificando solvência da empresa"
    },

    // STEP 3 - Extração de documentos (75%)
    "676482471c9ead23f5722d88": {
      percentage: 75,
      status: "Extração de documentos",
      stage: StageProcess.CALCULATION,
      color: "green",
      icon: "📄",
      description: "Extraindo e analisando documentos"
    },

    // STEP 4 - Petição inicial (100%)
    "6748774b30899f3bf8895b31": {
      percentage: 100,
      status: "Petição inicial",
      stage: StageProcess.CALCULATION,
      color: "green",
      icon: "🎉",
      description: "Processo concluído com sucesso"
    }
  };

  private defaultStatus: ProcessStatusInfo = {
    percentage: 0,
    status: "Iniciando",
    stage: StageProcess.PRE_ANALYSIS,
    color: "gray",
    icon: "🚀",
    description: "Processo iniciado"
  };

  mapProcessStatus(process: Process, currentUserId?: string): ProcessStatusInfo {
    // Se o processo foi rejeitado
    if (process.situation === "LOSS") {
      return {
        percentage: 0,
        status: "Rejeitado",
        stage: StageProcess.PRE_ANALYSIS,
        color: "red",
        icon: "❌",
        description: "Processo rejeitado"
      };
    }

    // Se o processo foi aprovado
    if (process.situation === "APPROVED") {
      return {
        percentage: 100,
        status: "Aprovado",
        stage: StageProcess.CALCULATION,
        color: "green",
        icon: "✅",
        description: "Processo aprovado"
      };
    }

    // Se não há processStatus, usa o stage do processo
    if (!process.processStatus?.step) {
      return this.getStatusByStage(process.stage);
    }

    // Extrai o ID do step (pode ser string ou objeto)
    let stepId: string;
    if (typeof process.processStatus.step === 'string') {
      stepId = process.processStatus.step;
    } else if (process.processStatus.step && typeof process.processStatus.step === 'object' && '_id' in process.processStatus.step) {
      stepId = process.processStatus.step._id;
    } else {
      return this.getStatusByStage(process.stage);
    }

    // Busca o mapeamento pelo step ID
    const mappedStatus = this.stepMappings[stepId];
    if (mappedStatus) {
      return mappedStatus;
    }

    // Fallback para o stage se não encontrar o step
    return this.getStatusByStage(process.stage);
  }

  private getStatusByStage(stage?: StageProcess): ProcessStatusInfo {
    switch (stage) {
      case StageProcess.PRE_ANALYSIS:
        return {
          percentage: 15,
          status: "Pré-Análise",
          stage: StageProcess.PRE_ANALYSIS,
          color: "yellow",
          icon: "📋",
          description: "Fase de pré-análise"
        };
      case StageProcess.ANALYSIS:
        return {
          percentage: 50,
          status: "Análise",
          stage: StageProcess.ANALYSIS,
          color: "blue",
          icon: "🔍",
          description: "Fase de análise"
        };
      case StageProcess.CALCULATION:
        return {
          percentage: 85,
          status: "Cálculo",
          stage: StageProcess.CALCULATION,
          color: "green",
          icon: "🧮",
          description: "Fase de cálculo"
        };
      default:
        return this.defaultStatus;
    }
  }

  getStatusColor(color: string, theme: string = "light"): string {
    const colorMap: Record<string, string> = {
      yellow: theme === "dark" 
        ? "text-yellow-200 bg-yellow-900/50 border-yellow-800" 
        : "text-yellow-600 bg-yellow-50 border-yellow-200",
      blue: theme === "dark" 
        ? "text-blue-200 bg-blue-900/50 border-blue-800" 
        : "text-blue-600 bg-blue-50 border-blue-200",
      green: theme === "dark" 
        ? "text-green-200 bg-green-900/50 border-green-800" 
        : "text-green-600 bg-green-50 border-green-200",
      red: theme === "dark" 
        ? "text-red-200 bg-red-900/50 border-red-800" 
        : "text-red-600 bg-red-50 border-red-200",
      gray: theme === "dark" 
        ? "text-gray-200 bg-gray-800/80 border-gray-700" 
        : "text-gray-600 bg-gray-50 border-gray-200"
    };
    return colorMap[color] || colorMap.gray;
  }

  getProgressColor(color: string, theme: string = "light"): string {
    const colorMap: Record<string, string> = {
      yellow: theme === "dark" ? "bg-yellow-500" : "bg-yellow-500",
      blue: theme === "dark" ? "bg-blue-500" : "bg-blue-500",
      green: theme === "dark" ? "bg-green-500" : "bg-green-500",
      red: theme === "dark" ? "bg-red-500" : "bg-red-500",
      gray: theme === "dark" ? "bg-gray-500" : "bg-gray-500"
    };
    return colorMap[color] || colorMap.gray;
  }
}

// Instância singleton
export const processStatusMapper = new ProcessStatusMapper();
