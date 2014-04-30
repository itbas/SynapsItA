class Folder
  include Mongoid::Document
  field :sid, type: String, default: -> { _id.to_s }
  field :name, type: String
  field :description, type: String
  field :created_at , type: DateTime, default: Time.now
  
  has_many :topics
  
  belongs_to :owner, class_name: "User", inverse_of: :folders
end
