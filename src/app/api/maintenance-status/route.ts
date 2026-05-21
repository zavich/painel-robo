import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function isMaintenanceModeEnabled() {
  return (
    process.env.MAINTENANCE_MODE === "true" ||
    process.env.MAINTENANCE_MODE === "1" ||
    process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true" ||
    process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "1"
  );
}

export async function GET() {
  return NextResponse.json(
    { maintenanceMode: isMaintenanceModeEnabled() },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    },
  );
}
