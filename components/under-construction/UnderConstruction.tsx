import Image from "next/image";
import { siteConfig } from "@/config/site";
import { assetExists, getAssetUrl } from "@/lib/assets";

export function UnderConstruction() {
  const hasLogo = assetExists(siteConfig.assets.logo);

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-b from-[#010104] via-[#0a0906] to-[#11100a]">
      {/* Horizon glow — wide planet below */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        aria-hidden="true"
      >
        <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-[#181510] via-[#0e0c08]/65 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[35%] bg-gradient-to-t from-[#f3c35d]/14 via-[#b48130]/6 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[20%] bg-gradient-to-t from-[#efc25b]/8 via-[#8f6120]/4 to-transparent" />
        <div className="absolute -bottom-[55%] left-1/2 h-[90vh] w-[220vw] -translate-x-1/2 rounded-[50%] bg-gradient-to-t from-[#f3c35d]/15 via-[#b48130]/8 to-transparent blur-[80px]" />
        <div className="absolute -bottom-[48%] left-1/2 h-[75vh] w-[180vw] -translate-x-1/2 rounded-[50%] bg-gradient-to-t from-[#efc25b]/10 via-[#8f6120]/5 to-transparent blur-[50px]" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#f3c35d]/25 to-transparent" />
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center pb-[30px]">
        <main className="flex flex-col items-center px-6 text-center">
          <div className="mb-8 w-full max-w-lg">
            <div className="rounded-xl border border-[#438ed2]/15 bg-gradient-to-br from-[#395575]/40 via-[#1a2230]/85 to-[#0a0a0f] px-8 py-10 text-center">
              {hasLogo && (
                <div className="mb-6 flex min-h-[11rem] items-center justify-center sm:min-h-[13rem]">
                  <Image
                    src={getAssetUrl(siteConfig.assets.logo)}
                    alt={siteConfig.name}
                    width={117}
                    height={205}
                    className="h-44 w-auto sm:h-52"
                    priority
                  />
                </div>
              )}
              <div className="under-construction-brand-title font-semibold uppercase tracking-wide" aria-hidden="true">
                <span className="block text-7xl sm:text-[5.25rem]">Spartan</span>
                <span className="block text-4xl sm:text-5xl">Restoration</span>
              </div>
              <div
                className="mx-auto mt-3 h-px w-32 bg-gradient-to-r from-transparent via-[#f3c35d]/60 to-transparent sm:mt-4 sm:w-44"
                aria-hidden="true"
              />
              <p className="sr-only">{siteConfig.name}</p>
              <p className="under-construction-brand-tagline mt-4 text-base font-medium uppercase leading-relaxed sm:text-lg">
                {siteConfig.tagline}
              </p>
            </div>
          </div>

          <h1 className="mt-10 text-3xl font-light tracking-wide text-[#f5f0ed] sm:mt-12 sm:text-4xl">
            Under Construction
          </h1>

          <p className="mt-4 max-w-lg text-xl font-medium leading-relaxed text-white sm:text-2xl">
            Our new site is on the way.
          </p>

          <div className="mt-4 h-px w-16 bg-gradient-to-r from-transparent via-[#f3c35d]/60 to-transparent" />

          <div className="mt-8 grid w-full max-w-3xl gap-8 md:grid-cols-2">
            {siteConfig.teamContacts.map((contact) => (
              <div
                key={contact.name}
                className="rounded-xl border border-[#438ed2]/15 bg-gradient-to-br from-[#395575]/40 via-[#1a2230]/85 to-[#0a0a0f] p-8 text-left"
              >
                <p className="text-xl font-medium text-white sm:text-2xl">{contact.name}</p>
                <div className="mt-5 space-y-3">
                  <p>
                    <a
                      href={`tel:${contact.phone.replace(/\D/g, "")}`}
                      className="text-lg text-white hover:text-[#f3c35d] sm:text-xl"
                    >
                      {contact.phone}
                    </a>
                  </p>
                  <p>
                    <a
                      href={`mailto:${contact.email}`}
                      className="break-all text-base text-white hover:text-[#f3c35d] sm:text-lg"
                    >
                      {contact.email}
                    </a>
                  </p>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-12 text-xs tracking-widest text-[#2c73b5]/80 uppercase">
            {siteConfig.domain}
          </p>
        </main>
      </div>
    </div>
  );
}
