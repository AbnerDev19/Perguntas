// Importando funções do Firebase via CDN (não precisa de npm install)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- CONFIGURAÇÃO DO FIREBASE ---
// 1. Vá no Console do Firebase > Configurações do Projeto > Geral
// 2. Role até "Seus aplicativos" e copie o objeto "firebaseConfig"
// 3. Cole ABAIXO (substitua o exemplo):

const firebaseConfig = {
    apiKey: "SUA_API_KEY_AQUI",
    authDomain: "SEU_PROJETO.firebaseapp.com",
    projectId: "SEU_PROJETO_ID",
    storageBucket: "SEU_PROJETO.appspot.com",
    messagingSenderId: "NUMEROS...",
    appId: "1:NUMEROS:web:CODIGOS..."
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- LÓGICA DO SITE ---

const sendBtn = document.getElementById('sendBtn');
const questionInput = document.getElementById('questionInput');
const feed = document.getElementById('feed');
const charCount = document.querySelector('.char-count');

// Contador de Caracteres
questionInput.addEventListener('input', function() {
    const currentLength = this.value.length;
    charCount.textContent = `${currentLength}/300`;
    
    if (currentLength > 300) {
        charCount.style.color = '#ff453a';
        sendBtn.disabled = true;
        sendBtn.style.opacity = '0.5';
    } else {
        charCount.style.color = '#86868b';
        sendBtn.disabled = false;
        sendBtn.style.opacity = '1';
    }
});

// FUNÇÃO 1: Enviar Pergunta para o Firebase
sendBtn.addEventListener('click', async () => {
    const text = questionInput.value.trim();

    if (text === "" || text.length > 300) return;

    // Desabilitar botão para evitar flood
    sendBtn.disabled = true;
    sendBtn.textContent = "Enviando...";

    try {
        // Salva na coleção 'questions'
        await addDoc(collection(db, "questions"), {
            text: text,
            timestamp: serverTimestamp() // Pega a hora do servidor
        });

        // Limpa o input
        questionInput.value = '';
        charCount.textContent = '0/300';
    } catch (e) {
        console.error("Erro ao enviar: ", e);
        alert("Erro ao enviar pergunta.");
    } finally {
        sendBtn.disabled = false;
        sendBtn.textContent = "Enviar Pergunta";
    }
});

// FUNÇÃO 2: Escutar novas perguntas em Tempo Real
// Isso roda automaticamente sempre que alguém posta uma pergunta nova
const q = query(collection(db, "questions"), orderBy("timestamp", "desc"));

onSnapshot(q, (snapshot) => {
    feed.innerHTML = ''; // Limpa feed para recriar (pode ser otimizado, mas funciona bem)
    
    if (snapshot.empty) {
        feed.innerHTML = '<p style="text-align:center; color:#666;">Seja o primeiro a perguntar.</p>';
        return;
    }

    snapshot.forEach((doc) => {
        const data = doc.data();
        const card = createQuestionCard(data.text, data.timestamp);
        feed.appendChild(card);
    });
});

// Função Auxiliar de HTML
function createQuestionCard(text, firestoreTimestamp) {
    const card = document.createElement('div');
    card.className = 'question-card';

    // Converter Timestamp do Firebase para horário legível
    let timeString = "...";
    if (firestoreTimestamp) {
        const date = firestoreTimestamp.toDate();
        timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    card.innerHTML = `
        <p>${escapeHtml(text)}</p>
        <div class="question-meta">
            <span class="dot"></span>
            <span>Anônimo • ${timeString}</span>
        </div>
    `;
    return card;
}

function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}