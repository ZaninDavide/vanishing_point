function zoomChange(e) {
    const old_zoom = zoom
    zoom = parseFloat(e.target.value * 1000)
    if (zoom === 0) zoom = 0.000000000001
    vanishing_point[0] *= old_zoom / zoom
    updateSVG()
}

function vpxChange(e) {
    vanishing_point[0] = parseFloat(e.target.value) / zoom
    updateSVG()
}

function xChange(e) {
    position[0] = e.target.value
    updateSVG()
}