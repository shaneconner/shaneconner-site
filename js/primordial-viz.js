(function () {
  'use strict';

  /* ── theme tokens ── */
  var C = {
    bg: '#090b09',
    card: '#131409',
    text: '#d4cfc3',
    dim: '#6a6a58',
    green: '#7a8a2a',
    bright: '#9aaa3a',
    border: '#22231a',
  };

  /* ── node type colors & labels ── */
  var NODE_COLOR = {
    0: '#d4cfc3', 1: '#a09888', 2: '#8a3a3a', 3: '#5a9aaa',
    4: '#9aaa3a', 5: '#b49a6e', 6: '#7a7868',
  };
  var NODE_LABEL = {
    0: 'Core', 1: 'Bone', 2: 'Muscle', 3: 'Sensor',
    4: 'Mouth', 5: 'Fat', 6: 'Armor',
  };
  var NODE_SHORT = { 0: 'C', 1: 'B', 2: 'M', 3: 'S', 4: 'Mo', 5: 'F', 6: 'Ar' };
  var EDGE_COLOR = { 0: '#666655', 1: '#8a3a3a', 2: '#555544' };
  var FOOD_COLOR = { p: '#5a8a2a', m: '#8a3a3a', n: '#6e5a3a' };

  /* ── species color palette ── */
  var speciesColors = {};
  var palette = [
    '#e6574e', '#4e9ae6', '#e6c74e', '#4ee6a2', '#b44ee6',
    '#e68a4e', '#4ecde6', '#8ae64e', '#e64ea2', '#4e6ae6',
    '#c7e64e', '#e64ece', '#4ee6e6', '#e6e64e', '#9a4ee6',
    '#4ee66a', '#e6504e', '#4e8ae6', '#e6a24e', '#6a4ee6',
  ];
  var nextColor = 0;

  function getSpeciesColor(sp) {
    if (!speciesColors[sp]) {
      speciesColors[sp] = palette[nextColor % palette.length];
      nextColor++;
    }
    return speciesColors[sp];
  }

  /* ── Viewer class (one per clip) ── */
  function Viewer(container, clipUrl) {
    var self = this;
    self.container = container;
    self.clipUrl = clipUrl;
    self.clip = null;
    self.frame = 0;
    self.playing = false;
    self.playInterval = null;
    self.playSpeed = 0.5;
    self.frameAccum = 0;
    self.canvas = null;
    self.ctx = null;
    self.camera = { x: 0, y: 0, zoom: 1 };
    self.worldW = 1600;
    self.worldH = 900;
    self.canvasW = 0;
    self.canvasH = 0;
    self.selectedOrg = null;

    self.build();
    self.load();
  }

  Viewer.prototype.build = function () {
    var self = this;

    self.container.innerHTML =
      '<div class="sim-canvas-wrap">' +
        '<canvas class="sim-canvas"></canvas>' +
      '</div>' +
      '<div class="sim-controls">' +
        '<button class="sim-btn sim-play-btn">Pause</button>' +
        '<input type="range" min="0" max="1" value="0" step="1" class="sim-scrub" />' +
        '<span class="sim-label sim-frame-label">0 / 0</span>' +
        '<select class="sim-select sim-speed-select">' +
          '<option value="0.125">1/8x</option>' +
          '<option value="0.25">1/4x</option>' +
          '<option value="0.5" selected>1/2x</option>' +
          '<option value="1">1x</option>' +
          '<option value="2">2x</option>' +
          '<option value="4">4x</option>' +
          '<option value="8">8x</option>' +
        '</select>' +
      '</div>' +
      '<div class="sim-stats-bar">' +
        '<span class="sim-stat-pop">Pop: --</span>' +
        '<span class="sim-stat-species">Species: --</span>' +
        '<span class="sim-stat-gen">Gen: --</span>' +
        '<span class="sim-stat-food">Food: --</span>' +
        '<span class="sim-stat-tick">Tick: --</span>' +
      '</div>' +
      '<div class="sim-legend">' + buildLegendHTML() + '</div>' +
      '<div class="sim-inspect" style="display:none;"></div>' +
      '';

    self.canvas = self.container.querySelector('.sim-canvas');
    self.ctx = self.canvas.getContext('2d');

    // Size canvas to 16:9
    var wrap = self.container.querySelector('.sim-canvas-wrap');
    self.canvasW = wrap.clientWidth;
    self.canvasH = Math.round(self.canvasW * 9 / 16);
    self.canvas.width = self.canvasW;
    self.canvas.height = self.canvasH;

    // Fit world (zoom to fill, then clamp)
    self.camera.zoom = Math.min(self.canvasW / self.worldW, self.canvasH / self.worldH);
    self.camera.x = 0;
    self.camera.y = 0;
    self.clampCamera();

    // Controls
    self.container.querySelector('.sim-play-btn').addEventListener('click', function () { self.togglePlay(); });
    self.container.querySelector('.sim-scrub').addEventListener('input', function (e) {
      self.frame = parseInt(e.target.value);
      self.renderFrame();
      self.updateUI();
    });
    self.container.querySelector('.sim-speed-select').addEventListener('change', function (e) {
      self.playSpeed = parseFloat(e.target.value);
      if (self.playing) self.startPlayback();
    });

    // Click / zoom
    self.canvas.addEventListener('click', function (e) { self.onClick(e); });
    self.canvas.addEventListener('wheel', function (e) { self.onWheel(e); }, { passive: false });

    // Pan
    var dragging = false, dragStart = {}, camStart = {};
    self.canvas.addEventListener('mousedown', function (e) {
      dragging = true;
      dragStart = { x: e.clientX, y: e.clientY };
      camStart = { x: self.camera.x, y: self.camera.y };
    });
    self.canvas.addEventListener('mousemove', function (e) {
      if (!dragging) return;
      self.camera.x = camStart.x + (e.clientX - dragStart.x) / self.camera.zoom;
      self.camera.y = camStart.y + (e.clientY - dragStart.y) / self.camera.zoom;
      self.clampCamera();
      if (!self.playing) self.renderFrame();
    });
    self.canvas.addEventListener('mouseup', function () { dragging = false; });
    self.canvas.addEventListener('mouseleave', function () { dragging = false; });

    // Autoplay when scrolled into view, pause when out
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && self.clip && !self.playing) {
          self.togglePlay();
        } else if (!entry.isIntersecting && self.playing) {
          self.togglePlay();
        }
      });
    }, { threshold: 0.3 });
    observer.observe(self.container);
  };

  Viewer.prototype.load = function () {
    var self = this;
    fetch(self.clipUrl)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        self.clip = data;
        self.worldW = data.world ? data.world.width : 1600;
        self.worldH = data.world ? data.world.height : 900;

        self.camera.zoom = Math.min(self.canvasW / self.worldW, self.canvasH / self.worldH);
        self.camera.x = 0;
        self.camera.y = 0;
        self.clampCamera();

        self.container.querySelector('.sim-scrub').max = data.snapshots.length - 1;
        self.frame = 0;
        self.renderFrame();
        self.updateUI();
      })
      .catch(function (err) {
        console.error('Failed to load clip:', self.clipUrl, err);
      });
  };

  Viewer.prototype.togglePlay = function () {
    this.playing = !this.playing;
    this.container.querySelector('.sim-play-btn').textContent = this.playing ? 'Pause' : 'Play';
    if (this.playing) this.startPlayback();
    else this.stopPlayback();
  };

  Viewer.prototype.startPlayback = function () {
    var self = this;
    self.stopPlayback();
    self.frameAccum = 0;
    self.playInterval = setInterval(function () {
      self.frameAccum += self.playSpeed;
      var advance = Math.floor(self.frameAccum);
      if (advance >= 1) {
        self.frameAccum -= advance;
        self.frame += advance;
        if (self.frame >= self.clip.snapshots.length) self.frame = 0;
        self.renderFrame();
        self.updateUI();
        self.container.querySelector('.sim-scrub').value = self.frame;
      }
    }, 33);
  };

  Viewer.prototype.stopPlayback = function () {
    if (this.playInterval) { clearInterval(this.playInterval); this.playInterval = null; }
  };

  Viewer.prototype.renderFrame = function () {
    var self = this;
    if (!self.clip || !self.clip.snapshots[self.frame]) return;
    var snap = self.clip.snapshots[self.frame];
    var ctx = self.ctx;

    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, self.canvasW, self.canvasH);
    ctx.save();
    ctx.translate(self.camera.x * self.camera.zoom, self.camera.y * self.camera.zoom);
    ctx.scale(self.camera.zoom, self.camera.zoom);

    ctx.strokeStyle = C.border;
    ctx.lineWidth = 1 / self.camera.zoom;
    ctx.strokeRect(0, 0, self.worldW, self.worldH);

    // Resources
    var resources = snap.r || [];
    ctx.globalAlpha = 0.45;
    for (var ri = 0; ri < resources.length; ri++) {
      var r = resources[ri];
      ctx.fillStyle = FOOD_COLOR[r[2]] || '#444';
      ctx.beginPath();
      ctx.arc(r[0], r[1], 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Organisms
    var orgs = snap.o || [];
    var wtX = self.worldW * 0.4, wtY = self.worldH * 0.4;
    for (var oi = 0; oi < orgs.length; oi++) {
      drawOrganism(ctx, orgs[oi], orgs[oi] === self.selectedOrg, wtX, wtY);
    }

    ctx.restore();
    self.container.querySelector('.sim-frame-label').textContent =
      (self.frame + 1) + ' / ' + self.clip.snapshots.length;
  };

  Viewer.prototype.updateUI = function () {
    var self = this;
    if (!self.clip || !self.clip.snapshots[self.frame]) return;
    var s = self.clip.snapshots[self.frame].s;
    self.container.querySelector('.sim-stat-pop').textContent = 'Pop: ' + s.pop;
    self.container.querySelector('.sim-stat-species').textContent = 'Species: ' + s.sp;
    self.container.querySelector('.sim-stat-gen').textContent = 'Gen: ' + s.gen;
    self.container.querySelector('.sim-stat-food').textContent = 'Food: ' + s.food;
    self.container.querySelector('.sim-stat-tick').textContent = 'Tick: ' + self.clip.snapshots[self.frame].t;
  };

  Viewer.prototype.onClick = function (e) {
    var self = this;
    if (!self.clip || !self.clip.snapshots[self.frame]) return;
    var rect = self.canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left) / self.camera.zoom - self.camera.x;
    var my = (e.clientY - rect.top) / self.camera.zoom - self.camera.y;

    var orgs = self.clip.snapshots[self.frame].o || [];
    var closest = null, closestDist = 25;
    for (var i = 0; i < orgs.length; i++) {
      var core = orgs[i].n[0];
      var d = Math.sqrt((core[0] - mx) * (core[0] - mx) + (core[1] - my) * (core[1] - my));
      if (d < closestDist) { closestDist = d; closest = orgs[i]; }
    }

    self.selectedOrg = closest;
    if (!self.playing) self.renderFrame();
    self.showInspect(closest);
  };

  Viewer.prototype.showInspect = function (org) {
    var panel = this.container.querySelector('.sim-inspect');
    if (!org) { panel.style.display = 'none'; return; }
    var nodeTypes = {};
    for (var i = 0; i < org.n.length; i++) { var t = org.n[i][2]; nodeTypes[t] = (nodeTypes[t] || 0) + 1; }
    var bodyDesc = Object.keys(nodeTypes).map(function (t) { return nodeTypes[t] + ' ' + (NODE_LABEL[t] || '?'); }).join(', ');
    panel.style.display = 'block';
    panel.innerHTML =
      '<strong>' + org.id + '</strong>' +
      '<span class="sim-inspect-sp" style="color:' + getSpeciesColor(org.sp) + '">' + org.sp + '</span>' +
      '<div class="sim-inspect-row">Energy: ' + org.e + ' | Gen: ' + org.g + '</div>' +
      '<div class="sim-inspect-row">Body: ' + bodyDesc + '</div>' +
      '<div class="sim-inspect-row">Nodes: ' + org.n.length + ' | Edges: ' + org.ed.length + '</div>';
  };

  Viewer.prototype.clampCamera = function () {
    // Minimum zoom: world exactly fills canvas (no void beyond edges)
    var minZoom = Math.min(this.canvasW / this.worldW, this.canvasH / this.worldH);
    if (this.camera.zoom < minZoom) this.camera.zoom = minZoom;

    // Visible area in world coords
    var visW = this.canvasW / this.camera.zoom;
    var visH = this.canvasH / this.camera.zoom;

    if (visW >= this.worldW) {
      // World fits horizontally — center it
      this.camera.x = (visW - this.worldW) / 2;
    } else {
      // Clamp pan so we don't show void
      this.camera.x = Math.max(0, Math.min(this.worldW - visW, this.camera.x));
    }
    if (visH >= this.worldH) {
      this.camera.y = (visH - this.worldH) / 2;
    } else {
      this.camera.y = Math.max(0, Math.min(this.worldH - visH, this.camera.y));
    }
  };

  Viewer.prototype.onWheel = function (e) {
    e.preventDefault();
    var rect = this.canvas.getBoundingClientRect();
    var mx = e.clientX - rect.left, my = e.clientY - rect.top;
    var oldZoom = this.camera.zoom;
    var factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
    this.camera.zoom = Math.min(10, this.camera.zoom * factor);
    this.camera.x += mx / this.camera.zoom - mx / oldZoom;
    this.camera.y += my / this.camera.zoom - my / oldZoom;
    this.clampCamera();
    if (!this.playing) this.renderFrame();
  };

  /* ── shared helpers ── */
  function drawOrganism(ctx, org, highlight, wrapThreshX, wrapThreshY) {
    var nodes = org.n, edges = org.ed;
    if (!nodes || nodes.length === 0) return;
    var spColor = getSpeciesColor(org.sp);
    var nCount = nodes.length;
    // Scale node sizes with body complexity (subtle)
    var nodeScale = nCount > 5 ? 1 + (nCount - 5) * 0.05 : 1;
    nodeScale = Math.min(nodeScale, 1.5);

    for (var ei = 0; ei < edges.length; ei++) {
      var e = edges[ei], n1 = nodes[e[0]], n2 = nodes[e[1]];
      if (Math.abs(n1[0] - n2[0]) > wrapThreshX || Math.abs(n1[1] - n2[1]) > wrapThreshY) continue;
      ctx.strokeStyle = EDGE_COLOR[e[2]] || '#444';
      ctx.lineWidth = (e[2] === 1 ? 1.5 : 0.7) * nodeScale;
      ctx.beginPath(); ctx.moveTo(n1[0], n1[1]); ctx.lineTo(n2[0], n2[1]); ctx.stroke();
    }
    for (var ni = 0; ni < nodes.length; ni++) {
      var n = nodes[ni];
      ctx.fillStyle = NODE_COLOR[n[2]] || '#888';
      var r = (n[2] === 0 ? 3 : 2.2) * nodeScale;
      ctx.beginPath(); ctx.arc(n[0], n[1], r, 0, Math.PI * 2); ctx.fill();
    }
    // Dynamic species ring: radius from core to furthest node + padding
    var core = nodes[0];
    var maxR = 0;
    for (var bi = 1; bi < nodes.length; bi++) {
      var dx = nodes[bi][0] - core[0], dy = nodes[bi][1] - core[1];
      var d = Math.sqrt(dx * dx + dy * dy);
      if (d > maxR) maxR = d;
    }
    var ringR = Math.max(maxR + 3, 4.5);
    ctx.strokeStyle = spColor; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(core[0], core[1], ringR, 0, Math.PI * 2); ctx.stroke();
    if (highlight) {
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(core[0], core[1], ringR + 2, 0, Math.PI * 2); ctx.stroke();
    }
  }

  function buildLegendHTML() {
    var html = '<div class="sim-legend-row">';
    [0,1,2,3,4,5,6].forEach(function (t) {
      html += '<span class="sim-legend-item"><span class="sim-legend-dot" style="background:' + NODE_COLOR[t] + '"></span>' + NODE_LABEL[t] + '</span>';
    });
    html += '</div><div class="sim-legend-row">';
    html += '<span class="sim-legend-item"><span class="sim-legend-dot" style="background:#5a8a2a"></span>Plant</span>';
    html += '<span class="sim-legend-item"><span class="sim-legend-dot" style="background:#8a3a3a"></span>Meat</span>';
    html += '<span class="sim-legend-item"><span class="sim-legend-dot" style="background:#6e5a3a"></span>Nutrient</span>';
    html += '</div>';
    return html;
  }

  /* ── Initialize all viewers on page ── */
  function initViewers() {
    var viewers = document.querySelectorAll('[data-sim-clip]');
    for (var i = 0; i < viewers.length; i++) {
      new Viewer(viewers[i], viewers[i].getAttribute('data-sim-clip'));
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initViewers);
  } else {
    initViewers();
  }
})();
