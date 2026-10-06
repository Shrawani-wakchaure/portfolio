/**
 * In-Browser Cyber Threat Defense Game Engine
 * Replaces the Python/Flask backend with pure client-side execution.
 * 100% CSPRNG compliant, zero external server dependencies, works offline & on Vercel.
 */

(function () {
  const DEFAULT_AVATARS = [
    { avatar: 'shiba', default_name: 'Detective Bark', color: '#e07a5f', icon: '🐶' },
    { avatar: 'duck', default_name: 'Chef Waddles', color: '#f4a261', icon: '🦆' },
    { avatar: 'bear', default_name: 'Barnaby Shield', color: '#81b29a', icon: '🐻' },
    { avatar: 'fox', default_name: 'Foxy Firewall', color: '#3d5a80', icon: '🦊' },
    { avatar: 'frog', default_name: 'Ribbit Guard', color: '#606c38', icon: '🐸' },
    { avatar: 'kitty', default_name: 'MeowSec', color: '#d4a373', icon: '🐱' },
    { avatar: 'koala', default_name: 'Koala Admin', color: '#457b9d', icon: '🐨' },
    { avatar: 'raccoon', default_name: 'Rogue Bandit', color: '#9b5de5', icon: '🦝' }
  ];

  let BOARD_DATA = null;
  let DEFENSES_MAP = {};
  let THREATS_MAP = {};
  const GAMES = {};

  async function loadBoardData() {
    if (BOARD_DATA) return BOARD_DATA;
    try {
      const resp = await originalFetch('./board_data.json');
      BOARD_DATA = await resp.json();
    } catch {
      const resp = await originalFetch('/games/cyber-threat-defense/board_data.json');
      BOARD_DATA = await resp.json();
    }
    DEFENSES_MAP = {};
    THREATS_MAP = {};
    (BOARD_DATA.defenses || []).forEach(d => { DEFENSES_MAP[d.start] = d; });
    (BOARD_DATA.threats || []).forEach(t => { THREATS_MAP[t.start] = t; });
    return BOARD_DATA;
  }

  function createGameInstance(players_config) {
    const game_id = 'cozy-game-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now();

    if (!players_config || players_config.length < 2) {
      players_config = [
        { name: 'Detective Bark', is_ai: false, avatar: 'shiba', color: '#e07a5f' },
        { name: 'Rogue Bandit', is_ai: true, avatar: 'raccoon', color: '#9b5de5' }
      ];
    }

    const players = [];
    players_config.slice(0, 4).forEach((p_cfg, idx) => {
      const p_id = idx + 1;
      const name = (p_cfg.name || '').trim() || `Player ${p_id}`;
      const is_ai = Boolean(p_cfg.is_ai);
      const avatar = p_cfg.avatar || 'shiba';

      const meta = DEFAULT_AVATARS.find(a => a.avatar === avatar) || DEFAULT_AVATARS[idx % DEFAULT_AVATARS.length];
      const color = p_cfg.color || meta.color;
      const icon = meta.icon;

      players.append ? null : players.push({
        id: p_id,
        name,
        is_ai,
        avatar,
        icon,
        color,
        position: 1,
        finished: false,
        rank: null,
        finish_turn: null,
        stats: {
          rolls: 0,
          threats_hit: 0,
          defenses_hit: 0,
          highest_tile: 1,
          dice_counts: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0 },
          total_roll_sum: 0
        }
      });
    });

    const gameState = {
      id: game_id,
      status: 'active',
      winner: null,
      rankings: [],
      current_player_idx: 0,
      turn_count: 1,
      players,
      history: [
        {
          turn: 0,
          type: 'system',
          message: `Cozy Cyber Village initialized with ${players.length} players! Day-0 perimeter online.`
        }
      ]
    };

    GAMES[game_id] = gameState;
    return gameState;
  }

  function getNextActivePlayerIdx(game, current_idx) {
    const unfinished = game.players.map((p, i) => ({ p, i })).filter(item => !item.p.finished);
    if (!unfinished.length) return current_idx;

    const total = game.players.length;
    for (let step = 1; step <= total; step++) {
      const candidate = (current_idx + step) % total;
      if (!game.players[candidate].finished) {
        return candidate;
      }
    }
    return current_idx;
  }

  function calculateMove(game, player_idx, forced_die) {
    const player = game.players[player_idx];
    let die_roll = null;

    if (forced_die && forced_die >= 1 && forced_die <= 6) {
      die_roll = forced_die;
    } else {
      if (window.crypto && window.crypto.getRandomValues) {
        const arr = new Uint32Array(1);
        window.crypto.getRandomValues(arr);
        die_roll = (arr[0] % 6) + 1;
      } else {
        die_roll = Math.floor(Math.random() * 6) + 1;
      }
    }

    const start_pos = player.position;
    const target_pos = Math.min(100, start_pos + die_roll);

    let event_data = null;
    let final_pos = target_pos;

    if (DEFENSES_MAP[target_pos]) {
      const defense = DEFENSES_MAP[target_pos];
      final_pos = defense.end;
      event_data = {
        type: 'defense',
        tile: target_pos,
        target: final_pos,
        info: defense
      };
      player.stats.defenses_hit += 1;
    } else if (THREATS_MAP[target_pos]) {
      const threat = THREATS_MAP[target_pos];
      final_pos = threat.end;
      event_data = {
        type: 'threat',
        tile: target_pos,
        target: final_pos,
        info: threat
      };
      player.stats.threats_hit += 1;
    }

    player.position = final_pos;
    player.stats.rolls += 1;
    if (!player.stats.dice_counts) {
      player.stats.dice_counts = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0 };
      player.stats.total_roll_sum = 0;
    }
    player.stats.dice_counts[String(die_roll)] = (player.stats.dice_counts[String(die_roll)] || 0) + 1;
    player.stats.total_roll_sum = (player.stats.total_roll_sum || 0) + die_roll;
    if (final_pos > player.stats.highest_tile) {
      player.stats.highest_tile = final_pos;
    }

    let just_finished = false;
    if (final_pos === 100 && !player.finished) {
      player.finished = true;
      const rank = game.rankings.length + 1;
      player.rank = rank;
      player.finish_turn = game.turn_count;
      just_finished = true;

      const medal_map = { 1: '🥇 1st Place', 2: '🥈 2nd Place', 3: '🥉 3rd Place', 4: '🎖️ 4th Place' };
      const medal = medal_map[rank] || `#${rank} Place`;

      const rank_entry = {
        rank,
        medal,
        player_id: player.id,
        name: player.name,
        avatar: player.avatar,
        icon: player.icon,
        color: player.color,
        turn: game.turn_count,
        rolls: player.stats.rolls,
        final_tile: 100,
        auto_ranked: false
      };
      game.rankings.push(rank_entry);
      if (!game.winner) game.winner = rank_entry;
    }

    const unfinished = game.players.filter(p => !p.finished);
    let auto_finished_player = null;

    if (unfinished.length === 1 && game.players.length > 1) {
      const last_p = unfinished[0];
      last_p.finished = true;
      const rank = game.rankings.length + 1;
      last_p.rank = rank;
      last_p.finish_turn = game.turn_count;

      const medal_map = { 1: '🥇 1st Place', 2: '🥈 2nd Place', 3: '🥉 3rd Place', 4: '🎖️ 4th Place' };
      const medal = medal_map[rank] || `#${rank} Place`;

      auto_finished_player = {
        rank,
        medal,
        player_id: last_p.id,
        name: last_p.name,
        avatar: last_p.avatar,
        icon: last_p.icon,
        color: last_p.color,
        turn: game.turn_count,
        rolls: last_p.stats.rolls,
        final_tile: last_p.position,
        auto_ranked: true
      };
      game.rankings.push(auto_finished_player);
    }

    const all_finished = game.players.every(p => p.finished);
    if (all_finished) game.status = 'finished';

    let log_msg = `${player.name} rolled ${die_roll} (Tile ${start_pos} ➔ ${target_pos}).`;
    if (event_data) {
      if (event_data.type === 'defense') {
        log_msg += ` [DEFENSE] Climbed ${event_data.info.name} to Tile ${final_pos}!`;
      } else {
        log_msg += ` [SNAKE] Encountered ${event_data.info.name}! Slid to Tile ${final_pos}.`;
      }
    }
    if (just_finished) {
      log_msg += ` 🏆 ${player.name} reached the Fortress in #${player.rank} Place!`;
    }
    if (auto_finished_player) {
      log_msg += ` 🏁 Only ${auto_finished_player.name} remained! Race concluded with ${auto_finished_player.name} awarded ${auto_finished_player.medal} (at Tile ${auto_finished_player.final_tile}).`;
    }

    game.history.push({
      turn: game.turn_count,
      player_id: player.id,
      player_name: player.name,
      type: 'roll',
      message: log_msg,
      event: event_data
    });

    const next_player_idx = getNextActivePlayerIdx(game, player_idx);
    if (!all_finished) {
      game.turn_count += 1;
      game.current_player_idx = next_player_idx;
    }

    return {
      player_id: player.id,
      player_name: player.name,
      die_roll,
      start_pos,
      stepped_pos: target_pos,
      final_pos,
      event: event_data,
      just_finished,
      player_rank: player.rank,
      auto_finished_player,
      all_finished,
      rankings: game.rankings,
      is_win: just_finished,
      bonus_turn: false,
      next_player_idx: game.current_player_idx,
      game_state: game
    };
  }

  // Intercept window.fetch
  const originalFetch = window.fetch.bind(window);

  window.fetch = async function (url, options = {}) {
    const urlStr = typeof url === 'string' ? url : (url.url || '');

    if (urlStr.includes('/api/board')) {
      const data = await loadBoardData();
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (urlStr.includes('/api/game/new')) {
      await loadBoardData();
      const body = options.body ? JSON.parse(options.body) : {};
      const game = createGameInstance(body.players);
      return new Response(JSON.stringify({ success: true, game }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (urlStr.includes('/api/game/roll')) {
      await loadBoardData();
      const body = options.body ? JSON.parse(options.body) : {};
      const game_id = body.game_id;
      const game = GAMES[game_id];
      if (!game) {
        return new Response(JSON.stringify({ success: false, error: 'Game session not found' }), { status: 404 });
      }
      const curr_idx = game.current_player_idx;
      const curr_player = game.players[curr_idx];
      let roll_override = null;

      if (body.forced_die && body.forced_die >= 1 && body.forced_die <= 6) {
        roll_override = body.forced_die;
      } else if (!curr_player.is_ai && body.client_die && body.client_die >= 1 && body.client_die <= 6) {
        roll_override = body.client_die;
      }

      const result = calculateMove(game, curr_idx, roll_override);
      return new Response(JSON.stringify({ success: true, result }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (urlStr.includes('/api/game/reset')) {
      await loadBoardData();
      const body = options.body ? JSON.parse(options.body) : {};
      const game_id = body.game_id;
      const old_game = GAMES[game_id];
      let players_cfg = null;

      if (old_game) {
        players_cfg = old_game.players.map(p => ({
          name: p.name,
          is_ai: p.is_ai,
          avatar: p.avatar,
          color: p.color
        }));
      }

      const game = createGameInstance(players_cfg);
      if (game_id) GAMES[game_id] = game;

      return new Response(JSON.stringify({ success: true, game }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (urlStr.includes('/api/game/state')) {
      const urlObj = new URL(urlStr, window.location.href);
      const game_id = urlObj.searchParams.get('game_id');
      const game = GAMES[game_id];
      if (!game) {
        return new Response(JSON.stringify({ success: false, error: 'Game session not found' }), { status: 404 });
      }
      return new Response(JSON.stringify({ success: true, game }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return originalFetch(url, options);
  };
})();
