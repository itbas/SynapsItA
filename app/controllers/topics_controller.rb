class TopicsController < ApplicationController
  before_filter :authenticate_user!
  before_action :set_topic, only: [:show, :showsubs, :name, :update, :destroy]
  respond_to :json

  # GET /topics
  # GET /topics.json
  def index
    respond_with current_user.topics.all.to_json(:include => [:posts, :owner])
  end

  # GET /topics/1
  # GET /topics/1.json
  def show
    respond_with @topic.posts
  end

  def showsubs
    respond_with @topic.subtopics
  end

  def name
    respond_with @topic.name
  end

  # POST /topics
  # POST /topics.json
  def create
    @topic = Topic.create(topic_params)
    current_user.topics.push(@topic)
    
    respond_with @topic
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
      params.permit(:name, :folder_id, :description, :parent_topic, :shared_with_ids)
    end
end
