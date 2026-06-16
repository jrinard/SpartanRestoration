import Image from "next/image";
import { Container } from "@/components/ui/Container";

type AssociationLogo = {
  src: string;
  alt: string;
};

type LogoBarV2Props = {
  heading: string;
  logos: AssociationLogo[];
  networkLabel?: string;
  networkHref?: string;
};

/**
 * Association / partner logo strip — BIA, BIAW, NAHB style membership bar.
 */
export function LogoBarV2({ heading, logos, networkLabel, networkHref }: LogoBarV2Props) {
  return (
    <section className="partner-logos-section border-t border-border py-12 lg:py-14">
      <Container className="text-center">
        <h2 className="partner-logos-heading">{heading}</h2>
        <div className="partner-logos">
          {logos.map((logo) => (
            <div key={logo.alt} className="partner-logo-item">
              <Image
                src={logo.src}
                alt={logo.alt}
                width={240}
                height={70}
                className="partner-logo"
              />
            </div>
          ))}
        </div>
        {networkLabel && networkHref && (
          <p className="partner-network-member">
            Proud member of the{" "}
            <a href={networkHref} target="_blank" rel="noopener noreferrer">
              {networkLabel}
            </a>
          </p>
        )}
      </Container>
    </section>
  );
}
