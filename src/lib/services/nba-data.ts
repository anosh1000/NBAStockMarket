import { calculateStockScore, type StockMetricSnapshot } from "@/lib/stock-score";

export type ExternalGameLog = {
  externalPlayerId: string;
  gameId: string;
  gameDate: string;
  opponent: string;
  teamWon: boolean;
  points: number;
  rebounds: number;
  assists: number;
  tsPct: number;
  fieldGoalAttempts: number;
  freeThrowAttempts: number;
};

export type NbaActivePlayer = {
  externalId: string;
  slug: string;
  name: string;
  team: string;
  teamAbbreviation: string;
  position: string;
  imageUrl: string;
};

export type IngestedPlayerMarket = NbaActivePlayer & {
  seasonStats: StockMetricSnapshot & { rpg: number };
  last10Stats: StockMetricSnapshot & { rpg: number };
  teamLast10WinPct: number;
  gamesPlayed: number;
  stock: ReturnType<typeof calculateStockScore>;
  allGames: ExternalGameLog[];
  last10Games: ExternalGameLog[];
};

export type NbaDataProvider = {
  getActivePlayers(): Promise<NbaActivePlayer[]>;
  getRecentGameLogs(externalPlayerId: string): Promise<ExternalGameLog[]>;
  getMarketPlayers(): Promise<IngestedPlayerMarket[]>;
};

type NbaStatsResponse = {
  resultSets?: Array<{
    headers: string[];
    rowSet: unknown[][];
  }>;
};

type NbaStatsRow = Record<string, unknown>;

const DEFAULT_SEASON = "2025-26";
const DEFAULT_BASELINE_SEASON_TYPE = "Regular Season";
const DEFAULT_RECENT_SEASON_TYPES = ["Regular Season", "Playoffs"];

function slugify(value: string, id: string) {
  const slug = value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return `${slug}-${id}`;
}

function getString(row: NbaStatsRow, key: string, fallback = "") {
  const value = row[key];
  return value === null || value === undefined ? fallback : String(value);
}

function getNumber(row: NbaStatsRow, key: string) {
  const value = Number(row[key]);
  return Number.isFinite(value) ? value : 0;
}

function rowsToObjects(response: NbaStatsResponse) {
  const resultSet = response.resultSets?.[0];

  if (!resultSet) {
    return [];
  }

  return resultSet.rowSet.map((row) =>
    Object.fromEntries(resultSet.headers.map((header, index) => [header, row[index]])),
  ) as NbaStatsRow[];
}

function parseOpponent(matchup: string) {
  if (matchup.includes(" vs. ")) {
    return matchup.split(" vs. ")[1] ?? matchup;
  }

  if (matchup.includes(" @ ")) {
    return matchup.split(" @ ")[1] ?? matchup;
  }

  return matchup;
}

function toIsoDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toISOString().slice(0, 10);
}

function average(values: number[]) {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}

function aggregateStats(logs: ExternalGameLog[]) {
  const points = logs.reduce((sum, game) => sum + game.points, 0);
  const shootingDenominator = logs.reduce(
    (sum, game) => sum + 2 * (game.fieldGoalAttempts + 0.44 * game.freeThrowAttempts),
    0,
  );

  return {
    ppg: round(average(logs.map((game) => game.points))),
    rpg: round(average(logs.map((game) => game.rebounds))),
    apg: round(average(logs.map((game) => game.assists))),
    tsPct: shootingDenominator > 0 ? Math.round((points / shootingDenominator) * 1000) / 1000 : 0,
  };
}

export class OfficialNbaStatsProvider implements NbaDataProvider {
  private readonly season: string;
  private readonly baselineSeasonType: string;
  private readonly recentSeasonTypes: string[];

  constructor(params?: { season?: string; baselineSeasonType?: string; recentSeasonTypes?: string[] }) {
    this.season = params?.season ?? process.env.NBA_SEASON ?? DEFAULT_SEASON;
    this.baselineSeasonType =
      params?.baselineSeasonType ?? process.env.NBA_SEASON_TYPE ?? DEFAULT_BASELINE_SEASON_TYPE;
    this.recentSeasonTypes =
      params?.recentSeasonTypes ??
      process.env.NBA_RECENT_SEASON_TYPES?.split(",").map((seasonType) => seasonType.trim()).filter(Boolean) ??
      DEFAULT_RECENT_SEASON_TYPES;
  }

  getSourceSeasonTypeLabel() {
    return `${this.baselineSeasonType} baseline / ${this.recentSeasonTypes.join(" + ")} recent`;
  }

