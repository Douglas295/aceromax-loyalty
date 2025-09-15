import React from "react";
import {
  Gift,
  Wallet,
  History,
  BarChart3,
  Users,
  LineChart
} from "lucide-react";

type Benefit = {
  title: string;
  icon: React.ElementType;
  items: {
    heading: string;
    description: string;
    icon: React.ElementType;
  }[];
};

const benefitsData: Benefit[] = [
  {
    title: "For Customers",
    icon: Users,
    items: [
      {
        heading: "Save Money",
        description:
          "Redeem points for discounts on future purchases, turning loyalty into real savings.",
        icon: Wallet
      },
      {
        heading: "Track Your Points",
        description:
          "Easily monitor your balance and transaction history through your personal portal.",
        icon: History
      },
      {
        heading: "Simple Redemption",
        description:
          "Use your points directly in-store with a quick and easy redemption process.",
        icon: Gift
      }
    ]
  },
  {
    title: "For Aceromax",
    icon: BarChart3,
    items: [
      {
        heading: "Boost Loyalty",
        description:
          "Encourage repeat purchases and strengthen long-term customer relationships.",
        icon: Users
      },
      {
        heading: "Customer Insights",
        description:
          "Gather valuable data on purchasing behavior to inform targeted campaigns.",
        icon: LineChart
      },
      {
        heading: "Competitive Edge",
        description:
          "Differentiate Aceromax from local competitors by offering added value.",
        icon: Gift
      }
    ]
  }
];

function BenefitCard({ benefit }: { benefit: Benefit }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md flex flex-col mx-auto lg:mx-0">
      <div className="flex items-center mb-6">
        <div className="bg-sky-100 rounded-full p-3">
          <benefit.icon className="w-11 h-11 text-sky-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 ml-4">
          {benefit.title}
        </h3>
      </div>

      <div className="flex flex-col gap-5">
        {benefit.items.map(({ heading, description, icon: ItemIcon }, i) => (
          <div key={i} className="flex">
            <div className="flex-shrink-0 mr-4 mt-1">
              <ItemIcon className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-800">{heading}</h4>
              <p className="text-gray-600 mt-1">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Benefits() {
  return (
    <section id="benefits" className="bg-gray-50 mb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          Why Choose Aceromax
        </h2>
        <p className="mt-3 max-w-2xl mx-auto text-gray-600 text-lg">
          A loyalty program designed to reward customers and strengthen Aceromax
        </p>
      </div>

      <div className="mt-12 flex flex-col lg:flex-row flex-wrap justify-center gap-8">
        {benefitsData.map((benefit, idx) => (
          <BenefitCard key={idx} benefit={benefit} />
        ))}
      </div>
    </section>
  );
}
