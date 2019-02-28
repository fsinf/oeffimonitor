xinit needs access to tty:

```
usermod -aG tty pi
```

install xserver-xorg-legacy Xorg Wrapper script

```
apt install xserver-xorg-legacy
```

/etc/X11/Xwrapper.config needs to be modified:

```
allowed_users=anybody
needs_root_rights=yes
```

/home/pi/.xinitrc

```
# disable screen blanking and DPMS
xset s off -dpms
openbox &
# wait that stuff is booted up
sleep 3
# run chromium
exec /usr/bin/chromium-browser \
     --user-data-dir=/dev/shm/chrome-profile \
     --disk-cache-dir=/dev/shm/chrome-cache \
     --app="https://oeffi.domain.tld/" \
     --window-size=$(fbset -s | awk '$1 == "geometry" { print $2","$3 }') \
     --start-fullscreen \
     --disable \
     --disable-translate \
     --disable-infobars \
     --disable-suggestions-service \
     --disable-save-password-bubble \
     --disable-bundled-ppapi-flash \
     --disable-extensions \
     --disable-notifications
```

blank cursor

https://github.com/shmibs/xcursor-transparent-cursor.git
cp cursors nach .icons/blank

.Xresources

```
Xcursor.theme: blank
```

/etc/systemd/system/xinit-login.service

```
[Unit]
After=systemd-user-sessions.service

[Service]
ExecStart=/bin/su pi -l -c /usr/bin/startx

[Install]
WantedBy=multi-user.target
```


