import {sum} from "./util.es6"

const Die = (sides) => {
    const die = () => Math.floor(Math.random() * sides + 1.0);
    die.sides = sides;
    die.maxValue = sides;
    return die;
};

const d4 = Die(4);
const d6 = Die(6);
const d8 = Die(8);
const d10 = Die(10);
const d12 = Die(12);
const d20 = Die(20);

/* Abilities:
   ==========
   * Strength (Str)
   * Dexterity (Dex)
   * Constitution (Con)
   * Intelligence (Int)
   * Wisdom (Wis)
   * Charisma (Cha)

 */
const getAbilityModifier = (abilityScore) => Math.floor(Math.max(1, abilityScore) / 2) - 5;
const getBonusSpells = (abilityScore, spellLevel) => spellLevel == 0 ? null : Math.max(0, Math.floor((getAbilityModifier(abilityScore) - spellLevel) / 4) + 1);

const rollAbilityScore = () => new Array(4).fill(d6).map(die => die()).sort().slice(-3).reduce(sum);
const areAbilityScoresTooLow = (scores) => (scores.slice().sort()[5] <= 13 || scores.map(getAbilityModifier).reduce(sum));  // scores: Base scores without racial adjustments.

export const classes = {
    barbarian: {
        abbreviation: "Bbn",
        hitDie: d12,
    },
    bard: {
        abbreviation: "Brd",
        hitDie: d6,
    },
    cleric: {
        abbreviation: "Clr",
        hitDie: d8,
        relatedLanguages: [ "abyssal", "celestial", "infernal" ],
    },
    druid: {
        abbreviation: "Drd",
        hitDie: d8,
        relatedLanguages: [ "sylvan" ],
    },
    fighter: {
        abbreviation: "Ftr",
        hitDie: d10,
    },
    monk: {
        abbreviation: "Mnk",
        hitDie: d8,
    },
    paladin: {
        abbreviation: "Pal",
        hitDie: d10,
    },
    ranger: {
        abbreviation: "Rgr",
        hitDie: d8,
    },
    rogue: {
        abbreviation: "Rog",
        hitDie: d6,
    },
    sorcerer: {
        abbreviation: "Sor",
        hitDie: d4,
    },
    wizard: {
        abbreviation: "Wiz",
        hitDie: d4,
        relatedLanguages: [ "draconic" ],
    }
};

export const races = {
    human: {
        abilityAdjustments: {
            strength: 0,
            dexterity: 0,
            constitution: 0,
            intelligence: 0,
            wisdom: 0,
            charisma: 0,
        },
        favoredClass: null,  // any
        size: "medium",
        baseLandSpeed: 30,  // feet
    },
    dwarf: {
        abilityAdjustments: {
            strength: 0,
            dexterity: 0,
            constitution: +2,
            intelligence: 0,
            wisdom: 0,
            charisma: -2,
        },
        favoredClass: "fighter",
    },
    elf: {
        abilityAdjustments: {
            strength: 0,
            dexterity: +2,
            constitution: -2,
            intelligence: 0,
            wisdom: 0,
            charisma: 0,
        },
        favoredClass: "wizard",
    },
    gnome: {
        abilityAdjustments: {
            strength: -2,
            dexterity: 0,
            constitution: +2,
            intelligence: 0,
            wisdom: 0,
            charisma: 0,
        },
        favoredClass: "bard",
    },
    halfling: {
        abilityAdjustments: {
            strength: -2,
            dexterity: +2,
            constitution: 0,
            intelligence: 0,
            wisdom: 0,
            charisma: 0,
        },
        favoredClass: "rogue",
    },
    "half-elf": {
        abilityAdjustments: {
            strength: 0,
            dexterity: 0,
            constitution: 0,
            intelligence: 0,
            wisdom: 0,
            charisma: 0,
        },
        favoredClass: null,  // any
    },
    "half-orc": {
        abilityAdjustments: {
            strength: +2,
            dexterity: 0,
            constitution: 0,
            intelligence: -2,
            wisdom: 0,
            charisma: -2,
        },
        favoredClass: "barbarian",
    }
};

const getLevel = (experience) => Math.floor((-1 + Math.sqrt(1 + 4 * experience / 500)) / 2) + 1;

const levelUpAt = (currentLevel) => 500 * currentLevel * (currentLevel + 1);

export function makeCharacter({
    abilities: {
        strengthBase,
        dexterityBase,
        constitutionBase,
        intelligenceBase,
        wisdomBase,
        charismaBase,
    },
    age,
    alignment,
    classes: classes_,
    experience,
    feats,
    gender,
    log,
    name,
    notes,
    race,
}) {
    function makeAbility(base, racialAdjustment) {
        return {
            base,
            get score() { return this.base + racialAdjustment; },
            get mod() { return getAbilityModifier(this.score); },
        };
    }
    const abilities = {
        strength: makeAbility(strengthBase, race ? races[race].abilityAdjustments.strength : null),
        dexterity: makeAbility(dexterityBase, race ? races[race].abilityAdjustments.dexterity : null),
        constitution: makeAbility(constitutionBase, race ? races[race].abilityAdjustments.constitution : null),
        intelligence: makeAbility(intelligenceBase, race ? races[race].abilityAdjustments.intelligence : null),
        wisdom: makeAbility(wisdomBase, race ? races[race].abilityAdjustments.wisdom : null),
        charisma: makeAbility(charismaBase, race ? races[race].abilityAdjustments.charisma : null),
    };
    const armorBonus = 0;  // TODO: calc
    const shieldBonus = 0;  // TODO: calc
    const sizeModifier = 0;  // TODO: calc
    const improvedInitiativeFeatModifier = 0;  // TODO: calc
    const baseAttackBonus = 0;  // TODO: calc
    classes_ = classes_.reduce((accu, elem) => classes.hasOwnProperty(elem) ? accu.concat(elem) : accu, []);
    return {
        abilities,
        age,
        alignment,
        armorClass: 10 + armorBonus + shieldBonus + sizeModifier + abilities.dexterity.mod,
        attackBonus: {
            base: baseAttackBonus,
            melee: baseAttackBonus + abilities.strength.mod,
            rangedAttackBonus: baseAttackBonus + abilities.dexterity.mod,
        },
        classes: classes_,
        experience,
        feats,
        gender,
        hitPoints: classes_.length ? classes[classes_[0]].hitDie.maxValue : null,  // TODO: additional hit points from level ups
        initiative: abilities.dexterity.mod + improvedInitiativeFeatModifier,
        level: getLevel(experience),
        name,
        race,
        savingThrows: {
            fortitude: 0,  // TODO: class + Con mod
            reflex: 0,  // TODO: class + Dex mod
            will: 0,  // TODO: class + Wis mod
        },
        skillPoints: 0,  // TODO: class + Int mod; pg. 62
    };
}

