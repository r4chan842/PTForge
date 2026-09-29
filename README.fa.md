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

## ویرایشگر

ویرایشگر جدید سه تب اسکریپت، فهرست قابل جستجوی همهٔ توابع، قطعه‌کدهای آماده و پنل خروجی دارد.

<img src="assets/editor.png" alt="PTForge editor" width="100%">

## مستندات

راهنمای کامل (به انگلیسی) در پوشهٔ [docs](docs/README.md) است: نصب، شروع، مرجع API، دستورالعمل‌ها، نقشهٔ موضوعات CCNA و رفع اشکال.

## مجوز

PTForge با مجوز [MIT](LICENSE) منتشر شده است. این پروژه وابسته به Cisco Systems, Inc. نیست و از سوی آن تأیید نشده است.

</div>
