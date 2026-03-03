// Quorum — D3.js visualizations
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
    tan:     '#b49a6e',
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
    'Stock Screener':     'Nine independent ML architectures (gradient boosting, deep neural networks, and attention models) each rank the universe. Their combined signal selects top candidates.',
    'RL Allocator':       'PPO agent with Transformer policy network. Multi-seed ensemble with cross-asset self-attention. Trained with Sharpe-weighted aggregation across policy seeds.',
    'LLM Analysis':       'LLM agents analyze the proposed allocation, surfacing relevant news, macro risks, sector concentration concerns, and specific recommendations for the human reviewer.',
    'Human Review':       'A human reviews the LLM analysis and proposed portfolio. Approves the trade, requests modifications, or vetoes positions. The human always has final say.',
    'LLM Execution':      'Converts approved allocations into executable broker orders, applies final guardrails, and sends orders through the broker API.',
    'Portfolio':          'Final holdings state plus the auditable decision journal. Captures fills, rationale, and persistent memory for future sessions.',
  };

  function renderArchitectureFlow(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    var width = container.clientWidth;
    var isMobile = width < 700;
    var height = isMobile ? 540 : 450;

    // Node definitions: { name, subtitle, col, row }
    var columns = [
      { label: 'DATA SOURCES', x: 0.08 },
      { label: 'PROCESSING',   x: 0.28 },
      { label: 'MODELS',       x: 0.48 },
      { label: 'REVIEW',       x: 0.70 },
      { label: 'OUTPUT',       x: 0.92 },
    ];

    var stageRows = [
      { label: 'DATA SOURCES', row: 0 },
      { label: 'PROCESSING',   row: 2 },
      { label: 'MODELS',       row: 3 },
      { label: 'REVIEW',       row: 4 },
      { label: 'OUTPUT',       row: 5 },
    ];

    var nodes = [
      { name: 'FRED',                subtitle: 'Macro indicators',            col: 0, row: 0 },
      { name: 'SEC EDGAR',           subtitle: 'Filings & insider',           col: 0, row: 1 },
      { name: 'News',                subtitle: 'Sentiment analysis',          col: 0, row: 2 },
      { name: 'Market',              subtitle: 'Price & volume',              col: 0, row: 3 },
      { name: 'Feature Engineering', subtitle: '15 specialized modules',      col: 1, row: 0.75 },
      { name: 'Regime Detection',    subtitle: 'Market state classification', col: 1, row: 2.75 },
      { name: 'Stock Screener',      subtitle: '9-model ensemble',            col: 2, row: 0.75 },
      { name: 'RL Allocator',        subtitle: '8-seed PPO + Transformer',    col: 2, row: 2.75 },
      { name: 'LLM Analysis',        subtitle: 'News, risks, factors',        col: 3, row: 0.75 },
      { name: 'Human Review',        subtitle: 'Approve or modify',           col: 3, row: 2.75 },
      { name: 'LLM Execution',       subtitle: 'Broker API + guardrails',     col: 4, row: 2.75 },
      { name: 'Portfolio',           subtitle: 'Positions & journal',         col: 4, row: 3.95 },
    ];

    var nodeW = isMobile ? Math.max(110, Math.min(132, width * 0.4)) : 130;
    var nodeH = isMobile ? 44 : 48;
    var topPad = isMobile ? 56 : 60;
    var rowGap = isMobile ? 76 : 80;

    if (isMobile) {
      var leftX = width * 0.30;
      var rightX = width * 0.70;
      var mobileLayout = {
        'FRED':                { row: 0, lane: 0 },
        'SEC EDGAR':           { row: 0, lane: 1 },
        'News':                { row: 1, lane: 0 },
        'Market':              { row: 1, lane: 1 },
        'Feature Engineering': { row: 2, lane: 0 },
        'Regime Detection':    { row: 2, lane: 1 },
        'Stock Screener':      { row: 3, lane: 0 },
        'RL Allocator':        { row: 3, lane: 1 },
        'LLM Analysis':        { row: 4, lane: 0 },
        'Human Review':        { row: 4, lane: 1 },
        'LLM Execution':       { row: 5, lane: 0 },
        'Portfolio':           { row: 5, lane: 1 },
      };

      nodes.forEach(function (n) {
        var layout = mobileLayout[n.name];
        n.x = layout.lane === 0 ? leftX : rightX;
        n.y = topPad + layout.row * rowGap;
      });
      height = topPad + rowGap * 5 + nodeH + 28;
    } else {
      nodes.forEach(function (n) {
        n.x = columns[n.col].x * width;
        n.y = topPad + n.row * rowGap;
      });
    }

    var edges = [
      ['FRED',                'Feature Engineering'],
      ['SEC EDGAR',           'Feature Engineering'],
      ['News',                'Feature Engineering'],
      ['Market',              'Feature Engineering'],
      ['Feature Engineering', 'Regime Detection'],
      ['Feature Engineering', 'Stock Screener'],
      ['Regime Detection',    'RL Allocator'],
      ['Stock Screener',      'RL Allocator'],
      ['Stock Screener',      'LLM Analysis'],
      ['RL Allocator',        'LLM Analysis'],
      ['LLM Analysis',        'Human Review'],
      ['Human Review',        'LLM Execution'],
      ['LLM Execution',       'Portfolio'],
    ];

    function findNode(name) {
      for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].name === name) return nodes[i];
      }
      return null;
    }

    function wrapWords(text, maxChars, maxLines) {
      var words = text.split(' ');
      var lines = [];
      var line = '';

      words.forEach(function (word) {
        var candidate = line ? line + ' ' + word : word;
        if (candidate.length <= maxChars) {
          line = candidate;
        } else {
          if (line) lines.push(line);
          line = word;
        }
      });

      if (line) lines.push(line);

      if (lines.length > maxLines) {
        var clipped = lines.slice(maxLines - 1).join(' ');
        clipped = clipped.slice(0, Math.max(0, maxChars - 3)) + '...';
        lines = lines.slice(0, maxLines - 1);
        lines.push(clipped);
      }
      return lines;
    }

    // Tooltip & description
    var descPanel = document.createElement('div');
    descPanel.style.cssText =
      'max-width:700px;margin:1rem auto 0;padding:0.75rem 1rem;font-family:' + FONT +
      ';font-size:' + (isMobile ? '0.72rem' : '0.78rem') + ';color:' + C.text +
      ';line-height:1.6;border-left:2px solid ' + C.green +
      ';opacity:0;transition:opacity 0.3s;font-weight:300;';
    container.appendChild(descPanel);

    var svg = d3.select(container)
      .insert('svg', ':first-child')
      .attr('viewBox', '0 0 ' + width + ' ' + height)
      .attr('width', width)
      .attr('height', height)
      .style('display', 'block');

    // Stage headers
    if (isMobile) {
      stageRows.forEach(function (stage) {
        svg.append('text')
          .attr('x', width / 2)
          .attr('y', topPad + stage.row * rowGap - 14)
          .attr('text-anchor', 'middle')
          .attr('fill', C.dim)
          .style('font-family', FONT)
          .style('font-size', '8px')
          .style('letter-spacing', '0.12em')
          .text(stage.label);
      });
    } else {
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
    }

    // Draw edges
    var edgePaths = [];
    edges.forEach(function (e) {
      var src = findNode(e[0]);
      var tgt = findNode(e[1]);
      if (!src || !tgt) return;

      var pathD;
      if (isMobile) {
        var sxM = src.x;
        var syM = src.y + nodeH / 2;
        var txM = tgt.x;
        var tyM = tgt.y + nodeH / 2;
        var dx = txM - sxM;
        var dy = tyM - syM;

        if (Math.abs(dx) > Math.abs(dy)) {
          sxM += dx > 0 ? nodeW / 2 : -nodeW / 2;
          txM += dx > 0 ? -nodeW / 2 : nodeW / 2;
        } else {
          syM += dy >= 0 ? nodeH / 2 : -nodeH / 2;
          tyM += dy >= 0 ? -nodeH / 2 : nodeH / 2;
        }

        var mxM = (sxM + txM) / 2;
        pathD = 'M' + sxM + ',' + syM + ' C' + mxM + ',' + syM + ' ' + mxM + ',' + tyM + ' ' + txM + ',' + tyM;
      } else if (src.col === tgt.col) {
        // Vertical handoff within the same stage.
        var sxV = src.x;
        var syV = src.y + nodeH;
        var txV = tgt.x;
        var tyV = tgt.y;
        var myV = (syV + tyV) / 2;
        pathD = 'M' + sxV + ',' + syV + ' C' + sxV + ',' + myV + ' ' + txV + ',' + myV + ' ' + txV + ',' + tyV;
      } else {
        var sx = src.x + nodeW / 2;
        var sy = src.y + nodeH / 2;
        var tx = tgt.x - nodeW / 2;
        var ty = tgt.y + nodeH / 2;
        var mx = (sx + tx) / 2;
        pathD = 'M' + sx + ',' + sy + ' C' + mx + ',' + sy + ' ' + mx + ',' + ty + ' ' + tx + ',' + ty;
      }

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
          (function (pIdx) {
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

      if (isMobile) {
        var nameLines = wrapWords(n.name, 14, 2);
        var lineHeight = 11;
        var startY = nodeH / 2 - ((nameLines.length - 1) * lineHeight) / 2 + 3;

        nameLines.forEach(function (line, idx) {
          g.append('text')
            .attr('x', nodeW / 2)
            .attr('y', startY + idx * lineHeight)
            .attr('text-anchor', 'middle')
            .attr('fill', C.bright)
            .style('font-family', FONT)
            .style('font-size', '9.5px')
            .style('font-weight', '400')
            .text(line);
        });
      } else {
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
      }

      // Click handler
      g.on('click', function () {
        var desc = nodeDescriptions[n.name];
        if (desc) {
          descPanel.innerHTML = '<strong style="color:' + C.bright + '">' + n.name + '</strong> - ' + desc;
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
  //  5. ENSEMBLE MODEL DIVERSITY
  // ════════════════════════════════════════════════════════════════════════════

  function renderEnsembleViz(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    var width = container.clientWidth;
    var isMobile = width < 560;
    var height = 500;

    // Ensure container doesn't clip the SVG
    container.style.overflow = 'visible';
    container.style.minHeight = height + 'px';

    var models = [
      { name: 'LightGBM',       cat: 'tree' },
      { name: 'XGBoost',        cat: 'tree' },
      { name: 'CatBoost',       cat: 'tree' },
      { name: 'MLP',            cat: 'neural' },
      { name: 'TabNet',         cat: 'neural' },
      { name: 'NODE',           cat: 'neural' },
      { name: 'FT-Transformer', cat: 'attention' },
      { name: 'SAINT',          cat: 'attention' },
      { name: 'ElasticNet',     cat: 'linear' },
    ];

    var catColors = { tree: C.green, neural: C.tan, attention: C.greenBr, linear: C.dim };
    var catLabels = { tree: 'TREE', neural: 'NEURAL', attention: 'ATTENTION', linear: 'LINEAR' };

    var cx = width / 2, cy = height / 2 - 20;
    var R = Math.min(width * (isMobile ? 0.34 : 0.38), isMobile ? 140 : 175);
    var centerR = isMobile ? 32 : 36;
    var nodeR = isMobile ? 28 : 32;

    models.forEach(function (m, i) {
      var a = (i / models.length) * Math.PI * 2 - Math.PI / 2;
      m.x = cx + R * Math.cos(a);
      m.y = cy + R * Math.sin(a);
    });

    var svg = d3.select(container).append('svg')
      .attr('viewBox', '0 0 ' + width + ' ' + height)
      .attr('width', width).attr('height', height)
      .style('display', 'block')
      .style('overflow', 'visible');

    // Spokes (drawn first, behind everything)
    models.forEach(function (m) {
      svg.append('line')
        .attr('x1', m.x).attr('y1', m.y)
        .attr('x2', cx).attr('y2', cy)
        .attr('stroke', C.border).attr('stroke-width', 1);
    });

    // Center ensemble node
    svg.append('circle').attr('cx', cx).attr('cy', cy).attr('r', centerR)
      .attr('fill', C.card).attr('stroke', C.green).attr('stroke-width', 2);
    svg.append('text').attr('x', cx).attr('y', cy - 4).attr('text-anchor', 'middle')
      .attr('fill', C.bright).style('font-family', FONT).style('font-size', '10px')
      .style('font-weight', '400').text('Ensemble');
    svg.append('text').attr('x', cx).attr('y', cy + 10).attr('text-anchor', 'middle')
      .attr('fill', C.dim).style('font-family', FONT).style('font-size', '8px')
      .text('Combined signal');

    // Outer model nodes — draw ALL circles and labels into a top-level group
    var nodesGroup = svg.append('g').attr('class', 'model-nodes');
    models.forEach(function (m) {
      var g = nodesGroup.append('g');
      g.append('circle').attr('cx', m.x).attr('cy', m.y).attr('r', nodeR)
        .attr('fill', C.card).attr('stroke', catColors[m.cat]).attr('stroke-width', 2);
      g.append('text').attr('x', m.x).attr('y', m.y - 3).attr('text-anchor', 'middle')
        .attr('fill', C.bright).style('font-family', FONT).style('font-size', '8.5px')
        .style('font-weight', '400').text(m.name);
      g.append('text').attr('x', m.x).attr('y', m.y + 9).attr('text-anchor', 'middle')
        .attr('fill', catColors[m.cat]).style('font-family', FONT).style('font-size', '6.5px')
        .style('letter-spacing', '0.1em').text(catLabels[m.cat]);
    });

    // Pulse animation — drawn AFTER static nodes so particles appear on top
    models.forEach(function (m, i) {
      function pulse() {
        svg.append('circle')
          .attr('cx', m.x).attr('cy', m.y)
          .attr('r', 3).attr('fill', catColors[m.cat]).attr('opacity', 0)
          .transition().delay(i * 180).attr('opacity', 0.8)
          .transition().duration(1800).ease(d3.easeLinear)
          .attr('cx', cx).attr('cy', cy)
          .transition().duration(150).attr('opacity', 0).remove()
          .on('end', function () { setTimeout(pulse, 800 + Math.random() * 2000); });
      }
      setTimeout(pulse, i * 350);
    });

    // Legend
    var cats = [['tree', 'Tree Ensemble'], ['neural', 'Deep Neural'], ['attention', 'Attention'], ['linear', 'Linear']];
    var legendStartX = isMobile ? cx - 90 : cx - 170;
    var legendStartY = isMobile ? height - 36 : height - 22;
    var legendXGap = isMobile ? 110 : 95;
    var legendYGap = isMobile ? 14 : 0;
    cats.forEach(function (c, i) {
      var col = isMobile ? i % 2 : i;
      var row = isMobile ? Math.floor(i / 2) : 0;
      var lx = legendStartX + col * legendXGap;
      var ly = legendStartY + row * legendYGap;
      svg.append('circle').attr('cx', lx).attr('cy', ly).attr('r', 4).attr('fill', catColors[c[0]]);
      svg.append('text').attr('x', lx + 10).attr('y', ly + 3)
        .attr('fill', C.dim).style('font-family', FONT).style('font-size', '9px').text(c[1]);
    });
  }

  // ════════════════════════════════════════════════════════════════════════════
  //  6. MULTI-LLM CONSULTATION FLOW
  // ════════════════════════════════════════════════════════════════════════════

  function renderConsultationViz(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    var width = container.clientWidth;
    var isMobile = width < 640;
    var height = 340;

    var nodes = [
      { id: 'agent',   label: 'Portfolio Agent', sub: 'Orchestrator',      x: 0.5,  y: 0.15, accent: C.green },
      { id: 'llm1',    label: 'LLM Analyst',     sub: 'Risk & Macro lens',  x: isMobile ? 0.27 : 0.15, y: 0.52, accent: C.tan },
      { id: 'llm2',    label: 'LLM Analyst',     sub: 'Fundamentals lens',  x: isMobile ? 0.73 : 0.85, y: 0.52, accent: C.tan },
      { id: 'journal', label: 'Decision Journal', sub: 'Persistent memory', x: 0.5,  y: 0.88, accent: C.dim },
    ];

    nodes.forEach(function (n) { n.px = n.x * width; n.py = n.y * height; });

    var svg = d3.select(container).append('svg')
      .attr('viewBox', '0 0 ' + width + ' ' + height)
      .attr('width', width).attr('height', height)
      .style('display', 'block');

    // Dashed connections
    [['agent', 'llm1'], ['agent', 'llm2'], ['agent', 'journal']].forEach(function (pair) {
      var a = nodes.find(function (n) { return n.id === pair[0]; });
      var b = nodes.find(function (n) { return n.id === pair[1]; });
      svg.append('line')
        .attr('x1', a.px).attr('y1', a.py).attr('x2', b.px).attr('y2', b.py)
        .attr('stroke', C.border).attr('stroke-width', 1).attr('stroke-dasharray', '4,4');
    });

    // Phase labels
    [
      { x: 0.5, y: 0.34, text: '1. PROPOSE ALLOCATION' },
      { x: 0.5, y: 0.52, text: '2. ANALYZE & RESPOND' },
      { x: 0.5, y: 0.69, text: '3. LOG DECISION' },
    ].forEach(function (p) {
      svg.append('text').attr('x', p.x * width).attr('y', p.y * height)
        .attr('text-anchor', 'middle').attr('fill', C.dim)
        .style('font-family', FONT).style('font-size', '8px')
        .style('letter-spacing', '0.12em').style('opacity', 0.4)
        .text(p.text);
    });

    // Message animation cycle
    function cycle() {
      // Phase 1: Agent sends proposals to analysts
      [nodes[1], nodes[2]].forEach(function (target, i) {
        svg.append('circle')
          .attr('cx', nodes[0].px).attr('cy', nodes[0].py)
          .attr('r', 5).attr('fill', C.greenBr).attr('opacity', 0)
          .transition().delay(i * 200).attr('opacity', 0.9)
          .transition().duration(1200).ease(d3.easeQuadInOut)
          .attr('cx', target.px).attr('cy', target.py)
          .transition().duration(200).attr('opacity', 0).remove();
      });
      // Phase 2: Analysts respond
      setTimeout(function () {
        [nodes[1], nodes[2]].forEach(function (src, i) {
          svg.append('circle')
            .attr('cx', src.px).attr('cy', src.py)
            .attr('r', 5).attr('fill', C.tan).attr('opacity', 0)
            .transition().delay(i * 250).attr('opacity', 0.9)
            .transition().duration(1200).ease(d3.easeQuadInOut)
            .attr('cx', nodes[0].px).attr('cy', nodes[0].py)
            .transition().duration(200).attr('opacity', 0).remove();
        });
      }, 2000);
      // Phase 3: Agent logs to journal
      setTimeout(function () {
        svg.append('circle')
          .attr('cx', nodes[0].px).attr('cy', nodes[0].py)
          .attr('r', 5).attr('fill', C.green).attr('opacity', 0)
          .transition().attr('opacity', 0.9)
          .transition().duration(1000).ease(d3.easeQuadInOut)
          .attr('cx', nodes[3].px).attr('cy', nodes[3].py)
          .transition().duration(200).attr('opacity', 0).remove();
      }, 4200);
      setTimeout(cycle, 6500);
    }

    // Draw node boxes (on top of lines)
    var nW = isMobile ? Math.max(108, Math.min(126, width * 0.38)) : 140;
    var nH = isMobile ? 42 : 44;
    nodes.forEach(function (n) {
      var g = svg.append('g')
        .attr('transform', 'translate(' + (n.px - nW / 2) + ',' + (n.py - nH / 2) + ')');
      g.append('rect').attr('width', nW).attr('height', nH).attr('rx', 4)
        .attr('fill', C.card).attr('stroke', n.accent)
        .attr('stroke-width', n.id === 'agent' ? 2 : 1);
      g.append('text').attr('x', nW / 2).attr('y', isMobile ? 16 : 17).attr('text-anchor', 'middle')
        .attr('fill', C.bright).style('font-family', FONT).style('font-size', isMobile ? '10px' : '11px')
        .style('font-weight', '400').text(n.label);
      g.append('text').attr('x', nW / 2).attr('y', isMobile ? 29 : 32).attr('text-anchor', 'middle')
        .attr('fill', C.dim).style('font-family', FONT).style('font-size', isMobile ? '8px' : '9px')
        .text(n.sub);
    });

    cycle();
  }

  // ════════════════════════════════════════════════════════════════════════════
  //  7. HIERARCHICAL MEMORY COMPRESSION
  // ════════════════════════════════════════════════════════════════════════════

  function renderMemoryViz(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    var width = container.clientWidth;
    var height = 420;
    var margin = { top: 24, right: 90, bottom: 20, left: 30 };
    var W = width - margin.left - margin.right;
    var H = height - margin.top - margin.bottom;

    var layers = [
      {
        label: 'DEPTH 0 \u2014 RAW OBSERVATIONS', count: 8, color: C.greenBr,
        sideNote: 'Full detail',
        texts: ['SPY +0.8%', 'VIX 14.2', 'Tech leads', 'Yields flat', 'AAPL beat', 'Fed minutes', 'Oil stable', 'Breadth +'],
      },
      {
        label: 'DEPTH 1 \u2014 DAILY SUMMARIES', count: 3, color: C.green,
        sideNote: 'Compressed',
        texts: ['Risk-on rally, tech + industrials', 'Vol compression, complacency', 'Rates priced for hold through Q2'],
      },
      {
        label: 'DEPTH 2 \u2014 WEEKLY THEMES', count: 1, color: C.olive || C.green,
        sideNote: 'Key themes',
        texts: ['Persistent low-vol uptrend; earnings positive; mid-cap rotation accelerating'],
      },
      {
        label: 'DEPTH 3 \u2014 STRATEGIC CONTEXT', count: 1, color: C.dim,
        sideNote: 'Strategic',
        texts: ['Bull market intact. Key risk: credit spread widening if soft landing breaks.'],
      },
    ];

    var rowH = H / 7;

    var svg = d3.select(container).append('svg')
      .attr('viewBox', '0 0 ' + width + ' ' + height)
      .attr('width', width).attr('height', height)
      .style('display', 'block');

    var g = svg.append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    layers.forEach(function (layer, li) {
      var y = li * rowH * 2;
      var gap = 6;
      var blockW = Math.min(100, (W - gap * (layer.count - 1)) / layer.count);

      if (layer.count === 1) blockW = Math.min(W * 0.7, 560);
      else if (layer.count === 3) blockW = Math.min((W - gap * 2) / 3, 220);

      var totalW = layer.count * blockW + (layer.count - 1) * gap;
      var startX = (W - totalW) / 2;
      var blockH = rowH - 4;

      // Layer label
      g.append('text').attr('x', W / 2).attr('y', y - 5)
        .attr('text-anchor', 'middle').attr('fill', C.dim)
        .style('font-family', FONT).style('font-size', '7.5px')
        .style('letter-spacing', '0.12em')
        .text(layer.label);

      // Side annotation
      g.append('text')
        .attr('x', W + 16).attr('y', y + blockH / 2 + 6)
        .attr('text-anchor', 'start').attr('fill', C.dim)
        .style('font-family', FONT).style('font-size', '8px')
        .style('font-style', 'italic').style('opacity', 0.5)
        .text(layer.sideNote);

      // Blocks with text
      for (var i = 0; i < layer.count; i++) {
        var bx = startX + i * (blockW + gap);

        g.append('rect')
          .attr('x', bx).attr('y', y + 2)
          .attr('width', blockW).attr('height', blockH)
          .attr('rx', 3)
          .attr('fill', C.card)
          .attr('stroke', layer.color)
          .attr('stroke-width', 1)
          .attr('opacity', 0)
          .transition().delay(li * 350 + i * 60).duration(500).attr('opacity', 1);

        // Text inside block
        if (layer.texts && layer.texts[i]) {
          var maxChars = Math.floor(blockW / 6.5);
          var txt = layer.texts[i];
          if (txt.length > maxChars) txt = txt.slice(0, maxChars - 1) + '\u2026';

          g.append('text')
            .attr('x', bx + blockW / 2).attr('y', y + blockH / 2 + 6)
            .attr('text-anchor', 'middle').attr('fill', C.text)
            .style('font-family', FONT).style('font-size', '9px')
            .style('pointer-events', 'none')
            .attr('opacity', 0)
            .text(txt)
            .transition().delay(li * 350 + i * 60 + 200).duration(400).attr('opacity', 0.8);
        }

        // Subtle shimmer on depth-0 blocks
        if (li === 0) {
          (function (idx) {
            var shimmer = g.append('rect')
              .attr('x', startX + idx * (blockW + gap))
              .attr('y', y + 2)
              .attr('width', blockW).attr('height', blockH)
              .attr('rx', 3)
              .attr('fill', layer.color)
              .attr('opacity', 0)
              .style('pointer-events', 'none');
            function blink() {
              shimmer.transition().delay(Math.random() * 4000)
                .duration(600).attr('opacity', 0.08)
                .transition().duration(600).attr('opacity', 0)
                .on('end', blink);
            }
            blink();
          })(i);
        }
      }

      // Compression arrow
      if (li < layers.length - 1) {
        var arrowY = y + rowH + 2;
        g.append('text')
          .attr('x', W / 2).attr('y', arrowY + rowH * 0.35)
          .attr('text-anchor', 'middle').attr('fill', C.dim)
          .style('font-family', FONT).style('font-size', '9px')
          .attr('opacity', 0)
          .text('\u25BC  LLM summarize')
          .transition().delay((li + 1) * 350).duration(400).attr('opacity', 0.35);
      }
    });
  }

  // ════════════════════════════════════════════════════════════════════════════
  //  SCROLL-TRIGGERED RENDERING & INIT
  // ════════════════════════════════════════════════════════════════════════════

  var vizMap = {
    'architecture-viz':  renderArchitectureFlow,
    'attention-viz':     renderAttentionHeatmap,
    'reward-viz':        renderRewardExplorer,
    'regime-viz':        renderRegimeTimeline,
    'ensemble-viz':      renderEnsembleViz,
    'consultation-viz':  renderConsultationViz,
    'memory-viz':        renderMemoryViz,
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

