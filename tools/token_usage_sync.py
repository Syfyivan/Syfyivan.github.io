#!/usr/bin/env python3

import argparse
import datetime as dt
import json
import os
import re
import sys
from decimal import Decimal, InvalidOperation
from typing import Any, Dict, Iterable, Optional, Tuple


def _utc_now_iso() -> str:
    return dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def _utc_today() -> dt.date:
    return dt.datetime.now(dt.timezone.utc).date()


def _iter_jsonl_files(root: str) -> Iterable[str]:
    if not root or not os.path.isdir(root):
        return
    for dirpath, _, filenames in os.walk(root):
        for name in filenames:
            if name.endswith(".jsonl"):
                yield os.path.join(dirpath, name)


def _safe_int(v: Any) -> int:
    try:
        if v is None:
            return 0
        if isinstance(v, bool):
            return 0
        return int(v)
    except Exception:
        return 0


def _extract_usage(obj: Dict[str, Any]) -> Tuple[int, int]:
    # Most older Codex session lines use top-level usage: {input_tokens, output_tokens}
    usage = obj.get("usage")
    if isinstance(usage, dict):
        return _safe_int(usage.get("input_tokens")), _safe_int(usage.get("output_tokens"))

    # Some event formats may nest usage under payload
    payload = obj.get("payload")
    if isinstance(payload, dict):
        usage = payload.get("usage")
        if isinstance(usage, dict):
            return _safe_int(usage.get("input_tokens")), _safe_int(usage.get("output_tokens"))

    return 0, 0


def _extract_token_count_total(obj: Dict[str, Any]) -> Optional[Dict[str, int]]:
    """Extract cumulative token counters from a token_count event.

    Newer Codex sessions report tokens via:
    {"type":"event_msg","payload":{"type":"token_count","info":{"total_token_usage":{...}}}}
    """

    if obj.get("type") != "event_msg":
        return None
    payload = obj.get("payload")
    if not isinstance(payload, dict) or payload.get("type") != "token_count":
        return None
    info = payload.get("info")
    if not isinstance(info, dict):
        return None
    total = info.get("total_token_usage")
    if not isinstance(total, dict):
        return None

    input_tokens = _safe_int(total.get("input_tokens"))
    cached_input_tokens = _safe_int(total.get("cached_input_tokens"))
    output_tokens = _safe_int(total.get("output_tokens"))
    reasoning_output_tokens = _safe_int(total.get("reasoning_output_tokens"))
    total_tokens = _safe_int(total.get("total_tokens"))

    # Fallback: some formats may not include total_tokens
    if total_tokens <= 0:
        total_tokens = input_tokens + output_tokens + reasoning_output_tokens

    return {
        "input_tokens": input_tokens,
        "cached_input_tokens": cached_input_tokens,
        "output_tokens": output_tokens,
        "reasoning_output_tokens": reasoning_output_tokens,
        "total_tokens": total_tokens,
    }


_DATE_IN_PATH_RE = re.compile(r"/(20\d{2})/(\d{2})/(\d{2})/")


def _date_from_path(path: str) -> Optional[dt.date]:
    p = (path or "").replace("\\", "/")
    m = _DATE_IN_PATH_RE.search(p)
    if not m:
        return None
    try:
        y, mo, d = int(m.group(1)), int(m.group(2)), int(m.group(3))
        return dt.date(y, mo, d)
    except Exception:
        return None


def _new_bucket() -> Dict[str, int]:
    return {"input_tokens": 0, "output_tokens": 0, "tokens": 0}


def _bucket_add(bucket: Dict[str, int], input_tokens: int, output_tokens: int, tokens: int) -> None:
    bucket["input_tokens"] = bucket.get("input_tokens", 0) + int(input_tokens)
    bucket["output_tokens"] = bucket.get("output_tokens", 0) + int(output_tokens)
    bucket["tokens"] = bucket.get("tokens", 0) + int(tokens)


def _week_start(d: dt.date) -> dt.date:
    # ISO week starts on Monday.
    return d - dt.timedelta(days=d.weekday())


def _sum_daily(daily: Dict[str, Dict[str, int]], start: dt.date, end_inclusive: dt.date) -> Dict[str, int]:
    out = _new_bucket()
    cur = start
    while cur <= end_inclusive:
        b = daily.get(cur.isoformat())
        if b:
            _bucket_add(out, b.get("input_tokens", 0), b.get("output_tokens", 0), b.get("tokens", 0))
        cur += dt.timedelta(days=1)
    return out


_COCO_RE = re.compile(r"\b(coco|trae)\b", re.IGNORECASE)
_CODEX_RE = re.compile(r"\bcodex\b", re.IGNORECASE)


_COCO_ORIGINATORS = {
    # Coco/Trae CLI often runs on the same Codex session infra.
    # In practice, these sessions do not include "coco" in originator.
    "codex_cli_rs",
    "codex-tui",
    "codex_vscode",
}


