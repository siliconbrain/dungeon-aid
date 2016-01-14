import Rx from "rx";
import Cycle from "@cycle/core";
import {article, div, header, img, input, label, makeDOMDriver, section, span} from "@cycle/dom";
import isolate from "@cycle/isolate";
import storageDriver from "@cycle/storage";

import {makeCharacter} from "./character.es6";

function loadState(storage) {
    const defaultState = {
        character: {
            name: "",
            level: 1,
            class_: null,
            race: null,
            abilities: {
                strength: {
                    base: null
                },
                dexterity: {
                    base: null
                },
                constitution: {
                    base: null
                },
                intelligence: {
                    base: null
                },
                wisdom: {
                    base: null
                },
                charisma: {
                    base: null
                }
            }
        }
    };
    return storage.local
        .getItem("character")
        .map(JSON.parse)
        .map(data => data === null ? defaultState : {
            character: {
                name: data.name || defaultState.character.name,
                level: data.level || defaultState.character.level,
                class_: data.class_ || defaultState.character.class_,
                race: data.race || defaultState.character.race,
                abilities: {
                    strength: {
                        base: data.strengthBase || defaultState.character.abilities.strength.base
                    },
                    dexterity: {
                        base: data.dexterityBase || defaultState.character.abilities.dexterity.base
                    },
                    constitution: {
                        base: data.constitutionBase || defaultState.character.abilities.constitution.base
                    },
                    intelligence: {
                        base: data.intelligenceBase || defaultState.character.abilities.intelligence.base
                    },
                    wisdom: {
                        base: data.wisdomBase || defaultState.character.abilities.wisdom.base
                    },
                    charisma: {
                        base: data.charismaBase || defaultState.character.abilities.charisma.base
                    }
                }
            }
        });
}

function toCharacter(state) {
    return makeCharacter({
        name: state.character.name,
        level: state.character.level,
        class_: state.character.class_,
        race: state.character.race,
        abilities: {
            strengthBase: state.character.abilities.strength.base,
            dexterityBase: state.character.abilities.dexterity.base,
            constitutionBase: state.character.abilities.constitution.base,
            intelligenceBase: state.character.abilities.intelligence.base,
            wisdomBase: state.character.abilities.wisdom.base,
            charismaBase: state.character.abilities.charisma.base
        }
    });
}

function toPresentable(storedState$) {  // TODO: better function name?
    return storedState$.map(toCharacter);
}

function presentAbility(ability, name) {
    return div(".ability." + name.toLowerCase(), [
        label(name),
        input(".base", {type: "number", min: "3", max: "18", value: String(ability.base)}),
        label(".effective", String(ability.value)),
        label(".modifier", (ability.mod > 0 ? "+" : "") + ability.mod)
    ]);
}

function present(state$) {
    return state$.map(state =>
        article(".character-sheet", [
            header([
                div(".title", "Character Sheet"),
                img(".character.picture", {src: "http://www.gravatar.com/avatar/c666018cb380c0b6680f7cdfdb00539a?size=150"}),  // TODO: let user customize image
                div([
                    span(".character.name", state.name),
                    span(".character.level", "Level " + state.level),
                    span(".character.race", "human"),
                    span(".character.class", "sorcerer")
                ])
            ]),
            section([
                div([
                    label("Name"),
                    input(".character.name", {type: "text", value: state.name})
                ]),
                div([
                    label("Level"),
                    input(".character.level", {type: "number", min: "1", max: "9", value: String(state.level)})
                ])
            ]),
            section(".abilities", [
                header("Abilities"),
                presentAbility(state.abilities.strength, "Strength"),
                presentAbility(state.abilities.dexterity, "Dexterity"),
                presentAbility(state.abilities.constitution, "Constitution"),
                presentAbility(state.abilities.intelligence, "Intelligence"),
                presentAbility(state.abilities.wisdom, "Wisdom"),
                presentAbility(state.abilities.charisma, "Charisma")
            ])
        ]));
}

