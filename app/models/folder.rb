class Folder
  include Mongoid::Document
  field :name, type: String
  field :description, type: String
  field :created_at , type: DateTime, default: Time.zone.now
  
  has_many :topics
  
  belongs_to :owner, class_name: "User", inverse_of: :folders
end
