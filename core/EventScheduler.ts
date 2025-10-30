import { GameState, Character, LifePhase, RelationshipStatus, ScheduledEvent } from './types';
import { getAllEvents } from './gameData';
import { DAYS_IN_YEAR } from './constants';
import { EventIdByKey } from './generated/eventIds';

/**
 * Metadata about the annual event plan to ensure consistency and aid in replanning.
 */
export type SchedulerMeta = {
  year: number;
  familySizeStaticAtPlan: number;
  yearRegularQuotaMax: number;
  yearRegularUsed: number;
  couplesPlannedThisYear: string[]; // Serialized Set<string> of couple keys
};

type SchedulerOpts = {
  debug?: boolean;
};

/**
 * Manages the scheduling, planning, and retrieval of game events on a yearly basis.
 * This class replaces the old daily check + cooldown mechanism.
 */
export class EventScheduler {
  private yearPlan: Map<number, ScheduledEvent[]>;
  private meta: SchedulerMeta;

  // --- Debug logger ---
  private DEBUG = false; // ALWAYS ON FOR DEBUGGING
  private L = '[EventScheduler]';
  private log(topic: string, msg: string, details?: unknown) {
    if (!this.DEBUG) return;
    if (details !== undefined) {
      try {
        const safe = typeof details === 'object' ? JSON.parse(JSON.stringify(details)) : details;
        // eslint-disable-next-line no-console
        console.log(`${this.L} ${topic} | ${msg}`, safe);
      } catch {
        // eslint-disable-next-line no-console
        console.log(`${this.L} ${topic} | ${msg}`, details);
      }
    } else {
      // eslint-disable-next-line no-console
      console.log(`${this.L} ${topic} | ${msg}`);
    }
  }
  private c(ch?: Character) { return ch ? `${ch.id}(${ch.name ?? ch.id})` : 'n/a'; }
  private seStr(se: ScheduledEvent) { return `[#${se.eventId} @D${se.dayOfYear} ${se.priority} char=${se.characterId}]`; }

  // Configuration constants from the spec
  private MIN_SPACING_DAYS = 20;
  private REGULAR_QUOTA_SMALL_FAMILY = 4;
  private REGULAR_QUOTA_LARGE_FAMILY = 3;
  private LARGE_FAMILY_THRESHOLD = 4;
  private CHILDREN_CHANCE_PER_COUPLE = 0.5;
  private JAN1_FIXED_MILESTONES = ['event_school_choice', 'event_club_join'];
  private CHILDREN_BUCKETS = [70, 200, 300]; // Approx. Mar, Jul, Nov
  private REGULAR_BUCKETS = [120, 220, 320]; // Approx. May, Aug, Nov

  constructor(
    savedScheduler?: { yearPlan: Record<string, ScheduledEvent[]>, meta: SchedulerMeta },
    opts?: SchedulerOpts
  ) {
    this.DEBUG = false; // ALWAYS ON FOR DEBUGGING

    if (savedScheduler && savedScheduler.yearPlan) {
      this.yearPlan = new Map(
        Object.entries(savedScheduler.yearPlan).map(([day, events]) => [parseInt(day, 10), events])
      );
      this.meta = savedScheduler.meta;
      // this.log('ctor', `Loaded existing plan for year=${this.meta.year}, entries=${this.yearPlan.size}`);
    } else {
      this.yearPlan = new Map();
      this.meta = {
        year: 0,
        familySizeStaticAtPlan: 0,
        yearRegularQuotaMax: 0,
        yearRegularUsed: 0,
        couplesPlannedThisYear: [],
      };
      // this.log('ctor', 'Initialized empty scheduler');
    }
  }

  /** Serialize for savegame */
  serialize(): { yearPlan: Record<string, ScheduledEvent[]>, meta: SchedulerMeta } {
    const serializedPlan = Object.fromEntries(this.yearPlan.entries());
    // this.log('serialize', `year=${this.meta.year} days=${Object.keys(serializedPlan).length} used=${this.meta.yearRegularUsed}/${this.meta.yearRegularQuotaMax}`);
    return { yearPlan: serializedPlan, meta: this.meta };
  }

