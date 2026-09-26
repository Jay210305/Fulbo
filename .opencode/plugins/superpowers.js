/**
 * Superpowers bootstrap adapter for OpenCode (thin).
 *
 * The portable Superpowers skills live under
 * `.agents/skills/agent-optimization/superpowers/` and are already discovered
 * natively by OpenCode (`.agents/skills/**\/SKILL.md`). This plugin only adds
 * the part the portable skills cannot provide on their own: the session-start
 * bootstrap that loads `using-superpowers` (with the OpenCode tool mapping) into
 * the first user message, so the agent actually invokes the skills.
 *
 * It deliberately does NOT register skills, to avoid duplicating the portable
 * skills (which would trigger "duplicate skill name" warnings). It is a thin
 * harness adapter over the canonical portable skills, not a copy of the
 * upstream Superpowers plugin.
 */

import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Canonical portable skill location (project root/.agents/skills/...).
const PORTABLE_SKILL = join(
  __dirname,
  "..",
  "..",
  ".agents",
  "skills",
  "agent-optimization",
  "superpowers",
  "using-superpowers",
  "SKILL.md",
);

const TOOL_MAPPING = `**Tool Mapping for OpenCode:**
When skills request actions, substitute OpenCode equivalents:
- Create or update todos -> \`todowrite\`
- \`Subagent (general-purpose):\` -> \`task\` with \`subagent_type: "general"\`
- Invoke a skill -> OpenCode's native \`skill\` tool
- Read files -> \`read\`
- Create, edit, or delete files -> \`apply_patch\` / \`edit\` / \`write\`
- Run shell commands -> \`bash\`
- Search files -> \`grep\`, \`glob\`
- Fetch a URL -> \`webfetch\`

Use OpenCode's native \`skill\` tool to list and load skills.`;

let bootstrap = null;

function getBootstrap() {
  if (bootstrap !== null) return bootstrap;
  if (!existsSync(PORTABLE_SKILL)) {
    bootstrap = false;
    return bootstrap;
  }
  const content = readFileSync(PORTABLE_SKILL, "utf8");
  const match = content.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?([\s\S]*)$/);
  const body = match ? match[1] : content;
  bootstrap =
    `<EXTREMELY_IMPORTANT>\n` +
    `You have superpowers.\n\n` +
    `**IMPORTANT: The using-superpowers skill content is included below. It is ` +
    `ALREADY LOADED - you are currently following it. Do NOT use the skill tool ` +
    `to load "using-superpowers" again - that would be redundant.**\n\n` +
    `${body.trim()}\n\n${TOOL_MAPPING}\n</EXTREMELY_IMPORTANT>`;
  return bootstrap;
}

export const SuperpowersPlugin = async () => {
  return {
    "experimental.chat.messages.transform": async (_input, output) => {
      const content = getBootstrap();
      if (!content || !output.messages || !output.messages.length) return;
      const firstUser = output.messages.find((m) => m.info?.role === "user");
      if (!firstUser || !firstUser.parts || !firstUser.parts.length) return;
      if (
        firstUser.parts.some(
          (p) => p.type === "text" && p.text && p.text.includes("EXTREMELY_IMPORTANT"),
        )
      ) {
        return;
      }
      const ref = firstUser.parts[0];
      firstUser.parts.unshift({ ...ref, type: "text", text: content });
    },
  };
};

export default {
  id: "superpowers-bootstrap",
  server: SuperpowersPlugin,
};
