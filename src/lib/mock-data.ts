import {
  calculateStockScore,
  type StockScoreBreakdown,
  type StockMetricSnapshot,
} from "@/lib/stock-score";

export type PlayerStatsSnapshot = StockMetricSnapshot & {
  rpg: number;
};

export type GameLog = {
  gameDate: string;
  opponent: string;
  won: boolean;
  points: number;
  rebounds: number;
  assists: number;
  tsPct: number;
};

export type StockHistoryPoint = {
  date: string;
  score: number;
};

export type ScoutReportSections = {
  summary: string;
  movement: string;
  strengths: string[];
  concerns: string[];
  outlook: string;
};

export type PlayerMarket = {
  id: string;
  externalId: string;
  name: string;
  team: string;
  teamAbbreviation: string;
  position: string;
  imageUrl: string;
  views: number;
  seasonStats: PlayerStatsSnapshot;
  last10Stats: PlayerStatsSnapshot;
  teamLast10WinPct: number;
  stock: StockScoreBreakdown;
  stockHistory: StockHistoryPoint[];
  last10Games: GameLog[];
  report: ScoutReportSections;
};

type PlayerSeed = Omit<
  PlayerMarket,
  "stock" | "stockHistory" | "last10Games"
>;

const opponents = ["DEN", "BOS", "MIN", "NYK", "DAL", "CLE", "MIL", "LAC", "PHX", "ORL"];
const pointPattern = [6, -4, 3, 1, -6, 7, -2, 4, -3, -1];
const reboundPattern = [1, -1, 2, 0, -2, 1, 0, 3, -1, -1];
const assistPattern = [2, -1, 1, 0, -2, 2, -1, 1, 0, -1];

