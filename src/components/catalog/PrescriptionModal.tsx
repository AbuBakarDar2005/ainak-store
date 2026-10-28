import React, { useState, useEffect } from 'react';
import {
  X, Check, Eye, ShieldCheck, Sun, Layers, FileUp, Info,
  Laptop, Sparkles, Cpu, Palette, SunMedium, CheckCircle2
} from 'lucide-react';
import { Product, ColorVariant, LensOption, LensCategory } from '../../types';
import { formatCurrency } from '../../utils/format';

interface PrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  selectedColor: ColorVariant;
  currency: 'PKR' | 'USD';
  exchangeRate: number;
  lensCategories?: LensCategory[];
  onConfirmAndAddToCart: (product: Product, color: ColorVariant, lensOption: LensOption) => void;
}

export const DEFAULT_LENS_CATEGORIES: LensCategory[] = [
  {
    id: "lens-blue-cut",
    name: "Blue Light Shield (Mobile & Laptop Defense)",
    categoryKey: "blue_light",
    description: "Engineered specifically for heavy smartphone, laptop & screen usage. Blocks 99% harmful blue-violet light, eliminates digital eye strain and prevents sleep cycle disruption.",
    price: 1800,
    features: [
      "99% Screen Blue Light Shielding",
      "Anti-Digital Fatigue Nano-Filter",
      "High Optical Clarity (Abbe 58)",
      "Zero Yellow Color Distortion"
    ],
    badge: "Screen Essential",
    isActive: true
  },
  {
    id: "lens-photochromic",
    name: "Photochromic Transition (Sunlight React)",
    categoryKey: "photochromic",
    description: "Rapid light-adaptive smart optics that remain perfectly clear indoors and automatically transform into dark sunglasses (Black, Blue, Amber, Green) when exposed to sun or daylight.",
    price: 2800,
    features: [
      "Fast 30-Second Outdoor Darkening",
      "Full UV400 Sun Glare Protection",
      "Choice of 5 Sun Transition Tints",
      "100% Crystal Clear Indoors"
    ],
    badge: "Sun Adaptive",
    supportsPhotochromicTints: true,
    availableTints: [
      "Obsidian Black",
      "Sapphire Blue",
      "Amber Brown",
      "Emerald Green",
      "Graphite Grey"
    ],
    isActive: true
  },
  {
    id: "lens-anti-glare",
    name: "Anti-Glare + Blue-Cut Dual Shield",
    categoryKey: "anti_glare_blue_cut",
    description: "Multi-layer anti-reflective anti-glare coating combined with computer blue-cut shielding. Eliminates halo reflections from night driving headlights and computer monitors.",
    price: 2400,
    features: [
      "16-Layer Anti-Reflective Anti-Glare",
      "Dual-Band Blue Light Cut Coating",
      "Hydrophobic Smudge & Dust Repellent",
      "Night Driving & Office Glare Defense"
    ],
    badge: "Anti-Reflective",
    isActive: true
  },
  {
    id: "lens-all-in-one",
    name: "Ultra-HD Master Defense (UV400 + Screen + Anti-Glare)",
    categoryKey: "all_in_one",
    description: "Medical-grade high-index resin offering comprehensive UV400 sun protection, mobile & laptop screen defense, and diamond-grade anti-glare. Configurable with or without photochromic sunlight ability.",
    price: 3600,
    features: [
      "Comprehensive UV400 Sun Blocking",
      "Mobile & Laptop Screen Protection",
      "High-Index Ultra-Thin Lens Profile",
      "Configurable with/without Photochromic",
      "Diamond Hard Anti-Scratch Coat"
    ],
    badge: "Master Grade",
    supportsPhotochromicToggle: true,
    photochromicAddonPrice: 1200,
    supportsPhotochromicTints: true,
    availableTints: [
      "Obsidian Black",
      "Sapphire Blue",
      "Amber Brown"
    ],
    isActive: true
  },
  {
    id: "lens-smart-glasses",
    name: "Tri-Active Smart Lenses (Blue Cut + Photochromic + Anti-Glare)",
    categoryKey: "smart_glasses",
    description: "Next-generation all-inclusive smart lenses uniting Blue Cut screen filter, automatic Photochromic sunlight adaptation, and 360° Anti-Glare clarity in one intelligent optical formulation.",
    price: 4800,
    features: [
      "Tri-Active Intelligent Optical Fusion",
      "Active Blue-Cut Screen Nano-Shield",
      "Automatic Sunlight Photochromic Shift",
      "16-Layer Anti-Glare Clear Coating",
      "Rapid Indoor-Outdoor Transition"
    ],
    badge: "Smart Tri-Shield",
    supportsPhotochromicTints: true,
    availableTints: [
      "Obsidian Black",
      "Sapphire Blue",
      "Graphite Grey",
      "Ruby Amber"
    ],
    isActive: true
  }
];

