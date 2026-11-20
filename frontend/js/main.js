async function loadProducts() {
  const container = document.getElementById('product-list');
  try {
    const res = await fetch(`${API_BASE}/products`);
    const products = await res.json();

    if (!Array.isArray(products) || products.length === 0) {
      container.innerHTML = '<p>No products available.</p>';
      return;
    }

    container.innerHTML = products
      .map(
        (p) => `
        <div class="card">
          <div>
            <img src="${p.image_url}" alt="${p.title}" />
            <h3>${p.title}</h3>
            <p class="price">$${Number(p.price).toFixed(2)}</p>
            <p style="font-size:0.9rem;color:#555;">Stock: ${p.stock}</p>
          </div>
          <div class="row-actions">
            <a class="btn btn-secondary" href="/product.html?id=${p.id}">Details</a>
            <button class="btn add-btn" data-id="${p.id}">Add to Cart</button>
          </div>
        </div>
      `
      )
      .join('');

    document.querySelectorAll('.add-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const prod = products.find((item) => item.id === Number(btn.dataset.id));
        if (prod) {
          addToCart(prod, 1);
          btn.textContent = 'Added!';
          setTimeout(() => (btn.textContent = 'Add to Cart'), 900);
        }
      });
    });
  } catch (err) {
    container.innerHTML = '<p>Failed to load products.</p>';
  }
}

document.addEventListener('DOMContentLoaded', loadProducts);