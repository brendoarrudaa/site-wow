import Layout from "@/components/Layout/Layout";
import SEO from "@/components/SEO";
import PageHeader from "@/components/PageHeader";
import SuggestionForm from "@/components/forms/SuggestionForm";

const Suggestions = () => {
  return (
    <Layout>
      <SEO
        title="Sugestões"
        description="Envie sua sugestão para o Azeroth Legacy. Ideias de gameplay, qualidade de vida, eventos e melhorias são bem-vindas."
        path="/sugestoes"
      />
      <PageHeader
        title="Sugestões"
        subtitle="Sua opinião importa. Envie ideias para melhorar o servidor."
      />
      <section className="page-section">
        <div className="page-container max-w-2xl">
          <SuggestionForm />
        </div>
      </section>
    </Layout>
  );
};

export default Suggestions;
