/*
 * Author:  simshadows <contact@simshadows.com>
 * License: GNU Affero General Public License v3 (AGPL-3.0)
 */

import {Build} from "../build.js";
import {CalcState} from "../calc_state.js";

import {getBaseValues} from "./step1_get_base_values.js";
import {getSkillContributions} from "./step2_get_skill_contributions.js";
import {getMiscBuffContributions} from "./step3_get_misc_buff_contributions.js";

import {
    isObj,
    isInt,
    isNonEmptyStr,
    isStrOrNull,
    isArr,
    isMap,
    isSet,
    isFunction,
} from "../../check.js";
import {
    isEleStr,
    getWeaponTags,
} from "../../common.js";
import {
    sum,
} from "../../utils.js";

const assert = console.assert;


/****************************************************************************************/
/*  Data  *******************************************************************************/
/****************************************************************************************/


const rawSharpnessModifiers = [
    0.50, // 1: Red
    0.75, // 2: Orange
    1.00, // 3: Yellow
    1.05, // 4: Green
    1.20, // 5: Blue
    1.32, // 6: White
];


const elementalSharpnessModifiers = [
    0.25,   // 1: Red
    0.50,   // 2: Orange
    0.75,   // 3: Yellow
    1.00,   // 4: Green
    1.0625, // 5: Blue
    1.15,   // 6: White
];


/****************************************************************************************/
/*  Main Formula  ***********************************************************************/
/****************************************************************************************/


