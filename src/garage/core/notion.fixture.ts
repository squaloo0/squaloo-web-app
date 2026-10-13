/** One page of a Notion database query, the shape the API returns (trimmed to what we read). */
export const NOTION_QUERY_FIXTURE = {
  object: "list",
  results: [
    {
      object: "page",
      id: "1b2c3d4e-0000-0000-0000-000000000001",
      created_time: "2026-10-14T01:02:03.000Z",
      created_by: { object: "user", id: "u1", name: "Marshal" },
      url: "https://www.notion.so/Cloudflare-Radar-1b2c3d4e",
      properties: {
        Name: { id: "title", type: "title", title: [{ type: "text", plain_text: "Cloudflare Radar, Bot vs. Human, worldwide" }] },
        URL: { id: "u", type: "url", url: "https://radar.cloudflare.com/traffic#bot-vs-human" },
        Status: { id: "s", type: "select", select: { name: "reviewed" } },
        Kind: { id: "k", type: "select", select: { name: "dashboard" } },
        Scrub: { id: "sc", type: "multi_select", multi_select: [{ name: "one network only" }, { name: "bot is not agent" }] },
        Summary: { id: "sm", type: "rich_text", rich_text: [{ type: "text", plain_text: "Bot 65%, human 35%, Cloudflare's network, HTML responses, week to 2026-10-12." }] },
        Added: { id: "a", type: "date", date: { start: "2026-10-13" } },
        "Added by": { id: "ab", type: "rich_text", rich_text: [{ type: "text", plain_text: "founder" }] },
      },
    },
    {
      object: "page",
      id: "1b2c3d4e-0000-0000-0000-000000000002",
      created_time: "2026-10-14T01:05:00.000Z",
      url: "https://www.notion.so/Untitled-2",
      properties: {
        Name: { id: "title", type: "title", title: [] },
      },
    },
    {
      object: "page",
      id: "1b2c3d4e-0000-0000-0000-000000000003",
      created_time: "2026-10-14T01:06:00.000Z",
      url: "https://www.notion.so/Semrush-3",
      properties: {
        Title: { id: "title", type: "title", title: [{ type: "text", plain_text: "Semrush: bot traffic now exceeds human" }] },
        Link: { id: "u", type: "url", url: "https://www.semrush.com/blog/ai-agent-bot-traffic/" },
      },
    },
  ],
  has_more: true,
  next_cursor: "cursor-2",
};
