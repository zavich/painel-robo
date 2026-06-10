"use client";

import { Label } from "@/components/ui/label";
import { ReactNode } from "react";

type ProcessMetadataFieldProps = {
  children: ReactNode;
  label: ReactNode;
};

export function ProcessMetadataField({
  children,
  label,
}: ProcessMetadataFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
        {label}
      </Label>
      <div className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        {children}
      </div>
    </div>
  );
}
