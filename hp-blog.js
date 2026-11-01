/* QuietRoom.org 2.5
   作者：王北方。和「QuietRoom.org 2.5」主题一起用（旧的要关掉不能同时开两个）。
   简介：
   1. 顶栏的地址栏可输入：回车跳转——写页面名（ai、lore、settings、me…）打开对应抽屉；写 #42 跳到第 42 篇；
      写 home 回到最新（早的楼层没载进来会自动载）；‹ › 翻到上一篇、下一篇；Reload 回到最新一篇。平时它显示你在看哪一页。
   2. 进站时一个登录页（下面 CONFIG 能改触发频率）：填个昵称（可以记住），点「view my diary」进站；昵称会写进左栏的 about me，还会数你来了几次。
   3. 左栏可以上下滚动：
      · about me：点标题右边的 ✎ 就地改，存在这台设备上。
      · now playing：支持搜歌、网易云链接及本地mp3。
      · guestbook 留言板：访客给你的留言。点「+ sign」写一条：留言的人可以从你的角色里选（带头像），
      · guestbook 里可以打开「drop-ins」：你的角色会随机来留言板留一句（会调用 API，只发角色卡人设；默认关，频率可选；说什么见下面 CONFIG 的 dropTopics）。
      · album 相册：「+ add」贴图片直链，或「from device」从手机 / 电脑选；
      最下面一行小字是「本站已运行」：从这段聊天的第一篇算起第几天。
      手机上左栏收起来，地址栏左边的 ♡ 键点一下从左边拉出来。
   4. 日夜：地址栏最右边一个小小的 ☾ / ☀，点一下换夜间 / 日间。
   5. 电脑上标签页那一排最右边一颗小胶囊：平时是日期和时间，放歌时换成 ♪ 歌名；点一下播放 / 暂停。
   6. 留言框的占位字换成主题里写的 say hi（扩展改掉了也会改回来）；框太窄放不下时，一个字一个字打出来。
   7. 角色抽屉是好友页：收藏的头像下面一行亲密度 ♥（按和他的聊天记录多少），正在聊的标 now chatting，标题后面写好友数。
   8. 扩展塞进顶栏的标签写它的名字（Horae 记忆系统 → Horae）。
   文字都从主题 CSS 最上面的「可以改的内容」里读，改那里就行；下面 CONFIG 只放脚本自己的开关。 */

// 想改偏好就改下面这些：酒馆助手 → 脚本库 → 点本脚本的编辑（铅笔）。改完保存，刷新一下酒馆
const CONFIG = {
  showLogin: true,         // 进站登录页：改成 false 就再也不弹
  // 登录页多久弹一次，把引号里的 session 换成下面三个之一（引号留着）：
  //   'load'    每次打开或刷新酒馆都弹
  //   'session' 关掉浏览器再打开才弹，刷新不弹（默认）
  //   'once'    勾了 remember me、记住昵称以后就不再弹
  loginEvery: 'session',
  // 默认歌单：歌单还空着的时候用这里的（想分享给别人一份现成的歌单就写在这里）。
  // 每首写成 { title: '歌名', artist: '歌手', url: 'mp3 直链，或网易云歌曲链接 / id', cover: '封面图直链（可以不写）' }
  playlist: [],
  volume: 0.8,             // 音量 0 到 1
  // 搜歌：歌单里多一个搜索框，搜网易云、点歌名就放；网易云链接也改走这里。
  // 走的是第三方公开的 Meting 接口：会员歌能不能放、接口哪天不能用，都看接口那边，不保证。false 就关掉
  musicSearch: true,
  // 留言框的占位字（say hi to the webmaster…）一行放不下时会一个字一个字打出来。电脑上框宽、放得下，平时是不打的；
  // 改成 'always' 就算放得下也一直打。不想要这个动效就改成 false，放不下的部分直接截掉
  typingPlaceholder: true,
  // 几个公开接口：搜不到就问下一个；放歌时一个不行换下一个（公益接口时好时坏，多放几个）。
  // 后三个只管放歌、不管搜歌。
  musicApi: ['https://api.qijieya.cn/meting/', 'https://api.i-meto.com/meting/api', 'https://api.injahow.cn/meting/',
    'https://api.amarea.cn/meting/', 'https://api.moeyao.cn/meting/'],
  // 角色来留言板串门时，每次随机抽一件「这次留言说什么」交给 AI。想让他们说别的，就在这里加、删、改，一行一件。
  // {user} 会自动换成你的名字
  dropTopics: [
    '说一件你今天刚遇到的小事，带一点当时的心情',
    '问{user}一个只有你会问的问题',
    '抱怨或吐槽一件最近让你烦的事',
    '说你此刻正在做什么、看见了什么',
    '叮嘱{user}一句，用你自己的方式关心',
    '想起和{user}之间的一件旧事，随口提一句',
    '留一个小约定或邀请',
    '只留一句没头没尾、只有你们俩懂的话',
    '说一句你现在的心情，不解释原因',
    '顺手留下一个你觉得{user}会喜欢的东西（一首歌、一句诗、一个地方）',
    '随口说一句你对{user}最近写的东西的看法，像朋友那样，有话直说',
  ],
  // 扩展塞进顶栏的标签（比如记忆插件）默认写它自己的名字，太长或不喜欢就在这里改名：
  // 左边写它现在标签上显示的字，右边写你想显示的，一行一个。记忆表格默认叫 memo；不要就删掉那行
  tabNames: { '增强记忆': 'memo' },
};

