/**
 * Ponytail always-on adapter for OpenCode (thin).
 *
 * The portable Ponytail skills live under
 * `.agents/skills/agent-optimization/ponytail/` and are already discovered
 * natively by OpenCode (`.agents/skills/**\/SKILL.md`). This plugin only adds
 * the part the portable skills cannot provide on their own: the concise
 * always-on ruleset, injected into the system prompt every turn so the "lazy
 * senior dev" discipline applies by default rather than only when the agent
 * explicitly invokes the skill.
 *
 * It reads the same ruleset as the Agy native rule
 * (`.agents/rules/ponytail.md`) so both harnesses share one source of truth,
 * and it does NOT register skills (which would duplicate the portable skills).
 */

import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const RULESET = join(__dirname, "..", "..", ".agents", "rules", "ponytail.md");

const MARKER = "PONYTAIL_RULESET";

let ruleset = null;

function getRuleset() {
  if (ruleset !== null) return ruleset;
  if (!existsSync(RULESET)) {
    ruleset = false;
    return ruleset;
  }
  ruleset = readFileSync(RULESET, "utf8").trim();
  return ruleset;
}

export const PonytailPlugin = async () => {
  return {
    "experimental.chat.system.transform": async (_input, output) => {
      const content = getRuleset();
      if (!content) return;
      const joined = Array.isArray(output.system) ? output.system.join("\n") : "";
      if (joined.includes(MARKER)) return;
      const block = `${MARKER}\n${content}`;
      if (Array.isArray(output.system) && output.system.length > 0) {
        output.system[output.system.length - 1] += `\n\n${block}`;
      } else if (Array.isArray(output.system)) {
        output.system.push(block);
      }
    },
  };
};

export default {
  id: "ponytail",
  server: PonytailPlugin,
};
