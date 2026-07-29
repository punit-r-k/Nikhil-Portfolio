const clean = (value, max) => String(value || "").trim().slice(0, max);

export default async function handler(request, response) {
  if (request.method !== "POST") return response.status(405).json({ error: "Method not allowed." });
  const body = request.body || {};
  if (clean(body.website, 100)) return response.status(400).json({ error: "Unable to send your message." });

  const name = clean(body.name, 120);
  const email = clean(body.email, 254);
  const project = clean(body.project, 80);
  const subject = clean(body.subject, 200) || `Portfolio inquiry from ${name}`;
  const message = clean(body.message, 10000);
  if (!name || !project || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return response.status(400).json({ error: "Please complete all required fields with a valid email." });
  }
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL || !process.env.CONTACT_TO_EMAIL) {
    return response.status(500).json({ error: "Email service is not configured." });
  }

  const text = [`Name: ${name}`, `Email: ${email}`, `Project type: ${project}`, "", message].join("\n");
  const result = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.RESEND_FROM_EMAIL, to: [process.env.CONTACT_TO_EMAIL], cc: [email], reply_to: email, subject, text }),
  });
  if (!result.ok) {
    console.error("Resend error", await result.text());
    return response.status(502).json({ error: "The message could not be sent. Please try again." });
  }
  return response.status(200).json({ ok: true });
}
