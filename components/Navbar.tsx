"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import AuthButton from "./auth-button";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-navy border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        <Link href="/" className="font-playfair text-xl font-bold">
          <span className="text-gold">Care</span><span className="text-white">Views</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/final" className="text-white/60 hover:text-white text-sm font-medium transition">CA Final</Link>
          <Link href="/inter" className="text-white/60 hover:text-white text-sm font-medium transition">CA Inter</Link>
          <Link href="/foundation" className="text-white/60 hover:text-white text-sm font-medium transition">Foundation</Link>
          <Link href="/compare" className="text-white/60 hover:text-white text-sm font-medium transition">Compare</Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/review"
            className="bg-gold text-ink text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition"
          >
            Write a Review
          </Link>
          <AuthButton />
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-white"
        >
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
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
  );
}
