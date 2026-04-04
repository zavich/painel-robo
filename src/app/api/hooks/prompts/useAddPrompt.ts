import { Prompt } from "@/app/interfaces/processes";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export function useAddPrompt() {
  const addPrompt = async (prompt: Omit<Prompt, "_id">) => {
    // O backend espera { type, text }
    const res = await fetch(`${API_URL}/prompts`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "",
      },
      body: JSON.stringify({ type: prompt.type, text: prompt.content }),
    });
    if (!res.ok) throw new Error("Erro ao criar prompt");
    return await res.json();
  };
  return { addPrompt };
}
