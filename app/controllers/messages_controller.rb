class MessagesController < ApplicationController
	before_action :set_msg, only: [:destroy]
  skip_before_action :verify_authenticity_token
  respond_to :json

  def msg_in
    respond_with current_user.msg_from.all
  end

  def msg_out
    respond_with current_user.msg_to.all
  end
  
  def create
  	@msg = Post.new(topic_params)

    respond_with 
  end
  
  def destroy
    respond_with @msg_from.destroy
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
