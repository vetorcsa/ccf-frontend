import Image from "next/image";
import { LoginForm } from "./components/LoginForm";

const LOGO_IMAGE_PATH = "/ui/logo.png";
const WATERMARK_IMAGE_PATH = "/ui/login-watermark.png";

export default function Home() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-gradient-to-b from-slate-100 to-slate-50 px-4 py-8 font-sans">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `url(${WATERMARK_IMAGE_PATH})`,
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.95)_0%,_rgba(255,255,255,0)_70%)]"
      />

      <section className="relative z-10 mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-sm flex-col justify-center gap-6 sm:max-w-md sm:gap-7">
        <div className="space-y-2 text-center">
          <div className="mx-auto w-full max-w-[156px] sm:max-w-[184px]">
            <Image
              src={LOGO_IMAGE_PATH}
              alt="CCF"
              width={2816}
              height={1536}
              priority
              className="h-auto w-full"
            />
          </div>
          <p className="text-sm leading-6 text-slate-600 sm:text-base">
            Cálculo de Conformidade Fiscal
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_14px_36px_rgba(15,23,42,0.08)] sm:p-7">
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
