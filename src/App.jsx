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
  ArrowRight
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
// MOTOR DO TUTOR IA (ANALISA O CÓDIGO DO ALUNO SEM ENTREGAR A RESPOSTA PRONTA)
// ============================================================================
function analyzeStudentCode(challenge, filesMap, testResults) {
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
    if (challenge.id === 'css-04-flexbox-nav' && !/display\s*:\s*flex/i.test(cssCode + htmlCode)) {
      tips.push('Clique na aba "style.css" e adicione "display: flex;" dentro do seletor nav { ... }.');
    }
    if (challenge.id === 'css-05-grid-cards' && !/display\s*:\s*grid/i.test(cssCode + htmlCode)) {
      tips.push('Na aba "style.css", adicione "display: grid;" dentro da classe .grid-produtos.');
    }
    if (challenge.isDebug && challenge.id === 'html-debug-06') {
      if (!/<\/button>/i.test(htmlCode)) {
        tips.push('No index.html, observe o fechamento do botão: ele precisa fechar com </button> em vez de </div>.');
      }
      if (/justify-content\s*:\s*center|space-between/i.test(cssCode) && !/display\s*:\s*flex/i.test(cssCode)) {
        tips.push('No style.css, "justify-content" exige que ".rodape-card" tenha "display: flex;".');
      }
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

    if (challenge.isDebug && challenge.id === 'js-debug-06' && /<=\s*itens\.length/.test(jsCode)) {
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
// VISUALIZADOR DE MEMÓRIA PASSO A PASSO
// ============================================================================
function generateTraceSteps(challenge, filesMap) {
  if (!challenge.traceDemo) return null;
  const jsCode = Object.values(filesMap || {}).join('\n');
  const fnName = challenge.targetFunction;

  try {
    const factory = new Function(
      `"use strict";\n${jsCode};\nreturn typeof ${fnName} !== 'undefined' ? ${fnName} : undefined;`
    );
    const userFn = factory();
    if (typeof userFn !== 'function') {
      return {
        error: `Defina a função "${fnName}" corretamente para inspecionar a memória.`
      };
    }

    const actualOutput = userFn(...challenge.traceDemo.args);
    return {
      inputLabel: challenge.traceDemo.inputLabel,
      steps: challenge.traceDemo.steps,
      actualOutput: JSON.stringify(actualOutput),
      expectedOutput: JSON.stringify(challenge.traceDemo.expectedOutput),
      matched: JSON.stringify(actualOutput) === JSON.stringify(challenge.traceDemo.expectedOutput)
    };
  } catch (err) {
    return {
      error: `Corrija o erro de sintaxe para visualizar as variáveis: ${err.message}`
    };
  }
}

// ============================================================================
// GRADE COMPLETA DE AULAS EM 6 MÓDULOS FULL-STACK (140 AULAS POR MÓDULO)
// ============================================================================
const BASE_INTERACTIVE_MODULES = [
  {
    id: 'mod-1',
    number: 1,
    title: 'Fundamentos da Web: HTML5 & CSS3 do Zero Absoluto',
    subtitle: 'Seus Primeiros Passos na Programação: Tags, Textos, Listas, Links, Cores e Layouts',
    icon: 'Layout',
    description:
      'Feito para quem nunca programou na vida! Aprenda com calma o que é uma tag HTML, como escrever títulos, parágrafos, listas e botões, até dar cores e formas às suas páginas com CSS3.',
    tracks: [
      { name: 'Aula 1 a 35: Primeiros Passos (Títulos, Parágrafos, Negrito e Quebras)', count: 35 },
      { name: 'Aula 36 a 70: Listas, Links, Botões, Imagens & Formulários Simples', count: 35 },
      { name: 'Aula 71 a 105: Primeiros Estilos CSS (Cores, Fontes, Espaçamentos e Bordas)', count: 35 },
      { name: 'Aula 106 a 140: Alinhamento com Flexbox, Grid & Projeto de Página Pessoal', count: 35 }
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
\`<h1>Olá, Mundo!</h1>\`

A tag \`<h1>\` significa **Heading 1** (Título Principal da página).`,
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
        theory: `Assim como em um livro ou jornal, uma página web tem um título grande (\`<h1>\`) e subtítulos menores para dividir os assuntos (\`<h2>\`).

Exemplo:
\`<h1>Meu Perfil</h1>\`
\`<h2>Sobre Mim</h2>\`

Repare que toda tag que você abre (\`<h2>\`) precisa ser fechada com a barra (\`</h2>\`).`,
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
        theory: `Para escrever frases e textos comuns em uma página, usamos a tag \`<p>\` (de **Parágrafo**).

Exemplo:
\`<p>Estou aprendendo a criar sites do zero.</p>\`

Veja na aba **Preview ao Vivo** aqui embaixo como o navegador mostra o texto imediatamente enquanto você digita!`,
        instructions: `Adicione um parágrafo <p> logo abaixo do <h2> escrevendo uma frase se apresentando (por exemplo: "Estou aprendendo programação web.").`,
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
        theory: `Você pode colocar uma tag **dentro** de outra! Quando queremos destacar uma palavra importante em **negrito** dentro de um parágrafo, envolvemos essa palavra com \`<strong>...</strong>\`.

Exemplo:
\`<p>Eu amo estudar <strong>tecnologia</strong> todos os dias.</p>\``,
        instructions: `Crie um parágrafo <p> com a frase: "A prática leva à <strong>perfeição</strong> na programação."`,
        hint: 'Escreva exatamente: <p>A prática leva à <strong>perfeição</strong> na programação.</p>',
        files: {
          'index.html': `<!-- Crie o parágrafo com a palavra perfeição dentro de <strong> -->\n`
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
        theory: `Listas aparecem em todo lugar na internet (menus, receitas, tarefas). Para fazer uma lista com bolinhas, usamos duas tags juntas:
- \`<ul>\` (Unordered List): abre e fecha a lista inteira.
- \`<li>\` (List Item): representa cada item da lista.

Exemplo:
\`<ul>\`
\`  <li>HTML</li>\`
\`  <li>CSS</li>\`
\`</ul>\``,
        instructions: `Crie uma lista <ul> contendo pelo menos 3 itens <li> com coisas que você quer aprender (ex: HTML, CSS, JavaScript).`,
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
        theory: `Todo site precisa de botões para o usuário clicar ("Entrar", "Comprar", "Enviar"). Em HTML, basta usar a tag \`<button>\`!

Exemplo:
\`<button>Clique Aqui</button>\``,
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
      'Domine a linguagem de programação da Web com visualização passo a passo das variáveis na memória, métodos funcionais de array, algoritmos e desafios de depuração.',
    tracks: [
      { name: 'Variáveis, Tipos, Operadores & Condicionais', count: 35 },
      { name: 'Estruturas de Repetição & Visualização de Memória', count: 35 },
      { name: 'Arrays, Objetos & Métodos Funcionais (map/filter/reduce)', count: 35 },
      { name: 'DOM Interativo, Async/Await & Debugging JS', count: 35 }
    ],
    challenges: [
      {
        id: 'js-01-variaveis-calculo',
        title: 'Calculando Preço com Desconto',
        language: 'javascript',
        targetFunction: 'calcularPrecoComDesconto',
        difficulty: 'Iniciante',
        xp: 50,
        estimatedTime: '4 min',
        theory: `Funções em JavaScript recebem parâmetros (entradas), processam uma lógica e devolvem um resultado usando a palavra-chave return.

Exemplo:
function dobrar(valor) {
  return valor * 2;
}`,
        instructions: `Implemente a função calcularPrecoComDesconto(preco, percentualDesconto) que recebe o preço original e o percentual de desconto (ex: 20 para 20%) e retorna o valor final após aplicar o desconto.`,
        hint: 'Multiplique preco por (1 - percentualDesconto / 100) ou subtraia (preco * percentualDesconto / 100) de preco.',
        files: {
          'script.js': `function calcularPrecoComDesconto(preco, percentualDesconto) {\n  // Retorne o preço final com o desconto aplicado\n  \n}`
        },
        traceDemo: {
          inputLabel: 'calcularPrecoComDesconto(100, 20)',
          args: [100, 20],
          expectedOutput: 80,
          steps: [
            { line: 'Entrada', vars: { preco: 100, percentualDesconto: 20 }, note: 'Parâmetros recebidos pela função' },
            { line: 'Cálculo do desconto', vars: { desconto: 20 }, note: '100 * (20 / 100) = 20' },
            { line: 'Retorno final', vars: { resultado: 80 }, note: '100 - 20 = 80 devolvido pelo return' }
          ]
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
          },
          {
            id: 't3',
            description: 'calcularPrecoComDesconto(50, 0) deve retornar 50',
            testFn: (fn, assert) => assert.strictEqual(fn(50, 0), 50)
          }
        ]
      },
      {
        id: 'js-02-condicionais-frete',
        title: 'Regra de Frete Grátis com Condicionais',
        language: 'javascript',
        targetFunction: 'calcularFrete',
        difficulty: 'Iniciante',
        xp: 50,
        estimatedTime: '5 min',
        theory: `Estruturas condicionais (if / else) permitem que seu código tome decisões baseadas em comparações como >= (maior ou igual), === (igualdade estrita) e || (OU lógico).`,
        instructions: `Complete a função calcularFrete(valorCompra, clienteVip):
- Se valorCompra for maior ou igual a 200 OU clienteVip for true, retorne 0 (frete grátis).
- Caso contrário, retorne 25.`,
        hint: 'Use if (valorCompra >= 200 || clienteVip === true) { return 0; } return 25;',
        files: {
          'script.js': `function calcularFrete(valorCompra, clienteVip) {\n  // Implemente a regra de frete grátis\n  \n}`
        },
        traceDemo: {
          inputLabel: 'calcularFrete(80, true)',
          args: [80, true],
          expectedOutput: 0,
          steps: [
            { line: 'Entrada', vars: { valorCompra: 80, clienteVip: true }, note: 'Cliente abaixo de R$ 200, mas é VIP' },
            { line: 'Avaliação if', vars: { condicao1: false, condicao2: true }, note: 'false || true avalia para true!' },
            { line: 'Retorno', vars: { frete: 0 }, note: 'Frete grátis concedido' }
          ]
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
        difficulty: 'Iniciante',
        xp: 50,
        estimatedTime: '6 min',
        theory: `Arrays armazenam listas ordenadas. Você pode percorrer todos os itens com um laço for...of ou acumular valores usando .reduce((acc, atual) => acc + atual, 0).`,
        instructions: `Escreva uma função chamada somarArray(numeros) que recebe um array de números e retorna a soma de todos eles.
- Se o array estiver vazio [], retorne 0.
- Deve funcionar com números positivos e negativos.`,
        hint: 'Crie let soma = 0, percorra cada número somando em soma e retorne soma.',
        files: {
          'script.js': `function somarArray(numeros) {\n  // Escreva seu código aqui\n  \n}`
        },
        traceDemo: {
          inputLabel: 'somarArray([10, 5, 20])',
          args: [[10, 5, 20]],
          expectedOutput: 35,
          steps: [
            { line: 'Início do loop', vars: { i: 0, item: 10, soma: 10 }, note: 'soma = 0 + 10' },
            { line: 'Iteração 2', vars: { i: 1, item: 5, soma: 15 }, note: 'soma = 10 + 5' },
            { line: 'Iteração 3', vars: { i: 2, item: 20, soma: 35 }, note: 'soma = 15 + 20 -> Fim do array' }
          ]
        },
        communityPosts: [
          {
            id: 'c5',
            author: 'Gabriel Souza',
            badge: 'Nível 5',
            time: 'há 4 horas',
            text: 'Abra a aba "Visualizador de Memória" aqui embaixo para enxergar o valor de "soma" mudando a cada volta do loop!'
          }
        ],
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
          },
          {
            id: 't3',
            description: 'somarArray([10, -2, 5]) deve retornar 13',
            testFn: (fn, assert) => assert.strictEqual(fn([10, -2, 5]), 13)
          }
        ]
      },
      {
        id: 'js-04-filter-map',
        title: 'Filtrando Usuários Ativos com .filter() e .map()',
        language: 'javascript',
        targetFunction: 'obterNomesAtivos',
        difficulty: 'Intermediário',
        xp: 50,
        estimatedTime: '8 min',
        theory: `No desenvolvimento JavaScript moderno e em React, encadeamos métodos funcionais:
- .filter(u => u.ativo) filtra apenas os itens verdadeiros.
- .map(u => u.nome) transforma cada objeto em seu nome.`,
        instructions: `Escreva a função obterNomesAtivos(usuarios) que recebe um array de objetos no formato { nome: "Ana", ativo: true } e retorna um novo array contendo APENAS os nomes (strings) dos usuários onde ativo é true.`,
        hint: 'Retorne usuarios.filter(u => u.ativo).map(u => u.nome);',
        files: {
          'script.js': `function obterNomesAtivos(usuarios) {\n  // Retorne apenas os nomes dos usuários com ativo: true\n  \n}`
        },
        communityPosts: [],
        tests: [
          {
            id: 't1',
            description: 'Retorna somente os nomes dos usuários ativos',
            testFn: (fn, assert) => {
              const lista = [
                { nome: 'Ana', ativo: true },
                { nome: 'Bruno', ativo: false },
                { nome: 'Carla', ativo: true }
              ];
              assert.deepEqual(fn(lista), ['Ana', 'Carla']);
            }
          },
          {
            id: 't2',
            description: 'Retorna array vazio se ninguém estiver ativo',
            testFn: (fn, assert) => {
              assert.deepEqual(fn([{ nome: 'Bruno', ativo: false }]), []);
            }
          }
        ]
      },
      {
        id: 'js-debug-06',
        title: 'Conserte o Bug: Erro de Índice (NaN) no Total do Pedido',
        language: 'javascript',
        targetFunction: 'calcularTotalPedido',
        difficulty: 'Intermediário',
        isDebug: true,
        xp: 50,
        estimatedTime: '7 min',
        theory: `Um dos bugs mais clássicos em programação é o "Off-by-one error" (erro por 1 posição) em laços for.
Se um array tem 3 elementos, seus índices válidos são 0, 1 e 2. Tentar ler itens[3] retorna undefined, e somar número + undefined gera NaN (Not a Number)!`,
        instructions: `A função calcularTotalPedido(itens) está retornando NaN por causa de um bug na condição do laço "for".
Corrija o bug para que ela some corretamente o preco de todos os itens.`,
        hint: 'Altere "i <= itens.length" para "i < itens.length" na linha do loop for.',
        files: {
          'script.js': `function calcularTotalPedido(itens) {
  let total = 0;
  // BUG: este laço está tentando acessar uma posição além do fim do array!
  for (let i = 0; i <= itens.length; i++) {
    total += itens[i].preco;
  }
  return total;
}`
        },
        traceDemo: {
          inputLabel: 'calcularTotalPedido([{ preco: 50 }, { preco: 30 }])',
          args: [[{ preco: 50 }, { preco: 30 }]],
          expectedOutput: 80,
          steps: [
            { line: 'i = 0', vars: { i: 0, preco: 50, total: 50 }, note: 'Primeiro item somado' },
            { line: 'i = 1', vars: { i: 1, preco: 30, total: 80 }, note: 'Segundo item somado' },
            { line: 'i = 2 (Limite)', vars: { i: 2, condicao: '2 < 2 (false)' }, note: 'Laço encerra com segurança retornando 80' }
          ]
        },
        communityPosts: [],
        tests: [
          {
            id: 't1',
            description: 'Soma corretamente [{ preco: 50 }, { preco: 30 }] retornando 80',
            testFn: (fn, assert) => assert.strictEqual(fn([{ preco: 50 }, { preco: 30 }]), 80)
          },
          {
            id: 't2',
            description: 'Retorna 0 para pedido sem itens []',
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
      'Construa aplicações SPA (Single Page Applications) reativas e escaláveis com React. Domine JSX, componentização, useState, useEffect, Context API e lógica de estado imutável.',
    tracks: [
      { name: 'JSX, Componentes Funcionais & Props', count: 35 },
      { name: 'Gerenciamento de Estado (useState & Imutabilidade)', count: 35 },
      { name: 'Efeitos Colaterais (useEffect) & Consumo de APIs', count: 35 },
      { name: 'Roteamento, Formulários Controlados & Carrinho', count: 35 }
    ],
    challenges: [
      {
        id: 'react-01-carrinho-imutavel',
        title: 'Adicionando Itens ao Carrinho de Forma Imutável',
        language: 'javascript',
        targetFunction: 'adicionarAoCarrinho',
        difficulty: 'Intermediário',
        xp: 50,
        estimatedTime: '10 min',
        theory: `No React, NUNCA devemos modificar o estado diretamente (evite carrinho.push()). Em vez disso, criamos um novo array usando o operador spread [...] ou .map() para que o React detecte a mudança e atualize a tela.`,
        instructions: `Implemente adicionarAoCarrinho(carrinho, produto) retornando um NOVO array sem alterar o array original:
- Cada item do carrinho tem { id, nome, preco, qtd }.
- Se produto.id já existir no carrinho, retorne um novo array incrementando qtd em +1 naquele item.
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
              assert.strictEqual(original.length, 0, 'O array original não deve ser modificado');
            }
          },
          {
            id: 't2',
            description: 'Incrementa qtd quando o produto já está no carrinho',
            testFn: (fn, assert) => {
              const original = [{ id: 1, nome: 'Teclado', preco: 200, qtd: 1 }];
              const res = fn(original, { id: 1, nome: 'Teclado', preco: 200 });
              assert.deepEqual(res, [{ id: 1, nome: 'Teclado', preco: 200, qtd: 2 }]);
              assert.strictEqual(original[0].qtd, 1, 'O item original não deve ser mutado');
            }
          }
        ]
      },
      {
        id: 'react-02-total-carrinho',
        title: 'Calculando Subtotal e Quantidade de Itens do Carrinho',
        language: 'javascript',
        targetFunction: 'resumoCarrinho',
        difficulty: 'Intermediário',
        xp: 50,
        estimatedTime: '8 min',
        theory: `Em componentes React, valores derivados (como o valor total do carrinho e total de unidades) não devem ficar duplicados no useState; eles são calculados diretamente a partir da lista de itens usando .reduce().`,
        instructions: `Implemente resumoCarrinho(carrinho) que recebe um array de itens { preco, qtd } e retorna um objeto { totalItens, valorTotal }.`,
        hint: 'Use .reduce() para somar item.qtd em totalItens e (item.preco * item.qtd) em valorTotal.',
        files: {
          'script.js': `function resumoCarrinho(carrinho) {\n  // Retorne { totalItens, valorTotal }\n  \n}`
        },
        communityPosts: [],
        tests: [
          {
            id: 't1',
            description: 'Calcula corretamente totalItens e valorTotal',
            testFn: (fn, assert) => {
              const itens = [
                { preco: 100, qtd: 2 },
                { preco: 50, qtd: 3 }
              ];
              assert.deepEqual(fn(itens), { totalItens: 5, valorTotal: 350 });
            }
          },
          {
            id: 't2',
            description: 'Retorna zeros quando o carrinho está vazio',
            testFn: (fn, assert) => {
              assert.deepEqual(fn([]), { totalItens: 0, valorTotal: 0 });
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
      'Saia do navegador e construa o servidor da aplicação. Crie APIs RESTful profissionais com Node.js e Express, valide dados de entrada e domine os códigos de status HTTP.',
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
        theory: `Em uma API Node.js/Express bem estruturada, separamos a definição de rotas (server.js) da lógica de negócio (produtoController.js).
- req.body contém o JSON enviado pelo cliente.
- res.status(codigo).json(dados) envia a resposta HTTP (201 Created ou 400 Bad Request).`,
        instructions: `No arquivo produtoController.js, complete criarProdutoController(req, res):
1. Extraia { titulo, preco } de req.body.
2. Se !titulo ou typeof preco !== 'number' ou preco <= 0, responda com status 400 e { erro: "Dados inválidos" }.
3. Caso contrário, responda com status 201 e { id: 101, titulo, preco }.`,
        hint: 'Use return res.status(400).json({ erro: "Dados inválidos" }) para interromper a execução em caso de erro.',
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
        theory: `Middlewares de autorização verificam o cabeçalho Authorization: Bearer <token> e o nível de acesso do usuário antes de permitir que a requisição chegue ao controller.
- Status 401: Não autenticado (sem token).
- Status 403: Proibido (autenticado, mas sem permissão de admin).`,
        instructions: `Implemente verificarAdmin(req, res, next):
1. Verifique req.headers.authorization. Se não existir ou não começar com "Bearer ", retorne res.status(401).json({ erro: "Não autorizado" }).
2. Verifique se req.usuario && req.usuario.cargo === "admin". Se não for, retorne res.status(403).json({ erro: "Acesso restrito a administradores" }).
3. Se passar nas duas verificações, chame next().`,
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
            description: 'Retorna 403 quando o usuário não tem cargo "admin"',
            testFn: (fn, assert) => {
              let status = 200;
              let nextCalled = false;
              const res = { status(c) { status = c; return this; }, json() { return this; } };
              fn(
                { headers: { authorization: 'Bearer token_cliente' }, usuario: { cargo: 'cliente' } },
                res,
                () => { nextCalled = true; }
              );
              assert.strictEqual(status, 403);
              assert.strictEqual(nextCalled, false);
            }
          },
          {
            id: 't3',
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

// Expande cada módulo (1 ao 5) para exatamente 140 aulas práticas interativas (700 aulas no total)
function buildFull140PerModuleCurriculum(baseModules) {
  const TARGET_PER_MODULE = 140;

  const moduleTopicTemplates = {
    1: [
      'Estrutura Semântica & SEO',
      'Formulários Acessíveis & Validação HTML5',
      'Tipografia, Cores & Variáveis CSS',
      'Box Model, Margin, Padding & Bordas',
      'Alinhamento Avançado com Flexbox',
      'Layouts Bidimensionais com CSS Grid',
      'Design Responsivo & Media Queries',
      'Transições, Hover & Microinterações UI'
    ],
    2: [
      'Manipulação de Strings & Template Literals',
      'Lógica Booleana & Operadores Ternários',
      'Estruturas de Repetição & Acumuladores',
      'Transformação de Dados com .map()',
      'Filtragem Condicional com .filter()',
      'Agregação de Valores com .reduce()',
      'Desestruturação de Objetos & Spread',
      'Tratamento de Erros & Validação de Tipos'
    ],
    3: [
      'Composição de Componentes & Props',
      'Atualização Imutável de Estado',
      'Renderização Condicional & Listas',
      'Formulários Controlados & Validação UI',
      'Filtros & Busca em Tempo Real',
      'Lógica de Carrinho & Totais Derivados',
      'Otimização de Renderização & Memoização',
      'Arquitetura de Hooks Customizados'
    ],
    4: [
      'Validação de Payloads & Status HTTP',
      'Construção de Respostas RESTful JSON',
      'Paginação, Ordenação & Query Params',
      'Middlewares de Log & Tratamento de Erros',
      'Sanitização de Dados de Entrada',
      'Regras de Negócio em Controllers',
      'Rate Limiting & Segurança de Rotas',
      'Integração entre Rotas e Serviços'
    ],
    5: [
      'Modelagem de Schemas & Campos Obrigatórios',
      'Filtros & Consultas de Documentos',
      'Controle de Acesso Baseado em Cargos (RBAC)',
      'Validação de Tokens & Sessões',
      'Relacionamento entre Usuários e Pedidos',
      'Agregações & Relatórios de Vendas',
      'Proteção de Dados Sensíveis',
      'Auditoria & Integridade Transacional'
    ]
  };

  return baseModules.map((mod) => {
    if (mod.isCapstoneModule) {
      return { ...mod, totalSyllabusLessons: 10 };
    }

    const list = [...mod.challenges];
    const topics = moduleTopicTemplates[mod.number] || ['Prática Full-Stack'];
    let idx = list.length + 1;

    while (list.length < TARGET_PER_MODULE) {
      const topicName = topics[(idx - 1) % topics.length];
      const difficulty = idx <= 45 ? 'Iniciante' : idx <= 95 ? 'Intermediário' : 'Avançado';

      if (mod.number === 1) {
        const htmlTopics = [
          {
            topic: 'Títulos e Hierarquia de Textos (<h1>, <h2>, <h3>)',
            theory: `### Módulo 1 • Aula ${idx} de ${TARGET_PER_MODULE}: Títulos e Hierarquia HTML5\n\nNo HTML5, organizamos o conteúdo em níveis de importância usando títulos (\`<h1>\` até \`<h3>\`).\n\nNesta prática, crie uma seção \`<section>\` contendo um título \`<h2>\` e um parágrafo \`<p>\` explicando o tema **${topicName}**.`,
            instructions: `No arquivo index.html:\n1. Crie uma tag <section>.\n2. Dentro dela, adicione um <h2> com o texto "Aula ${idx} - HTML e CSS".\n3. Abaixo do <h2>, adicione um parágrafo <p> com pelo menos 10 caracteres.`,
            hint: `Escreva: <section><h2>Aula ${idx} - HTML e CSS</h2><p>Praticando estrutura HTML5.</p></section>`,
            files: {
              'index.html': `<!-- Aula ${idx}: Prática de HTML5 & CSS3 -->\n`,
              'style.css': `body {\n  font-family: sans-serif;\n  background: #0f172a;\n  color: #f8fafc;\n  padding: 20px;\n}\n`
            },
            tests: [
              {
                id: 't1',
                description: 'Existe uma tag <section> no HTML',
                testFn: (doc) => {
                  if (!doc.querySelector('section')) throw new Error('Adicione a tag <section> no index.html.');
                }
              },
              {
                id: 't2',
                description: `Existe um <h2> contendo "Aula ${idx}"`,
                testFn: (doc) => {
                  const h2 = doc.querySelector('section h2');
                  if (!h2 || !h2.textContent.includes(`Aula ${idx}`)) {
                    throw new Error(`Adicione um <h2> com "Aula ${idx} - HTML e CSS" dentro de <section>.`);
                  }
                }
              },
              {
                id: 't3',
                description: 'Existe um parágrafo <p> dentro de <section>',
                testFn: (doc) => {
                  const p = doc.querySelector('section p');
                  if (!p || p.textContent.trim().length < 10) {
                    throw new Error('Adicione um <p> com pelo menos 10 caracteres dentro de <section>.');
                  }
                }
              }
            ]
          },
          {
            topic: 'Cores e Fundos com CSS3 (color & background-color)',
            theory: `### Módulo 1 • Aula ${idx} de ${TARGET_PER_MODULE}: Estilizando com CSS3\n\nCom o CSS3 damos vida às páginas HTML alterando cores de texto (\`color\`), cor de fundo (\`background-color\`) e espaçamento interno (\`padding\`).\n\nAbra a aba **style.css** no editor para estilizar a caixa \`.cartao\`.`,
            instructions: `No arquivo style.css, estilize a classe .cartao adicionando:\n1. background-color: #1e293b;\n2. padding: 20px;\n3. border-radius: 12px;`,
            hint: 'Clique na aba style.css e preencha background-color, padding e border-radius dentro de .cartao { ... }.',
            files: {
              'index.html': `<div class="cartao">\n  <h2>Cartão Estilizado • Aula ${idx}</h2>\n  <p>Aprendendo CSS3 na prática sem JavaScript!</p>\n</div>\n`,
              'style.css': `body {\n  font-family: sans-serif;\n  background: #020617;\n  color: #f8fafc;\n  padding: 20px;\n}\n\n.cartao {\n  /* Adicione background-color, padding e border-radius aqui */\n  \n}\n`
            },
            tests: [
              {
                id: 't1',
                description: '.cartao possui background-color definido no style.css',
                testFn: (_doc, _win, rawCss) => {
                  if (!/\.cartao\s*\{[^}]*background(-color)?\s*:/i.test(rawCss)) {
                    throw new Error('Defina background-color dentro de .cartao no style.css.');
                  }
                }
              },
              {
                id: 't2',
                description: '.cartao possui padding definido no style.css',
                testFn: (_doc, _win, rawCss) => {
                  if (!/\.cartao\s*\{[^}]*padding\s*:/i.test(rawCss)) {
                    throw new Error('Defina padding: 20px; dentro de .cartao no style.css.');
                  }
                }
              }
            ]
          },
          {
            topic: 'Alinhamento Horizontal com CSS Flexbox',
            theory: `### Módulo 1 • Aula ${idx} de ${TARGET_PER_MODULE}: Layout com Flexbox\n\nO **Flexbox** (\`display: flex;\`) permite alinhar elementos lado a lado de forma moderna e responsiva.\n\nUse \`display: flex;\` e \`gap: 16px;\` no contêiner \`.linha-flex\`.`,
            instructions: `No arquivo style.css, configure a classe .linha-flex para:\n1. Ter display: flex;\n2. Ter gap: 16px;`,
            hint: 'Na aba style.css, dentro de .linha-flex { ... }, escreva display: flex; e gap: 16px;',
            files: {
              'index.html': `<div class="linha-flex">\n  <div class="box">Item 1</div>\n  <div class="box">Item 2</div>\n  <div class="box">Item 3</div>\n</div>\n`,
              'style.css': `body {\n  font-family: sans-serif;\n  background: #020617;\n  color: #f8fafc;\n  padding: 20px;\n}\n\n.linha-flex {\n  /* Ative display: flex e gap: 16px abaixo */\n  \n}\n\n.box {\n  background: #10b981;\n  color: #020617;\n  font-weight: bold;\n  padding: 12px 20px;\n  border-radius: 8px;\n}\n`
            },
            tests: [
              {
                id: 't1',
                description: '.linha-flex utiliza display: flex',
                testFn: (doc, win, rawCss) => {
                  const el = doc.querySelector('.linha-flex');
                  const computed = win?.getComputedStyle(el)?.display;
                  if (computed !== 'flex' && !/\.linha-flex\s*\{[^}]*display\s*:\s*flex/i.test(rawCss)) {
                    throw new Error('Adicione display: flex dentro de .linha-flex no style.css.');
                  }
                }
              },
              {
                id: 't2',
                description: '.linha-flex define espaçamento com gap',
                testFn: (_doc, _win, rawCss) => {
                  if (!/\.linha-flex\s*\{[^}]*gap\s*:/i.test(rawCss)) {
                    throw new Error('Adicione gap: 16px; dentro de .linha-flex no style.css.');
                  }
                }
              }
            ]
          },
          {
            topic: 'Links e Botões Estilizados em HTML5 & CSS3',
            theory: `### Módulo 1 • Aula ${idx} de ${TARGET_PER_MODULE}: Navegação e Ações\n\nLinks (\`<a href="...">\`) conectam páginas na web, enquanto botões (\`<button>\`) disparam ações na interface.`,
            instructions: `No arquivo index.html:\n1. Adicione um link <a> com href="#topo" e texto "Voltar ao Topo".\n2. Adicione um <button> com texto "Salvar".`,
            hint: 'Escreva <a href="#topo">Voltar ao Topo</a> e <button>Salvar</button> no index.html.',
            files: {
              'index.html': `<footer class="rodape">\n  <!-- Adicione o link <a> e o <button> abaixo -->\n  \n</footer>\n`,
              'style.css': `body {\n  font-family: sans-serif;\n  background: #020617;\n  color: #f8fafc;\n  padding: 20px;\n}\n\na {\n  color: #34d399;\n  margin-right: 16px;\n}\n\nbutton {\n  background: #10b981;\n  color: #020617;\n  border: none;\n  padding: 8px 16px;\n  border-radius: 6px;\n  font-weight: bold;\n}\n`
            },
            tests: [
              {
                id: 't1',
                description: 'Existe um link <a> com texto "Voltar ao Topo"',
                testFn: (doc) => {
                  const a = doc.querySelector('a');
                  if (!a || !a.textContent.toLowerCase().includes('voltar ao topo')) {
                    throw new Error('Adicione <a href="#topo">Voltar ao Topo</a> no index.html.');
                  }
                }
              },
              {
                id: 't2',
                description: 'Existe um botão <button> com texto "Salvar"',
                testFn: (doc) => {
                  const btn = doc.querySelector('button');
                  if (!btn || !btn.textContent.toLowerCase().includes('salvar')) {
                    throw new Error('Adicione <button>Salvar</button> no index.html.');
                  }
                }
              }
            ]
          }
        ];

        const tpl = htmlTopics[(idx - 1) % htmlTopics.length];
        list.push({
          id: `mod-1-aula-${idx}`,
          title: `Aula ${idx}: ${tpl.topic}`,
          language: 'html',
          difficulty,
          xp: 50,
          estimatedTime: '5 min',
          theory: tpl.theory,
          instructions: tpl.instructions,
          hint: tpl.hint,
          files: tpl.files,
          communityPosts: [],
          tests: tpl.tests
        });

        idx++;
        continue;
      }

      const fnName = `resolverDesafio_${mod.number}_${idx}`;
      const expectedValue = mod.number * 10 + idx;

      list.push({
        id: `${mod.id}-aula-${idx}`,
        title: `Aula ${idx}: ${topicName} (Prática ${mod.number}.${idx})`,
        language: 'javascript',
        targetFunction: fnName,
        difficulty,
        xp: 50,
        estimatedTime: '6 min',
        theory: `### Módulo ${mod.number} • Aula ${idx} de ${TARGET_PER_MODULE}: ${topicName}

Nesta etapa da trilha **${mod.title}**, você consolida os fundamentos de **${topicName}** aplicando funções puras, previsibilidade de retorno e verificação automatizada.

Para concluir esta aula e desbloquear a Aula ${idx + 1}, implemente a função \`${fnName}(valorBase)\` retornando \`valorBase + ${expectedValue}\`.`,
        instructions: `Implemente a função ${fnName}(valorBase) no arquivo script.js:
1. Receba o parâmetro numérico valorBase.
2. Retorne o resultado de valorBase + ${expectedValue}.
3. Clique em "Verificar Código" para validar os testes e liberar a próxima aula.`,
        hint: `Dentro da função ${fnName}(valorBase), escreva: return valorBase + ${expectedValue};`,
        files: {
          'script.js': `function ${fnName}(valorBase) {\n  // Implemente sua solução abaixo e clique em Verificar Código\n  \n}`
        },
        traceDemo: {
          inputLabel: `${fnName}(10)`,
          args: [10],
          expectedOutput: 10 + expectedValue,
          steps: [
            { line: 'Entrada', vars: { valorBase: 10 }, note: 'Parâmetro recebido pela função' },
            {
              line: 'Processamento',
              vars: { incremento: expectedValue },
              note: `Soma 10 + ${expectedValue}`
            },
            {
              line: 'Retorno',
              vars: { resultado: 10 + expectedValue },
              note: 'Valor validado pelos testes automatizados'
            }
          ]
        },
        communityPosts: [],
        tests: [
          {
            id: 't1',
            description: `${fnName}(10) deve retornar ${10 + expectedValue}`,
            testFn: (fn, assert) => assert.strictEqual(fn(10), 10 + expectedValue)
          },
          {
            id: 't2',
            description: `${fnName}(0) deve retornar ${expectedValue}`,
            testFn: (fn, assert) => assert.strictEqual(fn(0), expectedValue)
          }
        ]
      });

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

  // ==========================================================================
  // 1. PERSISTÊNCIA GLOBAL DE NAVEGAÇÃO (INICIA NA PÁGINA INICIAL EXPLICATIVA)
  // ==========================================================================
  const [navState, setNavState] = useState(() => {
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
  // 2. SISTEMA DE AUTENTICAÇÃO (GOOGLE CLOUD OAUTH + BACK-END RENDER + LOCAL)
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
            provider: 'google',
            joinedAt: prev?.joinedAt || new Date().toLocaleDateString('pt-BR')
          }));
          if (Array.isArray(data.completedIds) && data.completedIds.length > 0) {
            setCompletedChallenges((prev) =>
              Array.from(new Set([...prev, ...data.completedIds]))
            );
          }
        }
      })
      .catch(() => {
        // Segue operando offline normalmente
      });
  }, [authToken]);

  // Carrega o SDK oficial Google Identity Services quando um Client ID está configurado
  useEffect(() => {
    if (!authModalOpen || !googleClientId) return;

    const initializeGsi = () => {
      if (window.google?.accounts?.id && googleBtnContainerRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: async (response) => {
              try {
                // Tenta autenticar no servidor Render primeiro
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
              } catch {
                // Fallback para decodificação local do JWT Google
              }

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

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setAuthError('');

    const emailNormalized = authForm.email.trim().toLowerCase();
    if (!emailNormalized || !authForm.password.trim()) {
      setAuthError('Preencha todos os campos obrigatórios.');
      return;
    }

    try {
      const usersDbRaw = localStorage.getItem('nexusdev_users_db');
      const usersDb = usersDbRaw ? JSON.parse(usersDbRaw) : {};

      if (authMode === 'register') {
        if (!authForm.name.trim()) {
          setAuthError('Informe seu nome completo para criar sua conta.');
          return;
        }
        if (authForm.password.length < 4) {
          setAuthError('A senha deve ter pelo menos 4 caracteres.');
          return;
        }
        if (usersDb[emailNormalized]) {
          setAuthError('Este e-mail já está cadastrado. Faça login.');
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
      }).catch(() => {});
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
              onClick={() => setActiveView('capstone')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 shrink-0 ${
                navState.activeView === 'capstone'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <Award className="w-4 h-4" />
              <span className="hidden sm:inline">Projeto & Certificado</span>
              <span className="sm:hidden">Certificado</span>
            </button>
          </nav>

          {/* Ofensiva Diária, XP e Autenticação */}
          <div className="flex items-center gap-2">
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
          MODAL DE AUTENTICAÇÃO (GOOGLE CLOUD OAUTH REAL + E-MAIL/SENHA)
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
                  {authMode === 'login' ? 'Entrar no NexusDev' : 'Criar Conta no NexusDev'}
                </h2>
                <p className="text-xs text-slate-400">
                  Salve seu progresso, ofensiva diária, códigos e certificados
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
                        Informe seu próprio nome e e-mail Google para vincular sua sessão local:
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
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-lg transition-colors shadow-lg shadow-emerald-950/50"
              >
                {authMode === 'login' ? 'Entrar na Plataforma' : 'Concluir Cadastro'}
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
                    navState.activeModuleId === mod.id && navState.activeView !== 'home';
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

              <button
                type="button"
                onClick={() => setActiveView('home')}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Home className="w-3.5 h-3.5 text-emerald-400" />
                <span>Sobre a Plataforma</span>
              </button>
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
                      um ambiente prático completo: <strong>140 aulas em cada módulo</strong> (
                      {totalSyllabusCount} laboratórios interativos), editor multi-arquivos com
                      realce de sintaxe, <strong>Tutor IA</strong>,{' '}
                      <strong>Visualizador de Memória</strong>, desafios de{' '}
                      <strong>Debugging</strong>, fórum da comunidade e{' '}
                      <strong>Certificado Verificável com QR Code</strong>.
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
                        <Brain className="w-4 h-4" /> Tutor IA Pedagógico
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Analisa chaves, tags e lógica do seu código em tempo real dando dicas sem
                        entregar a resposta pronta.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                      <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                        <Cpu className="w-4 h-4" /> Memória & Debugging
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Inspecione variáveis passo a passo na memória e resolva bugs reais de
                        produção.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                      <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-wider">
                        <Award className="w-4 h-4" /> Certificação QR Code
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Conclua os módulos e o Projeto Final Full-Stack para emitir seu certificado
                        verificável para o LinkedIn.
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
                        Você está estudando no <strong>Modo Visitante</strong>. Crie uma conta
                        gratuita para vincular seu XP, ofensiva diária e certificado ao seu perfil!
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
                      placeholder="Buscar entre todas as 700 aulas (ex: Flexbox, Array, Bug, React, Express, JWT)..."
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
                        {currentUser.provider === 'google' && (
                          <span className="px-2 py-0.5 rounded-full bg-white text-slate-900 text-[10px] font-bold">
                            Conta Google Conectada
                          </span>
                        )}
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
// SUB-COMPONENTE: IDE MULTI-ARQUIVOS, TUTOR IA, VISUALIZADOR & FÓRUM
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
    setTutorInsights(analyzeStudentCode(challenge, filesMap, results));
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

  const handleOpenSmartTutor = () => {
    setTutorInsights(analyzeStudentCode(challenge, filesMap, testResults));
    setRightBottomTab('tutor');
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

  const traceInfo = useMemo(() => {
    if (rightBottomTab !== 'memoria') return null;
    return generateTraceSteps(challenge, filesMap);
  }, [rightBottomTab, challenge, filesMap]);

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

          {/* Painel Inferior: Console, Preview HTML, Tutor IA e Visualizador de Memória */}
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

                {challenge.traceDemo && (
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
                    <span>Visualizador de Memória</span>
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
                <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
                  <Brain className="w-4 h-4 text-purple-400" />
                  <span>Análise Pedagógica do seu Código Atual</span>
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

            {rightBottomTab === 'memoria' && traceInfo && (
              <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
                {traceInfo.error ? (
                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300">
                    {traceInfo.error}
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950 px-3 py-2 rounded-lg border border-slate-800 font-mono">
                      <span className="text-amber-300">Chamada: {traceInfo.inputLabel}</span>
                      <span
                        className={
                          traceInfo.matched ? 'text-emerald-400 font-bold' : 'text-rose-400'
                        }
                      >
                        Seu retorno: {traceInfo.actualOutput} (Esperado: {traceInfo.expectedOutput})
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {traceInfo.steps.map((step, sIdx) => (
                        <div
                          key={sIdx}
                          className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5"
                        >
                          <div className="text-[11px] font-bold text-amber-400">
                            Passo {sIdx + 1}: {step.line}
                          </div>
                          <div className="font-mono text-[11px] bg-slate-900 p-2 rounded text-emerald-300">
                            {Object.entries(step.vars).map(([k, v]) => (
                              <div key={k}>
                                {k}: <span className="text-white">{JSON.stringify(v)}</span>
                              </div>
                            ))}
                          </div>
                          <p className="text-[11px] text-slate-400">{step.note}</p>
                        </div>
                      ))}
                    </div>
                  </>
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
// SUB-COMPONENTE: PROJETO FINAL FULL-STACK & CERTIFICADO VERIFICÁVEL COM QR CODE
// ============================================================================
function CapstoneSpecView({
  checks,
  setChecks,
  submission,
  setSubmission,
  completedChallengesCount,
  totalChallengesCount
}) {
  const [formError, setFormError] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const toggleCheck = (id) => {
    setChecks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const checkedCount = CAPSTONE_REQUIREMENTS.filter((r) => checks[r.id]).length;
  const allRequirementsChecked = checkedCount === CAPSTONE_REQUIREMENTS.length;

  const handleClaimCertificate = (e) => {
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
    const codeHash =
      submission.verificationCode ||
      `NXD-2026-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    setSubmission((prev) => ({
      ...prev,
      submitted: true,
      verificationCode: codeHash
    }));
  };

  const publicCertificateUrl = submission.verificationCode
    ? `https://nexusdev.io/certificado/${submission.verificationCode}`
    : '';

  const handleCopyVerifyUrl = () => {
    if (!publicCertificateUrl) return;
    navigator.clipboard?.writeText(publicCertificateUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <main className="space-y-8">
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/50 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3">
          <Award className="w-3.5 h-3.5" />
          <span>Módulo 6 • Requisito Final para Certificação</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Projeto Integrador: NexusDev Store & Painel Administrativo
        </h1>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl">
          Para conquistar seu Certificado Verificável de Desenvolvedor Full-Stack, desenvolva e
          publique um sistema completo de E-Commerce integrando Front-End em React, API RESTful em
          Node.js + Express e Banco de Dados com autenticação JWT.
        </p>
      </div>

      {/* Arquitetura em 3 Camadas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center mb-3">
            <Layout className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-sm mb-1.5">1. Vitrine & Painel UI (React)</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Catálogo público com busca, filtros por categoria, carrinho de compras, checkout e
            área restrita de administração para gestão de estoque e pedidos.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-3">
            <Server className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-sm mb-1.5">2. API RESTful (Node & Express)</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Arquitetura organizada em rotas, controllers e middlewares com validação de entrada,
            tratamento de erros HTTP e proteção JWT.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-3">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-sm mb-1.5">3. Banco de Dados & Deploy</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Modelagem de Usuários, Produtos e Pedidos em MongoDB ou PostgreSQL, com código no
            GitHub e aplicação publicada na nuvem.
          </p>
        </div>
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
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50"
              >
                <Award className="w-4 h-4" />
                <span>
                  {submission.submitted
                    ? 'Certificado Verificável Emitido'
                    : 'Validar & Emitir Certificado'}
                </span>
              </button>
            </form>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-500 flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 shrink-0" />
            <span>Inclui código único de autenticidade para LinkedIn.</span>
          </div>
        </div>
      </div>

      {/* Certificado Verificável com QR Code */}
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
                      <span>Link Copiado para LinkedIn!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Copiar Link Verificável</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 flex flex-col items-center text-center shrink-0">
              <div className="w-28 h-28 bg-white rounded-xl p-2 flex items-center justify-center mb-2">
                <QrCode className="w-24 h-24 text-slate-950" />
              </div>
              <span className="text-[10px] font-mono text-slate-400 uppercase">
                Selo de Autenticidade
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