import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { GetStaticProps } from "next";
import Layout from "@/components/Layout/Layout";
import SEO from "@/components/SEO";
import { getAllPosts, type Post } from "@/lib/posts";
import { Calendar, Search, ArrowLeft } from "lucide-react";

type Props = { posts: Post[] };

export const getStaticProps: GetStaticProps<Props> = async () => {
  const posts = await getAllPosts();
  return { props: { posts }, revalidate: 60 };
};

const SearchPage = ({ posts }: Props) => {
  const router = useRouter();
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (typeof router.query.q === "string") {
      setSearch(router.query.q);
    }
  }, [router.query.q]);

  const filtered = search.trim()
    ? posts.filter(
        (post) =>
          post.title.toLowerCase().includes(search.toLowerCase()) ||
          post.excerpt.toLowerCase().includes(search.toLowerCase()) ||
          post.category.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    router.replace({ pathname: "/blog/pesquisar", query: value ? { q: value } : {} }, undefined, { shallow: true });
  };

  return (
    <Layout>
      <SEO
        title="Pesquisar no Blog"
        description="Pesquise por posts, guias, changelogs e notícias do Azeroth Legacy."
        path="/blog/pesquisar"
      />

      <section className="page-section">
        <div className="page-container max-w-4xl">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Blog
          </Link>

          <h1 className="text-3xl font-serif font-bold text-foreground mb-6">Pesquisar no Blog</h1>

          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              className="input input-bordered w-full pl-12 text-base"
              placeholder="Digite para pesquisar..."
              value={search}
              onChange={handleChange}
              autoFocus
            />
          </div>

          {search.trim() === "" && (
            <p className="text-center text-muted-foreground py-12">Digite algo para começar a pesquisar.</p>
          )}

          {search.trim() !== "" && filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-12">
              Nenhum post encontrado para <strong className="text-foreground">&quot;{search}&quot;</strong>.
            </p>
          )}

          {filtered.length > 0 && (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                {filtered.length} {filtered.length === 1 ? "resultado" : "resultados"} para{" "}
                <strong className="text-foreground">&quot;{search}&quot;</strong>
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filtered.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="card-fantasy-hover group flex flex-col"
                  >
                    <div className={`h-28 rounded-t-lg bg-linear-to-br ${post.coverColor} relative overflow-hidden`}>
                      {post.image ? (
                        <img src={post.image} alt={post.title} className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[10px] uppercase tracking-[0.2em] text-foreground/60 font-semibold px-3 py-1 rounded-full border border-foreground/10 bg-background/20 backdrop-blur-sm">
                            {post.category}
                          </span>
                        </div>
                      )}
                      {post.image && (
                        <div className="absolute inset-0 bg-linear-to-t from-card/70 to-transparent" />
                      )}
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <h2 className="font-serif font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                        {post.title}
                      </h2>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2 leading-relaxed flex-1">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center gap-1.5 mt-4 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <time dateTime={post.date}>
                          {new Date(post.date).toLocaleDateString("pt-BR")}
                        </time>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default SearchPage;
