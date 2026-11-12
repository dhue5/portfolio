/* ============================================================
   FILM PORTFOLIO · app.js（ES Module）
   ------------------------------------------------------------
   数据驱动渲染 · Atropos 3D 视差倾斜 · PhotoSwipe 海报灯箱
   vanilla-lazyload 海报懒加载
   纯静态，无构建步骤，GitHub Pages 子路径（/portfolio/）可直接部署
   ============================================================ */
import PhotoSwipe from './vendor/photoswipe/photoswipe.esm.min.js';

/* ---------- 环境探测 ---------- */
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const COARSE = window.matchMedia('(pointer: coarse)').matches;

/* GitHub Pages 项目页运行于子路径（/portfolio/）：资源一律相对解析 */
const BASE = new URL('./', document.baseURI);
const resolve = (p) => BASE.href.replace(/\/$/, '') + '/' + p.replace(/^\.?\//, '');

/* 1×1 透明占位图：懒加载完成前撑住布局，避免 CLS */
const PLACEHOLDER =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

/* ---------- 站点信息（可编辑） ---------- */
const SITE = {
  name: '王歌词',
  nameEn: 'WANG GECI',
  bio: [
    `你好，我是<strong>王歌词</strong>，一名专注短片的独立电影人。2016 年起投身独立影像创作，作品先后入围国内外十余个短片电影节，以<strong>「时间 × 情绪」</strong>为母题，在有限片长里完成一次完整的情绪转弯。`,
    `我偏爱把「消失」拍成可见的东西——消失的方言、消失的街区、消逝前最后一通无线电。每部短片都是一次瞄准：对准一个念头、一个人、一段从未被说出的日常。海报即入口，欢迎进入我的片库。`,
  ],
  tags: ['剧情短片', '纪录片', '科幻实验', '胶片刻录', '跨媒介影像'],
  // 个人视觉（自我介绍图 = film-01.png）
  introAlt: '王歌词——个人视觉肖像',
  email: 'vigourfilm@163.com',
  emailLabel: 'vigourfilm@163.com',
};

/* ---------- 电影库（可编辑）
   poster 留空则自动生成渐变海报；
   posterW / posterH 为海报原始像素尺寸（PhotoSwipe 计算缩放用） ---------- */
const FILMS = [
  {
    id: 'aurora',
    title: '极光之下',
    titleEn: 'Under the Aurora',
    year: '2024',
    duration: '12′',
    role: '导演 / 编剧',
    genres: ['剧情', '科幻'],
    logline: '南纬七十度的极夜里，一段跨语言的电波之恋。',
    synopsis: '在南极科考站的最后一夜，气象员收到一段来自四十年前的无线电波，内容竟是与当下同步的对话。当极光在天空展开，两个时代的人在频道里相遇——关于距离、时间，与从未寄出的告白。',
    cast: ['周屿', '艾拉', '陈默'],
    festivals: ['克莱蒙费朗国际短片节', '上海国际电影节短片单元'],
    poster: './assets/img/film-02.png',
    posterW: 1912,
    posterH: 1073,
    still: '',
    videoUrl: '#',
  },
  {
    id: 'nightfall',
    title: '入夜之前',
    titleEn: 'Before Nightfall',
    year: '2023',
    duration: '15′',
    role: '导演 / 摄影',
    genres: ['剧情', '纪录'],
    logline: '末班渡轮上的守夜人，最后一次巡视城市的水岸。',
    synopsis: '一条航运停摆前夕的渡轮，一位即将退休的守夜人，以及渡轮上最后七天的城市倒影。胶片质感记录下霓虹消退、人声渐远的物理之熵。',
    cast: ['老周', '小雨'],
    festivals: ['FIRST 青年电影展', '北京国际短片联展'],
    poster: './assets/img/film-03.png',
    posterW: 1914,
    posterH: 1069,
    still: '',
    videoUrl: '#',
  },
];

/* ============================================================
   工具
   ============================================================ */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* 海报原始尺寸（未填 posterW/H 时用生成海报的默认画幅） */
function posterSize(f) {
  if (f.posterW && f.posterH) return { w: f.posterW, h: f.posterH };
  return { w: 600, h: 900 };
}

/* 自动生成渐变海报（poster 留空时）——深黑底 + 极光渐变 + 片名 */
function genPoster(f, w = 600, h = 900) {
  const hue = [210, 168, 258, 330][FILMS.indexOf(f) % 4];
  const glow = `hsl(${hue} 95% 60%)`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <defs>
      <radialGradient id="g" cx="35%" cy="20%" r="90%">
        <stop offset="0%" stop-color="${glow}" stop-opacity=".55"/>
        <stop offset="55%" stop-color="hsl(${hue} 60% 22%)"/>
        <stop offset="100%" stop-color="#04060a"/>
      </radialGradient>
      <filter id="b"><feGaussianBlur stdDeviation="2"/></filter>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#g)"/>
    <rect width="${w}" height="${h}" y="${h - 3}" fill="hsl(${hue} 95% 65% / .7)"/>
    <text x="34" y="${h - 60}" font-family="system-ui,sans-serif" font-size="46" font-weight="700"
          letter-spacing="6" fill="#eef4ff">${esc(f.title)}</text>
    <text x="36" y="${h - 26}" font-family="ui-monospace,monospace" font-size="16" letter-spacing="3"
          fill="rgba(238,244,255,.55)">${esc(f.titleEn.toUpperCase())}</text>
  </svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

/* ============================================================
   渲染：电影卡（Atropos 结构：scale / rotate / inner）
   ============================================================ */
function filmCardHTML(f, i) {
  const src = f.poster ? resolve(f.poster) : genPoster(f);
  const { w, h } = posterSize(f);
  const still = f.still
    ? `<img class="film-card__still" src="${resolve(f.still)}" alt="" loading="lazy" decoding="async" aria-hidden="true">`
    : '';
  return `
    <div class="card glass film-card film-card--wide atropos" role="button" tabindex="0"
         data-atropos data-reveal data-film="${f.id}"
         aria-label="查看《${esc(f.title)}》海报大图"
         style="transition-delay:${Math.min(i * 70, 280)}ms">
      <div class="atropos-scale">
        <div class="atropos-rotate">
          <div class="atropos-inner">
            <span class="film-card__media">
              <img class="film-card__poster" src="${PLACEHOLDER}" data-src="${src}"
                   width="${w}" height="${h}" alt="《${esc(f.title)}》海报" decoding="async">
              ${still}
              <span class="film-card__hover-title" aria-hidden="true">${esc(f.title)}</span>
            </span>
          </div>
        </div>
      </div>
      <span class="sheen" aria-hidden="true"></span>
    </div>`;
}

function renderFilms() {
  const grid = $('#work-grid');
  // 所有短片海报全部展示
  grid.innerHTML = FILMS.map((f, i) => filmCardHTML(f, i)).join('');
}

function renderContact() {
  const slot = $('#contact-slot');
  slot.innerHTML = `
    <a class="social-btn social-btn--primary" href="mailto:${esc(SITE.email)}" aria-label="给我发邮件">
      ✉ ${esc(SITE.emailLabel)}
    </a>`;
}

/* ============================================================
   视差倾斜：Atropos（鼠标 hover 倾斜；触屏横向滑动；减动效时跳过）
   ============================================================ */
const Tilt = (() => {
  function init() {
    if (REDUCED || typeof window.Atropos === 'undefined') return;
    $$('[data-atropos]').forEach((el) => {
      if (el.__atropos__) return;
      new window.Atropos({
        el,
        rotateXMax: 5,          // 与原先自写 tilt 的 ±5° 一致
        rotateYMax: 5,
        rotateTouch: COARSE ? 'scroll-y' : true,
        duration: 300,
        shadow: false,
        highlight: true,
        activeOffset: 40,
      });
    });
  }
  return { init };
})();

/* ============================================================
   懒加载：vanilla-lazyload（data-src → src，加载完成淡入）
   ============================================================ */
const Lazy = (() => {
  function loadAllNow() {
    $$('img[data-src]').forEach((img) => {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
      img.classList.add('is-loaded');
    });
  }

  function init() {
    const imgs = $$('img[data-src]');
    if (!imgs.length) return;
    if (typeof window.LazyLoad === 'undefined') return loadAllNow();
    try {
      new window.LazyLoad({
        elements_selector: 'img[data-src]',
        threshold: 300,
        callback_loaded: (el) => el.classList.add('is-loaded'),
        callback_error: (el) => el.classList.add('is-loaded'),
      });
    } catch (err) {
      console.warn('[portfolio] LazyLoad 初始化失败，回退为直接加载', err);
      loadAllNow();
    }
  }
  return { init };
})();

/* ============================================================
   灯箱：PhotoSwipe 5（点击海报卡打开，从缩略图 zoom 展开）
   ============================================================ */
const Gallery = (() => {
  function buildItems() {
    return FILMS.map((f) => {
      const { w, h } = posterSize(f);
      return {
        src: f.poster ? resolve(f.poster) : genPoster(f, w, h),
        width: w,
        height: h,
        alt: `《${f.title}》海报`,
        // 让 PhotoSwipe 从卡内缩略图位置 zoom 展开
        element: $(`[data-film="${f.id}"] .film-card__poster`),
      };
    });
  }

  function open(id) {
    const index = FILMS.findIndex((f) => f.id === id);
    if (index < 0) return;
    const pswp = new PhotoSwipe({
      dataSource: buildItems(),
      index,
      mainClass: 'pswp--portfolio',
      showHideAnimationType: 'zoom',
      bgOpacity: 0.94,
      counter: false,     // 不显示「1 / 2」计数
      zoom: false,        // 不显示缩放按钮（海报看图即可）
      closeTitle: '关闭',
      arrowPrevTitle: '上一张',
      arrowNextTitle: '下一张',
    });
    pswp.init();
  }

  function init() {
    const grid = $('#work-grid');
    // 鼠标 / 触屏点击
    grid.addEventListener('click', (e) => {
      const card = e.target.closest('[data-film]');
      if (card) open(card.dataset.film);
    });
    // 键盘 Enter / Space 激活（卡片是 role="button" 的 div）
    grid.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') return;
      const card = e.target.closest('[data-film]');
      if (!card) return;
      e.preventDefault();
      open(card.dataset.film);
    });
  }

  return { init, open };
})();

/* ============================================================
   滚动渐显：IO 一次性触发 → 元素淡入上移（once）
   ============================================================ */
const Reveal = (() => {
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const el = entry.target;
      io.unobserve(el);
      el.classList.add('is-revealed');
    }
  }, { threshold: 0.3, rootMargin: '0px 0px -8% 0px' });

  function scan() {
    $$('[data-reveal]').forEach(el => io.observe(el));
  }
  return { scan, io };
})();

/* ============================================================
   初始化
   ============================================================ */
function init() {
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  renderFilms();
  renderContact();

  Tilt.init();      // Atropos：卡片 3D 视差
  Lazy.init();      // 海报懒加载
  Reveal.scan();    // 滚动入场
  Gallery.init();   // PhotoSwipe 灯箱
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
