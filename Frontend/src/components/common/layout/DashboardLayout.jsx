export default function DashboardLayout({ children }) {
    return (
        <div className="flex h-screen bg-[#0b0b1a] text-white">

            {/* Sidebar */}
            <div className="w-64 shrink-0 border-r border-white/10">
                {children[0]}
            </div>

            {/* Main + Right Panel */}
            <div className="flex flex-1">

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto">
                    {children[1]}
                </div>

                {/* Right Panel */}
                <div className="w-96 shrink-0 border-l border-white/10 bg-[#0f0f22]">
                    {children[2]}
                </div>

            </div>
        </div>
    );
}