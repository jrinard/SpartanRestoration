import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";

type WashingTestimonial = {
  name: string;
  quote: string;
  rating: number;
  href?: string;
};

type AssociationLogo = {
  src: string;
  alt: string;
};

type TestimonialsV3Props = {
  heading?: string;
  testimonials: WashingTestimonial[];
  associationHeading?: string;
  associationLogos?: AssociationLogo[];
  networkLabel?: string;
  networkHref?: string;
  backgroundImage?: string;
};

function Stars({ count }: { count: number }) {
  return (
    <strong className="testimonial-washing-stars" aria-label={`${count} out of 5 stars`}>
      {"★".repeat(count)}
    </strong>
  );
}

function AuthorName({ name, href }: { name: string; href?: string }) {
  if (href) {
    return (
      <strong className="testimonial-washing-author">
        <Link href={href} target="_blank" rel="noopener noreferrer">
          {name}
        </Link>
      </strong>
    );
  }
  return <strong className="testimonial-washing-author">{name}</strong>;
}

/**
 * "What Customers Say" with partner logos — matches OSP testimonials section.
 */
export function TestimonialsV3({
  heading = "What Customers Say",
  testimonials,
  associationHeading,
  associationLogos,
  networkLabel,
  networkHref,
  backgroundImage = "/osp/PrismBg1-white.jpg",
}: TestimonialsV3Props) {
  return (
    <section
      className="testimonials-washing"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="testimonials-washing-wrapper">
        <h2>{heading}</h2>
        <div className="testimonials-washing-grid">
          {testimonials.map((item) => (
            <blockquote key={item.name} className="testimonial-washing-card">
              <AuthorName name={item.name} href={item.href} />
              <Stars count={item.rating} />
              <p className="testimonial-washing-text">&ldquo;{item.quote}&rdquo;</p>
            </blockquote>
          ))}
        </div>

        {associationHeading && associationLogos && associationLogos.length > 0 && (
          <div className="partner-logos-section">
            <h2 className="partner-logos-heading">{associationHeading}</h2>
            <div className="partner-logos">
              {associationLogos.map((logo) => (
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
          </div>
        )}
      </div>
    </section>
  );
}
