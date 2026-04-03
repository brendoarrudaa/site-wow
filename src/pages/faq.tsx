import { useState } from "react";
import Layout from "@/components/Layout/Layout";
import SEO from "@/components/SEO";
import PageHeader from "@/components/PageHeader";
import CTASection from "@/components/CTASection";
import { faqItems } from "@/data/faq";
import { ChevronDown } from "lucide-react";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <Layout>
      <SEO
        title="FAQ — Perguntas Frequentes"
        description="Respostas para as dúvidas mais comuns sobre o Realm of Shadows: como conectar, qual cliente usar, rates, addons, anti-cheat e mais."
        path="/faq"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <PageHeader
        title="Perguntas Frequentes"
        subtitle="Respostas rápidas para as dúvidas mais comuns sobre o servidor."
      />

      <section className="page-section">
        <div className="page-container max-w-3xl space-y-3">
          {faqItems.map((item, i) => (
            <div key={i} className="card-fantasy overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
              >
                <h3 className="font-medium text-foreground text-sm">{item.question}</h3>
                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openIndex === i && (
                <div className="px-6 pb-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <CTASection />
    </Layout>
  );
};

export default FAQ;
