# Direct source reuse

DFQ-Original by Musoucrow / 2DScrollGames, fixed commit `d4b9088d9e6efeede3e504d3b6e64e3a459aa012`.
Upstream: https://github.com/2DScrollGames/DFQ-Original
License: Apache-2.0, full text in LICENSE. Original author headers remain in every imported file.

All entries in source-lock.json are byte-identical copies of the upstream Git blobs. No upstream gameplay file has been modified. The license, README, 33 Lua source modules and 6 Lua configuration files are selected for an isolated runtime. No original DNF images, audio or client package is included.

The separate dfq-platform.lua, dfq-fixture.lua, dfq-core-runtime.mjs and HTML renderer are original adapters/test inputs by this project. They are not part of DFQ or official DNF. This integration does not claim a complete LÖVE client, a Summoner implementation, exact official combat values or inherited rights to original game assets.

Third-party notices inside DFQ, including the class helper credit, remain unchanged. Browser Lua VM licenses and their dependency notices are in ../fengari-web/LICENSES.txt. UI font license is in ../../fonts/OFL.txt.
