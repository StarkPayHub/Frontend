# MCP Server

`@starkpay/sdk` ships with a built-in **MCP (Model Context Protocol) server**. This lets AI assistants like Claude Code, Cursor, and Windsurf understand the SDK API and answer your integration questions — including fetching live data from the Starknet contract.

---

## What is MCP?

MCP is an open protocol that lets AI assistants access external tools and documentation. Instead of copy-pasting docs into a chat, you configure the MCP server once and the AI can read the SDK docs and call on-chain tools automatically.

---

## Setup

### Option 1 — Auto (via `npx starkpay init`)

If you scaffolded your project with `npx starkpay init`, the `.mcp.json` file is already created in your project root:

```json
{
  "mcpServers": {
    "starkpay": {
      "command": "npx",
      "args": ["starkpay", "mcp"]
    }
  }
}
```

Just open the project in Claude Code, Cursor, or Windsurf — they'll pick it up automatically.

### Option 2 — Claude Code CLI

```bash
claude mcp add starkpay -- npx starkpay mcp
```

### Option 3 — Manual `.mcp.json`

Create `.mcp.json` in your project root:

```json
{
  "mcpServers": {
    "starkpay": {
      "command": "npx",
      "args": ["starkpay", "mcp"]
    }
  }
}
```

### Start the Server Manually

```bash
npx starkpay mcp
```

---

## What the AI Can Access

Once the MCP server is connected, the AI assistant gets access to:

### Documentation (Resources)

| Resource | Content |
|---|---|
| `starkpay://overview` | SDK overview, installation, provider setup |
| `starkpay://hooks` | All hooks with signatures and examples |
| `starkpay://components` | All components with props and usage |
| `starkpay://examples` | Full code examples for common use cases |

### Live On-Chain Tools

| Tool | Description | Example |
|---|---|---|
| `fetch_plan` | Fetch plan details from Starknet | *"What's in plan ID 2?"* |
| `check_subscription` | Check if a wallet is subscribed | *"Is 0x123... subscribed to plan 1?"* |
| `list_plans` | List all plans on the contract | *"Show all active plans"* |

---

## Example Prompts

Once connected, you can ask things like:

```
How do I add a subscription gate to my dashboard page?
```

```
Show me how to use the useStarkPay hook to build a custom subscribe button
```

```
What does plan ID 2 look like? (price, interval, merchant)
```

```
Check if 0xABC... has an active subscription to plan 1
```

```
How do I show the subscription expiry date?
```

```
How do I check a merchant's tier and plan limit?
```

The AI will answer with accurate, up-to-date code examples based on the actual SDK API — no hallucinations about non-existent props.

---

## Supported Editors

| Editor | How to add |
|---|---|
| **Claude Code** | `claude mcp add starkpay -- npx starkpay mcp` |
| **Cursor** | Add `.mcp.json` to project root |
| **Windsurf** | Add `.mcp.json` to project root |
| **VS Code (Copilot)** | Not yet supported |

---

## Troubleshooting

**"npx starkpay mcp" hangs or does nothing**

This is expected — the MCP server runs in the background and communicates via stdio. It's not meant to be run directly in a terminal. Your editor will start it automatically.

**The AI doesn't know about StarkPay**

Make sure the MCP server is connected — check your editor's MCP status panel. If using `.mcp.json`, ensure the file is in the project root (not a subdirectory).
