# quietroom-lab

「实验 QuietRoom.org」：左栏收起版主题的 CSS + 配套脚本，打成一个酒馆扩展，只给作者自己测没发布的功能用。不是公开版，别拿去用。

## 装

1. 酒馆 → 扩展 → 安装扩展，填 `https://github.com/amberwangshuo/quietroom-lab`。
2. 用户设置 → UI 主题：导入 `实验 QuietRoom 底座.json`（在 st-themes 的 dist/实验/ 里）并选中它。它只有主题的设置项（模糊、字号、扁平、方头像…），自定义 CSS 是空的——样式由这个扩展提供。
   原来的 QuietRoom 主题留着没关系，但别选中它（选中就是两份 CSS 叠着）。
3. 酒馆助手里把 QuietRoom 的配套脚本关掉（扩展里已经带了一份，两份同时开后启动的那份会让位）。

## 更新

扩展面板里这一项点「更新」（或「全部更新」），刷新页面。不用删、不用重新导入。

## 文件

- `style.css`：实验 QuietRoom.org 2.5 左栏收起版的全部 CSS（和 dist/实验/ 里那个 JSON 的 custom_css 一样）。
- `hp-blog.js`：配套脚本源码；`index.js` 等样式生效后启动它。
- 这些文件由 st-themes/themes/blog/build_theme.py --lab 生成，不要手改。
