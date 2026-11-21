# نموذج بريد سوقك — مقترح غير مطبق

قالب مقترح للاستخدام بعد المراجعة في Supabase Authentication > Email Templates.

## Confirm signup — العنوان
تأكيد بريدك الإلكتروني | سوقك SOOQAK

## Confirm signup — محتوى HTML
```html
<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;max-width:520px;margin:auto;color:#122c4b">
<h2>أهلًا بك في سوقك | SOOQAK</h2>
<p>اضغط الزر لتأكيد عنوان بريدك الإلكتروني وإكمال التسجيل في سوقك.</p>
<p><a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#122c4b;color:#f1c16e;padding:12px 22px;border-radius:9px;text-decoration:none">تأكيد البريد الإلكتروني</a></p>
<p style="font-size:12px;color:#66788a">إذا لم تطلب إنشاء الحساب، يمكنك تجاهل هذه الرسالة. لا تشارك رابط التحقق مع أحد.</p>
</div>
```

## Magic Link — العنوان
رابط الدخول الآمن إلى سوقك | SOOQAK

## Magic Link — محتوى HTML
```html
<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;max-width:520px;margin:auto;color:#122c4b">
<h2>تسجيل الدخول إلى سوقك</h2>
<p>استخدم الرابط الآمن التالي لتسجيل الدخول. الرابط صالح للاستخدام مرة واحدة فقط.</p>
<p><a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#122c4b;color:#f1c16e;padding:12px 22px;border-radius:9px;text-decoration:none">الدخول إلى سوقك</a></p>
<p style="font-size:12px;color:#66788a">إذا لم تطلب الدخول، تجاهل الرسالة ولا تشارك الرابط مع أحد.</p>
</div>
```

**ملاحظة:** القالب يغيّر نص البريد، ولا يغيّر عنوان المرسل. تغيير المرسل إلى بريد دومين سوقك يتطلب تهيئة SMTP مع نطاق والتحقق من إعداده، وهذا لم يُنفذ.
