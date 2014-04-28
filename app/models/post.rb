class Post
  include Mongoid::Document
  field :sid, type: String, default: -> { _id.to_s }
  field :content, type: String

  belongs_to :topic
end
