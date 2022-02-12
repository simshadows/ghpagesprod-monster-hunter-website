// @ts-nocheck
/*
 * Author:  simshadows <contact@simshadows.com>
 * License: GNU Affero General Public License v3 (AGPL-3.0)
 */

import {
    isObj,
    isFunction,
    isInt,
    isStr,
    isNonEmptyStr,
    isArr,
    isMap,
    isBool,
    assert,
} from "../check";
import {
    sleep,
    strHasOnlyLowerNumeral,
    strHasOnlyLowerNumeralUnder,
    isWeaponCategoryStr,
    isTierStr,
    isWeaponEndlineTagStr,
    isEleStatStr,
    toNameFilterString,
} from "../common";
import {
    setDifference,
} from "../utils";

import {
    skillMap,
    skillMapShortIds,
    rampageSkillsMap,
    rampageSkillsMapShortIds,
    decosMap,
    weaponsMap as newWeaponsMap,
    armourMap,
    armourArrays,
} from "./generated_code";
import {
    petalaceMap,
} from "./hardcoded_data/petalace_data";

import {gunlanceShellingTypesMap} from "./hardcoded_data/special_weapon_mechanics/gunlance";
import {huntingHornSongsMap     } from "./hardcoded_data/special_weapon_mechanics/huntinghorn";
import {switchAxePhialTypesMap  } from "./hardcoded_data/special_weapon_mechanics/switchaxe";
import {chargeBladePhialTypesMap} from "./hardcoded_data/special_weapon_mechanics/chargeblade";
import {
    insectGlaiveKinsectsMap,
    insectGlaiveKinsectTypesMap,
    insectGlaiveKinsectBonusesMap,
} from "./hardcoded_data/special_weapon_mechanics/insectglaive";
import {
    bowArcShotTypesMap,
    bowChargeShotTypesMap,
} from "./hardcoded_data/special_weapon_mechanics/bow";
import {bowgunAmmoTypesMap      } from "./hardcoded_data/special_weapon_mechanics/bowguns";
import {specialSelectionTypesMap} from "./hardcoded_data/special_weapon_mechanics/general";

const WEAPON_GL_PATH  = "./data/weapons_gunlance.json";
const WEAPON_H_PATH   = "./data/weapons_hammer.json";
const WEAPON_HH_PATH  = "./data/weapons_huntinghorn.json";
const WEAPON_SA_PATH  = "./data/weapons_switchaxe.json";
const WEAPON_CB_PATH  = "./data/weapons_chargeblade.json";
const WEAPON_IG_PATH  = "./data/weapons_insectglaive.json";
const WEAPON_LBG_PATH = "./data/weapons_lightbowgun.json";
const WEAPON_HBG_PATH = "./data/weapons_heavybowgun.json";
const WEAPON_BOW_PATH = "./data/weapons_bow.json";


/* WEAPONS ******************************************************************************/

/*** Downloading and Validating Weapon Data (without referential integrity checking) ***/

// Common stuff
function validateWeaponData(weaponData) {
    assert(isWeaponCategoryStr(weaponData.category));

    assert(isInt(weaponData.rarity));

    assert(isWeaponEndlineTagStr(weaponData.endlineTag));

    assert(isNonEmptyStr(weaponData.name));

    assert(isNonEmptyStr(weaponData.treeName));
    
    assert(isObj(weaponData.filterHelpers));
    // Not going to further test the structure of this.

    assert(isInt(weaponData.attack) && (weaponData.attack > 0));

    assert(isInt(weaponData.affinity));
    assert((weaponData.affinity >= -100) && (weaponData.affinity <= 100));

    assert(isInt(weaponData.defense) && (weaponData.defense >= 0));

    assert(isArr(weaponData.decoSlots));
    assert((weaponData.decoSlots.length <= 3));
    for (const slotSize of weaponData.decoSlots) {
        assert(isInt(slotSize));
        assert((slotSize > 0 && slotSize <= 3));
    }

    assert(isObj(weaponData.eleStat));
    for (const [eleStatType, eleStatValue] of Object.entries(weaponData.eleStat)) {
        assert(isEleStatStr(eleStatType));
        assert(eleStatType !== "none");
        assert(eleStatValue > 0);
    }

    assert(isArr(weaponData.rampSkills), "Ramp skills must be an Array of Arrays.");
    assert((weaponData.rampSkills.length <= 6));
    for (const possibleRampSkills of weaponData.rampSkills) {
        assert(isArr(possibleRampSkills));
        assert((possibleRampSkills.length > 0), "Must have at least one possible ramp skill.");
        for (const [rampID, inheritedFromWeaponID] of possibleRampSkills) {
            assert(isNonEmptyStr(rampID));
            assert(isStr(inheritedFromWeaponID)); // Empty string is allowed
        }
    }
}

