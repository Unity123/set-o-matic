import {Smogon} from "https://unpkg.com/@pkmn/smogon/build/index.mjs";
// import {Moves} from "https://unpkg.com/@pkmn/sim/build/esm/data/index.mjs";

$.uniqArray = function(a) {
    return $.grep(a, function(item, pos) {
        return $.inArray(item, a) === pos;
    });
};

function shallowEqual(object1, object2) {
  const keys1 = Object.keys(object1);
  const keys2 = Object.keys(object2);
  console.log(keys1);
  console.log(keys2);
  var length = Math.min(keys1.length, keys2.length);

  for (let key = 0; key < length; key++) {
    if (
        typeof object1[key] === 'object' &&
        object1[key] !== null && object2[key]
    ) {
        console.log("Found objects:");
        console.log(object1[key]);
        console.log(object2[key]);
        if (!shallowEqual(object1[key], object2[key])) {
            return false;
        }
        continue;
    }
    console.log("Comparing:");
    console.log(object1[key]);
    console.log(object2[key]);
    if (object1[key] !== object2[key]) {
      return false;
    }
  }

  return true;
}

var gens = undefined;
const smogon = new Smogon(fetch.bind(window));

const combos = [
    ["Iron Defense", "Body Press"],
    ["Acid Armor", "Body Press"],
    ["Toxic", "Protect"],
    ["Toxic", "Detect"],
    ["Toxic", "Substitute"],
    ["Poison Powder", "Protect"],
    ["Poison Powder", "Detect"],
    ["Poison Powder", "Substitute"]
];

const goodOffensiveAbilities = [
    "Adaptability",
    "Aerilate",
    "Huge Power",
    "Pure Power",
    "Reckless",
    "Sheer Force",
    "Tough Claws",
    "Gorilla Tactics",
    "Libero",
    "Moxie",
    "Protean",
    "Technician",
    "Tinted Lens",
    "Unburden",
    "Water Bubble",
    "Iron Fist",
    "Mold Breaker",
    "Scrappy",
    "Skill Link",
    "Stakeout",
    "Strong Jaw",
    "Triage",
    "Wonder Skin",
    "Flash Fire",
    "Guts",
    "Quick Feet",
    "Speed Boost",
    "Swift Swim",
    "Chlorophyll",
    "Toxic Boost",
    "Flare Boost",
    "Drought",
    "Drizzle",
    "Sand Stream",
    "Snow Warning",
    "Supreme Overlord",
    "Misty Surge",
    "Grassy Surge",
    "Electric Surge",
    "Psychic Surge",
    "Sheer Force"
]

const goodDefensiveAbilities = [
    "Intimidate",
    "Regenerator",
    "Unaware",
    "Magic Guard",
    "Multiscale",
    "Thick Fat",
    "Fluffy",
    "Fur Coat",
    "Water Absorb",
    "Volt Absorb",
    "Flash Fire",
    "Drought",
    "Drizzle",
    "Sand Stream",
    "Snow Warning",
    "Wonder Skin",
    "Natural Cure",
    "Ice Scales",
    "Filter",
    "Solid Rock",
    "Prankster",
    "Magic Bounce",
    "Misty Surge",
    "Grassy Surge",
    "Electric Surge",
    "Psychic Surge"
]

const riskyMoves = {
    flags: {
        charge: 1,
        recharge: 1
    },
    mindBlownRecoil: 1,
    self: {
        boosts: {
            atk: -2,
            spa: -2
        }
    }
};

function isRisky(move) {
    if (move.flags.charge || (move.flags.recharge && genNumber > 1)) { // gen 1 recharge moves are not risky because you don't recharge after a ko
        return true;
    }
    if (move.mindBlownRecoil) {
        return true;
    }
    if (move.self && move.self.boosts) {
        if (move.self.boosts.atk && move.self.boosts.atk <= -2) {
            return true;
        }
        if (move.self.boosts.spa && move.self.boosts.spa <= -2) {
            return true;
        }
    }
    if (move.selfdestruct) {
        return true;
    }
    if (move.name === "Last Resort" || move.name === "Synchronoise" || move.name === "Dream Eater") { // silly weird exceptions
        return true;
    }
    if (move.accuracy < 80 && move.accuracy !== true) {
        return true;
    }
    return false;
}

function hasHiddenPower(moves) {
    for (var i = 0; i < moves.length; i++) {
        if (moves[i].includes("Hidden Power")) {
            return true;
        }
    }
    return false;
}

var genData = undefined;
var genNumber = 1;

function populateSelects(gen) {
    // populate pokemon selector with generation data
    genData = gens.get(gen);
    genNumber = gen;
    $("#pokemon").empty();
    $.each(Array.from(genData.species), function (_index, value) {
        $("#pokemon").append("<option value='" + value.name + "'>" + value.name + "</option>");
    });
}

