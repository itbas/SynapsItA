class Post
  include Mongoid::Document
  include Mongoid::Timestamps

  field :content, type: String
  field :description, type: String
  field :linked_metas, type: Array
  
  validates_presence_of :content
  
  belongs_to :topic
  belongs_to :owner, class_name: "User", inverse_of: :posts
end
