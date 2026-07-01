import Image from "next/image";
import { siteConfig } from "@/config/site";
import type { TeamContact } from "@/config/site";
import { assetExists, getAssetUrl } from "@/lib/assets";

function getDisplayContacts(): TeamContact[] {
  if (siteConfig.teamContacts.length > 0) {
    return siteConfig.teamContacts;
  }

  if (!siteConfig.phone && !siteConfig.email) {
    return [];
  }

  return [
    {
      name: siteConfig.name,
      phone: siteConfig.phone,
      email: siteConfig.email,
    },
  ];
}

export function UnderConstruction() {
  const hasLogo = assetExists(siteConfig.assets.logo);
  const brandTitleLines =
    siteConfig.underConstruction.brandTitleLines ?? [siteConfig.name];
  const contacts = getDisplayContacts();

  return (
    <div className="under-construction relative flex min-h-screen flex-col overflow-hidden">
      <div className="under-construction-glow pointer-events-none absolute inset-0 z-0" aria-hidden="true" />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center pb-[30px]">
        <main className="flex flex-col items-center px-6 text-center">
          <div className="mb-8 w-full max-w-lg">
            <div className="under-construction-card px-8 py-10 text-center">
              {hasLogo && (
                <div className="mb-6 flex min-h-[11rem] items-center justify-center sm:min-h-[13rem]">
                  <Image
                    src={getAssetUrl(siteConfig.assets.logo)}
                    alt={siteConfig.name}
                    width={320}
                    height={110}
                    className="h-44 w-auto max-w-full sm:h-52"
                    priority
                  />
                </div>
              )}

              <div className="under-construction-brand-title font-semibold uppercase tracking-wide">
                {brandTitleLines.map((line, index) => (
                  <span
                    key={line}
                    className={
                      index === 0 && brandTitleLines.length > 1
                        ? "block text-5xl sm:text-7xl"
                        : index === 0
                          ? "block text-4xl sm:text-5xl"
                          : "block text-3xl sm:text-5xl"
                    }
                  >
                    {line}
                  </span>
                ))}
              </div>

              <div className="under-construction-divider mx-auto mt-3 sm:mt-4" aria-hidden="true" />

              <p className="sr-only">{siteConfig.name}</p>
              <p className="under-construction-brand-tagline mt-4 text-base font-medium uppercase leading-relaxed sm:text-lg">
                {siteConfig.tagline}
              </p>
            </div>
          </div>

          <h1 className="under-construction-headline mt-10 text-3xl font-light tracking-wide sm:mt-12 sm:text-4xl">
            {siteConfig.underConstruction.headline}
          </h1>

          <p className="under-construction-subheadline mt-4 max-w-lg text-xl font-medium leading-relaxed sm:text-2xl">
            {siteConfig.underConstruction.subheadline}
          </p>

          <div className="under-construction-divider mt-4" aria-hidden="true" />

          {contacts.length > 0 && (
            <div
              className={`mt-8 grid w-full max-w-3xl gap-8 ${contacts.length > 1 ? "md:grid-cols-2" : "max-w-md"}`}
            >
              {contacts.map((contact) => (
                <div key={contact.name} className="under-construction-card p-8 text-left">
                  <p className="text-xl font-medium text-white sm:text-2xl">{contact.name}</p>
                  <div className="mt-5 space-y-3">
                    {contact.phone && (
                      <p>
                        <a
                          href={`tel:${contact.phone.replace(/\D/g, "")}`}
                          className="under-construction-link text-lg sm:text-xl"
                        >
                          {contact.phone}
                        </a>
                      </p>
                    )}
                    {contact.email && (
                      <p>
                        <a
                          href={`mailto:${contact.email}`}
                          className="under-construction-link break-all text-base sm:text-lg"
                        >
                          {contact.email}
                        </a>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <p className="under-construction-domain mt-12 text-md uppercase tracking-widest">
            {siteConfig.domain}
          </p>
        </main>
      </div>
    </div>
  );
}
