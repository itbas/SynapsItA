class Message
  include Mongoid::Document
  include Mongoid::Timestamps

  field :content, type: String

  embedded_in :from_user, class_name: "User", inverse_of: :msg_in
  embedded_in :to_user, class_name: "User", inverse_of: :msg_out
end
