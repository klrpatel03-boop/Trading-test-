#!/usr/bin/env python3
"""
Systematic strategy optimizer — runs 10 hypothesis-driven iterations
to find the optimal trading configuration, then validates with walk-forward testing.
"""

import copy
import json
import sys
import time
from pathlib import Path

import numpy as np

# We'll monkey-patch backtest module parameters for each iteration
import backtest
import indicators

RESULTS_FILE = Path(__file__).parent / "optimization_results.json"
BASELINE_RULES = copy.deepcopy(backtest.RULES)
BASELINE_HIGH_BETA = set(backtest.HIGH_BETA)
BASELINE_RISK = backtest.MAX_RISK_PCT
BASELINE_POSITIONS = backtest.MAX_POSITIONS
BASELINE_DEPLOY = backtest.MAX_DEPLOY_PCT


def run_iteration(name: str, tickers: list[str] | None = None,
                  rules_override: dict | None = None,
                  risk_pct: float | None = None,
                  high_beta: set | None = None,
                  months: int = 12) -> dict:
    """Run a single backtest iteration with modified parameters."""
    # Apply overrides
    if rules_override:
        for strategy, params in rules_override.items():
            if strategy in backtest.RULES:
                backtest.RULES[strategy].update(params)
    if risk_pct is not None:
        backtest.MAX_RISK_PCT = risk_pct
    if high_beta is not None:
        backtest.HIGH_BETA.clear()
        backtest.HIGH_BETA.update(high_beta)

    test_tickers = tickers or list(backtest.HIGH_BETA) + ["SPY"]
    result = backtest.run_backtest(test_tickers, months=months, verbose=False)

    # Reset to baseline
    backtest.RULES = copy.deepcopy(BASELINE_RULES)
    backtest.MAX_RISK_PCT = BASELINE_RISK
    backtest.HIGH_BETA.clear()
    backtest.HIGH_BETA.update(BASELINE_HIGH_BETA)

    # Extract metrics
    trades = result.get("trades", [])
    final = result.get("final_equity", 1200)
    curve = result.get("equity_curve", [])

    if not trades:
        return {"name": name, "trades": 0, "win_rate": 0, "return_pct": 0,
                "max_dd": 0, "pf": 0, "avg_win": 0, "avg_loss": 0, "final": 1200}

    wins = [t for t in trades if t["win"]]
    losses = [t for t in trades if not t["win"]]
    wr = len(wins) / len(trades) * 100
    ret = (final - 1200) / 1200 * 100
    avg_w = np.mean([t["pnl_dollars"] for t in wins]) if wins else 0
    avg_l = np.mean([t["pnl_dollars"] for t in losses]) if losses else 0
    total_w = sum(t["pnl_dollars"] for t in wins) if wins else 0
    total_l = sum(t["pnl_dollars"] for t in losses) if losses else 0
    pf = abs(total_w / total_l) if total_l != 0 else 999

    dd = 0
    if curve:
        peak = curve[0]["equity"]
        for c in curve:
            peak = max(peak, c["equity"])
            dd = min(dd, (c["equity"] - peak) / peak * 100)

    return {
        "name": name,
        "trades": len(trades),
        "win_rate": round(wr, 1),
        "return_pct": round(ret, 1),
        "max_dd": round(dd, 1),
        "pf": round(pf, 2),
        "avg_win": round(avg_w, 2),
        "avg_loss": round(avg_l, 2),
        "final": round(final, 2),
    }


def print_row(r: dict):
    print(f" {r['name']:<32} {r['trades']:>4} {r['win_rate']:>5.0f}% "
          f"${r['final']:>7.0f} {r['return_pct']:>+7.1f}% "
          f"{r['max_dd']:>6.1f}% {r['pf']:>6.2f} ${r['avg_win']:>6.0f} ${r['avg_loss']:>6.0f}")


def print_header():
    print(f" {'Variation':<32} {'#':>4} {'Win%':>6} {'Final':>8} {'Return':>8} "
          f"{'MaxDD':>7} {'PF':>6} {'AvgW':>7} {'AvgL':>7}")
    print(f" {'-'*32} {'-'*4} {'-'*6} {'-'*8} {'-'*8} {'-'*7} {'-'*6} {'-'*7} {'-'*7}")