async function getMetagameData(metagame) {
    var data = undefined;
    data = await fetch("https://data.pkmn.cc/stats/" + metagame + ".json");
    var json = await data.json();
    console.log(json);
    return json;
}

function getTopThreats(data, number) {
    var threats = [];
    for (var i = 0; i < number; i++) {
        threats.push(Object.entries(data.pokemon)[i]);
    }
    return threats;
}

/*function getBoostingMoves() {
    /* this function gets good boosting moves
    I have decided that good boosting moves either boost at least two stats by at least one stage, boost one stat by at least two stages, 
    or are attacks with at least a 50% chance to boost at least one of the user's stats by at least one stage *
    var boostingMoves = [];
    var moves = Object.values(Moves);
    for (var i = 0; i < moves.length; i++) {
        if (moves[i].boosts) {
            if ((Object.values(moves[i].boosts).length > 1 || Object.values(moves[i].boosts)[0] >= 2) && moves[i].target === "self") {
                boostingMoves.push(moves[i].name);
            }
        }
        if (moves[i].secondary && moves[i].secondary.chance >= 50 && moves[i].secondary.self && moves[i].secondary.self.boosts) {
            for (var j = 0; j < Object.values(moves[i].secondary.self.boosts).length; j++) {
                if (Object.values(moves[i].secondary.self.boosts)[j] >= 1) {
                    boostingMoves.push(moves[i].name);
                    break;
                }
            }
        }
    }
    return boostingMoves;
}

function getRecoveryMoves() {
    // all moves tagged as healing except the ones that don't actually heal you and rest and swallow (inconsistent)
    var recoveryMoves = [];
    var moves = Object.values(Moves);
    for (var i = 0; i < moves.length; i++) {
        if (moves[i].flags.heal && moves[i].target === "self") {
            if (moves[i].name !== "Healing Wish" && moves[i].name !== "Revival Blessing" && moves[i].name !== "Rest" && moves[i].name !== "Swallow") {
                recoveryMoves.push(moves[i].name);
            }
        }
    }
    return recoveryMoves;
}

function getStrongAttacks() {
    // all moves with at least 75 BP
    var strongMoves = [];
    var moves = Object.values(Moves);
    for (var i = 0; i < moves.length; i++) {
        if (moves[i].basePower >= 75) {
            strongMoves.push(moves[i].name);
        }
    }
    return strongMoves;
}

function getPriority() {
    // all moves with priority
    var priorityMoves = [];
    var moves = Object.values(Moves);
    for (var i = 0; i < moves.length; i++) {
        if (moves[i].priority > 0 && moves[i].basePower > 0) {
            priorityMoves.push(moves[i].name);
        }
    }
    return priorityMoves;
}

function getStatusMoves() {
    // all moves that can cause status
    var statusMoves = [];
    var moves = Object.values(Moves);
    for (var i = 0; i < moves.length; i++) {
        if (moves[i].status) {
            statusMoves.push(moves[i].name);
        }
    }
    return statusMoves;
}*/

async function getBoostingMoves(pokemon) {
    /* this function gets good boosting moves
    I have decided that good boosting moves either boost at least two stats by at least one stage, boost one stat by at least two stages, 
    or are attacks with at least a 50% chance to boost at least one of the user's stats by at least one stage */
    var boostingMoves = [];
    var moves = Array.from(genData.moves);
    for (var i = 0; i < moves.length; i++) {
        if (moves[i].boosts) {
            if ((Object.values(moves[i].boosts).length > 1 || Object.values(moves[i].boosts)[0] >= 2) && moves[i].target === "self" && (moves[i].boosts.atk || (moves[i].boosts.def && await genData.learnsets.canLearn(pokemon, "Body Press")) || moves[i].boosts.spa || moves[i].boosts.spc) && await genData.learnsets.canLearn(pokemon, moves[i].name)) {
                boostingMoves.push(moves[i].name);
            }
        }
        if (moves[i].secondary && moves[i].secondary.chance >= 50 && moves[i].secondary.self && moves[i].secondary.self.boosts && (moves[i].secondary.self.boosts.atk || (moves[i].secondary.self.boosts.def && await genData.learnsets.canLearn(pokemon, "Body Press")) || moves[i].secondary.self.boosts.spa || moves[i].secondary.self.boosts.spc) && await genData.learnsets.canLearn(pokemon, moves[i].name)) {
            for (var j = 0; j < Object.values(moves[i].secondary.self.boosts).length; j++) {
                if (Object.values(moves[i].secondary.self.boosts)[j] >= 1) {
                    boostingMoves.push(moves[i].name);
                    break;
                }
            }
        }
    }
    return boostingMoves;
}

