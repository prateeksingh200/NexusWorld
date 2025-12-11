class NexusIcon extends HTMLElement {
  static get observedAttributes() {
    return ['name', 'type', 'size', 'stroke-width'];
  }

  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
    }
  }

  render() {
    const name = this.getAttribute('name');
    const type = this.getAttribute('type') || 'outline';
    const strokeWidth = this.getAttribute('stroke-width') || '2'; // Default stroke width
    
    if (!name) return;

    const iconId = type === 'filled' ? `${name}-filled` : name;
    
    // LOGIC FIX:
    // If it's Filled: Fill = Color, Stroke = None
    // If it's Outline: Fill = None, Stroke = Color
    const isFilled = type === 'filled';
    const fillValue = isFilled ? 'currentColor' : 'none';
    const strokeValue = isFilled ? 'none' : 'currentColor';
    const currentStrokeWidth = isFilled ? '0' : strokeWidth;

    this.innerHTML = `
      <svg 
        class="nexus-svg" 
        aria-hidden="true" 
        focusable="false"
        fill="${fillValue}"
        stroke="${strokeValue}"
        stroke-width="${currentStrokeWidth}"
        stroke-linecap="round" 
        stroke-linejoin="round"
      >
        <use href="dist/nexus-icons.svg#${iconId}"></use>
      </svg>
    `;
  }
}

if (!customElements.get('nexus-icon')) {
  customElements.define('nexus-icon', NexusIcon);
}