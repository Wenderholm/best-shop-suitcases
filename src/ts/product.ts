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
  size: string;
  color: string;
  category: string;
  popularity: number;
};

type ProductsResponse = {
  data: Product[];
};

type Review = {
  name: string;
  date: string;
  rating: number;
  text: string;
};

type ProductVariant = {
  product: Product;
  size: string;
  color: string;
  category: string;
};

type ProductSelections = {
  size: string;
  color: string;
  category: string;
};

const mainImage = document.getElementById(
  "product-main-image",
) as HTMLImageElement | null;
const thumbnailsContainer = document.getElementById("product-thumbnails");
const productName = document.getElementById("product-name");
const productRatingStars = document.getElementById("product-rating-stars");
const productReviewLabel = document.getElementById("product-review-label");
const productPrice = document.getElementById("product-price");
const productDescription = document.getElementById("product-description");
const productSize = document.getElementById(
  "product-size",
) as HTMLSelectElement | null;
const productColor = document.getElementById(
  "product-color",
) as HTMLSelectElement | null;
const productCategory = document.getElementById(
  "product-category",
) as HTMLSelectElement | null;
const quantityValue = document.getElementById("product-quantity-value");
const quantityDecrease = document.getElementById("product-quantity-decrease");
const quantityIncrease = document.getElementById("product-quantity-increase");
const addToCartButton = document.getElementById("product-add-to-cart");
const cartMessage = document.getElementById("product-cart-message");
const detailsPanel = document.getElementById("product-details-panel");
const shippingPanel = document.getElementById("product-shipping-panel");
const reviewsTitle = document.getElementById("product-reviews-title");
const reviewsList = document.getElementById("product-reviews-list");
const relatedProducts = document.getElementById("product-related-products");
const reviewForm = document.getElementById(
  "product-review-form",
) as HTMLFormElement | null;
const reviewMessage = document.getElementById(
  "review-message",
) as HTMLTextAreaElement | null;
const reviewName = document.getElementById(
  "review-name",
) as HTMLInputElement | null;
const reviewEmail = document.getElementById(
  "review-email",
) as HTMLInputElement | null;
const reviewFormMessage = document.getElementById("review-form-message");
const reviewRatingStars = document.getElementById("review-rating-stars");

const DEFAULT_AVATAR = "../img/personPhoto.png";
const PRODUCT_QUERY_KEY = "id";

let allProducts: Product[] = [];
let currentProduct: Product | null = null;
let quantity = 1;
let selectedReviewRating = 0;
let reviews: Review[] = [];

function resolveProductImageUrl(imageUrl: string): string {
  const fileName = imageUrl.split("/").pop();

  return fileName ? `../img/${fileName}` : imageUrl;
}

function getStarsMarkup(rating: number): string {
  const fullStars = Math.round(rating);
  const filled = "&#9733;".repeat(fullStars);
  const empty = "&#9734;".repeat(5 - fullStars);

  return `<span class="stars">${filled}${empty}</span>`;
}

function getAverageReviewRating(): number {
  if (!reviews.length) {
    return currentProduct?.rating ?? 0;
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);

  return totalRating / reviews.length;
}

function renderProductRatingSummary(): void {
  if (!productRatingStars) {
    return;
  }

  productRatingStars.innerHTML = getStarsMarkup(getAverageReviewRating());
}

function getProductDescriptions(name: string): string[] {
  return [
    `The new ${name} is a bold reimagining of travel essentials, designed to elevate every journey with lightweight construction, durable materials, and practical interior organization.`,
    `Its ergonomic handle, glide spinner wheels, and flexible interior compartments make packing easy and moving through the airport smooth, no matter the destination.`,
  ];
}

function getDetailsText(name: string): string[] {
  return [
    `${name} is designed for travelers who want reliable performance and a refined silhouette. The hard-shell body protects your belongings while keeping the profile sleek and modern.`,
    `Inside, you get a practical compartment layout, secure straps, and enough space to keep your essentials organized from departure to arrival. The spinner wheels and telescopic handle keep movement smooth on any surface.`,
    `This model balances durability, comfort, and everyday usability, making it a strong fit for short city breaks and longer business trips alike.`,
  ];
}

