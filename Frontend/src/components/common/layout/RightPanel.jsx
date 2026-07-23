import { useState, useEffect } from "react";

// Domain / sub-domain names must match the values stored on user profiles
// (see Onboarding), otherwise notice targeting silently fails to match members.
const domainMap = {
    Board: [],
    Technical: ["Web Development", "App Development", "AI/ML"],
    Corporate: ["Events", "Media", "Sponsorships"]
};

export default function RightPanel({
    title,
    content,
    setTitle,
    setContent,
    image,
    setImage,
    handleCreate,
    loading,
    isEditing,
    onCancelEdit
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
        <div className="w-96 bg-[#0c0f1a] p-6 border-l border-white/10 flex flex-col gap-4">

            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-xl font-semibold text-white">{isEditing ? "Edit Notice" : "New Notice"}</h2>
                    <p className="text-sm text-gray-400">
                        {isEditing ? "Update your announcement" : "Publish announcements for your team"}
                    </p>
                </div>
                {isEditing && (
                    <button
                        onClick={onCancelEdit}
                        className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition"
                    >
                        Cancel
                    </button>
                )}
            </div>

            {/* Title */}
            <div>
                <label className="text-sm text-gray-400 mb-1 block">Title</label>
                <input
                    className="w-full p-3 rounded-xl bg-[#1b1f2b] text-white border border-white/10 focus:ring-2 focus:ring-pink-500"
                    placeholder="Enter headline..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </div>

            {/* Description */}
            <div>
                <label className="text-sm text-gray-400 mb-1 block">Description</label>
                <textarea
                    className="w-full p-3 rounded-xl bg-[#1b1f2b] text-white border border-white/10 h-28 focus:ring-2 focus:ring-pink-500 resize-none"
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
                    className="w-full p-3 rounded-xl bg-[#1b1f2b] text-white border border-white/10 focus:ring-2 focus:ring-pink-500"
                />
            </div>

            {/* Domain Dropdown */}
            <div>
                <label className="text-sm text-gray-400 mb-1 block">Domain</label>
                <select
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="w-full p-3 rounded-xl bg-[#1b1f2b] text-white border border-white/10"
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
            w-full p-3 rounded-xl text-white border border-white/10
            ${subdomains.length === 0
                            ? "bg-gray-700 cursor-not-allowed text-gray-500"
                            : "bg-[#1b1f2b]"
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
                w-full py-3 rounded-xl font-medium text-white mt-4
                bg-gradient-to-r ${isEditing ? 'from-blue-500 to-indigo-500' : 'from-pink-500 to-purple-500'}
                transition-all duration-200
            ${loading
                        ? "opacity-60 cursor-not-allowed"
                        : "hover:scale-[1.03] active:scale-[0.96] hover:shadow-lg"
                    }
        `}
            >
                {loading ? (isEditing ? "Updating..." : "Publishing...") : (isEditing ? "Update Notice" : "Publish Notice")}
            </button>
        </div>
    );
}