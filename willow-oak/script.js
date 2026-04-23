const PRODUCTS = [
  {
    id: 1,
    name: "Leather Crossbody Bag",
    category: "Bags",
    price: 86,
    inventory: 4,
    featured: true,
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: 2,
    name: "Mini Snap Wallet",
    category: "Wallets",
    price: 34,
    inventory: 0,
    featured: true,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: 3,
    name: "Canvas Market Tote",
    category: "Bags",
    price: 42,
    inventory: 8,
    featured: false,
    image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: 4,
    name: "Handmade Key Holder",
    category: "Accessories",
    price: 18,
    inventory: 14,
    featured: false,
    image: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: 5,
    name: "Classic Weekender",
    category: "Bags",
    price: 128,
    inventory: 2,
    featured: true,
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: 6,
    name: "Slim Card Holder",
    category: "Wallets",
    price: 26,
    inventory: 0,
    featured: false,
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: 7,
    name: "Leather Journal Cover",
    category: "Accessories",
    price: 52,
    inventory: 5,
    featured: false,
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: 8,
    name: "Travel Pouch",
    category: "Accessories",
    price: 29,
    inventory: 9,
    featured: false,
    image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=900&q=80"
  }
];

const state = {
  products: [],
  cart: [],
  filters: {
    search: "",
    category: "all",
    price: "all",
    stock: "all",
    sort: "featured"
  }
};

const elements = {
  productGrid: document.getElementById("productGrid"),
  searchInput: document.getElementById("searchInput"),
  categoryFilter: document.getElementById("categoryFilter"),
  priceFilter: document.getElementById("priceFilter"),
  stockFilter: document.getElementById("stockFilter"),
  sortFilter: document.getElementById("sortFilter"),
  clearFiltersBtn: document.getElementById("clearFiltersBtn"),
  resultsCount: document.getElementById("resultsCount"),
  noResultsMessage: document.getElementById("noResultsMessage"),
  cartBtn: document.getElementById("cartBtn"),
  cartDrawer: document.getElementById("cartDrawer"),
  closeCartBtn: document.getElementById("closeCartBtn"),
  cartOverlay: document.getElementById("cartOverlay"),
  cartItems: document.getElementById("cartItems"),
  cartTotal: document.getElementById("cartTotal"),
  cartCount: document.getElementById("cartCount"),
  checkoutButton: document.querySelector(".checkout-button")
};

/* ------------------------------
   Data setup
-------------------------------- */

async function loadProducts() {
  try {
    const response = await fetch("/api/products");
    const data = await response.json();
    state.products = data;
  } catch (error) {
    console.error("Failed to load products from Square:", error);
    state.products = PRODUCTS;
  }
}

function populateCategoryOptions() {
  elements.categoryFilter.innerHTML = `<option value="all">All Categories</option>`;

  const categories = [...new Set(state.products.map(product => product.category))];

  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    elements.categoryFilter.appendChild(option);
  });
}

/* ------------------------------
   Helpers
-------------------------------- */

function formatPrice(price) {
  return `$${Number(price).toFixed(2)}`;
}

function getStockLabel(inventory) {
  return inventory > 0 ? `${inventory} available` : "Currently unavailable";
}

function getBadgeClass(inventory) {
  return inventory > 0 ? "in-stock" : "sold-out";
}

function getBadgeText(inventory) {
  return inventory > 0 ? "In Stock" : "Sold Out";
}

/* ------------------------------
   Filters
-------------------------------- */

function applyFilters(products) {
  let filtered = [...products];

  if (state.filters.search) {
    const searchValue = state.filters.search.toLowerCase();
    filtered = filtered.filter(product =>
      product.name.toLowerCase().includes(searchValue) ||
      product.category.toLowerCase().includes(searchValue)
    );
  }

  if (state.filters.category !== "all") {
    filtered = filtered.filter(product => product.category === state.filters.category);
  }

  if (state.filters.price === "under-30") {
    filtered = filtered.filter(product => product.price < 30);
  }

  if (state.filters.price === "30-70") {
    filtered = filtered.filter(product => product.price >= 30 && product.price <= 70);
  }

  if (state.filters.price === "over-70") {
    filtered = filtered.filter(product => product.price > 70);
  }

  if (state.filters.stock === "in-stock") {
    filtered = filtered.filter(product => product.inventory > 0);
  }

  if (state.filters.stock === "sold-out") {
    filtered = filtered.filter(product => product.inventory === 0);
  }

  if (state.filters.sort === "price-low") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (state.filters.sort === "price-high") {
    filtered.sort((a, b) => b.price - a.price);
  } else if (state.filters.sort === "name-az") {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    filtered.sort((a, b) => Number(b.featured) - Number(a.featured));
  }

  return filtered;
}

function resetFilters() {
  state.filters = {
    search: "",
    category: "all",
    price: "all",
    stock: "all",
    sort: "featured"
  };

  elements.searchInput.value = "";
  elements.categoryFilter.value = "all";
  elements.priceFilter.value = "all";
  elements.stockFilter.value = "all";
  elements.sortFilter.value = "featured";

  renderProducts();
}

/* ------------------------------
   Products UI
-------------------------------- */

