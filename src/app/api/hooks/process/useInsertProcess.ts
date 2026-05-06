import { useCallback } from "react";

type FetchBy =
  | { type: "upload"; file: File }
  | { type: "number"; value: string[] };

export function useProcessFetch() {
  const fetchData = useCallback(async (input: FetchBy) => {
    const urlApi = `${process.env.NEXT_PUBLIC_API_URL}`;
    try {
      // 🔢 Buscar por número do processo
      if (input.type === "number") {
        const response = await fetch(`${urlApi}/process`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            processes: input.value,
          }),
        });

        if (!response.ok) throw new Error("Erro ao buscar processos");

        const data = await response.json();
        return { type: "number", data };
      }

      // 📁 Upload de arquivo (XML/XLSX)
      if (input.type === "upload") {
        const formData = new FormData();
        formData.append("file", input.file);

        const response = await fetch(`${urlApi}/process/upload-xml`, {
          method: "POST",
          body: formData,
          credentials: "include",
        });

        if (!response.ok) throw new Error("Erro ao enviar arquivo");

        const data = await response.json();
        return { type: "upload", data };
      }
    } catch (error) {
      console.error(error);
      return null;
    }
  }, []);

  return { fetchData };
}
