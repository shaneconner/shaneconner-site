// Primordial — D3.js data visualizations for ecosystem analysis
// Renders: ecosystem timeline, species streamgraph, body composition streamgraph

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

  // Node type colors (match simulation viewer)
  var NODE_COLORS = {
    core:    '#e8e4b0',
    bone:    '#b0b0b0',
    muscle:  '#e07050',
    sensor:  '#50b0e0',
    mouth:   '#e0c050',
    fat:     '#80c060',
    armor:   '#a080c0',
  };

  var NODE_ORDER = ['core', 'bone', 'muscle', 'sensor', 'mouth', 'fat', 'armor'];

  // Species color palette (distinct, readable on dark bg)
  var SP_PALETTE = [
    '#7a8a2a', '#8a3a5a', '#5a7a8a', '#6a7a9a', '#8a6a3a',
    '#6a3a3a', '#3a6a5a', '#7a6a8a', '#5a6a3a', '#8a7a5a',
    '#5a8a5a', '#6a5a7a', '#9a7a3a', '#3a8a7a', '#8a5a6a',
    '#4a7a4a', '#7a5a3a', '#5a5a8a', '#8a8a3a', '#6a8a5a',
  ];

  // ── Data ──────────────────────────────────────────────────────────────────
  var timelineData = null;

  function loadJSON(url) {
    return fetch(url)
      .then(function (r) {
        if (!r.ok) { console.warn('Primordial charts: failed to load ' + url); return null; }
        return r.json();
      })
      .catch(function (e) { console.warn('Primordial charts: error', e); return null; });
  }

  function makeTooltip(container) {
    var tip = document.createElement('div');
    tip.className = 'd3-tooltip';
    tip.style.cssText =
      'position:absolute;pointer-events:none;opacity:0;padding:6px 10px;' +
      'background:rgba(9,11,9,0.95);border:1px solid ' + C.borderL + ';' +
      'font-family:' + FONT + ';font-size:12px;color:' + C.bright + ';' +
      'white-space:nowrap;z-index:10;transition:opacity .15s;max-width:280px;' +
      'line-height:1.5;font-weight:300;';
    container.style.position = 'relative';
    container.appendChild(tip);
    return tip;
  }

  function formatTick(t) {
    if (t >= 1000) return (t / 1000) + 'k';
    return '' + t;
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  Chart 1: Ecosystem Timeline (multi-line)
  // ══════════════════════════════════════════════════════════════════════════

  function renderEcosystemTimeline(containerId) {
    var container = document.getElementById(containerId);
    if (!container || !timelineData) return;
    container.innerHTML = '';

    var data = timelineData;
    var width = container.clientWidth;
    var height = Math.max(280, Math.min(360, width * 0.35));
    var margin = { top: 20, right: 70, bottom: 35, left: 50 };
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

    // Scales
    var xScale = d3.scaleLinear()
      .domain([0, data.total_ticks])
      .range([0, w]);

    var popMax = d3.max(data.population);
    var yPopScale = d3.scaleLinear()
      .domain([0, popMax * 1.1])
      .range([h, 0]);

    var spMax = d3.max(data.species_count);
    var ySpScale = d3.scaleLinear()
      .domain([0, spMax * 1.2])
      .range([h, 0]);

    // Phase backgrounds
    var phases = [
      { name: 'Struggle', start: 0, end: 3000, color: 'rgba(138,58,90,0.06)' },
      { name: 'Bloom', start: 3000, end: 6000, color: 'rgba(122,138,42,0.06)' },
      { name: 'Crash', start: 6000, end: 7500, color: 'rgba(138,58,58,0.06)' },
    ];
    phases.forEach(function (p) {
      g.append('rect')
        .attr('x', xScale(p.start))
        .attr('width', xScale(p.end) - xScale(p.start))
        .attr('y', 0).attr('height', h)
        .attr('fill', p.color);
    });

    // Grid lines
    yPopScale.ticks(5).forEach(function (tick) {
      g.append('line')
        .attr('x1', 0).attr('x2', w)
        .attr('y1', yPopScale(tick)).attr('y2', yPopScale(tick))
        .attr('stroke', C.border).attr('stroke-opacity', 0.4)
        .attr('stroke-dasharray', '3,4');
    });

    // Build data arrays
    var popLine = d3.line()
      .x(function (d, i) { return xScale(data.ticks[i]); })
      .y(function (d) { return yPopScale(d); })
      .curve(d3.curveMonotoneX);

    var spLine = d3.line()
      .x(function (d, i) { return xScale(data.ticks[i]); })
      .y(function (d) { return ySpScale(d); })
      .curve(d3.curveMonotoneX);

    var genLine = d3.line()
      .x(function (d, i) { return xScale(data.ticks[i]); })
      .y(function (d) { return ySpScale(d); })
      .curve(d3.curveMonotoneX);

    // Draw lines
    var lines = [
      { data: data.population, gen: popLine, color: C.greenBr, label: 'Population', width: 2 },
      { data: data.species_count, gen: spLine, color: '#c09040', label: 'Species', width: 1.5 },
      { data: data.max_generation, gen: genLine, color: C.dim, label: 'Generation', width: 1 },
    ];

    lines.forEach(function (line) {
      var path = g.append('path')
        .datum(line.data)
        .attr('d', line.gen)
        .attr('fill', 'none')
        .attr('stroke', line.color)
        .attr('stroke-width', line.width)
        .attr('stroke-opacity', 0.85);

      // Animate
      var totalLen = path.node().getTotalLength();
      path
        .attr('stroke-dasharray', totalLen)
        .attr('stroke-dashoffset', totalLen)
        .transition().duration(2000).ease(d3.easeQuadInOut)
        .attr('stroke-dashoffset', 0);
    });

    // Axes
    g.append('g')
      .attr('transform', 'translate(0,' + h + ')')
      .call(d3.axisBottom(xScale).ticks(8).tickFormat(formatTick))
      .call(function (ax) {
        ax.select('.domain').attr('stroke', C.borderL);
        ax.selectAll('.tick line').attr('stroke', C.borderL);
        ax.selectAll('.tick text').attr('fill', C.dim).attr('font-size', 10).attr('font-family', FONT);
      });

    // Left axis (pop)
    g.append('g')
      .call(d3.axisLeft(yPopScale).ticks(5))
      .call(function (ax) {
        ax.select('.domain').attr('stroke', C.borderL);
        ax.selectAll('.tick line').attr('stroke', C.borderL);
        ax.selectAll('.tick text').attr('fill', C.greenBr).attr('font-size', 10).attr('font-family', FONT);
      });

    // Right axis (species)
    g.append('g')
      .attr('transform', 'translate(' + w + ',0)')
      .call(d3.axisRight(ySpScale).ticks(5))
      .call(function (ax) {
        ax.select('.domain').attr('stroke', C.borderL);
        ax.selectAll('.tick line').attr('stroke', C.borderL);
        ax.selectAll('.tick text').attr('fill', '#c09040').attr('font-size', 10).attr('font-family', FONT);
      });

    // Legend
    var legend = [
      { label: 'Population', color: C.greenBr },
      { label: 'Species', color: '#c09040' },
      { label: 'Generation', color: C.dim },
    ];
    legend.forEach(function (item, i) {
      var ly = 8 + i * 16;
      g.append('line')
        .attr('x1', 8).attr('x2', 24)
        .attr('y1', ly).attr('y2', ly)
        .attr('stroke', item.color).attr('stroke-width', 2);
      g.append('text')
        .attr('x', 28).attr('y', ly + 4)
        .attr('fill', item.color).attr('font-size', 10)
        .attr('font-family', FONT).text(item.label);
    });

    // Hover overlay
    var hoverLine = g.append('line')
      .attr('y1', 0).attr('y2', h)
      .attr('stroke', C.dim).attr('stroke-width', 0.5)
      .attr('stroke-dasharray', '3,3')
      .style('opacity', 0);

    g.append('rect')
      .attr('width', w).attr('height', h)
      .attr('fill', 'transparent')
      .on('mousemove', function (event) {
        var rect = container.getBoundingClientRect();
        var mx = event.clientX - rect.left - margin.left;
        var tick = Math.round(xScale.invert(mx));
        var idx = Math.round(tick / data.sample_interval);
        idx = Math.max(0, Math.min(data.ticks.length - 1, idx));

        hoverLine.attr('x1', xScale(data.ticks[idx])).attr('x2', xScale(data.ticks[idx])).style('opacity', 1);
        tooltip.innerHTML =
          '<strong>Tick ' + formatTick(data.ticks[idx]) + '</strong><br>' +
          'Pop: ' + data.population[idx] + '<br>' +
          'Species: ' + data.species_count[idx] + '<br>' +
          'Gen: ' + data.max_generation[idx];
        tooltip.style.opacity = '1';
        tooltip.style.left = (event.clientX - rect.left + 12) + 'px';
        tooltip.style.top = (event.clientY - rect.top - 50) + 'px';
      })
      .on('mouseleave', function () {
        hoverLine.style('opacity', 0);
        tooltip.style.opacity = '0';
      });
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  Chart 2: Species Streamgraph
  // ══════════════════════════════════════════════════════════════════════════

  function renderSpeciesStream(containerId) {
    var container = document.getElementById(containerId);
    if (!container || !timelineData) return;
    container.innerHTML = '';

    var data = timelineData;
    var species = Object.keys(data.species_populations);
    if (!species.length) return;

    // Sort species by peak population (largest first)
    species.sort(function (a, b) {
      var peakA = d3.max(data.species_populations[a]);
      var peakB = d3.max(data.species_populations[b]);
      return peakB - peakA;
    });

    // Build tabular data for d3.stack
    var tableData = data.ticks.map(function (tick, i) {
      var row = { tick: tick, _idx: i };
      species.forEach(function (sp) {
        row[sp] = data.species_populations[sp][i] || 0;
      });
      return row;
    });

    var width = container.clientWidth;
    var height = Math.max(300, Math.min(400, width * 0.4));
    var margin = { top: 20, right: 20, bottom: 35, left: 50 };
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

    var stack = d3.stack()
      .keys(species)
      .order(d3.stackOrderInsideOut)
      .offset(d3.stackOffsetWiggle);

    var series = stack(tableData);

    var xScale = d3.scaleLinear()
      .domain([0, data.total_ticks])
      .range([0, w]);

    var yMin = d3.min(series, function (s) { return d3.min(s, function (d) { return d[0]; }); });
    var yMax = d3.max(series, function (s) { return d3.max(s, function (d) { return d[1]; }); });
    var yScale = d3.scaleLinear()
      .domain([yMin, yMax])
      .range([h, 0]);

    var area = d3.area()
      .x(function (d) { return xScale(d.data.tick); })
      .y0(function (d) { return yScale(d[0]); })
      .y1(function (d) { return yScale(d[1]); })
      .curve(d3.curveBasis);

    // Color map
    var spColorMap = {};
    species.forEach(function (sp, i) {
      spColorMap[sp] = SP_PALETTE[i % SP_PALETTE.length];
    });

    g.selectAll('.sp-area')
      .data(series)
      .enter().append('path')
      .attr('class', 'sp-area')
      .attr('d', area)
      .attr('fill', function (d) { return spColorMap[d.key]; })
      .attr('fill-opacity', 0.75)
      .attr('stroke', function (d) { return spColorMap[d.key]; })
      .attr('stroke-width', 0.3)
      .on('mouseenter', function (event, d) {
        var peakPop = d3.max(data.species_populations[d.key]);
        tooltip.innerHTML = '<strong>' + d.key + '</strong><br>Peak pop: ' + peakPop;
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
      });

    // X axis
    g.append('g')
      .attr('transform', 'translate(0,' + h + ')')
      .call(d3.axisBottom(xScale).ticks(8).tickFormat(formatTick))
      .call(function (ax) {
        ax.select('.domain').attr('stroke', C.borderL);
        ax.selectAll('.tick line').attr('stroke', C.borderL);
        ax.selectAll('.tick text').attr('fill', C.dim).attr('font-size', 10).attr('font-family', FONT);
      });

    // Label
    g.append('text')
      .attr('x', w / 2).attr('y', h + 30)
      .attr('text-anchor', 'middle')
      .attr('fill', C.dim).attr('font-size', 10).attr('font-family', FONT)
      .text('Simulation Ticks');
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  Chart 3: Body Composition Streamgraph
  // ══════════════════════════════════════════════════════════════════════════

  function renderBodyComposition(containerId) {
    var container = document.getElementById(containerId);
    if (!container || !timelineData) return;
    container.innerHTML = '';

    var data = timelineData;
    var ntc = data.node_type_counts;
    if (!ntc) return;

    // Build tabular data
    var tableData = data.ticks.map(function (tick, i) {
      var row = { tick: tick };
      NODE_ORDER.forEach(function (name) {
        row[name] = (ntc[name] && ntc[name][i]) || 0;
      });
      return row;
    });

    var width = container.clientWidth;
    var height = Math.max(280, Math.min(360, width * 0.35));
    var margin = { top: 20, right: 120, bottom: 35, left: 50 };
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

    var stack = d3.stack()
      .keys(NODE_ORDER)
      .order(d3.stackOrderReverse);

    var series = stack(tableData);

    var xScale = d3.scaleLinear()
      .domain([0, data.total_ticks])
      .range([0, w]);

    var yMax = d3.max(series, function (s) { return d3.max(s, function (d) { return d[1]; }); });
    var yScale = d3.scaleLinear()
      .domain([0, yMax])
      .range([h, 0]);

    var area = d3.area()
      .x(function (d) { return xScale(d.data.tick); })
      .y0(function (d) { return yScale(d[0]); })
      .y1(function (d) { return yScale(d[1]); })
      .curve(d3.curveMonotoneX);

    g.selectAll('.body-area')
      .data(series)
      .enter().append('path')
      .attr('class', 'body-area')
      .attr('d', area)
      .attr('fill', function (d) { return NODE_COLORS[d.key]; })
      .attr('fill-opacity', 0.75)
      .attr('stroke', function (d) { return NODE_COLORS[d.key]; })
      .attr('stroke-width', 0.5)
      .on('mouseenter', function (event, d) {
        tooltip.innerHTML = '<strong>' + d.key.charAt(0).toUpperCase() + d.key.slice(1) + '</strong>';
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
      });

    // X axis
    g.append('g')
      .attr('transform', 'translate(0,' + h + ')')
      .call(d3.axisBottom(xScale).ticks(8).tickFormat(formatTick))
      .call(function (ax) {
        ax.select('.domain').attr('stroke', C.borderL);
        ax.selectAll('.tick line').attr('stroke', C.borderL);
        ax.selectAll('.tick text').attr('fill', C.dim).attr('font-size', 10).attr('font-family', FONT);
      });

    // Y axis
    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5))
      .call(function (ax) {
        ax.select('.domain').attr('stroke', C.borderL);
        ax.selectAll('.tick line').attr('stroke', C.borderL);
        ax.selectAll('.tick text').attr('fill', C.dim).attr('font-size', 10).attr('font-family', FONT);
      });

    // Y label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -h / 2).attr('y', -38)
      .attr('text-anchor', 'middle')
      .attr('fill', C.dim).attr('font-size', 10).attr('font-family', FONT)
      .text('Total Nodes');

    // Legend
    var legendItems = NODE_ORDER.slice().reverse();
    legendItems.forEach(function (name, i) {
      var ly = 8 + i * 18;
      g.append('rect')
        .attr('x', w + 12).attr('y', ly - 5)
        .attr('width', 10).attr('height', 10)
        .attr('fill', NODE_COLORS[name]).attr('fill-opacity', 0.8);
      g.append('text')
        .attr('x', w + 26).attr('y', ly + 4)
        .attr('fill', C.text).attr('font-size', 10)
        .attr('font-family', FONT)
        .text(name.charAt(0).toUpperCase() + name.slice(1));
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  Init
  // ══════════════════════════════════════════════════════════════════════════

  var vizMap = {
    'ecosystem-timeline': renderEcosystemTimeline,
    'species-stream': renderSpeciesStream,
    'body-composition': renderBodyComposition,
  };

  function initCharts() {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        if (el.dataset.vizRendered === 'true') return;
        el.dataset.vizRendered = 'true';
        var fn = vizMap[el.id];
        if (fn) fn(el.id);
      });
    }, { threshold: 0.2 });

    Object.keys(vizMap).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) observer.observe(el);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      loadJSON('/data/primordial-timeline.json').then(function (d) {
        if (d) timelineData = d;
        initCharts();
      });
    });
  } else {
    loadJSON('/data/primordial-timeline.json').then(function (d) {
      if (d) timelineData = d;
      initCharts();
    });
  }

})();
