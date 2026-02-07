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
  Lock
} from "lucide-react";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const steps = ["Basic", "Academic", "Social", "Address"];

/* ---------------- STEPS ---------------- */

function StepOne({ formData, setFormData }) {
  return (
    <div className="space-y-4">
      <Input placeholder="Full Name*" value={formData.name}
        onChange={(val) => setFormData({ ...formData, name: val })} />

      <Input placeholder="Register Number*" value={formData.regno}
        onChange={(val) => setFormData({ ...formData, regno: val })} />

      <Input placeholder="Email*" value={formData.email}
        onChange={(val) => setFormData({ ...formData, email: val })} />

      <Input placeholder="Phone Number*" value={formData.phone}
        onChange={(val) => setFormData({ ...formData, phone: val })} />

      <Input
        placeholder="Password*"
        type="password"
        value={formData.password}
        onChange={(val) => setFormData({ ...formData, password: val })}
      />
    </div>
  );
}

function StepTwo({ formData, setFormData }) {
  return (
    <div className="space-y-4">
      <Input placeholder="Core Domain*" value={formData.coreDomain}
        onChange={(val) => setFormData({ ...formData, coreDomain: val })} />

      <Input placeholder="Sub Domain*" value={formData.subDomain}
        onChange={(val) => setFormData({ ...formData, subDomain: val })} />

      <Input placeholder="Position*" value={formData.position}
        onChange={(val) => setFormData({ ...formData, position: val })} />
    </div>
  );
}

function StepThree({ formData, setFormData }) {
  return (
    <div className="space-y-4">
      <Input placeholder="LinkedIn*" value={formData.linkedin}
        onChange={(val) => setFormData({ ...formData, linkedin: val })} />

      <Input placeholder="Instagram" value={formData.instagram}
        onChange={(val) => setFormData({ ...formData, instagram: val })} />

      <Input placeholder="GitHub*" value={formData.github}
        onChange={(val) => setFormData({ ...formData, github: val })} />

      <TextArea placeholder="Short Bio" rows={4}
        value={formData.bio}
        onChange={(val) => setFormData({ ...formData, bio: val })} />
    </div>
  );
}

function StepFour({ formData, setFormData }) {
  return (
    <TextArea placeholder="Address*" rows={3}
      value={formData.address}
      onChange={(val) => setFormData({ ...formData, address: val })} />
  );
}

/* ---------------- MAIN ---------------- */

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    regno: "",
    password: "",
    coreDomain: "",
    subDomain: "",
    position: "",
    linkedin: "",
    instagram: "",
    github: "",
    address: "",
    bio: ""
  });

  const submitForm = async () => {
    const payload = {
      name: formData.name,
      regNum: formData.regno,
      email: formData.email.toLowerCase(),
      phoneNumber: formData.phone,
      password: formData.password,
      coreDomain: formData.coreDomain,
      subDomain: formData.subDomain,
      position: formData.position,
      address: formData.address,
      bio: formData.bio,
      socials: {
        linkedin: formData.linkedin,
        instagram: formData.instagram,
        github: formData.github
      }
    };

    try {
      const res = await axios.post(
        "http://localhost:3000/user/create",
        payload,{withCredentials: true}
      );

      toast.success("Welcome aboard! 🎉", { autoClose: 2000 });

      setTimeout(() => {
        navigate("/");
      }, 1500);

    } catch (err) {
      toast.error(err.response?.data?.error || "Onboarding failed ❌");
      console.error(err);
    }
  };

  return (
    <>
      <ToastContainer />

      <div className="min-h-screen flex bg-gradient-to-br from-[#FFE3C2] via-[#FFB7A5] to-[#F76C8A]">
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
          <div className="w-full max-w-xl bg-white/80 p-8 rounded-2xl shadow-xl">

            <h2 className="text-3xl font-bold text-[#C83A4A] mb-2">
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
                className="px-4 py-2 rounded border disabled:opacity-40">
                Back
              </button>

              <button
                onClick={() =>
                  step === steps.length - 1 ? submitForm() : setStep(step + 1)
                }
                className="px-6 py-2 rounded text-white bg-gradient-to-r from-[#F4A261] to-[#C83A4A]">
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

function Input({ placeholder, value, onChange, type = "text" }) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border rounded-lg px-4 py-3 text-sm"
    />
  );
}

function TextArea({ placeholder, rows, value, onChange }) {
  return (
    <textarea
      rows={rows}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border rounded-lg px-4 py-3 text-sm resize-none"
    />
  );
}
