module PostUrlLiquidFilters

  # Generate id that can be used as a CSS selector
  def add_slash(input)
    if input[-1] == '/'
      return input
    end
    input << '/'
  end

end

Liquid::Template.register_filter PostUrlLiquidFilters
