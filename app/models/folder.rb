class Folder
  include Mongoid::Document
  include Mongoid::Timestamps

  field :name, type: String
  field :description, type: String  
  
  has_many :topics
  
  belongs_to :owner, class_name: "User", inverse_of: :folders
end
