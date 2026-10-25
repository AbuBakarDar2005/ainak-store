import React, { useState } from 'react';
import { Eye, ShoppingBag, Sparkles, SlidersHorizontal, Star, Check } from 'lucide-react';
import { Product, ColorVariant } from '../../types';
import { formatCurrency } from '../../utils/format';

interface ProductGridProps {
  products: Product[];
  currency: 'PKR' | 'USD';
  exchangeRate: number;
  onLaunchTryOn: (product: Product) => void;
  onConfigurePrescription: (product: Product, color: ColorVariant) => void;
  onQuickAddToCart: (product: Product, color: ColorVariant) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
}

const FRAME_SHAPES = ['All', 'Square', 'Aviator', 'Cat-Eye', 'Rectangle', 'Round', 'Geometric'];
const GENDERS = ['All', 'Men', 'Women', 'Unisex'];

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  currency,
  exchangeRate,
  onLaunchTryOn,
  onConfigurePrescription,
  onQuickAddToCart,
  selectedCategory,
  onSelectCategory
}) => {
  const [selectedShape, setSelectedShape] = useState('All');
  const [selectedGender, setSelectedGender] = useState('All');
  const [maxPrice, setMaxPrice] = useState(10000);
  const [selectedColorMap, setSelectedColorMap] = useState<Record<string, ColorVariant>>({});

  // Filtered Products
  const filteredProducts = products.filter(p => {
    const matchCategory = selectedCategory === 'All' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchShape = selectedShape === 'All' || p.frameShape.toLowerCase() === selectedShape.toLowerCase();
    const matchGender = selectedGender === 'All' || p.gender === selectedGender || p.gender === 'Unisex';
    const matchPrice = (p.salePrice || p.basePrice) <= maxPrice;
    return matchCategory && matchShape && matchGender && matchPrice;
  });

  const getSelectedColor = (product: Product): ColorVariant => {
    return selectedColorMap[product.id] || product.colors?.[0] || { name: 'Classic Black', hex: '#121215' };
  };

  const handleSelectColor = (productId: string, color: ColorVariant) => {
    setSelectedColorMap(prev => ({ ...prev, [productId]: color }));
  };

  return (
    <section id="catalog" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b border-luxury-100 pb-6">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-champagne-700 bg-champagne-100 px-3 py-1 rounded-full">
            Atelier Catalog
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-luxury-950 mt-2">
            Signature Eyewear Collection
          </h2>
          <p className="text-xs text-luxury-500 mt-1">
            Displaying {filteredProducts.length} precision handcrafted frames ready for live AR Virtual Try-On
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs font-semibold">
          {['All', 'Prescription Glasses', 'Sunglasses', 'Blue-Light Glasses'].map(cat => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-luxury-950 text-white shadow-sm'
                  : 'bg-luxury-100 text-luxury-600 hover:text-luxury-950 hover:bg-luxury-200'
              }`}
            >
              {cat === 'All' ? 'All Frames' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-luxury-50 p-4 rounded-2xl border border-luxury-200 mb-8 flex flex-wrap items-center justify-between gap-4 text-xs">
        
        {/* Frame Shapes */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="font-bold text-luxury-700 uppercase tracking-wider text-[10px] pr-1">Shape:</span>
          {FRAME_SHAPES.map(shape => (
            <button
              key={shape}
              onClick={() => setSelectedShape(shape)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedShape === shape
                  ? 'bg-white text-luxury-950 shadow-sm border border-luxury-300 font-bold'
                  : 'text-luxury-500 hover:text-luxury-950'
              }`}
            >
              {shape}
            </button>
          ))}
        </div>

        {/* Gender & Price Controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-luxury-700 uppercase tracking-wider text-[10px]">Gender:</span>
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="p-1.5 text-xs bg-white border border-luxury-300 rounded-lg text-luxury-800"
            >
              {GENDERS.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-luxury-600 text-[11px]">Max: <strong>Rs. {maxPrice.toLocaleString()}</strong></span>
            <input
              type="range"
              min="3000"
              max="10000"
              step="500"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-24 accent-luxury-950 cursor-pointer"
            />
          </div>
        </div>

      </div>

      {/* Product Cards Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-luxury-50 rounded-2xl border border-luxury-200">
          <p className="font-serif text-lg font-bold text-luxury-950 mb-1">No matching frames found</p>
          <p className="text-xs text-luxury-500 mb-4">Try relaxing your shape or price filters to see more frames.</p>
          <button
            onClick={() => { setSelectedShape('All'); setSelectedGender('All'); setMaxPrice(10000); }}
            className="px-4 py-2 bg-luxury-950 text-white rounded-lg text-xs font-semibold"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const currentColor = getSelectedColor(product);
            const displayPrice = product.salePrice || product.basePrice;

            return (
              <div
                key={product.id}
                className="group bg-white rounded-2xl border border-luxury-200 hover:border-luxury-400 p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative"
              >
                {/* Badges */}
                <div className="absolute top-6 left-6 z-10 flex flex-col gap-1">
                  {product.isBestseller && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-luxury-950 text-gold shadow-sm">
                      Bestseller
                    </span>
                  )}
                  {product.salePrice && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-champagne-100 text-champagne-800 border border-champagne-300">
                      Save {Math.round(((product.basePrice - product.salePrice) / product.basePrice) * 100)}%
                    </span>
                  )}
                </div>

                <div>
                  {/* Product Image Gallery with hover switch */}
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-luxury-50 mb-4 border border-luxury-100 flex items-center justify-center p-2">
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />

                    {/* Quick AR Try-On Hover Button */}
                    <button
                      onClick={() => onLaunchTryOn(product)}
                      className="absolute inset-x-4 bottom-3 py-2.5 bg-luxury-950/90 hover:bg-luxury-950 backdrop-blur-md text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-2 group-hover:translate-y-0"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-gold" /> Try On Live in AR
                    </button>
                  </div>

                  {/* Frame Metadata */}
                  <div className="space-y-1 mb-3">
                    <div className="flex items-center justify-between text-[11px] text-luxury-500">
                      <span>{product.category}</span>
                      <span className="flex items-center gap-1 font-semibold text-luxury-700">
                        <Star className="w-3 h-3 fill-champagne-500 text-champagne-500" />
                        {product.rating} ({product.reviewsCount})
                      </span>
                    </div>

                    <h3 className="font-serif font-bold text-base text-luxury-950 group-hover:text-champagne-700 transition-colors">
                      {product.title}
                    </h3>

                    <p className="text-[11px] text-luxury-500 truncate">
                      {product.material} • {product.dimensions.lensWidth}-{product.dimensions.bridgeWidth}-{product.dimensions.templeLength}
                    </p>
                  </div>

                  {/* Color Swatches */}
                  <div className="flex items-center gap-1.5 mb-4">
                    {(product.colors || []).map(color => (
                      <button
                        key={color.name}
                        onClick={() => handleSelectColor(product.id, color)}
                        className={`w-5 h-5 rounded-full border transition-all flex items-center justify-center ${
                          currentColor?.name === color.name
                            ? 'border-luxury-950 scale-110 shadow-sm ring-1 ring-luxury-950'
                            : 'border-luxury-200'
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      >
                        {currentColor?.name === color.name && (
                          <Check className={`w-3 h-3 ${color.hex === '#121215' || color.hex === '#0f0f11' ? 'text-white' : 'text-luxury-950'}`} />
                        )}
                      </button>
                    ))}
                    <span className="text-[10px] text-luxury-400 ml-1">
                      {currentColor?.name || 'Classic'}
                    </span>
                  </div>
                </div>

                {/* Pricing & Action Buttons */}
                <div className="pt-3 border-t border-luxury-100 flex items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-base text-luxury-950">
                      {formatCurrency(displayPrice, currency, exchangeRate)}
                    </span>
                    {product.salePrice && (
                      <span className="text-xs line-through text-luxury-400 block -mt-1">
                        {formatCurrency(product.basePrice, currency, exchangeRate)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onConfigurePrescription(product, currentColor)}
                      className="px-3 py-2 bg-luxury-950 hover:bg-luxury-800 text-white rounded-xl text-xs font-semibold transition-all shadow-sm flex items-center gap-1"
                      title="Select prescription lenses & buy"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-gold" />
                      <span>Order</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </section>
  );
};
