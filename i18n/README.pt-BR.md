<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="../assets/brand/logo-dark.svg">
  <img src="../assets/brand/logo.svg" alt="PTForge" width="300">
</picture>

<br><br>

**Construa, configure, depure e verifique redes completas do Cisco Packet Tracer com JavaScript.**

[![Release](https://img.shields.io/github/v/release/r4chan842/PTForge?color=1A5DB7)](https://github.com/r4chan842/PTForge/releases/latest)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](../LICENSE)
![Functions](https://img.shields.io/badge/functions-388-1A5DB7)
![Packet Tracer](https://img.shields.io/badge/Packet%20Tracer-8.x%2B-1ba0d7)
![Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)

[Início rápido](#início-rápido) ·
[Instalação](../docs/guides/installation.md) ·
[Documentação](../docs/README.md) ·
[API](../docs/api/README.md) ·
[Exemplos](../examples/README.md) ·
[Mapa CCNA](../docs/ccna/README.md)

[English](../README.md) ·
[فارسی](README.fa.md) ·
[Deutsch](README.de.md) ·
[Español](README.es.md) ·
[Français](README.fr.md) ·
**Português** ·
[Русский](README.ru.md) ·
[Türkçe](README.tr.md) ·
[العربية](README.ar.md) ·
[中文](README.zh-CN.md) ·
[日本語](README.ja.md)

</div>

---

> Esta é uma tradução. A versão de referência é o [README em inglês](../README.md).

## Por que PTForge

Montar um laboratório no Packet Tracer significa arrastar dispositivos, escolher cabos, abrir cada CLI e digitar os mesmos comandos várias vezes. Um erro de digitação numa lista de VLANs ou numa máscara curinga pode custar uma hora.

O PTForge troca os cliques por um script. Você descreve a rede uma vez, pressiona **Run** e o Packet Tracer a constrói: dispositivos, módulos, cabos, configuração IOS, serviços de servidor, rede sem fio, rótulos e zonas. Depois o PTForge lê o estado real, para que o mesmo script confira o próprio trabalho.

- **Repetível**: reconstrua um laboratório do zero em segundos, quantas vezes quiser
- **Compartilhável**: um laboratório é um arquivo de texto que dá para enviar, revisar e guardar no Git
- **Correto**: endereços, máscaras e curingas são calculados, e erros de digitação geram mensagens claras
- **Verificável**: funções de inspeção leem VLANs, trunks, STP, port security e processos de roteamento direto do Packet Tracer
- **Depurável**: defina breakpoints, execute um script passo a passo e leia cada variável, como no VS Code
- **Interativo**: um terminal JavaScript altera a topologia aberta linha por linha

<div align="center">
<img src="../assets/screenshots/editor.png" alt="PTForge" width="95%">
<br><sub>O ambiente do PTForge dentro do Packet Tracer: explorador, abas, IntelliSense, realce Dark Modern e saída</sub>
</div>

## Novidades da 1.3

|  |  |
|---|---|
| **Plugins** | Coloque arquivos `.pf` na pasta de plugins para adicionar comandos de ponto, funções globais, regras de auditoria e verificações do Lab Check. Três plugins prontos vêm em [`plugins`](../plugins) |
| **Gerenciador de plugins** | `Ctrl+Shift+X` lista cada plugin com versão, permissões e o que ele adiciona. Ativar pede seu consentimento, e um plugin cujo arquivo muda fica desligado até você revisá-lo |
| **Permissões** | Plugins só leem, a menos que peçam `topology`, `cli`, `files` ou `raw`. Chamadas fora das permissões falham com um erro claro |
| **Codicons** | Todos os ícones agora são Codicons oficiais do VS Code (CC BY 4.0), na mesma grade e tamanhos |
| **Detalhes completos do host** | `getPcIp()` retorna gateway, DNS, MAC, IPv6, link-local e estado do link. `getPortInfo()` informa o dispositivo na outra ponta. O terminal mostra objetos profundos e arrays longos por inteiro |
| **Ping e traceroute em segundo plano** | `ping()`, `traceroute()` e `pingAll()` esperam o Packet Tracer terminar, então os resultados nunca são zero. `traceroute()` retorna cada salto |

## Início rápido

1. Baixe a [versão mais recente](https://github.com/r4chan842/PTForge/releases/latest) e siga o [guia de instalação](../docs/guides/installation.md)
2. Abra `Extensions` → `PTForge Editor`
3. Abra um script de [`examples/`](../examples/README.md) com `Ctrl+O` e pressione `Ctrl+F5` para executar ou `F5` para depurar
4. Pressione `` Ctrl+` `` e teste `getDevices()` no terminal
5. Verifique o resultado com `auditNetwork()`, `pingAll()` ou um [Lab Check](../docs/api/checks.md)

## Um exemplo rápido

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

Vinte linhas geram um roteador, um switch, quatro PCs endereçados, um roteador reforçado com SSH, VLANs, portas de acesso protegidas, um diagrama rotulado, uma linha de base salva e um teste de alcance completo.

## Recursos

| Área | O que você pode fazer |
|---|---|
| **Dispositivos** | Adicionar, remover, renomear, mover, reiniciar, instalar módulos, ler portas, guardar dados próprios, posicionar dispositivos no espaço físico |
| **Links** | Qualquer tipo de cabo, apagar links, conexão automática, listar vizinhos, verificar o estado do link |
| **Hosts** | IPv4 estático ou DHCP, IPv6 com SLAAC, gateway, DNS, firewall, prompt de comando |
| **Cisco IOS** | Configuração básica, senhas, banners, usuários, interfaces, subinterfaces, loopbacks, router-on-a-stick, pools e relay DHCP, NTP, syslog, SNMP, CDP, LLDP, comandos show |
| **Switching** | VLANs, portas de acesso e voz, trunks, DTP, EtherChannel (LACP, PAgP, estático, camada 3), Rapid PVST+, PortFast, BPDU Guard, VTP, port security, DHCP snooping, DAI |
| **Roteamento** | Rotas estáticas e flutuantes, OSPF, OSPFv3, EIGRP, EIGRP para IPv6, RIP, RIPng, BGP, redistribuição |
| **Segurança** | ACLs padrão, estendidas, nomeadas e IPv6, NAT, PAT, pools NAT, redirecionamento de portas, SSH, bloqueio de login, AAA com RADIUS e TACACS+ |
| **Redundância** | HSRP num roteador ou como par ativo e standby |
| **Servidores** | DHCP, DNS (A, CNAME, NS), HTTP, HTTPS, páginas web, usuários FTP, contas de e-mail, TFTP, syslog, RADIUS |
| **Sem fio** | SSID, WPA2, WPA, WEP, modo de rádio, SSID oculto, filtro MAC |
| **Inspeção** | Estado das portas do switch, contadores de port security, banco de VLANs, raiz STP e portas raiz, VTP, MACs estáticos, processos OSPF e EIGRP |
| **Alcance** | `pingAll`, `pingMatrix` e `reachability` com perda, tempos de ida e volta e visão em matriz |
| **Snapshots** | `takeSnapshot`, `getSnapshots`, `compareSnapshots`, `showSnapshotDiff`, salvar e carregar arquivos de snapshot e uma visão de diff de configuração |
| **Arquivos** | Ler e gravar arquivos de texto, executar scripts do disco, exportar configurações e topologia, registro de comandos |
| **Tela** | Notas, linhas, círculos, retângulos, setas, linhas tracejadas, zonas, rótulos de dispositivos e links, camadas |
| **Topologia** | Geradores de estrela, anel, linha, malha e LAN, layout em grade e círculo, planejadores VLSM e /30 |
| **Simulação** | Modo simulação, PDUs, filtros de protocolo, execução passo a passo, ping, traceroute |
| **Lab Check** | Verificações pontuadas com pontos, dicas e relatório: dispositivos, cabos, endereços, portas, nomes de host, VLANs, linhas de configuração, testes próprios |
| **Auditoria** | IPs duplicados, conflitos de sub-rede entre cabos, links inativos, hosts sem endereço, portas de acesso na VLAN 1, falta de port security, portas ativas sem uso |
| **Lote** | `runOnAll("show ip int brief")`, `runOnDevices` e `commandsToScript()`, que transforma comandos digitados na CLI num script reutilizável |
| **Área de trabalho** | Zoom, plano de fundo, redes remotas, abrir e salvar projetos, eventos da área de trabalho |

Cada função auxiliar de IOS tem um gêmeo `build...` que retorna os comandos em vez de enviá-los, para você ver, combinar e reutilizar a configuração.

## O editor

<div align="center"><img src="../assets/banners/editor.svg" alt="Editor" width="100%"></div>

O ambiente tem a aparência e o comportamento do VS Code. Foi escrito do zero em ES5 puro, por isso roda dentro da web view do Packet Tracer sem framework e sem acesso à rede.

| Parte | Descrição |
|---|---|
| **Barra de menus e paleta de comandos** | Menus File, Edit, Selection, View, Go, Run, Network, Terminal e Help. `Ctrl+Shift+P` lista todos os comandos, `Ctrl+P` abre um arquivo, `Ctrl+G` vai para uma linha |
| **Explorador** | Editores abertos, uma área de trabalho com scripts salvos no Packet Tracer e uma pasta real do disco. Novo, renomear, excluir |
| **Arquivos** | Open, Save e Save As usam as caixas de diálogo do Packet Tracer. Importar da área de transferência, exportar como download |
| **Abas** | Uma aba por arquivo com ponto de alteração, fechar com clique do meio, aviso de salvar para arquivos em disco, histórico de desfazer próprio por aba |
| **Realce** | Cores Dark Modern: comentários `#6A9955`, strings `#CE9178`, números `#B5CEA8`, palavras-chave `#569CD6` e `#C586C0`, funções `#DCDCAA`, variáveis `#9CDCFE`, funções PTForge em negrito `#4FC1FF`, pares de colchetes coloridos |
| **IntelliSense** | Sugestões das 388 funções com assinatura e descrição, palavras do arquivo, palavras-chave. Dicas de parâmetros durante a digitação |
| **Problemas** | Verificação de sintaxe ao vivo com a linha exata, nomes de funções desconhecidos com correção rápida *Did you mean*. Sublinhados, marcas na margem e painel Problems |
| **Edição** | Fechamento automático de pares, Enter inteligente, `Ctrl+/` comentário, `Alt+Up/Down` mover linha, `Shift+Alt+Down` copiar linha, `Ctrl+Shift+K` apagar linha, correspondência de colchetes |
| **Localizar e substituir** | `Ctrl+F` e `Ctrl+H` com maiúsculas, palavra inteira e expressões regulares, Substituir tudo num único desfazer |
| **Painel** | Problems, Output, Debug Console, Terminal e Lab Check. Redimensionável, `Ctrl+J` oculta |
| **Visão Devices** | Dispositivos e portas ao vivo com LEDs de link e endereços, snapshots e ferramentas de rede com um clique |
| **Barra de status** | Número de problemas, estado de execução e depuração, posição do cursor, zoom, conexão com o Packet Tracer |

<table>
<tr>
<td><img src="../assets/screenshots/lab-check.png" alt="Relatório Lab Check e visão Devices ao vivo" width="100%"><br><sub>Relatório Lab Check e visão Devices ao vivo</sub></td>
<td><img src="../assets/screenshots/command-palette.png" alt="Paleta de comandos e referência de funções" width="100%"><br><sub>Paleta de comandos e referência de funções</sub></td>
</tr>
<tr>
<td><img src="../assets/screenshots/problems.png" alt="Problems com correção rápida" width="100%"><br><sub>Problems com correção rápida</sub></td>
<td><img src="../assets/screenshots/find-replace.png" alt="Localizar e substituir" width="100%"><br><sub>Localizar e substituir</sub></td>
</tr>
</table>

## Terminal

<div align="center"><img src="../assets/banners/terminal.svg" alt="Terminal" width="100%"></div>

`` Ctrl+` `` abre um terminal JavaScript. Cada linha roda na hora no Packet Tracer e mantém suas variáveis, então você explora e altera uma topologia passo a passo sem escrever um script antes.

| Recurso | Descrição |
|---|---|
| **Avaliação direta** | Qualquer expressão ou instrução; resultados como árvores legíveis, erros em vermelho |
| **Autocompletar** | `Tab` completa funções PTForge, suas variáveis, palavras-chave e comandos com ponto |
| **Histórico** | `Up` e `Down` percorrem comandos anteriores, que ficam salvos entre sessões |
| **Vários terminais** | `+` abre outro terminal, a lista alterna entre eles, a lixeira fecha um |
| **Comandos com ponto** | `.help`, `.clear`, `.devices`, `.ping`, `.trace`, `.show R1 show ip route`, `.cli R1` para comandos IOS num dispositivo, `.exit` para sair, `.audit`, `.snap`, `.diff`, `.calc 10.1.2.3/20`, `.run file.js`, `.history` |

<div align="center"><img src="../assets/screenshots/terminal.png" alt="Terminal" width="95%"></div>

Leia o [guia do terminal](../docs/guides/terminal.md).

## Depurador

<div align="center"><img src="../assets/banners/debugger.svg" alt="Debugger" width="100%"></div>

`F5` inicia uma sessão de depuração. O PTForge instrumenta o script, executa-o uma vez no Packet Tracer registrando cada passo e para no primeiro breakpoint. Como toda a execução fica registrada, também dá para voltar **para trás**.

| Recurso | Descrição |
|---|---|
| **Breakpoints** | Clique na margem ou `F9`. Condições, contagem de acertos, logpoints, desativar ou remover todos |
| **Exceções** | Para em exceções não tratadas com a linha destacada |
| **Passos** | Continuar `F5`, passo por cima `F10`, para dentro `F11`, para fora `Shift+F11`, para trás, reiniciar `Ctrl+Shift+F5`, parar `Shift+F5` |
| **Variables** | Escopos Local, Closure e Script como árvores expansíveis |
| **Watch** | Qualquer expressão, avaliada a cada passo registrado |
| **Call Stack** | Cada frame com arquivo e linha. Clique num frame para ver suas variáveis |
| **Debug Console** | Avalie expressões no frame pausado |
| **Hover** | Passe o mouse sobre uma variável no editor para ver seu valor |

<div align="center"><img src="../assets/screenshots/debugger.png" alt="Debugger" width="95%"></div>

Leia o [guia do depurador](../docs/guides/debugger.md).

## Ferramentas de rede

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
<td><img src="../assets/screenshots/snapshot-diff.png" alt="Comparação de snapshots com diff de configuração" width="100%"><br><sub>Comparação de snapshots com diff de configuração</sub></td>
</tr>
<tr>
<td><img src="../assets/screenshots/calculator.png" alt="Calculadora de sub-redes IPv4" width="100%"><br><sub>Calculadora de sub-redes IPv4</sub></td>
<td><img src="../assets/screenshots/vlsm.png" alt="Planejador VLSM" width="100%"><br><sub>Planejador VLSM</sub></td>
</tr>
</table>

Leia [Ferramentas de rede](../docs/guides/network-tools.md), [Alcance](../docs/api/simulation.md#reachability) e [Snapshots](../docs/api/snapshots.md).

## Verificar e auditar

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

Leia [Lab Check](../docs/api/checks.md), [Auditoria](../docs/api/audit.md) e [Comandos em lote](../docs/api/ios.md#batch-commands).

## Instalação

O PTForge é um Script Module do Packet Tracer. O Packet Tracer criptografa pacotes `.pts` e só ele consegue criá-los, então você monta o módulo uma vez com os arquivos deste repositório.

1. Baixe a [versão mais recente](https://github.com/r4chan842/PTForge/releases/latest) ou clone o repositório
2. No Packet Tracer abra `Extensions` → `Scripting` → `Configure PT Script Modules`
3. Crie um módulo chamado `PTForge`
4. Adicione um arquivo de script com o conteúdo de [`release/ptforge.js`](../release/ptforge.js)
5. Adicione os catorze arquivos de [`src/ui`](../src/ui) como arquivos de interface: `index.html`, `style.css`, `catalog.js`, `snippets.js`, `highlight.js`, `lint.js`, `netcalc.js`, `editor.js`, `acorn.js`, `instrument.js`, `terminal.js`, `debugview.js`, `views.js`, `interface.js`
6. Salve e inicie o módulo e abra `Extensions` → `PTForge Editor`

O [guia de instalação](../docs/guides/installation.md) explica cada passo e as atualizações.

## Exemplos

34 laboratórios completos em [`examples/`](../examples/README.md), cada um começa com uma área de trabalho vazia:

| Pasta | Laboratórios |
|---|---|
| `01-basics` | Primeira rede, módulos e links seriais, configuração básica segura |
| `02-switching` | VLANs e trunks, EtherChannel, raiz STP, switch camada 3 |
| `03-routing` | Estático, OSPF multiárea, EIGRP, BGP, IPv6 com OSPFv3 |
| `04-security` | ACL, NAT e PAT, SSH e port security, HSRP |
| `05-services` | DHCP, DNS e web no servidor, FTP e e-mail, DHCP no roteador com relay |
| `06-wireless` | Rede sem fio doméstica |
| `07-canvas` | Rótulos e zonas |
| `08-topology` | Campus gerado, estrela, anel e malha, plano VLSM |
| `09-simulation` | Teste de ping |
| `10-ccna-labs` | Router-on-a-stick, laboratório empresarial completo |
| `11-inspection` | Verificar switching, auditoria de port security |
| `12-automation` | Backup de configuração, auditoria de comandos, biblioteca de scripts |
| `13-operations` | Teste de alcance, acompanhamento de mudanças com snapshots |

Pontos de partida para o seu trabalho ficam em [`templates/`](../templates/README.md): laboratório vazio, campus, WAN de filiais e escritório pequeno.

## Documentação

| Seção | Conteúdo |
|---|---|
| [Primeiros passos](../docs/guides/getting-started.md) | Sua primeira rede em dez minutos |
| [Guia do editor](../docs/guides/editor.md) | Área de trabalho, arquivos, IntelliSense, problemas |
| [Terminal](../docs/guides/terminal.md) | JavaScript interativo e CLI dos dispositivos |
| [Depurador](../docs/guides/debugger.md) | Breakpoints, passos, variáveis e watch |
| [Ferramentas de rede](../docs/guides/network-tools.md) | Calculadora, alcance e snapshots |
| [Escrevendo scripts](../docs/guides/writing-scripts.md) | Estrutura, ordem, builders, velocidade |
| [Referência da API](../docs/api/README.md) | Cada função com argumentos, retornos e exemplos |
| [Receitas](../docs/recipes/README.md) | Switching de campus, laboratórios de roteamento, roteador de borda, servidores, diagramas |
| [Mapa de tópicos CCNA](../docs/ccna/README.md) | Tópicos do CCNA 200-301 com funções e exemplos correspondentes |
| [Folhas de consulta](../docs/cheatsheets/ios-to-ptforge.md) | De IOS para PTForge, sub-redes, atalhos do editor |
| [Arquitetura](../docs/architecture/overview.md) | Camadas, execução, ponte do editor, depurador, testes |
| [Solução de problemas](../docs/guides/troubleshooting.md) | Erros comuns e soluções |
| [Limitações](../docs/guides/limitations.md) | O que a API do Packet Tracer não permite |
| [FAQ](../docs/guides/faq.md) | Respostas curtas |

## Estrutura do projeto

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

## Desenvolvimento

Requer Node.js 18 ou mais recente. Não há dependências de execução.

```
git clone https://github.com/r4chan842/PTForge.git
cd PTForge
npm run check
```

| Comando | Finalidade |
|---|---|
| `npm test` | Executar todos os testes |
| `npm run bundle` | Reconstruir `release/ptforge.js` |
| `npm run catalog` | Gerar a lista de funções do editor a partir de `docs/api` |
| `npm run reference` | Gerar as tabelas de referência a partir de `src/data` |
| `npm run check` | Lista de funções, bundle, verificação de sintaxe e testes |
| `npm run ui-test` | 41 verificações no navegador do ambiente, terminal e depurador com Playwright |
| `npm run screenshots` | Regenerar as capturas em `assets/screenshots` |

A suíte de testes executa toda a extensão contra uma réplica da API IPC do Packet Tracer. Ela cobre cada função pública, cada exemplo, modelo e receita, o bundle, os motores do terminal e do depurador e as regras do projeto. Detalhes em [Testes](../docs/architecture/testing.md).

## Contribuindo

Relatos de bugs, ideias e pull requests são bem-vindos. Comece por [CONTRIBUTING](../CONTRIBUTING.md), veja o [roadmap](../ROADMAP.md) e siga o [código de conduta](../CODE_OF_CONDUCT.md). Problemas de segurança vão pela [política de segurança](../SECURITY.md). Dúvidas: [SUPPORT](../SUPPORT.md).

## Licença

O PTForge é distribuído sob a [licença MIT](../LICENSE). O depurador usa o [Acorn](https://github.com/acornjs/acorn) (MIT), veja [THIRD_PARTY_NOTICES](../THIRD_PARTY_NOTICES.md).

## Agradecimentos

O uso da API do Packet Tracer segue a [documentação oficial da API IPC do Cisco Packet Tracer](https://tutorials.ptnetacad.net/help/default/IpcAPI/classes.html). As cores do ambiente seguem o tema Dark Modern do VS Code.

Cisco e Packet Tracer são marcas da Cisco Systems, Inc. Este projeto não é afiliado nem endossado pela Cisco Systems, Inc.

<div align="center">
<sub>Feito para estudantes e professores de redes e para quem não quer montar o mesmo laboratório à mão duas vezes.</sub>
</div>