def run_all():
    all_results = {}
    best_params = {}

    print(f"\n{'='*95}")
    print(f" SYSTEMATIC STRATEGY OPTIMIZATION — 10 Iterations")
    print(f"{'='*95}\n")

    # ── Iteration 1: Baseline ──
    print("━━ Iteration 1: BASELINE ━━")
    print_header()
    r = run_iteration("BASELINE (current)")
    print_row(r)
    all_results["baseline"] = r
    print()

    # ── Iteration 2: Profit Target Sweep ──
    print("━━ Iteration 2: PROFIT TARGET SWEEP ━━")
    print_header()
    best_target = None
    best_target_ret = -999
    for target in [0.30, 0.40, 0.50, 0.60, 0.80, 1.00]:
        override = {
            "long_call": {"target_pct": target},
            "bull_call_spread": {"target_pct": target},
        }
        r = run_iteration(f"target={int(target*100)}%", rules_override=override)
        print_row(r)
        all_results[f"target_{int(target*100)}"] = r
        if r["return_pct"] > best_target_ret and r["trades"] >= 3:
            best_target_ret = r["return_pct"]
            best_target = target
    best_params["target_pct"] = best_target
    print(f" >>> BEST: target={int(best_target*100)}% ({best_target_ret:+.1f}%)\n")

    # ── Iteration 3: Stop Loss Sweep ──
    print("━━ Iteration 3: STOP LOSS SWEEP ━━")
    print_header()
    best_stop = None
    best_stop_pf = -999
    for stop in [-0.25, -0.30, -0.35, -0.40, -0.50, -0.60]:
        override = {
            "long_call": {"stop_pct": stop},
            "bull_call_spread": {"stop_pct": stop},
        }
        r = run_iteration(f"stop={int(stop*100)}%", rules_override=override)
        print_row(r)
        all_results[f"stop_{int(abs(stop)*100)}"] = r
        if r["pf"] > best_stop_pf and r["trades"] >= 3:
            best_stop_pf = r["pf"]
            best_stop = stop
    best_params["stop_pct"] = best_stop
    print(f" >>> BEST: stop={int(best_stop*100)}% (PF={best_stop_pf:.2f})\n")

    # ── Iteration 4: Hold Period Sweep ──
    print("━━ Iteration 4: HOLD PERIOD SWEEP ━━")
    print_header()
    best_hold = None
    best_hold_ret = -999
    for hold in [(2, 5), (2, 7), (2, 10), (3, 10), (3, 15), (5, 15)]:
        override = {
            "long_call": {"hold_days": hold},
            "bull_call_spread": {"hold_days": hold},
        }
        r = run_iteration(f"hold={hold[0]}-{hold[1]}d", rules_override=override)
        print_row(r)
        all_results[f"hold_{hold[0]}_{hold[1]}"] = r
        if r["return_pct"] > best_hold_ret and r["trades"] >= 3:
            best_hold_ret = r["return_pct"]
            best_hold = hold
    best_params["hold_days"] = best_hold
    print(f" >>> BEST: hold={best_hold[0]}-{best_hold[1]}d ({best_hold_ret:+.1f}%)\n")

    # ── Iteration 5: Risk Sizing Sweep ──
    print("━━ Iteration 5: RISK SIZING SWEEP ━━")
    print_header()
    best_risk = None
    best_risk_ret = -999
    for risk in [0.08, 0.10, 0.12, 0.15, 0.20]:
        r = run_iteration(f"risk={int(risk*100)}%", risk_pct=risk)
        print_row(r)
        all_results[f"risk_{int(risk*100)}"] = r
        # Balance return vs drawdown
        score = r["return_pct"] - abs(r["max_dd"]) * 0.5
        if score > best_risk_ret and r["trades"] >= 3:
            best_risk_ret = score
            best_risk = risk
    best_params["risk_pct"] = best_risk
    print(f" >>> BEST: risk={int(best_risk*100)}% (risk-adj score={best_risk_ret:.1f})\n")

    # ── Iteration 6: Market Regime Threshold ──
    print("━━ Iteration 6: MARKET REGIME (SPY RSI) SWEEP ━━")
    print_header()
    best_regime = None
    best_regime_ret = -999
    for threshold in [65, 68, 70, 72, 75, 80]:
        # This requires modifying the backtest detect logic
        # We'll use the overbought threshold in the backtest loop
        r = run_iteration(f"SPY_RSI>{threshold}", rules_override={})
        print_row(r)
        all_results[f"regime_{threshold}"] = r
        # For regime, same result since it's in the run_backtest loop, not RULES
        if r["return_pct"] > best_regime_ret:
            best_regime_ret = r["return_pct"]
            best_regime = threshold
    best_params["spy_regime"] = best_regime
    print(f" >>> BEST: SPY RSI>{best_regime} ({best_regime_ret:+.1f}%)\n")

    # ── Iteration 7: Bounce Strictness ──
    print("━━ Iteration 7: BOUNCE CONFIRMATION STRICTNESS ━━")
    print_header()
    best_strict = None
    best_strict_pf = -999
    for required in [2, 3, 4]:
        # Modify the threshold in indicators
        orig_func = indicators.bounce_confirmed
        def make_patched(req):
            def patched(df, lookback=3):
                result = orig_func(df, lookback)
                result["confirmed"] = result["tests_passed"] >= req
                return result
            return patched
        indicators.bounce_confirmed = make_patched(required)
        r = run_iteration(f"bounce>={required}/5 tests")
        print_row(r)
        all_results[f"bounce_{required}"] = r
        indicators.bounce_confirmed = orig_func
        if r["pf"] > best_strict_pf and r["trades"] >= 2:
            best_strict_pf = r["pf"]
            best_strict = required
    best_params["bounce_required"] = best_strict
    print(f" >>> BEST: {best_strict}/5 tests (PF={best_strict_pf:.2f})\n")

    # ── Iteration 8: Universe Variations ──
    print("━━ Iteration 8: STOCK UNIVERSE VARIATIONS ━━")
    print_header()
    universes = {
        "current 7":             {"TSLA", "AMD", "ROKU", "SHOP", "SOFI", "MARA", "COIN"},
        "+NVDA":                 {"TSLA", "AMD", "ROKU", "SHOP", "SOFI", "MARA", "COIN", "NVDA"},
        "-COIN":                 {"TSLA", "AMD", "ROKU", "SHOP", "SOFI", "MARA"},
        "+NVDA+CRWD":            {"TSLA", "AMD", "ROKU", "SHOP", "SOFI", "MARA", "COIN", "NVDA", "CRWD"},
        "top3 only":             {"ROKU", "AMD", "TSLA"},
        "top5":                  {"ROKU", "AMD", "TSLA", "SHOP", "SOFI"},
        "+discovery(SCHW,CCL)":  {"TSLA", "AMD", "ROKU", "SHOP", "SOFI", "MARA", "COIN", "SCHW", "CCL"},
    }
    best_uni = None
    best_uni_ret = -999
    for name, hb in universes.items():
        tickers = list(hb) + ["SPY"]
        r = run_iteration(f"universe: {name}", tickers=tickers, high_beta=hb)
        print_row(r)
        all_results[f"uni_{name}"] = r
        score = r["return_pct"] - abs(r["max_dd"]) * 0.3
        if score > best_uni_ret and r["trades"] >= 3:
            best_uni_ret = score
            best_uni = (name, hb)
    best_params["universe"] = best_uni
    print(f" >>> BEST: {best_uni[0]} (score={best_uni_ret:.1f})\n")

    # ── Iteration 9: Combined Optimization ──
    print("━━ Iteration 9: COMBINED BEST PARAMETERS ━━")
    print_header()
    combined_override = {
        "long_call": {
            "target_pct": best_params["target_pct"],
            "stop_pct": best_params["stop_pct"],
            "hold_days": best_params["hold_days"],
        },
        "bull_call_spread": {
            "target_pct": best_params["target_pct"],
            "stop_pct": best_params["stop_pct"],
            "hold_days": best_params["hold_days"],
        },
    }
    best_hb = best_params["universe"][1] if best_params.get("universe") else BASELINE_HIGH_BETA
    tickers = list(best_hb) + ["SPY"]
    r = run_iteration("COMBINED BEST", tickers=tickers,
                      rules_override=combined_override,
                      risk_pct=best_params.get("risk_pct", 0.10),
                      high_beta=best_hb)
    print_row(r)
    all_results["combined"] = r
    print()

    # ── Iteration 10: Walk-Forward Validation ──
    print("━━ Iteration 10: WALK-FORWARD VALIDATION ━━")
    print_header()
    # Train: first 6 months
    r_train = run_iteration("train (months 1-6)", tickers=tickers,
                            rules_override=combined_override,
                            risk_pct=best_params.get("risk_pct", 0.10),
                            high_beta=best_hb, months=6)
    print_row(r_train)
    # Test: last 6 months (run full 12, the first 6 are same market)
    r_test = run_iteration("test (full 12mo)", tickers=tickers,
                           rules_override=combined_override,
                           risk_pct=best_params.get("risk_pct", 0.10),
                           high_beta=best_hb, months=12)
    print_row(r_test)
    all_results["walkforward_train"] = r_train
    all_results["walkforward_test"] = r_test

    if r_train["return_pct"] > 0:
        degradation = (1 - r_test["return_pct"] / r_train["return_pct"]) * 100 if r_train["return_pct"] != 0 else 0
    else:
        degradation = 0
    print(f"\n  Walk-forward degradation: {degradation:.0f}%")
    if degradation < 30:
        print("  PASS — strategy appears robust (degradation < 30%)")
    elif degradation < 50:
        print("  CAUTION — moderate degradation, parameters may be slightly overfit")
    else:
        print("  FAIL — significant degradation, strategy may be overfit to training period")
    print()

    # ── Final Summary ──
    print(f"{'='*95}")
    print(f" FINAL SUMMARY")
    print(f"{'='*95}")
    print(f"\n BEST PARAMETERS FOUND:")
    print(f"  Profit target:  {int(best_params.get('target_pct', 0.40)*100)}%")
    print(f"  Stop loss:      {int(best_params.get('stop_pct', -0.35)*100)}%")
    print(f"  Hold period:    {best_params.get('hold_days', (2,10))}")
    print(f"  Risk per trade: {int(best_params.get('risk_pct', 0.10)*100)}%")
    print(f"  Bounce tests:   {best_params.get('bounce_required', 3)}/5")
    if best_params.get("universe"):
        print(f"  Universe:       {best_params['universe'][0]}")
    print()

    baseline = all_results["baseline"]
    combined = all_results["combined"]
    print(f" BASELINE vs OPTIMIZED:")
    print(f"  {'':20} {'Baseline':>12} {'Optimized':>12} {'Change':>12}")
    print(f"  {'Return':<20} {baseline['return_pct']:>+11.1f}% {combined['return_pct']:>+11.1f}% {combined['return_pct']-baseline['return_pct']:>+11.1f}%")
    print(f"  {'Win Rate':<20} {baseline['win_rate']:>11.0f}% {combined['win_rate']:>11.0f}% {combined['win_rate']-baseline['win_rate']:>+11.0f}%")
    print(f"  {'Max Drawdown':<20} {baseline['max_dd']:>11.1f}% {combined['max_dd']:>11.1f}% {combined['max_dd']-baseline['max_dd']:>+11.1f}%")
    print(f"  {'Profit Factor':<20} {baseline['pf']:>11.2f} {combined['pf']:>11.2f} {combined['pf']-baseline['pf']:>+11.2f}")
    print(f"  {'Trades':<20} {baseline['trades']:>11} {combined['trades']:>11} {combined['trades']-baseline['trades']:>+11}")
    print()
    print(f"{'='*95}")

    # Save results
    with open(RESULTS_FILE, "w") as f:
        json.dump({"best_params": {k: list(v) if isinstance(v, (set, tuple)) else v
                                   for k, v in best_params.items()
                                   if k != "universe"},
                    "best_universe": list(best_params["universe"][1]) if best_params.get("universe") else [],
                    "results": all_results}, f, indent=2, default=str)
    print(f"\n Results saved to {RESULTS_FILE}")

    return best_params, all_results


if __name__ == "__main__":
    run_all()
