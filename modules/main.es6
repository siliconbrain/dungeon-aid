import Rx from "rx";
import Cycle from "@cycle/core";
import {a, article, div, footer, header, img, input, label, makeDOMDriver, option, section, select, span} from "@cycle/dom";
import isolate from "@cycle/isolate";
import storageDriver from "@cycle/storage";

import {classes, makeCharacter, races} from "./character.es6";

function loadState(storage) {
    const defaultState = {
        character: {
            abilities: {
                strengthBase: null,
                dexterityBase: null,
                constitutionBase: null,
                intelligenceBase: null,
                wisdomBase: null,
                charismaBase: null,
            },
            age: null,
            alignment: null,
            classes: [],
            experience: 0,
            feats: null,
            gender: null,
            log: [],
            name: "",
            notes: null,  // TODO: figure out default value for notes
            race: null,
        }
    };
    return storage.local
        .getItem("character")
        .map(JSON.parse)
        .map(data => data === null ? defaultState : {
            character: {
                abilities: {
                    strengthBase: data.strengthBase || defaultState.character.abilities.strengthBase,
                    dexterityBase: data.dexterityBase || defaultState.character.abilities.dexterityBase,
                    constitutionBase: data.constitutionBase || defaultState.character.abilities.constitutionBase,
                    intelligenceBase: data.intelligenceBase || defaultState.character.abilities.intelligenceBase,
                    wisdomBase: data.wisdomBase || defaultState.character.abilities.wisdomBase,
                    charismaBase: data.charismaBase || defaultState.character.abilities.charismaBase,
                },
                age: data.age || defaultState.character.age,
                alignment: data.alignment || defaultState.character.alignment,
                classes: data.classes || defaultState.character.classes,
                experience: data.experience || defaultState.character.experience,
                feats: data.feats || defaultState.character.feats,
                gender: data.gender || defaultState.character.gender,
                log: data.log || defaultState.character.log,
                name: data.name || defaultState.character.name,
                notes: data.notes || defaultState.character.notes,
                race: data.race || defaultState.character.race,
            }
        });
}

function toPresentable({storedState$, action$}) {  // TODO: better function name?
    return Rx.Observable.combineLatest(storedState$, action$.filter(action => !action.verb.startsWith("set")).startWith({}), (storedState, action) => ({
            editingName: action.verb == "editName",
            editingRace: action.verb == "editRace",
            editingClass: action.verb == "editClass",
            character: makeCharacter(storedState.character),
        }));
}

function presentAbility(ability, name) {
    return div(".ability." + name.toLowerCase(), [
        div([
            span(".score", String(ability.score)),
            span(".modifier" + (ability.mod > 0 ? ".bonus" : ability.mod < 0 ? ".penalty" : ""), String(Math.abs(ability.mod))),
            input(".base", {type: "number", min: "3", max: "18", value: String(ability.base)}),
        ]),
        label(name),
    ]);
}

function presentCharacterName(character, editing) {
    return span(".character.name", editing
        ? input(".request-focus", {type: "text", value: character.name})
        : [span(".text" + (character.name ? "" : ".unknown"), character.name), span(".edit.fa.fa-pencil")]);
}

function presentRaceSelector(character) {
    const options = [option({value: ""}, "---")];
    for (let race in races) {
        if (races.hasOwnProperty(race)) {
            options.push(option((character.race == race ? {selected: true} : {}), race));
        }
    }
    return select(".request-focus", options);
}

function presentCharacterRace(character, editing) {
    return span(".character.race", editing
        ? presentRaceSelector(character)
        : [span(".text" + (character.race ? "" : ".unknown"), character.race), span(".edit.fa.fa-pencil")]);
}

function presentClassSelector(character) {
    const primaryClass = character.classes[0];
    const options = [option({value: ""}, "---")];
    for (let class_ in classes) {
        if (classes.hasOwnProperty(class_)) {
            options.push(option((primaryClass == class_ ? {selected: true, value: class_} : {value: class_}), class_));
        }
    }
    return select(".request-focus", options);
}

