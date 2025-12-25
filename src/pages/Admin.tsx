import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LayoutDashboard, 
  Film, 
  Music, 
  Ticket, 
  DollarSign,
  BarChart3,
  Plus
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { MovieForm } from '@/components/admin/MovieForm';
import { ShowtimeForm } from '@/components/admin/ShowtimeForm';
import { ConcertForm } from '@/components/admin/ConcertForm';
import { supabase } from '@/integrations/supabase/client';

// Mock sales data
const movieSalesData = [
  { name: 'Pushpa 2', sales: 45000, tickets: 120 },
  { name: 'Mufasa', sales: 38000, tickets: 95 },
  { name: 'Sonic 3', sales: 32000, tickets: 85 },
  { name: 'Kraven', sales: 28000, tickets: 75 },
  { name: 'Dhaka Attack', sales: 22000, tickets: 60 },
  { name: 'Haunted Mansion', sales: 18000, tickets: 50 },
];

const concertSalesData = [
  { name: 'Arijit Singh', sales: 250000, tickets: 450 },
  { name: 'Coke Studio', sales: 180000, tickets: 380 },
  { name: 'Rock Night', sales: 95000, tickets: 280 },
];

const sectionSalesData = [
  { name: 'VIP', value: 180000, color: '#f59e0b' },
  { name: 'Front', value: 250000, color: '#22d3ee' },
  { name: 'Middle', value: 180000, color: '#a855f7' },
  { name: 'Back', value: 115000, color: '#64748b' },
];

