"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Search } from "lucide-react";
import AuthButton from "./auth-button";
import SearchOverlay from "./SearchOverlay";
import Logo from "./Logo";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // ⌘K / Ctrl+K to open search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
    {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    <header className="bg-navy border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        <Link href="/" aria-label="Careviews home">
          <Logo scheme="white" height={32} />
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/final" className="text-white/60 hover:text-white text-sm font-medium transition">CA Final</Link>
          <Link href="/inter" className="text-white/60 hover:text-white text-sm font-medium transition">CA Inter</Link>
          <Link href="/foundation" className="text-white/60 hover:text-white text-sm font-medium transition">Foundation</Link>
          <Link href="/compare" className="text-white/60 hover:text-white text-sm font-medium transition">Compare</Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => setSearchOpen(true)}
            className="text-white/60 hover:text-white transition p-1"
            aria-label="Search faculties"
          >
            <Search size={18} />
          </button>
          <Link
            href="/review"
            className="bg-gold text-ink text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition"
          >
            Write a Review
          </Link>
          <AuthButton />
        </div>

        <div className="md:hidden flex items-center gap-3">
          <button
            onClick={() => setSearchOpen(true)}
            className="text-white/60 hover:text-white transition"
            aria-label="Search faculties"
          >
            <Search size={20} />
          </button>
          <button
            onClick={() => setOpen(!open)}
            className="text-white"
          >
            {open ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/10 bg-navy">
          <div className="flex flex-col gap-4 p-4">
            <Link href="/final" className="text-white/70 hover:text-white" onClick={() => setOpen(false)}>CA Final</Link>
            <Link href="/inter" className="text-white/70 hover:text-white" onClick={() => setOpen(false)}>CA Inter</Link>
            <Link href="/foundation" className="text-white/70 hover:text-white" onClick={() => setOpen(false)}>Foundation</Link>
            <Link href="/compare" className="text-white/70 hover:text-white" onClick={() => setOpen(false)}>Compare</Link>
            <Link
              href="/review"
              className="bg-gold text-ink text-sm font-semibold px-4 py-3 rounded-lg text-center"
              onClick={() => setOpen(false)}
            >
              Write a Review
            </Link>
            <AuthButton />
          </div>
        </div>
      )}
    </header>
    </>
  );
}
