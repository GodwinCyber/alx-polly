import { Poll, PollOption } from "./polls";

export type PollWithOptions = Poll & {
  poll_options: PollOption[];
  isOwner: boolean;
};
