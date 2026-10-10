"""Planted-defect proofs for gen_research_search.py (rule 11: the guards must be able to fire).

    python3 scripts/check_gen_research_search.py

Each case runs the REAL generator in a temp web root (copies of the real guard, lib, page and
tsconfig; node_modules symlinked) against a temp engine repo with a committed SHA256SUMS.
"""
import json, os, shutil, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
WEB = os.path.dirname(HERE)
GEN = os.path.join(HERE, "gen_research_search.py")
COPY = ["src/data/research_search.ts", "src/lib/research_search.ts", "scripts/check_research_search.ts",
        "src/app/measured/next/page.tsx", "tsconfig.json", "tsconfig.scripts.json", "package.json"]
IDS = ["2501.00001", "2501.00002", "2501.00003"]
fails = []


def good_export():
    rows = [{"id": i, "kind": "paper", "status": s, "name": f"Paper {i}"} for i, s in zip(IDS, ["Reviewed", "Reviewed", "Unclaimed"])]
    rows.append({"id": "Lukens-2025", "kind": "paper", "status": "Unclaimed", "name": "Not collected paper"})
    return {"queried_at": "2026-10-10", "queried_by": "t", "box": "t", "data_source": "t", "query": "q", "results": rows}


def setup(export, sums=None):
    root = tempfile.mkdtemp()
    web, eng = os.path.join(root, "web"), os.path.join(root, "eng")
    for c in COPY:
        os.makedirs(os.path.dirname(os.path.join(web, c)), exist_ok=True)
        shutil.copy(os.path.join(WEB, c), os.path.join(web, c))
    os.symlink(os.path.join(WEB, "node_modules"), os.path.join(web, "node_modules"))
    os.makedirs(os.path.join(web, "src/data"), exist_ok=True)
    json.dump(export, open(os.path.join(web, "src/data/research_library_export.json"), "w"))
    os.makedirs(os.path.join(eng, "research/sources"))
    open(os.path.join(eng, "research/sources/SHA256SUMS"), "w").write(
        "".join(f"{'0'*64}  {i}.pdf\n" for i in (IDS if sums is None else sums)))
    for a in (["init", "-q"], ["add", "."], ["-c", "user.name=t", "-c", "user.email=t@t", "commit", "-qm", "x"]):
        subprocess.run(["git", "-C", eng] + a, check=True, capture_output=True)
    return web, eng


def run(web, eng):
    return subprocess.run([sys.executable, GEN, eng, "--ref", "HEAD", "--web-root", web], capture_output=True, text=True)


def case(name, export, sums=None, want_rc=None, want_text="", keep_prev=False):
    web, eng = setup(export, sums)
    out = os.path.join(web, "src/data/research_search.ts")
    prev = open(out).read()
    r = run(web, eng)
    msg = r.stdout + r.stderr
    ok = r.returncode == want_rc and want_text in msg
    if want_rc != 0:
        ok = ok and open(out).read() == prev  # a refusal must leave the file untouched
    print(("PASS " if ok else "FAIL ") + name + f" (rc={r.returncode})")
    if not ok:
        fails.append(name); print(msg)
    return web


# 1 happy path: derives 2 read of 3 collected, 1 unread, 1 not collected; guard passes
web = case("happy path passes the guard", good_export(), want_rc=0, want_text="2 read of 3 collected")
t = open(os.path.join(web, "src/data/research_search.ts")).read()
if 'id: "2501.00003"' not in t or "Not collected paper" not in t or "2501.00001" in t.split("unread:")[1].split("not_collected")[0]:
    fails.append("happy path content"); print("FAIL happy path content")
else:
    print("PASS happy path content (unread = the one Unclaimed id; the non-arXiv row is not_collected)")

# 2 idempotent
r = run(web, os.path.join(os.path.dirname(web), "eng"))
print(("PASS " if r.returncode == 0 and r.stdout.startswith("unchanged") else "FAIL ") + "second run is unchanged")
if not r.stdout.startswith("unchanged"): fails.append("idempotent")

# 3 library has an id the disk lacks; 4 disk has a PDF the library lacks
case("Library id missing on disk is refused", good_export(), sums=IDS[:2], want_rc=2, want_text="in the Library only ['2501.00003']")
case("disk PDF missing from Library is refused", good_export(), sums=IDS + ["2501.00009"], want_rc=2, want_text="on disk only ['2501.00009']")

# 5 unknown status; 6 missing provenance; 7 bad date
e = good_export(); e["results"][0]["status"] = "Skimmed"
case("unknown status is refused", e, want_rc=2, want_text="does not recognise")
e = good_export(); del e["queried_at"]
case("missing queried_at is refused", e, want_rc=2, want_text="queried_at")
e = good_export(); e["queried_at"] = "10/10/2026"
case("malformed queried_at is refused", e, want_rc=2, want_text="YYYY-MM-DD")

# 8 the GUARD (not the generator) rejects: a future as_of passes the generator's checks and must be
# caught by assertResearchSearch, with the previous file restored.
e = good_export(); e["queried_at"] = "2099-01-01"
case("guard rejects a future-dated snapshot; previous file restored", e, want_rc=1, want_text="REJECTED")

print("FAILED: " + ", ".join(fails) if fails else "all generator proofs passed")
sys.exit(1 if fails else 0)
