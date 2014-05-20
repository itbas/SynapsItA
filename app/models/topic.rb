class Topic
  include Mongoid::Document
  include Mongoid::Timestamps

  field :name, type: String
  field :description, type: String
  
  validates_presence_of :name

  has_many :subtopics, class_name: "Topic", dependent: :delete
  has_many :posts, dependent: :delete

  has_and_belongs_to_many :shared_with, class_name: "User", inverse_of: :share
  
  belongs_to :folder, inverse_of: :topics
  belongs_to :owner, class_name: "User", inverse_of: :topics
  belongs_to :parent_topic, class_name: "Topic", inverse_of: :subtopics
end
