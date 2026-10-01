<div dir="rtl">

> [!WARNING]
> **در حال توسعه.** PTForge هنوز باگ‌های شناخته‌شده دارد و بعضی امکانات فقط بیرون از Packet Tracer تست شده‌اند. نتیجه را بررسی کنید، از فایل‌های `.pkt` نسخه پشتیبان نگه دارید و لطفاً [هر مشکلی دیدید گزارش دهید](https://github.com/r4chan842/PTForge/issues).

<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="../assets/brand/logo-dark.svg">
  <img src="../assets/brand/logo.svg" alt="PTForge" width="300">
</picture>

<br><br>

**شبکه‌های کامل Cisco Packet Tracer را با جاوااسکریپت بسازید، پیکربندی کنید، دیباگ کنید و بررسی کنید.**

[![Release](https://img.shields.io/github/v/release/r4chan842/PTForge?color=1A5DB7)](https://github.com/r4chan842/PTForge/releases/latest)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](../LICENSE)
![Functions](https://img.shields.io/badge/functions-388-1A5DB7)
![Packet Tracer](https://img.shields.io/badge/Packet%20Tracer-8.x%2B-1ba0d7)
![Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)

[شروع سریع](#شروع-سریع) ·
[نصب](../docs/guides/installation.md) ·
[مستندات](../docs/README.md) ·
[API](../docs/api/README.md) ·
[نمونه‌ها](../examples/README.md) ·
[نقشه CCNA](../docs/ccna/README.md)

[English](../README.md) ·
**فارسی** ·
[Deutsch](README.de.md) ·
[Español](README.es.md) ·
[Français](README.fr.md) ·
[Português](README.pt-BR.md) ·
[Русский](README.ru.md) ·
[Türkçe](README.tr.md) ·
[العربية](README.ar.md) ·
[中文](README.zh-CN.md) ·
[日本語](README.ja.md)

</div>

---

> این صفحه ترجمه است. نسخه مرجع [README انگلیسی](../README.md) است.

## چرا PTForge

ساختن یک آزمایشگاه در Packet Tracer یعنی کشیدن دستگاه‌ها، انتخاب کابل، باز کردن CLI تک‌تک دستگاه‌ها و تایپ دوباره همان دستورها. یک اشتباه تایپی در فهرست VLAN یا wildcard mask می‌تواند یک ساعت وقت بگیرد.

PTForge کلیک کردن را با اسکریپت جایگزین می‌کند. شبکه را یک بار توصیف می‌کنید، **Run** را می‌زنید و Packet Tracer آن را می‌سازد: دستگاه‌ها، ماژول‌ها، کابل‌ها، پیکربندی IOS، سرویس‌های سرور، بی‌سیم، برچسب‌ها و ناحیه‌ها. سپس PTForge وضعیت زنده را می‌خواند تا همان اسکریپت کار خودش را بررسی کند.

- **تکرارپذیر**: یک آزمایشگاه را در چند ثانیه از صفر دوباره بسازید
- **قابل اشتراک**: هر آزمایشگاه یک فایل متنی است که می‌شود فرستاد، بازبینی کرد و در Git نگه داشت
- **دقیق**: آدرس‌ها، ماسک‌ها و wildcardها محاسبه می‌شوند و اشتباه‌ها خطای روشن می‌دهند
- **قابل بررسی**: توابع بازرسی VLANها، ترانک‌ها، STP، port security و پروسه‌های مسیریابی را مستقیم از Packet Tracer می‌خوانند
- **قابل دیباگ**: breakpoint بگذارید، اسکریپت را قدم به قدم اجرا کنید و همه متغیرها را ببینید، مثل VS Code
- **تعاملی**: یک ترمینال جاوااسکریپت توپولوژی باز را خط به خط تغییر می‌دهد

<div align="center">
<img src="../assets/screenshots/editor.png" alt="PTForge" width="95%">
<br><sub>میز کار PTForge داخل Packet Tracer: اکسپلورر، تب‌ها، IntelliSense، رنگ‌بندی Dark Modern و خروجی</sub>
</div>

## تازه‌های نسخه 1.3

|  |  |
|---|---|
| **پلاگین‌ها** | فایل‌های `.pf` را در پوشه پلاگین بگذارید تا دستور نقطه‌ای ترمینال، تابع سراسری، قانون audit و چک Lab Check اضافه شود. سه پلاگین آماده در [`plugins`](../plugins) هست |
| **مدیر پلاگین** | `Ctrl+Shift+X` همه پلاگین‌ها را با نسخه، مجوزها و چیزهایی که اضافه می‌کنند نشان می‌دهد. فعال‌سازی اجازه می‌خواهد و پلاگینی که فایلش عوض شود تا بازبینی شما خاموش می‌ماند |
| **مجوزها** | پلاگین‌ها فقط‌خواندنی‌اند مگر `topology`، `cli`، `files` یا `raw` بخواهند. فراخوانی خارج از مجوز با خطای روشن متوقف می‌شود |
| **Codicons** | همه آیکون‌ها اکنون Codicon رسمی VS Code هستند (CC BY 4.0) با همان شبکه و اندازه‌های VS Code |
| **اطلاعات کامل میزبان** | `getPcIp()` گیت‌وی، DNS، MAC، IPv6، link-local و وضعیت لینک را برمی‌گرداند. `getPortInfo()` دستگاه سر دیگر کابل را می‌گوید. ترمینال شیءهای عمیق و آرایه‌های بلند را کامل چاپ می‌کند |
| **پینگ و traceroute در پس‌زمینه** | `ping()`، `traceroute()` و `pingAll()` منتظر پایان کار Packet Tracer می‌مانند و نتیجه دیگر صفر نیست. `traceroute()` همه hopها را برمی‌گرداند |

## شروع سریع

1. [آخرین نسخه](https://github.com/r4chan842/PTForge/releases/latest) را دانلود کنید و [راهنمای نصب](../docs/guides/installation.md) را دنبال کنید
2. `Extensions` ← `PTForge Editor` را باز کنید
3. یک اسکریپت از [`examples/`](../examples/README.md) را با `Ctrl+O` باز کنید و برای اجرا `Ctrl+F5` یا برای دیباگ `F5` را بزنید
4. `` Ctrl+` `` را بزنید و در ترمینال `getDevices()` را امتحان کنید
5. نتیجه را با `auditNetwork()`، `pingAll()` یا یک [Lab Check](../docs/api/checks.md) بررسی کنید

## یک نمونه کوتاه

```js
buildLan({ switchName: "S1", hosts: 4, network: "192.168.10.0/24", x: 300, y: 250 });
addDevice("R1", "2911", 300, 80);
addLink("R1", "GigabitEthernet0/0", "S1", "GigabitEthernet0/1", "straight");

basicSetup("R1", { secret: "class", consolePassword: "cisco", banner: "Authorized access only" });
setInterfaceIp("R1", "GigabitEthernet0/0", "192.168.10.1/24");
configureSsh("R1", { domain: "lab.local", username: "admin", password: "Adm1n!Pass" });

createVlans("S1", { 10: "USERS", 99: "MGMT" });
setAccessPort("S1", ["FastEthernet0/1", "FastEthernet0/2"], 10, { portfast: true, bpduguard: true });
configurePortSecurity("S1", ["FastEthernet0/1", "FastEthernet0/2"], { maximum: 2 });

drawZoneAround(["S1", "PC1", "PC2", "PC3", "PC4"], "VLAN 10 - Users", "green");
labelAllDevices();

takeSnapshot("baseline");
pingAll();
```

بیست خط یک روتر، یک سوئیچ، چهار PC آدرس‌دهی‌شده، روتر امن با SSH، VLANها، پورت‌های دسترسی امن، نمودار برچسب‌دار، یک خط پایه ذخیره‌شده و یک آزمون کامل دسترس‌پذیری می‌دهد.

## امکانات

| حوزه | کارهایی که می‌توانید انجام دهید |
|---|---|
| **دستگاه‌ها** | افزودن، حذف، تغییر نام، جابه‌جایی، خاموش و روشن کردن، نصب ماژول، خواندن پورت‌ها، ذخیره داده دلخواه، قرار دادن در فضای فیزیکی |
| **لینک‌ها** | همه نوع کابل، حذف لینک، اتصال خودکار، فهرست همسایه‌ها، بررسی وضعیت لینک |
| **میزبان‌ها** | IPv4 ایستا یا DHCP، IPv6 با SLAAC، گیت‌وی، DNS، فایروال، command prompt |
| **Cisco IOS** | تنظیمات پایه، رمزها، بنرها، کاربران، اینترفیس‌ها، ساب‌اینترفیس‌ها، loopback، router on a stick، DHCP و relay، NTP، syslog، SNMP، CDP، LLDP، دستورهای show |
| **سوئیچینگ** | VLAN، پورت access و voice، ترانک، DTP، EtherChannel (LACP، PAgP، ایستا، لایه 3)، Rapid PVST+، PortFast، BPDU guard، VTP، port security، DHCP snooping، DAI |
| **مسیریابی** | مسیر ایستا و شناور، OSPF، OSPFv3، EIGRP، EIGRP برای IPv6، RIP، RIPng، BGP، redistribution |
| **امنیت** | ACL استاندارد، توسعه‌یافته، نام‌دار و IPv6، NAT، PAT، NAT pool، port forwarding، SSH، مسدودسازی ورود، AAA با RADIUS و TACACS+ |
| **افزونگی** | HSRP روی یک روتر یا به صورت جفت active و standby |
| **سرورها** | DHCP، DNS (A، CNAME، NS)، HTTP، HTTPS، صفحه وب، کاربر FTP، حساب ایمیل، TFTP، syslog، RADIUS |
| **بی‌سیم** | SSID، WPA2، WPA، WEP، حالت رادیو، SSID مخفی، فیلتر MAC |
| **بازرسی** | وضعیت پورت سوئیچ، شمارنده‌های port security، پایگاه VLAN، ریشه STP و root portها، VTP، MAC ایستا، پروسه‌های OSPF و EIGRP |
| **دسترس‌پذیری** | `pingAll`، `pingMatrix` و `reachability` با درصد از دست رفتن، زمان رفت و برگشت و نمای ماتریسی |
| **اسنپ‌شات** | `takeSnapshot`، `getSnapshots`، `compareSnapshots`، `showSnapshotDiff`، ذخیره و بارگذاری فایل اسنپ‌شات و نمای تفاوت کانفیگ |
| **فایل‌ها** | خواندن و نوشتن فایل متنی، اجرای اسکریپت از دیسک، خروجی کانفیگ و توپولوژی، ثبت دستورها |
| **بوم** | یادداشت، خط، دایره، مستطیل، فلش، خط‌چین، ناحیه، برچسب دستگاه و لینک، لایه‌ها |
| **توپولوژی** | تولید ستاره، حلقه، خطی، مش و LAN، چیدمان شبکه‌ای و دایره‌ای، برنامه‌ریز VLSM و /30 |
| **شبیه‌سازی** | حالت simulation، PDU، فیلتر پروتکل، قدم به قدم، ping، traceroute |
| **Lab Check** | بررسی‌های نمره‌دار با امتیاز، راهنما و گزارش: دستگاه‌ها، کابل‌ها، آدرس‌ها، پورت‌ها، hostname، VLAN، خط‌های کانفیگ، آزمون دلخواه |
| **ممیزی** | IP تکراری، ناهماهنگی زیرشبکه دو سر کابل، لینک قطع، میزبان بدون آدرس، پورت access در VLAN 1، نبود port security، پورت بی‌استفاده روشن |
| **دسته‌ای** | `runOnAll("show ip int brief")`، `runOnDevices` و `commandsToScript()` که دستورهای تایپ‌شده در CLI را به اسکریپت تبدیل می‌کند |
| **فضای کار** | بزرگ‌نمایی، پس‌زمینه، شبکه راه دور، باز کردن و ذخیره پروژه، رویدادهای فضای کار |

هر تابع IOS یک همزاد `build...` دارد که به جای ارسال، دستورها را برمی‌گرداند تا بتوانید آن‌ها را پیش‌نمایش، ترکیب و دوباره استفاده کنید.

## ویرایشگر

<div align="center"><img src="../assets/banners/editor.svg" alt="Editor" width="100%"></div>

میز کار شبیه VS Code است و مثل آن رفتار می‌کند. از صفر با ES5 ساده ساخته شده تا داخل وب‌ویوی Packet Tracer بدون فریم‌ورک و بدون اینترنت اجرا شود.

| بخش | توضیح |
|---|---|
| **نوار منو و پالت فرمان** | منوهای File، Edit، Selection، View، Go، Run، Network، Terminal و Help. `Ctrl+Shift+P` همه فرمان‌ها، `Ctrl+P` پرش به فایل، `Ctrl+G` پرش به خط |
| **اکسپلورر** | ویرایشگرهای باز، فضای کار اسکریپت‌های ذخیره‌شده در Packet Tracer و یک پوشه واقعی از دیسک. ساخت، تغییر نام، حذف |
| **فایل‌ها** | Open، Save و Save As با پنجره‌های فایل خود Packet Tracer. وارد کردن از کلیپ‌بورد، خروجی به صورت دانلود |
| **تب‌ها** | یک تب برای هر فایل با نقطه تغییر، بستن با کلیک وسط، پرسش ذخیره برای فایل‌های دیسک، تاریخچه undo برای هر تب |
| **رنگ‌بندی** | رنگ‌های Dark Modern: کامنت `#6A9955`، رشته `#CE9178`، عدد `#B5CEA8`، کلیدواژه `#569CD6` و `#C586C0`، تابع `#DCDCAA`، متغیر `#9CDCFE`، توابع PTForge پررنگ `#4FC1FF`، جفت براکت رنگی |
| **IntelliSense** | پیشنهاد از هر 388 تابع با امضا و توضیح، کلمات فایل و کلیدواژه‌ها. راهنمای پارامتر هنگام تایپ |
| **Problems** | بررسی زنده نحو با خط دقیق، نام تابع ناشناخته با اصلاح سریع *Did you mean*. زیرخط موجی، نشانگر حاشیه و پنل Problems |
| **ویرایش** | بستن خودکار جفت‌ها، Enter هوشمند، `Ctrl+/` کامنت، `Alt+Up/Down` جابه‌جایی خط، `Shift+Alt+Down` کپی خط، `Ctrl+Shift+K` حذف خط، تطبیق براکت |
| **جستجو و جایگزینی** | `Ctrl+F` و `Ctrl+H` با حساسیت به حروف، کلمه کامل و عبارت منظم، جایگزینی همه در یک undo |
| **پنل** | Problems، Output، Debug Console، Terminal و Lab Check. قابل تغییر اندازه، `Ctrl+J` برای پنهان کردن |
| **نمای Devices** | دستگاه‌ها و پورت‌های زنده با چراغ لینک و آدرس، اسنپ‌شات‌ها و ابزارهای شبکه با یک کلیک |
| **نوار وضعیت** | تعداد مشکلات، وضعیت اجرا و دیباگ، مکان نشانگر، بزرگ‌نمایی، اتصال به Packet Tracer |

<table>
<tr>
<td><img src="../assets/screenshots/lab-check.png" alt="گزارش Lab Check و نمای زنده Devices" width="100%"><br><sub>گزارش Lab Check و نمای زنده Devices</sub></td>
<td><img src="../assets/screenshots/command-palette.png" alt="پالت فرمان و مرجع توابع" width="100%"><br><sub>پالت فرمان و مرجع توابع</sub></td>
</tr>
<tr>
<td><img src="../assets/screenshots/problems.png" alt="Problems با اصلاح سریع" width="100%"><br><sub>Problems با اصلاح سریع</sub></td>
<td><img src="../assets/screenshots/find-replace.png" alt="جستجو و جایگزینی" width="100%"><br><sub>جستجو و جایگزینی</sub></td>
</tr>
</table>

## ترمینال

<div align="center"><img src="../assets/banners/terminal.svg" alt="Terminal" width="100%"></div>

`` Ctrl+` `` یک ترمینال جاوااسکریپت باز می‌کند. هر خط بلافاصله داخل Packet Tracer اجرا می‌شود و متغیرهایش می‌مانند، پس می‌توانید بدون نوشتن اسکریپت، توپولوژی را قدم به قدم بررسی و تغییر دهید.

| قابلیت | توضیح |
|---|---|
| **اجرای مستقیم** | هر عبارت یا دستور، با نتیجه به صورت درخت خوانا و خطاها با رنگ قرمز |
| **تکمیل** | `Tab` توابع PTForge، متغیرهای شما، کلیدواژه‌ها و دستورهای نقطه‌ای را کامل می‌کند |
| **تاریخچه** | `Up` و `Down` دستورهای قبلی را می‌آورند و بین جلسه‌ها ذخیره می‌شوند |
| **چند ترمینال** | `+` ترمینال دیگری باز می‌کند، فهرست بین آن‌ها جابه‌جا می‌شود، سطل زباله یکی را می‌بندد |
| **دستورهای نقطه‌ای** | `.help`، `.clear`، `.devices`، `.ping`، `.trace`، `.show R1 show ip route`، `.cli R1` برای تایپ دستور IOS روی دستگاه، `.exit` برای خروج، `.audit`، `.snap`، `.diff`، `.calc 10.1.2.3/20`، `.run file.js`، `.history` |

<div align="center"><img src="../assets/screenshots/terminal.png" alt="Terminal" width="95%"></div>

[راهنمای ترمینال](../docs/guides/terminal.md) را بخوانید.

## دیباگر

<div align="center"><img src="../assets/banners/debugger.svg" alt="Debugger" width="100%"></div>

`F5` یک جلسه دیباگ شروع می‌کند. PTForge اسکریپت را ابزارگذاری می‌کند، یک بار داخل Packet Tracer اجرا می‌کند و همه قدم‌ها را ضبط می‌کند، سپس روی اولین breakpoint متوقف می‌شود. چون کل اجرا ضبط شده، می‌توانید **به عقب** هم قدم بردارید.

| قابلیت | توضیح |
|---|---|
| **Breakpointها** | کلیک روی حاشیه یا `F9`. breakpoint شرطی، شمارش برخورد، logpoint، غیرفعال کردن یا حذف همه |
| **استثناها** | توقف روی استثنای گرفته‌نشده با برجسته شدن خط دقیق |
| **قدم زدن** | ادامه `F5`، قدم روی `F10`، قدم داخل `F11`، قدم بیرون `Shift+F11`، قدم عقب، شروع دوباره `Ctrl+Shift+F5`، توقف `Shift+F5` |
| **متغیرها** | محدوده‌های Local، Closure و Script به صورت درخت باز شونده |
| **Watch** | هر عبارتی، ارزیابی‌شده در هر قدم ضبط‌شده |
| **Call stack** | همه فریم‌ها با فایل و خط. روی یک فریم کلیک کنید تا متغیرهایش را ببینید |
| **Debug Console** | ارزیابی عبارت روی فریم متوقف‌شده |
| **Hover** | نشانگر را روی یک متغیر در ویرایشگر ببرید تا مقدارش را ببینید |

<div align="center"><img src="../assets/screenshots/debugger.png" alt="Debugger" width="95%"></div>

[راهنمای دیباگر](../docs/guides/debugger.md) را بخوانید.

## ابزارهای شبکه

<div align="center"><img src="../assets/banners/network-tools.svg" alt="Network tools" width="100%"></div>

```js
pingAll();
takeSnapshot("before");
configureOspf("R1", { routerId: "1.1.1.1", networks: ["10.0.0.0/30"] });
compareSnapshots("before");
```

<table>
<tr>
<td><img src="../assets/screenshots/reachability.png" alt="ماتریس دسترس‌پذیری از pingAll()" width="100%"><br><sub>ماتریس دسترس‌پذیری از <code>pingAll()</code></sub></td>
<td><img src="../assets/screenshots/snapshot-diff.png" alt="مقایسه اسنپ‌شات با تفاوت کانفیگ" width="100%"><br><sub>مقایسه اسنپ‌شات با تفاوت کانفیگ</sub></td>
</tr>
<tr>
<td><img src="../assets/screenshots/calculator.png" alt="ماشین‌حساب زیرشبکه IPv4" width="100%"><br><sub>ماشین‌حساب زیرشبکه IPv4</sub></td>
<td><img src="../assets/screenshots/vlsm.png" alt="برنامه‌ریز VLSM" width="100%"><br><sub>برنامه‌ریز VLSM</sub></td>
</tr>
</table>

[ابزارهای شبکه](../docs/guides/network-tools.md)، [دسترس‌پذیری](../docs/api/simulation.md#reachability) و [اسنپ‌شات‌ها](../docs/api/snapshots.md) را بخوانید.

## بررسی و ممیزی

<div align="center"><img src="../assets/banners/lab-check.svg" alt="Lab Check" width="100%"></div>

```js
beginChecks("VLAN lab");
checkVlan("S1", 10, 2);
checkLinked("R1", "S1");
checkIpAddress("PC1", "FastEthernet0", "192.168.10.11", 24);
checkConfigContains("S1", "switchport mode trunk");
endChecks();

auditNetwork();
runOnAll("show ip interface brief");
```

[Lab Check](../docs/api/checks.md)، [ممیزی](../docs/api/audit.md) و [دستورهای دسته‌ای](../docs/api/ios.md#batch-commands) را بخوانید.

## نصب

PTForge یک Script Module برای Packet Tracer است. Packet Tracer بسته‌های `.pts` را رمزگذاری می‌کند و فقط خودش می‌تواند آن‌ها را بسازد، پس ماژول را یک بار از فایل‌های این مخزن می‌سازید.

1. [آخرین نسخه](https://github.com/r4chan842/PTForge/releases/latest) را دانلود یا مخزن را clone کنید
2. در Packet Tracer مسیر `Extensions` ← `Scripting` ← `Configure PT Script Modules` را باز کنید
3. یک ماژول با نام `PTForge` بسازید
4. یک فایل اسکریپت با محتوای [`release/ptforge.js`](../release/ptforge.js) اضافه کنید
5. چهارده فایل [`src/ui`](../src/ui) را به عنوان فایل‌های رابط اضافه کنید: `index.html`, `style.css`, `catalog.js`, `snippets.js`, `highlight.js`, `lint.js`, `netcalc.js`, `editor.js`, `acorn.js`, `instrument.js`, `terminal.js`, `debugview.js`, `views.js`, `interface.js`
6. ماژول را ذخیره و اجرا کنید و `Extensions` ← `PTForge Editor` را باز کنید

[راهنمای نصب](../docs/guides/installation.md) همه قدم‌ها و به‌روزرسانی را پوشش می‌دهد.

## نمونه‌ها

34 آزمایشگاه کامل در [`examples/`](../examples/README.md)، هر کدام از یک فضای کار خالی:

| پوشه | آزمایشگاه‌ها |
|---|---|
| `01-basics` | اولین شبکه، ماژول‌ها و لینک سریال، خط پایه امن |
| `02-switching` | VLAN و ترانک، EtherChannel، ریشه STP، سوئیچ لایه 3 |
| `03-routing` | ایستا، OSPF چند ناحیه‌ای، EIGRP، BGP، IPv6 با OSPFv3 |
| `04-security` | ACL، NAT و PAT، SSH و port security، HSRP |
| `05-services` | DHCP سرور، DNS و وب، FTP و ایمیل، DHCP روتر با relay |
| `06-wireless` | شبکه بی‌سیم خانگی |
| `07-canvas` | برچسب‌ها و ناحیه‌ها |
| `08-topology` | پردیس تولیدشده، ستاره و حلقه و مش، برنامه VLSM |
| `09-simulation` | آزمون ping |
| `10-ccna-labs` | Router on a stick، آزمایشگاه کامل سازمانی |
| `11-inspection` | بررسی سوئیچینگ، ممیزی port security |
| `12-automation` | پشتیبان کانفیگ، ممیزی دستورها، کتابخانه اسکریپت |
| `13-operations` | آزمون دسترس‌پذیری، پیگیری تغییرات با اسنپ‌شات |

نقطه شروع کار شما در [`templates/`](../templates/README.md) است: آزمایشگاه خالی، پردیس، WAN شعبه و دفتر کوچک.

## مستندات

| بخش | محتوا |
|---|---|
| [شروع کار](../docs/guides/getting-started.md) | اولین شبکه شما در ده دقیقه |
| [راهنمای ویرایشگر](../docs/guides/editor.md) | فضای کار، فایل‌ها، IntelliSense، مشکلات |
| [ترمینال](../docs/guides/terminal.md) | جاوااسکریپت تعاملی و CLI دستگاه |
| [دیباگر](../docs/guides/debugger.md) | Breakpoint، قدم زدن، متغیرها و watch |
| [ابزارهای شبکه](../docs/guides/network-tools.md) | ماشین‌حساب، دسترس‌پذیری و اسنپ‌شات |
| [نوشتن اسکریپت](../docs/guides/writing-scripts.md) | ساختار، ترتیب عملیات، builderها، سرعت |
| [مرجع API](../docs/api/README.md) | همه توابع با آرگومان، مقدار بازگشتی و مثال |
| [دستورالعمل‌ها](../docs/recipes/README.md) | سوئیچینگ پردیس، آزمایشگاه مسیریابی، روتر لبه، سرورها، نمودارها |
| [نقشه موضوعات CCNA](../docs/ccna/README.md) | موضوعات CCNA 200-301 با توابع و مثال‌های مرتبط |
| [برگه‌های خلاصه](../docs/cheatsheets/ios-to-ptforge.md) | IOS به PTForge، زیرشبکه، کلیدهای ویرایشگر |
| [معماری](../docs/architecture/overview.md) | لایه‌ها، زمان اجرا، پل ویرایشگر، دیباگر، آزمون‌ها |
| [عیب‌یابی](../docs/guides/troubleshooting.md) | خطاهای رایج و راه‌حل |
| [محدودیت‌ها](../docs/guides/limitations.md) | کارهایی که API در Packet Tracer اجازه نمی‌دهد |
| [پرسش‌های رایج](../docs/guides/faq.md) | پاسخ‌های کوتاه |

## ساختار پروژه

```
PTForge/
├── .github/
├── assets/
│   ├── brand/
│   ├── banners/
│   └── screenshots/
├── docs/
│   ├── api/
│   ├── architecture/
│   ├── ccna/
│   ├── cheatsheets/
│   ├── guides/
│   ├── recipes/
│   └── reference/
├── examples/
├── i18n/
├── release/
├── src/
│   ├── api/
│   ├── core/
│   ├── data/
│   ├── lib/
│   └── ui/
├── templates/
├── tests/
└── tools/
```

## توسعه

به Node.js نسخه 18 یا بالاتر نیاز دارد. وابستگی زمان اجرا ندارد.

```
git clone https://github.com/r4chan842/PTForge.git
cd PTForge
npm run check
```

| فرمان | کاربرد |
|---|---|
| `npm test` | اجرای همه آزمون‌ها |
| `npm run bundle` | ساخت دوباره `release/ptforge.js` |
| `npm run catalog` | ساخت دوباره فهرست توابع ویرایشگر از `docs/api` |
| `npm run reference` | ساخت دوباره جدول‌های مرجع از `src/data` |
| `npm run check` | فهرست توابع، bundle، بررسی نحو و آزمون‌ها |
| `npm run ui-test` | 41 آزمون مرورگر برای میز کار، ترمینال و دیباگر با Playwright |
| `npm run screenshots` | ساخت دوباره تصویرهای `assets/screenshots` |

مجموعه آزمون کل افزونه را روی یک شبیه‌ساز از Packet Tracer IPC API اجرا می‌کند و همه توابع عمومی، نمونه‌ها، قالب‌ها، دستورالعمل‌ها، bundle، موتور ترمینال و دیباگر و قوانین پروژه را پوشش می‌دهد. جزئیات در [آزمون‌ها](../docs/architecture/testing.md).

## مشارکت

گزارش باگ، ایده و pull request خوش‌آمد است. از [CONTRIBUTING](../CONTRIBUTING.md) شروع کنید، [نقشه راه](../ROADMAP.md) را ببینید و [آیین‌نامه رفتار](../CODE_OF_CONDUCT.md) را رعایت کنید. مشکلات امنیتی از طریق [سیاست امنیتی](../SECURITY.md). برای پرسش‌ها [SUPPORT](../SUPPORT.md) را ببینید.

## مجوز

PTForge تحت [مجوز MIT](../LICENSE) منتشر شده است. دیباگر از [Acorn](https://github.com/acornjs/acorn) (MIT) استفاده می‌کند، [THIRD_PARTY_NOTICES](../THIRD_PARTY_NOTICES.md) را ببینید.

## قدردانی

استفاده از API در Packet Tracer بر اساس [مستندات رسمی Cisco Packet Tracer IPC API](https://tutorials.ptnetacad.net/help/default/IpcAPI/classes.html) است. رنگ‌های میز کار از تم Dark Modern در VS Code پیروی می‌کنند.

Cisco و Packet Tracer علامت‌های تجاری Cisco Systems, Inc. هستند. این پروژه وابسته به Cisco Systems, Inc. نیست و مورد تأیید آن نیست.

<div align="center">
<sub>ساخته‌شده برای دانشجویان شبکه، مدرس‌ها و هر کسی که از دو بار کلیک کردن یک آزمایشگاه خسته شده است.</sub>
</div>

</div>
