docs/EventScheduler-Refactor-Spec.md

Mục tiêu: Thiết kế & chuẩn hoá Event Manager theo mô hình lên lịch theo năm (Annual Scheduler), thay thế cơ chế “check hằng ngày + cooldown” mà vẫn bảo toàn mọi hành vi của engine cũ, đồng thời áp dụng luật mới (quota theo family size, children 50%/năm, milestone cố định 1/1). Tài liệu này gồm: đặc tả kiến trúc, API, quy tắc, thuật toán, mô hình dữ liệu & migration (field-by-field), checklist QA, telemetry, rollout/fallback.

0) Phạm vi & Nguyên tắc

Không thay đổi UX người chơi. Scheduler hoạt động “ẩn”, chỉ nhằm ổn định pacing & giảm chi phí tick.

Bảo toàn hành vi cũ: birthdays/phase-change, death & mourning, loans & game over, triggers, apply-to-all, stat clamps, skill gate, ads cadence, victory.

Tuân thủ luật mới:

Quota regular events/năm theo family size (tĩnh).

Children: 50%/cặp/năm, tối đa 1, dời trong năm nếu bận.

Milestone 1/1 (school/club) không dời, xử lý hết trong cùng ngày 1/1.

Hai làn sự kiện:

Immediate lane (tiêm ngay, không chờ lịch),

Planned lane (lên lịch & rút theo ngày).

1) Thuật ngữ & Phân loại Event
1.1. Đếm số lượng

familySizeStatic (tĩnh): tổng mọi thành viên trong gia phả (kể cả đã chết). Không giảm khi chết. Tăng khi sinh/nhận thêm. Dùng để tính quota regular/năm.

livingCount (động): số người còn sống. Dùng cho eligibility & spacing.

1.2. Nhóm sự kiện

Immediate lane (không qua lịch):

Birthday (ngày sinh): tăng tuổi, reset eventsThisYear, tính adjective; nếu đổi phase ⇒ tiêm ngay milestone_phase_change vào đầu queue.

Death & Mourning: khi chết (do health decay/low stats/tuổi thọ) ⇒ tiêm ngay event death; mọi người còn sống nhận milestone_mourning.

Loans: âm quỹ cuối tháng ⇒ pendingLoanChoice (UI blocking). Đầu năm thanh toán khoản đến hạn ⇒ trả/gameOverReason='debt'.

Triggers: event sinh ra event khác (có chance, reTarget…), tiêm ngay (không qua lịch).

Planned lane (lên lịch theo năm):

Milestone cố định 1/1: school/club (và các id được chỉ định). Không dời.

Children (decision_children): theo luật mới: 50%/cặp/năm, tối đa 1, dời trong năm nếu bận, re-validate khi rút.

Regular events: theo phase/relationship/condition, quota toàn gia phả/năm + spacing tối thiểu (thay cooldown cũ).

2) Quy tắc (cũ + mới)

Quota Regular Toàn Năm (theo family size tĩnh)

familySizeStatic ≤ 4 ⇒ tối đa 4 regular/năm.

familySizeStatic > 4 ⇒ tối đa 3 regular/năm.

Không tính vào quota: decision_children, school, club, career/underqualified.

Children

Mỗi cặp đủ điều kiện có 50% được 1 event/năm; tối đa 1.

Nếu ngày bận ⇒ dời trong năm hiện tại (không tràn sang năm sau).

Khi rút, re-validate condition (đôi có thể mất điều kiện).

Thành công: tăng totalChildrenBorn (unlock nơi khác, như cũ).

Milestone 1/1 (không dời)

Tất cả actor đủ điều kiện school/club ⇒ push vào ngày 1 (1/1).

Dù bận, rút hết trong ngày 1/1 (UI pop liên tiếp).

Blocking

pendingSchoolChoice, pendingUniversityChoice, pendingMajorChoice, pendingCareerChoice, pendingUnderqualifiedChoice, pendingLoanChoice, activeEvent, eventQueue≠∅ ⇒ coi là bận.

Khi bận: children & regular phải dời; milestone 1/1 vẫn rút.

One-time & duplicate

ONE_TIME_EVENT_IDS + isMilestone (trừ decision_children) ⇒ sau xử lý, thêm vào completedOneTimeEvents.

Event applyEffectToAll: gỡ các bản sao cùng id khỏi queue sau khi áp, tránh lặp.

Re-validate on pop

Trước khi mở modal 1 event đã lên lịch: kiểm tra lại isAlive, phase, relationship, condition, one-time.

Fail:

Children: dời trong năm (nếu còn ý nghĩa) hoặc huỷ.

Regular: thử thay event khác trong bucket; không có ⇒ skip (không trừ quota).

