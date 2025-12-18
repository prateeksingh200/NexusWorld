export class NexusTable extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        // Data State
        this._data = [];     // Always stores an Array of Objects (normalized)
        this._columns = []; 
        
        // Interaction State
        this._sortConfig = { key: null, direction: 'asc' }; // 'asc' or 'desc'
        this._filterQuery = ''; 
    }

    static get observedAttributes() {
        return ['preset'];
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.render();
        }
    }

    /**
     * MAIN ENTRY POINT
     * Accepts both JSON Array and SQL Result Set
     */
    set data(input) {
        // 1. Normalize the data into a standard format
        this._data = this._normalizeData(input);
        
        // 2. Auto-Discovery: If columns aren't set, guess them from the first row
        if (this._columns.length === 0 && this._data.length > 0) {
            this._autoDiscoverColumns(this._data[0]);
        }

        // 3. Render
        this.updateGridTemplate();
        this.render(); // Re-render shell to attach listeners
    }

    set columns(cols) {
        this._columns = cols;
        this.updateGridTemplate();
        this.render();
    }

    /**
     * PUBLIC METHOD: Call this from outside to filter the table
     * e.g. tableElement.filter('active')
     */
    filter(query) {
        this._filterQuery = query.toLowerCase();
        this.renderRows(); // Only re-render body for performance
    }

    // =========================================
    // SECTION 1: DATA NORMALIZATION & PROCESSING
    // =========================================

    _normalizeData(input) {
        if (!input) return [];

        // Case A: Standard JSON Array -> [{id:1}, {id:2}]
        if (Array.isArray(input)) {
            return input;
        }

        // Case B: SQL Result Set -> { headers: ['id'], rows: [[1]] }
        if (input.headers && Array.isArray(input.rows)) {
            return input.rows.map(rowArray => {
                const rowObject = {};
                input.headers.forEach((header, index) => {
                    // Map index of value to header name
                    rowObject[header] = rowArray[index];
                });
                return rowObject;
            });
        }

        console.error('NexusTable: Unknown data format', input);
        return [];
    }

    _processData() {
        let processed = [...this._data]; // Clone to avoid mutating original

        // 1. Filter
        if (this._filterQuery) {
            processed = processed.filter(row => {
                // Check all column values for the string
                return Object.values(row).some(val => 
                    String(val).toLowerCase().includes(this._filterQuery)
                );
            });
        }

        // 2. Sort
        if (this._sortConfig.key) {
            const { key, direction } = this._sortConfig;
            
            processed.sort((a, b) => {
                let valA = a[key];
                let valB = b[key];

                // Handle numeric sort correctly
                if (typeof valA === 'number' && typeof valB === 'number') {
                    return direction === 'asc' ? valA - valB : valB - valA;
                }

                // Default string sort
                valA = String(valA || '').toLowerCase();
                valB = String(valB || '').toLowerCase();
                
                if (valA < valB) return direction === 'asc' ? -1 : 1;
                if (valA > valB) return direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return processed;
    }

    _handleSort(key) {
        // Toggle direction if same key, else reset to asc
        if (this._sortConfig.key === key) {
            this._sortConfig.direction = this._sortConfig.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this._sortConfig = { key: key, direction: 'asc' };
        }

        this.render(); // Re-render headers (for arrow icons) and body
    }

    // =========================================
    // SECTION 2: FORMATTERS & HELPERS
    // =========================================

    /**
     * Helper: Decides how to render a single cell
     * logic: Formatter Fn > Type Preset > Raw Value
     */
    _renderCell(row, col) {
        const rawValue = row[col.key];

        // 1. Custom Formatter Function (Most powerful)
        if (typeof col.formatter === 'function') {
            return col.formatter(rawValue, row);
        }

        // 2. Built-in Types
        if (col.type === 'currency') {
            if (rawValue === null || rawValue === undefined) return '';
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(rawValue);
        }
        
        if (col.type === 'date') {
            if (!rawValue) return '';
            return new Date(rawValue).toLocaleDateString();
        }

        if (col.type === 'badge') {
            // Simple logic: map specific words to classes, or default to gray
            let statusClass = '';
            const valLower = String(rawValue || '').toLowerCase();
            
            if (['active', 'success', 'paid', 'complete'].includes(valLower)) statusClass = 'success';
            if (['pending', 'warning', 'hold', 'processing'].includes(valLower)) statusClass = 'warning';
            if (['inactive', 'error', 'failed', 'rejected', 'deleted'].includes(valLower)) statusClass = 'danger';
            
            return `<span class="nexus-badge ${statusClass}">${rawValue}</span>`;
        }

        // 3. Default Raw
        return rawValue !== undefined && rawValue !== null ? rawValue : '';
    }

    /**
     * Helper: Get alignment class
     */
    _getCellClass(col) {
        if (col.align === 'center') return 'nexus-cell text-center';
        if (col.align === 'right') return 'nexus-cell text-right';
        return 'nexus-cell text-left'; // default
    }

    _autoDiscoverColumns(rowObj) {
        this._columns = Object.keys(rowObj).map(key => ({
            key: key,
            title: key.charAt(0).toUpperCase() + key.slice(1), 
            width: '1fr'
        }));
    }

    updateGridTemplate() {
        // Build the CSS variable string (e.g., "50px 1fr 2fr")
        const template = this._columns
            .map(col => col.width || '1fr')
            .join(' ');
            
        this.style.setProperty('--nexus-grid-cols', template);
    }

    // =========================================
    // SECTION 3: RENDERING
    // =========================================

    getStyles() {
        return `
            <style>
                @import url('src/components/table.css'); 
            </style>
        `;
    }

    render() {
        this.shadowRoot.innerHTML = `
            ${this.getStyles()}
            <div class="nexus-table-container" role="grid">
                <div class="nexus-header" role="row">
                    ${this._columns.map(col => {
                        // Determine sort class
                        let sortClass = '';
                        if (this._sortConfig.key === col.key) {
                            sortClass = this._sortConfig.direction === 'asc' ? 'sort-asc' : 'sort-desc';
                        }
                        
                        return `
                        <div class="nexus-cell ${sortClass}" 
                             role="columnheader" 
                             data-key="${col.key}">
                            ${col.title}
                        </div>
                    `}).join('')}
                </div>
                <div class="nexus-body" role="rowgroup">
                    </div>
            </div>
        `;
        
        // Attach Sort Listeners
        const headers = this.shadowRoot.querySelectorAll('.nexus-cell[role="columnheader"]');
        headers.forEach(header => {
            header.addEventListener('click', () => {
                this._handleSort(header.dataset.key);
            });
        });

        // Initial Data Render
        this.renderRows();
    }

    renderRows() {
        const tbody = this.shadowRoot.querySelector('.nexus-body');
        if (!tbody) return;

        const displayData = this._processData();

        tbody.innerHTML = displayData.map((row, index) => {
            // DETECT GROUP ROW (The "Expense Period" Header)
            if (row.isGroup) {
                return `
                <div class="nexus-group-row" onclick="this.getRootNode().host.toggleGroup(${index})">
                    <div style="display:flex; align-items:center;">
                        <span class="toggle-icon">▼</span>
                        <span>${row.groupTitle}</span> 
                    </div>
                    <div>${row.groupSummary || ''}</div>
                </div>

                <div class="nexus-detail-container" id="group-${index}">
                    <nexus-table 
                        id="subtable-${index}"
                        preset="striped">
                    </nexus-table>
                    
                    <div class="nexus-footer-row">
                        ${row.footerHtml || ''}
                    </div>
                </div>
                `;
            }

            // ... (Standard Row Logic remains here) ...
            return `
            <div class="nexus-row" role="row">
                ${this._columns.map(col => `
                    <div class="${this._getCellClass(col)}" role="gridcell">
                        ${this._renderCell(row, col)}
                    </div>
                `).join('')}
            </div>
            `;
        }).join('');

        // Post-Render: We need to populate the subtables with data
        // This is the "Magic" part
        displayData.forEach((row, index) => {
            if (row.isGroup && row.children) {
                const subTable = this.shadowRoot.getElementById(`subtable-${index}`);
                if (subTable) {
                    // Pass the child data to the nested table
                    subTable.columns = row.childColumns; // Child specific columns
                    subTable.data = row.children;        // Child rows
                }
            }
        });
    }

    // New Helper: Toggle visibility
    toggleGroup(index) {
        const container = this.shadowRoot.getElementById(`group-${index}`);
        const header = container.previousElementSibling;
        
        if (container.style.display === 'none') {
            container.style.display = 'grid';
            header.classList.remove('collapsed');
        } else {
            container.style.display = 'none';
            header.classList.add('collapsed');
        }
    }
}

customElements.define('nexus-table', NexusTable);