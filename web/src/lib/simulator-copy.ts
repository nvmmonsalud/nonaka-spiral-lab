import presets from "../../data/presets.json";
import type { SimulationEvent } from "./simulation";

export type Locale = "en" | "ja";
export type CopyKey = string;

const en = {
  legendHuman: "Green = human", legendAgent: "Orange = agent", legendCorrupted: "Red = corrupted", legendLevel: "Dashed ring = level 3+ knowledge", historyValues: "history values", historyTable: "History data table",
  title: "Knowledge Spiral Lab", intro: "Explore how knowledge moves through the SECI spiral.", illustrative: "These outcomes are illustrative, not measurements of actual business performance or AI behavior.", language: "Language",
  humans: "Humans", agents: "Agents", baRedundancy: "Ba redundancy", baChaos: "Ba creative chaos", baAutonomy: "Ba autonomy", feedbackRate: "Feedback rate", machineTransfer: "Machine transfer", hallucinationRisk: "Hallucination risk",
  seed: "Seed", applySeed: "Apply seed", pause: "Pause", resume: "Resume", reset: "Reset", step: "Step", compare: "Compare", primaryRun: "Primary run", comparisonRun: "Comparison run", comparisonPreset: "Comparison preset", sameSeed: "Both runs use the same seed.",
  score: "Score", cycles: "Cycles", failures: "Failures", repairs: "Repairs", corrupted: "Corrupted", meanLevel: "Mean level", individual: "Individual", group: "Group", organization: "Organization", interOrganization: "Inter-organization",
  socialization: "Socialization", externalization: "Externalization", combination: "Combination", internalization: "Internalization", tacit: "Tacit", explicit: "Explicit",
  history: "History", historyDescription: "Track how the spiral changes over time.", rollingHistory: "History shows a rolling window of up to 600 samples.", exportCsv: "Export CSV", inspector: "Particle inspector", selectParticle: "Select a particle to inspect it.", noParticles: "No particles in this run.", particle: "Particle", human: "Human", agent: "Agent", quadrant: "Quadrant", level: "Level", status: "Status", healthy: "Healthy", lastTransition: "Last transition", noTransition: "No transition yet", eventLog: "Event log", noEvents: "No events yet.",
  copyLink: "Copy link", exportJson: "Export JSON", importJson: "Import JSON", copied: "Link copied.", clipboardFailed: "Could not copy the link.", exported: "Configuration exported.", imported: "Configuration imported.", importFailed: "Could not import the configuration.", invalidSeed: "Enter a valid seed.", home: "Home", research: "Research", preset: "Preset", seconds: "seconds", running: "Running", paused: "Paused",
  historyTick: "Tick", historyWindow: "Rolling history window", exportCsvHint: "CSV includes the retained rolling history.", selectRun: "Select run", population: "Population", clean: "Clean", pending: "Pending", transitionOk: "Converted", transitionStall: "Stalled", transitionRegress: "Regressed", transitionTransfer: "Machine transfer",
  workshopTitle: "Guided workshop", workshopOpen: "Start workshop", workshopExit: "Exit workshop", workshopBack: "Back", workshopNext: "Next", workshopNotes: "Your observations (kept only while this page is open)", workshopPredictTitle: "1. Predict a bottleneck", workshopPredictPrompt: "Choose a starting preset and predict where knowledge might stall. Which condition might explain it?", workshopObserveTitle: "2. Observe and inspect", workshopObservePrompt: "Run the simulation, watch the history, and inspect a particle. What happened compared with your prediction?", workshopCompareTitle: "3. Change one lever and compare", workshopComparePrompt: "Enable comparison and change one lever yourself. With the same seed, what differs between the runs? Record your interpretation.",
} satisfies Record<string, string>;

