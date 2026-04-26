export default function RightPanel({
    title,
    content,
    setTitle,
    setContent,
    handleCreate
}) {
    return (
        <div className="w-96 bg-[#111122] p-6 border-l border-white/10">

            <h2 className="text-xl font-semibold mb-4">New Notice</h2>

            <input
                className="w-full p-3 mb-4 rounded-xl bg-[#1b1b2f] border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Enter headline..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />

            <textarea
                className="w-full p-3 mb-4 rounded-xl bg-[#1b1b2f] border border-white/10 h-32 focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Write your announcement..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
            />

            <button
                onClick={handleCreate}
                className="
                    w-full py-3 rounded-xl font-medium text-white
                    bg-gradient-to-r from-pink-500 to-purple-500
                    
                    transition-all duration-200 ease-out
                    
                    hover:scale-[1.03]
                    hover:shadow-[0_0_25px_rgba(236,72,153,0.6)]
                    
                    active:scale-[0.96]
                    active:shadow-[0_0_10px_rgba(236,72,153,0.9)]
                    
                    focus:outline-none
                    focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 focus:ring-offset-[#0b0b1a]
                "
            >
                Publish Notice
            </button>
        </div>
    );
}