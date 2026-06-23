# 🌿 Naithika Foods

> **"Principled Produce from Soil to Table"**

Naithika Foods (A Pinnacle Group Company) is a trusted brand specializing in 100% homemade, natural, and chemical-free food products. Rooted in ancestral wisdom and generational wellness, Naithika collaborates directly with ethical growers in the fertile hill landscapes of India to deliver high-quality dehydrated fruits, vegetables, pickles, and traditional spice powders.

Naithika is FSSAI approved, ensuring full transparency and compliance.

---

## 🌟 Core Values & Philosophy

*   **Naturally Cultivated:** All ingredients are cultivated naturally and are entirely free from synthetic preservatives, colors, or chemical additives.
*   **Ethical Farmer Partnerships:** We source directly from local farmers who practice sustainable, soil-first agriculture to protect the land.
*   **Soil Preservation:** True health starts in pure, alive soil. We support practices that restore and maintain the earth's natural vitality.
*   **Gentle Dehydration:** Our low-temperature dehydration process preserves peak freshness, locking in nutrients, natural flavors, and textures without shortcuts.
*   **Generational Wellness:** Nutrient-dense foods crafted to support healthy lifestyles for families and future generations.

---

## 📦 Product Offerings

Naithika Foods offers three main categories of premium products, conveniently accessible through our website:

### 1. Dehydrated Fruits & Fruit Leathers
Perfect for wholesome, guilt-free snacking or culinary use:
*   **Mango Slices:** Sweet, aromatic slices dehydrated from sun-ripened mangoes.
*   **Chikku (Sapota):** Fiber-rich slices featuring a comforting, caramel-like sweetness.
*   **Jamun (Black Plum):** Tangy-sweet native fruit slices known for their wellness benefits.
*   **Pineapple:** Golden rings packed with tropical flavor and Vitamin C.
*   **Guava:** Aromatic slices rich in nutrients and dietary fiber.
*   **Papaya:** Soft, digestively friendly slices with tender bite.
*   **Anjeer (Figs):** Sun-dried, honeyed figs loaded with essential minerals.
*   **Jackfruit:** Aromatic chewy slices preserving local tropical character.
*   **Banana:** Natural sweet chips (not oil-fried).
*   **Black Grapes:** Chewy, antioxidant-rich sun-dried grapes.
*   *Coming Soon:* Apple, Pomegranate Arils.

### 2. Dehydrated Vegetables & Herbs
Prep-friendly, highly shelf-stable ingredients for modern kitchens:
*   **Beetroot:** Deep red slices loaded with natural iron and betalains.
*   **Carrot:** Beta-carotene-rich sweet slices for quick cooking or snacking.
*   **Amla (Indian Gooseberry):** Vitamin C-packed tangy slices.
*   **Ginger:** Fragrant, warming slices for tea and spice blends.
*   **Ash Gourd (Petha):** Cooling pieces ideal for soups and wellness juices.
*   **Pumpkin:** Nutty golden flakes for porridges and baking.
*   **Lemon:** Zesty citrus slices for garnishes and teas.
*   **Moringa (Drumstick Leaves):** Nutrient-dense greens.
*   **Curry Leaves / Mint Leaves / Coriander:** Air-dried herbs preserving essential volatile oils.
*   *Coming Soon:* Tomato Slices.

### 3. Pickles & Powders (Podis)
Authentic home-style condiments and South Indian staples:
*   **Traditional Pickles:** Amla Pickle, Tomato Pickle, Red Chilli Pickle, Ginger Pickle, and Lemon Pickle. (*Coming Soon:* Mango Pickle).
*   **Moringa Podi:** Nutrient-packed drumstick leaf powder for daily meals.
*   **Nuvvula Podi:** Traditional sesame spice blend.
*   **Curry Patta Podi:** Rich curry leaf powder for rice and ghee.
*   **Idli Podi (Milagai Podi):** Classic spicy lentil-based breakfast condiment.
*   **Pappula Podi:** Roasted chana dal spice blend.
*   **Garlic Powder:** Savior flavor booster.
*   *Coming Soon:* Tomato Powder.

---

## 💻 Tech Stack & Architecture

This repository hosts the static e-commerce website for Naithika Foods, featuring an interactive shopping cart, recipes page, and dynamic product catalog.

*   **Frontend Core:** Clean, semantic HTML5, Vanilla CSS3 (custom responsive designs), and Vanilla ES6+ JavaScript.
*   **Styling Structure:** Organized into modular CSS sheets under the `static/` folder:
    *   `static/naithika_style.css` – General design token system, grid layouts, and header/footer styling.
    *   `static/naithika_about.css` – Section designs, values grid, and custom timeline components.
    *   `static/naithika_offer.css` – Promotional pages layouts.
