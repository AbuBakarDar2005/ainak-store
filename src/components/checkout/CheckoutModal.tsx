import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, ShieldCheck, Truck, CreditCard, Banknote, AlertCircle, Sparkles, ArrowRight, MessageCircle, UserCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CartItem, CustomerDetails, Order } from '../../types';
import { formatCurrency, validatePhone, validateEmail } from '../../utils/format';
import { trackEvent } from '../../utils/analytics';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onOrderSuccess: (order: Order) => void;
  currency: 'PKR' | 'USD';
  exchangeRate: number;
}

const PAKISTAN_CITIES = [
  "Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad",
  "Multan", "Peshawar", "Quetta", "Sialkot", "Gujranwala",
  "Hyderabad", "Bahawalpur", "Sargodha", "Abbottabad", "Other"
];

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  onOrderSuccess,
  currency,
  exchangeRate
}) => {
  const [formData, setFormData] = useState<CustomerDetails>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: 'Lahore',
    province: 'Punjab',
    postalCode: ''
  });

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card'>('cod');
  const [notes, setNotes] = useState('');
  const [honeypot, setHoneypot] = useState(''); // Anti-spam honeypot
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [whatsAppUrl, setWhatsAppUrl] = useState<string | null>(null);

  // Mandatory requirement: Every user placing an order MUST fill in their details freshly for every purchase
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: 'Lahore',
        province: 'Punjab',
        postalCode: ''
      });
      setErrors({});
      setCompletedOrder(null);
      setWhatsAppUrl(null);
      setNotes('');
      setPaymentMethod('cod');
      setHoneypot('');
    }
  }, [isOpen]);

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      city: 'Lahore',
      province: 'Punjab',
      postalCode: ''
    });
    setCompletedOrder(null);
    setWhatsAppUrl(null);
    setErrors({});
    setNotes('');
    onClose();
  };

  if (!isOpen) return null;

  const rawSubtotal = cart.reduce((sum, item) => {
    if (!item || !item.product) return sum;
    const itemLensPrice = item.lensOption?.price || 0;
    const base = item.product.salePrice != null ? item.product.salePrice : (item.product.basePrice || 0);
    return sum + (base + itemLensPrice) * (item.quantity || 1);
  }, 0);

  const shippingFee = rawSubtotal >= 5000 ? 0 : 250;
  const total = rawSubtotal + shippingFee;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim() || formData.name.trim().length < 3) {
      newErrors.name = 'Full name is required (minimum 3 characters)';
    }
    if (!formData.email.trim() || !validateEmail(formData.email.trim())) {
      newErrors.email = 'Valid email address required for order receipts';
    }
    if (!formData.phone.trim() || !validatePhone(formData.phone.trim())) {
      newErrors.phone = 'Valid phone required (e.g. 0300 1234567 or +92 300 1234567)';
    }
    if (!formData.address.trim() || formData.address.trim().length < 8) {
      newErrors.address = 'Complete delivery street address required (house #, street, area)';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'Please select a delivery city';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const orderPayload = {
        customer: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          city: formData.city.trim(),
          province: formData.province.trim(),
          postalCode: (formData.postalCode || '').trim()
        },
        items: cart.map(item => ({
          productId: item.product.id,
          title: item.product.title,
          color: item.selectedColor.name,
          price: item.product.salePrice || item.product.basePrice,
          quantity: item.quantity,
          lensOption: item.lensOption
        })),
        paymentMethod: paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Credit / Debit Card (Online)',
        notes: notes.trim(),
        honeypot // Checklist #14: honeypot field
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCompletedOrder(data.order);
        if (data.whatsAppUrl) {
          setWhatsAppUrl(data.whatsAppUrl);
        }
        onOrderSuccess(data.order);
        trackEvent('order_completed', { orderId: data.order.id, total: data.order.total });

        // Confetti celebration
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#d4af37', '#09090b', '#f59e0b', '#ffffff']
          });
        } catch (_) {}
      } else {
        alert(data.error || 'Failed to process order. Please try again.');
      }
    } catch (err) {
      console.error("Order error:", err);
      alert("Network error processing order. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-luxury-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden my-auto border border-luxury-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-luxury-50 border-b border-luxury-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-champagne-600" />
            <h3 className="font-serif font-bold text-lg text-luxury-950">
              {completedOrder ? 'Order Confirmation' : 'Secure Checkout'}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-luxury-400 hover:text-luxury-950 rounded-full hover:bg-luxury-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Completed Order State */}
        {completedOrder ? (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                Order Received Successfully
              </span>
              <h4 className="font-serif text-2xl font-bold text-luxury-950 mt-3">
                Thank You, {completedOrder.customer.name}!
              </h4>
              <p className="text-xs text-luxury-500 mt-1 max-w-md mx-auto leading-relaxed">
                Your order <strong className="text-luxury-950 font-mono">{completedOrder.id}</strong> has been logged into our optical lab. A confirmation SMS & email have been dispatched.
              </p>
            </div>

            <div className="bg-luxury-50 p-5 rounded-xl border border-luxury-200 max-w-lg mx-auto text-left text-xs space-y-2">
              <div className="flex justify-between border-b border-luxury-200 pb-2 font-bold text-luxury-950">
                <span>Delivery Address:</span>
                <span className="text-right font-normal">{completedOrder.customer.address}, {completedOrder.customer.city}</span>
              </div>
              <div className="flex justify-between border-b border-luxury-200 pb-2">
                <span className="text-luxury-600">Payment Mode:</span>
                <span className="font-semibold text-luxury-950">{completedOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between border-b border-luxury-200 pb-2">
                <span className="text-luxury-600">Estimated Delivery:</span>
                <span className="font-semibold text-luxury-950">2 - 4 Business Days (TCS Express)</span>
              </div>
              <div className="flex justify-between pt-1 font-bold text-sm text-luxury-950">
                <span>Total Amount:</span>
                <span className="text-champagne-700">{formatCurrency(completedOrder.total, currency, exchangeRate)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              {whatsAppUrl && (
                <a
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-7 py-3 bg-[#25D366] hover:bg-[#1ebd59] text-white rounded-xl text-xs font-bold shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Send & Confirm on WhatsApp</span>
                </a>
              )}
              <button
                onClick={handleClose}
                className="w-full sm:w-auto px-6 py-3 bg-luxury-950 hover:bg-luxury-800 text-white rounded-xl text-xs font-bold shadow transition-all"
              >
                Back to Catalog
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handleSubmit} autoComplete="off" noValidate className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Left Column: Customer & Shipping (7 Cols) */}
            <div className="md:col-span-7 space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="font-serif font-bold text-sm text-luxury-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-champagne-600" /> Shipping & Customer Details
                </h4>
                <span className="text-[10px] uppercase font-bold tracking-wider text-champagne-700 bg-champagne-100 px-2 py-0.5 rounded-full">
                  Fresh Details Required
                </span>
              </div>

              {/* Mandatory Customer Information Notice */}
              <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3 flex items-start gap-2.5 text-[11px] text-amber-950">
                <UserCheck className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-950">Customer Verification Required For Every Order</p>
                  <p className="text-amber-800 leading-relaxed mt-0.5">
                    For secure courier dispatch via TCS & Leopard Express, please enter your contact and shipping information for this purchase.
                  </p>
                </div>
              </div>

              {/* Invisible Honeypot Field (Checklist #14 - catches spambots) */}
              <input
                type="text"
                name="user_confirm_token_hp"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-luxury-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Hamza Tariq"
                    autoComplete="off"
                    spellCheck={false}
                    className={`w-full text-xs p-2.5 rounded-lg border bg-white ${
                      errors.name ? 'border-red-500' : 'border-luxury-300'
                    }`}
                  />
                  {errors.name && <p className="text-[10px] text-red-500 mt-0.5">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-luxury-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0300 1234567"
                    autoComplete="off"
                    spellCheck={false}
                    className={`w-full text-xs p-2.5 rounded-lg border bg-white ${
                      errors.phone ? 'border-red-500' : 'border-luxury-300'
                    }`}
                  />
                  {errors.phone && <p className="text-[10px] text-red-500 mt-0.5">{errors.phone}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-luxury-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com"
                  autoComplete="off"
                  spellCheck={false}
                  className={`w-full text-xs p-2.5 rounded-lg border bg-white ${
                    errors.email ? 'border-red-500' : 'border-luxury-300'
                  }`}
                />
                {errors.email && <p className="text-[10px] text-red-500 mt-0.5">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-luxury-700 mb-1">Delivery Street Address *</label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="House / Apartment #, Street #, Sector / Phase"
                  autoComplete="off"
                  spellCheck={false}
                  className={`w-full text-xs p-2.5 rounded-lg border bg-white ${
                    errors.address ? 'border-red-500' : 'border-luxury-300'
                  }`}
                />
                {errors.address && <p className="text-[10px] text-red-500 mt-0.5">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-luxury-700 mb-1">City *</label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-luxury-300 bg-white"
                  >
                    {PAKISTAN_CITIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-luxury-700 mb-1">Province</label>
                  <select
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-luxury-300 bg-white"
                  >
                    <option>Punjab</option>
                    <option>Sindh</option>
                    <option>Khyber Pakhtunkhwa</option>
                    <option>Balochistan</option>
                    <option>Islamabad Capital Territory</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-luxury-700 mb-1">Order Notes (Optional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Call before delivery or leave with gatekeeper"
                  className="w-full text-xs p-2 rounded-lg border border-luxury-300 bg-white"
                />
              </div>
            </div>

            {/* Right Column: Payment & Order Summary (5 Cols) */}
            <div className="md:col-span-5 bg-luxury-50 p-5 rounded-xl border border-luxury-200 flex flex-col justify-between">
              <div>
                <h4 className="font-serif font-bold text-sm text-luxury-950 uppercase tracking-wider mb-3">
                  Payment Method
                </h4>

                <div className="space-y-2 mb-4">
                  <label
                    onClick={() => setPaymentMethod('cod')}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-luxury-950 bg-white ring-1 ring-luxury-950'
                        : 'border-luxury-200 bg-white/70'
                    }`}
                  >
                    <Banknote className="w-5 h-5 text-emerald-600" />
                    <div className="flex-1 text-xs">
                      <span className="font-bold text-luxury-950 block">Cash on Delivery (COD)</span>
                      <span className="text-luxury-500 text-[10px]">Pay cash when courier arrives</span>
                    </div>
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-luxury-950 flex items-center justify-center">
                      {paymentMethod === 'cod' && <span className="w-2 h-2 rounded-full bg-luxury-950"></span>}
                    </span>
                  </label>

                  <label
                    onClick={() => setPaymentMethod('card')}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      paymentMethod === 'card'
                        ? 'border-luxury-950 bg-white ring-1 ring-luxury-950'
                        : 'border-luxury-200 bg-white/70'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-luxury-950" />
                    <div className="flex-1 text-xs">
                      <span className="font-bold text-luxury-950 block">Credit / Debit Card</span>
                      <span className="text-luxury-500 text-[10px]">Visa, Mastercard, PayPak</span>
                    </div>
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-luxury-950 flex items-center justify-center">
                      {paymentMethod === 'card' && <span className="w-2 h-2 rounded-full bg-luxury-950"></span>}
                    </span>
                  </label>
                </div>

                {/* Items Mini List */}
                <h4 className="font-serif font-bold text-xs text-luxury-950 uppercase tracking-wider mb-2">
                  Order Summary ({cart.length} items)
                </h4>
                <div className="max-h-36 overflow-y-auto space-y-2 mb-4 text-xs">
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between items-center text-luxury-800">
                      <span className="truncate max-w-[170px]">{item.product.title} x{item.quantity}</span>
                      <span className="font-semibold">
                        {formatCurrency((item.product.salePrice || item.product.basePrice + (item.lensOption?.price || 0)) * item.quantity, currency, exchangeRate)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="border-t border-luxury-200 pt-3 space-y-1.5 text-xs">
                  <div className="flex justify-between text-luxury-600">
                    <span>Subtotal</span>
                    <span>{formatCurrency(rawSubtotal, currency, exchangeRate)}</span>
                  </div>
                  <div className="flex justify-between text-luxury-600">
                    <span>Shipping</span>
                    <span>{shippingFee === 0 ? <strong className="text-emerald-700">FREE</strong> : formatCurrency(shippingFee, currency, exchangeRate)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-luxury-950 pt-2 border-t border-luxury-300">
                    <span>Total Payable</span>
                    <span className="text-champagne-700">{formatCurrency(total, currency, exchangeRate)}</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-5">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-luxury-950 hover:bg-luxury-800 disabled:opacity-50 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-[0.99]"
                >
                  {isSubmitting ? (
                    <span>Confirming Order...</span>
                  ) : (
                    <>
                      <span>Place Order Now</span>
                      <ArrowRight className="w-4 h-4 text-gold" />
                    </>
                  )}
                </button>
                <p className="text-[10px] text-center text-luxury-400 mt-2">
                  🔒 256-bit Encrypted Checkout • 7-Day Replacement Guarantee
                </p>
              </div>

            </div>

          </form>
        )}

      </div>
    </div>
  );
};
