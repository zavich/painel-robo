import { useCallback } from "react";

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : undefined;
}

function extractKey(url: string): string {
  try {
    if (url.startsWith("http")) {
      const parts = url.split("/");
      return parts[parts.length - 1];
    }
    return url;
  } catch {
    return url;
  }
}

export function useFetchPDF() {
  const fetchPDF = useCallback(async (pdfUrl: string): Promise<Blob | null> => {
    try {
      const urlApi = `${process.env.NEXT_PUBLIC_API_URL}/process/documents/${pdfUrl}`;
      const response = await fetch(urlApi, {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Erro ao buscar PDF");
      return await response.blob();
    } catch {
      return null;
    }
  }, []);

  return { fetchPDF };
}
