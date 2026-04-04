import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Calendar, X, FileText, Check, Eye, TrendingUp, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { NewMovement } from "@/app/api/hooks/process/useNewMovements";
import { Badge } from "../ui/badge";
import { StatusExtractionInsight } from "@/app/interfaces/processes";

// Helper para normalizar datas
function normalizeDate(dateStr: string): string {
	if (!dateStr) return "";
	// If format is "DD/MM/YYYY HH:MM:SS" or similar
	const parts = dateStr.split(" ");
	const dateOnly = parts[0];
	// Check if Brazilian format DD/MM/YYYY
	if (dateOnly.includes("/")) {
		const [day, month, year] = dateOnly.split("/");
		return `${year}-${month}-${day}`;
	}
	// If already in ISO format YYYY-MM-DD
	return dateOnly.substring(0, 10);
}

// Helper para comparar datas
function compareDates(dateStr1: string, dateStr2: string): number {
	const normalized1 = normalizeDate(dateStr1);
	const normalized2 = normalizeDate(dateStr2);
	return normalized2.localeCompare(normalized1); // Descending order (newest first)
}

// Helper para normalizar texto para busca (remove acentos e espaços extras)
function normalizeSearchText(text: string): string {
	if (!text) return "";
	return text
		.toLowerCase()
		.normalize("NFD") // Decompõe caracteres acentuados
		.replace(/[\u0300-\u036f]/g, "") // Remove marcas diacríticas (acentos)
		.replace(/\s+/g, " ") // Substitui múltiplos espaços por um único
		.trim();
}

