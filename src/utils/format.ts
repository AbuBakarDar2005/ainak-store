export function formatCurrency(amount: number, currency: 'PKR' | 'USD' = 'PKR', rate: number = 0.0036): string {
  if (currency === 'USD') {
    const usd = amount * rate;
    return `$${usd.toFixed(2)}`;
  }
  return `Rs. ${amount.toLocaleString()}`;
}

// Checklist #13: Pakistani phone and international validation
export function validatePhone(phone: string): boolean {
  // Matches +92 300 1234567, 03001234567, +923001234567, 0300-1234567
  const cleaned = phone.replace(/[\s\-]/g, '');
  const pkRegex = /^((\+92)|(0092)|(92)|(0))3[0-9]{9}$/;
  const generalRegex = /^\+?[0-9]{10,14}$/;
  return pkRegex.test(cleaned) || generalRegex.test(cleaned);
}

export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}