function validateWeaponDataSharpness(weaponData) {
    // Only weapons with sharpness bars
    function op(values) {
        assert(isArr(values), "Maximum sharpness must be an Array.");
        assert((values.length == 6), "Maximum sharpness must have 6 numbers (each corresponding to a colour). " + weaponData.category + " " + weaponData.id);
        // First element is red sharpness. Last element is white sharpness.

        let hitSum = 0;
        let prevHits = 1;
        for (const hits of values) {
            assert(isInt(hits) && (hits >= 0), "Hits must be an integer >= 0.");
            //assert((hits == 0) || (prevHits > 0), "Hits must not skip a colour."); // This check is wrong.
            hitSum += hits;
            prevHits = hits;
        }
        assert((hitSum > 100), "Hits must add up to at least 100."); // If we find cases where this is wrong, remove this check.
    }
    op(weaponData.baseSharpness);
    op(weaponData.maxSharpness);
}

function validateWeaponDataGunlance(weaponData) {
    const shellingLevel = weaponData.gunlanceStats.shellingLevel;
    assert(isInt(shellingLevel) && (shellingLevel > 0) && (shellingLevel <= 5), "Invalid shelling level: " + String(shellingLevel));
}

function validateWeaponDataHuntingHorn(weaponData) {
    assert(isObj(weaponData.huntinghornSongs));
    //assert(isNonEmptyStr(weaponData.huntinghornSongs.x_x));
    //assert(isNonEmptyStr(weaponData.huntinghornSongs.a_a));
    //assert(isNonEmptyStr(weaponData.huntinghornSongs.xa_xa));
}

function validateWeaponDataSwitchAxe(weaponData) {
    const phialType = weaponData.switchaxeStats.phialType;
    const phialValue = weaponData.switchaxeStats.phialValue;

    assert(isObj(phialType));
    assert((phialValue === null) || (isInt(phialValue) && (phialValue > 0)));
}

function validateWeaponDataChargeBlade(weaponData) {
    assert(isObj(weaponData.chargebladeStats.phialType));
}

function validateWeaponDataInsectGlaive(weaponData) {
    const kinsectLevel = weaponData.insectglaiveStats.kinsectLevel;
    assert(isInt(kinsectLevel) && (kinsectLevel > 0) && (kinsectLevel <= 8));
}

function validateWeaponDataBow(weaponData) {
    const so = weaponData.bowStats;

    assert(isObj(so.arcShot)); // Already validated

    const bcll = so.baseChargeLevelLimit;
    assert(isInt(bcll) && (bcll > 0)); // Further validation later

    const chargeShotData = so.chargeShot;
    assert(isArr(chargeShotData));
    assert((chargeShotData.length >= 3) && (chargeShotData.length <= 4)); // Only known to be 3 or 4
    assert((chargeShotData.length === bcll) || (chargeShotData.length === bcll + 1)); // We expect at most a difference of 1
    for (const [chargeShotRO, level] of chargeShotData) {
        assert(isObj(chargeShotRO)); // Already validated
        assert(isInt(level) && (level >= 1) && (level <= 5));
    }

    const compatibleCoatings = so.compatibleCoatings;
    assert(Object.keys(compatibleCoatings).length === 7);
    const op = (k) => {
            assert(isInt(compatibleCoatings[k]) && (compatibleCoatings[k] >= 0) && (compatibleCoatings[k] <= 2)); // tri-state
        };
    op("close_range_coating");
    op("power_coating");
    op("poison_coating");
    op("para_coating");
    op("sleep_coating");
    op("blast_coating");
    op("exhaust_coating");
}

