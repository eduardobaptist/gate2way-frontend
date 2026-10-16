export const CANVAS_FIELDS = Object.freeze([
  'justificativas', 'objsmart', 'beneficios', 'produto', 'requisitos',
  'stakeholders', 'equipe', 'premissas', 'grupo_de_entrega', 'restricoes',
  'riscos', 'linha_do_tempo', 'custos',
]);
const own = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const revisionValid = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value) && value.length === 64;

function freeze(value) {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}

// Keep the raw representation separate from the display-only fallback widgets.
// No value produced here is a replacement payload for estilo.
export function inspectCanvas(project) {
  const source = project || {};
  const raw = structuredClone(Object.fromEntries(
    ['id', 'canvas_revision', 'estilo', ...CANVAS_FIELDS]
      .filter(key => own(source, key)).map(key => [key, source[key]])
  ));
  let style = raw.estilo;
  let known = true;
  if (style == null) style = {};
  else if (typeof style === 'string') {
    try { style = JSON.parse(style); } catch { known = false; }
  }
  if (!record(style)) known = false;
  if (known && Object.keys(style).length && !CANVAS_FIELDS.some(key =>
    own(style, key) && record(style[key]) && own(style[key], 'textarea_value'))) known = false;

  const display = {};
  const texts = {};
  const conflicts = [];
  for (const key of CANVAS_FIELDS) {
    const column = raw[key];
    const widget = known && own(style, key) ? style[key] : undefined;
    if (column != null && typeof column !== 'string') known = false;
    if (widget !== undefined && (!record(widget) || !own(widget, 'textarea_value') ||
        (widget.textarea_value != null && typeof widget.textarea_value !== 'string'))) known = false;
    if (record(widget) && own(widget, 'textarea_value') && column != null && widget.textarea_value !== column) {
      conflicts.push(key);
    }
    if (record(widget) && ['x', 'y', 'w', 'h'].some(axis => own(widget, axis) &&
        (!Number.isInteger(widget[axis]) || widget[axis] < (axis === 'w' || axis === 'h' ? 1 : 0) || widget[axis] > 10))) {
      known = false;
    }
    const text = record(widget) && typeof widget.textarea_value === 'string'
      ? widget.textarea_value : typeof column === 'string' ? column : '';
    texts[key] = text;
    display[key] = { ...(record(widget) ? widget : {}), textarea_value: text };
  }
  const editable = known && !conflicts.length && revisionValid(raw.canvas_revision);
  const reason = !known
    ? 'Formato legado não reconhecido com segurança. O Canvas será preservado; você pode editar as informações gerais.'
    : conflicts.length
      ? 'Há diferenças entre os registros do Canvas. A edição do Canvas está bloqueada para preservar ambas as versões; as informações gerais podem ser editadas.'
      : !revisionValid(raw.canvas_revision)
        ? 'A API não forneceu uma revisão válida. O Canvas permanece protegido; apenas as informações gerais podem ser editadas.'
        : '';
  return freeze({ raw, display, texts, known, editable, conflicts, reason });
}

export function readyForProject(snapshot, id) {
  return !!snapshot && snapshot.raw.id != null && String(snapshot.raw.id) === String(id);
}

export function assertLoadedProject(project, id) {
  if (!record(project) || project.id == null || String(project.id) !== String(id) ||
      typeof project.nome !== 'string' || typeof project.descricao !== 'string') {
    throw new Error('A API não retornou o projeto solicitado com os dados necessários. O salvamento está bloqueado.');
  }
}

// Only actual textarea events call this. GridStack snapshots never mark dirty.
export function recordText(snapshot, changes, key, value) {
  if (!snapshot?.editable || !CANVAS_FIELDS.includes(key) || typeof value !== 'string') {
    throw new Error('Não foi possível registrar uma alteração segura do Canvas.');
  }
  const next = new Map(changes);
  if (value === snapshot.texts[key]) next.delete(key);
  else next.set(key, value);
  return next;
}

export function reconcileCanvasResponse(data, previous, submitted, latestTexts, editedAfterRequest, id) {
  assertLoadedProject(data, id);
  if (!revisionValid(data.canvas_revision) || ['estilo', ...CANVAS_FIELDS].some(key => !own(data, key))) {
    throw new Error('A API confirmou o envio, mas não retornou o Canvas completo e sua revisão. Novo salvamento bloqueado até reconciliação; mantenha os textos desta tela.');
  }
  const snapshot = inspectCanvas(data);
  if ((previous.editable || editedAfterRequest.size) && !snapshot.editable) {
    throw new Error('A versão confirmada exige revisão antes de outro salvamento. Os textos do editor foram mantidos.');
  }
  for (const [key, text] of submitted) {
    if (snapshot.texts[key] !== text) throw new Error('A resposta não confirmou os textos enviados. Novo salvamento bloqueado; preserve seu rascunho.');
  }
  const texts = { ...snapshot.texts };
  let changes = new Map();
  for (const key of editedAfterRequest) {
    texts[key] = latestTexts[key];
    changes = recordText(snapshot, changes, key, latestTexts[key]);
  }
  return { snapshot, texts, changes };
}

export function buildProjectPayload(formData, snapshot, changes, id) {
  if (!readyForProject(snapshot, id)) throw new Error('Aguarde o carregamento completo do projeto correto antes de salvar.');
  const set = {};
  const clear = [];
  if (changes.size && !snapshot.editable) throw new Error(snapshot.reason);
  for (const [key, value] of changes) {
    if (!CANVAS_FIELDS.includes(key) || typeof value !== 'string' || Array.from(value).length > 255) {
      throw new Error('O texto de cada campo do Canvas deve ter até 255 caracteres.');
    }
    if (value === snapshot.texts[key]) continue;
    if (value === '') clear.push(key);
    else set[key] = value;
  }
  let serialized;
  if (Object.keys(set).length || clear.length) {
    // Serialize completely before modifying FormData; failure must not send a partial patch.
    serialized = JSON.stringify({ set, clear });
    if (typeof serialized !== 'string') throw new Error('Não foi possível serializar as alterações do Canvas.');
  }
  const payload = new FormData();
  const reserved = new Set(['estilo', ...CANVAS_FIELDS, 'canvas_revision', 'canvas_patch']);
  for (const [key, value] of formData.entries()) {
    if (!reserved.has(key)) payload.append(key, value);
  }
  if (serialized !== undefined) {
    payload.append('canvas_revision', snapshot.raw.canvas_revision);
    payload.append('canvas_patch', serialized);
  }
  return payload;
}

export function projectSaveError(error) {
  const status = error?.response?.status;
  const code = error?.response?.data?.code;
  if (code === 'PROJECT_COMMIT_UNKNOWN') return 'O resultado da atualização não pôde ser confirmado. Consulte o projeto antes de repetir o envio.';
  if (status === 409) return 'O Canvas mudou ou seu formato exige revisão. Os textos digitados foram mantidos. Consulte a versão atual e reconcilie as alterações antes de salvar novamente.';
  if (status === 428) return 'A revisão do Canvas está ausente ou o contrato da API mudou. Os textos foram mantidos; recarregue o projeto e confira a compatibilidade da API.';
  if (status === 503) return 'A API não confirmou as condições seguras de armazenamento. Nada será reenviado automaticamente; seus textos foram mantidos.';
  if (status === 400) return error.response.data.message || 'As alterações foram rejeitadas pela validação. Confira os campos; seus textos foram mantidos.';
  return error?.response?.data?.message || error?.message || 'Erro ao atualizar projeto. Seus textos foram mantidos.';
}
