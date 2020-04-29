// import * as THREE from 'three'
import IDM from './IDM'
import Mall from './Mall'
import IndoorMap2d from './IndoorMap2d'
import IndoorMap3d from './IndoorMap3d'
import { theme2D, theme3D } from './theme'
// export const libPath = './'

const THREE = window.THREE
const Detector = window.Detector
// ----------------------------the Loader class --------------------------
export const IndoorMapLoader = function (is3d) {
  THREE.Loader.call(this, is3d)

  this.withCredentials = false
  this.is3d = is3d
}

IndoorMapLoader.prototype = Object.create(THREE.Loader.prototype) // Object.create方法实现继承

IndoorMapLoader.prototype.load = function (url, callback, texturePath) {
  this.onLoadStart()
  this.loadAjaxJSON(this, url, callback)
}

IndoorMapLoader.prototype.loadAjaxJSON = function (context, url, callback, callbackProgress) {
  const xhr = new XMLHttpRequest()

  let length = 0

  xhr.onreadystatechange = function () {
    if (xhr.readyState === xhr.DONE) {
      if (xhr.status === 200 || xhr.status === 0) {
        if (xhr.responseText) {
          const json = JSON.parse(xhr.responseText)

          const result = context.parse(json)
          callback(result)
        } else {
          console.error('IndoorMapLoader: "' + url + '" seems to be unreachable or the file is empty.')
        }

        // in context of more complex asset initialization
        // do not block on single failed file
        // maybe should go even one more level up

        context.onLoadComplete()
      } else {
        console.error('IndoorMapLoader: Couldn\'t load "' + url + '" (' + xhr.status + ')')
      }
    } else if (xhr.readyState === xhr.LOADING) {
      if (callbackProgress) {
        if (length === 0) {
          length = xhr.getResponseHeader('Content-Length')
        }

        callbackProgress({ total: length, loaded: xhr.responseText.length })
      }
    } else if (xhr.readyState === xhr.HEADERS_RECEIVED) {
      if (callbackProgress !== undefined) {
        length = xhr.getResponseHeader('Content-Length')
      }
    }
  }

  xhr.open('GET', url, true)
  xhr.withCredentials = this.withCredentials
  xhr.send(null)
}

IndoorMapLoader.prototype.parse = function (json) {
  return ParseModel(json, this.is3d)
}

// -----------------------------the Parser class ---------------------------------------
function ParseModel (json, is3d, theme) {
  const mall = new Mall()

  function parse () {
    mall.jsonData = json
    mall.is3d = is3d

    if (theme === undefined) {
      if (is3d) {
        theme = theme3D
      } else {
        theme = theme2D
      }
    }

    let building, shape, extrudeSettings, geometry, material, mesh, wire, points
    const scale = 0.1; let floorHeight; let buildingHeight = 0

    // floor geometry
    for (let i = 0; i < json.data.Floors.length; i++) {
      const floor = json.data.Floors[i]
      floor.rect = IDM.GeomUtil.getBoundingRect(floor.Outline[0][0])

      const floorObj = new THREE.Object3D()
      if (is3d) { // for 3d model
        floorHeight = floor.High / scale
        if (floorHeight === 0.0) { // if it's 0, set to 50.0
          floorHeight = 50.0
        }
        buildingHeight += floorHeight
        points = parsePoints(floor.Outline[0][0])
        shape = new THREE.Shape(points)
        geometry = new THREE.ShapeGeometry(shape)
        mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial(theme.floor))
        mesh.position.set(0, 0, -5)

        floorObj.height = floorHeight
        floorObj.add(mesh)
        floorObj.points = []
        floorObj._id = floor._id

        mall.floors.push(floorObj)
      } else { // for 2d model
        floor.strokeStyle = theme.strokeStyle.color
        floor.fillColor = theme.floor.color
        mall.floors.push(floor)
      }

      // funcArea geometry
      for (let j = 0; j < floor.FuncAreas.length; j++) {
        const funcArea = floor.FuncAreas[j]
        funcArea.rect = IDM.GeomUtil.getBoundingRect(funcArea.Outline[0][0])

        if (is3d) {
          points = parsePoints(funcArea.Outline[0][0])
          shape = new THREE.Shape(points)

          const center = funcArea.Center
          floorObj.points.push({ name: funcArea.Name, type: funcArea.Type, position: new THREE.Vector3(center[0] * scale, floorHeight * scale, -center[1] * scale) })

          // solid model
          extrudeSettings = { amount: floorHeight, bevelEnabled: false }
          geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings)
          material = new THREE.MeshLambertMaterial(theme.room(parseInt(funcArea.Type), funcArea.Category))
          mesh = new THREE.Mesh(geometry, material)
          mesh.type = 'solidroom'
          // mesh.id = funcArea._id // Object.getOwnPropertyDescriptor(mesh, 'id') writable为false configurable也是false
          // THREE的mesh的id无法修改
          mesh._id = funcArea._id

          floorObj.add(mesh)

          // top wireframe
          geometry = shape.createPointsGeometry()
          wire = new THREE.Line(geometry, new THREE.LineBasicMaterial(theme.strokeStyle))
          wire.position.set(0, 0, floorHeight)

          floorObj.add(wire)
        } else {
          funcArea.fillColor = theme.room(parseInt(funcArea.Type), funcArea.Category).color
          funcArea.strokeColor = theme.strokeStyle.color
        }
      }

      if (is3d) {
        // pubPoint geometry
        for (let j = 0; j < floor.PubPoint.length; j++) {
          const pubPoint = floor.PubPoint[j]
          const point = parsePoints(pubPoint.Outline[0][0])[0]
          floorObj.points.push({ name: pubPoint.Name, type: pubPoint.Type, position: new THREE.Vector3(point.x * scale, floorHeight * scale, -point.y * scale) })
        }
      }
    }

    if (is3d) {
      mall.root = new THREE.Object3D() // if is 3d, create a root object3D

      // building geometry
      building = json.data.building
      points = parsePoints(building.Outline[0][0])
      mall.FrontAngle = building.FrontAngle

      if (points.length > 0) {
        shape = new THREE.Shape(points)
        extrudeSettings = { amount: buildingHeight, bevelEnabled: false }
        geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings)
        mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial(theme.building))

        mall.building = mesh
      }

      // scale the mall
      mall.root.scale.set(scale, scale, scale)
      mall.root.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2)
    }

    return mall
  };

  // parse the points to THREE.Vector2 (remove duplicated points)
  function parsePoints (pointArray) {
    const shapePoints = []
    for (let i = 0; i < pointArray.length; i += 2) {
      const point = new THREE.Vector2(pointArray[i], pointArray[i + 1])
      if (i > 0) {
        const lastpoint = shapePoints[shapePoints.length - 1]
        if (point.x !== lastpoint.x || point.y !== lastpoint.y) { // there are some duplicate points in the original data
          shapePoints.push(point)
        }
      } else {
        shapePoints.push(point)
      }
    }
    return shapePoints
  }

  return parse()
}
// -----------------------------the IndoorMap class ------------------------------------

