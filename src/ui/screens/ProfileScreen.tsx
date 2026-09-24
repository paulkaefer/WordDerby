import { loadProfile } from "../../persistence/profileStore";

/** Displays cumulative stats, skill tier, cosmetics, and achievements (FR-024–FR-028). */
export function ProfileScreen() {
  const profile = loadProfile();
  const { stats } = profile;
  const winRate = stats.roundsPlayed === 0 ? 0 : Math.round((stats.roundsWon / stats.roundsPlayed) * 100);
  const favoriteLetter = Object.entries(stats.letterCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

  return (
    <div className="profile-screen">
      <h2>Your Stats</h2>
      <ul>
        <li>Win rate: {winRate}%</li>
        <li>Best streak: {stats.bestStreak}</li>
        <li>
          Average falls:{" "}
          {stats.roundsPlayed === 0 ? "—" : (stats.totalFalls / stats.roundsPlayed).toFixed(1)}
        </li>
        <li>Favorite letter: {favoriteLetter ?? "—"}</li>
        <li>Skill tier: {profile.skillTier}</li>
        <li>Daily streak: {profile.dailyStreak}</li>
      </ul>
      <h3>Achievements</h3>
      <ul>
        {profile.achievements.length === 0 && <li>None yet — go skate!</li>}
        {profile.achievements.map((a) => (
          <li key={a}>{a}</li>
        ))}
      </ul>
    </div>
  );
}
