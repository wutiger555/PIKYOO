#!/usr/bin/env python3
"""PIKYOO coach demo, feature tour: a short hero, then one section per feature. Each section has a phone that plays
its screens like a short video (pause, step, click a step) beside a numbered step list and the details."""
import base64, json, pathlib

ROOT = pathlib.Path(__file__).parent
def img(name): return "data:image/png;base64," + base64.b64encode((ROOT / "img" / f"{name}.png").read_bytes()).decode()
qr = json.loads((ROOT / "qr.json").read_text())

SECTIONS = [
  dict(id="find", tab="找到你", title="學生怎麼找到你",
       lead="每位教練用同一種格式呈現，學生比較完直接點進你的頁面。這一頁就是你的個人網站。",
       steps=[
         ("01-home", "首頁先問想上什麼課", "學生選體驗課、一對一、小班或團體，首頁列出符合他程度的教練和近期可約的時段。"),
         ("02-coaches", "找教練：一張卡看完", "認證、DUPR、授課程度、區域、起價、最近可約，同一個格式，一眼比較。"),
         ("03-coach-page", "你的教練頁", "封面、一句話定位、認證、年資、學生數、授課程度。"),
         ("04-coach-plans", "課程與價目", "一對一、小班、體驗課、套票各自標價，付款方式和取消規則寫清楚。"),
         ("05-coach-slots", "可約時段、經歷、評價", "你開放的時段直接顯示剩幾位。證照經 PIKYOO 查驗會標「已查驗」。"),
       ],
       details=["專屬連結可以放在 IG、Threads 簡介，點進來就是你的頁面",
                "學生依程度、區域、課程類型篩選；新手友善的教練會特別標出來",
                "學生最多可以並排比較 3 位教練",
                "提問公開在你的頁面，回答一次大家都看得到，不用互加私人 LINE"]),
  dict(id="book", tab="預約", title="學生自己約，你按一下確認",
       lead="時段只列你開放的；學生送出的是申請，你確認才成立。不用再一個一個對時間。",
       steps=[
         ("06-book-1", "選課程、選時段", "只能選你開放的時段，剩幾位即時更新。你擋掉的時間學生看不到。"),
         ("07-book-2", "人數、備註、付款方式", "學生寫下程度和想練的。付款方式由你決定開哪些，這一步不會扣款。"),
         ("08-booking-pending", "送出申請", "學生看得到進度：送出申請、教練確認、付款、上課。"),
         ("22-inbox", "你的待處理", "申請附上學生程度、是不是第一次上你的課、備註。確認或婉拒，各一鍵。"),
         ("20-coach-calendar", "確認後排進行事曆", "課自動出現在那一天，付款資訊自動傳給學生。"),
       ],
       details=["48 小時沒處理自動取消，學生不會一直空等",
                "小班課可以揪朋友，人數到齊才送給你確認",
                "改期、取消照你訂的規則",
                "每一步雙方都收到通知，正式版同時推到 LINE"]),
  dict(id="pay", tab="收款", title="收款：掃 QR，錢直接進你的帳戶",
       lead="PIKYOO 用你的銀行帳號產生台灣Pay 共通轉帳 QR。學生掃一下就轉，錢不經過平台，現在不抽成。",
       steps=[
         ("09-pay-qr", "學生的付款頁", "你確認後，學生拿到轉帳 QR。存到相簿、用銀行 App 掃，帳號和金額自動帶入。"),
         ("10-report", "轉好了，回報給你", "填轉出帳號末五碼，按「我已轉帳」。也能一鍵加入行事曆、導航到球場。"),
         ("11-reported", "等你對帳", "學生看到「等待教練對帳」，你那邊同時收到通知。"),
         ("30-payments", "你的收款頁", "本月已收、待收。已回報的對過末五碼按確認收到；沒付的一鍵 LINE 提醒。"),
         ("13-notifications", "雙方都收到通知", "教練確認、提醒付款、明天有課，都會通知學生。"),
         ("32-bank", "你的收款帳戶", "從清單選銀行、填帳號，學生看到的 QR 就是從這裡產生的。"),
       ],
       details=["也支援 LINE Pay 收款連結和現場付現，開哪些由你決定",
                "上課前一晚 20:00，系統自動提醒還沒付款的學生（可以關掉）",
                "收到錢要你按一下「確認收到」：銀行不開放自動對帳，這是不收費換來的一步"],
       qr=True),
  dict(id="calendar", tab="行事曆", title="你的行事曆",
       lead="打開就知道今天幾堂、下一堂是什麼、還有多少錢沒收。所有要回的事集中在「待處理」。",
       steps=[
         ("20-coach-calendar", "今天", "下一堂課、本週課數、待收款。待確認的預約用虛線排在行事曆上，確認前就知道會不會撞課。"),
         ("21-week", "週檢視", "一週的課一眼看完，一對一、小班、體驗課用顏色分。"),
         ("27-calendar-tools", "常用工具", "擋掉時間、一次加入手機行事曆、提醒設定。"),
         ("28-block", "擋掉時間", "請假、比賽、出國。擋掉後學生預約頁就看不到；跟已有的課衝突會提醒你。"),
         ("29-remind", "提醒設定", "上課前多久提醒、每晚明天課表、每週一訂場提醒。提醒會帶上你的課前備註。"),
       ],
       details=["一鍵把未來兩週的課加進 iPhone 行事曆，每堂課前 1 小時提醒",
                "單堂課也能加入，地點、學生、備註都已填好",
                "可以傳一則測試提醒給自己看看"]),
  dict(id="lesson", tab="上課", title="上課那一刻，一頁搞定",
       lead="名單、付款、點名、筆記、臨時狀況都在同一頁，球場邊單手就能操作。",
       steps=[
         ("23-lesson", "課程工作台", "時間地點、加入行事曆、導航，和只有你看得到的課前備註。"),
         ("24-lesson-roster", "名單、付款、點名", "每位學生的付款狀態、上次筆記、到／遲到／未到。下雨改室內、取消這堂課，按了通知所有人。"),
         ("31-collect-qr", "現場收款 QR", "還沒付的學生，你的手機出示他金額的 QR，他當場掃就付。收到按「已收到」。"),
       ],
       details=["課後筆記寫在名單上，自動存到學生紀錄",
                "點名「到」或「遲到」自動扣一堂套票",
                "已上完的課會標「待點名」，不會漏"]),
  dict(id="students", tab="學生", title="每個學生一本紀錄",
       lead="套票剩幾堂、上次練了什麼、下次要加強什麼，都記在學生身上。",
       steps=[
         ("25-students", "學生名冊", "依下一堂課排序。套票剩幾堂標在名字旁，剩 2 堂以下變色提醒續約。"),
         ("26-student", "學生紀錄", "套票進度、歷次課後筆記、接下來的課。筆記只有你看得到。"),
       ],
       details=["下次上這位學生的課，上次的筆記自動出現在名單上",
                "學生確認預約後自動加入名冊，不用手動建檔"]),
  dict(id="profile", tab="你的頁面", title="你的頁面你自己管",
       lead="價格、時段、照片、介紹，改了立刻反映在學生看到的頁面。",
       steps=[
         ("34-coach-profile", "編輯教練頁", "照片、介紹、擅長、授課地點。「頁面完整度」告訴你還缺什麼。"),
         ("33-coach-lessons", "課程方案與時段", "價格、計價方式、時長、人數、可不可以揪朋友，和每週開放的時段。"),
       ],
       details=["證照上傳後由 PIKYOO 查驗，通過會標「已查驗」",
                "手機和電腦都能編輯，電腦版有即時預覽"]),
]

