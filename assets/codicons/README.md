Codicons
========

The interface icons are Codicons (https://github.com/microsoft/vscode-codicons) 0.0.36 by Microsoft, the icon set of Visual Studio Code, licensed under CC BY 4.0 (https://github.com/r4chan842/PTForge/blob/main/assets/codicons/LICENSE). They are embedded in https://github.com/r4chan842/PTForge/blob/main/src/ui/interface.js and src/ui/index.html by https://github.com/r4chan842/PTForge/blob/main/tools/make-icons.js from the mapping in https://github.com/r4chan842/PTForge/blob/main/tools/icons.json. The router, switch, PC, JavaScript file and calculator icons are PTForge's own.

To regenerate: npm pack @vscode/codicons@0.0.36, unpack it, then node https://github.com/r4chan842/PTForge/blob/main/tools/make-icons.js package/src/icons.
