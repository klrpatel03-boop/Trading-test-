# 06 — ADHD-Friendly Tracking (the minimum that helps)

Most tracking advice is a trap for ADHD: detailed food logging is tedious, it's easy to
fall behind, and the day you miss an entry is the day you quit the whole app. So this
system tracks **the least possible** while still moving your body-comp goal.

> **Principle:** track *behaviors you can control*, not *outcomes you can't*. And make
> the track so small it survives a bad week.

---

## Tier 0 — The only thing you truly must do

**Hit your protein target.** That's the one number that drives body comp *and* satiety.
If you do nothing else, get your protein in. The menu is built so that just eating the
default meals lands you there — so really, Tier 0 = "eat the scheduled meals."

---

## Tier 1 — The 10-second daily check (recommended)

At your "kitchen closed" alarm, answer 3 yes/no questions. That's the whole log:

```
[ ] Did I eat at 3+ of my anchor meals today?
[ ] Did I hit roughly my protein target?
[ ] Did I drink water through the day?
```

3 checkboxes. No grams, no photos, no app rage. You can do this in your head, on a
sticky note, or the tool can prompt you (`python3 meal_planner.py checkin`).

The win condition is **mostly yes, most days** — not perfection. 5/7 days is a winning
week. This is how consistency compounds without burning out.

---

## Tier 2 — Weekly, not daily (for the body-comp goal)

Pick **one** weekly metric. Daily weigh-ins are noise and feed the all-or-nothing
spiral; weekly is signal.

- **Body weight:** same morning each week (e.g. Sunday), after bathroom, before eating.
  Track the *trend over weeks*, not any single number.
- **Or a photo / waistband check:** if the scale messes with your head, a monthly
  progress photo or "how do my jeans fit" is a perfectly valid metric.

Adjust calories only every 2–3 weeks based on the *trend*:
- Weight not moving down and you want fat loss → trim ~150–200 cal (smaller portion of
  rice/oats, or drop one add-on). Don't slash — small and sustainable.
- Losing too fast / low energy / muscle loss → add a little back.
- (Get target numbers from `python3 meal_planner.py calc`.)

---

## What to deliberately NOT track

- ❌ Every gram of every food, every day. (Burnout machine.)
- ❌ Daily weight. (Noise. Triggers the spiral.)
- ❌ "Clean vs cheat" moralizing. (Fuels all-or-nothing quitting.)
- ❌ Streaks you can "break." (One miss → quit. The system has no streak by design.)

---

## Optional: a "did the system work?" note, not a food diary

If you like data (you might — you built a trading repo), track *the system*, not the
food. Once a week jot:
- Which days hit 3+ anchors?
- Did the crash protocol get used, and did it keep you out of the drive-thru?
- Any meal you're sick of? (→ edit the rotation.)
- Did you run out of any crash-shelf item? (→ buffer it more.)

That turns this into a system you *tune*, which is far more ADHD-sustainable than a diet
you *adhere to*. You're debugging a process, not grading your willpower.
