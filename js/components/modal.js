/**
 * modal.js – Bottom-sheet modal component
 */
const Modal = {
  open(title, bodyHTML, footerHTML = '') {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = bodyHTML;
    document.getElementById('modal-footer').innerHTML = footerHTML;
    const overlay = document.getElementById('modal-overlay');
    overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  },
  close() {
    const overlay = document.getElementById('modal-overlay');
    overlay.classList.add('hidden');
    document.body.style.overflow = '';
  },
  init() {
    document.getElementById('modal-close').addEventListener('click', () => this.close());
    document.getElementById('modal-overlay').addEventListener('click', (e) => {
      if (e.target === document.getElementById('modal-overlay')) this.close();
    });
  }
};