function validateWeaponDataBowguns(weaponData) {
    const so = weaponData.bowgunStats;

    assert(isInt(so.deviation.severity));
    assert((so.deviation.severity >= 0) && (so.deviation.severity <= 2));
    assert(isBool(so.deviation.left));
    assert(isBool(so.deviation.right));

    assert(isInt(so.recoil));
    assert((so.recoil >= 2) && (so.recoil <= 5)); // Recoil is in [0, 5], but base value hasn't been seen outside [2, 5]

    assert(isInt(so.reload));
    assert((so.reload >= 1) && (so.reload <= 6)); // Recoil is in [0, 8], but base value hasn't been seen outside [1, 6]

    // so.ammo keys have already been validated, so we'll just check other things
    for (const [k, v] of Object.entries(so.ammo)) {
        assert(isBool(v.available));
        assert(isInt(v.ammoCapacity) && (v.ammoCapacity >= 0));
        assert(!(v.available && (v.ammoCapacity === 0)), "Ammo can't be available while also having zero ammo capacity.");
    }
}

async function downloadCategoryRawWeaponData(category, path, op) {
    console.assert(isWeaponCategoryStr(category));
    isNonEmptyStr(path);
    isFunction(op);

    const res = await fetch(path);
    const rawData = await res.json();

    // Used for issuing useful warnings
    const huntingHornSeenSongs = new Set();

    const finalData = new Map();
    for (const [treeName, treeData] of Object.entries(rawData)) {
        assert(isNonEmptyStr(treeName), "Tree name must be a non-empty string.");
        for (const [weaponID, weaponData] of Object.entries(treeData)) {
            // Merge in data
            weaponData.category = category;
            weaponData.id = weaponID;
            weaponData.treeName = treeName;
            // Merge in helper strings for filter functions
            weaponData.filterHelpers = {};
            weaponData.filterHelpers.nameLower = toNameFilterString(weaponData.name);
            weaponData.filterHelpers.treeNameLower = toNameFilterString(treeName);

            // Convert the eleStat object to a map because it's easier to work with
            weaponData.eleStat = new Map(Object.entries(weaponData.eleStat));

            // Add Gunlance mechanics
            if (weaponData.category === "gunlance") {
                const shellingTypeID = weaponData.gunlanceStats.shellingType;
                const shellingTypeRO = gunlanceShellingTypesMap.get(shellingTypeID);
                assert(shellingTypeRO !== undefined, "Unknown shelling type ID: " + String(shellingTypeID));
                weaponData.gunlanceStats.shellingType = shellingTypeRO;
            }

            // Add Hunting Horn mechanics
            if (weaponData.category === "huntinghorn") {
                function getSong(songID) {
                    const _ret = huntingHornSongsMap.get(songID);
                    assert(_ret !== undefined, "Unknown song ID: " + String(songID));
                    return _ret;
                }
                const tmp = new Map([
                    ["x", getSong(weaponData.huntinghornSongs["x_x"])],
                    ["a", getSong(weaponData.huntinghornSongs["a_a"])],
                    ["xa", getSong(weaponData.huntinghornSongs["xa_xa"])],
                ]);
                huntingHornSeenSongs.add(tmp.get("x").id);
                huntingHornSeenSongs.add(tmp.get("a").id);
                huntingHornSeenSongs.add(tmp.get("xa").id);
                weaponData.huntinghornSongs = tmp;
            }

            // Add Switch Axe mechanics
            if (weaponData.category === "switchaxe") {
                const phialTypeID = weaponData.switchaxeStats.phialType;
                const phialTypeRO = switchAxePhialTypesMap.get(phialTypeID);
                assert(phialTypeRO !== undefined, "Unknown phial type ID: " + String(phialTypeID));
                weaponData.switchaxeStats.phialType = phialTypeRO;
            }

            // Add Charge Blade mechanics
            if (weaponData.category === "chargeblade") {
                const phialTypeID = weaponData.chargebladeStats.phialType;
                const phialTypeRO = chargeBladePhialTypesMap.get(phialTypeID);
                assert(phialTypeRO !== undefined, "Unknown phial type ID: " + String(phialTypeID));
                weaponData.chargebladeStats.phialType = phialTypeRO;
            }

            // Add Bow mechanics
            if (weaponData.category === "bow") {
                const arcShotTypeID = weaponData.bowStats.arcShot;
                const arcShotTypeRO = bowArcShotTypesMap.get(arcShotTypeID);
                assert(arcShotTypeRO !== undefined, "Unknown arc shot type ID: " + String(arcShotTypeID));
                weaponData.bowStats.arcShot = arcShotTypeRO;

                const chargeShotData = weaponData.bowStats.chargeShot;
                for (const tup of chargeShotData) {
                    const [chargeShotTypeID, level] = tup;
                    const chargeShotTypeRO = bowChargeShotTypesMap.get(chargeShotTypeID);
                    assert(chargeShotTypeRO !== undefined, "Unknown charge shot type ID: " + String(chargeShotTypeID));
                    tup[0] = chargeShotTypeRO; // Replace the original ID
                }
            }

            // Add bowgun mechanics
            if ((weaponData.category === "lightbowgun") || (weaponData.category === "heavybowgun")) {
                const newAmmoObj = {};
                for (const [k, v] of Object.entries(weaponData.bowgunStats.ammo)) {
                    assert(v.length > 0);

                    function op(_ammoTypeKey, _available, _capacity) {
                        const ammoRO = bowgunAmmoTypesMap.get(_ammoTypeKey);
                        assert(ammoRO !== undefined); // Check if the ammo type is valid
                        newAmmoObj[_ammoTypeKey] = {
                            ammoRO: ammoRO, // Merge in
                            available: _available,
                            ammoCapacity: _capacity,
                        };
                    }

                    if (v.length === 1) {
                        assert(v[0].length === 2);
                        op(k, v[0][0], v[0][1]);
                    } else {
                        for (const [i, [available, ammoCapacity]] of v.entries()) {
                            op(k + "_" + String(i + 1), available, ammoCapacity);
                        }
                    }
                }
                // Knowing all ammo types were found, this should complete the check for equality
                // between the hardcoded set of ammo type keys and the keys found here.
                assert(Object.keys(newAmmoObj).length === bowgunAmmoTypesMap.size);

                weaponData.bowgunStats.ammo = newAmmoObj;
            }

            // Validate Common Data
            validateWeaponData(weaponData);
            // Validate Specific Data
            op(weaponData);

            // Validate Key
            assert(isNonEmptyStr(weaponData.id), "Weapon ID must be a non-empty string.");
            assert(weaponData.id != "0", "Weapon ID must not be 0 since that is a reserved ID.");
            assert(!finalData.has(weaponData.id), "Weapon ID already exists. ID: " + weaponData.id);
            // Insert Key and Value
            finalData.set(weaponID, weaponData);
        }
    }

    if (category === "huntinghorn") {
        assert(huntingHornSeenSongs.size <= huntingHornSongsMap.size);
        const unseenSongs = setDifference(new Set(huntingHornSongsMap.keys()), huntingHornSeenSongs);
        if (unseenSongs.size !== 0) {
            for (const songID of unseenSongs) {
                console.warn("Song ID present in database but not used on a weapon: " + String(songID));
            }
        }
    } else {
        assert(huntingHornSeenSongs.size === 0);
    }

    return finalData;
}

