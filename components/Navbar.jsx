"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/services/supabaseClient";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);

  // Get user + listen for auth changes
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest(".avatar-menu")) {
        setOpen(false);
      }
    };
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 border-b border-border/50 bg-background/60 backdrop-blur-2xl">
      <div className="px-10 flex h-16 items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <Link href='/'>
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="logo" width={140} height={200} />
        </div>
        </Link>
        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-10">
          <Link
            href="#features"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-all hover:scale-105"
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-all hover:scale-105"
          >
            How It Works
          </Link>
          <Link
            href="#pricing"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-all hover:scale-105"
          >
            Pricing
          </Link>
        </nav>

        {/* Auth Section */}
        {!user ? (
          <Link href="/auth">
            <Button className="rounded-full px-6 shadow-md hover:shadow-lg transition-all hover:scale-105">
              Sign In
            </Button>
          </Link>
        ) : (
          <div className="relative avatar-menu flex items-center gap-2">
            {/* Avatar + Arrow */}
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-muted transition"
            >
              <Image
                src={user.user_metadata?.avatar_url || "/avatar.png"}
                alt="avatar"
                width={36}
                height={36}
                className="rounded-full border shadow-sm"
              />

              {/* Down Arrow */}
              <svg
                className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${
                  open ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {/* Dropdown */}
            {open && (
              <div className="absolute right-0 top-12 w-56 bg-background/90 backdrop-blur-xl border border-border rounded-xl shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-200">
                {/* User Info */}
                <div className="px-4 py-2 border-b border-border mb-2">
                  <p className="text-sm font-medium truncate">
                    {user.user_metadata?.full_name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>

                {/* Dashboard */}
                <Link href="/dashboard">
                  <div className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg cursor-pointer transition bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium">
                    {/* Icon */}
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M3 13h8V3H3v10zm10 8h8v-6h-8v6zm0-18v6h8V3h-8zM3 21h8v-4H3v4z" />
                    </svg>
                    Dashboard
                  </div>
                </Link>

                {/* Sign Out */}
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition bg-red-50 hover:bg-red-100 text-red-600 font-medium"
                >
                  {/* Icon */}
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
                  </svg>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
