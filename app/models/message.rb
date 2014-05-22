class Message
  include Mongoid::Document
  include Mongoid::Timestamps

  field :type, type: String
  field :content, type: String

  belongs_to :from_user, class_name: "User", inverse_of: :inbox
  belongs_to :to_user, class_name: "User", inverse_of: :outbox
end
