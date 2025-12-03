"use client";

import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { selectNode, hoverNode, removeNode, type Node } from "services/slices/pageTreeSlice";
import { stylesToTailwind } from "@/lib/stylesToTailwind";
import { COMPONENT_CONFIG } from "@/lib/componentConfig";
import React, { useState, useEffect } from "react";
import { ResizableWrapper } from "./ResizableWrapper";

// Composant Navbar pour NodeRenderer avec support mobile
function NavbarContent({ 
	node, 
	breakpoint 
}: { 
	node: Node; 
	breakpoint: "desktop" | "tablet" | "mobile" 
}) {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const isMobile = breakpoint === "mobile";
	
	const links = node.props.links || [
		{ text: "Accueil", url: "#" },
		{ text: "À propos", url: "#" },
		{ text: "Contact", url: "#" },
	];
	const logoType = node.props.logoType || "image";
	const breakpointStyles = node.styles[breakpoint] || {};
	const backgroundColor = breakpointStyles.backgroundColor || "#ffffff";
	const linkColor = breakpointStyles.linkColor || "#475569";
	const borderRadius = breakpointStyles.borderRadius || "0px";
	const boxShadow = breakpointStyles.boxShadow || "none";

	const navInlineStyles: React.CSSProperties = {
		backgroundColor,
		borderRadius,
		boxShadow: boxShadow !== "none" ? boxShadow : undefined,
	};

	return (
		<nav 
			className={`w-full flex items-center px-6 py-4 border-b border-slate-200 ${isMobile ? "relative" : ""}`}
			style={navInlineStyles}
		>
			{/* Logo à gauche */}
			<div className={`flex-shrink-0 ${isMobile ? "flex-1" : ""}`} style={!isMobile ? { width: "30%" } : undefined}>
				{logoType === "image" && node.props.logoSrc ? (
					<img
						src={node.props.logoSrc}
						alt={node.props.logoAlt || "Logo"}
						className="h-10 w-auto object-contain"
					/>
				) : (
					<span className="text-xl font-bold text-slate-900">
						{node.props.logoText || "Logo"}
					</span>
				)}
			</div>
			
			{/* Version Desktop/Tablet : liens horizontaux */}
			{!isMobile && (
				<div className="flex justify-end items-center gap-6" style={{ width: "70%" }}>
					{links.map((link: { text: string; url: string }, index: number) => (
						<a
							key={index}
							href={link.url || "#"}
							className="font-medium transition-colors hover:text-violet-600"
							style={{ color: linkColor }}
						>
							{link.text || `Lien ${index + 1}`}
						</a>
					))}
				</div>
			)}

			{/* Version Mobile : icône de menu à droite */}
			{isMobile && (
				<>
					<button
						onClick={() => setIsMenuOpen(!isMenuOpen)}
						className="flex-shrink-0 p-2 rounded-lg hover:bg-slate-100 transition-colors"
						aria-label="Toggle menu"
						aria-expanded={isMenuOpen}
						style={{ color: linkColor }}
					>
						<svg
							className="w-6 h-6"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							{isMenuOpen ? (
								// Icône X (fermer)
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M6 18L18 6M6 6l12 12"
								/>
							) : (
								// Icône hamburger (menu)
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M4 6h16M4 12h16M4 18h16"
								/>
							)}
						</svg>
					</button>

					{/* Menu vertical déroulant */}
					{isMenuOpen && (
						<div
							className="absolute top-full left-0 right-0 w-full bg-white border-b border-slate-200 shadow-lg z-50"
							style={{
								backgroundColor,
								borderRadius: borderRadius !== "0px" ? `0 0 ${borderRadius} ${borderRadius}` : undefined,
								boxShadow: boxShadow !== "none" ? boxShadow : undefined,
							}}
						>
							<div className="flex flex-col py-2">
								{links.map((link: { text: string; url: string }, index: number) => (
									<a
										key={index}
										href={link.url || "#"}
										className="font-medium transition-colors hover:bg-slate-50 px-6 py-3"
										style={{ color: linkColor }}
										onClick={() => setIsMenuOpen(false)}
									>
										{link.text || `Lien ${index + 1}`}
									</a>
								))}
							</div>
						</div>
					)}
				</>
			)}
		</nav>
	);
}