async function getPhysicalBoostingMoves(pokemon) {
    var boostingMoves = [];
    var moves = Array.from(genData.moves);
    for (var i = 0; i < moves.length; i++) {
        if (moves[i].boosts) {
            if ((Object.values(moves[i].boosts).length > 1 || Object.values(moves[i].boosts)[0] >= 2) && moves[i].target === "self" && (moves[i].boosts.atk || (moves[i].boosts.def && await genData.learnsets.canLearn(pokemon, "Body Press"))) && await genData.learnsets.canLearn(pokemon, moves[i].name)) {
                boostingMoves.push(moves[i].name);
            }
        }
        if (moves[i].secondary && moves[i].secondary.chance >= 50 && moves[i].secondary.self && moves[i].secondary.self.boosts && (moves[i].secondary.self.boosts.atk || (moves[i].secondary.self.boosts.def && await genData.learnsets.canLearn(pokemon, "Body Press"))) && await genData.learnsets.canLearn(pokemon, moves[i].name)) {
            for (var j = 0; j < Object.values(moves[i].secondary.self.boosts).length; j++) {
                if (Object.values(moves[i].secondary.self.boosts)[j] >= 1) {
                    boostingMoves.push(moves[i].name);
                    break;
                }
            }
        }
    }
    return boostingMoves;
}

async function getSpecialBoostingMoves(pokemon) {
    var boostingMoves = [];
    var moves = Array.from(genData.moves);
    for (var i = 0; i < moves.length; i++) {
        if (moves[i].boosts) {
            if ((Object.values(moves[i].boosts).length > 1 || Object.values(moves[i].boosts)[0] >= 2) && moves[i].target === "self" && (moves[i].boosts.spa || moves[i].boosts.spc) && await genData.learnsets.canLearn(pokemon, moves[i].name)) {
                boostingMoves.push(moves[i].name);
            }
        }
        if (moves[i].secondary && moves[i].secondary.chance >= 50 && moves[i].secondary.self && moves[i].secondary.self.boosts && (moves[i].secondary.self.boosts.spa || moves[i].secondary.self.boosts.spc) && await genData.learnsets.canLearn(pokemon, moves[i].name)) {
            for (var j = 0; j < Object.values(moves[i].secondary.self.boosts).length; j++) {
                if (Object.values(moves[i].secondary.self.boosts)[j] >= 1) {
                    boostingMoves.push(moves[i].name);
                    break;
                }
            }
        }
    }
    return boostingMoves;
}

async function getPhysicalMoves(pokemon, allowRisky=false) {
    var physicalMoves = [];
    var moves = Array.from(genData.moves);
    for (var i = 0; i < moves.length; i++) {
        if (moves[i].category === "Physical" && await genData.learnsets.canLearn(pokemon, moves[i].name)) {
            if (!allowRisky && isRisky(moves[i])) {
                continue;
            }
            physicalMoves.push(moves[i].name);
        }
    }
    return physicalMoves;
}

async function getPhysicalSTABMoves(pokemon, allowRisky=false) {
    var physicalSTABMoves = [];
    var physicalMoves = await getPhysicalMoves(pokemon, allowRisky);
    var data = genData.species.get(pokemon);
    var types = data.types;
    for (var i = 0; i < physicalMoves.length; i++) {
        var move = genData.moves.get(physicalMoves[i]);
        if (move.type === types[0] || move.type === types[1]) {
            physicalSTABMoves.push(physicalMoves[i]);
        }
    }
    return physicalSTABMoves;
}

async function getBestPhysicalSTABMove(pokemon, allowRisky=false) {
    var physicalSTABMoves = await getPhysicalSTABMoves(pokemon, allowRisky);
    var oldBest = physicalSTABMoves[0];
    for (var i = 0; i < physicalSTABMoves.length; i++) {
        var move = genData.moves.get(physicalSTABMoves[i]);
        if ((move.basePower > genData.moves.get(oldBest).basePower && !(genNumber == 1 && move.critRatio < genData.moves.get(oldBest).critRatio)) || (genNumber == 1 && move.critRatio > genData.moves.get(oldBest).critRatio)) { // hardcoding for gen 1 crits
            if (move.name === "Foul Play" || move.name === "Focus Punch") { // specifically foul play is a move I don't want as a best stab move because it's not good on attackers, focus punch is bad as a primary stab move
                continue;
            }
            oldBest = physicalSTABMoves[i];
        }
    }
    return oldBest;
}

async function getBestPhysicalMove(pokemon, type, allowRisky=false) {
    var physicalMoves = await getPhysicalMoves(pokemon, allowRisky);
    var oldBest = physicalMoves[0];
    for (var i = 0; i < physicalMoves.length; i++) {
        var move = genData.moves.get(physicalMoves[i]);
        if (move.type === type && move.basePower > genData.moves.get(oldBest).basePower) {
            oldBest = physicalMoves[i];
        }
    }
    if (oldBest === undefined || genData.moves.get(oldBest).type !== type) {
        return undefined;
    }
    return oldBest;
}

