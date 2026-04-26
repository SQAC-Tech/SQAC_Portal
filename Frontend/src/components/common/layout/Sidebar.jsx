import { NavLink } from "react-router-dom";

const menuItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Members", path: "/members" },
    { name: "Schedule", path: "/schedule" },
    { name: "Noticeboard", path: "/notice" },
    { name: "Chat", path: "/chat" }
];

export default function Sidebar() {
    return (
        <div className="w-64 bg-[#111122] p-6 flex flex-col justify-between border-r border-white/10">

            {/* Logo */}
            <div>
                <h1 className="text-4xl font-bold text-pink-400 tracking-widest">SQAC</h1>
                <p className="mt-1.5 text-xs text-gray-400 mb-8">CLUB PORTAL</p>

                {/* Menu */}
                <ul className="space-y-2">
                    {menuItems.map((item) => (
                        <li key={item.name}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) =>
                                    `block px-4 py-2 rounded-xl transition-all duration-200
                                    ${isActive
                                        ? "bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-400 border border-pink-500/30 shadow-lg shadow-pink-500/10"
                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                    }`
                                }
                            >
                                {item.name}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}