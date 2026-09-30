<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="../assets/brand/logo-dark.svg">
  <img src="../assets/brand/logo.svg" alt="PTForge" width="300">
</picture>

<br><br>

**Cisco Packet Tracer のネットワーク全体を JavaScript で構築、設定、デバッグ、検証します。**

[![Release](https://img.shields.io/github/v/release/r4chan842/PTForge?color=1A5DB7)](https://github.com/r4chan842/PTForge/releases/latest)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](../LICENSE)
![Functions](https://img.shields.io/badge/functions-388-1A5DB7)
![Packet Tracer](https://img.shields.io/badge/Packet%20Tracer-8.x%2B-1ba0d7)
![Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)

[クイックスタート](#クイックスタート) ·
[インストール](../docs/guides/installation.md) ·
[ドキュメント](../docs/README.md) ·
[API](../docs/api/README.md) ·
[サンプル](../examples/README.md) ·
[CCNA マップ](../docs/ccna/README.md)

[English](../README.md) ·
[فارسی](README.fa.md) ·
[Deutsch](README.de.md) ·
[Español](README.es.md) ·
[Français](README.fr.md) ·
[Português](README.pt-BR.md) ·
[Русский](README.ru.md) ·
[Türkçe](README.tr.md) ·
[العربية](README.ar.md) ·
[中文](README.zh-CN.md) ·
**日本語**

</div>

---

> これは翻訳です。正式な内容は[英語版 README](../README.md) を参照してください。

## PTForge を使う理由

Packet Tracer でラボを組むには、デバイスをドラッグし、ケーブルを選び、各 CLI を開いて同じコマンドを何度も入力する必要があります。VLAN リストやワイルドカードマスクの打ち間違い一つで一時間を失うこともあります。

PTForge はクリック作業をスクリプトに置き換えます。ネットワークを一度記述して **Run** を押せば、Packet Tracer がデバイス、モジュール、ケーブル、IOS 設定、サーバーサービス、無線、ラベル、ゾーンを構築します。その後 PTForge が実際の状態を読み取るので、同じスクリプトで自分の作業を確認できます。

- **再現可能**：ラボを何度でも数秒でゼロから再構築
- **共有可能**：ラボはテキストファイルなので、送信、レビュー、Git 管理が簡単
- **正確**：アドレス、マスク、ワイルドカードは計算され、打ち間違いには明確なエラーが出る
- **検証可能**：検査関数が VLAN、トランク、STP、ポートセキュリティ、ルーティングプロセスを Packet Tracer から直接読み取る
- **デバッグ可能**：VS Code と同じようにブレークポイントを置き、ステップ実行し、すべての変数を確認
- **対話的**：JavaScript ターミナルで開いているトポロジーを一行ずつ変更

<div align="center">
<img src="../assets/screenshots/editor.png" alt="PTForge" width="95%">
<br><sub>Packet Tracer 内の PTForge ワークベンチ：エクスプローラー、タブ、IntelliSense、Dark Modern ハイライト、出力</sub>
</div>

## 1.2 の新機能

|  |  |
|---|---|
| 🖥️ **JavaScript ターミナル** | `` Ctrl+` `` で VS Code の *New Terminal* のようなターミナルが開きます。各行は開いているトポロジーに対して直接実行され、履歴、Tab 補完、`.calc`、`.ping`、`.cli R1` などのドットコマンドが使えます |
| 🐞 **デバッガー** | `F5` はすべてのステップを記録しながらスクリプトを実行します。ブレークポイント、条件、例外で停止し、ステップオーバー、イン、アウト、そして**バック**が可能。Variables、Watch、Call Stack を確認し、Debug Console で式を評価できます |
| 🧮 **ネットワーク計算機** | IPv4 サブネット、サブネット分割、VLSM プランナー、経路集約、範囲から CIDR、ワイルドカードマスク、IPv6、EUI-64、基数変換をエディターのタブ一つで |
| 📡 **到達性マトリクス** | `pingAll()` はすべてのルーターとスイッチからすべてのアドレスに ping を送り、損失と往復時間をカラーのマトリクスで表示します |
| 📸 **スナップショットと差分** | `takeSnapshot()` はデバイス、リンク、アドレス、ポート、電源状態、running-config を保存します。二つのスナップショットを比較し、設定を行ごとに確認できます |
| 🎨 **Dark Modern** | 色、余白、タブ、パネル、ステータスバーは VS Code の Dark Modern テーマに完全に準拠し、デバッグ中はステータスバーが青になります |

## クイックスタート

1. [最新リリース](https://github.com/r4chan842/PTForge/releases/latest)をダウンロードし、[インストールガイド](../docs/guides/installation.md)に従います
2. `Extensions` → `PTForge Editor` を開きます
3. `Ctrl+O` で [`examples/`](../examples/README.md) のスクリプトを開き、`Ctrl+F5` で実行、`F5` でデバッグします
4. `` Ctrl+` `` を押し、ターミナルで `getDevices()` を試します
5. `auditNetwork()`、`pingAll()`、または [Lab Check](../docs/api/checks.md) で結果を検証します

## 簡単な例

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

わずか二十行で、ルーター、スイッチ、アドレス設定済みの PC 四台、SSH で強化されたルーター、VLAN、保護されたアクセスポート、ラベル付きの図、保存されたベースライン、完全な到達性テストが得られます。

## 機能

| 分野 | できること |
|---|---|
| 🖥️ **デバイス** | 追加、削除、名前変更、移動、再起動、モジュール装着、ポート読み取り、独自データの保存、物理ワークスペースへの配置 |
| 🔌 **リンク** | あらゆるケーブル種別、リンク削除、自動接続、隣接一覧、リンク状態の確認 |
| 💻 **ホスト** | 静的または DHCP の IPv4、SLAAC による IPv6、ゲートウェイ、DNS、ファイアウォール、コマンドプロンプト |
| ⚙️ **Cisco IOS** | 基本設定、パスワード、バナー、ユーザー、インターフェース、サブインターフェース、ループバック、Router on a Stick、DHCP プールとリレー、NTP、syslog、SNMP、CDP、LLDP、show コマンド |
| 🔀 **スイッチング** | VLAN、アクセスポートと音声ポート、トランク、DTP、EtherChannel（LACP、PAgP、静的、レイヤー 3）、Rapid PVST+、PortFast、BPDU Guard、VTP、ポートセキュリティ、DHCP スヌーピング、DAI |
| 🧭 **ルーティング** | 静的ルートとフローティングルート、OSPF、OSPFv3、EIGRP、IPv6 用 EIGRP、RIP、RIPng、BGP、再配布 |
| 🛡️ **セキュリティ** | 標準、拡張、名前付き、IPv6 の ACL、NAT、PAT、NAT プール、ポートフォワーディング、SSH、ログインブロック、RADIUS と TACACS+ による AAA |
| ♻️ **冗長化** | 単一ルーター、またはアクティブとスタンバイのペアでの HSRP |
| 🗄️ **サーバー** | DHCP、DNS（A、CNAME、NS）、HTTP、HTTPS、Web ページ、FTP ユーザー、メールアカウント、TFTP、syslog、RADIUS |
| 📶 **無線** | SSID、WPA2、WPA、WEP、無線モード、SSID の非表示、MAC フィルター |
| 🔍 **検査** | スイッチポート状態、ポートセキュリティカウンター、VLAN データベース、STP ルートとルートポート、VTP、静的 MAC、OSPF と EIGRP のプロセス |
| 📡 **到達性** | 損失、往復時間、マトリクス表示を備えた `pingAll`、`pingMatrix`、`reachability` |
| 📸 **スナップショット** | `takeSnapshot`、`getSnapshots`、`compareSnapshots`、`showSnapshotDiff`、スナップショットファイルの保存と読み込み、設定差分ビュー |
| 📁 **ファイル** | テキストファイルの読み書き、ディスクからのスクリプト実行、設定とトポロジーのエクスポート、コマンドログ |
| 🎨 **キャンバス** | メモ、線、円、四角形、矢印、破線、ゾーン、デバイスとリンクのラベル、レイヤー |
| 🗺️ **トポロジー** | スター、リング、ライン、メッシュ、LAN のジェネレーター、グリッドと円形の配置、VLSM と /30 のプランナー |
| 🧪 **シミュレーション** | シミュレーションモード、PDU、プロトコルフィルター、ステップ実行、ping、traceroute |
| ✅ **Lab Check** | 点数、ヒント、レポート付きの採点チェック：デバイス、ケーブル、アドレス、ポート、ホスト名、VLAN、設定行、独自テスト |
| 🩺 **監査** | IP の重複、ケーブル両端のサブネット不一致、ダウンしたリンク、アドレスのないホスト、VLAN 1 のアクセスポート、ポートセキュリティの欠如、未使用の有効ポート |
| 📟 **一括処理** | `runOnAll("show ip int brief")`、`runOnDevices`、そして CLI で入力したコマンドを再利用可能なスクリプトに変換する `commandsToScript()` |
| 🪟 **ワークスペース** | ズーム、背景、リモートネットワーク、プロジェクトを開く・保存、ワークスペースイベント |

すべての IOS ヘルパーには、コマンドを送信する代わりに返す `build...` 版があり、設定を確認、結合、再利用できます。

## エディター

<div align="center"><img src="../assets/banners/editor.svg" alt="Editor" width="100%"></div>

ワークベンチは見た目も操作も VS Code そのものです。純粋な ES5 でゼロから書かれているため、フレームワークもネットワークアクセスもなしに Packet Tracer の web view 内で動作します。

| 要素 | 説明 |
|---|---|
| **メニューバーとコマンドパレット** | File、Edit、Selection、View、Go、Run、Network、Terminal、Help メニュー。`Ctrl+Shift+P` で全コマンド、`Ctrl+P` でファイルへ、`Ctrl+G` で行へ移動 |
| **エクスプローラー** | 開いているエディター、Packet Tracer に保存されたスクリプトのワークスペース、ディスク上の実フォルダー。新規、名前変更、削除 |
| **ファイル** | Open、Save、Save As は Packet Tracer のファイルダイアログを使用。クリップボードからのインポート、ダウンロードとしてのエクスポート |
| **タブ** | ファイルごとのタブ、変更マーク、中クリックで閉じる、ディスク上のファイルの保存確認、タブごとの独立した元に戻す履歴 |
| **ハイライト** | Dark Modern の配色：コメント `#6A9955`、文字列 `#CE9178`、数値 `#B5CEA8`、キーワード `#569CD6` と `#C586C0`、関数 `#DCDCAA`、変数 `#9CDCFE`、太字の PTForge 関数 `#4FC1FF`、色分けされた括弧ペア |
| **IntelliSense** | 388 個すべての関数からシグネチャと説明付きで候補を表示、ファイル内の単語、キーワード。入力中のパラメーターヒント |
| **問題** | 正確な行を示すリアルタイム構文チェック、未知の関数名には *Did you mean* のクイックフィックス。波線、ガターマーク、Problems パネル |
| **編集** | ペアの自動閉じ、スマート Enter、`Ctrl+/` コメント、`Alt+Up/Down` 行移動、`Shift+Alt+Down` 行コピー、`Ctrl+Shift+K` 行削除、括弧の対応表示 |
| **検索と置換** | 大文字小文字の区別、単語単位、正規表現に対応した `Ctrl+F` と `Ctrl+H`。すべて置換は一回の元に戻すで取り消し可能 |
| **パネル** | Problems、Output、Debug Console、Terminal、Lab Check。サイズ変更可能、`Ctrl+J` で非表示 |
| **Devices ビュー** | リンク LED とアドレス付きのライブなデバイスとポート、ワンクリックのスナップショットとネットワークツール |
| **ステータスバー** | 問題の数、実行とデバッグの状態、カーソル位置、ズーム、Packet Tracer との接続 |

<table>
<tr>
<td><img src="../assets/screenshots/lab-check.png" alt="Lab Check レポートとライブ Devices ビュー" width="100%"><br><sub>Lab Check レポートとライブ Devices ビュー</sub></td>
<td><img src="../assets/screenshots/command-palette.png" alt="コマンドパレットと関数リファレンス" width="100%"><br><sub>コマンドパレットと関数リファレンス</sub></td>
</tr>
<tr>
<td><img src="../assets/screenshots/problems.png" alt="クイックフィックス付き Problems" width="100%"><br><sub>クイックフィックス付き Problems</sub></td>
<td><img src="../assets/screenshots/find-replace.png" alt="検索と置換" width="100%"><br><sub>検索と置換</sub></td>
</tr>
</table>

## ターミナル

<div align="center"><img src="../assets/banners/terminal.svg" alt="Terminal" width="100%"></div>

`` Ctrl+` `` で JavaScript ターミナルが開きます。各行は Packet Tracer ですぐに実行され、変数も保持されるので、先にスクリプトを書かなくてもトポロジーを一歩ずつ調べて変更できます。

| 機能 | 説明 |
|---|---|
| **直接評価** | 任意の式や文を実行し、結果は読みやすいツリーで、エラーは赤で表示 |
| **補完** | `Tab` で PTForge 関数、自分の変数、キーワード、ドットコマンドを補完 |
| **履歴** | `Up` と `Down` で過去のコマンドをたどれ、履歴はセッションをまたいで保存 |
| **複数ターミナル** | `+` で新しいターミナル、リストで切り替え、ゴミ箱で閉じる |
| **ドットコマンド** | `.help`、`.clear`、`.devices`、`.ping`、`.trace`、`.show R1 show ip route`、デバイスで IOS コマンドを打つ `.cli R1`、抜けるには `.exit`、`.audit`、`.snap`、`.diff`、`.calc 10.1.2.3/20`、`.run file.js`、`.history` |

<div align="center"><img src="../assets/screenshots/terminal.png" alt="Terminal" width="95%"></div>

[ターミナルガイド](../docs/guides/terminal.md)をお読みください。

## デバッガー

<div align="center"><img src="../assets/banners/debugger.svg" alt="Debugger" width="100%"></div>

`F5` でデバッグセッションが始まります。PTForge はスクリプトを計装し、各ステップを記録しながら Packet Tracer で一度実行してから、最初のブレークポイントで停止します。実行全体が記録されているので、**後ろ**に戻ることもできます。

| 機能 | 説明 |
|---|---|
| **ブレークポイント** | ガターをクリックするか `F9`。条件、ヒット回数、ログポイント、すべて無効化または削除 |
| **例外** | 捕捉されない例外で停止し、その行を強調表示 |
| **ステップ** | 続行 `F5`、ステップオーバー `F10`、ステップイン `F11`、ステップアウト `Shift+F11`、ステップバック、再起動 `Ctrl+Shift+F5`、停止 `Shift+F5` |
| **Variables** | Local、Closure、Script スコープを展開可能なツリーで表示 |
| **Watch** | 記録された各ステップで評価される任意の式 |
| **Call Stack** | ファイルと行付きの各フレーム。フレームをクリックすると変数を表示 |
| **Debug Console** | 停止中のフレームで式を評価 |
| **ホバー** | エディターで変数にマウスを重ねると値を表示 |

<div align="center"><img src="../assets/screenshots/debugger.png" alt="Debugger" width="95%"></div>

[デバッガーガイド](../docs/guides/debugger.md)をお読みください。

## ネットワークツール

<div align="center"><img src="../assets/banners/network-tools.svg" alt="Network tools" width="100%"></div>

```js
pingAll();
takeSnapshot("before");
configureOspf("R1", { routerId: "1.1.1.1", networks: ["10.0.0.0/30"] });
compareSnapshots("before");
```

<table>
<tr>
<td><img src="../assets/screenshots/reachability.png" alt="pingAll() の到達性マトリクス" width="100%"><br><sub><code>pingAll()</code> の到達性マトリクス</sub></td>
<td><img src="../assets/screenshots/snapshot-diff.png" alt="設定差分付きのスナップショット比較" width="100%"><br><sub>設定差分付きのスナップショット比較</sub></td>
</tr>
<tr>
<td><img src="../assets/screenshots/calculator.png" alt="IPv4 サブネット計算機" width="100%"><br><sub>IPv4 サブネット計算機</sub></td>
<td><img src="../assets/screenshots/vlsm.png" alt="VLSM プランナー" width="100%"><br><sub>VLSM プランナー</sub></td>
</tr>
</table>

[ネットワークツール](../docs/guides/network-tools.md)、[到達性](../docs/api/simulation.md#reachability)、[スナップショット](../docs/api/snapshots.md)をお読みください。

## 検証と監査

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

[Lab Check](../docs/api/checks.md)、[監査](../docs/api/audit.md)、[一括コマンド](../docs/api/ios.md#batch-commands)をお読みください。

## インストール

PTForge は Packet Tracer の Script Module です。Packet Tracer は `.pts` パッケージを暗号化し、作成できるのは Packet Tracer だけなので、このリポジトリのファイルからモジュールを一度組み立てます。

1. [最新リリース](https://github.com/r4chan842/PTForge/releases/latest)をダウンロードするか、リポジトリをクローンします
2. Packet Tracer で `Extensions` → `Scripting` → `Configure PT Script Modules` を開きます
3. `PTForge` という名前のモジュールを作成します
4. [`release/ptforge.js`](../release/ptforge.js) の内容でスクリプトファイルを追加します
5. [`src/ui`](../src/ui) の十四個のファイルをインターフェースファイルとして追加します：`index.html`, `style.css`, `catalog.js`, `snippets.js`, `highlight.js`, `lint.js`, `netcalc.js`, `editor.js`, `acorn.js`, `instrument.js`, `terminal.js`, `debugview.js`, `views.js`, `interface.js`
6. モジュールを保存して起動し、`Extensions` → `PTForge Editor` を開きます

[インストールガイド](../docs/guides/installation.md)で各手順と更新方法を説明しています。

## サンプル

[`examples/`](../examples/README.md) には 34 個の完全なラボがあり、どれも空のワークスペースから始まります：

| フォルダー | ラボ |
|---|---|
| `01-basics` | 最初のネットワーク、モジュールとシリアルリンク、安全な基本設定 |
| `02-switching` | VLAN とトランク、EtherChannel、STP ルート、レイヤー 3 スイッチ |
| `03-routing` | 静的ルート、マルチエリア OSPF、EIGRP、BGP、OSPFv3 による IPv6 |
| `04-security` | ACL、NAT と PAT、SSH とポートセキュリティ、HSRP |
| `05-services` | サーバーの DHCP、DNS、Web、FTP とメール、リレー付きルーター DHCP |
| `06-wireless` | 家庭用無線 |
| `07-canvas` | ラベルとゾーン |
| `08-topology` | 自動生成キャンパス、スター、リング、メッシュ、VLSM 計画 |
| `09-simulation` | ping テスト |
| `10-ccna-labs` | Router on a Stick、完全な企業ラボ |
| `11-inspection` | スイッチングの検証、ポートセキュリティ監査 |
| `12-automation` | 設定バックアップ、コマンド監査、スクリプトライブラリ |
| `13-operations` | 到達性テスト、スナップショットによる変更追跡 |

独自の作業の出発点は [`templates/`](../templates/README.md) にあります：空のラボ、キャンパス、支店 WAN、小規模オフィス。

## ドキュメント

| セクション | 内容 |
|---|---|
| [はじめに](../docs/guides/getting-started.md) | 十分で最初のネットワーク |
| [エディターガイド](../docs/guides/editor.md) | ワークスペース、ファイル、IntelliSense、問題 |
| [ターミナル](../docs/guides/terminal.md) | 対話的な JavaScript とデバイス CLI |
| [デバッガー](../docs/guides/debugger.md) | ブレークポイント、ステップ、変数、ウォッチ |
| [ネットワークツール](../docs/guides/network-tools.md) | 計算機、到達性、スナップショット |
| [スクリプトの書き方](../docs/guides/writing-scripts.md) | 構成、順序、build 関数、速度 |
| [API リファレンス](../docs/api/README.md) | 引数、戻り値、例付きの全関数 |
| [レシピ](../docs/recipes/README.md) | キャンパススイッチング、ルーティングラボ、エッジルーター、サーバー、図 |
| [CCNA トピックマップ](../docs/ccna/README.md) | CCNA 200-301 のトピックと対応する関数とサンプル |
| [チートシート](../docs/cheatsheets/ios-to-ptforge.md) | IOS から PTForge へ、サブネット計算、エディターのキー |
| [アーキテクチャ](../docs/architecture/overview.md) | レイヤー、ランタイム、エディターブリッジ、デバッガー、テスト |
| [トラブルシューティング](../docs/guides/troubleshooting.md) | よくあるエラーと解決方法 |
| [制限事項](../docs/guides/limitations.md) | Packet Tracer API でできないこと |
| [FAQ](../docs/guides/faq.md) | 短い回答 |

## プロジェクト構成

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

## 開発

Node.js 18 以降が必要です。実行時の依存関係はありません。

```
git clone https://github.com/r4chan842/PTForge.git
cd PTForge
npm run check
```

| コマンド | 目的 |
|---|---|
| `npm test` | すべてのテストを実行 |
| `npm run bundle` | `release/ptforge.js` を再ビルド |
| `npm run catalog` | `docs/api` からエディターの関数一覧を生成 |
| `npm run reference` | `src/data` からリファレンス表を生成 |
| `npm run check` | 関数一覧、バンドル、構文チェック、テスト |
| `npm run ui-test` | Playwright によるワークベンチ、ターミナル、デバッガーの 41 項目のブラウザーチェック |
| `npm run screenshots` | `assets/screenshots` のスクリーンショットを再生成 |

テストスイートは、Packet Tracer IPC API のレプリカに対して拡張機能全体を実行します。すべての公開関数、すべてのサンプル、テンプレート、レシピ、バンドル、ターミナルとデバッガーのエンジン、プロジェクトのルールを網羅しています。詳細は[テスト](../docs/architecture/testing.md)を参照してください。

## コントリビュート

バグ報告、アイデア、プルリクエストを歓迎します。まず [CONTRIBUTING](../CONTRIBUTING.md) を読み、[ロードマップ](../ROADMAP.md)を確認し、[行動規範](../CODE_OF_CONDUCT.md)に従ってください。セキュリティ上の問題は[セキュリティポリシー](../SECURITY.md)から報告してください。質問は [SUPPORT](../SUPPORT.md) へ。

## ライセンス

PTForge は [MIT ライセンス](../LICENSE)で公開されています。デバッガーは [Acorn](https://github.com/acornjs/acorn)（MIT）を使用しています。[THIRD_PARTY_NOTICES](../THIRD_PARTY_NOTICES.md) を参照してください。

## 謝辞

Packet Tracer API の使用は公式の [Cisco Packet Tracer IPC API ドキュメント](https://tutorials.ptnetacad.net/help/default/IpcAPI/classes.html)に基づいています。ワークベンチの配色は VS Code の Dark Modern テーマに準拠しています。

Cisco および Packet Tracer は Cisco Systems, Inc. の商標です。本プロジェクトは Cisco Systems, Inc. と提携しておらず、Cisco による承認も受けていません。

<div align="center">
<sub>ネットワークを学ぶ学生、教える先生、そして同じラボを二度も手作業で組みたくないすべての人のために。</sub>
</div>
