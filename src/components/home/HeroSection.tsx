import React from "react"; 
export default function HeroSection() {
  return (
    <div className="aspect-[2/1] bg-[url(https://aceromax.mx/wp-content/uploads/2024/07/Distribuidores-exclusivos-7.svg)] bg-cover bg-no-repeat p-[14%]">
      <div className="flex flex-col">
      {/* Title Block */}
      <h1
        className="text-2xl md:text-4xl lg:text-6xl font-[400] text-[#555555] font-montserrat transition-opacity duration-1000 ease-in-out ml-4"
      >
        <span className="block font-[200]">
          Purchase
        </span>
        <span className="text-[#8A782D]"> Many Items </span>
        <div>
          <span className="font-[200] text-[#555555]">
            for the
          </span>
        </div>
        <div>
          <span className="text-[#8A782D]">Future</span>
        </div>
      </h1>

      {/* CTA Button */}
      <div className="mt-2 sm:mt-6">
        <a
          href="/graph"
          className="inline-block hover:font-[700] btn-intro text-white text-[12px] sm:text-[16px] px-4 py-2 sm:px-6 sm:py-3 shadow hover:opacity-90 transition rounded-full"
        >
          Finance Analysis &gt;
        </a>
      </div>
      {/* CTA Button */}
      <div className="mt-1 sm:mt-2">
        <a
          href="/graph"
          className="inline-block hover:font-[700] btn-intro text-white text-[12px] sm:text-[16px] px-4 py-2 sm:px-6 sm:py-3 shadow hover:opacity-90 transition rounded-full"
        >
          Purchase Stuff &gt;
        </a>
      </div>


      </div>
    </div>
  );
}