async function getBestUniquePhysicalMove(pokemon, type, moves, allowRisky=false) {
    var physicalMoves = await getPhysicalMoves(pokemon, allowRisky);
    var oldBest = physicalMoves[0];
    for (var i = 0; i < physicalMoves.length; i++) {
        var move = genData.moves.get(physicalMoves[i]);
        if (move.type === type && move.basePower > genData.moves.get(oldBest).basePower && !moves.includes(physicalMoves[i])) {
            console.log(physicalMoves[i]);
            console.log(hasHiddenPower(moves));
            if (physicalMoves[i].includes("Hidden Power") && hasHiddenPower(moves)) {
                continue;
            }
            oldBest = physicalMoves[i];
        }
    }
    if (oldBest === undefined || genData.moves.get(oldBest).type !== type) {
        return undefined;
    }
    return oldBest;
}

async function getSpecialMoves(pokemon, allowRisky=false) {
    var specialMoves = [];
    var moves = Array.from(genData.moves);
    for (var i = 0; i < moves.length; i++) {
        if (moves[i].category === "Special" && await genData.learnsets.canLearn(pokemon, moves[i].name)) {
            if (!allowRisky && isRisky(moves[i])) {
                continue;
            }
            specialMoves.push(moves[i].name);
        }
    }
    return specialMoves;
}

async function getSpecialSTABMoves(pokemon, allowRisky=false) {
    var specialSTABMoves = [];
    var specialMoves = await getSpecialMoves(pokemon, allowRisky);
    var data = genData.species.get(pokemon);
    var types = data.types;
    for (var i = 0; i < specialMoves.length; i++) {
        var move = genData.moves.get(specialMoves[i]);
        if (move.type === types[0] || move.type === types[1]) {
            specialSTABMoves.push(specialMoves[i]);
        }
    }
    return specialSTABMoves;
}

async function getBestSpecialSTABMove(pokemon, allowRisky=false) {
    var specialSTABMoves = await getSpecialSTABMoves(pokemon, allowRisky);
    var oldBest = specialSTABMoves[0];
    for (var i = 0; i < specialSTABMoves.length; i++) {
        var move = genData.moves.get(specialSTABMoves[i]);
        console.log((genNumber == 1 && move.critRatio > 1));
        if ((move.basePower > genData.moves.get(oldBest).basePower && !(genNumber == 1 && move.critRatio < genData.moves.get(oldBest).critRatio)) || (genNumber == 1 && move.critRatio > genData.moves.get(oldBest).critRatio)) { // hardcoding for gen 1 crits
            oldBest = specialSTABMoves[i];
        }
    }
    return oldBest;
}

async function getBestSpecialMove(pokemon, type, allowRisky=false) {
    var specialMoves = await getSpecialMoves(pokemon, allowRisky);
    var oldBest = specialMoves[0];
    for (var i = 0; i < specialMoves.length; i++) {
        var move = genData.moves.get(specialMoves[i]);
        //console.log(move.type);
        //console.log(move.basePower);
        //console.log(oldBest);
        if (move.type === type && move.basePower > genData.moves.get(oldBest).basePower) {
            oldBest = specialMoves[i];
        }
    }
    if (oldBest === undefined || genData.moves.get(oldBest).type !== type) {
        return undefined;
    }
    return oldBest;
}

async function getBestUniqueSpecialMove(pokemon, type, moves, allowRisky=false) {
    var specialMoves = await getSpecialMoves(pokemon, allowRisky);
    var oldBest = specialMoves[0];
    for (var i = 0; i < specialMoves.length; i++) {
        var move = genData.moves.get(specialMoves[i]);
        //console.log(move.type);
        //console.log(move.basePower);
        //console.log(oldBest);
        if (move.type === type && move.basePower > genData.moves.get(oldBest).basePower && !moves.includes(specialMoves[i])) {
            console.log(specialMoves[i]);
            console.log(hasHiddenPower(moves));
            if (specialMoves[i].includes("Hidden Power") && hasHiddenPower(moves)) {
                continue;
            }
            oldBest = specialMoves[i];
        }
    }
    if (oldBest === undefined || genData.moves.get(oldBest).type !== type) {
        return undefined;
    }
    return oldBest;
}

