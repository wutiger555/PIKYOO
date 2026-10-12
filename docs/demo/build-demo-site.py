#!/usr/bin/env python3
"""PIKYOO coach demo, explorer version (2026-10-11): every feature listed at once, grouped by the stage of a coach's day.
Pick one and the phone shows that screen right away, with numbered notes pinned on it; a short recording plays only when
asked. Screens: iPhone 17 simulator, demo data (../map/*.jpg); clips: clip-*.mp4 (rec/cut.py)."""
import base64, json, pathlib

ROOT = pathlib.Path(__file__).parent
MAP = ROOT.parent / "map"
def b64(p, mime): return f"data:{mime};base64," + base64.b64encode(p.read_bytes()).decode()

# (stage, key, screen, clip, title, one line, [(x%, y%, note)])
STUDENT = [
  ("被找到", "home", "home", None, "首頁就推薦你", "學生先選程度和想上的課，首頁列出適合的教練和最近能約的時段。",
   [(50, 27, "選程度、選課程類型"), (30, 50, "適合他的教練"), (50, 80, "近期還有位子的時段")]),
  ("被找到", "map", "coachmap", "s4", "地圖找教練", "像訂房網站一樣：每個上課場地一個價格標籤，點了就看到在那裡教課的教練，再點進教練頁。",
   [(72, 17, "選區域或場地"), (65, 58, "場地與起價"), (50, 70, "教練預覽，點進教練頁")]),
  ("被找到", "coaches", "coaches", "s1", "找教練，一張卡比較", "每位教練同一種格式：認證、程度、區域、起價、最近可約，一眼比較。",
   [(25, 57, "認證與 DUPR"), (82, 55, "起價"), (40, 81, "最近可約的時間")]),
  ("被找到", "coachpage", "coachpage", None, "你的教練頁", "照片、認證、教學年資、授課程度，下面接課程價目和問與答。",
   [(30, 52, "名字、評價、回覆速度"), (25, 62, "認證與程度"), (82, 92, "直接選時段預約")]),
  ("約課", "book", "book", "s2", "選課程、選時段", "學生只能選你開放的時段，送出時還不用付錢。",
   [(50, 25, "你的課程方案"), (12, 75, "你開放的時段"), (82, 92, "送出預約")]),
  ("約課", "pending", "pending", None, "等你回覆", "進度只有三步：教練回覆 → 付款 → 完成。48 小時沒回會自動取消。",
   [(50, 17, "三步進度"), (50, 32, "沒回覆會自動取消，不收費")]),
  ("付款", "pay", "pay", None, "你答應了，掃 QR 付款", "轉帳 QR 帶好你的帳號和金額，學生用銀行 App 一掃就付，錢直接進你帳戶。",
   [(18, 61, "台灣Pay 共通轉帳 QR"), (50, 74, "存到相簿再掃"), (50, 88, "不能掃也能複製帳號")]),
  ("付款", "mylessons", "mylessons", None, "我的課", "學生隨時看得到每堂課走到哪一步。",
   [(28, 29, "現在的狀態")]),
]
COACH = [
  ("課表", "today", "today", "c4", "今天", "打開就是今天的課、這週幾堂、還沒收到的錢；要處理的事集中在「待辦」。",
   [(20, 24, "今天、本週、還沒收到"), (50, 35, "待辦：預約、付款、提問"), (50, 67, "今天的每一堂課")]),
  ("課表", "week", "week", None, "這週行事曆", "日／週切換，一週有哪些課一目了然。",
   [(22, 42, "日／週切換"), (50, 59, "每天的課")]),
  ("課表", "inbox", "inbox", "c1", "待辦：答應預約", "新預約排在一起，看學生程度和備註，按一下就答應。",
   [(30, 25, "學生程度、第幾次上"), (78, 39, "確認預約"), (40, 81, "學生說付好了")]),
  ("上課", "lesson", "lesson", "c2", "上課這一堂", "誰要來、上次的筆記、點名、誰還沒付，同一頁。",
   [(50, 28, "時間、地點、場地"), (50, 54, "上次的課後筆記"), (55, 60, "點名"), (28, 78, "現場收款 QR")]),
  ("學生", "students", "students", None, "學生名單", "依下一堂課排序，套票剩幾堂直接標出來。",
   [(40, 17, "搜尋學生"), (50, 58, "套票剩幾堂")]),
  ("學生", "student", "student", "c5", "每位學生的紀錄", "套票進度、你寫的課後筆記、接下來的課，下次上課前看一眼。",
   [(50, 32, "套票進度"), (50, 54, "課後筆記，只有你看得到"), (50, 95, "接下來的課")]),
  ("你的頁面", "profile", "profile", None, "我的頁面", "專屬連結可以放 IG；完整度清單告訴你還缺什麼。",
   [(30, 21, "你的專屬連結"), (50, 28, "頁面完整度"), (50, 66, "課程與時段、收款紀錄")]),
  ("你的頁面", "plans", "plans", None, "課程與時段", "自己設價格、時長、人數，也能開「可揪朋友一起上」。",
   [(50, 40, "價格"), (50, 58, "時長"), (80, 80, "可揪朋友一起上")]),
  ("收款", "payments", "payments", "c3", "收款紀錄", "已收、待收一頁看完；學生說付好了，你看過帳戶按一下確認。",
   [(30, 22, "已收／待收"), (50, 33, "依狀態篩選"), (82, 62, "確認收到")]),
]

