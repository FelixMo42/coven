
let nodes = [
    {
        "id": 0,
        "author": "Vincent",
        "text": "How are \nyou doing?",
        "paths": [
            "dedff9d0-12b2-466f-aeac-87c6cb028777",
            "b8f1ccb0-581a-4079-998e-9b0c28b7f2b5"
        ],
        "x": 337.5,
        "y": 62.5
    },
    {
        "id": "dedff9d0-12b2-466f-aeac-87c6cb028777",
        "author": "Phage",
        "text": "Bla bla bla",
        "paths": [
            "b622b79e-49ed-4f6f-b661-014a573a42bc"
        ],
        "x": 262.5,
        "y": 162.5
    },
    {
        "id": "b8f1ccb0-581a-4079-998e-9b0c28b7f2b5",
        "author": "Phage",
        "text": "This is pretty cool",
        "paths": [
            "6df41bbb-98b4-46db-9a6a-ba96110c22ed"
        ],
        "x": 412.5,
        "y": 162.5
    },
    {
        "id": "b622b79e-49ed-4f6f-b661-014a573a42bc",
        "author": "Vincent",
        "text": "How dare you!",
        "paths": [
            "614fa322-5a4d-4645-9b30-e27318722ffa"
        ],
        "x": 262.5,
        "y": 262.5
    },
    {
        "id": "6df41bbb-98b4-46db-9a6a-ba96110c22ed",
        "author": "Vincent",
        "text": "No, its not",
        "paths": [
            "614fa322-5a4d-4645-9b30-e27318722ffa"
        ],
        "x": 412.5,
        "y": 262.5
    },
    {
        "id": "614fa322-5a4d-4645-9b30-e27318722ffa",
        "author": "Phage",
        "text": "Hell ya",
        "paths": [
            "f049c3de-6c7d-42b0-989d-af23cf237532"
        ],
        "x": 337.5,
        "y": 362.5
    },
    {
        "id": "f049c3de-6c7d-42b0-989d-af23cf237532",
        "author": "Vincent",
        "text": "Good by",
        "paths": [],
        "x": 337.5,
        "y": 462.5
    }
]

let player = "Phage"

const graph = document.querySelector("#graph")

//

function goToParent() {
    for (const node of nodes) {
        if (node.paths.includes(getNode(selected).id)) {
            return select(node)
        }
    }
}

function addResponse(node) {
    let new_id = crypto.randomUUID()

    nodes.push({
        id: new_id,
        author: player,
        text: "",
        paths: [],
        x: Math.max(...node.paths.map(id => getNode(id).x + NODE_WIDTH + 25), node.x),
        y: node.y + NODE_HEIGHT + 25
    })

    node.paths.push(new_id)

    select(getNode(new_id))
}

//

function* draw() {
    for (const node of nodes) {
        yield NodeView({
            node,
        })

        for (let path of node.paths) {
            yield PathView({
                a: node,
                b: getNode(path)
            })
        }
    }
}

let selected = 0;

const NODE_WIDTH = 125
const NODE_HEIGHT = 75

function angle(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1)
}

function dist(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
}

//

function PathView({ a, b }) {
    const view = document.createElement("div")

    view.className = "path"

    let x1 = a.x + NODE_WIDTH / 2
    let y1 = a.y + NODE_HEIGHT - 3

    let x2 = b.x + NODE_WIDTH / 2
    let y2 = b.y

    view.style.top = `${y1 + camera.y}px`

    view.style.left = `${x1 + camera.x}px`
    view.style.width = `${dist(x1, y1, x2, y2)}px`

    view.style.transform = `rotate(${angle(x1, y1, x2, y2)}rad)`

    view.style.path = `path()`

    return view
}

function NodeView({ node }) {
    const view = document.createElement("div")

    view.id = node.id
    view.tabIndex = node.id

    view.className = "node"
    view.innerHTML = `<b>${node.author}</b>\n${node.text}`

    view.style.left = `${node.x + camera.x}px`
    view.style.top = `${node.y + camera.y}px`
    view.style.border = selected == node.id ? '1px blue solid' : 'none'

    view.onkeydown = (e) => {
        if (e.key == "Backspace") {
            goToParent()
            removeNode(node)
            update()
        }
    }

    view.onmousedown = (e) => {
        mouse.isDown = true
        
        if (e.shiftKey) {
            mouse.onclick = (e) => {
                if (getNode(selected).paths.includes(node.id)) {
                    getNode(selected).paths.splice(
                        getNode(selected).paths.findIndex(({id}) => id == node.id),
                        1
                    )
                } else {
                    getNode(selected).paths.push(node.id)
                }
                update()
            } 
        } else {

            let ox = node.x - e.x
            let oy = node.y - e.y

            mouse.onmove = (e) => {
                node.x = e.x + ox
                node.y = e.y + oy
                update()
            }

            mouse.ondone = (e) => {
                node.x = (e.x + ox) - (e.x + ox) % 25 + 25 / 2
                node.y = (e.y + oy) - (e.y + oy) % 25 + 25 / 2
                update()
            }

            mouse.onclick = (e) => {
                select(node)
            }
    }

        e.stopPropagation()
    }

    return view
}

