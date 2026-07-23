'use strict';
/* ============================================================
   LUXE SHOP v2 — app2.js
   Auth + Shop + Admin Panel full logic
   ============================================================ */

/* ── DEMO USERS ─────────────────────────────────────────────── */
const USERS_DB = [
  { id:1, rol:'admin',   nombre:'Super',  apellido:'Admin',    email:'admin@luxeshop.com',   pass:'admin123',   telefono:'+591 700-00001' },
  { id:2, rol:'cliente', nombre:'María',  apellido:'González', email:'cliente@email.com',    pass:'cliente123', telefono:'+591 700-00002' },
  { id:3, rol:'cliente', nombre:'Carlos', apellido:'Mendoza',  email:'carlos@email.com',     pass:'demo123',    telefono:'+591 700-00003' },
  { id:4, rol:'cliente', nombre:'Lucía',  apellido:'Vargas',   email:'lucia@email.com',      pass:'demo123',    telefono:'+591 700-00004' },
];

/* ── PRODUCTS ────────────────────────────────────────────────── */
let PRODUCTS = [
  {id:1,  nombre:'Chaqueta de Cuero Milano',  sku:'ROP-001', cat:'ropa',       precio:289.99, precioAnterior:389.99, stock:5,  rating:4.8, reviews:124, badge:'sale', img:'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80', activo:true},
  {id:2,  nombre:'Bolso Tote Florentine',      sku:'ACC-001', cat:'accesorios', precio:175.00, precioAnterior:null,   stock:12, rating:4.9, reviews:88,  badge:'new',  img:'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80', activo:true},
  {id:3,  nombre:'Zapatillas Urbanas Édition', sku:'CAL-001', cat:'calzado',    precio:145.00, precioAnterior:null,   stock:8,  rating:4.7, reviews:205, badge:'hot',  img:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80', activo:true},
  {id:4,  nombre:"Perfume Rose d'Orient",      sku:'BEL-001', cat:'belleza',    precio:98.50,  precioAnterior:130.00, stock:20, rating:4.6, reviews:67,  badge:'sale', img:'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=400&q=80', activo:true},
  {id:5,  nombre:'Blazer Structured Wool',     sku:'ROP-002', cat:'ropa',       precio:320.00, precioAnterior:null,   stock:6,  rating:4.9, reviews:42,  badge:'new',  img:'https://images.unsplash.com/photo-1594938298603-c8148c4b4e62?w=400&q=80', activo:true},
  {id:6,  nombre:'Reloj Minimal Arc',          sku:'ACC-002', cat:'accesorios', precio:215.00, precioAnterior:270.00, stock:3,  rating:4.8, reviews:319, badge:'sale', img:'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80', activo:true},
  {id:7,  nombre:'Botines Chelsea Premium',    sku:'CAL-002', cat:'calzado',    precio:199.00, precioAnterior:null,   stock:9,  rating:4.7, reviews:156, badge:'new',  img:'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400&q=80', activo:true},
  {id:8,  nombre:'Sérum Vitamin C Gold',       sku:'BEL-002', cat:'belleza',    precio:62.00,  precioAnterior:null,   stock:30, rating:4.5, reviews:231, badge:null,   img:'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=400&q=80', activo:true},
  {id:9,  nombre:'Gabardina London Rain',      sku:'ROP-003', cat:'ropa',       precio:445.00, precioAnterior:520.00, stock:4,  rating:4.9, reviews:78,  badge:'sale', img:'https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=400&q=80', activo:true},
  {id:10, nombre:'Cartera Card Slim',          sku:'ACC-003', cat:'accesorios', precio:55.00,  precioAnterior:null,   stock:25, rating:4.6, reviews:412, badge:null,   img:'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&q=80', activo:true},
  {id:11, nombre:'Sandalias Ibiza Luxe',       sku:'CAL-003', cat:'calzado',    precio:110.00, precioAnterior:140.00, stock:7,  rating:4.4, reviews:93,  badge:'sale', img:'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=400&q=80', activo:true},
  {id:12, nombre:'Paleta Sombras Velvet',      sku:'BEL-003', cat:'belleza',    precio:79.00,  precioAnterior:null,   stock:18, rating:4.8, reviews:554, badge:'hot',  img:'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&q=80', activo:true},
];

let COUPONS_DB = [
  {id:1, codigo:'LUXE10', tipo:'porcentaje', valor:10, minimo:50,  usosMax:500, usosAct:47,  desc:'10% de descuento',     activo:true, vence:'2026-12-31'},
  {id:2, codigo:'SAVE20', tipo:'porcentaje', valor:20, minimo:100, usosMax:200, usosAct:123, desc:'20% descuento especial',activo:true, vence:'2026-12-31'},
  {id:3, codigo:'FLAT15', tipo:'fijo',       valor:15, minimo:40,  usosMax:300, usosAct:88,  desc:'$15 descuento fijo',    activo:true, vence:'2026-12-31'},
  {id:4, codigo:'BIENVENIDO',tipo:'porcentaje',valor:5,minimo:0,  usosMax:null,usosAct:312, desc:'5% nuevos clientes',    activo:true, vence:null},
];

let ORDERS_DB = [
  {id:1, num:'LS-000001', usuarioID:2, cliente:'María González',    email:'cliente@email.com', fecha:'2026-05-01', total:464.99, estado:'entregado', pago:'pagado',   items:[{id:1,nombre:'Chaqueta de Cuero Milano',precio:289.99,qty:1},{id:2,nombre:'Bolso Tote Florentine',precio:175.00,qty:1}]},
  {id:2, num:'LS-000002', usuarioID:3, cliente:'Carlos Mendoza',    email:'carlos@email.com',  fecha:'2026-05-05', total:320.00, estado:'enviado',   pago:'pagado',   items:[{id:5,nombre:'Blazer Structured Wool',precio:320.00,qty:1}]},
  {id:3, num:'LS-000003', usuarioID:4, cliente:'Lucía Vargas',      email:'lucia@email.com',   fecha:'2026-05-08', total:241.00, estado:'confirmado',pago:'pagado',   items:[{id:3,nombre:'Zapatillas Urbanas Édition',precio:145.00,qty:1},{id:11,nombre:'Sandalias Ibiza Luxe',precio:110.00,qty:1}]},
  {id:4, num:'LS-000004', usuarioID:2, cliente:'María González',    email:'cliente@email.com', fecha:'2026-05-10', total:98.50,  estado:'pendiente', pago:'pendiente',items:[{id:4,nombre:"Perfume Rose d'Orient",precio:98.50,qty:1}]},
  {id:5, num:'LS-000005', usuarioID:3, cliente:'Carlos Mendoza',    email:'carlos@email.com',  fecha:'2026-05-11', total:215.00, estado:'pendiente', pago:'pagado',   items:[{id:6,nombre:'Reloj Minimal Arc',precio:215.00,qty:1}]},
];

let CATEGORIES_DB = [
  {id:1, nombre:'Ropa',       slug:'ropa',       icon:'👗', descripcion:'Prendas de vestir'},
  {id:2, nombre:'Accesorios', slug:'accesorios',  icon:'👜', descripcion:'Bolsos y complementos'},
  {id:3, nombre:'Calzado',    slug:'calzado',     icon:'👠', descripcion:'Zapatos y botas'},
  {id:4, nombre:'Belleza',    slug:'belleza',     icon:'💄', descripcion:'Perfumes y maquillaje'},
];

/* ── STATE ─────────────────────────────────────────────────── */
let currentUser   = JSON.parse(localStorage.getItem('luxeUser') || 'null');
let cart          = JSON.parse(localStorage.getItem('luxeCart2') || '[]');
let wishlist      = JSON.parse(localStorage.getItem('luxeWish2') || '[]');
let orders        = JSON.parse(localStorage.getItem('luxeOrders') || JSON.stringify(ORDERS_DB));
let appliedCoupon = null;
let activeFilter  = 'all';
let sortMode      = 'default';
let searchQuery   = '';
let viewMode      = 'grid';
let editingProductId = null;

/* ── DOM ────────────────────────────────────────────────────── */
const $ = id => document.getElementById(id);

/* ════════════════════════════════════════════════
   AUTH
════════════════════════════════════════════════ */
function initAuth() {
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      $('loginForm').classList.toggle('hidden', tab.dataset.tab !== 'login');
      $('registerForm').classList.toggle('hidden', tab.dataset.tab !== 'register');
    });
  });

  $('loginForm').addEventListener('submit', e => { e.preventDefault(); doLogin(); });
  $('registerForm').addEventListener('submit', e => { e.preventDefault(); doRegister(); });
  $('regPass').addEventListener('input', checkPasswordStrength);

  if (currentUser) enterApp();
}

