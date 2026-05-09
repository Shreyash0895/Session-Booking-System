import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Star } from 'lucide-react';

interface Expert {
  _id: string;
  name: string;
  category: string;
  experience: number;
  rating: number;
}

export default function ExpertListing() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchExperts();
  }, [searchQuery, categoryFilter, page]);

  const fetchExperts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '6',
        ...(searchQuery && { name: searchQuery }),
        ...(categoryFilter && { category: categoryFilter }),
      });

      const res = await fetch(`/api/experts?${params}`);
      if (!res.ok) throw new Error('Failed to fetch experts');
      
      const data = await res.json();
      setExperts(data.experts);
      setTotalPages(data.totalPages);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-bold text-2xl text-gray-900">Available Experts</h2>
        <span className="text-xs text-gray-500 font-medium bg-gray-200 px-2 py-1 rounded-md">Page {page} of {totalPages || 1}</span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 mb-2 no-scrollbar">
        {['', 'Software Engineering', 'Product Management', 'Design', 'Marketing'].map((cat) => (
          <button
            key={cat}
            onClick={() => { setCategoryFilter(cat); setPage(1); }}
            className={`px-4 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
              categoryFilter === cat 
                ? 'bg-gray-900 text-white' 
                : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            {cat || 'All Categories'}
          </button>
        ))}
      </div>

      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
          placeholder="Search experts by name..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {loading && !experts.length ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
          {error}
        </div>
      ) : experts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500">No experts found. Try adjusting your search.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {experts.map((expert) => (
              <Link 
                key={expert._id} 
                to={`/expert/${expert._id}`}
                className="p-5 bg-white rounded-xl border border-gray-200 hover:border-blue-300 cursor-pointer transition-colors shadow-sm"
              >
                <div className="flex gap-4">
                  <div className="w-14 h-14 bg-blue-100 rounded-lg flex-shrink-0 flex items-center justify-center text-xl font-bold text-blue-600">
                    {expert.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-gray-900 group-hover:text-blue-600">{expert.name}</h3>
                    <p className="text-xs text-gray-500 font-medium mb-2">{expert.category}</p>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-blue-600 flex items-center">
                        <Star className="h-3 w-3 mr-1 fill-current" /> {expert.rating.toFixed(1)}
                      </span>
                      <span className="text-xs text-gray-400">{expert.experience} yrs exp.</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <nav className="inline-flex rounded-md shadow-sm border border-gray-200 bg-white p-1">
                <button
                  onClick={() => setPage(page => Math.max(page - 1, 1))}
                  disabled={page === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-md"
                >
                  Prev
                </button>
                <span className="px-4 py-2 text-sm font-medium text-gray-900 border-x border-gray-100">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(page => Math.min(page + 1, totalPages))}
                  disabled={page === totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed rounded-r-md"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
}
