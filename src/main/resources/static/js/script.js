const API_URL = "http://localhost:8080/api/products";
const CATEGORY_URL = "http://localhost:8080/api/products/categories";

let bagItems = [];
let products = [];
let editingProductId = null;

const jwtToken = localStorage.getItem("jwtToken");
const userRole = localStorage.getItem("userRole");

let currentPage = 1;
const itemsPerPage = 6;

function paginate(items) {
    const totalPages = Math.ceil(items.length / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    return { paginatedItems: items.slice(start, start + itemsPerPage), totalPages };
}

function renderPagination(totalPages) {
    const container = document.querySelector(".pagination");
    container.innerHTML = "";
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement("button");
        btn.innerText = i;
        btn.className = i === currentPage ? "active" : "";
        btn.addEventListener("click", () => { currentPage = i; filterProducts(); });
        container.appendChild(btn);
    }
}

async function loadProducts() {
    try {
        const res = await fetch(API_URL);
        products = await res.json();
        filterProducts();
    } catch (err) { console.error(err); }
}

async function loadCategories() {
    try {
        const res = await fetch(CATEGORY_URL);
        const categories = await res.json();
        const categorySelect = document.getElementById("category-select");
        const modalCategorySelect = document.getElementById("add-category");
        categories.forEach(cat => {
            const option = document.createElement("option");
            option.value = cat;
            option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
            categorySelect.appendChild(option);
            modalCategorySelect.appendChild(option.cloneNode(true));
        });
        categorySelect.addEventListener("change", () => { currentPage = 1; filterProducts(); });
    } catch (err) { console.error(err); }
}

function displayItems(items) {
    const container = document.querySelector(".items-container");
    container.innerHTML = "";
    items.forEach(p => {
        const div = document.createElement("div");
        div.className = "item-container";

        let actions = "";
        if (userRole === "ADMIN") {
            actions += `<div class="edit-delete-row">
                <button class="edit-btn" onclick="editProduct(${p.id})">Edit</button>
                <button class="delete-btn" onclick="deleteProduct(${p.id})">Delete</button>
            </div>`;
        }
        if (userRole === "USER") {
            actions += `<div class="add-to-bag-row">
                <button class="add-to-bag-button" onclick="addToBag(${p.id})">Add to Bag</button>
            </div>`;
        }

        div.innerHTML = `
            <img class="item-img" src=${p.image} alt="item-image">
            <div class="brand-name">${p.title}</div>
            <div class="item-price"><strong>$${p.price}</strong></div>
            <div class="item-actions">${actions}</div>
        `;
        container.appendChild(div);
    });
}

function addToBag(id) {
    bagItems.push(id);
    localStorage.setItem("bagItems", JSON.stringify(bagItems));
    displayAddToBagItems();
}

function displayAddToBagItems() {
    const countEl = document.querySelector(".add-to-bag-count");
    if (bagItems.length > 0) { countEl.style.visibility = "visible"; countEl.innerText = bagItems.length; }
    else { countEl.style.visibility = "hidden"; countEl.innerText = ""; }
}

function updateHeader() {
    const actionBar = document.querySelector(".action_bar");
    const loginLink = actionBar.querySelector(".login-link");
    const bagLink = actionBar.querySelector(".action_container");

    if (userRole === "ADMIN" && bagLink) bagLink.style.display = "none";
    if (jwtToken) {
        if (loginLink) loginLink.remove();
        const logoutLink = document.createElement("a");
        logoutLink.href = "#";
        logoutLink.className = "logout-link";
        logoutLink.innerText = "Logout";
        logoutLink.addEventListener("click", () => { localStorage.clear(); window.location.reload(); });
        actionBar.appendChild(logoutLink);
    }
}

const addBtn = document.getElementById("add-product-btn");
const modal = document.getElementById("add-product-modal");
const closeBtn = document.querySelector(".close-btn");
if (userRole !== "ADMIN") addBtn.style.display = "none";
if (addBtn) addBtn.addEventListener("click", () => modal.style.display = "block");
if (closeBtn) closeBtn.addEventListener("click", () => modal.style.display = "none");
window.addEventListener("click", e => { if (e.target == modal) modal.style.display = "none"; });

async function addProduct() {
    const title = document.getElementById("add-title").value;
    const price = parseFloat(document.getElementById("add-price").value);
    const image = document.getElementById("add-image").value;
    const category = document.getElementById("add-category").value;
    if (!title || !price || !image || !category) return alert("Please fill all fields");

    const data = { title, price, image, category };
    try {
        let res;
        const headers = { "Content-Type": "application/json", "Authorization": `Bearer ${jwtToken}` };
        if (editingProductId) {
            res = await fetch(`${API_URL}/${editingProductId}`, { method: "PUT", headers, body: JSON.stringify(data) });
        } else {
            res = await fetch(API_URL, { method: "POST", headers, body: JSON.stringify(data) });
        }
        if (res.ok) {
            const saved = await res.json();
            if (editingProductId) { products[products.findIndex(p => p.id === editingProductId)] = saved; editingProductId = null; }
            else products.push(saved);
            filterProducts();
            modal.style.display = "none";
            document.getElementById("add-title").value = "";
            document.getElementById("add-price").value = "";
            document.getElementById("add-image").value = "";
            document.getElementById("add-category").value = "";
        } else { alert("Failed to save product"); }
    } catch (err) { console.error(err); }
}

async function deleteProduct(id) {
    if (!confirm("Delete this product?")) return;
    try {
        const res = await fetch(`${API_URL}/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${jwtToken}` } });
        if (res.ok) { products = products.filter(p => p.id !== id); filterProducts(); }
    } catch (err) { console.error(err); }
}

function editProduct(id) {
    const p = products.find(p => p.id === id);
    if (!p) return;
    editingProductId = id;
    document.getElementById("add-title").value = p.title;
    document.getElementById("add-price").value = p.price;
    document.getElementById("add-image").value = p.image;
    document.getElementById("add-category").value = p.category;
    modal.style.display = "flex";
}

const searchInput = document.querySelector(".search_input");
const minPriceInput = document.getElementById("min-price");
const maxPriceInput = document.getElementById("max-price");
const applyPriceBtn = document.getElementById("apply-price-filter");

function filterProducts() {
    const query = searchInput?.value.trim().toLowerCase() || "";
    const selectedCategory = document.getElementById("category-select")?.value || "all";
    const minPrice = parseFloat(minPriceInput.value) || 0;
    const maxPrice = parseFloat(maxPriceInput.value) || Infinity;

    let filtered = products;
    if (selectedCategory !== "all") filtered = filtered.filter(p => p.category === selectedCategory);
    if (query) filtered = filtered.filter(p => p.title.toLowerCase().includes(query));
    filtered = filtered.filter(p => p.price >= minPrice && p.price <= maxPrice);

    const { paginatedItems, totalPages } = paginate(filtered);
    displayItems(paginatedItems);
    renderPagination(totalPages);
}

searchInput?.addEventListener("input", () => { currentPage = 1; filterProducts(); });
applyPriceBtn?.addEventListener("click", () => { currentPage = 1; filterProducts(); });

document.addEventListener("DOMContentLoaded", () => {
    loadProducts();
    loadCategories();
    bagItems = JSON.parse(localStorage.getItem("bagItems")) || [];
    if (userRole === "USER") displayAddToBagItems();
    updateHeader();
});
