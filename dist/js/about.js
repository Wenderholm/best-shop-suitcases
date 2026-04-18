import { updateCartCounter } from "./cart.js";
import { initHeaderMenu } from "./header.js";
import { initLoginModal } from "./login.js";
function initAboutPage() {
    updateCartCounter();
}
initAboutPage();
initHeaderMenu();
void initLoginModal();
