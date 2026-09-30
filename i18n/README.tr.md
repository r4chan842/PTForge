<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="../assets/brand/logo-dark.svg">
  <img src="../assets/brand/logo.svg" alt="PTForge" width="300">
</picture>

<br><br>

**Eksiksiz Cisco Packet Tracer ağlarını JavaScript ile kurun, yapılandırın, hata ayıklayın ve doğrulayın.**

[![Release](https://img.shields.io/github/v/release/r4chan842/PTForge?color=1A5DB7)](https://github.com/r4chan842/PTForge/releases/latest)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](../LICENSE)
![Functions](https://img.shields.io/badge/functions-388-1A5DB7)
![Packet Tracer](https://img.shields.io/badge/Packet%20Tracer-8.x%2B-1ba0d7)
![Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)

[Hızlı başlangıç](#hızlı-başlangıç) ·
[Kurulum](../docs/guides/installation.md) ·
[Belgeler](../docs/README.md) ·
[API](../docs/api/README.md) ·
[Örnekler](../examples/README.md) ·
[CCNA haritası](../docs/ccna/README.md)

[English](../README.md) ·
[فارسی](README.fa.md) ·
[Deutsch](README.de.md) ·
[Español](README.es.md) ·
[Français](README.fr.md) ·
[Português](README.pt-BR.md) ·
[Русский](README.ru.md) ·
**Türkçe** ·
[العربية](README.ar.md) ·
[中文](README.zh-CN.md) ·
[日本語](README.ja.md)

</div>

---

> [!WARNING]
> **Geliştirme aşamasında.** PTForge'da hâlâ bilinen hatalar var ve bazı özellikler yalnızca Packet Tracer dışında test edildi. Sonuçları kontrol edin, `.pkt` dosyalarınızı yedekleyin ve lütfen [bulduğunuz sorunları bildirin](https://github.com/r4chan842/PTForge/issues).

> Bu bir çeviridir. Esas sürüm [İngilizce README](../README.md) dosyasıdır.

## Neden PTForge

Packet Tracer'da bir lab kurmak; cihazları sürüklemek, kablo seçmek, her CLI'yi açmak ve aynı komutları tekrar tekrar yazmak demektir. Bir VLAN listesindeki ya da wildcard maskesindeki tek bir yazım hatası bir saate mal olabilir.

PTForge tıklamaların yerine bir betik koyar. Ağı bir kez tanımlarsınız, **Run** tuşuna basarsınız ve Packet Tracer onu kurar: cihazlar, modüller, kablolar, IOS yapılandırması, sunucu hizmetleri, kablosuz ağ, etiketler ve bölgeler. Ardından PTForge canlı durumu geri okur, böylece aynı betik kendi işini kontrol edebilir.

- **Tekrarlanabilir**: bir labı saniyeler içinde sıfırdan, istediğiniz kadar yeniden kurun
- **Paylaşılabilir**: lab, gönderilebilen, incelenebilen ve Git'te saklanabilen bir metin dosyasıdır
- **Doğru**: adresler, maskeler ve wildcard'lar hesaplanır, yazım hataları açık hata mesajları verir
- **Doğrulanabilir**: inceleme fonksiyonları VLAN, trunk, STP, port security ve yönlendirme süreçlerini doğrudan Packet Tracer'dan okur
- **Hata ayıklanabilir**: kesme noktaları koyun, betiği adım adım çalıştırın ve her değişkeni VS Code'daki gibi okuyun
- **Etkileşimli**: bir JavaScript terminali açık topolojiyi satır satır değiştirir

<div align="center">
<img src="../assets/screenshots/editor.png" alt="PTForge" width="95%">
<br><sub>Packet Tracer içindeki PTForge çalışma alanı: gezgin, sekmeler, IntelliSense, Dark Modern vurgulama ve çıktı</sub>
</div>

## 1.3 sürümündeki yenilikler

|  |  |
|---|---|
| **Eklentiler** | Eklenti klasörüne `.pf` dosyaları koyarak terminal nokta komutları, genel fonksiyonlar, denetim kuralları ve Lab Check kontrolleri ekleyin. [`plugins`](../plugins) içinde üç hazır eklenti gelir |
| **Eklenti Yöneticisi** | `Ctrl+Shift+X` her eklentiyi sürümü, izinleri ve eklediği şeylerle listeler. Etkinleştirme onay ister, dosyası değişen eklenti siz inceleyene kadar kapalı kalır |
| **İzinler** | Eklentiler `topology`, `cli`, `files` veya `raw` istemedikçe yalnızca okur. İzin dışı çağrılar açık bir hatayla durur |
| **Codicons** | Tüm simgeler artık resmi VS Code Codicons (CC BY 4.0), aynı ızgara ve boyutlarda |
| **Eksiksiz host bilgisi** | `getPcIp()` ağ geçidi, DNS, MAC, IPv6, link-local ve bağlantı durumunu döndürür. `getPortInfo()` kablonun diğer ucundaki cihazı söyler. Terminal derin nesneleri ve uzun dizileri tam gösterir |
| **Arka planda ping ve traceroute** | `ping()`, `traceroute()` ve `pingAll()` Packet Tracer'ın bitmesini bekler, sonuçlar artık sıfır çıkmaz. `traceroute()` her atlamayı döndürür |

## Hızlı başlangıç

1. [Son sürümü](https://github.com/r4chan842/PTForge/releases/latest) indirin ve [kurulum kılavuzunu](../docs/guides/installation.md) izleyin
2. `Extensions` → `PTForge Editor` menüsünü açın
3. [`examples/`](../examples/README.md) içinden bir betiği `Ctrl+O` ile açın; çalıştırmak için `Ctrl+F5`, hata ayıklamak için `F5` tuşuna basın
4. `` Ctrl+` `` tuşuna basın ve terminalde `getDevices()` deneyin
5. Sonucu `auditNetwork()`, `pingAll()` veya bir [Lab Check](../docs/api/checks.md) ile doğrulayın

## Kısa bir örnek

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

Yirmi satır; bir yönlendirici, bir anahtar, adreslenmiş dört PC, SSH ile güçlendirilmiş bir yönlendirici, VLAN'lar, korumalı erişim portları, etiketli bir diyagram, kaydedilmiş bir başlangıç görüntüsü ve eksiksiz bir erişilebilirlik testi üretir.

## Özellikler

| Alan | Neler yapabilirsiniz |
|---|---|
| **Cihazlar** | Ekleme, silme, yeniden adlandırma, taşıma, yeniden başlatma, modül takma, portları okuma, özel veri saklama, cihazları fiziksel çalışma alanına yerleştirme |
| **Bağlantılar** | Her kablo türü, bağlantı silme, otomatik bağlama, komşuları listeleme, bağlantı durumunu denetleme |
| **İstemciler** | Statik veya DHCP IPv4, SLAAC ile IPv6, ağ geçidi, DNS, güvenlik duvarı, komut istemi |
| **Cisco IOS** | Temel kurulum, parolalar, banner'lar, kullanıcılar, arayüzler, alt arayüzler, loopback'ler, router-on-a-stick, DHCP havuzları ve relay, NTP, syslog, SNMP, CDP, LLDP, show komutları |
| **Anahtarlama** | VLAN'lar, erişim ve ses portları, trunk'lar, DTP, EtherChannel (LACP, PAgP, statik, katman 3), Rapid PVST+, PortFast, BPDU Guard, VTP, port security, DHCP snooping, DAI |
| **Yönlendirme** | Statik ve yüzen rotalar, OSPF, OSPFv3, EIGRP, IPv6 için EIGRP, RIP, RIPng, BGP, yeniden dağıtım |
| **Güvenlik** | Standart, genişletilmiş, adlandırılmış ve IPv6 ACL'ler, NAT, PAT, NAT havuzları, port yönlendirme, SSH, oturum kilitleme, RADIUS ve TACACS+ ile AAA |
| **Yedeklilik** | Tek yönlendiricide veya aktif ve bekleme çifti olarak HSRP |
| **Sunucular** | DHCP, DNS (A, CNAME, NS), HTTP, HTTPS, web sayfaları, FTP kullanıcıları, e-posta hesapları, TFTP, syslog, RADIUS |
| **Kablosuz** | SSID, WPA2, WPA, WEP, radyo modu, gizli SSID, MAC filtresi |
| **İnceleme** | Anahtar port durumu, port security sayaçları, VLAN veritabanı, STP kökü ve kök portlar, VTP, statik MAC'ler, OSPF ve EIGRP süreçleri |
| **Erişilebilirlik** | Kayıp, gidiş dönüş süreleri ve matris görünümüyle `pingAll`, `pingMatrix` ve `reachability` |
| **Anlık görüntüler** | `takeSnapshot`, `getSnapshots`, `compareSnapshots`, `showSnapshotDiff`, görüntü dosyalarını kaydetme ve yükleme, yapılandırma diff görünümü |
| **Dosyalar** | Metin dosyası okuma ve yazma, diskten betik çalıştırma, yapılandırma ve topoloji dışa aktarma, komut günlüğü |
| **Tuval** | Notlar, çizgiler, daireler, dikdörtgenler, oklar, kesikli çizgiler, bölgeler, cihaz ve bağlantı etiketleri, katmanlar |
| **Topoloji** | Yıldız, halka, doğrusal, ağ örgü ve LAN üreticileri, ızgara ve daire yerleşimi, VLSM ve /30 planlayıcıları |
| **Simülasyon** | Simülasyon modu, PDU'lar, protokol filtreleri, adım adım çalıştırma, ping, traceroute |
| **Lab Check** | Puan, ipucu ve raporla notlandırılan kontroller: cihazlar, kablolar, adresler, portlar, ana bilgisayar adları, VLAN'lar, yapılandırma satırları, özel testler |
| **Denetim** | Yinelenen IP'ler, kablo boyunca alt ağ çakışmaları, kopuk bağlantılar, adressiz istemciler, VLAN 1'deki erişim portları, eksik port security, kullanılmayan açık portlar |
| **Toplu** | `runOnAll("show ip int brief")`, `runOnDevices` ve CLI'de yazılan komutları yeniden kullanılabilir bir betiğe dönüştüren `commandsToScript()` |
| **Çalışma alanı** | Yakınlaştırma, arka plan, uzak ağlar, proje açma ve kaydetme, çalışma alanı olayları |

Her IOS yardımcı fonksiyonunun, komutları göndermek yerine döndüren bir `build...` ikizi vardır; böylece yapılandırmayı görebilir, birleştirebilir ve yeniden kullanabilirsiniz.

## Düzenleyici

<div align="center"><img src="../assets/banners/editor.svg" alt="Editor" width="100%"></div>

Çalışma alanı VS Code gibi görünür ve davranır. Sıfırdan saf ES5 ile yazılmıştır; bu yüzden Packet Tracer web view içinde çerçeve ve ağ erişimi olmadan çalışır.

| Bölüm | Açıklama |
|---|---|
| **Menü çubuğu ve komut paleti** | File, Edit, Selection, View, Go, Run, Network, Terminal ve Help menüleri. `Ctrl+Shift+P` tüm komutları listeler, `Ctrl+P` dosyaya, `Ctrl+G` satıra gider |
| **Gezgin** | Açık düzenleyiciler, Packet Tracer'da kayıtlı betiklerden oluşan bir çalışma alanı ve diskteki gerçek bir klasör. Yeni, yeniden adlandır, sil |
| **Dosyalar** | Open, Save ve Save As Packet Tracer dosya iletişim kutularını kullanır. Panodan içe aktarma, indirme olarak dışa aktarma |
| **Sekmeler** | Dosya başına bir sekme, değişiklik noktası, orta tıkla kapatma, diskteki dosyalar için kaydetme uyarısı, her sekmenin kendi geri alma geçmişi |
| **Vurgulama** | Dark Modern renkleri: yorumlar `#6A9955`, dizeler `#CE9178`, sayılar `#B5CEA8`, anahtar sözcükler `#569CD6` ve `#C586C0`, fonksiyonlar `#DCDCAA`, değişkenler `#9CDCFE`, kalın PTForge fonksiyonları `#4FC1FF`, renkli parantez çiftleri |
| **IntelliSense** | İmza ve açıklamasıyla 388 fonksiyonun tamamından öneriler, dosyadaki sözcükler, anahtar sözcükler. Yazarken parametre ipuçları |
| **Sorunlar** | Tam satırıyla canlı söz dizimi denetimi, bilinmeyen fonksiyon adları için *Did you mean* hızlı düzeltmesi. Dalgalı alt çizgiler, kenar işaretleri ve Problems paneli |
| **Düzenleme** | Çiftleri otomatik kapatma, akıllı Enter, `Ctrl+/` yorum, `Alt+Up/Down` satır taşıma, `Shift+Alt+Down` satır kopyalama, `Ctrl+Shift+K` satır silme, parantez eşleştirme |
| **Bul ve değiştir** | Büyük/küçük harf, tam sözcük ve düzenli ifadelerle `Ctrl+F` ve `Ctrl+H`, tek geri almada Tümünü değiştir |
| **Panel** | Problems, Output, Debug Console, Terminal ve Lab Check. Boyutlandırılabilir, `Ctrl+J` gizler |
| **Devices görünümü** | Bağlantı LED'leri ve adreslerle canlı cihazlar ve portlar, tek tıkla anlık görüntüler ve ağ araçları |
| **Durum çubuğu** | Sorun sayısı, çalıştırma ve hata ayıklama durumu, imleç konumu, yakınlaştırma, Packet Tracer bağlantısı |

<table>
<tr>
<td><img src="../assets/screenshots/lab-check.png" alt="Lab Check raporu ve canlı Devices görünümü" width="100%"><br><sub>Lab Check raporu ve canlı Devices görünümü</sub></td>
<td><img src="../assets/screenshots/command-palette.png" alt="Komut paleti ve fonksiyon başvurusu" width="100%"><br><sub>Komut paleti ve fonksiyon başvurusu</sub></td>
</tr>
<tr>
<td><img src="../assets/screenshots/problems.png" alt="Hızlı düzeltmeli Problems" width="100%"><br><sub>Hızlı düzeltmeli Problems</sub></td>
<td><img src="../assets/screenshots/find-replace.png" alt="Bul ve değiştir" width="100%"><br><sub>Bul ve değiştir</sub></td>
</tr>
</table>

## Terminal

<div align="center"><img src="../assets/banners/terminal.svg" alt="Terminal" width="100%"></div>

`` Ctrl+` `` bir JavaScript terminali açar. Her satır Packet Tracer'da hemen çalışır ve değişkenlerini korur; böylece önce betik yazmadan bir topolojiyi adım adım keşfedip değiştirebilirsiniz.

| Özellik | Açıklama |
|---|---|
| **Doğrudan değerlendirme** | Her ifade veya deyim; sonuçlar okunaklı ağaçlar olarak, hatalar kırmızı |
| **Tamamlama** | `Tab` PTForge fonksiyonlarını, değişkenlerinizi, anahtar sözcükleri ve noktalı komutları tamamlar |
| **Geçmiş** | `Up` ve `Down` oturumlar arasında saklanan önceki komutlarda gezinir |
| **Birden çok terminal** | `+` yeni bir terminal açar, liste aralarında geçiş yapar, çöp kutusu birini kapatır |
| **Noktalı komutlar** | `.help`, `.clear`, `.devices`, `.ping`, `.trace`, `.show R1 show ip route`, bir cihazda IOS komutları için `.cli R1`, çıkmak için `.exit`, `.audit`, `.snap`, `.diff`, `.calc 10.1.2.3/20`, `.run file.js`, `.history` |

<div align="center"><img src="../assets/screenshots/terminal.png" alt="Terminal" width="95%"></div>

[Terminal kılavuzunu](../docs/guides/terminal.md) okuyun.

## Hata ayıklayıcı

<div align="center"><img src="../assets/banners/debugger.svg" alt="Debugger" width="100%"></div>

`F5` bir hata ayıklama oturumu başlatır. PTForge betiği enstrümante eder, Packet Tracer'da her adımı kaydederek bir kez çalıştırır ve ilk kesme noktasında durur. Tüm çalışma kaydedildiği için **geriye** de gidebilirsiniz.

| Özellik | Açıklama |
|---|---|
| **Kesme noktaları** | Kenara tıklayın veya `F9`. Koşullar, isabet sayısı, logpoint'ler, tümünü devre dışı bırakma veya kaldırma |
| **İstisnalar** | Yakalanmamış istisnalarda satırı vurgulayarak durur |
| **Adımlar** | Devam `F5`, üzerinden `F10`, içine `F11`, dışına `Shift+F11`, geri, yeniden başlat `Ctrl+Shift+F5`, durdur `Shift+F5` |
| **Variables** | Local, Closure ve Script kapsamları açılır ağaçlar olarak |
| **Watch** | Kaydedilen her adımda değerlendirilen herhangi bir ifade |
| **Call Stack** | Dosya ve satırıyla her çerçeve. Değişkenlerini görmek için bir çerçeveye tıklayın |
| **Debug Console** | Duraklatılmış çerçevede ifadeleri değerlendirin |
| **Üzerine gelme** | Düzenleyicide bir değişkenin üzerine gelince değeri görünür |

<div align="center"><img src="../assets/screenshots/debugger.png" alt="Debugger" width="95%"></div>

[Hata ayıklayıcı kılavuzunu](../docs/guides/debugger.md) okuyun.

## Ağ araçları

<div align="center"><img src="../assets/banners/network-tools.svg" alt="Network tools" width="100%"></div>

```js
pingAll();
takeSnapshot("before");
configureOspf("R1", { routerId: "1.1.1.1", networks: ["10.0.0.0/30"] });
compareSnapshots("before");
```

<table>
<tr>
<td><img src="../assets/screenshots/reachability.png" alt="pingAll() erişilebilirlik matrisi" width="100%"><br><sub><code>pingAll()</code> erişilebilirlik matrisi</sub></td>
<td><img src="../assets/screenshots/snapshot-diff.png" alt="Yapılandırma diff'iyle anlık görüntü karşılaştırması" width="100%"><br><sub>Yapılandırma diff'iyle anlık görüntü karşılaştırması</sub></td>
</tr>
<tr>
<td><img src="../assets/screenshots/calculator.png" alt="IPv4 alt ağ hesaplayıcı" width="100%"><br><sub>IPv4 alt ağ hesaplayıcı</sub></td>
<td><img src="../assets/screenshots/vlsm.png" alt="VLSM planlayıcı" width="100%"><br><sub>VLSM planlayıcı</sub></td>
</tr>
</table>

[Ağ araçları](../docs/guides/network-tools.md), [Erişilebilirlik](../docs/api/simulation.md#reachability) ve [Anlık görüntüler](../docs/api/snapshots.md) sayfalarını okuyun.

## Doğrulama ve denetim

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

[Lab Check](../docs/api/checks.md), [Denetim](../docs/api/audit.md) ve [Toplu komutlar](../docs/api/ios.md#batch-commands) sayfalarını okuyun.

## Kurulum

PTForge bir Packet Tracer Script Module'üdür. Packet Tracer `.pts` paketlerini şifreler ve onları yalnızca kendisi oluşturabilir; bu yüzden modülü bu depodaki dosyalardan bir kez kurarsınız.

1. [Son sürümü](https://github.com/r4chan842/PTForge/releases/latest) indirin veya depoyu klonlayın
2. Packet Tracer'da `Extensions` → `Scripting` → `Configure PT Script Modules` menüsünü açın
3. `PTForge` adında bir modül oluşturun
4. [`release/ptforge.js`](../release/ptforge.js) içeriğiyle bir betik dosyası ekleyin
5. [`src/ui`](../src/ui) içindeki on dört dosyayı arayüz dosyası olarak ekleyin: `index.html`, `style.css`, `catalog.js`, `snippets.js`, `highlight.js`, `lint.js`, `netcalc.js`, `editor.js`, `acorn.js`, `instrument.js`, `terminal.js`, `debugview.js`, `views.js`, `interface.js`
6. Modülü kaydedip başlatın ve `Extensions` → `PTForge Editor` menüsünü açın

[Kurulum kılavuzu](../docs/guides/installation.md) her adımı ve güncellemeyi anlatır.

## Örnekler

[`examples/`](../examples/README.md) içinde 34 eksiksiz lab var, her biri boş bir çalışma alanıyla başlar:

| Klasör | Lablar |
|---|---|
| `01-basics` | İlk ağ, modüller ve seri bağlantılar, güvenli temel yapılandırma |
| `02-switching` | VLAN ve trunk'lar, EtherChannel, STP kökü, katman 3 anahtar |
| `03-routing` | Statik, çok alanlı OSPF, EIGRP, BGP, OSPFv3 ile IPv6 |
| `04-security` | ACL, NAT ve PAT, SSH ve port security, HSRP |
| `05-services` | Sunucuda DHCP, DNS ve web, FTP ve e-posta, relay ile yönlendirici DHCP |
| `06-wireless` | Ev kablosuz ağı |
| `07-canvas` | Etiketler ve bölgeler |
| `08-topology` | Üretilmiş kampüs, yıldız, halka ve örgü, VLSM planı |
| `09-simulation` | Ping testi |
| `10-ccna-labs` | Router-on-a-stick, eksiksiz kurumsal lab |
| `11-inspection` | Anahtarlamayı doğrulama, port security denetimi |
| `12-automation` | Yapılandırma yedeği, komut denetimi, betik kütüphanesi |
| `13-operations` | Erişilebilirlik testi, anlık görüntülerle değişiklik takibi |

Kendi çalışmalarınız için başlangıç noktaları [`templates/`](../templates/README.md) içindedir: boş lab, kampüs, şube WAN'ı ve küçük ofis.

## Belgeler

| Bölüm | İçerik |
|---|---|
| [Başlarken](../docs/guides/getting-started.md) | On dakikada ilk ağınız |
| [Düzenleyici kılavuzu](../docs/guides/editor.md) | Çalışma alanı, dosyalar, IntelliSense, sorunlar |
| [Terminal](../docs/guides/terminal.md) | Etkileşimli JavaScript ve cihaz CLI'si |
| [Hata ayıklayıcı](../docs/guides/debugger.md) | Kesme noktaları, adımlar, değişkenler ve watch |
| [Ağ araçları](../docs/guides/network-tools.md) | Hesaplayıcı, erişilebilirlik ve anlık görüntüler |
| [Betik yazma](../docs/guides/writing-scripts.md) | Yapı, sıralama, builder'lar, hız |
| [API başvurusu](../docs/api/README.md) | Argümanları, dönüş değerleri ve örnekleriyle her fonksiyon |
| [Tarifler](../docs/recipes/README.md) | Kampüs anahtarlama, yönlendirme labları, kenar yönlendirici, sunucular, diyagramlar |
| [CCNA konu haritası](../docs/ccna/README.md) | CCNA 200-301 konuları ve ilgili fonksiyonlar ve örnekler |
| [Kopya kâğıtları](../docs/cheatsheets/ios-to-ptforge.md) | IOS'tan PTForge'a, alt ağlar, düzenleyici tuşları |
| [Mimari](../docs/architecture/overview.md) | Katmanlar, çalışma zamanı, düzenleyici köprüsü, hata ayıklayıcı, testler |
| [Sorun giderme](../docs/guides/troubleshooting.md) | Sık hatalar ve çözümleri |
| [Sınırlamalar](../docs/guides/limitations.md) | Packet Tracer API'sinin izin vermedikleri |
| [SSS](../docs/guides/faq.md) | Kısa yanıtlar |

## Proje yapısı

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

## Geliştirme

Node.js 18 veya daha yenisi gerekir. Çalışma zamanı bağımlılığı yoktur.

```
git clone https://github.com/r4chan842/PTForge.git
cd PTForge
npm run check
```

| Komut | Amaç |
|---|---|
| `npm test` | Tüm testleri çalıştır |
| `npm run bundle` | `release/ptforge.js` dosyasını yeniden oluştur |
| `npm run catalog` | Düzenleyicinin fonksiyon listesini `docs/api` içinden üret |
| `npm run reference` | Başvuru tablolarını `src/data` içinden üret |
| `npm run check` | Fonksiyon listesi, paket, söz dizimi denetimi ve testler |
| `npm run ui-test` | Playwright ile çalışma alanı, terminal ve hata ayıklayıcı için 41 tarayıcı denetimi |
| `npm run screenshots` | `assets/screenshots` içindeki ekran görüntülerini yeniden üret |

Test takımı tüm eklentiyi Packet Tracer IPC API'sinin bir kopyasına karşı çalıştırır. Her genel fonksiyonu, her örneği, şablonu ve tarifi, paketi, terminal ve hata ayıklayıcı motorlarını ve proje kurallarını kapsar. Ayrıntılar [Test](../docs/architecture/testing.md) sayfasında.

## Katkıda bulunma

Hata bildirimleri, fikirler ve pull request'ler memnuniyetle karşılanır. [CONTRIBUTING](../CONTRIBUTING.md) ile başlayın, [yol haritasına](../ROADMAP.md) göz atın ve [davranış kurallarına](../CODE_OF_CONDUCT.md) uyun. Güvenlik sorunları için [güvenlik politikasını](../SECURITY.md) kullanın. Sorular: [SUPPORT](../SUPPORT.md).

## Lisans

PTForge [MIT lisansı](../LICENSE) ile yayımlanır. Hata ayıklayıcı [Acorn](https://github.com/acornjs/acorn) (MIT) kullanır, bkz. [THIRD_PARTY_NOTICES](../THIRD_PARTY_NOTICES.md).

## Teşekkürler

Packet Tracer API kullanımı resmi [Cisco Packet Tracer IPC API belgelerine](https://tutorials.ptnetacad.net/help/default/IpcAPI/classes.html) dayanır. Çalışma alanı renkleri VS Code Dark Modern temasını izler.

Cisco ve Packet Tracer, Cisco Systems, Inc. şirketinin ticari markalarıdır. Bu proje Cisco Systems, Inc. ile bağlantılı değildir ve Cisco tarafından onaylanmamıştır.

<div align="center">
<sub>Ağ öğrencileri, eğitmenler ve aynı labı elle iki kez kurmak istemeyen herkes için yapıldı.</sub>
</div>