async function getBestSTABMove(pokemon, allowRisky=false) {
    var physicalSTABMove = await getBestPhysicalSTABMove(pokemon, allowRisky);
    var specialSTABMove = await getBestSpecialSTABMove(pokemon, allowRisky);
    if (physicalSTABMove === undefined) {
        return specialSTABMove;
    }
    if (specialSTABMove === undefined) {
        return physicalSTABMove;
    }
    if (physicalSTABMove === undefined && specialSTABMove === undefined) {
        return undefined;
    }
    var pokemon = genData.species.get(pokemon);
    var physicalPower = genData.moves.get(physicalSTABMove).basePower + pokemon.baseStats.atk;
    var specialPower = genData.moves.get(specialSTABMove).basePower + pokemon.baseStats.spa;
    if (physicalPower > specialPower) {
        return physicalSTABMove;
    } else {
        return specialSTABMove;
    }
}

async function getBestMove(pokemon, type, allowRisky=false) {
    var physicalMove = await getBestPhysicalMove(pokemon, type, allowRisky);
    var specialMove = await getBestSpecialMove(pokemon, type, allowRisky);
    var pokemon = genData.species.get(pokemon);
    console.log(physicalMove);
    console.log(specialMove);
    if (physicalMove === undefined) {
        return specialMove;
    }
    if (specialMove === undefined) {
        return physicalMove;
    }
    if (physicalMove === undefined && specialMove === undefined) {
        return undefined;
    }
    var physicalPower = genData.moves.get(physicalMove).basePower + pokemon.baseStats.atk;
    var specialPower = genData.moves.get(specialMove).basePower + pokemon.baseStats.spa;
    if (physicalPower > specialPower) {
        return physicalMove;
    } else {
        return specialMove;
    }
}

async function getBestUniqueMove(pokemon, type, moves, allowRisky=false) {
    var physicalMove = await getBestUniquePhysicalMove(pokemon, type, moves, allowRisky);
    var specialMove = await getBestUniqueSpecialMove(pokemon, type, moves, allowRisky);
    var pokemon = genData.species.get(pokemon);
    console.log(physicalMove);
    console.log(specialMove);
    if (physicalMove === undefined) {
        return specialMove;
    }
    if (specialMove === undefined) {
        return physicalMove;
    }
    if (physicalMove === undefined && specialMove === undefined) {
        return undefined;
    }
    var physicalPower = genData.moves.get(physicalMove).basePower + pokemon.baseStats.atk;
    var specialPower = genData.moves.get(specialMove).basePower + pokemon.baseStats.spa;
    if (physicalPower > specialPower) {
        return physicalMove;
    } else {
        return specialMove;
    }
}

async function getStatusMoves(pokemon) {
    var statusMoves = [];
    var moves = Array.from(genData.moves);
    for (var i = 0; i < moves.length; i++) {
        if (moves[i].category === "Status" && await genData.learnsets.canLearn(pokemon, moves[i].name)) {
            statusMoves.push(moves[i].name);
        }
    }
    return statusMoves;
}

async function getNonVolatileStatusMoves(pokemon) {
    var statusMoves = [];
    var moves = Array.from(genData.moves);
    for (var i = 0; i < moves.length; i++) {
        if (moves[i].status && await genData.learnsets.canLearn(pokemon, moves[i].name)) {
            statusMoves.push(moves[i].name);
        }
    }
    return statusMoves;
}

async function getRecoveryMoves(pokemon) {
    console.log(pokemon);
    // all moves tagged as healing except the ones that don't actually heal you and rest and swallow (inconsistent)
    var recoveryMoves = [];
    var moves = Array.from(genData.moves);
    for (var i = 0; i < moves.length; i++) {
        console.log(moves[i].flags.heal);
        if (moves[i].flags.heal && moves[i].target === "self") {
            if (moves[i].name !== "Healing Wish" && moves[i].name !== "Revival Blessing" && moves[i].name !== "Rest" && moves[i].name !== "Swallow") {
                if (await genData.learnsets.canLearn(pokemon, moves[i].name)) {
                    console.log("Found move " + moves[i].name + " that heals");
                    recoveryMoves.push(moves[i].name);
                }
            }
        }
    }
    return recoveryMoves;
}

async function getPriorityMoves(pokemon) {
    // all moves with priority
    var priorityMoves = [];
    var moves = Array.from(genData.moves);
    for (var i = 0; i < moves.length; i++) {
        if (moves[i].priority > 0 && moves[i].basePower > 0 && await genData.learnsets.canLearn(pokemon, moves[i].name)) {
            priorityMoves.push(moves[i].name);
        }
    }
    return priorityMoves;
}

async function getBestPriorityMove(pokemon) {
    var priorityMoves = await getPriorityMoves(pokemon);
    var oldBest = priorityMoves[0];
    for (var i = 0; i < priorityMoves.length; i++) {
        var move = genData.moves.get(priorityMoves[i]);
        if (move.basePower > genData.moves.get(oldBest).basePower || (move.basePower >= genData.moves.get(oldBest).basePower && move.priority > genData.moves.get(oldBest).priority)) {
            oldBest = priorityMoves[i];
        }
    }
    return oldBest;
}

