"use client"

import { SignIn } from "@/components/auth";

export default function LogInPage() 
{
  return(
    <div className="w-full max-w-screen-2xl bg-transparent mx-auto flex flex-col items-center p-4 pt-24">
      <SignIn />
    </div>
  )
}