class Post
  include Mongoid::Document
  field :content, type: String
  field :description, type: String
  field :created_at , type: Time, default: Time.zone.now
  field :updated_at , type: Time
  
  validates_presence_of :content
  
  belongs_to :topic
  belongs_to :owner, class_name: "User", inverse_of: :posts
end
