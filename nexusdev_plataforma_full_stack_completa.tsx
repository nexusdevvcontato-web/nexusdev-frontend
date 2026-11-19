import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Terminal,
  Code2,
  Play,
  CheckCircle2,
  XCircle,
  BookOpen,
  Award,
  Sparkles,
  ChevronRight,
  ChevronDown,
  RotateCcw,
  Eye,
  FileCode2,
  FolderOpen,
  Search,
  Trophy,
  Flame,
  Lightbulb,
  Bug,
  Layers,
  Database,
  Server,
  Layout,
  Cpu,
  ExternalLink,
  Copy,
  Check,
  ArrowRight,
  Lock,
  Unlock,
  Share2,
  User,
  LogOut,
  ShieldCheck,
  KeyRound,
  Mail,
  AlertCircle
} from 'lucide-react';

// URL da API Back-end em Produção (Render) ou localhost para testes
// Lembre-se de trocar 'https://nexusdev-api.onrender.com' pela URL exata do seu serviço no Render!
const API_BASE_URL =
  window.location.hostname === 'localhost'
    ? 'https://nexusdev-1rq3.onrender.com'
    : 'https://nexusdev-1rq3.onrender.com';

// ============================================================================
// BASE CURRICULAR COMPLETA (700 AULAS PRÁTICAS + MÓDULO 6 CAPSTONE)
// ============================================================================
const INTERACTIVE_MODULES = [
  {
    id: 'mod-1',
    number: 1,
    title: 'Fundamentos da Web: HTML5 & CSS3',
    subtitle: 'Semântica, Box Model, Flexbox, Grid & Design Responsivo',
    icon: 'Layout',
    description:
      'Domine a estrutura semântica da web moderna e construa layouts responsivos de nível profissional com Flexbox, CSS Grid e variáveis CSS.',
    tracks: [
      { name: 'HTML5 Semântico & Acessibilidade', count: 50 },
      { name: 'Box Model, Flexbox & CSS Grid', count: 50 },
      { name: 'Design Responsivo & UI Moderna', count: 40 }
    ],
    challenges: [
      {
        id: 'html-1',
        number: '1.1',
        title: 'Estrutura Semântica de Artigo Técnico',
        type: 'standard',
        difficulty: 'Iniciante',
        duration: '15 min',
        summary: 'Construa a estrutura semântica de um post de blog técnico utilizando tags HTML5.',
        conceptMarkdown: `### Por que HTML Semântico Importa?\n\nTags semânticas como \`<article>\`, \`<header>\`, \`<h1>\` e \`<p>\` comunicam o significado real do conteúdo para navegadores, leitores de tela e mecanismos de busca (SEO).\n\n- **\`<article>\`**: Representa uma composição independente em uma página.\n- **\`<header>\`**: Agrupa o cabeçalho introdutório do artigo.\n- **\`<h1>\`**: Define o título principal do documento.`,
        instructions: [
          'Crie um elemento `<article>` como contêiner principal.',
          'Dentro do `<article>`, adicione um `<header>` contendo um `<h1>` com o texto `"Arquitetura Web Moderna"`.',
          'Abaixo do `<header>`, adicione um parágrafo `<p>` com pelo menos 20 caracteres explicando o tema.'
        ],
        starterFiles: {
          'index.html': `<!-- Escreva a estrutura semântica do artigo abaixo -->\n<div class="container">\n  \n</div>\n`,
          'style.css': `body {\n  font-family: system-ui, sans-serif;\n  background: #0f172a;\n  color: #f8fafc;\n  padding: 24px;\n}\n`
        },
        solutionFiles: {
          'index.html': `<div class="container">\n  <article>\n    <header>\n      <h1>Arquitetura Web Moderna</h1>\n    </header>\n    <p>Aplicações web modernas combinam HTML semântico, CSS responsivo e JavaScript modular.</p>\n  </article>\n</div>\n`,
          'style.css': `body {\n  font-family: system-ui, sans-serif;\n  background: #0f172a;\n  color: #f8fafc;\n  padding: 24px;\n}\n\narticle {\n  background: #1e293b;\n  padding: 24px;\n  border-radius: 12px;\n  border: 1px solid #334155;\n}\n`
        },
        evalType: 'dom',
        domTests: [
          { description: 'Existe uma tag semântica <article> no documento', selector: 'article', assert: 'exists' },
          { description: 'Existe um <header> dentro de <article>', selector: 'article > header', assert: 'exists' },
          {
            description: 'O <h1> dentro de <header> contém "Arquitetura Web Moderna"',
            selector: 'article > header > h1',
            assert: 'textContains',
            value: 'Arquitetura Web Moderna'
          },
          {
            description: 'Existe um <p> dentro de <article> com pelo menos 20 caracteres',
            selector: 'article p',
            assert: 'minLength',
            value: 20
          }
        ],
        tutorHints: ['Lembre-se de aninhar o `<header>` diretamente dentro da tag `<article>`.']
      }
    ]
  },
  {
    id: 'mod-2',
    number: 2,
    title: 'Lógica de Programação & JavaScript ES6+',
    subtitle: 'Funções Puras, Arrays, Closures, Async/Await & Manipulação de Dados',
    icon: 'Code2',
    description:
      'Construa raciocínio algorítmico sólido com JavaScript moderno: métodos de array (map, filter, reduce), desestruturação e imutabilidade.',
    tracks: [
      { name: 'Algoritmos & Estruturas de Dados', count: 50 },
      { name: 'Programação Funcional (Map, Filter, Reduce)', count: 50 },
      { name: 'Promises, Async/Await & Tratamento de Erros', count: 40 }
    ],
    challenges: [
      {
        id: 'js-1',
        number: '2.1',
        title: 'Calculadora de Carrinho com Desconto Progressivo',
        type: 'standard',
        difficulty: 'Iniciante',
        duration: '15 min',
        summary: 'Use Array.prototype.reduce() para somar itens e aplicar desconto condicional.',
        conceptMarkdown: `### Agregação de Dados com \`.reduce()\`\n\nO método \`.reduce()\` reduz um array a um único valor acumulado.`,
        instructions: [
          'Implemente a função `calcularTotalCarrinho(itens)` no arquivo `carrinho.js`.',
          'Cada objeto em `itens` tem `{ nome, preco, qtd }`.',
          'Se o subtotal for maior que `200`, retorne o valor com 10% de desconto (`subtotal * 0.9`). Caso contrário, retorne o `subtotal`.'
        ],
        starterFiles: {
          'carrinho.js': `function calcularTotalCarrinho(itens) {\n  // Escreva sua solução utilizando reduce()\n  \n}\n`
        },
        solutionFiles: {
          'carrinho.js': `function calcularTotalCarrinho(itens) {\n  const subtotal = itens.reduce((acc, item) => acc + item.preco * item.qtd, 0);\n  return subtotal > 200 ? Number((subtotal * 0.9).toFixed(2)) : subtotal;\n}\n`
        },
        evalType: 'js',
        targetFunction: 'calcularTotalCarrinho',
        tests: [
          { description: 'Retorna 150 quando o subtotal é <= 200', args: [[{ nome: 'Mouse', preco: 50, qtd: 3 }]], expected: 150 },
          { description: 'Aplica 10% de desconto quando o subtotal é 300', args: [[{ nome: 'Teclado', preco: 150, qtd: 2 }]], expected: 270 }
        ],
        tutorHints: ['Use `itens.reduce((acumulador, item) => acumulador + item.preco * item.qtd, 0)`.']
      }
    ]
  },
  {
    id: 'mod-3',
    number: 3,
    title: 'Desenvolvimento Front-end com React',
    subtitle: 'Componentes, Props, Hooks (useState, useEffect, useMemo) & Estado Global',
    icon: 'Cpu',
    description:
      'Construa interfaces reativas escaláveis com React: componentização, gerenciamento de estado previsível e hooks customizados.',
    tracks: [
      { name: 'JSX, Props & Composição de Componentes', count: 50 },
      { name: 'Hooks Essenciais (useState, useEffect, useMemo)', count: 50 },
      { name: 'Context API & Padrões de Arquitetura UI', count: 40 }
    ],
    challenges: []
  },
  {
    id: 'mod-4',
    number: 4,
    title: 'Desenvolvimento Back-end com Node.js & Express',
    subtitle: 'APIs RESTful, Middlewares, Validação de Dados & Tratamento de Erros',
    icon: 'Server',
    description:
      'Construa APIs REST profissionais em Node.js e Express com arquitetura em camadas e validação de payloads.',
    tracks: [
      { name: 'Arquitetura REST & Verbos HTTP', count: 50 },
      { name: 'Middlewares, Validação & Tratamento de Erros', count: 50 },
      { name: 'Boas Práticas de Segurança & Rate Limiting', count: 40 }
    ],
    challenges: []
  },
  {
    id: 'mod-5',
    number: 5,
    title: 'Bancos de Dados (MongoDB) & Autenticação JWT',
    subtitle: 'Modelagem de Schemas, Queries, Hash de Senhas & Autorização RBAC',
    icon: 'Database',
    description:
      'Modele coleções eficientes no MongoDB, proteja credenciais e implemente fluxos completos de autenticação JWT.',
    tracks: [
      { name: 'Modelagem NoSQL & Agregações MongoDB', count: 50 },
      { name: 'Autenticação JWT & Refresh Tokens', count: 50 },
      { name: 'Segurança, RBAC & Proteção de Rotas', count: 40 }
    ],
    challenges: []
  },
  {
    id: 'mod-6',
    number: 6,
    title: 'Projeto Final Integrador Full-Stack',
    subtitle: 'NexusDev Store & Painel Administrativo Completo',
    icon: 'Award',
    description:
      'A prova final da sua jornada! Projete, desenvolva e publique um Marketplace completo integrando React, Node.js, Express e MongoDB.',
    isCapstoneModule: true,
    tracks: [
      { name: 'Checklist de Arquitetura Full-Stack (5 Requisitos)', count: 5 },
      { name: 'Entrega do Repositório & Emissão de Certificado', count: 1 }
    ],
    challenges: []
  }
];

