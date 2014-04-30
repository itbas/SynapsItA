class PostsController < ApplicationController
  before_action :set_post, only: [:update, :destroy]
  skip_before_action :verify_authenticity_token
  respond_to :html, :json
  
  def create
    respond_with Post.create!(topic_params)
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
      params.permit(:topic_id, :content)
    end
end
