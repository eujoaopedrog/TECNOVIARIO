# Tecnoviario

Portal estático de achadinhos de hardware, com ofertas da Amazon e do Mercado Livre, catálogo local em JSON, pesquisa, páginas de produto e guias editoriais. Não exige banco de dados, credenciais nem serviços pagos para funcionar.

## Adicionar um produto pela página local

1. Abra o CMD na pasta do projeto e execute `npm.cmd run admin:products`.
2. Deixe essa janela aberta e acesse `http://127.0.0.1:4179` no navegador. A ferramenta funciona somente neste computador e não é publicada no site.
3. Preencha nome e categoria; os outros dados são opcionais. Para preço, use o formato brasileiro, por exemplo `5.939,90` (também aceita `5939,90` e `5,939.90`). Selecione a loja de origem e informe o link correspondente; adicione especificações uma por linha no formato `Campo: valor`.
4. Clique em **Salvar produto**. A ferramenta atualiza `src/data/products.json` e copia a foto escolhida para `public/products/images/`. Ao cadastrar um preço, registra a hora local como data de verificação; isso é uma atualização manual, não uma varredura automática.
5. Confira o produto em `/ofertas` e na página do item. Para publicar, use `npm.cmd run build` e publique as alterações pelo GitHub/Cloudflare Pages. O preço deixa de aparecer depois de 24 horas e precisa ser atualizado com um valor confirmado.

Para encerrar a ferramenta, volte ao CMD e pressione `Ctrl+C`. O método manual de editar `src/data/products.json` continua disponível se necessário.

## Montador de PC e compatibilidade

- Acesse **Montar meu PC** na navegação ou abra `/montar-pc`. O montador lista os componentes existentes, soma somente preços com atualização válida (menos de 24 horas) e reúne os links de oferta dos itens selecionados.
- Componentes essenciais sem cadastro aparecem como pendentes; eles não são inventados nem substituídos por produtos fictícios.
- Para permitir uma checagem de compatibilidade, expanda **Dados técnicos para checar compatibilidade** no cadastro e informe somente dados confirmados pelo fabricante: soquete, padrão DDR, formato da placa/gabinete, interfaces de armazenamento, potência da fonte e mínimo recomendado pela placa de vídeo, além de vídeo integrado do processador quando aplicável.
- As regras comparam soquete CPU/placa-mãe, memória/placa-mãe, formato placa-mãe/gabinete, interface de armazenamento e potência mínima informada para GPU. Dado ausente resulta em **Não verificado**, nunca em aprovação.
- As verificações são parciais, não uma garantia de funcionamento: BIOS, conectores, dimensões físicas, revisão exata e outros requisitos podem não estar cadastrados. Confirme a lista de compatibilidade e os manuais oficiais antes de comprar.
- A página funciona sem serviço de IA externo. Uma IA generativa opcional exigiria escolher e configurar um provedor no servidor; ela não substituiria as regras nem poderia prometer compatibilidade sem erro.

### Dados comerciais

- Não cadastre preço até confirmar que é correto, atual e permitido pela fonte. No formulário, preço é opcional e aceita formato brasileiro (por exemplo `5.939,90`) ou sem separador de milhar (`5939,90`). No JSON, use um número, por exemplo `"price": 5939.90`.
- Use `lastCheckedAt` para a data/hora ISO 8601 em que o preço foi conferido, incluindo fuso horário (por exemplo `"2026-10-16T19:00:00-03:00"`). `priceUpdatedAt` continua aceito para compatibilidade com o catálogo anterior. O site só mostra preços com data válida e menor que 24 horas; preços mais antigos ficam ocultos.
- `affiliateUrl` deve conter um link válido e autorizado para aquele produto. A loja deve corresponder ao domínio do link; sem loja ou link reconhecido, o item não entra na lista de ofertas.
- `originalPrice` só deve ser usado quando o preço anterior estiver confirmado. O site calcula o percentual de desconto a partir de `originalPrice` e `price`; nunca informe um desconto manualmente.
- `available` pode ser `true` ou `false`; deixe o campo ausente se a disponibilidade não tiver sido confirmada. `priceHistory` aceita pontos com data ISO e preço real. Só registre `dealTag` quando houver confirmação que sustente o destaque.
- Use `dataSource` para registrar onde e quando verificou as informações. Não invente avaliações, especificações, ofertas ou estoque.
- Não cadastre produtos, especificações ou links que não correspondam ao item anunciado. Adicione somente produtos reais com dados conferidos.

## Importante sobre fotos da Amazon

**Não baixe, copie nem guarde no seu site a foto principal retirada diretamente da página da Amazon.** As políticas do Programa de Associados Amazon Brasil proíbem armazenar ou colocar em cache Conteúdo de Anúncio de Produtos que seja uma imagem; a política permite guardar o link para essa imagem por até 24 horas. Também não faça scraping da página.

Alternativas:

