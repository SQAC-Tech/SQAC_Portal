import Navbar from "./Navbar";

export default function DashboardLayout({ children }) {
    return (
        <div className="flex flex-col min-h-screen bg-[#0b0b1a] text-white">
            <Navbar />
            <div className="flex flex-1 overflow-hidden">

                {/* Fixed Sidebar */}
                {children[0]}

                {/* Main + Right Panel Container */}
                <div className="flex flex-1 lg:pl-20">

                    {/* Main Content */}
                    <div className="flex-1 overflow-y-auto relative">
                        {children[1]}
                    </div>

                    {/* Right Panel */}
                    {children[2] && (
                        <div className="hidden lg:block w-96 shrink-0 border-l border-white/10 bg-[#0f0f22]">
                            {children[2]}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
