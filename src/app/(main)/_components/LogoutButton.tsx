"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => {
        try {
          localStorage.removeItem("userId");
          localStorage.removeItem("token");
        } catch (e) {

        }
  router.push("/auth/login");
      }}
      className="bg-gray-600 text-white px-2 py-0.5 rounded"
    >
      Logout
    </button>
  );
}
