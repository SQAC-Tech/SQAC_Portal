import Navbar from "./Navbar";

export default function DashboardLayout({ children }) {
    return (
        <div className="flex flex-col min-h-screen bg-[#070910] text-white">
            <Navbar />
            <div className="flex flex-1 overflow-hidden">

                {/* Fixed Sidebar */}
                {children[0]}

                {/* Main + Right Panel Container */}
                <div className="flex flex-1 lg:pl-28">

                    {/* Main Content */}
                    <div className="flex-1 overflow-y-auto relative">
                        {children[1]}
                    </div>

                    {/* Right Panel */}
                    {children[2] && (
                        <div className="hidden lg:block w-96 shrink-0 border-l border-white/10 bg-[#0c0f1a]">
                            {children[2]}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
