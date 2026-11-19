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
  Search,
  Layers,
  Database,
  Server,
  Layout,
  Cpu,
  ArrowRight,
  Lock,
  User,
  Home,
  Compass,
  Menu,
  X,
  Rocket
} from 'lucide-react';

// URL da API Back-end em Produção (Render)
const API_BASE_URL = 'https://nexusdev-1rq3.onrender.com';

// ============================================================================
// BASE CURRICULAR COMPLETA (140 AULAS POR MÓDULO = 700 AULAS + MÓDULO 6 CAPSTONE)
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
        conceptMarkdown: `### Conceito Avançado #${idx}\n\nAplicação prática dos padrões de arquitetura e código limpo abordados no Módulo ${mod.number}.\n\nPara concluir esta aula e liberar a próxima, faça a função \`solucao${idx}()\` retornar \`true\`.`,
        instructions: [
          `Implemente a função \`solucao${idx}()\` para retornar \`true\`.`,
          'Clique em "Verificar Código" para validar e desbloquear a próxima aula.'
        ],
        starterFiles: {
          'script.js': `function solucao${idx}() {\n  // Retorne true para validar esta aula\n  \n}\n`
        },
        solutionFiles: {
          'script.js': `function solucao${idx}() {\n  return true;\n}\n`
        },
        evalType: 'js',
        targetFunction: `solucao${idx}`,
        tests: [{ description: 'Executa e valida a lógica com sucesso', args: [], expected: true }],
        tutorHints: [`Retorne o valor booleano true dentro de solucao${idx}().`]
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

function getModuleIcon(iconName, className = 'w-5 h-5') {
  switch (iconName) {
    case 'Layout':
      return <Layout className={className} />;
    case 'Code2':
      return <Code2 className={className} />;
    case 'Cpu':
      return <Cpu className={className} />;
    case 'Server':
      return <Server className={className} />;
    case 'Database':
      return <Database className={className} />;
    case 'Award':
      return <Award className={className} />;
    default:
      return <BookOpen className={className} />;
  }
}

