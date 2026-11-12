# Film Portfolio — 极光·空间计算风格个人网站

苹果「空间计算」美学 + Bento Grid 布局的个人短片作品集。

## 图片素材用途

| 文件 | 用途 |
|------|------|
| `assets/img/film-01.png` | 导演介绍肖像（1517×858） |
| `assets/img/film-02.png` | 《极光之下》海报（1912×1073） |
| `assets/img/film-03.png` | 《入夜之前》海报（1914×1069） |

## 本地预览

页面使用原生 ES Module（`import PhotoSwipe`），浏览器出于同源策略禁止
`file://` 下加载模块，**请用本地服务器打开**，不要直接双击 `index.html`：

```bash
# 任选其一
npx serve .
python -m http.server 8000
```

## 让「别的电脑」看到这个网站（已按优先级整理）

1. **GitHub Pages（推荐，永久免费 HTTPS）** —— 见下方部署步骤
2. **局域网**：`npx serve --host` 后用 `http://<本机IP>:端口` 访问（需放行防火墙端口）
3. **公网隧道**：`npx localtunnel --port 8000` 或 ngrok，临时分享

## 部署到 GitHub Pages

本机已安装并登录 `gh` CLI（账号 `dhue5`）。

```bash
gh repo create <repo-name> --public --source . --push
# 开启 Pages（托管来自分支 main 的 /root）
gh api -X POST repos/<owner>/<repo-name>/pages \
  -f "source[branch]=main" -f "source[path]=/"
```

站点地址：`https://<owner>.github.io/<repo-name>/`

> 注意：本站为纯静态单页，所有资源用相对路径引用（含 `vendor/`），所以项目页
> （`/repo-name/` 子路径）下不会 404。

## 第三方组件（均已本地化到 `vendor/`，无需 npm / 构建）

| 组件 | 版本 | 用途 | 许可 |
|------|------|------|------|
| [Atropos](https://atroposjs.com) | 2.0.2 | 卡片 3D 视差倾斜（tvOS 手感，支持触屏） | MIT |
| [PhotoSwipe](https://photoswipe.com) | 5.4.4 | 海报灯箱：从缩略图 zoom 展开、多图 ←→ 切换、手势缩放 | MIT |
| [vanilla-lazyload](https://github.com/verlok/vanilla-lazyload) | 19.1.3 | 海报懒加载（`data-src` → 加载后淡入） | MIT |

升级方式：从对应 npm 包复制同名 dist 文件覆盖 `vendor/<组件>/` 即可，
所有调用参数都写在 `app.js` / `styles.css` 中，不依赖构建工具。

## 技术要点

- **深黑背景 + 极光流光**：纯 CSS 多层超大径向/锥形渐变 + `blur(60-100px)`，
  仅动画 `transform/opacity`（合成器线程），`prefers-reduced-motion` 时冻结静态帧
- **玻璃拟态卡**：`backdrop-filter: blur() saturate()` + 1px 白 alpha 描边 +
  顶部高光渐变；呼吸光效 = 静态阴影伪元素只动画 opacity/scale（60fps）
- **Atropos 视差倾斜**：`rotateX/rotateY ±5°` + 自定义青紫高光层（screen 混合），
  鼠标 hover 触发，触屏横向滑动触发、纵向滑动正常滚页；减动效时整体跳过
- **滚动叙事**：IntersectionObserver 一次性触发，卡片淡入上移、逐张级联入场
- **PhotoSwipe 灯箱**：点击海报从缩略图位置 zoom 展开，多图 ←→ / 滑动切换，
  点背景或 ✕ 关闭；沿用站点玻璃 UI（关闭按钮圆形玻璃化，隐藏计数与缩放按钮）
- **懒加载**：vanilla-lazyload 在距视口 300px 时替换 `data-src`，加载完成淡入；
  组件缺失时自动回退为直接加载（不会白屏）
- **Bento Grid**：12 列基格 + span 覆盖 + `grid-auto-flow: dense`，clamp 流式排版
- **数据驱动**：`FILMS` 数据（片名/年份/类型/简介/主创/电影节/poster 尺寸）完整保留在
  `app.js`，页面当前只渲染海报；想恢复文字介绍时直接用这些字段
