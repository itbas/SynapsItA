class Post
  include Mongoid::Document
  field :content, type: String
  field :description, type: String
  field :created_at , type: DateTime, default: Time.zone.now
  field :updated_at , type: DateTime
  field :linked_metas, type: Array
  
  validates_presence_of :content
  
  belongs_to :topic
  belongs_to :owner, class_name: "User", inverse_of: :posts
end
