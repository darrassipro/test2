"use client";

import { useMemo, useRef } from "react";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import {
	selectNode,
	hoverNode,
	removeNode,
	updateNodeProps,
	updateNodeStyles,
	addNode,
	duplicateNode as duplicateNodeAction,
	type Node,
} from "services/slices/pageTreeSlice";
import { reduxToBuilderNode } from "@/lib/reduxToBuilderNode";
import { RenderNode } from "@/components/RenderNode";
import { ResizableWrapper } from "./ResizableWrapper";
import { COMPONENT_CONFIG } from "@/lib/componentConfig";
import { useState, useEffect } from "react";
import { BuilderNode } from "@/types/builder";
import { v4 as uuidv4 } from "uuid";

interface EditorCanvasProps {
	isPreview?: boolean;
}

/**
 * Composant principal du canvas d'édition
 * Convertit le state Redux en BuilderNode et utilise RenderNode pour le rendu
 */
export default function EditorCanvas({ isPreview = false }: EditorCanvasProps) {
	const dispatch = useAppDispatch();
	const rootNodeId = useAppSelector((state) => state.pageTree.rootNodeId);
	const nodes = useAppSelector((state) => state.pageTree.nodes);
	const selectedNodeId = useAppSelector((state) => state.pageTree.selectedNodeId);
	const hoveredNodeId = useAppSelector((state) => state.pageTree.hoveredNodeId);
	const viewport = useAppSelector((state) => state.editor.activeBreakpoint);
	const canvasRef = useRef<HTMLDivElement>(null);

	// En mode preview, détecter la taille réelle de l'écran pour le responsive
	const [windowWidth, setWindowWidth] = useState<number | null>(null);
	
	useEffect(() => {
		if (!isPreview) return;
		
		// Fonction pour déterminer le breakpoint basé sur la largeur de l'écran
		const updateBreakpoint = () => {
			if (typeof window !== 'undefined') {
				setWindowWidth(window.innerWidth);
			}
		};
		
		// Initialiser
		updateBreakpoint();
		
		// Écouter les changements de taille
		window.addEventListener('resize', updateBreakpoint);
		
		return () => {
			window.removeEventListener('resize', updateBreakpoint);
		};
	}, [isPreview]);

	// Déterminer le breakpoint : en mode preview, utiliser la taille réelle de l'écran
	// En mode édition, utiliser le viewport sélectionné dans l'éditeur
	const breakpoint = useMemo<"desktop" | "tablet" | "mobile">(() => {
		if (isPreview && windowWidth !== null) {
			// Breakpoints responsive basés sur la largeur réelle de l'écran
			if (windowWidth < 768) {
				return "mobile";
			} else if (windowWidth < 1024) {
				return "tablet";
			} else {
				return "desktop";
			}
		} else {
			// En mode édition, utiliser le viewport sélectionné
			return viewport === "base" ? "desktop" : viewport === "tablet" ? "tablet" : "mobile";
		}
	}, [isPreview, windowWidth, viewport]);

	// Convertir Redux → BuilderNode
	const builderTree = useMemo(() => {
		if (!rootNodeId) return null;
		return reduxToBuilderNode(rootNodeId, nodes, breakpoint);
	}, [rootNodeId, nodes, breakpoint]);

	if (!builderTree) {
		return (
			<div className="w-full h-full flex items-center justify-center bg-gray-50 p-8">
				<div className="text-center text-slate-500">
					<svg
						className="w-16 h-16 mx-auto mb-4 text-slate-300"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M12 6v6m0 0v6m0-6h6m-6 0H6"
						/>
					</svg>
					<p className="text-sm font-medium">Aucun contenu</p>
					<p className="text-xs mt-1">Glissez une Section depuis la sidebar pour commencer</p>
				</div>
			</div>
		);
	}

	// Fonction pour dupliquer un node et tous ses enfants récursivement
	const duplicateNode = (nodeId: string) => {
		// Utiliser l'action Redux dédiée qui gère toute la duplication
		dispatch(duplicateNodeAction(nodeId));
	};

	// Implémentation des callbacks
	const callbacks = {
		onSelectNode: (nodeId: string) => {
			dispatch(selectNode(nodeId));
		},
		onAddChild: (parentId: string, childType: string) => {
			const config = COMPONENT_CONFIG[childType];
			const defaultProps = config?.defaultProps || {};
			dispatch(addNode({
				type: childType,
				parentId,
				props: defaultProps,
			}));
		},
		onDuplicate: (nodeId: string) => {
			duplicateNode(nodeId);
		},
		onDelete: (nodeId: string) => {
			dispatch(removeNode(nodeId));
		},
		onUpdateStyle: (nodeId: string, style: Record<string, string>) => {
			dispatch(updateNodeStyles({ nodeId, breakpoint, styles: style }));
		},
		onUpdateProps: (nodeId: string, props: Record<string, any>) => {
			dispatch(updateNodeProps({ nodeId, props }));
		},
	};

	return (
		<div ref={canvasRef} className="w-full h-full">
			<EditableNodeWrapper
				node={builderTree}
				isPreview={isPreview}
				breakpoint={breakpoint}
				selectedNodeId={selectedNodeId}
				hoveredNodeId={hoveredNodeId}
				callbacks={callbacks}
				canvasRef={canvasRef}
				onSelect={(nodeId) => dispatch(selectNode(nodeId))}
				onHover={(nodeId) => dispatch(hoverNode(nodeId))}
				onRemove={(nodeId) => dispatch(removeNode(nodeId))}
				onUpdateProps={(nodeId, props) => dispatch(updateNodeProps({ nodeId, props }))}
				onUpdateStyles={(nodeId, breakpoint, styles) =>
					dispatch(updateNodeStyles({ nodeId, breakpoint, styles }))
				}
			/>
		</div>
	);
}

