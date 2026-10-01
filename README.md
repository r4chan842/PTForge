```
 ____ _____ _____
|  _ \_   _|  ___|__  _ __ __ _  ___
| |_) || | | |_ / _ \| '__/ _` |/ _ \
|  __/ | | |  _| (_) | | | (_| |  __/
|_|    |_| |_|  \___/|_|  \__, |\___|
                          |___/
```

PTForge
=======

PTForge is a JavaScript scripting extension for Cisco Packet Tracer. It adds
an editor, a terminal and a debugger to Packet Tracer, and a library of more
than 380 functions for building topologies, configuring Cisco IOS devices,
servers and hosts, and verifying the result.

> [!WARNING]
> PTForge is in early development and still contains known bugs. Several
> features have only been tested outside Packet Tracer. Check the results of
> your scripts, keep backups of your `.pkt` files, and report problems in the
> [issue tracker](https://github.com/r4chan842/PTForge/issues).

Translations: [فارسی](i18n/README.fa.md), [Deutsch](i18n/README.de.md),
[Español](i18n/README.es.md), [Français](i18n/README.fr.md),
[Português](i18n/README.pt-BR.md), [Русский](i18n/README.ru.md),
[Türkçe](i18n/README.tr.md), [العربية](i18n/README.ar.md),
[中文](i18n/README.zh-CN.md), [日本語](i18n/README.ja.md)


Quick Start
-----------

* Get the latest release: https://github.com/r4chan842/PTForge/releases/latest
* Install it: see [docs/guides/installation.md](docs/guides/installation.md)
* Write a first script: see [docs/guides/getting-started.md](docs/guides/getting-started.md)
* Report a bug: https://github.com/r4chan842/PTForge/issues

A short script looks like this:

```js
addDevice("R1", "2911", 300, 80);
addDevice("S1", "2960-24TT", 300, 220);
addLink("R1", "GigabitEthernet0/0", "S1", "GigabitEthernet0/1", "straight");
setInterfaceIp("R1", "GigabitEthernet0/0", "192.168.10.1/24");
createVlans("S1", { 10: "USERS" });
pingAll();
```


Essential Documentation
-----------------------

All users should be familiar with:

* Requirements and installation: [docs/guides/installation.md](docs/guides/installation.md)
* Known limitations: [docs/guides/limitations.md](docs/guides/limitations.md)
* Function reference: [docs/api/README.md](docs/api/README.md)
* License: see [LICENSE](LICENSE)

A complete list of documents is kept in [docs/README.md](docs/README.md).


Who Are You?
============

Find your role below:

* Student: Building and checking CCNA labs
* Instructor: Preparing labs and grading them
* Network Engineer: Automating topologies and configurations
* Plugin Author: Extending PTForge with `.pf` plugins
* Contributor: Working on PTForge itself


For Specific Users
==================

Student
-------

* Getting Started: [docs/guides/getting-started.md](docs/guides/getting-started.md)
* CCNA Topics: [docs/ccna/README.md](docs/ccna/README.md)
* Examples: [examples/README.md](examples/README.md)
* Subnetting Cheat Sheet: [docs/cheatsheets/subnetting.md](docs/cheatsheets/subnetting.md)
* Terminal: [docs/guides/terminal.md](docs/guides/terminal.md)

Instructor
----------

* Lab Check: [docs/api/checks.md](docs/api/checks.md)
* Audit: [docs/api/audit.md](docs/api/audit.md)
* Lab Templates: [templates/README.md](templates/README.md)
* Lab Checklist: [docs/ccna/lab-checklist.md](docs/ccna/lab-checklist.md)

Network Engineer
----------------

* Writing Scripts: [docs/guides/writing-scripts.md](docs/guides/writing-scripts.md)
* Cisco IOS Functions: [docs/api/ios.md](docs/api/ios.md)
* Network Tools: [docs/guides/network-tools.md](docs/guides/network-tools.md)
* Recipes: [docs/recipes/README.md](docs/recipes/README.md)
* Debugger: [docs/guides/debugger.md](docs/guides/debugger.md)

Plugin Author
-------------

* Plugin Guide: [docs/guides/plugins.md](docs/guides/plugins.md)
* Plugin Functions: [docs/api/plugins.md](docs/api/plugins.md)
* Sample Plugins: [plugins/](plugins)

Contributor
-----------

* Contributing: [CONTRIBUTING.md](CONTRIBUTING.md)
* Architecture: [docs/architecture/overview.md](docs/architecture/overview.md)
* Testing: [docs/architecture/testing.md](docs/architecture/testing.md)
* Code of Conduct: [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
* Security Policy: [SECURITY.md](SECURITY.md)


Communication and Support
=========================

* Issues: https://github.com/r4chan842/PTForge/issues
* Discussions: https://github.com/r4chan842/PTForge/discussions
* Changes between releases: [CHANGELOG.md](CHANGELOG.md)
* Support: [SUPPORT.md](SUPPORT.md)


License
=======

PTForge is distributed under the MIT License. Third-party components are
listed in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

Cisco and Packet Tracer are trademarks of Cisco Systems, Inc. PTForge is not
affiliated with or endorsed by Cisco Systems, Inc.