# first frame of every player (and the hero screen) ships as a real src; the rest load from one JSON block
FIRST = {"09-pay-qr"} | {s["steps"][0][0] for s in SECTIONS}
ALL = {st[0] for s in SECTIONS for st in s["steps"]}

def qr_svg():
    n = qr["n"]
    rects = "".join(f'<rect x="{x}" y="{y}" width="1" height="1" style="--i:{i}"/>' for i, (x, y) in enumerate(qr["cells"]))
    return f'<svg class="qr" viewBox="-2 -2 {n+4} {n+4}" role="img" aria-label="示範帳號的轉帳 QR code">{rects}</svg>'

def section_html(s):
    frames = json.dumps([[k, t] for k, t, _ in s["steps"]], ensure_ascii=False)
    first = s["steps"][0]
    n = len(s["steps"])
    bars = "".join("<i></i>" for _ in range(n))
    steps = "".join(f'''<li><button type="button" data-i="{i}"{' aria-current="step"' if i == 0 else ''}><span class="n">{i+1}</span><span class="t"><b>{t}</b><span>{c}</span></span></button></li>'''
                    for i, (k, t, c) in enumerate(s["steps"]))
    details = "".join(f"<li>{d}</li>" for d in s["details"])
    qrblock = f'''<figure class="qrfig">{qr_svg()}<figcaption>這張 QR 是用示範帳號即時產生的真實轉帳碼。<code>TWQRP://812NTTransfer/158/02/V1?D6=0028881001234567&amp;D5=812&amp;D10=901&amp;D1=60000</code></figcaption></figure>''' if s.get("qr") else ""
    return f'''
<section class="feat" id="{s["id"]}" aria-labelledby="h-{s["id"]}" data-frames='{frames}'>
  <div class="player">
    <div class="bars" aria-hidden="true">{bars}</div>
    <div class="phone">
      <div class="notch"></div>
      <div class="scr"><img class="a" src="{img(first[0])}" data-key="{first[0]}" alt="{first[1]}" width="390" height="844"><img class="b out" src="{BLANK}" alt="" width="390" height="844" aria-hidden="true"></div>
    </div>
    <div class="ctl">
      <button type="button" class="prev" aria-label="上一個畫面"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button>
      <button type="button" class="play" aria-label="暫停"><svg class="i-pause" viewBox="0 0 24 24"><path d="M8 5v14M16 5v14"/></svg><svg class="i-play" viewBox="0 0 24 24"><path d="M7 4.5l12 7.5-12 7.5z"/></svg></button>
      <button type="button" class="next" aria-label="下一個畫面"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button>
      <span class="cnt" aria-live="polite"><b>1</b> / {n}</span>
    </div>
  </div>
  <div class="txt">
    <h2 id="h-{s["id"]}">{s["title"]}</h2>
    <p class="lead">{s["lead"]}</p>
    <ol class="steps">{steps}</ol>
    {qrblock}
    <h3>還有這些</h3>
    <ul class="details">{details}</ul>
  </div>
</section>'''

