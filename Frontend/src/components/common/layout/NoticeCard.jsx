function timeAgo(date) {
    if (!date) return "just now";

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
        <div className="
            relative p-5 rounded-2xl
            bg-white/5
            backdrop-blur-xl
            border border-white/10
            shadow-[0_8px_30px_rgba(0,0,0,0.3)]
            hover:scale-[1.02]
            hover:border-pink-500/30
            transition-all duration-300
            h-fit
        ">

            {/* Glow layer */}
            <div className="
                absolute inset-0 rounded-2xl
                bg-gradient-to-br from-pink-500/10 via-transparent to-purple-500/10
                opacity-40
            "></div>

            {/* Content wrapper */}
            <div className="relative z-10 flex flex-col gap-2">

                {/* Delete Button */}
                {isAdmin && (
                    <button
                        onClick={() => onDelete(notice._id)}
                        className="
                            absolute top-0 right-0
                            text-xs px-2 py-1 rounded-md
                            bg-red-500/20 text-red-400
                            hover:bg-red-500/40
                            transition
                        "
                    >
                        Delete
                    </button>
                )}

                {/* Title */}
                <h2 className="text-lg font-semibold text-white">
                    {notice.title}
                </h2>

                {/* Description */}
                <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
                    {notice.desc}
                </p>

                {/* Footer */}
                <div className="flex justify-between mt-3 text-xs text-gray-500">
                    <span>{timeAgo(notice.createdAt)}</span>
                    <span className="text-pink-400 font-medium">
                        {notice.author || "Unknown"}
                    </span>
                </div>

            </div>
        </div>
    );
}