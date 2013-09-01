# How can I show a files modification date with Jekyll?
# http://stackoverflow.com/a/18233371/16185

module Jekyll
  module ModifiedDate
    def file_date(path)
      source_dir = @context.registers[:site].source # This doesn't look reliable
      posts_dir = File.join(source_dir, '_posts')
      post_path = File.join(posts_dir, File.basename(path))
      File.mtime(post_path) || '?'
    end
  end
end

Liquid::Template.register_filter(Jekyll::ModifiedDate)