function getAvgSpeed(threats) {
    var avgSpeed = 0;
    for (var i = 0; i < threats.length; i++) {
        var mon = genData.species.get(threats[i][0]);
        avgSpeed += mon.baseStats.spe;
    }
    avgSpeed /= threats.length;
    return avgSpeed;
}

async function analyze() {
    // Get the form data
    var pokemon = $("#pokemon").val();
    var metagame = "gen" + genNumber + $("#metagame").val();
    var metagameData = await getMetagameData(metagame);
    var matchups = $("#num").val();
    var threats = getTopThreats(metagameData, matchups);
    // First, figure out the archetype based on stats, ability and movepool (if it's not manually specified)
    var archetype = $("#archetype").val();
    if (archetype === "auto") {
        archetype = await calculateArchetypes(pokemon, threats);
    } else {
        archetype = [archetype];
    }
    console.log(archetype);
    // Then, calculate every move's matchup against the most common threats using basic, approximate criteria (type effectiveness, how much status would harm them, etc.)
    // Select the best four moves based on the above criteria
    var movesets = await createMovesets(pokemon, threats, archetype);
    console.log(movesets);
    // Then, calculate an EV spread and nature by figuring out how many hits from each move would KO each threat and how many hits from each threat would KO the Pokemon and then seeking to make the first number larger, or if they're the same, make the Pokemon faster (accounting for priority to add extra bulk)
    // Then, select an appropriate item for the archetype and the moveset
    // TODO
    // Finally, calculate the best ability for the archetype and the moveset
    // TODO
    $("#set").empty();
    for (var i = 0; i < movesets.length; i++) {
        $("#set").append(pkmn.sets.Sets.exportSet(movesets[i]));
    }
}

async function createMovesets(pokemon, threats, archetype) {
    var movesets = [];
    var data = genData.species.get(pokemon);
    for (var i = 0; i < archetype.length; i++) {
        var set = {};
        var variations = [];
        //set.name = archetype[i];
        set.species = pokemon;
        set.moves = [];
        if (archetype[i] === "stall") {
            var possibleRecoveryMoves = await getRecoveryMoves(pokemon);
            if (possibleRecoveryMoves.length === 0) {
                possibleRecoveryMoves.push("Rest");
                console.log("No recovery, adding Rest!");
            }
            set.moves.push(possibleRecoveryMoves[0]); // nothing has more than one recovery move I think
            var possibleStatusMoves = await getNonVolatileStatusMoves(pokemon);
            for (var j = 0; j < possibleStatusMoves.length; j++) {
                var newSet = {...set};
                newSet.moves = [...set.moves];
                newSet.moves.push(possibleStatusMoves[j]);
                console.log(newSet);
                newSet.moves = await resolveMoveCombos(pokemon, newSet.moves, combos);
                variations.push(newSet);
            }
        }
        if (archetype[i] === "offensive-setup") {
            var bestSTABMove = await getBestSTABMove(pokemon);
            if (bestSTABMove) {
                set.moves.push(bestSTABMove);
            }
            if (data.baseStats.spe < getAvgSpeed(threats)) {
                var priority = await getBestPriorityMove(pokemon);
                if (priority) {
                    set.moves.push(priority);
                }
            }
            console.log(set.moves);
            set.moves = await generateCoverage(pokemon, set.moves, threats, 3);
            var specialCount = 0;
            var physicalCount = 0;
            var physicalBoostingMoves = await getPhysicalBoostingMoves(pokemon);
            var specialBoostingMoves = await getSpecialBoostingMoves(pokemon);
            console.log(physicalBoostingMoves);
            console.log(specialBoostingMoves);
            for (var j = 0; j < set.moves.length; j++) {
                var move = set.moves[j];
                console.log(move);
                if (genData.moves.get(move).category === "Special") {
                    specialCount++;
                }
                if (genData.moves.get(move).category === "Physical") {
                    physicalCount++;
                }
            }
            if (specialCount > physicalCount && specialBoostingMoves.length > 0) {
                for (var j = 0; j < specialBoostingMoves.length; j++) {
                    var newSet = {...set};
                    newSet.moves = [...set.moves];
                    console.log(newSet.moves);
                    newSet.moves.push(specialBoostingMoves[j]);
                    newSet.moves = await resolveMoveCombos(pokemon, newSet.moves, combos);
                    while (newSet.moves.length > 4) {
                        newSet.moves.splice(2, 1);
                    }
                    variations.push(newSet);
                }
            } else if (physicalBoostingMoves.length > 0) {
                for (var j = 0; j < physicalBoostingMoves.length; j++) {
                    var newSet = {...set};
                    newSet.moves = [...set.moves];
                    console.log(newSet.moves);
                    newSet.moves.push(physicalBoostingMoves[j]);
                    newSet.moves = await resolveMoveCombos(pokemon, newSet.moves, combos);
                    console.log(newSet.moves);
                    while (newSet.moves.length > 4) {
                        newSet.moves.splice(2, 1);
                    }
                    variations.push(newSet);
                }
            } else {
                for (var j = 0; j < specialBoostingMoves.length; j++) {
                    var newSet = {...set};
                    newSet.moves = [...set.moves];
                    console.log(newSet.moves);
                    newSet.moves.push(specialBoostingMoves[j]);
                    newSet.moves = await resolveMoveCombos(pokemon, newSet.moves, combos);
                    while (newSet.moves.length > 4) {
                        newSet.moves.splice(2, 1);
                    }
                }
                variations.push(newSet);
            }
        }
        if (archetype[i] === "immediate-power") {
            var bestSTABMove = await getBestSTABMove(pokemon, false);
            var bestRiskyMove = await getBestSTABMove(pokemon, true);
            if (bestSTABMove) {
                set.moves.push(bestSTABMove);
            }
            var newSet = undefined;
            if (bestRiskyMove && !set.moves.includes(bestRiskyMove)) {
                newSet = {...set};
                newSet.moves = [...set.moves];
                newSet.moves.push(bestRiskyMove);
            }
            if (data.baseStats.spe < getAvgSpeed(threats)) {
                var priority = await getBestPriorityMove(pokemon);
                if (priority) {
                    set.moves.push(priority);
                    if (newSet) {
                        newSet.moves.push(priority);
                    }
                }
            }
            set.moves = await generateCoverage(pokemon, set.moves, threats, 4);
            if (newSet) {
                newSet.moves = await generateCoverage(pokemon, newSet.moves, threats, 4);
                variations.push(set);
                variations.push(newSet);
            }
        }
        if (variations.length > 0) {
            for (var j = 0; j < variations.length; j++) {
                movesets.push(variations[j]);
            }
        } else {
            movesets.push(set);
        }
    }
    return movesets;
}

