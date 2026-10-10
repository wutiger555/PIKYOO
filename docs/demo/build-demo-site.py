#!/usr/bin/env python3
"""PIKYOO coach demo: one phone pinned at the center; the page scrolls through its screens.

Provenance for docs/demo/PIKYOO-教練示範網站.html. Inputs (not committed, 3.4 MB): img/<shot>.png are iPhone 17 simulator
screenshots of the app in demo mode (EXPO_PUBLIC_DATA_SOURCE=demo) taken 2026-10-10, shrunk to 720 px wide with sips;
qr.json is the TWQR transfer string for the demo account rendered to modules with the `qrcode` package (see
packages/core/src/twqr.ts). Run from a folder holding both; the output is wrapped in a doctype/head skeleton before use."""
import base64, json, pathlib

ROOT = pathlib.Path(__file__).parent
def img(name): return "data:image/png;base64," + base64.b64encode((ROOT / "img" / f"{name}.png").read_bytes()).decode()
qr = json.loads((ROOT / "qr.json").read_text())

# Beats in story order. kind: hero | screen | bleed-qr | bleed-paid | bleed-week | close
# side: l | r (which side of the phone the copy sits). num: a Barlow Condensed figure shown large.
BEATS = [
  dict(k="hero", shot="09-pay-qr", side="l", act=0,
       title="錢直接進你的帳戶", body="學生用銀行 App 掃一下，NT$600 從他的帳戶轉進你的。PIKYOO 不代收、不抽成，連看都看不到。"),
  dict(k="bleed-qr", shot="09-pay-qr", side="l", act=0,
       title="這張 QR 是真的", body="用你的銀行代碼和帳號即時產生的台灣Pay 共通轉帳碼。支援台灣Pay 的銀行 App 掃了，帳號和金額自動帶入。"),
  dict(k="screen", shot="10-report", side="r", act=0, num="5 碼",
       title="轉好了，學生回報", body="填轉出帳號末五碼，或附上銀行 App 的截圖，按「我已轉帳」。你那邊立刻看到。"),
  dict(k="screen", shot="30-payments", side="l", act=0,
       title="你對帳，一頁看完", body="誰回報了、誰還沒付、本月已收多少。對過銀行入帳後按「確認收到」。"),
  dict(k="bleed-paid", shot="30-payments", side="r", act=0, num="NT$600",
       title="已收到", body="學生收到通知，進度變成已付款。前一晚 20:00 系統再提醒他明天有課。"),

  dict(k="screen", shot="02-coaches", side="r", act=1,
       title="學生怎麼找到你", body="每位教練用同一種格式呈現：認證、程度、起價、最近可約。學生比較完直接點進來。"),
  dict(k="screen", shot="03-coach-page", side="l", act=1,
       title="你的門面", body="封面、一句話定位、認證、年資、學生數、授課程度。這頁就是你的個人網站，連結放 IG 簡介。"),
  dict(k="screen", shot="04-coach-plans", side="r", act=1, num="4 種",
       title="價目你自己定", body="一對一、小班、體驗課、套票。小班課可以讓學生揪朋友，各自付款。"),
  dict(k="screen", shot="06-book-1", side="l", act=1,
       title="學生自己選時段", body="只能選你開放的時段，剩幾位即時更新。你擋掉的時間，他們看不到。不用再來回對時間。"),
  dict(k="screen", shot="22-inbox", side="r", act=1, num="48h",
       title="你按一下確認", body="申請進到「待處理」。確認後課排進行事曆，付款資訊自動傳給學生。48 小時沒處理自動取消。"),

  dict(k="screen", shot="20-coach-calendar", side="l", act=2,
       title="你的一天，從這裡開始", body="今天幾堂、下一堂是什麼、本週課數、待收款。所有要回的事集中在待處理。"),
  dict(k="bleed-week", shot="21-week", side="r", act=2,
       title="一週，一眼", body="待確認的預約用虛線排在行事曆上，確認前就知道會不會撞課。請假、比賽直接擋掉整天。"),
  dict(k="screen", shot="23-lesson", side="r", act=2,
       title="一堂課，一頁", body="時間地點、一鍵加入手機行事曆、導航，和只有你看得到的課前備註。"),
  dict(k="screen", shot="24-lesson-roster", side="l", act=2,
       title="球場邊，單手操作", body="每位學生：付款狀態、上次筆記、點名。下雨改室內、取消這堂課，按了通知所有人。"),
  dict(k="screen", shot="31-collect-qr", side="r", act=2,
       title="現場收款，也是掃一下", body="手機出示這位學生金額的 QR，他當場掃就付。收到按「已收到」結案。"),
  dict(k="screen", shot="26-student", side="l", act=2, num="7 堂",
       title="每個學生，一本紀錄", body="套票剩幾堂、歷次課後筆記、接下來的課。點名「到」自動扣一堂。筆記下次上課前自動出現。"),
  dict(k="screen", shot="29-remind", side="r", act=2,
       title="提醒交給系統", body="上課前提醒、每晚明天課表、每週一訂場提醒，都帶著你的課前備註。"),

  dict(k="close", shot="34-coach-profile", side="l", act=3,
       title="成為第一批教練", body="我們正在找雙北第一批進駐的匹克球教練。現在免費、不抽成；前期由我們協助建頁、拍照、搬學生。"),
]
ACTS = ["收到錢", "被找到", "你的一天", "加入"]
SHOTS = sorted({b["shot"] for b in BEATS})

