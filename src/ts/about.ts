import { updateCartCounter } from "./cart.js";
import { initHeaderMenu } from "./header.js";
import { initLoginModal } from "./login.js";

function initAboutPage(): void {
  updateCartCounter();
}

initAboutPage();
initHeaderMenu();
void initLoginModal();
