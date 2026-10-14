import React, { useEffect, useRef, useState, useCallback } from "react";
import { GridStack } from "gridstack";
import "gridstack/dist/gridstack.min.css";
import "gridstack/dist/gridstack-extra.min.css";

export const ProjetosProjectCanvas = ({ setCanvasData, canvasData }) => {
  const gridRef = useRef(null);
  const [grid, setGrid] = useState(null);

  const saveCanvasData = useCallback(() => {
    if (grid) {
      const serializedData = grid.save();

      const enrichedData = serializedData.reduce((acc, widget) => {
        const gridItem = gridRef.current?.querySelector(
          `.grid-stack-item[gs-x="${widget.x}"][gs-y="${widget.y}"]`
        );
        const textarea = gridItem?.querySelector("textarea");
        const textareaId = textarea?.id || `widget_${widget.x}_${widget.y}`;

        acc[textareaId] = {
          ...widget,
          textarea_value: textarea?.value || "",
        };

        return acc;
      }, {});

      setCanvasData(enrichedData);
    }
  }, [grid, setCanvasData]);

  /* inicializando o gridstack */
  useEffect(() => {
    if (!gridRef.current || grid) return;

    const newGrid = GridStack.init(
      {
        float: true,
        cellHeight: "60px",
        column: 10,
        animate: true,
        margin: 6,
        staticGrid: true, // Torna o grid estático
        disableDrag: true, // Desabilita arrastar
        disableResize: true, // Desabilita redimensionar
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

  /* adiciona widgets ao gridstack */
  useEffect(() => {
    if (!grid) return;

    const items = [
      // Coluna 1 (x: 0)
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

      // Coluna 2 (x: 2)
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

      // Coluna 3 (x: 4)
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

      // Coluna 4 (x: 6)
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

      // Coluna 5 (x: 8)
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

    // UX Gate2Way: blocos editáveis recebem instrução e nome acessível, além da cor.
    items.forEach(({ x, y, w, h, content, id, bg, bg_header }) => {
      grid.addWidget({
        x,
        y,
        w,
        h,
        content: `
          <div class="grid-stack-item-content ${bg} rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex flex-col h-full">
            <div class="w-full grid-stack-item-mover ${bg_header} text-gray-800 font-semibold px-1 lg:px-2 py-2 cursor-default flex justify-between">
              <span class="min-w-0 w-full text-xs lg:text-sm leading-snug break-words" title="${content}">${content}</span>
            </div>
            <textarea class="w-full h-full resize-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue-700 text-sm placeholder:text-slate-600 px-2 py-2 ${bg} text-gray-800 rounded-lg" aria-label="${content}" placeholder="Escreva aqui..." id="${id}"></textarea>
          </div>`,
      });
    });

    // UX Gate2Way: digitar não dispara mudança do grid; captura também o texto dos blocos.
    const canvasElement = gridRef.current;
    canvasElement?.addEventListener("input", saveCanvasData);
    grid.on("change", saveCanvasData);
    saveCanvasData();

    return () => {
      canvasElement?.removeEventListener("input", saveCanvasData);
      grid.off("change", saveCanvasData);
    };
  }, [grid, saveCanvasData]);

  return (
    <>
      <p className="mb-3 text-sm text-slate-700">Clique em um bloco para escrever. As alterações serão gravadas ao salvar o projeto.</p>
    <div
      ref={gridRef}
      className="grid-stack bg-muted/40 border rounded-lg h-full w-full p-3"
    ></div>
    </>
  );
};
