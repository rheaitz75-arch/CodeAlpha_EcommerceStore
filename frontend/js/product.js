async function loadProductDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const container = document.getElementById('product-detail');

  if (!id) {
    container.innerHTML = '<p>Product ID missing.</p>';
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/products/${id}`);
    if (!res.ok) {
      container.innerHTML = '<p>Product not found.</p>';
      return;
    }

    const p = await res.json();
    container.innerHTML = `
      <div class="detail-grid">
        <img src="${p.image_url}" alt="${p.title}" />
        <div>
          <h1>${p.title}</h1>
          <p class="price">$${Number(p.price).toFixed(2)}</p>
          <p style="margin-bottom:1rem;">${p.description}</p>
          <p style="margin-bottom:1rem;"><strong>Available Stock:</strong> ${p.stock}</p>
          <div style="display:flex;gap:0.75rem;align-items:center;">
            <input type="number" id="qty-input" value="1" min="1" max="${p.stock}" style="width:80px;" />
            <button id="add-detail-btn" class="btn">Add to Cart</button>
            <a href="/index.html" class="btn btn-secondary">Back</a>
          </div>
          <p id="detail-msg" class="msg"></p>
        </div>
      </div>
    `;

    document.getElementById('add-detail-btn').addEventListener('click', () => {
      const qty = parseInt(document.getElementById('qty-input').value, 10) || 1;
      addToCart(p, qty);
      document.getElementById('detail-msg').textContent = 'Added to cart!';
    });
  } catch (err) {
    container.innerHTML = '<p>Error loading product details.</p>';
  }
}

document.addEventListener('DOMContentLoaded', loadProductDetail);