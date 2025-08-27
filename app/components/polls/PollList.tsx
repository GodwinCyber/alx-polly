import PollCard from './PollCard';

const dummyPolls = [
  {
    id: "1",
    title: "Favorite Programming Language",
    description: "What programming language do you prefer to use?",
    options: 5,
    votes: 42,
    createdAt: "2023-10-15",
  },
  {
    id: "2",
    title: "Best Frontend Framework",
    description: "Which frontend framework do you think is the best?",
    options: 4,
    votes: 38,
    createdAt: "2023-10-10",
  },
  {
    id: "3",
    title: "Preferred Database",
    description: "What database do you prefer to work with?",
    options: 5,
    votes: 27,
    createdAt: "2023-10-05",
  },
];

export default function PollList() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {dummyPolls.map((poll) => (
        <PollCard key={poll.id} poll={poll} />
      ))}
    </div>
  );
}