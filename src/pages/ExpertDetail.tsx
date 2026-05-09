import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Calendar, Clock, User, Mail, Phone, FileText, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

interface AvailableSlot {
  _id?: string;
  date: string;
  slots: string[];
}

interface Expert {
  _id: string;
  name: string;
  category: string;
  experience: number;
  rating: number;
  availableSlots: AvailableSlot[];
}

export default function ExpertDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [expert, setExpert] = useState<Expert | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  useEffect(() => {
    fetchExpert();
    
    // Connect to Socket.io
    const socket: Socket = io();
    
    socket.on('connect', () => {
      console.log('Connected to WebSocket');
    });
    
    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket');
    });

    // Listen for slot_booked events
    socket.on('slot_booked', (data: { expertId: string, date: string, timeSlot: string }) => {
      if (data.expertId === id) {
        setExpert(prevExpert => {
          if (!prevExpert) return prevExpert;
          
          // Deep clone to update state
          const newExpert = JSON.parse(JSON.stringify(prevExpert)) as Expert;
          
          const dayIndex = newExpert.availableSlots.findIndex(s => s.date === data.date);
          if (dayIndex !== -1) {
            newExpert.availableSlots[dayIndex].slots = newExpert.availableSlots[dayIndex].slots.filter(s => s !== data.timeSlot);
          }
          
          return newExpert;
        });

        // If the current user had this slot selected, deselect it
        if (selectedDate === data.date && selectedSlot === data.timeSlot) {
          setSelectedSlot('');
          setBookingError("The slot you selected was just booked by someone else. Please select another slot.");
        }
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [id, selectedDate, selectedSlot]);

  const fetchExpert = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/experts/${id}`);
      if (!res.ok) throw new Error('Expert not found');
      
      const data = await res.json();
      setExpert(data);
      if (data.availableSlots && data.availableSlots.length > 0) {
        setSelectedDate(data.availableSlots[0].date);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const submitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedSlot) {
      setBookingError("Please select a date and time slot.");
      return;
    }

    setBookingLoading(true);
    setBookingError(null);
    setBookingSuccess(false);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expertId: id,
          date: selectedDate,
          timeSlot: selectedSlot,
          ...formData
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to book session');
      }

      setBookingSuccess(true);
      setFormData({ name: '', email: '', phone: '', notes: '' });
      setSelectedSlot('');
    } catch (err: any) {
      setBookingError(err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !expert) {
    return (
      <div className="bg-red-50 text-red-700 p-6 rounded-lg border border-red-200 text-center max-w-lg mx-auto mt-10">
        <h2 className="text-xl font-bold mb-2">Error Loading Expert</h2>
        <p>{error || "Unable to display expert profile."}</p>
        <button 
          onClick={() => navigate('/')}
          className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to experts
        </button>
      </div>
    );
  }

  const selectedDaySlots = expert.availableSlots.find(d => d.date === selectedDate)?.slots || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <button 
        onClick={() => navigate('/')}
        className="inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Experts
      </button>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col p-6 md:p-8 overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6">
          <div className="flex gap-5 items-center">
            <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center text-3xl font-bold text-blue-600 flex-shrink-0 shadow-sm">
              {expert.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{expert.name}</h2>
              <p className="text-gray-500 font-medium text-sm mt-0.5">{expert.category}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs font-semibold text-blue-600 flex items-center">
                  <Star className="h-3.5 w-3.5 mr-1 fill-current" /> {expert.rating.toFixed(1)} Rating
                </span>
                <span className="text-xs text-gray-400 font-medium">•</span>
                <span className="text-xs text-gray-500 font-medium">{expert.experience} Years Experience</span>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-2 rounded-xl text-center self-start border border-gray-100">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Focus</p>
            <p className="text-sm font-bold text-gray-900">{expert.category}</p>
          </div>
        </div>

        {bookingSuccess ? (
          <div className="py-12 px-6 bg-green-50 rounded-xl border border-green-200 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-green-900 mb-2">Booking Confirmed</h3>
            <p className="text-green-700 text-sm max-w-md mx-auto mb-6">
              Your session with <span className="font-semibold">{expert.name}</span> on <span className="font-semibold">{new Date(selectedDate).toLocaleDateString()}</span> at <span className="font-semibold">{selectedSlot}</span> has been confirmed.
            </p>
            <button 
              onClick={() => navigate('/bookings')}
              className="bg-green-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors shadow-sm"
            >
              View My Bookings
            </button>
          </div>
        ) : (
          <form onSubmit={submitBooking} className="space-y-8">
            
            {/* Date & Time Selection */}
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                <h3 className="font-bold text-base text-gray-900">Available Time Slots <span className="text-blue-600 text-xs font-normal ml-2 bg-blue-50 px-2 py-0.5 rounded-full">• Real-time updates</span></h3>
                <div className="flex gap-3 text-xs">
                  <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-blue-100 border border-blue-300 rounded-sm"></div> Selected</span>
                  <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-white border border-gray-300 rounded-sm"></div> Available</span>
                  <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-gray-100 border border-gray-200 rounded-sm"></div> Booked</span>
                </div>
              </div>
              
              {expert.availableSlots.length === 0 ? (
                <div className="bg-gray-50 text-gray-600 p-6 rounded-xl border border-gray-200 text-center text-sm font-medium">
                  This expert has no available slots at the moment.
                </div>
              ) : (
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar mb-4">
                  {expert.availableSlots.map(dateObj => (
                    <button
                      key={dateObj.date}
                      type="button"
                      onClick={() => {
                        setSelectedDate(dateObj.date);
                        setSelectedSlot('');
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap min-w-[max-content] ${
                        selectedDate === dateObj.date 
                          ? 'bg-gray-900 text-white' 
                          : 'bg-white border text-gray-700 hover:bg-gray-50 border-gray-200'
                      }`}
                    >
                      {new Date(dateObj.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric'})}
                    </button>
                  ))}
                </div>
              )}

              {selectedDate && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {selectedDaySlots.length === 0 ? (
                    <div className="col-span-full text-sm text-gray-400 italic py-4">No slots available on this date.</div>
                  ) : (
                    selectedDaySlots.map(slot => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-3 rounded-lg text-center transition-all ${
                          selectedSlot === slot
                            ? 'border-2 border-blue-600 bg-blue-50'
                            : 'bg-white border border-gray-200 hover:border-blue-400 hover:shadow-sm text-gray-700'
                        }`}
                      >
                        <p className={`text-xs font-bold ${selectedSlot === slot ? 'text-blue-700' : 'text-gray-700'}`}>{slot}</p>
                        <p className={`text-[10px] ${selectedSlot === slot ? 'text-blue-500' : 'text-gray-500'}`}>Available</p>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Form Fields */}
            <div className="bg-gray-50 rounded-xl p-5 md:p-6 border border-gray-100">
              <h3 className="font-bold text-sm mb-4 text-gray-900">Complete Your Booking</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  required
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="bg-white border-gray-200 border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-full"
                />
                <input
                  required
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="bg-white border-gray-200 border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-full"
                />
                <input
                  required
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="bg-white border-gray-200 border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-full"
                />
                <input
                  type="text"
                  value={selectedDate && selectedSlot ? `${new Date(selectedDate).toLocaleDateString()} - ${selectedSlot}` : 'Select a date and time'}
                  disabled
                  className="bg-gray-100 border-gray-200 border rounded-lg p-3 text-sm text-gray-500 w-full font-medium"
                />
                <textarea
                  name="notes"
                  placeholder="Session notes (Briefly describe your challenge)..."
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="md:col-span-2 bg-white border-gray-200 border rounded-lg p-3 text-sm h-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-full resize-none"
                ></textarea>
              </div>

              {bookingError && (
                <div className="mt-4 bg-red-50 text-red-700 p-3 rounded-lg border border-red-200 text-sm font-medium">
                  {bookingError}
                </div>
              )}

              <button
                type="submit"
                disabled={bookingLoading || !selectedDate || !selectedSlot}
                className="w-full mt-6 bg-blue-600 text-white font-bold py-3.5 rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed border border-blue-700"
              >
                {bookingLoading ? 'Processing...' : 'Confirm & Book Session'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
