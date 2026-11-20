function renderCart() {
  const container = document.getElementById('cart-content');
  const cart = getCart();

  if (cart.length === 0) {
    container.innerHTML = '<p>Your cart is empty. <a href="/index.html">Browse products</a></p>';
    return;
  }

  let total = 0;
  const rows = cart
    .map((item, idx) => {
      const subtotal = item.price * item.quantity;
      total += subtotal;
      return `
        <tr>
          <td>${item.title}</td>
          <td>$${Number(item.price).toFixed(2)}</td>
          <td>${item.quantity}</td>
          <td>$${subtotal.toFixed(2)}</td>
          <td><button class="btn btn-danger remove-item" data-idx="${idx}">Remove</button></td>
        </tr>
      `;
    })
    .join('');

  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Product</th>
          <th>Price</th>
          <th>Qty</th>
          <th>Subtotal</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <h3>Total: $${total.toFixed(2)}</h3>
    <div class="row-actions">
      <button id="checkout-btn" class="btn">Place Order</button>
    </div>
  `;

  document.querySelectorAll('.remove-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      const updated = getCart();
      updated.splice(Number(btn.dataset.idx), 1);
      saveCart(updated);
      renderCart();
    });
  });

  document.getElementById('checkout-btn').addEventListener('click', placeOrder);
}

async function placeOrder() {
  const msgEl = document.getElementById('order-msg');
  const token = getToken();
  if (!token) {
    msgEl.style.color = '#dc2626';
    msgEl.innerHTML = 'Please <a href="/login.html">login</a> before placing an order.';
    return;
  }

  const cart = getCart();
  const payload = {
    items: cart.map((i) => ({ productId: i.productId, quantity: i.quantity }))
  };

  try {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      msgEl.style.color = '#dc2626';
      msgEl.textContent = data.error || 'Order failed.';
      return;
    }

    saveCart([]);
    renderCart();
    msgEl.style.color = '#15803d';
    msgEl.textContent = `Order #${data.orderId} placed! Total: $${Number(data.totalAmount).toFixed(2)}`;
    loadMyOrders();
  } catch (err) {
    msgEl.style.color = '#dc2626';
    msgEl.textContent = 'Network error while placing order.';
  }
}

async function loadMyOrders() {
  const ordersEl = document.getElementById('orders-list');
  const token = getToken();
  if (!token) return;

  try {
    const res = await fetch(`${API_BASE}/orders/my`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const orders = await res.json();

    if (!Array.isArray(orders) || orders.length === 0) {
      ordersEl.innerHTML = '<p>No orders placed yet.</p>';
      return;
    }

    ordersEl.innerHTML = `
      <table>
        <thead>
          <tr><th>Order ID</th><th>Total</th><th>Status</th><th>Date</th></tr>
        </thead>
        <tbody>
          ${orders
            .map(
              (o) => `
              <tr>
                <td>#${o.id}</td>
                <td>$${Number(o.total_amount).toFixed(2)}</td>
                <td>${o.status}</td>
                <td>${new Date(o.created_at).toLocaleString()}</td>
              </tr>
            `
            )
            .join('')}
        </tbody>
      </table>
    `;
  } catch (err) {
    ordersEl.innerHTML = '<p>Could not load orders.</p>';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderCart();
  loadMyOrders();
});