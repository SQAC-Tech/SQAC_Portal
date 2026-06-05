function timeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);

    const intervals = [
        { label: "y", seconds: 31536000 },
        { label: "mo", seconds: 2592000 },
        { label: "d", seconds: 86400 },
        { label: "h", seconds: 3600 },
        { label: "m", seconds: 60 }
    ];

    for (let i of intervals) {
        const count = Math.floor(seconds / i.seconds);
        if (count > 0) return `${count}${i.label} ago`;
    }

    return "just now";
}

export default function NoticeCard({ notice, isAdmin, onDelete }) {
    return (
        <div className="relative p-5 rounded-2xl bg-[#15152b]/80 border border-white/10 backdrop-blur-md hover:scale-[1.02] transition">

            {/* Glow */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-500/10 to-purple-500/10 blur-xl opacity-30"></div>

            {/* Delete Button */}
            {isAdmin && (
                <button
                    onClick={() => onDelete(notice._id)}
                    className="
                        absolute top-3 right-3
                        text-xs px-2 py-1 rounded-md
                        bg-red-500/20 text-red-400
                        hover:bg-red-500/40 transition
                    "
                >
                    Delete
                </button>
            )}

            {/* Title */}
            <h2 className="text-lg font-semibold">{notice.title}</h2>

            {/* Content */}
            <p className="text-gray-400 mt-3 text-sm leading-relaxed">
                {notice.desc}
            </p>

            {/* Footer */}
            <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
                <span>{timeAgo(notice.createdAt)}</span>
                <span>{notice.author || "Unknown"}</span>
            </div>
        </div>
    );
}