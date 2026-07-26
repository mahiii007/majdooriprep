import { Article, IArticle } from "@/models/Article";
import type { ArticleDTO } from "@/types";

function toArticleDTO(a: IArticle): ArticleDTO {
  return {
    id: String(a._id),
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    content: a.content,
    tags: a.tags,
    publishedAt: a.publishedAt ? a.publishedAt.toISOString() : a.createdAt.toISOString(),
  };
}

export async function listArticles(): Promise<ArticleDTO[]> {
  const articles = await Article.find({ status: "published" })
    .sort({ publishedAt: -1 })
    .lean<IArticle[]>();
  return articles.map(toArticleDTO);
}

export async function getArticleBySlug(slug: string): Promise<ArticleDTO | null> {
  const article = await Article.findOne({ slug, status: "published" }).lean<IArticle | null>();
  return article ? toArticleDTO(article) : null;
}