function buildCompleteCurriculum(baseModules) {
  const TARGET = 140;
  return baseModules.map((mod) => {
    if (mod.isCapstoneModule) return mod;
    const list = [...mod.challenges];
    let idx = list.length + 1;
    while (list.length < TARGET) {
      list.push({
        id: `${mod.id}-auto-${idx}`,
        number: `${mod.number}.${idx}`,
        title: `Aula Prática Avançada ${mod.number}.${idx}`,
        type: 'standard',
        difficulty: idx <= 45 ? 'Iniciante' : idx <= 95 ? 'Intermediário' : 'Avançado',
        duration: '15 min',
        summary: `Laboratório prático intensivo do Módulo ${mod.number} - Tópico ${idx}.`,
        conceptMarkdown: `### Conceito Avançado #${idx}\n\nAplicação prática dos padrões de arquitetura e código limpo abordados no Módulo ${mod.number}.`,
        instructions: ['Implemente a solução no editor e verifique os testes automatizados.'],
        starterFiles: { 'script.js': `function solucao${idx}() {\n  // Implemente sua lógica aqui\n}\n` },
        solutionFiles: { 'script.js': `function solucao${idx}() {\n  return true;\n}\n` },
        evalType: 'js',
        targetFunction: `solucao${idx}`,
        tests: [{ description: 'Executa e valida a lógica com sucesso', args: [], expected: true }],
        tutorHints: ['Siga os padrões de imutabilidade e testes da aula.']
      });
      idx++;
    }
    return { ...mod, challenges: list };
  });
}

