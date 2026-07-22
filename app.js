import * as THREE from "three";

const canvas = document.querySelector("#scene");
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false,
  powerPreference: "high-performance",
});

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x070809, 0.052);

const camera = new THREE.PerspectiveCamera(54, window.innerWidth / window.innerHeight, 0.1, 120);
camera.position.set(0, 0.6, 12);

const group = new THREE.Group();
scene.add(group);

const ringMaterial = new THREE.MeshStandardMaterial({
  color: 0x3d4248,
  metalness: 0.72,
  roughness: 0.28,
  emissive: 0x111417,
  emissiveIntensity: 0.38,
});

const accentMaterial = new THREE.MeshStandardMaterial({
  color: 0x56f0d7,
  metalness: 0.48,
  roughness: 0.24,
  emissive: 0x123f39,
  emissiveIntensity: 0.86,
});

const ringA = new THREE.Mesh(new THREE.TorusGeometry(3.2, 0.045, 18, 180), ringMaterial);
const ringB = new THREE.Mesh(new THREE.TorusGeometry(4.35, 0.035, 18, 180), ringMaterial);
const ringC = new THREE.Mesh(new THREE.TorusGeometry(2.15, 0.026, 18, 180), accentMaterial);

ringA.rotation.set(0.92, 0.28, 0.18);
ringB.rotation.set(1.2, -0.22, 0.5);
ringC.rotation.set(0.7, 0.9, 1.18);
group.add(ringA, ringB, ringC);

const particleGeometry = new THREE.BufferGeometry();
const particleCount = 620;
const positions = new Float32Array(particleCount * 3);
const speeds = new Float32Array(particleCount);

for (let i = 0; i < particleCount; i += 1) {
  const i3 = i * 3;
  positions[i3] = (Math.random() - 0.5) * 24;
  positions[i3 + 1] = (Math.random() - 0.5) * 14;
  positions[i3 + 2] = (Math.random() - 0.5) * 18;
  speeds[i] = 0.2 + Math.random() * 0.7;
}

particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

const particleMaterial = new THREE.PointsMaterial({
  color: 0xaab0b6,
  size: 0.035,
  transparent: true,
  opacity: 0.58,
  depthWrite: false,
});

const particles = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particles);

const waveGeometry = new THREE.PlaneGeometry(18, 9, 80, 38);
const waveMaterial = new THREE.MeshStandardMaterial({
  color: 0x25292d,
  metalness: 0.5,
  roughness: 0.48,
  wireframe: true,
  transparent: true,
  opacity: 0.32,
});
const wave = new THREE.Mesh(waveGeometry, waveMaterial);
wave.position.set(2.8, -2.8, -3.2);
wave.rotation.set(-1.18, 0, -0.2);
scene.add(wave);

const lightA = new THREE.PointLight(0x56f0d7, 3.5, 26);
lightA.position.set(-4, 4, 6);
scene.add(lightA);

const lightB = new THREE.PointLight(0x8e9cff, 2.2, 22);
lightB.position.set(5, -2, 5);
scene.add(lightB);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.36);
scene.add(ambientLight);

const pointer = { x: 0, y: 0 };

window.addEventListener("pointermove", (event) => {
  pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
  pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
});

function resize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

window.addEventListener("resize", resize);
resize();

function animate(time) {
  const seconds = time * 0.001;

  group.rotation.y = seconds * 0.18 + pointer.x * 0.08;
  group.rotation.x = Math.sin(seconds * 0.55) * 0.09 + pointer.y * 0.05;
  ringA.rotation.z = seconds * 0.2;
  ringB.rotation.z = -seconds * 0.14;
  ringC.rotation.y = seconds * 0.26;

  const attr = particleGeometry.getAttribute("position");
  for (let i = 0; i < particleCount; i += 1) {
    const yIndex = i * 3 + 1;
    attr.array[yIndex] += 0.004 * speeds[i];
    if (attr.array[yIndex] > 7) {
      attr.array[yIndex] = -7;
    }
  }
  attr.needsUpdate = true;

  const wavePositions = wave.geometry.attributes.position;
  for (let i = 0; i < wavePositions.count; i += 1) {
    const x = wavePositions.getX(i);
    const y = wavePositions.getY(i);
    const z = Math.sin(x * 0.88 + seconds * 1.15) * 0.18 + Math.cos(y * 1.12 + seconds * 0.85) * 0.14;
    wavePositions.setZ(i, z);
  }
  wavePositions.needsUpdate = true;

  lightA.intensity = 2.8 + Math.sin(seconds * 1.2) * 0.7;
  lightB.position.x = 5 + Math.sin(seconds * 0.7) * 1.4;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);

