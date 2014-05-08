class Topic
  include Mongoid::Document
  field :name, type: String
  field :description, type: String
  field :created_at , type: Time, default: Time.zone.now
  field :updated_at , type: Time
  
  validates_presence_of :name

  has_many :subtopics, class_name: "Topic", dependent: :delete
  has_many :posts, dependent: :delete
  
  belongs_to :folder, inverse_of: :topics
  belongs_to :owner, class_name: "User", inverse_of: :topics
  belongs_to :parent_topic, class_name: "Topic", inverse_of: :subtopics
end
