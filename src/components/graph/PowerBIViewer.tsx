"use client"

import React from "react"; 
import Image from 'next/image';
import MonthPicker from "../ui/MonthPicker";

export default function PowerBIViewer({
  selectedMonth,
  setSelectedMonth,
}: {
  selectedMonth: string;
  setSelectedMonth: (value: string) => void;
}) {
   return (
    <>
      <div className="flex flex-col sm:flex-row items-center justify-center mb-5 gap-4">
        <span className="text-[30px] font-bold text-[#1f2937]">
          Financial Dashboard
        </span>
        <MonthPicker value={selectedMonth} onChange={setSelectedMonth} />
      </div>
      <div className="relative w-full h-full aspect-[8/25] sm:aspect-[16/9] mx-auto border-2 border-gray-200 shadow-md">
        <picture>
          <source
            media="(max-width: 640px)"
            srcSet="/images/graph2.png"
          />
          <Image
            src="/images/graph.png"
            alt="Film equipment landing"
            className="object-contain w-full h-full"
            fill
            priority
          />
        </picture>
      </div>
    </>
  )
} 