/* ===================================================
   SmartSlice – Main Application Logic
   app.js
   =================================================== */

// ========================
// PIZZA DATA (Menu Items)
// ========================
const PIZZAS = [
  {
    id: 1,
    name: "Margherita Classic",
    desc: "The timeless Italian original — rich tomato sauce, creamy mozzarella, fresh basil and a drizzle of olive oil.",
    price: 249,
    emoji: "🍕",
    category: "veg",
    tags: ["Vegetarian", "Classic"],
    badge: "Bestseller"
  },
  {
    id: 2,
    name: "BBQ Chicken Feast",
    desc: "Smoky BBQ sauce topped with grilled chicken, red onions, jalapeños and cheddar cheese.",
    price: 399,
    emoji: "🍗",
    category: "non-veg",
    tags: ["Chicken", "Spicy"],
    badge: "🔥 Hot"
  },
  {
    id: 3,
    name: "Veggie Supreme",
    desc: "A garden on your plate — bell peppers, mushrooms, olives, corn, onions and double mozzarella.",
    price: 329,
    emoji: "🥦",
    category: "veg",
    tags: ["Vegetarian", "Loaded"],
    badge: null
  },
  {
    id: 4,
    name: "Pepperoni Royale",
    desc: "Classic American style — rich tomato base loaded with premium pepperoni slices and oozy mozzarella.",
    price: 379,
    emoji: "🍖",
    category: "non-veg",
    tags: ["Pepperoni", "Classic"],
    badge: "Popular"
  },
  {
    id: 5,
    name: "Truffle Mushroom",
    desc: "Luxurious garlic cream base with sautéed mushrooms, truffle oil, parmesan and fresh thyme.",
    price: 449,
    emoji: "🍄",
    category: "veg",
    tags: ["Gourmet", "Vegetarian"],
    badge: "⭐ Special"
  },
  {
    id: 6,
    name: "Smoked Meat Lover",
    desc: "Not for the faint-hearted — pepperoni, smoked chicken, bacon bits and gouda on BBQ sauce.",
    price: 499,
    emoji: "🥩",
    category: "non-veg",
    tags: ["Meat Feast", "Loaded"],
    badge: "Fan Fav"
  },
  {
    id: 7,
    name: "Pesto Garden",
    desc: "Fresh basil pesto base with cherry tomatoes, artichokes, sun-dried tomatoes and feta cheese.",
    price: 369,
    emoji: "🌿",
    category: "veg",
    tags: ["Pesto", "Gourmet"],
    badge: "New"
  },
  {
    id: 8,
    name: "Spicy Tikka",
    desc: "Desi twist! Tikka-marinated chicken, onion, capsicum, green chillies on a tangy tikka sauce.",
    price: 419,
    emoji: "🌶️",
    category: "special",
    tags: ["Spicy", "Indian"],
    badge: "🌶️ Extra Hot"
  }
];

// ========================
// INVENTORY DATA
// ========================
let inventory = [
  { id: 1, name: "Mozzarella Cheese", icon: "🧀", current: 85, max: 100, unit: "kg", threshold: 20 },
  { id: 2, name: "Tomato Sauce", icon: "🍅", current: 12, max: 60, unit: "L", threshold: 15 },
  { id: 3, name: "Pizza Dough", icon: "🫓", current: 45, max: 100, unit: "units", threshold: 20 },
  { id: 4, name: "Pepperoni", icon: "🍖", current: 8, max: 40, unit: "kg", threshold: 10 },
  { id: 5, name: "Mushrooms", icon: "🍄", current: 22, max: 30, unit: "kg", threshold: 8 },
  { id: 6, name: "Bell Peppers", icon: "🫑", current: 18, max: 25, unit: "kg", threshold: 7 },
  { id: 7, name: "Chicken", icon: "🍗", current: 30, max: 50, unit: "kg", threshold: 12 },
  { id: 8, name: "Olive Oil", icon: "🫙", current: 15, max: 20, unit: "L", threshold: 5 },
  { id: 9, name: "Basil", icon: "🌿", current: 3, max: 10, unit: "kg", threshold: 2 },
  { id: 10, name: "Cheddar Cheese", icon: "🧀", current: 24, max: 40, unit: "kg", threshold: 10 }
];

