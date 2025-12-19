export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  // Simple protection: require a secret header
  const apiKey = event.headers["x-api-key"];
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return { statusCode: 401, body: "Unauthorized" };
  }

  let body = {};
  try {
    body = JSON.parse(event.body || "{}");
  } catch (e) {
    return { statusCode: 400, body: "Invalid JSON" };
  }

  const { action, pass } = body;

  let text = "";
  if (action === "open") text = "/open";
  else if (action === "status") text = "/status";
  else if (action === "setpass") {
    if (!pass) return { statusCode: 400, body: "Missing pass" };
    text = `/setpass ${pass}`;
  } else {
    return { statusCode: 400, body: "Unknown action" };
  }

  const url = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`;

  const tgResp = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      chat_id: process.env.CHAT_ID,
      text
    })
  });

  const data = await tgResp.json();

  if (!data.ok) {
    return { statusCode: 500, body: JSON.stringify(data, null, 2) };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ ok: true, sent: text }, null, 2)
  };
}