async function resolveMoveCombos(pokemon, moves, combos) {
    var data = genData.species.get(pokemon);
    var newMoves = [...moves];
    if (newMoves.length === 4) {
        return newMoves;
    }
    for (var i = 0; i < combos.length; i++) {
        if (moves.includes(combos[i][0]) && await genData.learnsets.canLearn(pokemon, combos[i][1])) {
            newMoves.push(combos[i][1]);
            moves.splice(moves.indexOf(combos[i][0]));
        }
    }
    return newMoves;
}

function mode(arr){
    return arr.sort((a,b) =>
          arr.filter(v => v===a).length
        - arr.filter(v => v===b).length
    ).pop();
}

async function generateCoverage(pokemon, moves, threats, maxMoves=4) {
    var possibilities = [];
    var types = Array.from(genData.types);
    var existingTypes = [];
    console.log(types);
    console.log(existingTypes);
    for (var i = 0; i < moves.length; i++) {
        existingTypes.push(genData.moves.get(moves[i]).type);
    }
    for (var i = 0; i < threats.length; i++) {
        if (threats[i] === undefined) {
            break;
        }
        var mon = genData.species.get(threats[i][0]);
        var type = mon.types;
        for (var k = 0; k < types.length; k++) {
            if (genData.types.totalEffectiveness(types[k].name, type) > 1 && !existingTypes.includes(types[k].name)) {
                var score = 1;
                if (genData.types.totalEffectiveness(types[k].name, type) > 2) {
                    score++;
                }
                for (var j = 0; j < existingTypes.length; j++) {
                    if (genData.types.totalEffectiveness(existingTypes[j], type) < 1) {
                        score++;
                    }
                    if (genData.types.totalEffectiveness(existingTypes[j], type) > 1) {
                        score--;
                    }
                }
                for (var j = 0; j < score; j++) {
                    possibilities.push(types[k].name);
                }
            }
        }
    }
    possibilities.push("Normal");
    var newMoves = [...moves];
    while (newMoves.length < maxMoves) {
        var mod = mode(possibilities);
        console.log(mod);
        var newMove = await getBestUniqueMove(pokemon, mod, newMoves);
        if (newMove && (genData.moves.get(newMove).basePower >= 60 || genNumber === 1)) {
            newMoves.push(newMove);
        }
        while (possibilities.includes(mod)) {
            possibilities.splice(possibilities.indexOf(mod), 1);
        }
        console.log(newMoves.length);
        if (possibilities.length === 0) {
            possibilities.push("Normal");
        }
    }
    console.log(newMoves);
    return newMoves;
}