const IndoorMap = function (params) {
  let _mapDiv, _uiRoot, _uiSelected
  let _fullScreen = false
  let is3d = false
  let _indoorMap

  // initialization
  function init (params) {
    // parse the parameters
    if (params !== undefined) {
      // if the map container is specified
      if (Object.prototype.hasOwnProperty.call(params, 'mapDiv')) {
        _mapDiv = document.getElementById(params.mapDiv)
        _fullScreen = false
      } else if (Object.prototype.hasOwnProperty.call(params, 'size') && params.size.length === 2) { // if the map size is specified
        createMapDiv(params.size)
        _fullScreen = false
      } else { // else create a full screen map
        createMapDiv([window.innerWidth, window.innerHeight])
        _fullScreen = true
      }
      // 2d or 3d view
      if (Object.prototype.hasOwnProperty.call(params, 'dim')) {
        is3d = params.dim !== '2d'
      } else {
        is3d = true
      }
    } else {
      createMapDiv([window.innerWidth, window.innerHeight])
      _fullScreen = true
    }

    // create 2d or 3d map by webgl detection
    if (is3d && Detector.webgl) {
      _indoorMap = new IndoorMap3d(_mapDiv)
    } else {
      _indoorMap = new IndoorMap2d(_mapDiv)
      is3d = false
    }

    // let marker = document.createElement("image");
    // marker.style.position = "absolute";
    // marker.style.src = System.imgPath+"/marker.png";
    // marker.visibility = false;
    // marker.style.width = "39px";
    // marker.style.height = "54px";
    // document.body.appendChild(marker);
    /// /_indoorMap.setSelectionMarker(marker);
  }

  function createMapDiv (size) {
    _mapDiv = document.createElement('div')
    _mapDiv.style.width = size[0] + 'px'
    _mapDiv.style.height = size[1] + 'px'
    _mapDiv.style.top = '0px'
    _mapDiv.style.left = '0px'
    _mapDiv.style.position = 'absolute'
    _mapDiv.id = 'indoor3d'
    document.body.appendChild(_mapDiv)
    document.body.style.margin = '0'
  }

  function updateUI () {
    if (_uiRoot == null) {
      return
    }
    const ulChildren = _uiRoot.children
    if (ulChildren.length === 0) {
      return
    }
    if (_uiSelected != null) {
      _uiSelected.className = ''
    }
    const curid = _this.mall.getCurFloorId()
    if (curid === 0) {
      _uiSelected = _uiRoot.children[0]
    } else {
      for (let i = 0; i < ulChildren.length; i++) {
        if (ulChildren[i].innerText === _this.mall.getCurFloorId().toString()) {
          _uiSelected = ulChildren[i]
        }
      }
    }
    if (_uiSelected != null) {
      _uiSelected.className = 'selected'
    }
  }

  init(params)
  return _indoorMap
}

// get the UI
IndoorMap.getUI = function (indoorMap) {
  const _indoorMap = indoorMap
  if (_indoorMap === undefined || _indoorMap.mall == null) {
    console.error('the data has not been loaded yet. please call this function in callback')
    return null
  }
  // create the ul list
  const _uiRoot = document.createElement('ul')
  _uiRoot.className = 'floorsUI'

  let li = document.createElement('li')
  let text = document.createTextNode('All')
  if (_indoorMap.is3d) {
    li.appendChild(text)
    _uiRoot.appendChild(li)
    li.onclick = function () {
      _indoorMap.showAllFloors()
    }
  }

  const floors = _indoorMap.mall.jsonData.data.Floors
  for (let i = 0; i < floors.length; i++) {
    (function (arg) {
      li = document.createElement('li')
      text = document.createTextNode(floors[arg].Name)
      li.appendChild(text)
      li.onclick = function () {
        _indoorMap.showFloor(floors[arg]._id)
      }
      _uiRoot.appendChild(li)
    })(i)
  }
  return _uiRoot
}

export default IndoorMap
