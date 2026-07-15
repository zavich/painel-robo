export function sectionCardClass(theme: string) {
  return `rounded-2xl shadow-lg p-6 border ${
    theme === "dark"
      ? "bg-gray-800 border-gray-700"
      : "bg-white border-gray-200"
  }`;
}

export function sectionIconClass() {
  return "w-8 h-8 bg-gradient-to-br from-secondary to-accent rounded-lg flex items-center justify-center shadow-sm shrink-0";
}

export function sectionTitleClass(theme: string) {
  return `text-lg font-semibold ${
    theme === "dark" ? "text-white" : "text-gray-900"
  }`;
}

export function labelClass(theme: string) {
  return `block text-sm font-semibold ${
    theme === "dark" ? "text-gray-100" : "text-gray-900"
  }`;
}

export function inputClass(theme: string) {
  return `w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed ${
    theme === "dark"
      ? "border-gray-600 focus:ring-primary bg-gray-700 text-gray-100 placeholder-gray-400"
      : "border-gray-200 focus:ring-primary bg-white placeholder-gray-400"
  }`;
}

export function primaryButtonClass() {
  return "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-secondary to-accent text-white hover:from-secondary hover:to-accent font-medium transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl";
}

export function secondaryButtonClass(theme: string) {
  return `inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 border ${
    theme === "dark"
      ? "bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600"
      : "bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200"
  }`;
}

export function iconButtonClass(
  theme: string,
  variant: "default" | "destructive" | "accent" = "default",
) {
  if (variant === "destructive") {
    return `p-2 rounded-lg transition-colors disabled:opacity-40 disabled:pointer-events-none ${
      theme === "dark"
        ? "text-red-400 hover:text-red-300 hover:bg-red-900/30"
        : "text-red-500 hover:text-red-600 hover:bg-red-50"
    }`;
  }
  if (variant === "accent") {
    return `p-2 rounded-lg transition-colors disabled:opacity-40 disabled:pointer-events-none ${
      theme === "dark"
        ? "text-secondary-foreground hover:text-secondary hover:bg-secondary/10"
        : "text-secondary hover:text-secondary-foreground hover:bg-secondary/10"
    }`;
  }
  return `p-2 rounded-lg transition-colors disabled:opacity-40 disabled:pointer-events-none ${
    theme === "dark"
      ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700"
      : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
  }`;
}

export function cardItemClass(theme: string) {
  return `rounded-2xl shadow-sm border p-4 transition-all duration-200 ${
    theme === "dark"
      ? "bg-gray-800 border-gray-700 hover:bg-gray-700/40"
      : "bg-white border-gray-200 hover:bg-gray-50"
  }`;
}

export function pillClass(theme: string) {
  return `inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold border ${
    theme === "dark"
      ? "bg-gray-700 text-gray-300 border-gray-600"
      : "bg-gray-100 text-gray-700 border-gray-200"
  }`;
}

export function mutedTextClass(theme: string) {
  return theme === "dark" ? "text-gray-400" : "text-gray-600";
}

export function dialogContentClass(theme: string) {
  return `max-w-lg rounded-2xl shadow-2xl ${
    theme === "dark"
      ? "bg-gray-800 border-gray-700"
      : "bg-white border-gray-200"
  }`;
}

export function checkboxClass() {
  return "h-4 w-4 rounded accent-secondary cursor-pointer";
}
