"use client";

import { useState, useRef, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { updateNodeStyles } from "services/slices/pageTreeSlice";
import { COMPONENT_CONFIG } from "@/lib/componentConfig";

interface ResizableWrapperProps {
	nodeId: string;
	isSelected: boolean;
	isPreview: boolean;
	children: React.ReactNode;
	breakpoint: "desktop" | "tablet" | "mobile";
	wrapperDisplayClass?: string;
	canvasRef?: React.RefObject<HTMLDivElement>;
}

type ResizeHandle =
	| "top"
	| "bottom"
	| "left"
	| "right"
	| "top-left"
	| "top-right"
	| "bottom-left"
	| "bottom-right";

export function ResizableWrapper({
	nodeId,
	isSelected,
	isPreview,
	children,
	breakpoint,
	wrapperDisplayClass = "inline-block",
	canvasRef,
}: ResizableWrapperProps) {
	const dispatch = useAppDispatch();
	const node = useAppSelector((state) => state.pageTree.nodes[nodeId]);
	const wrapperRef = useRef<HTMLDivElement>(null);
	const [isResizing, setIsResizing] = useState(false);
	const [activeHandle, setActiveHandle] = useState<ResizeHandle | null>(null);
	const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
	const [startDimensions, setStartDimensions] = useState({ width: 0, height: 0 });
	const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
	const cleanupTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const pendingCleanupRef = useRef<{ width: string; height: string } | null>(null);

	// Lire les dimensions et modes depuis Redux
	const savedWidth = node?.styles[breakpoint]?.width;
	const savedHeight = node?.styles[breakpoint]?.height;
	const widthMode = node?.styles.__meta?.[breakpoint]?.widthMode || "auto";
	const heightMode = node?.styles.__meta?.[breakpoint]?.heightMode || "auto";
	
	// Déterminer si c'est un container (utilise %) ou un composant de base (utilise px)
	const componentConfig = COMPONENT_CONFIG[node?.type || ""];
	const isContainer = componentConfig?.canHaveChildren === true;

	// Créer l'objet de styles depuis Redux
	// En mode "auto", on n'applique pas de width/height fixes pour permettre le responsive
	const nodeStylesFromRedux: React.CSSProperties = {};
	if (widthMode === "fixed" && savedWidth) {
		nodeStylesFromRedux.width = savedWidth;
	}
	if (heightMode === "fixed" && savedHeight) {
		nodeStylesFromRedux.height = savedHeight;
	}

	// Gestion du début de redimensionnement
	const handleMouseDown = (e: React.MouseEvent, handle: ResizeHandle) => {
		if (isPreview) return;

		e.stopPropagation();
		e.preventDefault();

		// Obtenir le canvas rect pour calculer les positions relatives
		const canvasElement = canvasRef?.current;
		if (!canvasElement) return;

		const canvasRect = canvasElement.getBoundingClientRect();

		// Obtenir les dimensions de l'élément réel (composant Section)
		const realComponent = wrapperRef.current?.querySelector(`[data-node-id="${nodeId}"]:not([data-resizable="true"])`) as HTMLElement;
		if (!realComponent) return;

		const rect = realComponent.getBoundingClientRect();

		// Calculer les positions relatives au canvas
		const relativeMouseX = e.clientX - canvasRect.left;
		const relativeMouseY = e.clientY - canvasRect.top;

		// Marquer les dimensions comme "fixed" dès le début du resize
		// Déterminer quelles dimensions seront modifiées selon le handle
		const willResizeWidth = handle.includes("left") || handle.includes("right");
		const willResizeHeight = handle.includes("top") || handle.includes("bottom");

		if (willResizeWidth && widthMode === "auto") {
			// Passer en mode "fixed" pour width
			dispatch(
				updateNodeStyles({
					nodeId,
					breakpoint,
					styles: {},
					markAsFixed: { width: true },
				})
			);
		}

		if (willResizeHeight && heightMode === "auto") {
			// Passer en mode "fixed" pour height
			dispatch(
				updateNodeStyles({
					nodeId,
					breakpoint,
					styles: {},
					markAsFixed: { height: true },
				})
			);
		}

		// Recalculer startDimensions basé sur le canvas
		let initialWidth = rect.width;
		if (willResizeWidth) {
			if (widthMode === "auto") {
				// Mode auto : utiliser la largeur du canvas comme baseline
				initialWidth = canvasRect.width;
			} else if (widthMode === "fixed" && savedWidth) {
				// Si c'est un container avec un pourcentage, convertir en pixels
				if (isContainer && savedWidth.includes("%")) {
					const percentValue = parseFloat(savedWidth.replace("%", ""));
					initialWidth = (canvasRect.width * percentValue) / 100;
				} else if (savedWidth.includes("px")) {
					// Si c'est en pixels, utiliser directement
					initialWidth = parseFloat(savedWidth.replace("px", ""));
				}
			}
		}

		setIsResizing(true);
		setActiveHandle(handle);
		// Stocker les positions relatives au canvas
		setStartPosition({ x: relativeMouseX, y: relativeMouseY });
		setStartDimensions({ width: initialWidth, height: rect.height });
		setDimensions({ width: initialWidth, height: rect.height });
	};

	// Gestion du redimensionnement
	useEffect(() => {
		if (!isResizing || !activeHandle) return;

		// Debounce pour éviter trop de dispatches Redux
		let updateTimeout: NodeJS.Timeout | null = null;

		const handleMouseMove = (e: MouseEvent) => {
			// Obtenir le canvas rect pour calculer les positions relatives
			const canvasElement = canvasRef?.current;
			if (!canvasElement) return;

			const canvasRect = canvasElement.getBoundingClientRect();

			// Calculer les positions relatives au canvas
			const relativeMouseX = e.clientX - canvasRect.left;
			const relativeMouseY = e.clientY - canvasRect.top;

			// Calculer les deltas relatifs au canvas (pas à l'écran global)
			const deltaX = relativeMouseX - startPosition.x;
			const deltaY = relativeMouseY - startPosition.y;

			let newWidth = startDimensions.width;
			let newHeight = startDimensions.height;

			// Calculer les nouvelles dimensions selon le handle
			switch (activeHandle) {
				case "right":
				case "top-right":
				case "bottom-right":
					newWidth = Math.max(50, startDimensions.width + deltaX);
					break;
				case "left":
				case "top-left":
				case "bottom-left":
					newWidth = Math.max(50, startDimensions.width - deltaX);
					break;
			}

			// Clamper la largeur à la largeur du canvas pour éviter le débordement
			if (activeHandle.includes("left") || activeHandle.includes("right")) {
				newWidth = Math.min(canvasRect.width, Math.max(50, newWidth));
			}

			switch (activeHandle) {
				case "bottom":
				case "bottom-left":
				case "bottom-right":
					newHeight = Math.max(30, startDimensions.height + deltaY);
					break;
				case "top":
				case "top-left":
				case "top-right":
					newHeight = Math.max(30, startDimensions.height - deltaY);
					break;
			}

			setDimensions({ width: newWidth, height: newHeight });

			// Appliquer les dimensions en temps réel sur le composant réel (Section, Container, etc.)
			// pour que l'outline bleu suive les dimensions pendant le resize
			// Le composant réel est un enfant du div dans EditorCanvas et a data-node-id
			const realComponent = wrapperRef.current?.querySelector(`[data-node-id="${nodeId}"]:not([data-resizable="true"])`) as HTMLElement;
			if (realComponent) {
				// Appliquer les dimensions en temps réel pour que l'outline bleu suive
				// Ne pas utiliser !important pour permettre aux classes Tailwind de prendre le relais après
				realComponent.style.width = `${newWidth}px`;
				realComponent.style.height = `${newHeight}px`;
				// Forcer un reflow pour que l'outline se mette à jour
				void realComponent.offsetHeight;
			}

			// Mettre à jour Redux en temps réel (avec debounce pour les performances)
			// Déterminer quelles dimensions sont modifiées selon le handle
			const isResizingWidth = activeHandle.includes("left") || activeHandle.includes("right");
			const isResizingHeight = activeHandle.includes("top") || activeHandle.includes("bottom");

			if (updateTimeout) {
				clearTimeout(updateTimeout);
			}
			updateTimeout = setTimeout(() => {
				const stylesToUpdate: Record<string, string> = {};
				const markAsFixed: { width?: boolean; height?: boolean } = {};

				if (isResizingWidth) {
					// Pour les containers : convertir en % du canvas
					// Pour les composants de base : utiliser pixels
					if (isContainer && canvasElement) {
						const canvasRect = canvasElement.getBoundingClientRect();
						const percentage = (newWidth / canvasRect.width) * 100;
						stylesToUpdate.width = `${Math.round(percentage * 100) / 100}%`;
					} else {
						stylesToUpdate.width = `${Math.round(newWidth)}px`;
					}
					markAsFixed.width = true;
				}
				if (isResizingHeight) {
					// Height toujours en pixels (même pour les containers)
					stylesToUpdate.height = `${Math.round(newHeight)}px`;
					markAsFixed.height = true;
				}

				if (Object.keys(stylesToUpdate).length > 0) {
					dispatch(
						updateNodeStyles({
							nodeId,
							breakpoint,
							styles: stylesToUpdate,
							markAsFixed,
						})
					);
				}
			}, 16); // ~60fps
		};

		const handleMouseUp = () => {
			// Annuler le debounce en cours
			if (updateTimeout) {
				clearTimeout(updateTimeout);
			}

			// Obtenir le canvas rect pour la conversion en %
			const canvasElement = canvasRef?.current;
			if (!canvasElement) return;

			const canvasRect = canvasElement.getBoundingClientRect();

			// Mettre à jour Redux avec les dimensions finales (sans debounce)
			// Déterminer quelles dimensions sont modifiées selon le handle
			const isResizingWidth = activeHandle.includes("left") || activeHandle.includes("right");
			const isResizingHeight = activeHandle.includes("top") || activeHandle.includes("bottom");

			const stylesToUpdate: Record<string, string> = {};
			const markAsFixed: { width?: boolean; height?: boolean } = {};

			if (isResizingWidth) {
				// Pour les containers : convertir en % du canvas
				// Pour les composants de base : utiliser pixels
				if (isContainer) {
					const percentage = (dimensions.width / canvasRect.width) * 100;
					stylesToUpdate.width = `${Math.round(percentage * 100) / 100}%`;
				} else {
					stylesToUpdate.width = `${Math.round(dimensions.width)}px`;
				}
				markAsFixed.width = true;
			}
			if (isResizingHeight) {
				// Height toujours en pixels (même pour les containers)
				stylesToUpdate.height = `${Math.round(dimensions.height)}px`;
				markAsFixed.height = true;
			}

			if (Object.keys(stylesToUpdate).length > 0) {
				dispatch(
					updateNodeStyles({
						nodeId,
						breakpoint,
						styles: stylesToUpdate,
						markAsFixed,
					})
				);
			}

			// Console logs pour analyser la synchronisation après le resize
			// Attendre un tick pour que les styles soient appliqués
			setTimeout(() => {
				// 1. Afficher le width du wrapper après le resize
				const wrapperElement = wrapperRef.current;
				if (wrapperElement) {
					const wrapperRect = wrapperElement.getBoundingClientRect();
					const wrapperComputedStyle = window.getComputedStyle(wrapperElement);
					console.log("🔵 [Resize] Wrapper width après resize:", {
						nodeId,
						width: wrapperRect.width,
						widthStyle: wrapperComputedStyle.width,
						widthInline: wrapperElement.style.width,
					});
				}

				// 2. Afficher le width de Section après le resize
				const realComponent = wrapperRef.current?.querySelector(`[data-node-id="${nodeId}"]:not([data-resizable="true"])`) as HTMLElement;
				if (realComponent) {
					const sectionRect = realComponent.getBoundingClientRect();
					const sectionComputedStyle = window.getComputedStyle(realComponent);
					console.log("🟢 [Resize] Section width après resize:", {
						nodeId,
						width: sectionRect.width,
						widthStyle: sectionComputedStyle.width,
						widthInline: realComponent.style.width,
						right: sectionRect.right,
						wrapperRight: wrapperRef.current?.getBoundingClientRect().right,
					});
				}
			}, 0);

			setIsResizing(false);
			setActiveHandle(null);
		};

		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);

		return () => {
			// Nettoyer le timeout si le composant se démonte pendant le resize
			if (updateTimeout) {
				clearTimeout(updateTimeout);
			}
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		};
	}, [isResizing, activeHandle, startPosition, startDimensions, dimensions, dispatch, nodeId, breakpoint]);

	// Mettre à jour les styles inline avec les valeurs Redux une fois confirmées
	// Cela garantit que le border bleu reste synchronisé avec le wrapper
	// IMPORTANT: Ne mettre à jour que si le mode est "fixed"
	useEffect(() => {
		if (isResizing) return; // Ne pas mettre à jour pendant le resize

		// Mettre à jour les styles inline du composant réel avec les valeurs Redux
		// seulement si le mode est "fixed"
		const realComponent = wrapperRef.current?.querySelector(`[data-node-id="${nodeId}"]:not([data-resizable="true"])`) as HTMLElement;
		if (realComponent) {
			// Mettre à jour les dimensions depuis Redux seulement si mode "fixed"
			if (widthMode === "fixed" && savedWidth) {
				// IMPORTANT: La Section doit prendre 100% de la largeur du wrapper
				// Le wrapper gère déjà la largeur correcte (en % du canvas ou en px)
				// Si on applique le même % à la Section, elle calculera par rapport au wrapper
				// ce qui crée un décalage. Il faut donc utiliser 100% pour qu'elle prenne
				// toute la largeur du wrapper.
				realComponent.style.width = "100%";
			} else if (widthMode === "auto") {
				// En mode auto, ne pas forcer de width (laisser les classes Tailwind gérer)
				realComponent.style.width = "";
			}

			if (heightMode === "fixed" && savedHeight) {
				realComponent.style.height = savedHeight;
			} else if (heightMode === "auto") {
				// En mode auto, ne pas forcer de height
				realComponent.style.height = "";
			}

			// Console log pour analyser la synchronisation après mise à jour depuis Redux
			setTimeout(() => {
				const wrapperElement = wrapperRef.current;
				if (wrapperElement) {
					const wrapperRect = wrapperElement.getBoundingClientRect();
					const wrapperComputedStyle = window.getComputedStyle(wrapperElement);
					const sectionRect = realComponent.getBoundingClientRect();
					const sectionComputedStyle = window.getComputedStyle(realComponent);
					
					console.log("🔄 [Sync] Synchronisation après mise à jour Redux:", {
						nodeId,
						wrapper: {
							width: wrapperRect.width,
							widthStyle: wrapperComputedStyle.width,
							right: wrapperRect.right,
						},
						section: {
							width: sectionRect.width,
							widthStyle: sectionComputedStyle.width,
							widthInline: realComponent.style.width,
							right: sectionRect.right,
						},
						widthMode,
						heightMode,
						savedWidth,
						savedHeight,
						diff: Math.abs(wrapperRect.right - sectionRect.right),
					});
				}
			}, 0);
		}

		// Réinitialiser la référence de nettoyage si elle existe
		if (pendingCleanupRef.current) {
			pendingCleanupRef.current = null;
		}
	}, [savedWidth, savedHeight, widthMode, heightMode, isResizing, nodeId]);

	// Si preview ou non sélectionné, retourner un wrapper simple sans handles
	if (isPreview || !isSelected) {
		return (
			<div
				ref={wrapperRef}
				className="relative"
				style={{
					display: wrapperDisplayClass,
					// Ces styles permettent de garder la taille appliquée depuis Redux,
					// même quand le composant n'est pas sélectionné
					...nodeStylesFromRedux, // width, height, etc.
				}}
			>
				{children}
			</div>
		);
	}

	// Calculer les styles à appliquer : utiliser dimensions locales pendant le resize, sinon Redux
	const computedStyles: React.CSSProperties = {
		display: wrapperDisplayClass,
	};

	if (isResizing) {
		// Pendant le resize : utiliser les dimensions du state local pour un feedback immédiat
		computedStyles.width = `${Math.round(dimensions.width)}px`;
		computedStyles.height = `${Math.round(dimensions.height)}px`;
	} else {
		// Après le resize : utiliser les dimensions depuis Redux seulement si mode "fixed"
		if (widthMode === "fixed" && savedWidth) {
			computedStyles.width = savedWidth;
		}
		if (heightMode === "fixed" && savedHeight) {
			computedStyles.height = savedHeight;
		}
	}

	return (
		<div 
			ref={wrapperRef} 
			className="relative" 
			style={computedStyles}
		>
			{children}

			{/* Indicateur de dimensions pendant le resize */}
			{isResizing && (
				<div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-[#0D318B] text-white text-xs px-3 py-1 rounded shadow-lg font-mono z-50">
					{Math.round(dimensions.width)}px × {Math.round(dimensions.height)}px
				</div>
			)}

			{/* Handles de redimensionnement */}
			{isSelected && (
				<>
					{/* Handle Top */}
					<div
						className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-12 h-2 cursor-ns-resize hover:bg-[#0A2569] bg-[#0D318B] rounded-full transition-all z-10"
						onMouseDown={(e) => handleMouseDown(e, "top")}
						title="Redimensionner verticalement"
					/>

					{/* Handle Bottom */}
					<div
						className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-12 h-2 cursor-ns-resize hover:bg-[#0A2569] bg-[#0D318B] rounded-full transition-all z-10"
						onMouseDown={(e) => handleMouseDown(e, "bottom")}
						title="Redimensionner verticalement"
					/>

					{/* Handle Left */}
					<div
						className="absolute top-1/2 -left-1 transform -translate-y-1/2 w-2 h-12 cursor-ew-resize hover:bg-[#0A2569] bg-[#0D318B] rounded-full transition-all z-10"
						onMouseDown={(e) => handleMouseDown(e, "left")}
						title="Redimensionner horizontalement"
					/>

					{/* Handle Right */}
					<div
						className="absolute top-1/2 -right-1 transform -translate-y-1/2 w-2 h-12 cursor-ew-resize hover:bg-[#0A2569] bg-[#0D318B] rounded-full transition-all z-10"
						onMouseDown={(e) => handleMouseDown(e, "right")}
						title="Redimensionner horizontalement"
					/>

					{/* Handle Top-Left */}
					<div
						className="absolute -top-1 -left-1 w-4 h-4 bg-[#0D318B] hover:bg-[#0A2569] hover:scale-125 rounded-full cursor-nwse-resize transition-all border-2 border-white shadow-lg z-20"
						onMouseDown={(e) => handleMouseDown(e, "top-left")}
						title="Redimensionner"
					/>

					{/* Handle Top-Right */}
					<div
						className="absolute -top-1 -right-1 w-4 h-4 bg-[#0D318B] hover:bg-[#0A2569] hover:scale-125 rounded-full cursor-nesw-resize transition-all border-2 border-white shadow-lg z-20"
						onMouseDown={(e) => handleMouseDown(e, "top-right")}
						title="Redimensionner"
					/>

					{/* Handle Bottom-Left */}
					<div
						className="absolute -bottom-1 -left-1 w-4 h-4 bg-[#0D318B] hover:bg-[#0A2569] hover:scale-125 rounded-full cursor-nesw-resize transition-all border-2 border-white shadow-lg z-20"
						onMouseDown={(e) => handleMouseDown(e, "bottom-left")}
						title="Redimensionner"
					/>

					{/* Handle Bottom-Right */}
					<div
						className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#0D318B] hover:bg-[#0A2569] hover:scale-125 rounded-full cursor-nwse-resize transition-all border-2 border-white shadow-lg z-20"
						onMouseDown={(e) => handleMouseDown(e, "bottom-right")}
						title="Redimensionner"
					/>
				</>
			)}
		</div>
	);
}

