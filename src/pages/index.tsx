import Layout from "@/components/Layout/Layout";
import SEO from "@/components/SEO";
import HeroSection from "@/components/HeroSection";
import RatesSection from "@/components/RatesSection";
import FeaturesSection from "@/components/FeaturesSection";
import ServerStatusSection from "@/components/ServerStatusSection";
import LatestNewsSection from "@/components/LatestNewsSection";
import DiscordSection from "@/components/DiscordSection";
import VIPPreviewSection from "@/components/VIPPreviewSection";
import CTASection from "@/components/CTASection";

const Index = () => {
  return (
    <Layout>
      <SEO
        description="Servidor brasileiro de WotLK 3.3.5a com scripts Blizzlike, rates equilibradas, anti-cheat ativo e comunidade dedicada. Gratuito e sem pay-to-win."
        path="/"
      />
      <HeroSection />
      <RatesSection />
      <FeaturesSection />
      <ServerStatusSection />
      <LatestNewsSection />
      <VIPPreviewSection />
      <DiscordSection />
      <CTASection />
    </Layout>
  );
};

export default Index;
