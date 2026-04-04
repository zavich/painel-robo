import { useEffect, useState } from "react";
import { AppHeader, AppHeaderView } from "@/components/layout/AppHeader";

export type ViewType = "processes" | "companies" | "prompts" | "reason-loss";

interface KanbanHeaderProps {
	view?: ViewType;
	setView?: (view: ViewType) => void;
	returnTo?: string;
}

export function KanbanHeader({ view, setView, returnTo }: KanbanHeaderProps) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

    const navigateToView = (newView: ViewType) => setView?.(newView);

    const breadcrumbItems = [
        { label: "Dashboard", href: "/dashboard" },
        { label: view === "companies" ? "Empresas" : view === "prompts" ? "Prompts" : view === "reason-loss" ? "Motivos de Recusa" : "" },
    ];

    return (
        <AppHeader
            view={view as AppHeaderView}
            onChangeView={(v) => navigateToView(v as ViewType)}
            breadcrumbItems={view !== "processes" ? breadcrumbItems : []}
            returnTo={returnTo}
        />
    );
}