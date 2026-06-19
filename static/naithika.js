// Header start

document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.header_mobile_menu_toggle');
    const mobileMenu = document.querySelector('.header_mobile_menu');
    const logoLink = document.getElementById('header_logo_image').closest('a');

    const toggleMobileMenu = () => {
        mobileMenu.classList.toggle('is-active');
        document.body.classList.toggle('no-scroll');
    };

    menuToggle.addEventListener('click', toggleMobileMenu);

    logoLink.addEventListener('click', () => {
        if (mobileMenu.classList.contains('is-active')) {
            mobileMenu.classList.remove('is-active');
            document.body.classList.remove('no-scroll');
        }
    });

    const mobileLinks = mobileMenu.querySelectorAll('.nav-link, .mobile-sub-item');
    mobileLinks.forEach(link => {
        link.addEventListener('click', toggleMobileMenu);
    });
});


// Header end


// Products page start


// Function to truncate text for the front face
        function truncateText(text, wordLimit) {
            // Remove the '...less' link text from the description before truncating
            let cleanedText = text.replace(/...less/i, '').trim(); 
            if (!cleanedText) return { truncatedText: "", isTruncated: false };

            const words = cleanedText.split(/\s+/).filter(word => word.length > 0);
            
            if (words.length > wordLimit) {
                return { 
                    truncatedText: words.slice(0, wordLimit).join(" ") + '...', // Add ellipsis
                    isTruncated: true 
                };
            }
            return { truncatedText: cleanedText, isTruncated: false };
        }

        function initProductCards() {
            const cards = document.querySelectorAll('.product-card');
            const wordLimit = 15; // Word limit for front face

            cards.forEach(card => {
                const innerCard = card.querySelector('.product-card-inner');
                // Get the text from the first paragraph in the back card content (which is the description)
                const fullDescriptionElement = card.querySelector('.product-card-back .product-full-content p:first-of-type');
                const shortDescriptionTextElement = card.querySelector('.product-short-description-text');
                const moreLink = card.querySelector('.product-more-link');
                const lessLink = card.querySelector('.product-less-link');

                if (fullDescriptionElement && shortDescriptionTextElement && moreLink) {
                    const fullText = fullDescriptionElement.textContent;

                    // Truncate text
                    const { truncatedText, isTruncated } = truncateText(fullText, wordLimit);
                    shortDescriptionTextElement.textContent = truncatedText;

                    if (isTruncated) {
                        moreLink.style.display = 'inline'; // Show "...more" link

                        // Click Event: Flip to the back
                        moreLink.addEventListener('click', (event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            innerCard.classList.add('is-flipped');
                        });
                    } else {
                        moreLink.style.display = 'none'; // Hide if not truncated
                    }
                }

                // Function to unflip the card
                function unflipCard(event) {
                    if (event) event.preventDefault(); // Prevent link navigation
                    innerCard.classList.remove('is-flipped');
                }

                // Mouse Leave: Flip back to front
                card.addEventListener('mouseleave', unflipCard);

                // Clicking the less link: Flip back
                if (lessLink) {
                    lessLink.addEventListener('click', unflipCard);
                }

            });
        }

        // Initialize on page load
        window.onload = function() {
            initProductCards();
        };


// Products page end


// Contact Us page start

    const contactusForm = document.getElementById('contactusForm');
    const contactusSuccessMessage = document.getElementById('contactusSuccessMessage');
    
    if (contactusForm) {
        // Function to show the success modal
        function contactusShowSuccess() {
            if(contactusSuccessMessage) contactusSuccessMessage.classList.remove('contactus-hidden');
        }
        // Function to hide the success modal and reset form
        function contactusHideSuccess(event) {
            // Prevent button click from closing the modal then closing it again via overlay
            if(event) event.stopPropagation(); 
            if(contactusSuccessMessage) contactusSuccessMessage.classList.add('contactus-hidden');
            contactusForm.reset(); // Clear the form fields
        }
        // Event listener for form submission
        contactusForm.addEventListener('submit', function(event) {
            // Prevent the default form submission behavior (which would reload the page)
            event.preventDefault();
            // Simulate form data processing
            console.log('Form submitted (simulated)');
            // Show the success message
            contactusShowSuccess();
        });
    }

// Contact Us page end



// Cart Badge Logic
function updateCartBadge() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let count = cart.reduce((acc, item) => acc + item.quantity, 0);
    let badges = document.querySelectorAll('.cart-badge');
    badges.forEach(badge => {
        if (count > 0) {
            badge.textContent = count;
            badge.style.display = 'inline-flex';
        } else {
            badge.style.display = 'none';
        }
    });
    
    if (typeof renderCartButtons === "function") {
        renderCartButtons();
    }
}

