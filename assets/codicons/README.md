Codicons
========

The interface icons are Codicons (https://github.com/microsoft/vscode-codicons) 0.0.36 by Microsoft, the icon set of Visual Studio Code, licensed under CC BY 4.0 (LICENSE). They are embedded in src/ui/interface.js and src/ui/index.html by tools/make-icons.js from the mapping in tools/icons.json. The router, switch, PC, JavaScript file and calculator icons are PTForge's own.

To regenerate: npm pack @vscode/codicons@0.0.36, unpack it, then node tools/make-icons.js package/src/icons.
