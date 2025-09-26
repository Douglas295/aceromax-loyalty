import React from "react";
import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="w-full">
      <div className="relative w-full min-h-[500px] sm:min-h-[600px] md:min-h-[700px] lg:min-h-[800px] xl:min-h-[900px]">
        <Image
          src="https://aceromax.mx/wp-content/uploads/2024/07/Distribuidores-exclusivos-7.svg"
          alt="Hero Banner"
          layout="fill"
          objectFit="cover"
          priority
        />
      </div>
    </section>
  );
}
