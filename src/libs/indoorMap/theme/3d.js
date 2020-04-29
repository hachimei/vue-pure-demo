export default {
  name: 'test', // theme's name
  background: '#F2F2F2', // background color

  // building's style
  building: {
    color: '#000000',
    opacity: 0.1,
    transparent: true,
    depthTest: false
  },

  // floor's style
  floor: {
    color: '#E0E0E0',
    opacity: 1,
    transparent: false
  },

  // selected room's style
  selected: '#ffff55',

  // rooms' style
  room: function (type, category) {
    var roomStyle
    if (!category) {
      switch (type) {
        case 100: // hollow. u needn't change this color. because i will make a hole on the model in the final version.
          return {
            color: '#F2F2F2',
            opacity: 0.8,
            transparent: true
          }
        case 300: // closed area
          return {
            color: '#AAAAAA',
            opacity: 0.7,
            transparent: true
          }
        case 400: // empty shop
          return {
            color: '#D3D3D3',
            opacity: 0.7,
            transparent: true
          }
        default :
          break
      }
    }

    switch (category) {
      case 101: // food
        roomStyle = {
          color: '#1f77b4',
          opacity: 0.7,
          transparent: true
        }
        break
      case 102: // retail
        roomStyle = {
          color: '#aec7e8',
          opacity: 0.7,
          transparent: true
        }
        break
      case 103: // toiletry
        roomStyle = {
          color: '#ffbb78',
          opacity: 0.7,
          transparent: true
        }
        break
      case 104: // parent-child
        roomStyle = {
          color: '#98df8a',
          opacity: 0.7,
          transparent: true
        }
        break
      case 105: // life services
        roomStyle = {
          color: '#bcbd22',
          opacity: 0.7,
          transparent: true
        }
        break
      case 106: // education
        roomStyle = {
          color: '#2ca02c',
          opacity: 0.7,
          transparent: true
        }
        break
      case 107: // life style
        roomStyle = {
          color: '#dbdb8d',
          opacity: 0.7,
          transparent: true
        }
        break
      case 108: // entertainment
        roomStyle = {
          color: '#EE8A31',
          opacity: 0.7,
          transparent: true
        }
        break
      case 109: // others
        roomStyle = {
          color: '#8c564b',
          opacity: 0.7,
          transparent: true
        }
        break
      default :
        roomStyle = {
          color: '#c49c94',
          opacity: 0.7,
          transparent: true
        }
    }
    return roomStyle
  }

}