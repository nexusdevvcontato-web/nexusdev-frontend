import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Code2,
  Terminal,
  CheckCircle2,
  Circle,
  Play,
  RotateCcw,
  Award,
  BookOpen,
  Layers,
  Database,
  Server,
  Layout,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  ExternalLink,
  Trophy,
  Eye,
  FileCode2,
  Check,
  Lock,
  Github,
  Globe,
  Flame,
  User,
  LogOut,
  LogIn,
  UserPlus,
  Search,
  Filter,
  Zap,
  ShieldCheck,
  Mail,
  KeyRound,
  AlertCircle,
  X,
  Bug,
  Brain,
  Cpu,
  MessageSquare,
  Send,
  QrCode,
  FolderOpen,
  Share2,
  CheckCheck,
  Home,
  Compass,
  Menu,
  Rocket,
  ArrowRight,
  Medal,
  Crown,
  Star,
  Activity
} from 'lucide-react';

// URL da API Back-end em Produção (Render)
const API_BASE_URL = 'https://nexusdev-1rq3.onrender.com';

// ============================================================================
// REALÇADOR DE SINTAXE SEGURO PARA O EDITOR MULTI-ARQUIVOS
// ============================================================================
function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function highlightCode(code, fileName) {
  const escaped = escapeHtml(code);
  const ext = (fileName || '').split('.').pop()?.toLowerCase();

  if (ext === 'html') {
    return escaped
      .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="text-slate-500 italic">$1</span>')
      .replace(
        /(&lt;\/?)([a-zA-Z0-9-]+)([\s\S]*?)(\/?&gt;)/g,
        '<span class="text-slate-400">$1</span><span class="text-sky-400 font-semibold">$2</span><span class="text-amber-200">$3</span><span class="text-slate-400">$4</span>'
      );
  }

  if (ext === 'css') {
    return escaped
      .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="text-slate-500 italic">$1</span>')
      .replace(/([a-zA-Z-]+)(\s*:)/g, '<span class="text-sky-300">$1</span>$2')
      .replace(
        /(#[0-9a-fA-F]{3,6}|\b\d+(?:px|rem|em|%|fr|vh|vw)?\b)/g,
        '<span class="text-amber-300">$1</span>'
      );
  }

  return escaped
    .replace(/(\/\/.*$)/gm, '<span class="text-slate-500 italic">$1</span>')
    .replace(/(&quot;.*?&quot;|&#039;.*?&#039;|'.*?'|".*?"|`[\s\S]*?`)/g, '<span class="text-amber-300">$1</span>')
    .replace(
      /\b(function|return|const|let|var|if|else|for|while|switch|case|break|continue|typeof|new|throw|try|catch|async|await|import|export|default|true|false|null|undefined)\b/g,
      '<span class="text-purple-400 font-semibold">$1</span>'
    )
    .replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="text-orange-300">$1</span>');
}

// ============================================================================
// PROTEÇÃO CONTRA LOOP INFINITO NO EDITOR (EVITA TRAVAR A ABA DO NAVEGADOR)
// ============================================================================
function injectLoopProtection(code, maxIterations = 25000) {
  let loopCounter = 0;
  const header = `let __loopOps = 0; const __tick = () => { if (++__loopOps > ${maxIterations}) { throw new Error('Loop infinito ou excesso de iterações detectado (limite: ${maxIterations}). Verifique a condição do seu laço!'); } };\n`;

  const instrumented = String(code || '').replace(
    /\b(while\s*\([^)]*\)|for\s*\([^)]*\)|do)\s*\{/g,
    (match) => {
      loopCounter += 1;
      return `${match} __tick();`;
    }
  );

  return loopCounter > 0 ? header + instrumented : code;
}

// ============================================================================
// MOTOR LOCAL DO TUTOR IA (COMPLEMENTADO PELA ROTA /api/tutor/analyze)
// ============================================================================
function analyzeStudentCodeLocal(challenge, filesMap, testResults) {
  const tips = [];
  const allCode = Object.values(filesMap || {}).join('\n');

  if (!allCode.trim()) {
    return [
      'O editor está vazio. Leia as instruções à esquerda e escreva a estrutura inicial do desafio.'
    ];
  }

  const openBraces = (allCode.match(/\{/g) || []).length;
  const closeBraces = (allCode.match(/\}/g) || []).length;
  if (openBraces !== closeBraces) {
    tips.push(
      `Chaves desbalanceadas: você abriu ${openBraces} "{" e fechou ${closeBraces} "}". Confira se algum bloco ficou aberto.`
    );
  }

  const openParens = (allCode.match(/\(/g) || []).length;
  const closeParens = (allCode.match(/\)/g) || []).length;
  if (openParens !== closeParens) {
    tips.push(
      `Parênteses desbalanceados: há ${openParens} "(" e ${closeParens} ")". Verifique suas funções e condições.`
    );
  }

  if (challenge.language === 'html') {
    const htmlCode = filesMap['index.html'] || '';
    const cssCode = filesMap['style.css'] || '';

    if (challenge.id === 'html-00-o-que-e-web' && !/<h1\b/i.test(htmlCode)) {
      tips.push('Ainda não encontramos a tag <h1> no index.html. Lembre-se de abrir com <h1> e fechar com </h1>.');
    }
    if (challenge.instructions?.includes('display: flex') && !/display\s*:\s*flex/i.test(cssCode + htmlCode)) {
      tips.push('Clique na aba "style.css" e adicione "display: flex;" dentro do seletor solicitado.');
    }
    if (challenge.instructions?.includes('display: grid') && !/display\s*:\s*grid/i.test(cssCode + htmlCode)) {
      tips.push('Na aba "style.css", adicione "display: grid;" dentro do contêiner.');
    }
  } else {
    const jsCode = Object.values(filesMap || {}).join('\n');
    const fnName = challenge.targetFunction;

    if (fnName && !jsCode.includes(fnName)) {
      tips.push(`A função "${fnName}" não foi encontrada. Evite renomear a função pedida no enunciado.`);
    }

    if (!/\breturn\b/.test(jsCode) && !jsCode.includes('res.status')) {
      tips.push('Falta uma instrução "return" na sua função. Sem return, o JavaScript retorna undefined.');
    }

    if (challenge.isDebug && /<=\s*itens\.length/.test(jsCode)) {
      tips.push(
        'Atenção no laço "for": arrays vão do índice 0 até "itens.length - 1". Usar "<=" acessa uma posição inexistente!'
      );
    }

    if (challenge.id === 'react-01-carrinho-imutavel' && /\.push\s*\(/.test(jsCode)) {
      tips.push(
        'Evite ".push()" no React pois ele muta o array original. Use o operador spread "[...carrinho, novoItem]" ou ".map()".'
      );
    }
  }

  const firstFailed = testResults.find((r) => !r.passed);
  if (firstFailed && firstFailed.error && tips.length === 0) {
    tips.push(`Diagnóstico do teste "${firstFailed.description}": ${firstFailed.error}`);
  }

  if (tips.length === 0) {
    tips.push(
      'A estrutura do código está limpa! Clique em "Verificar Código" para validar todos os critérios de aceitação.'
    );
  }

  return tips;
}

// ============================================================================
// VISUALIZADOR DE MEMÓRIA DINÂMICO (EXECUTA COM INPUTS REAIS + CAPTURA CONSOLE.LOG)
// ============================================================================
function runDynamicMemoryInspector(challenge, filesMap, customArgsJson) {
  const jsCode = Object.values(filesMap || {}).join('\n');
  const fnName = challenge.targetFunction;
  const logs = [];

  const sandboxConsole = {
    log: (...items) =>
      logs.push(items.map((x) => (typeof x === 'object' ? JSON.stringify(x) : String(x))).join(' ')),
    warn: (...items) =>
      logs.push('[WARN] ' + items.map((x) => (typeof x === 'object' ? JSON.stringify(x) : String(x))).join(' ')),
    error: (...items) =>
      logs.push('[ERRO] ' + items.map((x) => (typeof x === 'object' ? JSON.stringify(x) : String(x))).join(' '))
  };

  try {
    let parsedArgs = challenge.defaultTraceArgs || [10];
    if (customArgsJson && customArgsJson.trim()) {
      const parsed = JSON.parse(customArgsJson);
      parsedArgs = Array.isArray(parsed) ? parsed : [parsed];
    }

    const safeJsCode = injectLoopProtection(jsCode, 25000);
    const factory = new Function(
      'console',
      `"use strict";\n${safeJsCode};\nreturn typeof ${fnName} !== 'undefined' ? ${fnName} : undefined;`
    );
    const userFn = factory(sandboxConsole);

    if (typeof userFn !== 'function') {
      return {
        error: `Defina a função "${fnName}" corretamente no editor para inspecionar sua execução.`
      };
    }

    const startTime = performance.now();
    const actualOutput = userFn(...parsedArgs);
    const durationMs = (performance.now() - startTime).toFixed(2);

    const paramNamesMatch = jsCode.match(new RegExp(`function\\s+${fnName}\\s*\\(([^)]*)\\)`));
    const paramNames = paramNamesMatch
      ? paramNamesMatch[1]
          .split(',')
          .map((p) => p.trim())
          .filter(Boolean)
      : parsedArgs.map((_, i) => `arg${i + 1}`);

    const memorySnapshot = {};
    paramNames.forEach((pName, idx) => {
      memorySnapshot[pName] = parsedArgs[idx];
    });

    return {
      fnName,
      args: parsedArgs,
      memorySnapshot,
      actualOutput: JSON.stringify(actualOutput),
      logs,
      durationMs,
      staticSteps: challenge.traceDemo?.steps || null
    };
  } catch (err) {
    return {
      error: `Erro durante a inspeção de memória: ${err.message}`,
      logs
    };
  }
}

// ============================================================================
// CONSTRUTOR DE CURRÍCULO ÚNICO E PROGRESSIVO (140 AULAS POR MÓDULO = 700 AULAS)
// ============================================================================
const BASE_INTERACTIVE_MODULES = [
  {
    id: 'mod-1',
    number: 1,
    title: 'Fundamentos da Web: HTML5 & CSS3 do Zero Absoluto',
    subtitle: 'Seus Primeiros Passos: Tags, Portfólio Pessoal, Landing Page, Flexbox & Grid',
    icon: 'Layout',
    description:
      'Feito para quem nunca programou na vida! Aprenda passo a passo construindo projetos reais: Portfólio Pessoal, Cartões de Produto, Menus Flexbox e Grades Responsivas em HTML5 & CSS3.',
    tracks: [
      { name: 'Aula 1 a 35: Primeiras Tags (Títulos, Parágrafos, Listas & Links)', count: 35 },
      { name: 'Aula 36 a 70: Projeto 1 — Portfólio Pessoal & Formulários HTML5', count: 35 },
      { name: 'Aula 71 a 105: Projeto 2 — Estilização CSS3, Cores, Fontes & Box Model', count: 35 },
      { name: 'Aula 106 a 140: Projeto 3 — Landing Page Moderna com Flexbox & CSS Grid', count: 35 }
    ],
    challenges: [
      {
        id: 'html-00-o-que-e-web',
        title: 'Aula 1: Seu Primeiro Código na Vida (Título Principal <h1>)',
        language: 'html',
        difficulty: 'Iniciante',
        xp: 50,
        estimatedTime: '3 min',
        theory: `Parabéns por dar o primeiro passo! Você não precisa saber nada de programação antes desta aula.

Todo site que você abre no navegador é feito com **HTML**. O HTML funciona como etiquetas (chamadas de **tags**) que dizem ao navegador o que cada texto é:
- Uma tag de abertura: \`<h1>\`
- O texto que aparece na tela: \`Olá, Mundo!\`
- Uma tag de fechamento (com uma barra \`/\`): \`</h1>\`

Juntando tudo, fica assim:
\`<h1>Olá, Mundo!</h1>\``,
        instructions: `No editor ao lado (no arquivo index.html), escreva uma tag <h1> com o texto "Olá, Mundo!" dentro dela.

Depois, clique no botão verde "Verificar Código" no topo para testar!`,
        hint: 'Copie ou digite exatamente: <h1>Olá, Mundo!</h1>',
        files: {
          'index.html': `<!-- Digite <h1>Olá, Mundo!</h1> na linha abaixo -->\n`
        },
        communityPosts: [
          {
            id: 'c0',
            author: 'Mariana Lima',
            badge: 'Iniciante',
            time: 'há 1 dia',
            text: 'Nunca tinha programado antes e consegui fazer minha primeira tag <h1> funcionar! Muito fácil!'
          }
        ],
        tests: [
          {
            id: 't1',
            description: 'Você criou a tag <h1> no arquivo index.html',
            testFn: (doc) => {
              if (!doc.querySelector('h1')) {
                throw new Error('Ainda não encontramos a tag <h1>. Lembre-se de abrir com <h1> e fechar com </h1>.');
              }
            }
          },
          {
            id: 't2',
            description: 'O título <h1> contém o texto "Olá, Mundo!"',
            testFn: (doc) => {
              const text = doc.querySelector('h1')?.textContent.trim() || '';
              if (!text.toLowerCase().includes('olá, mundo') && !text.toLowerCase().includes('ola, mundo')) {
                throw new Error(`Esperado "Olá, Mundo!", mas você escreveu "${text}".`);
              }
            }
          }
        ]
      },
      {
        id: 'html-01-subtitulo-h2',
        title: 'Aula 2: Criando Subtítulos com a Tag <h2>',
        language: 'html',
        difficulty: 'Iniciante',
        xp: 50,
        estimatedTime: '3 min',
        theory: `Assim como em um livro ou jornal, uma página web tem um título grande (\`<h1>\`) e subtítulos menores para dividir os assuntos (\`<h2>\`).`,
        instructions: `Abaixo do <h1> que já está no editor, adicione um subtítulo <h2> com o texto "Sobre Mim".`,
        hint: 'Na linha 2 do editor, digite: <h2>Sobre Mim</h2>',
        files: {
          'index.html': `<h1>Meu Primeiro Site</h1>\n<!-- Adicione o subtítulo <h2>Sobre Mim</h2> abaixo -->\n`
        },
        communityPosts: [],
        tests: [
          {
            id: 't1',
            description: 'O título principal <h1> foi mantido',
            testFn: (doc) => {
              if (!doc.querySelector('h1')) throw new Error('Mantenha a tag <h1> na primeira linha.');
            }
          },
          {
            id: 't2',
            description: 'Existe um subtítulo <h2> com o texto "Sobre Mim"',
            testFn: (doc) => {
              const h2 = doc.querySelector('h2');
              if (!h2) throw new Error('Tag <h2> não encontrada.');
              if (!h2.textContent.toLowerCase().includes('sobre mim')) {
                throw new Error(`Esperado "Sobre Mim" dentro do <h2>, mas recebeu "${h2.textContent.trim()}".`);
              }
            }
          }
        ]
      },
      {
        id: 'html-02-paragrafo-p',
        title: 'Aula 3: Escrevendo Textos e Parágrafos com <p>',
        language: 'html',
        difficulty: 'Iniciante',
        xp: 50,
        estimatedTime: '4 min',
        theory: `Para escrever frases e textos comuns em uma página, usamos a tag \`<p>\` (de **Parágrafo**). Veja na aba **Preview ao Vivo** como o navegador mostra o texto imediatamente!`,
        instructions: `Adicione um parágrafo <p> logo abaixo do <h2> escrevendo uma frase se apresentando com pelo menos 5 caracteres.`,
        hint: 'Escreva: <p>Estou aprendendo programação web.</p>',
        files: {
          'index.html': `<h1>Olá, Visitante!</h1>\n<h2>Quem sou eu</h2>\n<!-- Escreva seu parágrafo <p> abaixo -->\n`
        },
        communityPosts: [],
        tests: [
          {
            id: 't1',
            description: 'Existe uma tag de parágrafo <p>',
            testFn: (doc) => {
              if (!doc.querySelector('p')) throw new Error('Nenhuma tag <p> foi encontrada.');
            }
          },
          {
            id: 't2',
            description: 'O parágrafo <p> possui uma frase escrita',
            testFn: (doc) => {
              const text = doc.querySelector('p')?.textContent.trim() || '';
              if (text.length < 5) {
                throw new Error('Escreva uma frase com pelo menos 5 letras dentro da tag <p>.');
              }
            }
          }
        ]
      },
      {
        id: 'html-03-negrito-strong',
        title: 'Aula 4: Destacando Palavras em Negrito com <strong>',
        language: 'html',
        difficulty: 'Iniciante',
        xp: 50,
        estimatedTime: '4 min',
        theory: `Quando queremos destacar uma palavra importante em **negrito** dentro de um parágrafo, envolvemos essa palavra com \`<strong>...</strong>\`.`,
        instructions: `Crie um parágrafo <p> contendo uma palavra destacada com <strong> dentro dele.`,
        hint: 'Escreva: <p>A prática leva à <strong>perfeição</strong> na programação.</p>',
        files: {
          'index.html': `<!-- Crie o parágrafo com uma palavra dentro de <strong> -->\n`
        },
        communityPosts: [],
        tests: [
          {
            id: 't1',
            description: 'Existe um parágrafo <p>',
            testFn: (doc) => {
              if (!doc.querySelector('p')) throw new Error('Adicione a tag <p>.');
            }
          },
          {
            id: 't2',
            description: 'Existe uma palavra em negrito usando <strong> dentro do <p>',
            testFn: (doc) => {
              const strong = doc.querySelector('p strong');
              if (!strong || !strong.textContent.trim()) {
                throw new Error('Coloque a palavra importante entre <strong> e </strong> dentro do parágrafo.');
              }
            }
          }
        ]
      },
      {
        id: 'html-04-lista-ul-li',
        title: 'Aula 5: Criando Listas com Bolinhas (<ul> e <li>)',
        language: 'html',
        difficulty: 'Iniciante',
        xp: 50,
        estimatedTime: '5 min',
        theory: `Para fazer uma lista com bolinhas, usamos \`<ul>\` para envolver a lista inteira e \`<li>\` para cada item.`,
        instructions: `Crie uma lista <ul> contendo pelo menos 3 itens <li> com tecnologias que você vai dominar (HTML, CSS, JavaScript).`,
        hint: 'Abra <ul>, coloque três linhas com <li>Item</li> dentro, e feche com </ul>.',
        files: {
          'index.html': `<h2>Meus Objetivos</h2>\n<!-- Crie sua lista <ul> com 3 itens <li> abaixo -->\n`
        },
        communityPosts: [],
        tests: [
          {
            id: 't1',
            description: 'Existe uma lista <ul> no documento',
            testFn: (doc) => {
              if (!doc.querySelector('ul')) throw new Error('Tag <ul> não encontrada.');
            }
          },
          {
            id: 't2',
            description: 'A lista contém pelo menos 3 itens <li>',
            testFn: (doc) => {
              const items = doc.querySelectorAll('ul li');
              if (items.length < 3) {
                throw new Error(`Encontrados ${items.length} itens <li>. Adicione pelo menos 3 itens.`);
              }
            }
          }
        ]
      },
      {
        id: 'html-05-botao-clicavel',
        title: 'Aula 6: Criando um Botão Interativo com <button>',
        language: 'html',
        difficulty: 'Iniciante',
        xp: 50,
        estimatedTime: '4 min',
        theory: `Todo site precisa de botões para o usuário clicar ("Entrar", "Comprar", "Enviar"). Em HTML, basta usar a tag \`<button>\`!`,
        instructions: `Adicione um botão <button> com o texto "Começar Agora" logo abaixo do parágrafo.`,
        hint: 'Digite: <button>Começar Agora</button>',
        files: {
          'index.html': `<h1>Bem-vindo à NexusDev</h1>\n<p>Clique no botão abaixo para iniciar seus estudos:</p>\n<!-- Adicione o <button>Começar Agora</button> aqui -->\n`
        },
        communityPosts: [],
        tests: [
          {
            id: 't1',
            description: 'Existe um elemento <button> na página',
            testFn: (doc) => {
              if (!doc.querySelector('button')) throw new Error('Tag <button> não encontrada.');
            }
          },
          {
            id: 't2',
            description: 'O botão exibe o texto "Começar Agora"',
            testFn: (doc) => {
              const btn = doc.querySelector('button');
              if (!btn?.textContent.toLowerCase().includes('começar agora')) {
                throw new Error(`Esperado "Começar Agora", mas recebeu "${btn?.textContent.trim()}".`);
              }
            }
          }
        ]
      }
    ]
  },
  {
    id: 'mod-2',
    number: 2,
    title: 'JavaScript: Lógica, Algoritmos & DOM (ES6+)',
    subtitle: 'Variáveis, Condicionais, Laços, Arrays, Visualizador de Memória & Bugs',
    icon: 'Code2',
    description:
      'Domine a linguagem de programação da Web com inspeção dinâmica da memória e console.log ao vivo, métodos funcionais de array, algoritmos reais e desafios de depuração.',
    tracks: [
      { name: 'Variáveis, Operadores Matemáticos & Strings', count: 35 },
      { name: 'Condicionais, Lógica Booleana & Validações', count: 35 },
      { name: 'Arrays, Objetos & Métodos Funcionais (map/filter/reduce)', count: 35 },
      { name: 'Algoritmos Reais, Datas, Moedas & Debugging JS', count: 35 }
    ],
    challenges: [
      {
        id: 'js-01-variaveis-calculo',
        title: 'Calculando Preço com Desconto',
        language: 'javascript',
        targetFunction: 'calcularPrecoComDesconto',
        defaultTraceArgs: [100, 20],
        difficulty: 'Iniciante',
        xp: 50,
        estimatedTime: '4 min',
        theory: `Funções em JavaScript recebem parâmetros (entradas), processam uma lógica e devolvem um resultado usando \`return\`. Use \`console.log()\` e abra o **Visualizador de Memória** para ver os valores ao vivo!`,
        instructions: `Implemente a função calcularPrecoComDesconto(preco, percentualDesconto) que recebe o preço original e o percentual de desconto (ex: 20 para 20%) e retorna o valor final após aplicar o desconto.`,
        hint: 'Multiplique preco por (1 - percentualDesconto / 100) ou subtraia (preco * percentualDesconto / 100) de preco.',
        files: {
          'script.js': `function calcularPrecoComDesconto(preco, percentualDesconto) {\n  // Retorne o preço final com o desconto aplicado\n  \n}`
        },
        communityPosts: [],
        tests: [
          {
            id: 't1',
            description: 'calcularPrecoComDesconto(100, 20) deve retornar 80',
            testFn: (fn, assert) => assert.strictEqual(fn(100, 20), 80)
          },
          {
            id: 't2',
            description: 'calcularPrecoComDesconto(250, 10) deve retornar 225',
            testFn: (fn, assert) => assert.strictEqual(fn(250, 10), 225)
          }
        ]
      },
      {
        id: 'js-02-condicionais-frete',
        title: 'Regra de Frete Grátis com Condicionais',
        language: 'javascript',
        targetFunction: 'calcularFrete',
        defaultTraceArgs: [80, true],
        difficulty: 'Iniciante',
        xp: 50,
        estimatedTime: '5 min',
        theory: `Estruturas condicionais (\`if / else\`) permitem que seu código tome decisões baseadas em comparações como \`>=\` e \`||\` (OU lógico).`,
        instructions: `Complete a função calcularFrete(valorCompra, clienteVip):
- Se valorCompra for maior ou igual a 200 OU clienteVip for true, retorne 0 (frete grátis).
- Caso contrário, retorne 25.`,
        hint: 'Use if (valorCompra >= 200 || clienteVip === true) { return 0; } return 25;',
        files: {
          'script.js': `function calcularFrete(valorCompra, clienteVip) {\n  // Implemente a regra de frete grátis\n  \n}`
        },
        communityPosts: [],
        tests: [
          {
            id: 't1',
            description: 'Compras >= 200 têm frete grátis (0)',
            testFn: (fn, assert) => assert.strictEqual(fn(200, false), 0)
          },
          {
            id: 't2',
            description: 'Clientes VIP têm frete grátis mesmo abaixo de 200',
            testFn: (fn, assert) => assert.strictEqual(fn(80, true), 0)
          },
          {
            id: 't3',
            description: 'Compras < 200 de clientes comuns pagam 25 de frete',
            testFn: (fn, assert) => assert.strictEqual(fn(150, false), 25)
          }
        ]
      },
      {
        id: 'js-03-arrays-soma',
        title: 'Somando Todos os Elementos de um Array',
        language: 'javascript',
        targetFunction: 'somarArray',
        defaultTraceArgs: [[10, 5, 20]],
        difficulty: 'Iniciante',
        xp: 50,
        estimatedTime: '6 min',
        theory: `Arrays armazenam listas ordenadas. Você pode percorrer todos os itens com um laço \`for...of\` ou acumular valores usando \`.reduce((acc, atual) => acc + atual, 0)\`.`,
        instructions: `Escreva uma função chamada somarArray(numeros) que recebe um array de números e retorna a soma de todos eles (0 se vazio).`,
        hint: 'Crie let soma = 0, percorra cada número somando em soma e retorne soma.',
        files: {
          'script.js': `function somarArray(numeros) {\n  // Escreva seu código aqui\n  \n}`
        },
        communityPosts: [],
        tests: [
          {
            id: 't1',
            description: 'somarArray([1, 2, 3, 4]) deve retornar 10',
            testFn: (fn, assert) => assert.strictEqual(fn([1, 2, 3, 4]), 10)
          },
          {
            id: 't2',
            description: 'somarArray([]) deve retornar 0 para array vazio',
            testFn: (fn, assert) => assert.strictEqual(fn([]), 0)
          }
        ]
      }
    ],
    additionalChallenges: [
      {
        id: 'mod-2-aula-4',
        title: 'Calculando Média com Array Vazio',
        language: 'javascript',
        targetFunction: 'calcularMediaSegura',
        defaultTraceArgs: [[8, 10]],
        difficulty: 'Iniciante',
        xp: 50,
        estimatedTime: '5 min',
        theory: `Uma média aritmética é a soma dos valores dividida pela quantidade de itens. Antes de dividir, trate o array vazio para evitar \`NaN\`.`,
        instructions: `Implemente calcularMediaSegura(notas): retorne a média aritmética das notas. Se o array estiver vazio, retorne 0. Considere que a entrada será um array de números.`,
        hint: 'Verifique notas.length === 0 antes de dividir. Depois some os valores e divida pela quantidade.',
        files: { 'script.js': `function calcularMediaSegura(notas) {\n  // Retorne 0 se não houver notas; caso contrário, retorne a média\n  \n}` },
        communityPosts: [],
        tests: [
          { id: 't1', description: 'Calcula a média de [8, 10]', testFn: (fn, assert) => assert.strictEqual(fn([8, 10]), 9) },
          { id: 't2', description: 'Retorna 0 para um array vazio', testFn: (fn, assert) => assert.strictEqual(fn([]), 0) },
          { id: 't3', description: 'Calcula a média de um único elemento', testFn: (fn, assert) => assert.strictEqual(fn([7]), 7) }
        ]
      },
      {
        id: 'mod-2-aula-5',
        title: 'Normalizando um Endereço de E-mail',
        language: 'javascript',
        targetFunction: 'normalizarEmail',
        defaultTraceArgs: ['  Dev@Exemplo.COM  '],
        difficulty: 'Iniciante',
        xp: 50,
        estimatedTime: '4 min',
        theory: `Strings oferecem métodos úteis para padronizar dados. \`trim()\` remove espaços das extremidades e \`toLowerCase()\` converte letras para minúsculas.`,
        instructions: `Implemente normalizarEmail(email) para remover espaços no início/fim e converter todo o endereço para letras minúsculas. Não remova espaços internos.`,
        hint: 'Encadeie email.trim() com toLowerCase().',
        files: { 'script.js': `function normalizarEmail(email) {\n  // Remova espaços das extremidades e converta para minúsculas\n  \n}` },
        communityPosts: [],
        tests: [
          { id: 't1', description: 'Remove espaços externos e converte para minúsculas', testFn: (fn, assert) => assert.strictEqual(fn('  Dev@Exemplo.COM  '), 'dev@exemplo.com') },
          { id: 't2', description: 'Mantém o conteúdo interno', testFn: (fn, assert) => assert.strictEqual(fn('A B@EXEMPLO.COM'), 'a b@exemplo.com') },
          { id: 't3', description: 'Aceita texto sem espaços externos', testFn: (fn, assert) => assert.strictEqual(fn('ana@site.com'), 'ana@site.com') }
        ]
      },
      {
        id: 'mod-2-aula-6',
        title: 'Contando Palavras em uma Frase',
        language: 'javascript',
        targetFunction: 'contarPalavras',
        defaultTraceArgs: ['Aprender JavaScript é prático'],
        difficulty: 'Iniciante',
        xp: 50,
        estimatedTime: '5 min',
        theory: `O método \`.trim()\` remove espaços das extremidades. \`.split(/\\s+/)\` divide uma frase em partes usando um ou mais espaços em branco.`,
        instructions: `Implemente contarPalavras(texto) para retornar a quantidade de palavras separadas por espaços em branco. Espaços repetidos não devem criar palavras extras. Uma string vazia ou só com espaços deve retornar 0.`,
        hint: 'Trate texto.trim() vazio antes de dividir; depois conte os itens produzidos por split.',
        files: { 'script.js': `function contarPalavras(texto) {\n  // Conte palavras ignorando espaços repetidos\n  \n}` },
        communityPosts: [],
        tests: [
          { id: 't1', description: 'Conta palavras separadas por espaços simples', testFn: (fn, assert) => assert.strictEqual(fn('Aprender JavaScript é prático'), 4) },
          { id: 't2', description: 'Ignora espaços repetidos', testFn: (fn, assert) => assert.strictEqual(fn('  um   dois\t três  '), 3) },
          { id: 't3', description: 'Retorna 0 para texto vazio ou só com espaços', testFn: (fn, assert) => { assert.strictEqual(fn(''), 0); assert.strictEqual(fn('   '), 0); } }
        ]
      }
    ]
  },
  {
    id: 'mod-3',
    number: 3,
    title: 'React & Ecossistema Front-End Moderno',
    subtitle: 'Componentes, Props, Estado Imutável, Hooks e Carrinho',
    icon: 'Layers',
    description:
      'Construa aplicações SPA reativas com React. Domine JSX, componentização, useState, useEffect, busca em tempo real e lógica de estado imutável.',
    tracks: [
      { name: 'JSX, Componentes Funcionais & Props', count: 35 },
      { name: 'Gerenciamento de Estado (useState & Imutabilidade)', count: 35 },
      { name: 'Listas Dinâmicas, Filtros & Busca em Tempo Real', count: 35 },
      { name: 'Carrinho de Compras, Checkout & Hooks Customizados', count: 35 }
    ],
    challenges: [
      {
        id: 'react-01-carrinho-imutavel',
        title: 'Adicionando Itens ao Carrinho de Forma Imutável',
        language: 'javascript',
        targetFunction: 'adicionarAoCarrinho',
        defaultTraceArgs: [[], { id: 1, nome: 'Teclado', preco: 200 }],
        difficulty: 'Intermediário',
        xp: 50,
        estimatedTime: '10 min',
        theory: `No React, NUNCA modificamos o estado diretamente (evite \`carrinho.push()\`). Em vez disso, criamos um novo array usando spread \`[...]\` ou \`.map()\`.`,
        instructions: `Implemente adicionarAoCarrinho(carrinho, produto) retornando um NOVO array sem alterar o array original:
- Se produto.id já existir no carrinho, incremente qtd em +1 naquele item.
- Se produto.id for novo, adicione { ...produto, qtd: 1 } ao final do novo array.`,
        hint: 'Verifique com carrinho.some(i => i.id === produto.id). Se existir, use carrinho.map(...); caso contrário, retorne [...carrinho, { ...produto, qtd: 1 }].',
        files: {
          'script.js': `function adicionarAoCarrinho(carrinho, produto) {\n  // Retorne um novo array de carrinho de forma imutável\n  \n}`
        },
        communityPosts: [],
        tests: [
          {
            id: 't1',
            description: 'Adiciona um novo produto com qtd: 1 sem mutar o original',
            testFn: (fn, assert) => {
              const original = [];
              const res = fn(original, { id: 1, nome: 'Teclado', preco: 200 });
              assert.deepEqual(res, [{ id: 1, nome: 'Teclado', preco: 200, qtd: 1 }]);
              assert.strictEqual(original.length, 0);
            }
          },
          {
            id: 't2',
            description: 'Incrementa qtd quando o produto já está no carrinho',
            testFn: (fn, assert) => {
              const original = [{ id: 1, nome: 'Teclado', preco: 200, qtd: 1 }];
              const res = fn(original, { id: 1, nome: 'Teclado', preco: 200 });
              assert.deepEqual(res, [{ id: 1, nome: 'Teclado', preco: 200, qtd: 2 }]);
              assert.strictEqual(original[0].qtd, 1);
            }
          }
        ]
      }

    ],
    additionalChallenges: [
      {
        id: 'mod-3-aula-2',
        title: 'Criando um Componente com Props',
        language: 'javascript',
        targetFunction: 'criarModeloCartaoProduto',
        defaultTraceArgs: [{ nome: 'Teclado', preco: 199.9 }],
        difficulty: 'Iniciante',
        xp: 50,
        estimatedTime: '6 min',
        theory: `No React, componentes são funções que recebem \`props\` e descrevem o que deve aparecer na interface. Nesta atividade, vamos representar o resultado do componente como um objeto simples para praticar a leitura e transformação das props antes de avançar para JSX.`,
        instructions: `Implemente criarModeloCartaoProduto(props). Ela deve retornar um objeto com as propriedades tipo: 'article', titulo: props.nome e preco: props.preco. Não altere o objeto props recebido.`,
        hint: "Retorne um novo objeto: { tipo: 'article', titulo: props.nome, preco: props.preco }.",
        files: { 'script.js': `function criarModeloCartaoProduto(props) {\n  // Retorne um novo objeto com tipo, titulo e preco\n  \n}` },
        communityPosts: [],
        tests: [
          { id: 't1', description: 'Cria o modelo do cartão usando as props', testFn: (fn, assert) => assert.deepEqual(fn({ nome: 'Teclado', preco: 199.9 }), { tipo: 'article', titulo: 'Teclado', preco: 199.9 }) },
          { id: 't2', description: 'Não altera o objeto de props', testFn: (fn, assert) => { const props = { nome: 'Mouse', preco: 59 }; fn(props); assert.deepEqual(props, { nome: 'Mouse', preco: 59 }); } },
          { id: 't3', description: 'Preserva valores numéricos', testFn: (fn, assert) => assert.strictEqual(fn({ nome: 'Monitor', preco: 850 }).preco, 850) }
        ]
      },
      {
        id: 'mod-3-aula-3',
        title: 'Atualizando uma Lista sem Mutação',
        language: 'javascript',
        targetFunction: 'atualizarPrecoProduto',
        defaultTraceArgs: [[{ id: 1, nome: 'Teclado', preco: 100 }, { id: 2, nome: 'Mouse', preco: 50 }], 2, 65],
        difficulty: 'Iniciante',
        xp: 50,
        estimatedTime: '7 min',
        theory: `Ao atualizar estado no React, não devemos modificar arrays e objetos existentes. O método \`.map()\` permite criar uma nova lista, substituindo somente o item que corresponde ao identificador.`,
        instructions: `Implemente atualizarPrecoProduto(produtos, id, novoPreco). Retorne um novo array. O produto com o id informado deve receber o novo preço; os demais devem permanecer iguais. Não modifique o array nem seus objetos originais.`,
        hint: 'Use map para criar novos objetos. Para o item correspondente, retorne { ...produto, preco: novoPreco }; para os outros, retorne o próprio produto.',
        files: { 'script.js': `function atualizarPrecoProduto(produtos, id, novoPreco) {\n  // Retorne uma nova lista sem alterar a original\n  \n}` },
        communityPosts: [],
        tests: [
          { id: 't1', description: 'Atualiza somente o produto com o id informado', testFn: (fn, assert) => assert.deepEqual(fn([{ id: 1, nome: 'Teclado', preco: 100 }, { id: 2, nome: 'Mouse', preco: 50 }], 2, 65), [{ id: 1, nome: 'Teclado', preco: 100 }, { id: 2, nome: 'Mouse', preco: 65 }]) },
          { id: 't2', description: 'Mantém a lista original intacta', testFn: (fn, assert) => { const original = [{ id: 1, nome: 'Teclado', preco: 100 }]; fn(original, 1, 120); assert.deepEqual(original, [{ id: 1, nome: 'Teclado', preco: 100 }]); } },
          { id: 't3', description: 'Retorna uma nova referência de array', testFn: (fn, assert) => { const original = [{ id: 1, nome: 'Mouse', preco: 50 }]; assert.notStrictEqual(fn(original, 9, 60), original); } }
        ]
      },
      {
        id: 'mod-3-aula-4',
        title: 'Filtrando Produtos com filter()',
        language: 'javascript',
        targetFunction: 'filtrarProdutosPorPreco',
        defaultTraceArgs: [[{ nome: 'Mouse', preco: 50 }, { nome: 'Teclado', preco: 120 }, { nome: 'Monitor', preco: 900 }], 100],
        difficulty: 'Iniciante',
        xp: 50,
        estimatedTime: '6 min',
        theory: `O método \`.filter()\` cria um novo array contendo apenas os elementos que passam em uma condição. Em interfaces React, ele é muito usado para buscas e filtros de listas sem alterar os dados originais.`,
        instructions: `Implemente filtrarProdutosPorPreco(produtos, precoMaximo). Retorne apenas os produtos cujo preço seja menor ou igual ao limite. Preserve a ordem e não altere a lista original.`,
        hint: 'Use produtos.filter(produto => produto.preco <= precoMaximo).',
        files: { 'script.js': `function filtrarProdutosPorPreco(produtos, precoMaximo) {\n  // Retorne apenas os produtos dentro do limite\n  \n}` },
        communityPosts: [],
        tests: [
          { id: 't1', description: 'Mantém apenas produtos com preço até o limite', testFn: (fn, assert) => assert.deepEqual(fn([{ nome: 'Mouse', preco: 50 }, { nome: 'Teclado', preco: 120 }, { nome: 'Monitor', preco: 900 }], 100), [{ nome: 'Mouse', preco: 50 }]) },
          { id: 't2', description: 'Retorna array vazio quando nenhum produto atende', testFn: (fn, assert) => assert.deepEqual(fn([{ nome: 'Monitor', preco: 900 }], 100), []) },
          { id: 't3', description: 'Não altera a lista original', testFn: (fn, assert) => { const original = [{ nome: 'Mouse', preco: 50 }]; fn(original, 100); assert.deepEqual(original, [{ nome: 'Mouse', preco: 50 }]); } }
        ]
      }
    ]
  },
  {
    id: 'mod-4',
    number: 4,
    title: 'Back-End com Node.js & Express APIs',
    subtitle: 'Servidores HTTP, Rotas RESTful, Middlewares e Validação',
    icon: 'Server',
    description:
      'Construa o servidor da aplicação. Crie APIs RESTful profissionais com Node.js e Express, valide dados de entrada e domine os códigos de status HTTP.',
    tracks: [
      { name: 'Fundamentos do Node.js, NPM & Módulos', count: 35 },
      { name: 'Criando Servidores & Rotas REST com Express', count: 35 },
      { name: 'Middlewares, Validação & Tratamento de Erros', count: 35 },
      { name: 'Arquitetura MVC & Testes de API', count: 35 }
    ],
    challenges: [
      {
        id: 'node-01-controller-produto',
        title: 'Multi-Arquivo API: Controller Express de Produto (POST)',
        language: 'javascript',
        targetFunction: 'criarProdutoController',
        difficulty: 'Intermediário',
        xp: 50,
        estimatedTime: '10 min',
        theory: `Em uma API Express, separamos a definição de rotas (\`server.js\`) da lógica de negócio (\`produtoController.js\`).`,
        instructions: `No arquivo produtoController.js, complete criarProdutoController(req, res):
1. Extraia { titulo, preco } de req.body.
2. Se !titulo ou typeof preco !== 'number' ou preco <= 0, responda com status 400 e { erro: "Dados inválidos" }.
3. Caso contrário, responda com status 201 e { id: 101, titulo, preco }.`,
        hint: 'Use return res.status(400).json({ erro: "Dados inválidos" }) em caso de erro.',
        files: {
          'produtoController.js': `function criarProdutoController(req, res) {\n  const { titulo, preco } = req.body || {};\n  // Valide os dados e envie a resposta HTTP adequada\n  \n}`,
          'server.js': `// Exemplo de rota Express conectada ao controller:\n// app.post('/api/produtos', criarProdutoController);\n`
        },
        communityPosts: [],
        tests: [
          {
            id: 't1',
            description: 'Retorna status 400 se título estiver vazio ou preço <= 0',
            testFn: (fn, assert) => {
              let status = 200;
              let payload = null;
              const res = {
                status(c) { status = c; return this; },
                json(d) { payload = d; return this; }
              };
              fn({ body: { titulo: '', preco: -5 } }, res);
              assert.strictEqual(status, 400);
              assert.strictEqual(Boolean(payload && payload.erro), true);
            }
          },
          {
            id: 't2',
            description: 'Retorna status 201 com o produto criado quando válido',
            testFn: (fn, assert) => {
              let status = 200;
              let payload = null;
              const res = {
                status(c) { status = c; return this; },
                json(d) { payload = d; return this; }
              };
              fn({ body: { titulo: 'Mouse Sem Fio', preco: 149 } }, res);
              assert.strictEqual(status, 201);
              assert.deepEqual(payload, { id: 101, titulo: 'Mouse Sem Fio', preco: 149 });
            }
          }
        ]
      }

    ],
    additionalChallenges: [
      {
        id: 'mod-4-aula-2',
        title: 'Criando uma Rota GET para Listar Produtos',
        language: 'javascript',
        targetFunction: 'listarProdutosController',
        difficulty: 'Iniciante',
        xp: 50,
        estimatedTime: '7 min',
        theory: `Em uma API REST, o método GET é usado para consultar recursos. No Express, uma rota como \`app.get('/api/produtos', listarProdutosController)\` encaminha a requisição para um controller, que responde com status HTTP e JSON.`,
        instructions: `Implemente listarProdutosController(req, res). Ela deve responder com status 200 e um array JSON com dois produtos: { id: 1, nome: 'Teclado' } e { id: 2, nome: 'Mouse' }. Use res.status(200).json([...]).`,
        hint: "Encadeie res.status(200).json([...]) e retorne a resposta.",
        files: {
          'produtoController.js': `function listarProdutosController(req, res) {\n  // Responda com status 200 e dois produtos em JSON\n  \n}`,
          'server.js': `// Exemplo de rota Express:\n// app.get('/api/produtos', listarProdutosController);\n`
        },
        communityPosts: [],
        tests: [
          { id: 't1', description: 'Retorna status 200 e a lista de produtos', testFn: (fn, assert) => { let status = 0; let payload; const res = { status(code) { status = code; return this; }, json(data) { payload = data; return this; } }; fn({ query: {} }, res); assert.strictEqual(status, 200); assert.deepEqual(payload, [{ id: 1, nome: 'Teclado' }, { id: 2, nome: 'Mouse' }]); } },
          { id: 't2', description: 'A resposta é um array JSON', testFn: (fn, assert) => { let payload; const res = { status() { return this; }, json(data) { payload = data; return this; } }; fn({}, res); assert.ok(Array.isArray(payload)); } }
        ]
      },
      {
        id: 'mod-4-aula-3',
        title: 'Validando Dados Antes de Criar um Recurso',
        language: 'javascript',
        targetFunction: 'validarProduto',
        defaultTraceArgs: [{ titulo: 'Teclado', preco: 120 }],
        difficulty: 'Iniciante',
        xp: 50,
        estimatedTime: '6 min',
        theory: `Uma API não deve confiar nos dados enviados pelo cliente. Antes de criar um recurso, valide os campos e seus tipos. Em Express, essa validação normalmente acontece no controller ou em um middleware dedicado.`,
        instructions: `Implemente validarProduto(dados). Retorne true somente quando dados.titulo for uma string não vazia após trim() e dados.preco for um número finito maior que zero. Para qualquer entrada inválida, retorne false.`,
        hint: 'Verifique se dados existe, se titulo.trim() não está vazio e se Number.isFinite(preco) e preco > 0.',
        files: { 'validacao.js': `function validarProduto(dados) {\n  // Valide título e preço antes de aceitar a requisição\n  \n}` },
        communityPosts: [],
        tests: [
          { id: 't1', description: 'Aceita título preenchido e preço positivo', testFn: (fn, assert) => assert.strictEqual(fn({ titulo: 'Teclado', preco: 120 }), true) },
          { id: 't2', description: 'Rejeita título vazio', testFn: (fn, assert) => assert.strictEqual(fn({ titulo: '   ', preco: 120 }), false) },
          { id: 't3', description: 'Rejeita preço zero, negativo ou não numérico', testFn: (fn, assert) => { assert.strictEqual(fn({ titulo: 'Mouse', preco: 0 }), false); assert.strictEqual(fn({ titulo: 'Mouse', preco: -1 }), false); assert.strictEqual(fn({ titulo: 'Mouse', preco: '50' }), false); } },
          { id: 't4', description: 'Rejeita dados ausentes e preço não finito', testFn: (fn, assert) => { assert.strictEqual(fn(null), false); assert.strictEqual(fn({ titulo: 'Mouse', preco: Infinity }), false); } }
        ]
      },
      {
        id: 'mod-4-aula-4',
        title: 'Padronizando Respostas de Erro da API',
        language: 'javascript',
        targetFunction: 'formatarErroApi',
        defaultTraceArgs: [{ message: 'Produto não encontrado', code: 'NOT_FOUND' }],
        difficulty: 'Iniciante',
        xp: 50,
        estimatedTime: '6 min',
        theory: `Tratamento centralizado de erros ajuda a manter respostas consistentes. Uma API pode transformar erros internos em um objeto JSON previsível, sem expor stack traces ou detalhes sensíveis ao cliente.`,
        instructions: `Implemente formatarErroApi(erro). Retorne um novo objeto com mensagem e codigo. Use erro.message quando for uma string não vazia; caso contrário, use 'Erro interno'. Use erro.code quando for uma string não vazia; caso contrário, use 'INTERNAL_ERROR'. Não inclua stack ou outras propriedades.`,
        hint: "Valide message e code com typeof e trim(). Retorne somente { mensagem, codigo }.",
        files: { 'errorHandler.js': `function formatarErroApi(erro) {\n  // Retorne somente mensagem e codigo seguros e padronizados\n  \n}` },
        communityPosts: [],
        tests: [
          { id: 't1', description: 'Converte erro conhecido para o formato público', testFn: (fn, assert) => assert.deepEqual(fn({ message: 'Produto não encontrado', code: 'NOT_FOUND' }), { mensagem: 'Produto não encontrado', codigo: 'NOT_FOUND' }) },
          { id: 't2', description: 'Usa valores padrão para campos ausentes', testFn: (fn, assert) => assert.deepEqual(fn({}), { mensagem: 'Erro interno', codigo: 'INTERNAL_ERROR' }) },
          { id: 't3', description: 'Não expõe stack trace nem propriedades extras', testFn: (fn, assert) => assert.deepEqual(fn({ message: 'Falha', code: 'DB_ERROR', stack: 'segredo', internal: true }), { mensagem: 'Falha', codigo: 'DB_ERROR' }) },
          { id: 't4', description: 'Ignora strings vazias e campos com tipo inválido', testFn: (fn, assert) => assert.deepEqual(fn({ message: '  ', code: 42 }), { mensagem: 'Erro interno', codigo: 'INTERNAL_ERROR' }) }
        ]
      }
    ]
  },
  {
    id: 'mod-5',
    number: 5,
    title: 'Bancos de Dados & Autenticação (MongoDB & JWT)',
    subtitle: 'Modelagem NoSQL/SQL, Criptografia de Senhas e Segurança JWT',
    icon: 'Database',
    description:
      'Armazene dados com segurança e persistência. Aprenda modelagem de dados com MongoDB e SQL, criptografia com bcrypt e proteção de rotas administrativas com JWT.',
    tracks: [
      { name: 'Bancos Relacionais (SQL) vs. Não-Relacionais (MongoDB)', count: 35 },
      { name: 'Schemas, Relacionamentos & Consultas CRUD', count: 35 },
      { name: 'Autenticação Segura: Hash bcrypt & JSON Web Tokens', count: 35 },
      { name: 'Controle de Acesso por Perfil (RBAC: Admin vs Cliente)', count: 35 }
    ],
    challenges: [
      {
        id: 'auth-01-middleware-admin',
        title: 'Middleware de Proteção de Rota Administrativa (JWT)',
        language: 'javascript',
        targetFunction: 'verificarAdmin',
        difficulty: 'Avançado',
        xp: 50,
        estimatedTime: '10 min',
        theory: `Middlewares de autorização verificam o cabeçalho \`Authorization: Bearer <token>\` e o cargo do usuário antes de liberar acesso ao controller.`,
        instructions: `Implemente verificarAdmin(req, res, next):
1. Se req.headers.authorization não começar com "Bearer ", retorne res.status(401).json({ erro: "Não autorizado" }).
2. Se req.usuario?.cargo !== "admin", retorne res.status(403).json({ erro: "Acesso restrito" }).
3. Caso passe, chame next().`,
        hint: 'Primeiro cheque !req.headers?.authorization?.startsWith("Bearer ") para 401; depois req.usuario?.cargo !== "admin" para 403.',
        files: {
          'authMiddleware.js': `function verificarAdmin(req, res, next) {\n  // Implemente a verificação do token Bearer e do cargo admin\n  \n}`
        },
        communityPosts: [],
        tests: [
          {
            id: 't1',
            description: 'Retorna 401 quando o cabeçalho Authorization está ausente',
            testFn: (fn, assert) => {
              let status = 200;
              let nextCalled = false;
              const res = { status(c) { status = c; return this; }, json() { return this; } };
              fn({ headers: {} }, res, () => { nextCalled = true; });
              assert.strictEqual(status, 401);
              assert.strictEqual(nextCalled, false);
            }
          },
          {
            id: 't2',
            description: 'Chama next() quando há token Bearer e cargo é "admin"',
            testFn: (fn, assert) => {
              let status = 200;
              let nextCalled = false;
              const res = { status(c) { status = c; return this; }, json() { return this; } };
              fn(
                { headers: { authorization: 'Bearer token_admin' }, usuario: { cargo: 'admin' } },
                res,
                () => { nextCalled = true; }
              );
              assert.strictEqual(status, 200);
              assert.strictEqual(nextCalled, true);
            }
          }
        ]
      }

    ],
    additionalChallenges: [
      {
        id: 'mod-5-aula-5',
        title: 'Definindo uma Política de Senhas',
        language: 'javascript',
        targetFunction: 'validarPoliticaSenha',
        difficulty: 'Iniciante',
        xp: 50,
        estimatedTime: '6 min',
        theory: `A política de senha é validada no servidor. Use limites claros de tamanho e nunca armazene senha em texto puro. Para autenticação real, gere hashes com bcrypt e compare com bcrypt.compare; não crie algoritmos criptográficos próprios.`,
        instructions: `Implemente validarPoliticaSenha(senha). Retorne true somente quando senha for string com 8 a 128 caracteres, contendo ao menos uma letra maiúscula, uma minúscula e um número. Retorne false para outros tipos ou valores fora dos limites.`,
        hint: 'Valide o tipo e o tamanho primeiro; depois use testes separados para maiúscula, minúscula e número.',
        files: { 'senha.js': `function validarPoliticaSenha(senha) {\n  // Valide tamanho e variedade de caracteres\n  \n}` },
        communityPosts: [],
        tests: [
          { id: 't1', description: 'Aceita senha com tamanho e variedade válidos', testFn: (fn, assert) => assert.strictEqual(fn('NexusDev2026'), true) },
          { id: 't2', description: 'Rejeita senha sem maiúscula, minúscula ou número', testFn: (fn, assert) => { assert.strictEqual(fn('nexusdev2026'), false); assert.strictEqual(fn('NEXUSDEV2026'), false); assert.strictEqual(fn('NexusDevSenha'), false); } },
          { id: 't3', description: 'Rejeita tamanho fora do intervalo e tipo incorreto', testFn: (fn, assert) => { assert.strictEqual(fn('Ab1'), false); assert.strictEqual(fn('A'.repeat(129) + 'b1'), false); assert.strictEqual(fn(12345678), false); } }
        ]
      },
      {
        id: 'mod-5-aula-6',
        title: 'Extraindo o Token Bearer com Segurança',
        language: 'javascript',
        targetFunction: 'extrairTokenBearer',
        difficulty: 'Intermediário',
        xp: 50,
        estimatedTime: '7 min',
        theory: `APIs costumam receber JWT no cabeçalho Authorization como Bearer. Faça parsing estrito do cabeçalho e rejeite valores ausentes, esquemas diferentes ou tokens com espaços extras. Extrair um token não significa validá-lo: use jwt.verify no servidor com segredo e algoritmo configurados.`,
        instructions: `Implemente extrairTokenBearer(cabecalho). Aceite somente uma string no formato "Bearer TOKEN", sem espaços adicionais e sem espaços dentro do token. Retorne TOKEN ou null se o cabeçalho não obedecer ao formato. A comparação do esquema deve ignorar maiúsculas/minúsculas.`,
        hint: 'Use uma expressão regular ancorada no início e no fim da string.',
        files: { 'token.js': `function extrairTokenBearer(cabecalho) {\n  // Retorne somente o token Bearer bem formado ou null\n  \n}` },
        communityPosts: [],
        tests: [
          { id: 't1', description: 'Extrai token de cabeçalho Bearer válido', testFn: (fn, assert) => { assert.strictEqual(fn('Bearer abc.def.ghi'), 'abc.def.ghi'); assert.strictEqual(fn('bearer token123'), 'token123'); } },
          { id: 't2', description: 'Rejeita esquema incorreto, espaços extras e token vazio', testFn: (fn, assert) => { assert.strictEqual(fn('Basic abc'), null); assert.strictEqual(fn('Bearer '), null); assert.strictEqual(fn('Bearer abc extra'), null); assert.strictEqual(fn(' Bearer abc'), null); } },
          { id: 't3', description: 'Rejeita tipos diferentes de string', testFn: (fn, assert) => { assert.strictEqual(fn(null), null); assert.strictEqual(fn({ authorization: 'Bearer abc' }), null); } }
        ]
      },
      {
        id: 'mod-5-aula-7',
        title: 'Aplicando Controle de Acesso por Perfil (RBAC)',
        language: 'javascript',
        targetFunction: 'podeAcessarPerfil',
        difficulty: 'Intermediário',
        xp: 50,
        estimatedTime: '7 min',
        theory: `RBAC (Role-Based Access Control) concede permissões conforme o perfil atribuído pelo servidor. Nunca confie em role enviado pelo navegador; use a identidade obtida após validar o JWT e consulte o perfil persistido no banco.`,
        instructions: `Implemente podeAcessarPerfil(usuario, perfilNecessario). Retorne true somente se usuario for um objeto, usuario.role for string e for exatamente igual a perfilNecessario (que também deve ser string não vazia). Retorne false para perfis ausentes ou divergentes.`,
        hint: 'Valide os dois argumentos antes de comparar usuario.role === perfilNecessario.',
        files: { 'rbac.js': `function podeAcessarPerfil(usuario, perfilNecessario) {\n  // Compare o perfil confiável do usuário com o exigido\n  \n}` },
        communityPosts: [],
        tests: [
          { id: 't1', description: 'Permite perfil correspondente', testFn: (fn, assert) => { assert.strictEqual(fn({ role: 'admin' }, 'admin'), true); assert.strictEqual(fn({ role: 'student' }, 'student'), true); } },
          { id: 't2', description: 'Nega perfil diferente ou ausente', testFn: (fn, assert) => { assert.strictEqual(fn({ role: 'student' }, 'admin'), false); assert.strictEqual(fn({}, 'admin'), false); assert.strictEqual(fn(null, 'admin'), false); } },
          { id: 't3', description: 'Rejeita perfil exigido inválido', testFn: (fn, assert) => { assert.strictEqual(fn({ role: 'admin' }, ''), false); assert.strictEqual(fn({ role: 'admin' }, null), false); } }
        ]
      }
    ],    challenges: []
  }
];

// ============================================================================
// GERADOR DE 140 AULAS ÚNICAS E TEMÁTICAS POR MÓDULO (SEM REPETIÇÃO GENÉRICA)
// ============================================================================
function buildFull140PerModuleCurriculum(baseModules) {
  const TARGET_PER_MODULE = 140;

  return baseModules.map((mod) => {
    if (mod.isCapstoneModule) {
      return { ...mod, totalSyllabusLessons: 10 };
    }

    const list = [...mod.challenges];
    let idx = list.length + 1;

    while (list.length < TARGET_PER_MODULE) {
      const difficulty = idx <= 45 ? 'Iniciante' : idx <= 95 ? 'Intermediário' : 'Avançado';

      if (mod.number === 1) {
        const scenario = idx % 8;
        if (scenario === 1) {
          const sectionTitle = `Portfólio Dev #${idx}`;
          list.push({
            id: `mod-1-aula-${idx}`,
            title: `Aula ${idx}: Cabeçalho Semântico <header> (${sectionTitle})`,
            language: 'html',
            difficulty,
            xp: 50,
            estimatedTime: '4 min',
            theory: `### Projeto Portfólio • Etapa ${idx}\n\nEm HTML5 moderno, usamos \`<header>\` para agrupar o cabeçalho principal de uma página ou seção.`,
            instructions: `No arquivo index.html, crie uma tag <header> contendo um <h1> com o texto "${sectionTitle}".`,
            hint: `Escreva: <header><h1>${sectionTitle}</h1></header>`,
            files: {
              'index.html': `<!-- Crie o <header> com <h1>${sectionTitle}</h1> -->\n`,
              'style.css': `header { background: #1e293b; color: #34d399; padding: 16px; border-radius: 10px; font-family: sans-serif; }\n`
            },
            communityPosts: [],
            tests: [
              {
                id: 't1',
                description: 'Existe um elemento <header> com <h1> dentro',
                testFn: (doc) => {
                  const h1 = doc.querySelector('header h1');
                  if (!h1 || !h1.textContent.includes(sectionTitle)) {
                    throw new Error(`Adicione <header><h1>${sectionTitle}</h1></header> no index.html.`);
                  }
                }
              }
            ]
          });
        } else if (scenario === 2) {
          list.push({
            id: `mod-1-aula-${idx}`,
            title: `Aula ${idx}: Links de Navegação <nav> e <a href>`,
            language: 'html',
            difficulty,
            xp: 50,
            estimatedTime: '4 min',
            theory: `### Navegação Web • Etapa ${idx}\n\nA tag \`<nav>\` agrupa os links principais do site, criados com \`<a href="#secao">Texto</a>\`.`,
            instructions: `Crie uma barra <nav> com pelo menos 2 links <a> (ex: Início e Projetos).`,
            hint: 'Escreva: <nav><a href="#inicio">Início</a> <a href="#projetos">Projetos</a></nav>',
            files: {
              'index.html': `<!-- Adicione <nav> com dois links <a> -->\n`,
              'style.css': `nav { background: #0f172a; padding: 12px; display: flex; gap: 16px; font-family: sans-serif; }\na { color: #38bdf8; text-decoration: none; font-weight: bold; }\n`
            },
            communityPosts: [],
            tests: [
              {
                id: 't1',
                description: 'A tag <nav> possui pelo menos 2 links <a>',
                testFn: (doc) => {
                  const links = doc.querySelectorAll('nav a');
                  if (links.length < 2) throw new Error('Adicione pelo menos 2 tags <a> dentro de <nav>.');
                }
              }
            ]
          });
        } else if (scenario === 3) {
          list.push({
            id: `mod-1-aula-${idx}`,
            title: `Aula ${idx}: Formulário de Contato (<form>, <input>, <button>)`,
            language: 'html',
            difficulty,
            xp: 50,
            estimatedTime: '5 min',
            theory: `### Formulários HTML5 • Etapa ${idx}\n\nFormulários permitem que visitantes enviem dados usando \`<form>\`, campos \`<input>\` e um botão de envio.`,
            instructions: `Crie um <form> contendo um <input type="email" placeholder="Seu e-mail"> e um <button>Enviar</button>.`,
            hint: 'Coloque <input type="email" placeholder="Seu e-mail"> e <button>Enviar</button> dentro de <form>...</form>.',
            files: {
              'index.html': `<form>\n  <!-- Adicione o input e o button aqui -->\n</form>\n`,
              'style.css': `form { display: flex; gap: 8px; padding: 16px; background: #1e293b; border-radius: 8px; }\ninput { padding: 8px; border-radius: 6px; border: 1px solid #475569; }\nbutton { padding: 8px 16px; background: #10b981; border: none; border-radius: 6px; font-weight: bold; }\n`
            },
            communityPosts: [],
            tests: [
              {
                id: 't1',
                description: 'O <form> contém um <input> e um <button>',
                testFn: (doc) => {
                  if (!doc.querySelector('form input') || !doc.querySelector('form button')) {
                    throw new Error('Inclua um <input> e um <button> dentro da tag <form>.');
                  }
                }
              }
            ]
          });
        } else if (scenario === 4) {
          const padPx = 16 + (idx % 4) * 4;
          list.push({
            id: `mod-1-aula-${idx}`,
            title: `Aula ${idx}: Box Model CSS — Padding e Bordas Arredondadas`,
            language: 'html',
            difficulty,
            xp: 50,
            estimatedTime: '5 min',
            theory: `### CSS Box Model • Etapa ${idx}\n\nNo CSS, \`padding\` define o respiro interno entre o texto e a borda da caixa, enquanto \`border-radius\` arredonda os cantos.`,
            instructions: `Na aba style.css, configure a classe .caixa-destaque para ter:\n1. padding: ${padPx}px;\n2. border-radius: 12px;`,
            hint: `Abra style.css e escreva padding: ${padPx}px; e border-radius: 12px; dentro de .caixa-destaque.`,
            files: {
              'index.html': `<div class="caixa-destaque">\n  <h3>Card Box Model #${idx}</h3>\n  <p>Espaçamento interno limpo com CSS3.</p>\n</div>\n`,
              'style.css': `body { background: #020617; color: white; font-family: sans-serif; padding: 16px; }\n.caixa-destaque {\n  background: #1e293b;\n  border: 1px solid #334155;\n  /* Defina padding e border-radius abaixo */\n  \n}\n`
            },
            communityPosts: [],
            tests: [
              {
                id: 't1',
                description: `.caixa-destaque possui padding e border-radius definidos`,
                testFn: (_doc, _win, rawCss) => {
                  if (!/\.caixa-destaque\s*\{[^}]*padding\s*:/i.test(rawCss)) {
                    throw new Error(`Adicione padding: ${padPx}px; em .caixa-destaque.`);
                  }
                  if (!/\.caixa-destaque\s*\{[^}]*border-radius\s*:/i.test(rawCss)) {
                    throw new Error('Adicione border-radius: 12px; em .caixa-destaque.');
                  }
                }
              }
            ]
          });
        } else if (scenario === 5) {
          list.push({
            id: `mod-1-aula-${idx}`,
            title: `Aula ${idx}: Flexbox — Centralizando Elementos na Tela`,
            language: 'html',
            difficulty,
            xp: 50,
            estimatedTime: '6 min',
            theory: `### Flexbox Centralizado • Etapa ${idx}\n\nCombinando \`display: flex;\`, \`justify-content: center;\` e \`align-items: center;\`, você centraliza qualquer conteúdo perfeitamente.`,
            instructions: `No arquivo style.css, adicione display: flex; justify-content: center; e align-items: center; na classe .centro.`,
            hint: 'Abra style.css e complete as 3 propriedades Flexbox dentro de .centro.',
            files: {
              'index.html': `<div class="centro">\n  <span class="badge">Badge Centralizado #${idx}</span>\n</div>\n`,
              'style.css': `body { background: #020617; font-family: sans-serif; }\n.centro {\n  height: 140px;\n  background: #0f172a;\n  border-radius: 12px;\n  /* Adicione display: flex, justify-content e align-items */\n  \n}\n.badge { background: #10b981; color: #020617; padding: 8px 16px; border-radius: 99px; font-weight: bold; }\n`
            },
            communityPosts: [],
            tests: [
              {
                id: 't1',
                description: '.centro ativa display: flex e justify-content: center',
                testFn: (_doc, _win, rawCss) => {
                  if (!/\.centro\s*\{[^}]*display\s*:\s*flex/i.test(rawCss)) {
                    throw new Error('Adicione display: flex; em .centro.');
                  }
                  if (!/\.centro\s*\{[^}]*justify-content\s*:\s*center/i.test(rawCss)) {
                    throw new Error('Adicione justify-content: center; em .centro.');
                  }
                }
              }
            ]
          });
        } else if (scenario === 6) {
          const cols = (idx % 2) + 2;
          list.push({
            id: `mod-1-aula-${idx}`,
            title: `Aula ${idx}: CSS Grid — Criando Vitrine de ${cols} Colunas`,
            language: 'html',
            difficulty,
            xp: 50,
            estimatedTime: '6 min',
            theory: `### CSS Grid • Etapa ${idx}\n\nCom \`display: grid;\` e \`grid-template-columns: repeat(${cols}, 1fr);\`, criamos vitrines organizadas em ${cols} colunas iguais.`,
            instructions: `Na aba style.css, configure .vitrine com display: grid; e grid-template-columns: repeat(${cols}, 1fr);`,
            hint: `Escreva display: grid; e grid-template-columns: repeat(${cols}, 1fr); dentro de .vitrine.`,
            files: {
              'index.html': `<div class="vitrine">\n  <div class="item">Produto A</div>\n  <div class="item">Produto B</div>\n  <div class="item">Produto C</div>\n</div>\n`,
              'style.css': `body { background: #020617; color: white; font-family: sans-serif; padding: 16px; }\n.vitrine {\n  gap: 12px;\n  /* Configure display: grid e grid-template-columns abaixo */\n  \n}\n.item { background: #1e293b; padding: 16px; border-radius: 8px; text-align: center; }\n`
            },
            communityPosts: [],
            tests: [
              {
                id: 't1',
                description: `.vitrine utiliza display: grid com ${cols} colunas`,
                testFn: (_doc, _win, rawCss) => {
                  if (!/\.vitrine\s*\{[^}]*display\s*:\s*grid/i.test(rawCss)) {
                    throw new Error('Adicione display: grid; em .vitrine.');
                  }
                  if (!/\.vitrine\s*\{[^}]*grid-template-columns\s*:/i.test(rawCss)) {
                    throw new Error(`Adicione grid-template-columns: repeat(${cols}, 1fr); em .vitrine.`);
                  }
                }
              }
            ]
          });
        } else if (scenario === 7) {
          list.push({
            id: `mod-1-aula-${idx}`,
            title: `Aula ${idx} (Debugging): Conserte a Tag Não Fechada e a Cor CSS`,
            language: 'html',
            difficulty,
            isDebug: true,
            xp: 50,
            estimatedTime: '5 min',
            theory: `### Caça aos Bugs HTML/CSS • Etapa ${idx}\n\nTags mal fechadas quebram o layout inteiro da página. Analise o \`index.html\` e o \`style.css\` para restaurar o aviso.`,
            instructions: `Corrija os 2 problemas:\n1. No index.html, feche o parágrafo com </p> em vez de </span>.\n2. No style.css, adicione color: #f8fafc; na classe .alerta.`,
            hint: 'Troque </span> por </p> no index.html e adicione color: #f8fafc; no style.css.',
            files: {
              'index.html': `<div class="alerta">\n  <p>Atenção: verifique o fechamento desta tag!</span>\n</div>\n`,
              'style.css': `.alerta { background: #7f1d1d; padding: 14px; border-radius: 8px; font-family: sans-serif; /* Adicione color: #f8fafc; */ }\n`
            },
            communityPosts: [],
            tests: [
              {
                id: 't1',
                description: 'O parágrafo <p> está fechado com </p> e .alerta tem color definido',
                testFn: (_doc, _win, rawCss, rawHtml) => {
                  if (!/<\/p>/i.test(rawHtml)) throw new Error('Feche o parágrafo com </p> no index.html.');
                  if (!/\.alerta\s*\{[^}]*color\s*:/i.test(rawCss)) {
                    throw new Error('Adicione color: #f8fafc; dentro de .alerta no style.css.');
                  }
                }
              }
            ]
          });
        } else {
          list.push({
            id: `mod-1-aula-${idx}`,
            title: `Aula ${idx}: Card de Perfil Completo (HTML5 + CSS3)`,
            language: 'html',
            difficulty,
            xp: 50,
            estimatedTime: '6 min',
            theory: `### Mini-Projeto Card de Perfil • Etapa ${idx}\n\nCombine HTML semântico (\`<article>\`, \`<h2>\`, \`<p>\`) com estilização CSS moderna.`,
            instructions: `Crie um <article class="perfil"> contendo um <h2> com seu nome e um <p> com sua stack (ex: Full-Stack Developer).`,
            hint: 'Escreva <article class="perfil"><h2>Seu Nome</h2><p>Full-Stack Developer</p></article>.',
            files: {
              'index.html': `<!-- Monte o <article class="perfil"> aqui -->\n`,
              'style.css': `body { background: #020617; color: white; font-family: sans-serif; padding: 16px; }\n.perfil { background: #1e293b; border-left: 4px solid #10b981; padding: 16px; border-radius: 8px; }\n`
            },
            communityPosts: [],
            tests: [
              {
                id: 't1',
                description: 'Existe um <article class="perfil"> com <h2> e <p>',
                testFn: (doc) => {
                  if (!doc.querySelector('article.perfil h2') || !doc.querySelector('article.perfil p')) {
                    throw new Error('Inclua um <h2> e um <p> dentro de <article class="perfil">.');
                  }
                }
              }
            ]
          });
        }
        idx++;
        continue;
      }

      const kind = idx % 6;
      if (mod.number === 2) {
        if (kind === 1) {
          const fnName = `formatarMoedaBRL_${idx}`;
          list.push({
            id: `mod-2-aula-${idx}`,
            title: `Aula ${idx}: Formatando Valores em Real (R$) com Template Strings`,
            language: 'javascript',
            targetFunction: fnName,
            defaultTraceArgs: [49.9],
            difficulty,
            xp: 50,
            estimatedTime: '5 min',
            theory: `Template strings (\`...\`) e \`.toFixed(2)\` são essenciais em lojas virtuais para exibir preços formatados.`,
            instructions: `Implemente ${fnName}(valor) retornando uma string no formato "R$ 49.90" (use \`R$ \${valor.toFixed(2)}\`).`,
            hint: `Retorne \`R$ \${Number(valor).toFixed(2)}\`;`,
            files: { 'script.js': `function ${fnName}(valor) {\n  // Retorne "R$ " seguido do valor com 2 casas decimais\n  \n}` },
            communityPosts: [],
            tests: [
              {
                id: 't1',
                description: `${fnName}(49.9) retorna "R$ 49.90"`,
                testFn: (fn, assert) => assert.strictEqual(fn(49.9), 'R$ 49.90')
              }
            ]
          });
        } else if (kind === 2) {
          const fnName = `contarVogais_${idx}`;
          list.push({
            id: `mod-2-aula-${idx}`,
            title: `Aula ${idx}: Algoritmo de Contagem de Vogais em Texto`,
            language: 'javascript',
            targetFunction: fnName,
            defaultTraceArgs: ['NexusDev'],
            difficulty,
            xp: 50,
            estimatedTime: '6 min',
            theory: `Percorrer strings caractere por caractere permite criar validadores, buscas e analisadores de texto.`,
            instructions: `Implemente ${fnName}(texto) que retorna quantas vogais (a, e, i, o, u — maiúsculas ou minúsculas) existem na string.`,
            hint: 'Converta texto.toLowerCase() e conte quantos caracteres estão em "aeiou".',
            files: { 'script.js': `function ${fnName}(texto) {\n  // Conte as vogais de texto\n  \n}` },
            communityPosts: [],
            tests: [
              {
                id: 't1',
                description: `${fnName}("NexusDev") retorna 3`,
                testFn: (fn, assert) => assert.strictEqual(fn('NexusDev'), 3)
              }
            ]
          });
        } else if (kind === 3) {
          const fnName = `filtrarAprovados_${idx}`;
          const minGrade = 6 + (idx % 3);
          list.push({
            id: `mod-2-aula-${idx}`,
            title: `Aula ${idx}: Filtrando Notas >= ${minGrade} com .filter()`,
            language: 'javascript',
            targetFunction: fnName,
            defaultTraceArgs: [[4, 7, 9, 5]],
            difficulty,
            xp: 50,
            estimatedTime: '5 min',
            theory: `O método \`.filter()\` cria um novo array contendo apenas os elementos que passam em um teste lógico.`,
            instructions: `Implemente ${fnName}(notas) retornando apenas as notas maiores ou iguais a ${minGrade}.`,
            hint: `Retorne notas.filter(n => n >= ${minGrade});`,
            files: { 'script.js': `function ${fnName}(notas) {\n  // Retorne apenas notas >= ${minGrade}\n  \n}` },
            communityPosts: [],
            tests: [
              {
                id: 't1',
                description: `${fnName}([4, 8, 9, 5]) filtra notas >= ${minGrade}`,
                testFn: (fn, assert) => assert.deepEqual(fn([4, 8, 9, 5]), [8, 9])
              }
            ]
          });
        } else if (kind === 4) {
          const fnName = `aplicarCupom_${idx}`;
          const discount = 10 + (idx % 4) * 5;
          list.push({
            id: `mod-2-aula-${idx}`,
            title: `Aula ${idx}: Validador de Cupom Promocional (${discount}% OFF)`,
            language: 'javascript',
            targetFunction: fnName,
            defaultTraceArgs: [200, 'NEXUS'],
            difficulty,
            xp: 50,
            estimatedTime: '6 min',
            theory: `Combinar validação de string (\`.trim().toUpperCase()\`) com cálculo percentual evita erros de digitação do usuário no checkout.`,
            instructions: `Implemente ${fnName}(total, cupom): se cupom (ignorando maiúsculas/minúsculas) for "NEXUS", aplique ${discount}% de desconto; caso contrário retorne total intacto.`,
            hint: `if (String(cupom).trim().toUpperCase() === 'NEXUS') return total * ${(100 - discount) / 100}; return total;`,
            files: { 'script.js': `function ${fnName}(total, cupom) {\n  // Aplique ${discount}% de desconto se cupom for "NEXUS"\n  \n}` },
            communityPosts: [],
            tests: [
              {
                id: 't1',
                description: `Aplica ${discount}% quando cupom é "nexus"`,
                testFn: (fn, assert) => assert.strictEqual(fn(200, 'nexus'), 200 * ((100 - discount) / 100))
              },
              {
                id: 't2',
                description: 'Mantém valor original para cupom inválido',
                testFn: (fn, assert) => assert.strictEqual(fn(200, 'INVALIDO'), 200)
              }
            ]
          });
        } else if (kind === 5) {
          const fnName = `encontrarMaior_${idx}`;
          list.push({
            id: `mod-2-aula-${idx}`,
            title: `Aula ${idx}: Encontrando o Maior Número de um Array`,
            language: 'javascript',
            targetFunction: fnName,
            defaultTraceArgs: [[12, 45, 7, 89, 23]],
            difficulty,
            xp: 50,
            estimatedTime: '5 min',
            theory: `Você pode usar \`Math.max(...numeros)\` ou percorrer o array comparando cada elemento com o maior visto até o momento.`,
            instructions: `Implemente ${fnName}(numeros) retornando o maior número do array (ou 0 se vazio).`,
            hint: 'Se numeros.length === 0 retorne 0; caso contrário retorne Math.max(...numeros);',
            files: { 'script.js': `function ${fnName}(numeros) {\n  // Retorne o maior número da lista\n  \n}` },
            communityPosts: [],
            tests: [
              {
                id: 't1',
                description: `${fnName}([12, 45, 7, 89, 23]) retorna 89`,
                testFn: (fn, assert) => assert.strictEqual(fn([12, 45, 7, 89, 23]), 89)
              }
            ]
          });
        } else {
          const fnName = `calcularMedia_${idx}`;
          list.push({
            id: `mod-2-aula-${idx}`,
            title: `Aula ${idx} (Debugging): Corrija a Divisão por Zero na Média`,
            language: 'javascript',
            targetFunction: fnName,
            defaultTraceArgs: [[]],
            difficulty,
            isDebug: true,
            xp: 50,
            estimatedTime: '5 min',
            theory: `Dividir por \`notas.length\` quando o array está vazio gera \`NaN\`. Sempre proteja casos de borda!`,
            instructions: `Corrija ${fnName}(notas) para retornar 0 quando notas estiver vazio, ou a média aritmética caso contrário.`,
            hint: 'Adicione if (!notas || notas.length === 0) return 0; antes de dividir.',
            files: {
              'script.js': `function ${fnName}(notas) {\n  // BUG: retorna NaN se notas for []\n  const soma = notas.reduce((acc, n) => acc + n, 0);\n  return soma / notas.length;\n}`
            },
            communityPosts: [],
            tests: [
              {
                id: 't1',
                description: `${fnName}([]) retorna 0 em vez de NaN`,
                testFn: (fn, assert) => assert.strictEqual(fn([]), 0)
              },
              {
                id: 't2',
                description: `${fnName}([8, 10]) retorna 9`,
                testFn: (fn, assert) => assert.strictEqual(fn([8, 10]), 9)
              }
            ]
          });
        }
        idx++;
        continue;
      }

      if (mod.number === 3) {
        const scenario = idx % 5;
        if (scenario === 0) {
          const fnName = `alternarFavoritoReact_${idx}`;
          list.push({
            id: `mod-3-aula-${idx}`,
            title: `Aula ${idx}: Alternando Favorito em Lista React (.map Imutável)`,
            language: 'javascript',
            targetFunction: fnName,
            defaultTraceArgs: [[{ id: 1, favorito: false }, { id: 2, favorito: true }], 1],
            difficulty,
            xp: 50,
            estimatedTime: '6 min',
            theory: `Em listas React, usamos \`.map()\` para atualizar apenas o item cujo \`id\` corresponde ao clicado, mantendo os demais intactos sem mutar o estado.`,
            instructions: `Implemente ${fnName}(itens, idAlvo) retornando um novo array onde o item com id === idAlvo tem sua propriedade boolean "favorito" invertida (!item.favorito).`,
            hint: 'Retorne itens.map(item => item.id === idAlvo ? { ...item, favorito: !item.favorito } : item);',
            files: {
              'script.js': `function ${fnName}(itens, idAlvo) {\n  // Inverta item.favorito de forma imutável usando .map()\n  \n}`
            },
            communityPosts: [],
            tests: [
              {
                id: 't1',
                description: 'Inverte favorito sem mutar o array original',
                testFn: (fn, assert) => {
                  const orig = [{ id: 1, favorito: false }];
                  const res = fn(orig, 1);
                  assert.deepEqual(res, [{ id: 1, favorito: true }]);
                  assert.strictEqual(orig[0].favorito, false);
                }
              }
            ]
          });
        } else if (scenario === 1) {
          const fnName = `removerItemEstado_${idx}`;
          list.push({
            id: `mod-3-aula-${idx}`,
            title: `Aula ${idx}: Removendo Item do Estado React (.filter Imutável)`,
            language: 'javascript',
            targetFunction: fnName,
            defaultTraceArgs: [[{ id: 1 }, { id: 2 }], 1],
            difficulty,
            xp: 50,
            estimatedTime: '6 min',
            theory: `Para remover um item de um estado array no React sem mutá-lo, usamos \`.filter(item => item.id !== idRemover)\`.`,
            instructions: `Implemente ${fnName}(itens, idRemover) retornando um novo array sem o item cujo id seja igual a idRemover.`,
            hint: 'Retorne itens.filter(item => item.id !== idRemover);',
            files: {
              'script.js': `function ${fnName}(itens, idRemover) {\n  // Remova o item com id === idRemover usando .filter()\n  \n}`
            },
            communityPosts: [],
            tests: [
              {
                id: 't1',
                description: 'Remove o item correspondente sem mutar o original',
                testFn: (fn, assert) => {
                  const orig = [{ id: 1 }, { id: 2 }];
                  const res = fn(orig, 1);
                  assert.deepEqual(res, [{ id: 2 }]);
                  assert.strictEqual(orig.length, 2);
                }
              }
            ]
          });
        } else if (scenario === 2) {
          const fnName = `filtrarBuscaProdutos_${idx}`;
          list.push({
            id: `mod-3-aula-${idx}`,
            title: `Aula ${idx}: Busca Instantânea no Catálogo React (useMemo + .filter)`,
            language: 'javascript',
            targetFunction: fnName,
            defaultTraceArgs: [[{ nome: 'Teclado Mecânico' }, { nome: 'Mouse Gamer' }], 'mouse'],
            difficulty,
            xp: 50,
            estimatedTime: '6 min',
            theory: `Filtros de busca em tempo real no React comparam strings em minúsculas (\`.toLowerCase()\`) para ignorar diferenças entre maiúsculas e minúsculas.`,
            instructions: `Implemente ${fnName}(produtos, termoBusca) retornando os produtos cujo "nome" contenha "termoBusca" (ignorando maiúsculas/minúsculas).`,
            hint: 'Use produtos.filter(p => p.nome.toLowerCase().includes(termoBusca.trim().toLowerCase()));',
            files: {
              'script.js': `function ${fnName}(produtos, termoBusca) {\n  // Filtre os produtos pelo termoBusca sem diferenciar maiúsculas\n  \n}`
            },
            communityPosts: [],
            tests: [
              {
                id: 't1',
                description: 'Filtra corretamente ignorando maiúsculas/minúsculas',
                testFn: (fn, assert) => {
                  const lista = [{ nome: 'Teclado Mecânico' }, { nome: 'Mouse Gamer' }];
                  assert.deepEqual(fn(lista, 'MOUSE'), [{ nome: 'Mouse Gamer' }]);
                }
              }
            ]
          });
        } else if (scenario === 3) {
          const fnName = `calcularSubtotalCarrinho_${idx}`;
          list.push({
            id: `mod-3-aula-${idx}`,
            title: `Aula ${idx}: Estado Derivado — Subtotal do Carrinho (.reduce)`,
            language: 'javascript',
            targetFunction: fnName,
            defaultTraceArgs: [[{ preco: 120, qtd: 2 }, { preco: 50, qtd: 1 }]],
            difficulty,
            xp: 50,
            estimatedTime: '6 min',
            theory: `Em vez de guardar o subtotal em um segundo \`useState\`, calculamos o valor derivado diretamente do array \`carrinho\` usando \`.reduce()\`.`,
            instructions: `Implemente ${fnName}(carrinho) retornando a soma de (item.preco * item.qtd) de todos os itens.`,
            hint: 'Retorne carrinho.reduce((acc, item) => acc + item.preco * item.qtd, 0);',
            files: {
              'script.js': `function ${fnName}(carrinho) {\n  // Calcule o valor total (preco * qtd) usando .reduce()\n  \n}`
            },
            communityPosts: [],
            tests: [
              {
                id: 't1',
                description: 'Calcula o subtotal corretamente',
                testFn: (fn, assert) => {
                  assert.strictEqual(fn([{ preco: 120, qtd: 2 }, { preco: 50, qtd: 1 }]), 290);
                }
              }
            ]
          });
        } else {
          const fnName = `paginarListaReact_${idx}`;
          list.push({
            id: `mod-3-aula-${idx}`,
            title: `Aula ${idx}: Paginação de Lista no Front-End (.slice)`,
            language: 'javascript',
            targetFunction: fnName,
            defaultTraceArgs: [['A', 'B', 'C', 'D', 'E'], 2, 2],
            difficulty,
            xp: 50,
            estimatedTime: '6 min',
            theory: `Para paginar resultados no React, calculamos \`inicio = (pagina - 1) * porPagina\` e usamos \`itens.slice(inicio, inicio + porPagina)\`.`,
            instructions: `Implemente ${fnName}(itens, pagina, porPagina) retornando a fatia correspondente da página atual (1-based).`,
            hint: 'const inicio = (pagina - 1) * porPagina; return itens.slice(inicio, inicio + porPagina);',
            files: {
              'script.js': `function ${fnName}(itens, pagina, porPagina) {\n  // Retorne os itens da página solicitada usando .slice()\n  \n}`
            },
            communityPosts: [],
            tests: [
              {
                id: 't1',
                description: 'Retorna os itens da página 2 com 2 itens por página',
                testFn: (fn, assert) => {
                  assert.deepEqual(fn(['A', 'B', 'C', 'D', 'E'], 2, 2), ['C', 'D']);
                }
              }
            ]
          });
        }
      } else if (mod.number === 4) {
        const scenario = idx % 4;
        if (scenario === 0) {
          const fnName = `handlerExpress_${idx}`;
          const minLen = 3 + (idx % 4);
          list.push({
            id: `mod-4-aula-${idx}`,
            title: `Aula ${idx}: Controller Express — Validação de Campo (mín. ${minLen} caracteres)`,
            language: 'javascript',
            targetFunction: fnName,
            difficulty,
            xp: 50,
            estimatedTime: '6 min',
            theory: `Validar \`req.body\` antes de salvar no banco evita dados corrompidos e retorna status HTTP \`400 Bad Request\` claro para o Front-End.`,
            instructions: `Implemente ${fnName}(req, res):
1. Leia req.body.nome.
2. Se !nome ou nome.trim().length < ${minLen}, retorne res.status(400).json({ erro: "Nome muito curto" }).
3. Caso contrário, retorne res.status(200).json({ ok: true, nome: nome.trim() }).`,
            hint: `Verifique if (!nome || nome.trim().length < ${minLen}) return res.status(400).json({ erro: "Nome muito curto" });`,
            files: {
              'controller.js': `function ${fnName}(req, res) {\n  const { nome } = req.body || {};\n  // Valide e envie a resposta HTTP\n  \n}`
            },
            communityPosts: [],
            tests: [
              {
                id: 't1',
                description: `Retorna 400 se nome tiver menos de ${minLen} caracteres`,
                testFn: (fn, assert) => {
                  let st = 200;
                  const res = { status(c) { st = c; return this; }, json() { return this; } };
                  fn({ body: { nome: 'ab' } }, res);
                  assert.strictEqual(st, 400);
                }
              },
              {
                id: 't2',
                description: 'Retorna 200 quando o nome é válido',
                testFn: (fn, assert) => {
                  let st = 500;
                  let data = null;
                  const res = { status(c) { st = c; return this; }, json(d) { data = d; return this; } };
                  fn({ body: { nome: 'Notebook Pro' } }, res);
                  assert.strictEqual(st, 200);
                  assert.strictEqual(data.ok, true);
                }
              }
            ]
          });
        } else if (scenario === 1) {
          const fnName = `buscarPorIdController_${idx}`;
          list.push({
            id: `mod-4-aula-${idx}`,
            title: `Aula ${idx}: Rota GET /api/itens/:id — Retornando 404 Not Found`,
            language: 'javascript',
            targetFunction: fnName,
            difficulty,
            xp: 50,
            estimatedTime: '6 min',
            theory: `Quando um recurso solicitado em \`req.params.id\` não existe na lista ou no banco, a API REST deve responder com status HTTP \`404\`.`,
            instructions: `Implemente ${fnName}(req, res, lista): procure o item com item.id === req.params.id. Se não achar, retorne res.status(404).json({ erro: "Não encontrado" }); senão retorne res.status(200).json(item).`,
            hint: 'const item = lista.find(i => i.id === req.params.id); if (!item) return res.status(404).json({ erro: "Não encontrado" });',
            files: {
              'controller.js': `function ${fnName}(req, res, lista) {\n  // Busque item por req.params.id e retorne 404 ou 200\n  \n}`
            },
            communityPosts: [],
            tests: [
              {
                id: 't1',
                description: 'Retorna 404 quando o ID não existe',
                testFn: (fn, assert) => {
                  let st = 200;
                  const res = { status(c) { st = c; return this; }, json() { return this; } };
                  fn({ params: { id: '99' } }, res, [{ id: '1', nome: 'Item 1' }]);
                  assert.strictEqual(st, 404);
                }
              },
              {
                id: 't2',
                description: 'Retorna 200 com o item encontrado',
                testFn: (fn, assert) => {
                  let st = 500;
                  let body = null;
                  const res = { status(c) { st = c; return this; }, json(d) { body = d; return this; } };
                  fn({ params: { id: '1' } }, res, [{ id: '1', nome: 'Item 1' }]);
                  assert.strictEqual(st, 200);
                  assert.deepEqual(body, { id: '1', nome: 'Item 1' });
                }
              }
            ]
          });
        } else if (scenario === 2) {
          const fnName = `validarCadastroEmail_${idx}`;
          list.push({
            id: `mod-4-aula-${idx}`,
            title: `Aula ${idx}: Middleware de Validação de E-mail e Senha na API`,
            language: 'javascript',
            targetFunction: fnName,
            difficulty,
            xp: 50,
            estimatedTime: '6 min',
            theory: `Antes de processar um cadastro no servidor, validamos formato de e-mail e tamanho mínimo de senha antes de chamar \`next()\`.`,
            instructions: `Implemente ${fnName}(req, res, next): se !req.body?.email?.includes('@') ou (req.body?.senha || '').length < 6, retorne res.status(400).json({ erro: "Credenciais inválidas" }); caso contrário chame next().`,
            hint: 'Cheque email e senha.length < 6; se estiver tudo certo, execute next().',
            files: {
              'validateMiddleware.js': `function ${fnName}(req, res, next) {\n  // Valide email e senha antes de chamar next()\n  \n}`
            },
            communityPosts: [],
            tests: [
              {
                id: 't1',
                description: 'Bloqueia com 400 se e-mail não tiver @ ou senha < 6',
                testFn: (fn, assert) => {
                  let st = 200;
                  const res = { status(c) { st = c; return this; }, json() { return this; } };
                  fn({ body: { email: 'invalido', senha: '123' } }, res, () => {});
                  assert.strictEqual(st, 400);
                }
              },
              {
                id: 't2',
                description: 'Chama next() para e-mail e senha válidos',
                testFn: (fn, assert) => {
                  let called = false;
                  const res = { status() { return this; }, json() { return this; } };
                  fn({ body: { email: 'dev@nexus.com', senha: 'segredo123' } }, res, () => {
                    called = true;
                  });
                  assert.strictEqual(called, true);
                }
              }
            ]
          });
        } else {
          const fnName = `normalizarQueryFiltro_${idx}`;
          list.push({
            id: `mod-4-aula-${idx}`,
            title: `Aula ${idx}: Query Params Express (req.query) — Paginação Segura`,
            language: 'javascript',
            targetFunction: fnName,
            defaultTraceArgs: [{ page: '2', limit: '50' }],
            difficulty,
            xp: 50,
            estimatedTime: '6 min',
            theory: `Parâmetros vindos de \`req.query\` sempre chegam como strings e podem ultrapassar limites seguros. Convertemos com \`Number()\` e limitamos o máximo a 20 itens.`,
            instructions: `Implemente ${fnName}(query) retornando { page, limit } onde page = Math.max(1, Number(query.page) || 1) e limit = Math.min(20, Math.max(1, Number(query.limit) || 10)).`,
            hint: 'Use Math.max e Math.min para garantir page >= 1 e 1 <= limit <= 20.',
            files: {
              'queryHelper.js': `function ${fnName}(query = {}) {\n  // Normalize page e limit com segurança\n  \n}`
            },
            communityPosts: [],
            tests: [
              {
                id: 't1',
                description: 'Limita o máximo de itens por página a 20',
                testFn: (fn, assert) => {
                  assert.deepEqual(fn({ page: '3', limit: '100' }), { page: 3, limit: 20 });
                }
              }
            ]
          });
        }
      } else {
        const scenario = idx % 4;
        if (scenario === 0) {
          const fnName = `validarPermissaoJWT_${idx}`;
          const requiredRole = idx % 2 === 0 ? 'admin' : 'editor';
          list.push({
            id: `mod-5-aula-${idx}`,
            title: `Aula ${idx}: Autorização RBAC — Exigindo Perfil "${requiredRole}"`,
            language: 'javascript',
            targetFunction: fnName,
            defaultTraceArgs: [{ id: 'u1', role: requiredRole }],
            difficulty,
            xp: 50,
            estimatedTime: '6 min',
            theory: `Em sistemas com múltiplos perfis (RBAC), verificamos \`usuario.role\` antes de permitir operações críticas no MongoDB.`,
            instructions: `Implemente ${fnName}(usuario) retornando true se usuario && usuario.role === "${requiredRole}", e false caso contrário.`,
            hint: `Retorne Boolean(usuario && usuario.role === "${requiredRole}");`,
            files: {
              'rbac.js': `function ${fnName}(usuario) {\n  // Retorne true apenas se usuario.role === "${requiredRole}"\n  \n}`
            },
            communityPosts: [],
            tests: [
              {
                id: 't1',
                description: `Permite acesso para role "${requiredRole}"`,
                testFn: (fn, assert) => assert.strictEqual(fn({ role: requiredRole }), true)
              },
              {
                id: 't2',
                description: 'Bloqueia acesso para visitante ou outro perfil',
                testFn: (fn, assert) => assert.strictEqual(fn({ role: 'guest' }), false)
              }
            ]
          });
        } else if (scenario === 1) {
          const fnName = `verificarExpiracaoToken_${idx}`;
          list.push({
            id: `mod-5-aula-${idx}`,
            title: `Aula ${idx}: Segurança JWT — Verificando Expiração (exp)`,
            language: 'javascript',
            targetFunction: fnName,
            defaultTraceArgs: [{ exp: 2000 }, 1500],
            difficulty,
            xp: 50,
            estimatedTime: '6 min',
            theory: `Todo payload JWT possui o campo \`exp\` (timestamp em segundos). Se \`agoraSegundos >= payload.exp\`, o token está expirado.`,
            instructions: `Implemente ${fnName}(payload, agoraSegundos) retornando true se o token ainda for válido (payload && typeof payload.exp === 'number' && payload.exp > agoraSegundos), e false se expirado.`,
            hint: "Retorne Boolean(payload && typeof payload.exp === 'number' && payload.exp > agoraSegundos);",
            files: {
              'jwtGuard.js': `function ${fnName}(payload, agoraSegundos) {\n  // Retorne true apenas se payload.exp > agoraSegundos\n  \n}`
            },
            communityPosts: [],
            tests: [
              {
                id: 't1',
                description: 'Retorna true para token ainda dentro da validade',
                testFn: (fn, assert) => assert.strictEqual(fn({ exp: 2000 }, 1500), true)
              },
              {
                id: 't2',
                description: 'Retorna false para token expirado',
                testFn: (fn, assert) => assert.strictEqual(fn({ exp: 1500 }, 1500), false)
              }
            ]
          });
        } else if (scenario === 2) {
          const fnName = `sanitizarUsuarioPublico_${idx}`;
          list.push({
            id: `mod-5-aula-${idx}`,
            title: `Aula ${idx}: Segurança de Dados — Removendo passwordHash da Resposta`,
            language: 'javascript',
            targetFunction: fnName,
            defaultTraceArgs: [{ _id: '1', name: 'Ana', email: 'ana@dev.com', passwordHash: '$2b$10$xyz' }],
            difficulty,
            xp: 50,
            estimatedTime: '6 min',
            theory: `Nunca devemos retornar \`passwordHash\` ou segredos internos do documento MongoDB nas respostas JSON da API.`,
            instructions: `Implemente ${fnName}(userDoc) retornando um novo objeto contendo apenas { id: userDoc._id, name: userDoc.name, email: userDoc.email } sem passwordHash.`,
            hint: 'Retorne { id: userDoc._id, name: userDoc.name, email: userDoc.email };',
            files: {
              'userSerializer.js': `function ${fnName}(userDoc) {\n  // Retorne apenas id, name e email (sem passwordHash)\n  \n}`
            },
            communityPosts: [],
            tests: [
              {
                id: 't1',
                description: 'Remove passwordHash e formata os campos públicos',
                testFn: (fn, assert) => {
                  const res = fn({ _id: '1', name: 'Ana', email: 'ana@dev.com', passwordHash: 'secret' });
                  assert.deepEqual(res, { id: '1', name: 'Ana', email: 'ana@dev.com' });
                  assert.strictEqual('passwordHash' in res, false);
                }
              }
            ]
          });
        } else {
          const fnName = `somarPedidosPagos_${idx}`;
          list.push({
            id: `mod-5-aula-${idx}`,
            title: `Aula ${idx}: Agregação de Pedidos Pagos no Banco de Dados`,
            language: 'javascript',
            targetFunction: fnName,
            defaultTraceArgs: [[{ status: 'pago', total: 150 }, { status: 'pendente', total: 300 }, { status: 'pago', total: 50 }]],
            difficulty,
            xp: 50,
            estimatedTime: '6 min',
            theory: `Relatórios financeiros filtram apenas registros com \`status === 'pago'\` antes de somar o faturamento total.`,
            instructions: `Implemente ${fnName}(pedidos) somando a propriedade "total" apenas dos pedidos cujo status seja "pago".`,
            hint: "Filtre pedidos.filter(p => p.status === 'pago') e some com .reduce((acc, p) => acc + p.total, 0).",
            files: {
              'relatorioPedidos.js': `function ${fnName}(pedidos) {\n  // Some o total apenas dos pedidos com status === "pago"\n  \n}`
            },
            communityPosts: [],
            tests: [
              {
                id: 't1',
                description: 'Soma apenas pedidos com status "pago"',
                testFn: (fn, assert) => {
                  const dados = [
                    { status: 'pago', total: 150 },
                    { status: 'pendente', total: 300 },
                    { status: 'pago', total: 50 }
                  ];
                  assert.strictEqual(fn(dados), 200);
                }
              }
            ]
          });
        }
      }

      idx++;
    }

    const additionalChallenges = mod.additionalChallenges || [];
    const additionalById = new Map(additionalChallenges.map((challenge) => [challenge.id, challenge]));
    const finalChallenges = list.map((challenge) =>
      additionalById.get(challenge.id) || challenge
    );

    return {
      ...mod,
      totalSyllabusLessons: finalChallenges.length,
      challenges: finalChallenges
    };
  });
}

const INTERACTIVE_MODULES = buildFull140PerModuleCurriculum(BASE_INTERACTIVE_MODULES);

const CAPSTONE_REQUIREMENTS = [
  {
    id: 'cap-auth',
    category: 'Autenticação & Segurança',
    title: 'Cadastro e Login com Senha Criptografada (bcrypt) & Token JWT',
    details: 'Endpoints seguros de autenticação diferenciando usuários comuns (clientes) e administradores.'
  },
  {
    id: 'cap-catalog',
    category: 'Loja Virtual (Front-End React)',
    title: 'Vitrine Dinâmica com Busca em Tempo Real, Filtros e Página de Detalhes',
    details: 'Interface responsiva consumindo a API REST com navegação entre rotas públicas e privadas.'
  },
  {
    id: 'cap-cart',
    category: 'Carrinho & Fluxo de Checkout',
    title: 'Carrinho Persistente e Criação de Pedidos no Banco de Dados',
    details: 'Adicionar, remover e alterar quantidades de itens, finalizando o pedido vinculado ao usuário autenticado.'
  },
  {
    id: 'cap-admin',
    category: 'Painel Administrativo (Dashboard)',
    title: 'CRUD Completo de Produtos & Gestão de Status de Pedidos',
    details: 'Rotas protegidas para administradores cadastrarem/editarem produtos e atualizarem status de entrega.'
  },
  {
    id: 'cap-deploy',
    category: 'Git & Deploy em Produção',
    title: 'Repositório Organizado no GitHub + Aplicação Publicada na Nuvem',
    details: 'Código versionado com README documentado e links funcionais no ar (ex: Vercel + Render/Railway).'
  }
];

function ModuleIcon({ name, className = 'w-5 h-5' }) {
  switch (name) {
    case 'Layout':
      return <Layout className={className} />;
    case 'Code2':
      return <Code2 className={className} />;
    case 'Layers':
      return <Layers className={className} />;
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

// ============================================================================
// COMPONENTE PRINCIPAL DA APLICAÇÃO
// ============================================================================
export default function App() {
  const allChallenges = useMemo(() => {
    return INTERACTIVE_MODULES.flatMap((mod) =>
      mod.challenges.map((ch) => ({
        ...ch,
        moduleId: mod.id,
        moduleNumber: mod.number,
        moduleTitle: mod.title
      }))
    );
  }, []);

  const totalSyllabusCount = allChallenges.length;

  const initialCertParam = useMemo(() => {
    try {
      const pathname = window.location.pathname || '';
      const certPathMatch = pathname.match(/^\/cert\/([^/]+)/i);
      if (certPathMatch && certPathMatch[1]) {
        return decodeURIComponent(certPathMatch[1]).trim().toUpperCase();
      }
      const params = new URLSearchParams(window.location.search);
      return (params.get('cert') || '').trim().toUpperCase();
    } catch {
      return '';
    }
  }, []);

  const [navState, setNavState] = useState(() => {
    if (initialCertParam) {
      return {
        activeView: 'verify',
        activeModuleId: 'mod-6',
        activeChallengeId: allChallenges[0].id
      };
    }
    try {
      const savedNav = localStorage.getItem('nexusdev_app_state');
      if (savedNav) {
        const parsed = JSON.parse(savedNav);
        const validChallenge = allChallenges.some((c) => c.id === parsed.activeChallengeId);
        return {
          activeView: parsed.activeView || 'home',
          activeModuleId: parsed.activeModuleId || 'mod-1',
          activeChallengeId: validChallenge ? parsed.activeChallengeId : allChallenges[0].id
        };
      }
    } catch {}
    return {
      activeView: 'home',
      activeModuleId: 'mod-1',
      activeChallengeId: allChallenges[0].id
    };
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('nexusdev_app_state', JSON.stringify(navState));
    } catch {}
  }, [navState]);

  const setActiveView = (view) => {
    setNavState((prev) => ({ ...prev, activeView: view }));
    setMobileMenuOpen(false);
  };

  const setActiveChallengeId = (challengeId) => {
    const found = allChallenges.find((c) => c.id === challengeId);
    setNavState((prev) => ({
      ...prev,
      activeChallengeId: challengeId,
      activeModuleId: found ? found.moduleId : prev.activeModuleId
    }));
  };

  const selectModuleFromMenu = (moduleId) => {
    const mod = INTERACTIVE_MODULES.find((m) => m.id === moduleId);
    setExpandedModules((prev) => ({ ...prev, [moduleId]: true }));
    if (mod?.isCapstoneModule) {
      setNavState((prev) => ({
        ...prev,
        activeView: 'capstone',
        activeModuleId: moduleId
      }));
    } else {
      const firstId = mod?.challenges?.[0]?.id || navState.activeChallengeId;
      setNavState((prev) => ({
        ...prev,
        activeView: 'dashboard',
        activeModuleId: moduleId,
        activeChallengeId: firstId
      }));
    }
    setMobileMenuOpen(false);
  };

  // ==========================================================================
  // SISTEMA DE AUTENTICAÇÃO CLOUD (E-MAIL/SENHA + GOOGLE OAUTH)
  // ==========================================================================
  const [authToken, setAuthToken] = useState(() => {
    try {
      return localStorage.getItem('nexusdev_token') || '';
    } catch {
      return '';
    }
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('nexusdev_current_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [googleClientId, setGoogleClientId] = useState(() => {
    try {
      return localStorage.getItem('nexusdev_google_client_id') || '';
    } catch {
      return '';
    }
  });

  const [showGoogleConfig, setShowGoogleConfig] = useState(false);
  const [googleClientIdInput, setGoogleClientIdInput] = useState('');
  const [googleCustomLoginOpen, setGoogleCustomLoginOpen] = useState(false);
  const [googleCustomForm, setGoogleCustomForm] = useState({ name: '', email: '' });
  const googleBtnContainerRef = useRef(null);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [cloudStatus, setCloudStatus] = useState('checking');
  const [syncQueue, setSyncQueue] = useState(() => {
    try {
      const saved = localStorage.getItem('nexusdev_sync_queue');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('nexusdev_sync_queue', JSON.stringify(syncQueue));
    } catch {}
  }, [syncQueue]);

  const enqueueSyncItem = (item) => {
    setSyncQueue((prev) => {
      const id = `${item.type}_${item.challengeId || 'cert'}_${Date.now()}`;
      return [...prev, { ...item, id }];
    });
    setCloudStatus('queued');
  };

  useEffect(() => {
    let cancelled = false;

    const pingAndFlush = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/health`, { cache: 'no-store' });
        if (!res.ok) throw new Error('API indisponível');
        if (cancelled) return;

        setCloudStatus('online');

        if (authToken && syncQueue.length > 0) {
          const remaining = [];
          for (const item of syncQueue) {
            try {
              if (item.type === 'complete') {
                await fetch(`${API_BASE_URL}/api/progress/complete`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`
                  },
                  body: JSON.stringify({
                    challengeId: item.challengeId,
                    files: item.files || {}
                  })
                });
              } else if (item.type === 'certificate') {
                await fetch(`${API_BASE_URL}/api/certificates/issue`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`
                  },
                  body: JSON.stringify(item.payload || {})
                });
              }
            } catch {
              remaining.push(item);
            }
          }
          if (!cancelled) {
            setSyncQueue(remaining);
            setCloudStatus(remaining.length > 0 ? 'queued' : 'online');
          }
        }
      } catch {
        if (!cancelled) {
          setCloudStatus(syncQueue.length > 0 ? 'queued' : 'offline');
        }
      }
    };

    pingAndFlush();
    const interval = setInterval(pingAndFlush, 30000);
    window.addEventListener('online', pingAndFlush);

    return () => {
      cancelled = true;
      clearInterval(interval);
      window.removeEventListener('online', pingAndFlush);
    };
  }, [authToken, syncQueue]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('nexusdev_current_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('nexusdev_current_user');
      }
    } catch {}
  }, [currentUser]);

  useEffect(() => {
    try {
      if (googleClientId) {
        localStorage.setItem('nexusdev_google_client_id', googleClientId);
      } else {
        localStorage.removeItem('nexusdev_google_client_id');
      }
    } catch {}
  }, [googleClientId]);

  useEffect(() => {
    if (!authToken) return;
    fetch(`${API_BASE_URL}/api/me`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.email) {
          setCurrentUser((prev) => ({
            ...prev,
            name: data.name,
            email: data.email,
            avatar: data.avatar || prev?.avatar || '',
            provider: data.provider || prev?.provider || 'email',
            certificateCode: data.certificateCode || prev?.certificateCode || '',
            joinedAt: prev?.joinedAt || new Date().toLocaleDateString('pt-BR')
          }));
          if (Array.isArray(data.completedIds) && data.completedIds.length > 0) {
            setCompletedChallenges((prev) =>
              Array.from(new Set([...prev, ...data.completedIds]))
            );
          }
          if (data.certificateCode) {
            setCapstoneSubmission((prev) => ({
              ...prev,
              studentName: data.name || prev.studentName,
              verificationCode: data.certificateCode
            }));
          }
        }
      })
      .catch(() => {});
  }, [authToken]);

  useEffect(() => {
    if (!authModalOpen || !googleClientId) return;

    const initializeGsi = () => {
      if (window.google?.accounts?.id && googleBtnContainerRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: async (response) => {
              try {
                const apiRes = await fetch(`${API_BASE_URL}/api/auth/google`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ credential: response.credential })
                });
                const apiData = await apiRes.json();
                if (apiData && apiData.token && apiData.user) {
                  localStorage.setItem('nexusdev_token', apiData.token);
                  setAuthToken(apiData.token);
                  setCurrentUser({
                    name: apiData.user.name,
                    email: apiData.user.email,
                    avatar: apiData.user.avatar || '',
                    provider: 'google',
                    certificateCode: apiData.user.certificateCode || '',
                    joinedAt: new Date().toLocaleDateString('pt-BR')
                  });
                  if (Array.isArray(apiData.user.completedIds)) {
                    setCompletedChallenges((prev) =>
                      Array.from(new Set([...prev, ...apiData.user.completedIds]))
                    );
                  }
                  setAuthModalOpen(false);
                  setAuthError('');
                  return;
                }
              } catch {}

              try {
                const base64Url = response.credential.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(
                  window
                    .atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
                );
                const payload = JSON.parse(jsonPayload);
                setCurrentUser({
                  name: payload.name || payload.email.split('@')[0],
                  email: payload.email,
                  avatar: payload.picture || '',
                  provider: 'google',
                  joinedAt: new Date().toLocaleDateString('pt-BR')
                });
                setAuthModalOpen(false);
                setAuthError('');
              } catch {
                setAuthError('Não foi possível decodificar as credenciais do Google.');
              }
            }
          });
          googleBtnContainerRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
            theme: 'outline',
            size: 'large',
            width: 360,
            text: 'continue_with',
            locale: 'pt-BR'
          });
        } catch {
          setAuthError('Erro ao inicializar o Google Identity Services. Verifique seu Client ID.');
        }
      }
    };

    if (!document.getElementById('google-gsi-script')) {
      const script = document.createElement('script');
      script.id = 'google-gsi-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGsi;
      document.head.appendChild(script);
    } else {
      initializeGsi();
    }
  }, [authModalOpen, googleClientId]);

  const userStoragePrefix = currentUser ? `nexusdev_user_${currentUser.email}` : 'nexusdev_guest';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Todas');
  const [statusFilter, setStatusFilter] = useState('Todas');

  const [expandedModules, setExpandedModules] = useState({
    'mod-1': true,
    'mod-2': false,
    'mod-3': false,
    'mod-4': false,
    'mod-5': false,
    'mod-6': true
  });

  const [completedChallenges, setCompletedChallenges] = useState(() => {
    try {
      const saved = localStorage.getItem(`${userStoragePrefix}_completed`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [communityXP, setCommunityXP] = useState(() => {
    try {
      const saved = localStorage.getItem(`${userStoragePrefix}_comm_xp`);
      return saved ? Number(saved) : 0;
    } catch {
      return 0;
    }
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const [streakData, setStreakData] = useState(() => {
    try {
      const saved = localStorage.getItem(`${userStoragePrefix}_streak`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return { count: 1, todayCompleted: 0, lastActiveDate: todayStr };
  });

  useEffect(() => {
    try {
      const savedCompleted = localStorage.getItem(`${userStoragePrefix}_completed`);
      setCompletedChallenges(savedCompleted ? JSON.parse(savedCompleted) : []);

      const savedCommXP = localStorage.getItem(`${userStoragePrefix}_comm_xp`);
      setCommunityXP(savedCommXP ? Number(savedCommXP) : 0);

      const savedStreak = localStorage.getItem(`${userStoragePrefix}_streak`);
      if (savedStreak) {
        const parsed = JSON.parse(savedStreak);
        if (parsed.lastActiveDate !== todayStr) {
          setStreakData({
            count: parsed.count || 1,
            todayCompleted: 0,
            lastActiveDate: todayStr
          });
        } else {
          setStreakData(parsed);
        }
      } else {
        setStreakData({ count: 1, todayCompleted: 0, lastActiveDate: todayStr });
      }
    } catch {}
  }, [userStoragePrefix, todayStr]);

  useEffect(() => {
    try {
      localStorage.setItem(`${userStoragePrefix}_completed`, JSON.stringify(completedChallenges));
    } catch {}
  }, [completedChallenges, userStoragePrefix]);

  useEffect(() => {
    try {
      localStorage.setItem(`${userStoragePrefix}_comm_xp`, String(communityXP));
    } catch {}
  }, [communityXP, userStoragePrefix]);

  useEffect(() => {
    try {
      localStorage.setItem(`${userStoragePrefix}_streak`, JSON.stringify(streakData));
    } catch {}
  }, [streakData, userStoragePrefix]);

  const [capstoneChecks, setCapstoneChecks] = useState(() => {
    try {
      const saved = localStorage.getItem(`${userStoragePrefix}_cap_checks`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [capstoneSubmission, setCapstoneSubmission] = useState(() => {
    try {
      const saved = localStorage.getItem(`${userStoragePrefix}_cap_sub`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      studentName: currentUser?.name || '',
      githubUrl: '',
      liveUrl: '',
      submitted: false,
      verificationCode: ''
    };
  });

  useEffect(() => {
    try {
      const savedChecks = localStorage.getItem(`${userStoragePrefix}_cap_checks`);
      setCapstoneChecks(savedChecks ? JSON.parse(savedChecks) : {});

      const savedSub = localStorage.getItem(`${userStoragePrefix}_cap_sub`);
      if (savedSub) {
        setCapstoneSubmission(JSON.parse(savedSub));
      } else {
        setCapstoneSubmission({
          studentName: currentUser?.name || '',
          githubUrl: '',
          liveUrl: '',
          submitted: false,
          verificationCode: ''
        });
      }
    } catch {}
  }, [userStoragePrefix, currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem(`${userStoragePrefix}_cap_checks`, JSON.stringify(capstoneChecks));
    } catch {}
  }, [capstoneChecks, userStoragePrefix]);

  useEffect(() => {
    try {
      localStorage.setItem(`${userStoragePrefix}_cap_sub`, JSON.stringify(capstoneSubmission));
    } catch {}
  }, [capstoneSubmission, userStoragePrefix]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');

    const emailNormalized = authForm.email.trim().toLowerCase();
    if (!emailNormalized || !authForm.password.trim()) {
      setAuthError('Preencha todos os campos obrigatórios.');
      return;
    }

    setAuthLoading(true);
    try {
      const endpoint = authMode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: authForm.name.trim(),
          email: emailNormalized,
          password: authForm.password
        })
      });
      const data = await res.json();

      if (res.ok && data.token && data.user) {
        localStorage.setItem('nexusdev_token', data.token);
        setAuthToken(data.token);
        setCurrentUser({
          name: data.user.name,
          email: data.user.email,
          provider: 'email',
          certificateCode: data.user.certificateCode || '',
          joinedAt: new Date().toLocaleDateString('pt-BR')
        });
        if (Array.isArray(data.user.completedIds)) {
          setCompletedChallenges((prev) => Array.from(new Set([...prev, ...data.user.completedIds])));
        }
        setAuthModalOpen(false);
        setAuthForm({ name: '', email: '', password: '' });
        setAuthLoading(false);
        return;
      } else if (data && data.error) {
        setAuthError(data.error);
        setAuthLoading(false);
        return;
      }
    } catch {}

    try {
      const usersDbRaw = localStorage.getItem('nexusdev_users_db');
      const usersDb = usersDbRaw ? JSON.parse(usersDbRaw) : {};

      if (authMode === 'register') {
        if (!authForm.name.trim()) {
          setAuthError('Informe seu nome completo para criar sua conta.');
          setAuthLoading(false);
          return;
        }
        if (authForm.password.length < 4) {
          setAuthError('A senha deve ter pelo menos 4 caracteres.');
          setAuthLoading(false);
          return;
        }
        if (usersDb[emailNormalized]) {
          setAuthError('Este e-mail já está cadastrado. Faça login.');
          setAuthLoading(false);
          return;
        }

        const newUser = {
          name: authForm.name.trim(),
          email: emailNormalized,
          password: authForm.password,
          joinedAt: new Date().toLocaleDateString('pt-BR')
        };

        usersDb[emailNormalized] = newUser;
        localStorage.setItem('nexusdev_users_db', JSON.stringify(usersDb));
        setCurrentUser({ name: newUser.name, email: newUser.email, joinedAt: newUser.joinedAt });
        setAuthModalOpen(false);
        setAuthForm({ name: '', email: '', password: '' });
      } else {
        const existing = usersDb[emailNormalized];
        if (!existing || existing.password !== authForm.password) {
          setAuthError('E-mail ou senha incorretos.');
          setAuthLoading(false);
          return;
        }
        setCurrentUser({
          name: existing.name,
          email: existing.email,
          joinedAt: existing.joinedAt || 'Hoje'
        });
        setAuthModalOpen(false);
        setAuthForm({ name: '', email: '', password: '' });
      }
    } catch {
      setAuthError('Erro ao acessar o armazenamento local do navegador.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleCustomGoogleAccountSubmit = (e) => {
    e.preventDefault();
    setAuthError('');
    const cleanEmail = googleCustomForm.email.trim().toLowerCase();
    const cleanName = googleCustomForm.name.trim() || cleanEmail.split('@')[0];
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setAuthError('Informe o seu e-mail Google válido.');
      return;
    }
    setCurrentUser({
      name: cleanName,
      email: cleanEmail,
      avatar: '',
      provider: 'google',
      joinedAt: new Date().toLocaleDateString('pt-BR')
    });
    setGoogleCustomLoginOpen(false);
    setGoogleCustomForm({ name: '', email: '' });
    setAuthModalOpen(false);
  };

  const handleSaveGoogleClientId = (e) => {
    e.preventDefault();
    setGoogleClientId(googleClientIdInput.trim());
    setShowGoogleConfig(false);
    setAuthError('');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthToken('');
    try {
      localStorage.removeItem('nexusdev_token');
    } catch {}
    if (navState.activeView === 'profile') {
      setActiveView('home');
    }
  };

  const totalXP = useMemo(() => {
    const labsXP = completedChallenges.length * 50;
    return labsXP + communityXP;
  }, [completedChallenges.length, communityXP]);

  const studentLevel = Math.floor(totalXP / 250) + 1;
  const totalInteractiveChallenges = allChallenges.length;
  const completedCount = completedChallenges.length;
  const overallPercentage =
    totalInteractiveChallenges > 0
      ? Math.round((completedCount / totalInteractiveChallenges) * 100)
      : 0;

  const openChallenge = (challengeId) => {
    const found = allChallenges.find((c) => c.id === challengeId);
    setNavState({
      activeView: 'workspace',
      activeModuleId: found ? found.moduleId : 'mod-1',
      activeChallengeId: challengeId
    });
    setMobileMenuOpen(false);
  };

  const markChallengeComplete = (challengeId, filesMap = null) => {
    setCompletedChallenges((prev) => {
      if (prev.includes(challengeId)) return prev;
      setStreakData((s) => {
        const nextToday = s.todayCompleted + 1;
        const bumpedStreak = nextToday === 2 ? s.count + 1 : s.count;
        return {
          count: bumpedStreak,
          todayCompleted: nextToday,
          lastActiveDate: todayStr
        };
      });
      return [...prev, challengeId];
    });

    if (authToken) {
      fetch(`${API_BASE_URL}/api/progress/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({ challengeId, files: filesMap || {} })
      })
        .then((res) => {
          if (!res.ok) throw new Error('Falha no sync');
          setCloudStatus('online');
        })
        .catch(() => {
          enqueueSyncItem({ type: 'complete', challengeId, files: filesMap || {} });
        });
    } else {
      enqueueSyncItem({ type: 'complete', challengeId, files: filesMap || {} });
    }
  };

  const toggleModuleExpand = (modId) => {
    setExpandedModules((prev) => ({ ...prev, [modId]: !prev[modId] }));
  };

  const activeChallengeIndex = useMemo(
    () => Math.max(0, allChallenges.findIndex((c) => c.id === navState.activeChallengeId)),
    [allChallenges, navState.activeChallengeId]
  );
  const activeChallenge = allChallenges[activeChallengeIndex] || allChallenges[0];
  const prevChallenge = activeChallengeIndex > 0 ? allChallenges[activeChallengeIndex - 1] : null;
  const nextChallenge =
    activeChallengeIndex < allChallenges.length - 1 ? allChallenges[activeChallengeIndex + 1] : null;

  const nextPendingChallenge = useMemo(
    () => allChallenges.find((c) => !completedChallenges.includes(c.id)) || allChallenges[0],
    [allChallenges, completedChallenges]
  );

  const dailyBugChallenge = useMemo(() => {
    const debugList = allChallenges.filter((c) => c.isDebug);
    if (debugList.length === 0) return allChallenges[0];
    const dayIndex = new Date().getDate() % debugList.length;
    return debugList[dayIndex];
  }, [allChallenges]);

  const activeModuleForResume = useMemo(
    () =>
      INTERACTIVE_MODULES.find((m) => m.id === nextPendingChallenge?.moduleId) ||
      INTERACTIVE_MODULES[0],
    [nextPendingChallenge]
  );

  const activeModuleDoneCount = useMemo(
    () =>
      activeModuleForResume.challenges.filter((c) => completedChallenges.includes(c.id)).length,
    [activeModuleForResume, completedChallenges]
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* ====================================================================
          BARRA DE NAVEGAÇÃO SUPERIOR
         ==================================================================== */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Menu de Módulos"
              className="lg:hidden p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <button
              type="button"
              onClick={() => setActiveView('home')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/25 transition-colors">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-base sm:text-lg tracking-tight text-white">
                    Nexus<span className="text-emerald-400">Dev</span>
                  </span>
                  <span className="hidden sm:inline-block text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Brasil • {totalSyllabusCount} Aulas
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  Do Zero Absoluto a Programador Full-Stack
                </p>
              </div>
            </button>
          </div>

          <nav className="flex items-center gap-1 sm:gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveView('home')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 shrink-0 ${
                navState.activeView === 'home'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Início</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 shrink-0 ${
                navState.activeView === 'dashboard'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Trilha ({totalSyllabusCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('workspace')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 shrink-0 ${
                navState.activeView === 'workspace'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>IDE & Tutor</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('leaderboard')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 shrink-0 ${
                navState.activeView === 'leaderboard'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Ranking</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('capstone')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 shrink-0 ${
                navState.activeView === 'capstone' || navState.activeView === 'verify'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <Award className="w-4 h-4" />
              <span className="hidden sm:inline">Certificado</span>
            </button>
          </nav>

          <div className="flex items-center gap-2">
            <div
              title={
                cloudStatus === 'online'
                  ? 'API na nuvem conectada'
                  : cloudStatus === 'queued'
                  ? `${syncQueue.length} item(ns) aguardando envio para a nuvem`
                  : cloudStatus === 'checking'
                  ? 'Acordando servidor na nuvem...'
                  : 'Sem conexão com a nuvem — progresso salvo localmente'
              }
              className={`hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-mono ${
                cloudStatus === 'online'
                  ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                  : cloudStatus === 'queued'
                  ? 'bg-amber-950/30 border-amber-500/30 text-amber-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>
                {cloudStatus === 'online'
                  ? 'Nuvem OK'
                  : cloudStatus === 'queued'
                  ? `Fila (${syncQueue.length})`
                  : cloudStatus === 'checking'
                  ? 'Nuvem...'
                  : 'Local'}
              </span>
            </div>

            <div
              title={`Meta diária: ${Math.min(streakData.todayCompleted, 2)}/2 aulas hoje`}
              className="hidden md:flex items-center gap-1.5 bg-orange-950/40 px-2.5 py-1.5 rounded-xl border border-orange-500/30 text-xs"
            >
              <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
              <span className="font-bold text-orange-300">{streakData.count}d</span>
              <span className="text-[10px] text-orange-200/70 font-mono">
                ({Math.min(streakData.todayCompleted, 2)}/2)
              </span>
            </div>

            <div className="hidden xl:flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="font-mono font-semibold text-amber-300">{totalXP} XP</span>
              <span className="text-slate-600">|</span>
              <span className="text-emerald-400 font-medium">Nível {studentLevel}</span>
            </div>

            {currentUser ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveView('profile')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
                    navState.activeView === 'profile'
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                      : 'bg-slate-800/80 border-slate-700 text-slate-200 hover:border-slate-600'
                  }`}
                >
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-5 h-5 rounded-full object-cover border border-emerald-400/50"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[11px]">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="max-w-[95px] truncate">{currentUser.name.split(' ')[0]}</span>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  title="Sair da conta"
                  className="p-2 rounded-xl bg-slate-800/70 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-700/70 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setAuthError('');
                    setAuthModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Entrar</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setAuthError('');
                    setAuthModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Criar Conta</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ====================================================================
          MODAL DE AUTENTICAÇÃO
         ==================================================================== */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative my-auto">
            <button
              type="button"
              onClick={() => setAuthModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  {authMode === 'login' ? 'Entrar no NexusDev' : 'Criar Conta na Nuvem'}
                </h2>
                <p className="text-xs text-slate-400">
                  Sincronize seu XP, ofensiva diária, ranking e certificados
                </p>
              </div>
            </div>

            <div className="space-y-2.5 mb-4">
              {googleClientId ? (
                <div className="space-y-2">
                  <div
                    ref={googleBtnContainerRef}
                    className="w-full flex justify-center min-h-[42px]"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setGoogleClientIdInput(googleClientId);
                        setShowGoogleConfig(!showGoogleConfig);
                      }}
                      className="text-[11px] text-slate-400 hover:text-emerald-400 underline"
                    >
                      Alterar Client ID do Google Cloud
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setGoogleCustomLoginOpen(!googleCustomLoginOpen);
                      setShowGoogleConfig(false);
                      setAuthError('');
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm flex items-center justify-center gap-3 shadow-md transition-all border border-slate-200"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.3 0 6.08-1.09 8.1-2.96l-3.88-3.05c-1.1.74-2.51 1.18-4.22 1.18-3.24 0-5.99-2.19-6.97-5.13H1.02v3.14C3.05 21.2 7.24 24 12 24Z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.03 14.04c-.25-.74-.39-1.54-.39-2.36 0-.82.14-1.62.39-2.36V6.18H1.02C.37 7.47 0 8.91 0 10.44s.37 2.97 1.02 4.26l4.01-3.14v2.48Z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.79 0 3.41.62 4.68 1.82l3.51-3.51C18.07 1.19 15.3 0 12 0 7.24 0 3.05 2.8 1.02 6.82l4.01 3.14c.98-2.94 3.73-5.21 6.97-5.21Z"
                      />
                    </svg>
                    <span>Continuar com o Google</span>
                  </button>

                  {googleCustomLoginOpen && (
                    <form
                      onSubmit={handleCustomGoogleAccountSubmit}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5"
                    >
                      <p className="text-[11px] text-slate-400">
                        Informe seu nome e e-mail Google para vincular sua sessão:
                      </p>
                      <input
                        type="text"
                        placeholder="Seu nome completo"
                        value={googleCustomForm.name}
                        onChange={(e) =>
                          setGoogleCustomForm({ ...googleCustomForm, name: e.target.value })
                        }
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                      <input
                        type="email"
                        placeholder="seu.email@gmail.com"
                        value={googleCustomForm.email}
                        onChange={(e) =>
                          setGoogleCustomForm({ ...googleCustomForm, email: e.target.value })
                        }
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setGoogleClientIdInput(googleClientId);
                            setShowGoogleConfig(true);
                            setGoogleCustomLoginOpen(false);
                          }}
                          className="text-[11px] text-emerald-400 hover:underline"
                        >
                          Usar Client ID OAuth real
                        </button>
                        <button
                          type="submit"
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                        >
                          Conectar Conta
                        </button>
                      </div>
                    </form>
                  )}

                  {!googleCustomLoginOpen && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setGoogleClientIdInput(googleClientId);
                          setShowGoogleConfig(!showGoogleConfig);
                        }}
                        className="text-[11px] text-slate-400 hover:text-emerald-400 underline"
                      >
                        Configurar Client ID do Google Cloud Console
                      </button>
                    </div>
                  )}
                </>
              )}

              {showGoogleConfig && (
                <form
                  onSubmit={handleSaveGoogleClientId}
                  className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/40 space-y-2.5"
                >
                  <label className="block text-[11px] font-semibold text-emerald-300">
                    Google Cloud OAuth 2.0 Client ID:
                  </label>
                  <input
                    type="text"
                    placeholder="xxxxxxxxxxxx.apps.googleusercontent.com"
                    value={googleClientIdInput}
                    onChange={(e) => setGoogleClientIdInput(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowGoogleConfig(false)}
                      className="px-2.5 py-1 rounded text-xs text-slate-400 hover:text-white"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                    >
                      Salvar Client ID
                    </button>
                  </div>
                </form>
              )}

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-3 text-[11px] uppercase tracking-wider text-slate-500">
                  ou use seu e-mail
                </span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 mb-5">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setAuthError('');
                }}
                className={`py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  authMode === 'login'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Já tenho conta
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setAuthError('');
                }}
                className={`py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  authMode === 'register'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Cadastrar agora
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Nome Completo
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Ex: Maria Oliveira"
                      value={authForm.name}
                      onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">E-mail</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    placeholder="voce@exemplo.com"
                    value={authForm.email}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Senha</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    placeholder="••••••"
                    value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {authError && (
                <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-semibold text-sm rounded-lg transition-colors"
              >
                {authLoading
                  ? 'Conectando...'
                  : authMode === 'login'
                  ? 'Entrar na Plataforma'
                  : 'Concluir Cadastro'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          CORPO PRINCIPAL COM MENU LATERAL DE MÓDULOS + CONTEÚDO
         ==================================================================== */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex relative">
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 z-30 bg-slate-950/70 backdrop-blur-xs lg:hidden"
          />
        )}

        <aside
          className={`${
            mobileMenuOpen
              ? 'fixed top-[61px] bottom-0 left-0 z-40 w-72 shadow-2xl bg-slate-900'
              : 'hidden'
          } lg:block lg:static lg:w-72 shrink-0 bg-slate-900/70 border-r border-slate-800 p-4 overflow-y-auto`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Menu Curricular (6 Módulos)
            </span>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1.5">
            {INTERACTIVE_MODULES.map((mod) => {
              const isSelected = navState.activeModuleId === mod.id;
              const modDone = mod.challenges.filter((c) => completedChallenges.includes(c.id)).length;
              return (
                <button
                  type="button"
                  key={mod.id}
                  onClick={() => selectModuleFromMenu(mod.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-white'
                      : 'bg-slate-950/50 border-slate-800/80 text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-emerald-400'
                    }`}
                  >
                    <ModuleIcon name={mod.icon} className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-emerald-400 font-bold">MÓDULO {mod.number}</span>
                      <span className="text-slate-400">
                        {mod.isCapstoneModule ? 'Projeto' : `${modDone}/${mod.totalSyllabusLessons}`}
                      </span>
                    </div>
                    <p className="text-xs font-semibold leading-snug line-clamp-2 mt-0.5">
                      {mod.title}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setActiveView('verify')}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 flex items-center justify-between"
            >
              <span className="flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                <span>Validar Certificado</span>
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>
        </aside>

        {/* PÁGINA INICIAL EXPLICATIVA */}
        {navState.activeView === 'home' && (
          <main className="flex-1 p-4 sm:p-8 overflow-y-auto space-y-8">
            <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/50 border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-2xl">
              <div className="max-w-3xl space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Plataforma Interativa • {totalSyllabusCount} Aulas do Zero ao Full-Stack</span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  Aprenda Programação do Zero Absoluto e Construa Aplicações Web Completas
                </h1>

                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  Nunca escreveu uma linha de código? Não tem problema. Na{' '}
                  <strong className="text-white">NexusDev</strong> você começa criando sua primeira
                  tag HTML em 2 minutos, evolui passo a passo por CSS3, JavaScript, React, Node.js
                  e MongoDB, e publica um projeto real com certificado verificável.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => openChallenge(allChallenges[0].id)}
                    className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition-all"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Começar Agora — Aula 1 (Grátis)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveView('dashboard')}
                    className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-sm border border-slate-700 flex items-center gap-2 transition-colors"
                  >
                    <Compass className="w-4 h-4 text-emerald-400" />
                    <span>Ver Todas as {totalSyllabusCount} Aulas</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-800/80 max-w-lg">
                  <div>
                    <div className="text-lg sm:text-2xl font-extrabold text-white">
                      {totalSyllabusCount}
                    </div>
                    <div className="text-[11px] text-slate-400">Aulas Práticas</div>
                  </div>
                  <div>
                    <div className="text-lg sm:text-2xl font-extrabold text-emerald-400">
                      6 Módulos
                    </div>
                    <div className="text-[11px] text-slate-400">Front ao Back-End</div>
                  </div>
                  <div>
                    <div className="text-lg sm:text-2xl font-extrabold text-amber-400">
                      100% Online
                    </div>
                    <div className="text-[11px] text-slate-400">IDE + Tutor IA</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Continuar de Onde Parei + Desafio Rápido do Dia */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 bg-slate-900 border border-emerald-500/30 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[11px] font-mono">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-bold">
                      {completedCount > 0 ? 'CONTINUAR DE ONDE PAREI' : 'SUA PRIMEIRA MISSÃO'}
                    </span>
                    <span className="text-slate-400">
                      Módulo {activeModuleForResume.number} ({activeModuleDoneCount}/
                      {activeModuleForResume.totalSyllabusLessons})
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-white truncate">
                    {nextPendingChallenge?.title}
                  </h2>
                  <div className="w-full max-w-md h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all"
                      style={{
                        width: `${Math.round(
                          (activeModuleDoneCount /
                            Math.max(1, activeModuleForResume.totalSyllabusLessons)) *
                            100
                        )}%`
                      }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openChallenge(nextPendingChallenge.id)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 shrink-0 self-start sm:self-center"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{completedCount > 0 ? 'Retomar Aula' : 'Iniciar Aula 1'}</span>
                </button>
              </div>

              <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-5 flex flex-col justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-rose-300 bg-rose-500/15 px-2 py-0.5 rounded mb-1.5">
                    <Bug className="w-3.5 h-3.5" />
                    <span>DESAFIO RÁPIDO DO DIA</span>
                  </div>
                  <h3 className="text-sm font-bold text-white line-clamp-2">
                    {dailyBugChallenge?.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => openChallenge(dailyBugChallenge.id)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-rose-200 flex items-center justify-center gap-1.5"
                >
                  <span>Resolver Bug (+50 XP)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </section>

            {/* Como funciona na prática */}
            <section className="space-y-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  Como Funciona a Metodologia NexusDev
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  Nada de aulas passivas longas. Aqui você lê uma explicação curta e programa na hora.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2.5">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <h3 className="font-bold text-white text-sm">Explicação Simples + Missão</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Cada aula apresenta um único conceito claro em português, com exemplo pronto e
                    uma tarefa objetiva para você resolver no editor.
                  </p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2.5">
                  <div className="w-9 h-9 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <h3 className="font-bold text-white text-sm">IDE Real com Tutor IA & Memória</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Veja seu HTML/CSS ganhar vida no Preview ao Vivo ou acompanhe as variáveis da
                    sua função JavaScript passo a passo com ajuda do Tutor IA.
                  </p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2.5">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <h3 className="font-bold text-white text-sm">Desbloqueio Guiado & Certificado</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    A próxima aula só abre quando você conclui a atual, garantindo aprendizado
                    sólido até o Projeto Final e Certificado com QR Code.
                  </p>
                </div>
              </div>
            </section>

            {/* Visão Geral dos 6 Módulos */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">
                    Mapa dos 6 Módulos da Formação
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400">
                    Clique em qualquer módulo para abrir suas aulas na trilha.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {INTERACTIVE_MODULES.map((mod) => {
                  const modDone = mod.challenges.filter((c) =>
                    completedChallenges.includes(c.id)
                  ).length;
                  return (
                    <div
                      key={mod.id}
                      onClick={() => selectModuleFromMenu(mod.id)}
                      className="bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/40 rounded-xl p-5 cursor-pointer transition-all flex flex-col justify-between gap-4"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 text-emerald-400 flex items-center justify-center shrink-0">
                          <ModuleIcon name={mod.icon} className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono font-bold text-emerald-400">
                              MÓDULO {mod.number}
                            </span>
                            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                              {mod.isCapstoneModule
                                ? 'Projeto Final'
                                : `${mod.totalSyllabusLessons} aulas`}
                            </span>
                          </div>
                          <h3 className="text-sm sm:text-base font-bold text-white">{mod.title}</h3>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                            {mod.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
                        <span className="text-slate-400">
                          {mod.isCapstoneModule
                            ? 'Entrega no GitHub + QR Code'
                            : `Concluídas: ${modDone} de ${mod.totalSyllabusLessons}`}
                        </span>
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <span>Explorar</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </main>
        )}

        {/* TRILHA COMPLETA DE AULAS */}
        {navState.activeView === 'dashboard' && (
          <main className="flex-1 p-4 sm:p-8 overflow-y-auto space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  Trilha Completa — {totalSyllabusCount} Aulas
                </h1>
                <p className="text-xs sm:text-sm text-slate-400">
                  {completedCount} de {totalInteractiveChallenges} laboratórios concluídos ({overallPercentage}%) • {totalXP} XP
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const next =
                    allChallenges.find((c) => !completedChallenges.includes(c.id)) || allChallenges[0];
                  openChallenge(next.id);
                }}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shrink-0"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{completedCount > 0 ? 'Continuar Aulas' : 'Iniciar Agora'}</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar aula por tema (ex: Flexbox, Título, Bug, React, JWT)..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
                  {['Todas', 'Pendentes', 'Concluídas'].map((st) => (
                    <button
                      type="button"
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-2.5 py-1 rounded-lg font-medium ${
                        statusFilter === st ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="bg-transparent text-xs sm:text-sm text-slate-200 focus:outline-none"
                  >
                    <option value="Todas" className="bg-slate-900">Todos os Níveis</option>
                    <option value="Iniciante" className="bg-slate-900">Iniciante</option>
                    <option value="Intermediário" className="bg-slate-900">Intermediário</option>
                    <option value="Avançado" className="bg-slate-900">Avançado</option>
                    <option value="Bug" className="bg-slate-900">Apenas Bug Fix</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {INTERACTIVE_MODULES.map((module) => {
                const filteredChallenges = module.challenges.filter((ch) => {
                  const isDone = completedChallenges.includes(ch.id);
                  const matchesSearch =
                    !searchQuery.trim() ||
                    ch.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    module.title.toLowerCase().includes(searchQuery.toLowerCase());
                  const matchesDiff =
                    selectedDifficulty === 'Todas'
                      ? true
                      : selectedDifficulty === 'Bug'
                      ? !!ch.isDebug
                      : ch.difficulty === selectedDifficulty;
                  const matchesStatus =
                    statusFilter === 'Todas' ? true : statusFilter === 'Concluídas' ? isDone : !isDone;
                  return matchesSearch && matchesDiff && matchesStatus;
                });

                const hasFilter =
                  searchQuery.trim().length > 0 ||
                  selectedDifficulty !== 'Todas' ||
                  statusFilter !== 'Todas';

                if (
                  hasFilter &&
                  filteredChallenges.length === 0 &&
                  !(!searchQuery.trim() && selectedDifficulty === 'Todas' && module.isCapstoneModule)
                ) {
                  return null;
                }

                const modTotal = module.challenges.length;
                const modCompleted = module.challenges.filter((c) => completedChallenges.includes(c.id)).length;
                const modPercent = modTotal > 0 ? Math.round((modCompleted / modTotal) * 100) : 0;
                const isExpanded = !!expandedModules[module.id] || hasFilter;

                return (
                  <div
                    key={module.id}
                    className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => toggleModuleExpand(module.id)}
                      className="w-full p-5 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 text-emerald-400 flex items-center justify-center shrink-0">
                          <ModuleIcon name={module.icon} className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono font-bold text-emerald-400">
                              MÓDULO {module.number}
                            </span>
                            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                              {module.totalSyllabusLessons} aulas
                            </span>
                          </div>
                          <h2 className="text-base sm:text-lg font-bold text-white">{module.title}</h2>
                          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">{module.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 sm:min-w-[190px] justify-end">
                        {!module.isCapstoneModule && (
                          <div className="w-32">
                            <div className="flex justify-between text-xs text-slate-400 mb-1">
                              <span>{modCompleted}/{modTotal}</span>
                              <span className="font-mono">{modPercent}%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500" style={{ width: `${modPercent}%` }} />
                            </div>
                          </div>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-slate-800 bg-slate-950/60 p-4 sm:p-5 space-y-2">
                        {module.isCapstoneModule ? (
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900 border border-emerald-500/30">
                            <div>
                              <h3 className="text-sm font-bold text-white">
                                Projeto Integrador & Certificado Público
                              </h3>
                              <p className="text-xs text-slate-400 mt-0.5">
                                Entregue seu projeto no GitHub e gere seu certificado com QR Code.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setActiveView('capstone')}
                              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                            >
                              Abrir Certificado
                            </button>
                          </div>
                        ) : (
                          filteredChallenges.map((ch, idx) => {
                            const isDone = completedChallenges.includes(ch.id);
                            return (
                              <div
                                key={ch.id}
                                onClick={() => openChallenge(ch.id)}
                                className="flex items-center justify-between p-3 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition-all"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  {isDone ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                  ) : (
                                    <Circle className="w-4 h-4 text-slate-600 shrink-0" />
                                  )}
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-sm font-medium text-slate-100 truncate">
                                        {idx + 1}. {ch.title}
                                      </span>
                                      {ch.isDebug && (
                                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30">
                                          Bug Fix
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                                      <span className="uppercase font-mono text-emerald-400">{ch.language}</span>
                                      <span>•</span>
                                      <span>{ch.difficulty}</span>
                                      <span>•</span>
                                      <span className="text-amber-400 font-mono">+50 XP</span>
                                    </div>
                                  </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </main>
        )}

        {/* IDE INTERATIVA */}
        {navState.activeView === 'workspace' && (
          <ChallengeWorkspace
            challenge={activeChallenge}
            challengeIndex={activeChallengeIndex}
            totalChallengesCount={allChallenges.length}
            isCompleted={completedChallenges.includes(activeChallenge.id)}
            onComplete={markChallengeComplete}
            prevChallenge={prevChallenge}
            nextChallenge={nextChallenge}
            onSelectChallenge={openChallenge}
            onBackToDashboard={() => setActiveView('dashboard')}
            userStoragePrefix={userStoragePrefix}
            currentUser={currentUser}
            authToken={authToken}
            onAddCommunityXP={(pts) => setCommunityXP((p) => p + pts)}
          />
        )}

        {/* RANKING & CONQUISTAS */}
        {navState.activeView === 'leaderboard' && (
          <LeaderboardView
            currentUser={currentUser}
            totalXP={totalXP}
            streakCount={streakData.count}
            completedCount={completedCount}
          />
        )}

        {/* PROJETO FINAL & CERTIFICADO */}
        {navState.activeView === 'capstone' && (
          <CapstoneSpecView
            checks={capstoneChecks}
            onToggleCheck={(id) => setCapstoneChecks((prev) => ({ ...prev, [id]: !prev[id] }))}
            submission={capstoneSubmission}
            onUpdateSubmission={setCapstoneSubmission}
            completedChallengesCount={completedCount}
            totalChallengesCount={totalInteractiveChallenges}
            currentUser={currentUser}
            authToken={authToken}
            onEnqueueSync={enqueueSyncItem}
          />
        )}

        {/* VALIDAÇÃO PÚBLICA DE CERTIFICADO */}
        {navState.activeView === 'verify' && (
          <PublicCertificateVerifierView initialCode={initialCertParam} />
        )}

        {/* PERFIL DO ALUNO */}
        {navState.activeView === 'profile' && (
          <StudentProfileView
            currentUser={currentUser}
            totalXP={totalXP}
            studentLevel={studentLevel}
            streakCount={streakData.count}
            completedChallenges={completedChallenges}
            allChallenges={allChallenges}
            onOpenChallenge={openChallenge}
            onOpenCapstone={() => setActiveView('capstone')}
          />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTE: IDE INTERATIVA (EDITOR, PREVIEW, TESTES, TUTOR IA, FÓRUM)
// ============================================================================
function ChallengeWorkspace({
  challenge,
  challengeIndex,
  totalChallengesCount,
  isCompleted,
  onComplete,
  prevChallenge,
  nextChallenge,
  onSelectChallenge,
  onBackToDashboard,
  userStoragePrefix,
  currentUser,
  authToken,
  onAddCommunityXP
}) {
  const fileNames = useMemo(() => Object.keys(challenge.files || {}), [challenge]);
  const [activeFileName, setActiveFileName] = useState(fileNames[0] || 'index.html');
  const [filesMap, setFilesMap] = useState(challenge.files || {});
  const [testResults, setTestResults] = useState([]);
  const [allPassed, setAllPassed] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [bottomTab, setBottomTab] = useState(challenge.language === 'html' ? 'preview' : 'tests');
  const [mobilePanel, setMobilePanel] = useState('code');

  const [aiTips, setAiTips] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);

  const [traceArgsInput, setTraceArgsInput] = useState(
    JSON.stringify(challenge.defaultTraceArgs || [10])
  );
  const [memoryReport, setMemoryReport] = useState(null);

  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [commentError, setCommentError] = useState('');

  const textareaRef = useRef(null);
  const preRef = useRef(null);

  useEffect(() => {
    const initialFiles = challenge.files || {};
    const names = Object.keys(initialFiles);
    setActiveFileName(names[0] || 'index.html');

    try {
      const savedDraft = JSON.parse(
        localStorage.getItem(`${userStoragePrefix}_draft_${challenge.id}`) || 'null'
      );
      if (savedDraft && typeof savedDraft === 'object') {
        setFilesMap({ ...initialFiles, ...savedDraft });
      } else {
        setFilesMap(initialFiles);
      }
    } catch {
      setFilesMap(initialFiles);
    }

    setTestResults([]);
    setAllPassed(false);
    setShowHint(false);
    setAiTips([]);
    setMemoryReport(null);
    setTraceArgsInput(JSON.stringify(challenge.defaultTraceArgs || [10]));

    try {
      const savedComments = JSON.parse(
        localStorage.getItem(`nexusdev_comments_${challenge.id}`) || '[]'
      );
      setComments([...(challenge.communityPosts || []), ...savedComments]);
    } catch {
      setComments(challenge.communityPosts || []);
    }

    let active = true;
    fetch(`${API_BASE_URL}/api/lessons/${encodeURIComponent(challenge.id)}/comments`)
      .then((r) => r.json())
      .then((data) => {
        if (!active || !Array.isArray(data?.comments) || data.comments.length === 0) return;
        setComments((prev) => {
          const ids = new Set(data.comments.map((c) => c.id));
          return [...data.comments, ...prev.filter((p) => !ids.has(p.id))];
        });
      })
      .catch(() => {});

    setBottomTab(challenge.language === 'html' ? 'preview' : 'tests');

    return () => {
      active = false;
    };
  }, [challenge, userStoragePrefix]);

  const handleCodeChange = (newValue) => {
    const updated = { ...filesMap, [activeFileName]: newValue };
    setFilesMap(updated);
    try {
      localStorage.setItem(`${userStoragePrefix}_draft_${challenge.id}`, JSON.stringify(updated));
    } catch {}
  };

  const handleResetCode = () => {
    setFilesMap(challenge.files || {});
    setTestResults([]);
    setAllPassed(false);
    try {
      localStorage.removeItem(`${userStoragePrefix}_draft_${challenge.id}`);
    } catch {}
  };

  const insertSymbol = (sym) => {
    const el = textareaRef.current;
    const current = filesMap[activeFileName] || '';
    if (!el) {
      handleCodeChange(current + sym);
      return;
    }
    const start = el.selectionStart ?? current.length;
    const end = el.selectionEnd ?? current.length;
    const next = current.slice(0, start) + sym + current.slice(end);
    handleCodeChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + sym.length, start + sym.length);
    });
  };

  const previewSrcDoc = useMemo(() => {
    if (challenge.language !== 'html') return '';
    const htmlPart = filesMap['index.html'] || '';
    const cssPart = filesMap['style.css'] || '';
    return `<!doctype html><html><head><meta charset="utf-8"><style>${cssPart}</style></head><body>${htmlPart}</body></html>`;
  }, [challenge.language, filesMap]);

  const runTests = () => {
    const results = [];
    const assert = {
      strictEqual: (actual, expected) => {
        if (actual !== expected) {
          throw new Error(`Esperado ${JSON.stringify(expected)}, mas recebeu ${JSON.stringify(actual)}.`);
        }
      },
      deepEqual: (actual, expected) => {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
          throw new Error(`Esperado ${JSON.stringify(expected)}, mas recebeu ${JSON.stringify(actual)}.`);
        }
      }
    };

    if (challenge.language === 'html') {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.left = '-9999px';
      iframe.style.width = '800px';
      iframe.style.height = '600px';
      document.body.appendChild(iframe);

      try {
        const doc = iframe.contentDocument;
        const win = iframe.contentWindow;
        doc.open();
        doc.write(previewSrcDoc);
        doc.close();

        const rawCss = filesMap['style.css'] || '';
        const rawHtml = filesMap['index.html'] || '';

        for (const t of challenge.tests || []) {
          try {
            t.testFn(doc, win, rawCss, rawHtml);
            results.push({ id: t.id, description: t.description, passed: true });
          } catch (err) {
            results.push({
              id: t.id,
              description: t.description,
              passed: false,
              error: err?.message || 'Critério não atendido.'
            });
          }
        }
      } finally {
        document.body.removeChild(iframe);
      }
    } else {
      const jsCode = Object.values(filesMap || {}).join('\n');
      const fnName = challenge.targetFunction;

      let userFn = null;
      let compileError = null;
      try {
        const safeJsCode = injectLoopProtection(jsCode, 25000);
        const factory = new Function(
          `"use strict";\n${safeJsCode};\nreturn typeof ${fnName} !== 'undefined' ? ${fnName} : undefined;`
        );
        userFn = factory();
        if (typeof userFn !== 'function') {
          compileError = `A função "${fnName}" não foi encontrada ou não é uma função.`;
        }
      } catch (err) {
        compileError = err?.message || 'Erro de sintaxe no código.';
      }

      for (const t of challenge.tests || []) {
        if (compileError) {
          results.push({ id: t.id, description: t.description, passed: false, error: compileError });
          continue;
        }
        try {
          t.testFn(userFn, assert);
          results.push({ id: t.id, description: t.description, passed: true });
        } catch (err) {
          results.push({
            id: t.id,
            description: t.description,
            passed: false,
            error: err?.message || 'Erro ao executar o teste.'
          });
        }
      }
    }

    setTestResults(results);
    const passedAll = results.length > 0 && results.every((r) => r.passed);
    setAllPassed(passedAll);
    setBottomTab('tests');
    setMobilePanel('output');

    if (passedAll) {
      onComplete(challenge.id, filesMap);
    }
  };

  const handleAskTutor = async () => {
    setAiLoading(true);
    setBottomTab('tutor');
    setMobilePanel('output');

    const localTips = analyzeStudentCodeLocal(challenge, filesMap, testResults);
    const failedTests = testResults.filter((r) => !r.passed);

    try {
      const res = await fetch(`${API_BASE_URL}/api/tutor/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeTitle: challenge.title,
          language: challenge.language,
          targetFunction: challenge.targetFunction,
          instructions: challenge.instructions,
          filesMap,
          failedTests
        })
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data?.tips) && data.tips.length > 0) {
        setAiTips(data.tips);
      } else {
        setAiTips(localTips);
      }
    } catch {
      setAiTips(localTips);
    } finally {
      setAiLoading(false);
    }
  };

  const handleRunMemory = () => {
    const report = runDynamicMemoryInspector(challenge, filesMap, traceArgsInput);
    setMemoryReport(report);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    setCommentError('');
    if (!currentUser) {
      setCommentError('Faça login ou cadastre-se para publicar na comunidade.');
      return;
    }
    const clean = commentText.trim();
    if (!clean) {
      setCommentError('Escreva uma dúvida ou dica antes de enviar.');
      return;
    }

    let createdPost = {
      id: `post-${Date.now()}`,
      author: currentUser.name,
      badge: 'Aluno NexusDev',
      time: 'agora',
      text: clean
    };

    if (authToken) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/lessons/${encodeURIComponent(challenge.id)}/comments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`
          },
          body: JSON.stringify({ text: clean })
        });
        const data = await res.json();
        if (res.ok && data?.comment) {
          createdPost = data.comment;
        }
      } catch {}
    }

    const nextList = [createdPost, ...comments];
    setComments(nextList);
    setCommentText('');

    const extraOnly = nextList.filter(
      (item) => !(challenge.communityPosts || []).some((base) => base.id === item.id)
    );
    try {
      localStorage.setItem(`nexusdev_comments_${challenge.id}`, JSON.stringify(extraOnly));
    } catch {}

    if (typeof onAddCommunityXP === 'function') {
      onAddCommunityXP(10);
    }
  };

  const lessonDoneNow = isCompleted || allPassed;
  const quickSymbols =
    challenge.language === 'html'
      ? ['<', '>', '/', '=', '"', '{', '}', ':', ';']
      : ['{', '}', '(', ')', '[', ']', ';', '=>', '==='];

  return (
    <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
      <div className="bg-slate-900 border-b border-slate-800 px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={onBackToDashboard}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 flex items-center gap-1 shrink-0"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Trilha</span>
          </button>
          <span className="text-xs font-mono text-emerald-400 shrink-0">
            Mód. {challenge.moduleNumber} • {challengeIndex + 1}/{totalChallengesCount}
          </span>
          <h1 className="text-xs sm:text-sm font-bold text-white truncate">{challenge.title}</h1>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={!prevChallenge}
            onClick={() => prevChallenge && onSelectChallenge(prevChallenge.id)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs text-slate-200 flex items-center gap-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Anterior</span>
          </button>

          <button
            type="button"
            disabled={!nextChallenge || !lessonDoneNow}
            onClick={() => nextChallenge && lessonDoneNow && onSelectChallenge(nextChallenge.id)}
            title={
              !lessonDoneNow
                ? 'Conclua e passe nos testes desta aula para desbloquear a próxima!'
                : 'Avançar para a próxima aula'
            }
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              lessonDoneNow && nextChallenge
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-slate-800/80 text-slate-500 border border-slate-700 cursor-not-allowed'
            }`}
          >
            {!lessonDoneNow && <Lock className="w-3 h-3 text-amber-400" />}
            <span>Próxima Aula</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="lg:hidden grid grid-cols-3 bg-slate-950 border-b border-slate-800 p-1 gap-1 text-xs">
        {[
          { id: 'instructions', label: '1. Instruções' },
          { id: 'code', label: '2. Código' },
          { id: 'output', label: '3. Resultado' }
        ].map((tab) => (
          <button
            type="button"
            key={tab.id}
            onClick={() => setMobilePanel(tab.id)}
            className={`py-1.5 rounded-lg font-semibold ${
              mobilePanel === tab.id ? 'bg-emerald-600 text-white' : 'text-slate-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-125px)]">
        <section
          className={`${
            mobilePanel === 'instructions' ? 'block' : 'hidden'
          } lg:block lg:col-span-5 border-r border-slate-800 p-4 sm:p-6 overflow-y-auto space-y-5 bg-slate-900/40`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-mono uppercase px-2.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              {challenge.language} • {challenge.difficulty}
            </span>
            {lessonDoneNow ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Aula Concluída (+50 XP)</span>
              </span>
            ) : (
              <span className="text-xs text-slate-400 font-mono">+{challenge.xp} XP</span>
            )}
          </div>

          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Conceito da Aula
            </h2>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-slate-200 whitespace-pre-line leading-relaxed">
              {challenge.theory}
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Sua Missão Prática
            </h2>
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs sm:text-sm text-white leading-relaxed">
              {challenge.instructions}
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={() => setShowHint(!showHint)}
              className="text-xs text-amber-300 hover:text-amber-200 flex items-center gap-1.5 font-medium"
            >
              <HelpCircle className="w-4 h-4" />
              <span>{showHint ? 'Ocultar Dica' : 'Precisa de uma dica?'}</span>
            </button>
            {showHint && (
              <div className="mt-2 p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200 font-mono">
                {challenge.hint}
              </div>
            )}
          </div>
        </section>

        <section
          className={`${
            mobilePanel !== 'instructions' ? 'flex' : 'hidden'
          } lg:flex lg:col-span-7 flex-col bg-slate-950`}
        >
          <div
            className={`${
              mobilePanel === 'code' ? 'flex' : 'hidden'
            } lg:flex flex-col flex-1 min-h-[280px]`}
          >
            <div className="bg-slate-900 border-b border-slate-800 px-3 py-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1 overflow-x-auto">
                {fileNames.map((fname) => (
                  <button
                    type="button"
                    key={fname}
                    onClick={() => setActiveFileName(fname)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 ${
                      activeFileName === fname
                        ? 'bg-slate-800 text-emerald-300 border border-emerald-500/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <FileCode2 className="w-3.5 h-3.5" />
                    <span>{fname}</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleResetCode}
                  title="Restaurar código inicial"
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleAskTutor}
                  className="px-2.5 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-semibold flex items-center gap-1"
                >
                  <Brain className="w-3.5 h-3.5" />
                  <span>Tutor IA</span>
                </button>
                <button
                  type="button"
                  onClick={runTests}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Verificar Código</span>
                </button>
              </div>
            </div>

            <div className="bg-slate-900/60 border-b border-slate-800 px-3 py-1.5 flex items-center gap-1.5 overflow-x-auto">
              <span className="text-[10px] text-slate-500 uppercase font-mono shrink-0">Atalhos:</span>
              {quickSymbols.map((sym) => (
                <button
                  type="button"
                  key={sym}
                  onClick={() => insertSymbol(sym)}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-emerald-300 border border-slate-700 shrink-0"
                >
                  {sym}
                </button>
              ))}
            </div>

            <div className="relative flex-1 min-h-[240px] font-mono text-xs sm:text-sm bg-slate-950 overflow-hidden">
              <pre
                ref={preRef}
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 p-4 m-0 whitespace-pre-wrap break-words leading-relaxed overflow-auto text-slate-100"
                dangerouslySetInnerHTML={{
                  __html: highlightCode(filesMap[activeFileName] || '', activeFileName) + '\n'
                }}
              />
              <textarea
                ref={textareaRef}
                value={filesMap[activeFileName] || ''}
                onChange={(e) => handleCodeChange(e.target.value)}
                onScroll={(e) => {
                  if (preRef.current) {
                    preRef.current.scrollTop = e.target.scrollTop;
                    preRef.current.scrollLeft = e.target.scrollLeft;
                  }
                }}
                spellCheck={false}
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
                className="relative z-10 w-full h-full min-h-[240px] p-4 bg-transparent text-transparent caret-emerald-400 resize-none focus:outline-none leading-relaxed font-mono"
              />
            </div>
          </div>

          <div
            className={`${
              mobilePanel === 'output' ? 'flex' : 'hidden'
            } lg:flex flex-col border-t border-slate-800 bg-slate-900/80 min-h-[260px]`}
          >
            <div className="flex items-center gap-1 px-3 py-2 border-b border-slate-800 overflow-x-auto text-xs">
              {challenge.language === 'html' && (
                <button
                  type="button"
                  onClick={() => setBottomTab('preview')}
                  className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 shrink-0 ${
                    bottomTab === 'preview' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview ao Vivo</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setBottomTab('tests')}
                className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 shrink-0 ${
                  bottomTab === 'tests' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Testes ({testResults.filter((r) => r.passed).length}/{challenge.tests?.length || 0})</span>
              </button>

              <button
                type="button"
                onClick={() => setBottomTab('tutor')}
                className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 shrink-0 ${
                  bottomTab === 'tutor' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Brain className="w-3.5 h-3.5" />
                <span>Tutor IA</span>
              </button>

              {challenge.language !== 'html' && (
                <button
                  type="button"
                  onClick={() => setBottomTab('memory')}
                  className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 shrink-0 ${
                    bottomTab === 'memory' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Memória & Console</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setBottomTab('forum')}
                className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 shrink-0 ${
                  bottomTab === 'forum' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Fórum ({comments.length})</span>
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto">
              {bottomTab === 'preview' && challenge.language === 'html' && (
                <iframe
                  title="Preview HTML e CSS"
                  srcDoc={previewSrcDoc}
                  sandbox="allow-scripts"
                  className="w-full h-56 rounded-xl border border-slate-700 bg-slate-950"
                />
              )}

              {bottomTab === 'tests' && (
                <div className="space-y-2.5">
                  {testResults.length === 0 ? (
                    <p className="text-xs text-slate-400">
                      Clique em <strong>Verificar Código</strong> para validar sua solução e liberar a próxima aula.
                    </p>
                  ) : (
                    <>
                      {allPassed && (
                        <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/40 flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs font-bold text-emerald-300">
                            Parabéns! Todos os critérios foram aprovados (+50 XP).
                          </span>
                          {nextChallenge && (
                            <button
                              type="button"
                              onClick={() => onSelectChallenge(nextChallenge.id)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1"
                            >
                              <span>Ir para Próxima Aula</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}

                      {testResults.map((r) => (
                        <div
                          key={r.id}
                          className={`p-3 rounded-xl border text-xs ${
                            r.passed
                              ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                              : 'bg-rose-950/30 border-rose-500/30 text-rose-200'
                          }`}
                        >
                          <div className="font-semibold flex items-center gap-1.5">
                            {r.passed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            ) : (
                              <Bug className="w-4 h-4 text-rose-400 shrink-0" />
                            )}
                            <span>{r.description}</span>
                          </div>
                          {r.error && <p className="mt-1 text-rose-300 font-mono">{r.error}</p>}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}

              {bottomTab === 'tutor' && (
                <div className="space-y-2.5">
                  {aiLoading ? (
                    <p className="text-xs text-purple-300">Analisando seu código...</p>
                  ) : aiTips.length === 0 ? (
                    <div className="text-xs text-slate-400 space-y-2">
                      <p>O Tutor IA analisa seu código atual e aponta ajustes sem entregar a resposta pronta.</p>
                      <button
                        type="button"
                        onClick={handleAskTutor}
                        className="px-3 py-1.5 rounded-lg bg-purple-600 text-white font-semibold"
                      >
                        Analisar Meu Código Agora
                      </button>
                    </div>
                  ) : (
                    aiTips.map((tip, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs text-purple-200"
                      >
                        {tip}
                      </div>
                    ))
                  )}
                </div>
              )}

              {bottomTab === 'memory' && challenge.language !== 'html' && (
                <div className="space-y-3 text-xs">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={traceArgsInput}
                      onChange={(e) => setTraceArgsInput(e.target.value)}
                      placeholder='Argumentos JSON, ex: [100, 20]'
                      className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 font-mono text-white"
                    />
                    <button
                      type="button"
                      onClick={handleRunMemory}
                      className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold"
                    >
                      Inspecionar Execução
                    </button>
                  </div>

                  {memoryReport && (
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono">
                      {memoryReport.error ? (
                        <p className="text-rose-300">{memoryReport.error}</p>
                      ) : (
                        <>
                          <div className="text-sky-300">
                            Variáveis de entrada: {JSON.stringify(memoryReport.memorySnapshot)}
                          </div>
                          <div className="text-emerald-300">
                            Retorno da função: {memoryReport.actualOutput} ({memoryReport.durationMs} ms)
                          </div>
                          {memoryReport.logs?.length > 0 && (
                            <div className="pt-1 border-t border-slate-800 text-amber-200">
                              console.log: {memoryReport.logs.join(' | ')}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {bottomTab === 'forum' && (
                <div className="space-y-3 text-xs">
                  <form onSubmit={handleAddComment} className="flex gap-2">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Compartilhe uma dúvida ou dica sobre esta aula (+10 XP)..."
                      className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Enviar</span>
                    </button>
                  </form>
                  {commentError && <p className="text-rose-300">{commentError}</p>}

                  <div className="space-y-2">
                    {comments.length === 0 ? (
                      <p className="text-slate-500">Nenhuma dúvida publicada nesta aula ainda.</p>
                    ) : (
                      comments.map((c) => (
                        <div key={c.id} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                            <span className="font-bold text-slate-200">{c.author}</span>
                            <span>{c.time}</span>
                          </div>
                          <p className="text-slate-300">{c.text}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

// ============================================================================
// SUB-COMPONENTE: RANKING SEMANAL & MEDALHAS
// ============================================================================
function LeaderboardView({ currentUser, totalXP, streakCount, completedCount }) {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch(`${API_BASE_URL}/api/leaderboard`)
      .then((r) => r.json())
      .then((data) => {
        if (!active) return;
        const apiList = Array.isArray(data?.leaderboard) ? data.leaderboard : [];
        const fallback = [
          { rank: 1, name: 'Camila Rocha', xp: 1250, streak: 9, completedCount: 25 },
          { rank: 2, name: 'Rafael Costa', xp: 950, streak: 6, completedCount: 19 },
          { rank: 3, name: 'Bianca Alves', xp: 700, streak: 5, completedCount: 14 }
        ];
        const base = apiList.length > 0 ? apiList : fallback;
        const selfEntry = {
          rank: 0,
          name: currentUser ? `${currentUser.name} (Você)` : 'Você (Visitante)',
          xp: totalXP,
          streak: streakCount,
          completedCount,
          isSelf: true
        };
        const merged = [...base.filter((u) => u.name !== currentUser?.name), selfEntry]
          .sort((a, b) => b.xp - a.xp)
          .map((item, idx) => ({ ...item, rank: idx + 1 }));
        setLeaders(merged);
      })
      .catch(() => {
        if (!active) return;
        setLeaders([
          {
            rank: 1,
            name: currentUser ? `${currentUser.name} (Você)` : 'Você (Visitante)',
            xp: totalXP,
            streak: streakCount,
            completedCount,
            isSelf: true
          }
        ]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [currentUser, totalXP, streakCount, completedCount]);

  return (
    <main className="flex-1 p-4 sm:p-8 overflow-y-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <Crown className="w-6 h-6 text-amber-400" />
              <span>Ranking da Comunidade NexusDev</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Conclua aulas (+50 XP) e participe do fórum (+10 XP) para subir no ranking.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-xs font-bold">
            Seu XP: {totalXP}
          </span>
        </div>

        {loading ? (
          <p className="text-xs text-slate-400 py-6 text-center">Carregando classificação...</p>
        ) : (
          <div className="space-y-2.5">
            {leaders.slice(0, 15).map((u) => (
              <div
                key={`${u.name}-${u.rank}`}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                  u.isSelf
                    ? 'bg-emerald-950/30 border-emerald-500/40'
                    : 'bg-slate-950/70 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold ${
                      u.rank === 1
                        ? 'bg-amber-400 text-slate-950'
                        : u.rank === 2
                        ? 'bg-slate-300 text-slate-950'
                        : u.rank === 3
                        ? 'bg-orange-400 text-slate-950'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    #{u.rank}
                  </span>
                  <div>
                    <div className="text-sm font-bold text-white">{u.name}</div>
                    <div className="text-[11px] text-slate-400">
                      {u.completedCount} aulas concluídas • {u.streak}d de ofensiva
                    </div>
                  </div>
                </div>
                <span className="font-mono text-sm font-bold text-amber-300">{u.xp} XP</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

// ============================================================================
// SUB-COMPONENTE: PROJETO FINAL & CERTIFICADO COM QR CODE
// ============================================================================
function CapstoneSpecView({
  checks,
  onToggleCheck,
  submission,
  onUpdateSubmission,
  completedChallengesCount,
  totalChallengesCount,
  currentUser,
  authToken,
  onEnqueueSync
}) {
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const completedChecksCount = CAPSTONE_REQUIREMENTS.filter((r) => !!checks[r.id]).length;

  const verificationUrl = useMemo(() => {
    if (!submission.verificationCode) return '';
    try {
      return `${window.location.origin}/cert/${encodeURIComponent(submission.verificationCode)}`;
    } catch {
      return `https://nexusdev-frontend.vercel.app/cert/${encodeURIComponent(submission.verificationCode)}`;
    }
  }, [submission.verificationCode]);

  const qrCodeImageUrl = useMemo(() => {
    if (!verificationUrl) return '';
    return `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
      verificationUrl
    )}`;
  }, [verificationUrl]);

  const handleIssueCertificate = async (e) => {
    e.preventDefault();
    setFormError('');
    const studentName = (submission.studentName || currentUser?.name || '').trim();
    if (!studentName) {
      setFormError('Informe o nome completo que aparecerá no certificado.');
      return;
    }

    setSubmitting(true);
    const cleanPrefix = studentName.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6) || 'DEV';
    const localCode =
      submission.verificationCode ||
      `NXD-2026-${cleanPrefix}-${String(completedChallengesCount).padStart(3, '0')}-${Math.floor(
        1000 + Math.random() * 9000
      )}`;

    const payload = {
      studentName,
      githubUrl: submission.githubUrl.trim(),
      liveUrl: submission.liveUrl.trim()
    };

    if (authToken) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/certificates/issue`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`
          },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        setSubmitting(false);

        if (res.ok && data?.code) {
          onUpdateSubmission({
            ...submission,
            studentName: data.studentName || studentName,
            submitted: true,
            verificationCode: data.code
          });
          return;
        }
      } catch {}
    }

    setSubmitting(false);
    onEnqueueSync({ type: 'certificate', payload });
    onUpdateSubmission({
      ...submission,
      studentName,
      submitted: true,
      verificationCode: localCode
    });
  };

  const handleCopyCode = () => {
    if (!submission.verificationCode) return;
    navigator.clipboard?.writeText(submission.verificationCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    if (!verificationUrl) return;
    navigator.clipboard?.writeText(verificationUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <main className="flex-1 p-4 sm:p-8 overflow-y-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <Award className="w-6 h-6 text-emerald-400" />
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            Projeto Integrador & Certificado Verificável
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-400">
          Marque os requisitos concluídos ({completedChecksCount}/{CAPSTONE_REQUIREMENTS.length}) e emita seu certificado oficial com QR Code.
        </p>

        <div className="mt-5 space-y-2.5">
          {CAPSTONE_REQUIREMENTS.map((req) => {
            const checked = !!checks[req.id];
            return (
              <div
                key={req.id}
                onClick={() => onToggleCheck(req.id)}
                className={`p-3.5 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
                  checked
                    ? 'bg-emerald-950/20 border-emerald-500/40'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center mt-0.5 shrink-0 ${
                    checked ? 'bg-emerald-600 text-white' : 'border border-slate-600'
                  }`}
                >
                  {checked && <Check className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-emerald-400">
                    {req.category}
                  </span>
                  <h3 className="text-sm font-bold text-white">{req.title}</h3>
                  <p className="text-xs text-slate-400">{req.details}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <form
        onSubmit={handleIssueCertificate}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4"
      >
        <h2 className="text-lg font-bold text-white">Emitir Certificado</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-slate-300 mb-1">Nome Completo no Certificado</label>
            <input
              type="text"
              value={submission.studentName}
              onChange={(e) => onUpdateSubmission({ ...submission, studentName: e.target.value })}
              placeholder="Seu nome completo"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs sm:text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-300 mb-1">Repositório GitHub (opcional)</label>
            <input
              type="url"
              value={submission.githubUrl}
              onChange={(e) => onUpdateSubmission({ ...submission, githubUrl: e.target.value })}
              placeholder="https://github.com/usuario/projeto"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs sm:text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-300 mb-1">URL Publicada (opcional)</label>
            <input
              type="url"
              value={submission.liveUrl}
              onChange={(e) => onUpdateSubmission({ ...submission, liveUrl: e.target.value })}
              placeholder="https://meu-projeto.vercel.app"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs sm:text-sm text-white"
            />
          </div>
        </div>

        {formError && <p className="text-xs text-rose-300">{formError}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold"
        >
          {submitting ? 'Emitindo...' : 'Gerar Certificado Oficial'}
        </button>
      </form>

      {submission.submitted && submission.verificationCode && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/50 border-2 border-emerald-500/50 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-300 bg-emerald-500/15 px-3 py-1 rounded-full">
                <Award className="w-4 h-4" />
                <span>CERTIFICADO DE CONCLUSÃO • NEXUSDEV</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white">{submission.studentName}</h3>
              <p className="text-xs sm:text-sm text-slate-300">
                Concluiu {completedChallengesCount} de {totalChallengesCount} laboratórios práticos na Formação Full-Stack NexusDev.
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-2">
                <span className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300">
                  Código: {submission.verificationCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-white flex items-center gap-1"
                >
                  {copiedCode ? (
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Share2 className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedCode ? 'Código copiado!' : 'Copiar código'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs text-white font-semibold flex items-center gap-1"
                >
                  {copiedLink ? (
                    <CheckCheck className="w-3.5 h-3.5" />
                  ) : (
                    <ExternalLink className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedLink ? 'Link copiado!' : 'Copiar link público'}</span>
                </button>
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl text-slate-900 flex flex-col items-center shrink-0">
              <img src={qrCodeImageUrl} alt="QR Code do Certificado" className="w-32 h-32" />
              <span className="text-[10px] font-mono font-bold mt-1">Validar Certificado</span>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// ============================================================================
// SUB-COMPONENTE: VALIDAÇÃO PÚBLICA DE CERTIFICADO (/cert/CODIGO ou ?cert=CODIGO)
// ============================================================================
function PublicCertificateVerifierView({ initialCode = '' }) {
  const [codeInput, setCodeInput] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleLookup = async (e, overrideCode = null) => {
    if (e) e.preventDefault();
    const target = String(overrideCode ?? codeInput)
      .trim()
      .toUpperCase();
    if (!target) {
      setError('Digite o código do certificado para validar.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/certificates/${encodeURIComponent(target)}`);
      const data = await res.json();
      if (res.ok && data?.valid) {
        setResult(data);
      } else {
        setError(data?.error || 'Certificado não encontrado na base de dados.');
      }
    } catch {
      setError('Não foi possível conectar ao servidor de validação no momento.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialCode) {
      handleLookup(null, initialCode);
    }
  }, [initialCode]);

  return (
    <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
      <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              Validação Pública de Certificado
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Confira a autenticidade de um certificado emitido pela NexusDev.
            </p>
          </div>
        </div>

        <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            placeholder="Ex: NXD-2026-MARIA-015-4821"
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm font-mono text-white uppercase focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold"
          >
            {loading ? 'Validando...' : 'Validar Código'}
          </button>
        </form>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/60 text-xs text-rose-300">
            {error}
          </div>
        )}

        {result && (
          <div className="p-5 rounded-2xl bg-emerald-950/25 border border-emerald-500/40 space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-300 bg-emerald-500/15 px-2.5 py-1 rounded-full">
              <CheckCircle2 className="w-4 h-4" />
              <span>CERTIFICADO AUTÊNTICO • {result.code}</span>
            </div>
            <h2 className="text-xl font-bold text-white pt-1">{result.studentName}</h2>
            <p className="text-xs text-slate-300">
              Aulas concluídas: <strong>{result.completedCount}</strong> • Experiência total:{' '}
              <strong>{result.xp} XP</strong>
            </p>
            {result.githubUrl && (
              <a
                href={result.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:underline pt-1"
              >
                <Github className="w-3.5 h-3.5" />
                <span>Ver Repositório do Projeto Final</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

// ============================================================================
// SUB-COMPONENTE: PERFIL DO ALUNO
// ============================================================================
function StudentProfileView({
  currentUser,
  totalXP,
  studentLevel,
  streakCount,
  completedChallenges,
  allChallenges,
  onOpenChallenge,
  onOpenCapstone
}) {
  const recentCompleted = useMemo(
    () =>
      allChallenges
        .filter((c) => completedChallenges.includes(c.id))
        .slice(-10)
        .reverse(),
    [allChallenges, completedChallenges]
  );

  return (
    <main className="flex-1 p-4 sm:p-8 overflow-y-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-xl font-bold">
            {currentUser?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{currentUser?.name || 'Estudante NexusDev'}</h1>
            <p className="text-xs text-slate-400">{currentUser?.email}</p>
            <div className="flex items-center gap-3 mt-1.5 text-xs font-mono">
              <span className="text-amber-300">{totalXP} XP</span>
              <span className="text-emerald-400">Nível {studentLevel}</span>
              <span className="text-orange-300">{streakCount}d ofensiva</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenCapstone}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Award className="w-4 h-4" />
          <span>Meu Certificado</span>
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-base font-bold text-white mb-3">
          Últimas Aulas Concluídas ({completedChallenges.length})
        </h2>
        {recentCompleted.length === 0 ? (
          <p className="text-xs text-slate-400">Nenhuma aula concluída ainda.</p>
        ) : (
          <div className="space-y-2">
            {recentCompleted.map((ch) => (
              <div
                key={ch.id}
                onClick={() => onOpenChallenge(ch.id)}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/40 cursor-pointer flex items-center justify-between text-xs"
              >
                <span className="text-slate-200 font-medium">{ch.title}</span>
                <span className="text-emerald-400 font-mono">Revisar</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}