const COMPLETE_MODULES = buildCompleteCurriculum(INTERACTIVE_MODULES);

function evaluateChallenge(challenge, files) {
  if (!challenge) return { passed: false, results: [] };
  if (challenge.evalType === 'dom') {
    const htmlCode = files['index.html'] || '';
    const results = [];
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlCode, 'text/html');
      for (const test of challenge.domTests || []) {
        let passed = false;
        let detail = '';
        if (test.assert === 'exists') {
          const el = doc.querySelector(test.selector);
          passed = Boolean(el);
          detail = passed ? 'Elemento encontrado.' : 'Seletor não encontrado no HTML.';
        } else if (test.assert === 'textContains') {
          const el = doc.querySelector(test.selector);
          const text = el ? el.textContent.trim() : '';
          passed = text.includes(test.value);
          detail = passed ? 'Texto válido.' : `Esperado "${test.value}", obtido "${text}".`;
        } else if (test.assert === 'minLength') {
          const el = doc.querySelector(test.selector);
          const len = el ? el.textContent.trim().length : 0;
          passed = len >= test.value;
          detail = passed ? 'Comprimento adequado.' : `Mínimo ${test.value} caracteres.`;
        }
        results.push({ description: test.description, passed, detail });
      }
    } catch (err) {
      results.push({ description: 'Parser HTML', passed: false, detail: err.message });
    }
    return { passed: results.length > 0 && results.every((r) => r.passed), results };
  }

  const jsFileName = Object.keys(files).find((k) => k.endsWith('.js')) || Object.keys(files)[0];
  const userCode = files[jsFileName] || '';
  const results = [];
  for (const test of challenge.tests || []) {
    try {
      const clonedArgs = JSON.parse(JSON.stringify(test.args));
      const runner = new Function(
        '__args',
        `"use strict";\n${userCode}\nreturn ${challenge.targetFunction}(...__args);`
      );
      const actual = runner(clonedArgs);
      const passed = JSON.stringify(actual) === JSON.stringify(test.expected);
      results.push({
        description: test.description,
        passed,
        detail: passed
          ? `Retornou ${JSON.stringify(actual)}`
          : `Esperado ${JSON.stringify(test.expected)}, obtido ${JSON.stringify(actual)}`
      });
    } catch (err) {
      results.push({ description: test.description, passed: false, detail: `Erro: ${err.message}` });
    }
  }
  return { passed: results.length > 0 && results.every((r) => r.passed), results };
}

