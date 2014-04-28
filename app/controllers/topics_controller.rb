class TopicsController < ApplicationController
  before_action :set_topic, only: [:show, :edit, :update, :destroy]
  skip_before_action :verify_authenticity_token
  respond_to :json

  # GET /topics
  # GET /topics.json
  def index
    @topics = Topic.all
    respond_with @topics
  end

  # GET /topics/1
  # GET /topics/1.json
  def show
    @posts = @topic.posts
    respond_with @posts
  end

  # POST /topics
  # POST /topics.json
  def create
    respond_with Topic.create!(topic_params)
  end

  # PATCH/PUT /topics/1
  # PATCH/PUT /topics/1.json
  def update
    respond_with @topic.update(topic_params)    
  end

  # DELETE /topics/1
  # DELETE /topics/1.json
  def destroy
    respond_with @topic.destroy    
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_topic
      @topic = Topic.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def topic_params
      params.permit(:name, :description)
    end
end