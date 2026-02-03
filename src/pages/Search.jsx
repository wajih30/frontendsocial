import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search as SearchIcon, X, History } from 'lucide-react';
import { usersAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';

const Search = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [recentSearches, setRecentSearches] = useState([]);
    const { user } = useAuth();

    // Load recent searches from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('recentSearches');
        if (saved) {
            setRecentSearches(JSON.parse(saved));
        }
    }, []);

    // Debounced search
    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        const timeoutId = setTimeout(async () => {
            setLoading(true);
            try {
                const response = await usersAPI.search(query);
                setResults(response.data);
            } catch (error) {
                console.error('Search failed:', error);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [query]);

    const handleUserClick = (clickedUser) => {
        const updated = [clickedUser, ...recentSearches.filter(u => u.id !== clickedUser.id)].slice(0, 10);
        setRecentSearches(updated);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
    };

    const clearRecentSearches = () => {
        setRecentSearches([]);
        localStorage.removeItem('recentSearches');
    };

    const removeRecentSearch = (userId) => {
        const updated = recentSearches.filter(u => u.id !== userId);
        setRecentSearches(updated);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
    };

    return (
        <div className="min-h-screen pb-20">
            {/* Search Header */}
            <div className="sticky top-0 z-30 bg-black/85 backdrop-blur-xl border-b border-[#ffffff15] px-4 pt-4 pb-4">
                <h1 className="text-[24px] font-bold text-white mb-4 pl-1">Search</h1>

                <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#777] group-focus-within:text-white transition-colors">
                        <SearchIcon size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl py-2.5 pl-11 pr-10 text-[15px] text-white outline-none placeholder-[#777] focus:border-[#555] transition-colors"
                        autoFocus
                    />
                    {query && (
                        <button
                            onClick={() => setQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#333] rounded-full p-1 text-[#ccc] hover:text-white hover:bg-[#444] transition-colors"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Results / History */}
            <div className="max-w-[640px] mx-auto px-2 pt-2">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-[#777]"></div>
                    </div>
                ) : query ? (
                    <div className="flex flex-col">
                        {results.length === 0 ? (
                            <div className="text-center py-20 text-[#777]">
                                <p className="text-[15px]">No results found.</p>
                            </div>
                        ) : (
                            results.map((searchUser) => (
                                <Link
                                    key={searchUser.id}
                                    to={`/user/${searchUser.username}`}
                                    onClick={() => handleUserClick(searchUser)}
                                    className="flex items-center gap-3 p-3 hover:bg-white/[0.03] rounded-xl transition-colors"
                                >
                                    <div className="w-11 h-11 rounded-full bg-[#1a1a1a] flex-shrink-0 flex items-center justify-center overflow-hidden border border-[#ffffff15]">
                                        {searchUser.profile_picture_url ? (
                                            <img src={`http://127.0.0.1:8000${searchUser.profile_picture_url}`} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-[15px] font-bold text-white">{searchUser.username[0].toUpperCase()}</span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-[15px] text-white truncate">
                                            {searchUser.username}
                                        </div>
                                        <div className="text-[#777] text-[14px] truncate">{searchUser.full_name}</div>
                                        <div className="text-[#555] text-[13px] mt-0.5">{searchUser.followers_count || 0} followers</div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="animate-in fade-in duration-300">
                        {recentSearches.length > 0 && (
                            <>
                                <div className="flex justify-between items-center mb-2 px-3 pt-2">
                                    <h2 className="text-[15px] font-bold text-white">Recent</h2>
                                    <button
                                        onClick={clearRecentSearches}
                                        className="text-[13px] font-medium text-[#0095f6] hover:text-[#white] transition-colors"
                                    >
                                        Clear all
                                    </button>
                                </div>
                                <div className="flex flex-col">
                                    {recentSearches.map((recentUser) => (
                                        <div
                                            key={recentUser.id}
                                            className="flex items-center justify-between p-3 hover:bg-white/[0.03] rounded-xl transition-colors group"
                                        >
                                            <Link
                                                to={`/user/${recentUser.username}`}
                                                className="flex items-center gap-3 flex-1 min-w-0"
                                            >
                                                <div className="w-11 h-11 rounded-full bg-[#1a1a1a] flex-shrink-0 flex items-center justify-center overflow-hidden border border-[#ffffff15]">
                                                    {recentUser.profile_picture_url ? (
                                                        <img src={`http://127.0.0.1:8000${recentUser.profile_picture_url}`} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-[15px] font-bold text-white">{recentUser.username[0].toUpperCase()}</span>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-bold text-[15px] text-white truncate">
                                                        {recentUser.username}
                                                    </div>
                                                    <div className="text-[#777] text-[14px] truncate">{recentUser.full_name}</div>
                                                </div>
                                            </Link>
                                            <button
                                                onClick={() => removeRecentSearch(recentUser.id)}
                                                className="p-2 text-[#777] hover:text-white transition-colors"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Search;
