// AI Investor Agent — D3.js visualizations
// Renders into #architecture-viz, #attention-viz, #reward-viz, #regime-viz

(function () {
  'use strict';

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
    red:     'rgba(139,41,66,0.6)',
    redBg:   'rgba(139,41,66,0.12)',
    greenBg: 'rgba(122,138,42,0.10)',
    amberBg: 'rgba(180,154,110,0.10)',
  };

  var FONT = 'Outfit, sans-serif';

  // ════════════════════════════════════════════════════════════════════════════
  //  1. ARCHITECTURE FLOW DIAGRAM
  // ════════════════════════════════════════════════════════════════════════════

  var nodeDescriptions = {
    'FRED':               'Federal Reserve Economic Data. Macro indicators including interest rates, unemployment, CPI, yield curves, and credit spreads.',
    'SEC EDGAR':          'Securities and Exchange Commission filings. Tracks insider transactions (Form 4), quarterly reports, and earnings surprises.',
    'News':               'Financial news processed through FinBERT-based sentiment analysis. Captures market narrative and sentiment shifts.',
    'Market':             'OHLCV price data and volume metrics. Technical indicators, momentum signals, and volatility measures.',
    'Feature Engineering':'15 specialized modules transform raw data into ML-ready features. Calendar effects, fundamentals, macro context, sentiment embeddings, and more.',
    'Regime Detection':   'Classifies current market state (expansion, contraction, high volatility, recovery) using VIX, trend indicators, and yield curve signals.',
    'Stock Screener':     'Gradient boosting model ranks the full stock universe by predicted forward returns. Outputs top-N candidates for portfolio consideration.',
    'RL Allocator':       'PPO agent with custom Transformer policy network. Cross-asset self-attention learns correlations. Outputs optimal portfolio weights.',
    'Portfolio':          'Final position weights after risk management constraints. Max position limits, drawdown controls, and transaction cost budgets.',
  };

  function renderArchitectureFlow(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    var width = container.clientWidth;
    var height = 450;

    // Node definitions: { name, subtitle, col, row }
    var columns = [
      { label: 'DATA SOURCES', x: 0.12 },
      { label: 'PROCESSING',   x: 0.38 },
      { label: 'MODELS',       x: 0.64 },
      { label: 'OUTPUT',       x: 0.88 },
    ];

    var nodes = [
      { name: 'FRED',               subtitle: 'Macro indicators',          col: 0, row: 0 },
      { name: 'SEC EDGAR',          subtitle: 'Filings & insider',         col: 0, row: 1 },
      { name: 'News',               subtitle: 'Sentiment analysis',        col: 0, row: 2 },
      { name: 'Market',             subtitle: 'Price & volume',            col: 0, row: 3 },
      { name: 'Feature Engineering', subtitle: '15 specialized modules',   col: 1, row: 0.75 },
      { name: 'Regime Detection',   subtitle: 'Market state classification',col: 1, row: 2.75 },
      { name: 'Stock Screener',     subtitle: 'Cross-sectional ranking',   col: 2, row: 0.75 },
      { name: 'RL Allocator',       subtitle: 'PPO + Transformer policy',  col: 2, row: 2.75 },
      { name: 'Portfolio',          subtitle: 'Optimized weights',         col: 3, row: 1.75 },
    ];

    var nodeW = 140, nodeH = 48;
    var topPad = 60, rowGap = 80;

    nodes.forEach(function (n) {
      n.x = columns[n.col].x * width;
      n.y = topPad + n.row * rowGap;
    });

    var edges = [
      ['FRED',               'Feature Engineering'],
      ['SEC EDGAR',          'Feature Engineering'],
      ['News',               'Feature Engineering'],
      ['Market',             'Feature Engineering'],
      ['Feature Engineering','Regime Detection'],
      ['Feature Engineering','Stock Screener'],
      ['Regime Detection',   'RL Allocator'],
      ['Stock Screener',     'RL Allocator'],
      ['RL Allocator',       'Portfolio'],
    ];

    function findNode(name) {
      for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].name === name) return nodes[i];
      }
      return null;
    }

    // Tooltip & description
    var descPanel = document.createElement('div');
    descPanel.style.cssText =
      'max-width:700px;margin:1rem auto 0;padding:0.75rem 1rem;font-family:' + FONT +
      ';font-size:0.78rem;color:' + C.text + ';line-height:1.6;border-left:2px solid ' +
      C.green + ';opacity:0;transition:opacity 0.3s;font-weight:300;';
    container.appendChild(descPanel);

    var svg = d3.select(container)
      .insert('svg', ':first-child')
      .attr('viewBox', '0 0 ' + width + ' ' + height)
      .attr('width', width)
      .attr('height', height)
      .style('display', 'block');

    // Column headers
    columns.forEach(function (col) {
      svg.append('text')
        .attr('x', col.x * width)
        .attr('y', 28)
        .attr('text-anchor', 'middle')
        .attr('fill', C.dim)
        .style('font-family', FONT)
        .style('font-size', '9px')
        .style('letter-spacing', '0.15em')
        .text(col.label);
    });

    // Draw edges
    var edgePaths = [];
    edges.forEach(function (e) {
      var src = findNode(e[0]);
      var tgt = findNode(e[1]);
      if (!src || !tgt) return;

      var sx = src.x + nodeW / 2;
      var sy = src.y + nodeH / 2;
      var tx = tgt.x - nodeW / 2;
      var ty = tgt.y + nodeH / 2;
      var mx = (sx + tx) / 2;

      var pathD = 'M' + sx + ',' + sy + ' C' + mx + ',' + sy + ' ' + mx + ',' + ty + ' ' + tx + ',' + ty;

      var path = svg.append('path')
        .attr('d', pathD)
        .attr('fill', 'none')
        .attr('stroke', C.border)
        .attr('stroke-width', 1.5);

      edgePaths.push(path);
    });

    // Animated particles along edges
    function animateParticles() {
      edgePaths.forEach(function (path, idx) {
        var pathNode = path.node();
        var len = pathNode.getTotalLength();
        var numParticles = 2;
        for (var p = 0; p < numParticles; p++) {
          (function(pIdx) {
            var particle = svg.append('circle')
              .attr('r', 2.5)
              .attr('fill', C.greenBr)
              .attr('opacity', 0.7);

            function loop() {
              var pt0 = pathNode.getPointAtLength(0);
              particle
                .attr('cx', pt0.x)
                .attr('cy', pt0.y)
                .attr('opacity', 0)
                .transition()
                .delay(pIdx * 1200 + idx * 200)
                .duration(0)
                .attr('opacity', 0.7)
                .transition()
                .duration(2000 + Math.random() * 800)
                .ease(d3.easeLinear)
                .attrTween('cx', function () {
                  return function (t) { return pathNode.getPointAtLength(t * len).x; };
                })
                .attrTween('cy', function () {
                  return function (t) { return pathNode.getPointAtLength(t * len).y; };
                })
                .transition()
                .duration(200)
                .attr('opacity', 0)
                .on('end', loop);
            }
            loop();
          })(p);
        }
      });
    }

    // Draw nodes
    nodes.forEach(function (n) {
      var g = svg.append('g')
        .attr('transform', 'translate(' + (n.x - nodeW / 2) + ',' + n.y + ')')
        .style('cursor', 'pointer');

      g.append('rect')
        .attr('width', nodeW)
        .attr('height', nodeH)
        .attr('rx', 4)
        .attr('fill', C.card)
        .attr('stroke', C.border)
        .attr('stroke-width', 1)
        .on('mouseover', function () { d3.select(this).attr('stroke', C.green); })
        .on('mouseout', function () { d3.select(this).attr('stroke', C.border); });

      g.append('text')
        .attr('x', nodeW / 2)
        .attr('y', 18)
        .attr('text-anchor', 'middle')
        .attr('fill', C.bright)
        .style('font-family', FONT)
        .style('font-size', '11px')
        .style('font-weight', '400')
        .text(n.name);

      g.append('text')
        .attr('x', nodeW / 2)
        .attr('y', 34)
        .attr('text-anchor', 'middle')
        .attr('fill', C.dim)
        .style('font-family', FONT)
        .style('font-size', '9px')
        .style('font-weight', '300')
        .text(n.subtitle);

      // Click handler
      g.on('click', function () {
        var desc = nodeDescriptions[n.name];
        if (desc) {
          descPanel.innerHTML = '<strong style="color:' + C.bright + '">' + n.name + '</strong> — ' + desc;
          descPanel.style.opacity = '1';
        }
      });
    });

    animateParticles();
  }

  // ════════════════════════════════════════════════════════════════════════════
  //  2. ATTENTION HEATMAP
  // ════════════════════════════════════════════════════════════════════════════

  function renderAttentionHeatmap(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    var sectors = ['XLF', 'XLK', 'XLE', 'XLV', 'XLI', 'XLB', 'XLC', 'XLU'];
    var names = ['Financials', 'Technology', 'Energy', 'Healthcare', 'Industrials', 'Materials', 'Communication', 'Utilities'];

    // Synthetic attention matrix (symmetric, plausible correlations)
    var matrix = [
    //  XLF  XLK  XLE  XLV  XLI  XLB  XLC  XLU
      [1.00,0.70,0.35,0.30,0.65,0.40,0.55,0.25], // XLF
      [0.70,1.00,0.28,0.35,0.55,0.30,0.75,0.20], // XLK
      [0.35,0.28,1.00,0.22,0.45,0.80,0.25,0.30], // XLE
      [0.30,0.35,0.22,1.00,0.30,0.25,0.32,0.60], // XLV
      [0.65,0.55,0.45,0.30,1.00,0.55,0.42,0.28], // XLI
      [0.40,0.30,0.80,0.25,0.55,1.00,0.28,0.25], // XLB
      [0.55,0.75,0.25,0.32,0.42,0.28,1.00,0.22], // XLC
      [0.25,0.20,0.30,0.60,0.28,0.25,0.22,1.00], // XLU
    ];

    var n = sectors.length;
    var maxSize = Math.min(container.clientWidth, 500);
    var margin = { top: 60, right: 20, bottom: 20, left: 80 };
    var gridSize = (maxSize - margin.left - margin.right) / n;
    var width = margin.left + margin.right + n * gridSize;
    var height = margin.top + margin.bottom + n * gridSize;

    // Tooltip
    var tooltip = document.createElement('div');
    tooltip.className = 'd3-tooltip';
    tooltip.style.cssText =
      'position:absolute;pointer-events:none;opacity:0;padding:6px 10px;' +
      'background:#1a1c14;border:1px solid #3a3c2a;border-radius:4px;' +
      'font-family:' + FONT + ';font-size:12px;color:' + C.bright + ';' +
      'white-space:nowrap;z-index:10;transition:opacity .15s;';
    container.style.position = 'relative';
    container.appendChild(tooltip);

    var colorScale = d3.scaleSequential()
      .domain([0, 1])
      .interpolator(d3.interpolateRgb(C.card, C.greenBr));

    var svg = d3.select(container)
      .insert('svg', ':first-child')
      .attr('viewBox', '0 0 ' + width + ' ' + height)
      .attr('width', width)
      .attr('height', height)
      .style('display', 'block')
      .style('margin', '0 auto');

    var g = svg.append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // Column labels
    sectors.forEach(function (s, i) {
      svg.append('text')
        .attr('x', margin.left + i * gridSize + gridSize / 2)
        .attr('y', margin.top - 8)
        .attr('text-anchor', 'middle')
        .attr('fill', C.dim)
        .style('font-family', FONT)
        .style('font-size', '10px')
        .text(s);
      svg.append('text')
        .attr('x', margin.left + i * gridSize + gridSize / 2)
        .attr('y', margin.top - 22)
        .attr('text-anchor', 'middle')
        .attr('fill', C.dim)
        .style('font-family', FONT)
        .style('font-size', '8px')
        .style('opacity', 0.6)
        .text(names[i]);
    });

    // Row labels
    sectors.forEach(function (s, i) {
      svg.append('text')
        .attr('x', margin.left - 10)
        .attr('y', margin.top + i * gridSize + gridSize / 2 + 4)
        .attr('text-anchor', 'end')
        .attr('fill', C.dim)
        .style('font-family', FONT)
        .style('font-size', '10px')
        .text(s);
    });

    // Cells
    for (var row = 0; row < n; row++) {
      for (var col = 0; col < n; col++) {
        (function (r, c) {
          var val = matrix[r][c];
          g.append('rect')
            .attr('x', c * gridSize)
            .attr('y', r * gridSize)
            .attr('width', gridSize - 1)
            .attr('height', gridSize - 1)
            .attr('fill', colorScale(val))
            .attr('rx', 2)
            .style('cursor', 'pointer')
            .on('mouseover', function (event) {
              tooltip.innerHTML = '<strong>' + names[r] + '</strong> &harr; <strong>' + names[c] + '</strong>: ' + val.toFixed(2);
              tooltip.style.opacity = '1';
            })
            .on('mousemove', function (event) {
              var rect = container.getBoundingClientRect();
              tooltip.style.left = (event.clientX - rect.left + 12) + 'px';
              tooltip.style.top = (event.clientY - rect.top - 28) + 'px';
            })
            .on('mouseout', function () {
              tooltip.style.opacity = '0';
            });

          // Show value in cell if gridSize is large enough
          if (gridSize > 40) {
            g.append('text')
              .attr('x', c * gridSize + gridSize / 2 - 0.5)
              .attr('y', r * gridSize + gridSize / 2 + 3)
              .attr('text-anchor', 'middle')
              .attr('fill', val > 0.55 ? C.bg : C.dim)
              .style('font-family', FONT)
              .style('font-size', '9px')
              .style('pointer-events', 'none')
              .text(val.toFixed(2));
          }
        })(row, col);
      }
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  //  3. REWARD SHAPING EXPLORER
  // ════════════════════════════════════════════════════════════════════════════

  function renderRewardExplorer(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    // Find the chart area (separate from sliders)
    var chartEl = document.getElementById('reward-chart');
    if (!chartEl) return;
    chartEl.innerHTML = '';

    var behaviorEl = document.getElementById('reward-behavior');
    var sliderReturn = document.getElementById('slider-return');
    var sliderDrawdown = document.getElementById('slider-drawdown');
    var sliderTurnover = document.getElementById('slider-turnover');
    var valReturn = document.getElementById('val-return');
    var valDrawdown = document.getElementById('val-drawdown');
    var valTurnover = document.getElementById('val-turnover');

    if (!sliderReturn || !sliderDrawdown || !sliderTurnover) return;

    var width = chartEl.clientWidth;
    var height = 240;
    var margin = { top: 16, right: 60, bottom: 16, left: 130 };
    var plotW = width - margin.left - margin.right;
    var plotH = height - margin.top - margin.bottom;

    var metrics = ['Annual Return', 'Max Drawdown', 'Annual Turnover', 'Sharpe Ratio'];
    var maxVals = [30, 40, 6, 2.5];
    var units = ['%', '%', 'x', ''];

    var yScale = d3.scaleBand()
      .domain(metrics)
      .range([0, plotH])
      .padding(0.3);

    var xScale = d3.scaleLinear()
      .domain([0, 1])
      .range([0, plotW]);

    var svg = d3.select(chartEl)
      .append('svg')
      .attr('viewBox', '0 0 ' + width + ' ' + height)
      .attr('width', width)
      .attr('height', height)
      .style('display', 'block');

    var g = svg.append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // Y labels
    g.selectAll('.metric-label')
      .data(metrics)
      .join('text')
      .attr('class', 'metric-label')
      .attr('x', -10)
      .attr('y', function (d) { return yScale(d) + yScale.bandwidth() / 2 + 4; })
      .attr('text-anchor', 'end')
      .attr('fill', C.dim)
      .style('font-family', FONT)
      .style('font-size', '11px')
      .text(function (d) { return d; });

    // Bars
    var bars = g.selectAll('.reward-bar')
      .data(metrics)
      .join('rect')
      .attr('class', 'reward-bar')
      .attr('x', 0)
      .attr('y', function (d) { return yScale(d); })
      .attr('width', 0)
      .attr('height', yScale.bandwidth())
      .attr('fill', C.green)
      .attr('rx', 2);

    // Value labels
    var valLabels = g.selectAll('.reward-val')
      .data(metrics)
      .join('text')
      .attr('class', 'reward-val')
      .attr('y', function (d) { return yScale(d) + yScale.bandwidth() / 2 + 4; })
      .attr('fill', C.bright)
      .style('font-family', FONT)
      .style('font-size', '11px')
      .style('font-variant-numeric', 'tabular-nums');

    function compute(rw, dw, tw) {
      var ret = 12 + 8 * rw - 3 * dw - 2 * tw;
      var dd = 25 - 8 * dw + 5 * rw;
      var to = 3.0 - 1.2 * tw + 0.5 * rw;
      var sharpe = ret / (15 + 5 * rw - 3 * dw);

      ret = Math.max(2, Math.min(30, ret));
      dd = Math.max(5, Math.min(40, dd));
      to = Math.max(0.5, Math.min(6, to));
      sharpe = Math.max(0.1, Math.min(2.5, sharpe));

      return [ret, dd, to, sharpe];
    }

    function getBehavior(rw, dw, tw) {
      if (rw > 1.3 && dw < 0.7) return 'Aggressive growth-seeking behavior';
      if (dw > 1.3) return 'Conservative, drawdown-averse allocation';
      if (tw > 1.3) return 'Low-frequency rebalancing, buy-and-hold tendency';
      return 'Balanced risk-return optimization';
    }

    function update() {
      var rw = parseFloat(sliderReturn.value);
      var dw = parseFloat(sliderDrawdown.value);
      var tw = parseFloat(sliderTurnover.value);

      if (valReturn) valReturn.textContent = rw.toFixed(1);
      if (valDrawdown) valDrawdown.textContent = dw.toFixed(1);
      if (valTurnover) valTurnover.textContent = tw.toFixed(1);

      var vals = compute(rw, dw, tw);
      var normalized = vals.map(function (v, i) { return v / maxVals[i]; });

      bars.data(normalized)
        .transition().duration(400)
        .attr('width', function (d) { return xScale(d); });

      valLabels.data(vals)
        .transition().duration(400)
        .attrTween('x', function (d, i) {
          var norm = d / maxVals[i];
          return function () { return xScale(norm) + 8; };
        })
        .textTween(function (d, i) {
          var prev = parseFloat(this.textContent) || 0;
          var interp = d3.interpolateNumber(prev, d);
          var u = units[i];
          return function (t) {
            return interp(t).toFixed(1) + u;
          };
        });

      if (behaviorEl) behaviorEl.textContent = getBehavior(rw, dw, tw);
    }

    sliderReturn.addEventListener('input', update);
    sliderDrawdown.addEventListener('input', update);
    sliderTurnover.addEventListener('input', update);

    update();
  }

  // ════════════════════════════════════════════════════════════════════════════
  //  4. MARKET REGIME TIMELINE
  // ════════════════════════════════════════════════════════════════════════════

  function renderRegimeTimeline(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    var width = container.clientWidth;
    var height = 350;
    var margin = { top: 40, right: 30, bottom: 36, left: 60 };
    var plotW = width - margin.left - margin.right;
    var plotH = height - margin.top - margin.bottom;

    // S&P 500 monthly closes (approximate, public data)
    var rawData = [
      // 2020
      3230,2954,2585,2912,3044,3100,3271,3500,3363,3270,3622,3756,
      // 2021
      3714,3811,3973,4181,4204,4297,4395,4523,4307,4605,4567,4766,
      // 2022
      4516,4374,4530,4132,4132,3785,4130,3955,3586,3872,4080,3840,
      // 2023
      4076,3970,4109,4169,4180,4450,4589,4508,4288,4194,4568,4770,
      // 2024
      4846,5079,5254,5036,5277,5460,5522,5648,5762,5705,6032,5882,
      // 2025
      6040,5954,5612,5525,5631,5950,6100,6200,6050,5900,6100,6250,
    ];

    var data = rawData.map(function (v, i) {
      var year = 2020 + Math.floor(i / 12);
      var month = i % 12;
      return { date: new Date(year, month, 1), value: v, index: i };
    });

    // Regime bands: { start (month index), end, label, color }
    var regimes = [
      { start: 0,  end: 3,  label: 'High Volatility', color: C.redBg },
      { start: 3,  end: 24, label: 'Expansion',        color: C.greenBg },
      { start: 24, end: 34, label: 'Contraction',      color: C.redBg },
      { start: 34, end: 42, label: 'Recovery',          color: C.amberBg },
      { start: 42, end: 72, label: 'Expansion',         color: C.greenBg },
    ];

    // Annotations
    var annotations = [
      { index: 2,  label: 'COVID crash',       anchor: 'start' },
      { index: 26, label: 'Rate hikes begin',  anchor: 'middle' },
      { index: 36, label: 'Recovery',           anchor: 'middle' },
    ];

    var xScale = d3.scaleTime()
      .domain([data[0].date, data[data.length - 1].date])
      .range([0, plotW]);

    var yScale = d3.scaleLinear()
      .domain([2200, 6500])
      .range([plotH, 0]);

    var svg = d3.select(container)
      .append('svg')
      .attr('viewBox', '0 0 ' + width + ' ' + height)
      .attr('width', width)
      .attr('height', height)
      .style('display', 'block');

    var g = svg.append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // Regime overlays
    regimes.forEach(function (r) {
      var x0 = xScale(data[r.start].date);
      var x1 = xScale(data[Math.min(r.end, data.length - 1)].date);
      g.append('rect')
        .attr('x', x0)
        .attr('y', 0)
        .attr('width', x1 - x0)
        .attr('height', plotH)
        .attr('fill', r.color)
        .attr('opacity', 0)
        .transition()
        .delay(300)
        .duration(800)
        .attr('opacity', 1);

      g.append('text')
        .attr('x', (x0 + x1) / 2)
        .attr('y', 14)
        .attr('text-anchor', 'middle')
        .attr('fill', C.dim)
        .style('font-family', FONT)
        .style('font-size', '9px')
        .style('letter-spacing', '0.08em')
        .style('opacity', 0.7)
        .text(r.label);
    });

    // X axis
    g.append('g')
      .attr('transform', 'translate(0,' + plotH + ')')
      .call(
        d3.axisBottom(xScale)
          .ticks(d3.timeYear.every(1))
          .tickFormat(d3.timeFormat('%Y'))
      )
      .call(function (gAxis) {
        gAxis.select('.domain').attr('stroke', C.dim);
        gAxis.selectAll('.tick line').attr('stroke', C.dim).attr('opacity', 0.3);
        gAxis.selectAll('.tick text').attr('fill', C.dim).style('font-family', FONT).style('font-size', '11px');
      });

    // Y axis
    g.append('g')
      .call(
        d3.axisLeft(yScale)
          .ticks(5)
          .tickFormat(function (d) { return d3.format(',')(d); })
      )
      .call(function (gAxis) {
        gAxis.select('.domain').attr('stroke', C.dim);
        gAxis.selectAll('.tick line').attr('stroke', C.dim).attr('opacity', 0.3);
        gAxis.selectAll('.tick text').attr('fill', C.dim).style('font-family', FONT).style('font-size', '11px');
      });

    // Grid lines
    [3000, 4000, 5000, 6000].forEach(function (v) {
      g.append('line')
        .attr('x1', 0).attr('x2', plotW)
        .attr('y1', yScale(v)).attr('y2', yScale(v))
        .attr('stroke', C.dim).attr('stroke-opacity', 0.1)
        .attr('stroke-dasharray', '3,4');
    });

    // S&P line
    var lineGen = d3.line()
      .x(function (d) { return xScale(d.date); })
      .y(function (d) { return yScale(d.value); })
      .curve(d3.curveMonotoneX);

    var linePath = g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', C.greenBr)
      .attr('stroke-width', 2)
      .attr('d', lineGen);

    // Animate line draw
    var totalLen = linePath.node().getTotalLength();
    linePath
      .attr('stroke-dasharray', totalLen)
      .attr('stroke-dashoffset', totalLen)
      .transition()
      .duration(2500)
      .ease(d3.easeLinear)
      .attr('stroke-dashoffset', 0);

    // Annotations
    annotations.forEach(function (a) {
      var d = data[a.index];
      var x = xScale(d.date);
      var y = yScale(d.value);

      g.append('line')
        .attr('x1', x).attr('x2', x)
        .attr('y1', y - 8).attr('y2', y - 30)
        .attr('stroke', C.dim)
        .attr('stroke-width', 1)
        .attr('opacity', 0)
        .transition()
        .delay(2500 * (a.index / data.length) + 300)
        .duration(400)
        .attr('opacity', 0.6);

      g.append('text')
        .attr('x', x)
        .attr('y', y - 34)
        .attr('text-anchor', a.anchor || 'middle')
        .attr('fill', C.text)
        .style('font-family', FONT)
        .style('font-size', '10px')
        .style('font-weight', '300')
        .attr('opacity', 0)
        .text(a.label)
        .transition()
        .delay(2500 * (a.index / data.length) + 400)
        .duration(400)
        .attr('opacity', 1);
    });
  }

  // ════════════════════════════════════════════════════════════════════════════
  //  SCROLL-TRIGGERED RENDERING & INIT
  // ════════════════════════════════════════════════════════════════════════════

  var vizMap = {
    'architecture-viz': renderArchitectureFlow,
    'attention-viz':    renderAttentionHeatmap,
    'reward-viz':       renderRewardExplorer,
    'regime-viz':       renderRegimeTimeline,
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
    }, { threshold: 0.2 });

    Object.keys(vizMap).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) observer.observe(el);
    });
  }

  document.addEventListener('DOMContentLoaded', initVisualizations);

})();