const storageKey = "darkGateAccount";
const cartKey = "novaStoreCart";
const adminAccountKey = "novaMerchantAccount";
const merchantApplicationKey = "novaMerchantApplication";
const merchantProductsKey = "novaMerchantProducts";
const merchantOrdersKey = "novaMerchantOrders";
const authShell = document.querySelector("#authShell");
const storeApp = document.querySelector("#storeApp");
const storeUser = document.querySelector("#storeUser");
const form = document.querySelector("#loginForm");
const title = document.querySelector("#login-title");
const subhead = document.querySelector("#formSubhead");
const modeTabs = document.querySelectorAll("[data-mode]");
const username = document.querySelector("#username");
const password = document.querySelector("#password");
const confirmPassword = document.querySelector("#confirmPassword");
const confirmField = document.querySelector(".signup-only");
const remember = document.querySelector("#remember");
const rememberText = document.querySelector("#rememberText");
const resetLink = document.querySelector("#resetLink");
const submitText = document.querySelector("#submitText");
const submitIconSlot = document.querySelector("#submitIconSlot");
const message = document.querySelector("#formMessage");
const togglePassword = document.querySelector("#togglePassword");
const logoutButton = document.querySelector("#logoutButton");
const categoryLinks = document.querySelectorAll(".category-link");
const offerCards = document.querySelectorAll("[data-offer-category]");
const productGrid = document.querySelector("#productGrid");
const productSearch = document.querySelector("#productSearch");
const clearSearchButton = document.querySelector("#clearSearchButton");
const sortProducts = document.querySelector("#sortProducts");
const cartPanel = document.querySelector("#cartPanel");
const cartItems = document.querySelector("#cartItems");
const clearCartButton = document.querySelector("#clearCartButton");
const checkoutForm = document.querySelector("#checkoutForm");
const checkoutMessage = document.querySelector("#checkoutMessage");
const digitalDelivery = document.querySelector("#digitalDelivery");
const openCheckoutButton = document.querySelector("#openCheckoutButton");
const closeCheckoutButton = document.querySelector("#closeCheckoutButton");
const checkoutOverlay = document.querySelector("#checkoutOverlay");
const cartToast = document.querySelector("#cartToast");
const merchantJoinButton = document.querySelector("#merchantJoinButton");
const merchantJoinAuthButton = document.querySelector("#merchantJoinAuthButton");
const merchantJoinOverlay = document.querySelector("#merchantJoinOverlay");
const merchantJoinModal = document.querySelector("#merchantJoinModal");
const closeMerchantJoinButton = document.querySelector("#closeMerchantJoinButton");
const merchantJoinForm = document.querySelector("#merchantJoinForm");
const merchantJoinMessage = document.querySelector("#merchantJoinMessage");
const metricProducts = document.querySelector("#metricProducts");
const metricCart = document.querySelector("#metricCart");
const metricTotal = document.querySelector("#metricTotal");
const subtotalText = document.querySelector("#subtotalText");
const vatText = document.querySelector("#vatText");
const shippingText = document.querySelector("#shippingText");
const totalText = document.querySelector("#totalText");

let activeMode = "login";
let activeCategory = "all";
let searchTerm = "";
let sortMode = "featured";
let cart = loadCart();
let toastTimer;

const categoryNames = {
  all: "الكل",
  audio: "الصوتيات",
  desk: "المكتب",
  digital: "الرقميات",
  accessories: "الإكسسوارات",
};

const digitalTypeMeta = {
  activation: { icon: "key-round", label: "كود تفعيل", visual: "visual-digital" },
  subscription: { icon: "badge-check", label: "اشتراك رقمي", visual: "visual-subscription" },
  account: { icon: "user-round-check", label: "بيانات حساب", visual: "visual-account" },
  gift: { icon: "gift", label: "بطاقة رقمية", visual: "visual-gift" },
};

