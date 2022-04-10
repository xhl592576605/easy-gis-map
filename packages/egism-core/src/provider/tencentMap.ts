import { Coords, TileLayer, Util } from "leaflet"

export default class tencentMap extends TileLayer {
  getTileUrl(coords: Coords): string {
    return Util.template(this['_url'], Object.assign({}, {
      s: this['_getSubdomain'](coords),
      x: coords.x,
      y: Math.pow(2, coords.z) - 1 - coords.y,
      z: coords.z
    }, this.options))
  }
}