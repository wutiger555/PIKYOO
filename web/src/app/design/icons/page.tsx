import type { Metadata } from "next";
import { Icon, type IconName } from "@/components/pk/Icon";
import { TabBar } from "@/components/pk/Shell";

export const metadata: Metadata = { title: "圖示" };

const PK: [IconName, string][] = [
  ["ball", "探索／球"], ["court", "球局"], ["paddlePlus", "開團"], ["whistle", "學打球／教練"], ["player", "我的"],
  ["clock", "時間"], ["cal", "日期／場次"], ["calplus", "加入行事曆"], ["pin", "地點"], ["sliders", "篩選"],
  ["share", "分享（發球）"], ["bell", "通知"], ["cash", "收款"], ["compare", "比較"], ["medal", "認證"],
  ["trophy", "賽事成績"], ["sun", "今天"], ["sprout", "新手友善"], ["users", "學生／人數"], ["paddle", "球拍"],
];
const UTIL: IconName[] = ["left", "right", "down", "x", "check", "plus", "minus", "info", "msg", "heart", "star", "nav", "copy", "edit", "link", "image"];

export default function Page() {
  return (
    <main className="ds">
      <div className="eyebrow">匹克球圖示（有意義的地方一律用這組）</div>
      <p className="note">實心小圓點＝球孔，是整組的共同記號。線寬 1.75、圓頭，24px 網格；選中狀態加粗到 2.1。元件：<code>{`<Icon name="ball" size={20} />`}</code></p>
      <div className="igrid">
        {PK.map(([k, l]) => (
          <div key={k} className="cell"><Icon name={k} size={32} /><b>{l}</b><code>{k}</code></div>
        ))}
      </div>

      <div className="eyebrow">通用符號（方向、關閉、確認這類，維持大家熟悉的形狀）</div>
      <div className="igrid util">
        {UTIL.map((k) => (
          <div key={k} className="cell"><Icon name={k} size={24} /><code>{k}</code></div>
        ))}
      </div>

      <div className="eyebrow">實際使用：底部導覽</div>
      <div className="demo-bar"><TabBar active="home" /></div>

      <div className="eyebrow">規則</div>
      <div className="rules">
        <div><b>意義優先</b>會出現在導覽和功能入口的圖示，用匹克球的物件表達；箭頭、叉叉、打勾不改。</div>
        <div><b>一律配字</b>底部導覽與按鈕上的圖示都搭配文字，不讓使用者猜。</div>
        <div><b>尺寸</b>導覽 22–24px、按鈕 18–20px、標籤 14px；14px 以下不用有球孔的圖示。</div>
      </div>
    </main>
  );
}
