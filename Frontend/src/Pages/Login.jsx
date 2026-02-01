import { Link } from "react-router-dom";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:3000/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        console.log("Login successful");
        // Redirect to dashboard or home page
        window.location.href = "/dashboard"; // Adjust as needed
      } else {
        setError(data.message || "Login failed");
      }
    } catch (error) {
      setError("Network error. Please try again.");
      console.error("Login error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="shadow-lg w-full max-w-md rounded-2xl bg-white p-8 dark:bg-black">
        <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
          SQAC PORTAL
        </h2>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
          Login to your account
        </p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm dark:bg-zinc-800 dark:text-white"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm dark:bg-zinc-800 dark:text-white"
            required
          />

          <button
            type="submit"
            className="w-full rounded-md bg-black py-2 text-white font-medium hover:opacity-90 dark:bg-zinc-800"
          >
            Login →
          </button>
        </form>

        <p className="mt-4 text-sm text-center text-neutral-600 dark:text-neutral-400">
          Don&apos;t have an account?{" "}
          <Link to="/">
            <button className="font-medium text-black dark:text-white underline">
              Sign up
            </button>
          </Link>
        </p>
      </div>
    </div>
  );
}