function doLogin() {
  const email = $('loginEmail').value.trim().toLowerCase();
  const pass  = $('loginPass').value;
  const user  = USERS_DB.find(u => u.email === email && u.pass === pass);
  if (!user) { showToast('Credenciales incorrectas', 'err'); return; }
  currentUser = user;
  localStorage.setItem('luxeUser', JSON.stringify(user));
  enterApp();
}

function doRegister() {
  const email = $('regEmail').value.trim().toLowerCase();
  const pass  = $('regPass').value;
  const pass2 = $('regPass2').value;
  if (pass !== pass2) { showToast('Las contraseñas no coinciden', 'err'); return; }
  if (pass.length < 8) { showToast('Mínimo 8 caracteres', 'err'); return; }
  if (USERS_DB.find(u => u.email === email)) { showToast('Email ya registrado', 'err'); return; }
  const newUser = { id: USERS_DB.length + 1, rol:'cliente', nombre:'Nuevo', apellido:'Usuario', email, pass, telefono:'' };
  USERS_DB.push(newUser);
  currentUser = newUser;
  localStorage.setItem('luxeUser', JSON.stringify(newUser));
  showToast('¡Cuenta creada exitosamente!', 'ok');
  enterApp();
}

function enterApp() {
  $('authScreen').style.display = 'none';
  $('appScreen').classList.remove('hidden');
  updateUserUI();
  initShop();
  if (currentUser.rol === 'admin') {
    $('adminLink').classList.remove('hidden');
    initAdmin();
  }
  updateCartUI();
  updateWishBadge();
}

function logout() {
  localStorage.removeItem('luxeUser');
  currentUser = null;
  location.reload();
}

function checkPasswordStrength() {
  const val = $('regPass').value;
  const el  = $('passStrength');
  let score = 0;
  if (val.length >= 8) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;
  el.className = `password-strength strength-${score}`;
}

function togglePass(id, btn) {
  const input = $(id);
  if (input.type === 'password') { input.type = 'text'; btn.textContent = '🙈'; }
  else { input.type = 'password'; btn.textContent = '👁'; }
}

