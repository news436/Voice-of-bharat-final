import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, Users, FileText, Newspaper, BarChart2 } from 'lucide-react';

export const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState({
    totalArticles: 0,
    totalViews: 0,
    totalUsers: 0,
    breakingNews: 0,
    categories: [] as any[],
    recentActivity: [] as any[],
    viewsData: [] as any[],
    popularArticles: [] as any[]
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const { count: articlesCount } = await supabase.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'published');
      const { count: breakingCount } = await supabase.from('articles').select('*', { count: 'exact', head: true }).eq('is_breaking', true);
      
      const { data: categoriesData } = await supabase.from('categories').select('id, name, articles(count)');
      
      const { data: recentArticles } = await supabase.from('articles').select('id, title, created_at, status').order('created_at', { ascending: false }).limit(5);

      const popularArticles = (await supabase.from('articles').select('id, title').limit(5)).data || [];
      
      setAnalytics({
        totalArticles: articlesCount || 0,
        totalViews: 45231, // Simulated
        totalUsers: 789,   // Simulated
        breakingNews: breakingCount || 0,
        categories: categoriesData?.map(c => ({ name: c.name, value: c.articles[0]?.count || 0 })) || [],
        recentActivity: recentArticles || [],
        viewsData: [
          { name: "Jan", total: Math.floor(Math.random() * 5000) + 1000 },
          { name: "Feb", total: Math.floor(Math.random() * 5000) + 1000 },
          { name: "Mar", total: Math.floor(Math.random() * 5000) + 1000 },
          { name: "Apr", total: Math.floor(Math.random() * 5000) + 1000 },
          { name: "May", total: Math.floor(Math.random() * 5000) + 1000 },
          { name: "Jun", total: Math.floor(Math.random() * 5000) + 1000 },
        ],
        popularArticles: popularArticles,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943'];

  if (isLoading) {
    return <div className="flex items-center justify-center h-full"><p>Loading analytics...</p></div>;
  }
  
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Analytics</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalViews.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalUsers.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalArticles}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Breaking News</CardTitle>
            <Newspaper className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.breakingNews}</div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={analytics.viewsData}>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                <Tooltip />
                <Bar dataKey="total" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Articles by Category</CardTitle>
            <CardDescription>A breakdown of articles per category.</CardDescription>
          </CardHeader>
          <CardContent>
             <ResponsiveContainer width="100%" height={350}>
               <PieChart>
                 <Pie data={analytics.categories} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                   {analytics.categories.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                   ))}
                 </Pie>
                 <Tooltip />
               </PieChart>
             </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
       <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>A log of the most recently published or updated articles.</CardDescription>
          </CardHeader>
          <CardContent>
             <Table>
                <TableHeader>
                   <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Date</TableHead>
                   </TableRow>
                </TableHeader>
                <TableBody>
                   {analytics.recentActivity.map((article) => (
                      <TableRow key={article.id}>
                         <TableCell><div className="font-medium">{article.title}</div></TableCell>
                         <TableCell><Badge variant="outline">{article.status}</Badge></TableCell>
                         <TableCell className="text-right">{new Date(article.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                   ))}
                </TableBody>
             </Table>
          </CardContent>
       </Card>
    </div>
  );
}
