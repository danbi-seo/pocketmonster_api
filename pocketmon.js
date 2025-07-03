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


        // --- 가져온 정보를 화면에 보여주기 ---

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

// 진화하기 버튼 이벤트
if (evolutionButton) {
    evolutionButton.addEventListener('click', async() => {
        const pokemonIdText = $monsterNumber.textContent.replace('#','');
        const pokemonId = parseInt(pokemonIdText, 10);

        if (isNaN(pokemonId)) {
            return;
        }
        await displayEvolutions(pokemonId);
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




// 진화 정보 가져오기
async function displayEvolutions(pokemonId) {
    const $evolutionDisplay = $monsterSkill;
    if (!$evolutionDisplay) {
        return;
    }
    $evolutionDisplay.innerHTML = '로 딩 중...';

    try {
        // (1) 포켓몬 종류 데이터를 통해서 진화 체인 url을 가져오기
        const speciesResponse = await fetch(`${apiPocketmonSpecies}${pokemonId}/`);
        if (!speciesResponse.ok) {
            throw new Error(`진화 중 데이터 로딩 실패! (상태 코드 : ${speciesResponse.status})`);
        }
        const speciesData = await speciesResponse.json();
        
        if(!speciesData.evolution_chain || !speciesData.evolution_chain.url) {
            $evolutionDisplay.textContent = '다음 진화 없음';
            return;
        }

        const evolutionChainUrl = speciesData.evolution_chain.url;
        const evolutionChainResponse = await fetch(evolutionChainUrl);
        if(!evolutionChainResponse.ok) {
            throw new Error(`진화 중 데이터 로딩 실패!`);
        }  
        const evolutionChainData = await evolutionChainResponse.json();

        // let currentChain = evolutionChainData.chain;
        const currentPokemonSpeciesName = speciesData.name;

        let allEvolutionStages = [];

        // [3] 진화 체인 파싱, 다음 진화 찾기 -> 재귀함수
        function colletNextEvolutionSpecies(chainNode) {
            const nodeSpeciesName = chainNode.species.name;

            if (nodeSpeciesName === currentPokemonSpeciesName) {
                if (chainNode.evolves_to && chainNode.evolves_to.length > 0) {
                    chainNode.evolves_to.forEach(nextEvolution => {
                        nextEvolutionSpeciesUrls.push(nextEvolution.species.url);
                    });
                }
                return true; 
            }

            if (chainNode.evolves_to) {
                for (const nextNode of chainNode.evolves_to) {
                    if (findNextEvolutions(nextNode)) {
                        return true;
                    }
                }
            }
            return false; 
        }

        findNextEvolutions(evolutionChainData.chain);

        if(currentPokemonNode && currentPokemonNode.evolves_to.length > 0) {
            currentPokemonNode.evolves_to.forEach(nextEvoName => {
                const nextEvoNode = allEvolutionStages.find(node => node.name === nextEvoName);
                if (nextEvoNode) {
                    nextEvolutionSpeciesUrls.push(nextEvoNode.url);
                }
            });
        }
                if (nextEvolutionSpeciesUrls.length > 0) {
            const evolutionPromises = nextEvolutionSpeciesUrls.map(async (speciesUrl) => {
                try {
                    const res = await fetch(speciesUrl); // 종 상세 정보
                    if (!res.ok) throw new Error(`다음 진화 종 데이터 로딩 실패!`);
                    const evoSpeciesData = await res.json();

                    // 한글 이름 찾기
                    const koreanNameEntry = evoSpeciesData.names.find(name => name.language.name === 'ko');
                    const evoName = koreanNameEntry ? koreanNameEntry.name : evoSpeciesData.name.toUpperCase();

                    // 포켓몬 데이터 (이미지용)
                    const evoId = speciesUrl.split('/').filter(Boolean).pop(); // URL에서 ID 추출
                    const pokeRes = await fetch(`${apiPocketmon}${evoId}/`);
                    if (!pokeRes.ok) throw new Error(`다음 진화 포켓몬 데이터 로딩 실패!`);
                    const evoPokemonData = await pokeRes.json();
                    const evoImageUrl = evoPokemonData.sprites ? evoPokemonData.sprites.front_default : null;

                    return { name: evoName, imageUrl: evoImageUrl };
                } catch (error) {
                    console.error("다음 진화 포켓몬 정보 가져오기 오류:", error);
                    // 오류 발생 시에도 기본 정보 반환 (UI 깨짐 방지)
                    return { name: "알 수 없음 (오류)", imageUrl: null };
                }
            });

            const evolvedPokemonDetails = await Promise.all(evolutionPromises);

            $evolutionDisplay.innerHTML = ''; // "로딩 중..." 메시지 지우기

            const evolutionTitle = document.createElement('div');
            evolutionTitle.textContent = "다음 진화 단계:";
            evolutionTitle.style.fontWeight = 'bold';
            evolutionTitle.style.marginBottom = '10px';
            $evolutionDisplay.appendChild(evolutionTitle);

            // 각 진화 포켓몬 정보를 화면에 추가
            evolvedPokemonDetails.forEach(detail => {
                const evoDiv = document.createElement('div');
                evoDiv.classList.add('evolution-item');
                evoDiv.style.display = 'flex';
                evoDiv.style.alignItems = 'center';
                evoDiv.style.marginBottom = '5px';

                if (detail.imageUrl) {
                    const evoImg = document.createElement('img');
                    evoImg.src = detail.imageUrl;
                    evoImg.alt = detail.name;
                    evoImg.style.width = '50px';
                    evoImg.style.height = '50px';
                    evoImg.style.marginRight = '10px';
                    evoDiv.appendChild(evoImg);
                }
                const evoNameSpan = document.createElement('span');
                evoNameSpan.textContent = detail.name;
                evoDiv.appendChild(evoNameSpan);

                $evolutionDisplay.appendChild(evoDiv);
            });

        } else {
            // 더 이상 진화하지 않는 경우
            $evolutionDisplay.textContent = '더 이상 진화하지 않습니다.';
        }

    } catch (error) {
        console.error("진화 정보를 가져오다가 큰 오류가 발생했어요:", error);
        $evolutionDisplay.textContent = `진화 정보 로딩 중 오류 발생: ${error.message}`;
    }
}

//             if (nextEvolutionSpeciesUrls.length > 0){
//                 const evolutionPromises = nextEvolutionSpeciesUrls.map(async (speciesUrl) => {

//                     try {
//                         const result = await fetch(speciesUrl);
//                         if(!result.ok) throw new Error(`진화 중 데이터 로딩 실패!`);
//                         const evoSpeciesData = await result.json();

//                         const koreanNameEntry = evoSpeciesData.names.find(name => name.language.name === 'ko');
//                         const evoName = koreanNameEntry ? koreanNameEntry.name : evoSpeciesData.name.toUpperCase();

//                         const evoId = speciesUrl.split('/').filter(Boolean).pop();
//                         const pokeRes = await fetch(`${apiPocketmon}${evoId}/`);
//                         if (!pokeRes.ok) throw new Error(`다음 진화 포켓몬 데이터 로딩 실패!`);
//                         const evoPokemonData = await pokeRes.json();
//                         const evoImageUrl = evoPokemonData.sprites ? evoPokemonData.sprites.front_default : null;

//                         return { name: evoName, imageUrl: evoImageUrl };
//                     } catch(error) {
//                         console.error("다음 진화 포켓몬 가져오기 오류");
//                         return;
//                     }
//                 });
//                 const evolvedPokemonDetails = await Promise.all(evolutionPromises);

//                 $evolutionDisplay.innerHTML = '';

//                 const evolutionTitle = document.createElement('div');
//                 evolutionTitle.textContent = "다음 진화 단계:";
//                 evolutionTitle.style.fontWeight = 'bold';
//                 evolutionTitle.style.marginBottom = '10px';
//                 $evolutionDisplay.appendChild(evolutionTitle);

//                 evolvedPokemonDetails.forEach(detail => {
//                 const evoDiv = document.createElement('div');
//                 evoDiv.classList.add('evolution-item');
//                 evoDiv.style.display = 'flex';
//                 evoDiv.style.alignItems = 'center';
//                 evoDiv.style.marginBottom = '5px';

//                 if (detail.imageUrl) {
//                     const evoImg = document.createElement('img');
//                     evoImg.src = detail.imageUrl;
//                     evoImg.alt = detail.name;
//                     evoImg.style.width = '50px';
//                     evoImg.style.height = '50px';
//                     evoImg.style.marginRight = '10px';
//                     evoDiv.appendChild(evoImg);
//                 }
//                 const evoNameSpan = document.createElement('span');
//                 evoNameSpan.textContent = detail.name;
//                 evoDiv.appendChild(evoNameSpan);

//                 $evolutionDisplay.appendChild(evoDiv);
//             });

//             if (evolvedPokemonDetails.length === 0) {
//                 $evolutionDisplay.textContent = '더 이상 진화하지 않습니다.';
//             }

//         } else {
//             $evolutionDisplay.textContent = '더 이상 진화하지 않습니다.';
//         }

//     } catch (error) {
//         console.error("진화 정보를 가져오다가 큰 오류가 발생했어요:", error);
//         $evolutionDisplay.textContent = `진화 정보 로딩 중 오류 발생: ${error.message}`;
//     }
// };