const products = [
  {
    id: "headset-vx",
    name: "سماعة NOVA VX",
    category: "audio",
    categoryName: "الصوتيات",
    price: 349,
    rating: 4.8,
    stock: 18,
    icon: "headphones",
    visual: "visual-headset",
    description: "عزل ضوضاء، مايك مزدوج، وبطارية 38 ساعة.",
    specs: ["Bluetooth 5.3", "ANC", "USB-C"],
    discountPercent: 15,
  },
  {
    id: "keyboard-k87",
    name: "لوحة مفاتيح K87",
    category: "desk",
    categoryName: "المكتب",
    price: 429,
    rating: 4.7,
    stock: 11,
    icon: "keyboard",
    visual: "visual-keyboard",
    description: "ميكانيكية، إضاءة RGB هادئة، ومفاتيح قابلة للتبديل.",
    specs: ["Hot-swap", "Wireless", "Arabic keys"],
  },
  {
    id: "mouse-pro",
    name: "ماوس Precision Pro",
    category: "desk",
    categoryName: "المكتب",
    price: 219,
    rating: 4.6,
    stock: 24,
    icon: "mouse",
    visual: "visual-mouse",
    description: "حساس 26K DPI، وزن خفيف، وقبضة مريحة.",
    specs: ["26K DPI", "USB-C", "74g"],
  },
  {
    id: "monitor-q27",
    name: "شاشة QHD 27",
    category: "desk",
    categoryName: "المكتب",
    price: 1299,
    rating: 4.9,
    stock: 7,
    icon: "monitor",
    visual: "visual-monitor",
    description: "دقة QHD، معدل 165Hz، وألوان دقيقة للعمل واللعب.",
    specs: ["QHD", "165Hz", "IPS"],
    discountPercent: 7,
  },
  {
    id: "mic-studio",
    name: "مايك Studio USB",
    category: "audio",
    categoryName: "الصوتيات",
    price: 279,
    rating: 4.5,
    stock: 15,
    icon: "mic",
    visual: "visual-mic",
    description: "صوت واضح للبث والاجتماعات مع فلتر ضوضاء داخلي.",
    specs: ["USB-C", "Mute", "Desk stand"],
    discountPercent: 12,
  },
  {
    id: "charger-gan",
    name: "شاحن GaN 65W",
    category: "accessories",
    categoryName: "الإكسسوارات",
    price: 159,
    rating: 4.7,
    stock: 32,
    icon: "plug-zap",
    visual: "visual-charger",
    description: "شحن سريع بثلاثة منافذ وحماية ذكية من الحرارة.",
    specs: ["65W", "2 USB-C", "1 USB-A"],
    discountPercent: 10,
  },
  {
    id: "webcam-2k",
    name: "كاميرا ويب 2K",
    category: "accessories",
    categoryName: "الإكسسوارات",
    price: 239,
    rating: 4.4,
    stock: 13,
    icon: "webcam",
    visual: "visual-camera",
    description: "صورة حادة، تركيز تلقائي، وغطاء خصوصية مدمج.",
    specs: ["2K", "Auto focus", "Privacy cover"],
  },
  {
    id: "stand-flex",
    name: "حامل لابتوب Flex",
    category: "accessories",
    categoryName: "الإكسسوارات",
    price: 189,
    rating: 4.6,
    stock: 20,
    icon: "laptop",
    visual: "visual-stand",
    description: "ألمنيوم ثابت، قابل للطي، مناسب للمكاتب الصغيرة.",
    specs: ["Aluminum", "Foldable", "Portable"],
    discountPercent: 8,
  },
];

function formatMoney(value) {
  return `${Math.round(value).toLocaleString("ar-SA")} ر.س`;
}

function setMessage(text, type = "") {
  message.textContent = text;
  message.className = `form-message ${type}`.trim();
}

function setCheckoutMessage(text, type = "") {
  checkoutMessage.textContent = text;
  checkoutMessage.className = `checkout-message ${type}`.trim();
}

function setMerchantJoinMessage(text, type = "") {
  if (!merchantJoinMessage) return;
  merchantJoinMessage.textContent = text;
  merchantJoinMessage.className = `checkout-message ${type}`.trim();
}

function productPrice(product) {
  if (!product.discountPercent) return product.price;
  return Math.round(product.price * (1 - product.discountPercent / 100));
}

function showCartToast(product) {
  if (!cartToast) return;
  cartToast.querySelector("span").textContent = `${product.name} أضيفت للسلة`;
  cartToast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    cartToast.classList.remove("is-visible");
  }, 1900);
}

function openCheckoutDrawer() {
  checkoutOverlay.classList.remove("is-hidden");
  checkoutOverlay.setAttribute("aria-hidden", "false");
  cartPanel.classList.remove("is-hidden");
  document.body.classList.add("checkout-open");
}

function closeCheckoutDrawer() {
  checkoutOverlay.classList.add("is-hidden");
  checkoutOverlay.setAttribute("aria-hidden", "true");
  cartPanel.classList.add("is-hidden");
  document.body.classList.remove("checkout-open");
}