const playerSeeds: PlayerSeed[] = [
  {
    id: "shai-gilgeous-alexander",
    externalId: "1628983",
    name: "Shai Gilgeous-Alexander",
    team: "Oklahoma City Thunder",
    teamAbbreviation: "OKC",
    position: "G",
    imageUrl: "https://cdn.nba.com/headshots/nba/latest/1040x760/1628983.png",
    views: 52840,
    seasonStats: { ppg: 31.2, rpg: 5.4, apg: 6.4, tsPct: 0.636 },
    last10Stats: { ppg: 34.8, rpg: 5.8, apg: 7.2, tsPct: 0.668 },
    teamLast10WinPct: 0.8,
    report: {
      summary: "Gilgeous-Alexander is trading like a franchise index fund with elite scoring stability and another recent efficiency spike.",
      movement: "His stock is rising because the last 10 games show higher scoring volume, cleaner shot quality, and stronger playmaking while Oklahoma City keeps winning.",
      strengths: ["Rim pressure remains constant", "Free throw generation supports the floor", "Late-clock creation is carrying high value"],
      concerns: ["Usage is already near a ceiling", "Minor efficiency regression would flatten the chart"],
      outlook: "The profile still looks premium. Unless the Thunder cool off, he should remain near the top of the market.",
    },
  },
  {
    id: "jalen-williams",
    externalId: "1631114",
    name: "Jalen Williams",
    team: "Oklahoma City Thunder",
    teamAbbreviation: "OKC",
    position: "F",
    imageUrl: "https://cdn.nba.com/headshots/nba/latest/1040x760/1631114.png",
    views: 43120,
    seasonStats: { ppg: 19.1, rpg: 4.2, apg: 4.5, tsPct: 0.612 },
    last10Stats: { ppg: 23.7, rpg: 5.1, apg: 5.8, tsPct: 0.646 },
    teamLast10WinPct: 0.8,
    report: {
      summary: "Williams has become one of the board's cleanest risers, combining a scoring jump with expanded on-ball work.",
      movement: "The market is rewarding a larger creation role, better true shooting, and Oklahoma City's recent team success.",
      strengths: ["Three-level shot profile", "Secondary playmaking growth", "Defensive versatility keeps him on the floor"],
      concerns: ["Volume has risen quickly", "Turnover pressure could climb against playoff coverages"],
      outlook: "The momentum is backed by real role growth, making the rise more durable than a simple hot streak.",
    },
  },
  {
    id: "anthony-edwards",
    externalId: "1630162",
    name: "Anthony Edwards",
    team: "Minnesota Timberwolves",
    teamAbbreviation: "MIN",
    position: "G",
    imageUrl: "https://cdn.nba.com/headshots/nba/latest/1040x760/1630162.png",
    views: 48960,
    seasonStats: { ppg: 26.4, rpg: 5.3, apg: 5.1, tsPct: 0.586 },
    last10Stats: { ppg: 31.1, rpg: 6.0, apg: 5.9, tsPct: 0.615 },
    teamLast10WinPct: 0.7,
    report: {
      summary: "Edwards is showing bullish momentum as his scoring burst is arriving without sacrificing efficiency.",
      movement: "The stock is rising on improved pull-up shotmaking, stronger rim pressure, and a healthier assist profile.",
      strengths: ["Explosive downhill creation", "High-leverage shotmaking", "Defensive activity in marquee matchups"],
      concerns: ["Shot diet can still swing game to game", "Heavy minutes could affect late-season legs"],
      outlook: "The current trend has star-level support and should keep him in the top riser conversation.",
    },
  },
  {
    id: "victor-wembanyama",
    externalId: "1641705",
    name: "Victor Wembanyama",
    team: "San Antonio Spurs",
    teamAbbreviation: "SAS",
    position: "C",
    imageUrl: "https://cdn.nba.com/headshots/nba/latest/1040x760/1641705.png",
    views: 61230,
    seasonStats: { ppg: 21.4, rpg: 10.6, apg: 3.9, tsPct: 0.565 },
    last10Stats: { ppg: 26.9, rpg: 12.3, apg: 4.8, tsPct: 0.602 },
    teamLast10WinPct: 0.5,
    report: {
      summary: "Wembanyama's individual stock is ripping higher even with neutral team-success support.",
      movement: "Higher scoring efficiency and a broader playmaking footprint are outweighing a merely average recent team record.",
      strengths: ["Elite defensive gravity", "Improving post and trail-three balance", "Passing reads are speeding up"],
      concerns: ["Team context limits the success component", "Physical workload remains substantial"],
      outlook: "The long-term market remains extremely bullish, especially if team wins begin matching the individual surge.",
    },
  },
  {
    id: "jalen-brunson",
    externalId: "1628973",
    name: "Jalen Brunson",
    team: "New York Knicks",
    teamAbbreviation: "NYK",
    position: "G",
    imageUrl: "https://cdn.nba.com/headshots/nba/latest/1040x760/1628973.png",
    views: 38620,
    seasonStats: { ppg: 27.6, rpg: 3.5, apg: 6.7, tsPct: 0.594 },
    last10Stats: { ppg: 31.5, rpg: 3.9, apg: 7.6, tsPct: 0.621 },
    teamLast10WinPct: 0.7,
    report: {
      summary: "Brunson's market is gaining as his offensive control continues to scale under pressure.",
      movement: "The last 10 games show better scoring and creation efficiency, amplified by a strong Knicks record.",
      strengths: ["Elite footwork in the lane", "Reliable late-game decision-making", "Low turnover creation"],
      concerns: ["Size can invite traps", "High burden requires consistent spacing around him"],
      outlook: "A strong buy signal remains in place while the efficiency and win-rate inputs stay elevated.",
    },
  },
  {
    id: "cade-cunningham",
    externalId: "1630595",
    name: "Cade Cunningham",
    team: "Detroit Pistons",
    teamAbbreviation: "DET",
    position: "G",
    imageUrl: "https://cdn.nba.com/headshots/nba/latest/1040x760/1630595.png",
    views: 31290,
    seasonStats: { ppg: 22.7, rpg: 4.4, apg: 7.5, tsPct: 0.552 },
    last10Stats: { ppg: 27.4, rpg: 5.2, apg: 8.9, tsPct: 0.589 },
    teamLast10WinPct: 0.6,
    report: {
      summary: "Cunningham is breaking upward as Detroit's offense has looked more organized with him steering possessions.",
      movement: "His improved scoring efficiency and playmaking both clear the season baseline by meaningful margins.",
      strengths: ["Big-guard passing windows", "Improved pace control", "Better rim and midrange balance"],
      concerns: ["Spacing still changes his margin for error", "Defensive pressure can force difficult releases"],
      outlook: "The stock is no longer just projection-driven; recent production is giving the market real evidence.",
    },
  },
  {
    id: "tyrese-maxey",
    externalId: "1630178",
    name: "Tyrese Maxey",
    team: "Philadelphia 76ers",
    teamAbbreviation: "PHI",
    position: "G",
    imageUrl: "https://cdn.nba.com/headshots/nba/latest/1040x760/1630178.png",
    views: 27490,
    seasonStats: { ppg: 25.9, rpg: 3.7, apg: 6.2, tsPct: 0.579 },
    last10Stats: { ppg: 29.8, rpg: 4.0, apg: 7.1, tsPct: 0.607 },
    teamLast10WinPct: 0.6,
    report: {
      summary: "Maxey's stock is moving higher on acceleration, volume, and a cleaner assist-to-shot balance.",
      movement: "Recent scoring and playmaking gains are both above his already strong season line.",
      strengths: ["Transition speed creates easy points", "Deep range bends defenses", "Improving reads against help"],
      concerns: ["Small-guard finishing can be matchup-sensitive", "Team availability around him changes coverage"],
      outlook: "Maxey's market remains constructive, especially if Philadelphia's win component stabilizes.",
    },
  },
  {
    id: "alperen-sengun",
    externalId: "1630578",
    name: "Alperen Sengun",
    team: "Houston Rockets",
    teamAbbreviation: "HOU",
    position: "C",
    imageUrl: "https://cdn.nba.com/headshots/nba/latest/1040x760/1630578.png",
    views: 24730,
    seasonStats: { ppg: 21.1, rpg: 9.3, apg: 5.0, tsPct: 0.585 },
    last10Stats: { ppg: 24.9, rpg: 10.5, apg: 6.4, tsPct: 0.617 },
    teamLast10WinPct: 0.6,
    report: {
      summary: "Sengun is climbing as Houston continues to run more efficient offense through his touch hub.",
      movement: "Scoring, true shooting, and assist rate are all rising versus his season baseline.",
      strengths: ["Creative elbow passing", "Soft touch in traffic", "Rebounding supports possession value"],
      concerns: ["Defensive matchup range is still monitored", "Foul trouble can cap minutes"],
      outlook: "The stock looks fundamentally supported if the Rockets keep spacing the floor around him.",
    },
  },
  {
    id: "tyrese-haliburton",
    externalId: "1630169",
    name: "Tyrese Haliburton",
    team: "Indiana Pacers",
    teamAbbreviation: "IND",
    position: "G",
    imageUrl: "https://cdn.nba.com/headshots/nba/latest/1040x760/1630169.png",
    views: 35310,
    seasonStats: { ppg: 20.1, rpg: 3.7, apg: 10.9, tsPct: 0.604 },
    last10Stats: { ppg: 23.6, rpg: 3.9, apg: 12.4, tsPct: 0.628 },
    teamLast10WinPct: 0.6,
    report: {
      summary: "Haliburton is ticking upward as the assist engine is pairing with renewed scoring confidence.",
      movement: "A stronger last-10 scoring trend and elite playmaking keep his stock in positive territory.",
      strengths: ["Transition passing punishes mistakes", "Deep pull-up range", "Low-turnover orchestration"],
      concerns: ["Physical pressure can disrupt rhythm", "Defensive value is more dependent on team scheme"],
      outlook: "The outlook is positive if his scoring burst holds alongside the passing baseline.",
    },
  },
  {
    id: "paolo-banchero",
    externalId: "1631094",
    name: "Paolo Banchero",
    team: "Orlando Magic",
    teamAbbreviation: "ORL",
    position: "F",
    imageUrl: "https://cdn.nba.com/headshots/nba/latest/1040x760/1631094.png",
    views: 28850,
    seasonStats: { ppg: 22.6, rpg: 6.9, apg: 5.4, tsPct: 0.556 },
    last10Stats: { ppg: 25.7, rpg: 7.5, apg: 6.0, tsPct: 0.579 },
    teamLast10WinPct: 0.6,
    report: {
      summary: "Banchero is grinding higher with more efficient primary creation and steady box-score breadth.",
      movement: "The stock is rising because his scoring bump is paired with modest gains in playmaking and team results.",
      strengths: ["Power wing creation", "Improved passing patience", "Gets to preferred spots late in games"],
      concerns: ["Three-point variance still matters", "Turnovers rise when spacing tightens"],
      outlook: "This is a healthy upward move, though not as explosive as the top growth names.",
    },
  },
  {
    id: "nikola-jokic",
    externalId: "203999",
    name: "Nikola Jokic",
    team: "Denver Nuggets",
    teamAbbreviation: "DEN",
    position: "C",
    imageUrl: "https://cdn.nba.com/headshots/nba/latest/1040x760/203999.png",
    views: 55710,
    seasonStats: { ppg: 26.4, rpg: 12.4, apg: 9.0, tsPct: 0.65 },
    last10Stats: { ppg: 27.1, rpg: 12.8, apg: 9.5, tsPct: 0.657 },
    teamLast10WinPct: 0.7,
    report: {
      summary: "Jokic is more blue-chip stability than momentum trade, but the recent line still grades positive.",
      movement: "Small gains in scoring and playmaking, plus Denver wins, keep his stock above neutral.",
      strengths: ["Best-in-class offensive processing", "Elite touch", "Controls game tempo without forcing volume"],
      concerns: ["Already priced at a premium", "Regular-season spikes can be muted by managed aggression"],
      outlook: "The floor remains among the safest on the board, with steady upside when Denver strings wins together.",
    },
  },
  {
    id: "luka-doncic",
    externalId: "1629029",
    name: "Luka Doncic",
    team: "Dallas Mavericks",
    teamAbbreviation: "DAL",
    position: "G",
    imageUrl: "https://cdn.nba.com/headshots/nba/latest/1040x760/1629029.png",
    views: 59280,
    seasonStats: { ppg: 32.9, rpg: 9.2, apg: 9.8, tsPct: 0.617 },
    last10Stats: { ppg: 33.4, rpg: 9.1, apg: 10.3, tsPct: 0.619 },
    teamLast10WinPct: 0.6,
    report: {
      summary: "Doncic remains a mega-cap star with a slightly positive trend rather than a dramatic breakout.",
      movement: "The recent profile is close to his elite season baseline, with team success providing the main lift.",
      strengths: ["Unmatched usage resilience", "Elite passing manipulation", "Shotmaking against set defenses"],
      concerns: ["Defensive workload can fluctuate", "High usage leaves limited room for statistical acceleration"],
      outlook: "The market should remain stable to positive unless Dallas' win component dips.",
    },
  },
  {
    id: "giannis-antetokounmpo",
    externalId: "203507",
    name: "Giannis Antetokounmpo",
    team: "Milwaukee Bucks",
    teamAbbreviation: "MIL",
    position: "F",
    imageUrl: "https://cdn.nba.com/headshots/nba/latest/1040x760/203507.png",
    views: 50540,
    seasonStats: { ppg: 30.4, rpg: 11.5, apg: 6.3, tsPct: 0.642 },
    last10Stats: { ppg: 29.8, rpg: 11.2, apg: 6.6, tsPct: 0.636 },
    teamLast10WinPct: 0.6,
    report: {
      summary: "Antetokounmpo is hovering near neutral with elite output but little recent acceleration.",
      movement: "Playmaking and team success support the score, while scoring and efficiency are slightly below season pace.",
      strengths: ["Paint pressure warps defenses", "Transition dominance", "Defensive event creation"],
      concerns: ["Half-court spacing remains relevant", "Free throw efficiency affects late-game value"],
      outlook: "The stock is stable. A short scoring run would quickly move him back into the riser column.",
    },
  },
  {
    id: "jayson-tatum",
    externalId: "1628369",
    name: "Jayson Tatum",
    team: "Boston Celtics",
    teamAbbreviation: "BOS",
    position: "F",
    imageUrl: "https://cdn.nba.com/headshots/nba/latest/1040x760/1628369.png",
    views: 47390,
    seasonStats: { ppg: 26.9, rpg: 8.1, apg: 4.9, tsPct: 0.604 },
    last10Stats: { ppg: 25.8, rpg: 7.7, apg: 5.2, tsPct: 0.598 },
    teamLast10WinPct: 0.7,
    report: {
      summary: "Tatum is essentially range-bound, with team success offsetting a modest scoring cooldown.",
      movement: "Boston's winning keeps the stock positive even though scoring and efficiency are a touch under season norms.",
      strengths: ["Scalable two-way wing profile", "Rebounding from the forward spot", "Comfortable in multiple actions"],
      concerns: ["Shot selection can flatten efficiency", "Box-score ceiling is shared on a deep roster"],
      outlook: "The market remains stable with upside if his scoring trend catches up to Boston's team performance.",
    },
  },
  {
    id: "damian-lillard",
    externalId: "203081",
    name: "Damian Lillard",
    team: "Milwaukee Bucks",
    teamAbbreviation: "MIL",
    position: "G",
    imageUrl: "https://cdn.nba.com/headshots/nba/latest/1040x760/203081.png",
    views: 32670,
    seasonStats: { ppg: 24.3, rpg: 4.4, apg: 7.0, tsPct: 0.593 },
    last10Stats: { ppg: 20.8, rpg: 3.9, apg: 6.2, tsPct: 0.548 },
    teamLast10WinPct: 0.5,
    report: {
      summary: "Lillard's stock is under pressure as recent scoring efficiency has slipped below his usual standard.",
      movement: "The last-10 profile trails the season baseline in scoring, true shooting, and assists.",
      strengths: ["Deep range still changes coverage", "Late-clock confidence", "Pick-and-roll gravity"],
      concerns: ["Efficiency volatility is dragging the score", "Defensive matchups add pressure to offensive output"],
      outlook: "A rebound is plausible, but the current signal is bearish until shotmaking normalizes.",
    },
  },
  {
    id: "joel-embiid",
    externalId: "203954",
    name: "Joel Embiid",
    team: "Philadelphia 76ers",
    teamAbbreviation: "PHI",
    position: "C",
    imageUrl: "https://cdn.nba.com/headshots/nba/latest/1040x760/203954.png",
    views: 36750,
    seasonStats: { ppg: 27.4, rpg: 10.9, apg: 5.6, tsPct: 0.62 },
    last10Stats: { ppg: 21.1, rpg: 9.4, apg: 4.2, tsPct: 0.552 },
    teamLast10WinPct: 0.4,
    report: {
      summary: "Embiid is one of the board's biggest fallers as scoring volume and efficiency have both softened.",
      movement: "The model is penalizing a sharp last-10 scoring gap, lower true shooting, and reduced playmaking.",
      strengths: ["Interior scoring gravity remains elite", "Free throw pressure can revive efficiency quickly", "Rim protection still matters"],
      concerns: ["Availability and rhythm concerns weigh on the chart", "Current playmaking trend is below baseline"],
      outlook: "The stock can recover fast, but the model needs a healthier scoring run before turning constructive.",
    },
  },
  {
    id: "paul-george",
    externalId: "202331",
    name: "Paul George",
    team: "Philadelphia 76ers",
    teamAbbreviation: "PHI",
    position: "F",
    imageUrl: "https://cdn.nba.com/headshots/nba/latest/1040x760/202331.png",
    views: 21380,
    seasonStats: { ppg: 20.5, rpg: 5.8, apg: 3.8, tsPct: 0.578 },
    last10Stats: { ppg: 16.8, rpg: 5.1, apg: 3.1, tsPct: 0.531 },
    teamLast10WinPct: 0.4,
    report: {
      summary: "George is trending down as his recent offensive output has not matched the season baseline.",
      movement: "Lower scoring, lower true shooting, and a weaker team record all pull the score into negative territory.",
      strengths: ["Smooth spot-up shooting", "Wing defense remains useful", "Can stabilize second-side actions"],
      concerns: ["Creation burst has been inconsistent", "Efficiency drop reduces margin for error"],
      outlook: "The stock needs either a shooting correction or stronger team context to reverse.",
    },
  },
  {
    id: "bradley-beal",
    externalId: "203078",
    name: "Bradley Beal",
    team: "Phoenix Suns",
    teamAbbreviation: "PHX",
    position: "G",
    imageUrl: "https://cdn.nba.com/headshots/nba/latest/1040x760/203078.png",
    views: 20540,
    seasonStats: { ppg: 18.2, rpg: 4.1, apg: 5.0, tsPct: 0.602 },
    last10Stats: { ppg: 14.6, rpg: 3.7, apg: 4.0, tsPct: 0.538 },
    teamLast10WinPct: 0.4,
    report: {
      summary: "Beal's stock is sliding as role compression and efficiency decline are showing up together.",
      movement: "The last-10 scoring, playmaking, and true-shooting inputs are all below his season averages.",
      strengths: ["Secondary ball handling", "Midrange touch", "Experience attacking closeouts"],
      concerns: ["Usage can disappear next to other stars", "Durability perception affects market confidence"],
      outlook: "The model will stay cautious until his touches and efficiency recover simultaneously.",
    },
  },
  {
    id: "klay-thompson",
    externalId: "202691",
    name: "Klay Thompson",
    team: "Dallas Mavericks",
    teamAbbreviation: "DAL",
    position: "G",
    imageUrl: "https://cdn.nba.com/headshots/nba/latest/1040x760/202691.png",
    views: 25180,
    seasonStats: { ppg: 17.9, rpg: 3.3, apg: 2.3, tsPct: 0.574 },
    last10Stats: { ppg: 13.8, rpg: 2.9, apg: 1.7, tsPct: 0.511 },
    teamLast10WinPct: 0.5,
    report: {
      summary: "Thompson's recent market action is bearish because the shotmaking premium has faded.",
      movement: "Scoring and efficiency are both well under season pace, and playmaking does not offset the decline.",
      strengths: ["Movement shooting reputation still bends defenses", "Low-maintenance role", "Playoff experience"],
      concerns: ["Cold stretches have larger impact in a specialized role", "Limited rim pressure caps recovery paths"],
      outlook: "A shooting heater could flip the chart, but current indicators remain negative.",
    },
  },
  {
    id: "zion-williamson",
    externalId: "1629627",
    name: "Zion Williamson",
    team: "New Orleans Pelicans",
    teamAbbreviation: "NOP",
    position: "F",
    imageUrl: "https://cdn.nba.com/headshots/nba/latest/1040x760/1629627.png",
    views: 29510,
    seasonStats: { ppg: 22.9, rpg: 5.8, apg: 5.0, tsPct: 0.61 },
    last10Stats: { ppg: 18.7, rpg: 5.0, apg: 4.1, tsPct: 0.555 },
    teamLast10WinPct: 0.4,
    report: {
      summary: "Williamson is down on the board as his recent finishing efficiency has fallen below expectations.",
      movement: "The model sees negative gaps in scoring, true shooting, playmaking, and team success.",
      strengths: ["Elite paint pressure when engaged", "Playmaking from drives", "Mismatch creation"],
      concerns: ["Spacing and availability questions compress confidence", "Defensive consistency remains uneven"],
      outlook: "The stock is volatile. A healthy two-week burst could repair it quickly, but the current read is bearish.",
    },
  },
  {
    id: "julius-randle",
    externalId: "203944",
    name: "Julius Randle",
    team: "Minnesota Timberwolves",
    teamAbbreviation: "MIN",
    position: "F",
    imageUrl: "https://cdn.nba.com/headshots/nba/latest/1040x760/203944.png",
    views: 18840,
    seasonStats: { ppg: 20.0, rpg: 8.3, apg: 4.4, tsPct: 0.568 },
    last10Stats: { ppg: 16.9, rpg: 7.6, apg: 3.5, tsPct: 0.522 },
    teamLast10WinPct: 0.5,
    report: {
      summary: "Randle is drifting lower as efficiency and creation have cooled in the last 10 games.",
      movement: "The negative scoring and playmaking trends are only partially cushioned by a neutral team-success input.",
      strengths: ["Physical mismatch scoring", "Defensive rebounding", "Can initiate offense for bench units"],
      concerns: ["Decision speed can stall possessions", "Jump-shot variance weighs heavily on efficiency"],
      outlook: "The chart needs cleaner shot selection and stronger assist production before improving.",
    },
  },
  {
    id: "trae-young",
    externalId: "1629027",
    name: "Trae Young",
    team: "Atlanta Hawks",
    teamAbbreviation: "ATL",
    position: "G",
    imageUrl: "https://cdn.nba.com/headshots/nba/latest/1040x760/1629027.png",
    views: 33740,
    seasonStats: { ppg: 25.7, rpg: 2.8, apg: 10.8, tsPct: 0.585 },
    last10Stats: { ppg: 22.4, rpg: 2.6, apg: 9.5, tsPct: 0.537 },
    teamLast10WinPct: 0.3,
    report: {
      summary: "Young is selling off as Atlanta's results and his efficiency have moved in the wrong direction together.",
      movement: "The score is hit by weaker scoring, lower true shooting, fewer assists, and poor team success.",
      strengths: ["Elite pick-and-roll passing", "Deep range creates spacing", "High free throw rate"],
      concerns: ["Defensive targeting affects team context", "Shot selection has been costly during the slump"],
      outlook: "The market needs both team wins and a shooting correction before momentum turns.",
    },
  },
  {
    id: "jimmy-butler",
    externalId: "202710",
    name: "Jimmy Butler",
    team: "Miami Heat",
    teamAbbreviation: "MIA",
    position: "F",
    imageUrl: "https://cdn.nba.com/headshots/nba/latest/1040x760/202710.png",
    views: 22120,
    seasonStats: { ppg: 20.8, rpg: 5.3, apg: 5.0, tsPct: 0.596 },
    last10Stats: { ppg: 17.2, rpg: 4.8, apg: 4.1, tsPct: 0.544 },
    teamLast10WinPct: 0.4,
    report: {
      summary: "Butler's stock is down as the regular-season production line has softened across categories.",
      movement: "The last-10 scoring, efficiency, and playmaking marks are all below his season profile.",
      strengths: ["Free throw generation", "Defensive anticipation", "Late-game poise"],
      concerns: ["Low three-point volume limits easy reversals", "Regular-season aggression can fluctuate"],
      outlook: "The model is bearish now, while acknowledging his playoff premium is not fully captured here.",
    },
  },
  {
    id: "jamal-murray",
    externalId: "1627750",
    name: "Jamal Murray",
    team: "Denver Nuggets",
    teamAbbreviation: "DEN",
    position: "G",
    imageUrl: "https://cdn.nba.com/headshots/nba/latest/1040x760/1627750.png",
    views: 23110,
    seasonStats: { ppg: 21.2, rpg: 4.1, apg: 6.4, tsPct: 0.584 },
    last10Stats: { ppg: 18.3, rpg: 3.8, apg: 5.2, tsPct: 0.539 },
    teamLast10WinPct: 0.5,
    report: {
      summary: "Murray is trending lower as his recent shotmaking has lagged behind Denver's usual offensive standard.",
      movement: "Scoring, true shooting, and assists are all below baseline, creating a negative stock read.",
      strengths: ["Two-man chemistry with Jokic", "Difficult shotmaking history", "Strong playoff track record"],
      concerns: ["Rhythm scoring can dip after minor knocks", "Assist decline reduces offsetting value"],
      outlook: "The bearish move is reversible, but the model needs a cleaner shooting sample.",
    },
  },
  {
    id: "zach-lavine",
    externalId: "203897",
    name: "Zach LaVine",
    team: "Chicago Bulls",
    teamAbbreviation: "CHI",
    position: "G",
    imageUrl: "https://cdn.nba.com/headshots/nba/latest/1040x760/203897.png",
    views: 17680,
    seasonStats: { ppg: 19.5, rpg: 4.0, apg: 3.9, tsPct: 0.578 },
    last10Stats: { ppg: 15.7, rpg: 3.4, apg: 3.0, tsPct: 0.519 },
    teamLast10WinPct: 0.3,
    report: {
      summary: "LaVine is one of the weaker market names as scoring efficiency and team success are both flashing red.",
      movement: "The negative score reflects drops in every formula category, with team record adding extra drag.",
      strengths: ["Explosive straight-line scoring", "Catch-and-shoot value", "Transition finishing"],
      concerns: ["On-ball creation has been inefficient", "Team context is not helping the score"],
      outlook: "The stock needs a sustained efficiency correction before it can leave the faller list.",
    },
  },
];

