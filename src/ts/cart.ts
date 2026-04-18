export type CartItem = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  size: string;
  color: string;
  category: string;
};

export type CartProductInput = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  size: string;
  color: string;
  category: string;
};

const CART_STORAGE_KEY = "best-shop-cart";

type CartItemIdentity = Pick<CartItem, "id" | "size" | "color">;

function isSameCartItem(
  item: CartItem,
  comparedItem: CartItemIdentity,
): boolean {
  return (
    item.id === comparedItem.id &&
    item.size === comparedItem.size &&
    item.color === comparedItem.color
  );
}

function readCartItems(): CartItem[] {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);

    return stored ? (JSON.parse(stored) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function saveCartItems(items: CartItem[]): void {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

export function getCartItems(): CartItem[] {
  return readCartItems();
}

export function getCartCount(): number {
  return readCartItems().reduce((total, item) => total + item.quantity, 0);
}

export function updateCartCounter(): void {
  const cartIcon = document.querySelector<HTMLElement>(".cartIcon");

  if (!cartIcon) {
    return;
  }

  let badge = cartIcon.querySelector<HTMLElement>(".cart-count");
  const count = getCartCount();

  if (count <= 0) {
    badge?.remove();
    return;
  }

  if (!badge) {
    badge = document.createElement("span");
    badge.className = "cart-count";
    cartIcon.appendChild(badge);
  }

  badge.textContent = String(count);
}

export function addProductToCart(
  product: CartProductInput,
  quantity = 1,
): void {
  const items = readCartItems();
  const existing = items.find((item) => isSameCartItem(item, product));

  if (existing) {
    existing.quantity += quantity;
  } else {
    items.push({
      ...product,
      quantity,
    });
  }

  saveCartItems(items);
  updateCartCounter();
}

export function updateCartItemQuantity(
  itemToUpdate: CartItemIdentity,
  amount: number,
): void {
  const items = readCartItems();
  const existing = items.find((item) => isSameCartItem(item, itemToUpdate));

  if (!existing) {
    return;
  }

  existing.quantity += amount;

  const updatedItems = items.filter((item) => item.quantity > 0);

  saveCartItems(updatedItems);
  updateCartCounter();
}

export function removeCartItem(itemToRemove: CartItemIdentity): void {
  const items = readCartItems().filter(
    (item) => !isSameCartItem(item, itemToRemove),
  );

  saveCartItems(items);
  updateCartCounter();
}

export function clearCart(): void {
  saveCartItems([]);
  updateCartCounter();
}