const Admin: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [movies, setMovies] = useState<any[]>([]);
  const [concerts, setConcerts] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchMovies = async () => {
    const { data } = await supabase.from('movies').select('*').order('created_at', { ascending: false });
    setMovies(data || []);
  };

  const fetchConcerts = async () => {
    const { data } = await supabase.from('concerts').select('*').order('created_at', { ascending: false });
    setConcerts(data || []);
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    fetchMovies();
    fetchConcerts();
  };

  useEffect(() => {
    fetchMovies();
    fetchConcerts();
  }, []);

  useEffect(() => {
    document.title = 'Admin Dashboard - TixWix';
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
    }
  }, [isAdmin, navigate]);

  if (!isAdmin) {
    return null;
  }

  const totalMovieSales = movieSalesData.reduce((sum, m) => sum + m.sales, 0);
  const totalConcertSales = concertSalesData.reduce((sum, c) => sum + c.sales, 0);
  const totalTicketsSold = movieSalesData.reduce((sum, m) => sum + m.tickets, 0) +
    concertSalesData.reduce((sum, c) => sum + c.tickets, 0);

  const statsCards = [
    {
      title: 'Total Revenue',
      value: `৳${(totalMovieSales + totalConcertSales).toLocaleString()}`,
      icon: DollarSign,
      change: '+12.5%',
      color: 'text-primary',
    },
    {
      title: 'Movie Sales',
      value: `৳${totalMovieSales.toLocaleString()}`,
      icon: Film,
      change: '+8.2%',
      color: 'text-primary',
    },
    {
      title: 'Concert Sales',
      value: `৳${totalConcertSales.toLocaleString()}`,
      icon: Music,
      change: '+18.7%',
      color: 'text-accent',
    },
    {
      title: 'Tickets Sold',
      value: totalTicketsSold.toLocaleString(),
      icon: Ticket,
      change: '+15.3%',
      color: 'text-success',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <LayoutDashboard className="w-8 h-8 text-primary" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, {user?.name}. Here's your sales overview.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statsCards.map((stat, index) => (
              <Card key={stat.title} className="glass-card animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                    <span className="text-xs text-success bg-success/20 px-2 py-1 rounded-full">
                      {stat.change}
                    </span>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full max-w-2xl grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="movies">Movies</TabsTrigger>
              <TabsTrigger value="concerts">Concerts</TabsTrigger>
              <TabsTrigger value="manage-movies">Manage Movies</TabsTrigger>
              <TabsTrigger value="manage-concerts">Manage Concerts</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Movie Sales Chart */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      Movie Sales by Title
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={movieSalesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 20%)" />
                        <XAxis dataKey="name" stroke="hsl(215 20% 65%)" tick={{ fontSize: 12 }} />
                        <YAxis stroke="hsl(215 20% 65%)" tick={{ fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(222 47% 8%)',
                            border: '1px solid hsl(222 30% 20%)',
                            borderRadius: '8px',
                          }}
                        />
                        <Bar dataKey="sales" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Concert Section Sales */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Music className="w-5 h-5 text-accent" />
                      Concert Sales by Section
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={sectionSalesData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {sectionSalesData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(222 47% 8%)',
                            border: '1px solid hsl(222 30% 20%)',
                            borderRadius: '8px',
                          }}
                          formatter={(value: number) => `৳${value.toLocaleString()}`}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="movies">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Movie Sales Report</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Movie</th>
                          <th className="text-right py-3 px-4 font-medium text-muted-foreground">Tickets Sold</th>
                          <th className="text-right py-3 px-4 font-medium text-muted-foreground">Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {movieSalesData.map((movie) => (
                          <tr key={movie.name} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                            <td className="py-4 px-4 font-medium">{movie.name}</td>
                            <td className="py-4 px-4 text-right">{movie.tickets}</td>
                            <td className="py-4 px-4 text-right font-semibold text-primary">
                              ৳{movie.sales.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-secondary/30 font-bold">
                          <td className="py-4 px-4">Total</td>
                          <td className="py-4 px-4 text-right">
                            {movieSalesData.reduce((sum, m) => sum + m.tickets, 0)}
                          </td>
                          <td className="py-4 px-4 text-right text-primary">
                            ৳{totalMovieSales.toLocaleString()}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="concerts">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Concert Sales Report</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Concert</th>
                          <th className="text-right py-3 px-4 font-medium text-muted-foreground">Tickets Sold</th>
                          <th className="text-right py-3 px-4 font-medium text-muted-foreground">Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {concertSalesData.map((concert) => (
                          <tr key={concert.name} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                            <td className="py-4 px-4 font-medium">{concert.name}</td>
                            <td className="py-4 px-4 text-right">{concert.tickets}</td>
                            <td className="py-4 px-4 text-right font-semibold text-accent">
                              ৳{concert.sales.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-secondary/30 font-bold">
                          <td className="py-4 px-4">Total</td>
                          <td className="py-4 px-4 text-right">
                            {concertSalesData.reduce((sum, c) => sum + c.tickets, 0)}
                          </td>
                          <td className="py-4 px-4 text-right text-accent">
                            ৳{totalConcertSales.toLocaleString()}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Manage Movies Tab */}
            <TabsContent value="manage-movies">
              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Film className="w-5 h-5 text-primary" />
                    Manage Movies
                  </CardTitle>
                  <div className="flex gap-2">
                    <MovieForm onSuccess={handleRefresh} />
                    <ShowtimeForm onSuccess={handleRefresh} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Poster</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Title</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Director</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Duration</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Release Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {movies.map((movie) => (
                          <tr key={movie.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                            <td className="py-2 px-4">
                              <img src={movie.poster} alt={movie.title} className="w-12 h-16 object-cover rounded" />
                            </td>
                            <td className="py-4 px-4 font-medium">{movie.title}</td>
                            <td className="py-4 px-4">{movie.director}</td>
                            <td className="py-4 px-4">{movie.duration} min</td>
                            <td className="py-4 px-4">{movie.release_date}</td>
                          </tr>
                        ))}
                        {movies.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-muted-foreground">
                              No movies found. Add your first movie!
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Manage Concerts Tab */}
            <TabsContent value="manage-concerts">
              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Music className="w-5 h-5 text-accent" />
                    Manage Concerts
                  </CardTitle>
                  <ConcertForm onSuccess={handleRefresh} />
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Poster</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Title</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Artist</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Genre</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {concerts.map((concert) => (
                          <tr key={concert.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                            <td className="py-2 px-4">
                              <img src={concert.poster} alt={concert.title} className="w-12 h-16 object-cover rounded" />
                            </td>
                            <td className="py-4 px-4 font-medium">{concert.title}</td>
                            <td className="py-4 px-4">{concert.artist}</td>
                            <td className="py-4 px-4">{concert.genre}</td>
                            <td className="py-4 px-4">{concert.date}</td>
                            <td className="py-4 px-4">{concert.time}</td>
                          </tr>
                        ))}
                        {concerts.length === 0 && (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-muted-foreground">
                              No concerts found. Add your first concert!
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Admin;
