class Post
  include Mongoid::Document
  field :sid, type: String, default: -> { _id.to_s }
  field :content, type: String
  field :description, type: String
  field :created_at , type: DateTime, default: Time.now
  field :updated_at , type: DateTime
  
  validates_presence_of :content
  
  belongs_to :topic
end
