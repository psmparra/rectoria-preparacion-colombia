const test = require('node:test');
const assert = require('node:assert/strict');
const {validateBank,score,shuffle}=require('../core');
const bank=require('../bank.json');
test('Banco íntegro: 140 ítems, 40 casos, tres alternativas y clave única',()=>{
  assert.deepEqual(validateBank(bank),[]);
  assert.equal(bank.situations.length,40);
  assert.equal(new Set(bank.questions.map(q=>q.id)).size,140);
});
test('Claves y contenido malformados se rechazan',()=>{
  const invalid=structuredClone(bank);invalid.questions[0].correct=3;invalid.questions[1].options.pop();invalid.questions[2].id=1;
  assert.ok(validateBank(invalid).length>=3);
  assert.ok(validateBank({questions:[],situations:[]}).length);
});
test('Calificación exacta, pendientes incluidas y límite superior al 90 %',()=>{
  const answers=Object.fromEntries(bank.questions.slice(0,127).map(q=>[q.id,q.correct]));
  const result=score(bank.questions,answers);
  assert.equal(result.correct,127);assert.equal(result.answered,127);assert.ok(result.percent>90);
  delete answers[127];assert.equal(score(bank.questions,answers).percent,90);
  assert.equal(score(bank.questions,{}).percent,0);
  assert.equal(score(bank.questions,Object.fromEntries(bank.questions.map(q=>[q.id,q.correct]))).percent,100);
});
test('Desglose por competencias y preguntas incorrectas',()=>{
  const q=bank.questions[0];const r=score(bank.questions,{[q.id]:(q.correct+1)%3});assert.equal(r.correct,0);assert.equal(r.answered,1);
  assert.equal(Object.values(r.competencies).reduce((n,c)=>n+c.total,0),140);
});
test('Selección aleatoria sin duplicados y sin mutar el original',()=>{
  const original=bank.questions.map(q=>q.id),result=shuffle(original);assert.equal(new Set(result).size,140);assert.deepEqual(original,bank.questions.map(q=>q.id));
});