const ja: Record<keyof typeof en, string> = {
  legendHuman: "緑 = 人間", legendAgent: "オレンジ = エージェント", legendCorrupted: "赤 = 破損した知識", legendLevel: "破線の輪 = レベル3以上の知識", historyValues: "の履歴値", historyTable: "履歴データ表",
  title: "知識スパイラル・ラボ", intro: "SECIスパイラルの中で知識がどのように移動するかを探ります。", illustrative: "このシミュレーションの結果は例示であり、実際の事業成果やAIの振る舞いを測定するものではありません。", language: "言語",
  humans: "人間", agents: "エージェント", baRedundancy: "場の冗長性", baChaos: "場の創造的カオス", baAutonomy: "場の自律性", feedbackRate: "フィードバック率", machineTransfer: "機械間移転", hallucinationRisk: "幻覚のリスク",
  seed: "シード", applySeed: "シードを適用", pause: "一時停止", resume: "再開", reset: "リセット", step: "1ステップ進む", compare: "比較", primaryRun: "主実行", comparisonRun: "比較実行", comparisonPreset: "比較用プリセット", sameSeed: "両方の実行で同じシードを使います。",
  score: "スコア", cycles: "循環数", failures: "失敗数", repairs: "修復数", corrupted: "破損", meanLevel: "平均レベル", individual: "個人", group: "グループ", organization: "組織", interOrganization: "組織間",
  socialization: "共同化", externalization: "表出化", combination: "連結化", internalization: "内面化", tacit: "暗黙知", explicit: "形式知",
  history: "履歴", historyDescription: "スパイラルの時間変化を確認します。", rollingHistory: "履歴には直近の最大600サンプルを表示します。", exportCsv: "CSVを書き出す", inspector: "粒子の詳細", selectParticle: "粒子を選択して詳細を確認します。", noParticles: "この実行には粒子がありません。", particle: "粒子", human: "人間", agent: "エージェント", quadrant: "象限", level: "レベル", status: "状態", healthy: "正常", lastTransition: "最後の遷移", noTransition: "遷移はまだありません", eventLog: "イベント履歴", noEvents: "イベントはまだありません。",
  copyLink: "リンクをコピー", exportJson: "JSONを書き出す", importJson: "JSONを読み込む", copied: "リンクをコピーしました。", clipboardFailed: "リンクをコピーできませんでした。", exported: "設定を書き出しました。", imported: "設定を読み込みました。", importFailed: "設定を読み込めませんでした。", invalidSeed: "有効なシードを入力してください。", home: "ホーム", research: "研究", preset: "プリセット", seconds: "秒", running: "実行中", paused: "停止中",
  historyTick: "ティック", historyWindow: "直近の履歴", exportCsvHint: "CSVには保持された直近の履歴が含まれます。", selectRun: "実行を選択", population: "粒子数", clean: "正常", pending: "待機中", transitionOk: "変換", transitionStall: "停滞", transitionRegress: "後退", transitionTransfer: "機械間移転",
  workshopTitle: "ガイド付きワークショップ", workshopOpen: "ワークショップを始める", workshopExit: "ワークショップを終了", workshopBack: "戻る", workshopNext: "次へ", workshopNotes: "観察メモ（このページを開いている間のみ保持）", workshopPredictTitle: "1. ボトルネックを予測する", workshopPredictPrompt: "開始するプリセットを選び、知識がどこで停滞しそうか予測しましょう。その理由となる条件は何でしょうか。", workshopObserveTitle: "2. 観察して詳しく調べる", workshopObservePrompt: "シミュレーションを実行し、履歴と粒子の詳細を見ましょう。予測と比べて何が起きましたか。", workshopCompareTitle: "3. 一つの条件を変えて比較する", workshopComparePrompt: "比較を有効にして、条件を一つだけ自分で変えましょう。同じシードで実行結果にどんな違いが出ましたか。解釈を記録しましょう。",
};

export function translate(locale: Locale, key: CopyKey): string {
  const dictionary: Record<string, string> = locale === "ja" ? ja : en;
  return dictionary[key] ?? key;
}

const japanesePresets: Record<string, { name: string; tagline: string; description: string }> = {
  notco: { name: "NotCo / Giuseppe", tagline: "加速する人間と機械のスパイラル", description: "AIが配合を提案し、シェフが試食・判断し、そのフィードバックがモデルに戻ります。機械の暗黙知が移転・販売できるものになります。" },
  matsushita: { name: "松下電器 ホームベーカリー", tagline: "表出化の典型例", description: "見習いによる学習から言語化へ。「ひねり伸ばし」が製品仕様になります。主に人間による古典的なSECIスパイラルです。" },
  siloed: { name: "縦割り組織", tagline: "停滞するスパイラル", description: "知識が個人やチームに閉じ込められます。冗長性とカオスが低く、フィードバックもないため、変換が失敗し、連結された知識は共有文脈を失います。" },
  "ai-native": { name: "AIネイティブ組織", tagline: "機械間移転が中心のスパイラル", description: "エージェントが機械の規模で連結化と内面化を行います。共有文脈の層（デジタルな場）が機械間移転を支えます。" },
  "green-milk": { name: "緑のミルク", tagline: "文脈の欠如を示す例", description: "共有文脈のない機械知。Giuseppeがディルを提案し、牛乳が緑色になります。誤った表出化でスパイラルが停滞します。" },
  khanmigo: { name: "Khanmigoの教室", tagline: "設計された内面化", description: "答えを与えず導くチューター。段階的な練習を通して形式知を暗黙の技能に変えます。内面化が主役です。" },
};

export function getPresetCopy(locale: Locale, id: string): { name: string; tagline: string; description: string } {
  const preset = presets.presets.find((item) => item.id === id);
  if (locale === "ja" && japanesePresets[id]) return japanesePresets[id];
  return preset ? { name: preset.name, tagline: preset.tagline, description: preset.description } : { name: id, tagline: "", description: "" };
}

export function getEventCopy(locale: Locale, event: SimulationEvent): string {
  const who = locale === "ja" ? (event.particleKind === "human" ? "人間" : "エージェント") : event.particleKind;
  const messages = locale === "ja" ? {
    hallucination: `レベル${event.level}のエージェントが表出化で幻覚を生成しました。`,
    contextFailure: "共有された意味のない知識の連結で文脈が失われました。",
    transferRefused: "破損した知識の機械間移転が拒否されました。人間による確認が必要です。",
    transfer: "機械の暗黙知が組織の境界を越えました。",
    repair: "人間の判断によるフィードバックが破損した知識を修復しました。",
    levelUp: `${who}の知識がレベル${event.level}に上がりました。`,
  } : {
    hallucination: `An agent at level ${event.level} hallucinated during externalization.`,
    contextFailure: "Context failure: knowledge was combined without shared meaning.",
    transferRefused: "Machine transfer refused: corrupted knowledge needs human review.",
    transfer: "Tacit machine knowledge crossed the organizational boundary.",
    repair: "Human feedback corrected corrupted knowledge.",
    levelUp: `${who} knowledge advanced to level ${event.level}.`,
  };
  return messages[event.code];
}
