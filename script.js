const API_URL = "https://pokeapi.co/api/v2";
const PAGE_SIZE = 12;

// Elementos da interface usados para busca, resultados e mensagens de estado.
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const searchButton = searchForm.querySelector("button");
const grid = document.querySelector("#pokemon-grid");
const statusMessage = document.querySelector("#status-message");
const collectionTitle = document.querySelector("#collection-title");
const collectionCount = document.querySelector("#collection-count");
const loadMoreButton = document.querySelector("#load-more-button");
const resetButton = document.querySelector("#reset-button");

let offset = 0;
let totalPokemon = 0;
let isLoading = false;

// Exibe mensagens informativas e diferencia visualmente os erros.
function setStatus(message, kind = "info") {
  statusMessage.textContent = message;
  statusMessage.dataset.kind = kind;
}

// Evita requisições simultâneas e informa o estado de carregamento à interface.
function setLoading(loading) {
  isLoading = loading;
  grid.setAttribute("aria-busy", String(loading));
  loadMoreButton.disabled = loading;
  searchButton.disabled = loading;
  loadMoreButton.textContent = loading ? "Carregando..." : "Carregar mais Pokémon";
}

// Faz uma requisição à PokéAPI e transforma respostas HTTP malsucedidas em erros.
async function fetchPokemon(path) {
  const response = await fetch(`${API_URL}${path}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Nenhum Pokémon foi encontrado com esse nome ou número.");
    }
    throw new Error(`A PokéAPI respondeu com o erro ${response.status}. Tente novamente.`);
  }

  return response.json();
}

// Monta um cartão com os dados detalhados retornados pela API.
function createPokemonCard(pokemon) {
  const card = document.createElement("article");
  card.className = "pokemon-card";

  const art = document.createElement("div");
  art.className = "pokemon-art";

  const image = document.createElement("img");
  // Prefere a arte oficial e usa a imagem padrão como alternativa.
  const imageUrl = pokemon.sprites.other?.["official-artwork"]?.front_default
    || pokemon.sprites.front_default
    || null;
  image.alt = imageUrl ? `Imagem de ${pokemon.name}` : "";
  image.loading = "lazy";
  if (imageUrl) {
    image.src = imageUrl;
  } else {
    image.hidden = true;
    art.setAttribute("aria-hidden", "true");
  }
  art.append(image);

  const info = document.createElement("div");
  info.className = "pokemon-info";

  const number = document.createElement("p");
  number.className = "pokemon-number";
  number.textContent = `#${String(pokemon.id).padStart(3, "0")}`;

  const name = document.createElement("h3");
  name.className = "pokemon-name";
  name.textContent = pokemon.name;

  const meta = document.createElement("div");
  meta.className = "pokemon-meta";

  const types = document.createElement("div");
  types.className = "type-list";
  types.setAttribute("aria-label", "Tipos");
  pokemon.types.forEach(({ type }) => {
    const badge = document.createElement("span");
    badge.className = "type-badge";
    badge.textContent = type.name;
    types.append(badge);
  });

  const height = document.createElement("span");
  // A API informa a altura em decímetros; convertemos para metros para exibição.
  height.textContent = `${(pokemon.height / 10).toFixed(1)} m`;
  meta.append(types, height);
  info.append(number, name, meta);
  card.append(art, info);
  return card;
}

// Carrega uma página da lista e consulta os detalhes de cada Pokémon em paralelo.
async function loadPage({ append = false } = {}) {
  if (isLoading) return;

  setLoading(true);
  setStatus("Buscando Pokémon na PokéAPI...");

  try {
    // O endpoint de listagem fornece nomes e URLs; o endpoint individual traz os detalhes.
    const page = await fetchPokemon(`/pokemon?limit=${PAGE_SIZE}&offset=${offset}`);
    const pokemon = await Promise.all(
      page.results.map(({ name }) => fetchPokemon(`/pokemon/${encodeURIComponent(name)}`)),
    );

    if (!append) grid.replaceChildren();
    pokemon.forEach((item) => grid.append(createPokemonCard(item)));

    // Só avança o offset depois de todas as requisições da página terem sucesso.
    offset += page.results.length;
    totalPokemon = page.count;
    collectionTitle.childNodes[0].textContent = "Pokémon ";
    collectionCount.textContent = `(${grid.childElementCount})`;
    loadMoreButton.hidden = offset >= totalPokemon;
    resetButton.hidden = true;
    setStatus(append ? "Mais Pokémon adicionados à coleção." : "");
  } catch (error) {
    setStatus(error.message || "Não foi possível carregar os Pokémon. Verifique sua conexão e tente novamente.", "error");
  } finally {
    setLoading(false);
  }
}

// Busca um Pokémon pelo nome ou número da Pokédex.
async function searchPokemon(query) {
  if (isLoading) return;

  setLoading(true);
  setStatus(`Buscando "${query}" na PokéAPI...`);

  try {
    const pokemon = await fetchPokemon(`/pokemon/${encodeURIComponent(query.toLowerCase())}`);
    grid.replaceChildren(createPokemonCard(pokemon));
    collectionTitle.childNodes[0].textContent = "Resultado da busca ";
    collectionCount.textContent = "";
    loadMoreButton.hidden = true;
    resetButton.hidden = false;
    setStatus(`Pokémon encontrado: ${pokemon.name}.`);
  } catch (error) {
    setStatus(error.message || "Não foi possível concluir a busca. Verifique sua conexão e tente novamente.", "error");
  } finally {
    setLoading(false);
  }
}

// Intercepta o envio do formulário para pesquisar sem recarregar a página.
searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const query = searchInput.value.trim();
  if (query) searchPokemon(query);
});

// Solicita a próxima página de resultados ao clicar no botão.
loadMoreButton.addEventListener("click", () => loadPage({ append: true }));

// Limpa a busca e reinicia a coleção desde a primeira página.
resetButton.addEventListener("click", () => {
  searchInput.value = "";
  offset = 0;
  totalPokemon = 0;
  loadPage();
});

// Carrega a primeira página assim que o script é executado.
loadPage();