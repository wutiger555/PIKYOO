#!/usr/bin/env python3
"""PIKYOO coach demo, simple version (2026-10-11): one line of what it is, the whole flow in three steps, then two rows
of short screen recordings, one person and one task each: what the student does, what the coach does.
Clips: iPhone 17 simulator, demo data, `xcrun simctl io booted recordVideo`, dead time cut with ffmpeg (rec/cut.py)."""
import base64, pathlib

ROOT = pathlib.Path(__file__).parent
def b64(name, mime): return f"data:{mime};base64," + base64.b64encode((ROOT / name).read_bytes()).decode()

STUDENT = [
  ("s1", "找到你", "學生打開 App 找教練，點進你的頁面，看到你的介紹、課程和價錢。"),
  ("s2", "選時段、送出預約", "選課程、選時段、選付款方式，按送出。這時還不用付錢。"),
  ("s3", "你答應後，轉帳付款", "掃 QR 或照帳號轉帳，轉好按「我付好了」。錢直接進你的帳戶。"),
]
COACH = [
  ("c1", "答應預約", "新的預約出現在「待辦」，按一下確認，付款資訊就自動傳給學生。"),
  ("c2", "看今天的課", "點進一堂課：誰要來、誰付了、上次的筆記，都在同一頁。"),
  ("c3", "確認收到錢", "學生說付好了，你看一下帳戶，按「收到了」就完成。"),
]

def row(items, who):
    return "".join(f'''
    <figure class="clip">
      <div class="phone"><video muted playsinline loop preload="metadata" poster="{b64(f'clip-{k}.jpg', 'image/jpeg')}" src="{b64(f'clip-{k}.mp4', 'video/mp4')}" aria-label="{who}：{t}（實機錄影）"></video></div>
      <figcaption><span class="n">{i+1}</span><b>{t}</b><span class="d">{d}</span></figcaption>
    </figure>''' for i, (k, t, d) in enumerate(items))

