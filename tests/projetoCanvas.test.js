import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CANVAS_FIELDS, inspectCanvas, recordText, buildProjectPayload, readyForProject, projectSaveError } from '../src/lib/projetoCanvas.js';
import { project, generalForm, editorHarness, tick } from './helpers/projectEditor.fixture.js';

const noCanvas = payload => {
  for (const key of ['estilo', ...CANVAS_FIELDS, 'canvas_revision', 'canvas_patch']) assert.equal(payload.has(key), false, key);
};

for (const format of ['object', 'string', 'unknown', 'array', 'json-null', 'null', 'absent']) {
  test(`edição geral preserva formato ${format} sem reenviar Canvas`, () => {
    const original = project();
    if (format === 'string') original.estilo = JSON.stringify(original.estilo);
    if (format === 'unknown') original.estilo = 'formato histórico opaco';
    if (format === 'array') original.estilo = ['legado'];
    if (format === 'json-null') original.estilo = 'null';
    if (format === 'null') original.estilo = null;
    if (format === 'absent') delete original.estilo;
    const before = structuredClone(original);
    const snapshot = inspectCanvas(original);
    const form = generalForm();
    const payload = buildProjectPayload(form, snapshot, new Map(), '23');
    noCanvas(payload);
    assert.equal(payload.get('nome'), 'Novo título');
    assert.equal(payload.get('descricao'), 'Nova descrição');
    assert.deepEqual(original, before);
    assert.deepEqual(snapshot.raw.estilo, original.estilo);
  });
}

for (const key of CANVAS_FIELDS) {
  test(`alteração intencional de ${key} gera somente esse campo no patch`, () => {
    const original = project();
    const snapshot = inspectCanvas(original);
    const changes = recordText(snapshot, new Map(), key, '  Texto novo  ');
    const payload = buildProjectPayload(generalForm(), snapshot, changes, '23');
    assert.equal(payload.get('canvas_revision'), original.canvas_revision);
    assert.deepEqual(JSON.parse(payload.get('canvas_patch')), { set: { [key]: '  Texto novo  ' }, clear: [] });
    assert.equal(payload.has('estilo'), false);
    for (const column of CANVAS_FIELDS) assert.equal(payload.has(column), false);
    assert.deepEqual(snapshot.raw.estilo.widget_historico, original.estilo.widget_historico);
    assert.deepEqual(snapshot.raw.estilo[key], original.estilo[key]);
  });
}

test('limpeza intencional utiliza clear', () => {
  const snapshot = inspectCanvas(project());
  const changes = recordText(snapshot, new Map(), 'custos', '');
  const payload = buildProjectPayload(generalForm(), snapshot, changes, '23');
  assert.deepEqual(JSON.parse(payload.get('canvas_patch')), { set: {}, clear: ['custos'] });
});

test('retorno ao texto inicial remove alteração pendente', () => {
  const snapshot = inspectCanvas(project());
  let changes = recordText(snapshot, new Map(), 'custos', 'Alterado');
  changes = recordText(snapshot, changes, 'custos', snapshot.texts.custos);
  assert.equal(changes.size, 0);
  noCanvas(buildProjectPayload(generalForm(), snapshot, changes, '23'));
});

test('snapshot bruto é independente e imutável', () => {
  const original = project();
  const snapshot = inspectCanvas(original);
  original.estilo.justificativas.extra.manter = false;
  assert.equal(snapshot.raw.estilo.justificativas.extra.manter, true);
  assert.throws(() => { snapshot.raw.estilo.justificativas.w = 10; }, TypeError);
});

for (const format of [null, undefined]) {
  test(`colunas preenchidas com estilo ${format} aparecem sem conversão persistida`, () => {
    const original = project();
    original.estilo = format;
    const snapshot = inspectCanvas(original);
    assert.equal(snapshot.editable, true);
    for (const key of CANVAS_FIELDS) assert.equal(snapshot.display[key].textarea_value, original[key]);
    noCanvas(buildProjectPayload(generalForm(), snapshot, new Map(), '23'));
  });
}

test('campos ausentes e nulos não viram vazios no payload', () => {
  const original = project();
  delete original.custos;
  delete original.estilo.custos;
  original.riscos = null;
  original.estilo.riscos.textarea_value = null;
  const snapshot = inspectCanvas(original);
  assert.equal(snapshot.texts.custos, '');
  assert.equal(snapshot.texts.riscos, '');
  noCanvas(buildProjectPayload(generalForm(), snapshot, new Map(), '23'));
  assert.equal(Object.hasOwn(snapshot.raw, 'custos'), false);
  assert.equal(snapshot.raw.riscos, null);
});

