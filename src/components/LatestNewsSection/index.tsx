import Link from "next/link";
import { blogPosts } from "@/data/blog-posts";
import { ArrowRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

const LatestNewsSection = () => {
  const latest = blogPosts.slice(0, 3);

  return (
    <section className="page-section relative">
      <div className="absolute inset-0 bg-linear-to-b from-card/30 via-transparent to-transparent pointer-events-none" />
      <div className="page-container relative">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-xs font-medium text-primary tracking-[0.2em] uppercase mb-3">Blog</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground font-serif">Direto do Servidor</h2>
            <p className="mt-2 text-muted-foreground">Updates, guias e tudo que importa para quem joga.</p>
          </div>
          <Button variant="outline-gold" size="sm" className="hidden sm:flex gap-1.5" asChild>
            <Link href="/blog">
              Ver Todas <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {latest.map((post) => (
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
                <h3 className="font-serif font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                  {post.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-2.5 line-clamp-2 leading-relaxed flex-1">{post.excerpt}</p>
                <div className="flex items-center gap-1.5 mt-4 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(post.date).toLocaleDateString("pt-BR")}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Button variant="outline-gold" size="sm" asChild>
            <Link href="/blog">Ver Todas as Notícias</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default LatestNewsSection;
