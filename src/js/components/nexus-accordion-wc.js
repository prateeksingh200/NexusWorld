class NexusAccordion extends HTMLElement {
  connectedCallback() {
    console.log('NexusAccordion: Component connected.');
    this.classList.add('nxs-accordion');
    this.addEventListener('click', (e) => this.handleInteraction(e));
  }

  handleInteraction(e) {
    const trigger = e.target.closest('.nxs-accordion-trigger');
    if (!trigger) return;

    console.log('NexusAccordion: Click detected on trigger', trigger);
    this.toggle(trigger);
  }

  toggle(trigger) {
    const contentId = trigger.getAttribute('aria-controls');
    console.log(`NexusAccordion: Looking for content with ID: #${contentId}`);

    // Note: We search inside 'this' component
    const content = this.querySelector(`#${contentId}`);

    if (!content) {
      console.error(`NexusAccordion: Error! Could not find element with id="${contentId}" inside this component.`);
      return;
    }

    const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
    console.log(`NexusAccordion: Current state expanded? ${isExpanded}. Switching to ${!isExpanded}`);

    // Toggle State
    trigger.setAttribute('aria-expanded', !isExpanded);

    // Toggle Height
    if (isExpanded) {
      console.log('NexusAccordion: Collapsing content.');
      content.style.maxHeight = null; 
    } else {
      console.log(`NexusAccordion: Expanding content. ScrollHeight is ${content.scrollHeight}px`);
      content.style.maxHeight = content.scrollHeight + "px";
    }
  }
}

customElements.define('nxs-accordion', NexusAccordion);