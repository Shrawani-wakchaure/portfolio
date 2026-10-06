/**
 * The Zero-Day Escape Room - Client-Side Forensic Simulation Engine
 * 100% in-browser offline simulation of Flask backend & validation logic.
 * Enables fully responsive client-side puzzle solving, timer ticking, and scoring on Vercel.
 */

(function () {
  const originalFetch = window.fetch.bind(window);

  let CASES_DATA = null;
  let PUZZLES_DATA = null;

  async function loadData() {
    if (CASES_DATA && PUZZLES_DATA) return;
    try {
      const [casesResp, puzzlesResp] = await Promise.all([
        originalFetch('./data/cases.json'),
        originalFetch('./data/puzzles.json')
      ]);
      CASES_DATA = await casesResp.json();
      PUZZLES_DATA = await puzzlesResp.json();
    } catch {
      const [casesResp, puzzlesResp] = await Promise.all([
        originalFetch('/games/zero-day-escape-room/data/cases.json'),
        originalFetch('/games/zero-day-escape-room/data/puzzles.json')
      ]);
      CASES_DATA = await casesResp.json();
      PUZZLES_DATA = await puzzlesResp.json();
    }
  }

  // Session state management
  const STORAGE_KEY = 'zeroday_escape_room_state_v1';

  function createInitialState(caseId = 'operation_cold_breach', investigatorName = 'Special Agent S.A.', startTimer = false) {
    const totalTimer = (CASES_DATA && CASES_DATA.cases && CASES_DATA.cases[caseId] && CASES_DATA.cases[caseId].default_timer_seconds) || 1200;
    return {
      active_case: caseId,
      game_started: startTimer,
      start_timestamp: startTimer ? (Date.now() / 1000) : null,
      total_timer_seconds: totalTimer,
      penalty_seconds: 0,
      current_room: 'evidence_01',
      unlocked_rooms: ['evidence_01'],
      solved_rooms: {},
      stamps: {},
      hints_unlocked: {
        evidence_01: 0,
        evidence_02: 0,
        evidence_03: 0,
        evidence_04: 0
      },
      attempts: {
        evidence_01: 0,
        evidence_02: 0,
        evidence_03: 0,
        evidence_04: 0
      },
      investigator_name: investigatorName,
      game_completed: false,
      game_over: false,
      completion_time_seconds: null,
      final_score: 0
    };
  }

  function getSavedState() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return createInitialState();
  }

  let sessionState = getSavedState();

  function saveState() {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(sessionState));
    } catch (e) {}
  }

  function calculateTimeRemaining() {
    if (!sessionState.game_started || !sessionState.start_timestamp) {
      return sessionState.total_timer_seconds || 1200;
    }
    let elapsed = 0;
    if (sessionState.game_completed && sessionState.completion_time_seconds != null) {
      elapsed = sessionState.completion_time_seconds;
    } else {
      elapsed = (Date.now() / 1000) - sessionState.start_timestamp;
    }
    const total = sessionState.total_timer_seconds || 1200;
    const penalties = sessionState.penalty_seconds || 0;
    const remaining = Math.max(0, Math.floor(total - elapsed - penalties));

    if (remaining <= 0 && !sessionState.game_completed) {
      sessionState.game_over = true;
    }
    return remaining;
  }

  function calculateScore() {
    const base_score = 1000;
    const solved_count = Object.keys(sessionState.solved_rooms || {}).length;
    const time_remaining = calculateTimeRemaining();
    const room_points = solved_count * 250;
    const time_bonus = Math.floor(Math.min(500, time_remaining * 0.5));
    const total_hints = Object.values(sessionState.hints_unlocked || {}).reduce((a, b) => a + b, 0);
    const hint_deductions = total_hints * 40;
    const total_attempts = Object.values(sessionState.attempts || {}).reduce((a, b) => a + b, 0) - solved_count;
    const attempt_deductions = Math.max(0, total_attempts) * 15;
    return Math.max(100, base_score + room_points + time_bonus - hint_deductions - attempt_deductions);
  }

  function getStateDict() {
    const remaining = calculateTimeRemaining();
    const score = calculateScore();
    const allCases = (CASES_DATA && CASES_DATA.cases) || {};
    const activeCaseMeta = allCases[sessionState.active_case] || Object.values(allCases)[0] || {};

    return {
      active_case: sessionState.active_case,
      case_metadata: activeCaseMeta,
      available_cases: allCases,
      game_started: sessionState.game_started,
      current_room: sessionState.current_room,
      unlocked_rooms: sessionState.unlocked_rooms,
      solved_rooms: sessionState.solved_rooms,
      stamps: sessionState.stamps,
      hints_unlocked: sessionState.hints_unlocked,
      attempts: sessionState.attempts,
      time_remaining_seconds: remaining,
      investigator_name: sessionState.investigator_name,
      game_completed: sessionState.game_completed,
      game_over: sessionState.game_over,
      score: score
    };
  }

  function getActivePuzzleData() {
    if (!PUZZLES_DATA) return {};
    return PUZZLES_DATA[sessionState.active_case] || PUZZLES_DATA['operation_cold_breach'] || {};
  }

  // Dynamic Case DOM Renderer
  function renderCaseDOM(caseId) {
    if (!CASES_DATA || !PUZZLES_DATA) return;
    const caseMeta = (CASES_DATA.cases && CASES_DATA.cases[caseId]) || {};
    const puzzles = PUZZLES_DATA[caseId] || {};

    // Header metadata
    const classBar = document.querySelector('.casefile-classification-bar');
    if (classBar) classBar.textContent = caseMeta.classification || '';
    const mainTitle = document.querySelector('.casefile-main-title');
    if (mainTitle) mainTitle.textContent = `CASE FILE: ${caseMeta.incident_name || ''}`;
    const archiveCode = document.querySelector('.archive-code');
    if (archiveCode) archiveCode.textContent = caseMeta.case_number || '';
    const metaValues = document.querySelectorAll('.incident-meta-grid .meta-value');
    if (metaValues.length >= 4) {
      metaValues[0].textContent = caseMeta.threat_type || '';
      metaValues[1].textContent = caseMeta.location || '';
      metaValues[2].textContent = `October 12, 1987 // ${caseMeta.compromise_timestamp || ''}`;
      metaValues[3].textContent = sessionState.investigator_name || 'Special Agent S.A.';
    }

    // Evidence 01: Log analyzer
    const ev1Obj = document.querySelector('#view-evidence_01 .objective-desc');
    if (ev1Obj && puzzles.evidence_01) ev1Obj.textContent = puzzles.evidence_01.objective || '';

    const logBody = document.getElementById('log-table-body');
    if (logBody && puzzles.evidence_01 && puzzles.evidence_01.logs) {
      logBody.innerHTML = puzzles.evidence_01.logs.map(entry => `
        <tr class="log-row" data-id="${entry.id}" data-ip="${entry.ip}">
          <td><strong>${entry.time}</strong></td>
          <td><code>${entry.ip}</code></td>
          <td><strong>${entry.method}</strong></td>
          <td><code>${entry.path}</code></td>
          <td><span class="status-badge status-${entry.status}">${entry.status}</span></td>
          <td>${entry.bytes}</td>
          <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis;">${entry.user_agent}</td>
          <td style="font-size:0.75rem; color:#6b5847;">${entry.note}</td>
        </tr>
      `).join('');
    }

    // Evidence 02: IAM Policy editor
    const ev2Obj = document.querySelector('#view-evidence_02 .objective-desc');
    if (ev2Obj && puzzles.evidence_02) ev2Obj.textContent = puzzles.evidence_02.objective || '';
    const iamEditor = document.getElementById('iam-policy-editor');
    if (iamEditor && puzzles.evidence_02) iamEditor.value = puzzles.evidence_02.default_corrupted_policy || '';

    // Evidence 03: Crypto parameters
    const ev3Obj = document.querySelector('#view-evidence_03 .objective-desc');
    if (ev3Obj && puzzles.evidence_03) ev3Obj.textContent = puzzles.evidence_03.objective || '';
    const params = (puzzles.evidence_03 && puzzles.evidence_03.parameters) || {};
    const protoSelect = document.getElementById('crypto-proto');
    if (protoSelect && params.protocol) {
      protoSelect.innerHTML = `<option value="">-- Select Protocol --</option>` +
        params.protocol.options.map(o => `<option value="${o.value}">${o.label}</option>`).join('');
    }
    const kexSelect = document.getElementById('crypto-kex');
    if (kexSelect && params.key_exchange) {
      kexSelect.innerHTML = `<option value="">-- Select Key Exchange --</option>` +
        params.key_exchange.options.map(o => `<option value="${o.value}">${o.label}</option>`).join('');
    }
    const cipherSelect = document.getElementById('crypto-cipher');
    if (cipherSelect && params.cipher) {
      cipherSelect.innerHTML = `<option value="">-- Select Cipher Suite --</option>` +
        params.cipher.options.map(o => `<option value="${o.value}">${o.label}</option>`).join('');
    }
    const macSelect = document.getElementById('crypto-mac');
    if (macSelect && params.mac) {
      macSelect.innerHTML = `<option value="">-- Select Integrity Check --</option>` +
        params.mac.options.map(o => `<option value="${o.value}">${o.label}</option>`).join('');
    }

    // Evidence 04: Vulnerable code and patches
    const ev4Obj = document.querySelector('#view-evidence_04 .objective-desc');
    if (ev4Obj && puzzles.evidence_04) ev4Obj.textContent = puzzles.evidence_04.objective || '';
    const vulnCode = document.querySelector('.vulnerable-code-box pre code');
    if (vulnCode && puzzles.evidence_04) vulnCode.textContent = puzzles.evidence_04.vulnerable_code || '';

    const patchGrid = document.querySelector('.patch-candidates-grid');
    if (patchGrid && puzzles.evidence_04 && puzzles.evidence_04.patch_options) {
      patchGrid.innerHTML = puzzles.evidence_04.patch_options.map(opt => `
        <div class="patch-candidate-card" data-patch-id="${opt.id}">
          <div class="candidate-header">
            <span class="candidate-title">${opt.title}</span>
            <span style="font-size:0.72rem; color:#6e5843; font-style:italic;">Click to select candidate</span>
          </div>
          <div class="candidate-code">
            <pre><code>${opt.code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
          </div>
        </div>
      `).join('');
    }
  }

  // Intercept Fetch API
  window.fetch = async function (url, options = {}) {
    await loadData();
    const urlStr = typeof url === 'string' ? url : url.url || '';

    // 1. GET /api/cases
    if (urlStr.includes('/api/cases')) {
      return new Response(JSON.stringify((CASES_DATA && CASES_DATA.cases) || {}), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 2. GET /api/state
    if (urlStr.includes('/api/state')) {
      return new Response(JSON.stringify(getStateDict()), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 3. POST /api/select_case
    if (urlStr.includes('/api/select_case')) {
      const body = options.body ? JSON.parse(options.body) : {};
      const caseId = body.case_id || 'operation_cold_breach';
      const callsign = (body.investigator_name || '').trim() || sessionState.investigator_name || 'Special Agent S.A.';
      const startTimer = body.start_game !== false;

      sessionState = createInitialState(caseId, callsign, startTimer);
      saveState();

      renderCaseDOM(caseId);

      return new Response(JSON.stringify({
        status: 'success',
        message: `Escape Room unsealed: ${caseId}`,
        state: getStateDict()
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // 4. POST /api/start
    if (urlStr.includes('/api/start')) {
      const body = options.body ? JSON.parse(options.body) : {};
      const callsign = (body.investigator_name || '').trim() || sessionState.investigator_name || 'Special Agent S.A.';
      const caseId = body.case_id || sessionState.active_case || 'operation_cold_breach';

      sessionState = createInitialState(caseId, callsign, true);
      saveState();

      return new Response(JSON.stringify({
        status: 'success',
        message: 'Cold Case Archive unsealed. Timer ticking.',
        state: getStateDict()
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // 5. POST /api/reset
    if (urlStr.includes('/api/reset')) {
      sessionState = createInitialState(sessionState.active_case, sessionState.investigator_name, true);
      saveState();

      return new Response(JSON.stringify({
        status: 'success',
        message: 'Case file reset to initial state.',
        state: getStateDict()
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // 6. POST /api/select_room
    if (urlStr.includes('/api/select_room')) {
      const body = options.body ? JSON.parse(options.body) : {};
      const roomId = body.room_id;
      if (sessionState.unlocked_rooms.includes(roomId)) {
        sessionState.current_room = roomId;
        saveState();
        return new Response(JSON.stringify({ status: 'success', current_room: roomId }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      return new Response(JSON.stringify({ status: 'error', message: 'Evidence file is still locked or classified.' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 7. GET / POST /api/hint/:evidence_id
    if (urlStr.includes('/api/hint/')) {
      const parts = urlStr.split('/api/hint/');
      const evidenceId = parts[1].split('?')[0];
      const puzzles = getActivePuzzleData();
      const puzzle = puzzles[evidenceId];
      if (!puzzle) {
        return new Response(JSON.stringify({ status: 'error', message: 'Invalid evidence ID' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const hints = puzzle.hints || [];
      const currentCount = sessionState.hints_unlocked[evidenceId] || 0;

      if ((options.method || 'GET').toUpperCase() === 'GET') {
        return new Response(JSON.stringify({
          status: 'success',
          hints_revealed: hints.slice(0, currentCount),
          total_revealed: currentCount,
          total_available: hints.length,
          time_remaining_seconds: calculateTimeRemaining()
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }

      // POST request
      if (currentCount >= hints.length) {
        return new Response(JSON.stringify({
          status: 'no_more_hints',
          message: 'All available field notes for this evidence have already been unsealed.',
          hints: hints,
          hints_revealed: hints,
          total_revealed: hints.length,
          total_available: hints.length
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }

      sessionState.penalty_seconds = (sessionState.penalty_seconds || 0) + 30;
      sessionState.hints_unlocked[evidenceId] = currentCount + 1;
      saveState();

      return new Response(JSON.stringify({
        status: 'success',
        hint: hints[currentCount],
        hints_revealed: hints.slice(0, currentCount + 1),
        total_revealed: currentCount + 1,
        total_available: hints.length,
        penalty_applied: 30,
        time_remaining_seconds: calculateTimeRemaining()
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // 8. POST /api/validate/evidence_01
    if (urlStr.includes('/api/validate/evidence_01')) {
      sessionState.attempts.evidence_01 = (sessionState.attempts.evidence_01 || 0) + 1;
      const body = options.body ? JSON.parse(options.body) : {};
      const submittedIp = String(body.ip || '').trim();
      const puzzles = getActivePuzzleData();
      const puzzle = puzzles.evidence_01 || {};
      const targetIp = puzzle.anomalous_ip;

      if (submittedIp === targetIp) {
        const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
        sessionState.solved_rooms.evidence_01 = nowStr;
        sessionState.stamps.evidence_01 = {
          text: puzzle.stamp_text || 'IP ISOLATED & QUARANTINED',
          date: nowStr,
          target: targetIp
        };
        if (!sessionState.unlocked_rooms.includes('evidence_02')) {
          sessionState.unlocked_rooms.push('evidence_02');
        }
        saveState();

        return new Response(JSON.stringify({
          status: 'success',
          message: puzzle.success_message || 'IP Isolated successfully.',
          stamp: sessionState.stamps.evidence_01,
          next_room: 'evidence_02',
          state: getStateDict()
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      } else {
        sessionState.penalty_seconds = (sessionState.penalty_seconds || 0) + 15;
        saveState();
        return new Response(JSON.stringify({
          status: 'incorrect',
          message: `IP '${submittedIp}' is legitimate internal infrastructure or a benign crawler. Scrutinize the access logs for unauthorized intrusion attempts.`,
          penalty_applied: 15,
          state: getStateDict()
        }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }
    }

    // 9. POST /api/validate/evidence_02
    if (urlStr.includes('/api/validate/evidence_02')) {
      sessionState.attempts.evidence_02 = (sessionState.attempts.evidence_02 || 0) + 1;
      const body = options.body ? JSON.parse(options.body) : {};
      const policyRaw = body.policy_json;
      const principal = body.principal;
      const actions = body.actions;
      const resource = body.resource;
      const activeCase = sessionState.active_case || 'operation_cold_breach';
      const puzzles = getActivePuzzleData();
      const puzzle = puzzles.evidence_02 || {};

      const errors = [];

      if (activeCase === 'operation_cold_breach') {
        let parsedStatement = null;
        if (policyRaw) {
          try {
            const policyDict = JSON.parse(policyRaw);
            const statements = policyDict.Statement || [];
            if (Array.isArray(statements) && statements.length > 0) {
              parsedStatement = statements[0];
            } else if (typeof statements === 'object') {
              parsedStatement = statements;
            }
          } catch (e) {
            return new Response(JSON.stringify({ status: 'error', message: `JSON syntax error: ${e.message}` }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' }
            });
          }
        }

        const pVal = (parsedStatement && parsedStatement.Principal) || principal;
        const aVal = (parsedStatement && parsedStatement.Action) || actions;
        const rVal = (parsedStatement && parsedStatement.Resource) || resource;

        const pStr = typeof pVal === 'object' ? JSON.stringify(pVal) : String(pVal || '');
        if (!pVal || pVal === '*' || pStr.includes('"*"')) {
          errors.push("Principal is set to wildcard '*' — exposes storage to the entire Internet.");
        } else if (!pStr.includes('ForensicsOfficer')) {
          errors.push("Principal must assign access to the authorized 'ForensicsOfficer' role.");
        }

        const aStr = typeof aVal === 'object' ? JSON.stringify(aVal) : String(aVal || '');
        if (!aVal || aVal === '*' || aStr.includes('"*"') || aStr.includes('AdministratorAccess')) {
          errors.push("Action contains unrestricted wildcard '*' or full AdministratorAccess.");
        } else if (!aStr.includes('s3:GetObject') && !aStr.includes('s3:List')) {
          errors.push("Action must enforce least-privilege read-only S3 actions.");
        }

        const rStr = typeof rVal === 'object' ? JSON.stringify(rVal) : String(rVal || '');
        if (!rVal || rVal === '*' || (rStr.includes('"*"') && !rStr.includes('case-files-archive'))) {
          errors.push("Resource targets wildcard '*' across all buckets.");
        } else if (!rStr.includes('case-files-archive')) {
          errors.push("Resource must be scoped to 'arn:aws:s3:::case-files-archive/*'.");
        }
      } else if (activeCase === 'phantom_cipher') {
        let pDict = body;
        if (policyRaw) {
          try { pDict = JSON.parse(policyRaw); } catch (e) {
            return new Response(JSON.stringify({ status: 'error', message: `JSON syntax error: ${e.message}` }), { status: 400 });
          }
        }
        const algs = pDict.AllowedAlgorithms || [];
        const reqSig = pDict.RequireSignature;
        const aud = pDict.Audience;

        if (algs.includes('none')) errors.push("AllowedAlgorithms contains 'none' — critical vulnerability allowing forged signatures!");
        if (!algs.includes('RS256')) errors.push("AllowedAlgorithms must enforce asymmetric cryptographic signature 'RS256'.");
        if (reqSig !== true) errors.push("RequireSignature must be set to true.");
        if (aud === '*' || !aud || !String(aud).includes('scada')) errors.push("Audience must be scoped to 'scada-telemetry-gateway'.");
      } else if (activeCase === 'black_ice') {
        let pDict = body;
        if (policyRaw) {
          try { pDict = JSON.parse(policyRaw); } catch (e) {
            return new Response(JSON.stringify({ status: 'error', message: `JSON syntax error: ${e.message}` }), { status: 400 });
          }
        }
        if (pDict.SuperUser === true) errors.push("SuperUser privilege must be revoked (false).");
        if (pDict.CreateDB === true) errors.push("CreateDB privilege must be revoked (false).");
        const perms = String(pDict.GrantedPermissions || []);
        if (perms.includes('ALL PRIVILEGES')) errors.push("GrantedPermissions contains excessive 'ALL PRIVILEGES'. Restrict to ['SELECT', 'INSERT'].");
        const tables = String(pDict.TargetTables || []);
        if (tables.includes('*')) errors.push("TargetTables targets wildcard '*'. Restrict to ['vault_transactions'].");
      }

      if (errors.length > 0) {
        sessionState.penalty_seconds = (sessionState.penalty_seconds || 0) + 15;
        saveState();
        return new Response(JSON.stringify({
          status: 'incorrect',
          message: 'Policy Compliance Audit Failed:\n- ' + errors.join('\n- '),
          penalty_applied: 15,
          state: getStateDict()
        }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }

      const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
      sessionState.solved_rooms.evidence_02 = nowStr;
      sessionState.stamps.evidence_02 = {
        text: puzzle.stamp_text || 'COMPLIANCE CERTIFIED',
        date: nowStr
      };
      if (!sessionState.unlocked_rooms.includes('evidence_03')) {
        sessionState.unlocked_rooms.push('evidence_03');
      }
      saveState();

      return new Response(JSON.stringify({
        status: 'success',
        message: puzzle.success_message || 'Policy hardened successfully!',
        stamp: sessionState.stamps.evidence_02,
        next_room: 'evidence_03',
        state: getStateDict()
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // 10. POST /api/validate/evidence_03
    if (urlStr.includes('/api/validate/evidence_03')) {
      sessionState.attempts.evidence_03 = (sessionState.attempts.evidence_03 || 0) + 1;
      const body = options.body ? JSON.parse(options.body) : {};
      const protocol = body.protocol;
      const keyExchange = body.key_exchange;
      const cipher = body.cipher;
      const mac = body.mac;

      const puzzles = getActivePuzzleData();
      const puzzle = puzzles.evidence_03 || {};
      const params = puzzle.parameters || {};

      const errors = [];
      if (protocol !== (params.protocol && params.protocol.correct)) errors.push("Protocol is insecure or deprecated. Downgrade vulnerability detected.");
      if (keyExchange !== (params.key_exchange && params.key_exchange.correct)) errors.push("Key exchange lacks Perfect Forward Secrecy (PFS) or is unauthenticated.");
      if (cipher !== (params.cipher && params.cipher.correct)) errors.push("Cipher suite is vulnerable to padding oracle attacks or weak block ciphers.");
      if (mac !== (params.mac && params.mac.correct)) errors.push("Integrity hash algorithm suffers from known cryptographic collision exploits.");

      if (errors.length > 0) {
        sessionState.penalty_seconds = (sessionState.penalty_seconds || 0) + 15;
        saveState();
        return new Response(JSON.stringify({
          status: 'incorrect',
          message: 'Cryptographic Handshake Failed:\n- ' + errors.join('\n- '),
          penalty_applied: 15,
          state: getStateDict()
        }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }

      const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
      sessionState.solved_rooms.evidence_03 = nowStr;
      sessionState.stamps.evidence_03 = {
        text: puzzle.stamp_text || 'TUNNEL DECRYPTED',
        date: nowStr
      };
      if (!sessionState.unlocked_rooms.includes('evidence_04')) {
        sessionState.unlocked_rooms.push('evidence_04');
      }
      saveState();

      return new Response(JSON.stringify({
        status: 'success',
        message: puzzle.success_message || 'Decrypted C2 payload intercepted!',
        decrypted_payload: puzzle.decrypted_payload,
        stamp: sessionState.stamps.evidence_03,
        next_room: 'evidence_04',
        state: getStateDict()
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // 11. POST /api/validate/evidence_04
    if (urlStr.includes('/api/validate/evidence_04')) {
      sessionState.attempts.evidence_04 = (sessionState.attempts.evidence_04 || 0) + 1;
      const body = options.body ? JSON.parse(options.body) : {};
      const patchId = body.patch_id;
      const codeText = body.code || '';

      const puzzles = getActivePuzzleData();
      const puzzle = puzzles.evidence_04 || {};

      let isSecure = false;
      let flawReason = '';

      if (patchId) {
        for (const opt of (puzzle.patch_options || [])) {
          if (opt.id === patchId) {
            if (opt.secure) isSecure = true;
            else flawReason = opt.flaw || 'Insecure patch vector.';
            break;
          }
        }
      } else if (codeText) {
        if (codeText.includes('os.system') || codeText.includes('shell=True') || codeText.includes('pickle.loads')) {
          flawReason = 'Code retains insecure execution patterns.';
        } else {
          isSecure = true;
        }
      }

      if (!isSecure) {
        sessionState.penalty_seconds = (sessionState.penalty_seconds || 0) + 20;
        saveState();
        return new Response(JSON.stringify({
          status: 'incorrect',
          message: `Exploit Regression Test Failed! ${flawReason}`,
          test_results: [{ payload: 'Attacker Exploit Vector', status: 'EXPLOITED (Vulnerability Re-Triggered)' }],
          penalty_applied: 20,
          state: getStateDict()
        }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }

      const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
      sessionState.solved_rooms.evidence_04 = nowStr;
      sessionState.stamps.evidence_04 = {
        text: puzzle.stamp_text || 'CASE FILE RESOLVED',
        date: nowStr
      };

      sessionState.game_completed = true;
      sessionState.completion_time_seconds = Math.floor((Date.now() / 1000) - (sessionState.start_timestamp || Date.now() / 1000));
      sessionState.final_score = calculateScore();
      saveState();

      const testResults = (puzzle.test_payloads || []).map(p => ({
        payload: p.input,
        status: p.expected_allow ? 'ALLOWED (Execution Validated)' : 'BLOCKED (Exploit Defused)'
      }));

      return new Response(JSON.stringify({
        status: 'success',
        message: puzzle.success_message || 'Zero-day vulnerability patched! Attacker locked out.',
        test_results: testResults,
        stamp: sessionState.stamps.evidence_04,
        game_completed: true,
        score: sessionState.final_score,
        state: getStateDict()
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    return originalFetch(url, options);
  };

  // Exit & Navigation helpers
  function exitToConsole() {
    window.parent.postMessage({ type: 'CLOSE_COZY_GAME' }, '*');
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      exitToConsole();
    }
  });

  window.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    if (sessionState.active_case && sessionState.active_case !== 'operation_cold_breach') {
      renderCaseDOM(sessionState.active_case);
    }

    // Add Exit Button to Header Desk Controls
    const deskActions = document.querySelector('.desk-actions');
    const exitBtn = document.createElement('button');
    exitBtn.id = 'btn-exit-to-console';
    exitBtn.className = 'brass-btn highlight';
    exitBtn.innerHTML = '✕ EXIT [ESC]';
    exitBtn.title = 'Return to video game console';
    exitBtn.onclick = exitToConsole;

    if (deskActions) {
      deskActions.insertBefore(exitBtn, deskActions.firstChild);
    } else {
      exitBtn.style.cssText = `
        position: fixed;
        top: 12px;
        right: 16px;
        z-index: 99999;
        background: #942921;
        color: #fff;
        border: 2px solid #5a1914;
        padding: 6px 14px;
        font-family: var(--font-mono, monospace);
        font-weight: bold;
        cursor: pointer;
      `;
      document.body.appendChild(exitBtn);
    }
  });
})();
