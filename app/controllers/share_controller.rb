class ShareController < ApplicationController
	before_action :set_topic, only: [:save]
	skip_before_action :verify_authenticity_token
  respond_to :json

  def list
  	respond_with current_user ? current_user.share.all : ""
  end

  def users
  	respond_with User.all
  end

  def save
  	User.all.each do |user|
      user.share.delete(@topic)
      user.save
    end

    unless params[:shared_with_ids].nil?
      params[:shared_with_ids].each do |shared_with_id|
        user = User.find(shared_with_id)

        @topic.shared_with.push(user)
        user.share.push(@topic)
      end
    end

    respond_with @topic
  end

  private
    def set_topic
      @topic = Topic.find(params[:id])
    end
end