def _classify_agent(originator: str) -> str:
    o = (originator or "").strip()
    o_lower = o.lower()

    if o and _COCO_RE.search(o):
        return "coco"

    if o_lower in _COCO_ORIGINATORS:
        return "coco"

    if o and _CODEX_RE.search(o):
        return "codex"
    return "unknown"


def _format_int(n: int) -> str:
    return f"{n:,}"


def _build_subtitle(total_in: int, total_out: int, by_agent: Dict[str, Dict[str, int]]) -> str:
    total = total_in + total_out
    codex = by_agent.get("codex", {}).get("total_tokens", by_agent.get("codex", {}).get("tokens", 0))
    coco = by_agent.get("coco", {}).get("total_tokens", by_agent.get("coco", {}).get("tokens", 0))

    parts = [f"已用 Token {_format_int(total)}（输入 {_format_int(total_in)} / 输出 {_format_int(total_out)}）"]
    if codex or coco:
        parts.append(f"Codex {_format_int(codex)} / Coco {_format_int(coco)}")
    return " · ".join(parts)


def _get_decimal_env(name: str) -> Optional[Decimal]:
    raw = os.getenv(name)
    if not raw:
        return None
    try:
        return Decimal(str(raw).strip())
    except (InvalidOperation, ValueError):
        return None