function updateUserUI() {
  const initials = (currentUser.nombre[0] + currentUser.apellido[0]).toUpperCase();
  $('userInitials').textContent = initials;
  $('udName').textContent  = currentUser.nombre + ' ' + currentUser.apellido;
  $('udEmail').textContent = currentUser.email;
  $('udRole').textContent  = currentUser.rol;
  $('profileAvatar').textContent = initials;
  $('profileName').textContent   = currentUser.nombre + ' ' + currentUser.apellido;
  $('profileEmail').textContent  = currentUser.email;
  $('profileRole').textContent   = currentUser.rol;
  $('pfNombre').value    = currentUser.nombre;
  $('pfApellido').value  = currentUser.apellido;
  $('pfEmail').value     = currentUser.email;
  $('pfTel').value       = currentUser.telefono || '';
}

/* ════════════════════════════════════════════════
   NAVIGATION
════════════════════════════════════════════════ */
function showPage(name) {
  closeDropdown();
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  const page = $('page' + name.charAt(0).toUpperCase() + name.slice(1));
  if (page) { page.classList.remove('hidden'); window.scrollTo(0,0); }
  if (name === 'wishlist') renderWishlist();
  if (name === 'orders')   renderUserOrders();
  if (name === 'admin')    refreshAdminDashboard();
}

/* ── HAMBURGER & DROPDOWN ── */
$('hamburger').addEventListener('click', () => {
  $('mainNav').style.display = $('mainNav').style.display === 'flex' ? '' : 'flex';
});

$('userMenuBtn').addEventListener('click', e => {
  e.stopPropagation();
  $('userDropdown').classList.toggle('open');
});

document.addEventListener('click', () => closeDropdown());
function closeDropdown() { $('userDropdown').classList.remove('open'); }

/* ── SEARCH ── */
$('searchToggle').addEventListener('click', () => {
  $('searchbarDrop').classList.toggle('open');
  if ($('searchbarDrop').classList.contains('open')) $('searchInput').focus();
});
$('searchClose').addEventListener('click', () => {
  $('searchbarDrop').classList.remove('open');
  searchQuery = ''; $('searchInput').value = '';
  renderProducts();
});
$('searchInput').addEventListener('input', e => { searchQuery = e.target.value; renderProducts(); });

/* ── ADMIN NAV ── */
document.querySelectorAll('.admin-nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.admin-nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
    const panel = $('panel-' + btn.dataset.panel);
    if (panel) { panel.classList.add('active'); refreshAdminPanel(btn.dataset.panel); }
  });
});

/* ════════════════════════════════════════════════
   SHOP
════════════════════════════════════════════════ */
function initShop() {
  document.querySelectorAll('.cat-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.cat-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeFilter = chip.dataset.cat;
      renderProducts();
    });
  });
  $('sortSel').addEventListener('change', e => { sortMode = e.target.value; renderProducts(); });
  document.querySelectorAll('.vt').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.vt').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      viewMode = btn.dataset.view;
      $('productsWrap').classList.toggle('list-view', viewMode === 'list');
    });
  });
  renderProducts();
}

function getFiltered() {
  let list = [...PRODUCTS].filter(p => p.activo);
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    list = list.filter(p => p.nombre.toLowerCase().includes(q) || p.cat.includes(q));
  }
  if (activeFilter !== 'all') list = list.filter(p => p.cat === activeFilter);
  if (sortMode === 'price-asc')  list.sort((a,b) => a.precio - b.precio);
  if (sortMode === 'price-desc') list.sort((a,b) => b.precio - a.precio);
  if (sortMode === 'name')       list.sort((a,b) => a.nombre.localeCompare(b.nombre));
  if (sortMode === 'rating')     list.sort((a,b) => b.rating - a.rating);
  return list;
}

function renderProducts() {
  const list = getFiltered();
  const grid = $('productsGrid');
  $('resultsLabel').textContent = `${list.length} producto${list.length !== 1 ? 's' : ''}`;
  if (!list.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:4rem;color:var(--text3)">Sin resultados para "<em>${searchQuery}</em>"</div>`;
    return;
  }
  grid.innerHTML = list.map((p,i) => productCardHTML(p,i)).join('');
}

function productCardHTML(p, i=0) {
  const disc = p.precioAnterior ? Math.round((1 - p.precio/p.precioAnterior)*100) : 0;
  const inWish = wishlist.includes(p.id);
  const oos    = p.stock === 0;
  return `
  <article class="prod-card" style="animation-delay:${i*0.04}s">
    <div class="prod-img-wrap">
      <img src="${p.img}" alt="${p.nombre}" loading="lazy"/>
      ${p.badge ? `<span class="prod-badge badge-${p.badge}">${{new:'Nuevo',sale:'Oferta',hot:'Popular'}[p.badge]}</span>` : ''}
      <button class="prod-wish${inWish ? ' wished' : ''}" onclick="toggleWish(event,${p.id})">${inWish ? '♥' : '♡'}</button>
      <button class="prod-cta" onclick="addToCart(event,${p.id})" ${oos ? 'disabled' : ''}>${oos ? 'Sin Stock' : '+ Agregar'}</button>
    </div>
    <div class="prod-body">
      <p class="prod-cat">${p.cat}</p>
      <h3 class="prod-name">${p.nombre}</h3>
      <div class="prod-stars">
        ${'★'.repeat(Math.floor(p.rating))}${p.rating%1>=.5?'½':''}
        <span>(${p.reviews})</span>
      </div>
      <div class="prod-price">
        <span class="price-now">$${p.precio.toFixed(2)}</span>
        ${p.precioAnterior ? `<span class="price-old">$${p.precioAnterior.toFixed(2)}</span>` : ''}
        ${disc ? `<span class="price-pct">-${disc}%</span>` : ''}
      </div>
    </div>
  </article>`;
}

