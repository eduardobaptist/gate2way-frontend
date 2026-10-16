import React, { useEffect, useRef, useState, useCallback } from "react";
import { GridStack } from "gridstack";
import "gridstack/dist/gridstack.min.css";
import "gridstack/dist/gridstack-extra.min.css";

export const ProjetosProjectCanvas = ({ setCanvasData, initialData, onTextChange, getCurrentText }) => {
  const gridRef = useRef(null);
  const [grid, setGrid] = useState(null);
  const [widgetsLoaded, setWidgetsLoaded] = useState(false);

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
        disableOneColumnMode: true,
        row: 10,
        maxRow: 10,
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

  /* adiciona widgets ao gridstack APENAS UMA VEZ */
  useEffect(() => {
    // Só executa se:
    // 1. Grid existe
    // 2. initialData não é undefined (já foi carregado da API)
    // 3. Widgets ainda não foram carregados
    if (!grid || initialData === undefined || widgetsLoaded) {
      return;
    }

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

    // Validação durante o movimento
    const handleDrag = (event, element) => {
      const node = element.gridstackNode;
      if (node.y + node.h > MAX_ROWS) {
        return false;
      }
    };
    
    // Validação durante o redimensionamento
    const handleResize = (event, element) => {
      const node = element.gridstackNode;
      if (node.y + node.h > MAX_ROWS) {
        return false;
      }
    };

    grid.on("drag", handleDrag);
    grid.on("resize", handleResize);
    grid.on("change", saveCanvasData);

    // Renderiza todos os widgets
    // UX Gate2Way: blocos editáveis recebem instrução e nome acessível, além da cor.
    items.forEach(({ x, y, w, h, content, id, bg, bg_header }) => {
      const savedWidget = initialData?.[id];
      
      const finalX = savedWidget?.x ?? x;
      const finalY = savedWidget?.y ?? y;
      const finalW = savedWidget?.w ?? w;
      const finalH = savedWidget?.h ?? h;
      const textareaValue = getCurrentText?.(id) ?? savedWidget?.textarea_value ?? "";
      
      const adjustedY = finalY + finalH > MAX_ROWS ? MAX_ROWS - finalH : finalY;
    
      
      grid.addWidget({
        x: finalX,
        y: adjustedY,
        w: finalW,
        h: finalH,
        content: `
          <div class="grid-stack-item-content ${bg} rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex flex-col h-full">
            <div class="w-full grid-stack-item-mover ${bg_header} text-gray-800 font-semibold px-1 lg:px-2 py-2 cursor-default flex justify-between">
              <span class="min-w-0 w-full text-xs lg:text-sm leading-snug break-words" title="${content}">${content}</span>
            </div>
            <textarea class="w-full h-full resize-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue-700 text-sm placeholder:text-slate-600 px-2 py-2 ${bg} text-gray-800 rounded-lg" aria-label="${content}" placeholder="Escreva aqui..." id="${id}">${textareaValue}</textarea>
          </div>`,
      });
    });

    // Adiciona listeners nos textareas
    setTimeout(() => {
      const textareas = gridRef.current?.querySelectorAll("textarea");
      textareas?.forEach(textarea => {
        textarea.addEventListener("input", saveCanvasData);
        textarea.addEventListener("blur", saveCanvasData);
      });
    }, 100);

    // Marca como carregado para nunca mais executar
    setWidgetsLoaded(true)

  }, [grid, initialData, widgetsLoaded, saveCanvasData]);

  // A confirmed response updates only the baseline. Read live text at effect
  // execution time so a keystroke after the response is never overwritten.
  useEffect(() => {
    if (!getCurrentText) return;
    gridRef.current?.querySelectorAll("textarea").forEach(textarea => {
      const text = getCurrentText(textarea.id);
      if (typeof text === "string" && textarea.value !== text) textarea.value = text;
    });
  }, [initialData, getCurrentText]);

  return (
    <>
      <p className="mb-3 text-sm text-slate-700">Clique em um bloco para escrever. As alterações serão gravadas ao salvar o projeto.</p>
    <div
      ref={gridRef}
      onInputCapture={event => {
        if (event.target.tagName === "TEXTAREA") onTextChange?.(event.target.id, event.target.value);
      }}
      className="grid-stack bg-muted/40 border rounded-lg w-full p-3"
      style={{ 
        height: 'calc(10 * 60px + 10 * 6px + 24px)',
        minHeight: 'calc(10 * 60px + 10 * 6px + 24px)',
        overflow: 'auto'
      }}
    ></div>
    </>
  );
};
