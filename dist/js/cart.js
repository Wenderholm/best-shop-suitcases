const CART_STORAGE_KEY = "best-shop-cart";
function isSameCartItem(item, comparedItem) {
    return (item.id === comparedItem.id &&
        item.size === comparedItem.size &&
        item.color === comparedItem.color);
}
function readCartItems() {
    try {
        const stored = localStorage.getItem(CART_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    }
    catch (_a) {
        return [];
    }
}
function saveCartItems(items) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}
export function getCartItems() {
    return readCartItems();
}
export function getCartCount() {
    return readCartItems().reduce((total, item) => total + item.quantity, 0);
}
export function updateCartCounter() {
    const cartIcon = document.querySelector(".cartIcon");
    if (!cartIcon) {
        return;
    }
    let badge = cartIcon.querySelector(".cart-count");
    const count = getCartCount();
    if (count <= 0) {
        badge === null || badge === void 0 ? void 0 : badge.remove();
        return;
    }
    if (!badge) {
        badge = document.createElement("span");
        badge.className = "cart-count";
        cartIcon.appendChild(badge);
    }
    badge.textContent = String(count);
}
export function addProductToCart(product, quantity = 1) {
    const items = readCartItems();
    const existing = items.find((item) => isSameCartItem(item, product));
    if (existing) {
        existing.quantity += quantity;
    }
    else {
        items.push(Object.assign(Object.assign({}, product), { quantity }));
    }
    saveCartItems(items);
    updateCartCounter();
}
export function updateCartItemQuantity(itemToUpdate, amount) {
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
export function removeCartItem(itemToRemove) {
    const items = readCartItems().filter((item) => !isSameCartItem(item, itemToRemove));
    saveCartItems(items);
    updateCartCounter();
}
export function clearCart() {
    saveCartItems([]);
    updateCartCounter();
}
