var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const HEADER_PARTIAL_PATH = "/src/html/partials/header.html";
const FOOTER_PARTIAL_PATH = "/src/html/partials/footer.html";
function loadPartial(container, partialPath) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!container) {
            return;
        }
        const response = yield fetch(partialPath);
        if (!response.ok) {
            throw new Error(`Failed to load partial: ${partialPath}`);
        }
        container.innerHTML = yield response.text();
    });
}
function markActiveNavigation() {
    const currentPage = document.body.dataset.page;
    if (!currentPage) {
        return;
    }
    const activeLink = document.querySelector(`[data-nav="${currentPage}"]`);
    activeLink === null || activeLink === void 0 ? void 0 : activeLink.classList.add("is-active");
}
export function injectLayout() {
    return __awaiter(this, void 0, void 0, function* () {
        const headerContainer = document.getElementById("site-header");
        const footerContainer = document.getElementById("site-footer");
        try {
            yield Promise.all([
                loadPartial(headerContainer, HEADER_PARTIAL_PATH),
                loadPartial(footerContainer, FOOTER_PARTIAL_PATH),
            ]);
            markActiveNavigation();
        }
        catch (error) {
            console.error("Failed to load shared layout", error);
        }
    });
}
