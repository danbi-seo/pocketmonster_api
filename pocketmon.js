const apiPocketmon = 'https://pokeapi.co/api/v2/pokemon/';
const apiPocketmonSpecies = 'https://pokeapi.co/api/v2/pokemon-species/';

const startPage = document.querySelector('.first-display');
const secondPage = document.querySelector('.second-display');

const startButton = document.querySelector('.start-btn');
const evolutionButton = document.querySelector('.evolution');
const rerollButton = document.querySelector('.reroll');

const $monsterName = document.querySelector('.monster-name');
const $monsterImg = document.querySelector('.monster-img');
const $monsterNumber = document.querySelector('.monster-number');
const $monsterType = document.querySelector('.monster-type');
const $monsterStats = document.querySelector('.monster-stats');
const $monsterHeight = document.querySelector('.monster-height');   
const $monsterWeight = document.querySelector('.monster-weight');   
const $monsterText = document.querySelector('.monster-text');
const $monsterSkill = document.querySelector('.monster-skill');


const typeTranslations = {
    'normal': '노말타입',
    'fire': '불타입',
    'water': '물타입',
    'grass': '풀타입',
    'electric': '전기타입',
    'ice': '얼음타입',
    'fighting': '격투타입',
    'poison': '독타입',
    'ground': '땅타입',
    'flying': '비행타입',
    'psychic': '에스퍼타입',
    'bug': '벌레타입',
    'rock': '바위타입',
    'ghost': '고스트타입',
    'dragon': '드래곤타입',
    'steel': '강철타입',
    'dark': '악타입',
    'fairy': '페어리타입'
};

const statTranslations = {
    'hp': 'HP',
    'attack': '공격',
    'defense': '방어',
    'special-attack': '특수공격',
    'special-defense': '특수방어',
    'speed': '스피드'
};


// JSON 데이터 가져오기 함수
async function fetchJson(url) {
    const response = await fetch(url);
    return response.json();
}

// 한글로 가져오기
function getKoreanName(namesArray, fallbackName) {
    const koreanEntry = namesArray?.find(name => name.language.name === 'ko');
    return koreanEntry ? koreanEntry.name : fallbackName.replace(/-/g, ' ').toUpperCase();
}

// 줄바꿈 처리
const lineChange = (text, charsPerLine) => {
    let result = '';
    let currentLineLength = 0;

    if(currentLineLength >= charsPerLine && i < text.length -1){
        result += '<br>';
        currentLineLength = 0;
    }
    return result;
};


// 포켓몬 기본 정보
function updatePokemonBasicInfo(pokemonData, speciesData) {
    const displayPokemonName = getKoreanName(speciesData.names, pokemonData.name);
    const imageUrl = pokemonData.sprites?.front_default;

    $monsterNumber.textContent = `#${String(pokemonData.id).padStart(3, '0')}`;
    $monsterName.textContent = displayPokemonName;

    $monsterImg.src = imageUrl || '';
    $monsterImg.alt = displayPokemonName || '이미지 없음';

    $monsterHeight.textContent = `키 : ${pokemonData.height / 10}m`;
    $monsterWeight.textContent = `몸무게 : ${pokemonData.weight / 10}kg`;

    $monsterType.textContent = pokemonData.types?.length > 0
        ? pokemonData.types.map(typeInfo => typeTranslations[typeInfo.type.name] || typeInfo.type.name.toUpperCase()).join(', ')
        : '타입 정보 없음';

    const koreanFlavorText = speciesData.flavor_text_entries?.find(entry => entry.language.name === 'ko')?.flavor_text;
    $monsterText.innerHTML = koreanFlavorText
        ? lineChange(koreanFlavorText.replace(/[\n\f]/g, ' '), 25)
        : '도감 설명 없음.';
}

// 포켓몬 스탯
function getTranslatedStatName(statTranslations, statInfo) {
    if(statTranslations[statInfo.stat.name] !== undefined) {
        return statTranslations[statInfo.stat.name];
    }
    return statInfo.stat.name.toUpperCase();
}

