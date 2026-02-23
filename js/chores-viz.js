// Chore Tracker — D3.js visualizations
// Renders into #sunburst-viz, #cascade-viz, #frequency-viz, #distribution-viz

(function () {
  'use strict';

  // ── Theme tokens ──────────────────────────────────────────────────────────
  const C = {
    bg:        '#090b09',
    text:      '#d4cfc3',
    dim:       '#7a7868',
    bright:    '#ede8db',
    green:     '#7a8a2a',
    greenBr:   '#9aaa3a',
    depthScale: ['#2e3218', '#4a5520', '#7a8a2a', '#9aaa3a', '#b5c24a'],
  };

  const FONT_LABEL = 'Outfit, sans-serif';
  const FONT_TITLE = "'Playfair Display', serif";

  let hierarchyData = null;

  // ── Data loading ──────────────────────────────────────────────────────────
  function loadData() {
    return fetch('/data/hierarchy.json')
      .then(function (r) { return r.json(); })
      .then(function (d) { hierarchyData = d; return d; });
  }

  // ── Utility: depth-based color ────────────────────────────────────────────
  function depthColor(d) {
    var depth = d;
    if (typeof d === 'object' && d !== null) depth = d.depth;
    var idx = Math.min(depth, C.depthScale.length - 1);
    return C.depthScale[idx];
  }

  // ── Utility: count descendants (leaves) ───────────────────────────────────
  function countChildren(node) {
    if (!node.children) return 0;
    return node.children.length;
  }

  // ════════════════════════════════════════════════════════════════════════════
  //  1.  SUNBURST
  // ════════════════════════════════════════════════════════════════════════════
  function renderSunburst(containerId) {
    var container = document.getElementById(containerId);
    if (!container || !hierarchyData) return;
    container.innerHTML = '';

    var width = container.clientWidth;
    var height = width;                       // 1:1 aspect
    var radius = width / 2;

    // Tooltip div
    var tooltip = document.createElement('div');
    tooltip.className = 'd3-tooltip';
    tooltip.style.cssText =
      'position:absolute;pointer-events:none;opacity:0;padding:6px 10px;' +
      'background:#1a1c14;border:1px solid #3a3c2a;border-radius:4px;' +
      'font-family:' + FONT_LABEL + ';font-size:12px;color:' + C.bright + ';' +
      'white-space:nowrap;z-index:10;transition:opacity .15s;';
    container.style.position = 'relative';
    container.appendChild(tooltip);

    var svg = d3.select(container)
      .append('svg')
      .attr('viewBox', '0 0 ' + width + ' ' + height)
      .attr('width', width)
      .attr('height', height)
      .style('font-family', FONT_LABEL)
      .style('display', 'block');

    var g = svg.append('g')
      .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

    // Build hierarchy
    var root = d3.hierarchy(hierarchyData.exercise)
      .sum(function (d) { return d.value || 0; })
      .sort(function (a, b) { return b.value - a.value; });

    var partition = d3.partition()
      .size([2 * Math.PI, radius]);

    partition(root);

    // Arc generator
    var arc = d3.arc()
      .startAngle(function (d) { return d.x0; })
      .endAngle(function (d) { return d.x1; })
      .padAngle(function (d) { return Math.min((d.x1 - d.x0) / 2, 0.005); })
      .padRadius(radius / 2)
      .innerRadius(function (d) { return d.y0; })
      .outerRadius(function (d) { return d.y1 - 1; });

    // Current root for zooming
    var currentRoot = root;

    // Center label
    var centerText = g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', C.bright)
      .style('font-family', FONT_TITLE)
      .style('font-size', '14px')
      .style('pointer-events', 'none')
      .text(root.data.name);

    // Draw arcs
    var paths = g.selectAll('path')
      .data(root.descendants().filter(function (d) { return d.depth; }))
      .join('path')
      .attr('fill', function (d) { return depthColor(d); })
      .attr('fill-opacity', function (d) {
        return d.children ? 0.85 : 0.65;
      })
      .attr('d', arc)
      .style('cursor', 'pointer')
      .on('mouseover', function (event, d) {
        d3.select(this).attr('fill-opacity', 1);
        var childCount = d.children ? d.children.length : 0;
        var label = d.data.name;
        if (childCount > 0) {
          label += ' — ' + childCount + ' children';
        } else {
          label += ' — ' + d.value + ' exercises';
        }
        tooltip.textContent = label;
        tooltip.style.opacity = '1';
      })
      .on('mousemove', function (event) {
        var rect = container.getBoundingClientRect();
        tooltip.style.left = (event.clientX - rect.left + 12) + 'px';
        tooltip.style.top = (event.clientY - rect.top - 28) + 'px';
      })
      .on('mouseout', function (event, d) {
        d3.select(this).attr('fill-opacity', d.children ? 0.85 : 0.65);
        tooltip.style.opacity = '0';
      })
      .on('click', function (event, d) {
        clicked(d);
      });

    // Click center to zoom out
    g.append('circle')
      .attr('r', function () { return root.y1; })
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .style('cursor', 'pointer')
      .on('click', function () {
        if (currentRoot.parent) {
          clicked(currentRoot.parent);
        }
      });

    function clicked(p) {
      currentRoot = p;
      centerText.text(p.data.name);

      var targetX0 = p.x0;
      var targetX1 = p.x1;
      var targetY0 = p.y0;

      root.each(function (d) {
        d.target = {
          x0: Math.max(0, Math.min(1, (d.x0 - targetX0) / (targetX1 - targetX0))) * 2 * Math.PI,
          x1: Math.max(0, Math.min(1, (d.x1 - targetX0) / (targetX1 - targetX0))) * 2 * Math.PI,
          y0: Math.max(0, d.y0 - targetY0),
          y1: Math.max(0, d.y1 - targetY0),
        };
      });

      var t = g.transition().duration(800);

      paths.transition(t)
        .tween('data', function (d) {
          var i = d3.interpolate(
            { x0: d.current ? d.current.x0 : d.x0, x1: d.current ? d.current.x1 : d.x1, y0: d.current ? d.current.y0 : d.y0, y1: d.current ? d.current.y1 : d.y1 },
            d.target
          );
          return function (tt) {
            var val = i(tt);
            d.current = val;
          };
        })
        .attrTween('d', function (d) {
          return function () {
            return arc(d.current);
          };
        })
        .attr('fill-opacity', function (d) {
          // hide arcs outside the zoomed range
          if (d.current && d.current.x1 - d.current.x0 < 0.001) return 0;
          return d.children ? 0.85 : 0.65;
        });
    }

    // Initialize current positions
    root.each(function (d) {
      d.current = { x0: d.x0, x1: d.x1, y0: d.y0, y1: d.y1 };
    });
  }

  // ════════════════════════════════════════════════════════════════════════════
  //  2.  CASCADE
  // ════════════════════════════════════════════════════════════════════════════
  function renderCascade(containerId) {
    var container = document.getElementById(containerId);
    if (!container || !hierarchyData) return;
    container.innerHTML = '';

    var cascade = hierarchyData.cascade;
    var exerciseName = cascade.exercise;
    var chains = cascade.chains;

    var width = container.clientWidth;
    var height = 400;
    var margin = { top: 30, right: 160, bottom: 40, left: 180 };

    // Build tree data: exercise -> chain[last] -> ... -> chain[0] (category root)
    // Layout: exercise on left, category roots fan to the right
    var treeData = {
      name: exerciseName,
      children: chains.map(function (chain) {
        // chain is [category root, ..., leaf nearest exercise]
        // We want: exercise -> leaf -> ... -> category root
        // Reverse the chain so exercise connects to the deepest node first
        var reversed = chain.slice().reverse();
        var node = { name: reversed[0], children: [] };
        var current = node;
        for (var i = 1; i < reversed.length; i++) {
          var child = { name: reversed[i], children: [] };
          current.children.push(child);
          current = child;
        }
        // Remove empty children arrays from leaves
        current.children = undefined;
        return node;
      })
    };

    var root = d3.hierarchy(treeData);
    var treeLayout = d3.tree().size([height - margin.top - margin.bottom, width - margin.left - margin.right]);
    treeLayout(root);

    var svg = d3.select(container)
      .append('svg')
      .attr('viewBox', '0 0 ' + width + ' ' + height)
      .attr('width', width)
      .attr('height', height)
      .style('display', 'block');

    var g = svg.append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // Collect all nodes and links
    var allNodes = root.descendants();
    var allLinks = root.links();

    // Color constants
    var colorOff = '#22231a';
    var colorOn = C.greenBr;

    // Draw links
    var linkGen = d3.linkHorizontal()
      .x(function (d) { return d.y; })
      .y(function (d) { return d.x; });

    var linkPaths = g.selectAll('.cascade-link')
      .data(allLinks)
      .join('path')
      .attr('class', 'cascade-link')
      .attr('d', linkGen)
      .attr('fill', 'none')
      .attr('stroke', colorOff)
      .attr('stroke-width', 2);

    // Draw nodes
    var nodeGroups = g.selectAll('.cascade-node')
      .data(allNodes)
      .join('g')
      .attr('class', 'cascade-node')
      .attr('transform', function (d) { return 'translate(' + d.y + ',' + d.x + ')'; });

    nodeGroups.append('circle')
      .attr('r', function (d) { return d.depth === 0 ? 7 : 5; })
      .attr('fill', colorOff)
      .attr('stroke', '#3a3c2a')
      .attr('stroke-width', 1);

    nodeGroups.append('text')
      .attr('dy', '0.35em')
      .attr('x', function (d) { return d.children ? -10 : 10; })
      .attr('text-anchor', function (d) { return d.children ? 'end' : 'start'; })
      .attr('fill', C.dim)
      .style('font-family', FONT_LABEL)
      .style('font-size', '12px')
      .text(function (d) { return d.data.name; });

    // Animation function
    function animateCascade() {
      // Reset everything
      nodeGroups.selectAll('circle').attr('fill', colorOff);
      nodeGroups.selectAll('text').attr('fill', C.dim);
      linkPaths.attr('stroke', colorOff);

      // Light up root (exercise) first
      var rootNode = nodeGroups.filter(function (d) { return d.depth === 0; });
      rootNode.select('circle')
        .transition().duration(300)
        .attr('fill', colorOn);
      rootNode.select('text')
        .transition().duration(300)
        .attr('fill', C.bright);

      // For each chain (depth-first from root), light up nodes sequentially
      // All chains animate simultaneously, 150ms per depth level
      var maxDepth = d3.max(allNodes, function (d) { return d.depth; });

      for (var depth = 1; depth <= maxDepth; depth++) {
        (function (dep) {
          var delay = 300 + dep * 150;

          // Light up nodes at this depth
          nodeGroups
            .filter(function (d) { return d.depth === dep; })
            .each(function () {
              d3.select(this).select('circle')
                .transition().delay(delay).duration(200)
                .attr('fill', colorOn);
              d3.select(this).select('text')
                .transition().delay(delay).duration(200)
                .attr('fill', C.bright);
            });

          // Light up links leading to this depth
          linkPaths
            .filter(function (d) { return d.target.depth === dep; })
            .transition().delay(delay).duration(200)
            .attr('stroke', colorOn);
        })(depth);
      }
    }

    // Replay button
    var btn = document.createElement('button');
    btn.className = 'replay-btn';
    btn.textContent = 'Replay';
    btn.style.cssText =
      'display:block;margin:12px auto 0;padding:6px 20px;' +
      'background:transparent;border:1px solid ' + C.green + ';' +
      'color:' + C.text + ';font-family:' + FONT_LABEL + ';font-size:13px;' +
      'border-radius:3px;cursor:pointer;transition:background .2s,color .2s;';
    btn.addEventListener('mouseenter', function () {
      btn.style.background = C.green;
      btn.style.color = C.bright;
    });
    btn.addEventListener('mouseleave', function () {
      btn.style.background = 'transparent';
      btn.style.color = C.text;
    });
    btn.addEventListener('click', animateCascade);
    container.appendChild(btn);

    // Trigger initial animation
    animateCascade();
  }

  // ════════════════════════════════════════════════════════════════════════════
  //  3.  FREQUENCY EVOLUTION
  // ════════════════════════════════════════════════════════════════════════════
  function renderFrequencyEvolution(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    var width = container.clientWidth;
    var height = 320;
    var margin = { top: 30, right: 130, bottom: 36, left: 56 };
    var plotW = width - margin.left - margin.right;
    var plotH = height - margin.top - margin.bottom;

    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Synthetic exercise data
    // Each exercise: { name, color, points: [{month, freq}] }
    var phi = 1.382;

    // "Morning Stretch" — starts 7d, tightens to ~3d
    var morningStretch = [
      { month: 0, freq: 7 },
      { month: 2, freq: 7 / phi },               // ~5.07
      { month: 5, freq: 7 / (phi * phi) },        // ~3.67
      { month: 8, freq: 7 / (phi * phi * phi) },  // ~2.65
      { month: 11, freq: 3 }
    ];

    // "Heavy Squat" — starts 7d, loosens to ~21d
    var heavySquat = [
      { month: 0, freq: 7 },
      { month: 3, freq: 7 * phi },          // ~9.67
      { month: 6, freq: 7 * phi * phi },    // ~13.37
      { month: 9, freq: 7 * phi * phi * phi }, // ~18.48
      { month: 11, freq: 21 }
    ];

    // "Core Work" — starts 7d, stays stable
    var coreWork = [
      { month: 0, freq: 7 },
      { month: 3, freq: 7 * phi },     // tightens slightly
      { month: 5, freq: 7 },           // comes back
      { month: 8, freq: 7 / phi },     // loosens slightly
      { month: 10, freq: 7 },
      { month: 11, freq: 7 }
    ];

    // "Flexibility" — starts 7d, gradually abandoned ~45d
    var flexibility = [
      { month: 0, freq: 7 },
      { month: 2, freq: 7 * phi },               // ~9.67
      { month: 4, freq: 7 * phi * phi },          // ~13.37
      { month: 7, freq: 7 * phi * phi * phi },    // ~18.48
      { month: 9, freq: 7 * Math.pow(phi, 4) },   // ~25.5
      { month: 11, freq: 45 }
    ];

    var exercises = [
      { name: 'Morning Stretch', color: '#9aaa3a', points: morningStretch },
      { name: 'Heavy Squat',     color: '#7a8a2a', points: heavySquat },
      { name: 'Core Work',       color: '#6b6a3a', points: coreWork },
      { name: 'Flexibility',     color: '#4a5520', points: flexibility }
    ];

    // Interpolate each exercise into 12 monthly data points for smooth lines
    exercises.forEach(function (ex) {
      var full = [];
      for (var m = 0; m < 12; m++) {
        // Find surrounding key points
        var before = null;
        var after = null;
        for (var j = 0; j < ex.points.length; j++) {
          if (ex.points[j].month <= m) before = ex.points[j];
          if (ex.points[j].month >= m && after === null) after = ex.points[j];
        }
        if (!before) before = after;
        if (!after) after = before;
        var freq;
        if (before.month === after.month) {
          freq = before.freq;
        } else {
          var t = (m - before.month) / (after.month - before.month);
          freq = before.freq + t * (after.freq - before.freq);
        }
        full.push({ month: m, freq: freq });
      }
      ex.fullPoints = full;
    });

    // Scales
    var xScale = d3.scaleLinear().domain([0, 11]).range([0, plotW]);
    var yScale = d3.scaleLog().domain([1, 60]).range([plotH, 0]).clamp(true);

    var svg = d3.select(container)
      .append('svg')
      .attr('viewBox', '0 0 ' + width + ' ' + height)
      .attr('width', width)
      .attr('height', height)
      .style('display', 'block');

    var g = svg.append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // X axis
    g.append('g')
      .attr('transform', 'translate(0,' + plotH + ')')
      .call(
        d3.axisBottom(xScale)
          .ticks(12)
          .tickFormat(function (d) { return months[d] || ''; })
      )
      .call(function (gAxis) {
        gAxis.select('.domain').attr('stroke', C.dim);
        gAxis.selectAll('.tick line').attr('stroke', C.dim).attr('opacity', 0.3);
        gAxis.selectAll('.tick text').attr('fill', C.dim).style('font-family', FONT_LABEL).style('font-size', '11px');
      });

    // Y axis
    g.append('g')
      .call(
        d3.axisLeft(yScale)
          .tickValues([1, 2, 3, 5, 7, 14, 21, 30, 45, 60])
          .tickFormat(function (d) { return d + 'd'; })
      )
      .call(function (gAxis) {
        gAxis.select('.domain').attr('stroke', C.dim);
        gAxis.selectAll('.tick line').attr('stroke', C.dim).attr('opacity', 0.3);
        gAxis.selectAll('.tick text').attr('fill', C.dim).style('font-family', FONT_LABEL).style('font-size', '11px');
      });

    // Y-axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -plotH / 2)
      .attr('y', -42)
      .attr('text-anchor', 'middle')
      .attr('fill', C.dim)
      .style('font-family', FONT_LABEL)
      .style('font-size', '11px')
      .text('Frequency (days)');

    // Light grid lines
    [1, 3, 7, 14, 30, 60].forEach(function (v) {
      g.append('line')
        .attr('x1', 0).attr('x2', plotW)
        .attr('y1', yScale(v)).attr('y2', yScale(v))
        .attr('stroke', C.dim).attr('stroke-opacity', 0.12)
        .attr('stroke-dasharray', '3,4');
    });

    // Line generator
    var lineGen = d3.line()
      .x(function (d) { return xScale(d.month); })
      .y(function (d) { return yScale(d.freq); })
      .curve(d3.curveMonotoneX);

    // Draw each exercise
    var annotationDone = false;

    exercises.forEach(function (ex) {
      // Path
      var path = g.append('path')
        .datum(ex.fullPoints)
        .attr('fill', 'none')
        .attr('stroke', ex.color)
        .attr('stroke-width', 2.5)
        .attr('d', lineGen);

      // Animate draw
      var totalLength = path.node().getTotalLength();
      path
        .attr('stroke-dasharray', totalLength)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(2000)
        .ease(d3.easeLinear)
        .attr('stroke-dashoffset', 0);

      // Adjustment point markers (on the raw key-points, not interpolated)
      ex.points.forEach(function (pt, idx) {
        if (idx === 0) return; // skip start point
        g.append('circle')
          .attr('cx', xScale(pt.month))
          .attr('cy', yScale(pt.freq))
          .attr('r', 3.5)
          .attr('fill', ex.color)
          .attr('stroke', C.bg)
          .attr('stroke-width', 1)
          .attr('opacity', 0)
          .transition()
          .delay(2000 * (pt.month / 11) + 100)
          .duration(300)
          .attr('opacity', 1);

        // Annotate the very first adjustment across all exercises
        if (!annotationDone && idx === 1) {
          annotationDone = true;
          g.append('text')
            .attr('x', xScale(pt.month) + 6)
            .attr('y', yScale(pt.freq) - 10)
            .attr('fill', C.dim)
            .style('font-family', FONT_LABEL)
            .style('font-size', '10px')
            .attr('opacity', 0)
            .text('\u00d71.382')
            .transition()
            .delay(2000 * (pt.month / 11) + 200)
            .duration(400)
            .attr('opacity', 1);
        }
      });

      // Legend label at right
      var lastPt = ex.fullPoints[ex.fullPoints.length - 1];
      g.append('text')
        .attr('x', plotW + 8)
        .attr('y', yScale(lastPt.freq))
        .attr('dy', '0.35em')
        .attr('fill', ex.color)
        .style('font-family', FONT_LABEL)
        .style('font-size', '11px')
        .attr('opacity', 0)
        .text(ex.name)
        .transition()
        .delay(2100)
        .duration(400)
        .attr('opacity', 1);
    });
  }

  // ════════════════════════════════════════════════════════════════════════════
  //  4.  DISTRIBUTION
  // ════════════════════════════════════════════════════════════════════════════
  function renderDistribution(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    var width = container.clientWidth;
    var height = 260;
    var margin = { top: 32, right: 16, bottom: 34, left: 40 };
    var gap = 40;
    var chartW = (width - margin.left - margin.right - gap) / 2;
    var chartH = height - margin.top - margin.bottom;

    var n = 20;

    // Seeded-ish random for consistency
    function pseudoRandom(seed) {
      var x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
      return x - Math.floor(x);
    }

    // Initial: all ~30 days ± noise
    var initial = [];
    for (var i = 0; i < n; i++) {
      initial.push(30 + (pseudoRandom(i) - 0.5) * 8);
    }

    // Evolved: skewed distribution — many short, few long (2–90 days)
    var evolved = [];
    for (var j = 0; j < n; j++) {
      // Use an exponential-ish distribution
      var t = j / (n - 1); // 0..1
      var freq = 2 + Math.pow(t, 1.8) * 88; // 2 to 90
      evolved.push(freq);
    }
    // Shuffle evolved so it looks natural
    var shuffled = evolved.slice();
    for (var k = shuffled.length - 1; k > 0; k--) {
      var swap = Math.floor(pseudoRandom(k + 42) * (k + 1));
      var tmp = shuffled[k];
      shuffled[k] = shuffled[swap];
      shuffled[swap] = tmp;
    }
    evolved = shuffled;

    // Color scale for evolved bars
    var evolvedColorScale = d3.scaleLinear()
      .domain([2, 90])
      .range([C.greenBr, C.dim]);

    var svg = d3.select(container)
      .append('svg')
      .attr('viewBox', '0 0 ' + width + ' ' + height)
      .attr('width', width)
      .attr('height', height)
      .style('display', 'block');

    // Shared y scale
    var yScale = d3.scaleLinear().domain([0, 95]).range([chartH, 0]);

    // ── Left chart (Initial) ──
    var gLeft = svg.append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    var xLeft = d3.scaleBand()
      .domain(d3.range(n))
      .range([0, chartW])
      .padding(0.15);

    // Title
    gLeft.append('text')
      .attr('x', chartW / 2)
      .attr('y', -14)
      .attr('text-anchor', 'middle')
      .attr('fill', C.text)
      .style('font-family', FONT_TITLE)
      .style('font-size', '14px')
      .text('Initial');

    // Y axis left
    gLeft.append('g')
      .call(
        d3.axisLeft(yScale).ticks(5).tickFormat(function (d) { return d + 'd'; })
      )
      .call(function (gAxis) {
        gAxis.select('.domain').attr('stroke', C.dim);
        gAxis.selectAll('.tick line').attr('stroke', C.dim).attr('opacity', 0.3);
        gAxis.selectAll('.tick text').attr('fill', C.dim).style('font-family', FONT_LABEL).style('font-size', '10px');
      });

    // X axis left
    gLeft.append('g')
      .attr('transform', 'translate(0,' + chartH + ')')
      .call(
        d3.axisBottom(xLeft)
          .tickValues(d3.range(0, n, 4))
          .tickFormat(function (d) { return d + 1; })
      )
      .call(function (gAxis) {
        gAxis.select('.domain').attr('stroke', C.dim);
        gAxis.selectAll('.tick line').attr('stroke', C.dim).attr('opacity', 0.3);
        gAxis.selectAll('.tick text').attr('fill', C.dim).style('font-family', FONT_LABEL).style('font-size', '10px');
      });

    // Bars (left)
    var leftBars = gLeft.selectAll('.bar-left')
      .data(initial)
      .join('rect')
      .attr('class', 'bar-left')
      .attr('x', function (d, i) { return xLeft(i); })
      .attr('width', xLeft.bandwidth())
      .attr('y', function (d) { return yScale(d); })
      .attr('height', function (d) { return chartH - yScale(d); })
      .attr('fill', C.green)
      .attr('rx', 1);

    // ── Right chart (Evolved) ──
    var rightOffset = margin.left + chartW + gap;
    var gRight = svg.append('g')
      .attr('transform', 'translate(' + rightOffset + ',' + margin.top + ')');

    var xRight = d3.scaleBand()
      .domain(d3.range(n))
      .range([0, chartW])
      .padding(0.15);

    // Title
    gRight.append('text')
      .attr('x', chartW / 2)
      .attr('y', -14)
      .attr('text-anchor', 'middle')
      .attr('fill', C.text)
      .style('font-family', FONT_TITLE)
      .style('font-size', '14px')
      .text('Evolved');

    // Y axis right
    gRight.append('g')
      .call(
        d3.axisLeft(yScale).ticks(5).tickFormat(function (d) { return d + 'd'; })
      )
      .call(function (gAxis) {
        gAxis.select('.domain').attr('stroke', C.dim);
        gAxis.selectAll('.tick line').attr('stroke', C.dim).attr('opacity', 0.3);
        gAxis.selectAll('.tick text').attr('fill', C.dim).style('font-family', FONT_LABEL).style('font-size', '10px');
      });

    // X axis right
    gRight.append('g')
      .attr('transform', 'translate(0,' + chartH + ')')
      .call(
        d3.axisBottom(xRight)
          .tickValues(d3.range(0, n, 4))
          .tickFormat(function (d) { return d + 1; })
      )
      .call(function (gAxis) {
        gAxis.select('.domain').attr('stroke', C.dim);
        gAxis.selectAll('.tick line').attr('stroke', C.dim).attr('opacity', 0.3);
        gAxis.selectAll('.tick text').attr('fill', C.dim).style('font-family', FONT_LABEL).style('font-size', '10px');
      });

    // Bars (right) — start as initial, morph to evolved
    var rightBars = gRight.selectAll('.bar-right')
      .data(initial)
      .join('rect')
      .attr('class', 'bar-right')
      .attr('x', function (d, i) { return xRight(i); })
      .attr('width', xRight.bandwidth())
      .attr('y', function (d) { return yScale(d); })
      .attr('height', function (d) { return chartH - yScale(d); })
      .attr('fill', C.green)
      .attr('rx', 1);

    // After 1.5s, morph to evolved state
    setTimeout(function () {
      rightBars
        .data(evolved)
        .transition()
        .duration(1200)
        .ease(d3.easeCubicInOut)
        .attr('y', function (d) { return yScale(d); })
        .attr('height', function (d) { return chartH - yScale(d); })
        .attr('fill', function (d) { return evolvedColorScale(d); });
    }, 1500);
  }

  // ════════════════════════════════════════════════════════════════════════════
  //  SCROLL-TRIGGERED RENDERING & INIT
  // ════════════════════════════════════════════════════════════════════════════

  var vizMap = {
    'sunburst-viz':     renderSunburst,
    'cascade-viz':      renderCascade,
    'frequency-viz':    renderFrequencyEvolution,
    'distribution-viz': renderDistribution,
  };

  function initVisualizations() {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        if (el.dataset.vizRendered === 'true') return;
        el.dataset.vizRendered = 'true';
        var fn = vizMap[el.id];
        if (fn) fn(el.id);
      });
    }, { threshold: 0.3 });

    Object.keys(vizMap).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) observer.observe(el);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    loadData().then(function () {
      initVisualizations();
    }).catch(function (err) {
      console.error('Failed to load hierarchy data:', err);
      // Frequency and Distribution don't need hierarchy data, initialize anyway
      initVisualizations();
    });
  });

})();