function openMerchantJoin() {
  closeCheckoutDrawer();
  setMerchantJoinMessage("");
  merchantJoinOverlay.classList.remove("is-hidden");
  merchantJoinOverlay.setAttribute("aria-hidden", "false");
  merchantJoinModal.classList.remove("is-hidden");
  document.body.classList.add("merchant-join-open");
  const savedApplication = readObjectStorage(merchantApplicationKey);
  if (savedApplication && merchantJoinForm) {
    merchantJoinForm.elements.storeName.value = savedApplication.storeName || "";
    merchantJoinForm.elements.ownerName.value = savedApplication.ownerName || "";
    merchantJoinForm.elements.email.value = savedApplication.email || "";
    merchantJoinForm.elements.phone.value = savedApplication.phone || "";
    merchantJoinForm.elements.businessType.value = savedApplication.businessType || "";
    merchantJoinForm.elements.merchantUsername.value = savedApplication.username || "";
  }
  merchantJoinForm?.elements.storeName?.focus();
}

function closeMerchantJoin() {
  merchantJoinOverlay.classList.add("is-hidden");
  merchantJoinOverlay.setAttribute("aria-hidden", "true");
  merchantJoinModal.classList.add("is-hidden");
  document.body.classList.remove("merchant-join-open");
}

function shakeForm() {
  form.classList.remove("shake");
  requestAnimationFrame(() => form.classList.add("shake"));
}

function getSavedAccount() {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || "null");
  } catch {
    return null;
  }
}

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(cartKey) || "[]");
  } catch {
    return [];
  }
}

function saveCart() {
  localStorage.setItem(cartKey, JSON.stringify(cart));
}

