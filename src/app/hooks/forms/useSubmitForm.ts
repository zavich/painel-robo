import { useMutation } from "@tanstack/react-query";
import api from "@/app/api/juriApi";
import { FormSubmissionAnswer } from "@/app/interfaces/forms";

interface SubmitFormInput {
  formId: string;
  answers: FormSubmissionAnswer[];
}

async function submitForm({ formId, answers }: SubmitFormInput) {
  const { data } = await api.post(`/forms/${formId}/submissions`, {
    answers,
  });
  return data;
}

export function useSubmitForm() {
  const mutation = useMutation({ mutationFn: submitForm });
  return { submitForm: mutation.mutateAsync, isSubmitting: mutation.isPending };
}
