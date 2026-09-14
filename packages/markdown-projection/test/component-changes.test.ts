import type { Component } from "@aburi/types"
import { describe, expect, it } from "vitest"
import { projectDiff } from "../src"
import { component, emptySummary, languageId, makeDiff } from "./fixtures"

/**
 * §6.2 🧱 Component changes. The fields listed for a changed Component come from the entry's
 * `before` / `after`, not from its `delta`: the delta summarises three axes, and a rename, a new
 * language or an edited description moves none of them (diff-algorithm.md §6.1). Rendering the
 * booleans alone printed a dangling `- \`billing\`: ` for exactly those changes (#100).
 */

function changedDiff(
  before: Component,
  after: Component,
  delta = { rootsChanged: false, publicApiChanged: false, frameworksChanged: false },
) {
  return makeDiff({
    summary: { ...emptySummary(), componentsChanged: 1 },
    components: { added: [], removed: [], changed: [{ before, after, delta }] },
  })
}

function changedRow(md: string): string {
  const row = md.split("\n").find((line) => line.startsWith("- `billing`"))
  expect(row).toBeDefined()
  return row ?? ""
}

describe("component changes section", () => {
  it("renders a display-name change with its before → after", () => {
    const md = projectDiff(
      changedDiff(
        component({ id: "billing", name: "Billing" }),
        component({ id: "billing", name: "Billing & Invoicing" }),
      ),
    )
    expect(md).toContain("## 🧱 Component changes")
    expect(changedRow(md)).toBe("- `billing`: name (`Billing` → `Billing & Invoicing`)")
  })

  it("renders an added language", () => {
    const md = projectDiff(
      changedDiff(
        component({ id: "billing", name: "Billing", languages: [languageId("ts")] }),
        component({
          id: "billing",
          name: "Billing",
          languages: [languageId("ts"), languageId("py")],
        }),
      ),
    )
    expect(changedRow(md)).toBe("- `billing`: languages")
  })

  it("renders a description added, and spells an absent one `none`", () => {
    const none = component({ id: "billing", name: "Billing", description: null })
    const written = component({ id: "billing", name: "Billing", description: "Invoices" })
    expect(changedRow(projectDiff(changedDiff(none, written)))).toBe(
      "- `billing`: description (none → `Invoices`)",
    )
    expect(changedRow(projectDiff(changedDiff(written, none)))).toBe(
      "- `billing`: description (`Invoices` → none)",
    )
  })

  it("keeps naming the three delta axes, in Component field order", () => {
    const md = projectDiff(
      changedDiff(
        component({ id: "billing", name: "Billing", roots: ["apps/billing"], frameworks: [] }),
        component({
          id: "billing",
          name: "Billing",
          roots: ["apps/billing", "packages/billing-domain"],
          publicApi: ["apps/billing/routes/**"],
          frameworks: ["nestjs"],
        }),
        { rootsChanged: true, publicApiChanged: true, frameworksChanged: true },
      ),
    )
    expect(changedRow(md)).toBe("- `billing`: roots, publicApi, frameworks")
  })

  it("names the component alone when the artifact reports a change no field shows", () => {
    const same = component({ id: "billing", name: "Billing" })
    expect(changedRow(projectDiff(changedDiff(same, same)))).toBe("- `billing`")
  })

  it("reads an omitted Class A / Class B key as the value it stands for", () => {
    const explicit = component({
      id: "billing",
      name: "Billing",
      publicApi: [],
      frameworks: [],
      description: null,
    })
    const omitted: Component = {
      id: explicit.id,
      name: explicit.name,
      roots: explicit.roots,
      languages: explicit.languages,
    }
    expect(changedRow(projectDiff(changedDiff(explicit, omitted)))).toBe("- `billing`")
  })
})