function presentCharacterClass(character, editing=false) {
    return span(".character.class", editing
        ? presentClassSelector(character)
        : [span(".text" + (character.classes[0] ? "" : ".unknown"), character.classes[0]), span(".edit.fa.fa-pencil")]);
}

function present(state$) {
    return state$.map(state =>
        article(".character-sheet", [
            header([
                div(".title", "Character Sheet"),
                img(".character.picture", {src: "http://www.gravatar.com/avatar/c666018cb380c0b6680f7cdfdb00539a?size=150"}),  // TODO: let user customize image
                div([
                    div(presentCharacterName(state.character, state.editingName)),
                    div([
                        span(".character.level", "Level " + state.character.level),
                        presentCharacterRace(state.character, state.editingRace),
                        presentCharacterClass(state.character, state.editingClass),
                    ]),
                ]),
            ]),
            section([
                div(".character.experience", [
                    label("XP"),
                    input({type: "number", min: "0", value: String(state.character.experience)})
                ]),
            ]),
            section(".abilities", [
                header("Abilities"),
                presentAbility(state.character.abilities.strength, "Strength"),
                presentAbility(state.character.abilities.dexterity, "Dexterity"),
                presentAbility(state.character.abilities.constitution, "Constitution"),
                presentAbility(state.character.abilities.intelligence, "Intelligence"),
                presentAbility(state.character.abilities.wisdom, "Wisdom"),
                presentAbility(state.character.abilities.charisma, "Charisma"),
            ]),
            footer([
                a(".export.fa.fa-save", { href: "#" }, span("Export")),
            ]),
        ]));
}

function observe(vtree) {
    const editName$ = vtree.select(".character.name").select(".edit").events("click").map(ev => ({ verb: "editName" }));
    const cancelNameEditing$ = vtree.select(".character.name").select("input").events("blur").map(ev => ({ verb: "cancelNameEditing" }));
    const changeName$ = vtree.select(".character.name").select("input").events("change").map(ev => ({ verb: "setName", value: ev.target.value.trim() }));
    const editRace$ = vtree.select(".character.race").select(".edit").events("click").map(ev => ({ verb: "editRace"}));
    const cancelRaceEditing$ = vtree.select(".character.race").select("select").events("blur").map(ev => ({ verb: "cancelRaceEditing" }));
    const changeRace$ = vtree.select(".character.race").select("select").events("change").map(ev => ({ verb: "setRace", value: ev.target.value }));
    const editClass$ = vtree.select(".character.class").select(".edit").events("click").map(ev => ({ verb: "editClass" }));
    const cancelClassEditing$ = vtree.select(".character.class").select("select").events("blur").map(ev => ({ verb: "cancelClassEditing" }));
    const changeClass$ = vtree.select(".character.class").select("select").events("change").map(ev => ({ verb: "setClass", value: ev.target.value }));
    const changeExperience$ = vtree.select(".character.experience").select("input").events("change").map(ev => ({ verb: "setExperience", value: Number(ev.target.value) }));
    const changeStrength$ = vtree.select(".strength").select(".base").events("change").map(ev => ({ verb: "setStrength", value: Number(ev.target.value) }));
    const changeDexterity$ = vtree.select(".dexterity").select(".base").events("change").map(ev => ({ verb: "setDexterity", value: Number(ev.target.value) }));
    const changeConstitution$ = vtree.select(".constitution").select(".base").events("change").map(ev => ({ verb: "setConstitution", value: Number(ev.target.value) }));
    const changeIntelligence$ = vtree.select(".intelligence").select(".base").events("change").map(ev => ({ verb: "setIntelligence", value: Number(ev.target.value) }));
    const changeWisdom$ = vtree.select(".wisdom").select(".base").events("change").map(ev => ({ verb: "setWisdom", value: Number(ev.target.value) }));
    const changeCharisma$ = vtree.select(".charisma").select(".base").events("change").map(ev => ({ verb: "setCharisma", value: Number(ev.target.value) }));
    const exportCharacter$ = vtree.select(".export").events("click").map(ev => ({ verb: "exportCharacter" }));
    return Rx.Observable.merge(
        editName$,
        cancelNameEditing$,
        changeName$,
        editRace$,
        cancelRaceEditing$,
        changeRace$,
        editClass$,
        cancelClassEditing$,
        changeClass$,
        changeExperience$,
        changeStrength$,
        changeDexterity$,
        changeConstitution$,
        changeIntelligence$,
        changeWisdom$,
        changeCharisma$,
        exportCharacter$
    ).do(action => console.log(action));
}