/**
 * Wrapper qui ajoute les interactions d'édition autour de RenderNode
 */
interface EditableNodeWrapperProps {
	node: BuilderNode;
	isPreview: boolean;
	breakpoint: "desktop" | "tablet" | "mobile";
	selectedNodeId: string | null;
	hoveredNodeId: string | null;
	callbacks?: import("@/components/RenderNode").RenderNodeCallbacks;
	canvasRef?: React.RefObject<HTMLDivElement>;
	onSelect: (nodeId: string) => void;
	onHover: (nodeId: string | null) => void;
	onRemove: (nodeId: string) => void;
	onUpdateProps: (nodeId: string, props: Record<string, any>) => void;
	onUpdateStyles: (
		nodeId: string,
		breakpoint: "desktop" | "tablet" | "mobile",
		styles: Record<string, string>
	) => void;
}

function EditableNodeWrapper({
	node,
	isPreview,
	breakpoint,
	selectedNodeId,
	hoveredNodeId,
	callbacks,
	canvasRef,
	onSelect,
	onHover,
	onRemove,
	onUpdateProps,
	onUpdateStyles,
}: EditableNodeWrapperProps) {
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

	const isSelected = selectedNodeId === node.id;
	const isHovered = hoveredNodeId === node.id;

	// Écouter l'événement de suppression via touche Delete
	useEffect(() => {
		if (!isSelected) return;

		const handleDeleteNode = (e: any) => {
			const { nodeId: targetNodeId } = e.detail;
			if (targetNodeId === node.id) {
				setShowDeleteConfirm(true);
			}
		};

		document.addEventListener("deleteNode", handleDeleteNode);

		return () => {
			document.removeEventListener("deleteNode", handleDeleteNode);
		};
	}, [node.id, isSelected]);

	// Handlers d'interaction
	const handleClick = (e: React.MouseEvent) => {
		if (isPreview) return;
		e.stopPropagation();
		onSelect(node.id);
	};

	const handleMouseEnter = (e: React.MouseEvent) => {
		if (isPreview) return;
		e.stopPropagation();
		onHover(node.id);
	};

	const handleMouseLeave = () => {
		if (isPreview) return;
		onHover(null);
	};

	const handleDragOver = (e: React.DragEvent) => {
		if (isPreview) return;
		e.preventDefault();
		e.stopPropagation();

		const config = COMPONENT_CONFIG[node.type];
		if (config?.canHaveChildren) {
			e.currentTarget.classList.add("ring-2", "ring-blue-400", "ring-offset-2");
		}
	};

	const handleDragLeave = (e: React.DragEvent) => {
		if (isPreview) return;
		e.currentTarget.classList.remove("ring-2", "ring-blue-400", "ring-offset-2");
	};

	const handleDrop = (e: React.DragEvent) => {
		if (isPreview) return;
		e.preventDefault();
		e.stopPropagation();
		e.currentTarget.classList.remove("ring-2", "ring-blue-400", "ring-offset-2");

		const componentType = e.dataTransfer.getData("text/plain");
		const config = COMPONENT_CONFIG[node.type];

		if (config?.canHaveChildren && componentType) {
			// L'événement sera géré par le parent (builder page)
			const event = new CustomEvent("dropComponent", {
				detail: { componentType, targetNodeId: node.id },
				bubbles: true,
			});
			e.currentTarget.dispatchEvent(event);
		}
	};

	const handleDelete = (e: React.MouseEvent) => {
		e.stopPropagation();
		setShowDeleteConfirm(true);
	};

	const confirmDelete = (e: React.MouseEvent) => {
		e.stopPropagation();
		onRemove(node.id);
		setShowDeleteConfirm(false);
	};

	const cancelDelete = (e: React.MouseEvent) => {
		e.stopPropagation();
		setShowDeleteConfirm(false);
	};

	// Classes d'interaction (sauf en mode preview)
	// Le border violet (ring) a été retiré, seul le border bleu (outline) sur le composant réel est visible
	const interactionClasses = !isPreview
		? `
		group
		transition-all duration-150 cursor-pointer
	`
		: "";

	// Ne pas ajouter w-full ici - laisser le composant enfant gérer sa propre largeur
	const containerClasses = `${interactionClasses} relative box-border`.trim();

	// Label d'identification avec bouton suppression (sauf en mode preview)
	const NodeLabel = !isPreview && (isSelected || isHovered) && (
		<div className="absolute -top-6 left-0 right-0 flex items-center justify-between bg-[#0D318B] text-white text-xs px-2 py-1 rounded-t z-10 font-medium">
			<span>
				{node.type} {node.props.label ? `- ${node.props.label}` : ""}
			</span>
			{isSelected && (
				<button
					onClick={handleDelete}
					className="ml-2 p-1 hover:bg-[#0A2569] rounded transition-colors"
					title="Supprimer ce composant"
				>
					<svg
						className="w-3 h-3"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
						/>
					</svg>
				</button>
			)}
		</div>
	);

	// Modal de confirmation de suppression
	const DeleteConfirmModal = showDeleteConfirm && (
		<div
			className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
			onClick={cancelDelete}
		>
			<div
				className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex items-center gap-3 mb-4">
					<div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
						<svg
							className="w-6 h-6 text-red-600"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
							/>
						</svg>
					</div>
					<div>
						<h3 className="text-lg font-semibold text-slate-900">
							Supprimer ce composant ?
						</h3>
						<p className="text-sm text-slate-600 mt-1">
							Type : <span className="font-medium">{node.type}</span>
						</p>
					</div>
				</div>

				<div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
					<p className="text-sm text-amber-800">
						⚠️ <span className="font-medium">Attention :</span> Si ce composant
						contient des enfants, ils seront également supprimés.
					</p>
					{node.children && node.children.length > 0 && (
						<p className="text-sm text-amber-800 mt-2">
							📦 <span className="font-medium">{node.children.length}</span>{" "}
							composant{node.children.length > 1 ? "s" : ""} enfant
							{node.children.length > 1 ? "s" : ""} sera
							{node.children.length > 1 ? "ont" : ""} supprimé
							{node.children.length > 1 ? "s" : ""}.
						</p>
					)}
				</div>

				<div className="flex gap-3">
					<button
						onClick={cancelDelete}
						className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition"
					>
						Annuler
					</button>
					<button
						onClick={confirmDelete}
						className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
					>
						Supprimer
					</button>
				</div>
			</div>
		</div>
	);

	// Ne plus appliquer width/height en inline - laisser Tailwind gérer via stylesToTailwind
	// Les dimensions sont maintenant gérées par Redux et appliquées via les classes Tailwind
	const inlineStyles: React.CSSProperties = {};
	// On garde seulement box-sizing pour le ring
	
	// Déterminer si le composant a une largeur spécifique définie
	const hasSpecificWidth = node.style?.width && 
		node.style.width !== "auto" && 
		node.style.width !== "100%" &&
		!node.style.width.includes("undefined");
	
	// Déterminer si le composant a un widthMode défini (via Redux)
	// On doit accéder au node Redux pour vérifier le widthMode
	const nodeFromRedux = useAppSelector((state) => state.pageTree.nodes[node.id]);
	const widthMode = nodeFromRedux?.styles.__meta?.[breakpoint]?.widthMode;
	const hasWidthMode = widthMode !== undefined;
	
	// Si le composant a une largeur spécifique, le wrapper doit s'adapter (inline-block)
	// Si le composant a un widthMode "auto", utiliser block pour que w-full fonctionne
	// Si le composant n'a pas de widthMode défini (enfant d'une Section flex), utiliser inline-block pour largeur automatique
	const wrapperDisplayClass = hasSpecificWidth 
		? "inline-block" 
		: (hasWidthMode && widthMode === "auto") 
			? "block" 
			: "inline-block"; // Par défaut inline-block pour les enfants sans widthMode

	// Wrapper pour RenderNode avec interactions
	return (
		<>
			{DeleteConfirmModal}
			<ResizableWrapper
				nodeId={node.id}
				isSelected={isSelected}
				isPreview={isPreview}
				breakpoint={breakpoint}
				wrapperDisplayClass={wrapperDisplayClass}
				canvasRef={canvasRef}
			>
				<div
					className={containerClasses}
					style={{
						...(Object.keys(inlineStyles).length > 0 ? inlineStyles : {}),
						// S'assurer que le ring suit les dimensions en forçant box-sizing
						boxSizing: "border-box",
					}}
					onClick={handleClick}
					onMouseEnter={handleMouseEnter}
					onMouseLeave={handleMouseLeave}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
					data-node-id={node.id}
					data-resizable="true"
				>
					{NodeLabel}

					{/* Rendu du composant via RenderNode avec renderChildren personnalisé */}
					<RenderNode
						node={node}
						mode={isPreview ? "preview" : "edit"}
						callbacks={callbacks}
						renderChildren={(children) => (
							<>
								{children.map((child) => (
									<EditableNodeWrapper
										key={child.id}
										node={child}
										isPreview={isPreview}
										breakpoint={breakpoint}
										selectedNodeId={selectedNodeId}
										hoveredNodeId={hoveredNodeId}
										callbacks={callbacks}
										canvasRef={canvasRef}
										onSelect={onSelect}
										onHover={onHover}
										onRemove={onRemove}
										onUpdateProps={onUpdateProps}
										onUpdateStyles={onUpdateStyles}
									/>
								))}
							</>
						)}
					/>

				</div>
			</ResizableWrapper>
		</>
	);
}


