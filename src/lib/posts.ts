import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";

const postsDir = path.join(process.cwd(), "posts");

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  coverColor: string;
  image?: string;
  content: string;
  recommended?: string[];
};

export async function getAllPosts(): Promise<Post[]> {
  if (!fs.existsSync(postsDir)) return [];

  const files = fs.readdirSync(postsDir).filter((f) => f.endsWith(".md"));

  const posts = await Promise.all(
    files.map(async (filename) => {
      const slug = filename.replace(/\.md$/, "");
      const raw = fs.readFileSync(path.join(postsDir, filename), "utf8");
      const { data, content } = matter(raw);

      const html = await remark()
        .use(remarkRehype)
        .use(rehypeStringify)
        .process(content);

      return {
        slug,
        title: data.title ?? "",
        excerpt: data.excerpt ?? "",
        date: String(data.date ?? ""),
        category: data.category ?? "",
        coverColor: data.coverColor ?? "from-gold/20 to-accent/10",
        image: data.image ?? undefined,
        content: html.toString(),
        recommended: data.recommended ?? [],
      } satisfies Post;
    })
  );

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  const posts = await getAllPosts();
  return posts.find((p) => p.slug === slug);
}

export async function getAllSlugs(): Promise<string[]> {
  const posts = await getAllPosts();
  return posts.map((p) => p.slug);
}
