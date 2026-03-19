"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Home() {
  const [username, setUsername] = useState("");
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("turkord_username");
    if (saved) {
      router.push("/chat");
    }
  }, [router]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      localStorage.setItem("turkord_username", username.trim());
      router.push("/chat");
    }
  };

  return (
    <div className="flex h-full w-full items-center justify-center bg-background">
      <div className="flex w-full max-w-sm flex-col items-center gap-8 p-8">
        <div className="flex flex-col items-center gap-4">
          <Image
            src="/logo.png"
            alt="Turkord Logo"
            width={120}
            height={120}
            className="rounded-apple object-cover shadow-sm"
          />
          <h1 className="text-2xl font-semibold tracking-tight text-textMain">
            Turkord
          </h1>
          <p className="text-sm text-gray-500">
            Enter a username to join the space
          </p>
        </div>

        <form onSubmit={handleJoin} className="flex w-full flex-col gap-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-apple border border-gray-200 bg-[#F5F5F7] px-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-all"
            required
            maxLength={20}
          />
          <button
            type="submit"
            className="w-full rounded-apple bg-accent px-4 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-50"
            disabled={!username.trim()}
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
