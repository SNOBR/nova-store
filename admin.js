const adminAccountKey = "novaMerchantAccount";
const merchantProductsKey = "novaMerchantProducts";
const merchantOrdersKey = "novaMerchantOrders";
const merchantCustomersKey = "novaMerchantCustomers";
const merchantCouponsKey = "novaMerchantCoupons";
const merchantTemplatesKey = "novaMerchantTemplates";
const merchantSettingsKey = "novaMerchantSettings";
const merchantApplicationKey = "novaMerchantApplication";

const authShell = document.querySelector("#adminAuthShell");
const dashboard = document.querySelector("#adminDashboard");
const authForm = document.querySelector("#adminAuthForm");
const authTitle = document.querySelector("#adminAuthTitle");
const authSubhead = document.querySelector("#adminAuthSubhead");
const authMessage = document.querySelector("#adminAuthMessage");
const adminUsername = document.querySelector("#adminUsername");
const adminPassword = document.querySelector("#adminPassword");
const adminConfirmPassword = document.querySelector("#adminConfirmPassword");
const adminConfirmField = document.querySelector("#adminConfirmField");
const adminSubmitText = document.querySelector("#adminSubmitText");
const adminView = document.querySelector("#adminView");
const adminGlobalSearch = document.querySelector("#adminGlobalSearch");
const modal = document.querySelector("#adminModal");
const modalBody = document.querySelector("#modalBody");
const modalCloseButton = document.querySelector("#modalCloseButton");
const toast = document.querySelector("#merchantToast");
const notificationCount = document.querySelector("#notificationCount");
const ordersShortcutCount = document.querySelector("#ordersShortcutCount");

const state = {
  view: "orders",
  search: "",
  orderStatus: "all",
  sortOrdersDesc: true,
  manualOrder: null,
  productEditor: null,
};

const orderStatuses = {
  all: "الكل",
  new: "جديد",
  processing: "جاري التجهيز",
  ready: "جاهز",
  shipping: "جاري التوصيل",
  completed: "مكتمل",
  cancelled: "ملغي",
  returned: "قيد الاسترجاع",
  partial: "مسترجع جزئيًا",
  refunded: "مسترجع",
};

const typeMeta = {
  activation: { label: "كود تفعيل", icon: "key-round", visual: "visual-digital" },
  subscription: { label: "اشتراك رقمي", icon: "badge-check", visual: "visual-subscription" },
  account: { label: "بيانات حساب مرخص", icon: "user-round-check", visual: "visual-account" },
  gift: { label: "بطاقة رقمية", icon: "gift", visual: "visual-gift" },
};

const paymentLabels = {
  paid: "مدفوع",
  pending: "بانتظار الدفع",
  refunded: "مسترجع",
};

const manualOrderSteps = [
  { id: 1, label: "إضافة منتجات" },
  { id: 2, label: "معلومات العميل" },
  { id: 3, label: "طريقة الشحن والدفع" },
  { id: 4, label: "ملخص الطلب" },
];

const warehouseOptions = {
  main: "المخزن الرئيسي",
  digital: "مخزن الأكواد الرقمية",
  subscriptions: "اشتراكات وحسابات",
};

const currencyOptions = {
  SAR: "ريال سعودي - (ر.س)",
  USD: "دولار أمريكي - ($)",
  AED: "درهم إماراتي - (د.إ)",
};

const shippingOptions = {
  digital: "تسليم رقمي فوري",
  whatsapp: "إرسال عبر واتساب",
  email: "إرسال عبر البريد الإلكتروني",
};

const productCategoryOptions = {
  digital: "الرقميات",
  accessories: "الإكسسوارات",
  desk: "المكتب",
  audio: "الصوتيات",
};

const productTemplateOptions = {
  default: "الإفتراضي",
  codes: "أكواد التفعيل",
  subscriptions: "اشتراكات وحسابات",
  gift: "بطاقات رقمية",
};

const productSectionLabels = {
  advanced: "معلومات متقدمة",
  options: "خيارات المنتج",
  customization: "تخصيص المنتج",
  seo: "تحسين محركات البحث",
  customFields: "الحقول المخصصة",
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatMoney(value) {
  return `${Math.round(Number(value) || 0).toLocaleString("ar-SA")} ر.س`;
}

function createId(prefix = "item") {
  if (crypto.randomUUID) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function readObject(key, fallback = null) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function readArray(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function loadProducts() {
  return readArray(merchantProductsKey);
}

function saveProducts(products) {
  writeJson(merchantProductsKey, products);
}

function normalizeDeliveryItem(item) {
  if (typeof item === "string") {
    return { id: createId("code"), value: item, soldAt: "", orderId: "", createdAt: new Date().toISOString() };
  }
  return {
    id: item.id || createId("code"),
    value: item.value || item.code || "",
    soldAt: item.soldAt || "",
    orderId: item.orderId || "",
    createdAt: item.createdAt || new Date().toISOString(),
  };
}

function deliveryList(product) {
  return (Array.isArray(product.deliveryItems) ? product.deliveryItems : product.codes || []).map(normalizeDeliveryItem);
}

function availableCount(product) {
  return deliveryList(product).filter((item) => item.value.trim() && !item.soldAt).length;
}

function soldCount(product) {
  return deliveryList(product).filter((item) => item.value.trim() && item.soldAt).length;
}

function salePrice(product) {
  const price = Number(product.price) || 0;
  const discount = Number(product.discountPercent) || 0;
  return Math.round(price * (1 - discount / 100));
}

function loadOrders() {
  return readArray(merchantOrdersKey).map((order, index) => ({
    id: order.id || `NV-${10000 + index}`,
    createdAt: order.createdAt || new Date().toISOString(),
    customer: order.customer || "عميل المتجر",
    phone: order.phone || "-",
    source: order.source || "المتجر الإلكتروني",
    status: order.status || "new",
    paymentStatus: order.paymentStatus || "paid",
    shipping: order.shipping || "تسليم رقمي",
    platform: order.platform || "NOVA",
    total: Number(order.total) || 0,
    items: Array.isArray(order.items) ? order.items : [],
  }));
}

function saveOrders(orders) {
  writeJson(merchantOrdersKey, orders.slice(0, 120));
}

function loadCustomers() {
  const saved = readArray(merchantCustomersKey);
  const fromOrders = loadOrders().map((order) => ({
    id: `customer-${order.phone || order.id}`,
    name: order.customer,
    phone: order.phone,
    orders: 1,
    spent: Number(order.total) || 0,
  }));
  const merged = new Map();
  [...saved, ...fromOrders].forEach((customer) => {
    const key = customer.phone || customer.id || createId("customer");
    const current = merged.get(key);
    if (current) {
      current.orders += Number(customer.orders) || 0;
      current.spent += Number(customer.spent) || 0;
    } else {
      merged.set(key, {
        id: customer.id || createId("customer"),
        name: customer.name || "عميل",
        phone: customer.phone || "-",
        orders: Number(customer.orders) || 0,
        spent: Number(customer.spent) || 0,
      });
    }
  });
  return [...merged.values()];
}

function settings() {
  return {
    storeName: "NOVA Store",
    supportPhone: "05xxxxxxxx",
    defaultShipping: "تسليم رقمي",
    cod: true,
    card: true,
    applePay: false,
    sms: true,
    whatsapp: true,
    ...readObject(merchantSettingsKey, {}),
  };
}

async function hashPassword(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove("is-hidden");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.add("is-hidden"), 1800);
}

function openModal(html) {
  modalBody.innerHTML = html;
  modal.classList.remove("is-hidden");
  modal.setAttribute("aria-hidden", "false");
  window.lucide?.createIcons();
}

function closeModal() {
  modal.classList.add("is-hidden");
  modal.setAttribute("aria-hidden", "true");
  modalBody.innerHTML = "";
}

function setActiveView(view) {
  state.view = view;
  const activeView = view === "createOrder" ? "orders" : view === "productEditor" ? "products" : view;
  document.querySelectorAll("[data-view]").forEach((button) => button.classList.toggle("active", button.dataset.view === activeView));
  document.querySelectorAll("[data-view-shortcut]").forEach((button) => button.classList.toggle("active", button.dataset.viewShortcut === activeView));
  render();
}

function statusCounts() {
  const orders = loadOrders();
  return Object.fromEntries(Object.keys(orderStatuses).map((status) => [status, status === "all" ? orders.length : orders.filter((order) => order.status === status).length]));
}

function filteredOrders() {
  const normalized = state.search.trim().toLowerCase();
  return loadOrders()
    .filter((order) => state.orderStatus === "all" || order.status === state.orderStatus)
    .filter((order) => {
      if (!normalized) return true;
      return [order.id, order.customer, order.phone, order.source, order.status].some((value) => String(value).toLowerCase().includes(normalized));
    })
    .sort((a, b) => state.sortOrdersDesc ? new Date(b.createdAt) - new Date(a.createdAt) : new Date(a.createdAt) - new Date(b.createdAt));
}

function dashboardStats() {
  const products = loadProducts();
  const orders = loadOrders();
  return {
    products: products.length,
    available: products.reduce((sum, product) => sum + availableCount(product), 0),
    sold: products.reduce((sum, product) => sum + soldCount(product), 0),
    orders: orders.length,
    revenue: orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0),
    customers: loadCustomers().length,
  };
}

function updateTopCounts() {
  const counts = statusCounts();
  notificationCount.textContent = counts.new || 0;
  ordersShortcutCount.textContent = loadOrders().length;
}

function renderHeader(title, subtitle, actions = "") {
  return `
    <div class="view-head">
      <div>
        <h1>${escapeHtml(title)}</h1>
        <p>${escapeHtml(subtitle)}</p>
      </div>
      <div class="view-actions">${actions}</div>
    </div>
  `;
}

function createManualOrderDraft() {
  return {
    step: 1,
    warehouse: "digital",
    currency: "SAR",
    pickerOpen: false,
    selectedProductId: "",
    selectedQuantity: 1,
    customName: "",
    customPrice: "",
    customer: "",
    phone: "",
    email: "",
    shipping: "digital",
    paymentStatus: "pending",
    note: "",
    items: [],
  };
}

function ensureManualOrderDraft() {
  if (!state.manualOrder) state.manualOrder = createManualOrderDraft();
  return state.manualOrder;
}

function startManualOrder() {
  state.manualOrder = createManualOrderDraft();
  setActiveView("createOrder");
}

function syncManualOrderFields() {
  const draft = ensureManualOrderDraft();
  adminView.querySelectorAll("[data-manual-field]").forEach((field) => {
    draft[field.dataset.manualField] = field.value;
  });
  const productSource = adminView.querySelector("[data-manual-product-source]");
  const productQuantity = adminView.querySelector("[data-manual-product-quantity]");
  if (productSource) draft.selectedProductId = productSource.value;
  if (productQuantity) draft.selectedQuantity = Math.max(1, Number(productQuantity.value) || 1);
  return draft;
}

function manualLineTotal(item) {
  return (Number(item.unitPrice) || 0) * (Number(item.quantity) || 1);
}

function manualOrderSubtotal() {
  return ensureManualOrderDraft().items.reduce((sum, item) => sum + manualLineTotal(item), 0);
}

function manualOrderDiscount() {
  return ensureManualOrderDraft().items.reduce((sum, item) => {
    const beforeDiscount = (Number(item.originalPrice) || Number(item.unitPrice) || 0) * (Number(item.quantity) || 1);
    return sum + Math.max(0, beforeDiscount - manualLineTotal(item));
  }, 0);
}

function manualOrderWeight() {
  return ensureManualOrderDraft().items.reduce((sum, item) => sum + (Number(item.quantity) || 1) * 0.05, 0);
}

function addManualOrderProduct() {
  const draft = syncManualOrderFields();
  const products = loadProducts();
  const product = products.find((item) => item.id === draft.selectedProductId);
  const quantity = Math.max(1, Number(draft.selectedQuantity) || 1);
  let item;

  if (product) {
    item = {
      id: createId("manual-item"),
      productId: product.id,
      name: product.name,
      quantity,
      originalPrice: Number(product.price) || salePrice(product),
      unitPrice: salePrice(product),
      discountPercent: Number(product.discountPercent) || 0,
      source: "inventory",
    };
  } else {
    const customName = draft.customName.trim();
    const customPrice = Number(draft.customPrice) || 0;
    if (!customName || customPrice <= 0) {
      showToast("اختر منتجًا أو أضف بندًا يدويًا بسعر صحيح");
      return;
    }
    item = {
      id: createId("manual-item"),
      productId: "",
      name: customName,
      quantity,
      originalPrice: customPrice,
      unitPrice: customPrice,
      discountPercent: 0,
      source: "manual",
    };
  }

  draft.items.push(item);
  draft.pickerOpen = false;
  draft.selectedProductId = "";
  draft.selectedQuantity = 1;
  draft.customName = "";
  draft.customPrice = "";
  render();
  showToast("تمت إضافة المنتج");
}

function removeManualOrderItem(itemId) {
  const draft = ensureManualOrderDraft();
  draft.items = draft.items.filter((item) => item.id !== itemId);
  render();
}

function updateManualOrderQuantity(itemId, quantity) {
  const draft = ensureManualOrderDraft();
  const item = draft.items.find((entry) => entry.id === itemId);
  if (item) item.quantity = Math.max(1, Number(quantity) || 1);
  render();
}

function canLeaveManualStep(targetStep) {
  const draft = syncManualOrderFields();
  if (targetStep <= draft.step) return true;
  if (draft.items.length === 0) {
    showToast("أضف منتجًا واحدًا على الأقل");
    draft.step = 1;
    render();
    return false;
  }
  if (targetStep >= 3 && (!draft.customer.trim() || !draft.phone.trim())) {
    showToast("أكمل اسم العميل ورقم الجوال");
    draft.step = 2;
    render();
    return false;
  }
  return true;
}

function moveManualOrderStep(direction) {
  const draft = ensureManualOrderDraft();
  const nextStep = Math.max(1, Math.min(4, draft.step + direction));
  if (!canLeaveManualStep(nextStep)) return;
  draft.step = nextStep;
  render();
}

function setManualOrderStep(step) {
  const draft = ensureManualOrderDraft();
  const cleanStep = Math.max(1, Math.min(4, Number(step) || 1));
  if (!canLeaveManualStep(cleanStep)) return;
  draft.step = cleanStep;
  render();
}

function saveManualOrder() {
  const draft = syncManualOrderFields();
  if (draft.items.length === 0) {
    draft.step = 1;
    render();
    showToast("أضف منتجات للطلب");
    return;
  }
  if (!draft.customer.trim() || !draft.phone.trim()) {
    draft.step = 2;
    render();
    showToast("أكمل بيانات العميل");
    return;
  }

  const orders = loadOrders();
  const newOrder = {
    id: `NV-${Math.floor(10000 + Math.random() * 90000)}`,
    createdAt: new Date().toISOString(),
    customer: draft.customer.trim(),
    phone: draft.phone.trim(),
    email: draft.email.trim(),
    total: manualOrderSubtotal(),
    currency: draft.currency,
    status: "new",
    paymentStatus: draft.paymentStatus,
    shipping: shippingOptions[draft.shipping] || draft.shipping,
    warehouse: warehouseOptions[draft.warehouse] || draft.warehouse,
    platform: "لوحة التاجر",
    source: "طلب يدوي",
    note: draft.note.trim(),
    items: draft.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.unitPrice,
      total: manualLineTotal(item),
    })),
  };

  orders.unshift(newOrder);
  saveOrders(orders);
  state.manualOrder = null;
  state.orderStatus = "all";
  setActiveView("orders");
  showToast("تم إنشاء الطلب اليدوي");
}

