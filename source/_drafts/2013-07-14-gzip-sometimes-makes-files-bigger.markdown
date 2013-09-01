---
layout: post
title: "Production and Development Environments"
date: 2013-07-14 15:43
comments: true
---

gzip file format consist of:
* a 10-byte header, containing a magic number, a version number and a timestamp
* optional extra headers, such as the original file name,
* a body, containing a DEFLATE-compressed payload
* an 8-byte footer, containing a CRC-32 checksum and the length of the original uncompressed data.

Often for small files Gzip compression only makes the files bigger.

$ gzip -9