async function downloadAllRawWeaponData() {
    const validateSimpleMelee  = (weaponData) => {validateWeaponDataSharpness(weaponData);};
    const validateGL           = (weaponData) => {validateWeaponDataSharpness(weaponData);
                                                  validateWeaponDataGunlance(weaponData);};
    const validateHH           = (weaponData) => {validateWeaponDataSharpness(weaponData);
                                                  validateWeaponDataHuntingHorn(weaponData);};
    const validateSA           = (weaponData) => {validateWeaponDataSharpness(weaponData);
                                                  validateWeaponDataSwitchAxe(weaponData);};
    const validateCB           = (weaponData) => {validateWeaponDataSharpness(weaponData);
                                                  validateWeaponDataChargeBlade(weaponData);};
    const validateIG           = (weaponData) => {validateWeaponDataSharpness(weaponData);
                                                  validateWeaponDataInsectGlaive(weaponData);};

    const validateBowgun       = (weaponData) => {validateWeaponDataBowguns(weaponData);};
    const validateBow          = (weaponData) => {validateWeaponDataBow(weaponData);};

    const glDataFut  = downloadCategoryRawWeaponData("gunlance",       WEAPON_GL_PATH,  validateGL         );
    const hDataFut   = downloadCategoryRawWeaponData("hammer",         WEAPON_H_PATH,   validateSimpleMelee);
    const hhDataFut  = downloadCategoryRawWeaponData("huntinghorn",    WEAPON_HH_PATH,  validateHH         );
    const saDataFut  = downloadCategoryRawWeaponData("switchaxe",      WEAPON_SA_PATH,  validateSA         );
    const cbDataFut  = downloadCategoryRawWeaponData("chargeblade",    WEAPON_CB_PATH,  validateCB         );
    const igDataFut  = downloadCategoryRawWeaponData("insectglaive",   WEAPON_IG_PATH,  validateIG         );
    const lbgDataFut = downloadCategoryRawWeaponData("lightbowgun",    WEAPON_LBG_PATH, validateBowgun     );
    const hbgDataFut = downloadCategoryRawWeaponData("heavybowgun",    WEAPON_HBG_PATH, validateBowgun     );
    const bowDataFut = downloadCategoryRawWeaponData("bow",            WEAPON_BOW_PATH, validateBow        );
    return {
            greatsword:     newWeaponsMap.greatsword,
            longsword:      newWeaponsMap.longsword,
            swordandshield: newWeaponsMap.swordandshield,
            dualblades:     newWeaponsMap.dualblades,
            lance:          newWeaponsMap.lance,
            gunlance:       await glDataFut,
            hammer:         await hDataFut,
            huntinghorn:    await hhDataFut,
            switchaxe:      await saDataFut,
            chargeblade:    await cbDataFut,
            insectglaive:   await igDataFut,
            lightbowgun:    await lbgDataFut,
            heavybowgun:    await hbgDataFut,
            bow:            await bowDataFut,
        };
}

