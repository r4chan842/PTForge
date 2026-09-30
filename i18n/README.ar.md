<div dir="rtl">

<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="../assets/brand/logo-dark.svg">
  <img src="../assets/brand/logo.svg" alt="PTForge" width="300">
</picture>

<br><br>

**ابنِ شبكات Cisco Packet Tracer كاملة واضبطها وصحّح أخطاءها وتحقق منها باستخدام JavaScript.**

[![Release](https://img.shields.io/github/v/release/r4chan842/PTForge?color=1A5DB7)](https://github.com/r4chan842/PTForge/releases/latest)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](../LICENSE)
![Functions](https://img.shields.io/badge/functions-388-1A5DB7)
![Packet Tracer](https://img.shields.io/badge/Packet%20Tracer-8.x%2B-1ba0d7)
![Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)

[البدء السريع](#البدء-السريع) ·
[التثبيت](../docs/guides/installation.md) ·
[التوثيق](../docs/README.md) ·
[API](../docs/api/README.md) ·
[الأمثلة](../examples/README.md) ·
[خريطة CCNA](../docs/ccna/README.md)

[English](../README.md) ·
[فارسی](README.fa.md) ·
[Deutsch](README.de.md) ·
[Español](README.es.md) ·
[Français](README.fr.md) ·
[Português](README.pt-BR.md) ·
[Русский](README.ru.md) ·
[Türkçe](README.tr.md) ·
**العربية** ·
[中文](README.zh-CN.md) ·
[日本語](README.ja.md)

</div>

---

> هذه ترجمة. النسخة المرجعية هي [ملف README الإنجليزي](../README.md).

## لماذا PTForge

بناء مختبر في Packet Tracer يعني سحب الأجهزة واختيار الكابلات وفتح كل واجهة CLI وكتابة الأوامر نفسها مرة بعد مرة. خطأ إملائي واحد في قائمة VLAN أو قناع wildcard قد يكلّفك ساعة.

يستبدل PTForge النقرات بسكربت. تصف الشبكة مرة واحدة وتضغط **Run** فيبنيها Packet Tracer: الأجهزة والوحدات والكابلات وإعدادات IOS وخدمات الخوادم والشبكة اللاسلكية والتسميات والمناطق. بعد ذلك يقرأ PTForge الحالة الفعلية حتى يتحقق السكربت نفسه من عمله.

- **قابل للتكرار**: أعد بناء المختبر من الصفر في ثوانٍ وبقدر ما تشاء
- **قابل للمشاركة**: المختبر ملف نصي يمكن إرساله ومراجعته وحفظه في Git
- **صحيح**: تُحسب العناوين والأقنعة وأقنعة wildcard، وتُنتج الأخطاء الإملائية رسائل واضحة
- **قابل للتحقق**: تقرأ دوال الفحص شبكات VLAN والـtrunk وSTP وport security وعمليات التوجيه مباشرة من Packet Tracer
- **قابل للتصحيح**: ضع نقاط توقف ونفّذ السكربت خطوة بخطوة واقرأ كل متغير كما في VS Code
- **تفاعلي**: طرفية JavaScript تعدّل الطوبولوجيا المفتوحة سطرًا بسطر

<div align="center">
<img src="../assets/screenshots/editor.png" alt="PTForge" width="95%">
<br><sub>بيئة عمل PTForge داخل Packet Tracer: المستكشف والتبويبات وIntelliSense وتلوين Dark Modern والمخرجات</sub>
</div>

## الجديد في 1.2

|  |  |
|---|---|
| **طرفية JavaScript** | يفتح `` Ctrl+` `` طرفية مثل *New Terminal* في VS Code. يُنفَّذ كل سطر مباشرة على الطوبولوجيا المفتوحة، مع السجل والإكمال بـ Tab وأوامر النقطة مثل `.calc` و`.ping` و`.cli R1` |
| **مصحح الأخطاء** | يشغّل `F5` السكربت ويسجّل كل خطوة. يتوقف عند نقاط التوقف والشروط والاستثناءات، ويتخطى ويدخل ويخرج ويعود **للخلف**، ويعرض Variables وWatch وCall Stack ويقيّم التعابير في Debug Console |
| **حاسبة الشبكات** | شبكة IPv4 فرعية وتقسيم الشبكات ومخطِّط VLSM وتلخيص المسارات وتحويل النطاق إلى CIDR وأقنعة wildcard وIPv6 وEUI-64 وتحويل الأنظمة العددية في تبويب واحد |
| **مصفوفة الوصول** | ترسل `pingAll()` أمر ping إلى كل عنوان من كل موجّه ومحوّل وتعرض مصفوفة ملوّنة بالفقد وأزمنة الذهاب والإياب |
| **اللقطات والمقارنة** | تحفظ `takeSnapshot()` الأجهزة والروابط والعناوين والمنافذ وحالة التشغيل وrunning-config. قارن لقطتين واعرض الإعدادات سطرًا بسطر |
| **Dark Modern** | الألوان والمسافات والتبويبات واللوحات وشريط الحالة تطابق سمة Dark Modern في VS Code تمامًا، ويصبح شريط الحالة أزرق أثناء التصحيح |

## البدء السريع

1. نزّل [أحدث إصدار](https://github.com/r4chan842/PTForge/releases/latest) واتبع [دليل التثبيت](../docs/guides/installation.md)
2. افتح `Extensions` ← `PTForge Editor`
3. افتح سكربتًا من [`examples/`](../examples/README.md) بـ `Ctrl+O` واضغط `Ctrl+F5` للتشغيل أو `F5` للتصحيح
4. اضغط `` Ctrl+` `` وجرّب `getDevices()` في الطرفية
5. تحقق من النتيجة بـ `auditNetwork()` أو `pingAll()` أو [Lab Check](../docs/api/checks.md)

## مثال سريع

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

عشرون سطرًا تنتج موجّهًا ومحوّلًا وأربعة حواسيب بعناوين وموجّهًا محصّنًا بـ SSH وشبكات VLAN ومنافذ وصول محمية ومخططًا مُعنونًا ولقطة أساس محفوظة واختبار وصول كاملًا.

## الميزات

| المجال | ما يمكنك فعله |
|---|---|
| **الأجهزة** | إضافة وحذف وإعادة تسمية ونقل وإعادة تشغيل وتركيب وحدات وقراءة المنافذ وحفظ بيانات مخصصة ووضع الأجهزة في مساحة العمل الفيزيائية |
| **الروابط** | كل أنواع الكابلات وحذف الروابط والتوصيل التلقائي وسرد الجيران وفحص حالة الرابط |
| **المضيفات** | IPv4 ثابت أو DHCP وIPv6 مع SLAAC والبوابة وDNS والجدار الناري وموجّه الأوامر |
| **Cisco IOS** | الإعداد الأساسي وكلمات المرور واللافتات والمستخدمون والواجهات والواجهات الفرعية وloopback وrouter-on-a-stick ومجمّعات DHCP وrelay وNTP وsyslog وSNMP وCDP وLLDP وأوامر show |
| **التحويل** | VLAN ومنافذ الوصول والصوت وtrunk وDTP وEtherChannel (LACP وPAgP وثابت والطبقة 3) وRapid PVST+ وPortFast وBPDU Guard وVTP وport security وDHCP snooping وDAI |
| **التوجيه** | المسارات الثابتة والعائمة وOSPF وOSPFv3 وEIGRP وEIGRP لـ IPv6 وRIP وRIPng وBGP وإعادة التوزيع |
| **الأمان** | قوائم ACL القياسية والموسعة والمسماة وIPv6 وNAT وPAT ومجمّعات NAT وإعادة توجيه المنافذ وSSH وحظر تسجيل الدخول وAAA مع RADIUS وTACACS+ |
| **التكرار** | HSRP على موجّه واحد أو كزوج نشط واحتياطي |
| **الخوادم** | DHCP وDNS (A وCNAME وNS) وHTTP وHTTPS وصفحات الويب ومستخدمو FTP وحسابات البريد وTFTP وsyslog وRADIUS |
| **اللاسلكي** | SSID وWPA2 وWPA وWEP ووضع الراديو وSSID مخفي وتصفية MAC |
| **الفحص** | حالة منافذ المحوّل وعدادات port security وقاعدة VLAN وجذر STP والمنافذ الجذرية وVTP وعناوين MAC الثابتة وعمليات OSPF وEIGRP |
| **الوصول** | `pingAll` و`pingMatrix` و`reachability` مع الفقد وأزمنة الذهاب والإياب وعرض المصفوفة |
| **اللقطات** | `takeSnapshot` و`getSnapshots` و`compareSnapshots` و`showSnapshotDiff` وحفظ ملفات اللقطات وتحميلها وعرض مقارنة الإعدادات |
| **الملفات** | قراءة الملفات النصية وكتابتها وتشغيل السكربتات من القرص وتصدير الإعدادات والطوبولوجيا وسجل الأوامر |
| **اللوحة** | ملاحظات وخطوط ودوائر ومستطيلات وأسهم وخطوط متقطعة ومناطق وتسميات الأجهزة والروابط وطبقات |
| **الطوبولوجيا** | مولّدات النجمة والحلقة والخط والشبكة المتداخلة وLAN وترتيب شبكي ودائري ومخطِّطا VLSM و‎/30 |
| **المحاكاة** | وضع المحاكاة وPDU ومرشحات البروتوكولات والتنفيذ خطوة بخطوة وping وtraceroute |
| **Lab Check** | فحوص مُقيَّمة بنقاط وتلميحات وتقرير: الأجهزة والكابلات والعناوين والمنافذ وأسماء المضيفات وVLAN وأسطر الإعدادات واختبارات مخصصة |
| **التدقيق** | عناوين IP مكررة وتعارض الشبكات الفرعية عبر كابل وروابط معطلة ومضيفات بلا عنوان ومنافذ وصول في VLAN 1 وغياب port security ومنافذ مفعّلة غير مستخدمة |
| **الدُفعات** | `runOnAll("show ip int brief")` و`runOnDevices` و`commandsToScript()` التي تحوّل الأوامر المكتوبة في CLI إلى سكربت قابل لإعادة الاستخدام |
| **مساحة العمل** | التكبير والخلفية والشبكات البعيدة وفتح المشاريع وحفظها وأحداث مساحة العمل |

لكل دالة مساعدة في IOS توأم `build...` يعيد الأوامر بدل إرسالها، لتتمكن من عرض الإعدادات ودمجها وإعادة استخدامها.

## المحرر

<div align="center"><img src="../assets/banners/editor.svg" alt="Editor" width="100%"></div>

تبدو بيئة العمل وتتصرف مثل VS Code. كُتبت من الصفر بـ ES5 خالص، لذا تعمل داخل web view في Packet Tracer بلا إطار عمل وبلا وصول للشبكة.

| الجزء | الوصف |
|---|---|
| **شريط القوائم ولوحة الأوامر** | قوائم File وEdit وSelection وView وGo وRun وNetwork وTerminal وHelp. يعرض `Ctrl+Shift+P` كل الأوامر، و`Ctrl+P` ينتقل إلى ملف، و`Ctrl+G` إلى سطر |
| **المستكشف** | المحررات المفتوحة ومساحة عمل بسكربتات محفوظة في Packet Tracer ومجلد حقيقي على القرص. جديد وإعادة تسمية وحذف |
| **الملفات** | تستخدم Open وSave وSave As نوافذ الملفات في Packet Tracer. استيراد من الحافظة وتصدير كتنزيل |
| **التبويبات** | تبويب لكل ملف مع نقطة التعديل وإغلاق بالنقر الأوسط وتنبيه الحفظ لملفات القرص وسجل تراجع مستقل لكل تبويب |
| **التلوين** | ألوان Dark Modern: التعليقات `#6A9955` والنصوص `#CE9178` والأرقام `#B5CEA8` والكلمات المفتاحية `#569CD6` و`#C586C0` والدوال `#DCDCAA` والمتغيرات `#9CDCFE` ودوال PTForge بخط عريض `#4FC1FF` وأزواج أقواس ملوّنة |
| **IntelliSense** | اقتراحات من كل الدوال الـ388 مع التوقيع والوصف وكلمات الملف والكلمات المفتاحية. تلميحات المعاملات أثناء الكتابة |
| **المشكلات** | فحص صياغة مباشر بالسطر الدقيق وأسماء دوال مجهولة مع إصلاح سريع *Did you mean*. خطوط متموجة وعلامات في الهامش ولوحة Problems |
| **التحرير** | إغلاق تلقائي للأزواج وEnter ذكي و`Ctrl+/` للتعليق و`Alt+Up/Down` لنقل السطر و`Shift+Alt+Down` لنسخه و`Ctrl+Shift+K` لحذفه ومطابقة الأقواس |
| **البحث والاستبدال** | `Ctrl+F` و`Ctrl+H` مع حالة الأحرف والكلمة الكاملة والتعابير النمطية، واستبدال الكل بخطوة تراجع واحدة |
| **اللوحة** | Problems وOutput وDebug Console وTerminal وLab Check. قابلة لتغيير الحجم، و`Ctrl+J` يخفيها |
| **عرض Devices** | أجهزة ومنافذ مباشرة مع مؤشرات الرابط والعناوين، واللقطات وأدوات الشبكة بنقرة واحدة |
| **شريط الحالة** | عدد المشكلات وحالة التشغيل والتصحيح وموضع المؤشر والتكبير والاتصال بـ Packet Tracer |

<table>
<tr>
<td><img src="../assets/screenshots/lab-check.png" alt="تقرير Lab Check وعرض Devices المباشر" width="100%"><br><sub>تقرير Lab Check وعرض Devices المباشر</sub></td>
<td><img src="../assets/screenshots/command-palette.png" alt="لوحة الأوامر ومرجع الدوال" width="100%"><br><sub>لوحة الأوامر ومرجع الدوال</sub></td>
</tr>
<tr>
<td><img src="../assets/screenshots/problems.png" alt="Problems مع الإصلاح السريع" width="100%"><br><sub>Problems مع الإصلاح السريع</sub></td>
<td><img src="../assets/screenshots/find-replace.png" alt="البحث والاستبدال" width="100%"><br><sub>البحث والاستبدال</sub></td>
</tr>
</table>

## الطرفية

<div align="center"><img src="../assets/banners/terminal.svg" alt="Terminal" width="100%"></div>

يفتح `` Ctrl+` `` طرفية JavaScript. يُنفَّذ كل سطر فورًا في Packet Tracer ويحتفظ بمتغيراته، فتستكشف الطوبولوجيا وتغيّرها خطوة بخطوة دون كتابة سكربت أولًا.

| الميزة | الوصف |
|---|---|
| **تقييم مباشر** | أي تعبير أو جملة؛ النتائج كأشجار مقروءة والأخطاء بالأحمر |
| **الإكمال** | يكمل `Tab` دوال PTForge ومتغيراتك والكلمات المفتاحية وأوامر النقطة |
| **السجل** | يتنقل `Up` و`Down` بين الأوامر السابقة المحفوظة بين الجلسات |
| **طرفيات متعددة** | يفتح `+` طرفية أخرى، وتبدّل القائمة بينها، وتغلق سلة المهملات إحداها |
| **أوامر النقطة** | `.help` و`.clear` و`.devices` و`.ping` و`.trace` و`.show R1 show ip route` و`.cli R1` لأوامر IOS على جهاز و`.exit` للخروج و`.audit` و`.snap` و`.diff` و`.calc 10.1.2.3/20` و`.run file.js` و`.history` |

<div align="center"><img src="../assets/screenshots/terminal.png" alt="Terminal" width="95%"></div>

اقرأ [دليل الطرفية](../docs/guides/terminal.md).

## مصحح الأخطاء

<div align="center"><img src="../assets/banners/debugger.svg" alt="Debugger" width="100%"></div>

يبدأ `F5` جلسة تصحيح. يجهّز PTForge السكربت ويشغّله مرة واحدة في Packet Tracer مسجّلًا كل خطوة، ثم يتوقف عند أول نقطة توقف. ولأن التشغيل كله مسجّل يمكنك أيضًا الرجوع **للخلف**.

| الميزة | الوصف |
|---|---|
| **نقاط التوقف** | انقر الهامش أو `F9`. شروط وعدد مرات الإصابة وlogpoint وتعطيل الكل أو حذفه |
| **الاستثناءات** | يتوقف عند الاستثناءات غير الملتقطة مع إبراز السطر |
| **الخطوات** | متابعة `F5` وتخطٍّ `F10` ودخول `F11` وخروج `Shift+F11` ورجوع وإعادة تشغيل `Ctrl+Shift+F5` وإيقاف `Shift+F5` |
| **Variables** | نطاقات Local وClosure وScript كأشجار قابلة للتوسيع |
| **Watch** | أي تعبير يُقيَّم عند كل خطوة مسجّلة |
| **Call Stack** | كل إطار مع الملف والسطر. انقر إطارًا لرؤية متغيراته |
| **Debug Console** | قيّم التعابير في الإطار المتوقف |
| **التمرير** | مرّر المؤشر فوق متغير في المحرر لرؤية قيمته |

<div align="center"><img src="../assets/screenshots/debugger.png" alt="Debugger" width="95%"></div>

اقرأ [دليل مصحح الأخطاء](../docs/guides/debugger.md).

## أدوات الشبكة

<div align="center"><img src="../assets/banners/network-tools.svg" alt="Network tools" width="100%"></div>

```js
pingAll();
takeSnapshot("before");
configureOspf("R1", { routerId: "1.1.1.1", networks: ["10.0.0.0/30"] });
compareSnapshots("before");
```

<table>
<tr>
<td><img src="../assets/screenshots/reachability.png" alt="مصفوفة الوصول من pingAll()" width="100%"><br><sub>مصفوفة الوصول من <code>pingAll()</code></sub></td>
<td><img src="../assets/screenshots/snapshot-diff.png" alt="مقارنة اللقطات مع فروق الإعدادات" width="100%"><br><sub>مقارنة اللقطات مع فروق الإعدادات</sub></td>
</tr>
<tr>
<td><img src="../assets/screenshots/calculator.png" alt="حاسبة شبكات IPv4 الفرعية" width="100%"><br><sub>حاسبة شبكات IPv4 الفرعية</sub></td>
<td><img src="../assets/screenshots/vlsm.png" alt="مخطِّط VLSM" width="100%"><br><sub>مخطِّط VLSM</sub></td>
</tr>
</table>

اقرأ [أدوات الشبكة](../docs/guides/network-tools.md) و[الوصول](../docs/api/simulation.md#reachability) و[اللقطات](../docs/api/snapshots.md).

## التحقق والتدقيق

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

اقرأ [Lab Check](../docs/api/checks.md) و[التدقيق](../docs/api/audit.md) و[أوامر الدُفعات](../docs/api/ios.md#batch-commands).

## التثبيت

PTForge هو Script Module لـ Packet Tracer. يشفّر Packet Tracer حزم `.pts` ولا يستطيع إنشاءها غيره، لذا تبني الوحدة مرة واحدة من ملفات هذا المستودع.

1. نزّل [أحدث إصدار](https://github.com/r4chan842/PTForge/releases/latest) أو انسخ المستودع
2. في Packet Tracer افتح `Extensions` ← `Scripting` ← `Configure PT Script Modules`
3. أنشئ وحدة باسم `PTForge`
4. أضف ملف سكربت بمحتوى [`release/ptforge.js`](../release/ptforge.js)
5. أضف الملفات الأربعة عشر من [`src/ui`](../src/ui) كملفات واجهة: `index.html`, `style.css`, `catalog.js`, `snippets.js`, `highlight.js`, `lint.js`, `netcalc.js`, `editor.js`, `acorn.js`, `instrument.js`, `terminal.js`, `debugview.js`, `views.js`, `interface.js`
6. احفظ الوحدة وشغّلها ثم افتح `Extensions` ← `PTForge Editor`

يشرح [دليل التثبيت](../docs/guides/installation.md) كل خطوة وطريقة التحديث.

## الأمثلة

34 مختبرًا كاملًا في [`examples/`](../examples/README.md)، يبدأ كل منها بمساحة عمل فارغة:

| المجلد | المختبرات |
|---|---|
| `01-basics` | أول شبكة والوحدات والروابط التسلسلية وإعداد أساسي آمن |
| `02-switching` | VLAN وtrunk وEtherChannel وجذر STP ومحوّل الطبقة 3 |
| `03-routing` | ثابت وOSPF متعدد المناطق وEIGRP وBGP وIPv6 مع OSPFv3 |
| `04-security` | ACL وNAT وPAT وSSH وport security وHSRP |
| `05-services` | DHCP وDNS والويب على الخادم وFTP والبريد وDHCP على الموجّه مع relay |
| `06-wireless` | شبكة لاسلكية منزلية |
| `07-canvas` | التسميات والمناطق |
| `08-topology` | حرم جامعي مولَّد ونجمة وحلقة وشبكة متداخلة وخطة VLSM |
| `09-simulation` | اختبار ping |
| `10-ccna-labs` | Router-on-a-stick ومختبر مؤسسي كامل |
| `11-inspection` | التحقق من التحويل وتدقيق port security |
| `12-automation` | نسخ الإعدادات احتياطيًا وتدقيق الأوامر ومكتبة السكربتات |
| `13-operations` | اختبار الوصول وتتبع التغييرات باللقطات |

نقاط انطلاق لعملك في [`templates/`](../templates/README.md): مختبر فارغ وحرم جامعي وWAN للفروع ومكتب صغير.

## التوثيق

| القسم | المحتوى |
|---|---|
| [البداية](../docs/guides/getting-started.md) | أول شبكة لك في عشر دقائق |
| [دليل المحرر](../docs/guides/editor.md) | مساحة العمل والملفات وIntelliSense والمشكلات |
| [الطرفية](../docs/guides/terminal.md) | JavaScript تفاعلي وCLI الأجهزة |
| [مصحح الأخطاء](../docs/guides/debugger.md) | نقاط التوقف والخطوات والمتغيرات وwatch |
| [أدوات الشبكة](../docs/guides/network-tools.md) | الحاسبة والوصول واللقطات |
| [كتابة السكربتات](../docs/guides/writing-scripts.md) | البنية والترتيب ودوال build والسرعة |
| [مرجع API](../docs/api/README.md) | كل دالة مع المعاملات والقيم المعادة والأمثلة |
| [الوصفات](../docs/recipes/README.md) | تحويل الحرم الجامعي ومختبرات التوجيه وموجّه الحافة والخوادم والمخططات |
| [خريطة مواضيع CCNA](../docs/ccna/README.md) | مواضيع CCNA 200-301 مع الدوال والأمثلة المقابلة |
| [أوراق مرجعية](../docs/cheatsheets/ios-to-ptforge.md) | من IOS إلى PTForge والشبكات الفرعية واختصارات المحرر |
| [المعمارية](../docs/architecture/overview.md) | الطبقات وبيئة التشغيل وجسر المحرر ومصحح الأخطاء والاختبارات |
| [حل المشكلات](../docs/guides/troubleshooting.md) | الأخطاء الشائعة وحلولها |
| [القيود](../docs/guides/limitations.md) | ما لا تسمح به واجهة Packet Tracer البرمجية |
| [الأسئلة الشائعة](../docs/guides/faq.md) | إجابات قصيرة |

## بنية المشروع

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

## التطوير

يتطلب Node.js 18 أو أحدث. لا توجد اعتماديات وقت تشغيل.

```
git clone https://github.com/r4chan842/PTForge.git
cd PTForge
npm run check
```

| الأمر | الغرض |
|---|---|
| `npm test` | تشغيل كل الاختبارات |
| `npm run bundle` | إعادة بناء `release/ptforge.js` |
| `npm run catalog` | توليد قائمة دوال المحرر من `docs/api` |
| `npm run reference` | توليد الجداول المرجعية من `src/data` |
| `npm run check` | قائمة الدوال والحزمة وفحص الصياغة والاختبارات |
| `npm run ui-test` | 41 فحصًا في المتصفح لبيئة العمل والطرفية ومصحح الأخطاء عبر Playwright |
| `npm run screenshots` | إعادة توليد لقطات الشاشة في `assets/screenshots` |

تشغّل مجموعة الاختبارات الإضافة كاملة على نسخة مطابقة من واجهة IPC في Packet Tracer. وهي تغطي كل دالة عامة وكل مثال وقالب ووصفة والحزمة ومحرّكي الطرفية ومصحح الأخطاء وقواعد المشروع. التفاصيل في [الاختبارات](../docs/architecture/testing.md).

## المساهمة

نرحب ببلاغات الأخطاء والأفكار وطلبات الدمج. ابدأ بـ [CONTRIBUTING](../CONTRIBUTING.md) واطّلع على [خارطة الطريق](../ROADMAP.md) والتزم بـ [مدونة السلوك](../CODE_OF_CONDUCT.md). أبلغ عن مشكلات الأمان عبر [سياسة الأمان](../SECURITY.md). الأسئلة: [SUPPORT](../SUPPORT.md).

## الترخيص

يُنشر PTForge بموجب [ترخيص MIT](../LICENSE). يستخدم مصحح الأخطاء [Acorn](https://github.com/acornjs/acorn) (MIT)، راجع [THIRD_PARTY_NOTICES](../THIRD_PARTY_NOTICES.md).

## شكر وتقدير

يتبع استخدام واجهة Packet Tracer البرمجية [التوثيق الرسمي لواجهة Cisco Packet Tracer IPC](https://tutorials.ptnetacad.net/help/default/IpcAPI/classes.html). ألوان بيئة العمل مأخوذة من سمة Dark Modern في VS Code.

Cisco وPacket Tracer علامتان تجاريتان لشركة Cisco Systems, Inc. هذا المشروع غير تابع لشركة Cisco Systems, Inc. وغير معتمد منها.

<div align="center">
<sub>صُنع لطلاب الشبكات ومعلميها ولكل من لا يريد بناء المختبر نفسه يدويًا مرتين.</sub>
</div>

</div>
