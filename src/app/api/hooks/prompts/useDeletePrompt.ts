import { Prompt } from "@/app/interfaces/processes";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export function useDeletePrompt() {
  const deletePrompt = async (id: string) => {
    const res = await fetch(`${API_URL}/prompts/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "",
      },
    });
    if (!res.ok) throw new Error("Erro ao deletar prompt");
    return await res.json();
  };
  return { deletePrompt };
}
