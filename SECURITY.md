Security policy
===============

Supported versions
------------------

Only the latest 1.x release receives security fixes.

Reporting a vulnerability
-------------------------

Please do not open a public issue for security problems.

1. Open the **Security** tab of this repository
2. Click **Report a vulnerability**
3. Describe the problem, the affected version and the steps to reproduce it

You will get an answer within seven days. Once a fix is released, the report is published with credit to the reporter unless you prefer to stay anonymous.

Scope
-----

PTForge runs inside Cisco Packet Tracer with the permissions of a Script Module. Relevant reports include:

- Scripts or files that make PTForge write outside the paths passed to the file functions
- Output from Packet Tracer that is executed as code in the editor window
- Anything that lets a `.pkt` file run code through PTForge without user action

Security issues in Packet Tracer itself should be reported to Cisco.
