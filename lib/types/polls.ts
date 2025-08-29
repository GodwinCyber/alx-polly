export type Poll = {
  id: string;
  question: string;
  user_id: string;
  created_at: string;
  updated_at?: string;
};

export type PollOption = {
  id: string;
  poll_id: string;
  text: string;
  created_at: string;
};

export type Vote = {
  id: string;
  user_id: string;
  poll_option_id: string;
  poll_id: string;
  created_at: string;
};
