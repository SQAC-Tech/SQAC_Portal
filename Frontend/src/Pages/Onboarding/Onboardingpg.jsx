import {
  User,
  Mail,
  Phone,
  IdCard,
  Briefcase,
  MapPin,
  PenLine,
  LinkedinIcon,
  Instagram,
  Github,
} from "lucide-react";
import { useState } from "react";
import axios from "axios";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const steps = ["Basic", "Academic", "Social", "Address"];

/* ---------------- STEPS ---------------- */

function StepOne({ formData, setFormData }) {
  return (
    <div className="space-y-4">
      <Input icon={<User size={18} />} placeholder="Full Name*"
        value={formData.name}
        onChange={(val) => setFormData({ ...formData, name: val })} />

      <Input placeholder="Register Number*"
        value={formData.regno}
        onChange={(val) => setFormData({ ...formData, regno: val })} />

      <Input icon={<Mail size={18} />} placeholder="Email*"
        value={formData.email}
        onChange={(val) => setFormData({ ...formData, email: val })} />

      <Input icon={<Phone size={18} />} placeholder="Phone Number*"
        value={formData.phone}
        onChange={(val) => setFormData({ ...formData, phone: val })} />
    </div>
  );
}

function StepTwo({ formData, setFormData }) {
  return (
    <div className="space-y-4">
      <Input icon={<IdCard size={18} />} placeholder="Core Domain*"
        value={formData.coreDomain}
        onChange={(val) => setFormData({ ...formData, coreDomain: val })} />

      <Input placeholder="Sub Domain*"
        value={formData.subDomain}
        onChange={(val) => setFormData({ ...formData, subDomain: val })} />

      <Input icon={<Briefcase size={18} />} placeholder="Position*"
        value={formData.position}
        onChange={(val) => setFormData({ ...formData, position: val })} />
    </div>
  );
}

function StepThree({ formData, setFormData }) {
  return (
    <div className="space-y-4">
      <Input icon={<LinkedinIcon size={18} />} placeholder="LinkedIn*"
        value={formData.linkedin}
        onChange={(val) => setFormData({ ...formData, linkedin: val })} />

      <Input icon={<Instagram size={18} />} placeholder="Instagram"
        value={formData.instagram}
        onChange={(val) => setFormData({ ...formData, instagram: val })} />

      <Input icon={<Github size={18} />} placeholder="GitHub*"
        value={formData.github}
        onChange={(val) => setFormData({ ...formData, github: val })} />

      <TextArea icon={<PenLine size={18} />} placeholder="Short Bio" rows={4}
        value={formData.bio}
        onChange={(val) => setFormData({ ...formData, bio: val })} />
    </div>
  );
}

function StepFour({ formData, setFormData }) {
  return (
    <TextArea icon={<MapPin size={18} />} placeholder="Address*" rows={3}
      value={formData.address}
      onChange={(val) => setFormData({ ...formData, address: val })} />
  );
}

/* ---------------- MAIN ---------------- */

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    regno: "",
    coreDomain: "",
    subDomain: "",
    position: "",
    linkedin: "",
    instagram: "",
    github: "",
    address: "",
    bio: "",
  });

  const submitForm = async () => {
    const payload = {
      name: formData.name,
      regNum: formData.regno,
      email: formData.email,
      phoneNumber: formData.phone,
      coreDomain: formData.coreDomain,
      subDomain: formData.subDomain,
      position: formData.position,
      address: formData.address,
      bio: formData.bio,
      socials: {
        linkedin: formData.linkedin,
        instagram: formData.instagram,
        github: formData.github,
      },
    };

    try {
      await axios.post("http://localhost:3000/user/create", payload);

      toast.success("User stored successfully 🎉", {
        position: "top-right",
        autoClose: 3000,
      });

    } catch (err) {
      toast.error("Submission failed ❌", {
        position: "top-right",
        autoClose: 3000,
      });
      console.error(err);
    }
  };

  return (
    <>
      <ToastContainer />

      <div className="min-h-screen flex
        bg-gradient-to-br from-[#FFE3C2] via-[#FFB7A5] to-[#F76C8A]">

        {/* LEFT SIDEBAR */}
        <div className="hidden md:flex w-1/3 px-10 py-12 flex-col justify-between
          bg-gradient-to-br from-[#F76C8A] via-[#F4A261] to-[#C83A4A] text-white">

          <div>
            <h1 className="text-3xl font-bold mb-3">Let’s get you started</h1>
            <p className="text-white/80 italic text-sm max-w-xs">
              Where Code Meets Quality
            </p>

            <div className="flex gap-2 mt-8">
              {steps.map((_, i) => (
                <span key={i}
                  className={`h-1 w-10 rounded-full ${
                    i <= step ? "bg-white" : "bg-white/40"
                  }`}
                />
              ))}
            </div>
          </div>

          <p className="text-xs text-white/70">
            © {new Date().getFullYear()} SQAC. All rights reserved.
          </p>
        </div>

        {/* RIGHT FORM */}
        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-xl bg-white/80 backdrop-blur-xl
            p-8 rounded-2xl shadow-xl border border-white/40">

            <h2 className="text-3xl font-bold text-[#C83A4A] mb-1">
              Member Onboarding
            </h2>

            <p className="text-sm text-gray-600 mb-6">
              Step {step + 1} of {steps.length}
            </p>

            {step === 0 && <StepOne formData={formData} setFormData={setFormData} />}
            {step === 1 && <StepTwo formData={formData} setFormData={setFormData} />}
            {step === 2 && <StepThree formData={formData} setFormData={setFormData} />}
            {step === 3 && <StepFour formData={formData} setFormData={setFormData} />}

            <div className="flex justify-between mt-10">
              <button
                disabled={step === 0}
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 rounded border disabled:opacity-40"
              >
                Back
              </button>

              <button
                onClick={() =>
                  step === steps.length - 1 ? submitForm() : setStep(step + 1)
                }
                className="px-6 py-2 rounded text-white
                  bg-gradient-to-r from-[#F4A261] to-[#C83A4A]
                  hover:scale-[1.03] transition"
              >
                {step === steps.length - 1 ? "Submit" : "Next"}
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

/* ---------------- INPUTS ---------------- */

function Input({ icon, placeholder, value, onChange }) {
  return (
    <div className="flex items-center gap-2 border rounded-lg px-4 py-3
      bg-white focus-within:ring-2 focus-within:ring-[#F76C8A]">
      {icon}
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full outline-none text-sm"
      />
    </div>
  );
}

function TextArea({ icon, placeholder, rows, value, onChange }) {
  return (
    <div className="flex gap-2 border rounded-lg px-4 py-3
      bg-white focus-within:ring-2 focus-within:ring-[#F76C8A]">
      {icon}
      <textarea
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full outline-none resize-none text-sm"
      />
    </div>
  );
}
