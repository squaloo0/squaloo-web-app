"""Generate src/data/research_search.ts from a committed export of the Gate E Research Library.

    python3 scripts/gen_research_search.py <engine-repo> [--ref origin/main]
        [--export src/data/research_library_export.json] [--out src/data/research_search.ts]
        [--web-root <dir>]

THE SHAPE (same as gen_ledger.py): the page renders COMMITTED evidence only.
The Library lives in Notion and scripts here hold no Notion credential (none is
registered in the engine repo's scripts/ops/README.md; provisioning one is a
founder-class custody decision), so the Library is read in two steps:

  1. EXPORT. Whoever refreshes runs the status query through the Notion connector
     and saves the result in the export envelope (queried_at, queried_by, box,
     data_source, query, results). The export is reviewed in a PR like any other
     evidence file. Its query is recorded in the file, verbatim.
  2. GENERATE (this script, one command). Derives the snapshot from the export.

WHAT IT DERIVES. A paper row with an arXiv id (YYYY.NNNNN) is a COLLECTED primary:
its PDF is expected on disk. Reviewed = read; any other status = not yet read.
A paper row with no arXiv id is NOT_COLLECTED (named, not counted). Titles come
from the Library's Name column.

THE SECOND INSTRUMENT (rule 19). The set of arXiv ids in the export must equal the
set of PDFs listed in the engine repo's committed research/sources/SHA256SUMS,
read via `git show <ref>:...`. The Library and the disk are kept by different
hands; if they disagree the generator stops and names the difference, instead of
rendering a count that one of them would contradict.

THE GUARD STAYS THE GATE. After writing, the generator runs the existing guard,
`npx tsx scripts/check_research_search.ts` (which calls the build's own
assertResearchSearch). If the guard fails, the previous file is restored and the
exit status is non-zero. The generator does not decide what is acceptable; output
the guard would reject is never left on disk. Date and consistency rules therefore
live in ONE place (src/lib/research_search.ts) and this script does not copy them.
"""
import argparse
import json
import os
import re
import subprocess
import sys

ARXIV = re.compile(r"^\d{4}\.\d{4,5}$")
STATUSES = {"Unclaimed", "In review", "Reviewed", "Deliberating"}
READ_STATUS = "Reviewed"
ENVELOPE_KEYS = ("queried_at", "queried_by", "box", "data_source", "query", "results")
ROW_KEYS = ("id", "kind", "status", "name")


class GenError(Exception):
    pass


def git_show(repo, ref, path):
    try:
        return subprocess.run(
            ["git", "-C", repo, "show", f"{ref}:{path}"], check=True, capture_output=True, text=True
        ).stdout
    except subprocess.CalledProcessError as e:
        raise GenError(f"cannot read {path} at {ref} in {repo}: {e.stderr.strip()}")


def load_export(path):
    with open(path, encoding="utf-8") as fh:
        env = json.load(fh)
    for k in ENVELOPE_KEYS:
        if not env.get(k):
            raise GenError(f"export has no {k}; an export without its provenance is not evidence")
    if not re.match(r"^\d{4}-\d{2}-\d{2}", str(env["queried_at"])):
        raise GenError(f'queried_at "{env["queried_at"]}" does not start with YYYY-MM-DD')
    for i, row in enumerate(env["results"]):
        for k in ROW_KEYS:
            if k not in row or row[k] in (None, ""):
                raise GenError(f"export row {i} has no {k}")
        if row["status"] not in STATUSES:
            raise GenError(f'export row {row["id"]!r} has status {row["status"]!r}, which this generator does not recognise ({sorted(STATUSES)})')
    return env


def sha_ids(repo, ref):
    ids = set()
    for line in git_show(repo, ref, "research/sources/SHA256SUMS").splitlines():
        parts = line.split()
        if len(parts) == 2 and parts[1].endswith(".pdf"):
            ids.add(parts[1][: -len(".pdf")])
    if not ids:
        raise GenError("research/sources/SHA256SUMS lists no PDFs; cannot cross-check the Library")
    return ids


def derive(env, disk_ids):
    papers = [r for r in env["results"] if r["kind"] == "paper"]
    collected = [r for r in papers if ARXIV.match(r["id"])]
    not_collected = [r for r in papers if not ARXIV.match(r["id"])]
    lib_ids = {r["id"] for r in collected}
    if len(lib_ids) != len(collected):
        raise GenError("the export names an arXiv id twice")
    if lib_ids != disk_ids:
        only_lib = sorted(lib_ids - disk_ids)
        only_disk = sorted(disk_ids - lib_ids)
        raise GenError(
            "the Library and research/sources/SHA256SUMS disagree about what was collected: "
            f"in the Library only {only_lib}; on disk only {only_disk}"
        )
    read = [r for r in collected if r["status"] == READ_STATUS]
    unread = sorted((r for r in collected if r["status"] != READ_STATUS), key=lambda r: r["id"])
    as_of = str(env["queried_at"])[:10]
    return {
        "as_of": as_of,
        "source": f"Gate E Research Library, status query of {as_of} (engine repo research/sources/ holds the PDFs)",
        "collected": len(collected),
        "read": len(read),
        "unread": [{"id": r["id"], "title": r["name"]} for r in unread],
        "not_collected": [r["name"] for r in not_collected],
    }


