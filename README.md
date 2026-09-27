# JOVI Moments

Aplicação web desenvolvida para a Sprint 2 do Challenge FIAP "JOVI Moments" (ADS 2026). O projeto implementa o front-end funcional da câmera inteligente proposta na Sprint 1, para o smartphone conceitual JOVI V70.

## Restrição técnica do desafio

O edital da Sprint 2 exige que a implementação utilize exclusivamente HTML, CSS, JavaScript e Tailwind CSS ou Bootstrap, sem qualquer tecnologia fora desse escopo, o que inclui bibliotecas de terceiros, backend e banco de dados. A única exceção é o próprio Tailwind CLI (`@tailwindcss/cli`), usado apenas para compilar `src/input.css` em `css/tailwind.css`: é a ferramenta de build ensinada no curso para trabalhar com Tailwind CSS, não uma dependência externa ao escopo. Todas as decisões de arquitetura descritas abaixo partem dessa restrição.

## Stack utilizado

- HTML5 semântico
- Tailwind CSS compilado via Tailwind CLI (`npm run build`, a partir de `src/input.css`)
- JavaScript (ES6+), sem frameworks
- APIs nativas do navegador: MediaDevices (getUserMedia), Canvas, Web Share API, localStorage, Clipboard API
- Google Fonts para tipografia

Não há dependência de servidor, banco de dados ou bibliotecas externas de terceiros além da tipografia do Google Fonts.

## Reconhecimento de cenário: por que é uma simulação

A Sprint 1 descreve uma câmera com reconhecimento de cenário por inteligência artificial, citando TensorFlow.js e MobileNet como referência conceitual de mercado. Essas tecnologias estão fora do escopo liberado na Sprint 2, então a "IA" foi implementada como uma heurística de análise de imagem em JavaScript.

O funcionamento: ao capturar um frame, o app lê os pixels via Canvas API e calcula indicadores como brilho médio, saturação, presença de tons de pele na região central, distribuição de cor entre o topo e a base da imagem, e nitidez (diferença de brilho entre pixels vizinhos, usada para inferir desfoque de movimento). Esses indicadores são pontuados para decidir entre seis cenários: Retrato, Paisagem, Comida, Documento, Noite e Ação.

Essa abordagem não faz reconhecimento de objeto real: não identifica que uma cena contém uma cama ou um prato, apenas responde a padrões de cor e luz, e por isso erra em cenas ambíguas. Para lidar com isso, o app inclui uma correção manual ("Não era isso?") que permite ao usuário escolher o cenário correto quando a heurística erra. Essa função está alinhada ao próprio modelo de dados da Sprint 1, que já previa um campo de correção manual na tabela de análise de IA.

## Por que não há backend

Sem servidor, todo o estado do usuário: pontos, fotos capturadas, conquistas, itens resgatados na loja, preferências de tema e avatar, é mantido em localStorage, no navegador. Isso tem algumas consequências:

- Não existem contas de usuário reais nem sincronização entre dispositivos; os dados ficam presos ao navegador em que foram criados.
- O ranking global e os demais perfis exibidos são dados fixos simulados; apenas a entrada do usuário atual reflete progresso real.
- Não há interação social real entre usuários (curtidas, comentários), já que isso exigiria múltiplos usuários se comunicando através de um servidor.

## Aderência ao modelo de dados da Sprint 1

O MER entregue na Sprint 1 modela a solução completa, incluindo entidades que dependem de um backend (contas de usuário, feed social, histórico de análise de IA por foto). Como o escopo da Sprint 2 restringe a implementação a HTML, CSS e JavaScript sem servidor nem banco de dados, nem todas as entidades do modelo foram implementadas nesta etapa. O objetivo aqui foi reproduzir fielmente o núcleo de gamificação (cenários, pontos, níveis, conquistas, loja) dentro do que essas tecnologias permitem.

Entidades do MER não implementadas no front-end, e o motivo:

- **T_JOVI_USER**: não há contas de usuário nem autenticação; o app assume um único usuário local por navegador.
- **T_JOVI_POST, T_JOVI_POST_LIKE, T_JOVI_POST_COMMENT, T_JOVI_SHARE_LOG**: o modelo previa um feed social (publicar, curtir, comentar). Sem servidor para múltiplos usuários interagirem entre si, essa camada não foi implementada; o compartilhamento foi simplificado para a Web Share API nativa do navegador, com um contador local de compartilhamentos.
- **T_JOVI_GALLERY / T_JOVI_GALLERY_PHOTO**: o modelo previa agrupamento de fotos em álbuns; a galeria implementada é uma lista única, filtrável por cenário.
- **T_JOVI_AI_ANALYSIS / T_JOVI_AI_ADJUSTMENT**: o modelo guarda um histórico de análise por foto; a versão implementada exibe os ajustes da IA no momento da captura, mas não os persiste depois de salvos.

As entidades relacionadas ao núcleo de gamificação (cenários, pontos, níveis, conquistas, itens da loja, ranking) foram implementadas fielmente ao modelo original, adaptadas para persistência em localStorage no lugar de tabelas relacionais.

## Estrutura de arquivos

```
jovi-moments/
  index.html           estrutura de todas as telas da aplicação (SPA)
  css/style.css         estilos e variáveis de tema que o Tailwind não cobre
  css/tailwind.css      CSS compilado (gerado por "npm run build"  não editar direto)
  src/input.css         entrada do Tailwind CLI (tema, cores, fontes)
  js/data.js            dados estáticos: cenários, ranking simulado, itens da loja, badges
  js/gamification.js    estado do usuário e persistência em localStorage
  js/camera.js          acesso à câmera e heurística de análise de cenário
  js/app.js             roteamento da SPA e lógica de interface
  package.json          script de build do Tailwind CLI
```

## Limitações conhecidas

- A detecção de cenário erra com alguma frequência em cenas ambíguas. Isso é uma limitação inerente à abordagem heurística, não um defeito de implementação, sem bibliotecas de visão computacional, não há como eliminar completamente esse tipo de erro.
- O ranking, os perfis de outros usuários e qualquer forma de interação social são inteiramente simulados.
- O projeto foi testado em Chrome (desktop), Mozillla Firefox (desktop), Safari (iOS) e Chrome (IOS). Outros navegadores não foram verificados.
