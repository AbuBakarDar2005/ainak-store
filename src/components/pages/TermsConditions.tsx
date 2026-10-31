import React from 'react';
import { FileText, RotateCcw, Truck, Eye, ArrowLeft } from 'lucide-react';

interface TermsConditionsProps {
  onBack: () => void;
}

export const TermsConditions: React.FC<TermsConditionsProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-white py-12 px-6 max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="mb-8 text-xs font-semibold text-luxury-500 hover:text-luxury-950 flex items-center gap-1.5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Storefront
      </button>

      <div className="border-b border-luxury-100 pb-6 mb-8">
        <span className="text-xs uppercase font-bold tracking-wider text-zinc-800 bg-zinc-100 border border-zinc-200 px-3 py-1 rounded-full">
          Official Policy • Terms of Service
        </span>
        <h1 className="font-serif text-3xl font-bold text-luxury-950 mt-3">
          Terms of Service & Return Guarantee
        </h1>
        <p className="text-xs text-luxury-500 mt-1">Official terms governing purchases, optical custom orders & warranties</p>
      </div>

      <div className="space-y-8 text-xs text-luxury-700 leading-relaxed">
        {/* 7-Day Replacement Policy */}
        <div className="p-5 bg-luxury-50 rounded-2xl border border-luxury-200">
          <div className="flex items-center gap-2.5 mb-2 text-luxury-950 font-bold text-sm">
            <RotateCcw className="w-5 h-5 text-zinc-800" />
            <h3>1. 7-Day Hassle-Free Replacement Policy</h3>
          </div>
          <p className="mb-2">
            Every frame purchased from NEXT VISION comes with a 7-day unconditional replacement guarantee from the date of courier delivery.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-luxury-600">
            <li>If the frame fit does not suit your face shape, you may exchange it for any alternate frame of equal value.</li>
            <li>Items must be returned in their original condition with the luxury hard-case, microfiber cloth, and warranty card intact.</li>
            <li>To initiate an exchange, simply message our WhatsApp concierge at +92 300 8472910 with your Order ID.</li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-sm text-luxury-950 mb-2">2. Custom Prescription Lens Disclaimer</h3>
          <p className="mb-2">
            Prescription lenses are bespoke items custom-crafted according to your specified Sphere, Cylinder, and Axis measurements.
          </p>
          <p>
            Please ensure all prescription inputs are verified against an eye test conducted within the last 12 months. If your lenses cause optical distortion due to a lab error, our lab will re-cut and replace the lenses completely free of charge.
          </p>
        </div>

        <div>
          <h3 className="font-bold text-sm text-luxury-950 mb-2">3. Shipping Timelines Across Pakistan</h3>
          <p className="mb-2">
            Orders are fulfilled via insured express couriers (TCS and Leopards):
          </p>
          <ul className="list-disc pl-5 space-y-1 text-luxury-600">
            <li>Ready-to-wear Sunglasses & Blue-Light Glasses: 2 to 3 business days.</li>
            <li>Custom Prescription Optical Lenses: 3 to 5 business days (includes precision surfacing & edging).</li>
            <li>Orders above Rs. 5,000 qualify for complimentary free shipping nationwide.</li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-sm text-luxury-950 mb-2">4. Payment & Cash on Delivery (COD)</h3>
          <p>
            We accept Cash on Delivery (COD) up to Rs. 25,000 across all Pakistani cities. For orders exceeding Rs. 25,000, partial advance payment via online bank transfer or credit card is required.
          </p>
        </div>
      </div>
    </div>
  );
};
