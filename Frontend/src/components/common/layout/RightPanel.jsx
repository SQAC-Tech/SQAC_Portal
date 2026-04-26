import { useState, useEffect } from "react";

const domainMap = {
    Board: [],
    Technical: ["Web Dev", "App Dev", "AI/ML"],
    Corporate: ["Sponsorship", "Events"],
    Media: ["Creatives", "PR"]
};

export default function RightPanel({
    title,
    content,
    setTitle,
    setContent,
    image,
    setImage,
    handleCreate,
    loading
}) {
    const [domain, setDomain] = useState("Board");
    const [subdomain, setSubdomain] = useState("");

    const subdomains = domainMap[domain];

    // Reset subdomain when domain changes
    useEffect(() => {
        if (subdomains.length === 0) {
            setSubdomain("");
        } else {
            setSubdomain(subdomains[0]);
        }
    }, [domain]);

    return (
        <div className="w-96 bg-[#111122] p-6 border-l border-white/10 flex flex-col gap-4">

            {/* Header */}
            <div>
                <h2 className="text-xl font-semibold">New Notice</h2>
                <p className="text-sm text-gray-400">
                    Publish announcements for your team
                </p>
            </div>

            {/* Title */}
            <div>
                <label className="text-sm text-gray-400 mb-1 block">Title</label>
                <input
                    className="w-full p-3 rounded-xl bg-[#1b1b2f] border border-white/10 focus:ring-2 focus:ring-pink-500"
                    placeholder="Enter headline..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </div>

            {/* Description */}
            <div>
                <label className="text-sm text-gray-400 mb-1 block">Description</label>
                <textarea
                    className="w-full p-3 rounded-xl bg-[#1b1b2f] border border-white/10 h-28 focus:ring-2 focus:ring-pink-500 resize-none"
                    placeholder="Write your announcement..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
            </div>

            {/* Image URL */}
            <div>
                <label className="text-sm text-gray-400 mb-1 block">Image URL</label>
                <input
                    type="text"
                    placeholder="Paste image link..."
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="w-full p-3 rounded-xl bg-[#1b1b2f] border border-white/10 focus:ring-2 focus:ring-pink-500"
                />
            </div>

            {/* Domain Dropdown */}
            <div>
                <label className="text-sm text-gray-400 mb-1 block">Domain</label>
                <select
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="w-full p-3 rounded-xl bg-[#1b1b2f] border border-white/10"
                >
                    {Object.keys(domainMap).map((d) => (
                        <option key={d} value={d}>
                            {d}
                        </option>
                    ))}
                </select>
            </div>

            {/* Subdomain Dropdown */}
            <div>
                <label className="text-sm text-gray-400 mb-1 block">Subdomain</label>
                <select
                    value={subdomain}
                    onChange={(e) => setSubdomain(e.target.value)}
                    disabled={subdomains.length === 0}
                    className={`
            w-full p-3 rounded-xl border border-white/10
            ${subdomains.length === 0
                            ? "bg-gray-700 cursor-not-allowed"
                            : "bg-[#1b1b2f]"
                        }
                `}
                >
                    {subdomains.length === 0 ? (
                        <option>No subdomain</option>
                    ) : (
                        subdomains.map((sd) => (
                            <option key={sd} value={sd}>
                                {sd}
                            </option>
                        ))
                    )}
                </select>
            </div>

            {/* Button */}
            <button
                onClick={() =>
                    handleCreate({
                        domain,
                        subdomain
                    })
                }
                disabled={loading}
                className={`
                w-full py-3 rounded-xl font-medium text-white
                bg-gradient-to-r from-pink-500 to-purple-500
                transition-all duration-200
            ${loading
                        ? "opacity-60 cursor-not-allowed"
                        : "hover:scale-[1.03] hover:shadow-[0_0_25px_rgba(236,72,153,0.6)] active:scale-[0.96]"
                    }
        `}
            >
                {loading ? "Publishing..." : "Publish Notice"}
            </button>
        </div>
    );
}