// Componente para cada documento individual
function DocumentItem({
	doc,
	idx,
	onClick
}: {
	doc: any;
	idx: number;
	onClick?: (doc: any) => void;
}) {
	return (
		<div className="relative">
			{/* Timeline line */}
			<div className="absolute left-3 sm:left-4 top-6 sm:top-8 bottom-0 w-0.5 bg-gradient-to-b from-purple-200 via-purple-300 to-transparent dark:from-purple-800 dark:via-purple-700"></div>
			
			<div className="relative flex items-start gap-2 sm:gap-3 pb-2 sm:pb-3">
				{/* Timeline marker */}
				<div className="relative z-10 flex-shrink-0">
					<div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full shadow-md transition-all duration-200 bg-gradient-to-br from-purple-500 to-pink-500 ring-2 ring-purple-100 dark:ring-purple-900/50">
						<FileText className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
					</div>
				</div>

				{/* Content */}
				<div className="flex-1 min-w-0">
					<div 
						onClick={() => onClick?.(doc)}
						className="rounded-lg p-2 sm:p-3 transition-all duration-200 cursor-pointer hover:shadow-md hover:scale-[1.01] bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-800/10 border border-purple-200 dark:border-purple-800/50"
					>
						{/* Header with date and status */}
						<div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-1.5 flex-wrap">
							<span className="font-semibold text-xs sm:text-sm text-purple-900 dark:text-purple-100">
								{doc.date}
							</span>
							{/* Document badge */}
							<span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold bg-purple-500 text-white">
								Documento
							</span>
						</div>

						{/* Content */}
						<p className="text-[11px] sm:text-xs leading-relaxed text-purple-800 dark:text-purple-200 break-words">
							{doc.title}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}

// Componente para cada movimentação individual
function MovementItem({ 
	mov, 
	idx, 
	isNew, 
	onClick
}: {
	mov: any;
	idx: number;
	isNew: boolean;
	onClick?: (mov: any) => void;
}) {

	return (
		<div className="relative">
			{/* Timeline line */}
			<div className="absolute left-3 sm:left-4 top-6 sm:top-8 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-blue-300 to-transparent dark:from-blue-800 dark:via-blue-700"></div>
			
			<div className="relative flex items-start gap-2 sm:gap-3 pb-2 sm:pb-3">
				{/* Timeline marker */}
				<div className="relative z-10 flex-shrink-0">
					<div className={`flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full shadow-md transition-all duration-200 ${
						isNew
							? 'bg-gradient-to-br from-blue-500 to-blue-600 ring-2 ring-blue-100 dark:ring-blue-900/50' 
							: 'bg-gradient-to-br from-gray-400 to-gray-500 ring-2 ring-gray-100 dark:ring-gray-800/50'
					}`}>
						{isNew ? (
							<div className="relative">
								<div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse"></div>
								<div className="absolute inset-0 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-ping opacity-30"></div>
							</div>
						) : (
							<span className="text-white font-semibold text-[10px] sm:text-[11px]">{idx + 1}</span>
						)}
					</div>
				</div>

				{/* Content */}
				<div className="flex-1 min-w-0">
					<div 
						onClick={() => onClick?.(mov)}
						className={`rounded-lg p-2 sm:p-3 transition-all duration-200 cursor-pointer hover:shadow-md hover:scale-[1.01] ${
							isNew 
								? 'bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 border border-blue-200 dark:border-blue-800/50' 
								: 'bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50'
						}`}>
						{/* Header with date and status */}
						<div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-1.5 flex-wrap">
							<span className={`font-semibold text-xs sm:text-sm ${
								isNew 
									? 'text-blue-900 dark:text-blue-100' 
									: 'text-gray-900 dark:text-gray-100'
							}`}>
								{mov.data}
							</span>
							
							{/* Status badge apenas para movimentos novos */}
							{isNew && (
								<span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold bg-blue-500 text-white">
									<div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full mr-1 sm:mr-1.5 animate-pulse"></div>
									Nova
								</span>
							)}
						</div>

						{/* Content */}
						<p className={`text-[11px] sm:text-xs leading-relaxed break-words ${
							isNew 
								? 'text-blue-800 dark:text-blue-200' 
								: 'text-gray-700 dark:text-gray-300'
						}`}>
							{mov.conteudo}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}

export enum InstanceEnum {
	FIRST_INSTANCE = "PRIMEIRO_GRAU",
	SECOND_INSTANCE = "SEGUNDO_GRAU",
}

interface TimelineCardProps {
	title: string;
	moviments: any[];
	instancia?: InstanceEnum;
	newMovements?: NewMovement[];
	processNumber?: string;
	onMovementClick?: (mov: any) => void;
	documents?: any[];
	onDocumentClick?: (doc: any) => void;
	onMarkAsViewed?: () => void;
	isMarkingAsViewed?: boolean;
}

export function TimelineCard({
	title,
	moviments,
	instancia,
	newMovements = [],
	processNumber,
	onMovementClick,
	documents = [],
	onDocumentClick,
	onMarkAsViewed,
	isMarkingAsViewed = false,
}: TimelineCardProps) {
	const [searchFirstInstance, setSearchFirstInstance] = useState("");
	const [filterType, setFilterType] = useState<'all' | 'movements' | 'documents'>('all');
	const [documentInsightsFilter, setDocumentInsightsFilter] = useState<'all' | 'with' | 'without'>('all');

	const movimentsFirstInstance = useMemo(() => {
		if (!searchFirstInstance) {
			return moviments?.filter((mov) => mov.instancia === instancia);
		}
		
		const normalizedSearch = normalizeSearchText(searchFirstInstance);
		return moviments
			?.filter((mov) => mov.instancia === instancia)
			.filter((mov) => {
				const normalizedContent = normalizeSearchText(mov.conteudo || "");
				const normalizedDate = normalizeSearchText(mov.data || "");
				return normalizedContent.includes(normalizedSearch) || normalizedDate.includes(normalizedSearch);
			});
	}, [moviments, searchFirstInstance, instancia]);

	// Identificar movimentações novas baseadas no ID e filtrar por instância
	const newMovementIds = useMemo(() => {
		const filteredNewMovements = newMovements.filter(mov => 
			mov.instancia === instancia
		);
		return new Set(filteredNewMovements.map(mov => mov.id));
	}, [newMovements, instancia]);


	// Classificar documentos por instância baseado nas datas das movimentações
	const classifyDocumentByInstance = useMemo(() => {
		// Obter datas de cada instância
		const firstInstanceDates = moviments
			.filter(mov => mov.instancia === InstanceEnum.FIRST_INSTANCE)
			.map(mov => normalizeDate(mov.data))
			.filter(d => d);
		
		const secondInstanceDates = moviments
			.filter(mov => mov.instancia === InstanceEnum.SECOND_INSTANCE)
			.map(mov => normalizeDate(mov.data))
			.filter(d => d);

		return (docDate: string) => {
			const normalizedDocDate = normalizeDate(docDate);
			if (!normalizedDocDate) return null;

			// Se não há movimentações de segunda instância, assume primeira
			if (secondInstanceDates.length === 0) {
				return InstanceEnum.FIRST_INSTANCE;
			}

			// Se não há movimentações de primeira instância, assume segunda
			if (firstInstanceDates.length === 0) {
				return InstanceEnum.SECOND_INSTANCE;
			}

			// Calcular a distância mínima para cada instância
			const distanceToFirst = Math.min(
				...firstInstanceDates.map(movDate => 
					Math.abs(new Date(normalizedDocDate).getTime() - new Date(movDate).getTime())
				)
			);

			const distanceToSecond = Math.min(
				...secondInstanceDates.map(movDate => 
					Math.abs(new Date(normalizedDocDate).getTime() - new Date(movDate).getTime())
				)
			);

			// Retorna a instância mais próxima
			return distanceToFirst <= distanceToSecond 
				? InstanceEnum.FIRST_INSTANCE 
				: InstanceEnum.SECOND_INSTANCE;
		};
	}, [moviments]);

	// Combinar movimentações e documentos ordenados por data
	const combinedItems = useMemo(() => {
		// Mapear movimentações para o formato unificado
		const movementsMapped = movimentsFirstInstance.map(mov => ({
			type: 'movement' as const,
			id: mov.id,
			date: mov.data,
			data: mov,
			instancia: mov.instancia,
		}));

		// Mapear documentos para o formato unificado e classificar por instância
		const documentsMapped = documents
			.map(doc => ({
				type: 'document' as const,
				id: doc._id,
				date: doc.date,
				data: doc,
				instancia: classifyDocumentByInstance(doc.date),
			}))
			// Filtrar apenas documentos da instância atual
			.filter(doc => doc.instancia === instancia)
			// Filtrar documentos por insights (com insights, sem insights, ou todos)
			.filter(doc => {
				if (documentInsightsFilter === 'all') return true;
				const docData = doc.data as any;
				const hasInsights = docData?.status === StatusExtractionInsight.COMPLETED && docData?.data;
				if (documentInsightsFilter === 'with') {
					return hasInsights;
				} else if (documentInsightsFilter === 'without') {
					return !hasInsights;
				}
				return true;
			})
			// Aplicar filtro de busca nos documentos
			.filter(doc => {
				if (!searchFirstInstance) return true;
				
				const normalizedSearch = normalizeSearchText(searchFirstInstance);
				const normalizedTitle = normalizeSearchText(doc.data.title || "");
				const normalizedDate = normalizeSearchText(doc.data.date || "");
				
				const titleMatch = normalizedTitle.includes(normalizedSearch);
				const dateMatch = normalizedDate.includes(normalizedSearch);
				
				return titleMatch || dateMatch;
			});

		// Combinar e ordenar por data (mais recente primeiro)
		const combined = [...movementsMapped, ...documentsMapped];
		const sorted = combined.sort((a, b) => compareDates(a.date, b.date));
		
		// Aplicar filtro de tipo
		if (filterType === 'movements') {
			return sorted.filter(item => item.type === 'movement');
		} else if (filterType === 'documents') {
			return sorted.filter(item => item.type === 'document');
		}
		
		return sorted;
	}, [movimentsFirstInstance, documents, classifyDocumentByInstance, instancia, searchFirstInstance, filterType, documentInsightsFilter]);

	// Verificar se há movimentações novas
	const hasNewMovementsNow = newMovementIds.size > 0;

	return (
		<Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700 shadow-lg transition-all duration-300 flex flex-col h-full shadow-gray-100 dark:shadow-gray-900/20">
			<CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800 dark:to-gray-700/50 border-b border-gray-200 dark:border-gray-700 py-2 sm:py-3 px-3 sm:px-4">
				<div className="flex items-center justify-between gap-2">
					<div className="flex items-center gap-2 flex-1 min-w-0">
						<div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 flex-shrink-0">
							<Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-600 dark:text-gray-400" />
						</div>
						<CardTitle className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100 truncate">
							{title}
						</CardTitle>
						{hasNewMovementsNow && (
							<Badge variant="default" className="bg-blue-500 hover:bg-blue-600 text-white text-[9px] sm:text-[10px] px-1.5 py-0">
								{newMovementIds.size}
							</Badge>
						)}
					</div>
					{hasNewMovementsNow && onMarkAsViewed && (
						<Button
							variant="outline"
							size="sm"
							onClick={onMarkAsViewed}
							disabled={isMarkingAsViewed}
							className="h-7 px-2 sm:px-3 text-[10px] sm:text-xs font-medium flex items-center gap-1 flex-shrink-0"
						>
							{isMarkingAsViewed ? (
								<>
									<div className="h-3 w-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
									<span className="hidden sm:inline">Marcando...</span>
								</>
							) : (
								<>
									<Check className="h-3 w-3" />
									<span className="hidden sm:inline">Marcar como lidas</span>
									<span className="sm:hidden">Lidas</span>
								</>
							)}
						</Button>
					)}
				</div>
			</CardHeader>
			<CardContent className="p-2 sm:p-3 flex flex-col flex-1 min-h-0">
				<div className="mb-2 sm:mb-3 flex-shrink-0 space-y-2">
					<div className="relative">
						<Input
							placeholder="🔍 Filtrar..."
							value={searchFirstInstance}
							onChange={(e) => setSearchFirstInstance(e.target.value)}
							className="h-8 sm:h-9 pl-3 pr-10 bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-xs sm:text-sm"
						/>
						{searchFirstInstance && (
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setSearchFirstInstance("")}
								className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 h-6 w-6 sm:h-7 sm:w-7 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
							>
								<X className="h-3 w-3 sm:h-4 sm:w-4" />
							</Button>
						)}
					</div>
					
					{/* Filtros de tipo */}
					<div className="flex items-center justify-between gap-2">
						<div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
							<Button
								variant={filterType === 'all' ? 'default' : 'outline'}
								size="sm"
								onClick={() => {
									setFilterType('all');
									setDocumentInsightsFilter('all');
								}}
								className={`h-7 px-2 sm:px-3 text-[10px] sm:text-xs font-medium transition-all ${
									filterType === 'all'
										? 'bg-blue-600 hover:bg-blue-700 text-white'
										: 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
								}`}
							>
								Todos
							</Button>
						<Button
							variant={filterType === 'movements' ? 'default' : 'outline'}
							size="sm"
							onClick={() => {
								setFilterType('movements');
								setDocumentInsightsFilter('all');
							}}
							className={`h-7 px-2 sm:px-3 text-[10px] sm:text-xs font-medium transition-all flex items-center gap-1 ${
								filterType === 'movements'
									? 'bg-blue-600 hover:bg-blue-700 text-white'
									: 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
							}`}
						>
							<Calendar className="h-3 w-3" />
							<span className="hidden sm:inline">Movimentos</span>
							<span className="sm:hidden">Mov</span>
						</Button>
						<Button
							variant={filterType === 'documents' ? 'default' : 'outline'}
							size="sm"
							onClick={() => setFilterType('documents')}
							className={`h-7 px-2 sm:px-3 text-[10px] sm:text-xs font-medium transition-all flex items-center gap-1 ${
								filterType === 'documents'
									? 'bg-purple-600 hover:bg-purple-700 text-white'
									: 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
							}`}
						>
							<FileText className="h-3 w-3" />
							<span className="hidden sm:inline">Documentos</span>
							<span className="sm:hidden">Docs</span>
						</Button>
						{/* Filtros de insights - só aparecem quando filtro de documentos está ativo */}
						{filterType === 'documents' && (
							<>
								<Button
									variant={documentInsightsFilter === 'with' ? 'default' : 'outline'}
									size="sm"
									onClick={() => setDocumentInsightsFilter(documentInsightsFilter === 'with' ? 'all' : 'with')}
									className={`h-7 px-2 sm:px-3 text-[10px] sm:text-xs font-medium transition-all flex items-center gap-1 ${
										documentInsightsFilter === 'with'
											? 'bg-green-600 hover:bg-green-700 text-white'
											: 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
									}`}
								>
									<TrendingUp className="h-3 w-3" />
									<span className="hidden sm:inline">Com Insights</span>
									<span className="sm:hidden">Com</span>
								</Button>
								<Button
									variant={documentInsightsFilter === 'without' ? 'default' : 'outline'}
									size="sm"
									onClick={() => setDocumentInsightsFilter(documentInsightsFilter === 'without' ? 'all' : 'without')}
									className={`h-7 px-2 sm:px-3 text-[10px] sm:text-xs font-medium transition-all flex items-center gap-1 ${
										documentInsightsFilter === 'without'
											? 'bg-amber-600 hover:bg-amber-700 text-white'
											: 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
									}`}
								>
									<XCircle className="h-3 w-3" />
									<span className="hidden sm:inline">Sem Insights</span>
									<span className="sm:hidden">Sem</span>
								</Button>
							</>
						)}
						</div>
						
						{/* Contador de resultados */}
						{combinedItems.length > 0 && (
							<div className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md">
								<span className="text-[10px] sm:text-xs font-semibold text-gray-700 dark:text-gray-300">
									{combinedItems.length}
								</span>
								<span className="text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400 hidden sm:inline">
									{combinedItems.length === 1 ? 'item' : 'itens'}
								</span>
							</div>
						)}
					</div>
				</div>
					<div className="flex-1 flex flex-col min-h-0">
						{combinedItems?.length === 0 ? (
							<div className="text-center py-8">
								<div className="mx-auto w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
									{filterType === 'documents' ? (
										<FileText className="h-6 w-6 text-purple-400 dark:text-purple-500" />
									) : filterType === 'movements' ? (
										<Calendar className="h-6 w-6 text-blue-400 dark:text-blue-500" />
									) : (
										<Calendar className="h-6 w-6 text-gray-400 dark:text-gray-500" />
									)}
								</div>
								<h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1.5">
									{filterType === 'documents' 
										? 'Nenhum documento encontrado' 
										: filterType === 'movements' 
										? 'Nenhuma movimentação encontrada'
										: 'Nenhum item encontrado'
									}
								</h3>
								<p className="text-xs text-gray-600 dark:text-gray-400">
									{searchFirstInstance 
										? `Nenhum ${filterType === 'documents' ? 'documento' : filterType === 'movements' ? 'movimentação' : 'item'} corresponde ao filtro aplicado.`
										: `Nenhum ${filterType === 'documents' ? 'documento' : filterType === 'movements' ? 'movimentação' : 'item'} registrado para esta instância.`
									}
								</p>
								{(searchFirstInstance || filterType !== 'all') && (
									<Button
										variant="outline"
										size="sm"
										onClick={() => {
											setSearchFirstInstance("");
											setFilterType('all');
										}}
										className="mt-3 h-7 px-2.5 text-xs"
									>
										Limpar filtros
									</Button>
								)}
							</div>
						) : (
							<div className="flex-1 overflow-y-auto min-h-0">
								<div className="relative pl-1">
									{(combinedItems ?? [])
										.map((item, idx) => {
											if (item.type === 'movement') {
												const isNew = newMovementIds.has(item.id);
												return (
													<MovementItem
														key={`movement-${item.id}`}
														mov={item.data}
														idx={idx}
														isNew={isNew}
														onClick={onMovementClick}
													/>
												);
											} else {
												return (
													<DocumentItem
														key={`document-${item.id}`}
														doc={item.data}
														idx={idx}
														onClick={onDocumentClick}
													/>
												);
											}
										})}
								</div>
							</div>
						)}
					</div>
			</CardContent>
		</Card>
	);
}