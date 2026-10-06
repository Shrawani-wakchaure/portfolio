/**
 * Quiet Audit - Client-Side Game Simulation & GRC Engine
 * 100% in-browser offline simulation of Flask backend & Barnaby's Brain.
 * Seamless Vercel deployment with zero external server dependencies.
 */

(function () {
  const originalFetch = window.fetch.bind(window);

  let SCENARIOS_DATA = null;

  async function loadScenarios() {
    if (SCENARIOS_DATA) return SCENARIOS_DATA;
    try {
      const resp = await originalFetch('./scenarios.json');
      SCENARIOS_DATA = await resp.json();
    } catch {
      const resp = await originalFetch('/games/quiet-audit/scenarios.json');
      SCENARIOS_DATA = await resp.json();
    }
    return SCENARIOS_DATA;
  }

  function computeGrade(audit_readiness, company_trust, budget, threshold) {
    const min_audit = (threshold && threshold.audit_readiness) || 70;
    const min_trust = (threshold && threshold.company_trust) || 60;
    const min_budget = (threshold && threshold.budget) || 20000;

    const score = (audit_readiness * 0.5) + (company_trust * 0.3) + (Math.min(100, (budget / 75000) * 100) * 0.2);
    const passed_all = (audit_readiness >= min_audit) && (company_trust >= min_trust) && (budget >= min_budget);

    let grade = "F";
    let verdict = "Disclaimer of Opinion (Critical Control Breakdown)";
    let badge_earned = "Audit Emergency Responder";
    let feedback = "Severe material weaknesses, destroyed logs, or catastrophic trust erosion. The audit committee has ordered an immediate external restructuring.";

    if (score >= 88 && passed_all) {
      grade = "A+";
      verdict = "Clean Unqualified Opinion (Gold Standard)";
      badge_earned = "Clean SOC 2 Gold Stamp";
      feedback = "Exceptional GRC leadership! You contained risks promptly, preserved all forensic audit trails, maintained team psychological safety, and established automated preventive controls.";
    } else if (score >= 78 && passed_all) {
      grade = "A";
      verdict = "Unqualified Opinion (Satisfactory Compliance)";
      badge_earned = "Pragmatic Risk Defender";
      feedback = "Solid compliance performance! You navigated the crisis with clear operational judgment, contained technical fallout, and satisfied all Trust Services Criteria.";
    } else if (score >= 65) {
      grade = "B";
      verdict = "Qualified Opinion with Minor Observations";
      badge_earned = "Resilient Responder";
      feedback = "You survived the crisis and contained the worst damage, though some friction or remediation loops were triggered along the way. Management recommendations have been noted.";
    } else if (score >= 50) {
      grade = "C";
      verdict = "Adverse Finding with Significant Deficiencies";
      badge_earned = "Remediation Apprentice";
      feedback = "Multiple control breakdowns and remediation delays occurred. Significant findings noted for internal controls, though basic operational survival was achieved.";
    }

    return {
      grade,
      score: Math.round(score * 10) / 10,
      verdict,
      passed: passed_all,
      badge_earned,
      feedback
    };
  }

  // Barnaby's Knowledge Base for Offline Chat
  const KNOWLEDGE_TOPICS = [
    {
      id: "greetings",
      patterns: [/\b(hi|hello|hey|greetings|good morning|good afternoon|good evening|howdy)\b/i],
      reply: "Good day, Risk Manager! It is a genuine pleasure to welcome you to my compliance desk. I have my chamomile tea warm, my spectacles polished, and our security telemetry running smoothly. How may I have the honor of assisting your compliance and risk efforts today?",
      mood: "happy",
      followups: [
        "How should we prepare for our first SOC 2 audit?",
        "What are your 3 Golden Rules of GRC?",
        "How do I convince engineers to care about compliance?"
      ]
    },
    {
      id: "persona_origin",
      patterns: [/who are you/i, /what do you do/i, /tell me about yourself/i, /introduce yourself/i, /your background/i, /why a cat/i],
      reply: "Allow me to introduce myself properly: I am Barnaby, Chief Purr-sonal Risk Officer at SnoozeCloud Inc. As a young stray kitten, I wandered into the server facility and fell fast asleep on the warm casing of the core firewall switch. Since that day, I have dedicated all nine of my lives to defending Least Privilege, protecting immutable audit trails, and cultivating a calm, blameless compliance culture.",
      mood: "happy",
      followups: [
        "What are your 3 Golden Rules?",
        "What treats do you like, Barnaby?",
        "How do you handle audit emergencies?"
      ]
    },
    {
      id: "golden_rules",
      patterns: [/golden rule/i, /your rules/i, /mantra/i, /philosophy/i, /compliance principles/i, /grc advice/i],
      reply: "It is my privilege to share my Three Golden Rules of Cozy GRC:\n\n• 1. Evidence over Assumptions: If an action or control change was not immutably logged in CloudTrail or your SIEM, from an auditor's perspective, it never occurred.\n• 2. Paved Roads over Bans: Never be the 'Department of No'. Construct fast, automated, secure CI/CD defaults that make the right decision the easiest decision for engineers.\n• 3. Blameless Culture: Focus relentlessly on repairing systemic guardrails and UX frictions, never on penalizing well-intentioned team members.",
      mood: "happy",
      followups: [
        "How do I build paved roads for developers?",
        "How do I prepare for a SOC 2 audit?",
        "What is Zero Trust access?"
      ]
    },
    {
      id: "soc2_overview",
      patterns: [/what is soc 2/i, /soc2 overview/i, /trust services criteria/i, /explain soc 2/i, /\btsc\b/i],
      reply: "SOC 2 (System and Organization Controls 2) is a framework established by the AICPA that verifies how securely a service organization manages customer data. It is governed by five Trust Services Criteria: Security (mandatory/common criteria), Availability, Confidentiality, Processing Integrity, and Privacy. Unlike static checklists, SOC 2 evaluates whether your controls are documented, communicated, and functioning consistently.",
      mood: "neutral",
      followups: [
        "What is the difference between Type I and Type II?",
        "How do we prepare for our first SOC 2 audit?",
        "What does a clean audit opinion mean?"
      ]
    },
    {
      id: "soc2_type1_vs_type2",
      patterns: [/type 1 vs type 2/i, /type i vs type ii/i, /difference between type/i, /type 1 or type 2/i],
      reply: "A SOC 2 Type I report evaluates the suitability of control design on a single specified calendar date (a point-in-time snapshot). In contrast, a Type II report evaluates whether those controls operated effectively over a continuous period—typically 6 to 12 months—using statistical sampling. Enterprise procurement and enterprise security teams almost universally require a Type II report.",
      mood: "detective",
      followups: [
        "How does an auditor sample evidence?",
        "What is a material weakness versus an observation?",
        "How long does it take to obtain SOC 2 Type II?"
      ]
    },
    {
      id: "soc2_preparation",
      patterns: [/prepare for soc 2/i, /first soc 2/i, /survive.*audit/i, /audit prep/i, /how to pass soc 2/i],
      reply: "To prepare successfully for your SOC 2 Type II examination, I recommend four mindful steps:\n\n1. Define Scope with Precision: Narrow the boundary to production environments holding customer data rather than internal test labs.\n2. Automate Continuous Evidence: Utilize infrastructure-as-code and automated compliance tooling to sample PR approvals, access reviews, and vulnerability scans continuously.\n3. Conduct a Rigorous Readiness Assessment: Partner with an independent assessor 3 months prior to identify missing policies before formal sampling begins.\n4. Establish a Single Source of Truth: Keep an organized audit repository so evidence requests can be fulfilled calmly within 24 hours.",
      mood: "detective",
      followups: [
        "What evidence do auditors examine for change management?",
        "What are the most common SOC 2 audit traps?",
        "How should we handle an auditor exception?"
      ]
    },
    {
      id: "s3_public_bucket",
      patterns: [/s3 bucket/i, /public s3/i, /s3 leak/i, /s3:getobject/i, /public bucket/i, /bucket exposed/i],
      reply: "If an S3 bucket is found open to the public, please take a deep, calm breath and execute this immediate containment protocol:\n\n1. Enforce Account-Level Block: Apply 'S3 Block Public Access' at the AWS account root to override all bucket ACLs immediately.\n2. Preserve Evidence: Do not delete the bucket or wipe logs in a panic! You need CloudTrail S3 Data Events intact to prove chain of custody.\n3. Execute Athena Forensics: Run Amazon Athena queries against your S3 server access logs to identify every single IP that requested objects during the exposure window.\n4. Document the CAPA: File an honest incident report detailing the root cause and the preventive Terraform guardrail deployed to permanently prevent recurrence.",
      mood: "alert",
      followups: [
        "How do I query CloudTrail using Athena?",
        "How do I prevent public buckets in CI/CD pipelines?",
        "When must a cloud leak be reported to customers?"
      ]
    },
    {
      id: "gdpr_breach_notice",
      patterns: [/gdpr/i, /72 hour/i, /72-hour/i, /article 33/i, /data protection authority/i, /dpa notice/i],
      reply: "Under GDPR Article 33, when a personal data breach occurs, the data controller must notify the competent supervisory authority without undue delay, and where feasible, not later than 72 hours after becoming aware of it. The notification must describe the nature of the breach, approximate number of individuals affected, likely consequences, and the mitigating measures taken. Transparency is respected by regulators; attempts to conceal exposure attract the harshest penalties.",
      mood: "alert",
      followups: [
        "What qualifies as personal data under GDPR?",
        "What is a Data Protection Impact Assessment (DPIA)?",
        "What is the difference between a Data Controller and Processor?"
      ]
    },
    {
      id: "vendor_risk_tprm",
      patterns: [/vendor risk/i, /third party/i, /third-party/i, /tprm/i, /shadow it/i, /vetting saas/i, /vendor breach/i],
      reply: "Third-Party Risk Management (TPRM) is vital because your security perimeter is only as resilient as your most vulnerable SaaS provider. I advise establishing a frictionless three-tier review:\n\n• Tier 1 (Low Risk): Non-sensitive marketing tools with zero PII access—rapid 24-hour self-certification.\n• Tier 2 (Moderate): Integrations handling business metrics—requires valid SOC 2 Type II or ISO 27001 report.\n• Tier 3 (Critical): Sub-processors storing customer databases—requires custom architectural review, DPA with Standard Contractual Clauses, and pen-test summaries.",
      mood: "neutral",
      followups: [
        "What red flags should I look for in a vendor SOC 2 report?",
        "How do we prevent Shadow IT without infuriating marketing?",
        "What is a Data Processing Agreement (DPA)?"
      ]
    },
    {
      id: "iam_least_privilege",
      patterns: [/least privilege/i, /\biam\b/i, /permissions/i, /access control/i, /wildcard/i, /admin access/i],
      reply: "The Principle of Least Privilege dictates that every user, service, and automation pipeline should be granted only the minimal permissions strictly necessary to accomplish its documented purpose. To implement this effectively: enforce AWS IAM Permission Boundaries, mandate temporary STS credentials rather than permanent access keys, and implement Just-In-Time (JIT) access approval for production database access.",
      mood: "detective",
      followups: [
        "How do I discover unused IAM permissions?",
        "What is Zero Trust network architecture?",
        "How often should User Access Reviews (UAR) be conducted?"
      ]
    },
    {
      id: "offboarding_scim",
      patterns: [/offboard/i, /ex-employee/i, /terminated/i, /contractor access/i, /ghost credential/i, /scim/i, /deprovisioning/i],
      reply: "Relying on manual spreadsheets or emails between HR and IT for employee offboarding is the number one cause of audit exceptions! The modern standard is automated SCIM (System for Cross-domain Identity Management) tied directly between your HRIS (Rippling, BambooHR, or Workday) and your Identity Provider (Okta or Google Workspace). The moment an employee's separation is entered into HRIS, all downstream SSO sessions, SSH keys, and cloud roles terminate automatically.",
      mood: "happy",
      followups: [
        "How do I conduct a quarterly User Access Review (UAR)?",
        "What is atomic identity revocation?",
        "How do we revoke active AWS STS tokens immediately?"
      ]
    },
    {
      id: "cat_banter",
      patterns: [/treat/i, /milk/i, /pet/i, /belly/i, /whiskers/i, /purr/i, /good cat/i, /nap/i, /salmon/i],
      reply: "Why, thank you for your delightful kindness! *purrs softly and adjusts tiny glasses* While my official title is Chief Purr-sonal Risk Officer, I will never turn down freeze-dried salmon flakes or a warm nap on an air-conditioned server chassis after a clean audit report is finalized.",
      mood: "happy",
      followups: [
        "What are your 3 Golden Rules of GRC?",
        "How do you stay calm during Sev-1 emergencies?",
        "Tell me a compliance joke!"
      ]
    },
    {
      id: "jokes",
      patterns: [/joke/i, /funny/i, /humor/i, /make me laugh/i],
      reply: "I would be honored to share a compliance jest:\n\nWhy was the risk manager so fond of stray cats? Because both know that nine lives are never enough without an immutable offsite backup replica! *gentle feline chuckle* ...And also because both demand Least Privilege when entering any room!",
      mood: "happy",
      followups: [
        "Tell me another GRC tip!",
        "What is your favorite compliance framework?",
        "How do I survive my first audit?"
      ]
    },
    {
      id: "gratitude",
      patterns: [/thank you/i, /thanks/i, /appreciate/i, /grateful/i, /very helpful/i],
      reply: "It is entirely my pleasure, Risk Manager! Serving as your compliance companion is both a duty and a joy. You are doing vital, honorable work safeguarding your company and its customers. Should any other risk challenge arise, I am always right here at your service.",
      mood: "happy",
      followups: [
        "Can we review SOC 2 change management?",
        "What are your 3 Golden Rules?",
        "How should we handle vendor questionnaires?"
      ]
    }
  ];

  function generateBarnabyReply(message) {
    const cleanMsg = (message || '').trim();
    const msgLower = cleanMsg.toLowerCase();

    let bestTopic = null;
    let bestScore = 0;

    for (const topic of KNOWLEDGE_TOPICS) {
      let score = 0;
      for (const pattern of topic.patterns) {
        const match = msgLower.match(pattern);
        if (match) {
          score += match[0].length * 3;
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestTopic = topic;
      }
    }

    if (bestTopic && bestScore > 0) {
      return {
        reply: bestTopic.reply,
        mood: bestTopic.mood,
        suggested_followups: bestTopic.followups
      };
    }

    if (/\b(cloud|aws|azure|gcp|bucket|database|postgres)\b/i.test(msgLower)) {
      return {
        reply: "Thank you for asking about cloud infrastructure governance. In cloud environments, security is defined by boundaries and identity: mandate KMS customer-managed key encryption at rest, restrict security groups to zero ingress from 0.0.0.0/0, and enforce AWS GuardDuty with automated remediation. Would you like to review cloud encryption or access logging?",
        mood: "detective",
        suggested_followups: [
          "How do we prevent public S3 buckets?",
          "What is Principle of Least Privilege?",
          "How do we configure CloudTrail for audits?"
        ]
      };
    }

    if (/\b(audit|compliance|framework|regulation|certif)\b/i.test(msgLower)) {
      return {
        reply: "Thank you for consulting me on compliance frameworks. When choosing or preparing for a standard (such as SOC 2, ISO 27001, or GDPR), our priority is always to align controls with your business architecture rather than creating checkbox bureaucracy. Which specific framework or certification is your organization pursuing?",
        mood: "neutral",
        suggested_followups: [
          "Tell me about SOC 2 Type II",
          "Explain ISO 27001 Annex A",
          "What are your 3 Golden Rules?"
        ]
      };
    }

    if (/\b(developer|engineer|culture|friction|slow down)\b/i.test(msgLower)) {
      return {
        reply: "That is an exceptionally thoughtful question, Risk Manager. Compliance should never feel like an obstruction to engineering velocity. When we provide developers with 'paved roads'—such as pre-approved Terraform modules, automated PR linting, and frictionless SSO—compliance becomes a natural byproduct of shipping code.",
        mood: "happy",
        suggested_followups: [
          "What are your 3 Golden Rules of GRC?",
          "How do we handle emergency hotfixes safely?",
          "What is a blameless post-mortem?"
        ]
      };
    }

    return {
      reply: `Thank you for your question regarding '${cleanMsg}'. While each startup's operational context is unique, the foundational pillars remain constant: uphold the Principle of Least Privilege, maintain immutable audit telemetry, and cultivate a blameless culture. Please let me know if you would like me to dive deeper into SOC 2, ISO 27001, cloud security, or incident response!`,
      mood: "happy",
      suggested_followups: [
        "How do we prepare for our first SOC 2 audit?",
        "What are your 3 Golden Rules of GRC?",
        "We have an emergency incident, what should I do?"
      ]
    };
  }

  // Intercept Fetch API
  window.fetch = async function (url, options = {}) {
    const urlStr = typeof url === 'string' ? url : url.url || '';

    // 1. GET /api/scenarios
    if (urlStr.includes('/api/scenarios')) {
      const data = await loadScenarios();
      const summaryList = (data.scenarios || []).map(s => ({
        id: s.id,
        chapter: s.chapter || 1,
        title: s.title,
        subtitle: s.subtitle || '',
        category: s.category || '',
        compliance_framework: s.compliance_framework || '',
        badge: s.badge || 'badge_soc2',
        difficulty: s.difficulty || 'Moderate',
        summary: s.summary || '',
        initial_state: (s.briefing && s.briefing.initial_state) || {}
      }));
      return new Response(JSON.stringify({
        metadata: data.metadata || {},
        scenarios: summaryList
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // 2. GET /api/scenario/:id
    if (urlStr.includes('/api/scenario/')) {
      const parts = urlStr.split('/api/scenario/');
      const scenarioId = parts[1].split('?')[0];
      const data = await loadScenarios();
      const s = (data.scenarios || []).find(sc => sc.id === scenarioId);
      if (!s) {
        return new Response(JSON.stringify({ error: 'Scenario not found' }), { status: 404 });
      }
      return new Response(JSON.stringify(s), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // 3. POST /api/action
    if (urlStr.includes('/api/action')) {
      const data = await loadScenarios();
      const req = options.body ? JSON.parse(options.body) : {};
      const scenarioId = req.scenario_id;
      const currentPhaseId = req.current_phase_id;
      const choiceId = req.choice_id;
      const isRemediation = Boolean(req.is_remediation);
      const parentChoiceId = req.parent_choice_id;
      const currentState = req.current_state || { audit_readiness: 70, company_trust: 70, budget: 50000 };

      const scenario = (data.scenarios || []).find(s => s.id === scenarioId);
      if (!scenario) return new Response(JSON.stringify({ error: 'Scenario not found' }), { status: 404 });

      const phase = (scenario.phases || {})[currentPhaseId];
      if (!phase) return new Response(JSON.stringify({ error: 'Phase not found' }), { status: 400 });

      let choiceObj = null;
      let triggersRemediation = false;
      let remediationPayload = null;

      if (isRemediation) {
        let parentChoice = null;
        for (const c of (phase.choices || [])) {
          if (c.id === parentChoiceId) { parentChoice = c; break; }
        }
        if (!parentChoice || !parentChoice.remediation) {
          return new Response(JSON.stringify({ error: 'Parent choice or remediation not found' }), { status: 400 });
        }
        for (const rc of (parentChoice.remediation.remediation_choices || [])) {
          if (rc.id === choiceId) { choiceObj = rc; break; }
        }
      } else {
        for (const c of (phase.choices || [])) {
          if (c.id === choiceId) { choiceObj = c; break; }
        }
        if (choiceObj && choiceObj.type === 'bad' && choiceObj.remediation) {
          triggersRemediation = true;
          remediationPayload = {
            parent_choice_id: choiceObj.id,
            trigger_reason: choiceObj.remediation.trigger_reason || 'Compliance control failure.',
            situation: choiceObj.remediation.situation || 'Urgent mitigation required.',
            remediation_choices: choiceObj.remediation.remediation_choices || []
          };
        }
      }

      if (!choiceObj) {
        return new Response(JSON.stringify({ error: `Choice ${choiceId} not found` }), { status: 400 });
      }

      const effects = choiceObj.effects || {};
      const newAudit = Math.max(0, Math.min(100, (currentState.audit_readiness || 70) + (effects.audit_readiness || 0)));
      const newTrust = Math.max(0, Math.min(100, (currentState.company_trust || 70) + (effects.company_trust || 0)));
      const newBudget = Math.max(0, (currentState.budget || 50000) + (effects.budget || 0));

      const newState = {
        audit_readiness: newAudit,
        company_trust: newTrust,
        budget: newBudget
      };

      const deltas = {
        audit_readiness: effects.audit_readiness || 0,
        company_trust: effects.company_trust || 0,
        budget: effects.budget || 0
      };

      const nextPhaseId = choiceObj.next_phase_id;
      const isConclusion = (nextPhaseId === 'conclusion');

      let reportCard = null;
      if (isConclusion) {
        const threshold = (scenario.conclusion && scenario.conclusion.success_threshold) || {};
        reportCard = computeGrade(newAudit, newTrust, newBudget, threshold);
        reportCard.takeaway = (scenario.conclusion && scenario.conclusion.takeaway) || '';
      }

      let nextPhaseData = null;
      if (!isConclusion && !triggersRemediation && nextPhaseId) {
        nextPhaseData = (scenario.phases || {})[nextPhaseId];
      }

      return new Response(JSON.stringify({
        success: true,
        choice_id: choiceId,
        choice_title: choiceObj.title || '',
        consequence: choiceObj.consequence || '',
        companion_reaction: choiceObj.companion_reaction || '',
        companion_mood: choiceObj.companion_mood || 'neutral',
        new_state: newState,
        deltas: deltas,
        triggers_remediation: triggersRemediation,
        remediation: remediationPayload,
        next_phase_id: nextPhaseId,
        next_phase_data: nextPhaseData,
        is_conclusion: isConclusion,
        report_card: reportCard
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // 4. GET /api/companion-hint
    if (urlStr.includes('/api/companion-hint')) {
      const urlObj = new URL(urlStr, window.location.href);
      const scenarioId = urlObj.searchParams.get('scenario_id');
      const phaseId = urlObj.searchParams.get('phase_id');
      const data = await loadScenarios();
      const scenario = (data.scenarios || []).find(s => s.id === scenarioId);
      const phase = scenario ? (scenario.phases || {})[phaseId] : null;

      if (phase && phase.companion_tip) {
        return new Response(JSON.stringify({
          hint: phase.companion_tip,
          mood: phase.companion_mood || 'detective'
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }

      return new Response(JSON.stringify({
        hint: "When in doubt, apply Least Privilege, preserve audit logs, and maintain honest stakeholder communication!",
        mood: 'happy'
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // 5. POST /api/chat
    if (urlStr.includes('/api/chat')) {
      const req = options.body ? JSON.parse(options.body) : {};
      const res = generateBarnabyReply(req.message || '');
      return new Response(JSON.stringify({
        success: true,
        reply: res.reply,
        mood: res.mood,
        suggested_followups: res.suggested_followups
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

  window.addEventListener('DOMContentLoaded', () => {
    const exitBtn = document.createElement('button');
    exitBtn.id = 'cozy-exit-btn';
    exitBtn.className = 'btn-exit-cozy';
    exitBtn.innerHTML = '✕ EXIT TO CONSOLE [ESC]';
    exitBtn.title = 'Return to video game memory cards';
    exitBtn.style.cssText = `
      position: fixed;
      top: 12px;
      right: 16px;
      z-index: 99999;
      background: rgba(30, 20, 15, 0.85);
      backdrop-filter: blur(8px);
      color: #ffd166;
      border: 1px solid rgba(255, 209, 102, 0.5);
      border-radius: 999px;
      padding: 6px 14px;
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0.5px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      transition: all 0.2s ease;
    `;
    exitBtn.onmouseover = () => {
      exitBtn.style.background = '#e76f51';
      exitBtn.style.color = '#fff';
      exitBtn.style.borderColor = '#e76f51';
      exitBtn.style.transform = 'translateY(-1px)';
    };
    exitBtn.onmouseout = () => {
      exitBtn.style.background = 'rgba(30, 20, 15, 0.85)';
      exitBtn.style.color = '#ffd166';
      exitBtn.style.borderColor = 'rgba(255, 209, 102, 0.5)';
      exitBtn.style.transform = 'translateY(0)';
    };
    exitBtn.onclick = exitToConsole;
    document.body.appendChild(exitBtn);
  });
})();
