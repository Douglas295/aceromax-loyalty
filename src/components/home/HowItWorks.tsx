import React from "react";
import { UserPlus, Upload, Gift, Check } from "lucide-react";

const howItWorks = [
  {
    step: "1. Register",
    details: [
      "Sign up with your name, email, and phone number",
      "Link your account to your preferred Aceromax branch",
      "Get access to your personal points dashboard"
    ],
    icon: UserPlus
  },
  {
    step: "2. Shop & Upload",
    details: [
      "Make a purchase at Aceromax and keep your receipt or invoice folio",
      "Upload the folio and amount (with optional photo) in the portal",
      "Admin reviews and approves the purchase to assign points"
    ],
    icon: Upload
  },
  {
    step: "3. Earn & Redeem",
    details: [
      "For every MXN $100 spent, earn 1 point (rounded down)",
      "Each point is worth MXN $0.50 in store credits",
      "Redeem points at checkout by generating a unique code"
    ],
    icon: Gift
  }
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="w-full relative bg-gray-50 my-16 px-4 flex flex-col items-center"
    >
      <h1
        className="flex justify-center items-center text-3xl sm:text-4xl font-bold leading-tight text-gray-800 text-center mb-5"
        tabIndex={-1}
      >
        How Aceromax Works
      </h1>
      <div className="w-full max-w-6xl mx-auto flex flex-col items-center">
        <div className="w-full flex justify-center mb-8">
          <p className="text-lg sm:text-xl font-normal leading-7 text-gray-600 text-center max-w-2xl">
            Earning and redeeming points at Aceromax is simple and rewarding
          </p>
        </div>
        <div className="w-full flex flex-wrap justify-center">
          {howItWorks.map((item, idx) => (
            <div
              key={idx}
              className="flex-1 m-3 min-w-[300px] max-w-sm rounded-xl border border-gray-200 shadow-lg flex flex-col items-start p-8 bg-white"
            >
              <div className="flex flex-col items-center w-full mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <item.icon className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-gray-800 mt-4 w-full text-left">
                  {item.step}
                </p>
              </div>
              <ul className="space-y-4 w-full">
                {item.details.map((detail, i) => (
                  <li key={i} className="flex items-start">
                    <Check className="w-4 h-4 text-green-600 mr-2 mt-1" />
                    <span className="text-base text-gray-700">{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
