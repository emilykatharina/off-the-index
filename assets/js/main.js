let allData = [];
let symptomMap = {};
let isToggling = false;

const SYMPTOM_POSITIONS = {
    'S01': { name: 'Depression',              x: 44, y: 63 },
    'S02': { name: 'Anhedonia',               x: 60, y: 38 },
    'S03': { name: 'Numbness',                x: 74, y: 52 },
    'S04': { name: 'Euphoria',                x: 62, y: 94 },
    'S05': { name: 'Irritability',            x: 72, y: 79 },
    'S06': { name: 'Instability',             x: 40, y: 68 },
    'S07': { name: 'Suicidality',             x: 18, y: 69 },
    'S08': { name: 'Hopelessness',            x: 20, y: 83 },
    'S09': { name: 'Anxiety',                 x: 56, y: 65 },
    'S10': { name: 'Panic',                   x: 89, y: 88 },
    'S11': { name: 'Social-anxiety',          x: 34, y: 37 },
    'S12': { name: 'Agoraphobia',             x: 87, y: 84 },
    'S13': { name: 'Paranoia',                x: 60, y: 21 },
    'S14': { name: 'Racing-thoughts',         x: 78, y: 91 },
    'S15': { name: 'Cognition',               x: 43, y: 77 },
    'S16': { name: 'Rumination',              x: 35, y: 73 },
    'S17': { name: 'Perfectionism',           x: 15, y: 50 },
    'S18': { name: 'Obsessions',              x: 38, y: 85 },
    'S19': { name: 'Delusions',               x: 80, y: 16 },
    'S20': { name: 'Amnesia',                 x: 38, y: 91 },
    'S21': { name: 'Auditory Hallucinations', x: 78, y: 12 },
    'S22': { name: 'Visual Hallucinations',   x: 67, y:  9 },
    'S23': { name: 'Depersonalization',       x: 60, y: 56 },
    'S24': { name: 'Psychosis',               x: 78, y: 26 },
    'S25': { name: 'Self-esteem',             x:  6, y: 36 },
    'S26': { name: 'Dysmorphia',              x:  8, y: 23 },
    'S27': { name: 'Identity',                x: 12, y: 61 },
    'S28': { name: 'Shame',                   x: 18, y: 32 },
    'S29': { name: 'Self-harm',               x: 26, y: 46 },
    'S30': { name: 'Restriction',             x: 24, y: 19 },
    'S31': { name: 'Bingeing',                x: 30, y: 24 },
    'S32': { name: 'Purging',                 x: 35, y:  7 },
    'S33': { name: 'Over-exercising',         x: 17, y: 11 },
    'S34': { name: 'Coping',                  x: 44, y: 33 },
    'S35': { name: 'Impulsivity',             x: 33, y: 54 },
    'S36': { name: 'Insomnia',                x: 65, y: 73 },
    'S37': { name: 'Exhaustion',              x: 37, y: 50 },
    'S38': { name: 'Hypomania',               x: 62, y: 84 },
    'S39': { name: 'Withdrawal',              x: 84, y: 71 },
    'S40': { name: 'Attachment',              x: 24, y: 57 },
    'S41': { name: 'Impairment',              x: 70, y: 62 },
    'S42': { name: 'Somatization',            x: 62, y: 42 },
    'S43': { name: 'Amenorrhea',              x: 38, y: 13 },
    'S44': { name: 'Dependence',              x: 84, y: 58 },
    'S45': { name: 'Craving',                 x: 88, y: 44 },
    'S46': { name: 'Tolerance',               x: 88, y: 66 },
    'S47': { name: 'Abstinence',              x: 88, y: 55 },
    'S48': { name: 'Drug-psychosis',          x: 84, y: 30 },
    'S49': { name: 'Deficits',                x: 23, y: 89 },
    'S50': { name: 'Delinquency',             x:  8, y: 79 },
};


function parseSymptomCSV(buffer) {
    const bytes = new Uint8Array(buffer);
    const start = (bytes[0] === 0xFF && bytes[1] === 0xFE) ? 2 : 0;
    const text = new TextDecoder('utf-16le').decode(bytes.slice(start));
    const map = {};

    for (const line of text.split(/\r?\n/)) {
        const cols = line.replace(/﻿/g, '').split(';').map(c => c.trim());
        const name = cols[1];
        if (!name || name === 'Name' || name === '') continue;

        const symptoms = [];
        for (let i = 3; i <= 52 && i < cols.length; i++) {
            if (cols[i].toUpperCase() === 'X') {
                symptoms.push('S' + String(i - 2).padStart(2, '0'));
            }
        }
        map[name] = symptoms;
    }
    return map;
}


