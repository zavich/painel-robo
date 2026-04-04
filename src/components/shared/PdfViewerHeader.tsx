import React from "react";
import { useTheme } from "@/app/hooks/use-theme-client";

interface PdfViewerHeaderProps {
  pageNumber: number;
  numPages: number;
  scale: number;
  onPrev: () => void;
  onNext: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  hidePagination?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onSearchNext?: () => void;
  onSearchPrev?: () => void;
  searchCount?: number;
  searchIndex?: number;
}

const PdfViewerHeader: React.FC<PdfViewerHeaderProps> = ({
  pageNumber,
  numPages,
  scale,
  onPrev,
  onNext,
  onZoomIn,
  onZoomOut,
  hidePagination = false,
  searchValue = "",
  onSearchChange,
  onSearchNext,
  onSearchPrev,
  searchCount = 0,
  searchIndex = 0,
}) => {
  const { theme } = useTheme();
  
  return (
    <div className={`flex-shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 px-2 sm:px-4 py-2 border-b rounded-t-lg ${
      theme === "dark" 
        ? "bg-gray-800 border-gray-700" 
        : "bg-muted border-border"
    }`}>
      {/* Paginação - Oculta em mobile quando hidePagination é true */}
      {!hidePagination && (
        <div className="flex gap-1 sm:gap-2 items-center justify-center sm:justify-start">
          <button
            onClick={onPrev}
            disabled={pageNumber <= 1}
            className={`px-2 py-1 rounded text-xs sm:text-sm transition-colors disabled:opacity-50 ${
              theme === "dark"
                ? "bg-blue-600 text-white border-gray-600 hover:bg-blue-700"
                : "bg-primary text-primary-foreground border border-border hover:bg-primary-light"
            }`}
          >
            <span className="hidden sm:inline">Página anterior</span>
            <span className="sm:hidden">←</span>
          </button>
          <span className={`text-xs sm:text-sm font-medium px-2 ${theme === "dark" ? "text-gray-300" : "text-muted-foreground"}`}>
            {pageNumber} / {numPages}
          </span>
          <button
            onClick={onNext}
            disabled={pageNumber >= numPages}
            className={`px-2 py-1 rounded text-xs sm:text-sm transition-colors disabled:opacity-50 ${
              theme === "dark"
                ? "bg-blue-600 text-white border-gray-600 hover:bg-blue-700"
                : "bg-primary text-primary-foreground border border-border hover:bg-primary-light"
            }`}
          >
            <span className="hidden sm:inline">Próxima página</span>
            <span className="sm:hidden">→</span>
          </button>
        </div>
      )}
      
      {/* Zoom - Sempre visível */}
      <div className="flex gap-1 sm:gap-2 items-center justify-center">
        <button
          onClick={onZoomOut}
          disabled={scale <= 0.6}
          className={`w-8 h-8 sm:px-2 sm:py-1 rounded text-sm transition-colors disabled:opacity-50 flex items-center justify-center ${
            theme === "dark"
              ? "bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600"
              : "bg-accent text-accent-foreground border border-border hover:bg-accent/80"
          }`}
        >
          -
        </button>
        <span className={`px-1 sm:px-2 text-xs sm:text-sm font-medium whitespace-nowrap ${
          theme === "dark" ? "text-gray-300" : "text-muted-foreground"
        }`}>
          <span className="hidden sm:inline">Zoom: </span>
          {(scale * 100).toFixed(0)}%
        </span>
        <button
          onClick={onZoomIn}
          disabled={scale >= 3}
          className={`w-8 h-8 sm:px-2 sm:py-1 rounded text-sm transition-colors disabled:opacity-50 flex items-center justify-center ${
            theme === "dark"
              ? "bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600"
              : "bg-accent text-accent-foreground border border-border hover:bg-accent/80"
          }`}
        >
          +
        </button>
      </div>
      
      {/* Busca - Compacta em mobile */}
      <div className="flex gap-1 sm:gap-2 items-center justify-center flex-1 sm:flex-initial">
        <input
          type="text"
          value={searchValue}
          onChange={e => onSearchChange?.(e.target.value)}
          placeholder="Buscar..."
          className={`w-full sm:w-auto px-2 py-1 rounded border text-xs sm:text-sm transition-colors ${
            theme === "dark"
              ? "border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:border-blue-400"
              : "border-border bg-background"
          }`}
          style={{ minWidth: '80px', maxWidth: '200px' }}
        />
        <div className="flex gap-1 items-center">
          <button
            type="button"
            onClick={onSearchPrev}
            disabled={searchCount <= 1}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded text-xs sm:text-sm transition-colors flex items-center justify-center ${
              theme === "dark"
                ? "border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700"
                : "border border-border bg-background"
            }`}
            title="Anterior"
          >
            ←
          </button>
          <button
            type="button"
            onClick={onSearchNext}
            disabled={searchCount <= 1}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded text-xs sm:text-sm transition-colors flex items-center justify-center ${
              theme === "dark"
                ? "border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700"
                : "border border-border bg-background"
            }`}
            title="Próximo"
          >
            →
          </button>
        </div>
        {searchCount > 0 && (
          <span className="text-[10px] sm:text-xs whitespace-nowrap">
            <span className={`font-bold ${theme === "dark" ? "text-blue-400" : "text-primary"}`}>{searchIndex + 1}</span>
            <span className={theme === "dark" ? "text-gray-400" : "text-muted-foreground"}> / {searchCount}</span>
          </span>
        )}
      </div>
    </div>
  );
};

export default PdfViewerHeader;