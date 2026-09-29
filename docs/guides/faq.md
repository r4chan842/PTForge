# FAQ

← [Documentation](../README.md)

**What is PTForge?**
A Packet Tracer extension that turns JavaScript into complete networks: devices, cabling, IOS configuration, server services, wireless, diagrams and checks.

**Do old scripts keep working between versions?**
Public function names and arguments only change in major versions, and every change is listed in `CHANGELOG.md`. `configureIosDevice` returns rejected commands and saves by default. Pass `false` as the third argument to skip saving.

**Which Packet Tracer version do I need?**
Any version with the Extensions scripting menu (8.x and newer).

**Does it work on Linux and macOS?**
Script modules are part of Packet Tracer itself, so it should work wherever Packet Tracer runs.

**Can I use it in exams or graded labs?**
Follow the rules of your course. Activity files can lock scripting.

**Why is there no `.pts` file?**
Packet Tracer encrypts packages and only Packet Tracer can create them. See [installation](installation.md).

**Why ES5?**
It is what the Packet Tracer script engine runs.

**Can I call Packet Tracer API directly?**
Yes. `ipc` is available in every script, for example `ipc.network().getDeviceCount()`.

**How do I see what a helper will send?**
Use its `build...` twin, for example `showResult(buildOspf({ networks: ["10.0.0.0/8"] }))`.

**Where are the examples?**
In `examples/`, grouped by topic from basics to complete CCNA labs.
