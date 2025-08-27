import { ReactNode } from "react";
import PollLayout from "../components/polls/PollLayout";

export default function Layout({ children }: { children: ReactNode }) {
  return <PollLayout>{children}</PollLayout>;
}