function getShippingText(): string[] {
  return [
    `Orders are processed within 1-2 business days. Once dispatched, delivery time depends on your destination and chosen shipping method.`,
    `You will receive tracking information by email after your parcel leaves the warehouse. Shipping fees and estimated delivery time are displayed during checkout.`,
    `If your order arrives damaged or incomplete, contact support within 48 hours and include your order number together with photos of the package.`,
  ];
}

function getOptionValues(value: string): string[] {
  return [
    ...new Set(
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];
}

function getProductVariants(products: Product[]): ProductVariant[] {
  return products.reduce<ProductVariant[]>((variants, product) => {
    const sizes = getOptionValues(product.size);
    const colors = getOptionValues(product.color);
    const categories = getOptionValues(product.category);

    sizes.forEach((size) => {
      colors.forEach((color) => {
        categories.forEach((category) => {
          variants.push({
            product,
            size,
            color,
            category,
          });
        });
      });
    });

    return variants;
  }, []);
}

function getSelections(): ProductSelections {
  return {
    size: productSize?.value ?? "",
    color: productColor?.value ?? "",
    category: productCategory?.value ?? "",
  };
}

function getMatchingVariants(
  selections: Partial<ProductSelections>,
): ProductVariant[] {
  return getProductVariants(allProducts).filter((variant) => {
    return (
      (!selections.size || variant.size === selections.size) &&
      (!selections.color || variant.color === selections.color) &&
      (!selections.category || variant.category === selections.category)
    );
  });
}

function getUniqueVariantValues(
  variants: ProductVariant[],
  field: keyof ProductSelections,
): string[] {
  return [...new Set(variants.map((variant) => variant[field]))];
}

function updateVariantSelectors(): void {
  const selections = getSelections();

  const availableSizes = getUniqueVariantValues(
    getMatchingVariants({
      color: selections.color,
      category: selections.category,
    }),
    "size",
  );
  const availableColors = getUniqueVariantValues(
    getMatchingVariants({
      size: selections.size,
      category: selections.category,
    }),
    "color",
  );
  const availableCategories = getUniqueVariantValues(
    getMatchingVariants({
      size: selections.size,
      color: selections.color,
    }),
    "category",
  );

  populateSelect(
    productSize,
    availableSizes,
    availableSizes.indexOf(selections.size) >= 0 ? selections.size : "",
  );
  populateSelect(
    productColor,
    availableColors,
    availableColors.indexOf(selections.color) >= 0 ? selections.color : "",
  );
  populateSelect(
    productCategory,
    availableCategories,
    availableCategories.indexOf(selections.category) >= 0
      ? selections.category
      : "",
  );
}

function getSelectedVariant(): ProductVariant | null {
  const selections = getSelections();

  if (!selections.size || !selections.color || !selections.category) {
    return null;
  }

  return (
    getMatchingVariants(selections).find(
      (variant) =>
        variant.size === selections.size &&
        variant.color === selections.color &&
        variant.category === selections.category,
    ) ?? null
  );
}

function populateSelect(
  select: HTMLSelectElement | null,
  options: string[],
  selectedValue: string,
): void {
  if (!select) {
    return;
  }

  select.innerHTML = [
    `<option value="" disabled ${selectedValue ? "" : "selected"}>Choose option</option>`,
    ...options.map(
      (option) =>
        `<option value="${option}" ${option === selectedValue ? "selected" : ""}>${option}</option>`,
    ),
  ].join("");
}

function renderGallery(product: Product): void {
  const imageUrl = resolveProductImageUrl(product.imageUrl);

  if (mainImage) {
    mainImage.src = imageUrl;
    mainImage.alt = product.name;
  }

  if (!thumbnailsContainer) {
    return;
  }

  thumbnailsContainer.innerHTML = Array.from({ length: 4 }, (_, index) => {
    return `
			<button class="product-gallery__thumb" type="button" aria-label="${product.name} thumbnail ${index + 1}">
				<img src="${imageUrl}" alt="${product.name} thumbnail ${index + 1}" />
			</button>
		`;
  }).join("");
}

function renderProductInfo(product: Product): void {
  if (productName) {
    productName.textContent = product.name;
  }

  renderProductRatingSummary();

  if (productPrice) {
    productPrice.textContent = `$${product.price}`;
  }

  if (productDescription) {
    productDescription.innerHTML = getProductDescriptions(product.name)
      .map((paragraph) => `<p>${paragraph}</p>`)
      .join("");
  }
}

function renderTextPanels(product: Product): void {
  if (detailsPanel) {
    detailsPanel.innerHTML = getDetailsText(product.name)
      .map((paragraph) => `<p>${paragraph}</p>`)
      .join("");
  }

  if (shippingPanel) {
    shippingPanel.innerHTML = getShippingText()
      .map((paragraph) => `<p>${paragraph}</p>`)
      .join("");
  }
}

function renderReviewStars(current = 0): void {
  if (!reviewRatingStars) {
    return;
  }

  reviewRatingStars.innerHTML = Array.from({ length: 5 }, (_, index) => {
    const value = index + 1;
    const activeClass = value <= current ? " is-active" : "";

    return `<button class="product-review-form__star${activeClass}" type="button" data-rating="${value}" aria-label="Rate ${value} out of 5"></button>`;
  }).join("");
}

function renderReviews(): void {
  renderProductRatingSummary();

  if (reviewsTitle) {
    reviewsTitle.textContent = `${reviews.length} review${reviews.length === 1 ? "" : "s"} for ${currentProduct?.name ?? "this product"}`;
  }

  if (productReviewLabel) {
    productReviewLabel.textContent = `(${reviews.length} Clients Review)`;
  }

  if (!reviewsList) {
    return;
  }

  reviewsList.innerHTML = reviews
    .map(
      (review) => `
				<article class="product-review-card">
					<img src="${DEFAULT_AVATAR}" alt="${review.name}" />
					<div class="product-review-card__content">
						<div class="product-review-card__meta">
							<div>
								<strong>${review.name}</strong>
								<span>/ ${review.date}</span>
							</div>
							${getStarsMarkup(review.rating)}
						</div>
						<p>${review.text}</p>
					</div>
				</article>
			`,
    )
    .join("");
}

function renderRelatedProducts(): void {
  if (!relatedProducts || !currentProduct) {
    return;
  }

  const items = [...allProducts]
    .filter((product) => product.id !== currentProduct?.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 4);

  relatedProducts.innerHTML = items
    .map(
      (product) => `
				<article class="product-card" data-related-id="${product.id}">
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

function updateQuantity(): void {
  if (quantityValue) {
    quantityValue.textContent = String(quantity);
  }
}

function showFormMessage(message: string, isError = false): void {
  if (!reviewFormMessage) {
    return;
  }

  reviewFormMessage.textContent = message;
  reviewFormMessage.classList.toggle("is-error", isError);
  reviewFormMessage.classList.toggle("is-success", !isError);
}

function showCartMessage(message: string): void {
  if (!cartMessage) {
    return;
  }

  cartMessage.textContent = message;
  window.setTimeout(() => {
    if (cartMessage.textContent === message) {
      cartMessage.textContent = "";
    }
  }, 2500);
}

function switchTab(tab: string): void {
  const buttons = document.querySelectorAll(".product-tabs__button");
  const panels = document.querySelectorAll(".product-tabs__panel");

  buttons.forEach((button) => {
    button.classList.toggle(
      "is-active",
      button.getAttribute("data-tab") === tab,
    );
  });

  panels.forEach((panel) => {
    panel.classList.toggle(
      "is-active",
      panel.getAttribute("data-panel") === tab,
    );
  });
}

function attachEvents(): void {
  quantityDecrease?.addEventListener("click", () => {
    quantity = Math.max(1, quantity - 1);
    updateQuantity();
  });

  quantityIncrease?.addEventListener("click", () => {
    quantity += 1;
    updateQuantity();
  });

  [productSize, productColor, productCategory].forEach((select) => {
    select?.addEventListener("change", () => {
      updateVariantSelectors();
    });
  });

  addToCartButton?.addEventListener("click", () => {
    const selectedVariant = getSelectedVariant();

    if (!selectedVariant) {
      showCartMessage("Please choose size, color and category.");
      return;
    }

    addProductToCart(
      {
        ...selectedVariant.product,
        size: selectedVariant.size,
        color: selectedVariant.color,
        category: selectedVariant.category,
      },
      quantity,
    );

    showCartMessage("Product added to cart.");
  });

  document.querySelectorAll(".product-tabs__button").forEach((button) => {
    button.addEventListener("click", () => {
      const tab = button.getAttribute("data-tab");

      if (tab) {
        switchTab(tab);
      }
    });
  });

  reviewRatingStars?.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    const button = target.closest("[data-rating]") as HTMLElement | null;
    const rating = Number(button?.dataset.rating);

    if (!Number.isNaN(rating) && rating > 0) {
      selectedReviewRating = rating;
      renderReviewStars(selectedReviewRating);
    }
  });

  reviewForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = reviewName?.value.trim() ?? "";
    const email = reviewEmail?.value.trim() ?? "";
    const message = reviewMessage?.value.trim() ?? "";
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!selectedReviewRating || !message || !name || !isEmailValid) {
      showFormMessage(
        "Please complete rating, name, email and review fields.",
        true,
      );
      return;
    }

    reviews.unshift({
      name,
      date: new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      rating: selectedReviewRating,
      text: message,
    });

    renderReviews();
    reviewForm.reset();
    selectedReviewRating = 0;
    renderReviewStars();
    showFormMessage("Review submitted successfully.");
  });

  relatedProducts?.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    const card = target.closest("[data-related-id]") as HTMLElement | null;
    const product = allProducts.find(
      (item) => item.id === card?.dataset.relatedId,
    );

    if (!card || !product) {
      return;
    }

    if (target.closest("button")) {
      addProductToCart(product);
      showCartMessage("Related product added to cart.");
      return;
    }

    window.location.href = `product.html?id=${encodeURIComponent(product.id)}`;
  });
}

function getSelectedProductId(): string | null {
  const params = new URLSearchParams(window.location.search);

  return params.get(PRODUCT_QUERY_KEY);
}

function renderProduct(product: Product): void {
  currentProduct = product;
  document.title = `Best Shop - ${product.name}`;
  renderGallery(product);
  renderProductInfo(product);
  renderTextPanels(product);
  renderRelatedProducts();
  updateVariantSelectors();
  quantity = 1;
  updateQuantity();
  reviews = [
    {
      name: "Ella Harper",
      date: "June 11, 2025",
      rating: 4,
      text: "Proin iaculis nibh vitae lectus mollis bibendum. Quisque varius eget urna sit amet luctus. Suspendisse potenti curabitur ac placerat est, sit amet sodales risus.",
    },
  ];
  renderReviews();
  renderReviewStars();
}

async function initProductPage(): Promise<void> {
  if (!mainImage) {
    return;
  }

  try {
    const response = await fetch("../assets/data.json");
    const payload = (await response.json()) as ProductsResponse;

    allProducts = payload.data;

    const productId = getSelectedProductId();
    const product =
      allProducts.find((item) => item.id === productId) ?? allProducts[0];

    if (!product) {
      return;
    }

    renderProduct(product);
    attachEvents();
    updateCartCounter();
  } catch (error) {
    console.error("Failed to load product details", error);
  }
}

void initProductPage();
initHeaderMenu();
void initLoginModal();
