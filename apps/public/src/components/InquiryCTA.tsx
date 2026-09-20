import Link from "next/link";

interface InquiryCTAProps {
  productId: string;
  buttonText?: "Ask About This Piece" | "Enquire" | "Get in Touch";
}

export function InquiryCTA({ productId, buttonText = "Ask About This Piece" }: InquiryCTAProps) {
  return (
    <div className="mt-auto">
      <p className="text-sm text-charcoal/70 mb-4 text-center">Seen something you like?</p>
      <Link
        href={`/contact?product_id=${productId}`}
        className="block w-full bg-gold text-white text-center py-3 px-6 rounded-lg font-semibold hover:bg-opacity-90 transition-colors border-b-4 border-dusty-rose"
      >
        {buttonText}
      </Link>
    </div>
  );
}
