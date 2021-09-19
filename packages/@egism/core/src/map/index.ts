import { Map, Control, CRS, latLng } from "leaflet"
import Provider from "src/provider"
import egisMapOptions from "./option"
const { Scale } = Control
export default class egisMap {
  /**platform */
  public readonly platform = 'leaflet'

  /** author */
  public readonly author = 'egism'

  /** featureLayer */
  static Layer = null

  /** maplLayers */
  _layers: any[] = []

  /** map */
  map: Map

  /** mapElement */
  el: HTMLDivElement

  /** mapProvider */
  provider: Provider

  constructor(node: HTMLDivElement, options: egisMapOptions) {
    options = Object.assign({
      doubleClickZoom: false, // 禁止双击放大缩小
      zoomControl: false, // 地图上显示放大缩小的控制
      attributionControl: false, // 在地图上显示attribution
      preferCanvas: true // Canvas 地图使用画布渲染，
    }, options)
    if (options.mapCrs) {
      options.crs = CRS[options.mapCrs] || CRS.EPSG3857
    } else {
      options.crs = CRS.EPSG3857
    }
    if (options.mapCenter) {
      options.center = latLng(options.mapCenter[1], options.mapCenter[0])
    }
    node.style.cursor = 'default' // 设置下地图的默认鼠标样式
    this.map = new Map(node, options)
    this.el = node
    this.provider = new Provider().addTo(this.map)
    if (options.provider) {
      this.provider.addLayers(options.provider)
    }
    options.showScale && new Scale().addTo(this.map) // 是否显示距离卡尺
  }
}