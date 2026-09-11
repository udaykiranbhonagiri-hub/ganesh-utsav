import { redirect } from "next/navigation";

const games = [
  "chess",
  "cricket",
  "carrom",
  "freefire",
  "quiz",
  "fun",
  "smashkarts",
  "uno",
  "rummy",
];

export function generateStaticParams() {
  return games.map((game) => ({
    game,
  }));
}

type Props = {
  params: Promise<{
    game: string;
  }>;
};

export default async function GameRegistrationPage({
  params,
}: Props) {
  const { game } = await params;

  redirect(`/register?game=${game}`);
}