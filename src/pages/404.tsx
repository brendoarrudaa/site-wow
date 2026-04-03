import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/router";
import SEO from "@/components/SEO";

const NotFound = () => {
  const router = useRouter();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", router.asPath);
  }, [router.asPath]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <SEO title="Página não encontrada" noindex />
      <div className="text-center px-4">
        <p className="text-sm font-medium text-primary tracking-widest uppercase mb-4">Erro 404</p>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">Página não encontrada</h1>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          A página que você está procurando não existe ou foi movida.
        </p>
        <Link href="/" className="text-primary font-medium hover:underline underline-offset-4">
          Voltar para a Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
