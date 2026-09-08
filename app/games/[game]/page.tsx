import GameRegistrationClient from "./GameRegistrationClient";

const games = [
  "chess",
  "cricket",
  "carrom",
  "quiz",
  "fun",
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

  return <GameRegistrationClient gameSlug={game} />;
}