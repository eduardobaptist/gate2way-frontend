import React, { useEffect, useRef, useState } from "react";
import { GridStack } from "gridstack";
import "gridstack/dist/gridstack.min.css";
import "gridstack/dist/gridstack-extra.min.css";

export const TabCanvas = ({ initialData }) => {
  const gridRef = useRef(null);
  const [grid, setGrid] = useState(null);
  const [widgetsLoaded, setWidgetsLoaded] = useState(false);

  /* inicializando o gridstack */
  useEffect(() => {
    if (!gridRef.current || grid) return;

    const newGrid = GridStack.init(
      {
        float: true,
        cellHeight: "60px",
        column: 10,
        animate: false, // Sem animação para read-only
        margin: 6,
        disableOneColumnMode: true,
        row: 10,
        maxRow: 10,
        staticGrid: true, // Grid totalmente estático
        disableDrag: true, // Não permite arrastar
        disableResize: true, // Não permite redimensionar
      },
      gridRef.current
    );

    setGrid(newGrid);

    return () => {
      if (newGrid) {
        newGrid.destroy(false);
      }
    };
  }, []);

  /* adiciona widgets ao gridstack APENAS UMA VEZ */
  useEffect(() => {
    if (!grid || widgetsLoaded) {
      return;
    }

    console.log("ReadOnlyProjectCanvas - initialData recebido:", initialData);

    const items = [
      {
        id: "justificativas",
        x: 0,
        y: 0,
        w: 2,
        h: 3,
        content: "Justificativas",
        bg: "bg-yellow-200",
        bg_header: "bg-yellow-100",
      },
      {
        id: "objsmart",
        x: 0,
        y: 3,
        w: 2,
        h: 3,
        content: "Objetivo SMART",
        bg: "bg-yellow-200",
        bg_header: "bg-yellow-100",
      },
      {
        id: "beneficios",
        x: 0,
        y: 6,
        w: 2,
        h: 4,
        content: "Benefícios",
        bg: "bg-yellow-200",
        bg_header: "bg-yellow-100",
      },
      {
        id: "produto",
        x: 2,
        y: 0,
        w: 2,
        h: 3,
        content: "Produto",
        bg: "bg-purple-200",
        bg_header: "bg-purple-100",
      },
      {
        id: "requisitos",
        x: 2,
        y: 3,
        w: 2,
        h: 7,
        content: "Requisitos",
        bg: "bg-purple-200",
        bg_header: "bg-purple-100",
      },
      {
        id: "stakeholders",
        x: 4,
        y: 0,
        w: 2,
        h: 3,
        content: "Partes interessadas",
        bg: "bg-pink-200",
        bg_header: "bg-pink-100",
      },
      {
        id: "equipe",
        x: 4,
        y: 3,
        w: 2,
        h: 3,
        content: "Equipe",
        bg: "bg-pink-200",
        bg_header: "bg-pink-100",
      },
      {
        id: "restricoes",
        x: 4,
        y: 6,
        w: 4,
        h: 4,
        content: "Restrições",
        bg: "bg-blue-200",
        bg_header: "bg-blue-100",
      },
      {
        id: "premissas",
        x: 6,
        y: 0,
        w: 2,
        h: 3,
        content: "Premissas",
        bg: "bg-blue-200",
        bg_header: "bg-blue-100",
      },
      {
        id: "grupo_de_entrega",
        x: 6,
        y: 3,
        w: 2,
        h: 3,
        content: "Grupos de entrega",
        bg: "bg-blue-200",
        bg_header: "bg-blue-100",
      },
      {
        id: "riscos",
        x: 8,
        y: 0,
        w: 2,
        h: 3,
        content: "Riscos",
        bg: "bg-green-200",
        bg_header: "bg-green-100",
      },
      {
        id: "linha_do_tempo",
        x: 8,
        y: 3,
        w: 2,
        h: 4,
        content: "Linha do tempo",
        bg: "bg-green-200",
        bg_header: "bg-green-100",
      },
      {
        id: "custos",
        x: 8,
        y: 7,
        w: 2,
        h: 3,
        content: "Custos",
        bg: "bg-green-200",
        bg_header: "bg-green-100",
      },
    ];

    const MAX_ROWS = 10;

    // Renderiza todos os widgets
    items.forEach(({ x, y, w, h, content, id, bg, bg_header }) => {
      const savedWidget = initialData?.[id];

      const finalX = savedWidget?.x ?? x;
      const finalY = savedWidget?.y ?? y;
      const finalW = savedWidget?.w ?? w;
      const finalH = savedWidget?.h ?? h;
      const textareaValue = savedWidget?.textarea_value || "";

      const adjustedY = finalY + finalH > MAX_ROWS ? MAX_ROWS - finalH : finalY;

      console.log(`ReadOnly Widget ${id}:`, {
        savedWidget,
        textareaValue,
        position: { x: finalX, y: adjustedY, w: finalW, h: finalH },
      });

      grid.addWidget({
        x: finalX,
        y: adjustedY,
        w: finalW,
        h: finalH,
        content: `
          <div class="grid-stack-item-content ${bg} rounded-lg shadow-md transition-all duration-300 flex flex-col h-full">
            <div class="w-full ${bg_header} text-gray-800 px-1 lg:px-2 py-2 flex justify-between">
              <span class="min-w-0 w-full break-words text-xs lg:text-sm leading-snug font-semibold" title="${content}">${content}</span>
            </div>
            <div class="w-full h-full px-2 py-2 text-sm ${bg} text-gray-800 rounded-lg overflow-auto whitespace-pre-wrap break-words">${
          textareaValue ||
          '<span class="text-slate-600 italic">Sem informações</span>'
        }</div>
          </div>`,
      });
    });

    // Marca como carregado para nunca mais executar
    setWidgetsLoaded(true);
  }, [grid, initialData, widgetsLoaded]);

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-foreground">
          Canvas do projeto
        </h2>
        <p className="text-sm text-muted-foreground mt-0">
          Visão geral do projeto. Para alterar os blocos, acesse a edição do projeto.
        </p>
      </div>
      <div
        ref={gridRef}
        className="grid-stack bg-muted/40 border rounded-lg w-full p-3"
        style={{
          height: "calc(10 * 60px + 10 * 6px + 24px)",
          minHeight: "calc(10 * 60px + 10 * 6px + 24px)",
          overflow: "auto",
        }}
      ></div>
    </section>
  );
};