function calculateBuildPerformance(db, build, calcState) {
    assert(isObj(db));
    assert(isMap(db.readonly.weapons.map.greatsword)); // Spot check for structure

    assert(build instanceof Build);
    assert(calcState instanceof CalcState);

    const weaponRO = build.getWeaponObjRO();
    const tagset   = getWeaponTags(weaponRO.category);

    const allCalcStateSpec = calcState.getSpecification();
    const allCalcState = calcState.getCurrState();

    //
    // STAGE 1: Calculating base values and skill contributions.
    //
    // We obtain base values by getting the weapon's original values, then applying all rampage skills.
    //

    const b = getBaseValues(db, build, calcState);
    assert(b.baseRaw      !== undefined);
    assert(b.baseAffinity !== undefined);
    assert(b.baseEleStat  !== undefined);
    assert(b.minSharpness !== undefined);
    assert(b.maxSharpness !== undefined);
    assert(b.baseDefense  !== undefined);

    assert(b.rawPostTruncMul !== undefined);

    assert(b.gunlanceStats     !== undefined);
    assert(b.huntingHornSongs  !== undefined);
    assert(b.switchaxeStats    !== undefined);
    assert(b.chargebladeStats  !== undefined);
    assert(b.insectglaiveStats !== undefined);
    assert(b.bowStats          !== undefined);
    assert(b.bowgunStats       !== undefined);

    const s = getSkillContributions(db, build, calcState);
    assert(s.rawAdd                  !== undefined);
    assert(s.rawMul                  !== undefined);
    assert(s.affinityAdd             !== undefined);
    assert(s.eleStatAdd              !== undefined);
    assert(s.eleStatMul              !== undefined);
    assert(s.rawBlunderDamage        !== undefined);
    assert(s.rawCriticalDamage       !== undefined);
    assert(s.elementalBlunderDamage  !== undefined);
    assert(s.elementalCriticalDamage !== undefined);
    assert(s.bowChargePlusLevel      !== undefined);
    assert(s.handicraftLevel         !== undefined);
    assert(s.mastersTouchLevel       !== undefined);
    assert(s.razorSharpLevel         !== undefined);
    assert(s.defenseAdd              !== undefined);
    assert(s.defenseMul              !== undefined);
    assert(s.eleResAdd               !== undefined);

    assert(s.rawPostTruncMul !== undefined);

    const m = getMiscBuffContributions(db, build, calcState);
    assert(m.rawAdd      !== undefined);
    assert(m.rawMul      !== undefined);
    assert(m.affinityAdd !== undefined);
    assert(m.eleMul      !== undefined);
    assert(m.defenseAdd  !== undefined);
    assert(m.defenseMul  !== undefined);

    //
    // STAGE 2: Calculate post-base values
    //

    const postbaseRaw = (Math.trunc(b.baseRaw * s.rawMul * m.rawMul) + s.rawAdd + m.rawAdd) * b.rawPostTruncMul * s.rawPostTruncMul;
    const postbaseAffinity = b.baseAffinity + s.affinityAdd + m.affinityAdd;

    const postbaseEleStat = new Map();
    for (const [eleStatID, baseEleStatValue] of b.baseEleStat.entries()) {
        let x = baseEleStatValue * s.eleStatMul[eleStatID];
        if (isEleStr(eleStatID)) {
            x *= m.eleMul;
        }
        const postbaseEleStatValue = Math.trunc(x) + s.eleStatAdd[eleStatID];
        postbaseEleStat.set(eleStatID, postbaseEleStatValue);
    }

    let hitsMultiplier = 1; // To be accumulated over later

    //
    // STAGE 3: Find Sharpness Modifiers
    //

    let realSharpnessBar              = null;
    let maxSharpnessBar               = null;
    let rawSharpnessModifier          = null;
    let elementalSharpnessModifier    = null;

    if (tagset.has("melee")) {
        
        // We first determine if the sharpness bar is full.

        const minSharpnessTotalHits = b.minSharpness.reduce(sum);
        const maxSharpnessTotalHits = b.maxSharpness.reduce(sum);

        const barIsFull = (()=>{
                if (minSharpnessTotalHits === maxSharpnessTotalHits) {
                    return true;
                } else {
                    // TODO: Do this check again during database initialization.
                    assert(minSharpnessTotalHits + 50 === maxSharpnessTotalHits);
                    return false;
                }
            })();

        // If the bar is full, we consider handicraft to be max for this calculation.
        const effectiveHandicraftLevel = (barIsFull) ? 5 : s.handicraftLevel;

        // Now, we apply this effective handicraft level.
        const sharpnessValues = getSharpnessValues(b.maxSharpness, effectiveHandicraftLevel);
        realSharpnessBar           = sharpnessValues.realSharpnessBar;
        maxSharpnessBar            = b.maxSharpness;
        rawSharpnessModifier       = sharpnessValues.rawSharpnessModifier;
        elementalSharpnessModifier = sharpnessValues.elementalSharpnessModifier;
    }

    //
    // STAGE 4: Find and Apply Crit Modifiers
    //

    const critChance = Math.min(postbaseAffinity, 100) / 100; // Clip values to 1 or less

    function getCritModifier(critDamage, blunderDamage) {
        if (critChance < 0) {
            // Negative affinity causes chance for "blunder"
            const blunderChance = -Math.max(critChance, -1); // Clip values to 1 or above, then convert to positive probability
            return (blunderDamage * blunderChance) + (1 - blunderChance);
        } else {
            // Positive affinity causes chance for extra damage
            return (critDamage * critChance) + (1 - critChance);
        }
    }
    const rawCritModifier = getCritModifier(s.rawCriticalDamage, s.rawBlunderDamage);
    const elementalCritModifier = getCritModifier(s.elementalCriticalDamage, s.elementalBlunderDamage);

    //
    // STAGE 5: Apply Master's Touch and Razor Sharp to the sharpness bar
    //

    if (s.razorSharpLevel > 0) {
        const chanceOfNoSharpnessLoss = (()=>{
                switch (s.razorSharpLevel) {
                    case 1: return 0.10;
                    case 2: return 0.25;
                    case 3: return 0.50;
                    default:
                        console.warn("Unexpected Razor Sharp level: " + String(s.razorSharpLevel));
                        return 0;
                }
            })();
        hitsMultiplier *= 1 / (1 - chanceOfNoSharpnessLoss)
    }

    if ((s.mastersTouchLevel > 0) && (critChance > 0)) {
        const chanceOfNoSharpnessLossOnCrit = (()=>{
                switch (s.mastersTouchLevel) {
                    case 1: return 0.2;
                    case 2: return 0.4;
                    case 3: return 0.8;
                    default:
                        console.warn("Unexpected Master's Touch level: " + String(s.mastersTouchLevel));
                        return 0;
                }
            })();
        const chanceOfNoSharpnessLoss = chanceOfNoSharpnessLossOnCrit * critChance;
        hitsMultiplier *= 1 / (1 - chanceOfNoSharpnessLoss)
    }

    //
    // STAGE 6: We finally calculate effective raw!
    //

    let effectiveRaw = postbaseRaw * rawCritModifier;
    if (tagset.has("melee")) {
        effectiveRaw *= rawSharpnessModifier;
    }

    let effectiveEleStat = new Map();
    for (const [eleStatID, postbaseEleStatValue] of postbaseEleStat.entries()) {
        let effectiveEleStatValue = postbaseEleStatValue;
        if (isEleStr(eleStatID)) {
            effectiveEleStatValue *= elementalCritModifier;
            if (tagset.has("melee")) {
                effectiveEleStatValue *= elementalSharpnessModifier;
            }
        }
        effectiveEleStat.set(eleStatID, effectiveEleStatValue);
    }

    //
    // STAGE 7: Special Mechanics
    //

    let gunlanceStats = b.gunlanceStats;
    assert((weaponRO.category === "gunlance") === (gunlanceStats !== null));

    let huntingHornSongs = b.huntingHornSongs;
    assert((weaponRO.category === "huntinghorn") === (huntingHornSongs !== null));

    let switchAxeStats = b.switchaxeStats;
    assert((weaponRO.category === "switchaxe") === (switchAxeStats !== null));

    let chargeBladeStats = b.chargebladeStats;
    assert((weaponRO.category === "chargeblade") === (chargeBladeStats !== null));

    let insectglaiveStats = b.insectglaiveStats;
    assert((weaponRO.category === "insectglaive") === (insectglaiveStats !== null));

    let bowStats = b.bowStats;
    assert((weaponRO.category === "bow") === (bowStats !== null));
    if ((weaponRO.category === "bow") && (s.bowChargePlusLevel !== 0)) {
        assert(s.bowChargePlusLevel === 1);
        const cllMax = bowStats.chargeShot.length;
        const cll = bowStats.chargeLevelLimit;
        assert((cllMax === cll) || (cllMax === cll + 1)); // Assume cll is at most -1 of max
        bowStats.chargeLevelLimit = cllMax; // Sets chargeLevelLimit to max
    }

    let bowgunStats = b.bowgunStats;
    assert(((weaponRO.category === "lightbowgun") || (weaponRO.category === "heavybowgun")) === (bowgunStats !== null));

    const ret = {

        // This part goes to the equips section
        // TODO: Rename it to baseAttack, etc.

        weaponAttack:   b.baseRaw,
        weaponAffinity: b.baseAffinity,
        weaponDefense:  b.baseDefense,
        weaponEleStat:  b.baseEleStat,

        // The rest goes to the calculated values section

        effectiveRaw:     effectiveRaw,
        effectiveEleStat: effectiveEleStat,
        affinity:         postbaseAffinity,

        rawCritDmgMultiplier:       s.rawCriticalDamage,
        rawCritModifier:            rawCritModifier,
        elementalCritDmgMultiplier: s.elementalCriticalDamage,
        elementalCritModifier:      elementalCritModifier,

        realSharpnessBar:           realSharpnessBar,
        maxSharpnessBar:            maxSharpnessBar,
        hitsMultiplier:             hitsMultiplier,
        rawSharpnessModifier:       rawSharpnessModifier,
        elementalSharpnessModifier: elementalSharpnessModifier,

        gunlanceStats:     gunlanceStats,
        huntingHornSongs:  huntingHornSongs,
        switchAxeStats:    switchAxeStats,
        chargeBladeStats:  chargeBladeStats,
        insectGlaiveStats: insectglaiveStats,
        bowStats:          bowStats,
        bowgunStats:       bowgunStats,
    };
    return ret;
}