/* ── WISHLIST ── */
function toggleWish(e, id) {
  e.stopPropagation();
  const btn = e.currentTarget;
  if (wishlist.includes(id)) {
    wishlist = wishlist.filter(i => i !== id);
    btn.textContent = '♡'; btn.classList.remove('wished');
    showToast('Quitado de favoritos');
  } else {
    wishlist.push(id);
    btn.textContent = '♥'; btn.classList.add('wished');
    showToast('Añadido a favoritos ♥', 'ok');
  }
  localStorage.setItem('luxeWish2', JSON.stringify(wishlist));
  updateWishBadge();
}
function updateWishBadge() { $('wishBadge').textContent = wishlist.length; }

function renderWishlist() {
  const grid = $('wishGrid');
  const empty = $('wishEmpty');
  const list  = PRODUCTS.filter(p => wishlist.includes(p.id));
  if (!list.length) { grid.innerHTML = ''; empty.classList.remove('hidden'); return; }
  empty.classList.add('hidden');
  grid.innerHTML = list.map((p,i) => productCardHTML(p,i)).join('');
}

/* ════════════════════════════════════════════════
   CART
════════════════════════════════════════════════ */
function addToCart(e, id) {
  if (e) e.stopPropagation();
  const product = PRODUCTS.find(p => p.id === id);
  if (!product || product.stock === 0) return;
  const existing = cart.find(i => i.id === id);
  if (existing) {
    if (existing.qty >= product.stock) { showToast('Stock máximo alcanzado','err'); return; }
    existing.qty++;
  } else cart.push({ id, qty:1 });
  saveCart(); updateCartUI(); animateBadge();
  showToast(`"${product.nombre}" en el carrito ✓`, 'ok');
}

function removeFromCart(id) { cart = cart.filter(i => i.id !== id); saveCart(); updateCartUI(); }

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  const p = PRODUCTS.find(pr => pr.id === id);
  item.qty = Math.max(1, Math.min(item.qty + delta, p.stock));
  saveCart(); updateCartUI();
}

function clearCart() {
  if (!cart.length) return;
  cart = []; appliedCoupon = null;
  $('cpInput').value = ''; $('cpMsg').textContent = '';
  saveCart(); updateCartUI();
  showToast('Carrito vaciado');
}

function saveCart() { localStorage.setItem('luxeCart2', JSON.stringify(cart)); }

