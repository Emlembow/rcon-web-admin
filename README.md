# RCON Web Admin

<img src="https://brainfoolong.github.io/rcon-web-admin/images/screenshots/dashboard.jpg" width="30%"><img src="https://brainfoolong.github.io/rcon-web-admin/images/screenshots/autobot.jpg" width="30%"><img src="https://brainfoolong.github.io/rcon-web-admin/images/screenshots/server-management.jpg" width="30%"><img src="https://brainfoolong.github.io/rcon-web-admin/images/screenshots/ucc.jpg" width="30%"><img src="https://brainfoolong.github.io/rcon-web-admin/images/screenshots/widgets.jpg" width="30%">

RCON Web Admin as a powerful web interface to control your RCON server, e.g: for Rust game servers, but not limited to. Every RCON server will work.

The most powerful feature is that this web admin can run on a server, raspberry pi or another device that is online 24/7. It does all jobs for you, even if you are not connected to the interface. You can install this almost everywhere.

So imagine you've set-up rcon web admin so that it check users for high ping, VAC status or chat filter. The RCON web admin does it 24/7 for you, no need to have a tool opened all the time.

## Features

* Full administration via your browser, it's just a website
* Unlimited users and servers, Admin roles can manage servers, users can use the dashboard
* Powerful widget system - Developers can add new features for the dashboard easily
* Responsible - The frontend is designed for every device, desktop or smartphone.
* Run on every device that can install node.js
* So many more... Give it a try

## Widgets 
The widgets are so powerful, they deserve an extra header here. All dashboard things are written in widgets. From the simplest to the most powerful tool, widgets are the way to go. There are some core widgets, most noticable `autobot`. That can do so many jobs for you. As mentioned above, setup scripts that kick high pings automatically, that kick vac banned people, that say hello to new users, the periodically send chat messages, that ...

Core widgets are automatically kept up2date with their github repositories, or you can trigger updates easily in the interface.

## Requirements
It is required to have `npm`, `node` and `git` properly installed.
* https://nodejs.org
* https://git-scm.com/downloads

On linux you may execute

    apt-get install nodejs npm git
    
Linux: If you've installed it and `node` as not available but `nodejs` is, than create a symlink with `sudo ln -s `which nodejs` /usr/bin/node`

## Installation and start RCON web admin

    git clone https://github.com/brainfoolong/rcon-web-admin.git
    cd rcon-web-admin
    npm update
    
# Start/Stop on linux

    sh startscripts/start-linux.sh start
    sh startscripts/start-linux.sh stop
    sh startscripts/start-linux.sh restart
    
# Start/Stop on windows - Close cmd window to close

    startscripts/start-windows.bat
    
Then goto: http://yourserverip:4326 (You can also use your hostname instead of ip)

## Startup/Shutdown scripts

For linux you can start the rcon web admin with your server start. For example on ubuntu symlink `startscripts/runscript-linux.sh` to `/etc/rc2.d/S01Rconwebadmin` for automatic boot with server start.

    Linux : startscripts/start-linux.sh (start/stop/restart/status)

## Widget developers
Goto https://github.com/brainfoolong/rcon-web-admin/tree/master/public/widgets for more information.