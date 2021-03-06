/**
 * ScrollId
 * Author limi58
 * https://github.com/limi58/ScrollId
 * http://www.imbgf.com
 */
import Animate from 'ease-animate'
import Touch from 'easy-touch'
const animate = new Animate()

function ScrollId (sequence, config = {}) {
  verifyParams(sequence, config)
  const SEQUENCE = sequence
  let TOP_SEQUENCE = []

  const DURATION = config.duration || 'slow'
  const EASE = config.ease || 'circleInOut'
  const IS_LOOP = config.isLoop || true
  const IS_TOUCH = config.isTouch || false
  const onLeaveCb = config.onLeave
  const onDoneCb = config.onDone

  const SECTION_COUNT = SS('section').length
  let hashStack = []

  start()

  function verifyParams (sequence, config) {
    if (Object.prototype.toString.call(sequence) !== '[object Array]') throw new Error('"sequence" should be a Array')
    if (config != null) {
      if (Object.prototype.toString.call(config) !== '[object Object]') throw new Error('"config" should be a Object')
    }
  }

  function start () {
    setTopSequence()
    // setEase()
    addEvent()
    const currentHash = getCurrentHash()
    // if current hash no first section, will animate to target hash
    if (currentHash === null) {
      setHash(SEQUENCE[0])
      hashStack.unshift(SEQUENCE[0])
    }
    if (currentHash !== SEQUENCE[0] && currentHash !== null) {
      setHash(SEQUENCE[0])
      setHash(currentHash)
      hashStack.unshift(currentHash, SEQUENCE[0])
    }
  }

  function setTopSequence () {
    TOP_SEQUENCE = SEQUENCE.map(id => S(`[data-scroll-id="${id}"]`).offsetTop)
  }

  function addEvent () {
    if (IS_TOUCH) onTouch()
    // listen url hash change
    window.addEventListener('hashchange', onHashChange)
    // listen mouse wheel event
    window.addEventListener('wheel', onWheel)
  }

  function onTouch () {
    window.addEventListener('touchmove', e => e.preventDefault())
    // listen panup pandowm
    const touch = new Touch(document.querySelector('body'))
    touch.on('pan', e => {
      switch (e.type) {
        case 'panup':
          setHashByScroll('down')
          break
        case 'pandown':
          setHashByScroll('up')
          break
      }
    })
  }

  function onWheel (e) {
    e.preventDefault()
    if (e.deltaY < 0) {
      setHashByScroll('up')
    } else {
      setHashByScroll('down')
    }
  }

  function onHashChange (e) {
    e.preventDefault()
    const hash = location.hash.replace('#!', '')
    const sectionTop = getSectionTop(hash)
    hashStack.unshift(hash)
    if (onLeaveCb) {
      onLeaveCb(hashStack.length >= 2 ? hashStack[1] : hashStack[0])
    }
    animate.scrollAnimate({
      targetValue: sectionTop,
      duration: DURATION,
      easing: EASE,
      onDone () {
        onDoneCb(getCurrentHash())
      },
    })
    setTimeout(() => {
      hashStack = hashStack.slice(0, 2)
    }, 0)
  }

  function getSectionTop (hash) {
    const sectionIndex = SEQUENCE.indexOf(hash)
    const top = TOP_SEQUENCE[sectionIndex]
    return top
  }

  function getCurrentHash () {
    if (!location.hash.match(/#!/)) {
      return null
    }
    return location.hash.replace('#!', '')
  }

  function setHash (hash) {
    location.hash = `#!${hash}`
  }

  // set hash to location by scroll direction
  function setHashByScroll (direction) {
    if (animate.isScrolling) return

    const currentHash = getCurrentHash() || SEQUENCE[0]
    const currentHashIndex = SEQUENCE.indexOf(currentHash)
    let targetHash = ''

    if (direction === 'up') {
      // is over top
      if (currentHashIndex === 0 && IS_LOOP) {
        targetHash = SEQUENCE[SECTION_COUNT - 1]
      } else {
        targetHash = SEQUENCE[currentHashIndex - 1]
      }
    } else {
      if (currentHashIndex === SECTION_COUNT - 1 && IS_LOOP) {
        targetHash = SEQUENCE[0]
      } else {
        targetHash = SEQUENCE[currentHashIndex + 1]
      }
    }
    // change hash
    setHash(targetHash)
  }

  function S (selector) {
    return document.querySelector(selector)
  }

  function SS (selector) {
    return document.querySelectorAll(selector)
  }
}

export default ScrollId
