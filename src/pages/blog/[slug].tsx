import Link from "next/link";
import { useRouter } from "next/router";
import Layout from "@/components/Layout/Layout";
import SEO from "@/components/SEO";
import { getPostBySlug, blogPosts } from "@/data/blog-posts";
import { Calendar, ArrowLeft } from "lucide-react";
import CTASection from "@/components/CTASection";

const BlogPostPage = () => {
  const router = useRouter();
  const { slug } = router.query;
  const post = typeof slug === "string" ? getPostBySlug(slug) : undefined;

  if (!post) {
    return (
      <Layout>
        <SEO title="Post não encontrado" noindex />
        <div className="page-container py-24 text-center">
          <h1 className="text-2xl font-serif font-bold text-foreground mb-4">Post não encontrado</h1>
          <Link href="/blog" className="btn btn-outline border-gold text-gold hover:bg-gold hover:text-black hover:border-gold">
            Voltar ao Blog
          </Link>
        </div>
      </Layout>
    );
  }

  const recommended = post.recommended
    ?.map((s) => blogPosts.find((p) => p.slug === s))
    .filter(Boolean);

  return (
    <Layout>
      <SEO
        title={post.title}
        description={post.excerpt}
        path={`/blog/${post.slug}`}
        type="article"
        article={{
          publishedTime: post.date,
          section: post.category,
        }}
      />
      <article>
        <div className="border-b border-border/50 bg-card/30">
          <div className="page-container py-8">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Blog
            </Link>

            <div className={`h-48 md:h-64 rounded-xl bg-linear-to-br ${post.coverColor} mb-6 flex items-center justify-center`}>
              <span className="text-sm uppercase tracking-widest text-muted-foreground font-medium">
                {post.category}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-foreground glow-text">{post.title}</h1>
            <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString("pt-BR", { year: "numeric", month: "long", day: "numeric" })}
              </time>
              <span className="mx-2">•</span>
              <span className="text-primary">{post.category}</span>
            </div>
          </div>
        </div>

        <div className="page-section">
          <div className="page-container max-w-3xl">
            <div
              className="prose-fantasy"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
        </div>

        {recommended && recommended.length > 0 && (
          <section className="page-section bg-card/30">
            <div className="page-container max-w-3xl">
              <h2 className="text-2xl font-serif font-bold text-foreground mb-6">Posts Recomendados</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommended.map((rec) =>
                  rec ? (
                    <Link
                      key={rec.slug}
                      href={`/blog/${rec.slug}`}
                      className="card-fantasy-hover p-5 group"
                    >
                      <h3 className="font-serif font-semibold text-foreground group-hover:text-primary transition-colors">
                        {rec.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{rec.excerpt}</p>
                    </Link>
                  ) : null
                )}
              </div>
            </div>
          </section>
        )}
      </article>

      <CTASection
        title="Gostou do conteúdo?"
        subtitle="Entre no servidor ou junte-se à comunidade no Discord."
      />
    </Layout>
  );
};

export default BlogPostPage;
