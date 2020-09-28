function dot(vectorA, vectorB) {
    if (vectorA.length != vectorB.length) return NaN
    return vectorA.map((v, i) => v * vectorB[i]).reduce((acc, v) => acc + v)
}

function length(vector) {
    return Math.pow(vector.reduce((acc, v) => acc + v * v, 0), 1 / 2)
}

function scale(v, factor) {
    return v.map(c => c * factor)
}

function normalize(vector) {
    return scale(vector, 1 / length(vector))
}

function subtract(vectorA, vectorB) {
    if (vectorA.length != vectorB.length) return NaN
    return vectorA.map((c, i) => vectorA[i] - vectorB[i])
}

function add(vectorA, vectorB) {
    if (vectorA.length != vectorB.length) return NaN
    return vectorA.map((c, i) => vectorA[i] - vectorB[i])
}

function cross(vectorA, vectorB) {
    return [
        vectorA[1] * vectorB[2] - vectorA[2] * vectorB[1],
        vectorA[2] * vectorB[0] - vectorA[0] * vectorB[2],
        vectorA[0] * vectorB[1] - vectorA[1] * vectorB[0],
    ]
}

function faceMeanPoint(verts) {
    return [
        verts.reduce((acc, p) => acc + p[0], 0) / verts.length,
        verts.reduce((acc, p) => acc + p[1], 0) / verts.length,
        verts.reduce((acc, p) => acc + p[2], 0) / verts.length,
    ]
}

function VecMatMult(mat, vec) {
    if (vec.length === 3) vec.push(1)

    let out = {
        x: vec[0] * mat[0] + vec[1] * mat[4] + vec[2] * mat[8] + vec[3] * mat[12],
        y: vec[0] * mat[1] + vec[1] * mat[5] + vec[2] * mat[9] + vec[3] * mat[13],
        z: vec[0] * mat[2] + vec[1] * mat[6] + vec[2] * mat[10] + vec[3] * mat[14],
        w: vec[0] * mat[3] + vec[1] * mat[7] + vec[2] * mat[11] + vec[3] * mat[15],
    }

    return [out.x, out.y, out.z, out.w]
}

//matrixB • matrixA
function multiplyMatrices(matrixA, matrixB) {
    // Slice the second matrix up into rows
    let row0 = [matrixB[0], matrixB[1], matrixB[2], matrixB[3]];
    let row1 = [matrixB[4], matrixB[5], matrixB[6], matrixB[7]];
    let row2 = [matrixB[8], matrixB[9], matrixB[10], matrixB[11]];
    let row3 = [matrixB[12], matrixB[13], matrixB[14], matrixB[15]];

    // Multiply each row by matrixA
    let result0 = VecMatMult(matrixA, row0);
    let result1 = VecMatMult(matrixA, row1);
    let result2 = VecMatMult(matrixA, row2);
    let result3 = VecMatMult(matrixA, row3);

    // Turn the result rows back into a single matrix
    return [
        result0[0], result0[1], result0[2], result0[3],
        result1[0], result1[1], result1[2], result1[3],
        result2[0], result2[1], result2[2], result2[3],
        result3[0], result3[1], result3[2], result3[3]
    ];
}

function identityMatrix() {
    return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]
}

function combineMatrices(matrices) {
    return matrices.reduce((acc, cur) => multiplyMatrices(cur, acc), identityMatrix())
}


function scaleMatrix(s) {
    return [
        s[0], 0, 0, 0,
        0, s[1], 0, 0,
        0, 0, s[2], 0,
        0, 0, 0, 1
    ];
}

function translateMatrix(t) {
    return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        t[0], t[1], t[2], 1
    ];
}

function rotateAroundXAxis(a) {
    return [
        1, 0, 0, 0,
        0, Math.cos(a), -Math.sin(a), 0,
        0, Math.sin(a), Math.cos(a), 0,
        0, 0, 0, 1
    ];
}

function rotateAroundYAxis(a) {
    return [
        Math.cos(a), 0, Math.sin(a), 0,
        0, 1, 0, 0,
        -Math.sin(a), 0, Math.cos(a), 0,
        0, 0, 0, 1
    ];
}

function rotateAroundZAxis(a) {
    return [
        Math.cos(a), -Math.sin(a), 0, 0,
        Math.sin(a), Math.cos(a), 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ];
}

/*
function projMatrix(camera) {
    return [
        [camera.aspectRatio * camera.fov, 0, 0, 0], // LINE 1
        [0, camera.fov, 0, 0], // LINE 2
        [0, 0, camera.zFar / (camera.zFar - camera.zNear), 1], // LINE 3
        [0, 0, (-camera.zFar * camera.zNear) / (camera.zFar - camera.zNear), 0]  // LINE 4
    ]
}
*/

function projMatrix(camera) {
    return [
        1 / (Math.tan(camera.fov / 2) * camera.aspectRatio), 0, 0, 0,
        0, 1 / Math.tan(camera.fov / 2), 0, 0,
        0, 0, camera.zFar / (camera.zFar - camera.zNear), 1,
        0, 0, -camera.zFar * camera.zNear / (camera.zFar - camera.zNear), 0
    ]
}

function viewProjMatrix(camera) {
    let a = Math.tan(camera.fov / 2.0) * camera.aspectRatio;
    let b = Math.tan(camera.fov / 2.0);
    let c = camera.zFar / (camera.zFar - camera.zNear);
    let d = -camera.zFar * camera.zNear / (camera.zFar - camera.zNear);
    // view propjection matrix
    return [
        1.0 / a, 0.0, 0.0, -camera.shift[0] / a,
        0.0, 1.0 / b, 0.0, -camera.shift[1] / b,
        0.0, 0.0, c, -camera.shift[2] * c + d,
        0.0, 0.0, 1.0, -camera.shift[2],
    ]
}

function rotate(v, r) {
    return VecMatMult(combineMatrices([
        rotateAroundXAxis(r[0]),
        rotateAroundYAxis(r[1]),
        rotateAroundZAxis(r[2]),
    ]), [...v, 1]).slice(0, 3)
}
