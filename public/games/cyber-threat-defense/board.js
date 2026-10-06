/**
 * Cozy Cyber Village - Board Renderer & Illustrated SVG Snakes/Ladders
 * Renders the 100-tile boustrophedon network map with real illustrated cartoon snakes and rustic wooden ladders.
 */

class CozyBoard {
  constructor(boardContainerId, svgId, boardData) {
    this.boardEl = document.getElementById(boardContainerId);
    this.svgEl = document.getElementById(svgId);
    this.data = boardData;
    this.tileElements = new Map();
    this.defensesMap = new Map();
    this.threatsMap = new Map();

    (this.data.defenses || []).forEach(d => this.defensesMap.set(d.start, d));
    (this.data.threats || []).forEach(t => this.threatsMap.set(t.start, t));

    this.initBoard();
    this.setupResizeObserver();
  }

  initBoard() {
    this.boardEl.innerHTML = '';
    this.tileElements.clear();

    // 10 rows, bottom to top (row 0 to 9)
    for (let r = 9; r >= 0; r--) {
      const isEvenRow = (r % 2 === 0);
      const cols = [];
      if (isEvenRow) {
        for (let c = 1; c <= 10; c++) {
          cols.push(r * 10 + c);
        }
      } else {
        for (let c = 10; c >= 1; c--) {
          cols.push(r * 10 + c);
        }
      }

      cols.forEach((tileNum) => {
        const tile = this.createTileElement(tileNum, r);
        this.boardEl.appendChild(tile);
        this.tileElements.set(tileNum, tile);
      });
    }

    requestAnimationFrame(() => {
      this.renderConduits();
    });
  }

  createTileElement(num, rowIdx) {
    const tile = document.createElement('div');
    tile.className = 'board-tile';
    tile.dataset.tile = num;
    tile.id = `tile-${num}`;

    // Cozy checkered pattern: warm parchment vs soft ivory
    const colIdx = (num - 1) % 10;
    const isDark = (rowIdx + colIdx) % 2 === 1;
    if (isDark) tile.classList.add('tile-checkered');

    // Header with tile number
    const header = document.createElement('div');
    header.className = 'tile-header';

    const numSpan = document.createElement('span');
    numSpan.className = 'tile-number';
    numSpan.textContent = num;
    header.appendChild(numSpan);
    tile.appendChild(header);

    // Special Start (1) and Home (100)
    if (num === 1) {
      tile.classList.add('tile-start');
      const badge = document.createElement('div');
      badge.className = 'tile-badge start-badge';
      badge.innerHTML = '🚩 START';
      tile.appendChild(badge);
    } else if (num === 100) {
      tile.classList.add('tile-home');
      const badge = document.createElement('div');
      badge.className = 'tile-badge home-badge';
      badge.innerHTML = '🏰 FORTRESS';
      tile.appendChild(badge);
    }

    // Defense Tile (Ladder start)
    if (this.defensesMap.has(num)) {
      const def = this.defensesMap.get(num);
      tile.classList.add('tile-defense-start');
      tile.title = `${def.name} -> Climb to Tile ${def.end}`;

      const badge = document.createElement('div');
      badge.className = 'tile-badge defense-badge';
      badge.innerHTML = `🪜 ${def.name.split(' ')[0]} <span class="jump-tag">▲${def.end}</span>`;
      tile.appendChild(badge);

      tile.addEventListener('click', (e) => {
        e.stopPropagation();
        if (window.gameInstance && !window.gameInstance.isProcessing) {
          window.gameInstance.showLoreModal('defense', def);
        }
      });
    }

    // Threat Tile (Snake head)
    if (this.threatsMap.has(num)) {
      const thr = this.threatsMap.get(num);
      tile.classList.add('tile-threat-start');
      tile.title = `${thr.name} -> Slid down to Tile ${thr.end}`;

      const badge = document.createElement('div');
      badge.className = 'tile-badge threat-badge';
      badge.innerHTML = `🐍 ${thr.name.split(' ')[0]} <span class="jump-tag">▼${thr.end}</span>`;
      tile.appendChild(badge);

      tile.addEventListener('click', (e) => {
        e.stopPropagation();
        if (window.gameInstance && !window.gameInstance.isProcessing) {
          window.gameInstance.showLoreModal('threat', thr);
        }
      });
    }

    // Subtle destination indicators
    this.data.defenses.forEach(d => {
      if (d.end === num) {
        tile.classList.add('tile-defense-dest');
        const destTag = document.createElement('div');
        destTag.className = 'tile-subtag dest-defense-subtag';
        destTag.textContent = `▲ Top of ${d.start}`;
        tile.appendChild(destTag);
      }
    });

    this.data.threats.forEach(t => {
      if (t.end === num) {
        tile.classList.add('tile-threat-dest');
        const destTag = document.createElement('div');
        destTag.className = 'tile-subtag dest-threat-subtag';
        destTag.textContent = `▼ Tail of ${t.start}`;
        tile.appendChild(destTag);
      }
    });

    return tile;
  }

