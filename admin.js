const API = '/api/admin';
const loginSection = document.getElementById('login-section');
const adminSection = document.getElementById('admin-section');
const logoutBtn = document.getElementById('logout-btn');

let adminJwt = localStorage.getItem('adminJwt') || '';

function showTab(tab) {
  for (let t of ['products', 'coupons', 'stats']) {
    document.getElementById('tab-' + t).classList.add('hidden');
  }
  document.getElementById('tab-' + tab).classList.remove('hidden');
  if (tab === 'products') loadProducts();
  if (tab === 'coupons') loadCoupons();
  if (tab === 'stats') loadStats();
}
window.showTab = showTab;

// --- ADMIN LOGIN ---
document.getElementById('admin-login-form').onsubmit = async function(e) {
  e.preventDefault();
  let fd = new FormData(e.target);
  let res = await fetch(`${API}/login`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({
      email: fd.get('email'),
      password: fd.get('password')
    })
  });
  if (res.ok) {
    let data = await res.json();
    adminJwt = data.token;
    localStorage.setItem('adminJwt', adminJwt);
    loginSection.classList.add('hidden');
    adminSection.classList.remove('hidden');
    showTab('products');
  } else {
    alert('Invalid credentials');
  }
};

logoutBtn.onclick = function() {
  localStorage.removeItem('adminJwt');
  adminJwt = '';
  loginSection.classList.remove('
