# The ADHD Meal System

A meal system built for an ADHD brain — not a willpower-based diet.

This is **not** a meal plan you have to remember to follow. It's a system designed
around how ADHD actually works: time blindness, decision paralysis, appetite-killing
stimulant meds, and the specific way good intentions collapse into candy, frozen
pizza, and Taco Bell when executive function runs out.

> **The single most important idea:** You will not stick to this with willpower.
> Willpower is the thing ADHD steals first. So this system is built so that the
> *easy* choice and the *good* choice are the same choice. Every place where you
> normally have to decide, remember, or push yourself — the system decides,
> reminds, or removes the barrier for you.

---

## Who this is built for (your profile)

- **Goal:** body composition (fat loss / lean muscle) → high protein, high fiber, controlled calories.
- **Cooking:** capable, even enjoys it on good days — but *consistency* is the real problem, not skill.
- **Meds:** stimulants that crush appetite, especially midday.
- **Failure mode:** when willpower drops → candy, frozen pizza, Taco Bell become primary food.

The system attacks that failure mode directly. See `05-crash-protocol.md` and the
**Junk Food Translator** in `03-meal-menu.md`.

---

## How to actually use this (start here)

1. **Read `00-START-HERE.md`** — it's a 10-minute setup, not a lifestyle change.
2. **Run the tool** to find out what to eat today without deciding:
   ```bash
   python3 meal_planner.py today
   ```
3. **Set up the anchors and alarms** from `02-meal-schedule.md`. This is the part
   that actually beats time-blindness. Do not skip it.
4. **Do one grocery run** using `python3 meal_planner.py groceries`. After that the
   system runs itself.

---

## The files

| File | What it's for |
|------|---------------|
| `00-START-HERE.md` | Your 10-minute setup. Do this first. |
| `01-the-system.md` | The 9 ADHD strategies this is built on, and *why* they work. |
| `02-meal-schedule.md` | Anchor-based daily schedule + medication timing + alarm scripts. |
| `03-meal-menu.md` | The rotating, decision-free menu. High protein / high fiber. Includes the **Junk Food Translator**. |
| `04-grocery-list.md` | The repeatable, store-section-organized shopping checklist. |
| `05-crash-protocol.md` | What to eat on executive-dysfunction days so you never hit Taco Bell. |
| `06-tracking.md` | The *minimum* tracking that actually helps (and what to ignore). |
| `07-prep-system.md` | "Good day" batch prep that makes "bad days" survivable. |
| `meal_planner.py` | Runnable tool: today's plan, grocery list, macro targets, junk swaps. |

---

## The one rule

**Eat the thing on the schedule, even when you're not hungry.**

Your meds turn off the hunger signal. If you wait until you *feel* like eating,
you'll skip meals all day, your body comp goal dies, and the evening rebound sends
you to Taco Bell. So eating becomes an *alarm-driven task*, not a hunger-driven
choice. The system makes that task as small as humanly possible.
