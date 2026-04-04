import { Prompt } from "@/app/interfaces/processes";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export function useEditPrompt() {
  const editPrompt = async (prompt: Prompt) => {
    // O backend espera { type, text }
    const res = await fetch(`${API_URL}/prompts/${prompt._id}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "",
      },
      body: JSON.stringify({ type: prompt.type, text: prompt.content }),
    });
    if (!res.ok) throw new Error("Erro ao editar prompt");
    return await res.json();
  };
  return { editPrompt };
}