function toPersistable({storedState$, action$}) {  // TODO: better function name
    return action$.withLatestFrom(storedState$, (action, storedState) => ({
        character: {
            abilities: {
                strengthBase: action.verb == "setStrength" ? action.value : storedState.character.abilities.strengthBase,
                dexterityBase: action.verb == "setDexterity" ? action.value : storedState.character.abilities.dexterityBase,
                constitutionBase: action.verb == "setConstitution" ? action.value : storedState.character.abilities.constitutionBase,
                intelligenceBase: action.verb == "setIntelligence" ? action.value : storedState.character.abilities.intelligenceBase,
                wisdomBase: action.verb == "setWisdom" ? action.value : storedState.character.abilities.wisdomBase,
                charismaBase: action.verb == "setCharisma" ? action.value : storedState.character.abilities.charismaBase,
            },
            age: storedState.character.age,
            alignment: storedState.character.alignment,
            classes: action.verb == "setClass" ? [action.value] : storedState.character.classes,
            experience: action.verb == "setExperience" ? action.value : storedState.character.experience,
            feats: storedState.character.feats,
            gender: storedState.character.gender,
            log: storedState.character.log,
            name: action.verb == "setName" ? action.value : storedState.character.name,
            notes: storedState.character.notes,
            race: action.verb == "setRace" ? action.value : storedState.character.race,
        }
    }));
}

function saveState(state$) {
    return state$
        .map(state => ({
            age: state.character.age,
            alignment: state.character.alignment,
            classes: state.character.classes,
            experience: state.character.experience,
            feats: state.character.feats,
            gender: state.character.gender,
            log: state.character.log,
            name: state.character.name,
            notes: state.character.notes,
            race: state.character.race,
            // abilities
            strengthBase: state.character.abilities.strengthBase,
            dexterityBase: state.character.abilities.dexterityBase,
            constitutionBase: state.character.abilities.constitutionBase,
            intelligenceBase: state.character.abilities.intelligenceBase,
            wisdomBase: state.character.abilities.wisdomBase,
            charismaBase: state.character.abilities.charismaBase,

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
    const action$ = observe(vtree).share();

    return {
        vtree: present(toPresentable({storedState$, action$})),
        storage: saveState(toPersistable({storedState$, action$})),
        exporter: action$.filter(action => action.verb == "exportCharacter").map(
            () => ({ data: localStorage.character, filename: "character.json" })
        ),
        focuser: vtree.observable,
    };
}

Cycle.run(main, {
    vtree: makeDOMDriver("#app"),
    storage: storageDriver,
    exporter: request$ => {
        request$.subscribe(request => saveAs(new Blob([request.data], {type: request.type || "text/plain;charset=utf-8"}), request.filename));
        return Rx.Observable.never();  // write-only driver
    },
    focuser: vtree$ => {
        // give focus where focus is due
        vtree$.subscribe(() => {
            const element = document.getElementsByClassName("request-focus")[0];
            if (element) {
                element.focus();
                element.classList.remove("request-focus");
            }
        });
        return Rx.Observable.never();  // write-only driver
    },
});