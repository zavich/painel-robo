export interface User {
  id: number;
  numero: string;
  reclamante: string;
  reclamada: string;
  status: "active" | "inactive" | "pending";
  joinDate: string;
  motivoRecusa: string;
  situacao: string;
}

export const mockUsers: User[] = [
  {
    id: 1,
    numero: "1002168-04.2024.5.02.0432",
    reclamante: "Ana Silva",
    reclamada: "TechCorp",
    status: "active",
    joinDate: "15/03/2023",
    motivoRecusa: "Nenhum",
    situacao: "Em andamento",
  },
  {
    id: 2,
    numero: "1002168-04.2024.5.02.0432",
    reclamante: "Carlos Santos",
    reclamada: "InnovaLab",
    status: "inactive",
    joinDate: "22/01/2023",
    motivoRecusa: "Documentação incompleta",
    situacao: "Pendente",
  },
  {
    id: 3,
    numero: "1002168-04.2024.5.02.0432",
    reclamante: "Maria Oliveira",
    reclamada: "Design Studio",
    status: "pending",
    joinDate: "08/11/2023",
    motivoRecusa: "Aguardando documentação",
    situacao: "Pendente",
  },
  {
    id: 4,
    numero: "1002168-04.2024.5.02.0432",
    reclamante: "João Pereira",
    reclamada: "CloudSoft",
    status: "active",
    joinDate: "30/05/2023",
    motivoRecusa: "Nenhum",
    situacao: "Em andamento",
  },
  {
    id: 5,
    numero: "1002168-04.2024.5.02.0432",
    reclamante: "Fernanda Costa",
    reclamada: "Digital Agency",
    status: "inactive",
    joinDate: "12/09/2022",
    motivoRecusa: "Nenhum",
    situacao: "Inativo",
  },
];
