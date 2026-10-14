import "dotenv/config";
import { sql, eq, and } from "drizzle-orm";
import { db } from "../drizzle.ts";
import {
  usersTable,
  taxonomyTable,
  speciesTable,
  specimenTable,
  articleTable,
  popularNameTable,
  speciesPopularNamePivot,
  attributeTemplateTable,
  attributeTable,
  sourceTable,
  imageTable,
  articleSourcesPivotTable,
} from "../schema.ts";
import bcrypt from "bcrypt";

function buildArticleContent_esponja_do_mar(sourceIds: Record<string, number>) {
  return { "sections": { "left": ["TOC"], "center": [{ "type": "text", "content": `# Esponja-do-mar

Este espécime de coleção didática corresponde a um representante do filo *Porifera* ${sourceIds["wiki-porifera-pt"]}, popularmente conhecido como esponja-do-mar ou espongiário. Esponjas são animais aquáticos sésseis, desprovidos de tecidos verdadeiros e órgãos diferenciados, cuja identificação em nível de espécie geralmente depende da análise microscópica de espículas e características internas ${sourceIds["wiki-porifera-pt"]}. Como o espécime da coleção não possui registro de coleta detalhado (local, profundidade, dados microscópicos), sua classificação taxonômica segura se limita ao nível de Filo.` }, { "type": "image", "content": "https://commons.wikimedia.org/wiki/Special:FilePath/Vaasspons2.jpg" }, { "type": "text", "content": `# Morfologia

As esponjas apresentam um corpo organizado em torno de um sistema aquífero de canais e poros, impulsionado por células flageladas chamadas coanócitos ${sourceIds["wiki-porifera-pt"]}. O tamanho corporal varia enormemente entre as espécies, podendo ir de poucos centímetros a mais de um metro de diâmetro ${sourceIds["wiki-porifera-pt"]}. Atualmente são reconhecidas 4 classes viventes do filo: Calcarea, Demospongiae, Hexactinellida e Homoscleromorpha, totalizando entre 5.000 e 10.000 espécies descritas ${sourceIds["wiki-sponge-en"]}.` }, { "type": "column", "columns": [[{ "type": "image", "content": "https://commons.wikimedia.org/wiki/Special:FilePath/Grey_ball_sponge_at_Kreef_Reef_P5280131.jpg" }], [{ "type": "image", "content": "https://commons.wikimedia.org/wiki/Special:FilePath/Barrel_Sponge_Davy_Crocker_Reef_20230715.jpg" }]] }, { "type": "text", "content": `# Comportamento

Esponjas são filtradoras: a água entra pelos óstios (poros) do corpo, impulsionada pelos flagelos dos coanócitos, e partículas orgânicas em suspensão — como bactérias e plâncton — são capturadas e fagocitadas ${sourceIds["wiki-porifera-pt"]}. Estudos indicam que os coanócitos são responsáveis por capturar cerca de 80% do alimento de uma esponja ${sourceIds["wiki-sponge-en"]}. A água filtrada é então expelida através de uma abertura maior, o ósculo, podendo atingir velocidades de saída de aproximadamente 8,5 centímetros por segundo ${sourceIds["wiki-sponge-en"]}.` }, { "type": "text", "content": `# Distribuição Geográfica

Esponjas modernas possuem distribuição global, sendo encontradas desde águas polares até regiões tropicais, em ambientes que vão da superfície até profundidades superiores a 8.000 metros ${sourceIds["wiki-porifera-pt"]}. A grande maioria das espécies é marinha, embora existam poucas espécies de água doce ${sourceIds["wiki-porifera-pt"]}.` }, { "type": "text", "content": `# Conservação

Não há uma avaliação de conservação específica para o filo Porifera como um todo, dada sua enorme diversidade. No entanto, populações de esponjas no Caribe vêm sendo afetadas por uma doença emergente conhecida como *Aplysina* Red Band Syndrome (ARBS) ${sourceIds["wiki-porifera-pt"]}. Historicamente, a pesca comercial de esponjas para uso como material de limpeza e banho foi significativa, mas vem diminuindo com a popularização de esponjas sintéticas ${sourceIds["wiki-porifera-pt"]}.` }, "SOURCES"], "right": ["PROPERTIES"] } };
}

function buildArticleContent_anemona(sourceIds: Record<string, number>) {
  return { "sections": { "left": ["TOC"], "center": [{ "type": "text", "content": `# Anêmona-do-mar

As anêmonas-do-mar formam a ordem *Actiniaria*, dentro da classe Anthozoa do filo Cnidaria ${sourceIds["wikipedia-sea-anemone"]}. São pólipos solitários, sem esqueleto, fixados a substratos como rochas, conchas ou corais ${sourceIds["pmc-actiniaria-classification"]}. O espécime desta coleção didática não possui registro de coleta ou características diagnósticas suficientes para identificação em nível de família, gênero ou espécie, de modo que a classificação é apresentada até o nível de ordem, o mais específico confirmável ${sourceIds["wikipedia-sea-anemone"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/7/76/Actiniaria.jpg" }, { "type": "text", "content": `# Morfologia

O corpo da anêmona-do-mar é um pólipo cilíndrico, dividido em disco pedal (base de fixação), coluna corporal e disco oral, do qual partem os tentáculos dispostos em anéis ao redor da boca ${sourceIds["wikipedia-sea-anemone"]}. Os tentáculos contêm cnidócitos — células urticantes características dos cnidários — usados para captura de presas e defesa ${sourceIds["pmc-actiniaria-classification"]}. A maioria das espécies mede entre 1 e 5 cm de diâmetro e entre 1,5 e 10 cm de comprimento, embora algumas espécies de maior porte superem 1 metro ${sourceIds["wikipedia-sea-anemone"]}.` }, { "type": "column", "columns": [[{ "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/b/b7/Sea_Anemone_Structure.svg" }], [{ "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/b/b8/Aardbeianemoon_%28Actinia_fragacea%29.jpg" }]] }, { "type": "text", "content": `# Distribuição Geográfica

As anêmonas-do-mar ocorrem em oceanos de todo o mundo, de águas costeiras rasas a grandes profundidades, com maior diversidade de espécies em regiões tropicais, embora existam também muitas espécies adaptadas a águas frias ${sourceIds["wikipedia-sea-anemone"]}. A ordem *Actiniaria* reúne aproximadamente 1.200 espécies descritas, distribuídas por praticamente todos os ambientes marinhos bentônicos ${sourceIds["pmc-actiniaria-classification"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/9/94/Giant_green_anemone_%289444556933%29.jpg" }, { "type": "text", "content": `# Conservação

Não há uma avaliação de risco de extinção unificada para a ordem *Actiniaria* como um todo, já que o status de conservação é tratado por espécie. Ainda assim, populações de algumas espécies sofrem pressão por coleta para o comércio de aquarismo, o que já reduziu densidades em áreas exploradas, além de impactos de poluição, sedimentação e, potencialmente, mineração em águas profundas ${sourceIds["wikipedia-sea-anemone"]}.` }, "SOURCES"], "right": ["PROPERTIES"] } };
}

function buildArticleContent_lombriga(sourceIds: Record<string, number>) {
  return { "sections": { "left": ["TOC"], "center": [{ "type": "text", "content": `# Morfologia

*Ascaris lumbricoides* é um nematódeo de corpo cilíndrico, cor clara (esbranquiçada a rosada) e extremidades afiladas, apresentando dimorfismo sexual nítido. As fêmeas são maiores, medindo entre 20 e 49 cm de comprimento e 3 a 6 mm de largura, com a vulva localizada próxima ao terço anterior do corpo; os machos são menores, com 15 a 31 cm de comprimento e 2 a 4 mm de diâmetro, apresentando a extremidade posterior curvada ventralmente ${sourceIds["wikipedia-ascaris-lumbricoides"]}. Os ovos fecundados possuem casca espessa e resistente, característica que lhes confere grande resistência ambiental ${sourceIds["wikipedia-ascaris-lumbricoides"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/c/c1/Ascaris_lumbricoides_%28jar%29.jpg" }, { "type": "text", "content": "Exemplares adultos preservados, evidenciando o corpo cilíndrico e afilado típico da espécie." }, { "type": "column", "columns": [[{ "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/2/28/Egg_of_Ascaris_lumbricoides.jpg" }, { "type": "text", "content": "Ovo fecundado visto em microscopia de amostra fecal." }], [{ "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/d/dd/Ascaris_lumbricoides_adult_worms.png" }, { "type": "text", "content": "Vermes adultos recuperados do intestino delgado humano." }]] }, { "type": "text", "content": `# Ciclo de Vida

A transmissão ocorre pela via fecal-oral: ovos eliminados nas fezes humanas tornam-se infectantes após incubar de 2 a 3 semanas no solo ${sourceIds["ncbi-statpearls-ascariasis"]}. Após a ingestão, as larvas eclodem no duodeno, penetram a mucosa intestinal, migram pela corrente sanguínea até os pulmões, sobem pelas vias respiratórias e são deglutidas novamente, retornando ao intestino delgado, onde se tornam adultas ${sourceIds["wikipedia-ascaris-lumbricoides"]}. O período entre a ingestão dos ovos e o início da reprodução dos adultos é de 60 a 65 dias ${sourceIds["wikipedia-ascaris-lumbricoides"]}. Os ovos permanecem viáveis no solo por até 10 anos, graças a uma camada lipídica resistente a ácidos e substâncias químicas ${sourceIds["wikipedia-ascaris-lumbricoides"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/c/ca/Ascariasis_LifeCycle_lg.jpg" }, { "type": "text", "content": "Ciclo de vida completo de A. lumbricoides, da eliminação dos ovos à maturação no hospedeiro humano." }, { "type": "text", "content": `# Distribuição Geográfica

*Ascaris lumbricoides* está entre os parasitas humanos mais prevalentes do mundo, infectando mais de 1 bilhão de pessoas globalmente ${sourceIds["ncbi-statpearls-ascariasis"]}. A ocorrência é maior na África Subsaariana, no Sudeste Asiático, na América Latina e em partes da China, estando fortemente associada à pobreza, ao saneamento básico inadequado e ao uso de fezes humanas como fertilizante agrícola ${sourceIds["wikipedia-ascaris-lumbricoides"]} ${sourceIds["ncbi-statpearls-ascariasis"]}. No Brasil, é popularmente conhecida como lombriga, sendo uma das parasitoses intestinais mais comuns, sobretudo em regiões com infraestrutura sanitária precária ${sourceIds["todamateria-ascaridiase"]}.` }, { "type": "text", "content": `# Conservação

Por se tratar de um parasita humano cosmopolita e extremamente abundante, *Ascaris lumbricoides* não possui avaliação de status de conservação pela IUCN — o conceito de risco de extinção não se aplica a esta espécie. O eixo relevante é o do controle em saúde pública: a Organização Mundial da Saúde recomenda a administração em massa de medicamentos antiparasitários em áreas endêmicas, associada à melhoria do saneamento básico e à educação em higiene, como estratégia para reduzir a carga da ascaridíase ${sourceIds["ncbi-statpearls-ascariasis"]}. O tratamento medicamentoso individual costuma ser eficaz em poucos dias ${sourceIds["wikipedia-ascaris-lumbricoides"]}.` }, "SOURCES"], "right": ["PROPERTIES"] } };
}

function buildArticleContent_planaria(sourceIds: Record<string, number>) {
  return { "sections": { "left": ["TOC"], "center": [{ "type": "text", "content": `A *Tricladida* e uma ordem de platelmintos de vida livre popularmente conhecidos como planarias, pertencentes a classe Turbellaria do filo Platyhelminthes ${sourceIds["wikipedia-planaria"]}. Este especime didatico (CPINPLAT01) representa o grupo de forma generica, utilizado classicamente em laboratorios de biologia para o estudo de regeneracao animal ${sourceIds["ebsco-research-starter"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/1/11/Planaria_torva.jpg" }, { "type": "text", "content": `# Morfologia

As planarias possuem corpo achatado dorsoventralmente, medindo geralmente entre 3 e 15 mm de comprimento, embora algumas especies possam atingir ate 30 cm ${sourceIds["ebsco-research-starter"]}. A locomocao ocorre principalmente por deslizamento, resultante do batimento coordenado de cilios presentes na epiderme ventral sobre uma pelicula de muco secretada por glandulas subepidermicas; movimentos ondulatorios do corpo, produzidos pela musculatura da parede corporal, tambem contribuem para o deslocamento ${sourceIds["cilia-journal"]}. Na regiao cefalica, a maioria das especies apresenta dois ocelos (manchas oculares) capazes de detectar apenas a presenca e direcao da luz, podendo haver especies com um, nenhum ou multiplos ocelos ${sourceIds["ebsco-research-starter"]}. Uma caracteristica marcante do grupo e a presenca de neoblastos, celulas-tronco distribuidas por todo o corpo que podem corresponder a ate 30% das celulas de um individuo adulto, responsaveis pela notavel capacidade de regeneracao: um fragmento isolado pode regenerar um individuo completo em aproximadamente duas semanas ${sourceIds["ebsco-research-starter"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/4/47/Dugesia_Turbellaria_wm_head.jpg" }, { "type": "text", "content": `# Distribuicao Geografica

As planarias de agua doce ocorrem tipicamente em habitats escuros e turvos, como o fundo de corpos d'agua doce (rios, lagos e corregos), sendo sensiveis a estimulos como luz, gradientes quimicos, vibracao e campos magneticos ou eletricos ${sourceIds["wikipedia-planaria"]}. Quanto a dieta, comportam-se como predadoras ou necrofagas, alimentando-se de gastropodes de agua doce, oligoquetas tubificideos e artropodes como isopodes e larvas de quironomideos ${sourceIds["wikipedia-planaria"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/2/2f/Dugesia_etrusca_%28Tricladida%2C_Paludicola%29_2024.jpg" }, { "type": "text", "content": `# Conservacao

Nao ha avaliacao de conservacao especifica para a ordem Tricladida como um todo; trata-se de um grupo amplo e comum em ambientes de agua doce em todo o mundo, amplamente utilizado como organismo-modelo em pesquisas biologicas sobre regeneracao e celulas-tronco, sem evidencias de ameaca generalizada a sua sobrevivencia ${sourceIds["ebsco-research-starter"]}.` }, "SOURCES"], "right": ["PROPERTIES"] } };
}

function buildArticleContent_tenia(sourceIds: Record<string, number>) {
  return { "sections": { "left": ["TOC"], "center": [{ "type": "text", "content": `A *Taenia solium*, popularmente conhecida como tênia ou solitária, é um platelminto parasita da classe Cestoda, um dos exemplos didáticos mais citados de parasitismo em humanos. É responsável pela teníase e pela cisticercose, doenças ligadas ao consumo de carne de porco crua ou mal cozida ${sourceIds["wikipedia-taenia-solium"]}.` }, { "type": "text", "content": `# Morfologia

O corpo da *Taenia solium* é longo, fitiforme e segmentado, podendo medir de 2 a 3 metros de comprimento, embora exemplares excepcionais superem 8 metros ${sourceIds["wikipedia-taenia-solium"]}. O corpo é dividido em 800 a 900 proglótides (segmentos), cada um capaz de produzir ovos de forma independente ${sourceIds["wikipedia-taenia-solium"]}. Na extremidade anterior encontra-se o escólex, uma estrutura de fixação de aproximadamente 1 milímetro de diâmetro, equipada com quatro ventosas e um rostelo armado com 22 a 32 ganchos ${sourceIds["wikipedia-taenia-solium"]}. Os ovos produzidos medem entre 35 e 42 micrômetros de diâmetro ${sourceIds["wikipedia-taenia-solium"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/6/66/Taenia_solium_scolex.JPG" }, { "type": "text", "content": `Escólex de *Taenia solium*, estrutura de fixação ao intestino do hospedeiro ${sourceIds["wikipedia-taenia-solium"]}` }, { "type": "text", "content": `# Comportamento

O ciclo de vida da *Taenia solium* envolve dois hospedeiros: o ser humano, hospedeiro definitivo, que abriga a forma adulta no intestino delgado, e o porco (Sus domesticus), hospedeiro intermediário, que desenvolve a forma larval (cisticerco) na musculatura após ingerir ovos eliminados nas fezes humanas ${sourceIds["wikipedia-taenia-solium"]}. Nos porcos, os cisticercos se formam em cerca de 70 dias e podem continuar se desenvolvendo por até um ano ${sourceIds["wikipedia-taenia-solium"]}. Quando o ser humano ingere carne de porco contaminada e mal cozida, a larva se fixa no intestino e atinge a maturidade sexual em 10 a 12 semanas, passando a liberar proglótides grávidas e ovos nas fezes ${sourceIds["wikipedia-taenia-solium"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/3/34/Taenia_solium_life_cycle.jpg" }, { "type": "text", "content": `Ciclo de vida da *Taenia solium* entre hospedeiro humano e porco ${sourceIds["wikipedia-taenia-solium"]}` }, { "type": "column", "columns": [[{ "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/f/f5/Cysticercus_cellulosae.jpg" }, { "type": "text", "content": `Cisticerco, forma larval encontrada no tecido muscular do porco ${sourceIds["wikipedia-taenia-solium"]}` }], [{ "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/d/d4/Taenia_solium_egg.jpg" }, { "type": "text", "content": `Ovo de *Taenia solium* em microscopia, com 35 a 42 micrômetros de diâmetro ${sourceIds["wikipedia-taenia-solium"]}` }]] }, { "type": "text", "content": `# Distribuição Geográfica

A *Taenia solium* é encontrada em praticamente todo o mundo, mas é mais prevalente em regiões onde o consumo de carne de porco é comum associado a condições sanitárias precárias, incluindo partes da América Latina, África Ocidental, Rússia, Índia, Manchúria, Sudeste Asiático e Europa Oriental ${sourceIds["wikipedia-taenia-solium"]}.` }, { "type": "text", "content": `# Conservação

Por se tratar de um organismo parasita, a *Taenia solium* não é avaliada em categorias de conservação da fauna. Sua relevância é epidemiológica: é considerada um problema de saúde pública em países em desenvolvimento com saneamento básico deficiente, estando associada à teníase e à neurocisticercose, podendo causar convulsões em humanos ${sourceIds["wikipedia-taenia-solium"]}.` }, "SOURCES"], "right": ["PROPERTIES"] } };
}

function buildArticleContent_bivalve(sourceIds: Record<string, number>) {
  return { "sections": { "left": ["TOC"], "center": [{ "type": "text", "content": "O espécime catalogado corresponde a um bivalve identificado como *Perna perna*, popularmente conhecido como mexilhão ou marisco, espécie amplamente utilizada em coleções didáticas de zoologia no Brasil por sua abundância no litoral do Rio de Janeiro." }, { "type": "text", "content": `# Morfologia

*Perna perna* possui concha alongada e assimétrica, de coloração externa escura (pardo-escura a quase negra) e face interna nacarada. O comprimento usual da concha é de 90 mm, podendo atingir até 120 mm ${sourceIds["wikipedia-en-perna-perna"]}. É um animal filtrador, alimentando-se de fitoplâncton, zooplâncton e matéria orgânica em suspensão ${sourceIds["wikipedia-en-perna-perna"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/c/c1/Perna_perna_01.jpg" }, { "type": "text", "content": `# Distribuição Geográfica

A espécie ocorre do Caribe meridional até o Uruguai, além de habitar o Atlântico oriental e o Índico ${sourceIds["sealifebase-perna-perna"]}. É particularmente abundante entre os estados do Rio de Janeiro e Santa Catarina, fixando-se por meio do bisso em costões rochosos de alta energia, em profundidades de 0 a 50 m ${sourceIds["sealifebase-perna-perna"]}. Tolera temperaturas entre 10°C e 30°C e salinidade entre 15 e 50 ppt ${sourceIds["wikipedia-en-perna-perna"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/f/f8/Colony_of_Brown_Mussels_silted_up%2C_South_Africa.jpg" }, { "type": "text", "content": `# Conservação

*Perna perna* não possui categoria formal de ameaça, mas é um recurso pesqueiro de alto valor comercial, intensamente explorado para consumo humano, com estoques em declínio no extremo sul de sua distribuição ${sourceIds["sealifebase-perna-perna"]}. Seu índice de vulnerabilidade à pesca é considerado baixo a moderado (29 de 100), enquanto a vulnerabilidade às mudanças climáticas é moderada a alta (51 de 100) ${sourceIds["sealifebase-perna-perna"]}.` }, "SOURCES"], "right": ["PROPERTIES"] } };
}

function buildArticleContent_lula_1(sourceIds: Record<string, number>) {
  return { "sections": { "left": ["TOC"], "center": [{ "type": "text", "content": `# Morfologia

*Doryteuthis plei* é um cefalópode da família Loliginidae, com corpo alongado e cilíndrico e razão comprimento:largura de cerca de 7:1 ${sourceIds["wikipedia-en"]}. As nadadeiras possuem formato rombóide e ocupam até 50% do comprimento do manto ${sourceIds["wikipedia-en"]}. O comprimento médio do manto é de 150 mm ${sourceIds["conchasbrasil"]}, podendo machos atingir até 33 cm de manto ${sourceIds["wikipedia-en"]}. A coloração é avermelhada/alaranjada, resultado de um grande número de cromatóforos na pele ${sourceIds["wikipedia-en"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/a/ae/Arrow_squid.jpg" }, { "type": "text", "content": `Exemplar de *Doryteuthis plei* evidenciando o corpo alongado e as nadadeiras rombóides ${sourceIds["wikipedia-en"]}.` }, { "type": "text", "content": `# Distribuição Geográfica

A espécie ocorre em águas costeiras do Atlântico Ocidental, desde a Argentina até a Carolina do Norte (EUA) ${sourceIds["wikipedia-en"]}. No Brasil, é registrada ao longo da costa sudeste e sul, nos estados do Rio de Janeiro, São Paulo, Paraná, Santa Catarina e Rio Grande do Sul ${sourceIds["conchasbrasil"]}, sendo comum no litoral fluminense, onde se concentra em águas costeiras rasas durante a temporada reprodutiva de verão ${sourceIds["wikipedia-en"]}.` }, { "type": "column", "columns": [[{ "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/e/e5/Arrow_Squid_%2811358343214%29.jpg" }], [{ "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/3/31/Arrow_Squid_%2811670510963%29.jpg" }]] }, { "type": "text", "content": `# Conservação

*Doryteuthis plei* é classificada como Pouco Preocupante (LC) pela IUCN ${sourceIds["wikipedia-en"]}. A espécie é alvo de pesca costeira comercial e artesanal ao longo do litoral sudeste e sul do Brasil, incluindo o Rio de Janeiro, mas não há evidências de declínio populacional significativo associado a essa atividade ${sourceIds["wikipedia-en"]}.` }, "SOURCES"], "right": ["PROPERTIES"] } };
}

function buildArticleContent_lesma(sourceIds: Record<string, number>) {
  return { "sections": { "left": ["TOC"], "center": [{ "type": "text", "content": `# Morfologia

*Phyllocaulis variegatus* pertence à família Veronicellidae, popularmente chamada de lesmas-de-couro (*leatherleaf slugs*). São lesmas terrestres sem concha, com o dorso completamente revestido pelo manto, ou hiponoto ${sourceIds["wikipedia-veronicellidae"]}. Diferem da maioria das lesmas terrestres por não possuírem pulmão ou órgão pulmonar, respirando por meio da superfície do corpo, e por apresentarem olhos posicionados na extremidade de tentáculos contráteis (não retráteis) ${sourceIds["wikipedia-veronicellidae"]}. O gênero *Phyllocaulis* tem distribuição exclusivamente sul-americana e reúne seis espécies descritas: *P. boraceiensis*, *P. gayi*, *P. renschi*, *P. soleiformis*, *P. tuberculosus* e *P. variegatus* ${sourceIds["wikipedia-phyllocaulis"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/d/db/Phyllocaulis_variegatus_imported_from_iNaturalist_photo_335552789_on_5_June_2024.jpg" }, { "type": "text", "content": "*Phyllocaulis variegatus* em seu habitat natural." }, { "type": "text", "content": `# Distribuição Geográfica

*Phyllocaulis variegatus* ocorre no Brasil, na Argentina e no Uruguai ${sourceIds["wikipedia-phyllocaulis-variegatus"]}. Populações da espécie já foram registradas e estudadas, por exemplo, na região de Puerto Iguazú, província de Misiones, Argentina ${sourceIds["elsevier-brachylaima-phyllocaulis"]}. De forma mais ampla, o gênero *Phyllocaulis* e a família Veronicellidae à qual pertence têm distribuição concentrada em áreas tropicais e subtropicais das Américas ${sourceIds["wikipedia-veronicellidae"]}.` }, { "type": "column", "columns": [[{ "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/c/cb/Phyllocaulis_soleiformis_imported_from_iNaturalist_photo_238761687_on_5_June_2024.jpg" }, { "type": "text", "content": "*Phyllocaulis soleiformis*, espécie próxima." }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/7/73/Phyllocaulis_boraceiensis_-_Lucas_Mantelo_Cruz_-_468330114.jpeg" }, { "type": "text", "content": "*Phyllocaulis boraceiensis*, registrada no Paraná, Brasil." }], [{ "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/d/d7/Phyllocaulis_renschi.jpg" }, { "type": "text", "content": "*Phyllocaulis renschi*, registrada no Rio Grande do Sul, Brasil." }]] }, { "type": "text", "content": `# Conservação

Não há avaliação formal de risco de extinção publicada para *Phyllocaulis variegatus* na literatura consultada. A espécie tem relevância científica e sanitária por atuar como hospedeiro intermediário confirmado de metacercárias de *Brachylaima* sp. (Digenea: Brachylaimidae), parasitos encontrados próximos ao poro genital feminino de espécimes examinados em Puerto Iguazú, Argentina ${sourceIds["elsevier-brachylaima-phyllocaulis"]}. De modo mais geral, lesmas da família Veronicellidae têm hábito herbívoro, podem causar danos a cultivos agrícolas e atuam como hospedeiras intermediárias de vermes-pulmonares de ratos (*rat lungworm*), o que reforça seu interesse para estudos de sanidade agrícola e saúde pública ${sourceIds["wikipedia-veronicellidae"]}.` }, "SOURCES"], "right": ["PROPERTIES"] } };
}

function buildArticleContent_caramujo(sourceIds: Record<string, number>) {
  return { "sections": { "left": ["TOC"], "center": [{ "type": "text", "content": `# Morfologia

*Lissachatina fulica*, popularmente conhecida como caramujo-africano ou caramujo-gigante-africano, é um molusco gastrópode terrestre de concha oval-cônica, ápice afilado e coloração acastanhada com faixas irregulares e claras ${sourceIds["saude-pr"]}. Na fase adulta, a concha pode atingir cerca de 7 cm de diâmetro e 20 cm ou mais de comprimento ${sourceIds["wiki-en"]}, com peso corporal em torno de 100 g ${sourceIds["saude-pr"]}. É hermafrodita, mas ainda depende de um parceiro para reprodução, podendo depositar desovas de até 200 ovos por vez, em diversas desovas ao longo do ano ${sourceIds["wiki-en"]}.` }, { "type": "column", "columns": [[{ "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/f/fc/Achatina_fulica.jpg" }], [{ "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/4/4d/Giant_African_land_snail_%28Achatina_fulica%29.jpg" }]] }, { "type": "text", "content": `# Distribuição Geográfica

Originária do leste da África, a espécie foi introduzida em diversos países tropicais e subtropicais, inicialmente como fonte de alimento, e posteriormente se tornou invasora em várias regiões ${sourceIds["saude-pr"]}. No Brasil, o primeiro registro no estado do Paraná ocorreu no ano 2000, no município de Paranaguá, e a espécie já foi registrada em pelo menos 23 estados brasileiros ${sourceIds["saude-pr"]}. Prefere ambientes úmidos e quentes, abrigando-se da luz direta em folhiço e entulhos durante o dia ${sourceIds["wiki-en"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/c/c7/Giant_African_snail_%28Achatina_fulica%29_climbing_gate.jpg" }, { "type": "text", "content": `# Conservação

*L. fulica* não está ameaçada de extinção — pelo contrário, é considerada uma espécie exótica invasora de grande impacto, competindo com a fauna nativa por recursos e sem predadores naturais relevantes nas regiões onde foi introduzida ${sourceIds["saude-pr"]}. Representa risco à agricultura e à saúde pública, pois pode atuar como hospedeira dos nematódeos *Angiostrongylus cantonensis* e *Angiostrongylus costaricensis*, causadores de meningite eosinofílica e angiostrongilíase abdominal em humanos que consomem vegetais contaminados ou o próprio molusco malcozido ${sourceIds["saude-pr"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/4/4a/Achatina_fulica_eggs.jpg" }, "SOURCES"], "right": ["PROPERTIES"] } };
}

function buildArticleContent_lula_2(sourceIds: Record<string, number>) {
  return { "sections": { "left": ["TOC"], "center": [{ "type": "text", "content": `A *Lolliguncula brevis*, conhecida popularmente como lula-rabo-de-fósforo ou, em inglês, Atlantic brief squid, é um pequeno cefalópode da família Loliginidae encontrado em águas costeiras rasas do Atlântico Ocidental ${sourceIds["wikipedia-en"]}. Sua distribuição vai da Baía de Fundy, no Canadá, até o Rio da Prata, na Argentina, incluindo todo o litoral brasileiro ${sourceIds["wikipedia-en"]}. De forma notável para o registro do IFRJ, a localidade-tipo da espécie é indicada como sendo o Brasil, provavelmente nas proximidades do Rio de Janeiro ${sourceIds["wikipedia-en"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/0/0a/Lolliguncula_brevis_SERC_10-13-16_%2830325301491%29.jpg" }, { "type": "text", "content": `# Morfologia

É uma das menores espécies de lula do mundo: fêmeas atingem em média 11 cm de comprimento de manto e machos cerca de 9 cm, com um máximo registrado de 12 cm ${sourceIds["wikipedia-en"]}. O macho possui um braço modificado (hectocótilo) no quinto apêndice esquerdo, usado para transferir espermatóforos até o órgão reprodutor da fêmea durante o acasalamento ${sourceIds["wikipedia-en"]}. As fêmeas possuem glândulas nidamentais que secretam o material da cápsula de ovos, depositados em massas gelatinosas fixadas ao substrato ${sourceIds["wikipedia-en"]}.` }, { "type": "column", "columns": [[{ "type": "text", "content": `# Distribuição Geográfica

Ocorre em águas rasas, tipicamente entre 8.9 e 26.5 m de profundidade, sendo mais abundante sobre fundos lodosos do que arenosos dentro de enseadas e baías ${sourceIds["wikipedia-en"]}. É uma das poucas espécies de cefalópodes osmoconformadoras, ou seja, a salinidade interna de seu corpo acompanha a do ambiente, permitindo tolerar águas estuarinas com salinidade reduzida, até cerca de metade da salinidade marinha normal (17.9‰); salinidades um pouco menores (16.5‰) tornam-se letais em cerca de 48 horas ${sourceIds["wikipedia-en"]}. Essa tolerância é considerada excepcional entre os cefalópodes ${sourceIds["wikipedia-en"]}. No Brasil, a espécie é registrada comercialmente como isca e capturada incidentalmente pela pesca de arrasto de camarão ao longo de todo o litoral, incluindo a costa do Rio de Janeiro ${sourceIds["sealifebase"]}.` }], [{ "type": "text", "content": `# Conservação

A *Lolliguncula brevis* é classificada pela IUCN como "Dados Insuficientes" (Data Deficient), avaliação de 2015, refletindo a escassez de estudos populacionais de longo prazo sobre a espécie em boa parte de sua distribuição ${sourceIds["wikipedia-en"]}. Por outro lado, a NatureServe considera a espécie "Segura" (Secure) em função de sua ampla distribuição costeira e tolerância ambiental ${sourceIds["wikipedia-en"]}.` }]] }, "SOURCES"], "right": ["PROPERTIES"] } };
}

function buildArticleContent_polvo(sourceIds: Record<string, number>) {
  return { "sections": { "left": ["TOC"], "center": [{ "type": "text", "content": `O *Octopus vulgaris*, popularmente conhecido como polvo ou polvo-comum, é um cefalópode da ordem Octopoda amplamente distribuído em águas costeiras tropicais, subtropicais e temperadas, vivendo em profundidades de até 200 m ${sourceIds["wikipedia-octopus-vulgaris"]}.

# Morfologia

O manto pode atingir até 25 cm de comprimento, com braços que chegam a 1 m, totalizando até 9 kg de massa corporal ${sourceIds["wikipedia-octopus-vulgaris"]}. A pele é dotada de cromatóforos que permitem mudança rápida de coloração e textura, usada tanto para camuflagem quanto para comunicação.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/7/72/Common_octopus.jpg" }, { "type": "text", "content": "Octopus vulgaris em ambiente marinho natural." }, { "type": "text", "content": `# Distribuição Geográfica

O complexo *Octopus vulgaris* possui distribuição que vai do Mediterrâneo e Atlântico Nordeste até a África do Sul, incluindo populações no Atlântico Ocidental ${sourceIds["wikipedia-octopus-vulgaris"]}. No litoral do Rio de Janeiro, o polvo é capturado durante todo o ano por arrasto de camarão e pela pesca artesanal, sendo uma das duas espécies de polvo mais desembarcadas na região, ao lado de *Eledone massyae* ${sourceIds["pesca-polvos-lulas-rj"]}.

Estudos genéticos recentes indicam que a linhagem do complexo *O. vulgaris* presente no Atlântico Sul Ocidental (incluindo o litoral brasileiro) corresponde a um haplogrupo distinto, informalmente designado "Tipo II", ainda sem redescrição taxonômica formal como espécie própria ${sourceIds["frontiers-insularis-florida-2023"]}. Uma espécie relacionada e morfologicamente similar, *Octopus insularis* (Leite & Haimovici, 2008), predomina em águas tropicais rasas do Norte e Nordeste do Brasil e ilhas oceânicas, mas sua ocorrência confirmada não se estende ao litoral fluminense ${sourceIds["wikipedia-octopus-insularis"]}.` }, { "type": "column", "columns": [[{ "type": "text", "content": `O habitat típico inclui fundos rochosos, arenosos e lamosos, recifes e poças de maré, onde o animal se abriga em fendas e tocas durante o dia ${sourceIds["wikipedia-octopus-vulgaris"]}.` }], [{ "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/5/5c/Octopus_vulgaris_03.jpg" }, { "type": "text", "content": "Detalhe dos braços e ventosas." }]] }, { "type": "text", "content": `# Conservação

A espécie é classificada como Pouco Preocupante ("Least Concern") pela IUCN: sua ampla distribuição geográfica e ciclo de vida curto e rápido (1 a 2 anos) permitem recuperação populacional ágil mesmo sob pressão pesqueira ${sourceIds["wikipedia-octopus-vulgaris"]}. Ainda assim, por se tratar de recurso pesqueiro de alto valor comercial, populações locais podem sofrer sobre-exploração em áreas específicas, como ocorre em parte da costa brasileira.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/5/55/Gew%C3%B6hnlicher_Krake_Octopus_vulgaris_1.jpg" }, { "type": "text", "content": "Camuflagem de Octopus vulgaris entre rochas." }, "SOURCES"], "right": ["PROPERTIES"] } };
}

function buildArticleContent_sanguessuga(sourceIds: Record<string, number>) {
  return { "sections": { "left": ["TOC"], "center": [{ "type": "text", "content": `A *Hirudo medicinalis*, popularmente conhecida como sanguessuga medicinal europeia, é um anelídeo da subclasse Hirudinea historicamente associado à prática de sangria terapêutica e, até hoje, utilizado em microcirurgia reconstrutiva ${sourceIds["wikipedia-en-hirudo-medicinalis"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/5/57/European_medicinal_leech_%28Hirudo_medicinalis%29_at_the_California_Academy_of_Sciences_01.jpg" }, { "type": "text", "content": `# Morfologia

Adultos atingem até 20 cm de comprimento, com coloração que varia entre verde, marrom e marrom-esverdeado, dorso mais escuro que o ventre e uma fina linha avermelhada ao longo do dorso ${sourceIds["wikipedia-en-hirudo-medicinalis"]}. O corpo apresenta aproximadamente 34 segmentos e duas ventosas — uma anterior, que circunda a boca, e outra posterior, maior, usada para locomoção ${sourceIds["wikipedia-pt-hirudinea"]}. A ventosa anterior contém três mandíbulas com cerca de 100 dentículos cada, responsáveis pela marca característica em forma de Y invertido dentro de um círculo deixada na pele após a mordida ${sourceIds["wikipedia-en-hirudo-medicinalis"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/0/07/Hirudo_medicinalis_anatomy_by_Syme.png" }, { "type": "column", "columns": [[{ "type": "text", "content": `A saliva da *Hirudo medicinalis* contém cerca de 60 proteínas diferentes, incluindo anticoagulantes, vasodilatadores e agentes anti-inflamatórios, o que permite que o animal ingira até dez vezes o próprio peso em uma única refeição, consumindo entre 5 e 15 ml de sangue ${sourceIds["wikipedia-en-hirudo-medicinalis"]}.` }], [{ "type": "text", "content": `Após se alimentar, o animal pode sobreviver até um ano sem nova refeição ${sourceIds["wikipedia-en-hirudo-medicinalis"]}. É hermafrodita protândrica, depositando desovas de até 50 ovos em locais úmidos e sombreados próximos à água, mas não submersos ${sourceIds["wikipedia-pt-hirudinea"]}.` }]] }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/5/51/HirudoMedicinalis_BiteWound.jpg" }, { "type": "text", "content": `# Distribuição Geográfica

A espécie ocorre naturalmente em quase toda a Europa, estendendo-se até a Ásia, alcançando o Cazaquistão e o Uzbequistão ${sourceIds["wikipedia-en-hirudo-medicinalis"]}. Prefere poças e valas de água doce lamacenta, com vegetação abundante, em clima temperado ${sourceIds["wikipedia-en-hirudo-medicinalis"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/e/e1/PSM_V17_D495_The_medicinal_leech.jpg" }, { "type": "text", "content": `# Conservação

A exploração intensiva para fins medicinais ao longo do século XIX reduziu drasticamente as populações naturais da espécie, levando-a hoje à categoria 'quase ameaçada' (Near Threatened) na avaliação da IUCN ${sourceIds["hirudotherapy-society-ecology"]}. Atualmente é protegida por lei na maior parte de sua área de distribuição natural e listada no Apêndice II da CITES, que regula seu comércio internacional ${sourceIds["wikipedia-en-hirudo-medicinalis"]}.` }, "SOURCES"], "right": ["PROPERTIES"] } };
}

function buildArticleContent_minhoca(sourceIds: Record<string, number>) {
  return { "sections": { "left": ["TOC"], "center": [{ "type": "text", "content": `# Pontoscolex corethrurus

*Pontoscolex corethrurus* é uma espécie de anelídeo oligoqueta (minhoca) pertencente à família Glossoscolecidae, conhecida por sua distribuição circuntropical e por seu papel marcante na ecologia do solo em regiões tropicais, incluindo o Brasil, onde é uma das espécies de minhoca mais comumente encontradas em solos agrícolas e pastagens ${sourceIds["wikipedia-en-pontoscolex"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/a/a1/Pontoscolex_corethrurus.jpg" }, { "type": "text", "content": `Espécime de *Pontoscolex corethrurus* fotografado em campo ${sourceIds["wikimedia-commons-file-pontoscolex-corethrurus"]}.` }, { "type": "text", "content": `# Morfologia

Os indivíduos adultos de *Pontoscolex corethrurus* medem entre 5 e 10 centímetros de comprimento e possuem o corpo despigmentado (coloração pálida/acinzentada), composto por aproximadamente 200 segmentos ${sourceIds["wikipedia-en-pontoscolex"]}. A espécie pertence à família Glossoscolecidae, grupo de minhocas de grande porte com representantes nas Américas do Sul e Central ${sourceIds["wikipedia-pt-glossoscolecidae"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/c/c1/Glossoscolex_sp.jpg" }, { "type": "text", "content": `*Glossoscolex sp.*, gênero próximo dentro da mesma família (Glossoscolecidae), ilustrando morfologia semelhante ${sourceIds["wikimedia-commons-file-glossoscolex-sp"]}.` }, { "type": "text", "content": `# Distribuição Geográfica

Acredita-se que *Pontoscolex corethrurus* tenha se originado no Planalto das Guianas, na região neotropical, mas hoje apresenta distribuição circuntropical, tendo se tornado uma espécie peregrina amplamente disseminada por atividades humanas ${sourceIds["wikipedia-en-pontoscolex"]}. No Brasil, é encontrada com grande frequência em solos de pastagens, lavouras e áreas de floresta convertida, sendo uma das minhocas mais comuns em solos tropicais perturbados ${sourceIds["wikipedia-pt-glossoscolecidae"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/6/6a/EB1911_Chaetopoda_Fig._10.%E2%80%94Diagrams_of_various_Earthworms%2C_to_illustrate_external_characters.jpg" }, { "type": "text", "content": `Ilustração de 1911 (Encyclopædia Britannica) representando características externas gerais de diferentes gêneros de minhocas, utilizada aqui apenas como referência morfológica geral do grupo ${sourceIds["wikimedia-commons-file-eb1911-diagram"]}.` }, { "type": "text", "content": `# Conservação

*Pontoscolex corethrurus* não possui avaliação formal de status de conservação, visto que não se trata de espécie ameaçada, mas sim de uma espécie peregrina extremamente bem-sucedida e amplamente disseminada. Em ambientes naturais, pode ter contribuído historicamente para a formação da terra preta de índio na Amazônia; em áreas agrícolas, no entanto, é considerada uma praga invasora, associada à compactação do solo em lavouras de batata-doce, milho e pastagens recém-convertidas de floresta ${sourceIds["wikipedia-en-pontoscolex"]}.` }, "SOURCES"], "right": ["PROPERTIES"] } };
}

function buildArticleContent_cigarra(sourceIds: Record<string, number>) {
  return { "sections": { "left": ["TOC"], "center": [{ "type": "text", "content": `# Morfologia

*Quesada gigas* ocupa uma posição de destaque entre as cigarras do Hemisfério Ocidental: é considerada a maior espécie de cicadídeo do continente americano, com registros de ocorrência também no Brasil ${sourceIds["wikipedia-giant-cicada"]}. Seu corpo exibe uma combinação de tons preto, verde e marrom, com colar pronotal em tom verde-amarronzado e olhos que variam de castanho a oliva ${sourceIds["wikipedia-giant-cicada"]}. Diferente de muitos insetos que se destacam pela aparência, as cigarras do gênero *Quesada* se distinguem principalmente pelo canto, já que a coloração varia pouco dentro da espécie ao longo de sua ampla distribuição ${sourceIds["wikipedia-giant-cicada"]}.

O canto de *Quesada gigas* é descrito como um som alto e muito característico: a vocalização inicial lembra o coaxar de uma perereca, evoluindo para um assobio agudo e contínuo, semelhante ao apito de uma locomotiva, que pode durar quase meio minuto antes de cessar abruptamente ${sourceIds["cicadamania-quesada"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/0/00/Cigarra_01-_Cicada_-_Quesada_gigas_%281192271410%29.jpg" }, { "type": "text", "content": "*Quesada gigas* exibindo o padrão de coloração preto, verde e marrom característico da espécie." }, { "type": "text", "content": `# Distribuição Geográfica

*Quesada gigas* é a cigarra com a maior amplitude de distribuição em todo o Hemisfério Ocidental, estendendo-se desde o centro do Texas, nos Estados Unidos, passando pela América Central, até o norte da Argentina, nas regiões de Buenos Aires e Córdoba ${sourceIds["wikipedia-giant-cicada"]}. No continente sul-americano, sua presença é registrada em diversos países, incluindo Brasil, Colômbia, Peru, Bolívia, Paraguai e Equador ${sourceIds["cicadamania-quesada"]}.

As ninfas se desenvolvem no solo associadas a raízes de árvores, preferindo locais com solo macio e úmido, como encostas de vales; ao atingirem a fase final de desenvolvimento, sobem alguns metros pelo tronco das árvores antes da muda final para a forma adulta ${sourceIds["cicadamania-quesada"]}. O período de desenvolvimento subterrâneo é longo: as ninfas permanecem ao menos quatro anos sob a terra, alimentando-se da seiva das raízes antes de emergirem como adultas ${sourceIds["wikipedia-giant-cicada"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/e/e8/Quesada_gigas_234725370.jpg" }, { "type": "text", "content": "Exemplar de *Quesada gigas* fotografado no Brasil, com as asas transparentes e nervuras escuras típicas da espécie." }, { "type": "text", "content": `# Conservação

Não há avaliação formal de *Quesada gigas* em listas de risco de extinção, como a Lista Vermelha da IUCN, situação comum entre espécies de insetos com distribuição geográfica muito ampla e populações aparentemente estáveis ${sourceIds["wikipedia-giant-cicada"]}. Sua ocorrência confirmada em múltiplos países das Américas, incluindo diversas regiões do Brasil, sugere uma espécie generalista quanto ao hábitat, associada a árvores e áreas com cobertura arbórea, sem indícios atuais de ameaça ${sourceIds["cicadamania-quesada"]}.` }, "SOURCES"], "right": ["PROPERTIES"] } };
}

function buildArticleContent_besouro_escaravelho(sourceIds: Record<string, number>) {
  return { "sections": { "left": ["TOC"], "center": [{ "type": "text", "content": `O nome popular "besouro escaravelho" é empregado de forma genérica, no Brasil e em outros países de língua portuguesa, para designar besouros pesados e de cutícula endurecida pertencentes à família *Scarabaeidae* (ordem Coleoptera) ${sourceIds["wikipedia-pt-scarabaeidae"]}. Como se trata de um nome popular aplicado a milhares de espécies diferentes, e não a um único táxon, não é possível confirmar com segurança a espécie exata representada pelo espécime físico apenas a partir do nome popular — por isso esta ficha é apresentada no nível de Família, o nível mais específico que pode ser confirmado com as fontes disponíveis.` }, { "type": "text", "content": "# Morfologia" }, { "type": "text", "content": `Os representantes da família *Scarabaeidae* apresentam corpo robusto e compacto, com comprimento variando entre 1,5 e 160 mm entre as espécies conhecidas ${sourceIds["wikipedia-en-scarabaeidae"]}. Uma das características morfológicas mais marcantes do grupo são as antenas lameladas, cujos últimos segmentos se abrem lateralmente em lâminas (lamelas) que o inseto pode abrir em leque para ampliar a superfície de detecção de odores ${sourceIds["wikipedia-en-scarabaeidae"]}. As pernas anteriores são frequentemente adaptadas para escavação do solo, e muitos machos desenvolvem chifres na cabeça ou no tórax, estruturas associadas a disputas por parceiras ${sourceIds["wikipedia-pt-scarabaeidae"]}. A coloração varia de tons de marrom e preto, predominantes em espécies noturnas, a tons metálicos de verde e azul em espécies de hábitos diurnos ${sourceIds["commons-green-june-beetle"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/5/56/Cockchafer_beetle.jpg" }, { "type": "text", "content": `Detalhe das antenas lameladas típicas da família Scarabaeidae ${sourceIds["commons-cockchafer-beetle"]}.` }, { "type": "text", "content": `As larvas, por sua vez, têm corpo recurvado em forma de "C" e vivem majoritariamente no solo ou sob detritos vegetais, alimentando-se de raízes, matéria orgânica em decomposição ou madeira apodrecida, dependendo da subfamília ${sourceIds["wikipedia-en-scarabaeidae"]}.` }, { "type": "text", "content": "# Distribuição Geográfica" }, { "type": "text", "content": `*Scarabaeidae* é uma família cosmopolita, com cerca de 27.800 espécies descritas em aproximadamente 600 gêneros, ocorrendo em praticamente todos os continentes e ambientes terrestres ${sourceIds["wikipedia-pt-scarabaeidae"]}. A maior diversidade do grupo é observada nas savanas tropicais da África, mas representantes da família são comuns também nas regiões tropicais e subtropicais das Américas, incluindo o território brasileiro, onde ocupam ambientes como florestas, campos e áreas de pastagem ${sourceIds["wikipedia-pt-scarabaeidae"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/d/da/Hard_work%2C_Koca%C3%A7ay_Deltas%C4%B1%2C_Bursa.jpg" }, { "type": "text", "content": `Comportamento de rolagem de bolas de esterco, usado para alimentação e nidificação em diversos gêneros coprófagos da família ${sourceIds["commons-hard-work-kocacay"]}.` }, { "type": "text", "content": "# Conservação" }, { "type": "text", "content": `Por reunir milhares de espécies com hábitos e distribuições muito distintos, o estado de conservação da família *Scarabaeidae* como um todo não pode ser resumido em uma única categoria: ele varia espécie a espécie, e sua avaliação depende da identificação precisa do táxon, algo que não foi possível confirmar para este espécime a partir apenas do nome popular "besouro escaravelho". De forma geral, o grupo desempenha papel ecológico relevante como decompositor de fezes, carcaças e matéria vegetal, contribuindo para a ciclagem de nutrientes no solo ${sourceIds["wikipedia-pt-scarabaeidae"]}, o que torna a perda de habitat e o uso de agrotóxicos em áreas de pastagem fatores de preocupação para espécies coprófagas especializadas do grupo.` }, "SOURCES"], "right": ["PROPERTIES"] } };
}

function buildArticleContent_abelha(sourceIds: Record<string, number>) {
  return { "sections": { "left": ["TOC"], "center": [{ "type": "text", "content": `# Morfologia

*Apis mellifera* é um inseto eussocial da família Apidae, com corpo dividido em cabeça, tórax e abdômen, dotado de ferrão e dois pares de asas membranosas. As operárias medem de 10 a 15 mm de comprimento, enquanto a rainha, a maior casta da colônia, atinge de 18 a 20 mm ${sourceIds["dimensions-com-apis-mellifera"]}. A colônia é organizada em três castas — rainha, operárias e zangões — cada uma com morfologia e função distintas ${sourceIds["wiki-western-honey-bee"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/d/d9/Abeille_recouverte_de_pollen.jpg" }, { "type": "text", "content": `# Distribuição Geográfica

A espécie é nativa da África e da Ásia, de onde se dispersou naturalmente pela Europa, Oriente Médio e norte da África antes de ser introduzida pelo ser humano em praticamente todos os continentes, estando hoje presente em todos exceto a Antártida ${sourceIds["wiki-western-honey-bee"]}. No Brasil, subespécies europeias de *Apis mellifera* cruzaram-se com a subespécie africana *Apis mellifera scutellata*, introduzida em 1956 pelo biólogo Warwick E. Kerr em um apiário próximo a Rio Claro (SP); o escape acidental de enxames em 1957 deu origem à chamada abelha africanizada, atualmente dominante na apicultura das Américas Central e do Sul ${sourceIds["wiki-africanized-bee"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/a/a1/Apis_mellifera_carnica_worker_hive_entrance_3.jpg" }, { "type": "text", "content": `# Conservação

*Apis mellifera* é classificada pela União Internacional para a Conservação da Natureza (IUCN) como "Deficiente em Dados" (Data Deficient), já que, por ser amplamente manejada pelo ser humano em apicultura comercial, é difícil avaliar o estado de suas populações verdadeiramente silvestres ${sourceIds["wiki-western-honey-bee"]}. Atualmente são reconhecidas 31 subespécies distintas, distribuídas por seu amplo alcance geográfico original na África, Europa e Ásia ${sourceIds["wiki-western-honey-bee"]}.` }, "SOURCES"], "right": ["PROPERTIES"] } };
}

function buildArticleContent_libelula(sourceIds: Record<string, number>) {
  return { "sections": { "left": ["TOC"], "center": [{ "type": "text", "content": `# Morfologia

A *Erythemis vesiculosa* é uma libélula robusta da família Libellulidae, conhecida em inglês como "great pondhawk" ${sourceIds["wikispecies"]}. Adultos apresentam envergadura alar de 56 a 60 milímetros, abdômen de 40 a 43 milímetros e ala posterior de 38 a 40 milímetros ${sourceIds["wikipedia-pt"]}. A espécie foi descrita originalmente por Johan Christian Fabricius em 1775, como *Libellula vesiculosa* ${sourceIds["wikispecies"]}.` }, { "type": "column", "columns": [[{ "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/1/1f/Great_pondhawk_%28Erythemis_vesiculosa%29_male_Trinidad.JPG" }], [{ "type": "text", "content": `*Erythemis vesiculosa*, macho, fotografado no pântano de Caroni, Trinidad ${sourceIds["wikipedia-en"]}.` }]] }, { "type": "text", "content": `# Distribuição Geográfica

Ocorre do sul dos Estados Unidos até o norte da Argentina, incluindo as ilhas do Caribe, e está presente em todos os biomas e bacias hidrográficas do Brasil ${sourceIds["wikipedia-pt"]}. Registros fotográficos confirmam sua presença no Brasil, Costa Rica, Equador, México, Panamá, Suriname e Trinidad e Tobago ${sourceIds["jungledragon"]}. No Brasil, a espécie já foi usada como referência comparativa em estudos taxonômicos de larvas do gênero *Erythemis* publicados na Revista Brasileira de Zoologia ${sourceIds["scielo-rbzool"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/5/53/Great_Pondhawk_-_Erythemis_vesiculosa%2C_Dagny_Johnson_State_Park%2C_Key_Largo%2C_Florida_-_23571856541.jpg" }, { "type": "text", "content": `# Comportamento

É um predador voraz, capturando em voo borboletas e outras libélulas da família Libellulidae ${sourceIds["wikipedia-pt"]}. Já foram registrados machos predando a borboleta *Dryas iulia* e a libélula *Erythrodiplax umbrata* ${sourceIds["wikipedia-en"]}. A espécie ocorre em ambientes de água parada ou de fluxo lento, em áreas abertas com vegetação emergente, como lagos, lagoas, pântanos e remansos de riachos ${sourceIds["wikipedia-pt"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/8/8c/Great_pondhawk_%2819158140846%29.jpg" }, { "type": "text", "content": `# Conservação

A *Erythemis vesiculosa* é classificada como "Pouco preocupante" (Least Concern) pela IUCN, segundo os critérios da versão 3.1, em avaliação atualizada em 18 de novembro de 2021 ${sourceIds["wikipedia-en"]}.` }, "SOURCES"], "right": ["PROPERTIES"] } };
}

function buildArticleContent_grilo(sourceIds: Record<string, number>) {
  return { "sections": { "left": ["TOC"], "center": [{ "type": "text", "content": `# Grilo

*Gryllus assimilis*, popularmente conhecido como grilo-cantor, grilo-caseiro, grilo-comum ou grilo-dos-canteiros, é uma espécie de grilo (família Gryllidae) amplamente distribuída nas Américas, incluindo o Brasil ${sourceIds["wikipedia-gryllus-assimilis"]}. É também criada comercialmente como inseto-alimento (feeder insect) para a indústria de animais de estimação na América do Norte e Europa ${sourceIds["wikipedia-gryllus-assimilis"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/f/f3/Gryllus_assimilis_male.jpg" }, { "type": "text", "content": `# Morfologia

Adultos do gênero *Gryllus* medem entre 15 e 31 mm de comprimento e apresentam coloração geralmente escura ${sourceIds["wikipedia-gryllus-genus"]}. Em *Gryllus assimilis*, a coloração é mais clara que a de outras espécies de grilos da Flórida, com tons de marrom e áreas amarelo-acastanhadas ao redor dos olhos; o pronoto possui uma pubescência densa que confere aspecto "peludo" ao inseto, e os adultos possuem asas posteriores longas ${sourceIds["ifas-jamaican-field-cricket"]}. O canto de chamado dos machos consiste em cerca de um chilrido por segundo, cada um contendo sete ou mais pulsos ${sourceIds["ifas-jamaican-field-cricket"]}. As fêmeas são reconhecidas por um longo ovipositor filiforme na extremidade posterior do corpo, usado para depositar até 400 ovos no solo úmido, que eclodem após aproximadamente 11 dias e se desenvolvem como ninfas por 6 a 7 semanas antes de atingir a maturidade ${sourceIds["wikipedia-gryllus-assimilis"]}.` }, { "type": "column", "columns": [[{ "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/5/50/Gryllus_assimilis_female.jpg" }, { "type": "text", "content": `Fêmea com ovipositor visível, usado para depositar ovos no solo ${sourceIds["wikipedia-gryllus-assimilis"]}.` }], [{ "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/a/ad/Gryllus_assimilis_%281%29.jpg" }, { "type": "text", "content": `Indivíduo adulto em vista lateral, mostrando as asas posteriores longas típicas da espécie ${sourceIds["ifas-jamaican-field-cricket"]}.` }]] }, { "type": "text", "content": `# Distribuição Geográfica

*Gryllus assimilis* ocorre nas Antilhas, em partes do sul dos Estados Unidos (restrito à Flórida peninsular e ao extremo sul do Texas), no México e em regiões da América do Sul, incluindo Equador, Peru, Bolívia, Paraguai e norte da Argentina, além de ampla distribuição no Brasil ${sourceIds["wikipedia-gryllus-assimilis"]}. A espécie habita campos com vegetação rasteira, beiras de estrada, jardins e pastagens degradadas ${sourceIds["ifas-jamaican-field-cricket"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/b/b0/Steppengrille_Gryllus_assimilis.jpg" }, { "type": "text", "content": `# Conservação

*Gryllus assimilis* não consta em avaliações formais de risco de extinção e é considerada uma espécie comum e amplamente distribuída; desde a década de 2010, passou a ser criada comercialmente em escala industrial como inseto-alimento para a indústria de animais de estimação, o que reduziu a pressão de coleta sobre populações silvestres ${sourceIds["wikipedia-gryllus-assimilis"]}. É importante notar que a identificação morfológica de espécimes do gênero *Gryllus* é desafiadora: estudos de bioacústica (análise do sonograma do canto) e de código de barras de DNA (gene COI) revelaram a existência de pelo menos duas espécies-irmãs crípticas anteriormente confundidas com *G. assimilis*, de modo que a identificação segura ao nível de espécie em material de coleção didática depende dessas análises complementares, não sendo garantida por morfologia externa isoladamente ${sourceIds["bioone-sister-species"]}.` }, "SOURCES"], "right": ["PROPERTIES"] } };
}

function buildArticleContent_larva_mosca_1(sourceIds: Record<string, number>) {
  return { "sections": { "left": ["TOC"], "center": [{ "type": "text", "content": `# Morfologia

A *Musca domestica* é um díptero da família Muscidae. O adulto mede entre 6 e 7 mm de comprimento, com envergadura de asas de 13 a 15 mm ${sourceIds["wikipedia-housefly-en"]}. O tórax exibe quatro linhas longitudinais escuras características, e o par único de asas membranosas apresenta uma veia medial com curvatura ascendente típica ${sourceIds["wikipedia-housefly-en"]}.

A larva, popularmente chamada de "larva de mosca" neste espécime, é vermiforme, ápoda (sem patas), afilada na extremidade da boca e mede entre 3 e 9 mm de comprimento ao longo de seu desenvolvimento ${sourceIds["wikipedia-housefly-en"]}. Detalhes estruturais da larva, incluindo espiráculos posteriores, podem ser observados em ilustrações históricas ${sourceIds["commons-cat-musca-domestica"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/a/a2/PSM_V76_D217_House_fly_larva_and_structure_details.png" }, { "type": "text", "content": `# Distribuição Geográfica

A mosca doméstica é provavelmente o inseto com a distribuição mais ampla do mundo, estando presente em todas as regiões povoadas da Europa, Ásia, África, Australásia e Américas ${sourceIds["wikipedia-housefly-en"]}. Sua presença está fortemente associada a ambientes antrópicos, onde encontra matéria orgânica em decomposição para oviposição.` }, { "type": "text", "content": `# Comportamento

O ciclo de vida da *Musca domestica* passa por quatro estágios: ovo, larva, pupa e adulto, completando-se em cerca de 7 a 10 dias em condições ótimas, podendo se estender por até 2 meses em condições adversas ${sourceIds["wikipedia-housefly-en"]}.

Os ovos são depositados em matéria orgânica em decomposição, como fezes e restos de alimentos, e eclodem em menos de um dia ${sourceIds["wikipedia-housefly-en"]}. A larva passa por três instares ao longo do desenvolvimento larval, que dura de 2 semanas em condições ótimas a mais de 30 dias em clima frio, alimentando-se da matéria orgânica onde foi depositada ${sourceIds["wikipedia-housefly-en"]}. Ao atingir a maturidade, a larva migra para áreas mais secas, onde forma a pupa, que completa seu desenvolvimento em 2 a 6 dias a 35°C ou mais de 20 dias a 14°C ${sourceIds["wikipedia-housefly-en"]}. Os adultos emergem da pupa e vivem normalmente de 2 a 4 semanas, alimentando-se de matéria animal, carniça, fezes, substâncias açucaradas e frutas e vegetais em decomposição ${sourceIds["wikipedia-housefly-en"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/0/09/Life_Cycle_of_the_House_Fly%2C_extracted_from_Flies_of_public_health_importance_and_their_control_%281976%29.png" }, { "type": "text", "content": `# Conservação

A *Musca domestica* não possui status de conservação avaliado, pois é uma espécie sinantrópica extremamente comum e amplamente distribuída, sem risco de extinção ${sourceIds["wikipedia-housefly-en"]}.` }], "right": ["PROPERTIES"] } };
}

function buildArticleContent_mariposa(sourceIds: Record<string, number>) {
  return { "sections": { "left": ["TOC"], "center": [{ "type": "text", "content": `# Morfologia

*Ascalapha odorata*, conhecida popularmente no Brasil como mariposa-bruxa, bruxa-negra ou mariposa-negra, é uma das maiores mariposas das Américas: fêmeas podem atingir envergadura de até 24 cm, enquanto os machos são um pouco menores, chegando a cerca de 12 cm ${sourceIds["wikipedia-en"]}. A espécie apresenta corpo robusto e asas de formato que lembra o de um morcego em voo, com a superfície dorsal em tons acastanhados mosqueados, com reflexos iridescentes em roxo e rosa ${sourceIds["wikipedia-en"]}.

Machos e fêmeas são facilmente diferenciados: as fêmeas exibem uma faixa esbranquiçada e perolada cruzando a linha submarginal das asas, enquanto os machos possuem coloração acinzentada mais uniforme, sem essa faixa ${sourceIds["breedingbutterflies"]}. Em ambos os sexos, uma marca diagnóstica em forma de número nove (ou vírgula), geralmente verde com realces alaranjados, aparece em cada asa anterior ${sourceIds["wikipedia-en"]}. As lagartas, por sua vez, podem alcançar até 7 cm de comprimento, com padrões intricados de manchas e listras pretas e marrom-esverdeadas ${sourceIds["wikipedia-en"]}. Os adultos têm hábito frugívoro, alimentando-se de frutos muito maduros, sobretudo banana ${sourceIds["wikipedia-en"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/8/80/Ascalapha_odorata_%28Erebidae%29_I.jpg" }, { "type": "text", "content": "*Ascalapha odorata* em repouso, exibindo o padrão de coloração mosqueado e a marca em forma de número nove na asa anterior." }, { "type": "text", "content": `# Distribuição Geográfica

*Ascalapha odorata* tem distribuição ampla nas Américas, ocorrendo desde o sul dos Estados Unidos, passando pelo México e América Central, até a Mata Atlântica, no Brasil, no Paraguai e na Argentina ${sourceIds["wikipedia-en"]}. A espécie é encontrada com maior frequência em florestas tropicais e áreas arbustivas tropicais, mas é capaz de voos de longa distância, sendo registrada ocasionalmente até em regiões temperadas do Canadá e do Havaí durante migrações sazonais ${sourceIds["breedingbutterflies"]}.

No Brasil, é relatada em diferentes biomas associados à Mata Atlântica, incluindo registros documentados no estado do Rio de Janeiro; é comum que indivíduos adultos sejam encontrados acidentalmente dentro de residências, abrigados em armários e cantos escuros durante o dia ${sourceIds["breedingbutterflies"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/4/45/2014-12-09_-_Mariposa_no_meu_arm%C3%A1rio.jpg" }, { "type": "text", "content": "Exemplar de *Ascalapha odorata* fotografado dentro de um armário residencial no Brasil, comportamento comum da espécie durante o repouso diurno." }, { "type": "text", "content": `# Conservação

*Ascalapha odorata* não possui avaliação formal na Lista Vermelha da IUCN, sendo classificada como NE (not evaluated) ${sourceIds["idfg-idaho"]}. Essa ausência de avaliação é comum entre espécies de insetos com distribuição geográfica muito ampla e populações aparentemente abundantes e estáveis, como é o caso desta mariposa, que ocorre de forma contínua desde a América do Norte até o sul da América do Sul ${sourceIds["wikipedia-en"]}.

No Brasil, a espécie é frequentemente associada a crenças populares: é vista por algumas pessoas como um mau agouro, anunciando má sorte ou morte quando entra em uma residência, o que ocasionalmente leva ao abate de indivíduos encontrados dentro de casas — uma pressão pontual sobre a espécie que, no entanto, não compromete suas populações amplas e bem distribuídas ${sourceIds["breedingbutterflies"]}.` }, "SOURCES"], "right": ["PROPERTIES"] } };
}

function buildArticleContent_barata(sourceIds: Record<string, number>) {
  return { "sections": { "left": ["TOC"], "center": [{ "type": "text", "content": `# Morfologia

A *Periplaneta americana* e a maior especie comum de barata, atingindo em media cerca de 4 cm de comprimento ${sourceIds["wikipedia-american-cockroach"]}. Possui coloracao castanho-avermelhada com uma margem amarelada caracteristica ao redor do pronoto, a placa que recobre a cabeca ${sourceIds["tamu-urban-entomology"]}. O corpo e oval e achatado, com um par de asas anteriores coriaceas totalmente desenvolvidas que recobrem asas posteriores membranosas; apesar disso, o voo e raro, sendo mais comum o planar ${sourceIds["tamu-urban-entomology"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/b/bd/American_cockroach.jpg" }, { "type": "text", "content": "*Periplaneta americana* adulta, evidenciando a coloracao castanho-avermelhada e a margem amarelada do pronoto." }, { "type": "text", "content": `# Distribuição Geográfica

Apesar do nome popular, a especie e nativa da Africa e do Oriente Medio, tendo sido introduzida no continente americano ja no seculo XVII por meio do comercio maritimo ${sourceIds["wikipedia-american-cockroach"]}. Atualmente apresenta distribuicao praticamente cosmopolita como resultado do comercio global, estando fortemente associada a ambientes urbanos e sinantropicos, como sistemas de esgoto, poroes e areas proximas a tubulacoes de aquecimento, de onde invade cozinhas e banheiros ${sourceIds["tamu-urban-entomology"]}.` }, { "type": "text", "content": `# Conservação

Por se tratar de uma especie sinantropica, cosmopolita e amplamente disseminada por meio da atividade humana, a *Periplaneta americana* nao consta nas listas de especies ameacadas, sendo tratada principalmente como praga urbana de importancia sanitaria em vez de alvo de esforcos de conservacao ${sourceIds["wikipedia-american-cockroach"]}.` }, "SOURCES"], "right": ["PROPERTIES"] } };
}

function buildArticleContent_ovo_mosca(sourceIds: Record<string, number>) {
  return { "sections": { "left": ["TOC"], "center": [{ "type": "text", "content": `# Morfologia

O ovo de *Musca domestica* é branco, alongado e em formato semelhante a um pequeno grão de arroz ou banana, medindo cerca de 1.2 mm de comprimento ${sourceIds["wikipedia-housefly"]}. As fêmeas depositam os ovos em pequenos aglomerados sobre matéria orgânica em decomposição, como fezes, lixo orgânico e carcaças, substrato ideal para a alimentação das larvas após a eclosão ${sourceIds["ufl-featured-creatures-housefly"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Housefly_eggs%2C_larvae%2C_pupa_and_mature_fly.jpg/768px-Housefly_eggs%2C_larvae%2C_pupa_and_mature_fly.jpg" }, { "type": "text", "content": `# Comportamento

Cada postura contém entre 75 e 150 ovos, e uma única fêmea pode depositar até 500 ovos ao longo da vida, em diversas posturas sucessivas ${sourceIds["wikipedia-housefly"]}. Em condições favoráveis de temperatura e umidade, a eclosão das larvas ocorre em menos de um dia após a oviposição ${sourceIds["wikipedia-housefly"]}. O desenvolvimento completo — do ovo ao adulto — passa pelos estágios de larva (vulgarmente chamada de larva ou "bicheira") e pupa, podendo ser concluído em poucos dias sob calor intenso ${sourceIds["ufl-featured-creatures-housefly"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/PSM_V15_D637_Chrysalis_and_egg_of_house_fly.jpg/500px-PSM_V15_D637_Chrysalis_and_egg_of_house_fly.jpg" }, { "type": "text", "content": `# Distribuição Geográfica

*Musca domestica* é considerada a espécie de inseto com a distribuição mais ampla do mundo, estando presente em praticamente todas as regiões povoadas da Europa, Ásia, África, Oceania e Américas ${sourceIds["wikipedia-housefly"]}. Acredita-se que a espécie tenha se originado na região sul do Paleártico, especialmente no Oriente Médio, e se espalhado globalmente como espécie comensal do ser humano ${sourceIds["wikipedia-housefly"]}.` }, { "type": "text", "content": `# Conservação

Por sua ampla distribuição, abundância e estreita associação com ambientes humanos, *Musca domestica* não apresenta nenhum status de ameaça ou preocupação de conservação; ao contrário, é tratada globalmente como espécie sinantrópica e praga sanitária, relevante pelo seu papel na transmissão mecânica de patógenos ${sourceIds["ufl-featured-creatures-housefly"]}.` }], "right": ["PROPERTIES"] } };
}

function buildArticleContent_larva_mosca_2(sourceIds: Record<string, number>) {
  return { "sections": { "left": ["TOC"], "center": [{ "type": "text", "content": `A *Chrysomya megacephala* é uma mosca da família Calliphoridae, popularmente conhecida como mosca varejeira ${sourceIds["embrapa-bacteria-sinop"]}. É uma espécie originária das regiões Oriental e Australásica, introduzida acidentalmente no Brasil na década de 1970 e hoje amplamente distribuída pelo país ${sourceIds["wikipedia-en-chrysomya"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/8/86/Ch.megacephala_wiki.jpg" }, { "type": "text", "content": "Fêmea adulta de *Chrysomya megacephala*" }, { "type": "text", "content": `# Morfologia

Os adultos apresentam coloração metálica azul-esverdeada no tórax e abdômen, com genas (bochechas) amarelas e olhos vermelhos grandes; nos machos os olhos ficam próximos entre si, enquanto nas fêmeas estão mais afastados ${sourceIds["wikipedia-en-chrysomya"]}. O corpo do adulto costuma superar 10 mm de comprimento ${sourceIds["lucidcentral-carrion-flies"]}. As larvas passam por três estádios: a larva de primeiro estádio mede entre 1,7 e 3,5 mm, a de segundo estádio entre 6 e 8 mm, e a larva de terceiro estádio atinge cerca de 16 mm, variando conforme a temperatura; cada estádio é identificado pelo número de fendas nos espiráculos posteriores ${sourceIds["pmc-forensic-review"]}.` }, { "type": "column", "columns": [[{ "type": "text", "content": `# Distribuição Geográfica

A espécie é mais comum nas regiões Oriental e Australásica, tendo se expandido desde a década de 1970 para a Nova Zelândia, África e Américas ${sourceIds["wikipedia-en-chrysomya"]}. No estado do Rio de Janeiro, onde está o campus Pinheiral do IFRJ, *C. megacephala* é a espécie de califorídeo mais abundante em levantamentos realizados no município de Paracambi, aparecendo em áreas urbanas (56,31%), rurais (59%) e florestais (48,27%), com o maior índice de sinantropia entre as espécies estudadas ${sourceIds["ufjf-paracambi-sinantropia"]}.` }], [{ "type": "text", "content": `# Comportamento

O ciclo de vida completo, do ovo ao adulto, ocorre em cerca de 7 a 10 dias em condições favoráveis de temperatura ${sourceIds["pmc-forensic-review"]}. As fêmeas depositam entre 200 e 300 ovos sobre fezes, carne ou peixe em decomposição, e a fase larval dura em média 5,4 dias, passando por três instares antes da pupa ${sourceIds["wikipedia-en-chrysomya"]}. É uma espécie necrófaga, de grande importância na entomologia forense por colonizar carcaças poucos minutos após a morte ${sourceIds["pmc-forensic-review"]}.` }]] }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/8/85/Chrysomya_megacephala_-_Larval_state_pois.jpg" }, { "type": "text", "content": "Larvas (vermes) de *Chrysomya megacephala* em decomposição orgânica" }, { "type": "text", "content": `# Conservação

Por ser uma espécie sinantrópica, comum e de ampla distribuição global, *Chrysomya megacephala* não consta em listas de conservação, não havendo avaliação de risco de extinção associada a ela. Pelo contrário, é considerada de importância sanitária: atua como vetor mecânico de bactérias, protozoários e ovos de helmintos, podendo causar miíase facultativa em feridas de vertebrados ${sourceIds["pmc-forensic-review"]}. No Brasil, estudos já identificaram diversas espécies bacterianas associadas a exemplares da espécie, reforçando sua relevância epidemiológica ${sourceIds["embrapa-bacteria-sinop"]}.` }, "SOURCES"], "right": ["PROPERTIES"] } };
}

function buildArticleContent_larva_mosca_3(sourceIds: Record<string, number>) {
  return { "sections": { "left": ["TOC"], "center": [{ "type": "text", "content": `# Morfologia

A *Lucilia sericata*, popularmente conhecida como mosca-varejeira-verde, é um díptero da família Calliphoridae. O adulto mede entre 10 e 14 milímetros de comprimento e apresenta coloração metálica verde-azulada ou dourada com marcações pretas, cerdas curtas e esparsas no tórax e três sulcos transversais visíveis ${sourceIds["wikipedia-lucilia-sericata"]}. As larvas — estágio correspondente ao espécime catalogado como CPINHEXA11 — são cônicas, de coloração amarelo-pálida a acinzentada, medindo entre 10 e 14 milímetros no terceiro ínstar, e respiram por um par de espiráculos posteriores ${sourceIds["wikipedia-lucilia-sericata"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/c/ca/Larven_Lucilia_sericata.jpg" }, { "type": "text", "content": "Larvas de Lucilia sericata em diferentes estágios de desenvolvimento (Wikimedia Commons / Enter, CC BY-SA 3.0)" }, { "type": "text", "content": `# Distribuição Geográfica

A espécie está presente na maior parte do mundo, em regiões temperadas e tropicais da Europa, África, Austrália e Américas, preferindo climas quentes e úmidos — por isso é especialmente comum em regiões costeiras, embora também ocorra em áreas áridas ${sourceIds["wikipedia-lucilia-sericata"]}.` }, { "type": "column", "columns": [[{ "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/a/ae/Common_green_bottle_fly_%28Lucilia_sericata%29.jpg" }, { "type": "text", "content": "Adulto de L. sericata (Wikimedia Commons / Pawel Wiecek, CC BY-SA 2.0)" }], [{ "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/8/80/Lucilia_sericata_8676.jpg" }, { "type": "text", "content": "Adulto de L. sericata, sul da Alemanha (Wikimedia Commons / Amada44, CC BY-SA 4.0)" }]] }, { "type": "text", "content": `# Comportamento

O ciclo de vida completo dura entre duas e três semanas. As fêmeas depositam de 150 a 200 ovos por postura, podendo produzir entre 2.000 e 3.000 ovos ao longo da vida; os ovos eclodem entre nove horas e três dias após a postura. As larvas passam por três ínstares antes de empupar, processo que dura de 6 a 14 dias. Em climas temperados frios a espécie completa de três a quatro gerações por ano, e mais em regiões mais quentes ${sourceIds["wikipedia-lucilia-sericata"]}. As larvas alimentam-se exclusivamente de tecido orgânico morto, enquanto os adultos consomem carniça, fezes, pólen e néctar ${sourceIds["wikipedia-lucilia-sericata"]}. A espécie tem grande importância forense, sendo geralmente uma das primeiras a colonizar um cadáver, o que permite estimar o intervalo post-mortem ${sourceIds["wikipedia-lucilia-sericata"]}. Suas larvas também são usadas em terapia larval para debridamento de feridas, inclusive reduzindo níveis de bacteremia em pacientes infectados por MRSA ${sourceIds["wikipedia-lucilia-sericata"]}${sourceIds["xataka-mosca-varejeira-terapia-larval"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/b/bd/Larven_der_Lucillia_sericata_im_BioBag.jpg" }, { "type": "text", "content": "Larvas de L. sericata em BioBag usado em terapia larval (Wikimedia Commons / Enter, CC BY-SA 4.0)" }, { "type": "text", "content": `# Conservação

Não há avaliação específica de status de conservação para *Lucilia sericata* nas bases consultadas; trata-se de uma espécie sinantrópica, amplamente distribuída e abundante, sem indícios de ameaça ${sourceIds["gbif-lucilia-sericata"]}.` }, "SOURCES"], "right": ["PROPERTIES"] } };
}

function buildArticleContent_larva_mosca_4(sourceIds: Record<string, number>) {
  return { "sections": { "left": ["TOC"], "center": [{ "type": "text", "content": `*Chrysomya albiceps* (Wiedemann, 1819) é uma mosca da família Calliphoridae, popularmente conhecida no Brasil como mosca-varejeira ${sourceIds["uninga-forense-maringa"]}. O espécime catalogado corresponde a uma larva dessa espécie, diferente de outras larvas de mosca já registradas no acervo.` }, { "type": "text", "content": "# Morfologia" }, { "type": "text", "content": `Os adultos medem entre 6 e 9 millimeter de comprimento, apresentando coloração metálica azul-esverdeada no tórax e abdômen, com asas transparentes ${sourceIds["wikipedia-en-chrysomya-albiceps"]}. Machos possuem fronte muito estreita com olhos próximos entre si, enquanto as fêmeas apresentam a fronte de coloração marrom-escura a preta ${sourceIds["wikipedia-en-chrysomya-albiceps"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/a/ad/Chrysomya_albiceps_01.JPG" }, { "type": "text", "content": "Exemplar adulto de *Chrysomya albiceps*. Crédito: AfroBrazilian/Wikimedia Commons." }, { "type": "text", "content": "# Distribuição Geográfica" }, { "type": "text", "content": `Originária da África, sul da Europa e Ásia, a espécie se expandiu para regiões neotropicais a partir da década de 1970, sendo atualmente muito comum em regiões mediterrâneas ${sourceIds["wikipedia-en-chrysomya-albiceps"]}. No Brasil, estudos realizados no Pantanal registraram *C. albiceps* como a espécie mais abundante entre os califorídeos coletados, com dois picos populacionais anuais ${sourceIds["embrapa-pantanal-sazonalidade"]}. A espécie também foi registrada entre os califorídeos de importância forense coletados em Maringá, Paraná ${sourceIds["uninga-forense-maringa"]}.` }, { "type": "text", "content": "# Comportamento" }, { "type": "text", "content": `Os adultos se alimentam de matéria em decomposição, excrementos e flores ${sourceIds["wikipedia-en-chrysomya-albiceps"]}. As larvas, em seus estágios finais, tornam-se predadoras facultativas, alimentando-se de larvas de outras espécies de dípteros e praticando canibalismo ${sourceIds["wikipedia-en-chrysomya-albiceps"]}. Em condições de temperatura entre 20 e 30 degree celsius, o ciclo de vida completo, do ovo ao adulto, dura cerca de 66 day, com oviposição ideal entre 25 e 27 degree celsius ${sourceIds["wikipedia-en-chrysomya-albiceps"]}. Por sua capacidade de detectar matéria orgânica em decomposição a longas distâncias, costuma ser um dos primeiros insetos a colonizar carcaças, o que lhe confere grande importância na entomologia forense ${sourceIds["uninga-forense-maringa"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/9/99/Chrysomya_albiceps_eating.jpg" }, { "type": "text", "content": "Adulto se alimentando de carne em decomposição. Crédito: Muhammad Mahdi Karim/Wikimedia Commons." }, { "type": "text", "content": "# Conservação" }, { "type": "text", "content": `*Chrysomya albiceps* não possui avaliação formal de status de conservação, sendo tratada como espécie exótica invasora nas Américas desde sua chegada ao Brasil ao final da década de 1970 ${sourceIds["unesp-predacao-cochliomyia"]}. Sua introdução foi associada a um declínio súbito nas populações de *Cochliomyia macellaria*, espécie nativa das Américas, uma vez que as larvas de *C. albiceps* predam preferencialmente larvas dessa espécie nativa em relação a outras espécies de Chrysomya ${sourceIds["unesp-predacao-cochliomyia"]}.` }, "SOURCES"], "right": ["PROPERTIES"] } };
}

function buildArticleContent_pupa_mosca(sourceIds: Record<string, number>) {
  return { "sections": { "left": ["TOC"], "center": [{ "type": "text", "content": `# Morfologia

O espécime catalogado corresponde à fase de pupa de *Musca domestica*, popularmente conhecida como mosca-doméstica, inseto da família Muscidae (ordem Diptera). O adulto mede entre 6 e 7 mm de comprimento, com envergadura de 13 a 15 mm ${sourceIds["wikipedia-en-musca-domestica"]}. O tórax apresenta coloração cinzenta com quatro linhas longitudinais escuras na superfície dorsal, e os olhos compostos são avermelhados, sendo mais afastados entre si nas fêmeas ${sourceIds["wikipedia-pt-musca-domestica"]}${sourceIds["wikipedia-en-musca-domestica"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/e/ef/Housefly_eggs%2C_larvae%2C_pupa_and_mature_fly.jpg" }, { "type": "text", "content": `# Comportamento

O ciclo de vida de *Musca domestica* passa por ovo, larva (três ínstares), pupa e adulto. O pupário é cilíndrico, com extremidades arredondadas, medindo cerca de 8 mm de comprimento, e sua coloração muda de amarelada no início para vermelha, castanha e, por fim, quase negra à medida que a pupa envelhece ${sourceIds["wikipedia-en-musca-domestica"]}. A duração da fase pupal é bastante variável: entre 2 e 6 dias a 35 °C, podendo se estender a 20 dias ou mais a 14 °C ${sourceIds["wikipedia-en-musca-domestica"]}. Ao final da pupação, o adulto rompe uma das extremidades do pupário com um corte circular e emerge voando ${sourceIds["wikipedia-pt-musca-domestica"]}. Em condições naturais, o ciclo completo — do ovo ao adulto — dura de 25 a 30 dias ${sourceIds["wikipedia-pt-musca-domestica"]}, podendo ser tão curto quanto 7 a 10 dias em condições ótimas de laboratório ou se estender por até dois meses em condições adversas ${sourceIds["wikipedia-en-musca-domestica"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/f/f5/Housefly_pupae_killed_by_wasp_larvae.jpg" }, { "type": "text", "content": `# Distribuição Geográfica

*Musca domestica* é um dos insetos de distribuição mais ampla no mundo, presente em praticamente todos os climas habitados pelo ser humano, do Ártico aos trópicos, incluindo Europa, Ásia, África, Australásia e as Américas ${sourceIds["wikipedia-en-musca-domestica"]}. É considerada uma presença habitual na maioria dos climas da Terra ${sourceIds["wikipedia-pt-musca-domestica"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/0/09/Life_Cycle_of_the_House_Fly%2C_extracted_from_Flies_of_public_health_importance_and_their_control_%281976%29.png" }, { "type": "text", "content": `# Conservação

*Musca domestica* não possui avaliação de risco pela Lista Vermelha da IUCN, sendo classificada como "espécie não avaliada" ${sourceIds["wikipedia-pt-musca-domestica"]}. Por sua ampla distribuição, abundância e estreita associação com ambientes humanos e de criação animal, não é considerada uma espécie ameaçada, não havendo medidas de conservação direcionadas a ela.` }, "SOURCES"], "right": ["PROPERTIES"] } };
}

function buildArticleContent_mosca(sourceIds: Record<string, number>) {
  return { "sections": { "left": ["TOC"], "center": [{ "type": "text", "content": `# Morfologia

*Musca domestica*, popularmente conhecida como mosca-doméstica, é um díptero de pequeno porte, medindo entre 6 e 7 mm de comprimento, com envergadura de 13 a 15 mm ${sourceIds["wikipedia-en-housefly"]}. O tórax apresenta coloração que varia de cinza a preto, exibindo quatro linhas longitudinais escuras no dorso, enquanto o abdômen tem tonalidade amarelada na porção inferior ${sourceIds["wikipedia-pt-musca-domestica"]}. Os olhos compostos são avermelhados e processam informação visual cerca de sete vezes mais rápido que os olhos humanos ${sourceIds["wikipedia-en-housefly"]}. As fêmeas são ligeiramente maiores e apresentam maior distância entre os olhos do que os machos ${sourceIds["wikipedia-pt-musca-domestica"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/b/b6/Housefly_musca_domestica.jpg" }, { "type": "column", "columns": [[{ "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/3/33/Detail_of_a_Housefly_%28Musca_domestica%29_at_8%C3%97_Magnification.jpg" }], [{ "type": "text", "content": `A espécie possui um único par de asas membranosas funcionais; o segundo par foi reduzido a halteres, pequenas estruturas usadas para equilíbrio durante o voo ${sourceIds["wikipedia-pt-musca-domestica"]}. As patas contam com almofadas adesivas (pulvilos) e quimiorreceptores tarsais, que permitem caminhar sobre superfícies verticais lisas e identificar o sabor dos alimentos ao se apoiarem sobre eles ${sourceIds["wikipedia-en-housefly"]}.` }]] }, { "type": "text", "content": `# Distribuição Geográfica

*Musca domestica* é provavelmente o inseto com a distribuição mais ampla do mundo, estando presente tanto no Ártico quanto nos trópicos, em praticamente todos os continentes habitados pelo ser humano ${sourceIds["wikipedia-en-housefly"]}. Sua ocorrência está fortemente associada a ambientes antrópicos, sendo encontrada com frequência próxima a residências, estábulos e locais de descarte de lixo orgânico, em praticamente todos os climas da Terra ${sourceIds["wikipedia-pt-musca-domestica"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/1/14/Common_house_fly%2C_Musca_domestica.jpg" }, { "type": "text", "content": `# Conservação

A espécie não possui avaliação de status de conservação pela IUCN (categoria "Not Evaluated"), o que é esperado para um inseto sinantrópico extremamente comum e amplamente distribuído ${sourceIds["wikipedia-pt-musca-domestica"]}. As larvas desempenham papel ecológico relevante na decomposição de matéria orgânica, enquanto os adultos são reconhecidos como vetores mecânicos de patógenos como os causadores de febre tifoide, cólera, salmonelose, disenteria bacilar e, ocasionalmente, miíase, devido ao hábito de regurgitar alimento previamente ingerido sobre superfícies de contato ${sourceIds["wikipedia-pt-musca-domestica"]}. Em condições ótimas, o ciclo de vida completo — do ovo ao adulto — dura entre 7 e 10 dias, podendo haver mais de 20 gerações por ano em regiões tropicais ${sourceIds["wikipedia-en-housefly"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/2/21/Mosca_domestica.jpg" }, "SOURCES"], "right": ["PROPERTIES"] } };
}

function buildArticleContent_besouro_chifre(sourceIds: Record<string, number>) {
  return { "sections": { "left": ["TOC"], "center": [{ "type": "text", "content": `# Morfologia

Os *Dynastinae*, popularmente chamados de besouro-de-chifre, besouro-rinoceronte ou besouro-escaravelho, formam um grupo peculiar dentro dos Scarabaeidae, com espécies que podem superar 20 cm de comprimento total e apresentar estruturas diferenciadas na cabeça e no protórax, como chifres, o que os torna um dos grupos mais exóticos entre os coleópteros ${sourceIds["andreazze-motta-2002"]}. De modo geral, os indivíduos da subfamília atingem mais de 15 cm de comprimento ${sourceIds["wikipedia-dynastinae"]}. Os machos possuem dimorfismo sexual acentuado: cada um tem um chifre na cabeça e outro apontando para frente a partir do centro do tórax, usados em disputas contra outros machos durante a estação de reprodução e também para escavar ${sourceIds["wikipedia-dynastinae"]}. As fêmeas, em contraste, não apresentam esses chifres, como ilustrado pelo espécime fêmea de *Dynastes hercules* abaixo.` }, { "type": "column", "columns": [[{ "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/0/0e/Dynastes_hercules_ecuatorianus_MHNT.jpg" }], [{ "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/d/d0/Dynastes_hercules_%28female%29.jpg" }]] }, { "type": "text", "content": `As larvas se alimentam de madeira em decomposição, enquanto os adultos consomem néctar, seiva de plantas e frutos ${sourceIds["wikipedia-dynastinae"]}. São conhecidas mais de 1.500 espécies e 225 gêneros de besouros-rinoceronte em todo o mundo ${sourceIds["wikipedia-dynastinae"]}.` }, { "type": "text", "content": `# Distribuição Geográfica

A subfamília *Dynastinae* tem distribuição predominantemente tropical e subtropical, com representantes amplamente registrados no Brasil, incluindo a região amazônica ${sourceIds["andreazze-motta-2002"]}. O gênero *Megasoma*, por exemplo, ocorre na Bolívia, no Brasil, na Colômbia, no Equador, na Guiana Francesa, na Guiana, no Panamá, no Peru, no Suriname e na Venezuela ${sourceIds["wikipedia-actaeon-beetle"]}, incluindo espécimes coletados em território brasileiro, como o exemplar de *Megasoma actaeon* fotografado abaixo.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/b/b6/Megasoma_actaeon_Brazil.jpg" }, { "type": "text", "content": "# Conservação\n\nNão foram localizadas avaliações formais de status de conservação específicas para a subfamília *Dynastinae* como um todo nas fontes consultadas. A pressão sobre populações de besouros-de-chifre no Brasil está associada principalmente à perda de habitat florestal e, em algumas regiões, à coleta para o comércio de colecionadores, mas nenhuma das fontes aqui citadas quantifica esse impacto, de modo que o item permanece sem atributo numérico associado nesta ficha." }, "SOURCES"], "right": ["PROPERTIES"] } };
}

function buildArticleContent_lagarta_borboleta(sourceIds: Record<string, number>) {
  return { "sections": { "left": ["TOC"], "center": [{ "type": "text", "content": `# Morfologia

*Heliconius erato phyllis* é uma subespécie de borboleta diurna da família Nymphalidae. Os adultos apresentam envergadura de cerca de 6,7 a 8,0 cm, com asas de coloração predominantemente vermelha, preta e branca, variando entre fenótipos com faixas amarelas ou brancas nas asas anteriores e posteriores ${sourceIds["wikipedia-heliconius-erato"]}. A lagarta, em seu último (quinto) ínstar, possui corpo branco com manchas pretas e laranjas, espinhos escuros ramificados e cabeça amarela — padrão bem diferente dos ínstares iniciais, que são crípticos e providos de uma pequena placa protorácica escura ${sourceIds["wikipedia-heliconius-erato"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/b/be/Heliconius_erato_caterpillar.jpg" }, { "type": "text", "content": "Lagarta de quinto ínstar de Heliconius erato, Porto Alegre (RS)." }, { "type": "text", "content": `# Comportamento

As fêmeas depositam de um a quatro ovos amarelos por dia, isoladamente, preferencialmente em brotos terminais, gavinhas jovens e folhas novas de espécies de maracujá (*Passiflora*), como *P. misera*, *P. suberosa* e *P. actinia* ${sourceIds["wikipedia-heliconius-erato"]}. As lagartas se alimentam exclusivamente dessas plantas hospedeiras e acumulam glicosídeos cianogênicos obtidos da seiva, tornando-se — assim como os adultos — desagradáveis ao paladar de predadores ${sourceIds["wikipedia-heliconius-erato"]}. Essa defesa química sustenta um dos exemplos mais estudados de mimetismo mülleriano: o padrão de coloração de *H. erato* é compartilhado por pelo menos 20 das 27 subespécies de *Heliconius melpomene*, de modo que predadores aprendem a evitar ambas as espécies após experiências negativas com qualquer uma delas ${sourceIds["wikipedia-heliconius-erato"]}. Estudos morfológicos detalhados sobre ovo, larva e pupa de *H. e. phyllis*, com base em microscopia óptica e eletrônica de varredura, foram conduzidos a partir de populações de Porto Alegre, Rio Grande do Sul ${sourceIds["scielo-kaminski-erato-phyllis"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/8/81/Heliconius_erato_caterpillar2.jpg" }, { "type": "text", "content": "Detalhe dos espinhos e das manchas pretas e laranjas da lagarta." }, { "type": "text", "content": `# Distribuição Geográfica

*Heliconius erato* ocorre do sul do Texas ao norte da Argentina e Paraguai, habitando preferencialmente as bordas de florestas tropicais ${sourceIds["wikipedia-heliconius-erato"]}. A subespécie *H. e. phyllis*, a mais amplamente distribuída entre as subespécies de *H. erato*, é encontrada no Brasil ao sul da bacia Amazônica, na Mata Atlântica e em Mato Grosso, além de Paraguai, Uruguai, norte da Argentina e Bolívia ${sourceIds["wikipedia-heliconius-erato-phyllis"]}.` }, { "type": "column", "columns": [[{ "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/e/ea/Heliconius_erato_Richard_Bartz.jpg" }, { "type": "text", "content": "Adulto de H. e. petiverana." }], [{ "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/f/f8/Red_postman_butterfly_%28Heliconius_erato%29.jpg" }, { "type": "text", "content": "Adulto fotografado em Trinidad." }]] }, { "type": "text", "content": `# Conservação

Não há avaliação formal de *Heliconius erato* nas categorias da IUCN. A espécie é descrita como relativamente abundante onde ocorre, favorecida pela ampla distribuição geográfica e pela associação com plantas hospedeiras do gênero *Passiflora*, comuns em bordas de mata ${sourceIds["wikipedia-heliconius-erato"]}.` }, "SOURCES"], "right": ["PROPERTIES"] } };
}

function buildArticleContent_besouros(sourceIds: Record<string, number>) {
  return { "sections": { "left": ["TOC"], "center": [{ "type": "text", "content": "# Morfologia" }, { "type": "text", "content": `*Macrodontia cervicornis* é um dos maiores besouros do mundo quando consideradas as enormes mandíbulas dos machos, que podem corresponder a cerca de um terço do comprimento total do corpo ${sourceIds["wikipedia-en-macrodontia"]}. O comprimento máximo já registrado para a espécie é de 17,7 cm, incluindo as mandíbulas ${sourceIds["wikipedia-en-macrodontia"]}. O corpo é achatado e possui coloração que imita madeira cortada, funcionando como camuflagem, com mandíbulas curvadas e serrilhadas internamente como "dentes" ${sourceIds["wikipedia-pt-macrodontia"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/4/43/Macrodontia_cervicornis_MHNT.jpg" }, { "type": "text", "content": `Há marcante dimorfismo sexual: os machos possuem mandíbulas muito mais desenvolvidas, em formato de galhada, usadas em disputas e na escavação de galerias na madeira, enquanto as fêmeas apresentam mandíbulas proporcionalmente menores ${sourceIds["wikipedia-pt-macrodontia"]}. A fase larval é a mais longa do ciclo de vida, podendo durar até 10 anos, enquanto a fase adulta dura apenas alguns meses ${sourceIds["wikipedia-en-macrodontia"]}. As larvas escavam galerias na madeira em decomposição que podem superar um metro de comprimento e 10 cm de largura ${sourceIds["wikipedia-en-macrodontia"]}.` }, { "type": "text", "content": "# Distribuição Geográfica" }, { "type": "text", "content": `A espécie ocorre em florestas tropicais da região Neotropical, desde a Colômbia e as Guianas até o sul do Brasil, no Paraná, passando também por Equador, Peru, Bolívia e Venezuela, com forte associação à bacia Amazônica ${sourceIds["wikipedia-pt-macrodontia"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/0/00/Macrodontia_cervicornis._Male_155_mm.JPG" }, { "type": "text", "content": "# Conservação" }, { "type": "text", "content": `*Macrodontia cervicornis* é classificada como Vulnerável (VU) na Lista Vermelha da IUCN, principalmente devido à coleta para comércio de souvenirs e colecionismo entomológico ${sourceIds["wikipedia-en-macrodontia"]} ${sourceIds["wikipedia-pt-macrodontia"]}.` }, { "type": "column", "columns": [[{ "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/3/35/Macrodontia_cervicornis._Male_155_mm_2.JPG" }], [{ "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/3/38/Macrodontiacervicornis.JPG" }]] }, "SOURCES"], "right": ["PROPERTIES"] } };
}

function buildArticleContent_besouro_gorgulho(sourceIds: Record<string, number>) {
  return { "sections": { "left": ["TOC"], "center": [{ "type": "text", "content": `O *Sitophilus zeamais* é um besouro da família Curculionidae, popularmente conhecido no Brasil como gorgulho-do-milho ou caruncho-do-milho ${sourceIds["wikipedia-pt"]}. É considerado uma das pragas mais agressivas de grãos armazenados em todo o mundo, atacando tanto a lavoura em pé quanto cereais estocados em depósitos e silos ${sourceIds["embrapa-cir058"]}.` }, { "type": "text", "content": `# Morfologia

O adulto mede entre 2.3 e 4.9 milímetros de comprimento, variando de acordo com a planta hospedeira em que se desenvolveu ${sourceIds["wikipedia-en"]}. Apresenta coloração marrom, com quatro manchas marrom-avermelhadas características nos élitros, um rostro longo e fino e antenas geniculadas (em forma de cotovelo) ${sourceIds["wikipedia-en"]}. A espécie é muito semelhante a *Sitophilus oryzae*, sendo distinguida principalmente pelo tamanho ligeiramente maior e pelo padrão das manchas elitrais ${sourceIds["wikipedia-en"]}. É capaz de voar, percorrendo distâncias de pelo menos 400 metros, com maior atividade de voo entre 15h e 17h ${sourceIds["wikipedia-en"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/e/e8/Maize_Weevil_-_Sitophilus_zeamais_%28side_view%29.jpg" }, { "type": "text", "content": "Vista lateral de um exemplar adulto de Sitophilus zeamais, evidenciando o rostro alongado típico dos curculionídeos." }, { "type": "text", "content": `As fêmeas depositam um ovo dentro de cada grão e podem produzir entre 300 e 400 ovos durante a vida ${sourceIds["wikipedia-en"]}. O desenvolvimento de ovo a adulto dura em média 36 dias, e os adultos sobrevivem de 5 a 8 meses em condições favoráveis, com reprodução ocorrendo entre 15°C e 34°C e umidade relativa mínima de 40% ${sourceIds["wikipedia-en"]}. As larvas se alimentam internamente do grão, muitas vezes deixando apenas a casca ${sourceIds["wikipedia-en"]}.` }, { "type": "text", "content": `# Distribuição Geográfica

A espécie ocorre em regiões quentes e úmidas em todo o mundo, incluindo Brasil, Japão, Espanha, Estados Unidos, Austrália e diversas regiões da África ${sourceIds["wikipedia-en"]}. No Brasil, é reconhecida como praga primária de grande importância econômica para o milho armazenado, devido a seu alto potencial biótico e capacidade de sobreviver em grandes profundidades dentro da massa de grãos ${sourceIds["embrapa-cir058"]}. Além do milho, ataca trigo, arroz, sorgo, aveia, cevada, centeio, trigo-sarraceno e até frutas armazenadas, como maçãs ${sourceIds["wikipedia-en"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/1/1a/Maize_weevil.jpg" }, { "type": "text", "content": "Gorgulho-do-milho sobre grãos de milho armazenados, hospedeiro preferencial da espécie." }, { "type": "text", "content": `# Conservação

*Sitophilus zeamais* não possui estatuto de conservação, pois é uma espécie cosmopolita e abundante, classificada como praga agrícola e de grãos armazenados, e não como espécie ameaçada ${sourceIds["wikipedia-en"]}. Seu manejo é voltado ao controle populacional em sistemas de armazenamento de cereais, e não à proteção da espécie ${sourceIds["embrapa-cir058"]}.` }, "SOURCES"], "right": ["PROPERTIES"] } };
}

function buildArticleContent_inseto_aquatico(sourceIds: Record<string, number>) {
  return { "sections": { "left": ["TOC"], "center": [{ "type": "text", "content": "# Identidade incerta: o que é a \"lacraia d'água\"?\n\nO espécime desta coleção está registrado na planilha de origem apenas pelo nome popular **\"lacraia d'água\"**, uma designação informal e regional que não corresponde a nenhum nome científico padronizado nem a um táxon brasileiro amplamente documentado com esse nome exato. Para chegar a uma identificação defensável, três hipóteses foram avaliadas: (a) um \"percevejo-d'água\" gigante da família Belostomatidae (gêneros *Belostoma* ou *Lethocerus*); (b) um \"bicho-pau-d'água\" ou \"escorpião-d'água-agulha\" do gênero *Ranatra* (família Nepidae); e (c) uma larva aquática alongada de Odonata ou Megaloptera." }, { "type": "text", "content": `# Morfologia

A escolha entre as hipóteses depende diretamente da forma do corpo que o nome "lacraia" sugere: um animal fino, alongado e com aspecto segmentado, lembrando patas dispostas ao longo do comprimento do corpo — a mesma imagem evocada por uma centopeia terrestre.

Os Belostomatidae (hipótese a) têm corpo oval, largo e achatado ${sourceIds["wikipedia-nepidae-en"]}, morfologia que se afasta bastante da silhueta fina de uma "lacraia". Já as larvas aquáticas de Odonata e Megaloptera (hipótese c), embora alongadas, são formas imaturas (náiades/ninfas) raramente designadas por nomes populares de inseto adulto como os demais candidatos, e não há registro consolidado de uso do termo "lacraia d'água" para elas.

A hipótese mais defensável é a (b): o gênero *Ranatra*, família Nepidae, subfamília Ranatrinae. Diferentemente de *Nepa* (achatada), as espécies de *Ranatra* têm corpo fino, cilíndrico e alongado — por isso já são popularmente chamadas em português de "bicho-pau-d'água" e, em inglês, de *water stick insect* ou *needle bug* ${sourceIds["wikipedia-ranatra-en"]}. Essa aparência de "graveto vivo" com patas finas e um longo apêndice caudal filamentoso (o sifão respiratório) ${sourceIds["wikipedia-nepidae-en"]} é visualmente próxima da impressão deixada por uma centopeia (lacraia) terrestre, o que torna plausível que "lacraia d'água" seja um apelido regional alternativo para o mesmo inseto.

**Importante sobre a incerteza:** não foi encontrada, em fontes entomológicas confiáveis, nenhuma referência que ligue explicitamente o termo "lacraia d'água" a *Ranatra* ou a qualquer outro táxon. A associação feita aqui é uma inferência morfológica e de uso popular, não uma confirmação direta. Por essa razão, e por não haver no registro do espécime nenhuma descrição morfológica adicional (medidas, cor, padrão) que permita diferenciar as dezenas de espécies de *Ranatra* existentes — a diversidade é especialmente alta na América do Sul ${sourceIds["wikipedia-ranatra-en"]} —, a identificação foi interrompida no nível de gênero (*Ranatra* sp.), o nível mais específico que pode ser confirmado com responsabilidade.

Corporalmente, os indivíduos do gênero medem entre 2 e 6 cm ${sourceIds["wikipedia-ranatra-en"]}, com as patas anteriores modificadas em formato raptorial, usadas para agarrar presas ${sourceIds["wikipedia-nepidae-en"]}. Na extremidade posterior do abdome há um par de meias-tubos que se encaixam formando um sifão respiratório, funcionando como um "snorkel" que permite ao inseto permanecer submerso por longos períodos ${sourceIds["wikipedia-nepidae-en"]}.` }, { "type": "column", "columns": [[{ "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/f/f0/Ranatra_jamaicana.jpg" }], [{ "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/7/7b/Waterscorpion_%28Ranatra_sp.%29_%2836746834263%29.jpg" }]] }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/2/2b/2013-05-26_15-12-32-Ranatra.JPG" }, { "type": "text", "content": `# Distribuição Geográfica

Os Nepidae ocorrem em todos os continentes, exceto a Antártida, habitando preferencialmente águas doces estagnadas ou de fluxo lento — lagoas, pântanos, canais e riachos ${sourceIds["wikipedia-nepidae-en"]}. Dentro da família, o gênero *Ranatra* é especialmente diverso nas Américas: a maior riqueza de espécies do gênero está na América do Sul, com cerca de 50 espécies descritas, seguida pela Ásia, com aproximadamente 30 ${sourceIds["wikipedia-ranatra-en"]}. O Brasil está inserido nessa região de alta diversidade do gênero, embora a identificação do espécime desta coleção não permita apontar uma espécie brasileira específica.

Ocasionalmente, representantes da família também são encontrados em corpos de água hipersalinos ou salobros, e há até uma espécie cavernícola registrada na Romênia — exceções que demonstram a plasticidade ecológica do grupo ${sourceIds["wikipedia-nepidae-en"]}.` }, { "type": "text", "content": `# Conservação

Não há, nas fontes consultadas, uma avaliação formal de status de conservação para o gênero *Ranatra* ou para a espécie exata deste espécime — o que é esperado, já que a identificação não pôde ser refinada além do nível genérico. De forma geral, insetos aquáticos da família Nepidae dependem diretamente da qualidade e da permanência de corpos de água doce estagnados ou de fluxo lento (lagoas, pântanos, canais e riachos) ${sourceIds["wikipedia-nepidae-en"]}, de modo que a poluição, a drenagem de áreas úmidas e a degradação de margens representam as principais ameaças indiretas ao grupo, ainda que não existam dados populacionais específicos citados nas fontes utilizadas nesta pesquisa.` }, "SOURCES"], "right": ["PROPERTIES"] } };
}

function buildArticleContent_louva_a_deus(sourceIds: Record<string, number>) {
  return { "sections": { "left": ["TOC"], "center": [{ "type": "text", "content": `# Morfologia

Os louva-a-deus pertencem à ordem Mantodea e, mais especificamente, à família *Mantidae*, a maior e mais diversa dentro do grupo ${sourceIds["wikipedia-en-mantis"]}. O corpo é geralmente alongado e estreito (baciliforme), variando de 0,8 a 17 centimeter de comprimento entre as espécies da ordem ${sourceIds["wikipedia-pt-mantodea"]}. A cabeça é triangular, com dois olhos compostos bulbosos, três ocelos e um par de antenas, podendo girar quase 180 degree sobre o protórax flexível para acompanhar presas e predadores ${sourceIds["wikipedia-en-mantis"]}. As pernas dianteiras são raptoriais, com espinhos e projeções semelhantes a dentes que permitem capturar e segurar firmemente a presa, dando origem à postura característica de "oração" que inspira o nome popular ${sourceIds["wikipedia-en-mantis"]}.` }, { "type": "column", "columns": [[{ "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/3/3f/Close_Up_of_praying_mantis.jpg" }, { "type": "text", "content": "Detalhe da cabeça e dos olhos compostos de um exemplar adulto." }], [{ "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/7/71/Mantide_religiosa_%2829551%29.jpg" }, { "type": "text", "content": "Exemplar de *Mantis religiosa*, ilustrando a morfologia típica da família Mantidae." }]] }, { "type": "text", "content": `# Distribuição Geográfica

A ordem Mantodea reúne entre 2.300 e 2.450 espécies, distribuídas por praticamente todas as regiões do planeta, com maior concentração em áreas tropicais, subtropicais e temperadas ${sourceIds["wikipedia-pt-mantodea"]}. No Brasil, estima-se a ocorrência de cerca de 700 espécies, o que faz do país um dos principais centros de diversidade do grupo nas Américas e justifica a presença frequente de representantes da família *Mantidae* em coleções didáticas regionais, como a do estado do Rio de Janeiro ${sourceIds["wikipedia-pt-mantodea"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/d/d7/Praying_mantis_at_Wikimania_Paris.jpg" }, { "type": "text", "content": "Postura característica das pernas dianteiras raptoriais, usadas na captura de presas." }, { "type": "text", "content": `# Conservação

A maioria das espécies de Mantodea, incluindo as da família *Mantidae*, não possui avaliação de risco de extinção amplamente consolidada nas principais listas internacionais, o que reflete tanto a ampla distribuição do grupo quanto a escassez de estudos populacionais específicos. Como predadores vorazes, que se alimentam de insetos, lagartos, pequenos pássaros e mamíferos, os mantódeos ocupam papel relevante nas cadeias alimentares dos ecossistemas onde vivem ${sourceIds["wikipedia-pt-mantodea"]}. A fêmea deposita entre 10 e 400 ovos protegidos por uma ooteca endurecida, e o desenvolvimento é hemimetábolo, com mudas sucessivas até a fase adulta ${sourceIds["wikipedia-pt-mantodea"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/e/ef/Mantis_collecting_techniques.jpg" }, { "type": "text", "content": "Técnicas de coleta de mantódeos em campo, publicadas em manual científico sobre a morfologia do grupo (Brannoch et al., 2017)." }, "SOURCES"], "right": ["PROPERTIES"] } };
}

function buildArticleContent_piolho_de_cobra(sourceIds: Record<string, number>) {
  return { "sections": { "left": ["TOC"], "center": [{ "type": "text", "content": `# Piolho-de-cobra

O *piolho-de-cobra* é o nome popular usado no Brasil para os diplópodes (Classe **Diplopoda**), artrópodes terrestres também chamados de embuás, gongolos ou maria-café ${sourceIds["pt-wikipedia-diplopoda"]}. Como esse nome popular é aplicado de forma genérica a diversas espécies e famílias de milípedes, não sendo possível confirmar uma espécie única a partir do espécime físico, esta ficha documenta o grupo no nível taxonômico mais específico confirmável: a Classe Diplopoda ${sourceIds["gbif-vernacular-diplopoda"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/2/29/A_millipede.jpg" }, { "type": "text", "content": `# Morfologia

Os diplópodes possuem corpo alongado e cilíndrico, dividido em diplossegmentos que carregam dois pares de pernas cada, totalizando entre 34 e 189 pares de pernas na maioria das espécies ${sourceIds["pt-wikipedia-diplopoda"]}. O comprimento varia de cerca de 2 mm até mais de 300 mm nas maiores espécies atuais ${sourceIds["pt-wikipedia-diplopoda"]}. A coloração costuma ser preta ou castanha, podendo apresentar padrões aposemáticos que sinalizam a presença de toxinas a predadores ${sourceIds["pt-wikipedia-diplopoda"]}. Como mecanismo de defesa, secretam substâncias como benzoquinonas, fenóis, terpenoides e cianeto de hidrogênio através de glândulas chamadas ozóporos ${sourceIds["pt-wikipedia-diplopoda"]}.` }, { "type": "text", "content": `# Distribuição Geográfica

O grupo ocorre em todos os continentes, exceto a Antártida, distribuindo-se desde o Círculo Polar Ártico, na Islândia, Noruega e Rússia, até o sul da Argentina ${sourceIds["pt-wikipedia-diplopoda"]}. No Brasil, inclusive na região do Rio de Janeiro, são comumente encontrados em solos de florestas, jardins e outros ambientes úmidos ricos em matéria orgânica em decomposição, da qual se alimentam ${sourceIds["pt-wikipedia-diplopoda"]}.` }, { "type": "column", "columns": [[{ "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/d/de/Red_millipede_on_a_rock_in_a_damp_area.jpg" }], [{ "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/4/43/A_Coiled_Millipede.jpg" }]] }, { "type": "text", "content": `# Conservação

Não há, na literatura consultada, uma avaliação de conservação específica para a Classe Diplopoda como um todo, já que o grupo reúne milhares de espécies distribuídas por todos os continentes habitados, cada uma com seu próprio grau de vulnerabilidade ${sourceIds["pt-wikipedia-diplopoda"]}. Avaliações de risco de extinção, quando existem, são feitas espécie a espécie.` }, "SOURCES"], "right": ["PROPERTIES"] } };
}

function buildArticleContent_lacraia(sourceIds: Record<string, number>) {
  return { "sections": { "left": ["TOC"], "center": [{ "type": "text", "content": `*Scolopendra viridicornis* Newport, 1844, é a espécie de centopeia popularmente associada ao nome "lacraia" mais comum no Brasil, dentre as cerca de dez espécies dessa família registradas no território nacional ${sourceIds["wikipedia-pt-lacraia"]}.` }, { "type": "text", "content": `# Morfologia

O corpo da *Scolopendra viridicornis* é dividido em cabeça e tronco, apresentando um par de antenas articuladas, dois pares de maxilas e um par de forcípulas — apêndices modificados onde se localizam as glândulas de veneno ${sourceIds["wikipedia-pt-lacraia"]}. Os indivíduos podem atingir quase 50 centímetros de comprimento ${sourceIds["wikipedia-pt-lacraia"]}. Quando ameaçada, a lacraia ergue as pernas terminais na tentativa de desviar o ataque para a extremidade posterior do corpo, usando-as para prender o agressor antes de aplicar a picada venenosa com as forcípulas ${sourceIds["wikipedia-en-scolopendra-viridicornis"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/c/c9/Scolopendra_viridicornis.jpg" }, { "type": "text", "content": `# Distribuição Geográfica

*Scolopendra viridicornis* tem localidade-tipo no Brasil, com distribuição associada à Floresta Amazônica e registros em outras regiões do país ${sourceIds["wikipedia-en-scolopendra-viridicornis"]}. É considerada a espécie de lacraia mais comumente encontrada no Brasil, ao lado de outras como *Scolopendra subspinipes*, *Otostigmus scabricauda*, *Cryptops iheringi* e *Octocryptops ferrugineus* ${sourceIds["wikipedia-pt-lacraia"]}.` }, { "type": "column", "columns": [[{ "type": "text", "content": `# Hábitos

É um animal terrestre de hábitos notívagos (noturnos), que se esconde durante o dia em ambientes úmidos, sob folhas e cascas de árvores, podendo ocasionalmente ser encontrada dentro de residências ${sourceIds["wikipedia-pt-lacraia"]}.` }], [{ "type": "text", "content": `# Alimentação

É carnívora e caça ativamente artrópodes, podendo também predar pequenos vertebrados como roedores, sapos, cobras e lagartos, além de agir como necrófaga oportunista ${sourceIds["wikipedia-en-scolopendra-viridicornis"]}.` }]] }, { "type": "text", "content": `# Conservação

Não há avaliação amplamente divulgada de risco de extinção para *Scolopendra viridicornis*, espécie considerada comum e de ampla distribuição no Brasil. Ela é inclusive utilizada na medicina popular do nordeste brasileiro como analgésico, devido à lacraína, um peptídeo de seu veneno com efeito antimicrobiano contra bactérias Gram-negativas ${sourceIds["wikipedia-en-scolopendra-viridicornis"]}.` }, "SOURCES"], "right": ["PROPERTIES"] } };
}

function buildArticleContent_aranhas(sourceIds: Record<string, number>) {
  return { "sections": { "left": ["TOC"], "center": [{ "type": "text", "content": "A *Trichonephila clavipes* (anteriormente classificada como *Nephila clavipes*) é uma aranha orbitela de grande porte, popularmente conhecida como aranha-de-teia-amarela ou aranha-de-fio-de-ouro, amplamente encontrada na Mata Atlântica brasileira." }, { "type": "text", "content": `# Morfologia

As fêmeas de *Trichonephila clavipes* atingem entre 24 mm e 40 mm de comprimento quando adultas, exibindo cefalotórax prateado e um abdômen alongado marrom-alaranjado com duas fileiras de pequenas manchas branco-amareladas; suas pernas apresentam bandas amarelo-escuras e marrons com tufos de pelos em forma de pincel ${sourceIds["wikipedia-en-trichonephila-clavipes"]}. Os machos são dramaticamente menores, medindo cerca de 6 mm — aproximadamente um terço a um quarto do tamanho das fêmeas — e possuem coloração mais simples, com corpo e pernas marrom-escuros ${sourceIds["wikipedia-en-trichonephila-clavipes"]}. A espécie é uma excelente produtora de seda, chegando a utilizar sete tipos diferentes de fios na construção e manutenção de suas teias ${sourceIds["wikipedia-en-trichonephila-clavipes"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/1/1b/Nephila_clavipes_-_Female_and_Male_Above_Rear.JPG" }, { "type": "text", "content": `Dimorfismo sexual: fêmea (maior) e macho (menor) de *Trichonephila clavipes* ${sourceIds["wikipedia-en-trichonephila-clavipes"]}` }, { "type": "text", "content": `# Distribuição Geográfica

No Brasil, a espécie é encontrada ao longo de toda a Mata Atlântica ${sourceIds["wikipedia-pt-trichonephila-clavipes"]}, e sua distribuição geral se estende do sul dos Estados Unidos até a Argentina, ocorrendo de forma abundante nas Antilhas e na América Central ${sourceIds["wikipedia-en-trichonephila-clavipes"]}. As fêmeas constroem teias orbiculares verticais e assimétricas de grandes dimensões — podendo atingir até 2 metros de diâmetro — posicionadas nas bordas de clareiras florestais, trilhas e sobre riachos, aproveitando rotas de voo de insetos ${sourceIds["wikipedia-pt-trichonephila-clavipes"]}.` }, { "type": "column", "columns": [[{ "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/d/d2/Golden_silk_spider_-_Nephila_clavipes.jpg" }], [{ "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/8/82/Aranha-de-fio-de-ouro_%28Trichonephila_clavipes%29.jpg" }]] }, { "type": "text", "content": `# Conservação

A espécie é classificada como Pouco Preocupante (Least Concern) pela IUCN ${sourceIds["wikipedia-en-trichonephila-clavipes"]}. Não é considerada agressiva em relação a humanos, e seu veneno representa pouco risco à saúde de adultos saudáveis ${sourceIds["wikipedia-en-trichonephila-clavipes"]}.` }, "SOURCES"], "right": ["PROPERTIES"] } };
}

function buildArticleContent_aranha_alcapao(sourceIds: Record<string, number>) {
  return { "sections": { "left": ["TOC"], "center": [{ "type": "text", "content": `# Morfologia

As aranhas do gênero *Actinopus* possuem corpo robusto, de coloração geralmente escura, variando entre 10 e 35 milímetros de comprimento ${sourceIds["wikipedia-actinopodidae-en"]}. A região cefálica é destacada e as pernas são relativamente curtas e fortes em relação ao abdômen, características típicas de migalomorfas escavadoras ${sourceIds["wikipedia-actinopodidae-en"]}. Fêmeas tendem a ser mais robustas que os machos, que possuem corpo mais esguio adaptado ao deslocamento em busca de parceiras ${sourceIds["wikipedia-actinopodidae-en"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/5/5e/Actinopus_candango_162777075.jpg" }, { "type": "text", "content": `O gênero *Actinopus* é o representante mais característico da família Actinopodidae no território brasileiro, conhecido popularmente como aranha-de-alçapão ${sourceIds["wikipedia-actinopus-en"]}. Essas aranhas constroem tocas subterrâneas revestidas de seda e fechadas por uma espécie de "tampa" ou alçapão articulado, que pode atingir até 30 centímetros de profundidade ${sourceIds["wikipedia-actinopodidae-en"]}. A toca funciona como abrigo contra predadores e parasitas e também auxilia no controle da temperatura e umidade do microambiente ${sourceIds["wikipedia-actinopodidae-en"]}.

A estratégia de caça é por emboscada: o animal permanece junto à abertura da toca, entreaberta pelo alçapão, e ataca rapidamente insetos que passam ao alcance durante a noite ${sourceIds["wikipedia-actinopodidae-en"]}.` }, { "type": "column", "columns": [[{ "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/3/3e/Actinopus_candango_259059202.jpg" }], [{ "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/7/70/Actinopus_pusillus_-_Alexandre_S._Michelotto_-_1.jpg" }]] }, { "type": "text", "content": `# Distribuição Geográfica

O gênero *Actinopus* reúne mais de 170 espécies descritas, distribuídas predominantemente pela América do Sul, com a maior diversidade registrada no Brasil ${sourceIds["wikispecies-actinopus"]}. Diversas espécies brasileiras recebem nomes derivados de localidades onde foram coletadas, o que reflete a ampla distribuição regional do gênero pelo país ${sourceIds["wikispecies-actinopus"]}. A espécie-tipo, *Actinopus tarsalis*, descrita por Carl Ludwig Koch em 1842, foi originalmente documentada a partir de espécimes do Brasil e da região de Montevidéu ${sourceIds["commons-koch-actinopus-tarsalis"]}.

No Sudeste do país, há registros fotográficos de espécies do gênero, como *Actinopus pusillus*, descrita pelo aracnólogo Cândido Firmino de Mello-Leitão em 1920 e considerada endêmica do Brasil, com observações no estado do Espírito Santo, região vizinha ao Rio de Janeiro ${sourceIds["wikipedia-actinopus-pusillus-en"]} ${sourceIds["commons-actinopus-pusillus-1"]}. Não foi possível confirmar, a partir das fontes consultadas, a identificação do espécime da coleção em nível de espécie; por isso, a identificação apresentada é mantida no nível de gênero (*Actinopus* sp.).` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/c/c3/Koch_1842_Die_Arachniden_fig._753_Actinopus_tarsalis.jpg" }, { "type": "text", "content": `# Conservação

As fontes consultadas não apresentam avaliação formal de status de conservação para o gênero *Actinopus* ou para suas espécies ${sourceIds["wikipedia-actinopus-en"]}. Em relação à interação com humanos, picadas documentadas no Brasil são descritas como de baixa periculosidade, por vezes sem sintomas relevantes, embora o veneno de outros gêneros da mesma família (como o australiano *Missulena*) seja considerado de maior risco à saúde ${sourceIds["wikipedia-actinopodidae-pt"]}. Como ocorre com outras aranhas escavadoras, a principal ameaça a essas espécies está associada à destruição de hábitats de solo, essenciais para a construção de suas tocas.` }, "SOURCES"], "right": ["PROPERTIES"] } };
}

function buildArticleContent_escorpiao_amarelo(sourceIds: Record<string, number>) {
  return { "sections": { "left": ["TOC"], "center": [{ "type": "text", "content": `# Morfologia

O *Tityus serrulatus*, popularmente conhecido como escorpião-amarelo, é um dos maiores representantes peçonhentos do gênero no Brasil, atingindo entre 5 e 7 cm de comprimento ${sourceIds["wikipedia-en"]}. Possui patas e pedipalpos de coloração amarelo-clara, com o tronco em um tom mais escuro de amarelo-acastanhado ${sourceIds["wikipedia-pt"]}. A cauda bulbosa é segmentada e apresenta uma serrilha característica nos 3º e 4º anéis, sendo frequentemente carregada curvada para frente sobre o dorso ${sourceIds["wikipedia-pt"]}${sourceIds["wikipedia-en"]}. Na extremidade da cauda há um ferrão capaz de injetar veneno neurotóxico, usado tanto para imobilizar presas quanto para defesa ${sourceIds["wikipedia-en"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/9/99/Tityus_serrulatus_%28Buthidae%29_%2822768698194%29.jpg" }, { "type": "text", "content": `# Distribuição Geográfica

Originalmente restrito ao estado de Minas Gerais, o escorpião-amarelo expandiu sua distribuição para pelo menos outros 18 estados brasileiros, incluindo Bahia, Ceará, Espírito Santo, Rio de Janeiro, São Paulo e Paraná ${sourceIds["wikipedia-pt"]}. A espécie é endêmica do Brasil ${sourceIds["wikipedia-en"]}. Essa expansão está associada ao desmatamento e à urbanização crescente, já que o animal se adapta bem a esgotos e depósitos de lixo em áreas urbanas, podendo sobreviver meses sem se alimentar devido ao metabolismo lento ${sourceIds["wikipedia-en"]}.` }, { "type": "column", "columns": [[{ "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/d/d7/Tityus_serrulatus_-_Vitor_Corr%C3%AAa_Dias_-_344354886.jpeg" }], [{ "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/c/c2/Tityus_serrulatus_260138359.jpg" }]] }, { "type": "text", "content": `# Importância em Saúde Pública

O veneno do escorpião-amarelo contém a toxina TsIV, que retarda a inativação dos canais de sódio em células musculares e nervosas, provocando quadros neurotóxicos graves, incluindo risco de parada respiratória ${sourceIds["wikipedia-en"]}${sourceIds["wikipedia-pt"]}. É considerada a principal espécie causadora de acidentes graves por escorpião no Brasil, com registros de óbito, sendo tida como a mais peçonhenta da América do Sul ${sourceIds["wikipedia-pt"]}. O número de picadas registradas no país saltou de 12.000 em 2000 para 140.000 em 2018, atribuído à expansão urbana da espécie ${sourceIds["wikipedia-en"]}. A taxa de mortalidade entre crianças e idosos varia de 1,0% a 2,0%, com óbitos ocorrendo geralmente entre 1 e 6 horas, ou 12 a 14 horas após a picada, principalmente por edema pulmonar ${sourceIds["wikipedia-en"]}.` }, { "type": "text", "content": `# Reprodução

A espécie se reproduz predominantemente por partenogênese, sem necessidade de fecundação, com cerca de dois partos anuais e aproximadamente 20 filhotes por ninhada ${sourceIds["wikipedia-pt"]}.` }, { "type": "text", "content": `# Conservação

Não há avaliação formal de status de conservação para *Tityus serrulatus* nas fontes consultadas. Ao contrário de um risco de extinção, a espécie está em expansão geográfica no território brasileiro favorecida pelo desmatamento e pela urbanização, o que a torna hoje uma preocupação crescente de saúde pública mais do que de conservação ${sourceIds["wikipedia-en"]}.` }, "SOURCES"], "right": ["PROPERTIES"] } };
}

function buildArticleContent_opiliao(sourceIds: Record<string, number>) {
  return { "sections": { "left": ["TOC"], "center": [{ "type": "text", "content": `# Morfologia

*Mischonyx squalidus* é um aracnídeo da ordem Opiliones, popularmente chamado de opilião ou aranha-bode. Como os demais opiliões, apresenta fusão entre cefalotórax e abdome, formando um corpo de aspecto oval, além de pernas articuladas excepcionalmente longas em relação ao restante do corpo ${sourceIds["opilioes-wikipedia-pt"]}. A espécie possui um único par de olhos medianos e um par de glândulas odoríferas (ozóporos) na região lateral-anterior do corpo, responsáveis pela secreção de substâncias de defesa com odor característico ${sourceIds["opilioes-wikipedia-pt"]}${sourceIds["opiliones-wikipedia-en"]}. Pertencendo à família Gonyleptidae, a maior família da subordem Laniatores, *M. squalidus* compartilha o traço diagnóstico do grupo: a coxa do quarto par de pernas é imensamente desenvolvida, superando o escudo dorsal quando o animal é visto de cima ${sourceIds["gonyleptidae-wikipedia-en"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/0/02/Mischonyx_squalidus_178835025.jpg" }, { "type": "text", "content": `# Distribuição Geográfica

O Brasil é considerado o país com a maior diversidade conhecida de opiliões do mundo, com mais de mil espécies registradas, sendo a Mata Atlântica um dos principais centros dessa diversidade ${sourceIds["opilioes-wikipedia-pt"]}. *Mischonyx squalidus* está amplamente distribuída na região Sudeste e Sul do país. Registros do GBIF filtrados para o estado do Rio de Janeiro somam 67 ocorrências, incluindo localidades na região serrana e no entorno da Mata Atlântica fluminense, como Itatiaia, Petrópolis, Teresópolis, Nova Friburgo, Paraty, Guapimirim, Magé, Cachoeiras de Macacu, Duque de Caxias e Nova Iguaçu ${sourceIds["mischonyx-squalidus-gbif-occurrence-rj"]}, o que a torna uma espécie representativa para coleções didáticas na região.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/2/2d/Mischonyx_squalidus_224490889.jpg" }, { "type": "text", "content": `# Conservação

Não foram localizados registros de avaliação formal de risco de extinção para *Mischonyx squalidus* nas bases consultadas; a espécie não consta entre os opiliões brasileiros reconhecidamente ameaçados, grupo restrito principalmente a espécies cavernícolas (troglóbias) de distribuição muito restrita ${sourceIds["opiliones-wikipedia-en"]}. De modo geral, opiliões são sensíveis à perda e fragmentação de hábitat florestal, de modo que a manutenção de remanescentes de Mata Atlântica, como os encontrados na região serrana do Rio de Janeiro, é relevante para a conservação de populações da espécie ${sourceIds["mischonyx-squalidus-gbif-occurrence-rj"]}.` }, "SOURCES"], "right": ["PROPERTIES"] } };
}

function buildArticleContent_carrapato_sapo(sourceIds: Record<string, number>) {
  return { "sections": { "left": ["TOC"], "center": [{ "type": "text", "content": `*Amblyomma rotundatum* Koch, 1844, popularmente conhecido como **carrapato-de-sapo**, é um carrapato duro da família Ixodidae que atua como ectoparasita de anfíbios e répteis ${sourceIds["wiki-pt-rotundatum"]}. A espécie chama atenção por ser uma das poucas do gênero *Amblyomma* registradas parasitando anfíbios, grupo que a maioria das demais espécies do gênero normalmente não utiliza como hospedeiro ${sourceIds["wiki-en-amblyomma"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/d/d8/Rhinella_icterica_parasited_by_ticks.jpg" }, { "type": "text", "content": `Sapo-cururu (*Rhinella icterica*) parasitado por *Amblyomma rotundatum* ${sourceIds["commons-rhinella-ticks"]}.` }, { "type": "text", "content": `# Morfologia

Como os demais membros da família Ixodidae, *A. rotundatum* possui um escudo dorsal (scutum) rígido e um capítulo (aparelho bucal) bem desenvolvido e projetado anteriormente, características que diferenciam os carrapatos duros dos carrapatos moles da família Argasidae ${sourceIds["wiki-pt-ixodidae"]}. Uma particularidade biológica marcante da espécie é sua reprodução por partenogênese, com machos extremamente raros na população, o que resulta em populações predominantemente formadas por fêmeas ${sourceIds["wiki-pt-rotundatum"]}.` }, { "type": "text", "content": `# Distribuição Geográfica

A espécie apresenta ampla distribuição nas Américas, ocorrendo desde o sul dos Estados Unidos até o norte da Argentina, incluindo diversas ilhas do Caribe ${sourceIds["gbif-rotundatum"]}. No Brasil, já foi registrada parasitando anfíbios como o sapo-cururu (*Rhinella icterica*) e também infestando plantéis de animais de sangue frio mantidos em jardins zoológicos ${sourceIds["wiki-pt-rotundatum"]}.` }, { "type": "text", "content": `# Conservação

Não há avaliação específica de *A. rotundatum* em listas de conservação, por se tratar de uma espécie de carrapato amplamente distribuída e sem indícios de ameaça. Seu parasitismo em seres humanos é considerado raro e ocasional ${sourceIds["gbif-rotundatum"]}, e seu papel ecológico está associado principalmente à relação parasitária com anfíbios e répteis hospedeiros ${sourceIds["wiki-pt-rotundatum"]}.` }, "SOURCES"], "right": ["PROPERTIES"] } };
}

function buildArticleContent_carrapato_ave(sourceIds: Record<string, number>) {
  return { "sections": { "left": ["TOC"], "center": [{ "type": "text", "content": `# Morfologia

*Argas miniatus* é um carrapato mole, pertencente à família Argasidae, com corpo oval e achatado medindo de 4 a 7 mm de comprimento ${sourceIds["pt-wikipedia-argas-miniatus"]}. Diferentemente dos carrapatos duros (família Ixodidae), os argasídeos não possuem escudo dorsal rígido, o que confere ao corpo uma textura coriácea e flexível ${sourceIds["pt-wikipedia-argas-miniatus"]}. A espécie foi descrita por Koch em 1844 ${sourceIds["pt-wikipedia-argas-miniatus"]}.` }, { "type": "column", "columns": [[{ "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/1/15/Carrapato_de_galinha_ventral.jpg" }, { "type": "text", "content": `Vista ventral de espécime de *Argas miniatus* ${sourceIds["commons-ventral-photo"]}` }], [{ "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/a/ae/Carrapato_de_galinha_dorsal.jpg" }, { "type": "text", "content": `Vista dorsal do mesmo espécime ${sourceIds["commons-dorsal-photo"]}` }]] }, { "type": "text", "content": `Seu hábito alimentar é hematófago e predominantemente noturno: o carrapato permanece escondido durante o dia em frestas e ninhos, saindo ao anoitecer para se fixar em aves apenas o tempo necessário para se alimentar de sangue ${sourceIds["pt-wikipedia-argas-miniatus"]}. Seus hospedeiros naturais são aves, incluindo galinhas domésticas e aves silvestres, o que justifica os nomes populares "carrapato de ave" e "carrapato-de-galinha" ${sourceIds["pt-wikipedia-argas-miniatus"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/a/a5/A_tick_%28Argas_miniatus%29._Coloured_drawing_by_A.J.E._Terzi._Wellcome_V0022543.jpg" }, { "type": "text", "content": `Ilustração histórica de *Argas miniatus* por A.J.E. Terzi ${sourceIds["commons-terzi-illustration"]}` }, { "type": "text", "content": `# Distribuição Geográfica

Registros de ocorrência de *Argas miniatus* catalogados no GBIF mostram forte concentração no Brasil, com 27 dos registros globais disponíveis na base, além de ocorrências pontuais em outros países das Américas, como Estados Unidos, Guiana, Martinica e Argentina ${sourceIds["gbif-argas-miniatus"]}. Essa distribuição é compatível com seu papel de ectoparasita de aves domésticas e silvestres em ambientes tropicais e subtropicais do continente americano ${sourceIds["gbif-argas-miniatus"]}.` }, { "type": "text", "content": `# Conservação

Não há avaliação formal do status de conservação de *Argas miniatus* em listas internacionais como a da IUCN. Trata-se de uma espécie amplamente distribuída e associada a ambientes antrópicos, como galinheiros e criações domésticas de aves, não figurando entre espécies ameaçadas de extinção ${sourceIds["gbif-argas-miniatus"]}. Por ser um ectoparasita de importância veterinária, o interesse na espécie está mais ligado ao controle sanitário em avicultura do que a esforços de conservação ${sourceIds["pt-wikipedia-argas-miniatus"]}.` }, "SOURCES"], "right": ["PROPERTIES"] } };
}

function buildArticleContent_carrapato_bovino(sourceIds: Record<string, number>) {
  return { "sections": { "left": ["TOC"], "center": [{ "type": "text", "content": `*Rhipicephalus microplus*, popularmente conhecido como carrapato-do-boi ou carrapato bovino, é um ácaro hematófago da família Ixodidae ${sourceIds["wikipedia-pt"]}. Antigamente classificado sob o gênero *Boophilus* (*Boophilus microplus*) ${sourceIds["wikipedia-pt"]}, é descrito como "o ectoparasita de maior importância econômica do mundo" ${sourceIds["wikipedia-en"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/8/8c/CSIRO_ScienceImage_2842_Cow_infested_with_cattle_tick_Boophilus_microplusI.jpg" }, { "type": "text", "content": `Bovino com infestação intensa de carrapatos ${sourceIds["commons-csiro"]}` }, { "type": "text", "content": `# Morfologia

*R. microplus* é um pequeno ácaro de corpo piriforme (em formato de gota), com um escudo endurecido (scutum) cobrindo a região anterior do corpo ${sourceIds["wikipedia-en"]}. Os machos apresentam escudo completo e placas adanais bem desenvolvidas, enquanto as fêmeas possuem escudo dorsal incompleto ${sourceIds["wikipedia-pt"]}. Os adultos têm oito pernas de coloração creme ${sourceIds["wikipedia-en"]}. A coxa I apresenta dois espinhos curtos em ambos os sexos, o peritrema é de forma circular, não há ornamentação no escudo e os festões estão ausentes ${sourceIds["wikipedia-pt"]}.` }, { "type": "column", "columns": [[{ "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/5/54/Rhipicephalus-microplus-female-male.jpg" }, { "type": "text", "content": `Comparação entre fêmea e macho ${sourceIds["commons-female-male"]}` }], [{ "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/6/6c/Rhipicephalus-microplus-larvae-questing.jpg" }, { "type": "text", "content": `Larvas em comportamento de questing ${sourceIds["commons-larvae"]}` }]] }, { "type": "text", "content": `# Distribuição Geográfica

Originária das florestas tropicais e subtropicais da Índia ${sourceIds["wikipedia-en"]}, a espécie se espalhou por regiões tropicais e subtropicais situadas entre os paralelos 32°N e 32°S ${sourceIds["wikipedia-pt"]}, estando hoje presente em mais de 80 países, incluindo Brasil, África do Sul, Austrália e diversos países das Américas ${sourceIds["wikipedia-en"]}. Foi erradicada da maior parte dos Estados Unidos, restando apenas ocorrências esporádicas em uma zona de contenção na fronteira com o México ${sourceIds["wikipedia-en"]}.` }, { "type": "text", "content": `# Hospedeiros e Importância Econômica

O principal hospedeiro é o gado bovino; em infestações intensas, a espécie também pode parasitar equinos, cães, ovinos, caprinos, búfalos, cervídeos e, ocasionalmente, humanos ${sourceIds["wikipedia-pt"]}. No Brasil, estima-se que 80% da população bovina esteja infestada ${sourceIds["wikipedia-en"]}, gerando perdas econômicas estimadas em quase 2 bilhões de dólares, somando queda na produção de leite e carne, mortalidade e custos de controle ${sourceIds["wikipedia-pt"]}. A espécie também transmite patógenos como *Babesia bigemina* e *Babesia bovis*, causadores da babesiose bovina ${sourceIds["wikipedia-en"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/b/b1/One-host-tick-lifecycle.png" }, { "type": "text", "content": `Ciclo de vida de hospedeiro único do carrapato bovino ${sourceIds["commons-lifecycle"]}` }, { "type": "text", "content": `Em condições de laboratório, o ciclo completo dura aproximadamente 65 dias, incluindo 7 dias de alimentação da fêmea, 4 dias de pré-oviposição e 8,6 dias de oviposição ${sourceIds["wikipedia-en"]}. Cada fêmea produz cerca de 1450 ovos por postura, com taxa de eclosão de 83,5% em 21 dias ${sourceIds["wikipedia-en"]}.` }, { "type": "text", "content": `# Conservação

*Rhipicephalus microplus* não é avaliada pela IUCN, por se tratar de uma espécie parasita de ampla distribuição global, sem risco de extinção; ao contrário, é alvo de estratégias de controle e erradicação devido ao seu impacto econômico e sanitário sobre a pecuária ${sourceIds["wikipedia-en"]}.` }, "SOURCES"], "right": ["PROPERTIES"] } };
}

function buildArticleContent_carrapato_tamandua(sourceIds: Record<string, number>) {
  return { "sections": { "left": ["TOC"], "center": [{ "type": "text", "content": `*Amblyomma pseudoconcolor* é uma espécie de carrapato duro (família Ixodidae) descrita por Aragão em 1908 ${sourceIds["gbif-species-amblyomma-pseudoconcolor"]}. Popularmente associado ao nome "carrapato de tamanduá", o parasita infesta principalmente tatus (Cingulata), mas possui registro confirmado também em tamanduás-bandeira (*Myrmecophaga tridactyla*) e, ocasionalmente, em cavalos domésticos ${sourceIds["wikipedia-pt-amblyomma-pseudoconcolor"]}.` }, { "type": "image", "content": "https://images.collections.yale.edu/iiif/2/ypm:96e3c070-f639-402e-a4de-798b5256ee77/full/full/0/default.jpg" }, { "type": "text", "content": `Espécime testemunha YPM ENT 286968 ${sourceIds["yale-peabody-museum-ypm286968"]}` }, { "type": "text", "content": `# Morfologia

Como os demais representantes do gênero *Amblyomma*, trata-se de um ixodídeo (carrapato duro) de corpo ovalado e escudo dorsal ornamentado, característico do grupo. Espécimes testemunha da espécie estão depositados em coleções entomológicas de referência, como a do Yale Peabody Museum (YPM ENT 286968) ${sourceIds["yale-peabody-museum-ypm286968"]}.` }, { "type": "text", "content": `# Distribuição Geográfica

A distribuição de *Amblyomma pseudoconcolor* é restrita à região neotropical, ocorrendo do norte da Argentina ao Suriname, passando por áreas do Brasil e do Uruguai ${sourceIds["wikipedia-pt-amblyomma-pseudoconcolor"]}.` }, { "type": "image", "content": "https://images.collections.yale.edu/iiif/2/ypm:4f7e3181-b4f5-494a-88e5-9877f65ec43c/full/full/0/default.jpg" }, { "type": "text", "content": `Espécime testemunha YPM ENT 286995 ${sourceIds["yale-peabody-museum-ypm286968"]}` }, { "type": "text", "content": `# Conservação

Não há avaliação específica de risco de extinção para *Amblyomma pseudoconcolor* nas fontes consultadas. Como parasita de mamíferos silvestres neotropicais, sua ocorrência acompanha a de seus hospedeiros — principalmente tatus, mas também o tamanduá-bandeira (*Myrmecophaga tridactyla*) ${sourceIds["wikipedia-pt-amblyomma-pseudoconcolor"]}.` }, { "type": "image", "content": "https://images.collections.yale.edu/iiif/2/ypm:6a362899-128b-4f96-808a-300f2031a8d6/full/full/0/default.jpg" }, { "type": "text", "content": `Espécime testemunha YPM ENT 286976 ${sourceIds["yale-peabody-museum-ypm286968"]}` }, "SOURCES"], "right": ["PROPERTIES"] } };
}

function buildArticleContent_ninhada_carrapato(sourceIds: Record<string, number>) {
  return { "sections": { "left": ["TOC"], "center": [{ "type": "text", "content": `O espécime catalogado corresponde a uma **ninhada** (massa de ovos/larvas) de carrapato. Como esse material biológico não permite identificar o hospedeiro nem isolar a espécie exata em laboratório, esta ficha documenta a espécie de carrapato mais comum e bem documentada no Brasil, o *Rhipicephalus sanguineus*, popularmente conhecido como carrapato-do-cão ou carrapato-marrom ${sourceIds["wikipedia-pt"]}.` }, { "type": "text", "content": `# Morfologia

Os adultos de *Rhipicephalus sanguineus* medem entre 2,28 e 3,18 mm de comprimento por 1,11 a 1,68 mm de largura, apresentando coloração castanho-avermelhada, corpo alongado, base do capítulo hexagonal e escudo dorsal sem ornamentação ${sourceIds["wikipedia-en"]}. As larvas que eclodem de uma ninhada são translúcidas e possuem apenas três pares de patas, ganhando o quarto par somente na fase de ninfa ${sourceIds["wikipedia-pt"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/0/05/Rhipicephalus-sanguineus-female-male.jpg" }, { "type": "text", "content": `# Comportamento

Após a alimentação sanguínea e o acasalamento, a fêmea deposita entre 2.000 e 3.000 ovos ${sourceIds["wikipedia-pt"]}, podendo atingir até 7.000 ovos em uma única postura sob condições favoráveis ${sourceIds["wikipedia-en"]}. O período de incubação dos ovos varia de 17 a 60 dias ${sourceIds["wikipedia-pt"]}. As larvas recém-eclodidas — a "ninhada" propriamente dita — permanecem agrupadas no ambiente até encontrarem um hospedeiro, podendo sobreviver sem se alimentar por até 8,5 meses ${sourceIds["wikipedia-pt"]}. Uma vez sobre o hospedeiro, a larva se alimenta por 5 a 15 dias antes de se desprender e se transformar em ninfa, em um ciclo de vida de três hospedeiros no qual todas as mudas ocorrem fora do corpo do hospedeiro ${sourceIds["wikipedia-en"]}.` }, { "type": "column", "columns": [[{ "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/8/81/Rhipicephalus_sanguineus.jpg" }], [{ "type": "text", "content": `Exemplar adulto de *Rhipicephalus sanguineus*, estágio final do ciclo iniciado pela ninhada de ovos e larvas ${sourceIds["wikipedia-pt"]}.` }]] }, { "type": "text", "content": `# Distribuição Geográfica

A espécie tem distribuição cosmopolita, ocorrendo com maior frequência em regiões de clima quente, incluindo todo o território brasileiro ${sourceIds["wikipedia-pt"]}. É praticamente ausente do Reino Unido, exceto em instalações de quarentena, e vem expandindo sua área de ocorrência para novas regiões, como a Hungria a partir de 2005, em associação com mudanças climáticas ${sourceIds["wikipedia-en"]}.` }, { "type": "text", "content": `# Conservação

*Rhipicephalus sanguineus* não é avaliada em listas de conservação, por se tratar de um ectoparasita cosmopolita e abundante, sem relevância para programas de conservação da biodiversidade. Pelo contrário, é classificada como vetor de importância veterinária e de saúde pública, estando associada à transmissão de agentes como *Babesia* spp. e *Ehrlichia canis* ${sourceIds["wikipedia-pt"]}.` }, "SOURCES"], "right": ["PROPERTIES"] } };
}

function buildArticleContent_ninhada_aranha(sourceIds: Record<string, number>) {
  return { "sections": { "left": ["TOC"], "center": [{ "type": "text", "content": `# Morfologia

A *Lycosa erythrognatha*, popularmente conhecida como aranha-de-jardim, aranha-de-grama ou aranha-lobo, mede aproximadamente 5 cm de comprimento, com coloração que varia de marrom-clara a cinzenta e abdômen escurecido, exibindo um desenho negro em forma de seta na superfície dorsal do abdômen. As quelíceras apresentam pelos alaranjados ou avermelhados, característicos do grupo ${sourceIds["wikipedia-pt"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/9/9e/Lycosa_erythrognatha_female_dorsal.jpg" }, { "type": "text", "content": `# Distribuição Geográfica

A espécie ocorre na América do Sul, com registros em diversas regiões do Brasil, onde habita jardins, áreas de vegetação rasteira (gramados) e ambientes próximos a residências ${sourceIds["wikipedia-en"]}. Como integrante da família Lycosidae, a espécie compartilha com as demais aranhas-lobo a ocupação de uma ampla variedade de habitats, de matagais e bosques a jardins suburbanos e o interior de casas ${sourceIds["wikipedia-lycosidae-pt"]}.` }, { "type": "column", "columns": [[{ "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/a/aa/Lycosa_erythrognatha.jpg" }], [{ "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/3/30/Lycosa_erythrognatha_display.jpg" }]] }, { "type": "text", "content": `# Comportamento

O comportamento parental é um dos aspectos mais notáveis da espécie: após a fecundação, a fêmea carrega a ooteca junto ao abdômen e, depois da eclosão, transporta os filhotes agrupados sobre o dorso até a primeira muda, momento em que os jovens se dispersam e passam a viver de forma independente ${sourceIds["wikipedia-pt"]}. Esse comportamento de carregar a ninhada é o que dá origem ao nome popular associado a espécimes de ootecas e filhotes agrupados de aranhas ("ninhada de aranha"), ainda que a identificação da espécie-mãe exata não seja possível apenas a partir do espécime de ninhada. Em média, a fêmea produz cerca de 800 ovos por postura, podendo realizar até três posturas ao longo da vida reprodutiva; a terceira postura está associada a um maior risco de morte da fêmea ${sourceIds["wikipedia-pt"]}.` }, { "type": "text", "content": `# Conservação

Não há avaliação formal do estado de conservação de *Lycosa erythrognatha* nas principais listas internacionais de espécies ameaçadas. Como ocorre com a maioria das espécies de aranhas, faltam dados populacionais sistemáticos sobre a espécie, embora seja considerada comum em ambientes urbanos e rurais no Brasil ${sourceIds["wikipedia-en"]}.` }, "SOURCES"], "right": ["PROPERTIES"] } };
}

function buildArticleContent_lagosta_filtradora(sourceIds: Record<string, number>) {
  return { "sections": { "left": ["TOC"], "center": [{ "type": "text", "content": `O espécime catalogado como "lagosta filtradora" apresenta um desafio de identificação: lagostas verdadeiras (famílias Palinuridae e Nephropidae) não são filtradoras, são predadoras/detritívoras generalistas que capturam presas ativamente. A pesquisa indica que "lagosta filtradora" não é, na verdade, o nome de uma lagosta, mas um dos nomes populares documentados em português para *Atya gabonensis*, um camarão de água doce da família Atyidae ${sourceIds["camarao-filtrador-pt-wikipedia"]}.` }, { "type": "text", "content": `# Morfologia

*Atya gabonensis* é um camarão caridídeo de grande porte para a família Atyidae: machos atingem até 14 cm e fêmeas até 9 cm ${sourceIds["camarao-filtrador-pt-wikipedia"]}. O escudo cefálico apresenta sulcos marcados e os três pares anteriores de quelas possuem fanões ramificados em formato de leque, usados para filtrar microalgas e matéria orgânica em suspensão na correnteza ${sourceIds["camarao-filtrador-pt-wikipedia"]}. Há dimorfismo sexual, com machos exibindo pereópodes mais robustos, e a coloração é variável (azul-celeste, azul-médio, azul-marinho, cinza, marrom ou creme), podendo mudar ao longo do ano ${sourceIds["camarao-filtrador-pt-wikipedia"]}${sourceIds["atya-gabonensis-en-wikipedia"]}.

**Incerteza taxonômica.** O nome "lagosta", aqui, é uma licença popular: o corpo robusto, as quelas grandes e o hábito de permanecer agarrado a substrato rochoso aproximam visualmente o animal de uma pequena lagosta, mas trata-se de um camarão (infraordem Caridea), não de um decápode da família das lagostas verdadeiras. Vale notar ainda que o próprio artigo de referência em português classifica a espécie na infraordem Brachyura (caranguejos) em sua ficha taxonômica, o que é inconsistente com a classificação padrão: Atyidae pertence à infraordem Caridea, dentro da subordem Pleocyemata ${sourceIds["atyidae-en-wikipedia"]}, e é essa classificação que foi adotada aqui. Há ainda uma segunda camada de incerteza, relevante por o espécime estar depositado em coleção no Rio de Janeiro: registros de *Atya gabonensis* nas Américas (da Venezuela ao Brasil) são tratados pela literatura internacional como provável confusão de identificação com a espécie nativa americana *Atya scabra* ${sourceIds["atya-gabonensis-en-wikipedia"]}, ainda que fontes brasileiras de conservação atribuam status próprio a *A. gabonensis* no estado do Rio de Janeiro ${sourceIds["camarao-filtrador-pt-wikipedia"]}. Por isso, o nível de gênero (*Atya*, Atyidae, Caridea) é o mais seguramente confirmável para o espécime físico; *Atya gabonensis* é indicado como hipótese de espécie por ser o binômio documentado associado ao nome popular "lagosta filtradora", mas a identificação específica de exemplares sul-americanos permanece uma questão aberta na literatura consultada.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/0/03/Atya_gabonensis.JPG" }, { "type": "text", "content": `# Distribuição Geográfica

A distribuição nativa confirmada de *Atya gabonensis* é a África Ocidental, do Senegal até a República Democrática do Congo, incluindo Gana, Gabão, Camarões, Libéria, Mali, Nigéria e São Tomé e Príncipe ${sourceIds["camarao-filtrador-pt-wikipedia"]}${sourceIds["atya-gabonensis-en-wikipedia"]}. A espécie ocupa rios de terras baixas com correntes rápidas e substrato rochoso, além de estuários e zonas salobras bem oxigenadas ${sourceIds["camarao-filtrador-pt-wikipedia"]}. Registros em águas americanas (da Venezuela ao Brasil) são apontados pela literatura internacional como provável caso de identificação equivocada, mais provavelmente correspondendo à espécie *Atya scabra* ${sourceIds["atya-gabonensis-en-wikipedia"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/9/98/Atya_gabonensis_trio.jpg" }, { "type": "text", "content": `# Conservação

*Atya gabonensis* é classificada pela IUCN como pouco preocupante (LC), avaliação de 2013 ${sourceIds["atya-gabonensis-en-wikipedia"]}. No Brasil, o status variou de "dados insuficientes" (DD) em 2018 para "pouco preocupante" (LC) em avaliações posteriores, havendo registro de classificação "em perigo" (EN) especificamente para o estado do Rio de Janeiro ${sourceIds["camarao-filtrador-pt-wikipedia"]} — status que deve ser lido à luz da incerteza de identificação discutida na seção de Morfologia, já que populações brasileiras atribuídas a esta espécie podem na realidade corresponder a *Atya scabra* ${sourceIds["atya-gabonensis-en-wikipedia"]}.` }, "SOURCES"], "right": ["PROPERTIES"] } };
}

function buildArticleContent_camarao(sourceIds: Record<string, number>) {
  return { "sections": { "left": ["TOC"], "center": [{ "type": "text", "content": `# Morfologia

*Litopenaeus schmitti* é uma espécie de camarão marinho da família Penaeidae, descrita por Burkenroad em 1936 ${sourceIds["worms-litopenaeus-schmitti"]}. Pertence ao mesmo grupo de camarões-peneídeos de importância comercial que inclui o camarão-rosa (*Farfantepenaeus* spp.) e outras espécies de *Litopenaeus*. Como típico decápode da subordem Dendrobranchiata, apresenta corpo alongado e comprimido lateralmente, exoesqueleto quitinoso segmentado, cefalotórax fundido recoberto pela carapaça, rostro anterior e cinco pares de pereiópodes. A espécie é geneticamente próxima de *Litopenaeus setiferus*, da costa leste dos Estados Unidos, da qual é considerada alopátrica (geograficamente separada), sendo as duas distinguidas principalmente pela estrutura dos órgãos genitais (petasma nos machos e telicum nas fêmeas) ${sourceIds["en-wikipedia-litopenaeus"]}. A literatura consultada não traz medidas padronizadas de comprimento ou peso para a espécie, de modo que a caracterização morfológica detalhada permanece um ponto a confirmar em fontes especializadas adicionais.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/3/3a/Litopenaeus_schmitti.png" }, { "type": "text", "content": `# Distribuição Geográfica

A espécie ocorre desde as Antilhas até o litoral brasileiro ${sourceIds["pt-wikipedia-litopenaeus-schmitti"]}, com registros mais amplos abrangendo o Caribe, a América Central e a América do Sul, em águas costeiras rasas ${sourceIds["en-wikipedia-litopenaeus"]}. Habita ambientes marinhos e salobros, incluindo estuários ${sourceIds["worms-litopenaeus-schmitti"]}. No Brasil, estudos sobre a biologia reprodutiva de *L. schmitti* foram conduzidos na Universidade Federal Rural do Rio de Janeiro (UFRRJ), reforçando sua presença e relevância científica no litoral fluminense ${sourceIds["pt-wikipedia-litopenaeus-schmitti"]}. Registros fotográficos recentes confirmam também sua ocorrência no litoral do Sudeste brasileiro, como em São Sebastião (SP), região próxima ao litoral do Rio de Janeiro ${sourceIds["inaturalist-obs-188375985"]}.` }, { "type": "image", "content": "https://inaturalist-open-data.s3.amazonaws.com/photos/329678623/large.jpg" }, { "type": "text", "content": `# Conservação

Não foi localizada avaliação formal do status de conservação de *Litopenaeus schmitti* nas bases consultadas (WoRMS, GBIF, Wikidata), o que sugere ausência de categorização pela IUCN disponível publicamente ${sourceIds["wikidata-litopenaeus-schmitti"]}. Apesar disso, a espécie possui importância comercial significativa para comunidades de pescadores artesanais ao longo de sua distribuição ${sourceIds["pt-wikipedia-litopenaeus-schmitti"]}, o que indica relevância socioeconômica que pode justificar atenção a práticas de manejo sustentável da pesca, ainda que não existam dados de conservação específicos confirmados para esta ficha.` }, "SOURCES"], "right": ["PROPERTIES"] } };
}

function buildArticleContent_siri(sourceIds: Record<string, number>) {
  return { "sections": { "left": ["TOC"], "center": [{ "type": "text", "content": `O *siri*, popularmente assim chamado no litoral do Rio de Janeiro, corresponde ao crustáceo decápode nadador *Callinectes danae* Smith, 1869, da família Portunidae — também conhecido como siri-açu ${sourceIds["worms"]}. É uma das espécies de siri mais abundantes nos estuários e baías do litoral sudeste do Brasil, incluindo a Baía de Guanabara ${sourceIds["keunecke-2008"]}.` }, { "type": "text", "content": `# Morfologia

A carapaça é de cor cinza a castanho-oliva, com as garras (quelípodos) brancas apresentando marcas azuis nas pontas e a face superior avermelhada ${sourceIds["pt-wikipedia"]}. Como típico do gênero *Callinectes*, o último par de pernas é modificado em forma de remo, adaptado à natação ${sourceIds["pt-wikipedia"]}. Em estudo na Baía de Guanabara (RJ), machos atingiram largura de carapaça de até 120 mm e fêmeas até 113 mm ${sourceIds["keunecke-2008"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/0/08/Callinectes_danae.jpg" }, { "type": "text", "content": `# Distribuição Geográfica

A espécie é comum no Brasil e nas Antilhas (West Indies) ${sourceIds["en-wikipedia"]}, ocorrendo de mangues e estuários até mar aberto, em profundidades de até 100 metros ${sourceIds["worms"]}. No litoral do Rio de Janeiro, é uma das espécies de siri dominantes na Baía de Guanabara, junto de *Callinectes ornatus* ${sourceIds["keunecke-2008"]}.` }, { "type": "column", "columns": [[{ "type": "image", "content": "https://inaturalist-open-data.s3.amazonaws.com/photos/461677201/original.jpg" }, { "type": "text", "content": `Indivíduo registrado em Armação dos Búzios (RJ) ${sourceIds["inaturalist-buzios"]}.` }], [{ "type": "image", "content": "https://inaturalist-open-data.s3.amazonaws.com/photos/711523511/original.jpg" }, { "type": "text", "content": `Indivíduo registrado na Barra da Tijuca, Rio de Janeiro (RJ) ${sourceIds["inaturalist-barra"]}.` }]] }, { "type": "text", "content": `# Comportamento

O *siri-açu* é um predador quase que exclusivamente carnívoro, atuando tanto como limpador de carcaças quanto como predador voraz de pequenos invertebrados ${sourceIds["pt-wikipedia"]}. Prefere fundos de substrato mole, como lama ou areia ${sourceIds["worms"]}. Estimativas de longevidade indicam cerca de 2,3 anos para machos e 2,5 anos para fêmeas ${sourceIds["keunecke-2008"]}.` }, { "type": "text", "content": `# Conservação

*Callinectes danae* é classificada como "Pouco Preocupante" na Lista Vermelha da IUCN ${sourceIds["pt-wikipedia"]}. Não há medidas de conservação específicas direcionadas à espécie, que mantém populações abundantes ao longo do litoral brasileiro.` }, "SOURCES"], "right": ["PROPERTIES"] } };
}

function buildArticleContent_caranguejo_1(sourceIds: Record<string, number>) {
  return { "sections": { "left": ["TOC"], "center": [{ "type": "text", "content": `O *Ucides cordatus*, conhecido popularmente como caranguejo-uçá, é um crustáceo decápode braquiúro típico dos manguezais brasileiros, de grande importância ecológica e econômica no litoral do Rio de Janeiro ${sourceIds["wiki-pt-uca"]}.` }, { "type": "text", "content": `# Morfologia
A espécie apresenta dimorfismo sexual marcante. Os machos possuem carapaça mais achatada e ovalada, com tonalidade azulada ao centro contornada por bege-claro, enquanto as fêmeas têm carapaças mais abauladas, de coloração verde-escura com tons de roxo ${sourceIds["wiki-en-ucides-cordatus"]}. Em exemplares juvenis a carapaça varia do azul-celeste ao marrom-escuro, tornando-se ferruginosa ou marrom-escura nos adultos ${sourceIds["wiki-pt-uca"]}. As pernas de ambos os sexos são de cor roxo-avermelhada escura ${sourceIds["wiki-en-ucides-cordatus"]}.` }, { "type": "image", "content": "https://commons.wikimedia.org/wiki/Special:FilePath/Ucides%20cordatus%20MN%2001.jpg" }, { "type": "text", "content": `O primeiro par de pereiópodes é modificado em pinças assimétricas: a esquerda, mais fina, é usada para cortar e se alimentar; a direita, bem maior, serve para esmagar objetos e folhiço ${sourceIds["wiki-en-ucides-cordatus"]}.` }, { "type": "image", "content": "https://commons.wikimedia.org/wiki/Special:FilePath/Caranguejo%20uça.jpg" }, { "type": "text", "content": `# Distribuição Geográfica
O caranguejo-uçá ocorre em manguezais ao longo do litoral atlântico ocidental, desde a Flórida (Estados Unidos) até o sul do Brasil e o Uruguai, sendo uma das espécies mais comuns dos manguezais da costa atlântica ocidental, incluindo os estuários do Rio de Janeiro ${sourceIds["wiki-pt-uca"]}. É um animal predominantemente terrestre, que escava tocas no substrato lodoso que podem atingir até 1.6 meter de profundidade ${sourceIds["wiki-en-ucides-cordatus"]}.` }, { "type": "image", "content": "https://commons.wikimedia.org/wiki/Special:FilePath/Ucides%20cordatus%20distibuicao.svg" }, { "type": "text", "content": `Durante a estação reprodutiva, entre novembro e janeiro, os indivíduos realizam uma migração em massa em direção às áreas costeiras para a reprodução, fenômeno conhecido regionalmente como "a andada" ${sourceIds["wiki-en-ucides-cordatus"]}.` }, { "type": "image", "content": "https://commons.wikimedia.org/wiki/Special:FilePath/Ucides%20cordatus%20Martinique.JPG" }, { "type": "text", "content": `# Conservação
A população do caranguejo-uçá vem apresentando queda constante desde 1988, em decorrência da sobrepesca e da degradação de manguezais. O Brasil estabeleceu restrições de tamanho mínimo de captura, embora a fiscalização dessas leis seja considerada falha ${sourceIds["wiki-en-ucides-cordatus"]}. Sua carne é muito apreciada na culinária regional, e a carapaça é aproveitada no artesanato, em cosméticos e na alimentação animal ${sourceIds["wiki-pt-uca"]}.` }, "SOURCES"], "right": ["PROPERTIES"] } };
}

function buildArticleContent_caranguejo_2(sourceIds: Record<string, number>) {
  return { "sections": { "left": ["TOC"], "center": [{ "type": "text", "content": `O *Cardisoma guanhumi*, popularmente conhecido como guaiamu, guaiamum ou caranguejo-mulato-da-terra, é um crustáceo decápode terrestre da família Gecarcinidae ${sourceIds["wiki-pt-cardisoma"]}. Diferencia-se do caranguejo-uçá (*Ucides cordatus*) por habitar tocas em terreno arenoso, na faixa de transição entre manguezal e restinga, e não no solo lodoso típico do mangue ${sourceIds["wiki-pt-cardisoma"]}.` }, { "type": "text", "content": `# Morfologia

Machos adultos podem atingir até 15 centímetros de largura de carapaça, com peso superior a 500 gramas ${sourceIds["wiki-en-cardisoma"]}${sourceIds["wiki-pt-cardisoma"]}. A coloração varia de azul-escuro a marrom ou cinza pálido; indivíduos jovens apresentam carapaça marrom com pernas de tom alaranjado ${sourceIds["wiki-pt-cardisoma"]}. Os machos possuem garras dimórficas, e a maior delas pode superar a largura da própria carapaça ${sourceIds["wiki-en-cardisoma"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/9/9c/Carangueijo-1310.jpg" }, { "type": "text", "content": `# Distribuição Geográfica

A espécie ocorre desde o sul do Brasil até o Caribe, o golfo do México, as Bahamas e as Bermudas, alcançando o norte da Flórida (Ponce Inlet) ${sourceIds["wiki-pt-cardisoma"]}. Temperaturas de inverno inferiores a 20°C limitam sua expansão para regiões mais frias ${sourceIds["wiki-pt-cardisoma"]}. No litoral do Rio de Janeiro, é encontrado em tocas na faixa de transição entre manguezal e restinga, como registrado na Ilha Grande ${sourceIds["wiki-pt-cardisoma"]}.` }, { "type": "text", "content": `# Hábitos e Alimentação

É uma espécie onívora e predominantemente noturna, que coleta folhas e frutos próximos à toca e também se alimenta de insetos e carniça, podendo exibir canibalismo ${sourceIds["wiki-en-cardisoma"]}. Evita a exposição prolongada à luz solar direta, permanecendo abrigada durante o dia ${sourceIds["wiki-pt-cardisoma"]}.` }, { "type": "text", "content": `# Conservação

No Brasil, o guaiamu foi classificado como criticamente em perigo no período de 2014 a 2018, e as Portarias federais nº 445/2014 e nº 395/2016 proíbem sua captura e comercialização desde abril de 2017 ${sourceIds["wiki-pt-cardisoma"]}.` }, { "type": "text", "content": `# Nota sobre Taxonomia

A posição do gênero *Cardisoma* dentro da superfamília Grapsoidea é estável, mas há divergência entre fontes quanto à família: a Wikipédia em português registra Gecarcinidae, enquanto classificações filogenéticas mais recentes posicionam o gênero em Cardisomatidae. Essa divergência ocorre apenas em nível de família, sem afetar a identificação da espécie; optou-se por registrar Gecarcinidae, conforme a fonte principal consultada, documentando aqui a ressalva ${sourceIds["wiki-pt-cardisoma"]}.` }, "SOURCES"], "right": ["PROPERTIES"] } };
}

function buildArticleContent_tatuzinho_jardim(sourceIds: Record<string, number>) {
  return { "sections": { "left": ["TOC"], "center": [{ "type": "text", "content": `# Morfologia

*Armadillidium vulgare*, conhecido popularmente como tatuzinho-de-jardim ou bicho-de-conta, é um isópode terrestre da família Armadillidiidae. Apresenta corpo convexo e segmentado, de coloração cinza-escura a marrom, frequentemente com manchas creme ou amarelas, podendo atingir de 8.5 a 18 mm de comprimento na fase adulta ${sourceIds["wikipedia-en"]}. Possui sete pares de pernas torácicas e um exoesqueleto de cerca de 40 micrômetros de espessura, composto de quitina, proteínas e carbonato de cálcio ${sourceIds["wikipedia-en"]}. Quando perturbado, é capaz de se enrolar completamente em uma bola — comportamento defensivo conhecido como conglobação, que o diferencia de outros isópodes terrestres semelhantes ${sourceIds["wikipedia-en"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/4/4e/Armadillidium_vulgare_001.jpg" }, { "type": "text", "content": `# Distribuição Geográfica

Nativa da região do Mediterrâneo, provavelmente de sua porção oriental, *A. vulgare* hoje apresenta distribuição praticamente mundial, tendo sido introduzida em países como Estados Unidos, Madagascar, Austrália e África do Sul ${sourceIds["wikipedia-en"]}. No Brasil, é considerada espécie exótica, com registros em áreas de influência antrópica nos estados da Bahia, Minas Gerais, Rio de Janeiro, São Paulo, Santa Catarina e Rio Grande do Sul ${sourceIds["wikipedia-pt"]}. A espécie prefere ambientes com umidade relativa elevada, temperaturas moderadas e baixa luminosidade, sendo comumente encontrada sob pedras, troncos e serapilheira ${sourceIds["wikipedia-en"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/2/25/Armadillidium_vulgare-dorsal.jpg" }, { "type": "column", "columns": [[{ "type": "text", "content": `# Conservação

*Armadillidium vulgare* não consta em listas de espécies ameaçadas; pelo contrário, é tratada como espécie exótica invasora e praga agrícola em diversas regiões do mundo, incluindo o Brasil, onde está associada a perdas de colheita de até 40% em pimentão, 70% em tomate e 80% em feijão ${sourceIds["wikipedia-pt"]}. Por se alimentar principalmente de matéria vegetal em decomposição, também atua como macrofauna saprófaga relevante nos processos de decomposição e ciclagem de nutrientes do solo ${sourceIds["wikipedia-pt"]}.` }], [{ "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/f/f0/Common_Pill_Woodlouse_%28Armadillidium_vulgare%29_-_Guelph%2C_Ontario_01.jpg" }]] }, "SOURCES"], "right": ["PROPERTIES"] } };
}

function buildArticleContent_bolacha_da_praia(sourceIds: Record<string, number>) {
  return { "sections": { "left": ["TOC"], "center": [{ "type": "text", "content": `A *Mellita quinquiesperforata*, popularmente conhecida como bolacha-da-praia, é um equinodermo da ordem Clypeasteroida, grupo de ouriços-do-mar com corpo achatado dorso-ventralmente ${sourceIds["wikipedia-pt"]}.` }, { "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/4/48/Parati_Sand_Dollar.jpg" }, { "type": "text", "content": `# Morfologia

O corpo de *M. quinquiesperforata* apresenta simetria radial nos adultos, contrastando com a simetria bilateral das larvas ${sourceIds["wikipedia-en"]}. O disco, medindo entre 5 e 10 centímetros de diâmetro, possui coloração acastanhada, acinzentada ou esverdeada, e é perfurado por cinco aberturas ovaladas denominadas lúnulas, características que dão origem ao nome popular "bolacha-da-praia" ${sourceIds["wikipedia-pt"]}. O esqueleto calcário (carbonato de cálcio) é revestido, nos indivíduos vivos, por pés ambulacrais (podia) e espinhos curtos que auxiliam na locomoção e na captação de alimento, como copépodes, algas e pequenos moluscos, conduzidos por cílios até a boca central ${sourceIds["wikipedia-en"]}.` }, { "type": "column", "columns": [[{ "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/f/fc/Keyhole_sand_dollar_01.jpg" }], [{ "type": "image", "content": "https://upload.wikimedia.org/wikipedia/commons/b/bd/Keyhole_sand_dollar_07.jpg" }]] }, { "type": "text", "content": `# Distribuição Geográfica

A espécie ocorre ao longo do Oceano Atlântico ocidental, desde a Carolina do Norte (Estados Unidos) até a costa do Rio de Janeiro, no Brasil, incluindo diversas localidades do Caribe ${sourceIds["wikipedia-pt"]}. Habita fundos arenosos ou rocha-recifais de regiões costeiras tropicais e subtropicais, preferindo areia fina na zona infralitoral, entre 0 e 180 metros de profundidade, onde forma densos agrupamentos paralelos à linha de costa, pouco além da zona de arrebentação ${sourceIds["wikipedia-pt"]}${sourceIds["wikipedia-en"]}. No litoral do estado do Rio de Janeiro, há registro fotográfico de exemplares em praias próximas a Paraty ${sourceIds["wikimedia-commons"]}.` }, { "type": "text", "content": `# Conservação

Não foi localizada avaliação formal do status de conservação de *Mellita quinquiesperforata* pela União Internacional para a Conservação da Natureza (IUCN) nas fontes consultadas. Exemplares mortos (testas) são comumente encontrados depositados em praias arenosas após a decomposição das partes moles, o que não indica necessariamente risco à população viva da espécie ${sourceIds["wikipedia-en"]}.` }, "SOURCES"], "right": ["PROPERTIES"] } };
}

async function seed() {
  console.log("Seeding especies do catalogo...");

  let [user] = await db
    .insert(usersTable)
    .values({
      name: "Admin Seed",
      email: "seed@ifrj.edu.br",
      passwordHash: await bcrypt.hash("senha123", 10),
    })
    .onConflictDoNothing()
    .returning();

  if (!user) {
    [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, "seed@ifrj.edu.br"));
    console.log("Usuario seed ja existe, continuando com usuario existente.");
  }

  // ---- esponja-do-mar (Porifera) ----

  const tax_1Result = await db.execute(sql`
    WITH seq AS (SELECT nextval('taxonomies_id_seq') AS id)
    INSERT INTO taxonomies (id, label, label_value, created_by, parent)
    SELECT seq.id, ${"Reino"}, ${"animalia"}, ${user.id}::uuid, seq.id FROM seq
    RETURNING id
  `);
  const tax_1 = Number((tax_1Result.rows[0] as { id: unknown }).id);

  const [tax_2Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Filo", labelValue: "porifera", parent: tax_1, createdBy: user.id })
    .returning();
  const tax_2 = tax_2Row.id;

  const [species_esponja_do_mar] = await db
    .insert(speciesTable)
    .values({ speciesRoot: tax_2, createdBy: user.id })
    .returning();

  let src_1Row = (await db.insert(sourceTable).values({ url: "https://pt.wikipedia.org/wiki/Porifera" }).onConflictDoNothing().returning())[0];
  if (!src_1Row) {
    [src_1Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://pt.wikipedia.org/wiki/Porifera"));
  }
  const src_1 = src_1Row.id;

  let src_2Row = (await db.insert(sourceTable).values({ url: "https://en.wikipedia.org/wiki/Sponge" }).onConflictDoNothing().returning())[0];
  if (!src_2Row) {
    [src_2Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://en.wikipedia.org/wiki/Sponge"));
  }
  const src_2 = src_2Row.id;

  let src_3Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:Vaasspons2.jpg" }).onConflictDoNothing().returning())[0];
  if (!src_3Row) {
    [src_3Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:Vaasspons2.jpg"));
  }
  const src_3 = src_3Row.id;

  let src_4Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:Grey_ball_sponge_at_Kreef_Reef_P5280131.jpg" }).onConflictDoNothing().returning())[0];
  if (!src_4Row) {
    [src_4Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:Grey_ball_sponge_at_Kreef_Reef_P5280131.jpg"));
  }
  const src_4 = src_4Row.id;

  let src_5Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:Barrel_Sponge_Davy_Crocker_Reef_20230715.jpg" }).onConflictDoNothing().returning())[0];
  if (!src_5Row) {
    [src_5Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:Barrel_Sponge_Davy_Crocker_Reef_20230715.jpg"));
  }
  const src_5 = src_5Row.id;

  let [atpl_1Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Classes viventes"), eq(attributeTemplateTable.unit, "class")));
  if (!atpl_1Row) {
    [atpl_1Row] = await db.insert(attributeTemplateTable).values({ label: "Classes viventes", unit: "class" }).returning();
  }
  const atpl_1 = atpl_1Row.id;

  let [atpl_2Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Espécies conhecidas"), eq(attributeTemplateTable.unit, "species")));
  if (!atpl_2Row) {
    [atpl_2Row] = await db.insert(attributeTemplateTable).values({ label: "Espécies conhecidas", unit: "species" }).returning();
  }
  const atpl_2 = atpl_2Row.id;

  let [atpl_3Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Profundidade máxima registrada"), eq(attributeTemplateTable.unit, "meter")));
  if (!atpl_3Row) {
    [atpl_3Row] = await db.insert(attributeTemplateTable).values({ label: "Profundidade máxima registrada", unit: "meter" }).returning();
  }
  const atpl_3 = atpl_3Row.id;

  let [atpl_4Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Captura de alimento pelos coanócitos"), eq(attributeTemplateTable.unit, "percent")));
  if (!atpl_4Row) {
    [atpl_4Row] = await db.insert(attributeTemplateTable).values({ label: "Captura de alimento pelos coanócitos", unit: "percent" }).returning();
  }
  const atpl_4 = atpl_4Row.id;

  let [atpl_5Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Velocidade de expulsão de água pelo ósculo"), eq(attributeTemplateTable.unit, "centimeter per second")));
  if (!atpl_5Row) {
    [atpl_5Row] = await db.insert(attributeTemplateTable).values({ label: "Velocidade de expulsão de água pelo ósculo", unit: "centimeter per second" }).returning();
  }
  const atpl_5 = atpl_5Row.id;

  await db.insert(attributeTable).values([
    { species: species_esponja_do_mar.id, attribute: atpl_1, value: "4", sourceId: src_2 },
    { species: species_esponja_do_mar.id, attribute: atpl_2, value: "5000-10000", sourceId: src_2 },
    { species: species_esponja_do_mar.id, attribute: atpl_3, value: "8000", sourceId: src_1 },
    { species: species_esponja_do_mar.id, attribute: atpl_4, value: "80", sourceId: src_2 },
    { species: species_esponja_do_mar.id, attribute: atpl_5, value: "8.5", sourceId: src_2 },
  ]);

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "esponja-do-mar", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_esponja_do_mar.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "esponja", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_esponja_do_mar.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "espongiário", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_esponja_do_mar.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "sea sponge", origin: "en" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_esponja_do_mar.id, popularNameId: pn.id });
  }

  function buildSourceIds_esponja_do_mar() {
    return { "wiki-porifera-pt": src_1, "wiki-sponge-en": src_2, "commons-vaasspons": src_3, "commons-greyball": src_4, "commons-barreldavy": src_5 };
  }
  const content_esponja_do_mar = buildArticleContent_esponja_do_mar(buildSourceIds_esponja_do_mar());
  const [article_esponja_do_mar] = await db
    .insert(articleTable)
    .values({ species: species_esponja_do_mar.id, content: content_esponja_do_mar })
    .returning();

  await db.insert(imageTable).values([
    { url: "https://commons.wikimedia.org/wiki/Special:FilePath/Vaasspons2.jpg", alt: "Esponja em forma de vaso (Xestospongia testudinaria), exemplo de esponja-barril do filo Porifera", article: article_esponja_do_mar.id, type: "online", source: "commons.wikimedia.org", credit: "Albert Kok, domínio público" },
    { url: "https://commons.wikimedia.org/wiki/Special:FilePath/Grey_ball_sponge_at_Kreef_Reef_P5280131.jpg", alt: "Esponja esférica cinzenta em recife, exemplo da diversidade de formas do filo Porifera", article: article_esponja_do_mar.id, type: "online", source: "commons.wikimedia.org", credit: "Peter Southwood, CC BY-SA 4.0" },
    { url: "https://commons.wikimedia.org/wiki/Special:FilePath/Barrel_Sponge_Davy_Crocker_Reef_20230715.jpg", alt: "Esponja-barril gigante (Xestospongia muta) em recife de coral na Florida Keys", article: article_esponja_do_mar.id, type: "online", source: "commons.wikimedia.org", credit: "Jstuby, CC0 1.0" },
  ]);

  await db.insert(articleSourcesPivotTable).values([
    { articleId: article_esponja_do_mar.id, sourceId: src_2 },
    { articleId: article_esponja_do_mar.id, sourceId: src_1 },
  ]);

  const [specimen_esponja_do_mar] = await db
    .insert(specimenTable)
    .values({ code: "CPINPORI01", lot: 1, shelf: 1, createdBy: user.id, speciesId: species_esponja_do_mar.id })
    .returning();
  // ---- anemona (Actiniaria) ----

  const [tax_3Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Filo", labelValue: "cnidaria", parent: tax_1, createdBy: user.id })
    .returning();
  const tax_3 = tax_3Row.id;

  const [tax_4Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Classe", labelValue: "anthozoa", parent: tax_3, createdBy: user.id })
    .returning();
  const tax_4 = tax_4Row.id;

  const [tax_5Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Ordem", labelValue: "actiniaria", parent: tax_4, createdBy: user.id })
    .returning();
  const tax_5 = tax_5Row.id;

  const [species_anemona] = await db
    .insert(speciesTable)
    .values({ speciesRoot: tax_5, createdBy: user.id })
    .returning();

  let src_6Row = (await db.insert(sourceTable).values({ url: "https://en.wikipedia.org/wiki/Sea_anemone" }).onConflictDoNothing().returning())[0];
  if (!src_6Row) {
    [src_6Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://en.wikipedia.org/wiki/Sea_anemone"));
  }
  const src_6 = src_6Row.id;

  let src_7Row = (await db.insert(sourceTable).values({ url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4013120" }).onConflictDoNothing().returning())[0];
  if (!src_7Row) {
    [src_7Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://pmc.ncbi.nlm.nih.gov/articles/PMC4013120"));
  }
  const src_7 = src_7Row.id;

  let src_8Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:Actiniaria.jpg" }).onConflictDoNothing().returning())[0];
  if (!src_8Row) {
    [src_8Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:Actiniaria.jpg"));
  }
  const src_8 = src_8Row.id;

  let src_9Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:Sea_Anemone_Structure.svg" }).onConflictDoNothing().returning())[0];
  if (!src_9Row) {
    [src_9Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:Sea_Anemone_Structure.svg"));
  }
  const src_9 = src_9Row.id;

  let src_10Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:Aardbeianemoon_(Actinia_fragacea).jpg" }).onConflictDoNothing().returning())[0];
  if (!src_10Row) {
    [src_10Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:Aardbeianemoon_(Actinia_fragacea).jpg"));
  }
  const src_10 = src_10Row.id;

  let src_11Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:Giant_green_anemone_(9444556933).jpg" }).onConflictDoNothing().returning())[0];
  if (!src_11Row) {
    [src_11Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:Giant_green_anemone_(9444556933).jpg"));
  }
  const src_11 = src_11Row.id;

  let [atpl_6Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Diâmetro corporal"), eq(attributeTemplateTable.unit, "centimeter")));
  if (!atpl_6Row) {
    [atpl_6Row] = await db.insert(attributeTemplateTable).values({ label: "Diâmetro corporal", unit: "centimeter" }).returning();
  }
  const atpl_6 = atpl_6Row.id;

  let [atpl_7Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Comprimento corporal"), eq(attributeTemplateTable.unit, "centimeter")));
  if (!atpl_7Row) {
    [atpl_7Row] = await db.insert(attributeTemplateTable).values({ label: "Comprimento corporal", unit: "centimeter" }).returning();
  }
  const atpl_7 = atpl_7Row.id;

  let [atpl_8Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Longevidade máxima registrada"), eq(attributeTemplateTable.unit, "year")));
  if (!atpl_8Row) {
    [atpl_8Row] = await db.insert(attributeTemplateTable).values({ label: "Longevidade máxima registrada", unit: "year" }).returning();
  }
  const atpl_8 = atpl_8Row.id;

  let [atpl_9Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Diversidade da ordem Actiniaria"), eq(attributeTemplateTable.unit, "species")));
  if (!atpl_9Row) {
    [atpl_9Row] = await db.insert(attributeTemplateTable).values({ label: "Diversidade da ordem Actiniaria", unit: "species" }).returning();
  }
  const atpl_9 = atpl_9Row.id;

  await db.insert(attributeTable).values([
    { species: species_anemona.id, attribute: atpl_6, value: "1 a 5", sourceId: src_6 },
    { species: species_anemona.id, attribute: atpl_7, value: "1.5 a 10", sourceId: src_6 },
    { species: species_anemona.id, attribute: atpl_8, value: "80 (em cativeiro, Heteractis magnifica)", sourceId: src_6 },
    { species: species_anemona.id, attribute: atpl_9, value: "aproximadamente 1200", sourceId: src_7 },
  ]);

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "anêmona-do-mar", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_anemona.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "anêmona", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_anemona.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "sea anemone", origin: "en" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_anemona.id, popularNameId: pn.id });
  }

  function buildSourceIds_anemona() {
    return { "wikipedia-sea-anemone": src_6, "pmc-actiniaria-classification": src_7, "commons-actiniaria-illustration": src_8, "commons-anemone-structure": src_9, "commons-strawberry-anemone": src_10, "commons-giant-green-anemone": src_11 };
  }
  const content_anemona = buildArticleContent_anemona(buildSourceIds_anemona());
  const [article_anemona] = await db
    .insert(articleTable)
    .values({ species: species_anemona.id, content: content_anemona })
    .returning();

  await db.insert(imageTable).values([
    { url: "https://upload.wikimedia.org/wikipedia/commons/7/76/Actiniaria.jpg", alt: "Ilustração científica de 1893 mostrando diversas espécies de anêmonas-do-mar (Actiniaria)", article: article_anemona.id, type: "online", source: "upload.wikimedia.org", credit: "Giacomo Merculiano (1893) — domínio público" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/b/b7/Sea_Anemone_Structure.svg", alt: "Diagrama anatômico de uma anêmona-do-mar, mostrando tentáculos, disco oral, disco pedal e estruturas internas", article: article_anemona.id, type: "online", source: "upload.wikimedia.org", credit: "Lydiakurkoski — CC BY-SA 3.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/b/b8/Aardbeianemoon_%28Actinia_fragacea%29.jpg", alt: "Fotografia da anêmona-morango (Actinia fragacea), espécie da ordem Actiniaria", article: article_anemona.id, type: "online", source: "upload.wikimedia.org", credit: "Margreet Frowijn-Druijven — CC BY-SA 4.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/9/94/Giant_green_anemone_%289444556933%29.jpg", alt: "Anêmona-verde-gigante (Anthopleura xanthogrammica) em poça de maré rochosa", article: article_anemona.id, type: "online", source: "upload.wikimedia.org", credit: "Bernard Spragg. NZ — CC0 1.0 (domínio público)" },
  ]);

  await db.insert(articleSourcesPivotTable).values([
    { articleId: article_anemona.id, sourceId: src_6 },
    { articleId: article_anemona.id, sourceId: src_7 },
  ]);

  const [specimen_anemona] = await db
    .insert(specimenTable)
    .values({ code: "CPINCNID01", lot: 1, shelf: 1, createdBy: user.id, speciesId: species_anemona.id })
    .returning();
  // ---- lombriga (Ascaris lumbricoides) ----

  const [tax_6Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Filo", labelValue: "nematoda", parent: tax_1, createdBy: user.id })
    .returning();
  const tax_6 = tax_6Row.id;

  const [tax_7Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Classe", labelValue: "chromadorea", parent: tax_6, createdBy: user.id })
    .returning();
  const tax_7 = tax_7Row.id;

  const [tax_8Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Ordem", labelValue: "rhabditida", parent: tax_7, createdBy: user.id })
    .returning();
  const tax_8 = tax_8Row.id;

  const [tax_9Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Família", labelValue: "ascarididae", parent: tax_8, createdBy: user.id })
    .returning();
  const tax_9 = tax_9Row.id;

  const [tax_10Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Gênero", labelValue: "ascaris", parent: tax_9, createdBy: user.id })
    .returning();
  const tax_10 = tax_10Row.id;

  const [tax_11Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Espécie", labelValue: "ascaris lumbricoides", parent: tax_10, createdBy: user.id })
    .returning();
  const tax_11 = tax_11Row.id;

  const [species_lombriga] = await db
    .insert(speciesTable)
    .values({ speciesRoot: tax_11, createdBy: user.id })
    .returning();

  let src_12Row = (await db.insert(sourceTable).values({ url: "https://en.wikipedia.org/wiki/Ascaris_lumbricoides" }).onConflictDoNothing().returning())[0];
  if (!src_12Row) {
    [src_12Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://en.wikipedia.org/wiki/Ascaris_lumbricoides"));
  }
  const src_12 = src_12Row.id;

  let src_13Row = (await db.insert(sourceTable).values({ url: "https://www.ncbi.nlm.nih.gov/books/NBK430796/" }).onConflictDoNothing().returning())[0];
  if (!src_13Row) {
    [src_13Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://www.ncbi.nlm.nih.gov/books/NBK430796/"));
  }
  const src_13 = src_13Row.id;

  let src_14Row = (await db.insert(sourceTable).values({ url: "https://www.todamateria.com.br/ascaridiase/" }).onConflictDoNothing().returning())[0];
  if (!src_14Row) {
    [src_14Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://www.todamateria.com.br/ascaridiase/"));
  }
  const src_14 = src_14Row.id;

  let [atpl_10Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Comprimento corporal (fêmea)"), eq(attributeTemplateTable.unit, "centimeter")));
  if (!atpl_10Row) {
    [atpl_10Row] = await db.insert(attributeTemplateTable).values({ label: "Comprimento corporal (fêmea)", unit: "centimeter" }).returning();
  }
  const atpl_10 = atpl_10Row.id;

  let [atpl_11Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Comprimento corporal (macho)"), eq(attributeTemplateTable.unit, "centimeter")));
  if (!atpl_11Row) {
    [atpl_11Row] = await db.insert(attributeTemplateTable).values({ label: "Comprimento corporal (macho)", unit: "centimeter" }).returning();
  }
  const atpl_11 = atpl_11Row.id;

  let [atpl_12Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Diâmetro corporal"), eq(attributeTemplateTable.unit, "millimeter")));
  if (!atpl_12Row) {
    [atpl_12Row] = await db.insert(attributeTemplateTable).values({ label: "Diâmetro corporal", unit: "millimeter" }).returning();
  }
  const atpl_12 = atpl_12Row.id;

  let [atpl_13Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Tempo até maturidade reprodutiva"), eq(attributeTemplateTable.unit, "day")));
  if (!atpl_13Row) {
    [atpl_13Row] = await db.insert(attributeTemplateTable).values({ label: "Tempo até maturidade reprodutiva", unit: "day" }).returning();
  }
  const atpl_13 = atpl_13Row.id;

  let [atpl_14Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Viabilidade dos ovos no solo"), eq(attributeTemplateTable.unit, "year")));
  if (!atpl_14Row) {
    [atpl_14Row] = await db.insert(attributeTemplateTable).values({ label: "Viabilidade dos ovos no solo", unit: "year" }).returning();
  }
  const atpl_14 = atpl_14Row.id;

  let [atpl_15Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Pessoas infectadas no mundo"), eq(attributeTemplateTable.unit, "person")));
  if (!atpl_15Row) {
    [atpl_15Row] = await db.insert(attributeTemplateTable).values({ label: "Pessoas infectadas no mundo", unit: "person" }).returning();
  }
  const atpl_15 = atpl_15Row.id;

  await db.insert(attributeTable).values([
    { species: species_lombriga.id, attribute: atpl_10, value: "20 to 49", sourceId: src_12 },
    { species: species_lombriga.id, attribute: atpl_11, value: "15 to 31", sourceId: src_12 },
    { species: species_lombriga.id, attribute: atpl_12, value: "2 to 6", sourceId: src_12 },
    { species: species_lombriga.id, attribute: atpl_13, value: "60 to 65", sourceId: src_12 },
    { species: species_lombriga.id, attribute: atpl_14, value: "up to 10", sourceId: src_12 },
    { species: species_lombriga.id, attribute: atpl_15, value: "more than 1 billion", sourceId: src_13 },
  ]);

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "lombriga", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_lombriga.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "bicha", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_lombriga.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "roundworm", origin: "en" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_lombriga.id, popularNameId: pn.id });
  }

  function buildSourceIds_lombriga() {
    return { "wikipedia-ascaris-lumbricoides": src_12, "ncbi-statpearls-ascariasis": src_13, "todamateria-ascaridiase": src_14 };
  }
  const content_lombriga = buildArticleContent_lombriga(buildSourceIds_lombriga());
  const [article_lombriga] = await db
    .insert(articleTable)
    .values({ species: species_lombriga.id, content: content_lombriga })
    .returning();

  await db.insert(imageTable).values([
    { url: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Ascaris_lumbricoides_%28jar%29.jpg", alt: "Espécimes adultos de Ascaris lumbricoides preservados em frasco", article: article_lombriga.id, type: "online", source: "upload.wikimedia.org", credit: "علاء (Alaa), Wikimedia Commons, CC BY-SA 3.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/c/ca/Ascariasis_LifeCycle_lg.jpg", alt: "Diagrama do ciclo de vida de Ascaris lumbricoides", article: article_lombriga.id, type: "online", source: "upload.wikimedia.org", credit: "CDC DPDx, Wikimedia Commons, domínio público" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/2/28/Egg_of_Ascaris_lumbricoides.jpg", alt: "Ovo de Ascaris lumbricoides visto em microscopia", article: article_lombriga.id, type: "online", source: "upload.wikimedia.org", credit: "Ajay Kumar Chaurasiya, Wikimedia Commons, CC BY-SA 4.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/d/dd/Ascaris_lumbricoides_adult_worms.png", alt: "Vermes adultos de Ascaris lumbricoides", article: article_lombriga.id, type: "online", source: "upload.wikimedia.org", credit: "SuSanA Secretariat, Wikimedia Commons, CC BY 2.0" },
  ]);

  await db.insert(articleSourcesPivotTable).values([
    { articleId: article_lombriga.id, sourceId: src_14 },
    { articleId: article_lombriga.id, sourceId: src_13 },
    { articleId: article_lombriga.id, sourceId: src_12 },
  ]);

  const [specimen_lombriga] = await db
    .insert(specimenTable)
    .values({ code: "CPINNEMA01", lot: 1, shelf: 1, createdBy: user.id, speciesId: species_lombriga.id })
    .returning();
  // ---- planaria (Tricladida) ----

  const [tax_12Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Filo", labelValue: "platyhelminthes", parent: tax_1, createdBy: user.id })
    .returning();
  const tax_12 = tax_12Row.id;

  const [tax_13Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Classe", labelValue: "turbellaria", parent: tax_12, createdBy: user.id })
    .returning();
  const tax_13 = tax_13Row.id;

  const [tax_14Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Ordem", labelValue: "tricladida", parent: tax_13, createdBy: user.id })
    .returning();
  const tax_14 = tax_14Row.id;

  const [species_planaria] = await db
    .insert(speciesTable)
    .values({ speciesRoot: tax_14, createdBy: user.id })
    .returning();

  let src_15Row = (await db.insert(sourceTable).values({ url: "https://en.wikipedia.org/wiki/Planaria" }).onConflictDoNothing().returning())[0];
  if (!src_15Row) {
    [src_15Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://en.wikipedia.org/wiki/Planaria"));
  }
  const src_15 = src_15Row.id;

  let src_16Row = (await db.insert(sourceTable).values({ url: "https://www.ebsco.com/research-starters/zoology/planarian" }).onConflictDoNothing().returning())[0];
  if (!src_16Row) {
    [src_16Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://www.ebsco.com/research-starters/zoology/planarian"));
  }
  const src_16 = src_16Row.id;

  let src_17Row = (await db.insert(sourceTable).values({ url: "https://ciliajournal.biomedcentral.com/articles/10.1186/s13630-016-0037-1" }).onConflictDoNothing().returning())[0];
  if (!src_17Row) {
    [src_17Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://ciliajournal.biomedcentral.com/articles/10.1186/s13630-016-0037-1"));
  }
  const src_17 = src_17Row.id;

  let src_18Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:Planaria_torva.jpg" }).onConflictDoNothing().returning())[0];
  if (!src_18Row) {
    [src_18Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:Planaria_torva.jpg"));
  }
  const src_18 = src_18Row.id;

  let src_19Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:Dugesia_etrusca_(Tricladida,_Paludicola)_2024.jpg" }).onConflictDoNothing().returning())[0];
  if (!src_19Row) {
    [src_19Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:Dugesia_etrusca_(Tricladida,_Paludicola)_2024.jpg"));
  }
  const src_19 = src_19Row.id;

  let src_20Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:Dugesia_Turbellaria_wm_head.jpg" }).onConflictDoNothing().returning())[0];
  if (!src_20Row) {
    [src_20Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:Dugesia_Turbellaria_wm_head.jpg"));
  }
  const src_20 = src_20Row.id;

  let [atpl_16Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Comprimento corporal"), eq(attributeTemplateTable.unit, "mm")));
  if (!atpl_16Row) {
    [atpl_16Row] = await db.insert(attributeTemplateTable).values({ label: "Comprimento corporal", unit: "mm" }).returning();
  }
  const atpl_16 = atpl_16Row.id;

  let [atpl_17Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Proporcao de neoblastos (celulas-tronco)"), eq(attributeTemplateTable.unit, "percent")));
  if (!atpl_17Row) {
    [atpl_17Row] = await db.insert(attributeTemplateTable).values({ label: "Proporcao de neoblastos (celulas-tronco)", unit: "percent" }).returning();
  }
  const atpl_17 = atpl_17Row.id;

  let [atpl_18Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Tempo de regeneracao da cabeca"), eq(attributeTemplateTable.unit, "week")));
  if (!atpl_18Row) {
    [atpl_18Row] = await db.insert(attributeTemplateTable).values({ label: "Tempo de regeneracao da cabeca", unit: "week" }).returning();
  }
  const atpl_18 = atpl_18Row.id;

  let [atpl_19Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Habitat"), eq(attributeTemplateTable.unit, "")));
  if (!atpl_19Row) {
    [atpl_19Row] = await db.insert(attributeTemplateTable).values({ label: "Habitat", unit: "" }).returning();
  }
  const atpl_19 = atpl_19Row.id;

  let [atpl_20Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Dieta"), eq(attributeTemplateTable.unit, "")));
  if (!atpl_20Row) {
    [atpl_20Row] = await db.insert(attributeTemplateTable).values({ label: "Dieta", unit: "" }).returning();
  }
  const atpl_20 = atpl_20Row.id;

  let [atpl_21Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Locomocao"), eq(attributeTemplateTable.unit, "")));
  if (!atpl_21Row) {
    [atpl_21Row] = await db.insert(attributeTemplateTable).values({ label: "Locomocao", unit: "" }).returning();
  }
  const atpl_21 = atpl_21Row.id;

  await db.insert(attributeTable).values([
    { species: species_planaria.id, attribute: atpl_16, value: "3-15", sourceId: src_16 },
    { species: species_planaria.id, attribute: atpl_17, value: "up to 30", sourceId: src_16 },
    { species: species_planaria.id, attribute: atpl_18, value: "about 2", sourceId: src_16 },
    { species: species_planaria.id, attribute: atpl_19, value: "agua doce, ambientes escuros e turvos", sourceId: src_15 },
    { species: species_planaria.id, attribute: atpl_20, value: "gastropodes de agua doce, oligoquetas tubificideos, artropodes (isopodes) e larvas de quironomideos", sourceId: src_15 },
    { species: species_planaria.id, attribute: atpl_21, value: "deslizamento por batimento ciliar na epiderme ventral sobre pelicula de muco", sourceId: src_17 },
  ]);

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Planária", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_planaria.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Planarian", origin: "en" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_planaria.id, popularNameId: pn.id });
  }

  function buildSourceIds_planaria() {
    return { "wikipedia-planaria": src_15, "ebsco-research-starter": src_16, "cilia-journal": src_17, "wikimedia-planaria-torva": src_18, "wikimedia-dugesia-etrusca": src_19, "wikimedia-dugesia-head": src_20 };
  }
  const content_planaria = buildArticleContent_planaria(buildSourceIds_planaria());
  const [article_planaria] = await db
    .insert(articleTable)
    .values({ species: species_planaria.id, content: content_planaria })
    .returning();

  await db.insert(imageTable).values([
    { url: "https://upload.wikimedia.org/wikipedia/commons/1/11/Planaria_torva.jpg", alt: "Especime de Planaria torva, platelminto de agua doce, em vista dorsal", article: article_planaria.id, type: "online", source: "upload.wikimedia.org", credit: "Holger Brandl, HongKee Moon, Miquel Vila-Farre, Shang-Yun Liu, Ian Henry, Jochen C. Rink (CC BY 4.0)" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Dugesia_etrusca_%28Tricladida%2C_Paludicola%29_2024.jpg", alt: "Especimes de Dugesia etrusca (Tricladida) coletados em rio, em placa de Petri", article: article_planaria.id, type: "online", source: "upload.wikimedia.org", credit: "Marta Riutort (CC0 1.0)" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/4/47/Dugesia_Turbellaria_wm_head.jpg", alt: "Detalhe da cabeca e do trato digestivo de uma planaria (Dugesia, Turbellaria)", article: article_planaria.id, type: "online", source: "upload.wikimedia.org", credit: "The Other 95% (CC BY-SA 4.0)" },
  ]);

  await db.insert(articleSourcesPivotTable).values([
    { articleId: article_planaria.id, sourceId: src_17 },
    { articleId: article_planaria.id, sourceId: src_15 },
    { articleId: article_planaria.id, sourceId: src_16 },
  ]);

  const [specimen_planaria] = await db
    .insert(specimenTable)
    .values({ code: "CPINPLAT01", lot: 1, shelf: 1, createdBy: user.id, speciesId: species_planaria.id })
    .returning();
  // ---- tenia (Taenia solium) ----

  const [tax_15Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Classe", labelValue: "cestoda", parent: tax_12, createdBy: user.id })
    .returning();
  const tax_15 = tax_15Row.id;

  const [tax_16Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Ordem", labelValue: "cyclophyllidea", parent: tax_15, createdBy: user.id })
    .returning();
  const tax_16 = tax_16Row.id;

  const [tax_17Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Família", labelValue: "taeniidae", parent: tax_16, createdBy: user.id })
    .returning();
  const tax_17 = tax_17Row.id;

  const [tax_18Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Gênero", labelValue: "taenia", parent: tax_17, createdBy: user.id })
    .returning();
  const tax_18 = tax_18Row.id;

  const [tax_19Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Espécie", labelValue: "taenia solium", parent: tax_18, createdBy: user.id })
    .returning();
  const tax_19 = tax_19Row.id;

  const [species_tenia] = await db
    .insert(speciesTable)
    .values({ speciesRoot: tax_19, createdBy: user.id })
    .returning();

  let src_21Row = (await db.insert(sourceTable).values({ url: "https://en.wikipedia.org/wiki/Taenia_solium" }).onConflictDoNothing().returning())[0];
  if (!src_21Row) {
    [src_21Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://en.wikipedia.org/wiki/Taenia_solium"));
  }
  const src_21 = src_21Row.id;

  let [atpl_22Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Comprimento corporal"), eq(attributeTemplateTable.unit, "meter")));
  if (!atpl_22Row) {
    [atpl_22Row] = await db.insert(attributeTemplateTable).values({ label: "Comprimento corporal", unit: "meter" }).returning();
  }
  const atpl_22 = atpl_22Row.id;

  let [atpl_23Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Número de proglótides"), eq(attributeTemplateTable.unit, "unit")));
  if (!atpl_23Row) {
    [atpl_23Row] = await db.insert(attributeTemplateTable).values({ label: "Número de proglótides", unit: "unit" }).returning();
  }
  const atpl_23 = atpl_23Row.id;

  let [atpl_24Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Diâmetro do escólex"), eq(attributeTemplateTable.unit, "millimeter")));
  if (!atpl_24Row) {
    [atpl_24Row] = await db.insert(attributeTemplateTable).values({ label: "Diâmetro do escólex", unit: "millimeter" }).returning();
  }
  const atpl_24 = atpl_24Row.id;

  let [atpl_25Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Número de ganchos rostelares"), eq(attributeTemplateTable.unit, "unit")));
  if (!atpl_25Row) {
    [atpl_25Row] = await db.insert(attributeTemplateTable).values({ label: "Número de ganchos rostelares", unit: "unit" }).returning();
  }
  const atpl_25 = atpl_25Row.id;

  let [atpl_26Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Diâmetro do ovo"), eq(attributeTemplateTable.unit, "micrometer")));
  if (!atpl_26Row) {
    [atpl_26Row] = await db.insert(attributeTemplateTable).values({ label: "Diâmetro do ovo", unit: "micrometer" }).returning();
  }
  const atpl_26 = atpl_26Row.id;

  let [atpl_27Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Tempo de maturação em humano"), eq(attributeTemplateTable.unit, "week")));
  if (!atpl_27Row) {
    [atpl_27Row] = await db.insert(attributeTemplateTable).values({ label: "Tempo de maturação em humano", unit: "week" }).returning();
  }
  const atpl_27 = atpl_27Row.id;

  await db.insert(attributeTable).values([
    { species: species_tenia.id, attribute: atpl_22, value: "2 to 3, exceptionally up to 8", sourceId: src_21 },
    { species: species_tenia.id, attribute: atpl_23, value: "800 to 900", sourceId: src_21 },
    { species: species_tenia.id, attribute: atpl_24, value: "1", sourceId: src_21 },
    { species: species_tenia.id, attribute: atpl_25, value: "22 to 32", sourceId: src_21 },
    { species: species_tenia.id, attribute: atpl_26, value: "35 to 42", sourceId: src_21 },
    { species: species_tenia.id, attribute: atpl_27, value: "10 to 12", sourceId: src_21 },
  ]);

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Tênia", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_tenia.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Solitária", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_tenia.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Verme da carne de porco", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_tenia.id, popularNameId: pn.id });
  }

  function buildSourceIds_tenia() {
    return { "wikipedia-taenia-solium": src_21 };
  }
  const content_tenia = buildArticleContent_tenia(buildSourceIds_tenia());
  const [article_tenia] = await db
    .insert(articleTable)
    .values({ species: species_tenia.id, content: content_tenia })
    .returning();

  await db.insert(imageTable).values([
    { url: "https://upload.wikimedia.org/wikipedia/commons/6/66/Taenia_solium_scolex.JPG", alt: "Escólex de Taenia solium com ganchos e ventosas visíveis em close-up", article: article_tenia.id, type: "online", source: "upload.wikimedia.org", credit: "Roberto J. Galindo (Bobjgalindo), CC BY-SA" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/3/34/Taenia_solium_life_cycle.jpg", alt: "Diagrama do ciclo de vida de Taenia solium entre hospedeiro humano e porco", article: article_tenia.id, type: "online", source: "upload.wikimedia.org", credit: "Teresa Julieta Simões Steyn, Amalia Naita Awala, Anja de Lange, Joseph Valentino Raimondo, CC BY 4.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/f/f5/Cysticercus_cellulosae.jpg", alt: "Cisticerco (Cysticercus cellulosae), forma larval de Taenia solium", article: article_tenia.id, type: "online", source: "upload.wikimedia.org", credit: "Bansal S, Suri A, Sharma MC, Kakkar A., Asian Journal of Neurosurgery (2017), CC BY-SA 3.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/d/d4/Taenia_solium_egg.jpg", alt: "Ovo de Taenia solium visto em microscopia", article: article_tenia.id, type: "online", source: "upload.wikimedia.org", credit: "Netha Hussain, CC BY-SA 3.0" },
  ]);

  await db.insert(articleSourcesPivotTable).values([
    { articleId: article_tenia.id, sourceId: src_21 },
  ]);

  const [specimen_tenia] = await db
    .insert(specimenTable)
    .values({ code: "CPINPLAT02", lot: 2, shelf: 1, createdBy: user.id, speciesId: species_tenia.id })
    .returning();
  // ---- bivalve (Perna perna) ----

  const [tax_20Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Filo", labelValue: "mollusca", parent: tax_1, createdBy: user.id })
    .returning();
  const tax_20 = tax_20Row.id;

  const [tax_21Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Classe", labelValue: "bivalvia", parent: tax_20, createdBy: user.id })
    .returning();
  const tax_21 = tax_21Row.id;

  const [tax_22Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Ordem", labelValue: "mytilida", parent: tax_21, createdBy: user.id })
    .returning();
  const tax_22 = tax_22Row.id;

  const [tax_23Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Família", labelValue: "mytilidae", parent: tax_22, createdBy: user.id })
    .returning();
  const tax_23 = tax_23Row.id;

  const [tax_24Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Gênero", labelValue: "perna", parent: tax_23, createdBy: user.id })
    .returning();
  const tax_24 = tax_24Row.id;

  const [tax_25Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Espécie", labelValue: "perna perna", parent: tax_24, createdBy: user.id })
    .returning();
  const tax_25 = tax_25Row.id;

  const [species_bivalve] = await db
    .insert(speciesTable)
    .values({ speciesRoot: tax_25, createdBy: user.id })
    .returning();

  let src_22Row = (await db.insert(sourceTable).values({ url: "https://en.wikipedia.org/wiki/Perna_perna" }).onConflictDoNothing().returning())[0];
  if (!src_22Row) {
    [src_22Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://en.wikipedia.org/wiki/Perna_perna"));
  }
  const src_22 = src_22Row.id;

  let src_23Row = (await db.insert(sourceTable).values({ url: "https://www.sealifebase.se/summary/47109" }).onConflictDoNothing().returning())[0];
  if (!src_23Row) {
    [src_23Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://www.sealifebase.se/summary/47109"));
  }
  const src_23 = src_23Row.id;

  let [atpl_28Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Comprimento da concha"), eq(attributeTemplateTable.unit, "millimeter")));
  if (!atpl_28Row) {
    [atpl_28Row] = await db.insert(attributeTemplateTable).values({ label: "Comprimento da concha", unit: "millimeter" }).returning();
  }
  const atpl_28 = atpl_28Row.id;

  let [atpl_29Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Faixa de temperatura tolerada"), eq(attributeTemplateTable.unit, "celsius")));
  if (!atpl_29Row) {
    [atpl_29Row] = await db.insert(attributeTemplateTable).values({ label: "Faixa de temperatura tolerada", unit: "celsius" }).returning();
  }
  const atpl_29 = atpl_29Row.id;

  let [atpl_30Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Faixa de salinidade tolerada"), eq(attributeTemplateTable.unit, "ppt")));
  if (!atpl_30Row) {
    [atpl_30Row] = await db.insert(attributeTemplateTable).values({ label: "Faixa de salinidade tolerada", unit: "ppt" }).returning();
  }
  const atpl_30 = atpl_30Row.id;

  let [atpl_31Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Hábito alimentar"), eq(attributeTemplateTable.unit, "")));
  if (!atpl_31Row) {
    [atpl_31Row] = await db.insert(attributeTemplateTable).values({ label: "Hábito alimentar", unit: "" }).returning();
  }
  const atpl_31 = atpl_31Row.id;

  let [atpl_32Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Faixa de profundidade"), eq(attributeTemplateTable.unit, "meter")));
  if (!atpl_32Row) {
    [atpl_32Row] = await db.insert(attributeTemplateTable).values({ label: "Faixa de profundidade", unit: "meter" }).returning();
  }
  const atpl_32 = atpl_32Row.id;

  let [atpl_33Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Vulnerabilidade à pesca"), eq(attributeTemplateTable.unit, "score")));
  if (!atpl_33Row) {
    [atpl_33Row] = await db.insert(attributeTemplateTable).values({ label: "Vulnerabilidade à pesca", unit: "score" }).returning();
  }
  const atpl_33 = atpl_33Row.id;

  await db.insert(attributeTable).values([
    { species: species_bivalve.id, attribute: atpl_28, value: "90 (até 120)", sourceId: src_22 },
    { species: species_bivalve.id, attribute: atpl_29, value: "10-30", sourceId: src_22 },
    { species: species_bivalve.id, attribute: atpl_30, value: "15-50", sourceId: src_22 },
    { species: species_bivalve.id, attribute: atpl_31, value: "filtrador, alimenta-se de fitoplâncton, zooplâncton e matéria orgânica em suspensão", sourceId: src_22 },
    { species: species_bivalve.id, attribute: atpl_32, value: "0-50", sourceId: src_23 },
    { species: species_bivalve.id, attribute: atpl_33, value: "29 de 100 (baixa a moderada)", sourceId: src_23 },
  ]);

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Mexilhão", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_bivalve.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Marisco", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_bivalve.id, popularNameId: pn.id });
  }

  function buildSourceIds_bivalve() {
    return { "wikipedia-en-perna-perna": src_22, "sealifebase-perna-perna": src_23 };
  }
  const content_bivalve = buildArticleContent_bivalve(buildSourceIds_bivalve());
  const [article_bivalve] = await db
    .insert(articleTable)
    .values({ species: species_bivalve.id, content: content_bivalve })
    .returning();

  await db.insert(imageTable).values([
    { url: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Perna_perna_01.jpg", alt: "Concha de Perna perna vista pela face externa, mostrando a coloração escura característica", article: article_bivalve.id, type: "online", source: "upload.wikimedia.org", credit: "H. Zell (CC BY-SA 3.0)" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/d/db/Perna_perna_02.jpg", alt: "Par de valvas de Perna perna vistas pela face interna, mostrando a camada nacarada", article: article_bivalve.id, type: "online", source: "upload.wikimedia.org", credit: "H. Zell (CC BY-SA 3.0)" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/f/f8/Colony_of_Brown_Mussels_silted_up%2C_South_Africa.jpg", alt: "Colônia de mexilhões-pardos (Perna perna) fixados a substrato rochoso", article: article_bivalve.id, type: "online", source: "upload.wikimedia.org", credit: "Olga Ernst (CC BY-SA 4.0)" },
  ]);

  await db.insert(articleSourcesPivotTable).values([
    { articleId: article_bivalve.id, sourceId: src_22 },
    { articleId: article_bivalve.id, sourceId: src_23 },
  ]);

  const [specimen_bivalve] = await db
    .insert(specimenTable)
    .values({ code: "CPINMOL01", lot: 1, shelf: 1, createdBy: user.id, speciesId: species_bivalve.id })
    .returning();
  // ---- lula-1 (Doryteuthis plei) ----

  const [tax_26Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Classe", labelValue: "cephalopoda", parent: tax_20, createdBy: user.id })
    .returning();
  const tax_26 = tax_26Row.id;

  const [tax_27Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Ordem", labelValue: "myopsida", parent: tax_26, createdBy: user.id })
    .returning();
  const tax_27 = tax_27Row.id;

  const [tax_28Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Família", labelValue: "loliginidae", parent: tax_27, createdBy: user.id })
    .returning();
  const tax_28 = tax_28Row.id;

  const [tax_29Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Gênero", labelValue: "doryteuthis", parent: tax_28, createdBy: user.id })
    .returning();
  const tax_29 = tax_29Row.id;

  const [tax_30Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Espécie", labelValue: "doryteuthis plei", parent: tax_29, createdBy: user.id })
    .returning();
  const tax_30 = tax_30Row.id;

  const [species_lula_1] = await db
    .insert(speciesTable)
    .values({ speciesRoot: tax_30, createdBy: user.id })
    .returning();

  let src_24Row = (await db.insert(sourceTable).values({ url: "https://en.wikipedia.org/wiki/Doryteuthis_plei" }).onConflictDoNothing().returning())[0];
  if (!src_24Row) {
    [src_24Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://en.wikipedia.org/wiki/Doryteuthis_plei"));
  }
  const src_24 = src_24Row.id;

  let src_25Row = (await db.insert(sourceTable).values({ url: "https://conchasbrasil.org.br/especies/cephalopoda/marinho-cephalopoda/decapodiformes/" }).onConflictDoNothing().returning())[0];
  if (!src_25Row) {
    [src_25Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://conchasbrasil.org.br/especies/cephalopoda/marinho-cephalopoda/decapodiformes/"));
  }
  const src_25 = src_25Row.id;

  let [atpl_34Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Comprimento médio do manto"), eq(attributeTemplateTable.unit, "millimeter")));
  if (!atpl_34Row) {
    [atpl_34Row] = await db.insert(attributeTemplateTable).values({ label: "Comprimento médio do manto", unit: "millimeter" }).returning();
  }
  const atpl_34 = atpl_34Row.id;

  let [atpl_35Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Comprimento máximo do manto (machos)"), eq(attributeTemplateTable.unit, "centimeter")));
  if (!atpl_35Row) {
    [atpl_35Row] = await db.insert(attributeTemplateTable).values({ label: "Comprimento máximo do manto (machos)", unit: "centimeter" }).returning();
  }
  const atpl_35 = atpl_35Row.id;

  let [atpl_36Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Distribuição no Brasil"), eq(attributeTemplateTable.unit, "")));
  if (!atpl_36Row) {
    [atpl_36Row] = await db.insert(attributeTemplateTable).values({ label: "Distribuição no Brasil", unit: "" }).returning();
  }
  const atpl_36 = atpl_36Row.id;

  let [atpl_37Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Proporção comprimento:largura do corpo"), eq(attributeTemplateTable.unit, "ratio")));
  if (!atpl_37Row) {
    [atpl_37Row] = await db.insert(attributeTemplateTable).values({ label: "Proporção comprimento:largura do corpo", unit: "ratio" }).returning();
  }
  const atpl_37 = atpl_37Row.id;

  let [atpl_38Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Status de conservação (IUCN)"), eq(attributeTemplateTable.unit, "")));
  if (!atpl_38Row) {
    [atpl_38Row] = await db.insert(attributeTemplateTable).values({ label: "Status de conservação (IUCN)", unit: "" }).returning();
  }
  const atpl_38 = atpl_38Row.id;

  await db.insert(attributeTable).values([
    { species: species_lula_1.id, attribute: atpl_34, value: "150", sourceId: src_25 },
    { species: species_lula_1.id, attribute: atpl_35, value: "33", sourceId: src_24 },
    { species: species_lula_1.id, attribute: atpl_36, value: "Rio de Janeiro, São Paulo, Paraná, Santa Catarina e Rio Grande do Sul", sourceId: src_25 },
    { species: species_lula_1.id, attribute: atpl_37, value: "7:1", sourceId: src_24 },
    { species: species_lula_1.id, attribute: atpl_20, value: "peixes estuarinos (ex. peixes-rei e mosquitofish) e pequenos crustáceos como camarões-da-grama", sourceId: src_24 },
    { species: species_lula_1.id, attribute: atpl_38, value: "pouco preocupante (LC)", sourceId: src_24 },
  ]);

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "lula", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_lula_1.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "arrow squid", origin: "en" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_lula_1.id, popularNameId: pn.id });
  }

  function buildSourceIds_lula_1() {
    return { "wikipedia-en": src_24, "conchasbrasil": src_25 };
  }
  const content_lula_1 = buildArticleContent_lula_1(buildSourceIds_lula_1());
  const [article_lula_1] = await db
    .insert(articleTable)
    .values({ species: species_lula_1.id, content: content_lula_1 })
    .returning();

  await db.insert(imageTable).values([
    { url: "https://upload.wikimedia.org/wikipedia/commons/a/ae/Arrow_squid.jpg", alt: "Lula-flecha (Doryteuthis plei) fotografada em águas costeiras, espécime com quase 61 cm de comprimento total", article: article_lula_1.id, type: "online", source: "upload.wikimedia.org", credit: "NOAA Ocean Explorer / Hadal (domínio público)" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/e/e5/Arrow_Squid_%2811358343214%29.jpg", alt: "Lula-flecha (Doryteuthis plei) viva, nadando em água costeira da Flórida", article: article_lula_1.id, type: "online", source: "upload.wikimedia.org", credit: "FWC Fish and Wildlife Research Institute (CC BY 2.0)" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/3/31/Arrow_Squid_%2811670510963%29.jpg", alt: "Lula-flecha (Doryteuthis plei) em vista lateral, mostrando manto alongado e nadadeiras rombóides", article: article_lula_1.id, type: "online", source: "upload.wikimedia.org", credit: "FWC Fish and Wildlife Research Institute (CC BY 2.0)" },
  ]);

  await db.insert(articleSourcesPivotTable).values([
    { articleId: article_lula_1.id, sourceId: src_24 },
    { articleId: article_lula_1.id, sourceId: src_25 },
  ]);

  const [specimen_lula_1] = await db
    .insert(specimenTable)
    .values({ code: "CPINMOL02", lot: 2, shelf: 1, createdBy: user.id, speciesId: species_lula_1.id })
    .returning();
  // ---- lesma (Phyllocaulis variegatus) ----

  const [tax_31Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Classe", labelValue: "gastropoda", parent: tax_20, createdBy: user.id })
    .returning();
  const tax_31 = tax_31Row.id;

  const [tax_32Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Ordem", labelValue: "systellommatophora", parent: tax_31, createdBy: user.id })
    .returning();
  const tax_32 = tax_32Row.id;

  const [tax_33Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Família", labelValue: "veronicellidae", parent: tax_32, createdBy: user.id })
    .returning();
  const tax_33 = tax_33Row.id;

  const [tax_34Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Gênero", labelValue: "phyllocaulis", parent: tax_33, createdBy: user.id })
    .returning();
  const tax_34 = tax_34Row.id;

  const [tax_35Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Espécie", labelValue: "phyllocaulis variegatus", parent: tax_34, createdBy: user.id })
    .returning();
  const tax_35 = tax_35Row.id;

  const [species_lesma] = await db
    .insert(speciesTable)
    .values({ speciesRoot: tax_35, createdBy: user.id })
    .returning();

  let src_26Row = (await db.insert(sourceTable).values({ url: "https://en.wikipedia.org/wiki/Phyllocaulis_variegatus" }).onConflictDoNothing().returning())[0];
  if (!src_26Row) {
    [src_26Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://en.wikipedia.org/wiki/Phyllocaulis_variegatus"));
  }
  const src_26 = src_26Row.id;

  let src_27Row = (await db.insert(sourceTable).values({ url: "https://en.wikipedia.org/wiki/Phyllocaulis" }).onConflictDoNothing().returning())[0];
  if (!src_27Row) {
    [src_27Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://en.wikipedia.org/wiki/Phyllocaulis"));
  }
  const src_27 = src_27Row.id;

  let src_28Row = (await db.insert(sourceTable).values({ url: "https://en.wikipedia.org/wiki/Veronicellidae" }).onConflictDoNothing().returning())[0];
  if (!src_28Row) {
    [src_28Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://en.wikipedia.org/wiki/Veronicellidae"));
  }
  const src_28 = src_28Row.id;

  let src_29Row = (await db.insert(sourceTable).values({ url: "https://www.elsevier.es/es-revista-revista-mexicana-biodiversidad-91-articulo-the-role-phyllocaulis-variegatus-mollusca-S1870345316000282" }).onConflictDoNothing().returning())[0];
  if (!src_29Row) {
    [src_29Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://www.elsevier.es/es-revista-revista-mexicana-biodiversidad-91-articulo-the-role-phyllocaulis-variegatus-mollusca-S1870345316000282"));
  }
  const src_29 = src_29Row.id;

  let [atpl_39Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Concha"), eq(attributeTemplateTable.unit, "")));
  if (!atpl_39Row) {
    [atpl_39Row] = await db.insert(attributeTemplateTable).values({ label: "Concha", unit: "" }).returning();
  }
  const atpl_39 = atpl_39Row.id;

  let [atpl_40Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Respiração"), eq(attributeTemplateTable.unit, "")));
  if (!atpl_40Row) {
    [atpl_40Row] = await db.insert(attributeTemplateTable).values({ label: "Respiração", unit: "" }).returning();
  }
  const atpl_40 = atpl_40Row.id;

  let [atpl_41Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Distribuição"), eq(attributeTemplateTable.unit, "")));
  if (!atpl_41Row) {
    [atpl_41Row] = await db.insert(attributeTemplateTable).values({ label: "Distribuição", unit: "" }).returning();
  }
  const atpl_41 = atpl_41Row.id;

  let [atpl_42Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Hospedeiro parasitário"), eq(attributeTemplateTable.unit, "")));
  if (!atpl_42Row) {
    [atpl_42Row] = await db.insert(attributeTemplateTable).values({ label: "Hospedeiro parasitário", unit: "" }).returning();
  }
  const atpl_42 = atpl_42Row.id;

  let [atpl_43Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Gênero"), eq(attributeTemplateTable.unit, "")));
  if (!atpl_43Row) {
    [atpl_43Row] = await db.insert(attributeTemplateTable).values({ label: "Gênero", unit: "" }).returning();
  }
  const atpl_43 = atpl_43Row.id;

  await db.insert(attributeTable).values([
    { species: species_lesma.id, attribute: atpl_39, value: "ausente; dorso completamente revestido pelo manto (hiponoto)", sourceId: src_28 },
    { species: species_lesma.id, attribute: atpl_40, value: "sem pulmão ou órgão pulmonar, ao contrário da maioria das lesmas terrestres; olhos em tentáculos contráteis (não retráteis)", sourceId: src_28 },
    { species: species_lesma.id, attribute: atpl_20, value: "herbívora, podendo causar danos a cultivos agrícolas", sourceId: src_28 },
    { species: species_lesma.id, attribute: atpl_41, value: "Brasil, Argentina e Uruguai", sourceId: src_26 },
    { species: species_lesma.id, attribute: atpl_42, value: "hospedeiro intermediário confirmado de metacercárias de Brachylaima sp. (Digenea: Brachylaimidae), registrado em Puerto Iguazú, Argentina", sourceId: src_29 },
    { species: species_lesma.id, attribute: atpl_43, value: "Phyllocaulis, gênero de distribuição sul-americana com 6 espécies descritas", sourceId: src_27 },
  ]);

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "lesma", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_lesma.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "leatherleaf slug", origin: "en" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_lesma.id, popularNameId: pn.id });
  }

  function buildSourceIds_lesma() {
    return { "wikipedia-phyllocaulis-variegatus": src_26, "wikipedia-phyllocaulis": src_27, "wikipedia-veronicellidae": src_28, "elsevier-brachylaima-phyllocaulis": src_29 };
  }
  const content_lesma = buildArticleContent_lesma(buildSourceIds_lesma());
  const [article_lesma] = await db
    .insert(articleTable)
    .values({ species: species_lesma.id, content: content_lesma })
    .returning();

  await db.insert(imageTable).values([
    { url: "https://upload.wikimedia.org/wikipedia/commons/d/db/Phyllocaulis_variegatus_imported_from_iNaturalist_photo_335552789_on_5_June_2024.jpg", alt: "Phyllocaulis variegatus fotografado em ambiente natural", article: article_lesma.id, type: "online", source: "upload.wikimedia.org", credit: "Paul Prior, via Wikimedia Commons / iNaturalist, CC BY 4.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/c/cb/Phyllocaulis_soleiformis_imported_from_iNaturalist_photo_238761687_on_5_June_2024.jpg", alt: "Phyllocaulis soleiformis, espécie do mesmo gênero, ilustrando a morfologia típica das lesmas-de-couro", article: article_lesma.id, type: "online", source: "upload.wikimedia.org", credit: "Abril Bastons, via Wikimedia Commons / iNaturalist, CC BY 4.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/7/73/Phyllocaulis_boraceiensis_-_Lucas_Mantelo_Cruz_-_468330114.jpeg", alt: "Phyllocaulis boraceiensis fotografado em Morretes, Paraná, Brasil", article: article_lesma.id, type: "online", source: "upload.wikimedia.org", credit: "Lucas Mantelo Cruz, via Wikimedia Commons / iNaturalist, CC BY 4.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/d/d7/Phyllocaulis_renschi.jpg", alt: "Phyllocaulis renschi fotografado no Rio Grande do Sul, Brasil", article: article_lesma.id, type: "online", source: "upload.wikimedia.org", credit: "vinicius_s_domingues, via Wikimedia Commons / iNaturalist, CC BY 4.0" },
  ]);

  await db.insert(articleSourcesPivotTable).values([
    { articleId: article_lesma.id, sourceId: src_29 },
    { articleId: article_lesma.id, sourceId: src_28 },
    { articleId: article_lesma.id, sourceId: src_26 },
    { articleId: article_lesma.id, sourceId: src_27 },
  ]);

  const [specimen_lesma] = await db
    .insert(specimenTable)
    .values({ code: "CPINMOL03", lot: 3, shelf: 1, createdBy: user.id, speciesId: species_lesma.id })
    .returning();
  // ---- caramujo (Lissachatina fulica) ----

  const [tax_36Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Ordem", labelValue: "stylommatophora", parent: tax_31, createdBy: user.id })
    .returning();
  const tax_36 = tax_36Row.id;

  const [tax_37Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Família", labelValue: "achatinidae", parent: tax_36, createdBy: user.id })
    .returning();
  const tax_37 = tax_37Row.id;

  const [tax_38Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Gênero", labelValue: "lissachatina", parent: tax_37, createdBy: user.id })
    .returning();
  const tax_38 = tax_38Row.id;

  const [tax_39Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Espécie", labelValue: "lissachatina fulica", parent: tax_38, createdBy: user.id })
    .returning();
  const tax_39 = tax_39Row.id;

  const [species_caramujo] = await db
    .insert(speciesTable)
    .values({ speciesRoot: tax_39, createdBy: user.id })
    .returning();

  let src_30Row = (await db.insert(sourceTable).values({ url: "https://www.gbif.org/species/8790531" }).onConflictDoNothing().returning())[0];
  if (!src_30Row) {
    [src_30Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://www.gbif.org/species/8790531"));
  }
  const src_30 = src_30Row.id;

  let src_31Row = (await db.insert(sourceTable).values({ url: "https://en.wikipedia.org/wiki/Lissachatina_fulica" }).onConflictDoNothing().returning())[0];
  if (!src_31Row) {
    [src_31Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://en.wikipedia.org/wiki/Lissachatina_fulica"));
  }
  const src_31 = src_31Row.id;

  let src_32Row = (await db.insert(sourceTable).values({ url: "https://www.saude.pr.gov.br/Pagina/Caramujo-Africano-Achatina-fulica" }).onConflictDoNothing().returning())[0];
  if (!src_32Row) {
    [src_32Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://www.saude.pr.gov.br/Pagina/Caramujo-Africano-Achatina-fulica"));
  }
  const src_32 = src_32Row.id;

  let [atpl_44Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Comprimento da concha"), eq(attributeTemplateTable.unit, "centimeter")));
  if (!atpl_44Row) {
    [atpl_44Row] = await db.insert(attributeTemplateTable).values({ label: "Comprimento da concha", unit: "centimeter" }).returning();
  }
  const atpl_44 = atpl_44Row.id;

  let [atpl_45Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Diâmetro da concha"), eq(attributeTemplateTable.unit, "centimeter")));
  if (!atpl_45Row) {
    [atpl_45Row] = await db.insert(attributeTemplateTable).values({ label: "Diâmetro da concha", unit: "centimeter" }).returning();
  }
  const atpl_45 = atpl_45Row.id;

  let [atpl_46Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Peso"), eq(attributeTemplateTable.unit, "gram")));
  if (!atpl_46Row) {
    [atpl_46Row] = await db.insert(attributeTemplateTable).values({ label: "Peso", unit: "gram" }).returning();
  }
  const atpl_46 = atpl_46Row.id;

  let [atpl_47Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Expectativa de vida"), eq(attributeTemplateTable.unit, "year")));
  if (!atpl_47Row) {
    [atpl_47Row] = await db.insert(attributeTemplateTable).values({ label: "Expectativa de vida", unit: "year" }).returning();
  }
  const atpl_47 = atpl_47Row.id;

  let [atpl_48Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Ovos por desova"), eq(attributeTemplateTable.unit, "egg")));
  if (!atpl_48Row) {
    [atpl_48Row] = await db.insert(attributeTemplateTable).values({ label: "Ovos por desova", unit: "egg" }).returning();
  }
  const atpl_48 = atpl_48Row.id;

  let [atpl_49Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Ano do primeiro registro no Paraná"), eq(attributeTemplateTable.unit, "year")));
  if (!atpl_49Row) {
    [atpl_49Row] = await db.insert(attributeTemplateTable).values({ label: "Ano do primeiro registro no Paraná", unit: "year" }).returning();
  }
  const atpl_49 = atpl_49Row.id;

  await db.insert(attributeTable).values([
    { species: species_caramujo.id, attribute: atpl_44, value: "20", sourceId: src_31 },
    { species: species_caramujo.id, attribute: atpl_45, value: "7", sourceId: src_31 },
    { species: species_caramujo.id, attribute: atpl_46, value: "100", sourceId: src_32 },
    { species: species_caramujo.id, attribute: atpl_47, value: "5", sourceId: src_32 },
    { species: species_caramujo.id, attribute: atpl_48, value: "200", sourceId: src_31 },
    { species: species_caramujo.id, attribute: atpl_49, value: "2000", sourceId: src_32 },
  ]);

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Caramujo-africano", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_caramujo.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Caramujo-gigante-africano", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_caramujo.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Giant African land snail", origin: "en" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_caramujo.id, popularNameId: pn.id });
  }

  function buildSourceIds_caramujo() {
    return { "gbif": src_30, "wiki-en": src_31, "saude-pr": src_32 };
  }
  const content_caramujo = buildArticleContent_caramujo(buildSourceIds_caramujo());
  const [article_caramujo] = await db
    .insert(articleTable)
    .values({ species: species_caramujo.id, content: content_caramujo })
    .returning();

  await db.insert(imageTable).values([
    { url: "https://upload.wikimedia.org/wikipedia/commons/f/fc/Achatina_fulica.jpg", alt: "Caramujo-africano (Lissachatina fulica) visto de lado, mostrando concha e corpo mole", article: article_caramujo.id, type: "online", source: "upload.wikimedia.org", credit: "Foto: Jayendra Chiplunkar, CC BY-SA 3.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/4/4d/Giant_African_land_snail_%28Achatina_fulica%29.jpg", alt: "Caramujo-africano em close-up, evidenciando a textura e os padrões da concha", article: article_caramujo.id, type: "online", source: "upload.wikimedia.org", credit: "Foto: Charles J. Sharp, CC BY-SA 4.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/c/c7/Giant_African_snail_%28Achatina_fulica%29_climbing_gate.jpg", alt: "Caramujo-africano escalando uma grade metálica", article: article_caramujo.id, type: "online", source: "upload.wikimedia.org", credit: "Foto: Scot Nelson, CC0 1.0 (domínio público)" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/4/4a/Achatina_fulica_eggs.jpg", alt: "Grupo de ovos de caramujo-africano depositados no solo", article: article_caramujo.id, type: "online", source: "upload.wikimedia.org", credit: "Foto: Ken Walker, Museum Victoria, CC BY 3.0 AU" },
  ]);

  await db.insert(articleSourcesPivotTable).values([
    { articleId: article_caramujo.id, sourceId: src_32 },
    { articleId: article_caramujo.id, sourceId: src_31 },
  ]);

  const [specimen_caramujo] = await db
    .insert(specimenTable)
    .values({ code: "CPINMOL04", lot: 4, shelf: 1, createdBy: user.id, speciesId: species_caramujo.id })
    .returning();
  // ---- lula-2 (Lolliguncula brevis) ----

  const [tax_40Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Gênero", labelValue: "lolliguncula", parent: tax_28, createdBy: user.id })
    .returning();
  const tax_40 = tax_40Row.id;

  const [tax_41Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Espécie", labelValue: "lolliguncula brevis", parent: tax_40, createdBy: user.id })
    .returning();
  const tax_41 = tax_41Row.id;

  const [species_lula_2] = await db
    .insert(speciesTable)
    .values({ speciesRoot: tax_41, createdBy: user.id })
    .returning();

  let src_33Row = (await db.insert(sourceTable).values({ url: "https://en.wikipedia.org/wiki/Lolliguncula_brevis" }).onConflictDoNothing().returning())[0];
  if (!src_33Row) {
    [src_33Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://en.wikipedia.org/wiki/Lolliguncula_brevis"));
  }
  const src_33 = src_33Row.id;

  let src_34Row = (await db.insert(sourceTable).values({ url: "https://sealifebase.ca/summary/57412" }).onConflictDoNothing().returning())[0];
  if (!src_34Row) {
    [src_34Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://sealifebase.ca/summary/57412"));
  }
  const src_34 = src_34Row.id;

  let src_35Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:Lolliguncula_brevis_AA-MD_10-07-02_(24535552329).jpg" }).onConflictDoNothing().returning())[0];
  if (!src_35Row) {
    [src_35Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:Lolliguncula_brevis_AA-MD_10-07-02_(24535552329).jpg"));
  }
  const src_35 = src_35Row.id;

  let src_36Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:Lolliguncula_brevis_SERC_10-13-16_(30325301491).jpg" }).onConflictDoNothing().returning())[0];
  if (!src_36Row) {
    [src_36Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:Lolliguncula_brevis_SERC_10-13-16_(30325301491).jpg"));
  }
  const src_36 = src_36Row.id;

  let src_37Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:Lolliguncula_brevis1.jpg" }).onConflictDoNothing().returning())[0];
  if (!src_37Row) {
    [src_37Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:Lolliguncula_brevis1.jpg"));
  }
  const src_37 = src_37Row.id;

  let src_38Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:Lolliguncula_brevis.jpg" }).onConflictDoNothing().returning())[0];
  if (!src_38Row) {
    [src_38Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:Lolliguncula_brevis.jpg"));
  }
  const src_38 = src_38Row.id;

  let [atpl_50Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Comprimento do manto (fêmea)"), eq(attributeTemplateTable.unit, "centimeter")));
  if (!atpl_50Row) {
    [atpl_50Row] = await db.insert(attributeTemplateTable).values({ label: "Comprimento do manto (fêmea)", unit: "centimeter" }).returning();
  }
  const atpl_50 = atpl_50Row.id;

  let [atpl_51Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Comprimento do manto (macho)"), eq(attributeTemplateTable.unit, "centimeter")));
  if (!atpl_51Row) {
    [atpl_51Row] = await db.insert(attributeTemplateTable).values({ label: "Comprimento do manto (macho)", unit: "centimeter" }).returning();
  }
  const atpl_51 = atpl_51Row.id;

  let [atpl_52Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Comprimento máximo do manto"), eq(attributeTemplateTable.unit, "centimeter")));
  if (!atpl_52Row) {
    [atpl_52Row] = await db.insert(attributeTemplateTable).values({ label: "Comprimento máximo do manto", unit: "centimeter" }).returning();
  }
  const atpl_52 = atpl_52Row.id;

  let [atpl_53Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Profundidade de ocorrência"), eq(attributeTemplateTable.unit, "meter")));
  if (!atpl_53Row) {
    [atpl_53Row] = await db.insert(attributeTemplateTable).values({ label: "Profundidade de ocorrência", unit: "meter" }).returning();
  }
  const atpl_53 = atpl_53Row.id;

  let [atpl_54Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Tolerância mínima de salinidade"), eq(attributeTemplateTable.unit, "part per thousand")));
  if (!atpl_54Row) {
    [atpl_54Row] = await db.insert(attributeTemplateTable).values({ label: "Tolerância mínima de salinidade", unit: "part per thousand" }).returning();
  }
  const atpl_54 = atpl_54Row.id;

  let [atpl_55Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Status de conservação (IUCN)"), eq(attributeTemplateTable.unit, "category")));
  if (!atpl_55Row) {
    [atpl_55Row] = await db.insert(attributeTemplateTable).values({ label: "Status de conservação (IUCN)", unit: "category" }).returning();
  }
  const atpl_55 = atpl_55Row.id;

  await db.insert(attributeTable).values([
    { species: species_lula_2.id, attribute: atpl_50, value: "11", sourceId: src_33 },
    { species: species_lula_2.id, attribute: atpl_51, value: "9", sourceId: src_33 },
    { species: species_lula_2.id, attribute: atpl_52, value: "12", sourceId: src_33 },
    { species: species_lula_2.id, attribute: atpl_53, value: "8.9-26.5", sourceId: src_33 },
    { species: species_lula_2.id, attribute: atpl_54, value: "17.9", sourceId: src_33 },
    { species: species_lula_2.id, attribute: atpl_55, value: "data deficient", sourceId: src_33 },
  ]);

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Lula", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_lula_2.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Lula-rabo-de-fósforo", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_lula_2.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Atlantic brief squid", origin: "en" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_lula_2.id, popularNameId: pn.id });
  }

  function buildSourceIds_lula_2() {
    return { "wikipedia-en": src_33, "sealifebase": src_34, "commons-serc-1": src_35, "commons-serc-2": src_36, "commons-noaa": src_37, "commons-ferussac": src_38 };
  }
  const content_lula_2 = buildArticleContent_lula_2(buildSourceIds_lula_2());
  const [article_lula_2] = await db
    .insert(articleTable)
    .values({ species: species_lula_2.id, content: content_lula_2 })
    .returning();

  await db.insert(imageTable).values([
    { url: "https://upload.wikimedia.org/wikipedia/commons/0/0a/Lolliguncula_brevis_SERC_10-13-16_%2830325301491%29.jpg", alt: "Espécime de Lolliguncula brevis de 37 mm coletado no Chesapeake Bay, Maryland", article: article_lula_2.id, type: "online", source: "upload.wikimedia.org", credit: "Robert Aguilar / Smithsonian Environmental Research Center (CC BY 2.0)" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/3/30/Lolliguncula_brevis_AA-MD_10-07-02_%2824535552329%29.jpg", alt: "Espécime preservado de Lolliguncula brevis de 64 mm do Rhode River, Maryland", article: article_lula_2.id, type: "online", source: "upload.wikimedia.org", credit: "Robert Aguilar / Smithsonian Environmental Research Center (CC BY 2.0)" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/9/99/Lolliguncula_brevis1.jpg", alt: "Lula-rabo-de-fósforo (Lolliguncula brevis) fotografada no Golfo do México", article: article_lula_2.id, type: "online", source: "upload.wikimedia.org", credit: "NOAA/NMFS/SEFSC Pascagoula Laboratory, coleção de Brandi Noble (domínio público)" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/6/65/Lolliguncula_brevis.jpg", alt: "Ilustração científica histórica de Lolliguncula brevis", article: article_lula_2.id, type: "online", source: "upload.wikimedia.org", credit: "Férussac, 'Histoire naturelle des céphalopodes acétabulifères' (1835-1848), domínio público" },
  ]);

  await db.insert(articleSourcesPivotTable).values([
    { articleId: article_lula_2.id, sourceId: src_33 },
    { articleId: article_lula_2.id, sourceId: src_34 },
  ]);

  const [specimen_lula_2] = await db
    .insert(specimenTable)
    .values({ code: "CPINMOL05", lot: 5, shelf: 1, createdBy: user.id, speciesId: species_lula_2.id })
    .returning();
  // ---- polvo (Octopus vulgaris) ----

  const [tax_42Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Ordem", labelValue: "octopoda", parent: tax_26, createdBy: user.id })
    .returning();
  const tax_42 = tax_42Row.id;

  const [tax_43Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Família", labelValue: "octopodidae", parent: tax_42, createdBy: user.id })
    .returning();
  const tax_43 = tax_43Row.id;

  const [tax_44Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Gênero", labelValue: "octopus", parent: tax_43, createdBy: user.id })
    .returning();
  const tax_44 = tax_44Row.id;

  const [tax_45Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Espécie", labelValue: "octopus vulgaris", parent: tax_44, createdBy: user.id })
    .returning();
  const tax_45 = tax_45Row.id;

  const [species_polvo] = await db
    .insert(speciesTable)
    .values({ speciesRoot: tax_45, createdBy: user.id })
    .returning();

  let src_39Row = (await db.insert(sourceTable).values({ url: "https://en.wikipedia.org/wiki/Octopus_vulgaris" }).onConflictDoNothing().returning())[0];
  if (!src_39Row) {
    [src_39Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://en.wikipedia.org/wiki/Octopus_vulgaris"));
  }
  const src_39 = src_39Row.id;

  let src_40Row = (await db.insert(sourceTable).values({ url: "https://en.wikipedia.org/wiki/Octopus_insularis" }).onConflictDoNothing().returning())[0];
  if (!src_40Row) {
    [src_40Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://en.wikipedia.org/wiki/Octopus_insularis"));
  }
  const src_40 = src_40Row.id;

  let src_41Row = (await db.insert(sourceTable).values({ url: "https://oceanrep.geomar.de/id/eprint/36767/1/2196.pdf" }).onConflictDoNothing().returning())[0];
  if (!src_41Row) {
    [src_41Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://oceanrep.geomar.de/id/eprint/36767/1/2196.pdf"));
  }
  const src_41 = src_41Row.id;

  let src_42Row = (await db.insert(sourceTable).values({ url: "https://www.frontiersin.org/journals/physiology/articles/10.3389/fphys.2023.1162807/full" }).onConflictDoNothing().returning())[0];
  if (!src_42Row) {
    [src_42Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://www.frontiersin.org/journals/physiology/articles/10.3389/fphys.2023.1162807/full"));
  }
  const src_42 = src_42Row.id;

  let [atpl_56Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Comprimento do manto"), eq(attributeTemplateTable.unit, "centimeter")));
  if (!atpl_56Row) {
    [atpl_56Row] = await db.insert(attributeTemplateTable).values({ label: "Comprimento do manto", unit: "centimeter" }).returning();
  }
  const atpl_56 = atpl_56Row.id;

  let [atpl_57Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Comprimento dos braços"), eq(attributeTemplateTable.unit, "meter")));
  if (!atpl_57Row) {
    [atpl_57Row] = await db.insert(attributeTemplateTable).values({ label: "Comprimento dos braços", unit: "meter" }).returning();
  }
  const atpl_57 = atpl_57Row.id;

  let [atpl_58Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Massa corporal"), eq(attributeTemplateTable.unit, "kilogram")));
  if (!atpl_58Row) {
    [atpl_58Row] = await db.insert(attributeTemplateTable).values({ label: "Massa corporal", unit: "kilogram" }).returning();
  }
  const atpl_58 = atpl_58Row.id;

  let [atpl_59Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Captura no litoral do Rio de Janeiro"), eq(attributeTemplateTable.unit, "")));
  if (!atpl_59Row) {
    [atpl_59Row] = await db.insert(attributeTemplateTable).values({ label: "Captura no litoral do Rio de Janeiro", unit: "" }).returning();
  }
  const atpl_59 = atpl_59Row.id;

  await db.insert(attributeTable).values([
    { species: species_polvo.id, attribute: atpl_56, value: "up to 25", sourceId: src_39 },
    { species: species_polvo.id, attribute: atpl_57, value: "up to 1", sourceId: src_39 },
    { species: species_polvo.id, attribute: atpl_58, value: "up to 9", sourceId: src_39 },
    { species: species_polvo.id, attribute: atpl_53, value: "0 to 200", sourceId: src_39 },
    { species: species_polvo.id, attribute: atpl_38, value: "least concern", sourceId: src_39 },
    { species: species_polvo.id, attribute: atpl_59, value: "ocorre durante todo o ano, por arrasto de camarão e pesca artesanal", sourceId: src_41 },
  ]);

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "polvo", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_polvo.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "polvo-comum", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_polvo.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "common octopus", origin: "en" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_polvo.id, popularNameId: pn.id });
  }

  function buildSourceIds_polvo() {
    return { "wikipedia-octopus-vulgaris": src_39, "wikipedia-octopus-insularis": src_40, "pesca-polvos-lulas-rj": src_41, "frontiers-insularis-florida-2023": src_42 };
  }
  const content_polvo = buildArticleContent_polvo(buildSourceIds_polvo());
  const [article_polvo] = await db
    .insert(articleTable)
    .values({ species: species_polvo.id, content: content_polvo })
    .returning();

  await db.insert(imageTable).values([
    { url: "https://upload.wikimedia.org/wikipedia/commons/7/72/Common_octopus.jpg", alt: "Polvo-comum (Octopus vulgaris) fotografado em ambiente marinho natural", article: article_polvo.id, type: "online", source: "upload.wikimedia.org", credit: "Martijn Klijnstra (Freaky Fries), CC BY-SA 4.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/9/9f/Octopus_vulgaris_2.jpg", alt: "Octopus vulgaris deslocando-se sobre substrato rochoso", article: article_polvo.id, type: "online", source: "upload.wikimedia.org", credit: "Albert Kok, domínio público" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/5/5c/Octopus_vulgaris_03.jpg", alt: "Detalhe dos braços e ventosas de Octopus vulgaris", article: article_polvo.id, type: "online", source: "upload.wikimedia.org", credit: "H. Zell, CC BY-SA 3.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/5/55/Gew%C3%B6hnlicher_Krake_Octopus_vulgaris_1.jpg", alt: "Octopus vulgaris camuflado entre rochas no mar Mediterrâneo", article: article_polvo.id, type: "online", source: "upload.wikimedia.org", credit: "Holger Krisp, CC BY 4.0" },
  ]);

  await db.insert(articleSourcesPivotTable).values([
    { articleId: article_polvo.id, sourceId: src_42 },
    { articleId: article_polvo.id, sourceId: src_40 },
    { articleId: article_polvo.id, sourceId: src_39 },
    { articleId: article_polvo.id, sourceId: src_41 },
  ]);

  const [specimen_polvo] = await db
    .insert(specimenTable)
    .values({ code: "CPINMOL06", lot: 6, shelf: 1, createdBy: user.id, speciesId: species_polvo.id })
    .returning();
  // ---- sanguessuga (Hirudo medicinalis) ----

  const [tax_46Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Filo", labelValue: "annelida", parent: tax_1, createdBy: user.id })
    .returning();
  const tax_46 = tax_46Row.id;

  const [tax_47Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Classe", labelValue: "clitellata", parent: tax_46, createdBy: user.id })
    .returning();
  const tax_47 = tax_47Row.id;

  const [tax_48Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Subclasse", labelValue: "hirudinea", parent: tax_47, createdBy: user.id })
    .returning();
  const tax_48 = tax_48Row.id;

  const [tax_49Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Ordem", labelValue: "arhynchobdellida", parent: tax_48, createdBy: user.id })
    .returning();
  const tax_49 = tax_49Row.id;

  const [tax_50Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Família", labelValue: "hirudinidae", parent: tax_49, createdBy: user.id })
    .returning();
  const tax_50 = tax_50Row.id;

  const [tax_51Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Gênero", labelValue: "hirudo", parent: tax_50, createdBy: user.id })
    .returning();
  const tax_51 = tax_51Row.id;

  const [tax_52Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Espécie", labelValue: "hirudo medicinalis", parent: tax_51, createdBy: user.id })
    .returning();
  const tax_52 = tax_52Row.id;

  const [species_sanguessuga] = await db
    .insert(speciesTable)
    .values({ speciesRoot: tax_52, createdBy: user.id })
    .returning();

  let src_43Row = (await db.insert(sourceTable).values({ url: "https://en.wikipedia.org/wiki/Hirudo_medicinalis" }).onConflictDoNothing().returning())[0];
  if (!src_43Row) {
    [src_43Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://en.wikipedia.org/wiki/Hirudo_medicinalis"));
  }
  const src_43 = src_43Row.id;

  let src_44Row = (await db.insert(sourceTable).values({ url: "https://pt.wikipedia.org/wiki/Hirudinea" }).onConflictDoNothing().returning())[0];
  if (!src_44Row) {
    [src_44Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://pt.wikipedia.org/wiki/Hirudinea"));
  }
  const src_44 = src_44Row.id;

  let src_45Row = (await db.insert(sourceTable).values({ url: "https://www.hirudotherapysociety.org/leech-biology/ecology-conservation" }).onConflictDoNothing().returning())[0];
  if (!src_45Row) {
    [src_45Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://www.hirudotherapysociety.org/leech-biology/ecology-conservation"));
  }
  const src_45 = src_45Row.id;

  let src_46Row = (await db.insert(sourceTable).values({ url: "https://worldspecies.org/ntaxa/2078727" }).onConflictDoNothing().returning())[0];
  if (!src_46Row) {
    [src_46Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://worldspecies.org/ntaxa/2078727"));
  }
  const src_46 = src_46Row.id;

  let [atpl_60Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Comprimento máximo"), eq(attributeTemplateTable.unit, "cm")));
  if (!atpl_60Row) {
    [atpl_60Row] = await db.insert(attributeTemplateTable).values({ label: "Comprimento máximo", unit: "cm" }).returning();
  }
  const atpl_60 = atpl_60Row.id;

  let [atpl_61Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Volume de sangue ingerido por refeição"), eq(attributeTemplateTable.unit, "ml")));
  if (!atpl_61Row) {
    [atpl_61Row] = await db.insert(attributeTemplateTable).values({ label: "Volume de sangue ingerido por refeição", unit: "ml" }).returning();
  }
  const atpl_61 = atpl_61Row.id;

  let [atpl_62Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Intervalo entre refeições"), eq(attributeTemplateTable.unit, "month")));
  if (!atpl_62Row) {
    [atpl_62Row] = await db.insert(attributeTemplateTable).values({ label: "Intervalo entre refeições", unit: "month" }).returning();
  }
  const atpl_62 = atpl_62Row.id;

  let [atpl_63Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Número de dentes por mandíbula"), eq(attributeTemplateTable.unit, "unit")));
  if (!atpl_63Row) {
    [atpl_63Row] = await db.insert(attributeTemplateTable).values({ label: "Número de dentes por mandíbula", unit: "unit" }).returning();
  }
  const atpl_63 = atpl_63Row.id;

  let [atpl_64Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Ovos por postura"), eq(attributeTemplateTable.unit, "unit")));
  if (!atpl_64Row) {
    [atpl_64Row] = await db.insert(attributeTemplateTable).values({ label: "Ovos por postura", unit: "unit" }).returning();
  }
  const atpl_64 = atpl_64Row.id;

  await db.insert(attributeTable).values([
    { species: species_sanguessuga.id, attribute: atpl_60, value: "20", sourceId: src_43 },
    { species: species_sanguessuga.id, attribute: atpl_61, value: "5-15", sourceId: src_43 },
    { species: species_sanguessuga.id, attribute: atpl_62, value: "up to 12", sourceId: src_43 },
    { species: species_sanguessuga.id, attribute: atpl_63, value: "about 100", sourceId: src_43 },
    { species: species_sanguessuga.id, attribute: atpl_64, value: "up to 50", sourceId: src_43 },
    { species: species_sanguessuga.id, attribute: atpl_55, value: "near threatened", sourceId: src_45 },
  ]);

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "sanguessuga", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_sanguessuga.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "sanguessuga medicinal europeia", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_sanguessuga.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "sanguessuga-do-boticário", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_sanguessuga.id, popularNameId: pn.id });
  }

  function buildSourceIds_sanguessuga() {
    return { "wikipedia-en-hirudo-medicinalis": src_43, "wikipedia-pt-hirudinea": src_44, "hirudotherapy-society-ecology": src_45, "worldspecies-glossiphoniidae": src_46 };
  }
  const content_sanguessuga = buildArticleContent_sanguessuga(buildSourceIds_sanguessuga());
  const [article_sanguessuga] = await db
    .insert(articleTable)
    .values({ species: species_sanguessuga.id, content: content_sanguessuga })
    .returning();

  await db.insert(imageTable).values([
    { url: "https://upload.wikimedia.org/wikipedia/commons/5/57/European_medicinal_leech_%28Hirudo_medicinalis%29_at_the_California_Academy_of_Sciences_01.jpg", alt: "Sanguessuga medicinal europeia (Hirudo medicinalis) fotografada em aquário", article: article_sanguessuga.id, type: "online", source: "upload.wikimedia.org", credit: "Evan Baldonado // AquariumKids.org, CC BY 4.0, via Wikimedia Commons" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/0/07/Hirudo_medicinalis_anatomy_by_Syme.png", alt: "Ilustração da anatomia interna de Hirudo medicinalis em três figuras", article: article_sanguessuga.id, type: "online", source: "upload.wikimedia.org", credit: "Patrick Syme (1816), domínio público, via Wikimedia Commons" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/5/51/HirudoMedicinalis_BiteWound.jpg", alt: "Marca de mordida típica de Hirudo medicinalis em dedo humano", article: article_sanguessuga.id, type: "online", source: "upload.wikimedia.org", credit: "Christian Fischer (Fice), CC BY-SA 3.0, via Wikimedia Commons" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/e/e1/PSM_V17_D495_The_medicinal_leech.jpg", alt: "Ilustração científica de Hirudo medicinalis em vista superior e inferior", article: article_sanguessuga.id, type: "online", source: "upload.wikimedia.org", credit: "Popular Science Monthly, vol. 17 (1880), domínio público, via Wikimedia Commons" },
  ]);

  await db.insert(articleSourcesPivotTable).values([
    { articleId: article_sanguessuga.id, sourceId: src_43 },
    { articleId: article_sanguessuga.id, sourceId: src_45 },
    { articleId: article_sanguessuga.id, sourceId: src_44 },
  ]);

  const [specimen_sanguessuga] = await db
    .insert(specimenTable)
    .values({ code: "CPINANEL01", lot: 1, shelf: 1, createdBy: user.id, speciesId: species_sanguessuga.id })
    .returning();
  // ---- minhoca (Pontoscolex corethrurus) ----

  const [tax_53Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Subclasse", labelValue: "oligochaeta", parent: tax_47, createdBy: user.id })
    .returning();
  const tax_53 = tax_53Row.id;

  const [tax_54Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Ordem", labelValue: "haplotaxida", parent: tax_53, createdBy: user.id })
    .returning();
  const tax_54 = tax_54Row.id;

  const [tax_55Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Família", labelValue: "glossoscolecidae", parent: tax_54, createdBy: user.id })
    .returning();
  const tax_55 = tax_55Row.id;

  const [tax_56Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Gênero", labelValue: "pontoscolex", parent: tax_55, createdBy: user.id })
    .returning();
  const tax_56 = tax_56Row.id;

  const [tax_57Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Espécie", labelValue: "pontoscolex corethrurus", parent: tax_56, createdBy: user.id })
    .returning();
  const tax_57 = tax_57Row.id;

  const [species_minhoca] = await db
    .insert(speciesTable)
    .values({ speciesRoot: tax_57, createdBy: user.id })
    .returning();

  let src_47Row = (await db.insert(sourceTable).values({ url: "https://en.wikipedia.org/wiki/Pontoscolex_corethrurus" }).onConflictDoNothing().returning())[0];
  if (!src_47Row) {
    [src_47Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://en.wikipedia.org/wiki/Pontoscolex_corethrurus"));
  }
  const src_47 = src_47Row.id;

  let src_48Row = (await db.insert(sourceTable).values({ url: "https://pt.wikipedia.org/wiki/Glossoscolecidae" }).onConflictDoNothing().returning())[0];
  if (!src_48Row) {
    [src_48Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://pt.wikipedia.org/wiki/Glossoscolecidae"));
  }
  const src_48 = src_48Row.id;

  let src_49Row = (await db.insert(sourceTable).values({ url: "https://api.gbif.org/v1/species/search?q=Pontoscolex%20corethrurus" }).onConflictDoNothing().returning())[0];
  if (!src_49Row) {
    [src_49Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://api.gbif.org/v1/species/search?q=Pontoscolex%20corethrurus"));
  }
  const src_49 = src_49Row.id;

  let src_50Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/Category:Pontoscolex_corethrurus" }).onConflictDoNothing().returning())[0];
  if (!src_50Row) {
    [src_50Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/Category:Pontoscolex_corethrurus"));
  }
  const src_50 = src_50Row.id;

  let src_51Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/Category:Pontoscolex" }).onConflictDoNothing().returning())[0];
  if (!src_51Row) {
    [src_51Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/Category:Pontoscolex"));
  }
  const src_51 = src_51Row.id;

  let src_52Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:Pontoscolex_corethrurus.jpg" }).onConflictDoNothing().returning())[0];
  if (!src_52Row) {
    [src_52Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:Pontoscolex_corethrurus.jpg"));
  }
  const src_52 = src_52Row.id;

  let src_53Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:Glossoscolex_sp.jpg" }).onConflictDoNothing().returning())[0];
  if (!src_53Row) {
    [src_53Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:Glossoscolex_sp.jpg"));
  }
  const src_53 = src_53Row.id;

  let src_54Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:EB1911_Chaetopoda_Fig._10.%E2%80%94Diagrams_of_various_Earthworms,_to_illustrate_external_characters.jpg" }).onConflictDoNothing().returning())[0];
  if (!src_54Row) {
    [src_54Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:EB1911_Chaetopoda_Fig._10.%E2%80%94Diagrams_of_various_Earthworms,_to_illustrate_external_characters.jpg"));
  }
  const src_54 = src_54Row.id;

  let [atpl_65Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Comprimento do corpo"), eq(attributeTemplateTable.unit, "centimeter")));
  if (!atpl_65Row) {
    [atpl_65Row] = await db.insert(attributeTemplateTable).values({ label: "Comprimento do corpo", unit: "centimeter" }).returning();
  }
  const atpl_65 = atpl_65Row.id;

  let [atpl_66Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Número de segmentos corporais"), eq(attributeTemplateTable.unit, "segment")));
  if (!atpl_66Row) {
    [atpl_66Row] = await db.insert(attributeTemplateTable).values({ label: "Número de segmentos corporais", unit: "segment" }).returning();
  }
  const atpl_66 = atpl_66Row.id;

  let [atpl_67Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Distribuição nativa"), eq(attributeTemplateTable.unit, "region")));
  if (!atpl_67Row) {
    [atpl_67Row] = await db.insert(attributeTemplateTable).values({ label: "Distribuição nativa", unit: "region" }).returning();
  }
  const atpl_67 = atpl_67Row.id;

  let [atpl_68Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Modo de reprodução"), eq(attributeTemplateTable.unit, "mode")));
  if (!atpl_68Row) {
    [atpl_68Row] = await db.insert(attributeTemplateTable).values({ label: "Modo de reprodução", unit: "mode" }).returning();
  }
  const atpl_68 = atpl_68Row.id;

  let [atpl_69Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Duração do ciclo de vida"), eq(attributeTemplateTable.unit, "year")));
  if (!atpl_69Row) {
    [atpl_69Row] = await db.insert(attributeTemplateTable).values({ label: "Duração do ciclo de vida", unit: "year" }).returning();
  }
  const atpl_69 = atpl_69Row.id;

  await db.insert(attributeTable).values([
    { species: species_minhoca.id, attribute: atpl_65, value: "5-10", sourceId: src_47 },
    { species: species_minhoca.id, attribute: atpl_66, value: "approximately 200", sourceId: src_47 },
    { species: species_minhoca.id, attribute: atpl_67, value: "Planalto das Guianas (Neotrópico), com distribuição circuntropical atual", sourceId: src_47 },
    { species: species_minhoca.id, attribute: atpl_68, value: "partenogenética (raramente sexuada)", sourceId: src_47 },
    { species: species_minhoca.id, attribute: atpl_69, value: "1", sourceId: src_47 },
  ]);

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "minhoca", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_minhoca.id, popularNameId: pn.id });
  }

  function buildSourceIds_minhoca() {
    return { "wikipedia-en-pontoscolex": src_47, "wikipedia-pt-glossoscolecidae": src_48, "gbif-species-search": src_49, "wikimedia-commons-category-pontoscolex-corethrurus": src_50, "wikimedia-commons-category-pontoscolex-genus": src_51, "wikimedia-commons-file-pontoscolex-corethrurus": src_52, "wikimedia-commons-file-glossoscolex-sp": src_53, "wikimedia-commons-file-eb1911-diagram": src_54 };
  }
  const content_minhoca = buildArticleContent_minhoca(buildSourceIds_minhoca());
  const [article_minhoca] = await db
    .insert(articleTable)
    .values({ species: species_minhoca.id, content: content_minhoca })
    .returning();

  await db.insert(imageTable).values([
    { url: "https://upload.wikimedia.org/wikipedia/commons/a/a1/Pontoscolex_corethrurus.jpg", alt: "Espécime de Pontoscolex corethrurus fotografado em campo", article: article_minhoca.id, type: "online", source: "upload.wikimedia.org", credit: "Emerson Bezerra (CC BY-SA 3.0)" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Glossoscolex_sp.jpg", alt: "Espécime de Glossoscolex sp., gênero relacionado dentro da família Glossoscolecidae", article: article_minhoca.id, type: "online", source: "upload.wikimedia.org", credit: "Sidnei Dantas (CC BY-SA 4.0)" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/6/6a/EB1911_Chaetopoda_Fig._10.%E2%80%94Diagrams_of_various_Earthworms%2C_to_illustrate_external_characters.jpg", alt: "Ilustração histórica (1911) das características externas de diferentes gêneros de minhocas", article: article_minhoca.id, type: "online", source: "upload.wikimedia.org", credit: "Encyclopædia Britannica, 1911 (domínio público)" },
  ]);

  await db.insert(articleSourcesPivotTable).values([
    { articleId: article_minhoca.id, sourceId: src_54 },
    { articleId: article_minhoca.id, sourceId: src_53 },
    { articleId: article_minhoca.id, sourceId: src_48 },
    { articleId: article_minhoca.id, sourceId: src_47 },
    { articleId: article_minhoca.id, sourceId: src_52 },
  ]);

  const [specimen_minhoca] = await db
    .insert(specimenTable)
    .values({ code: "CPINANEL02", lot: 2, shelf: 1, createdBy: user.id, speciesId: species_minhoca.id })
    .returning();
  // ---- cigarra (Quesada gigas) ----

  const [tax_58Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Filo", labelValue: "arthropoda", parent: tax_1, createdBy: user.id })
    .returning();
  const tax_58 = tax_58Row.id;

  const [tax_59Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Classe", labelValue: "insecta", parent: tax_58, createdBy: user.id })
    .returning();
  const tax_59 = tax_59Row.id;

  const [tax_60Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Ordem", labelValue: "hemiptera", parent: tax_59, createdBy: user.id })
    .returning();
  const tax_60 = tax_60Row.id;

  const [tax_61Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Subordem", labelValue: "auchenorrhyncha", parent: tax_60, createdBy: user.id })
    .returning();
  const tax_61 = tax_61Row.id;

  const [tax_62Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Família", labelValue: "cicadidae", parent: tax_61, createdBy: user.id })
    .returning();
  const tax_62 = tax_62Row.id;

  const [tax_63Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Tribo", labelValue: "fidicinini", parent: tax_62, createdBy: user.id })
    .returning();
  const tax_63 = tax_63Row.id;

  const [tax_64Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Gênero", labelValue: "quesada", parent: tax_63, createdBy: user.id })
    .returning();
  const tax_64 = tax_64Row.id;

  const [tax_65Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Espécie", labelValue: "quesada gigas", parent: tax_64, createdBy: user.id })
    .returning();
  const tax_65 = tax_65Row.id;

  const [species_cigarra] = await db
    .insert(speciesTable)
    .values({ speciesRoot: tax_65, createdBy: user.id })
    .returning();

  let src_55Row = (await db.insert(sourceTable).values({ url: "https://en.wikipedia.org/wiki/Giant_cicada" }).onConflictDoNothing().returning())[0];
  if (!src_55Row) {
    [src_55Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://en.wikipedia.org/wiki/Giant_cicada"));
  }
  const src_55 = src_55Row.id;

  let src_56Row = (await db.insert(sourceTable).values({ url: "https://www.cicadamania.com/cicadas/category/genera/quesada/" }).onConflictDoNothing().returning())[0];
  if (!src_56Row) {
    [src_56Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://www.cicadamania.com/cicadas/category/genera/quesada/"));
  }
  const src_56 = src_56Row.id;

  let src_57Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:Cigarra_01-_Cicada_-_Quesada_gigas_(1192271410).jpg" }).onConflictDoNothing().returning())[0];
  if (!src_57Row) {
    [src_57Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:Cigarra_01-_Cicada_-_Quesada_gigas_(1192271410).jpg"));
  }
  const src_57 = src_57Row.id;

  let src_58Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:Tympanoterpes_gigas.jpg" }).onConflictDoNothing().returning())[0];
  if (!src_58Row) {
    [src_58Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:Tympanoterpes_gigas.jpg"));
  }
  const src_58 = src_58Row.id;

  let src_59Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:Quesada_gigas_-_Bruno_R._M%C3%B6ller_-_709371382.jpeg" }).onConflictDoNothing().returning())[0];
  if (!src_59Row) {
    [src_59Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:Quesada_gigas_-_Bruno_R._M%C3%B6ller_-_709371382.jpeg"));
  }
  const src_59 = src_59Row.id;

  let src_60Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:Quesada_gigas_234725370.jpg" }).onConflictDoNothing().returning())[0];
  if (!src_60Row) {
    [src_60Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:Quesada_gigas_234725370.jpg"));
  }
  const src_60 = src_60Row.id;

  let [atpl_70Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Tamanho relativo"), eq(attributeTemplateTable.unit, "")));
  if (!atpl_70Row) {
    [atpl_70Row] = await db.insert(attributeTemplateTable).values({ label: "Tamanho relativo", unit: "" }).returning();
  }
  const atpl_70 = atpl_70Row.id;

  let [atpl_71Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Padrão de coloração"), eq(attributeTemplateTable.unit, "")));
  if (!atpl_71Row) {
    [atpl_71Row] = await db.insert(attributeTemplateTable).values({ label: "Padrão de coloração", unit: "" }).returning();
  }
  const atpl_71 = atpl_71Row.id;

  let [atpl_72Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Canto"), eq(attributeTemplateTable.unit, "")));
  if (!atpl_72Row) {
    [atpl_72Row] = await db.insert(attributeTemplateTable).values({ label: "Canto", unit: "" }).returning();
  }
  const atpl_72 = atpl_72Row.id;

  let [atpl_73Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Distribuição geográfica"), eq(attributeTemplateTable.unit, "")));
  if (!atpl_73Row) {
    [atpl_73Row] = await db.insert(attributeTemplateTable).values({ label: "Distribuição geográfica", unit: "" }).returning();
  }
  const atpl_73 = atpl_73Row.id;

  let [atpl_74Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Duração da fase ninfal subterrânea"), eq(attributeTemplateTable.unit, "year")));
  if (!atpl_74Row) {
    [atpl_74Row] = await db.insert(attributeTemplateTable).values({ label: "Duração da fase ninfal subterrânea", unit: "year" }).returning();
  }
  const atpl_74 = atpl_74Row.id;

  let [atpl_75Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Hábito alimentar das ninfas"), eq(attributeTemplateTable.unit, "")));
  if (!atpl_75Row) {
    [atpl_75Row] = await db.insert(attributeTemplateTable).values({ label: "Hábito alimentar das ninfas", unit: "" }).returning();
  }
  const atpl_75 = atpl_75Row.id;

  await db.insert(attributeTable).values([
    { species: species_cigarra.id, attribute: atpl_70, value: "maior espécie de cigarra do Hemisfério Ocidental", sourceId: src_55 },
    { species: species_cigarra.id, attribute: atpl_71, value: "preto, verde e marrom, com colar pronotal verde-amarronzado e olhos castanho a oliva", sourceId: src_55 },
    { species: species_cigarra.id, attribute: atpl_72, value: "assobio agudo e prolongado, semelhante ao apito de uma locomotiva, durando quase meio minuto", sourceId: src_56 },
    { species: species_cigarra.id, attribute: atpl_73, value: "do centro do Texas (EUA) até o norte da Argentina, incluindo o Brasil", sourceId: src_55 },
    { species: species_cigarra.id, attribute: atpl_74, value: "4", sourceId: src_55 },
    { species: species_cigarra.id, attribute: atpl_75, value: "sucção de seiva (xilema) das raízes de árvores no solo", sourceId: src_56 },
  ]);

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "cigarra", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_cigarra.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "cigarra-gigante", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_cigarra.id, popularNameId: pn.id });
  }

  function buildSourceIds_cigarra() {
    return { "wikipedia-giant-cicada": src_55, "cicadamania-quesada": src_56, "commons-pestana": src_57, "commons-distant-purkiss": src_58, "commons-moller": src_59, "commons-michelotto": src_60 };
  }
  const content_cigarra = buildArticleContent_cigarra(buildSourceIds_cigarra());
  const [article_cigarra] = await db
    .insert(articleTable)
    .values({ species: species_cigarra.id, content: content_cigarra })
    .returning();

  await db.insert(imageTable).values([
    { url: "https://upload.wikimedia.org/wikipedia/commons/0/00/Cigarra_01-_Cicada_-_Quesada_gigas_%281192271410%29.jpg", alt: "Cigarra Quesada gigas pousada sobre uma superfície clara", article: article_cigarra.id, type: "online", source: "upload.wikimedia.org", credit: "Ferran Pestaña (CC BY-SA 2.0)" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/1/14/Tympanoterpes_gigas.jpg", alt: "Ilustração científica histórica de Quesada gigas (sinônimo Tympanoterpes gigas)", article: article_cigarra.id, type: "online", source: "upload.wikimedia.org", credit: "W. L. Distant & W. Purkiss (domínio público)" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/b/b7/Quesada_gigas_-_Bruno_R._M%C3%B6ller_-_709371382.jpeg", alt: "Quesada gigas fotografada em Alta Floresta, Brasil", article: article_cigarra.id, type: "online", source: "upload.wikimedia.org", credit: "Bruno R. Möller (CC BY 4.0)" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/e/e8/Quesada_gigas_234725370.jpg", alt: "Quesada gigas fotografada no Brasil, mostrando as asas transparentes", article: article_cigarra.id, type: "online", source: "upload.wikimedia.org", credit: "Alexandre S. Michelotto (CC BY-SA 4.0)" },
  ]);

  await db.insert(articleSourcesPivotTable).values([
    { articleId: article_cigarra.id, sourceId: src_55 },
    { articleId: article_cigarra.id, sourceId: src_56 },
  ]);

  const [specimen_cigarra] = await db
    .insert(specimenTable)
    .values({ code: "CPINHEXA01", lot: 1, shelf: 2, createdBy: user.id, speciesId: species_cigarra.id })
    .returning();
  // ---- besouro-escaravelho (Scarabaeidae) ----

  const [tax_66Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Ordem", labelValue: "coleoptera", parent: tax_59, createdBy: user.id })
    .returning();
  const tax_66 = tax_66Row.id;

  const [tax_67Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Família", labelValue: "scarabaeidae", parent: tax_66, createdBy: user.id })
    .returning();
  const tax_67 = tax_67Row.id;

  const [species_besouro_escaravelho] = await db
    .insert(speciesTable)
    .values({ speciesRoot: tax_67, createdBy: user.id })
    .returning();

  let src_61Row = (await db.insert(sourceTable).values({ url: "https://en.wikipedia.org/wiki/Scarabaeidae" }).onConflictDoNothing().returning())[0];
  if (!src_61Row) {
    [src_61Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://en.wikipedia.org/wiki/Scarabaeidae"));
  }
  const src_61 = src_61Row.id;

  let src_62Row = (await db.insert(sourceTable).values({ url: "https://pt.wikipedia.org/wiki/Scarabaeidae" }).onConflictDoNothing().returning())[0];
  if (!src_62Row) {
    [src_62Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://pt.wikipedia.org/wiki/Scarabaeidae"));
  }
  const src_62 = src_62Row.id;

  let src_63Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:Scarab_Beetle_(8094581738).jpg" }).onConflictDoNothing().returning())[0];
  if (!src_63Row) {
    [src_63Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:Scarab_Beetle_(8094581738).jpg"));
  }
  const src_63 = src_63Row.id;

  let src_64Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:Cockchafer_beetle.jpg" }).onConflictDoNothing().returning())[0];
  if (!src_64Row) {
    [src_64Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:Cockchafer_beetle.jpg"));
  }
  const src_64 = src_64Row.id;

  let src_65Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:Green_june_beetle.jpg" }).onConflictDoNothing().returning())[0];
  if (!src_65Row) {
    [src_65Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:Green_june_beetle.jpg"));
  }
  const src_65 = src_65Row.id;

  let src_66Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:Hard_work,_Kocaçay_Deltası,_Bursa.jpg" }).onConflictDoNothing().returning())[0];
  if (!src_66Row) {
    [src_66Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:Hard_work,_Kocaçay_Deltası,_Bursa.jpg"));
  }
  const src_66 = src_66Row.id;

  let [atpl_76Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Comprimento corporal"), eq(attributeTemplateTable.unit, "millimeter")));
  if (!atpl_76Row) {
    [atpl_76Row] = await db.insert(attributeTemplateTable).values({ label: "Comprimento corporal", unit: "millimeter" }).returning();
  }
  const atpl_76 = atpl_76Row.id;

  let [atpl_77Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Riqueza da família"), eq(attributeTemplateTable.unit, "species")));
  if (!atpl_77Row) {
    [atpl_77Row] = await db.insert(attributeTemplateTable).values({ label: "Riqueza da família", unit: "species" }).returning();
  }
  const atpl_77 = atpl_77Row.id;

  let [atpl_78Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Tipo de antena"), eq(attributeTemplateTable.unit, "type")));
  if (!atpl_78Row) {
    [atpl_78Row] = await db.insert(attributeTemplateTable).values({ label: "Tipo de antena", unit: "type" }).returning();
  }
  const atpl_78 = atpl_78Row.id;

  let [atpl_79Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Hábito alimentar"), eq(attributeTemplateTable.unit, "diet")));
  if (!atpl_79Row) {
    [atpl_79Row] = await db.insert(attributeTemplateTable).values({ label: "Hábito alimentar", unit: "diet" }).returning();
  }
  const atpl_79 = atpl_79Row.id;

  let [atpl_80Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Coloração"), eq(attributeTemplateTable.unit, "color")));
  if (!atpl_80Row) {
    [atpl_80Row] = await db.insert(attributeTemplateTable).values({ label: "Coloração", unit: "color" }).returning();
  }
  const atpl_80 = atpl_80Row.id;

  let [atpl_81Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Comportamento reprodutivo"), eq(attributeTemplateTable.unit, "behavior")));
  if (!atpl_81Row) {
    [atpl_81Row] = await db.insert(attributeTemplateTable).values({ label: "Comportamento reprodutivo", unit: "behavior" }).returning();
  }
  const atpl_81 = atpl_81Row.id;

  await db.insert(attributeTable).values([
    { species: species_besouro_escaravelho.id, attribute: atpl_76, value: "1.5 to 160", sourceId: src_61 },
    { species: species_besouro_escaravelho.id, attribute: atpl_77, value: "about 27800", sourceId: src_62 },
    { species: species_besouro_escaravelho.id, attribute: atpl_78, value: "lamellate", sourceId: src_61 },
    { species: species_besouro_escaravelho.id, attribute: atpl_79, value: "coprophagous, saprophagous or phytophagous", sourceId: src_62 },
    { species: species_besouro_escaravelho.id, attribute: atpl_80, value: "brown or black, metallic green in diurnal species", sourceId: src_65 },
    { species: species_besouro_escaravelho.id, attribute: atpl_81, value: "male carries female while rolling a dung ball", sourceId: src_66 },
  ]);

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "besouro escaravelho", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_besouro_escaravelho.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "escaravelho", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_besouro_escaravelho.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "rola-bosta", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_besouro_escaravelho.id, popularNameId: pn.id });
  }

  function buildSourceIds_besouro_escaravelho() {
    return { "wikipedia-en-scarabaeidae": src_61, "wikipedia-pt-scarabaeidae": src_62, "commons-scarab-beetle-8094581738": src_63, "commons-cockchafer-beetle": src_64, "commons-green-june-beetle": src_65, "commons-hard-work-kocacay": src_66 };
  }
  const content_besouro_escaravelho = buildArticleContent_besouro_escaravelho(buildSourceIds_besouro_escaravelho());
  const [article_besouro_escaravelho] = await db
    .insert(articleTable)
    .values({ species: species_besouro_escaravelho.id, content: content_besouro_escaravelho })
    .returning();

  await db.insert(imageTable).values([
    { url: "https://upload.wikimedia.org/wikipedia/commons/e/ed/Scarab_Beetle_%288094581738%29.jpg", alt: "Besouro escaravelho preto não identificado, família Scarabaeidae, fotografado no Egito", article: article_besouro_escaravelho.id, type: "online", source: "upload.wikimedia.org", credit: "Ben Sale from Stevenage, UK — CC BY 2.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/5/56/Cockchafer_beetle.jpg", alt: "Besouro escaravelho (Scarabaeidae) em foto macro mostrando antenas lameladas", article: article_besouro_escaravelho.id, type: "online", source: "upload.wikimedia.org", credit: "Erfawwn — CC BY 4.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/d/d0/Green_june_beetle.jpg", alt: "Besouro escaravelho verde metálico (Scarabaeidae) em foto macro", article: article_besouro_escaravelho.id, type: "online", source: "upload.wikimedia.org", credit: "Roger Heslop (Rh animal photography) — CC BY 4.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/d/da/Hard_work%2C_Koca%C3%A7ay_Deltas%C4%B1%2C_Bursa.jpg", alt: "Escaravelho macho carregando fêmea sobre uma bola de esterco rolada", article: article_besouro_escaravelho.id, type: "online", source: "upload.wikimedia.org", credit: "Kurabiyecnv- — CC BY-SA 4.0" },
  ]);

  await db.insert(articleSourcesPivotTable).values([
    { articleId: article_besouro_escaravelho.id, sourceId: src_65 },
    { articleId: article_besouro_escaravelho.id, sourceId: src_62 },
    { articleId: article_besouro_escaravelho.id, sourceId: src_64 },
    { articleId: article_besouro_escaravelho.id, sourceId: src_66 },
    { articleId: article_besouro_escaravelho.id, sourceId: src_61 },
  ]);

  const [specimen_besouro_escaravelho] = await db
    .insert(specimenTable)
    .values({ code: "CPINHEXA02", lot: 2, shelf: 2, createdBy: user.id, speciesId: species_besouro_escaravelho.id })
    .returning();
  // ---- abelha (Apis mellifera) ----

  const [tax_68Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Ordem", labelValue: "hymenoptera", parent: tax_59, createdBy: user.id })
    .returning();
  const tax_68 = tax_68Row.id;

  const [tax_69Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Família", labelValue: "apidae", parent: tax_68, createdBy: user.id })
    .returning();
  const tax_69 = tax_69Row.id;

  const [tax_70Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Gênero", labelValue: "apis", parent: tax_69, createdBy: user.id })
    .returning();
  const tax_70 = tax_70Row.id;

  const [tax_71Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Espécie", labelValue: "apis mellifera", parent: tax_70, createdBy: user.id })
    .returning();
  const tax_71 = tax_71Row.id;

  const [species_abelha] = await db
    .insert(speciesTable)
    .values({ speciesRoot: tax_71, createdBy: user.id })
    .returning();

  let src_67Row = (await db.insert(sourceTable).values({ url: "https://en.wikipedia.org/wiki/Western_honey_bee" }).onConflictDoNothing().returning())[0];
  if (!src_67Row) {
    [src_67Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://en.wikipedia.org/wiki/Western_honey_bee"));
  }
  const src_67 = src_67Row.id;

  let src_68Row = (await db.insert(sourceTable).values({ url: "https://en.wikipedia.org/wiki/Africanized_bee" }).onConflictDoNothing().returning())[0];
  if (!src_68Row) {
    [src_68Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://en.wikipedia.org/wiki/Africanized_bee"));
  }
  const src_68 = src_68Row.id;

  let src_69Row = (await db.insert(sourceTable).values({ url: "https://dimensions.com/element/western-honey-bee-apis-mellifera" }).onConflictDoNothing().returning())[0];
  if (!src_69Row) {
    [src_69Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://dimensions.com/element/western-honey-bee-apis-mellifera"));
  }
  const src_69 = src_69Row.id;

  let [atpl_82Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Comprimento (operária)"), eq(attributeTemplateTable.unit, "mm")));
  if (!atpl_82Row) {
    [atpl_82Row] = await db.insert(attributeTemplateTable).values({ label: "Comprimento (operária)", unit: "mm" }).returning();
  }
  const atpl_82 = atpl_82Row.id;

  let [atpl_83Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Comprimento (rainha)"), eq(attributeTemplateTable.unit, "mm")));
  if (!atpl_83Row) {
    [atpl_83Row] = await db.insert(attributeTemplateTable).values({ label: "Comprimento (rainha)", unit: "mm" }).returning();
  }
  const atpl_83 = atpl_83Row.id;

  let [atpl_84Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Expectativa de vida (rainha)"), eq(attributeTemplateTable.unit, "year")));
  if (!atpl_84Row) {
    [atpl_84Row] = await db.insert(attributeTemplateTable).values({ label: "Expectativa de vida (rainha)", unit: "year" }).returning();
  }
  const atpl_84 = atpl_84Row.id;

  let [atpl_85Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Expectativa de vida (operária)"), eq(attributeTemplateTable.unit, "week")));
  if (!atpl_85Row) {
    [atpl_85Row] = await db.insert(attributeTemplateTable).values({ label: "Expectativa de vida (operária)", unit: "week" }).returning();
  }
  const atpl_85 = atpl_85Row.id;

  let [atpl_86Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Subespécies reconhecidas"), eq(attributeTemplateTable.unit, "count")));
  if (!atpl_86Row) {
    [atpl_86Row] = await db.insert(attributeTemplateTable).values({ label: "Subespécies reconhecidas", unit: "count" }).returning();
  }
  const atpl_86 = atpl_86Row.id;

  await db.insert(attributeTable).values([
    { species: species_abelha.id, attribute: atpl_82, value: "10-15", sourceId: src_69 },
    { species: species_abelha.id, attribute: atpl_83, value: "18-20", sourceId: src_69 },
    { species: species_abelha.id, attribute: atpl_84, value: "3-5", sourceId: src_67 },
    { species: species_abelha.id, attribute: atpl_85, value: "poucas semanas no verão, meses no inverno", sourceId: src_67 },
    { species: species_abelha.id, attribute: atpl_55, value: "deficiente em dados (data deficient)", sourceId: src_67 },
    { species: species_abelha.id, attribute: atpl_86, value: "31", sourceId: src_67 },
  ]);

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Abelha europeia", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_abelha.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Abelha-europeia", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_abelha.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Abelha italiana", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_abelha.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Abelha africanizada", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_abelha.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Western honey bee", origin: "en" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_abelha.id, popularNameId: pn.id });
  }

  function buildSourceIds_abelha() {
    return { "wiki-western-honey-bee": src_67, "wiki-africanized-bee": src_68, "dimensions-com-apis-mellifera": src_69 };
  }
  const content_abelha = buildArticleContent_abelha(buildSourceIds_abelha());
  const [article_abelha] = await db
    .insert(articleTable)
    .values({ species: species_abelha.id, content: content_abelha })
    .returning();

  await db.insert(imageTable).values([
    { url: "https://upload.wikimedia.org/wikipedia/commons/a/ac/Apis_mellifera_2_Luc_Viatour.JPG", alt: "Abelha (Apis mellifera) pousada em flores de lavanda em Hamois, Bélgica", article: article_abelha.id, type: "online", source: "upload.wikimedia.org", credit: "Luc Viatour / https://Lucnix.be, CC BY-SA 3.0, via Wikimedia Commons" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/a/a1/Apis_mellifera_carnica_worker_hive_entrance_3.jpg", alt: "Abelha-carniolana (Apis mellifera carnica), operária na entrada da colmeia, Munique, Alemanha", article: article_abelha.id, type: "online", source: "upload.wikimedia.org", credit: "Richard Bartz, CC BY-SA 2.5, via Wikimedia Commons" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/d/d9/Abeille_recouverte_de_pollen.jpg", alt: "Abelha (Apis mellifera) coberta de pólen, Jendouba, Tunísia", article: article_abelha.id, type: "online", source: "upload.wikimedia.org", credit: "Skander Zarrad, CC BY-SA 4.0, via Wikimedia Commons" },
  ]);

  await db.insert(articleSourcesPivotTable).values([
    { articleId: article_abelha.id, sourceId: src_67 },
    { articleId: article_abelha.id, sourceId: src_68 },
    { articleId: article_abelha.id, sourceId: src_69 },
  ]);

  const [specimen_abelha] = await db
    .insert(specimenTable)
    .values({ code: "CPINHEXA03", lot: 3, shelf: 2, createdBy: user.id, speciesId: species_abelha.id })
    .returning();
  // ---- libelula (Erythemis vesiculosa) ----

  const [tax_72Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Ordem", labelValue: "odonata", parent: tax_59, createdBy: user.id })
    .returning();
  const tax_72 = tax_72Row.id;

  const [tax_73Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Família", labelValue: "libellulidae", parent: tax_72, createdBy: user.id })
    .returning();
  const tax_73 = tax_73Row.id;

  const [tax_74Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Gênero", labelValue: "erythemis", parent: tax_73, createdBy: user.id })
    .returning();
  const tax_74 = tax_74Row.id;

  const [tax_75Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Espécie", labelValue: "erythemis vesiculosa", parent: tax_74, createdBy: user.id })
    .returning();
  const tax_75 = tax_75Row.id;

  const [species_libelula] = await db
    .insert(speciesTable)
    .values({ speciesRoot: tax_75, createdBy: user.id })
    .returning();

  let src_70Row = (await db.insert(sourceTable).values({ url: "https://pt.wikipedia.org/wiki/Erythemis_vesiculosa" }).onConflictDoNothing().returning())[0];
  if (!src_70Row) {
    [src_70Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://pt.wikipedia.org/wiki/Erythemis_vesiculosa"));
  }
  const src_70 = src_70Row.id;

  let src_71Row = (await db.insert(sourceTable).values({ url: "https://en.wikipedia.org/wiki/Erythemis_vesiculosa" }).onConflictDoNothing().returning())[0];
  if (!src_71Row) {
    [src_71Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://en.wikipedia.org/wiki/Erythemis_vesiculosa"));
  }
  const src_71 = src_71Row.id;

  let src_72Row = (await db.insert(sourceTable).values({ url: "https://species.wikimedia.org/wiki/Erythemis_vesiculosa" }).onConflictDoNothing().returning())[0];
  if (!src_72Row) {
    [src_72Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://species.wikimedia.org/wiki/Erythemis_vesiculosa"));
  }
  const src_72 = src_72Row.id;

  let src_73Row = (await db.insert(sourceTable).values({ url: "https://www.jungledragon.com/specie/7469/great_pondhawk.html" }).onConflictDoNothing().returning())[0];
  if (!src_73Row) {
    [src_73Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://www.jungledragon.com/specie/7469/great_pondhawk.html"));
  }
  const src_73 = src_73Row.id;

  let src_74Row = (await db.insert(sourceTable).values({ url: "https://www.scielo.br/j/rbzool/a/vyD7rjFk8mt69cVpyZcPS6P/?lang=pt" }).onConflictDoNothing().returning())[0];
  if (!src_74Row) {
    [src_74Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://www.scielo.br/j/rbzool/a/vyD7rjFk8mt69cVpyZcPS6P/?lang=pt"));
  }
  const src_74 = src_74Row.id;

  let [atpl_87Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Envergadura alar"), eq(attributeTemplateTable.unit, "millimeter")));
  if (!atpl_87Row) {
    [atpl_87Row] = await db.insert(attributeTemplateTable).values({ label: "Envergadura alar", unit: "millimeter" }).returning();
  }
  const atpl_87 = atpl_87Row.id;

  let [atpl_88Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Comprimento do abdômen"), eq(attributeTemplateTable.unit, "millimeter")));
  if (!atpl_88Row) {
    [atpl_88Row] = await db.insert(attributeTemplateTable).values({ label: "Comprimento do abdômen", unit: "millimeter" }).returning();
  }
  const atpl_88 = atpl_88Row.id;

  let [atpl_89Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Comprimento da ala posterior"), eq(attributeTemplateTable.unit, "millimeter")));
  if (!atpl_89Row) {
    [atpl_89Row] = await db.insert(attributeTemplateTable).values({ label: "Comprimento da ala posterior", unit: "millimeter" }).returning();
  }
  const atpl_89 = atpl_89Row.id;

  await db.insert(attributeTable).values([
    { species: species_libelula.id, attribute: atpl_87, value: "56-60", sourceId: src_70 },
    { species: species_libelula.id, attribute: atpl_88, value: "40-43", sourceId: src_70 },
    { species: species_libelula.id, attribute: atpl_89, value: "38-40", sourceId: src_70 },
  ]);

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "libélula", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_libelula.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "great pondhawk", origin: "en" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_libelula.id, popularNameId: pn.id });
  }

  function buildSourceIds_libelula() {
    return { "wikipedia-pt": src_70, "wikipedia-en": src_71, "wikispecies": src_72, "jungledragon": src_73, "scielo-rbzool": src_74 };
  }
  const content_libelula = buildArticleContent_libelula(buildSourceIds_libelula());
  const [article_libelula] = await db
    .insert(articleTable)
    .values({ species: species_libelula.id, content: content_libelula })
    .returning();

  await db.insert(imageTable).values([
    { url: "https://upload.wikimedia.org/wikipedia/commons/1/1f/Great_pondhawk_%28Erythemis_vesiculosa%29_male_Trinidad.JPG", alt: "Macho de Erythemis vesiculosa fotografado no pântano de Caroni, Trinidad", article: article_libelula.id, type: "online", source: "upload.wikimedia.org", credit: "Foto: Charles J. Sharp, CC BY-SA 4.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/3/30/Erythemis_vesiculosa_Great_Pondhawk.jpg", alt: "Erythemis vesiculosa pousada, vista lateral mostrando tórax e abdômen verdes", article: article_libelula.id, type: "online", source: "upload.wikimedia.org", credit: "Foto: Eric Haley, CC BY 2.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/5/53/Great_Pondhawk_-_Erythemis_vesiculosa%2C_Dagny_Johnson_State_Park%2C_Key_Largo%2C_Florida_-_23571856541.jpg", alt: "Erythemis vesiculosa pousada sobre vegetação no Dagny Johnson State Park, Key Largo, Florida", article: article_libelula.id, type: "online", source: "upload.wikimedia.org", credit: "Foto: Judy Gallagher, CC BY 2.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/8/8c/Great_pondhawk_%2819158140846%29.jpg", alt: "Erythemis vesiculosa em repouso sobre um ramo, mostrando as asas transparentes e o abdômen listrado", article: article_libelula.id, type: "online", source: "upload.wikimedia.org", credit: "Foto: Melissa McMasters, CC BY 2.0" },
  ]);

  await db.insert(articleSourcesPivotTable).values([
    { articleId: article_libelula.id, sourceId: src_71 },
    { articleId: article_libelula.id, sourceId: src_70 },
    { articleId: article_libelula.id, sourceId: src_74 },
    { articleId: article_libelula.id, sourceId: src_73 },
    { articleId: article_libelula.id, sourceId: src_72 },
  ]);

  const [specimen_libelula] = await db
    .insert(specimenTable)
    .values({ code: "CPINHEXA04", lot: 4, shelf: 2, createdBy: user.id, speciesId: species_libelula.id })
    .returning();
  // ---- grilo (Gryllus assimilis) ----

  const [tax_76Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Ordem", labelValue: "orthoptera", parent: tax_59, createdBy: user.id })
    .returning();
  const tax_76 = tax_76Row.id;

  const [tax_77Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Família", labelValue: "gryllidae", parent: tax_76, createdBy: user.id })
    .returning();
  const tax_77 = tax_77Row.id;

  const [tax_78Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Gênero", labelValue: "gryllus", parent: tax_77, createdBy: user.id })
    .returning();
  const tax_78 = tax_78Row.id;

  const [tax_79Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Espécie", labelValue: "assimilis", parent: tax_78, createdBy: user.id })
    .returning();
  const tax_79 = tax_79Row.id;

  const [species_grilo] = await db
    .insert(speciesTable)
    .values({ speciesRoot: tax_79, createdBy: user.id })
    .returning();

  let src_75Row = (await db.insert(sourceTable).values({ url: "https://en.wikipedia.org/wiki/Gryllus_assimilis" }).onConflictDoNothing().returning())[0];
  if (!src_75Row) {
    [src_75Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://en.wikipedia.org/wiki/Gryllus_assimilis"));
  }
  const src_75 = src_75Row.id;

  let src_76Row = (await db.insert(sourceTable).values({ url: "https://en.wikipedia.org/wiki/Gryllus" }).onConflictDoNothing().returning())[0];
  if (!src_76Row) {
    [src_76Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://en.wikipedia.org/wiki/Gryllus"));
  }
  const src_76 = src_76Row.id;

  let src_77Row = (await db.insert(sourceTable).values({ url: "https://ask.ifas.ufl.edu/publication/IN226" }).onConflictDoNothing().returning())[0];
  if (!src_77Row) {
    [src_77Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://ask.ifas.ufl.edu/publication/IN226"));
  }
  const src_77 = src_77Row.id;

  let src_78Row = (await db.insert(sourceTable).values({ url: "https://bioone.org/journals/Annals-of-the-Entomological-Society-of-America/volume-102/issue-3/008.102.0304/The-Field-Cricket-Gryllus-assimilis-and-Two-New-Sister-Species/10.1603/008.102.0304.full" }).onConflictDoNothing().returning())[0];
  if (!src_78Row) {
    [src_78Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://bioone.org/journals/Annals-of-the-Entomological-Society-of-America/volume-102/issue-3/008.102.0304/The-Field-Cricket-Gryllus-assimilis-and-Two-New-Sister-Species/10.1603/008.102.0304.full"));
  }
  const src_78 = src_78Row.id;

  let [atpl_90Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Comprimento máximo do corpo"), eq(attributeTemplateTable.unit, "millimeter")));
  if (!atpl_90Row) {
    [atpl_90Row] = await db.insert(attributeTemplateTable).values({ label: "Comprimento máximo do corpo", unit: "millimeter" }).returning();
  }
  const atpl_90 = atpl_90Row.id;

  let [atpl_91Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Número de ovos por postura"), eq(attributeTemplateTable.unit, "egg")));
  if (!atpl_91Row) {
    [atpl_91Row] = await db.insert(attributeTemplateTable).values({ label: "Número de ovos por postura", unit: "egg" }).returning();
  }
  const atpl_91 = atpl_91Row.id;

  let [atpl_92Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Período de incubação dos ovos"), eq(attributeTemplateTable.unit, "day")));
  if (!atpl_92Row) {
    [atpl_92Row] = await db.insert(attributeTemplateTable).values({ label: "Período de incubação dos ovos", unit: "day" }).returning();
  }
  const atpl_92 = atpl_92Row.id;

  let [atpl_93Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Duração do desenvolvimento ninfal"), eq(attributeTemplateTable.unit, "week")));
  if (!atpl_93Row) {
    [atpl_93Row] = await db.insert(attributeTemplateTable).values({ label: "Duração do desenvolvimento ninfal", unit: "week" }).returning();
  }
  const atpl_93 = atpl_93Row.id;

  let [atpl_94Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Pulsos por chilrido do canto"), eq(attributeTemplateTable.unit, "pulse")));
  if (!atpl_94Row) {
    [atpl_94Row] = await db.insert(attributeTemplateTable).values({ label: "Pulsos por chilrido do canto", unit: "pulse" }).returning();
  }
  const atpl_94 = atpl_94Row.id;

  let [atpl_95Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Frequência do canto de chamado"), eq(attributeTemplateTable.unit, "chirp per second")));
  if (!atpl_95Row) {
    [atpl_95Row] = await db.insert(attributeTemplateTable).values({ label: "Frequência do canto de chamado", unit: "chirp per second" }).returning();
  }
  const atpl_95 = atpl_95Row.id;

  await db.insert(attributeTable).values([
    { species: species_grilo.id, attribute: atpl_90, value: "31", sourceId: src_76 },
    { species: species_grilo.id, attribute: atpl_91, value: "400", sourceId: src_75 },
    { species: species_grilo.id, attribute: atpl_92, value: "11", sourceId: src_75 },
    { species: species_grilo.id, attribute: atpl_93, value: "6 a 7", sourceId: src_75 },
    { species: species_grilo.id, attribute: atpl_94, value: "7 ou mais", sourceId: src_77 },
    { species: species_grilo.id, attribute: atpl_95, value: "1", sourceId: src_77 },
  ]);

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "grilo", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_grilo.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "grilo-cantor", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_grilo.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "grilo-caseiro", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_grilo.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "grilo-comum", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_grilo.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "grilo-dos-canteiros", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_grilo.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Jamaican field cricket", origin: "en" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_grilo.id, popularNameId: pn.id });
  }

  function buildSourceIds_grilo() {
    return { "wikipedia-gryllus-assimilis": src_75, "wikipedia-gryllus-genus": src_76, "ifas-jamaican-field-cricket": src_77, "bioone-sister-species": src_78 };
  }
  const content_grilo = buildArticleContent_grilo(buildSourceIds_grilo());
  const [article_grilo] = await db
    .insert(articleTable)
    .values({ species: species_grilo.id, content: content_grilo })
    .returning();

  await db.insert(imageTable).values([
    { url: "https://upload.wikimedia.org/wikipedia/commons/f/f3/Gryllus_assimilis_male.jpg", alt: "Macho adulto de Gryllus assimilis fotografado em cativeiro", article: article_grilo.id, type: "online", source: "upload.wikimedia.org", credit: "Foto: Schönitzer, CC BY-SA 3.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/5/50/Gryllus_assimilis_female.jpg", alt: "Fêmea de Gryllus assimilis com ovipositor visível, criada em cativeiro", article: article_grilo.id, type: "online", source: "upload.wikimedia.org", credit: "Foto: Schönitzer, CC BY-SA 3.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/a/ad/Gryllus_assimilis_%281%29.jpg", alt: "Indivíduo de Gryllus assimilis em vista lateral sobre superfície clara", article: article_grilo.id, type: "online", source: "upload.wikimedia.org", credit: "Foto: Philipp Weigell, CC BY 3.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/b/b0/Steppengrille_Gryllus_assimilis.jpg", alt: "Grilo-estepe (Gryllus assimilis) fotografado em close-up", article: article_grilo.id, type: "online", source: "upload.wikimedia.org", credit: "Foto: Holger Krisp, CC BY 4.0" },
  ]);

  await db.insert(articleSourcesPivotTable).values([
    { articleId: article_grilo.id, sourceId: src_77 },
    { articleId: article_grilo.id, sourceId: src_76 },
    { articleId: article_grilo.id, sourceId: src_75 },
    { articleId: article_grilo.id, sourceId: src_78 },
  ]);

  const [specimen_grilo] = await db
    .insert(specimenTable)
    .values({ code: "CPINHEXA05", lot: 5, shelf: 2, createdBy: user.id, speciesId: species_grilo.id })
    .returning();
  // ---- larva-mosca-1 (Musca domestica) ----

  const [tax_80Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Ordem", labelValue: "diptera", parent: tax_59, createdBy: user.id })
    .returning();
  const tax_80 = tax_80Row.id;

  const [tax_81Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Família", labelValue: "muscidae", parent: tax_80, createdBy: user.id })
    .returning();
  const tax_81 = tax_81Row.id;

  const [tax_82Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Gênero", labelValue: "musca", parent: tax_81, createdBy: user.id })
    .returning();
  const tax_82 = tax_82Row.id;

  const [tax_83Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Espécie", labelValue: "musca domestica", parent: tax_82, createdBy: user.id })
    .returning();
  const tax_83 = tax_83Row.id;

  const [species_larva_mosca_1] = await db
    .insert(speciesTable)
    .values({ speciesRoot: tax_83, createdBy: user.id })
    .returning();

  let src_79Row = (await db.insert(sourceTable).values({ url: "https://en.wikipedia.org/wiki/Housefly" }).onConflictDoNothing().returning())[0];
  if (!src_79Row) {
    [src_79Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://en.wikipedia.org/wiki/Housefly"));
  }
  const src_79 = src_79Row.id;

  let src_80Row = (await db.insert(sourceTable).values({ url: "https://www.gbif.org/species/1524843" }).onConflictDoNothing().returning())[0];
  if (!src_80Row) {
    [src_80Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://www.gbif.org/species/1524843"));
  }
  const src_80 = src_80Row.id;

  let src_81Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/Category:Musca_domestica" }).onConflictDoNothing().returning())[0];
  if (!src_81Row) {
    [src_81Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/Category:Musca_domestica"));
  }
  const src_81 = src_81Row.id;

  let [atpl_96Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Comprimento do adulto"), eq(attributeTemplateTable.unit, "mm")));
  if (!atpl_96Row) {
    [atpl_96Row] = await db.insert(attributeTemplateTable).values({ label: "Comprimento do adulto", unit: "mm" }).returning();
  }
  const atpl_96 = atpl_96Row.id;

  let [atpl_97Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Envergadura das asas"), eq(attributeTemplateTable.unit, "mm")));
  if (!atpl_97Row) {
    [atpl_97Row] = await db.insert(attributeTemplateTable).values({ label: "Envergadura das asas", unit: "mm" }).returning();
  }
  const atpl_97 = atpl_97Row.id;

  let [atpl_98Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Comprimento da larva"), eq(attributeTemplateTable.unit, "mm")));
  if (!atpl_98Row) {
    [atpl_98Row] = await db.insert(attributeTemplateTable).values({ label: "Comprimento da larva", unit: "mm" }).returning();
  }
  const atpl_98 = atpl_98Row.id;

  let [atpl_99Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Duração do ciclo de vida completo"), eq(attributeTemplateTable.unit, "day")));
  if (!atpl_99Row) {
    [atpl_99Row] = await db.insert(attributeTemplateTable).values({ label: "Duração do ciclo de vida completo", unit: "day" }).returning();
  }
  const atpl_99 = atpl_99Row.id;

  let [atpl_100Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Classificação científica"), eq(attributeTemplateTable.unit, "none")));
  if (!atpl_100Row) {
    [atpl_100Row] = await db.insert(attributeTemplateTable).values({ label: "Classificação científica", unit: "none" }).returning();
  }
  const atpl_100 = atpl_100Row.id;

  let [atpl_101Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Distribuição"), eq(attributeTemplateTable.unit, "none")));
  if (!atpl_101Row) {
    [atpl_101Row] = await db.insert(attributeTemplateTable).values({ label: "Distribuição", unit: "none" }).returning();
  }
  const atpl_101 = atpl_101Row.id;

  await db.insert(attributeTable).values([
    { species: species_larva_mosca_1.id, attribute: atpl_96, value: "6 to 7", sourceId: src_79 },
    { species: species_larva_mosca_1.id, attribute: atpl_97, value: "13 to 15", sourceId: src_79 },
    { species: species_larva_mosca_1.id, attribute: atpl_98, value: "3 to 9", sourceId: src_79 },
    { species: species_larva_mosca_1.id, attribute: atpl_99, value: "7 to 10 (optimal) up to 60 (adverse)", sourceId: src_79 },
    { species: species_larva_mosca_1.id, attribute: atpl_100, value: "linnaeus 1758", sourceId: src_80 },
    { species: species_larva_mosca_1.id, attribute: atpl_101, value: "cosmopolitan worldwide", sourceId: src_79 },
  ]);

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Mosca doméstica", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_larva_mosca_1.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Mosca-de-estábulo-comum", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_larva_mosca_1.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Larva de mosca (nome do espécime)", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_larva_mosca_1.id, popularNameId: pn.id });
  }

  function buildSourceIds_larva_mosca_1() {
    return { "wikipedia-housefly-en": src_79, "gbif-musca-domestica": src_80, "commons-cat-musca-domestica": src_81 };
  }
  const content_larva_mosca_1 = buildArticleContent_larva_mosca_1(buildSourceIds_larva_mosca_1());
  const [article_larva_mosca_1] = await db
    .insert(articleTable)
    .values({ species: species_larva_mosca_1.id, content: content_larva_mosca_1 })
    .returning();

  await db.insert(imageTable).values([
    { url: "https://upload.wikimedia.org/wikipedia/commons/e/ef/Housefly_eggs%2C_larvae%2C_pupa_and_mature_fly.jpg", alt: "Ovos, larvas, pupa e adulto de Musca domestica", article: article_larva_mosca_1.id, type: "online", source: "upload.wikimedia.org", credit: "Clemson University - USDA Cooperative Extension Slide Series, Bugwood.org (CC BY 3.0)" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/a/a2/PSM_V76_D217_House_fly_larva_and_structure_details.png", alt: "Detalhes estruturais da larva da mosca doméstica", article: article_larva_mosca_1.id, type: "online", source: "upload.wikimedia.org", credit: "Popular Science Monthly, Volume 76 (1910) - domínio público" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/0/09/Life_Cycle_of_the_House_Fly%2C_extracted_from_Flies_of_public_health_importance_and_their_control_%281976%29.png", alt: "Ciclo de vida da mosca doméstica: ovo, larva, pupa e adulto", article: article_larva_mosca_1.id, type: "online", source: "upload.wikimedia.org", credit: "Pratt, Scott, Littig - CDC, Flies of public health importance and their control (1976) - domínio público" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/3/33/Detail_of_a_Housefly_%28Musca_domestica%29_at_8%C3%97_Magnification.jpg", alt: "Detalhe do abdômen e halteres de uma mosca doméstica adulta em ampliação de 8x", article: article_larva_mosca_1.id, type: "online", source: "upload.wikimedia.org", credit: "MicrocosmicWorld (CC BY-SA 4.0)" },
  ]);

  await db.insert(articleSourcesPivotTable).values([
    { articleId: article_larva_mosca_1.id, sourceId: src_79 },
    { articleId: article_larva_mosca_1.id, sourceId: src_81 },
    { articleId: article_larva_mosca_1.id, sourceId: src_80 },
  ]);

  const [specimen_larva_mosca_1] = await db
    .insert(specimenTable)
    .values({ code: "CPINHEXA06", lot: 6, shelf: 2, createdBy: user.id, speciesId: species_larva_mosca_1.id })
    .returning();
  // ---- mariposa (Ascalapha odorata) ----

  const [tax_84Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Ordem", labelValue: "lepidoptera", parent: tax_59, createdBy: user.id })
    .returning();
  const tax_84 = tax_84Row.id;

  const [tax_85Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Superfamília", labelValue: "noctuoidea", parent: tax_84, createdBy: user.id })
    .returning();
  const tax_85 = tax_85Row.id;

  const [tax_86Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Família", labelValue: "erebidae", parent: tax_85, createdBy: user.id })
    .returning();
  const tax_86 = tax_86Row.id;

  const [tax_87Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Gênero", labelValue: "ascalapha", parent: tax_86, createdBy: user.id })
    .returning();
  const tax_87 = tax_87Row.id;

  const [tax_88Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Espécie", labelValue: "ascalapha odorata", parent: tax_87, createdBy: user.id })
    .returning();
  const tax_88 = tax_88Row.id;

  const [species_mariposa] = await db
    .insert(speciesTable)
    .values({ speciesRoot: tax_88, createdBy: user.id })
    .returning();

  let src_82Row = (await db.insert(sourceTable).values({ url: "https://en.wikipedia.org/wiki/Ascalapha_odorata" }).onConflictDoNothing().returning())[0];
  if (!src_82Row) {
    [src_82Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://en.wikipedia.org/wiki/Ascalapha_odorata"));
  }
  const src_82 = src_82Row.id;

  let src_83Row = (await db.insert(sourceTable).values({ url: "https://breedingbutterflies.com/ascalapha-odorata-black-witch-moth-mariposa-bruxa/" }).onConflictDoNothing().returning())[0];
  if (!src_83Row) {
    [src_83Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://breedingbutterflies.com/ascalapha-odorata-black-witch-moth-mariposa-bruxa/"));
  }
  const src_83 = src_83Row.id;

  let src_84Row = (await db.insert(sourceTable).values({ url: "https://idfg.idaho.gov/species/taxa/30846" }).onConflictDoNothing().returning())[0];
  if (!src_84Row) {
    [src_84Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://idfg.idaho.gov/species/taxa/30846"));
  }
  const src_84 = src_84Row.id;

  let src_85Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:Ascalapha_odorata_(Erebidae)_I.jpg" }).onConflictDoNothing().returning())[0];
  if (!src_85Row) {
    [src_85Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:Ascalapha_odorata_(Erebidae)_I.jpg"));
  }
  const src_85 = src_85Row.id;

  let src_86Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:2014-12-09_-_Mariposa_no_meu_arm%C3%A1rio.jpg" }).onConflictDoNothing().returning())[0];
  if (!src_86Row) {
    [src_86Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:2014-12-09_-_Mariposa_no_meu_arm%C3%A1rio.jpg"));
  }
  const src_86 = src_86Row.id;

  let src_87Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:Starr_001215_0060_ascalapha_odorata.jpg" }).onConflictDoNothing().returning())[0];
  if (!src_87Row) {
    [src_87Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:Starr_001215_0060_ascalapha_odorata.jpg"));
  }
  const src_87 = src_87Row.id;

  let src_88Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:Black_Witch_Moth.jpg" }).onConflictDoNothing().returning())[0];
  if (!src_88Row) {
    [src_88Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:Black_Witch_Moth.jpg"));
  }
  const src_88 = src_88Row.id;

  let [atpl_102Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Envergadura da fêmea"), eq(attributeTemplateTable.unit, "centimeter")));
  if (!atpl_102Row) {
    [atpl_102Row] = await db.insert(attributeTemplateTable).values({ label: "Envergadura da fêmea", unit: "centimeter" }).returning();
  }
  const atpl_102 = atpl_102Row.id;

  let [atpl_103Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Envergadura do macho"), eq(attributeTemplateTable.unit, "centimeter")));
  if (!atpl_103Row) {
    [atpl_103Row] = await db.insert(attributeTemplateTable).values({ label: "Envergadura do macho", unit: "centimeter" }).returning();
  }
  const atpl_103 = atpl_103Row.id;

  let [atpl_104Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Comprimento da larva"), eq(attributeTemplateTable.unit, "centimeter")));
  if (!atpl_104Row) {
    [atpl_104Row] = await db.insert(attributeTemplateTable).values({ label: "Comprimento da larva", unit: "centimeter" }).returning();
  }
  const atpl_104 = atpl_104Row.id;

  let [atpl_105Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Hábito alimentar do adulto"), eq(attributeTemplateTable.unit, "")));
  if (!atpl_105Row) {
    [atpl_105Row] = await db.insert(attributeTemplateTable).values({ label: "Hábito alimentar do adulto", unit: "" }).returning();
  }
  const atpl_105 = atpl_105Row.id;

  let [atpl_106Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Hábitat"), eq(attributeTemplateTable.unit, "")));
  if (!atpl_106Row) {
    [atpl_106Row] = await db.insert(attributeTemplateTable).values({ label: "Hábitat", unit: "" }).returning();
  }
  const atpl_106 = atpl_106Row.id;

  let [atpl_107Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Status de conservação"), eq(attributeTemplateTable.unit, "")));
  if (!atpl_107Row) {
    [atpl_107Row] = await db.insert(attributeTemplateTable).values({ label: "Status de conservação", unit: "" }).returning();
  }
  const atpl_107 = atpl_107Row.id;

  await db.insert(attributeTable).values([
    { species: species_mariposa.id, attribute: atpl_102, value: "24", sourceId: src_82 },
    { species: species_mariposa.id, attribute: atpl_103, value: "12", sourceId: src_82 },
    { species: species_mariposa.id, attribute: atpl_104, value: "7", sourceId: src_82 },
    { species: species_mariposa.id, attribute: atpl_105, value: "frugívoro, alimenta-se de frutos muito maduros, sobretudo banana", sourceId: src_82 },
    { species: species_mariposa.id, attribute: atpl_106, value: "florestas tropicais e áreas arbustivas tropicais", sourceId: src_83 },
    { species: species_mariposa.id, attribute: atpl_107, value: "não avaliada pela IUCN (NE - not evaluated)", sourceId: src_84 },
  ]);

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "mariposa-bruxa", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_mariposa.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "bruxa-negra", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_mariposa.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "mariposa-negra", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_mariposa.id, popularNameId: pn.id });
  }

  function buildSourceIds_mariposa() {
    return { "wikipedia-en": src_82, "breedingbutterflies": src_83, "idfg-idaho": src_84, "commons-fonseca": src_85, "commons-rocha": src_86, "commons-starr": src_87, "commons-happycoder": src_88 };
  }
  const content_mariposa = buildArticleContent_mariposa(buildSourceIds_mariposa());
  const [article_mariposa] = await db
    .insert(articleTable)
    .values({ species: species_mariposa.id, content: content_mariposa })
    .returning();

  await db.insert(imageTable).values([
    { url: "https://upload.wikimedia.org/wikipedia/commons/8/80/Ascalapha_odorata_%28Erebidae%29_I.jpg", alt: "Ascalapha odorata pousada, vista dorsal mostrando o padrão mosqueado das asas", article: article_mariposa.id, type: "online", source: "upload.wikimedia.org", credit: "Juan Carlos Fonseca Mata (CC BY-SA 4.0)" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/4/45/2014-12-09_-_Mariposa_no_meu_arm%C3%A1rio.jpg", alt: "Mariposa-bruxa (Ascalapha odorata) encontrada dentro de um armário no Brasil", article: article_mariposa.id, type: "online", source: "upload.wikimedia.org", credit: "Leandro Rocha / Quintinense (CC BY 3.0)" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/f/f4/Starr_001215_0060_ascalapha_odorata.jpg", alt: "Ascalapha odorata fotografada no Havaí, exibindo a coloração acastanhada das asas", article: article_mariposa.id, type: "online", source: "upload.wikimedia.org", credit: "Forest & Kim Starr / USGS (CC BY 3.0)" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/1/18/Black_Witch_Moth.jpg", alt: "Macho de Ascalapha odorata, com coloração acinzentada mais uniforme que a da fêmea", article: article_mariposa.id, type: "online", source: "upload.wikimedia.org", credit: "Happycoder89 (CC BY 3.0)" },
  ]);

  await db.insert(articleSourcesPivotTable).values([
    { articleId: article_mariposa.id, sourceId: src_82 },
    { articleId: article_mariposa.id, sourceId: src_83 },
    { articleId: article_mariposa.id, sourceId: src_84 },
  ]);

  const [specimen_mariposa] = await db
    .insert(specimenTable)
    .values({ code: "CPINHEXA07", lot: 7, shelf: 2, createdBy: user.id, speciesId: species_mariposa.id })
    .returning();
  // ---- barata (Periplaneta americana) ----

  const [tax_89Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Ordem", labelValue: "blattodea", parent: tax_59, createdBy: user.id })
    .returning();
  const tax_89 = tax_89Row.id;

  const [tax_90Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Família", labelValue: "blattidae", parent: tax_89, createdBy: user.id })
    .returning();
  const tax_90 = tax_90Row.id;

  const [tax_91Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Subfamília", labelValue: "blattinae", parent: tax_90, createdBy: user.id })
    .returning();
  const tax_91 = tax_91Row.id;

  const [tax_92Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Gênero", labelValue: "periplaneta", parent: tax_91, createdBy: user.id })
    .returning();
  const tax_92 = tax_92Row.id;

  const [tax_93Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Espécie", labelValue: "periplaneta americana", parent: tax_92, createdBy: user.id })
    .returning();
  const tax_93 = tax_93Row.id;

  const [species_barata] = await db
    .insert(speciesTable)
    .values({ speciesRoot: tax_93, createdBy: user.id })
    .returning();

  let src_89Row = (await db.insert(sourceTable).values({ url: "https://en.wikipedia.org/wiki/American_cockroach" }).onConflictDoNothing().returning())[0];
  if (!src_89Row) {
    [src_89Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://en.wikipedia.org/wiki/American_cockroach"));
  }
  const src_89 = src_89Row.id;

  let src_90Row = (await db.insert(sourceTable).values({ url: "https://urbanentomology.tamu.edu/cockroaches/american/" }).onConflictDoNothing().returning())[0];
  if (!src_90Row) {
    [src_90Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://urbanentomology.tamu.edu/cockroaches/american/"));
  }
  const src_90 = src_90Row.id;

  let src_91Row = (await db.insert(sourceTable).values({ url: "https://www.gbif.org/species/101804635" }).onConflictDoNothing().returning())[0];
  if (!src_91Row) {
    [src_91Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://www.gbif.org/species/101804635"));
  }
  const src_91 = src_91Row.id;

  let src_92Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:American_cockroach.jpg" }).onConflictDoNothing().returning())[0];
  if (!src_92Row) {
    [src_92Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:American_cockroach.jpg"));
  }
  const src_92 = src_92Row.id;

  let src_93Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:Periplaneta_americana.jpg" }).onConflictDoNothing().returning())[0];
  if (!src_93Row) {
    [src_93Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:Periplaneta_americana.jpg"));
  }
  const src_93 = src_93Row.id;

  let src_94Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:Periplaneta_americana-1.jpg" }).onConflictDoNothing().returning())[0];
  if (!src_94Row) {
    [src_94Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:Periplaneta_americana-1.jpg"));
  }
  const src_94 = src_94Row.id;

  let src_95Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:Blatta_Americana.jpg" }).onConflictDoNothing().returning())[0];
  if (!src_95Row) {
    [src_95Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:Blatta_Americana.jpg"));
  }
  const src_95 = src_95Row.id;

  let [atpl_108Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Temperatura ideal de habitat"), eq(attributeTemplateTable.unit, "celsius")));
  if (!atpl_108Row) {
    [atpl_108Row] = await db.insert(attributeTemplateTable).values({ label: "Temperatura ideal de habitat", unit: "celsius" }).returning();
  }
  const atpl_108 = atpl_108Row.id;

  let [atpl_109Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Duração do ciclo de vida"), eq(attributeTemplateTable.unit, "day")));
  if (!atpl_109Row) {
    [atpl_109Row] = await db.insert(attributeTemplateTable).values({ label: "Duração do ciclo de vida", unit: "day" }).returning();
  }
  const atpl_109 = atpl_109Row.id;

  let [atpl_110Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Coloração"), eq(attributeTemplateTable.unit, "none")));
  if (!atpl_110Row) {
    [atpl_110Row] = await db.insert(attributeTemplateTable).values({ label: "Coloração", unit: "none" }).returning();
  }
  const atpl_110 = atpl_110Row.id;

  let [atpl_111Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Distribuição original"), eq(attributeTemplateTable.unit, "none")));
  if (!atpl_111Row) {
    [atpl_111Row] = await db.insert(attributeTemplateTable).values({ label: "Distribuição original", unit: "none" }).returning();
  }
  const atpl_111 = atpl_111Row.id;

  let [atpl_112Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Habito alimentar"), eq(attributeTemplateTable.unit, "none")));
  if (!atpl_112Row) {
    [atpl_112Row] = await db.insert(attributeTemplateTable).values({ label: "Habito alimentar", unit: "none" }).returning();
  }
  const atpl_112 = atpl_112Row.id;

  await db.insert(attributeTable).values([
    { species: species_barata.id, attribute: atpl_65, value: "4", sourceId: src_89 },
    { species: species_barata.id, attribute: atpl_108, value: "29", sourceId: src_89 },
    { species: species_barata.id, attribute: atpl_109, value: "700", sourceId: src_89 },
    { species: species_barata.id, attribute: atpl_110, value: "castanho-avermelhada com margem amarelada no pronoto", sourceId: src_90 },
    { species: species_barata.id, attribute: atpl_111, value: "nativa da Africa e do Oriente Medio, atualmente de distribuicao cosmopolita", sourceId: src_89 },
    { species: species_barata.id, attribute: atpl_112, value: "onivora oportunista, consome materia organica, papel, couro e alimentos fermentados", sourceId: src_89 },
  ]);

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Barata americana", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_barata.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Barata-de-esgoto", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_barata.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Barata", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_barata.id, popularNameId: pn.id });
  }

  function buildSourceIds_barata() {
    return { "wikipedia-american-cockroach": src_89, "tamu-urban-entomology": src_90, "gbif-periplaneta-americana": src_91, "wikimedia-american-cockroach-karim": src_92, "wikimedia-periplaneta-americana-karim": src_93, "wikimedia-periplaneta-americana-zelenko": src_94, "wikimedia-blatta-americana-laspina": src_95 };
  }
  const content_barata = buildArticleContent_barata(buildSourceIds_barata());
  const [article_barata] = await db
    .insert(articleTable)
    .values({ species: species_barata.id, content: content_barata })
    .returning();

  await db.insert(imageTable).values([
    { url: "https://upload.wikimedia.org/wikipedia/commons/b/bd/American_cockroach.jpg", alt: "Barata americana adulta vista de perfil sobre superficie clara", article: article_barata.id, type: "online", source: "upload.wikimedia.org", credit: "Muhammad Mahdi Karim (CC BY-SA 2.5)" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Periplaneta_americana.jpg", alt: "Barata americana em vista dorsal mostrando asas e pronoto", article: article_barata.id, type: "online", source: "upload.wikimedia.org", credit: "Muhammad Mahdi Karim (CC BY-SA 3.0)" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/f/f5/Periplaneta_americana-1.jpg", alt: "Barata americana fotografada de perto destacando antenas e pernas", article: article_barata.id, type: "online", source: "upload.wikimedia.org", credit: "Eugene Zelenko (CC BY-SA 4.0)" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/7/74/Blatta_Americana.jpg", alt: "Barata americana em alta resolucao mostrando a textura do exoesqueleto", article: article_barata.id, type: "online", source: "upload.wikimedia.org", credit: "Angelo T. La Spina (CC BY-SA 4.0)" },
  ]);

  await db.insert(articleSourcesPivotTable).values([
    { articleId: article_barata.id, sourceId: src_89 },
    { articleId: article_barata.id, sourceId: src_90 },
  ]);

  const [specimen_barata] = await db
    .insert(specimenTable)
    .values({ code: "CPINHEXA08", lot: 8, shelf: 2, createdBy: user.id, speciesId: species_barata.id })
    .returning();
  // ---- ovo-mosca (Musca domestica) ----

  const [species_ovo_mosca] = await db
    .insert(speciesTable)
    .values({ speciesRoot: tax_83, createdBy: user.id })
    .returning();

  let src_96Row = (await db.insert(sourceTable).values({ url: "https://ask.ifas.ufl.edu/topics/muscidae" }).onConflictDoNothing().returning())[0];
  if (!src_96Row) {
    [src_96Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://ask.ifas.ufl.edu/topics/muscidae"));
  }
  const src_96 = src_96Row.id;

  let src_97Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:Housefly_eggs,_larvae,_pupa_and_mature_fly.jpg" }).onConflictDoNothing().returning())[0];
  if (!src_97Row) {
    [src_97Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:Housefly_eggs,_larvae,_pupa_and_mature_fly.jpg"));
  }
  const src_97 = src_97Row.id;

  let src_98Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:PSM_V15_D637_Chrysalis_and_egg_of_house_fly.jpg" }).onConflictDoNothing().returning())[0];
  if (!src_98Row) {
    [src_98Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:PSM_V15_D637_Chrysalis_and_egg_of_house_fly.jpg"));
  }
  const src_98 = src_98Row.id;

  let [atpl_113Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Comprimento do ovo"), eq(attributeTemplateTable.unit, "mm")));
  if (!atpl_113Row) {
    [atpl_113Row] = await db.insert(attributeTemplateTable).values({ label: "Comprimento do ovo", unit: "mm" }).returning();
  }
  const atpl_113 = atpl_113Row.id;

  let [atpl_114Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Cor do ovo"), eq(attributeTemplateTable.unit, "")));
  if (!atpl_114Row) {
    [atpl_114Row] = await db.insert(attributeTemplateTable).values({ label: "Cor do ovo", unit: "" }).returning();
  }
  const atpl_114 = atpl_114Row.id;

  let [atpl_115Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Ovos por postura"), eq(attributeTemplateTable.unit, "egg")));
  if (!atpl_115Row) {
    [atpl_115Row] = await db.insert(attributeTemplateTable).values({ label: "Ovos por postura", unit: "egg" }).returning();
  }
  const atpl_115 = atpl_115Row.id;

  let [atpl_116Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Total de ovos por fêmea"), eq(attributeTemplateTable.unit, "egg")));
  if (!atpl_116Row) {
    [atpl_116Row] = await db.insert(attributeTemplateTable).values({ label: "Total de ovos por fêmea", unit: "egg" }).returning();
  }
  const atpl_116 = atpl_116Row.id;

  let [atpl_117Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Tempo de incubação"), eq(attributeTemplateTable.unit, "day")));
  if (!atpl_117Row) {
    [atpl_117Row] = await db.insert(attributeTemplateTable).values({ label: "Tempo de incubação", unit: "day" }).returning();
  }
  const atpl_117 = atpl_117Row.id;

  let [atpl_118Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Formato do ovo"), eq(attributeTemplateTable.unit, "")));
  if (!atpl_118Row) {
    [atpl_118Row] = await db.insert(attributeTemplateTable).values({ label: "Formato do ovo", unit: "" }).returning();
  }
  const atpl_118 = atpl_118Row.id;

  await db.insert(attributeTable).values([
    { species: species_ovo_mosca.id, attribute: atpl_113, value: "1.2", sourceId: src_79 },
    { species: species_ovo_mosca.id, attribute: atpl_114, value: "white", sourceId: src_79 },
    { species: species_ovo_mosca.id, attribute: atpl_115, value: "75-150", sourceId: src_79 },
    { species: species_ovo_mosca.id, attribute: atpl_116, value: "up to 500", sourceId: src_79 },
    { species: species_ovo_mosca.id, attribute: atpl_117, value: "less than 1", sourceId: src_79 },
    { species: species_ovo_mosca.id, attribute: atpl_118, value: "banana-shaped", sourceId: src_96 },
  ]);

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Mosca doméstica", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_ovo_mosca.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Mosca-de-casa", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_ovo_mosca.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Ovo de mosca", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_ovo_mosca.id, popularNameId: pn.id });
  }

  function buildSourceIds_ovo_mosca() {
    return { "wikipedia-housefly": src_79, "ufl-featured-creatures-housefly": src_96, "wikimedia-housefly-lifecycle": src_97, "wikimedia-psm-chrysalis-egg": src_98 };
  }
  const content_ovo_mosca = buildArticleContent_ovo_mosca(buildSourceIds_ovo_mosca());
  const [article_ovo_mosca] = await db
    .insert(articleTable)
    .values({ species: species_ovo_mosca.id, content: content_ovo_mosca })
    .returning();

  await db.insert(imageTable).values([
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Housefly_eggs%2C_larvae%2C_pupa_and_mature_fly.jpg/768px-Housefly_eggs%2C_larvae%2C_pupa_and_mature_fly.jpg", alt: "Ovos, larvas, pupa e mosca adulta de Musca domestica mostrando o ciclo de vida completo", article: article_ovo_mosca.id, type: "online", source: "upload.wikimedia.org", credit: "Clemson University - USDA Cooperative Extension Slide Series, Bugwood.org (CC BY 3.0) via Wikimedia Commons" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/PSM_V15_D637_Chrysalis_and_egg_of_house_fly.jpg/500px-PSM_V15_D637_Chrysalis_and_egg_of_house_fly.jpg", alt: "Ilustração histórica do ovo e da crisálida da mosca doméstica (Popular Science Monthly, 1879)", article: article_ovo_mosca.id, type: "online", source: "upload.wikimedia.org", credit: "Popular Science Monthly, Volume 15 (1879) - domínio público via Wikimedia Commons" },
  ]);

  await db.insert(articleSourcesPivotTable).values([
    { articleId: article_ovo_mosca.id, sourceId: src_96 },
    { articleId: article_ovo_mosca.id, sourceId: src_79 },
  ]);

  const [specimen_ovo_mosca] = await db
    .insert(specimenTable)
    .values({ code: "CPINHEXA09", lot: 9, shelf: 2, createdBy: user.id, speciesId: species_ovo_mosca.id })
    .returning();
  // ---- larva-mosca-2 (Chrysomya megacephala) ----

  const [tax_94Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Família", labelValue: "calliphoridae", parent: tax_80, createdBy: user.id })
    .returning();
  const tax_94 = tax_94Row.id;

  const [tax_95Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Subfamília", labelValue: "chrysomyinae", parent: tax_94, createdBy: user.id })
    .returning();
  const tax_95 = tax_95Row.id;

  const [tax_96Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Gênero", labelValue: "chrysomya", parent: tax_95, createdBy: user.id })
    .returning();
  const tax_96 = tax_96Row.id;

  const [tax_97Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Espécie", labelValue: "chrysomya megacephala", parent: tax_96, createdBy: user.id })
    .returning();
  const tax_97 = tax_97Row.id;

  const [species_larva_mosca_2] = await db
    .insert(speciesTable)
    .values({ speciesRoot: tax_97, createdBy: user.id })
    .returning();

  let src_99Row = (await db.insert(sourceTable).values({ url: "https://en.wikipedia.org/wiki/Chrysomya_megacephala" }).onConflictDoNothing().returning())[0];
  if (!src_99Row) {
    [src_99Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://en.wikipedia.org/wiki/Chrysomya_megacephala"));
  }
  const src_99 = src_99Row.id;

  let src_100Row = (await db.insert(sourceTable).values({ url: "https://keys.lucidcentral.org/keys/v3/Carrion_flies_of_Australia/Chrysomya_megacephala.htm" }).onConflictDoNothing().returning())[0];
  if (!src_100Row) {
    [src_100Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://keys.lucidcentral.org/keys/v3/Carrion_flies_of_Australia/Chrysomya_megacephala.htm"));
  }
  const src_100 = src_100Row.id;

  let src_101Row = (await db.insert(sourceTable).values({ url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6197084" }).onConflictDoNothing().returning())[0];
  if (!src_101Row) {
    [src_101Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://pmc.ncbi.nlm.nih.gov/articles/PMC6197084"));
  }
  const src_101 = src_101Row.id;

  let src_102Row = (await db.insert(sourceTable).values({ url: "https://periodicos.ufjf.br/index.php/zoociencias/article/view/24072" }).onConflictDoNothing().returning())[0];
  if (!src_102Row) {
    [src_102Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://periodicos.ufjf.br/index.php/zoociencias/article/view/24072"));
  }
  const src_102 = src_102Row.id;

  let src_103Row = (await db.insert(sourceTable).values({ url: "https://www.embrapa.br/busca-de-publicacoes/-/publicacao/1003186/bacteria-carried-by-chrysomya-megacephala-fabricius-1794-diptera-calliphoridae-in-sinop-mato-grosso-brazil" }).onConflictDoNothing().returning())[0];
  if (!src_103Row) {
    [src_103Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://www.embrapa.br/busca-de-publicacoes/-/publicacao/1003186/bacteria-carried-by-chrysomya-megacephala-fabricius-1794-diptera-calliphoridae-in-sinop-mato-grosso-brazil"));
  }
  const src_103 = src_103Row.id;

  let [atpl_119Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "comprimento do adulto"), eq(attributeTemplateTable.unit, "mm")));
  if (!atpl_119Row) {
    [atpl_119Row] = await db.insert(attributeTemplateTable).values({ label: "comprimento do adulto", unit: "mm" }).returning();
  }
  const atpl_119 = atpl_119Row.id;

  let [atpl_120Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "comprimento da larva de terceiro estádio"), eq(attributeTemplateTable.unit, "mm")));
  if (!atpl_120Row) {
    [atpl_120Row] = await db.insert(attributeTemplateTable).values({ label: "comprimento da larva de terceiro estádio", unit: "mm" }).returning();
  }
  const atpl_120 = atpl_120Row.id;

  let [atpl_121Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "duração do ciclo de vida"), eq(attributeTemplateTable.unit, "day")));
  if (!atpl_121Row) {
    [atpl_121Row] = await db.insert(attributeTemplateTable).values({ label: "duração do ciclo de vida", unit: "day" }).returning();
  }
  const atpl_121 = atpl_121Row.id;

  let [atpl_122Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "duração da fase larval"), eq(attributeTemplateTable.unit, "day")));
  if (!atpl_122Row) {
    [atpl_122Row] = await db.insert(attributeTemplateTable).values({ label: "duração da fase larval", unit: "day" }).returning();
  }
  const atpl_122 = atpl_122Row.id;

  let [atpl_123Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "ovos por postura"), eq(attributeTemplateTable.unit, "egg")));
  if (!atpl_123Row) {
    [atpl_123Row] = await db.insert(attributeTemplateTable).values({ label: "ovos por postura", unit: "egg" }).returning();
  }
  const atpl_123 = atpl_123Row.id;

  let [atpl_124Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "índice de sinantropia em Paracambi (RJ)"), eq(attributeTemplateTable.unit, "percent")));
  if (!atpl_124Row) {
    [atpl_124Row] = await db.insert(attributeTemplateTable).values({ label: "índice de sinantropia em Paracambi (RJ)", unit: "percent" }).returning();
  }
  const atpl_124 = atpl_124Row.id;

  await db.insert(attributeTable).values([
    { species: species_larva_mosca_2.id, attribute: atpl_119, value: "greater than 10", sourceId: src_100 },
    { species: species_larva_mosca_2.id, attribute: atpl_120, value: "approximately 16", sourceId: src_101 },
    { species: species_larva_mosca_2.id, attribute: atpl_121, value: "7 to 10", sourceId: src_101 },
    { species: species_larva_mosca_2.id, attribute: atpl_122, value: "approximately 5.4", sourceId: src_99 },
    { species: species_larva_mosca_2.id, attribute: atpl_123, value: "200 to 300", sourceId: src_99 },
    { species: species_larva_mosca_2.id, attribute: atpl_124, value: "37.54", sourceId: src_102 },
  ]);

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "mosca varejeira", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_larva_mosca_2.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "môsca varejeira", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_larva_mosca_2.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "mosca-varejeira-oriental", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_larva_mosca_2.id, popularNameId: pn.id });
  }

  function buildSourceIds_larva_mosca_2() {
    return { "wikipedia-en-chrysomya": src_99, "lucidcentral-carrion-flies": src_100, "pmc-forensic-review": src_101, "ufjf-paracambi-sinantropia": src_102, "embrapa-bacteria-sinop": src_103 };
  }
  const content_larva_mosca_2 = buildArticleContent_larva_mosca_2(buildSourceIds_larva_mosca_2());
  const [article_larva_mosca_2] = await db
    .insert(articleTable)
    .values({ species: species_larva_mosca_2.id, content: content_larva_mosca_2 })
    .returning();

  await db.insert(imageTable).values([
    { url: "https://upload.wikimedia.org/wikipedia/commons/8/86/Ch.megacephala_wiki.jpg", alt: "Fêmea adulta de Chrysomya megacephala alimentando-se sobre matéria fecal", article: article_larva_mosca_2.id, type: "online", source: "upload.wikimedia.org", credit: "Muhammad Mahdi Karim, GFDL 1.2" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/1/10/Chrysomya_megacephala_male.jpg", alt: "Macho adulto de Chrysomya megacephala em close-up", article: article_larva_mosca_2.id, type: "online", source: "upload.wikimedia.org", credit: "Muhammad Mahdi Karim, GFDL 1.2" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/d/d8/Chrysomya_megacephala_-_Life_cycle.jpg", alt: "Estágios do ciclo de vida de Chrysomya megacephala, incluindo ovos, larvas e pupas", article: article_larva_mosca_2.id, type: "online", source: "upload.wikimedia.org", credit: "Aimaggie, CC BY-SA 3.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/8/85/Chrysomya_megacephala_-_Larval_state_pois.jpg", alt: "Larvas (vermes) de Chrysomya megacephala no estágio larval", article: article_larva_mosca_2.id, type: "online", source: "upload.wikimedia.org", credit: "Aimaggie, CC BY-SA 3.0" },
  ]);

  await db.insert(articleSourcesPivotTable).values([
    { articleId: article_larva_mosca_2.id, sourceId: src_100 },
    { articleId: article_larva_mosca_2.id, sourceId: src_99 },
    { articleId: article_larva_mosca_2.id, sourceId: src_103 },
    { articleId: article_larva_mosca_2.id, sourceId: src_101 },
    { articleId: article_larva_mosca_2.id, sourceId: src_102 },
  ]);

  const [specimen_larva_mosca_2] = await db
    .insert(specimenTable)
    .values({ code: "CPINHEXA10", lot: 10, shelf: 2, createdBy: user.id, speciesId: species_larva_mosca_2.id })
    .returning();
  // ---- larva-mosca-3 (Lucilia sericata) ----

  const [tax_98Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Subfamília", labelValue: "luciliinae", parent: tax_94, createdBy: user.id })
    .returning();
  const tax_98 = tax_98Row.id;

  const [tax_99Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Gênero", labelValue: "lucilia", parent: tax_98, createdBy: user.id })
    .returning();
  const tax_99 = tax_99Row.id;

  const [tax_100Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Espécie", labelValue: "lucilia sericata", parent: tax_99, createdBy: user.id })
    .returning();
  const tax_100 = tax_100Row.id;

  const [species_larva_mosca_3] = await db
    .insert(speciesTable)
    .values({ speciesRoot: tax_100, createdBy: user.id })
    .returning();

  let src_104Row = (await db.insert(sourceTable).values({ url: "https://en.wikipedia.org/wiki/Common_green_bottle_fly" }).onConflictDoNothing().returning())[0];
  if (!src_104Row) {
    [src_104Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://en.wikipedia.org/wiki/Common_green_bottle_fly"));
  }
  const src_104 = src_104Row.id;

  let src_105Row = (await db.insert(sourceTable).values({ url: "https://www.gbif.org/taxon/3WC2P" }).onConflictDoNothing().returning())[0];
  if (!src_105Row) {
    [src_105Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://www.gbif.org/taxon/3WC2P"));
  }
  const src_105 = src_105Row.id;

  let src_106Row = (await db.insert(sourceTable).values({ url: "https://www.xataka.com.br/ciencia/esta-especie-mosca-varejeira-foi-aprovada-para-para-limpeza-feridas-em-humanos" }).onConflictDoNothing().returning())[0];
  if (!src_106Row) {
    [src_106Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://www.xataka.com.br/ciencia/esta-especie-mosca-varejeira-foi-aprovada-para-para-limpeza-feridas-em-humanos"));
  }
  const src_106 = src_106Row.id;

  let [atpl_125Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Comprimento do adulto"), eq(attributeTemplateTable.unit, "millimeter")));
  if (!atpl_125Row) {
    [atpl_125Row] = await db.insert(attributeTemplateTable).values({ label: "Comprimento do adulto", unit: "millimeter" }).returning();
  }
  const atpl_125 = atpl_125Row.id;

  let [atpl_126Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Comprimento da larva (3º ínstar)"), eq(attributeTemplateTable.unit, "millimeter")));
  if (!atpl_126Row) {
    [atpl_126Row] = await db.insert(attributeTemplateTable).values({ label: "Comprimento da larva (3º ínstar)", unit: "millimeter" }).returning();
  }
  const atpl_126 = atpl_126Row.id;

  let [atpl_127Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Duração da pupação"), eq(attributeTemplateTable.unit, "day")));
  if (!atpl_127Row) {
    [atpl_127Row] = await db.insert(attributeTemplateTable).values({ label: "Duração da pupação", unit: "day" }).returning();
  }
  const atpl_127 = atpl_127Row.id;

  let [atpl_128Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Gerações por ano em clima temperado frio"), eq(attributeTemplateTable.unit, "generation")));
  if (!atpl_128Row) {
    [atpl_128Row] = await db.insert(attributeTemplateTable).values({ label: "Gerações por ano em clima temperado frio", unit: "generation" }).returning();
  }
  const atpl_128 = atpl_128Row.id;

  await db.insert(attributeTable).values([
    { species: species_larva_mosca_3.id, attribute: atpl_125, value: "10-14", sourceId: src_104 },
    { species: species_larva_mosca_3.id, attribute: atpl_126, value: "10-14", sourceId: src_104 },
    { species: species_larva_mosca_3.id, attribute: atpl_99, value: "14-21", sourceId: src_104 },
    { species: species_larva_mosca_3.id, attribute: atpl_91, value: "150-200", sourceId: src_104 },
    { species: species_larva_mosca_3.id, attribute: atpl_127, value: "6-14", sourceId: src_104 },
    { species: species_larva_mosca_3.id, attribute: atpl_128, value: "3-4", sourceId: src_104 },
  ]);

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Mosca-varejeira-verde", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_larva_mosca_3.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Mosca varejeira", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_larva_mosca_3.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Common green bottle fly", origin: "en" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_larva_mosca_3.id, popularNameId: pn.id });
  }

  function buildSourceIds_larva_mosca_3() {
    return { "wikipedia-lucilia-sericata": src_104, "gbif-lucilia-sericata": src_105, "xataka-mosca-varejeira-terapia-larval": src_106 };
  }
  const content_larva_mosca_3 = buildArticleContent_larva_mosca_3(buildSourceIds_larva_mosca_3());
  const [article_larva_mosca_3] = await db
    .insert(articleTable)
    .values({ species: species_larva_mosca_3.id, content: content_larva_mosca_3 })
    .returning();

  await db.insert(imageTable).values([
    { url: "https://upload.wikimedia.org/wikipedia/commons/c/ca/Larven_Lucilia_sericata.jpg", alt: "Larvas de Lucilia sericata em diferentes estágios de crescimento, usadas em terapia larval", article: article_larva_mosca_3.id, type: "online", source: "upload.wikimedia.org", credit: "Enter / CC BY-SA 3.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/b/bd/Larven_der_Lucillia_sericata_im_BioBag.jpg", alt: "Larvas de Lucilia sericata dentro de um BioBag para terapia larval", article: article_larva_mosca_3.id, type: "online", source: "upload.wikimedia.org", credit: "Enter / CC BY-SA 4.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/a/ae/Common_green_bottle_fly_%28Lucilia_sericata%29.jpg", alt: "Adulto de Lucilia sericata com coloração metálica verde-azulada característica", article: article_larva_mosca_3.id, type: "online", source: "upload.wikimedia.org", credit: "Pawel Wiecek (hedera.baltica) / CC BY-SA 2.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/8/80/Lucilia_sericata_8676.jpg", alt: "Adulto de Lucilia sericata fotografado no sul da Alemanha", article: article_larva_mosca_3.id, type: "online", source: "upload.wikimedia.org", credit: "Amada44 / CC BY-SA 4.0" },
  ]);

  await db.insert(articleSourcesPivotTable).values([
    { articleId: article_larva_mosca_3.id, sourceId: src_104 },
    { articleId: article_larva_mosca_3.id, sourceId: src_105 },
    { articleId: article_larva_mosca_3.id, sourceId: src_106 },
  ]);

  const [specimen_larva_mosca_3] = await db
    .insert(specimenTable)
    .values({ code: "CPINHEXA11", lot: 11, shelf: 2, createdBy: user.id, speciesId: species_larva_mosca_3.id })
    .returning();
  // ---- larva-mosca-4 (Chrysomya albiceps) ----

  const [tax_101Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Gênero", labelValue: "chrysomya", parent: tax_94, createdBy: user.id })
    .returning();
  const tax_101 = tax_101Row.id;

  const [tax_102Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Espécie", labelValue: "chrysomya albiceps", parent: tax_101, createdBy: user.id })
    .returning();
  const tax_102 = tax_102Row.id;

  const [species_larva_mosca_4] = await db
    .insert(speciesTable)
    .values({ speciesRoot: tax_102, createdBy: user.id })
    .returning();

  let src_107Row = (await db.insert(sourceTable).values({ url: "https://en.wikipedia.org/wiki/Chrysomya_albiceps" }).onConflictDoNothing().returning())[0];
  if (!src_107Row) {
    [src_107Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://en.wikipedia.org/wiki/Chrysomya_albiceps"));
  }
  const src_107 = src_107Row.id;

  let src_108Row = (await db.insert(sourceTable).values({ url: "https://revista.uninga.br/uninga/article/view/1214" }).onConflictDoNothing().returning())[0];
  if (!src_108Row) {
    [src_108Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://revista.uninga.br/uninga/article/view/1214"));
  }
  const src_108 = src_108Row.id;

  let src_109Row = (await db.insert(sourceTable).values({ url: "https://www.alice.cnptia.embrapa.br/handle/doc/861520?locale=en" }).onConflictDoNothing().returning())[0];
  if (!src_109Row) {
    [src_109Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://www.alice.cnptia.embrapa.br/handle/doc/861520?locale=en"));
  }
  const src_109 = src_109Row.id;

  let src_110Row = (await db.insert(sourceTable).values({ url: "https://repositorio.unesp.br/items/4303598f-3167-4012-8fe3-f8266e426dcf/full" }).onConflictDoNothing().returning())[0];
  if (!src_110Row) {
    [src_110Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://repositorio.unesp.br/items/4303598f-3167-4012-8fe3-f8266e426dcf/full"));
  }
  const src_110 = src_110Row.id;

  let src_111Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:Chrysomya_albiceps_eating.jpg" }).onConflictDoNothing().returning())[0];
  if (!src_111Row) {
    [src_111Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:Chrysomya_albiceps_eating.jpg"));
  }
  const src_111 = src_111Row.id;

  let src_112Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:Chrysomya_albiceps_01.JPG" }).onConflictDoNothing().returning())[0];
  if (!src_112Row) {
    [src_112Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:Chrysomya_albiceps_01.JPG"));
  }
  const src_112 = src_112Row.id;

  let src_113Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:Calliphoridae_-_Chrysomya_albiceps_(female).JPG" }).onConflictDoNothing().returning())[0];
  if (!src_113Row) {
    [src_113Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:Calliphoridae_-_Chrysomya_albiceps_(female).JPG"));
  }
  const src_113 = src_113Row.id;

  let [atpl_129Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Temperatura ideal de oviposição"), eq(attributeTemplateTable.unit, "degree celsius")));
  if (!atpl_129Row) {
    [atpl_129Row] = await db.insert(attributeTemplateTable).values({ label: "Temperatura ideal de oviposição", unit: "degree celsius" }).returning();
  }
  const atpl_129 = atpl_129Row.id;

  let [atpl_130Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Duração do ciclo de vida (ovo a adulto, 20-30°C)"), eq(attributeTemplateTable.unit, "day")));
  if (!atpl_130Row) {
    [atpl_130Row] = await db.insert(attributeTemplateTable).values({ label: "Duração do ciclo de vida (ovo a adulto, 20-30°C)", unit: "day" }).returning();
  }
  const atpl_130 = atpl_130Row.id;

  let [atpl_131Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Faixa de elevação"), eq(attributeTemplateTable.unit, "meter")));
  if (!atpl_131Row) {
    [atpl_131Row] = await db.insert(attributeTemplateTable).values({ label: "Faixa de elevação", unit: "meter" }).returning();
  }
  const atpl_131 = atpl_131Row.id;

  let [atpl_132Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Comportamento larval"), eq(attributeTemplateTable.unit, "none")));
  if (!atpl_132Row) {
    [atpl_132Row] = await db.insert(attributeTemplateTable).values({ label: "Comportamento larval", unit: "none" }).returning();
  }
  const atpl_132 = atpl_132Row.id;

  let [atpl_133Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Hábito alimentar das larvas"), eq(attributeTemplateTable.unit, "none")));
  if (!atpl_133Row) {
    [atpl_133Row] = await db.insert(attributeTemplateTable).values({ label: "Hábito alimentar das larvas", unit: "none" }).returning();
  }
  const atpl_133 = atpl_133Row.id;

  await db.insert(attributeTable).values([
    { species: species_larva_mosca_4.id, attribute: atpl_125, value: "6-9", sourceId: src_107 },
    { species: species_larva_mosca_4.id, attribute: atpl_129, value: "25-27", sourceId: src_107 },
    { species: species_larva_mosca_4.id, attribute: atpl_130, value: "66", sourceId: src_107 },
    { species: species_larva_mosca_4.id, attribute: atpl_131, value: "200-3100", sourceId: src_107 },
    { species: species_larva_mosca_4.id, attribute: atpl_132, value: "predatory and cannibalistic", sourceId: src_107 },
    { species: species_larva_mosca_4.id, attribute: atpl_133, value: "necrophagous", sourceId: src_108 },
  ]);

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "mosca-varejeira", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_larva_mosca_4.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "larva de mosca", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_larva_mosca_4.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "hairy maggot blow fly", origin: "en" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_larva_mosca_4.id, popularNameId: pn.id });
  }

  function buildSourceIds_larva_mosca_4() {
    return { "wikipedia-en-chrysomya-albiceps": src_107, "uninga-forense-maringa": src_108, "embrapa-pantanal-sazonalidade": src_109, "unesp-predacao-cochliomyia": src_110, "wikimedia-eating": src_111, "wikimedia-01": src_112, "wikimedia-female": src_113 };
  }
  const content_larva_mosca_4 = buildArticleContent_larva_mosca_4(buildSourceIds_larva_mosca_4());
  const [article_larva_mosca_4] = await db
    .insert(articleTable)
    .values({ species: species_larva_mosca_4.id, content: content_larva_mosca_4 })
    .returning();

  await db.insert(imageTable).values([
    { url: "https://upload.wikimedia.org/wikipedia/commons/9/99/Chrysomya_albiceps_eating.jpg", alt: "Mosca adulta de Chrysomya albiceps alimentando-se de carne em decomposição", article: article_larva_mosca_4.id, type: "online", source: "upload.wikimedia.org", credit: "Muhammad Mahdi Karim (GFDL 1.2+)" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/a/ad/Chrysomya_albiceps_01.JPG", alt: "Vista lateral de um exemplar adulto de Chrysomya albiceps", article: article_larva_mosca_4.id, type: "online", source: "upload.wikimedia.org", credit: "AfroBrazilian (CC BY-SA 3.0 / GFDL 1.2+)" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/4/41/Calliphoridae_-_Chrysomya_albiceps_%28female%29.JPG", alt: "Fêmea de Chrysomya albiceps alimentando-se em flor de Dittrichia viscosa", article: article_larva_mosca_4.id, type: "online", source: "upload.wikimedia.org", credit: "Hectonichus (CC BY-SA 4.0 / GFDL 1.2+)" },
  ]);

  await db.insert(articleSourcesPivotTable).values([
    { articleId: article_larva_mosca_4.id, sourceId: src_109 },
    { articleId: article_larva_mosca_4.id, sourceId: src_108 },
    { articleId: article_larva_mosca_4.id, sourceId: src_107 },
    { articleId: article_larva_mosca_4.id, sourceId: src_110 },
  ]);

  const [specimen_larva_mosca_4] = await db
    .insert(specimenTable)
    .values({ code: "CPINHEXA12", lot: 12, shelf: 2, createdBy: user.id, speciesId: species_larva_mosca_4.id })
    .returning();
  // ---- pupa-mosca (Musca domestica) ----

  const [species_pupa_mosca] = await db
    .insert(speciesTable)
    .values({ speciesRoot: tax_83, createdBy: user.id })
    .returning();

  let src_114Row = (await db.insert(sourceTable).values({ url: "https://pt.wikipedia.org/wiki/Musca_domestica" }).onConflictDoNothing().returning())[0];
  if (!src_114Row) {
    [src_114Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://pt.wikipedia.org/wiki/Musca_domestica"));
  }
  const src_114 = src_114Row.id;

  let src_115Row = (await db.insert(sourceTable).values({ url: "https://en.wikipedia.org/wiki/Musca_domestica" }).onConflictDoNothing().returning())[0];
  if (!src_115Row) {
    [src_115Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://en.wikipedia.org/wiki/Musca_domestica"));
  }
  const src_115 = src_115Row.id;

  let [atpl_134Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Tamanho do pupário"), eq(attributeTemplateTable.unit, "mm")));
  if (!atpl_134Row) {
    [atpl_134Row] = await db.insert(attributeTemplateTable).values({ label: "Tamanho do pupário", unit: "mm" }).returning();
  }
  const atpl_134 = atpl_134Row.id;

  let [atpl_135Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Ciclo de vida completo em ambiente natural"), eq(attributeTemplateTable.unit, "day")));
  if (!atpl_135Row) {
    [atpl_135Row] = await db.insert(attributeTemplateTable).values({ label: "Ciclo de vida completo em ambiente natural", unit: "day" }).returning();
  }
  const atpl_135 = atpl_135Row.id;

  let [atpl_136Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Comprimento do corpo adulto"), eq(attributeTemplateTable.unit, "mm")));
  if (!atpl_136Row) {
    [atpl_136Row] = await db.insert(attributeTemplateTable).values({ label: "Comprimento do corpo adulto", unit: "mm" }).returning();
  }
  const atpl_136 = atpl_136Row.id;

  let [atpl_137Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Coloração do tórax"), eq(attributeTemplateTable.unit, "")));
  if (!atpl_137Row) {
    [atpl_137Row] = await db.insert(attributeTemplateTable).values({ label: "Coloração do tórax", unit: "" }).returning();
  }
  const atpl_137 = atpl_137Row.id;

  await db.insert(attributeTable).values([
    { species: species_pupa_mosca.id, attribute: atpl_127, value: "2 a 20, variando com a temperatura", sourceId: src_115 },
    { species: species_pupa_mosca.id, attribute: atpl_134, value: "8", sourceId: src_115 },
    { species: species_pupa_mosca.id, attribute: atpl_135, value: "25 a 30", sourceId: src_114 },
    { species: species_pupa_mosca.id, attribute: atpl_136, value: "6 a 7", sourceId: src_115 },
    { species: species_pupa_mosca.id, attribute: atpl_97, value: "13 a 15", sourceId: src_115 },
    { species: species_pupa_mosca.id, attribute: atpl_137, value: "cinzenta, com quatro linhas longitudinais escuras", sourceId: src_114 },
  ]);

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Mosca-doméstica", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_pupa_mosca.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Mosca-de-casa", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_pupa_mosca.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Housefly", origin: "en" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_pupa_mosca.id, popularNameId: pn.id });
  }

  function buildSourceIds_pupa_mosca() {
    return { "wikipedia-pt-musca-domestica": src_114, "wikipedia-en-musca-domestica": src_115 };
  }
  const content_pupa_mosca = buildArticleContent_pupa_mosca(buildSourceIds_pupa_mosca());
  const [article_pupa_mosca] = await db
    .insert(articleTable)
    .values({ species: species_pupa_mosca.id, content: content_pupa_mosca })
    .returning();

  await db.insert(imageTable).values([
    { url: "https://upload.wikimedia.org/wikipedia/commons/e/ef/Housefly_eggs%2C_larvae%2C_pupa_and_mature_fly.jpg", alt: "Ovos, larvas, pupa e mosca adulta de Musca domestica", article: article_pupa_mosca.id, type: "online", source: "upload.wikimedia.org", credit: "Clemson University – USDA Cooperative Extension Slide Series, Bugwood.org (CC BY 3.0)" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/f/f5/Housefly_pupae_killed_by_wasp_larvae.jpg", alt: "Pupas de Musca domestica parasitadas por larvas de vespa, com orifícios de emergência", article: article_pupa_mosca.id, type: "online", source: "upload.wikimedia.org", credit: "USDA Agricultural Research Service (domínio público)" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/0/09/Life_Cycle_of_the_House_Fly%2C_extracted_from_Flies_of_public_health_importance_and_their_control_%281976%29.png", alt: "Diagrama do ciclo de vida da mosca doméstica, incluindo ovo, larva, pupa e adulto", article: article_pupa_mosca.id, type: "online", source: "upload.wikimedia.org", credit: "Pratt, Scott & Littig, Centro de Controle de Doenças dos EUA (1976) – domínio público" },
  ]);

  await db.insert(articleSourcesPivotTable).values([
    { articleId: article_pupa_mosca.id, sourceId: src_114 },
    { articleId: article_pupa_mosca.id, sourceId: src_115 },
  ]);

  const [specimen_pupa_mosca] = await db
    .insert(specimenTable)
    .values({ code: "CPINHEXA13", lot: 13, shelf: 2, createdBy: user.id, speciesId: species_pupa_mosca.id })
    .returning();
  // ---- mosca (Musca domestica) ----

  const [species_mosca] = await db
    .insert(speciesTable)
    .values({ speciesRoot: tax_83, createdBy: user.id })
    .returning();

  let [atpl_138Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Comprimento do corpo"), eq(attributeTemplateTable.unit, "mm")));
  if (!atpl_138Row) {
    [atpl_138Row] = await db.insert(attributeTemplateTable).values({ label: "Comprimento do corpo", unit: "mm" }).returning();
  }
  const atpl_138 = atpl_138Row.id;

  let [atpl_139Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Envergadura"), eq(attributeTemplateTable.unit, "mm")));
  if (!atpl_139Row) {
    [atpl_139Row] = await db.insert(attributeTemplateTable).values({ label: "Envergadura", unit: "mm" }).returning();
  }
  const atpl_139 = atpl_139Row.id;

  let [atpl_140Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Expectativa de vida do adulto"), eq(attributeTemplateTable.unit, "week")));
  if (!atpl_140Row) {
    [atpl_140Row] = await db.insert(attributeTemplateTable).values({ label: "Expectativa de vida do adulto", unit: "week" }).returning();
  }
  const atpl_140 = atpl_140Row.id;

  let [atpl_141Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Ovos por fêmea"), eq(attributeTemplateTable.unit, "egg")));
  if (!atpl_141Row) {
    [atpl_141Row] = await db.insert(attributeTemplateTable).values({ label: "Ovos por fêmea", unit: "egg" }).returning();
  }
  const atpl_141 = atpl_141Row.id;

  let [atpl_142Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Ciclo de vida completo (condições ótimas)"), eq(attributeTemplateTable.unit, "day")));
  if (!atpl_142Row) {
    [atpl_142Row] = await db.insert(attributeTemplateTable).values({ label: "Ciclo de vida completo (condições ótimas)", unit: "day" }).returning();
  }
  const atpl_142 = atpl_142Row.id;

  let [atpl_143Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Gerações por ano (regiões tropicais)"), eq(attributeTemplateTable.unit, "generation")));
  if (!atpl_143Row) {
    [atpl_143Row] = await db.insert(attributeTemplateTable).values({ label: "Gerações por ano (regiões tropicais)", unit: "generation" }).returning();
  }
  const atpl_143 = atpl_143Row.id;

  await db.insert(attributeTable).values([
    { species: species_mosca.id, attribute: atpl_138, value: "6 to 7", sourceId: src_79 },
    { species: species_mosca.id, attribute: atpl_139, value: "13 to 15", sourceId: src_79 },
    { species: species_mosca.id, attribute: atpl_140, value: "2 to 4", sourceId: src_79 },
    { species: species_mosca.id, attribute: atpl_141, value: "up to 500", sourceId: src_79 },
    { species: species_mosca.id, attribute: atpl_142, value: "7 to 10", sourceId: src_79 },
    { species: species_mosca.id, attribute: atpl_143, value: "more than 20", sourceId: src_79 },
  ]);

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Mosca-doméstica", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_mosca.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Mosca-de-casa", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_mosca.id, popularNameId: pn.id });
  }

  function buildSourceIds_mosca() {
    return { "wikipedia-pt-musca-domestica": src_114, "wikipedia-en-housefly": src_79 };
  }
  const content_mosca = buildArticleContent_mosca(buildSourceIds_mosca());
  const [article_mosca] = await db
    .insert(articleTable)
    .values({ species: species_mosca.id, content: content_mosca })
    .returning();

  await db.insert(imageTable).values([
    { url: "https://upload.wikimedia.org/wikipedia/commons/b/b6/Housefly_musca_domestica.jpg", alt: "Close-up de mosca-doméstica adulta (Musca domestica) mostrando detalhes da cabeça, olhos compostos avermelhados e asas", article: article_mosca.id, type: "online", source: "upload.wikimedia.org", credit: "Muhammad Mahdi Karim, GFDL 1.2" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/3/33/Detail_of_a_Housefly_%28Musca_domestica%29_at_8%C3%97_Magnification.jpg", alt: "Detalhe ampliado em 8x de mosca-doméstica (Musca domestica) evidenciando a pilosidade do corpo e a estrutura das patas", article: article_mosca.id, type: "online", source: "upload.wikimedia.org", credit: "MicrocosmicWorld, CC BY-SA 4.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/1/14/Common_house_fly%2C_Musca_domestica.jpg", alt: "Mosca-doméstica adulta (Musca domestica) pousada sobre uma superfície, vista lateral do corpo", article: article_mosca.id, type: "online", source: "upload.wikimedia.org", credit: "Stephen Ausmus, USDA-ARS (USDAgov), CC BY 2.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/2/21/Mosca_domestica.jpg", alt: "Mosca-doméstica adulta (Musca domestica) em repouso, vista geral do corpo e asas", article: article_mosca.id, type: "online", source: "upload.wikimedia.org", credit: "Lojujone, CC BY-SA 4.0" },
  ]);

  await db.insert(articleSourcesPivotTable).values([
    { articleId: article_mosca.id, sourceId: src_79 },
    { articleId: article_mosca.id, sourceId: src_114 },
  ]);

  const [specimen_mosca] = await db
    .insert(specimenTable)
    .values({ code: "CPINHEXA14", lot: 14, shelf: 2, createdBy: user.id, speciesId: species_mosca.id })
    .returning();
  // ---- besouro-chifre (Dynastinae) ----

  const [tax_103Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Subfamília", labelValue: "dynastinae", parent: tax_67, createdBy: user.id })
    .returning();
  const tax_103 = tax_103Row.id;

  const [species_besouro_chifre] = await db
    .insert(speciesTable)
    .values({ speciesRoot: tax_103, createdBy: user.id })
    .returning();

  let src_116Row = (await db.insert(sourceTable).values({ url: "https://en.wikipedia.org/wiki/Dynastinae" }).onConflictDoNothing().returning())[0];
  if (!src_116Row) {
    [src_116Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://en.wikipedia.org/wiki/Dynastinae"));
  }
  const src_116 = src_116Row.id;

  let src_117Row = (await db.insert(sourceTable).values({ url: "https://en.wikipedia.org/wiki/Actaeon_beetle" }).onConflictDoNothing().returning())[0];
  if (!src_117Row) {
    [src_117Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://en.wikipedia.org/wiki/Actaeon_beetle"));
  }
  const src_117 = src_117Row.id;

  let src_118Row = (await db.insert(sourceTable).values({ url: "https://www.scielo.br/j/aa/a/xsD9jz9GsZgKxM8CJYCgCsH/abstract/?lang=en" }).onConflictDoNothing().returning())[0];
  if (!src_118Row) {
    [src_118Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://www.scielo.br/j/aa/a/xsD9jz9GsZgKxM8CJYCgCsH/abstract/?lang=en"));
  }
  const src_118 = src_118Row.id;

  let src_119Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:Dynastes_hercules_ecuatorianus_MHNT.jpg" }).onConflictDoNothing().returning())[0];
  if (!src_119Row) {
    [src_119Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:Dynastes_hercules_ecuatorianus_MHNT.jpg"));
  }
  const src_119 = src_119Row.id;

  let src_120Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:Dynastes_hercules_(female).jpg" }).onConflictDoNothing().returning())[0];
  if (!src_120Row) {
    [src_120Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:Dynastes_hercules_(female).jpg"));
  }
  const src_120 = src_120Row.id;

  let src_121Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:Megasoma_acteon_MHNT_male.jpg" }).onConflictDoNothing().returning())[0];
  if (!src_121Row) {
    [src_121Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:Megasoma_acteon_MHNT_male.jpg"));
  }
  const src_121 = src_121Row.id;

  let src_122Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:Megasoma_actaeon_Brazil.jpg" }).onConflictDoNothing().returning())[0];
  if (!src_122Row) {
    [src_122Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:Megasoma_actaeon_Brazil.jpg"));
  }
  const src_122 = src_122Row.id;

  let [atpl_144Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Dieta larval"), eq(attributeTemplateTable.unit, "")));
  if (!atpl_144Row) {
    [atpl_144Row] = await db.insert(attributeTemplateTable).values({ label: "Dieta larval", unit: "" }).returning();
  }
  const atpl_144 = atpl_144Row.id;

  let [atpl_145Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Dieta adulta"), eq(attributeTemplateTable.unit, "")));
  if (!atpl_145Row) {
    [atpl_145Row] = await db.insert(attributeTemplateTable).values({ label: "Dieta adulta", unit: "" }).returning();
  }
  const atpl_145 = atpl_145Row.id;

  let [atpl_146Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Função do chifre"), eq(attributeTemplateTable.unit, "")));
  if (!atpl_146Row) {
    [atpl_146Row] = await db.insert(attributeTemplateTable).values({ label: "Função do chifre", unit: "" }).returning();
  }
  const atpl_146 = atpl_146Row.id;

  let [atpl_147Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Diversidade conhecida"), eq(attributeTemplateTable.unit, "species")));
  if (!atpl_147Row) {
    [atpl_147Row] = await db.insert(attributeTemplateTable).values({ label: "Diversidade conhecida", unit: "species" }).returning();
  }
  const atpl_147 = atpl_147Row.id;

  let [atpl_148Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Distribuição do gênero Megasoma"), eq(attributeTemplateTable.unit, "")));
  if (!atpl_148Row) {
    [atpl_148Row] = await db.insert(attributeTemplateTable).values({ label: "Distribuição do gênero Megasoma", unit: "" }).returning();
  }
  const atpl_148 = atpl_148Row.id;

  await db.insert(attributeTable).values([
    { species: species_besouro_chifre.id, attribute: atpl_7, value: "more than 15", sourceId: src_116 },
    { species: species_besouro_chifre.id, attribute: atpl_144, value: "rotten wood", sourceId: src_116 },
    { species: species_besouro_chifre.id, attribute: atpl_145, value: "nectar, plant sap and fruit", sourceId: src_116 },
    { species: species_besouro_chifre.id, attribute: atpl_146, value: "male fighting and digging", sourceId: src_116 },
    { species: species_besouro_chifre.id, attribute: atpl_147, value: "over 1500", sourceId: src_116 },
    { species: species_besouro_chifre.id, attribute: atpl_148, value: "Bolivia, Brazil, Colombia, Ecuador, French Guiana, Guyana, Panama, Peru, Suriname and Venezuela", sourceId: src_117 },
  ]);

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "besouro-de-chifre", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_besouro_chifre.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "besouro-rinoceronte", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_besouro_chifre.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "besouro-escaravelho", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_besouro_chifre.id, popularNameId: pn.id });
  }

  function buildSourceIds_besouro_chifre() {
    return { "wikipedia-dynastinae": src_116, "wikipedia-actaeon-beetle": src_117, "andreazze-motta-2002": src_118, "wikimedia-dynastes-hercules-male": src_119, "wikimedia-dynastes-hercules-female": src_120, "wikimedia-megasoma-actaeon-male": src_121, "wikimedia-megasoma-actaeon-brazil": src_122 };
  }
  const content_besouro_chifre = buildArticleContent_besouro_chifre(buildSourceIds_besouro_chifre());
  const [article_besouro_chifre] = await db
    .insert(articleTable)
    .values({ species: species_besouro_chifre.id, content: content_besouro_chifre })
    .returning();

  await db.insert(imageTable).values([
    { url: "https://upload.wikimedia.org/wikipedia/commons/0/0e/Dynastes_hercules_ecuatorianus_MHNT.jpg", alt: "Macho de Dynastes hercules com chifres cefálico e torácico bem desenvolvidos, espécime do Muséum de Toulouse", article: article_besouro_chifre.id, type: "online", source: "upload.wikimedia.org", credit: "Didier Descouens (CC BY-SA 4.0)" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/d/d0/Dynastes_hercules_%28female%29.jpg", alt: "Fêmea de Dynastes hercules, sem chifres, fotografada em Cahuita, Costa Rica", article: article_besouro_chifre.id, type: "online", source: "upload.wikimedia.org", credit: "Hans Hillewaert (CC BY-SA 4.0)" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Megasoma_acteon_MHNT_male.jpg", alt: "Macho de Megasoma actaeon com chifres no pronoto e na cabeça, espécime coletado na Guiana Francesa", article: article_besouro_chifre.id, type: "online", source: "upload.wikimedia.org", credit: "Didier Descouens (CC BY-SA 4.0)" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/b/b6/Megasoma_actaeon_Brazil.jpg", alt: "Espécime de Megasoma actaeon proveniente do Brasil", article: article_besouro_chifre.id, type: "online", source: "upload.wikimedia.org", credit: "Yug (CC BY-SA 3.0 / GFDL)" },
  ]);

  await db.insert(articleSourcesPivotTable).values([
    { articleId: article_besouro_chifre.id, sourceId: src_118 },
    { articleId: article_besouro_chifre.id, sourceId: src_117 },
    { articleId: article_besouro_chifre.id, sourceId: src_116 },
  ]);

  const [specimen_besouro_chifre] = await db
    .insert(specimenTable)
    .values({ code: "CPINHEXA15", lot: 15, shelf: 2, createdBy: user.id, speciesId: species_besouro_chifre.id })
    .returning();
  // ---- lagarta-borboleta (Heliconius erato phyllis) ----

  const [tax_104Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Família", labelValue: "nymphalidae", parent: tax_84, createdBy: user.id })
    .returning();
  const tax_104 = tax_104Row.id;

  const [tax_105Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Gênero", labelValue: "heliconius", parent: tax_104, createdBy: user.id })
    .returning();
  const tax_105 = tax_105Row.id;

  const [tax_106Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Espécie", labelValue: "heliconius erato", parent: tax_105, createdBy: user.id })
    .returning();
  const tax_106 = tax_106Row.id;

  const [tax_107Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Subespécie", labelValue: "heliconius erato phyllis", parent: tax_106, createdBy: user.id })
    .returning();
  const tax_107 = tax_107Row.id;

  const [species_lagarta_borboleta] = await db
    .insert(speciesTable)
    .values({ speciesRoot: tax_107, createdBy: user.id })
    .returning();

  let src_123Row = (await db.insert(sourceTable).values({ url: "https://en.wikipedia.org/wiki/Heliconius_erato" }).onConflictDoNothing().returning())[0];
  if (!src_123Row) {
    [src_123Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://en.wikipedia.org/wiki/Heliconius_erato"));
  }
  const src_123 = src_123Row.id;

  let src_124Row = (await db.insert(sourceTable).values({ url: "https://en.wikipedia.org/wiki/Heliconius_erato_phyllis" }).onConflictDoNothing().returning())[0];
  if (!src_124Row) {
    [src_124Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://en.wikipedia.org/wiki/Heliconius_erato_phyllis"));
  }
  const src_124 = src_124Row.id;

  let src_125Row = (await db.insert(sourceTable).values({ url: "https://www.scielo.br/j/rbzool/a/qcHLfJFwhGLf8jNZzKrHdvG/?lang=pt" }).onConflictDoNothing().returning())[0];
  if (!src_125Row) {
    [src_125Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://www.scielo.br/j/rbzool/a/qcHLfJFwhGLf8jNZzKrHdvG/?lang=pt"));
  }
  const src_125 = src_125Row.id;

  let [atpl_149Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Envergadura (adulto)"), eq(attributeTemplateTable.unit, "centimeter")));
  if (!atpl_149Row) {
    [atpl_149Row] = await db.insert(attributeTemplateTable).values({ label: "Envergadura (adulto)", unit: "centimeter" }).returning();
  }
  const atpl_149 = atpl_149Row.id;

  let [atpl_150Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Coloração da lagarta (último ínstar)"), eq(attributeTemplateTable.unit, "")));
  if (!atpl_150Row) {
    [atpl_150Row] = await db.insert(attributeTemplateTable).values({ label: "Coloração da lagarta (último ínstar)", unit: "" }).returning();
  }
  const atpl_150 = atpl_150Row.id;

  let [atpl_151Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Planta hospedeira"), eq(attributeTemplateTable.unit, "")));
  if (!atpl_151Row) {
    [atpl_151Row] = await db.insert(attributeTemplateTable).values({ label: "Planta hospedeira", unit: "" }).returning();
  }
  const atpl_151 = atpl_151Row.id;

  let [atpl_152Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Mimetismo mülleriano"), eq(attributeTemplateTable.unit, "")));
  if (!atpl_152Row) {
    [atpl_152Row] = await db.insert(attributeTemplateTable).values({ label: "Mimetismo mülleriano", unit: "" }).returning();
  }
  const atpl_152 = atpl_152Row.id;

  let [atpl_153Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Toxicidade"), eq(attributeTemplateTable.unit, "")));
  if (!atpl_153Row) {
    [atpl_153Row] = await db.insert(attributeTemplateTable).values({ label: "Toxicidade", unit: "" }).returning();
  }
  const atpl_153 = atpl_153Row.id;

  let [atpl_154Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Distribuição da subespécie (H. e. phyllis)"), eq(attributeTemplateTable.unit, "")));
  if (!atpl_154Row) {
    [atpl_154Row] = await db.insert(attributeTemplateTable).values({ label: "Distribuição da subespécie (H. e. phyllis)", unit: "" }).returning();
  }
  const atpl_154 = atpl_154Row.id;

  await db.insert(attributeTable).values([
    { species: species_lagarta_borboleta.id, attribute: atpl_149, value: "6.7-8.0", sourceId: src_123 },
    { species: species_lagarta_borboleta.id, attribute: atpl_150, value: "corpo branco com manchas pretas e laranjas, espinhos pretos e cabeça amarela", sourceId: src_123 },
    { species: species_lagarta_borboleta.id, attribute: atpl_151, value: "Passiflora (ex.: P. misera, P. suberosa, P. actinia)", sourceId: src_123 },
    { species: species_lagarta_borboleta.id, attribute: atpl_152, value: "compartilha o padrão de coloração com pelo menos 20 das 27 subespécies de Heliconius melpomene", sourceId: src_123 },
    { species: species_lagarta_borboleta.id, attribute: atpl_153, value: "acumula glicosídeos cianogênicos obtidos da planta hospedeira, tornando-se desagradável a predadores", sourceId: src_123 },
    { species: species_lagarta_borboleta.id, attribute: atpl_154, value: "Brasil (ao sul da bacia Amazônica, Mata Atlântica e Mato Grosso), Paraguai, Uruguai, norte da Argentina e Bolívia", sourceId: src_124 },
  ]);

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "maria-boba", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_lagarta_borboleta.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "red postman", origin: "en" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_lagarta_borboleta.id, popularNameId: pn.id });
  }

  function buildSourceIds_lagarta_borboleta() {
    return { "wikipedia-heliconius-erato": src_123, "wikipedia-heliconius-erato-phyllis": src_124, "scielo-kaminski-erato-phyllis": src_125 };
  }
  const content_lagarta_borboleta = buildArticleContent_lagarta_borboleta(buildSourceIds_lagarta_borboleta());
  const [article_lagarta_borboleta] = await db
    .insert(articleTable)
    .values({ species: species_lagarta_borboleta.id, content: content_lagarta_borboleta })
    .returning();

  await db.insert(imageTable).values([
    { url: "https://upload.wikimedia.org/wikipedia/commons/b/be/Heliconius_erato_caterpillar.jpg", alt: "Lagarta de quinto ínstar de Heliconius erato, fotografada em Porto Alegre, Brasil", article: article_lagarta_borboleta.id, type: "online", source: "upload.wikimedia.org", credit: "Leonardo Ré-Jorge (CC BY-SA 4.0)" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/8/81/Heliconius_erato_caterpillar2.jpg", alt: "Lagarta de quinto ínstar de Heliconius erato, corpo branco com manchas pretas e laranjas e espinhos escuros", article: article_lagarta_borboleta.id, type: "online", source: "upload.wikimedia.org", credit: "Leonardo Ré-Jorge (CC BY-SA 4.0)" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/e/ea/Heliconius_erato_Richard_Bartz.jpg", alt: "Borboleta adulta de Heliconius erato petiverana, com asas vermelhas, pretas e brancas", article: article_lagarta_borboleta.id, type: "online", source: "upload.wikimedia.org", credit: "Richard Bartz (CC BY-SA 2.5)" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/f/f8/Red_postman_butterfly_%28Heliconius_erato%29.jpg", alt: "Borboleta adulta de Heliconius erato (red postman) pousada em uma flor em Trinidad", article: article_lagarta_borboleta.id, type: "online", source: "upload.wikimedia.org", credit: "Charles J. Sharp (CC BY-SA 4.0)" },
  ]);

  await db.insert(articleSourcesPivotTable).values([
    { articleId: article_lagarta_borboleta.id, sourceId: src_123 },
    { articleId: article_lagarta_borboleta.id, sourceId: src_124 },
    { articleId: article_lagarta_borboleta.id, sourceId: src_125 },
  ]);

  const [specimen_lagarta_borboleta] = await db
    .insert(specimenTable)
    .values({ code: "CPINHEXA16", lot: 16, shelf: 2, createdBy: user.id, speciesId: species_lagarta_borboleta.id })
    .returning();
  // ---- besouros (Macrodontia cervicornis) ----

  const [tax_108Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Família", labelValue: "cerambycidae", parent: tax_66, createdBy: user.id })
    .returning();
  const tax_108 = tax_108Row.id;

  const [tax_109Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Subfamília", labelValue: "prioninae", parent: tax_108, createdBy: user.id })
    .returning();
  const tax_109 = tax_109Row.id;

  const [tax_110Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Gênero", labelValue: "macrodontia", parent: tax_109, createdBy: user.id })
    .returning();
  const tax_110 = tax_110Row.id;

  const [tax_111Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Espécie", labelValue: "macrodontia cervicornis", parent: tax_110, createdBy: user.id })
    .returning();
  const tax_111 = tax_111Row.id;

  const [species_besouros] = await db
    .insert(speciesTable)
    .values({ speciesRoot: tax_111, createdBy: user.id })
    .returning();

  let src_126Row = (await db.insert(sourceTable).values({ url: "https://en.wikipedia.org/wiki/Macrodontia_cervicornis" }).onConflictDoNothing().returning())[0];
  if (!src_126Row) {
    [src_126Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://en.wikipedia.org/wiki/Macrodontia_cervicornis"));
  }
  const src_126 = src_126Row.id;

  let src_127Row = (await db.insert(sourceTable).values({ url: "https://pt.wikipedia.org/wiki/Macrodontia_cervicornis" }).onConflictDoNothing().returning())[0];
  if (!src_127Row) {
    [src_127Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://pt.wikipedia.org/wiki/Macrodontia_cervicornis"));
  }
  const src_127 = src_127Row.id;

  let [atpl_155Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Comprimento máximo registrado"), eq(attributeTemplateTable.unit, "centimeter")));
  if (!atpl_155Row) {
    [atpl_155Row] = await db.insert(attributeTemplateTable).values({ label: "Comprimento máximo registrado", unit: "centimeter" }).returning();
  }
  const atpl_155 = atpl_155Row.id;

  let [atpl_156Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Duração da fase larval"), eq(attributeTemplateTable.unit, "year")));
  if (!atpl_156Row) {
    [atpl_156Row] = await db.insert(attributeTemplateTable).values({ label: "Duração da fase larval", unit: "year" }).returning();
  }
  const atpl_156 = atpl_156Row.id;

  let [atpl_157Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Comprimento da galeria larval"), eq(attributeTemplateTable.unit, "meter")));
  if (!atpl_157Row) {
    [atpl_157Row] = await db.insert(attributeTemplateTable).values({ label: "Comprimento da galeria larval", unit: "meter" }).returning();
  }
  const atpl_157 = atpl_157Row.id;

  let [atpl_158Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Dimorfismo sexual das mandíbulas"), eq(attributeTemplateTable.unit, "description")));
  if (!atpl_158Row) {
    [atpl_158Row] = await db.insert(attributeTemplateTable).values({ label: "Dimorfismo sexual das mandíbulas", unit: "description" }).returning();
  }
  const atpl_158 = atpl_158Row.id;

  let [atpl_159Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Distribuição geográfica"), eq(attributeTemplateTable.unit, "region")));
  if (!atpl_159Row) {
    [atpl_159Row] = await db.insert(attributeTemplateTable).values({ label: "Distribuição geográfica", unit: "region" }).returning();
  }
  const atpl_159 = atpl_159Row.id;

  await db.insert(attributeTable).values([
    { species: species_besouros.id, attribute: atpl_155, value: "17.7", sourceId: src_126 },
    { species: species_besouros.id, attribute: atpl_156, value: "up to 10", sourceId: src_126 },
    { species: species_besouros.id, attribute: atpl_55, value: "vulnerable", sourceId: src_126 },
    { species: species_besouros.id, attribute: atpl_157, value: "over 1", sourceId: src_126 },
    { species: species_besouros.id, attribute: atpl_158, value: "males have much larger, antler-like serrated mandibles than females", sourceId: src_127 },
    { species: species_besouros.id, attribute: atpl_159, value: "neotropical, from Colombia and the Guianas to southern Brazil (Paraná), including Ecuador, Peru, Bolivia and Venezuela", sourceId: src_127 },
  ]);

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "besouro-serrador-gigante", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_besouros.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "serrador-de-mandíbulas-gigantes", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_besouros.id, popularNameId: pn.id });
  }

  function buildSourceIds_besouros() {
    return { "wikipedia-en-macrodontia": src_126, "wikipedia-pt-macrodontia": src_127 };
  }
  const content_besouros = buildArticleContent_besouros(buildSourceIds_besouros());
  const [article_besouros] = await db
    .insert(articleTable)
    .values({ species: species_besouros.id, content: content_besouros })
    .returning();

  await db.insert(imageTable).values([
    { url: "https://upload.wikimedia.org/wikipedia/commons/4/43/Macrodontia_cervicornis_MHNT.jpg", alt: "Espécime macho dissecado de Macrodontia cervicornis, técnica de desarticulação Beauchene, coleção do Muséum de Toulouse", article: article_besouros.id, type: "online", source: "upload.wikimedia.org", credit: "Didier Descouens (Archaeodontosaurus), CC BY-SA 4.0, Wikimedia Commons" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/0/00/Macrodontia_cervicornis._Male_155_mm.JPG", alt: "Macho de Macrodontia cervicornis de 155 mm, coletado em Loreto Eden, Satipo, Peru", article: article_besouros.id, type: "online", source: "upload.wikimedia.org", credit: "Anaxibia, CC BY-SA 3.0 / GFDL, Wikimedia Commons" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/3/35/Macrodontia_cervicornis._Male_155_mm_2.JPG", alt: "Vista alternativa do macho de Macrodontia cervicornis de 155 mm, Peru", article: article_besouros.id, type: "online", source: "upload.wikimedia.org", credit: "Anaxibia, CC BY-SA 3.0 / GFDL, Wikimedia Commons" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/3/38/Macrodontiacervicornis.JPG", alt: "Espécime preparado de Macrodontia cervicornis, ex coleção Felix Stumpe", article: article_besouros.id, type: "online", source: "upload.wikimedia.org", credit: "Notafly, CC BY-SA 3.0 / GFDL, Wikimedia Commons" },
  ]);

  await db.insert(articleSourcesPivotTable).values([
    { articleId: article_besouros.id, sourceId: src_126 },
    { articleId: article_besouros.id, sourceId: src_127 },
  ]);

  const [specimen_besouros] = await db
    .insert(specimenTable)
    .values({ code: "CPINHEXA17", lot: 17, shelf: 2, createdBy: user.id, speciesId: species_besouros.id })
    .returning();
  // ---- besouro-gorgulho (Sitophilus zeamais) ----

  const [tax_112Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Família", labelValue: "curculionidae", parent: tax_66, createdBy: user.id })
    .returning();
  const tax_112 = tax_112Row.id;

  const [tax_113Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Gênero", labelValue: "sitophilus", parent: tax_112, createdBy: user.id })
    .returning();
  const tax_113 = tax_113Row.id;

  const [tax_114Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Espécie", labelValue: "sitophilus zeamais", parent: tax_113, createdBy: user.id })
    .returning();
  const tax_114 = tax_114Row.id;

  const [species_besouro_gorgulho] = await db
    .insert(speciesTable)
    .values({ speciesRoot: tax_114, createdBy: user.id })
    .returning();

  let src_128Row = (await db.insert(sourceTable).values({ url: "https://en.wikipedia.org/wiki/Sitophilus_zeamais" }).onConflictDoNothing().returning())[0];
  if (!src_128Row) {
    [src_128Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://en.wikipedia.org/wiki/Sitophilus_zeamais"));
  }
  const src_128 = src_128Row.id;

  let src_129Row = (await db.insert(sourceTable).values({ url: "https://pt.wikipedia.org/wiki/Sitophilus_zeamais" }).onConflictDoNothing().returning())[0];
  if (!src_129Row) {
    [src_129Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://pt.wikipedia.org/wiki/Sitophilus_zeamais"));
  }
  const src_129 = src_129Row.id;

  let src_130Row = (await db.insert(sourceTable).values({ url: "https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/541429/1/cir058.pdf" }).onConflictDoNothing().returning())[0];
  if (!src_130Row) {
    [src_130Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/541429/1/cir058.pdf"));
  }
  const src_130 = src_130Row.id;

  let [atpl_160Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Comprimento do corpo"), eq(attributeTemplateTable.unit, "millimeter")));
  if (!atpl_160Row) {
    [atpl_160Row] = await db.insert(attributeTemplateTable).values({ label: "Comprimento do corpo", unit: "millimeter" }).returning();
  }
  const atpl_160 = atpl_160Row.id;

  let [atpl_161Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Coloração"), eq(attributeTemplateTable.unit, "")));
  if (!atpl_161Row) {
    [atpl_161Row] = await db.insert(attributeTemplateTable).values({ label: "Coloração", unit: "" }).returning();
  }
  const atpl_161 = atpl_161Row.id;

  let [atpl_162Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Longevidade do adulto"), eq(attributeTemplateTable.unit, "month")));
  if (!atpl_162Row) {
    [atpl_162Row] = await db.insert(attributeTemplateTable).values({ label: "Longevidade do adulto", unit: "month" }).returning();
  }
  const atpl_162 = atpl_162Row.id;

  let [atpl_163Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Fecundidade por fêmea"), eq(attributeTemplateTable.unit, "egg")));
  if (!atpl_163Row) {
    [atpl_163Row] = await db.insert(attributeTemplateTable).values({ label: "Fecundidade por fêmea", unit: "egg" }).returning();
  }
  const atpl_163 = atpl_163Row.id;

  let [atpl_164Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Duração do desenvolvimento (ovo a adulto)"), eq(attributeTemplateTable.unit, "day")));
  if (!atpl_164Row) {
    [atpl_164Row] = await db.insert(attributeTemplateTable).values({ label: "Duração do desenvolvimento (ovo a adulto)", unit: "day" }).returning();
  }
  const atpl_164 = atpl_164Row.id;

  let [atpl_165Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Alcance de voo"), eq(attributeTemplateTable.unit, "meter")));
  if (!atpl_165Row) {
    [atpl_165Row] = await db.insert(attributeTemplateTable).values({ label: "Alcance de voo", unit: "meter" }).returning();
  }
  const atpl_165 = atpl_165Row.id;

  await db.insert(attributeTable).values([
    { species: species_besouro_gorgulho.id, attribute: atpl_160, value: "2.3-4.9", sourceId: src_128 },
    { species: species_besouro_gorgulho.id, attribute: atpl_161, value: "marrom, com quatro manchas marrom-avermelhadas nos élitros", sourceId: src_128 },
    { species: species_besouro_gorgulho.id, attribute: atpl_162, value: "5-8", sourceId: src_128 },
    { species: species_besouro_gorgulho.id, attribute: atpl_163, value: "300-400", sourceId: src_128 },
    { species: species_besouro_gorgulho.id, attribute: atpl_164, value: "36", sourceId: src_128 },
    { species: species_besouro_gorgulho.id, attribute: atpl_165, value: "400", sourceId: src_128 },
  ]);

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "gorgulho-do-milho", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_besouro_gorgulho.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "caruncho-do-milho", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_besouro_gorgulho.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "maize weevil", origin: "en" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_besouro_gorgulho.id, popularNameId: pn.id });
  }

  function buildSourceIds_besouro_gorgulho() {
    return { "wikipedia-en": src_128, "wikipedia-pt": src_129, "embrapa-cir058": src_130 };
  }
  const content_besouro_gorgulho = buildArticleContent_besouro_gorgulho(buildSourceIds_besouro_gorgulho());
  const [article_besouro_gorgulho] = await db
    .insert(articleTable)
    .values({ species: species_besouro_gorgulho.id, content: content_besouro_gorgulho })
    .returning();

  await db.insert(imageTable).values([
    { url: "https://upload.wikimedia.org/wikipedia/commons/e/e8/Maize_Weevil_-_Sitophilus_zeamais_%28side_view%29.jpg", alt: "Vista lateral de um gorgulho-do-milho adulto (Sitophilus zeamais)", article: article_besouro_gorgulho.id, type: "online", source: "upload.wikimedia.org", credit: "Natasha Wright, Florida Department of Agriculture and Consumer Services, Bugwood.org (CC BY 3.0 US)" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/2/2e/Maize_Weevil_-_Sitophilus_zeamais.jpg", alt: "Gorgulho-do-milho adulto (Sitophilus zeamais) visto de cima, sobre grão", article: article_besouro_gorgulho.id, type: "online", source: "upload.wikimedia.org", credit: "Natasha Wright, Florida Department of Agriculture and Consumer Services, Bugwood.org (CC BY 3.0 US)" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/1/1a/Maize_weevil.jpg", alt: "Gorgulho-do-milho (Sitophilus zeamais) sobre grãos de milho armazenados", article: article_besouro_gorgulho.id, type: "online", source: "upload.wikimedia.org", credit: "USDA Agricultural Research Service (domínio público)" },
  ]);

  await db.insert(articleSourcesPivotTable).values([
    { articleId: article_besouro_gorgulho.id, sourceId: src_130 },
    { articleId: article_besouro_gorgulho.id, sourceId: src_128 },
    { articleId: article_besouro_gorgulho.id, sourceId: src_129 },
  ]);

  const [specimen_besouro_gorgulho] = await db
    .insert(specimenTable)
    .values({ code: "CPINHEXA18", lot: 18, shelf: 2, createdBy: user.id, speciesId: species_besouro_gorgulho.id })
    .returning();
  // ---- inseto-aquatico (Ranatra sp.) ----

  const [tax_115Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Subordem", labelValue: "heteroptera", parent: tax_60, createdBy: user.id })
    .returning();
  const tax_115 = tax_115Row.id;

  const [tax_116Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Infraordem", labelValue: "nepomorpha", parent: tax_115, createdBy: user.id })
    .returning();
  const tax_116 = tax_116Row.id;

  const [tax_117Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Família", labelValue: "nepidae", parent: tax_116, createdBy: user.id })
    .returning();
  const tax_117 = tax_117Row.id;

  const [tax_118Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Subfamília", labelValue: "ranatrinae", parent: tax_117, createdBy: user.id })
    .returning();
  const tax_118 = tax_118Row.id;

  const [tax_119Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Gênero", labelValue: "ranatra", parent: tax_118, createdBy: user.id })
    .returning();
  const tax_119 = tax_119Row.id;

  const [species_inseto_aquatico] = await db
    .insert(speciesTable)
    .values({ speciesRoot: tax_119, createdBy: user.id })
    .returning();

  let src_131Row = (await db.insert(sourceTable).values({ url: "https://en.wikipedia.org/wiki/Ranatra" }).onConflictDoNothing().returning())[0];
  if (!src_131Row) {
    [src_131Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://en.wikipedia.org/wiki/Ranatra"));
  }
  const src_131 = src_131Row.id;

  let src_132Row = (await db.insert(sourceTable).values({ url: "https://en.wikipedia.org/wiki/Nepidae" }).onConflictDoNothing().returning())[0];
  if (!src_132Row) {
    [src_132Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://en.wikipedia.org/wiki/Nepidae"));
  }
  const src_132 = src_132Row.id;

  let src_133Row = (await db.insert(sourceTable).values({ url: "https://pt.wikipedia.org/wiki/Nepidae" }).onConflictDoNothing().returning())[0];
  if (!src_133Row) {
    [src_133Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://pt.wikipedia.org/wiki/Nepidae"));
  }
  const src_133 = src_133Row.id;

  let [atpl_166Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Diversidade de Ranatra na América do Sul"), eq(attributeTemplateTable.unit, "species")));
  if (!atpl_166Row) {
    [atpl_166Row] = await db.insert(attributeTemplateTable).values({ label: "Diversidade de Ranatra na América do Sul", unit: "species" }).returning();
  }
  const atpl_166 = atpl_166Row.id;

  let [atpl_167Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Patas anteriores"), eq(attributeTemplateTable.unit, "category")));
  if (!atpl_167Row) {
    [atpl_167Row] = await db.insert(attributeTemplateTable).values({ label: "Patas anteriores", unit: "category" }).returning();
  }
  const atpl_167 = atpl_167Row.id;

  let [atpl_168Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Apêndice caudal"), eq(attributeTemplateTable.unit, "category")));
  if (!atpl_168Row) {
    [atpl_168Row] = await db.insert(attributeTemplateTable).values({ label: "Apêndice caudal", unit: "category" }).returning();
  }
  const atpl_168 = atpl_168Row.id;

  let [atpl_169Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Habitat"), eq(attributeTemplateTable.unit, "category")));
  if (!atpl_169Row) {
    [atpl_169Row] = await db.insert(attributeTemplateTable).values({ label: "Habitat", unit: "category" }).returning();
  }
  const atpl_169 = atpl_169Row.id;

  let [atpl_170Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Dieta"), eq(attributeTemplateTable.unit, "category")));
  if (!atpl_170Row) {
    [atpl_170Row] = await db.insert(attributeTemplateTable).values({ label: "Dieta", unit: "category" }).returning();
  }
  const atpl_170 = atpl_170Row.id;

  await db.insert(attributeTable).values([
    { species: species_inseto_aquatico.id, attribute: atpl_65, value: "2 a 6", sourceId: src_131 },
    { species: species_inseto_aquatico.id, attribute: atpl_166, value: "aproximadamente 50", sourceId: src_131 },
    { species: species_inseto_aquatico.id, attribute: atpl_167, value: "raptoriais, adaptadas para capturar presas", sourceId: src_132 },
    { species: species_inseto_aquatico.id, attribute: atpl_168, value: "par de meias-tubos que formam um sifão respiratório (snorkel)", sourceId: src_132 },
    { species: species_inseto_aquatico.id, attribute: atpl_169, value: "águas estagnadas ou de fluxo lento (lagoas, pântanos, canais e riachos)", sourceId: src_132 },
    { species: species_inseto_aquatico.id, attribute: atpl_170, value: "predador de insetos, girinos e peixes pequenos, capturados com rostro perfurante", sourceId: src_131 },
  ]);

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "lacraia d'água", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_inseto_aquatico.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "bicho-pau-d'água", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_inseto_aquatico.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "escorpião-d'água", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_inseto_aquatico.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "percevejo-d'água-agulha", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_inseto_aquatico.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "water stick insect", origin: "en" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_inseto_aquatico.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "needle bug", origin: "en" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_inseto_aquatico.id, popularNameId: pn.id });
  }

  function buildSourceIds_inseto_aquatico() {
    return { "wikipedia-ranatra-en": src_131, "wikipedia-nepidae-en": src_132, "wikipedia-nepidae-pt": src_133 };
  }
  const content_inseto_aquatico = buildArticleContent_inseto_aquatico(buildSourceIds_inseto_aquatico());
  const [article_inseto_aquatico] = await db
    .insert(articleTable)
    .values({ species: species_inseto_aquatico.id, content: content_inseto_aquatico })
    .returning();

  await db.insert(imageTable).values([
    { url: "https://upload.wikimedia.org/wikipedia/commons/f/f0/Ranatra_jamaicana.jpg", alt: "Exemplar de Ranatra jamaicana visto de perfil, mostrando corpo alongado em forma de bastão e patas anteriores raptoriais", article: article_inseto_aquatico.id, type: "online", source: "upload.wikimedia.org", credit: "Lsf (iNaturalist, usuário lsifer) — CC BY 4.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Waterscorpion_%28Ranatra_sp.%29_%2836746834263%29.jpg", alt: "Percevejo-d'água-agulha (Ranatra sp.) fotografado sobre vegetação, evidenciando o longo sifão respiratório caudal", article: article_inseto_aquatico.id, type: "online", source: "upload.wikimedia.org", credit: "Alejandro Santillana / Insects Unlocked — CC0 1.0 (domínio público)" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/2/2b/2013-05-26_15-12-32-Ranatra.JPG", alt: "Ranatra sp. em repouso, mostrando a silhueta fina e segmentada que lembra um bicho-pau ou uma lacraia aquática", article: article_inseto_aquatico.id, type: "online", source: "upload.wikimedia.org", credit: "Thomas Bresson (ComputerHotline) — CC BY 3.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/7/79/Ranatra_kirkaldyi.jpg", alt: "Ranatra kirkaldyi, espécie do gênero, ilustrando a variação de tamanho e proporção do sifão respiratório dentro do grupo", article: article_inseto_aquatico.id, type: "online", source: "upload.wikimedia.org", credit: "Daniel J. Layton — CC BY 4.0" },
  ]);

  await db.insert(articleSourcesPivotTable).values([
    { articleId: article_inseto_aquatico.id, sourceId: src_132 },
    { articleId: article_inseto_aquatico.id, sourceId: src_131 },
  ]);

  const [specimen_inseto_aquatico] = await db
    .insert(specimenTable)
    .values({ code: "CPINHEXA19", lot: 19, shelf: 2, createdBy: user.id, speciesId: species_inseto_aquatico.id })
    .returning();
  // ---- louva-a-deus (Mantidae) ----

  const [tax_120Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Ordem", labelValue: "mantodea", parent: tax_59, createdBy: user.id })
    .returning();
  const tax_120 = tax_120Row.id;

  const [tax_121Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Família", labelValue: "mantidae", parent: tax_120, createdBy: user.id })
    .returning();
  const tax_121 = tax_121Row.id;

  const [species_louva_a_deus] = await db
    .insert(speciesTable)
    .values({ speciesRoot: tax_121, createdBy: user.id })
    .returning();

  let src_134Row = (await db.insert(sourceTable).values({ url: "https://pt.wikipedia.org/wiki/Mantodea" }).onConflictDoNothing().returning())[0];
  if (!src_134Row) {
    [src_134Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://pt.wikipedia.org/wiki/Mantodea"));
  }
  const src_134 = src_134Row.id;

  let src_135Row = (await db.insert(sourceTable).values({ url: "https://en.wikipedia.org/wiki/Mantis" }).onConflictDoNothing().returning())[0];
  if (!src_135Row) {
    [src_135Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://en.wikipedia.org/wiki/Mantis"));
  }
  const src_135 = src_135Row.id;

  let [atpl_171Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Número de ovos por ooteca"), eq(attributeTemplateTable.unit, "egg")));
  if (!atpl_171Row) {
    [atpl_171Row] = await db.insert(attributeTemplateTable).values({ label: "Número de ovos por ooteca", unit: "egg" }).returning();
  }
  const atpl_171 = atpl_171Row.id;

  let [atpl_172Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Expectativa de vida"), eq(attributeTemplateTable.unit, "month")));
  if (!atpl_172Row) {
    [atpl_172Row] = await db.insert(attributeTemplateTable).values({ label: "Expectativa de vida", unit: "month" }).returning();
  }
  const atpl_172 = atpl_172Row.id;

  let [atpl_173Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Rotação da cabeça"), eq(attributeTemplateTable.unit, "degree")));
  if (!atpl_173Row) {
    [atpl_173Row] = await db.insert(attributeTemplateTable).values({ label: "Rotação da cabeça", unit: "degree" }).returning();
  }
  const atpl_173 = atpl_173Row.id;

  let [atpl_174Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Ommatídios por olho composto"), eq(attributeTemplateTable.unit, "ommatidium")));
  if (!atpl_174Row) {
    [atpl_174Row] = await db.insert(attributeTemplateTable).values({ label: "Ommatídios por olho composto", unit: "ommatidium" }).returning();
  }
  const atpl_174 = atpl_174Row.id;

  let [atpl_175Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Espécies estimadas no Brasil"), eq(attributeTemplateTable.unit, "species")));
  if (!atpl_175Row) {
    [atpl_175Row] = await db.insert(attributeTemplateTable).values({ label: "Espécies estimadas no Brasil", unit: "species" }).returning();
  }
  const atpl_175 = atpl_175Row.id;

  await db.insert(attributeTable).values([
    { species: species_louva_a_deus.id, attribute: atpl_65, value: "0.8-17", sourceId: src_134 },
    { species: species_louva_a_deus.id, attribute: atpl_171, value: "10-400", sourceId: src_134 },
    { species: species_louva_a_deus.id, attribute: atpl_172, value: "12", sourceId: src_134 },
    { species: species_louva_a_deus.id, attribute: atpl_173, value: "180", sourceId: src_135 },
    { species: species_louva_a_deus.id, attribute: atpl_174, value: "10000", sourceId: src_135 },
    { species: species_louva_a_deus.id, attribute: atpl_175, value: "700", sourceId: src_134 },
  ]);

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Louva-a-deus", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_louva_a_deus.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Mantídeo", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_louva_a_deus.id, popularNameId: pn.id });
  }

  function buildSourceIds_louva_a_deus() {
    return { "wikipedia-pt-mantodea": src_134, "wikipedia-en-mantis": src_135 };
  }
  const content_louva_a_deus = buildArticleContent_louva_a_deus(buildSourceIds_louva_a_deus());
  const [article_louva_a_deus] = await db
    .insert(articleTable)
    .values({ species: species_louva_a_deus.id, content: content_louva_a_deus })
    .returning();

  await db.insert(imageTable).values([
    { url: "https://upload.wikimedia.org/wikipedia/commons/3/3f/Close_Up_of_praying_mantis.jpg", alt: "Close-up de um louva-a-deus adulto sobre uma folha verde, mostrando detalhes da cabeça e dos olhos compostos", article: article_louva_a_deus.id, type: "online", source: "upload.wikimedia.org", credit: "Shyamli kashyap, CC BY-SA 4.0, via Wikimedia Commons" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/7/71/Mantide_religiosa_%2829551%29.jpg", alt: "Louva-a-deus da espécie Mantis religiosa, ilustrando a morfologia típica da família Mantidae", article: article_louva_a_deus.id, type: "online", source: "upload.wikimedia.org", credit: "Scarmen, CC BY-SA 3.0, via Wikimedia Commons" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/d/d7/Praying_mantis_at_Wikimania_Paris.jpg", alt: "Louva-a-deus fotografado em ambiente urbano, evidenciando a postura característica das pernas dianteiras raptoriais", article: article_louva_a_deus.id, type: "online", source: "upload.wikimedia.org", credit: "Jberkel, CC0 1.0 Universal, via Wikimedia Commons" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/e/ef/Mantis_collecting_techniques.jpg", alt: "Diagrama ilustrando seis técnicas de coleta de mantódeos em campo, publicado em manual científico sobre a morfologia de Mantodea", article: article_louva_a_deus.id, type: "online", source: "upload.wikimedia.org", credit: "Brannoch SK, Wieland F, Rivera J, Klass K-D, Béthoux O, Svenson GJ, CC BY 3.0, via Wikimedia Commons" },
  ]);

  await db.insert(articleSourcesPivotTable).values([
    { articleId: article_louva_a_deus.id, sourceId: src_134 },
    { articleId: article_louva_a_deus.id, sourceId: src_135 },
  ]);

  const [specimen_louva_a_deus] = await db
    .insert(specimenTable)
    .values({ code: "CPINHEXA20", lot: 20, shelf: 2, createdBy: user.id, speciesId: species_louva_a_deus.id })
    .returning();
  // ---- piolho-de-cobra (Diplopoda) ----

  const [tax_122Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Subfilo", labelValue: "myriapoda", parent: tax_58, createdBy: user.id })
    .returning();
  const tax_122 = tax_122Row.id;

  const [tax_123Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Classe", labelValue: "diplopoda", parent: tax_122, createdBy: user.id })
    .returning();
  const tax_123 = tax_123Row.id;

  const [species_piolho_de_cobra] = await db
    .insert(speciesTable)
    .values({ speciesRoot: tax_123, createdBy: user.id })
    .returning();

  let src_136Row = (await db.insert(sourceTable).values({ url: "https://pt.wikipedia.org/wiki/Diplopoda" }).onConflictDoNothing().returning())[0];
  if (!src_136Row) {
    [src_136Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://pt.wikipedia.org/wiki/Diplopoda"));
  }
  const src_136 = src_136Row.id;

  let src_137Row = (await db.insert(sourceTable).values({ url: "https://api.gbif.org/v1/species/search?q=piolho-de-cobra&limit=20" }).onConflictDoNothing().returning())[0];
  if (!src_137Row) {
    [src_137Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://api.gbif.org/v1/species/search?q=piolho-de-cobra&limit=20"));
  }
  const src_137 = src_137Row.id;

  let src_138Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:A_millipede.jpg" }).onConflictDoNothing().returning())[0];
  if (!src_138Row) {
    [src_138Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:A_millipede.jpg"));
  }
  const src_138 = src_138Row.id;

  let src_139Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:Millipede_in_forest.jpg" }).onConflictDoNothing().returning())[0];
  if (!src_139Row) {
    [src_139Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:Millipede_in_forest.jpg"));
  }
  const src_139 = src_139Row.id;

  let src_140Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:Red_millipede_on_a_rock_in_a_damp_area.jpg" }).onConflictDoNothing().returning())[0];
  if (!src_140Row) {
    [src_140Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:Red_millipede_on_a_rock_in_a_damp_area.jpg"));
  }
  const src_140 = src_140Row.id;

  let src_141Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:A_Coiled_Millipede.jpg" }).onConflictDoNothing().returning())[0];
  if (!src_141Row) {
    [src_141Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:A_Coiled_Millipede.jpg"));
  }
  const src_141 = src_141Row.id;

  let [atpl_176Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Pares de pernas"), eq(attributeTemplateTable.unit, "pair")));
  if (!atpl_176Row) {
    [atpl_176Row] = await db.insert(attributeTemplateTable).values({ label: "Pares de pernas", unit: "pair" }).returning();
  }
  const atpl_176 = atpl_176Row.id;

  let [atpl_177Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Comprimento"), eq(attributeTemplateTable.unit, "millimeter")));
  if (!atpl_177Row) {
    [atpl_177Row] = await db.insert(attributeTemplateTable).values({ label: "Comprimento", unit: "millimeter" }).returning();
  }
  const atpl_177 = atpl_177Row.id;

  let [atpl_178Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Hábito alimentar"), eq(attributeTemplateTable.unit, "none")));
  if (!atpl_178Row) {
    [atpl_178Row] = await db.insert(attributeTemplateTable).values({ label: "Hábito alimentar", unit: "none" }).returning();
  }
  const atpl_178 = atpl_178Row.id;

  let [atpl_179Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Defesa química"), eq(attributeTemplateTable.unit, "none")));
  if (!atpl_179Row) {
    [atpl_179Row] = await db.insert(attributeTemplateTable).values({ label: "Defesa química", unit: "none" }).returning();
  }
  const atpl_179 = atpl_179Row.id;

  let [atpl_180Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Distribuição geográfica"), eq(attributeTemplateTable.unit, "none")));
  if (!atpl_180Row) {
    [atpl_180Row] = await db.insert(attributeTemplateTable).values({ label: "Distribuição geográfica", unit: "none" }).returning();
  }
  const atpl_180 = atpl_180Row.id;

  await db.insert(attributeTable).values([
    { species: species_piolho_de_cobra.id, attribute: atpl_176, value: "34 a 189", sourceId: src_136 },
    { species: species_piolho_de_cobra.id, attribute: atpl_177, value: "2 a 300", sourceId: src_136 },
    { species: species_piolho_de_cobra.id, attribute: atpl_110, value: "preto ou castanho, podendo apresentar padrões aposemáticos", sourceId: src_136 },
    { species: species_piolho_de_cobra.id, attribute: atpl_178, value: "detritívoro, consome folhas podres e matéria vegetal em decomposição", sourceId: src_136 },
    { species: species_piolho_de_cobra.id, attribute: atpl_179, value: "secreta benzoquinonas, fenóis, terpenoides e cianeto de hidrogênio através de ozóporos", sourceId: src_136 },
    { species: species_piolho_de_cobra.id, attribute: atpl_180, value: "presente em todos os continentes, exceto a Antártida", sourceId: src_136 },
  ]);

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "piolho-de-cobra", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_piolho_de_cobra.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "embuá", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_piolho_de_cobra.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "gongolo", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_piolho_de_cobra.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "maria-café", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_piolho_de_cobra.id, popularNameId: pn.id });
  }

  function buildSourceIds_piolho_de_cobra() {
    return { "pt-wikipedia-diplopoda": src_136, "gbif-vernacular-diplopoda": src_137, "wikimedia-a-millipede": src_138, "wikimedia-millipede-forest": src_139, "wikimedia-red-millipede": src_140, "wikimedia-coiled-millipede": src_141 };
  }
  const content_piolho_de_cobra = buildArticleContent_piolho_de_cobra(buildSourceIds_piolho_de_cobra());
  const [article_piolho_de_cobra] = await db
    .insert(articleTable)
    .values({ species: species_piolho_de_cobra.id, content: content_piolho_de_cobra })
    .returning();

  await db.insert(imageTable).values([
    { url: "https://upload.wikimedia.org/wikipedia/commons/2/29/A_millipede.jpg", alt: "Piolho-de-cobra (diplópode) caminhando sobre o solo durante a estação chuvosa", article: article_piolho_de_cobra.id, type: "online", source: "upload.wikimedia.org", credit: "Deborah Tjituka, CC BY-SA 4.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/7/71/Millipede_in_forest.jpg", alt: "Piolho-de-cobra (diplópode) em seu habitat natural na floresta", article: article_piolho_de_cobra.id, type: "online", source: "upload.wikimedia.org", credit: "Anonymous0006, CC0 1.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/d/de/Red_millipede_on_a_rock_in_a_damp_area.jpg", alt: "Piolho-de-cobra (diplópode) de coloração avermelhada sobre uma pedra em área úmida", article: article_piolho_de_cobra.id, type: "online", source: "upload.wikimedia.org", credit: "Tumbuka Arch, CC BY 4.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/4/43/A_Coiled_Millipede.jpg", alt: "Piolho-de-cobra (diplópode) enrolado em espiral como postura de defesa", article: article_piolho_de_cobra.id, type: "online", source: "upload.wikimedia.org", credit: "Shyamli kashyap, CC BY-SA 4.0" },
  ]);

  await db.insert(articleSourcesPivotTable).values([
    { articleId: article_piolho_de_cobra.id, sourceId: src_136 },
    { articleId: article_piolho_de_cobra.id, sourceId: src_137 },
  ]);

  const [specimen_piolho_de_cobra] = await db
    .insert(specimenTable)
    .values({ code: "CPINMYR01", lot: 1, shelf: 3, createdBy: user.id, speciesId: species_piolho_de_cobra.id })
    .returning();
  // ---- lacraia (Scolopendra viridicornis) ----

  const [tax_124Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Classe", labelValue: "chilopoda", parent: tax_122, createdBy: user.id })
    .returning();
  const tax_124 = tax_124Row.id;

  const [tax_125Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Ordem", labelValue: "scolopendromorpha", parent: tax_124, createdBy: user.id })
    .returning();
  const tax_125 = tax_125Row.id;

  const [tax_126Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Família", labelValue: "scolopendridae", parent: tax_125, createdBy: user.id })
    .returning();
  const tax_126 = tax_126Row.id;

  const [tax_127Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Gênero", labelValue: "scolopendra", parent: tax_126, createdBy: user.id })
    .returning();
  const tax_127 = tax_127Row.id;

  const [tax_128Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Espécie", labelValue: "scolopendra viridicornis", parent: tax_127, createdBy: user.id })
    .returning();
  const tax_128 = tax_128Row.id;

  const [species_lacraia] = await db
    .insert(speciesTable)
    .values({ speciesRoot: tax_128, createdBy: user.id })
    .returning();

  let src_142Row = (await db.insert(sourceTable).values({ url: "https://en.wikipedia.org/wiki/Scolopendra_viridicornis" }).onConflictDoNothing().returning())[0];
  if (!src_142Row) {
    [src_142Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://en.wikipedia.org/wiki/Scolopendra_viridicornis"));
  }
  const src_142 = src_142Row.id;

  let src_143Row = (await db.insert(sourceTable).values({ url: "https://pt.wikipedia.org/wiki/Lacraia" }).onConflictDoNothing().returning())[0];
  if (!src_143Row) {
    [src_143Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://pt.wikipedia.org/wiki/Lacraia"));
  }
  const src_143 = src_143Row.id;

  let [atpl_181Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Comprimento"), eq(attributeTemplateTable.unit, "centimeter")));
  if (!atpl_181Row) {
    [atpl_181Row] = await db.insert(attributeTemplateTable).values({ label: "Comprimento", unit: "centimeter" }).returning();
  }
  const atpl_181 = atpl_181Row.id;

  let [atpl_182Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Local de inoculação do veneno"), eq(attributeTemplateTable.unit, "")));
  if (!atpl_182Row) {
    [atpl_182Row] = await db.insert(attributeTemplateTable).values({ label: "Local de inoculação do veneno", unit: "" }).returning();
  }
  const atpl_182 = atpl_182Row.id;

  let [atpl_183Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Comportamento defensivo"), eq(attributeTemplateTable.unit, "")));
  if (!atpl_183Row) {
    [atpl_183Row] = await db.insert(attributeTemplateTable).values({ label: "Comportamento defensivo", unit: "" }).returning();
  }
  const atpl_183 = atpl_183Row.id;

  let [atpl_184Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Composto bioativo do veneno"), eq(attributeTemplateTable.unit, "")));
  if (!atpl_184Row) {
    [atpl_184Row] = await db.insert(attributeTemplateTable).values({ label: "Composto bioativo do veneno", unit: "" }).returning();
  }
  const atpl_184 = atpl_184Row.id;

  let [atpl_185Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Hábito"), eq(attributeTemplateTable.unit, "")));
  if (!atpl_185Row) {
    [atpl_185Row] = await db.insert(attributeTemplateTable).values({ label: "Hábito", unit: "" }).returning();
  }
  const atpl_185 = atpl_185Row.id;

  await db.insert(attributeTable).values([
    { species: species_lacraia.id, attribute: atpl_181, value: "até quase 50", sourceId: src_143 },
    { species: species_lacraia.id, attribute: atpl_20, value: "carnívora — artrópodes e, ocasionalmente, pequenos vertebrados como roedores, sapos, cobras e lagartos", sourceId: src_142 },
    { species: species_lacraia.id, attribute: atpl_182, value: "forcípulas (apêndices modificados na região da cabeça), não na extremidade posterior do corpo", sourceId: src_143 },
    { species: species_lacraia.id, attribute: atpl_183, value: "eleva as pernas terminais para atrair o ataque à extremidade posterior do corpo antes de picar com as forcípulas", sourceId: src_142 },
    { species: species_lacraia.id, attribute: atpl_184, value: "lacraína — peptídeo com efeito antimicrobiano contra bactérias Gram-negativas, usado na medicina popular do nordeste brasileiro", sourceId: src_142 },
    { species: species_lacraia.id, attribute: atpl_185, value: "terrestre e notívago (noturno), abrigando-se sob folhas e cascas de árvores em locais úmidos", sourceId: src_143 },
  ]);

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Lacraia", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_lacraia.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Centopeia-gigante", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_lacraia.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Lacraia-gigante-brasileira", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_lacraia.id, popularNameId: pn.id });
  }

  function buildSourceIds_lacraia() {
    return { "wikipedia-en-scolopendra-viridicornis": src_142, "wikipedia-pt-lacraia": src_143 };
  }
  const content_lacraia = buildArticleContent_lacraia(buildSourceIds_lacraia());
  const [article_lacraia] = await db
    .insert(articleTable)
    .values({ species: species_lacraia.id, content: content_lacraia })
    .returning();

  await db.insert(imageTable).values([
    { url: "https://upload.wikimedia.org/wikipedia/commons/c/c9/Scolopendra_viridicornis.jpg", alt: "Scolopendra viridicornis fotografada em ambiente natural no Mato Grosso, Brasil", article: article_lacraia.id, type: "online", source: "upload.wikimedia.org", credit: "Christopher Borges (CC BY-SA 4.0)" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/0/08/Scolopendra_viridicornis_nigra.jpg", alt: "Scolopendra viridicornis nigra fotografada no Suriname", article: article_lacraia.id, type: "online", source: "upload.wikimedia.org", credit: "Kristof Zyskowski (CC BY 4.0)" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/2/25/Iz_-_Scolopendra_viridicornis_-_GMZ_1.jpg", alt: "Espécime preservado de Scolopendra viridicornis no Grant Museum of Zoology, Londres", article: article_lacraia.id, type: "online", source: "upload.wikimedia.org", credit: "Emőke Dénes (CC BY-SA 4.0 / CC BY-SA 2.5)" },
  ]);

  await db.insert(articleSourcesPivotTable).values([
    { articleId: article_lacraia.id, sourceId: src_142 },
    { articleId: article_lacraia.id, sourceId: src_143 },
  ]);

  const [specimen_lacraia] = await db
    .insert(specimenTable)
    .values({ code: "CPINMYR02", lot: 2, shelf: 3, createdBy: user.id, speciesId: species_lacraia.id })
    .returning();
  // ---- aranhas (Trichonephila clavipes) ----

  const [tax_129Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Classe", labelValue: "arachnida", parent: tax_58, createdBy: user.id })
    .returning();
  const tax_129 = tax_129Row.id;

  const [tax_130Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Ordem", labelValue: "araneae", parent: tax_129, createdBy: user.id })
    .returning();
  const tax_130 = tax_130Row.id;

  const [tax_131Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Família", labelValue: "nephilidae", parent: tax_130, createdBy: user.id })
    .returning();
  const tax_131 = tax_131Row.id;

  const [tax_132Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Gênero", labelValue: "trichonephila", parent: tax_131, createdBy: user.id })
    .returning();
  const tax_132 = tax_132Row.id;

  const [tax_133Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Espécie", labelValue: "trichonephila clavipes", parent: tax_132, createdBy: user.id })
    .returning();
  const tax_133 = tax_133Row.id;

  const [species_aranhas] = await db
    .insert(speciesTable)
    .values({ speciesRoot: tax_133, createdBy: user.id })
    .returning();

  let src_144Row = (await db.insert(sourceTable).values({ url: "https://en.wikipedia.org/wiki/Trichonephila_clavipes" }).onConflictDoNothing().returning())[0];
  if (!src_144Row) {
    [src_144Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://en.wikipedia.org/wiki/Trichonephila_clavipes"));
  }
  const src_144 = src_144Row.id;

  let src_145Row = (await db.insert(sourceTable).values({ url: "https://pt.wikipedia.org/wiki/Trichonephila_clavipes" }).onConflictDoNothing().returning())[0];
  if (!src_145Row) {
    [src_145Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://pt.wikipedia.org/wiki/Trichonephila_clavipes"));
  }
  const src_145 = src_145Row.id;

  let [atpl_186Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Comprimento do corpo (fêmea)"), eq(attributeTemplateTable.unit, "millimeter")));
  if (!atpl_186Row) {
    [atpl_186Row] = await db.insert(attributeTemplateTable).values({ label: "Comprimento do corpo (fêmea)", unit: "millimeter" }).returning();
  }
  const atpl_186 = atpl_186Row.id;

  let [atpl_187Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Comprimento do corpo (macho)"), eq(attributeTemplateTable.unit, "millimeter")));
  if (!atpl_187Row) {
    [atpl_187Row] = await db.insert(attributeTemplateTable).values({ label: "Comprimento do corpo (macho)", unit: "millimeter" }).returning();
  }
  const atpl_187 = atpl_187Row.id;

  let [atpl_188Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Diâmetro máximo da teia"), eq(attributeTemplateTable.unit, "meter")));
  if (!atpl_188Row) {
    [atpl_188Row] = await db.insert(attributeTemplateTable).values({ label: "Diâmetro máximo da teia", unit: "meter" }).returning();
  }
  const atpl_188 = atpl_188Row.id;

  let [atpl_189Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Tipos de seda produzidos"), eq(attributeTemplateTable.unit, "type")));
  if (!atpl_189Row) {
    [atpl_189Row] = await db.insert(attributeTemplateTable).values({ label: "Tipos de seda produzidos", unit: "type" }).returning();
  }
  const atpl_189 = atpl_189Row.id;

  let [atpl_190Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Dieta"), eq(attributeTemplateTable.unit, "diet")));
  if (!atpl_190Row) {
    [atpl_190Row] = await db.insert(attributeTemplateTable).values({ label: "Dieta", unit: "diet" }).returning();
  }
  const atpl_190 = atpl_190Row.id;

  let [atpl_191Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Status de conservação"), eq(attributeTemplateTable.unit, "status")));
  if (!atpl_191Row) {
    [atpl_191Row] = await db.insert(attributeTemplateTable).values({ label: "Status de conservação", unit: "status" }).returning();
  }
  const atpl_191 = atpl_191Row.id;

  await db.insert(attributeTable).values([
    { species: species_aranhas.id, attribute: atpl_186, value: "24 to 40", sourceId: src_144 },
    { species: species_aranhas.id, attribute: atpl_187, value: "approximately 6", sourceId: src_144 },
    { species: species_aranhas.id, attribute: atpl_188, value: "up to 2", sourceId: src_145 },
    { species: species_aranhas.id, attribute: atpl_189, value: "7", sourceId: src_144 },
    { species: species_aranhas.id, attribute: atpl_190, value: "flying insects (butterflies, moths, grasshoppers) and occasionally small birds", sourceId: src_145 },
    { species: species_aranhas.id, attribute: atpl_191, value: "least concern", sourceId: src_144 },
  ]);

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Aranha-de-teia-amarela", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_aranhas.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Aranha-de-fio-de-ouro", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_aranhas.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Golden silk orb-weaver", origin: "en" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_aranhas.id, popularNameId: pn.id });
  }

  function buildSourceIds_aranhas() {
    return { "wikipedia-en-trichonephila-clavipes": src_144, "wikipedia-pt-trichonephila-clavipes": src_145 };
  }
  const content_aranhas = buildArticleContent_aranhas(buildSourceIds_aranhas());
  const [article_aranhas] = await db
    .insert(articleTable)
    .values({ species: species_aranhas.id, content: content_aranhas })
    .returning();

  await db.insert(imageTable).values([
    { url: "https://upload.wikimedia.org/wikipedia/commons/d/d2/Golden_silk_spider_-_Nephila_clavipes.jpg", alt: "Fêmea de Trichonephila clavipes em sua teia", article: article_aranhas.id, type: "online", source: "upload.wikimedia.org", credit: "Stephen Friedt (CC BY-SA 3.0)" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/2/2c/Golden_Silk_Orbweaver_%28Nephila_clavipes%29_%2836337613172%29.jpg", alt: "Aranha-de-teia-amarela adulta sobre a teia", article: article_aranhas.id, type: "online", source: "upload.wikimedia.org", credit: "Andrew Cannizzaro (CC BY 2.0)" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/1/1b/Nephila_clavipes_-_Female_and_Male_Above_Rear.JPG", alt: "Fêmea e macho de Trichonephila clavipes, evidenciando o dimorfismo sexual de tamanho", article: article_aranhas.id, type: "online", source: "upload.wikimedia.org", credit: "Maximus Aurelius (CC BY-SA 3.0)" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/8/82/Aranha-de-fio-de-ouro_%28Trichonephila_clavipes%29.jpg", alt: "Aranha-de-fio-de-ouro fotografada no Brasil", article: article_aranhas.id, type: "online", source: "upload.wikimedia.org", credit: "Piclety (CC BY 4.0)" },
  ]);

  await db.insert(articleSourcesPivotTable).values([
    { articleId: article_aranhas.id, sourceId: src_144 },
    { articleId: article_aranhas.id, sourceId: src_145 },
  ]);

  const [specimen_aranhas] = await db
    .insert(specimenTable)
    .values({ code: "CPINCHE01", lot: 1, shelf: 3, createdBy: user.id, speciesId: species_aranhas.id })
    .returning();
  // ---- aranha-alcapao (Actinopus sp.) ----

  const [tax_134Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Infraordem", labelValue: "mygalomorphae", parent: tax_130, createdBy: user.id })
    .returning();
  const tax_134 = tax_134Row.id;

  const [tax_135Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Família", labelValue: "actinopodidae", parent: tax_134, createdBy: user.id })
    .returning();
  const tax_135 = tax_135Row.id;

  const [tax_136Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Gênero", labelValue: "actinopus", parent: tax_135, createdBy: user.id })
    .returning();
  const tax_136 = tax_136Row.id;

  const [species_aranha_alcapao] = await db
    .insert(speciesTable)
    .values({ speciesRoot: tax_136, createdBy: user.id })
    .returning();

  let src_146Row = (await db.insert(sourceTable).values({ url: "https://pt.wikipedia.org/wiki/Actinopodidae" }).onConflictDoNothing().returning())[0];
  if (!src_146Row) {
    [src_146Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://pt.wikipedia.org/wiki/Actinopodidae"));
  }
  const src_146 = src_146Row.id;

  let src_147Row = (await db.insert(sourceTable).values({ url: "https://en.wikipedia.org/wiki/Actinopus" }).onConflictDoNothing().returning())[0];
  if (!src_147Row) {
    [src_147Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://en.wikipedia.org/wiki/Actinopus"));
  }
  const src_147 = src_147Row.id;

  let src_148Row = (await db.insert(sourceTable).values({ url: "https://en.wikipedia.org/wiki/Actinopodidae" }).onConflictDoNothing().returning())[0];
  if (!src_148Row) {
    [src_148Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://en.wikipedia.org/wiki/Actinopodidae"));
  }
  const src_148 = src_148Row.id;

  let src_149Row = (await db.insert(sourceTable).values({ url: "https://species.wikimedia.org/wiki/Actinopus" }).onConflictDoNothing().returning())[0];
  if (!src_149Row) {
    [src_149Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://species.wikimedia.org/wiki/Actinopus"));
  }
  const src_149 = src_149Row.id;

  let src_150Row = (await db.insert(sourceTable).values({ url: "https://en.wikipedia.org/wiki/Actinopus_pusillus" }).onConflictDoNothing().returning())[0];
  if (!src_150Row) {
    [src_150Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://en.wikipedia.org/wiki/Actinopus_pusillus"));
  }
  const src_150 = src_150Row.id;

  let src_151Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:Actinopus_pusillus_-_Alexandre_S._Michelotto_-_1.jpg" }).onConflictDoNothing().returning())[0];
  if (!src_151Row) {
    [src_151Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:Actinopus_pusillus_-_Alexandre_S._Michelotto_-_1.jpg"));
  }
  const src_151 = src_151Row.id;

  let src_152Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:Koch_1842_Die_Arachniden_fig._753_Actinopus_tarsalis.jpg" }).onConflictDoNothing().returning())[0];
  if (!src_152Row) {
    [src_152Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:Koch_1842_Die_Arachniden_fig._753_Actinopus_tarsalis.jpg"));
  }
  const src_152 = src_152Row.id;

  let [atpl_192Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Distribuição geográfica"), eq(attributeTemplateTable.unit, "n/a")));
  if (!atpl_192Row) {
    [atpl_192Row] = await db.insert(attributeTemplateTable).values({ label: "Distribuição geográfica", unit: "n/a" }).returning();
  }
  const atpl_192 = atpl_192Row.id;

  let [atpl_193Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Número de espécies no gênero"), eq(attributeTemplateTable.unit, "species")));
  if (!atpl_193Row) {
    [atpl_193Row] = await db.insert(attributeTemplateTable).values({ label: "Número de espécies no gênero", unit: "species" }).returning();
  }
  const atpl_193 = atpl_193Row.id;

  let [atpl_194Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Hábito de construção da toca"), eq(attributeTemplateTable.unit, "n/a")));
  if (!atpl_194Row) {
    [atpl_194Row] = await db.insert(attributeTemplateTable).values({ label: "Hábito de construção da toca", unit: "n/a" }).returning();
  }
  const atpl_194 = atpl_194Row.id;

  let [atpl_195Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Estratégia de caça"), eq(attributeTemplateTable.unit, "n/a")));
  if (!atpl_195Row) {
    [atpl_195Row] = await db.insert(attributeTemplateTable).values({ label: "Estratégia de caça", unit: "n/a" }).returning();
  }
  const atpl_195 = atpl_195Row.id;

  let [atpl_196Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Toxicidade da picada"), eq(attributeTemplateTable.unit, "n/a")));
  if (!atpl_196Row) {
    [atpl_196Row] = await db.insert(attributeTemplateTable).values({ label: "Toxicidade da picada", unit: "n/a" }).returning();
  }
  const atpl_196 = atpl_196Row.id;

  await db.insert(attributeTable).values([
    { species: species_aranha_alcapao.id, attribute: atpl_192, value: "américa do sul, principalmente brasil", sourceId: src_147 },
    { species: species_aranha_alcapao.id, attribute: atpl_193, value: "mais de 170", sourceId: src_149 },
    { species: species_aranha_alcapao.id, attribute: atpl_160, value: "10 a 35", sourceId: src_148 },
    { species: species_aranha_alcapao.id, attribute: atpl_194, value: "toca subterrânea coberta com alçapão de seda articulado, podendo atingir até 30 centímetros de profundidade", sourceId: src_148 },
    { species: species_aranha_alcapao.id, attribute: atpl_195, value: "emboscada noturna de insetos próximos à abertura da toca", sourceId: src_148 },
    { species: species_aranha_alcapao.id, attribute: atpl_196, value: "baixa periculosidade para humanos, com registros de picadas sem sintomas relevantes no brasil", sourceId: src_147 },
  ]);

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "aranha-de-alçapão", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_aranha_alcapao.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "aranha-alçapão", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_aranha_alcapao.id, popularNameId: pn.id });
  }

  function buildSourceIds_aranha_alcapao() {
    return { "wikipedia-actinopodidae-pt": src_146, "wikipedia-actinopus-en": src_147, "wikipedia-actinopodidae-en": src_148, "wikispecies-actinopus": src_149, "wikipedia-actinopus-pusillus-en": src_150, "commons-actinopus-pusillus-1": src_151, "commons-koch-actinopus-tarsalis": src_152 };
  }
  const content_aranha_alcapao = buildArticleContent_aranha_alcapao(buildSourceIds_aranha_alcapao());
  const [article_aranha_alcapao] = await db
    .insert(articleTable)
    .values({ species: species_aranha_alcapao.id, content: content_aranha_alcapao })
    .returning();

  await db.insert(imageTable).values([
    { url: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Actinopus_candango_162777075.jpg", alt: "Actinopus candango fotografada no Brasil", article: article_aranha_alcapao.id, type: "online", source: "upload.wikimedia.org", credit: "Mario Barroso, via iNaturalist/Wikimedia Commons, CC BY 4.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/3/3e/Actinopus_candango_259059202.jpg", alt: "Actinopus candango fotografada no Brasil", article: article_aranha_alcapao.id, type: "online", source: "upload.wikimedia.org", credit: "Jean Martins, via iNaturalist/Wikimedia Commons, CC BY 4.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/7/70/Actinopus_pusillus_-_Alexandre_S._Michelotto_-_1.jpg", alt: "Actinopus pusillus fotografada no Espírito Santo, Brasil", article: article_aranha_alcapao.id, type: "online", source: "upload.wikimedia.org", credit: "Alexandre S. Michelotto, via iNaturalist/Wikimedia Commons, CC BY-SA 4.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/c/c3/Koch_1842_Die_Arachniden_fig._753_Actinopus_tarsalis.jpg", alt: "Ilustração histórica de Actinopus tarsalis, espécie-tipo do gênero", article: article_aranha_alcapao.id, type: "online", source: "upload.wikimedia.org", credit: "Carl Ludwig Koch, Die Arachniden (1842), domínio público" },
  ]);

  await db.insert(articleSourcesPivotTable).values([
    { articleId: article_aranha_alcapao.id, sourceId: src_148 },
    { articleId: article_aranha_alcapao.id, sourceId: src_147 },
    { articleId: article_aranha_alcapao.id, sourceId: src_152 },
    { articleId: article_aranha_alcapao.id, sourceId: src_146 },
    { articleId: article_aranha_alcapao.id, sourceId: src_149 },
    { articleId: article_aranha_alcapao.id, sourceId: src_150 },
    { articleId: article_aranha_alcapao.id, sourceId: src_151 },
  ]);

  const [specimen_aranha_alcapao] = await db
    .insert(specimenTable)
    .values({ code: "CPINCHE02", lot: 2, shelf: 3, createdBy: user.id, speciesId: species_aranha_alcapao.id })
    .returning();
  // ---- escorpiao-amarelo (Tityus serrulatus) ----

  const [tax_137Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Ordem", labelValue: "scorpiones", parent: tax_129, createdBy: user.id })
    .returning();
  const tax_137 = tax_137Row.id;

  const [tax_138Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Família", labelValue: "buthidae", parent: tax_137, createdBy: user.id })
    .returning();
  const tax_138 = tax_138Row.id;

  const [tax_139Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Gênero", labelValue: "tityus", parent: tax_138, createdBy: user.id })
    .returning();
  const tax_139 = tax_139Row.id;

  const [tax_140Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Espécie", labelValue: "serrulatus", parent: tax_139, createdBy: user.id })
    .returning();
  const tax_140 = tax_140Row.id;

  const [species_escorpiao_amarelo] = await db
    .insert(speciesTable)
    .values({ speciesRoot: tax_140, createdBy: user.id })
    .returning();

  let src_153Row = (await db.insert(sourceTable).values({ url: "https://pt.wikipedia.org/wiki/Tityus_serrulatus" }).onConflictDoNothing().returning())[0];
  if (!src_153Row) {
    [src_153Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://pt.wikipedia.org/wiki/Tityus_serrulatus"));
  }
  const src_153 = src_153Row.id;

  let src_154Row = (await db.insert(sourceTable).values({ url: "https://en.wikipedia.org/wiki/Tityus_serrulatus" }).onConflictDoNothing().returning())[0];
  if (!src_154Row) {
    [src_154Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://en.wikipedia.org/wiki/Tityus_serrulatus"));
  }
  const src_154 = src_154Row.id;

  let src_155Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:Tityus_serrulatus_(Buthidae)_(22768698194).jpg" }).onConflictDoNothing().returning())[0];
  if (!src_155Row) {
    [src_155Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:Tityus_serrulatus_(Buthidae)_(22768698194).jpg"));
  }
  const src_155 = src_155Row.id;

  let src_156Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:Tityus_serrulatus_-_Vitor_Corr%C3%AAa_Dias_-_344354886.jpeg" }).onConflictDoNothing().returning())[0];
  if (!src_156Row) {
    [src_156Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:Tityus_serrulatus_-_Vitor_Corr%C3%AAa_Dias_-_344354886.jpeg"));
  }
  const src_156 = src_156Row.id;

  let src_157Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:Tityus_serrulatus_260138359.jpg" }).onConflictDoNothing().returning())[0];
  if (!src_157Row) {
    [src_157Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:Tityus_serrulatus_260138359.jpg"));
  }
  const src_157 = src_157Row.id;

  let [atpl_197Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Comprimento máximo"), eq(attributeTemplateTable.unit, "centimeter")));
  if (!atpl_197Row) {
    [atpl_197Row] = await db.insert(attributeTemplateTable).values({ label: "Comprimento máximo", unit: "centimeter" }).returning();
  }
  const atpl_197 = atpl_197Row.id;

  let [atpl_198Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Número de pernas"), eq(attributeTemplateTable.unit, "leg")));
  if (!atpl_198Row) {
    [atpl_198Row] = await db.insert(attributeTemplateTable).values({ label: "Número de pernas", unit: "leg" }).returning();
  }
  const atpl_198 = atpl_198Row.id;

  let [atpl_199Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Filhotes por ninhada"), eq(attributeTemplateTable.unit, "individual")));
  if (!atpl_199Row) {
    [atpl_199Row] = await db.insert(attributeTemplateTable).values({ label: "Filhotes por ninhada", unit: "individual" }).returning();
  }
  const atpl_199 = atpl_199Row.id;

  let [atpl_200Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Taxa de mortalidade (crianças e idosos)"), eq(attributeTemplateTable.unit, "percent")));
  if (!atpl_200Row) {
    [atpl_200Row] = await db.insert(attributeTemplateTable).values({ label: "Taxa de mortalidade (crianças e idosos)", unit: "percent" }).returning();
  }
  const atpl_200 = atpl_200Row.id;

  let [atpl_201Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Casos de picada registrados no Brasil em 2018"), eq(attributeTemplateTable.unit, "case")));
  if (!atpl_201Row) {
    [atpl_201Row] = await db.insert(attributeTemplateTable).values({ label: "Casos de picada registrados no Brasil em 2018", unit: "case" }).returning();
  }
  const atpl_201 = atpl_201Row.id;

  await db.insert(attributeTable).values([
    { species: species_escorpiao_amarelo.id, attribute: atpl_197, value: "7", sourceId: src_153 },
    { species: species_escorpiao_amarelo.id, attribute: atpl_198, value: "8", sourceId: src_154 },
    { species: species_escorpiao_amarelo.id, attribute: atpl_199, value: "20", sourceId: src_153 },
    { species: species_escorpiao_amarelo.id, attribute: atpl_200, value: "1.0 a 2.0", sourceId: src_154 },
    { species: species_escorpiao_amarelo.id, attribute: atpl_201, value: "140000", sourceId: src_154 },
  ]);

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Escorpião-amarelo", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_escorpiao_amarelo.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Brazilian yellow scorpion", origin: "en" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_escorpiao_amarelo.id, popularNameId: pn.id });
  }

  function buildSourceIds_escorpiao_amarelo() {
    return { "wikipedia-pt": src_153, "wikipedia-en": src_154, "commons-peruca": src_155, "commons-vitor-dias": src_156, "commons-marcia-silva": src_157 };
  }
  const content_escorpiao_amarelo = buildArticleContent_escorpiao_amarelo(buildSourceIds_escorpiao_amarelo());
  const [article_escorpiao_amarelo] = await db
    .insert(articleTable)
    .values({ species: species_escorpiao_amarelo.id, content: content_escorpiao_amarelo })
    .returning();

  await db.insert(imageTable).values([
    { url: "https://upload.wikimedia.org/wikipedia/commons/9/99/Tityus_serrulatus_%28Buthidae%29_%2822768698194%29.jpg", alt: "Escorpião-amarelo (Tityus serrulatus) fotografado em Araçatuba, São Paulo", article: article_escorpiao_amarelo.id, type: "online", source: "upload.wikimedia.org", credit: "Foto: José Roberto Peruca, CC BY 2.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/d/d7/Tityus_serrulatus_-_Vitor_Corr%C3%AAa_Dias_-_344354886.jpeg", alt: "Escorpião-amarelo (Tityus serrulatus) fotografado no Espírito Santo", article: article_escorpiao_amarelo.id, type: "online", source: "upload.wikimedia.org", credit: "Foto: Vitor Corrêa Dias (iNaturalist), CC BY 4.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/c/c2/Tityus_serrulatus_260138359.jpg", alt: "Escorpião-amarelo (Tityus serrulatus) exibindo a cauda segmentada característica", article: article_escorpiao_amarelo.id, type: "online", source: "upload.wikimedia.org", credit: "Foto: Márcia Cristina Martins da Silva (iNaturalist), CC BY 4.0" },
  ]);

  await db.insert(articleSourcesPivotTable).values([
    { articleId: article_escorpiao_amarelo.id, sourceId: src_154 },
    { articleId: article_escorpiao_amarelo.id, sourceId: src_153 },
  ]);

  const [specimen_escorpiao_amarelo] = await db
    .insert(specimenTable)
    .values({ code: "CPINCHE03", lot: 3, shelf: 3, createdBy: user.id, speciesId: species_escorpiao_amarelo.id })
    .returning();
  // ---- opiliao (Mischonyx squalidus) ----

  const [tax_141Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Ordem", labelValue: "opiliones", parent: tax_129, createdBy: user.id })
    .returning();
  const tax_141 = tax_141Row.id;

  const [tax_142Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Subordem", labelValue: "laniatores", parent: tax_141, createdBy: user.id })
    .returning();
  const tax_142 = tax_142Row.id;

  const [tax_143Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Família", labelValue: "gonyleptidae", parent: tax_142, createdBy: user.id })
    .returning();
  const tax_143 = tax_143Row.id;

  const [tax_144Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Gênero", labelValue: "mischonyx", parent: tax_143, createdBy: user.id })
    .returning();
  const tax_144 = tax_144Row.id;

  const [tax_145Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Espécie", labelValue: "mischonyx squalidus", parent: tax_144, createdBy: user.id })
    .returning();
  const tax_145 = tax_145Row.id;

  const [species_opiliao] = await db
    .insert(speciesTable)
    .values({ speciesRoot: tax_145, createdBy: user.id })
    .returning();

  let src_158Row = (await db.insert(sourceTable).values({ url: "https://pt.wikipedia.org/wiki/Opiliones" }).onConflictDoNothing().returning())[0];
  if (!src_158Row) {
    [src_158Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://pt.wikipedia.org/wiki/Opiliones"));
  }
  const src_158 = src_158Row.id;

  let src_159Row = (await db.insert(sourceTable).values({ url: "https://en.wikipedia.org/wiki/Opiliones" }).onConflictDoNothing().returning())[0];
  if (!src_159Row) {
    [src_159Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://en.wikipedia.org/wiki/Opiliones"));
  }
  const src_159 = src_159Row.id;

  let src_160Row = (await db.insert(sourceTable).values({ url: "https://en.wikipedia.org/wiki/Gonyleptidae" }).onConflictDoNothing().returning())[0];
  if (!src_160Row) {
    [src_160Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://en.wikipedia.org/wiki/Gonyleptidae"));
  }
  const src_160 = src_160Row.id;

  let src_161Row = (await db.insert(sourceTable).values({ url: "https://www.gbif.org/species/6904308" }).onConflictDoNothing().returning())[0];
  if (!src_161Row) {
    [src_161Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://www.gbif.org/species/6904308"));
  }
  const src_161 = src_161Row.id;

  let src_162Row = (await db.insert(sourceTable).values({ url: "https://api.gbif.org/v1/occurrence/search?taxonKey=6904308&stateProvince=Rio%20de%20Janeiro" }).onConflictDoNothing().returning())[0];
  if (!src_162Row) {
    [src_162Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://api.gbif.org/v1/occurrence/search?taxonKey=6904308&stateProvince=Rio%20de%20Janeiro"));
  }
  const src_162 = src_162Row.id;

  let [atpl_202Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Pares de glândulas odoríferas (ozóporos)"), eq(attributeTemplateTable.unit, "pair")));
  if (!atpl_202Row) {
    [atpl_202Row] = await db.insert(attributeTemplateTable).values({ label: "Pares de glândulas odoríferas (ozóporos)", unit: "pair" }).returning();
  }
  const atpl_202 = atpl_202Row.id;

  let [atpl_203Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Pares de olhos"), eq(attributeTemplateTable.unit, "pair")));
  if (!atpl_203Row) {
    [atpl_203Row] = await db.insert(attributeTemplateTable).values({ label: "Pares de olhos", unit: "pair" }).returning();
  }
  const atpl_203 = atpl_203Row.id;

  let [atpl_204Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Comprimento das pernas em relação ao corpo"), eq(attributeTemplateTable.unit, "")));
  if (!atpl_204Row) {
    [atpl_204Row] = await db.insert(attributeTemplateTable).values({ label: "Comprimento das pernas em relação ao corpo", unit: "" }).returning();
  }
  const atpl_204 = atpl_204Row.id;

  let [atpl_205Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Desenvolvimento da coxa do quarto par de pernas"), eq(attributeTemplateTable.unit, "")));
  if (!atpl_205Row) {
    [atpl_205Row] = await db.insert(attributeTemplateTable).values({ label: "Desenvolvimento da coxa do quarto par de pernas", unit: "" }).returning();
  }
  const atpl_205 = atpl_205Row.id;

  let [atpl_206Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Ocorrências registradas no Rio de Janeiro (GBIF)"), eq(attributeTemplateTable.unit, "occurrence")));
  if (!atpl_206Row) {
    [atpl_206Row] = await db.insert(attributeTemplateTable).values({ label: "Ocorrências registradas no Rio de Janeiro (GBIF)", unit: "occurrence" }).returning();
  }
  const atpl_206 = atpl_206Row.id;

  await db.insert(attributeTable).values([
    { species: species_opiliao.id, attribute: atpl_202, value: "1", sourceId: src_158 },
    { species: species_opiliao.id, attribute: atpl_203, value: "1", sourceId: src_159 },
    { species: species_opiliao.id, attribute: atpl_20, value: "onívora: insetos pequenos, matéria vegetal, fungos e detritos", sourceId: src_159 },
    { species: species_opiliao.id, attribute: atpl_204, value: "excepcionalmente longas, muito maiores que o corpo", sourceId: src_158 },
    { species: species_opiliao.id, attribute: atpl_205, value: "imensamente desenvolvida, superando o escudo dorsal em vista dorsal", sourceId: src_160 },
    { species: species_opiliao.id, attribute: atpl_206, value: "67", sourceId: src_162 },
  ]);

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "opilião", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_opiliao.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "aranha-bode", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_opiliao.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "aranha-alho", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_opiliao.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "bodum", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_opiliao.id, popularNameId: pn.id });
  }

  function buildSourceIds_opiliao() {
    return { "opilioes-wikipedia-pt": src_158, "opiliones-wikipedia-en": src_159, "gonyleptidae-wikipedia-en": src_160, "mischonyx-squalidus-gbif": src_161, "mischonyx-squalidus-gbif-occurrence-rj": src_162 };
  }
  const content_opiliao = buildArticleContent_opiliao(buildSourceIds_opiliao());
  const [article_opiliao] = await db
    .insert(articleTable)
    .values({ species: species_opiliao.id, content: content_opiliao })
    .returning();

  await db.insert(imageTable).values([
    { url: "https://upload.wikimedia.org/wikipedia/commons/0/02/Mischonyx_squalidus_178835025.jpg", alt: "Mischonyx squalidus fotografado no Brasil, mostrando o corpo oval e as pernas longas características dos opiliões", article: article_opiliao.id, type: "online", source: "upload.wikimedia.org", credit: "Douglas (iNaturalist), CC BY 4.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/2/2d/Mischonyx_squalidus_224490889.jpg", alt: "Mischonyx squalidus sobre vegetação em Santa Catarina, Brasil", article: article_opiliao.id, type: "online", source: "upload.wikimedia.org", credit: "Guilherme Thielen (iNaturalist), CC BY 4.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/6/69/Mischonyx_squalidus_-_mirmeleon_-_59731943.jpeg", alt: "Mischonyx squalidus fotografado em São Francisco do Sul, Santa Catarina", article: article_opiliao.id, type: "online", source: "upload.wikimedia.org", credit: "mirmeleon (iNaturalist), CC BY 4.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/c/cf/Mischonyx_squalidus_-_brabuleta_-_252414595.jpeg", alt: "Mischonyx squalidus em folhagem na Praia Grande, Santa Catarina", article: article_opiliao.id, type: "online", source: "upload.wikimedia.org", credit: "brabuleta (iNaturalist), CC0 1.0" },
  ]);

  await db.insert(articleSourcesPivotTable).values([
    { articleId: article_opiliao.id, sourceId: src_162 },
    { articleId: article_opiliao.id, sourceId: src_158 },
    { articleId: article_opiliao.id, sourceId: src_160 },
    { articleId: article_opiliao.id, sourceId: src_159 },
  ]);

  const [specimen_opiliao] = await db
    .insert(specimenTable)
    .values({ code: "CPINCHE04", lot: 4, shelf: 3, createdBy: user.id, speciesId: species_opiliao.id })
    .returning();
  // ---- carrapato-sapo (Amblyomma rotundatum) ----

  const [tax_146Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Ordem", labelValue: "ixodida", parent: tax_129, createdBy: user.id })
    .returning();
  const tax_146 = tax_146Row.id;

  const [tax_147Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Família", labelValue: "ixodidae", parent: tax_146, createdBy: user.id })
    .returning();
  const tax_147 = tax_147Row.id;

  const [tax_148Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Subfamília", labelValue: "amblyomminae", parent: tax_147, createdBy: user.id })
    .returning();
  const tax_148 = tax_148Row.id;

  const [tax_149Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Gênero", labelValue: "amblyomma", parent: tax_148, createdBy: user.id })
    .returning();
  const tax_149 = tax_149Row.id;

  const [tax_150Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Espécie", labelValue: "amblyomma rotundatum", parent: tax_149, createdBy: user.id })
    .returning();
  const tax_150 = tax_150Row.id;

  const [species_carrapato_sapo] = await db
    .insert(speciesTable)
    .values({ speciesRoot: tax_150, createdBy: user.id })
    .returning();

  let src_163Row = (await db.insert(sourceTable).values({ url: "https://pt.wikipedia.org/wiki/Amblyomma_rotundatum" }).onConflictDoNothing().returning())[0];
  if (!src_163Row) {
    [src_163Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://pt.wikipedia.org/wiki/Amblyomma_rotundatum"));
  }
  const src_163 = src_163Row.id;

  let src_164Row = (await db.insert(sourceTable).values({ url: "https://en.wikipedia.org/wiki/Amblyomma" }).onConflictDoNothing().returning())[0];
  if (!src_164Row) {
    [src_164Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://en.wikipedia.org/wiki/Amblyomma"));
  }
  const src_164 = src_164Row.id;

  let src_165Row = (await db.insert(sourceTable).values({ url: "https://pt.wikipedia.org/wiki/Ixodidae" }).onConflictDoNothing().returning())[0];
  if (!src_165Row) {
    [src_165Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://pt.wikipedia.org/wiki/Ixodidae"));
  }
  const src_165 = src_165Row.id;

  let src_166Row = (await db.insert(sourceTable).values({ url: "https://www.gbif.org/species/2184026" }).onConflictDoNothing().returning())[0];
  if (!src_166Row) {
    [src_166Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://www.gbif.org/species/2184026"));
  }
  const src_166 = src_166Row.id;

  let src_167Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:Rhinella_icterica_parasited_by_ticks.jpg" }).onConflictDoNothing().returning())[0];
  if (!src_167Row) {
    [src_167Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:Rhinella_icterica_parasited_by_ticks.jpg"));
  }
  const src_167 = src_167Row.id;

  let src_168Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:Carrapato_Amblyomma.jpg" }).onConflictDoNothing().returning())[0];
  if (!src_168Row) {
    [src_168Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:Carrapato_Amblyomma.jpg"));
  }
  const src_168 = src_168Row.id;

  let [atpl_207Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Reprodução"), eq(attributeTemplateTable.unit, "mode")));
  if (!atpl_207Row) {
    [atpl_207Row] = await db.insert(attributeTemplateTable).values({ label: "Reprodução", unit: "mode" }).returning();
  }
  const atpl_207 = atpl_207Row.id;

  let [atpl_208Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Hospedeiros"), eq(attributeTemplateTable.unit, "type")));
  if (!atpl_208Row) {
    [atpl_208Row] = await db.insert(attributeTemplateTable).values({ label: "Hospedeiros", unit: "type" }).returning();
  }
  const atpl_208 = atpl_208Row.id;

  let [atpl_209Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Distribuição geográfica"), eq(attributeTemplateTable.unit, "range")));
  if (!atpl_209Row) {
    [atpl_209Row] = await db.insert(attributeTemplateTable).values({ label: "Distribuição geográfica", unit: "range" }).returning();
  }
  const atpl_209 = atpl_209Row.id;

  let [atpl_210Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Parasitismo em humanos"), eq(attributeTemplateTable.unit, "status")));
  if (!atpl_210Row) {
    [atpl_210Row] = await db.insert(attributeTemplateTable).values({ label: "Parasitismo em humanos", unit: "status" }).returning();
  }
  const atpl_210 = atpl_210Row.id;

  let [atpl_211Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Escudo dorsal (scutum)"), eq(attributeTemplateTable.unit, "trait")));
  if (!atpl_211Row) {
    [atpl_211Row] = await db.insert(attributeTemplateTable).values({ label: "Escudo dorsal (scutum)", unit: "trait" }).returning();
  }
  const atpl_211 = atpl_211Row.id;

  await db.insert(attributeTable).values([
    { species: species_carrapato_sapo.id, attribute: atpl_207, value: "Partenogênese, com machos extremamente raros na população", sourceId: src_163 },
    { species: species_carrapato_sapo.id, attribute: atpl_208, value: "Ectoparasita de anfíbios e répteis", sourceId: src_163 },
    { species: species_carrapato_sapo.id, attribute: atpl_209, value: "Do sul dos Estados Unidos ao norte da Argentina, incluindo ilhas do Caribe", sourceId: src_166 },
    { species: species_carrapato_sapo.id, attribute: atpl_210, value: "Raro; considerado parasita ocasional do ser humano", sourceId: src_166 },
    { species: species_carrapato_sapo.id, attribute: atpl_211, value: "Presente e rígido, típico dos carrapatos duros (Ixodidae), com capítulo bucal projetado anteriormente", sourceId: src_165 },
  ]);

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "carrapato-de-sapo", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_carrapato_sapo.id, popularNameId: pn.id });
  }

  function buildSourceIds_carrapato_sapo() {
    return { "wiki-pt-rotundatum": src_163, "wiki-en-amblyomma": src_164, "wiki-pt-ixodidae": src_165, "gbif-rotundatum": src_166, "commons-rhinella-ticks": src_167, "commons-amblyomma-genus": src_168 };
  }
  const content_carrapato_sapo = buildArticleContent_carrapato_sapo(buildSourceIds_carrapato_sapo());
  const [article_carrapato_sapo] = await db
    .insert(articleTable)
    .values({ species: species_carrapato_sapo.id, content: content_carrapato_sapo })
    .returning();

  await db.insert(imageTable).values([
    { url: "https://upload.wikimedia.org/wikipedia/commons/d/d8/Rhinella_icterica_parasited_by_ticks.jpg", alt: "Sapo-cururu (Rhinella icterica) parasitado por carrapatos Amblyomma rotundatum", article: article_carrapato_sapo.id, type: "online", source: "upload.wikimedia.org", credit: "CC BY-SA 4.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/a/af/Carrapato_Amblyomma.jpg", alt: "Carrapato do gênero Amblyomma (Amblyomma scalpturatum), ilustrando a morfologia geral do gênero", article: article_carrapato_sapo.id, type: "online", source: "upload.wikimedia.org", credit: "Foto: Juliana Maria Farias, CC BY-SA 4.0" },
  ]);

  await db.insert(articleSourcesPivotTable).values([
    { articleId: article_carrapato_sapo.id, sourceId: src_167 },
    { articleId: article_carrapato_sapo.id, sourceId: src_163 },
    { articleId: article_carrapato_sapo.id, sourceId: src_165 },
    { articleId: article_carrapato_sapo.id, sourceId: src_166 },
    { articleId: article_carrapato_sapo.id, sourceId: src_164 },
  ]);

  const [specimen_carrapato_sapo] = await db
    .insert(specimenTable)
    .values({ code: "CPINCHE05", lot: 5, shelf: 3, createdBy: user.id, speciesId: species_carrapato_sapo.id })
    .returning();
  // ---- carrapato-ave (Argas miniatus) ----

  const [tax_151Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Família", labelValue: "argasidae", parent: tax_146, createdBy: user.id })
    .returning();
  const tax_151 = tax_151Row.id;

  const [tax_152Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Gênero", labelValue: "argas", parent: tax_151, createdBy: user.id })
    .returning();
  const tax_152 = tax_152Row.id;

  const [tax_153Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Espécie", labelValue: "argas miniatus", parent: tax_152, createdBy: user.id })
    .returning();
  const tax_153 = tax_153Row.id;

  const [species_carrapato_ave] = await db
    .insert(speciesTable)
    .values({ speciesRoot: tax_153, createdBy: user.id })
    .returning();

  let src_169Row = (await db.insert(sourceTable).values({ url: "https://pt.wikipedia.org/wiki/Argas_miniatus" }).onConflictDoNothing().returning())[0];
  if (!src_169Row) {
    [src_169Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://pt.wikipedia.org/wiki/Argas_miniatus"));
  }
  const src_169 = src_169Row.id;

  let src_170Row = (await db.insert(sourceTable).values({ url: "https://www.gbif.org/species/2184910" }).onConflictDoNothing().returning())[0];
  if (!src_170Row) {
    [src_170Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://www.gbif.org/species/2184910"));
  }
  const src_170 = src_170Row.id;

  let src_171Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:A_tick_(Argas_miniatus)._Coloured_drawing_by_A.J.E._Terzi._Wellcome_V0022543.jpg" }).onConflictDoNothing().returning())[0];
  if (!src_171Row) {
    [src_171Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:A_tick_(Argas_miniatus)._Coloured_drawing_by_A.J.E._Terzi._Wellcome_V0022543.jpg"));
  }
  const src_171 = src_171Row.id;

  let src_172Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:Carrapato_de_galinha_ventral.jpg" }).onConflictDoNothing().returning())[0];
  if (!src_172Row) {
    [src_172Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:Carrapato_de_galinha_ventral.jpg"));
  }
  const src_172 = src_172Row.id;

  let src_173Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:Carrapato_de_galinha_dorsal.jpg" }).onConflictDoNothing().returning())[0];
  if (!src_173Row) {
    [src_173Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:Carrapato_de_galinha_dorsal.jpg"));
  }
  const src_173 = src_173Row.id;

  let [atpl_212Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Formato do corpo"), eq(attributeTemplateTable.unit, "")));
  if (!atpl_212Row) {
    [atpl_212Row] = await db.insert(attributeTemplateTable).values({ label: "Formato do corpo", unit: "" }).returning();
  }
  const atpl_212 = atpl_212Row.id;

  let [atpl_213Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Hospedeiro principal"), eq(attributeTemplateTable.unit, "")));
  if (!atpl_213Row) {
    [atpl_213Row] = await db.insert(attributeTemplateTable).values({ label: "Hospedeiro principal", unit: "" }).returning();
  }
  const atpl_213 = atpl_213Row.id;

  let [atpl_214Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Ano de descrição"), eq(attributeTemplateTable.unit, "year")));
  if (!atpl_214Row) {
    [atpl_214Row] = await db.insert(attributeTemplateTable).values({ label: "Ano de descrição", unit: "year" }).returning();
  }
  const atpl_214 = atpl_214Row.id;

  let [atpl_215Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Ocorrências registradas no Brasil"), eq(attributeTemplateTable.unit, "record")));
  if (!atpl_215Row) {
    [atpl_215Row] = await db.insert(attributeTemplateTable).values({ label: "Ocorrências registradas no Brasil", unit: "record" }).returning();
  }
  const atpl_215 = atpl_215Row.id;

  await db.insert(attributeTable).values([
    { species: species_carrapato_ave.id, attribute: atpl_160, value: "4-7", sourceId: src_169 },
    { species: species_carrapato_ave.id, attribute: atpl_212, value: "oval, sem escudo dorsal rígido", sourceId: src_169 },
    { species: species_carrapato_ave.id, attribute: atpl_31, value: "hematófago e noturno", sourceId: src_169 },
    { species: species_carrapato_ave.id, attribute: atpl_213, value: "aves domésticas e silvestres", sourceId: src_169 },
    { species: species_carrapato_ave.id, attribute: atpl_214, value: "1844", sourceId: src_169 },
    { species: species_carrapato_ave.id, attribute: atpl_215, value: "27", sourceId: src_170 },
  ]);

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Carrapato de ave", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_carrapato_ave.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Carrapato-de-galinha", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_carrapato_ave.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Percevejo-de-galinha", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_carrapato_ave.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Carrapato-de-galinheiro", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_carrapato_ave.id, popularNameId: pn.id });
  }

  function buildSourceIds_carrapato_ave() {
    return { "pt-wikipedia-argas-miniatus": src_169, "gbif-argas-miniatus": src_170, "commons-terzi-illustration": src_171, "commons-ventral-photo": src_172, "commons-dorsal-photo": src_173 };
  }
  const content_carrapato_ave = buildArticleContent_carrapato_ave(buildSourceIds_carrapato_ave());
  const [article_carrapato_ave] = await db
    .insert(articleTable)
    .values({ species: species_carrapato_ave.id, content: content_carrapato_ave })
    .returning();

  await db.insert(imageTable).values([
    { url: "https://upload.wikimedia.org/wikipedia/commons/a/a5/A_tick_%28Argas_miniatus%29._Coloured_drawing_by_A.J.E._Terzi._Wellcome_V0022543.jpg", alt: "Ilustração colorida de Argas miniatus feita por A.J.E. Terzi", article: article_carrapato_ave.id, type: "online", source: "upload.wikimedia.org", credit: "A.J.E. Terzi / Wellcome Library, London (CC BY 4.0)" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/1/15/Carrapato_de_galinha_ventral.jpg", alt: "Vista ventral de Argas miniatus parasitando galinha", article: article_carrapato_ave.id, type: "online", source: "upload.wikimedia.org", credit: "Jorge Guimarães dos Santos Júnior (Jorgim77), CC BY-SA 4.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/a/ae/Carrapato_de_galinha_dorsal.jpg", alt: "Vista dorsal de Argas miniatus", article: article_carrapato_ave.id, type: "online", source: "upload.wikimedia.org", credit: "Jorge Guimarães dos Santos Júnior (Jorgim77), CC BY-SA 4.0" },
  ]);

  await db.insert(articleSourcesPivotTable).values([
    { articleId: article_carrapato_ave.id, sourceId: src_169 },
    { articleId: article_carrapato_ave.id, sourceId: src_170 },
    { articleId: article_carrapato_ave.id, sourceId: src_171 },
    { articleId: article_carrapato_ave.id, sourceId: src_173 },
    { articleId: article_carrapato_ave.id, sourceId: src_172 },
  ]);

  const [specimen_carrapato_ave] = await db
    .insert(specimenTable)
    .values({ code: "CPINCHE06", lot: 6, shelf: 3, createdBy: user.id, speciesId: species_carrapato_ave.id })
    .returning();
  // ---- carrapato-bovino (Rhipicephalus microplus) ----

  const [tax_154Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Gênero", labelValue: "rhipicephalus", parent: tax_147, createdBy: user.id })
    .returning();
  const tax_154 = tax_154Row.id;

  const [tax_155Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Espécie", labelValue: "rhipicephalus microplus", parent: tax_154, createdBy: user.id })
    .returning();
  const tax_155 = tax_155Row.id;

  const [species_carrapato_bovino] = await db
    .insert(speciesTable)
    .values({ speciesRoot: tax_155, createdBy: user.id })
    .returning();

  let src_174Row = (await db.insert(sourceTable).values({ url: "https://en.wikipedia.org/wiki/Rhipicephalus_microplus" }).onConflictDoNothing().returning())[0];
  if (!src_174Row) {
    [src_174Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://en.wikipedia.org/wiki/Rhipicephalus_microplus"));
  }
  const src_174 = src_174Row.id;

  let src_175Row = (await db.insert(sourceTable).values({ url: "https://pt.wikipedia.org/wiki/Boophilus_microplus" }).onConflictDoNothing().returning())[0];
  if (!src_175Row) {
    [src_175Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://pt.wikipedia.org/wiki/Boophilus_microplus"));
  }
  const src_175 = src_175Row.id;

  let src_176Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:CSIRO_ScienceImage_2842_Cow_infested_with_cattle_tick_Boophilus_microplusI.jpg" }).onConflictDoNothing().returning())[0];
  if (!src_176Row) {
    [src_176Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:CSIRO_ScienceImage_2842_Cow_infested_with_cattle_tick_Boophilus_microplusI.jpg"));
  }
  const src_176 = src_176Row.id;

  let src_177Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:Rhipicephalus-microplus-female-male.jpg" }).onConflictDoNothing().returning())[0];
  if (!src_177Row) {
    [src_177Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:Rhipicephalus-microplus-female-male.jpg"));
  }
  const src_177 = src_177Row.id;

  let src_178Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:One-host-tick-lifecycle.png" }).onConflictDoNothing().returning())[0];
  if (!src_178Row) {
    [src_178Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:One-host-tick-lifecycle.png"));
  }
  const src_178 = src_178Row.id;

  let src_179Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:Rhipicephalus-microplus-larvae-questing.jpg" }).onConflictDoNothing().returning())[0];
  if (!src_179Row) {
    [src_179Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:Rhipicephalus-microplus-larvae-questing.jpg"));
  }
  const src_179 = src_179Row.id;

  let [atpl_216Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Ovos produzidos por postura"), eq(attributeTemplateTable.unit, "egg")));
  if (!atpl_216Row) {
    [atpl_216Row] = await db.insert(attributeTemplateTable).values({ label: "Ovos produzidos por postura", unit: "egg" }).returning();
  }
  const atpl_216 = atpl_216Row.id;

  let [atpl_217Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Taxa de eclosão dos ovos"), eq(attributeTemplateTable.unit, "percent")));
  if (!atpl_217Row) {
    [atpl_217Row] = await db.insert(attributeTemplateTable).values({ label: "Taxa de eclosão dos ovos", unit: "percent" }).returning();
  }
  const atpl_217 = atpl_217Row.id;

  let [atpl_218Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Prevalência em bovinos no Brasil"), eq(attributeTemplateTable.unit, "percent")));
  if (!atpl_218Row) {
    [atpl_218Row] = await db.insert(attributeTemplateTable).values({ label: "Prevalência em bovinos no Brasil", unit: "percent" }).returning();
  }
  const atpl_218 = atpl_218Row.id;

  let [atpl_219Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Perdas econômicas anuais no Brasil"), eq(attributeTemplateTable.unit, "usd")));
  if (!atpl_219Row) {
    [atpl_219Row] = await db.insert(attributeTemplateTable).values({ label: "Perdas econômicas anuais no Brasil", unit: "usd" }).returning();
  }
  const atpl_219 = atpl_219Row.id;

  let [atpl_220Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Amplitude de distribuição latitudinal"), eq(attributeTemplateTable.unit, "degree")));
  if (!atpl_220Row) {
    [atpl_220Row] = await db.insert(attributeTemplateTable).values({ label: "Amplitude de distribuição latitudinal", unit: "degree" }).returning();
  }
  const atpl_220 = atpl_220Row.id;

  await db.insert(attributeTable).values([
    { species: species_carrapato_bovino.id, attribute: atpl_109, value: "65", sourceId: src_174 },
    { species: species_carrapato_bovino.id, attribute: atpl_216, value: "1450", sourceId: src_174 },
    { species: species_carrapato_bovino.id, attribute: atpl_217, value: "83.5", sourceId: src_174 },
    { species: species_carrapato_bovino.id, attribute: atpl_218, value: "80", sourceId: src_174 },
    { species: species_carrapato_bovino.id, attribute: atpl_219, value: "2000000000", sourceId: src_175 },
    { species: species_carrapato_bovino.id, attribute: atpl_220, value: "32", sourceId: src_174 },
  ]);

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "carrapato bovino", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_carrapato_bovino.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "carrapato-do-boi", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_carrapato_bovino.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "carrapato-de-boi", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_carrapato_bovino.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Asian blue tick", origin: "en" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_carrapato_bovino.id, popularNameId: pn.id });
  }

  function buildSourceIds_carrapato_bovino() {
    return { "wikipedia-en": src_174, "wikipedia-pt": src_175, "commons-csiro": src_176, "commons-female-male": src_177, "commons-lifecycle": src_178, "commons-larvae": src_179 };
  }
  const content_carrapato_bovino = buildArticleContent_carrapato_bovino(buildSourceIds_carrapato_bovino());
  const [article_carrapato_bovino] = await db
    .insert(articleTable)
    .values({ species: species_carrapato_bovino.id, content: content_carrapato_bovino })
    .returning();

  await db.insert(imageTable).values([
    { url: "https://upload.wikimedia.org/wikipedia/commons/8/8c/CSIRO_ScienceImage_2842_Cow_infested_with_cattle_tick_Boophilus_microplusI.jpg", alt: "Bovino com infestação intensa de carrapatos Rhipicephalus microplus", article: article_carrapato_bovino.id, type: "online", source: "upload.wikimedia.org", credit: "CSIRO, CC BY 3.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/5/54/Rhipicephalus-microplus-female-male.jpg", alt: "Fêmea e macho de Rhipicephalus microplus lado a lado", article: article_carrapato_bovino.id, type: "online", source: "upload.wikimedia.org", credit: "Alan R Walker, CC BY-SA 3.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/b/b1/One-host-tick-lifecycle.png", alt: "Diagrama do ciclo de vida de hospedeiro único de Rhipicephalus microplus", article: article_carrapato_bovino.id, type: "online", source: "upload.wikimedia.org", credit: "Alan R Walker, CC BY-SA 3.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/6/6c/Rhipicephalus-microplus-larvae-questing.jpg", alt: "Larvas de Rhipicephalus microplus em comportamento de questing", article: article_carrapato_bovino.id, type: "online", source: "upload.wikimedia.org", credit: "Acarologiste, CC BY-SA 4.0" },
  ]);

  await db.insert(articleSourcesPivotTable).values([
    { articleId: article_carrapato_bovino.id, sourceId: src_178 },
    { articleId: article_carrapato_bovino.id, sourceId: src_179 },
    { articleId: article_carrapato_bovino.id, sourceId: src_176 },
    { articleId: article_carrapato_bovino.id, sourceId: src_174 },
    { articleId: article_carrapato_bovino.id, sourceId: src_175 },
    { articleId: article_carrapato_bovino.id, sourceId: src_177 },
  ]);

  const [specimen_carrapato_bovino] = await db
    .insert(specimenTable)
    .values({ code: "CPINCHE07", lot: 7, shelf: 3, createdBy: user.id, speciesId: species_carrapato_bovino.id })
    .returning();
  // ---- carrapato-tamandua (Amblyomma pseudoconcolor) ----

  const [tax_156Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Gênero", labelValue: "amblyomma", parent: tax_147, createdBy: user.id })
    .returning();
  const tax_156 = tax_156Row.id;

  const [tax_157Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Espécie", labelValue: "amblyomma pseudoconcolor", parent: tax_156, createdBy: user.id })
    .returning();
  const tax_157 = tax_157Row.id;

  const [species_carrapato_tamandua] = await db
    .insert(speciesTable)
    .values({ speciesRoot: tax_157, createdBy: user.id })
    .returning();

  let src_180Row = (await db.insert(sourceTable).values({ url: "https://pt.wikipedia.org/wiki/Amblyomma_pseudoconcolor" }).onConflictDoNothing().returning())[0];
  if (!src_180Row) {
    [src_180Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://pt.wikipedia.org/wiki/Amblyomma_pseudoconcolor"));
  }
  const src_180 = src_180Row.id;

  let src_181Row = (await db.insert(sourceTable).values({ url: "https://api.gbif.org/v1/species/2184063" }).onConflictDoNothing().returning())[0];
  if (!src_181Row) {
    [src_181Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://api.gbif.org/v1/species/2184063"));
  }
  const src_181 = src_181Row.id;

  let src_182Row = (await db.insert(sourceTable).values({ url: "https://api.gbif.org/v1/occurrence/1039034528" }).onConflictDoNothing().returning())[0];
  if (!src_182Row) {
    [src_182Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://api.gbif.org/v1/occurrence/1039034528"));
  }
  const src_182 = src_182Row.id;

  let [atpl_221Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Família"), eq(attributeTemplateTable.unit, "none")));
  if (!atpl_221Row) {
    [atpl_221Row] = await db.insert(attributeTemplateTable).values({ label: "Família", unit: "none" }).returning();
  }
  const atpl_221 = atpl_221Row.id;

  let [atpl_222Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Hospedeiro primário"), eq(attributeTemplateTable.unit, "none")));
  if (!atpl_222Row) {
    [atpl_222Row] = await db.insert(attributeTemplateTable).values({ label: "Hospedeiro primário", unit: "none" }).returning();
  }
  const atpl_222 = atpl_222Row.id;

  let [atpl_223Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Hospedeiro silvestre associado"), eq(attributeTemplateTable.unit, "none")));
  if (!atpl_223Row) {
    [atpl_223Row] = await db.insert(attributeTemplateTable).values({ label: "Hospedeiro silvestre associado", unit: "none" }).returning();
  }
  const atpl_223 = atpl_223Row.id;

  let [atpl_224Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Instituição depositária de espécime testemunha"), eq(attributeTemplateTable.unit, "none")));
  if (!atpl_224Row) {
    [atpl_224Row] = await db.insert(attributeTemplateTable).values({ label: "Instituição depositária de espécime testemunha", unit: "none" }).returning();
  }
  const atpl_224 = atpl_224Row.id;

  await db.insert(attributeTable).values([
    { species: species_carrapato_tamandua.id, attribute: atpl_221, value: "Ixodidae (carrapato duro)", sourceId: src_181 },
    { species: species_carrapato_tamandua.id, attribute: atpl_214, value: "1908", sourceId: src_181 },
    { species: species_carrapato_tamandua.id, attribute: atpl_222, value: "tatus (Cingulata)", sourceId: src_180 },
    { species: species_carrapato_tamandua.id, attribute: atpl_223, value: "tamanduá-bandeira (Myrmecophaga tridactyla)", sourceId: src_180 },
    { species: species_carrapato_tamandua.id, attribute: atpl_180, value: "norte da Argentina ao Suriname, incluindo Brasil e Uruguai (região neotropical)", sourceId: src_180 },
    { species: species_carrapato_tamandua.id, attribute: atpl_224, value: "Yale Peabody Museum (YPM ENT 286968)", sourceId: src_182 },
  ]);

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "carrapato de tamanduá", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_carrapato_tamandua.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "carrapato do tatu", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_carrapato_tamandua.id, popularNameId: pn.id });
  }

  function buildSourceIds_carrapato_tamandua() {
    return { "wikipedia-pt-amblyomma-pseudoconcolor": src_180, "gbif-species-amblyomma-pseudoconcolor": src_181, "yale-peabody-museum-ypm286968": src_182 };
  }
  const content_carrapato_tamandua = buildArticleContent_carrapato_tamandua(buildSourceIds_carrapato_tamandua());
  const [article_carrapato_tamandua] = await db
    .insert(articleTable)
    .values({ species: species_carrapato_tamandua.id, content: content_carrapato_tamandua })
    .returning();

  await db.insert(imageTable).values([
    { url: "https://images.collections.yale.edu/iiif/2/ypm:96e3c070-f639-402e-a4de-798b5256ee77/full/full/0/default.jpg", alt: "Espécime de Amblyomma pseudoconcolor (YPM ENT 286968) da coleção entomológica do Yale Peabody Museum", article: article_carrapato_tamandua.id, type: "online", source: "images.collections.yale.edu", credit: "Yale Peabody Museum; foto de Lynn A. Jones, 2011 (CC0)" },
    { url: "https://images.collections.yale.edu/iiif/2/ypm:4f7e3181-b4f5-494a-88e5-9877f65ec43c/full/full/0/default.jpg", alt: "Espécime de Amblyomma pseudoconcolor (YPM ENT 286995) da coleção entomológica do Yale Peabody Museum", article: article_carrapato_tamandua.id, type: "online", source: "images.collections.yale.edu", credit: "Yale Peabody Museum; foto de Lynn A. Jones, 2011 (CC0)" },
    { url: "https://images.collections.yale.edu/iiif/2/ypm:6a362899-128b-4f96-808a-300f2031a8d6/full/full/0/default.jpg", alt: "Espécime de Amblyomma pseudoconcolor (YPM ENT 286976) da coleção entomológica do Yale Peabody Museum", article: article_carrapato_tamandua.id, type: "online", source: "images.collections.yale.edu", credit: "Yale Peabody Museum; foto de Lynn A. Jones, 2011 (CC0)" },
  ]);

  await db.insert(articleSourcesPivotTable).values([
    { articleId: article_carrapato_tamandua.id, sourceId: src_182 },
    { articleId: article_carrapato_tamandua.id, sourceId: src_180 },
    { articleId: article_carrapato_tamandua.id, sourceId: src_181 },
  ]);

  const [specimen_carrapato_tamandua] = await db
    .insert(specimenTable)
    .values({ code: "CPINCHE08", lot: 8, shelf: 3, createdBy: user.id, speciesId: species_carrapato_tamandua.id })
    .returning();
  // ---- ninhada-carrapato (Rhipicephalus sanguineus) ----

  const [tax_158Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Espécie", labelValue: "rhipicephalus sanguineus", parent: tax_154, createdBy: user.id })
    .returning();
  const tax_158 = tax_158Row.id;

  const [species_ninhada_carrapato] = await db
    .insert(speciesTable)
    .values({ speciesRoot: tax_158, createdBy: user.id })
    .returning();

  let src_183Row = (await db.insert(sourceTable).values({ url: "https://pt.wikipedia.org/wiki/Rhipicephalus_sanguineus" }).onConflictDoNothing().returning())[0];
  if (!src_183Row) {
    [src_183Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://pt.wikipedia.org/wiki/Rhipicephalus_sanguineus"));
  }
  const src_183 = src_183Row.id;

  let src_184Row = (await db.insert(sourceTable).values({ url: "https://en.wikipedia.org/wiki/Rhipicephalus_sanguineus" }).onConflictDoNothing().returning())[0];
  if (!src_184Row) {
    [src_184Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://en.wikipedia.org/wiki/Rhipicephalus_sanguineus"));
  }
  const src_184 = src_184Row.id;

  let [atpl_225Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Ovos por postura (diário)"), eq(attributeTemplateTable.unit, "egg")));
  if (!atpl_225Row) {
    [atpl_225Row] = await db.insert(attributeTemplateTable).values({ label: "Ovos por postura (diário)", unit: "egg" }).returning();
  }
  const atpl_225 = atpl_225Row.id;

  let [atpl_226Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Ovos por postura (máximo)"), eq(attributeTemplateTable.unit, "egg")));
  if (!atpl_226Row) {
    [atpl_226Row] = await db.insert(attributeTemplateTable).values({ label: "Ovos por postura (máximo)", unit: "egg" }).returning();
  }
  const atpl_226 = atpl_226Row.id;

  let [atpl_227Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Duração da alimentação larval"), eq(attributeTemplateTable.unit, "day")));
  if (!atpl_227Row) {
    [atpl_227Row] = await db.insert(attributeTemplateTable).values({ label: "Duração da alimentação larval", unit: "day" }).returning();
  }
  const atpl_227 = atpl_227Row.id;

  let [atpl_228Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Sobrevivência de larvas não alimentadas"), eq(attributeTemplateTable.unit, "month")));
  if (!atpl_228Row) {
    [atpl_228Row] = await db.insert(attributeTemplateTable).values({ label: "Sobrevivência de larvas não alimentadas", unit: "month" }).returning();
  }
  const atpl_228 = atpl_228Row.id;

  await db.insert(attributeTable).values([
    { species: species_ninhada_carrapato.id, attribute: atpl_225, value: "2000-3000", sourceId: src_183 },
    { species: species_ninhada_carrapato.id, attribute: atpl_226, value: "7000", sourceId: src_184 },
    { species: species_ninhada_carrapato.id, attribute: atpl_92, value: "17-60", sourceId: src_183 },
    { species: species_ninhada_carrapato.id, attribute: atpl_227, value: "5-15", sourceId: src_184 },
    { species: species_ninhada_carrapato.id, attribute: atpl_125, value: "2.28-3.18", sourceId: src_184 },
    { species: species_ninhada_carrapato.id, attribute: atpl_228, value: "8.5", sourceId: src_183 },
  ]);

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Carrapato-do-cão", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_ninhada_carrapato.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Carrapato-marrom", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_ninhada_carrapato.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Carrapato-vermelho-do-cão", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_ninhada_carrapato.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Brown dog tick", origin: "en" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_ninhada_carrapato.id, popularNameId: pn.id });
  }

  function buildSourceIds_ninhada_carrapato() {
    return { "wikipedia-pt": src_183, "wikipedia-en": src_184 };
  }
  const content_ninhada_carrapato = buildArticleContent_ninhada_carrapato(buildSourceIds_ninhada_carrapato());
  const [article_ninhada_carrapato] = await db
    .insert(articleTable)
    .values({ species: species_ninhada_carrapato.id, content: content_ninhada_carrapato })
    .returning();

  await db.insert(imageTable).values([
    { url: "https://upload.wikimedia.org/wikipedia/commons/8/81/Rhipicephalus_sanguineus.jpg", alt: "Carrapato Rhipicephalus sanguineus visto em detalhe", article: article_ninhada_carrapato.id, type: "online", source: "upload.wikimedia.org", credit: "Alpha.prim~commonswiki, domínio público (EUA)" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/0/05/Rhipicephalus-sanguineus-female-male.jpg", alt: "Comparação dorsal entre fêmea e macho de Rhipicephalus sanguineus", article: article_ninhada_carrapato.id, type: "online", source: "upload.wikimedia.org", credit: "Foto: Daktaridudu, CC BY-SA 4.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/9/9a/Brown_Dog_Tick._Rhipicephalus_sanguineus_-_Flickr_-_gailhampshire.jpg", alt: "Close-up de carrapato-do-cão (Rhipicephalus sanguineus)", article: article_ninhada_carrapato.id, type: "online", source: "upload.wikimedia.org", credit: "Foto: gailhampshire, CC BY 2.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/b/bb/Rhipicephalus-sanguineus-female.JPG", alt: "Fêmea de Rhipicephalus sanguineus em close-up", article: article_ninhada_carrapato.id, type: "online", source: "upload.wikimedia.org", credit: "Foto: Alan R Walker, CC BY-SA 3.0" },
  ]);

  await db.insert(articleSourcesPivotTable).values([
    { articleId: article_ninhada_carrapato.id, sourceId: src_184 },
    { articleId: article_ninhada_carrapato.id, sourceId: src_183 },
  ]);

  const [specimen_ninhada_carrapato] = await db
    .insert(specimenTable)
    .values({ code: "CPINCHE09", lot: 9, shelf: 3, createdBy: user.id, speciesId: species_ninhada_carrapato.id })
    .returning();
  // ---- ninhada-aranha (Lycosa erythrognatha) ----

  const [tax_159Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Família", labelValue: "lycosidae", parent: tax_130, createdBy: user.id })
    .returning();
  const tax_159 = tax_159Row.id;

  const [tax_160Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Gênero", labelValue: "lycosa", parent: tax_159, createdBy: user.id })
    .returning();
  const tax_160 = tax_160Row.id;

  const [tax_161Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Espécie", labelValue: "lycosa erythrognatha", parent: tax_160, createdBy: user.id })
    .returning();
  const tax_161 = tax_161Row.id;

  const [species_ninhada_aranha] = await db
    .insert(speciesTable)
    .values({ speciesRoot: tax_161, createdBy: user.id })
    .returning();

  let src_185Row = (await db.insert(sourceTable).values({ url: "https://pt.wikipedia.org/wiki/Lycosa_erythrognatha" }).onConflictDoNothing().returning())[0];
  if (!src_185Row) {
    [src_185Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://pt.wikipedia.org/wiki/Lycosa_erythrognatha"));
  }
  const src_185 = src_185Row.id;

  let src_186Row = (await db.insert(sourceTable).values({ url: "https://en.wikipedia.org/wiki/Lycosa_erythrognatha" }).onConflictDoNothing().returning())[0];
  if (!src_186Row) {
    [src_186Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://en.wikipedia.org/wiki/Lycosa_erythrognatha"));
  }
  const src_186 = src_186Row.id;

  let src_187Row = (await db.insert(sourceTable).values({ url: "https://pt.wikipedia.org/wiki/Lycosidae" }).onConflictDoNothing().returning())[0];
  if (!src_187Row) {
    [src_187Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://pt.wikipedia.org/wiki/Lycosidae"));
  }
  const src_187 = src_187Row.id;

  let [atpl_229Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Número médio de ovos por postura"), eq(attributeTemplateTable.unit, "egg")));
  if (!atpl_229Row) {
    [atpl_229Row] = await db.insert(attributeTemplateTable).values({ label: "Número médio de ovos por postura", unit: "egg" }).returning();
  }
  const atpl_229 = atpl_229Row.id;

  let [atpl_230Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Longevidade média"), eq(attributeTemplateTable.unit, "year")));
  if (!atpl_230Row) {
    [atpl_230Row] = await db.insert(attributeTemplateTable).values({ label: "Longevidade média", unit: "year" }).returning();
  }
  const atpl_230 = atpl_230Row.id;

  let [atpl_231Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Mudas carregadas no dorso até dispersão"), eq(attributeTemplateTable.unit, "molt")));
  if (!atpl_231Row) {
    [atpl_231Row] = await db.insert(attributeTemplateTable).values({ label: "Mudas carregadas no dorso até dispersão", unit: "molt" }).returning();
  }
  const atpl_231 = atpl_231Row.id;

  let [atpl_232Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Postura associada a risco de morte da fêmea"), eq(attributeTemplateTable.unit, "clutch")));
  if (!atpl_232Row) {
    [atpl_232Row] = await db.insert(attributeTemplateTable).values({ label: "Postura associada a risco de morte da fêmea", unit: "clutch" }).returning();
  }
  const atpl_232 = atpl_232Row.id;

  await db.insert(attributeTable).values([
    { species: species_ninhada_aranha.id, attribute: atpl_7, value: "5", sourceId: src_185 },
    { species: species_ninhada_aranha.id, attribute: atpl_229, value: "800", sourceId: src_185 },
    { species: species_ninhada_aranha.id, attribute: atpl_230, value: "2.5", sourceId: src_185 },
    { species: species_ninhada_aranha.id, attribute: atpl_231, value: "1", sourceId: src_185 },
    { species: species_ninhada_aranha.id, attribute: atpl_232, value: "3", sourceId: src_185 },
  ]);

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "aranha-de-jardim", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_ninhada_aranha.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "aranha-de-grama", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_ninhada_aranha.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "aranha-lobo", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_ninhada_aranha.id, popularNameId: pn.id });
  }

  function buildSourceIds_ninhada_aranha() {
    return { "wikipedia-pt": src_185, "wikipedia-en": src_186, "wikipedia-lycosidae-pt": src_187 };
  }
  const content_ninhada_aranha = buildArticleContent_ninhada_aranha(buildSourceIds_ninhada_aranha());
  const [article_ninhada_aranha] = await db
    .insert(articleTable)
    .values({ species: species_ninhada_aranha.id, content: content_ninhada_aranha })
    .returning();

  await db.insert(imageTable).values([
    { url: "https://upload.wikimedia.org/wikipedia/commons/9/9e/Lycosa_erythrognatha_female_dorsal.jpg", alt: "Vista dorsal de uma fêmea de Lycosa erythrognatha", article: article_ninhada_aranha.id, type: "online", source: "upload.wikimedia.org", credit: "João P. Burini (Techuser), CC BY 4.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/a/aa/Lycosa_erythrognatha.jpg", alt: "Fêmea de Lycosa erythrognatha, aranha-lobo", article: article_ninhada_aranha.id, type: "online", source: "upload.wikimedia.org", credit: "João P. Burini (Techuser), CC BY-SA 3.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/3/30/Lycosa_erythrognatha_display.jpg", alt: "Postura de ameaça defensiva de um macho subadulto de Lycosa erythrognatha", article: article_ninhada_aranha.id, type: "online", source: "upload.wikimedia.org", credit: "João P. Burini (Techuser), CC BY 4.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/f/f2/Lycosa_erythrognatha_-_Carlos_Alexandre_Mattos_Raposo_-_442696806.jpeg", alt: "Lycosa erythrognatha fotografada em São Miguel Arcanjo, São Paulo, Brasil", article: article_ninhada_aranha.id, type: "online", source: "upload.wikimedia.org", credit: "Carlos Alexandre Mattos Raposo, CC BY-SA 4.0" },
  ]);

  await db.insert(articleSourcesPivotTable).values([
    { articleId: article_ninhada_aranha.id, sourceId: src_186 },
    { articleId: article_ninhada_aranha.id, sourceId: src_187 },
    { articleId: article_ninhada_aranha.id, sourceId: src_185 },
  ]);

  const [specimen_ninhada_aranha] = await db
    .insert(specimenTable)
    .values({ code: "CPINCHE10", lot: 10, shelf: 3, createdBy: user.id, speciesId: species_ninhada_aranha.id })
    .returning();
  // ---- lagosta-filtradora (Atya gabonensis) ----

  const [tax_162Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Classe", labelValue: "malacostraca", parent: tax_58, createdBy: user.id })
    .returning();
  const tax_162 = tax_162Row.id;

  const [tax_163Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Ordem", labelValue: "decapoda", parent: tax_162, createdBy: user.id })
    .returning();
  const tax_163 = tax_163Row.id;

  const [tax_164Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Infraordem", labelValue: "caridea", parent: tax_163, createdBy: user.id })
    .returning();
  const tax_164 = tax_164Row.id;

  const [tax_165Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Família", labelValue: "atyidae", parent: tax_164, createdBy: user.id })
    .returning();
  const tax_165 = tax_165Row.id;

  const [tax_166Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Gênero", labelValue: "atya", parent: tax_165, createdBy: user.id })
    .returning();
  const tax_166 = tax_166Row.id;

  const [tax_167Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Espécie", labelValue: "atya gabonensis", parent: tax_166, createdBy: user.id })
    .returning();
  const tax_167 = tax_167Row.id;

  const [species_lagosta_filtradora] = await db
    .insert(speciesTable)
    .values({ speciesRoot: tax_167, createdBy: user.id })
    .returning();

  let src_188Row = (await db.insert(sourceTable).values({ url: "https://pt.wikipedia.org/wiki/Camar%C3%A3o-filtrador-africano" }).onConflictDoNothing().returning())[0];
  if (!src_188Row) {
    [src_188Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://pt.wikipedia.org/wiki/Camar%C3%A3o-filtrador-africano"));
  }
  const src_188 = src_188Row.id;

  let src_189Row = (await db.insert(sourceTable).values({ url: "https://en.wikipedia.org/wiki/Atya_gabonensis" }).onConflictDoNothing().returning())[0];
  if (!src_189Row) {
    [src_189Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://en.wikipedia.org/wiki/Atya_gabonensis"));
  }
  const src_189 = src_189Row.id;

  let src_190Row = (await db.insert(sourceTable).values({ url: "https://en.wikipedia.org/wiki/Atyidae" }).onConflictDoNothing().returning())[0];
  if (!src_190Row) {
    [src_190Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://en.wikipedia.org/wiki/Atyidae"));
  }
  const src_190 = src_190Row.id;

  let [atpl_233Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Comprimento máximo (macho)"), eq(attributeTemplateTable.unit, "centimeter")));
  if (!atpl_233Row) {
    [atpl_233Row] = await db.insert(attributeTemplateTable).values({ label: "Comprimento máximo (macho)", unit: "centimeter" }).returning();
  }
  const atpl_233 = atpl_233Row.id;

  let [atpl_234Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Comprimento máximo (fêmea)"), eq(attributeTemplateTable.unit, "centimeter")));
  if (!atpl_234Row) {
    [atpl_234Row] = await db.insert(attributeTemplateTable).values({ label: "Comprimento máximo (fêmea)", unit: "centimeter" }).returning();
  }
  const atpl_234 = atpl_234Row.id;

  let [atpl_235Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Faixa de temperatura da água"), eq(attributeTemplateTable.unit, "celsius")));
  if (!atpl_235Row) {
    [atpl_235Row] = await db.insert(attributeTemplateTable).values({ label: "Faixa de temperatura da água", unit: "celsius" }).returning();
  }
  const atpl_235 = atpl_235Row.id;

  let [atpl_236Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Faixa de pH da água tolerada"), eq(attributeTemplateTable.unit, "ph")));
  if (!atpl_236Row) {
    [atpl_236Row] = await db.insert(attributeTemplateTable).values({ label: "Faixa de pH da água tolerada", unit: "ph" }).returning();
  }
  const atpl_236 = atpl_236Row.id;

  await db.insert(attributeTable).values([
    { species: species_lagosta_filtradora.id, attribute: atpl_233, value: "14", sourceId: src_188 },
    { species: species_lagosta_filtradora.id, attribute: atpl_234, value: "9", sourceId: src_188 },
    { species: species_lagosta_filtradora.id, attribute: atpl_235, value: "23-29", sourceId: src_189 },
    { species: species_lagosta_filtradora.id, attribute: atpl_236, value: "6.5-7.8", sourceId: src_189 },
    { species: species_lagosta_filtradora.id, attribute: atpl_31, value: "filtrador detritívoro, retira microalgas e matéria orgânica suspensa usando fanões ramificados nas quelas anteriores", sourceId: src_188 },
    { species: species_lagosta_filtradora.id, attribute: atpl_55, value: "pouco preocupante (LC)", sourceId: src_189 },
  ]);

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Lagosta filtradora", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_lagosta_filtradora.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Camarão-filtrador-africano", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_lagosta_filtradora.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Camarão-de-pedra", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_lagosta_filtradora.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Camarão-negro", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_lagosta_filtradora.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Cruca", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_lagosta_filtradora.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Curuca", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_lagosta_filtradora.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Camarão-vampiro", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_lagosta_filtradora.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "African fan shrimp", origin: "en" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_lagosta_filtradora.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Vampire shrimp", origin: "en" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_lagosta_filtradora.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Blue rhino shrimp", origin: "en" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_lagosta_filtradora.id, popularNameId: pn.id });
  }

  function buildSourceIds_lagosta_filtradora() {
    return { "camarao-filtrador-pt-wikipedia": src_188, "atya-gabonensis-en-wikipedia": src_189, "atyidae-en-wikipedia": src_190 };
  }
  const content_lagosta_filtradora = buildArticleContent_lagosta_filtradora(buildSourceIds_lagosta_filtradora());
  const [article_lagosta_filtradora] = await db
    .insert(articleTable)
    .values({ species: species_lagosta_filtradora.id, content: content_lagosta_filtradora })
    .returning();

  await db.insert(imageTable).values([
    { url: "https://upload.wikimedia.org/wikipedia/commons/9/98/Atya_gabonensis_trio.jpg", alt: "Três exemplares de Atya gabonensis mostrando variação de coloração", article: article_lagosta_filtradora.id, type: "online", source: "upload.wikimedia.org", credit: "Ursus sapien (CC BY-SA 3.0)" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/0/03/Atya_gabonensis.JPG", alt: "Exemplar de Atya gabonensis visto de perto, mostrando as quelas anteriores em forma de leque", article: article_lagosta_filtradora.id, type: "online", source: "upload.wikimedia.org", credit: "Citron (CC BY-SA 3.0 / GFDL)" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/0/06/Atyagabonensis.jpg", alt: "Dois exemplares de Atya gabonensis em variações de cor azul e dourada", article: article_lagosta_filtradora.id, type: "online", source: "upload.wikimedia.org", credit: "Citron (CC BY-SA 3.0 / GFDL)" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/3/33/Blaue_Monsterf%C3%A4chergarnele.jpg", alt: "Atya gabonensis de coloração azulada, destacando as quelas filtradoras em formato de leque", article: article_lagosta_filtradora.id, type: "online", source: "upload.wikimedia.org", credit: "Ray eye (CC BY-SA 3.0)" },
  ]);

  await db.insert(articleSourcesPivotTable).values([
    { articleId: article_lagosta_filtradora.id, sourceId: src_188 },
    { articleId: article_lagosta_filtradora.id, sourceId: src_190 },
    { articleId: article_lagosta_filtradora.id, sourceId: src_189 },
  ]);

  const [specimen_lagosta_filtradora] = await db
    .insert(specimenTable)
    .values({ code: "CPINCRU01", lot: 1, shelf: 3, createdBy: user.id, speciesId: species_lagosta_filtradora.id })
    .returning();
  // ---- camarao (Litopenaeus schmitti) ----

  const [tax_168Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Subfilo", labelValue: "crustacea", parent: tax_58, createdBy: user.id })
    .returning();
  const tax_168 = tax_168Row.id;

  const [tax_169Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Classe", labelValue: "malacostraca", parent: tax_168, createdBy: user.id })
    .returning();
  const tax_169 = tax_169Row.id;

  const [tax_170Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Ordem", labelValue: "decapoda", parent: tax_169, createdBy: user.id })
    .returning();
  const tax_170 = tax_170Row.id;

  const [tax_171Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Subordem", labelValue: "dendrobranchiata", parent: tax_170, createdBy: user.id })
    .returning();
  const tax_171 = tax_171Row.id;

  const [tax_172Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Família", labelValue: "penaeidae", parent: tax_171, createdBy: user.id })
    .returning();
  const tax_172 = tax_172Row.id;

  const [tax_173Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Gênero", labelValue: "litopenaeus", parent: tax_172, createdBy: user.id })
    .returning();
  const tax_173 = tax_173Row.id;

  const [tax_174Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Espécie", labelValue: "litopenaeus schmitti", parent: tax_173, createdBy: user.id })
    .returning();
  const tax_174 = tax_174Row.id;

  const [species_camarao] = await db
    .insert(speciesTable)
    .values({ speciesRoot: tax_174, createdBy: user.id })
    .returning();

  let src_191Row = (await db.insert(sourceTable).values({ url: "https://pt.wikipedia.org/wiki/Litopenaeus_schmitti" }).onConflictDoNothing().returning())[0];
  if (!src_191Row) {
    [src_191Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://pt.wikipedia.org/wiki/Litopenaeus_schmitti"));
  }
  const src_191 = src_191Row.id;

  let src_192Row = (await db.insert(sourceTable).values({ url: "https://en.wikipedia.org/wiki/Litopenaeus" }).onConflictDoNothing().returning())[0];
  if (!src_192Row) {
    [src_192Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://en.wikipedia.org/wiki/Litopenaeus"));
  }
  const src_192 = src_192Row.id;

  let src_193Row = (await db.insert(sourceTable).values({ url: "https://www.marinespecies.org/aphia.php?p=taxdetails&id=377457" }).onConflictDoNothing().returning())[0];
  if (!src_193Row) {
    [src_193Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://www.marinespecies.org/aphia.php?p=taxdetails&id=377457"));
  }
  const src_193 = src_193Row.id;

  let src_194Row = (await db.insert(sourceTable).values({ url: "https://api.gbif.org/v1/species/match?name=Litopenaeus%20schmitti&kingdom=Animalia" }).onConflictDoNothing().returning())[0];
  if (!src_194Row) {
    [src_194Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://api.gbif.org/v1/species/match?name=Litopenaeus%20schmitti&kingdom=Animalia"));
  }
  const src_194 = src_194Row.id;

  let src_195Row = (await db.insert(sourceTable).values({ url: "https://www.wikidata.org/wiki/Q6492375" }).onConflictDoNothing().returning())[0];
  if (!src_195Row) {
    [src_195Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://www.wikidata.org/wiki/Q6492375"));
  }
  const src_195 = src_195Row.id;

  let src_196Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:Litopenaeus_schmitti.png" }).onConflictDoNothing().returning())[0];
  if (!src_196Row) {
    [src_196Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:Litopenaeus_schmitti.png"));
  }
  const src_196 = src_196Row.id;

  let src_197Row = (await db.insert(sourceTable).values({ url: "https://www.inaturalist.org/observations/188375985" }).onConflictDoNothing().returning())[0];
  if (!src_197Row) {
    [src_197Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://www.inaturalist.org/observations/188375985"));
  }
  const src_197 = src_197Row.id;

  let [atpl_237Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Distribuição regional ampliada"), eq(attributeTemplateTable.unit, "")));
  if (!atpl_237Row) {
    [atpl_237Row] = await db.insert(attributeTemplateTable).values({ label: "Distribuição regional ampliada", unit: "" }).returning();
  }
  const atpl_237 = atpl_237Row.id;

  let [atpl_238Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Ambiente"), eq(attributeTemplateTable.unit, "")));
  if (!atpl_238Row) {
    [atpl_238Row] = await db.insert(attributeTemplateTable).values({ label: "Ambiente", unit: "" }).returning();
  }
  const atpl_238 = atpl_238Row.id;

  let [atpl_239Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Autoridade e ano de descrição"), eq(attributeTemplateTable.unit, "")));
  if (!atpl_239Row) {
    [atpl_239Row] = await db.insert(attributeTemplateTable).values({ label: "Autoridade e ano de descrição", unit: "" }).returning();
  }
  const atpl_239 = atpl_239Row.id;

  let [atpl_240Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Importância pesqueira"), eq(attributeTemplateTable.unit, "")));
  if (!atpl_240Row) {
    [atpl_240Row] = await db.insert(attributeTemplateTable).values({ label: "Importância pesqueira", unit: "" }).returning();
  }
  const atpl_240 = atpl_240Row.id;

  let [atpl_241Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Registro fotográfico no litoral sudeste"), eq(attributeTemplateTable.unit, "")));
  if (!atpl_241Row) {
    [atpl_241Row] = await db.insert(attributeTemplateTable).values({ label: "Registro fotográfico no litoral sudeste", unit: "" }).returning();
  }
  const atpl_241 = atpl_241Row.id;

  await db.insert(attributeTable).values([
    { species: species_camarao.id, attribute: atpl_73, value: "Ocorre desde as Antilhas até o litoral brasileiro", sourceId: src_191 },
    { species: species_camarao.id, attribute: atpl_237, value: "Caribe, América Central e América do Sul, em águas rasas; alopátrica em relação a Litopenaeus setiferus", sourceId: src_192 },
    { species: species_camarao.id, attribute: atpl_238, value: "Marinho e salobro (estuarino)", sourceId: src_193 },
    { species: species_camarao.id, attribute: atpl_239, value: "Burkenroad, 1936", sourceId: src_193 },
    { species: species_camarao.id, attribute: atpl_240, value: "Importância comercial significativa para comunidades de pescadores artesanais", sourceId: src_191 },
    { species: species_camarao.id, attribute: atpl_241, value: "Fotografado em São Sebastião (SP), próximo ao litoral fluminense, evidenciando ocorrência na região Sudeste do Brasil", sourceId: src_197 },
  ]);

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Camarão-branco", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_camarao.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Camarão legítimo", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_camarao.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Southern white shrimp", origin: "en" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_camarao.id, popularNameId: pn.id });
  }

  function buildSourceIds_camarao() {
    return { "pt-wikipedia-litopenaeus-schmitti": src_191, "en-wikipedia-litopenaeus": src_192, "worms-litopenaeus-schmitti": src_193, "gbif-litopenaeus-schmitti": src_194, "wikidata-litopenaeus-schmitti": src_195, "wikimedia-commons-litopenaeus-schmitti": src_196, "inaturalist-obs-188375985": src_197 };
  }
  const content_camarao = buildArticleContent_camarao(buildSourceIds_camarao());
  const [article_camarao] = await db
    .insert(articleTable)
    .values({ species: species_camarao.id, content: content_camarao })
    .returning();

  await db.insert(imageTable).values([
    { url: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Litopenaeus_schmitti.png", alt: "Ilustração do camarão-branco Litopenaeus schmitti", article: article_camarao.id, type: "online", source: "upload.wikimedia.org", credit: "Clara Costa D'Elia / Rare Brasil (CC BY 4.0)" },
    { url: "https://inaturalist-open-data.s3.amazonaws.com/photos/329678623/large.jpg", alt: "Fotografia de Litopenaeus schmitti (camarão-branco) observado em São Sebastião, SP", article: article_camarao.id, type: "online", source: "inaturalist-open-data.s3.amazonaws.com", credit: "Rafael Rosa (CC BY-SA), via iNaturalist, observação #188375985" },
  ]);

  await db.insert(articleSourcesPivotTable).values([
    { articleId: article_camarao.id, sourceId: src_191 },
    { articleId: article_camarao.id, sourceId: src_193 },
    { articleId: article_camarao.id, sourceId: src_197 },
    { articleId: article_camarao.id, sourceId: src_195 },
    { articleId: article_camarao.id, sourceId: src_192 },
  ]);

  const [specimen_camarao] = await db
    .insert(specimenTable)
    .values({ code: "CPINCRU02", lot: 2, shelf: 3, createdBy: user.id, speciesId: species_camarao.id })
    .returning();
  // ---- siri (Callinectes danae) ----

  const [tax_175Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Família", labelValue: "portunidae", parent: tax_163, createdBy: user.id })
    .returning();
  const tax_175 = tax_175Row.id;

  const [tax_176Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Gênero", labelValue: "callinectes", parent: tax_175, createdBy: user.id })
    .returning();
  const tax_176 = tax_176Row.id;

  const [tax_177Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Espécie", labelValue: "danae", parent: tax_176, createdBy: user.id })
    .returning();
  const tax_177 = tax_177Row.id;

  const [species_siri] = await db
    .insert(speciesTable)
    .values({ speciesRoot: tax_177, createdBy: user.id })
    .returning();

  let src_198Row = (await db.insert(sourceTable).values({ url: "https://www.marinespecies.org/aphia.php?p=taxdetails&id=107378" }).onConflictDoNothing().returning())[0];
  if (!src_198Row) {
    [src_198Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://www.marinespecies.org/aphia.php?p=taxdetails&id=107378"));
  }
  const src_198 = src_198Row.id;

  let src_199Row = (await db.insert(sourceTable).values({ url: "https://en.wikipedia.org/wiki/Callinectes_danae" }).onConflictDoNothing().returning())[0];
  if (!src_199Row) {
    [src_199Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://en.wikipedia.org/wiki/Callinectes_danae"));
  }
  const src_199 = src_199Row.id;

  let src_200Row = (await db.insert(sourceTable).values({ url: "https://pt.wikipedia.org/wiki/Callinectes_danae" }).onConflictDoNothing().returning())[0];
  if (!src_200Row) {
    [src_200Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://pt.wikipedia.org/wiki/Callinectes_danae"));
  }
  const src_200 = src_200Row.id;

  let src_201Row = (await db.insert(sourceTable).values({ url: "http://www.scielo.br/scielo.php?script=sci_arttext&pid=S0073-47212008000200011&lng=pt&tlng=pt" }).onConflictDoNothing().returning())[0];
  if (!src_201Row) {
    [src_201Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "http://www.scielo.br/scielo.php?script=sci_arttext&pid=S0073-47212008000200011&lng=pt&tlng=pt"));
  }
  const src_201 = src_201Row.id;

  let src_202Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:Callinectes_danae.jpg" }).onConflictDoNothing().returning())[0];
  if (!src_202Row) {
    [src_202Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:Callinectes_danae.jpg"));
  }
  const src_202 = src_202Row.id;

  let src_203Row = (await db.insert(sourceTable).values({ url: "https://www.inaturalist.org/observations/257375378" }).onConflictDoNothing().returning())[0];
  if (!src_203Row) {
    [src_203Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://www.inaturalist.org/observations/257375378"));
  }
  const src_203 = src_203Row.id;

  let src_204Row = (await db.insert(sourceTable).values({ url: "https://www.inaturalist.org/observations/388491838" }).onConflictDoNothing().returning())[0];
  if (!src_204Row) {
    [src_204Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://www.inaturalist.org/observations/388491838"));
  }
  const src_204 = src_204Row.id;

  let [atpl_242Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Largura máxima da carapaça (machos)"), eq(attributeTemplateTable.unit, "millimeter")));
  if (!atpl_242Row) {
    [atpl_242Row] = await db.insert(attributeTemplateTable).values({ label: "Largura máxima da carapaça (machos)", unit: "millimeter" }).returning();
  }
  const atpl_242 = atpl_242Row.id;

  let [atpl_243Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Largura máxima da carapaça (fêmeas)"), eq(attributeTemplateTable.unit, "millimeter")));
  if (!atpl_243Row) {
    [atpl_243Row] = await db.insert(attributeTemplateTable).values({ label: "Largura máxima da carapaça (fêmeas)", unit: "millimeter" }).returning();
  }
  const atpl_243 = atpl_243Row.id;

  let [atpl_244Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Longevidade estimada (machos)"), eq(attributeTemplateTable.unit, "year")));
  if (!atpl_244Row) {
    [atpl_244Row] = await db.insert(attributeTemplateTable).values({ label: "Longevidade estimada (machos)", unit: "year" }).returning();
  }
  const atpl_244 = atpl_244Row.id;

  let [atpl_245Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Longevidade estimada (fêmeas)"), eq(attributeTemplateTable.unit, "year")));
  if (!atpl_245Row) {
    [atpl_245Row] = await db.insert(attributeTemplateTable).values({ label: "Longevidade estimada (fêmeas)", unit: "year" }).returning();
  }
  const atpl_245 = atpl_245Row.id;

  let [atpl_246Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Profundidade máxima de ocorrência"), eq(attributeTemplateTable.unit, "meter")));
  if (!atpl_246Row) {
    [atpl_246Row] = await db.insert(attributeTemplateTable).values({ label: "Profundidade máxima de ocorrência", unit: "meter" }).returning();
  }
  const atpl_246 = atpl_246Row.id;

  await db.insert(attributeTable).values([
    { species: species_siri.id, attribute: atpl_242, value: "120", sourceId: src_201 },
    { species: species_siri.id, attribute: atpl_243, value: "113", sourceId: src_201 },
    { species: species_siri.id, attribute: atpl_244, value: "2.3", sourceId: src_201 },
    { species: species_siri.id, attribute: atpl_245, value: "2.5", sourceId: src_201 },
    { species: species_siri.id, attribute: atpl_246, value: "100", sourceId: src_198 },
  ]);

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Siri-açu", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_siri.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Siri", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_siri.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Dana's swimming crab", origin: "en" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_siri.id, popularNameId: pn.id });
  }

  function buildSourceIds_siri() {
    return { "worms": src_198, "en-wikipedia": src_199, "pt-wikipedia": src_200, "keunecke-2008": src_201, "commons-callinectes-danae": src_202, "inaturalist-buzios": src_203, "inaturalist-barra": src_204 };
  }
  const content_siri = buildArticleContent_siri(buildSourceIds_siri());
  const [article_siri] = await db
    .insert(articleTable)
    .values({ species: species_siri.id, content: content_siri })
    .returning();

  await db.insert(imageTable).values([
    { url: "https://upload.wikimedia.org/wikipedia/commons/0/08/Callinectes_danae.jpg", alt: "Siri-açu (Callinectes danae) fotografado no estuário da Lagoa dos Patos, Rio Grande do Sul", article: article_siri.id, type: "online", source: "upload.wikimedia.org", credit: "Foto: Cláudio Dias Timm, CC BY-SA 2.0" },
    { url: "https://inaturalist-open-data.s3.amazonaws.com/photos/461677201/original.jpg", alt: "Siri-açu (Callinectes danae) observado em Armação dos Búzios, Rio de Janeiro", article: article_siri.id, type: "online", source: "inaturalist-open-data.s3.amazonaws.com", credit: "Foto: filipeprates, CC0 1.0 (domínio público) — iNaturalist obs. 257375378" },
    { url: "https://inaturalist-open-data.s3.amazonaws.com/photos/711523511/original.jpg", alt: "Siri-açu (Callinectes danae) observado na Barra da Tijuca, Rio de Janeiro", article: article_siri.id, type: "online", source: "inaturalist-open-data.s3.amazonaws.com", credit: "Foto: Blue Niu, CC BY-NC 4.0 — iNaturalist obs. 388491838" },
  ]);

  await db.insert(articleSourcesPivotTable).values([
    { articleId: article_siri.id, sourceId: src_199 },
    { articleId: article_siri.id, sourceId: src_201 },
    { articleId: article_siri.id, sourceId: src_200 },
    { articleId: article_siri.id, sourceId: src_203 },
    { articleId: article_siri.id, sourceId: src_198 },
    { articleId: article_siri.id, sourceId: src_204 },
  ]);

  const [specimen_siri] = await db
    .insert(specimenTable)
    .values({ code: "CPINCRU03", lot: 3, shelf: 3, createdBy: user.id, speciesId: species_siri.id })
    .returning();
  // ---- caranguejo-1 (Ucides cordatus) ----

  const [tax_178Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Infraordem", labelValue: "brachyura", parent: tax_170, createdBy: user.id })
    .returning();
  const tax_178 = tax_178Row.id;

  const [tax_179Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Família", labelValue: "ucididae", parent: tax_178, createdBy: user.id })
    .returning();
  const tax_179 = tax_179Row.id;

  const [tax_180Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Gênero", labelValue: "ucides", parent: tax_179, createdBy: user.id })
    .returning();
  const tax_180 = tax_180Row.id;

  const [tax_181Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Espécie", labelValue: "ucides cordatus", parent: tax_180, createdBy: user.id })
    .returning();
  const tax_181 = tax_181Row.id;

  const [species_caranguejo_1] = await db
    .insert(speciesTable)
    .values({ speciesRoot: tax_181, createdBy: user.id })
    .returning();

  let src_205Row = (await db.insert(sourceTable).values({ url: "https://pt.wikipedia.org/wiki/Caranguejo-uçá" }).onConflictDoNothing().returning())[0];
  if (!src_205Row) {
    [src_205Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://pt.wikipedia.org/wiki/Caranguejo-uçá"));
  }
  const src_205 = src_205Row.id;

  let src_206Row = (await db.insert(sourceTable).values({ url: "https://en.wikipedia.org/wiki/Ucides_cordatus" }).onConflictDoNothing().returning())[0];
  if (!src_206Row) {
    [src_206Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://en.wikipedia.org/wiki/Ucides_cordatus"));
  }
  const src_206 = src_206Row.id;

  let src_207Row = (await db.insert(sourceTable).values({ url: "https://en.wikipedia.org/wiki/Ucididae" }).onConflictDoNothing().returning())[0];
  if (!src_207Row) {
    [src_207Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://en.wikipedia.org/wiki/Ucididae"));
  }
  const src_207 = src_207Row.id;

  let src_208Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:Ucides_cordatus_MN_01.jpg" }).onConflictDoNothing().returning())[0];
  if (!src_208Row) {
    [src_208Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:Ucides_cordatus_MN_01.jpg"));
  }
  const src_208 = src_208Row.id;

  let src_209Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:Caranguejo_uça.jpg" }).onConflictDoNothing().returning())[0];
  if (!src_209Row) {
    [src_209Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:Caranguejo_uça.jpg"));
  }
  const src_209 = src_209Row.id;

  let src_210Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:Ucides_cordatus_Martinique.JPG" }).onConflictDoNothing().returning())[0];
  if (!src_210Row) {
    [src_210Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:Ucides_cordatus_Martinique.JPG"));
  }
  const src_210 = src_210Row.id;

  let src_211Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:Ucides_cordatus_distibuicao.svg" }).onConflictDoNothing().returning())[0];
  if (!src_211Row) {
    [src_211Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:Ucides_cordatus_distibuicao.svg"));
  }
  const src_211 = src_211Row.id;

  let [atpl_247Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Coloração da carapaça (machos)"), eq(attributeTemplateTable.unit, "none")));
  if (!atpl_247Row) {
    [atpl_247Row] = await db.insert(attributeTemplateTable).values({ label: "Coloração da carapaça (machos)", unit: "none" }).returning();
  }
  const atpl_247 = atpl_247Row.id;

  let [atpl_248Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Pinças"), eq(attributeTemplateTable.unit, "none")));
  if (!atpl_248Row) {
    [atpl_248Row] = await db.insert(attributeTemplateTable).values({ label: "Pinças", unit: "none" }).returning();
  }
  const atpl_248 = atpl_248Row.id;

  let [atpl_249Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Profundidade máxima da toca"), eq(attributeTemplateTable.unit, "meter")));
  if (!atpl_249Row) {
    [atpl_249Row] = await db.insert(attributeTemplateTable).values({ label: "Profundidade máxima da toca", unit: "meter" }).returning();
  }
  const atpl_249 = atpl_249Row.id;

  let [atpl_250Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Dieta"), eq(attributeTemplateTable.unit, "none")));
  if (!atpl_250Row) {
    [atpl_250Row] = await db.insert(attributeTemplateTable).values({ label: "Dieta", unit: "none" }).returning();
  }
  const atpl_250 = atpl_250Row.id;

  let [atpl_251Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Família taxonômica"), eq(attributeTemplateTable.unit, "none")));
  if (!atpl_251Row) {
    [atpl_251Row] = await db.insert(attributeTemplateTable).values({ label: "Família taxonômica", unit: "none" }).returning();
  }
  const atpl_251 = atpl_251Row.id;

  await db.insert(attributeTable).values([
    { species: species_caranguejo_1.id, attribute: atpl_247, value: "azul-celeste a marrom-escuro (juvenil), ferruginosa a marrom-escuro (adulto)", sourceId: src_205 },
    { species: species_caranguejo_1.id, attribute: atpl_248, value: "assimétricas: esquerda fina para cortar e se alimentar, direita maior para esmagar", sourceId: src_206 },
    { species: species_caranguejo_1.id, attribute: atpl_249, value: "1.6", sourceId: src_206 },
    { species: species_caranguejo_1.id, attribute: atpl_250, value: "herbívora, principalmente folhiço de mangue (folhas, casca e raízes)", sourceId: src_206 },
    { species: species_caranguejo_1.id, attribute: atpl_180, value: "manguezais do litoral atlântico ocidental, da Florida (EUA) ao sul do Brasil", sourceId: src_205 },
    { species: species_caranguejo_1.id, attribute: atpl_251, value: "ucididae, família monotípica estabelecida em 2005", sourceId: src_207 },
  ]);

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Caranguejo-uçá", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_caranguejo_1.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Uçá", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_caranguejo_1.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Catanhão", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_caranguejo_1.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Caranguejo-verdadeiro", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_caranguejo_1.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Uçaúna", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_caranguejo_1.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Swamp ghost crab", origin: "en" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_caranguejo_1.id, popularNameId: pn.id });
  }

  function buildSourceIds_caranguejo_1() {
    return { "wiki-pt-uca": src_205, "wiki-en-ucides-cordatus": src_206, "wiki-en-ucididae": src_207, "commons-mn01": src_208, "commons-garra": src_209, "commons-martinique": src_210, "commons-distribuicao": src_211 };
  }
  const content_caranguejo_1 = buildArticleContent_caranguejo_1(buildSourceIds_caranguejo_1());
  const [article_caranguejo_1] = await db
    .insert(articleTable)
    .values({ species: species_caranguejo_1.id, content: content_caranguejo_1 })
    .returning();

  await db.insert(imageTable).values([
    { url: "https://commons.wikimedia.org/wiki/Special:FilePath/Ucides%20cordatus%20MN%2001.jpg", alt: "Exemplar de Ucides cordatus do acervo de invertebrados marinhos do Museu Nacional/UFRJ, Rio de Janeiro", article: article_caranguejo_1.id, type: "online", source: "commons.wikimedia.org", credit: "Dornicke / Wikimedia Commons, CC BY-SA 4.0" },
    { url: "https://commons.wikimedia.org/wiki/Special:FilePath/Caranguejo%20uça.jpg", alt: "Detalhe da pinça assimétrica de Ucides cordatus", article: article_caranguejo_1.id, type: "online", source: "commons.wikimedia.org", credit: "Cesar Augusto Chirosa Horie / Wikimedia Commons, CC BY-SA 4.0" },
    { url: "https://commons.wikimedia.org/wiki/Special:FilePath/Ucides%20cordatus%20Martinique.JPG", alt: "Ucides cordatus fotografado em manguezal na Martinica", article: article_caranguejo_1.id, type: "online", source: "commons.wikimedia.org", credit: "Pancrat / Wikimedia Commons, CC BY-SA / GFDL" },
    { url: "https://commons.wikimedia.org/wiki/Special:FilePath/Ucides%20cordatus%20distibuicao.svg", alt: "Mapa de distribuição geográfica de Ucides cordatus na América", article: article_caranguejo_1.id, type: "online", source: "commons.wikimedia.org", credit: "Riba28-maps / Wikimedia Commons, CC BY-SA 3.0" },
  ]);

  await db.insert(articleSourcesPivotTable).values([
    { articleId: article_caranguejo_1.id, sourceId: src_206 },
    { articleId: article_caranguejo_1.id, sourceId: src_205 },
    { articleId: article_caranguejo_1.id, sourceId: src_207 },
  ]);

  const [specimen_caranguejo_1] = await db
    .insert(specimenTable)
    .values({ code: "CPINCRU04", lot: 4, shelf: 3, createdBy: user.id, speciesId: species_caranguejo_1.id })
    .returning();
  // ---- caranguejo-2 (Cardisoma guanhumi) ----

  const [tax_182Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Infraordem", labelValue: "brachyura", parent: tax_163, createdBy: user.id })
    .returning();
  const tax_182 = tax_182Row.id;

  const [tax_183Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Família", labelValue: "gecarcinidae", parent: tax_182, createdBy: user.id })
    .returning();
  const tax_183 = tax_183Row.id;

  const [tax_184Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Gênero", labelValue: "cardisoma", parent: tax_183, createdBy: user.id })
    .returning();
  const tax_184 = tax_184Row.id;

  const [tax_185Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Espécie", labelValue: "cardisoma guanhumi", parent: tax_184, createdBy: user.id })
    .returning();
  const tax_185 = tax_185Row.id;

  const [species_caranguejo_2] = await db
    .insert(speciesTable)
    .values({ speciesRoot: tax_185, createdBy: user.id })
    .returning();

  let src_212Row = (await db.insert(sourceTable).values({ url: "https://pt.wikipedia.org/wiki/Cardisoma_guanhumi" }).onConflictDoNothing().returning())[0];
  if (!src_212Row) {
    [src_212Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://pt.wikipedia.org/wiki/Cardisoma_guanhumi"));
  }
  const src_212 = src_212Row.id;

  let src_213Row = (await db.insert(sourceTable).values({ url: "https://en.wikipedia.org/wiki/Cardisoma_guanhumi" }).onConflictDoNothing().returning())[0];
  if (!src_213Row) {
    [src_213Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://en.wikipedia.org/wiki/Cardisoma_guanhumi"));
  }
  const src_213 = src_213Row.id;

  let [atpl_252Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Largura da carapaça"), eq(attributeTemplateTable.unit, "centimeter")));
  if (!atpl_252Row) {
    [atpl_252Row] = await db.insert(attributeTemplateTable).values({ label: "Largura da carapaça", unit: "centimeter" }).returning();
  }
  const atpl_252 = atpl_252Row.id;

  let [atpl_253Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Habitat"), eq(attributeTemplateTable.unit, "none")));
  if (!atpl_253Row) {
    [atpl_253Row] = await db.insert(attributeTemplateTable).values({ label: "Habitat", unit: "none" }).returning();
  }
  const atpl_253 = atpl_253Row.id;

  let [atpl_254Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Estado de conservação no Brasil"), eq(attributeTemplateTable.unit, "none")));
  if (!atpl_254Row) {
    [atpl_254Row] = await db.insert(attributeTemplateTable).values({ label: "Estado de conservação no Brasil", unit: "none" }).returning();
  }
  const atpl_254 = atpl_254Row.id;

  await db.insert(attributeTable).values([
    { species: species_caranguejo_2.id, attribute: atpl_252, value: "up to 15", sourceId: src_213 },
    { species: species_caranguejo_2.id, attribute: atpl_46, value: "up to 500", sourceId: src_212 },
    { species: species_caranguejo_2.id, attribute: atpl_110, value: "dark blue to brown or pale grey", sourceId: src_213 },
    { species: species_caranguejo_2.id, attribute: atpl_253, value: "burrows in sandy transition zone between mangrove and restinga", sourceId: src_212 },
    { species: species_caranguejo_2.id, attribute: atpl_250, value: "omnivorous, eats leaves, fruit, insects and carrion", sourceId: src_213 },
    { species: species_caranguejo_2.id, attribute: atpl_254, value: "critically endangered, capture banned since 2017", sourceId: src_212 },
  ]);

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Guaiamu", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_caranguejo_2.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Guaiamum", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_caranguejo_2.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Goiamu", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_caranguejo_2.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Goiamum", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_caranguejo_2.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Fumbamba", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_caranguejo_2.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Caranguejo-mulato-da-terra", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_caranguejo_2.id, popularNameId: pn.id });
  }

  function buildSourceIds_caranguejo_2() {
    return { "wiki-pt-cardisoma": src_212, "wiki-en-cardisoma": src_213 };
  }
  const content_caranguejo_2 = buildArticleContent_caranguejo_2(buildSourceIds_caranguejo_2());
  const [article_caranguejo_2] = await db
    .insert(articleTable)
    .values({ species: species_caranguejo_2.id, content: content_caranguejo_2 })
    .returning();

  await db.insert(imageTable).values([
    { url: "https://upload.wikimedia.org/wikipedia/commons/9/9c/Carangueijo-1310.jpg", alt: "Guaiamu (Cardisoma guanhumi) fotografado no Brasil", article: article_caranguejo_2.id, type: "online", source: "upload.wikimedia.org", credit: "FelipeVieiraAS / Wikimedia Commons / CC BY-SA 4.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Caranguejo_terrestre_de_h%C3%A1bito_noturno%2C_Ilha_Grande.jpg", alt: "Caranguejo terrestre de hábito noturno (Cardisoma guanhumi) na Ilha Grande, RJ", article: article_caranguejo_2.id, type: "online", source: "upload.wikimedia.org", credit: "MBelu / Wikimedia Commons / CC BY-SA 4.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/8/89/2018_01_%28Blue%29_-_Guaiamu.jpg", alt: "Guaiamu (Cardisoma guanhumi) de coloração azulada", article: article_caranguejo_2.id, type: "online", source: "upload.wikimedia.org", credit: "Fbrandao.1963 / Wikimedia Commons / CC BY-SA 4.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/8/85/Cardisoma_guanhumi_%28Decapoda%29.jpg", alt: "Cardisoma guanhumi fotografado em seu habitat natural", article: article_caranguejo_2.id, type: "online", source: "upload.wikimedia.org", credit: "Filo gèn' / Wikimedia Commons / CC BY-SA 4.0" },
  ]);

  await db.insert(articleSourcesPivotTable).values([
    { articleId: article_caranguejo_2.id, sourceId: src_213 },
    { articleId: article_caranguejo_2.id, sourceId: src_212 },
  ]);

  const [specimen_caranguejo_2] = await db
    .insert(specimenTable)
    .values({ code: "CPINCRU05", lot: 5, shelf: 3, createdBy: user.id, speciesId: species_caranguejo_2.id })
    .returning();
  // ---- tatuzinho-jardim (Armadillidium vulgare) ----

  const [tax_186Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Ordem", labelValue: "isopoda", parent: tax_162, createdBy: user.id })
    .returning();
  const tax_186 = tax_186Row.id;

  const [tax_187Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Subordem", labelValue: "oniscidea", parent: tax_186, createdBy: user.id })
    .returning();
  const tax_187 = tax_187Row.id;

  const [tax_188Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Família", labelValue: "armadillidiidae", parent: tax_187, createdBy: user.id })
    .returning();
  const tax_188 = tax_188Row.id;

  const [tax_189Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Gênero", labelValue: "armadillidium", parent: tax_188, createdBy: user.id })
    .returning();
  const tax_189 = tax_189Row.id;

  const [tax_190Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Espécie", labelValue: "armadillidium vulgare", parent: tax_189, createdBy: user.id })
    .returning();
  const tax_190 = tax_190Row.id;

  const [species_tatuzinho_jardim] = await db
    .insert(speciesTable)
    .values({ speciesRoot: tax_190, createdBy: user.id })
    .returning();

  let src_214Row = (await db.insert(sourceTable).values({ url: "https://pt.wikipedia.org/wiki/Armadillidium_vulgare" }).onConflictDoNothing().returning())[0];
  if (!src_214Row) {
    [src_214Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://pt.wikipedia.org/wiki/Armadillidium_vulgare"));
  }
  const src_214 = src_214Row.id;

  let src_215Row = (await db.insert(sourceTable).values({ url: "https://en.wikipedia.org/wiki/Armadillidium_vulgare" }).onConflictDoNothing().returning())[0];
  if (!src_215Row) {
    [src_215Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://en.wikipedia.org/wiki/Armadillidium_vulgare"));
  }
  const src_215 = src_215Row.id;

  let src_216Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:Armadillidium_vulgare_001.jpg" }).onConflictDoNothing().returning())[0];
  if (!src_216Row) {
    [src_216Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:Armadillidium_vulgare_001.jpg"));
  }
  const src_216 = src_216Row.id;

  let src_217Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:Armadillidium_vulgare-dorsal.jpg" }).onConflictDoNothing().returning())[0];
  if (!src_217Row) {
    [src_217Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:Armadillidium_vulgare-dorsal.jpg"));
  }
  const src_217 = src_217Row.id;

  let src_218Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/File:Common_Pill_Woodlouse_(Armadillidium_vulgare)_-_Guelph,_Ontario_01.jpg" }).onConflictDoNothing().returning())[0];
  if (!src_218Row) {
    [src_218Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/File:Common_Pill_Woodlouse_(Armadillidium_vulgare)_-_Guelph,_Ontario_01.jpg"));
  }
  const src_218 = src_218Row.id;

  let [atpl_255Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Comprimento do corpo adulto"), eq(attributeTemplateTable.unit, "millimeter")));
  if (!atpl_255Row) {
    [atpl_255Row] = await db.insert(attributeTemplateTable).values({ label: "Comprimento do corpo adulto", unit: "millimeter" }).returning();
  }
  const atpl_255 = atpl_255Row.id;

  let [atpl_256Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Longevidade em cativeiro"), eq(attributeTemplateTable.unit, "year")));
  if (!atpl_256Row) {
    [atpl_256Row] = await db.insert(attributeTemplateTable).values({ label: "Longevidade em cativeiro", unit: "year" }).returning();
  }
  const atpl_256 = atpl_256Row.id;

  let [atpl_257Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Espessura do exoesqueleto"), eq(attributeTemplateTable.unit, "micrometer")));
  if (!atpl_257Row) {
    [atpl_257Row] = await db.insert(attributeTemplateTable).values({ label: "Espessura do exoesqueleto", unit: "micrometer" }).returning();
  }
  const atpl_257 = atpl_257Row.id;

  let [atpl_258Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Ninhadas por fêmea por temporada"), eq(attributeTemplateTable.unit, "brood")));
  if (!atpl_258Row) {
    [atpl_258Row] = await db.insert(attributeTemplateTable).values({ label: "Ninhadas por fêmea por temporada", unit: "brood" }).returning();
  }
  const atpl_258 = atpl_258Row.id;

  let [atpl_259Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Perda de colheita em feijão causada pela espécie"), eq(attributeTemplateTable.unit, "percent")));
  if (!atpl_259Row) {
    [atpl_259Row] = await db.insert(attributeTemplateTable).values({ label: "Perda de colheita em feijão causada pela espécie", unit: "percent" }).returning();
  }
  const atpl_259 = atpl_259Row.id;

  await db.insert(attributeTable).values([
    { species: species_tatuzinho_jardim.id, attribute: atpl_255, value: "8.5-18", sourceId: src_215 },
    { species: species_tatuzinho_jardim.id, attribute: atpl_256, value: "até 3", sourceId: src_215 },
    { species: species_tatuzinho_jardim.id, attribute: atpl_176, value: "7", sourceId: src_215 },
    { species: species_tatuzinho_jardim.id, attribute: atpl_257, value: "40", sourceId: src_215 },
    { species: species_tatuzinho_jardim.id, attribute: atpl_258, value: "até 3, com até 40 filhotes cada", sourceId: src_215 },
    { species: species_tatuzinho_jardim.id, attribute: atpl_259, value: "até 80", sourceId: src_214 },
  ]);

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Tatuzinho-de-jardim", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_tatuzinho_jardim.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "Bicho-de-conta", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_tatuzinho_jardim.id, popularNameId: pn.id });
  }

  function buildSourceIds_tatuzinho_jardim() {
    return { "wikipedia-pt": src_214, "wikipedia-en": src_215, "commons-001": src_216, "commons-dorsal": src_217, "commons-guelph": src_218 };
  }
  const content_tatuzinho_jardim = buildArticleContent_tatuzinho_jardim(buildSourceIds_tatuzinho_jardim());
  const [article_tatuzinho_jardim] = await db
    .insert(articleTable)
    .values({ species: species_tatuzinho_jardim.id, content: content_tatuzinho_jardim })
    .returning();

  await db.insert(imageTable).values([
    { url: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Armadillidium_vulgare_001.jpg", alt: "Vista dorsal de Armadillidium vulgare (tatuzinho-de-jardim) mostrando o corpo convexo segmentado", article: article_tatuzinho_jardim.id, type: "online", source: "upload.wikimedia.org", credit: "Franco Folini / CC BY-SA 3.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/2/25/Armadillidium_vulgare-dorsal.jpg", alt: "Armadillidium vulgare fotografado em Alexander Valley, Califórnia", article: article_tatuzinho_jardim.id, type: "online", source: "upload.wikimedia.org", credit: "Don Loarie / CC BY 4.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/f/f0/Common_Pill_Woodlouse_%28Armadillidium_vulgare%29_-_Guelph%2C_Ontario_01.jpg", alt: "Armadillidium vulgare fotografado em Guelph, Ontario", article: article_tatuzinho_jardim.id, type: "online", source: "upload.wikimedia.org", credit: "Ryan Hodnett / CC BY-SA 4.0" },
  ]);

  await db.insert(articleSourcesPivotTable).values([
    { articleId: article_tatuzinho_jardim.id, sourceId: src_215 },
    { articleId: article_tatuzinho_jardim.id, sourceId: src_214 },
  ]);

  const [specimen_tatuzinho_jardim] = await db
    .insert(specimenTable)
    .values({ code: "CPINCRU06", lot: 6, shelf: 3, createdBy: user.id, speciesId: species_tatuzinho_jardim.id })
    .returning();
  // ---- bolacha-da-praia (Mellita quinquiesperforata) ----

  const [tax_191Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Filo", labelValue: "echinodermata", parent: tax_1, createdBy: user.id })
    .returning();
  const tax_191 = tax_191Row.id;

  const [tax_192Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Classe", labelValue: "echinoidea", parent: tax_191, createdBy: user.id })
    .returning();
  const tax_192 = tax_192Row.id;

  const [tax_193Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Ordem", labelValue: "clypeasteroida", parent: tax_192, createdBy: user.id })
    .returning();
  const tax_193 = tax_193Row.id;

  const [tax_194Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Família", labelValue: "mellitidae", parent: tax_193, createdBy: user.id })
    .returning();
  const tax_194 = tax_194Row.id;

  const [tax_195Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Gênero", labelValue: "mellita", parent: tax_194, createdBy: user.id })
    .returning();
  const tax_195 = tax_195Row.id;

  const [tax_196Row] = await db
    .insert(taxonomyTable)
    .values({ label: "Espécie", labelValue: "mellita quinquiesperforata", parent: tax_195, createdBy: user.id })
    .returning();
  const tax_196 = tax_196Row.id;

  const [species_bolacha_da_praia] = await db
    .insert(speciesTable)
    .values({ speciesRoot: tax_196, createdBy: user.id })
    .returning();

  let src_219Row = (await db.insert(sourceTable).values({ url: "https://pt.wikipedia.org/wiki/Mellita_quinquiesperforata" }).onConflictDoNothing().returning())[0];
  if (!src_219Row) {
    [src_219Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://pt.wikipedia.org/wiki/Mellita_quinquiesperforata"));
  }
  const src_219 = src_219Row.id;

  let src_220Row = (await db.insert(sourceTable).values({ url: "https://en.wikipedia.org/wiki/Mellita_quinquiesperforata" }).onConflictDoNothing().returning())[0];
  if (!src_220Row) {
    [src_220Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://en.wikipedia.org/wiki/Mellita_quinquiesperforata"));
  }
  const src_220 = src_220Row.id;

  let src_221Row = (await db.insert(sourceTable).values({ url: "https://commons.wikimedia.org/wiki/Category:Mellita_quinquiesperforata" }).onConflictDoNothing().returning())[0];
  if (!src_221Row) {
    [src_221Row] = await db.select().from(sourceTable).where(eq(sourceTable.url, "https://commons.wikimedia.org/wiki/Category:Mellita_quinquiesperforata"));
  }
  const src_221 = src_221Row.id;

  let [atpl_260Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Diâmetro"), eq(attributeTemplateTable.unit, "centimeter")));
  if (!atpl_260Row) {
    [atpl_260Row] = await db.insert(attributeTemplateTable).values({ label: "Diâmetro", unit: "centimeter" }).returning();
  }
  const atpl_260 = atpl_260Row.id;

  let [atpl_261Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Simetria corporal"), eq(attributeTemplateTable.unit, "")));
  if (!atpl_261Row) {
    [atpl_261Row] = await db.insert(attributeTemplateTable).values({ label: "Simetria corporal", unit: "" }).returning();
  }
  const atpl_261 = atpl_261Row.id;

  let [atpl_262Row] = await db
    .select()
    .from(attributeTemplateTable)
    .where(and(eq(attributeTemplateTable.label, "Composição do esqueleto"), eq(attributeTemplateTable.unit, "")));
  if (!atpl_262Row) {
    [atpl_262Row] = await db.insert(attributeTemplateTable).values({ label: "Composição do esqueleto", unit: "" }).returning();
  }
  const atpl_262 = atpl_262Row.id;

  await db.insert(attributeTable).values([
    { species: species_bolacha_da_praia.id, attribute: atpl_260, value: "5 to 10", sourceId: src_219 },
    { species: species_bolacha_da_praia.id, attribute: atpl_53, value: "0 to 180", sourceId: src_219 },
    { species: species_bolacha_da_praia.id, attribute: atpl_261, value: "radial in adults, bilateral in larvae", sourceId: src_220 },
    { species: species_bolacha_da_praia.id, attribute: atpl_161, value: "brownish, grayish or greenish", sourceId: src_219 },
    { species: species_bolacha_da_praia.id, attribute: atpl_20, value: "copepods, algae, seaweed, small shellfish", sourceId: src_220 },
    { species: species_bolacha_da_praia.id, attribute: atpl_262, value: "calcium carbonate", sourceId: src_220 },
  ]);

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "bolacha-da-praia", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_bolacha_da_praia.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "bolacha-do-mar", origin: "pt-BR" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_bolacha_da_praia.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "five-holed keyhole urchin", origin: "en" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_bolacha_da_praia.id, popularNameId: pn.id });
  }

  {
    const [pn] = await db
      .insert(popularNameTable)
      .values({ name: "sand dollar", origin: "en" })
      .returning();
    await db.insert(speciesPopularNamePivot).values({ speciesId: species_bolacha_da_praia.id, popularNameId: pn.id });
  }

  function buildSourceIds_bolacha_da_praia() {
    return { "wikipedia-pt": src_219, "wikipedia-en": src_220, "wikimedia-commons": src_221 };
  }
  const content_bolacha_da_praia = buildArticleContent_bolacha_da_praia(buildSourceIds_bolacha_da_praia());
  const [article_bolacha_da_praia] = await db
    .insert(articleTable)
    .values({ species: species_bolacha_da_praia.id, content: content_bolacha_da_praia })
    .returning();

  await db.insert(imageTable).values([
    { url: "https://upload.wikimedia.org/wikipedia/commons/4/48/Parati_Sand_Dollar.jpg", alt: "Espécime de bolacha-da-praia (Mellita quinquiesperforata) fotografado em praia próxima a Paraty, Rio de Janeiro, Brasil", article: article_bolacha_da_praia.id, type: "online", source: "upload.wikimedia.org", credit: "Lbertolotti / CC BY-SA 4.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/f/fc/Keyhole_sand_dollar_01.jpg", alt: "Vista dorsal de Mellita quinquiesperforata mostrando as cinco lúnulas características do disco", article: article_bolacha_da_praia.id, type: "online", source: "upload.wikimedia.org", credit: "Sharon Mooney / CC BY-SA 3.0" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/b/bd/Keyhole_sand_dollar_07.jpg", alt: "Vista ventral de Mellita quinquiesperforata mostrando os pés ambulacrais (podia) usados na locomoção e a boca central", article: article_bolacha_da_praia.id, type: "online", source: "upload.wikimedia.org", credit: "Sharon Mooney / CC BY-SA 3.0" },
  ]);

  await db.insert(articleSourcesPivotTable).values([
    { articleId: article_bolacha_da_praia.id, sourceId: src_220 },
    { articleId: article_bolacha_da_praia.id, sourceId: src_219 },
    { articleId: article_bolacha_da_praia.id, sourceId: src_221 },
  ]);

  const [specimen_bolacha_da_praia] = await db
    .insert(specimenTable)
    .values({ code: "CPINEQUI01", lot: 1, shelf: 3, createdBy: user.id, speciesId: species_bolacha_da_praia.id })
    .returning();

  const speciesIds = [species_esponja_do_mar.id, species_anemona.id, species_lombriga.id, species_planaria.id, species_tenia.id, species_bivalve.id, species_lula_1.id, species_lesma.id, species_caramujo.id, species_lula_2.id, species_polvo.id, species_sanguessuga.id, species_minhoca.id, species_cigarra.id, species_besouro_escaravelho.id, species_abelha.id, species_libelula.id, species_grilo.id, species_larva_mosca_1.id, species_mariposa.id, species_barata.id, species_ovo_mosca.id, species_larva_mosca_2.id, species_larva_mosca_3.id, species_larva_mosca_4.id, species_pupa_mosca.id, species_mosca.id, species_besouro_chifre.id, species_lagarta_borboleta.id, species_besouros.id, species_besouro_gorgulho.id, species_inseto_aquatico.id, species_louva_a_deus.id, species_piolho_de_cobra.id, species_lacraia.id, species_aranhas.id, species_aranha_alcapao.id, species_escorpiao_amarelo.id, species_opiliao.id, species_carrapato_sapo.id, species_carrapato_ave.id, species_carrapato_bovino.id, species_carrapato_tamandua.id, species_ninhada_carrapato.id, species_ninhada_aranha.id, species_lagosta_filtradora.id, species_camarao.id, species_siri.id, species_caranguejo_1.id, species_caranguejo_2.id, species_tatuzinho_jardim.id, species_bolacha_da_praia.id];
  const specimenIds = [specimen_esponja_do_mar.id, specimen_anemona.id, specimen_lombriga.id, specimen_planaria.id, specimen_tenia.id, specimen_bivalve.id, specimen_lula_1.id, specimen_lesma.id, specimen_caramujo.id, specimen_lula_2.id, specimen_polvo.id, specimen_sanguessuga.id, specimen_minhoca.id, specimen_cigarra.id, specimen_besouro_escaravelho.id, specimen_abelha.id, specimen_libelula.id, specimen_grilo.id, specimen_larva_mosca_1.id, specimen_mariposa.id, specimen_barata.id, specimen_ovo_mosca.id, specimen_larva_mosca_2.id, specimen_larva_mosca_3.id, specimen_larva_mosca_4.id, specimen_pupa_mosca.id, specimen_mosca.id, specimen_besouro_chifre.id, specimen_lagarta_borboleta.id, specimen_besouros.id, specimen_besouro_gorgulho.id, specimen_inseto_aquatico.id, specimen_louva_a_deus.id, specimen_piolho_de_cobra.id, specimen_lacraia.id, specimen_aranhas.id, specimen_aranha_alcapao.id, specimen_escorpiao_amarelo.id, specimen_opiliao.id, specimen_carrapato_sapo.id, specimen_carrapato_ave.id, specimen_carrapato_bovino.id, specimen_carrapato_tamandua.id, specimen_ninhada_carrapato.id, specimen_ninhada_aranha.id, specimen_lagosta_filtradora.id, specimen_camarao.id, specimen_siri.id, specimen_caranguejo_1.id, specimen_caranguejo_2.id, specimen_tatuzinho_jardim.id, specimen_bolacha_da_praia.id];
  console.log(`Seed de especies OK - ${speciesIds.length} especies inseridas, ${specimenIds.length} especimes inseridos.`);
  console.log("species ids:", speciesIds);
  console.log("specimen ids:", specimenIds);
}

seed()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => process.exit(0));
