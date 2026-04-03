import Layout from "@/components/Layout/Layout";
import SEO from "@/components/SEO";
import PageHeader from "@/components/PageHeader";
import ServerStatusSection from "@/components/ServerStatusSection";

const Status = () => {
  return (
    <Layout>
      <SEO
        title="Status do Servidor"
        description="Verifique se o Realm of Shadows está online, quantos jogadores estão conectados e o uptime atual do servidor."
        path="/status"
      />
      <PageHeader
        title="Status do Servidor"
        subtitle="Acompanhe em tempo real se o servidor está online e a população atual."
      />
      <ServerStatusSection />
      <section className="pb-16">
        <div className="page-container max-w-2xl text-center">
          <p className="text-sm text-muted-foreground">
            Os dados de status serão atualizados automaticamente quando a API do servidor for integrada.
            No momento, os valores exibidos são ilustrativos.
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default Status;