async function hashPassword(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function readArrayStorage(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function readObjectStorage(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    return value && typeof value === "object" && !Array.isArray(value) ? value : null;
  } catch {
    return null;
  }
}

function writeObjectStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function writeArrayStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function loadMerchantProducts() {
  return readArrayStorage(merchantProductsKey);
}

function saveMerchantProducts(items) {
  writeArrayStorage(merchantProductsKey, items);
}

function loadMerchantOrders() {
  return readArrayStorage(merchantOrdersKey);
}

function saveMerchantOrders(items) {
  writeArrayStorage(merchantOrdersKey, items.slice(0, 80));
}

function normalizeDeliveryItem(item) {
  if (typeof item === "string") {
    return { id: `item-${crypto.randomUUID?.() || Date.now()}`, value: item, soldAt: "" };
  }
  return {
    id: item.id || `item-${crypto.randomUUID?.() || Date.now()}`,
    value: item.value || item.code || "",
    soldAt: item.soldAt || "",
    orderId: item.orderId || "",
  };
}

function availableDeliveryItems(product) {
  const items = Array.isArray(product.deliveryItems) ? product.deliveryItems : product.codes || [];
  return items.map(normalizeDeliveryItem).filter((item) => item.value.trim() && !item.soldAt);
}

function normalizeMerchantProduct(product) {
  const type = product.type || "activation";
  const meta = digitalTypeMeta[type] || digitalTypeMeta.activation;
  const category = product.category || "digital";
  const stock = availableDeliveryItems(product).length;
  const specs = Array.isArray(product.specs) ? product.specs : String(product.specs || "").split(",");
  const cleanSpecs = specs.map((spec) => String(spec).trim()).filter(Boolean);

  return {
    id: `merchant-${product.id}`,
    merchantId: product.id,
    name: product.name || meta.label,
    category,
    categoryName: categoryNames[category] || "الرقميات",
    price: Number(product.price) || 0,
    rating: Number(product.rating) || 4.7,
    stock,
    icon: product.icon || meta.icon,
    visual: product.visual || meta.visual,
    description: product.description || "منتج رقمي بتسليم فوري بعد تأكيد الطلب.",
    specs: [meta.label, "تسليم رقمي", `${stock} متاح`, ...cleanSpecs].slice(0, 3),
    discountPercent: Number(product.discountPercent) || 0,
    isDigital: true,
  };
}

function catalogProducts() {
  const merchantProducts = loadMerchantProducts()
    .filter((product) => product.active !== false)
    .map(normalizeMerchantProduct)
    .filter((product) => product.merchantId && product.name && product.price > 0 && product.stock > 0);

  return [...products, ...merchantProducts];
}

function clearDigitalDelivery() {
  if (!digitalDelivery) return;
  digitalDelivery.classList.add("is-hidden");
  digitalDelivery.innerHTML = "";
}

function renderDigitalDelivery(items, orderId) {
  if (!digitalDelivery || !items.length) return;
  digitalDelivery.classList.remove("is-hidden");
  digitalDelivery.innerHTML = `
    <div class="delivery-head">
      <span>بيانات التسليم الرقمي</span>
      <strong>${escapeHtml(orderId)}</strong>
    </div>
    ${items
      .map(
        (product) => `
          <article class="delivery-product">
            <h3>${escapeHtml(product.name)}</h3>
            ${product.items.map((item) => `<code>${escapeHtml(item)}</code>`).join("")}
          </article>
        `,
      )
      .join("")}
  `;
}

function fulfillDigitalItems(items, orderId) {
  const merchantProducts = loadMerchantProducts();
  const delivery = [];

  for (const cartItem of items) {
    if (!cartItem.id.startsWith("merchant-")) continue;

    const merchantId = cartItem.id.replace("merchant-", "");
    const product = merchantProducts.find((candidate) => candidate.id === merchantId);
    if (!product) {
      return { ok: false, productName: "منتج رقمي" };
    }

    const deliveryItems = (Array.isArray(product.deliveryItems) ? product.deliveryItems : product.codes || []).map(normalizeDeliveryItem);
    const available = deliveryItems.filter((item) => item.value.trim() && !item.soldAt);
    if (available.length < cartItem.quantity) {
      return { ok: false, productName: product.name || "منتج رقمي" };
    }

    const picked = [];
    for (const item of deliveryItems) {
      if (picked.length >= cartItem.quantity) break;
      if (!item.value.trim() || item.soldAt) continue;
      item.soldAt = new Date().toISOString();
      item.orderId = orderId;
      picked.push(item.value);
    }

    product.deliveryItems = deliveryItems;
    delivery.push({ name: product.name, items: picked });
  }

  if (delivery.length) {
    saveMerchantProducts(merchantProducts);
    const orders = loadMerchantOrders();
    orders.unshift({
      id: orderId,
      createdAt: new Date().toISOString(),
      items: delivery.map((item) => ({ name: item.name, quantity: item.items.length })),
    });
    saveMerchantOrders(orders);
  }

  return { ok: true, delivery };
}

function filteredProducts() {
  const normalized = searchTerm.trim().toLowerCase();
  const filtered = catalogProducts().filter((product) => {
    const inCategory = activeCategory === "all" || product.category === activeCategory;
    const inSearch =
      !normalized ||
      product.name.toLowerCase().includes(normalized) ||
      product.description.toLowerCase().includes(normalized) ||
      product.categoryName.toLowerCase().includes(normalized);
    return inCategory && inSearch;
  });

  return [...filtered].sort((a, b) => {
    if (sortMode === "priceAsc") return productPrice(a) - productPrice(b);
    if (sortMode === "priceDesc") return productPrice(b) - productPrice(a);
    if (sortMode === "rating") return b.rating - a.rating;
    return b.rating * 100 - productPrice(b) / 20 - (a.rating * 100 - productPrice(a) / 20);
  });
}

function cartCount() {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function cartSubtotal() {
  const catalog = catalogProducts();
  return cart.reduce((sum, item) => {
    const product = catalog.find((candidate) => candidate.id === item.id);
    return product ? sum + productPrice(product) * item.quantity : sum;
  }, 0);
}

function cartTotals() {
  const subtotal = cartSubtotal();
  const vat = subtotal * 0.15;
  const shipping = subtotal === 0 || subtotal >= 500 ? 0 : 25;
  return { subtotal, vat, shipping, total: subtotal + vat + shipping };
}

function updateCategoryCounts() {
  const catalog = catalogProducts();
  document.querySelector("#countAll").textContent = catalog.length;
  document.querySelector("#countAudio").textContent = catalog.filter((product) => product.category === "audio").length;
  document.querySelector("#countDesk").textContent = catalog.filter((product) => product.category === "desk").length;
  document.querySelector("#countDigital").textContent = catalog.filter((product) => product.category === "digital").length;
  document.querySelector("#countAccessories").textContent = catalog.filter((product) => product.category === "accessories").length;
}

function renderProducts() {
  const list = filteredProducts();
  if (metricProducts) {
    metricProducts.textContent = list.length;
  }

  if (!list.length) {
    productGrid.innerHTML = `
      <article class="empty-state">
        <i data-lucide="search-x" aria-hidden="true"></i>
        <h2>لا توجد منتجات مطابقة</h2>
        <p>جرّب تصنيفًا آخر أو كلمة بحث مختلفة.</p>
      </article>
    `;
    window.lucide?.createIcons();
    return;
  }

  productGrid.innerHTML = list
    .map(
      (product) => `
        <article class="product-card">
          <div class="product-visual ${product.visual}">
            ${product.discountPercent ? `<span class="sale-badge">خصم ${product.discountPercent}%</span>` : ""}
            <i data-lucide="${product.icon}" aria-hidden="true"></i>
          </div>
          <div class="product-body">
            <div class="product-meta">
              <span>${escapeHtml(product.categoryName)}</span>
              <span><i data-lucide="star" aria-hidden="true"></i>${product.rating}</span>
            </div>
            <h2>${escapeHtml(product.name)}</h2>
            <p>${escapeHtml(product.description)}</p>
            <div class="spec-row">
              ${product.specs.map((spec) => `<span>${escapeHtml(spec)}</span>`).join("")}
            </div>
            <div class="product-footer">
              <div class="price-stack">
                ${product.discountPercent ? `<del>${formatMoney(product.price)}</del>` : ""}
                <strong>${formatMoney(productPrice(product))}</strong>
              </div>
              <button class="add-button" type="button" data-add="${product.id}">
                <span>أضف للسلة</span>
                <i data-lucide="shopping-cart" aria-hidden="true"></i>
              </button>
            </div>
          </div>
        </article>
      `,
    )
    .join("");

  window.lucide?.createIcons();
}

function renderCart() {
  const totals = cartTotals();
  const catalog = catalogProducts();
  metricCart.textContent = cartCount();
  if (metricTotal) {
    metricTotal.textContent = formatMoney(totals.total);
  }
  subtotalText.textContent = formatMoney(totals.subtotal);
  vatText.textContent = formatMoney(totals.vat);
  shippingText.textContent = totals.shipping === 0 ? "مجاني" : formatMoney(totals.shipping);
  totalText.textContent = formatMoney(totals.total);

  if (!cart.length) {
    cartItems.innerHTML = `
      <div class="empty-cart">
        <i data-lucide="shopping-bag" aria-hidden="true"></i>
        <p>السلة فارغة</p>
      </div>
    `;
    window.lucide?.createIcons();
    return;
  }

  cartItems.innerHTML = cart
    .map((item) => {
      const product = catalog.find((candidate) => candidate.id === item.id);
      if (!product) return "";
      return `
        <article class="cart-item">
          <div class="cart-item-icon ${product.visual}">
            <i data-lucide="${product.icon}" aria-hidden="true"></i>
          </div>
          <div>
            <h3>${escapeHtml(product.name)}</h3>
            <span>${formatMoney(productPrice(product))}</span>
            <div class="quantity-controls" aria-label="تعديل الكمية">
              <button type="button" data-dec="${product.id}" aria-label="إنقاص الكمية">-</button>
              <strong>${item.quantity}</strong>
              <button type="button" data-inc="${product.id}" aria-label="زيادة الكمية">+</button>
              <button type="button" data-remove="${product.id}" aria-label="إزالة المنتج">
                <i data-lucide="x" aria-hidden="true"></i>
              </button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  window.lucide?.createIcons();
}

function renderStore() {
  updateCategoryCounts();
  renderProducts();
  renderCart();
}

function selectCategory(category) {
  activeCategory = category;
  categoryLinks.forEach((candidate) => candidate.classList.toggle("active", candidate.dataset.category === category));
  searchTerm = "";
  productSearch.value = "";
  renderProducts();
}

function addToCart(productId) {
  const product = catalogProducts().find((candidate) => candidate.id === productId);
  if (!product) return;
  clearDigitalDelivery();
  const item = cart.find((candidate) => candidate.id === productId);
  if (item) {
    item.quantity = Math.min(item.quantity + 1, product.stock);
  } else {
    cart.push({ id: productId, quantity: 1 });
  }
  saveCart();
  setCheckoutMessage("");
  renderStore();
  showCartToast(product);
}

function changeQuantity(productId, delta) {
  const product = catalogProducts().find((candidate) => candidate.id === productId);
  const item = cart.find((candidate) => candidate.id === productId);
  if (!product || !item) return;
  item.quantity += delta;
  if (item.quantity <= 0) {
    cart = cart.filter((candidate) => candidate.id !== productId);
  } else {
    item.quantity = Math.min(item.quantity, product.stock);
  }
  saveCart();
  renderStore();
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  saveCart();
  renderStore();
}

function showStore(user) {
  document.body.classList.remove("signup-mode");
  document.body.classList.add("store-open");
  authShell.classList.add("is-hidden");
  storeApp.classList.remove("is-hidden");
  storeUser.textContent = user;
  renderStore();
}

function showAuth(messageText = "") {
  closeCheckoutDrawer();
  storeApp.classList.add("is-hidden");
  authShell.classList.remove("is-hidden");
  document.body.classList.remove("store-open");
  setMode("login", { clearFields: true, clearMessage: false });
  setMessage(messageText, messageText ? "success" : "");
}

function setMode(mode, options = {}) {
  activeMode = mode;
  const isSignup = mode === "signup";

  document.body.classList.toggle("signup-mode", isSignup);
  title.textContent = isSignup ? "إنشاء حساب" : "بوابة الدخول";
  subhead.textContent = isSignup ? "اختر اسم مستخدم وكلمة مرور لحسابك الجديد." : "أدخل بياناتك للمتابعة إلى متجر NOVA.";
  submitText.textContent = isSignup ? "إنشاء الحساب" : "دخول";
  submitIconSlot.innerHTML = `<i data-lucide="${isSignup ? "user-plus" : "log-in"}"></i>`;
  rememberText.textContent = isSignup ? "حفظ الحساب على هذا المتصفح" : "تذكرني";
  resetLink.classList.toggle("is-hidden", isSignup);
  confirmField.classList.toggle("is-hidden", !isSignup);
  confirmPassword.required = isSignup;
  password.autocomplete = isSignup ? "new-password" : "current-password";

  modeTabs.forEach((tab) => {
    const selected = tab.dataset.mode === mode;
    tab.classList.toggle("active", selected);
    tab.setAttribute("aria-selected", String(selected));
  });

  if (options.clearFields !== false) {
    password.value = "";
    confirmPassword.value = "";
  }
  if (options.clearMessage !== false) {
    setMessage("");
  }

  window.lucide?.createIcons();
}

modeTabs.forEach((tab) => {
  tab.addEventListener("click", () => setMode(tab.dataset.mode));
});

categoryLinks.forEach((link) => {
  link.addEventListener("click", () => {
    selectCategory(link.dataset.category);
  });
});

offerCards.forEach((card) => {
  card.addEventListener("click", () => {
    selectCategory(card.dataset.offerCategory);
  });
});

productSearch.addEventListener("input", (event) => {
  searchTerm = event.target.value;
  renderProducts();
});

clearSearchButton.addEventListener("click", () => {
  searchTerm = "";
  productSearch.value = "";
  renderProducts();
  productSearch.focus();
});

sortProducts.addEventListener("change", (event) => {
  sortMode = event.target.value;
  renderProducts();
});

openCheckoutButton.addEventListener("click", openCheckoutDrawer);
closeCheckoutButton.addEventListener("click", closeCheckoutDrawer);
checkoutOverlay.addEventListener("click", closeCheckoutDrawer);

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && merchantJoinModal && !merchantJoinModal.classList.contains("is-hidden")) {
    closeMerchantJoin();
    return;
  }
  if (event.key === "Escape" && !cartPanel.classList.contains("is-hidden")) {
    closeCheckoutDrawer();
  }
});

productGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-add]");
  if (!button) return;
  addToCart(button.dataset.add);
});

cartItems.addEventListener("click", (event) => {
  const inc = event.target.closest("[data-inc]");
  const dec = event.target.closest("[data-dec]");
  const remove = event.target.closest("[data-remove]");
  if (inc) changeQuantity(inc.dataset.inc, 1);
  if (dec) changeQuantity(dec.dataset.dec, -1);
  if (remove) removeFromCart(remove.dataset.remove);
});

clearCartButton.addEventListener("click", () => {
  cart = [];
  saveCart();
  setCheckoutMessage("");
  clearDigitalDelivery();
  renderStore();
});

merchantJoinButton?.addEventListener("click", openMerchantJoin);
merchantJoinAuthButton?.addEventListener("click", openMerchantJoin);
closeMerchantJoinButton?.addEventListener("click", closeMerchantJoin);
merchantJoinOverlay?.addEventListener("click", closeMerchantJoin);

merchantJoinForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(event.target);
  const storeName = String(data.get("storeName") || "").trim();
  const ownerName = String(data.get("ownerName") || "").trim();
  const email = String(data.get("email") || "").trim();
  const phone = String(data.get("phone") || "").trim();
  const businessType = String(data.get("businessType") || "").trim();
  const merchantUsername = String(data.get("merchantUsername") || "").trim();
  const merchantPassword = String(data.get("merchantPassword") || "").trim();
  const merchantConfirmPassword = String(data.get("merchantConfirmPassword") || "").trim();
  const acceptedTerms = data.get("terms") === "on";

  if (!storeName || !ownerName || !email || !phone || !businessType || !merchantUsername || merchantPassword.length < 4) {
    setMerchantJoinMessage("أكمل بيانات التاجر وبيانات الدخول.", "error");
    return;
  }
  if (merchantPassword !== merchantConfirmPassword) {
    setMerchantJoinMessage("كلمتا مرور التاجر غير متطابقتين.", "error");
    return;
  }
  if (!acceptedTerms) {
    setMerchantJoinMessage("الموافقة على شروط التاجر مطلوبة.", "error");
    return;
  }

  const application = {
    id: `merchant-application-${Date.now()}`,
    storeName,
    ownerName,
    email,
    phone,
    businessType,
    username: merchantUsername,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  writeObjectStorage(merchantApplicationKey, application);

  const existingMerchantAccount = readObjectStorage(adminAccountKey);
  if (!existingMerchantAccount) {
    writeObjectStorage(adminAccountKey, {
      username: merchantUsername,
      passwordHash: await hashPassword(merchantPassword),
      createdAt: new Date().toISOString(),
      applicationId: application.id,
      storeName,
      ownerName,
    });
    setMerchantJoinMessage("تم إنشاء حساب التاجر. سيتم تحويلك لتسجيل الدخول.", "success");
  } else {
    setMerchantJoinMessage("تم حفظ طلب الانضمام. سيتم تحويلك لصفحة دخول التاجر.", "success");
  }

  window.setTimeout(() => {
    window.location.href = "./admin.html?merchant=joined";
  }, 850);
});

checkoutForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!cart.length) {
    setCheckoutMessage("أضف منتجًا واحدًا على الأقل قبل تأكيد الطلب.", "error");
    return;
  }
  const orderId = `NV-${Math.floor(10000 + Math.random() * 90000)}`;
  const fulfillment = fulfillDigitalItems(cart, orderId);
  if (!fulfillment.ok) {
    setCheckoutMessage(`المخزون الرقمي غير كافٍ لمنتج ${fulfillment.productName}. حدّث السلة ثم حاول مرة أخرى.`, "error");
    renderStore();
    return;
  }

  setCheckoutMessage(`تم إنشاء الطلب ${orderId}.`, "success");
  cart = [];
  saveCart();
  checkoutForm.reset();
  renderStore();
  renderDigitalDelivery(fulfillment.delivery, orderId);
});

logoutButton.addEventListener("click", () => {
  password.value = "";
  confirmPassword.value = "";
  showAuth("تم تسجيل الخروج.");
});

resetLink.addEventListener("click", (event) => {
  event.preventDefault();
  setMessage("أنشئ حسابًا جديدًا إذا احتجت إعادة ضبط بيانات الدخول.", "error");
});

togglePassword.addEventListener("click", () => {
  const isHidden = password.type === "password";
  password.type = isHidden ? "text" : "password";
  confirmPassword.type = isHidden ? "text" : "password";
  togglePassword.setAttribute("aria-label", isHidden ? "إخفاء كلمة المرور" : "إظهار كلمة المرور");
  togglePassword.innerHTML = isHidden
    ? '<i data-lucide="eye-off" aria-hidden="true"></i>'
    : '<i data-lucide="eye" aria-hidden="true"></i>';
  window.lucide?.createIcons();
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const cleanUsername = username.value.trim();
  const cleanPassword = password.value.trim();
  const cleanConfirmPassword = confirmPassword.value.trim();

  if (!cleanUsername || cleanPassword.length < 4) {
    setMessage("تحقق من اسم المستخدم وكلمة المرور.", "error");
    shakeForm();
    return;
  }

  if (activeMode === "signup") {
    if (cleanPassword !== cleanConfirmPassword) {
      setMessage("كلمتا المرور غير متطابقتين.", "error");
      shakeForm();
      return;
    }

    const passwordHash = await hashPassword(cleanPassword);
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        username: cleanUsername,
        passwordHash,
        createdAt: new Date().toISOString(),
        remember: remember.checked,
      }),
    );

    setMode("login", { clearFields: true, clearMessage: false });
    username.value = cleanUsername;
    setMessage("تم إنشاء الحساب. سجل الدخول الآن بنفس البيانات.", "success");
    return;
  }

  const savedAccount = getSavedAccount();
  if (!savedAccount || savedAccount.username !== cleanUsername) {
    setMessage("لا يوجد حساب بهذا الاسم. أنشئ حسابًا أولًا.", "error");
    shakeForm();
    return;
  }

  const passwordHash = await hashPassword(cleanPassword);
  if (savedAccount.passwordHash !== passwordHash) {
    setMessage("بيانات الدخول غير صحيحة.", "error");
    shakeForm();
    return;
  }

  setMessage("تم تسجيل الدخول بنجاح.", "success");
  showStore(cleanUsername);
});

window.addEventListener("load", () => {
  renderStore();
  window.lucide?.createIcons();
});