function updatePokemonStats(pokemonData) {
    $monsterStats.innerHTML = pokemonData.stats?.length > 0
        ? pokemonData.stats.map(statInfo => {
            const translatedStatName = statTranslations[statInfo.stat.name] || statInfo.stat.name.toUpperCase();
            return `<div>${translatedStatName} : ${statInfo.base_stat}</div>`;
        }).join('')
        : '<p>스탯 정보 없음</p>';
}


// 포켓몬 특성
async function updatePokemonSkills(pokemonData) {
    $monsterSkill.innerHTML = '';

    let abilitiesList = [];
    for (const abilityInfo of (pokemonData.abilities || [])) {
        const abilityData = await fetchJson(abilityInfo.ability.url);
        const abilityName = getKoreanName(abilityData.names, abilityInfo.ability.name);
        abilitiesList.push(abilityName);
    }
    const joinedAbilities = abilitiesList.join(' / ');
    $monsterSkill.textContent = joinedAbilities ? `특성 : ${joinedAbilities}` : `특성 없음`;
}


// 랜덤 포켓몬 정보
async function loadPokemon(id = null) {
    let pokemonId;
    if(id) {
        pokemonId = id;
    } else {
        pokemonId = Math.floor(Math.random() * 1000 )+ 1;
    }
    const pokemonApiUrl = `${apiPocketmon}${pokemonId}/`;
    const speciesApiUrl = `${apiPocketmonSpecies}${pokemonId}/`;

    try {
        const pokemonData = await fetchJson(pokemonApiUrl);
        const speciesData = await fetchJson(speciesApiUrl);

        updatePokemonBasicInfo(pokemonData, speciesData);
        updatePokemonStats(pokemonData);
        await updatePokemonSkills(pokemonData)
    } catch (error){
        console.log(`포켓몬 정보 업데이트 오류`, error);
    }
}
// async function randomPocketmon() {
//     const randomId = Math.floor(Math.random() * 1000) + 1;
//     const pokemonApiUrl = `${apiPocketmon}${randomId}/`;
//     const speciesApiUrl = `${apiPocketmonSpecies}${randomId}/`;

//     try {
//         const pokemonData = await fetchJson(pokemonApiUrl);
//         const speciesData = await fetchJson(speciesApiUrl);

//         updatePokemonBasicInfo(pokemonData, speciesData);
//         updatePokemonStats(pokemonData);
//         await updatePokemonSkills(pokemonData); 
//     } catch (error) {
//         console.error("포켓몬 정보 오류", error);
//     }
// }


// 진화 체인 안에서 현재 포켓몬의 다음 진화 단계 URL 찾기
function findDirectNextEvolutionSpeciesUrls(chainNode, currentSpeciesName) {
    let nextEvolutionUrls = [];
    let foundCurrent = false;
    
    const traverse = (node) => {
        // if (!node) return;

        if (node.species.name === currentSpeciesName) {
            node.evolves_to?.forEach(nextEvo => {
                nextEvolutionUrls.push(nextEvo.species.url);
        });
            return true;
        }

        // 현재 노드가 찾는 포켓몬이 아니ㄹ면, 자식 노드를 재귀로 탐색
        if (node.evolves_to) {
            for (const nextEvoChild of node.evolves_to) {
                if (traverse(nextEvoChild)) {
                    return true; // 자식 브랜치에서 찾았다면 더 이상 탐색하지 않음
                }
            }
        }
        return false; // 이 브랜치에서 찾지 못함
    };
    //     if (foundCurrent) {
    //         node.evolves_to?.forEach(nextEvo => {
    //             nextEvolutionUrls.push(nextEvo.species.url);
    //             traverseAndCollect(nextEvo); // 다음 진화의 진화도 있는지 계속 탐색
    //         });
    //     } else {
    //         node.evolves_to?.forEach(nextEvo => traverseAndCollect(nextEvo));
    //     }
    // };
    traverse(chainNode); // 진화 체인 탐색 시작
    return nextEvolutionUrls;
    // findNodeAndDirectEvolutions(chainNode);
    // return directNextEvoUrls;
};

