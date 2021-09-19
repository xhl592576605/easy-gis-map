
import { MapOptions, CRS, LatLngExpression, TileLayerOptions } from 'leaflet'

/**
 * map Options 继承leaflet的MapOptions
 */
export default interface egisMapOptions extends MapOptions {
  /**
   *map-name 内置地图源的名称
   */
  mapName: string
  /**
   *map-crs
   */
  mapCrs: string
  /**
   *map-center
   */
  mapCenter?: Array<number>

  /**
   *map-provider
   */
  provider: Array<mapProviderOptions> | mapProviderOptions | string | Array<string>

  /**
   * 是否显示距离卡尺
   */
  showScale: boolean

  /**
   * 是否显示经纬度插件
   */
  showCoordinates: boolean

  /**
   * 是否显示鹰眼图
   */
  showHawkEyes: boolean

  crs?: CRS
  center?: LatLngExpression
}

export interface mapProviderOptions {
  name: string
  url?: string
  crs?: string
  options?: TileLayerOptions
}