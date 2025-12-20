import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Ticket, Gift, Film, Music, Calendar, Clock, LogOut } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated || !user) {
    navigate('/auth');
    return null;
  }

  const remainingForFreeShow = 4 - (user.monthlyBookingCount % 5);
  const hasEarnedFreeShow = user.monthlyBookingCount >= 4 && user.monthlyBookingCount % 5 === 4;

  return (
    <>
      <Helmet>
        <title>My Profile - TixWix</title>
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        
        <main className="flex-1 pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Card */}
              <div className="lg:col-span-1">
                <div className="glass-card p-6 sticky top-24">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-gold-dark flex items-center justify-center text-3xl font-bold text-primary-foreground mb-4">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <h1 className="text-2xl font-bold">{user.name}</h1>
                    <p className="text-muted-foreground flex items-center gap-2 mt-1">
                      <Mail className="w-4 h-4" />
                      {user.email}
                    </p>
                    <Badge className="mt-3" variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role === 'admin' ? 'Admin' : 'Member'}
                    </Badge>
                  </div>

                  {/* Free Show Progress */}
                  <div className="mt-8 p-4 bg-secondary/50 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <Gift className="w-5 h-5 text-primary" />
                      <span className="font-semibold">Loyalty Reward</span>
                    </div>
                    {hasEarnedFreeShow ? (
                      <p className="text-sm text-success">
                        🎉 You've earned a FREE show! Your next booking is on us!
                      </p>
                    ) : (
                      <>
                        <p className="text-sm text-muted-foreground mb-2">
                          Book {remainingForFreeShow} more show{remainingForFreeShow !== 1 ? 's' : ''} this month for a FREE ticket!
                        </p>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-gold transition-all"
                            style={{ width: `${(user.monthlyBookingCount % 5) * 25}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {user.monthlyBookingCount % 5}/4 shows this month
                        </p>
                      </>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    className="w-full mt-6 text-destructive border-destructive/50 hover:bg-destructive/10"
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </div>

              {/* Booking History */}
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Ticket className="w-6 h-6 text-primary" />
                  Booking History
                </h2>

                {user.bookings.length === 0 ? (
                  <div className="glass-card p-12 text-center">
                    <Ticket className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No bookings yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Start your entertainment journey with TixWix
                    </p>
                    <div className="flex gap-4 justify-center">
                      <Button variant="gold" onClick={() => navigate('/movies')}>
                        <Film className="w-4 h-4 mr-2" />
                        Browse Movies
                      </Button>
                      <Button variant="outline" onClick={() => navigate('/concerts')}>
                        <Music className="w-4 h-4 mr-2" />
                        View Concerts
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {user.bookings.map((booking, index) => (
                      <div
                        key={booking.id}
                        className="glass-card p-4 flex items-center gap-4 animate-slide-up"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          booking.type === 'movie' ? 'bg-primary/20' : 'bg-accent/20'
                        }`}>
                          {booking.type === 'movie' ? (
                            <Film className="w-6 h-6 text-primary" />
                          ) : (
                            <Music className="w-6 h-6 text-accent" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">Booking #{booking.id}</span>
                            <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                              {booking.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(booking.bookingDate).toLocaleDateString()}
                            </span>
                            {booking.seats && (
                              <span>{booking.seats.length} seat(s)</span>
                            )}
                            {booking.quantity && (
                              <span>{booking.quantity} ticket(s)</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">
                            {booking.finalPrice === 0 ? (
                              <span className="text-success">FREE</span>
                            ) : (
                              <span className="text-gradient-gold">৳{booking.finalPrice.toLocaleString()}</span>
                            )}
                          </div>
                          {booking.discount > 0 && (
                            <span className="text-xs text-success">
                              Saved ৳{booking.discount.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default Profile;
