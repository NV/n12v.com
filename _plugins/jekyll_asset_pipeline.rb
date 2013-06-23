require 'jekyll_asset_pipeline'

module JekyllAssetPipeline
  #class SassConverter < JekyllAssetPipeline::Converter
  #  require 'sass'
  #
  #  def self.filetype
  #    '.scss'
  #  end
  #
  #  def convert
  #    Sass::Engine.new(@content, syntax: :scss).render
  #  end
  #end

  class JavaScriptCompressor < JekyllAssetPipeline::Compressor
    require 'closure-compiler'

    def self.filetype
      '.js'
    end

    def compress
      Closure::Compiler.new.compile(@content)
    end
  end

  class CompassConverter < JekyllAssetPipeline::Converter
    require 'compass'
    require 'tempfile'

    def self.filetype
      '.scss'
    end

    def initialize(asset)
      @asset = asset
      super
    end

    def convert
      output = Tempfile.new('compass_output')
      Compass.add_project_configuration({})
      Compass.configure_sass_plugin!
      puts "TEMP: #{output.path}"
      Compass.compiler.compile("./_assets/#{@asset.filename}", output.path)
      output.read
    end
  end
end
