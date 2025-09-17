import React from "react";
import { UserPlus, Upload, Gift, Check } from "lucide-react";

const howItWorks = [
  {
    step: "1. Regístrate",
    details: [
      "Regístrate con tu nombre, correo electrónico y número de teléfono",
      "Vincula tu cuenta con tu sucursal Aceromax preferida",
      "Accede a tu panel personal de puntos"
    ],
    icon: UserPlus
  },
  {
    step: "2. Compra y Sube",
    details: [
      "Realiza una compra en Aceromax y guarda tu recibo o folio de factura",
      "Sube el folio y el monto (con foto opcional) en el portal",
      "El administrador revisa y aprueba la compra para asignar los puntos"
    ],
    icon: Upload
  },
  {
    step: "3. Gana y Canjea",
    details: [
      "Por cada $100 MXN gastados, ganas 1 punto (redondeado hacia abajo)",
      "Cada punto tiene un valor diferente dependiendo de la sucursal",
      "El canje de puntos debe ser realizado por el administrador"
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