  private async fetchEndpoint(endpoint: string, params: Record<string, string>) {
    const url = new URL(`https://stats.nba.com/stats/${endpoint}`);

    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
        Connection: "keep-alive",
        Host: "stats.nba.com",
        Origin: "https://www.nba.com",
        Referer: "https://www.nba.com/",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36",
        "x-nba-stats-origin": "stats",
        "x-nba-stats-token": "true",
      },
    });

    if (!response.ok) {
      throw new Error(`NBA Stats ${endpoint} failed with ${response.status}`);
    }

    return rowsToObjects((await response.json()) as NbaStatsResponse);
  }

  async getActivePlayers(): Promise<NbaActivePlayer[]> {
    const rows = await this.fetchEndpoint("playerindex", {
      Active: "1",
      AllStar: "",
      College: "",
      Country: "",
      DraftPick: "",
      DraftRound: "",
      DraftYear: "",
      Height: "",
      Historical: "",
      LeagueID: "00",
      Season: this.season,
      TeamID: "0",
      Weight: "",
    });

    return rows.map((row) => {
      const externalId = getString(row, "PERSON_ID");
      const firstName = getString(row, "PLAYER_FIRST_NAME");
      const lastName = getString(row, "PLAYER_LAST_NAME");
      const name = getString(row, "PLAYER_NAME", `${firstName} ${lastName}`.trim());

      return {
        externalId,
        slug: slugify(name, externalId),
        name,
        team: getString(row, "TEAM_NAME", getString(row, "TEAM_CITY")),
        teamAbbreviation: getString(row, "TEAM_ABBREVIATION"),
        position: getString(row, "POSITION", "NBA"),
        imageUrl: `https://cdn.nba.com/headshots/nba/latest/1040x760/${externalId}.png`,
      };
    });
  }

  async getRecentGameLogs(externalPlayerId: string): Promise<ExternalGameLog[]> {
    const logs = await this.getCombinedRecentGameLogs();
    return logs.filter((log) => log.externalPlayerId === externalPlayerId).slice(0, 10);
  }

  async getLeagueGameLogs(seasonType = this.baselineSeasonType): Promise<ExternalGameLog[]> {
    const rows = await this.fetchEndpoint("leaguegamelog", {
      Counter: "0",
      DateFrom: "",
      DateTo: "",
      Direction: "DESC",
      LeagueID: "00",
      PlayerOrTeam: "P",
      Season: this.season,
      SeasonType: seasonType,
      Sorter: "DATE",
    });

    return rows
      .map((row) => {
        const points = getNumber(row, "PTS");
        const fieldGoalAttempts = getNumber(row, "FGA");
        const freeThrowAttempts = getNumber(row, "FTA");
        const denominator = 2 * (fieldGoalAttempts + 0.44 * freeThrowAttempts);

        return {
          externalPlayerId: getString(row, "PLAYER_ID"),
          gameId: getString(row, "GAME_ID"),
          gameDate: toIsoDate(getString(row, "GAME_DATE")),
          opponent: parseOpponent(getString(row, "MATCHUP")),
          teamWon: getString(row, "WL") === "W",
          points,
          rebounds: getNumber(row, "REB"),
          assists: getNumber(row, "AST"),
          tsPct: denominator > 0 ? Math.round((points / denominator) * 1000) / 1000 : 0,
          fieldGoalAttempts,
          freeThrowAttempts,
        };
      })
      .filter((log) => log.externalPlayerId && log.gameId)
      .sort((a, b) => b.gameDate.localeCompare(a.gameDate));
  }

  async getCombinedRecentGameLogs(): Promise<ExternalGameLog[]> {
    const logSets = await Promise.all(
      this.recentSeasonTypes.map((seasonType) => this.getLeagueGameLogs(seasonType)),
    );
    const logsByPlayerGame = new Map<string, ExternalGameLog>();

    logSets.flat().forEach((log) => {
      logsByPlayerGame.set(`${log.externalPlayerId}-${log.gameId}`, log);
    });

    return Array.from(logsByPlayerGame.values()).sort((a, b) =>
      b.gameDate.localeCompare(a.gameDate),
    );
  }

  async getMarketPlayers(): Promise<IngestedPlayerMarket[]> {
    const [activePlayers, baselineGameLogs, recentGameLogs] = await Promise.all([
      this.getActivePlayers(),
      this.getLeagueGameLogs(),
      this.getCombinedRecentGameLogs(),
    ]);

    const activePlayerMap = new Map(activePlayers.map((player) => [player.externalId, player]));
    const logsByPlayer = new Map<string, ExternalGameLog[]>();
    const baselineLogsByPlayer = new Map<string, ExternalGameLog[]>();

    recentGameLogs.forEach((log) => {
      const logs = logsByPlayer.get(log.externalPlayerId) ?? [];
      logs.push(log);
      logsByPlayer.set(log.externalPlayerId, logs);
    });

    baselineGameLogs.forEach((log) => {
      const logs = baselineLogsByPlayer.get(log.externalPlayerId) ?? [];
      logs.push(log);
      baselineLogsByPlayer.set(log.externalPlayerId, logs);
    });

    return Array.from(logsByPlayer.entries())
      .filter(([externalId]) => !activePlayers.length || activePlayerMap.has(externalId))
      .map(([externalId, logs]) => {
        const activePlayer = activePlayerMap.get(externalId);
        const nameFallback = `NBA Player ${externalId}`;
        const player =
          activePlayer ??
          ({
            externalId,
            slug: slugify(nameFallback, externalId),
            name: nameFallback,
            team: "NBA",
            teamAbbreviation: "NBA",
            position: "NBA",
            imageUrl: `https://cdn.nba.com/headshots/nba/latest/1040x760/${externalId}.png`,
          } satisfies NbaActivePlayer);

        const last10Games = logs.slice(0, 10);
        const baselineLogs = baselineLogsByPlayer.get(externalId) ?? logs;
        const seasonStats = aggregateStats(baselineLogs);
        const last10Stats = aggregateStats(last10Games);
        const teamLast10WinPct = last10Games.length
          ? last10Games.filter((game) => game.teamWon).length / last10Games.length
          : 0;
        const stock = calculateStockScore({
          season: seasonStats,
          last10: last10Stats,
          teamLast10WinPct,
        });

        return {
          ...player,
          seasonStats,
          last10Stats,
          teamLast10WinPct,
          gamesPlayed: logs.length,
          stock,
          allGames: logs,
          last10Games,
        };
      })
      .filter((player) => player.gamesPlayed > 0)
      .sort((a, b) => b.stock.score - a.stock.score);
  }
}

export const FreePublicNbaDataProvider = OfficialNbaStatsProvider;
