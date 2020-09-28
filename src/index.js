let object = {
    verts: [],
    faces: []
}

let rotation = [0, 1, 2]
let position = [0, 0, -10]
let vanishing_point = [0, 0]
let zoom = 1000
let d = 1

let face_culling = true;

setInterval(() => {
    rotation[0] += 0.01
    rotation[1] += 0.01
    rotation[2] += 0.01
    updateSVG()
}, 1000 / 120)

function projectVertex(v) {
    v = rotate(v, rotation)

    let x = v[0] - position[0] - vanishing_point[0]
    let y = v[1] - position[1] - vanishing_point[1]
    let z = v[2] - position[2] - d

    if (z < d) console.log("This vertex is too close to you")

    let projected = [
        x * d / z + vanishing_point[0],
        y * d / z + vanishing_point[1]
    ]

    projected = scale(projected, zoom)

    return [projected[0], projected[1], length([x, y, z])]
}

function setBaseSVG(svg) {
    document.getElementById("baseSVG").innerHTML = svg;
    document.getElementById("canvas").classList.remove("empty");
}

function setSVG(svg) {
    document.getElementById("objectSVG").innerHTML = svg;
    document.getElementById("canvas").classList.remove("empty");
}

function svgLine(from, to) {
    return `<line x1="${from[0]}" x2="${to[0]}" y1="${from[1]}" y2="${to[1]}" stroke="black" stroke-width="1px" stroke-linecap="round" stroke-linejoin="round" fill="none" />`
}

function svgPoligon(points) {
    return `<polygon points="${points.map(p => `${p[0]},${p[1]}`).join(" ")}" stroke="#535353" stroke-width="0.5px" stroke-linecap="round" stroke-linejoin="round" fill="#e2e2e2" />`
}

function updateSVG() {
    // update SVG using 'object'

    // TODO:
    //  - consider looking at the normals not to render hidden faces

    // PROJECT POINTS

    let faces = object.faces.map(f => {
        verts = f.verts.map(vi =>
            projectVertex(object.verts[vi])
        )
        return {
            verts: verts,
            normal: f.normal,
            center: faceMeanPoint(f.verts.map(vi => object.verts[vi]))
        }
    })

    // SORT FACES

    faces.sort((a, b) => projectVertex(b.center)[2] - projectVertex(a.center)[2])

    // GENERATE SVG

    let svg = faces.map(f => {

        if (face_culling) {
            let view_normal = rotate(f.normal, rotation)
            if (dot(view_normal, normalize(subtract(f.center, position))) >= 0) return null
        }

        return svgPoligon(f.verts)
    })

    setSVG(svg.join(""))
    setBaseSVG(`
        <line x1="0" x2="0" y1="10" y2="-10" stroke="lightgray" stroke-width="1px"/>
        <line x1="-9999999" x2="9999999" y1="${vanishing_point[1] * zoom}" y2="${vanishing_point[1] * zoom}" stroke="lightgray" stroke-width="1px"/>
        <circle cx="${vanishing_point[0] * zoom}" cy="${vanishing_point[1] * zoom}" r="3" fill="red"/>
    `)
}

function loadOBJ(text) {
    const lines = text.replace(",", ".").split(/\n/)

    // TODO: 
    //  - consider using material diffuse color ('usemtl' flag + mtl file) as face color
    //  - consider grouping objects ('o' flag)

    let verts = []
    let faces = []
    let normals = []
    lines.forEach(line => {
        if (line.startsWith("v ")) {
            let data = line.split(/\s\s*/g).map(d => parseFloat(d))
            if (data.length === 4) {
                verts.push(data.slice(1, 4)) // vertex coordinates
            } else {
                console.log("Vertex Error : " + line)
            }
        } else if (line.startsWith("f ")) {
            if (normals.length === 0) {
                console.log("Missing normals. Normals will be calculated based on the geometry.")
                // return null
            }

            let data = line.split(/\s\s*/g).map(d => d.split(/\//).map(i => parseInt(i) - 1))
            if (data.length >= 4) {
                // get vertices' indices
                vis = data.slice(1, data.length).map(c => c[0])
                // get face normal
                let normal = [0, 0, 0]
                if (normals.length === 0) {
                    let v1 = verts[vis[0]]
                    let v2 = verts[vis[1]]
                    let v3 = verts[vis[2]]
                    normal = normalize(cross(subtract(v2, v1), subtract(v3, v1)))
                } else {
                    normal = normalize(
                        data.slice(1, data.length)
                            .map(c => c[2])
                            .map(i => normals[i])
                            .reduce((a, v) => a.map((av, ai) => av + v[ai], 0))
                    )
                }

                faces.push({
                    verts: vis,
                    normal: normal,
                })
            } else {
                console.log("Face Error : " + line)
            }
        } else if (line.startsWith("vn ")) {
            let data = line.split(/\s\s*/g).map(d => parseFloat(d))
            if (data.length === 4) {
                normals.push(data.slice(1, 4)) // vertex coordinates
            } else {
                console.log("Normal Error : " + line)
            }
        }
    })

    object.verts = verts
    object.faces = faces

    updateSVG()
}

function openFileDialog() {
    document.getElementById('input_file').click();
}

function readFile() {
    let files = Array.from(document.getElementById('input_file').files)

    let importFiles = (files, i = 0) => {
        let file = files[i]

        var reader = new FileReader();

        // file reading finished successfully
        reader.addEventListener('load', async (e) => {
            var text = e.target.result;

            console.log("File: " + file.name)

            if (file.name.endsWith(".obj")) {
                loadOBJ(text)
            } else {
                console.log("I can't open this file: " + file.name)
            }

            /*
            if(files.length > i + 1){
                importFiles(files, i + 1)
            }
            */

        });

        // file reading failed
        reader.addEventListener('error', function () {
            alert('Error : Failed to read file');
        });

        reader.readAsText(file);
    }

    importFiles(files, 0)
}

function saveSVG(name) {
    var svgData = document.getElementById("canvas").outerHTML
    var svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
    var svgUrl = URL.createObjectURL(svgBlob)
    var downloadLink = document.createElement("a")
    downloadLink.href = svgUrl
    downloadLink.download = name + ".svg"
    document.getElementById("hidden").appendChild(downloadLink)
    downloadLink.click()
    document.getElementById("hidden").removeChild(downloadLink)
}