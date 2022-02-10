/*
 * Author:  simshadows <contact@simshadows.com>
 * License: GNU Affero General Public License v3 (AGPL-3.0)
 */

import {
    isPositiveInt,
} from "../../generic/check";
import {
    FrozenMap,
} from "../../generic/frozen-containers";

import {
    type SkillIcon,
    type Skill,
    type SkillRO,
} from "../../common/types";
import {
    toNameFilterString,
} from "../../common/mappings";
import {getImgPath} from "../../images";

type HardcodedSkill = Omit<Skill, "iconImgPath" | "filterHelpers">;

const iconsToImageID: {[key in SkillIcon]: string} = {
    blue     : "skill_icon_blue",
    brown    : "skill_icon_brown",
    darkblue : "skill_icon_darkblue",
    gold     : "skill_icon_gold",
    green    : "skill_icon_green",
    grey     : "skill_icon_grey",
    lightblue: "skill_icon_lightblue",
    orange   : "skill_icon_orange",
    pink     : "skill_icon_pink",
    purple   : "skill_icon_purple",
    red      : "skill_icon_red",
    white    : "skill_icon_white",
    yellow   : "skill_icon_yellow",
}

const hardcodedSkills: HardcodedSkill[] = [

    // TODO: Prune skills that don't actually exist in-game. I sorta just pulled this from the wiki.

    // For convenience, I'm bringing common elemental/status stuff to the top first.

    //
    // COMMON ELEMENTAL/STATUS SKILLS
    // (X Attack and X Resistance)
    //

    {
        id: "fire_attack",
        shortId: 1,
        name: "Fire Attack",
        maxLevels: 5,

        icon: "red",
    },
    {
        id: "water_attack",
        shortId: 2,
        name: "Water Attack",
        maxLevels: 5,

        icon: "blue",
    },
    {
        id: "thunder_attack",
        shortId: 3,
        name: "Thunder Attack",
        maxLevels: 5,

        icon: "yellow",
    },
    {
        id: "ice_attack",
        shortId: 4,
        name: "Ice Attack",
        maxLevels: 5,

        icon: "lightblue",
    },
    {
        id: "dragon_attack",
        shortId: 5,
        name: "Dragon Attack",
        maxLevels: 5,

        icon: "orange",
    },
    {
        id: "poison_attack",
        shortId: 6,
        name: "Poison Attack",
        maxLevels: 3,

        icon: "purple",
    },
    {
        id: "paralysis_attack",
        shortId: 7,
        name: "Paralysis Attack",
        maxLevels: 3,

        icon: "gold",
    },
    {
        id: "sleep_attack",
        shortId: 8,
        name: "Sleep Attack",
        maxLevels: 3,

        icon: "lightblue",
    },
    {
        id: "blast_attack",
        shortId: 9,
        name: "Blast Attack",
        maxLevels: 3,

        icon: "orange",
    },
    {
        id: "fire_resistance",
        shortId: 10,
        name: "Fire Resistance",
        maxLevels: 3,

        icon: "red",
    },
    {
        id: "water_resistance",
        shortId: 11,
        name: "Water Resistance",
        maxLevels: 3,

        icon: "blue",
    },
    {
        id: "thunder_resistance",
        shortId: 12,
        name: "Thunder Resistance",
        maxLevels: 3,

        icon: "yellow",
    },
    {
        id: "ice_resistance",
        shortId: 13,
        name: "Ice Resistance",
        maxLevels: 3,

        icon: "lightblue",
    },
    {
        id: "dragon_resistance",
        shortId: 14,
        name: "Dragon Resistance",
        maxLevels: 3,

        icon: "orange",
    },
    {
        id: "poison_resistance",
        shortId: 15,
        name: "Poison Resistance",
        maxLevels: 3,

        icon: "purple",
    },
    {
        id: "paralysis_resistance",
        shortId: 16,
        name: "Paralysis Resistance",
        maxLevels: 3,

        icon: "gold",
    },
    {
        id: "sleep_resistance",
        shortId: 17,
        name: "Sleep Resistance",
        maxLevels: 3,

        icon: "lightblue",
    },
    {
        id: "blast_resistance",
        shortId: 18,
        name: "Blast Resistance",
        maxLevels: 3,

        icon: "orange",
    },

    //
    // EVERYTHING ELSE
    //

    {
        id: "affinity_sliding",
        shortId: 19,
        name: "Affinity Sliding",
        maxLevels: 1,

        icon: "pink",
    },
    {
        id: "agitator",
        shortId: 20,
        name: "Agitator",
        maxLevels: 5,

        icon: "red",
    },
    {
        id: "ammo_up",
        shortId: 21,
        name: "Ammo Up",
        maxLevels: 3,

        icon: "green",
    },
    {
        id: "artillery",
        shortId: 22,
        name: "Artillery",
        maxLevels: 3,

        icon: "grey",
    },
    {
        id: "attack_boost",
        shortId: 23,
        name: "Attack Boost",
        maxLevels: 7,

        icon: "red",
    },
    {
        id: "ballistics",
        shortId: 24,
        name: "Ballistics",
        maxLevels: 3,

        icon: "white",
    },
    {
        id: "blight_resistance",
        shortId: 25,
        name: "Blight Resistance",
        maxLevels: 3,

        icon: "blue",
    },
    {
        id: "bludgeoner",
        shortId: 26,
        name: "Bludgeoner",
        maxLevels: 3,

        icon: "grey",
    },
    {
        id: "bombardier",
        shortId: 27,
        name: "Bombardier",
        maxLevels: 3,

        icon: "orange",
    },
    {
        id: "botanist",
        shortId: 28,
        name: "Botanist",
        maxLevels: 4,

        icon: "green",
    },
    {
        id: "bow_charge_plus",
        shortId: 29,
        name: "Bow Charge Plus",
        maxLevels: 1,

        icon: "green",
    },
    {
        id: "bubbly_dance",
        shortId: 30,
        name: "Bubbly Dance",
        maxLevels: 3,

        icon: "white",
    },
    {
        id: "capture_master",
        shortId: 31,
        name: "Capture Master",
        maxLevels: 1,

        icon: "pink",
    },
    {
        id: "carving_master",
        shortId: 32,
        name: "Carving Master",
        maxLevels: 1,

        icon: "green",
    },
    {
        id: "carving_pro",
        shortId: 33,
        name: "Carving Pro",
        maxLevels: 1,

        icon: "grey",
    },
    {
        id: "chameleos_blessing",
        shortId: 34,
        name: "Chameleos Blessing",
        maxLevels: 4,

        icon: "purple",
    },
    {
        id: "constitution",
        shortId: 35,
        name: "Constitution",
        maxLevels: 5,

        icon: "gold",
    },
    {
        id: "counterstrike",
        shortId: 36,
        name: "Counterstrike",
        maxLevels: 3,

        icon: "red",
    },
    {
        id: "critical_boost",
        shortId: 37,
        name: "Critical Boost",
        maxLevels: 3,

        icon: "pink",
    },
    {
        id: "critical_draw",
        shortId: 38,
        name: "Critical Draw",
        maxLevels: 3,

        icon: "pink",
    },
    {
        id: "critical_element",
        shortId: 39,
        name: "Critical Element",
        maxLevels: 3,

        icon: "darkblue",
    },
    {
        id: "critical_eye",
        shortId: 40,
        name: "Critical Eye",
        maxLevels: 7,

        icon: "pink",
    },
    {
        id: "defense_boost",
        shortId: 41,
        name: "Defense Boost",
        maxLevels: 7,

        icon: "gold",
    },
    {
        id: "diversion",
        shortId: 42,
        name: "Diversion",
        maxLevels: 1,

        icon: "purple",
    },
    {
        id: "divine_blessing",
        shortId: 43,
        name: "Divine Blessing",
        maxLevels: 3,

        icon: "white",
    },
    {
        id: "dragonheart",
        shortId: 44,
        name: "Dragonheart",
        maxLevels: 5,

        icon: "orange",
    },
    {
        id: "earplugs",
        shortId: 45,
        name: "Earplugs",
        maxLevels: 5,

        icon: "white",
    },
    {
        id: "evade_extender",
        shortId: 46,
        name: "Evade Extender",
        maxLevels: 3,

        icon: "lightblue",
    },
    {
        id: "evade_window",
        shortId: 47,
        name: "Evade Window",
        maxLevels: 5,

        icon: "lightblue",
    },
    {
        id: "flinch_free",
        shortId: 48,
        name: "Flinch Free",
        maxLevels: 3,

        icon: "grey",
    },
    {
        id: "focus",
        shortId: 49,
        name: "Focus",
        maxLevels: 3,

        icon: "white",
    },
    {
        id: "fortify",
        shortId: 50,
        name: "Fortify",
        maxLevels: 1,

        icon: "orange",
    },
    {
        id: "free_meal",
        shortId: 51,
        name: "Free Meal",
        maxLevels: 3,

        icon: "brown",
    },
    {
        id: "geologist",
        shortId: 52,
        name: "Geologist",
        maxLevels: 3,

        icon: "brown",
    },
    {
        id: "good_luck",
        shortId: 53,
        name: "Good Luck",
        maxLevels: 3,

        icon: "yellow",
    },
    {
        id: "guard",
        shortId: 54,
        name: "Guard",
        maxLevels: 5,

        icon: "grey",
    },
    {
        id: "guard_up",
        shortId: 55,
        name: "Guard Up",
        maxLevels: 3,

        icon: "white",
    },
    {
        id: "handicraft",
        shortId: 56,
        name: "Handicraft",
        maxLevels: 5,

        icon: "darkblue",
    },
    {
        id: "hellfire_cloak",
        shortId: 57,
        name: "Hellfire Cloak",
        maxLevels: 4,

        icon: "purple",
    },
    {
        id: "heroics",
        shortId: 58,
        name: "Heroics",
        maxLevels: 5,

        icon: "red",
    },
    {
        id: "horn_maestro",
        shortId: 59,
        name: "Horn Maestro",
        maxLevels: 1,

        icon: "green",
    },
    {
        id: "hunger_resistance",
        shortId: 60,
        name: "Hunger Resistance",
        maxLevels: 3,

        icon: "gold",
    },
    {
        id: "item_prolonger",
        shortId: 61,
        name: "Item Prolonger",
        maxLevels: 3,

        icon: "brown",
    },
    {
        id: "jump_master",
        shortId: 62,
        name: "Jump Master",
        maxLevels: 1,

        icon: "blue",
    },
    {
        id: "kushala_blessing",
        shortId: 63,
        name: "Kushala Blessing",
        maxLevels: 4,

        icon: "grey",
    },
    {
        id: "latent_power",
        shortId: 64,
        name: "Latent Power",
        maxLevels: 5,

        icon: "pink",
    },
    {
        id: "leap_of_faith",
        shortId: 65,
        name: "Leap Of Faith",
        maxLevels: 1,

        icon: "lightblue",
    },
    {
        id: "load_shells",
        shortId: 66,
        name: "Load Shells",
        maxLevels: 2,

        icon: "grey",
    },
    {
        id: "marathon_runner",
        shortId: 67,
        name: "Marathon Runner",
        maxLevels: 3,

        icon: "gold",
    },
    {
        id: "master_mounter",
        shortId: 68,
        name: "Master Mounter",
        maxLevels: 1,

        icon: "blue",
    },
    {
        id: "masters_touch",
        shortId: 69,
        name: "Master's Touch",
        maxLevels: 3,

        icon: "white",
    },
    {
        id: "maximum_might",
        shortId: 70,
        name: "Maximum Might",
        maxLevels: 3,

        icon: "pink",
    },
    {
        id: "minds_eye",
        shortId: 71,
        name: "Mind's Eye",
        maxLevels: 3,

        icon: "white",
    },
    {
        id: "muck_resistance",
        shortId: 72,
        name: "Muck Resistance",
        maxLevels: 2,

        icon: "grey",
    },
    {
        id: "mushroomancer",
        shortId: 73,
        name: "Mushroomancer",
        maxLevels: 3,

        icon: "purple",
    },
    {
        id: "normal_rapid_up",
        shortId: 74,
        name: "Normal/Rapid Up",
        maxLevels: 3,

        icon: "white",
    },
    {
        id: "offensive_guard",
        shortId: 75,
        name: "Offensive Guard",
        maxLevels: 3,

        icon: "purple",
    },
    {
        id: "partbreaker",
        shortId: 76,
        name: "Partbreaker",
        maxLevels: 3,

        icon: "grey",
    },
    {
        id: "peak_performance",
        shortId: 77,
        name: "Peak Performance",
        maxLevels: 3,

        icon: "red",
    },
    {
        id: "pierce_up",
        shortId: 78,
        name: "Pierce Up",
        maxLevels: 3,

        icon: "blue",
    },
    {
        id: "power_prolonger",
        shortId: 79,
        name: "Power Prolonger",
        maxLevels: 3,

        icon: "brown",
    },
    {
        id: "protective_polish",
        shortId: 80,
        name: "Protective Polish",
        maxLevels: 3,

        icon: "yellow",
    },
    {
        id: "punishing_draw",
        shortId: 81,
        name: "Punishing Draw",
        maxLevels: 3,

        icon: "yellow",
    },
    {
        id: "quick_sheath",
        shortId: 82,
        name: "Quick Sheath",
        maxLevels: 3,

        icon: "brown",
    },
    {
        id: "rapid_fire_up",
        shortId: 83,
        name: "Rapid Fire Up",
        maxLevels: 3,

        icon: "white",
    },
    {
        id: "rapid_morph",
        shortId: 84,
        name: "Rapid Morph",
        maxLevels: 3,

        icon: "blue",
    },
    {
        id: "razor_sharp",
        shortId: 85,
        name: "Razor Sharp",
        maxLevels: 3,

        icon: "yellow",
    },
    {
        id: "recoil_down",
        shortId: 86,
        name: "Recoil Down",
        maxLevels: 3,

        icon: "brown",
    },
    {
        id: "recovery_speed",
        shortId: 87,
        name: "Recovery Speed",
        maxLevels: 3,

        icon: "green",
    },
    {
        id: "recovery_up",
        shortId: 88,
        name: "Recovery Up",
        maxLevels: 3,

        icon: "green",
    },
    {
        id: "reload_speed",
        shortId: 89,
        name: "Reload Speed",
        maxLevels: 3,

        icon: "white",
    },
    {
        id: "resentment",
        shortId: 90,
        name: "Resentment",
        maxLevels: 5,

        icon: "orange",
    },
    {
        id: "resuscitate",
        shortId: 91,
        name: "Resuscitate",
        maxLevels: 3,

        icon: "orange",
    },
    {
        id: "slugger",
        shortId: 92,
        name: "Slugger",
        maxLevels: 3,

        icon: "yellow",
    },
    {
        id: "spare_shot",
        shortId: 93,
        name: "Spare Shot",
        maxLevels: 3,

        icon: "yellow",
    },
    {
        id: "special_ammo_boost",
        shortId: 94,
        name: "Special Ammo Boost",
        maxLevels: 2,

        icon: "grey",
    },
    {
        id: "speed_eating",
        shortId: 95,
        name: "Speed Eating",
        maxLevels: 3,

        icon: "gold",
    },
    {
        id: "speed_sharpening",
        shortId: 96,
        name: "Speed Sharpening",
        maxLevels: 3,

        icon: "yellow",
    },
    {
        id: "spread_up",
        shortId: 97,
        name: "Spread Up",
        maxLevels: 3,

        icon: "grey",
    },
    {
        id: "stamina_surge",
        shortId: 98,
        name: "Stamina Surge",
        maxLevels: 3,

        icon: "gold",
    },
    {
        id: "stamina_thief",
        shortId: 99,
        name: "Stamina Thief",
        maxLevels: 3,

        icon: "darkblue",
    },
    {
        id: "steadiness",
        shortId: 100,
        name: "Steadiness",
        maxLevels: 2,

        icon: "grey",
    },
    {
        id: "stormsoul",
        shortId: 101,
        name: "Stormsoul",
        maxLevels: 5,

        icon: "orange",
    },
    {
        id: "stun_resistance",
        shortId: 102,
        name: "Stun Resistance",
        maxLevels: 3,

        icon: "yellow",
    },
    {
        id: "teostra_blessing",
        shortId: 103,
        name: "Teostra Blessing",
        maxLevels: 4,

        icon: "red",
    },
    {
        id: "thunder_alignment",
        shortId: 104,
        name: "Thunder Alignment",
        maxLevels: 5,

        icon: "yellow",
    },
    {
        id: "tremor_resistance",
        shortId: 105,
        name: "Tremor Resistance",
        maxLevels: 3,

        icon: "grey",
    },
    {
        id: "wall_runner",
        shortId: 106,
        name: "Wall Runner",
        maxLevels: 3,

        icon: "green",
    },
    {
        id: "weakness_exploit",
        shortId: 107,
        name: "Weakness Exploit",
        maxLevels: 3,

        icon: "pink",
    },
    {
        id: "wide_range",
        shortId: 108,
        name: "Wide Range",
        maxLevels: 5,

        icon: "white",
    },
    {
        id: "wind_alignment",
        shortId: 109,
        name: "Wind Alignment",
        maxLevels: 5,

        icon: "lightblue",
    },
    {
        id: "windproof",
        shortId: 110,
        name: "Windproof",
        maxLevels: 3,

        icon: "white",
    },
    {
        id: "wirebug_whisperer",
        shortId: 111,
        name: "Wirebug Whisperer",
        maxLevels: 3,

        icon: "lightblue",
    },
];

