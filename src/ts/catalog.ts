import { addProductToCart, updateCartCounter } from "./cart.js";
import { initHeaderMenu } from "./header.js";
import { initLoginModal } from "./login.js";

type Product = {
  id: string;
  imageUrl: string;
  name: string;
  price: number;
  salesStatus: boolean;
  rating: number;
  popularity: number;
  size: string;
  color: string;
  category: string;
};

type ProductsResponse = {
  data: Product[];
};

const productsContainer = document.getElementById("catalog-products");
const bestRatedContainer = document.getElementById("best-rated-products");
const paginationContainer = document.getElementById("catalog-pagination");
const resultCount = document.getElementById("catalog-result-count");
const filtersSection = document.querySelector(
  ".catalog-filters",
) as HTMLElement | null;
const searchInput = document.getElementById(
  "catalog-search",
) as HTMLInputElement | null;
const sortSelect = document.getElementById(
  "catalog-sort",
) as HTMLSelectElement | null;
const sizeFilter = document.getElementById(
  "catalog-filter-size",
) as HTMLSelectElement | null;
const colorFilter = document.getElementById(
  "catalog-filter-color",
) as HTMLSelectElement | null;
const categoryFilter = document.getElementById(
  "catalog-filter-category",
) as HTMLSelectElement | null;
const salesFilter = document.getElementById(
  "catalog-filter-sales",
) as HTMLInputElement | null;
const clearFiltersButton = document.getElementById(
  "catalog-clear-filters",
) as HTMLButtonElement | null;
const toggleFiltersButton = document.getElementById(
  "catalog-toggle-filters",
) as HTMLButtonElement | null;
const searchButton = document.getElementById(
  "catalog-search-button",
) as HTMLButtonElement | null;
const searchFeedback = document.getElementById("catalog-search-feedback");

const PAGE_SIZE = 12;

let allProducts: Product[] = [];
let visibleProducts: Product[] = [];
let currentPage = 1;

function resolveProductImageUrl(imageUrl: string): string {
  const fileName = imageUrl.split("/").pop();

  return fileName ? `../img/${fileName}` : imageUrl;
}

function getStarMarkup(rating: number): string {
  const fullStars = Math.round(rating);
  const filled = "&#9733;".repeat(fullStars);
  const empty = "&#9734;".repeat(5 - fullStars);

  return `<span class="stars" aria-label="Rating ${rating} out of 5">${filled}${empty}</span>`;
}

function renderResultCount(): void {
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

function renderCatalogProducts(): void {
  if (!productsContainer) {
    return;
  }

  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = visibleProducts.slice(start, start + PAGE_SIZE);

  productsContainer.innerHTML = pageItems
    .map(
      (product) => `
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
		`,
    )
    .join("");
}

function renderBestRated(): void {
  if (!bestRatedContainer) {
    return;
  }

  const bestRated = [...allProducts]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);

  bestRatedContainer.innerHTML = bestRated
    .map(
      (product) => `
			<article class="best-set-item">
        <img src="${resolveProductImageUrl(product.imageUrl)}" alt="${product.name}" />
				<div>
					<h4>${product.name}</h4>
					${getStarMarkup(product.rating)}
					<p>$${product.price}</p>
				</div>
			</article>
		`,
    )
    .join("");
}

function renderPagination(): void {
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

function showSearchFeedback(message: string): void {
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

function handleProductSearch(): void {
  const term = searchInput?.value.trim().toLowerCase() ?? "";

  if (!term) {
    showSearchFeedback("Enter a product name to search.");
    return;
  }

  const matchedProduct = allProducts.find((product) =>
    product.name.toLowerCase().includes(term),
  );

  if (!matchedProduct) {
    showSearchFeedback("Product not found.");
    return;
  }

  window.location.href = `product.html?id=${encodeURIComponent(matchedProduct.id)}`;
}

function renderCatalog(): void {
  renderCatalogProducts();
  renderResultCount();
  renderPagination();
}

function applyFiltersAndSort(): void {
  const term = searchInput?.value.trim().toLowerCase() ?? "";
  const sortValue = sortSelect?.value ?? "default";
  const selectedSize = sizeFilter?.value ?? "";
  const selectedColor = colorFilter?.value ?? "";
  const selectedCategory = categoryFilter?.value ?? "";
  const salesOnly = salesFilter?.checked ?? false;

  let processed = allProducts.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(term);
    const matchesSize = !selectedSize || product.size === selectedSize;
    const matchesColor = !selectedColor || product.color === selectedColor;
    const matchesCategory =
      !selectedCategory || product.category === selectedCategory;
    const matchesSales = !salesOnly || product.salesStatus;

    return (
      matchesSearch &&
      matchesSize &&
      matchesColor &&
      matchesCategory &&
      matchesSales
    );
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

function resetFilters(): void {
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

function toggleFiltersVisibility(): void {
  if (!filtersSection || !toggleFiltersButton) {
    return;
  }

  const shouldHide = !filtersSection.classList.contains("is-collapsed");

  filtersSection.classList.toggle("is-collapsed", shouldHide);

  toggleFiltersButton.textContent = shouldHide
    ? "Show Filters"
    : "Hide Filters";
}

function attachEvents(): void {
  productsContainer?.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    const card = target.closest("[data-product-id]") as HTMLElement | null;

    if (!card) {
      return;
    }

    const product = allProducts.find(
      (item) => item.id === card.dataset.productId,
    );

    if (!product) {
      return;
    }

    if (target.closest("button")) {
      addProductToCart(product);
      return;
    }

    window.location.href = `product.html?id=${encodeURIComponent(product.id)}`;
  });

  bestRatedContainer?.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    const card = target.closest(".best-set-item") as HTMLElement | null;
    const title = card?.querySelector("h4")?.textContent;
    const product = allProducts.find((item) => item.name === title);

    if (product) {
      window.location.href = `product.html?id=${encodeURIComponent(product.id)}`;
    }
  });

  searchButton?.addEventListener("click", handleProductSearch);
  searchInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleProductSearch();
    }
  });
  sortSelect?.addEventListener("change", applyFiltersAndSort);
  sizeFilter?.addEventListener("change", applyFiltersAndSort);
  colorFilter?.addEventListener("change", applyFiltersAndSort);
  categoryFilter?.addEventListener("change", applyFiltersAndSort);
  salesFilter?.addEventListener("change", applyFiltersAndSort);
  clearFiltersButton?.addEventListener("click", resetFilters);
  toggleFiltersButton?.addEventListener("click", toggleFiltersVisibility);

  paginationContainer?.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    const pageButton = target.closest("[data-page]") as HTMLElement | null;
    const nextButton = target.closest(
      "[data-action='next']",
    ) as HTMLElement | null;
    const previousButton = target.closest(
      "[data-action='previous']",
    ) as HTMLElement | null;

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
      const totalPages = Math.max(
        1,
        Math.ceil(visibleProducts.length / PAGE_SIZE),
      );

      if (currentPage < totalPages) {
        currentPage += 1;
        renderCatalog();
      }
    }
  });
}

async function initCatalog(): Promise<void> {
  if (!productsContainer) {
    return;
  }

  try {
    const response = await fetch("../assets/data.json");
    const payload = (await response.json()) as ProductsResponse;

    allProducts = payload.data;
    visibleProducts = [...allProducts];

    renderBestRated();
    renderCatalog();
    attachEvents();
    initHeaderMenu();
    updateCartCounter();
  } catch (error) {
    console.error("Failed to load catalog data", error);
  }
}

initCatalog();
void initLoginModal();
