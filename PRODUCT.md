# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary Shoppers:** Style-conscious Pakistani consumers seeking luxury eyewear (prescription frames and designer sunglasses) with exact fit confidence, digital blue light screen defense, and verified optometry backing.
- **Partner Opticians & Clinics:** Independent optical clinic owners across Pakistan (e.g., Tariq Optical Service) who manage local clinic eye exams, lens fitting appointments, and retail frame availability.
- **Master Administrator:** Store executive / SuperAdmin overseeing nationwide orders, catalog pricing, lens customization rules, and partner clinic credentials.

## Product Purpose

NEXT VISION bridges luxury eyewear e-commerce with trusted local optometry care in Pakistan. It eliminates the traditional anxiety of buying prescription glasses online by combining real-time camera AR try-on, specialized lens customization (blue-cut, photochromic, anti-glare, smart optics), and direct booking with physical partner optical clinics across Pakistani cities.

## Positioning

Omnichannel luxury couture optics for Pakistan: virtual AR fitting + high-definition customized lens crafting + physical partner optical network. Unlike generic drop-shippers, NEXT VISION provides computerized eye exam bookings at verified neighborhood optical clinics and seamless WhatsApp concierge assistance.

## Operating Context

- **Geographic Focus:** Pakistan (Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, Gujranwala, Sialkot, Quetta).
- **Currency & Payments:** Primary PKR (Pakistani Rupee) with secondary USD toggle. Cash on Delivery (COD) and direct WhatsApp order confirmation.
- **Physical Integration:** Partner stores offer Free Computerized Eye Tests, same-day lens fitting, and prescription verification.
- **Logistics & Dispatch:** Integrated order tracking, TCS/courier dispatch notes, and automated Google Sheets sync.

## Capabilities and Constraints

- **Live AR Virtual Try-On:** Interactive 3D and 2D canvas face-mesh frame previews with webcam feed or user photo upload.
- **Lens Customizer & Configurator:** Five primary lens categories (Blue Light Screen Shield, Photochromic Daylight Transition, Anti-Glare + Blue Cut, High-Quality UV400 Master, and Tri-Active Smart Glasses) with admin pricing controls.
- **Interactive Store & Clinic Locator:** Leaflet-powered maps and filtering by city, amenities (kiosk, free eye test, same-day fitting), and real-time appointment booking.
- **Role-Based Admin Access:**
  - *Main SuperAdmin* (`darmuhammadabubakar9`): Master control over store catalog, orders, partner approvals, business automations, and global settings.
  - *Partner Admins*: Dedicated clinic console displaying clinic branding, catalog management, and strictly scoped clinic-specific eyesight exam reservations.
- **Technical Stack:** React 19, TypeScript, Tailwind CSS, Vite, Express.js backend with JSON persistence.

## Brand Commitments

- **Name:** NEXT VISION (tagline: "Pakistan's Premier Eyewear Destination").
- **Visual Aesthetic:** Obsidian luxury black (`#09090b`), warm champagne gold accents (`#d4af37`), crisp architectural typography (serif headings paired with clean sans body).
- **Tone:** Refined, authoritative, couture, reassuringly clinical yet elevated.

## Evidence on Hand

- Fully functional e-commerce catalog with live product inventory, multi-color variants, and technical frame specifications.
- Verified partner clinic database spanning major Pakistani metropolitan centers.
- Working appointments system with `#EB-...` booking references and automated WhatsApp dispatch templates.

## Product Principles

1. **Precision & Trust:** Optical health requires zero guesswork. Every frame specifies millimeter dimensions and connects to verified optometrists.
2. **Seamless Omnichannel:** The customer journey flows naturally between digital AR try-on and physical clinic examination.
3. **Restrained Luxury:** Deep obsidian backgrounds, champagne gold highlights, and uncluttered layouts evoke high-end bespoke atelier craft without sacrificing scanability.
4. **Partner Empowerment:** Partner optical shops are first-class participants in the ecosystem, with dedicated clinic dashboards and protected appointment data.

## Accessibility & Inclusion

- Keyboard navigability across catalog modals, drawer states, and appointment booking flows.
- High-contrast text compliance against dark luxury backdrops.
- Fallback photo upload for users without webcam or WebGL support for AR try-on.
