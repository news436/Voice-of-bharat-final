import React, { createContext, useContext, useRef } from 'react';

// Article type (import your SupabaseArticle type if available)
export interface Article {
  id: string;
  slug: string;
  [key: string]: any;
}

interface ArticleCacheContextType {
  getArticle: (idOrSlug: string) => Article | undefined;
  setArticle: (article: Article) => void;
  getArticles: (idsOrSlugs: string[]) => Article[];
  setArticles: (articles: Article[]) => void;
  clearCache: () => void;
}

const ArticleCacheContext = createContext<ArticleCacheContextType | undefined>(undefined);

export const ArticleCacheProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use a Map for fast lookup by id or slug
  const cacheRef = useRef<Map<string, Article>>(new Map());

  const getArticle = (idOrSlug: string) => {
    return cacheRef.current.get(idOrSlug);
  };

  const setArticle = (article: Article) => {
    if (article.id) cacheRef.current.set(article.id, article);
    if (article.slug) cacheRef.current.set(article.slug, article);
  };

  const getArticles = (idsOrSlugs: string[]) => {
    return idsOrSlugs.map(key => cacheRef.current.get(key)).filter(Boolean) as Article[];
  };

  const setArticles = (articles: Article[]) => {
    articles.forEach(setArticle);
  };

  const clearCache = () => {
    cacheRef.current.clear();
  };

  return (
    <ArticleCacheContext.Provider value={{ getArticle, setArticle, getArticles, setArticles, clearCache }}>
      {children}
    </ArticleCacheContext.Provider>
  );
};

export function useArticleCache() {
  const ctx = useContext(ArticleCacheContext);
  if (!ctx) throw new Error('useArticleCache must be used within an ArticleCacheProvider');
  return ctx;
} 