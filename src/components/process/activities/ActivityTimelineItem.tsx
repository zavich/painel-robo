import DOMPurify from "isomorphic-dompurify";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  Check,
  CheckCircle2,
  Edit2,
  MoreVertical,
  Building2,
} from "lucide-react";
import { ActivityType } from "@/app/api/hooks/process/useCreateActivity";
import { TimelineEvent } from "./timelineTypes";

interface ActivityTimelineItemProps {
  event: TimelineEvent;
  theme: string;
  isFirstActivity: boolean;
  isLastActivity: boolean;
  isAdmin: boolean;
  userId?: string;
  assignedByUser: { name?: string; email?: string } | null;
  formatDateShort: (dateString: string | null) => string;
  onOpenCompleteDialog: (activityType: ActivityType, currentNotes: string) => void;
  onOpenEditNotesDialog: (
    activityType: ActivityType,
    currentNotes: string,
    assigneeId: string,
  ) => void;
}

export function ActivityTimelineItem({
  event,
  theme,
  isFirstActivity,
  isLastActivity,
  isAdmin,
  userId,
  assignedByUser,
  formatDateShort,
  onOpenCompleteDialog,
  onOpenEditNotesDialog,
}: ActivityTimelineItemProps) {
  const getLineColor = () => {
    if (!event.isCompleted)
      return theme === "dark" ? "#4b5563" : "#d1d5db";
    if (event.activityStatus === "LOSS") return "#dc2626";
    if (event.activityStatus === "APPROVE") return "#16a34a";
    return theme === "dark" ? "#4b5563" : "#d1d5db";
  };

  const getEventIconColor = () => {
    if (event.isCompleted) {
      return theme === "dark" ? "text-green-400" : "text-green-600";
    }
    return theme === "dark" ? "text-gray-400" : "text-gray-500";
  };

  return (
    <div key={event.id} className="mb-4 relative pl-8">
      {/* Segmento de linha pontilhada para esta atividade */}
      <div
        className="absolute left-0"
        style={{
          left: "18px",
          width: "1px",
          top: isFirstActivity ? "0px" : "16px",
          bottom: isLastActivity ? "0px" : "-16px",
          borderLeft: `1px dashed ${getLineColor()}`,
          marginLeft: "-0.5px",
          zIndex: 1,
        }}
      />

      {/* Ponto na linha da timeline */}
      <div
        className={`absolute left-0 top-4 w-3 h-3 rounded-full border-2 z-10 ${
          event.isCompleted
            ? event.activityStatus === "LOSS"
              ? "bg-red-500 border-red-600"
              : "bg-green-500 border-green-600"
            : theme === "dark"
              ? "bg-gray-500 border-gray-500"
              : "bg-gray-400 border-gray-400"
        }`}
        style={{ left: "18px", marginLeft: "-6px" }}
      />

      {/* Card de nota */}
      <div
        className={`rounded-lg border overflow-hidden ${
          theme === "dark"
            ? "border-gray-700 bg-gray-800"
            : "border-gray-200 bg-white shadow-sm"
        }`}
      >
        {/* Header do card */}
        <div
          className={`px-4 py-3 border-b ${
            theme === "dark"
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              {/* Ícone */}
              {event.isCompleted ? (
                <div className="flex-shrink-0 mt-0.5 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="h-4 w-4 text-white" strokeWidth={3} />
                </div>
              ) : (
                <div className={`flex-shrink-0 mt-0.5 ${getEventIconColor()}`}>
                  <Bell className="h-4 w-4" />
                </div>
              )}

              {/* Título e informações */}
              <div className="flex-1 min-w-0">
                <div
                  className={`font-semibold text-sm ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}
                >
                  {event.title}
                </div>
                <div
                  className={`text-xs mt-1 flex items-center gap-2 flex-wrap ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                >
                  <span>{formatDateShort(event.date)}</span>
                  {event.user && (
                    <>
                      <span>·</span>
                      <span>{event.user}</span>
                    </>
                  )}
                  {assignedByUser && (
                    <>
                      <span>·</span>
                      <div className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        <span>
                          Oficial -{" "}
                          {assignedByUser.name || assignedByUser.email}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Menu de opções */}
            {event.activityType &&
              (isAdmin ||
                (event.assignedTo && userId === event.assignedTo)) && (
                <div className="flex-shrink-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-7 w-7 p-0 ${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
                      >
                        <MoreVertical
                          className={`h-4 w-4 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                        />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className={
                        theme === "dark" ? "bg-gray-800 border-gray-700" : ""
                      }
                    >
                      {!event.isCompleted && (
                        <DropdownMenuItem
                          onClick={() =>
                            onOpenCompleteDialog(
                              event.activityType!,
                              event.notes || "",
                            )
                          }
                          className={
                            theme === "dark"
                              ? "text-gray-200 hover:bg-gray-700"
                              : ""
                          }
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Marcar como concluída
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() =>
                          onOpenEditNotesDialog(
                            event.activityType!,
                            event.notes || "",
                            event.assignedTo || "",
                          )
                        }
                        className={
                          theme === "dark"
                            ? "text-gray-200 hover:bg-gray-700"
                            : ""
                        }
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        {event.notes ? "Editar Nota" : "Adicionar Nota"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
          </div>
        </div>

        {/* Conteúdo do card */}
        <div
          className={`px-4 py-3 ${theme === "dark" ? "bg-gray-800/50" : "bg-yellow-50"}`}
        >
          {/* Notas */}
          {event.notes && (
            <div
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(event.notes),
              }}
              className={`text-sm ${
                theme === "dark" ? "text-gray-300" : "text-gray-900"
              }`}
              style={{
                lineHeight: "1.6",
                whiteSpace: "pre-wrap",
              }}
            />
          )}

          {/* Motivo de rejeição */}
          {event.activityStatus === "LOSS" && event.lossReason && (
            <div
              className={`mt-2 pt-2 border-t ${
                theme === "dark" ? "border-red-800" : "border-red-200"
              }`}
            >
              <div
                className={`font-semibold text-sm ${theme === "dark" ? "text-red-300" : "text-red-700"}`}
              >
                Motivo: {event.lossReason}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