function observe(vtree) {
    const name$ = vtree.select(".character.name").events("input").map(ev => ev.target.value).startWith(null);
    const level$ = vtree.select(".character.level").events("change").map(ev => Number(ev.target.value)).startWith(null);
    const strength$ = vtree.select(".strength").select(".base").events("change").map(ev => Number(ev.target.value)).startWith(null);
    const dexterity$ = vtree.select(".dexterity").select(".base").events("change").map(ev => Number(ev.target.value)).startWith(null);
    const constitution$ = vtree.select(".constitution").select(".base").events("change").map(ev => Number(ev.target.value)).startWith(null);
    const intelligence$ = vtree.select(".intelligence").select(".base").events("change").map(ev => Number(ev.target.value)).startWith(null);
    const wisdom$ = vtree.select(".wisdom").select(".base").events("change").map(ev => Number(ev.target.value)).startWith(null);
    const charisma$ = vtree.select(".charisma").select(".base").events("change").map(ev => Number(ev.target.value)).startWith(null);
    return Rx.Observable.combineLatest(name$, level$, strength$, dexterity$, constitution$, intelligence$, wisdom$, charisma$,
        (name, level, strength, dexterity, constitution, intelligence, wisdom, charisma) => ({
            name,
            level,
            abilities: {
                strength: {
                    base: strength
                },
                dexterity: {
                    base: dexterity
                },
                constitution: {
                    base: constitution
                },
                intelligence: {
                    base: intelligence
                },
                wisdom: {
                    base: wisdom
                },
                charisma: {
                    base: charisma
                }
            }
        }))
        .skip(1);  // skip initial nulls
}

function toPersistable({observedState$, storedState$}) {  // TODO: better function name
    return observedState$.withLatestFrom(storedState$, (observedState, storedState) => ({
        character: {
            name: observedState.name === null ? storedState.character.name : observedState.name,
            level: observedState.level === null ? storedState.character.level : observedState.level,
            class_: storedState.character.class_,
            race: storedState.character.race,
            abilities: {
                strength: {
                    base: observedState.abilities.strength.base === null ? storedState.character.abilities.strength.base : observedState.abilities.strength.base
                },
                dexterity: {
                    base: observedState.abilities.dexterity.base === null ? storedState.character.abilities.dexterity.base : observedState.abilities.dexterity.base
                },
                constitution: {
                    base: observedState.abilities.constitution.base === null ? storedState.character.abilities.constitution.base : observedState.abilities.constitution.base
                },
                intelligence: {
                    base: observedState.abilities.intelligence.base === null ? storedState.character.abilities.intelligence.base : observedState.abilities.intelligence.base
                },
                wisdom: {
                    base: observedState.abilities.wisdom.base === null ? storedState.character.abilities.wisdom.base : observedState.abilities.wisdom.base
                },
                charisma: {
                    base: observedState.abilities.charisma.base === null ? storedState.character.abilities.charisma.base : observedState.abilities.charisma.base
                }
            }
        }
    }));
}

function saveState(state$) {
    return state$
        .map(state => ({
            name: state.character.name,
            level: state.character.level,
            class_: state.character.class_,
            race: state.character.race,
            strengthBase: state.character.abilities.strength.base,
            dexterityBase: state.character.abilities.dexterity.base,
            constitutionBase: state.character.abilities.constitution.base,
            intelligenceBase: state.character.abilities.intelligence.base,
            wisdomBase: state.character.abilities.wisdom.base,
            charismaBase: state.character.abilities.charisma.base
        }))
        .map(JSON.stringify)
        .map(value => ({
            key: "character",
            target: "local",
            value
        }));
}

function main({vtree, storage}) {
    const storedState$ = loadState(storage);
    return {
        vtree: present(toPresentable(storedState$)),
        storage: saveState(toPersistable({observedState$: observe(vtree), storedState$}))
    };
}

Cycle.run(main, {
    vtree: makeDOMDriver("#app"),
    storage: storageDriver
});