function showSymptomOverlay(symptoms) {
    hideSymptomOverlay();
    symptoms.forEach(sCode => {
        const pos = SYMPTOM_POSITIONS[sCode];
        if (!pos) return;

        const dot = document.createElement('div');
        dot.className = 'symptom-dot';
        dot.style.left = pos.x + '%';
        dot.style.top  = pos.y + '%';
        dot.dataset.name = pos.name;

        const label = document.createElement('span');
        label.className = 'symptom-label';
        label.textContent = pos.name;
        dot.appendChild(label);

        dot.addEventListener('click', () => {
            window.location.href = 'symptom.html?symptom=' + encodeURIComponent(pos.name);
        });

        document.body.appendChild(dot);
    });
}

function hideSymptomOverlay() {
    document.querySelectorAll('.symptom-dot').forEach(d => d.remove());
}

function resetState() {
    document.querySelectorAll('.katalog-row').forEach(r => r.classList.remove('active-row'));
    document.querySelectorAll('.card').forEach(c => c.classList.remove('active-card'));
    document.querySelectorAll('.detail-row').forEach(d => {
        d.classList.remove('active');
        d.textContent = '';
    });
    document.body.classList.remove('inverted');
    hideSymptomOverlay();
}


function renderKatalog(items) {
    const katalog = document.getElementById('katalog');
    if (!katalog || !Array.isArray(items)) return;

    const chunkSize = 3;

    for (let i = 0; i < items.length; i += chunkSize) {
        const chunk = items.slice(i, i + chunkSize);

        const rowEl = document.createElement('div');
        rowEl.className = 'katalog-row';

        const detailEl = document.createElement('div');
        detailEl.className = 'detail-row';

        chunk.forEach(item => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div class="card-content">
                    <div class="card-name">${item.Name}</div>
                    <div class="card-content-grid">
                        <div class="card-ages">Age at interview (${item['Age at interview'] || ''}), Age at diagnosis (${item['Age at diagnosis'] || ''})</div>
                    </div>
                    <div class="card-brief-outline">${item['Brief outline'] || ''}</div>
                    <details class="card-details">
                        <summary class="card-details-summary">${item.Name}'s interview</summary>
                    </details>
                </div>
            `;

            const details = card.querySelector('.card-details');

            details.addEventListener('toggle', () => {
                if (isToggling) return;
                isToggling = true;

                if (details.open) {
                    // close any other open details without re-triggering
                    document.querySelectorAll('details[open]').forEach(d => {
                        if (d !== details) d.open = false;
                    });

                    resetState();

                    card.classList.add('active-card');
                    rowEl.classList.add('active-row');
                    detailEl.textContent = item['Interview text'] || '';
                    detailEl.classList.add('active');
                    document.body.classList.add('inverted');
                    showSymptomOverlay(symptomMap[item.Name] || []);
                } else {
                    resetState();
                }

                isToggling = false;
            });

            rowEl.appendChild(card);
        });

        katalog.appendChild(rowEl);
        katalog.appendChild(detailEl);
    }
}


Promise.all([
    fetch('assets/data/csvjson.json').then(r => r.json()),
    fetch('assets/data/tabelle%20symptome.csv').then(r => r.arrayBuffer()).then(parseSymptomCSV)
]).then(([data, symptoms]) => {
    symptomMap = symptoms;

    // only keep people who have at least one symptom
    const withSymptoms = data.records.filter(item => (symptomMap[item.Name] || []).length > 0);

    // check for symptom filter in URL
    const filterName = new URLSearchParams(window.location.search).get('symptom');
    if (filterName) {
        const code = Object.entries(SYMPTOM_POSITIONS).find(([, p]) => p.name === filterName)?.[0];
        allData = code
            ? withSymptoms.filter(item => (symptomMap[item.Name] || []).includes(code))
            : withSymptoms;
    } else {
        allData = withSymptoms;
    }

    renderKatalog(allData);
}).catch(error => {
    console.error('Error loading data:', error);
    document.getElementById('katalog').innerHTML = '<div class="loading">Error loading data</div>';
});
