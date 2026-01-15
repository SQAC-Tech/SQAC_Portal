import { User, Mail, Phone,IdCard,Briefcase, MapPin,PenLine, LinkedinIcon, Instagram, Github } from "lucide-react";
import { useState } from "react";

const steps = ["Basic", "Academic", "Social", "Address"];

  /* ---------------- STEPS ---------------- */
function StepOne({ formData, setFormData }) {
    return (
      <div className="space-y-4">
        <Input icon={<User size={18} />}
          placeholder="Full Name*" 
          required 
          value={formData.name}
          onChange={(val) => setFormData({ ...formData, name: val })}/>

        <Input 
          placeholder="Register Number*"
          required 
          value={formData.regno}
          onChange={(val) => setFormData({ ...formData, regno: val })}
         />

        <Input icon={<Mail size={18} />}
          placeholder="Email*"
          required  
          value={formData.email}
          onChange={(val) => setFormData({ ...formData, email: val })}/>

        <Input icon={<Phone size={18} />} 
          placeholder="Phone Number*"
          required 
          value={formData.phone}
          onChange={(val) => setFormData({ ...formData, phone: val })}/>
      </div>
    );
  }

  function StepTwo({ formData, setFormData }) {
    return (
      <div className="space-y-4">
        <Input icon={<IdCard size={18} />}
          placeholder="Core Domain*"
          required 
          value={formData.coreDomain}
          onChange={(val) => setFormData({ ...formData, coreDomain: val })}/>

        <Input 
          placeholder="Sub Domain*" 
          required 
          value={formData.subDomain}
          onChange={(val) => setFormData({ ...formData, subDomain: val })}/>

        <Input icon={<Briefcase size={18} />}
          placeholder="Position*"
          required 
          value={formData.position}
          onChange={(val) => setFormData({ ...formData, position: val })} />
      </div>
    );
  }

  function StepThree({ formData, setFormData }) {
    return (
      <div className="space-y-4">
        <Input icon={<LinkedinIcon size={18} />}
          placeholder="LinkedIn*" 
          required 
          value={formData.linkedin}
          onChange={(val) => setFormData({ ...formData, linkedin: val })} />

        <Input icon={<Instagram size={18} />} 
          placeholder="Instagram" 
          value={formData.instagram}
          onChange={(val) =>setFormData({ ...formData, instagram: val })}/>

        <Input icon={<Github size={18} />} placeholder="GitHub*" 
          required 
          value={formData.github}
          onChange={(val) => setFormData({ ...formData, github: val })} />

        <TextArea icon={<PenLine size={18} />}
          placeholder="Short Bio" rows={4} 
          value={formData.bio}
          onChange={(val) => setFormData({ ...formData, bio: val })}/>
      </div>
    );
  }

  function StepFour({ formData, setFormData }) {
    return (
      <div className="space-y-4">
        <TextArea icon={<MapPin size={18} />} 
          placeholder="Address*"
          required 
          value={formData.address}
          onChange={(val) => setFormData({ ...formData, address: val })} />
      </div>
    );
  }

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

  const isStepValid = () => {
  if (step === 0)
    return formData.name && formData.email && formData.phone && formData.regno;

  if (step === 1)
    return  formData.coreDomain && formData.subDomain && formData.position;

  if (step === 2)
    return formData.linkedin && formData.github;

  if (step === 3)
    return formData.address;

  return false;
};

  return (
    <div className="min-h-screen flex bg-gray-100">

      {/* LEFT SIDEBAR */}
      <div className="hidden md:flex w-1/3 relative bg-gradient-to-br from-indigo-700 via-indigo-600 to-indigo-800 text-white px-10 py-12 flex-col justify-between">       
        <div className="relative">
          <h1 className="text-3xl font-bold mb-3">Let’s get you started</h1>
          <p className="text-indigo-200 italic text-sm max-w-xs">
            Please fill in the details to complete your profile.
          </p>

          {/* SMALL PROGRESS */}
          <div className="flex gap-2 mt-8">
            {steps.map((_, count) => (
              <span
                key={count}
                className={`h-1 w-10 rounded-full transition-all ${
                  count <= step ? "bg-white" : "bg-white/30"
                }`}
              />
            ))}
          </div>
        </div>

        <p className="relative text-xs text-indigo-300">
            © {new Date().getFullYear()} SQAC. All rights reserved. |{" "}
            <a
              href="/privacy-policy"
              className="hover:underline text-blue-400"
            >
              Privacy Policy
            </a>{" "}
            |{" "}
            <a
              href="/terms"
              className="hover:underline text-blue-400"
            >
              Terms & Conditions
            </a>{" "}
            |{" "}
            <a href="https://www.sqac.space/">SQAC Official Website</a>
          </p>
          </div>

      {/* RIGHT FORM AREA */}
      <main className="flex-1 flex items-center justify-center px-6 py-12 ">
        <div
          className="absolute top-0 right-0 w-[400px] h-[300px]
          bg-gradient-to-bl from-indigo-300 via-sky-200 to-transparent
          opacity-60 blur-3xl pointer-events-none"
        />
        <div className="w-full max-w-xl">
          {/* Header */}
          <h2 className="text-3xl font-semibold mb-1">Member Onboarding</h2>
          <p className="text-gray-500 text-sm mb-8">
            Step {step + 1} of {steps.length}
          </p>

          {/* STEPS */}
          {step === 0 && <StepOne formData={formData} setFormData={setFormData} />}
          {step === 1 && <StepTwo formData={formData} setFormData={setFormData} />}
          {step === 2 && <StepThree formData={formData} setFormData={setFormData} />}
          {step === 3 && <StepFour formData={formData} setFormData={setFormData} />}

          <div className="flex justify-between mt-10">
            <button
              disabled={step === 0}
              onClick={() => setStep(step - 1)}
              className="text-sm px-4 py-2 rounded-md border disabled:opacity-40"
            >
              Back
            </button>

            <button 
              // disabled={!isStepValid()} /* ----------------IMPORTANT-UnComment this line after finishing the frontend Testing ---------------- */
              onClick={() => {
              if (step === steps.length - 1) {
                // submit logic later
                console.log("submit form", formData);
              } else {
                setStep(step + 1);
              }
            }}
              className="text-sm px-6 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700
              disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {step === steps.length - 1 ? "Submit" : "Next"}
            </button>
            
          </div>
        </div>
      </main>
    </div>
  );
}

/* ---------------- INPUTS ---------------- */

function Input({ icon, placeholder, required = false, value, onChange= () => {} }) {
  return (
    <div className="flex items-center border rounded-lg px-4 py-3 bg-white focus-within:ring-2 focus-within:ring-blue-600">
      {icon && <span className="text-gray-400 mr-3">{icon}</span>}
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full outline-none text-sm bg-transparent"
      />
    </div>
  );
}

function TextArea({ icon, placeholder, rows = 3,value, onChange = () => {} }) {
  return (
    <div className="flex items-start border rounded-lg px-4 py-3 bg-white focus-within:ring-2 focus-within:ring-indigo-600">
      {icon && <span className="text-gray-400 mr-3 mt-1">{icon}</span>}
      <textarea
        placeholder={placeholder}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full outline-none text-sm resize-none bg-transparent"
      />
    </div>
  );
}

