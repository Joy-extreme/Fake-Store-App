const API_URL = "http://localhost:8080/api/products";

let bagItems = JSON.parse(localStorage.getItem("bagItems")) || [];
let products = [];

const bagContainer = document.querySelector(".bag-items-container");
const totalPriceEl = document.getElementById("total-price");
const checkoutBtn = document.getElementById("checkout-btn");

// Load all products from API
async function loadProducts() {
    try {
        const response = await fetch(API_URL);
        products = await response.json();
        displayBagItems();
        updateTotal();
    } catch (error) {
        console.error("Error fetching products:", error);
    }
}

// Display bag items on left panel
function displayBagItems() {
    bagContainer.innerHTML = "";

    if (bagItems.length === 0) {
        bagContainer.innerHTML = "<p>Your bag is empty!</p>";
        return;
    }

    bagItems.forEach((productId, index) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const itemDiv = document.createElement("div");
        itemDiv.className = "bag-item";
        itemDiv.innerHTML = `
            <img src="${product.image}" alt="${product.title}" class="bag-item-img">
            <div class="bag-item-info">
                <h4>${product.title}</h4>
                <p>Price: $${product.price}</p>
                <button class="remove-btn" onclick="removeFromBag(${index})">Remove</button>
            </div>
        `;
        bagContainer.appendChild(itemDiv);
    });
}

// Remove an item from the bag
function removeFromBag(index) {
    bagItems.splice(index, 1);
    localStorage.setItem("bagItems", JSON.stringify(bagItems));
    displayBagItems();
    updateTotal();
}

// Update total price
function updateTotal() {
    let total = 0;
    bagItems.forEach(productId => {
        const product = products.find(p => p.id === productId);
        if (product) total += product.price;
    });
    totalPriceEl.innerText = total.toFixed(2);
}

// Checkout
if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
        if (bagItems.length === 0) {
            alert("Your bag is empty!");
        } else {
            alert(`Proceeding to checkout! Total: $${totalPriceEl.innerText}`);
        }
    });
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
    loadProducts();
});
