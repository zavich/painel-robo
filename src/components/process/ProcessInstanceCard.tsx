"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, TrendingUp, Calendar } from "lucide-react";

interface ProcessInstanceCardProps {
  title: string;
  processNumber?: string;
  instance?: "1grau" | "2grau" | "tst";
  onClick?: () => void;
  isActive?: boolean;
}

export function ProcessInstanceCard({
  title,
  processNumber,
  instance,
  onClick,
  isActive = false,
}: ProcessInstanceCardProps) {
  const getIcon = () => {
    switch (instance) {
      case "1grau":
      case "2grau":
        return <FileText className="h-4 w-4" />;
      case "tst":
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getColorClass = () => {
    switch (instance) {
      case "1grau":
        return "from-blue-500 to-blue-600";
      case "2grau":
        return "from-purple-500 to-purple-600";
      case "tst":
        return "from-orange-500 to-orange-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  return (
    <Card
      className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
        isActive 
          ? 'border-2 border-blue-500 ring-4 ring-blue-200 dark:ring-blue-900/30' 
          : 'border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-2 px-2 sm:px-3 pt-2">
        <div className="flex items-center justify-center gap-1.5 sm:gap-2">
          <div className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-lg bg-gradient-to-br ${getColorClass()} flex items-center justify-center text-white shadow-md flex-shrink-0`}>
            {getIcon()}
          </div>
          <CardTitle className="text-xs sm:text-sm md:text-base font-bold text-gray-900 dark:text-gray-100 truncate">
            {title}
          </CardTitle>
        </div>
      </CardHeader>
    </Card>
  );
}

