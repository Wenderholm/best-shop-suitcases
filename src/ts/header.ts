export function initHeaderMenu(): void {
  const header = document.querySelector(".header") as HTMLElement | null;
  const toggleButton = header?.querySelector(
    ".header__menu-toggle",
  ) as HTMLButtonElement | null;
  const nav = header?.querySelector(".nav") as HTMLElement | null;

  if (!header || !toggleButton || !nav) {
    return;
  }

  const closeMenu = (): void => {
    header.classList.remove("is-menu-open");
    toggleButton.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
  };

  const openMenu = (): void => {
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
