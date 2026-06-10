import { ActivityType } from "@/app/api/hooks/process/useCreateActivity";
import { StageProcess } from "@/app/interfaces/processes";

export interface TimelineEvent {
  id: string;
  type: "activity" | "decision" | "stage_change";
  date: string;
  title: string;
  user?: string;
  notes?: string;
  isCompleted?: boolean;
  activityType?: ActivityType;
  activityId?: string;
  assignedTo?: string;
  activityStatus?: "APPROVE" | "LOSS";
  lossReason?: string;
  stage?: StageProcess;
  status?: "APPROVED" | "REJECTED";
  rejectionReason?: string;
  rejectionDescription?: string;
}
