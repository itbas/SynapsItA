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
    unless params[:insertTitle].nil?
      @post.content.split(" ").each do |token|
        if token.match(/^http/)
          page = Nokogiri::HTML(open(token, :ssl_verify_mode => OpenSSL::SSL::VERIFY_NONE))
          @post.description = page.at_css("title").text unless page.nil?
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
