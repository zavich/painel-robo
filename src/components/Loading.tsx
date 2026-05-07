"use client";
import { FileText, Clock, CheckCircle, XCircle } from "lucide-react";
import { useTheme } from "@/app/hooks/use-theme-client";

interface LoadingProps {
  message?: string;
}

// Skeleton component for stats cards
export function StatsCardSkeleton() {
  const { theme, mounted } = useTheme();
  const currentTheme = mounted ? theme : "light";

  return (
    <div
      className={`p-6 rounded-2xl border shadow-lg animate-pulse ${
        currentTheme === "dark"
          ? "bg-muted-foreground border-muted"
          : "bg-card border-border"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div
          className={`w-12 h-12 rounded-xl animate-pulse ${
            currentTheme === "dark" ? "bg-muted" : "bg-muted-foreground"
          }`}
        ></div>
        <div className="text-right">
          <div
            className={`h-4 w-16 rounded mb-2 animate-pulse ${
              currentTheme === "dark" ? "bg-muted" : "bg-muted-foreground"
            }`}
          ></div>
          <div
            className={`h-8 w-12 rounded animate-pulse ${
              currentTheme === "dark" ? "bg-muted" : "bg-muted-foreground"
            }`}
          ></div>
        </div>
      </div>
    </div>
  );
}

// Skeleton component for kanban cards
export function KanbanCardSkeleton() {
  const { theme, mounted } = useTheme();
  const currentTheme = mounted ? theme : "light";

  return (
    <div
      className={`border rounded-xl p-4 shadow-sm animate-pulse ${
        currentTheme === "dark"
          ? "bg-muted-foreground border-muted"
          : "bg-card border-border"
      }`}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div
            className={`h-4 w-3/4 rounded animate-pulse ${
              currentTheme === "dark" ? "bg-muted" : "bg-muted-foreground"
            }`}
          ></div>
          <div
            className={`w-8 h-8 rounded-lg animate-pulse ${
              currentTheme === "dark" ? "bg-muted" : "bg-muted-foreground"
            }`}
          ></div>
        </div>

        {/* Process info */}
        <div className="space-y-2">
          <div
            className={`h-3 w-full rounded animate-pulse ${
              currentTheme === "dark" ? "bg-muted" : "bg-muted-foreground"
            }`}
          ></div>
          <div
            className={`h-3 w-2/3 rounded animate-pulse ${
              currentTheme === "dark" ? "bg-muted" : "bg-muted-foreground"
            }`}
          ></div>
          <div
            className={`h-3 w-1/2 rounded animate-pulse ${
              currentTheme === "dark" ? "bg-muted" : "bg-muted-foreground"
            }`}
          ></div>
        </div>

        {/* Bottom section */}
        <div className="flex items-center justify-between pt-2">
          <div
            className={`h-6 w-16 rounded animate-pulse ${
              currentTheme === "dark" ? "bg-muted" : "bg-muted-foreground"
            }`}
          ></div>
          <div
            className={`h-8 w-8 rounded animate-pulse ${
              currentTheme === "dark" ? "bg-muted" : "bg-muted-foreground"
            }`}
          ></div>
        </div>
      </div>
    </div>
  );
}

// Skeleton component for kanban columns
export function KanbanColumnSkeleton() {
  const { theme, mounted } = useTheme();
  const currentTheme = mounted ? theme : "light";

  return (
    <div
      className={`flex-1 border rounded-xl shadow-lg ${
        currentTheme === "dark"
          ? "border-gray-700 bg-gradient-to-b from-gray-700/50 to-gray-800"
          : "border-gray-200 bg-gradient-to-b from-gray-50/50 to-white"
      }`}
    >
      <div
        className={`p-6 border-b ${
          currentTheme === "dark" ? "border-gray-700" : "border-gray-100"
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div
            className={`h-6 w-24 rounded animate-pulse ${
              currentTheme === "dark" ? "bg-gray-600" : "bg-gray-200"
            }`}
          ></div>
          <div
            className={`h-6 w-8 rounded-full animate-pulse ${
              currentTheme === "dark" ? "bg-gray-600" : "bg-gray-200"
            }`}
          ></div>
        </div>
      </div>
      <div className="p-6 space-y-4">
        <KanbanCardSkeleton />
        <KanbanCardSkeleton />
        <KanbanCardSkeleton />
      </div>
    </div>
  );
}

// Skeleton component for table rows
export function TableRowSkeleton() {
  return (
    <tr className="border-b border-gray-100 animate-pulse">
      <td className="px-6 py-4">
        <div className="h-4 w-32 bg-gray-200 rounded"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 w-48 bg-gray-200 rounded"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 w-24 bg-gray-200 rounded"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 w-20 bg-gray-200 rounded"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-8 w-16 bg-gray-200 rounded"></div>
      </td>
    </tr>
  );
}

// Skeleton component for management pages
export function ManagementPageSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-gray-200 rounded-2xl animate-pulse"></div>
          <div>
            <div className="h-6 w-48 bg-gray-200 rounded mb-2 animate-pulse"></div>
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Search section skeleton */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-12 w-full bg-gray-200 rounded-xl animate-pulse"></div>
        </div>
      </div>

      {/* Table skeleton */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {[1, 2, 3, 4, 5].map((i) => (
                  <th key={i} className="px-6 py-4 text-left">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((i) => (
                <TableRowSkeleton key={i} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Skeleton component for process header
export function ProcessHeaderSkeleton() {
  const { theme, mounted } = useTheme();
  const currentTheme = mounted ? theme : "light";

  return (
    <header
      className={`sticky top-0 z-20 backdrop-blur-xl transition-all duration-300 border-b shadow-sm ${
        currentTheme === "dark"
          ? "bg-gray-900/95 border-gray-700"
          : "bg-white/95 border-gray-200"
      }`}
    >
      <div className="max-w-[1920px] w-full mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left: logo + process info */}
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            {/* Logo e tagline */}
            <div className="flex items-center gap-3 flex-wrap">
              <div
                className={`h-11 w-40 rounded animate-pulse ${
                  currentTheme === "dark" ? "bg-gray-700" : "bg-gray-200"
                }`}
              ></div>
              <div
                className={`h-4 w-80 rounded animate-pulse ${
                  currentTheme === "dark" ? "bg-gray-700" : "bg-gray-200"
                }`}
              ></div>
            </div>

            {/* Process info */}
            <div className="flex flex-col gap-2 mt-2">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Process number */}
                <div
                  className={`h-8 w-56 rounded-lg animate-pulse ${
                    currentTheme === "dark"
                      ? "bg-blue-900/30 border-2 border-blue-500"
                      : "bg-blue-50 border-2 border-blue-300"
                  }`}
                ></div>
                {/* Badges */}
                <div
                  className={`h-7 w-20 rounded-lg animate-pulse ${
                    currentTheme === "dark" ? "bg-gray-700" : "bg-gray-200"
                  }`}
                ></div>
                <div
                  className={`h-7 w-24 rounded-lg animate-pulse ${
                    currentTheme === "dark" ? "bg-gray-700" : "bg-gray-200"
                  }`}
                ></div>
              </div>

              {/* Parties */}
              <div className="flex items-center gap-2 flex-wrap">
                <div
                  className={`h-6 w-48 rounded animate-pulse ${
                    currentTheme === "dark" ? "bg-gray-700" : "bg-gray-200"
                  }`}
                ></div>
                <div
                  className={`h-4 w-8 rounded animate-pulse ${
                    currentTheme === "dark" ? "bg-gray-700" : "bg-gray-200"
                  }`}
                ></div>
                <div
                  className={`h-6 w-48 rounded animate-pulse ${
                    currentTheme === "dark" ? "bg-gray-700" : "bg-gray-200"
                  }`}
                ></div>
              </div>
            </div>
          </div>

          {/* Right: actions + theme + user menu */}
          <div className="flex items-start gap-2 sm:gap-3 shrink-0">
            <div
              className={`h-10 w-10 rounded-xl animate-pulse ${
                currentTheme === "dark" ? "bg-gray-700" : "bg-gray-200"
              }`}
            ></div>
            <div
              className={`h-10 w-32 rounded-xl animate-pulse ${
                currentTheme === "dark" ? "bg-gray-700" : "bg-gray-200"
              }`}
            ></div>
          </div>
        </div>
      </div>

      {/* Breadcrumb section */}
      <div
        className={`border-t ${currentTheme === "dark" ? "border-gray-700" : "border-gray-100"}`}
      >
        <div className="max-w-[1920px] w-full mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-3">
          <div className="flex items-center gap-2">
            <div
              className={`h-4 w-20 rounded animate-pulse ${
                currentTheme === "dark" ? "bg-gray-700" : "bg-gray-200"
              }`}
            ></div>
            <div
              className={`h-4 w-2 rounded animate-pulse ${
                currentTheme === "dark" ? "bg-gray-700" : "bg-gray-200"
              }`}
            ></div>
            <div
              className={`h-4 w-16 rounded animate-pulse ${
                currentTheme === "dark" ? "bg-gray-700" : "bg-gray-200"
              }`}
            ></div>
          </div>
        </div>
      </div>
    </header>
  );
}

// Skeleton component for process info card
export function ProcessInfoCardSkeleton() {
  const { theme, mounted } = useTheme();
  const currentTheme = mounted ? theme : "light";

  return (
    <div
      className={`border rounded-xl p-6 shadow-sm animate-pulse mb-6 ${
        currentTheme === "dark"
          ? "bg-gray-800 border-gray-700"
          : "bg-white border-gray-200"
      }`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl ${
              currentTheme === "dark" ? "bg-gray-600" : "bg-gray-200"
            }`}
          ></div>
          <div
            className={`h-6 w-48 rounded ${
              currentTheme === "dark" ? "bg-gray-600" : "bg-gray-200"
            }`}
          ></div>
        </div>
        <div
          className={`w-10 h-10 rounded-xl ${
            currentTheme === "dark" ? "bg-gray-600" : "bg-gray-200"
          }`}
        ></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className={`rounded-xl p-4 ${
              currentTheme === "dark" ? "bg-gray-700" : "bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className={`w-8 h-8 rounded-lg ${
                  currentTheme === "dark" ? "bg-gray-600" : "bg-gray-200"
                }`}
              ></div>
              <div
                className={`h-4 w-20 rounded ${
                  currentTheme === "dark" ? "bg-gray-600" : "bg-gray-200"
                }`}
              ></div>
            </div>
            <div
              className={`h-4 w-full rounded ${
                currentTheme === "dark" ? "bg-gray-600" : "bg-gray-200"
              }`}
            ></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Skeleton component for process parts card
export function ProcessPartsCardSkeleton() {
  const { theme, mounted } = useTheme();
  const currentTheme = mounted ? theme : "light";

  return (
    <div
      className={`border rounded-xl p-6 shadow-sm animate-pulse mb-6 ${
        currentTheme === "dark"
          ? "bg-gray-800 border-gray-700"
          : "bg-white border-gray-200"
      }`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div
            className={`w-5 h-5 rounded ${
              currentTheme === "dark" ? "bg-gray-600" : "bg-gray-200"
            }`}
          ></div>
          <div
            className={`h-6 w-48 rounded ${
              currentTheme === "dark" ? "bg-gray-600" : "bg-gray-200"
            }`}
          ></div>
        </div>
        <div
          className={`w-10 h-10 rounded-xl ${
            currentTheme === "dark" ? "bg-gray-600" : "bg-gray-200"
          }`}
        ></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div
            className={`h-5 w-20 rounded mb-3 ${
              currentTheme === "dark" ? "bg-gray-600" : "bg-gray-200"
            }`}
          ></div>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className={`border rounded-lg p-3 ${
                  currentTheme === "dark"
                    ? "border-gray-600"
                    : "border-gray-200"
                }`}
              >
                <div
                  className={`h-4 w-16 rounded mb-2 ${
                    currentTheme === "dark" ? "bg-gray-600" : "bg-gray-200"
                  }`}
                ></div>
                <div
                  className={`h-4 w-full rounded mb-1 ${
                    currentTheme === "dark" ? "bg-gray-600" : "bg-gray-200"
                  }`}
                ></div>
                <div
                  className={`h-3 w-32 rounded ${
                    currentTheme === "dark" ? "bg-gray-600" : "bg-gray-200"
                  }`}
                ></div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div
            className={`h-5 w-24 rounded mb-3 ${
              currentTheme === "dark" ? "bg-gray-600" : "bg-gray-200"
            }`}
          ></div>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className={`border rounded-lg p-3 ${
                  currentTheme === "dark"
                    ? "border-gray-600"
                    : "border-gray-200"
                }`}
              >
                <div
                  className={`h-4 w-16 rounded mb-2 ${
                    currentTheme === "dark" ? "bg-gray-600" : "bg-gray-200"
                  }`}
                ></div>
                <div
                  className={`h-4 w-full rounded mb-1 ${
                    currentTheme === "dark" ? "bg-gray-600" : "bg-gray-200"
                  }`}
                ></div>
                <div
                  className={`h-3 w-32 rounded ${
                    currentTheme === "dark" ? "bg-gray-600" : "bg-gray-200"
                  }`}
                ></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Skeleton component for documents card
export function DocumentsCardSkeleton() {
  const { theme, mounted } = useTheme();
  const currentTheme = mounted ? theme : "light";

  return (
    <div
      className={`border rounded-xl shadow-lg h-full flex flex-col ${
        currentTheme === "dark"
          ? "bg-gray-800/80 border-gray-700"
          : "bg-white/80 border-gray-200"
      }`}
    >
      {/* Empty state - document viewer placeholder */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 animate-pulse">
        <div
          className={`w-24 h-24 rounded-xl mb-6 ${
            currentTheme === "dark" ? "bg-gray-700" : "bg-gray-100"
          }`}
        ></div>
        <div
          className={`h-5 w-64 rounded mb-3 ${
            currentTheme === "dark" ? "bg-gray-700" : "bg-gray-200"
          }`}
        ></div>
        <div
          className={`h-4 w-48 rounded ${
            currentTheme === "dark" ? "bg-gray-700" : "bg-gray-200"
          }`}
        ></div>
      </div>
    </div>
  );
}

// Skeleton component for timeline card
export function TimelineCardSkeleton() {
  const { theme, mounted } = useTheme();
  const currentTheme = mounted ? theme : "light";

  return (
    <div
      className={`border rounded-xl shadow-sm animate-pulse h-full flex flex-col ${
        currentTheme === "dark"
          ? "bg-gray-800 border-gray-700"
          : "bg-white border-gray-200"
      }`}
    >
      {/* Timeline Header */}
      <div
        className={`flex items-center justify-between p-4 border-b ${
          currentTheme === "dark" ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <div className="flex items-center gap-2">
          <div
            className={`w-5 h-5 rounded ${
              currentTheme === "dark" ? "bg-gray-600" : "bg-gray-200"
            }`}
          ></div>
          <div
            className={`h-5 w-48 rounded ${
              currentTheme === "dark" ? "bg-gray-600" : "bg-gray-200"
            }`}
          ></div>
        </div>
      </div>

      {/* Filter Input */}
      <div className="p-4">
        <div
          className={`h-10 w-full rounded-lg ${
            currentTheme === "dark" ? "bg-gray-600" : "bg-gray-200"
          }`}
        ></div>
      </div>

      {/* Timeline Entries */}
      <div className="flex-1 overflow-hidden p-4">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-start space-x-3">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentTheme === "dark"
                      ? "bg-blue-900/30 border-2 border-blue-500"
                      : "bg-blue-100 border-2 border-blue-400"
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded ${
                      currentTheme === "dark" ? "bg-gray-600" : "bg-gray-300"
                    }`}
                  ></div>
                </div>
                {i < 5 && (
                  <div
                    className={`w-0.5 h-12 ${
                      currentTheme === "dark" ? "bg-blue-500/30" : "bg-blue-300"
                    }`}
                  ></div>
                )}
              </div>
              <div className="flex-1 pb-4">
                <div
                  className={`h-4 w-24 rounded mb-2 ${
                    currentTheme === "dark" ? "bg-gray-600" : "bg-gray-200"
                  }`}
                ></div>
                <div
                  className={`h-3 w-full rounded mb-1 ${
                    currentTheme === "dark" ? "bg-gray-600" : "bg-gray-200"
                  }`}
                ></div>
                <div
                  className={`h-3 w-3/4 rounded ${
                    currentTheme === "dark" ? "bg-gray-600" : "bg-gray-200"
                  }`}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Skeleton component for pipedrive form card
export function PipedriveFormCardSkeleton() {
  const { theme, mounted } = useTheme();
  const currentTheme = mounted ? theme : "light";

  return (
    <div
      className={`border rounded-xl p-6 shadow-sm animate-pulse mb-8 ${
        currentTheme === "dark"
          ? "bg-gray-800 border-gray-700"
          : "bg-white border-gray-200"
      }`}
    >
      <div className="flex items-center justify-between mb-6">
        <div
          className={`h-6 w-48 rounded ${
            currentTheme === "dark" ? "bg-gray-600" : "bg-gray-200"
          }`}
        ></div>
        <div
          className={`w-10 h-10 rounded-xl ${
            currentTheme === "dark" ? "bg-gray-600" : "bg-gray-200"
          }`}
        ></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
          <div key={i} className="space-y-2">
            <div
              className={`h-4 w-24 rounded ${
                currentTheme === "dark" ? "bg-gray-600" : "bg-gray-200"
              }`}
            ></div>
            <div
              className={`h-10 w-full rounded ${
                currentTheme === "dark" ? "bg-gray-600" : "bg-gray-200"
              }`}
            ></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Skeleton component for declined process banner
export function DeclinedProcessBannerSkeleton() {
  const { theme, mounted } = useTheme();
  const currentTheme = mounted ? theme : "light";

  return (
    <div
      className={`border rounded-xl p-5 flex items-start gap-4 mb-8 animate-pulse ${
        currentTheme === "dark"
          ? "bg-gray-800 border-gray-700"
          : "bg-gray-100 border-gray-200"
      }`}
    >
      <div
        className={`w-8 h-8 rounded-full ${
          currentTheme === "dark" ? "bg-gray-600" : "bg-gray-200"
        }`}
      ></div>
      <div className="flex-1">
        <div
          className={`h-6 w-40 rounded mb-2 ${
            currentTheme === "dark" ? "bg-gray-600" : "bg-gray-200"
          }`}
        ></div>
        <div
          className={`h-4 w-32 rounded mb-1 ${
            currentTheme === "dark" ? "bg-gray-600" : "bg-gray-200"
          }`}
        ></div>
        <div
          className={`h-3 w-48 rounded ${
            currentTheme === "dark" ? "bg-gray-600" : "bg-gray-200"
          }`}
        ></div>
      </div>
    </div>
  );
}

// Main loading component
export default function Loading({ message }: LoadingProps) {
  const { theme, mounted } = useTheme();

  // Use a default theme during SSR to avoid hydration mismatch
  const currentTheme = mounted ? theme : "light";

  return (
    <div
      className={`min-h-screen ${
        currentTheme === "dark"
          ? "bg-gradient-to-br from-background via-background to-muted"
          : "bg-gradient-to-br from-background via-background to-muted"
      }`}
      suppressHydrationWarning
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading overlay */}
        <div
          className={`fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center ${
            currentTheme === "dark" ? "bg-popover/90" : "bg-popover/90"
          }`}
          suppressHydrationWarning
        >
          <div
            className={`rounded-2xl shadow-2xl p-8 border max-w-md w-full mx-4 ${
              currentTheme === "dark"
                ? "bg-card border-border"
                : "bg-card border-border"
            }`}
            suppressHydrationWarning
          >
            <div className="text-center">
              {/* Animated spinner */}
              <div className="relative flex justify-center mb-6">
                <div className="w-16 h-16 relative">
                  <div
                    className={`absolute inset-0 rounded-full border-4 ${
                      currentTheme === "dark"
                        ? "border-secondary"
                        : "border-secondary"
                    }`}
                    suppressHydrationWarning
                  ></div>
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-secondary animate-spin"></div>
                  <div
                    className={`absolute inset-2 rounded-full flex items-center justify-center ${
                      currentTheme === "dark"
                        ? "bg-gradient-to-br from-secondary to-accent"
                        : "bg-gradient-to-br from-secondary to-accent"
                    }`}
                    suppressHydrationWarning
                  >
                    <FileText
                      className={`h-6 w-6 animate-pulse ${
                        currentTheme === "dark"
                          ? "text-secondary-foreground"
                          : "text-secondary-foreground"
                      }`}
                      suppressHydrationWarning
                    />
                  </div>
                </div>
              </div>

              {/* Loading text */}
              <h2
                className={`text-xl font-bold mb-2 ${
                  currentTheme === "dark"
                    ? "text-foreground"
                    : "text-foreground"
                }`}
                suppressHydrationWarning
              >
                {message || "Carregando..."}
              </h2>
              <p
                className={
                  currentTheme === "dark"
                    ? "text-muted-foreground"
                    : "text-muted-foreground"
                }
                suppressHydrationWarning
              >
                Aguarde enquanto buscamos os dados mais recentes.
              </p>

              {/* Progress dots */}
              <div className="flex justify-center space-x-1 mt-6">
                <div className="w-2 h-2 bg-secondary rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-secondary rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-secondary rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
