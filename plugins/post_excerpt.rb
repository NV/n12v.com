# Both Jekyll and Octopress have excerpt/more functionality.
# Neither of them has a method to get the content after the separator.
# Thus I use my own plug-in.

module ExcerptLiquidFilters

  SEPARATOR = '<!-- more -->'

  def excerpt(input)
    input.split(SEPARATOR)[0]
  end

  def after_excerpt(input)
    split = input.split(SEPARATOR)
    split[1] or nil
  end

  def has_excerpt(input)
    input.include? SEPARATOR
  end

end

Liquid::Template.register_filter ExcerptLiquidFilters
