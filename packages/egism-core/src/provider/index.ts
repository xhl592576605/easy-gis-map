import { CRS, layerGroup, LayerGroup, TileLayer, TileLayerOptions } from "leaflet"
import { mapProviderOptions } from "src/map/option"
import tencentMap from "./tencentMap"

/**
* 基础地图包
*/
const BaseMap = {
  // EPSG:4326 (WGS84)
  'EPSG:3857': {
    /**
     * 谷歌地图
     */
    GoogleMap: { //http://www.google.cn/maps/vt?lyrs={v}@{s}&gl=cn&x={x}&y={y}&z={z}
      url: 'http://mt{s}.google.cn/vt/lyrs={v}&hl=zh-CN&gl=cn&x={x}&y={y}&z={z}',
      options: {
        subdomains: '0123'
      },
      v: {
        Normal: 'm',     //全地图
        Satellite_N: 's',//卫星图
        Satellite: 'y',  //卫星图(含标注)
        Terrain: 't',    //地形图
        Terrain_R: 'p',  //地形图+
        Skeleton_D: 'r', //黑色轮廓图dark
        Skeleton_H: 'h', //高亮轮廓图light
        Hybrid: 'y'      //混合卫星图/影像图?
      }
    },
    /**
     * 全国天地图 
     */
    Tianditu: {
      url: 'https://t{s}.tianditu.gov.cn/DataServer?T={v}&x={x}&y={y}&l={z}&tk={tk}',
      options: {
        subdomains: '01234567',
        tk: (window as any).tk || 'd41216e31ec7bee17dacff6d71c8dc82'
      },
      v: {
        Normal: 'vec_w',        //矢量地图
        Normal_A: 'cva_w',      //矢量-标注图
        Terrain: 'ter_w',       //地形图
        Terrain_A: 'cta_w',     //地形-标注图
        Satellite: 'img_w',     //卫星影像图
        Satellite_A: 'cia_w',   //卫星-标注图
      }
    },
    /**
     * 高德地图
     */
    GaodeMap: {
      url: 'http://web{v}0{s}.is.autonavi.com/appmaptile?style={style}&x={x}&y={y}&z={z}',
      options: {
        minZoom: 3,
        subdomains: '1234',
        attribution: '&copy <a>GaoDeMap</a>'
      },
      v: {
        Normal: {     // 交通图
          url: 'http://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}'
        },
        Satellite: {  // 卫星图
          options: { v: 'st', style: 6 }
        },
        Satellite_A: { // 卫星-标注图
          options: { v: 'st', style: 8 }
        }
      }
    },
    /**
     * 腾讯地图
     */
    TencentMap: {
      url: 'http://rt{s}.map.gtimg.com/realtimerender?z={z}&x={x}&y={y}&type=vector&style={v}',
      options: {
        subdomains: '012'
      },
      v: {
        Normal: '0',
        Normal_R: '1',
        Terrain: 'demTiles',//地形图
        Satellite: 'sateTiles'//卫星图
      }
    }
  },
  //EPSG:3857 (Pseudo-Mercator)
  'EPSG:4326': {
    /**
     * 全国天地图 4490
     */
    Tianditu: {
      url: 'http://t{s}.tianditu.com/DataServer?T={v}&x={x}&y={y}&l={z}&tk={tk}',
      options: {
        zoomOffset: 1,
        subdomains: '01234567',
        tk: window.tk || 'd41216e31ec7bee17dacff6d71c8dc82'
      },
      v: {
        Normal: 'vec_c',     //矢量地图
        Normal_A: 'cva_c',   //矢量-标注图
        Terrain: 'ter_c',    //地形图
        Terrain_A: 'cta_c',  //地形-标注图
        Satellite: 'img_c',  //卫星影像图
        Satellite_A: 'cia_c',//卫星-标注图
      }
    }
  },
  'Baidu': {
    /**
     * 百度地图
     */
    BaiduMap: {
      url: "http://online{s}.map.bdimg.com/tile/?qt=tile&x={x}&y={y}&z={z}&styles={v}&v=020",
      options: {
        minZoom: 3,
        maxZoom: 19,
        subdomains: '0123456789',
        tms: true
      },
      v: {
        Normal: 'pl',
        A: 'sl',
        Satellite: {
          url: 'http://shangetu{s}.map.bdimg.com/it/u=x={x};y={y};z={z};v=009;type=sate&fm=46'
        },
      }
    },
  }
}

