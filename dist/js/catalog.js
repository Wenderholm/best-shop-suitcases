var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { addProductToCart, updateCartCounter } from "./cart.js";
import { initHeaderMenu } from "./header.js";
import { initLoginModal } from "./login.js";
const productsContainer = document.getElementById("catalog-products");
const bestRatedContainer = document.getElementById("best-rated-products");
const paginationContainer = document.getElementById("catalog-pagination");
const resultCount = document.getElementById("catalog-result-count");
const filtersSection = document.querySelector(".catalog-filters");
const searchInput = document.getElementById("catalog-search");
const sortSelect = document.getElementById("catalog-sort");
const sizeFilter = document.getElementById("catalog-filter-size");
const colorFilter = document.getElementById("catalog-filter-color");
const categoryFilter = document.getElementById("catalog-filter-category");
const salesFilter = document.getElementById("catalog-filter-sales");
const clearFiltersButton = document.getElementById("catalog-clear-filters");
const toggleFiltersButton = document.getElementById("catalog-toggle-filters");
const searchButton = document.getElementById("catalog-search-button");
const searchFeedback = document.getElementById("catalog-search-feedback");
const PAGE_SIZE = 12;
let allProducts = [];
let visibleProducts = [];
let currentPage = 1;
function resolveProductImageUrl(imageUrl) {
    const fileName = imageUrl.split("/").pop();
    return fileName ? `../img/${fileName}` : imageUrl;
}
function getStarMarkup(rating) {
    const fullStars = Math.round(rating);
    const filled = "&#9733;".repeat(fullStars);
    const empty = "&#9734;".repeat(5 - fullStars);
    return `<span class="stars" aria-label="Rating ${rating} out of 5">${filled}${empty}</span>`;
}
function renderResultCount() {
    if (!resultCount) {
        return;
    }
    if (visibleProducts.length === 0) {
        resultCount.textContent = "Showing 0-0 Of 0 Results";
        return;
    }
    const start = (currentPage - 1) * PAGE_SIZE + 1;
    const end = Math.min(currentPage * PAGE_SIZE, visibleProducts.length);
    resultCount.textContent = `Showing ${start}-${end} Of ${visibleProducts.length} Results`;
}
function renderCatalogProducts() {
    if (!productsContainer) {
        return;
    }
    const start = (currentPage - 1) * PAGE_SIZE;
    const pageItems = visibleProducts.slice(start, start + PAGE_SIZE);
    productsContainer.innerHTML = pageItems
        .map((product) => `
			<article class="product-card" data-product-id="${product.id}">
				<div class="product-card__media">
					${product.salesStatus ? '<span class="product-card__badge">SALE</span>' : ""}
          <img src="${resolveProductImageUrl(product.imageUrl)}" alt="${product.name}" />
				</div>
				<div class="product-card__body">
          <h3>${product.name}</h3>
					<p class="price">$${product.price}</p>
					<button class="btn" type="button">Add To Cart</button>
				</div>
			</article>
		`)
        .join("");
}
function renderBestRated() {
    if (!bestRatedContainer) {
        return;
    }
    const bestRated = [...allProducts]
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 5);
    bestRatedContainer.innerHTML = bestRated
        .map((product) => `
			<article class="best-set-item">
        <img src="${resolveProductImageUrl(product.imageUrl)}" alt="${product.name}" />
				<div>
					<h4>${product.name}</h4>
					${getStarMarkup(product.rating)}
					<p>$${product.price}</p>
				</div>
			</article>
		`)
        .join("");
}
function renderPagination() {
    if (!paginationContainer) {
        return;
    }
    const totalPages = Math.max(1, Math.ceil(visibleProducts.length / PAGE_SIZE));
    const pageButtons = Array.from({ length: totalPages }, (_, index) => {
        const page = index + 1;
        return `
			<button class="catalog-pagination__page${page === currentPage ? " is-active" : ""}" data-page="${page}" type="button">
				${page}
			</button>
		`;
    }).join("");
    paginationContainer.innerHTML = `
		<button class="catalog-pagination__nav" type="button" data-action="previous" ${currentPage <= 1 ? "disabled" : ""}><span class="catalog-pagination__arrow" aria-hidden="true">&lt;</span> PREVIOUS</button>
		<div class="catalog-pagination__pages">${pageButtons}</div>
		<button class="catalog-pagination__nav" type="button" data-action="next" ${currentPage >= totalPages ? "disabled" : ""}>NEXT <span class="catalog-pagination__arrow" aria-hidden="true">&gt;</span></button>
	`;
}
function showSearchFeedback(message) {
    if (!searchFeedback) {
        return;
    }
    searchFeedback.textContent = message;
    searchFeedback.hidden = false;
    searchFeedback.classList.add("is-visible");
    window.setTimeout(() => {
        searchFeedback.classList.remove("is-visible");
        searchFeedback.hidden = true;
    }, 2500);
}
function handleProductSearch() {
    var _a;
    const term = (_a = searchInput === null || searchInput === void 0 ? void 0 : searchInput.value.trim().toLowerCase()) !== null && _a !== void 0 ? _a : "";
    if (!term) {
        showSearchFeedback("Enter a product name to search.");
        return;
    }
    const matchedProduct = allProducts.find((product) => product.name.toLowerCase().includes(term));
    if (!matchedProduct) {
        showSearchFeedback("Product not found.");
        return;
    }
    window.location.href = `product.html?id=${encodeURIComponent(matchedProduct.id)}`;
}
function renderCatalog() {
    renderCatalogProducts();
    renderResultCount();
    renderPagination();
}
function applyFiltersAndSort() {
    var _a, _b, _c, _d, _e, _f;
    const term = (_a = searchInput === null || searchInput === void 0 ? void 0 : searchInput.value.trim().toLowerCase()) !== null && _a !== void 0 ? _a : "";
    const sortValue = (_b = sortSelect === null || sortSelect === void 0 ? void 0 : sortSelect.value) !== null && _b !== void 0 ? _b : "default";
    const selectedSize = (_c = sizeFilter === null || sizeFilter === void 0 ? void 0 : sizeFilter.value) !== null && _c !== void 0 ? _c : "";
    const selectedColor = (_d = colorFilter === null || colorFilter === void 0 ? void 0 : colorFilter.value) !== null && _d !== void 0 ? _d : "";
    const selectedCategory = (_e = categoryFilter === null || categoryFilter === void 0 ? void 0 : categoryFilter.value) !== null && _e !== void 0 ? _e : "";
    const salesOnly = (_f = salesFilter === null || salesFilter === void 0 ? void 0 : salesFilter.checked) !== null && _f !== void 0 ? _f : false;
    let processed = allProducts.filter((product) => {
        const matchesSearch = product.name.toLowerCase().includes(term);
        const matchesSize = !selectedSize || product.size === selectedSize;
        const matchesColor = !selectedColor || product.color === selectedColor;
        const matchesCategory = !selectedCategory || product.category === selectedCategory;
        const matchesSales = !salesOnly || product.salesStatus;
        return (matchesSearch &&
            matchesSize &&
            matchesColor &&
            matchesCategory &&
            matchesSales);
    });
    if (sortValue === "price-asc") {
        processed = [...processed].sort((a, b) => a.price - b.price);
    }
    if (sortValue === "price-desc") {
        processed = [...processed].sort((a, b) => b.price - a.price);
    }
    if (sortValue === "rating") {
        processed = [...processed].sort((a, b) => b.rating - a.rating);
    }
    if (sortValue === "popularity") {
        processed = [...processed].sort((a, b) => b.popularity - a.popularity);
    }
    visibleProducts = processed;
    currentPage = 1;
    renderCatalog();
}
function resetFilters() {
    if (sizeFilter) {
        sizeFilter.value = "";
    }
    if (colorFilter) {
        colorFilter.value = "";
    }
    if (categoryFilter) {
        categoryFilter.value = "";
    }
    if (salesFilter) {
        salesFilter.checked = false;
    }
    applyFiltersAndSort();
}
function toggleFiltersVisibility() {
    if (!filtersSection || !toggleFiltersButton) {
        return;
    }
    const shouldHide = !filtersSection.classList.contains("is-collapsed");
    filtersSection.classList.toggle("is-collapsed", shouldHide);
    toggleFiltersButton.textContent = shouldHide
        ? "Show Filters"
        : "Hide Filters";
}
function attachEvents() {
    productsContainer === null || productsContainer === void 0 ? void 0 : productsContainer.addEventListener("click", (event) => {
        const target = event.target;
        const card = target.closest("[data-product-id]");
        if (!card) {
            return;
        }
        const product = allProducts.find((item) => item.id === card.dataset.productId);
        if (!product) {
            return;
        }
        if (target.closest("button")) {
            addProductToCart(product);
            return;
        }
        window.location.href = `product.html?id=${encodeURIComponent(product.id)}`;
    });
    bestRatedContainer === null || bestRatedContainer === void 0 ? void 0 : bestRatedContainer.addEventListener("click", (event) => {
        var _a;
        const target = event.target;
        const card = target.closest(".best-set-item");
        const title = (_a = card === null || card === void 0 ? void 0 : card.querySelector("h4")) === null || _a === void 0 ? void 0 : _a.textContent;
        const product = allProducts.find((item) => item.name === title);
        if (product) {
            window.location.href = `product.html?id=${encodeURIComponent(product.id)}`;
        }
    });
    searchButton === null || searchButton === void 0 ? void 0 : searchButton.addEventListener("click", handleProductSearch);
    searchInput === null || searchInput === void 0 ? void 0 : searchInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            handleProductSearch();
        }
    });
    sortSelect === null || sortSelect === void 0 ? void 0 : sortSelect.addEventListener("change", applyFiltersAndSort);
    sizeFilter === null || sizeFilter === void 0 ? void 0 : sizeFilter.addEventListener("change", applyFiltersAndSort);
    colorFilter === null || colorFilter === void 0 ? void 0 : colorFilter.addEventListener("change", applyFiltersAndSort);
    categoryFilter === null || categoryFilter === void 0 ? void 0 : categoryFilter.addEventListener("change", applyFiltersAndSort);
    salesFilter === null || salesFilter === void 0 ? void 0 : salesFilter.addEventListener("change", applyFiltersAndSort);
    clearFiltersButton === null || clearFiltersButton === void 0 ? void 0 : clearFiltersButton.addEventListener("click", resetFilters);
    toggleFiltersButton === null || toggleFiltersButton === void 0 ? void 0 : toggleFiltersButton.addEventListener("click", toggleFiltersVisibility);
    paginationContainer === null || paginationContainer === void 0 ? void 0 : paginationContainer.addEventListener("click", (event) => {
        const target = event.target;
        const pageButton = target.closest("[data-page]");
        const nextButton = target.closest("[data-action='next']");
        const previousButton = target.closest("[data-action='previous']");
        if (pageButton) {
            const nextPage = Number(pageButton.dataset.page);
            if (!Number.isNaN(nextPage)) {
                currentPage = nextPage;
                renderCatalog();
            }
            return;
        }
        if (previousButton && currentPage > 1) {
            currentPage -= 1;
            renderCatalog();
            return;
        }
        if (nextButton) {
            const totalPages = Math.max(1, Math.ceil(visibleProducts.length / PAGE_SIZE));
            if (currentPage < totalPages) {
                currentPage += 1;
                renderCatalog();
            }
        }
    });
}
function initCatalog() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!productsContainer) {
            return;
        }
        try {
            const response = yield fetch("../assets/data.json");
            const payload = (yield response.json());
            allProducts = payload.data;
            visibleProducts = [...allProducts];
            renderBestRated();
            renderCatalog();
            attachEvents();
            initHeaderMenu();
            updateCartCounter();
        }
        catch (error) {
            console.error("Failed to load catalog data", error);
        }
    });
}
initCatalog();
void initLoginModal();
