import { BENEFIT, type Promo } from "@/lib/promo-meta";

export function BenefitBadge({ type, className = "" }: { type: Promo["benefitType"]; className?: string }) {
  return (
    <span className={`chip display !text-base tracking-wide ${className}`} style={{ background: BENEFIT[type].color }}>
      {BENEFIT[type].label}
    </span>
  );
}
