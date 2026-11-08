const form = document.querySelector('#contact-form');
const status = document.querySelector('#form-status');
const inquiryType = document.querySelector('#inquiry-type');

document.querySelectorAll('[data-inquiry-type]').forEach((card) => {
  card.addEventListener('click', () => {
    inquiryType.value = card.dataset.inquiryType;
    document.querySelector('#contact').scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => document.querySelector('input[name="name"]').focus(), 500);
  });
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const payload = Object.fromEntries(data.entries());
  status.textContent = 'Sending your enquiry…';
  fetch('/api/inquiries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    .then((response) => { if (!response.ok) throw new Error('Unable to save enquiry'); return response.json(); })
    .then(() => { status.textContent = 'Thanks — your enquiry has been received.'; form.reset(); inquiryType.value = 'General enquiry'; })
    .catch(() => { status.textContent = 'Something went wrong. Please message me on WhatsApp instead.'; });
});
