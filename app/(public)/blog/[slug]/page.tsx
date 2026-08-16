import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import Image from "next/image";
import Link from "next/link";
import SocialShare from "@/components/sections/SocialShare";

export const revalidate = 0;

async function getPost(slug: string) {
  try {
    return await prisma.blogPost.findFirst({ where: { slug, draft: false } });
  } catch {
    return null;
  }
}

async function renderMarkdown(markdown: string): Promise<string> {
  try {
    const result = await unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeSanitize)
      .use(rehypeStringify)
      .process(markdown);
    return String(result);
  } catch {
    return `<p>${markdown}</p>`;
  }
}

export async function generateStaticParams() {
  try {
    const posts = await prisma.blogPost.findMany({ where: { draft: false }, select: { slug: true } });
    return posts.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) return { title: "Post Not Found" };
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://example.com";
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt.toISOString(),
      images: post.featuredImage ? [{ url: post.featuredImage }] : [],
    },
    alternates: { types: { "application/rss+xml": `${baseUrl}/rss.xml` } },
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  const contentHtml = await renderMarkdown(post.content);
  const formattedDate = post.publishedAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const tags = Array.isArray(post.tags) ? (post.tags as string[]) : [];
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://example.com";
  const postUrl = `${baseUrl}/blog/${post.slug}`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <article>
        {/* Featured image */}
        {post.featuredImage && (
          <div className="mb-8 rounded-2xl overflow-hidden shadow-lg">
            <Image
              src={post.featuredImage}
              alt={post.title}
              width={900}
              height={400}
              className="w-full h-72 object-cover"
              priority
            />
          </div>
        )}

        <header className="mb-8">
          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {tags.map((tag, i) => (
                <span key={i} className="px-3 py-1 bg-primary-light text-primary text-xs rounded-full font-medium">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <h1 className="text-4xl font-bold text-navy-900 mb-4">{post.title}</h1>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <time dateTime={post.publishedAt.toISOString()} className="text-navy-500 text-sm">
              {formattedDate}
            </time>
            <SocialShare url={postUrl} title={post.title} />
          </div>
        </header>

        <div
          className="prose prose-navy max-w-none text-navy-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />

        {/* Footer share */}
        <footer className="mt-12 pt-8 border-t border-border">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <SocialShare url={postUrl} title={post.title} />
            <Link href="/blog" className="text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
              ← Back to Blog
            </Link>
          </div>
        </footer>
      </article>
    </div>
  );
}
