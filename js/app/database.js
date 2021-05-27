/*
 * Author:  simshadows <contact@simshadows.com>
 * License: GNU Affero General Public License v3 (AGPL-3.0)
 */

import {
    isInt,
    isNonEmptyStr,
    isArr,
    assert,
} from "./check.js";
import {
    sleep,
    isWeaponCategoryStr,
    isEleStatStr,
} from "./common.js";

const WEAPON_GS_PATH = "../../../data/weapons_greatsword.json";

// Common stuff
function validateWeaponData(weaponData, finalData) {
    assert(isWeaponCategoryStr(weaponData.category), "Category must be valid.");

    assert(isInt(weaponData.rarity), "Rarity must be an integer.");

    assert(isNonEmptyStr(weaponData.name), "Name must be a non-empty string.");

    assert(isInt(weaponData.attack) && (weaponData.attack > 0), "Attack must be an integer >0.");

    assert(isInt(weaponData.affinity), "Affinity must be an integer.");
    assert((weaponData.affinity >= -100) && (weaponData.affinity <= 100), "Affinity must be <=100 and >=-100.");

    assert(isInt(weaponData.defense) && (weaponData.defense >= 0), "Defense must be an integer >=0.");

    assert(isArr(weaponData.decoSlots), "Deco slots must be an Array.");
    assert((weaponData.decoSlots.length <= 3), "Must not have more than 3 deco slots.");
    for (const slotSize of weaponData.decoSlots) {
        assert(isInt(slotSize), "Deco slot size must be an integer.");
        assert((slotSize > 0 && slotSize <= 3), "Deco slot size must be 1, 2, or 3.");
    }

    assert(isEleStatStr(weaponData.eleStatType), "Must be a valid element or stat type, or none.");
    if (weaponData.eleStatType === "none") {
        assert((weaponData.eleStatValue == 0), "None-type element/status must have a value of 0.");
    } else {
        assert((weaponData.eleStatValue > 0), "Element/status must have a value >0.");
    }

    assert(isArr(weaponData.rampSkills), "Ramp skills must be an Array of Arrays.");
    assert((weaponData.rampSkills.length <= 3), "Must not have more than 3 ramp skill slots.");
    for (const possibleRampSkills of weaponData.rampSkills) {
        assert(isArr(possibleRampSkills), "Possible ramp skills must be an Array.");
        assert((possibleRampSkills.length > 1), "Must have at least two possible ramp skills."); // Or three?
        for (const rampID of possibleRampSkills) {
            assert(isNonEmptyStr(rampID), "Ramp skill ID must be a non-empty string.");
            // TODO: Include a check that a ramp ID is valid, and probably also a check for duplicate IDs.
        }
    }

    // Now, we just check for duplicate keys, and to make sure "0" is unused.

    assert(isNonEmptyStr(weaponData.id), "Weapon ID must be a non-empty string.");
    assert(weaponData.id != "0", "Weapon ID must not be 0 since that is a reserved ID.");
    assert(!finalData.has(weaponData.id), "Weapon ID already exists. ID: " + weaponData.id);
}

// Only weapons with sharpness bars
function validateWeaponDataSharpness(weaponData) {
    assert(isArr(weaponData.maxSharpness), "Maximum sharpness must be an Array.");
    assert((weaponData.maxSharpness.length == 6), "Maximum sharpness must have 6 numbers (each corresponding to a colour).");
    // First element is red sharpness. Last element is white sharpness.

    let hitSum = 0;
    let prevHits = 1;
    for (const hits of weaponData.maxSharpness) {
        assert(isInt(hits) && (hits >= 0), "Hits must be an integer >= 0.");
        assert((hits == 0) || (prevHits > 0), "Hits must not skip a colour."); // If this is wrong, remove this check.
        hitSum += hits;
        prevHits = hits;
    }
    assert((hitSum > 100), "Hits must add up to at least 100."); // If we find cases where this is wrong, remove this check.
}

async function downloadRawGreatswordData() {
    const res = await fetch(WEAPON_GS_PATH);
    const rawData = await res.json();

    const finalData = new Map();
    for (const [treeName, treeData] of Object.entries(rawData)) {
        assert(isNonEmptyStr(treeName), "Tree name must be a non-empty string.");
        for (const [weaponID, weaponData] of Object.entries(treeData)) {
            // Add more data
            weaponData.category = "greatsword";
            weaponData.id = weaponID;
            weaponData.treeName = treeName; // Merge in data
            validateWeaponData(weaponData, finalData);
            validateWeaponDataSharpness(weaponData);
            finalData.set(weaponID, weaponData);
        }
    }

    return finalData;
}

async function downloadRawData() {
    // TODO: Consider pipelining this.
    //await sleep(3000); // For testing
    return {
            weapons: {
                    greatsword: await downloadRawGreatswordData(),
                },
        };
}

export {
    downloadRawData,
};

