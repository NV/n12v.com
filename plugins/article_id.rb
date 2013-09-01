# Generate id that can be used as a CSS selector.
# Used in _posts/2013-08-26-css-transition-to-from-auto.html

module ArticleIdLiquidFilters

  def article_id(input)
    input.chomp!('/')
    input.gsub!(/^\//, '')
    'article_' << input.gsub(/[^a-z0-9_-]/i, '_')
  end

end

Liquid::Template.register_filter ArticleIdLiquidFilters
