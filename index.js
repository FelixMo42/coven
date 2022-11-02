import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.13.0/firebase-app.js'
import { getFirestore, getDocs, getDoc, doc, collection } from 'https://www.gstatic.com/firebasejs/9.13.0/firebase-firestore.js'

const app = initializeApp({
    apiKey: "AIzaSyAwtEjjtCX8l4vw9s12hzT7fhYIHYEtf0w",
    authDomain: "coven-191a0.firebaseapp.com",
    projectId: "coven-191a0",
    storageBucket: "coven-191a0.appspot.com",
    messagingSenderId: "166090112479",
    appId: "1:166090112479:web:c9313c64c357f44ced986a"
});

const db = getFirestore(app)

function useCollection(name, callback) {
    useName(name, async split => {
        const snapshot = await getDocs(collection(db, ...split))
        callback(snapshot.docs.map((doc) => [doc.id, doc.data()]))
    })
}

async function useDocument(name, callback) {
    useName(name, async split => {
        const snapshot = await getDoc(doc(db, ...split))
        callback(snapshot.docs.map((doc) => [doc.id, doc.data()])) 
    })
}

function useName(name, cb) {
    function isValid(split) {
        return split.every((part) => typeof part === "string")
    }

    function isEqual(a, b) {
        return a.length === b.length && a.every((val, index) => val === b[index])
    }

    let oldSplit = []

    function self() {
        let newSplit = name.split(".").map((part) =>
            part.charAt(0) === "#"
                ? refs.get(part.substring(1))
                : part
        )

        if (isValid(newSplit) && !isEqual(newSplit, oldSplit)) {
            oldSplit = newSplit
            cb(oldSplit)
        }
    }

    cbs.push(self)

    self()
}

function setChildren(id, callback) {
    const root = document.getElementById(id)
    return (pairs) => {
        root.replaceChildren(...pairs.map(callback))
        if (root.onchange) {
            root.onchange(root.children[0].value)
        }
    }
}

let refs = new Map()
let cbs = []

function select(...changes) {
    for (let [name, value] of changes) {
        refs.set(name, value)
    }
    cbs.forEach((cb) => cb(changes))
}

async function main() {
    useCollection("rooms", setChildren("rooms", ([id, room]) => {
        let el = document.createElement("option")
        el.value = id
        el.innerHTML = room.name
        return el
    }))

    useCollection("chars", setChildren("chars", ([id, char]) => {
        let el = document.createElement("option")
        el.value = id
        el.innerHTML = char.name
        return el
    }))

    useCollection(`rooms.#room.parts`, setChildren("parts", ([id, part]) => {
        let el = document.createElement("div")
        el.innerHTML = part.name
        el.onclick = () => select(["part", id])
        return el 
    }))

    // useDocument(`rooms.#room.parts.#part`, () => {

    // })

    document.getElementById("rooms").onchange = () =>
        select(
            ["room", document.getElementById("rooms").value],
            ["part", null]
        )

    document.getElementById("chars").onchange = () =>
        select(
            ["char", document.getElementById("chars").value]
        )
}

main()