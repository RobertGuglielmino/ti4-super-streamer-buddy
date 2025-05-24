// https://github.com/darrellanderson/TI4-TTPG-TS/blob/main/src/lib/game-data-lib/game-data/game-data.ts
// pulled from https://github.com/TI4-Online/TI4-Online.github.io/blob/main/overlay/scripts/game-data-util.js

import {
  LAW_ABBREVIATIONS,
  OBJECTIVE_NAME_ABBREVIATIONS,
  SECRET_OBJECTIVES,
  TECH_TREE,
} from "./dictionaries.ts";
import {
  GameDataTTPG,
  GameDataV2,
  General,
  Law,
  Objective,
  PlayerArrayV2,
  PlayerTTPG,
  ProgressObjective,
} from "./interfaces.ts";

export function transformTTPGtoAppV2(data: GameDataTTPG): GameDataV2 {
  return {
    playerData: getPlayersV2(data),
    objectives: getObjectives(data),
    laws: getLaws(data),
    general: getGeneral(data),
  };
}

function getPlayersV2(data: GameDataTTPG): PlayerArrayV2 {
  let playerArray: PlayerArrayV2 = {
    name: [],
    faction: [],
    color: [],
    victoryPoints: [],
    strategyCard: [],
    strategyCardsFaceDown: [],
    technologies: {
      blue: [[], [], [], [], [], []],
      red: [[], [], [], [], [], []],
      yellow: [[], [], [], [], [], []],
      green: [[], [], [], [], [], []],
      unit: [[], [], [], [], [], []],
      faction: [[], [], [], [], [], []],
    },
    secretObjectives: [],
    commandCounters: {
      tactics: [],
      fleet: [],
      strategy: [],
    },
    commodities: [],
    tradeGoods: [],
    maxCommodities: [],
    actionCards: [],
    promissoryNotes: [],
    leaders: {
      agent: [],
      commander: [],
      hero: [],
    },
    active: 0,
    speaker: 0,
  };

  data.players.forEach((player: PlayerTTPG, index: number) => {
    playerArray.name[index] = player.steamName;
    playerArray.faction[index] = player.factionShort;
    playerArray.color[index] = player.color;
    playerArray.victoryPoints[index] = player.score;
    playerArray.strategyCard[index] = player.strategyCards[0];
    playerArray.strategyCardsFaceDown[index] = player.strategyCardsFaceDown[0] || "";
    playerArray.technologies.blue[index] = TECH_TREE.blue.map((tech) =>
      (player.technologies.includes(tech))
    );
    playerArray.technologies.red[index] = TECH_TREE.red.map((tech) =>
      (player.technologies.includes(tech))
    );
    playerArray.technologies.yellow[index] = TECH_TREE.yellow.map((tech) =>
      (player.technologies.includes(tech))
    );
    playerArray.technologies.green[index] = TECH_TREE.green.map((tech) =>
      (player.technologies.includes(tech))
    );
    playerArray.technologies.unit[index] = TECH_TREE.unit.map((tech) =>
      (player.technologies.includes(tech))
    );
    playerArray.technologies.faction[index] = TECH_TREE.faction.map((tech) =>
      (player.technologies.includes(tech))
    );
    playerArray.commandCounters.tactics[index] = player.commandTokens.tactics;
    playerArray.commandCounters.fleet[index] = player.commandTokens.fleet;
    playerArray.commandCounters.strategy[index] = player.commandTokens.strategy;
    playerArray.commodities[index] = player.commodities;
    playerArray.tradeGoods[index] = player.tradeGoods;
    playerArray.maxCommodities[index] = player.maxCommodities;
    playerArray.actionCards[index] = player.handSummary!.hasOwnProperty(
      "Action"
    )
      ? player.handSummary!.Actions!
      : 0;
    playerArray.promissoryNotes[index] = player.handSummary!.hasOwnProperty(
      "Promissory"
    )
      ? player.handSummary!.Promissory!
      : 0;
    playerArray.leaders.agent[index] = player.leaders.agent === "unlocked";
    playerArray.leaders.commander[index] = player.leaders.commander === "unlocked";
    playerArray.leaders.hero[index] = player.leaders.hero === "unlocked";

    if (player.active) {
      playerArray.active = index;
    }

    if (data.speaker === player.color) {
      playerArray.speaker = index;
    }
  });

  return playerArray;
}

