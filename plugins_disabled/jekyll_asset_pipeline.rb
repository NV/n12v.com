require 'jekyll_asset_pipeline'

module JekyllAssetPipeline

  # https://github.com/matthodan/jekyll-asset-pipeline/issues/17#issuecomment-15796727
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
      Compass.add_project_configuration({:sourcemap => true})
      Compass.configure_sass_plugin!
      Compass.compiler.compile("./source/_assets/#{@asset.filename}", output.path)
      output.read
    end
  end
end
