import GameRegistrationClient from "./GameRegistrationClient";

export const instant = false;

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