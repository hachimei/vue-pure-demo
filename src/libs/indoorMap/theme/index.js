import theme2D from './2d'
import theme3D from './3d'

const imgPath = '/static/indoor3D/img'

const publicStyle = {
  // room wires' style
  strokeStyle: {
    color: '#5C4433',
    opacity: 0.5,
    transparent: true,
    linewidth: 2
  },

  fontStyle: {
    color: '#231815',
    fontsize: 40,
    fontface: 'Helvetica, MicrosoftYaHei '
  },

  pubPointImg: {
    11001: imgPath + '/toilet.png',
    11002: imgPath + '/ATM.png',
    11003: imgPath + '/indoor_pub_cashier.png',
    21001: imgPath + '/stair.png',
    22006: imgPath + '/entry.png',
    21002: imgPath + '/escalator.png',
    21003: imgPath + '/lift.png'
  }
}

Object.assign(theme2D, publicStyle)
Object.assign(theme3D, publicStyle)

export { theme2D, theme3D }
