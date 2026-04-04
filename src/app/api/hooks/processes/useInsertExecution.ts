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
			const payload: any = { lawsuitExecution };
			if (pipedriveFieldValue) {
				payload.pipedriveFieldValue = pipedriveFieldValue;
			}

			await api.post(
				`/process/${processId}/insert-execution`,
				payload,
				{
					headers: {
						Authorization: "zUqttTlQ4j0Ob0odbmDDQ96bjKgz6Z",
						"Content-Type": "application/json",
					},
				}
			);
			setSuccess(true);
		} catch (err: any) {
			setError(err?.response?.data?.message || err.message || "Erro desconhecido");
		} finally {
			setIsLoading(false);
		}
	}

	return { insertExecution, isLoading, error, success };
}
