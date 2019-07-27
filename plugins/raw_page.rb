# http://n12v.com/ uses PJAX-style navigation between pages.
# When user clicks a post link, e.g. /how-to-setup-local-hosts-on-mac-os-x/ JS blocks
# it and instead sends XHR request to /how-to-setup-local-hosts-on-mac-os-x/raw.html.
# raw.html has only post's content and no junk.
#
# https://github.com/imathis/octopress/issues/772

require 'delegate'

module Jekyll
  class RawPage < DelegateClass(Page)
    def initialize(page)
      @real_page = page
      @dir = page.dir
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

      # Jekyll v3
      #self.posts.docs.each do |page|

      # Jekyll v1
      self.posts.each do |page|
        raw_page = RawPage.new(page)
        raw_page.render(self.layouts, site_payload)
        raw_page.write(self.dest)
      end
    end
  end
end
