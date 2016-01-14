const Die = (sides) => () => Math.floor(Math.random() * sides + 1.0);

const d6 = Die(6);

const rollAbility = () => new Array(4).fill(d6).map(die => die()).sort().slice(-3).reduce((accu, elem) => accu + elem);

const classes = {
    barbarian: {},
    bard: {},
    cleric: {},
    druid: {},
    fighter: {},
    monk: {},
    paladin: {},
    ranger: {},
    rogue: {},
    sorcerer: {},
    wizard: {}
};

const races = {
    human: {},
    dwarf: {},
    elf: {},
    gnome: {},
    halfling: {},
    half_elf: {},
    half_orc: {}
};

function getAbilityModifier(abilityValue) {
    return Math.floor(Math.max(abilityValue, 1) / 2) - 5;
}

function applyRacialAbilityAdjustment(race, abilityBaseValue) {
    return abilityBaseValue;  // TODO: apply race
}

export function makeCharacter({
    name,
    level,
    class_,
    race,
    abilities: {
        strengthBase,
        dexterityBase,
        constitutionBase,
        intelligenceBase,
        wisdomBase,
        charismaBase
        }
    }) {

    function makeAbility(base) {
        return {
            base: base,
            value: applyRacialAbilityAdjustment(race, base),
            mod: getAbilityModifier(applyRacialAbilityAdjustment(race, base))
        };
    }

    return {
        name,
        level,
        class_,
        race,
        abilities: {
            strength: makeAbility(strengthBase),
            dexterity: makeAbility(dexterityBase),
            constitution: makeAbility(constitutionBase),
            intelligence: makeAbility(intelligenceBase),
            wisdom: makeAbility(wisdomBase),
            charisma: makeAbility(charismaBase)
        }
    };
}

