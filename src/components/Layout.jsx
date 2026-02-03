import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
    return (
        <div className="flex min-h-screen bg-black text-[#f5f5f5] font-sans selection:bg-indigo-500/30">
            {/* Sidebar sits in the flow now because it's sticky/block inside this flex container */}
            <Sidebar />

            {/* Main Content Area */}
            {/* Flex-1 takes remaining width. Min-w-0 prevents flex overflow issues. */}
            <main className="flex-1 min-w-0 relative flex flex-col">
                <div className="flex-1 w-full mx-auto pb-[90px] md:pb-0">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
