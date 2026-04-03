import Link from "next/link";
import { GetStaticPaths, GetStaticProps } from "next";
import Layout from "@/components/Layout/Layout";
import SEO from "@/components/SEO";
import { getAllPosts, getPostBySlug, type Post } from "@/lib/posts";
import { Calendar, ArrowLeft } from "lucide-react";
import CTASection from "@/components/CTASection";

type Props = { post: Post; recommended: Post[] };

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getAllPosts();
  return {
    paths: posts.map((p) => ({ params: { slug: p.slug } })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const slug = params?.slug as string;
  const post = await getPostBySlug(slug);

  if (!post) return { notFound: true };

  const allPosts = await getAllPosts();
  const recommended = (post.recommended ?? [])
    .map((s) => allPosts.find((p) => p.slug === s))
    .filter((p): p is Post => Boolean(p));

  return { props: { post, recommended }, revalidate: 60 };
};

const BlogPostPage = ({ post, recommended }: Props) => {
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

            <div className={`h-48 md:h-64 rounded-xl bg-linear-to-br ${post.coverColor} mb-6 relative overflow-hidden`}>
              {post.image ? (
                <img src={post.image} alt={post.title} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm uppercase tracking-widest text-muted-foreground font-medium">
                    {post.category}
                  </span>
                </div>
              )}
              {post.image && (
                <div className="absolute inset-0 bg-linear-to-t from-card/60 to-transparent" />
              )}
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

        {recommended.length > 0 && (
          <section className="page-section bg-card/30">
            <div className="page-container max-w-3xl">
              <h2 className="text-2xl font-serif font-bold text-foreground mb-6">Posts Recomendados</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommended.map((rec) => (
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
                ))}
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
