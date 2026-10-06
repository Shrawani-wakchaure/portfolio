/**
 * Quiet Audit - Game Client Engine
 * Handles scenario loading, real-time status meters, branching choices,
 * remediation loops, companion dialogues, and auditor evaluations.
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements - Navigation & Sound
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  const soundIcon = document.getElementById('soundIcon');
  const navHomeBtn = document.getElementById('navHomeBtn');
  const headerStartBtn = document.getElementById('headerStartBtn');
  const heroStartJourneyBtn = document.getElementById('heroStartJourneyBtn');
  const heroMeetBarnabyBtn = document.getElementById('heroMeetBarnabyBtn');
  const backToSelectionBtn = document.getElementById('backToSelectionBtn');

  // DOM Elements - Views
  const selectionSection = document.getElementById('selectionSection');
  const crisisDashboard = document.getElementById('crisisDashboard');
  const scenariosGrid = document.getElementById('scenariosGrid');

  // DOM Elements - Meters
  const valAudit = document.getElementById('valAudit');
  const valTrust = document.getElementById('valTrust');
  const valBudget = document.getElementById('valBudget');
  const fillAudit = document.getElementById('fillAudit');
  const fillTrust = document.getElementById('fillTrust');
  const fillBudget = document.getElementById('fillBudget');
  const deltaAudit = document.getElementById('deltaAudit');
  const deltaTrust = document.getElementById('deltaTrust');
  const deltaBudget = document.getElementById('deltaBudget');
  const activeFrameworkTag = document.getElementById('activeFrameworkTag');
  const activeScenarioBreadcrumb = document.getElementById('activeScenarioBreadcrumb');

  // DOM Elements - Crisis Stage
  const phaseTag = document.getElementById('phaseTag');
  const phaseTitle = document.getElementById('phaseTitle');
  const phaseStory = document.getElementById('phaseStory');
  const choicesList = document.getElementById('choicesList');
  const standardChoicesSection = document.getElementById('standardChoicesSection');
  const remediationBanner = document.getElementById('remediationBanner');
  const remediationSituation = document.getElementById('remediationSituation');
  const remediationChoicesList = document.getElementById('remediationChoicesList');
  const consequenceBox = document.getElementById('consequenceBox');
  const consequenceBadge = document.getElementById('consequenceBadge');
  const consequenceText = document.getElementById('consequenceText');
  const consequenceNextBtn = document.getElementById('consequenceNextBtn');

  // DOM Elements - Companion
  const companionAvatar = document.getElementById('companionAvatar');
  const companionSpeechText = document.getElementById('companionSpeechText');
  const askAdviceBtn = document.getElementById('askAdviceBtn');

  // DOM Elements - Modals
  const briefingDialog = document.getElementById('briefingDialog');
  const briefingTitle = document.getElementById('briefingTitle');
  const briefingUrgency = document.getElementById('briefingUrgency');
  const briefingBody = document.getElementById('briefingBody');
  const briefingStartBtn = document.getElementById('briefingStartBtn');
  const briefingCancelBtn = document.getElementById('briefingCancelBtn');
  const briefingAvatar = document.getElementById('briefingAvatar');

  const reportDialog = document.getElementById('reportDialog');
  const reportGrade = document.getElementById('reportGrade');
  const reportScenarioTitle = document.getElementById('reportScenarioTitle');
  const reportVerdict = document.getElementById('reportVerdict');
  const reportAudit = document.getElementById('reportAudit');
  const reportTrust = document.getElementById('reportTrust');
  const reportBudget = document.getElementById('reportBudget');
  const reportFeedback = document.getElementById('reportFeedback');
  const reportTakeaway = document.getElementById('reportTakeaway');
  const reportRetryBtn = document.getElementById('reportRetryBtn');
  const reportNextBtn = document.getElementById('reportNextBtn');

  // Game Engine State
  let allScenarios = [];
  let currentScenario = null;
  let currentPhase = null;
  let pendingNextPhase = null;
  let isPendingConclusion = false;
  let pendingReportCard = null;
  let currentParentChoiceId = null;
  let typewriterTimeout = null;

  let gameState = {
    audit_readiness: 70,
    company_trust: 80,
    budget: 75000
  };

  // Avatar Image Map
  const avatarMap = {
    neutral: './static/images/barnaby_neutral.svg',
    alert: './static/images/barnaby_alert.svg',
    happy: './static/images/barnaby_happy.svg',
    detective: './static/images/barnaby_detective.svg'
  };

  // Sound Toggle Init
  function updateSoundUI() {
    if (window.audioManager.isMuted) {
      soundIcon.textContent = '🔇';
      soundToggleBtn.title = 'Sound Muted (Click to Unmute)';
    } else {
      soundIcon.textContent = '🔊';
      soundToggleBtn.title = 'Sound Enabled (Click to Mute)';
    }
  }
  updateSoundUI();

  soundToggleBtn.addEventListener('click', () => {
    window.audioManager.toggleMute();
    updateSoundUI();
    window.audioManager.playClick();
  });

  // Typewriter Speech Animation with soft retro blips
  function typeWriter(text, mood = 'neutral', onComplete = null) {
    if (typewriterTimeout) {
      clearTimeout(typewriterTimeout);
    }
    
    // Set Barnaby avatar
    setCompanionMood(mood);

    companionSpeechText.textContent = '';
    let i = 0;
    const speed = 20; // ms per char

    function tick() {
      if (i < text.length) {
        companionSpeechText.textContent += text.charAt(i);
        // Play soft blip on every 3rd character and punctuation
        if (i % 3 === 0 && !window.audioManager.isMuted) {
          window.audioManager.playBlip(mood === 'alert' ? 560 : 440);
        }
        i++;
        typewriterTimeout = setTimeout(tick, speed);
      } else {
        if (onComplete) onComplete();
      }
    }
    tick();
  }

  // Click to finish typewriter speech instantly
  companionSpeechText.parentElement.addEventListener('click', () => {
    if (typewriterTimeout) {
      clearTimeout(typewriterTimeout);
      typewriterTimeout = null;
    }
  });

  function setCompanionMood(mood) {
    const src = avatarMap[mood] || avatarMap.neutral;
    companionAvatar.src = src;
  }

  // Fetch Scenarios on Load
  async function loadScenarios() {
    try {
      const res = await fetch('/api/scenarios');
      const data = await res.json();
      allScenarios = data.scenarios || [];
      renderScenariosGrid(allScenarios);
    } catch (err) {
      console.error('Failed to load scenarios:', err);
    }
  }

  // Render Case File Cards
  function renderScenariosGrid(scenarios) {
    scenariosGrid.innerHTML = '';
    scenarios.forEach(sc => {
      const card = document.createElement('div');
      card.className = 'scenario-card';

      let diffClass = 'diff-moderate';
      if (sc.difficulty === 'Challenging') diffClass = 'diff-challenging';
      if (sc.difficulty === 'Expert') diffClass = 'diff-expert';

      card.innerHTML = `
        <div>
          <div class="scenario-badge-row">
            <span class="chapter-tag">Chapter ${sc.chapter}</span>
            <span class="difficulty-tag ${diffClass}">${sc.difficulty}</span>
          </div>
          <h3 class="scenario-title">${sc.title}</h3>
          <div class="scenario-subtitle">${sc.subtitle}</div>
          <p class="scenario-desc">${sc.summary}</p>
        </div>
        <div>
          <div class="scenario-meta">
            <div><strong>Framework:</strong> ${sc.compliance_framework}</div>
            <div><strong>Category:</strong> ${sc.category}</div>
          </div>
          <div class="scenario-card-actions">
            <button class="btn btn-coral select-scenario-btn" data-id="${sc.id}">Open Case File &rarr;</button>
          </div>
        </div>
      `;

      card.querySelector('.select-scenario-btn').addEventListener('click', () => {
        window.audioManager.playClick();
        openBriefing(sc.id);
      });

      scenariosGrid.appendChild(card);
    });
  }

  // Open Briefing Modal
  async function openBriefing(scenarioId) {
    try {
      const res = await fetch(`/api/scenario/${scenarioId}`);
      currentScenario = await res.json();

      briefingTitle.textContent = currentScenario.title;
      briefingUrgency.textContent = currentScenario.briefing.urgency || 'CRITICAL';
      briefingAvatar.src = avatarMap.alert;

      briefingBody.innerHTML = `
        <p style="margin-bottom: 0.9rem;"><strong>Context:</strong> ${currentScenario.briefing.context}</p>
        <p style="font-style: italic; color: var(--text-secondary); border-top: 1px dashed var(--border-light); padding-top: 0.75rem;">
          "${currentScenario.briefing.companion_intro}"
        </p>
      `;

      if (typeof briefingDialog.showModal === 'function') {
        briefingDialog.showModal();
      } else {
        briefingDialog.setAttribute('open', '');
      }
    } catch (err) {
      console.error('Error fetching scenario briefing:', err);
    }
  }

  // Start Crisis from Briefing Modal
  briefingStartBtn.addEventListener('click', () => {
    window.audioManager.playClick();
    if (briefingDialog.close) briefingDialog.close();
    else briefingDialog.removeAttribute('open');

    startCrisis(currentScenario);
  });

  briefingCancelBtn.addEventListener('click', () => {
    window.audioManager.playClick();
    if (briefingDialog.close) briefingDialog.close();
    else briefingDialog.removeAttribute('open');
  });

  // Switch to Crisis Dashboard View
  function startCrisis(scenario) {
    selectionSection.style.display = 'none';
    crisisDashboard.style.display = 'flex';
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Set initial metrics
    gameState = {
      audit_readiness: scenario.briefing.initial_state.audit_readiness || 70,
      company_trust: scenario.briefing.initial_state.company_trust || 80,
      budget: scenario.briefing.initial_state.budget || 75000
    };

    activeScenarioBreadcrumb.textContent = `Chapter ${scenario.chapter}: ${scenario.title}`;
    activeFrameworkTag.textContent = scenario.compliance_framework.split('(')[0].trim();

    updateMeters(gameState, null);

    // Initial phase
    currentPhase = scenario.phases.phase_1;
    loadPhase(currentPhase);

    // Initial companion greeting
    typeWriter(
      scenario.briefing.companion_intro || "Review the telemetry before taking action!",
      currentPhase.companion_mood || 'alert'
    );
  }

  // Load a Phase into UI
  function loadPhase(phase) {
    currentPhase = phase;
    pendingNextPhase = null;
    currentParentChoiceId = null;

    // Reset banners and outcome box
    consequenceBox.style.display = 'none';
    remediationBanner.style.display = 'none';
    standardChoicesSection.style.display = 'block';

    phaseTag.textContent = phase.title.split(':')[0] || 'Crisis Stage';
    phaseTitle.textContent = phase.title;
    phaseStory.textContent = phase.story;

    // Render Choices
    choicesList.innerHTML = '';
    phase.choices.forEach(ch => {
      const btn = document.createElement('button');
      btn.className = 'choice-card-btn';
      btn.innerHTML = `
        <div class="choice-title">
          <span>${ch.title}</span>
          <span style="font-size: 0.85rem; color: var(--text-muted);">&rarr;</span>
        </div>
        <div class="choice-desc">${ch.description}</div>
      `;

      btn.addEventListener('click', () => {
        handleChoice(ch);
      });

      choicesList.appendChild(btn);
    });

    // Companion advice for phase
    if (phase.companion_tip) {
      typeWriter(phase.companion_tip, phase.companion_mood || 'detective');
    }
  }

  // Handle a Standard Choice
  async function handleChoice(choice) {
    window.audioManager.playClick();

    // Disable choice buttons during request
    const buttons = choicesList.querySelectorAll('button');
    buttons.forEach(b => b.disabled = true);

    try {
      const res = await fetch('/api/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario_id: currentScenario.id,
          current_phase_id: currentPhase.phase_id,
          choice_id: choice.id,
          is_remediation: false,
          current_state: gameState
        })
      });

      const data = await res.json();
      if (!data.success) {
        alert(data.error || 'Action failed');
        buttons.forEach(b => b.disabled = false);
        return;
      }

      // Update game state
      gameState = data.new_state;
      updateMeters(gameState, data.deltas);

      // Play audio based on outcome
      if (data.triggers_remediation) {
        window.audioManager.playAlert();
      } else {
        window.audioManager.playSuccess();
      }

      // Update Companion Reaction
      typeWriter(data.companion_reaction, data.companion_mood || 'neutral');

      // Check if Backlash / Remediation loop triggered
      if (data.triggers_remediation && data.remediation) {
        currentParentChoiceId = data.remediation.parent_choice_id;
        showRemediationLoop(data.remediation, data.consequence);
      } else {
        // Show Standard Consequence
        showConsequence(choice.type, data.consequence, data.next_phase_data, data.is_conclusion, data.report_card);
      }

    } catch (err) {
      console.error('Error submitting action:', err);
      buttons.forEach(b => b.disabled = false);
    }
  }

  // Show Backlash & Remediation Loop
  function showRemediationLoop(remediationData, initialConsequence) {
    standardChoicesSection.style.display = 'none';
    remediationBanner.style.display = 'block';

    remediationSituation.innerHTML = `
      <div style="margin-bottom: 0.6rem;"><strong>Immediate Fallout:</strong> ${initialConsequence}</div>
      <div><strong>Remediation Objective:</strong> ${remediationData.situation}</div>
    `;

    remediationChoicesList.innerHTML = '';
    remediationData.remediation_choices.forEach(rChoice => {
      const btn = document.createElement('button');
      btn.className = 'choice-card-btn rem-choice';
      btn.innerHTML = `
        <div class="choice-title">
          <span>🛠️ ${rChoice.title}</span>
          <span style="font-size: 0.85rem; color: var(--alert-red);">&rarr;</span>
        </div>
        <div class="choice-desc">${rChoice.description}</div>
      `;

      btn.addEventListener('click', () => {
        handleRemediationChoice(rChoice);
      });

      remediationChoicesList.appendChild(btn);
    });

    window.scrollTo({ top: remediationBanner.offsetTop - 80, behavior: 'smooth' });
  }

  // Handle a Remediation Choice
  async function handleRemediationChoice(rChoice) {
    window.audioManager.playClick();

    const buttons = remediationChoicesList.querySelectorAll('button');
    buttons.forEach(b => b.disabled = true);

    try {
      const res = await fetch('/api/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario_id: currentScenario.id,
          current_phase_id: currentPhase.phase_id,
          parent_choice_id: currentParentChoiceId,
          choice_id: rChoice.id,
          is_remediation: true,
          current_state: gameState
        })
      });

      const data = await res.json();
      if (!data.success) {
        alert(data.error || 'Remediation failed');
        buttons.forEach(b => b.disabled = false);
        return;
      }

      gameState = data.new_state;
      updateMeters(gameState, data.deltas);
      window.audioManager.playSuccess();

      typeWriter(data.companion_reaction, data.companion_mood || 'detective');

      remediationBanner.style.display = 'none';
      showConsequence('good', data.consequence, data.next_phase_data, data.is_conclusion, data.report_card);

    } catch (err) {
      console.error('Error submitting remediation:', err);
      buttons.forEach(b => b.disabled = false);
    }
  }

  // Show Consequence Card
  function showConsequence(type, text, nextPhaseData, isConclusion, reportCard) {
    consequenceBox.style.display = 'block';
    consequenceText.textContent = text;

    consequenceBadge.className = 'consequence-badge ' + (type || 'good');
    if (type === 'good') consequenceBadge.textContent = 'Effective Containment';
    else if (type === 'bad') consequenceBadge.textContent = 'Remediated Breach';
    else consequenceBadge.textContent = 'Observation Noted';

    pendingNextPhase = nextPhaseData;
    isPendingConclusion = isConclusion;
    pendingReportCard = reportCard;

    if (isConclusion) {
      consequenceNextBtn.textContent = 'View Official Auditor Report Card \u2192';
    } else {
      consequenceNextBtn.textContent = 'Continue to Next Phase \u2192';
    }

    window.scrollTo({ top: consequenceBox.offsetTop - 80, behavior: 'smooth' });
  }

  // Advance to Next Phase or Open Report Card
  consequenceNextBtn.addEventListener('click', () => {
    window.audioManager.playClick();
    if (isPendingConclusion && pendingReportCard) {
      openReportCard(pendingReportCard);
    } else if (pendingNextPhase) {
      loadPhase(pendingNextPhase);
    }
  });

  // Open Auditor Report Card Modal
  function openReportCard(report) {
    window.audioManager.playFanfare();

    reportGrade.textContent = report.grade;
    reportVerdict.textContent = report.verdict;
    reportAudit.textContent = `${gameState.audit_readiness}%`;
    reportTrust.textContent = `${gameState.company_trust}%`;
    reportBudget.textContent = `$${gameState.budget.toLocaleString()}`;
    reportFeedback.textContent = report.feedback;
    reportTakeaway.innerHTML = `<strong>Key GRC Takeaway:</strong> ${report.takeaway || ''}`;

    // Color grade
    if (report.grade.startsWith('A')) {
      reportGrade.style.borderColor = 'var(--audit-green)';
      reportGrade.style.color = 'var(--audit-green)';
    } else if (report.grade === 'B') {
      reportGrade.style.borderColor = 'var(--trust-blue)';
      reportGrade.style.color = 'var(--trust-blue)';
    } else {
      reportGrade.style.borderColor = 'var(--alert-red)';
      reportGrade.style.color = 'var(--alert-red)';
    }

    if (typeof reportDialog.showModal === 'function') {
      reportDialog.showModal();
    } else {
      reportDialog.setAttribute('open', '');
    }
  }

  // DOM Elements - About, Barnaby Intro & Chat with Barnaby
  const navCasesLink = document.getElementById('navCasesLink');
  const navAboutLink = document.getElementById('navAboutLink');
  const navBarnabyLink = document.getElementById('navBarnabyLink');
  const navChatLink = document.getElementById('navChatLink');
  const floatingChatTrigger = document.getElementById('floatingChatTrigger');
  const barnabyIntroDialog = document.getElementById('barnabyIntroDialog');
  const introBarnabyAvatar = document.getElementById('introBarnabyAvatar');
  const introBarnabyQuote = document.getElementById('introBarnabyQuote');
  const closeBarnabyIntroBtn = document.getElementById('closeBarnabyIntroBtn');
  const ambientParticles = document.getElementById('ambientParticles');

  // DOM Elements - Chat Console
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const chatMessages = document.getElementById('chatMessages');
  const chatBarnabyAvatar = document.getElementById('chatBarnabyAvatar');
  const clearChatBtn = document.getElementById('clearChatBtn');
  const quickPromptsList = document.getElementById('quickPromptsList');

  // Navigation Links Handling
  if (navCasesLink) {
    navCasesLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.audioManager.playClick();
      updateActiveNav(navCasesLink);
      document.getElementById('caseFiles').scrollIntoView({ behavior: 'smooth' });
    });
  }

  if (navChatLink) {
    navChatLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.audioManager.playClick();
      updateActiveNav(navChatLink);
      const chatEl = document.getElementById('chat');
      if (chatEl) {
        chatEl.scrollIntoView({ behavior: 'smooth' });
        if (chatInput) chatInput.focus();
      }
    });
  }

  if (floatingChatTrigger) {
    floatingChatTrigger.addEventListener('click', () => {
      window.audioManager.playClick();
      updateActiveNav(navChatLink);
      const chatEl = document.getElementById('chat');
      if (chatEl) {
        chatEl.scrollIntoView({ behavior: 'smooth' });
        if (chatInput) chatInput.focus();
      }
    });
  }

  if (navAboutLink) {
    navAboutLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.audioManager.playClick();
      updateActiveNav(navAboutLink);
      const aboutEl = document.getElementById('about');
      if (aboutEl) {
        aboutEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  function updateActiveNav(activeLink) {
    [navCasesLink, navChatLink, navAboutLink, navBarnabyLink].forEach(l => {
      if (l) l.classList.remove('active');
    });
    if (activeLink) activeLink.classList.add('active');
  }

  // =========================================================
  // CHAT WITH BARNABY ENGINE
  // =========================================================

  function appendChatMessage(sender, text, mood = 'neutral') {
    if (!chatMessages) return;
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-msg ${sender}-msg`;

    const avatarSrc = sender === 'user' 
      ? 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><text y="24" font-size="24">🧑‍💻</text></svg>'
      : (avatarMap[mood] || avatarMap.neutral);

    const senderName = sender === 'user' ? 'You' : 'Barnaby';

    msgDiv.innerHTML = `
      <div class="msg-avatar">
        <img src="${avatarSrc}" alt="${senderName}">
      </div>
      <div class="msg-bubble">
        <div class="msg-sender">${senderName}</div>
        <div class="msg-text"></div>
      </div>
    `;

    chatMessages.appendChild(msgDiv);
    const textEl = msgDiv.querySelector('.msg-text');

    if (sender === 'barnaby') {
      // Typewriter effect inside chat bubble
      let idx = 0;
      function typeChar() {
        if (idx < text.length) {
          textEl.textContent += text.charAt(idx);
          if (idx % 3 === 0 && !window.audioManager.isMuted) {
            window.audioManager.playBlip(mood === 'alert' ? 560 : 450);
          }
          idx++;
          chatMessages.scrollTop = chatMessages.scrollHeight;
          setTimeout(typeChar, 16);
        } else {
          chatMessages.scrollTop = chatMessages.scrollHeight;
        }
      }
      typeChar();
    } else {
      textEl.textContent = text;
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }

  async function sendChatMessage(msgText) {
    if (!msgText || !msgText.trim()) return;
    const text = msgText.trim();
    if (chatInput) chatInput.value = '';

    appendChatMessage('user', text);
    window.audioManager.playClick();

    // Temporary typing indicator
    const typingId = 'typing-' + Date.now();
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-msg barnaby-msg';
    typingDiv.id = typingId;
    typingDiv.innerHTML = `
      <div class="msg-avatar"><img src="${avatarMap.neutral}" alt="Barnaby"></div>
      <div class="msg-bubble">
        <div class="msg-sender">Barnaby</div>
        <div class="msg-text" style="font-style: italic; color: var(--text-muted);">🐾 Barnaby is reviewing the logs...</div>
      </div>
    `;
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();

      const typingEl = document.getElementById(typingId);
      if (typingEl) typingEl.remove();

      if (data.success) {
        if (chatBarnabyAvatar) {
          chatBarnabyAvatar.src = avatarMap[data.mood] || avatarMap.happy;
        }
        if (data.mood === 'alert') window.audioManager.playAlert();
        else window.audioManager.playSuccess();

        appendChatMessage('barnaby', data.reply, data.mood);

        if (data.suggested_followups && data.suggested_followups.length > 0) {
          renderQuickPrompts(data.suggested_followups);
        }
      } else {
        appendChatMessage('barnaby', "My whiskers twitched and I lost connection to the logs! Let's try again in a moment.", 'alert');
      }
    } catch (err) {
      console.error('Chat error:', err);
      const typingEl = document.getElementById(typingId);
      if (typingEl) typingEl.remove();
      appendChatMessage('barnaby', "Meow! Network blip detected. Make sure the server is purring smoothly.", 'alert');
    }
  }

  function renderQuickPrompts(prompts) {
    if (!quickPromptsList) return;
    quickPromptsList.innerHTML = '';
    prompts.forEach(p => {
      const btn = document.createElement('button');
      btn.className = 'quick-prompt-chip';
      btn.dataset.prompt = p;
      btn.textContent = `🐾 ${p}`;
      btn.addEventListener('click', () => {
        sendChatMessage(p);
      });
      quickPromptsList.appendChild(btn);
    });
  }

  if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (chatInput) sendChatMessage(chatInput.value);
    });
  }

  // Quick Prompt Chips Initial Setup
  document.querySelectorAll('.quick-prompt-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const prompt = chip.dataset.prompt;
      if (prompt) sendChatMessage(prompt);
    });
  });

  // Clear Chat History Button
  if (clearChatBtn) {
    clearChatBtn.addEventListener('click', () => {
      window.audioManager.playClick();
      if (chatMessages) {
        chatMessages.innerHTML = `
          <div class="chat-msg barnaby-msg">
            <div class="msg-avatar">
              <img src="./static/images/barnaby_happy.svg" alt="Barnaby">
            </div>
            <div class="msg-bubble">
              <div class="msg-sender">Barnaby</div>
              <div class="msg-text">
                Chat cleared! My desk is clean and my tea is warm. What compliance topic shall we explore next? 🐾
              </div>
            </div>
          </div>
        `;
      }
    });
  }

  // Open Barnaby's Dedicated Introduction Modal
  function openBarnabyIntro() {
    window.audioManager.playClick();
    if (barnabyIntroDialog) {
      if (typeof barnabyIntroDialog.showModal === 'function') {
        barnabyIntroDialog.showModal();
      } else {
        barnabyIntroDialog.setAttribute('open', '');
      }
      window.audioManager.playSuccess();
    }
  }

  if (heroMeetBarnabyBtn) {
    heroMeetBarnabyBtn.addEventListener('click', openBarnabyIntro);
  }

  if (navBarnabyLink) {
    navBarnabyLink.addEventListener('click', (e) => {
      e.preventDefault();
      openBarnabyIntro();
    });
  }

  if (closeBarnabyIntroBtn && barnabyIntroDialog) {
    closeBarnabyIntroBtn.addEventListener('click', () => {
      window.audioManager.playClick();
      if (barnabyIntroDialog.close) barnabyIntroDialog.close();
      else barnabyIntroDialog.removeAttribute('open');
    });
  }

  // Interactive Mood Switcher inside Barnaby Introduction Dialog
  const moodBtns = document.querySelectorAll('.mood-btn');
  moodBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      moodBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const mood = btn.dataset.mood;
      const quote = btn.dataset.quote;

      if (introBarnabyAvatar) {
        introBarnabyAvatar.src = avatarMap[mood] || avatarMap.neutral;
      }
      if (introBarnabyQuote) {
        introBarnabyQuote.textContent = `"${quote}"`;
      }

      window.audioManager.playBlip(mood === 'alert' ? 560 : 440);
    });
  });


  // Replay Scenario from Report Card
  reportRetryBtn.addEventListener('click', () => {
    window.audioManager.playClick();
    if (reportDialog.close) reportDialog.close();
    else reportDialog.removeAttribute('open');

    startCrisis(currentScenario);
  });

  // Next Scenario Button from Report Card
  reportNextBtn.addEventListener('click', () => {
    window.audioManager.playClick();
    if (reportDialog.close) reportDialog.close();
    else reportDialog.removeAttribute('open');

    // Find next scenario
    const currentIndex = allScenarios.findIndex(s => s.id === currentScenario.id);
    if (currentIndex !== -1 && currentIndex + 1 < allScenarios.length) {
      openBriefing(allScenarios[currentIndex + 1].id);
    } else {
      returnToSelection();
    }
  });

  // Ask Barnaby for Advice Button
  askAdviceBtn.addEventListener('click', async () => {
    window.audioManager.playClick();
    if (!currentScenario || !currentPhase) return;

    try {
      const res = await fetch(`/api/companion-hint?scenario_id=${currentScenario.id}&phase_id=${currentPhase.phase_id}`);
      const data = await res.json();
      typeWriter(data.hint, data.mood || 'detective');
    } catch (err) {
      typeWriter("Trust your instincts, stick to least privilege, and preserve all audit logs!", 'happy');
    }
  });

  // Return to Selection Button
  function returnToSelection() {
    window.audioManager.playClick();
    crisisDashboard.style.display = 'none';
    selectionSection.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    initScrollObserver();
  }

  backToSelectionBtn.addEventListener('click', returnToSelection);
  navHomeBtn.addEventListener('click', returnToSelection);

  // Smooth scroll for hero buttons
  [headerStartBtn, heroStartJourneyBtn].forEach(btn => {
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        window.audioManager.playClick();
        updateActiveNav(navCasesLink);
        document.getElementById('caseFiles').scrollIntoView({ behavior: 'smooth' });
      });
    }
  });

  // Update Status Meters & Show Floating Deltas
  function updateMeters(state, deltas) {
    valAudit.textContent = `${state.audit_readiness}%`;
    valTrust.textContent = `${state.company_trust}%`;
    valBudget.textContent = `$${state.budget.toLocaleString()}`;

    fillAudit.style.width = `${Math.min(100, Math.max(0, state.audit_readiness))}%`;
    fillTrust.style.width = `${Math.min(100, Math.max(0, state.company_trust))}%`;
    fillBudget.style.width = `${Math.min(100, Math.max(0, (state.budget / 100000) * 100))}%`;

    // Color shift if critical
    if (state.audit_readiness < 40) fillAudit.style.backgroundColor = 'var(--alert-red)';
    else if (state.audit_readiness < 65) fillAudit.style.backgroundColor = 'var(--budget-gold)';
    else fillAudit.style.backgroundColor = 'var(--audit-green)';

    if (state.company_trust < 40) fillTrust.style.backgroundColor = 'var(--alert-red)';
    else fillTrust.style.backgroundColor = 'var(--trust-blue)';

    // Show floating deltas and score bursts if provided
    if (deltas) {
      showDelta(deltaAudit, deltas.audit_readiness, '%');
      showDelta(deltaTrust, deltas.company_trust, '%');
      showDelta(deltaBudget, deltas.budget, '$', true);

      if (deltas.audit_readiness !== 0) {
        spawnScoreBurst(
          `${deltas.audit_readiness > 0 ? '+' : ''}${deltas.audit_readiness}% Audit Readiness`,
          deltas.audit_readiness > 0,
          window.innerWidth / 2 - 120,
          140
        );
      }
      if (deltas.company_trust !== 0) {
        setTimeout(() => {
          spawnScoreBurst(
            `${deltas.company_trust > 0 ? '+' : ''}${deltas.company_trust}% Company Trust`,
            deltas.company_trust > 0,
            window.innerWidth / 2 - 60,
            180
          );
        }, 180);
      }
    }
  }

  function showDelta(el, val, unit, isCurrency = false) {
    if (!val || val === 0) {
      el.className = 'meter-delta';
      el.textContent = '';
      return;
    }

    const sign = val > 0 ? '+' : '';
    const formatted = isCurrency 
      ? `${sign}$${Math.abs(val).toLocaleString()}`
      : `${sign}${val}${unit}`;

    el.textContent = formatted;
    el.className = `meter-delta show ${val > 0 ? 'delta-pos' : 'delta-neg'}`;

    setTimeout(() => {
      el.className = 'meter-delta';
    }, 2400);
  }

  // Floating Score Bursts (+15% Audit Readiness, etc.)
  function spawnScoreBurst(text, isPositive, x, y) {
    const burst = document.createElement('div');
    burst.className = `score-burst ${isPositive ? 'pos' : 'neg'}`;
    burst.textContent = text;
    burst.style.left = `${Math.max(20, Math.min(window.innerWidth - 180, x))}px`;
    burst.style.top = `${y || 120}px`;
    document.body.appendChild(burst);

    setTimeout(() => {
      burst.remove();
    }, 1900);
  }

  // =========================================================
  // SCROLL EFFECTS & AMBIENT VISUALS
  // =========================================================

  // Scroll Reveal via IntersectionObserver (works everywhere including Safari/Firefox)
  function initScrollObserver() {
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
      });

      revealElements.forEach(el => observer.observe(el));
    } else {
      revealElements.forEach(el => el.classList.add('revealed'));
    }
  }

  // Ambient Floating Particles (Cozy Leaves, Sparkles, or Raindrops based on weather)
  function spawnAmbientParticles(theme = 'morning') {
    if (!ambientParticles) return;
    ambientParticles.innerHTML = '';

    let particleSymbols = ['🍃', '🍂', '✨', '☁️', '🌸', '🌱'];
    if (theme === 'sunset') {
      particleSymbols = ['🍂', '✨', '🌅', '🍁', '🌾', '💫'];
    } else if (theme === 'rain') {
      particleSymbols = ['💧', '🌧️', '🫧', '🍃', '🌱', '✨'];
    }

    const count = 16;

    for (let i = 0; i < count; i++) {
      const span = document.createElement('span');
      span.className = 'ambient-particle';
      span.textContent = particleSymbols[i % particleSymbols.length];
      span.style.left = `${Math.random() * 95}vw`;
      span.style.fontSize = `${12 + Math.random() * 14}px`;
      span.style.animationDuration = `${14 + Math.random() * 16}s`;
      span.style.animationDelay = `${Math.random() * 12}s`;
      ambientParticles.appendChild(span);
    }
  }

  // =========================================================
  // INTERACTIVE WEATHER MOODS & FULL-PAGE ATMOSPHERE EFFECTS
  // =========================================================
  const pixelSceneryFrame = document.getElementById('pixelSceneryFrame');
  const sceneryRainLayer = document.getElementById('sceneryRainLayer');
  const weatherBtns = document.querySelectorAll('.weather-btn:not(.weather-revert-btn)');
  const weatherRevertBtn = document.getElementById('weatherRevertBtn');
  const headerWeatherRevertBtn = document.getElementById('headerWeatherRevertBtn');

  function setWeatherTheme(weather, playSound = true) {
    const currentTheme = document.body.classList.contains('theme-sunset')
      ? 'sunset'
      : (document.body.classList.contains('theme-rain') ? 'rain' : 'morning');

    // Toggle back to morning if user re-clicks the currently active theme
    let targetWeather = weather;
    if (currentTheme === weather && weather !== 'morning') {
      targetWeather = 'morning';
    }

    // Reset base classes
    document.body.classList.remove('theme-sunset', 'theme-rain');
    if (pixelSceneryFrame) {
      pixelSceneryFrame.classList.remove('theme-sunset', 'theme-rain');
    }

    // Update active button state in the weather picker
    document.querySelectorAll('.weather-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.weather === targetWeather);
    });

    if (targetWeather === 'sunset') {
      document.body.classList.add('theme-sunset');
      if (pixelSceneryFrame) pixelSceneryFrame.classList.add('theme-sunset');
      
      if (sceneryRainLayer) sceneryRainLayer.innerHTML = '';
      if (weatherRevertBtn) weatherRevertBtn.style.display = 'inline-flex';
      if (headerWeatherRevertBtn) headerWeatherRevertBtn.style.display = 'inline-flex';

      spawnAmbientParticles('sunset');
      if (playSound) {
        if (window.audioManager && window.audioManager.playWarmChime) {
          window.audioManager.playWarmChime();
        }
        spawnScoreBurst('🌅 Sunset Atmosphere Applied', true, window.innerWidth / 2 - 110, 80);
      }
      localStorage.setItem('quiet_audit_weather', 'sunset');
    } else if (targetWeather === 'rain') {
      document.body.classList.add('theme-rain');
      if (pixelSceneryFrame) pixelSceneryFrame.classList.add('theme-rain');
      
      spawnRainDrops();
      if (weatherRevertBtn) weatherRevertBtn.style.display = 'inline-flex';
      if (headerWeatherRevertBtn) headerWeatherRevertBtn.style.display = 'inline-flex';

      spawnAmbientParticles('rain');
      if (playSound) {
        if (window.audioManager && window.audioManager.playWaterDrop) {
          window.audioManager.playWaterDrop();
        }
        spawnScoreBurst('🌧️ Lofi Rain Atmosphere Applied', true, window.innerWidth / 2 - 110, 80);
      }
      localStorage.setItem('quiet_audit_weather', 'rain');
    } else {
      // Morning Calm (Default)
      if (sceneryRainLayer) sceneryRainLayer.innerHTML = '';
      if (weatherRevertBtn) weatherRevertBtn.style.display = 'none';
      if (headerWeatherRevertBtn) headerWeatherRevertBtn.style.display = 'none';

      spawnAmbientParticles('morning');
      if (playSound) {
        if (window.audioManager && window.audioManager.playMorningBreeze) {
          window.audioManager.playMorningBreeze();
        }
        spawnScoreBurst('☀️ Reverted to Morning Calm', true, window.innerWidth / 2 - 110, 80);
      }
      localStorage.setItem('quiet_audit_weather', 'morning');
    }
  }

  function initSceneryEffects() {
    weatherBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        setWeatherTheme(btn.dataset.weather, true);
      });
    });

    // Option to go back!
    if (weatherRevertBtn) {
      weatherRevertBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        setWeatherTheme('morning', true);
      });
    }

    if (headerWeatherRevertBtn) {
      headerWeatherRevertBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        setWeatherTheme('morning', true);
      });
    }

    // Clicking scenery triggers water drop sound
    if (pixelSceneryFrame) {
      pixelSceneryFrame.addEventListener('click', () => {
        window.audioManager.playWaterDrop();
      });
    }

    // Clicking Barnaby avatar anywhere plays cozy feline purr
    document.querySelectorAll('#companionAvatar, #introBarnabyAvatar, #chatBarnabyAvatar, .dialog-avatar img, .mascot-avatar-container').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        window.audioManager.playPurr();
      });
    });

    // Load saved weather preference
    const savedWeather = localStorage.getItem('quiet_audit_weather');
    if (savedWeather && (savedWeather === 'sunset' || savedWeather === 'rain')) {
      setWeatherTheme(savedWeather, false);
    }
  }

  function spawnRainDrops() {
    if (!sceneryRainLayer) return;
    sceneryRainLayer.innerHTML = '';
    for (let i = 0; i < 35; i++) {
      const drop = document.createElement('div');
      drop.className = 'rain-drop';
      drop.style.left = `${Math.random() * 100}%`;
      drop.style.top = `${Math.random() * -30}px`;
      drop.style.animationDelay = `${Math.random() * 0.8}s`;
      drop.style.animationDuration = `${0.45 + Math.random() * 0.3}s`;
      sceneryRainLayer.appendChild(drop);
    }
  }

  // Active Nav Highlighting on Scroll
  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY + 200;
    const aboutEl = document.getElementById('about');
    const chatEl = document.getElementById('chat');
    const caseFilesEl = document.getElementById('caseFiles');

    if (aboutEl && scrollPos >= aboutEl.offsetTop) {
      updateActiveNav(navAboutLink);
    } else if (chatEl && scrollPos >= chatEl.offsetTop) {
      updateActiveNav(navChatLink);
    } else if (caseFilesEl && scrollPos >= caseFilesEl.offsetTop) {
      updateActiveNav(navCasesLink);
    }
  }, { passive: true });

  // Initialize Engine
  loadScenarios();
  initScrollObserver();
  spawnAmbientParticles();
  initSceneryEffects();
});