function renderManualSteps(draft) {
  return `
    <div class="manual-steps" aria-label="خطوات إنشاء الطلب">
      ${manualOrderSteps
        .map(
          (step) => `
            <button class="${draft.step === step.id ? "active" : draft.step > step.id ? "done" : ""}" type="button" data-manual-step="${step.id}">
              <span>${step.id}</span>
              <strong>${escapeHtml(step.label)}</strong>
            </button>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderProductPicker(draft) {
  const products = loadProducts();
  return `
    <div class="manual-product-picker ${draft.pickerOpen ? "" : "is-hidden"}">
      <label>
        <span>منتجات المخزون</span>
        <select data-manual-product-source>
          <option value="">اختر منتج من المخزون</option>
          ${products
            .map(
              (product) => `
                <option value="${escapeHtml(product.id)}" ${draft.selectedProductId === product.id ? "selected" : ""}>
                  ${escapeHtml(product.name)} - ${formatMoney(salePrice(product))}
                </option>
              `,
            )
            .join("")}
        </select>
      </label>
      <label>
        <span>الكمية</span>
        <input data-manual-product-quantity type="number" min="1" value="${escapeHtml(draft.selectedQuantity)}" />
      </label>
      <label>
        <span>بند يدوي</span>
        <input data-manual-field="customName" value="${escapeHtml(draft.customName)}" placeholder="اسم المنتج" />
      </label>
      <label>
        <span>سعر البند</span>
        <input data-manual-field="customPrice" type="number" min="1" value="${escapeHtml(draft.customPrice)}" placeholder="0" />
      </label>
      <button class="primary-action" type="button" data-action="add-manual-product">إضافة</button>
    </div>
  `;
}

function renderManualProductsStep(draft) {
  const itemRows = draft.items
    .map(
      (item) => `
        <article class="manual-table-row">
          <span>${escapeHtml(item.name)}<small>${item.source === "inventory" ? "من المخزون" : "بند يدوي"}</small></span>
          <span><input data-manual-quantity="${escapeHtml(item.id)}" type="number" min="1" value="${escapeHtml(item.quantity)}" /></span>
          <span>${item.discountPercent ? `${escapeHtml(item.discountPercent)}%` : "-"}</span>
          <span>${formatMoney(item.unitPrice)}</span>
          <span>${formatMoney(manualLineTotal(item))}<small>${escapeHtml(draft.currency)}</small></span>
          <span>${manualOrderWeight().toFixed(2)} كجم</span>
          <button type="button" data-remove-manual-item="${escapeHtml(item.id)}" aria-label="حذف المنتج"><i data-lucide="trash-2" aria-hidden="true"></i></button>
        </article>
      `,
    )
    .join("");

  return `
    <section class="manual-panel">
      <div class="manual-panel-head">
        <div>
          <h2>إضافة منتجات</h2>
          <p>العملة</p>
        </div>
        <strong>${escapeHtml(currencyOptions[draft.currency])}</strong>
      </div>
      <div class="manual-field-grid">
        <label>
          <span>اختر المخزن</span>
          <select data-manual-field="warehouse">
            ${Object.entries(warehouseOptions).map(([key, label]) => `<option value="${key}" ${draft.warehouse === key ? "selected" : ""}>${label}</option>`).join("")}
          </select>
        </label>
        <label>
          <span>العملة</span>
          <select data-manual-field="currency">
            ${Object.entries(currencyOptions).map(([key, label]) => `<option value="${key}" ${draft.currency === key ? "selected" : ""}>${label}</option>`).join("")}
          </select>
        </label>
      </div>
      <div class="manual-table">
        <div class="manual-table-head">
          <span>المنتج</span>
          <span>الكمية</span>
          <span>خصم</span>
          <span>السعر الصافي</span>
          <span>الإجمالي<small>العملة</small></span>
          <span>الوزن</span>
          <span></span>
        </div>
        ${
          draft.items.length
            ? itemRows
            : `
              <div class="manual-empty">
                <div class="empty-illustration"><i data-lucide="package-plus" aria-hidden="true"></i></div>
                <h2>لم يتم إضافة منتج بعد.</h2>
                <p>اختر المنتجات لتضمينها في هذا الطلب اليدوي</p>
                <button class="primary-action" type="button" data-action="toggle-product-picker">اختر المنتجات</button>
              </div>
            `
        }
      </div>
      ${draft.items.length ? `<button class="ghost-action manual-add-more" type="button" data-action="toggle-product-picker">اختر المنتجات</button>` : ""}
      ${renderProductPicker(draft)}
    </section>
  `;
}

function renderManualCustomerStep(draft) {
  return `
    <section class="manual-panel">
      <div class="manual-panel-head">
        <div>
          <h2>معلومات العميل</h2>
          <p>بيانات الفاتورة والتواصل</p>
        </div>
      </div>
      <div class="manual-form-grid">
        <label>
          <span>اسم العميل</span>
          <input data-manual-field="customer" value="${escapeHtml(draft.customer)}" placeholder="اسم العميل" />
        </label>
        <label>
          <span>رقم الجوال</span>
          <input data-manual-field="phone" value="${escapeHtml(draft.phone)}" placeholder="05xxxxxxxx" />
        </label>
        <label>
          <span>البريد الإلكتروني</span>
          <input data-manual-field="email" type="email" value="${escapeHtml(draft.email)}" placeholder="customer@email.com" />
        </label>
        <label>
          <span>ملاحظة داخلية</span>
          <input data-manual-field="note" value="${escapeHtml(draft.note)}" placeholder="ملاحظة للطلب" />
        </label>
      </div>
    </section>
  `;
}

function renderManualShippingStep(draft) {
  return `
    <section class="manual-panel">
      <div class="manual-panel-head">
        <div>
          <h2>طريقة الشحن والدفع</h2>
          <p>خيارات تسليم الطلب اليدوي</p>
        </div>
      </div>
      <div class="manual-form-grid">
        <label>
          <span>طريقة التسليم</span>
          <select data-manual-field="shipping">
            ${Object.entries(shippingOptions).map(([key, label]) => `<option value="${key}" ${draft.shipping === key ? "selected" : ""}>${label}</option>`).join("")}
          </select>
        </label>
        <label>
          <span>حالة الدفع</span>
          <select data-manual-field="paymentStatus">
            ${Object.entries(paymentLabels).map(([key, label]) => `<option value="${key}" ${draft.paymentStatus === key ? "selected" : ""}>${label}</option>`).join("")}
          </select>
        </label>
      </div>
      <div class="manual-payment-strip">
        ${Object.entries(paymentLabels)
          .map(
            ([key, label]) => `
              <button class="${draft.paymentStatus === key ? "active" : ""}" type="button" data-payment-choice="${key}">
                <i data-lucide="${key === "paid" ? "badge-check" : key === "refunded" ? "undo-2" : "clock-3"}" aria-hidden="true"></i>
                <span>${escapeHtml(label)}</span>
              </button>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderManualSummaryStep(draft) {
  return `
    <section class="manual-panel manual-summary">
      <div class="manual-panel-head">
        <div>
          <h2>ملخص الطلب</h2>
          <p>${draft.items.length} منتج في الطلب</p>
        </div>
        <strong>${formatMoney(manualOrderSubtotal())}</strong>
      </div>
      <div class="summary-grid">
        <article>
          <span>العميل</span>
          <strong>${escapeHtml(draft.customer || "-")}</strong>
          <small>${escapeHtml(draft.phone || "-")}</small>
        </article>
        <article>
          <span>التسليم</span>
          <strong>${escapeHtml(shippingOptions[draft.shipping] || draft.shipping)}</strong>
          <small>${escapeHtml(warehouseOptions[draft.warehouse] || draft.warehouse)}</small>
        </article>
        <article>
          <span>الدفع</span>
          <strong>${escapeHtml(paymentLabels[draft.paymentStatus] || draft.paymentStatus)}</strong>
          <small>${escapeHtml(currencyOptions[draft.currency] || draft.currency)}</small>
        </article>
        <article>
          <span>الخصومات</span>
          <strong>${formatMoney(manualOrderDiscount())}</strong>
          <small>${manualOrderWeight().toFixed(2)} كجم</small>
        </article>
      </div>
      <div class="summary-items">
        ${draft.items.map((item) => `<div><span>${escapeHtml(item.name)} × ${item.quantity}</span><strong>${formatMoney(manualLineTotal(item))}</strong></div>`).join("")}
      </div>
    </section>
  `;
}

function renderManualOrderView() {
  const draft = ensureManualOrderDraft();
  const stepContent =
    draft.step === 1
      ? renderManualProductsStep(draft)
      : draft.step === 2
        ? renderManualCustomerStep(draft)
        : draft.step === 3
          ? renderManualShippingStep(draft)
          : renderManualSummaryStep(draft);

  adminView.innerHTML = `
    <section class="manual-order-page">
      <header class="manual-order-head">
        <button class="circle-action" type="button" data-action="back-orders" aria-label="العودة للطلبات">
          <i data-lucide="arrow-right" aria-hidden="true"></i>
        </button>
        <div>
          <h1>إنشاء طلب يدوي جديد</h1>
          <p>يمكنك إنشاء الطلبات وإضافتها دون تدخل العميل، مع مراجعة المنتجات والعميل قبل الحفظ.</p>
        </div>
      </header>
      ${renderManualSteps(draft)}
      ${stepContent}
      <footer class="manual-order-footer">
        <button class="ghost-action" type="button" data-action="manual-prev" ${draft.step === 1 ? "disabled" : ""}>السابق</button>
        ${
          draft.step === 4
            ? `<button class="primary-action" type="button" data-action="save-manual-order">إنشاء الطلب</button>`
            : `<button class="primary-action" type="button" data-action="manual-next">التالي</button>`
        }
      </footer>
    </section>
  `;
}

function renderOrdersView({ allOrders = false } = {}) {
  const counts = statusCounts();
  const orders = allOrders ? loadOrders() : filteredOrders();
  const statusTabs = Object.entries(orderStatuses)
    .map(
      ([key, label]) => `
        <button class="${state.orderStatus === key ? "active" : ""}" type="button" data-status="${key}">
          <span>${escapeHtml(label)}</span>
          <strong>${counts[key] || 0}</strong>
        </button>
      `,
    )
    .join("");

  adminView.innerHTML = `
    ${renderHeader(
      allOrders ? "كل الطلبات" : "قائمة الطلبات",
      allOrders ? "كل طلبات متجرك في مكان واحد" : "جميع طلبات متجرك هنا",
      `
        <button class="ghost-action" type="button" data-action="export-orders">تصدير الطلبات</button>
        <button class="primary-action" type="button" data-action="create-order">إنشاء</button>
        <button class="circle-action" type="button" data-action="more-orders" aria-label="خيارات الطلبات">
          <i data-lucide="more-vertical" aria-hidden="true"></i>
        </button>
      `,
    )}
    <section class="orders-board">
      <div class="order-status-tabs">${statusTabs}</div>
      <div class="table-tools">
        <button type="button" data-action="sort-orders"><i data-lucide="arrow-up-down" aria-hidden="true"></i></button>
        <button type="button" data-action="filter-orders"><i data-lucide="list-filter" aria-hidden="true"></i></button>
        <button type="button" data-action="columns-orders"><i data-lucide="columns-3" aria-hidden="true"></i></button>
        <label>
          <input type="search" value="${escapeHtml(state.search)}" placeholder="بحث" data-table-search />
          <i data-lucide="search" aria-hidden="true"></i>
        </label>
      </div>
      <div class="orders-table">
        <div class="orders-table-head">
          <span>رقم الطلب<small>المصدر</small></span>
          <span>العميل<small>الجوال</small></span>
          <span>الدفع</span>
          <span>الشحن</span>
          <span>حالة الدفع</span>
          <span>المجموع<small>العملة</small></span>
          <span>الحالة</span>
          <span>تاريخ الإنشاء<small>تاريخ التحديث</small></span>
        </div>
        ${
          orders.length
            ? orders
                .map(
                  (order) => `
                    <article class="orders-table-row">
                      <span>${escapeHtml(order.id)}<small>${escapeHtml(order.source)}</small></span>
                      <span>${escapeHtml(order.customer)}<small>${escapeHtml(order.phone)}</small></span>
                      <span>${escapeHtml(order.platform)}</span>
                      <span>${escapeHtml(order.shipping)}</span>
                      <span>${escapeHtml(paymentLabels[order.paymentStatus] || order.paymentStatus)}</span>
                      <span>${formatMoney(order.total)}<small>ريال</small></span>
                      <span><mark>${escapeHtml(orderStatuses[order.status] || order.status)}</mark></span>
                      <span>${new Date(order.createdAt).toLocaleDateString("ar-SA")}<small>${new Date(order.createdAt).toLocaleTimeString("ar-SA")}</small></span>
                    </article>
                  `,
                )
                .join("")
            : `
              <div class="orders-empty">
                <div class="empty-illustration"><i data-lucide="receipt-text" aria-hidden="true"></i></div>
                <h2>طلباتك ستظهر هنا</h2>
                <p>ألقِ نظرة سريعة على كل طلب من متجرك.</p>
                <div>
                  <button class="primary-action" type="button" data-action="create-order">إنشاء طلبك الأول الآن</button>
                  <button class="ghost-action" type="button" data-route="growth">كيف تحصل على أول 10 عملاء</button>
                </div>
              </div>
            `
        }
      </div>
    </section>
  `;
}

function renderDashboardView() {
  const stats = dashboardStats();
  adminView.innerHTML = `
    ${renderHeader("لوحة التحكم", "ملخص تشغيل المتجر", `<button class="primary-action" type="button" data-action="create-product">إضافة منتج</button>`)}
    <section class="dashboard-cards">
      <button type="button" data-route="orders"><span>الطلبات</span><strong>${stats.orders}</strong></button>
      <button type="button" data-route="products"><span>المنتجات</span><strong>${stats.products}</strong></button>
      <button type="button" data-route="customers"><span>العملاء</span><strong>${stats.customers}</strong></button>
      <button type="button" data-route="finance"><span>المبيعات</span><strong>${formatMoney(stats.revenue)}</strong></button>
    </section>
    <section class="dashboard-grid">
      <article class="merchant-card">
        <h2>مخزون المنتجات الرقمية</h2>
        <div class="mini-bars">
          <span style="--bar:${Math.min(stats.available * 9, 100)}%"><strong>${stats.available}</strong> متاح</span>
          <span style="--bar:${Math.min(stats.sold * 9, 100)}%"><strong>${stats.sold}</strong> مباع</span>
        </div>
      </article>
      <article class="merchant-card">
        <h2>إجراءات سريعة</h2>
        <div class="quick-grid">
          <button type="button" data-action="create-order">طلب يدوي</button>
          <button type="button" data-action="create-coupon">كوبون</button>
          <button type="button" data-route="analytics">التحليلات</button>
          <button type="button" data-route="payments">المدفوعات</button>
        </div>
      </article>
    </section>
  `;
}

function renderProductsView() {
  const normalized = state.search.trim().toLowerCase();
  const products = loadProducts().filter((product) => !normalized || [product.name, product.description, product.type].some((value) => String(value).toLowerCase().includes(normalized)));
  adminView.innerHTML = `
    ${renderHeader("المنتجات", "إدارة المنتجات الرقمية ومخزون الأكواد", `<button class="primary-action" type="button" data-action="create-product">إضافة منتج</button>`)}
    <section class="merchant-card">
      <div class="product-admin-list">
        ${
          products.length
            ? products
                .map((product) => {
                  const meta = typeMeta[product.type] || typeMeta.activation;
                  const active = product.active !== false;
                  return `
                    <article class="product-admin-row ${active ? "" : "is-paused"}">
                      <div class="admin-product-icon ${meta.visual}"><i data-lucide="${meta.icon}" aria-hidden="true"></i></div>
                      <div>
                        <span>${escapeHtml(meta.label)}</span>
                        <strong>${escapeHtml(product.name)}</strong>
                        <p>${escapeHtml(product.description || "")}</p>
                      </div>
                      <div class="admin-stock-row">
                        <span>${availableCount(product)} متاح</span>
                        <span>${soldCount(product)} مباع</span>
                        <span>${formatMoney(salePrice(product))}</span>
                        <span>${active ? "ظاهر" : "موقوف"}</span>
                      </div>
                      <div class="row-actions">
                        <button type="button" data-edit-product="${escapeHtml(product.id)}"><i data-lucide="pencil" aria-hidden="true"></i></button>
                        <button type="button" data-toggle-product="${escapeHtml(product.id)}"><i data-lucide="${active ? "eye-off" : "eye"}" aria-hidden="true"></i></button>
                        <button type="button" data-delete-product="${escapeHtml(product.id)}"><i data-lucide="trash-2" aria-hidden="true"></i></button>
                      </div>
                    </article>
                  `;
                })
                .join("")
            : `<div class="panel-empty"><i data-lucide="package-search" aria-hidden="true"></i><h2>لا توجد منتجات رقمية</h2><button class="primary-action" type="button" data-action="create-product">إضافة منتج</button></div>`
        }
      </div>
    </section>
  `;
}

function createProductSku() {
  return `Z.${Math.random().toString().slice(2, 17)}`;
}

function productEditorDraft(product = null, returnView = "products") {
  const items = product ? deliveryList(product) : [];
  const availableItems = items.filter((item) => !item.soldAt);
  return {
    id: product?.id || "",
    returnView,
    name: product?.name || "",
    nameEn: product?.nameEn || "",
    type: product?.type || "activation",
    price: Number(product?.price) || 0,
    costPrice: Number(product?.costPrice) || 0,
    discountPercent: Number(product?.discountPercent) || 0,
    rating: Number(product?.rating) || 4.7,
    description: product?.description || "",
    specsText: Array.isArray(product?.specs) ? product.specs.join(", ") : product?.specs || "",
    sku: product?.sku || createProductSku(),
    weight: product?.weight || "",
    weightUnit: product?.weightUnit || "kg",
    category: product?.category || "digital",
    template: product?.template || "default",
    warehouse: product?.warehouse || "default",
    stockQuantity: Number(product?.stockQuantity) || availableItems.length || 0,
    deliveryItemsText: availableItems.map((item) => item.value).join("\n"),
    active: product?.active !== false,
    requiresShipping: product?.requiresShipping !== false,
    taxFree: Boolean(product?.taxFree),
    discountEnabled: Boolean(product?.discountEnabled || product?.discountPercent),
    scheduledDiscount: Boolean(product?.scheduledDiscount),
    similarProducts: Boolean(product?.similarProducts),
    showRelated: Boolean(product?.showRelated),
    linkOnly: Boolean(product?.linkOnly),
    unlimitedStock: Boolean(product?.unlimitedStock),
    advancedOpen: false,
    optionsOpen: false,
    customizationOpen: false,
    seoOpen: false,
    customFieldsOpen: false,
  };
}

function ensureProductEditorDraft() {
  if (!state.productEditor) state.productEditor = productEditorDraft();
  return state.productEditor;
}

function startProductEditor(productId = "") {
  const product = loadProducts().find((item) => item.id === productId) || null;
  const returnView = state.view === "createOrder" ? "createOrder" : "products";
  state.productEditor = productEditorDraft(product, returnView);
  setActiveView("productEditor");
}

function productEditorTypeMeta(draft = ensureProductEditorDraft()) {
  return typeMeta[draft.type] || typeMeta.activation;
}

function syncProductEditorFields() {
  const draft = ensureProductEditorDraft();
  adminView.querySelectorAll("[data-product-field]").forEach((field) => {
    draft[field.dataset.productField] = field.value;
  });
  adminView.querySelectorAll("[data-product-toggle]").forEach((field) => {
    draft[field.dataset.productToggle] = field.checked;
  });
  return draft;
}

function productEditorNetPrice(draft = ensureProductEditorDraft()) {
  const price = Number(draft.price) || 0;
  const discount = draft.discountEnabled ? Number(draft.discountPercent) || 0 : 0;
  return Math.max(0, Math.round(price * (1 - discount / 100)));
}

function productEditorCodesCount(draft = ensureProductEditorDraft()) {
  return String(draft.deliveryItemsText || "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean).length;
}

function toggleProductSection(section) {
  const draft = syncProductEditorFields();
  const key = `${section}Open`;
  if (key in draft) {
    draft[key] = !draft[key];
    render();
  }
}

function renderProductEditorField({ label, field, value, type = "text", placeholder = "", hint = "", extra = "", dir = "rtl" }) {
  return `
    <label class="product-field">
      <span>${escapeHtml(label)}</span>
      <input data-product-field="${escapeHtml(field)}" type="${escapeHtml(type)}" value="${escapeHtml(value)}" placeholder="${escapeHtml(placeholder)}" dir="${escapeHtml(dir)}" />
      ${hint ? `<small>${escapeHtml(hint)}</small>` : ""}
      ${extra}
    </label>
  `;
}

function renderProductEditorSelect({ label, field, value, options }) {
  return `
    <label class="product-field">
      <span>${escapeHtml(label)}</span>
      <select data-product-field="${escapeHtml(field)}">
        ${Object.entries(options).map(([key, text]) => `<option value="${escapeHtml(key)}" ${value === key ? "selected" : ""}>${escapeHtml(text)}</option>`).join("")}
      </select>
    </label>
  `;
}

function renderProductPreview(draft) {
  const meta = productEditorTypeMeta(draft);
  const title = draft.name.trim() || "اسم المنتج";
  const price = productEditorNetPrice(draft);
  const label = meta.label || "ممتع";
  return `
    <aside class="product-editor-aside">
      <section class="product-preview-card">
        <h2>معاينة المنتج</h2>
        <div class="preview-phone">
          <div class="preview-image ${escapeHtml(meta.visual)}">
            <i data-lucide="${escapeHtml(meta.icon)}" aria-hidden="true"></i>
          </div>
          <div class="preview-skeleton"></div>
          <div class="preview-skeleton short"></div>
          <strong>${escapeHtml(title)}</strong>
          <div class="preview-price">
            <span>${formatMoney(price)}</span>
            ${draft.discountEnabled && Number(draft.discountPercent) ? `<small>${escapeHtml(draft.discountPercent)}% خصم</small>` : ""}
          </div>
          <span class="preview-badge">${escapeHtml(label)}</span>
          <div class="preview-buttons">
            <button type="button">أضف للسلة</button>
            <button type="button">اشتر الآن</button>
          </div>
        </div>
        ${renderProductEditorSelect({ label: "قالب التصميم", field: "template", value: draft.template, options: productTemplateOptions })}
        <label class="product-field">
          <span>ملصق المنتج</span>
          <select data-product-field="type">
            ${Object.entries(typeMeta).map(([key, item]) => `<option value="${key}" ${draft.type === key ? "selected" : ""}>${escapeHtml(item.label)}</option>`).join("")}
          </select>
        </label>
      </section>

      <section class="product-side-card">
        <h2>إظهار المنتج</h2>
        <p>حدد أماكن ظهور المنتج وروابط المتجر.</p>
        <label class="editor-switch"><input type="checkbox" data-product-toggle="active" ${draft.active ? "checked" : ""} /><span>المتجر الإلكتروني</span></label>
        <div class="side-actions">
          <button type="button" data-action="copy-product-link"><i data-lucide="copy" aria-hidden="true"></i> نسخ الرابط</button>
          <button type="button" data-action="editor-preview"><i data-lucide="external-link" aria-hidden="true"></i> معاينة المنتج</button>
        </div>
        <label class="editor-check"><input type="checkbox" data-product-toggle="linkOnly" ${draft.linkOnly ? "checked" : ""} /><span>تقييد ظهور المنتج عن طريق الرابط فقط</span></label>
      </section>

      <section class="product-side-card">
        <h2>تفاصيل إضافية</h2>
        <label class="editor-switch"><input type="checkbox" data-product-toggle="requiresShipping" ${draft.requiresShipping ? "checked" : ""} /><span>المنتج يتطلب الشحن</span></label>
        <label class="editor-switch"><input type="checkbox" data-product-toggle="taxFree" ${draft.taxFree ? "checked" : ""} /><span>المنتج معفى من الضريبة</span></label>
        <label class="editor-switch"><input type="checkbox" data-product-toggle="discountEnabled" ${draft.discountEnabled ? "checked" : ""} /><span>تفعيل الخصم</span></label>
        <label class="editor-switch"><input type="checkbox" data-product-toggle="scheduledDiscount" ${draft.scheduledDiscount ? "checked" : ""} /><span>جدولة الخصم</span></label>
        <label class="editor-switch"><input type="checkbox" data-product-toggle="similarProducts" ${draft.similarProducts ? "checked" : ""} /><span>تخصيص المنتجات المشابهة</span></label>
        <label class="editor-switch"><input type="checkbox" data-product-toggle="showRelated" ${draft.showRelated ? "checked" : ""} /><span>عرض المنتجات المشابهة في أسفل الصفحة</span></label>
        <button class="product-linked-card" type="button" data-action="manage-related-products">
          <i data-lucide="info" aria-hidden="true"></i>
          <span>يمكنك إدارة إعدادات المنتجات المشابهة من خلال <strong>خصائص المنتج</strong></span>
        </button>
      </section>
    </aside>
  `;
}

function renderEditorUploadBox() {
  return `
    <div class="product-upload-box">
      <i data-lucide="image-plus" aria-hidden="true"></i>
      <strong><button type="button" data-action="fake-upload">استعرض</button>، أو اسحب الصور وأفلتها هنا</strong>
      <span>GIF, JPG, JPEG, PNG أو WebP - الحد الأقصى 5MB</span>
      <button type="button" data-action="fake-upload">أو أضف رابط يوتيوب</button>
    </div>
  `;
}

function renderProductInventory(draft) {
  return `
    <section class="product-editor-card">
      <div class="product-card-title">
        <h2>الكميات والمخزون</h2>
      </div>
      <div class="inventory-hint">
        <i data-lucide="info" aria-hidden="true"></i>
        <span>يمكن تعديل وإضافة المخازن من خلال عناوين المخزون</span>
      </div>
      <div class="product-form-grid two">
        ${renderProductEditorSelect({ label: "المخزون", field: "warehouse", value: draft.warehouse, options: { default: "Default - الافتراضي", digital: "مخزن الأكواد الرقمية", subscriptions: "اشتراكات وحسابات" } })}
        ${renderProductEditorField({ label: "الكمية", field: "stockQuantity", value: draft.stockQuantity, type: "number", placeholder: "0", dir: "ltr" })}
      </div>
      <div class="inventory-actions">
        <label class="editor-check"><input type="checkbox" data-product-toggle="unlimitedStock" ${draft.unlimitedStock ? "checked" : ""} /><span>غير محدود</span></label>
        <button class="small-product-action" type="button" data-action="add-inventory-row">إضافة</button>
      </div>
      <label class="product-field full">
        <span>أكواد التسليم / بيانات الحسابات</span>
        <textarea data-product-field="deliveryItemsText" placeholder="CODE-AAAA-BBBB-CCCC">${escapeHtml(draft.deliveryItemsText)}</textarea>
        <small>${productEditorCodesCount(draft)} عنصر جاهز للبيع في واجهة العميل</small>
      </label>
    </section>
  `;
}

function renderProductAccordion(draft, section, description, content = "") {
  const key = `${section}Open`;
  return `
    <section class="product-accordion ${draft[key] ? "open" : ""}">
      <button type="button" data-product-section="${escapeHtml(section)}">
        <i data-lucide="chevron-down" aria-hidden="true"></i>
        <span>
          <strong>${escapeHtml(productSectionLabels[section])}</strong>
          <small>${escapeHtml(description)}</small>
        </span>
      </button>
      <div class="product-accordion-body">
        ${content}
      </div>
    </section>
  `;
}

function renderProductEditorView() {
  const draft = ensureProductEditorDraft();
  const meta = productEditorTypeMeta(draft);
  const draftTitle = draft.name.trim() || "منتج غير مسمى";
  adminView.innerHTML = `
    <section class="product-editor-page">
      <header class="product-editor-head">
        <div class="product-editor-title">
          <button class="circle-action" type="button" data-action="back-products" aria-label="العودة للمنتجات">
            <i data-lucide="arrow-right" aria-hidden="true"></i>
          </button>
          <div>
            <h1>منتج فردي</h1>
            <p>يمكنك تعديل بيانات المنتج، المخزون، الظهور، والتسليم من صفحة واحدة.</p>
          </div>
        </div>
        <div class="product-editor-actions">
          <span class="editor-name-chip">${escapeHtml(draftTitle)}</span>
          <button class="save-product-button" type="button" data-action="save-product-editor">حفظ المنتج</button>
          <button class="delete-product-button" type="button" data-action="delete-current-product" ${draft.id ? "" : "disabled"}>حذف</button>
        </div>
      </header>

      <div class="product-editor-layout">
        <main class="product-editor-main">
          <section class="product-editor-card">
            <div class="product-card-title">
              <h2>المعلومات الأساسية</h2>
            </div>
            <div class="product-basic-tabs" aria-label="تبويبات المنتج">
              <button class="active" type="button">الأساسية</button>
            </div>
            <div class="product-media-head">
              <h3>صور المنتج</h3>
              <button type="button" data-action="sort-product-media">
                <i data-lucide="grip" aria-hidden="true"></i>
                ترتيب
              </button>
            </div>
            ${renderEditorUploadBox()}
            <div class="product-form-grid two">
              ${renderProductEditorField({ label: "المنتج (العربية)", field: "name", value: draft.name, placeholder: "أدخل الاسم" })}
              ${renderProductEditorField({ label: "المنتج (الإنجليزية)", field: "nameEn", value: draft.nameEn, placeholder: "Enter name", dir: "ltr" })}
              ${renderProductEditorField({ label: "سعر البيع", field: "price", value: draft.price, type: "number", dir: "ltr" })}
              ${renderProductEditorField({ label: "سعر التكلفة", field: "costPrice", value: draft.costPrice, type: "number", hint: "للحصول على بيانات أرباح دقيقة، لا يتم عرضه للعميل في المتجر.", dir: "ltr" })}
              ${renderProductEditorField({ label: "رمز المنتج SKU", field: "sku", value: draft.sku, dir: "ltr" })}
              <label class="product-field">
                <span>وزن المنتج</span>
                <div class="weight-control">
                  <input data-product-field="weight" type="number" min="0" value="${escapeHtml(draft.weight)}" placeholder="اكتب الوزن هنا" />
                  <select data-product-field="weightUnit">
                    <option value="kg" ${draft.weightUnit === "kg" ? "selected" : ""}>كيلوجرام</option>
                    <option value="g" ${draft.weightUnit === "g" ? "selected" : ""}>جرام</option>
                  </select>
                </div>
              </label>
              <label class="product-field full">
                <span>التصنيفات</span>
                <select data-product-field="category">
                  ${Object.entries(productCategoryOptions).map(([key, text]) => `<option value="${escapeHtml(key)}" ${draft.category === key ? "selected" : ""}>${escapeHtml(text)}</option>`).join("")}
                </select>
              </label>
            </div>
          </section>

          ${renderProductInventory(draft)}

          ${renderProductAccordion(
            draft,
            "advanced",
            "إضافة معلومات إضافية للمنتج، مثل وصف قصير أو تفصيلي، وإعدادات الضريبة والوزن.",
            `
              <label class="product-field full">
                <span>وصف المنتج</span>
                <textarea data-product-field="description" placeholder="اكتب وصفًا واضحًا للعميل">${escapeHtml(draft.description)}</textarea>
              </label>
              ${renderProductEditorField({ label: "وسوم المنتج", field: "specsText", value: draft.specsText, placeholder: "رسمي, فوري, ضمان" })}
              ${renderProductEditorField({ label: "التقييم", field: "rating", value: draft.rating, type: "number", dir: "ltr" })}
            `,
          )}
          ${renderProductAccordion(
            draft,
            "options",
            "تحكم في الخيارات الفرعية للمنتج مثل الحجم، اللون، والخصائص الأخرى المخصصة.",
            `<div class="option-tags"><span>${escapeHtml(meta.label)}</span><span>${escapeHtml(productCategoryOptions[draft.category] || "الرقميات")}</span><span>${draft.active ? "ظاهر" : "مخفي"}</span></div>`,
          )}
          ${renderProductAccordion(
            draft,
            "customization",
            "يمكنك توفير خيار تخصيص الطلب للعميل بإضافة حقول في صفحة المنتج لطلب معلومات إضافية.",
            `<label class="product-field full"><span>سؤال مخصص للعميل</span><input data-product-field="customQuestion" value="${escapeHtml(draft.customQuestion || "")}" placeholder="مثال: اكتب البريد المرتبط بالحساب" /></label>`,
          )}
          ${renderProductAccordion(
            draft,
            "seo",
            "يساعد هذا منتجاتك على الوصول إلى المزيد من العملاء عبر محركات البحث المختلفة والذكاء الاصطناعي.",
            `<label class="product-field full"><span>عنوان SEO</span><input data-product-field="seoTitle" value="${escapeHtml(draft.seoTitle || draft.name)}" placeholder="عنوان يظهر في نتائج البحث" /></label>`,
          )}
          ${renderProductAccordion(
            draft,
            "customFields",
            "أضف حقول مخصصة للمنتج حسب الحاجة، مثل تاريخ الإنتاج، وشرح طريقة الاستخدام، وغيرها.",
            `<label class="product-field full"><span>حقل مخصص</span><input data-product-field="customField" value="${escapeHtml(draft.customField || "")}" placeholder="مثال: مدة الاشتراك 12 شهر" /></label>`,
          )}
        </main>

        ${renderProductPreview(draft)}
      </div>
    </section>
  `;
}

function deleteCurrentProductEditor() {
  const draft = ensureProductEditorDraft();
  if (!draft.id) {
    showToast("احفظ المنتج أولًا قبل الحذف");
    return;
  }
  const products = loadProducts();
  const product = products.find((item) => item.id === draft.id);
  if (!product) {
    state.productEditor = null;
    setActiveView("products");
    return;
  }
  openProductDeleteModal(product, "editor");
}

function openProductDeleteModal(product, returnView = "products") {
  openModal(`
    <form class="modal-form" id="productDeleteForm" data-product-id="${escapeHtml(product.id)}" data-return-view="${escapeHtml(returnView)}">
      <h2>حذف المنتج</h2>
      <p>سيتم حذف "${escapeHtml(product.name)}" من قائمة المنتجات ومخزون الأكواد. هذا الإجراء لا يؤثر على الطلبات السابقة.</p>
      <div class="modal-button-row">
        <button class="ghost-action" type="button" data-action="close-modal">إلغاء</button>
        <button class="delete-product-button" type="submit">حذف</button>
      </div>
    </form>
  `);
}

function removeProductById(productId, returnView = "products") {
  const products = loadProducts();
  const product = products.find((item) => item.id === productId);
  if (!product) {
    closeModal();
    return;
  }
  saveProducts(products.filter((item) => item.id !== product.id));
  if (state.productEditor?.id === product.id) state.productEditor = null;
  closeModal();
  setActiveView(returnView === "editor" ? "products" : returnView);
  showToast("تم حذف المنتج");
}

function saveProductEditor() {
  const draft = syncProductEditorFields();
  const products = loadProducts();
  const existing = products.find((item) => item.id === draft.id);
  const soldItems = existing ? deliveryList(existing).filter((item) => item.soldAt) : [];
  const meta = productEditorTypeMeta(draft);
  const product = {
    id: existing?.id || createId("product"),
    name: draft.name.trim(),
    nameEn: draft.nameEn.trim(),
    type: draft.type,
    category: draft.category || "digital",
    price: Number(draft.price) || 0,
    costPrice: Number(draft.costPrice) || 0,
    discountPercent: draft.discountEnabled ? Number(draft.discountPercent) || 0 : 0,
    rating: Number(draft.rating) || 4.7,
    description: draft.description.trim() || "منتج رقمي بتسليم فوري بعد تأكيد الطلب.",
    specs: parseSpecs(draft.specsText || ""),
    active: draft.active,
    requiresShipping: draft.requiresShipping,
    taxFree: draft.taxFree,
    discountEnabled: draft.discountEnabled,
    scheduledDiscount: draft.scheduledDiscount,
    similarProducts: draft.similarProducts,
    showRelated: draft.showRelated,
    linkOnly: draft.linkOnly,
    unlimitedStock: draft.unlimitedStock,
    sku: draft.sku || createProductSku(),
    weight: draft.weight,
    weightUnit: draft.weightUnit,
    template: draft.template,
    warehouse: draft.warehouse,
    stockQuantity: Number(draft.stockQuantity) || productEditorCodesCount(draft),
    customQuestion: draft.customQuestion || "",
    seoTitle: draft.seoTitle || "",
    customField: draft.customField || "",
    icon: meta.icon,
    visual: meta.visual,
    deliveryItems: parseDeliveryItems(draft.deliveryItemsText || "", soldItems),
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (!product.name || product.price <= 0) {
    showToast("أكمل اسم المنتج وسعر البيع");
    return;
  }

  if (existing) {
    products[products.findIndex((item) => item.id === existing.id)] = product;
  } else {
    products.unshift(product);
  }
  saveProducts(products);
  const returnView = draft.returnView;
  state.productEditor = null;
  if (returnView === "createOrder") {
    ensureManualOrderDraft().pickerOpen = true;
    setActiveView("createOrder");
  } else {
    setActiveView("products");
  }
  showToast("تم حفظ المنتج");
}

function renderCustomersView() {
  const customers = loadCustomers().filter((customer) => !state.search || [customer.name, customer.phone].some((value) => String(value).toLowerCase().includes(state.search.toLowerCase())));
  adminView.innerHTML = `
    ${renderHeader("العملاء", "ملف العملاء وقيمة مشترياتهم", `<button class="primary-action" type="button" data-action="create-customer">إضافة عميل</button>`)}
    <section class="merchant-card list-card">
      ${customers.length ? customers.map((customer) => `<article><strong>${escapeHtml(customer.name)}</strong><span>${escapeHtml(customer.phone)}</span><span>${customer.orders} طلب</span><span>${formatMoney(customer.spent)}</span></article>`).join("") : `<div class="panel-empty"><i data-lucide="users-round" aria-hidden="true"></i><h2>لا توجد بيانات عملاء</h2></div>`}
    </section>
  `;
}

function renderMarketingView() {
  const coupons = readArray(merchantCouponsKey);
  adminView.innerHTML = `
    ${renderHeader("التسويق", "الكوبونات والحملات", `<button class="primary-action" type="button" data-action="create-coupon">إضافة كوبون</button>`)}
    <section class="dashboard-grid">
      <article class="merchant-card"><h2>الكوبونات</h2>${coupons.length ? coupons.map((coupon) => `<div class="coupon-row"><strong>${escapeHtml(coupon.code)}</strong><span>${coupon.discount}%</span><button data-delete-coupon="${escapeHtml(coupon.id)}">حذف</button></div>`).join("") : `<div class="panel-empty"><i data-lucide="badge-percent" aria-hidden="true"></i><h2>لا توجد كوبونات</h2></div>`}</article>
      <article class="merchant-card"><h2>حملات جاهزة</h2><div class="task-list"><button data-action="create-coupon">خصم أول طلب</button><button data-route="customers">استهداف العملاء</button><button data-route="whatsapp">رسالة واتساب</button></div></article>
    </section>
  `;
}

function renderWhatsAppView() {
  const templates = readArray(merchantTemplatesKey);
  adminView.innerHTML = `
    ${renderHeader("الواتساب", "قوالب رسائل الطلبات", `<button class="primary-action" type="button" data-action="create-template">قالب جديد</button>`)}
    <section class="merchant-card list-card">
      ${templates.length ? templates.map((template) => `<article><strong>${escapeHtml(template.title)}</strong><span>${escapeHtml(template.body)}</span><button data-delete-template="${escapeHtml(template.id)}">حذف</button></article>`).join("") : `<div class="panel-empty"><i data-lucide="message-circle" aria-hidden="true"></i><h2>لا توجد قوالب</h2></div>`}
    </section>
  `;
}

function renderStorefrontView() {
  const current = settings();
  adminView.innerHTML = `
    ${renderHeader("المتجر الإلكتروني", "إعدادات واجهة المتجر", `<a class="ghost-action" href="./index.html">فتح المتجر</a>`)}
    <form class="merchant-card settings-form" id="storeSettingsForm">
      <label><span>اسم المتجر</span><input name="storeName" value="${escapeHtml(current.storeName)}" /></label>
      <label><span>رقم الدعم</span><input name="supportPhone" value="${escapeHtml(current.supportPhone)}" /></label>
      <label><span>طريقة الشحن الافتراضية</span><input name="defaultShipping" value="${escapeHtml(current.defaultShipping)}" /></label>
      <button class="primary-action" type="submit">حفظ الإعدادات</button>
    </form>
  `;
}

function renderAnalyticsView() {
  const stats = dashboardStats();
  adminView.innerHTML = `
    ${renderHeader("التحليلات", "مؤشرات الطلبات والمبيعات")}
    <section class="dashboard-grid">
      <article class="merchant-card"><h2>الأداء</h2><div class="mini-bars"><span style="--bar:${Math.min(stats.orders * 12, 100)}%"><strong>${stats.orders}</strong> طلب</span><span style="--bar:${Math.min(stats.customers * 12, 100)}%"><strong>${stats.customers}</strong> عميل</span><span style="--bar:${Math.min(stats.revenue / 20, 100)}%"><strong>${formatMoney(stats.revenue)}</strong> مبيعات</span></div></article>
      <article class="merchant-card"><h2>حالة الطلبات</h2>${Object.entries(statusCounts()).filter(([key]) => key !== "all").map(([key, value]) => `<div class="status-line"><span>${orderStatuses[key]}</span><strong>${value}</strong></div>`).join("")}</article>
    </section>
  `;
}

function renderFinanceView() {
  const stats = dashboardStats();
  adminView.innerHTML = `
    ${renderHeader("المالية", "المبيعات والمدفوعات", `<button class="ghost-action" type="button" data-action="export-orders">تصدير</button>`)}
    <section class="dashboard-cards">
      <button type="button"><span>إجمالي المبيعات</span><strong>${formatMoney(stats.revenue)}</strong></button>
      <button type="button"><span>مدفوع</span><strong>${loadOrders().filter((order) => order.paymentStatus === "paid").length}</strong></button>
      <button type="button"><span>بانتظار الدفع</span><strong>${loadOrders().filter((order) => order.paymentStatus === "pending").length}</strong></button>
      <button type="button"><span>مسترجع</span><strong>${loadOrders().filter((order) => order.paymentStatus === "refunded").length}</strong></button>
    </section>
  `;
}

function renderTogglesView(title, subtitle, key, defaults) {
  const current = { ...defaults, ...readObject(key, {}) };
  adminView.innerHTML = `
    ${renderHeader(title, subtitle)}
    <section class="merchant-card toggle-grid">
      ${Object.entries(current)
        .map(([settingKey, value]) => `<label><span>${escapeHtml(settingKey)}</span><input type="checkbox" data-toggle-setting="${escapeHtml(settingKey)}" data-toggle-key="${escapeHtml(key)}" ${value ? "checked" : ""} /></label>`)
        .join("")}
    </section>
  `;
}

function renderGrowthView() {
  const tasks = readObject("novaMerchantGrowth", { "إطلاق كوبون ترحيبي": false, "إضافة أول منتج رقمي": false, "تفعيل واتساب": false, "مراجعة صفحة الدفع": false });
  adminView.innerHTML = `
    ${renderHeader("النمو", "مهام رفع جاهزية المتجر")}
    <section class="merchant-card task-list">
      ${Object.entries(tasks).map(([task, done]) => `<label><input type="checkbox" data-growth-task="${escapeHtml(task)}" ${done ? "checked" : ""} /><span>${escapeHtml(task)}</span></label>`).join("")}
    </section>
  `;
}

function renderChannelsView() {
  adminView.innerHTML = `
    ${renderHeader("القنوات", "روابط البيع والتكاملات")}
    <section class="dashboard-grid">
      <article class="merchant-card"><h2>المتجر</h2><p>http://127.0.0.1:8787/</p><button class="primary-action" type="button" data-action="copy-store-link">نسخ الرابط</button></article>
      <article class="merchant-card"><h2>لوحة التاجر</h2><p>http://127.0.0.1:8787/admin.html</p><button class="ghost-action" type="button" data-route="storefront">الإعدادات</button></article>
    </section>
  `;
}

function renderAbandonedView() {
  const count = Number(localStorage.getItem("novaAbandonedCarts") || "0");
  adminView.innerHTML = `
    ${renderHeader("السلات المتروكة", "متابعة العملاء قبل إتمام الطلب")}
    <section class="merchant-card panel-empty"><i data-lucide="shopping-bag" aria-hidden="true"></i><h2>${count ? `${count} سلة` : "لا توجد سلات متروكة"}</h2><button class="primary-action" type="button" data-action="simulate-cart">تسجيل سلة متروكة</button></section>
  `;
}

function renderView() {
  if (state.view === "dashboard") renderDashboardView();
  if (state.view === "orders") renderOrdersView();
  if (state.view === "createOrder") renderManualOrderView();
  if (state.view === "manualOrders") renderOrdersView({ allOrders: true });
  if (state.view === "abandoned") renderAbandonedView();
  if (state.view === "products") renderProductsView();
  if (state.view === "productEditor") renderProductEditorView();
  if (state.view === "customers") renderCustomersView();
  if (state.view === "marketing") renderMarketingView();
  if (state.view === "whatsapp") renderWhatsAppView();
  if (state.view === "storefront") renderStorefrontView();
  if (state.view === "analytics") renderAnalyticsView();
  if (state.view === "finance") renderFinanceView();
  if (state.view === "logistics") renderTogglesView("اللوجستيات", "خيارات الشحن والتسليم", "novaMerchantLogistics", { "تسليم رقمي": true, "شحن محلي": false, "استلام من المتجر": false });
  if (state.view === "payments") renderTogglesView("المدفوعات", "طرق الدفع المتاحة", merchantSettingsKey, { cod: true, card: true, applePay: false });
  if (state.view === "funding") renderTogglesView("التمويل", "خيارات تمويل المتجر", "novaMerchantFunding", { "تمويل مخزون": false, "سلفة مبيعات": false, "تقسيط للتجار": false });
  if (state.view === "growth") renderGrowthView();
  if (state.view === "channels") renderChannelsView();
}

function render() {
  updateTopCounts();
  renderView();
  window.lucide?.createIcons();
}

function parseSpecs(value) {
  return value.split(",").map((item) => item.trim()).filter(Boolean).slice(0, 4);
}

function parseDeliveryItems(value, soldItems = []) {
  const soldValues = new Set(soldItems.map((item) => item.value));
  const available = value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item, index, list) => list.indexOf(item) === index)
    .filter((item) => !soldValues.has(item))
    .map((item) => ({ id: createId("code"), value: item, soldAt: "", orderId: "", createdAt: new Date().toISOString() }));
  return [...soldItems, ...available];
}

function productFormHtml(product = null) {
  const items = product ? deliveryList(product) : [];
  const soldItems = items.filter((item) => item.soldAt);
  const availableItems = items.filter((item) => !item.soldAt);
  return `
    <form class="modal-form" id="merchantProductForm">
      <h2 id="modalTitle">${product ? "تعديل منتج رقمي" : "إضافة منتج رقمي"}</h2>
      <input name="id" type="hidden" value="${escapeHtml(product?.id || "")}" />
      <label><span>اسم المنتج</span><input name="name" value="${escapeHtml(product?.name || "")}" placeholder="كود تفعيل Windows Pro" required /></label>
      <div class="form-pair">
        <label><span>نوع التسليم</span><select name="type">${Object.entries(typeMeta).map(([key, meta]) => `<option value="${key}" ${product?.type === key ? "selected" : ""}>${meta.label}</option>`).join("")}</select></label>
        <label><span>السعر</span><input name="price" type="number" min="1" value="${escapeHtml(product?.price || "")}" placeholder="49" required /></label>
      </div>
      <div class="form-pair">
        <label><span>خصم</span><input name="discountPercent" type="number" min="0" max="90" value="${escapeHtml(product?.discountPercent || 0)}" /></label>
        <label><span>التقييم</span><input name="rating" type="number" min="1" max="5" step="0.1" value="${escapeHtml(product?.rating || 4.7)}" /></label>
      </div>
      <label><span>وصف مختصر</span><textarea name="description" required>${escapeHtml(product?.description || "")}</textarea></label>
      <label><span>وسوم المنتج</span><input name="specs" value="${escapeHtml((product?.specs || []).join(", "))}" placeholder="رسمي, فوري, ضمان" /></label>
      <label><span>مخزون الأكواد / بيانات التسليم</span><textarea name="deliveryItems" rows="8" placeholder="CODE-AAAA-BBBB-CCCC">${escapeHtml(availableItems.map((item) => item.value).join("\n"))}</textarea></label>
      <label class="admin-toggle"><input name="active" type="checkbox" ${product?.active === false ? "" : "checked"} /><span>ظاهر في واجهة العميل</span></label>
      <button class="primary-action" type="submit">حفظ المنتج</button>
      <p>${soldItems.length ? `${soldItems.length} عنصر مباع محفوظ في السجل` : ""}</p>
    </form>
  `;
}

function openProductModal(productId = "") {
  const product = loadProducts().find((item) => item.id === productId) || null;
  openModal(productFormHtml(product));
}

function saveProductFromForm(form) {
  const data = new FormData(form);
  const products = loadProducts();
  const existing = products.find((item) => item.id === data.get("id"));
  const returnToManualOrder = state.view === "createOrder";
  const soldItems = existing ? deliveryList(existing).filter((item) => item.soldAt) : [];
  const meta = typeMeta[data.get("type")] || typeMeta.activation;
  const product = {
    id: existing?.id || createId("product"),
    name: data.get("name").trim(),
    type: data.get("type"),
    category: "digital",
    price: Number(data.get("price")) || 0,
    discountPercent: Number(data.get("discountPercent")) || 0,
    rating: Number(data.get("rating")) || 4.7,
    description: data.get("description").trim(),
    specs: parseSpecs(data.get("specs") || ""),
    active: data.get("active") === "on",
    icon: meta.icon,
    visual: meta.visual,
    deliveryItems: parseDeliveryItems(data.get("deliveryItems") || "", soldItems),
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (!product.name || !product.description || product.price <= 0) {
    showToast("أكمل بيانات المنتج");
    return;
  }

  if (existing) {
    products[products.findIndex((item) => item.id === existing.id)] = product;
  } else {
    products.unshift(product);
  }
  saveProducts(products);
  closeModal();
  if (returnToManualOrder) {
    ensureManualOrderDraft().pickerOpen = true;
    setActiveView("createOrder");
  } else {
    setActiveView("products");
  }
  showToast("تم حفظ المنتج");
}

function orderFormHtml() {
  return `
    <form class="modal-form" id="merchantOrderForm">
      <h2 id="modalTitle">إنشاء طلب</h2>
      <label><span>اسم العميل</span><input name="customer" required /></label>
      <label><span>الجوال</span><input name="phone" placeholder="05xxxxxxxx" required /></label>
      <div class="form-pair">
        <label><span>المجموع</span><input name="total" type="number" min="0" value="0" /></label>
        <label><span>الحالة</span><select name="status">${Object.entries(orderStatuses).filter(([key]) => key !== "all").map(([key, label]) => `<option value="${key}">${label}</option>`).join("")}</select></label>
      </div>
      <label><span>المنتجات</span><input name="items" placeholder="كود تفعيل × 1" /></label>
      <button class="primary-action" type="submit">حفظ الطلب</button>
    </form>
  `;
}

function saveOrderFromForm(form) {
  const data = new FormData(form);
  const orders = loadOrders();
  orders.unshift({
    id: `NV-${Math.floor(10000 + Math.random() * 90000)}`,
    createdAt: new Date().toISOString(),
    customer: data.get("customer").trim(),
    phone: data.get("phone").trim(),
    total: Number(data.get("total")) || 0,
    status: data.get("status"),
    paymentStatus: "pending",
    shipping: settings().defaultShipping,
    platform: "لوحة التاجر",
    source: "لوحة التحكم",
    items: [{ name: data.get("items") || "طلب يدوي", quantity: 1 }],
  });
  saveOrders(orders);
  closeModal();
  setActiveView("orders");
  showToast("تم إنشاء الطلب");
}

function couponFormHtml() {
  return `
    <form class="modal-form" id="couponForm">
      <h2 id="modalTitle">كوبون خصم</h2>
      <label><span>الكود</span><input name="code" value="WELCOME10" required /></label>
      <label><span>نسبة الخصم</span><input name="discount" type="number" min="1" max="90" value="10" required /></label>
      <button class="primary-action" type="submit">حفظ الكوبون</button>
    </form>
  `;
}

function templateFormHtml() {
  return `
    <form class="modal-form" id="templateForm">
      <h2 id="modalTitle">قالب واتساب</h2>
      <label><span>العنوان</span><input name="title" value="تأكيد الطلب" required /></label>
      <label><span>النص</span><textarea name="body" required>تم استلام طلبك وسيتم تسليم البيانات قريبًا.</textarea></label>
      <button class="primary-action" type="submit">حفظ القالب</button>
    </form>
  `;
}

function customerFormHtml() {
  return `
    <form class="modal-form" id="customerForm">
      <h2 id="modalTitle">إضافة عميل</h2>
      <label><span>الاسم</span><input name="name" required /></label>
      <label><span>الجوال</span><input name="phone" required /></label>
      <button class="primary-action" type="submit">حفظ العميل</button>
    </form>
  `;
}

function exportOrders() {
  const blob = new Blob([JSON.stringify(loadOrders(), null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "nova-orders.json";
  link.click();
  URL.revokeObjectURL(link.href);
  showToast("تم تجهيز ملف الطلبات");
}

function handleAction(action) {
  if (action === "create-product") startProductEditor();
  if (action === "create-order") startManualOrder();
  if (action === "create-coupon") openModal(couponFormHtml());
  if (action === "create-template") openModal(templateFormHtml());
  if (action === "create-customer") openModal(customerFormHtml());
  if (action === "export-orders") exportOrders();
  if (action === "back-products") {
    state.productEditor = null;
    setActiveView("products");
  }
  if (action === "save-product-editor") saveProductEditor();
  if (action === "delete-current-product") deleteCurrentProductEditor();
  if (action === "editor-preview") showToast("معاينة المنتج تظهر في البطاقة الجانبية");
  if (action === "fake-upload") showToast("أضف الصور لاحقًا من جهازك أو استخدم بيانات المنتج");
  if (action === "sort-product-media") showToast("تم تفعيل ترتيب صور المنتج");
  if (action === "manage-related-products") showToast("خصائص المنتج جاهزة من تفاصيل إضافية");
  if (action === "add-inventory-row") {
    const draft = syncProductEditorFields();
    const codeCount = productEditorCodesCount(draft);
    draft.stockQuantity = codeCount || Number(draft.stockQuantity) || 0;
    render();
    showToast("تم تحديث كمية المخزون");
  }
  if (action === "back-orders") {
    state.manualOrder = null;
    setActiveView("orders");
  }
  if (action === "toggle-product-picker") {
    const draft = syncManualOrderFields();
    draft.pickerOpen = !draft.pickerOpen;
    render();
  }
  if (action === "add-manual-product") addManualOrderProduct();
  if (action === "manual-next") moveManualOrderStep(1);
  if (action === "manual-prev") moveManualOrderStep(-1);
  if (action === "save-manual-order") saveManualOrder();
  if (action === "sort-orders") {
    state.sortOrdersDesc = !state.sortOrdersDesc;
    render();
  }
  if (action === "filter-orders") showToast("فلتر الطلبات يعمل من تبويبات الحالة");
  if (action === "columns-orders") showToast("تم ضبط الأعمدة الأساسية");
  if (action === "more-orders") showToast("خيارات الطلبات جاهزة");
  if (action === "simulate-cart") {
    localStorage.setItem("novaAbandonedCarts", String(Number(localStorage.getItem("novaAbandonedCarts") || "0") + 1));
    render();
  }
  if (action === "copy-store-link") {
    navigator.clipboard?.writeText("http://127.0.0.1:8787/");
    showToast("تم نسخ رابط المتجر");
  }
  if (action === "copy-product-link") {
    navigator.clipboard?.writeText("http://127.0.0.1:8787/");
    showToast("تم نسخ رابط المتجر");
  }
}

adminView.addEventListener("click", (event) => {
  const route = event.target.closest("[data-route]");
  const action = event.target.closest("[data-action]");
  const status = event.target.closest("[data-status]");
  const editProduct = event.target.closest("[data-edit-product]");
  const toggleProduct = event.target.closest("[data-toggle-product]");
  const deleteProduct = event.target.closest("[data-delete-product]");
  const deleteCoupon = event.target.closest("[data-delete-coupon]");
  const deleteTemplate = event.target.closest("[data-delete-template]");
  const manualStep = event.target.closest("[data-manual-step]");
  const removeManualItem = event.target.closest("[data-remove-manual-item]");
  const paymentChoice = event.target.closest("[data-payment-choice]");
  const productSection = event.target.closest("[data-product-section]");

  if (route) setActiveView(route.dataset.route);
  if (action) handleAction(action.dataset.action);
  if (productSection) toggleProductSection(productSection.dataset.productSection);
  if (manualStep) setManualOrderStep(manualStep.dataset.manualStep);
  if (removeManualItem) removeManualOrderItem(removeManualItem.dataset.removeManualItem);
  if (paymentChoice) {
    const draft = syncManualOrderFields();
    draft.paymentStatus = paymentChoice.dataset.paymentChoice;
    render();
  }
  if (status) {
    state.orderStatus = status.dataset.status;
    render();
  }
  if (editProduct) startProductEditor(editProduct.dataset.editProduct);
  if (toggleProduct) {
    const products = loadProducts();
    const product = products.find((item) => item.id === toggleProduct.dataset.toggleProduct);
    if (product) product.active = product.active === false;
    saveProducts(products);
    render();
  }
  if (deleteProduct) {
    const products = loadProducts();
    const product = products.find((item) => item.id === deleteProduct.dataset.deleteProduct);
    if (product) openProductDeleteModal(product, "products");
  }
  if (deleteCoupon) {
    writeJson(merchantCouponsKey, readArray(merchantCouponsKey).filter((item) => item.id !== deleteCoupon.dataset.deleteCoupon));
    render();
  }
  if (deleteTemplate) {
    writeJson(merchantTemplatesKey, readArray(merchantTemplatesKey).filter((item) => item.id !== deleteTemplate.dataset.deleteTemplate));
    render();
  }
});

adminView.addEventListener("input", (event) => {
  if (event.target.matches("[data-table-search]")) {
    state.search = event.target.value;
    render();
  }
  if (event.target.matches("[data-product-field]")) {
    const draft = ensureProductEditorDraft();
    draft[event.target.dataset.productField] = event.target.value;
  }
  if (event.target.matches("[data-manual-field]")) {
    const draft = ensureManualOrderDraft();
    draft[event.target.dataset.manualField] = event.target.value;
  }
});

adminView.addEventListener("change", (event) => {
  const toggle = event.target.closest("[data-toggle-setting]");
  const growthTask = event.target.closest("[data-growth-task]");
  const manualQuantity = event.target.closest("[data-manual-quantity]");
  if (event.target.matches("[data-product-field]")) {
    const draft = ensureProductEditorDraft();
    draft[event.target.dataset.productField] = event.target.value;
    render();
  }
  if (event.target.matches("[data-product-toggle]")) {
    const draft = ensureProductEditorDraft();
    draft[event.target.dataset.productToggle] = event.target.checked;
    render();
  }
  if (event.target.matches("[data-manual-field]")) {
    const draft = ensureManualOrderDraft();
    draft[event.target.dataset.manualField] = event.target.value;
  }
  if (event.target.matches("[data-manual-product-source]")) {
    ensureManualOrderDraft().selectedProductId = event.target.value;
  }
  if (event.target.matches("[data-manual-product-quantity]")) {
    ensureManualOrderDraft().selectedQuantity = Math.max(1, Number(event.target.value) || 1);
  }
  if (manualQuantity) {
    updateManualOrderQuantity(manualQuantity.dataset.manualQuantity, manualQuantity.value);
  }
  if (toggle) {
    const key = toggle.dataset.toggleKey;
    const current = readObject(key, {});
    current[toggle.dataset.toggleSetting] = toggle.checked;
    writeJson(key, current);
    showToast("تم الحفظ");
  }
  if (growthTask) {
    const current = readObject("novaMerchantGrowth", {});
    current[growthTask.dataset.growthTask] = growthTask.checked;
    writeJson("novaMerchantGrowth", current);
    render();
  }
});

adminView.addEventListener("submit", (event) => {
  event.preventDefault();
  if (event.target.id === "storeSettingsForm") {
    const data = new FormData(event.target);
    writeJson(merchantSettingsKey, { ...settings(), storeName: data.get("storeName"), supportPhone: data.get("supportPhone"), defaultShipping: data.get("defaultShipping") });
    showToast("تم حفظ إعدادات المتجر");
  }
});

modalBody.addEventListener("submit", (event) => {
  event.preventDefault();
  if (event.target.id === "productDeleteForm") {
    removeProductById(event.target.dataset.productId, event.target.dataset.returnView);
    return;
  }
  if (event.target.id === "merchantProductForm") saveProductFromForm(event.target);
  if (event.target.id === "merchantOrderForm") saveOrderFromForm(event.target);
  if (event.target.id === "couponForm") {
    const data = new FormData(event.target);
    const coupons = readArray(merchantCouponsKey);
    coupons.unshift({ id: createId("coupon"), code: data.get("code").trim(), discount: Number(data.get("discount")) || 0, createdAt: new Date().toISOString() });
    writeJson(merchantCouponsKey, coupons);
    closeModal();
    setActiveView("marketing");
  }
  if (event.target.id === "templateForm") {
    const data = new FormData(event.target);
    const templates = readArray(merchantTemplatesKey);
    templates.unshift({ id: createId("template"), title: data.get("title").trim(), body: data.get("body").trim(), createdAt: new Date().toISOString() });
    writeJson(merchantTemplatesKey, templates);
    closeModal();
    setActiveView("whatsapp");
  }
  if (event.target.id === "customerForm") {
    const data = new FormData(event.target);
    const customers = readArray(merchantCustomersKey);
    customers.unshift({ id: createId("customer"), name: data.get("name").trim(), phone: data.get("phone").trim(), orders: 0, spent: 0 });
    writeJson(merchantCustomersKey, customers);
    closeModal();
    setActiveView("customers");
  }
});

modalBody.addEventListener("click", (event) => {
  const action = event.target.closest("[data-action]");
  if (action?.dataset.action === "close-modal") closeModal();
});

document.querySelectorAll("[data-view]").forEach((button) => button.addEventListener("click", () => setActiveView(button.dataset.view)));
document.querySelectorAll("[data-view-shortcut]").forEach((button) => button.addEventListener("click", () => setActiveView(button.dataset.viewShortcut)));
document.querySelector("#quickAddButton").addEventListener("click", () => startProductEditor());
document.querySelector("#ordersShortcutButton").addEventListener("click", () => setActiveView("orders"));
document.querySelector("#cashShortcutButton").addEventListener("click", () => setActiveView("finance"));
document.querySelector("#notificationButton").addEventListener("click", () => {
  setActiveView("orders");
  state.orderStatus = "new";
  render();
});
document.querySelector("#themeToggleButton").addEventListener("click", () => {
  document.body.classList.toggle("admin-bright");
  showToast(document.body.classList.contains("admin-bright") ? "تم تفتيح الواجهة" : "تم تفعيل الداكن");
});

adminGlobalSearch.addEventListener("input", (event) => {
  state.search = event.target.value;
  render();
});

window.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    adminGlobalSearch.focus();
  }
  if (event.key === "Escape" && !modal.classList.contains("is-hidden")) closeModal();
});

modalCloseButton.addEventListener("click", closeModal);
modal.addEventListener("click", (event) => {
  if (event.target === modal) closeModal();
});

function setAuthMessage(text, type = "") {
  authMessage.textContent = text;
  authMessage.className = `form-message ${type}`.trim();
}

function showAuth() {
  const account = readObject(adminAccountKey);
  const isSetup = !account;
  const query = new URLSearchParams(window.location.search);
  const fromMerchantJoin = query.get("merchant") === "joined";
  const application = readObject(merchantApplicationKey);
  authTitle.textContent = isSetup ? "إعداد حساب التاجر" : "دخول التاجر";
  authSubhead.textContent = isSetup ? "أنشئ حساب الإدارة الأول." : "أدخل بيانات حساب التاجر.";
  if (fromMerchantJoin) {
    const storeName = application?.storeName ? ` لمتجر ${application.storeName}` : "";
    authSubhead.textContent = account
      ? `تم حفظ طلب الانضمام${storeName}. سجل الدخول بحساب التاجر.`
      : `تم حفظ طلب الانضمام${storeName}. أنشئ حساب التاجر للمتابعة.`;
    if (application?.username && !adminUsername.value) adminUsername.value = application.username;
    setAuthMessage(account ? "استخدم كلمة المرور التي اخترتها أثناء طلب الانضمام، أو حساب التاجر الحالي." : "اختر كلمة مرور لحساب التاجر.", "success");
  } else {
    setAuthMessage("");
  }
  adminConfirmField.classList.toggle("is-hidden", !isSetup);
  adminConfirmPassword.required = isSetup;
  adminPassword.autocomplete = isSetup ? "new-password" : "current-password";
  adminSubmitText.textContent = isSetup ? "إنشاء الحساب" : "دخول";
  authShell.classList.remove("is-hidden");
  dashboard.classList.add("is-hidden");
  window.lucide?.createIcons();
}

function showDashboard() {
  authShell.classList.add("is-hidden");
  dashboard.classList.remove("is-hidden");
  setActiveView(state.view);
}

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const account = readObject(adminAccountKey);
  const cleanUsername = adminUsername.value.trim();
  const cleanPassword = adminPassword.value.trim();
  const cleanConfirm = adminConfirmPassword.value.trim();
  if (!cleanUsername || cleanPassword.length < 4) {
    setAuthMessage("تحقق من اسم المستخدم وكلمة المرور.", "error");
    return;
  }
  if (!account) {
    if (cleanPassword !== cleanConfirm) {
      setAuthMessage("كلمتا المرور غير متطابقتين.", "error");
      return;
    }
    const application = readObject(merchantApplicationKey);
    writeJson(adminAccountKey, {
      username: cleanUsername,
      passwordHash: await hashPassword(cleanPassword),
      createdAt: new Date().toISOString(),
      applicationId: application?.id || "",
      storeName: application?.storeName || "",
      ownerName: application?.ownerName || "",
    });
    authForm.reset();
    showDashboard();
    return;
  }
  if (account.username !== cleanUsername || account.passwordHash !== (await hashPassword(cleanPassword))) {
    setAuthMessage("بيانات الدخول غير صحيحة.", "error");
    return;
  }
  authForm.reset();
  showDashboard();
});

document.querySelector("#adminLogoutButton").addEventListener("click", showAuth);

showAuth();
