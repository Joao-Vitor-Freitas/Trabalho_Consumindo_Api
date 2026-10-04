# Pokédex — consumo da PokéAPI

Aplicação web simples para explorar Pokémon usando a [PokéAPI v2](https://pokeapi.co/docs/v2). A interface apresenta uma coleção paginada e permite buscar um Pokémon pelo nome ou pelo número da Pokédex.



## Aluno: João Vitor Freitas RM573678

## Como executar

1. Baixe ou clone este repositório.
2. Abra o arquivo `index.html` em um navegador com acesso à internet.

Não é necessário instalar dependências nem configurar uma chave de API. Como a aplicação usa `fetch` e a PokéAPI é pública, os dados são carregados diretamente pelo navegador. Se preferir, sirva os arquivos com uma extensão de servidor local, como Live Server.

## Como funciona o consumo da API

- Na abertura, a aplicação consulta `https://pokeapi.co/api/v2/pokemon?limit=12&offset=0` para obter a primeira página de resultados.
- Para cada nome recebido, consulta `https://pokeapi.co/api/v2/pokemon/{nome}` e exibe a imagem, o número, o nome, os tipos e a altura.
- O botão **Carregar mais Pokémon** busca páginas seguintes, usando `offset` e o total informado pela API.
- O formulário consulta diretamente `/pokemon/{nome-ou-id}`, permitindo buscar, por exemplo, `pikachu` ou `25`. **Ver todos** retorna à coleção.
- A interface informa estados de carregamento, erros de rede e resultados não encontrados. Se uma requisição falhar, a página não avança para o próximo grupo, permitindo tentar novamente.

Os arquivos da aplicação são `index.html` (estrutura), `style.css` (estilos responsivos) e `script.js` (requisições e renderização).
