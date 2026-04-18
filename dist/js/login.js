var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const LOGIN_DATA_PATH = "/src/assets/data.json";
const LOGIN_MODAL_MARKUP = `
  <dialog class="login-modal" id="login-modal" aria-labelledby="login-modal-title">
    <div class="login-modal__overlay"></div>
    <div class="login-modal__dialog">
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
  </dialog>
`;
function ensureLoginModal() {
    return __awaiter(this, void 0, void 0, function* () {
        const existingModal = document.getElementById("login-modal");
        if (existingModal instanceof HTMLDialogElement) {
            return existingModal;
        }
        const wrapper = document.createElement("div");
        wrapper.innerHTML = LOGIN_MODAL_MARKUP;
        const modal = wrapper.firstElementChild;
        if (!(modal instanceof HTMLDialogElement)) {
            return null;
        }
        document.body.appendChild(modal);
        return modal;
    });
}
function loadUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const response = yield fetch(LOGIN_DATA_PATH);
        if (!response.ok) {
            throw new Error("Failed to load login data");
        }
        const payload = (yield response.json());
        return (_a = payload.users) !== null && _a !== void 0 ? _a : [];
    });
}
function showMessage(element, message, type) {
    if (!element) {
        return;
    }
    element.textContent = message;
    element.classList.remove("is-error", "is-success");
    element.classList.add(type === "error" ? "is-error" : "is-success");
}
function resetMessage(element) {
    if (!element) {
        return;
    }
    element.textContent = "";
    element.classList.remove("is-error", "is-success");
}
export function initLoginModal() {
    return __awaiter(this, void 0, void 0, function* () {
        const modal = yield ensureLoginModal();
        const overlay = modal === null || modal === void 0 ? void 0 : modal.querySelector(".login-modal__overlay");
        const closeButton = modal === null || modal === void 0 ? void 0 : modal.querySelector(".login-modal__close");
        const form = document.getElementById("login-form");
        const emailInput = document.getElementById("login-email");
        const passwordInput = document.getElementById("login-password");
        const toggleButton = document.getElementById("login-password-toggle");
        const feedback = document.getElementById("login-feedback");
        const triggers = document.querySelectorAll(".userIcon");
        if (!modal || !form || !emailInput || !passwordInput) {
            return;
        }
        let usersPromise = null;
        const openModal = () => {
            if (!modal.open) {
                modal.showModal();
            }
            modal.classList.add("is-open");
            document.body.classList.add("modal-open");
            resetMessage(feedback);
            window.setTimeout(() => emailInput.focus(), 0);
        };
        const closeModal = () => {
            modal.classList.remove("is-open");
            if (modal.open) {
                modal.close();
            }
            document.body.classList.remove("modal-open");
            form.reset();
            passwordInput.type = "password";
            toggleButton === null || toggleButton === void 0 ? void 0 : toggleButton.classList.remove("is-active");
            resetMessage(feedback);
        };
        triggers.forEach((trigger) => {
            trigger.addEventListener("click", (event) => {
                event.preventDefault();
                openModal();
            });
        });
        overlay === null || overlay === void 0 ? void 0 : overlay.addEventListener("click", closeModal);
        closeButton === null || closeButton === void 0 ? void 0 : closeButton.addEventListener("click", closeModal);
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && modal.classList.contains("is-open")) {
                closeModal();
            }
        });
        toggleButton === null || toggleButton === void 0 ? void 0 : toggleButton.addEventListener("click", () => {
            const shouldShow = passwordInput.type === "password";
            passwordInput.type = shouldShow ? "text" : "password";
            toggleButton.classList.toggle("is-active", shouldShow);
        });
        form.addEventListener("submit", (event) => __awaiter(this, void 0, void 0, function* () {
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
                usersPromise !== null && usersPromise !== void 0 ? usersPromise : (usersPromise = loadUsers());
                const users = yield usersPromise;
                const matchedUser = users.find((user) => user.email === email && user.password === password);
                if (!matchedUser) {
                    showMessage(feedback, "Invalid email or password.", "error");
                    return;
                }
                showMessage(feedback, `Welcome back, ${matchedUser.name}.`, "success");
                window.setTimeout(closeModal, 500);
            }
            catch (error) {
                console.error("Failed to validate login", error);
                showMessage(feedback, "Unable to log in right now.", "error");
            }
        }));
    });
}
