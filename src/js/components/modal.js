/* src/js/components/modal.js */

const NexusModal = {
    init() {
        // 1. Setup Close Buttons (X or cancel)
        document.addEventListener('click', (e) => {
            if (e.target.matches('.modal-close') || e.target.closest('.modal-close')) {
                const modal = e.target.closest('.modal-overlay');
                if (modal) this.close(modal);
            }
        });

        // 2. Setup Click Outside
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.close(overlay);
                }
            });
        });

        // 3. Setup Escape Key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const activeModal = document.querySelector('.modal-overlay.active');
                if (activeModal) this.close(activeModal);
            }
        });
    },

    open(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        } else {
            console.error(`NexusModal: No modal found with ID "${modalId}"`);
        }
    },

    close(modalElement) {
        if (typeof modalElement === 'string') {
            modalElement = document.getElementById(modalElement);
        }
        if (modalElement) {
            modalElement.classList.remove('active');
        }
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    NexusModal.init();
});