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
      { name: 'Last.fm',      x: width * 0.82, y: height * 0.12, color: '#d51007', role: 'enrichment' },
      { name: 'MusicBrainz',  x: width * 0.88, y: height * 0.30, color: '#ba478f', role: 'enrichment' },
      { name: 'Deezer',       x: width * 0.90, y: height * 0.50, color: '#a238ff', role: 'enrichment' },
      { name: 'Discogs',      x: width * 0.88, y: height * 0.70, color: '#333333', role: 'enrichment' },
      { name: 'Genius',       x: width * 0.82, y: height * 0.88, color: '#ffff64', role: 'enrichment' },
    ];

    var descriptions = {
      'Spotify': 'Canonical source. Tracks, albums, artists, playlists, audio features, and play history.',
      'SQLite Graph': '27 normalized tables. Every entity enriched from multiple sources without duplication.',
      'Last.fm': 'Scrobble history, listening patterns, artist/track similarity networks, and tag data.',
      'MusicBrainz': 'Authoritative metadata — ISRCs, recording relationships, release groups, disambiguation.',
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
    node.filter(function (d) { return d.count > 60; })
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
      'alternative': '#7a8a2a',
      'prog-metal': '#6a3a3a',
      'idm': '#6a7a9a',
      'industrial': '#5a5a5a',
      'synth-pop': '#8a6a3a',
      'trip-hop': '#8a7a5a',
      'post-rock': '#5a7a8a',
      'shoegaze': '#5a7a8a',
      'dream-pop': '#5a7a8a',
      'experimental': '#7a6a8a',
      'prog-rock': '#3a6a5a',
      'post-punk': '#8a3a5a',
      'gothic-rock': '#8a3a5a',
      'electronic': '#6a7a9a',
      'ambient': '#6a7a9a',
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
    node.filter(function (d) { return d.listens > 140; })
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
  //  5. LISTENING TIMELINE (Stacked Area Chart)
  // ════════════════════════════════════════════════════════════════════════════

  function renderListeningTimeline(containerId) {
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

    var yMax = d3.max(series[series.length - 1], function (d) { return d[1]; });
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
  //  SCROLL-TRIGGERED RENDERING
  // ════════════════════════════════════════════════════════════════════════════

  var vizMap = {
    'pipeline-viz':     function () { renderPipelineFlow('pipeline-viz'); },
    'genre-galaxy-viz': function () { renderGenreGalaxy('genre-galaxy-viz'); },
    'frequency-viz':    function () { renderFrequencyEvolution('frequency-viz'); },
    'artist-viz':       function () { renderArtistConstellation('artist-viz'); },
    'timeline-viz':     function () { renderListeningTimeline('timeline-viz'); },
  };

  function initViz() {
    // Load data then set up observers
    Promise.all([loadGenreData(), loadArtistData(), loadTimelineData()])
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
