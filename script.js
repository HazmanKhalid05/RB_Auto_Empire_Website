/* ---------- Page loader ---------- */
window.addEventListener("load", () => {
    const loader = document.getElementById("pageLoader");
    if (loader) {
        setTimeout(() => loader.classList.add("loaded"), 250);
    }
});

document.addEventListener("DOMContentLoaded", () => {

    /* ---------- Sidebar menu ---------- */
    const menuBtn = document.getElementById("mobile-menu");
    const sidebar = document.getElementById("sidebar-menu");
    const overlay = document.getElementById("overlay");

    function closeSidebar() {
        menuBtn?.classList.remove("is-active");
        sidebar?.classList.remove("active");
        overlay?.classList.remove("active");
        document.body.style.overflow = "";
    }

    if (menuBtn && sidebar && overlay) {
        menuBtn.addEventListener("click", () => {
            menuBtn.classList.toggle("is-active");
            sidebar.classList.toggle("active");
            overlay.classList.toggle("active");
            menuBtn.setAttribute("aria-expanded", sidebar.classList.contains("active"));

            document.body.style.overflow =
                sidebar.classList.contains("active") ? "hidden" : "";
        });

        overlay.addEventListener("click", closeSidebar);
        sidebar.querySelectorAll("a").forEach(link => link.addEventListener("click", closeSidebar));

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") closeSidebar();
        });
    }

    /* ---------- Reveal-on-scroll (with auto stagger) ---------- */
    document.querySelectorAll(".grid-cards, .org-grid, .stats-grid").forEach(group => {
        Array.from(group.children).forEach((child, i) => {
            child.style.setProperty("--reveal-delay", Math.min(i * 0.09, 0.54) + "s");
        });
    });

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("show");
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll("section, .card, .org-card, .stat-item").forEach(item => {
        item.classList.add("hidden");
        revealObserver.observe(item);
    });

    /* ---------- Cursor-follow glow ---------- */
    document.addEventListener("mousemove", (e) => {
        document.body.style.setProperty("--x", e.clientX + "px");
        document.body.style.setProperty("--y", e.clientY + "px");
    });

    /* ---------- Scroll progress bar + header state + back-to-top ---------- */
    const redlineFill = document.querySelector(".redline-bar span");
    const header = document.querySelector(".site-header");
    const backToTop = document.getElementById("backToTop");

    function updateScrollUI() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

        if (redlineFill) redlineFill.style.width = progress + "%";
        if (header) header.classList.toggle("scrolled", scrollTop > 40);
        if (backToTop) backToTop.classList.toggle("visible", scrollTop > 480);
    }

    window.addEventListener("scroll", updateScrollUI, { passive: true });
    updateScrollUI();

    backToTop?.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    /* ---------- Hero parallax ---------- */
    const hero = document.querySelector(".hero, .page-hero");
    if (hero) {
        window.addEventListener("scroll", () => {
            const offset = window.scrollY;
            if (offset < window.innerHeight * 1.2) {
                hero.style.backgroundPositionY = (offset * 0.35) + "px";
            }
        }, { passive: true });
    }

    /* ---------- Animated stat counters ---------- */
    const statEls = document.querySelectorAll(".stat-num[data-count]");
    if (statEls.length) {
        const statObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                const target = parseInt(el.dataset.count, 10);
                const suffix = el.dataset.suffix || "";
                const duration = 1600;
                const start = performance.now();

                function tick(now) {
                    const progress = Math.min((now - start) / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3);
                    el.textContent = Math.round(eased * target).toLocaleString() + suffix;
                    if (progress < 1) requestAnimationFrame(tick);
                }
                requestAnimationFrame(tick);
                statObserver.unobserve(el);
            });
        }, { threshold: 0.5 });

        statEls.forEach(el => statObserver.observe(el));
    }

    /* ---------- Testimonial slider ---------- */
    const track = document.querySelector(".testimonial-track");
    if (track) {
        const slides = track.children.length;
        const dotsWrap = document.querySelector(".testimonial-dots");
        let current = 0;
        let autoTimer;

        if (dotsWrap) {
            dotsWrap.innerHTML = "";
            for (let i = 0; i < slides; i++) {
                const dot = document.createElement("button");
                dot.className = "t-dot" + (i === 0 ? " active" : "");
                dot.setAttribute("aria-label", "Go to testimonial " + (i + 1));
                dot.addEventListener("click", () => goTo(i));
                dotsWrap.appendChild(dot);
            }
        }

        function goTo(index) {
            current = (index + slides) % slides;
            track.style.transform = `translateX(-${current * 100}%)`;
            dotsWrap?.querySelectorAll(".t-dot").forEach((d, i) => d.classList.toggle("active", i === current));
        }

        function startAuto() {
            autoTimer = setInterval(() => goTo(current + 1), 5500);
        }

        startAuto();

        const wrap = document.querySelector(".testimonial-wrap");
        wrap?.addEventListener("mouseenter", () => clearInterval(autoTimer));
        wrap?.addEventListener("mouseleave", startAuto);
    }

    /* ---------- Product filter + search ---------- */
    const filterTabs = document.querySelectorAll(".filter-tab");
    const searchInput = document.getElementById("productSearch");
    const productCards = document.querySelectorAll("[data-category]");
    const noResults = document.getElementById("noResults");

    function applyFilters() {
        if (!productCards.length) return;
        const activeTab = document.querySelector(".filter-tab.active");
        const activeCategory = activeTab ? activeTab.dataset.filter : "all";
        const query = (searchInput?.value || "").trim().toLowerCase();
        let visibleCount = 0;

        productCards.forEach(card => {
            const matchesCategory = activeCategory === "all" || card.dataset.category === activeCategory;
            const title = card.querySelector("h3")?.textContent.toLowerCase() || "";
            const matchesSearch = query === "" || title.includes(query);
            const visible = matchesCategory && matchesSearch;
            card.classList.toggle("filtered-out", !visible);
            if (visible) visibleCount++;
        });

        noResults?.classList.toggle("show", visibleCount === 0);
    }

    filterTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            filterTabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            applyFilters();
        });
    });

    searchInput?.addEventListener("input", applyFilters);

    /* ---------- Wishlist hearts ---------- */
    const wishlistKey = "rbae_wishlist";
    let wishlist = [];
    try { wishlist = JSON.parse(localStorage.getItem(wishlistKey)) || []; } catch (e) { wishlist = []; }

    document.querySelectorAll(".wishlist-btn").forEach(btn => {
        const id = btn.dataset.id;
        if (wishlist.includes(id)) btn.classList.add("active");

        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            btn.classList.toggle("active");
            if (btn.classList.contains("active")) {
                if (!wishlist.includes(id)) wishlist.push(id);
                showToast("Added to your wishlist", "success");
            } else {
                wishlist = wishlist.filter(w => w !== id);
            }
            localStorage.setItem(wishlistKey, JSON.stringify(wishlist));
        });
    });

    /* ---------- Newsletter form ---------- */
    document.querySelectorAll(".newsletter-form").forEach(form => {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            showToast("Thanks for subscribing! Watch your inbox for deals.", "success");
            form.reset();
        });
    });

    /* ---------- Contact form (no backend — demo submission) ---------- */
    const contactForm = document.querySelector(".contact-form form");
    if (contactForm) {
        contactForm.addEventListener("submit", (e) => {
            e.preventDefault();
            showToast("Message sent! Our team will reach out shortly.", "success");
            contactForm.reset();
        });
    }
});