const skillMap = new Map<string, SkillRO>();
const skillMapShortIds = new Map<number, SkillRO>();

for (const obj of hardcodedSkills) {

    const mergeIn = {
        // For convenience, we also attach IDs and filter helpers to each object
        iconImgPath: getImgPath(iconsToImageID[obj.icon]),

        // We will also convert the icon string to an icon image path.
        // This will also implicitly check for the icon validity
        filterHelpers: {
            nameLower: toNameFilterString(obj.name),
        },
    } as const;

    const finalObj: SkillRO = {...obj, ...mergeIn}; 

    // Validate
    console.assert(/^[_a-z0-9]+$/.test(finalObj.id));
    console.assert(isPositiveInt(finalObj.shortId));
    console.assert(finalObj.name !== "");
    console.assert(isPositiveInt(finalObj.maxLevels) && (finalObj.maxLevels < 8)); // Change if needed
    console.assert(finalObj.iconImgPath !== "");
    console.assert(finalObj.filterHelpers.nameLower !== "");
    
    // Check for duplicates
    console.assert(!skillMap.has(obj.id));
    console.assert(!skillMapShortIds.has(obj.shortId));

    skillMap.set(finalObj.id, finalObj);
    skillMapShortIds.set(finalObj.shortId, finalObj);
}

const finalSkillMap = new FrozenMap<string, SkillRO>(skillMap);
const finalSkillMapShortIds = new FrozenMap<number, SkillRO>(skillMapShortIds);

export {
    finalSkillMap as skillMap,
    finalSkillMapShortIds as skillMapShortIds,
};