for (const style of ['não é JSON', '[]', 'null', { versao: 'legada' }, { custos: 'texto direto' }]) {
  test(`formato desconhecido bloqueia edição de texto: ${JSON.stringify(style)}`, () => {
    const snapshot = inspectCanvas({ ...project(), estilo: style });
    assert.equal(snapshot.editable, false);
    assert.throws(() => recordText(snapshot, new Map(), 'custos', 'Novo'));
    noCanvas(buildProjectPayload(generalForm(), snapshot, new Map(), '23'));
  });
}

test('representações conflitantes permanecem intactas e bloqueadas', () => {
  const original = project();
  original.custos = 'Outra versão';
  const snapshot = inspectCanvas(original);
  assert.ok(snapshot.conflicts.includes('custos'));
  assert.equal(snapshot.editable, false);
  assert.equal(snapshot.raw.custos, 'Outra versão');
  assert.equal(snapshot.raw.estilo.custos.textarea_value, 'Texto custos');
  noCanvas(buildProjectPayload(generalForm(), snapshot, new Map(), '23'));
});

for (const revision of [undefined, null, '', 'a'.repeat(64) + '\n', [], {}]) {
  test(`revisão inválida bloqueia somente Canvas: ${JSON.stringify(revision)}`, () => {
    const snapshot = inspectCanvas({ ...project(), canvas_revision: revision });
    assert.equal(snapshot.editable, false);
    noCanvas(buildProjectPayload(generalForm(), snapshot, new Map(), '23'));
  });
}

test('projeto incorreto ou não carregado nunca gera payload', () => {
  assert.equal(readyForProject(null, '23'), false);
  const snapshot = inspectCanvas(project());
  assert.throws(() => buildProjectPayload(generalForm(), snapshot, new Map(), '24'));
  assert.throws(() => buildProjectPayload(generalForm(), null, new Map(), '23'));
});

test('arquivos selecionados são conservados no FormData', async () => {
  const data = generalForm();
  data.append('upload', new Blob(['conteúdo sintético']), 'arquivo-sintetico.pdf');
  const payload = buildProjectPayload(data, inspectCanvas(project()), new Map(), '23');
  assert.equal(payload.get('upload').name, 'arquivo-sintetico.pdf');
  assert.equal(await payload.get('upload').text(), 'conteúdo sintético');
  assert.equal(data.get('upload').name, 'arquivo-sintetico.pdf');
});

test('campos legados do FormData não são reenviados por engano', () => {
  const data = generalForm();
  data.append('estilo', '{}');
  data.append('custos', '');
  data.append('canvas_patch', '{}');
  noCanvas(buildProjectPayload(data, inspectCanvas(project()), new Map(), '23'));
  assert.equal(data.get('estilo'), '{}');
});

for (const value of [null, undefined, 23, {}, [], 'x'.repeat(256)]) {
  test(`texto inválido impede montagem parcial: ${JSON.stringify(value)}`, () => {
    const data = generalForm();
    assert.throws(() => buildProjectPayload(data, inspectCanvas(project()), new Map([['custos', value]]), '23'));
    noCanvas(data);
  });
}

test('falha de serialização não altera FormData original', () => {
  const snapshot = inspectCanvas(project());
  const changes = recordText(snapshot, new Map(), 'custos', 'Novo');
  const data = generalForm();
  const original = JSON.stringify;
  try {
    JSON.stringify = () => { throw new Error('Falha sintética'); };
    assert.throws(() => buildProjectPayload(data, snapshot, changes, '23'), /Falha sintética/);
  } finally { JSON.stringify = original; }
  noCanvas(data);
});

for (const status of [400, 409, 428, 503]) {
  test(`mensagem clara para HTTP ${status}`, () => {
    const error = { response: { status, data: {} } };
    assert.ok(projectSaveError(error).length > 20);
  });
}

test('resultado de commit desconhecido não é descrito como rollback', () => {
  const message = projectSaveError({ response: { status: 500, data: { code: 'PROJECT_COMMIT_UNKNOWN' } } });
  assert.match(message, /não pôde ser confirmado/);
  assert.doesNotMatch(message, /rollback/);
});

test('editor carregado envia somente os dados gerais', async () => {
  const h = editorHarness();
  assert.equal(h.view().canSave, false);
  await tick();
  const view = h.view();
  assert.equal(view.canSave, true);
  await view.onSubmit(generalForm());
  assert.equal(h.puts.length, 1);
  noCanvas(h.puts[0].data);
  assert.deepEqual(h.navigations, ['/projetos']);
});