Stat clamps & Skill gate

Clamp: iq ≤ 200, các stat khác ≤ 100, không dưới 0.

Skill chỉ tăng ở PostGraduation/Retired.

Triggers

Giữ nguyên; event “nảy” không tính vào quota và không qua lịch năm.

Animation flag

Event thường khi mở modal, gắn showJourneyAnimation: true.

Ads cadence

Sau mỗi 10 event (nếu chưa remove ads) ⇒ interstitial.

Victory & Debt

Victory: có nhân vật generation ≥ 6.

Debt: không trả nổi khoản đến hạn ⇒ gameOverReason='debt'.

Replan

Sinh/nhận thêm người ⇒ familySizeStatic tăng ⇒ replan phần còn lại của năm (giữ yearRegularUsed, giữ cặp đã plan).

Chết ⇒ không replan (vì familySizeStatic không đổi), chỉ loại actor chết khỏi phần lịch tương lai.

Đầu năm ⇒ build plan mới cho cả năm.

3) Kiến trúc & API
3.1. Kiến trúc

Lớp EventScheduler quản lý:

yearPlan: Map<dayOfYear, ScheduledEvent[]>

meta: { year, familySizeStaticAtPlan }

yearRegularQuotaMax, yearRegularUsed

couplesPlannedThisYear: Set<string>

MIN_SPACING_DAYS (config)

Không đụng logic kinh tế, jobs, assets, business… (giữ nguyên nơi khác).

3.2. Kiểu dữ liệu
type ScheduledEvent = {
  dayOfYear: number;                // 1..365
  characterId: string;              // đại diện sự kiện
  eventId: string;                  // id trong getAllEvents()
  priority: 'fixed-jan1' | 'milestone' | 'children' | 'regular';
};

type SchedulerMeta = {
  year: number;
  familySizeStaticAtPlan: number;
  yearRegularQuotaMax: number;
  yearRegularUsed: number;
  couplesPlannedThisYear: string[]; // serialize Set
};

3.3. API

buildYearPlan(state: GameState): void

replanFromTomorrow(state: GameState): void

popToday(state: GameState): ScheduledEvent[]

markExecuted(se: ScheduledEvent): void // tăng yearRegularUsed nếu là regular

Helpers: isBusy(state), placeWithSpacing(se), deferWithinYear(se), getEligibleCouples(state), priorityRank(se)

4) Thuật toán
4.1. Lập lịch đầu năm (buildYearPlan)

Reset: yearPlan.clear(), couplesPlannedThisYear.clear(), yearRegularUsed=0.

Tính familySizeStatic & yearRegularQuotaMax (≤4 ⇒ 4, >4 ⇒ 3).

Milestone 1/1: push tất cả school/club đủ điều kiện vào day=1 (priority='fixed-jan1').

Milestone khác: nếu condition pass & chưa one-time ⇒ đặt sớm (từ day=5), qua placeWithSpacing.

Children: duyệt cặp đủ điều kiện, 50% được 1 slot/năm:

Chọn bucket tháng (ví dụ Mar/Jul/Nov), placeWithSpacing (priority='children'), ghi dấu cặp.

Regular: pool theo phase/relationship/condition/one-time; rải theo actor đến khi đủ quota toàn năm:

Bố trí qua placeWithSpacing (priority='regular'); quota thực sự tăng khi xử lý (markExecuted), không phải khi plan.

Lưu meta.

4.2. Rút sự kiện mỗi ngày (popToday)

todayList = yearPlan[day] (nếu rỗng ⇒ []).

Nếu day=1:

Trả toàn bộ fixed-jan1 (dù bận), UI pop liên tiếp trong ngày.

Sau khi hết fixed-jan1, có thể rút thêm 1 (milestone khác/children/regular) nếu rảnh (tuỳ config).

Nếu day≠1:

Nếu bận ⇒ dời children & regular (và milestone khác nếu cần) trong năm qua deferWithinYear.

Nếu rảnh ⇒ trả đúng 1 theo ưu tiên: milestone → children → regular. Phần còn lại của today để nguyên (tránh spam).

4.3. Re-validate on pop

Trước khi set activeEvent, kiểm tra:

Actor còn sống, chưa one-time, phase/relationship & condition pass.

Fail: xử lý theo Quy tắc (Children dời/huỷ; Regular thay/skip).

5) Tích hợp game loop

Đầu năm

if (isNewYear) {
  eventScheduler.buildYearPlan(state);
}


Mỗi ngày (sau update daily/monthly/loan/birthday/death/pending)

const todays = eventScheduler.popToday(state);
// push theo thứ tự ưu tiên vào eventQueue; có thể set activeEvent ngay item đầu
for (const se of todays) {
  const ev = findEventById(se.eventId);
  state.eventQueue.push({ characterId: se.characterId, event: ev });
}


