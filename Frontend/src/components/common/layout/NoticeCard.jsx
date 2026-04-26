export default function NoticeCard({ notice }) {
    return (
        <div className="relative p-5 rounded-2xl bg-[#15152b]/80 border border-white/10 backdrop-blur-md hover:scale-[1.02] transition">

            {/* Glow */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-500/10 to-purple-500/10 blur-xl opacity-30"></div>

            <h2 className="text-lg font-semibold">{notice.title}</h2>

            <p className="text-gray-400 mt-3 text-sm leading-relaxed">
                {notice.content}
            </p>

            <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
                <span>2h ago</span>
                <span>Admin</span>
            </div>
        </div>
    );
}