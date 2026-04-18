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
const selectedProductsContainer = document.getElementById("products");
const newProductsContainer = document.getElementById("new-products");
const travelSlider = document.getElementById("travel-slider");
const travelSlides = [
    {
        imageUrl: "./img/suitcaseN/suitcaseN1.png",
        title: "Duis vestibulum elit vel neque.",
        description: "Duis vestibulum vel neque pharetra vulputate. Quisque scelerisque nisi.",
    },
    {
        imageUrl: "./img/suitcaseN/suitcaseN2.png",
        title: "Neque vestibulum elit nequvel.",
        description: "Curabitur vulputate arcu odio, ac facilisis diam accumsan ut sed imperdiet.",
    },
    {
        imageUrl: "./img/suitcaseN/suitcaseN3.png",
        title: "Elituis stibulum elit velneque.",
        description: "Quisque varius eget urna sit amet luctus. Suspendisse potenti curabitur.",
    },
    {
        imageUrl: "./img/suitcaseN/suitcaseN4.png",
        title: "Vel vestibulum elit tuvel euqen.",
        description: "Lightweight cases, refined details and strong silhouettes for every route.",
    },
];
let travelSliderInterval = null;
let currentTravelOffset = 0;
function renderProducts(products, container, buttonLabel, buttonAction) {
    if (!container) {
        return;
    }
    container.innerHTML = products
        .map((p) => `
    <article class="product-card" data-product-id="${p.id}">
      <div class="product-card__media">
        ${p.salesStatus ? '<span class="product-card__badge">SALE</span>' : ""}
        <img src="${p.imageUrl}" alt="${p.name}" />
      </div>
      <div class="product-card__body">
        <h3>${p.name}</h3>
        <p class="price">$${p.price}</p>
        <button class="btn" type="button" data-button-action="${buttonAction}">${buttonLabel}</button>
      </div>
    </article>
  `)
        .join("");
}
function navigateToProduct(productId) {
    window.location.href = `html/product.html?id=${encodeURIComponent(productId)}`;
}
function attachProductCardEvents(container, products) {
    if (!container) {
        return;
    }
    container.addEventListener("click", (event) => {
        var _a;
        const target = event.target;
        const card = target.closest("[data-product-id]");
        if (!card) {
            return;
        }
        const product = products.find((item) => item.id === card.dataset.productId);
        if (!product) {
            return;
        }
        if (target.closest("button")) {
            const action = (_a = target.closest("button")) === null || _a === void 0 ? void 0 : _a.dataset.buttonAction;
            if (action === "view-product") {
                navigateToProduct(product.id);
                return;
            }
            addProductToCart(product);
            return;
        }
        navigateToProduct(product.id);
    });
}
function getRandomProducts(products, count) {
    const shuffledProducts = [...products].sort(() => Math.random() - 0.5);
    return shuffledProducts.slice(0, count);
}
function renderTravelSlider() {
    if (!travelSlider) {
        return;
    }
    const repeatedSlides = [...travelSlides, ...travelSlides];
    travelSlider.innerHTML = `
    <div class="travel-slider__track">
      ${repeatedSlides
        .map((slide) => `
            <article class="travel-slide">
              <img src="${slide.imageUrl}" alt="${slide.title}" />
              <div class="travel-slide__content">
                <h3>${slide.title}</h3>
                <p>${slide.description}</p>
              </div>
            </article>
          `)
        .join("")}
    </div>
  `;
    currentTravelOffset = 0;
    updateTravelSliderPosition(false);
}
function updateTravelSliderPosition(withTransition) {
    const track = travelSlider === null || travelSlider === void 0 ? void 0 : travelSlider.querySelector(".travel-slider__track");
    const firstSlide = track === null || track === void 0 ? void 0 : track.querySelector(".travel-slide");
    if (!track || !firstSlide) {
        return;
    }
    const trackStyles = window.getComputedStyle(track);
    const gap = Number.parseFloat(trackStyles.gap || "0") || 0;
    const slideWidth = firstSlide.getBoundingClientRect().width;
    const offset = currentTravelOffset * (slideWidth + gap);
    track.style.transition = withTransition ? "transform 0.7s ease" : "none";
    track.style.transform = `translateX(-${offset}px)`;
}
function moveTravelSlider() {
    const track = travelSlider === null || travelSlider === void 0 ? void 0 : travelSlider.querySelector(".travel-slider__track");
    if (!track) {
        return;
    }
    currentTravelOffset += 1;
    updateTravelSliderPosition(true);
    if (currentTravelOffset < travelSlides.length) {
        return;
    }
    window.setTimeout(() => {
        currentTravelOffset = 0;
        updateTravelSliderPosition(false);
    }, 720);
}
function startTravelSlider() {
    if (!travelSlider) {
        return;
    }
    if (travelSliderInterval !== null) {
        window.clearInterval(travelSliderInterval);
    }
    renderTravelSlider();
    travelSliderInterval = window.setInterval(() => {
        moveTravelSlider();
    }, 4200);
}
function initTravelSlider() {
    if (!travelSlider) {
        return;
    }
    startTravelSlider();
    travelSlider.addEventListener("mouseenter", () => {
        if (travelSliderInterval !== null) {
            window.clearInterval(travelSliderInterval);
            travelSliderInterval = null;
        }
    });
    travelSlider.addEventListener("mouseleave", () => {
        if (travelSliderInterval === null) {
            startTravelSlider();
        }
    });
    window.addEventListener("resize", () => {
        updateTravelSliderPosition(false);
    });
}
function initProducts() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch("./assets/data.json");
            const payload = (yield response.json());
            const selectedProducts = payload.data.slice(0, 4);
            const newProducts = getRandomProducts(payload.data, 4);
            renderProducts(selectedProducts, selectedProductsContainer, "Add To Cart", "add-to-cart");
            renderProducts(newProducts, newProductsContainer, "View Product", "view-product");
            attachProductCardEvents(selectedProductsContainer, selectedProducts);
            attachProductCardEvents(newProductsContainer, newProducts);
            updateCartCounter();
        }
        catch (error) {
            console.error("Failed to load products", error);
        }
    });
}
initTravelSlider();
initProducts();
initHeaderMenu();
void initLoginModal();
