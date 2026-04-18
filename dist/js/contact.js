import { updateCartCounter } from "./cart.js";
import { initHeaderMenu } from "./header.js";
import { initLoginModal } from "./login.js";
const contactForm = document.getElementById("contact-form");
const nameInput = document.getElementById("contact-name");
const emailInput = document.getElementById("contact-email");
const topicInput = document.getElementById("contact-topic");
const messageInput = document.getElementById("contact-message");
const formMessage = document.getElementById("contact-form-message");
function setFormMessage(message, isError) {
    if (!formMessage) {
        return;
    }
    formMessage.textContent = message;
    formMessage.classList.toggle("is-error", isError);
    formMessage.classList.toggle("is-success", !isError);
}
function markInvalid(field, shouldMark) {
    field === null || field === void 0 ? void 0 : field.classList.toggle("is-invalid", shouldMark);
}
function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
function validateRequiredField(field) {
    const isValid = Boolean(field === null || field === void 0 ? void 0 : field.value.trim());
    markInvalid(field, !isValid);
    return isValid;
}
function validateEmailField() {
    var _a;
    const value = (_a = emailInput === null || emailInput === void 0 ? void 0 : emailInput.value.trim()) !== null && _a !== void 0 ? _a : "";
    const isValid = isValidEmail(value);
    markInvalid(emailInput, !isValid);
    return isValid;
}
function initContactPage() {
    updateCartCounter();
    emailInput === null || emailInput === void 0 ? void 0 : emailInput.addEventListener("input", () => {
        const value = emailInput.value.trim();
        if (!value) {
            markInvalid(emailInput, false);
            return;
        }
        validateEmailField();
    });
    [nameInput, topicInput, messageInput].forEach((field) => {
        field === null || field === void 0 ? void 0 : field.addEventListener("input", () => {
            if (field.value.trim()) {
                markInvalid(field, false);
            }
        });
    });
    contactForm === null || contactForm === void 0 ? void 0 : contactForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const isNameValid = validateRequiredField(nameInput);
        const isTopicValid = validateRequiredField(topicInput);
        const isMessageValid = validateRequiredField(messageInput);
        const isEmailValid = validateEmailField();
        if (!isNameValid || !isTopicValid || !isMessageValid || !isEmailValid) {
            setFormMessage("Please complete all required fields and enter a valid email address.", true);
            return;
        }
        contactForm.reset();
        [nameInput, emailInput, topicInput, messageInput].forEach((field) => {
            markInvalid(field, false);
        });
        setFormMessage("Your message has been sent successfully.", false);
    });
}
initContactPage();
initHeaderMenu();
void initLoginModal();
