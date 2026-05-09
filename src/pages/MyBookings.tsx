import { useState } from 'react';
import { Search, Calendar, Clock, User, CheckCircle, Clock3 } from 'lucide-react';

interface Booking {
  _id: string;
  expertId: {
    _id: string;
    name: string;
    category: string;
  };
  date: string;
  timeSlot: string;
  status: 'Pending' | 'Confirmed' | 'Completed';
  createdAt: string;
}

export default function MyBookings() {
  const [email, setEmail] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/bookings?email=${encodeURIComponent(email)}`);
      if (!res.ok) throw new Error('Failed to fetch bookings');
      
      const data = await res.json();
      setBookings(data);
      setHasSearched(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'Completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Pending': default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Confirmed': return <CheckCircle className="w-4 h-4 mr-1.5" />;
      case 'Completed': return <CheckCircle className="w-4 h-4 mr-1.5" />;
      case 'Pending': default: return <Clock3 className="w-4 h-4 mr-1.5" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">My Bookings</h2>
        <p className="text-gray-500 mb-6">Enter your email address to view your session bookings.</p>
        
        <form onSubmit={fetchBookings} className="max-w-md mx-auto flex gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              required
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
              placeholder="Enter your email address..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Searching...' : 'Find'}
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 text-center">
          {error}
        </div>
      )}

      {hasSearched && !loading && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 px-1">
            {bookings.length} {bookings.length === 1 ? 'Booking' : 'Bookings'} found for {email}
          </h3>
          
          {bookings.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm">
              <p className="text-gray-500">No bookings found for this email address.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {bookings.map((booking) => (
                <div key={booking._id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="flex items-start space-x-4">
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mt-1 flex-shrink-0">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">{booking.expertId?.name || 'Unknown Expert'}</h4>
                        <p className="text-sm text-gray-500 mb-3">{booking.expertId?.category || 'General'}</p>
                        
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 text-sm">
                          <div className="flex items-center text-gray-700">
                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="font-medium">{new Date(booking.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                          </div>
                          <div className="flex items-center text-gray-700">
                            <Clock className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="font-medium">{booking.timeSlot}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center sm:flex-col sm:items-end justify-between self-stretch sm:self-auto pt-4 border-t border-gray-100 sm:border-0 sm:pt-0 mt-2 sm:mt-0">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(booking.status)}`}>
                        {getStatusIcon(booking.status)}
                        {booking.status}
                      </div>
                      <div className="text-xs text-gray-400 sm:mt-auto">
                        Booked {new Date(booking.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
