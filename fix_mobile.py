import glob
import re

html_files = glob.glob('*.html')
for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the mobile menu block
    match = re.search(r'(<div name="header_mobile_menu".*?</div>\s*</div>)', content, re.DOTALL)
    if not match: continue
    
    mobile_menu = match.group(1)
    
    # Check if LOGIN already exists in mobile menu
    if 'onclick="openAccount();' not in mobile_menu:
        # Insert before the cart link in mobile menu
        new_mobile_menu = re.sub(
            r'(<a href="cart\.html" class="(?:mobile-sub-item|nav-link)")',
            r'<a href="#" onclick="openAccount(); return false;" class="\1 auth-nav-link" style="font-weight:bold; color:#e97b06;">LOGIN</a>\n      \1',
            mobile_menu
        )
        # Fix the class attribute formatting
        new_mobile_menu = new_mobile_menu.replace('class="<a href="cart.html" class="mobile-sub-item"', 'class="mobile-sub-item"')
        new_mobile_menu = new_mobile_menu.replace('class="<a href="cart.html" class="nav-link"', 'class="nav-link"')
        
        # Simpler approach since \1 was capturing the whole a tag
        new_mobile_menu = re.sub(
            r'(<a href="cart\.html" class="mobile-sub-item")',
            r'<a href="#" onclick="openAccount(); return false;" class="mobile-sub-item auth-nav-link" style="font-weight:bold; color:#e97b06;">LOGIN</a>\n      \1',
            mobile_menu
        )
        new_mobile_menu = re.sub(
            r'(<a href="cart\.html" class="nav-link")',
            r'<a href="#" onclick="openAccount(); return false;" class="nav-link auth-nav-link" style="font-weight:bold; color:#e97b06;">LOGIN</a>\n      \1',
            new_mobile_menu
        )
        
        content = content.replace(mobile_menu, new_mobile_menu)
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
print('Success')
