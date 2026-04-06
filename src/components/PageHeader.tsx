"use client";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

export default function PageHeader({
  eyebrow,
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: PageHeaderProps) {
  return (
    <section className="hero-card">
      <div className="eyebrow">{eyebrow}</div>
      <h1>{title}</h1>
      <p>{description}</p>

      {(primaryHref && primaryLabel) || (secondaryHref && secondaryLabel) ? (
        <div className="hero-actions" style={{ marginTop: 22 }}>
          {primaryHref && primaryLabel ? (
            <a className="pill-button" href={primaryHref}>
              {primaryLabel}
            </a>
          ) : null}

          {secondaryHref && secondaryLabel ? (
            <a className="ghost-button" href={secondaryHref}>
              {secondaryLabel}
            </a>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