function openCartDrawer() {
  $('cartDrawer').classList.add('open');
  $('cartOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  $('cartDrawer').classList.remove('open');
  $('cartOverlay').classList.remove('active');
  document.body.style.overflow = '';
}

$('cartToggle').addEventListener('click', openCartDrawer);
$('cartClose').addEventListener('click', closeCart);
$('cartOverlay').addEventListener('click', closeCart);

function updateCartUI() {
  const total = cart.reduce((s,i) => s + i.qty, 0);
  $('cartBadge').textContent  = total;
  $('drawerCount').textContent = `${total} item${total !== 1 ? 's' : ''}`;

  const isEmpty = cart.length === 0;
  $('drawerEmpty').style.display = isEmpty ? 'flex' : 'none';
  $('drawerList').innerHTML      = isEmpty ? '' : cart.map(item => {
    const p = PRODUCTS.find(pr => pr.id === item.id); if (!p) return '';
    return `
    <li class="drawer-item">
      <img class="di-img" src="${p.img}" alt="${p.nombre}"/>
      <div class="di-info">
        <p class="di-name">${p.nombre}</p>
        <p class="di-cat">${p.cat}</p>
        <div class="di-controls">
          <button class="qty-btn" onclick="changeQty(${p.id},-1)">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${p.id},1)">+</button>
          <span class="di-price">$${p.precio.toFixed(2)}</span>
        </div>
        <p class="di-total">Total: $${(p.precio * item.qty).toFixed(2)}</p>
      </div>
      <button class="di-remove" onclick="removeFromCart(${p.id})">✕</button>
    </li>`;
  }).join('');
  updateSummary();
}

function updateSummary() {
  const subtotal = cart.reduce((s,i) => { const p = PRODUCTS.find(pr => pr.id===i.id); return s+(p ? p.precio*i.qty : 0); }, 0);
  let discount = 0;
  if (appliedCoupon) {
    discount = appliedCoupon.tipo === 'porcentaje' ? subtotal * appliedCoupon.valor/100 : Math.min(appliedCoupon.valor, subtotal);
  }
  const shipping = subtotal >= 150 || subtotal === 0 ? 0 : 12.99;
  const total = Math.max(0, subtotal - discount + shipping);
  $('dsSubtotal').textContent  = `$${subtotal.toFixed(2)}`;
  $('dsTotal').textContent     = `$${total.toFixed(2)}`;
  $('checkoutTotal').textContent = `$${total.toFixed(2)}`;
  $('dsShipping').textContent  = shipping === 0 ? (subtotal === 0 ? '$0.00' : 'Gratis') : `$${shipping.toFixed(2)}`;
  const dr = $('dsDiscRow');
  if (discount > 0) { dr.classList.remove('hidden'); $('dsDiscount').textContent = `-$${discount.toFixed(2)}`; }
  else dr.classList.add('hidden');
}

/* ── COUPON ── */
function applyCoupon() {
  const code = $('cpInput').value.trim().toUpperCase();
  if (!code) { setCpMsg('Ingresa un código','err'); return; }
  const c = COUPONS_DB.find(cp => cp.codigo === code && cp.activo);
  if (!c) { appliedCoupon = null; setCpMsg('Código inválido','err'); return; }
  if (!cart.length) { setCpMsg('Agrega productos primero','err'); return; }
  const subtotal = cart.reduce((s,i) => { const p = PRODUCTS.find(pr => pr.id===i.id); return s+(p ? p.precio*i.qty : 0); }, 0);
  if (c.minimo && subtotal < c.minimo) { setCpMsg(`Mínimo $${c.minimo} para este cupón`,'err'); return; }
  appliedCoupon = c;
  setCpMsg(`✓ ${c.desc} aplicado!`,'ok');
  updateSummary();
  showToast(`Cupón "${code}" aplicado`,'ok');
}
function setCpMsg(msg,cls) { const el=$('cpMsg'); el.textContent=msg; el.className=`coupon-feedback ${cls}`; }

/* ── CHECKOUT ── */
function openCheckout() {
  if (!cart.length) { showToast('Carrito vacío','err'); return; }
  $('checkoutOv').classList.remove('hidden');
}

$('checkoutForm').addEventListener('submit', e => {
  e.preventDefault();
  const orderNum = 'LS-' + String(orders.length + 1).padStart(6,'0');
  const total    = parseFloat($('dsTotal').textContent.replace('$','')) || 0;
  const newOrder = {
    id: orders.length + 1,
    num: orderNum,
    usuarioID: currentUser.id,
    cliente: currentUser.nombre + ' ' + currentUser.apellido,
    email:   currentUser.email,
    fecha:   new Date().toISOString().split('T')[0],
    total,
    estado:  'pendiente',
    pago:    'pagado',
    items:   cart.map(i => { const p = PRODUCTS.find(pr => pr.id===i.id); return {id:i.id, nombre:p?.nombre||'', precio:p?.precio||0, qty:i.qty}; })
  };
  orders.push(newOrder);
  localStorage.setItem('luxeOrders', JSON.stringify(orders));
  closeModal('checkoutOv');
  $('successOrderNum').textContent = orderNum;
  $('successOv').classList.remove('hidden');
  cart = []; appliedCoupon = null;
  $('cpInput').value = ''; $('cpMsg').textContent = '';
  saveCart(); updateCartUI();
});

function animateBadge() {
  const b = $('cartBadge');
  b.style.transform = 'scale(1.5)';
  setTimeout(() => b.style.transform = '', 300);
}

/* ════════════════════════════════════════════════
   PROFILE & ORDERS (client)
════════════════════════════════════════════════ */
function saveProfile() {
  currentUser.nombre   = $('pfNombre').value;
  currentUser.apellido = $('pfApellido').value;
  currentUser.email    = $('pfEmail').value;
  currentUser.telefono = $('pfTel').value;
  localStorage.setItem('luxeUser', JSON.stringify(currentUser));
  updateUserUI();
  showToast('Perfil actualizado','ok');
}

function renderUserOrders() {
  const myOrders = orders.filter(o => o.usuarioID === currentUser.id || currentUser.rol === 'admin');
  const list = $('ordersList');
  const empty = $('ordersEmpty');
  if (!myOrders.length) { list.innerHTML = ''; empty.classList.remove('hidden'); return; }
  empty.classList.add('hidden');
  list.innerHTML = myOrders.map(o => `
  <div class="order-item">
    <div>
      <p class="order-num">${o.num}</p>
      <p class="order-date">${o.fecha} · ${o.items.length} artículo${o.items.length!==1?'s':''}</p>
    </div>
    <span class="order-status status-${o.estado}">${o.estado}</span>
    <strong>$${o.total.toFixed(2)}</strong>
  </div>`).join('');
}

/* ════════════════════════════════════════════════
   ADMIN
════════════════════════════════════════════════ */
function initAdmin() {
  $('adminDate').textContent = new Date().toLocaleDateString('es-BO',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  refreshAdminDashboard();

  $('productForm').addEventListener('submit', e => { e.preventDefault(); saveProduct(); });
  $('couponForm').addEventListener('submit', e => { e.preventDefault(); saveCoupon(); });
  $('catForm').addEventListener('submit', e => { e.preventDefault(); saveCategory(); });
  $('adminSearchProd').addEventListener('input', renderAdminProducts);
  $('adminCatFilter').addEventListener('input', renderAdminProducts);
  $('adminSearchOrd').addEventListener('input', renderAdminOrders);
  $('adminOrdStatus').addEventListener('input', renderAdminOrders);
  $('adminSearchCust').addEventListener('input', renderAdminCustomers);
}

function refreshAdminDashboard() {
  const ventasMes = orders.filter(o => o.pago==='pagado').reduce((s,o) => s+o.total, 0);
  const pedidosHoy = orders.filter(o => o.fecha === new Date().toISOString().split('T')[0]).length;
  const clientes   = USERS_DB.filter(u => u.rol === 'cliente').length;
  const bajoStock  = PRODUCTS.filter(p => p.stock <= 3 && p.activo).length;

  $('kpiVentas').textContent   = '$' + ventasMes.toFixed(2);
  $('kpiPedidos').textContent  = pedidosHoy;
  $('kpiClientes').textContent = clientes;
  $('kpiBajoStock').textContent = bajoStock;

  // Recent orders
  const recent = [...orders].sort((a,b) => b.id-a.id).slice(0,5);
  $('recentOrders').innerHTML = recent.map(o => `
  <tr>
    <td style="color:var(--text2);font-size:.75rem">${o.num}</td>
    <td class="at-name">${o.cliente}</td>
    <td>$${o.total.toFixed(2)}</td>
    <td><span class="chip chip-${o.estado}">${o.estado}</span></td>
  </tr>`).join('');

  // Low stock
  const low = PRODUCTS.filter(p => p.stock <= 5 && p.activo).sort((a,b) => a.stock-b.stock);
  $('lowStockList').innerHTML = low.length
    ? low.map(p => `<div class="low-stock-item"><span>${p.nombre}</span><span class="stock-num${p.stock<=2?' critical':''}">${p.stock} uds.</span></div>`).join('')
    : '<p style="color:var(--text3);font-size:.8rem">Sin alertas de stock</p>';
}

function refreshAdminPanel(name) {
  if (name === 'dashboard')  refreshAdminDashboard();
  if (name === 'products')   renderAdminProducts();
  if (name === 'orders')     renderAdminOrders();
  if (name === 'customers')  renderAdminCustomers();
  if (name === 'coupons')    renderAdminCoupons();
  if (name === 'categories') renderAdminCategories();
}

/* ── PRODUCTS ADMIN ── */
function renderAdminProducts() {
  const q   = ($('adminSearchProd')?.value || '').toLowerCase();
  const cat = $('adminCatFilter')?.value || '';
  const list = PRODUCTS.filter(p =>
    (!q || p.nombre.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)) &&
    (!cat || p.cat === cat)
  );
  $('productsTableBody').innerHTML = list.map(p => `
  <tr>
    <td><img class="at-img" src="${p.img}" alt="${p.nombre}"/></td>
    <td><p class="at-name">${p.nombre}</p><p class="at-sku">SKU: ${p.sku}</p></td>
    <td style="color:var(--text2);font-size:.75rem">${p.sku}</td>
    <td><span class="chip chip-${p.cat==='ropa'?'confirmado':p.cat==='accesorios'?'enviado':p.cat==='calzado'?'pendiente':'pagado'}">${p.cat}</span></td>
    <td><strong>$${p.precio.toFixed(2)}</strong>${p.precioAnterior?`<br><s style="color:var(--text3);font-size:.7rem">$${p.precioAnterior.toFixed(2)}</s>`:''}</td>
    <td><span class="${p.stock<=3?'chip chip-cancelado':p.stock<=8?'chip chip-pendiente':'chip chip-pagado'}">${p.stock}</span></td>
    <td><span class="chip ${p.activo?'chip-active':'chip-inactive'}">${p.activo?'Activo':'Inactivo'}</span></td>
    <td>
      <div class="at-actions">
        <button class="at-btn" onclick="openProductModal(${p.id})">✎ Editar</button>
        <button class="at-btn" onclick="toggleProductStatus(${p.id})">${p.activo?'Ocultar':'Activar'}</button>
        <button class="at-btn del" onclick="confirmDelete('producto',${p.id})">✕</button>
      </div>
    </td>
  </tr>`).join('');
}

function openProductModal(id) {
  editingProductId = id || null;
  $('productModalTitle').textContent = id ? 'Editar Producto' : 'Nuevo Producto';
  if (id) {
    const p = PRODUCTS.find(pr => pr.id === id);
    $('pf_id').value             = p.id;
    $('pf_nombre').value         = p.nombre;
    $('pf_sku').value            = p.sku;
    $('pf_cat').value            = p.cat;
    $('pf_badge').value          = p.badge || '';
    $('pf_precio').value         = p.precio;
    $('pf_precioAnterior').value = p.precioAnterior || '';
    $('pf_stock').value          = p.stock;
    $('pf_rating').value         = p.rating;
    $('pf_img').value            = p.img;
  } else {
    $('productForm').reset();
  }
  $('productModalOv').classList.remove('hidden');
}

function saveProduct() {
  const data = {
    nombre:        $('pf_nombre').value.trim(),
    sku:           $('pf_sku').value.trim().toUpperCase(),
    cat:           $('pf_cat').value,
    badge:         $('pf_badge').value || null,
    precio:        parseFloat($('pf_precio').value),
    precioAnterior: $('pf_precioAnterior').value ? parseFloat($('pf_precioAnterior').value) : null,
    stock:         parseInt($('pf_stock').value),
    rating:        parseFloat($('pf_rating').value),
    img:           $('pf_img').value || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    activo:        true,
    reviews:       0,
  };
  if (editingProductId) {
    const idx = PRODUCTS.findIndex(p => p.id === editingProductId);
    PRODUCTS[idx] = { ...PRODUCTS[idx], ...data };
    showToast('Producto actualizado ✓','ok');
  } else {
    data.id = Math.max(...PRODUCTS.map(p => p.id)) + 1;
    PRODUCTS.push(data);
    showToast('Producto creado ✓','ok');
  }
  closeModal('productModalOv');
  renderAdminProducts();
  renderProducts();
  refreshAdminDashboard();
}

function toggleProductStatus(id) {
  const p = PRODUCTS.find(pr => pr.id === id);
  if (p) { p.activo = !p.activo; renderAdminProducts(); renderProducts(); showToast(`Producto ${p.activo?'activado':'ocultado'}`,'info'); }
}

/* ── ORDERS ADMIN ── */
function renderAdminOrders() {
  const q   = ($('adminSearchOrd')?.value || '').toLowerCase();
  const st  = $('adminOrdStatus')?.value || '';
  const list = orders.filter(o =>
    (!q || o.num.toLowerCase().includes(q) || o.cliente.toLowerCase().includes(q)) &&
    (!st || o.estado === st)
  ).sort((a,b) => b.id - a.id);
  $('ordersTableBody').innerHTML = list.map(o => `
  <tr>
    <td style="font-family:var(--font-display);font-size:.82rem;color:var(--white)">${o.num}</td>
    <td><p class="at-name">${o.cliente}</p><p style="font-size:.7rem;color:var(--text3)">${o.email}</p></td>
    <td style="color:var(--text2);font-size:.78rem">${o.fecha}</td>
    <td><strong>$${o.total.toFixed(2)}</strong></td>
    <td><span class="chip chip-${o.pago==='pagado'?'pagado':'pendiente'}">${o.pago}</span></td>
    <td>
      <select class="status-select" onchange="updateOrderStatus(${o.id},this.value)">
        ${['pendiente','confirmado','preparando','enviado','entregado','cancelado'].map(s =>
          `<option value="${s}" ${o.estado===s?'selected':''}>${s}</option>`).join('')}
      </select>
    </td>
    <td><button class="at-btn" onclick="viewOrderDetail(${o.id})">Ver</button></td>
  </tr>`).join('');
}

function updateOrderStatus(id, estado) {
  const o = orders.find(ord => ord.id === id);
  if (o) { o.estado = estado; localStorage.setItem('luxeOrders', JSON.stringify(orders)); showToast(`Pedido ${o.num} → ${estado}`,'info'); refreshAdminDashboard(); }
}

function viewOrderDetail(id) {
  const o = orders.find(ord => ord.id === id);
  if (!o) return;
  $('orderDetailTitle').textContent = `Pedido ${o.num}`;
  $('orderDetailContent').innerHTML = `
  <div class="order-detail-grid">
    <div class="od-section">
      <h5>Información del pedido</h5>
      <div class="od-row"><span>Número</span><strong>${o.num}</strong></div>
      <div class="od-row"><span>Fecha</span><span>${o.fecha}</span></div>
      <div class="od-row"><span>Estado pago</span><span class="chip chip-${o.pago}">${o.pago}</span></div>
      <div class="od-row"><span>Total</span><strong>$${o.total.toFixed(2)}</strong></div>
    </div>
    <div class="od-section">
      <h5>Cliente</h5>
      <div class="od-row"><span>Nombre</span><span>${o.cliente}</span></div>
      <div class="od-row"><span>Email</span><span>${o.email}</span></div>
    </div>
  </div>
  <div style="padding:0 1.5rem 1.5rem">
    <h5 style="font-size:.7rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--text2);margin-bottom:.75rem">Artículos</h5>
    <table class="admin-table"><thead><tr><th>Producto</th><th>Precio</th><th>Cantidad</th><th>Subtotal</th></tr></thead>
    <tbody>${o.items.map(i => `<tr><td>${i.nombre}</td><td>$${i.precio.toFixed(2)}</td><td>${i.qty}</td><td>$${(i.precio*i.qty).toFixed(2)}</td></tr>`).join('')}</tbody>
    </table>
  </div>`;
  $('orderDetailOv').classList.remove('hidden');
}

/* ── CUSTOMERS ADMIN ── */
function renderAdminCustomers() {
  const q = ($('adminSearchCust')?.value || '').toLowerCase();
  const customers = USERS_DB.filter(u => u.rol === 'cliente' && (!q || u.nombre.toLowerCase().includes(q) || u.email.includes(q)));
  $('customersTableBody').innerHTML = customers.map(u => {
    const myOrders = orders.filter(o => o.usuarioID === u.id && o.pago === 'pagado');
    const total    = myOrders.reduce((s,o) => s+o.total, 0);
    const initials = (u.nombre[0] + u.apellido[0]).toUpperCase();
    return `<tr>
      <td><div class="at-avatar">${initials}</div></td>
      <td><p class="at-name">${u.nombre} ${u.apellido}</p></td>
      <td style="color:var(--text2);font-size:.78rem">${u.email}</td>
      <td style="text-align:center">${myOrders.length}</td>
      <td><strong>$${total.toFixed(2)}</strong></td>
      <td><span class="chip chip-active">Activo</span></td>
      <td><div class="at-actions"><button class="at-btn" onclick="showToast('Ver perfil: ${u.nombre}','info')">Ver</button><button class="at-btn del" onclick="showToast('No se puede eliminar en demo','err')">✕</button></div></td>
    </tr>`;
  }).join('');
}

/* ── COUPONS ADMIN ── */
function renderAdminCoupons() {
  $('couponsTableBody').innerHTML = COUPONS_DB.map(c => `
  <tr>
    <td><strong style="font-family:var(--font-display);letter-spacing:.06em">${c.codigo}</strong></td>
    <td><span class="chip chip-${c.tipo==='porcentaje'?'confirmado':'enviado'}">${c.tipo}</span></td>
    <td><strong>${c.tipo==='porcentaje'?c.valor+'%':'$'+c.valor}</strong></td>
    <td style="color:var(--text2);font-size:.78rem">${c.usosAct}${c.usosMax?' / '+c.usosMax:' / ∞'}</td>
    <td style="color:var(--text3);font-size:.75rem">${c.vence || 'Sin vencimiento'}</td>
    <td><span class="chip ${c.activo?'chip-active':'chip-inactive'}">${c.activo?'Activo':'Inactivo'}</span></td>
    <td><div class="at-actions">
      <button class="at-btn" onclick="toggleCoupon(${c.id})">${c.activo?'Desactivar':'Activar'}</button>
      <button class="at-btn del" onclick="confirmDelete('cupon',${c.id})">✕</button>
    </div></td>
  </tr>`).join('');
}

function openCouponModal() { $('couponModalOv').classList.remove('hidden'); }
function saveCoupon() {
  const newC = {
    id:       COUPONS_DB.length + 1,
    codigo:   $('cf_codigo').value.toUpperCase(),
    tipo:     $('cf_tipo').value,
    valor:    parseFloat($('cf_valor').value),
    minimo:   parseFloat($('cf_min').value) || 0,
    usosMax:  $('cf_usos').value ? parseInt($('cf_usos').value) : null,
    usosAct:  0,
    desc:     $('cf_desc').value,
    activo:   true,
    vence:    $('cf_fecha').value || null,
  };
  COUPONS_DB.push(newC);
  closeModal('couponModalOv');
  renderAdminCoupons();
  showToast('Cupón creado ✓','ok');
}
function toggleCoupon(id) {
  const c = COUPONS_DB.find(cp => cp.id === id);
  if (c) { c.activo = !c.activo; renderAdminCoupons(); showToast(`Cupón ${c.activo?'activado':'desactivado'}`,'info'); }
}

/* ── CATEGORIES ADMIN ── */
function renderAdminCategories() {
  $('catAdminGrid').innerHTML = CATEGORIES_DB.map(c => {
    const count = PRODUCTS.filter(p => p.cat === c.slug && p.activo).length;
    return `<div class="cat-admin-card">
      <div class="cat-admin-icon">${c.icon}</div>
      <p class="cat-admin-name">${c.nombre}</p>
      <p class="cat-admin-count">${count} productos</p>
      <p style="font-size:.72rem;color:var(--text3)">${c.descripcion}</p>
      <div class="cat-admin-actions">
        <button class="at-btn" onclick="showToast('Editar: ${c.nombre}','info')">✎</button>
        <button class="at-btn del" onclick="showToast('No se puede eliminar categorías con productos','err')">✕</button>
      </div>
    </div>`;
  }).join('');
}
function openCatModal() { $('catModalOv').classList.remove('hidden'); }
function saveCategory() {
  const newC = {
    id: CATEGORIES_DB.length + 1,
    nombre: $('catf_nombre').value,
    slug:   $('catf_nombre').value.toLowerCase().replace(/\s+/g,'-'),
    icon:   $('catf_icon').value || '📦',
    descripcion: $('catf_desc').value,
  };
  CATEGORIES_DB.push(newC);
  closeModal('catModalOv');
  renderAdminCategories();
  showToast('Categoría creada ✓','ok');
}

/* ── DELETE CONFIRM ── */
function confirmDelete(type, id) {
  const msgs = { producto: '¿Eliminar este producto?', cupon: '¿Eliminar este cupón?' };
  $('confirmDeleteMsg').textContent = msgs[type] || '¿Eliminar este registro?';
  $('confirmDeleteBtn').onclick = () => { doDelete(type, id); closeModal('confirmDeleteOv'); };
  $('confirmDeleteOv').classList.remove('hidden');
}
function doDelete(type, id) {
  if (type === 'producto') {
    PRODUCTS = PRODUCTS.filter(p => p.id !== id);
    renderAdminProducts(); renderProducts();
    showToast('Producto eliminado','ok');
  }
  if (type === 'cupon') {
    COUPONS_DB.splice(COUPONS_DB.findIndex(c => c.id === id), 1);
    renderAdminCoupons();
    showToast('Cupón eliminado','ok');
  }
  refreshAdminDashboard();
}

/* ════════════════════════════════════════════════
   MODALS
════════════════════════════════════════════════ */
function closeModal(id) { $(id).classList.add('hidden'); }
document.querySelectorAll('.modal-overlay').forEach(ov => {
  ov.addEventListener('click', e => { if (e.target === ov) closeModal(ov.id); });
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay:not(.hidden)').forEach(ov => closeModal(ov.id));
    closeCart();
  }
});

