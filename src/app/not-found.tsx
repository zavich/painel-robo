import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md mx-auto p-8 rounded-lg shadow-lg bg-card border border-border">
        <h1 className="text-5xl font-extrabold text-primary mb-4">404</h1>
        <p className="text-lg text-muted-foreground mb-6">
          Ops! Página não encontrada.
          <br />
          Verifique o endereço ou retorne para o início.
        </p>
        <Link href="/" passHref>
          <Button variant="default" size="lg">
            Voltar para o Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}