import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

const PageHeader = ({ title, subtitle, children }: PageHeaderProps) => {
  return (
    <div className="relative border-b border-border/30 overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-card/80 via-card/40 to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-48 bg-primary/3 rounded-full blur-3xl pointer-events-none" />
      <div className="relative page-container py-14 md:py-20">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground glow-text leading-tight">{title}</h1>
        {subtitle && (
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl leading-relaxed">{subtitle}</p>
        )}
        {children}
      </div>
    </div>
  );
};

export default PageHeader;
