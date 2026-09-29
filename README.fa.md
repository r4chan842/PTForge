<div dir="rtl">

<div align="center">

<img src="assets/banner.svg" alt="PTForge" width="100%">

**ساخت، پیکربندی، بررسی و مستندسازی کامل شبکه‌های Cisco Packet Tracer با جاوااسکریپت**

[English](README.md) · [نصب](docs/guides/installation.md) · [مستندات](docs/README.md) · [مثال‌ها](examples/README.md)

</div>

## PTForge چیست؟

PTForge یک افزونهٔ Packet Tracer است. شبکه را یک بار در قالب اسکریپت می‌نویسید، دکمهٔ **Run** را می‌زنید و Packet Tracer همه‌چیز را می‌سازد: دستگاه‌ها، ماژول‌ها، کابل‌ها، پیکربندی IOS، سرویس‌های سرور، وایرلس، برچسب‌ها و ناحیه‌ها. سپس PTForge وضعیت واقعی شبکه را می‌خواند تا همان اسکریپت کار خودش را بررسی کند.

- **تکرارپذیر**: یک لب را هر چند بار که بخواهید در چند ثانیه از صفر بسازید
- **قابل اشتراک**: هر لب یک فایل متنی است
- **دقیق**: آدرس، ماسک و wildcard خودکار محاسبه می‌شوند
- **قابل بررسی**: VLAN، ترانک، STP، Port Security و پروتکل‌های مسیریابی مستقیم از Packet Tracer خوانده می‌شوند

## شروع سریع

1. فایل `release/ptforge.js` و فایل‌های پوشهٔ `src/ui` را به یک Script Module جدید در Packet Tracer اضافه کنید
2. منوی `Extensions` ← `PTForge Editor` را باز کنید
3. یک اسکریپت از پوشهٔ `examples` را paste کنید و `Ctrl+Enter` بزنید

## نمونه

</div>

```js
addDevice("R1", "2911", 300, 80);
buildLan({ switchName: "S1", hosts: 4, network: "192.168.10.0/24", x: 300, y: 250 });
addLink("R1", "GigabitEthernet0/0", "S1", "GigabitEthernet0/1", "straight");
setInterfaceIp("R1", "GigabitEthernet0/0", "192.168.10.1/24");
createVlans("S1", { 10: "USERS" });
log(getVlans("S1"));
```

<div dir="rtl">

## امکانات

| بخش | امکانات |
|-----|---------|
| دستگاه‌ها | افزودن، حذف، تغییر نام، جابه‌جایی، روشن و خاموش، ماژول، پورت |
| سوئیچینگ | VLAN، Trunk، EtherChannel، STP، VTP، Port Security، DHCP Snooping |
| مسیریابی | Static، OSPF، OSPFv3، EIGRP، RIP، BGP، Redistribution |
| امنیت | ACL، NAT، PAT، SSH، AAA، HSRP |
| سرورها | DHCP، DNS، HTTP، HTTPS، FTP، Email، TFTP، Syslog |
| وایرلس | SSID، WPA2، WEP، فیلتر MAC |
| بررسی وضعیت | پورت‌های سوئیچ، Port Security، پایگاه VLAN، STP، VTP، OSPF، EIGRP |
| فایل‌ها | خواندن و نوشتن فایل، اجرای اسکریپت از دیسک، خروجی گرفتن از کانفیگ‌ها |
| ترسیم | یادداشت، خط، دایره، مستطیل، فلش، ناحیه، برچسب، لایه |

## ویرایشگر (نسخهٔ ۱.۱)

ویرایشگر کاملاً شبیه VS Code بازسازی شده و بدون هیچ کتابخانهٔ خارجی داخل Packet Tracer اجرا می‌شود:

- منوها، پالت دستورات (`Ctrl+Shift+P`)، رفتن به فایل (`Ctrl+P`) و خط (`Ctrl+G`)
- Explorer با فضای کاری داخلی و باز کردن فایل و پوشه از دیسک با پنجرهٔ خود Packet Tracer؛ ذخیره، ذخیره با نام، خروجی و وارد کردن
- تب‌ها با نقطهٔ «ذخیره‌نشده»، هایلایت استاندارد Dark+ (کامنت سبز `#6A9955`، رشته `#CE9178`، عدد `#B5CEA8`، کلیدواژه آبی و بنفش، توابع PTForge با رنگ جدا)
- IntelliSense برای ۳۷۵ تابع همراه توضیح، راهنمای پارامترها، پنل Problems با خط دقیق خطا و پیشنهاد «منظورتان ... بود؟»
- جستجو و جایگزینی، کامنت با `Ctrl+/`، جابه‌جایی و کپی خط، بستن خودکار پرانتز و کوتیشن
- نمای Devices زنده، ماشین‌حساب Subnet و VLSM و Wildcard، پنل Lab Check

<img src="assets/screenshots/editor.png" alt="PTForge editor" width="100%">

## بررسی و عیب‌یابی شبکه

- **Lab Check**: با `beginChecks` و `check...` و `endChecks` یک آزمون نمره‌دار از لب بسازید
- **Audit**: `auditNetwork()` آی‌پی تکراری، ناهماهنگی Subnet دو سر کابل، لینک قطع، پورت‌های VLAN 1 و پورت بدون Port Security را پیدا می‌کند
- **دستور گروهی**: `runOnAll("show ip int brief")` و تبدیل دستورات تایپ‌شده در CLI به اسکریپت با `commandsToScript()`

## مستندات

راهنمای کامل (به انگلیسی) در پوشهٔ [docs](docs/README.md) است: نصب، شروع، مرجع API، دستورالعمل‌ها، نقشهٔ موضوعات CCNA و رفع اشکال.

## مجوز

PTForge با مجوز [MIT](LICENSE) منتشر شده است. این پروژه وابسته به Cisco Systems, Inc. نیست و از سوی آن تأیید نشده است.

</div>
