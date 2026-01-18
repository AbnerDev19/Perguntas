// --- IMPORTAÇÕES (Versão Web/CDN) ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- SUA CONFIGURAÇÃO (Já inserida) ---
const firebaseConfig = {
  apiKey: "AIzaSyDAjX4LQ8FER3k6lkFFzSVJdgnlx-WqdC0",
  authDomain: "projeto-alene.firebaseapp.com",
  projectId: "projeto-alene",
  storageBucket: "projeto-alene.firebasestorage.app",
  messagingSenderId: "159211713850",
  appId: "1:159211713850:web:20c721981195a2c7690c03",
  measurementId: "G-P61PNL7H7Z"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app); // Opcional, mas já deixei configurado
const db = getFirestore(app);        // Banco de dados

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

// FUNÇÃO 1: Enviar Pergunta para o Firestore
sendBtn.addEventListener('click', async () => {
    const text = questionInput.value.trim();

    if (text === "" || text.length > 300) return;

    // Feedback visual
    sendBtn.disabled = true;
    sendBtn.textContent = "Enviando...";

    try {
        // Salva na coleção 'questions' do seu projeto-alene
        await addDoc(collection(db, "questions"), {
            text: text,
            timestamp: serverTimestamp()
        });

        // Limpa o input
        questionInput.value = '';
        charCount.textContent = '0/300';
    } catch (e) {
        console.error("Erro ao enviar: ", e);
        alert("Erro ao enviar pergunta. Verifique se configurou as Regras do Firestore.");
    } finally {
        sendBtn.disabled = false;
        sendBtn.textContent = "Enviar Pergunta";
    }
});

// FUNÇÃO 2: Escutar novas perguntas em Tempo Real
const q = query(collection(db, "questions"), orderBy("timestamp", "desc"));

onSnapshot(q, (snapshot) => {
    feed.innerHTML = ''; 
    
    if (snapshot.empty) {
        feed.innerHTML = '<p style="text-align:center; color:#666;">Seja o primeiro a perguntar.</p>';
        return;
    }

    snapshot.forEach((doc) => {
        const data = doc.data();
        // Proteção contra erro caso o timestamp ainda não tenha sido gerado pelo servidor
        const ts = data.timestamp;
        const card = createQuestionCard(data.text, ts);
        feed.appendChild(card);
    });
});

// Função Auxiliar de HTML
function createQuestionCard(text, firestoreTimestamp) {
    const card = document.createElement('div');
    card.className = 'question-card';

    let timeString = "Agora";
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
    if (!text) return "";
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}