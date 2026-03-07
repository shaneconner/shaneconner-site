// Resonance — Music Intelligence — D3.js visualizations
// Renders into #pipeline-viz, #genre-galaxy-viz, #frequency-viz, #artist-viz, #stream-viz, #timeline-viz, #freq-dist-viz, #tsne-viz

(function () {
  'use strict';

  // ── Theme tokens ──────────────────────────────────────────────────────────
  var C = {
    bg:      '#090b09',
    card:    '#131409',
    text:    '#d4cfc3',
    dim:     '#7a7868',
    bright:  '#ede8db',
    green:   '#7a8a2a',
    greenBr: '#9aaa3a',
    border:  '#22231a',
    borderL: '#33341f',
  };

  var FONT = 'Outfit, sans-serif';

  // Dynamic color palette — 25 muted earth tones
  var PALETTE = [
    '#7a8a2a', '#8a3a5a', '#5a7a8a', '#6a7a9a', '#8a6a3a',
    '#6a3a3a', '#3a6a5a', '#7a6a8a', '#5a6a3a', '#8a7a5a',
    '#5a8a5a', '#6a5a7a', '#8a5a3a', '#5a8a7a', '#6a3a5a',
    '#3a5a8a', '#8a8a3a', '#5a3a6a', '#7a5a5a', '#4a7a6a',
    '#9a6a4a', '#6a8a5a', '#7a4a6a', '#4a6a7a', '#8a4a4a',
  ];

  // Assign colors dynamically to genre/family names
  var _colorCache = {};
  function getColor(name) {
    if (!name) return C.dim;
    var key = name.toLowerCase();
    if (_colorCache[key]) return _colorCache[key];
    var idx = Object.keys(_colorCache).length % PALETTE.length;
    _colorCache[key] = PALETTE[idx];
    return _colorCache[key];
  }

  // Community group colors (for genre network groups)
  var COMMUNITY_COLORS = PALETTE;

  // ── Data ──────────────────────────────────────────────────────────────────
  var genreData = null;
  var artistData = null;
  var timelineData = null;
  var frequencyData = null;
  var tsneData = null;

  function loadJSON(url, setter) {
    return fetch(url)
      .then(function (r) {
        if (!r.ok) { console.warn('Resonance viz: failed to load ' + url + ' (' + r.status + ')'); return null; }
        return r.json();
      })
      .then(function (d) { if (d) setter(d); return d; })
      .catch(function (e) { console.warn('Resonance viz: error loading ' + url, e); return null; });
  }

  function loadGenreData() {
    return loadJSON('/data/resonance-genres.json', function (d) { genreData = d; });
  }
  function loadArtistData() {
    return loadJSON('/data/resonance-artists.json', function (d) { artistData = d; });
  }
  function loadTimelineData() {
    return loadJSON('/data/resonance-timeline.json', function (d) { timelineData = d; });
  }
  function loadFrequencyData() {
    return loadJSON('/data/resonance-frequency.json', function (d) { frequencyData = d; });
  }
  function loadTSNEData() {
    return loadJSON('/data/resonance-tsne.json', function (d) { tsneData = d; });
  }

  // ── Tooltip helper ────────────────────────────────────────────────────────
  function makeTooltip(container) {
    var tip = document.createElement('div');
    tip.className = 'd3-tooltip';
    tip.style.cssText =
      'position:absolute;pointer-events:none;opacity:0;padding:6px 10px;' +
      'background:rgba(9,11,9,0.95);border:1px solid ' + C.borderL + ';' +
      'font-family:' + FONT + ';font-size:12px;color:' + C.bright + ';' +
      'white-space:nowrap;z-index:10;transition:opacity .15s;max-width:250px;' +
      'line-height:1.5;font-weight:300;';
    container.style.position = 'relative';
    container.appendChild(tip);
    return tip;
  }

  // ════════════════════════════════════════════════════════════════════════════
  //  1. ENRICHMENT PIPELINE FLOW
  // ════════════════════════════════════════════════════════════════════════════

  function renderPipelineFlow(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    var width = container.clientWidth;
    var height = Math.max(380, width * 0.42);

    var tooltip = makeTooltip(container);

    var svg = d3.select(container)
      .insert('svg', ':first-child')
      .attr('viewBox', '0 0 ' + width + ' ' + height)
      .attr('width', width)
      .attr('height', height)
      .style('font-family', FONT)
      .style('display', 'block');

    // Defs for gradient and glow
    var defs = svg.append('defs');
    var glowFilter = defs.append('filter').attr('id', 'pipeline-glow');
    glowFilter.append('feGaussianBlur').attr('stdDeviation', 3).attr('result', 'blur');
    var feMerge = glowFilter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'blur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Node positions
    var centerX = width * 0.5;
    var centerY = height * 0.5;
    var nodeW = Math.min(120, width * 0.12);
    var nodeH = 42;

    var nodes = [
      // Left: Spotify (source)
      { name: 'Spotify', x: width * 0.08, y: centerY, color: '#1DB954', role: 'source' },
      // Center: Unified DB
      { name: 'SQLite Graph', x: centerX, y: centerY, color: C.greenBr, role: 'core' },
      // Right fan: enrichment sources
      { name: 'Last.fm',       x: width * 0.82, y: height * 0.08, color: '#d51007', role: 'enrichment' },
      { name: 'MusicBrainz',   x: width * 0.88, y: height * 0.24, color: '#ba478f', role: 'enrichment' },
      { name: 'ListenBrainz',  x: width * 0.90, y: height * 0.40, color: '#353070', role: 'enrichment' },
      { name: 'Deezer',        x: width * 0.90, y: height * 0.56, color: '#a238ff', role: 'enrichment' },
      { name: 'Discogs',       x: width * 0.88, y: height * 0.72, color: '#333333', role: 'enrichment' },
      { name: 'Genius',        x: width * 0.82, y: height * 0.88, color: '#ffff64', role: 'enrichment' },
    ];

    var descriptions = {
      'Spotify': 'Canonical source. Tracks, albums, artists, playlists, audio features, and play history.',
      'SQLite Graph': '27 normalized tables. Every entity enriched from multiple sources without duplication.',
      'Last.fm': 'Scrobble history, listening patterns, artist/track similarity networks, and tag data.',
      'MusicBrainz': 'Authoritative metadata: ISRCs, recording relationships, release groups, disambiguation.',
      'ListenBrainz': 'Open community listening data and collaborative filtering recommendations.',
      'Deezer': 'Audio previews (30-sec), independent recommendation graph, and related-artist data.',
      'Discogs': 'Physical release data, label information, artist credits, and discographic lineage.',
      'Genius': 'Lyrics, annotations, song descriptions, and artist bios.',
    };

    // Helper: clip a line from (cx,cy) toward (tx,ty) to the edge of a box centered at (cx,cy)
    function clipToBox(cx, cy, tx, ty, w, h) {
      var dx = tx - cx, dy = ty - cy;
      if (dx === 0 && dy === 0) return { x: cx, y: cy };
      var scaleX = dx !== 0 ? (w / 2) / Math.abs(dx) : Infinity;
      var scaleY = dy !== 0 ? (h / 2) / Math.abs(dy) : Infinity;
      var s = Math.min(scaleX, scaleY);
      return { x: cx + dx * s, y: cy + dy * s };
    }

    // Edges: Spotify → DB, DB ↔ each enrichment source
    var edges = [];
    edges.push({ source: nodes[0], target: nodes[1] });
    for (var i = 2; i < nodes.length; i++) {
      edges.push({ source: nodes[1], target: nodes[i] });
    }

    // Draw edges with animated pulses — clipped to box edges
    edges.forEach(function (e, idx) {
      var p1 = clipToBox(e.source.x, e.source.y, e.target.x, e.target.y, nodeW, nodeH);
      var p2 = clipToBox(e.target.x, e.target.y, e.source.x, e.source.y, nodeW, nodeH);

      var line = svg.append('line')
        .attr('x1', p1.x).attr('y1', p1.y)
        .attr('x2', p2.x).attr('y2', p2.y)
        .attr('stroke', C.borderL).attr('stroke-width', 1.5);

      // Animated pulse along clipped path
      var pulse = svg.append('circle')
        .attr('r', 3)
        .attr('fill', e.target.color || C.greenBr)
        .attr('filter', 'url(#pipeline-glow)')
        .attr('opacity', 0);

      function animatePulse() {
        var duration = 2000 + Math.random() * 1500;
        var delay = idx * 400 + Math.random() * 800;
        pulse
          .attr('cx', p1.x).attr('cy', p1.y)
          .attr('opacity', 0)
          .transition().delay(delay).duration(200).attr('opacity', 0.9)
          .transition().duration(duration).ease(d3.easeQuadInOut)
          .attr('cx', p2.x).attr('cy', p2.y)
          .transition().duration(200).attr('opacity', 0)
          .on('end', animatePulse);
      }
      animatePulse();
    });

    // Draw nodes
    var nodeGroups = svg.selectAll('.pipeline-node')
      .data(nodes)
      .enter().append('g')
      .attr('transform', function (d) { return 'translate(' + d.x + ',' + d.y + ')'; })
      .style('cursor', 'pointer');

    // Node background
    nodeGroups.append('rect')
      .attr('x', -nodeW / 2).attr('y', -nodeH / 2)
      .attr('width', nodeW).attr('height', nodeH)
      .attr('rx', 4)
      .attr('fill', function (d) { return d.role === 'core' ? 'rgba(122,138,42,0.15)' : 'rgba(17,20,14,0.9)'; })
      .attr('stroke', function (d) { return d.role === 'core' ? C.green : C.borderL; })
      .attr('stroke-width', function (d) { return d.role === 'core' ? 2 : 1; });

    // Node indicator dot
    nodeGroups.append('circle')
      .attr('cx', -nodeW / 2 + 10).attr('cy', 0)
      .attr('r', 4)
      .attr('fill', function (d) { return d.color; });

    // Node label
    nodeGroups.append('text')
      .attr('x', -nodeW / 2 + 20).attr('y', 1)
      .attr('fill', C.bright)
      .attr('font-size', Math.max(9, nodeW * 0.085))
      .attr('font-weight', 400)
      .attr('dominant-baseline', 'middle')
      .text(function (d) { return d.name; });

    // Description panel
    var descPanel = document.createElement('div');
    descPanel.style.cssText =
      'max-width:700px;margin:0.75rem auto 0;padding:0.6rem 0.9rem;font-family:' + FONT +
      ';font-size:0.76rem;color:' + C.text + ';line-height:1.6;border-left:2px solid ' +
      C.green + ';opacity:0;transition:opacity 0.3s;font-weight:300;min-height:2.5em;';
    container.appendChild(descPanel);

    // Interaction
    nodeGroups
      .on('mouseenter', function (event, d) {
        descPanel.textContent = descriptions[d.name] || '';
        descPanel.style.opacity = '1';
        d3.select(this).select('rect')
          .attr('stroke', d.color || C.greenBr)
          .attr('stroke-width', 2);
      })
      .on('mouseleave', function (event, d) {
        descPanel.style.opacity = '0';
        d3.select(this).select('rect')
          .attr('stroke', d.role === 'core' ? C.green : C.borderL)
          .attr('stroke-width', d.role === 'core' ? 2 : 1);
      });
  }

  // ════════════════════════════════════════════════════════════════════════════
  //  2. GENRE GALAXY (Force-Directed Network)
  // ════════════════════════════════════════════════════════════════════════════

  function renderGenreGalaxy(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    var data = genreData;
    if (!data) return;

    var width = container.clientWidth;
    var height = Math.max(500, width * 0.65);

    var tooltip = makeTooltip(container);

    var svg = d3.select(container)
      .append('svg')
      .attr('viewBox', '0 0 ' + width + ' ' + height)
      .attr('width', width)
      .attr('height', height)
      .style('display', 'block');

    // Scale for node radius
    var maxCount = d3.max(data.nodes, function (d) { return d.count; });
    var rScale = d3.scaleSqrt().domain([0, maxCount]).range([4, 28]);

    // Simulation — tuned force params
    var simulation = d3.forceSimulation(data.nodes)
      .force('link', d3.forceLink(data.links).id(function (d) { return d.id; })
        .distance(function (d) { return 80 - d.weight * 30; })
        .strength(function (d) { return d.weight * 0.6; }))
      .force('charge', d3.forceManyBody().strength(-90))
      .force('x', d3.forceX(width / 2).strength(0.04))
      .force('y', d3.forceY(height / 2).strength(0.04))
      .force('collision', d3.forceCollide().radius(function (d) { return rScale(d.count) + 4; }));

    // Links
    var link = svg.append('g')
      .selectAll('line')
      .data(data.links)
      .enter().append('line')
      .attr('stroke', C.borderL)
      .attr('stroke-width', function (d) { return d.weight * 2; })
      .attr('stroke-opacity', 0.4);

    // Nodes
    var node = svg.append('g')
      .selectAll('g')
      .data(data.nodes)
      .enter().append('g')
      .style('cursor', 'grab')
      .call(d3.drag()
        .on('start', function (event, d) {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x; d.fy = d.y;
        })
        .on('drag', function (event, d) {
          d.fx = event.x; d.fy = event.y;
        })
        .on('end', function (event, d) {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null; d.fy = null;
        }));

    node.append('circle')
      .attr('r', function (d) { return rScale(d.count); })
      .attr('fill', function (d) { return COMMUNITY_COLORS[d.group % COMMUNITY_COLORS.length]; })
      .attr('fill-opacity', 0.7)
      .attr('stroke', function (d) { return COMMUNITY_COLORS[d.group % COMMUNITY_COLORS.length]; })
      .attr('stroke-opacity', 1)
      .attr('stroke-width', 1.5);

    // Labels for larger nodes
    node.filter(function (d) { return d.count > 8; })
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', function (d) { return rScale(d.count) + 12; })
      .attr('fill', C.dim)
      .attr('font-family', FONT)
      .attr('font-size', 10)
      .attr('font-weight', 300)
      .text(function (d) { return d.label; });

    // Hover
    node.on('mouseenter', function (event, d) {
      tooltip.innerHTML = '<strong>' + d.label + '</strong><br/>' + d.count + ' tracks';
      tooltip.style.opacity = '1';
      d3.select(this).select('circle')
        .attr('fill-opacity', 1)
        .attr('stroke-width', 2.5);
      // Highlight connected links
      link.attr('stroke-opacity', function (l) {
        return (l.source.id === d.id || l.target.id === d.id) ? 0.8 : 0.1;
      }).attr('stroke', function (l) {
        return (l.source.id === d.id || l.target.id === d.id)
          ? COMMUNITY_COLORS[d.group % COMMUNITY_COLORS.length] : C.borderL;
      });
    })
    .on('mousemove', function (event) {
      var rect = container.getBoundingClientRect();
      tooltip.style.left = (event.clientX - rect.left + 12) + 'px';
      tooltip.style.top = (event.clientY - rect.top - 28) + 'px';
    })
    .on('mouseleave', function () {
      tooltip.style.opacity = '0';
      node.selectAll('circle')
        .attr('fill-opacity', 0.7)
        .attr('stroke-width', 1.5);
      link.attr('stroke-opacity', 0.4).attr('stroke', C.borderL);
    });

    simulation.on('tick', function () {
      link
        .attr('x1', function (d) { return d.source.x; })
        .attr('y1', function (d) { return d.source.y; })
        .attr('x2', function (d) { return d.target.x; })
        .attr('y2', function (d) { return d.target.y; });

      node.attr('transform', function (d) {
        d.x = Math.max(30, Math.min(width - 30, d.x));
        d.y = Math.max(30, Math.min(height - 30, d.y));
        return 'translate(' + d.x + ',' + d.y + ')';
      });
    });
  }

  // ════════════════════════════════════════════════════════════════════════════
  //  3. FREQUENCY EVOLUTION (Line Chart)
  // ════════════════════════════════════════════════════════════════════════════

  function renderFrequencyEvolution(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    var width = container.clientWidth;
    var height = Math.max(320, width * 0.38);
    var margin = { top: 30, right: 120, bottom: 40, left: 55 };
    var w = width - margin.left - margin.right;
    var h = height - margin.top - margin.bottom;

    var tooltip = makeTooltip(container);

    // Synthetic track frequency data
    var tracks = [
      { name: 'Favorite Track A', color: '#9aaa3a', data: [] },
      { name: 'Rediscovered B', color: '#5a8a7a', data: [] },
      { name: 'Steady Rotation C', color: '#7a7a9a', data: [] },
      { name: 'Drifting Away D', color: '#8a5a3a', data: [] },
      { name: 'New Discovery E', color: '#7a3a6a', data: [] },
      { name: 'Forgotten F', color: '#5a3a3a', data: [] },
    ];

    // Generate frequency evolution paths
    var numPoints = 24;
    var phi = 1.382;
    tracks.forEach(function (track, ti) {
      var freq = 14 + Math.random() * 8; // Starting frequency 14-22 days
      for (var i = 0; i < numPoints; i++) {
        track.data.push({ week: i, freq: freq });
        // Different behaviors:
        if (ti === 0) freq = Math.max(3, freq / (1 + Math.random() * 0.08)); // keeps getting chosen early
        else if (ti === 1) freq = i < 12 ? freq * (1 + Math.random() * 0.05) : Math.max(5, freq / (1 + Math.random() * 0.06)); // drift then rediscover
        else if (ti === 2) freq = freq + (Math.random() - 0.5) * 1.5; // steady with noise
        else if (ti === 3) freq = freq * (1 + Math.random() * 0.06); // gradual drift
        else if (ti === 4 && i > 8) freq = Math.max(4, freq / (1 + Math.random() * 0.07)); // late discovery
        else if (ti === 4) freq = 30 + Math.random() * 3; // unknown before discovery
        else if (ti === 5) freq = freq * (1 + Math.random() * 0.08); // fast drift
      }
    });

    var svg = d3.select(container)
      .append('svg')
      .attr('viewBox', '0 0 ' + width + ' ' + height)
      .attr('width', width)
      .attr('height', height)
      .style('display', 'block');

    var g = svg.append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    var xScale = d3.scaleLinear().domain([0, numPoints - 1]).range([0, w]);
    var yMax = d3.max(tracks, function (t) { return d3.max(t.data, function (d) { return d.freq; }); });
    var yScale = d3.scaleLinear().domain([0, yMax * 1.1]).range([h, 0]);

    // Axes
    g.append('g')
      .attr('transform', 'translate(0,' + h + ')')
      .call(d3.axisBottom(xScale).ticks(6).tickFormat(function (d) { return 'W' + (d + 1); }))
      .call(function (axis) {
        axis.select('.domain').attr('stroke', C.borderL);
        axis.selectAll('.tick line').attr('stroke', C.borderL);
        axis.selectAll('.tick text').attr('fill', C.dim).attr('font-size', 10).attr('font-family', FONT);
      });

    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(function (d) { return d + 'd'; }))
      .call(function (axis) {
        axis.select('.domain').attr('stroke', C.borderL);
        axis.selectAll('.tick line').attr('stroke', C.borderL);
        axis.selectAll('.tick text').attr('fill', C.dim).attr('font-size', 10).attr('font-family', FONT);
      });

    // Grid lines
    g.append('g')
      .selectAll('line')
      .data(yScale.ticks(5))
      .enter().append('line')
      .attr('x1', 0).attr('x2', w)
      .attr('y1', function (d) { return yScale(d); })
      .attr('y2', function (d) { return yScale(d); })
      .attr('stroke', C.borderL).attr('stroke-opacity', 0.3);

    // Y axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -h / 2).attr('y', -40)
      .attr('text-anchor', 'middle')
      .attr('fill', C.dim)
      .attr('font-size', 10)
      .attr('font-family', FONT)
      .text('Frequency (days)');

    // Lines
    var lineGen = d3.line()
      .x(function (d) { return xScale(d.week); })
      .y(function (d) { return yScale(d.freq); })
      .curve(d3.curveMonotoneX);

    tracks.forEach(function (track) {
      // Animate line drawing
      var path = g.append('path')
        .datum(track.data)
        .attr('d', lineGen)
        .attr('fill', 'none')
        .attr('stroke', track.color)
        .attr('stroke-width', 2)
        .attr('stroke-opacity', 0.8);

      var totalLen = path.node().getTotalLength();
      path
        .attr('stroke-dasharray', totalLen)
        .attr('stroke-dashoffset', totalLen)
        .transition().duration(2000).ease(d3.easeQuadInOut)
        .attr('stroke-dashoffset', 0);
    });

    // Legend
    var legend = g.append('g')
      .attr('transform', 'translate(' + (w + 12) + ',0)');

    tracks.forEach(function (track, i) {
      var ly = i * 18;
      legend.append('line')
        .attr('x1', 0).attr('x2', 14)
        .attr('y1', ly).attr('y2', ly)
        .attr('stroke', track.color).attr('stroke-width', 2);
      legend.append('text')
        .attr('x', 18).attr('y', ly + 1)
        .attr('fill', C.dim)
        .attr('font-size', 9)
        .attr('font-family', FONT)
        .attr('dominant-baseline', 'middle')
        .text(track.name);
    });

    // Golden ratio annotation
    g.append('text')
      .attr('x', w).attr('y', h + 32)
      .attr('text-anchor', 'end')
      .attr('fill', C.green)
      .attr('font-size', 9)
      .attr('font-family', FONT)
      .attr('font-style', 'italic')
      .text('Multiplier: \u03c6 = 1.382');
  }

  // ════════════════════════════════════════════════════════════════════════════
  //  4. ARTIST CONSTELLATION (Force-Directed Network)
  // ════════════════════════════════════════════════════════════════════════════

  function renderArtistConstellation(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    var data = artistData;
    if (!data) return;

    var width = container.clientWidth;
    var height = Math.max(500, width * 0.6);

    var tooltip = makeTooltip(container);

    var svg = d3.select(container)
      .append('svg')
      .attr('viewBox', '0 0 ' + width + ' ' + height)
      .attr('width', width)
      .attr('height', height)
      .style('display', 'block');

    var maxListens = d3.max(data.nodes, function (d) { return d.listens; });
    var rScale = d3.scaleSqrt().domain([0, maxListens]).range([5, 24]);

    var simulation = d3.forceSimulation(data.nodes)
      .force('link', d3.forceLink(data.links).id(function (d) { return d.id; })
        .distance(function (d) { return 100 - d.weight * 40; })
        .strength(function (d) { return d.weight * 0.5; }))
      .force('charge', d3.forceManyBody().strength(-170))
      .force('x', d3.forceX(width / 2).strength(0.04))
      .force('y', d3.forceY(height / 2).strength(0.04))
      .force('collision', d3.forceCollide().radius(function (d) { return rScale(d.listens) + 4; }));

    var link = svg.append('g')
      .selectAll('line')
      .data(data.links)
      .enter().append('line')
      .attr('stroke', C.borderL)
      .attr('stroke-width', function (d) { return d.weight * 2.5; })
      .attr('stroke-opacity', 0.3);

    var node = svg.append('g')
      .selectAll('g')
      .data(data.nodes)
      .enter().append('g')
      .style('cursor', 'grab')
      .call(d3.drag()
        .on('start', function (event, d) {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x; d.fy = d.y;
        })
        .on('drag', function (event, d) {
          d.fx = event.x; d.fy = event.y;
        })
        .on('end', function (event, d) {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null; d.fy = null;
        }));

    node.append('circle')
      .attr('r', function (d) { return rScale(d.listens); })
      .attr('fill', function (d) { return getColor(d.genre); })
      .attr('fill-opacity', 0.7)
      .attr('stroke', function (d) { return getColor(d.genre); })
      .attr('stroke-opacity', 1)
      .attr('stroke-width', 1.5);

    // Labels for prominent artists
    node.filter(function (d) { return d.listens > 5; })
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', function (d) { return rScale(d.listens) + 13; })
      .attr('fill', C.dim)
      .attr('font-family', FONT)
      .attr('font-size', 10)
      .attr('font-weight', 300)
      .text(function (d) { return d.label; });

    node.on('mouseenter', function (event, d) {
      tooltip.innerHTML = '<strong>' + d.label + '</strong><br/>' +
        d.listens + ' listens<br/>' +
        '<span style="color:' + C.dim + '">' + d.genre + '</span>';
      tooltip.style.opacity = '1';
      d3.select(this).select('circle')
        .attr('fill-opacity', 1).attr('stroke-width', 2.5);
      link.attr('stroke-opacity', function (l) {
        return (l.source.id === d.id || l.target.id === d.id) ? 0.8 : 0.08;
      }).attr('stroke', function (l) {
        return (l.source.id === d.id || l.target.id === d.id)
          ? getColor(d.genre) : C.borderL;
      });
    })
    .on('mousemove', function (event) {
      var rect = container.getBoundingClientRect();
      tooltip.style.left = (event.clientX - rect.left + 12) + 'px';
      tooltip.style.top = (event.clientY - rect.top - 28) + 'px';
    })
    .on('mouseleave', function () {
      tooltip.style.opacity = '0';
      node.selectAll('circle').attr('fill-opacity', 0.7).attr('stroke-width', 1.5);
      link.attr('stroke-opacity', 0.3).attr('stroke', C.borderL);
    });

    simulation.on('tick', function () {
      link
        .attr('x1', function (d) { return d.source.x; })
        .attr('y1', function (d) { return d.source.y; })
        .attr('x2', function (d) { return d.target.x; })
        .attr('y2', function (d) { return d.target.y; });

      node.attr('transform', function (d) {
        d.x = Math.max(30, Math.min(width - 30, d.x));
        d.y = Math.max(30, Math.min(height - 30, d.y));
        return 'translate(' + d.x + ',' + d.y + ')';
      });
    });
  }

  // ════════════════════════════════════════════════════════════════════════════
  //  5. LIBRARY COMPOSITION (Horizontal Bar Chart)
  // ════════════════════════════════════════════════════════════════════════════

  function renderListeningTimeline(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    var data = timelineData;
    if (!data || !data.categories) return;

    var cats = data.categories.filter(function (c) { return c.name.toLowerCase() !== 'other'; });
    var width = container.clientWidth;
    var barH = 28;
    var gap = 6;
    var margin = { top: 10, right: 60, bottom: 10, left: 110 };
    var h = cats.length * (barH + gap);
    var height = h + margin.top + margin.bottom;
    var w = width - margin.left - margin.right;

    var tooltip = makeTooltip(container);

    var svg = d3.select(container)
      .append('svg')
      .attr('viewBox', '0 0 ' + width + ' ' + height)
      .attr('width', width)
      .attr('height', height)
      .style('display', 'block');

    var g = svg.append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    var maxTracks = d3.max(cats, function (d) { return d.tracks; });
    var xScale = d3.scaleLinear().domain([0, maxTracks]).range([0, w]);

    // Bars
    g.selectAll('.comp-bar')
      .data(cats)
      .enter().append('rect')
      .attr('class', 'comp-bar')
      .attr('x', 0)
      .attr('y', function (d, i) { return i * (barH + gap); })
      .attr('width', 0)
      .attr('height', barH)
      .attr('fill', function (d) { return getColor(d.name); })
      .attr('fill-opacity', 0.75)
      .attr('rx', 2)
      .on('mouseenter', function (event, d) {
        tooltip.innerHTML = '<strong>' + d.name + '</strong><br/>' +
          d.tracks + ' tracks (' + d.pct + '%)';
        tooltip.style.opacity = '1';
        d3.select(this).attr('fill-opacity', 1);
      })
      .on('mousemove', function (event) {
        var rect = container.getBoundingClientRect();
        tooltip.style.left = (event.clientX - rect.left + 12) + 'px';
        tooltip.style.top = (event.clientY - rect.top - 28) + 'px';
      })
      .on('mouseleave', function () {
        tooltip.style.opacity = '0';
        d3.select(this).attr('fill-opacity', 0.75);
      })
      .transition().duration(1200).ease(d3.easeCubicOut)
      .attr('width', function (d) { return xScale(d.tracks); });

    // Labels (left side)
    g.selectAll('.comp-label')
      .data(cats)
      .enter().append('text')
      .attr('x', -8)
      .attr('y', function (d, i) { return i * (barH + gap) + barH / 2 + 1; })
      .attr('text-anchor', 'end')
      .attr('fill', C.text)
      .attr('font-family', FONT)
      .attr('font-size', 11)
      .attr('font-weight', 300)
      .attr('dominant-baseline', 'middle')
      .text(function (d) { return d.name; });

    // Value labels (right side)
    g.selectAll('.comp-value')
      .data(cats)
      .enter().append('text')
      .attr('x', function (d) { return xScale(d.tracks) + 6; })
      .attr('y', function (d, i) { return i * (barH + gap) + barH / 2 + 1; })
      .attr('fill', C.dim)
      .attr('font-family', FONT)
      .attr('font-size', 10)
      .attr('font-weight', 300)
      .attr('dominant-baseline', 'middle')
      .attr('opacity', 0)
      .text(function (d) { return d.pct + '%'; })
      .transition().delay(1200).duration(400)
      .attr('opacity', 1);
  }

  // ════════════════════════════════════════════════════════════════════════════
  //  6. FREQUENCY DISTRIBUTION (Scatter Plot)
  // ════════════════════════════════════════════════════════════════════════════

  function renderFrequencyDistribution(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    var data = frequencyData;
    if (!data) return;

    var artists = data.artists;
    if (!artists || artists.length === 0) return;

    var width = container.clientWidth;
    var height = Math.max(340, width * 0.4);
    var margin = { top: 20, right: 30, bottom: 50, left: 60 };
    var w = width - margin.left - margin.right;
    var h = height - margin.top - margin.bottom;

    var tooltip = makeTooltip(container);

    var svg = d3.select(container)
      .append('svg')
      .attr('viewBox', '0 0 ' + width + ' ' + height)
      .attr('width', width)
      .attr('height', height)
      .style('display', 'block');

    var g = svg.append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    var xMax = d3.max(artists, function (d) { return d.frequency; });
    var yMax = d3.max(artists, function (d) { return d.cycle_progress; });
    var xScale = d3.scaleLinear().domain([0, Math.min(xMax * 1.1, 100)]).range([0, w]);
    var yScale = d3.scaleLinear().domain([0, Math.min(yMax * 1.1, 50)]).range([h, 0]);

    // Grid
    g.append('g').selectAll('line').data(yScale.ticks(5))
      .enter().append('line')
      .attr('x1', 0).attr('x2', w)
      .attr('y1', function (d) { return yScale(d); })
      .attr('y2', function (d) { return yScale(d); })
      .attr('stroke', C.borderL).attr('stroke-opacity', 0.3);

    // Threshold line at cycle_progress = 1.0
    if (yMax >= 1) {
      g.append('line')
        .attr('x1', 0).attr('x2', w)
        .attr('y1', yScale(1)).attr('y2', yScale(1))
        .attr('stroke', C.green).attr('stroke-opacity', 0.5)
        .attr('stroke-dasharray', '4,3');
      g.append('text')
        .attr('x', w - 4).attr('y', yScale(1) - 6)
        .attr('text-anchor', 'end')
        .attr('fill', C.green).attr('font-size', 9).attr('font-family', FONT)
        .attr('font-style', 'italic')
        .text('due threshold');
    }

    // Points
    g.selectAll('.freq-dot')
      .data(artists)
      .enter().append('circle')
      .attr('class', 'freq-dot')
      .attr('cx', function (d) { return xScale(Math.min(d.frequency, xMax * 1.1)); })
      .attr('cy', function (d) { return yScale(Math.min(d.cycle_progress, yMax * 1.1)); })
      .attr('r', 0)
      .attr('fill', function (d) { return d.cycle_progress >= 1 ? '#8a3a3a' : C.green; })
      .attr('fill-opacity', 0.6)
      .attr('stroke', function (d) { return d.cycle_progress >= 1 ? '#aa4a4a' : C.greenBr; })
      .attr('stroke-width', 1)
      .on('mouseenter', function (event, d) {
        tooltip.innerHTML = '<strong>' + d.name + '</strong><br/>' +
          'Frequency: ' + d.frequency + ' days<br/>' +
          'Cycle: ' + d.cycle_progress + 'x' +
          (d.cycle_progress >= 1 ? ' <span style="color:#aa4a4a">(overdue)</span>' : '');
        tooltip.style.opacity = '1';
        d3.select(this).attr('r', 7).attr('fill-opacity', 1);
      })
      .on('mousemove', function (event) {
        var rect = container.getBoundingClientRect();
        tooltip.style.left = (event.clientX - rect.left + 12) + 'px';
        tooltip.style.top = (event.clientY - rect.top - 28) + 'px';
      })
      .on('mouseleave', function () {
        tooltip.style.opacity = '0';
        d3.select(this).attr('r', 4.5).attr('fill-opacity', 0.6);
      })
      .transition().duration(800).ease(d3.easeBackOut)
      .attr('r', 4.5);

    // Axes
    g.append('g')
      .attr('transform', 'translate(0,' + h + ')')
      .call(d3.axisBottom(xScale).ticks(6).tickFormat(function (d) { return d + 'd'; }))
      .call(function (axis) {
        axis.select('.domain').attr('stroke', C.borderL);
        axis.selectAll('.tick line').attr('stroke', C.borderL);
        axis.selectAll('.tick text').attr('fill', C.dim).attr('font-size', 10).attr('font-family', FONT);
      });

    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(function (d) { return d + 'x'; }))
      .call(function (axis) {
        axis.select('.domain').attr('stroke', C.borderL);
        axis.selectAll('.tick line').attr('stroke', C.borderL);
        axis.selectAll('.tick text').attr('fill', C.dim).attr('font-size', 10).attr('font-family', FONT);
      });

    // Axis labels
    g.append('text')
      .attr('x', w / 2).attr('y', h + 38)
      .attr('text-anchor', 'middle')
      .attr('fill', C.dim).attr('font-size', 10).attr('font-family', FONT)
      .text('Target Frequency (days)');

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -h / 2).attr('y', -42)
      .attr('text-anchor', 'middle')
      .attr('fill', C.dim).attr('font-size', 10).attr('font-family', FONT)
      .text('Cycle Progress (days since / frequency)');
  }

  // ════════════════════════════════════════════════════════════════════════════
  //  STREAMGRAPH — GENRE TIMELINE
  // ════════════════════════════════════════════════════════════════════════════

  function renderStreamgraph(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    var data = timelineData;
    if (!data) return;

    var width = container.clientWidth;
    var height = Math.max(300, width * 0.35);
    var margin = { top: 20, right: 120, bottom: 40, left: 45 };
    var w = width - margin.left - margin.right;
    var h = height - margin.top - margin.bottom;

    var tooltip = makeTooltip(container);

    var genres = data.genres;
    var periods = data.periods;

    var genreColors = {
      'Rock': '#7a8a2a',
      'Electronic': '#6a7a9a',
      'Metal': '#6a3a3a',
      'Post-Punk': '#8a3a5a',
      'Ambient': '#5a7a8a',
      'Hip-Hop': '#8a7a5a',
      'Shoegaze': '#5a8a7a',
      'Other': '#4a4a3a',
    };

    var svg = d3.select(container)
      .append('svg')
      .attr('viewBox', '0 0 ' + width + ' ' + height)
      .attr('width', width)
      .attr('height', height)
      .style('display', 'block');

    var g = svg.append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // Stack
    var stack = d3.stack()
      .keys(genres)
      .order(d3.stackOrderReverse);

    var series = stack(periods);

    var xScale = d3.scaleBand()
      .domain(periods.map(function (d) { return d.label; }))
      .range([0, w])
      .padding(0);

    var yMax = d3.max(series, function (s) { return d3.max(s, function (d) { return d[1]; }); });
    var yScale = d3.scaleLinear().domain([0, yMax]).range([h, 0]);

    var area = d3.area()
      .x(function (d) { return xScale(d.data.label) + xScale.bandwidth() / 2; })
      .y0(function (d) { return yScale(d[0]); })
      .y1(function (d) { return yScale(d[1]); })
      .curve(d3.curveMonotoneX);

    // Areas
    g.selectAll('.genre-area')
      .data(series)
      .enter().append('path')
      .attr('class', 'genre-area')
      .attr('d', area)
      .attr('fill', function (d) { return genreColors[d.key] || C.dim; })
      .attr('fill-opacity', 0.7)
      .attr('stroke', function (d) { return genreColors[d.key] || C.dim; })
      .attr('stroke-width', 0.5)
      .attr('stroke-opacity', 0.8)
      .on('mouseenter', function (event, d) {
        tooltip.innerHTML = '<strong>' + d.key + '</strong>';
        tooltip.style.opacity = '1';
        d3.select(this).attr('fill-opacity', 0.95);
      })
      .on('mousemove', function (event) {
        var rect = container.getBoundingClientRect();
        tooltip.style.left = (event.clientX - rect.left + 12) + 'px';
        tooltip.style.top = (event.clientY - rect.top - 28) + 'px';
      })
      .on('mouseleave', function () {
        tooltip.style.opacity = '0';
        d3.select(this).attr('fill-opacity', 0.7);
      });

    // X axis
    g.append('g')
      .attr('transform', 'translate(0,' + h + ')')
      .call(d3.axisBottom(xScale))
      .call(function (axis) {
        axis.select('.domain').attr('stroke', C.borderL);
        axis.selectAll('.tick line').attr('stroke', C.borderL);
        axis.selectAll('.tick text').attr('fill', C.dim).attr('font-size', 10).attr('font-family', FONT);
      });

    // Y axis
    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5))
      .call(function (axis) {
        axis.select('.domain').attr('stroke', C.borderL);
        axis.selectAll('.tick line').attr('stroke', C.borderL);
        axis.selectAll('.tick text').attr('fill', C.dim).attr('font-size', 10).attr('font-family', FONT);
      });

    // Y label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -h / 2).attr('y', -32)
      .attr('text-anchor', 'middle')
      .attr('fill', C.dim).attr('font-size', 10).attr('font-family', FONT)
      .text('Listens');

    // Legend
    var legend = g.append('g')
      .attr('transform', 'translate(' + (w + 12) + ',0)');

    genres.forEach(function (genre, i) {
      var ly = i * 18;
      legend.append('rect')
        .attr('x', 0).attr('y', ly - 5)
        .attr('width', 12).attr('height', 12)
        .attr('fill', genreColors[genre] || C.dim)
        .attr('fill-opacity', 0.7);
      legend.append('text')
        .attr('x', 16).attr('y', ly + 2)
        .attr('fill', C.dim)
        .attr('font-size', 9).attr('font-family', FONT)
        .attr('dominant-baseline', 'middle')
        .text(genre);
    });
  }

  // ════════════════════════════════════════════════════════════════════════════
  //  t-SNE — AUDIO FEATURE SPACE
  // ════════════════════════════════════════════════════════════════════════════

  function renderTSNE(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    var data = tsneData;
    if (!data || !data.points) return;

    var points = data.points;
    var width = container.clientWidth;
    var height = 500;
    var margin = { top: 20, right: 20, bottom: 20, left: 20 };
    var w = width - margin.left - margin.right;
    var h = height - margin.top - margin.bottom;

    var tooltip = makeTooltip(container);

    var xExtent = d3.extent(points, function (d) { return d.x; });
    var yExtent = d3.extent(points, function (d) { return d.y; });
    var xPad = (xExtent[1] - xExtent[0]) * 0.05;
    var yPad = (yExtent[1] - yExtent[0]) * 0.05;

    var xScale = d3.scaleLinear()
      .domain([xExtent[0] - xPad, xExtent[1] + xPad])
      .range([0, w]);
    var yScale = d3.scaleLinear()
      .domain([yExtent[0] - yPad, yExtent[1] + yPad])
      .range([h, 0]);

    var svg = d3.select(container)
      .append('svg')
      .attr('viewBox', '0 0 ' + width + ' ' + height)
      .attr('width', width)
      .attr('height', height)
      .style('display', 'block');

    var g = svg.append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // Points
    g.selectAll('.tsne-point')
      .data(points)
      .enter().append('circle')
      .attr('class', 'tsne-point')
      .attr('cx', function (d) { return xScale(d.x); })
      .attr('cy', function (d) { return yScale(d.y); })
      .attr('r', 0)
      .attr('fill', function (d) { return getColor(d.family); })
      .attr('fill-opacity', 0.65)
      .attr('stroke', function (d) { return getColor(d.family); })
      .attr('stroke-opacity', 0.3)
      .attr('stroke-width', 1)
      .on('mouseenter', function (event, d) {
        tooltip.innerHTML = '<strong>' + d.title + '</strong><br/>' +
          d.artist + '<br/><em>' + d.family + '</em>';
        tooltip.style.opacity = '1';
        d3.select(this).attr('r', 7).attr('fill-opacity', 1).attr('stroke-opacity', 1);
      })
      .on('mousemove', function (event) {
        var rect = container.getBoundingClientRect();
        tooltip.style.left = (event.clientX - rect.left + 12) + 'px';
        tooltip.style.top = (event.clientY - rect.top - 28) + 'px';
      })
      .on('mouseleave', function (event, d) {
        tooltip.style.opacity = '0';
        d3.select(this).attr('r', 3.5).attr('fill-opacity', 0.65).attr('stroke-opacity', 0.3);
      })
      .transition().duration(1200).ease(d3.easeCubicOut)
      .attr('r', 3.5);

    // Legend
    // Collect unique families from data, exclude "Other"
    var familySet = {};
    points.forEach(function (p) { familySet[p.family] = true; });
    var legendFamilies = Object.keys(familySet).filter(function (f) {
      return f.toLowerCase() !== 'other';
    });
    // Sort by count descending
    legendFamilies.sort(function (a, b) {
      var ca = points.filter(function (p) { return p.family === a; }).length;
      var cb = points.filter(function (p) { return p.family === b; }).length;
      return cb - ca;
    });

    var legend = g.append('g')
      .attr('transform', 'translate(' + (w - 110) + ', 10)');

    legend.selectAll('.tsne-legend')
      .data(legendFamilies.slice(0, 10))
      .enter().append('g')
      .attr('class', 'tsne-legend')
      .attr('transform', function (d, i) { return 'translate(0,' + (i * 18) + ')'; })
      .each(function (d) {
        d3.select(this).append('circle')
          .attr('r', 4).attr('cx', 0).attr('cy', 0)
          .attr('fill', getColor(d)).attr('fill-opacity', 0.8);
        d3.select(this).append('text')
          .attr('x', 10).attr('y', 4)
          .attr('fill', C.dim).attr('font-size', 10).attr('font-family', FONT)
          .text(d);
      });
  }

  // ════════════════════════════════════════════════════════════════════════════
  //  GENRE SUNBURST
  // ════════════════════════════════════════════════════════════════════════════

  var hierarchyData = null;

  function loadHierarchyData() {
    return loadJSON('/data/resonance-hierarchy.json', function (d) { hierarchyData = d; });
  }

  function renderSunburst(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    var data = hierarchyData;
    if (!data) return;

    var width = container.clientWidth;
    var size = Math.min(width, 700);
    var radius = size / 2;

    // Root-genre color palettes (depth-graded)
    var rootPalettes = {
      'electronic': ['#3a7a8a','#4a9aaa','#5ab4c4','#6acdd8'],
      'rock':       ['#8a6a3a','#aa8a4a','#c4a45a','#d8be6a'],
      'hip hop':    ['#8a3a6a','#9a4a8a','#b45aa4','#c86abe'],
      'jazz':       ['#6b8f3a','#8aaf4a','#a4c75a','#bdd96a'],
      'classical':  ['#3a5a8a','#4a7aaa','#5a94c4','#6aaed8'],
      'folk':       ['#7a8a2a','#9aaa3a','#b5c24a','#c8d45a'],
      'soundtrack': ['#8a3a3a','#aa4a4a','#c45a5a','#d86a6a'],
      'soul':       ['#aa7a3a','#c49a4a','#d8b45a','#e8c86a'],
      'pop':        ['#8a5a8a','#aa7aaa','#c494c4','#d8aed8'],
      'reggae':     ['#3a8a5a','#4aaa7a','#5ac494','#6ad8ae'],
      'experimental':['#7a7a3a','#9a9a4a','#b4b45a','#c8c86a'],
      'world':      ['#5a7a6a','#7a9a8a','#94b4a4','#aec8be'],
    };
    var fallbackPalette = ['#2e3218','#4a5520','#7a8a2a','#9aaa3a'];

    function getSunburstColor(d) {
      var node = d;
      while (node.depth > 1 && node.parent) node = node.parent;
      var catName = node.data ? node.data.name.toLowerCase() : '';
      var palette = rootPalettes[catName] || fallbackPalette;
      var idx = Math.min(d.depth - 1, palette.length - 1);
      return palette[Math.max(0, idx)];
    }

    // Tooltip
    var tooltip = makeTooltip(container);
    container.style.overflow = 'visible';

    var svg = d3.select(container)
      .append('svg')
      .attr('viewBox', '0 0 ' + size + ' ' + size)
      .attr('width', size)
      .attr('height', size)
      .style('display', 'block')
      .style('margin', '0 auto');

    var g = svg.append('g')
      .attr('transform', 'translate(' + radius + ',' + radius + ')');

    var root = d3.hierarchy(data)
      .sum(function (d) { return d.value || 0; })
      .sort(function (a, b) { return b.value - a.value; });

    var partition = d3.partition().size([2 * Math.PI, radius]);
    partition(root);

    // Store initial layout for animation
    root.each(function (d) {
      d.current = { x0: d.x0, x1: d.x1, y0: d.y0, y1: d.y1 };
    });

    var arc = d3.arc()
      .startAngle(function (d) { return d.current.x0; })
      .endAngle(function (d) { return d.current.x1; })
      .padAngle(function (d) { return Math.min((d.current.x1 - d.current.x0) / 2, 0.005); })
      .padRadius(radius / 2)
      .innerRadius(function (d) { return d.current.y0; })
      .outerRadius(function (d) { return Math.max(d.current.y0, d.current.y1 - 1); });

    function arcVisible(d) {
      return d.y1 > 0 && d.y0 < radius && d.x1 > d.x0 + 0.001;
    }

    function labelVisible(d) {
      var band = d.y1 - d.y0;
      return d.y1 > 0 && d.y0 > band * 0.5 && d.y0 < radius
        && (d.x1 - d.x0) > 0.04 && band > 10;
    }

    function labelTransform(d) {
      var x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
      var y = (d.y0 + d.y1) / 2;
      return 'rotate(' + (x - 90) + ') translate(' + y + ',0) rotate(' + (x < 180 ? 0 : 180) + ')';
    }

    function truncateLabel(name, arcW, bandH) {
      var px = Math.min(arcW, bandH || arcW);
      var maxC = Math.floor(px * 0.14);
      if (maxC < 3) return '';
      return name.length <= maxC ? name : name.substring(0, maxC - 1) + '\u2026';
    }

    function getArcWidth(d) { return (d.x1 - d.x0) * ((d.y0 + d.y1) / 2); }
    function getBandH(d) { return d.y1 - d.y0; }

    var currentRoot = root;

    // Center label (updates on click)
    var centerText = g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', C.text)
      .attr('font-family', FONT)
      .attr('font-size', 14)
      .attr('font-weight', 300)
      .style('pointer-events', 'none')
      .text('Music');

    var allDesc = root.descendants().filter(function (d) { return d.depth; });

    // Arcs
    var paths = g.selectAll('path.sb-arc')
      .data(allDesc).join('path')
      .attr('class', 'sb-arc')
      .attr('fill', function (d) { return getSunburstColor(d); })
      .attr('fill-opacity', function (d) { return arcVisible(d.current) ? (d.children ? 0.85 : 0.65) : 0; })
      .attr('d', function (d) { return arc(d); })
      .style('cursor', 'pointer')
      .on('mouseover', function (event, d) {
        d3.select(this).attr('fill-opacity', 1);
        var childCount = d.children ? d.children.length : 0;
        var label = d.data.name;
        if (childCount > 0) label += ' \u2014 ' + childCount + ' sub-genres';
        else label += ' \u2014 ' + d.value + ' tracks';
        tooltip.textContent = label;
        tooltip.style.opacity = '1';
      })
      .on('mousemove', function (event) {
        var rect = container.getBoundingClientRect();
        tooltip.style.left = (event.clientX - rect.left + 12) + 'px';
        tooltip.style.top = (event.clientY - rect.top - 28) + 'px';
      })
      .on('mouseout', function (event, d) {
        d3.select(this).attr('fill-opacity', arcVisible(d.current) ? (d.children ? 0.85 : 0.65) : 0);
        tooltip.style.opacity = '0';
      })
      .on('click', function (event, d) {
        if (d.children) clicked(d);
      });

    // Labels
    var labels = g.selectAll('text.sb-label')
      .data(allDesc).join('text')
      .attr('class', 'sb-label')
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .attr('fill', function (d) { return d.depth <= 1 ? C.bright : '#1a1c14'; })
      .attr('font-family', FONT)
      .attr('font-size', 10)
      .attr('font-weight', 400)
      .style('pointer-events', 'none')
      .attr('opacity', function (d) { return labelVisible(d.current) ? 1 : 0; })
      .attr('transform', function (d) { return labelTransform(d.current); })
      .text(function (d) { return truncateLabel(d.data.name, getArcWidth(d.current), getBandH(d.current)); });

    // Invisible center circle — click to zoom out
    g.append('circle')
      .attr('r', root.y1)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .style('cursor', 'pointer')
      .on('click', function () {
        if (currentRoot.parent) clicked(currentRoot.parent);
        else clicked(root);
      });

    function clicked(p) {
      currentRoot = p;
      centerText.text(p.data.name);

      root.each(function (d) {
        d.target = {
          x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
          x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
          y0: Math.max(0, d.y0 - p.y0),
          y1: Math.max(0, d.y1 - p.y0),
        };
      });

      var t = g.transition().duration(800);

      paths.transition(t)
        .tween('data', function (d) {
          var i = d3.interpolate(d.current, d.target);
          return function (tt) { d.current = i(tt); };
        })
        .filter(function (d) {
          return +this.getAttribute('fill-opacity') > 0 || arcVisible(d.target);
        })
        .attrTween('d', function (d) { return function () { return arc(d); }; })
        .attr('fill-opacity', function (d) {
          return arcVisible(d.target) ? (d.children ? 0.85 : 0.65) : 0;
        });

      labels.transition(t)
        .tween('data-label', function (d) {
          var i = d3.interpolate(d.current, d.target);
          return function (tt) { d.current = i(tt); };
        })
        .attrTween('transform', function (d) { return function () { return labelTransform(d.current); }; })
        .attr('opacity', function (d) { return labelVisible(d.target) ? 1 : 0; })
        .tween('text', function (d) {
          var self = this;
          return function () {
            self.textContent = truncateLabel(d.data.name, getArcWidth(d.current), getBandH(d.current));
          };
        });
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  //  SCROLL-TRIGGERED RENDERING
  // ════════════════════════════════════════════════════════════════════════════

  var vizMap = {
    'pipeline-viz':     function () { renderPipelineFlow('pipeline-viz'); },
    'genre-galaxy-viz': function () { renderGenreGalaxy('genre-galaxy-viz'); },
    'frequency-viz':    function () { renderFrequencyEvolution('frequency-viz'); },
    'artist-viz':       function () { renderArtistConstellation('artist-viz'); },
    'stream-viz':       function () { renderStreamgraph('stream-viz'); },
    'timeline-viz':     function () { renderListeningTimeline('timeline-viz'); },
    'freq-dist-viz':    function () { renderFrequencyDistribution('freq-dist-viz'); },
    'tsne-viz':         function () { renderTSNE('tsne-viz'); },
    'sunburst-viz':     function () { renderSunburst('sunburst-viz'); },
  };

  function initViz() {
    // Load data then set up observers
    Promise.all([loadGenreData(), loadArtistData(), loadTimelineData(), loadFrequencyData(), loadTSNEData(), loadHierarchyData()])
      .then(function () {
        var observer = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var id = entry.target.id;
            if (entry.target.dataset.vizRendered === 'true') return;
            entry.target.dataset.vizRendered = 'true';
            if (vizMap[id]) vizMap[id]();
          });
        }, { threshold: 0.3 });

        Object.keys(vizMap).forEach(function (id) {
          var el = document.getElementById(id);
          if (el) observer.observe(el);
        });
      });
  }

  // Boot
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initViz);
  } else {
    initViz();
  }

})();
