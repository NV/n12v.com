---
layout: post
title: "Production and Development Environments"
date: 2013-07-14 15:43
comments: true
---

Goal: deploy Jekyll website with a single command.

## Production

  * Concatenate consequent files
  * Minify them
    * CSS with [YUI Compressor](http://yui.github.io/yuicompressor/) or [CSSO](http://css.github.io/csso/)
    * Compile SASS with `--output-style compressed`
    * JS with [Google Closure Compiler](https://developers.google.com/closure/compiler/)
  * Use CDN
    * [Google Hosted Libraries](https://developers.google.com/speed/libraries/devguide), [CloudFlare hosted libraries](http://cdnjs.com/)
  * No Debug scripts
  * gzip

## Development

  * Don’t concatenate
  * Don’t minify
    * Compile SASS with `--sourcemap`
  * Use local files, no external CDNs
  * Debug scripts

## Deploy script

Jekyll has _config.yml, which I use for development env. For development, I run:

    bundle exec jekyll serve --watch --config _config.yml

For production, I created additional config file, production.yml, which overwrites _config.yml.
To deploy, I merge production.yml into _config.yml and save the result to _production.yml.
I have a file rule in Rake &mdash; Ruby Make &mdash; for that:

    file '_production.yml' => ['production.yml', '_config.yml'] do
      config = YAML.load_file('_config.yml')
      production = YAML.load_file('production.yml')
      yaml = deep_merge(config, production).to_yaml # http://stackoverflow.com/a/9381776/16185
      File.open('_production.yml', 'w') {|f|
        f.write(yaml)
      }
    end

production.yml sets dev

Rake deploys this website to Amazon S3.


## Consequent files are concatenated into a single one
```
<script src="js/requestAnimationFrame.js"></script>
<script src="js/main.js"></script>
```
becomes a singe file:
```
<script src="bundle.js"></script>
```

## Jekyll

Many things mentioned above is not implemented in Jekyll.

## production.yml



	dev: false

	asset_bundler:
	  dev: false

	asset_pipeline:
	  bundle: true
	  compress: true

dev variable is available as `site.dev` in templates.

### Use CDN

  % if site.dev %
    &lt;script src="http://ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js">&lt;/script>
  % else %
    &lt;script src="/js/debug.js"></script>
    &lt;script src="/js/jquery.js"></script>
    &lt;script src="/js/jquery.lint.js"></script>
  % endif %

### Debug scripts

  % if site.dev %
    <script src="/js/debug.js"></script>
	% endif %

debug.js:

	var DEBUG = true;
	var disqus_developer = '1';

###

I merge production.yml into _config.yml and save it as _production.yml. Then I run `jekyll build --config _production.yml`.

Production config overwrites values in _config.yml (default config, used for development env).
Default _config.yml is a development config. I create production config (_production.yml) by merging production.yml into _config.yml

###


## Minification
CSS minified with either .
JS minified with .
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
