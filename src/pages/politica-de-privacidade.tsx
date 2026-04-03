import Layout from '@/components/Layout/Layout'
import SEO from '@/components/SEO'
import PageHeader from '@/components/PageHeader'
import { siteConfig } from '@/data/site-config'

const sections = [
  {
    title: '1. Informações que coletamos',
    content: `Ao utilizar o ${siteConfig.name}, podemos coletar as seguintes informações:
    nome de personagem, endereço de e-mail (quando fornecido voluntariamente), endereço IP para fins de segurança e moderação, dados de jogo como logs de atividade, trades e chat.
    Não coletamos dados financeiros. O servidor é gratuito e não realiza transações monetárias obrigatórias.`
  },
  {
    title: '2. Como usamos suas informações',
    content: `As informações coletadas são utilizadas exclusivamente para:
    operar e manter o servidor de jogo, garantir a segurança e integridade do ambiente, investigar infrações às regras e aplicar punições quando necessário, melhorar a experiência de jogo com base em dados de uso agregados.
    Nunca vendemos, alugamos ou compartilhamos seus dados com terceiros para fins comerciais.`
  },
  {
    title: '3. Cookies e armazenamento local',
    content: `Este site pode utilizar cookies para manter sessões de autenticação e preferências de navegação. Você pode desativar cookies no seu navegador, mas isso pode afetar o funcionamento de algumas funcionalidades do site.`
  },
  {
    title: '4. Segurança dos dados',
    content: `Adotamos medidas técnicas razoáveis para proteger suas informações contra acesso não autorizado. No entanto, nenhum sistema é 100% seguro. Recomendamos que você utilize senhas únicas e não compartilhe suas credenciais com ninguém.`
  },
  {
    title: '5. Retenção de dados',
    content: `Dados de conta são mantidos enquanto a conta estiver ativa. Contas inativas por mais de 12 meses podem ser removidas do banco de dados. Logs de segurança podem ser mantidos por até 6 meses para fins de moderação.`
  },
  {
    title: '6. Seus direitos',
    content: `Você tem o direito de solicitar acesso, correção ou exclusão dos seus dados pessoais a qualquer momento. Para exercer esses direitos, entre em contato pelo e-mail ${siteConfig.contactEmail} ou pelo nosso servidor do Discord.`
  },
  {
    title: '7. Menores de idade',
    content: `O ${siteConfig.name} não é direcionado a menores de 13 anos. Caso identifiquemos que coletamos dados de uma criança sem consentimento dos responsáveis, removeremos essas informações imediatamente.`
  },
  {
    title: '8. Alterações nesta política',
    content: `Esta política pode ser atualizada periodicamente. Alterações relevantes serão comunicadas pelo Discord. O uso contínuo do servidor após as alterações implica aceitação da nova política.`
  },
  {
    title: '9. Contato',
    content: `Dúvidas sobre esta política de privacidade podem ser enviadas para ${siteConfig.contactEmail} ou diretamente pelo nosso Discord.`
  }
]

const PrivacyPolicy = () => {
  return (
    <Layout>
      <SEO
        title="Política de Privacidade"
        description={`Saiba como o ${siteConfig.name} coleta, usa e protege suas informações.`}
        path="/politica-de-privacidade"
      />
      <PageHeader
        title="Política de Privacidade"
        subtitle={`Como o ${siteConfig.name} trata suas informações. Última atualização: abril de 2026.`}
      />

      <section className="page-section">
        <div className="page-container max-w-3xl">
          <div className="card-fantasy p-6 md:p-10 space-y-8">
            <p className="text-muted-foreground">
              Ao acessar o site ou jogar no servidor{' '}
              <strong className="text-foreground">{siteConfig.name}</strong>,
              você concorda com os termos desta Política de Privacidade. Leia
              com atenção.
            </p>

            {sections.map(section => (
              <div key={section.title}>
                <h2 className="text-lg font-serif font-bold text-foreground mb-2">
                  {section.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {section.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  )
}

export default PrivacyPolicy
