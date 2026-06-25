import React from "react";
import { editableRoles } from "../../utils/memberHelpers";

const MemberEditModal = ({
  editForm,
  editingMember,
  onChange,
  onClose,
  onSave,
  savingEdit,
}) => {
  if (!editingMember) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/65 px-4 backdrop-blur-md">
      <div className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-[#0c0f1a]/95 p-6 shadow-[0_30px_100px_rgba(0,0,0,0.55)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/80">
              Edit Member
            </p>
            <h3 className="mt-2 text-2xl font-bold text-white font-headline">
              {editingMember.name}
            </h3>
            <p className="mt-1 text-sm text-white/55">
              Update role and position from the admin panel.
            </p>
          </div>
          <button
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/70 transition-all hover:bg-white/10 hover:text-white"
            onClick={onClose}
            type="button"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form className="mt-6 space-y-5" onSubmit={onSave}>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-white/45">
              Role
            </span>
            <select
              className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white outline-none transition-all focus:border-primary/60"
              onChange={(event) => onChange("role", event.target.value)}
              value={editForm.role}
            >
              {editableRoles.map((role) => (
                <option className="bg-[#0c0f1a]" key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-white/45">
              Position
            </span>
            <input
              className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-white/30 focus:border-primary/60"
              onChange={(event) => onChange("position", event.target.value)}
              placeholder="Enter member position"
              type="text"
              value={editForm.position}
            />
          </label>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/75 transition-all hover:bg-white/10 hover:text-white"
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="rounded-full bg-gradient-to-r from-primary to-secondary px-6 py-3 text-sm font-bold text-black transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={savingEdit}
              type="submit"
            >
              {savingEdit ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemberEditModal;
