class PostsController < ApplicationController
  before_action :set_post, only: [:update, :destroy]
  skip_before_action :verify_authenticity_token
  respond_to :json

  require "nokogiri"
  require "open-uri"
  require 'net/https'

  def index
    respond_with current_user.posts.all
  end
  
  def create
    @post = Post.new(topic_params)
    if params[:insertTitle] || params[:insertMeta]
      @post.content.split(" ").each do |token|
        if token.match(/^http/)
          page = Nokogiri::HTML(open(token, :ssl_verify_mode => OpenSSL::SSL::VERIFY_NONE))

          unless page.nil?
            unless params[:insertTitle].nil?
              @post.description = page.at_css("title").text unless page.at_css("title").nil?
            end

            unless params[:insertMeta].nil? && page.css("body h1").nil? && page.css("body p").nil?
              @post.linked_metas = page.css("body h1").text.split(" ").uniq << page.css("body p").text.split(" ").uniq
            end
          end
        end
      end
    end

    @post.save
    current_user.posts.push(@post)

    respond_with @post
  end
  
  def update
    respond_with @post.update(topic_params)
  end
  
  def destroy
    respond_with @post.destroy
  end
  
  private
    # Use callbacks to share common setup or constraints between actions.
    def set_post
      @post = Post.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def topic_params
      params.permit(:topic_id, :content, :description)
    end
end
