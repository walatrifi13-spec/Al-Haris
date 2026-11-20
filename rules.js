"use strict";
// Offline fallback: weighted keyword rules (Arabic, Arabizi-agnostic, English).
const RULES = [
  [/otp|رمز التحقق|رمز التأكيد|الرمز السري|pin/i, 35, "يطلب رمزاً سرياً، والجهات الرسمية لا تطلبه أبداً"],
  [/https?:\/\/\S+|bit\.ly|tinyurl|www\./i, 20, "يحتوي على رابط يجب عدم فتحه قبل التأكد منه"],
  [/عاجل|فوراً|خلال \d+ (ساعة|دقيقة)|خلال ساعتين|urgent|immediately/i, 20, "يخلق شعوراً بالاستعجال كي لا تفكر"],
  [/موقوف|معلق|تعليق|إيقاف|suspend|blocked|locked/i, 20, "يهدد بإيقاف حسابك"],
  [/ربحت|جائزة|مبروك|هدية|winner|prize/i, 25, "يعدك بجائزة أو ربح غير متوقع"],
  [/كلمة المرور|password|رقم البطاقة|بيانات البطاقة|cvv/i, 35, "يطلب بيانات حساسة"],
  [/رسوم|ادفع|تحويل|حوالة|transfer/i, 15, "يطلب مالاً أو تحويلاً"],
];
const ACTIONS = {
  dangerous: ["لا تضغط على أي رابط ولا ترسل أي رمز.", "لا ترد على المرسل.", "تواصل مع الجهة من رقمها الرسمي فقط.", "احذف الرسالة وبلّغ عنها."],
  suspicious: ["لا تفتح الرابط قبل التحقق.", "اتصل بالجهة من رقمها الرسمي وتأكد.", "لا ترسل بيانات شخصية."],
  safe: ["لا مؤشرات واضحة، لكن ابقَ حذراً.", "تحقق دائماً إذا طُلب منك مال أو بيانات."],
};

function analyzeLocal(text) {
  let score = 0;
  const reasons = [];
  for (const [re, points, why] of RULES) {
    if (re.test(text)) { score += points; reasons.push(why); }
  }
  score = Math.min(score, 100);
  const level = score >= 60 ? "dangerous" : score >= 25 ? "suspicious" : "safe";
  return {
    level, score,
    reasons: reasons.length ? reasons : ["لم تظهر مؤشرات احتيال واضحة"],
    actions: ACTIONS[level],
  };
}

module.exports = { analyzeLocal, ACTIONS };
