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
        if (existingProduct.quantity <= 0) {
            cart = cart.filter(item => item.name !== name);
            if (typeof showToast === "function") showToast(`${name} removed from cart`);
        }
    } else if (change > 0) {
        cart.push({ name, price, image, quantity: 1 });
        if (typeof showToast === "function") showToast(`${name} has been added to your cart`);
    }
    
    localStorage.setItem("cart", JSON.stringify(cart));
    if (typeof updateCartBadge === "function") updateCartBadge();
    if (typeof renderCart === "function") renderCart();
}

document.addEventListener('DOMContentLoaded', updateCartBadge);


// --- GLOBAL AUTHENTICATION SYSTEM ---
document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('authModalOverlay')) {
        let authHtml = `
        <div id="authModalOverlay" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:9999; justify-content:center; align-items:center;">
            <div style="background:#fff; border-radius:12px; width:400px; max-width:90%; padding:20px; font-family:'Inter', sans-serif; position:relative; max-height:90vh; overflow-y:auto;">
                <button onclick="document.getElementById('authModalOverlay').style.display='none'" style="position:absolute; right:15px; top:15px; background:none; border:none; font-size:24px; cursor:pointer; color:#777;">&times;</button>
                <div style="display:flex; border-bottom:1px solid #ccc; margin-bottom:20px;">
                    <div id="tab-login" onclick="switchAuthTab('login')" style="flex:1; text-align:center; padding:10px; cursor:pointer; font-weight:bold; color:#777; border-bottom:2px solid transparent;">Login</div>
                    <div id="tab-register" onclick="switchAuthTab('register')" style="flex:1; text-align:center; padding:10px; cursor:pointer; font-weight:bold; color:#e97b06; border-bottom:2px solid #e97b06;">Register</div>
                </div>
                <div id="form-login" style="display:none;">
                    <h3 style="margin-top:0; color:#333;">Welcome Back</h3>
                    <input type="text" id="loginUsername" placeholder="Email or Contact Number" style="width:100%; padding:10px; margin-bottom:15px; border:1px solid #ccc; border-radius:6px; box-sizing:border-box;">
                    <input type="password" id="loginPassword" placeholder="Password" style="width:100%; padding:10px; margin-bottom:15px; border:1px solid #ccc; border-radius:6px; box-sizing:border-box;">
                    <button onclick="submitLogin()" style="width:100%; padding:10px; background:#e97b06; color:#fff; border:none; border-radius:6px; font-weight:bold; cursor:pointer;">Login</button>
                </div>
                <div id="form-register">
                    <h3 style="margin-top:0; color:#333;">Create Account</h3>
                    <input type="text" id="regName" placeholder="Full Name" style="width:100%; padding:10px; margin-bottom:10px; border:1px solid #ccc; border-radius:6px; box-sizing:border-box;">
                    <input type="tel" id="regContact" placeholder="Contact Number" style="width:100%; padding:10px; margin-bottom:10px; border:1px solid #ccc; border-radius:6px; box-sizing:border-box;" oninput="this.value = this.value.replace(/[^0-9]/g, '');" onblur="validateContactRealTime(this)" maxlength="10">
                    <input type="email" id="regEmail" placeholder="Email Address" style="width:100%; padding:10px; margin-bottom:10px; border:1px solid #ccc; border-radius:6px; box-sizing:border-box;" onblur="validateEmailRealTime(this)">
                    <textarea id="regAddress" placeholder="Shipping Address" rows="3" style="width:100%; padding:10px; margin-bottom:10px; border:1px solid #ccc; border-radius:6px; box-sizing:border-box;"></textarea>
                    <input type="password" id="regPassword" placeholder="Password" onkeyup="checkPassword()" style="width:100%; padding:10px; margin-bottom:5px; border:1px solid #ccc; border-radius:6px; box-sizing:border-box;">
                    <div id="pwdError" style="color:red; font-size:12px; margin-bottom:10px; display:none;">Must be >6 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char</div>
                    <button id="regBtn" onclick="submitRegister()" style="width:100%; padding:10px; background:#ccc; color:#fff; border:none; border-radius:6px; font-weight:bold; cursor:not-allowed;" disabled>Register</button>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', authHtml);
    }
    updateAuthNavLinks();
});

function openAccount() {
    let user = JSON.parse(sessionStorage.getItem('naithika_user'));
    if (user) {
        window.location.href = "profile.html";
    } else {
        document.getElementById('authModalOverlay').style.display = 'flex';
        switchAuthTab('login');
    }
}

function updateAuthNavLinks() {
    let user = JSON.parse(sessionStorage.getItem('naithika_user'));
    let links = document.querySelectorAll('.auth-nav-link');
    links.forEach(link => {
        link.textContent = user ? "PROFILE" : "LOGIN";
    });
}

function switchAuthTab(tab) {
    document.getElementById('form-login').style.display = tab === 'login' ? 'block' : 'none';
    document.getElementById('form-register').style.display = tab === 'register' ? 'block' : 'none';
    document.getElementById('tab-login').style.color = tab === 'login' ? '#e97b06' : '#777';
    document.getElementById('tab-login').style.borderBottomColor = tab === 'login' ? '#e97b06' : 'transparent';
    document.getElementById('tab-register').style.color = tab === 'register' ? '#e97b06' : '#777';
    document.getElementById('tab-register').style.borderBottomColor = tab === 'register' ? '#e97b06' : 'transparent';
}

function checkPassword() {
    let pwd = document.getElementById('regPassword').value;
    let err = document.getElementById('pwdError');
    let btn = document.getElementById('regBtn');
    let valid = pwd.length > 6 && /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd);
    if (pwd.length > 0 && !valid) {
        err.style.display = 'block'; btn.disabled = true; btn.style.background = '#ccc'; btn.style.cursor = 'not-allowed';
    } else if (valid) {
        err.style.display = 'none'; btn.disabled = false; btn.style.background = '#e97b06'; btn.style.cursor = 'pointer';
    } else {
        err.style.display = 'none'; btn.disabled = true; btn.style.background = '#ccc'; btn.style.cursor = 'not-allowed';
    }
    return valid;
}

function submitRegister() {
    if (!checkPassword()) return;
    let name = document.getElementById('regName').value;
    let contact = document.getElementById('regContact').value;
    let email = document.getElementById('regEmail').value;
    let addr = document.getElementById('regAddress').value;
    let pwd = document.getElementById('regPassword').value;
    if(!name || !contact || !email || !addr) { naithikaAlert("Please fill all fields", true); return; }
    
    let contactRegex = /^[0-9]{10}$/;
    if (!contactRegex.test(contact)) {
        naithikaAlert("Please enter a valid 10-digit mobile number.", true);
        return;
    }
    
    let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        naithikaAlert("Please enter a valid email address.", true);
        return;
    }
    
    let payload = { action: 'register', name, contact_number: contact, email, address: addr, password: pwd };
    fetch('auth.php', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload) })
    .then(r => r.json())
    .then(data => {
        if (data.status === 'success') {
            naithikaAlert("Registration successful! Please login to continue.");
            // Clear registration fields
            document.getElementById('regName').value = '';
            document.getElementById('regContact').value = '';
            document.getElementById('regEmail').value = '';
            document.getElementById('regAddress').value = '';
            document.getElementById('regPassword').value = '';
            // Switch to login tab automatically
            switchAuthTab('login');
        } else { naithikaAlert(data.message, true); }
    }).catch(e => { naithikaAlert("Registration failed. Server might be down.", true); });
}

function submitLogin() {
    let un = document.getElementById('loginUsername').value;
    let pw = document.getElementById('loginPassword').value;
    if(!un || !pw) { naithikaAlert("Please enter username and password", true); return; }
    let payload = { action: 'login', username: un, password: pw };
    fetch('auth.php', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload) })
    .then(r => r.json())
    .then(data => {
        if (data.status === 'success') {
            sessionStorage.setItem('naithika_user', JSON.stringify(data.user));
            document.getElementById('authModalOverlay').style.display = 'none';
            updateAuthNavLinks();
            if (typeof processCheckout === 'function') { processCheckout(); } // if in cart
            else { window.location.href = "profile.html"; }
        } else { if (data.status === "success") { naithikaAlert(data.message); } else { naithikaAlert(data.message, true); } }
    }).catch(e => { naithikaAlert("Login failed. Server might be down.", true); });
}


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

function validateEmailRealTime(inputElement) {
    let email = inputElement.value;
    if (email.length === 0) return;
    let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        if (typeof naithikaAlert === 'function') naithikaAlert("Please enter a valid email address.", true);
        else alert("Please enter a valid email address.");
        return;
    }
    
    // Check DB
    fetch('auth.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ action: 'check_exists', field: 'email', value: email })
    }).then(r => r.json()).then(data => {
        if (data.status === 'exists') {
            if (typeof naithikaAlert === 'function') naithikaAlert(data.message, true);
            else alert(data.message);
            inputElement.value = ''; // clear it
        }
    }).catch(e => console.error(e));
}

function validateContactRealTime(inputElement) {
    let contact = inputElement.value;
    if (contact.length === 0) return;
    let contactRegex = /^[0-9]{10}$/;
    if (!contactRegex.test(contact)) {
        if (typeof naithikaAlert === 'function') naithikaAlert("Please enter a valid 10-digit mobile number.", true);
        else alert("Please enter a valid 10-digit mobile number.");
        return;
    }
    
    // Check DB
    fetch('auth.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ action: 'check_exists', field: 'contact_number', value: contact })
    }).then(r => r.json()).then(data => {
        if (data.status === 'exists') {
            if (typeof naithikaAlert === 'function') naithikaAlert(data.message, true);
            else alert(data.message);
            inputElement.value = ''; // clear it
        }
    }).catch(e => console.error(e));
}