//

function BackAreaView() {
    const view = document.createElement("div")
    view.className = "back"
    view.innerHTML = "< back"
    view.onclick = goToParent
    return view
}

function ConvoView(node) {
    const view = document.createElement("div")
    view.replaceChildren(
        AuthorView(node),
        TextView(node),
        AddButton(node) 
    )
    return view 
}

function AuthorView(node) {
    const view = document.createElement("input")
    view.className = "author"
    view.value = node.author
    view.oninput = () => {
        node.author = view.value
        update()
    }
    return view
}

function TextView(node) {
    const view = document.createElement("div")
    view.className = "text"
    view.innerHTML = node.text
    view.contentEditable = true

    view.oninput = () => {
        // save the new value
        node.text = getInnerHtml(view)
    
        // update
        update()
    }
    
    return view
}

function getInnerHtml(view) {
    // https://stephenhaney.com/2020/get-contenteditable-plaintext-with-correct-linebreaks

    let newValue = ""
    let isOnFreshLine = true

    function parseChildNodesForValueAndLines(childNodes) {
        for (let i = 0; i < childNodes.length; i++) {
            const childNode = childNodes[i];
            if (childNode.nodeName === 'BR') {
                newValue += '\n';
                isOnFreshLine = true;
                continue;
            }
            if (childNode.nodeName === 'DIV' && isOnFreshLine === false) {
                newValue += '\n';
            }
            isOnFreshLine = false;
            if (childNode.nodeType === 3 && childNode.textContent) {
                newValue += childNode.textContent;
            }
            parseChildNodesForValueAndLines(childNode.childNodes);
        }
    }

    parseChildNodesForValueAndLines(view.childNodes)

    return newValue
}

function OptionView(i, node) {
    const view = document.createElement("div")
    view.className = "option"
    view.innerHTML = `${i}. "${node.text}"`
    view.onclick = () => select(node)
    return view
}

function AddButton(node) {
    const view = document.createElement("div")
    view.className = "add"
    view.innerHTML = "+"
    view.onclick = () => addResponse(node)
    return view
}

function select(node) {
    // select element
    selected = node.id

    // add paths
    function* getChildren(node) {
        let paths = node.paths

        if (paths.length == 1 && getNode(paths[0]).author !== player) {
            yield ConvoView(getNode(paths[0]))
            yield *getChildren(getNode(paths[0]))
        } else {
            for (const i in paths) {
                yield OptionView(Number(i) + 1, getNode(paths[i]))
            }
        }
    }

    document.getElementById("editor").replaceChildren(
        BackAreaView(),
        ConvoView(node),
        ...getChildren(node),
    )

    // update graph
    update()

    document.getElementById(node.id).focus()
}

//

function getNode(id) {
    return nodes.find(node => node.id == id)
}

function removeNode(node) {
    nodes.splice(nodes.findIndex(n => n.id == node.id), 1)
    for (const n of nodes) {
        n.paths = n.paths.filter((id) => id != node.id)
    }
}

function update() {
    let id = document.activeElement.id

    graph.replaceChildren(...draw())

    if (id) {
        document.getElementById(id).focus()
    }
}

//

const mouse = {}
const camera = { x: 0, y: 0 }

graph.onmousedown = (e) => {
    mouse.isDown = true

    let ox = camera.x - e.x
    let oy = camera.y - e.y

    mouse.onmove = (e) => {
        camera.x = e.x + ox
        camera.y = e.y + oy
        update()
    }

    mouse.ondone = (e) => {
    }

    mouse.onclick = (e) => {   
    }
}

graph.onmousemove = (e) => {
    if (mouse.isDown) {
        mouse.isDrag = true
        mouse.onmove(e)
    }
}

graph.onmouseup = (e) => {
    if (mouse.isDown) {
        if (mouse.isDrag) {
            mouse.ondone(e)
        } else {
            mouse.onclick(e)
        }

        Object.keys(mouse).forEach(key => delete mouse[key]);
        
        update()
    }
}

select(getNode(0))