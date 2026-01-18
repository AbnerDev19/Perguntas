// --- IMPORTAÇÕES ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- SUA CONFIGURAÇÃO ---
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
const analytics = getAnalytics(app);
const db = getFirestore(app);

// --- LÓGICA DO SITE ---
const sendBtn = document.getElementById('sendBtn');
const questionInput = document.getElementById('questionInput');
const charCount = document.querySelector('.char-count');
const statusMessage = document.getElementById('statusMessage');

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

// Enviar Mensagem
sendBtn.addEventListener('click', async () => {
    const text = questionInput.value.trim();

    if (text === "" || text.length > 300) return;

    sendBtn.disabled = true;
    sendBtn.textContent = "Enviando...";

    try {
        await addDoc(collection(db, "questions"), {
            text: text,
            timestamp: serverTimestamp()
        });

        // Limpa o input
        questionInput.value = '';
        charCount.textContent = '0/300';
        
        // Feedback visual de sucesso
        statusMessage.style.opacity = '1';
        setTimeout(() => {
            statusMessage.style.opacity = '0';
        }, 3000);

    } catch (e) {
        console.error("Erro: ", e);
        alert("Erro ao enviar. Tente novamente.");
    } finally {
        sendBtn.disabled = false;
        sendBtn.textContent = "Enviar Mensagem";
    }
});