(function () {
  'use strict';

  /* ── theme tokens (matching site design system) ── */
  var C = {
    bg: '#090b09',
    card: '#131409',
    text: '#d4cfc3',
    dim: '#6a6a58',
    green: '#7a8a2a',
    bright: '#9aaa3a',
    border: '#22231a',
  };

  /* ── node type colors ── */
  var NODE_COLOR = {
    0: '#d4cfc3',  // core
    1: '#a09888',  // bone
    2: '#8a3a3a',  // muscle anchor
    3: '#5a9aaa',  // sensor
    4: '#9aaa3a',  // mouth
    5: '#b49a6e',  // fat
    6: '#7a7868',  // armor
  };

  var NODE_LABEL = {
    0: 'Core', 1: 'Bone', 2: 'Muscle', 3: 'Sensor',
    4: 'Mouth', 5: 'Fat', 6: 'Armor',
  };

  var EDGE_COLOR = {
    0: '#666655',  // bone
    1: '#8a3a3a',  // muscle
    2: '#555544',  // tendon
  };

  var FOOD_COLOR = { p: '#5a8a2a', m: '#8a3a3a', n: '#6e5a3a' };

  /* ── state ── */
  var clip = null;
  var frame = 0;
  var playing = false;
  var playInterval = null;
  var playSpeed = 1;
  var canvas, ctx;
  var camera = { x: 0, y: 0, zoom: 1 };
  var worldW = 500, worldH = 500;
  var selectedOrg = null;
  var canvasW, canvasH;

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

  /* ── init ── */
  function init() {
    var container = document.getElementById('sim-viewer');
    if (!container) return;

    // Build viewer UI
    container.innerHTML =
      '<div class="sim-canvas-wrap">' +
        '<canvas id="sim-canvas"></canvas>' +
      '</div>' +
      '<div class="sim-controls">' +
        '<button id="sim-play" class="sim-btn">Play</button>' +
        '<input id="sim-scrub" type="range" min="0" max="1" value="0" step="1" class="sim-scrub" />' +
        '<span id="sim-frame-label" class="sim-label">0 / 0</span>' +
        '<select id="sim-speed" class="sim-select">' +
          '<option value="1">1x</option>' +
          '<option value="2">2x</option>' +
          '<option value="4" selected>4x</option>' +
          '<option value="8">8x</option>' +
        '</select>' +
      '</div>' +
      '<div class="sim-stats-bar">' +
        '<span id="sim-stat-pop">Pop: --</span>' +
        '<span id="sim-stat-species">Species: --</span>' +
        '<span id="sim-stat-gen">Gen: --</span>' +
        '<span id="sim-stat-food">Food: --</span>' +
        '<span id="sim-stat-tick">Tick: --</span>' +
      '</div>' +
      '<div id="sim-inspect" class="sim-inspect" style="display:none;"></div>';

    canvas = document.getElementById('sim-canvas');
    ctx = canvas.getContext('2d');

    // Size canvas
    var wrap = container.querySelector('.sim-canvas-wrap');
    canvasW = wrap.clientWidth;
    canvasH = Math.min(canvasW, 600);
    canvas.width = canvasW;
    canvas.height = canvasH;

    // Fit world to canvas
    camera.zoom = Math.min(canvasW / worldW, canvasH / worldH) * 0.95;
    camera.x = (canvasW / camera.zoom - worldW) / 2;
    camera.y = (canvasH / camera.zoom - worldH) / 2;

    // Controls
    document.getElementById('sim-play').addEventListener('click', togglePlay);
    document.getElementById('sim-scrub').addEventListener('input', onScrub);
    document.getElementById('sim-speed').addEventListener('change', onSpeed);

    // Mouse interaction
    canvas.addEventListener('click', onClick);
    canvas.addEventListener('wheel', onWheel, { passive: false });

    // Pan
    var dragging = false, dragStart = { x: 0, y: 0 }, camStart = { x: 0, y: 0 };
    canvas.addEventListener('mousedown', function (e) {
      dragging = true;
      dragStart = { x: e.clientX, y: e.clientY };
      camStart = { x: camera.x, y: camera.y };
    });
    canvas.addEventListener('mousemove', function (e) {
      if (!dragging) return;
      camera.x = camStart.x + (e.clientX - dragStart.x) / camera.zoom;
      camera.y = camStart.y + (e.clientY - dragStart.y) / camera.zoom;
      if (!playing) renderFrame();
    });
    canvas.addEventListener('mouseup', function () { dragging = false; });
    canvas.addEventListener('mouseleave', function () { dragging = false; });

    // Load clip data
    loadClip();
  }

  function loadClip() {
    fetch('/data/primordial-clip-long.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        clip = data;
        worldW = data.world ? data.world.width : 500;
        worldH = data.world ? data.world.height : 500;

        // Refit camera
        camera.zoom = Math.min(canvasW / worldW, canvasH / worldH) * 0.95;
        camera.x = (canvasW / camera.zoom - worldW) / 2;
        camera.y = (canvasH / camera.zoom - worldH) / 2;

        var scrub = document.getElementById('sim-scrub');
        scrub.max = clip.snapshots.length - 1;
        frame = 0;
        renderFrame();
        updateStats();
      })
      .catch(function (err) {
        console.error('Failed to load clip:', err);
      });
  }

  /* ── playback ── */
  function togglePlay() {
    playing = !playing;
    document.getElementById('sim-play').textContent = playing ? 'Pause' : 'Play';
    if (playing) {
      startPlayback();
    } else {
      stopPlayback();
    }
  }

  function startPlayback() {
    stopPlayback();
    playInterval = setInterval(function () {
      frame += playSpeed;
      if (frame >= clip.snapshots.length) {
        frame = 0; // loop
      }
      renderFrame();
      updateStats();
      document.getElementById('sim-scrub').value = frame;
    }, 33); // ~30fps
  }

  function stopPlayback() {
    if (playInterval) {
      clearInterval(playInterval);
      playInterval = null;
    }
  }

  function onScrub(e) {
    frame = parseInt(e.target.value);
    renderFrame();
    updateStats();
  }

  function onSpeed(e) {
    playSpeed = parseInt(e.target.value);
    if (playing) {
      startPlayback(); // restart with new speed
    }
  }

  /* ── rendering ── */
  function renderFrame() {
    if (!clip || !clip.snapshots[frame]) return;
    var snap = clip.snapshots[frame];

    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, canvasW, canvasH);

    ctx.save();
    ctx.translate(camera.x * camera.zoom, camera.y * camera.zoom);
    ctx.scale(camera.zoom, camera.zoom);

    // World border
    ctx.strokeStyle = C.border;
    ctx.lineWidth = 1 / camera.zoom;
    ctx.strokeRect(0, 0, worldW, worldH);

    // Resources
    var resources = snap.r || [];
    for (var ri = 0; ri < resources.length; ri++) {
      var r = resources[ri];
      ctx.fillStyle = FOOD_COLOR[r[2]] || '#444';
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.arc(r[0], r[1], 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Organisms
    var orgs = snap.o || [];
    for (var oi = 0; oi < orgs.length; oi++) {
      var org = orgs[oi];
      drawOrganism(org, org === selectedOrg);
    }

    ctx.restore();

    // Frame label
    document.getElementById('sim-frame-label').textContent =
      (frame + 1) + ' / ' + clip.snapshots.length;
  }

  function drawOrganism(org, highlight) {
    var nodes = org.n;
    var edges = org.ed;
    if (!nodes || nodes.length === 0) return;

    var spColor = getSpeciesColor(org.sp);

    // Draw edges (skip wrap-around artifacts)
    var wrapThreshX = worldW * 0.4;
    var wrapThreshY = worldH * 0.4;
    for (var ei = 0; ei < edges.length; ei++) {
      var e = edges[ei];
      var n1 = nodes[e[0]];
      var n2 = nodes[e[1]];
      // Skip edges that span across the world wrap boundary
      if (Math.abs(n1[0] - n2[0]) > wrapThreshX || Math.abs(n1[1] - n2[1]) > wrapThreshY) continue;
      ctx.strokeStyle = EDGE_COLOR[e[2]] || '#444';
      ctx.lineWidth = e[2] === 1 ? 1.2 : 0.6; // muscles thicker
      ctx.beginPath();
      ctx.moveTo(n1[0], n1[1]);
      ctx.lineTo(n2[0], n2[1]);
      ctx.stroke();
    }

    // Draw nodes
    for (var ni = 0; ni < nodes.length; ni++) {
      var n = nodes[ni];
      var nodeType = n[2];
      ctx.fillStyle = NODE_COLOR[nodeType] || '#888';
      var size = nodeType === 0 ? 2.5 : 1.8;

      ctx.beginPath();
      ctx.arc(n[0], n[1], size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Species color ring around core
    var core = nodes[0];
    ctx.strokeStyle = spColor;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.arc(core[0], core[1], 3.5, 0, Math.PI * 2);
    ctx.stroke();

    // Highlight ring for selected
    if (highlight) {
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(core[0], core[1], 5, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function updateStats() {
    if (!clip || !clip.snapshots[frame]) return;
    var s = clip.snapshots[frame].s;
    document.getElementById('sim-stat-pop').textContent = 'Pop: ' + s.pop;
    document.getElementById('sim-stat-species').textContent = 'Species: ' + s.sp;
    document.getElementById('sim-stat-gen').textContent = 'Gen: ' + s.gen;
    document.getElementById('sim-stat-food').textContent = 'Food: ' + s.food;
    document.getElementById('sim-stat-tick').textContent = 'Tick: ' + clip.snapshots[frame].t;
  }

  /* ── interaction ── */
  function onClick(e) {
    if (!clip || !clip.snapshots[frame]) return;
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left) / camera.zoom - camera.x;
    var my = (e.clientY - rect.top) / camera.zoom - camera.y;

    var orgs = clip.snapshots[frame].o || [];
    var closest = null;
    var closestDist = 20; // click radius in world units

    for (var i = 0; i < orgs.length; i++) {
      var org = orgs[i];
      var core = org.n[0];
      var dx = core[0] - mx;
      var dy = core[1] - my;
      var d = Math.sqrt(dx * dx + dy * dy);
      if (d < closestDist) {
        closestDist = d;
        closest = org;
      }
    }

    selectedOrg = closest;
    if (!playing) renderFrame();
    showInspect(closest);
  }

  function showInspect(org) {
    var panel = document.getElementById('sim-inspect');
    if (!org) {
      panel.style.display = 'none';
      return;
    }

    var nodeTypes = {};
    for (var i = 0; i < org.n.length; i++) {
      var t = org.n[i][2];
      nodeTypes[t] = (nodeTypes[t] || 0) + 1;
    }

    var bodyDesc = Object.keys(nodeTypes).map(function (t) {
      return nodeTypes[t] + ' ' + (NODE_LABEL[t] || '?');
    }).join(', ');

    panel.style.display = 'block';
    panel.innerHTML =
      '<strong>' + org.id + '</strong>' +
      '<span class="sim-inspect-sp" style="color:' + getSpeciesColor(org.sp) + '">' + org.sp + '</span>' +
      '<div class="sim-inspect-row">Energy: ' + org.e + ' | Gen: ' + org.g + '</div>' +
      '<div class="sim-inspect-row">Body: ' + bodyDesc + '</div>' +
      '<div class="sim-inspect-row">Nodes: ' + org.n.length + ' | Edges: ' + org.ed.length + '</div>';
  }

  function onWheel(e) {
    e.preventDefault();
    var rect = canvas.getBoundingClientRect();
    var mx = e.clientX - rect.left;
    var my = e.clientY - rect.top;

    var oldZoom = camera.zoom;
    var factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
    camera.zoom = Math.max(0.3, Math.min(10, camera.zoom * factor));

    // Zoom toward mouse position
    camera.x += mx / camera.zoom - mx / oldZoom;
    camera.y += my / camera.zoom - my / oldZoom;

    if (!playing) renderFrame();
  }

  /* ── launch ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