def pack(items):
    return [dict(stage=s, key=k, img=b64(MAP / f"{scr}.jpg", "image/jpeg"), clip=(b64(ROOT / f"clip-{c}.mp4", "video/mp4") if c else None),
                 title=t, line=l, notes=[dict(x=x, y=y, t=n) for x, y, n in notes]) for s, k, scr, c, t, l, notes in items]

DATA = json.dumps({"student": pack(STUDENT), "coach": pack(COACH)}, ensure_ascii=False)

page = """<title>PIKYOO 匹友</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Noto+Sans+TC:wght@400;700;900&display=swap">
<style>
/* A dark stage and one phone. Every feature is listed at once, grouped by the stage of a coach's day; picking one swaps
   the screen instantly and pins numbered notes on it. Recordings play only on request. Lime marks what is live. */
:root {
  --stage:#0F110F; --carbon:#1A1D1B; --carbon2:#222622; --fg:#F2F3EF; --muted:#A3A89F; --line:#2B302B; --lime:#D4EE3A; --lime-ink:#121412;
  --disp:"Barlow Condensed","Noto Sans TC",sans-serif; --body:"Noto Sans TC","PingFang TC",system-ui,sans-serif;
  --ease:cubic-bezier(.16,1,.3,1);
  color-scheme:dark;
}
* { box-sizing:border-box }
body { margin:0; background:var(--stage); color:var(--fg); font-family:var(--body); line-height:1.6; padding-inline:16px; padding-block:0 }
button { font:inherit; color:inherit; background:none; border:0; padding:0; cursor:pointer }
:focus-visible { outline:2px solid var(--lime); outline-offset:3px; border-radius:8px }
.wrap { max-width:1120px; margin:0 auto }
.brand { display:flex; align-items:center; gap:10px; font-family:var(--disp); font-weight:700; font-size:20px; letter-spacing:.04em; padding-block:22px }
.brand svg { width:28px; height:28px }

header { padding-block:8px 28px; display:grid; grid-template-columns:1fr auto; gap:24px 48px; align-items:end }
h1 { font-family:var(--disp); font-weight:700; font-size:clamp(34px,4.2vw,54px); line-height:1.08; margin:0 0 12px; text-wrap:balance }
h1 em { font-style:normal; color:var(--lime) }
.sub { color:var(--muted); font-size:18px; margin:0; max-width:44ch }
.count { display:flex; gap:28px }
.count div { display:grid }
.count b { font-family:var(--disp); font-size:56px; line-height:1; color:var(--lime); font-variant-numeric:tabular-nums }
.count span { color:var(--muted); font-size:14px }

/* the explorer */
.ex { display:grid; grid-template-columns:minmax(0,1fr) 360px; gap:clamp(28px,5vw,72px); padding-block:24px 64px; border-top:1px solid var(--line); align-items:start }
.side { min-width:0 }
.role { position:relative; display:inline-grid; grid-template-columns:1fr 1fr; background:var(--carbon); border-radius:999px; padding:5px; margin-bottom:28px }
.role button { position:relative; z-index:1; padding:12px 26px; font-weight:700; font-size:17px; border-radius:999px; color:var(--muted); transition:color .3s var(--ease) }
.role button[aria-pressed="true"] { color:var(--lime-ink) }
.role i { position:absolute; top:5px; bottom:5px; left:5px; width:calc(50% - 5px); border-radius:999px; background:var(--lime); transition:transform .45s var(--ease) }
.role.coach i { transform:translateX(100%) }
.stages { display:grid; gap:22px }
.stage h3 { margin:0 0 8px; font-size:13px; font-weight:700; letter-spacing:.12em; color:var(--muted); display:flex; align-items:center; gap:10px }
.stage h3::after { content:""; flex:1; height:1px; background:var(--line) }
.feats { list-style:none; margin:0; padding:0; display:grid; gap:4px }
.feat { display:grid; grid-template-columns:auto 1fr auto; gap:4px 14px; align-items:center; width:100%; text-align:left; padding:12px 14px; border-radius:12px; transition:background .25s var(--ease) }
.feat:hover { background:var(--carbon) }
.feat .dot { width:10px; height:10px; border-radius:50%; border:2px solid var(--line); transition:all .3s var(--ease) }
.feat b { font-size:18px }
.feat .vid { font-size:12px; color:var(--muted); border:1px solid var(--line); border-radius:999px; padding:1px 9px; white-space:nowrap }
.feat .line { grid-column:2 / -1; color:var(--muted); font-size:15px; display:none }
.feat[aria-current="true"] { background:var(--carbon2) }
.feat[aria-current="true"] .dot { background:var(--lime); border-color:var(--lime); box-shadow:0 0 0 5px rgba(212,238,58,.15) }
.feat[aria-current="true"] .line { display:block; animation:rise .4s var(--ease) }
@keyframes rise { from { opacity:0; transform:translateY(4px) } }

/* the phone */
.stagebox { position:sticky; top:24px; display:grid; gap:16px; justify-items:center }
.phone { position:relative; width:100%; max-width:330px; aspect-ratio:402/874; border-radius:12% / 5.5%; background:#070807; padding:3.2%; box-shadow:0 30px 70px rgba(0,0,0,.6), inset 0 0 0 1.5px #3A3F3A; transition:transform .6s var(--ease); transform-style:preserve-3d }
.scr { position:absolute; inset:3.2%; border-radius:9.5% / 4.4%; overflow:hidden; background:#F2F3EF }
.scr img, .scr video { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; object-position:top; display:block }
.scr img { transition:opacity .35s var(--ease), transform .5s var(--ease) }
.scr img.enter-r { opacity:0; transform:translateX(12%) }
.scr img.enter-l { opacity:0; transform:translateX(-12%) }
.scr video { background:#F2F3EF }
.pin { position:absolute; z-index:2; width:26px; height:26px; margin:-13px 0 0 -13px; border-radius:50%; background:var(--lime); color:var(--lime-ink); font-family:var(--disp); font-weight:700; font-size:15px; display:grid; place-items:center; box-shadow:0 2px 10px rgba(0,0,0,.35); opacity:0; transform:scale(.4); transition:opacity .3s var(--ease), transform .4s var(--ease) }
.pin.on { opacity:1; transform:none }
.pin::before { content:""; position:absolute; inset:-6px; border-radius:50%; border:2px solid var(--lime); opacity:0 }
.pin.hot::before { animation:ring 1.2s var(--ease) infinite }
@keyframes ring { 0% { opacity:.9; transform:scale(.7) } 100% { opacity:0; transform:scale(1.5) } }
.playing .pin { opacity:0 !important }
.notes { list-style:none; margin:0; padding:0; width:100%; max-width:330px; display:grid; gap:6px; min-height:96px }
.notes li { display:flex; gap:10px; align-items:center; font-size:15px; padding:4px 6px; border-radius:8px; cursor:default; transition:background .2s }
.notes li span { flex:none; width:22px; height:22px; border-radius:50%; background:var(--lime); color:var(--lime-ink); font-family:var(--disp); font-weight:700; font-size:13px; display:grid; place-items:center }
.notes li.hot { background:var(--carbon) }
.bar { display:flex; align-items:center; gap:8px; width:100%; max-width:330px }
.bar button { width:44px; height:44px; border-radius:50%; border:1.5px solid var(--line); display:grid; place-items:center; transition:border-color .2s }
.bar button:hover { border-color:var(--muted) }
.bar svg { width:18px; height:18px; fill:none; stroke:var(--fg); stroke-width:2; stroke-linecap:round; stroke-linejoin:round }
.bar .watch { width:auto; flex:1; border-radius:999px; padding-inline:16px; gap:8px; display:flex; justify-content:center; font-weight:700; background:var(--fg); color:var(--stage); border-color:var(--fg) }
.bar .watch svg { fill:var(--stage); stroke:none }
.bar .watch[hidden] { display:none }
.bar .pos { flex:1; text-align:center; font-family:var(--disp); font-size:18px; color:var(--muted); font-variant-numeric:tabular-nums }
.bar .watch:not([hidden]) ~ .pos { flex:none; padding-inline:6px }

.join { margin-block:8px 40px; background:var(--lime); color:var(--lime-ink); border-radius:20px; padding:clamp(28px,5vw,48px); display:flex; flex-wrap:wrap; gap:20px 40px; align-items:end; justify-content:space-between }
.join h2 { font-family:var(--disp); font-weight:700; margin:0 0 10px; font-size:clamp(36px,4.4vw,56px); line-height:1 }
.join p { margin:0; font-size:18px; max-width:44ch }
.join .site { background:var(--lime-ink); color:var(--fg); border-radius:10px; padding:16px 20px }
.join .site span { display:block; font-size:13px; color:var(--muted) }
.join .site b { font-family:var(--disp); font-size:24px; font-weight:600 }
footer { color:var(--muted); font-size:13px; padding-block:0 40px; display:flex; justify-content:space-between; flex-wrap:wrap; gap:8px }

@media (max-width:820px) {
  header { grid-template-columns:1fr }
  .count b { font-size:40px }
  .ex { grid-template-columns:1fr; gap:20px }
  .stagebox { position:static }
  .phone { max-width:250px }
  .role { display:grid; width:100%; margin-bottom:18px }
  /* the list turns into a row of chips you swipe through, so the phone stays in view */
  .stages { display:flex; gap:8px; overflow-x:auto; scrollbar-width:none; padding-bottom:4px; margin-inline:-16px; padding-inline:16px; scroll-snap-type:x proximity }
  .stages::-webkit-scrollbar { display:none }
  .stage { display:contents }
  .stage h3 { display:none }
  .feats { display:contents }
  .feats li { flex:none; scroll-snap-align:center }
  .feat { grid-template-columns:auto auto; border:1.5px solid var(--line); border-radius:999px; padding:8px 14px; white-space:nowrap }
  .feat b { font-size:15px }
  .feat .vid, .feat .line { display:none !important }
  .feat[aria-current="true"] { border-color:var(--lime) }
  .mline { display:block !important }
}
.mline { display:none; color:var(--muted); font-size:15px; margin:0; max-width:330px; text-align:center }
@media (prefers-reduced-motion: reduce) {
  .scr img, .phone, .pin, .role i { transition:none }
  .pin.hot::before, .feat[aria-current="true"] .line { animation:none }
}
</style>

<div class="wrap">
<div class="brand" aria-label="PIKYOO 匹友"><svg viewBox="0 0 64 64" aria-hidden="true"><path d="M14 22a16 16 0 0 1 16-16h2a16 16 0 0 1 16 16v4a16 16 0 0 1-16 16h-6v16H14z" fill="#F2F3EF"/><circle cx="31" cy="24" r="7.5" fill="#D4EE3A"/></svg>PIKYOO 匹友</div>
<header>
  <div>
    <h1>約課、上課、記錄學生、收款<br><em>一支手機搞定。</em></h1>
    <p class="sub">雙北匹克球教練的約課與上課平台。點任何一個功能，右邊的手機馬上換到那個畫面。</p>
  </div>
  <div class="count" aria-hidden="true"><div><b id="nS">7</b><span>學生端功能</span></div><div><b id="nC">9</b><span>教練端功能</span></div></div>
</header>

<section class="ex" aria-label="功能導覽">
  <div class="side">
    <div class="role" role="group" aria-label="切換身分"><i></i><button type="button" data-role="student" aria-pressed="true">學生看到的</button><button type="button" data-role="coach" aria-pressed="false">教練用的</button></div>
    <div class="stages" id="stages"></div>
  </div>
  <div class="stagebox">
    <div class="phone" id="phone"><div class="scr" id="scr"></div></div>
    <p class="mline" id="mline"></p>
    <div class="bar">
      <button type="button" id="prev" aria-label="上一個功能"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button>
      <button type="button" class="watch" id="watch"><svg viewBox="0 0 24 24"><path d="M7 4.5l12 7.5-12 7.5z"/></svg>看實際操作</button>
      <span class="pos" id="pos"></span>
      <button type="button" id="next" aria-label="下一個功能"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button>
    </div>
    <ol class="notes" id="notes" aria-label="這個畫面的重點"></ol>
  </div>
</section>

<div class="join">
  <div><h2>成為第一批教練</h2><p>現在免費、不抽成。我們幫你建好教練頁、整理課程，你照常上課就好。</p></div>
  <div class="site"><span>網站版現在就能看</span><b>pikyoo.vercel.app</b></div>
</div>
<footer><span>PIKYOO 匹友・雙北匹克球</span><span>畫面為示範資料的實機截圖與錄影，照片為示意照</span></footer>
</div>

<script type="application/json" id="data">__DATA__</script>
<script>
(function(){
  var D = JSON.parse(document.getElementById('data').textContent);
  var calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function(id){ return document.getElementById(id); };
  var role = 'student', idx = 0, video = null;
  $('nS').textContent = D.student.length; $('nC').textContent = D.coach.length;

  function list(){
    var items = D[role], html = '', last = null;
    items.forEach(function(f, i){
      if (f.stage !== last) { if (last !== null) html += '</ul></div>'; html += '<div class="stage"><h3>' + f.stage + '</h3><ul class="feats">'; last = f.stage; }
      html += '<li><button type="button" class="feat" data-i="' + i + '"><span class="dot"></span><b>' + f.title + '</b>' + (f.clip ? '<span class="vid">有影片</span>' : '<span></span>') + '<span class="line">' + f.line + '</span></button></li>';
    });
    $('stages').innerHTML = html + '</ul></div>';
    $('stages').querySelectorAll('.feat').forEach(function(b){ b.addEventListener('click', function(){ show(+b.dataset.i); }); });
  }

  function stop(){ if (video) { video.remove(); video = null; $('phone').classList.remove('playing'); } }

  function show(i, dir){
    var items = D[role], f;
    i = (i + items.length) % items.length; f = items[i];
    dir = dir || (i >= idx ? 'r' : 'l'); idx = i; stop();
    var scr = $('scr'), old = scr.querySelectorAll('img'), im = new Image();
    im.src = f.img; im.alt = f.title + '畫面'; im.className = calm ? '' : 'enter-' + dir;
    scr.appendChild(im);
    void im.offsetWidth; setTimeout(function(){ im.className = ''; }, 20);
    setTimeout(function(){ old.forEach(function(o){ o.remove(); }); }, 400);
    scr.querySelectorAll('.pin').forEach(function(p){ p.remove(); });
    f.notes.forEach(function(n, k){
      var p = document.createElement('span'); p.className = 'pin'; p.textContent = k + 1;
      p.style.left = n.x + '%'; p.style.top = n.y + '%'; p.dataset.k = k;
      scr.appendChild(p); setTimeout(function(){ p.classList.add('on'); }, calm ? 0 : 250 + k * 120);
      p.addEventListener('mouseenter', function(){ hot(k); }); p.addEventListener('mouseleave', function(){ hot(-1); });
    });
    $('notes').innerHTML = f.notes.map(function(n, k){ return '<li data-k="' + k + '"><span>' + (k + 1) + '</span>' + n.t + '</li>'; }).join('');
    $('notes').querySelectorAll('li').forEach(function(li){ li.addEventListener('mouseenter', function(){ hot(+li.dataset.k); }); li.addEventListener('mouseleave', function(){ hot(-1); }); });
    $('watch').hidden = !f.clip;
    $('pos').textContent = (i + 1) + ' / ' + items.length;
    $('mline').textContent = f.line;
    $('stages').querySelectorAll('.feat').forEach(function(b){ var on = +b.dataset.i === i; b.setAttribute('aria-current', on ? 'true' : 'false'); if (on && matchMedia('(max-width:820px)').matches) { var row = $('stages'); row.scrollTo({ left: b.parentNode.offsetLeft - (row.clientWidth - b.offsetWidth) / 2, behavior: calm ? 'auto' : 'smooth' }); } });
  }

  function hot(k){
    $('scr').querySelectorAll('.pin').forEach(function(p){ p.classList.toggle('hot', +p.dataset.k === k); });
    $('notes').querySelectorAll('li').forEach(function(li){ li.classList.toggle('hot', +li.dataset.k === k); });
  }

  $('watch').addEventListener('click', function(){
    var f = D[role][idx]; if (!f.clip) return;
    if (video) { stop(); return; }
    video = document.createElement('video'); video.src = f.clip; video.muted = true; video.playsInline = true; video.setAttribute('aria-label', f.title + '的實際操作錄影');
    $('scr').appendChild(video); $('phone').classList.add('playing');
    video.play().catch(function(){});
    video.addEventListener('ended', stop);
  });
  $('prev').addEventListener('click', function(){ show(idx - 1, 'l'); });
  $('next').addEventListener('click', function(){ show(idx + 1, 'r'); });
  document.querySelectorAll('.role button').forEach(function(b){
    b.addEventListener('click', function(){
      role = b.dataset.role;
      document.querySelectorAll('.role button').forEach(function(x){ x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      document.querySelector('.role').classList.toggle('coach', role === 'coach');
      list(); idx = 0; show(0, role === 'coach' ? 'r' : 'l');
    });
  });
  document.addEventListener('keydown', function(e){
    if (e.target.closest && e.target.closest('input,textarea')) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { show(idx + 1, 'r'); e.preventDefault(); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { show(idx - 1, 'l'); e.preventDefault(); }
  });
  // a slight tilt toward the pointer, so the phone feels like an object on the desk (desktop only)
  var ph = $('phone');
  if (!calm && matchMedia('(pointer:fine)').matches) {
    document.querySelector('.ex').addEventListener('pointermove', function(e){
      var r = ph.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      ph.style.transform = 'perspective(1200px) rotateY(' + (x * 6).toFixed(2) + 'deg) rotateX(' + (-y * 4).toFixed(2) + 'deg)';
    });
    document.querySelector('.ex').addEventListener('pointerleave', function(){ ph.style.transform = ''; });
  }
  list(); show(0);
})();
</script>
"""
(ROOT / "explore.html").write_text(page.replace("__DATA__", DATA.replace("</", "<\\/")), encoding="utf-8")
print(len(page) // 1024 + len(DATA) // 1024, "KB")