  setupResizeObserver() {
    if (window.ResizeObserver) {
      const ro = new ResizeObserver(() => {
        this.renderConduits();
        if (window.gameInstance) {
          window.gameInstance.updatePawnPositions();
        }
      });
      ro.observe(this.boardEl);
    } else {
      window.addEventListener('resize', () => {
        this.renderConduits();
        if (window.gameInstance) {
          window.gameInstance.updatePawnPositions();
        }
      });
    }
  }

  getTileCenter(tileNum) {
    const el = this.tileElements.get(tileNum);
    if (!el) return { x: 0, y: 0 };

    const boardRect = this.boardEl.getBoundingClientRect();
    const tileRect = el.getBoundingClientRect();

    return {
      x: (tileRect.left + tileRect.width / 2) - boardRect.left,
      y: (tileRect.top + tileRect.height / 2) - boardRect.top
    };
  }

  renderConduits() {
    if (!this.svgEl || !this.boardEl) return;

    const boardWidth = this.boardEl.clientWidth;
    const boardHeight = this.boardEl.clientHeight;
    if (boardWidth === 0 || boardHeight === 0) return;

    this.svgEl.setAttribute('viewBox', `0 0 ${boardWidth} ${boardHeight}`);
    this.svgEl.setAttribute('width', boardWidth);
    this.svgEl.setAttribute('height', boardHeight);

    let svgContent = `
      <defs>
        <!-- Soft Drop Shadow for cozy board pieces -->
        <filter id="cozy-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="4" stdDeviation="3" flood-color="#4a3728" flood-opacity="0.35" />
        </filter>
        <filter id="soft-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    `;

    // 1. Draw Rustic Wooden / Bamboo Ladders
    (this.data.defenses || []).forEach((def, idx) => {
      const p1 = this.getTileCenter(def.start); // bottom of ladder
      const p2 = this.getTileCenter(def.end);   // top of ladder

      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist === 0) return;

      const railOffset = 11;
      const nx = (-dy / dist) * railOffset;
      const ny = (dx / dist) * railOffset;

      const l1x = p1.x + nx;
      const l1y = p1.y + ny;
      const l2x = p2.x + nx;
      const l2y = p2.y + ny;

      const r1x = p1.x - nx;
      const r1y = p1.y - ny;
      const r2x = p2.x - nx;
      const r2y = p2.y - ny;

      svgContent += `
        <g class="svg-ladder" filter="url(#cozy-shadow)">
          <!-- Left Timber Rail -->
          <line x1="${l1x}" y1="${l1y}" x2="${l2x}" y2="${l2y}"
                stroke="#6d4c33" stroke-width="6.5" stroke-linecap="round" />
          <line x1="${l1x}" y1="${l1y}" x2="${l2x}" y2="${l2y}"
                stroke="#b08968" stroke-width="3" stroke-linecap="round" />

          <!-- Right Timber Rail -->
          <line x1="${r1x}" y1="${r1y}" x2="${r2x}" y2="${r2y}"
                stroke="#6d4c33" stroke-width="6.5" stroke-linecap="round" />
          <line x1="${r1x}" y1="${r1y}" x2="${r2x}" y2="${r2y}"
                stroke="#b08968" stroke-width="3" stroke-linecap="round" />
      `;

      // Wooden Rungs every 22px
      const stepDist = 20;
      const steps = Math.floor(dist / stepDist);
      for (let i = 1; i < steps; i++) {
        const t = i / steps;
        const rx1 = l1x + t * (l2x - l1x);
        const ry1 = l1y + t * (l2y - l1y);
        const rx2 = r1x + t * (r2x - r1x);
        const ry2 = r1y + t * (r2y - r1y);

        svgContent += `
          <!-- Rung shadow & wood -->
          <line x1="${rx1}" y1="${ry1}" x2="${rx2}" y2="${ry2}" stroke="#533824" stroke-width="4.5" stroke-linecap="round" />
          <line x1="${rx1}" y1="${ry1}" x2="${rx2}" y2="${ry2}" stroke="#ddb892" stroke-width="2.5" stroke-linecap="round" />
        `;

        // Add cute little green leaves on alternating rungs
        if (i % 2 === 1) {
          const leafX = (i % 4 === 1) ? rx1 - 4 : rx2 + 4;
          const leafY = (i % 4 === 1) ? ry1 : ry2;
          svgContent += `
            <circle cx="${leafX}" cy="${leafY}" r="3.5" fill="#70a961" />
            <circle cx="${leafX + 1}" cy="${leafY - 1}" r="2" fill="#a7c957" />
          `;
        }
      }

      svgContent += `
          <!-- Ladder Top Platform Star -->
          <circle cx="${p2.x}" cy="${p2.y}" r="6" fill="#e9c46a" stroke="#6d4c33" stroke-width="2" />
        </g>
      `;
    });