(function () {
  'use strict';
  // 酒馆助手把脚本放在一个隐藏的 iframe 里跑，酒馆的页面是它的 parent。__HP_SELF 只给测试页用
  const win = window.parent && window.parent !== window && !window.__HP_SELF ? window.parent : window;
  const doc = win.document;
  const KEY = { nick: 'hp-blog-nick', visits: 'hp-blog-visits', last: 'hp-blog-last', entered: 'hp-blog-entered',
    list: 'hp-blog-playlist', track: 'hp-blog-track', mode: 'hp-blog-mode', night: 'hp-blog-night',
    drop: 'hp-blog-dropby' };   // about me 和留言板走 SRV（存酒馆服务器），本机的 hp-blog-about / hp-blog-guestbook 只当后备
  const PAGES = [
    { id: 'ai-config-button', alias: ['ai', 'preset', 'presets'] },
    { id: 'sys-settings-button', alias: ['api', 'connect', 'connection'] },
    { id: 'advanced-formatting-button', alias: ['fmt', 'format', 'formatting'] },
    { id: 'WI-SP-button', alias: ['lore', 'wi', 'worldinfo', 'world'] },
    { id: 'user-settings-button', alias: ['user', 'settings', 'setting'] },
    { id: 'backgrounds-button', alias: ['bg', 'walls', 'wall', 'background'] },
    { id: 'extensions-settings-button', alias: ['ext', 'extras', 'extensions'] },
    { id: 'persona-management-button', alias: ['me', 'about', 'about-me', 'aboutme', 'persona'] },
    { id: 'rightNavHolder', alias: ['pals', 'friends', 'chars', 'characters'] },
  ];
  const cleanups = [];
  let built = false;

  /* ---------- 小工具 ---------- */
  // 这台设备的浏览器存储（localStorage）。写不进去的时候（存满了——记忆类扩展常把它占满；或者 App 不让写），
  // 原来是悄悄存不上、点了保存「什么都没变」；现在改存进酒馆设置里的 quietroom.local，读的时候两边都看
  const spare = () => {
    const c = ctx();
    if (!c || !c.extensionSettings) return null;
    const q = (c.extensionSettings.quietroom = c.extensionSettings.quietroom || {});
    return (q.local = q.local || {});
  };
  const ls = {
    get: (k) => {
      let v = null;
      try { v = win.localStorage.getItem(k); } catch (e) { /* 读不了 */ }
      if (v != null) return v;
      const sp = spare();
      return sp && k in sp ? sp[k] : null;
    },
    set: (k, v) => {
      try { win.localStorage.setItem(k, v); return; } catch (e) { /* 写不进去，改存酒馆设置 */ }
      const sp = spare(); const c = ctx();
      if (sp) { sp[k] = String(v); if (c.saveSettingsDebounced) c.saveSettingsDebounced(); }
    },
    del: (k) => {
      try { win.localStorage.removeItem(k); } catch (e) { /* */ }
      const sp = spare();
      if (sp && k in sp) { delete sp[k]; const c = ctx(); if (c.saveSettingsDebounced) c.saveSettingsDebounced(); }
    },
  };
  // 存在酒馆服务器的设置里（extension_settings.quietroom，换设备、换浏览器都在）；拿不到酒馆就退回这台设备
  const SRV = {
    get(k) {
      const c = ctx();
      const box = c && c.extensionSettings && c.extensionSettings.quietroom;
      if (box && box[k] !== undefined) return box[k];
      try { return JSON.parse(win.localStorage.getItem(`hp-blog-${k}`) || 'null'); } catch (e) { return null; }
    },
    set(k, v) {
      const c = ctx();
      if (c && c.extensionSettings && c.saveSettingsDebounced) {
        c.extensionSettings.quietroom = c.extensionSettings.quietroom || {};
        c.extensionSettings.quietroom[k] = v;
        c.saveSettingsDebounced();
      }
      try { win.localStorage.setItem(`hp-blog-${k}`, JSON.stringify(v)); } catch (e) { /* 本机这份只是备份，存不进去没关系 */ }
    },
  };
  const ss = {
    get: (k) => { try { return win.sessionStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { win.sessionStorage.setItem(k, v); } catch (e) { /* */ } },
  };
  const h = (tag, cls, text) => {
    const el = doc.createElement(tag);
    if (cls) el.className = cls;
    if (text != null) el.textContent = text;
    return el;
  };
  // 读主题 CSS 里的文字变量："quiet room" → quiet room；\A 是换行
  const cssText = (name, fallback = '') => {
    let v = win.getComputedStyle(doc.documentElement).getPropertyValue(name).trim();
    if (!v) return fallback;
    if (/^["']/.test(v)) v = v.slice(1, -1);
    // CSS 字符串里的转义：\A（换行）在 Safari 上读回来是小写 \a，别的字符也可能写成 \2661 这样
    return v.replace(/\\([0-9a-fA-F]{1,6}) ?/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16))).replace(/\\(.)/g, '$1');
  };
  const cssString = (t) => '"' + String(t).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\A ') + '"';
  const themeOn = () => !!cssText('--hp-t-album-title');   // 只认 2.0 的主题（1.0 没有这个变量），免得在 1.0 上放一个没样式的相册
  const chat = () => doc.getElementById('chat');
  const entries = () => [...doc.querySelectorAll('#chat > .mes[mesid]')];

  let userJumpAt = 0;   // 自己点了跳转（地址栏 #42、‹ ›）：流式保护别把它当成被弹回去
  const bounded = () => chat()?.dataset.ttChatSurface === 'bounded';   // TT（TauriTavern）开了聊天虚拟化：页面上只留屏幕附近的几十条
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const firstId = () => { const l = entries(); return l.length ? +l[0].getAttribute('mesid') : NaN; };
  const lastId = () => { const l = entries(); return l.length ? +l[l.length - 1].getAttribute('mesid') : NaN; };
  // 一条消息滚到聊天区顶上（不动画）：酒馆和 TT 都是按「现在的位置」算一次就滚过去，刚载进来的几篇还在长高、图片还在加载，
  // 滚完往往差一截（#70 落在 #60）。这里对一次不算完：之后两三秒里每 150ms 再对一次，直到连着三次没动；
  // 中途你自己滚了（滚轮、手指、键盘）就不再替你挪
  function settle(mes, { smooth = true } = {}) {
    const c = chat();
    if (!c || !mes) return;
    const stamp = userJumpAt = Date.now();
    const off = () => mes.getBoundingClientRect().top - c.getBoundingClientRect().top;
    if (smooth && Math.abs(off()) < c.clientHeight * 3) mes.scrollIntoView({ block: 'start', behavior: 'smooth' });
    else c.scrollTop += off();
    mes.animate([{ boxShadow: '0 0 0 2px rgba(95,111,143,0.55)' }, { boxShadow: '0 0 0 2px rgba(95,111,143,0)' }], { duration: 1400 });
    let touched = false, still = 0, n = 0;
    const mark = () => { touched = true; };
    const evs = ['wheel', 'touchstart', 'keydown'];
    evs.forEach((t) => c.addEventListener(t, mark, { passive: true }));
    const stop = () => { clearInterval(timer); evs.forEach((t) => c.removeEventListener(t, mark)); };
    const timer = setInterval(() => {
      n++;
      if (touched || userJumpAt !== stamp || !mes.isConnected || n > 24) return stop();
      if (n < 4) return;   // 前 600ms 让平滑滚动自己走完
      const d = off();
      if (Math.abs(d) > 2) { userJumpAt = stamp; c.scrollTop += d; still = 0; } else if (++still >= 3) stop();
    }, 150);
  }
  function jumpTo(mes) { settle(mes); }
  // 把第 id 楼弄到页面上来：
  // · 酒馆只显示最近一截时：一下下点「显示更多」，直到那一楼出来（最多 60 下）
  // · TT 虚拟化：没有「显示更多」，页面上那一截是跟着滚动位置换的。按已装上的那几条的平均高度估一下距离，滚过去等它换，再估再滚，一般三五下就到
  async function reveal(id) {
    const find = () => doc.querySelector(`#chat > .mes[mesid="${id}"]`);
    let mes = find();
    if (mes || !(id >= 0)) return mes;
    const c = chat();
    if (!c) return null;
    showTip('opening older entries… ₍ᐢ. .ᐢ₎');
    userJumpAt = Date.now();
    if (bounded()) {
      const total = (ctx()?.chat || []).length || 1;
      for (let tries = 0; !mes && tries < 40; tries++) {
        const list = entries();
        const f = firstId(), l = lastId();
        let top;
        if (!list.length || isNaN(f)) top = c.scrollHeight * (id / total);
        else {
          const span = list[list.length - 1].getBoundingClientRect().bottom - list[0].getBoundingClientRect().top;
          const avg = Math.max(40, span / list.length);
          top = c.scrollTop + (id < f ? (id - f) * avg - c.clientHeight * 0.2 : (id - l) * avg + c.clientHeight * 0.2);
        }
        const before = `${f}-${l}-${c.scrollHeight}`;
        c.scrollTop = Math.max(0, Math.min(c.scrollHeight, top));
        userJumpAt = Date.now();
        for (let w = 0; w < 25 && `${firstId()}-${lastId()}-${c.scrollHeight}` === before && !find(); w++) await sleep(80);
        mes = find();
      }
      return mes;
    }
    const was = firstId();   // 补装之前页面上最早的一楼：回到最新时，比它早的都收回去（见 fold）
    if (isFinite(was) && was > id) revealedBelow = Math.min(revealedBelow, was);
    for (let tries = 0; !mes && tries < 60; tries++) {
      const more = doc.getElementById('show_more_messages');
      const first = entries()[0];
      if (!first || +first.getAttribute('mesid') <= id) break;
      if (!more) {
        // 「显示更多」按钮不在（有的扩展会把它删掉、重画聊天时也会丢）：让酒馆自己的 /chat-jump 去补早的楼层（它内部会调 showMoreMessages）
        const c2 = ctx();
        if (!c2 || typeof c2.executeSlashCommandsWithOptions !== 'function') break;
        try { await c2.executeSlashCommandsWithOptions(`/chat-jump ${id}`); } catch (e) { break; }
        for (let w = 0; w < 40 && !find(); w++) await sleep(100);
        mes = find();
        break;
      }
      more.click();
      for (let w = 0; w < 30 && entries()[0] === first; w++) await sleep(100);
      mes = find();
    }
    return mes;
  }
  function jumpToLoaded(mes) { settle(mes, { smooth: false }); }
  // 翻早的楼层时补装进页面的那些消息，看完回到最新就再收起来：页面上只留跳转前原有的那一截，「显示更多」按钮放回去。
  // 只收脚本自己装的，你手动点「显示更多」点开的不碰；正在编辑的消息也不碰。上千楼的聊天靠这个不越装越多
  let revealedBelow = Infinity;
  function fold() {
    const c = chat();
    if (!c || bounded() || !isFinite(revealedBelow)) return 0;
    const old = entries().filter((m) => +m.getAttribute('mesid') < revealedBelow);
    revealedBelow = Infinity;
    if (!old.length || doc.querySelector('#chat .mes textarea, #curEditTextarea')) return 0;
    old.forEach((m) => m.remove());
    if (firstId() > 0 && !doc.getElementById('show_more_messages')) {
      const btn = doc.createElement('div');
      btn.id = 'show_more_messages';
      btn.textContent = 'Show more messages';
      c.prepend(btn);
    }
    return old.length;
  }
  function toBottom() {
    userJumpAt = Date.now();
    const folded = fold();
    const c = chat();
    if (c) c.scrollTo({ top: c.scrollHeight, behavior: folded ? 'auto' : 'smooth' });
  }
  function openDrawerPage() {
    const icon = doc.querySelector('#top-settings-holder .drawer-icon.openIcon');
    if (!icon) return null;
    const holder = icon.closest('.drawer');
    const i = PAGES.findIndex((p) => p.id === holder?.id);
    return i < 0 ? null : { i, holder };
  }
  function clickDrawer(i) {
    const t = doc.querySelector(`#${PAGES[i].id} > .drawer-toggle`);
    if (t) t.click();
  }

  /* ---------- 日夜：<html> 上加 hp-night，颜色由主题 CSS 的 :root.hp-night 换 ---------- */
  const isNight = () => doc.documentElement.classList.contains('hp-night');
  function setNight(on) {
    doc.documentElement.classList.toggle('hp-night', on);
    ls.set(KEY.night, on ? '1' : '0');
  }

  /* ---------- 1. 地址栏 ---------- */
  let addr, input, tip, tipTimer;
  function host() {
    return cssText('--hp-t-url', 'quietroom.neocities.org/').split('/')[0];
  }
  function pageName(i) {
    return cssText(`--hp-page-${i + 1}`) || cssText(`--hp-tab-${i + 1}`).replace(/\s+/g, '-') + '.html';
  }
  function currentAddress() {
    const open = openDrawerPage();
    if (open) return `${host()}/${open.i === 5 ? 'walls.html' : pageName(open.i)}`;
    // 正在看的那篇：聊天区里第一篇露出来的
    const c = chat();
    const list = entries();
    if (!c || !list.length) return `${host()}/index.html`;
    const top = c.getBoundingClientRect().top + 30;
    const seen = list.find((m) => m.getBoundingClientRect().bottom > top) || list[list.length - 1];
    return `${host()}/diary/entry-${seen.getAttribute('mesid')}.html`;
  }
  function showTip(text) {
    if (!tip) return;
    tip.textContent = text;
    tip.classList.add('is-on');
    clearTimeout(tipTimer);
    tipTimer = setTimeout(() => tip.classList.remove('is-on'), 2200);
  }
  // 小表单的「保存」：点按钮直接存，不靠浏览器的表单提交（有的内置浏览器会把提交悄悄拦下，点了没反应）；
  // 单行输入框里按回车也存（正在打中文、选字时的回车不算）。存的时候出了错，把原因写在小提示里
  function onSave(form, btn, fn) {
    form.noValidate = true;
    btn.type = 'button';
    let busy = false;
    const run = async (e) => {
      if (e) e.preventDefault();
      if (busy) return;
      busy = true;
      try { await fn(); } catch (err) { showTip(`couldn't save · ${(err && err.message) || err}`); } finally { busy = false; }
    };
    btn.addEventListener('click', run);
    form.addEventListener('submit', run);
    // 捕获阶段：输入框自己会拦住按键（免得触发酒馆的快捷键），在它前面先看到回车
    form.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.isComposing && e.keyCode !== 229 && e.target.tagName === 'INPUT' && e.target.type !== 'file') run(e);
    }, true);
  }
  function refreshAddress() {
    if (input && doc.activeElement !== input) input.value = currentAddress();
  }
  function go(raw) {
    let q = String(raw || '').trim().toLowerCase();
    q = q.replace(/^https?:\/\//, '');
    const hst = host().toLowerCase();
    if (q.startsWith(hst)) q = q.slice(hst.length);
    q = q.replace(/^\/+/, '').replace(/\.html?$/, '').replace(/^diary\//, '');
    const num = q.match(/^(?:#|entry[-_ ]?|no\.?\s*)?(\d+)$/);
    if (num) {
      const n = (ctx()?.chat || []).length;
      if (n && +num[1] >= n) { showTip(`there's no entry #${num[1]} (；´・ω・\`)`); return; }
      reveal(+num[1]).then((mes) => {
        if (mes) { closeOpenDrawer(); jumpToLoaded(mes); showTip(`entry #${num[1]} ✧`); }
        else showTip(`couldn't open entry #${num[1]} (｡•́︿•̀｡)`);
      });
      return;
    }
    if (q === '' || q === 'home' || q === 'index' || q === 'diary' || q === 'latest') { closeOpenDrawer(); toBottom(); showTip('home sweet home ♡'); return; }
    if (q === 'top' || q === 'first') { closeOpenDrawer(); chat()?.scrollTo({ top: 0, behavior: 'smooth' }); showTip('back to the top ⋆˙⟡'); return; }
    const words = (i) => [...PAGES[i].alias, cssText(`--hp-tab-${i + 1}`), cssText(`--hp-tabm-${i + 1}`), pageName(i).replace(/\.html?$/, '')]
      .map((w) => w.toLowerCase().replace(/\s+/g, '-')).filter(Boolean);
    const i = PAGES.findIndex((_, k) => words(k).includes(q.replace(/\s+/g, '-')));
    if (i >= 0) {
      const open = openDrawerPage();
      if (!open || open.i !== i) clickDrawer(i);
      showTip(`opening ${pageName(i)} ₍ᐢ. .ᐢ₎`);
      return;
    }
    showTip('404 · page not found (´•︵•`)');
  }
  function closeOpenDrawer() {
    const open = openDrawerPage();
    if (open) clickDrawer(open.i);
  }
  function step(dir) {
    const c = chat();
    const list = entries();
    if (!c || !list.length) return;
    const top = c.getBoundingClientRect().top + 30;
    let cur = list.findIndex((m) => m.getBoundingClientRect().bottom > top);
    if (cur < 0) cur = list.length - 1;
    const curTop = list[cur].getBoundingClientRect().top;
    let target = dir < 0 ? (curTop < top - 40 ? cur : cur - 1) : cur + 1;
    // 页面上那一截的头尾外面还有楼层（酒馆只显示最近一截、或 TT 的虚拟化列表）：按楼层号去弄出来
    if (target < 0 || target >= list.length) {
      const id = +list[cur].getAttribute('mesid') + (target < 0 ? -1 : 1);
      if (id >= 0 && id < ((ctx()?.chat || []).length || Infinity)) reveal(id).then((m) => { if (m) jumpToLoaded(m); });
      return;
    }
    target = Math.max(0, Math.min(list.length - 1, target));
    jumpTo(list[target]);
  }
  function buildAddress() {
    const bar = doc.getElementById('top-bar');
    if (!bar) return;
    addr = h('div'); addr.id = 'hp-addr';
    const back = h('button', 'hp-nav', '‹'); back.title = 'previous entry';
    const fwd = h('button', 'hp-nav', '›'); fwd.title = 'next entry';
    const side = h('button', 'hp-side-btn', '♡'); side.title = 'about me';
    const url = h('label', 'hp-url');
    const fav = h('span', 'hp-fav', cssText('--hp-t-favicon', '✧'));
    input = h('input'); input.type = 'text'; input.spellcheck = false; input.autocomplete = 'off';
    input.setAttribute('list', 'hp-pages');
    const goBtn = h('button', 'hp-go', '↵'); goBtn.title = 'go';
    const nightBtn = h('button', 'hp-night-btn');
    const reload = h('button', 'hp-reload', cssText('--hp-t-reload', 'Reload'));
    tip = h('div', 'hp-tip');
    const dl = h('datalist'); dl.id = 'hp-pages';
    ['home', ...PAGES.map((_, i) => pageName(i)), 'top'].forEach((p) => { const o = h('option'); o.value = p; dl.append(o); });
    url.append(fav, input, goBtn, nightBtn);
    addr.append(back, fwd, side, url, reload, tip, dl);
    bar.append(addr);

    back.addEventListener('click', () => step(-1));
    fwd.addEventListener('click', () => step(1));
    reload.addEventListener('click', () => { closeOpenDrawer(); toBottom(); showTip('reloaded ✧ latest entry'); });
    const paintNight = () => { const on = isNight(); nightBtn.textContent = on ? '☀' : '☾'; nightBtn.title = on ? 'day' : 'night'; };
    nightBtn.addEventListener('mousedown', (e) => e.preventDefault());
    nightBtn.addEventListener('click', (e) => {
      e.preventDefault();
      setNight(!isNight());
      paintNight();
      showTip(isNight() ? 'good night ☾ (－ω－) zzz' : 'good morning ☀ ( ˘ ³˘)♡');
    });
    paintNight();
    side.addEventListener('click', () => doc.body.classList.toggle('hp-side-open'));
    goBtn.addEventListener('mousedown', (e) => { e.preventDefault(); go(input.value); input.blur(); });
    // 点进地址栏：只选中能改的那一小段（楼层号、页面名），手机上不用费劲去点那几个数字
    input.addEventListener('focus', () => setTimeout(() => {
      const v = input.value;
      const m = v.match(/entry-(\d+)\.html$/) || v.match(/\/([^/]+?)\.html$/);
      if (m) { const at = v.lastIndexOf(m[1]); input.setSelectionRange(at, at + m[1].length); } else input.select();
    }, 0));
    input.addEventListener('keydown', (e) => {
      e.stopPropagation(); // 酒馆有全局快捷键，别让地址栏里打的字触发它们
      if (e.key === 'Enter') { e.preventDefault(); go(input.value); input.blur(); }
      if (e.key === 'Escape') { input.blur(); }
    });
    input.addEventListener('blur', () => setTimeout(refreshAddress, 50));
    refreshAddress();

    const mo = new win.MutationObserver(() => refreshAddress());
    mo.observe(doc.getElementById('top-settings-holder'), { subtree: true, attributes: true, attributeFilter: ['class'] });
    let ticking = false;
    const onScroll = () => { if (ticking) return; ticking = true; win.requestAnimationFrame(() => { ticking = false; refreshAddress(); }); };
    const c = chat();
    if (c) c.addEventListener('scroll', onScroll, { passive: true });
    cleanups.push(() => mo.disconnect(), () => c && c.removeEventListener('scroll', onScroll), () => addr.remove());
  }

  /* ---------- 3. 左栏 ---------- */
  let side, scrim;
  const fmt = (s) => (isFinite(s) && s > 0 ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '0:00');

  /* ---- about me：名字 / 心情 / 状态 + 一句签名，可以就地改 ---- */
  function aboutData() {
    // 存在酒馆服务器的设置里（换手机、换浏览器都在）；以前存在这台设备的，SRV 读不到服务器的时候会读回来
    let d = SRV.get('about');
    if (!d || typeof d !== 'object') {
      d = { name: 'guest', mood: '', status: '● online', sign: cssText('--hp-t-sign', '') };
      cssText('--hp-t-about', '').split('\n').forEach((line) => {
        const m = line.match(/^\s*([^:：]+)[:：]\s*(.*)$/);
        if (!m) return;
        const k = m[1].trim().toLowerCase();
        if (k === 'name') d.name = m[2].replace(/\s*♡\s*$/, '');
        else if (k === 'mood') d.mood = m[2];
        else if (k === 'status') d.status = m[2];
      });
      d.fromTheme = true;
    }
    const nick = ls.get(KEY.nick) || ss.get(KEY.nick);
    if (nick && d.fromTheme) d.name = nick;
    return d;
  }
  function renderAbout(box) {
    const d = aboutData();
    box.textContent = '';
    const row = (k, v, cls) => {
      if (!v) return;
      const p = h('div', 'hp-ab-row');
      const b = h('b', cls || null);
      if (/●/.test(v)) { b.append(h('span', 'hp-dot', '● '), v.replace('●', '').trim()); } else b.textContent = v;
      p.append(h('span', null, `${k}: `), b);
      box.append(p);
    };
    row('name', d.name ? `${d.name} ♡` : '');
    row('mood', d.mood);
    row('status', d.status);
    if (d.sign) box.append(h('p', 'hp-sign-line', d.sign));
  }
  function editAbout(box, after) {
    const d = aboutData();
    box.textContent = '';
    const f = h('form', 'hp-ab-form');
    const mk = (label, val, area) => {
      const l = h('label', null, label);
      const i = h(area ? 'textarea' : 'input'); if (!area) i.type = 'text';
      i.value = val || ''; i.maxLength = area ? 120 : 40;
      i.addEventListener('keydown', (e) => e.stopPropagation());
      l.append(i); f.append(l); return i;
    };
    const n = mk('name', d.name), m = mk('mood', d.mood), s = mk('status', d.status), g = mk('signature', d.sign, true);
    const btns = h('div', 'hp-form-btns');
    const ok = h('button', 'hp-mini is-solid', 'save ♡');
    const no = h('button', 'hp-mini', 'cancel'); no.type = 'button';
    btns.append(no, ok); f.append(btns);
    box.append(f);
    setTimeout(() => n.focus(), 30);
    onSave(f, ok, () => {
      SRV.set('about', { name: n.value.trim(), mood: m.value.trim(), status: s.value.trim(), sign: g.value.trim() });
      after();
      showTip('profile updated ♡');
    });
    no.addEventListener('click', after);
  }
  function buildAbout() {
    const about = h('section', 'hp-box hp-about');
    const title = h('div', 'hp-box-title hp-title-row');
    const pen = h('button', 'hp-mini', '✎'); pen.title = 'edit profile';
    title.append(h('span', null, cssText('--hp-t-about-title', 'about me')), pen);
    const photo = h('div', 'hp-photo'); photo.append(h('div', 'hp-itsme'));
    const body = h('div', 'hp-lines');
    about.append(title, photo, body);
    const show = () => { renderAbout(body); about.classList.remove('is-editing'); };
    pen.addEventListener('click', () => {
      if (about.classList.contains('is-editing')) { show(); return; }
      about.classList.add('is-editing'); editAbout(body, show);
    });
    show();
    about.refresh = show;
    return about;
  }

  /* ---- guestbook 留言板：访客给博主的留言，访客从玩家的角色里选，或者自己写名字 ---- */
  function ctx() { try { return win.SillyTavern && win.SillyTavern.getContext ? win.SillyTavern.getContext() : null; } catch (e) { return null; } }
  function charList() {
    const c = ctx();
    const list = (c && Array.isArray(c.characters)) ? c.characters : [];
    return list.filter((x) => x && x.name).map((x) => ({
      name: x.name,
      avatar: x.avatar ? (c.getThumbnailUrl ? c.getThumbnailUrl('avatar', x.avatar) : `/thumbnail?type=avatar&file=${encodeURIComponent(x.avatar)}`) : '',
    })).sort((a, b) => a.name.localeCompare(b.name));
  }
  function gbLoad() {
    const l = SRV.get('guestbook');   // 和 about me 一样存酒馆服务器
    if (Array.isArray(l)) return l;
    // 第一次用：拿主题里写的那几条当样子（mio: ...）
    return cssText('--hp-t-guestbook', '').split('\n').map((line) => {
      const m = line.match(/^\s*([^:：]+)[:：]\s*(.+)$/);
      return m ? { name: m[1].trim(), id: '', avatar: '', text: m[2].trim(), date: '' } : null;
    }).filter(Boolean);
  }
  const gbSave = (l) => SRV.set('guestbook', l);
  function today() { const d = new Date(); return `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`; }
  function avatarEl(e) {
    const a = h('span', 'hp-gb-av');
    if (e.avatar) {
      const img = h('img'); img.src = e.avatar; img.alt = ''; img.loading = 'lazy';
      img.addEventListener('error', () => { img.remove(); a.textContent = (e.name || '?').trim().charAt(0); });
      a.append(img);
    } else a.textContent = (e.name || '?').trim().charAt(0);
    return a;
  }
  /* ---- 角色来签到：打开以后，你的角色会隔一阵随机来留言板留一句（每次调用一次 API，只发角色卡，不发聊天记录）---- */
  const DROP_FREQ = {
    rarely: { gap: 4 * 3600e3, max: 2, label: 'rarely', tip: 'up to 2 a day' },
    sometimes: { gap: 2 * 3600e3, max: 4, label: 'sometimes', tip: 'up to 4 a day' },
    often: { gap: 3600e3, max: 8, label: 'often', tip: 'up to 8 a day' },
  };
  function dropLoad() {
    let d = null;
    try { d = JSON.parse(ls.get(KEY.drop) || 'null'); } catch (e) { d = null; }
    d = Object.assign({ on: false, freq: 'sometimes', last: 0, day: '', n: 0 }, d || {});
    if (!DROP_FREQ[d.freq]) d.freq = 'sometimes';
    return d;
  }
  const dropSave = (d) => ls.set(KEY.drop, JSON.stringify(d));
  // 串门用哪条 API。current = 正文正在用的那条；profile = 酒馆「连接配置」里存好的一份（模型、密钥、地址都在那份里，脚本不经手）。
  // 她定的（11-01）：不做「自己填地址、密钥」的口径——想用便宜的模型，就在酒馆「API 连接」页存一份连接配置，这里选它。
  // 只存模式和配置 id，在酒馆服务器的设置里（extension_settings.quietroom.dropvia），换设备还在；脚本文件分享出去不带。
  // 选了便宜的那条就只走它：它不好使不会悄悄换回正文那条贵的，而是提示
  const VIA_DEF = { mode: 'current', profile: '' };
  const viaSave = (v) => SRV.set('dropvia', { mode: v.mode === 'profile' ? 'profile' : 'current', profile: String(v.profile || '') });
  const viaLoad = () => {
    const raw = SRV.get('dropvia') || {};
    const v = { mode: raw.mode === 'profile' ? 'profile' : 'current', profile: String(raw.profile || '') };
    if ('url' in raw || 'key' in raw || 'model' in raw) viaSave(v);   // 早先实验版存过自己填的地址和密钥：擦掉，别留在设置里
    return v;
  };
  function viaProfiles() {
    const c = ctx();
    const es = c && c.extensionSettings;
    const S = c && c.ConnectionManagerRequestService;
    if (!es || !S || (es.disabledExtensions || []).includes('connection-manager')) return [];
    const list = es.connectionManager && Array.isArray(es.connectionManager.profiles) ? es.connectionManager.profiles : [];
    return list.filter((x) => x && x.id && x.api && (typeof S.isProfileSupported !== 'function' || S.isProfileSupported(x)));
  }
  let dropErr = '';   // 上一次串门失败的原因（给 knock knock 的提示用）
  // 发一次，回文字。选的那条用不了就抛错，不换回正文的 API。
  // 连接配置那条的字数额度给到 600：多半是便宜的模型；而且 DeepSeek V4 这类默认带「思考」的模型，思考的字也算在额度里，150 会被吃光（她试 DeepSeek 时第一次截断、之后全空就是这个）。
  // 回来的东西只要正文：有 reasoning 字段就扔掉；正文里夹着 <think>…</think> 也去掉；正文空而思考不空，提示换个不思考的模型
  const VIA_MAX = 600;
  const viaText = (r) => {
    if (!r || typeof r !== 'object') return String(r || '');
    let s = String(r.content || '').replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
    if (!s && r.reasoning) { dropErr = '模型把字数都花在「思考」上，一句话都没留下。换成不思考的模型（如 deepseek-chat），或把思考关掉'; throw new Error('reasoning only'); }
    return s;
  };
  async function viaGenerate(c, systemPrompt, prompt) {
    const v = viaLoad();
    const messages = [{ role: 'system', content: systemPrompt }, { role: 'user', content: prompt }];
    if (v.mode === 'profile') {
      const p = viaProfiles().find((x) => x.id === v.profile);
      if (!p) { dropErr = '选的那个连接配置不在了，重新选一个 (｡•́︿•̀｡)'; throw new Error('profile gone'); }
      return viaText(await c.ConnectionManagerRequestService.sendRequest(p.id, messages, VIA_MAX));
    }
    return c.generateRaw({ prompt, systemPrompt, responseLength: 150 });
  }
  let dropping = false;
  const clip = (t, n) => (String(t || '').length > n ? String(t).slice(0, n) + '…' : String(t || ''));
  async function dropBy(onDone) {
    const c = ctx();
    if (dropping || !c || typeof c.generateRaw !== 'function') return false;
    // 酒馆的角色列表是「懒加载」的：没打开过的角色只有名字、头像，没有描述（shallow）。先从全部角色里随便挑一个
    // （别连着挑上次来过的那个），没描述就让酒馆把那张卡补全（unshallowCharacter，一次只取这一张）；补完还是没描述就换一个，最多试五次
    const all = (Array.isArray(c.characters) ? c.characters : []).map((x, i) => [x, i]).filter(([x]) => x && x.name);
    if (!all.length) return false;
    const lastVisit = [...gbLoad()].reverse().find((e) => e.visit);
    const others = lastVisit ? all.filter(([x]) => x.name !== lastVisit.name) : [];
    const pick = others.length ? others : all;
    dropping = true;
    let ch = null;
    for (let tries = 0; tries < 5 && !ch; tries++) {
      const [x, i] = pick[Math.floor(Math.random() * pick.length)];
      if (x.shallow && typeof c.unshallowCharacter === 'function') { try { await c.unshallowCharacter(String(i)); } catch (e) { /* 取不到就换一个 */ } }
      const full = (ctx().characters || [])[i] || x;
      if (full.description || full.personality) ch = full;
    }
    if (!ch) { dropping = false; return false; }
    const user = c.name1 || 'the blog owner';
    try {
      const systemPrompt = `You are ${ch.name}. Stay fully in character.\n\n[${ch.name}'s description]\n${clip(ch.description, 1500)}`
        + (ch.personality ? `\n\n[Personality]\n${clip(ch.personality, 400)}` : '')
        + (ch.scenario ? `\n\n[Scenario]\n${clip(ch.scenario, 400)}` : '');
      // 每次抽一件要说的事，再把这个角色最近几次留过的话给它看，别老说一样的
      const topics = (Array.isArray(CONFIG.dropTopics) ? CONFIG.dropTopics : []).filter(Boolean);
      const topic = topics.length ? String(topics[Math.floor(Math.random() * topics.length)]).replace(/\{user\}/g, user) : '';
      const before = gbLoad().filter((e) => e.visit && e.name === ch.name).slice(-3).map((e) => `- ${e.text}`).join('\n');
      const prompt = `${user} keeps a small personal blog, and you just left a line on its guestbook — the way you would scribble on ${user}'s fridge or leave a text, not a review. `
        + (topic ? `This time: ${topic}. ` : '')
        + `The blog can come up now and then, but don't make every note about it, and skip the stock lines (praising the writing, "I'll be back", "update soon"). `
        + `Sound like yourself: your own voice, habits and relationship with ${user}. `
        + (before ? `Don't repeat what you wrote last time:\n${before}\n` : '')
        + 'At most 40 Chinese characters, or 25 words in English; use the same language as your description. '
        + 'No quotation marks, no actions in asterisks, no name or signature. Output only the note.';
      dropErr = '';
      let text = await viaGenerate(c, systemPrompt, prompt);
      text = String(text || '').replace(/<[^>]*>/g, '').split(/\n+/).map((x) => x.trim()).filter(Boolean)[0] || '';
      text = text.replace(new RegExp(`^${ch.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*[:：]\\s*`), '').replace(/^[「“"'*]+|[」”"'*]+$/g, '').trim();
      if (!text) { dropErr = viaLoad().mode === 'current' ? 'nobody came… the reply was empty (｡•́︿•̀｡)' : '对方来了但什么都没说：接口回的是空的'; return false; }
      const avatar = ch.avatar ? (c.getThumbnailUrl ? c.getThumbnailUrl('avatar', ch.avatar) : `/thumbnail?type=avatar&file=${encodeURIComponent(ch.avatar)}`) : '';
      const l = gbLoad();
      l.push({ name: ch.name, id: '', avatar, text: clip(text, 120), date: today(), visit: true });
      // 签到多了只留最近的 30 条（你自己写的不删）
      while (l.filter((e) => e.visit).length > 30) l.splice(l.findIndex((e) => e.visit), 1);
      gbSave(l);
      const d = dropLoad(); const key = new Date().toDateString();
      if (d.day !== key) { d.day = key; d.n = 0; }
      d.n += 1; d.last = Date.now(); dropSave(d);
      showTip(`${ch.name} dropped by ✧`);
      if (onDone) onDone();
      return true;
    } catch (e) {
      // 失败原因写进提示（选了自己的 API 时用中文、带接口原话），控制台里有完整的错
      try { win.console.warn('[QuietRoom] drop-in failed', e); } catch (e2) { /* */ }
      if (!dropErr) {
        const m = String((e && e.message) || e || '').replace(/\s+/g, ' ').trim().slice(0, 80);
        dropErr = viaLoad().mode === 'current' ? "nobody came… check your API (｡•́︿•̀｡)" : `串门失败：${m || '接口没回应'}`;
      }
      return false;
    } finally { dropping = false; }
  }
  // 不每分钟去看：算好下一次「可能有人来」的时刻，只设一个闹钟。够了间隔以后再随机等一会（平均 20 分钟，和原来每分钟 1/20 的骰子一样的分布）；
  // 今天的次数满了就约到明天零点以后。到点时页面在后台、酒馆在生成，就五分钟后再看。闹钟最长六小时，太长的计时器浏览器后台会丢，回到前台重新约
  let dropAlarm = null;
  function dropSchedule(onDone) {
    clearTimeout(dropAlarm); dropAlarm = null;
    const d = dropLoad();
    if (!d.on) return;
    const f = DROP_FREQ[d.freq]; const key = new Date().toDateString();
    const n = d.day === key ? d.n : 0;
    let at;
    if (n >= f.max) { const t = new Date(); t.setHours(24, 0, 0, 0); at = t.getTime() + Math.random() * 3600e3; }
    else at = Math.max(Date.now(), (d.last || 0) + f.gap) + -Math.log(1 - Math.random()) * 20 * 60e3;
    at = Math.min(at, Date.now() + 6 * 3600e3);
    dropAlarm = setTimeout(async () => {
      dropAlarm = null;
      if (doc.hidden || dropping || doc.body.dataset.generating === 'true') { dropAlarm = setTimeout(() => dropSchedule(onDone), 5 * 60e3); return; }
      const dd = dropLoad(); const k2 = new Date().toDateString(); const n2 = dd.day === k2 ? dd.n : 0;
      if (dd.on && n2 < DROP_FREQ[dd.freq].max && Date.now() - (dd.last || 0) >= DROP_FREQ[dd.freq].gap) {
        const ok = await dropBy(onDone);
        if (!ok && dropErr && viaLoad().mode !== 'current') showTip(dropErr);   // 自己选的那条 API 坏了要让人知道；正文那条失败照旧不吭声
      }
      dropSchedule(onDone);
    }, Math.max(1000, at - Date.now()));
  }
  const GB_PAGE = 3;
  function buildGuestbook() {
    const box = h('section', 'hp-box hp-gb');
    const title = h('div', 'hp-box-title hp-title-row');
    const plus = h('button', 'hp-mini is-pill', '+ sign'); plus.title = 'write a note from a visitor';
    title.append(h('span', null, cssText('--hp-t-gb-title', 'guestbook ♡')), plus);
    const ul = h('ul', 'hp-gb-list');
    const form = h('form', 'hp-gb-form');
    const pick = h('select');
    const nameIn = h('input'); nameIn.type = 'text'; nameIn.placeholder = 'name (real or nickname)'; nameIn.maxLength = 24;
    const idIn = h('input'); idIn.type = 'text'; idIn.placeholder = 'id · optional'; idIn.maxLength = 24;
    const msg = h('textarea'); msg.placeholder = 'leave a note ( ˘ ³˘)♡'; msg.maxLength = 200;
    const btns = h('div', 'hp-form-btns');
    const cancel = h('button', 'hp-mini', 'cancel'); cancel.type = 'button';
    const ok = h('button', 'hp-mini is-solid', 'pin it ♡');
    btns.append(cancel, ok);
    form.append(pick, nameIn, idIn, msg, btns);
    // 最下面一行：角色来签到的开关和频率
    const dropRow = h('div', 'hp-gb-drop');
    const dropLab = h('label');
    const dropOn = h('input'); dropOn.type = 'checkbox';
    dropLab.append(dropOn, h('span', null, 'drop-ins ✧'));
    const dropFreq = h('select');
    Object.entries(DROP_FREQ).forEach(([k, v]) => { const o = h('option', null, v.label); o.value = k; o.title = v.tip; dropFreq.append(o); });
    dropFreq.title = 'how often';
    const dropNow = h('button', 'hp-mini', 'knock knock'); dropNow.type = 'button'; dropNow.title = 'someone drops by right now';
    dropRow.append(dropLab, dropFreq, dropNow);
    // 第二行：串门用哪条 API。「当前 API」或酒馆「连接配置」里的每一份（她定的：不做自己填地址密钥的口径，在酒馆里存好一份、这里选就行）
    const viaRow = h('div', 'hp-gb-via');
    const viaSel = h('select'); viaSel.title = '串门（knock knock）用哪个 API，正文聊天不受影响。想用便宜的模型：先在酒馆「API 连接」页存一份连接配置，这里就能选';
    viaRow.append(h('span', null, '用哪个 API'), viaSel);
    dropRow.append(viaRow);
    const viaValue = (v) => (v.mode === 'profile' ? 'p:' + v.profile : 'current');
    const fillVia = () => {
      const v = viaLoad(); viaSel.textContent = '';
      const o0 = h('option', null, '当前 API（和正文一样）'); o0.value = 'current'; viaSel.append(o0);
      const ps = viaProfiles();
      ps.forEach((x) => { const o = h('option', null, x.name || x.id); o.value = 'p:' + x.id; viaSel.append(o); });
      if (!ps.length) { const o = h('option', null, '（没有连接配置：先在酒馆 API 连接页存一份）'); o.disabled = true; viaSel.append(o); }
      viaSel.value = viaValue(v);
      if (viaSel.value !== viaValue(v)) viaSel.value = 'current';   // 选过的连接配置被删了：显示成 current（存的不动，下拉里重选一次才改）
    };
    viaSel.addEventListener('change', () => {
      const v = viaLoad(); const val = viaSel.value;
      if (val.startsWith('p:')) { v.mode = 'profile'; v.profile = val.slice(2); } else { v.mode = 'current'; v.profile = ''; }
      viaSave(v);
      showTip(v.mode === 'profile' ? `串门改走「${viaSel.selectedOptions[0].textContent}」✧` : '串门改走当前 API');
    });
    const pager = h('div', 'hp-pager');
    let page = 0;
    box.append(title, form, ul, pager, dropRow);
    const syncDrop = () => { const d = dropLoad(); dropOn.checked = d.on; dropFreq.value = d.freq; dropRow.classList.toggle('is-on', d.on); if (d.on) fillVia(); };
    dropOn.addEventListener('change', () => {
      const d = dropLoad(); d.on = dropOn.checked;
      if (d.on && !d.last) d.last = Date.now() - DROP_FREQ[d.freq].gap + 15 * 60e3;   // 刚打开：一刻钟以后才可能有人来
      dropSave(d); syncDrop(); dropSchedule(() => render());
      showTip(d.on ? 'drop-ins on ✧' : 'drop-ins off');
    });
    dropFreq.addEventListener('change', () => { const d = dropLoad(); d.freq = dropFreq.value; dropSave(d); dropSchedule(() => render()); });
    dropNow.addEventListener('click', async () => {
      dropNow.disabled = true; dropNow.textContent = 'knocking…';
      const ok = await dropBy(() => render());
      dropNow.disabled = false; dropNow.textContent = 'knock knock';
      dropSchedule(() => render());
      if (!ok) showTip(dropErr || "nobody came… check your API (｡•́︿•̀｡)");
    });
    syncDrop();
    dropSchedule(() => render());
    const onVis = () => { if (!doc.hidden) dropSchedule(() => render()); };   // 回到前台重新约（后台里的长计时器不可靠）
    doc.addEventListener('visibilitychange', onVis);
    cleanups.push(() => { clearTimeout(dropAlarm); dropAlarm = null; doc.removeEventListener('visibilitychange', onVis); });
    let chosenAvatar = '';
    [nameIn, idIn, msg].forEach((el) => el.addEventListener('keydown', (e) => e.stopPropagation()));

    function fillPick() {
      pick.textContent = '';
      const o0 = h('option', null, '— who is visiting? —'); o0.value = ''; pick.append(o0);
      const chars = charList();
      chars.forEach((c, k) => { const o = h('option', null, c.name); o.value = String(k); pick.append(o); });
      const oo = h('option', null, '✎ someone else'); oo.value = 'other'; pick.append(oo);
      pick.chars = chars;
    }
    pick.addEventListener('change', () => {
      const v = pick.value;
      if (v === 'other' || v === '') { chosenAvatar = ''; if (v === 'other') { nameIn.value = ''; nameIn.focus(); } return; }
      const c = pick.chars[+v]; chosenAvatar = c.avatar; nameIn.value = c.name; msg.focus();
    });
    // 一页三条，新的在前：签到的多了，左栏也不会越拉越长
    function render() {
      const list = gbLoad();
      const pages = Math.max(1, Math.ceil(list.length / GB_PAGE));
      page = Math.min(page, pages - 1);
      ul.textContent = '';
      fillPager(pager, page, pages, (p) => { page = p; render(); });
      if (!list.length) { ul.append(h('li', 'hp-empty', 'no notes yet · tap + sign (｡•ᴗ•｡)')); return; }
      list.slice().reverse().slice(page * GB_PAGE, page * GB_PAGE + GB_PAGE).forEach((e, k) => {
        const idx = list.length - 1 - (page * GB_PAGE + k);
        const li = h('li');
        const head = h('div', 'hp-gb-head');
        const who = h('span', 'hp-gb-who');
        who.append(h('b', null, e.name || 'anon'));
        if (e.visit) { li.classList.add('is-visit'); const m = h('em', null, ' ✧'); m.title = 'dropped by on their own'; who.append(m); }
        if (e.id) who.append(h('i', null, ` @${e.id.replace(/^@/, '')}`));
        head.append(avatarEl(e), who);
        if (e.date) head.append(h('small', null, e.date));
        const del = h('button', 'hp-gb-del', '×'); del.title = 'remove';
        head.append(del);
        li.append(head, h('p', null, e.text));
        del.addEventListener('click', () => { const l = gbLoad(); l.splice(idx, 1); gbSave(l); render(); });
        ul.append(li);
      });
    }
    const open = (on) => {
      box.classList.toggle('is-writing', on);
      if (on) { fillPick(); pick.value = ''; nameIn.value = idIn.value = msg.value = ''; chosenAvatar = ''; setTimeout(() => pick.focus(), 30); }
    };
    plus.addEventListener('click', () => open(!box.classList.contains('is-writing')));
    cancel.addEventListener('click', () => open(false));
    onSave(form, ok, () => {
      const name = nameIn.value.trim(); const text = msg.value.trim();
      if (!name) { showTip('who is it from? ₍ᐢ. .ᐢ₎'); nameIn.focus(); return; }
      if (!text) { showTip('write something first ♡'); msg.focus(); return; }
      const l = gbLoad();
      // 名字改成了化名也留着头像；选了「someone else」就没有头像
      l.push({ name, id: idIn.value.trim(), avatar: chosenAvatar, text, date: today() });
      gbSave(l); open(false); page = 0; render();
      showTip(`${name} signed your guestbook ♡`);
    });
    render();
    return box;
  }

  /* ---- 播放器：一个真的 <audio>，歌单存在 localStorage ---- */
  const MODES = [{ k: 'all', icon: '⟳', tip: 'loop all' }, { k: 'one', icon: '①', tip: 'repeat one' }, { k: 'shuffle', icon: '⤮', tip: 'shuffle' }];
  const P = { list: [], idx: 0, mode: 'all', audio: null, ui: {}, fails: 0, dragging: false, api: 0 };

  function neteaseId(raw) {
    const s = String(raw).trim();
    if (/^\d{3,}$/.test(s)) return s;
    const m = s.match(/music\.163\.com\/.*?(?:[?&#]id=|\/song\/)(\d+)/) || s.match(/y\.music\.163\.com\/m\/song\?.*?id=(\d+)/);
    return m ? m[1] : null;
  }
  /* 搜歌接口（Meting）：歌单里记成 meting:netease:歌曲id；开了搜歌，网易云链接也走它 */
  const metingOn = () => !!CONFIG.musicSearch && Array.isArray(CONFIG.musicApi) && CONFIG.musicApi.length > 0;
  function metingRef(raw) {
    const m = String(raw).match(/^meting:(\w+):(\w+)$/);
    if (m) return { server: m[1], id: m[2] };
    const id = metingOn() && neteaseId(raw);
    return id ? { server: 'netease', id } : null;
  }
  function metingUrl(type, ref, api) {
    const u = new URL(api);
    u.search = new URLSearchParams({ server: ref.server || 'netease', type, id: ref.id }).toString();
    return u.href;
  }
  // 问接口（search 搜歌、song 查一首）：一个给不出结果就问下一个；全都连不上才算失败
  async function metingGet(type, ref) {
    let reached = false;
    for (const api of CONFIG.musicApi) {
      try {
        const r = await win.fetch(metingUrl(type, ref, api), { credentials: 'omit', referrerPolicy: 'no-referrer' });
        const data = await r.json();
        reached = true;
        const list = (Array.isArray(data) ? data : []).map((x) => {
          const src = String(x.url || '');
          const m = src.match(/[?&]server=(\w+).*?[?&]id=(\w+)/) || src.match(/()[?&]id=(\w+)/) || [];
          return m[2] && { title: String(x.name || x.title || 'untitled'), artist: [].concat(x.artist || x.author || []).join(' / '),
            url: `meting:${m[1] || ref.server || 'netease'}:${m[2]}`, src, cover: String(x.pic || '') };
        }).filter(Boolean);
        if (list.length) return list;
      } catch (e) { /* 这个接口不通，问下一个 */ }
    }
    if (!reached) throw new Error('offline');
    return [];
  }
  // 一首搜来的歌能去哪儿取音源：先用搜到它的那个接口给的地址，再挨个试别的接口
  function metingSources(t) {
    const ref = metingOn() && metingRef(t.url);
    if (!ref) return [];
    return [...new Set([t.src, ...CONFIG.musicApi.map((api) => metingUrl('url', ref, api))].filter(Boolean))];
  }
  function trackSrc(t) {
    return metingRef(t.url) ? metingSources(t)[0] || '' : toAudioUrl(t.url) || '';
  }
  function toAudioUrl(raw) {
    const ref = metingRef(raw);
    if (ref) return metingOn() ? metingUrl('url', ref, CONFIG.musicApi[0]) : null;
    const id = neteaseId(raw);
    if (id) return `https://music.163.com/song/media/outer/url?id=${id}.mp3`;
    const s = String(raw).trim();
    return /^https?:\/\//i.test(s) ? s : null;
  }
  function guessTitle(raw) {
    const id = neteaseId(raw);
    if (id) return `song #${id}`;
    try { return decodeURIComponent(new URL(raw).pathname.split('/').pop().replace(/\.[a-z0-9]{2,4}$/i, '')) || 'untitled'; } catch (e) { return 'untitled'; }
  }
  /* 从设备里选的文件存在 IndexedDB（这台设备的浏览器里），歌单里记成 idb:编号 */
  const IDB = {
    db: null,
    open() {
      if (this.db) return Promise.resolve(this.db);
      return new Promise((res, rej) => {
        const r = win.indexedDB.open('hp-blog-music', 1);
        r.onupgradeneeded = () => r.result.createObjectStore('files');
        r.onsuccess = () => { this.db = r.result; res(this.db); };
        r.onerror = () => rej(r.error);
      });
    },
    async run(mode, fn) {
      const db = await this.open();
      return new Promise((res, rej) => {
        const tx = db.transaction('files', mode);
        const req = fn(tx.objectStore('files'));
        tx.oncomplete = () => res(req && req.result);
        tx.onerror = () => rej(tx.error);
      });
    },
    put: (id, blob) => IDB.run('readwrite', (s) => s.put(blob, id)),
    get: (id) => IDB.run('readonly', (s) => s.get(id)),
    del: (id) => IDB.run('readwrite', (s) => s.delete(id)),
  };
  let objectUrl = null;
  async function srcOf(t) {
    if (objectUrl) { win.URL.revokeObjectURL(objectUrl); objectUrl = null; }
    if (t.url.startsWith('idb:')) {
      const blob = await IDB.get(t.url.slice(4)).catch(() => null);
      if (!blob) return '';
      objectUrl = win.URL.createObjectURL(blob);
      return objectUrl;
    }
    return toAudioUrl(t.url) || '';
  }
  function splitName(file) {
    const base = file.name.replace(/\.[a-z0-9]{2,5}$/i, '').trim();
    const m = base.match(/^(.+?)\s+[-–—]\s+(.+)$/);
    return m ? { artist: m[1].trim(), title: m[2].trim() } : { artist: '', title: base || 'untitled' };
  }

  function loadList() {
    try { P.list = JSON.parse(ls.get(KEY.list) || 'null') || []; } catch (e) { P.list = []; }
    if (!P.list.length && Array.isArray(CONFIG.playlist)) {
      P.list = CONFIG.playlist.filter((t) => t && t.url).map((t) => ({ title: t.title || guessTitle(t.url), artist: t.artist || '', url: t.url, cover: t.cover || '' }));
    }
    P.idx = Math.min(+(ls.get(KEY.track) || 0), Math.max(P.list.length - 1, 0));
    P.mode = MODES.some((m) => m.k === ls.get(KEY.mode)) ? ls.get(KEY.mode) : 'all';
  }
  function saveList() {
    ls.set(KEY.list, JSON.stringify(P.list));
    ls.set(KEY.track, String(P.idx));
  }
  const cur = () => P.list[P.idx];

  function renderNP() {
    const u = P.ui;
    if (!u.box) return;
    const a = P.audio;
    const t = cur();
    const playing = !!(a && !a.paused);
    u.box.classList.toggle('is-playing', playing);
    u.song.textContent = t ? t.title : cssText('--hp-t-song', 'no songs yet');
    u.artist.textContent = t ? (t.artist || ' ') : 'tap list to add songs ♪';
    u.cover.style.backgroundImage = t && t.cover ? `url("${t.cover.replace(/"/g, '%22')}")` : '';
    const dur = a && isFinite(a.duration) ? a.duration : 0;
    const now = a ? a.currentTime : 0;
    u.fill.style.setProperty('--p', (dur ? Math.min(now / dur, 1) * 100 : 0) + '%');
    u.cur.textContent = fmt(now);
    u.dur.textContent = dur ? fmt(dur) : '0:00';
    u.play.textContent = playing ? '❚❚' : '►';
    u.play.title = playing ? 'pause' : 'play';
    const m = MODES.find((x) => x.k === P.mode);
    u.mode.textContent = m.icon; u.mode.title = m.tip;
    u.items.forEach((li, k) => li.classList.toggle('is-on', k === P.idx));
  }
  function mediaSession() {
    const ms = win.navigator && win.navigator.mediaSession;
    const t = cur();
    if (!ms || !t) return;
    try {
      ms.metadata = new win.MediaMetadata({ title: t.title, artist: t.artist || '', album: cssText('--hp-t-url', '').split('/')[0],
        artwork: t.cover ? [{ src: t.cover, sizes: '512x512' }] : [] });
      ms.setActionHandler('play', () => play());
      ms.setActionHandler('pause', () => P.audio && P.audio.pause());
      ms.setActionHandler('previoustrack', () => prev());
      ms.setActionHandler('nexttrack', () => next(true));
    } catch (e) { /* 老浏览器没有 */ }
  }
  function ensureAudio() {
    if (P.audio) return P.audio;
    const a = new win.Audio();
    a.preload = 'metadata';
    a.volume = Math.max(0, Math.min(1, +CONFIG.volume || 0.8));
    a.addEventListener('timeupdate', () => { if (!P.dragging) renderNP(); });
    a.addEventListener('loadedmetadata', () => {
      renderNP();
      // 接口没拿到会员音源时常给 30 秒试听：提醒一下
      if (metingRef(cur()?.url || '') && a.duration > 0 && a.duration < 46) showTip(`only a short preview of "${cur().title}" ♪`);
    });
    a.addEventListener('play', () => { P.fails = 0; renderNP(); });
    a.addEventListener('pause', renderNP);
    a.addEventListener('ended', () => (P.mode === 'one' ? (a.currentTime = 0, a.play().catch(() => {})) : next(true)));
    a.addEventListener('error', () => {
      if (!a.getAttribute('src')) return;
      const srcs = cur() ? metingSources(cur()) : [];
      if (P.api + 1 < srcs.length) {   // 这个接口没给出音源：换下一个接口再试
        P.api += 1; a.src = srcs[P.api]; a.play().catch(() => showTip('found another source · tap ► ♪')); return;
      }
      P.fails += 1;
      showTip(`can't play "${cur()?.title || 'this song'}" (｡•́︿•̀｡)`);
      if (P.fails < P.list.length) setTimeout(() => next(true), 900); else renderNP();
    });
    P.audio = a;
    if (P.onAudio) P.onAudio(a);
    cleanups.push(() => { a.pause(); a.removeAttribute('src'); a.load(); P.audio = null; if (objectUrl) win.URL.revokeObjectURL(objectUrl); });
    return a;
  }
  let loadSeq = 0;
  async function loadTrack(i, autoplay) {
    if (!P.list.length) { renderNP(); return; }
    P.idx = (i + P.list.length) % P.list.length;
    saveList();
    const a = ensureAudio();
    const seq = ++loadSeq;
    P.api = 0;
    // 手机上 play() 要紧跟着点击才算数：链接的歌立刻换源立刻放；设备里的歌要先从数据库取出来
    const t = cur();
    if (!t.url.startsWith('idb:')) {
      a.src = trackSrc(t);
      if (autoplay) a.play().catch(() => {});
    } else {
      const src = await srcOf(t);
      if (seq !== loadSeq) return;
      a.src = src;
      if (!src) { showTip(`"${t.title}" is gone from this device (｡•́︿•̀｡)`); renderNP(); return; }
      if (autoplay) a.play().catch(() => showTip('tap ► to play ♪'));
    }
    mediaSession();
    renderNP();
  }
  function play() {
    if (!P.list.length) { openList(true); showTip('add a song first ♪'); return; }
    const a = ensureAudio();
    if (!a.getAttribute('src')) loadTrack(P.idx, true); else a.play().catch(() => showTip('tap ► again to play ♪'));
  }
  function next(auto) {
    if (!P.list.length) return;
    let i = P.idx + 1;
    if (P.mode === 'shuffle' && P.list.length > 1) { do { i = Math.floor(Math.random() * P.list.length); } while (i === P.idx); }
    loadTrack(i, auto || (P.audio && !P.audio.paused));
  }
  function prev() {
    const a = P.audio;
    if (a && a.currentTime > 3) { a.currentTime = 0; return; }
    loadTrack(P.idx - 1, a && !a.paused);
  }
  function seekAt(clientX) {
    const a = P.audio;
    const r = P.ui.bar.getBoundingClientRect();
    const f = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
    P.ui.fill.style.setProperty('--p', f * 100 + '%');
    if (a && isFinite(a.duration)) { a.currentTime = f * a.duration; P.ui.cur.textContent = fmt(a.currentTime); }
  }
  function openList(force) {
    const on = force === true ? true : !P.ui.box.classList.contains('is-list');
    P.ui.box.classList.toggle('is-list', on);
    if (on) setTimeout(() => (P.ui.q || P.ui.link).focus(), 50);
  }
  function renderList() {
    const ul = P.ui.ul;
    ul.textContent = '';
    P.ui.items = P.list.map((t, k) => {
      const li = h('li');
      const name = h('span', 'hp-pl-name'); name.append(h('b', null, String(k + 1).padStart(2, '0')), ` ${t.title}`);
      if (t.artist) name.append(h('i', null, ` · ${t.artist}`));
      const del = h('button', 'hp-pl-del', '×'); del.title = 'remove';
      li.append(name, del);
      name.addEventListener('click', () => loadTrack(k, true));
      del.addEventListener('click', (e) => {
        e.stopPropagation();
        const playingThis = k === P.idx;
        const [gone] = P.list.splice(k, 1);
        if (gone && gone.url.startsWith('idb:')) IDB.del(gone.url.slice(4)).catch(() => {});
        if (k < P.idx || P.idx >= P.list.length) P.idx = Math.max(0, P.idx - 1);
        saveList(); renderList();
        if (playingThis) { if (P.list.length) loadTrack(P.idx, P.audio && !P.audio.paused); else { P.audio?.pause(); P.audio?.removeAttribute('src'); } }
        renderNP();
      });
      ul.append(li);
      return li;
    });
    if (!P.list.length) ul.append(h('li', 'hp-empty', 'no songs yet (｡•ᴗ•｡)'));
    renderNP();
  }
  function buildPlayer() {
    loadList();
    const box = h('section', 'hp-box hp-np');
    const head = h('div', 'hp-box-title hp-np-head');
    const tools = h('span', 'hp-np-tools');
    const mode = h('button'); const list = h('button', 'hp-np-list', '≡ list'); list.title = 'playlist · add songs';
    tools.append(mode, list);
    head.append(cssText('--hp-t-np-title', 'now playing'), tools);
    const row = h('div', 'hp-np-row');
    const cover = h('div', 'hp-cover');
    const meta = h('div', 'hp-np-meta');
    const song = h('div', 'hp-song'); const artist = h('div', 'hp-artist');
    meta.append(song, artist); row.append(cover, meta);
    const bar = h('div', 'hp-bar'); const fill = h('i'); bar.append(fill);
    const ctrl = h('div', 'hp-np-ctrl');
    const curT = h('span'); const durT = h('span');
    const btns = h('span');
    const pv = h('button', null, '◄◄'); pv.title = 'previous';
    const pl = h('button', 'hp-play', '►');
    const nx = h('button', null, '►►'); nx.title = 'next';
    btns.append(pv, pl, nx);
    ctrl.append(curT, btns, durT);
    // 歌单：一列歌，下面一个加歌的小表
    const panel = h('div', 'hp-pl');
    const ul = h('ul');
    const form = h('form', 'hp-pl-add');
    const link = h('input', 'hp-pl-link'); link.type = 'text'; link.placeholder = 'song link · mp3 / 网易云';
    const tIn = h('input'); tIn.type = 'text'; tIn.placeholder = 'title';
    const aIn = h('input'); aIn.type = 'text'; aIn.placeholder = 'artist';
    const add = h('button', null, 'add link ♡');
    const pick = h('button', 'hp-pl-pick', 'from device ♪'); pick.type = 'button';
    const file = h('input'); file.type = 'file'; file.accept = 'audio/*'; file.multiple = true; file.hidden = true;
    form.append(pick, file, link, tIn, aIn, add);
    // 搜歌（开了 musicSearch 才有）：搜索框 + 搜出来的几首，点歌名直接放，点 + 只加进歌单
    const find = h('form', 'hp-pl-find');
    const q = h('input'); q.type = 'text'; q.placeholder = 'search songs · 网易云'; q.enterKeyHint = 'search';
    const findBtn = h('button', null, 'search');
    find.append(q, findBtn);
    const found = h('ul', 'hp-pl-found');
    if (metingOn()) panel.append(ul, find, found, form); else panel.append(ul, form);
    box.append(head, row, bar, ctrl, panel);
    P.ui = { box, song, artist, cover, bar, fill, cur: curT, dur: durT, play: pl, mode, ul, link, q: metingOn() ? q : null, items: [] };

    pl.addEventListener('click', () => (P.audio && !P.audio.paused ? P.audio.pause() : play()));
    nx.addEventListener('click', () => next(false));
    pv.addEventListener('click', () => prev());
    list.addEventListener('click', () => openList());
    cover.addEventListener('click', () => openList());
    meta.addEventListener('click', () => openList());
    mode.addEventListener('click', () => {
      const i = MODES.findIndex((m) => m.k === P.mode);
      P.mode = MODES[(i + 1) % MODES.length].k;
      ls.set(KEY.mode, P.mode);
      showTip(MODES.find((m) => m.k === P.mode).tip + ' ♪');
      renderNP();
    });
    bar.addEventListener('pointerdown', (e) => {
      P.dragging = true; bar.setPointerCapture(e.pointerId); seekAt(e.clientX);
    });
    bar.addEventListener('pointermove', (e) => { if (P.dragging) seekAt(e.clientX); });
    const endDrag = (e) => { if (!P.dragging) return; P.dragging = false; seekAt(e.clientX); };
    bar.addEventListener('pointerup', endDrag);
    bar.addEventListener('pointercancel', () => { P.dragging = false; });
    pick.addEventListener('click', () => file.click());
    file.addEventListener('change', async () => {
      const files = [...file.files];
      file.value = '';
      if (!files.length) return;
      showTip(`saving ${files.length} song${files.length > 1 ? 's' : ''}… ♪`);
      const first = P.list.length;
      for (const f of files) {
        const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
        try { await IDB.put(id, f); } catch (e) { showTip("this browser won't keep files (｡•́︿•̀｡)"); return; }
        P.list.push({ ...splitName(f), url: `idb:${id}`, cover: '' });
      }
      saveList(); renderList();
      showTip(`added ${files.length} song${files.length > 1 ? 's' : ''} ♡`);
      if (first === 0) loadTrack(0, false);
    });
    onSave(form, add, () => {
      const raw = link.value.trim();
      const url = toAudioUrl(raw);
      if (!url) { showTip(/163cn\.tv/.test(raw) ? 'paste the full music.163.com link ♪' : "that doesn't look like a song link (´•︵•`)"); return; }
      const t = { title: tIn.value.trim() || guessTitle(raw), artist: aIn.value.trim(), url: raw, cover: '' };
      P.list.push(t);
      const ref = metingRef(raw);
      if (ref && !tIn.value.trim()) {   // 只贴了网易云链接：去接口查歌名、歌手、封面
        metingGet('song', ref).then(([info]) => {
          if (!info) return;
          Object.assign(t, { title: info.title, artist: t.artist || info.artist, cover: info.cover, src: info.src });
          saveList(); renderList();
        }).catch(() => {});
      }
      link.value = tIn.value = aIn.value = '';
      saveList(); renderList();
      showTip('added to playlist ♡');
      if (P.list.length === 1) loadTrack(0, false);
    });
    let findSeq = 0;
    onSave(find, findBtn, async () => {
      const words = q.value.trim();
      if (!words) return;
      const seq = ++findSeq;
      found.textContent = '';
      found.append(h('li', 'hp-empty', 'searching… ♪'));
      const res = await metingGet('search', { id: words }).catch(() => null);
      if (seq !== findSeq) return;
      found.textContent = '';
      if (!res || !res.length) { found.append(h('li', 'hp-empty', res ? 'nothing found (´•︵•`)' : "can't reach the music search (｡•́︿•̀｡)")); return; }
      res.slice(0, 8).forEach((t) => {
        const li = h('li');
        const name = h('span', 'hp-pl-name', t.title);
        if (t.artist) name.append(h('i', null, ` · ${t.artist}`));
        const plus = h('button', 'hp-pl-plus', '+'); plus.title = 'add to playlist';
        li.append(name, plus);
        const put = (playNow) => {
          let k = P.list.findIndex((x) => x.url === t.url);
          if (k < 0) { P.list.push({ ...t }); k = P.list.length - 1; saveList(); renderList(); }
          if (playNow) loadTrack(k, true); else showTip('added to playlist ♡');
        };
        name.addEventListener('click', () => put(true));
        plus.addEventListener('click', () => put(false));
        found.append(li);
      });
    });
    [link, tIn, aIn, q].forEach((el) => el.addEventListener('keydown', (e) => e.stopPropagation()));
    renderList();
    if (P.list.length) loadTrack(P.idx, false); else box.classList.add('is-list');   // 歌单空着：直接摊开加歌的地方
    renderNP();
    return box;
  }

  /* ---- 本站已运行：左栏最底下一行小字，这段聊天从哪天开始、到今天第几天 ---- */
  const STAT = { el: null, sig: '' };
  function msgDate(c, x) {
    const raw = x && x.send_date;
    if (!raw) return null;
    try {
      const mo = c.timestampToMoment ? c.timestampToMoment(raw) : null;
      if (mo && mo.isValid()) return mo.toDate();
    } catch (e) { /* 酒馆没这个函数 */ }
    const d = new Date(raw);
    return isNaN(d) ? null : d;
  }
  function refreshStats() {
    if (!STAT.el) return;
    const c = ctx();
    const list = (c && Array.isArray(c.chat)) ? c.chat : [];
    const chatId = c && c.getCurrentChatId ? c.getCurrentChatId() : '';
    const sig = `${chatId}|${list.length}|${new Date().toDateString()}`;
    if (sig === STAT.sig) return;
    STAT.sig = sig;
    let first = null;
    list.forEach((x) => {
      if (!x || x.is_system) return;
      const d = msgDate(c, x);
      if (d && (!first || d < first)) first = d;
    });
    const pad = (x) => String(x).padStart(2, '0');
    const days = first ? Math.floor((new Date().setHours(0, 0, 0, 0) - new Date(first).setHours(0, 0, 0, 0)) / 864e5) + 1 : 0;
    const vals = { since: first ? `${first.getFullYear()}.${pad(first.getMonth() + 1)}.${pad(first.getDate())}` : '—', days };
    STAT.el.textContent = cssText('--hp-t-stats', 'since {since} · day {days}').replace(/\{(\w+)\}/g, (all, k) => (k in vals ? vals[k] : all));
    STAT.el.hidden = !first;
  }

  /* ---- album 相册：贴图片直链，或从设备上传（传到酒馆服务器，换设备也在）；一页三列两排，点开看大图 ---- */
  const ALBUM_PAGE = 6;
  // 翻页的一行「‹ 1 / 3 ›」（相册和留言板共用）：只有一页就空着
  function fillPager(pager, page, pages, go) {
    pager.textContent = '';
    if (pages < 2) return;
    const prev = h('button', null, '‹'); prev.type = 'button'; prev.disabled = page === 0;
    const next = h('button', null, '›'); next.type = 'button'; next.disabled = page >= pages - 1;
    prev.addEventListener('click', () => go(page - 1));
    next.addEventListener('click', () => go(page + 1));
    pager.append(prev, h('span', null, `${page + 1} / ${pages}`), next);
  }
  const albumLoad = () => { const l = SRV.get('album'); return Array.isArray(l) ? l : []; };
  const albumSave = (l) => SRV.set('album', l);
  const blobUrls = new Map();
  async function photoSrc(it) {
    if (!String(it.src).startsWith('idb:')) return it.src;
    if (blobUrls.has(it.src)) return blobUrls.get(it.src);
    const blob = await IDB.get(it.src.slice(4)).catch(() => null);
    if (!blob) return '';
    const u = win.URL.createObjectURL(blob);
    blobUrls.set(it.src, u);
    return u;
  }
  // 手机拍的照片动辄几 MB：先在浏览器里缩到长边 1600 再传
  function shrink(file) {
    return new Promise((res, rej) => {
      const url = win.URL.createObjectURL(file);
      const img = new win.Image();
      img.onload = () => {
        const k = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight));
        const cv = doc.createElement('canvas');
        cv.width = Math.round(img.naturalWidth * k); cv.height = Math.round(img.naturalHeight * k);
        cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
        win.URL.revokeObjectURL(url);
        cv.toBlob((b) => (b ? res(b) : rej(new Error('encode'))), 'image/webp', 0.86);
      };
      img.onerror = () => { win.URL.revokeObjectURL(url); rej(new Error('decode')); };
      img.src = url;
    });
  }
  async function uploadPhoto(file) {
    const blob = await shrink(file);
    const c = ctx();
    if (c && c.getRequestHeaders) {
      try {
        const b64 = await new Promise((res) => { const r = new win.FileReader(); r.onload = () => res(String(r.result).split(',')[1]); r.readAsDataURL(blob); });
        const resp = await win.fetch('/api/images/upload', { method: 'POST', headers: c.getRequestHeaders(),
          body: JSON.stringify({ image: b64, format: 'webp', ch_name: 'QuietRoom', filename: `album-${Date.now().toString(36)}` }) });
        if (resp.ok) { const { path } = await resp.json(); if (path) return '/' + String(path).replace(/\\/g, '/').replace(/^\/+/, ''); }
      } catch (e) { /* 传不上去就存在这台设备 */ }
    }
    const id = `img-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    await IDB.put(id, blob);
    return `idb:${id}`;
  }
  function buildAlbum() {
    const box = h('section', 'hp-box hp-al');
    const title = h('div', 'hp-box-title hp-title-row');
    const plus = h('button', 'hp-mini is-pill', '+ add'); plus.title = 'add a photo';
    title.append(h('span', null, cssText('--hp-t-album-title', 'album')), plus);
    const form = h('form', 'hp-al-form');
    const link = h('input'); link.type = 'text'; link.placeholder = 'image link · https://…';
    const cap = h('input'); cap.type = 'text'; cap.placeholder = 'caption · optional'; cap.maxLength = 40;
    const pick = h('button', 'hp-mini hp-al-pick', 'from device ▣'); pick.type = 'button';
    const file = h('input'); file.type = 'file'; file.accept = 'image/*'; file.multiple = true; file.hidden = true;
    const btns = h('div', 'hp-form-btns');
    const cancel = h('button', 'hp-mini', 'cancel'); cancel.type = 'button';
    const ok = h('button', 'hp-mini is-solid', 'add ♡');
    btns.append(cancel, ok);
    form.append(pick, file, link, cap, btns);
    const grid = h('div', 'hp-al-grid');
    const pager = h('div', 'hp-pager');
    box.append(title, form, grid, pager);
    let page = 0;
    [link, cap].forEach((el) => el.addEventListener('keydown', (e) => e.stopPropagation()));

    function render() {
      const list = albumLoad();
      const pages = Math.max(1, Math.ceil(list.length / ALBUM_PAGE));
      page = Math.min(page, pages - 1);
      grid.textContent = ''; pager.textContent = '';
      if (!list.length) { grid.append(h('p', 'hp-empty', 'no photos yet · tap + add (｡•ᴗ•｡)')); return; }
      // 新的在前
      const order = list.map((it, i) => [it, i]).reverse();
      order.slice(page * ALBUM_PAGE, page * ALBUM_PAGE + ALBUM_PAGE).forEach(([it, i]) => {
        const fig = h('button', 'hp-al-ph'); fig.type = 'button'; fig.title = it.caption || it.date || '';
        const img = h('img'); img.alt = it.caption || ''; img.loading = 'lazy'; img.decoding = 'async';
        photoSrc(it).then((u) => { if (u) img.src = u; else fig.classList.add('is-gone'); });
        img.addEventListener('error', () => fig.classList.add('is-gone'));
        fig.append(img);
        fig.addEventListener('click', () => openLightbox(i, render));
        grid.append(fig);
      });
      fillPager(pager, page, pages, (p) => { page = p; render(); });
    }
    const open = (on) => {
      box.classList.toggle('is-adding', on);
      if (on) { link.value = cap.value = ''; setTimeout(() => link.focus(), 30); }
    };
    const add = (src) => { const l = albumLoad(); l.push({ src, caption: cap.value.trim(), date: today() }); albumSave(l); page = 0; };
    plus.addEventListener('click', () => open(!box.classList.contains('is-adding')));
    cancel.addEventListener('click', () => open(false));
    pick.addEventListener('click', () => file.click());
    file.addEventListener('change', async () => {
      const files = [...file.files].filter((f) => /^image\//.test(f.type));
      file.value = '';
      if (!files.length) return;
      showTip(`saving ${files.length} photo${files.length > 1 ? 's' : ''}… ₍ᐢ. .ᐢ₎`);
      for (const f of files) {
        try { add(await uploadPhoto(f)); } catch (e) { showTip("couldn't read that photo (｡•́︿•̀｡)"); }
      }
      open(false); render();
      showTip('pinned to your album ♡');
    });
    onSave(form, ok, () => {
      const u = link.value.trim();
      if (!/^https?:\/\/\S+$/i.test(u)) { showTip('paste an image link (https://…) ♪'); link.focus(); return; }
      add(u); open(false); render();
      showTip('pinned to your album ♡');
    });
    render();
    box.refresh = render;
    return box;
  }
  // 看大图：窗口正中一张白边的照片，下面一行小字；‹ › 翻，Esc 或点外面关；remove 删掉这张
  let lightbox = null;
  function openLightbox(i, after) {
    closeLightbox();
    const list = albumLoad();
    if (!list[i]) return;
    lightbox = h('div'); lightbox.id = 'hp-lightbox';
    const fig = h('figure');
    const img = h('img'); img.alt = '';
    const capt = h('figcaption');
    const prev = h('button', 'hp-lb-nav', '‹'); prev.type = 'button'; prev.title = 'newer';
    const next = h('button', 'hp-lb-nav', '›'); next.type = 'button'; next.title = 'older';
    const close = h('button', 'hp-lb-close', '×'); close.type = 'button'; close.title = 'close';
    const del = h('button', 'hp-lb-del', 'remove'); del.type = 'button';
    fig.append(img, capt);
    lightbox.append(prev, fig, next, close, del);
    let at = i;
    const show = () => {
      const l = albumLoad();
      const it = l[at];
      if (!it) { closeLightbox(); return; }
      img.removeAttribute('src');
      photoSrc(it).then((u) => { img.src = u || ''; });
      capt.textContent = [it.caption, it.date].filter(Boolean).join(' · ') || ' ';
      prev.disabled = at >= l.length - 1; next.disabled = at <= 0;
    };
    prev.addEventListener('click', () => { at += 1; show(); });
    next.addEventListener('click', () => { at -= 1; show(); });
    close.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
    del.addEventListener('click', () => {
      const l = albumLoad();
      const [gone] = l.splice(at, 1);
      if (gone && String(gone.src).startsWith('idb:')) IDB.del(gone.src.slice(4)).catch(() => {});
      albumSave(l);
      if (after) after();
      if (!l.length) { closeLightbox(); return; }
      at = Math.min(at, l.length - 1); show();
    });
    lightbox.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft' && !prev.disabled) prev.click();
      if (e.key === 'ArrowRight' && !next.disabled) next.click();
    });
    lightbox.tabIndex = -1;
    doc.body.append(lightbox);
    show();
    lightbox.focus();
  }
  function closeLightbox() { if (lightbox) { lightbox.remove(); lightbox = null; } }

  function buildSide() {
    const sheld = doc.getElementById('sheld');
    if (!sheld) return;
    side = h('aside'); side.id = 'hp-side';

    const about = buildAbout();
    const npBox = buildPlayer();
    const gb = buildGuestbook();

    const album = buildAlbum();
    STAT.el = h('p', 'hp-stats'); STAT.sig = '';

    side.append(about, npBox, gb, album, STAT.el);
    // 遮罩和左栏放在同一层（#sheld 自己是一层，z-index 30），遮罩才不会盖到左栏上面
    scrim = h('div'); scrim.id = 'hp-scrim';
    scrim.addEventListener('click', () => doc.body.classList.remove('hp-side-open'));
    sheld.append(scrim, side);
    // 左栏是「拉出来的抽屉」（手机，或电脑上装了左栏收起补丁）时挪到 body 下。
    // 放在 #sheld 里它只能在 #sheld 这一层（酒馆给它 z-index 30）里比高低：酒馆的设置抽屉（#top-settings-holder 3005）、扩展塞进聊天区的东西都能盖住它，
    // 她页面宽度调到 68、聊天区碰到抽屉时就被盖住了。挂在 body 下它和酒馆的抽屉在同一层比，主题 CSS 给的 z-index 才算数。
    // 电脑上不装补丁时左栏是 #sheld 里固定的一栏（absolute），留在原处。窗口宽窄切换（手机 ↔ 电脑）时再看一次
    const place = () => {
      const want = win.getComputedStyle(side).position === 'fixed' ? doc.body : sheld;
      if (side.parentElement !== want) want.append(scrim, side);
    };
    place();
    let placeT = null;
    const onResize = () => { clearTimeout(placeT); placeT = setTimeout(place, 150); };
    win.addEventListener('resize', onResize);
    refreshStats();

    let t;
    const mo = new win.MutationObserver(() => { clearTimeout(t); t = setTimeout(() => { refreshStats(); refreshAddress(); }, 400); });
    const c = chat();
    if (c) mo.observe(c, { childList: true });
    // 天数只在过零点时变：进站算一次（上面），再约一个零点刚过的闹钟，到点算一次、再约下一个零点
    let midnight = null;
    const atMidnight = () => { const t = new Date(); t.setHours(24, 0, 5, 0); midnight = setTimeout(() => { refreshStats(); atMidnight(); }, t.getTime() - Date.now()); };
    atMidnight();
    cleanups.push(() => mo.disconnect(), () => clearTimeout(midnight), () => side.remove(), () => scrim.remove(), closeLightbox, () => { STAT.el = null; },
      () => doc.body.classList.remove('hp-side-open'), () => { win.removeEventListener('resize', onResize); clearTimeout(placeT); });
  }

  /* ---------- 访客计数：网页尾巴上的 visitor no. 换成你真的来了几次 ---------- */
  function applyVisits() {
    const n = +(ls.get(KEY.visits) || 0);
    if (!n) return;
    const footer = cssText('--hp-t-footer');
    if (!/\d{3,}/.test(footer)) return;
    const text = footer.replace(/\d{3,}/, (m) => String(n).padStart(m.length, '0'));
    doc.documentElement.style.setProperty('--hp-t-footer', cssString(text));
    cleanups.push(() => doc.documentElement.style.removeProperty('--hp-t-footer'));
  }

  /* ---------- 2. 登录页 ---------- */
  function buildGate() {
    if (!CONFIG.showLogin) return;
    const saved = ls.get(KEY.nick);
    if (CONFIG.loginEvery === 'session' ? ss.get(KEY.entered) : CONFIG.loginEvery === 'once' && saved) return;
    const gate = h('div'); gate.id = 'hp-gate';
    const winEl = h('div', 'hp-gate-win');
    const barEl = h('div', 'hp-gate-bar');
    barEl.append(h('i'), h('i'), h('i'), h('span', null, cssText('--hp-t-gate-bar', 'login.html')));
    const banner = h('div', 'hp-gate-banner');
    const body = h('form', 'hp-gate-body');
    const site = h('div', 'hp-gate-site');
    const sub = h('p', 'hp-gate-sub', cssText('--hp-t-gate-sub', 'a little diary on the internet'));
    const label = h('label', 'hp-gate-field', cssText('--hp-t-gate-name', 'nickname'));
    const nick = h('input'); nick.type = 'text'; nick.maxLength = 20; nick.placeholder = '( ˘ ³˘)♡'; nick.value = saved || '';
    nick.id = 'hp-gate-nick'; label.htmlFor = 'hp-gate-nick';
    const rem = h('label', 'hp-gate-remember');
    const box = h('input'); box.type = 'checkbox'; box.checked = !!saved;
    rem.append(box, h('span', null, cssText('--hp-t-gate-remember', 'remember me')));
    const enter = h('button', 'hp-gate-enter', cssText('--hp-t-gate-enter', 'enter ♡'));
    const guest = h('button', 'hp-gate-guest', cssText('--hp-t-gate-guest', 'just looking around →')); guest.type = 'button';
    const visits = +(ls.get(KEY.visits) || 0);
    const last = ls.get(KEY.last);
    const foot = h('p', 'hp-gate-foot', last ? `last visit · ${last} · you've been here ${visits} time${visits === 1 ? '' : 's'} ⋆˙⟡` : 'first time here? welcome ⋆˙⟡');
    body.append(site, sub, label, nick, rem, enter, guest, foot);
    winEl.append(barEl, banner, body);
    gate.append(winEl);
    doc.body.append(gate);
    setTimeout(() => nick.focus(), 300);

    const leave = (name) => {
      const v = (name || '').trim();
      if (v && box.checked) ls.set(KEY.nick, v); else if (!box.checked) ls.del(KEY.nick);
      if (v) ss.set(KEY.nick, v);
      ss.set(KEY.entered, '1');
      ls.set(KEY.visits, String(visits + 1));
      const d = new Date();
      ls.set(KEY.last, `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`);
      applyVisits();
      const ab = side?.querySelector('.hp-about');
      if (ab && ab.refresh) ab.refresh();
      // 先在登录窗里走一小段「加载中」，再淡出进站
      body.textContent = '';
      const ld = h('div', 'hp-gate-loading');
      const tx = h('p', null, cssText('--hp-t-gate-loading', 'loading your diary…'));
      const bar = h('div', 'hp-gate-bar-track'); const fill = h('i'); bar.append(fill);
      const sub = h('p', 'hp-gate-sub', v ? `welcome back, ${v} ♡` : 'welcome, guest ♡');
      ld.append(tx, bar, sub);
      body.append(ld);
      win.requestAnimationFrame(() => win.requestAnimationFrame(() => fill.classList.add('is-full')));
      setTimeout(() => { gate.classList.add('is-leaving'); setTimeout(() => gate.remove(), 520); }, 1500);
    };
    onSave(body, enter, () => leave(nick.value));
    guest.addEventListener('click', () => leave(''));
    nick.addEventListener('keydown', (e) => e.stopPropagation());
    cleanups.push(() => gate.remove());
  }

  /* ---------- 留言框的占位字：直接写进 textarea 的 placeholder；酒馆（连上 / 断开 API 时）或扩展改了它，就改回来。
     框太窄放不下整句（手机上扩展的小图标一多就这样）：改成一个字一个字打出来，打满了前面的往左挤掉，打完停一下再从头来 ---------- */
  function keepPlaceholder() {
    const ta = doc.getElementById('send_textarea');
    const form = doc.getElementById('send_form');
    if (!ta) return;
    const mine = cssText('--hp-t-placeholder', '');
    if (!mine) return;
    const noConn = () => !!form && form.classList.contains('no-connection');   // 没连上 API 时留着酒馆的「未连接」提示
    let shown = mine;
    const apply = () => { if (!noConn() && ta.getAttribute('placeholder') !== shown) ta.setAttribute('placeholder', shown); };
    const put = (t) => { shown = t; apply(); };

    // 量字宽：照主题给占位字的字体（第 6 节 #send_textarea::placeholder）放一个看不见的小字条，量一次每个字多宽
    const chars = Array.from(mine);
    let widths = [], avail = Infinity;
    // 字宽只量一次（字体到了再量一次）：量一次要往页面里放探针、读 31 次宽度，每次都强制排版。
    // 原来打字框每长高一行就全量一遍，有人在手机上「打到行尾换行那一下卡顿」，这是原因之一。现在长高只读一次框的宽度
    const measureChars = () => {
      const probe = h('span');
      probe.style.cssText = 'position:absolute;visibility:hidden;white-space:pre;font:400 var(--hp-fs-small)/1.6 var(--hp-font-mono);letter-spacing:0.02em';
      doc.body.append(probe);
      widths = chars.map((c) => { probe.textContent = c; return probe.getBoundingClientRect().width; });
      probe.remove();
    };
    // 量「看得见的那个框」：柏宝箱这类扩展会把留言框换成自己的编辑器（CodeMirror，.cm-editor），原来的 textarea 缩成一点点、占位字由编辑器照着显示。
    // 这时按 textarea 量，一行只放得下一两个字，占位字就一个字一个字地跳（iPhone TT 上「只剩一个 s」、她电脑上「跳动」都是这个）。有编辑器就按编辑器的宽量
    const box = () => {
      const ed = form && form.querySelector('.cm-editor .cm-content, .cm-editor');
      return ed && ta.clientWidth < 40 && ed.clientWidth > ta.clientWidth ? ed : ta;
    };
    const measure = () => {
      if (!widths.some(Boolean)) measureChars();
      const el = box();
      const cs = win.getComputedStyle(el);
      avail = el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - 2;
      return widths.some(Boolean) && avail > 0;
    };
    const fits = () => widths.reduce((a, b) => a + b, 0) <= avail;
    // 前 n 个字里，从后往前能放进一行的那一截
    const tail = (n) => { let w = 0, k = n; while (k > 0 && w + widths[k - 1] <= avail) w += widths[--k]; return chars.slice(k, n).join(''); };

    let n = 0, timer = 0, retry = 0, tries = 0;
    // 一行连六个字都放不下，多半是宽度量错了（TT 的 iPhone 上出现过只剩一个 s 在跳）：不打字，整句放着让它截
    const roomy = () => avail >= widths.slice(0, 6).reduce((a, b) => a + b, 0);
    // 没人在用留言框、页面在前台、连着 API 才打；'always' 是放得下也一直打（从头打到尾、停两秒、再来）
    const idle = () => !ta.value && doc.activeElement !== ta && !(form && form.querySelector('.cm-focused')) && !doc.hidden && !noConn();
    const typing = () => CONFIG.typingPlaceholder !== false && idle() && roomy() && (CONFIG.typingPlaceholder === 'always' || !fits());
    const step = () => {
      timer = 0;
      if (n === 0) measure();   // 每一轮开始前重新量一次，早先量错了（框还没排好、字体还没到）这轮就能纠正
      if (!typing()) { n = 0; put(mine); return; }
      n = n >= chars.length ? 0 : n + 1;
      put(tail(Math.min(n, chars.length)));
      // 一个字 120ms；打完停 2 秒；清空后停半秒再打
      timer = setTimeout(step, n === chars.length ? 2000 : n === 0 ? 500 : 120);
    };
    const kick = () => { if (!timer && typing()) step(); else if (!typing() && shown !== mine) step(); };
    // 刚进站时登录页还盖着、留言框还没排好，量出来是 0：隔一秒再量，最多二十次
    const remeasure = () => { clearTimeout(retry); if (!measure() && tries++ < 20) retry = setTimeout(remeasure, 1000); kick(); };

    const mo = new win.MutationObserver(() => { apply(); kick(); });
    mo.observe(ta, { attributes: true, attributeFilter: ['placeholder'] });
    if (form) mo.observe(form, { attributes: true, attributeFilter: ['class'] });
    // 只在宽度变了才重量；打字换行只是长高，什么都不做
    let lastW = -1;
    const ro = win.ResizeObserver ? new win.ResizeObserver((es) => { const w = es[0] && es[0].contentRect ? es[0].contentRect.width : ta.clientWidth; if (w === lastW) return; lastW = w; remeasure(); }) : null;
    if (ro) ro.observe(ta);
    const evs = [[ta, 'focus', kick], [ta, 'blur', kick], [ta, 'input', kick], [doc, 'visibilitychange', kick]];
    evs.forEach(([el, ev, fn]) => el.addEventListener(ev, fn));
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(() => { if (built) { widths = []; remeasure(); } });   // 等宽字体晚到，字宽会变：这一次重量字宽
    const original = ta.getAttribute('placeholder');
    remeasure();
    apply();
    cleanups.push(() => {
      mo.disconnect(); if (ro) ro.disconnect(); clearTimeout(timer); clearTimeout(retry); timer = 0;
      evs.forEach(([el, ev, fn]) => el.removeEventListener(ev, fn));
      if (original != null) ta.setAttribute('placeholder', original);
    });
  }

  /* ---------- 角色抽屉（好友页）：收藏那排每个头像下面一行亲密度 ♥♥♥♡♡，列表里正在聊的标 now chatting，标题后面写好友数。
     亲密度按和这个角色的聊天记录一共多大（酒馆自己记的 chat_size）分五档 ---------- */
  const FRIEND_LV = [[8e6, 5], [3e6, 4], [1e6, 3], [2e5, 2], [1, 1], [0, 0]];   // [聊天记录至少多大（字节）, 几颗心]
  function buildFriends() {
    const list = doc.getElementById('rm_print_characters_block');
    const favs = doc.querySelector('#right-nav-panel .hotswap');
    const top = doc.getElementById('charListFixedTop');
    if (!list) return;
    // 角色编号在 data-chid 上（1.18 的 chid 属性是空的），老版本在 chid 上
    const chidOf = (el) => el.dataset.chid || el.getAttribute('chid') || '';
    const paint = () => {
      const c = ctx();
      const chars = c && Array.isArray(c.characters) ? c.characters : [];
      if (top) top.dataset.hpCount = chars.length ? `${chars.length} friends` : '';
      const nowId = c && c.characterId != null ? String(c.characterId) : '';
      list.querySelectorAll('.character_select').forEach((row) => {
        if (nowId !== '' && chidOf(row) === nowId) row.dataset.hpNow = ''; else delete row.dataset.hpNow;
      });
      if (favs) favs.querySelectorAll('.avatar').forEach((av) => {
        const ch = chars[+chidOf(av)];
        if (!ch || chidOf(av) === '') return;
        const n = FRIEND_LV.find(([min]) => (+ch.chat_size || 0) >= min)[1];
        const hearts = '♥'.repeat(n) + '♡'.repeat(5 - n);
        if (av.dataset.hpLv !== hearts) av.dataset.hpLv = hearts;
      });
    };
    // 酒馆翻页、搜索、换排序、改收藏都会整块重画；换了角色也要挪 now chatting
    let t = 0;
    const later = () => { clearTimeout(t); t = setTimeout(paint, 200); };
    const mo = new win.MutationObserver(later);
    mo.observe(list, { childList: true });
    if (favs) mo.observe(favs, { childList: true });
    const c = ctx();
    const ev = c && c.eventSource && c.eventTypes && c.eventTypes.CHAT_CHANGED;
    if (ev) c.eventSource.on(ev, later);
    paint();
    cleanups.push(() => {
      mo.disconnect(); clearTimeout(t);
      if (ev && c.eventSource.removeListener) c.eventSource.removeListener(ev, later);
      doc.querySelectorAll('#right-nav-panel [data-hp-now], #right-nav-panel [data-hp-lv]').forEach((el) => { delete el.dataset.hpNow; delete el.dataset.hpLv; });
      if (top) delete top.dataset.hpCount;
    });
  }

  /* ---------- 扩展塞进顶栏的标签：主题写的是它图标的 title，这里缩成最显眼的那个词。
     中英混写取第一个英文词（Horae 记忆系统 → Horae）；纯英文短的整个留着、长的取第一个词；纯中文取前四个字 ---------- */
  function labelExtensionTabs() {
    const holder = doc.getElementById('top-settings-holder');
    if (!holder) return;
    // 酒馆自带的九个抽屉，字由主题皮肤写，不碰
    const KNOWN = '#ai-config-button, #sys-settings-button, #advanced-formatting-button, #WI-SP-button, #user-settings-button, '
      + '#backgrounds-button, #extensions-settings-button, #persona-management-button, #rightNavHolder';
    const short = (t) => {
      t = String(t).split('\n')[0].trim();
      const latin = t.match(/[A-Za-z][\w.+-]*/);
      if (latin && /[^\x00-\x7F]/.test(t)) return latin[0];
      if (latin) return t.length <= 12 ? t : latin[0];
      return Array.from(t.replace(/\s+/g, '')).slice(0, 4).join('');
    };
    // CONFIG.tabNames 里改过名的用她写的（左边对上标签原来的字，或者扩展的完整名字里有这几个字都算）
    const renamed = (title, auto) => {
      const map = CONFIG.tabNames && typeof CONFIG.tabNames === 'object' ? CONFIG.tabNames : {};
      const k = Object.keys(map).find((key) => key && (key === auto || title.includes(key)));
      return k ? String(map[k]) : auto;
    };
    const paint = () => {
      holder.querySelectorAll(`:scope > .drawer:not(${KNOWN}) .drawer-icon[title], :scope > :not(.drawer)[class*="fa-"][title]`).forEach((el) => {
        const s = el.title ? renamed(el.title, short(el.title)) : '';
        if (s && el.dataset.hpTab !== s) el.dataset.hpTab = s;
      });
    };
    let t = 0;
    const mo = new win.MutationObserver(() => { clearTimeout(t); t = setTimeout(paint, 300); });
    mo.observe(holder, { childList: true, subtree: true, attributes: true, attributeFilter: ['title'] });
    paint();
    cleanups.push(() => { mo.disconnect(); clearTimeout(t); holder.querySelectorAll('[data-hp-tab]').forEach((el) => delete el.dataset.hpTab); });
  }

  function buildClock() {
    const holder = doc.getElementById('top-settings-holder');
    const bar = doc.getElementById('top-bar');
    if (!holder || !bar) return;
    const pill = h('button', 'hp-clock'); pill.type = 'button';
    bar.append(pill);
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const paint = () => {
      const d = new Date();
      const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      const t = cur && cur();
      const playing = !!(P.audio && !P.audio.paused && t);
      const head = playing ? `♪ ${t.title}` : `✧ ${days[d.getDay()]} ${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
      pill.textContent = '';
      pill.append(h('span', 'hp-clock-t', head), h('span', 'hp-clock-time', ` · ${time}`));
      pill.classList.toggle('is-playing', playing);
      pill.title = playing ? `${t.title} · pause` : (P.list.length ? 'play' : '');
      // 胶囊的长度上限在主题 CSS 里（.hp-clock 的 max-width，默认 26 个等宽字的宽度，她定的「原来那么长」）；歌名放不下就截成「♪ 歌名… · 16:47」
      // （CSS 里 .hp-clock-t 省略号），不整个藏掉（她：歌名特别长时胶囊直接不见了）。
      // 这里只算标签页挤过来时还剩多少空当，写进 --hp-clock-room 让 CSS 一起取最小；连「♪ 两三个字… · 时间」都放不下才藏
      const barBox = bar.getBoundingClientRect(), pb = pill.getBoundingClientRect();
      // 只看和胶囊同一行的标签（地址栏在下一行、比标签宽得多：算上它胶囊就一直藏着）
      const tabs = [...holder.children].filter((c) => { const b = c.getBoundingClientRect(); return b.width > 0 && b.top < pb.bottom && b.bottom > pb.top; });
      const right = tabs.length ? Math.max(...tabs.map((c) => c.getBoundingClientRect().right)) : barBox.left;
      const room = barBox.right - 12 - right - 12;   // 胶囊右边贴 12px，离标签也留 12px
      pill.style.setProperty('--hp-clock-room', `${Math.max(0, Math.floor(room))}px`);
      pill.style.visibility = room < 96 ? 'hidden' : '';
    };
    pill.addEventListener('click', () => {
      if (!P.list.length) return;
      if (P.audio && !P.audio.paused) P.audio.pause(); else play();
      setTimeout(paint, 150);
    });
    paint();
    // 整分才跳一次（时间只显示到分），不用每 15 秒刷
    let timer = null;
    const schedule = () => { timer = setTimeout(() => { paint(); schedule(); }, 60000 - (Date.now() % 60000) + 50); };
    schedule();
    const onPlay = () => setTimeout(paint, 50);
    const hookAudio = (a) => { if (a && !a.__hpClock) { a.__hpClock = true; ['play', 'pause', 'loadedmetadata'].forEach((ev) => a.addEventListener(ev, onPlay)); } };
    hookAudio(P.audio);
    P.onAudio = hookAudio;   // 播放器第一次放歌才创建音频对象，创建时回调过来挂上，不用每秒去看
    win.addEventListener('resize', paint);
    cleanups.push(() => { clearTimeout(timer); P.onAudio = null; win.removeEventListener('resize', paint); pill.remove(); });
  }

  /* ---------- 思维链小框（限高、可滑动）在流式输出时保住位置 ----------
     酒馆每出一段字就把思维链整块重写一遍，手机 Safari 上框里的滚动位置会被打回顶上。
     这里给每个思维链小框记住你看到哪儿：你停在框底就跟着新字往下走；你往上翻着在看，就一直保持在那儿 */
  function keepReasoningScroll() {
    const c = chat();
    if (!c) return;
    const state = new WeakMap();   // 小框 → { top, follow }
    let lastUser = 0, touching = false;
    const userish = () => { lastUser = Date.now(); };
    const isBox = (el) => el instanceof win.HTMLElement && el.classList.contains('mes_reasoning');
    const atBottom = (el) => el.scrollHeight - el.clientHeight - el.scrollTop < 8;
    const restore = (box) => {
      const st = state.get(box);
      if (!st) return;
      const want = st.follow ? box.scrollHeight : st.top;
      if (Math.abs(box.scrollTop - want) > 2) box.scrollTop = want;
    };
    // 你在框里滑动：记下位置；不是你动的、却往上掉了一大截（被打回顶上）：放回去
    const onScroll = (e) => {
      const box = e.target;
      if (!isBox(box)) return;
      const st = state.get(box) || { top: 0, follow: true };
      const quiet = !touching && Date.now() - lastUser > 1200;
      if (quiet && doc.body.dataset.generating === 'true' && box.scrollTop < st.top - 30) { restore(box); return; }
      state.set(box, { top: box.scrollTop, follow: atBottom(box) });
    };
    // 新字进来：把框放回该在的位置
    const mo = new win.MutationObserver((records) => {
      const boxes = new Set();
      for (const r of records) {
        let n = r.target;
        while (n && n !== c) { if (isBox(n)) { boxes.add(n); break; } n = n.parentNode; }
      }
      boxes.forEach((box) => { if (!state.has(box)) state.set(box, { top: 0, follow: true }); restore(box); });
    });
    mo.observe(c, { subtree: true, childList: true, characterData: true });
    // 手指在框里动 / 抬起时也记一次（不全靠 scroll 事件，有的浏览器 scroll 事件来得晚）
    const record = (e) => {
      const box = e.target instanceof win.Element ? e.target.closest('.mes_reasoning') : null;
      if (box) state.set(box, { top: box.scrollTop, follow: atBottom(box) });
    };
    const onTouchStart = () => { touching = true; userish(); };
    const onTouchMove = (e) => { userish(); record(e); };
    const onTouchEnd = (e) => { touching = false; userish(); record(e); };
    const onWheel = (e) => { userish(); win.requestAnimationFrame(() => record(e)); };
    c.addEventListener('scroll', onScroll, { capture: true, passive: true });
    c.addEventListener('touchstart', onTouchStart, { capture: true, passive: true });
    c.addEventListener('touchmove', onTouchMove, { capture: true, passive: true });
    c.addEventListener('touchend', onTouchEnd, { capture: true, passive: true });
    c.addEventListener('wheel', onWheel, { capture: true, passive: true });
    cleanups.push(() => {
      mo.disconnect();
      c.removeEventListener('scroll', onScroll, { capture: true });
      c.removeEventListener('touchstart', onTouchStart, { capture: true });
      c.removeEventListener('touchmove', onTouchMove, { capture: true });
      c.removeEventListener('touchend', onTouchEnd, { capture: true });
      c.removeEventListener('wheel', onWheel, { capture: true });
    });
  }

  /* ---------- 流式输出时的「被弹回顶上」保护 ----------
     生成中（body[data-generating="true"]），你往上翻在看前面的内容时，如果聊天忽然往上跳了一大截、而手指没在动，
     就把它放回你刚才的位置。酒馆自己只会往下滚，所以这里只管往上的跳动，不跟酒馆抢 */
  function guardScroll() {
    const c = chat();
    if (!c) return;
    let lastUser = 0, lastTop = c.scrollTop, touching = false;
    const recent = () => Math.max(lastUser, userJumpAt);
    const userish = () => { lastUser = Date.now(); };
    const onTouchStart = () => { touching = true; userish(); };
    const onTouchEnd = () => { touching = false; userish(); };
    const onScroll = () => {
      const generating = doc.body.dataset.generating === 'true';
      const quiet = !touching && Date.now() - recent() > 1200;   // 手指离开 1.2 秒后，惯性也差不多停了
      const top = c.scrollTop;
      if (generating && quiet && lastTop - top > 200) { c.scrollTop = lastTop; return; }
      lastTop = top;
    };
    c.addEventListener('touchstart', onTouchStart, { passive: true });
    c.addEventListener('touchmove', userish, { passive: true });
    c.addEventListener('touchend', onTouchEnd, { passive: true });
    c.addEventListener('wheel', userish, { passive: true });
    c.addEventListener('keydown', userish);
    c.addEventListener('scroll', onScroll, { passive: true });
    cleanups.push(() => {
      c.removeEventListener('touchstart', onTouchStart); c.removeEventListener('touchmove', userish);
      c.removeEventListener('touchend', onTouchEnd); c.removeEventListener('wheel', userish);
      c.removeEventListener('keydown', userish); c.removeEventListener('scroll', onScroll);
    });
  }

  /* ---------- 点头像放大：原图地址（/characters/文件名）在有的环境里（TT）取不到，只剩一个空的毛玻璃框。
     加载失败就换成聊天里那张缩略图的地址（它既然显示出来了，就一定取得到） ---------- */
  function guardZoomedAvatar() {
    let lastThumb = '';
    const onClick = (e) => {
      const img = e.target.closest && e.target.closest('#chat .mes .avatar img');
      if (img && img.currentSrc) lastThumb = img.currentSrc;
    };
    doc.addEventListener('click', onClick, true);
    const fix = (img) => {
      if (!img || img.dataset.hpFallback) return;
      const swap = () => {
        if (img.dataset.hpFallback) return;
        const forChar = img.closest('.zoomed_avatar')?.getAttribute('forChar') || '';
        const inChat = [...doc.querySelectorAll('#chat .mes .avatar img')].map((i) => i.currentSrc)
          .find((u) => forChar && u && decodeURIComponent(u).includes(forChar));
        const next = inChat || lastThumb;
        if (!next || next === img.src) return;
        img.dataset.hpFallback = '1';
        img.src = next;
      };
      img.addEventListener('error', swap, { once: true });
      if (img.complete && img.naturalWidth === 0 && img.src) swap();
    };
    const mo = new win.MutationObserver((muts) => muts.forEach((m) => m.addedNodes.forEach((n) => {
      if (n.nodeType !== 1) return;
      if (n.matches && n.matches('.zoomed_avatar')) n.querySelectorAll('img').forEach(fix);
      else if (n.matches && n.matches('.zoomed_avatar img')) fix(n);
    })));
    mo.observe(doc.body, { childList: true });
    cleanups.push(() => mo.disconnect(), () => doc.removeEventListener('click', onClick, true));
  }

  function foldOnGenerate() {
    const c = ctx();
    const es = c && c.eventSource, et = c && c.eventTypes;
    if (!es || !et) return;
    const onGen = () => { if (fold()) toBottom(); };
    const onChat = () => { revealedBelow = Infinity; settleBottom(); };
    if (et.GENERATION_STARTED) es.on(et.GENERATION_STARTED, onGen);
    if (et.CHAT_CHANGED) es.on(et.CHAT_CHANGED, onChat);
    cleanups.push(() => { if (es.removeListener) { if (et.GENERATION_STARTED) es.removeListener(et.GENERATION_STARTED, onGen); if (et.CHAT_CHANGED) es.removeListener(et.CHAT_CHANGED, onChat); } });
  }

  // 打开聊天时酒馆先滚到底，主题的 CSS 常常后到：横幅、页脚是后长出来的，页脚就正好藏在底边下面一截（她和用户都见过「页脚被输入栏切掉半截」）。
  // 换聊天、装上以后等页面稳一下，如果离底只差页脚那么一点，就补滚到底。只在这两个时机做，不碰生成时的滚动；TT 虚拟化下不做
  const HP_SCRIPT_VERSION = '2.5.1';
  let settleT = 0;
  function settleBottom() {
    clearTimeout(settleT);
    settleT = setTimeout(() => {
      const c = chat();
      if (!c || bounded() || doc.body.dataset.generating === 'true') return;
      const gap = c.scrollHeight - c.scrollTop - c.clientHeight;
      // 后长出来的是顶上的横幅和底下的页脚：差距在这两块加一点余量以内，就是「本来在底、被它们顶开了」
      const foot = parseFloat(win.getComputedStyle(c, '::after').height) || 0;
      const head = parseFloat(win.getComputedStyle(c, '::before').height) || 0;
      if (gap > 1 && gap <= head + foot + 200) c.scrollTop = c.scrollHeight;   // 两块各自的外边距、聊天区的 gap 也算进去，多留 200
    }, 400);
  }

  /* ---------- 装上、拆下 ---------- */
  let otherMo = null;
  function watchOther() {
    if (otherMo) return;
    const sheld = doc.getElementById('sheld'), bar = doc.getElementById('top-bar');
    if (!sheld || !bar) return;
    otherMo = new win.MutationObserver(() => {
      if (doc.getElementById('hp-side') || doc.getElementById('hp-addr')) return;
      otherMo.disconnect(); otherMo = null;
      setTimeout(check, 50);   // 另一份拆干净了再装
    });
    otherMo.observe(sheld, { childList: true });
    otherMo.observe(bar, { childList: true });
  }
  function build() {
    if (built || !themeOn() || !doc.getElementById('top-bar') || !doc.getElementById('sheld')) return;
    // 酒馆助手重新导入不会顶掉旧的，会多出一份；两份都开着就有两个左栏叠在一起，改了一个、看到的是另一个（about me「保存了还是默认」）。
    // 页面上已经有一份在跑就不再装，但要盯着它：那一份关掉（拆掉左栏和地址栏）以后这一份接上。
    // 10-30 夜撤掉轮询后曾漏了这一步——她开着实验版和公开版两份、再关掉公开版，页面上只剩主题画的假地址栏，♡ 和 ☾ 都点不动
    if (doc.getElementById('hp-side') || doc.getElementById('hp-addr')) { watchOther(); return; }
    built = true;
    if (ls.get(KEY.night) === '1') doc.documentElement.classList.add('hp-night');
    doc.body.classList.add('hp-js');
    doc.body.dataset.hpScript = HP_SCRIPT_VERSION;   // 体检脚本靠它认脚本版本
    cleanups.push(() => doc.body.classList.remove('hp-js'), () => doc.documentElement.classList.remove('hp-night'), () => { delete doc.body.dataset.hpScript; clearTimeout(settleT); });
    buildAddress();
    buildSide();
    buildClock();
    labelExtensionTabs();
    buildFriends();
    keepPlaceholder();
    guardScroll();
    guardZoomedAvatar();
    foldOnGenerate();
    keepReasoningScroll();
    applyVisits();
    buildGate();
    settleBottom();
  }
  function teardown() {
    while (cleanups.length) { try { cleanups.pop()(); } catch (e) { /* 已经没了 */ } }
    built = false;
  }
  // 换主题时跟着装上或拆下。不轮询：酒馆换主题、改自定义 CSS 都是重写 <style id="custom-style"> 的内容，盯着它变就行；
  // 页面刚开、这个 <style> 还没建出来时先盯 <head>，等它出现再转过去。酒馆读完设置发的 SETTINGS_UPDATED 也顺带听一下
  const check = () => { if (!built && themeOn()) build(); else if (built && !themeOn()) teardown(); };
  let styleMo = null, checkT = null;
  const watchStyle = () => {
    const st = doc.getElementById('custom-style');
    if (!st) return false;
    if (!styleMo) {
      styleMo = new win.MutationObserver(() => { clearTimeout(checkT); checkT = setTimeout(check, 50); });
      styleMo.observe(st, { childList: true, characterData: true, subtree: true });
    }
    return true;
  };
  const headMo = new win.MutationObserver(() => { if (watchStyle()) { headMo.disconnect(); check(); } });
  if (!watchStyle()) headMo.observe(doc.head, { childList: true });
  const c0 = ctx();
  if (c0 && c0.eventSource && c0.eventTypes && c0.eventTypes.SETTINGS_UPDATED) c0.eventSource.on(c0.eventTypes.SETTINGS_UPDATED, check);
  check();
  window.addEventListener('pagehide', () => { if (styleMo) styleMo.disconnect(); headMo.disconnect(); clearTimeout(checkT); teardown(); });
})();
