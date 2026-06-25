"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import AuthButton from "./auth-button";

export default function Navbar() {

    const [open, setOpen] = useState(false);


    return (


        <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50" >
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

                <Link href="/" className="text-white font-extrabold text-xl tracking-tight">
                    <span className="hidden md:inline">
                        CA<span className="text-blue-500">Faculty</span>Reviews
                    </span>

                    <span className="md:hidden">
                        CA<span className="text-blue-500">Reviews</span>
                    </span>
                </Link>

                <nav className="hidden md:flex items-center gap-6">
                    <Link
                        href="/final"
                        className="text-slate-400 hover:text-white text-sm font-medium transition"
                    >
                        CA Final
                    </Link>
                    <Link
                        href="/inter"
                        className="text-slate-400 hover:text-white text-sm font-medium transition"
                    >
                        CA Inter
                    </Link>
                    <Link
                        href="/foundation"
                        className="text-slate-400 hover:text-white text-sm font-medium transition"
                    >
                        Foundation
                    </Link>
                    <Link
                        href="/compare"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                    >
                        Compare
                    </Link>
                </nav>

                <div className="hidden md:block">
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
                <div className="md:hidden border-t border-slate-800 bg-slate-900">
                    <div className="flex flex-col gap-4 p-4">

                        <Link
                            href="/final"
                            className="text-slate-300 hover:text-white"
                            onClick={() => setOpen(false)}
                        >
                            CA Final
                        </Link>

                        <Link
                            href="/inter"
                            className="text-slate-300 hover:text-white"
                            onClick={() => setOpen(false)}
                        >
                            CA Inter
                        </Link>

                        <Link
                            href="/foundation"
                            className="text-slate-300 hover:text-white"
                            onClick={() => setOpen(false)}
                        >
                            Foundation
                        </Link>

                        <Link
                            href="/compare"
                            className="text-slate-300 hover:text-white"
                            onClick={() => setOpen(false)}
                        >
                            Compare
                        </Link>

                        <AuthButton />

                    </div>
                </div>
            )}

        </header>
    )

}