def main() -> int:
    parser = argparse.ArgumentParser(description="Aggregate Codex/Coco token usage from ~/.codex sessions")
    parser.add_argument(
        "--out",
        default=os.path.join("source", "stats", "token-usage.json"),
        help="Output path (default: source/stats/token-usage.json)",
    )
    parser.add_argument(
        "--sessions-dir",
        default=os.path.expanduser("~/.codex/sessions"),
        help="Codex sessions directory",
    )
    parser.add_argument(
        "--archived-sessions-dir",
        default=os.path.expanduser("~/.codex/archived_sessions"),
        help="Codex archived sessions directory",
    )
    args = parser.parse_args()

    roots = [args.sessions_dir, args.archived_sessions_dir]
    files = []
    for r in roots:
        for f in _iter_jsonl_files(r):
            files.append(f)
    files.sort()

    totals = {"input_tokens": 0, "output_tokens": 0, "tokens": 0}
    daily_totals: Dict[str, Dict[str, int]] = {}
    by_agent: Dict[str, Dict[str, int]] = {
        "codex": {
            "input_tokens": 0,
            "cached_input_tokens": 0,
            "output_tokens": 0,
            "reasoning_output_tokens": 0,
            "total_tokens": 0,
        },
        "coco": {
            "input_tokens": 0,
            "cached_input_tokens": 0,
            "output_tokens": 0,
            "reasoning_output_tokens": 0,
            "total_tokens": 0,
        },
        "unknown": {
            "input_tokens": 0,
            "cached_input_tokens": 0,
            "output_tokens": 0,
            "reasoning_output_tokens": 0,
            "total_tokens": 0,
        },
    }

    scanned = 0
    parsed_lines = 0
    parse_errors = 0

    for path in files:
        scanned += 1
        file_day = _date_from_path(path)
        originator = ""
        agent = "unknown"
        last_total: Optional[Dict[str, int]] = None

        try:
            with open(path, "r", encoding="utf-8") as f:
                for raw in f:
                    raw = raw.strip()
                    if not raw:
                        continue

                    try:
                        obj = json.loads(raw)
                        parsed_lines += 1
                    except Exception:
                        parse_errors += 1
                        continue

                    if not isinstance(obj, dict):
                        continue

                    if not originator and obj.get("type") == "session_meta":
                        payload = obj.get("payload")
                        if isinstance(payload, dict):
                            originator = str(payload.get("originator") or "")
                            agent = _classify_agent(originator)

                    total_tc = _extract_token_count_total(obj)
                    if total_tc is not None:
                        if last_total is None:
                            delta = total_tc
                        else:
                            if total_tc.get("total_tokens", 0) < last_total.get("total_tokens", 0):
                                delta = total_tc
                            else:
                                delta = {
                                    k: max(total_tc.get(k, 0) - last_total.get(k, 0), 0)
                                    for k in [
                                        "input_tokens",
                                        "cached_input_tokens",
                                        "output_tokens",
                                        "reasoning_output_tokens",
                                        "total_tokens",
                                    ]
                                }
                        last_total = total_tc

                        totals["input_tokens"] += delta.get("input_tokens", 0)
                        totals["output_tokens"] += delta.get("output_tokens", 0)
                        totals["tokens"] += delta.get("total_tokens", 0)

                        if file_day is not None:
                            key = file_day.isoformat()
                            day_bucket = daily_totals.get(key)
                            if day_bucket is None:
                                day_bucket = _new_bucket()
                                daily_totals[key] = day_bucket
                            _bucket_add(
                                day_bucket,
                                delta.get("input_tokens", 0),
                                delta.get("output_tokens", 0),
                                delta.get("total_tokens", 0),
                            )

                        bucket = by_agent.get(agent) if agent in by_agent else by_agent["unknown"]
                        bucket["input_tokens"] += delta.get("input_tokens", 0)
                        bucket["cached_input_tokens"] += delta.get("cached_input_tokens", 0)
                        bucket["output_tokens"] += delta.get("output_tokens", 0)
                        bucket["reasoning_output_tokens"] += delta.get("reasoning_output_tokens", 0)
                        bucket["total_tokens"] += delta.get("total_tokens", 0)
                        continue

                    in_tok, out_tok = _extract_usage(obj)
                    if in_tok or out_tok:
                        totals["input_tokens"] += in_tok
                        totals["output_tokens"] += out_tok
                        totals["tokens"] += in_tok + out_tok

                        if file_day is not None:
                            key = file_day.isoformat()
                            day_bucket = daily_totals.get(key)
                            if day_bucket is None:
                                day_bucket = _new_bucket()
                                daily_totals[key] = day_bucket
                            _bucket_add(day_bucket, in_tok, out_tok, in_tok + out_tok)

                        bucket = by_agent.get(agent) if agent in by_agent else by_agent["unknown"]
                        bucket["input_tokens"] += in_tok
                        bucket["output_tokens"] += out_tok
                        bucket["total_tokens"] += in_tok + out_tok
        except FileNotFoundError:
            continue
        except Exception:
            parse_errors += 1
            continue

    # Use the most recent day with data as the anchor day.
    # This avoids showing 0 for "day" just because UTC date rolled over.
    anchor_day: dt.date
    if daily_totals:
        try:
            anchor_day = max(dt.date.fromisoformat(k) for k in daily_totals.keys())
        except Exception:
            anchor_day = _utc_today()
    else:
        anchor_day = _utc_today()

    ws = _week_start(anchor_day)
    ms = anchor_day.replace(day=1)

    periods = {
        "day": _sum_daily(daily_totals, anchor_day, anchor_day),
        "week": _sum_daily(daily_totals, ws, anchor_day),
        "month": _sum_daily(daily_totals, ms, anchor_day),
    }

    data = {
        "version": 2,
        "generated_at": _utc_now_iso(),
        "roots": {
            "sessions": "~/.codex/sessions",
            "archived_sessions": "~/.codex/archived_sessions",
        },
        "files": {"scanned": scanned, "parsed_lines": parsed_lines, "errors": parse_errors},
        "total": {
            "input_tokens": totals["input_tokens"],
            "output_tokens": totals["output_tokens"],
            "tokens": totals["tokens"],
        },
        "periods": periods,
        "periods_meta": {
            "tz": "UTC",
            "day": anchor_day.isoformat(),
            "week_start": ws.isoformat(),
            "month_start": ms.isoformat(),
        },
        "by_agent": by_agent,
    }

    # Optional USD estimate if pricing is provided via env.
    # Use per-1M token prices (USD). If not set, omit cost fields.
    in_price = _get_decimal_env("TOKEN_PRICE_INPUT_PER_1M_USD")
    out_price = _get_decimal_env("TOKEN_PRICE_OUTPUT_PER_1M_USD")
    if in_price is not None and out_price is not None:
        in_tokens = Decimal(totals["input_tokens"])
        out_tokens = Decimal(totals["output_tokens"])
        million = Decimal(1_000_000)
        cost = (in_tokens / million) * in_price + (out_tokens / million) * out_price
        data["pricing"] = {
            "currency": "USD",
            "input_per_1m": str(in_price),
            "output_per_1m": str(out_price),
            "note": "Estimated from env TOKEN_PRICE_*_PER_1M_USD",
        }
        data["total"]["cost_usd"] = float(cost.quantize(Decimal("0.0001")))

        for name in ["day", "week", "month"]:
            p = data.get("periods", {}).get(name)
            if isinstance(p, dict):
                in_tokens_p = Decimal(int(p.get("input_tokens", 0)))
                out_tokens_p = Decimal(int(p.get("output_tokens", 0)))
                cost_p = (in_tokens_p / million) * in_price + (out_tokens_p / million) * out_price
                p["cost_usd"] = float(cost_p.quantize(Decimal("0.0001")))

    data["subtitle"] = _build_subtitle(
        totals["input_tokens"],
        totals["output_tokens"],
        by_agent,
    )

    out_path = args.out
    out_dir = os.path.dirname(out_path)
    if out_dir:
        os.makedirs(out_dir, exist_ok=True)

    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2, sort_keys=True)
        f.write("\n")

    return 0


if __name__ == "__main__":
    sys.exit(main())
