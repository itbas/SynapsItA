class PostsController < ApplicationController
  skip_before_action :verify_authenticity_token
  respond_to :html, :json
  
  def create
    respond_with Post.create!(params.permit(:topic_id, :content))
  end
  
  def destroy
    respond_with Post.find(params[:id]).destroy
  end
end
