const API = '/api';

const productsEl = document.getElementById('products');
const cartBtn = document.getElementById('cart-btn');
const cartModal = document.getElementById('cart-modal');
const loginBtn = document.getElementById('login-btn');
const authModal = document.getElementById('auth-modal');
const checkoutModal = document.getElementById('checkout-modal');
const cartCountEl = document.getElementById('cart-count');
const searchEl = document.getElementById('search');

let products = [];
let cart = JSON.parse(localStorage.getItem('cart') || '[]');
let user = JSON.parse(localStorage.getItem('user') || 'null');

// --- Products ---
async function loadProducts(query='') {
  const res = await fetch(`${API}/products?q=${encodeURIComponent(query)}`);
  products = await res.json();
  renderProducts();
}
function renderProducts() {
  productsEl.innerHTML = products.map(p => `
    <div class="product">
      <img src="${p.image}" alt="${p.title}">
      <div class="product-title">${p.title}</div>
      <div class="product-desc">${p.description}</div>
      <div class="product-price">&#8377;${p.price}</div>
      <div class="product-stock">Stock: ${p.stock}</div>
      <button class="add-cart-btn" ${p.stock<1?'disabled':''} onclick="addToCart('${p.id}')">Add to Cart</button>
    </div>
  `).join('');
}
window.addToCart = function(id) {
  const prod = products.find(p => p.id === id);
  const idx = cart.findIndex(i => i.id === id);
  if(idx>=0) {
    if(cart[idx].qty < prod.stock) cart[idx].qty++;
  } else {
    cart.push({id, qty:1});
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
}
function updateCartCount() {
  cartCountEl.textContent = cart.reduce((sum,i)=>sum+i.qty,0);
}
cartBtn.onclick = showCart;
function showCart() {
  cartModal.innerHTML = `
    <div class="modal-content">
      <h2>Your Cart</h2>
      <ul>
        ${cart.map(item=>{
          const p = products.find(pr=>pr.id===item.id);
          return `<li>${p.title} x${item.qty} <button onclick="removeCart('${item.id}')">Remove</button></li>`;
        }).join('')}
      </ul>
      <input id="coupon-input" placeholder="Coupon code">
      <button onclick="applyCoupon()">Apply Coupon</button>
      <div id="cart-total"></div>
      <button onclick="checkout()" ${cart.length<1?'disabled':''}>Checkout</button>
      <button onclick="closeModal('cart-modal')">Close</button>
    </div>
  `;
  cartModal.classList.remove('hidden');
  renderCartTotal();
}
window.removeCart = function(id) {
  cart = cart.filter(i=>i.id!==id);
  localStorage.setItem('cart', JSON.stringify(cart));
  showCart();
  updateCartCount();
}
function renderCartTotal() {
  let total = 0;
  cart.forEach(item=>{
    const p = products.find(pr=>pr.id===item.id);
    total += p.price * item.qty;
  });
  const discount = window.cartCoupon ? window.cartCoupon.discount : 0;
  document.getElementById('cart-total').innerHTML =
    `Total: &#8377;${total} ${discount?`<br>Discount: -&#8377;${discount}`:''} <br>Payable: &#8377;${total-discount}`;
}
window.applyCoupon = async function() {
  const code = document.getElementById('coupon-input').value.trim();
  if(!code) return;
  let res = await fetch(`${API}/coupon/${code}`);
  if(res.ok) {
    window.cartCoupon = await res.json();
    renderCartTotal();
  } else {
    alert('Invalid coupon');
  }
}
window.checkout = function() {
  if(!user) return showAuth();
  checkoutModal.innerHTML = `
    <div class="modal-content">
      <h2>Checkout</h2>
      <form id="checkout-form">
        <input required name="name" placeholder="Name">
        <input required name="phone" placeholder="Phone">
        <input required name="pincode" placeholder="Pincode">
        <input
