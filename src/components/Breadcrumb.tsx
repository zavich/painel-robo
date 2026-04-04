import Link from "next/link";
import { ChevronRight } from "lucide-react";
import React, { forwardRef, useState, useEffect } from "react";
import { useTheme } from "@/app/hooks/use-theme-client";

interface BreadcrumbProps {
  items: { label: string; href?: string; icon?: React.ReactNode }[];
  onItemClick?: (item: {
    label: string;
    href?: string;
    icon?: React.ReactNode;
  }) => void;
}

export const Breadcrumb = forwardRef<
  HTMLElement,
  BreadcrumbProps & { fixed?: boolean }
>(({ items, onItemClick }, ref) => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Evitar problemas de hidratação
  if (!mounted) {
    return (
      <nav
        ref={ref}
        className="w-full"
      >
        <ol className="flex items-center gap-1 text-sm py-4">
          {items.map((item, idx) => (
            <li key={item.label} className="flex items-center gap-1">
              <div className="h-8 w-24 bg-gray-100 rounded-lg animate-pulse"></div>
              {idx < items.length - 1 && (
                <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
              )}
            </li>
          ))}
        </ol>
      </nav>
    );
  }
  
  return (
    <nav
      ref={ref}
      className="w-full"
    >
      <ol className="flex flex-wrap items-center gap-1 text-xs sm:text-sm py-2 sm:py-3">
        {items.map((item, idx) => (
          <li key={item.label} className="flex items-center gap-1">
            {item.href ? (
              <Link
                href={item.href}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-colors duration-150 group ${
                  theme === "dark"
                    ? "text-blue-400 hover:bg-gray-800 hover:text-blue-300"
                    : "text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                }`}
                onClick={() => onItemClick?.(item)}
              >
                {item.icon && (
                  <span className="group-hover:scale-105 transition-transform duration-150">
                    {item.icon}
                  </span>
                )}
                <span className="truncate max-w-[140px]">{item.label}</span>
              </Link>
            ) : (
              <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold ${
                theme === "dark"
                  ? "text-gray-200 bg-gray-800/80"
                  : "text-gray-600 bg-gray-50"
              }`}>
                {item.icon && (
                  <span className={theme === "dark" ? "text-gray-400" : "text-gray-500"}>
                    {item.icon}
                  </span>
                )}
                <span className="truncate max-w-[160px]">{item.label}</span>
              </span>
            )}
            {idx < items.length - 1 && (
              <ChevronRight className={`h-4 w-4 mx-1 ${
                theme === "dark" ? "text-gray-500" : "text-gray-400"
              }`} />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
});

Breadcrumb.displayName = "Breadcrumb";