  /** Build plan for the year */
  buildYearPlan(state: GameState): void {
    const year = state.currentDate.year;
    this.yearPlan.clear();
    this.meta = {
      year,
      familySizeStaticAtPlan: state.familySizeStatic,
      yearRegularQuotaMax:
        state.familySizeStatic <= this.LARGE_FAMILY_THRESHOLD
          ? this.REGULAR_QUOTA_SMALL_FAMILY
          : this.REGULAR_QUOTA_LARGE_FAMILY,
      yearRegularUsed: 0,
      couplesPlannedThisYear: [],
    };
    // this.log('buildYearPlan:start', `Y${year} familySizeStatic=${state.familySizeStatic} quotaMax=${this.meta.yearRegularQuotaMax}`);

    const allEvents = getAllEvents();
    const living = Object.values(state.familyMembers).filter(c => c.isAlive);
    // this.log('buildYearPlan:living', `count=${living.length}`);

    // Jan 1st fixed milestones
    const fixedMilestoneDefs = allEvents.filter(e => this.JAN1_FIXED_MILESTONES.includes(e.id));
    const jan1: ScheduledEvent[] = [];
    for (const ch of living) {
      for (const ev of fixedMilestoneDefs) {
        try {
          if (ev.condition && ev.condition(state, ch)) {
            jan1.push({ dayOfYear: 1, characterId: ch.id, eventId: ev.id, priority: 'fixed-jan1' });
          }
        } catch (e) {
          // this.log('buildYearPlan:condError', `event=${ev.id} char=${this.c(ch)}`, e);
        }
      }
    }
    if (jan1.length) {
      this.yearPlan.set(1, jan1);
      // this.log('buildYearPlan:jan1', `scheduled=${jan1.length}`);
    } else {
      // this.log('buildYearPlan:jan1', 'scheduled=0');
    }

    // Other milestones (non-fixed), start at day 5
    const otherMilestones = allEvents.filter(
      e => e.isMilestone && !this.JAN1_FIXED_MILESTONES.includes(e.id) && e.id !== EventIdByKey.decision_children
    );
    let msPlaced = 0;
    for (const ch of living) {
      for (const ev of otherMilestones) {
        try {
          if (!ch.completedOneTimeEvents.includes(ev.id) && ev.condition && ev.condition(state, ch)) {
            const ok = this.placeWithSpacing(
              { dayOfYear: 5, characterId: ch.id, eventId: ev.id, priority: 'milestone' },
              5
            );
            if (ok) { msPlaced++; /* this.log('milestone:placed', `ev=${ev.id} char=${this.c(ch)} base=5`); */ }
            else { /* this.log('milestone:place_fail', `ev=${ev.id} char=${this.c(ch)}`); */ }
          }
        } catch (e) {
          // this.log('milestone:condError', `event=${ev.id} char=${this.c(ch)}`, e);
        }
      }
    }
    // this.log('buildYearPlan:milestones', `nonFixedPlaced=${msPlaced}`);

    // Children & Regular
    this.scheduleChildrenEvents(state, 1);
    this.scheduleRegularEvents(state, 1);

    const regularCount = Array.from(this.yearPlan.values()).flat().filter(e => e.priority === 'regular').length;
    const childrenCount = this.meta.couplesPlannedThisYear.length;
    // this.log('buildYearPlan:done', `planDays=${this.yearPlan.size} regularPlanned=${regularCount} couplesPlanned=${childrenCount} quotaMax=${this.meta.yearRegularQuotaMax}`);
  }

  /** Replan from tomorrow (family size tăng do sinh/nhận thêm) */
  replanFromTomorrow(state: GameState): void {
    const today = state.currentDate.day;
    // this.log('replan:start', `today=D${today} oldQuota=${this.meta.yearRegularUsed}/${this.meta.yearRegularQuotaMax}`);

    // Keep only milestones in the future; remove children/regular from future
    let kept = 0, removed = 0;
    for (const [day, events] of this.yearPlan.entries()) {
      if (day > today) {
        const keep = events.filter(e => e.priority === 'milestone' || e.priority === 'fixed-jan1');
        kept += keep.length;
        removed += (events.length - keep.length);
        if (keep.length) this.yearPlan.set(day, keep);
        else this.yearPlan.delete(day);
      }
    }
    // this.log('replan:trimFuture', `kept=${kept} removed=${removed}`);

    // Update quota
    this.meta.familySizeStaticAtPlan = state.familySizeStatic;
    this.meta.yearRegularQuotaMax =
      state.familySizeStatic <= this.LARGE_FAMILY_THRESHOLD
        ? this.REGULAR_QUOTA_SMALL_FAMILY
        : this.REGULAR_QUOTA_LARGE_FAMILY;
    // this.log('replan:quota', `newQuotaMax=${this.meta.yearRegularQuotaMax} used=${this.meta.yearRegularUsed}`);

    // Reschedule for rest of year
    this.scheduleChildrenEvents(state, today + 1);
    this.scheduleRegularEvents(state, today + 1);
    // this.log('replan:done', `planDays=${this.yearPlan.size}`);
  }