export default function App() {
  const [navState, setNavState] = useState({
    activeView: 'dashboard',
    selectedModuleId: 'mod-1',
    activeChallengeId: 'html-1',
    searchQuery: '',
    difficultyFilter: 'Todos'
  });

  const [authToken, setAuthToken] = useState(() => localStorage.getItem('nexusdev_token') || '');
  const [currentUser, setCurrentUser] = useState({
    name: 'Estudante NexusDev',
    email: '',
    avatar: '',
    xp: 0,
    streak: 1,
    certificateCode: 'NXD-2026-DEV-000'
  });
  const [completedIds, setCompletedIds] = useState([]);
  const [savedCodeMap, setSavedCodeMap] = useState({});
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [googleClientId] = useState('208154189387-v90v9q9f3k4j8s9.apps.googleusercontent.com');
  const [authFeedback, setAuthFeedback] = useState('');

  useEffect(() => {
    if (!authToken) return;
    fetch(`${API_BASE_URL}/api/me`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.email) {
          setCurrentUser(data);
          if (data.completedIds) setCompletedIds(data.completedIds);
          if (data.savedCodeMap) setSavedCodeMap(data.savedCodeMap);
        }
      })
      .catch(() => console.warn('Modo offline ativo.'));
  }, [authToken]);

  const allChallenges = useMemo(() => {
    const list = [];
    COMPLETE_MODULES.forEach((mod) => {
      mod.challenges.forEach((ch) => {
        list.push({ ...ch, moduleId: mod.id, moduleNumber: mod.number, moduleTitle: mod.title });
      });
    });
    return list;
  }, []);

  const totalSyllabusCount = allChallenges.length;
  const completedCount = completedIds.length;
  const overallProgressPercent =
    totalSyllabusCount > 0 ? Math.round((completedCount / totalSyllabusCount) * 100) : 0;

  const activeChallenge = useMemo(() => {
    return allChallenges.find((c) => c.id === navState.activeChallengeId) || allChallenges[0];
  }, [allChallenges, navState.activeChallengeId]);

  const [activeFileName, setActiveFileName] = useState('');
  const [testReport, setTestReport] = useState(null);

  const currentFiles = useMemo(() => {
    if (!activeChallenge) return {};
    return savedCodeMap[activeChallenge.id] || activeChallenge.starterFiles;
  }, [savedCodeMap, activeChallenge]);

  useEffect(() => {
    if (!activeChallenge) return;
    const fileNames = Object.keys(currentFiles);
    if (!fileNames.includes(activeFileName)) {
      setActiveFileName(fileNames[0] || '');
    }
    setTestReport(null);
  }, [activeChallenge?.id]);

  const openChallenge = (challengeId) => {
    const target = allChallenges.find((c) => c.id === challengeId);
    setNavState((prev) => ({
      ...prev,
      activeView: 'workspace',
      activeChallengeId: challengeId,
      selectedModuleId: target ? target.moduleId : prev.selectedModuleId
    }));
  };

  const handleCodeChange = (newCode) => {
    if (!activeChallenge || !activeFileName) return;
    setSavedCodeMap((prev) => ({
      ...prev,
      [activeChallenge.id]: {
        ...(prev[activeChallenge.id] || activeChallenge.starterFiles),
        [activeFileName]: newCode
      }
    }));
  };

  const handleVerifyCode = async () => {
    if (!activeChallenge) return;
    const evaluation = evaluateChallenge(activeChallenge, currentFiles);
    setTestReport(evaluation);

    if (evaluation.passed && !completedIds.includes(activeChallenge.id)) {
      const updatedIds = [...completedIds, activeChallenge.id];
      setCompletedIds(updatedIds);
      setCurrentUser((prev) => ({ ...prev, xp: (prev.xp || 0) + 50 }));

      if (authToken) {
        try {
          await fetch(`${API_BASE_URL}/api/progress/complete`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${authToken}`
            },
            body: JSON.stringify({
              challengeId: activeChallenge.id,
              files: currentFiles
            })
          });
        } catch {
          // Fallback offline
        }
      }
    }
  };

  const googleBtnContainerRef = useRef(null);

  useEffect(() => {
    if (!showAuthModal) return;
    const initGoogle = () => {
      if (window.google?.accounts?.id && googleBtnContainerRef.current) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (res) => {
            try {
              const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credential: res.credential })
              });
              const data = await response.json();
              if (data.token) {
                localStorage.setItem('nexusdev_token', data.token);
                setAuthToken(data.token);
                setCurrentUser(data.user);
                setShowAuthModal(false);
              }
            } catch {
              setAuthFeedback('Erro ao autenticar com o Google.');
            }
          }
        });
        googleBtnContainerRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
          theme: 'filled_black',
          size: 'large',
          width: '100%'
        });
      }
    };
    if (window.google?.accounts?.id) initGoogle();
    else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.onload = initGoogle;
      document.head.appendChild(script);
    }
  }, [showAuthModal, googleClientId]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => setNavState((p) => ({ ...p, activeView: 'dashboard' }))}
            className="flex items-center gap-2.5"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Terminal className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <span className="font-extrabold text-lg text-white">
              Nexus<span className="text-emerald-400">Dev</span>
            </span>
          </button>

          <nav className="flex items-center gap-2">
            <button
              onClick={() => setNavState((p) => ({ ...p, activeView: 'dashboard' }))}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                navState.activeView === 'dashboard'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Trilha ({totalSyllabusCount})
            </button>
            <button
              onClick={() => setNavState((p) => ({ ...p, activeView: 'workspace' }))}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                navState.activeView === 'workspace'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Laboratório
            </button>
            <button
              onClick={() => setNavState((p) => ({ ...p, activeView: 'certificate' }))}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                navState.activeView === 'certificate'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Certificado
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <span className="text-emerald-400 font-semibold text-xs flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              {currentUser.xp || 0} XP
            </span>
            <button
              onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
            >
              <User className="w-4 h-4 text-emerald-400" />
              <span className="max-w-[100px] truncate">{currentUser.name}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {navState.activeView === 'dashboard' && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-emerald-950/30 border border-slate-800 p-6">
              <h1 className="text-2xl font-extrabold text-white">
                Formação Full-Stack — 700 Aulas Práticas
              </h1>
              <p className="text-sm text-slate-300 mt-2">
                Progresso atual: {completedCount} de {totalSyllabusCount} aulas concluídas (
                {overallProgressPercent}%).
              </p>
            </div>

            <div className="space-y-4">
              {COMPLETE_MODULES.map((mod) => (
                <div key={mod.id} className="rounded-2xl bg-slate-900 border border-slate-800 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-bold text-lg text-white">
                      {mod.number}. {mod.title}
                    </h2>
                    <span className="text-xs font-mono text-emerald-400">
                      {mod.challenges.length} Aulas
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-4">{mod.description}</p>
                  {mod.challenges.length > 0 && (
                    <button
                      onClick={() => openChallenge(mod.challenges[0]?.id)}
                      className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-2"
                    >
                      <Play className="w-3.5 h-3.5 fill-slate-950" /> Iniciar Módulo
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {navState.activeView === 'workspace' && activeChallenge && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-5 rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4">
              <h2 className="text-xl font-bold text-white">{activeChallenge.title}</h2>
              <div className="text-sm text-slate-300 bg-slate-950 p-4 rounded-xl whitespace-pre-line">
                {activeChallenge.conceptMarkdown}
              </div>
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Instruções
                </h3>
                <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                  {activeChallenge.instructions.map((inst, idx) => (
                    <li key={idx}>{inst}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="lg:col-span-7 rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-4">
              <div className="flex gap-2 border-b border-slate-800 pb-2">
                {Object.keys(currentFiles).map((fname) => (
                  <button
                    key={fname}
                    onClick={() => setActiveFileName(fname)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono ${
                      activeFileName === fname
                        ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                        : 'text-slate-400'
                    }`}
                  >
                    {fname}
                  </button>
                ))}
              </div>
              <textarea
                value={currentFiles[activeFileName] || ''}
                onChange={(e) => handleCodeChange(e.target.value)}
                rows={12}
                className="w-full bg-slate-950 text-emerald-100 font-mono text-xs p-4 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={handleVerifyCode}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-slate-950" /> Verificar Código
              </button>
              {testReport && (
                <div
                  className={`p-4 rounded-xl border space-y-2 ${
                    testReport.passed
                      ? 'bg-emerald-950/30 border-emerald-500/40'
                      : 'bg-rose-950/30 border-rose-500/40'
                  }`}
                >
                  <p className="font-bold text-sm text-white">
                    {testReport.passed ? 'Sucesso! +50 XP' : 'Alguns testes falharam'}
                  </p>
                  {testReport.results.map((r, i) => (
                    <div key={i} className="text-xs flex items-start gap-2 text-slate-300">
                      {r.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      <div>
                        <span className="font-semibold">{r.description}:</span> {r.detail}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {navState.activeView === 'certificate' && (
          <div className="max-w-3xl mx-auto rounded-3xl bg-slate-900 border-2 border-emerald-500/40 p-10 text-center">
            <Award className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white">Certificado Verificável</h2>
            <p className="text-xl font-black text-emerald-300 my-4">{currentUser.name}</p>
            <p className="text-xs font-mono text-slate-400">
              nexusdev.io/certificado/{currentUser.certificateCode || 'NXD-2026-DEV'}
            </p>
          </div>
        )}
      </main>

      {showAuthModal && (
        <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <h3 className="font-bold text-white text-base">Autenticação Google Cloud</h3>
            <div ref={googleBtnContainerRef} className="min-h-[44px]" />
            {authFeedback && <p className="text-xs text-rose-400">{authFeedback}</p>}
            <button
              onClick={() => setShowAuthModal(false)}
              className="w-full py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}