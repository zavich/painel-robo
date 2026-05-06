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
        return "from-primary to-primary-light";
      case "2grau":
        return "from-secondary to-accent";
      case "tst":
        return "from-success to-success-light";
      default:
        return "from-muted to-muted-foreground";
    }
  };

  return (
    <Card
      className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
        isActive
          ? "border-2 border-primary ring-4 ring-primary/20 dark:ring-primary-foreground/30"
          : "border border-border dark:border-border hover:border-primary dark:hover:border-primary-foreground"
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-2 px-2 sm:px-3 pt-2">
        <div className="flex items-center justify-center gap-1.5 sm:gap-2">
          <div
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-lg bg-gradient-to-br ${getColorClass()} flex items-center justify-center text-white shadow-md flex-shrink-0`}
          >
            {getIcon()}
          </div>
          <CardTitle className="text-xs sm:text-sm md:text-base font-bold text-foreground dark:text-card-foreground truncate">
            {title}
          </CardTitle>
        </div>
      </CardHeader>
    </Card>
  );
}
