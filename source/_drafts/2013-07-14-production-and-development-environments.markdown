---
layout: post
title: "Production and Development Environments"
date: 2013-07-14 15:43
comments: true
---

## Consequent files are concatenated into a single one
```
<script src="js/requestAnimationFrame.js"></script>
<script src="js/main.js"></script>
```
becomes a singe file:
```
<script src="bundle.js"></script>
```

## Minification
CSS minified with either [YUI Compressor](http://yui.github.io/yuicompressor/) or [CSSO](http://css.github.io/csso/).
JS minified with [Google Closure Compiler](https://developers.google.com/closure/compiler/).
SASS should be compiled with `--output-style compressed`.

## Hosted libraries

Using CDNs is a good ideas since popular libraries might be already in cache of a user if he visited some website that uses those.

* [Google Hosted Libraries](https://developers.google.com/speed/libraries/devguide)
* [Microsoft hosted libraries](http://www.asp.net/ajaxlibrary/cdn.ashx)
* [CloudFlare hosted libraries](http://cdnjs.com/)

For the development, however, is better to use local unminified files.

Development:
```
<script src="/js/jquery.js"></script>
```

Production
```
<script src="http://ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js"></script>
```

## Debugging scripts

jquery.lint.js

## Gzip

How [Gzip works](http://www.infinitepartitions.com/art001.html).

gzip file format consist of:
* a 10-byte header, containing a magic number, a version number and a timestamp
* optional extra headers, such as the original file name,
* a body, containing a DEFLATE-compressed payload
* an 8-byte footer, containing a CRC-32 checksum and the length of the original uncompressed data.

```
gzip
  --best
  --no-name
```

`--best` for maximum compression. It’s also slowest but I don't care since compress files before deploying on Amazon 3S,
I don't compress files on the fly using Nginx or Apache.

`--no-name` to don't include original file name will shave off few bytes.

For small files, compressed file sometimes ends up being larger than the original. It happens because Gzip adds:
* a 10-byte header, containing a magic number, a version number and a timestamp
* optional extra headers, such as the original file name (absent when `--no-name` is specified)
* a body, containing a DEFLATE-compressed payload
* an 8-byte footer, containing a CRC-32 checksum and the length of the original uncompressed data.

I compare file size of compressed and original files. If compressed file is larger (or the same) I use uncompressed file.
