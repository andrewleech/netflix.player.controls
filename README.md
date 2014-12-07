## Netflix Player Controls

Adds configurable keyboard controls to video playback on netflix.

Some actions are simply adding extra keys to existing keyboard controls such that they can be remapped to suit a remote.
Other actions (such as Exit) are adding keyboard/remote controls to functions not normally available.

Existing actions can have their keymaps changed in the extension options. 

### Installation:

    Available on chrome webstore at: https://chrome.google.com/webstore/detail/netflixplayercontroller/najegmllpphoobggcngjhcpknknljhkj
    
### Build instructions:

    git clone https://github.com/andrewleech/netflix.player.controls.git
    cd netflix.player.controls
    npm install
    grunt --force


### After you clone:

1. Generate your .pem key and store it in the root as `mykey.pem` file. On
unix / mac, the command to generate the file is
`openssl genrsa 2048 | openssl pkcs8 -topk8 -nocrypt > mykey.pem`.
Note: the generated file is in `.gitignore` file, it won't be (and should NOT
be) commited to the repository unless you know what you are doing.

2. When ready to try out the extension in the browser, use default Grunt task to
build it. In `build` directory you'll find develop version of the extension in
`unpacked-dev` subdirectory (with source maps), and production (uglified)
version in `unpacked-prod` directory. The `.crx` packed version is created from
`unpacked-prod` sources.


Extension originally based on https://github.com/salsita/chrome-extension-skeleton