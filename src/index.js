export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/inquiries" && request.method === "POST") {
      try {
        const body = await request.json();
        const name = String(body.name || "").trim();
        const phone = String(body.phone || "").trim();
        const message = String(body.message || "").trim();
        const inquiryType = String(body.inquiryType || "General enquiry").trim();

        if (!name || !phone || !message) {
          return Response.json({ error: "Name, phone number, and requirement are required." }, { status: 400 });
        }

        await env.DB.prepare(
          'INSERT INTO inquiries (name, phone, inquiry_type, message, created_at) VALUES (?, ?, ?, ?, datetime("now"))'
        ).bind(name, phone, inquiryType, message).run();

        return Response.json({ ok: true });
      } catch {
        return Response.json({ error: "Unable to save enquiry." }, { status: 500 });
      }
    }

    return env.ASSETS.fetch(request);
  }
};
