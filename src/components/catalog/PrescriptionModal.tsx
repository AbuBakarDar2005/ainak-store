import React, { useState } from 'react';
import { X, Check, Eye, ShieldCheck, Sun, Layers, FileUp, Info } from 'lucide-react';
import { Product, ColorVariant, LensOption } from '../../types';
import { formatCurrency } from '../../utils/format';

interface PrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  selectedColor: ColorVariant;
  currency: 'PKR' | 'USD';
  exchangeRate: number;
  onConfirmAndAddToCart: (product: Product, color: ColorVariant, lensOption: LensOption) => void;
}

const LENS_PACKAGES = [
  {
    id: 'standard',
    title: 'Standard Clear UV400',
    subtitle: 'Zero power or fashion styling with anti-scratch coating',
    price: 0,
    icon: Eye
  },
  {
    id: 'blue_cut',
    title: 'Cyber Blue-Cut Nano-Shield',
    subtitle: 'Blocks 98% harmful 415-455nm computer blue light',
    price: 1500,
    icon: ShieldCheck,
    isPopular: true
  },
  {
    id: 'photochromic',
    title: 'Photochromic Transition',
    subtitle: 'Crystal clear indoors, adjusts to dark sunglasses in sunlight',
    price: 2400,
    icon: Sun
  },
  {
    id: 'progressive',
    title: 'Progressive / Multifocal',
    subtitle: 'Seamless near, intermediate & distance correction (no lines)',
    price: 3500,
    icon: Layers
  }
];