// ========================
// TOPPINGS LIST
// ========================
const TOPPINGS = [
  { id: "mushrooms", label: "🍄 Mushrooms" },
  { id: "onions", label: "🧅 Onions" },
  { id: "olives", label: "🫒 Olives" },
  { id: "corn", label: "🌽 Corn" },
  { id: "pepperoni", label: "🍖 Pepperoni" },
  { id: "peppers", label: "🫑 Bell Peppers" },
  { id: "jalapeños", label: "🌶 Jalapeños" },
  { id: "chicken", label: "🍗 Chicken" }
];

// ========================
// APPLICATION STATE
// ========================
let currentUser = null;              // Logged-in user object
let cart = [];                       // Cart items array
let orders = [];                     // All placed orders
let currentPizza = null;             // Pizza being customized
let customization = {                // Current customization selections
  size: "Small",
  sizeExtra: 0,
  sauce: "Classic Tomato",
  cheese: "Mozzarella",
  toppings: [],
  qty: 1
};
let selectedPayment = "card";        // Selected payment method
let currentOrderId = null;           // Last placed order ID
let trackingInterval = null;         // Interval for tracking simulation
let currentTrackingStep = 0;         // Current tracking step index

// ========================
// PAGE NAVIGATION
// ========================

/**
 * Shows a specific page and hides all others.
 * Also handles navbar visibility and active link states.
 */
function showPage(pageId) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  // Show requested page
  const page = document.getElementById(`page-${pageId}`);
  if (page) page.classList.add('active');

  // Hide navbar on auth pages
  const noNavPages = ['login', 'register'];
  document.getElementById('navbar').style.display =
    noNavPages.includes(pageId) ? 'none' : 'flex';

  // Update active nav link
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  const navLink = document.getElementById(`nav-${pageId}`);
  if (navLink) navLink.classList.add('active');

  // Run page-specific setup
  if (pageId === 'menu') renderMenu('all');
  if (pageId === 'cart') renderCart();
  if (pageId === 'checkout') renderCheckout();
  if (pageId === 'admin') renderAdmin();
  if (pageId === 'tracking') startTracking();

  // Scroll to top
  window.scrollTo(0, 0);
}

// ========================
// AUTHENTICATION
// ========================

/**
 * Simple login — stores user in localStorage.
 * For a real app, this would call a backend API.
 */
function login() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!email || !password) {
    showToast('Please enter email and password', 'error');
    return;
  }

  // Check if user exists in localStorage
  const users = JSON.parse(localStorage.getItem('ss_users') || '[]');
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    // Allow demo login for testing
    if (email === 'demo@smartslice.com' && password === 'demo123') {
      currentUser = { name: 'Demo User', email };
    } else {
      showToast('Invalid email or password', 'error');
      return;
    }
  } else {
    currentUser = user;
  }

  localStorage.setItem('ss_currentUser', JSON.stringify(currentUser));
  document.getElementById('navUserName').textContent = `👤 ${currentUser.name}`;
  showToast(`Welcome back, ${currentUser.name}! 🍕`, 'success');
  showPage('home');
}

/**
 * Register a new user and store in localStorage.
 */
function register() {
  const first = document.getElementById('regFirst').value.trim();
  const last = document.getElementById('regLast').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;

  if (!first || !email || !password) {
    showToast('Please fill all required fields', 'error');
    return;
  }
  if (password.length < 6) {
    showToast('Password must be at least 6 characters', 'error');
    return;
  }

  const users = JSON.parse(localStorage.getItem('ss_users') || '[]');
  if (users.find(u => u.email === email)) {
    showToast('Email already registered', 'error');
    return;
  }

  const newUser = { name: `${first} ${last}`.trim(), email, password };
  users.push(newUser);
  localStorage.setItem('ss_users', JSON.stringify(users));

  showToast('Account created! Please sign in.', 'success');
  showPage('login');
}

/**
 * Log out the current user.
 */
function logout() {
  currentUser = null;
  localStorage.removeItem('ss_currentUser');
  showToast('Logged out successfully', 'info');
  showPage('login');
}

