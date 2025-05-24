
export interface LogEntry {
    type: string,
    timestamp: string,
    message: string
}


export interface GameDataTTPG {
    players: PlayerTTPG[];

    activeSystem?: ActiveSystemTTPG;
    config?: ConfigTTPG;
    hexSummary?: string;
    laws?: string[]; // card names
    mapString?: string;
    objectives: ObjectiveTypesTTPG;
    platform?: string;
    round?: number;
    scoreboard?: number; // game to 10/14 points
    setupTimestamp?: number; // epoch time (seconds)
    speaker?: string; // player color
    timer?: TimerTTPG;
    timestamp?: number; // epoch time (seconds)
    turn?: string; // player color
}

export interface PlayerTTPG {
    active: boolean;
    color: string;
    commandTokens: PlayerCommandTokensTTPG;
    custodiansPoints: number;
    factionFull: string; // "The Federation of Sol"
    factionShort: string; // "Sol"
    handSummary: PlayerHandSummaryTTPG;
    laws: string[]; // card names
    leaders: PlayerLeadersTTPG;
    objectives: string[]; // card names
    planetTotals: PlayerPlanetTotalsTTPG;
    score: number;
    steamName: string;
    strategyCards: string[]; // strategy card names
    strategyCardsFaceDown: string[]; // strategy card names
    technologies: string[]; // abbr names
    turnOrder: number; // index in turn order array

    commodities: number;
    tradeGoods: number;
    maxCommodities: number;
}


export interface ObjectiveTypesTTPG {
    "Public Objectives I": string[],
    "Public Objectives II": string[],
    "Secret Objectives": string[]
}


export interface ActiveSystemTTPG {
    tile: number;
    planets: string[];
};

export interface ConfigTTPG {
    pok ?: boolean;
    codex1 ?: boolean;
    codex2 ?: boolean;
    codex3 ?: boolean;
    codex4 ?: boolean;
};

export interface ObjectivesTTPG {
    PublicObjectivesI ?: string[];
    PublicObjectivesII ?: string[];
    SecretObjectives ?: string[];
    Agenda ?: string[];
    Relics ?: string[];
    Other ?: string[];
};

export interface PlayerCommandTokensTTPG {
    tactics: number;
    fleet: number;
    strategy: number;
};

export interface PlayerLeadersTTPG {
    agent?: "locked" | "unlocked";
    commander?: "locked" | "unlocked";
    hero?: "locked" | "unlocked";
};

export interface PlayerHandSummaryTTPG {
    "Secret Objectives"?: number;
    Actions?: number;
    Promissory?: number;
};

export interface PlayerPlanetTotalsTTPG {
    influence: { avail: number; total: number };
    resources: { avail: number; total: number };
    techs: { blue: number; red: number; green: number; yellow: number };
    traits: { cultural: number; hazardous: number; industrial: number };
    legendary: number;
};

export interface TimerTTPG {
    seconds: number;
    anchorTimestamp: number;
    anchorSeconds: number;
    direction: -1 | 0 | 1;
    countDown: number;
}