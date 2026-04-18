import {
  clearCart,
  getCartItems,
  removeCartItem,
  updateCartCounter,
  updateCartItemQuantity,
  type CartItem,
} from "./cart.js";
import { initHeaderMenu } from "./header.js";
import { initLoginModal } from "./login.js";

const SHIPPING_PRICE = 30;
const DISCOUNT_THRESHOLD = 3000;
const DISCOUNT_RATE = 0.1;

function formatCurrency(value: number): string {
  return `$${value}`;
}

function normalizeImagePath(imageUrl: string): string {
  if (imageUrl.startsWith("../src/img/")) {
    return imageUrl.replace("../src/img/", "../img/");
  }

  return imageUrl;
}

function showStatusMessage(message: string): void {
  const statusElement = document.getElementById("cart-status-message");

  if (!statusElement) {
    return;
  }

  statusElement.textContent = message;
  statusElement.hidden = false;
}

function hideStatusMessage(): void {
  const statusElement = document.getElementById("cart-status-message");

  if (!statusElement) {
    return;
  }

  statusElement.hidden = true;
  statusElement.textContent = "";
}

function renderCartRow(item: CartItem): string {
  const itemTotal = item.price * item.quantity;

  return `
    <article
      class="cart-item"
      data-id="${item.id}"
      data-size="${item.size}"
      data-color="${item.color}"
    >
      <div class="cart-item__image">
        <img src="${normalizeImagePath(item.imageUrl)}" alt="${item.name}" />
      </div>
      <div class="cart-item__name">
        <strong>${item.name}</strong>
      </div>
      <div class="cart-item__price">${formatCurrency(item.price)}</div>
      <div class="cart-item__quantity" aria-label="Quantity selector">
        <button data-action="decrease" type="button">-</button>
        <span>${item.quantity}</span>
        <button data-action="increase" type="button">+</button>
      </div>
      <div class="cart-item__total">${formatCurrency(itemTotal)}</div>
      <button class="cart-item__delete" data-action="remove" type="button" aria-label="Remove ${item.name} from cart">
        <img src="../img/trash.png" alt="" />
      </button>
    </article>
  `;
}

function renderCartPage(): void {
  const discountElement = document.getElementById("cart-discount");
  const itemsContainer = document.getElementById("cart-items");
  const emptyMessage = document.getElementById("cart-empty-message");
  const subtotalElement = document.getElementById("cart-subtotal");
  const shippingElement = document.getElementById("cart-shipping");
  const totalElement = document.getElementById("cart-total");
  const checkoutButton = document.getElementById(
    "cart-checkout",
  ) as HTMLButtonElement | null;

  if (
    !itemsContainer ||
    !emptyMessage ||
    !subtotalElement ||
    !shippingElement ||
    !totalElement ||
    !checkoutButton ||
    !discountElement
  ) {
    return;
  }

  const items = getCartItems();
  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const discount = subtotal > DISCOUNT_THRESHOLD ? subtotal * DISCOUNT_RATE : 0;
  const shipping = items.length > 0 ? SHIPPING_PRICE : 0;
  const total = subtotal - discount + shipping;

  discountElement.textContent = formatCurrency(discount);
  itemsContainer.innerHTML = items.map(renderCartRow).join("");
  emptyMessage.hidden = items.length > 0;
  subtotalElement.textContent = formatCurrency(subtotal);
  shippingElement.textContent = formatCurrency(shipping);
  totalElement.textContent = formatCurrency(total);
  checkoutButton.disabled = items.length === 0;
}

function getItemIdentity(element: HTMLElement): {
  id: string;
  size: string;
  color: string;
} | null {
  const row = element.closest(".cart-item") as HTMLElement | null;

  if (!row?.dataset.id || !row.dataset.size || !row.dataset.color) {
    return null;
  }

  return {
    id: row.dataset.id,
    size: row.dataset.size,
    color: row.dataset.color,
  };
}

function initCartPage(): void {
  const root = document.getElementById("cart-page-root");
  const itemsContainer = document.getElementById("cart-items");
  const clearCartButton = document.getElementById("clear-cart");
  const checkoutButton = document.getElementById(
    "cart-checkout",
  ) as HTMLButtonElement | null;

  if (!root || !itemsContainer || !clearCartButton || !checkoutButton) {
    return;
  }

  renderCartPage();
  updateCartCounter();

  itemsContainer.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    const actionTrigger = target.closest("[data-action]") as HTMLElement | null;

    if (!actionTrigger) {
      return;
    }

    const identity = getItemIdentity(actionTrigger);

    if (!identity) {
      return;
    }

    const action = actionTrigger.dataset.action;

    if (action === "increase") {
      hideStatusMessage();
      updateCartItemQuantity(identity, 1);
    }

    if (action === "decrease") {
      hideStatusMessage();
      updateCartItemQuantity(identity, -1);
    }

    if (action === "remove") {
      hideStatusMessage();
      removeCartItem(identity);
    }

    renderCartPage();
  });

  clearCartButton.addEventListener("click", () => {
    hideStatusMessage();
    clearCart();
    renderCartPage();
  });

  checkoutButton.addEventListener("click", () => {
    const items = getCartItems();

    if (items.length === 0) {
      return;
    }

    clearCart();
    renderCartPage();
    updateCartCounter();
    showStatusMessage("Thank you for your purchase.");
  });
}

initCartPage();
initHeaderMenu();
void initLoginModal();
