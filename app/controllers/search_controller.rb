class SearchController < ApplicationController
	before_action :set_search, only: [:tags, :topics, :posts]
	skip_before_action :verify_authenticity_token
  respond_to :json

  def topics
  	respond_with current_user.topics.any_of({name: /#{@search}/i}, {description: /#{@search}/i})
  end

  def posts
  	respond_with current_user.posts.any_of({name: /#{@search}/i}, {description: /#{@search}/i})
  end

  private
    def set_search
      @search = params.permit(:str)
    end
end
