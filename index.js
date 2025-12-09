const buttons = document.querySelectorAll('[data-target]');
const switchButtons = document.querySelectorAll('.switch');
const panels = {
  clients: document.getElementById('panel-clients'),
  talent: document.getElementById('panel-talent')
};

function activatePanel(key) {
  switchButtons.forEach(btn => {
    const active = btn.dataset.target === key;
    btn.classList.toggle('active', active);
  });
  Object.entries(panels).forEach(([name, panel]) => {
    panel.classList.toggle('active', name === key);
  });
}

switchButtons.forEach(btn => {
  btn.addEventListener('click', () => activatePanel(btn.dataset.target));
});

buttons.forEach(btn => {
  btn.addEventListener('click', () => {
    const targetId = btn.dataset.target;
    const section = document.getElementById(targetId);
    activatePanel(targetId === 'clients' || targetId === 'talent' ? targetId : 'clients');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