const TINT_PALETTE: Record<string, { hex: string; desc: string }> = {
  'Obsidian Black': { hex: '#121215', desc: 'Classic smoke sunglasses tint' },
  'Sapphire Blue': { hex: '#1d4ed8', desc: 'Striking modern ocean sapphire' },
  'Amber Brown': { hex: '#78350f', desc: 'High-contrast warm bronze' },
  'Emerald Green': { hex: '#065f46', desc: 'Classic aviator green' },
  'Graphite Grey': { hex: '#374151', desc: 'Neutral polarized grey' },
  'Ruby Amber': { hex: '#991b1b', desc: 'Sunset crimson-amber' },
  'Amethyst Purple': { hex: '#6b21a8', desc: 'Fashion ultraviolet' }
};

export const PrescriptionModal: React.FC<PrescriptionModalProps> = ({
  isOpen,
  onClose,
  product,
  selectedColor,
  currency,
  exchangeRate,
  lensCategories: externalCategories,
  onConfirmAndAddToCart
}) => {
  const [categories, setCategories] = useState<LensCategory[]>(
    externalCategories && externalCategories.length > 0 ? externalCategories : DEFAULT_LENS_CATEGORIES
  );

  const [selectedCategory, setSelectedCategory] = useState<LensCategory>(categories[0] || DEFAULT_LENS_CATEGORIES[0]);
  const [selectedTint, setSelectedTint] = useState<string>('Obsidian Black');
  const [photochromicToggle, setPhotochromicToggle] = useState<boolean>(true);

  // Prescription Form
  const [entryMethod, setEntryMethod] = useState<'manual' | 'upload' | 'later'>('manual');
  const [prescriptionType, setPrescriptionType] = useState('Single Vision (Distance & Everyday)');
  const [sphereR, setSphereR] = useState('-1.00');
  const [sphereL, setSphereL] = useState('-1.00');
  const [cylR, setCylR] = useState('0.00');
  const [cylL, setCylL] = useState('0.00');
  const [axisR, setAxisR] = useState('0');
  const [axisL, setAxisL] = useState('0');
  const [pd, setPd] = useState('63');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Fetch updated categories if Main Admin renamed or modified them
  useEffect(() => {
    fetch('/api/lens-types')
      .then(res => res.json())
      .then(data => {
        if (data.categories && data.categories.length > 0) {
          setCategories(data.categories);
          if (!data.categories.find((c: LensCategory) => c.id === selectedCategory?.id)) {
            setSelectedCategory(data.categories[0]);
          }
        }
      })
      .catch(() => {});
  }, [isOpen]);

  useEffect(() => {
    if (externalCategories && externalCategories.length > 0) {
      setCategories(externalCategories);
    }
  }, [externalCategories]);

  // Adjust default tint if category tints change
  useEffect(() => {
    if (selectedCategory?.availableTints && selectedCategory.availableTints.length > 0) {
      const tintNames = selectedCategory.availableTints.map(t => typeof t === 'string' ? t : t.name);
      if (!tintNames.includes(selectedTint)) {
        setSelectedTint(tintNames[0]);
      }
    }
  }, [selectedCategory]);

  if (!isOpen) return null;

  // Calculate Effective Price
  const baseLensPrice = selectedCategory.price || 0;
  const addonPrice = (selectedCategory.supportsPhotochromicToggle && photochromicToggle)
    ? (selectedCategory.photochromicAddonPrice || 1200)
    : 0;
  const effectiveLensPrice = baseLensPrice + addonPrice;
  const totalItemPrice = (product.salePrice || product.basePrice) + effectiveLensPrice;

  const getCategoryIcon = (cat: LensCategory) => {
    switch (cat.categoryKey) {
      case 'blue_light':
        return Laptop;
      case 'photochromic':
        return Sun;
      case 'anti_glare_blue_cut':
        return Layers;
      case 'all_in_one':
        return Sparkles;
      case 'smart_glasses':
        return Cpu;
      default:
        return Eye;
    }
  };

  const handleConfirm = () => {
    let formattedType = selectedCategory.name;
    if (selectedCategory.supportsPhotochromicToggle) {
      formattedType += photochromicToggle
        ? ` [With Photochromic - ${selectedTint} Tint]`
        : ' [Without Photochromic - Clear HD]';
    } else if (selectedCategory.supportsPhotochromicTints) {
      formattedType += ` [Sun Tint: ${selectedTint}]`;
    }

    const hasPhotochromic = selectedCategory.supportsPhotochromicToggle
      ? photochromicToggle
      : Boolean(selectedCategory.supportsPhotochromicTints);

    const isZeroPower = prescriptionType.includes('Zero Power');

    const lensOption: LensOption = {
      type: formattedType,
      price: effectiveLensPrice,
      selectedTint: hasPhotochromic ? selectedTint : undefined,
      photochromicEnabled: hasPhotochromic,
      prescriptionType: entryMethod === 'later' ? 'Provide Later via WhatsApp' : prescriptionType,
      sphereR: entryMethod === 'manual' && !isZeroPower ? sphereR : undefined,
      sphereL: entryMethod === 'manual' && !isZeroPower ? sphereL : undefined,
      cylR: entryMethod === 'manual' && !isZeroPower ? cylR : undefined,
      cylL: entryMethod === 'manual' && !isZeroPower ? cylL : undefined,
      axisR: entryMethod === 'manual' && !isZeroPower ? axisR : undefined,
      axisL: entryMethod === 'manual' && !isZeroPower ? axisL : undefined,
      pd: entryMethod === 'manual' ? `${pd}mm` : (uploadedFileName ? `Slip: ${uploadedFileName}` : undefined)
    };

    onConfirmAndAddToCart(product, selectedColor, lensOption);
    onClose();
  };

  const showTintSelector = (selectedCategory.supportsPhotochromicTints && !selectedCategory.supportsPhotochromicToggle) ||
    (selectedCategory.supportsPhotochromicToggle && photochromicToggle);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-luxury-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-luxury-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-luxury-50 border-b border-luxury-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-champagne-700 bg-champagne-100 px-2 py-0.5 rounded-full">
                Custom Optical Lab Atelier
              </span>
              <span className="text-xs text-luxury-500">• Choose Lens Type</span>
            </div>
            <h3 className="font-serif text-lg font-bold text-luxury-950 mt-1">
              Select Lenses for {product.title} ({selectedColor.name})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-luxury-400 hover:text-luxury-950 rounded-full hover:bg-luxury-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs">
          
          {/* STEP 1: CHOOSE LENS CATEGORY */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-luxury-950">
                  1. Choose Type of Glasses & Optical Coating
                </label>
                <p className="text-[11px] text-luxury-500">
                  Precision laboratory-crafted lenses tailored to screens, sunlight, and everyday visual acuity
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {categories.map((cat) => {
                const IconComponent = getCategoryIcon(cat);
                const isSelected = selectedCategory.id === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`relative p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-luxury-950 bg-luxury-50/90 shadow-md ring-2 ring-luxury-950'
                        : 'border-luxury-200 hover:border-luxury-400 bg-white shadow-xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-lg ${isSelected ? 'bg-luxury-950 text-gold' : 'bg-luxury-100 text-luxury-700'}`}>
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-bold text-xs text-luxury-950 leading-snug">{cat.name}</h4>
                            <span className="text-[10px] text-luxury-500 font-medium">Category #{cat.categoryKey}</span>
                          </div>
                        </div>

                        {cat.badge && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-champagne-100 text-champagne-800 border border-champagne-300 shrink-0">
                            {cat.badge}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-luxury-600 mb-3 leading-relaxed">
                        {cat.description}
                      </p>

                      {/* Feature Pills */}
                      {cat.features && cat.features.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {cat.features.slice(0, 3).map((feat, idx) => (
                            <span key={idx} className="text-[10px] bg-white border border-luxury-200 px-2 py-0.5 rounded-md text-luxury-700 font-medium">
                              ✓ {feat}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-luxury-200/60 flex items-center justify-between mt-auto">
                      <span className="text-[11px] font-medium text-luxury-500">Lens Upgrade:</span>
                      <span className="text-xs font-bold text-luxury-950">
                        {cat.price === 0 ? 'Included Free' : `+${formatCurrency(cat.price, currency, exchangeRate)}`}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 1B: PHOTOCHROMIC TOGGLE (Category 4: With or Without Photochromic Ability) */}
          {selectedCategory.supportsPhotochromicToggle && (
            <div className="p-4 rounded-xl bg-champagne-50/70 border border-champagne-200 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-luxury-950 flex items-center gap-1.5">
                    <SunMedium className="w-4 h-4 text-champagne-700" /> Photochromic Sunlight Transition Ability
                  </h4>
                  <p className="text-[11px] text-luxury-600">
                    Choose whether you want this all-in-one lens with or without sunlight darkening ability
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPhotochromicToggle(false)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    !photochromicToggle
                      ? 'border-luxury-950 bg-white ring-2 ring-luxury-950 shadow-sm'
                      : 'border-luxury-200 bg-white/70 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-luxury-900">Without Photochromic</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold">Base Price Included</span>
                  </div>
                  <p className="text-[11px] text-luxury-500">
                    Ultra-clear HD optics with UV400, anti-glare, and mobile/laptop protection (stays clear in all lights).
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setPhotochromicToggle(true)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    photochromicToggle
                      ? 'border-luxury-950 bg-white ring-2 ring-luxury-950 shadow-sm'
                      : 'border-luxury-200 bg-white/70 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-luxury-900 flex items-center gap-1">
                      <Sun className="w-3.5 h-3.5 text-champagne-600" /> With Photochromic Transition
                    </span>
                    <span className="text-[10px] text-champagne-800 bg-champagne-100 px-2 py-0.5 rounded-md font-bold">
                      +{formatCurrency(selectedCategory.photochromicAddonPrice || 1200, currency, exchangeRate)}
                    </span>
                  </div>
                  <p className="text-[11px] text-luxury-500">
                    Automatically adapts and turns into dark sunglass tint outdoors when exposed to sun or daylight!
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* STEP 1C: SUNLIGHT TRANSITION COLOR TINT SELECTOR (For Photochromic Lenses) */}
          {showTintSelector && (
            <div className="p-4 rounded-xl bg-luxury-50 border border-luxury-200 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-luxury-950 flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-champagne-600" /> Select Sunlight Transition Color Tint
                  </h4>
                  <p className="text-[11px] text-luxury-500">
                    Turns from crystal clear indoors into your selected color tint when exposed to sun or daylight
                  </p>
                </div>
                <span className="text-[11px] font-bold text-champagne-800 bg-white px-2.5 py-1 rounded-lg border border-luxury-200">
                  Selected: {selectedTint}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {(selectedCategory.availableTints || ['Obsidian Black', 'Sapphire Blue', 'Amber Brown', 'Emerald Green', 'Graphite Grey']).map((rawTint) => {
                  const tintName = typeof rawTint === 'string' ? rawTint : rawTint.name;
                  const tintColor = typeof rawTint === 'string' ? (TINT_PALETTE[tintName]?.hex || '#121215') : (rawTint.color || TINT_PALETTE[tintName]?.hex || '#121215');
                  const tintDesc = typeof rawTint === 'string' ? (TINT_PALETTE[tintName]?.desc || 'Custom tint') : (rawTint.description || TINT_PALETTE[tintName]?.desc || 'Custom tint');
                  const isTintSelected = selectedTint === tintName;

                  return (
                    <button
                      key={tintName}
                      type="button"
                      onClick={() => setSelectedTint(tintName)}
                      className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                        isTintSelected
                          ? 'border-luxury-950 bg-white ring-2 ring-luxury-950 shadow-sm scale-105'
                          : 'border-luxury-200 bg-white hover:border-luxury-400'
                      }`}
                    >
                      <div
                        className="w-7 h-7 rounded-full shadow-inner border border-luxury-300 relative flex items-center justify-center transition-transform"
                        style={{ backgroundColor: tintColor }}
                      >
                        {isTintSelected && <Check className="w-4 h-4 text-white drop-shadow" />}
                      </div>
                      <span className="font-bold text-[11px] text-luxury-900 leading-tight">{tintName}</span>
                      <span className="text-[9px] text-luxury-400 line-clamp-1">{tintDesc}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: PRESCRIPTION DETAILS & ENTRY METHOD */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-luxury-950">
                  2. Optical Prescription Configuration
                </label>
                <p className="text-[11px] text-luxury-500">Provide optical power numbers, doctor's slip, or send later</p>
              </div>

              <div className="flex bg-luxury-100 p-1 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setEntryMethod('manual')}
                  className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all ${
                    entryMethod === 'manual' ? 'bg-white shadow-sm text-luxury-950' : 'text-luxury-500 hover:text-luxury-950'
                  }`}
                >
                  Manual Entry
                </button>
                <button
                  type="button"
                  onClick={() => setEntryMethod('upload')}
                  className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all ${
                    entryMethod === 'upload' ? 'bg-white shadow-sm text-luxury-950' : 'text-luxury-500 hover:text-luxury-950'
                  }`}
                >
                  Upload Slip
                </button>
                <button
                  type="button"
                  onClick={() => setEntryMethod('later')}
                  className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all ${
                    entryMethod === 'later' ? 'bg-white shadow-sm text-luxury-950' : 'text-luxury-500 hover:text-luxury-950'
                  }`}
                >
                  Send on WhatsApp
                </button>
              </div>
            </div>

            {entryMethod === 'manual' && (
              <div className="bg-luxury-50 p-4 rounded-xl border border-luxury-200 space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-luxury-700 mb-1">
                      Prescription Vision Type
                    </label>
                    <select
                      value={prescriptionType}
                      onChange={(e) => setPrescriptionType(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-luxury-300 bg-white focus:outline-none focus:border-luxury-950"
                    >
                      <option value="Single Vision (Distance & Everyday)">Single Vision (Distance & Everyday)</option>
                      <option value="Single Vision (Near / Reading)">Single Vision (Near / Reading)</option>
                      <option value="Zero Power (Computer Shield / Fashion)">Zero Power (Computer Shield / Fashion)</option>
                      <option value="Bifocal (with divider line)">Bifocal (with divider line)</option>
                      <option value="Progressive / Multifocal (no lines)">Progressive / Multifocal (no lines)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-luxury-700 mb-1">
                      Pupillary Distance (PD in mm)
                    </label>
                    <input
                      type="text"
                      value={pd}
                      onChange={(e) => setPd(e.target.value)}
                      placeholder="e.g. 63"
                      className="w-full text-xs p-2.5 rounded-lg border border-luxury-300 bg-white focus:outline-none focus:border-luxury-950"
                    />
                  </div>
                </div>

                {!prescriptionType.includes('Zero Power') ? (
                  <div>
                    <div className="grid grid-cols-4 gap-2 text-center text-xs mb-1 font-semibold text-luxury-600">
                      <span className="text-left pl-1">Eye</span>
                      <span>SPH (Sphere)</span>
                      <span>CYL (Cylinder)</span>
                      <span>AXIS</span>
                    </div>

                    <div className="space-y-2">
                      <div className="grid grid-cols-4 gap-2 items-center">
                        <span className="text-xs font-bold text-luxury-950 pl-1">Right (OD)</span>
                        <input
                          type="text"
                          value={sphereR}
                          onChange={(e) => setSphereR(e.target.value)}
                          placeholder="-1.00"
                          className="p-2 text-center border rounded-lg bg-white text-xs"
                        />
                        <input
                          type="text"
                          value={cylR}
                          onChange={(e) => setCylR(e.target.value)}
                          placeholder="0.00"
                          className="p-2 text-center border rounded-lg bg-white text-xs"
                        />
                        <input
                          type="text"
                          value={axisR}
                          onChange={(e) => setAxisR(e.target.value)}
                          placeholder="0"
                          className="p-2 text-center border rounded-lg bg-white text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-4 gap-2 items-center">
                        <span className="text-xs font-bold text-luxury-950 pl-1">Left (OS)</span>
                        <input
                          type="text"
                          value={sphereL}
                          onChange={(e) => setSphereL(e.target.value)}
                          placeholder="-1.00"
                          className="p-2 text-center border rounded-lg bg-white text-xs"
                        />
                        <input
                          type="text"
                          value={cylL}
                          onChange={(e) => setCylL(e.target.value)}
                          placeholder="0.00"
                          className="p-2 text-center border rounded-lg bg-white text-xs"
                        />
                        <input
                          type="text"
                          value={axisL}
                          onChange={(e) => setAxisL(e.target.value)}
                          placeholder="0"
                          className="p-2 text-center border rounded-lg bg-white text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-white rounded-lg border border-luxury-200 text-luxury-700 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Zero Power selected: Your frame will be crafted with non-prescription plain protective lenses.</span>
                  </div>
                )}
              </div>
            )}

            {entryMethod === 'upload' && (
              <div className="border-2 border-dashed border-luxury-300 rounded-xl p-6 text-center bg-luxury-50">
                <FileUp className="w-8 h-8 text-luxury-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-luxury-800 mb-1">
                  Upload doctor's prescription slip or optometrist card
                </p>
                <p className="text-[11px] text-luxury-500 mb-3">Accepted formats: JPG, PNG, PDF (Up to 10MB)</p>
                <label className="cursor-pointer px-4 py-2 bg-luxury-950 text-white rounded-lg text-xs font-semibold hover:bg-luxury-800 transition-colors inline-block shadow">
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
                  <p className="text-xs text-emerald-700 font-bold mt-2 flex items-center justify-center gap-1">
                    <Check className="w-3.5 h-3.5" /> {uploadedFileName} attached
                  </p>
                )}
              </div>
            )}

            {entryMethod === 'later' && (
              <div className="p-4 rounded-xl bg-champagne-50 border border-champagne-300 text-xs text-luxury-800 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-champagne-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-luxury-950">Don't have your prescription handy right now?</p>
                  <p className="text-luxury-600 mt-0.5 leading-relaxed">
                    Complete your checkout order now. Our senior optometrist will message you directly on WhatsApp to record your prescription slip before cutting your custom lenses.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Footer Summary & Confirmation */}
        <div className="p-5 sm:p-6 bg-luxury-50 border-t border-luxury-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-[11px] text-luxury-500 font-medium">
              Frame ({formatCurrency(product.salePrice || product.basePrice, currency, exchangeRate)}) + Lenses ({formatCurrency(effectiveLensPrice, currency, exchangeRate)})
            </div>
            <div className="text-xl font-serif font-bold text-luxury-950">
              Total: {formatCurrency(totalItemPrice, currency, exchangeRate)}
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-luxury-300 text-luxury-700 hover:bg-luxury-100 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-luxury-950 hover:bg-luxury-800 text-white rounded-xl text-xs font-bold shadow-lg transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span>Add Custom Lenses to Cart</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
