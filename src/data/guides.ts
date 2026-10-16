export interface GuideSection {
  heading: string
  paragraphs: string[]
  bullets?: string[]
}

export interface Guide {
  slug: string
  title: string
  summary: string
  readTime: string
  category: string
  intro: string
  sections: GuideSection[]
}

export const guides: Guide[] = [
  {
    slug: 'como-escolher-ssd',
    title: 'Como escolher um SSD para um PC antigo',
    summary: 'Entenda conexões, formatos e compatibilidade antes de trocar o armazenamento do computador.',
    readTime: '6 min de leitura',
    category: 'Armazenamento',
    intro: 'Um SSD pode tornar tarefas cotidianas mais responsivas em um computador antigo, mas a escolha correta depende das conexões disponíveis e do uso que você pretende fazer. Antes de comprar, confirme o que a placa-mãe e o gabinete aceitam.',
    sections: [
      {
        heading: 'Confira primeiro as conexões disponíveis',
        paragraphs: [
          'A opção mais comum para computadores mais antigos é um SSD SATA de 2,5 polegadas. Ele usa uma conexão de dados SATA e recebe alimentação da fonte. Muitos desktops e notebooks que antes usavam HD já têm o espaço e os cabos necessários, mas vale verificar o manual do equipamento.',
          'Unidades M.2 podem usar SATA ou NVMe, e o encaixe físico por si só não garante compatibilidade. Consulte o manual da placa-mãe ou do notebook para saber quais protocolos e comprimentos de unidade são aceitos.'
        ]
      },
      {
        heading: 'Escolha a capacidade pelo seu uso',
        paragraphs: ['Considere o espaço ocupado pelo sistema, pelos aplicativos e pelos arquivos que você quer manter no disco. Reserve também uma margem livre para atualizações e novos dados; um disco quase cheio deixa pouco espaço para crescimento.'],
        bullets: ['Uso básico e documentos: avalie a capacidade necessária para o sistema e seus programas.', 'Bibliotecas de jogos e mídia: some o espaço atualmente ocupado e o crescimento esperado.', 'Migração de HD: confira o espaço usado antes de escolher a capacidade do novo disco.']
      },
      {
        heading: 'Planeje a instalação e a migração',
        paragraphs: [
          'Faça uma cópia de segurança dos arquivos importantes antes de qualquer troca. A instalação pode ser limpa, reinstalando o sistema, ou feita por clonagem com ferramentas apropriadas; a clonagem exige que a unidade de destino tenha espaço suficiente.',
          'Em notebooks, confirme as dimensões, a posição do conector e as instruções do fabricante. Se não tiver segurança para abrir o equipamento, procure assistência técnica.'
        ]
      },
      {
        heading: 'Compare especificações sem se prender a um único número',
        paragraphs: ['Velocidade sequencial anunciada não representa todas as tarefas do dia a dia. Para comparar modelos, verifique interface, garantia, resistência declarada pelo fabricante e condições de suporte. Não confunda um valor máximo de benchmark com uma promessa de desempenho em qualquer computador.']
      }
    ]
  },
  {
    slug: 'memoria-8-ou-16-gb',
    title: '8 GB ou 16 GB de RAM: como decidir?',
    summary: 'Uma forma prática de avaliar memória para estudo, trabalho, jogos e multitarefa.',
    readTime: '5 min de leitura',
    category: 'Memória',
    intro: 'A quantidade adequada de memória depende dos programas usados ao mesmo tempo e da possibilidade de upgrade do computador. Em vez de escolher um número por hábito, observe o equipamento atual, a carga de trabalho e a compatibilidade.',
    sections: [
      {
        heading: 'Observe o seu uso real',
        paragraphs: ['Navegação leve, edição de documentos e poucas aplicações abertas podem caber em configurações mais modestas. Muitas abas, reuniões com vídeo, ferramentas criativas e jogos tendem a disputar memória com o sistema e entre si.'],
        bullets: ['Anote os aplicativos que usa juntos, não apenas um programa isolado.', 'Confira o uso de memória no gerenciador de tarefas durante um dia normal.', 'Se o sistema usa armazenamento como memória virtual com frequência, investigue a causa antes de comprar.']
      },
      {
        heading: 'Verifique a compatibilidade antes da compra',
        paragraphs: ['Confirme o padrão suportado (DDR4 ou DDR5, por exemplo), a capacidade máxima, o formato físico e os slots disponíveis no manual do computador. Módulos de padrões diferentes não são intercambiáveis. Em notebooks, a memória pode ser soldada ou ter limites próprios.']
      },
      {
        heading: 'Considere os canais e o caminho de upgrade',
        paragraphs: ['Dois módulos compatíveis podem habilitar operação em dois canais em plataformas que suportam esse recurso. Isso não significa que qualquer kit seja melhor: confirme a configuração recomendada e a capacidade por slot. Se pretende ampliar depois, avalie quantos slots ficarão ocupados e o custo de substituir módulos.']
      },
      {
        heading: 'Decida pelo equilíbrio do conjunto',
        paragraphs: ['Mais memória não corrige todo gargalo. Um computador também depende do processador, do armazenamento, da placa gráfica e dos programas utilizados. Compare o custo do upgrade com o benefício esperado para as tarefas que realmente importam para você.']
      }
    ]
  },
  {
    slug: 'escolher-teclado-mecanico',
    title: 'Como escolher um teclado mecânico',
    summary: 'Layout, tamanho, switches e conexão: os pontos que mais impactam a escolha.',
    readTime: '4 min de leitura',
    category: 'Periféricos',
    intro: 'Teclados mecânicos variam em tamanho, sensação ao digitar e recursos. Defina primeiro onde e como vai usar o teclado; só então compare características específicas.',
    sections: [
      { heading: 'Comece pelo layout', paragraphs: ['No Brasil, o layout ABNT2 inclui a tecla Ç e posições de teclas adequadas ao português. Confirme o layout físico e o idioma configurado no sistema para evitar diferenças entre as teclas impressas e os caracteres digitados.'] },
      { heading: 'Escolha o tamanho pelas suas tarefas', paragraphs: ['Modelos completos incluem teclado numérico. Formatos compactos liberam espaço para o mouse, mas podem exigir combinações de teclas para funções que ficam dedicadas nos modelos maiores.'] },
      { heading: 'Entenda o tipo de switch', paragraphs: ['O mecanismo influencia força, curso e ruído, mas a sensação é pessoal e pode variar entre fabricantes. Se possível, teste o teclado ou um demonstrador antes de decidir. Verifique também se o modelo permite troca de switches e quais peças são compatíveis.'] },
      { heading: 'Confira conexão e manutenção', paragraphs: ['Teclados com fio evitam recarga e emparelhamento; modelos sem fio podem ser mais flexíveis. Verifique compatibilidade com seu dispositivo, garantia, possibilidade de limpeza e disponibilidade de keycaps no layout desejado.'] }
    ]
  },
  {
    slug: 'como-escolher-mouse-gamer',
    title: 'Como escolher um mouse gamer',
    summary: 'Formato, tamanho, sensor e conexão importam mais do que um número isolado de DPI.',
    readTime: '5 min de leitura',
    category: 'Periféricos',
    intro: 'Um mouse confortável e previsível depende do encaixe na mão, da forma de uso e da superfície. Números de marketing não substituem ergonomia nem compatibilidade com sua rotina.',
    sections: [
      {
        heading: 'Priorize formato e conforto',
        paragraphs: ['Compare o comprimento e a largura do mouse com sua mão e com a forma como segura o dispositivo. Pegada palm, claw e fingertip distribuem o contato de maneiras diferentes; não existe um formato universalmente ideal. Peso e posição dos botões laterais também podem mudar a sensação de uso.']
      },
      {
        heading: 'Leia o sensor com contexto',
        paragraphs: ['DPI indica sensibilidade configurável, não qualidade total do sensor. Considere também consistência de rastreamento, aceleração indesejada e facilidade para ajustar a sensibilidade. Uma resolução máxima muito alta pode não oferecer benefício para o seu uso.']
      },
      {
        heading: 'Escolha conexão e recursos necessários',
        paragraphs: ['Um modelo com fio não precisa ser carregado; um sem fio dá liberdade de movimento, mas depende de bateria e de um receptor ou conexão compatível. Confira sistema operacional, software necessário, quantidade de botões, garantia e possibilidade de usar o dispositivo sem instalar um aplicativo proprietário.']
      },
      {
        heading: 'Teste em sua superfície',
        paragraphs: ['O mousepad e a mesa podem alterar o deslizamento e a leitura do sensor. Se possível, experimente o mouse por alguns minutos com a superfície que já utiliza. Avaliações de terceiros podem complementar a pesquisa, mas não substituem o teste de encaixe na sua mão.']
      }
    ]
  },
  {
    slug: 'monitor-24-ou-27-polegadas',
    title: 'Monitor de 24 ou 27 polegadas?',
    summary: 'Compare resolução, distância de visualização, espaço na mesa e conexões.',
    readTime: '5 min de leitura',
    category: 'Monitores',
    intro: 'O tamanho da tela é apenas uma parte da escolha. Área disponível, resolução, distância de uso e capacidade gráfica do computador precisam funcionar em conjunto.',
    sections: [
      {
        heading: 'Meça a mesa e a distância de uso',
        paragraphs: ['Confira a largura e a profundidade disponíveis, incluindo a base do monitor, e estime a distância em que você costuma sentar. Uma tela maior ocupa mais campo de visão e pode exigir reposicionamento do teclado ou do próprio monitor. Verifique também compatibilidade com suporte VESA, se for usar um braço articulado.']
      },
      {
        heading: 'Relacione tamanho e resolução',
        paragraphs: ['Uma resolução maior em uma tela física semelhante exibe mais detalhes, mas texto e ícones podem parecer menores sem ajuste de escala. Em 27 polegadas, muita gente considera QHD; em 24 polegadas, Full HD é comum. São referências, não regras: compare densidade de pixels, escala do sistema e sua distância de visualização.']
      },
      {
        heading: 'Confirme a capacidade do computador',
        paragraphs: ['A resolução e a frequência escolhidas influenciam a carga sobre a placa gráfica, especialmente em jogos. Confirme se as saídas de vídeo do computador e os cabos suportam a resolução e a frequência pretendidas. O resultado também depende do aplicativo e das configurações usadas.']
      },
      {
        heading: 'Compare recursos que você realmente usará',
        paragraphs: ['Verifique ajustes de altura e inclinação, entradas de vídeo, garantia, política de pixels defeituosos e a ergonomia do suporte. Taxas de atualização maiores podem ser úteis em cenários específicos, mas só fazem diferença quando o equipamento consegue produzir conteúdo compatível.']
      }
    ]
  },
  {
    slug: 'como-escolher-fonte-para-pc',
    title: 'Como escolher uma fonte para PC',
    summary: 'Dimensionamento, conectores, eficiência e proteção: os cuidados antes de montar ou atualizar.',
    readTime: '6 min de leitura',
    category: 'Componentes',
    intro: 'A fonte precisa alimentar os componentes com os conectores corretos e operar dentro dos limites recomendados. Potência nominal, sozinha, não descreve qualidade ou compatibilidade.',
    sections: [
      {
        heading: 'Some o consumo do conjunto com margem razoável',
        paragraphs: ['Consulte as recomendações e estimativas dos fabricantes da placa gráfica e do processador, considerando o sistema inteiro e os picos de consumo. Calculadoras de potência podem ajudar a estimar, mas dependem de dados e premissas; evite escolher uma potência baseada apenas em uma lista genérica.']
      },
      {
        heading: 'Confira conectores e dimensões',
        paragraphs: ['Compare os conectores de alimentação exigidos pela placa-mãe e pela placa de vídeo com os cabos fornecidos. Confirme o formato da fonte aceito pelo gabinete, o comprimento disponível e o espaço para organizar os cabos. Não use adaptadores sem entender os limites elétricos e a orientação do fabricante.']
      },
      {
        heading: 'Entenda eficiência e certificações',
        paragraphs: ['Eficiência mede quanto da energia consumida chega ao sistema, e certificações indicam desempenho sob condições definidas. Elas não garantem, isoladamente, todos os aspectos de projeto, proteção ou durabilidade. Pesquise o modelo e a revisão exatos, além de testes independentes confiáveis.']
      },
      {
        heading: 'Verifique garantia e procedência',
        paragraphs: ['Procure especificações completas, garantia clara, suporte local e vendedor confiável. Desconfie de promessas técnicas sem documentação. Como a fonte se conecta a vários componentes, se não tiver experiência em instalação, peça ajuda a uma pessoa qualificada.']
      }
    ]
  },
  {
    slug: 'headset-usb-ou-p2',
    title: 'Headset USB ou P2: qual conexão escolher?',
    summary: 'Entenda compatibilidade, controles e características de áudio antes de decidir.',
    readTime: '4 min de leitura',
    category: 'Áudio',
    intro: 'USB e P2 descrevem conexões diferentes, cada uma com vantagens práticas e limitações de compatibilidade. A escolha começa nos dispositivos em que você pretende usar o headset.',
    sections: [
      {
        heading: 'USB inclui processamento no próprio headset',
        paragraphs: ['Headsets USB normalmente apresentam áudio digital e conversão feita no dispositivo ou em um adaptador. Podem oferecer controles e recursos de software, mas dependem de uma porta compatível e, em alguns casos, de um driver ou aplicativo. Confirme se funcionam nos consoles e sistemas que você utiliza.']
      },
      {
        heading: 'P2 pode ser simples, mas confira as entradas',
        paragraphs: ['O conector analógico de 3,5 mm é comum em computadores, controles e celulares, mas muitos aparelhos usam uma entrada combinada para fone e microfone. Computadores com conectores separados podem exigir um divisor. Verifique o tipo de plugue e a documentação do dispositivo antes de comprar.']
      },
      {
        heading: 'Não escolha apenas pelo conector',
        paragraphs: ['Conforto, peso, qualidade do microfone, isolamento, controles e facilidade de reposição das almofadas também influenciam o uso. Descrições como “som surround” podem depender de processamento e software; procure demonstrações ou medições independentes, sem tratar termos promocionais como garantia de desempenho.']
      },
      {
        heading: 'Considere onde será usado',
        paragraphs: ['Para alternar entre aparelhos, confira se o headset acompanha adaptadores adequados e se os controles continuam funcionando em cada plataforma. Se pretende usá-lo para reuniões, valide se o microfone é reconhecido e se o sistema permite ajustar entrada e saída separadamente.']
      }
    ]
  },
  {
    slug: 'verificar-compatibilidade-placa-de-video',
    title: 'Como verificar a compatibilidade de uma placa de vídeo',
    summary: 'Cheque espaço físico, fonte, slot e conexões de vídeo antes de instalar uma GPU.',
    readTime: '6 min de leitura',
    category: 'Placas de vídeo',
    intro: 'Uma placa de vídeo pode encaixar no slot e ainda assim não caber no gabinete ou receber alimentação adequada. Faça uma checagem do sistema completo antes de escolher uma peça.',
    sections: [
      {
        heading: 'Meça o espaço dentro do gabinete',
        paragraphs: ['Consulte o comprimento, a altura e a espessura da placa no manual do fabricante e compare com as dimensões livres no gabinete. Leve em conta ventoinhas frontais, radiadores, baias e espaço para circulação de ar. Placas com vários slots podem bloquear conectores de expansão vizinhos.']
      },
      {
        heading: 'Verifique slot e fonte',
        paragraphs: ['Confirme a presença de um slot PCI Express adequado e a recomendação de fonte para o modelo exato. Confira potência, conectores de alimentação e espaço para conectar os cabos sem dobrá-los de forma imprópria. Não se baseie apenas na potência escrita na etiqueta da fonte.']
      },
      {
        heading: 'Confira monitor, saídas e sistema',
        paragraphs: ['Compare as saídas disponíveis na placa com as entradas do monitor e a versão dos cabos necessária. Verifique suporte de drivers para seu sistema operacional e se o processador e a placa-mãe atendem aos requisitos do uso planejado. Compatibilidade física não garante desempenho equilibrado em todos os programas.']
      },
      {
        heading: 'Planeje a instalação com segurança',
        paragraphs: ['Leia as instruções do fabricante, desligue o computador e desconecte a alimentação antes de abrir o gabinete. Se não tiver prática para instalar ou identificar os cabos, procure assistência qualificada. Preserve a garantia e evite forçar conectores.']
      }
    ]
  },
  {
    slug: 'upgrades-para-pc-antigo',
    title: 'Upgrades que podem melhorar um PC antigo',
    summary: 'Descubra como identificar o gargalo e priorizar melhorias úteis sem trocar peças por impulso.',
    readTime: '6 min de leitura',
    category: 'Upgrades',
    intro: 'Um computador lento pode ter causas diferentes: armazenamento cheio, pouca memória para a rotina, temperatura elevada, software pesado ou limitações de processamento. Identificar o problema primeiro evita gastar em uma peça que não resolve a sua necessidade.',
    sections: [
      {
        heading: 'Observe o que está limitando o uso',
        paragraphs: ['Anote em quais tarefas o computador fica lento e observe o uso de processador, memória, disco e temperatura durante essas tarefas. Uma medição pontual não conta a história toda, mas pode apontar onde investigar. Verifique também espaço livre, atualizações e programas iniciados com o sistema.']
      },
      {
        heading: 'Avalie armazenamento e memória',
        paragraphs: ['Em um computador ainda com HD, um SSD compatível pode tornar a inicialização e a abertura de arquivos mais responsivas. Memória adicional pode ajudar quando o uso simultâneo de aplicativos excede a capacidade atual. Nos dois casos, confirme interface, formato, padrão e limites do equipamento.']
      },
      {
        heading: 'Confira limites de plataforma e custo total',
        paragraphs: ['Verifique processadores suportados pela placa-mãe, atualizações de BIOS necessárias, compatibilidade de memória, capacidade da fonte e espaço do gabinete. Some o custo das peças, da instalação e de eventuais componentes associados. Às vezes, uma plataforma nova oferece caminho de upgrade melhor; compare o conjunto, não só uma peça.']
      },
      {
        heading: 'Faça backup e mude uma variável por vez',
        paragraphs: ['Antes de instalar peças ou reinstalar o sistema, proteja arquivos importantes. Sempre que possível, faça uma alteração por vez e teste o resultado. Isso facilita identificar a causa de problemas e verificar se a melhoria realmente ajudou no uso que motivou o upgrade.']
      }
    ]
  },
  {
    slug: 'planejar-setup-gamer-de-entrada',
    title: 'Como planejar um setup gamer de entrada',
    summary: 'Defina orçamento e prioridades considerando computador, monitor, periféricos e upgrades futuros.',
    readTime: '7 min de leitura',
    category: 'PC gamer',
    intro: 'Um setup de entrada não precisa começar com o componente mais caro. Primeiro defina os jogos, a resolução desejada e o orçamento total; depois distribua esse orçamento pelo conjunto que será usado todos os dias.',
    sections: [
      {
        heading: 'Defina metas realistas para os jogos',
        paragraphs: ['Liste os títulos que pretende jogar, a resolução do monitor e os ajustes gráficos que considera aceitáveis. Requisitos mínimos e recomendados dos jogos ajudam a estabelecer uma referência, mas não garantem uma taxa de quadros específica em qualquer configuração. Consulte testes independentes da combinação de componentes.']
      },
      {
        heading: 'Reserve o orçamento para o conjunto',
        paragraphs: ['Inclua monitor, teclado, mouse, headset, sistema operacional quando aplicável, armazenamento e eventuais custos de montagem. Escolher uma placa gráfica sem considerar a tela ou comprar todo o orçamento em periféricos pode deixar o computador desequilibrado. Separe também uma reserva para imprevistos.']
      },
      {
        heading: 'Priorize uma base compatível e segura',
        paragraphs: ['Confirme compatibilidade entre processador, placa-mãe, memória e gabinete. Dimensione a fonte a partir dos requisitos dos componentes e de documentação confiável, sem economizar em procedência. Um SSD com capacidade adequada e memória suficiente para os jogos e programas planejados contribuem para uma experiência consistente.']
      },
      {
        heading: 'Pense em evolução sem comprar por especulação',
        paragraphs: ['Escolha uma plataforma com caminhos de upgrade que façam sentido para seu horizonte e orçamento, mas não pague muito mais por recursos que talvez nunca use. Compare o custo de montar agora com a possibilidade de comprar peças gradualmente, verificando preços e compatibilidade no momento real da compra.']
      }
    ]
  }
]
