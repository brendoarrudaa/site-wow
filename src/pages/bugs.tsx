import Layout from "@/components/Layout/Layout";
import SEO from "@/components/SEO";
import PageHeader from "@/components/PageHeader";
import BugReportForm from "@/components/forms/BugReportForm";

const Bugs = () => {
  return (
    <Layout>
      <SEO
        title="Reportar Bug"
        description="Encontrou um bug no Azeroth Legacy? Reporte aqui com detalhes para que a equipe possa corrigir rapidamente."
        path="/bugs"
      />
      <PageHeader
        title="Reportar Bug"
        subtitle="Encontrou um problema? Ajude-nos a corrigir reportando aqui."
      />
      <section className="page-section">
        <div className="page-container max-w-2xl">
          <BugReportForm />
        </div>
      </section>
    </Layout>
  );
};

export default Bugs;