export default class Provider extends LayerGroup {
  /**
   * 缩放层级
   */
  zoom?: number


  /**
   * 设置坐标系
   * @param crs 
   */
  setCRS(crs: CRS | string): CRS | undefined {
    if (!crs) {
      return
    }
    if (typeof crs === 'string') {
      crs = CRS[crs]
    }
    const { _map: map } = this
    const { options } = map
    const zoom = this.zoom || map.getZoom()

    if (crs === CRS.EPSG4326) {
      map.setZoom(zoom)
    }
    if (map && options.crs !== crs) {
      const center = map.getCenter()
      options.crs = (crs as CRS)
      map.setView(center, zoom) // 改变 crs 会改变中心点
    }
    return crs as CRS
  }


  /**
  * 创建瓦片图层
  * @param name 
  * @param url 
  * @param options 
  */
  create(name: string, url?: string, options?: TileLayerOptions): TileLayer {
    const { _map: map } = this
    const { options: mapOption } = map
    let _url = ''
    let Layer = TileLayer // 定义地图加载图层
    if (name) {
      const parts = name.split('.')
      const providerName = parts[0]
      switch (providerName) {
        case 'LMap':
          /** 用于来自定义的图包 */
          break
        case 'TencentMap':
          Layer = tencentMap
          break
      }
      const baseMap = BaseMap[mapOption.crs?.code as string]
      if (!baseMap && parts.length > 1) {
        console.warn(`不存在图包信息:${name}`)
      }
      const _basemap = baseMap[providerName]
      if (_basemap) {
        const { options: ops } = _basemap
        const variantName = parts[1]
        // 变化v -> variants
        if (variantName) {
          const variant = _basemap.v[variantName]
          let vo
          if (typeof variant === 'string') {
            vo = { v: variant }
          } else {
            url = url || variant.url
            vo = variant.options
          }
          options = Object.assign({}, ops, vo)
        }
        _url = url || _basemap.url
      } else {
        _url = url as string
      }
    } else {
      _url = url as string
    }
    return new Layer(_url, options)
  }

  /**
   * 添加图层
   * @param options 
   */
  addLayers(options: Array<mapProviderOptions> | mapProviderOptions | Array<string> | string): LayerGroup {
    let groups: Array<TileLayer> = []
    if (Array.isArray(options)) {
      const _groups = (options as (Array<mapProviderOptions> | Array<string>)).map((opt) => {
        if (opt instanceof Object) {
          const { name, url, crs, options } = opt
          if (crs) {
            this.setCRS(crs)
          }
          return this.create(name, url, options)
        } else {
          return this.create(opt)
        }
      })
      groups = _groups as Array<TileLayer>
    } else {
      const opt = options
      if (opt instanceof Object) {
        const { name, url, crs, options } = (opt as mapProviderOptions)
        if (crs) {
          this.setCRS(crs)
        }
        groups = [this.create(name, url, options)]
      } else {
        groups = [this.create(opt)]
      }
    }
    const layers = layerGroup(groups)
    this.addLayer(layers)
    return layers
  }

  /**
   * 更新图层
   * @param options 
   */
  updateLayers(options: Array<mapProviderOptions> | mapProviderOptions | Array<string> | string): LayerGroup {
    this.zoom = this._map.getZoom()
    return this.clearLayers().addLayers(options)
  }
}


export {
  BaseMap
}