type LoginUser = {
  id: string;
  email: string;
  password: string;
  name: string;
};

type LoginPayload = {
  users?: LoginUser[];
};

const LOGIN_DATA_PATH = "/src/assets/data.json";
const LOGIN_MODAL_MARKUP = `
  <div class="login-modal" id="login-modal" aria-hidden="true">
    <div class="login-modal__overlay"></div>
    <div
      class="login-modal__dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
    >
      <button
        class="login-modal__close"
        type="button"
        aria-label="Close login modal"
      >
        &times;
      </button>
      <h2 id="login-modal-title">Log In</h2>
      <form class="login-form" id="login-form">
        <label class="login-form__field">
          <span>Email address <span>*</span></span>
          <input id="login-email" type="email" autocomplete="email" />
        </label>

        <label class="login-form__field">
          <span>Password <span>*</span></span>
          <span class="login-form__password-wrap">
            <input
              id="login-password"
              type="password"
              autocomplete="current-password"
            />
            <button
              id="login-password-toggle"
              type="button"
              aria-label="Show or hide password"
            >
              &#128065;
            </button>
          </span>
        </label>

        <div class="login-form__meta">
          <label class="login-form__checkbox">
            <input type="checkbox" />
            <span>Remember me</span>
          </label>
          <a href="#">Forgot Your Password?</a>
        </div>

        <p class="login-form__message" id="login-feedback"></p>

        <button class="btn login-form__submit" type="submit">LOG IN</button>
      </form>
    </div>
  </div>
`;

async function ensureLoginModal(): Promise<HTMLElement | null> {
  const existingModal = document.getElementById("login-modal");

  if (existingModal) {
    return existingModal;
  }

  const wrapper = document.createElement("div");
  wrapper.innerHTML = LOGIN_MODAL_MARKUP;

  const modal = wrapper.firstElementChild as HTMLElement | null;

  if (!modal) {
    return null;
  }

  document.body.appendChild(modal);

  return modal;
}

async function loadUsers(): Promise<LoginUser[]> {
  const response = await fetch(LOGIN_DATA_PATH);

  if (!response.ok) {
    throw new Error("Failed to load login data");
  }

  const payload = (await response.json()) as LoginPayload;

  return payload.users ?? [];
}

function showMessage(
  element: HTMLElement | null,
  message: string,
  type: "error" | "success",
): void {
  if (!element) {
    return;
  }

  element.textContent = message;
  element.classList.remove("is-error", "is-success");
  element.classList.add(type === "error" ? "is-error" : "is-success");
}

function resetMessage(element: HTMLElement | null): void {
  if (!element) {
    return;
  }

  element.textContent = "";
  element.classList.remove("is-error", "is-success");
}

export async function initLoginModal(): Promise<void> {
  const modal = await ensureLoginModal();
  const overlay = modal?.querySelector(
    ".login-modal__overlay",
  ) as HTMLElement | null;
  const closeButton = modal?.querySelector(
    ".login-modal__close",
  ) as HTMLButtonElement | null;
  const form = document.getElementById("login-form") as HTMLFormElement | null;
  const emailInput = document.getElementById(
    "login-email",
  ) as HTMLInputElement | null;
  const passwordInput = document.getElementById(
    "login-password",
  ) as HTMLInputElement | null;
  const toggleButton = document.getElementById(
    "login-password-toggle",
  ) as HTMLButtonElement | null;
  const feedback = document.getElementById("login-feedback");
  const triggers = document.querySelectorAll(".userIcon");

  if (!modal || !form || !emailInput || !passwordInput) {
    return;
  }

  let usersPromise: Promise<LoginUser[]> | null = null;

  const openModal = (): void => {
    modal.classList.add("is-open");
    document.body.classList.add("modal-open");
    resetMessage(feedback);
    window.setTimeout(() => emailInput.focus(), 0);
  };

  const closeModal = (): void => {
    modal.classList.remove("is-open");
    document.body.classList.remove("modal-open");
    form.reset();
    passwordInput.type = "password";
    toggleButton?.classList.remove("is-active");
    resetMessage(feedback);
  };

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      openModal();
    });
  });

  overlay?.addEventListener("click", closeModal);
  closeButton?.addEventListener("click", closeModal);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal();
    }
  });

  toggleButton?.addEventListener("click", () => {
    const shouldShow = passwordInput.type === "password";

    passwordInput.type = shouldShow ? "text" : "password";
    toggleButton.classList.toggle("is-active", shouldShow);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!isEmailValid) {
      showMessage(feedback, "Enter a valid email address.", "error");
      return;
    }

    if (!password) {
      showMessage(feedback, "Password is required.", "error");
      return;
    }

    try {
      usersPromise ??= loadUsers();
      const users = await usersPromise;
      const matchedUser = users.find(
        (user) => user.email === email && user.password === password,
      );

      if (!matchedUser) {
        showMessage(feedback, "Invalid email or password.", "error");
        return;
      }

      showMessage(feedback, `Welcome back, ${matchedUser.name}.`, "success");
      window.setTimeout(closeModal, 500);
    } catch (error) {
      console.error("Failed to validate login", error);
      showMessage(feedback, "Unable to log in right now.", "error");
    }
  });
}