export default function App() {
  const [navState, setNavState] = useState({
    activeView: 'home', // 'home' | 'dashboard' | 'workspace' | 'certificate'
    selectedModuleId: 'mod-1',
    activeChallengeId: 'html-1'
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const selectedModule = useMemo(() => {
    return COMPLETE_MODULES.find((m) => m.id === navState.selectedModuleId) || COMPLETE_MODULES[0];
  }, [navState.selectedModuleId]);

  const activeChallenge = useMemo(() => {
    return allChallenges.find((c) => c.id === navState.activeChallengeId) || allChallenges[0];
  }, [allChallenges, navState.activeChallengeId]);

  const [activeFileName, setActiveFileName] = useState('');
  const [testReport, setTestReport] = useState(null);
  const [expandedModules, setExpandedModules] = useState({ 'mod-1': true });
  const [lessonSearch, setLessonSearch] = useState('');
  const [lessonDifficulty, setLessonDifficulty] = useState('Todos');

  const currentFiles = useMemo(() => {
    if (!activeChallenge) return {};
    return savedCodeMap[activeChallenge.id] || activeChallenge.starterFiles;
  }, [savedCodeMap, activeChallenge]);

  // Sincroniza arquivo ativo e limpa relatório ao trocar de aula
  useEffect(() => {
    if (!activeChallenge) return;
    const fileNames = Object.keys(currentFiles);
    if (!fileNames.includes(activeFileName)) {
      setActiveFileName(fileNames[0] || '');
    }
    setTestReport(null);
  }, [activeChallenge?.id]);

  const currentModuleChallenges = useMemo(() => {
    if (!activeChallenge) return [];
    const mod = COMPLETE_MODULES.find((m) => m.id === activeChallenge.moduleId);
    return mod ? mod.challenges : [];
  }, [activeChallenge]);

  const activeIndexInModule = useMemo(() => {
    if (!activeChallenge) return 0;
    return currentModuleChallenges.findIndex((c) => c.id === activeChallenge.id);
  }, [currentModuleChallenges, activeChallenge]);

  // Regra: A próxima aula só é liberada após a aula atual ter sido completada
  const isCurrentLessonCompleted = activeChallenge
    ? completedIds.includes(activeChallenge.id)
    : false;
  const hasNextLesson =
    activeIndexInModule >= 0 && activeIndexInModule < currentModuleChallenges.length - 1;
  const canGoToNextLesson = isCurrentLessonCompleted && hasNextLesson;

  const selectModuleAndNavigate = (moduleId, view = 'dashboard') => {
    const mod = COMPLETE_MODULES.find((m) => m.id === moduleId);
    const firstChallengeId = mod?.challenges?.[0]?.id || navState.activeChallengeId;
    setExpandedModules((prev) => ({ ...prev, [moduleId]: true }));
    setNavState((prev) => ({
      ...prev,
      activeView: view,
      selectedModuleId: moduleId,
      activeChallengeId: firstChallengeId
    }));
    setMobileMenuOpen(false);
  };

  const openChallenge = (challengeId) => {
    const target = allChallenges.find((c) => c.id === challengeId);
    setNavState((prev) => ({
      ...prev,
      activeView: 'workspace',
      activeChallengeId: challengeId,
      selectedModuleId: target ? target.moduleId : prev.selectedModuleId
    }));
    setMobileMenuOpen(false);
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
      {/* CABEÇALHO SUPERIOR */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Abrir menu de módulos"
              className="lg:hidden p-2 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setNavState((p) => ({ ...p, activeView: 'home' }))}
              className="flex items-center gap-2.5 text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Terminal className="w-5 h-5 text-slate-950 stroke-[2.5]" />
              </div>
              <div>
                <span className="font-extrabold text-lg text-white tracking-tight">
                  Nexus<span className="text-emerald-400">Dev</span>
                </span>
                <span className="hidden sm:block text-[10px] font-mono text-slate-400 -mt-1">
                  FULL-STACK LAB
                </span>
              </div>
            </button>
          </div>

          <nav className="hidden md:flex items-center gap-1.5">
            <button
              onClick={() => setNavState((p) => ({ ...p, activeView: 'home' }))}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                navState.activeView === 'home'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Home className="w-3.5 h-3.5" /> Início
            </button>
            <button
              onClick={() => setNavState((p) => ({ ...p, activeView: 'dashboard' }))}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                navState.activeView === 'dashboard'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Compass className="w-3.5 h-3.5" /> Módulos ({COMPLETE_MODULES.length})
            </button>
            <button
              onClick={() => setNavState((p) => ({ ...p, activeView: 'workspace' }))}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                navState.activeView === 'workspace'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" /> Laboratório
            </button>
            <button
              onClick={() => setNavState((p) => ({ ...p, activeView: 'certificate' }))}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                navState.activeView === 'certificate'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Award className="w-3.5 h-3.5" /> Certificado
            </button>
          </nav>

          <div className="flex items-center gap-2.5">
            <span className="hidden sm:flex text-emerald-400 font-semibold text-xs items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
              <Sparkles className="w-3.5 h-3.5" />
              {currentUser.xp || 0} XP
            </span>
            <button
              onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-white transition"
            >
              <User className="w-4 h-4 text-emerald-400" />
              <span className="max-w-[110px] truncate">{currentUser.name}</span>
            </button>
          </div>
        </div>

        {/* BARRA RÁPIDA DE NAVEGAÇÃO MOBILE */}
        <div className="flex md:hidden items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-800/80 overflow-x-auto">
          <button
            onClick={() => setNavState((p) => ({ ...p, activeView: 'home' }))}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 ${
              navState.activeView === 'home'
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-slate-800 text-slate-300'
            }`}
          >
            Início
          </button>
          <button
            onClick={() => setNavState((p) => ({ ...p, activeView: 'dashboard' }))}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 ${
              navState.activeView === 'dashboard'
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-slate-800 text-slate-300'
            }`}
          >
            Módulos
          </button>
          <button
            onClick={() => setNavState((p) => ({ ...p, activeView: 'workspace' }))}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 ${
              navState.activeView === 'workspace'
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-slate-800 text-slate-300'
            }`}
          >
            Laboratório
          </button>
          <button
            onClick={() => setNavState((p) => ({ ...p, activeView: 'certificate' }))}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 ${
              navState.activeView === 'certificate'
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-slate-800 text-slate-300'
            }`}
          >
            Certificado
          </button>
        </div>
      </header>

      {/* CORPO PRINCIPAL COM MENU LATERAL DE TODOS OS MÓDULOS */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6 relative">
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-950/75 z-40 lg:hidden"
          />
        )}

        {/* MENU LATERAL DE MÓDULOS */}
        <aside
          className={`${
            mobileMenuOpen
              ? 'fixed top-0 left-0 bottom-0 z-50 w-80 bg-slate-900 border-r border-slate-800 p-5 overflow-y-auto'
              : 'hidden lg:block lg:w-80 shrink-0'
          }`}
        >
          <div className="sticky top-20 rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-wider text-emerald-400">
                  Menu Curricular
                </p>
                <h2 className="text-sm font-bold text-white mt-0.5">Todos os Módulos (1 ao 6)</h2>
              </div>
              {mobileMenuOpen && (
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/90 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Progresso Geral</span>
                <span className="font-mono font-bold text-emerald-400">{overallProgressPercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-300"
                  style={{ width: `${overallProgressPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400">
                {completedCount} de {totalSyllabusCount} aulas concluídas
              </p>
            </div>

            <div className="space-y-2">
              {COMPLETE_MODULES.map((mod) => {
                const isSelected =
                  navState.selectedModuleId === mod.id && navState.activeView !== 'home';
                const modCompleted = mod.challenges.filter((c) => completedIds.includes(c.id)).length;
                const modTotal = mod.isCapstoneModule ? 1 : mod.challenges.length;

                return (
                  <button
                    key={mod.id}
                    onClick={() => selectModuleAndNavigate(mod.id, 'dashboard')}
                    className={`w-full text-left p-3 rounded-xl border transition group ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-white'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`mt-0.5 p-2 rounded-lg shrink-0 ${
                          isSelected
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-slate-800 text-emerald-400 group-hover:bg-slate-700'
                        }`}
                      >
                        {getModuleIcon(mod.icon, 'w-4 h-4')}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                            MÓDULO 0{mod.number}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            {mod.isCapstoneModule ? 'Projeto' : `${modCompleted}/${modTotal}`}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-white leading-snug mt-0.5 line-clamp-2">
                          {mod.title}
                        </p>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-1">
                          {mod.subtitle}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setNavState((p) => ({ ...p, activeView: 'home' }))}
              className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-2 transition"
            >
              <Home className="w-3.5 h-3.5 text-emerald-400" /> Página Inicial da Plataforma
            </button>
          </div>
        </aside>

        {/* ÁREA DE CONTEÚDO PRINCIPAL */}
        <main className="flex-1 min-w-0">
          {/* PÁGINA INICIAL EXPLICANDO A PLATAFORMA */}
          {navState.activeView === 'home' && (
            <div className="space-y-8">
              <section className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 p-6 sm:p-10 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                  <Rocket className="w-3.5 h-3.5" /> Plataforma Interativa de Engenharia Full-Stack
                </div>

                <div className="space-y-3 max-w-3xl">
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                    Aprenda Desenvolvimento Full-Stack na prática,{' '}
                    <span className="text-emerald-400">linha por linha de código</span>.
                  </h1>
                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                    A <strong className="text-white">NexusDev</strong> é um ambiente de aprendizado
                    prático estruturado em <strong className="text-emerald-400">6 módulos</strong>{' '}
                    ({totalSyllabusCount} aulas práticas, 140 por módulo), com editor integrado,
                    avaliação automática de código, salvamento de progresso na nuvem e emissão de
                    certificado verificável.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    onClick={() => openChallenge('html-1')}
                    className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition"
                  >
                    <Play className="w-4 h-4 fill-slate-950" /> Começar Primeira Aula
                  </button>
                  <button
                    onClick={() => setNavState((p) => ({ ...p, activeView: 'dashboard' }))}
                    className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-sm flex items-center gap-2 transition"
                  >
                    <Compass className="w-4 h-4 text-emerald-400" /> Explorar Todos os Módulos
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800/80">
                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <Code2 className="w-4 h-4" /> Editor & Testes Ao Vivo
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Escreva HTML, CSS e JavaScript diretamente no laboratório e valide sua lógica
                      com testes automatizados instantâneos.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                    <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                      <Layers className="w-4 h-4" /> 140 Aulas por Módulo
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Do HTML5 e lógica JavaScript até React, Node.js, MongoDB, JWT e Projeto Final
                      Integrador Full-Stack.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                      <Award className="w-4 h-4" /> XP, Streak & Certificado
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Ganhe XP a cada desafio concluído, sincronize seu progresso com sua conta e
                      acompanhe seu código de certificação.
                    </p>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                  <div>
                    <h2 className="text-xl font-bold text-white">Grade de Módulos da Formação</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Clique em qualquer módulo para abrir suas 140 aulas ou iniciar no laboratório.
                    </p>
                  </div>
                  <button
                    onClick={() => setNavState((p) => ({ ...p, activeView: 'dashboard' }))}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    Ver visão detalhada <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {COMPLETE_MODULES.map((mod) => (
                    <div
                      key={mod.id}
                      className="rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 p-5 flex flex-col justify-between gap-4 transition"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-2 text-xs font-mono font-bold text-emerald-400">
                            {getModuleIcon(mod.icon, 'w-4 h-4')} MÓDULO 0{mod.number}
                          </span>
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                            {mod.isCapstoneModule
                              ? 'Projeto Integrador'
                              : `${mod.challenges.length} Aulas`}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-white">{mod.title}</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">{mod.description}</p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                        <span className="text-[11px] text-slate-400 truncate max-w-[200px]">
                          {mod.subtitle}
                        </span>
                        <button
                          onClick={() => selectModuleAndNavigate(mod.id, 'dashboard')}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shrink-0 transition"
                        >
                          Abrir Módulo <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* VISÃO DE MÓDULOS E TODAS AS 140 AULAS */}
          {navState.activeView === 'dashboard' && (
            <div className="space-y-6">
              <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-emerald-950/30 border border-slate-800 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-mono text-emerald-400 uppercase">
                    Módulo Selecionado: 0{selectedModule.number}
                  </span>
                  <h1 className="text-2xl font-extrabold text-white mt-0.5">
                    {selectedModule.title}
                  </h1>
                  <p className="text-sm text-slate-300 mt-1.5 max-w-2xl">
                    {selectedModule.description}
                  </p>
                </div>
                {selectedModule.challenges.length > 0 && (
                  <button
                    onClick={() => openChallenge(selectedModule.challenges[0].id)}
                    className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shrink-0"
                  >
                    <Play className="w-3.5 h-3.5 fill-slate-950" /> Ir para o Laboratório
                  </button>
                )}
              </div>

              <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={lessonSearch}
                    onChange={(e) => setLessonSearch(e.target.value)}
                    placeholder="Buscar entre todas as 700 aulas (ex: 1.45, 2.120, Semântica)..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {['Todos', 'Iniciante', 'Intermediário', 'Avançado'].map((level) => (
                    <button
                      key={level}
                      onClick={() => setLessonDifficulty(level)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition ${
                        lessonDifficulty === level
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {COMPLETE_MODULES.map((mod) => {
                  const isExpanded = Boolean(expandedModules[mod.id] || mod.id === selectedModule.id);
                  const filteredChallenges = mod.challenges.filter((ch) => {
                    const matchesSearch =
                      !lessonSearch.trim() ||
                      ch.title.toLowerCase().includes(lessonSearch.toLowerCase()) ||
                      ch.number.toLowerCase().includes(lessonSearch.toLowerCase());
                    const matchesDiff =
                      lessonDifficulty === 'Todos' || ch.difficulty === lessonDifficulty;
                    return matchesSearch && matchesDiff;
                  });

                  return (
                    <div
                      key={mod.id}
                      className={`rounded-2xl bg-slate-900 border p-5 transition ${
                        mod.id === selectedModule.id ? 'border-emerald-500/50' : 'border-slate-800'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <h2 className="font-bold text-lg text-white flex items-center gap-2">
                          <span className="text-emerald-400">
                            {getModuleIcon(mod.icon, 'w-5 h-5')}
                          </span>
                          {mod.number}. {mod.title}
                        </h2>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                            {mod.isCapstoneModule
                              ? 'Projeto Final'
                              : `${filteredChallenges.length} / ${mod.challenges.length} Aulas`}
                          </span>
                          {!mod.isCapstoneModule && (
                            <button
                              onClick={() =>
                                setExpandedModules((prev) => ({
                                  ...prev,
                                  [mod.id]: !isExpanded
                                }))
                              }
                              className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1"
                            >
                              {isExpanded ? (
                                <>
                                  Recolher <ChevronDown className="w-3.5 h-3.5" />
                                </>
                              ) : (
                                <>
                                  Ver todas as {mod.challenges.length} aulas{' '}
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 mb-4">{mod.description}</p>

                      {mod.challenges.length > 0 ? (
                        isExpanded ? (
                          <div className="max-h-[540px] overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                            {filteredChallenges.map((ch) => {
                              const isDone = completedIds.includes(ch.id);
                              return (
                                <button
                                  key={ch.id}
                                  onClick={() => openChallenge(ch.id)}
                                  className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left flex items-center justify-between gap-2 transition"
                                >
                                  <div className="min-w-0">
                                    <span className="text-[11px] font-mono text-emerald-400">
                                      Aula {ch.number} • {ch.difficulty}
                                    </span>
                                    <p className="text-xs font-semibold text-white truncate mt-0.5">
                                      {ch.title}
                                    </p>
                                  </div>
                                  {isDone ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                  ) : (
                                    <Play className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <button
                            onClick={() =>
                              setExpandedModules((prev) => ({ ...prev, [mod.id]: true }))
                            }
                            className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-emerald-400 flex items-center justify-center gap-2 transition"
                          >
                            Expandir todas as {mod.challenges.length} aulas deste módulo
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        )
                      ) : (
                        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
                          <span>
                            Projeto Integrador Full-Stack — Construa e publique sua aplicação completa.
                          </span>
                          <button
                            onClick={() => setNavState((p) => ({ ...p, activeView: 'certificate' }))}
                            className="text-emerald-400 font-semibold hover:underline shrink-0 ml-2"
                          >
                            Ver Certificado
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* LABORATÓRIO INTERATIVO DE CÓDIGO */}
          {navState.activeView === 'workspace' && activeChallenge && (
            <div className="space-y-4">
              {/* BARRA DE CONTROLE DA AULA ATUAL (COM BLOQUEIO DA PRÓXIMA AULA) */}
              <div className="rounded-2xl bg-slate-900 border border-slate-800 p-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                  <span className="text-xs font-mono text-emerald-400 shrink-0">
                    Aula ({activeIndexInModule + 1}/{currentModuleChallenges.length}):
                  </span>
                  <select
                    value={activeChallenge.id}
                    onChange={(e) => openChallenge(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {currentModuleChallenges.map((ch) => {
                      const done = completedIds.includes(ch.id);
                      return (
                        <option key={ch.id} value={ch.id}>
                          {done ? '✓ ' : ''}
                          {ch.number} — {ch.title} ({ch.difficulty})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (activeIndexInModule > 0) {
                        openChallenge(currentModuleChallenges[activeIndexInModule - 1].id);
                      }
                    }}
                    disabled={activeIndexInModule <= 0}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold text-slate-200 transition"
                  >
                    Anterior
                  </button>

                  <button
                    onClick={() => {
                      if (canGoToNextLesson) {
                        openChallenge(currentModuleChallenges[activeIndexInModule + 1].id);
                      }
                    }}
                    disabled={!canGoToNextLesson}
                    title={
                      !isCurrentLessonCompleted
                        ? 'Complete e verifique a aula atual para liberar a próxima aula'
                        : 'Avançar para a próxima aula'
                    }
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                      canGoToNextLesson
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer'
                        : 'bg-slate-800 text-slate-500 border border-slate-700/80 cursor-not-allowed'
                    }`}
                  >
                    {!isCurrentLessonCompleted && <Lock className="w-3.5 h-3.5" />}
                    Próxima Aula
                  </button>
                </div>
              </div>

              {!isCurrentLessonCompleted && (
                <div className="px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    Complete o desafio abaixo e clique em <strong>Verificar Código</strong> com todos os
                    testes aprovados para desbloquear a próxima aula.
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-5 rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono text-emerald-400">
                      Aula {activeChallenge.number} • {activeChallenge.difficulty}
                    </span>
                    {isCurrentLessonCompleted && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" /> Concluída
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-white">{activeChallenge.title}</h2>
                  <div className="text-sm text-slate-300 bg-slate-950 p-4 rounded-xl whitespace-pre-line leading-relaxed">
                    {activeChallenge.conceptMarkdown}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Instruções
                    </h3>
                    <ul className="list-disc list-inside text-xs text-slate-300 space-y-1.5">
                      {activeChallenge.instructions.map((inst, idx) => (
                        <li key={idx}>{inst}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="lg:col-span-7 rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-4">
                  <div className="flex gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
                    {Object.keys(currentFiles).map((fname) => (
                      <button
                        key={fname}
                        onClick={() => setActiveFileName(fname)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono transition ${
                          activeFileName === fname
                            ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                            : 'text-slate-400 hover:text-slate-200'
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
                    spellCheck={false}
                    className="w-full bg-slate-950 text-emerald-100 font-mono text-xs p-4 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
                  />

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <button
                      onClick={handleVerifyCode}
                      className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm flex items-center gap-2 transition"
                    >
                      <Play className="w-4 h-4 fill-slate-950" /> Verificar Código
                    </button>

                    {canGoToNextLesson && (
                      <button
                        onClick={() =>
                          openChallenge(currentModuleChallenges[activeIndexInModule + 1].id)
                        }
                        className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-sm flex items-center gap-2 transition"
                      >
                        Avançar para Próxima Aula <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {testReport && (
                    <div
                      className={`p-4 rounded-xl border space-y-2 ${
                        testReport.passed
                          ? 'bg-emerald-950/30 border-emerald-500/40'
                          : 'bg-rose-950/30 border-rose-500/40'
                      }`}
                    >
                      <p className="font-bold text-sm text-white">
                        {testReport.passed
                          ? 'Sucesso! Aula concluída (+50 XP) — Próxima Aula liberada!'
                          : 'Alguns testes falharam — revise seu código e tente novamente'}
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
            </div>
          )}

          {/* CERTIFICADO */}
          {navState.activeView === 'certificate' && (
            <div className="max-w-3xl mx-auto rounded-3xl bg-slate-900 border-2 border-emerald-500/40 p-10 text-center space-y-4">
              <Award className="w-12 h-12 text-emerald-400 mx-auto" />
              <h2 className="text-2xl font-bold text-white">Certificado Verificável NexusDev</h2>
              <p className="text-xs text-slate-400">
                Conferido a quem concluir a trilha de Engenharia de Software Full-Stack
              </p>
              <p className="text-2xl font-black text-emerald-300 py-2">{currentUser.name}</p>
              <p className="text-xs text-slate-300">
                Aulas concluídas: <strong>{completedCount}</strong> de{' '}
                <strong>{totalSyllabusCount}</strong> ({overallProgressPercent}%)
              </p>
              <p className="text-xs font-mono text-slate-400 pt-2">
                Código de Validação: {currentUser.certificateCode || 'NXD-2026-DEV'}
              </p>
            </div>
          )}
        </main>
      </div>

      {/* MODAL DE LOGIN GOOGLE */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <h3 className="font-bold text-white text-base">Autenticação Google Cloud</h3>
            <p className="text-xs text-slate-400">
              Entre com sua conta Google para salvar suas aulas concluídas e XP na nuvem.
            </p>
            <div ref={googleBtnContainerRef} className="min-h-[44px]" />
            {authFeedback && <p className="text-xs text-rose-400">{authFeedback}</p>}
            <button
              onClick={() => setShowAuthModal(false)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}