const apiPocketmon = 'https://pokeapi.co/api/v2/pokemon/';
const apiPocketmonSpecies = 'https://pokeapi.co/api/v2/pokemon-species/';

const startPage = document.querySelector('.first-display');
const secondPage = document.querySelector('.second-display');
const startButton = document.querySelector('.start-btn');
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


async function randomPocketmon() {
    const randomId = Math.floor(Math.random() * 1000) + 1;
    const pokemonApiUrl = `${apiPocketmon}${randomId}/`; 
    const speciesApiUrl = `${apiPocketmonSpecies}${randomId}/`;

    try {
        // 랜덤한 id를 가지고 포켓몬 데이터를 가져오기
        const pokemonResponse = await fetch(pokemonApiUrl);
        if (!pokemonResponse.ok) {
            throw new Error(`포켓몬 기본 데이터 로딩 실패! (상태 코드: ${pokemonResponse.status}, ID: ${randomId})`);
        }
        const pokemonData = await pokemonResponse.json();


        // 포켓몬 종류 데이터 가져오기
        const speciesResponse = await fetch(speciesApiUrl);
        if (!speciesResponse.ok) {
            throw new Error(`포켓몬 종 데이터 로딩 실패! (상태 코드: ${speciesResponse.status}, ID: ${randomId})`);
        }
        const speciesData = await speciesResponse.json();


        // --- 이제 가져온 정보로 화면을 업데이트! ---

        // 1.포켓몬 번호
        if ($monsterNumber) { 
            $monsterNumber.textContent = `#${String(pokemonData.id).padStart(3, '0')}`;
        }

        // 2. 포켓몬 이름 
        let displayPokemonName = ''; 
        const koreanNameEntry = speciesData.names ? speciesData.names.find(name => name.language.name === 'ko') : null;
        if (koreanNameEntry && koreanNameEntry.name) {
            displayPokemonName = koreanNameEntry.name;
        } else {
            displayPokemonName = pokemonData.name.toUpperCase();
        }
        
        if ($monsterName) { 
            $monsterName.textContent = displayPokemonName; 
        }

        // 3. 포켓몬 이미지 
        const imageUrl = pokemonData.sprites ? pokemonData.sprites.front_default : null;
        
        if ($monsterImg) { 
            if (imageUrl) { 
                $monsterImg.src = imageUrl;
                $monsterImg.alt = displayPokemonName; 
            } else {
                console.warn(`[ID ${randomId}] ${displayPokemonName}의 기본 이미지를 찾을 수 없습니다.`);
                $monsterImg.src = '';
                $monsterImg.alt = '이미지 없음';
            }
        }

        // 4. 포켓몬 키 
        if($monsterHeight) {
            const heightInMeters = pokemonData.height / 10;
            $monsterHeight.textContent = `키 : ${heightInMeters}m`;
        }

        // 5. 포켓몬 몸무게
        if ($monsterWeight) {
            const weightInKgs = pokemonData.weight / 10;
            $monsterWeight.textContent = `몸무게 : ${weightInKgs}kg`;
        }


        // 6. 포켓몬 타입 
        if ($monsterType) { 
            if (pokemonData.types && pokemonData.types.length > 0) {
                const typesText = pokemonData.types.map(typeInfo => {
                    const englishTypeName = typeInfo.type.name;
                    return typeTranslations[englishTypeName] || englishTypeName.toUpperCase();
                }).join(', '); 
                $monsterType.textContent = typesText;
            } else {
                $monsterType.textContent = '타입 정보 없음';
            }
        }

        // 7. 포켓몬 스탯 
        if ($monsterStats) { 
            $monsterStats.innerHTML = ''; 
            if (pokemonData.stats && pokemonData.stats.length > 0) {
                pokemonData.stats.forEach(statInfo => {
                    const statP = document.createElement('div');
                    statP.classList.add('stat-item');

                    const englishStatName = statInfo.stat.name;
                    const translatedStatName = statTranslations[englishStatName] || englishStatName.toUpperCase();
                    
                    statP.textContent = `${translatedStatName} : ${statInfo.base_stat}`;
                    $monsterStats.appendChild(statP); 
                });
            } else {
                $monsterStats.innerHTML = '<p>스탯 정보 없음</p>';
            }
        }
        
        // 8. 포켓몬 기술
        if ($monsterSkill) {
            $monsterSkill.innerHTML = ''; 

            if (pokemonData.abilities && pokemonData.abilities.length > 0) {
                const abilityPromises = pokemonData.abilities.map(async abilityInfo => {
                    const abilityUrl = abilityInfo.ability.url;

                    try {
                        const response = await fetch(abilityUrl);
                        if (!response.ok) {
                            throw new Error(`기술 데이터 로딩 실패! (상태 코드: ${response.status}, URL: ${abilityUrl})`);
                        }
                        const abilityData = await response.json();

                        let displayAbilityName = '';
                        const koreanAbilityName = abilityData.names ?
                            abilityData.names.find(name => name.language.name === 'ko') : null;

                        if (koreanAbilityName && koreanAbilityName.name) {
                            displayAbilityName = koreanAbilityName.name;
                        } else {
                            displayAbilityName = abilityInfo.ability.name.replace(/-/g, ' ').toUpperCase();
                        }
                        return displayAbilityName; 
                    } catch (error) {
                        console.error("특성 상세 정보를 가져오다가 오류 발생:", error);
                        return { name: abilityInfo.ability.name.replace(/-/g, ' ').toUpperCase() + ' (로딩 오류)', success: false };
                    }
                });

                Promise.all(abilityPromises)
                    .then(results => {
                        const abilitiesText = results.join(' / ');
                        $monsterSkill.textContent = `기술 : ${abilitiesText}`;
                    })
                    .catch(error => {
                        console.error("기술 정보 오류 발생:", error);
                    });
            } else {
                $monsterSkill.textContent = `기술 없음`;
            }
        }

        


        // 9. 포켓몬 설명
        if ($monsterText) {
            let flavorText = '도감 설명 없음.';
            const koreanFlavorText = speciesData.flavor_text_entries ?
                speciesData.flavor_text_entries.find(entry => entry.language.name === 'ko') : null;

            if (koreanFlavorText && koreanFlavorText.flavor_text) {
                flavorText = koreanFlavorText.flavor_text.replace(/[\n\f]/g, ' ');
                flavorText = lineChange(flavorText, 25);
            }
            $monsterText.innerHTML = flavorText;
        }
    } catch (error) {
        console.error("포켓몬 정보를 가져오다가 큰 오류가 발생했어요:", error);
    }
}




// 스타트 버튼 이벤트
if (startButton) {
    startButton.addEventListener('click', () => {
        startPage.style.display = 'none'; 
        secondPage.style.display = 'flex';
        randomPocketmon(); 
    });
}

// reroll 버튼 이벤트
if (rerollButton) {
    rerollButton.addEventListener('click', () =>{
        randomPocketmon();
    })
}

// 줄바꿈
const lineChange = (text, charsPerLine) => {
    let result = '';
    let currentLineLength = 0;

    for (let i = 0; i < text.length; i++) {
        result += text[i];
        currentLineLength++;

        if (currentLineLength >= charsPerLine) {
            if (i < text.length - 1) { 
                result += '<br>';
                currentLineLength = 0; 
            }
        }
    }
    return result; 
};