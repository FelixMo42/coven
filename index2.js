
let nodes = [
    {
        id: 0,
        author: "Vincent",
        text: "",
        paths: [],
        x: 10,
        y: 10
    }
]

const graph = document.querySelector("#graph")

//

function goToParent() {
    for (const node of nodes) {
        if (node.paths.includes(getNode(selected).id)) {
            return select(node)
        }
    }
}

function addResponse() {
    let node = getNode(selected)
    let new_id = crypto.randomUUID()

    nodes.push({
        id: new_id,
        author: "Vincent",
        text: "",
        paths: [],
        x: Math.max(...node.paths.map(id => getNode(id).x + 225), node.x),
        y: node.y + 125
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

const NODE_WIDTH = 200
const NODE_HEIGHT = 100

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

function select(node) {
    // select element
    selected = node.id

    // set values
    document.getElementById("author").value = node.author
    document.getElementById("body").value = node.text

    // expand textarea
    bodyView.style.height = "0px"
    bodyView.style.height = bodyView.scrollHeight + "px"

    // add paths
    function* getChildren() {
        for (const id of node.paths) {
            const doc = document.createElement("div")
            doc.className = "box"
            doc.innerHTML = `<b>${getNode(id).author}</b>\n${getNode(id).text}`
            doc.onclick = () => {
                select(getNode(id))
            }
            yield doc
        }
    }
    document.getElementById("paths").replaceChildren(...getChildren())

    // update graph
    update()

    document.getElementById(node.id).focus()
}

const bodyView = document.getElementById("body");
bodyView.oninput = (e) => {
    // save the new value
    getNode(selected).text = bodyView.value

    // expand it
    bodyView.style.height = "0px"
    bodyView.style.height = bodyView.scrollHeight + "px"

    // update
    update()
}

document.getElementById("author").oninput = (e) => {
    getNode(selected).author = document.getElementById("author").value
    update()
}

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