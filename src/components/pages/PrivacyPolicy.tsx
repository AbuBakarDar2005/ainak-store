import React from 'react';
import { ShieldCheck, Lock, EyeOff, Server, ArrowLeft } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
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
          Data Protection • Privacy Commitment
        </span>
        <h1 className="font-serif text-3xl font-bold text-luxury-950 mt-3">
          Privacy Policy & Biometric Data Safeguards
        </h1>
        <p className="text-xs text-luxury-500 mt-1">Last updated: October 2026 • Compliant with international & local data protection standards</p>
      </div>

      <div className="space-y-8 text-xs text-luxury-700 leading-relaxed">
        {/* Core AR & Webcam Clause */}
        <div className="p-5 bg-luxury-50 rounded-2xl border border-luxury-200">
          <div className="flex items-center gap-2.5 mb-2 text-luxury-950 font-bold text-sm">
            <EyeOff className="w-5 h-5 text-zinc-800" />
            <h3>1. Virtual Try-On & Camera Privacy (100% On-Device Processing)</h3>
          </div>
          <p className="mb-2">
            NEXT VISION's Virtual Try-On technology runs entirely inside your device's web browser using client-side HTML5 Canvas and mathematical face-landmark estimation.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-luxury-600">
            <li><strong>Zero Video Transmission:</strong> Your webcam video stream is NEVER sent to our servers, cloud providers, or third parties.</li>
            <li><strong>Zero Facial Storage:</strong> We do not capture, store, or generate biometric faceprints. When you close the Try-On window, camera feeds are immediately terminated.</li>
            <li><strong>Local Snapshots:</strong> Any photos captured via the "Snapshot" feature are downloaded directly to your local computer or phone.</li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-sm text-luxury-950 mb-2">2. Information We Collect for Fulfillment</h3>
          <p className="mb-2">
            When you place an order, we collect only necessary fulfillment information: customer name, shipping address, contact phone number, email, and optical prescription values.
          </p>
          <p>
            This data is used solely to craft your prescription lenses at our certified lab and coordinate delivery via licensed courier partners (TCS, Leopards, Trax).
          </p>
        </div>

        <div>
          <h3 className="font-bold text-sm text-luxury-950 mb-2">3. Prescription Confidentiality</h3>
          <p>
            Doctor prescription slips, sphere, cylinder, axis, and pupillary distance measurements are treated with strict confidentiality. Prescriptions are deleted from active lab caches after the 7-day replacement warranty period.
          </p>
        </div>

        <div>
          <h3 className="font-bold text-sm text-luxury-950 mb-2">4. Payment Security & Fraud Defense</h3>
          <p>
            We do not store complete credit/debit card numbers on our servers. Transactions are processed through encrypted 256-bit bank gateways. Cash on Delivery (COD) orders require telephone/SMS verification prior to courier dispatch.
          </p>
        </div>

        <div>
          <h3 className="font-bold text-sm text-luxury-950 mb-2">5. Contact Our Data Protection Officer</h3>
          <p>
            For privacy inquiries or data removal requests, contact our concierge at <a href="mailto:privacy@nextvision.pk" className="text-luxury-950 font-semibold underline">privacy@nextvision.pk</a> or visit our Flagship Store on MM Alam Road, Gulberg III, Lahore, Pakistan.
          </p>
        </div>
      </div>
    </div>
  );
};
