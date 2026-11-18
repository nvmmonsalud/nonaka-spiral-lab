import type { Metadata } from "next";
import Link from "next/link";
import WorkshopDraft from "@/components/WorkshopDraft";

export const metadata: Metadata = {
  title: "Manual knowledge transfer / 手動の知識移転 — Knowledge Spiral Lab",
  description: "Local-only synthetic knowledge-transfer capture and named human review. No AI or network upload.",
};

export default function WorkshopPage() {
  return (
    <>
      <header className="hero" style={{ padding: "48px 24px 40px" }}>
        <div className="inner">
          <p className="eyebrow">The Knowledge Spiral Lab · Manual workshop</p>
          <h1>Manual knowledge transfer <span lang="ja">/ 手動の知識移転</span></h1>
          <p className="sub">Capture, review and practice using synthetic examples. / 架空の例を使って記録・レビュー・練習を行います。</p>
        </div>
      </header>
      <nav aria-label="Workshop navigation / ワークショップ案内">
        <div className="inner">
          <Link href="/">Home / ホーム</Link>
          <Link href="/simulator">Simulator / シミュレーター</Link>
          <Link href="/workshop" aria-current="page">Manual Workshop / 手動ワークショップ</Link>
          <Link href="/research">Research / 研究</Link>
        </div>
      </nav>
      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "32px 24px 64px" }}>
        <WorkshopDraft />
      </main>
    </>
  );
}
