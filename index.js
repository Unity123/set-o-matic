import {Smogon} from "https://unpkg.com/@pkmn/smogon/build/index.mjs";
import {Moves} from "https://unpkg.com/@pkmn/sim/build/esm/data/index.mjs";

$.uniqArray = function(a) {
    return $.grep(a, function(item, pos) {
        return $.inArray(item, a) === pos;
    });
};

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
    "Psychic Surge"
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

function getBoostingMoves() {
    /* this function gets good boosting moves
    I have decided that good boosting moves either boost at least two stats by at least one stage, boost one stat by at least two stages, 
    or are attacks with at least a 50% chance to boost at least one of the user's stats by at least one stage */
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
}

async function analyze() {
    // Get the form data
    var pokemon = $("#pokemon").val();
    var metagame = "gen" + genNumber + $("#metagame").val();
    var metagameData = await getMetagameData(metagame);
    var matchups = $("#num").val();
    var threats = getTopThreats(metagameData, matchups);
    var boostingMoves = getBoostingMoves();
    var recoveryMoves = getRecoveryMoves();
    var strongMoves = getStrongAttacks();
    var priorityMoves = getPriority();
    var statusMoves = getStatusMoves();
    console.log(boostingMoves);
    console.log(recoveryMoves);
    console.log(strongMoves);
    console.log(priorityMoves);
    console.log(statusMoves);
    // First, figure out the archetype based on stats, ability and movepool (if it's not manually specified)
    var archetype = $("#archetype").val();
    if (archetype === "auto") {
        archetype = await calculateArchetypes(pokemon, threats, boostingMoves, recoveryMoves);
    } else {
        archetype = [archetype];
    }
    console.log(archetype);
    // Then, calculate every move's matchup against the most common threats using basic, approximate criteria (type effectiveness, how much status would harm them, etc.)
    // Select the best four moves based on the above criteria
    var movesets = await createMovesets(pokemon, threats, boostingMoves, recoveryMoves, strongMoves, priorityMoves, statusMoves, archetype);
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

async function createMovesets(pokemon, threats, boostingMoves, recoveryMoves, strongMoves, priorityMoves, statusMoves, archetype) {
    var movesets = [];
    var data = genData.species.get(pokemon);
    for (var i = 0; i < archetype.length; i++) {
        var set = {};
        set.name = archetype[i];
        set.species = pokemon;
        set.moves = [];
        if (archetype[i] === "stall") {
            var possibleStatusMoves = [];
            for (var j = 0; j < statusMoves.length; j++) {
                if (await genData.learnsets.canLearn(pokemon, statusMoves[j])) {
                    possibleStatusMoves.push(statusMoves[j]);
                }
            }
            set.moves.push(possibleStatusMoves[Math.floor(Math.random() * possibleStatusMoves.length)]);
            var possibleRecoveryMoves = [];
            for (var j = 0; j < recoveryMoves.length; j++) {
                if (await genData.learnsets.canLearn(pokemon, recoveryMoves[j])) {
                    possibleRecoveryMoves.push(recoveryMoves[j]);
                }
            }
            set.moves.push(possibleRecoveryMoves[Math.floor(Math.random() * possibleRecoveryMoves.length)]);
        }
        if (archetype[i] === "offensive-setup") {
            var possibleBoostingMoves = [];
            for (var j = 0; j < boostingMoves.length; j++) {
                if (await genData.learnsets.canLearn(pokemon, boostingMoves[j])) {
                    possibleBoostingMoves.push(boostingMoves[j]);
                }
            }
            set.moves.push(possibleBoostingMoves[Math.floor(Math.random() * possibleBoostingMoves.length)]);
            var possibleStrongMoves = [];
            for (var j = 0; j < strongMoves.length; j++) {
                if (await genData.learnsets.canLearn(pokemon, strongMoves[j])) {
                    possibleStrongMoves.push(strongMoves[j]);
                }
            }
            var possibleStrongStabMoves = [];
            console.log(data.types);
            for (var j = 0; j < possibleStrongMoves.length; j++) {
                var move = genData.moves.get(possibleStrongMoves[j]);
                if (move.type === data.types[0] || move.type === data.types[1]) {
                    possibleStrongStabMoves.push(possibleStrongMoves[j]);
                }
            }
            set.moves.push(possibleStrongStabMoves[Math.floor(Math.random() * possibleStrongStabMoves.length)]);
            var avgSpeed = 0;
            for (var i = 0; i < threats.length; i++) {
                var mon = genData.species.get(threats[i][0]);
                avgSpeed += mon.baseStats.spe;
            }
            if (data.baseStats.spe < avgSpeed) {
                var possiblePriorityMoves = [];
                for (var j = 0; j < priorityMoves.length; j++) {
                    if (await genData.learnsets.canLearn(pokemon, priorityMoves[j])) {
                        possiblePriorityMoves.push(priorityMoves[j]);
                    }
                }
                if (possiblePriorityMoves.length > 0) {
                    set.moves.push(possiblePriorityMoves[Math.floor(Math.random() * possiblePriorityMoves.length)]);
                }
            }
            set.moves = await resolveMoveCombos(pokemon, set.moves, combos);
            set.moves = generateCoverage(pokemon, set.moves, possibleStrongMoves, threats);
        }
        set.moves = await resolveMoveCombos(pokemon, set.moves, combos);
        while (set.moves.length < 4) {
            var possibleStatusMoves = [];
            for (var j = 0; j < statusMoves.length; j++) {
                if (await genData.learnsets.canLearn(pokemon, statusMoves[j]) && !set.moves.includes(statusMoves[j])) {
                    possibleStatusMoves.push(statusMoves[j]);
                }
            }
            if (possibleStatusMoves.length === 0) {
                var possibleStrongMoves = [];
                for (var j = 0; j < strongMoves.length; j++) {
                    if (await genData.learnsets.canLearn(pokemon, strongMoves[j]) && !set.moves.includes(strongMoves[j])) {
                        possibleStrongMoves.push(strongMoves[j]);
                    }
                }
                set.moves.push(possibleStrongMoves[Math.floor(Math.random() * possibleStrongMoves.length)]);
                continue;
            }
            set.moves.push(possibleStatusMoves[Math.floor(Math.random() * possibleStatusMoves.length)]);
        }
        movesets.push(set);
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

function generateCoverage(pokemon, moves, strongMoves, threats) {
    var possibilities = [];
    var num = 4 - moves.length;
    for (var i = 0; i < threats.length; i++) {
        if (threats[i] === undefined) {
            break;
        }
        var mon = genData.species.get(threats[i][0]);
        var type = mon.types;
        for (var k = 0; k < strongMoves.length; k++) {
            var move = genData.moves.get(strongMoves[k]);
            if (genData.types.totalEffectiveness(move.type, type) > 1 && !moves.includes(strongMoves[k])) {
                possibilities.push(strongMoves[k]);
                if (genData.types.totalEffectiveness(move.type, type) > 2) {
                    possibilities.push(strongMoves[k]);
                }
            }
        }
    }
    var newMoves = [...moves];
    while (newMoves.length < 4) {
        var mod = mode(possibilities);
        newMoves.push(mod);
        while (possibilities.includes(mod)) {
            possibilities.splice(possibilities.indexOf(mod), 1);
        }
        console.log(newMoves.length);
    }
    return newMoves;
}

async function calculateArchetypes(pokemon, threats, boostingMoves, recoveryMoves, statusMoves) {
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
        for (var i = 0; i < recoveryMoves.length; i++) {
            if (await genData.learnsets.canLearn(pokemon, recoveryMoves[i])) { // bulky recovery = stall
                archetypes.push("stall");
                break;
            }
        }
    }
    if ((isStrong && isBulky) || (isStrong && isFast)) {
        for (var i = 0; i < boostingMoves.length; i++) {
            if (await genData.learnsets.canLearn(pokemon, boostingMoves[i])) { // strong boosting = setup
                archetypes.push("offensive-setup");
                break;
            }
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
