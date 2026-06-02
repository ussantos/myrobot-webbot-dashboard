const storageKey = "myrobot-webbot-dashboard";

const messages = document.querySelector("#messages");
const form = document.querySelector("#botForm");
const input = document.querySelector("#messageInput");
const channelSelect = document.querySelector("#channelSelect");
const clearButton = document.querySelector("#clearButton");
const totalMetric = document.querySelector("#totalMetric");
const leadMetric = document.querySelector("#leadMetric");
const scoreMetric = document.querySelector("#scoreMetric");
const topicChart = document.querySelector("#topicChart");
const historyList = document.querySelector("#historyList");

let records = loadRecords();

const topics = {
  Valores: ["valor", "preco", "mensalidade", "investimento", "quanto"],
  Horarios: ["horario", "horarios", "turno", "aula", "agenda"],
  Visita: ["visita", "conhecer", "agendar", "presencial"],
  Cursos: ["curso", "robotica", "ia", "programacao", "jogos"],
  Perfil: ["filho", "idade", "gosta", "interesse", "perfil"],
};

function loadRecords() {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) || [];
  } catch {
    return [];
  }
}

function saveRecords() {
  localStorage.setItem(storageKey, JSON.stringify(records));
}

function classify(message) {
  const normalized = message
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  for (const [topic, terms] of Object.entries(topics)) {
    if (terms.some((term) => normalized.includes(term))) return topic;
  }

  return "Outros";
}

function buildResponse(topic) {
  const responses = {
    Valores:
      "Posso explicar os valores por modalidade e indicar o melhor contato para confirmar a turma disponivel.",
    Horarios:
      "Temos horarios que variam por turma. O proximo passo seria perguntar idade do aluno e disponibilidade.",
    Visita:
      "Perfeito. O bot poderia coletar nome, telefone e melhor horario para agendar uma visita.",
    Cursos:
      "A escola pode apresentar robotica, programacao e inteligencia artificial conforme a idade e objetivo do aluno.",
    Perfil:
      "Com esse perfil, o atendimento pode recomendar uma aula experimental e registrar os interesses do aluno.",
    Outros:
      "Entendi. Em um projeto real, essa mensagem iria para uma fila de atendimento ou para uma base de conhecimento.",
  };

  return responses[topic];
}

function isLead(topic) {
  return ["Valores", "Visita", "Cursos", "Perfil"].includes(topic);
}

function addMessage(role, text, meta = "") {
  const item = document.createElement("article");
  item.className = `message ${role}`;
  item.innerHTML = `<small>${role === "user" ? "Visitante" : "Webbot"}${meta ? ` - ${meta}` : ""}</small><div>${text}</div>`;
  messages.appendChild(item);
  messages.scrollTop = messages.scrollHeight;
}

function submitMessage(message) {
  const topic = classify(message);
  const channel = channelSelect.value;
  const response = buildResponse(topic);
  const record = {
    message,
    response,
    topic,
    channel,
    lead: isLead(topic),
    score: topic === "Outros" ? 72 : 92,
    createdAt: new Date().toISOString(),
  };

  records.push(record);
  saveRecords();
  addMessage("user", message, channel);
  addMessage("bot", response, topic);
  renderDashboard();
}

function countByTopic() {
  return records.reduce((acc, record) => {
    acc[record.topic] = (acc[record.topic] || 0) + 1;
    return acc;
  }, {});
}

function renderDashboard() {
  const total = records.length;
  const leads = records.filter((record) => record.lead).length;
  const average = total
    ? Math.round(records.reduce((sum, record) => sum + record.score, 0) / total)
    : 0;

  totalMetric.textContent = total;
  leadMetric.textContent = leads;
  scoreMetric.textContent = `${average}%`;

  const counts = countByTopic();
  const rows = Object.entries({ Valores: 0, Horarios: 0, Visita: 0, Cursos: 0, Perfil: 0, Outros: 0 }).map(
    ([topic]) => [topic, counts[topic] || 0]
  );
  const max = Math.max(1, ...rows.map(([, value]) => value));

  topicChart.innerHTML = rows
    .map(([topic, value]) => {
      const width = Math.max(6, Math.round((value / max) * 100));
      return `<div class="bar-row"><span>${topic}</span><div class="bar-track"><div class="bar-fill" style="width: ${width}%"></div></div><strong>${value}</strong></div>`;
    })
    .join("");

  historyList.innerHTML = records.length
    ? records
        .slice(-6)
        .reverse()
        .map(
          (record) =>
            `<article class="history-item"><strong>${record.topic} - ${record.channel}</strong><span>${record.message}</span></article>`
        )
        .join("")
    : '<p class="status">Nenhuma conversa registrada ainda.</p>';
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const message = input.value.trim();
  if (!message) return;
  submitMessage(message);
  input.value = "";
});

document.querySelectorAll("[data-message]").forEach((button) => {
  button.addEventListener("click", () => {
    input.value = button.dataset.message;
    input.focus();
  });
});

clearButton.addEventListener("click", () => {
  records = [];
  saveRecords();
  messages.innerHTML = "";
  addMessage(
    "bot",
    "Envie mensagens de exemplo para ver o historico e os indicadores mudarem em tempo real."
  );
  renderDashboard();
});

addMessage(
  "bot",
  "Envie uma pergunta de atendimento. O painel vai contar assuntos, leads e satisfacao simulada."
);
records.forEach((record) => {
  addMessage("user", record.message, record.channel);
  addMessage("bot", record.response, record.topic);
});
renderDashboard();
