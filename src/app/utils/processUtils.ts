import { EsteiraByStageId, NextStageIdByEsteira, Process, StageProcess } from "../interfaces/processes";

export function canSynchronize(process: Process): boolean {
	if (!process.synchronizedAt) return true;
	const lastSync = new Date(process.synchronizedAt);
	const now = new Date();
	const diffMs = now.getTime() - lastSync.getTime();
	return diffMs >= 30 * 60 * 1000;
}

export function getStageLabel(stage?: StageProcess): string {
	switch (stage) {
		case StageProcess.PRE_ANALYSIS:
			return "Pré-Análise";
		case StageProcess.ANALYSIS:
			return "Análise";
		case StageProcess.CALCULATION:
			return "Cálculo";
		default:
			return "-";
	}
}

export function getEsteiraLabel(stageId?: number): string {
	if (!stageId) return "-";
	return EsteiraByStageId[stageId] || "-";
}

export function getNextStageId(process: Process): number | undefined {
	const esteira = EsteiraByStageId[process.stageId];
	if (!esteira) return undefined;
	
	// Determinar qual etapa o processo deve ir baseado na etapa atual
	let targetStage: string;
	if (process.stage === StageProcess.PRE_ANALYSIS) {
		// Se está em PRE_ANALYSIS, vai para ANALYSIS
		targetStage = "ANALISE";
	} else if (process.stage === StageProcess.ANALYSIS) {
		// Se está em ANALYSIS, vai para CALCULATION
		targetStage = "CALCULO";
	} else if (process.stage === StageProcess.CALCULATION) {
		// Se está em CALCULATION, permanece em CALCULATION
		targetStage = "CALCULO";
	} else {
		return undefined;
	}

	return NextStageIdByEsteira[esteira]?.[targetStage];
}

export function getStageIdForStage(process: Process, targetStage: string): number | undefined {
	if (!process?.stageId) return undefined;
	
	const esteira = EsteiraByStageId[process.stageId];
	if (!esteira) return undefined;
	
	// Mapear o stage para a chave correta
	const stageKey = targetStage === 'PRE_ANALISE' ? 'PRE_ANALISE' 
	               : targetStage === 'ANALISE' ? 'ANALISE'
	               : targetStage === 'CALCULO' ? 'CALCULO'
	               : undefined;
	
	if (!stageKey) return undefined;
	
	return NextStageIdByEsteira[esteira]?.[stageKey];
}

export function formatCurrency(value: number) {
	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL",
	}).format(value);
};

export function formatDate(date: string) {
	return new Date(date).toLocaleDateString("pt-BR");
};