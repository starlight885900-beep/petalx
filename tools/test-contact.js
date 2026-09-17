/**
 * test-contact.js: exercises api/contact.js with mock req/res objects and a
 * stubbed fetch, so the endpoint can be checked without deploying it or
 * sending mail.
 *
 *     node tools/test-contact.js
 *
 * No test runner and no dependencies, in keeping with the rest of the repo.
 * Excluded from the deploy by .vercelignore along with the other tooling.
 */
const path = require("path");
const handler = require(path.join(__dirname, "..", "api", "contact.js"));

const VALID = {
  name: "Jane Doe", company: "Acme Inc.", email: "jane@acme.com",
  topic: "AI & Data", message: "We need help with a retrieval system.", locale: "en",
};

function mockRes(){
  const res = {code: null, body: null, headers: {}};
  res.status = (c) => { res.code = c; return res; };
  res.json = (b) => { res.body = b; return res; };
  res.setHeader = (k, v) => { res.headers[k] = v; };
  return res;
}
const req = (method, body, ip) => ({method, body, headers: {"x-forwarded-for": ip || "1.2.3.4"}});

let sent = null;
let pass = 0, failed = 0;
function check(label, cond, extra){
  if (cond){ pass++; console.log("  ok    " + label); }
  else { failed++; console.log("  FAIL  " + label + (extra ? "  -> " + JSON.stringify(extra) : "")); }
}

(async () => {
  // quiet the endpoint's own logging
  console.error = () => {}; console.info = () => {};

  let res = mockRes();
  await handler(req("GET", null, "9.9.9.1"), res);
  check("GET is rejected with 405", res.code === 405, res.body);

  res = mockRes();
  await handler(req("POST", {...VALID, website: "http://spam"}, "9.9.9.2"), res);
  check("honeypot gets a silent 200", res.code === 200 && res.body.ok === true, res.body);

  res = mockRes();
  await handler(req("POST", {...VALID, message: ""}, "9.9.9.3"), res);
  check("missing message is 400", res.code === 400, res.body);

  res = mockRes();
  await handler(req("POST", {...VALID, email: "not-an-email"}, "9.9.9.4"), res);
  check("bad email is 400", res.code === 400, res.body);

  res = mockRes();
  await handler(req("POST", {...VALID, topic: "Something Else Entirely"}, "9.9.9.5"), res);
  check("topic outside the list is 400", res.code === 400, res.body);

  res = mockRes();
  await handler(req("POST", JSON.stringify(VALID), "9.9.9.6"), res);
  check("a JSON string body is parsed", res.code === 500, res.body);  // 500: no API key yet
  check("missing API key is a generic 500", res.body && /Could not send/.test(res.body.error), res.body);

  // now with a key and a stubbed Resend
  process.env.RESEND_API_KEY = "re_test_key";
  global.fetch = async (url, opts) => {
    sent = {url, headers: opts.headers, body: JSON.parse(opts.body)};
    return {ok: true, text: async () => "", json: async () => ({id: "x"})};
  };

  res = mockRes();
  await handler(req("POST", VALID, "9.9.9.7"), res);
  check("a valid message returns ok", res.code === 200 && res.body.ok === true, res.body);
  check("posts to Resend", sent && sent.url === "https://api.resend.com/emails");
  check("authorises with the key", sent.headers.Authorization === "Bearer re_test_key");
  check("sends to hirotanaka@petalxtech.com", sent.body.to[0] === "hirotanaka@petalxtech.com", sent.body.to);
  check("reply_to is the visitor", sent.body.reply_to === "jane@acme.com", sent.body.reply_to);
  check("subject carries topic and name",
        sent.body.subject === "Petalxtech enquiry — AI & Data — Jane Doe", sent.body.subject);
  check("body carries the message", sent.body.text.includes("retrieval system"));
  check("body notes the language", sent.body.text.includes("English"));

  // JA page
  res = mockRes();
  await handler(req("POST", {...VALID, locale: "ja"}, "9.9.9.8"), res);
  check("ja locale is flagged for the reply", sent.body.text.includes("Japanese"));

  // header injection
  res = mockRes();
  await handler(req("POST", {...VALID, name: "Bad\nBcc: someone@else.com"}, "9.9.9.9"), res);
  check("newlines are stripped from the subject", !/\n/.test(sent.body.subject), sent.body.subject);

  // rate limit: 3 allowed, 4th blocked
  let codes = [];
  for (let i = 0; i < 4; i++){
    const r = mockRes();
    await handler(req("POST", VALID, "5.5.5.5"), r);
    codes.push(r.code);
  }
  check("4th post from one IP in a minute is 429",
        codes.slice(0, 3).every((c) => c === 200) && codes[3] === 429, codes);

  // resend failing
  global.fetch = async () => ({ok: false, status: 422, text: async () => "domain not verified"});
  res = mockRes();
  await handler(req("POST", VALID, "7.7.7.7"), res);
  check("a Resend rejection is a 502, not a success", res.code === 502 && !res.body.ok, res.body);

  global.fetch = async () => { throw new Error("network down"); };
  res = mockRes();
  await handler(req("POST", VALID, "7.7.7.8"), res);
  check("a network failure is a 502, not a success", res.code === 502, res.body);

  console.log("\n%d passed, %d failed", pass, failed);
  process.exit(failed ? 1 : 0);
})();
