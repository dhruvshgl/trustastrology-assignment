"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username || !password) {
      alert("Fill all fields");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error);
        return;
      }

      const userId = data._id || data.userId || null;
      if (userId) {
        localStorage.setItem("userId", userId);

        const maxAttempts = 3;
        let attempt = 0;
        let sessionId: string | null = null;

        while (attempt < maxAttempts && !sessionId) {
          attempt++;
          try {
            const sessionRes = await fetch("/api/create-sessions", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId }),
            });

            if (!sessionRes.ok) {


              console.warn("create-sessions attempt failed", attempt, sessionRes.status);
              await new Promise((r) => setTimeout(r, 300 * attempt));
              continue;
            }

            const sessionData = await sessionRes.json();
            sessionId = sessionData?.sessionId ?? null;
            if (!sessionId) {

              await new Promise((r) => setTimeout(r, 200 * attempt));
            }
          } catch (e) {

            console.warn("create-sessions error, retrying", attempt, e);
            await new Promise((r) => setTimeout(r, 300 * attempt));
          }
        }

        if (sessionId) {
          router.replace(`/chat/${sessionId}`);
          return;
        }


        const optimisticSessionId = `local_${Date.now().toString(36)}`;

        try {
          localStorage.setItem("sessionId", optimisticSessionId);
        } catch (e) {}

        router.replace(`/chat/${optimisticSessionId}`);
        return;
      }

      alert("Registered successfully. Please login to continue.");
      router.push("/auth/login");
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6 text-gray-700">Create Account</h1>
          <p className="text-gray-500">Start your AI chat journey</p>
        </div>

        <input
          type="text"
          placeholder="Username"
          className="w-full p-2 border border-gray-300 rounded text-gray-500"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border border-gray-300 rounded text-gray-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded font-medium"
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="text-sm text-center text-gray-400">
          Already have an account?{" "}
          <span
            className="text-gray-900 cursor-pointer"
            onClick={() => router.push("/auth/login")}
          >
            Login
          </span>
        </p>

      </div>
    </div>
  );
}