/* ---------- Toast helper ---------- */
function showToast(message, type = "") {
    let stack = document.querySelector(".toast-stack");
    if (!stack) {
        stack = document.createElement("div");
        stack.className = "toast-stack";
        document.body.appendChild(stack);
    }
    const toast = document.createElement("div");
    toast.className = "toast" + (type ? " " + type : "");
    toast.textContent = message;
    stack.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("hide");
        setTimeout(() => toast.remove(), 400);
    }, 3400);
}

/* Checkout modal (used on products.html) */
let activeItem = "";
let activePrice = 0;
let activeQty = 1;
const shippingCost = 10.00;

function refreshCheckoutSummary() {
    const total = (activePrice * activeQty) + shippingCost;
    const qtyEl = document.getElementById("qtyValue");
    if (qtyEl) qtyEl.textContent = activeQty;
    document.getElementById("summaryItemPrice").innerText = "RM " + (activePrice * activeQty).toFixed(2);
    document.getElementById("summaryShipping").innerText = "RM " + shippingCost.toFixed(2);
    document.getElementById("summaryTotal").innerText = "RM " + total.toFixed(2);
}

function changeQty(delta) {
    activeQty = Math.max(1, Math.min(10, activeQty + delta));
    refreshCheckoutSummary();
}

function openCheckout(itemName, itemPrice) {
    activeItem = itemName;
    activePrice = itemPrice;
    activeQty = 1;

    document.getElementById("summaryItemName").innerText = itemName;
    refreshCheckoutSummary();

    const successBox = document.getElementById("successMessage");
    const form = document.getElementById("billingForm");

    if (successBox) {
        successBox.style.display = "none";
        successBox.innerHTML = "";
    }
    if (form) form.style.display = "block";

    document.getElementById("checkoutModal").classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeCheckout() {
    const modal = document.getElementById("checkoutModal");
    const form = document.getElementById("billingForm");
    const successBox = document.getElementById("successMessage");

    if (modal) modal.classList.remove("active");
    document.body.style.overflow = "";

    if (form) {
        form.reset();
        form.style.display = "block";
    }
    if (successBox) {
        successBox.style.display = "none";
        successBox.innerHTML = "";
    }
}

function processPayment(e) {
    e.preventDefault();

    const customer = document.getElementById("custName").value;
    const payment = document.querySelector("input[name='paymentMethod']:checked").value;
    const total = ((activePrice * activeQty) + shippingCost).toFixed(2);

    const successBox = document.getElementById("successMessage");
    const form = document.getElementById("billingForm");

    successBox.innerHTML = `
        <strong>✅ Payment Successful!</strong><br>
        Thank you, <b>${customer}</b>.<br>
        Your order for <b>${activeQty} × ${activeItem}</b> has been received.<br>
        Total Payment: <b>RM ${total}</b><br>
        Payment Method: <b>${payment}</b>
    `;

    successBox.style.display = "block";
    form.style.display = "none";

    showToast("Order confirmed! Check the modal for your receipt.", "success");

    setTimeout(() => {
        closeCheckout();
    }, 4000);
}

window.addEventListener("click", (e) => {
    const modal = document.getElementById("checkoutModal");
    if (modal && e.target === modal) {
        closeCheckout();
    }
});

const RB_SHIPPING = 10;
const cartKey = "rbae_cart";
let cart = [];
let compareList = [];
let quickProduct = null;

function money(n){ return "RM " + Number(n || 0).toFixed(2); }
function loadCart(){ try{ cart = JSON.parse(localStorage.getItem(cartKey)) || []; }catch(e){ cart=[]; } }
function saveCart(){ localStorage.setItem(cartKey, JSON.stringify(cart)); renderCart(); }
function productFromCard(card){
    const title = card.querySelector("h3")?.textContent.trim() || "Auto Part";
    const priceText = card.querySelector(".price")?.textContent || "0";
    const price = parseFloat(priceText.replace(/[^0-9.]/g,"")) || 0;
    const img = card.querySelector("img")?.getAttribute("src") || "";
    const desc = card.querySelector("p")?.textContent.trim() || "Premium automotive component.";
    const category = card.querySelector(".card-category")?.textContent.trim() || card.dataset.category || "Component";
    return { id: title.toLowerCase().replace(/[^a-z0-9]+/g,"-"), title, price, img, desc, category };
}
function addToCart(product, qty=1){
    loadCart();
    const found = cart.find(i => i.id === product.id);
    if(found) found.qty += qty; else cart.push({...product, qty});
    saveCart(); showToast(product.title + " added to cart", "success");
}
function renderCart(){
    const count = document.getElementById("cartCount"), box = document.getElementById("cartItems"), totalEl = document.getElementById("cartTotal");
    if(!box) return;
    const totalQty = cart.reduce((s,i)=>s+i.qty,0);
    const subtotal = cart.reduce((s,i)=>s+i.price*i.qty,0);
    if(count) count.textContent = totalQty;
    if(totalEl) totalEl.textContent = money(subtotal);
    if(!cart.length){ box.innerHTML = '<p style="color:var(--text-dim);padding:18px 0;">Your cart is empty.</p>'; return; }
    box.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div><b>${item.title}</b><br><small>${money(item.price)} × ${item.qty}</small></div>
            <div class="cart-controls">
                <button onclick="cartQty('${item.id}',-1)">−</button><span>${item.qty}</span><button onclick="cartQty('${item.id}',1)">+</button>
            </div>
        </div>`).join("");
}
function cartQty(id, delta){ loadCart(); const item = cart.find(i=>i.id===id); if(!item) return; item.qty += delta; if(item.qty<=0) cart = cart.filter(i=>i.id!==id); saveCart(); }
function openQuick(product){
    quickProduct = product;
    document.getElementById("quickImg").src = product.img;
    document.getElementById("quickTitle").textContent = product.title;
    document.getElementById("quickCategory").textContent = product.category;
    document.getElementById("quickDesc").textContent = product.desc;
    document.getElementById("quickPrice").textContent = money(product.price);
    document.getElementById("quickReviews").textContent = (4.6 + Math.random()*0.3).toFixed(1) + " (" + (80 + Math.floor(Math.random()*250)) + " Reviews)";
    document.getElementById("quickViewModal").classList.add("active");
    document.body.style.overflow = "hidden";
}
function closeQuick(){ document.getElementById("quickViewModal")?.classList.remove("active"); document.body.style.overflow=""; }
function updateCompareBar(){
    const bar=document.getElementById("compareBar"), txt=document.getElementById("compareText");
    if(!bar || !txt) return;
    txt.textContent = compareList.length ? compareList.map(p=>p.title).join(" vs ") : "Select 2 products to compare";
    bar.classList.toggle("active", compareList.length>0);
}
function showCompare(){
    if(compareList.length < 2){ showToast("Choose 2 products first."); return; }
    const [a,b]=compareList;
    document.getElementById("compareTableWrap").innerHTML = `<table class="compare-table">
    <tr><th>Feature</th><th>${a.title}</th><th>${b.title}</th></tr>
    <tr><td>Price</td><td>${money(a.price)}</td><td>${money(b.price)}</td></tr>
    <tr><td>Category</td><td>${a.category}</td><td>${b.category}</td></tr>
    <tr><td>Warranty</td><td>12 months</td><td>12 months</td></tr>
    <tr><td>Stock</td><td>In Stock</td><td>Limited / In Stock</td></tr>
    <tr><td>Best For</td><td>Daily performance</td><td>Workshop replacement</td></tr>
    </table>`;
    document.getElementById("compareModal").classList.add("active");
}
function productSearchSuggestions(){
    const input=document.getElementById("productSearch"), panel=document.getElementById("searchSuggestions");
    if(!input || !panel) return;
    const titles=[...document.querySelectorAll("[data-category] h3")].map(x=>x.textContent.trim());
    input.addEventListener("input",()=>{
        const q=input.value.toLowerCase().trim();
        const matches=titles.filter(t=>t.toLowerCase().includes(q)).slice(0,5);
        if(!q || !matches.length){ panel.classList.remove("show"); return; }
        panel.innerHTML=matches.map(t=>`<button type="button">${t}</button>`).join("");
        panel.classList.add("show");
        panel.querySelectorAll("button").forEach(btn=>btn.onclick=()=>{ input.value=btn.textContent; input.dispatchEvent(new Event("input")); panel.classList.remove("show"); });
    });
}
function enhanceProducts(){
    document.querySelectorAll("[data-category]").forEach((card,i)=>{
        if(card.dataset.enhanced) return; card.dataset.enhanced="1";
        const p=productFromCard(card);
        card.dataset.compat = ["Perodua Myvi", "Proton Saga", "Toyota Vios", "Honda Civic"][i%4];
        const badge=document.createElement("span"); badge.className="stock-badge "+(i%3===0?"limited":"in"); badge.textContent=i%3===0?"Limited Stock":"In Stock"; card.appendChild(badge);
        const q=document.createElement("button"); q.type="button"; q.className="quick-btn"; q.textContent="👁 Quick View"; q.onclick=()=>openQuick(productFromCard(card)); card.appendChild(q);
        const rating=document.createElement("div"); rating.className="rating-mini"; rating.textContent="★★★★★ 4."+(7+i%3)+" • "+(90+i*17)+" reviews";
        card.querySelector(".card-info")?.insertBefore(rating, card.querySelector(".card-info p"));
        const row=card.querySelector(".price-row");
        if(row){
            const add=document.createElement("button"); add.className="btn btn-outline small-btn"; add.type="button"; add.textContent="Add Cart"; add.onclick=()=>addToCart(productFromCard(card)); row.after(add);
            const cmp=document.createElement("label"); cmp.className="compare-check"; cmp.innerHTML='<input type="checkbox"> Compare'; row.after(cmp);
            cmp.querySelector("input").addEventListener("change",e=>{
                const prod=productFromCard(card);
                if(e.target.checked){ if(compareList.length>=2){ e.target.checked=false; showToast("Only 2 products can be compared."); return; } compareList.push(prod); }
                else compareList=compareList.filter(x=>x.id!==prod.id);
                updateCompareBar();
            });
        }
    });
}
function initVehicleFinder(){
    const btn=document.getElementById("findPartsBtn"); if(!btn) return;
    btn.addEventListener("click",()=>{
        const brand=document.getElementById("brandSelect").value, model=document.getElementById("modelSelect").value;
        if(!brand || !model){ showToast("Choose brand and model first."); return; }
        document.querySelectorAll("[data-category]").forEach((card,i)=>{
            const visible = i%2===0 || card.dataset.compat?.includes(model);
            card.classList.toggle("filtered-out", !visible);
        });
        showToast("Showing parts compatible with " + brand + " " + model, "success");
    });
}
function initFaq(){ document.querySelectorAll(".faq-q").forEach(q=>q.addEventListener("click",()=>q.classList.toggle("open"))); }
function checkoutFromCart(){
    loadCart(); if(!cart.length){ showToast("Your cart is empty."); return; }
    const subtotal = cart.reduce((s,i)=>s+i.price*i.qty,0);
    activeItem = cart.length + " cart item(s)"; activePrice = subtotal; activeQty = 1;
    openCheckout(activeItem, subtotal);
}

document.addEventListener("DOMContentLoaded",()=>{
    loadCart(); renderCart(); enhanceProducts(); productSearchSuggestions(); initVehicleFinder(); initFaq();
    document.getElementById("cartFloating")?.addEventListener("click",()=>document.getElementById("cartDrawer")?.classList.add("active"));
    document.getElementById("closeCart")?.addEventListener("click",()=>document.getElementById("cartDrawer")?.classList.remove("active"));
    document.getElementById("quickClose")?.addEventListener("click",closeQuick);
    document.getElementById("quickAddCart")?.addEventListener("click",()=> quickProduct && addToCart(quickProduct));
    document.getElementById("quickBuyNow")?.addEventListener("click",()=>{ if(quickProduct){ closeQuick(); openCheckout(quickProduct.title, quickProduct.price); }});
    document.getElementById("checkoutCartBtn")?.addEventListener("click",checkoutFromCart);
    document.getElementById("compareNow")?.addEventListener("click",showCompare);
    document.getElementById("clearCompare")?.addEventListener("click",()=>{compareList=[];document.querySelectorAll(".compare-check input").forEach(i=>i.checked=false);updateCompareBar();});
    document.getElementById("compareClose")?.addEventListener("click",()=>document.getElementById("compareModal")?.classList.remove("active"));
});

// Improve existing checkout success into invoice style
const oldProcessPayment = processPayment;
processPayment = function(e){
    e.preventDefault();
    const customer = document.getElementById("custName").value;
    const payment = document.querySelector("input[name='paymentMethod']:checked").value;
    const total = ((activePrice * activeQty) + shippingCost).toFixed(2);
    const orderNo = "RBAE-" + Math.floor(100000 + Math.random()*900000);
    const successBox = document.getElementById("successMessage");
    const form = document.getElementById("billingForm");
    successBox.innerHTML = `<span class="big-check">✅</span><strong>Payment Successful!</strong><br>Thank you, <b>${customer}</b>.<div class="invoice-box"><b>Invoice:</b> ${orderNo}<br><b>Item:</b> ${activeQty} × ${activeItem}<br><b>Total:</b> RM ${total}<br><b>Payment:</b> ${payment}<br><b>Estimated Delivery:</b> 2–5 working days</div>`;
    successBox.style.display="block"; form.style.display="none"; showToast("Order confirmed! Invoice generated.","success");
    if(activeItem.includes("cart item")){ cart=[]; saveCart(); }
};
