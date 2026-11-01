// 实验 QuietRoom.org：左栏收起版主题 + 配套脚本，打成酒馆扩展，只给作者自己测试用。
// style.css 由酒馆按 manifest 的 css 字段加载（和这个文件并行）。脚本一启动就看主题在不在（:root 上有没有主题的变量），
// 看不到就不建左栏、之后只盯 #custom-style 的变化，不会再回头看——所以这里先等样式真的生效，再启动脚本。
(async () => {
  const ready = () => getComputedStyle(document.documentElement).getPropertyValue('--hp-t-album-title').trim() !== '';
  for (let i = 0; i < 100 && !ready(); i++) await new Promise((r) => setTimeout(r, 100));
  if (!ready()) { console.warn('[QuietRoom lab] style.css 十秒内没生效，脚本不启动'); return; }
  await import('./hp-blog.js');
})();
