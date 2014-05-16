class FoldersController < ApplicationController
  before_action :set_folder, only: [:show, :update, :destroy]
  skip_before_action :verify_authenticity_token
  respond_to :json

  # GET /folders
  # GET /folders.json
  def index
    respond_with current_user ? current_user.folders.all : ""
  end

  # GET /folders/1
  # GET /folders/1.json
  def show
    respond_with current_user ? @folder.topics.all.to_json(:include => [:posts, :owner]) : ""
  end

  # POST /folders
  # POST /folders.json
  def create
    @folder = Folder.create(folder_params)
    current_user.folders.push(@folder)

    respond_with @folder
  end

  # PATCH/PUT /folders/1
  # PATCH/PUT /folders/1.json
  def update
    respond_with @folder.update(folder_params)
  end

  # DELETE /folders/1
  # DELETE /folders/1.json
  def destroy
    respond_with @folder.destroy
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_folder
      @folder = Folder.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def folder_params
      params.require(:folder).permit(:name, :description)
    end
end
