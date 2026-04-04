import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, DollarSign, User } from "lucide-react";
import { Process, Situation } from "@/app/interfaces/processes";
import { useTheme } from "@/app/hooks/use-theme-client";

interface ProcessCardProps {
  processo: Process;
}

const getStatusColor = (status: Situation | undefined) => {
  switch (status) {
    case Situation.APPROVED:
      return 'bg-success text-success-foreground';
    case Situation.LOSS:
      return 'bg-destructive text-destructive-foreground';
    case Situation.PENDING:
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const getStatusLabel = (status: Situation | undefined) => {
  switch (status) {
    case Situation.PENDING:
      return 'Pendente';
    case Situation.APPROVED:
      return 'Aprovado';
    case Situation.LOSS:
      return 'Recusado';
    default:
      return '-';
  }
};

export const ProcessCard = ({ processo }: ProcessCardProps) => {
  const { theme } = useTheme();
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200 cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className={`font-semibold text-lg ${
              theme === "dark" ? "text-gray-100" : "text-card-foreground"
            }`}>
              {processo.number}
            </h3>
            <p className={`text-sm ${
              theme === "dark" ? "text-gray-400" : "text-muted-foreground"
            }`}>{processo.class}</p>
          </div>
          <Badge className={getStatusColor(processo.situation)}>
            {getStatusLabel(processo.situation)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <User className={`h-4 w-4 ${theme === "dark" ? "text-gray-400" : "text-muted-foreground"}`} />
            <span className={theme === "dark" ? "text-gray-400" : "text-muted-foreground"}>Reclamante:</span>
            {/* <span className="font-medium">{processo.dadosReclamante.nome}</span> */}
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className={`h-4 w-4 ${theme === "dark" ? "text-gray-400" : "text-muted-foreground"}`} />
            <span className={theme === "dark" ? "text-gray-400" : "text-muted-foreground"}>Valor:</span>
            {/* <span className="font-medium">{formatCurrency(processo.valorCausa)}</span> */}
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Calendar className={`h-4 w-4 ${theme === "dark" ? "text-gray-400" : "text-muted-foreground"}`} />
            <span className={theme === "dark" ? "text-gray-400" : "text-muted-foreground"}>Distribuição:</span>
            {/* <span className="font-medium">{formatDate(processo.dataDistribuicao)}</span> */}
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <FileText className={`h-4 w-4 ${theme === "dark" ? "text-gray-400" : "text-muted-foreground"}`} />
            <span className={theme === "dark" ? "text-gray-400" : "text-muted-foreground"}>Documentos:</span>
            {/* <span className="font-medium">{processo.documentos.length}</span> */}
          </div>
        </div>
        
        <div className="pt-2">
          <p className={`text-sm mb-2 ${
            theme === "dark" ? "text-gray-400" : "text-muted-foreground"
          }`}>
            {/* <strong>Reclamada:</strong> {processo.reclamada} */}
          </p>
          
          <Button 
            variant="outline" 
            size="sm"
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              // navigate(`/processo/${processo.id}`);
            }}
          >
            Analisar Processo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};