import { Link } from "react-router-dom";



export default function Login() {
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login submitted");
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
          <input
            type="email"
            placeholder="Email address"
            className="w-full rounded-md border px-3 py-2 text-sm dark:bg-zinc-800 dark:text-white"
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-md border px-3 py-2 text-sm dark:bg-zinc-800 dark:text-white"
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
          <Link to="/"><button
            className="font-medium text-black dark:text-white underline"
          >
            Sign up
          </button></Link>
        </p>

      </div>
    </div>
  );
}