Sau khi xử lý 1 event (đóng modal)

if (lastExecutedScheduledEvent?.priority === 'regular') {
  eventScheduler.markExecuted(lastExecutedScheduledEvent);
}

if (familySizeStaticIncreased) { // sinh/nhận thêm
  eventScheduler.replanFromTomorrow(state);
}


Immediate lane (birthday/phase-change/death/mourning/loan/trigger): giữ nguyên như cũ (tiêm thẳng vào queue).

6) Cấu hình (có thể ngoài code)
{
  "EVENT_SCHEDULER_ENABLED": true,
  "MIN_SPACING_DAYS": 20,
  "REGULAR_QUOTA_SMALL_FAMILY": 4,
  "REGULAR_QUOTA_LARGE_FAMILY": 3,
  "JAN1_FIXED_MILESTONES": ["event_school_choice", "event_club_join"],
  "EXCLUDED_FROM_QUOTA": ["decision_children", "event_school_choice", "event_club_join", "event_career_choice"],
  "CHILDREN_BUCKETS": [70, 200, 300],     // ví dụ dayOfYear ước chừng Mar/Jul/Nov
  "REGULAR_BUCKETS":  [120, 220, 320],
  "ALLOW_JITTER_DAYS": 0                  // 0..2 nếu muốn ngẫu nhiên nhẹ khi rút
}

7) Mô hình dữ liệu & Migration (field-by-field)
7.1. Trường mới

gameState.scheduler (object)

yearPlan: { [dayOfYear: string]: ScheduledEvent[] } (serialize Map)

meta: SchedulerMeta

configHash (optional): hash config để replan nếu config đổi

gameState.familySizeStatic: number (tổng thành viên toàn gia phả, không giảm khi chết)

Gợi ý: nếu không muốn nested, có thể đặt phẳng:

schedulerYearPlan, schedulerMeta, schedulerConfigHash, familySizeStatic.

7.2. Trường giữ/ngắt

Giữ: mọi trường hiện tại (familyMembers, eventQueue, pending*, totalChildrenBorn, areAdsRemoved, isIncomeDoubled, …).

Ngắt sử dụng (deprecate, không xoá để tương thích save cũ):

eventCooldownUntil (cooldown toàn cục)

hadChildrenDecisionEventThisYear (per-character)

7.3. Migration (khi load save cũ)

Bump CONTENT_VERSION.

Nếu thiếu familySizeStatic ⇒ set bằng tổng số familyMembers (bao gồm đã chết).

Khởi tạo scheduler rỗng nếu thiếu:

yearPlan = {};

meta = { year: state.currentDate.year, familySizeStaticAtPlan: familySizeStatic, yearRegularQuotaMax: (≤4 ? 4 : 3), yearRegularUsed: 0, couplesPlannedThisYear: [] }.

Xoá tác dụng của các cờ cũ (nếu có):

Bỏ dùng eventCooldownUntil, hadChildrenDecisionEventThisYear (không cần remove key, chỉ không sử dụng).

Nếu bắt đầu ở giữa năm và EVENT_SCHEDULER_ENABLED:

Gọi buildYearPlan(state) rồi xoá mọi entry day < state.currentDate.day khỏi yearPlan (plan phần còn lại).

Feature flag

Nếu EVENT_SCHEDULER_ENABLED = false ⇒ không sử dụng scheduler, engine cũ chạy bình thường (đảm bảo backward compatibility).

8) Telemetry (đo & theo dõi)

Số modal/ngày; % ngày trống.

Quota regular: used / max.

Children: (#cặp đủ điều kiện, #được plan, #thành công).

Số event bị defer (children/regular), số lần replace/skip do re-validate fail.

Thời lượng xử lý milestone 1/1 (số modal, thời gian).

Số triggers bắn ra, tỷ lệ reTarget thành công.

Ads cadence: số event/ads.

Crash/error khi pop/serialize plan.

9) Checklist QA (thực thi)

A. Milestone 1/1

 Nhiều nhân vật đủ điều kiện school/club ⇒ tất cả push vào ngày 1.

 Dù đang bận, UI rút hết trong chính ngày 1/1 (pop liên tiếp).

 Save/Load giữa chuỗi 1/1 ⇒ load lại tiếp tục rút hết trong ngày.

B. Quota Regular

 familySizeStatic = 3 ⇒ ≤4 regular/năm; = 6 ⇒ ≤3.

 Replan giữa năm không làm vượt quota; yearRegularUsed chỉ tăng khi xử lý xong regular.

