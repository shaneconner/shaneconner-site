// Resonance — Music Intelligence — D3.js visualizations
// Renders into #pipeline-viz, #genre-galaxy-viz, #frequency-viz, #artist-viz, #timeline-viz

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

  // Genre community colors
  var COMMUNITY_COLORS = [
    '#7a8a2a', // rock / alt — green
    '#8a3a5a', // post-punk / dark — burgundy
    '#5a7a8a', // shoegaze / dream — teal
    '#6a7a9a', // electronic — blue-grey
    '#8a6a3a', // synth / new wave — amber
    '#6a3a3a', // metal — dark red
    '#3a6a5a', // math / prog — teal-green
    '#7a6a8a', // post-rock / experimental — mauve
    '#5a6a3a', // jazz — olive
    '#8a7a5a', // hip-hop — tan
    '#5a8a5a', // folk — forest
    '#6a5a7a', // classical — violet
  ];

  // ── Data ──────────────────────────────────────────────────────────────────
  var genreData = null;
  var artistData = null;
  var timelineData = null;
  var frequencyData = null;

  function loadGenreData() {
    return fetch('/data/resonance-genres.json')
      .then(function (r) { return r.json(); })
      .then(function (d) { genreData = d; return d; })
      .catch(function () { return null; });
  }

  function loadArtistData() {
    return fetch('/data/resonance-artists.json')
      .then(function (r) { return r.json(); })
      .then(function (d) { artistData = d; return d; })
      .catch(function () { return null; });
  }

  function loadTimelineData() {
    return fetch('/data/resonance-timeline.json')
      .then(function (r) { return r.json(); })
      .then(function (d) { timelineData = d; return d; })
      .catch(function () { return null; });
  }

  function loadFrequencyData() {
    return fetch('/data/resonance-frequency.json')
      .then(function (r) { return r.json(); })
      .then(function (d) { frequencyData = d; return d; })
      .catch(function () { return null; });
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
      'MusicBrainz': 'Authoritative metadata — ISRCs, recording relationships, release groups, disambiguation.',
      'ListenBrainz': 'Open community listening data and collaborative filtering recommendations.',
      'Deezer': 'Audio previews (30-sec), independent recommendation graph, and related-artist data.',
      'Discogs': 'Physical release data, label information, artist credits, and discographic lineage.',
      'Genius': 'Lyrics, annotations, song descriptions, and artist bios.',
    };

    // Edges: Spotify → DB, DB ↔ each enrichment source
    var edges = [];
    edges.push({ source: nodes[0], target: nodes[1] });
    for (var i = 2; i < nodes.length; i++) {
      edges.push({ source: nodes[1], target: nodes[i] });
    }

    // Draw edges with animated pulses
    edges.forEach(function (e, idx) {
      var line = svg.append('line')
        .attr('x1', e.source.x).attr('y1', e.source.y)
        .attr('x2', e.target.x).attr('y2', e.target.y)
        .attr('stroke', C.borderL).attr('stroke-width', 1.5);

      // Animated pulse
      var pulse = svg.append('circle')
        .attr('r', 3)
        .attr('fill', e.target.color || C.greenBr)
        .attr('filter', 'url(#pipeline-glow)')
        .attr('opacity', 0);

      function animatePulse() {
        var duration = 2000 + Math.random() * 1500;
        var delay = idx * 400 + Math.random() * 800;
        pulse
          .attr('cx', e.source.x).attr('cy', e.source.y)
          .attr('opacity', 0)
          .transition().delay(delay).duration(200).attr('opacity', 0.9)
          .transition().duration(duration).ease(d3.easeQuadInOut)
          .attr('cx', e.target.x).attr('cy', e.target.y)
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

    // Simulation
    var simulation = d3.forceSimulation(data.nodes)
      .force('link', d3.forceLink(data.links).id(function (d) { return d.id; })
        .distance(function (d) { return 80 - d.weight * 30; })
        .strength(function (d) { return d.weight * 0.6; }))
      .force('charge', d3.forceManyBody().strength(-120))
      .force('center', d3.forceCenter(width / 2, height / 2))
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

    // Genre-to-color mapping
    var genreColorMap = {
      'ambient': '#5a7a8a',
      'idm': '#6a7a9a',
      'vaporwave': '#7a6a8a',
      'drone': '#5a5a5a',
      'minimalism': '#8a6a3a',
      'downtempo': '#8a7a5a',
      'electronic': '#6a7a9a',
      'experimental': '#7a6a8a',
      'french house': '#8a3a5a',
      'soundtrack': '#7a8a2a',
      'plunderphonics': '#6a3a5a',
      'chillwave': '#5a8a7a',
      'dub techno': '#3a6a5a',
      'unknown': '#4a4a3a',
    };

    var maxListens = d3.max(data.nodes, function (d) { return d.listens; });
    var rScale = d3.scaleSqrt().domain([0, maxListens]).range([5, 24]);

    var simulation = d3.forceSimulation(data.nodes)
      .force('link', d3.forceLink(data.links).id(function (d) { return d.id; })
        .distance(function (d) { return 100 - d.weight * 40; })
        .strength(function (d) { return d.weight * 0.5; }))
      .force('charge', d3.forceManyBody().strength(-150))
      .force('center', d3.forceCenter(width / 2, height / 2))
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
      .attr('fill', function (d) { return genreColorMap[d.genre] || C.dim; })
      .attr('fill-opacity', 0.7)
      .attr('stroke', function (d) { return genreColorMap[d.genre] || C.dim; })
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
          ? (genreColorMap[d.genre] || C.dim) : C.borderL;
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

    var cats = data.categories;
    var width = container.clientWidth;
    var barH = 28;
    var gap = 6;
    var margin = { top: 10, right: 60, bottom: 10, left: 110 };
    var h = cats.length * (barH + gap);
    var height = h + margin.top + margin.bottom;
    var w = width - margin.left - margin.right;

    var tooltip = makeTooltip(container);

    var compositionColors = {
      'Soundtrack': '#7a8a2a',
      'Electronic': '#6a7a9a',
      'Ambient': '#5a7a8a',
      'Vaporwave': '#7a6a8a',
      'IDM': '#6a7a9a',
      'Minimalism': '#8a6a3a',
      'Drone': '#5a5a5a',
      'Experimental': '#8a3a5a',
      'Downtempo': '#8a7a5a',
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
      .attr('fill', function (d) { return compositionColors[d.name] || C.dim; })
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
  //  SCROLL-TRIGGERED RENDERING
  // ════════════════════════════════════════════════════════════════════════════

  var vizMap = {
    'pipeline-viz':     function () { renderPipelineFlow('pipeline-viz'); },
    'genre-galaxy-viz': function () { renderGenreGalaxy('genre-galaxy-viz'); },
    'frequency-viz':    function () { renderFrequencyEvolution('frequency-viz'); },
    'artist-viz':       function () { renderArtistConstellation('artist-viz'); },
    'timeline-viz':     function () { renderListeningTimeline('timeline-viz'); },
    'freq-dist-viz':    function () { renderFrequencyDistribution('freq-dist-viz'); },
  };

  function initViz() {
    // Load data then set up observers
    Promise.all([loadGenreData(), loadArtistData(), loadTimelineData(), loadFrequencyData()])
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
