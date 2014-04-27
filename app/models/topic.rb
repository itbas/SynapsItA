class Topic
  include Mongoid::Document
  field :sid, type: String, default: -> { _id.to_s }
  field :name, type: String
  field :description, type: String

  has_many :posts, dependent: :delete
end