def qr_svg():
    n = qr["n"]
    cells = qr["cells"]
    rects = "".join(f'<rect x="{x}" y="{y}" width="1" height="1" style="--i:{i}"/>' for i, (x, y) in enumerate(cells))
    return f'<svg class="qrbig" viewBox="-2 -2 {n+4} {n+4}" aria-label="轉帳 QR code（真實字串）" role="img">{rects}</svg>'

def beats_html():
    out, act = [], None
    for i, b in enumerate(BEATS):
        if act is not None and b["act"] != act: out.append('<div class="rule" role="separator"></div>')
        act = b["act"]; out.append(beat_html(i, b))
    return "".join(out)

def beat_html(i, b):
    num = f'<p class="num">{b["num"]}</p>' if b.get("num") else ""
    return f'''<section class="beat {b["side"]} k-{b["k"]}" data-i="{i}" data-shot="{b["shot"]}" data-k="{b["k"]}" data-act="{b["act"]}" id="b{i}">
  <div class="copy">{num}<h2>{b["title"]}</h2><p>{b["body"]}</p>{"<a class='go' href='#'>看看學生怎麼約你</a>" if b["k"]=="hero" else ""}{"<div class='invite'><span>網站版現在就能用</span><b>pikyoo.vercel.app</b></div>" if b["k"]=="close" else ""}</div>
</section>'''

