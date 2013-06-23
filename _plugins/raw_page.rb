require 'delegate'

puts 'raw page!!!!!!!'

module Jekyll
  class RawPage < DelegateClass(Page)
    def initialize(page)
      @real_page = page
      @dir = page.dir
      #@base = page.base
      #  page.base is undefined, but it doesn’t seem to be used anyway
      @name = page.name
      @site = page.site

      super(@real_page)

      self.data = @real_page.data.clone
      self.data['layout'] = @site.config['raw_layout'] || 'raw'
      @raw_html = @site.config['raw_html'] || 'raw.html'
    end

    def destination(page)
      page_path = super(page)
      page_path.sub('index.html', @raw_html)
    end

    def write(dest)
      # This is a copy/paste of the original Jekyll’s method.
      # I don’t know how to avoid it, I’m just a Ruby newbie.
      path = destination(dest)
      puts "path #{path}"
      FileUtils.mkdir_p(File.dirname(path))
      File.open(path, 'w') do |f|
        f.write(self.output)
      end
    end
  end


  class Site
    alias orig_write write
    def write
      orig_write

      self.posts.each do |page|
        raw_page = RawPage.new(page)
        raw_page.render(self.layouts, site_payload)
        raw_page.write(self.dest)
      end
    end
  end
end