TEMPLATE = '''/**
 * GENERATED by scripts/gen_research_search.py from src/data/research_library_export.json.
 * Do not edit by hand: re-run the generator (see SQU-328).
 *
 * The stated search behind "we have not found these demonstrated together".
 *
 * SOURCE: a COMMITTED snapshot of one dated query of the Gate E Research Library
 * (the pod's reading log, Notion). It is never typed into page copy: the page
 * reads it, so the count on the page and the record behind it are the same
 * object (the gen_ledger.py / ruler_export.ts pattern). The generator
 * cross-checks the export against the engine repo's research/sources/SHA256SUMS
 * and runs scripts/check_research_search.ts before leaving a file on disk.
 *
 * WHAT "read" MEANS: the main text was read by a named seat; some appendices and
 * reference lists were skimmed, and each Library row says which.
 *
 * Counts are of PRIMARY papers collected for the project, a curated set chosen
 * by the founder and orchestrator for the Gate E plan, not a systematic search.
 */

export type UnreadPaper = {{ id: string; title: string }};

export type ResearchSearch = {{
  /** Date of the Library query this snapshot records (YYYY-MM-DD). */
  as_of: string;
  /** Where the numbers came from, in words. */
  source: string;
  /** Primary papers collected (PDFs on disk in the engine repo's research/sources/). */
  collected: number;
  /** Of those, read through by a named seat. */
  read: number;
  /** Collected and not yet read. read + unread.length must equal collected. */
  unread: UnreadPaper[];
  /** Named sources the pod wants that are not in the collection at all. */
  not_collected: string[];
}};

export const researchSearch: ResearchSearch = {body};
'''


def ts_value(v, indent=0):
    """A TS literal for the snapshot, stable and diff-friendly."""
    pad = "  " * indent
    if isinstance(v, dict):
        inner = "".join(f"{pad}  {k}: {ts_value(x, indent + 1)},\n" for k, x in v.items())
        return "{\n" + inner + pad + "}"
    if isinstance(v, list):
        if not v:
            return "[]"
        inner = "".join(f"{pad}  {ts_value(x, indent + 1)},\n" for x in v)
        return "[\n" + inner + pad + "]"
    if isinstance(v, str):
        return json.dumps(v, ensure_ascii=False)
    return str(v)


def render(snapshot):
    # unread entries on one line each, as in the committed file
    snap = dict(snapshot)
    lines = ["{"]
    for k, v in snap.items():
        if k == "unread":
            lines.append("  unread: [")
            for u in v:
                lines.append(f'    {{ id: {json.dumps(u["id"])}, title: {json.dumps(u["title"], ensure_ascii=False)} }},')
            lines.append("  ],")
        elif k == "not_collected":
            lines.append("  not_collected: [")
            for n in v:
                lines.append(f"    {json.dumps(n, ensure_ascii=False)},")
            lines.append("  ],")
        else:
            lines.append(f"  {k}: {ts_value(v, 1)},")
    lines.append("}")
    return TEMPLATE.format(body="\n".join(lines))


def run_guard(web_root):
    return subprocess.run(
        ["npx", "--yes", "tsx", "scripts/check_research_search.ts"],
        cwd=web_root, capture_output=True, text=True,
    )


def main(argv=None):
    here = os.path.dirname(os.path.abspath(__file__))
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("engine_repo")
    ap.add_argument("--ref", default="origin/main")
    ap.add_argument("--web-root", default=os.path.dirname(here))
    ap.add_argument("--export", default=None)
    ap.add_argument("--out", default=None)
    a = ap.parse_args(argv)
    export = a.export or os.path.join(a.web_root, "src/data/research_library_export.json")
    out = a.out or os.path.join(a.web_root, "src/data/research_search.ts")

    try:
        env = load_export(export)
        snapshot = derive(env, sha_ids(a.engine_repo, a.ref))
    except GenError as e:
        print(f"gen_research_search: REFUSED: {e}", file=sys.stderr)
        return 2

    text = render(snapshot)
    previous = open(out, encoding="utf-8").read() if os.path.exists(out) else None
    # an unchanged file still runs the guard
    with open(out, "w", encoding="utf-8") as fh:
        fh.write(text)
    guard = run_guard(a.web_root)
    if guard.returncode != 0:
        if previous is None:
            os.remove(out)
        else:
            with open(out, "w", encoding="utf-8") as fh:
                fh.write(previous)
        tail = "\n".join((guard.stdout + guard.stderr).strip().splitlines()[-12:])
        print("gen_research_search: the guard REJECTED the generated snapshot; previous file restored.\n" + tail, file=sys.stderr)
        return 1
    state = "unchanged" if previous == text else "updated"
    print(
        f"{state}: {snapshot['read']} read of {snapshot['collected']} collected, "
        f"{len(snapshot['unread'])} unread, as of {snapshot['as_of']}; guard passed"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
