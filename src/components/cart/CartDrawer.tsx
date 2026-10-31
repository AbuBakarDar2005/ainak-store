import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Tag } from 'lucide-react';
import { CartItem } from '../../types';
import { formatCurrency } from '../../utils/format';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (itemId: string, newQty: number) => void;
  onRemoveItem: (itemId: string) => void;
  onProceedToCheckout: (discountPercent?: number, promoCode?: string) => void;
  currency: 'PKR' | 'USD';
  exchangeRate: number;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  currency,
  exchangeRate
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoMessage, setPromoMessage] = useState<{ text: string; isError: boolean } | null>(null);

  if (!isOpen) return null;

  const rawSubtotal = cart.reduce((sum, item) => {
    if (!item || !item.product) return sum;
    const itemLensPrice = item.lensOption?.price || 0;
    const base = item.product.salePrice != null ? item.product.salePrice : (item.product.basePrice || 0);
    return sum + (base + itemLensPrice) * (item.quantity || 1);
  }, 0);

  const discountAmount = Math.round(rawSubtotal * (discountPercent / 100));
  const subtotal = rawSubtotal - discountAmount;
  const shippingFee = subtotal >= 5000 || cart.length === 0 ? 0 : 250;
  const total = subtotal + shippingFee;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoCode.trim().toUpperCase();
    if (code === 'NEXTVISION' || code === 'NEXTVISION2026' || code === 'AINAK2026' || code === 'LUXURY10') {
      setDiscountPercent(10);
      setPromoMessage({ text: '10% NEXT VISION promo code applied!', isError: false });
    } else {
      setPromoMessage({ text: 'Invalid promo code. Try "NEXTVISION"', isError: true });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      <div
        className="absolute inset-0 bg-luxury-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-luxury-200">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-luxury-100 flex items-center justify-between bg-luxury-50">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-luxury-950" />
              <h3 className="font-serif font-bold text-lg text-luxury-950">Your Cart</h3>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-luxury-200 text-luxury-800">
                {cart.reduce((total, i) => total + i.quantity, 0)} items
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-luxury-400 hover:text-luxury-950 rounded-full hover:bg-luxury-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="px-6 py-3 bg-luxury-100 border-b border-luxury-200 text-xs text-luxury-800">
            {subtotal >= 5000 ? (
              <p className="font-semibold text-emerald-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Free express delivery unlocked across Pakistan!
              </p>
            ) : (
              <div>
                <p className="text-[11px] text-luxury-600 mb-1">
                  Add <strong className="text-luxury-950">{formatCurrency(5000 - subtotal, currency, exchangeRate)}</strong> more for free nationwide shipping.
                </p>
                <div className="w-full bg-luxury-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-luxury-950 h-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (subtotal / 5000) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-luxury-400">
                <ShoppingBag className="w-12 h-12 stroke-[1.2] mb-3 text-luxury-300" />
                <h4 className="font-serif text-lg font-bold text-luxury-800 mb-1">Your cart is empty</h4>
                <p className="text-xs max-w-xs mb-6">
                  Explore our handcrafted optical frames and sunglasses to begin your virtual try-on.
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-luxury-950 text-white rounded-xl text-xs font-bold hover:bg-luxury-800 transition-colors"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              cart.map((item) => {
                const itemLensPrice = item.lensOption?.price || 0;
                const unitPrice = (item.product.salePrice || item.product.basePrice) + itemLensPrice;

                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl border border-luxury-200 bg-white shadow-sm flex gap-3.5 relative group"
                  >
                    <img
                      src={item.product.images[0]}
                      alt={item.product.title}
                      className="w-20 h-20 object-cover rounded-lg bg-luxury-50 shrink-0 border border-luxury-100"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-semibold text-xs text-luxury-950 truncate">
                          {item.product.title}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="text-luxury-400 hover:text-red-500 transition-colors p-0.5"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-luxury-500">
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-luxury-300"
                          style={{ backgroundColor: item.selectedColor.hex }}
                        />
                        <span>{item.selectedColor.name}</span>
                      </div>

                      {/* Configured Lens Badge */}
                      {item.lensOption && (
                        <div className="mt-1 px-2 py-0.5 rounded bg-luxury-100 text-[10px] text-luxury-700 w-fit">
                          {item.lensOption.type} {item.lensOption.price > 0 && `(+${formatCurrency(item.lensOption.price, currency, exchangeRate)})`}
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-luxury-200 rounded-lg bg-luxury-50">
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            className="p-1 text-luxury-600 hover:text-luxury-950"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="p-1 text-luxury-600 hover:text-luxury-950"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-xs font-bold text-luxury-950">
                          {formatCurrency(unitPrice * item.quantity, currency, exchangeRate)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Checkout Summary */}
          {cart.length > 0 && (
            <div className="p-6 bg-luxury-50 border-t border-luxury-100 space-y-4">
              
              {/* Promo code form */}
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 absolute left-3 top-3 text-luxury-400" />
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Promo code (e.g. NEXTVISION)"
                    className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-luxury-200 rounded-lg uppercase placeholder:normal-case focus:outline-none focus:border-luxury-950"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-luxury-200 hover:bg-luxury-300 text-luxury-950 text-xs font-semibold rounded-lg transition-colors"
                >
                  Apply
                </button>
              </form>

              {promoMessage && (
                <p className={`text-[11px] ${promoMessage.isError ? 'text-red-500' : 'text-emerald-600 font-medium'}`}>
                  {promoMessage.text}
                </p>
              )}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-luxury-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(rawSubtotal, currency, exchangeRate)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount ({discountPercent}%)</span>
                    <span>-{formatCurrency(discountAmount, currency, exchangeRate)}</span>
                  </div>
                )}
                <div className="flex justify-between text-luxury-600">
                  <span>Standard Shipping</span>
                  <span>{shippingFee === 0 ? <strong className="text-emerald-700">FREE</strong> : formatCurrency(shippingFee, currency, exchangeRate)}</span>
                </div>
                <div className="pt-2 border-t border-luxury-200 flex justify-between font-bold text-sm text-luxury-950">
                  <span>Total</span>
                  <span>{formatCurrency(total, currency, exchangeRate)}</span>
                </div>
              </div>

              {/* Checkout Action Button */}
              <button
                onClick={() => onProceedToCheckout(discountPercent, promoCode)}
                className="w-full py-3.5 bg-luxury-950 hover:bg-luxury-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.99]"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