interface NodeRendererProps {
	nodeId: string;
	isPreview?: boolean;
}

export function NodeRenderer({ nodeId, isPreview = false }: NodeRendererProps) {
	const dispatch = useAppDispatch();
	const node = useAppSelector((state) => state.pageTree.nodes[nodeId]);
	const selectedNodeId = useAppSelector((state) => state.pageTree.selectedNodeId);
	const hoveredNodeId = useAppSelector((state) => state.pageTree.hoveredNodeId);
	const viewport = useAppSelector((state) => state.editor.activeBreakpoint);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

	// Convertir le viewport en breakpoint pour ResizableWrapper
	const breakpoint: "desktop" | "tablet" | "mobile" =
		viewport === "base" ? "desktop" : viewport === "tablet" ? "tablet" : "mobile";

	if (!node) return null;

	const isSelected = selectedNodeId === nodeId;
	const isHovered = hoveredNodeId === nodeId;

	// Écouter l'événement de suppression via touche Delete
	useEffect(() => {
		const handleDeleteNode = (e: any) => {
			const { nodeId: targetNodeId } = e.detail;
			if (targetNodeId === nodeId && isSelected) {
				setShowDeleteConfirm(true);
			}
		};

		document.addEventListener("deleteNode", handleDeleteNode);

		return () => {
			document.removeEventListener("deleteNode", handleDeleteNode);
		};
	}, [nodeId, isSelected]);

	// Convertir les styles en classes Tailwind
	const baseClasses = stylesToTailwind(node.styles.desktop);
	const tabletClasses = node.styles.tablet
		? Object.keys(node.styles.tablet).length > 0
			? stylesToTailwind(node.styles.tablet)
					.split(" ")
					.map((c) => `md:${c}`)
					.join(" ")
			: ""
		: "";
	const mobileClasses = node.styles.mobile
		? Object.keys(node.styles.mobile).length > 0
			? stylesToTailwind(node.styles.mobile)
					.split(" ")
					.map((c) => `sm:${c}`)
					.join(" ")
			: ""
		: "";

	const styleClasses = `${baseClasses} ${tabletClasses} ${mobileClasses}`.trim();

	// Récupérer les dimensions inline depuis Redux
	const savedWidth = node.styles[breakpoint]?.width;
	const savedHeight = node.styles[breakpoint]?.height;

	// Créer les styles inline pour width/height
	const inlineStyles: React.CSSProperties = {};
	if (savedWidth) inlineStyles.width = savedWidth;
	if (savedHeight) inlineStyles.height = savedHeight;

	// Classes d'interaction (sauf en mode preview)
	const interactionClasses = !isPreview
		? `
		group
		transition-all duration-150 cursor-pointer
		${isSelected ? "ring-2 ring-violet-500 ring-offset-2" : ""}
		${isHovered && !isSelected ? "ring-2 ring-violet-300" : ""}
		hover:ring-2 hover:ring-violet-300
	`
		: "";

	const combinedClasses = `${styleClasses} ${interactionClasses} relative`.trim();

	const handleClick = (e: React.MouseEvent) => {
		if (isPreview) return;
		e.stopPropagation();
		dispatch(selectNode(nodeId));
	};

	const handleMouseEnter = (e: React.MouseEvent) => {
		if (isPreview) return;
		e.stopPropagation();
		dispatch(hoverNode(nodeId));
	};

	const handleMouseLeave = () => {
		if (isPreview) return;
		dispatch(hoverNode(null));
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
				detail: { componentType, targetNodeId: nodeId },
				bubbles: true,
			});
			e.currentTarget.dispatchEvent(event);
		}
	};

	// Gestion de la suppression
	const handleDelete = (e: React.MouseEvent) => {
		e.stopPropagation();
		setShowDeleteConfirm(true);
	};

	const confirmDelete = (e: React.MouseEvent) => {
		e.stopPropagation();
		dispatch(removeNode(nodeId));
		setShowDeleteConfirm(false);
	};

	const cancelDelete = (e: React.MouseEvent) => {
		e.stopPropagation();
		setShowDeleteConfirm(false);
	};

	// Label d'identification avec bouton suppression (sauf en mode preview)
	const NodeLabel = !isPreview && (isSelected || isHovered) && (
		<div className="absolute -top-6 left-0 right-0 flex items-center justify-between bg-violet-600 text-white text-xs px-2 py-1 rounded-t z-10 font-medium">
			<span>
				{node.type} {node.props.label ? `- ${node.props.label}` : ""}
			</span>
			{isSelected && (
				<button
					onClick={handleDelete}
					className="ml-2 p-1 hover:bg-violet-700 rounded transition-colors"
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
					{node.children.length > 0 && (
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

	// Rendu selon le type de composant
	return (
		<>
			{DeleteConfirmModal}
			<ResizableWrapper
				nodeId={nodeId}
				isSelected={isSelected}
				isPreview={isPreview}
				breakpoint={breakpoint}
			>
				<div
					className={combinedClasses}
					style={Object.keys(inlineStyles).length > 0 ? inlineStyles : undefined}
					onClick={handleClick}
					onMouseEnter={handleMouseEnter}
					onMouseLeave={handleMouseLeave}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
					data-node-id={nodeId}
				>
					{NodeLabel}

					{/* Contenu du composant */}
					{renderComponentContent(node, isPreview, breakpoint)}

					{/* Rendu récursif des enfants */}
					{node.children.length > 0 && (
						<>
							{node.children.map((childId) => (
								<NodeRenderer key={childId} nodeId={childId} isPreview={isPreview} />
							))}
						</>
					)}

					{/* Placeholder si le container est vide (sauf en mode preview) */}
					{!isPreview &&
						node.children.length === 0 &&
						COMPONENT_CONFIG[node.type]?.canHaveChildren && (
							<div className="p-8 border-2 border-dashed border-slate-300 rounded-lg text-center text-slate-400 text-sm">
								<svg
									className="w-8 h-8 mx-auto mb-2 text-slate-300"
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
								Glissez des composants ici
							</div>
						)}
				</div>
			</ResizableWrapper>
		</>
	);
}

// Rendu du contenu selon le type de composant
function renderComponentContent(
	node: Node,
	isPreview: boolean,
	breakpoint: "desktop" | "tablet" | "mobile"
): React.ReactNode {
	switch (node.type) {
		case "Section":
			// Section est un container, son contenu = ses enfants
			return null;

		case "Container":
			// Container est un container, son contenu = ses enfants
			return null;

		case "Heading":
			const headingLevel = (node.props.level || "h2") as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
			const headingText = node.props.text || "Titre";
			switch (headingLevel) {
				case "h1":
					return <h1>{headingText}</h1>;
				case "h2":
					return <h2>{headingText}</h2>;
				case "h3":
					return <h3>{headingText}</h3>;
				case "h4":
					return <h4>{headingText}</h4>;
				case "h5":
					return <h5>{headingText}</h5>;
				case "h6":
					return <h6>{headingText}</h6>;
				default:
					return <h2>{headingText}</h2>;
			}

		case "Paragraph":
			return <p>{node.props.text || "Paragraphe"}</p>;

		case "Button":
			return (
				<button className="px-4 py-2 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition">
					{node.props.text || "Button"}
				</button>
			);

		case "Image":
			return (
				<img
					src={node.props.src || "/placeholder.jpg"}
					alt={node.props.alt || "Image"}
					className="w-full h-auto"
				/>
			);

		case "Divider":
			return <hr className="border-t border-slate-300" />;

		case "Link":
			return (
				<a href={node.props.url || "#"} className="text-violet-600 hover:underline">
					{node.props.text || "Lien"}
				</a>
			);

		case "Navbar":
			return <NavbarContent node={node} breakpoint={breakpoint} />;

		default:
			// Pour les composants non implémentés
			return (
				<div className="p-4 bg-slate-100 border border-slate-300 rounded text-sm text-slate-600">
					{node.type} (à implémenter)
				</div>
			);
	}
}

