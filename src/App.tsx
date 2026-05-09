/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import ExpertListing from './pages/ExpertListing';
import ExpertDetail from './pages/ExpertDetail';
import MyBookings from './pages/MyBookings';
import { Search, Calendar, Star, Menu } from 'lucide-react';

function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  
  return (
    <div className="flex h-screen w-full bg-gray-50 text-gray-900 overflow-hidden font-sans">
      <aside className="w-72 bg-white border-r border-gray-200 flex flex-col p-6 hidden md:flex">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">E</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight">ExpertLink</h1>
        </div>
        <nav className="space-y-1 flex-1">
          <Link to="/" className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium text-sm ${location.pathname === '/' || location.pathname.startsWith('/expert') ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>
            <Search className="w-4 h-4" /> Find Experts
          </Link>
          <Link to="/bookings" className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium text-sm ${location.pathname === '/bookings' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>
            <Calendar className="w-4 h-4" /> My Bookings
          </Link>
          <a href="#" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md font-medium text-sm">
            <Star className="w-4 h-4" /> Favorites
          </a>
        </nav>
        <div className="mt-auto pt-6 border-t border-gray-100">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase font-bold mb-2">Live Status</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-sm font-medium">Connected to Gateway</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-4 md:px-8 flex-shrink-0">
          <div className="md:hidden flex items-center">
            <Menu className="w-6 h-6 text-gray-500" />
            <span className="ml-2 font-bold text-lg">ExpertLink</span>
          </div>
          <div className="hidden md:block relative w-96">
            <span className="absolute left-3 top-2.5 text-gray-400"><Search className="w-4 h-4" /></span>
            <input type="text" placeholder="Search by name or specialty..." className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-full text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div className="flex items-center gap-4 text-sm font-medium">
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs hidden sm:block">Experts Online</span>
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          </div>
        </header>
        <section className="p-4 md:p-8 flex-1 overflow-y-auto">
          {children}
        </section>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<ExpertListing />} />
          <Route path="/expert/:id" element={<ExpertDetail />} />
          <Route path="/bookings" element={<MyBookings />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}

