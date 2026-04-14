/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';

// --- GEMINI API INTEGRATION ---
const callGemini = async (prompt, systemText) => {
  const apiKey = ""; // Execution environment provides the key at runtime
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
  
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: systemText }] }
  };

  const fetchWithRetry = async (retries = 5, delay = 1000) => {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`API Error: ${res.status}`);
      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "> WARNING: No output generated.";
    } catch (err) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchWithRetry(retries - 1, delay * 2);
      }
      throw err;
    }
  };

  return fetchWithRetry();
};

const App = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const cursorRef = useRef(null);
  
  // Typewriter Effect State
  const [typedText, setTypedText] = useState('');
  const phrases = ["Cybersecurity Student", "Builder of Mahoraga Sentinel", "SOC Analyst Aspirant"];
  
  // --- AI FEATURE 1: Skill Explainer State ---
  const [activeSkill, setActiveSkill] = useState(null);
  const [skillExplanation, setSkillExplanation] = useState('');
  const [isExplaining, setIsExplaining] = useState(false);

  // --- AI FEATURE 2: Mahoraga Scanner Demo State ---
  const [demoUrl, setDemoUrl] = useState('http://secure-apple-update.com/login');
  const [analysisResult, setAnalysisResult] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // --- AI FEATURE 3: Core Status State ---
  const [coreMessage, setCoreMessage] = useState('GP');
  const [isCoreLoading, setIsCoreLoading] = useState(false);

  useEffect(() => {
    // Custom Cursor Logic
    const moveCursor = (e) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };
    window.addEventListener('mousemove', moveCursor);

    // Navbar Scroll Blur
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);

    // Intersection Observer for Scroll Animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { threshold: 0.15 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // Typewriter Logic
    let currentPhraseIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;
    let typingTimeout;

    const type = () => {
      const currentPhrase = phrases[currentPhraseIndex];
      if (isDeleting) {
        setTypedText(currentPhrase.substring(0, currentCharIndex - 1));
        currentCharIndex--;
      } else {
        setTypedText(currentPhrase.substring(0, currentCharIndex + 1));
        currentCharIndex++;
      }

      let typingSpeed = isDeleting ? 50 : 100;
      
      if (!isDeleting && currentCharIndex === currentPhrase.length) {
        typingSpeed = 2000; // Pause at end of phrase
        isDeleting = true;
      } else if (isDeleting && currentCharIndex === 0) {
        isDeleting = false;
        currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
        typingSpeed = 500; // Pause before new phrase
      }

      typingTimeout = setTimeout(type, typingSpeed);
    };
    typingTimeout = setTimeout(type, 1000);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
      clearTimeout(typingTimeout);
    };
  }, []);

  // 3D Hover Effect Logics
  const handleCardMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  const handleCardLeave = (e) => {
    const card = e.currentTarget;
    card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
  };

  // --- AI HANDLERS ---
  const handleSkillClick = async (skill) => {
    setActiveSkill(skill);
    setIsExplaining(true);
    setSkillExplanation(`> INITIATING QUERY FOR [${skill}]...\n> ACCESSING NEURAL DATABANKS...`);
    
    try {
      const prompt = `Explain the cybersecurity tool or concept "${skill}" in exactly 2 short sentences. Use a dark, elite hacker tone. Emphasize its tactical usage.`;
      const sysInstruction = "You are an AI cyber-encyclopedia embedded in a hacker's terminal. Be concise, edgy, and highly technical.";
      const result = await callGemini(prompt, sysInstruction);
      setSkillExplanation(`> ${result.replace(/\n/g, '\n> ')}`);
    } catch (e) {
      setSkillExplanation(`> ERROR: MODULE [${skill}] CORRUPTED OR UNREACHABLE.`);
    } finally {
      setIsExplaining(false);
    }
  };

  const handleUrlScan = async () => {
    if (!demoUrl.trim()) return;
    setIsAnalyzing(true);
    setAnalysisResult('> INITIALIZING HEURISTIC SCAN...\n> DECONSTRUCTING URL TOPOLOGY...\n> CHECKING THREAT SIGNATURES...');
    
    try {
      const prompt = `Analyze this URL for potential security threats, phishing indicators, or suspicious patterns: "${demoUrl}". Provide a brief, terminal-style security report (max 3-4 lines). Start the response with "CONFIDENCE: [XX]%".`;
      const sysInstruction = "You are Mahoraga Sentinel, a ruthless, zero-trust cybersecurity AI. Analyze the given URL structure logically based on common phishing heuristics (e.g., suspicious subdomains, typosquatting, weird TLDs). Output as raw terminal text.";
      const result = await callGemini(prompt, sysInstruction);
      setAnalysisResult(`> ${result.replace(/\n/g, '\n> ')}`);
    } catch (e) {
      setAnalysisResult('> ERROR: CONNECTION TO AI CORE SEVERED. SCAN FAILED.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCoreClick = async () => {
    if (isCoreLoading) return;
    setIsCoreLoading(true);
    setCoreMessage('...');
    try {
      const prompt = "Generate a 2-4 word edgy, cyberpunk-style system status or welcome message for a cybersecurity engineer's portfolio. For example: 'SYSTEM SECURED', 'ZERO TRUST ACTIVE', 'MONITORING THREATS', 'NEURAL NET SYNCED'. Only output the status phrase. Don't use quotes.";
      const sysInstruction = "You are an AI core. Output only short, uppercase terminal-style status phrases.";
      const result = await callGemini(prompt, sysInstruction);
      setCoreMessage(result.trim().replace(/['"]/g, ''));
    } catch (e) {
      setCoreMessage('ERR: OFFLINE');
    } finally {
      setIsCoreLoading(false);
    }
  };

  return (
    <div className="portfolio-wrapper">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500&family=Syne:wght@500;700;800&family=Inter:wght@400;500&display=swap');

        :root {
          --bg: #020b18;
          --accent: #00ff88;
          --cyan: #00e5ff;
          --text: #c8d8e8;
          --card: #0a1628;
          --font-mono: 'Fira Code', monospace;
          --font-display: 'Syne', sans-serif;
          --font-body: 'Inter', sans-serif;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
          background-color: var(--bg);
          color: var(--text);
          font-family: var(--font-body);
          overflow-x: hidden;
          cursor: none; /* Custom cursor */
        }

        body::before {
          content: "";
          position: fixed;
          top: 0; left: 0; width: 100%; height: 100%;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          opacity: 0.03;
          pointer-events: none;
          z-index: 999;
        }

        ::selection { background: var(--accent); color: var(--bg); }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: var(--bg); }
        ::-webkit-scrollbar-thumb { background: var(--card); border-radius: 4px; border: 1px solid var(--accent); }

        /* Typography */
        h1, h2, h3, h4, .display-font { font-family: var(--font-display); color: #fff; }
        .mono { font-family: var(--font-mono); }
        .text-accent { color: var(--accent); }
        .text-cyan { color: var(--cyan); }

        /* Custom Cursor */
        .cursor-crosshair {
          position: fixed;
          top: 0; left: 0;
          width: 20px; height: 20px;
          border: 1px solid var(--accent);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
          z-index: 10000;
          transition: width 0.2s, height 0.2s, background-color 0.2s;
        }
        .cursor-crosshair::after {
          content: ''; position: absolute;
          top: 50%; left: 50%;
          width: 4px; height: 4px;
          background: var(--accent);
          border-radius: 50%;
          transform: translate(-50%, -50%);
        }

        /* Layout Utilities */
        .container { max-width: 1200px; margin: 0 auto; padding: 0 2rem; }
        .section { padding: 100px 0; min-height: 100vh; display: flex; flex-direction: column; justify-content: center; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center; }

        /* Navbar */
        nav {
          position: fixed; top: 0; width: 100%; z-index: 1000;
          padding: 1.5rem 0; transition: all 0.3s ease;
        }
        nav.scrolled {
          padding: 1rem 0;
          background: rgba(2, 11, 24, 0.8);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(0, 255, 136, 0.1);
        }
        .nav-inner { display: flex; justify-content: space-between; align-items: center; }
        .logo { font-size: 1.5rem; font-weight: bold; letter-spacing: -1px; display: flex; align-items: center; gap: 0.5rem; }
        .logo .blink { animation: blink 1s step-end infinite; color: var(--accent); }
        .nav-links { display: flex; gap: 2rem; list-style: none; }
        .nav-links a { 
          color: var(--text); text-decoration: none; font-size: 0.9rem; font-weight: 500;
          position: relative; transition: color 0.3s;
        }
        .nav-links a:hover { color: var(--accent); }
        .nav-links a::after {
          content: ''; position: absolute; left: 0; bottom: -5px; width: 0; height: 2px;
          background: var(--accent); transition: width 0.3s ease;
        }
        .nav-links a:hover::after { width: 100%; }
        
        .btn {
          padding: 0.8rem 1.5rem; font-family: var(--font-mono); font-size: 0.9rem;
          border-radius: 4px; cursor: none; transition: all 0.3s ease;
          background: transparent; border: 1px solid var(--accent); color: var(--accent);
          position: relative; overflow: hidden;
          text-decoration: none;
          display: inline-block;
          text-align: center;
        }
        .btn:hover:not(:disabled) { background: var(--accent); color: var(--bg); box-shadow: 0 0 15px rgba(0, 255, 136, 0.4); }
        .btn:disabled { opacity: 0.5; border-color: #647b96; color: #647b96; cursor: not-allowed; }

        /* Animations */
        @keyframes blink { 50% { opacity: 0; } }
        @keyframes scanline {
          0% { transform: scaleX(0); transform-origin: left; }
          50% { transform: scaleX(1); transform-origin: left; }
          50.1% { transform: scaleX(1); transform-origin: right; }
          100% { transform: scaleX(0); transform-origin: right; }
        }
        @keyframes glitch {
          0% { text-shadow: 2px 0 var(--accent), -2px 0 var(--cyan); }
          20% { text-shadow: -2px 0 var(--accent), 2px 0 var(--cyan); }
          40% { text-shadow: 2px 0 var(--accent), -2px 0 var(--cyan); }
          60% { text-shadow: -2px 0 var(--accent), 2px 0 var(--cyan); }
          80% { text-shadow: 2px 0 var(--accent), -2px 0 var(--cyan); }
          100% { text-shadow: 0 0 var(--accent), 0 0 var(--cyan); }
        }
        @keyframes orbit { 100% { transform: rotate(360deg); } }
        @keyframes flyGrid { 0% { background-position: 0 0; } 100% { background-position: 0 50px; } }
        @keyframes pulseRing { 0% { box-shadow: 0 0 0 0 rgba(0,255,136,0.4); } 70% { box-shadow: 0 0 0 20px rgba(0,255,136,0); } 100% { box-shadow: 0 0 0 0 rgba(0,255,136,0); } }

        /* Section Headings */
        .section-heading {
          font-family: var(--font-mono); font-size: 1.5rem; color: #fff;
          margin-bottom: 3rem; position: relative; display: inline-block;
        }
        .section-heading::before {
          content: ''; position: absolute; bottom: -10px; left: 0; width: 100%; height: 2px;
          background: var(--accent); animation: scanline 3s infinite linear;
        }

        /* Scroll Reveals */
        .reveal {
          opacity: 0; transform: translateY(50px) rotateX(15deg);
          transition: opacity 0.8s ease, transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .reveal.is-visible { opacity: 1; transform: translateY(0) rotateX(0); }

        /* Hero Section */
        #home { position: relative; }
        .hero-bg {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(transparent 95%, rgba(0, 255, 136, 0.1) 100%), 
                      linear-gradient(90deg, transparent 95%, rgba(0, 255, 136, 0.1) 100%);
          background-size: 50px 50px; transform: perspective(500px) rotateX(60deg) scale(2);
          transform-origin: bottom; animation: flyGrid 4s linear infinite; z-index: -1;
        }
        .tag-hello { display: inline-block; color: var(--accent); margin-bottom: 1rem; letter-spacing: 2px; }
        .hero-title { font-size: 5rem; font-weight: 800; line-height: 1; margin-bottom: 1rem; }
        .hero-title:hover { animation: glitch 0.3s ease infinite; }
        .hero-subtitle { font-size: 1.5rem; color: var(--cyan); min-height: 30px; margin-bottom: 1.5rem; }
        .hero-desc { max-width: 500px; font-size: 1.1rem; line-height: 1.6; margin-bottom: 2.5rem; color: #8fa6c2; }
        .hero-btns { display: flex; gap: 1rem; }
        
        .avatar-container { 
          position: relative; width: 100%; max-width: 350px; aspect-ratio: 1; margin: 0 auto; 
          transform-style: preserve-3d; transition: transform 0.1s ease-out;
        }
        .avatar-container:hover .avatar-ring,
        .avatar-container:hover .avatar-ring::before,
        .avatar-container:hover .orbit-badge {
          animation-play-state: paused;
        }
        .avatar-ring {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          border: 2px dashed rgba(0, 255, 136, 0.3); border-radius: 50%;
          animation: orbit 20s linear infinite;
        }
        .avatar-ring::before {
          content:''; position:absolute; top: 10%; left: 10%; right: 10%; bottom: 10%;
          border: 1px solid rgba(0, 229, 255, 0.2); border-radius: 50%; animation: orbit 15s linear infinite reverse;
        }
        .orbit-badge {
          position: absolute; background: var(--card); border: 1px solid var(--accent);
          color: var(--accent); padding: 0.5rem 1rem; border-radius: 20px;
          font-family: var(--font-mono); font-size: 0.75rem; white-space: nowrap;
          transition: background 0.3s ease, color 0.3s ease, box-shadow 0.3s ease; cursor: pointer; z-index: 10;
          box-shadow: 0 0 10px rgba(0,0,0,0.5);
        }
        .orbit-badge:hover {
          background: var(--accent); color: var(--bg);
          box-shadow: 0 0 20px rgba(0, 255, 136, 0.6);
        }
        
        /* Counter-rotation to keep badge text perfectly horizontal while orbiting */
        @keyframes counter-orbit-1 { 0% { transform: translate(-50%, -50%) rotate(0deg); } 100% { transform: translate(-50%, -50%) rotate(-360deg); } }
        @keyframes counter-orbit-2 { 0% { transform: translate(-50%, 50%) rotate(0deg); } 100% { transform: translate(-50%, 50%) rotate(-360deg); } }
        @keyframes counter-orbit-3 { 0% { transform: translate(-50%, -50%) rotate(0deg); } 100% { transform: translate(-50%, -50%) rotate(-360deg); } }
        @keyframes counter-orbit-4 { 0% { transform: translate(50%, -50%) rotate(0deg); } 100% { transform: translate(50%, -50%) rotate(-360deg); } }

        .badge-1 { top: 0; left: 50%; animation: counter-orbit-1 20s linear infinite; }
        .badge-2 { bottom: 0; left: 50%; animation: counter-orbit-2 20s linear infinite; }
        .badge-3 { top: 50%; left: 0; animation: counter-orbit-3 20s linear infinite; }
        .badge-4 { top: 50%; right: 0; animation: counter-orbit-4 20s linear infinite; }

        .avatar-core {
          position: absolute; top: 25%; left: 25%; width: 50%; height: 50%;
          background: radial-gradient(circle, var(--card) 0%, var(--bg) 100%);
          border-radius: 50%; border: 2px solid var(--accent);
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          box-shadow: 0 0 50px rgba(0, 255, 136, 0.2) inset, 0 0 30px rgba(0, 255, 136, 0.1);
          transition: all 0.3s ease; cursor: pointer; z-index: 5;
        }
        .avatar-container:hover .avatar-core {
          box-shadow: 0 0 60px rgba(0, 255, 136, 0.4) inset, 0 0 40px rgba(0, 255, 136, 0.2);
          border-color: var(--cyan);
        }
        .avatar-core:hover span.core-text {
          animation: glitch 0.3s ease infinite;
          opacity: 1 !important;
          color: #fff !important;
        }
        .core-hint {
          position: absolute; bottom: 15%; font-family: var(--font-mono); font-size: 0.65rem;
          color: var(--cyan); opacity: 0; transition: opacity 0.3s; text-transform: uppercase;
          background: rgba(2, 11, 24, 0.8); padding: 2px 6px; border-radius: 4px;
        }
        .avatar-core:hover .core-hint { opacity: 1; }

        /* Terminal Window Styles */
        .terminal {
          background: #050d1a; border: 1px solid #1a2a40; border-radius: 8px;
          overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        .term-header {
          background: #0a1628; padding: 0.8rem 1rem; border-bottom: 1px solid #1a2a40;
          display: flex; gap: 8px; align-items: center;
        }
        .term-dot { width: 12px; height: 12px; border-radius: 50%; }
        .dot-r { background: #ff5f56; } .dot-y { background: #ffbd2e; } .dot-g { background: #27c93f; }
        .term-body { padding: 1.5rem; font-family: var(--font-mono); font-size: 0.95rem; line-height: 1.6; }
        .prompt { color: var(--cyan); }
        .command { color: #fff; }
        .output { color: var(--accent); margin: 1rem 0; white-space: pre-wrap; }

        /* Stats Cards */
        .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-top: 2rem; }
        .stat-card {
          background: var(--card); padding: 1.5rem 1rem; border-radius: 8px; text-align: center;
          border: 1px solid rgba(0, 255, 136, 0.1);
        }
        .stat-num { font-size: 1.5rem; font-weight: bold; color: var(--accent); margin-bottom: 0.5rem; }
        .stat-label { font-size: 0.8rem; color: #8fa6c2; text-transform: uppercase; letter-spacing: 1px; }

        /* Skills */
        .skills-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
        .skill-category { background: var(--card); padding: 2rem; border-radius: 8px; border: 1px solid #1a2a40; }
        .skill-category h3 { margin-bottom: 1.5rem; font-size: 1.2rem; display: flex; align-items: center; gap: 10px;}
        .skill-category h3::before { content:''; display:block; width:10px; height:10px; background:var(--accent); }
        .tags { display: flex; flex-wrap: wrap; gap: 0.8rem; }
        .skill-tag {
          padding: 0.5rem 1rem; border: 1px solid var(--accent); border-radius: 4px;
          font-family: var(--font-mono); font-size: 0.85rem; color: var(--accent);
          transition: all 0.3s; background: rgba(0, 255, 136, 0.05); cursor: none;
        }
        .skill-tag:hover { background: var(--accent); color: var(--bg); box-shadow: 0 0 10px rgba(0, 255, 136, 0.5); transform: translateY(-2px); }
        
        .progress-group { margin-top: 3rem; display: grid; gap: 1.5rem; }
        .progress-item { display: flex; flex-direction: column; gap: 0.5rem; }
        .progress-header { display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: 0.9rem; }
        .progress-bar-bg { width: 100%; height: 6px; background: #1a2a40; border-radius: 3px; overflow: hidden; }
        .progress-bar-fill { height: 100%; background: var(--cyan); transition: width 1.5s cubic-bezier(0.2, 0.8, 0.2, 1); }

        /* Featured Project */
        .featured-project {
          background: var(--card); border-radius: 12px; padding: 4rem; position: relative; overflow: hidden;
          border: 1px solid; border-image: linear-gradient(45deg, var(--accent), var(--cyan)) 1;
          box-shadow: 0 0 40px rgba(0, 255, 136, 0.05);
        }
        .fp-grid { display: grid; grid-template-columns: 1fr 1.1fr; gap: 4rem; align-items: center; position: relative; z-index: 2; }
        .fp-tag { display: inline-block; padding: 0.3rem 0.8rem; background: rgba(0,255,136,0.1); color: var(--accent); font-family: var(--font-mono); font-size: 0.8rem; margin-bottom: 1rem; border-radius: 20px;}
        .fp-title { font-size: 3rem; margin-bottom: 0.5rem; }
        .fp-subtitle { font-size: 1.2rem; color: #8fa6c2; margin-bottom: 2rem; }
        .fp-list { list-style: none; margin-bottom: 2rem; font-family: var(--font-mono); font-size: 0.9rem; color: #b0c4de;}
        .fp-list li { margin-bottom: 1rem; display: flex; gap: 10px; }
        .fp-list li::before { content: '▸'; color: var(--cyan); }
        
        /* Interactive Mock UI */
        .mock-ui { background: #0f1c2e; border: 1px solid #2a3f5f; border-radius: 12px; min-height: 400px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6);}
        .mock-header { background: #1a2a40; padding: 10px; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid #2a3f5f; }
        .mock-body { padding: 2rem; display: flex; flex-direction: column; gap: 1rem; flex: 1; }
        .scan-ring { 
          width: 80px; height: 80px; border-radius: 50%; border: 3px solid; 
          display: flex; align-items: center; justify-content: center; margin: 0 auto;
          transition: all 0.3s ease;
        }
        .scan-ring.scanning { animation: pulseRing 1.5s infinite; }
        .demo-input {
          width: 100%; background: #050d1a; border: 1px solid #2a3f5f; border-radius: 4px;
          padding: 12px; color: #fff; font-family: var(--font-mono); font-size: 0.9rem; text-align: center;
          outline: none; transition: border-color 0.3s;
        }
        .demo-input:focus { border-color: var(--accent); box-shadow: 0 0 10px rgba(0,255,136,0.2); }
        .demo-output {
          background: #050d1a; padding: 1rem; border-radius: 4px; border-left: 2px solid var(--accent);
          font-family: var(--font-mono); font-size: 0.8rem; color: var(--cyan); white-space: pre-wrap;
          min-height: 80px; overflow-y: auto; max-height: 150px;
        }

        /* Lab & Projects */
        .card-3d {
          background: var(--card); padding: 2.5rem; border-radius: 8px; border: 1px solid #1a2a40;
          transition: transform 0.1s, box-shadow 0.3s; transform-style: preserve-3d; cursor: none;
        }
        .card-3d:hover { box-shadow: 0 0 30px rgba(0, 229, 255, 0.15); border-color: var(--cyan); }
        .card-3d h3 { margin-bottom: 1rem; font-size: 1.5rem; transform: translateZ(30px); }
        .card-3d ul { list-style: none; color: #8fa6c2; margin-bottom: 2rem; transform: translateZ(20px); }
        .card-3d ul li { margin-bottom: 0.8rem; position: relative; padding-left: 1.5rem; }
        .card-3d ul li::before { content: '>'; position: absolute; left: 0; color: var(--accent); font-family: var(--font-mono); }
        .card-3d .tags { transform: translateZ(40px); }

        /* Certifications */
        .cert-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; }
        .cert-card {
          background: linear-gradient(145deg, #0a1628, #050d1a); padding: 2rem;
          border-radius: 12px; border: 1px solid #1a2a40; text-align: center;
          transition: all 0.3s ease; position: relative; overflow: hidden;
        }
        .cert-card:hover { transform: translateY(-10px); border-color: var(--accent); }
        .cert-card::before {
          content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 2px;
          background: var(--accent); transform: scaleX(0); transition: transform 0.3s;
        }
        .cert-card:hover::before { transform: scaleX(1); }
        .cert-icon { font-size: 2.5rem; margin-bottom: 1rem; filter: drop-shadow(0 0 10px rgba(0,255,136,0.4)); }
        .cert-title { font-family: var(--font-display); font-size: 1.1rem; margin-bottom: 0.5rem; color: #fff; }
        .cert-issuer { font-family: var(--font-mono); font-size: 0.8rem; color: var(--cyan); margin-bottom: 0.5rem; }
        .cert-date { font-size: 0.8rem; color: #647b96; }

        /* Contact */
        .form-group { margin-bottom: 2rem; position: relative; }
        .form-control {
          width: 100%; background: transparent; border: none; border-bottom: 1px solid #2a3f5f;
          padding: 10px 0; color: #fff; font-family: var(--font-body); font-size: 1rem; outline: none;
          transition: border-color 0.3s;
        }
        .form-control:focus { border-bottom-color: var(--accent); }
        .form-control::placeholder { color: #647b96; }
        footer { text-align: center; padding: 2rem 0; border-top: 1px solid #1a2a40; font-family: var(--font-mono); font-size: 0.85rem; color: #647b96; }

        @media (max-width: 900px) {
          .grid-2 { grid-template-columns: 1fr; }
          .hero-title { font-size: 3.5rem; }
          .stats-row { grid-template-columns: 1fr 1fr; }
          .fp-grid { grid-template-columns: 1fr; }
          .cert-grid { grid-template-columns: 1fr 1fr; }
          .nav-links { display: none; }
        }
        @media (max-width: 600px) {
          .cert-grid { grid-template-columns: 1fr; }
          .stats-row { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Custom Cursor */}
      <div className="cursor-crosshair" ref={cursorRef}></div>

      {/* Navigation */}
      <nav className={isScrolled ? 'scrolled' : ''}>
        <div className="container nav-inner">
          <div className="logo mono">
            G//P<span className="blink">_</span>
          </div>
          <ul className="nav-links mono">
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#skills">Skills</a></li>
            <li><a href="#projects">Projects</a></li>
            <li><a href="#certs">Certs</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
          <a href="#contact" className="btn d-none-mobile">Hire Me</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="section" style={{ minHeight: '100vh', paddingTop: '100px' }}>
        <div className="hero-bg"></div>
        <div className="container grid-2">
          <div className="hero-content reveal">
            <span className="tag-hello mono">&lt; HELLO, I'M /&gt;</span>
            <h1 className="hero-title glitch text-accent" data-text="GAUTHAM P">GAUTHAM P</h1>
            <h2 className="hero-subtitle mono">
              {typedText}<span className="blink">|</span>
            </h2>
            <p className="hero-desc">
              Building AI-powered security tools that protect users from phishing and malware — no cloud, full privacy.
            </p>
            <div className="hero-btns">
              <a href="#projects" className="btn">View Projects</a>
              <a href="#contact" className="btn" style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }}>Download Resume</a>
            </div>
          </div>
          
          <div className="avatar-container reveal" style={{ transitionDelay: '0.2s' }} onMouseMove={handleCardMove} onMouseLeave={handleCardLeave}>
            <div className="avatar-ring">
              <div className="orbit-badge badge-1" onClick={() => { document.getElementById('skills').scrollIntoView({behavior: 'smooth'}); handleSkillClick('Python'); }}>Python</div>
              <div className="orbit-badge badge-2" onClick={() => { document.getElementById('skills').scrollIntoView({behavior: 'smooth'}); handleSkillClick('FastAPI'); }}>FastAPI</div>
              <div className="orbit-badge badge-3" onClick={() => { document.getElementById('skills').scrollIntoView({behavior: 'smooth'}); handleSkillClick('Chrome MV3'); }}>Chrome MV3</div>
              <div className="orbit-badge badge-4" onClick={() => { document.getElementById('skills').scrollIntoView({behavior: 'smooth'}); handleSkillClick('Machine Learning'); }}>ML</div>
            </div>
            <div className="avatar-core" onClick={handleCoreClick}>
              <span className="mono core-text" style={{ 
                color: 'var(--accent)', 
                fontSize: coreMessage.length > 3 ? '1rem' : '3rem', 
                opacity: isCoreLoading ? 1 : 0.5, 
                transition: 'all 0.3s',
                textAlign: 'center',
                padding: '0 10px',
                lineHeight: '1.2'
              }}>
                {isCoreLoading ? <span className="blink">SYNC...</span> : coreMessage}
              </span>
              {coreMessage === 'GP' && <div className="core-hint">INITIATE AI ✨</div>}
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="section container">
        <h2 className="section-heading reveal">// WHOAMI</h2>
        <div className="grid-2">
          <div className="terminal reveal">
            <div className="term-header">
              <div className="term-dot dot-r"></div>
              <div className="term-dot dot-y"></div>
              <div className="term-dot dot-g"></div>
            </div>
            <div className="term-body">
              <span className="prompt">root@jnn:~#</span> <span className="command">whoami</span>
              <div className="output">Gautham P</div>
              <span className="prompt">root@jnn:~#</span> <span className="command">cat about.txt</span>
              <div className="output">
                B.E. CSE (Cybersecurity) @ J.N.N. Institute of Engineering<br/>
                Expected Graduation: 2029<br/>
                Location: Chennai, TN<br/>
                Focus: AI Security Tools, Vulnerability Assessment, SOC
              </div>
              <span className="prompt">root@jnn:~#</span> <span className="blink">_</span>
            </div>
          </div>
          
          <div className="about-text reveal" style={{ transitionDelay: '0.2s' }}>
            <h3 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Securing the web, locally.</h3>
            <p style={{ lineHeight: '1.8', color: '#8fa6c2', marginBottom: '2rem' }}>
              I'm a cybersecurity student who builds real, applicable security tools. My flagship project, <span className="text-accent">Mahoraga Sentinel</span>, is a local AI-powered phishing & malware URL detector. I believe in zero-cloud dependency and full user privacy.
            </p>
            <p style={{ lineHeight: '1.8', color: '#8fa6c2' }}>
              When I'm not coding extensions or training ML models, I'm analyzing network traffic in Wireshark or hunting vulnerabilities in labs.
            </p>
          </div>
        </div>

        <div className="stats-row reveal">
          <div className="stat-card">
            <div className="stat-num mono">10,000+</div>
            <div className="stat-label">URLs Trained On</div>
          </div>
          <div className="stat-card">
            <div className="stat-num mono">&gt;92%</div>
            <div className="stat-label">Detection Accuracy</div>
          </div>
          <div className="stat-card">
            <div className="stat-num mono">&lt;200ms</div>
            <div className="stat-label">Inference Latency</div>
          </div>
          <div className="stat-card">
            <div className="stat-num mono">MV3</div>
            <div className="stat-label">Chrome Extension</div>
          </div>
        </div>
      </section>

      {/* Skills Section with AI Integration */}
      <section id="skills" className="section container">
        <h2 className="section-heading reveal">// TECHNICAL SKILLS</h2>
        <p className="mono" style={{ color: '#8fa6c2', marginBottom: '2rem', fontSize: '0.9rem' }}>
          &gt; Select a tag below to execute an <span className="text-accent">AI Skill Intel ✨</span> query.
        </p>
        <div className="grid-2">
          <div className="skills-grid reveal">
            <div className="skill-category">
              <h3 className="mono">Offense & Analysis</h3>
              <div className="tags">
                <span className="skill-tag" onClick={() => handleSkillClick('Nmap')}>Nmap</span>
                <span className="skill-tag" onClick={() => handleSkillClick('Burp Suite')}>Burp Suite</span>
                <span className="skill-tag" onClick={() => handleSkillClick('Nessus')}>Nessus</span>
                <span className="skill-tag" onClick={() => handleSkillClick('Wireshark')}>Wireshark</span>
              </div>
            </div>
            <div className="skill-category">
              <h3 className="mono">Languages</h3>
              <div className="tags">
                <span className="skill-tag" onClick={() => handleSkillClick('Python')}>Python</span>
                <span className="skill-tag" onClick={() => handleSkillClick('SQL')}>SQL</span>
                <span className="skill-tag" onClick={() => handleSkillClick('JavaScript')}>JavaScript</span>
                <span className="skill-tag" onClick={() => handleSkillClick('Bash')}>Bash</span>
              </div>
            </div>
            <div className="skill-category">
              <h3 className="mono">Frameworks</h3>
              <div className="tags">
                <span className="skill-tag" onClick={() => handleSkillClick('FastAPI')}>FastAPI</span>
                <span className="skill-tag" onClick={() => handleSkillClick('Flask')}>Flask</span>
                <span className="skill-tag" onClick={() => handleSkillClick('scikit-learn')}>scikit-learn</span>
                <span className="skill-tag" onClick={() => handleSkillClick('pandas')}>pandas</span>
              </div>
            </div>
            <div className="skill-category">
              <h3 className="mono">Concepts</h3>
              <div className="tags">
                <span className="skill-tag" onClick={() => handleSkillClick('OWASP Top 10')}>OWASP Top 10</span>
                <span className="skill-tag" onClick={() => handleSkillClick('CVE/CWE')}>CVE/CWE</span>
                <span className="skill-tag" onClick={() => handleSkillClick('TCP/IP')}>TCP/IP</span>
                <span className="skill-tag" onClick={() => handleSkillClick('Chrome MV3 Ext')}>MV3 Ext</span>
              </div>
            </div>
          </div>

          <div className="progress-group reveal" style={{ transitionDelay: '0.2s', marginTop: 0 }}>
            {/* AI Skill Intel Terminal */}
            <div className="terminal">
              <div className="term-header">
                <div className="term-dot dot-r"></div>
                <div className="term-dot dot-y"></div>
                <div className="term-dot dot-g"></div>
                <span className="mono" style={{marginLeft:'10px', fontSize:'0.8rem', color:'#8fa6c2'}}>AI_INTEL_MODULE.exe ✨</span>
              </div>
              <div className="term-body" style={{ minHeight: '180px' }}>
                <span className="prompt">root@ai-intel:~#</span> <span className="command">query_skill {activeSkill ? `--target="${activeSkill}"` : '--awaiting-selection'}</span>
                <div className="output" style={{ color: isExplaining ? 'var(--cyan)' : 'var(--accent)', marginTop: '1rem', lineHeight: '1.8' }}>
                  {skillExplanation || "> Awaiting input. Click a skill tag to retrieve tactical intelligence."}
                  {isExplaining && <span className="blink">_</span>}
                </div>
              </div>
            </div>

            {[
              { name: 'Python', pct: 90 },
              { name: 'Cybersecurity Tools', pct: 85 },
              { name: 'Web Extensions', pct: 80 }
            ].map((skill, i) => (
              <div className="progress-item" key={i}>
                <div className="progress-header">
                  <span>{skill.name}</span>
                  <span className="text-cyan">{skill.pct}%</span>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${skill.pct}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Project Section with Interactive AI Scanner */}
      <section id="projects" className="section container">
        <div className="featured-project reveal">
          <div className="fp-grid">
            <div>
              <span className="fp-tag">[ FEATURED PROJECT ]</span>
              <h2 className="fp-title text-accent">MAHORAGA SENTINEL</h2>
              <p className="fp-subtitle mono">AI-Powered Phishing & Malware URL Detector</p>
              
              <div className="tags" style={{ marginBottom: '2rem' }}>
                <span className="skill-tag">Python</span>
                <span className="skill-tag">FastAPI</span>
                <span className="skill-tag">scikit-learn</span>
                <span className="skill-tag">Chrome MV3</span>
              </div>

              <ul className="fp-list">
                <li>End-to-end on-device URL threat detection — zero cloud dependency.</li>
                <li>ML classifier trained on 10,000+ URL samples — &gt;92% detection accuracy.</li>
                <li>FastAPI backend with &lt;200ms inference + retry/timeout resilience.</li>
                <li>Chrome Extension (MV3) with right-click scan & service-worker REST.</li>
              </ul>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <a href="#" className="btn">View on GitHub</a>
                <a href="#" className="btn" style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }}>Read SECURITY.md</a>
              </div>
            </div>

            {/* Interactive Mock UI using Gemini */}
            <div className="mock-ui">
              <div className="mock-header mono" style={{ fontSize: '0.8rem', color: '#8fa6c2' }}>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <span style={{ width: '8px', height:'8px', background: '#ff5f56', borderRadius: '50%'}}></span>
                  <span style={{ width: '8px', height:'8px', background: '#ffbd2e', borderRadius: '50%'}}></span>
                  <span style={{ width: '8px', height:'8px', background: '#27c93f', borderRadius: '50%'}}></span>
                </div>
                <span style={{ marginLeft: '10px'}}>Mahoraga Sentinel - Live AI Demo</span>
              </div>
              <div className="mock-body">
                <div className={`scan-ring mono ${isAnalyzing ? 'scanning' : ''}`} style={{ borderColor: isAnalyzing ? 'var(--cyan)' : 'var(--accent)', color: isAnalyzing ? 'var(--cyan)' : 'var(--accent)' }}>
                  {isAnalyzing ? 'SCAN' : 'READY'}
                </div>
                
                <input 
                  type="text" 
                  className="demo-input" 
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  placeholder="Enter a suspicious URL..."
                  disabled={isAnalyzing}
                />
                
                <button 
                  className="btn" 
                  style={{ width: '100%', borderColor: isAnalyzing ? '#647b96' : 'var(--accent)' }} 
                  onClick={handleUrlScan}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? 'ANALYZING THREATS...' : 'AI THREAT SCAN ✨'}
                </button>

                <div className="demo-output">
                  {analysisResult || '> System idle. Enter a URL to simulate heuristic scanning via AI core.'}
                  {isAnalyzing && <span className="blink">_</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Labs & Academic Projects */}
      <section className="section container">
        <h2 className="section-heading reveal">// LABS & ACADEMIC PROJECTS</h2>
        <div className="grid-2">
          
          <div className="card-3d reveal" onMouseMove={handleCardMove} onMouseLeave={handleCardLeave}>
            <h3 className="text-cyan">Vulnerability Assessment Lab</h3>
            <ul>
              <li>Nmap topology mapping across 20+ simulated hosts.</li>
              <li>CVE scanning with Nessus, CVSS triage, and remediation documentation.</li>
              <li>Wireshark analysis of 5+ capture files for anomalous traffic.</li>
            </ul>
            <div className="tags">
              <span className="skill-tag">Nmap</span>
              <span className="skill-tag">Nessus</span>
              <span className="skill-tag">Wireshark</span>
            </div>
          </div>

          <div className="card-3d reveal" style={{ transitionDelay: '0.2s' }} onMouseMove={handleCardMove} onMouseLeave={handleCardLeave}>
            <h3 className="text-cyan">Web App Security Testing</h3>
            <ul>
              <li>Burp Suite HTTP interception for identifying SQLi, XSS, and IDOR.</li>
              <li>OWASP-aligned vulnerability reports mapping business risk.</li>
              <li>Crafted precise Proof-of-Concept (PoC) exploits in isolated labs.</li>
            </ul>
            <div className="tags">
              <span className="skill-tag">Burp Suite</span>
              <span className="skill-tag">OWASP</span>
              <span className="skill-tag">SQLi</span>
            </div>
          </div>

        </div>
      </section>

      {/* Certifications */}
      <section id="certs" className="section container">
        <h2 className="section-heading reveal">// CERTIFICATIONS & ACHIEVEMENTS</h2>
        <div className="cert-grid">
          {[
            { title: "Pre Security Path", issuer: "TryHackMe", date: "Jan 2026", icon: "🛡️" },
            { title: "SQL Basic", issuer: "HackerRank", date: "2025", icon: "🗄️" },
            { title: "Intro to Cybersecurity", issuer: "Cisco", date: "2024", icon: "🌐" },
            { title: "Cybersecurity Sim", issuer: "MasterCard (Forage)", date: "2024", icon: "💳" },
            { title: "Data Science Sim", issuer: "CommBank (Forage)", date: "2024", icon: "📊" },
            { title: "Smarthathon 2.0", issuer: "L&T + IEEE IAS", date: "Mar 2026", icon: "🏆" }
          ].map((cert, idx) => (
            <div className="cert-card reveal" style={{ transitionDelay: `${idx * 0.1}s` }} key={idx}>
              <div className="cert-icon">{cert.icon}</div>
              <h4 className="cert-title">{cert.title}</h4>
              <div className="cert-issuer mono">{cert.issuer}</div>
              <div className="cert-date mono">{cert.date}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="section container">
        <h2 className="section-heading reveal">// GET IN TOUCH</h2>
        <div className="grid-2">
          
          <div className="terminal reveal">
            <div className="term-header">
              <div className="term-dot dot-r"></div>
              <div className="term-dot dot-y"></div>
              <div className="term-dot dot-g"></div>
            </div>
            <div className="term-body">
              <span className="prompt">root@jnn:~#</span> <span className="command">contact --gautham</span>
              <div className="output" style={{ color: '#c8d8e8' }}>
                <span className="text-accent">EMAIL  &gt;</span> pgautham67@jnn.edu.in<br/>
                <span className="text-accent">PHONE  &gt;</span> +91 6379905110<br/>
                <span className="text-accent">GITHUB &gt;</span> github.com/gautham2117<br/>
                <span className="text-accent">LINKED &gt;</span> linkedin.com/in/gautham-p-554642370<br/>
                <span className="text-accent">CITY   &gt;</span> Chennai, TN
              </div>
              <span className="prompt">root@jnn:~#</span> <span className="blink">_</span>
            </div>
          </div>

          <div className="contact-form reveal" style={{ transitionDelay: '0.2s', padding: '2rem' }}>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="form-group">
                <input type="text" className="form-control" placeholder="YOUR NAME" required />
              </div>
              <div className="form-group">
                <input type="email" className="form-control" placeholder="YOUR EMAIL" required />
              </div>
              <div className="form-group">
                <textarea className="form-control" placeholder="SECURE MESSAGE..." rows="4" required style={{ resize: 'none' }}></textarea>
              </div>
              <button type="submit" className="btn" style={{ width: '100%', marginTop: '1rem', cursor: 'none' }}>Initiate Handshake</button>
            </form>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="container">
          <p>© 2025 Gautham P — Built with passion for security.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;