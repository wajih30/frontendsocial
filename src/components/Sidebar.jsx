import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Search, PlusSquare, Heart, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const Sidebar = () => {
    const { user, logout, unreadCount } = useAuth();
    const navigate = useNavigate();
    const [showMore, setShowMore] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { to: '/', icon: <Home size={28} strokeWidth={2.5} />, label: 'Home' },
        { to: '/search', icon: <Search size={28} strokeWidth={2.5} />, label: 'Search' },
        { to: '/new-post', icon: <PlusSquare size={28} strokeWidth={2.5} />, label: 'Create' },
        {
            to: '/notifications',
            icon: (
                <div className="relative">
                    <Heart size={28} strokeWidth={2.5} />
                    {unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#ff3040] rounded-full border-2 border-black"></div>
                    )}
                </div>
            ),
            label: 'Activity'
        },
        {
            to: `/user/${user?.username}`,
            icon: user?.profile_picture_url ? (
                <img
                    src={`http://127.0.0.1:8000${user.profile_picture_url}`}
                    alt="Profile"
                    className="w-7 h-7 rounded-full object-cover border border-white/20"
                />
            ) : (
                <User size={28} strokeWidth={2.5} />
            ),
            label: 'Profile'
        },
    ];

    return (
        <>
            {/* Desktop Side Rail - Sticky */}
            {/* Changed from 'fixed' to 'sticky' for robust grid layout */}
            <aside className="hidden md:flex flex-col sticky top-0 h-screen w-[80px] lg:w-[280px] bg-black border-r border-[#ffffff15] z-50 px-3 py-6 transition-all duration-300 flex-shrink-0">
                {/* Logo */}
                <div className="mb-10 px-3 lg:px-4">
                    <h1 className="hidden lg:block text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent transform hover:scale-105 transition-transform duration-300 origin-left cursor-pointer" onClick={() => navigate('/')}>
                        Social
                    </h1>
                    <div
                        className="lg:hidden w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center cursor-pointer hover:shadow-glow transition-all"
                        onClick={() => navigate('/')}
                    >
                        <span className="text-white font-bold text-xl">S</span>
                    </div>
                </div>

                {/* Nav Items */}
                <div className="flex-1 flex flex-col gap-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `flex items-center gap-4 p-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive
                                    ? 'text-white'
                                    : 'text-[#a3a3a3] hover:text-white hover:bg-[#1a1a1a]'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <div className={`transition-transform duration-200 relative z-10 ${isActive ? 'scale-105' : 'group-hover:scale-105'}`}>
                                        {item.icon}
                                    </div>
                                    <span className={`hidden lg:block font-bold text-[16px] relative z-10 ${isActive ? 'tracking-wide' : ''}`}>
                                        {item.label}
                                    </span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>

                {/* More / Logout */}
                <div className="relative mt-auto">
                    <button
                        onClick={() => setShowMore(!showMore)}
                        className="w-full flex items-center gap-4 p-3.5 rounded-xl text-[#a3a3a3] hover:text-white hover:bg-[#1a1a1a] transition-all group"
                    >
                        <Settings size={28} strokeWidth={2.5} className="group-hover:rotate-90 transition-transform duration-300" />
                        <span className="hidden lg:block font-bold text-[16px]">More</span>
                    </button>

                    {showMore && (
                        <div className="absolute bottom-full left-0 w-full mb-2 bg-[#1a1a1a] border border-[#ffffff15] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-2 transform origin-bottom-left">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 p-3 rounded-lg text-[#ff3040] hover:bg-[#ffffff05] transition-colors text-sm font-bold"
                            >
                                <LogOut size={20} strokeWidth={2.5} />
                                Log out
                            </button>
                        </div>
                    )}
                </div>
            </aside>

            {/* Mobile Bottom Navigation - Fixed */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[68px] bg-black/95 backdrop-blur-2xl border-t border-[#ffffff10] z-50 flex items-center justify-around pb-safe px-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `flex-1 flex flex-col items-center justify-center h-full transition-all active:scale-95 ${isActive ? 'text-white' : 'text-[#555]'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <div className={`${isActive ? 'text-white' : ''} transform transition-transform duration-200`}>
                                {item.icon}
                            </div>
                        )}
                    </NavLink>
                ))}
            </nav>
        </>
    );
};

export default Sidebar;
