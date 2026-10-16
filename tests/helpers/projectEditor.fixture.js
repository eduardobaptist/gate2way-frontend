import fs from 'node:fs';
import vm from 'node:vm';
import * as canvas from '../../src/lib/projetoCanvas.js';

export function project() {
  const columns = Object.fromEntries(canvas.CANVAS_FIELDS.map(key => [key, `Texto ${key}`]));
  const estilo = Object.fromEntries(Object.entries(columns).map(([key, textarea_value]) =>
    [key, { x: 0, y: 0, w: 2, h: 2, textarea_value, extra: { manter: true } }]));
  estilo.widget_historico = { conteudo: 'Preservar', propriedades: [1, null] };
  return { id: 23, nome: 'Título sintético', descricao: 'Descrição sintética',
    canvas_revision: 'a'.repeat(64), ...columns, estilo, Programa: { id: 1 } };
}

// Execute the actual editor's hook/controller portion without React, JSX,
// browser services or HTTP. This does not simulate GridStack rendering.
export function editorHarness(options = {}) {
  const source = fs.readFileSync(new URL('../../src/pages/projetos/edit/ProjetosEdit.jsx', import.meta.url), 'utf8');
  const body = source.split('export const ProjetosEdit = () => {')[1].split('  return (\n    <MainWrapper')[0];
  if (!body) throw new Error('Controller do editor não localizado');
  const slots = [];
  let cursor = 0;
  let route = '23';
  const effects = [];
  const gets = [];
  const puts = [];
  const notices = [];
  const navigations = [];
  let persisted = structuredClone(options.project || project());
  function confirmResponse(formData = puts.at(-1)?.data) {
    const patch = formData.get('canvas_patch');
    for (const [key, value] of formData.entries()) {
      if (!['canvas_patch', 'canvas_revision'].includes(key)) persisted[key] = value;
    }
    if (patch) {
      const { set, clear } = JSON.parse(patch);
      const style = typeof persisted.estilo === 'string' ? JSON.parse(persisted.estilo) : structuredClone(persisted.estilo || {});
      for (const [key, text] of [...Object.entries(set), ...clear.map(key => [key, ''])]) {
        persisted[key] = text;
        style[key] = { ...style[key], textarea_value: text };
      }
      persisted.estilo = typeof persisted.estilo === 'string' ? JSON.stringify(style) : style;
    }
    persisted.canvas_revision = puts.length.toString(16).padStart(64, '0');
    return { data: structuredClone(persisted) };
  }
  const same = (a, b) => a && b && a.length === b.length && a.every((value, index) => Object.is(value, b[index]));
  const navigate = target => navigations.push(target);
  const toast = data => notices.push(data);
  const context = {
    ...canvas, AbortController, FormData,
    useState(value) {
      const index = cursor++;
      if (!slots[index]) slots[index] = { value };
      return [slots[index].value, next => { slots[index].value = typeof next === 'function' ? next(slots[index].value) : next; }];
    },
    useRef(value) {
      const index = cursor++;
      if (!slots[index]) slots[index] = { current: value };
      return slots[index];
    },
    useCallback(fn, deps) {
      const index = cursor++;
      if (!slots[index] || !same(slots[index].deps, deps)) slots[index] = { deps, fn };
      return slots[index].fn;
    },
    useEffect(fn, deps) {
      const index = cursor++;
      if (!slots[index] || !same(slots[index].deps, deps)) {
        effects.push(() => { slots[index]?.cleanup?.(); slots[index] = { deps, cleanup: fn() }; });
      }
    },
    useParams: () => ({ id: route }), useIsMobile: () => false,
    useNavigate: () => navigate, useToast: () => ({ toast }),
    api: {
      async get(url, config) {
        gets.push({ url, config });
        return options.get ? options.get(url, config) : { data: options.project || project() };
      },
      async put(url, data, config) {
        puts.push({ url, data, config });
        return options.put ? options.put(url, data, config) : confirmResponse(data);
      },
    },
  };
  vm.runInNewContext(`globalThis.render = () => {${body}\nreturn { onSubmit, handleTextChange, handleSave, setCanvasData, canSave, loadError, saveError, canvasSnapshot, projectData }; };`, context);
  function view() {
    cursor = 0;
    const result = context.render();
    while (effects.length) effects.shift()();
    return result;
  }
  return { view, gets, puts, notices, navigations, confirmResponse, route(id) { route = id; return view(); },
    unmount() { for (const slot of slots) slot?.cleanup?.(); } };
}

export const tick = () => new Promise(resolve => setImmediate(resolve));
export const generalForm = () => {
  const data = new FormData();
  data.append('nome', 'Novo título');
  data.append('descricao', 'Nova descrição');
  return data;
};
