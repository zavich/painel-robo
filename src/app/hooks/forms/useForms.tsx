"use client";

import { createContext, ReactNode, useContext, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/app/api/juriApi";
import { FormDefinition, FormField } from "@/app/interfaces/forms";

const FORMS_QUERY_KEY = ["forms"];

export interface FormInput {
  name: string;
  fields: FormField[];
}

interface FormsContextType {
  forms: FormDefinition[];
  isReady: boolean;
  createForm: (form: FormInput) => Promise<FormDefinition>;
  updateForm: (id: string, form: FormInput) => Promise<FormDefinition>;
  deleteForm: (id: string) => Promise<void>;
}

const FormsContext = createContext<FormsContextType | undefined>(undefined);

async function fetchForms(): Promise<FormDefinition[]> {
  const { data } = await api.get<FormDefinition[]>("/forms");
  return data;
}

export const FormsProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();

  const { data: forms = [], isLoading } = useQuery({
    queryKey: FORMS_QUERY_KEY,
    queryFn: fetchForms,
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
  });

  const createMutation = useMutation({
    mutationFn: async (form: FormInput) => {
      const { data } = await api.post<FormDefinition>("/forms", form);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FORMS_QUERY_KEY });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, form }: { id: string; form: FormInput }) => {
      const { data } = await api.patch<FormDefinition>(`/forms/${id}`, form);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FORMS_QUERY_KEY });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/forms/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FORMS_QUERY_KEY });
    },
  });

  const value = useMemo<FormsContextType>(
    () => ({
      forms,
      isReady: !isLoading,
      createForm: (form) => createMutation.mutateAsync(form),
      updateForm: (id, form) => updateMutation.mutateAsync({ id, form }),
      deleteForm: (id) => deleteMutation.mutateAsync(id),
    }),
    [forms, isLoading, createMutation, updateMutation, deleteMutation],
  );

  return (
    <FormsContext.Provider value={value}>{children}</FormsContext.Provider>
  );
};

export const useForms = () => {
  const context = useContext(FormsContext);
  if (!context) {
    throw new Error("useForms must be used within a FormsProvider");
  }
  return context;
};