    // 2. Draw REAL Illustrated Cartoon Snakes
    (this.data.threats || []).forEach((thr, idx) => {
      const pHead = this.getTileCenter(thr.start); // Head at upper start tile
      const pTail = this.getTileCenter(thr.end);   // Tail at lower destination tile

      const dx = pTail.x - pHead.x;
      const dy = pTail.y - pHead.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist === 0) return;

      // Normal vector for curve curvature
      const nx = -dy / dist;
      const ny = dx / dist;

      // Alternating playful wave amplitude
      const amp = Math.min(65, Math.max(32, dist * 0.24)) * ((idx % 2 === 0) ? 1 : -1);

      // S-curve control points
      const cp1x = pHead.x + dx * 0.28 + nx * amp;
      const cp1y = pHead.y + dy * 0.28 + ny * amp;
      const cp2x = pHead.x + dx * 0.72 - nx * amp;
      const cp2y = pHead.y + dy * 0.72 - ny * amp;

      const pathData = `M ${pHead.x} ${pHead.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${pTail.x} ${pTail.y}`;

      // Colors for this snake
      const snakeColor = thr.color || '#40916c';
      const bellyColor = thr.bellyColor || '#fff3b0';

      // Angle of snake head facing away from start towards cp1
      const headAngle = Math.atan2(cp1y - pHead.y, cp1x - pHead.x) * (180 / Math.PI);

      svgContent += `
        <g class="svg-real-snake" filter="url(#cozy-shadow)" data-threat-idx="${idx}">
          <!-- Snake Body Shadow Outline -->
          <path d="${pathData}" fill="none" stroke="#3b2b1d" stroke-width="17" stroke-linecap="round" />

          <!-- Snake Underbelly Layer -->
          <path d="${pathData}" fill="none" stroke="${bellyColor}" stroke-width="14" stroke-linecap="round" />

          <!-- Snake Scaled Back Layer -->
          <path d="${pathData}" fill="none" stroke="${snakeColor}" stroke-width="9" stroke-linecap="round" />

          <!-- Snake Pattern Markings (Stripes / Dots along the back) -->
          <path d="${pathData}" fill="none" stroke="#ffffff" stroke-width="3"
                stroke-dasharray="6,8" stroke-linecap="round" opacity="0.65" />

          <!-- Snake Tail: Cute curling tapered tip at destination -->
          <circle cx="${pTail.x}" cy="${pTail.y}" r="6" fill="${snakeColor}" stroke="#3b2b1d" stroke-width="2" />
          <circle cx="${pTail.x}" cy="${pTail.y}" r="3" fill="${bellyColor}" />

          <!-- ========================================================
               ILLUSTRATED SNAKE HEAD (At pHead with eyes, tongue & cheeks)
               ======================================================== -->
          <g transform="translate(${pHead.x}, ${pHead.y}) rotate(${headAngle})">
            
            <!-- Red Forked Tongue flicking out from mouth -->
            <path d="M 12 0 L 22 -3 L 26 -7 M 22 -3 L 26 1"
                  stroke="#e63946" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />

            <!-- Snake Head Outline & Face -->
            <ellipse cx="4" cy="0" rx="14" ry="11" fill="#3b2b1d" />
            <ellipse cx="3.5" cy="0" rx="12.5" ry="9.5" fill="${snakeColor}" />

            <!-- Cute Chubby Cheeks -->
            <circle cx="1" cy="-7" r="3" fill="#ffb4a2" opacity="0.8" />
            <circle cx="1" cy="7" r="3" fill="#ffb4a2" opacity="0.8" />

            <!-- Left Eye -->
            <circle cx="5" cy="-5" r="4.2" fill="#ffffff" stroke="#3b2b1d" stroke-width="1.2" />
            <circle cx="6" cy="-5" r="2.4" fill="#1d3557" />
            <circle cx="7" cy="-6" r="1.1" fill="#ffffff" />

            <!-- Right Eye -->
            <circle cx="5" cy="5" r="4.2" fill="#ffffff" stroke="#3b2b1d" stroke-width="1.2" />
            <circle cx="6" cy="5" r="2.4" fill="#1d3557" />
            <circle cx="7" cy="4" r="1.1" fill="#ffffff" />

            <!-- Nostril Dots -->
            <circle cx="12" cy="-2.5" r="1" fill="#2d3748" />
            <circle cx="12" cy="2.5" r="1" fill="#2d3748" />
          </g>
        </g>
      `;
    });

    this.svgEl.innerHTML = svgContent;
  }
}

window.CozyBoard = CozyBoard;
