(function(root) {
  'use strict';
  function validateBank(bank) {
    const errors = [];
    if (!bank || !Array.isArray(bank.questions) || !Array.isArray(bank.situations)) return ['Estructura inválida: se requieren questions y situations.'];
    if (bank.questions.length !== 140) errors.push(`Se requieren exactamente 140 ítems; recibidos: ${bank.questions.length}.`);
    const ids = new Set(), texts = new Set(), situationIds = new Set();
    bank.situations.forEach(s => {
      if (!s || typeof s.id !== 'string' || !s.id || typeof s.text !== 'string' || !s.text.trim() || situationIds.has(s.id)) errors.push('Situación inválida o duplicada.');
      else situationIds.add(s.id);
    });
    bank.questions.forEach((q, i) => {
      if (!q || typeof q !== 'object') { errors.push(`Ítem ${i + 1} inválido.`); return; }
      const label = `Pregunta ${q.id ?? i + 1}`;
      if (!Number.isInteger(q.id) || q.id < 1 || q.id > 140 || ids.has(q.id)) errors.push(`${label}: número inválido o duplicado.`);
      ids.add(q.id);
      if (typeof q.text !== 'string' || !q.text.trim() || texts.has(q.text)) errors.push(`${label}: enunciado vacío o duplicado.`);
      texts.add(q.text);
      if (!Array.isArray(q.options) || q.options.length !== 3 || q.options.some(o => typeof o !== 'string' || !o.trim()) || new Set(q.options).size !== 3) errors.push(`${label}: deben existir tres alternativas distintas.`);
      if (![0, 1, 2].includes(q.correct)) errors.push(`${label}: clave única inválida (0, 1 o 2).`);
      if (typeof q.explanation !== 'string' || !q.explanation.trim()) errors.push(`${label}: falta retroalimentación original.`);
      if (typeof q.competency !== 'string' || !q.competency.trim()) errors.push(`${label}: falta competencia.`);
      if (q.situationId && !situationIds.has(q.situationId)) errors.push(`${label}: situación inexistente.`);
    });
    if (!bank.source || typeof bank.source !== 'string') errors.push('Falta identificar los documentos originales.');
    if (bank.verified !== true) errors.push('Falta confirmar el cotejo entre cuadernillo y solucionario.');
    return errors;
  }
  function score(questions, answers) {
    const competencies = {};
    let correct = 0, answered = 0;
    questions.forEach(q => {
      const c = competencies[q.competency] ||= { total: 0, correct: 0, answered: 0 };
      c.total++;
      if ([0,1,2].includes(answers[q.id])) { answered++; c.answered++; }
      if (answers[q.id] === q.correct) { correct++; c.correct++; }
    });
    return { total: questions.length, answered, correct, percent: questions.length ? correct / questions.length * 100 : 0, competencies };
  }
  function shuffle(items, random = Math.random) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [result[i], result[j]] = [result[j], result[i]]; }
    return result;
  }
  const api = { validateBank, score, shuffle };
  if (typeof module !== 'undefined') module.exports = api;
  root.RectoriaCore = api;
})(typeof window === 'undefined' ? globalThis : window);