page = f"""<title>PIKYOO 匹友</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Noto+Sans+TC:wght@400;700;900&display=swap">
<style>
/* A dark stage. One white phone pinned at the exact center; the page scrolls past it and only its screen changes.
   Lime appears where money moves. Ball-hole dots mark the acts. */
:root {{
  --stage:#0F110F; --stage2:#1A1D1B; --fg:#F2F3EF; --muted:#A3A89F; --line:#2B302B;
  --lime:#D4EE3A; --lime-ink:#121412; --screen:#F2F3EF;
  --disp:"Barlow Condensed","Noto Sans TC",sans-serif; --body:"Noto Sans TC","PingFang TC",system-ui,sans-serif;
  --ease:cubic-bezier(.16,1,.3,1);
  --weave:repeating-linear-gradient(45deg,rgba(255,255,255,.035) 0 2px,transparent 2px 5px),repeating-linear-gradient(-45deg,rgba(0,0,0,.22) 0 2px,transparent 2px 5px);
  color-scheme:dark;
}}
@media (prefers-color-scheme: light) {{ :root:not([data-theme="dark"]) {{ --stage:#0F110F; --stage2:#1A1D1B; --fg:#F2F3EF; --muted:#A3A89F; --line:#2B302B; color-scheme:dark }} }}
:root[data-theme="light"] {{ --stage:#0F110F; --stage2:#1A1D1B; --fg:#F2F3EF; --muted:#A3A89F; --line:#2B302B; color-scheme:dark }}
* {{ box-sizing:border-box }}
html {{ scroll-behavior:smooth }}
body {{ margin:0; background:var(--stage); color:var(--fg); font-family:var(--body); line-height:1.6; padding-inline:0; padding-block:0; overflow-x:hidden; }}
::selection {{ background:var(--lime); color:var(--lime-ink) }}
a {{ color:inherit }}
:focus-visible {{ outline:2px solid var(--lime); outline-offset:3px }}

/* ---------- stage ---------- */
.stage {{ position:relative }}
.pin {{ position:sticky; top:0; height:100vh; height:100dvh; width:100%; z-index:2; pointer-events:none; overflow:hidden; }}
.phone {{ position:absolute; left:50%; top:50%; width:min(34vw,340px,36dvh); aspect-ratio:390/844; transform:translate(-50%,-50%) scale(var(--ps,1)); transition:transform .7s var(--ease), opacity .7s var(--ease), filter .7s var(--ease); pointer-events:auto; cursor:pointer;
  border-radius:11.5% / 5.3%; background:#070807; padding:2.6%; box-shadow:0 40px 90px rgba(0,0,0,.65), inset 0 0 0 1.5px #3A3F3A; }}
.phone.away {{ --ps:.62; opacity:.25; filter:blur(3px); pointer-events:none }}
.phone .scr {{ position:absolute; inset:2.6%; border-radius:9.5% / 4.4%; overflow:hidden; background:var(--screen) }}
.phone .scr img {{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; object-position:top; display:block; transition:opacity .28s var(--ease), filter .28s var(--ease) }}
.phone .scr img.out {{ opacity:0; filter:blur(2px) }}
.phone .notch {{ position:absolute; top:3.2%; left:50%; transform:translateX(-50%); width:28%; height:3.2%; border-radius:999px; background:#070807; z-index:2 }}
/* scan line + money track on the hero */
.scan {{ position:absolute; left:6%; right:6%; height:2px; background:var(--lime); top:38%; opacity:0; z-index:3 }}
.scan::after {{ content:""; position:absolute; left:0; right:0; top:2px; height:28px; background:linear-gradient(rgba(212,238,58,.35), transparent) }}
.pin.hero .scan {{ animation:sweep 1.6s var(--ease) .4s 1 both }}
@keyframes sweep {{ 0%{{top:36%;opacity:0}} 10%{{opacity:1}} 90%{{opacity:1}} 100%{{top:60%;opacity:0}} }}
.stub {{ position:absolute; left:calc(50% + min(17vw,170px) + 3vw); top:50%; transform:translateY(-50%) translateX(30px); opacity:0; transition:opacity .4s var(--ease), transform .4s var(--ease);
  width:min(23vw,260px); background:var(--stage2); background-image:var(--weave); border-radius:14px; padding:18px 20px; color:var(--fg); box-shadow:0 20px 50px rgba(0,0,0,.5) }}
.pin.hero .stub {{ opacity:1; transform:translateY(-50%) translateX(0); transition-delay:1.5s }}
.stub small {{ display:block; font-size:12px; letter-spacing:.08em; color:var(--muted) }}
.stub .acct {{ font-family:var(--disp); font-size:22px; font-weight:600; letter-spacing:.02em; margin:2px 0 10px }}
.stub .plus {{ font-family:var(--disp); font-size:48px; font-weight:700; color:var(--lime); line-height:1; font-variant-numeric:tabular-nums }}
.stub .holes {{ position:absolute; left:-7px; top:14px; bottom:14px; width:14px; background:radial-gradient(circle at 50% 50%, var(--stage) 0 4px, transparent 4.5px) 0 0/14px 14px repeat-y }}
/* full-bleed layers */
.bleed {{ position:absolute; inset:0; display:grid; place-items:center; opacity:0; transition:opacity .6s var(--ease); z-index:1 }}
.bleed.on {{ opacity:1 }}
.qrbig {{ width:min(78vh,78vw); height:auto; margin-left:16vw }}
.qrbig rect {{ fill:var(--fg); opacity:0; transform:scale(.2); transform-origin:center; transform-box:fill-box; transition:opacity .35s var(--ease), transform .5s var(--ease); transition-delay:calc(var(--i) * 1.1ms) }}
.bleed.on .qrbig rect {{ opacity:1; transform:none }}
.bleed-qr::after {{ content:"TWQRP://812NTTransfer/158/02/V1?D6=0028881001234567&D5=812&D10=901&D1=60000"; position:absolute; bottom:5vh; left:50%; transform:translateX(-50%); font-family:var(--disp); font-size:clamp(11px,1.3vw,15px); letter-spacing:.06em; color:var(--muted); white-space:nowrap; max-width:92vw; overflow:hidden; text-overflow:ellipsis }}
.bleed-paid {{ background:var(--lime); color:var(--lime-ink); place-items:center start; padding-left:clamp(16px,6vw,96px) }}
.bleed-paid .big {{ font-family:var(--disp); font-weight:700; font-size:clamp(80px,15vw,230px); line-height:.9; letter-spacing:-.01em; transform:translateY(30px); transition:transform .9s var(--ease) .1s; font-variant-numeric:tabular-nums }}
.bleed.on .big {{ transform:none }}
.bleed-paid .big small {{ display:block; font-size:.22em; letter-spacing:.1em; font-weight:600 }}
.bleed-week {{ place-items:center end; padding-right:clamp(16px,8vw,140px) }}
.bleed-week img {{ height:min(86vh,86dvh); width:auto; max-width:92vw; border-radius:18px; box-shadow:0 40px 120px rgba(0,0,0,.6); transform:scale(.94); transition:transform 1s var(--ease) }}
.bleed.on img {{ transform:none }}
/* act dots */
.dots {{ position:fixed; left:50%; bottom:calc(18px + env(safe-area-inset-bottom,0px)); transform:translateX(-50%); display:flex; gap:12px; z-index:5; pointer-events:auto }}
.dots button {{ width:14px; height:14px; border-radius:50%; border:0; padding:0; cursor:pointer; background:radial-gradient(circle at 50% 50%, var(--stage) 0 3px, var(--line) 3.5px); transition:background .3s var(--ease), transform .3s var(--ease) }}
.dots button.on {{ background:radial-gradient(circle at 50% 50%, var(--lime-ink) 0 3px, var(--lime) 3.5px); transform:scale(1.25) }}
.dots button:hover {{ transform:scale(1.2) }}
.actname {{ position:fixed; left:50%; bottom:calc(40px + env(safe-area-inset-bottom,0px)); transform:translateX(-50%); font-family:var(--disp); font-size:14px; letter-spacing:.18em; color:var(--muted); z-index:5 }}
.brand {{ position:fixed; top:calc(18px + env(safe-area-inset-top,0px)); left:22px; z-index:5; display:flex; align-items:center; gap:10px; font-family:var(--disp); font-weight:700; font-size:20px; letter-spacing:.04em; text-decoration:none; color:var(--fg) }}
.brand svg {{ width:28px; height:28px }}
.hint {{ position:fixed; right:22px; top:calc(22px + env(safe-area-inset-top,0px)); z-index:5; font-size:13px; color:var(--muted) }}
.hint kbd {{ font:inherit; border:1px solid var(--line); border-radius:6px; padding:1px 6px; margin:0 2px }}

/* ---------- beats ---------- */
.beats {{ position:relative; z-index:3; margin-top:-100vh; margin-top:-100dvh; pointer-events:none }}
.beat {{ min-height:100vh; min-height:100dvh; display:grid; grid-template-columns:1fr min(34vw,340px) 1fr; align-items:center; padding-inline:clamp(16px,5vw,80px); column-gap:clamp(24px,5vw,96px) }}
.beat .copy {{ max-width:30rem; opacity:.18; transform:translateY(18px); transition:opacity .6s var(--ease), transform .7s var(--ease); pointer-events:auto }}
.beat.on .copy {{ opacity:1; transform:none }}
.beat.l .copy {{ grid-column:1; justify-self:end; text-align:right }}
.beat.r .copy {{ grid-column:3; justify-self:start }}
.beat h2 {{ font-family:var(--disp); font-weight:700; font-size:clamp(40px,5.2vw,78px); line-height:.98; margin:0 0 16px; letter-spacing:.005em; text-wrap:balance }}
.beat p {{ margin:0; font-size:clamp(15px,1.25vw,18px); color:var(--muted); max-width:34ch }}
.beat.l p {{ margin-left:auto }}
.beat .num {{ font-family:var(--disp); font-weight:600; font-size:clamp(64px,8vw,120px); line-height:.9; color:var(--lime); margin:0 0 6px; font-variant-numeric:tabular-nums }}
.beat.k-hero h2 {{ font-size:clamp(46px,6vw,92px) }}
.beat.k-bleed-paid .copy, .beat.k-bleed-qr .copy, .beat.k-bleed-week .copy {{ z-index:4; position:relative }}
.beat.k-bleed-qr .copy, .beat.k-bleed-week .copy {{ background:rgba(15,17,15,.86); background-image:var(--weave); backdrop-filter:blur(6px); border-radius:18px; padding:26px 28px; box-shadow:0 30px 80px rgba(0,0,0,.5) }}
.beat.k-bleed-qr .copy {{ grid-column:1; justify-self:start; text-align:left }}
.beat.k-bleed-qr p {{ margin-left:0 }}
.beat.k-bleed-paid h2, .beat.k-bleed-paid p {{ color:var(--lime-ink) }}
.beat.k-bleed-paid .num {{ display:none }}
.go {{ display:inline-flex; align-items:center; gap:10px; margin-top:26px; padding:14px 22px; border-radius:999px; background:var(--lime); color:var(--lime-ink); font-weight:700; text-decoration:none; box-shadow:0 10px 24px rgba(0,0,0,.45); transition:transform .15s var(--ease), box-shadow .15s var(--ease) }}
.go:hover {{ transform:translateY(-1px); box-shadow:0 14px 28px rgba(0,0,0,.5) }}
.invite {{ margin-top:26px; display:inline-block; background:var(--stage2); background-image:var(--weave); border-radius:14px; padding:14px 18px; text-align:left }}
.invite span {{ display:block; font-size:12px; color:var(--muted); letter-spacing:.06em }}
.invite b {{ font-family:var(--disp); font-size:24px; letter-spacing:.02em; font-weight:600 }}
.rule {{ height:1px; background:var(--line); margin:0 clamp(16px,5vw,80px) }}
footer {{ position:relative; z-index:3; padding:60px clamp(16px,5vw,80px) calc(90px + env(safe-area-inset-bottom,0px)); color:var(--muted); font-size:13px; display:flex; justify-content:space-between; flex-wrap:wrap; gap:8px }}

/* ---------- phone width: the pinned phone becomes a top strip, copy reads top to bottom ---------- */
@media (max-width:760px) {{
  .pin {{ height:46vh; height:46dvh; background:linear-gradient(var(--stage) 86%, transparent); pointer-events:none }}
  .phone {{ width:min(40vw,160px); top:56%; }}
  .brand {{ font-size:16px; top:calc(12px + env(safe-area-inset-top,0px)); left:16px }}
  .brand svg {{ width:22px; height:22px }}
  .phone.away {{ --ps:.9; opacity:.5 }}
  .phone {{ left:37% }}
  .stub {{ display:block; left:auto; right:14px; width:min(40vw,150px); padding:12px 14px }}
  .stub .acct {{ font-size:15px }}
  .stub .plus {{ font-size:30px }}
  .bleed-qr::after {{ display:none }}
  .qrbig {{ width:min(70vw,38vh); margin-left:0 }}
  .bleed-paid .big {{ font-size:clamp(56px,20vw,120px) }}
  .bleed-week {{ place-items:center; padding-right:0 }}
  .bleed-week img {{ height:40vh; width:auto }}
  .beats {{ margin-top:0; z-index:1 }}
  .beat {{ min-height:0; display:block; padding:28px 20px 44px }}
  .beat .copy, .beat.l .copy, .beat.r .copy {{ max-width:none; text-align:left; justify-self:auto; opacity:1; transform:none }}
  .beat.l p {{ margin-left:0 }}
  .beat h2, .beat.k-hero h2 {{ font-size:clamp(34px,10vw,48px) }}
  .beat .num {{ font-size:56px }}
  .beat.k-bleed-paid .copy {{ background:var(--lime); color:var(--lime-ink); border-radius:16px; padding:18px }}
  .beat.k-bleed-qr .copy, .beat.k-bleed-week .copy {{ background:var(--stage2); background-image:var(--weave); border-radius:16px; padding:18px; backdrop-filter:none; box-shadow:none }}
  .bleed-paid {{ padding-left:0; place-items:center }}
  .bleed-paid .big small {{ display:none }}
  .hint {{ display:none }}
  .actname {{ display:none }}
  .dots {{ left:0; right:0; transform:none; justify-content:center; bottom:0; padding:14px 0 calc(14px + env(safe-area-inset-bottom,0px)); background:linear-gradient(transparent, var(--stage) 45%) }}
  footer {{ padding-bottom:calc(64px + env(safe-area-inset-bottom,0px)) }}
}}
@media (prefers-reduced-motion: reduce) {{
  html {{ scroll-behavior:auto }}
  .pin.hero .scan {{ animation:none }}
  .qrbig rect {{ transition-delay:0s }}
  .phone, .beat .copy, .bleed img, .bleed-paid .big {{ transition-duration:.01s }}
}}
</style>

<a class="brand" href="#b0" aria-label="PIKYOO 匹友，回到開頭">
  <svg viewBox="0 0 64 64" aria-hidden="true"><path d="M14 22a16 16 0 0 1 16-16h2a16 16 0 0 1 16 16v4a16 16 0 0 1-16 16h-6v16H14z" fill="#F2F3EF"/><circle cx="31" cy="24" r="7.5" fill="#D4EE3A"/><g fill="#3B4409" opacity=".82"><circle cx="31" cy="24" r="1.05"/><circle cx="31" cy="20.1" r=".92"/><circle cx="34.4" cy="22" r=".92"/><circle cx="34.4" cy="26" r=".92"/><circle cx="31" cy="27.9" r=".92"/><circle cx="27.6" cy="26" r=".92"/><circle cx="27.6" cy="22" r=".92"/></g></svg>
  PIKYOO 匹友
</a>
<div class="hint" aria-hidden="true">往下捲，或按 <kbd>↓</kbd>／點手機</div>

<div class="stage">
  <div class="pin hero" id="pin">
    <div class="bleed bleed-qr" data-k="bleed-qr">{qr_svg()}</div>
    <div class="bleed bleed-paid" data-k="bleed-paid"><div class="big">已收到<small>NT$600・小安・新手體驗課</small></div></div>
    <div class="bleed bleed-week" data-k="bleed-week"><img src="{img("21-week")}" data-key="21-week" alt="教練週檢視行事曆" width="1180" height="2560" loading="eager"></div>
    <div class="phone" id="phone" role="button" tabindex="0" aria-label="下一個畫面">
      <div class="notch"></div>
      <div class="scr"><img class="a" src="{img("09-pay-qr")}" data-key="09-pay-qr" alt="學生的付款頁：轉帳 QR" width="390" height="844"><img class="b out" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" alt="" width="390" height="844" aria-hidden="true"></div>
      <div class="scan" aria-hidden="true"></div>
    </div>
    <aside class="stub" aria-label="教練的帳戶">
      <i class="holes" aria-hidden="true"></i>
      <small>你的帳戶</small>
      <div class="acct">台新 812・林＊亞</div>
      <div class="plus" id="plus" aria-live="polite">+NT$0</div>
    </aside>
  </div>

  <div class="beats" id="beats">
    {beats_html()}
  </div>
</div>

<nav class="dots" aria-label="章節">{"".join(f'<button data-act="{i}" aria-label="{a}"{" class=on" if i==0 else ""}></button>' for i,a in enumerate(ACTS))}</nav>
<div class="actname" id="actname" aria-hidden="true">{ACTS[0]}</div>

<footer><span>PIKYOO 匹友・雙北匹克球</span><span>畫面為示範資料，照片為示意照</span></footer>

<script type="application/json" id="shots">{json.dumps({s: img(s) for s in SHOTS})}</script>
<script>
(function(){{
  var shots = JSON.parse(document.getElementById('shots').textContent);
  
  var beats = [].slice.call(document.querySelectorAll('.beat'));
  var pin = document.getElementById('pin'), phone = document.getElementById('phone');
  var a = phone.querySelector('img.a'), b = phone.querySelector('img.b');
  var bleeds = {{}}; document.querySelectorAll('.bleed').forEach(function(x){{ bleeds[x.dataset.k] = x; }});
  var dots = [].slice.call(document.querySelectorAll('.dots button')), actname = document.getElementById('actname');
  var ACTS = {json.dumps(ACTS)};
  var cur = -1, front = a, back = b, swapping = false;

  function setShot(key){{
    if (front.dataset.key === key) return;
    back.src = shots[key]; back.dataset.key = key; back.alt = front.alt;
    back.classList.remove('out'); front.classList.add('out');
    var t = front; front = back; back = t;
  }}
  function activate(i){{
    if (i === cur) return; cur = i;
    var bt = beats[i], k = bt.dataset.k;
    beats.forEach(function(x, j){{ x.classList.toggle('on', j === i); }});
    setShot(bt.dataset.shot);
    pin.classList.toggle('hero', k === 'hero');
    Object.keys(bleeds).forEach(function(n){{ bleeds[n].classList.toggle('on', n === k); }});
    phone.classList.toggle('away', k.indexOf('bleed') === 0);
    var act = +bt.dataset.act;
    dots.forEach(function(d, j){{ d.classList.toggle('on', j === act); }});
    actname.textContent = ACTS[act];
  }}
  // scroll drives the active beat
  var io = new IntersectionObserver(function(es){{
    es.forEach(function(e){{ if (e.isIntersecting) activate(+e.target.dataset.i); }});
  }}, {{ rootMargin: '-45% 0px -45% 0px', threshold: 0 }});
  beats.forEach(function(x){{ io.observe(x); }});
  activate(0);

  // the hero's money counter runs once the scan line has crossed the QR
  var plus = document.getElementById('plus'), started = false;
  function count(){{
    if (started) return; started = true;
    var t0 = performance.now(), d = 900;
    (function f(now){{ var p = Math.min(1, (now - t0) / d), e = 1 - Math.pow(1 - p, 4);
      plus.textContent = '+NT$' + Math.round(600 * e); if (p < 1) requestAnimationFrame(f); }})(t0);
  }}
  setTimeout(count, matchMedia('(prefers-reduced-motion: reduce)').matches ? 300 : 1700);

  // tap the phone or press ↓ / space: next beat, without hunting for the scroll bar
  function go(n){{ var t = beats[Math.max(0, Math.min(beats.length - 1, n))]; t.scrollIntoView({{ behavior: 'smooth', block: 'start' }}); }}
  phone.addEventListener('click', function(){{ go(cur + 1); }});
  phone.addEventListener('keydown', function(e){{ if (e.key === 'Enter' || e.key === ' ') {{ e.preventDefault(); go(cur + 1); }} }});
  document.addEventListener('keydown', function(e){{
    if (e.target !== document.body && e.target !== phone) return;
    if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {{ e.preventDefault(); go(cur + 1); }}
    if (e.key === 'ArrowUp' || e.key === 'PageUp') {{ e.preventDefault(); go(cur - 1); }}
  }});
  dots.forEach(function(d){{ d.addEventListener('click', function(){{
    var first = beats.findIndex(function(x){{ return x.dataset.act === d.dataset.act; }}); go(first); }}); }});
  var goBtn = document.querySelector('.go'); if (goBtn) goBtn.addEventListener('click', function(e){{ e.preventDefault(); go(5); }});
}})();
</script>
"""
(ROOT / "stage.html").write_text(page, encoding="utf-8")
print(len(page) // 1024, "KB,", len(BEATS), "beats,", len(SHOTS), "shots")