async function calculateArchetypes(pokemon, threats) {
    var data = genData.species.get(pokemon);
    var isBulky = false;
    var isStrong = false;
    var isFast = false;
    var avgBulk = 0;
    for (var i = 0; i < threats.length; i++) {
        if (threats[i] === undefined) {
            break;
        }
        console.log(threats[i][0]);
        var mon = genData.species.get(threats[i][0]);
        avgBulk += mon.baseStats.hp + mon.baseStats.def + mon.baseStats.spd;
    }
    avgBulk /= threats.length;
    var avgPower = 0;
    for (var i = 0; i < threats.length; i++) {
        var mon = genData.species.get(threats[i][0]);
        avgPower += Math.max(mon.baseStats.atk, mon.baseStats.spa);
    }
    avgPower /= threats.length;
    var avgSpeed = 0;
    for (var i = 0; i < threats.length; i++) {
        var mon = genData.species.get(threats[i][0]);
        avgSpeed += mon.baseStats.spe;
    }
    avgSpeed /= threats.length;
    console.log(avgBulk);
    console.log(avgPower);
    console.log(avgSpeed);
    console.log(data.baseStats.hp + data.baseStats.def + data.baseStats.spd);
    console.log(Math.max(data.baseStats.atk, data.baseStats.spa));
    console.log(data.baseStats.spe);
    if (data.baseStats.hp + data.baseStats.def + data.baseStats.spd > avgBulk) {
        isBulky = true;
    }
    if (Math.max(data.baseStats.atk, data.baseStats.spa) > avgPower) {
        isStrong = true;
    }
    if (data.baseStats.spe > avgSpeed) {
        isFast = true;
    }
    console.log(isBulky);
    console.log(isStrong);
    console.log(isFast);
    var archetypes = [];
    if (Array.prototype.indexOf(data.abilities, "Unaware") !== -1 || Array.prototype.indexOf(data.abilities, "Regenerator") !== -1) { // if your mon has these abilities then it's definitely stall
        archetypes.push("stall");
    }
    if (Array.prototype.indexOf(data.abilities, "Toxic Debris") !== -1 || await genData.learnsets.canLearn(pokemon, "Ceaseless Edge") || await genData.learnsets.canLearn(pokemon, "Stone Axe")) { // glimmora gaming
        archetypes.push("suicide-lead");
    }
    if (isBulky && !isStrong) {
        var recovery = await getRecoveryMoves(pokemon);
        if (recovery.length > 0) {
            archetypes.push("stall");
        }
    }
    if ((isStrong && isBulky) || (isStrong && isFast)) {
        console.log("testing for boosting moves");
        var boostingMoves = await getBoostingMoves(pokemon);
        if (boostingMoves.length > 0) {
            archetypes.push("offensive-setup");
        }
    }
    if (isFast && !isBulky) {
        if (await genData.learnsets.canLearn(pokemon, "Stealth Rock") || await genData.learnsets.canLearn(pokemon, "Spikes") || await genData.learnsets.canLearn(pokemon, "Toxic Spikes")) {
            archetypes.push("suicide-lead");
        }
    }
    if (isStrong) {
        archetypes.push("immediate-power");
    }
    if (isFast || isBulky) {
        if (await genData.learnsets.canLearn(pokemon, "Rapid Spin") || await genData.learnsets.canLearn(pokemon, "Defog") || await genData.learnsets.canLearn(pokemon, "Tidy Up") || await genData.learnsets.canLearn(pokemon, "Court Change") || await genData.learnsets.canLearn(pokemon, "Heal Bell") || await genData.learnsets.canLearn(pokemon, "Aromatherapy") || await genData.learnsets.canLearn(pokemon, "Wish") || await genData.learnsets.canLearn(pokemon, "Revival Blessing") || await genData.learnsets.canLearn(pokemon, "Leech Seed") || await genData.learnsets.canLearn(pokemon, "Spore")) {
            archetypes.push("utility");
        }
    }
    if (archetypes.length === 0) {
        archetypes.push("stall");
    }

    return $.uniqArray(archetypes);
}

$(document).ready(function () {
    gens = new pkmn.data.Generations(pkmn.dex.Dex);
    populateSelects($("#generation").val());
});

$("#generation").change(function () {
    populateSelects($("#generation").val());
});

$("#input-data").submit(function (event) {
    event.preventDefault();
    analyze();
});

/*smogon.sets(gens.get(9), "Kingambit", "gen9ou").then(sets => {
    console.log(sets);
    const r = calc.calculate(
        gens.get(9),
        new calc.Pokemon(gens.get(9), sets[0].species, {
            item: sets[0].item,
            ability: sets[0].ability,
            nature: sets[0].nature,
            evs: sets[0].evs
        }),
        new calc.Pokemon(gens.get(9), "Toxapex", {
            item: "Black Sludge",
            ability: "Regenerator",
            nature: "Bold",
            evs: {
                hp: 252,
                def: 252,
                spd: 4
            }
        }),
        new calc.Move(gens.get(9), "Kowtow Cleave")
    );
    console.log(r);
});*/
