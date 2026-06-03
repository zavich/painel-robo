"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { logger } from "@/app/lib/logger";

export function MaintenanceBanner() {
  const router = useRouter();
  const pathname = usePathname();
  const isMaintenancePage = pathname === "/maintenance";

  useEffect(() => {
    let isMounted = true;

    const syncMaintenanceMode = async () => {
      try {
        const response = await fetch("/api/maintenance-status", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = (await response.json()) as { maintenanceMode: boolean };

        if (!isMounted) {
          return;
        }

        if (data.maintenanceMode && !isMaintenancePage) {
          router.push("/maintenance");
        } else if (!data.maintenanceMode && isMaintenancePage) {
          router.push("/login");
        }
      } catch (error) {
        logger.warn("Falha ao sincronizar maintenance mode:", error as object);
      }
    };

    void syncMaintenanceMode();

    return () => {
      isMounted = false;
    };
  }, [isMaintenancePage, router]);

  return null;
}
