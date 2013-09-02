SRC = 'public_deploy'
TEMP = 'build'
DEST = 'build_gzip'

HOST = 'n12v.com'
CONFIG = '_production.yml'

EXTENSIONS = %w{
	html
	css
	js
	xml
  atom
}

task :default => [:build, :copy_modified]

desc "Build to #{TEMP}"
task :build => ['_production.yml', :jekyll, :sass, :copy_modified] do
  puts 'BUILT!'
end


desc "Upload #{DEST}"
task :upload => [:gzip_and_upload, :pubsubhubbub] do
  puts 'UPLOADED!'
end


file '_production.yml' => ['production.yml', '_config.yml'] do
  require 'yaml'

  # http://stackoverflow.com/a/9381776/16185
  def deep_merge(first, second)
    merger = proc { |key, v1, v2|
      Hash === v1 && Hash === v2 ? v1.merge(v2, &merger) : v2
    }
    first.merge(second, &merger)
  end

  config = YAML.load_file('_config.yml')
  production = YAML.load_file('production.yml')
  yaml = deep_merge(config, production).to_yaml
  File.open('_production.yml', 'w') {|f|
    f.write(yaml)
  }
end


desc "source --> #{SRC}"
task :jekyll do
  # Asset bundler’s cache acts strange
  rm_rf('_asset_bundler_cache')
  rm_f("#{SRC}/min.js")
  system_run("bundle exec jekyll build --config #{CONFIG} --destination #{SRC}")
end


desc "SCSS --> CSS"
task :sass do
  system_run("bundle exec compass compile --sass-dir source/_assets --css-dir #{SRC} --output-style compressed")
end


directory TEMP
directory DEST


desc "#{SRC} --> #{TEMP}"
task :copy_modified do
  system_run("rsync --checksum --recursive -L --perms --group --delete-excluded --itemize-changes #{SRC}/ #{TEMP}/")
end


desc "#{TEMP} --> #{DEST} --> Amazon S3 & Amazon CloudFront"
task :gzip_and_upload => [DEST] do
  system_run("rsync --times --update --recursive -L --perms --group --delete-excluded --verbose        #{TEMP}/ #{DEST}/")

  files = []

  # No idea how to express the following in Rake
  Dir.chdir(SRC) do
    query = "**/*.{#{ EXTENSIONS.join(',') }}"
    files = Dir[query]
  end

  zipped = []

  files.each {|f|
    temp_path = File.join(TEMP, f)
    dest_path = File.join(DEST, f)

    # Skip non-modified files
    temp_time = File.mtime temp_path
    dest_time = File.mtime dest_path
    if dest_time > temp_time
      #puts "#{dest_path} is up to date"
      next
    end

    gzip_path = "#{dest_path}.gz"
    system_run("gzip --best --no-name --verbose --stdout #{dest_path} > #{gzip_path}")

    # GZip increases size for small files
    size_orig = File.size(dest_path)
    size_gzip = File.size(gzip_path)
    if size_gzip < size_orig * 0.95 # Don't Gzip when the benefit is really small
      mv gzip_path, dest_path
      zipped << f
    else
      rm gzip_path
    end

    temp_time += 1 # Dirty hack to make gzip file look newer
    File.utime(temp_time, temp_time, dest_path)
  }

  def s3_sync
    system_run("s3cmd sync --cf-invalidate --acl-public --no-preserve --delete-removed ./#{DEST}/ s3://#{HOST}")
    # --dry-run
  end

  def s3_put(files)
    files.each {|f|
      path = File.join(DEST, f)
      # TODO: Use `s3cmd modify` when the time comes https://github.com/s3tools/s3cmd/issues/37
      system_run("s3cmd put --acl-public --no-preserve --add-header='Content-Encoding: gzip' #{path} s3://#{HOST}/#{f}")
    }
  end

  #Dir.chdir(DEST) do
  #  files.select! {|f|
  #    system("gzip --test #{f}")
  #  }
  #end

  s3_sync()
  s3_put(zipped)
end


desc "superfeedr: ping"
task :pubsubhubbub do
  require 'net/http'
  puts 'POST n12v.superfeedr.com'
  res = Net::HTTP.post_form(URI.parse('http://n12v.superfeedr.com/'), {
      'hub.mode' => 'publish',
      'hub.url' => 'http://n12v.com/posts.atom'
  })
  puts "#{res.code} #{res.message}"
  puts res.body
end


require 'ansi/code'
def system_run(param)
  puts(ANSI.blue{param})
  system(param)
end
