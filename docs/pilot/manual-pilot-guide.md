# Manual knowledge-transfer rehearsal / 手動の知識移転リハーサル

This is a local, synthetic workshop workflow, not a live AI product or evidence of business improvement. Use `/workshop` to capture and review a non-safety-critical exercise. Use `/simulator` only as an illustrative teaching model.

架空の例を用いるローカル練習です。実際のAIや業務改善効果を示すものではありません。安全に関わらない作業のみを対象とします。

## Scope and roles / 対象と役割

- Facilitator: selects a harmless desk exercise, agrees success/stop criteria in advance, times each phase and supervises the novice.
- Expert: demonstrates the synthetic task and explains conditions, cues, exceptions and uncertainties. Records plain text and source references.
- Named reviewer: compares the draft against the synthetic source set, checks missing steps, contradictions and novice comprehension, then enters an example reviewer name and selects Reviewed.
- Novice: practices with the reviewed instructions and explains the reasoning back to the expert. Never performs live work based on this rehearsal.
- Operational owner: separately decides whether any future real procedure may be used. Reviewer sign-off in this app is not operational approval, identity verification, an audit signature or permission to operate equipment.

レビュー済みは記録内容の確認を手動で申告する状態です。実作業の実施承認や本人確認ではありません。実作業は別途責任者の承認が必要です。

## Synthetic example / 架空の例

Use paper cards at a desk, disconnected from production, safety decisions and customer records. Nothing here is a real procedure.

| Field | Example |
| --- | --- |
| Task / 作業 | Sort six synthetic training cards into circle, triangle and unknown piles. / 練習用カード6枚を丸・三角・不明に分ける。 |
| Conditions / 条件 | Paper mockups only. Each card has one printed symbol. No machinery or actual inventory. |
| Observations / 観察 | Read the printed symbol, not the card color. Set an unclear symbol aside as unknown and ask the facilitator. Do not guess. |
| Sources / 出典 | Synthetic card set v1, cards 1–6; facilitator's invented symbol key v1, rule 1. |
| Reviewer / レビュー担当者 | Example Reviewer (fictional role for rehearsal) |
| Status / レビュー状態 | Draft until the named reviewer has checked this exact text against the key. |

The facilitator creates the invented key and cards before the session, including one deliberately ambiguous symbol. These references identify synthetic materials; they are not fetched or uploaded by the app.

## Run and measure / 進め方と計測

1. Agree the task boundary, equivalent card sets, novice starting experience, expected correct piles, ambiguity escalation, and stop conditions. Pick an observation sheet outside the app using synthetic identifiers only.
2. Baseline: time the expert's usual explanation plus novice sorting on one mock set, including questions, corrections and any existing review/approval effort. Record errors and unassisted reasoning. Do not remove existing baseline steps to improve the comparison.
3. Capture: time the expert's demonstration and manual draft preparation separately. Record conditions, concrete observations, exception/stop instructions and specific synthetic source versions. Flag unknowns instead of inventing answers.
4. Review: time verification, clarification, correction and repeat review. The reviewer checks every step against the mock key, enters an example name and selects Reviewed only when task and reviewer are nonblank. Any edit resets status to Draft; review again.
5. Approval: record a separate facilitator/operational-owner decision and its time outside the draft. In this rehearsal it authorizes supervised paper practice only. Reviewed does not imply this approval.
6. Novice exercise: use a different equivalent card set, supervised, with the reviewed instructions. Ask the novice to explain symbol-versus-color cues and the unknown case. Record practice time, questions, errors, rework, reviewer interventions and whether the novice escalated uncertainty.
7. Compare full effort: baseline total versus capture + all review/correction cycles + separate approval + novice practice/questions/rework. Record elapsed time and each person's time separately; do not add overlapping wall-clock intervals twice. Include preparation of the synthetic set and facilitation overhead consistently in both totals. Report differences as observations from this rehearsal, not causal or ROI claims. A second attempt may benefit from familiarity; record order and participant experience.

Suggested blank log (no fabricated measurements): baseline ___; capture ___; review/correction ___; approval ___; novice practice/rework ___; overhead ___; total ___; person-time ___; errors ___; clarification requests ___; stop/escalation ___; source/draft version ___; review/approval decisions ___. Set local acceptance thresholds before timing. This guide supplies no validated threshold or measured result.

## Local data controls / ローカルデータの操作

- Synthetic or sanitized examples only. No personal data, credentials, customer documents or proprietary procedures. / 架空または機密情報を除去した例のみ使用してください。
- Typing, changing review status and importing affect the current tab only. Reload loses unsaved changes. When a previously explicitly saved copy exists, reload restores that saved snapshot; later unsaved edits are lost.
- Before Save locally, read the warning and check the acknowledgement. Browser localStorage is unencrypted, accessible to other users of the browser and scripts on the same origin, and retained until cleared or removed by browser settings. Save explicitly after each change you intend to keep. There is one saved workshop draft per browser origin, not per account; shared tabs can overwrite it on explicit save. Use one workshop tab at a time.
- Export JSON downloads an unencrypted version-1 file. It does not save to browser storage. Handle and remove downloaded files separately.
- Import JSON selects one local file; the browser reads it locally with no network upload. A valid import replaces current form contents, including reviewer/status; it does not save automatically or authenticate the reviewer. Inspect imported claims yourself before relying on them. Invalid/missing fields, wrong version/status, invalid review claims, malformed JSON and JSON over 100,000 characters are rejected without replacing the current draft or saved copy. Very large files are rejected before reading.
- Clear draft and saved copy resets the current tab, review status and acknowledgement and removes only the workshop localStorage key. It leaves other site data, downloaded files and drafts already open in other tabs intact; another tab can save its draft again. If deletion fails, the UI states that the saved copy remains; remove this site's data in browser settings. No secure-erasure guarantee is made.
- If storage is unavailable or saved data is invalid, the UI reports it. Invalid saved data is left untouched until an explicit clear/save; you may continue unsaved or export a valid draft. JSON serialization and import share the same 100,000-character limit; source fields are text references, not documents fetched by the app.

## Stop criteria and limitations / 中止条件と制約

Stop if anyone introduces customer/personal/secret information, a live machine or safety decision, unapproved real work, contradictory evidence, an unexplained step, novice confusion or reviewer disagreement. Ask the facilitator to resolve the issue; do not mark Reviewed to bypass uncertainty. Missing task or reviewer blocks Reviewed; a completed form alone does not establish correctness.

実データ、安全に関わる判断、実機操作、説明できない手順、出典の矛盾、理解不足が生じたら中止してください。不確実な内容をレビュー済みにして進めないでください。

This app has no authentication, reviewer identity verification, durable audit log, collaboration control, server database, AI calls or customer document ingestion. Local tests verify mechanics; they do not validate learning outcomes, translation quality, production security or business performance. Japanese wording needs native-speaker review before external use. A real pilot, participant permissions and operational approval require separate agreement.