/**
 * Toggle password visibility on input fields.
 */
function togglePassword(inputId, iconId) {
  const input = document.getElementById(inputId);
  const icon = document.getElementById(iconId);
  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.replace('fa-eye', 'fa-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.replace('fa-eye-slash', 'fa-eye');
  }
}

// ========================
// MENU RENDERING
// ========================

/**
 * Render pizza cards based on category filter.
 * category: 'all' | 'veg' | 'non-veg' | 'special'
 */
function renderMenu(category) {
  const grid = document.getElementById('menuGrid');
  const filtered = category === 'all'
    ? PIZZAS
    : PIZZAS.filter(p => p.category === category);

  grid.innerHTML = filtered.map(pizza => `
    <div class="pizza-card" onclick="openCustomModal(${pizza.id})">
      <div class="pizza-img-wrap">
        <span style="position:relative;z-index:1;">${pizza.emoji}</span>
        ${pizza.badge ? `<div class="pizza-badge">${pizza.badge}</div>` : ''}
      </div>
      <div class="pizza-card-body">
        <div class="pizza-name">${pizza.name}</div>
        <div class="pizza-desc">${pizza.desc}</div>
        <div class="pizza-tags">
          ${pizza.tags.map(t => `<span class="pizza-tag">${t}</span>`).join('')}
        </div>
        <div class="pizza-footer">
          <div class="pizza-price">₹${pizza.price}<span>/pizza</span></div>
          <button class="add-cart-btn" onclick="event.stopPropagation(); openCustomModal(${pizza.id})">
            + Add
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

/**
 * Filter menu by category — updates active filter button.
 */
function filterMenu(category, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderMenu(category);
}

// ========================
// CUSTOMIZATION MODAL
// ========================

/**
 * Open the customization modal for a given pizza.
 */
function openCustomModal(pizzaId) {
  currentPizza = PIZZAS.find(p => p.id === pizzaId);
  if (!currentPizza) return;

  // Reset customization
  customization = { size: "Small", sizeExtra: 0, sauce: "Classic Tomato", cheese: "Mozzarella", toppings: [], qty: 1 };

  // Update modal header
  document.getElementById('modalPizzaName').textContent = `Customize: ${currentPizza.name}`;
  document.getElementById('previewEmoji').textContent = currentPizza.emoji;
  document.getElementById('previewName').textContent = currentPizza.name;
  document.getElementById('qtyDisplay').textContent = 1;

  // Reset size buttons
  document.querySelectorAll('.size-btn').forEach((b, i) => {
    b.classList.toggle('active', i === 0);
  });

  // Reset selects
  document.getElementById('sauceSelect').selectedIndex = 0;
  document.getElementById('cheeseSelect').selectedIndex = 0;

  // Build toppings grid
  const grid = document.getElementById('toppingsGrid');
  grid.innerHTML = TOPPINGS.map(t => `
    <button class="topping-btn" id="topping-${t.id}" onclick="toggleTopping('${t.id}', '${t.label}')">
      ${t.label}
    </button>
  `).join('');

  updatePreview();

  // Show modal
  document.getElementById('customModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

/**
 * Close the customization modal.
 */
function closeModal() {
  document.getElementById('customModal').classList.remove('open');
  document.body.style.overflow = '';
}

// Close modal when clicking outside
document.getElementById('customModal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

/**
 * Select a pizza size and update the price.
 */
function selectSize(btn, sizeName, extra) {
  document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  customization.size = sizeName;
  customization.sizeExtra = extra;
  updatePreview();
}

/**
 * Toggle a topping on/off.
 */
function toggleTopping(toppingId, label) {
  const btn = document.getElementById(`topping-${toppingId}`);
  const idx = customization.toppings.indexOf(toppingId);
  if (idx === -1) {
    customization.toppings.push(toppingId);
    btn.classList.add('active');
  } else {
    customization.toppings.splice(idx, 1);
    btn.classList.remove('active');
  }
  updatePreview();
}

/**
 * Update the live preview panel in the modal.
 */
function updatePreview() {
  if (!currentPizza) return;
  customization.sauce = document.getElementById('sauceSelect').value;
  customization.cheese = document.getElementById('cheeseSelect').value;

  // Calculate price
  const cheeseExtra = customization.cheese === 'Double Mozzarella' ? 40 : 0;
  const toppingExtra = customization.toppings.length * 30;
  const totalUnit = currentPizza.price + customization.sizeExtra + cheeseExtra + toppingExtra;
  const total = totalUnit * customization.qty;

  document.getElementById('previewPrice').textContent = `₹${totalUnit}`;
  document.getElementById('modalTotal').textContent = `₹${total}`;

  // Build selected options list
  const optDisplay = document.getElementById('selectedOptionsDisplay');
  optDisplay.innerHTML = `
    <div class="selected-option-item"><span>Size</span><span>${customization.size}</span></div>
    <div class="selected-option-item"><span>Sauce</span><span>${customization.sauce}</span></div>
    <div class="selected-option-item"><span>Cheese</span><span>${customization.cheese}</span></div>
    ${customization.toppings.length ? `
      <div class="selected-option-item">
        <span>Toppings (${customization.toppings.length})</span>
        <span style="color:var(--accent-orange)">+₹${toppingExtra}</span>
      </div>
    ` : ''}
    <div class="selected-option-item">
      <span>Qty</span><span>×${customization.qty}</span>
    </div>
  `;
}

/**
 * Change quantity in the modal (+1 or -1).
 */
function changeQty(delta) {
  customization.qty = Math.max(1, customization.qty + delta);
  document.getElementById('qtyDisplay').textContent = customization.qty;
  updatePreview();
}

/**
 * Add the customized pizza to the cart.
 */
function addToCartFromModal() {
  if (!currentPizza) return;

  const cheeseExtra = customization.cheese === 'Double Mozzarella' ? 40 : 0;
  const toppingExtra = customization.toppings.length * 30;
  const unitPrice = currentPizza.price + customization.sizeExtra + cheeseExtra + toppingExtra;

  const cartItem = {
    id: Date.now(),         // Unique cart item ID
    pizzaId: currentPizza.id,
    name: currentPizza.name,
    emoji: currentPizza.emoji,
    size: customization.size,
    sauce: customization.sauce,
    cheese: customization.cheese,
    toppings: [...customization.toppings],
    qty: customization.qty,
    unitPrice,
    totalPrice: unitPrice * customization.qty
  };

  cart.push(cartItem);
  updateCartCount();
  closeModal();
  showToast(`${currentPizza.name} added to cart! 🛒`, 'success');
}

// ========================
// CART
// ========================

/**
 * Update the cart count badge in the navbar.
 */
function updateCartCount() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  document.getElementById('cartCount').textContent = count;
}

/**
 * Render the cart page with all items and totals.
 */
function renderCart() {
  const container = document.getElementById('cartItemsContainer');

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <div class="empty-icon">🛒</div>
        <h3>Your cart is empty</h3>
        <p>Add some pizzas to get started!</p>
        <button class="btn-primary" style="margin-top:1.5rem;" onclick="showPage('menu')">
          Browse Menu
        </button>
      </div>
    `;
    updateSummary(0);
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="cart-item" id="cart-item-${item.id}">
      <div class="cart-item-emoji">${item.emoji}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-details">
          ${item.size} • ${item.sauce} • ${item.cheese}
          ${item.toppings.length ? ` • +${item.toppings.length} toppings` : ''}
        </div>
        <div class="cart-item-price">₹${item.totalPrice}</div>
      </div>
      <div class="cart-item-actions">
        <div class="qty-control">
          <button class="qty-btn" onclick="updateCartQty(${item.id}, -1)">−</button>
          <span class="qty-display">${item.qty}</span>
          <button class="qty-btn" onclick="updateCartQty(${item.id}, 1)">+</button>
        </div>
        <button class="remove-btn" onclick="removeFromCart(${item.id})" title="Remove">✕</button>
      </div>
    </div>
  `).join('');

  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  updateSummary(subtotal);
}

/**
 * Update quantity of a cart item. Remove if qty goes to 0.
 */
function updateCartQty(itemId, delta) {
  const item = cart.find(i => i.id === itemId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(itemId);
    return;
  }
  item.totalPrice = item.unitPrice * item.qty;
  updateCartCount();
  renderCart();
}

/**
 * Remove an item completely from the cart.
 */
function removeFromCart(itemId) {
  cart = cart.filter(i => i.id !== itemId);
  updateCartCount();
  renderCart();
  showToast('Item removed from cart', 'info');
}

let discount = 0;

/**
 * Update the order summary totals.
 */
function updateSummary(subtotal) {
  const delivery = subtotal > 0 ? 40 : 0;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + delivery + tax - discount;

  document.getElementById('summarySubtotal').textContent = `₹${subtotal}`;
  document.getElementById('summaryDelivery').textContent = `₹${delivery}`;
  document.getElementById('summaryTax').textContent = `₹${tax}`;
  document.getElementById('summaryDiscount').textContent = `-₹${discount}`;
  document.getElementById('summaryTotal').textContent = `₹${total}`;
}

/**
 * Apply a promo code discount.
 * Valid codes: PIZZA20 (20% off), FIRST50 (₹50 off)
 */
function applyPromo() {
  const code = document.getElementById('promoCode').value.trim().toUpperCase();
  const subtotal = cart.reduce((s, i) => s + i.totalPrice, 0);

  if (code === 'PIZZA20') {
    discount = Math.round(subtotal * 0.2);
    showToast('20% discount applied! 🎉', 'success');
  } else if (code === 'FIRST50') {
    discount = 50;
    showToast('₹50 discount applied! 🎉', 'success');
  } else if (code === '') {
    showToast('Please enter a promo code', 'error');
    return;
  } else {
    showToast('Invalid promo code', 'error');
    return;
  }
  updateSummary(subtotal);
}

// ========================
// CHECKOUT
// ========================

/**
 * Render checkout page with order summary.
 */
function renderCheckout() {
  const subtotal = cart.reduce((s, i) => s + i.totalPrice, 0);
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + 40 + tax - discount;

  document.getElementById('coSubtotal').textContent = `₹${subtotal}`;
  document.getElementById('coTax').textContent = `₹${tax}`;
  document.getElementById('coTotal').textContent = `₹${total}`;

  // Pre-fill user name if logged in
  if (currentUser) {
    document.getElementById('deliveryName').value = currentUser.name || '';
  }

  // Show cart items in checkout summary
  const co = document.getElementById('checkoutOrderItems');
  co.innerHTML = cart.map(item => `
    <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:0.9rem;border-bottom:1px solid var(--border-color);">
      <span>${item.emoji} ${item.name} × ${item.qty}</span>
      <span>₹${item.totalPrice}</span>
    </div>
  `).join('');
}

/**
 * Select a payment method — update UI.
 */
function selectPayment(el, method) {
  document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  selectedPayment = method;

  // Show/hide card fields
  document.getElementById('cardFields').style.display = method === 'card' ? 'block' : 'none';
}

/**
 * Format card number input with spaces every 4 digits.
 */
function formatCard(input) {
  let val = input.value.replace(/\D/g, '').substring(0, 16);
  input.value = val.replace(/(.{4})/g, '$1 ').trim();
}

/**
 * Validate checkout form and simulate payment.
 */
function placeOrder() {
  if (cart.length === 0) {
    showToast('Your cart is empty!', 'error');
    return;
  }

  const name = document.getElementById('deliveryName').value.trim();
  const phone = document.getElementById('deliveryPhone').value.trim();
  const address = document.getElementById('deliveryAddress').value.trim();
  const city = document.getElementById('deliveryCity').value.trim();

  if (!name || !phone || !address || !city) {
    showToast('Please fill in all delivery details', 'error');
    return;
  }

  // Show payment loading animation
  document.getElementById('paymentLoading').classList.add('show');

  // Simulate payment processing delay
  setTimeout(() => {
    document.getElementById('paymentLoading').classList.remove('show');

    // Create an order record
    currentOrderId = 'SS-' + Math.floor(100000 + Math.random() * 900000);
    const subtotal = cart.reduce((s, i) => s + i.totalPrice, 0);
    const total = subtotal + 40 + Math.round(subtotal * 0.05) - discount;

    const order = {
      id: currentOrderId,
      customer: name,
      phone,
      address: `${address}, ${city}`,
      items: [...cart],
      total,
      payment: selectedPayment,
      status: 'pending',
      time: new Date().toLocaleTimeString()
    };

    orders.push(order);

    // Clear the cart
    cart = [];
    discount = 0;
    updateCartCount();

    // Show success screen
    document.getElementById('successOrderId').textContent = `Order ID: ${currentOrderId}`;
    document.getElementById('paymentSuccess').classList.add('show');
  }, 2500);
}

/**
 * Navigate to tracking page after successful payment.
 */
function goToTracking() {
  document.getElementById('paymentSuccess').classList.remove('show');
  showPage('tracking');
}

// ========================
// ORDER TRACKING
// ========================

const TRACKING_STEPS = [
  { label: "Order Placed", emoji: "📋", delay: 0 },
  { label: "Preparing Pizza", emoji: "👨‍🍳", delay: 3000 },
  { label: "Baking in Oven", emoji: "🔥", delay: 7000 },
  { label: "Out for Delivery", emoji: "🛵", delay: 12000 },
  { label: "Delivered!", emoji: "🏠", delay: 20000 }
];

/**
 * Starts the animated order tracking simulation.
 * Each step lights up progressively.
 */
function startTracking() {
  if (trackingInterval) clearTimeout(trackingInterval);
  currentTrackingStep = 0;

  // Set order ID display
  document.getElementById('trackingOrderId').textContent =
    currentOrderId ? `Order #${currentOrderId}` : 'Order #SS-DEMO';

  // Reset all steps
  for (let i = 0; i < 5; i++) {
    const step = document.getElementById(`step-${i}`);
    step.classList.remove('done', 'active');
    document.getElementById(`step-time-${i}`).textContent = '—';
  }

  document.getElementById('progressLine').style.height = '0';

  // Progressively activate each step
  TRACKING_STEPS.forEach((step, i) => {
    setTimeout(() => {
      // Mark previous steps as done
      for (let j = 0; j < i; j++) {
        document.getElementById(`step-${j}`).classList.add('done');
        document.getElementById(`step-${j}`).classList.remove('active');
      }
      // Mark current step as active
      document.getElementById(`step-${i}`).classList.add('active');
      document.getElementById(`step-time-${i}`).textContent = new Date().toLocaleTimeString();
      document.getElementById('trackingEmoji').textContent = step.emoji;

      // Update ETA countdown
      const remaining = TRACKING_STEPS.length - 1 - i;
      document.getElementById('etaMinutes').textContent = remaining * 5;

      // Animate the progress line (rough approximation)
      const pct = (i / (TRACKING_STEPS.length - 1)) * 100;
      document.getElementById('progressLine').style.height = `${pct}%`;

      // When last step reached, mark all done
      if (i === TRACKING_STEPS.length - 1) {
        document.getElementById(`step-${i}`).classList.add('done');
        document.getElementById(`step-${i}`).classList.remove('active');
        document.getElementById('etaMinutes').textContent = '0';
        showToast('🎉 Pizza delivered! Enjoy your meal!', 'success');
      }
    }, step.delay);
  });

  // Set delivery address
  const lastOrder = orders[orders.length - 1];
  if (lastOrder) {
    document.getElementById('etaAddress').textContent = `Delivering to: ${lastOrder.address}`;
  }
}

// ========================
// ADMIN DASHBOARD
// ========================

/**
 * Switch between admin panel tabs.
 */
function switchAdminTab(tabId, clickedLink) {
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  document.getElementById(`admin-tab-${tabId}`).classList.add('active');
  document.querySelectorAll('.admin-nav a').forEach(a => a.classList.remove('active'));
  if (clickedLink) clickedLink.classList.add('active');
}

/**
 * Render all admin content — stats, orders, inventory, menu management.
 */
function renderAdmin() {
  // Add demo orders if none exist yet
  if (orders.length === 0) {
    orders = generateDemoOrders();
  }

  renderAdminStats();
  renderAdminOrders();
  renderInventory();
  renderMenuManagement();
}

/**
 * Generate some demo orders for the admin panel.
 */
function generateDemoOrders() {
  const statuses = ['pending', 'preparing', 'baking', 'out-for-delivery', 'delivered'];
  const names = ['Amit Sharma', 'Priya Mehta', 'Rahul Gupta', 'Sneha Patel', 'Karan Joshi'];
  const demoOrders = [];

  for (let i = 0; i < 8; i++) {
    demoOrders.push({
      id: `SS-${100000 + i}`,
      customer: names[i % names.length],
      phone: `+91 9${Math.floor(100000000 + Math.random() * 900000000)}`,
      address: `${i + 1} MG Road, Mumbai`,
      items: [PIZZAS[i % PIZZAS.length]],
      total: PIZZAS[i % PIZZAS.length].price + 40,
      payment: ['card', 'upi', 'cod'][i % 3],
      status: statuses[i % statuses.length],
      time: `${10 + i}:${String(i * 7 % 60).padStart(2, '0')} AM`
    });
  }
  return demoOrders;
}

/**
 * Render dashboard statistics.
 */
function renderAdminStats() {
  const total = orders.length;
  const delivered = orders.filter(o => o.status === 'delivered').length;
  const pending = orders.filter(o => ['pending', 'preparing', 'baking'].includes(o.status)).length;
  const revenue = orders.reduce((s, o) => s + o.total, 0);

  document.getElementById('statTotalOrders').textContent = total;
  document.getElementById('statDelivered').textContent = delivered;
  document.getElementById('statPending').textContent = pending;
  document.getElementById('statRevenue').textContent = `₹${revenue}`;

  // Render recent orders (latest 5)
  const recentBody = document.getElementById('recentOrdersBody');
  recentBody.innerHTML = orders.slice(-5).reverse().map(o => `
    <tr>
      <td style="font-family:var(--font-mono);font-size:0.8rem;">${o.id}</td>
      <td>${o.customer}</td>
      <td>${o.items.length} item(s)</td>
      <td>₹${o.total}</td>
      <td><span class="status-badge ${o.status}">${formatStatus(o.status)}</span></td>
      <td><button class="action-btn" onclick="cycleStatus('${o.id}')">Update</button></td>
    </tr>
  `).join('');
}

/**
 * Render all orders in the orders management tab.
 */
function renderAdminOrders() {
  document.getElementById('ordersCount').textContent = `${orders.length} orders`;
  const body = document.getElementById('allOrdersBody');
  body.innerHTML = orders.map(o => `
    <tr>
      <td style="font-family:var(--font-mono);font-size:0.8rem;">${o.id}</td>
      <td>${o.customer}<br/><span style="color:var(--text-muted);font-size:0.78rem;">${o.phone || ''}</span></td>
      <td style="font-size:0.82rem;color:var(--text-secondary);">${o.address}</td>
      <td>${o.items.length} item(s)</td>
      <td>₹${o.total}</td>
      <td><span class="status-badge ${o.status}">${formatStatus(o.status)}</span></td>
      <td>
        <select class="option-select" style="padding:6px 10px;font-size:0.8rem;width:auto;"
          onchange="updateOrderStatus('${o.id}', this.value)">
          <option value="pending" ${o.status==='pending'?'selected':''}>Pending</option>
          <option value="preparing" ${o.status==='preparing'?'selected':''}>Preparing</option>
          <option value="baking" ${o.status==='baking'?'selected':''}>Baking</option>
          <option value="out-for-delivery" ${o.status==='out-for-delivery'?'selected':''}>Out for Delivery</option>
          <option value="delivered" ${o.status==='delivered'?'selected':''}>Delivered</option>
        </select>
      </td>
    </tr>
  `).join('');
}

/**
 * Update the status of a specific order.
 */
function updateOrderStatus(orderId, newStatus) {
  const order = orders.find(o => o.id === orderId);
  if (order) {
    order.status = newStatus;
    renderAdminStats();
    showToast(`Order ${orderId} updated to ${formatStatus(newStatus)}`, 'success');
  }
}

/**
 * Cycle through order statuses via the "Update" button.
 */
function cycleStatus(orderId) {
  const statusOrder = ['pending', 'preparing', 'baking', 'out-for-delivery', 'delivered'];
  const order = orders.find(o => o.id === orderId);
  if (!order) return;
  const idx = statusOrder.indexOf(order.status);
  order.status = statusOrder[(idx + 1) % statusOrder.length];
  renderAdminStats();
  showToast(`Order ${orderId} → ${formatStatus(order.status)}`, 'success');
}

/**
 * Convert status key to a readable label.
 */
function formatStatus(status) {
  const map = {
    'pending': '⏳ Pending',
    'preparing': '👨‍🍳 Preparing',
    'baking': '🔥 Baking',
    'out-for-delivery': '🛵 Out for Delivery',
    'delivered': '✅ Delivered'
  };
  return map[status] || status;
}

/**
 * Render inventory cards with stock level bars.
 */
function renderInventory() {
  const grid = document.getElementById('inventoryGrid');
  grid.innerHTML = inventory.map(item => {
    const pct = Math.round((item.current / item.max) * 100);
    const isLow = item.current <= item.threshold;
    const colorClass = pct > 50 ? 'good' : pct > 25 ? 'medium' : 'low';

    return `
      <div class="inventory-card ${isLow ? 'low' : ''}">
        <div class="inv-header">
          <span class="inv-icon">${item.icon}</span>
          ${isLow ? `<span class="inv-warning">⚠️ Low Stock</span>` : ''}
        </div>
        <div class="inv-name">${item.name}</div>
        <div class="inv-amount">${item.current} / ${item.max} ${item.unit}</div>
        <div class="inv-bar">
          <div class="inv-bar-fill ${colorClass}" style="width:${pct}%;"></div>
        </div>
        <button class="action-btn" style="width:100%;margin-top:10px;text-align:center;"
          onclick="restockItem(${item.id})">
          + Restock
        </button>
      </div>
    `;
  }).join('');
}

/**
 * Restock a single inventory item to max.
 */
function restockItem(itemId) {
  const item = inventory.find(i => i.id === itemId);
  if (item) {
    item.current = item.max;
    renderInventory();
    showToast(`${item.name} restocked to ${item.max} ${item.unit}!`, 'success');
  }
}

/**
 * Restock all inventory items at once.
 */
function restockAll() {
  inventory.forEach(item => item.current = item.max);
  renderInventory();
  showToast('All inventory restocked! ✅', 'success');
}

/**
 * Render the menu management table in admin.
 */
function renderMenuManagement() {
  const body = document.getElementById('menuMgmtBody');
  body.innerHTML = PIZZAS.map(p => `
    <tr>
      <td>
        <span style="font-size:1.5rem;margin-right:8px;">${p.emoji}</span>
        <strong>${p.name}</strong>
      </td>
      <td><span class="pizza-tag">${p.category}</span></td>
      <td>₹${p.price}</td>
      <td><span class="status-badge delivered">✅ Active</span></td>
      <td>
        <button class="action-btn" onclick="showToast('Edit feature coming soon!','info')">Edit</button>
        <button class="action-btn" style="margin-left:4px;" onclick="showToast('Toggle feature coming soon!','info')">Disable</button>
      </td>
    </tr>
  `).join('');
}

// ========================
// TOAST NOTIFICATIONS
// ========================

/**
 * Show a brief toast notification at the bottom right.
 * type: 'success' | 'error' | 'info'
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type]}</span> ${message}`;
  container.appendChild(toast);

  // Auto-remove after 3 seconds
  setTimeout(() => {
    toast.style.animation = 'slide-in-toast 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ========================
// INITIALIZATION
// ========================

/**
 * App startup — check for existing session, load saved cart.
 */
function initApp() {
  // Check for saved login session
  const saved = localStorage.getItem('ss_currentUser');
  if (saved) {
    currentUser = JSON.parse(saved);
    document.getElementById('navUserName').textContent = `👤 ${currentUser.name}`;
    showPage('home');
  } else {
    showPage('login');
  }

  // Build topping buttons for modal
  const grid = document.getElementById('toppingsGrid');
  grid.innerHTML = TOPPINGS.map(t => `
    <button class="topping-btn" id="topping-${t.id}" onclick="toggleTopping('${t.id}', '${t.label}')">
      ${t.label}
    </button>
  `).join('');
}

// Run app when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);
