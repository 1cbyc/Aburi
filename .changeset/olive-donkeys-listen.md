---
"@aburi/diff": patch
"@aburi/markdown-projection": patch
---

A component that is renamed, given a language, or given a description is a component that changed

`diffComponents` decided a Component had changed by asking the three questions its `delta`
answers — roots, publicApi, frameworks. A Component carries three more fields. Rename one, add a
language to it, write it a description, and the diff said `componentsChanged: 0` with an empty
`changed[]`: not a quiet entry a reader could miss, but no entry at all, so the Markdown layer did
not even have the before/after pair it would have rendered from.

Two questions had been answered with one list. Which fields make a Component `changed` is now the
whole record — every field the document carries, compared canonically, so a field added to `v1`
later counts without this decision being revisited. Which fields the `delta` summarises is
unchanged: the same three booleans, naming the axes a reviewer scans for architectural movement. A
`changed[]` entry whose three booleans are all `false` is the well-formed shape of "something else
about this component moved", and it needs no schema change, because `before` and `after` were
always there.

Comparison is spelling-independent in both directions `ir-schema.md` §1.1 allows, which a byte
comparison is what gets wrong: a Class A `description` reads `null` and an absent key as the same
answer, and a Class B `publicApi` / `frameworks` reads `[]` and an absent key as the same answer.
Key order and Unicode form do not make a change either — the comparison is the canonical
serializer the fingerprints are built on, not a second answer to the same question.

The 🧱 Component changes section reads the fields it lists off `before` / `after` rather than off
`delta`, which is the same conflation on the reviewer-facing side: rendering the booleans alone
printed `` - `billing`:  `` with nothing after the colon for exactly the changes this fixes. A
rename and a description carry their before → after inline, since for a scalar that is the whole
change; the list-valued fields name themselves as they always have. An absent description renders
as `none`.
