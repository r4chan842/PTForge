<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="../assets/brand/logo-dark.svg">
  <img src="../assets/brand/logo.svg" alt="PTForge" width="300">
</picture>

<br><br>

**Construisez, configurez, déboguez et vérifiez des réseaux Cisco Packet Tracer complets en JavaScript.**

[![Release](https://img.shields.io/github/v/release/r4chan842/PTForge?color=1A5DB7)](https://github.com/r4chan842/PTForge/releases/latest)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](../LICENSE)
![Functions](https://img.shields.io/badge/functions-388-1A5DB7)
![Packet Tracer](https://img.shields.io/badge/Packet%20Tracer-8.x%2B-1ba0d7)
![Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)

[Démarrage rapide](#démarrage-rapide) ·
[Installation](../docs/guides/installation.md) ·
[Documentation](../docs/README.md) ·
[API](../docs/api/README.md) ·
[Exemples](../examples/README.md) ·
[Carte CCNA](../docs/ccna/README.md)

[English](../README.md) ·
[فارسی](README.fa.md) ·
[Deutsch](README.de.md) ·
[Español](README.es.md) ·
**Français** ·
[Português](README.pt-BR.md) ·
[Русский](README.ru.md) ·
[Türkçe](README.tr.md) ·
[العربية](README.ar.md) ·
[中文](README.zh-CN.md) ·
[日本語](README.ja.md)

</div>

---

> Ceci est une traduction. La version de référence est le [README anglais](../README.md).

## Pourquoi PTForge

Monter un lab dans Packet Tracer, c'est glisser des équipements, choisir des câbles, ouvrir chaque CLI et taper les mêmes commandes encore et encore. Une faute dans une liste de VLAN ou un masque générique peut coûter une heure.

PTForge remplace les clics par un script. Vous décrivez le réseau une fois, appuyez sur **Run**, et Packet Tracer le construit : équipements, modules, câbles, configuration IOS, services serveur, sans-fil, étiquettes et zones. PTForge relit ensuite l'état réel, pour que le même script vérifie son propre travail.

- **Reproductible** : reconstruisez un lab à partir de zéro en quelques secondes, autant de fois que vous voulez
- **Partageable** : un lab est un fichier texte que l'on peut envoyer, relire et versionner dans Git
- **Correct** : adresses, masques et masques génériques sont calculés, et les fautes produisent des erreurs claires
- **Vérifiable** : les fonctions d'inspection lisent VLAN, trunks, STP, port security et processus de routage directement dans Packet Tracer
- **Débogable** : posez des points d'arrêt, exécutez un script pas à pas et lisez chaque variable, comme dans VS Code
- **Interactif** : un terminal JavaScript modifie la topologie ouverte ligne par ligne

<div align="center">
<img src="../assets/screenshots/editor.png" alt="PTForge" width="95%">
<br><sub>L'atelier PTForge dans Packet Tracer : explorateur, onglets, IntelliSense, coloration Dark Modern et sortie</sub>
</div>

## Nouveautés de la 1.2

|  |  |
|---|---|
| 🖥️ **Terminal JavaScript** | `` Ctrl+` `` ouvre un terminal comme *New Terminal* de VS Code. Chaque ligne s'exécute directement sur la topologie ouverte, avec historique, complétion par Tab et commandes pointées comme `.calc`, `.ping` et `.cli R1` |
| 🐞 **Débogueur** | `F5` exécute le script en enregistrant chaque étape. Arrêt sur points d'arrêt, conditions et exceptions ; pas à pas principal, détaillé, sortant et **arrière** ; lecture de Variables, Watch et Call Stack, évaluation d'expressions dans la Debug Console |
| 🧮 **Calculatrice réseau** | Sous-réseau IPv4, découpage, planificateur VLSM, agrégation de routes, plage vers CIDR, masques génériques, IPv6, EUI-64 et conversion de bases dans un onglet de l'éditeur |
| 📡 **Matrice d'accessibilité** | `pingAll()` pingue chaque adresse depuis chaque routeur et commutateur et affiche une matrice colorée avec pertes et temps aller-retour |
| 📸 **Snapshots et diff** | `takeSnapshot()` enregistre équipements, liens, adresses, ports, état d'alimentation et running-config. Comparez deux snapshots et voyez la configuration ligne par ligne |
| 🎨 **Dark Modern** | Couleurs, espacements, onglets, panneaux et barre d'état suivent exactement le thème Dark Modern de VS Code ; la barre d'état devient bleue pendant le débogage |

## Démarrage rapide

1. Téléchargez la [dernière version](https://github.com/r4chan842/PTForge/releases/latest) et suivez le [guide d'installation](../docs/guides/installation.md)
2. Ouvrez `Extensions` → `PTForge Editor`
3. Ouvrez un script de [`examples/`](../examples/README.md) avec `Ctrl+O` puis appuyez sur `Ctrl+F5` pour exécuter ou `F5` pour déboguer
4. Appuyez sur `` Ctrl+` `` et essayez `getDevices()` dans le terminal
5. Vérifiez le résultat avec `auditNetwork()`, `pingAll()` ou un [Lab Check](../docs/api/checks.md)

## Un aperçu rapide

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

Vingt lignes donnent un routeur, un commutateur, quatre PC adressés, un routeur durci avec SSH, des VLAN, des ports d'accès sécurisés, un schéma étiqueté, une base de référence enregistrée et un test d'accessibilité complet.

## Fonctionnalités

| Domaine | Ce que vous pouvez faire |
|---|---|
| 🖥️ **Équipements** | Ajouter, supprimer, renommer, déplacer, redémarrer, installer des modules, lire les ports, stocker des données personnalisées, placer les équipements dans l'espace physique |
| 🔌 **Liens** | Tous les types de câbles, suppression de liens, connexion automatique, liste des voisins, état des liens |
| 💻 **Hôtes** | IPv4 statique ou DHCP, IPv6 avec SLAAC, passerelle, DNS, pare-feu, invite de commandes |
| ⚙️ **Cisco IOS** | Configuration de base, mots de passe, bannières, utilisateurs, interfaces, sous-interfaces, loopbacks, router-on-a-stick, pools et relais DHCP, NTP, syslog, SNMP, CDP, LLDP, commandes show |
| 🔀 **Commutation** | VLAN, ports d'accès et voix, trunks, DTP, EtherChannel (LACP, PAgP, statique, niveau 3), Rapid PVST+, PortFast, BPDU Guard, VTP, port security, DHCP snooping, DAI |
| 🧭 **Routage** | Routes statiques et flottantes, OSPF, OSPFv3, EIGRP, EIGRP pour IPv6, RIP, RIPng, BGP, redistribution |
| 🛡️ **Sécurité** | ACL standard, étendues, nommées et IPv6, NAT, PAT, pools NAT, redirection de ports, SSH, blocage de connexion, AAA avec RADIUS et TACACS+ |
| ♻️ **Redondance** | HSRP sur un routeur ou en paire active et de secours |
| 🗄️ **Serveurs** | DHCP, DNS (A, CNAME, NS), HTTP, HTTPS, pages web, utilisateurs FTP, comptes e-mail, TFTP, syslog, RADIUS |
| 📶 **Sans-fil** | SSID, WPA2, WPA, WEP, mode radio, SSID masqué, filtrage MAC |
| 🔍 **Inspection** | État des ports du commutateur, compteurs port security, base VLAN, racine STP et ports racine, VTP, MAC statiques, processus OSPF et EIGRP |
| 📡 **Accessibilité** | `pingAll`, `pingMatrix` et `reachability` avec pertes, temps aller-retour et vue matricielle |
| 📸 **Snapshots** | `takeSnapshot`, `getSnapshots`, `compareSnapshots`, `showSnapshotDiff`, enregistrement et chargement de fichiers snapshot et vue diff de configuration |
| 📁 **Fichiers** | Lire et écrire des fichiers texte, exécuter des scripts depuis le disque, exporter configurations et topologie, journal des commandes |
| 🎨 **Canevas** | Notes, lignes, cercles, rectangles, flèches, pointillés, zones, étiquettes d'équipements et de liens, calques |
| 🗺️ **Topologie** | Générateurs étoile, anneau, ligne, maillage et LAN, disposition en grille et en cercle, planificateurs VLSM et /30 |
| 🧪 **Simulation** | Mode simulation, PDU, filtres de protocoles, exécution pas à pas, ping, traceroute |
| ✅ **Lab Check** | Contrôles notés avec points, indices et rapport : équipements, câbles, adresses, ports, noms d'hôte, VLAN, lignes de configuration, tests personnalisés |
| 🩺 **Audit** | IP en double, conflits de sous-réseau sur un câble, liens coupés, hôtes sans adresse, ports d'accès dans le VLAN 1, port security absente, ports actifs inutilisés |
| 📟 **Lots** | `runOnAll("show ip int brief")`, `runOnDevices` et `commandsToScript()`, qui transforme des commandes tapées en CLI en script réutilisable |
| 🪟 **Espace de travail** | Zoom, arrière-plan, réseaux distants, ouverture et enregistrement de projets, événements de l'espace de travail |

Chaque fonction IOS a un jumeau `build...` qui renvoie les commandes au lieu de les envoyer, pour afficher, combiner et réutiliser la configuration.

## L'éditeur

<div align="center"><img src="../assets/banners/editor.svg" alt="Editor" width="100%"></div>

L'atelier ressemble à VS Code et se comporte comme lui. Il est écrit de zéro en ES5 pur et fonctionne donc dans la web view de Packet Tracer sans framework ni accès réseau.

| Élément | Description |
|---|---|
| **Barre de menus et palette de commandes** | Menus File, Edit, Selection, View, Go, Run, Network, Terminal et Help. `Ctrl+Shift+P` liste toutes les commandes, `Ctrl+P` ouvre un fichier, `Ctrl+G` va à une ligne |
| **Explorateur** | Éditeurs ouverts, un espace de travail de scripts enregistrés dans Packet Tracer et un vrai dossier du disque. Nouveau, renommer, supprimer |
| **Fichiers** | Open, Save et Save As utilisent les boîtes de dialogue de Packet Tracer. Import depuis le presse-papiers, export en téléchargement |
| **Onglets** | Un onglet par fichier avec point de modification, fermeture au clic central, demande d'enregistrement pour les fichiers sur disque, historique d'annulation propre à chaque onglet |
| **Coloration** | Couleurs Dark Modern : commentaires `#6A9955`, chaînes `#CE9178`, nombres `#B5CEA8`, mots-clés `#569CD6` et `#C586C0`, fonctions `#DCDCAA`, variables `#9CDCFE`, fonctions PTForge en gras `#4FC1FF`, paires de crochets colorées |
| **IntelliSense** | Suggestions parmi les 388 fonctions avec signature et description, mots du fichier, mots-clés. Aide aux paramètres pendant la saisie |
| **Problèmes** | Vérification syntaxique en direct avec la ligne exacte, noms de fonctions inconnus avec correction rapide *Did you mean*. Soulignements, marques dans la marge et panneau Problems |
| **Édition** | Fermeture automatique des paires, Entrée intelligente, `Ctrl+/` commentaire, `Alt+Up/Down` déplacer la ligne, `Shift+Alt+Down` copier la ligne, `Ctrl+Shift+K` supprimer la ligne, correspondance des crochets |
| **Rechercher et remplacer** | `Ctrl+F` et `Ctrl+H` avec casse, mot entier et expressions régulières, Tout remplacer en une seule annulation |
| **Panneau** | Problems, Output, Debug Console, Terminal et Lab Check. Redimensionnable, `Ctrl+J` le masque |
| **Vue Devices** | Équipements et ports en direct avec LED de lien et adresses, snapshots et outils réseau en un clic |
| **Barre d'état** | Nombre de problèmes, état d'exécution et de débogage, position du curseur, zoom, connexion à Packet Tracer |

<table>
<tr>
<td><img src="../assets/screenshots/lab-check.png" alt="Rapport Lab Check et vue Devices en direct" width="100%"><br><sub>Rapport Lab Check et vue Devices en direct</sub></td>
<td><img src="../assets/screenshots/command-palette.png" alt="Palette de commandes et référence des fonctions" width="100%"><br><sub>Palette de commandes et référence des fonctions</sub></td>
</tr>
<tr>
<td><img src="../assets/screenshots/problems.png" alt="Problems avec correction rapide" width="100%"><br><sub>Problems avec correction rapide</sub></td>
<td><img src="../assets/screenshots/find-replace.png" alt="Rechercher et remplacer" width="100%"><br><sub>Rechercher et remplacer</sub></td>
</tr>
</table>

## Terminal

<div align="center"><img src="../assets/banners/terminal.svg" alt="Terminal" width="100%"></div>

`` Ctrl+` `` ouvre un terminal JavaScript. Chaque ligne s'exécute aussitôt dans Packet Tracer et garde ses variables : vous explorez et modifiez une topologie pas à pas sans écrire de script au préalable.

| Fonction | Description |
|---|---|
| **Évaluation directe** | Toute expression ou instruction ; résultats sous forme d'arbres lisibles, erreurs en rouge |
| **Complétion** | `Tab` complète les fonctions PTForge, vos variables, les mots-clés et les commandes pointées |
| **Historique** | `Up` et `Down` parcourent les commandes précédentes, conservées entre les sessions |
| **Plusieurs terminaux** | `+` ouvre un autre terminal, la liste permet de basculer, la corbeille en ferme un |
| **Commandes pointées** | `.help`, `.clear`, `.devices`, `.ping`, `.trace`, `.show R1 show ip route`, `.cli R1` pour des commandes IOS sur un équipement, `.exit` pour sortir, `.audit`, `.snap`, `.diff`, `.calc 10.1.2.3/20`, `.run file.js`, `.history` |

<div align="center"><img src="../assets/screenshots/terminal.png" alt="Terminal" width="95%"></div>

Lisez le [guide du terminal](../docs/guides/terminal.md).

## Débogueur

<div align="center"><img src="../assets/banners/debugger.svg" alt="Debugger" width="100%"></div>

`F5` démarre une session de débogage. PTForge instrumente le script, l'exécute une fois dans Packet Tracer en enregistrant chaque étape, puis s'arrête au premier point d'arrêt. Toute l'exécution étant enregistrée, vous pouvez aussi revenir **en arrière**.

| Fonction | Description |
|---|---|
| **Points d'arrêt** | Clic dans la marge ou `F9`. Conditions, nombre de passages, logpoints, tout désactiver ou supprimer |
| **Exceptions** | Arrêt sur les exceptions non interceptées avec la ligne en surbrillance |
| **Pas à pas** | Continuer `F5`, pas principal `F10`, pas détaillé `F11`, pas sortant `Shift+F11`, pas arrière, redémarrer `Ctrl+Shift+F5`, arrêter `Shift+F5` |
| **Variables** | Portées Local, Closure et Script en arbres dépliables |
| **Watch** | Toute expression, évaluée à chaque étape enregistrée |
| **Call Stack** | Chaque cadre avec fichier et ligne. Cliquez sur un cadre pour voir ses variables |
| **Debug Console** | Évaluez des expressions dans le cadre arrêté |
| **Survol** | Survolez une variable dans l'éditeur pour voir sa valeur |

<div align="center"><img src="../assets/screenshots/debugger.png" alt="Debugger" width="95%"></div>

Lisez le [guide du débogueur](../docs/guides/debugger.md).

## Outils réseau

<div align="center"><img src="../assets/banners/network-tools.svg" alt="Network tools" width="100%"></div>

```js
pingAll();
takeSnapshot("before");
configureOspf("R1", { routerId: "1.1.1.1", networks: ["10.0.0.0/30"] });
compareSnapshots("before");
```

<table>
<tr>
<td><img src="../assets/screenshots/reachability.png" alt="Matrice d'accessibilité de pingAll()" width="100%"><br><sub>Matrice d'accessibilité de <code>pingAll()</code></sub></td>
<td><img src="../assets/screenshots/snapshot-diff.png" alt="Comparaison de snapshots avec diff de configuration" width="100%"><br><sub>Comparaison de snapshots avec diff de configuration</sub></td>
</tr>
<tr>
<td><img src="../assets/screenshots/calculator.png" alt="Calculatrice de sous-réseaux IPv4" width="100%"><br><sub>Calculatrice de sous-réseaux IPv4</sub></td>
<td><img src="../assets/screenshots/vlsm.png" alt="Planificateur VLSM" width="100%"><br><sub>Planificateur VLSM</sub></td>
</tr>
</table>

Lisez [Outils réseau](../docs/guides/network-tools.md), [Accessibilité](../docs/api/simulation.md#reachability) et [Snapshots](../docs/api/snapshots.md).

## Vérifier et auditer

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

Lisez [Lab Check](../docs/api/checks.md), [Audit](../docs/api/audit.md) et [Commandes par lots](../docs/api/ios.md#batch-commands).

## Installation

PTForge est un Script Module de Packet Tracer. Packet Tracer chiffre les paquets `.pts` et lui seul peut les créer ; vous construisez donc le module une fois à partir des fichiers de ce dépôt.

1. Téléchargez la [dernière version](https://github.com/r4chan842/PTForge/releases/latest) ou clonez le dépôt
2. Dans Packet Tracer, ouvrez `Extensions` → `Scripting` → `Configure PT Script Modules`
3. Créez un module nommé `PTForge`
4. Ajoutez un fichier de script contenant [`release/ptforge.js`](../release/ptforge.js)
5. Ajoutez les quatorze fichiers de [`src/ui`](../src/ui) comme fichiers d'interface : `index.html`, `style.css`, `catalog.js`, `snippets.js`, `highlight.js`, `lint.js`, `netcalc.js`, `editor.js`, `acorn.js`, `instrument.js`, `terminal.js`, `debugview.js`, `views.js`, `interface.js`
6. Enregistrez et démarrez le module, puis ouvrez `Extensions` → `PTForge Editor`

Le [guide d'installation](../docs/guides/installation.md) détaille chaque étape et les mises à jour.

## Exemples

34 labs complets dans [`examples/`](../examples/README.md), chacun part d'un espace de travail vide :

| Dossier | Labs |
|---|---|
| `01-basics` | Premier réseau, modules et liaisons série, configuration de base sécurisée |
| `02-switching` | VLAN et trunks, EtherChannel, racine STP, commutateur de niveau 3 |
| `03-routing` | Statique, OSPF multi-zones, EIGRP, BGP, IPv6 avec OSPFv3 |
| `04-security` | ACL, NAT et PAT, SSH et port security, HSRP |
| `05-services` | DHCP, DNS et web sur serveur, FTP et e-mail, DHCP routeur avec relais |
| `06-wireless` | Sans-fil domestique |
| `07-canvas` | Étiquettes et zones |
| `08-topology` | Campus généré, étoile, anneau et maillage, plan VLSM |
| `09-simulation` | Test de ping |
| `10-ccna-labs` | Router-on-a-stick, lab d'entreprise complet |
| `11-inspection` | Vérifier la commutation, audit port security |
| `12-automation` | Sauvegarde de configuration, audit de commandes, bibliothèque de scripts |
| `13-operations` | Test d'accessibilité, suivi des changements par snapshots |

Des points de départ pour vos propres travaux se trouvent dans [`templates/`](../templates/README.md) : lab vide, campus, WAN d'agences et petit bureau.

## Documentation

| Section | Contenu |
|---|---|
| [Premiers pas](../docs/guides/getting-started.md) | Votre premier réseau en dix minutes |
| [Guide de l'éditeur](../docs/guides/editor.md) | Espace de travail, fichiers, IntelliSense, problèmes |
| [Terminal](../docs/guides/terminal.md) | JavaScript interactif et CLI des équipements |
| [Débogueur](../docs/guides/debugger.md) | Points d'arrêt, pas à pas, variables et watch |
| [Outils réseau](../docs/guides/network-tools.md) | Calculatrice, accessibilité et snapshots |
| [Écrire des scripts](../docs/guides/writing-scripts.md) | Structure, ordre, builders, vitesse |
| [Référence API](../docs/api/README.md) | Chaque fonction avec arguments, valeurs de retour et exemples |
| [Recettes](../docs/recipes/README.md) | Commutation de campus, labs de routage, routeur de bordure, serveurs, schémas |
| [Carte des thèmes CCNA](../docs/ccna/README.md) | Thèmes du CCNA 200-301 avec fonctions et exemples correspondants |
| [Aide-mémoire](../docs/cheatsheets/ios-to-ptforge.md) | D'IOS à PTForge, sous-réseaux, raccourcis de l'éditeur |
| [Architecture](../docs/architecture/overview.md) | Couches, exécution, pont de l'éditeur, débogueur, tests |
| [Dépannage](../docs/guides/troubleshooting.md) | Erreurs fréquentes et solutions |
| [Limites](../docs/guides/limitations.md) | Ce que l'API de Packet Tracer ne permet pas |
| [FAQ](../docs/guides/faq.md) | Réponses courtes |

## Structure du projet

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

## Développement

Nécessite Node.js 18 ou plus récent. Aucune dépendance d'exécution.

```
git clone https://github.com/r4chan842/PTForge.git
cd PTForge
npm run check
```

| Commande | Rôle |
|---|---|
| `npm test` | Lancer tous les tests |
| `npm run bundle` | Reconstruire `release/ptforge.js` |
| `npm run catalog` | Générer la liste des fonctions de l'éditeur depuis `docs/api` |
| `npm run reference` | Générer les tables de référence depuis `src/data` |
| `npm run check` | Liste des fonctions, bundle, contrôle syntaxique et tests |
| `npm run ui-test` | 41 contrôles navigateur de l'atelier, du terminal et du débogueur avec Playwright |
| `npm run screenshots` | Régénérer les captures de `assets/screenshots` |

La suite de tests exécute toute l'extension contre une réplique de l'API IPC de Packet Tracer. Elle couvre chaque fonction publique, chaque exemple, modèle et recette, le bundle, les moteurs du terminal et du débogueur et les règles du projet. Détails dans [Tests](../docs/architecture/testing.md).

## Contribuer

Rapports de bugs, idées et pull requests sont les bienvenus. Commencez par [CONTRIBUTING](../CONTRIBUTING.md), consultez la [feuille de route](../ROADMAP.md) et respectez le [code de conduite](../CODE_OF_CONDUCT.md). Les problèmes de sécurité passent par la [politique de sécurité](../SECURITY.md). Questions : [SUPPORT](../SUPPORT.md).

## Licence

PTForge est publié sous [licence MIT](../LICENSE). Le débogueur utilise [Acorn](https://github.com/acornjs/acorn) (MIT), voir [THIRD_PARTY_NOTICES](../THIRD_PARTY_NOTICES.md).

## Remerciements

L'utilisation de l'API Packet Tracer suit la [documentation officielle de l'API IPC de Cisco Packet Tracer](https://tutorials.ptnetacad.net/help/default/IpcAPI/classes.html). Les couleurs de l'atelier suivent le thème Dark Modern de VS Code.

Cisco et Packet Tracer sont des marques de Cisco Systems, Inc. Ce projet n'est ni affilié à Cisco Systems, Inc. ni approuvé par Cisco.

<div align="center">
<sub>Conçu pour les étudiants et enseignants en réseaux, et pour tous ceux qui ne veulent pas remonter le même lab à la main deux fois.</sub>
</div>
