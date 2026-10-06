/**
 * Cozy Cyber Village - Game Controller & Multi-Player Manager
 * Supports 2-4 players (human or computer), independent pawn positioning, and cute animal avatars.
 */

class CozyGameController {
  constructor() {
    this.boardData = null;
    this.board = null;
    this.gameState = null;
    this.sessionId = null;
    this.isProcessing = false;
    this.animationSpeed = 'normal'; // 'normal' | 'fast' | 'instant'
    this.pawnElements = new Map(); // playerId -> DOM element
    this.playerPositions = {}; // playerId -> current tile number
    this.pendingResumeCallback = null;

    // Available Animal Avatars
    this.avatarOptions = [
      { id: 'shiba', name: 'Detective Bark', icon: '🐶', color: '#e07a5f' },
      { id: 'duck', name: 'Chef Waddles', icon: '🦆', color: '#f4a261' },
      { id: 'bear', name: 'Barnaby Shield', icon: '🐻', color: '#81b29a' },
      { id: 'fox', name: 'Foxy Firewall', icon: '🦊', color: '#3d5a80' },
      { id: 'frog', name: 'Ribbit Guard', icon: '🐸', color: '#606c38' },
      { id: 'kitty', name: 'MeowSec', icon: '🐱', color: '#d4a373' },
      { id: 'koala', name: 'Koala Admin', icon: '🐨', color: '#457b9d' },
      { id: 'raccoon', name: 'Rogue Bandit', icon: '🦝', color: '#9b5de5' }
    ];

    // DOM Elements
    this.diceBtn = document.getElementById('rollDiceBtn');
    this.statusBanner = document.getElementById('statusBanner');
    this.turnIndicator = document.getElementById('turnIndicator');
    this.playersListEl = document.getElementById('playersList');
    this.eventModal = document.getElementById('eventModal');
    this.victoryModal = document.getElementById('victoryModal');
    this.rankModal = document.getElementById('rankModal');
    this.catalogModal = document.getElementById('catalogModal');
    this.settingsModal = document.getElementById('settingsModal');
    this.activityLog = document.getElementById('activityLog');

    this.bindEvents();
    this.init();
  }

  async init() {
    try {
      // 1. Fetch Board Data
      const boardRes = await fetch('/api/board');
      this.boardData = await boardRes.json();

      // 2. Initialize Board & Conduits
      this.board = new CozyBoard('boardGrid', 'boardSvg', this.boardData);
      window.cozyBoardInstance = this.board;

      // 3. Start default game with 2 players (1 Human + 1 AI)
      await this.startNewGame([
        { name: 'Detective Bark', is_ai: false, avatar: 'shiba', color: '#e07a5f' },
        { name: 'Rogue Bandit', is_ai: true, avatar: 'raccoon', color: '#9b5de5' }
      ]);

      // 4. Populate catalog & lobby form
      this.populateCatalog();
      this.setupLobbyPlayerForm();

      this.logSystem('✨ Welcome to Cozy Cyber Village! Defend our starlight network from cheeky snakes!');
    } catch (err) {
      console.error('Initialization failed:', err);
      this.logSystem('Failed to connect to village server.');
    }
  }

