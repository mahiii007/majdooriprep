import { adminGetArticleBySlug } from "@/lib/admin";
import { ArticleForm } from "../ArticleForm";
import { notFound } from "next/navigation";

export default async function AdminEditArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const article = await adminGetArticleBySlug(params.slug);
  if (!article) {
    notFound();
  }

  // Map database tags array and cast properties to match ArticleFormProps
  const formInitialData = {
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    content: article.content,
    tags: article.tags,
    status: article.status as "draft" | "published",
  };

  return <ArticleForm initialData={formInitialData} />;
}
