"use strict";
const test = require("node:test");
const assert = require("node:assert");
const { analyzeLocal } = require("./rules");
const { redact } = require("./privacy");

test("flags an OTP + link + urgency scam as dangerous", () => {
  const r = analyzeLocal("تم إيقاف حسابك، اضغط الرابط http://x.xyz خلال ساعتين وأرسل رمز التحقق");
  assert.strictEqual(r.level, "dangerous");
});
test("normal meeting message is safe", () => {
  assert.strictEqual(analyzeLocal("موعد اجتماع الغد الساعة 10 صباحاً").level, "safe");
});
test("redact removes emails, phone numbers and Emirates ID", () => {
  const out = redact("mail a@b.com call +971 50 123 4567 id 784-1990-1234567-1");
  assert.ok(!out.includes("a@b.com") && !out.includes("123 4567") && !out.includes("1234567"));
});
