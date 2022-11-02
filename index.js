import { deleteField } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-firestore.js";
import { select, get, setChildren, useCollection, useDocument, setDocument, addDocument } from "./lib.js"

const chars = new Map()

function getPartName(part) {
    return part.char ? chars.get(part.char).name : part.name
}

useCollection("rooms", setChildren("rooms", ([id, room]) => {
    let el = document.createElement("option")
    el.value = id
    el.innerHTML = room.name
    return el
}))

useCollection("chars", setChildren("chars", ([id, char]) => {
    chars.set(id, char)

    let el = document.createElement("option")
    el.value = id
    el.innerHTML = char.name
    return el
}))

useCollection(`rooms.#room.parts`, setChildren("parts", ([id, part]) => {
    let el = document.createElement("li")
    el.innerHTML = getPartName(part)
    el.onclick = () => select(["part", id])
    return el 
}))

const partTypeEl = document.getElementById("part-type")
const partNameEl = document.getElementById("part-name")
const partCharEl = document.getElementById("part-char")

partNameEl.oninput = () => setDocument('rooms.#room.parts.#part', { name: partNameEl.value })

partCharEl.onchange = () => setDocument('rooms.#room.parts.#part', { char: partCharEl.value })

partTypeEl.onchange = () => setDocument('rooms.#room.parts.#part',
    partTypeEl.value === "char" ? {
        name: deleteField(),
        char: get("#char")
    } : {
        name: "",
        char: deleteField()
    }
)

useDocument(`rooms.#room.parts.#part`, (part) => {
    if (part.char) {
        partTypeEl.value = "char"
        partCharEl.style.display = "flex"
        partNameEl.style.display = "none"
    } else {
        partTypeEl.value = "misc"
        
        partNameEl.style.display = "flex"
        partCharEl.style.display = "none"
    }
    
    partNameEl.value = getPartName(part)
}, () => {
    partTypeEl.value = "misc"
    partNameEl.style.display = "none"
    partCharEl.style.display = "none"
})

document.getElementById("rooms").onchange = () =>
    select(
        ["room", document.getElementById("rooms").value],
        ["part", null]
    )

document.getElementById("chars").onchange = () =>
    select(
        ["char", document.getElementById("chars").value]
    )


document.getElementById('add-part').onclick = () => {
    addDocument("rooms.#room.parts", {
        name: ""
    })
}