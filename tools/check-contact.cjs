// Exercise the actual form handler without opening an email app or transmitting data.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync(path.join(__dirname, '../assets/js/main.js'), 'utf8');

function formSession(lang) {
  const field = value => ({ value, error: '', setCustomValidity(message) { this.error = message; }, addEventListener() {} });
  const form = {
    elements: { nom: field('Test & Démo'), email: field('test+portfolio@example.com'), message: field('Bonjour — test\n&bcc=invalid@example.com ? #') },
    emailValid: true,
    getAttribute(key) { return key === 'data-to' ? 'ryadboujenan@outlook.com' : lang === 'en' ? 'Portfolio contact' : 'Contact portfolio'; },
    addEventListener(name, handler) { if (name === 'submit') this.submit = handler; },
    reportValidity() { return this.emailValid && !Object.values(this.elements).some(f => f.error); }
  };
  const window = { matchMedia: () => ({ matches: true }), location: {} };
  const document = {
    documentElement: { lang },
    querySelector: () => null,
    querySelectorAll: () => [],
    getElementById: id => id === 'contact-form' ? form : null
  };
  vm.runInNewContext(source, { window, document, navigator: {} });
  const submit = () => { let prevented = false; form.submit({ preventDefault() { prevented = true; } }); assert.ok(prevented); };
  return { form, window, submit };
}

for (const lang of ['fr', 'en']) {
  const valid = formSession(lang);
  valid.submit();
  const url = new URL(valid.window.location.href);
  assert.equal(url.protocol, 'mailto:');
  assert.equal(url.pathname, 'ryadboujenan@outlook.com');
  assert.match(url.searchParams.get('subject'), /Test & Démo$/u);
  assert.ok(url.searchParams.get('body').includes(valid.form.elements.message.value));
  assert.ok(url.searchParams.get('body').includes(valid.form.elements.email.value));
  assert.equal(url.searchParams.has('bcc'), false, 'Message text must not create mail headers');
  for (const name of ['nom', 'message']) {
    const invalid = formSession(lang);
    invalid.form.elements[name].value = '   ';
    invalid.submit();
    assert.ok(invalid.form.elements[name].error);
    assert.equal(invalid.window.location.href, undefined);
  }
  const invalidEmail = formSession(lang);
  invalidEmail.form.emailValid = false;
  invalidEmail.submit();
  assert.equal(invalidEmail.window.location.href, undefined);
}
console.log('PASS: FR/EN form validation; whitespace rejection; mailto destination, Unicode and special-character encoding; no header injection or email transmission.');