test('último texto capturado é enviado mesmo antes de outro render', async () => {
  const h = editorHarness();
  h.view(); await tick();
  const view = h.view();
  view.handleTextChange('custos', 'Última tecla');
  await view.onSubmit(generalForm());
  assert.deepEqual(JSON.parse(h.puts[0].data.get('canvas_patch')), { set: { custos: 'Última tecla' }, clear: [] });
});

for (const kind of ['network', 'wrong-id']) {
  test(`falha de carregamento ${kind} bloqueia envio`, async () => {
    const h = editorHarness({ get: async () => {
      if (kind === 'network') throw new Error('Falha sintética');
      return { data: { ...project(), id: 99 } };
    } });
    h.view(); await tick();
    const view = h.view();
    assert.equal(view.canSave, false);
    assert.ok(view.loadError);
    await view.onSubmit(generalForm());
    assert.equal(h.puts.length, 0);
  });
}

test('troca de ID bloqueia callback antigo e descarta resposta anterior', async () => {
  const resolvers = [];
  const h = editorHarness({ get: () => new Promise(resolve => resolvers.push(resolve)) });
  const old = h.view();
  h.route('24');
  assert.equal(h.gets[0].config.signal.aborted, true);
  resolvers[0]({ data: project() });
  resolvers[1]({ data: { ...project(), id: 24 } });
  await tick();
  const current = h.view();
  assert.equal(current.canvasSnapshot.raw.id, 24);
  await old.onSubmit(generalForm());
  assert.equal(h.puts.length, 0);
});

test('callback de projeto previamente carregado não grava após troca de rota', async () => {
  const h = editorHarness();
  h.view(); await tick();
  const old = h.view();
  h.route('24');
  await old.onSubmit(generalForm());
  assert.equal(h.puts.length, 0);
});

for (const status of [400, 409, 428, 503]) {
  test(`rejeição HTTP ${status} mantém textos e não repete automaticamente`, async () => {
    const h = editorHarness({ put: async () => { throw { response: { status, data: {} } }; } });
    h.view(); await tick();
    const view = h.view();
    view.handleTextChange('custos', 'Preservar rascunho');
    await view.onSubmit(generalForm());
    assert.equal(h.puts.length, 1);
    assert.equal(h.navigations.length, 0);
    assert.ok(h.view().saveError);
    await h.view().onSubmit(generalForm());
    if ([409, 428].includes(status)) {
      assert.equal(h.view().canSave, false);
      assert.equal(h.puts.length, 1);
    } else assert.equal(JSON.parse(h.puts[1].data.get('canvas_patch')).set.custos, 'Preservar rascunho');
  });
}

test('submissões simultâneas não duplicam o envio', async () => {
  let finish;
  const h = editorHarness({ put: () => new Promise(resolve => { finish = resolve; }) });
  h.view(); await tick();
  const view = h.view();
  const pending = view.onSubmit(generalForm());
  await view.onSubmit(generalForm());
  assert.equal(h.puts.length, 1);
  finish(h.confirmResponse());
  await pending;
});

test('snapshots de inicialização do grid não são alterações intencionais', async () => {
  const h = editorHarness();
  h.view(); await tick();
  const view = h.view();
  view.setCanvasData({});
  view.setCanvasData({ custos: { textarea_value: '' } });
  await h.view().onSubmit(generalForm());
  noCanvas(h.puts[0].data);
});

test('resposta incompleta bloqueia salvamento mesmo com ID correto', async () => {
  const h = editorHarness({ project: { id: 23 } });
  h.view(); await tick();
  const view = h.view();
  assert.equal(view.canSave, false);
  assert.ok(view.loadError);
  await view.onSubmit(generalForm());
  assert.equal(h.puts.length, 0);
});

test('novos textos digitados durante envio não são descartados por navegação automática', async () => {
  let finish;
  const h = editorHarness({ put: () => new Promise(resolve => { finish = resolve; }) });
  h.view(); await tick();
  const view = h.view();
  view.handleTextChange('custos', 'Primeira versão');
  const pending = view.onSubmit(generalForm());
  view.handleTextChange('custos', 'Mais texto durante o envio');
  finish(h.confirmResponse());
  await pending;
  assert.equal(h.navigations.length, 0);
  assert.match(h.view().saveError, /novos textos/);
  assert.equal(JSON.parse(h.puts[0].data.get('canvas_patch')).set.custos, 'Primeira versão');
});

async function pendingEditor() {
  let finish;
  let calls = 0;
  const h = editorHarness({ put: (_url, data) => ++calls === 1
    ? new Promise(resolve => { finish = resolve; }) : Promise.resolve(h.confirmResponse(data)) });
  h.view(); await tick();
  const view = h.view();
  view.handleTextChange('custos', 'B');
  const pending = view.onSubmit(generalForm());
  return { h, view, pending, confirm: () => finish(h.confirmResponse(h.puts[0].data)) };
}