  /** Pop events for today */
  popToday(state: GameState): ScheduledEvent[] {
    const today = state.currentDate.day;
    const todays = this.yearPlan.get(today) || [];
    // this.log('popToday', `D${today} has=${todays.length} busy=${this.isBusy(state)}`);

    if (todays.length === 0) return [];

    // Ngày 1/1: trả tất cả fixed-jan1 và XÓA chúng khỏi plan
    if (today === 1) {
      const fixed = todays.filter(e => e.priority === 'fixed-jan1' && this.isEventStillValid(e, state));
      const rest = todays.filter(e => e.priority !== 'fixed-jan1');
      this.yearPlan.set(1, rest);
      // this.log('popToday:jan1', `return=${fixed.length} keep=${rest.length}`);
      return fixed;
    }

    // Đang bận: defer tất cả non-fixed
    if (this.isBusy(state)) {
      let deferred = 0;
      for (const ev of todays) {
        if (ev.priority !== 'fixed-jan1') {
          const ok = this.deferWithinYear(ev, today + 1);
          if (ok) deferred++;
        }
      }
      this.yearPlan.delete(today);
      // this.log('popToday:busy', `deferred=${deferred}`);
      return [];
    }

    // Rảnh: trả đúng 1 theo ưu tiên, phần còn lại defer
    const sorted = [...todays].sort((a, b) => this.priorityRank(a) - this.priorityRank(b));
    for (let i = 0; i < sorted.length; i++) {
      const ev = sorted[i];
      if (!this.isEventStillValid(ev, state)) {
        // this.log('popToday:invalid_skip', this.seStr(ev));
        continue;
      }

      // defer phần còn lại
      let deferred = 0;
      const remainder = [...sorted.slice(0, i), ...sorted.slice(i + 1)];
      for (const r of remainder) if (this.deferWithinYear(r, today + 1)) deferred++;
      this.yearPlan.delete(today);
      // this.log('popToday:emit', `${this.seStr(ev)} deferredRest=${deferred}`);
      return [ev];
    }

    this.yearPlan.delete(today);
    // this.log('popToday:none_valid', `D${today}`);
    return [];
  }

  /** Mark executed regular to increase yearly quota used */
  markExecuted(se: ScheduledEvent): void {
    if (se.priority === 'regular') {
      this.meta.yearRegularUsed++;
      // this.log('markExecuted', `regular used=${this.meta.yearRegularUsed}/${this.meta.yearRegularQuotaMax} ${this.seStr(se)}`);
    }
  }

  // ---------- Private helpers ----------

  private scheduleChildrenEvents(state: GameState, startingFromDay: number = 1): void {
    const childrenEv = getAllEvents().find(e => e.id === EventIdByKey.decision_children);
    if (!childrenEv) { /* this.log('children', 'no decision_children found'); */ return; }

    const couples = this.getEligibleCouples(state);
    // this.log('children:eligible', `couples=${couples.length} startFrom=D${startingFromDay}`);

    let placed = 0, rolled = 0;
    for (const [a, b] of couples) {
      const key = [a.id, b.id].sort().join('-');
      if (this.meta.couplesPlannedThisYear.includes(key)) { /* this.log('children:skip_duplicate', key); */ continue; }

      rolled++;
      const roll = Math.random();
      if (roll >= this.CHILDREN_CHANCE_PER_COUPLE) {
        // this.log('children:roll_fail', `key=${key} roll=${roll.toFixed(2)}`);
        continue;
      }

      const actor =
        (childrenEv.condition && childrenEv.condition(state, a)) ? a :
        (childrenEv.condition && childrenEv.condition(state, b)) ? b : null;

      if (!actor) {
        // this.log('children:cond_fail', `key=${key}`);
        continue;
      }

      const buckets = this.CHILDREN_BUCKETS.filter(d => d >= startingFromDay);
      if (!buckets.length) { /* this.log('children:no_bucket', `key=${key}`); */ continue; }

      const base = buckets[Math.floor(Math.random() * buckets.length)];
      const se: ScheduledEvent = { dayOfYear: base, characterId: actor.id, eventId: childrenEv.id, priority: 'children' };
      const ok = this.placeWithSpacing(se, startingFromDay);
      if (ok) {
        placed++;
        this.meta.couplesPlannedThisYear.push(key);
        // this.log('children:placed', `${this.seStr(se)} key=${key}`);
      } else {
        // this.log('children:place_fail', `key=${key}`);
      }
    }
    // this.log('children:summary', `rolled=${rolled} placed=${placed} plannedCouples=${this.meta.couplesPlannedThisYear.length}`);
  }

