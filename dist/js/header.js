export function initHeaderMenu() {
    const header = document.querySelector(".header");
    const toggleButton = header === null || header === void 0 ? void 0 : header.querySelector(".header__menu-toggle");
    const nav = header === null || header === void 0 ? void 0 : header.querySelector(".nav");
    if (!header || !toggleButton || !nav) {
        return;
    }
    const closeMenu = () => {
        header.classList.remove("is-menu-open");
        toggleButton.setAttribute("aria-expanded", "false");
        document.body.classList.remove("menu-open");
    };
    const openMenu = () => {
        header.classList.add("is-menu-open");
        toggleButton.setAttribute("aria-expanded", "true");
        document.body.classList.add("menu-open");
    };
    toggleButton.addEventListener("click", () => {
        if (header.classList.contains("is-menu-open")) {
            closeMenu();
            return;
        }
        openMenu();
    });
    nav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", closeMenu);
    });
    window.addEventListener("resize", () => {
        if (window.innerWidth > 768) {
            closeMenu();
        }
    });
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeMenu();
        }
    });
}
