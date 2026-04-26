import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import DashboardLayout from "../../components/common/layout/DashboardLayout";
import Sidebar from "../../components/common/layout/Sidebar";
import MainContent from "../../components/common/layout/MainContent";
import RightPanel from "../../components/common/layout/RightPanel";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { fetchWithAuth } from "../../api/fetchWithAuth";

export default function Notice() {
    const [notices, setNotices] = useState([]);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState(null);


    const handleLogout = async () => {
        try {
            await fetch(`${API_BASE_URL}/logout`, {
                method: "POST",
                credentials: "include",
            });
        } catch (logoutError) {
            console.error("Logout failed:", logoutError);
        } finally {
            localStorage.removeItem("user");
            window.location.href = "/login";
        }
    };
    
    // ---------- GET USER ROLE (from cookie session) ----------
    async function fetchUser() {
        try {
            const data = await fetchWithAuth("http://localhost:3000/user/role");
            setRole(data.role);
        } catch (err) {
            console.error(err);
            setRole(null);
        }
    }

    const isAdmin =
        role === "admin" || role === "subadmin" || role === "lead";

    // ---------- GET NOTICES ----------
    async function fetchNotices() {
        try {
            const data = await fetchWithAuth("http://localhost:3000/notices");
            setNotices(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            toast.error(err.message || "Failed to load notices");
            setNotices([]);
        }
    }

    useEffect(() => {
        fetchUser();     // 🔥 get role from backend
        fetchNotices();
    }, []);

    // ---------- CREATE NOTICE ----------
    async function handleCreateNotice() {
        const trimmedTitle = title.trim();
        const trimmedContent = content.trim();

        if (!trimmedTitle || !trimmedContent) {
            toast.error("Title and description cannot be empty");
            return;
        }

        if (trimmedTitle.length < 3) {
            toast.error("Title must be at least 3 characters");
            return;
        }

        if (trimmedContent.length < 5) {
            toast.error("Description must be at least 5 characters");
            return;
        }

        setLoading(true);

        try {
            await fetchWithAuth("http://localhost:3000/notices/create", {
                method: "POST",
                body: JSON.stringify({
                    title: trimmedTitle,
                    description: trimmedContent,
                    domain: "general",
                    subdomain: "all",
                    image: "",
                    link: ""
                })
            });

            toast.success("Notice created 🚀");

            setTitle("");
            setContent("");
            fetchNotices();

        } catch (err) {
            console.error(err);
            toast.error(err.message || "Create failed");
        } finally {
            setLoading(false);
        }
    }

    // ---------- DELETE ----------
    async function handleDelete(id) {
        try {
            await fetchWithAuth(`http://localhost:3000/notices/${id}`, {
                method: "DELETE"
            });

            toast.success("Deleted successfully 🗑️");
            fetchNotices();

        } catch (err) {
            console.error(err);
            toast.error(err.message || "Delete failed");
        }
    }

    return (
        <DashboardLayout>
            {/* <Sidebar /> */}
            <AdminSidebar onLogout={handleLogout} />

            <MainContent
                notices={notices}
                onDelete={handleDelete}
                isAdmin={isAdmin}
            />

            {isAdmin && (
                <RightPanel
                    title={title}
                    content={content}
                    setTitle={setTitle}
                    setContent={setContent}
                    handleCreate={handleCreateNotice}
                    loading={loading}
                />
            )}
        </DashboardLayout>
    );
}