  bindEvents() {
    // Dice Button
    if (this.diceBtn) {
      this.diceBtn.addEventListener('click', () => this.handlePlayerRoll());
    }

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (this.rankModal && this.rankModal.open) {
          this.closeModal(this.rankModal);
        } else if (this.eventModal && this.eventModal.open) {
          this.closeModal(this.eventModal);
        } else if (this.victoryModal && this.victoryModal.open) {
          this.closeModal(this.victoryModal);
        } else if (!this.isProcessing && !this.isCurrentPlayerAi()) {
          this.handlePlayerRoll();
        }
      } else if (e.key === 'm' || e.key === 'M') {
        this.toggleMuteUI();
      } else if (e.key === 'c' || e.key === 'C') {
        this.openModal(this.catalogModal);
      } else if (e.key === 's' || e.key === 'S') {
        this.showPodiumModal(false);
      } else if (e.key === 'r' || e.key === 'R') {
        this.resetCurrentGame();
      } else if (e.key === 'p' || e.key === 'P') {
        this.openModal(this.settingsModal);
      }
    });

    // Mute Button
    const muteBtn = document.getElementById('muteToggleBtn');
    if (muteBtn) {
      this.updateMuteButtonVisuals(muteBtn);
      muteBtn.addEventListener('click', () => this.toggleMuteUI());
    }

    // Reset Buttons (Header & Sidebar)
    const headerResetBtn = document.getElementById('headerResetBtn');
    if (headerResetBtn) {
      headerResetBtn.addEventListener('click', () => this.resetCurrentGame());
    }

    const sidebarResetBtn = document.getElementById('sidebarResetBtn');
    if (sidebarResetBtn) {
      sidebarResetBtn.addEventListener('click', () => this.resetCurrentGame());
    }

    // Standings Button
    const standingsBtn = document.getElementById('headerStandingsBtn');
    if (standingsBtn) {
      standingsBtn.addEventListener('click', () => this.showPodiumModal(false));
    }

    // Rank Modal Continue Button
    const rankContinueBtn = document.getElementById('rankContinueBtn');
    if (rankContinueBtn) {
      rankContinueBtn.addEventListener('click', () => this.closeModal(this.rankModal));
    }

    // Modal light-dismiss fallback
    [this.eventModal, this.victoryModal, this.rankModal, this.catalogModal, this.settingsModal].forEach(modal => {
      if (!modal) return;
      if (!('closedBy' in HTMLDialogElement.prototype)) {
        modal.addEventListener('click', (event) => {
          if (event.target !== modal) return;
          const rect = modal.getBoundingClientRect();
          const isContent = (
            rect.top <= event.clientY &&
            event.clientY <= rect.top + rect.height &&
            rect.left <= event.clientX &&
            event.clientX <= rect.left + rect.width
          );
          if (isContent) return;
          this.closeModal(modal);
        });
      }
    });

    // Close buttons
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', () => {
        const modal = btn.closest('dialog');
        if (modal) this.closeModal(modal);
      });
    });

    // Speed selector
    const speedSelect = document.getElementById('speedSelect');
    if (speedSelect) {
      speedSelect.addEventListener('change', (e) => {
        this.animationSpeed = e.target.value;
      });
    }

    // Top action buttons
    const catalogBtn = document.getElementById('headerCatalogBtn');
    if (catalogBtn) {
      catalogBtn.addEventListener('click', () => this.openModal(this.catalogModal));
    }

    const playersBtn = document.getElementById('headerPlayersBtn');
    if (playersBtn) {
      playersBtn.addEventListener('click', () => this.openModal(this.settingsModal));
    }
  }

  toggleMuteUI() {
    const isMuted = window.cyberAudio.toggleMute();
    const muteBtn = document.getElementById('muteToggleBtn');
    if (muteBtn) this.updateMuteButtonVisuals(muteBtn);
    this.logSystem(`Audio ${isMuted ? 'Muted' : 'Unmuted'}.`);
  }

  updateMuteButtonVisuals(btn) {
    const isMuted = window.cyberAudio.isMuted();
    btn.innerHTML = isMuted ? '🔇 <span class="btn-text">Sound: OFF</span>' : '🔊 <span class="btn-text">Sound: ON</span>';
  }

  openModal(modal) {
    if (!modal) return;
    window.cyberAudio.playClick();
    modal.showModal();
  }

  closeModal(modal) {
    if (!modal) return;
    window.cyberAudio.playClick();
    modal.close();

    if (modal === this.eventModal && this.pendingResumeCallback) {
      const cb = this.pendingResumeCallback;
      this.pendingResumeCallback = null;
      cb();
    }
  }

  // ========================================================================
  // LOBBY SETUP: ADD / REMOVE PLAYERS (2 to 4) & SELECT HUMAN OR COMPUTER
  // ========================================================================
  setupLobbyPlayerForm() {
    const container = document.getElementById('lobbyPlayersRows');
    const addPlayerBtn = document.getElementById('addPlayerRowBtn');
    const startBtn = document.getElementById('startConfiguredGameBtn');
    if (!container || !addPlayerBtn) return;

    // Initial 2 rows
    let currentConfigs = [
      { name: 'Detective Bark', is_ai: false, avatar: 'shiba' },
      { name: 'Rogue Bandit', is_ai: true, avatar: 'raccoon' }
    ];

    const renderRows = () => {
      container.innerHTML = '';
      currentConfigs.forEach((cfg, idx) => {
        const row = document.createElement('div');
        row.className = 'lobby-player-row';
        row.innerHTML = `
          <div class="row-num">#${idx + 1}</div>
          <select class="form-control avatar-select" data-idx="${idx}">
            ${this.avatarOptions.map(a => `
              <option value="${a.id}" ${a.id === cfg.avatar ? 'selected' : ''}>
                ${a.icon} ${a.name}
              </option>
            `).join('')}
          </select>
          <input type="text" class="form-control name-input" data-idx="${idx}" value="${cfg.name}" placeholder="Player Name" maxlength="16">
          <select class="form-control type-select" data-idx="${idx}">
            <option value="human" ${!cfg.is_ai ? 'selected' : ''}>👤 Human Friend</option>
            <option value="ai" ${cfg.is_ai ? 'selected' : ''}>🤖 Computer Bot</option>
          </select>
          ${currentConfigs.length > 2 ? `<button type="button" class="btn-remove-row" data-idx="${idx}" title="Remove player">✕</button>` : '<div style="width:28px"></div>'}
        `;
        container.appendChild(row);
      });

      // Show/hide add button if 4 players reached
      addPlayerBtn.style.display = currentConfigs.length < 4 ? 'inline-flex' : 'none';

      // Event listeners for inputs
      container.querySelectorAll('.avatar-select').forEach(sel => {
        sel.addEventListener('change', (e) => {
          const idx = parseInt(e.target.dataset.idx);
          const avId = e.target.value;
          currentConfigs[idx].avatar = avId;
          const opt = this.avatarOptions.find(o => o.id === avId);
          if (opt && (!currentConfigs[idx].name || this.avatarOptions.some(a => a.name === currentConfigs[idx].name))) {
            currentConfigs[idx].name = opt.name;
            renderRows();
          }
        });
      });

      container.querySelectorAll('.name-input').forEach(inp => {
        inp.addEventListener('input', (e) => {
          const idx = parseInt(e.target.dataset.idx);
          currentConfigs[idx].name = e.target.value.trim();
        });
      });

      container.querySelectorAll('.type-select').forEach(sel => {
        sel.addEventListener('change', (e) => {
          const idx = parseInt(e.target.dataset.idx);
          currentConfigs[idx].is_ai = (e.target.value === 'ai');
        });
      });

      container.querySelectorAll('.btn-remove-row').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const idx = parseInt(e.target.dataset.idx);
          if (currentConfigs.length > 2) {
            currentConfigs.splice(idx, 1);
            renderRows();
          }
        });
      });
    };

    addPlayerBtn.addEventListener('click', () => {
      if (currentConfigs.length < 4) {
        const unusedAvatars = this.avatarOptions.filter(a => !currentConfigs.some(c => c.avatar === a.id));
        const pick = unusedAvatars[0] || this.avatarOptions[currentConfigs.length];
        currentConfigs.push({
          name: pick.name,
          is_ai: true,
          avatar: pick.id
        });
        renderRows();
      }
    });

    if (startBtn) {
      startBtn.addEventListener('click', () => {
        // Collect configs and launch
        const playersToStart = currentConfigs.map(c => {
          const meta = this.avatarOptions.find(a => a.id === c.avatar) || this.avatarOptions[0];
          return {
            name: c.name || meta.name,
            is_ai: Boolean(c.is_ai),
            avatar: c.avatar,
            color: meta.color
          };
        });

        this.closeModal(this.settingsModal);
        this.startNewGame(playersToStart);
      });
    }

    renderRows();
  }

  async startNewGame(playersConfig) {
    try {
      this.isProcessing = true;
      this.updateDiceButtonState(false, 'PREPARING VILLAGE...');

      const res = await fetch('/api/game/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ players: playersConfig })
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to create game');

      this.gameState = data.game;
      this.sessionId = data.game.id;

      // Initialize all player positions to Tile 1
      this.playerPositions = {};
      this.gameState.players.forEach(p => {
        this.playerPositions[p.id] = p.position || 1;
      });

      // Create DOM pawns for all players
      this.createPawns();

      // Reset activity log
      this.activityLog.innerHTML = '';
      this.logSystem(`🏡 Game started with ${this.gameState.players.length} players! First to Tile 100 wins!`);

      this.updateUI();
      this.updatePawnPositions();

      this.isProcessing = false;
      this.checkTurnExecution();
    } catch (err) {
      console.error('New game error:', err);
      this.isProcessing = false;
    }
  }

  createPawns() {
    const container = document.getElementById('pawnsLayer');
    container.innerHTML = '';
    this.pawnElements.clear();

    this.gameState.players.forEach(p => {
      const pawn = document.createElement('div');
      pawn.className = `cozy-pawn pawn-player-${p.id}`;
      pawn.id = `pawn-${p.id}`;
      pawn.style.setProperty('--player-color', p.color);

      pawn.innerHTML = `
        <div class="pawn-bubble">
          <span class="pawn-emoji">${p.icon || '🐾'}</span>
        </div>
        <div class="pawn-nametag">${p.name.split(' ')[0]}</div>
      `;
      container.appendChild(pawn);
      this.pawnElements.set(p.id, pawn);
    });
  }

  isCurrentPlayerAi() {
    if (!this.gameState) return false;
    const curr = this.gameState.players[this.gameState.current_player_idx];
    return curr && curr.is_ai;
  }

  updateDiceButtonState(enabled, customText = null) {
    if (!this.diceBtn) return;
    this.diceBtn.disabled = !enabled;

    const label = this.diceBtn.querySelector('.dice-btn-label');
    if (customText) {
      label.textContent = customText;
    } else {
      const curr = this.gameState ? this.gameState.players[this.gameState.current_player_idx] : null;
      if (curr) {
        if (curr.is_ai) {
          label.textContent = `🤖 ${curr.name.toUpperCase()} ROLLING...`;
        } else {
          label.textContent = `🎲 ${curr.name.toUpperCase()}: ROLL [SPACE]`;
        }
      } else {
        label.textContent = 'ROLL DICE [SPACE]';
      }
    }
  }

  updateUI() {
    if (!this.gameState) return;

    const isFinished = (this.gameState.status === 'finished');
    const currPlayer = this.gameState.players[this.gameState.current_player_idx];
    const winner = this.gameState.winner || (this.gameState.rankings && this.gameState.rankings[0]);

    // Status Banner
    if (this.statusBanner) {
      if (isFinished) {
        this.statusBanner.innerHTML = `
          <span class="active-badge-tag" style="background:#f59e0b;"></span>
          🏁 <strong>ADVENTURE CONCLUDED!</strong> All players ranked • Champion: <strong>${winner ? winner.name : 'Adventurer'}</strong>
        `;
      } else {
        this.statusBanner.innerHTML = `
          <span class="active-badge-tag" style="background:${currPlayer.color};"></span>
          TURN ${this.gameState.turn_count}: <strong>${currPlayer.name}</strong>'s Turn (${currPlayer.is_ai ? '🤖 Bot' : '👤 Player'})
        `;
      }
    }

    // Turn Indicator
    if (this.turnIndicator) {
      if (isFinished) {
        this.turnIndicator.innerHTML = `
          <div class="turn-card-active" style="border-color:#f59e0b; background:#fef3c7;">
            <div class="turn-avatar">🏆</div>
            <div class="turn-meta">
              <div class="turn-curr-name">${winner ? winner.name : 'Race Complete'}</div>
              <div class="turn-curr-sub">Grand Champion • All racers ranked!</div>
            </div>
          </div>
        `;
      } else {
        this.turnIndicator.innerHTML = `
          <div class="turn-card-active" style="border-color:${currPlayer.color}; background:${currPlayer.color}15;">
            <div class="turn-avatar">${currPlayer.icon}</div>
            <div class="turn-meta">
              <div class="turn-curr-name">${currPlayer.name}</div>
              <div class="turn-curr-sub">${currPlayer.is_ai ? 'Computer AI Opponent' : 'Human Player'} • Tile ${this.playerPositions[currPlayer.id] || currPlayer.position}</div>
            </div>
          </div>
        `;
      }
    }

    // Players Roster Sidebar Cards
    if (this.playersListEl) {
      this.playersListEl.innerHTML = '';
      this.gameState.players.forEach((p, idx) => {
        const isActive = (!isFinished && idx === this.gameState.current_player_idx);
        const card = document.createElement('div');
        card.className = `player-roster-card ${isActive ? 'active-roster-card' : ''}`;
        card.style.borderLeftColor = p.color;

        const medalMap = { 1: '🥇 1st', 2: '🥈 2nd', 3: '🥉 3rd', 4: '🎖️ 4th' };
        const rankBadge = p.rank ? `<span class="roster-type-pill" style="background:#fef3c7; color:#b45309; border-color:#f59e0b; font-weight:900;">${medalMap[p.rank] || `#${p.rank}`}</span>` : '';
        const rolls = p.stats.rolls || 0;
        const avg = rolls > 0 ? ((p.stats.total_roll_sum || 0) / rolls).toFixed(1) : '-';

        card.innerHTML = `
          <div class="roster-avatar-box" style="background:${p.color}25;">${p.icon}</div>
          <div class="roster-info">
            <div class="roster-name-row">
              <span class="roster-name">${p.name}</span>
              <div style="display:flex; gap:4px; align-items:center;">
                ${rankBadge}
                <span class="roster-type-pill">${p.is_ai ? '🤖 Bot' : '👤 Friend'}</span>
              </div>
            </div>
            <div class="roster-pos-row">
              <strong class="roster-tile-badge" style="background:${p.color};">
                ${p.finished ? `Tile ${p.position} 🏁` : `Tile ${this.playerPositions[p.id] || p.position}`}
              </strong>
              <span class="roster-stats">🎲 ${rolls} rolls (avg ${avg}) | 🪜 ${p.stats.defenses_hit} | 🐍 ${p.stats.threats_hit}</span>
            </div>
          </div>
        `;
        this.playersListEl.appendChild(card);
      });
    }

    // Button state
    if (!this.isProcessing) {
      if (isFinished) {
        this.updateDiceButtonState(false, '🏆 ADVENTURE FINISHED');
      } else if (currPlayer.is_ai) {
        this.updateDiceButtonState(false, `🤖 ${currPlayer.name} THINKING...`);
      } else {
        this.updateDiceButtonState(true);
      }
    }
  }

  // ========================================================================
  // PRECISE PAWN POSITIONING (Each pawn stays at its own tile!)
  // ========================================================================
  updatePawnPositions() {
    if (!this.gameState || !this.board) return;

    // Group players by current tile to apply nice non-overlapping offsets
    const tileGroups = new Map(); // tileNum -> array of playerIds
    this.gameState.players.forEach(p => {
      const pos = this.playerPositions[p.id] || p.position || 1;
      if (!tileGroups.has(pos)) tileGroups.set(pos, []);
      tileGroups.get(pos).push(p.id);
    });

    tileGroups.forEach((playerIds, tileNum) => {
      const center = this.board.getTileCenter(tileNum);
      const count = playerIds.length;

      playerIds.forEach((pId, index) => {
        const el = this.pawnElements.get(pId);
        if (!el) return;

        let offsetX = 0;
        let offsetY = 0;

        if (count === 2) {
          offsetX = (index === 0) ? -11 : 11;
        } else if (count === 3) {
          if (index === 0) { offsetX = -11; offsetY = -8; }
          else if (index === 1) { offsetX = 11; offsetY = -8; }
          else { offsetX = 0; offsetY = 10; }
        } else if (count >= 4) {
          if (index === 0) { offsetX = -10; offsetY = -10; }
          else if (index === 1) { offsetX = 10; offsetY = -10; }
          else if (index === 2) { offsetX = -10; offsetY = 10; }
          else { offsetX = 10; offsetY = 10; }
        }

        el.style.transform = `translate3d(${center.x + offsetX}px, ${center.y + offsetY}px, 0)`;
      });
    });
  }

  checkTurnExecution() {
    if (!this.gameState || this.gameState.status === 'finished' || this.isProcessing) return;

    const currPlayer = this.gameState.players[this.gameState.current_player_idx];
    if (currPlayer.is_ai) {
      this.isProcessing = true;
      this.updateDiceButtonState(false, `🤖 ${currPlayer.name} THINKING...`);

      const delay = (this.animationSpeed === 'instant') ? 150 : 1100;
      setTimeout(() => {
        this.executeRoll();
      }, delay);
    } else {
      this.updateDiceButtonState(true);
    }
  }

  generateCryptoRoll() {
    if (window.crypto && window.crypto.getRandomValues) {
      const buf = new Uint32Array(1);
      window.crypto.getRandomValues(buf);
      return (buf[0] % 6) + 1;
    }
    return Math.floor(Math.random() * 6) + 1;
  }

  async handlePlayerRoll() {
    if (this.isProcessing || this.isCurrentPlayerAi() || (this.gameState && this.gameState.status === 'finished')) {
      return;
    }

    this.isProcessing = true;
    this.updateDiceButtonState(false, 'ROLLING DICE...');
    await this.executeRoll();
  }

  async executeRoll() {
    try {
      const currPlayer = this.gameState.players[this.gameState.current_player_idx];
      let clientDie = null;
      if (!currPlayer.is_ai) {
        clientDie = this.generateCryptoRoll();
      }

      window.cyberAudio.playDiceRoll();

      // Parallelize API call with dice roll animation
      const rollPromise = fetch('/api/game/roll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game_id: this.sessionId,
          client_die: clientDie
        })
      }).then(r => r.json());

      await this.animateDiceRoll(clientDie);

      const data = await rollPromise;
      if (!data.success) throw new Error(data.error || 'Roll failed');

      const result = data.result;
      this.setDiceFace(result.die_roll);

      // Perform step-by-step pawn movement ONLY for the moving player
      await this.animatePawnMovement(result);

      // Update state
      this.gameState = result.game_state;
      this.playerPositions[result.player_id] = result.final_pos;

      this.updateUI();
      this.updatePawnPositions();

      if (result.auto_finished_player) {
        const autoP = result.auto_finished_player;
        this.logSystem(`🏁 Only ${autoP.name} remained! Game concluded early with ${autoP.name} taking ${autoP.medal}!`);
        const autoPawn = this.pawnElements.get(autoP.player_id);
        if (autoPawn) {
          autoPawn.classList.add('pawn-finished');
          const medalIcon = (autoP.medal || '').split(' ')[0] || '🏅';
          const nametag = autoPawn.querySelector('.pawn-nametag');
          if (nametag) nametag.innerHTML = `${medalIcon} ${autoP.name.split(' ')[0]}`;
        }
      }

      if (result.just_finished) {
        await this.handlePlayerFinished(result);
        if (result.all_finished) {
          this.isProcessing = false;
          this.updateUI();
          return;
        }
      } else if (result.all_finished) {
        window.cyberAudio.playVictory();
        this.showPodiumModal(true);
        this.isProcessing = false;
        this.updateUI();
        return;
      }

      this.isProcessing = false;
      this.checkTurnExecution();
    } catch (err) {
      console.error('Roll error:', err);
      this.isProcessing = false;
      this.checkTurnExecution();
    }
  }

  animateDiceRoll(targetVal = null) {
    return new Promise(resolve => {
      if (this.animationSpeed === 'instant') {
        if (targetVal) this.setDiceFace(targetVal);
        resolve();
        return;
      }

      const cube = document.getElementById('cyberDice');
      if (cube) cube.classList.add('rolling');

      let ticks = 0;
      const interval = setInterval(() => {
        const rand = Math.floor(Math.random() * 6) + 1;
        this.setDiceFace(rand);
        ticks++;
        if (ticks >= 7) {
          clearInterval(interval);
          if (cube) cube.classList.remove('rolling');
          if (targetVal) this.setDiceFace(targetVal);
          resolve();
        }
      }, 70);
    });
  }

  setDiceFace(val) {
    const diceValueEl = document.getElementById('diceValue');
    if (diceValueEl) {
      const pips = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
      diceValueEl.textContent = pips[val - 1] || val;
    }
  }

  // ========================================================================
  // ANIMATE PAWN STEPPING (ONLY the moving player moves!)
  // ========================================================================
  async animatePawnMovement(result) {
    const playerId = result.player_id;
    const pawnEl = this.pawnElements.get(playerId);
    if (!pawnEl) return;

    const startPos = result.start_pos;
    const steppedPos = result.stepped_pos;
    const finalPos = result.final_pos;

    this.logRoll(result.player_name, result.die_roll, startPos, steppedPos);

    if (this.animationSpeed === 'instant') {
      this.playerPositions[playerId] = finalPos;
      this.updatePawnPositions();
      if (result.event) {
        await this.handleTileEvent(result.event, playerId, steppedPos, finalPos);
      }
      return;
    }

    const stepDelay = (this.animationSpeed === 'fast') ? 80 : 160;

    // Step forward 1 by 1
    for (let current = startPos + 1; current <= steppedPos; current++) {
      this.playerPositions[playerId] = current;
      const coords = this.board.getTileCenter(current);
      pawnEl.style.transform = `translate3d(${coords.x}px, ${coords.y}px, 0)`;
      window.cyberAudio.playStep();
      await new Promise(r => setTimeout(r, stepDelay));
    }

    await new Promise(r => setTimeout(r, 220));

    // Handle Threat Snake or Defense Ladder
    if (result.event) {
      await this.handleTileEvent(result.event, playerId, steppedPos, finalPos);
    } else {
      this.playerPositions[playerId] = finalPos;
      this.updatePawnPositions();
    }
  }

  handleTileEvent(event, playerId, steppedPos, finalPos) {
    return new Promise(resolve => {
      const pawnEl = this.pawnElements.get(playerId);
      const isDefense = (event.type === 'defense');

      if (isDefense) {
        window.cyberAudio.playLadder();
        this.logEvent('DEFENSE', event.info.name, `Climbed ladder from Tile ${steppedPos} ➔ ${finalPos}!`);
      } else {
        window.cyberAudio.playThreat();
        this.logEvent('THREAT', event.info.name, `Encountered snake! Slid down from Tile ${steppedPos} ➔ ${finalPos}.`);
      }

      this.showLoreModal(event.type, event.info, () => {
        if (pawnEl) {
          const finalCoords = this.board.getTileCenter(finalPos);
          pawnEl.style.transition = 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)';
          pawnEl.style.transform = `translate3d(${finalCoords.x}px, ${finalCoords.y}px, 0)`;

          setTimeout(() => {
            pawnEl.style.transition = '';
            this.playerPositions[playerId] = finalPos;
            this.updatePawnPositions();
            resolve();
          }, 850);
        } else {
          this.playerPositions[playerId] = finalPos;
          this.updatePawnPositions();
          resolve();
        }
      });
    });
  }

  showLoreModal(type, info, onCloseCallback = null) {
    this.pendingResumeCallback = onCloseCallback;

    const modal = this.eventModal;
    const titleEl = document.getElementById('eventTitle');
    const badgeEl = document.getElementById('eventBadge');
    const frameworkEl = document.getElementById('eventFramework');
    const summaryEl = document.getElementById('eventSummary');
    const loreEl = document.getElementById('eventLore');
    const tacticalEl = document.getElementById('eventTactical');
    const bannerEl = document.getElementById('modalTypeBanner');
    const proceedBtn = document.getElementById('eventProceedBtn');

    const isDefense = (type === 'defense');

    modal.className = isDefense ? 'cozy-modal modal-defense' : 'cozy-modal modal-threat';

    if (bannerEl) {
      bannerEl.textContent = isDefense ? '✨ VILLAGE DEFENSE ACTIVATED!' : '🐍 SNEAKY THREAT ENCOUNTERED!';
      bannerEl.className = isDefense ? 'modal-banner banner-defense' : 'modal-banner banner-threat';
    }

    if (titleEl) titleEl.textContent = info.name;
    if (badgeEl) badgeEl.textContent = isDefense ? '🪜 LADDER CLIMB' : '🐍 SLIDE DOWN';
    if (frameworkEl) frameworkEl.textContent = info.framework || 'CYBER PROTOCOL';
    if (summaryEl) summaryEl.textContent = info.summary || '';
    if (loreEl) loreEl.textContent = info.lore || '';

    if (tacticalEl) {
      if (isDefense) {
        tacticalEl.innerHTML = `<strong>🌱 Tactical Benefit:</strong> ${info.tactical_benefit || ''}`;
      } else {
        tacticalEl.innerHTML = `<strong>⚠️ Incident Penalty:</strong> ${info.tactical_penalty || ''}<br><span class="mitigation-sub">Remediation: ${info.mitigation || ''}</span>`;
      }
    }

    if (proceedBtn) {
      proceedBtn.textContent = isDefense ? 'AWESOME, PROCEED! [SPACE]' : 'ACKNOWLEDGED & REMEDIATE [SPACE]';
    }

    this.openModal(modal);
  }

  async handlePlayerFinished(result) {
    window.cyberAudio.playVictory();

    // Mark pawn at Tile 100 with medal badge
    const pawn = this.pawnElements.get(result.player_id);
    if (pawn) {
      pawn.classList.add('pawn-finished');
      const medalMap = { 1: '🥇', 2: '🥈', 3: '🥉', 4: '🎖️' };
      const medal = medalMap[result.player_rank] || '🏅';
      const nametag = pawn.querySelector('.pawn-nametag');
      if (nametag) nametag.innerHTML = `${medal} ${result.player_name.split(' ')[0]}`;
    }

    if (result.all_finished) {
      this.showPodiumModal(true);
    } else {
      await this.showRankMilestone(result);
    }
  }

  showRankMilestone(result) {
    return new Promise(resolve => {
      const modal = this.rankModal;
      if (!modal) {
        resolve();
        return;
      }

      const medalMap = { 1: '🥇 1st Place', 2: '🥈 2nd Place', 3: '🥉 3rd Place', 4: '🎖️ 4th Place' };
      const medal = medalMap[result.player_rank] || `#${result.player_rank} Place`;
      const titleEl = document.getElementById('rankTitle');
      const subtitleEl = document.getElementById('rankSubtitle');
      const medalIconEl = document.getElementById('rankMedalIcon');
      const listEl = document.getElementById('rankStandingsList');
      const continueBtn = document.getElementById('rankContinueBtn');

      if (medalIconEl) medalIconEl.textContent = medal.split(' ')[0];
      if (titleEl) titleEl.textContent = `${result.player_name.toUpperCase()} FINISHED!`;
      if (subtitleEl) subtitleEl.textContent = `Secured ${medal}! The race continues for remaining racers!`;
      if (listEl) listEl.innerHTML = this.renderPodiumHtml(false);

      const closeHandler = () => {
        if (continueBtn) continueBtn.removeEventListener('click', closeHandler);
        this.closeModal(modal);
        resolve();
      };

      if (continueBtn) {
        continueBtn.addEventListener('click', closeHandler, { once: true });
      }

      this.openModal(modal);
    });
  }

  showPodiumModal(isFinal = true) {
    const modal = this.victoryModal;
    if (!modal) return;

    const banner = document.getElementById('victoryWinnerBanner');
    const subtitle = document.getElementById('victorySubtitle');
    const listEl = document.getElementById('victoryPodiumList');
    const statsEl = document.getElementById('victoryStats');

    if (banner) {
      banner.textContent = isFinal ? '🏆 ALL ADVENTURERS RANKED!' : '🏆 CURRENT VILLAGE STANDINGS';
    }

    if (subtitle) {
      subtitle.textContent = isFinal
        ? 'The adventure has concluded! All racers have received their final awards.'
        : 'The race is currently in progress!';
    }

    if (listEl) {
      listEl.innerHTML = this.renderPodiumHtml(isFinal);
    }

    if (statsEl) {
      if (isFinal && this.gameState) {
        const rankings = this.gameState.rankings || [];
        const winner = (rankings.length > 0) ? rankings[0].name : 'Adventurer';
        const totalTurns = this.gameState.turn_count || 1;
        statsEl.innerHTML = `
          <div class="stat-pill">
            <span>👑 Grand Champion</span>
            <span style="color:#7b2cbf;">${winner}</span>
          </div>
          <div class="stat-pill">
            <span>🎲 Total Turns</span>
            <span style="color:#7b2cbf;">${totalTurns} Turns</span>
          </div>
          <div class="stat-pill">
            <span>🏁 Total Racers</span>
            <span style="color:#7b2cbf;">${this.gameState.players.length} Players</span>
          </div>
          <div class="stat-pill">
            <span>⭐ Status</span>
            <span style="color:#1b5e20;">Rankings Finalized</span>
          </div>
        `;
      } else {
        statsEl.innerHTML = '';
      }
    }

    this.openModal(modal);
  }

  renderPodiumHtml(isFinal) {
    if (!this.gameState) return '';
    const rankings = this.gameState.rankings || [];
    let html = '';

    // Finished players
    rankings.forEach(r => {
      const isAuto = !!r.auto_ranked;
      const subtitleText = isAuto
        ? `${r.medal} • Auto-Ranked (${r.rolls} rolls • Ended on Tile ${r.final_tile || '🏁'})`
        : `${r.medal} • Finished Turn ${r.turn} (${r.rolls} rolls)`;
      const statusText = isAuto
        ? `🏁 Final Placement`
        : `👑 Safe in Treehouse`;

      const playerObj = this.gameState.players.find(p => p.id === (r.player_id || r.id));
      const pStats = playerObj?.stats;
      let diceBreakdown = '';
      if (pStats && pStats.dice_counts) {
        const counts = pStats.dice_counts;
        const avg = pStats.rolls > 0 ? ((pStats.total_roll_sum || 0) / pStats.rolls).toFixed(2) : '3.50';
        diceBreakdown = `<div style="font-size:0.74rem; color:#7b2cbf; margin-top:3px; font-weight:700;">🎲 Fair Rolls (Avg ${avg}): ⚀:${counts['1']||0} ⚁:${counts['2']||0} ⚂:${counts['3']||0} ⚃:${counts['4']||0} ⚄:${counts['5']||0} ⚅:${counts['6']||0}</div>`;
      }

      html += `
        <div class="podium-item podium-item-rank-${r.rank}">
          <div style="display:flex; align-items:center; gap:0.6rem;">
            <span class="podium-rank-badge">${r.medal.split(' ')[0]}</span>
            <span style="font-size:1.5rem;">${r.icon || '🐾'}</span>
            <div>
              <div class="podium-player-name">${r.name}</div>
              <div class="podium-player-sub">${subtitleText}</div>
              ${diceBreakdown}
            </div>
          </div>
          <div class="podium-meta-right">${statusText}</div>
        </div>
      `;
    });

    // Still racing players (if any remain)
    const unfinished = this.gameState.players.filter(p => !p.finished);
    unfinished.forEach(p => {
      const pos = this.playerPositions[p.id] || p.position || 1;
      const pStats = p.stats;
      let diceBreakdown = '';
      if (pStats && pStats.dice_counts) {
        const counts = pStats.dice_counts;
        const avg = pStats.rolls > 0 ? ((pStats.total_roll_sum || 0) / pStats.rolls).toFixed(2) : '3.50';
        diceBreakdown = `<div style="font-size:0.74rem; color:#7b2cbf; margin-top:3px; font-weight:700;">🎲 Fair Rolls (Avg ${avg}): ⚀:${counts['1']||0} ⚁:${counts['2']||0} ⚂:${counts['3']||0} ⚃:${counts['4']||0} ⚄:${counts['5']||0} ⚅:${counts['6']||0}</div>`;
      }

      html += `
        <div class="podium-item podium-item-active">
          <div style="display:flex; align-items:center; gap:0.6rem;">
            <span class="podium-rank-badge">🏃</span>
            <span style="font-size:1.5rem;">${p.icon || '🐾'}</span>
            <div>
              <div class="podium-player-name">${p.name}</div>
              <div class="podium-player-sub">${p.is_ai ? 'Computer AI' : 'Friend'} • Currently on Tile ${pos}</div>
              ${diceBreakdown}
            </div>
          </div>
          <div class="podium-meta-right" style="color:#d97706;">Still Racing...</div>
        </div>
      `;
    });

    return html;
  }

  async resetCurrentGame() {
    try {
      this.isProcessing = true;
      window.cyberAudio.playClick();

      const res = await fetch('/api/game/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game_id: this.sessionId })
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Reset failed');

      this.gameState = data.game;
      this.sessionId = data.game.id;

      // Reset positions to 1
      this.playerPositions = {};
      this.gameState.players.forEach(p => {
        this.playerPositions[p.id] = 1;
      });

      // Clear pawns finished classes
      this.pawnElements.forEach(pawn => {
        pawn.classList.remove('pawn-finished');
      });

      this.createPawns();
      this.activityLog.innerHTML = '';
      this.logSystem('🔄 Village game reset! All adventurers back at Day-0 Gate.');

      this.updateUI();
      this.updatePawnPositions();

      this.isProcessing = false;
      this.checkTurnExecution();
    } catch (err) {
      console.error('Reset error:', err);
      this.isProcessing = false;
    }
  }

  populateCatalog() {
    const listEl = document.getElementById('catalogList');
    if (!listEl || !this.boardData) return;

    listEl.innerHTML = '';

    // Defenses Section
    const defHeader = document.createElement('h3');
    defHeader.className = 'catalog-section-title title-defense';
    defHeader.innerHTML = '🪜 VILLAGE DEFENSES (LADDERS - CLIMB UP)';
    listEl.appendChild(defHeader);

    this.boardData.defenses.forEach(def => {
      const item = document.createElement('div');
      item.className = 'catalog-item item-defense';
      item.innerHTML = `
        <div class="catalog-item-header">
          <span class="catalog-name">🪜 ${def.name}</span>
          <span class="catalog-jump">Tile ${def.start} ➔ Tile ${def.end} (+${def.end - def.start})</span>
        </div>
        <div class="catalog-framework">${def.framework}</div>
        <div class="catalog-desc">${def.lore}</div>
      `;
      item.addEventListener('click', () => {
        this.closeModal(this.catalogModal);
        this.showLoreModal('defense', def);
      });
      listEl.appendChild(item);
    });

    // Threats Section
    const thrHeader = document.createElement('h3');
    thrHeader.className = 'catalog-section-title title-threat';
    thrHeader.innerHTML = '🐍 CHEEKY THREATS (SNAKES - SLIDE DOWN)';
    listEl.appendChild(thrHeader);

    this.boardData.threats.forEach(thr => {
      const item = document.createElement('div');
      item.className = 'catalog-item item-threat';
      item.innerHTML = `
        <div class="catalog-item-header">
          <span class="catalog-name">🐍 ${thr.name}</span>
          <span class="catalog-jump">Tile ${thr.start} ➔ Tile ${thr.end} (${thr.end - thr.start})</span>
        </div>
        <div class="catalog-framework">${thr.framework}</div>
        <div class="catalog-desc">${thr.lore}</div>
      `;
      item.addEventListener('click', () => {
        this.closeModal(this.catalogModal);
        this.showLoreModal('threat', thr);
      });
      listEl.appendChild(item);
    });
  }

  getTimeStr() {
    const now = new Date();
    return now.toTimeString().split(' ')[0];
  }

  logRoll(playerName, rollVal, fromTile, toTile) {
    const entry = document.createElement('div');
    entry.className = 'log-entry roll-log';
    entry.innerHTML = `
      <span class="log-time">[${this.getTimeStr()}]</span>
      <span class="log-player">${playerName}</span> rolled <strong>${rollVal}</strong> (Tile ${fromTile} ➔ ${toTile})
    `;
    this.appendLog(entry);
  }

  logEvent(type, name, action) {
    const entry = document.createElement('div');
    entry.className = `log-entry event-log event-log-${type.toLowerCase()}`;
    const icon = type === 'DEFENSE' ? '🪜' : '🐍';
    entry.innerHTML = `
      <span class="log-time">[${this.getTimeStr()}]</span>
      <span class="log-tag tag-${type.toLowerCase()}">${icon} ${type}</span>
      <strong>${name}</strong>: ${action}
    `;
    this.appendLog(entry);
  }

  logSystem(msg) {
    const entry = document.createElement('div');
    entry.className = 'log-entry system-log';
    entry.innerHTML = `<span class="log-time">[${this.getTimeStr()}]</span> <span class="log-sys-text">${msg}</span>`;
    this.appendLog(entry);
  }

  appendLog(el) {
    if (!this.activityLog) return;
    this.activityLog.appendChild(el);
    this.activityLog.scrollTop = this.activityLog.scrollHeight;
  }
}

function FalseOrBool(val) {
  return Boolean(val);
}

document.addEventListener('DOMContentLoaded', () => {
  window.gameInstance = new CozyGameController();
});
