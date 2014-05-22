class MessagesController < ApplicationController
  before_filter :authenticate_user!
	before_action :set_msg, only: [:destroy]
  respond_to :json

  def msg_in
    respond_with current_user.inbox.all
  end

  def msg_out
    respond_with current_user.outbox.all
  end
  
  def create
  	@msg = Post.new(topic_params)

    respond_with 
  end
  
  def destroy
    respond_with @msg.destroy
  end
  
  private
    # Use callbacks to share common setup or constraints between actions.
    def set_msg
      @msg = Message.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def msg_params
      params.permit(:content)
    end
end