  private scheduleRegularEvents(state: GameState, startingFromDay: number = 1): void {
    const pool = getAllEvents().filter(e => !e.isMilestone && e.id !== EventIdByKey.decision_children && !e.isTriggerOnly);
    const living = Object.values(state.familyMembers).filter(c => c.isAlive);
    if (!living.length) { /* this.log('regular', 'no living characters'); */ return; }

    const plannedInFuture = Array.from(this.yearPlan.entries())
      .filter(([day]) => day >= startingFromDay)
      .flatMap(([, arr]) => arr)
      .filter(e => e.priority === 'regular').length;

    let remaining = Math.max(0, this.meta.yearRegularQuotaMax - this.meta.yearRegularUsed - plannedInFuture);
    // this.log('regular:start', `remaining=${remaining} (max=${this.meta.yearRegularQuotaMax}, used=${this.meta.yearRegularUsed}, plannedFuture=${plannedInFuture}) startFrom=D${startingFromDay}`);
    if (remaining === 0) return;

    // fairness (soft cap) 2/actor/năm (đang plan)
    const perActorPlanned: Record<string, number> = {};
    for (const [, arr] of this.yearPlan) {
      for (const e of arr) if (e.priority === 'regular') {
        perActorPlanned[e.characterId] = (perActorPlanned[e.characterId] || 0) + 1;
      }
    }

    let attempts = 0;
    const MAX_ATTEMPTS = living.length * 12;
    let placed = 0;

    while (remaining > 0 && attempts < MAX_ATTEMPTS) {
      const ch = living[Math.floor(Math.random() * living.length)];

      // Soft cap fairness
      if ((perActorPlanned[ch.id] || 0) >= 2) { attempts++; continue; }

      const possible = pool.filter(e =>
        (!e.allowedRelationshipStatuses || e.allowedRelationshipStatuses.includes(ch.relationshipStatus as RelationshipStatus)) &&
        e.phases.includes(ch.phase as LifePhase) &&
        !(ch.completedOneTimeEvents?.includes(e.id)) &&
        (!e.condition || e.condition(state, ch))
      );

      if (!possible.length) { attempts++; continue; }

      const ev = possible[Math.floor(Math.random() * possible.length)];
      const buckets = this.REGULAR_BUCKETS.filter(d => d >= startingFromDay);
      if (!buckets.length) { /* this.log('regular:no_bucket', ''); */ break; }

      const base = buckets[Math.floor(Math.random() * buckets.length)];
      const se: ScheduledEvent = { dayOfYear: base, characterId: ch.id, eventId: ev.id, priority: 'regular' };

      const ok = this.placeWithSpacing(se, startingFromDay);
      if (ok) {
        remaining--;
        placed++;
        perActorPlanned[ch.id] = (perActorPlanned[ch.id] || 0) + 1;
        // this.log('regular:placed', this.seStr(se));
      }
      attempts++;
    }
    // this.log('regular:done', `placed=${placed} attempts=${attempts} remaining=${remaining}`);
  }

  private isEventStillValid(s: ScheduledEvent, state: GameState): boolean {
    const ch = state.familyMembers[s.characterId];
    const ev = getAllEvents().find(e => e.id === s.eventId);
    if (!ch) { /* this.log('validate_fail', `noChar ${this.seStr(s)}`); */ return false; }
    if (!ch.isAlive) { /* this.log('validate_fail', `dead ${this.seStr(s)} char=${this.c(ch)}`); */ return false; }
    if (!ev) { /* this.log('validate_fail', `noEventDef ${this.seStr(s)}`); */ return false; }

    if (ev.phases && !ev.phases.includes(ch.phase as LifePhase)) {
      // this.log('validate_fail', `phaseMismatch ${this.seStr(s)} phase=${ch.phase}`);
      return false;
    }
    if (ev.allowedRelationshipStatuses && !ev.allowedRelationshipStatuses.includes(ch.relationshipStatus as RelationshipStatus)) {
      // this.log('validate_fail', `relationMismatch ${this.seStr(s)} rel=${ch.relationshipStatus}`);
      return false;
    }
    if (ev.condition && !ev.condition(state, ch)) {
      // this.log('validate_fail', `conditionFalse ${this.seStr(s)} char=${this.c(ch)}`);
      return false;
    }
    if (ch.completedOneTimeEvents?.includes(ev.id)) {
      // this.log('validate_fail', `oneTimeDone ${this.seStr(s)} char=${this.c(ch)}`);
      return false;
    }
    return true;
  }

