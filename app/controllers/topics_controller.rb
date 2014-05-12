class TopicsController < ApplicationController
  before_action :set_topic, only: [:show, :showsubs, :name, :update, :destroy]
  skip_before_action :verify_authenticity_token
  respond_to :json

  # GET /topics
  # GET /topics.json
  def index
    respond_with current_user.topics.all
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
    @topic.update(topic_params)

    unless params[:shared_with_ids].nil?
      params[:shared_with_ids].each do |shared_with_id|
        @user = User.find(shared_with_id)

        @topic.shared_with.push(@user)
        @user.share.push(@topic)
      end
    end

    respond_with @topic
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
