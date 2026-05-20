import { useState } from "react";
import api from "../..";

export function useInsertExecution() {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	async function insertExecution(processId: string, lawsuitExecution: string, pipedriveFieldValue?: string) {
		setIsLoading(true);
		setError(null);
		setSuccess(false);
		try {
			const payload: { lawsuitExecution: string; pipedriveFieldValue?: string } = { lawsuitExecution };
			if (pipedriveFieldValue) {
				payload.pipedriveFieldValue = pipedriveFieldValue;
			}

			await api.post(
				`/process/${processId}/insert-execution`,
				payload,
				{
					headers: {
						"Content-Type": "application/json",
					},
				}
			);
			setSuccess(true);
		} catch (err: unknown) {
			const axiosError = err as { response?: { data?: { message?: string } }; message?: string };
			setError(axiosError?.response?.data?.message || axiosError?.message || "Erro desconhecido");
		} finally {
			setIsLoading(false);
		}
	}

	return { insertExecution, isLoading, error, success };
}