C. Children 50%

 Với N cặp đủ điều kiện ⇒ ~50% cặp được 1 slot; không cặp nào có >1 lần/năm.

 Ngày bận ⇒ children bị dời trong năm; re-validate khi rút (đổi điều kiện ⇒ huỷ).

 Thành công ⇒ totalChildrenBorn++.

D. Immediate lane

 Birthday ⇒ tăng tuổi đúng ngày, phase-change tiêm ngay vào đầu queue.

 Death ⇒ tiêm death + mọi người nhận mourning; familySizeStatic không đổi.

 Loan pending (âm quỹ) ⇒ pendingLoanChoice (blocking) bật đúng lúc; nợ đến hạn đầu năm ⇒ trả/debt.

E. Blocking

 Khi có bất kỳ pending*/activeEvent/eventQueue⇒ “bận”: children/regular không rút (bị dời); milestone 1/1 vẫn rút.

F. One-time & duplicate

 Event applyEffectToAll ⇒ sau áp xong, queue không còn duplicate cùng id.

 Milestone/one-time không tái xuất.

G. Stat & Skill

 Stat clamp đúng (IQ ≤ 200, others ≤ 100, ≥ 0).

 Skill không tăng ngoài PostGraduation/Retired.

H. Triggers

 triggers hoạt động bình thường (chance, reTarget); không phá quota.

I. Ads cadence

 Mỗi 10 event (tổng) ⇒ ads (nếu chưa remove ads).

J. Save/Load

 Save ở giữa năm ⇒ load lại có plan phần còn lại; Feature flag off ⇒ engine cũ OK.

K. Stress/E2E

 Gia đình 50+ người, tháng nhiều pending ⇒ không treo; tick nhanh.

 Cuối năm dồn defer ⇒ không tràn sang năm sau; nếu bí chỗ, fallback ngày kế tiếp trong năm (log cảnh báo).

10) Rollout & Fallback

Feature flag: EVENT_SCHEDULER_ENABLED (mặc định false trong build thử nghiệm).

A/B nội bộ: on/off để so sánh telemetry, QA.

Fallback ngay lập tức: nếu phát hiện sự cố, tắt flag ⇒ engine cũ hoạt động; dữ liệu mới không phá save cũ.

Parity window: 1–2 vòng release nội bộ để so sánh nhịp modal, children rate, quota.

11) Edge Cases đã bao phủ

Actor được plan nhưng chết trước ngày rút ⇒ skip (children dời/huỷ), không replan.

Defers dồn sát cuối năm ⇒ nếu không còn “ô”, fallback nhét ngày kế tiếp trong năm (log warning).

Multiple planned cùng ngày ≠ 1/1 ⇒ rút 1 theo ưu tiên, phần còn lại giữ (tránh spam).

Trigger reTarget “parents” nhưng cha mẹ đã chết ⇒ bỏ trigger an toàn.

pendingPromotion được coi là pending (blocking).

applyEffectToAll giữa chuỗi 1/1 ⇒ dedup theo id trước khi áp.

Jitter ±N ngày khi rút (nếu bật) không phá spacing/quota.

12) Phụ lục: Pseudo-code lõi
// Đầu năm
if (isNewYear) scheduler.buildYearPlan(state);

// Mỗi ngày (sau immediate lane & pending checks)
const todays = scheduler.popToday(state);
for (const se of todays) {
  const ev = findEventById(se.eventId);
  state.eventQueue.push({ characterId: se.characterId, event: { ...ev, ...(se.priority==='regular' ? { showJourneyAnimation: true } : {}) } });
}

// Sau khi xử lý 1 event
if (executedSe?.priority === 'regular') scheduler.markExecuted(executedSe);
if (familySizeStaticIncreased) scheduler.replanFromTomorrow(state);

// Immediate lane (birthday/phase-change/death/mourning/loan/trigger) — giữ nguyên như cũ

13) Lộ trình thực hiện

Code EventScheduler (state + API + helpers).

Hook vào gameLoop theo mục 5.

Migration loader: tính familySizeStatic, seed plan giữa năm.

Feature flag + config ngoài.

Telemetry events.

Unit tests: spacing, quota, children 50%, fixed 1/1, re-validate & replace/skip.

Integration tests: immediate lane, pending blocking, triggers, ads cadence.

E2E & stress.

Docs (file này), QA checklist (mục 9).

A/B rollout nội bộ + fallback plan.

✅ Kết luận

Tài liệu này đặc tả đầy đủ kiến trúc, quy tắc, API, thuật toán, dữ liệu & migration, cùng checklist QA để team dev triển khai Event Scheduler theo năm mà không bỏ sót khía cạnh nào, đảm bảo parity với hệ cũ và áp dụng luật mới một cách chặt chẽ.