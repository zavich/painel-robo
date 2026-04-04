"use client";

import { useState } from "react";
import { useProcessMetrics } from "@/app/api/hooks/process/useProcessMetrics";
import { useTheme } from "@/app/hooks/use-theme-client";
import { 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  FileText, 
  TrendingUp,
  XCircle,
  AlertCircle,
  PieChart as PieChartIcon
} from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { Button } from "@/components/ui/button";

type ChartView = "bars" | "pie" | "stacked" | "line";

export function MetricsDashboard() {
  const { theme } = useTheme();
  const { data: metrics, isLoading, error } = useProcessMetrics();
  const [chartView, setChartView] = useState<ChartView>("bars");

  if (isLoading) {
    return (
      <div className={`rounded-2xl shadow-lg p-8 ${
        theme === "dark" 
          ? "bg-gray-800 border-gray-700 border" 
          : "bg-white border-gray-200 border"
      }`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-2xl shadow-lg p-8 ${
        theme === "dark" 
          ? "bg-gray-800 border-gray-700 border" 
          : "bg-white border-gray-200 border"
      }`}>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <AlertCircle className={`h-12 w-12 ${
            theme === "dark" ? "text-red-400" : "text-red-600"
          }`} />
          <p className={`text-lg font-semibold ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}>
            Erro ao carregar métricas
          </p>
        </div>
      </div>
    );
  }

  const activityTypes = [
    {
      key: "PRE_ANALISE" as const,
      label: "Pré-Análise",
      color: "blue",
      icon: FileText,
    },
    {
      key: "ANALISE" as const,
      label: "Análise",
      color: "purple",
      icon: BarChart3,
    },
    {
      key: "CALCULO" as const,
      label: "Cálculo",
      color: "green",
      icon: TrendingUp,
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: theme === "dark" ? "bg-blue-900/30" : "bg-blue-50",
        border: theme === "dark" ? "border-blue-700" : "border-blue-200",
        text: theme === "dark" ? "text-blue-400" : "text-blue-600",
        iconBg: theme === "dark" ? "bg-blue-900/50" : "bg-blue-100",
      },
      purple: {
        bg: theme === "dark" ? "bg-purple-900/30" : "bg-purple-50",
        border: theme === "dark" ? "border-purple-700" : "border-purple-200",
        text: theme === "dark" ? "text-purple-400" : "text-purple-600",
        iconBg: theme === "dark" ? "bg-purple-900/50" : "bg-purple-100",
      },
      green: {
        bg: theme === "dark" ? "bg-green-900/30" : "bg-green-50",
        border: theme === "dark" ? "border-green-700" : "border-green-200",
        text: theme === "dark" ? "text-green-400" : "text-green-600",
        iconBg: theme === "dark" ? "bg-green-900/50" : "bg-green-100",
      },
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
          <BarChart3 className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className={`text-3xl font-bold ${
            theme === "dark" ? "text-gray-100" : "text-gray-900"
          }`}>
            Dashboard de Métricas
          </h2>
          <p className={`mt-1 ${
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          }`}>
            Visão geral dos processos por tipo de atividade
          </p>
        </div>
      </div>

      {/* Total Processes Card */}
      <div className={`rounded-2xl shadow-lg p-6 border ${
        theme === "dark" 
          ? "bg-gray-800 border-gray-700" 
          : "bg-white border-gray-200"
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-medium ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}>
              Total de Processos
            </p>
            <p className={`text-4xl font-bold mt-2 ${
              theme === "dark" ? "text-gray-100" : "text-gray-900"
            }`}>
              {metrics?.totalProcesses || 0}
            </p>
          </div>
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
            theme === "dark" ? "bg-blue-900/30" : "bg-blue-50"
          }`}>
            <FileText className={`h-8 w-8 ${
              theme === "dark" ? "text-blue-400" : "text-blue-600"
            }`} />
          </div>
        </div>
      </div>

      {/* Charts Section with View Toggle */}
      <div className={`rounded-2xl shadow-lg p-6 border mb-6 ${
        theme === "dark" 
          ? "bg-gray-800 border-gray-700" 
          : "bg-white border-gray-200"
      }`}>
        {/* View Toggle Buttons */}
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-lg font-bold ${
            theme === "dark" ? "text-gray-100" : "text-gray-900"
          }`}>
            Visualizações
          </h3>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={chartView === "bars" ? "default" : "outline"}
              size="sm"
              onClick={() => setChartView("bars")}
              className={`rounded-xl transition-all ${
                chartView === "bars"
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : theme === "dark"
                  ? "border-gray-600 hover:bg-gray-700"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Barras
            </Button>
            <Button
              variant={chartView === "pie" ? "default" : "outline"}
              size="sm"
              onClick={() => setChartView("pie")}
              className={`rounded-xl transition-all ${
                chartView === "pie"
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : theme === "dark"
                  ? "border-gray-600 hover:bg-gray-700"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <PieChartIcon className="h-4 w-4 mr-2" />
              Setores
            </Button>
            <Button
              variant={chartView === "stacked" ? "default" : "outline"}
              size="sm"
              onClick={() => setChartView("stacked")}
              className={`rounded-xl transition-all ${
                chartView === "stacked"
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : theme === "dark"
                  ? "border-gray-600 hover:bg-gray-700"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Empilhadas
            </Button>
            <Button
              variant={chartView === "line" ? "default" : "outline"}
              size="sm"
              onClick={() => setChartView("line")}
              className={`rounded-xl transition-all ${
                chartView === "line"
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : theme === "dark"
                  ? "border-gray-600 hover:bg-gray-700"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <FileText className="h-4 w-4 mr-2" />
              Linha
            </Button>
          </div>
        </div>

        {/* Chart Content */}
        <div className="h-[500px]">
          {chartView === "bars" && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={activityTypes.map((activity) => ({
                  name: activity.label,
                  total: metrics?.processesByActivityType?.[activity.key]?.total || 0,
                  color: activity.color,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#374151" : "#e5e7eb"} />
                <XAxis 
                  dataKey="name" 
                  stroke={theme === "dark" ? "#9ca3af" : "#6b7280"}
                  tick={{ fill: theme === "dark" ? "#9ca3af" : "#6b7280" }}
                />
                <YAxis 
                  stroke={theme === "dark" ? "#9ca3af" : "#6b7280"}
                  tick={{ fill: theme === "dark" ? "#9ca3af" : "#6b7280" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
                    border: theme === "dark" ? "1px solid #374151" : "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: theme === "dark" ? "#d1d5db" : "#374151" }}
                />
                <Bar 
                  dataKey="total" 
                  radius={[8, 8, 0, 0]}
                >
                  {activityTypes.map((activity, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={
                        activity.color === "blue"
                          ? theme === "dark" ? "#3b82f6" : "#2563eb"
                          : activity.color === "purple"
                          ? theme === "dark" ? "#a855f7" : "#9333ea"
                          : theme === "dark" ? "#10b981" : "#059669"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}

          {chartView === "pie" && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    {
                      name: "Pendentes",
                      value: activityTypes.reduce(
                        (sum, activity) => sum + (metrics?.processesByActivityType?.[activity.key]?.pending || 0),
                        0
                      ),
                      color: theme === "dark" ? "#fbbf24" : "#f59e0b",
                    },
                    {
                      name: "Completados",
                      value: activityTypes.reduce(
                        (sum, activity) => sum + (metrics?.processesByActivityType?.[activity.key]?.completed || 0),
                        0
                      ),
                      color: theme === "dark" ? "#10b981" : "#059669",
                    },
                    {
                      name: "Aprovados",
                      value: activityTypes.reduce(
                        (sum, activity) => sum + (metrics?.processesByActivityType?.[activity.key]?.approved || 0),
                        0
                      ),
                      color: theme === "dark" ? "#3b82f6" : "#2563eb",
                    },
                    {
                      name: "Rejeitados",
                      value: activityTypes.reduce(
                        (sum, activity) => sum + (metrics?.processesByActivityType?.[activity.key]?.rejected || 0),
                        0
                      ),
                      color: theme === "dark" ? "#ef4444" : "#dc2626",
                    },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[
                    { color: theme === "dark" ? "#fbbf24" : "#f59e0b" },
                    { color: theme === "dark" ? "#10b981" : "#059669" },
                    { color: theme === "dark" ? "#3b82f6" : "#2563eb" },
                    { color: theme === "dark" ? "#ef4444" : "#dc2626" },
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
                    border: theme === "dark" ? "1px solid #374151" : "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: theme === "dark" ? "#d1d5db" : "#374151" }}
                />
                <Legend
                  wrapperStyle={{
                    color: theme === "dark" ? "#d1d5db" : "#374151",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}

          {chartView === "stacked" && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={activityTypes.map((activity) => {
                  const data = metrics?.processesByActivityType?.[activity.key];
                  return {
                    name: activity.label,
                    Pendentes: data?.pending || 0,
                    Completados: data?.completed || 0,
                    Aprovados: data?.approved || 0,
                    Rejeitados: data?.rejected || 0,
                  };
                })}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#374151" : "#e5e7eb"} />
                <XAxis 
                  dataKey="name" 
                  stroke={theme === "dark" ? "#9ca3af" : "#6b7280"}
                  tick={{ fill: theme === "dark" ? "#9ca3af" : "#6b7280" }}
                />
                <YAxis 
                  stroke={theme === "dark" ? "#9ca3af" : "#6b7280"}
                  tick={{ fill: theme === "dark" ? "#9ca3af" : "#6b7280" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
                    border: theme === "dark" ? "1px solid #374151" : "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: theme === "dark" ? "#d1d5db" : "#374151" }}
                />
                <Legend
                  wrapperStyle={{
                    color: theme === "dark" ? "#d1d5db" : "#374151",
                  }}
                />
                <Bar 
                  dataKey="Pendentes" 
                  stackId="a" 
                  fill={theme === "dark" ? "#fbbf24" : "#f59e0b"}
                  radius={[0, 0, 0, 0]}
                />
                <Bar 
                  dataKey="Completados" 
                  stackId="a" 
                  fill={theme === "dark" ? "#10b981" : "#059669"}
                  radius={[0, 0, 0, 0]}
                />
                <Bar 
                  dataKey="Aprovados" 
                  stackId="a" 
                  fill={theme === "dark" ? "#3b82f6" : "#2563eb"}
                  radius={[0, 0, 0, 0]}
                />
                <Bar 
                  dataKey="Rejeitados" 
                  stackId="a" 
                  fill={theme === "dark" ? "#ef4444" : "#dc2626"}
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}

          {chartView === "line" && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={activityTypes.map((activity) => {
                  const data = metrics?.processesByActivityType?.[activity.key];
                  return {
                    name: activity.label,
                    Pendentes: data?.pending || 0,
                    Completados: data?.completed || 0,
                    Aprovados: data?.approved || 0,
                    Rejeitados: data?.rejected || 0,
                  };
                })}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#374151" : "#e5e7eb"} />
                <XAxis 
                  dataKey="name" 
                  stroke={theme === "dark" ? "#9ca3af" : "#6b7280"}
                  tick={{ fill: theme === "dark" ? "#9ca3af" : "#6b7280" }}
                />
                <YAxis 
                  stroke={theme === "dark" ? "#9ca3af" : "#6b7280"}
                  tick={{ fill: theme === "dark" ? "#9ca3af" : "#6b7280" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
                    border: theme === "dark" ? "1px solid #374151" : "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: theme === "dark" ? "#d1d5db" : "#374151" }}
                />
                <Legend
                  wrapperStyle={{
                    color: theme === "dark" ? "#d1d5db" : "#374151",
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Pendentes" 
                  stroke={theme === "dark" ? "#fbbf24" : "#f59e0b"}
                  strokeWidth={2}
                  dot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Completados" 
                  stroke={theme === "dark" ? "#10b981" : "#059669"}
                  strokeWidth={2}
                  dot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Aprovados" 
                  stroke={theme === "dark" ? "#3b82f6" : "#2563eb"}
                  strokeWidth={2}
                  dot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Rejeitados" 
                  stroke={theme === "dark" ? "#ef4444" : "#dc2626"}
                  strokeWidth={2}
                  dot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Activity Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activityTypes.map((activity) => {
          const data = metrics?.processesByActivityType?.[activity.key];
          const colors = getColorClasses(activity.color);
          const Icon = activity.icon;

          if (!data) return null;

          const completionRate = data.total > 0 
            ? ((data.completed / data.total) * 100).toFixed(1)
            : "0";

          return (
            <div
              key={activity.key}
              className={`rounded-2xl shadow-lg p-6 border ${colors.bg} ${colors.border}`}
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors.iconBg}`}>
                  <Icon className={`h-5 w-5 ${colors.text}`} />
                </div>
                <div>
                  <h3 className={`text-lg font-bold ${
                    theme === "dark" ? "text-gray-100" : "text-gray-900"
                  }`}>
                    {activity.label}
                  </h3>
                  <p className={`text-sm ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}>
                    {data.total} processos
                  </p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Pending */}
                <div className={`rounded-xl p-4 ${
                  theme === "dark" ? "bg-gray-700/50" : "bg-white"
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className={`h-4 w-4 ${
                      theme === "dark" ? "text-yellow-400" : "text-yellow-600"
                    }`} />
                    <span className={`text-xs font-medium ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}>
                      Pendentes
                    </span>
                  </div>
                  <p className={`text-2xl font-bold ${
                    theme === "dark" ? "text-gray-100" : "text-gray-900"
                  }`}>
                    {data.pending}
                  </p>
                </div>

                {/* Completed */}
                <div className={`rounded-xl p-4 ${
                  theme === "dark" ? "bg-gray-700/50" : "bg-white"
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className={`h-4 w-4 ${
                      theme === "dark" ? "text-green-400" : "text-green-600"
                    }`} />
                    <span className={`text-xs font-medium ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}>
                      Completados
                    </span>
                  </div>
                  <p className={`text-2xl font-bold ${
                    theme === "dark" ? "text-gray-100" : "text-gray-900"
                  }`}>
                    {data.completed}
                  </p>
                </div>

                {/* Approved */}
                <div className={`rounded-xl p-4 ${
                  theme === "dark" ? "bg-gray-700/50" : "bg-white"
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className={`h-4 w-4 ${
                      theme === "dark" ? "text-blue-400" : "text-blue-600"
                    }`} />
                    <span className={`text-xs font-medium ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}>
                      Aprovados
                    </span>
                  </div>
                  <p className={`text-2xl font-bold ${
                    theme === "dark" ? "text-gray-100" : "text-gray-900"
                  }`}>
                    {data.approved}
                  </p>
                </div>

                {/* Rejected */}
                <div className={`rounded-xl p-4 ${
                  theme === "dark" ? "bg-gray-700/50" : "bg-white"
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className={`h-4 w-4 ${
                      theme === "dark" ? "text-red-400" : "text-red-600"
                    }`} />
                    <span className={`text-xs font-medium ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}>
                      Rejeitados
                    </span>
                  </div>
                  <p className={`text-2xl font-bold ${
                    theme === "dark" ? "text-gray-100" : "text-gray-900"
                  }`}>
                    {data.rejected}
                  </p>
                </div>
              </div>

              {/* Completion Rate */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}>
                    Taxa de Conclusão
                  </span>
                  <span className={`text-sm font-bold ${colors.text}`}>
                    {completionRate}%
                  </span>
                </div>
                <div className={`w-full h-2 rounded-full ${
                  theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                }`}>
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      activity.color === "blue"
                        ? theme === "dark"
                          ? "bg-blue-500"
                          : "bg-blue-600"
                        : activity.color === "purple"
                        ? theme === "dark"
                          ? "bg-purple-500"
                          : "bg-purple-600"
                        : theme === "dark"
                        ? "bg-green-500"
                        : "bg-green-600"
                    }`}
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

