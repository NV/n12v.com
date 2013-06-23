---
layout: post
title: "How to Setup Local Hosts on Mac OS X using Apache"
date: 2012-09-25 19:33
comments: true
categories: 
---

When I develop this website localy I use `nikita-vasilyev.dev` virtual host. `nikita-vasilyev.dev/index.html` is just `~/Sites/nikita-vasilyev.com/public/index.html` on the file system.

This is a note for the future me. If you’re not me than you probably want to replace `nikita-vasilyev.dev` with a domain name you want and `nv` with your user name.

<!-- more -->

## Hosts

Open `/etc/hosts` in [Sublime](http://www.sublimetext.com/) or your favourite text editor and add:

    127.0.0.1	nikita-vasilyev.dev
    fe80::1%lo0	nikita-vasilyev.dev

fe80::1%lo0 is an IPv6 address. Without it your local site would [run too slow](http://serverfault.com/questions/321386/resolving-to-virtual-host-very-slow-on-mac-os-x-lion).

When run:

    sudo dscacheutil -flushcache

You can also try a GUI for [hosts file](https://github.com/specialunderwear/Hosts.prefpane).

Now nikita-vasilyev.dev points to your local machine. nikita-vasilyev.dev and 127.0.0.1 should open exact same page in the browser.

[man hosts](https://developer.apple.com/library/mac/#documentation/Darwin/Reference/ManPages/man5/hosts.5.html)

## Apache

Mac OS X Mountain Lion ships with Apache 2.2.22. You don’t need it install it.

### Add virtual entry

Open `/etc/apache2/extra/httpd-vhosts.conf` and add

    <VirtualHost *:80>
      ServerName nikita-vasilyev.dev
      DocumentRoot /Users/nv/Sites/nikita-vasilyev.com/public
      ErrorLog /Users/nv/Sites/nikita-vasilyev.com/error.log
      CustomLog /Users/nv/Sites/nikita-vasilyev.com/access.log common
    </VirtualHost>

### Fix paronoidal restrictions

At this point nikita-vasilyev.dev should serve you 500 error page. To fix it:

1. open `/etc/apache2/httpd.conf`
2. Find `<Directory "/Library/WebServer/Documents">` section
3. Replace
    Order deny,allow
    Deny from all

with

    Order allow,deny
    Allow from all

4. Set DocumentRoot to `"/Users/nv/Sites"`

### Restart Apache

FIXME: Go to "System Preferences" → "Settings" and I dunno...

    sudo apachectl configtest
    sudo apachectl restart

## Wraping up

    echo 'It works' > ~/Sites/nikita-vasilyev.com/public/index.html

http://nikita-vasilyev.com/ should display "It works".

## Troubleshooting

### Check file permissions


## Why not just use `file://`?

When your website consists only of HTML files you can just open them in the browser.

Nice image.

It works nice until:

- URLs relative to root, e.g. "/foo"
- AJAX requests, localStorage,

### References
- http://remysharp.com/2007/01/06/how-to-setup-your-mac-web-development-environment/