function getObjectives(data: GameDataTTPG): any {
  // TODO player id, secret parse, speakre parse from color

  function formatPublicIObjectives() {

    if (data.objectives["Public Objectives I"].length === 0) {
      return [];
    }

    return data.objectives["Public Objectives I"].map((objective: string) => {
      let newObjective: ProgressObjective = {
        id: 0,
        name: objective,
        description:
          OBJECTIVE_NAME_ABBREVIATIONS[objective] || "Unknown Objective",
        points: 1,
        scored: [],
        progress: [],
      };

      data.players.forEach((player: PlayerTTPG, index: number) => {
        const playerObjectives = player?.objectives || [];
        if (playerObjectives.includes(objective)) {
          newObjective.scored[index] = index;
        }
      });

      data.objectivesProgress.forEach((objectiveProgress: any) => {
        if (
          objectiveProgress.name === objective &&
          objectiveProgress.stage === 1
        ) {
          newObjective.progress = objectiveProgress.progress.values.map((o: any) =>
            o.value.toString()
          );
        }
      });
    });
  }

  function formatPublicIIObjectives() {
    
    if (data.objectives["Public Objectives II"].length === 0) {
      return [];
    }

    return data.objectives["Public Objectives II"].map((objective: string) => {
      let newObjective: ProgressObjective = {
        id: 0,
        name: objective,
        description:
          OBJECTIVE_NAME_ABBREVIATIONS[objective] || "Unknown Objective",
        points: 2,
        scored: [],
        progress: [],
      };

      data.players.forEach((player: PlayerTTPG, index: number) => {
        const playerObjectives = player?.objectives || [];
        if (playerObjectives.includes(objective)) {
          newObjective.scored[index] = index;
        }
      });

      // TODO uncomment when TTPG has progress data
      data.objectivesProgress.forEach((objectiveProgress: any) => {
        if (
          objectiveProgress.name === objective &&
          objectiveProgress.stage === 2
        ) {
          newObjective.progress = objectiveProgress.progress.values.map((o: any) =>
            o.value.toString()
          );
        }
      });
    });
  }

  function formatSecretObjectives() {
    let newObjective: Objective = {
      name: "Secret Objectives",
      description: "",
      points: 1,
      scored: [],
    };

    data.players.forEach((player: PlayerTTPG, index: number) => {
      let score = 0;

      player.objectives.forEach((objective: string) => {
        if (SECRET_OBJECTIVES.includes(objective)) {
          score += 1;
        }
      });

      newObjective.scored[index] = score;
    });

    return newObjective;
  }

  function formatAgendaObjectives() {
    let newObjective: Objective = {
      name: "Agenda",
      description: "",
      points: 1,
      scored: [],
    };

    data.players.forEach((player: PlayerTTPG, index: number) => {
      let score = 0;
      if (player.laws.includes("Mutiny")) {
        score += 1;
      }
      if (player.laws.includes("Seed of an Empire")) {
        score += 1;
      }
      newObjective.scored[index] = index;
    });

    return newObjective;
  }

  function formatRelicObjectives() {
    let newObjective: Objective = {
      name: "Relics",
      description: "",
      points: 1,
      scored: [],
    };

    data.players.forEach((player: PlayerTTPG, index: number) => {
      let score = 0;
      if (player.objectives.includes("The Crown of Emphidia")) {
        score += 1;
      }
      if (player.relicCards.includes("Shard of the Throne (PoK)")) {
        score += 1;
      }
      newObjective.scored[index] = index;
    });

    return newObjective;
  }

  function formatCustodiansPoints() {
    return {
      name: "Custodians Points",
      description: "",
      points: 1,
      scored: data.players.map((player: any) => {
        return player.custodiansPoints;
      }),
    };
  }

  return {
    public1: formatPublicIObjectives(),
    public2: formatPublicIIObjectives(),
    secret: formatSecretObjectives(),
    mecatol: formatCustodiansPoints(),
    agenda: formatAgendaObjectives(),
    relics: formatRelicObjectives(),
  };
}

function getGeneral(data: GameDataTTPG): General {
  return {
    round: data.round!,
    speaker: data.speaker!,
    activePlayer: data.turn!,
    time: data.timer!.seconds.toString(),
  };
}

function getLaws(gameData: GameDataTTPG): Law[] {
  const laws = gameData?.laws || [];

  return laws.map((law: any) => {
    let tempLaw = {
      name: law,
      description: LAW_ABBREVIATIONS[law] || law,
    };

    for (const player of gameData.players) {
      if (player.laws!.includes(law.name)) {
        return {
          ...tempLaw,
          electedPlayer: player.steamName,
        };
      }
    }

    return tempLaw;
  });
}
