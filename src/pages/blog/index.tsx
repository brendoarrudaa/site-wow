import { useState } from "react";
import Link from "next/link";
import Layout from "@/components/Layout/Layout";
import SEO from "@/components/SEO";
import PageHeader from "@/components/PageHeader";
import { blogPosts } from "@/data/blog-posts";
import { Calendar, Search } from "lucide-react";

const Blog = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = [...new Set(blogPosts.map((p) => p.category))];

  const filtered = blogPosts.filter((post) => {
    const matchesSearch =
      !search ||
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !activeCategory || post.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Layout>
      <SEO
        title="Blog"
        description="Notícias, changelogs, guias e atualizações do Azeroth Legacy. Fique por dentro de tudo que acontece no servidor."
        path="/blog"
      />
      <PageHeader title="Blog" subtitle="Notícias, changelogs, guias e tudo que acontece no Azeroth Legacy." />

      <section className="page-section">
        <div className="page-container">
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                className="input input-bordered w-full pl-10"
                placeholder="Buscar no blog..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCategory(null)}
                className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                  !activeCategory
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/30"
                }`}
              >
                Todos
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                  className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                    activeCategory === cat
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">Nenhum post encontrado.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="card-fantasy-hover group flex flex-col"
                >
                  <div className={`h-36 rounded-t-lg bg-linear-to-br ${post.coverColor} flex items-center justify-center relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-linear-to-t from-card/50 to-transparent" />
                    <span className="relative text-[10px] uppercase tracking-[0.2em] text-foreground/60 font-semibold px-3 py-1 rounded-full border border-foreground/10 bg-background/20 backdrop-blur-sm">
                      {post.category}
                    </span>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h2 className="font-serif font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                      {post.title}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-2.5 line-clamp-2 leading-relaxed flex-1">{post.excerpt}</p>
                    <div className="flex items-center gap-1.5 mt-4 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <time dateTime={post.date}>{new Date(post.date).toLocaleDateString("pt-BR")}</time>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Blog;