  private deferWithinYear(event: ScheduledEvent, startingFromDay: number = event.dayOfYear + 1): boolean {
    const start = Math.min(DAYS_IN_YEAR, Math.max(2, startingFromDay)); // tránh 1/1 cho non-fixed
    const clone: ScheduledEvent = { ...event, dayOfYear: start };
    const ok = this.placeWithSpacing(clone, start);
    // this.log('defer', `${this.seStr(event)} -> ${ok ? `D${clone.dayOfYear}` : 'fail'}`);
    return ok;
  }

  private getEligibleCouples(state: GameState): [Character, Character][] {
    const couples: [Character, Character][] = [];
    const processedIds = new Set<string>();

    for (const charA of Object.values(state.familyMembers)) {
        if (processedIds.has(charA.id)) {
            continue;
        }
        if (!charA.isAlive) {
            continue;
        }
        if (charA.relationshipStatus !== RelationshipStatus.Married) {
            continue;
        }
        if (!charA.partnerId) {
            continue;
        }

        const charB = state.familyMembers[charA.partnerId];
        if (!charB) {
            // this.log('couples:err_partner_not_found', `${this.c(charA)} partnerId=${charA.partnerId}`);
            continue;
        }

        // Symmetrical check
        if (charB.isAlive && charB.relationshipStatus === RelationshipStatus.Married && charB.partnerId === charA.id) {
            couples.push([charA, charB]);
            processedIds.add(charA.id);
            processedIds.add(charB.id);
            // this.log('couples:found_symmetric_pair', `${this.c(charA)} <=> ${this.c(charB)}`);
        } else {
            // this.log('couples:fail_symmetric_check', `${this.c(charA)} partner=${this.c(charB)} partnerAlive=${charB.isAlive} partnerRel=${charB.relationshipStatus} partnerPartnerId=${charB.partnerId}`);
        }
    }
    // this.log('couples:summary', `found=${couples.length}`);
    return couples;
  }

  private placeWithSpacing(event: ScheduledEvent, startingFromDay: number = 1): boolean {
    let day = Math.max(startingFromDay, event.dayOfYear);
    let scanned = 0;

    for (let i = 0; i < DAYS_IN_YEAR; i++) {
      scanned++;

      if (day === 1 && event.priority !== 'fixed-jan1') day = 2;

      // Kiểm tra spacing quanh ngày dự kiến
      let free = true;
      for (let j = -this.MIN_SPACING_DAYS; j <= this.MIN_SPACING_DAYS; j++) {
        const checkDay = day + j;
        if (checkDay > 0 && checkDay <= DAYS_IN_YEAR && this.yearPlan.has(checkDay)) { free = false; break; }
      }
      if (free) {
        const arr = this.yearPlan.get(day) || [];
        const placed: ScheduledEvent = { ...event, dayOfYear: day };
        arr.push(placed);
        this.yearPlan.set(day, arr);
        // this.log('place', `${this.seStr(placed)} scanned=${scanned}`);
        return true;
      }

      day++;
      if (day > DAYS_IN_YEAR) day = Math.max(2, startingFromDay);
    }

    // this.log('place_fail', `${this.seStr(event)} scanned=${scanned}`);
    return false;
  }

  private priorityRank(e: ScheduledEvent): number {
    switch (e.priority) {
      case 'fixed-jan1': return 0;
      case 'milestone': return 1;
      case 'children':  return 2;
      case 'regular':   return 3;
      default:          return 99;
    }
  }

  private isBusy(state: GameState): boolean {
    const busy = !!(
      state.activeEvent ||
      (state.eventQueue && state.eventQueue.length > 0) ||
      (state.pendingSchoolChoice && state.pendingSchoolChoice.length > 0) ||
      (state.pendingUniversityChoice && state.pendingUniversityChoice.length > 0) ||
      state.pendingMajorChoice ||
      state.pendingCareerChoice ||
      state.pendingUnderqualifiedChoice ||
      state.pendingLoanChoice ||
      state.pendingPromotion
    );
    // if (this.DEBUG) this.log('busyCheck', `busy=${busy}`);
    return busy;
  }
}