function createProductCard(product) {
  const inStock = product.inventory > 0;

  const card = document.createElement("article");
  card.className = "product-card";

  card.innerHTML = `
    <div class="product-image-wrap">
      <img src="${product.image}" alt="${product.name}" class="product-image" />
      <span class="product-badge ${getBadgeClass(product.inventory)}">
        ${getBadgeText(product.inventory)}
      </span>
    </div>

    <div class="product-content">
      <p class="product-category">${product.category}</p>
      <h3 class="product-title">${product.name}</h3>
      <p class="product-price">${formatPrice(product.price)}</p>
      <p class="product-stock">${getStockLabel(product.inventory)}</p>

      <div class="product-actions">
       <button type="button" data-product-id="${product.id}" ${inStock ? "" : "disabled"}>
          ${inStock ? "Add to bag" : "Sold Out"}
        </button>
      </div>
    </div>
  `;

  return card;
}

function renderProducts() {
  const filteredProducts = applyFilters(state.products);

  elements.productGrid.innerHTML = "";
  elements.resultsCount.textContent = `${filteredProducts.length} product${filteredProducts.length === 1 ? "" : "s"}`;

  if (filteredProducts.length === 0) {
    elements.noResultsMessage.classList.remove("hidden");
    return;
  }

  elements.noResultsMessage.classList.add("hidden");

  filteredProducts.forEach(product => {
    const card = createProductCard(product);
    elements.productGrid.appendChild(card);
  });

  attachProductButtonEvents();
}

function attachProductButtonEvents() {
  const addButtons = document.querySelectorAll("[data-product-id]");

  addButtons.forEach(button => {
    button.addEventListener("click", () => {
      const productId = button.dataset.productId;
      addToCart(productId);
    });
  });
}

/* ------------------------------
   Cart
-------------------------------- */

function addToCart(productId) {
  const product = state.products.find(item => String(item.id) === String(productId));

  if (!product || product.inventory <= 0) return;

  const existingItem = state.cart.find(item => String(item.id) === String(productId));

  if (existingItem) {
    if (existingItem.quantity < product.inventory) {
      existingItem.quantity += 1;
    }
  } else {
    state.cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });
  }

  renderCart();
  openCart();
}

function removeFromCart(productId) {
  state.cart = state.cart.filter(item => String(item.id) !== String(productId));
  renderCart();
}

function renderCart() {
  elements.cartItems.innerHTML = "";

  if (state.cart.length === 0) {
    elements.cartItems.innerHTML = `<p class="empty-cart">No items selected yet.</p>`;
    elements.cartTotal.textContent = "$0.00";
    elements.cartCount.textContent = "0";
    return;
  }

  let total = 0;
  let totalItems = 0;

  state.cart.forEach(item => {
    total += Number(item.price) * item.quantity;
    totalItems += item.quantity;

    const cartItem = document.createElement("div");
    cartItem.className = "cart-item";

    cartItem.innerHTML = `
      <img src="${item.image}" alt="${item.name}" />
      <div>
        <h4>${item.name}</h4>
        <p>${formatPrice(item.price)} × ${item.quantity}</p>
        <button type="button" data-remove-id="${item.id}">Remove</button>
      </div>
      <strong>${formatPrice(Number(item.price) * item.quantity)}</strong>
    `;

    elements.cartItems.appendChild(cartItem);
  });

  elements.cartTotal.textContent = formatPrice(total);
  elements.cartCount.textContent = totalItems;

  attachRemoveButtonEvents();
}

function attachRemoveButtonEvents() {
  const removeButtons = document.querySelectorAll("[data-remove-id]");

  removeButtons.forEach(button => {
    button.addEventListener("click", () => {
      removeFromCart(button.dataset.removeId);
    });
  });
}

function openCart() {
  elements.cartDrawer.classList.add("open");
  elements.cartOverlay.classList.add("show");
  elements.cartDrawer.setAttribute("aria-hidden", "false");
}

function closeCart() {
  elements.cartDrawer.classList.remove("open");
  elements.cartOverlay.classList.remove("show");
  elements.cartDrawer.setAttribute("aria-hidden", "true");
}

/* ------------------------------
   Checkout
-------------------------------- */

async function proceedToCheckout() {
  if (state.cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  try {
    const response = await fetch("/api/create-checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ cart: state.cart })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Checkout error:", data);
      alert("Could not create Square checkout.");
      return;
    }

    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("No checkout URL was returned.");
    }
  } catch (error) {
    console.error("Checkout request failed:", error);
    alert("Checkout failed.");
  }
}

/* ------------------------------
   Events
-------------------------------- */

function bindEvents() {
  elements.searchInput.addEventListener("input", event => {
    state.filters.search = event.target.value.trim();
    renderProducts();
  });

  elements.categoryFilter.addEventListener("change", event => {
    state.filters.category = event.target.value;
    renderProducts();
  });

  elements.priceFilter.addEventListener("change", event => {
    state.filters.price = event.target.value;
    renderProducts();
  });

  elements.stockFilter.addEventListener("change", event => {
    state.filters.stock = event.target.value;
    renderProducts();
  });

  elements.sortFilter.addEventListener("change", event => {
    state.filters.sort = event.target.value;
    renderProducts();
  });

  elements.clearFiltersBtn.addEventListener("click", resetFilters);

  elements.cartBtn.addEventListener("click", openCart);
  elements.closeCartBtn.addEventListener("click", closeCart);
  elements.cartOverlay.addEventListener("click", closeCart);

  if (elements.checkoutButton) {
    elements.checkoutButton.addEventListener("click", proceedToCheckout);
  }
}

/* ------------------------------
   Init
-------------------------------- */

async function initStore() {
  await loadProducts();
  populateCategoryOptions();
  bindEvents();
  renderProducts();
  renderCart();
}

initStore();