for (const finalText of [project().custos, 'C', '']) {
  test(`A → B → ${finalText || 'limpeza'}: novo envio usa a versão confirmada de B`, async () => {
    const { h, view, pending, confirm } = await pendingEditor();
    view.handleTextChange('custos', finalText);
    confirm(); await pending;
    const current = h.view();
    assert.equal(h.navigations.length, 0);
    assert.equal(current.canSave, true);
    assert.equal(current.canvasSnapshot.texts.custos, 'B');
    const revisionB = current.canvasSnapshot.raw.canvas_revision;
    assert.notEqual(revisionB, project().canvas_revision);
    await current.onSubmit(generalForm());
    const sent = h.puts[1].data;
    assert.equal(sent.get('canvas_revision'), revisionB);
    const patch = JSON.parse(sent.get('canvas_patch'));
    if (finalText === '') assert.deepEqual(patch.clear, ['custos']);
    else assert.equal(patch.set.custos, finalText);
    assert.equal(h.view().canvasSnapshot.texts.custos, finalText);
    assert.equal(h.navigations.length, 1);
  });
}

test('dois campos editados durante a mesma requisição continuam pendentes', async () => {
  const { h, view, pending, confirm } = await pendingEditor();
  view.handleTextChange('custos', project().custos);
  view.handleTextChange('justificativas', 'Nova justificativa');
  confirm(); await pending;
  await h.view().onSubmit(generalForm());
  assert.deepEqual(JSON.parse(h.puts[1].data.get('canvas_patch')).set,
    { custos: project().custos, justificativas: 'Nova justificativa' });
});

test('sucesso sem novas entradas atualiza snapshot e navega', async () => {
  const { h, pending, confirm } = await pendingEditor();
  confirm(); await pending;
  assert.equal(h.view().canvasSnapshot.texts.custos, 'B');
  assert.notEqual(h.view().canvasSnapshot.raw.canvas_revision, project().canvas_revision);
  assert.equal(h.navigations.length, 1);
});

for (const data of [{}, { message: 'Nenhuma alteração detectada.', canvas_revision: 'b'.repeat(64) },
  { ...project(), canvas_revision: undefined }, { ...project(), id: 99 }]) {
  test(`resposta incompleta/incorreta bloqueia reenvio: ${Object.keys(data).length} propriedades`, async () => {
    let finish;
    const h = editorHarness({ put: () => new Promise(resolve => { finish = resolve; }) });
    h.view(); await tick();
    const view = h.view();
    view.handleTextChange('custos', 'B');
    const pending = view.onSubmit(generalForm());
    view.handleTextChange('custos', 'C');
    finish({ data }); await pending;
    assert.equal(h.view().canSave, false);
    assert.ok(h.view().saveError);
    assert.equal(h.navigations.length, 0);
    await h.view().onSubmit(generalForm());
    assert.equal(h.puts.length, 1);
  });
}

test('resposta completa que não confirma o texto enviado também bloqueia reenvio', async () => {
  const h = editorHarness({ put: async () => ({ data: { ...project(), canvas_revision: 'b'.repeat(64) } }) });
  h.view(); await tick();
  const view = h.view();
  view.handleTextChange('custos', 'B');
  await view.onSubmit(generalForm());
  assert.equal(h.view().canSave, false);
  assert.equal(h.navigations.length, 0);
});

test('falha de rede mantém rascunho e bloqueia repetição de resultado desconhecido', async () => {
  const h = editorHarness({ put: async () => { throw new Error('Rede interrompida'); } });
  h.view(); await tick();
  const view = h.view();
  view.handleTextChange('custos', 'Meu rascunho');
  await view.onSubmit(generalForm());
  assert.equal(h.view().canSave, false);
  assert.equal(h.navigations.length, 0);
  await h.view().onSubmit(generalForm());
  assert.equal(h.puts.length, 1);
});

test('alteração geral concorrente não cria patch contra um Canvas que não foi editado', async () => {
  let finish;
  const h = editorHarness({ put: () => new Promise(resolve => { finish = resolve; }) });
  h.view(); await tick();
  const pending = h.view().onSubmit(generalForm());
  const response = project();
  response.custos = response.estilo.custos.textarea_value = 'Alteração externa';
  response.canvas_revision = 'b'.repeat(64);
  finish({ data: response }); await pending;
  assert.equal(h.view().canvasSnapshot.texts.custos, 'Alteração externa');
  assert.equal(h.puts[0].data.has('canvas_patch'), false);
  assert.equal(h.navigations.length, 1);
});