/*** Joining Data ***/

function joinRampSkillObjsToWeaponData(weaponData) {
    assert(isObj(weaponData));
    //assert(isMap(rampageSkillsMap)); // Commented because it broke
    for (const [categoryID, weaponDataMap] of Object.entries(weaponData)) {
        // Bandaid for refactoring
        if (["greatsword", "longsword", "swordandshield", "dualblades", "lance"].includes(categoryID)) continue;
        for (const [weaponID, weaponDataObj] of weaponDataMap.entries()) {
            const newRampArray = [];
            for (const rampSkillRampArray of weaponDataObj.rampSkills) {
                const newRampSubArray = [];
                for (const [rampSkillID, inheritedFromWeaponID] of rampSkillRampArray) {
                    assert(
                        rampageSkillsMap.has(rampSkillID),
                        "Invalid rampage skill ID '" + rampSkillID + "' from " + categoryID + " " + weaponID
                    );

                    const inheritedFromWeaponRO = (()=>{
                            if (inheritedFromWeaponID === "") {
                                return null;
                            } else {
                                const ret = weaponDataMap.get(inheritedFromWeaponID);
                                assert(ret !== undefined);
                                return ret;
                            }
                        })();

                    const newRampEntry = [
                        rampageSkillsMap.get(rampSkillID),
                        inheritedFromWeaponRO,
                    ];
                    newRampSubArray.push(newRampEntry);
                }
                newRampArray.push(newRampSubArray);
            }
            weaponDataObj.rampSkills = newRampArray;
        }
    }
}