/****************************************************************************************/
/*  Sharpness  **************************************************************************/
/****************************************************************************************/


function getSharpnessValues(maxSharpness, handicraftLevel) {
    const realSharpnessBar = applyHandicraft(maxSharpness, handicraftLevel);
    const highestSharpnessLevel = getHighestSharpnessIndex(realSharpnessBar);
    return {
        realSharpnessBar:           realSharpnessBar,
        rawSharpnessModifier:       rawSharpnessModifiers[highestSharpnessLevel],
        elementalSharpnessModifier: elementalSharpnessModifiers[highestSharpnessLevel]
    };
}


function applyHandicraft(maxSharpness, handicraftLevel) {
    assert(isArr(maxSharpness) && (maxSharpness.length === 6)); // We only go up to white sharpness
    assert(isInt(handicraftLevel) && (handicraftLevel >= 0) && (handicraftLevel <= 5));

    const realSharpnessBar = [...maxSharpness];
    let hitsToSubtract = 50 - (handicraftLevel * 10);

    assert(isInt(hitsToSubtract) && (hitsToSubtract >= 0)) && (hitsToSubtract <= 50);

    for (let i = realSharpnessBar.length - 1; i >= 0; --i) {
        const currHits = realSharpnessBar[i];
        const newHits = currHits - hitsToSubtract;
        if (newHits < 0) {
            hitsToSubtract = -newHits;
            realSharpnessBar[i] = 0;
        } else {
            hitsToSubtract = 0;
            realSharpnessBar[i] = newHits;
        }
    }
    return realSharpnessBar;
}


function getHighestSharpnessIndex(realSharpnessBar) {
    assert(isArr(realSharpnessBar) && (realSharpnessBar.length === 6)); // We only go up to white sharpness
    
    let highestIndex = null;
    for (let i = realSharpnessBar.length - 1; i >= 0; --i) {
        if (realSharpnessBar[i] > 0) {
            highestIndex = i;
            break;
        }
    }
    assert(highestIndex !== null); // We always find a sharpness level
    return highestIndex;
}


export {calculateBuildPerformance};

