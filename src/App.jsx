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

    const factory = new Function(
      'console',
      `"use strict";\n${jsCode};\nreturn typeof ${fnName} !== 'undefined' ? ${fnName} : undefined;`
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
    ]
  },
  {
    id: 'mod-6',
    number: 6,
    title: 'Projeto Final Integrador Full-Stack',
    subtitle: 'FullStack Store & Painel Administrativo Completo',
    icon: 'Award',
    description:
      'A prova final da sua jornada! Projete, desenvolva e publique um Marketplace completo integrando React, Node.js, Express, Banco de Dados e Autenticação JWT.',
    isCapstoneModule: true,
    tracks: [
      { name: 'Arquitetura & Modelagem do Banco de Dados', count: 3 },
      { name: 'Desenvolvimento da API RESTful & Segurança JWT', count: 4 },
      { name: 'Interface React, Deploy em Nuvem & Certificação Verificável', count: 3 }
    ],
    challenges: []
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

      // MÓDULO 1: 100% HTML5 & CSS3 COM PROJETOS PROGRESSIVOS ÚNICOS
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
          const cols = (idx % 2) + 2; // 2 ou 3 colunas
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

      // MÓDULOS 2 A 5: DESAFIOS ÚNICOS DE LÓGICA, REACT, NODE.JS E SEGURANÇA JWT
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

      // MÓDULO 3 (REACT), MÓDULO 4 (NODE/EXPRESS) E MÓDULO 5 (MONGODB/JWT)
      if (mod.number === 3) {
        const fnName = `atualizarEstadoReact_${idx}`;
        const isToggle = idx % 2 === 0;
        list.push({
          id: `mod-3-aula-${idx}`,
          title: isToggle
            ? `Aula ${idx}: Alternando Favorito em Lista React (.map Imutável)`
            : `Aula ${idx}: Removendo Item do Estado React (.filter Imutável)`,
          language: 'javascript',
          targetFunction: fnName,
          defaultTraceArgs: isToggle
            ? [[{ id: 1, favorito: false }, { id: 2, favorito: true }], 1]
            : [[{ id: 1 }, { id: 2 }], 1],
          difficulty,
          xp: 50,
          estimatedTime: '6 min',
          theory: isToggle
            ? `Em listas React, usamos \`.map()\` para atualizar apenas o item cujo \`id\` corresponde ao clicado, mantendo os demais intactos.`
            : `Para remover um item de um estado array no React sem mutá-lo, usamos \`.filter(item => item.id !== idRemover)\`.`,
          instructions: isToggle
            ? `Implemente ${fnName}(itens, idAlvo) retornando um novo array onde o item com id === idAlvo tem sua propriedade boolean "favorito" invertida (!item.favorito).`
            : `Implemente ${fnName}(itens, idRemover) retornando um novo array sem o item cujo id seja igual a idRemover.`,
          hint: isToggle
            ? 'Retorne itens.map(item => item.id === idAlvo ? { ...item, favorito: !item.favorito } : item);'
            : 'Retorne itens.filter(item => item.id !== idRemover);',
          files: {
            'script.js': isToggle
              ? `function ${fnName}(itens, idAlvo) {\n  // Inverta item.favorito de forma imutável usando .map()\n  \n}`
              : `function ${fnName}(itens, idRemover) {\n  // Remova o item com id === idRemover usando .filter()\n  \n}`
          },
          communityPosts: [],
          tests: [
            {
              id: 't1',
              description: isToggle
                ? 'Inverte favorito sem mutar o array original'
                : 'Remove o item correspondente sem mutar o original',
              testFn: (fn, assert) => {
                if (isToggle) {
                  const orig = [{ id: 1, favorito: false }];
                  const res = fn(orig, 1);
                  assert.deepEqual(res, [{ id: 1, favorito: true }]);
                  assert.strictEqual(orig[0].favorito, false);
                } else {
                  const orig = [{ id: 1 }, { id: 2 }];
                  const res = fn(orig, 1);
                  assert.deepEqual(res, [{ id: 2 }]);
                  assert.strictEqual(orig.length, 2);
                }
              }
            }
          ]
        });
      } else if (mod.number === 4) {
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
      } else {
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
      }

      idx++;
    }

    return {
      ...mod,
      totalSyllabusLessons: list.length,
      challenges: list
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

  // Detecta se a URL possui ?cert=CODIGO para validação pública imediata
  const initialCertParam = useMemo(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('cert') || '';
    } catch {
      return '';
    }
  }, []);

  // ==========================================================================
  // 1. PERSISTÊNCIA GLOBAL DE NAVEGAÇÃO
  // ==========================================================================
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
  // 2. SISTEMA DE AUTENTICAÇÃO CLOUD (E-MAIL/SENHA + GOOGLE OAUTH)
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

  // Fila offline de sincronização com o Render + status da nuvem
  const [cloudStatus, setCloudStatus] = useState('checking'); // 'checking' | 'online' | 'queued' | 'offline'
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

  // Acorda a API no Render assim que a plataforma abre e reenvia itens pendentes
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

  // Sincroniza progresso com o back-end no Render caso haja token ativo
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

  // SDK oficial Google Identity Services
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

  // Busca e Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Todas');

  // Módulos expandidos na Trilha
  const [expandedModules, setExpandedModules] = useState({
    'mod-1': true,
    'mod-2': false,
    'mod-3': false,
    'mod-4': false,
    'mod-5': false,
    'mod-6': true
  });

  // Desafios concluídos & XP extra da comunidade
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

  // Ofensiva Diária (Streak)
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

  // Checklist e Submissão do Projeto Final
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

  // Autenticação por E-mail e Senha (Nuvem Render + Fallback Local)
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
    } catch {
      // Se o servidor estiver acordando (cold start), usa fallback local sem travar o aluno
    }

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

  // Cálculo de XP (+50 XP por aula concluída) e Nível
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

          {/* Abas de Navegação */}
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

          {/* Ofensiva Diária, XP e Autenticação */}
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
          MODAL DE AUTENTICAÇÃO (GOOGLE CLOUD OAUTH + E-MAIL/SENHA NA NUVEM)
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
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-semibold text-sm rounded-lg transition-colors shadow-lg shadow-emerald-950/50"
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
          ESTRUTURA COM MENU LATERAL DE TODOS OS MÓDULOS + CONTEÚDO PRINCIPAL
         ==================================================================== */}
      {navState.activeView === 'workspace' ? (
        <ChallengeWorkspace
          allChallenges={allChallenges}
          activeChallengeId={navState.activeChallengeId}
          onSelectChallenge={setActiveChallengeId}
          completedChallenges={completedChallenges}
          onCompleteChallenge={markChallengeComplete}
          onGoToCapstone={() => setActiveView('capstone')}
          userStoragePrefix={userStoragePrefix}
          currentUser={currentUser}
          onEarnCommunityXP={(pts) => setCommunityXP((prev) => prev + pts)}
        />
      ) : (
        <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col lg:flex-row gap-6 relative">
          {mobileMenuOpen && (
            <div
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/75 z-40 lg:hidden"
            />
          )}

          {/* MENU LATERAL COM TODOS OS 6 MÓDULOS */}
          <aside
            className={`${
              mobileMenuOpen
                ? 'fixed top-0 left-0 bottom-0 z-50 w-80 bg-slate-900 border-r border-slate-800 p-5 overflow-y-auto'
                : 'hidden lg:block lg:w-72 xl:w-80 shrink-0'
            }`}
          >
            <div className="sticky top-20 rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400">
                    Menu da Formação
                  </span>
                  <h2 className="text-sm font-bold text-white mt-0.5">
                    Todos os Módulos (1 ao 6)
                  </h2>
                </div>
                {mobileMenuOpen && (
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Progresso Geral</span>
                  <span className="font-mono font-bold text-emerald-400">{overallPercentage}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${overallPercentage}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  {completedCount} de {totalSyllabusCount} aulas concluídas
                </p>
              </div>

              <div className="space-y-2">
                {INTERACTIVE_MODULES.map((mod) => {
                  const isActiveMod =
                    navState.activeModuleId === mod.id &&
                    (navState.activeView === 'dashboard' || navState.activeView === 'capstone');
                  const modDone = mod.challenges.filter((c) =>
                    completedChallenges.includes(c.id)
                  ).length;

                  return (
                    <button
                      type="button"
                      key={mod.id}
                      onClick={() => selectModuleFromMenu(mod.id)}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-2.5 ${
                        isActiveMod
                          ? 'bg-emerald-500/10 border-emerald-500/50 text-white'
                          : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-800/70'
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                          isActiveMod
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-slate-800 text-emerald-400'
                        }`}
                      >
                        <ModuleIcon name={mod.icon} className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="text-emerald-400 font-semibold">
                            MÓDULO 0{mod.number}
                          </span>
                          <span className="text-slate-400">
                            {mod.isCapstoneModule
                              ? 'Capstone'
                              : `${modDone}/${mod.challenges.length}`}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-white leading-snug mt-0.5 line-clamp-2">
                          {mod.title}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setActiveView('home')}
                  className="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Home className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Início</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView('leaderboard')}
                  className="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>Ranking</span>
                </button>
              </div>
            </div>
          </aside>

          {/* CONTEÚDO PRINCIPAL */}
          <div className="flex-1 min-w-0">
            {/* ================================================================
                VISÃO 0: PÁGINA INICIAL EXPLICANDO A PLATAFORMA NEXUSDEV
               ================================================================ */}
            {navState.activeView === 'home' && (
              <main className="space-y-8">
                <section className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-xl space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                    <Rocket className="w-3.5 h-3.5" />
                    <span>Plataforma Interativa de Engenharia Web Full-Stack</span>
                  </div>

                  <div className="max-w-3xl space-y-3">
                    <h1 className="text-2xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
                      Domine o Desenvolvimento Full-Stack{' '}
                      <span className="text-emerald-400">do Zero Absoluto ao Deploy</span>
                    </h1>
                    <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                      A <strong className="text-white">NexusDev</strong> combina teoria objetiva com
                      um ambiente prático completo: <strong>140 aulas únicas em cada módulo</strong> (
                      {totalSyllabusCount} laboratórios progressivos), editor multi-arquivos com
                      realce de sintaxe, <strong>Tutor IA Contextual</strong>,{' '}
                      <strong>Inspetor Dinâmico de Memória & Console.log</strong>,{' '}
                      <strong>Ranking Semanal</strong> e{' '}
                      <strong>Certificado Verificável com QR Code Real</strong>.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        const nextIncomplete =
                          allChallenges.find((c) => !completedChallenges.includes(c.id)) ||
                          allChallenges[0];
                        openChallenge(nextIncomplete.id);
                      }}
                      className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold rounded-xl transition-colors flex items-center gap-2 shadow-lg shadow-emerald-950/50"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>
                        {completedCount > 0 ? 'Continuar de Onde Parei' : 'Começar Primeira Aula'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveView('dashboard')}
                      className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition-colors flex items-center gap-2"
                    >
                      <Compass className="w-4 h-4 text-emerald-400" />
                      <span>Ver Trilha Completa ({totalSyllabusCount} Aulas)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveView('verify')}
                      className="px-4 py-3 bg-slate-950 hover:bg-slate-900 text-slate-300 border border-slate-800 text-xs sm:text-sm font-medium rounded-xl transition-colors flex items-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4 text-sky-400" />
                      <span>Validar Certificado</span>
                    </button>
                  </div>

                  {/* Pilares da Plataforma */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-4 border-t border-slate-800/80">
                    <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                        <Code2 className="w-4 h-4" /> IDE Multi-Arquivos
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Edite HTML, CSS e JavaScript lado a lado com preview ao vivo e testes
                        automatizados instantâneos.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                      <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider">
                        <Brain className="w-4 h-4" /> Tutor IA Contextual
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Analisa seu código no servidor e fornece dicas sob medida sem entregar a
                        resposta pronta.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                      <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                        <Cpu className="w-4 h-4" /> Memória Ao Vivo
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Teste suas funções com entradas personalizadas e capture console.log() em
                        tempo real.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                      <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-wider">
                        <Trophy className="w-4 h-4" /> Ranking & QR Code
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Desbloqueie conquistas, dispute o Top 15 semanal e valide certificados
                        publicamente.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Cards de Todos os Módulos */}
                <section className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-white">
                        Grade Curricular Completa (6 Módulos)
                      </h2>
                      <p className="text-xs text-slate-400">
                        Cada módulo técnico conta com 140 aulas práticas progressivas.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveView('dashboard')}
                      className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                    >
                      <span>Abrir todas as aulas</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {INTERACTIVE_MODULES.map((mod) => (
                      <div
                        key={mod.id}
                        className="bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-xl p-5 flex flex-col justify-between gap-4 transition-all"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400">
                              <ModuleIcon name={mod.icon} className="w-4 h-4" />
                              MÓDULO {mod.number}
                            </span>
                            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                              {mod.isCapstoneModule
                                ? 'Projeto Integrador'
                                : `${mod.challenges.length} aulas`}
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-white">{mod.title}</h3>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            {mod.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                          <span className="text-[11px] text-slate-500 truncate max-w-[190px]">
                            {mod.subtitle}
                          </span>
                          <button
                            type="button"
                            onClick={() => selectModuleFromMenu(mod.id)}
                            className="px-3.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
                          >
                            <span>Acessar Módulo</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </main>
            )}

            {/* ================================================================
                VISÃO 1: TRILHA COMPLETA (140 AULAS POR MÓDULO)
               ================================================================ */}
            {navState.activeView === 'dashboard' && (
              <main className="space-y-6">
                {!currentUser && (
                  <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-amber-400 shrink-0" />
                      <p className="text-xs sm:text-sm text-amber-100">
                        Você está estudando no <strong>Modo Visitante</strong>. Crie uma conta na
                        nuvem para salvar seu XP, ranking semanal e certificado!
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('register');
                        setAuthModalOpen(true);
                      }}
                      className="shrink-0 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
                    >
                      Salvar meu Progresso
                    </button>
                  </div>
                )}

                {/* Barra de Pesquisa e Filtro */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar entre todas as 700 aulas (ex: Flexbox, Portfólio, Bug, React, Express, JWT)..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <select
                      value={selectedDifficulty}
                      onChange={(e) => setSelectedDifficulty(e.target.value)}
                      className="bg-transparent text-xs sm:text-sm text-slate-200 focus:outline-none"
                    >
                      <option value="Todas" className="bg-slate-900">
                        Todos os Níveis
                      </option>
                      <option value="Iniciante" className="bg-slate-900">
                        Nível Iniciante
                      </option>
                      <option value="Intermediário" className="bg-slate-900">
                        Nível Intermediário
                      </option>
                      <option value="Avançado" className="bg-slate-900">
                        Nível Avançado
                      </option>
                      <option value="Bug" className="bg-slate-900">
                        Apenas Conserte o Bug
                      </option>
                    </select>
                  </div>
                </div>

                {/* Lista dos 6 Módulos */}
                <div className="space-y-4">
                  {INTERACTIVE_MODULES.map((module) => {
                    const filteredChallenges = module.challenges.filter((ch) => {
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
                      return matchesSearch && matchesDiff;
                    });

                    if (
                      (searchQuery.trim() || selectedDifficulty !== 'Todas') &&
                      filteredChallenges.length === 0 &&
                      !module.title.toLowerCase().includes(searchQuery.toLowerCase())
                    ) {
                      return null;
                    }

                    const modTotal = module.challenges.length;
                    const modCompleted = module.challenges.filter((ch) =>
                      completedChallenges.includes(ch.id)
                    ).length;
                    const modPercent =
                      modTotal > 0 ? Math.round((modCompleted / modTotal) * 100) : 0;
                    const isExpanded =
                      !!expandedModules[module.id] ||
                      searchQuery.trim().length > 0 ||
                      selectedDifficulty !== 'Todas';
                    const isCapstoneComplete =
                      module.isCapstoneModule && capstoneSubmission.submitted;

                    return (
                      <div
                        key={module.id}
                        className={`bg-slate-900 border rounded-xl overflow-hidden transition-all ${
                          navState.activeModuleId === module.id
                            ? 'border-emerald-500/50'
                            : 'border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => toggleModuleExpand(module.id)}
                          className="w-full p-5 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4 focus:outline-none"
                        >
                          <div className="flex items-start gap-4">
                            <div
                              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                                (modTotal > 0 && modCompleted === modTotal) || isCapstoneComplete
                                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                                  : 'bg-slate-800 border-slate-700 text-slate-300'
                              }`}
                            >
                              <ModuleIcon name={module.icon} className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <span className="text-xs font-mono font-semibold text-emerald-400">
                                  MÓDULO {module.number}
                                </span>
                                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                                  {module.isCapstoneModule
                                    ? 'Projeto Final'
                                    : `${module.challenges.length} aulas práticas`}
                                </span>
                                {((modTotal > 0 && modCompleted === modTotal) ||
                                  isCapstoneComplete) && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                    <CheckCircle2 className="w-3 h-3" /> Concluído
                                  </span>
                                )}
                              </div>
                              <h3 className="text-base sm:text-lg font-bold text-white">
                                {module.title}
                              </h3>
                              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                                {module.description}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-4 sm:min-w-[210px] border-t sm:border-t-0 border-slate-800 pt-3 sm:pt-0">
                            {!module.isCapstoneModule ? (
                              <div className="flex-1 sm:flex-initial sm:w-36">
                                <div className="flex justify-between text-xs text-slate-400 mb-1">
                                  <span>
                                    {modCompleted}/{modTotal} aulas
                                  </span>
                                  <span className="font-mono">{modPercent}%</span>
                                </div>
                                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-emerald-500 transition-all duration-300"
                                    style={{ width: `${modPercent}%` }}
                                  />
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs font-medium text-emerald-400">
                                Certificação Final
                              </span>
                            )}

                            <div className="p-1.5 rounded-lg bg-slate-800/80 text-slate-400">
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </div>
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="border-t border-slate-800 bg-slate-950/60 p-4 sm:px-6 sm:py-5 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {module.tracks.map((track, tIdx) => (
                                <div
                                  key={tIdx}
                                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900/70 border border-slate-800/80 text-xs"
                                >
                                  <span className="text-slate-300 truncate pr-2">• {track.name}</span>
                                  <span className="font-mono text-emerald-400 shrink-0">
                                    {track.count} aulas
                                  </span>
                                </div>
                              ))}
                            </div>

                            {!module.isCapstoneModule ? (
                              <div>
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
                                  Todas as {filteredChallenges.length} Aulas Práticas Interativas
                                </h4>
                                <div className="max-h-[540px] overflow-y-auto pr-1 space-y-2">
                                  {filteredChallenges.map((ch, idx) => {
                                    const isDone = completedChallenges.includes(ch.id);
                                    const fileNames = Object.keys(ch.files || {});
                                    return (
                                      <div
                                        key={ch.id}
                                        onClick={() => openChallenge(ch.id)}
                                        className="group flex items-center justify-between p-3 rounded-lg bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition-all"
                                      >
                                        <div className="flex items-center gap-3 min-w-0">
                                          {isDone ? (
                                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                                          ) : (
                                            <Circle className="w-5 h-5 text-slate-600 group-hover:text-emerald-400 shrink-0 transition-colors" />
                                          )}
                                          <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                              <span className="text-sm font-medium text-slate-100 group-hover:text-white truncate">
                                                {idx + 1}. {ch.title}
                                              </span>
                                              {ch.isDebug && (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30">
                                                  <Bug className="w-3 h-3" /> Bug Fix
                                                </span>
                                              )}
                                              {fileNames.length > 1 && (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-300 border border-sky-500/30">
                                                  <FolderOpen className="w-3 h-3" />{' '}
                                                  {fileNames.length} arquivos
                                                </span>
                                              )}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                                              <span className="uppercase font-mono text-emerald-400/90">
                                                {ch.language}
                                              </span>
                                              <span>•</span>
                                              <span>{ch.difficulty}</span>
                                              <span>•</span>
                                              <span>{ch.estimatedTime}</span>
                                              <span>•</span>
                                              <span className="text-amber-400 font-mono">
                                                +50 XP
                                              </span>
                                            </div>
                                          </div>
                                        </div>

                                        <span className="text-xs font-medium text-slate-400 group-hover:text-emerald-400 flex items-center gap-1 shrink-0 ml-2">
                                          {isDone ? 'Revisar' : 'Praticar'}
                                          <ChevronRight className="w-4 h-4" />
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/30">
                                <div>
                                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                    <Award className="w-4 h-4 text-emerald-400" />
                                    FullStack Store & Painel Administrativo (Projeto Final)
                                  </h4>
                                  <p className="text-xs text-slate-300 mt-1">
                                    Confira os requisitos técnicos, marque o checklist e emita seu
                                    Certificado Verificável com QR Code.
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setActiveView('capstone')}
                                  className="shrink-0 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                                >
                                  <span>Ver Especificação</span>
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </main>
            )}

            {/* ================================================================
                VISÃO 2B: RANKING SEMANAL & CONQUISTAS (BADGES)
               ================================================================ */}
            {navState.activeView === 'leaderboard' && (
              <LeaderboardAndBadgesView
                currentUser={currentUser}
                totalXP={totalXP}
                studentLevel={studentLevel}
                streakData={streakData}
                completedChallenges={completedChallenges}
                allChallenges={allChallenges}
              />
            )}

            {/* ================================================================
                VISÃO 3: PROJETO FINAL CAPSTONE & CERTIFICADO VERIFICÁVEL
               ================================================================ */}
            {navState.activeView === 'capstone' && (
              <CapstoneSpecView
                checks={capstoneChecks}
                setChecks={setCapstoneChecks}
                submission={capstoneSubmission}
                setSubmission={setCapstoneSubmission}
                completedChallengesCount={completedCount}
                totalChallengesCount={totalInteractiveChallenges}
                authToken={authToken}
                onOpenVerify={(code) => {
                  setNavState((prev) => ({ ...prev, activeView: 'verify' }));
                  if (code) {
                    const url = new URL(window.location.href);
                    url.searchParams.set('cert', code);
                    window.history.replaceState({}, '', url.toString());
                  }
                }}
              />
            )}

            {/* ================================================================
                VISÃO 3B: VALIDAÇÃO PÚBLICA DE CERTIFICADOS (QR CODE / RECRUTADOR)
               ================================================================ */}
            {navState.activeView === 'verify' && (
              <CertificateVerificationView
                initialCode={initialCertParam || capstoneSubmission.verificationCode}
                localSubmission={capstoneSubmission}
                completedCount={completedCount}
                totalXP={totalXP}
              />
            )}

            {/* ================================================================
                VISÃO 4: PERFIL DO ALUNO
               ================================================================ */}
            {navState.activeView === 'profile' && currentUser && (
              <main className="space-y-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    {currentUser.avatar ? (
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500/60 shadow-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white text-2xl font-bold flex items-center justify-center shadow-lg">
                        {currentUser.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h1 className="text-xl sm:text-2xl font-bold text-white">
                          {currentUser.name}
                        </h1>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                          Conta Sincronizada na Nuvem
                        </span>
                      </div>
                      <p className="text-sm text-slate-400">{currentUser.email}</p>
                      <p className="text-xs text-emerald-400 mt-1">
                        Estudante NexusDev • Membro desde {currentUser.joinedAt}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 text-xs font-semibold flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Encerrar Sessão</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                    <span className="text-xs text-slate-400 uppercase font-semibold">
                      Experiência
                    </span>
                    <div className="text-2xl font-bold text-amber-400 mt-1">{totalXP} XP</div>
                    <p className="text-xs text-slate-500 mt-1">Nível {studentLevel}</p>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                    <span className="text-xs text-slate-400 uppercase font-semibold">Ofensiva</span>
                    <div className="text-2xl font-bold text-orange-400 mt-1">
                      {streakData.count} dias
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Hoje: {Math.min(streakData.todayCompleted, 2)}/2
                    </p>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                    <span className="text-xs text-slate-400 uppercase font-semibold">Aulas</span>
                    <div className="text-2xl font-bold text-emerald-400 mt-1">
                      {completedCount}/{totalInteractiveChallenges}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{overallPercentage}% concluídas</p>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                    <span className="text-xs text-slate-400 uppercase font-semibold">
                      Certificado
                    </span>
                    <div className="text-2xl font-bold text-white mt-1">
                      {capstoneSubmission.submitted ? 'Emitido' : 'Pendente'}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Formação Full-Stack</p>
                  </div>
                </div>
              </main>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTE: IDE MULTI-ARQUIVOS, TUTOR IA CONTEXTUAL & MEMÓRIA AO VIVO
// ============================================================================
function ChallengeWorkspace({
  allChallenges,
  activeChallengeId,
  onSelectChallenge,
  completedChallenges,
  onCompleteChallenge,
  onGoToCapstone,
  userStoragePrefix,
  currentUser,
  onEarnCommunityXP
}) {
  const currentIndex = allChallenges.findIndex((c) => c.id === activeChallengeId);
  const challenge = allChallenges[currentIndex] || allChallenges[0];
  const prevChallenge = currentIndex > 0 ? allChallenges[currentIndex - 1] : null;
  const nextChallenge =
    currentIndex < allChallenges.length - 1 ? allChallenges[currentIndex + 1] : null;

  // Regra: a opção de Próxima Aula só é liberada após a aula atual ter sido completada
  const isAlreadyCompleted = completedChallenges.includes(challenge.id);

  const storageKey = `${userStoragePrefix}_files_${challenge.id}`;

  const [filesMap, setFilesMap] = useState(() => {
    try {
      const allSavedCodes = JSON.parse(localStorage.getItem('nexusdev_codigos') || '{}');
      const userFiles = allSavedCodes[storageKey];
      if (userFiles && typeof userFiles === 'object' && Object.keys(userFiles).length > 0) {
        return userFiles;
      }
    } catch {}
    return { ...challenge.files };
  });

  const fileNames = useMemo(() => Object.keys(filesMap), [filesMap]);
  const [activeFile, setActiveFile] = useState(() => fileNames[0] || 'index.html');

  useEffect(() => {
    if (fileNames.length > 0 && !fileNames.includes(activeFile)) {
      setActiveFile(fileNames[0]);
    }
  }, [fileNames, activeFile]);

  const [leftTab, setLeftTab] = useState('instrucoes');
  const [rightBottomTab, setRightBottomTab] = useState(
    challenge.language === 'html' ? 'preview' : 'console'
  );

  const [testResults, setTestResults] = useState([]);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [saveIndicator, setSaveIndicator] = useState('Salvo no navegador');
  const [showHint, setShowHint] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [tutorInsights, setTutorInsights] = useState([]);
  const [tutorLoading, setTutorLoading] = useState(false);

  // Estado do Inspetor Dinâmico de Memória
  const [customTraceArgsInput, setCustomTraceArgsInput] = useState(() =>
    JSON.stringify(challenge.defaultTraceArgs || [10])
  );

  useEffect(() => {
    setCustomTraceArgsInput(JSON.stringify(challenge.defaultTraceArgs || [10]));
  }, [challenge.id, challenge.defaultTraceArgs]);

  // Fórum / Discussão por Lição
  const forumStorageKey = `nexusdev_forum_${challenge.id}`;
  const [forumPosts, setForumPosts] = useState([]);
  const [newPostText, setNewPostText] = useState('');

  useEffect(() => {
    try {
      const savedForum = localStorage.getItem(forumStorageKey);
      const customPosts = savedForum ? JSON.parse(savedForum) : [];
      setForumPosts([...(challenge.communityPosts || []), ...customPosts]);
    } catch {
      setForumPosts(challenge.communityPosts || []);
    }
  }, [challenge.id, challenge.communityPosts, forumStorageKey]);

  const handleAddForumPost = (e) => {
    e.preventDefault();
    if (!newPostText.trim()) return;
    const post = {
      id: `post_${Date.now()}`,
      author: currentUser ? currentUser.name : 'Aluno Visitante',
      badge: currentUser ? 'Comunidade' : 'Visitante',
      time: 'agora mesmo',
      text: newPostText.trim()
    };
    try {
      const savedForum = localStorage.getItem(forumStorageKey);
      const customPosts = savedForum ? JSON.parse(savedForum) : [];
      localStorage.setItem(forumStorageKey, JSON.stringify([...customPosts, post]));
    } catch {}
    setForumPosts((prev) => [...prev, post]);
    setNewPostText('');
    onEarnCommunityXP(15);
  };

  const prevChallengeIdRef = useRef(challenge.id);
  useEffect(() => {
    if (prevChallengeIdRef.current !== challenge.id) {
      prevChallengeIdRef.current = challenge.id;
      let initialFiles = { ...challenge.files };
      try {
        const allSavedCodes = JSON.parse(localStorage.getItem('nexusdev_codigos') || '{}');
        const saved = allSavedCodes[storageKey];
        if (saved && Object.keys(saved).length > 0) {
          initialFiles = saved;
        }
      } catch {}
      setFilesMap(initialFiles);
      setActiveFile(Object.keys(initialFiles)[0]);
      setTestResults([]);
      setTutorInsights([]);
      setShowHint(false);
      setShowResetConfirm(false);
      setLeftTab('instrucoes');
      setRightBottomTab(challenge.language === 'html' ? 'preview' : 'console');
    }
  }, [challenge.id, challenge.files, challenge.language, storageKey]);

  useEffect(() => {
    setSaveIndicator('Salvando...');
    const timer = setTimeout(() => {
      try {
        const allSavedCodes = JSON.parse(localStorage.getItem('nexusdev_codigos') || '{}');
        allSavedCodes[storageKey] = filesMap;
        localStorage.setItem('nexusdev_codigos', JSON.stringify(allSavedCodes));
        setSaveIndicator('Salvo automaticamente');
      } catch {
        setSaveIndicator('Erro ao salvar');
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [filesMap, storageKey]);

  const currentCode = filesMap[activeFile] ?? '';

  const updateCurrentFileCode = (newVal) => {
    setFilesMap((prev) => ({
      ...prev,
      [activeFile]: newVal
    }));
  };

  const textareaRef = useRef(null);
  const preRef = useRef(null);

  const handleScrollSync = () => {
    if (textareaRef.current && preRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  const handleKeyDown = (e) => {
    const start = e.target.selectionStart;
    const end = e.target.selectionEnd;

    if (e.key === 'Tab') {
      e.preventDefault();
      const updated = currentCode.substring(0, start) + '  ' + currentCode.substring(end);
      updateCurrentFileCode(updated);
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      });
      return;
    }

    const pairs = { '{': '}', '[': ']', '(': ')', '"': '"', "'": "'" };
    if (pairs[e.key] && start === end) {
      e.preventDefault();
      const closing = pairs[e.key];
      const updated =
        currentCode.substring(0, start) + e.key + closing + currentCode.substring(end);
      updateCurrentFileCode(updated);
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 1;
        }
      });
    }
  };

  const combinedHtmlDocument = useMemo(() => {
    if (challenge.language !== 'html') return '';
    const htmlPart = filesMap['index.html'] || '';
    const cssPart = filesMap['style.css'] || '';
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${cssPart}</style></head><body>${htmlPart}</body></html>`;
  }, [challenge.language, filesMap]);

  const runTests = () => {
    setIsEvaluating(true);
    setRightBottomTab('console');
    const results = [];

    const assert = {
      strictEqual: (actual, expected, msg) => {
        if (actual !== expected) {
          throw new Error(
            msg || `Esperado ${JSON.stringify(expected)}, mas o código retornou ${JSON.stringify(actual)}`
          );
        }
      },
      deepEqual: (actual, expected, msg) => {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
          throw new Error(
            msg || `Esperado ${JSON.stringify(expected)}, mas o código retornou ${JSON.stringify(actual)}`
          );
        }
      },
      ok: (condition, msg) => {
        if (!condition) {
          throw new Error(msg || 'A condição de validação falhou.');
        }
      }
    };

    if (challenge.language === 'html') {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.left = '-9999px';
      iframe.style.top = '0';
      iframe.style.width = '800px';
      iframe.style.height = '600px';
      iframe.style.visibility = 'hidden';
      document.body.appendChild(iframe);

      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!doc) {
          throw new Error('Não foi possível inicializar o ambiente de visualização HTML.');
        }
        doc.open();
        doc.write(combinedHtmlDocument);
        doc.close();

        const rawCss = filesMap['style.css'] || '';
        const rawHtml = filesMap['index.html'] || '';

        challenge.tests.forEach((t) => {
          try {
            t.testFn(doc, iframe.contentWindow, rawCss, rawHtml);
            results.push({ id: t.id, description: t.description, passed: true });
          } catch (err) {
            results.push({
              id: t.id,
              description: t.description,
              passed: false,
              error: err.message
            });
          }
        });
      } catch (err) {
        results.push({
          id: 'err',
          description: 'Erro ao renderizar HTML/CSS',
          passed: false,
          error: err.message
        });
      } finally {
        if (iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      }
    } else {
      try {
        const combinedJs = Object.values(filesMap).join('\n');
        const fnName = challenge.targetFunction;

        if (!fnName) {
          throw new Error('Configuração de função alvo ausente neste desafio.');
        }

        const factory = new Function(
          `"use strict";\n${combinedJs};\nreturn typeof ${fnName} !== 'undefined' ? ${fnName} : undefined;`
        );
        const userFn = factory();

        if (typeof userFn !== 'function') {
          throw new Error(
            `A função "${fnName}" não foi encontrada. Mantenha o nome original da função.`
          );
        }

        challenge.tests.forEach((t) => {
          try {
            t.testFn(userFn, assert);
            results.push({ id: t.id, description: t.description, passed: true });
          } catch (err) {
            results.push({
              id: t.id,
              description: t.description,
              passed: false,
              error: err.message
            });
          }
        });
      } catch (syntaxErr) {
        results.push({
          id: 'syntax',
          description: 'Erro de Sintaxe ou Execução',
          passed: false,
          error: syntaxErr.message
        });
      }
    }

    setTestResults(results);
    setTutorInsights(analyzeStudentCodeLocal(challenge, filesMap, results));
    setIsEvaluating(false);

    if (results.length > 0 && results.every((r) => r.passed)) {
      onCompleteChallenge(challenge.id, filesMap);
    }
  };

  // Só avança se a aula atual já tiver sido concluída e verificada com sucesso
  const handleGoNextOnlyIfCompleted = () => {
    if (!isAlreadyCompleted) return;
    if (nextChallenge) {
      onSelectChallenge(nextChallenge.id);
    } else {
      onGoToCapstone();
    }
  };

  const handleOpenSmartTutor = async () => {
    setRightBottomTab('tutor');
    const localTips = analyzeStudentCodeLocal(challenge, filesMap, testResults);
    setTutorInsights(localTips);
    setTutorLoading(true);
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
          failedTests: testResults.filter((r) => !r.passed)
        })
      });
      const data = await res.json();
      if (data && Array.isArray(data.tips) && data.tips.length > 0) {
        setTutorInsights(data.tips);
      }
    } catch {
      // Mantém dicas locais caso o servidor esteja offline
    } finally {
      setTutorLoading(false);
    }
  };

  const handleResetCode = () => {
    const freshFiles = { ...challenge.files };
    setFilesMap(freshFiles);
    setActiveFile(Object.keys(freshFiles)[0]);
    try {
      const allSavedCodes = JSON.parse(localStorage.getItem('nexusdev_codigos') || '{}');
      delete allSavedCodes[storageKey];
      localStorage.setItem('nexusdev_codigos', JSON.stringify(allSavedCodes));
    } catch {}
    setTestResults([]);
    setTutorInsights([]);
    setShowResetConfirm(false);
  };

  const dynamicTraceInfo = useMemo(() => {
    if (rightBottomTab !== 'memoria' || challenge.language === 'html') return null;
    return runDynamicMemoryInspector(challenge, filesMap, customTraceArgsInput);
  }, [rightBottomTab, challenge, filesMap, customTraceArgsInput]);

  const allPassed = testResults.length > 0 && testResults.every((r) => r.passed);
  const lineCount = currentCode.split('\n').length;
  const highlightedHtml = useMemo(
    () => highlightCode(currentCode, activeFile),
    [currentCode, activeFile]
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Barra Superior do Workspace */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => prevChallenge && onSelectChallenge(prevChallenge.id)}
            disabled={!prevChallenge}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-slate-300 transition-colors"
            title="Aula Anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <select
            value={challenge.id}
            onChange={(e) => onSelectChallenge(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-200 text-xs sm:text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500 max-w-[230px] sm:max-w-md"
          >
            {allChallenges.map((c, index) => (
              <option key={c.id} value={c.id}>
                {completedChallenges.includes(c.id) ? '✓ ' : ''}
                Mód {c.moduleNumber} • Aula {index + 1}: {c.title}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleGoNextOnlyIfCompleted}
            disabled={!isAlreadyCompleted || !nextChallenge}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 transition-colors"
            title={
              isAlreadyCompleted
                ? 'Próxima Aula'
                : 'Complete a aula atual para liberar a próxima aula'
            }
          >
            {isAlreadyCompleted ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <Lock className="w-4 h-4 text-amber-400" />
            )}
          </button>

          {isAlreadyCompleted && (
            <span className="hidden xl:inline-flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" /> Concluída (+50 XP)
            </span>
          )}
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="hidden md:inline text-xs text-slate-400 font-mono mr-1">
            {saveIndicator}
          </span>

          <button
            type="button"
            onClick={handleOpenSmartTutor}
            className="px-3 py-1.5 rounded-lg bg-purple-950/70 hover:bg-purple-900/70 text-purple-200 border border-purple-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Brain className="w-3.5 h-3.5 text-purple-400" />
            <span>Tutor IA</span>
          </button>

          {!showResetConfirm ? (
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Resetar</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 bg-rose-950/60 border border-rose-800/60 px-2.5 py-1 rounded-lg">
              <span className="text-xs text-rose-200">Restaurar?</span>
              <button
                type="button"
                onClick={handleResetCode}
                className="px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded"
              >
                Sim
              </button>
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded"
              >
                Não
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={runTests}
            disabled={isEvaluating}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/35 text-emerald-300 border border-emerald-500/50 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isEvaluating ? 'Verificando...' : 'Verificar Código'}</span>
          </button>

          <button
            type="button"
            onClick={handleGoNextOnlyIfCompleted}
            disabled={!isAlreadyCompleted}
            title={
              isAlreadyCompleted
                ? 'Avançar para a próxima aula'
                : 'Complete e verifique a aula atual para liberar a Próxima Aula'
            }
            className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all ${
              isAlreadyCompleted
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/50 cursor-pointer'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
            }`}
          >
            {isAlreadyCompleted ? (
              <Check className="w-4 h-4 stroke-[2.5]" />
            ) : (
              <Lock className="w-3.5 h-3.5" />
            )}
            <span>{nextChallenge ? 'Próxima Aula' : 'Ir para Certificado'}</span>
          </button>
        </div>
      </div>

      {/* Aviso de bloqueio da Próxima Aula enquanto não concluída */}
      {!isAlreadyCompleted && (
        <div className="bg-amber-950/30 border-b border-amber-500/25 px-4 py-2 text-xs text-amber-200 flex items-center justify-center gap-2">
          <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>
            A opção <strong>Próxima Aula</strong> será liberada assim que você concluir este
            desafio e clicar em <strong>Verificar Código</strong> com todos os testes aprovados.
          </span>
        </div>
      )}

      {/* Tela Dividida (Split-Screen) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* COLUNA ESQUERDA: Abas (Instruções vs. Comunidade) */}
        <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-900/40 flex flex-col overflow-hidden">
          <div className="flex border-b border-slate-800 bg-slate-900/80 px-4 pt-2 gap-2">
            <button
              type="button"
              onClick={() => setLeftTab('instrucoes')}
              className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                leftTab === 'instrucoes'
                  ? 'border-emerald-400 text-emerald-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Aula & Critérios</span>
            </button>

            <button
              type="button"
              onClick={() => setLeftTab('comunidade')}
              className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                leftTab === 'comunidade'
                  ? 'border-emerald-400 text-emerald-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Comunidade ({forumPosts.length})</span>
            </button>
          </div>

          {leftTab === 'instrucoes' ? (
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
                  <span>Módulo {challenge.moduleNumber}</span>
                  <span>•</span>
                  <span>{challenge.difficulty}</span>
                  <span>•</span>
                  <span className="text-amber-400">+50 XP</span>
                  {challenge.isDebug && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px]">
                      <Bug className="w-3 h-3" /> Debugging
                    </span>
                  )}
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">{challenge.title}</h1>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Conceito & Explicação</span>
                </h2>
                <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                  {challenge.theory}
                </div>
              </div>

              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Desafio Prático
                </h2>
                <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-line bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
                  {challenge.instructions}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => setShowHint(!showHint)}
                  className="text-xs font-medium text-amber-400 hover:text-amber-300 flex items-center gap-1.5 transition-colors"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>{showHint ? 'Ocultar Dica' : 'Ver Dica Rápida'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenSmartTutor}
                  className="text-xs font-medium text-purple-400 hover:text-purple-300 flex items-center gap-1.5 transition-colors"
                >
                  <Brain className="w-4 h-4" />
                  <span>Analisar meu código com Tutor IA</span>
                </button>
              </div>

              {showHint && (
                <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200 leading-relaxed">
                  💡 {challenge.hint}
                </div>
              )}

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
                  Critérios de Aceitação Automatizados
                </h3>
                <ul className="space-y-2">
                  {challenge.tests.map((test) => {
                    const matchedResult = testResults.find((r) => r.id === test.id);
                    return (
                      <li
                        key={test.id}
                        className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 transition-colors ${
                          matchedResult
                            ? matchedResult.passed
                              ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200'
                              : 'bg-rose-950/30 border-rose-800/60 text-rose-200'
                            : 'bg-slate-900 border-slate-800 text-slate-300'
                        }`}
                      >
                        {matchedResult ? (
                          matchedResult.passed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          ) : (
                            <X className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                          )
                        ) : (
                          <Circle className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                        )}
                        <span>{test.description}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 flex flex-col justify-between gap-4">
              <div className="space-y-4">
                <div>
                  <h2 className="text-base font-bold text-white">Discussão & Dicas da Turma</h2>
                  <p className="text-xs text-slate-400">
                    Compartilhe dúvidas ou ajude colegas nesta aula (+15 XP por contribuição)
                  </p>
                </div>

                {forumPosts.length === 0 ? (
                  <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
                    Ainda não há comentários nesta lição. Seja o primeiro a compartilhar uma dica!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {forumPosts.map((post) => (
                      <div
                        key={post.id}
                        className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-200">{post.author}</span>
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold">
                              {post.badge}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500">{post.time}</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{post.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <form
                onSubmit={handleAddForumPost}
                className="pt-3 border-t border-slate-800 space-y-2"
              >
                <textarea
                  rows={2}
                  value={newPostText}
                  onChange={(e) => setNewPostText(e.target.value)}
                  placeholder="Escreva uma dúvida ou dica construtiva para os outros alunos..."
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
                <button
                  type="submit"
                  className="w-full py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publicar na Comunidade (+15 XP)</span>
                </button>
              </form>
            </div>
          )}
        </div>

        {/* COLUNA DIREITA: Editor Multi-Arquivos + Ferramentas Inferiores */}
        <div className="lg:col-span-7 flex flex-col h-[640px] lg:h-auto overflow-hidden bg-slate-950">
          {/* Abas de Arquivos do Projeto */}
          <div className="bg-slate-900 px-3 pt-2 border-b border-slate-800 flex items-center justify-between gap-2 overflow-x-auto">
            <div className="flex items-center gap-1">
              {fileNames.map((fName) => {
                const isActive = fName === activeFile;
                return (
                  <button
                    type="button"
                    key={fName}
                    onClick={() => setActiveFile(fName)}
                    className={`px-3 py-1.5 rounded-t-lg text-xs font-mono flex items-center gap-1.5 border-t border-x transition-colors ${
                      isActive
                        ? 'bg-slate-950 border-slate-700 text-emerald-300 font-semibold'
                        : 'bg-slate-900/50 border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <FileCode2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{fName}</span>
                  </button>
                );
              })}
            </div>

            <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 shrink-0 mb-1">
              {fileNames.length > 1 ? `${fileNames.length} arquivos` : challenge.language}
            </span>
          </div>

          {/* Área de Edição com Realce de Sintaxe Sincronizado */}
          <div className="flex-1 flex overflow-hidden relative bg-slate-950">
            <div
              aria-hidden="true"
              className="select-none py-4 px-3 text-right font-mono text-xs sm:text-sm text-slate-600 bg-slate-900/40 border-r border-slate-800/80 leading-relaxed overflow-hidden"
            >
              {Array.from({ length: Math.max(lineCount, 14) }).map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            <div className="relative flex-1 overflow-hidden">
              <pre
                ref={preRef}
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 m-0 p-4 font-mono text-xs sm:text-sm leading-relaxed whitespace-pre overflow-hidden text-slate-100"
                dangerouslySetInnerHTML={{ __html: highlightedHtml + '\n' }}
              />
              <textarea
                ref={textareaRef}
                value={currentCode}
                onChange={(e) => updateCurrentFileCode(e.target.value)}
                onScroll={handleScrollSync}
                onKeyDown={handleKeyDown}
                spellCheck="false"
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
                className="absolute inset-0 w-full h-full p-4 bg-transparent text-transparent caret-emerald-400 font-mono text-xs sm:text-sm resize-none focus:outline-none leading-relaxed overflow-auto whitespace-pre selection:bg-emerald-500/30"
              />
            </div>
          </div>

          {/* Banner de Sucesso ao Passar nos Testes */}
          {(allPassed || isAlreadyCompleted) && (
            <div className="bg-emerald-950/90 border-t border-b border-emerald-500/40 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">
                    Excelente! Aula concluída (+50 XP) — Próxima Aula desbloqueada!
                  </p>
                  <p className="text-xs text-emerald-300">
                    Progresso e ofensiva diária atualizados!
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoNextOnlyIfCompleted}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
              >
                <span>{nextChallenge ? 'Próxima Aula' : 'Ir para o Projeto Final'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Painel Inferior: Console, Preview HTML, Tutor IA e Inspetor Dinâmico de Memória */}
          <div className="h-64 bg-slate-900 border-t border-slate-800 flex flex-col">
            <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between gap-2 overflow-x-auto">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setRightBottomTab('console')}
                  className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 ${
                    rightBottomTab === 'console'
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Console de Testes</span>
                </button>

                {challenge.language === 'html' && (
                  <button
                    type="button"
                    onClick={() => setRightBottomTab('preview')}
                    className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 ${
                      rightBottomTab === 'preview'
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5 text-sky-400" />
                    <span>Preview ao Vivo</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleOpenSmartTutor}
                  className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 ${
                    rightBottomTab === 'tutor'
                      ? 'bg-purple-950/80 text-purple-200 border border-purple-500/30'
                      : 'text-slate-400 hover:text-purple-300'
                  }`}
                >
                  <Brain className="w-3.5 h-3.5 text-purple-400" />
                  <span>Tutor IA</span>
                </button>

                {challenge.language !== 'html' && challenge.targetFunction && (
                  <button
                    type="button"
                    onClick={() => setRightBottomTab('memoria')}
                    className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 ${
                      rightBottomTab === 'memoria'
                        ? 'bg-amber-950/70 text-amber-200 border border-amber-500/30'
                        : 'text-slate-400 hover:text-amber-300'
                    }`}
                  >
                    <Cpu className="w-3.5 h-3.5 text-amber-400" />
                    <span>Inspetor de Memória</span>
                  </button>
                )}
              </div>

              <span className="text-[11px] text-slate-500 font-mono shrink-0">
                {testResults.length > 0
                  ? `${testResults.filter((r) => r.passed).length}/${testResults.length} aprovados`
                  : 'Pronto'}
              </span>
            </div>

            {rightBottomTab === 'console' && (
              <div className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-2">
                {testResults.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center">
                    <Terminal className="w-6 h-6 mb-1.5 opacity-50" />
                    <p>Clique em "Verificar Código" para testar sua solução.</p>
                  </div>
                ) : (
                  testResults.map((res, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-lg border ${
                        res.passed
                          ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300'
                          : 'bg-rose-950/30 border-rose-800/50 text-rose-300'
                      }`}
                    >
                      <div className="font-semibold flex items-center gap-2">
                        <span>{res.passed ? '✔' : '✖'}</span>
                        <span>{res.description}</span>
                      </div>
                      {res.error && (
                        <p className="mt-1 text-rose-400 pl-5 break-words">{res.error}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {rightBottomTab === 'preview' && (
              <div className="flex-1 bg-white overflow-hidden">
                <iframe
                  title="Preview HTML/CSS ao Vivo"
                  srcDoc={combinedHtmlDocument}
                  sandbox="allow-scripts"
                  className="w-full h-full border-0"
                />
              </div>
            )}

            {rightBottomTab === 'tutor' && (
              <div className="flex-1 p-4 overflow-y-auto space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-purple-300">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-purple-400" />
                    <span>Análise Pedagógica Contextual</span>
                  </div>
                  {tutorLoading && (
                    <span className="text-[11px] font-mono text-purple-400">Analisando...</span>
                  )}
                </div>
                {tutorInsights.map((tip, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs text-purple-100 leading-relaxed"
                  >
                    {tip}
                  </div>
                ))}
              </div>
            )}

            {rightBottomTab === 'memoria' && (
              <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
                <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="font-mono text-amber-400 font-semibold">
                    {challenge.targetFunction}(
                  </span>
                  <input
                    type="text"
                    value={customTraceArgsInput}
                    onChange={(e) => setCustomTraceArgsInput(e.target.value)}
                    placeholder='Ex: [100, 20]'
                    className="flex-1 min-w-[140px] px-2.5 py-1 rounded bg-slate-900 border border-slate-700 font-mono text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <span className="font-mono text-amber-400 font-semibold">)</span>
                  <span className="text-[11px] text-slate-500">
                    Edite os argumentos JSON para testar ao vivo
                  </span>
                </div>

                {dynamicTraceInfo?.error ? (
                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300">
                    {dynamicTraceInfo.error}
                  </div>
                ) : (
                  dynamicTraceInfo && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                        <div className="text-[11px] font-bold text-sky-400">
                          1. Variáveis na Entrada
                        </div>
                        <div className="font-mono text-[11px] bg-slate-900 p-2 rounded text-slate-200">
                          {Object.entries(dynamicTraceInfo.memorySnapshot).map(([k, v]) => (
                            <div key={k}>
                              {k}: <span className="text-emerald-300">{JSON.stringify(v)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                        <div className="text-[11px] font-bold text-amber-400">
                          2. Saída console.log()
                        </div>
                        <div className="font-mono text-[11px] bg-slate-900 p-2 rounded text-amber-200 max-h-20 overflow-y-auto">
                          {dynamicTraceInfo.logs.length > 0
                            ? dynamicTraceInfo.logs.map((l, idx) => <div key={idx}>&gt; {l}</div>)
                            : 'Nenhum console.log() chamado'}
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                        <div className="text-[11px] font-bold text-emerald-400">
                          3. Retorno ({dynamicTraceInfo.durationMs} ms)
                        </div>
                        <div className="font-mono text-xs bg-slate-900 p-2 rounded text-emerald-300 font-bold break-all">
                          return {dynamicTraceInfo.actualOutput}
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTE: RANKING SEMANAL & CONQUISTAS DESBLOQUEÁVEIS (BADGES)
// ============================================================================
function LeaderboardAndBadgesView({
  currentUser,
  totalXP,
  studentLevel,
  streakData,
  completedChallenges,
  allChallenges
}) {
  const [leaders, setLeaders] = useState([]);
  const [loadingLeaders, setLoadingLeaders] = useState(true);

  useEffect(() => {
    let active = true;
    fetch(`${API_BASE_URL}/api/leaderboard`)
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        const remote = Array.isArray(data?.leaderboard) ? data.leaderboard : [];
        const fallbackPeers = [
          { rank: 1, name: 'Camila Rocha', xp: 4850, streak: 19, completedCount: 97 },
          { rank: 2, name: 'Rafael Costa', xp: 3600, streak: 14, completedCount: 72 },
          { rank: 3, name: 'Mariana Lima', xp: 2450, streak: 9, completedCount: 49 },
          { rank: 4, name: 'Gabriel Souza', xp: 1750, streak: 6, completedCount: 35 },
          { rank: 5, name: 'Bianca Alves', xp: 1200, streak: 5, completedCount: 24 }
        ];

        const merged = remote.length > 0 ? [...remote] : [...fallbackPeers];
        const myName = currentUser?.name || 'Você (Visitante)';
        const alreadyInList = merged.some((u) => u.name === myName);
        if (!alreadyInList) {
          merged.push({
            rank: 0,
            name: myName,
            xp: totalXP,
            streak: streakData.count,
            completedCount: completedChallenges.length,
            isCurrentUser: true
          });
        }

        merged.sort((a, b) => b.xp - a.xp || b.streak - a.streak);
        setLeaders(
          merged.slice(0, 15).map((item, idx) => ({
            ...item,
            rank: idx + 1,
            isCurrentUser: item.isCurrentUser || item.name === myName
          }))
        );
      })
      .catch(() => {
        setLeaders([
          {
            rank: 1,
            name: currentUser?.name || 'Você (Visitante)',
            xp: totalXP,
            streak: streakData.count,
            completedCount: completedChallenges.length,
            isCurrentUser: true
          }
        ]);
      })
      .finally(() => {
        if (active) setLoadingLeaders(false);
      });

    return () => {
      active = false;
    };
  }, [currentUser, totalXP, streakData.count, completedChallenges.length]);

  const htmlCompleted = allChallenges.filter(
    (c) => c.moduleNumber === 1 && completedChallenges.includes(c.id)
  ).length;
  const jsCompleted = allChallenges.filter(
    (c) => c.moduleNumber === 2 && completedChallenges.includes(c.id)
  ).length;
  const debugCompleted = allChallenges.filter(
    (c) => c.isDebug && completedChallenges.includes(c.id)
  ).length;

  const badges = [
    {
      id: 'b-first',
      title: 'Primeiro Código',
      desc: 'Concluiu sua primeira aula prática na NexusDev.',
      unlocked: completedChallenges.length >= 1,
      progress: `${Math.min(completedChallenges.length, 1)}/1 aula`
    },
    {
      id: 'b-streak',
      title: 'Consistência de Ferro',
      desc: 'Manteve 3 dias ou mais de ofensiva diária.',
      unlocked: streakData.count >= 3,
      progress: `${Math.min(streakData.count, 3)}/3 dias`
    },
    {
      id: 'b-html',
      title: 'Arquiteto Web HTML/CSS',
      desc: 'Completou pelo menos 15 aulas do Módulo 1.',
      unlocked: htmlCompleted >= 15,
      progress: `${Math.min(htmlCompleted, 15)}/15 aulas`
    },
    {
      id: 'b-js',
      title: 'Mestre da Lógica JS',
      desc: 'Completou pelo menos 15 algoritmos em JavaScript.',
      unlocked: jsCompleted >= 15,
      progress: `${Math.min(jsCompleted, 15)}/15 aulas`
    },
    {
      id: 'b-bug',
      title: 'Caçador de Bugs',
      desc: 'Resolveu pelo menos 3 desafios de Debugging.',
      unlocked: debugCompleted >= 3,
      progress: `${Math.min(debugCompleted, 3)}/3 bugs`
    },
    {
      id: 'b-xp',
      title: 'Veterano Full-Stack',
      desc: 'Alcançou 1.000 XP acumulados na formação.',
      unlocked: totalXP >= 1000,
      progress: `${Math.min(totalXP, 1000)}/1000 XP`
    }
  ];

  return (
    <main className="space-y-8">
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-2">
            <Trophy className="w-3.5 h-3.5" />
            <span>Gamificação & Comunidade NexusDev</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Ranking Semanal & Conquistas
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Ganhe +50 XP por aula concluída e +15 XP por dicas na comunidade para subir no pódio.
          </p>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl px-5 py-3.5 text-center shrink-0">
          <span className="text-[11px] uppercase tracking-wider text-slate-400">Sua Pontuação</span>
          <div className="text-2xl font-bold text-amber-400 font-mono">{totalXP} XP</div>
          <span className="text-xs text-emerald-400">Nível {studentLevel}</span>
        </div>
      </div>

      {/* Medalhas / Conquistas */}
      <section className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <Medal className="w-5 h-5 text-emerald-400" />
          <span>Suas Conquistas (Badges)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {badges.map((b) => (
            <div
              key={b.id}
              className={`p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                b.unlocked
                  ? 'bg-emerald-950/25 border-emerald-500/40'
                  : 'bg-slate-900/70 border-slate-800 opacity-75'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  b.unlocked
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                <Star className="w-5 h-5 fill-current" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-white truncate">{b.title}</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-300">
                    {b.progress}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pódio Top 15 */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-400" />
            <span>Top Estudantes da Semana</span>
          </h2>
          {loadingLeaders && (
            <span className="text-xs font-mono text-slate-400">Sincronizando ranking...</span>
          )}
        </div>

        <div className="divide-y divide-slate-800/80">
          {leaders.map((u) => (
            <div
              key={`${u.rank}-${u.name}`}
              className={`px-5 py-3.5 flex items-center justify-between gap-3 ${
                u.isCurrentUser ? 'bg-emerald-950/30' : ''
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className={`w-8 h-8 rounded-lg font-mono font-bold text-xs flex items-center justify-center shrink-0 ${
                    u.rank === 1
                      ? 'bg-amber-400 text-slate-950'
                      : u.rank === 2
                      ? 'bg-slate-300 text-slate-950'
                      : u.rank === 3
                      ? 'bg-amber-700 text-white'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  #{u.rank}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white truncate">{u.name}</span>
                    {u.isCurrentUser && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Você
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    {u.completedCount} aulas concluídas • 🔥 {u.streak}d ofensiva
                  </p>
                </div>
              </div>

              <div className="font-mono font-bold text-sm text-amber-400 shrink-0">
                {u.xp} XP
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

// ============================================================================
// SUB-COMPONENTE: PROJETO FINAL FULL-STACK & CERTIFICADO COM QR CODE REAL
// ============================================================================
function CapstoneSpecView({
  checks,
  setChecks,
  submission,
  setSubmission,
  completedChallengesCount,
  totalChallengesCount,
  authToken,
  onOpenVerify
}) {
  const [formError, setFormError] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [issuing, setIssuing] = useState(false);

  const toggleCheck = (id) => {
    setChecks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const checkedCount = CAPSTONE_REQUIREMENTS.filter((r) => checks[r.id]).length;
  const allRequirementsChecked = checkedCount === CAPSTONE_REQUIREMENTS.length;

  const handleClaimCertificate = async (e) => {
    e.preventDefault();
    if (!submission.studentName.trim()) {
      setFormError('Informe seu nome completo como deve aparecer no certificado.');
      return;
    }
    if (!submission.githubUrl.trim().startsWith('http')) {
      setFormError('Informe uma URL válida do repositório no GitHub (iniciando com http/https).');
      return;
    }
    if (!allRequirementsChecked) {
      setFormError('Marque todos os 5 requisitos técnicos no checklist antes de emitir.');
      return;
    }
    setFormError('');
    setIssuing(true);

    let codeHash =
      submission.verificationCode ||
      `NXD-2026-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    if (authToken) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/certificates/issue`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`
          },
          body: JSON.stringify({
            studentName: submission.studentName.trim(),
            githubUrl: submission.githubUrl.trim(),
            liveUrl: submission.liveUrl.trim()
          })
        });
        const data = await res.json();
        if (data && data.code) {
          codeHash = data.code;
        }
      } catch {}
    }

    setSubmission((prev) => ({
      ...prev,
      submitted: true,
      verificationCode: codeHash
    }));
    setIssuing(false);
  };

  const publicCertificateUrl = useMemo(() => {
    if (!submission.verificationCode) return '';
    const origin =
      typeof window !== 'undefined' && window.location.origin.startsWith('http')
        ? window.location.origin
        : 'https://nexusdev-frontend.vercel.app';
    return `${origin}/?cert=${encodeURIComponent(submission.verificationCode)}`;
  }, [submission.verificationCode]);

  const realQrCodeImageUrl = useMemo(() => {
    if (!publicCertificateUrl) return '';
    return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
      publicCertificateUrl
    )}`;
  }, [publicCertificateUrl]);

  const handleCopyVerifyUrl = () => {
    if (!publicCertificateUrl) return;
    navigator.clipboard?.writeText(publicCertificateUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <main className="space-y-8">
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/50 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3">
            <Award className="w-3.5 h-3.5" />
            <span>Módulo 6 • Requisito Final para Certificação</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Projeto Integrador: NexusDev Store & Painel Administrativo
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl">
            Desenvolva e publique um sistema completo de E-Commerce integrando React, API RESTful em
            Node.js + Express e MongoDB com JWT para emitir seu Certificado Verificável com QR Code.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onOpenVerify(submission.verificationCode)}
          className="shrink-0 px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-sky-300 flex items-center gap-2"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Portal de Validação Pública</span>
        </button>
      </div>

      {/* Checklist e Formulário */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-bold text-white">
              Checklist de Requisitos Técnicos
            </h2>
            <span className="text-xs font-mono text-emerald-400">
              {checkedCount}/{CAPSTONE_REQUIREMENTS.length} Verificados
            </span>
          </div>

          <div className="space-y-3">
            {CAPSTONE_REQUIREMENTS.map((req) => {
              const isChecked = !!checks[req.id];
              return (
                <div
                  key={req.id}
                  onClick={() => toggleCheck(req.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                    isChecked
                      ? 'bg-emerald-950/25 border-emerald-500/40'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 border transition-colors ${
                      isChecked
                        ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                        : 'border-slate-600 bg-slate-900'
                    }`}
                  >
                    {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                      {req.category}
                    </span>
                    <h3 className="text-sm font-semibold text-white mt-0.5">{req.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{req.details}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white mb-1">
              Entregar Projeto & Emitir Certificado
            </h2>
            <p className="text-xs text-slate-400 mb-5">
              Aulas concluídas: {completedChallengesCount}/{totalChallengesCount}
            </p>

            <form onSubmit={handleClaimCertificate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Nome Completo (para o Certificado)
                </label>
                <input
                  type="text"
                  placeholder="Ex: João Pedro Santos"
                  value={submission.studentName}
                  onChange={(e) =>
                    setSubmission((prev) => ({
                      ...prev,
                      studentName: e.target.value,
                      submitted: false
                    }))
                  }
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Github className="w-3.5 h-3.5 text-slate-400" />
                  <span>URL do Repositório no GitHub</span>
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/seu-usuario/nexusdev-store"
                  value={submission.githubUrl}
                  onChange={(e) =>
                    setSubmission((prev) => ({
                      ...prev,
                      githubUrl: e.target.value,
                      submitted: false
                    }))
                  }
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  <span>URL da Aplicação no Ar (Opcional)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://nexusdev-store.vercel.app"
                  value={submission.liveUrl}
                  onChange={(e) =>
                    setSubmission((prev) => ({
                      ...prev,
                      liveUrl: e.target.value,
                      submitted: false
                    }))
                  }
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {formError && (
                <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800/60 text-xs text-rose-300">
                  {formError}
                </div>
              )}

              <button
                type="submit"
                disabled={issuing}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50"
              >
                <Award className="w-4 h-4" />
                <span>
                  {issuing
                    ? 'Registrando na Nuvem...'
                    : submission.submitted
                    ? 'Certificado Verificável Emitido'
                    : 'Validar & Emitir Certificado'}
                </span>
              </button>
            </form>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-500 flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 shrink-0" />
            <span>Inclui QR Code escaneável e link público para recrutadores.</span>
          </div>
        </div>
      </div>

      {/* Certificado Verificável com QR Code Real */}
      {submission.submitted && (
        <section className="bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/40 border-2 border-emerald-500/50 rounded-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-mono mb-3">
                <ShieldCheck className="w-4 h-4" />
                <span>ID DE VERIFICAÇÃO: {submission.verificationCode}</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold text-white mb-2">
                Desenvolvedor(a) Web Full-Stack
              </h2>
              <p className="text-sm text-slate-400 mb-4">Certificamos que</p>
              <div className="text-2xl sm:text-3xl font-serif italic text-emerald-300 border-b border-slate-700 pb-3 max-w-md mx-auto md:mx-0 mb-4">
                {submission.studentName}
              </div>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed mb-5">
                Concluiu com êxito a formação completa de {totalChallengesCount} aulas em
                Desenvolvimento Web Full-Stack (HTML5, CSS3, JavaScript ES6+, React, Node.js,
                Express, MongoDB e JWT) e entregou o Projeto Final NexusDev Store.
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs">
                <a
                  href={submission.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>Repositório GitHub</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <button
                  type="button"
                  onClick={handleCopyVerifyUrl}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-200 transition-colors"
                >
                  {copiedLink ? (
                    <>
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Link Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Copiar Link Público</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onOpenVerify(submission.verificationCode)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/40 text-sky-200 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Visualizar Página Pública</span>
                </button>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 flex flex-col items-center text-center shrink-0">
              <div className="w-32 h-32 bg-white rounded-xl p-2 flex items-center justify-center mb-2 overflow-hidden">
                <img
                  src={realQrCodeImageUrl}
                  alt={`QR Code de Verificação ${submission.verificationCode}`}
                  className="w-28 h-28 object-contain"
                />
              </div>
              <span className="text-[10px] font-mono text-slate-400 uppercase">
                Aponte a câmera para validar
              </span>
              <span className="text-[11px] font-mono text-emerald-400 font-bold">
                {submission.verificationCode}
              </span>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

// ============================================================================
// SUB-COMPONENTE: PORTAL PÚBLICO DE VALIDAÇÃO DE CERTIFICADOS
// ============================================================================
function CertificateVerificationView({
  initialCode,
  localSubmission,
  completedCount,
  totalXP
}) {
  const [codeInput, setCodeInput] = useState(initialCode || '');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const verifyCode = async (targetCode) => {
    const clean = (targetCode || codeInput).trim().toUpperCase();
    if (!clean) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/certificates/${encodeURIComponent(clean)}`);
      const data = await res.json();
      if (res.ok && data.valid) {
        setResult(data);
        setLoading(false);
        return;
      }
    } catch {}

    // Fallback para verificação do certificado emitido localmente na sessão atual
    if (
      localSubmission?.submitted &&
      localSubmission?.verificationCode?.toUpperCase() === clean
    ) {
      setResult({
        valid: true,
        code: localSubmission.verificationCode,
        studentName: localSubmission.studentName,
        completedCount,
        xp: totalXP,
        issuedAt: new Date().toISOString(),
        githubUrl: localSubmission.githubUrl,
        liveUrl: localSubmission.liveUrl
      });
    } else {
      setResult({
        valid: false,
        error: 'Código de certificado não encontrado ou inválido.'
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    if (initialCode) {
      verifyCode(initialCode);
    }
  }, [initialCode]);

  return (
    <main className="max-w-3xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Autenticidade Verificável NexusDev</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Validar Certificado de Conclusão</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Digite o código impresso no certificado (ex: <code className="text-emerald-400">NXD-2026-...</code>) para confirmar sua autenticidade.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            verifyCode(codeInput);
          }}
          className="flex flex-col sm:flex-row gap-2.5"
        >
          <input
            type="text"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            placeholder="NXD-2026-XXXXX"
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 font-mono text-sm text-white uppercase focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-colors"
          >
            {loading ? 'Consultando...' : 'Verificar Autenticidade'}
          </button>
        </form>
      </div>

      {result && (
        <div
          className={`rounded-2xl p-6 sm:p-8 border-2 ${
            result.valid
              ? 'bg-emerald-950/25 border-emerald-500/50'
              : 'bg-rose-950/25 border-rose-500/50'
          }`}
        >
          {result.valid ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-base">
                <CheckCircle2 className="w-6 h-6" />
                <span>Certificado Autêntico & Válido</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block">Titular do Certificado</span>
                  <strong className="text-base text-white">{result.studentName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Código Único</span>
                  <strong className="text-sm font-mono text-emerald-400">{result.code}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Carga Prática Concluída</span>
                  <strong className="text-sm text-slate-200">
                    {result.completedCount} aulas ({result.xp} XP)
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Data de Emissão</span>
                  <strong className="text-sm text-slate-200">
                    {new Date(result.issuedAt).toLocaleDateString('pt-BR')}
                  </strong>
                </div>
              </div>

              {result.githubUrl && (
                <a
                  href={result.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-emerald-300 hover:underline"
                >
                  <Github className="w-4 h-4" />
                  <span>Inspecionar Projeto Final no GitHub</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 text-rose-300 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{result.error}</span>
            </div>
          )}
        </div>
      )}
    </main>
  );
}