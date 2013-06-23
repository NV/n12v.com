module ArticleIdLiquidFilters

  # Generate id that can be used as a CSS selector
  def article_id(input)
    input.chomp!('/')
    input.gsub!(/^\//, '')
    'article_' << input.gsub(/[^a-z0-9_-]/i, '_')
  end

end

Liquid::Template.register_filter ArticleIdLiquidFilters
