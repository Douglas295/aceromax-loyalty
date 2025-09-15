"use client"

import { useState } from "react";
import dynamic from 'next/dynamic'

const PowerBIViewer = dynamic(() => import('@/components/graph/PowerBIViewer'), {
  ssr: false,
})

function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export default function Home() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

  return (
    <>
      <div className="flex flex-col justify-between lg:flex-row bg-transparent pt-24 w-[95%] xl:w-4/5 mx-auto">
        <div className="w-full flex flex-col items-center justify-center">
          <PowerBIViewer 
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
          />
        </div> 
      </div>
    </>
  );
}
