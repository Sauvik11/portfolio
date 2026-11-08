export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const name = String(body.name || '').trim();
    const phone = String(body.phone || '').trim();
    const message = String(body.message || '').trim();
    const inquiryType = String(body.inquiryType || 'General enquiry').trim();

    if (!name || !phone || !message) {
      return Response.json({ error: 'Name, phone number, and requirement are required.' }, { status: 400 });
    }

    await context.env.DB.prepare(
      'INSERT INTO inquiries (name, phone, inquiry_type, message, created_at) VALUES (?, ?, ?, ?, datetime("now"))'
    ).bind(name, phone, inquiryType, message).run();

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: 'Unable to save enquiry.' }, { status: 500 });
  }
}
