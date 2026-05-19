import { ArrowUp, CheckCircle2, Clock, XCircle } from "lucide-react";
import { TimelineEvent } from "./timelineTypes";

interface DecisionTimelineItemProps {
  event: TimelineEvent;
  theme: string;
  formatDateShort: (dateString: string | null) => string;
}

export function DecisionTimelineItem({
  event,
  theme,
  formatDateShort,
}: DecisionTimelineItemProps) {
  const getEventIcon = () => {
    if (event.status === "APPROVED") {
      return <CheckCircle2 className="h-4 w-4" />;
    }
    if (event.status === "REJECTED") {
      return <XCircle className="h-4 w-4" />;
    }
    if (event.type === "stage_change") {
      return <ArrowUp className="h-4 w-4" />;
    }
    return <Clock className="h-4 w-4" />;
  };

  const getEventIconColor = () => {
    if (event.status === "APPROVED") {
      return theme === "dark" ? "text-green-400" : "text-green-600";
    }
    if (event.status === "REJECTED") {
      return theme === "dark" ? "text-red-400" : "text-red-600";
    }
    if (event.type === "stage_change") {
      return theme === "dark" ? "text-blue-400" : "text-blue-600";
    }
    return theme === "dark" ? "text-gray-400" : "text-gray-500";
  };

  const getEventIconBg = () => {
    if (event.status === "APPROVED") {
      return theme === "dark"
        ? "bg-green-900/30 border-green-700"
        : "bg-green-50 border-green-200";
    }
    if (event.status === "REJECTED") {
      return theme === "dark"
        ? "bg-red-900/30 border-red-700"
        : "bg-red-50 border-red-200";
    }
    if (event.type === "stage_change") {
      return theme === "dark"
        ? "bg-blue-900/30 border-blue-700"
        : "bg-blue-50 border-blue-200";
    }
    return theme === "dark"
      ? "bg-gray-700 border-gray-600"
      : "bg-white border-gray-200";
  };

  return (
    <div key={event.id} className="relative flex gap-4">
      {/* Ícone na timeline */}
      <div
        className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center ${getEventIconBg()} ${getEventIconColor()}`}
      >
        {getEventIcon()}
      </div>

      {/* Conteúdo do evento */}
      <div className="flex-1 min-w-0 pb-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex-1 min-w-0">
            <div
              className={`font-semibold text-sm ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}
            >
              {event.title}
            </div>
            <div
              className={`text-xs mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
            >
              {formatDateShort(event.date)}
              {event.user && ` · ${event.user}`}
            </div>
          </div>
        </div>

        {/* Motivo de rejeição da decisão */}
        {event.status === "REJECTED" && event.rejectionReason && (
          <div
            className={`mt-2 p-3 rounded text-xs ${
              theme === "dark"
                ? "bg-red-900/20 border border-red-700"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <div
              className={`font-semibold mb-1 ${theme === "dark" ? "text-red-300" : "text-red-700"}`}
            >
              Motivo: {event.rejectionReason}
            </div>
            {event.rejectionDescription && (
              <div
                className={
                  theme === "dark" ? "text-red-200" : "text-red-600"
                }
              >
                {event.rejectionDescription}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