/* GameData CLASS ***********************************************************************/


class GameData {

    static _makeWeaponsArray(weaponsMap) {
        let ret = [];
        for (const [category, dataMap] of Object.entries(weaponsMap)) {
            console.assert(isWeaponCategoryStr(category));
            ret = ret.concat(Array.from(dataMap.values()));
        }
        return ret;
    }

    // Builder Function
    static async downloadRawData() {
        //await sleep(3000); // For testing

        // Start all downloads
        // Also verify data, except we verify referential integrity later.
        const weaponDataFut = downloadAllRawWeaponData();

        const weaponsMap = await weaponDataFut;

        const obj = new GameData("hello smish");
        obj.readonly = {
            skills: {
                array: Array.from(skillMap.values()),
                longIdsMap: skillMap,
                shortIdsMap: skillMapShortIds,
            },
            weaponRampSkills: {
                longIdsMap: rampageSkillsMap,
                shortIdsMap: rampageSkillsMapShortIds,
            },
            weaponMechanics: {
                gunlance: {
                    shellingTypesMap: gunlanceShellingTypesMap,
                },
                huntinghorn: {
                    songsMap: huntingHornSongsMap,
                },
                switchaxe: {
                    phialTypesMap: switchAxePhialTypesMap,
                },
                chargeblade: {
                    phialTypesMap: chargeBladePhialTypesMap,
                },
                insectglaive: {
                    kinsectsMap: insectGlaiveKinsectsMap,
                    kinsectTypesMap: insectGlaiveKinsectTypesMap,
                    kinsectBonusesMap: insectGlaiveKinsectBonusesMap,
                },
                bow: {
                    arcShotTypesMap: bowArcShotTypesMap,
                    chargeShotTypesMap: bowChargeShotTypesMap,
                },
                bowguns: {
                    ammoTypesMap: bowgunAmmoTypesMap,
                }
            },
            weaponSpecialSelections: {
                array: Array.from(specialSelectionTypesMap.values()),
                map: specialSelectionTypesMap,
            },
            weapons: {
                array: GameData._makeWeaponsArray(weaponsMap),
                map: weaponsMap,
            },
            armour: {
                arrays: armourArrays,
                map: armourMap,
            },
            petalaces: {
                array: Array.from(petalaceMap.values()),
                map: petalaceMap,
            },
            decorations: {
                array: Array.from(decosMap.values()),
                map: decosMap,
            },
        };

        // Replace all weapon ramp skill IDs with ramp skill objects
        joinRampSkillObjsToWeaponData(weaponsMap);

        return obj;
    }

    constructor(magic_phrase) {
        if (magic_phrase != "hello smish") {
            throw new Error("Do not instantiate directly.");
        }
    }

    getDefaultWeapon() {
        return this.readonly.weapons.map.greatsword.get("1f");
    }
}

// Convenience
async function downloadRawData() {
    return GameData.downloadRawData();
}

export {
    GameData,
    downloadRawData,
};

