<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="../assets/brand/logo-dark.svg">
  <img src="../assets/brand/logo.svg" alt="PTForge" width="300">
</picture>

<br><br>

**Construye, configura, depura y verifica redes completas de Cisco Packet Tracer con JavaScript.**

[![Release](https://img.shields.io/github/v/release/r4chan842/PTForge?color=1A5DB7)](https://github.com/r4chan842/PTForge/releases/latest)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](../LICENSE)
![Functions](https://img.shields.io/badge/functions-388-1A5DB7)
![Packet Tracer](https://img.shields.io/badge/Packet%20Tracer-8.x%2B-1ba0d7)
![Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)

[Inicio rápido](#inicio-rápido) ·
[Instalación](../docs/guides/installation.md) ·
[Documentación](../docs/README.md) ·
[API](../docs/api/README.md) ·
[Ejemplos](../examples/README.md) ·
[Mapa CCNA](../docs/ccna/README.md)

[English](../README.md) ·
[فارسی](README.fa.md) ·
[Deutsch](README.de.md) ·
**Español** ·
[Français](README.fr.md) ·
[Português](README.pt-BR.md) ·
[Русский](README.ru.md) ·
[Türkçe](README.tr.md) ·
[العربية](README.ar.md) ·
[中文](README.zh-CN.md) ·
[日本語](README.ja.md)

</div>

---

> Esta es una traducción. La versión de referencia es el [README en inglés](../README.md).

## Por qué PTForge

Montar un laboratorio en Packet Tracer significa arrastrar dispositivos, elegir cables, abrir cada CLI y escribir los mismos comandos una y otra vez. Un error en una lista de VLAN o en una máscara wildcard puede costar una hora.

PTForge sustituye los clics por un script. Describes la red una vez, pulsas **Run** y Packet Tracer la construye: dispositivos, módulos, cables, configuración IOS, servicios de servidor, inalámbrico, etiquetas y zonas. Después PTForge lee el estado real, para que el mismo script compruebe su propio trabajo.

- **Repetible**: reconstruye un laboratorio desde cero en segundos, tantas veces como quieras
- **Compartible**: un laboratorio es un archivo de texto que se puede enviar, revisar y guardar en Git
- **Correcto**: direcciones, máscaras y wildcards se calculan, y los errores de escritura dan mensajes claros
- **Verificable**: las funciones de inspección leen VLAN, trunks, STP, port security y procesos de enrutamiento directamente de Packet Tracer
- **Depurable**: pon puntos de interrupción, recorre un script paso a paso y lee cada variable, como en VS Code
- **Interactivo**: un terminal JavaScript modifica la topología abierta línea a línea

<div align="center">
<img src="../assets/screenshots/editor.png" alt="PTForge" width="95%">
<br><sub>El entorno de PTForge dentro de Packet Tracer: explorador, pestañas, IntelliSense, resaltado Dark Modern y salida</sub>
</div>

## Novedades en 1.2

|  |  |
|---|---|
| 🖥️ **Terminal JavaScript** | `` Ctrl+` `` abre un terminal como *New Terminal* de VS Code. Cada línea se ejecuta directamente sobre la topología abierta, con historial, autocompletado con Tab y comandos con punto como `.calc`, `.ping` y `.cli R1` |
| 🐞 **Depurador** | `F5` ejecuta el script registrando cada paso. Se detiene en puntos de interrupción, condiciones y excepciones; paso por encima, hacia dentro, hacia fuera y **hacia atrás**; lee Variables, Watch y Call Stack y evalúa expresiones en la Debug Console |
| 🧮 **Calculadora de red** | Subred IPv4, división en subredes, planificador VLSM, resumen de rutas, rango a CIDR, máscaras wildcard, IPv6, EUI-64 y conversión de bases en una pestaña del editor |
| 📡 **Matriz de alcance** | `pingAll()` hace ping a cada dirección desde cada router y switch y muestra una matriz en color con pérdidas y tiempos de ida y vuelta |
| 📸 **Snapshots y diff** | `takeSnapshot()` guarda dispositivos, enlaces, direcciones, puertos, estado de encendido y running-config. Compara dos snapshots y ve la configuración línea a línea |
| 🎨 **Dark Modern** | Colores, espaciado, pestañas, paneles y barra de estado siguen exactamente el tema Dark Modern de VS Code; la barra de estado se vuelve azul al depurar |

## Inicio rápido

1. Descarga la [última versión](https://github.com/r4chan842/PTForge/releases/latest) y sigue la [guía de instalación](../docs/guides/installation.md)
2. Abre `Extensions` → `PTForge Editor`
3. Abre un script de [`examples/`](../examples/README.md) con `Ctrl+O` y pulsa `Ctrl+F5` para ejecutar o `F5` para depurar
4. Pulsa `` Ctrl+` `` y prueba `getDevices()` en el terminal
5. Verifica el resultado con `auditNetwork()`, `pingAll()` o un [Lab Check](../docs/api/checks.md)

## Un ejemplo rápido

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

Veinte líneas producen un router, un switch, cuatro PC con dirección, un router reforzado con SSH, VLAN, puertos de acceso protegidos, un diagrama etiquetado, una línea base guardada y una prueba de alcance completa.

## Funciones

| Área | Qué puedes hacer |
|---|---|
| 🖥️ **Dispositivos** | Añadir, eliminar, renombrar, mover, reiniciar, instalar módulos, leer puertos, guardar datos propios, colocar dispositivos en el espacio físico |
| 🔌 **Enlaces** | Cualquier tipo de cable, borrar enlaces, conexión automática, listar vecinos, comprobar el estado del enlace |
| 💻 **Hosts** | IPv4 estática o DHCP, IPv6 con SLAAC, puerta de enlace, DNS, firewall, símbolo del sistema |
| ⚙️ **Cisco IOS** | Configuración básica, contraseñas, banners, usuarios, interfaces, subinterfaces, loopbacks, router-on-a-stick, pools y relay DHCP, NTP, syslog, SNMP, CDP, LLDP, comandos show |
| 🔀 **Switching** | VLAN, puertos de acceso y voz, trunks, DTP, EtherChannel (LACP, PAgP, estático, capa 3), Rapid PVST+, PortFast, BPDU Guard, VTP, port security, DHCP snooping, DAI |
| 🧭 **Enrutamiento** | Rutas estáticas y flotantes, OSPF, OSPFv3, EIGRP, EIGRP para IPv6, RIP, RIPng, BGP, redistribución |
| 🛡️ **Seguridad** | ACL estándar, extendidas, con nombre e IPv6, NAT, PAT, pools NAT, reenvío de puertos, SSH, bloqueo de inicio de sesión, AAA con RADIUS y TACACS+ |
| ♻️ **Redundancia** | HSRP en un router o como par activo y en espera |
| 🗄️ **Servidores** | DHCP, DNS (A, CNAME, NS), HTTP, HTTPS, páginas web, usuarios FTP, cuentas de correo, TFTP, syslog, RADIUS |
| 📶 **Inalámbrico** | SSID, WPA2, WPA, WEP, modo de radio, SSID oculto, filtro MAC |
| 🔍 **Inspección** | Estado de puertos del switch, contadores de port security, base de datos VLAN, raíz STP y puertos raíz, VTP, MAC estáticas, procesos OSPF y EIGRP |
| 📡 **Alcance** | `pingAll`, `pingMatrix` y `reachability` con pérdidas, tiempos de ida y vuelta y vista de matriz |
| 📸 **Snapshots** | `takeSnapshot`, `getSnapshots`, `compareSnapshots`, `showSnapshotDiff`, guardar y cargar archivos de snapshot y una vista de diff de configuración |
| 📁 **Archivos** | Leer y escribir archivos de texto, ejecutar scripts desde disco, exportar configuraciones y topología, registro de comandos |
| 🎨 **Lienzo** | Notas, líneas, círculos, rectángulos, flechas, líneas discontinuas, zonas, etiquetas de dispositivos y enlaces, capas |
| 🗺️ **Topología** | Generadores de estrella, anillo, línea, malla y LAN, disposición en rejilla y círculo, planificadores VLSM y /30 |
| 🧪 **Simulación** | Modo simulación, PDU, filtros de protocolo, ejecución paso a paso, ping, traceroute |
| ✅ **Lab Check** | Comprobaciones puntuadas con puntos, pistas e informe: dispositivos, cables, direcciones, puertos, nombres de host, VLAN, líneas de configuración, pruebas propias |
| 🩺 **Auditoría** | IP duplicadas, conflictos de subred entre cables, enlaces caídos, hosts sin dirección, puertos de acceso en VLAN 1, falta de port security, puertos activos sin uso |
| 📟 **Lotes** | `runOnAll("show ip int brief")`, `runOnDevices` y `commandsToScript()`, que convierte comandos escritos en la CLI en un script reutilizable |
| 🪟 **Espacio de trabajo** | Zoom, fondo, redes remotas, abrir y guardar proyectos, eventos del espacio de trabajo |

Cada función auxiliar de IOS tiene un gemelo `build...` que devuelve los comandos en lugar de enviarlos, para que puedas ver, combinar y reutilizar la configuración.

## El editor

<div align="center"><img src="../assets/banners/editor.svg" alt="Editor" width="100%"></div>

El entorno se ve y se comporta como VS Code. Está escrito desde cero en ES5 puro, así que funciona dentro de la web view de Packet Tracer sin framework y sin acceso a la red.

| Parte | Descripción |
|---|---|
| **Barra de menús y paleta de comandos** | Menús File, Edit, Selection, View, Go, Run, Network, Terminal y Help. `Ctrl+Shift+P` lista todos los comandos, `Ctrl+P` salta a un archivo, `Ctrl+G` a una línea |
| **Explorador** | Editores abiertos, un espacio de trabajo con scripts guardados en Packet Tracer y una carpeta real del disco. Nuevo, renombrar, eliminar |
| **Archivos** | Open, Save y Save As usan los diálogos de archivo de Packet Tracer. Importar desde el portapapeles, exportar como descarga |
| **Pestañas** | Una pestaña por archivo con punto de cambios, cierre con clic central, aviso de guardado para archivos en disco, historial de deshacer propio por pestaña |
| **Resaltado** | Colores Dark Modern: comentarios `#6A9955`, cadenas `#CE9178`, números `#B5CEA8`, palabras clave `#569CD6` y `#C586C0`, funciones `#DCDCAA`, variables `#9CDCFE`, funciones PTForge en negrita `#4FC1FF`, pares de corchetes en color |
| **IntelliSense** | Sugerencias de las 388 funciones con firma y descripción, palabras del archivo, palabras clave. Ayuda de parámetros al escribir |
| **Problemas** | Comprobación de sintaxis en vivo con la línea exacta, nombres de función desconocidos con la corrección rápida *Did you mean*. Subrayados, marcas en el margen y panel Problems |
| **Edición** | Cierre automático de pares, Enter inteligente, `Ctrl+/` comentario, `Alt+Up/Down` mover línea, `Shift+Alt+Down` copiar línea, `Ctrl+Shift+K` borrar línea, emparejamiento de corchetes |
| **Buscar y reemplazar** | `Ctrl+F` y `Ctrl+H` con mayúsculas, palabra completa y expresiones regulares, Reemplazar todo en un solo paso de deshacer |
| **Panel** | Problems, Output, Debug Console, Terminal y Lab Check. Redimensionable, `Ctrl+J` lo oculta |
| **Vista Devices** | Dispositivos y puertos en vivo con LED de enlace y direcciones, snapshots y herramientas de red con un clic |
| **Barra de estado** | Número de problemas, estado de ejecución y depuración, posición del cursor, zoom, conexión con Packet Tracer |

<table>
<tr>
<td><img src="../assets/screenshots/lab-check.png" alt="Informe Lab Check y vista Devices en vivo" width="100%"><br><sub>Informe Lab Check y vista Devices en vivo</sub></td>
<td><img src="../assets/screenshots/command-palette.png" alt="Paleta de comandos y referencia de funciones" width="100%"><br><sub>Paleta de comandos y referencia de funciones</sub></td>
</tr>
<tr>
<td><img src="../assets/screenshots/problems.png" alt="Problems con corrección rápida" width="100%"><br><sub>Problems con corrección rápida</sub></td>
<td><img src="../assets/screenshots/find-replace.png" alt="Buscar y reemplazar" width="100%"><br><sub>Buscar y reemplazar</sub></td>
</tr>
</table>

## Terminal

<div align="center"><img src="../assets/banners/terminal.svg" alt="Terminal" width="100%"></div>

`` Ctrl+` `` abre un terminal JavaScript. Cada línea se ejecuta al instante en Packet Tracer y conserva sus variables, así puedes explorar y cambiar una topología paso a paso sin escribir antes un script.

| Función | Descripción |
|---|---|
| **Evaluación directa** | Cualquier expresión o sentencia; resultados como árboles legibles, errores en rojo |
| **Autocompletado** | `Tab` completa funciones PTForge, tus variables, palabras clave y comandos con punto |
| **Historial** | `Up` y `Down` recorren comandos anteriores, que se guardan entre sesiones |
| **Varios terminales** | `+` abre otro terminal, la lista cambia entre ellos, la papelera cierra uno |
| **Comandos con punto** | `.help`, `.clear`, `.devices`, `.ping`, `.trace`, `.show R1 show ip route`, `.cli R1` para comandos IOS en un dispositivo, `.exit` para salir, `.audit`, `.snap`, `.diff`, `.calc 10.1.2.3/20`, `.run file.js`, `.history` |

<div align="center"><img src="../assets/screenshots/terminal.png" alt="Terminal" width="95%"></div>

Lee la [guía del terminal](../docs/guides/terminal.md).

## Depurador

<div align="center"><img src="../assets/banners/debugger.svg" alt="Debugger" width="100%"></div>

`F5` inicia una sesión de depuración. PTForge instrumenta el script, lo ejecuta una vez en Packet Tracer registrando cada paso y se detiene en el primer punto de interrupción. Como toda la ejecución queda registrada, también puedes ir **hacia atrás**.

| Función | Descripción |
|---|---|
| **Puntos de interrupción** | Clic en el margen o `F9`. Condiciones, contador de aciertos, logpoints, desactivar o quitar todos |
| **Excepciones** | Se detiene en excepciones no capturadas con la línea resaltada |
| **Pasos** | Continuar `F5`, paso por encima `F10`, hacia dentro `F11`, hacia fuera `Shift+F11`, hacia atrás, reiniciar `Ctrl+Shift+F5`, detener `Shift+F5` |
| **Variables** | Ámbitos Local, Closure y Script como árboles desplegables |
| **Watch** | Cualquier expresión, evaluada en cada paso registrado |
| **Call Stack** | Cada marco con archivo y línea. Clic en un marco para ver sus variables |
| **Debug Console** | Evalúa expresiones en el marco detenido |
| **Hover** | Pasa el ratón sobre una variable en el editor para ver su valor |

<div align="center"><img src="../assets/screenshots/debugger.png" alt="Debugger" width="95%"></div>

Lee la [guía del depurador](../docs/guides/debugger.md).

## Herramientas de red

<div align="center"><img src="../assets/banners/network-tools.svg" alt="Network tools" width="100%"></div>

```js
pingAll();
takeSnapshot("before");
configureOspf("R1", { routerId: "1.1.1.1", networks: ["10.0.0.0/30"] });
compareSnapshots("before");
```

<table>
<tr>
<td><img src="../assets/screenshots/reachability.png" alt="Matriz de alcance de pingAll()" width="100%"><br><sub>Matriz de alcance de <code>pingAll()</code></sub></td>
<td><img src="../assets/screenshots/snapshot-diff.png" alt="Comparación de snapshots con diff de configuración" width="100%"><br><sub>Comparación de snapshots con diff de configuración</sub></td>
</tr>
<tr>
<td><img src="../assets/screenshots/calculator.png" alt="Calculadora de subredes IPv4" width="100%"><br><sub>Calculadora de subredes IPv4</sub></td>
<td><img src="../assets/screenshots/vlsm.png" alt="Planificador VLSM" width="100%"><br><sub>Planificador VLSM</sub></td>
</tr>
</table>

Lee [Herramientas de red](../docs/guides/network-tools.md), [Alcance](../docs/api/simulation.md#reachability) y [Snapshots](../docs/api/snapshots.md).

## Verificar y auditar

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

Lee [Lab Check](../docs/api/checks.md), [Auditoría](../docs/api/audit.md) y [Comandos por lotes](../docs/api/ios.md#batch-commands).

## Instalación

PTForge es un Script Module de Packet Tracer. Packet Tracer cifra los paquetes `.pts` y solo él puede crearlos, así que construyes el módulo una vez con los archivos de este repositorio.

1. Descarga la [última versión](https://github.com/r4chan842/PTForge/releases/latest) o clona el repositorio
2. En Packet Tracer abre `Extensions` → `Scripting` → `Configure PT Script Modules`
3. Crea un módulo llamado `PTForge`
4. Añade un archivo de script con el contenido de [`release/ptforge.js`](../release/ptforge.js)
5. Añade los catorce archivos de [`src/ui`](../src/ui) como archivos de interfaz: `index.html`, `style.css`, `catalog.js`, `snippets.js`, `highlight.js`, `lint.js`, `netcalc.js`, `editor.js`, `acorn.js`, `instrument.js`, `terminal.js`, `debugview.js`, `views.js`, `interface.js`
6. Guarda e inicia el módulo y abre `Extensions` → `PTForge Editor`

La [guía de instalación](../docs/guides/installation.md) explica cada paso y las actualizaciones.

## Ejemplos

34 laboratorios completos en [`examples/`](../examples/README.md), cada uno empieza con un espacio de trabajo vacío:

| Carpeta | Laboratorios |
|---|---|
| `01-basics` | Primera red, módulos y enlaces serie, configuración básica segura |
| `02-switching` | VLAN y trunks, EtherChannel, raíz STP, switch de capa 3 |
| `03-routing` | Estático, OSPF multiárea, EIGRP, BGP, IPv6 con OSPFv3 |
| `04-security` | ACL, NAT y PAT, SSH y port security, HSRP |
| `05-services` | DHCP, DNS y web en servidor, FTP y correo, DHCP en router con relay |
| `06-wireless` | Inalámbrico doméstico |
| `07-canvas` | Etiquetas y zonas |
| `08-topology` | Campus generado, estrella, anillo y malla, plan VLSM |
| `09-simulation` | Prueba de ping |
| `10-ccna-labs` | Router-on-a-stick, laboratorio empresarial completo |
| `11-inspection` | Verificar switching, auditoría de port security |
| `12-automation` | Copia de configuraciones, auditoría de comandos, biblioteca de scripts |
| `13-operations` | Prueba de alcance, seguimiento de cambios con snapshots |

Puntos de partida para tu propio trabajo en [`templates/`](../templates/README.md): laboratorio vacío, campus, WAN de sucursales y oficina pequeña.

## Documentación

| Sección | Contenido |
|---|---|
| [Primeros pasos](../docs/guides/getting-started.md) | Tu primera red en diez minutos |
| [Guía del editor](../docs/guides/editor.md) | Espacio de trabajo, archivos, IntelliSense, problemas |
| [Terminal](../docs/guides/terminal.md) | JavaScript interactivo y CLI de dispositivos |
| [Depurador](../docs/guides/debugger.md) | Puntos de interrupción, pasos, variables y watch |
| [Herramientas de red](../docs/guides/network-tools.md) | Calculadora, alcance y snapshots |
| [Escribir scripts](../docs/guides/writing-scripts.md) | Estructura, orden, builders, velocidad |
| [Referencia de la API](../docs/api/README.md) | Cada función con argumentos, valores de retorno y ejemplos |
| [Recetas](../docs/recipes/README.md) | Switching de campus, laboratorios de enrutamiento, router de borde, servidores, diagramas |
| [Mapa de temas CCNA](../docs/ccna/README.md) | Temas de CCNA 200-301 con sus funciones y ejemplos |
| [Chuletas](../docs/cheatsheets/ios-to-ptforge.md) | De IOS a PTForge, subnetting, teclas del editor |
| [Arquitectura](../docs/architecture/overview.md) | Capas, entorno de ejecución, puente del editor, depurador, pruebas |
| [Solución de problemas](../docs/guides/troubleshooting.md) | Errores comunes y soluciones |
| [Limitaciones](../docs/guides/limitations.md) | Lo que la API de Packet Tracer no permite |
| [Preguntas frecuentes](../docs/guides/faq.md) | Respuestas breves |

## Estructura del proyecto

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

## Desarrollo

Requiere Node.js 18 o superior. No hay dependencias en tiempo de ejecución.

```
git clone https://github.com/r4chan842/PTForge.git
cd PTForge
npm run check
```

| Comando | Propósito |
|---|---|
| `npm test` | Ejecutar todas las pruebas |
| `npm run bundle` | Reconstruir `release/ptforge.js` |
| `npm run catalog` | Generar la lista de funciones del editor a partir de `docs/api` |
| `npm run reference` | Generar las tablas de referencia a partir de `src/data` |
| `npm run check` | Lista de funciones, bundle, comprobación de sintaxis y pruebas |
| `npm run ui-test` | 41 comprobaciones en navegador del entorno, el terminal y el depurador con Playwright |
| `npm run screenshots` | Regenerar las capturas de `assets/screenshots` |

La batería de pruebas ejecuta toda la extensión contra una réplica de la API IPC de Packet Tracer. Cubre cada función pública, cada ejemplo, plantilla y receta, el bundle, los motores del terminal y del depurador y las reglas del proyecto. Detalles en [Pruebas](../docs/architecture/testing.md).

## Contribuir

Informes de errores, ideas y pull requests son bienvenidos. Empieza por [CONTRIBUTING](../CONTRIBUTING.md), revisa la [hoja de ruta](../ROADMAP.md) y respeta el [código de conducta](../CODE_OF_CONDUCT.md). Los problemas de seguridad van por la [política de seguridad](../SECURITY.md). Preguntas: [SUPPORT](../SUPPORT.md).

## Licencia

PTForge se publica bajo la [licencia MIT](../LICENSE). El depurador usa [Acorn](https://github.com/acornjs/acorn) (MIT), consulta [THIRD_PARTY_NOTICES](../THIRD_PARTY_NOTICES.md).

## Agradecimientos

El uso de la API de Packet Tracer sigue la [documentación oficial de la API IPC de Cisco Packet Tracer](https://tutorials.ptnetacad.net/help/default/IpcAPI/classes.html). Los colores del entorno siguen el tema Dark Modern de VS Code.

Cisco y Packet Tracer son marcas de Cisco Systems, Inc. Este proyecto no está afiliado ni respaldado por Cisco Systems, Inc.

<div align="center">
<sub>Hecho para estudiantes y docentes de redes y para cualquiera que no quiera montar el mismo laboratorio a mano dos veces.</sub>
</div>
