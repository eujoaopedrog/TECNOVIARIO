# Tecnoviario

Portal de tecnologia com catálogo local em JSON, pesquisa responsiva, páginas de produto e guias editoriais. O site é estático: não exige banco de dados, credenciais nem serviços pagos para funcionar.

## Adicionar um produto

1. Obtenha uma foto que você tenha autorização para publicar. Otimize-a como JPG ou WebP e coloque o arquivo em `public/products/images/`, por exemplo `ssd-marca-modelo.webp`.
2. Abra `src/data/products.json` e adicione um novo objeto ao array, separando os itens com vírgula:

```json
{
  "name": "SSD Marca Modelo 1 TB",
  "category": "SSDs e armazenamento",
  "brand": "Marca",
  "model": "Modelo 1 TB",
  "description": "Descrição original com informações conferidas na fonte indicada.",
  "image": "/products/images/ssd-marca-modelo.webp",
  "specifications": {
    "Capacidade": "1 TB",
    "Interface": "NVMe PCIe 4.0"
  },
  "keywords": ["ssd", "nvme", "1 tb"],
  "dataSource": "Especificações confirmadas na página oficial do fabricante em 2026-10-16",
  "isDemo": false
}
```

3. Salve. `id` e `slug` são gerados a partir do nome se forem omitidos. `brand`, `model`, `description`, `specifications` e `keywords` também podem ser omitidos.
4. Execute `npm.cmd run dev`, abra o endereço local informado e procure o produto. Quando estiver pronto, use `npm.cmd run build` e publique a alteração pelo GitHub/Cloudflare Pages.

Use nomes de arquivo simples, sem espaços, como `ssd-marca-modelo.webp`. O caminho de `image` precisa começar com `/products/images/`. Se a foto não estiver nessa pasta ou o caminho estiver incorreto, o site mostra o placeholder. Imagens locais aparecem nos cartões e na página de detalhes.

### Dados comerciais

- Não cadastre preço até confirmar que é correto, atual e permitido pela fonte. Preço é opcional; se informado, use o valor numérico em reais, por exemplo `"price": 499.9`.
- Só preencha `priceUpdatedAt` com uma data/hora ISO 8601 comprovável, incluindo fuso horário, por exemplo `"2026-10-16T19:00:00-03:00"`. O site só mostra preços com data válida e menor que 24 horas; preços mais antigos ficam ocultos.
- `affiliateUrl` deve conter um link válido e autorizado para aquele produto. Sem ele, o botão de compra não é habilitado.
- Use `dataSource` para registrar onde e quando verificou as informações. Não invente avaliações, especificações, ofertas ou estoque.
- O catálogo inicial tem 21 exemplos fictícios, marcados com `"isDemo": true`. Mantenha esse marcador apenas nos exemplos e remova-os do catálogo quando substituí-los por dados reais.

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
- Filtros por categoria e marca; ordenação por nome.
- Detalhes de produto, páginas de guias e páginas institucionais.
- Sem scraping, cadastro de usuário, carrinho, pagamento ou API de afiliados.
- O catálogo de demonstração não possui preços nem links comerciais reais.

Valide a compatibilidade e os direitos de uso das informações antes de publicar cada item. Esta documentação não substitui as políticas e os termos atualizados da Amazon ou dos titulares das imagens.