function toIsoDate(daysAgo: number) {
  const date = new Date(Date.UTC(2026, 5, 4 - daysAgo));
  return date.toISOString().slice(0, 10);
}

function buildGameLogs(player: PlayerSeed, seedIndex: number): GameLog[] {
  return pointPattern.map((pointDelta, index) => ({
    gameDate: toIsoDate(index + 1),
    opponent: opponents[(index + seedIndex) % opponents.length],
    won: index < Math.round(player.teamLast10WinPct * 10),
    points: Math.max(2, Math.round(player.last10Stats.ppg + pointDelta)),
    rebounds: Math.max(0, Math.round(player.last10Stats.rpg + reboundPattern[(index + seedIndex) % reboundPattern.length])),
    assists: Math.max(0, Math.round(player.last10Stats.apg + assistPattern[(index + seedIndex) % assistPattern.length])),
    tsPct: Math.max(
      0.35,
      Math.min(0.82, Number((player.last10Stats.tsPct + (pointDelta / 1000)).toFixed(3))),
    ),
  }));
}

function buildStockHistory(score: number, seedIndex: number): StockHistoryPoint[] {
  const direction = score >= 0 ? 1 : -1;
  const range = 18 + Math.abs(score) * 0.35;

  return Array.from({ length: 91 }, (_, index) => {
    const daysFromStart = 90 - index;
    const age = daysFromStart / 90;
    const wave = Math.sin(index * 0.45 + seedIndex) * 3.4;
    const historicalScore = score - direction * age * range + wave;

    return {
      date: toIsoDate(daysFromStart),
      score: Math.round(Math.max(-100, Math.min(100, historicalScore)) * 10) / 10,
    };
  });
}

export const players: PlayerMarket[] = playerSeeds.map((player, index) => {
  const stock = calculateStockScore({
    last10: player.last10Stats,
    season: player.seasonStats,
    teamLast10WinPct: player.teamLast10WinPct,
  });

  return {
    ...player,
    stock,
    stockHistory: buildStockHistory(stock.score, index),
    last10Games: buildGameLogs(player, index),
  };
});

export const topRisers = [...players]
  .sort((a, b) => b.stock.score - a.stock.score)
  .slice(0, 10);

export const topFallers = [...players]
  .sort((a, b) => a.stock.score - b.stock.score)
  .slice(0, 10);

export const trendingPlayers = [...players]
  .sort((a, b) => b.views - a.views)
  .slice(0, 6);

export const marketSummary = {
  playerCount: players.length,
  averageScore:
    Math.round((players.reduce((sum, player) => sum + player.stock.score, 0) / players.length) * 10) /
    10,
  strongestRiser: topRisers[0],
  steepestFaller: topFallers[0],
};

export function getPlayerById(playerId: string) {
  return players.find((player) => player.id === playerId);
}
