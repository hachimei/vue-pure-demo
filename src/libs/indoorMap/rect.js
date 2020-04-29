// ---------------------the IDM.GeomUtil class--------------------
// get the bounding Rect of the points
function Rect (minx, miny, maxx, maxy) {
  this.tl = [minx || 0, miny || 0] // top left point
  this.br = [maxx || 0, maxy || 0] // bottom right point
}

Rect.prototype.isCollide = function (rect) {
  if (
    rect.br[0] < this.tl[0] ||
      rect.tl[0] > this.br[0] ||
      rect.br[1] < this.tl[1] ||
      rect.tl[1] > this.br[1]
  ) {
    return false
  }
  return true
}

export default Rect
