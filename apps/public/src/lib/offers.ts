import type { Offer } from "@/types";

export function isOfferCurrentlyActive(offer: Pick<Offer, "is_active" | "start_date" | "end_date">, now = Date.now()) {
  if (!offer.is_active) return false;
  const startsAt = offer.start_date ? new Date(offer.start_date).getTime() : null;
  const endsAt = offer.end_date ? new Date(offer.end_date).getTime() : null;
  return (startsAt === null || (Number.isFinite(startsAt) && startsAt <= now))
    && (endsAt === null || (Number.isFinite(endsAt) && endsAt > now));
}