- Tire sua própria foto do produto, respeitando os direitos aplicáveis.
- Use uma imagem do fabricante ou do titular, desde que tenha autorização para republicá-la.
- Se sua conta tiver aprovação para a Creators API, use os recursos de imagem fornecidos pela API conforme as regras atuais, sem copiar a imagem para `public/products/images/`.

A antiga PA-API foi depreciada. O acesso à Creators API depende da aprovação e dos requisitos atuais da Amazon; consulte a documentação antes de planejar uma integração. Nunca coloque credenciais da API no frontend.

Referências oficiais consultadas em 2026-10-16:

- [Políticas do Programa de Associados Amazon Brasil](https://associados.amazon.com.br/help/operating/policies)
- [Introdução à Creators API](https://affiliate-program.amazon.com/creatorsapi/docs/en-us/introduction)
- [Cadastro na Creators API](https://affiliate-program.amazon.com/creatorsapi/docs/en-us/onboarding/register-for-creators-api)

## Executar localmente

- Node.js 20 ou superior
- npm

No PowerShell do Windows, use `npm.cmd` caso a política de execução bloqueie o comando `npm`.

```powershell
npm.cmd install
npm.cmd run dev
```

Para validar e testar a versão final:

```powershell
npm.cmd run build
npm.cmd run preview
```

## Onde os dados ficam

- Produtos: `src/data/products.json`
- Normalização e validação dos produtos: `src/data/products.ts`
- Pesquisa, ordenação e filtros: `src/services/productService.ts`
- Tipos: `src/types/product.ts`
- Guias editoriais: `src/data/guides.ts`
- Imagens próprias/licenciadas: `public/products/images/`

O serviço valida campos obrigatórios, gera `id` e `slug` quando ausentes, aceita imagens apenas dessa pasta e interrompe o carregamento com uma mensagem clara se houver identificadores ou endereços repetidos.

## Publicar no Cloudflare Pages

1. Crie um repositório GitHub e envie o projeto.
2. No Cloudflare, abra **Workers & Pages** e conecte o repositório a um site Pages.
3. Configure o comando de build para `npm run build` e o diretório de saída para `dist`.
4. Publique; alterações enviadas ao branch conectado iniciam novos deploys.
5. Antes de divulgar, ajuste as URLs de exemplo em `public/sitemap.xml` e `public/robots.txt`, configure um contato real em `/contato` e revise os textos legais para o uso efetivo do site.

## Funcionalidades e limitações desta versão

- Busca local sem API, com sugestões, suporte a teclado e URLs compartilháveis.
- Catálogo de ofertas em `/ofertas`, com filtros em URL e ordenação por relevância, desconto, preço e atualização.
- Detalhes de produto, páginas de guias e páginas institucionais.
- Sem scraping, varredura automática, cadastro de usuário, carrinho, pagamento ou API de afiliados. As datas e o histórico de preços são mantidos manualmente no catálogo local.
- Descontos, histórico e destaques só aparecem quando há dados correspondentes; se não houver histórico, as seções dependentes dele ficam ocultas.
- Os produtos só exibem preços com data de atualização válida e inferior a 24 horas.

Valide a compatibilidade e os direitos de uso das informações antes de publicar cada item. Esta documentação não substitui as políticas e os termos atualizados da Amazon ou dos titulares das imagens.

## Atualização automática de preços

O script `scripts/update-prices.mjs` consulta as lojas e atualiza `price`, `originalPrice`, `available`, `lastCheckedAt` e `priceHistory` em `src/data/products.json`. Se uma consulta falhar, o produto não é alterado (o preço expira sozinho em 24 h; nunca se "renova" um preço sem confirmação).

- **Mercado Livre:** API oficial. Crie um app em https://developers.mercadolivre.com.br e guarde `ML_CLIENT_ID` e `ML_CLIENT_SECRET` como *secrets* do repositório no GitHub (Settings → Secrets and variables → Actions). Se o script não conseguir descobrir o ID do anúncio pelo link curto (`meli.la`), acrescente `"sourceId": "MLB..."` ao produto.
- **KaBuM!:** depois de aprovado no programa de afiliados, cadastre a URL do feed de produtos como *secret* `KABUM_FEED_URL`. Cada produto precisa de `"store": "kabum"` (links de rede de afiliados não revelam a loja) e de `"sourceId"` com o código do item no feed. Se as colunas do feed forem diferentes das padrão, defina a *variable* `KABUM_FEED_COLUMNS`, por exemplo `{"id":"sku","price":"price","originalPrice":"old_price","availability":"availability"}`.
- **Amazon:** sem atualização automática (continua manual) até a Creators API ser aprovada. O script ignora esses produtos.

Comandos: `npm run update:prices` (grava), `node scripts/update-prices.mjs --dry-run` (só mostra o que mudaria) e `npm run test:prices` (testes com dados simulados). O workflow `.github/workflows/update-prices.yml` roda a cada 6 horas, faz o commit do `products.json` e o Cloudflare Pages publica o novo deploy.