*   **Interactive Features:**
    *   **Double-Sided Flipping Product Cards:** Desktop users can flip cards to see detailed nutritional values, while mobile users get a responsive inline view.
    *   **Client-Side Shopping Cart:** Uses JavaScript LocalStorage for a persistent shopping cart with auto-updating badges and smooth toast alerts on add-to-cart actions.
    *   **WhatsApp Checkout Link Integration:** Direct shopping conversion to WhatsApp (`wa.me` links) for convenient local ordering.
*   **Email Handler:** `contact.php` uses **PHPMailer** to securely route website contact forms directly to `naithikafoods@gmail.com` via Gmail SMTP.
*   **Environment Configuration:** Uses standard `.env` configuration (database credentials, etc.) for scalability.

---

## 📁 Repository Structure

```text
├── .env                       # Environment configuration (DB credentials)
├── .htaccess                  # Apache server configuration and routing
├── 404.html                   # Custom error page
├── about.html                 # Brand story, mission, and farmers partnership page
├── blog.html                  # Blog page
├── cart.html                  # Shopping cart management page
├── combo_offer.html           # Promotional bundle offers
├── composer.json / .lock      # PHP Composer dependencies (PHPMailer)
├── contact.html               # Contact form page
├── contact.php                # PHP script processing and emailing contact inquiries
├── dehydrated_fruits.html     # Dedicated category page: Fruits
├── dehydrated_vegetables.html # Dedicated category page: Vegetables
├── pickles_and_powders.html   # Dedicated category page: Pickles & Podis
├── herbal_tea.html            # Dedicated category page: Herbal Teas
├── index.html                 # E-commerce Home Page (carousel banners, sliders)
├── products.html              # Comprehensive product grid listing all categories
├── whychooseus.html           # Brand differentiator details page
├── reciepe.html               # Recipes and serving suggestions using Naithika products
├── termsandconditions.html    # Policy: Terms and conditions
├── privacypolicy.html         # Policy: Privacy Policy
├── returnsandrefund.html      # Policy: Returns and refund
├── shippingpolicy.html        # Policy: Shipping policy
├── sitemap.xml / robots.txt   # SEO & Search Engine indexing setup
├── fix_mobile.py              # Automation utility to add login links to mobile menus
├── server.py                  # Python-based lightweight developer server
├── static/                    # Frontend assets (JavaScript and CSS stylesheets)
│   ├── naithika.js            # Core JS handling menu triggers, cart badges, and popups
│   ├── naithika_style.css     # Global UI styling
│   ├── naithika_about.css     # About page styles
│   └── naithika_offer.css     # Offer page layouts
├── images_naithika/           # Optimized WebP assets, logos, and banners
└── realimages/                # Raw product photos used on the site
```

---

## 🛠️ Local Development & Setup

### Prerequisites
*   Python 3.x (to run the local testing server)
*   PHP (minimum 7.4) & Composer (to run the contact form functionality)

### 1. Launching the Local Server
A custom Python script is provided to quickly serve files locally while bypassing DNS issues:
```bash
python server.py
```
This serves the application at **`http://localhost:8000`**.

### 2. Setting Up PHP Dependencies
If you need to test the contact form locally:
1. Ensure Composer is installed.
2. Install dependencies:
   ```bash
   composer install
   ```
3. Update SMTP credentials in [contact.php](file:///e:/NAITHIKA/source/contact.php) if routing contact submissions dynamically.

---

## 📜 Business & Compliance Info

*   **Corporate Entity:** Naithika Foods (A Pinnacle Group Company)
*   **Registered Address:** Plot No 13, Jawahar Colony, Chandanagar, Hyderabad, Telangana, 500050.
*   **FSSAI License:** Approved (Details listed on the physical packaging)
*   **GSTN:** 36AAKCN9076E1Z2
*   **CIN:** U56290TS2025PTC204748

---

## 📞 Contact & Support

*   **Email:** [naithikafoods@gmail.com](mailto:naithikafoods@gmail.com)
*   **Phone / Support:** +91 8106025114 | +91 8125121347
*   **WhatsApp Support:** [+91 8125121347](https://wa.me/918125121347)
*   **Social Channels:**
    *   [Instagram](https://www.instagram.com/naithikafoods/)
    *   [Facebook](https://www.facebook.com/profile.php?id=61582765700542)
    *   [YouTube](https://www.youtube.com/@Naithikafoods)
