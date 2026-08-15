import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import DashboardLayout from "../../components/common/layout/DashboardLayout";
import MainContent from "../../components/common/layout/MainContent";
import RightPanel from "../../components/common/layout/RightPanel";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { fetchWithAuth } from "../../api/fetchWithAuth";
import { usePermissions } from "../../utils/usePermissions";
import { clearSession } from "../../api/session";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function Notice() {
    const { canSendNotice } = usePermissions();
    const [notices, setNotices] = useState([]);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [editId, setEditId] = useState(null);

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
            clearSession();
            navigate("/login");
        }
    };

    const canCreate = canSendNotice;
    const canManage = canSendNotice;

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

    // All notices are shown to everyone on the noticeboard.
    const filteredNotices = notices;

    // ---------- INITIAL LOAD ----------
    useEffect(() => {
        fetchNotices();
    }, []);

    // ---------- CREATE / EDIT NOTICE ----------
    async function handleSaveNotice({ domain, subdomain }) {
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
            const payload = {
                title: trimmedTitle,
                description: trimmedContent,
                domain: domain || "Board",
                subdomain: subdomain || null,
            };

            if (editId) {
                await fetchWithAuth(`${API_BASE_URL}/notices/${editId}`, {
                    method: "PUT",
                    body: JSON.stringify(payload),
                });
            } else {
                await fetchWithAuth(`${API_BASE_URL}/notices/create`, {
                    method: "POST",
                    body: JSON.stringify(payload),
                });
            }

            toast.success(editId ? "Notice updated" : "Notice created");

            // reset form
            setTitle("");
            setContent("");
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
    }

    function handleCancelEdit() {
        setEditId(null);
        setTitle("");
        setContent("");
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
                    handleCreate={handleSaveNotice}
                    loading={loading}
                    isEditing={!!editId}
                    onCancelEdit={handleCancelEdit}
                />
            )}
        </DashboardLayout>
    );
}