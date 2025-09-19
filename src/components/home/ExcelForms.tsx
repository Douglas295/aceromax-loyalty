"use client";

import React from "react";
import Link from "next/link";
import { UserPlus, Gift } from "lucide-react";

export default function JoinNowCTA() {
  return (
    <section className="bg-[#0284c7] py-12 px-4 text-white text-center">
      <h2 className="text-3xl font-bold">Join Aceromax Points+</h2>
      <p className="mt-3 text-lg text-sky-100">
        Gana recompensas cada vez que compres materiales de construcción. ¡Sencillo, rápido y gratificante!
      </p>

      <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
        <Link
          href="/register"
          className="flex items-center justify-center gap-2 bg-white text-sky-700 px-6 py-3 rounded-lg font-semibold"
        >
          <UserPlus /> Register Now
        </Link>
        <Link
          href="#how-it-works"
          className="flex items-center justify-center gap-2 border-2 border-white px-6 py-3 rounded-lg font-semibold"
          onClick={e => {
              e.preventDefault();
              const el = document.getElementById("how-it-works");
              if (el) {
                const y = el.getBoundingClientRect().top + window.pageYOffset - 100;
                window.scrollTo({ top: y, behavior: "smooth" });
              }
          }}
        >
          <Gift /> Learn More
        </Link>
      </div>
    </section>
  );
}
