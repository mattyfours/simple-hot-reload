import './style.css'

/**
 * Get the percentage that an element has scrolled through the middle of the viewport
 * @param {Node} target : Dom element
 * @param {Number} throughLine : Number from 0-1 representing the vertical line the percentage is calculated against
 * @returns percent
 */
export const scrollThroughPercentage = (target = null, throughLine = 0.5) => {
  if (target === null) { return null }

  const pageScrollPosition = window.scrollY || document.documentElement.scrollTop

  const bodyRect = document.body.getBoundingClientRect()
  const boundingRect = target.getBoundingClientRect()

  const adjustedScrollPos = pageScrollPosition + window.innerHeight * throughLine
  const targetTop = boundingRect.top - bodyRect.top
  const thisBottom = targetTop + boundingRect.height

  const percentage = ((adjustedScrollPos - targetTop) / (thisBottom - targetTop)) * 100

  return percentage
}

/**
 * Main Custom Element Class
 */
class HHAnimatedHeaderImage extends HTMLElement {
  static properties = {}

  constructor () {
    super()
    this.img = this.querySelector('img')
    this.headerImage = document.querySelector('header img')
    this.firstSection = document.querySelector('main section')
  }

  connectedCallback () {
    if (!this.img || !this.headerImage) {
      return null
    }

    this.valuesAdjust()

    window.addEventListener('resize', this.valuesAdjust.bind(this))
    window.addEventListener('scroll', this.scrollCheck.bind(this))
  }

  valuesAdjust () {
    // Reset Values
    this.img.style.width = null
    this.img.style.top = null

    // Get starting and end sizes
    const animatedImageRect = this.img.getBoundingClientRect()
    this.startingWidth = animatedImageRect.width
    this.startingTop = animatedImageRect.top + (animatedImageRect.height * 0.5)
    this.scrollCheck()
  }

  scrollCheck () {
    const headerImageRect = this.headerImage.getBoundingClientRect()
    this.targetWidth = headerImageRect.width
    this.targetTop = headerImageRect.top + (headerImageRect.height * 0.5)

    return this.hasAttribute('sectionTrigger') && this.firstSection !== null
      ? this.sectionBasedTrigger()
      : this.scrollAmountTrigger()
  }

  scrollAmountTrigger () {
    const scrollTriggerAmount = 10
    const animationDuration = 1000
    const pageScrollPosition = window.scrollY || document.documentElement.scrollTop
    this.img.style.transition = `top ${animationDuration}ms ease, width ${animationDuration}ms ease`

    if (scrollTriggerAmount > pageScrollPosition) { return null }
    this.img.style.width = `${this.targetWidth}px`
    this.img.style.top = `${this.targetTop}px`

    setTimeout(() => {
      this.headerImage.classList.toggle('visible', scrollTriggerAmount <= pageScrollPosition)
      this.img.classList.toggle('visible', scrollTriggerAmount > pageScrollPosition)
    }, animationDuration + 10)
  }

  sectionBasedTrigger () {
    const sectionScrollPercent = scrollThroughPercentage(
      this.firstSection,
      1
    ) - 100

    const adjustedPercent = (1 - Math.pow(1 - sectionScrollPercent * 0.01, 15)) * 100

    const adjustedWidth = adjustedPercent <= 0
      ? this.startingWidth
      : adjustedPercent >= 100
        ? this.targetWidth
        : this.startingWidth + (adjustedPercent / 100) * (this.targetWidth - this.startingWidth)

    const adjustedTop = adjustedPercent <= 0
      ? this.startingTop
      : adjustedPercent >= 100
        ? this.targetTop
        : this.startingTop + (adjustedPercent / 100) * (this.targetTop - this.startingTop)

    this.img.style.width = `${adjustedWidth}px`
    this.img.style.top = `${adjustedTop}px`

    this.headerImage.classList.toggle('visible', adjustedPercent >= 100)
    this.img.classList.toggle('visible', adjustedPercent < 100)
  }
}

if (typeof customElements.get('animated-header-image') === 'undefined') {
  customElements.define('animated-header-image', HHAnimatedHeaderImage)
}