export const PrescriptionModal: React.FC<PrescriptionModalProps> = ({
  isOpen,
  onClose,
  product,
  selectedColor,
  currency,
  exchangeRate,
  onConfirmAndAddToCart
}) => {
  const [selectedLens, setSelectedLens] = useState(LENS_PACKAGES[1]);
  const [entryMethod, setEntryMethod] = useState<'manual' | 'upload' | 'later'>('manual');
  const [prescriptionType, setPrescriptionType] = useState('Single Vision');
  const [sphereR, setSphereR] = useState('-1.00');
  const [sphereL, setSphereL] = useState('-1.00');
  const [cylR, setCylR] = useState('0.00');
  const [cylL, setCylL] = useState('0.00');
  const [axisR, setAxisR] = useState('0');
  const [axisL, setAxisL] = useState('0');
  const [pd, setPd] = useState('63');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalItemPrice = (product.salePrice || product.basePrice) + selectedLens.price;

  const handleConfirm = () => {
    const lensOption: LensOption = {
      type: selectedLens.title,
      price: selectedLens.price,
      prescriptionType: entryMethod === 'later' ? 'Provide Later via WhatsApp' : prescriptionType,
      sphereR: entryMethod === 'manual' ? sphereR : undefined,
      sphereL: entryMethod === 'manual' ? sphereL : undefined,
      cylR: entryMethod === 'manual' ? cylR : undefined,
      cylL: entryMethod === 'manual' ? cylL : undefined,
      axisR: entryMethod === 'manual' ? axisR : undefined,
      axisL: entryMethod === 'manual' ? axisL : undefined,
      pd: entryMethod === 'manual' ? `${pd}mm` : (uploadedFileName ? `Slip Uploaded: ${uploadedFileName}` : undefined)
    };

    onConfirmAndAddToCart(product, selectedColor, lensOption);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-luxury-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-luxury-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-luxury-50 border-b border-luxury-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-luxury-500">
              Custom Prescription Configurator
            </span>
            <h3 className="font-serif text-lg font-bold text-luxury-950">
              Select Lenses for {product.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-luxury-400 hover:text-luxury-950 rounded-full hover:bg-luxury-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Step 1: Lens Coating Options */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-luxury-700 mb-3">
              1. Choose Lens Coating & Protection
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {LENS_PACKAGES.map((pkg) => {
                const IconComponent = pkg.icon;
                const isSelected = selectedLens.id === pkg.id;
                return (
                  <button
                    key={pkg.id}
                    onClick={() => setSelectedLens(pkg)}
                    className={`relative p-3.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-luxury-950 bg-luxury-50 shadow-sm ring-1 ring-luxury-950'
                        : 'border-luxury-200 hover:border-luxury-400 bg-white'
                    }`}
                  >
                    {pkg.isPopular && (
                      <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-champagne-100 text-champagne-700 border border-champagne-300">
                        Most Popular
                      </span>
                    )}
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-luxury-950 text-gold' : 'bg-luxury-100 text-luxury-600'}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <h4 className="font-semibold text-xs text-luxury-950">{pkg.title}</h4>
                    </div>
                    <p className="text-[11px] text-luxury-500 mb-2 leading-relaxed">{pkg.subtitle}</p>
                    <div className="text-xs font-bold text-luxury-950">
                      {pkg.price === 0 ? 'Included Free' : `+${formatCurrency(pkg.price, currency, exchangeRate)}`}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Prescription Entry Method */}
          {selectedLens.id !== 'standard' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold uppercase tracking-wider text-luxury-700">
                  2. Optical Prescription Details
                </label>
                <div className="flex bg-luxury-100 p-1 rounded-lg text-xs">
                  <button
                    onClick={() => setEntryMethod('manual')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                      entryMethod === 'manual' ? 'bg-white shadow-sm text-luxury-950' : 'text-luxury-500'
                    }`}
                  >
                    Manual Entry
                  </button>
                  <button
                    onClick={() => setEntryMethod('upload')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                      entryMethod === 'upload' ? 'bg-white shadow-sm text-luxury-950' : 'text-luxury-500'
                    }`}
                  >
                    Upload Slip
                  </button>
                  <button
                    onClick={() => setEntryMethod('later')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                      entryMethod === 'later' ? 'bg-white shadow-sm text-luxury-950' : 'text-luxury-500'
                    }`}
                  >
                    Send on WhatsApp
                  </button>
                </div>
              </div>

              {entryMethod === 'manual' && (
                <div className="bg-luxury-50 p-4 rounded-xl border border-luxury-200 space-y-3">
                  <div className="grid grid-cols-2 gap-3 mb-2">
                    <div>
                      <label className="block text-[11px] font-medium text-luxury-600 mb-1">Prescription Vision</label>
                      <select
                        value={prescriptionType}
                        onChange={(e) => setPrescriptionType(e.target.value)}
                        className="w-full text-xs p-2 rounded-lg border border-luxury-300 bg-white"
                      >
                        <option>Single Vision (Distance)</option>
                        <option>Single Vision (Reading / Near)</option>
                        <option>Bifocal (with line)</option>
                        <option>Progressive (Multifocal)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-luxury-600 mb-1">Pupillary Distance (PD mm)</label>
                      <input
                        type="number"
                        value={pd}
                        onChange={(e) => setPd(e.target.value)}
                        placeholder="e.g. 63"
                        className="w-full text-xs p-2 rounded-lg border border-luxury-300 bg-white"
                      />
                    </div>
                  </div>

                  {/* Right & Left Eye Table */}
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <span className="font-semibold text-luxury-600 text-left">Eye</span>
                    <span className="font-semibold text-luxury-600">SPH (Sphere)</span>
                    <span className="font-semibold text-luxury-600">CYL (Cylinder)</span>
                    <span className="font-semibold text-luxury-600">AXIS</span>

                    <span className="text-left font-bold text-luxury-950 pt-1.5">Right (OD)</span>
                    <input
                      type="text"
                      value={sphereR}
                      onChange={(e) => setSphereR(e.target.value)}
                      className="p-1.5 text-center border rounded bg-white text-xs"
                    />
                    <input
                      type="text"
                      value={cylR}
                      onChange={(e) => setCylR(e.target.value)}
                      className="p-1.5 text-center border rounded bg-white text-xs"
                    />
                    <input
                      type="text"
                      value={axisR}
                      onChange={(e) => setAxisR(e.target.value)}
                      className="p-1.5 text-center border rounded bg-white text-xs"
                    />

                    <span className="text-left font-bold text-luxury-950 pt-1.5">Left (OS)</span>
                    <input
                      type="text"
                      value={sphereL}
                      onChange={(e) => setSphereL(e.target.value)}
                      className="p-1.5 text-center border rounded bg-white text-xs"
                    />
                    <input
                      type="text"
                      value={cylL}
                      onChange={(e) => setCylL(e.target.value)}
                      className="p-1.5 text-center border rounded bg-white text-xs"
                    />
                    <input
                      type="text"
                      value={axisL}
                      onChange={(e) => setAxisL(e.target.value)}
                      className="p-1.5 text-center border rounded bg-white text-xs"
                    />
                  </div>
                </div>
              )}

              {entryMethod === 'upload' && (
                <div className="border-2 border-dashed border-luxury-300 rounded-xl p-6 text-center bg-luxury-50">
                  <FileUp className="w-8 h-8 text-luxury-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-luxury-800 mb-1">
                    Upload doctor's prescription slip or optometrist card
                  </p>
                  <p className="text-[11px] text-luxury-500 mb-3">Accepted formats: JPG, PNG, PDF (Up to 10MB)</p>
                  <label className="cursor-pointer px-4 py-2 bg-luxury-950 text-white rounded-lg text-xs font-semibold hover:bg-luxury-800 transition-colors inline-block">
                    Choose File
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setUploadedFileName(e.target.files[0].name);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                  {uploadedFileName && (
                    <p className="text-xs text-emerald-600 font-medium mt-2 flex items-center justify-center gap-1">
                      <Check className="w-3.5 h-3.5" /> {uploadedFileName} attached
                    </p>
                  )}
                </div>
              )}

              {entryMethod === 'later' && (
                <div className="p-4 rounded-xl bg-champagne-50 border border-champagne-300 text-xs text-luxury-800 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-champagne-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-luxury-950">Don't have your prescription handy?</p>
                    <p className="text-luxury-600 mt-0.5 leading-relaxed">
                      Complete your order now. Our optical consultant will message you on WhatsApp (+92 300 8472910) to collect your prescription numbers or eye test slip.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer Summary & Confirmation */}
        <div className="p-6 bg-luxury-50 border-t border-luxury-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-luxury-500">Total with Selected Lenses:</span>
            <div className="text-xl font-bold text-luxury-950">
              {formatCurrency(totalItemPrice, currency, exchangeRate)}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-luxury-300 text-luxury-700 hover:bg-luxury-100 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-6 py-2.5 bg-luxury-950 hover:bg-luxury-800 text-white rounded-xl text-xs font-bold shadow-lg transition-transform active:scale-[0.98]"
            >
              Confirm Lenses & Add to Cart
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