function renderCartButtons() {
    // Only apply on specific product listing pages
    let currentPage = window.location.pathname.split('/').pop().split('?')[0];
    let allowedPages = ['products.html', 'dehydrated_fruits.html', 'dehydrated_vegetables.html', 'pickles_and_powders.html', 'herbal_tea.html'];
    
    // Also handle case where URL might not have .html (e.g. clean URLs if hosted on Vercel/Netlify)
    let cleanPage = currentPage.replace('.html', '');
    let allowedCleanPages = allowedPages.map(p => p.replace('.html', ''));
    
    if (!allowedPages.includes(currentPage) && !allowedCleanPages.includes(cleanPage)) {
        return;
    }

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    
    // Find all addToCart buttons
    let buttons = document.querySelectorAll('button[onclick^="addToCart("]');
    buttons.forEach(btn => {
        if (!btn.parentElement.classList.contains('cart-action-wrapper')) {
            let wrapper = document.createElement('div');
            wrapper.className = 'cart-action-wrapper';
            wrapper.style.width = '100%';
            btn.parentNode.insertBefore(wrapper, btn);
            wrapper.appendChild(btn);
            
            wrapper.dataset.originalHtml = btn.outerHTML;
            let match = btn.getAttribute('onclick').match(/addToCart\(\s*['"]([^'"]+)['"]\s*,\s*(\d+)\s*,\s*['"]([^'"]+)['"]\s*\)/);
            if (match) {
                wrapper.dataset.name = match[1];
                wrapper.dataset.price = match[2];
                wrapper.dataset.image = match[3];
            }
        }
    });

    let wrappers = document.querySelectorAll('.cart-action-wrapper');
    wrappers.forEach(wrapper => {
        let name = wrapper.dataset.name;
        if (!name) return;
        
        let cartItem = cart.find(item => item.name === name);
        if (cartItem && cartItem.quantity > 0) {
            if (!wrapper.querySelector('.quantity-selector')) {
                wrapper.innerHTML = `
                    <div class="quantity-selector" style="display: flex; align-items: center; justify-content: space-between; border: 1px solid #e97b06; border-radius: 6px; overflow: hidden; width: 100%; height: 40px; background: #fff;">
                        <button onclick="updateQtyFromCard('${name}', -1, ${wrapper.dataset.price}, '${wrapper.dataset.image}')" style="background: transparent; color: #e97b06; border: none; width: 40px; cursor: pointer; font-size: 20px; height: 100%; transition: background 0.2s;">−</button>
                        <span class="qty-val" style="font-weight: 600; font-size: 16px; color: #333;">${cartItem.quantity}</span>
                        <button onclick="updateQtyFromCard('${name}', 1, ${wrapper.dataset.price}, '${wrapper.dataset.image}')" style="background: transparent; color: #e97b06; border: none; width: 40px; cursor: pointer; font-size: 20px; height: 100%; transition: background 0.2s;">+</button>
                    </div>
                `;
            } else {
                wrapper.querySelector('.qty-val').textContent = cartItem.quantity;
            }
        } else {
            if (wrapper.querySelector('.quantity-selector')) {
                wrapper.innerHTML = wrapper.dataset.originalHtml;
            }
        }
    });
}

function updateQtyFromCard(name, change, price, image) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let existingProduct = cart.find(item => item.name === name);
    
    if (existingProduct) {
        existingProduct.quantity += change;
        existingProduct.price = Number(existingProduct.price) || Number(price) || 0;
        if (existingProduct.quantity <= 0) {
            cart = cart.filter(item => item.name !== name);
            if (typeof showToast === "function") showToast(`${name} removed from cart`);
        }
    } else if (change > 0) {
        cart.push({ name, price: Number(price) || 0, image, quantity: 1 });
        if (typeof showToast === "function") showToast(`${name} has been added to your cart`);
    }
    
    localStorage.setItem("cart", JSON.stringify(cart));
    if (typeof updateCartBadge === "function") updateCartBadge();
    if (typeof renderCart === "function") renderCart();
}

document.addEventListener('DOMContentLoaded', updateCartBadge);


// --- GLOBAL AUTHENTICATION SYSTEM (DISABLED) ---
function openAccount() {}
function updateAuthNavLinks() {}

function naithikaAlert(message, isError=false) {
    let toast = document.createElement("div");
    let iconSvg = isError ? 
        '<svg width="28" height="28" viewBox="0 0 24 24" fill="#d32f2f"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>' : 
        '<svg width="28" height="28" viewBox="0 0 24 24" fill="#2e7d32"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>';
    
    toast.innerHTML = `
        <div style="display: flex; align-items: center; width: 100%;">
            <div style="margin-right: 16px; display: flex; align-items: center; justify-content: center;">
                ${iconSvg}
            </div>
            <div style="flex-grow: 1; color: #333333; font-size: 16px; font-weight: 500; font-family: 'Inter', sans-serif;">
                ${message}
            </div>
            <div class="toast-close" style="margin-left: 16px; cursor: pointer; color: #9aa0a6; font-size: 20px; font-weight: bold; line-height: 1;">
                &times;
            </div>
        </div>
    `;

    Object.assign(toast.style, {
        position: "fixed",
        top: "44px",
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "#ffffff",
        padding: "16px 20px",
        borderRadius: "12px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
        zIndex: "10000",
        opacity: "0",
        transition: "opacity 0.4s ease, top 0.4s ease",
        minWidth: "320px",
        maxWidth: "90%",
        borderLeft: isError ? "6px solid #d32f2f" : "6px solid #2e7d32"
    });

    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = "1"; toast.style.top = "64px"; }, 10);

    let hideTimeout = setTimeout(() => hideToast(toast), 3000);
    toast.querySelector(".toast-close").onclick = () => { clearTimeout(hideTimeout); hideToast(toast); };
    
    function hideToast(el) {
        el.style.opacity = "0"; el.style.top = "44px";
        setTimeout(() => { if (document.body.contains(el)) document.body.removeChild(el); }, 400);
    }
}
