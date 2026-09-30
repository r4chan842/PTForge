<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="../assets/brand/logo-dark.svg">
  <img src="../assets/brand/logo.svg" alt="PTForge" width="300">
</picture>

<br><br>

**Создавайте, настраивайте, отлаживайте и проверяйте целые сети Cisco Packet Tracer на JavaScript.**

[![Release](https://img.shields.io/github/v/release/r4chan842/PTForge?color=1A5DB7)](https://github.com/r4chan842/PTForge/releases/latest)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](../LICENSE)
![Functions](https://img.shields.io/badge/functions-388-1A5DB7)
![Packet Tracer](https://img.shields.io/badge/Packet%20Tracer-8.x%2B-1ba0d7)
![Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)

[Быстрый старт](#быстрый-старт) ·
[Установка](../docs/guides/installation.md) ·
[Документация](../docs/README.md) ·
[API](../docs/api/README.md) ·
[Примеры](../examples/README.md) ·
[Карта CCNA](../docs/ccna/README.md)

[English](../README.md) ·
[فارسی](README.fa.md) ·
[Deutsch](README.de.md) ·
[Español](README.es.md) ·
[Français](README.fr.md) ·
[Português](README.pt-BR.md) ·
**Русский** ·
[Türkçe](README.tr.md) ·
[العربية](README.ar.md) ·
[中文](README.zh-CN.md) ·
[日本語](README.ja.md)

</div>

---

> Это перевод. Основной версией считается [README на английском](../README.md).

## Зачем PTForge

Собрать лабораторную в Packet Tracer означает перетаскивать устройства, выбирать кабели, открывать каждую CLI и снова и снова вводить одни и те же команды. Опечатка в списке VLAN или в wildcard-маске может стоить часа.

PTForge заменяет клики скриптом. Вы один раз описываете сеть, нажимаете **Run**, и Packet Tracer строит её: устройства, модули, кабели, конфигурацию IOS, серверные службы, беспроводную сеть, подписи и зоны. Затем PTForge считывает реальное состояние, чтобы тот же скрипт проверил свою работу.

- **Повторяемо**: пересоберите лабораторную с нуля за секунды, сколько угодно раз
- **Удобно делиться**: лабораторная это текстовый файл, который можно отправить, проверить и хранить в Git
- **Без ошибок**: адреса, маски и wildcard вычисляются, а опечатки дают понятные сообщения
- **Проверяемо**: функции инспекции читают VLAN, транки, STP, port security и процессы маршрутизации прямо из Packet Tracer
- **Отлаживаемо**: ставьте точки останова, выполняйте скрипт по шагам и смотрите каждую переменную, как в VS Code
- **Интерактивно**: JavaScript-терминал меняет открытую топологию строка за строкой

<div align="center">
<img src="../assets/screenshots/editor.png" alt="PTForge" width="95%">
<br><sub>Рабочая среда PTForge внутри Packet Tracer: проводник, вкладки, IntelliSense, подсветка Dark Modern и вывод</sub>
</div>

## Что нового в 1.2

|  |  |
|---|---|
| 🖥️ **JavaScript-терминал** | `` Ctrl+` `` открывает терминал, как *New Terminal* в VS Code. Каждая строка выполняется прямо на открытой топологии, есть история, дополнение по Tab и команды с точкой, например `.calc`, `.ping` и `.cli R1` |
| 🐞 **Отладчик** | `F5` выполняет скрипт и записывает каждый шаг. Остановка на точках останова, условиях и исключениях; шаг с обходом, с заходом, с выходом и **назад**; просмотр Variables, Watch и Call Stack и вычисление выражений в Debug Console |
| 🧮 **Сетевой калькулятор** | Подсеть IPv4, разбиение на подсети, планировщик VLSM, суммирование маршрутов, диапазон в CIDR, wildcard-маски, IPv6, EUI-64 и перевод систем счисления во вкладке редактора |
| 📡 **Матрица достижимости** | `pingAll()` пингует каждый адрес с каждого маршрутизатора и коммутатора и показывает цветную матрицу с потерями и временем отклика |
| 📸 **Снимки и diff** | `takeSnapshot()` сохраняет устройства, связи, адреса, порты, питание и running-config. Сравните два снимка и посмотрите конфигурацию построчно |
| 🎨 **Dark Modern** | Цвета, отступы, вкладки, панели и строка состояния точно повторяют тему Dark Modern из VS Code; при отладке строка состояния становится синей |

## Быстрый старт

1. Скачайте [последний релиз](https://github.com/r4chan842/PTForge/releases/latest) и следуйте [руководству по установке](../docs/guides/installation.md)
2. Откройте `Extensions` → `PTForge Editor`
3. Откройте скрипт из [`examples/`](../examples/README.md) через `Ctrl+O` и нажмите `Ctrl+F5` для запуска или `F5` для отладки
4. Нажмите `` Ctrl+` `` и попробуйте `getDevices()` в терминале
5. Проверьте результат через `auditNetwork()`, `pingAll()` или [Lab Check](../docs/api/checks.md)

## Небольшой пример

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

Двадцать строк дают маршрутизатор, коммутатор, четыре ПК с адресами, защищённый маршрутизатор с SSH, VLAN, защищённые access-порты, подписанную схему, сохранённый базовый снимок и полную проверку достижимости.

## Возможности

| Область | Что можно сделать |
|---|---|
| 🖥️ **Устройства** | Добавлять, удалять, переименовывать, перемещать, перезагружать, ставить модули, читать порты, хранить свои данные, размещать устройства в физическом пространстве |
| 🔌 **Связи** | Любой тип кабеля, удаление связей, автоподключение, список соседей, проверка состояния связи |
| 💻 **Хосты** | Статический или DHCP IPv4, IPv6 со SLAAC, шлюз, DNS, межсетевой экран, командная строка |
| ⚙️ **Cisco IOS** | Базовая настройка, пароли, баннеры, пользователи, интерфейсы, сабинтерфейсы, loopback, router-on-a-stick, пулы и relay DHCP, NTP, syslog, SNMP, CDP, LLDP, команды show |
| 🔀 **Коммутация** | VLAN, access- и voice-порты, транки, DTP, EtherChannel (LACP, PAgP, статический, L3), Rapid PVST+, PortFast, BPDU Guard, VTP, port security, DHCP snooping, DAI |
| 🧭 **Маршрутизация** | Статические и плавающие маршруты, OSPF, OSPFv3, EIGRP, EIGRP для IPv6, RIP, RIPng, BGP, редистрибуция |
| 🛡️ **Безопасность** | Стандартные, расширенные, именованные и IPv6 ACL, NAT, PAT, пулы NAT, проброс портов, SSH, блокировка входа, AAA с RADIUS и TACACS+ |
| ♻️ **Резервирование** | HSRP на одном маршрутизаторе или парой active и standby |
| 🗄️ **Серверы** | DHCP, DNS (A, CNAME, NS), HTTP, HTTPS, веб-страницы, пользователи FTP, почтовые ящики, TFTP, syslog, RADIUS |
| 📶 **Беспроводная сеть** | SSID, WPA2, WPA, WEP, режим радио, скрытый SSID, фильтр MAC |
| 🔍 **Инспекция** | Состояние портов коммутатора, счётчики port security, база VLAN, корень STP и корневые порты, VTP, статические MAC, процессы OSPF и EIGRP |
| 📡 **Достижимость** | `pingAll`, `pingMatrix` и `reachability` с потерями, временем отклика и матричным видом |
| 📸 **Снимки** | `takeSnapshot`, `getSnapshots`, `compareSnapshots`, `showSnapshotDiff`, сохранение и загрузка файлов снимков и просмотр diff конфигурации |
| 📁 **Файлы** | Чтение и запись текстовых файлов, запуск скриптов с диска, экспорт конфигураций и топологии, журнал команд |
| 🎨 **Холст** | Заметки, линии, круги, прямоугольники, стрелки, пунктир, зоны, подписи устройств и связей, слои |
| 🗺️ **Топология** | Генераторы звезды, кольца, линии, сетки и LAN, раскладка сеткой и по кругу, планировщики VLSM и /30 |
| 🧪 **Симуляция** | Режим симуляции, PDU, фильтры протоколов, пошаговое выполнение, ping, traceroute |
| ✅ **Lab Check** | Оцениваемые проверки с баллами, подсказками и отчётом: устройства, кабели, адреса, порты, имена хостов, VLAN, строки конфигурации, свои тесты |
| 🩺 **Аудит** | Дублирующиеся IP, конфликты подсетей на одном кабеле, упавшие связи, хосты без адреса, access-порты в VLAN 1, отсутствие port security, неиспользуемые активные порты |
| 📟 **Пакетный режим** | `runOnAll("show ip int brief")`, `runOnDevices` и `commandsToScript()`, превращающий команды из CLI в готовый скрипт |
| 🪟 **Рабочая область** | Масштаб, фон, удалённые сети, открытие и сохранение проектов, события рабочей области |

У каждой функции IOS есть двойник `build...`, который возвращает команды вместо отправки, чтобы их можно было посмотреть, объединить и использовать повторно.

## Редактор

<div align="center"><img src="../assets/banners/editor.svg" alt="Editor" width="100%"></div>

Рабочая среда выглядит и ведёт себя как VS Code. Она написана с нуля на чистом ES5, поэтому работает в web view Packet Tracer без фреймворков и без доступа к сети.

| Часть | Описание |
|---|---|
| **Меню и палитра команд** | Меню File, Edit, Selection, View, Go, Run, Network, Terminal и Help. `Ctrl+Shift+P` показывает все команды, `Ctrl+P` переход к файлу, `Ctrl+G` к строке |
| **Проводник** | Открытые редакторы, рабочая область со скриптами в Packet Tracer и реальная папка на диске. Создание, переименование, удаление |
| **Файлы** | Open, Save и Save As используют файловые диалоги Packet Tracer. Импорт из буфера обмена, экспорт загрузкой |
| **Вкладки** | Вкладка на файл с точкой изменений, закрытие средней кнопкой, запрос сохранения для файлов на диске, своя история отмены у каждой вкладки |
| **Подсветка** | Цвета Dark Modern: комментарии `#6A9955`, строки `#CE9178`, числа `#B5CEA8`, ключевые слова `#569CD6` и `#C586C0`, функции `#DCDCAA`, переменные `#9CDCFE`, функции PTForge жирным `#4FC1FF`, цветные пары скобок |
| **IntelliSense** | Подсказки из всех 388 функций с сигнатурой и описанием, слова из файла, ключевые слова. Подсказки параметров при вводе |
| **Проблемы** | Проверка синтаксиса на лету с точной строкой, неизвестные функции с быстрым исправлением *Did you mean*. Подчёркивания, метки на полях и панель Problems |
| **Правка** | Автозакрытие пар, умный Enter, `Ctrl+/` комментарий, `Alt+Up/Down` перенос строки, `Shift+Alt+Down` копия строки, `Ctrl+Shift+K` удаление строки, подсветка парных скобок |
| **Поиск и замена** | `Ctrl+F` и `Ctrl+H` с учётом регистра, целым словом и регулярными выражениями, Заменить всё одной отменой |
| **Панель** | Problems, Output, Debug Console, Terminal и Lab Check. Меняет размер, `Ctrl+J` скрывает её |
| **Вид Devices** | Устройства и порты в реальном времени с индикаторами связи и адресами, снимки и сетевые инструменты в один клик |
| **Строка состояния** | Число проблем, состояние запуска и отладки, позиция курсора, масштаб, связь с Packet Tracer |

<table>
<tr>
<td><img src="../assets/screenshots/lab-check.png" alt="Отчёт Lab Check и вид Devices" width="100%"><br><sub>Отчёт Lab Check и вид Devices</sub></td>
<td><img src="../assets/screenshots/command-palette.png" alt="Палитра команд и справочник функций" width="100%"><br><sub>Палитра команд и справочник функций</sub></td>
</tr>
<tr>
<td><img src="../assets/screenshots/problems.png" alt="Problems с быстрым исправлением" width="100%"><br><sub>Problems с быстрым исправлением</sub></td>
<td><img src="../assets/screenshots/find-replace.png" alt="Поиск и замена" width="100%"><br><sub>Поиск и замена</sub></td>
</tr>
</table>

## Терминал

<div align="center"><img src="../assets/banners/terminal.svg" alt="Terminal" width="100%"></div>

`` Ctrl+` `` открывает JavaScript-терминал. Каждая строка сразу выполняется в Packet Tracer и сохраняет свои переменные, так что можно изучать и менять топологию шаг за шагом, не создавая скрипт.

| Функция | Описание |
|---|---|
| **Прямое выполнение** | Любое выражение или оператор; результаты в виде читаемых деревьев, ошибки красным |
| **Дополнение** | `Tab` дополняет функции PTForge, ваши переменные, ключевые слова и команды с точкой |
| **История** | `Up` и `Down` листают прошлые команды, которые сохраняются между сессиями |
| **Несколько терминалов** | `+` открывает ещё один терминал, список переключает их, корзина закрывает |
| **Команды с точкой** | `.help`, `.clear`, `.devices`, `.ping`, `.trace`, `.show R1 show ip route`, `.cli R1` для команд IOS на устройстве, `.exit` для выхода, `.audit`, `.snap`, `.diff`, `.calc 10.1.2.3/20`, `.run file.js`, `.history` |

<div align="center"><img src="../assets/screenshots/terminal.png" alt="Terminal" width="95%"></div>

Читайте [руководство по терминалу](../docs/guides/terminal.md).

## Отладчик

<div align="center"><img src="../assets/banners/debugger.svg" alt="Debugger" width="100%"></div>

`F5` запускает сеанс отладки. PTForge инструментирует скрипт, один раз выполняет его в Packet Tracer, записывая каждый шаг, и останавливается на первой точке останова. Весь запуск записан, поэтому можно идти и **назад**.

| Функция | Описание |
|---|---|
| **Точки останова** | Клик по полю или `F9`. Условия, счётчик срабатываний, logpoint, отключить или удалить все |
| **Исключения** | Остановка на необработанных исключениях с подсветкой строки |
| **Шаги** | Продолжить `F5`, шаг с обходом `F10`, с заходом `F11`, с выходом `Shift+F11`, назад, перезапуск `Ctrl+Shift+F5`, стоп `Shift+F5` |
| **Variables** | Области Local, Closure и Script в виде раскрывающихся деревьев |
| **Watch** | Любые выражения, вычисляемые на каждом записанном шаге |
| **Call Stack** | Каждый кадр с файлом и строкой. Клик по кадру показывает его переменные |
| **Debug Console** | Вычисление выражений в остановленном кадре |
| **Наведение** | Наведите курсор на переменную в редакторе, чтобы увидеть значение |

<div align="center"><img src="../assets/screenshots/debugger.png" alt="Debugger" width="95%"></div>

Читайте [руководство по отладчику](../docs/guides/debugger.md).

## Сетевые инструменты

<div align="center"><img src="../assets/banners/network-tools.svg" alt="Network tools" width="100%"></div>

```js
pingAll();
takeSnapshot("before");
configureOspf("R1", { routerId: "1.1.1.1", networks: ["10.0.0.0/30"] });
compareSnapshots("before");
```

<table>
<tr>
<td><img src="../assets/screenshots/reachability.png" alt="Матрица достижимости pingAll()" width="100%"><br><sub>Матрица достижимости <code>pingAll()</code></sub></td>
<td><img src="../assets/screenshots/snapshot-diff.png" alt="Сравнение снимков с diff конфигурации" width="100%"><br><sub>Сравнение снимков с diff конфигурации</sub></td>
</tr>
<tr>
<td><img src="../assets/screenshots/calculator.png" alt="Калькулятор подсетей IPv4" width="100%"><br><sub>Калькулятор подсетей IPv4</sub></td>
<td><img src="../assets/screenshots/vlsm.png" alt="Планировщик VLSM" width="100%"><br><sub>Планировщик VLSM</sub></td>
</tr>
</table>

Читайте [Сетевые инструменты](../docs/guides/network-tools.md), [Достижимость](../docs/api/simulation.md#reachability) и [Снимки](../docs/api/snapshots.md).

## Проверка и аудит

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

Читайте [Lab Check](../docs/api/checks.md), [Аудит](../docs/api/audit.md) и [Пакетные команды](../docs/api/ios.md#batch-commands).

## Установка

PTForge это Script Module для Packet Tracer. Packet Tracer шифрует пакеты `.pts`, и создать их может только он, поэтому модуль собирается один раз из файлов этого репозитория.

1. Скачайте [последний релиз](https://github.com/r4chan842/PTForge/releases/latest) или клонируйте репозиторий
2. В Packet Tracer откройте `Extensions` → `Scripting` → `Configure PT Script Modules`
3. Создайте модуль с именем `PTForge`
4. Добавьте файл скрипта с содержимым [`release/ptforge.js`](../release/ptforge.js)
5. Добавьте четырнадцать файлов из [`src/ui`](../src/ui) как файлы интерфейса: `index.html`, `style.css`, `catalog.js`, `snippets.js`, `highlight.js`, `lint.js`, `netcalc.js`, `editor.js`, `acorn.js`, `instrument.js`, `terminal.js`, `debugview.js`, `views.js`, `interface.js`
6. Сохраните и запустите модуль, затем откройте `Extensions` → `PTForge Editor`

В [руководстве по установке](../docs/guides/installation.md) описан каждый шаг и обновление.

## Примеры

34 готовые лабораторные в [`examples/`](../examples/README.md), каждая начинается с пустой рабочей области:

| Папка | Лабораторные |
|---|---|
| `01-basics` | Первая сеть, модули и последовательные связи, безопасная базовая настройка |
| `02-switching` | VLAN и транки, EtherChannel, корень STP, коммутатор L3 |
| `03-routing` | Статика, многозонный OSPF, EIGRP, BGP, IPv6 с OSPFv3 |
| `04-security` | ACL, NAT и PAT, SSH и port security, HSRP |
| `05-services` | DHCP, DNS и веб на сервере, FTP и почта, DHCP на маршрутизаторе с relay |
| `06-wireless` | Домашняя беспроводная сеть |
| `07-canvas` | Подписи и зоны |
| `08-topology` | Сгенерированный кампус, звезда, кольцо и сетка, план VLSM |
| `09-simulation` | Проверка ping |
| `10-ccna-labs` | Router-on-a-stick, полная корпоративная лабораторная |
| `11-inspection` | Проверка коммутации, аудит port security |
| `12-automation` | Резервное копирование конфигураций, аудит команд, библиотека скриптов |
| `13-operations` | Проверка достижимости, отслеживание изменений снимками |

Заготовки для своих работ лежат в [`templates/`](../templates/README.md): пустая лабораторная, кампус, WAN филиалов и небольшой офис.

## Документация

| Раздел | Содержание |
|---|---|
| [Начало работы](../docs/guides/getting-started.md) | Первая сеть за десять минут |
| [Руководство по редактору](../docs/guides/editor.md) | Рабочая область, файлы, IntelliSense, проблемы |
| [Терминал](../docs/guides/terminal.md) | Интерактивный JavaScript и CLI устройств |
| [Отладчик](../docs/guides/debugger.md) | Точки останова, шаги, переменные и watch |
| [Сетевые инструменты](../docs/guides/network-tools.md) | Калькулятор, достижимость и снимки |
| [Написание скриптов](../docs/guides/writing-scripts.md) | Структура, порядок, builder-функции, скорость |
| [Справочник API](../docs/api/README.md) | Каждая функция с аргументами, результатом и примерами |
| [Рецепты](../docs/recipes/README.md) | Коммутация кампуса, лабораторные по маршрутизации, пограничный маршрутизатор, серверы, схемы |
| [Карта тем CCNA](../docs/ccna/README.md) | Темы CCNA 200-301 с подходящими функциями и примерами |
| [Шпаргалки](../docs/cheatsheets/ios-to-ptforge.md) | Из IOS в PTForge, подсети, клавиши редактора |
| [Архитектура](../docs/architecture/overview.md) | Слои, среда выполнения, мост редактора, отладчик, тесты |
| [Устранение неполадок](../docs/guides/troubleshooting.md) | Частые ошибки и решения |
| [Ограничения](../docs/guides/limitations.md) | Чего не позволяет API Packet Tracer |
| [FAQ](../docs/guides/faq.md) | Короткие ответы |

## Структура проекта

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

## Разработка

Нужен Node.js 18 или новее. Зависимостей времени выполнения нет.

```
git clone https://github.com/r4chan842/PTForge.git
cd PTForge
npm run check
```

| Команда | Назначение |
|---|---|
| `npm test` | Запустить все тесты |
| `npm run bundle` | Пересобрать `release/ptforge.js` |
| `npm run catalog` | Сгенерировать список функций редактора из `docs/api` |
| `npm run reference` | Сгенерировать справочные таблицы из `src/data` |
| `npm run check` | Список функций, сборка, проверка синтаксиса и тесты |
| `npm run ui-test` | 41 браузерных проверок среды, терминала и отладчика через Playwright |
| `npm run screenshots` | Пересоздать скриншоты в `assets/screenshots` |

Набор тестов запускает всё расширение против копии IPC API Packet Tracer. Он покрывает каждую публичную функцию, каждый пример, шаблон и рецепт, сборку, движки терминала и отладчика и правила проекта. Подробности в разделе [Тестирование](../docs/architecture/testing.md).

## Участие

Сообщения об ошибках, идеи и pull request приветствуются. Начните с [CONTRIBUTING](../CONTRIBUTING.md), загляните в [дорожную карту](../ROADMAP.md) и соблюдайте [кодекс поведения](../CODE_OF_CONDUCT.md). О проблемах безопасности сообщайте по [политике безопасности](../SECURITY.md). Вопросы: [SUPPORT](../SUPPORT.md).

## Лицензия

PTForge распространяется по [лицензии MIT](../LICENSE). Отладчик использует [Acorn](https://github.com/acornjs/acorn) (MIT), см. [THIRD_PARTY_NOTICES](../THIRD_PARTY_NOTICES.md).

## Благодарности

Работа с API Packet Tracer основана на [официальной документации Cisco Packet Tracer IPC API](https://tutorials.ptnetacad.net/help/default/IpcAPI/classes.html). Цвета среды взяты из темы Dark Modern VS Code.

Cisco и Packet Tracer являются товарными знаками Cisco Systems, Inc. Проект не связан с Cisco Systems, Inc. и не одобрен ею.

<div align="center">
<sub>Сделано для студентов и преподавателей сетей и для всех, кто не хочет собирать одну и ту же лабораторную вручную дважды.</sub>
</div>
