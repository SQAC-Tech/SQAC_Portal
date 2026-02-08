import { useEffect, useState } from "react";
import axios from "axios";


const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});


export default function MemberProfile() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({});
  const [edit, setEdit] = useState(false);

  
  useEffect(() => {
    api.get("/user/me")
      .then(res => {
        const u = res.data;
        setUser(u);
        setForm(mapUserToForm(u));
      })
      .catch(() => console.log("Not logged in"));
  }, []);

  if (!user) return <p className="p-8">Loading...</p>;

  
  const updateField = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    const payload = mapFormToPayload(form);

    const res = await api.put("/user/me", payload);
    setUser(res.data);
    setForm(mapUserToForm(res.data));
    setEdit(false);
  };

  /* ---------- UI ---------- */
  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl border shadow-sm p-8">

        {/* Header */}
        <Header edit={edit} setEdit={setEdit} />

        {/* Sections */}
        <Section title="Personal Information">
          <Input label="Name" value={form.name} disabled={!edit}
            onChange={(v) => updateField("name", v)} />

          <Input label="Registration Number" value={form.regNum} disabled />
          <Input label="Email" value={form.email} disabled />

          <Input label="Phone" value={form.phoneNumber} disabled={!edit}
            onChange={(v) => updateField("phoneNumber", v)} />
        </Section>

        <Section title="Domain Details">
          <Input label="Core Domain" value={form.coreDomain} disabled={!edit}
            onChange={(v) => updateField("coreDomain", v)} />

          <Input label="Sub Domain" value={form.subDomain} disabled={!edit}
            onChange={(v) => updateField("subDomain", v)} />

          <Input label="Position" value={form.position} disabled={!edit}
            onChange={(v) => updateField("position", v)} />
        </Section>

        <Section title="Socials">
          <Input label="LinkedIn" value={form.linkedin} disabled={!edit}
            onChange={(v) => updateField("linkedin", v)} />

          <Input label="GitHub" value={form.github} disabled={!edit}
            onChange={(v) => updateField("github", v)} />

          <Input label="Instagram" value={form.instagram} disabled={!edit}
            onChange={(v) => updateField("instagram", v)} />
        </Section>

        {/* Other Details */}
        <div className="mt-10">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
            Other Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Textarea label="Address" value={form.address} disabled={!edit}
              onChange={(v) => updateField("address", v)} />

            <Textarea label="Bio" value={form.bio} disabled={!edit}
              onChange={(v) => updateField("bio", v)} />
          </div>
        </div>

        {/* Save */}
        {edit && (
          <div className="flex justify-end mt-10">
            <button
              onClick={handleSave}
              className="px-6 py-2 rounded-md bg-gray-900 text-white text-sm font-medium hover:bg-black transition"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Header({ edit, setEdit }) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h2 className="text-2xl font-semibold">Member Profile</h2>
        <p className="text-sm text-gray-500">
          View and manage your personal information
        </p>
      </div>

      <button
        onClick={() => setEdit(!edit)}
        className={`px-4 py-2 rounded-md text-sm font-medium transition
          ${
            edit
              ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
              : "bg-gray-900 text-white hover:bg-black"
          }`}
      >
        {edit ? "Cancel" : "Edit Profile"}
      </button>
    </div>
  );
}
function Input({ label, value, onChange, disabled, type = "text" }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-500">
        {label}
      </label>

      <input
        type={type}
        value={value || ""}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        className={`
          rounded-md border px-3 py-2 text-sm
          ${disabled
            ? "bg-gray-100 text-gray-700 cursor-not-allowed"
            : "bg-white focus:ring-2 focus:ring-gray-900 focus:outline-none"
          }
        `}
      />
    </div>
  );
}


function Textarea({ label, value, onChange, disabled }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-500">
        {label}
      </label>

      <textarea
        value={value || ""}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        rows={4}
        className={`
          rounded-md border px-3 py-2 text-sm resize-none
          ${disabled
            ? "bg-gray-100 text-gray-700"
            : "bg-white focus:ring-2 focus:ring-gray-900 focus:outline-none"
          }
        `}
      />
    </div>
  );
}

function Section({ title, children })
 { 
    return ( 
    <div className="mt-10">
         <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
             {title}
         </h3> 
         <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
             {children} 
             </div> 
             </div> 
             ); 
}

function mapUserToForm(user) {
  return {
    ...user,
    linkedin: user.socials?.linkedin || "",
    github: user.socials?.github || "",
    instagram: user.socials?.instagram || "",
  };
}



function mapFormToPayload(form) {
  return {
    name: form.name,
    phoneNumber: form.phoneNumber,
    coreDomain: form.coreDomain,
    subDomain: form.subDomain,
    position: form.position,
    address: form.address,
    bio: form.bio,
    socials: {
      linkedin: form.linkedin,
      github: form.github,
      instagram: form.instagram,
    },
  };
}