/* ════════════════════════════════════════════════
   TOAST
════════════════════════════════════════════════ */
function showToast(msg, type = '') {
  const wrap = $('toastWrap');
  const id = 'toast_' + Date.now();
  const icons = { ok:'✓', err:'✕', info:'ℹ' };
  const div = document.createElement('div');
  div.className = `toast-item ${type}`;
  div.id = id;
  div.innerHTML = `<span class="toast-icon">${icons[type]||'●'}</span><span>${msg}</span><button class="toast-close" onclick="this.parentElement.remove()">✕</button>`;
  wrap.appendChild(div);
  setTimeout(() => { const el = document.getElementById(id); if (el) { el.style.opacity='0'; el.style.transform='translateX(20px)'; el.style.transition='.3s'; setTimeout(() => el.remove(), 300); }}, 3500);
}

/* ════════════════════════════════════════════════
   INIT
════════════════════════════════════════════════ */
initAuth();

// Expose for inline handlers
Object.assign(window, {
  showPage, addToCart, removeFromCart, changeQty, toggleWish,
  openCartDrawer, closeCart, clearCart, applyCoupon, openCheckout,
  openProductModal, toggleProductStatus, toggleCoupon,
  renderAdminOrders, renderAdminProducts, renderAdminCustomers,
  updateOrderStatus, viewOrderDetail, openCouponModal, openCatModal,
  confirmDelete, closeModal, saveProfile, logout, togglePass
});
