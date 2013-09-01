# Prepend slash when it’s not already there.
# Keeps URLs consistent.

module PostUrlLiquidFilters

  def add_slash(input)
    if input[-1] == '/'
      return input
    end
    input << '/'
  end

end

Liquid::Template.register_filter PostUrlLiquidFilters
