"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export function MaintenanceBanner() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const isMaintenancePage = pathname === "/maintenance";

  useEffect(() => {
    // Verifica a variável de ambiente no cliente
    const maintenanceMode = 
      process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true" ||
      process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "1";
    
    setIsMaintenanceMode(maintenanceMode);

    if (maintenanceMode && !isMaintenancePage) {
      router.push("/maintenance");
    } else if (!maintenanceMode && isMaintenancePage) {
      router.push("/login");
    }
  }, [isMaintenancePage, router]);

  return null;
}

