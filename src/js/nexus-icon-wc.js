/* src/js/nexus-icon-wc.js */

class NexusIcon extends HTMLElement {
    static get observedAttributes() {
        return ['name'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.render();
        }
    }

    connectedCallback() {
        this.render();
    }

    render() {
        const iconName = this.getAttribute('name');
        if (!iconName) return;

        // 1. AUTOMATIC DETECTION
        // If the filename ends with "-filled", switch to Filled Mode
        if (iconName.includes('filled')) {
            this.classList.add('nxs-variant-filled');
        } else {
            this.classList.remove('nxs-variant-filled');
        }

        // 2. Inject SVG
        this.innerHTML = `
            <svg class="nxs-icon" aria-hidden="true" focusable="false">
                <use href="dist/nexus-icons.svg#${iconName}"></use>
            </svg>
        `;
    }
}

if (!customElements.get('nxs-icon')) {
    customElements.define('nxs-icon', NexusIcon);
}