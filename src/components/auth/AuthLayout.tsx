import * as React from "react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps): React.ReactElement {
  return (
    <main
      className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8"
      style={{ backgroundColor: "#FAE5D3" }}
    >

      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>


      <div className="w-full max-w-5xl overflow-hidden rounded-3xl shadow-2xl flex flex-col lg:flex-row animate-in fade-in duration-500">


        <div
          className="hidden lg:flex lg:w-[60%] flex-col items-center justify-between p-10 xl:p-14 relative overflow-hidden"
          style={{ backgroundColor: "#F5D5C0" }}
          aria-hidden="true"
        >

          <div
            className="absolute -top-12 -left-12 h-48 w-48 rounded-full opacity-40"
            style={{ backgroundColor: "#C0697A" }}
          />
          <div
            className="absolute top-1/3 -right-8 h-24 w-24 rounded-full opacity-30"
            style={{ backgroundColor: "#9B2335" }}
          />
          <div
            className="absolute bottom-16 left-8 h-16 w-16 rounded-full opacity-25"
            style={{ backgroundColor: "#C0697A" }}
          />


          <div className="absolute top-8 right-12 grid grid-cols-4 gap-2 opacity-30">
            {Array.from({ length: 16 }).map((_, i) => (
              <div
                key={i}
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: "#9B2335" }}
              />
            ))}
          </div>


          <div className="relative z-10 flex flex-col items-center flex-1 justify-center w-full">
            <div
              className="relative flex items-center justify-center rounded-full"
              style={{
                width: 320,
                height: 320,
                backgroundColor: "rgba(192,105,122,0.18)",
              }}
            >

              <svg
                viewBox="0 0 280 280"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-64 h-64"
              >

                <rect x="60" y="170" width="160" height="10" rx="5" fill="#D4A0A8" />
                <rect x="75" y="100" width="130" height="75" rx="6" fill="#E8C4C8" stroke="#C0697A" strokeWidth="2" />
                <rect x="82" y="107" width="116" height="60" rx="3" fill="#F5D5C0" />
                <rect x="90" y="116" width="60" height="4" rx="2" fill="#C0697A" opacity="0.5" />
                <rect x="90" y="125" width="90" height="4" rx="2" fill="#C0697A" opacity="0.3" />
                <rect x="90" y="134" width="70" height="4" rx="2" fill="#C0697A" opacity="0.4" />
                <rect x="90" y="143" width="50" height="4" rx="2" fill="#C0697A" opacity="0.3" />
                <circle cx="140" cy="95" r="6" fill="#C0697A" opacity="0.4" />
                <rect x="118" y="55" width="44" height="50" rx="8" fill="#F0E0D6" stroke="#D4A0A8" strokeWidth="1.5" />
                <line x1="128" y1="65" x2="152" y2="65" stroke="#D4A0A8" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="126" y1="73" x2="154" y2="73" stroke="#D4A0A8" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="126" y1="81" x2="154" y2="81" stroke="#D4A0A8" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="128" y1="89" x2="152" y2="89" stroke="#D4A0A8" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="140" y1="58" x2="140" y2="105" stroke="#D4A0A8" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="140" cy="38" r="20" fill="#F0E0D6" stroke="#D4A0A8" strokeWidth="1.5" />
                <ellipse cx="133" cy="37" rx="5" ry="6" fill="#5C2D3A" />
                <ellipse cx="147" cy="37" rx="5" ry="6" fill="#5C2D3A" />
                <path d="M138 46 L140 44 L142 46" stroke="#D4A0A8" strokeWidth="1" fill="none" strokeLinecap="round" />
                <rect x="134" y="50" width="4" height="4" rx="0.5" fill="white" stroke="#D4A0A8" strokeWidth="0.5" />
                <rect x="138" y="50" width="4" height="4" rx="0.5" fill="white" stroke="#D4A0A8" strokeWidth="0.5" />
                <rect x="142" y="50" width="4" height="4" rx="0.5" fill="white" stroke="#D4A0A8" strokeWidth="0.5" />

                <path d="M118 65 Q95 75 88 105" stroke="#D4A0A8" strokeWidth="6" strokeLinecap="round" fill="none" />

                <path d="M162 65 Q185 75 192 105" stroke="#D4A0A8" strokeWidth="6" strokeLinecap="round" fill="none" />

                <ellipse cx="88" cy="110" rx="8" ry="6" fill="#F0E0D6" stroke="#D4A0A8" strokeWidth="1.5" />

                <ellipse cx="192" cy="110" rx="8" ry="6" fill="#F0E0D6" stroke="#D4A0A8" strokeWidth="1.5" />


                <rect x="28" y="75" width="64" height="24" rx="8" fill="#9B2335" opacity="0.85" />
                <circle cx="32" cy="99" r="4" fill="#9B2335" opacity="0.85" />
                <circle cx="44" cy="87" r="3" fill="white" opacity="0.7" />
                <circle cx="54" cy="87" r="3" fill="white" opacity="0.7" />
                <circle cx="64" cy="87" r="3" fill="white" opacity="0.7" />
                <circle cx="74" cy="87" r="3" fill="white" opacity="0.7" />
                <circle cx="84" cy="87" r="3" fill="white" opacity="0.7" />

                <rect x="188" y="75" width="64" height="24" rx="8" fill="#9B2335" opacity="0.85" />
                <circle cx="248" cy="99" r="4" fill="#9B2335" opacity="0.85" />

                <circle cx="200" cy="87" r="3" fill="white" opacity="0.7" />
                <circle cx="210" cy="87" r="3" fill="white" opacity="0.7" />
                <circle cx="220" cy="87" r="3" fill="white" opacity="0.7" />
                <circle cx="230" cy="87" r="3" fill="white" opacity="0.7" />
                <circle cx="240" cy="87" r="3" fill="white" opacity="0.7" />

                <ellipse cx="105" cy="192" rx="18" ry="8" fill="#C0697A" opacity="0.6" transform="rotate(-30 105 192)" />
                <ellipse cx="95" cy="188" rx="14" ry="6" fill="#9B2335" opacity="0.5" transform="rotate(-50 95 188)" />
                <ellipse cx="175" cy="192" rx="18" ry="8" fill="#D4860A" opacity="0.55" transform="rotate(30 175 192)" />
                <ellipse cx="185" cy="188" rx="14" ry="6" fill="#C0697A" opacity="0.45" transform="rotate(50 185 188)" />

                <ellipse cx="140" cy="196" rx="16" ry="7" fill="#9B2335" opacity="0.4" />


                <circle cx="100" cy="155" r="7" fill="#9B2335" opacity="0.5" />
              </svg>
            </div>
          </div>

          <div className="relative z-10 text-center mt-6">
            <p
              className="text-2xl font-extrabold leading-tight"
              style={{ color: "#5C2D3A" }}
            >
              Turn your ideas into reality with Muhammad Hamza.
            </p>
            <p className="mt-2 text-sm" style={{ color: "#9B6070" }}>
              Start for free and get attractive offers from the community
            </p>
          </div>
        </div>

        <div className="w-full lg:w-[40%] flex flex-col justify-center bg-white dark:bg-gray-950 px-8 py-12 sm:px-10 xl:px-14">
          {children}
        </div>
      </div>
    </main>
  );
}
