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
const mainImage = document.getElementById("product-main-image");
const thumbnailsContainer = document.getElementById("product-thumbnails");
const productName = document.getElementById("product-name");
const productRatingStars = document.getElementById("product-rating-stars");
const productReviewLabel = document.getElementById("product-review-label");
const productPrice = document.getElementById("product-price");
const productDescription = document.getElementById("product-description");
const productSize = document.getElementById("product-size");
const productColor = document.getElementById("product-color");
const productCategory = document.getElementById("product-category");
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
const reviewForm = document.getElementById("product-review-form");
const reviewMessage = document.getElementById("review-message");
const reviewName = document.getElementById("review-name");
const reviewEmail = document.getElementById("review-email");
const reviewFormMessage = document.getElementById("review-form-message");
const reviewRatingStars = document.getElementById("review-rating-stars");
const DEFAULT_AVATAR = "../img/personPhoto.png";
const PRODUCT_QUERY_KEY = "id";
let allProducts = [];
let currentProduct = null;
let quantity = 1;
let selectedReviewRating = 0;
let reviews = [];
function resolveProductImageUrl(imageUrl) {
    const fileName = imageUrl.split("/").pop();
    return fileName ? `../img/${fileName}` : imageUrl;
}
function getStarsMarkup(rating) {
    const fullStars = Math.round(rating);
    const filled = "&#9733;".repeat(fullStars);
    const empty = "&#9734;".repeat(5 - fullStars);
    return `<span class="stars">${filled}${empty}</span>`;
}
function getAverageReviewRating() {
    var _a;
    if (!reviews.length) {
        return (_a = currentProduct === null || currentProduct === void 0 ? void 0 : currentProduct.rating) !== null && _a !== void 0 ? _a : 0;
    }
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return totalRating / reviews.length;
}
function renderProductRatingSummary() {
    if (!productRatingStars) {
        return;
    }
    productRatingStars.innerHTML = getStarsMarkup(getAverageReviewRating());
}
function getProductDescriptions(name) {
    return [
        `The new ${name} is a bold reimagining of travel essentials, designed to elevate every journey with lightweight construction, durable materials, and practical interior organization.`,
        `Its ergonomic handle, glide spinner wheels, and flexible interior compartments make packing easy and moving through the airport smooth, no matter the destination.`,
    ];
}
function getDetailsText(name) {
    return [
        `${name} is designed for travelers who want reliable performance and a refined silhouette. The hard-shell body protects your belongings while keeping the profile sleek and modern.`,
        `Inside, you get a practical compartment layout, secure straps, and enough space to keep your essentials organized from departure to arrival. The spinner wheels and telescopic handle keep movement smooth on any surface.`,
        `This model balances durability, comfort, and everyday usability, making it a strong fit for short city breaks and longer business trips alike.`,
    ];
}
function getShippingText() {
    return [
        `Orders are processed within 1-2 business days. Once dispatched, delivery time depends on your destination and chosen shipping method.`,
        `You will receive tracking information by email after your parcel leaves the warehouse. Shipping fees and estimated delivery time are displayed during checkout.`,
        `If your order arrives damaged or incomplete, contact support within 48 hours and include your order number together with photos of the package.`,
    ];
}
function getOptionValues(value) {
    return [
        ...new Set(value
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)),
    ];
}
function getProductVariants(products) {
    return products.reduce((variants, product) => {
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
function getSelections() {
    var _a, _b, _c;
    return {
        size: (_a = productSize === null || productSize === void 0 ? void 0 : productSize.value) !== null && _a !== void 0 ? _a : "",
        color: (_b = productColor === null || productColor === void 0 ? void 0 : productColor.value) !== null && _b !== void 0 ? _b : "",
        category: (_c = productCategory === null || productCategory === void 0 ? void 0 : productCategory.value) !== null && _c !== void 0 ? _c : "",
    };
}
function getMatchingVariants(selections) {
    return getProductVariants(allProducts).filter((variant) => {
        return ((!selections.size || variant.size === selections.size) &&
            (!selections.color || variant.color === selections.color) &&
            (!selections.category || variant.category === selections.category));
    });
}
function getUniqueVariantValues(variants, field) {
    return [...new Set(variants.map((variant) => variant[field]))];
}
function updateVariantSelectors() {
    const selections = getSelections();
    const availableSizes = getUniqueVariantValues(getMatchingVariants({
        color: selections.color,
        category: selections.category,
    }), "size");
    const availableColors = getUniqueVariantValues(getMatchingVariants({
        size: selections.size,
        category: selections.category,
    }), "color");
    const availableCategories = getUniqueVariantValues(getMatchingVariants({
        size: selections.size,
        color: selections.color,
    }), "category");
    populateSelect(productSize, availableSizes, availableSizes.indexOf(selections.size) >= 0 ? selections.size : "");
    populateSelect(productColor, availableColors, availableColors.indexOf(selections.color) >= 0 ? selections.color : "");
    populateSelect(productCategory, availableCategories, availableCategories.indexOf(selections.category) >= 0
        ? selections.category
        : "");
}
function getSelectedVariant() {
    var _a;
    const selections = getSelections();
    if (!selections.size || !selections.color || !selections.category) {
        return null;
    }
    return ((_a = getMatchingVariants(selections).find((variant) => variant.size === selections.size &&
        variant.color === selections.color &&
        variant.category === selections.category)) !== null && _a !== void 0 ? _a : null);
}
function populateSelect(select, options, selectedValue) {
    if (!select) {
        return;
    }
    select.innerHTML = [
        `<option value="" disabled ${selectedValue ? "" : "selected"}>Choose option</option>`,
        ...options.map((option) => `<option value="${option}" ${option === selectedValue ? "selected" : ""}>${option}</option>`),
    ].join("");
}
function renderGallery(product) {
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
function renderProductInfo(product) {
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
function renderTextPanels(product) {
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
function renderReviewStars(current = 0) {
    if (!reviewRatingStars) {
        return;
    }
    reviewRatingStars.innerHTML = Array.from({ length: 5 }, (_, index) => {
        const value = index + 1;
        const activeClass = value <= current ? " is-active" : "";
        return `<button class="product-review-form__star${activeClass}" type="button" data-rating="${value}" aria-label="Rate ${value} out of 5"></button>`;
    }).join("");
}
function renderReviews() {
    var _a;
    renderProductRatingSummary();
    if (reviewsTitle) {
        reviewsTitle.textContent = `${reviews.length} review${reviews.length === 1 ? "" : "s"} for ${(_a = currentProduct === null || currentProduct === void 0 ? void 0 : currentProduct.name) !== null && _a !== void 0 ? _a : "this product"}`;
    }
    if (productReviewLabel) {
        productReviewLabel.textContent = `(${reviews.length} Clients Review)`;
    }
    if (!reviewsList) {
        return;
    }
    reviewsList.innerHTML = reviews
        .map((review) => `
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
			`)
        .join("");
}
function renderRelatedProducts() {
    if (!relatedProducts || !currentProduct) {
        return;
    }
    const items = [...allProducts]
        .filter((product) => product.id !== (currentProduct === null || currentProduct === void 0 ? void 0 : currentProduct.id))
        .sort(() => Math.random() - 0.5)
        .slice(0, 4);
    relatedProducts.innerHTML = items
        .map((product) => `
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
			`)
        .join("");
}
function updateQuantity() {
    if (quantityValue) {
        quantityValue.textContent = String(quantity);
    }
}
function showFormMessage(message, isError = false) {
    if (!reviewFormMessage) {
        return;
    }
    reviewFormMessage.textContent = message;
    reviewFormMessage.classList.toggle("is-error", isError);
    reviewFormMessage.classList.toggle("is-success", !isError);
}
function showCartMessage(message) {
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
function switchTab(tab) {
    const buttons = document.querySelectorAll(".product-tabs__button");
    const panels = document.querySelectorAll(".product-tabs__panel");
    buttons.forEach((button) => {
        button.classList.toggle("is-active", button.getAttribute("data-tab") === tab);
    });
    panels.forEach((panel) => {
        panel.classList.toggle("is-active", panel.getAttribute("data-panel") === tab);
    });
}
function attachEvents() {
    quantityDecrease === null || quantityDecrease === void 0 ? void 0 : quantityDecrease.addEventListener("click", () => {
        quantity = Math.max(1, quantity - 1);
        updateQuantity();
    });
    quantityIncrease === null || quantityIncrease === void 0 ? void 0 : quantityIncrease.addEventListener("click", () => {
        quantity += 1;
        updateQuantity();
    });
    [productSize, productColor, productCategory].forEach((select) => {
        select === null || select === void 0 ? void 0 : select.addEventListener("change", () => {
            updateVariantSelectors();
        });
    });
    addToCartButton === null || addToCartButton === void 0 ? void 0 : addToCartButton.addEventListener("click", () => {
        const selectedVariant = getSelectedVariant();
        if (!selectedVariant) {
            showCartMessage("Please choose size, color and category.");
            return;
        }
        addProductToCart(Object.assign(Object.assign({}, selectedVariant.product), { size: selectedVariant.size, color: selectedVariant.color, category: selectedVariant.category }), quantity);
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
    reviewRatingStars === null || reviewRatingStars === void 0 ? void 0 : reviewRatingStars.addEventListener("click", (event) => {
        const target = event.target;
        const button = target.closest("[data-rating]");
        const rating = Number(button === null || button === void 0 ? void 0 : button.dataset.rating);
        if (!Number.isNaN(rating) && rating > 0) {
            selectedReviewRating = rating;
            renderReviewStars(selectedReviewRating);
        }
    });
    reviewForm === null || reviewForm === void 0 ? void 0 : reviewForm.addEventListener("submit", (event) => {
        var _a, _b, _c;
        event.preventDefault();
        const name = (_a = reviewName === null || reviewName === void 0 ? void 0 : reviewName.value.trim()) !== null && _a !== void 0 ? _a : "";
        const email = (_b = reviewEmail === null || reviewEmail === void 0 ? void 0 : reviewEmail.value.trim()) !== null && _b !== void 0 ? _b : "";
        const message = (_c = reviewMessage === null || reviewMessage === void 0 ? void 0 : reviewMessage.value.trim()) !== null && _c !== void 0 ? _c : "";
        const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (!selectedReviewRating || !message || !name || !isEmailValid) {
            showFormMessage("Please complete rating, name, email and review fields.", true);
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
    relatedProducts === null || relatedProducts === void 0 ? void 0 : relatedProducts.addEventListener("click", (event) => {
        const target = event.target;
        const card = target.closest("[data-related-id]");
        const product = allProducts.find((item) => item.id === (card === null || card === void 0 ? void 0 : card.dataset.relatedId));
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
function getSelectedProductId() {
    const params = new URLSearchParams(window.location.search);
    return params.get(PRODUCT_QUERY_KEY);
}
function renderProduct(product) {
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
function initProductPage() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (!mainImage) {
            return;
        }
        try {
            const response = yield fetch("../assets/data.json");
            const payload = (yield response.json());
            allProducts = payload.data;
            const productId = getSelectedProductId();
            const product = (_a = allProducts.find((item) => item.id === productId)) !== null && _a !== void 0 ? _a : allProducts[0];
            if (!product) {
                return;
            }
            renderProduct(product);
            attachEvents();
            updateCartCounter();
        }
        catch (error) {
            console.error("Failed to load product details", error);
        }
    });
}
void initProductPage();
initHeaderMenu();
void initLoginModal();