BLANK = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="

page = f"""<title>PIKYOO 匹友</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Noto+Sans+TC:wght@400;700;900&display=swap">
<style>
/* Feature tour on a dark stage: a short hero, a sticky row of feature tabs, then one section per feature with a
   playable phone on the left and the steps and details on the right. Lime only where money moves or a step is live. */
:root {{
  --stage:#0F110F; --carbon:#1A1D1B; --fg:#F2F3EF; --muted:#A3A89F; --line:#2B302B;
  --lime:#D4EE3A; --lime-ink:#121412; --screen:#F2F3EF;
  --disp:"Barlow Condensed","Noto Sans TC",sans-serif; --body:"Noto Sans TC","PingFang TC",system-ui,sans-serif;
  --ease:cubic-bezier(.16,1,.3,1); --dur:3.6s;
  --weave:repeating-linear-gradient(45deg,rgba(255,255,255,.035) 0 2px,transparent 2px 5px),repeating-linear-gradient(-45deg,rgba(0,0,0,.22) 0 2px,transparent 2px 5px);
  color-scheme:dark;
}}
@media (prefers-color-scheme: light) {{ :root:not([data-theme="dark"]) {{ --stage:#0F110F; --carbon:#1A1D1B; --fg:#F2F3EF; --muted:#A3A89F; --line:#2B302B; color-scheme:dark }} }}
:root[data-theme="light"] {{ --stage:#0F110F; --carbon:#1A1D1B; --fg:#F2F3EF; --muted:#A3A89F; --line:#2B302B; color-scheme:dark }}
* {{ box-sizing:border-box }}
html {{ scroll-behavior:smooth; scroll-padding-top:72px }}
body {{ margin:0; background:var(--stage); color:var(--fg); font-family:var(--body); line-height:1.65; padding-inline:16px; padding-block:0; }}
::selection {{ background:var(--lime); color:var(--lime-ink) }}
:focus-visible {{ outline:2px solid var(--lime); outline-offset:3px; border-radius:6px }}
a {{ color:inherit }}
button {{ font:inherit; color:inherit; background:none; border:0; padding:0; cursor:pointer }}
.wrap {{ max-width:1120px; margin:0 auto }}

/* hero */
.hero {{ display:grid; grid-template-columns:1.15fr .85fr; gap:48px; align-items:center; padding-block:28px 72px }}
.brand {{ display:flex; align-items:center; gap:10px; font-family:var(--disp); font-weight:700; font-size:20px; letter-spacing:.04em; text-decoration:none; grid-column:1/-1; margin-bottom:28px }}
.brand svg {{ width:28px; height:28px }}
.hero h1 {{ font-family:var(--disp); font-weight:700; font-size:clamp(40px,4.6vw,66px); line-height:1.04; margin:0 0 20px; word-break:keep-all }}
.hero h1 em {{ font-style:normal; color:var(--lime) }}
.hero p {{ color:var(--muted); font-size:18px; margin:0 0 28px; max-width:44ch }}
.cta {{ display:flex; gap:12px; flex-wrap:wrap }}
.btn {{ display:inline-flex; align-items:center; gap:8px; padding:13px 22px; border-radius:999px; font-weight:700; text-decoration:none; border:1.5px solid var(--line); transition:transform .15s var(--ease), border-color .15s var(--ease) }}
.btn:hover {{ transform:translateY(-1px); border-color:var(--muted) }}
.btn.primary {{ background:var(--lime); color:var(--lime-ink); border-color:var(--lime) }}
.hero-stage {{ position:relative; justify-self:center; width:min(300px,70vw) }}
.scan {{ position:absolute; left:8%; right:8%; height:2px; background:var(--lime); top:40%; opacity:0; z-index:3 }}
.scan::after {{ content:""; position:absolute; left:0; right:0; top:2px; height:28px; background:linear-gradient(rgba(212,238,58,.35), transparent) }}
.hero-stage .scan {{ animation:sweep 1.6s var(--ease) .5s 1 both }}
@keyframes sweep {{ 0%{{top:38%;opacity:0}} 10%{{opacity:1}} 90%{{opacity:1}} 100%{{top:62%;opacity:0}} }}
.stub {{ position:absolute; right:-28%; bottom:12%; width:200px; background:var(--carbon); background-image:var(--weave); padding:16px 18px; box-shadow:0 24px 50px rgba(0,0,0,.55); z-index:4; border-radius:10px;
  opacity:0; transform:translateY(12px); animation:in .7s var(--ease) 1.6s forwards }}
@keyframes in {{ to {{ opacity:1; transform:none }} }}
.stub::before {{ content:""; position:absolute; left:-7px; top:14px; bottom:14px; width:14px; background:radial-gradient(circle at 50% 50%, var(--stage) 0 4px, transparent 4.5px) 0 0/14px 14px repeat-y }}
.stub small {{ display:block; font-size:12px; color:var(--muted) }}
.stub .acct {{ font-family:var(--disp); font-size:19px; font-weight:600; margin:2px 0 8px }}
.stub .plus {{ font-family:var(--disp); font-size:40px; font-weight:700; color:var(--lime); line-height:1; font-variant-numeric:tabular-nums }}

/* phone */
.phone {{ position:relative; width:100%; aspect-ratio:390/844; border-radius:12% / 5.5%; background:#070807; padding:3%; box-shadow:0 30px 70px rgba(0,0,0,.6), inset 0 0 0 1.5px #3A3F3A }}
.phone .scr {{ position:absolute; inset:3%; border-radius:9.5% / 4.4%; overflow:hidden; background:var(--screen) }}
.phone .scr img {{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; object-position:top; display:block; transition:opacity .3s var(--ease), transform .45s var(--ease) }}
.phone .scr img.out {{ opacity:0; transform:translateX(-4%) }}
.phone .notch {{ position:absolute; top:3.4%; left:50%; transform:translateX(-50%); width:28%; height:3.2%; border-radius:999px; background:#070807; z-index:2 }}

/* feature tabs */
.tabs {{ position:sticky; top:env(safe-area-inset-top,0px); z-index:10; margin-inline:-16px; padding:12px 16px; background:color-mix(in srgb, var(--stage) 92%, transparent); backdrop-filter:blur(10px); border-bottom:1px solid var(--line) }}
.tabs ol {{ list-style:none; margin:0 auto; padding:0; max-width:1120px; display:flex; gap:6px; overflow-x:auto; scrollbar-width:none }}
.tabs ol::-webkit-scrollbar {{ display:none }}
.tabs a {{ display:flex; align-items:center; gap:8px; white-space:nowrap; text-decoration:none; padding:8px 14px; border-radius:999px; font-weight:700; font-size:15px; color:var(--muted); transition:background .2s var(--ease), color .2s var(--ease) }}
.tabs a i {{ width:12px; height:12px; border-radius:50%; background:radial-gradient(circle, var(--stage) 0 2.5px, var(--line) 3px) }}
.tabs a:hover {{ color:var(--fg); background:var(--carbon) }}
.tabs a[aria-current] {{ color:var(--lime-ink); background:var(--lime) }}
.tabs a[aria-current] i {{ background:radial-gradient(circle, var(--lime) 0 2.5px, var(--lime-ink) 3px) }}

/* feature sections */
.feat {{ display:grid; grid-template-columns:minmax(240px,320px) 1fr; gap:clamp(32px,6vw,88px); padding-block:88px; border-bottom:1px solid var(--line); align-items:start }}
.player {{ position:sticky; top:88px }}
.bars {{ display:flex; gap:4px; margin-bottom:14px }}
.bars i {{ flex:1; height:3px; border-radius:2px; background:var(--line); overflow:hidden; position:relative }}
.bars i::after {{ content:""; position:absolute; inset:0; background:var(--fg); transform:scaleX(0); transform-origin:left }}
.bars i.done::after {{ transform:none }}
.bars i.on::after {{ background:var(--lime); animation:fill var(--dur) linear forwards }}
.feat.paused .bars i.on::after {{ animation-play-state:paused }}
@keyframes fill {{ to {{ transform:none }} }}
.ctl {{ display:flex; align-items:center; gap:8px; margin-top:16px }}
.ctl button {{ width:44px; height:44px; border-radius:50%; border:1.5px solid var(--line); display:grid; place-items:center; transition:border-color .15s var(--ease), background .15s var(--ease) }}
.ctl button:hover {{ border-color:var(--muted) }}
.ctl svg {{ width:18px; height:18px; fill:none; stroke:var(--fg); stroke-width:2; stroke-linecap:round; stroke-linejoin:round }}
.ctl .play {{ background:var(--fg) }}
.ctl .play svg {{ stroke:var(--stage) }}
.ctl .play .i-play {{ fill:var(--stage); stroke:none; display:none }}
.feat.paused .ctl .play .i-play {{ display:block }}
.feat.paused .ctl .play .i-pause {{ display:none }}
.cnt {{ margin-left:auto; font-family:var(--disp); font-size:20px; color:var(--muted); font-variant-numeric:tabular-nums }}
.cnt b {{ color:var(--fg) }}
.txt {{ min-width:0 }}
.txt h2 {{ font-family:var(--disp); font-weight:700; font-size:clamp(36px,4.2vw,58px); line-height:1.02; margin:0 0 14px; text-wrap:balance }}
.lead {{ color:var(--muted); font-size:18px; margin:0 0 32px; max-width:52ch }}
.steps {{ list-style:none; margin:0 0 36px; padding:0; display:grid; gap:4px }}
.steps button {{ width:100%; display:flex; gap:16px; align-items:flex-start; text-align:left; padding:14px 16px; border-radius:10px; transition:background .2s var(--ease) }}
.steps button:hover {{ background:var(--carbon) }}
.steps button[aria-current] {{ background:var(--carbon); background-image:var(--weave) }}
.steps .n {{ flex:none; width:30px; height:30px; border-radius:50%; display:grid; place-items:center; font-family:var(--disp); font-weight:700; font-size:17px; border:1.5px solid var(--line); color:var(--muted); font-variant-numeric:tabular-nums }}
.steps button[aria-current] .n {{ background:var(--lime); border-color:var(--lime); color:var(--lime-ink) }}
.steps .t {{ display:grid; gap:2px }}
.steps b {{ font-size:17px; color:var(--fg) }}
.steps .t span {{ color:var(--muted); font-size:15px; max-width:56ch }}
.txt h3 {{ font-size:15px; font-weight:700; color:var(--muted); margin:0 0 10px }}
.details {{ list-style:none; margin:0; padding:0; display:grid; gap:10px }}
.details li {{ position:relative; padding-left:24px; max-width:60ch }}
.details li::before {{ content:""; position:absolute; left:0; top:.55em; width:12px; height:12px; border-radius:50%; background:radial-gradient(circle, var(--stage) 0 2.5px, var(--muted) 3px) }}
.qrfig {{ margin:0 0 36px; display:flex; gap:20px; align-items:center; padding:18px; border-radius:20px; background:var(--carbon); background-image:var(--weave) }}
.qr {{ width:132px; flex:none; background:var(--fg); border-radius:6px }}
.qr rect {{ fill:var(--lime-ink); opacity:0; transition:opacity .3s var(--ease); transition-delay:calc(var(--i) * 1.2ms) }}
.qrfig.on .qr rect {{ opacity:1 }}
.qrfig figcaption {{ font-size:15px; min-width:0 }}
.qrfig code {{ display:block; margin-top:6px; font-family:var(--disp); font-size:13px; letter-spacing:.04em; color:var(--muted); word-break:break-all }}

/* close */
.join {{ margin-block:88px 40px; background:var(--lime); color:var(--lime-ink); border-radius:20px; padding:clamp(28px,5vw,56px); display:grid; grid-template-columns:1.3fr .7fr; gap:32px; align-items:end }}
.join h2 {{ font-family:var(--disp); font-weight:700; font-size:clamp(40px,5vw,68px); line-height:1; margin:0 0 14px }}
.join p {{ margin:0; font-size:18px; max-width:46ch }}
.join .site {{ background:var(--lime-ink); color:var(--fg); border-radius:10px; padding:18px 20px }}
.join .site span {{ display:block; font-size:13px; color:var(--muted) }}
.join .site b {{ font-family:var(--disp); font-size:26px; font-weight:600 }}
footer {{ display:flex; justify-content:space-between; flex-wrap:wrap; gap:8px; color:var(--muted); font-size:13px; padding-block:0 40px }}

@media (max-width:820px) {{
  .hero {{ grid-template-columns:1fr; gap:28px; padding-block:20px 48px }}
  .hero-stage {{ width:min(220px,58vw); justify-self:start; margin-left:4vw }}
  .stub {{ right:-62%; width:160px; padding:12px 14px }}
  .stub .plus {{ font-size:30px }}
  .stub .acct {{ font-size:15px; white-space:nowrap }}
  .feat {{ grid-template-columns:1fr; padding-block:56px; gap:28px }}
  .player {{ position:static; width:min(220px,60vw); justify-self:center }}
  .join {{ grid-template-columns:1fr }}
}}
@media (prefers-reduced-motion: reduce) {{
  html {{ scroll-behavior:auto }}
  .hero-stage .scan {{ animation:none }}
  .stub {{ animation:none; opacity:1; transform:none }}
  .phone .scr img {{ transition:opacity .2s }}
  .phone .scr img.out {{ transform:none }}
  .qr rect {{ transition-delay:0s }}
}}
</style>

<div class="wrap">
<header class="hero">
  <a class="brand" href="#top" id="top" aria-label="PIKYOO 匹友">
    <svg viewBox="0 0 64 64" aria-hidden="true"><path d="M14 22a16 16 0 0 1 16-16h2a16 16 0 0 1 16 16v4a16 16 0 0 1-16 16h-6v16H14z" fill="#F2F3EF"/><circle cx="31" cy="24" r="7.5" fill="#D4EE3A"/><g fill="#3B4409" opacity=".82"><circle cx="31" cy="24" r="1.05"/><circle cx="31" cy="20.1" r=".92"/><circle cx="34.4" cy="22" r=".92"/><circle cx="34.4" cy="26" r=".92"/><circle cx="31" cy="27.9" r=".92"/><circle cx="27.6" cy="26" r=".92"/><circle cx="27.6" cy="22" r=".92"/></g></svg>
    PIKYOO 匹友
  </a>
  <div>
    <h1>學生自己來預約，<br>錢直接進你帳戶，<br><em>你只管教球。</em></h1>
    <p>PIKYOO 是雙北匹克球教練的接案工具：一個頁面讓學生找到你、自己選時段、掃 QR 轉帳；一支手機管行事曆、點名、收款和學生紀錄。</p>
    <div class="cta"><a class="btn primary" href="#pay">看收款怎麼運作</a><a class="btn" href="#find">從頭看每個功能</a></div>
  </div>
  <div class="hero-stage">
    <div class="phone"><div class="notch"></div><div class="scr"><img class="a" src="{img('09-pay-qr')}" alt="學生的付款頁：轉帳 QR" width="390" height="844"></div><div class="scan" aria-hidden="true"></div></div>
    <aside class="stub" aria-label="教練的帳戶"><small>你的帳戶</small><div class="acct">台新 812・林＊亞</div><div class="plus" id="plus">+NT$600</div></aside>
  </div>
</header>
</div>

<nav class="tabs" aria-label="功能"><ol>{"".join(f'<li><a href="#{s["id"]}"><i></i>{s["tab"]}</a></li>' for s in SECTIONS)}</ol></nav>

<main class="wrap">
{"".join(section_html(s) for s in SECTIONS)}
<section class="join" id="join" aria-labelledby="h-join">
  <div><h2 id="h-join">成為第一批教練</h2><p>我們正在找雙北第一批進駐的匹克球教練。現在免費、不抽成；前期由我們協助建頁、拍照、搬學生，你只要照常上課。</p></div>
  <div class="site"><span>網站版現在就能用</span><b>pikyoo.vercel.app</b></div>
</section>
<footer><span>PIKYOO 匹友・雙北匹克球</span><span>畫面為示範資料，照片為示意照</span></footer>
</main>

<script type="application/json" id="shots">{json.dumps({k: img(k) for k in sorted(ALL - FIRST)})}</script>
<script>
(function(){{
  var shots = JSON.parse(document.getElementById('shots').textContent);
  document.querySelectorAll('img[data-key]').forEach(function(im){{ if (!shots[im.dataset.key]) shots[im.dataset.key] = im.src; }});
  var calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // hero: count the money in once the scan line has crossed the QR
  var plus = document.getElementById('plus');
  if (!calm) {{ plus.textContent = '+NT$0'; setTimeout(function(){{ var t0 = performance.now();
    (function f(now){{ var p = Math.min(1, (now - t0) / 900), e = 1 - Math.pow(1 - p, 4); plus.textContent = '+NT$' + Math.round(600 * e); if (p < 1) requestAnimationFrame(f); }})(t0); }}, 1700); }}

  // each feature section is a little player: it runs only while on screen, and stops for good once the viewer takes over
  document.querySelectorAll('.feat').forEach(function(sec){{
    var frames = JSON.parse(sec.dataset.frames), n = frames.length, i = 0;
    var front = sec.querySelector('img.a'), back = sec.querySelector('img.b');
    var bars = [].slice.call(sec.querySelectorAll('.bars i')), steps = [].slice.call(sec.querySelectorAll('.steps button'));
    var cnt = sec.querySelector('.cnt b'), playBtn = sec.querySelector('.play');
    var userPaused = calm, visible = false;
    function sync(){{ var on = visible && !userPaused; sec.classList.toggle('paused', !on); playBtn.setAttribute('aria-label', userPaused ? '播放' : '暫停'); }}
    function show(k){{
      k = (k + n) % n;
      if (k !== i) {{
        back.src = shots[frames[k][0]]; back.alt = frames[k][1]; back.classList.remove('out'); front.classList.add('out');
        var t = front; front = back; back = t; front.removeAttribute('aria-hidden'); back.setAttribute('aria-hidden', 'true');
      }}
      i = k;
      bars.forEach(function(b, j){{ b.classList.remove('on'); b.classList.toggle('done', j < i); }});
      void bars[i].offsetWidth; bars[i].classList.add('on');
      steps.forEach(function(s, j){{ if (j === i) s.setAttribute('aria-current', 'step'); else s.removeAttribute('aria-current'); }});
      cnt.textContent = i + 1;
    }}
    bars.forEach(function(b){{ b.addEventListener('animationend', function(){{ if (b.classList.contains('on')) show(i + 1); }}); }});
    sec.querySelector('.next').addEventListener('click', function(){{ show(i + 1); }});
    sec.querySelector('.prev').addEventListener('click', function(){{ show(i - 1); }});
    playBtn.addEventListener('click', function(){{ userPaused = !userPaused; sync(); }});
    steps.forEach(function(s){{ s.addEventListener('click', function(){{ userPaused = true; show(+s.dataset.i); sync(); }}); }});
    new IntersectionObserver(function(es){{ visible = es[0].isIntersecting; sync(); }}, {{ threshold: .45 }}).observe(sec.querySelector('.player'));
    show(0); sync();
  }});

  // the real QR fills in when the payment section comes into view
  var fig = document.querySelector('.qrfig');
  if (fig) new IntersectionObserver(function(es){{ if (es[0].isIntersecting) fig.classList.add('on'); }}, {{ threshold: .5 }}).observe(fig);

  // the tab row follows the section on screen
  var row = document.querySelector('.tabs ol'), tabs = {{}};
  document.querySelectorAll('.tabs a').forEach(function(a){{ tabs[a.hash.slice(1)] = a; }});
  function mark(id){{
    Object.keys(tabs).forEach(function(k){{ if (k === id) tabs[k].setAttribute('aria-current', 'true'); else tabs[k].removeAttribute('aria-current'); }});
    var a = tabs[id]; if (a) row.scrollLeft = a.offsetLeft - (row.clientWidth - a.offsetWidth) / 2;
  }}
  var spy = new IntersectionObserver(function(es){{ es.forEach(function(e){{ if (e.isIntersecting) mark(e.target.id); }}); }}, {{ rootMargin: '-40% 0px -55% 0px' }});
  document.querySelectorAll('.feat').forEach(function(s){{ spy.observe(s); }});
  new IntersectionObserver(function(es){{ if (es[0].isIntersecting) mark(''); }}, {{ rootMargin: '-40% 0px -55% 0px' }}).observe(document.querySelector('.hero'));
}})();
</script>
"""
(ROOT / "tour.html").write_text(page, encoding="utf-8")
print(len(page) // 1024, "KB,", len(SECTIONS), "sections,", len(ALL), "shots")
