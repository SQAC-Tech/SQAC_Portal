import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import DashboardLayout from "../../components/common/layout/DashboardLayout";
import MainContent from "../../components/common/layout/MainContent";
import RightPanel from "../../components/common/layout/RightPanel";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { fetchWithAuth } from "../../api/fetchWithAuth";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function Notice() {
    const [notices, setNotices] = useState([]);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [image, setImage] = useState("");
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState(null);
    const [editId, setEditId] = useState(null);

    const [currentUser, setCurrentUser] = useState(null);

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
            navigate("/login");
        }
    };

    // ---------- GET USER PROFILE ----------
    async function fetchUser() {
        try {
            const data = await fetchWithAuth(`${API_BASE_URL}/user/profile`);
            if (data && data.user) {
                setCurrentUser(data.user);
                setRole(data.user.role);
            }
        } catch (err) {
            console.error(err);
            setRole(null);
        }
    }

    const canCreate = role === "admin" || role === "subadmin" || role === "lead";
    const canManage = role === "admin"; // Admin can Edit and Delete

    // ---------- GET NOTICES ----------
    async function fetchNotices() {
        try {
            const data = await fetchWithAuth(`${API_BASE_URL}/notices`);
            setNotices(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            // Hide error for regular users who just don't have access
            if (role !== "user") {
                toast.error(err.message || "Failed to load notices");
            }
            setNotices([]);
        }
    }

    // ---------- FILTER NOTICES ----------
    const filteredNotices = notices.filter(notice => {
        if (canManage) return true; // Admin sees all notices to manage them

        const nDomain = notice.domain;
        const nSub = notice.subDomain || notice.subdomain;

        const uDomain = currentUser?.coreDomain;
        const uSub = currentUser?.subDomain || currentUser?.subdomain;

        // "Board" is treated as global announcements for everyone
        if (nDomain === "Board") return true;

        if (nDomain !== uDomain) return false;

        // If notice has a specific subdomain (and it's not "No subdomain"), it must match user's subdomain
        if (nSub && nSub !== "No subdomain" && nSub !== uSub) return false;

        return true;
    });

    // ---------- INITIAL LOAD ----------
    useEffect(() => {
        async function init() {
            await fetchUser();
        }
        init();
    }, []);

    useEffect(() => {
        if (role) {
            fetchNotices();
        }
    }, [role]);

    // ---------- CREATE / EDIT NOTICE ----------
    async function handleSaveNotice({ domain, subdomain }) {
        const trimmedTitle = title.trim();
        const trimmedContent = content.trim();
        const trimmedImage = image.trim();

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
            // If editing, we simulate by deleting the old notice first
            if (editId) {
                await fetchWithAuth(`${API_BASE_URL}/notices/${editId}`, {
                    method: "DELETE"
                });
            }

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

            toast.success(editId ? "Notice updated 🚀" : "Notice created 🚀");

            // reset form
            setTitle("");
            setContent("");
            setImage("");
            setEditId(null);

            fetchNotices();

        } catch (err) {
            console.error(err);
            toast.error(err.message || "Save failed");
        } finally {
            setLoading(false);
        }
    }

    // ---------- PREPARE EDIT ----------
    function handleEditClick(notice) {
        setEditId(notice._id);
        setTitle(notice.title || "");
        setContent(notice.desc || "");
        setImage(notice.image || "");
    }

    function handleCancelEdit() {
        setEditId(null);
        setTitle("");
        setContent("");
        setImage("");
    }

    // ---------- DELETE ----------
    async function handleDelete(id) {
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
                notices={filteredNotices}
                onDelete={handleDelete}
                onEdit={handleEditClick}
                canManage={canManage}
            />

            {canCreate && (
                <RightPanel
                    title={title}
                    content={content}
                    setTitle={setTitle}
                    setContent={setContent}
                    image={image}
                    setImage={setImage}
                    handleCreate={handleSaveNotice}
                    loading={loading}
                    isEditing={!!editId}
                    onCancelEdit={handleCancelEdit}
                />
            )}
        </DashboardLayout>
    );
}