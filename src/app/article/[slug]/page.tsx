import { useNavigate } from 'react-router-dom';
import { getArticleBySlug } from '@/lib/articles';
import apiClient from '@/utils/api';

const ArticlePage = async ({ params }: { params: { slug: string } }) => {
  const article = await getArticleBySlug(params.slug);
  
  // Track article view
  if (article?.id) {
    try {
      await apiClient.post(`/articles/${article.id}/view`);
    } catch (error) {
      console.error('Error tracking article view:', error);
    }
  }

  if (!article) {
    // Instead of notFound(), redirect to 404 page
    window.location.href = '/404';
    return null;
  }

  // ... rest of the component code ...
}; 