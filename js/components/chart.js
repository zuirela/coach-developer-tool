/**
 * chart.js – Chart.js helper wrappers
 */
const CDChart = {
  _instances: {},

  destroyIfExists(id) {
    if (this._instances[id]) {
      this._instances[id].destroy();
      delete this._instances[id];
    }
  },

  radar(canvasId, labels, datasets) {
    this.destroyIfExists(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    this._instances[canvasId] = new Chart(ctx, {
      type: 'radar',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          r: {
            min: 0, max: 5,
            ticks: { stepSize: 1, font: { size: 10 }, color: '#718096' },
            grid: { color: 'rgba(0,0,0,0.06)' },
            pointLabels: { font: { size: 10, weight: '600' }, color: '#4a5568' },
            angleLines: { color: 'rgba(0,0,0,0.06)' }
          }
        },
        plugins: { legend: { display: true, position: 'bottom', labels: { font: { size: 10 }, boxWidth: 12 } } }
      }
    });
  },

  bar(canvasId, labels, datasets, opts = {}) {
    this.destroyIfExists(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    this._instances[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: opts.legend !== false } },
        scales: {
          y: { beginAtZero: true, max: opts.max || 5, grid: { color: 'rgba(0,0,0,0.04)' } },
          x: { grid: { display: false } }
        },
        ...opts
      }
    });
  },

  doughnut(canvasId, labels, data, colors) {
    this.destroyIfExists(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    this._instances[canvasId] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{ data, backgroundColor: colors, borderWidth: 2, borderColor: '#fff' }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: '65%',
        plugins: { legend: { position: 'bottom', labels: { font: { size: 10 }, boxWidth: 12 } } }
      }
    });
  },

  line(canvasId, labels, datasets) {
    this.destroyIfExists(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    this._instances[canvasId] = new Chart(ctx, {
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { font: { size: 10 }, boxWidth: 12 } } },
        scales: {
          y: { beginAtZero: false, min: 0, max: 5, grid: { color: 'rgba(0,0,0,0.04)' } },
          x: { grid: { display: false } }
        },
        elements: { line: { tension: 0.4 }, point: { radius: 4 } }
      }
    });
  }
};
