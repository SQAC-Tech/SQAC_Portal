import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import DashboardLayout from "../../components/common/layout/DashboardLayout";
import MainContent from "../../components/common/layout/MainContent";
import RightPanel from "../../components/common/layout/RightPanel";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { fetchWithAuth } from "../../api/fetchWithAuth";

const API_BASE_URL = "http://localhost:3000";

export default function Notice() {
    const [notices, setNotices] = useState([]);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [image, setImage] = useState("");
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState(null);

    const navigate = useNavigate();

    // ---------- LOGOUT ----------
    const handleLogout = async () => {
        try {
            await fetch(`${API_BASE_URL}/logout`, {
                method: "POST",
                credentials: "include",
            });
        } catch (err) {
            console.error("Logout failed:", err);
        } finally {
            localStorage.removeItem("user");
            navigate("/login"); // ✅ smoother navigation
        }
    };

    // ---------- GET USER ROLE ----------
    async function fetchUser() {
        try {
            const data = await fetchWithAuth(`${API_BASE_URL}/user/role`);
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
            const data = await fetchWithAuth(`${API_BASE_URL}/notices`);
            setNotices(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            toast.error(err.message || "Failed to load notices");
            setNotices([]);
        }
    }

    // ---------- INITIAL LOAD ----------
    useEffect(() => {
        async function init() {
            await fetchUser();
            await fetchNotices();
        }
        init();
    }, []);

    // ---------- CREATE NOTICE ----------
    async function handleCreateNotice({ domain, subdomain }) {
        const trimmedTitle = title.trim();
        const trimmedContent = content.trim();
        const trimmedImage = image.trim();

        // 🔥 Validation
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

        if (trimmedImage && !trimmedImage.startsWith("http")) {
            toast.error("Image must be a valid URL");
            return;
        }

        setLoading(true);

        try {
            await fetchWithAuth(`${API_BASE_URL}/notices/create`, {
                method: "POST",
                body: JSON.stringify({
                    title: trimmedTitle,
                    description: trimmedContent,
                    domain: domain || "Board",
                    subdomain: subdomain || null,
                    image: trimmedImage,
                    link: ""
                })
            });

            toast.success("Notice created 🚀");

            // reset form
            setTitle("");
            setContent("");
            setImage("");

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
        // ✅ ADD THIS HERE
        if (!confirm("Delete this notice?")) return;

        if (!id) return;

        try {
            await fetchWithAuth(`${API_BASE_URL}/notices/${id}`, {
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
                    image={image}
                    setImage={setImage}
                    handleCreate={handleCreateNotice}
                    loading={loading}
                />
            )}
        </DashboardLayout>
    );
}