export async function onRequestPost({ request, env }) {
  try {
    const { title, body } = await request.json();
    
    if (!title) {
      return new Response("Missing issue title", { status: 400 });
    }

    const res = await fetch(
      `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/issues`,
      {
        method: "POST",
        headers: {
          "Authorization": `token ${env.GITHUB_TOKEN}`,
          "Content-Type": "application/json",
          "User-Agent": "cloudflare-pages-function",
        },
        body: JSON.stringify({ title, body }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return new Response(JSON.stringify(data), {
        status: res.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response("Server error: " + err.message, { status: 500 });
  }
}