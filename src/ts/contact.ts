import { updateCartCounter } from "./cart.js";
import { initHeaderMenu } from "./header.js";
import { initLoginModal } from "./login.js";

const contactForm = document.getElementById(
  "contact-form",
) as HTMLFormElement | null;
const nameInput = document.getElementById(
  "contact-name",
) as HTMLInputElement | null;
const emailInput = document.getElementById(
  "contact-email",
) as HTMLInputElement | null;
const topicInput = document.getElementById(
  "contact-topic",
) as HTMLInputElement | null;
const messageInput = document.getElementById(
  "contact-message",
) as HTMLTextAreaElement | null;
const formMessage = document.getElementById("contact-form-message");

function setFormMessage(message: string, isError: boolean): void {
  if (!formMessage) {
    return;
  }

  formMessage.textContent = message;
  formMessage.classList.toggle("is-error", isError);
  formMessage.classList.toggle("is-success", !isError);
}

function markInvalid(
  field: HTMLInputElement | HTMLTextAreaElement | null,
  shouldMark: boolean,
): void {
  field?.classList.toggle("is-invalid", shouldMark);
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateRequiredField(
  field: HTMLInputElement | HTMLTextAreaElement | null,
): boolean {
  const isValid = Boolean(field?.value.trim());

  markInvalid(field, !isValid);

  return isValid;
}

function validateEmailField(): boolean {
  const value = emailInput?.value.trim() ?? "";
  const isValid = isValidEmail(value);

  markInvalid(emailInput, !isValid);

  return isValid;
}

function initContactPage(): void {
  updateCartCounter();

  emailInput?.addEventListener("input", () => {
    const value = emailInput.value.trim();

    if (!value) {
      markInvalid(emailInput, false);
      return;
    }

    validateEmailField();
  });

  [nameInput, topicInput, messageInput].forEach((field) => {
    field?.addEventListener("input", () => {
      if (field.value.trim()) {
        markInvalid(field, false);
      }
    });
  });

  contactForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const isNameValid = validateRequiredField(nameInput);
    const isTopicValid = validateRequiredField(topicInput);
    const isMessageValid = validateRequiredField(messageInput);
    const isEmailValid = validateEmailField();

    if (!isNameValid || !isTopicValid || !isMessageValid || !isEmailValid) {
      setFormMessage(
        "Please complete all required fields and enter a valid email address.",
        true,
      );
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
