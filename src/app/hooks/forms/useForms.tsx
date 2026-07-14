"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { FormDefinition } from "@/app/interfaces/forms";

const STORAGE_KEY = "prosolutti:forms";

interface FormsContextType {
  forms: FormDefinition[];
  isReady: boolean;
  createForm: (form: FormDefinition) => void;
  updateForm: (id: string, form: FormDefinition) => void;
  deleteForm: (id: string) => void;
}

const FormsContext = createContext<FormsContextType | undefined>(undefined);

function readFormsFromStorage(): FormDefinition[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as FormDefinition[]) : [];
  } catch {
    return [];
  }
}

function writeFormsToStorage(forms: FormDefinition[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(forms));
  } catch {
    // ignora erros de quota/serialização — os dados continuam em memória
  }
}

export const FormsProvider = ({ children }: { children: ReactNode }) => {
  const [forms, setForms] = useState<FormDefinition[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Lido apenas no cliente (após o mount) para não gerar mismatch de hidratação
  // com o HTML renderizado no servidor.
  useEffect(() => {
    setForms(readFormsFromStorage());
    setHydrated(true);
  }, []);

  // Persiste no localStorage — necessário para o fluxo de preenchimento, que
  // abre em uma nova janela (contexto de React isolado, sem acesso a este
  // Context em memória). Continua sendo apenas armazenamento local do
  // navegador, sem nenhuma chamada de API.
  useEffect(() => {
    if (!hydrated) return;
    writeFormsToStorage(forms);
  }, [forms, hydrated]);

  // Mantém sincronizado caso outra aba/janela altere os formulários enquanto
  // esta estiver aberta.
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      setForms(readFormsFromStorage());
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // TODO: quando a API estiver disponível, substituir a implementação
  // interna destas funções por chamadas HTTP mantendo a mesma assinatura.
  const createForm = useCallback((form: FormDefinition) => {
    setForms((prev) => [...prev, form]);
  }, []);

  const updateForm = useCallback((id: string, form: FormDefinition) => {
    setForms((prev) => prev.map((item) => (item.id === id ? form : item)));
  }, []);

  const deleteForm = useCallback((id: string) => {
    setForms((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return (
    <FormsContext.Provider value={{ forms, isReady: hydrated, createForm, updateForm, deleteForm }}>
      {children}
    </FormsContext.Provider>
  );
};

export const useForms = () => {
  const context = useContext(FormsContext);
  if (!context) {
    throw new Error("useForms must be used within a FormsProvider");
  }
  return context;
};