page = f"""<title>PIKYOO 匹友</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Noto+Sans+TC:wght@400;700;900&display=swap">
<style>
/* One dark stage, PIKYOO's lime only where the flow moves. Each recording is one person doing one thing. */
:root {{
  --stage:#0F110F; --carbon:#1A1D1B; --fg:#F2F3EF; --muted:#A3A89F; --line:#2B302B; --lime:#D4EE3A; --lime-ink:#121412; --screen:#F2F3EF;
  --disp:"Barlow Condensed","Noto Sans TC",sans-serif; --body:"Noto Sans TC","PingFang TC",system-ui,sans-serif;
  color-scheme:dark;
}}
* {{ box-sizing:border-box }}
html {{ scroll-behavior:smooth }}
body {{ margin:0; background:var(--stage); color:var(--fg); font-family:var(--body); line-height:1.65; padding-inline:16px; padding-block:0 }}
:focus-visible {{ outline:2px solid var(--lime); outline-offset:3px; border-radius:6px }}
.wrap {{ max-width:1080px; margin:0 auto }}
.brand {{ display:flex; align-items:center; gap:10px; font-family:var(--disp); font-weight:700; font-size:20px; letter-spacing:.04em; padding-block:24px }}
.brand svg {{ width:28px; height:28px }}

header {{ padding-block:32px 56px }}
h1 {{ font-family:var(--disp); font-weight:700; font-size:clamp(38px,5.4vw,68px); line-height:1.06; margin:0 0 18px; text-wrap:balance }}
h1 em {{ font-style:normal; color:var(--lime) }}
.sub {{ color:var(--muted); font-size:18px; margin:0; max-width:46ch }}

/* the whole flow, three words */
.flow {{ list-style:none; margin:40px 0 0; padding:0; display:flex; flex-wrap:wrap; align-items:center; gap:10px 0 }}
.flow li {{ display:flex; align-items:center; font-weight:700; font-size:17px }}
.flow li span {{ padding:10px 18px; border-radius:999px; border:1.5px solid var(--line); white-space:nowrap }}
.flow li small {{ color:var(--muted); font-weight:400; margin-left:6px }}
.flow li:last-child span {{ background:var(--lime); color:var(--lime-ink); border-color:var(--lime) }}
.flow li:last-child small {{ color:var(--lime-ink) }}
.flow li + li::before {{ content:""; width:28px; height:1.5px; background:var(--line) }}

section {{ padding-block:56px; border-top:1px solid var(--line) }}
h2 {{ font-family:var(--disp); font-weight:700; font-size:clamp(32px,3.6vw,46px); line-height:1.05; margin:0 0 6px }}
.who {{ color:var(--muted); margin:0 0 36px; font-size:17px }}
.row {{ display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:clamp(20px,4vw,48px) }}
.clip {{ margin:0; display:grid; gap:18px; align-content:start }}
.phone {{ position:relative; width:min(100%,250px); aspect-ratio:402/874; border-radius:12% / 5.5%; background:#070807; padding:3.2%; box-shadow:0 24px 60px rgba(0,0,0,.55), inset 0 0 0 1.5px #3A3F3A; cursor:pointer }}
.phone video {{ width:100%; height:100%; display:block; object-fit:cover; object-position:top; border-radius:9.5% / 4.4%; background:var(--screen) }}
.clip figcaption {{ display:grid; grid-template-columns:auto 1fr; gap:2px 12px; align-items:baseline; max-width:34ch }}
.n {{ grid-row:span 2; width:28px; height:28px; border-radius:50%; display:grid; place-items:center; font-family:var(--disp); font-weight:700; font-size:16px; background:var(--lime); color:var(--lime-ink) }}
.clip b {{ font-size:19px }}
.d {{ color:var(--muted); font-size:15px }}

.join {{ margin-block:24px 40px; background:var(--lime); color:var(--lime-ink); border-radius:20px; padding:clamp(28px,5vw,48px); display:flex; flex-wrap:wrap; gap:20px 40px; align-items:end; justify-content:space-between }}
.join h2 {{ margin:0 0 10px; font-size:clamp(36px,4.4vw,56px) }}
.join p {{ margin:0; font-size:18px; max-width:44ch }}
.join .site {{ background:var(--lime-ink); color:var(--fg); border-radius:10px; padding:16px 20px }}
.join .site span {{ display:block; font-size:13px; color:var(--muted) }}
.join .site b {{ font-family:var(--disp); font-size:24px; font-weight:600 }}
footer {{ color:var(--muted); font-size:13px; padding-block:0 40px; display:flex; justify-content:space-between; flex-wrap:wrap; gap:8px }}

@media (max-width:760px) {{
  .row {{ grid-template-columns:1fr; gap:44px }}
  .clip {{ grid-template-columns:150px 1fr; align-items:center; gap:18px }}
  .phone {{ width:150px }}
  .flow li + li::before {{ width:14px }}
  .flow li span {{ padding:8px 12px; font-size:15px }}
  .flow li small {{ display:none }}
}}
</style>

<div class="wrap">
<div class="brand" aria-label="PIKYOO 匹友">
  <svg viewBox="0 0 64 64" aria-hidden="true"><path d="M14 22a16 16 0 0 1 16-16h2a16 16 0 0 1 16 16v4a16 16 0 0 1-16 16h-6v16H14z" fill="#F2F3EF"/><circle cx="31" cy="24" r="7.5" fill="#D4EE3A"/></svg>
  PIKYOO 匹友
</div>
<header>
  <h1>學生自己約課、自己付款，<br><em>你只要按「答應」。</em></h1>
  <p class="sub">PIKYOO 是給雙北匹克球教練的 App。學生在上面找到你、預約、轉帳；你用手機答應預約、看今天的課、確認收到錢。</p>
  <ol class="flow" aria-label="整個流程">
    <li><span>學生預約</span></li>
    <li><span>你答應</span></li>
    <li><span>學生付款<small>直接進你帳戶</small></span></li>
  </ol>
</header>

<section aria-labelledby="h-s">
  <h2 id="h-s">學生怎麼用</h2>
  <p class="who">三個畫面，從找到你到付完錢。</p>
  <div class="row">{row(STUDENT, "學生")}</div>
</section>

<section aria-labelledby="h-c">
  <h2 id="h-c">你怎麼用</h2>
  <p class="who">教練端只有三個分頁：今天、學生、我的頁面。平常只要做這三件事。</p>
  <div class="row">{row(COACH, "教練")}</div>
</section>

<div class="join">
  <div><h2>成為第一批教練</h2><p>現在免費、不抽成。我們幫你建好頁面、整理課程，你照常上課就好。</p></div>
  <div class="site"><span>網站版現在就能看</span><b>pikyoo.vercel.app</b></div>
</div>
<footer><span>PIKYOO 匹友・雙北匹克球</span><span>畫面為示範資料的實機錄影，照片為示意照</span></footer>
</div>

<script>
// Each recording plays (muted, looping) while it is on screen; tapping the phone pauses or resumes it.
(function(){{
  var calm = matchMedia('(prefers-reduced-motion: reduce)').matches, clips = [];
  document.querySelectorAll('.clip').forEach(function(c){{
    var v = c.querySelector('video'), it = {{ v:v, held:calm }};
    c.querySelector('.phone').addEventListener('click', function(){{ it.held = !v.paused; if (v.paused) v.play().catch(function(){{}}); else v.pause(); }});
    clips.push(it);
  }});
  // a plain visibility check on scroll: more dependable than IntersectionObserver inside embedded frames
  var queued = false;
  function check(){{
    queued = false;
    var h = innerHeight || document.documentElement.clientHeight;
    clips.forEach(function(it){{
      var r = it.v.getBoundingClientRect(), shown = Math.min(r.bottom, h) - Math.max(r.top, 0);
      if (shown > r.height * .5) {{ if (!it.held && it.v.paused) it.v.play().catch(function(){{}}); }}
      else if (!it.v.paused) it.v.pause();
    }});
  }}
  function queue(){{ if (!queued) {{ queued = true; requestAnimationFrame(check); }} }}
  addEventListener('scroll', queue, {{ passive:true }}); addEventListener('resize', queue); addEventListener('load', queue); queue();
}})();
</script>
"""
(ROOT / "simple.html").write_text(page, encoding="utf-8")
print(len(page)//1024, "KB")
