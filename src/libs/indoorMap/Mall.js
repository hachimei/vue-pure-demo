// ---------------------the Mall class--------------------
function Mall () {
  var _this = this
  this.floors = [] // the floors
  this.building = null // the building
  this.root = null // the root scene
  this.is3d = true
  this.jsonData = null // original json data

  var _curFloorId

  // get building id
  this.getBuildingId = function () {
    var mallid = _this.jsonData.data.building.Mall
    return mallid || -1
  }

  // get default floor id
  this.getDefaultFloorId = function () {
    return _this.jsonData.data.building.DefaultFloor
  }
  // get current floor id
  this.getCurFloorId = function () {
    return _curFloorId
  }

  // get floor num
  this.getFloorNum = function () {
    return _this.jsonData.data.Floors.length
  }

  // get floor by id
  this.getFloor = function (id) {
    for (var i = 0; i < _this.floors.length; i++) {
      if (_this.floors[i]._id === id) {
        return _this.floors[i]
      }
    }
    return null
  }

  // get floor by name
  this.getFloorByName = function (name) {
    for (var i = 0; i < _this.floors.length; i++) {
      if (_this.floors[i].Name === name) {
        return _this.floors[i]
      }
    }
    return null
  }

  // get current floor
  this.getCurFloor = function () {
    return _this.getFloor(_curFloorId)
  }

  // get Floor's json data
  this.getFloorJson = function (fid) {
    var floorsJson = _this.jsonData.data.Floors
    for (var i = 0; i < floorsJson.length; i++) {
      if (floorsJson[i]._id === fid) {
        return floorsJson[i]
      }
    }
    return null
  }

  // show floor by id
  this.showFloor = function (id) {
    if (_this.is3d) {
      // set the building outline to invisible
      _this.root.remove(_this.building)
      // set all the floors to invisible
      for (var i = 0; i < _this.floors.length; i++) {
        if (_this.floors[i]._id === id) {
          // set the specific floor to visible
          _this.floors[i].position.set(0, 0, 0)
          _this.root.add(_this.floors[i])
        } else {
          _this.root.remove(_this.floors[i])
        }
      }
    }
    _curFloorId = id
  }

  // show the whole building
  this.showAllFloors = function () {
    if (!_this.is3d) { // only the 3d map can show all the floors
      return
    }

    _this.root.add(_this.building)

    var offset = 4
    for (var i = 0; i < _this.floors.length; i++) {
      _this.floors[i].position.set(0, 0, i * _this.floors[i].height * offset)
      //            if(i === 4){
      //                _this.floors[i].position.set(0,-300,i*_this.floors[i].height*offset);
      //            }else{
      //
      //            }
      _this.root.add(this.floors[i])
    }
    this.building.scale.set(1, 1, offset)

    _curFloorId = 0

    return _this.root
  }
}

export default Mall
