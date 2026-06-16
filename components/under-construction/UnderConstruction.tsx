import { Logo } from "@/components/ui/Logo";
import { siteConfig } from "@/config/site";

export function UnderConstruction() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-b from-[#010104] via-[#0a0812] to-[#11101a]">
      {/* Horizon glow — wide planet below */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        aria-hidden="true"
      >
        <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-[#181525] via-[#0e0c14]/65 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[35%] bg-gradient-to-t from-[#6d28d9]/14 via-[#5b4a7a]/6 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[20%] bg-gradient-to-t from-[#7c3aed]/8 via-[#6d5f8a]/4 to-transparent" />
        <div className="absolute -bottom-[55%] left-1/2 h-[90vh] w-[220vw] -translate-x-1/2 rounded-[50%] bg-gradient-to-t from-[#6d28d9]/15 via-[#4c3d6a]/8 to-transparent blur-[80px]" />
        <div className="absolute -bottom-[48%] left-1/2 h-[75vh] w-[180vw] -translate-x-1/2 rounded-[50%] bg-gradient-to-t from-[#7c3aed]/10 via-[#5b4a7a]/5 to-transparent blur-[50px]" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#8b7aa8]/20 to-transparent" />
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center pb-[30px]">
        <main className="flex flex-col items-center px-6 text-center">
          {/* Orbital ring decoration */}
          <div className="relative mb-8 flex animate-float items-center justify-center">
            <div className="animate-pulse-glow absolute -inset-8 rounded-full border border-[#7c3aed]/25" />
            <div className="absolute -inset-4 rounded-full border border-[#a855f7]/15" />
            <Logo
              width={320}
              height={110}
              className="relative w-64 sm:w-80"
              style={{ height: "auto" }}
              priority
            />
          </div>

          <h1 className="text-3xl font-light tracking-wide text-foreground sm:text-4xl">
            Under Construction
          </h1>

          <div className="mt-4 h-px w-16 bg-gradient-to-r from-transparent via-[#a855f7]/60 to-transparent" />

          <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
            Something extraordinary is on the way.
          </p>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted/80">
            {siteConfig.tagline}
          </p>

          <p className="mt-12 text-xs tracking-widest text-muted/50 uppercase">
            {siteConfig.domain}
          </p>
        </main>
      </div>
    </div>
  );
}
