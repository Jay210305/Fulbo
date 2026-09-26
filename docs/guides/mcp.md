# MCP guide

Fulbo configures the same workspace MCP servers for OpenCode and Antigravity:

- OpenCode: `.opencode/opencode.json`
- Antigravity IDE convention: `.agents/mcp_config.json`
- Agy CLI (actual): `~/.gemini/config/mcp_config.json` (managed with `agy mcp add`)

Note: the `agy` CLI does **not** read `.agents/mcp_config.json`; that file is the
Antigravity IDE convention. The `agy` CLI's MCP servers live in the user-global
`~/.gemini/config/mcp_config.json`.

## Active servers

- `fulbo-git` uses `mcp-server-git` through `uvx` and is scoped to this repository.
- `fulbo-fetch` uses `mcp-server-fetch` through `uvx`. It retrieves HTTP(S) content as Markdown; it is not a general-purpose POST/PUT webhook test client.
- `fulbo-laya` exposes the local Laya decision model as an optional plan-validation gate. It starts a Node MCP bridge that lazily launches a Python worker with the `laya` package installed. See [laya.md](laya.md) for installation, configuration, and the tool contract.

OpenCode's native `websearch` and `webfetch` tools cover internet research, so no separate internet MCP server is needed. `webfetch` and `websearch` are explicitly allowed in `.opencode/opencode.json`.

## PostgreSQL

`fulbo-postgres` uses the read-only PostgreSQL reference server. It is disabled until the local database is running and the connection string is provided outside version control.

In PowerShell, start the database and set the variable for the current session:

```powershell
Set-Location backend
docker compose up -d postgres
$env:FULBO_MCP_DATABASE_URL = 'postgresql://fulbo:fulbo_dev@localhost:5432/fulbo_dev'
```

Then enable `fulbo-postgres` in the relevant MCP client configuration and restart or reload that client. Do not add production credentials to either JSON file.

## Docker

`fulbo-docker` connects through Docker MCP Toolkit's `fulbo` profile and is disabled until that profile exists. In Docker Desktop, enable MCP Toolkit, create the `fulbo` profile, and add only the Docker tools needed for this project. Start Docker Desktop before enabling the server.

## Safety

The Git server includes mutating operations in addition to inspection. The Fetch reference server can reach local/internal network addresses. Keep tool approval enabled, use only trusted URLs, and enable Docker/PostgreSQL only while working with local development services.
