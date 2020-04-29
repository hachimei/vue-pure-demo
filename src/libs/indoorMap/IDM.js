import Rect from './rect'

// IDM namespace
var IDM = {}
IDM.Browser = {}
// Browser detection
;(function () {
  var a = 'ActiveXObject' in window
  var c = a && !document.addEventListener
  var e = navigator.userAgent.toLowerCase()
  var f = e.indexOf('webkit') !== -1
  var m = e.indexOf('chrome') !== -1
  var p = e.indexOf('phantom') !== -1
  var isAndroid = e.indexOf('android') !== -1
  var r = e.search('android [23]') !== -1
  var gecko = e.indexOf('gecko') !== -1
  var isIphone = e.indexOf('iphone') !== -1
  var isSymbianOS = e.indexOf('symbianos') !== -1
  var isWinPhone = e.indexOf('windows phone') !== -1
  var isIpad = e.indexOf('ipad') !== -1
  var k = isIphone || isWinPhone || isSymbianOS || isAndroid || isIpad
  var q =
      window.navigator &&
      window.navigator.msPointerEnabled &&
      window.navigator.msMaxTouchPoints &&
      !window.PointerEvent
  var t =
      (window.PointerEvent &&
        window.navigator.pointerEnabled &&
        window.navigator.maxTouchPoints) ||
      q
  var y =
      ('devicePixelRatio' in window && window.devicePixelRatio > 1) ||
      ('matchMedia' in window &&
        window.matchMedia('(min-resolution:144dppi)') &&
        window.matchMedia('(min-resolution:144dppi)').matches)
  var l = document.documentElement
  var A = a && 'transition' in l.style
  var x =
      'WebKitCSSMatrix' in window &&
      'm11' in new window.WebKitCSSMatrix() &&
      !r
  var B = 'MozPerspective' in l.style
  var z = 'OTransition' in l.style
  var G = !window.L_DISABLE_3D && (A || x || B || z) && !p
  p =
      !window.L_NO_TOUCH &&
      !p &&
      (function () {
        if (t || 'ontouchstart' in l) return !0
        var a = document.createElement('div')
        var c = !1
        if (!a.setAttribute) return !1
        a.setAttribute('ontouchstart', 'return;')
        typeof a.ontouchstart === 'function' && (c = !0)
        a.removeAttribute('ontouchstart')
        return c
      })()
  IDM.Browser = {
    ie: a,
    ielt9: c,
    webkit: f,
    gecko: gecko && !f && !window.opera && !a,
    android: isAndroid,
    android23: r,
    iphone: isIphone,
    ipad: isIpad,
    symbian: isSymbianOS,
    winphone: isWinPhone,
    chrome: m,
    ie3d: A,
    webkit3d: x,
    gecko3d: B,
    opera3d: z,
    any3d: G,
    mobile: k,
    mobileWebkit: k && f,
    mobileWebkit3d: k && x,
    mobileOpera: k && window.opera,
    touch: p,
    msPointer: q,
    pointer: t,
    retina: y
  }
})()

IDM.GeomUtil = {
  getBoundingRect: function (points) {
    var rect = new Rect()
    // if there are less than 1 point
    if (points.length < 2) {
      return rect
    }
    var minX = 9999999
    var minY = 9999999
    var maxX = -9999999
    var maxY = -9999999
    for (var i = 0; i < points.length - 1; i += 2) {
      if (points[i] > maxX) {
        maxX = points[i]
      }
      if (points[i] < minX) {
        minX = points[i]
      }
      if (points[i + 1] > maxY) {
        maxY = points[i + 1]
      }
      if (points[i + 1] < minY) {
        minY = points[i + 1]
      }
    }
    rect.tl = [minX, minY]
    rect.br = [maxX, maxY]
    return rect
  }
}
// ---------------------the IDM.DomUtil class--------------------
IDM.DomUtil = {
  getElementLeft: function (element) {
    var actualLeft = element.offsetLeft
    var current = element.offsetParent
    while (current !== null) {
      actualLeft += current.offsetLeft
      current = current.offsetParent
    }
    return actualLeft
  },

  getElementTop: function (element) {
    var actualTop = element.offsetTop
    var current = element.offsetParent
    while (current !== null) {
      actualTop += current.offsetTop
      current = current.offsetParent
    }
    return actualTop
  },

  getTranslateString: function (point) {
    var dim = IDM.Browser.webkit3d
    return (
      'translate' +
      (dim ? '3d' : '') +
      '(' +
      point[0] +
      'px,' +
      point[1] +
      'px' +
      ((dim ? ',0' : '') + ')')
    )
  },

  getPos: function (element) {
    return element._idm_pos
      ? element._idm_pos
      : [
        IDM.DomUtil.getElementLeft(element),
        IDM.DomUtil.getElementTop(element)
      ]
  },
  setPos: function (element, point) {
    element._idm_pos = point
    if (IDM.Browser.any3d) {
      element.style[IDM.DomUtil.TRANSFORM] = IDM.DomUtil.getTranslateString(point)
    } else {
      element.style.left = point[0] + 'px'
      element.style.top = point[1] + 'px'
    }
  },

  testProp: function (props) {
    for (var c = document.documentElement.style, i = 0; i < props.length; i++) { if (props[i] in c) return props[i] }
    return false
  }
}

IDM.DomUtil.TRANSFORM = IDM.DomUtil.testProp([
  'transform',
  'WebkitTransform',
  'OTransform',
  'MozTransform',
  'msTransform'
])
IDM.DomUtil.TRANSITION = IDM.DomUtil.testProp([
  'webkitTransition',
  'transition',
  'OTransition',
  'MozTransition',
  'msTransition'
])
IDM.DomUtil.TRANSITION_END =
  IDM.DomUtil.TRANSITION === 'webkitTransition' ||
  IDM.DomUtil.TRANSITION === 'OTransition'
    ? IDM.DomUtil.TRANSITION + 'End'
    : 'transitionend'

export default IDM