// 다음 진화 단계
async function getNextEvolutionDetails(nextEvolutionSpeciesUrls) {
    let evolvedPokemonDetails = [];
    for (const speciesUrl of nextEvolutionSpeciesUrls) {
        const evoSpeciesData = await fetchJson(speciesUrl);
        const evoId = speciesUrl.split('/').filter(Boolean).pop();
        const evoPokemonData = await fetchJson(`${apiPocketmon}${evoId}/`);
        const evoName = getKoreanName(evoSpeciesData.names, evoPokemonData.name);
        const evoImageUrl = evoPokemonData.sprites?.front_default;
        evolvedPokemonDetails.push({ name: evoName, imageUrl: evoImageUrl });
    }
    return evolvedPokemonDetails;
}

// 진화 UI 렌더링
function renderEvolutionUI(evolvedPokemonDetails) {
    const $evolutionDisplay = $monsterSkill;
    $evolutionDisplay.innerHTML = ''; 

    evolvedPokemonDetails.forEach(detail => {
        const evoDiv = document.createElement('div');
        detail.imageUrl && (() => {
            const evoImg = document.createElement('img');
            evoImg.src = detail.imageUrl;
            evoImg.alt = detail.name;
            evoDiv.appendChild(evoImg);
        })();
        const evoNameSpan = document.createElement('span');
        evoNameSpan.textContent = detail.name;
        evoDiv.appendChild(evoNameSpan);
        $evolutionDisplay.appendChild(evoDiv);
    });
}

// 포켓몬 진화 정보를 표시
async function displayEvolutions(pokemonId) {
    const $evolutionDisplay = $monsterSkill;
    $evolutionDisplay.innerHTML = '로딩 중...';

    try {
        const speciesData = await fetchJson(`${apiPocketmonSpecies}${pokemonId}/`);
        const evolutionChainUrl = speciesData.evolution_chain?.url;
        // 진화 체인 데이터 가져오기 (URL이 없으면 null)
        const evolutionChainData = evolutionChainUrl && await fetchJson(evolutionChainUrl);
        // 다음 진화 URL 찾기 (진화 체인 데이터가 없으면 빈 배열)
        const nextEvolutionSpeciesUrls = evolutionChainData && findDirectNextEvolutionSpeciesUrls(
            evolutionChainData.chain, speciesData.name) || [];


        if (nextEvolutionSpeciesUrls.length > 0) {
            const firstNextEvolutionUrl = nextEvolutionSpeciesUrls[0];
            const firstEvoId = firstNextEvolutionUrl.split('/').filter(Boolean).pop();
            $evolutionDisplay.textContent = '진화 완료!'; // $monsterSkill 영역에 메시지 표시
            return parseInt(firstEvoId, 10); // 다음 진화체의 ID 반환
        } else {
            $evolutionDisplay.textContent = '더 이상 진화하지 않습니다.'; // $monsterSkill 영역에 메시지 표시
            return null; // 진화체가 없음을 알림
        }

    } catch (error) {
        console.error("진화 정보 오류", error);
    }
}


// 스타트 버튼 이벤트
if (startButton) {
    startButton.addEventListener('click', () => {
        startPage.style.display = 'none'; 
        secondPage.style.display = 'flex';
        loadPokemon(); 
    });
}

// reroll 버튼 이벤트
if (rerollButton) {
    rerollButton.addEventListener('click', () =>{
        loadPokemon();
    })
}

// 진화하기 버튼 이벤트
evolutionButton.addEventListener('click', async () => {

    const pokemonIdText = $monsterNumber.textContent.replace('#', '');
    const pokemonId = parseInt(pokemonIdText, 10);
    // 다음진화체의 id 가져오기(없으면 null)
    const nextEvoId = await displayEvolutions(pokemonId);

    if (nextEvoId) {
        await loadPokemon(nextEvoId);
    }
    // nextEvoId가 truthy일 때만 randomPocketmon 호출.
    // nextEvoId && await randomPocketmon(nextEvoId);
});