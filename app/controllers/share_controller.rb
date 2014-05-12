class ShareController < ApplicationController
	skip_before_action :verify_authenticity_token
  respond_to :json

  def list
  	respond_with current_user.share.all
  end

  def users
  	respond_with User.all
  end
end
