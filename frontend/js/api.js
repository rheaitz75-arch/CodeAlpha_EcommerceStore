const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

function getUser() {
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
}

function setAuth(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

function getCart() {
  const raw = localStorage.getItem('cart');
  return raw ? JSON.parse(raw) : [];
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateNavCartCount();
}

function addToCart(product, quantity = 1) {
  const cart = getCart();
  const existing = cart.find((item) => item.productId === product.id);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({
      productId: product.id,
      title: product.title,
      price: product.price,
      image_url: product.image_url,
      quantity
    });
  }
  saveCart(cart);
}

function updateNavCartCount() {
  const el = document.getElementById('cart-count');
  if (!el) return;
  const totalQty = getCart().reduce((sum, item) => sum + item.quantity, 0);
  el.textContent = totalQty;
}

function renderNavbar() {
  const header = document.querySelector('header');
  if (!header) return;
  const user = getUser();

  header.innerHTML = `
    <div><a href="/index.html" style="margin-left:0;font-size:1.25rem;font-weight:bold;">ShopEase</a></div>
    <nav>
      <a href="/index.html">Products</a>
      <a href="/cart.html">Cart (<span id="cart-count">0</span>)</a>
      ${
        user
          ? `<span style="margin-left:1rem;color:#93c5fd;">Hi, ${user.name}</span>
             <a href="#" id="logout-link">Logout</a>`
          : `<a href="/login.html">Login / Register</a>`
      }
    </nav>
  `;

  updateNavCartCount();

  const logoutLink = document.getElementById('logout-link');
  if (logoutLink) {
    logoutLink.addEventListener('click', (e) => {
      e.preventDefault();
      clearAuth();
      window.location.href = '/index.html';
    });
  }
}

document.addEventListener('DOMContentLoaded', renderNavbar);