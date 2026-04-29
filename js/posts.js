const POSTS_PER_PAGE = 6;

async function cargarPosts() {
  const base = window.location.pathname.includes('/mercadolab')
    ? '/mercadolab/posts/posts.json'
    : 'posts/posts.json';
  const res = await fetch(base);
  return await res.json();
}

function formatFecha(str) {
  const d = new Date(str);
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
}

function tagClass(cat) {
  return cat === 'analisis' ? 'tag-a' : cat === 'macro' ? 'tag-m' : 'tag-e';
}

function bgColor(cat) {
  return cat === 'analisis' ? '#d4e8f0' : cat === 'macro' ? '#dde8d8' : '#e8e4d8';
}

// ── HOME ──────────────────────────────────────────────
async function renderHome() {
  const posts = await cargarPosts();
  ['analisis', 'macro', 'educacion'].forEach(cat => {
    const el = document.getElementById('posts-' + cat);
    if (!el) return;
    const filtrados = posts.filter(p => p.categoria === cat)
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 3);
    if (!filtrados.length) { el.innerHTML = '<p class="meta-loading">Sin artículos aún.</p>'; return; }
    const mp = cat === 'analisis' ? 'mp-a' : cat === 'macro' ? 'mp-m' : 'mp-e';
    el.innerHTML = filtrados.map(p => `
      <a class="post-row-card ${mp}" href="articulo.html?slug=${p.slug}">
        <div class="prc-title">${p.titulo}</div>
        <div class="prc-date">${formatFecha(p.fecha)} · ${p.minutos} min</div>
      </a>`).join('');
  });
}

// ── SECCIÓN con paginación ────────────────────────────
async function renderSeccion() {
  const params = new URLSearchParams(window.location.search);
  const cat  = params.get('cat') || 'analisis';
  const page = parseInt(params.get('page') || '1');

  const posts = await cargarPosts();
  const todos = posts.filter(p => p.categoria === cat)
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  // Títulos de sección
  const nombres = { analisis: 'Análisis', macro: 'Macro', educacion: 'Educación' };
  const eyebrows = { analisis: 'Mercados & activos', macro: 'Economía global', educacion: 'Conceptos clave' };
  const titulo = document.getElementById('seccion-titulo');
  const header = document.getElementById('seccion-header');
  if (titulo) titulo.textContent = nombres[cat] || cat;
  if (header) {
    const eyebrow = header.querySelector('.seccion-eyebrow');
    if (eyebrow) eyebrow.textContent = eyebrows[cat] || '';
    header.className = `seccion-header seccion-header-${cat}`;
  }

  document.title = `${nombres[cat]} — Gonzalo Rodriguez`;

  // Marcar link activo en navbar
  document.querySelectorAll('.nav-links-dark a').forEach(a => {
    a.classList.remove('active');
    if (a.href.includes(`cat=${cat}`)) a.classList.add('active');
  });

  // Paginación
  const totalPages = Math.ceil(todos.length / POSTS_PER_PAGE);
  const start = (page - 1) * POSTS_PER_PAGE;
  const pagina = todos.slice(start, start + POSTS_PER_PAGE);

  const grid = document.getElementById('posts-grid');
  if (!grid) return;

  if (!pagina.length) {
    grid.innerHTML = '<p style="padding:40px;color:#aaa">Sin artículos en esta sección aún.</p>';
    return;
  }

  const tc = tagClass(cat);
  const bg = bgColor(cat);

  grid.innerHTML = pagina.map(p => `
    <a class="post-card" href="articulo.html?slug=${p.slug}">
      <div class="${p.imagen ? 'post-card-img' : 'post-card-img-placeholder'}"
           style="${!p.imagen ? `background:${bg}` : ''}">
        ${p.imagen ? `<img src="${p.imagen}" alt="${p.titulo}"/>` : ''}
      </div>
      <div class="post-card-body">
        <div class="post-card-tag ${tc}">${nombres[cat]}</div>
        <div class="post-card-title">${p.titulo}</div>
        <div class="post-card-date">${formatFecha(p.fecha)} · ${p.minutos} min de lectura</div>
      </div>
    </a>`).join('');

  // Render paginación
  const pag = document.getElementById('pagination');
  if (pag && totalPages > 1) {
    let html = '';
    if (page > 1)
      html += `<a class="pag-btn" href="seccion.html?cat=${cat}&page=${page-1}">← Anterior</a>`;
    for (let i = 1; i <= totalPages; i++)
      html += `<a class="pag-btn ${i === page ? 'pag-active' : ''}" href="seccion.html?cat=${cat}&page=${i}">${i}</a>`;
    if (page < totalPages)
      html += `<a class="pag-btn" href="seccion.html?cat=${cat}&page=${page+1}">Siguiente →</a>`;
    pag.innerHTML = html;
  }
}

// ── ARTÍCULO ──────────────────────────────────────────
async function renderArticulo() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  if (!slug) return;

  const posts = await cargarPosts();
  const post  = posts.find(p => p.slug === slug);
  if (!post) {
    document.body.innerHTML = '<p style="padding:40px;color:#aaa">Artículo no encontrado.</p>';
    return;
  }

  const tc = tagClass(post.categoria);
  const nombres = { analisis: 'Análisis', macro: 'Macro', educacion: 'Educación' };

  const header = document.getElementById('article-header');
  if (header) header.innerHTML = `
    <div class="article-cat ${tc}">${nombres[post.categoria]}</div>
    <div class="article-title">${post.titulo}</div>
    <div class="article-meta">${formatFecha(post.fecha)} · ${post.minutos} min de lectura</div>`;

  const body = document.getElementById('article-body');
  if (body) body.innerHTML = post.contenido || '<p>Contenido no disponible.</p>';

  document.title = post.titulo + ' — Gonzalo Rodriguez';

  // Marcar link activo
  document.querySelectorAll('.nav-links-dark a').forEach(a => {
    a.classList.remove('active');
    if (a.href.includes(`cat=${post.categoria}`)) a.classList.add('active');
  });
}

// ── ROUTER ────────────────────────────────────────────
const path = window.location.pathname;
if      (path.includes('seccion'))  renderSeccion();
else if (path.includes('articulo')) renderArticulo();
else                                 renderHome();
