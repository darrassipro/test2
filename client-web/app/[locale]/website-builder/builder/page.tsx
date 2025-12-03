"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Home, Undo2, Redo2, X, Eye, Save, Monitor, Tablet, Smartphone } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { addNode, selectNode, undo, redo, loadTree } from "services/slices/pageTreeSlice";
import { setBreakpoint } from "services/slices/editorSlice";
import { savePageStateToLocalStorage, loadPageStateFromLocalStorage, convertSavedStateToRedux } from "@/lib/savePageState";
import { canDropComponent, COMPONENT_CONFIG } from "@/lib/componentConfig";
import EditorCanvas from "@/components/builder/EditorCanvas";
import { SectionEditor } from "@/components/builder/SectionEditor";
import { NavbarEditor } from "@/components/builder/NavbarEditor";
import { ContainerEditor } from "@/components/builder/ContainerEditor";
import { ImageEditor } from "@/components/builder/ImageEditor";
import { HeadingEditor } from "@/components/builder/HeadingEditor";
import AjiwLogo from "@/assets/Logo-05 1.png";

// Types de composants disponibles
const componentLibrary = [
	{
		title: "Basics",
		items: ["Heading", "Paragraph", "Image", "Button", "Icon", "Divider", "Link"],
	},
	{
		title: "Containers",
		items: ["Section", "Container", "Flexbox", "Grid"],
	},
	{
		title: "Advanced",
		items: ["Navbar", "Footer", "Hero", "Gallery", "Form"],
	},
];

export default function BuilderPage() {
	const dispatch = useAppDispatch();
	const router = useRouter();
	const params = useParams();
	const locale = params.locale as string;
	const [selectedTab, setSelectedTab] = useState<"components" | "layers" | "styles">("components");
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [isPreviewMode, setIsPreviewMode] = useState(false);
	const [draggedComponent, setDraggedComponent] = useState<string | null>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	// Redux state
	const rootNodeId = useAppSelector((state) => state.pageTree.rootNodeId);
	const nodes = useAppSelector((state) => state.pageTree.nodes);
	const selectedNodeId = useAppSelector((state) => state.pageTree.selectedNodeId);
	const hoveredNodeId = useAppSelector((state) => state.pageTree.hoveredNodeId);
	const canUndo = useAppSelector((state) => state.pageTree.history.past.length > 0);
	const canRedo = useAppSelector((state) => state.pageTree.history.future.length > 0);
	// Utiliser le breakpoint depuis Redux au lieu d'un state local
	const activeBreakpoint = useAppSelector((state) => state.editor.activeBreakpoint);

	// Convertir le breakpoint Redux ("base" | "tablet" | "mobile") en format d'affichage
	const viewport = activeBreakpoint === "base" ? "desktop" : activeBreakpoint;

	// Charger l'état depuis localStorage au montage si disponible (sites personnalisés uniquement)
	useEffect(() => {
		const savedState = loadPageStateFromLocalStorage("builder");
		
		if (savedState) {
			// Charger l'état sauvegardé depuis localStorage
			console.log("[BuilderPage] Chargement de l'état sauvegardé depuis localStorage");
			const reduxState = convertSavedStateToRedux(savedState);
			dispatch(loadTree({
				nodes: reduxState.nodes,
				rootNodeId: reduxState.rootNodeId,
			}));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dispatch]);

	// Fonction pour changer le viewport (met à jour Redux)
	const handleViewportChange = (newViewport: "desktop" | "tablet" | "mobile") => {
		// Convertir "desktop" en "base" pour Redux
		const breakpoint = newViewport === "desktop" ? "base" : newViewport;
		dispatch(setBreakpoint(breakpoint));
	};

	// Définir la largeur du canvas selon le viewport
	const getCanvasWidth = () => {
		switch (viewport) {
			case "mobile":
				return "max-w-[375px]";
			case "tablet":
				return "max-w-[768px]";
			case "desktop":
			default:
				return "max-w-full";
		}
	};

	// Gestion du drag
	const handleDragStart = (e: React.DragEvent, componentType: string) => {
		e.dataTransfer.setData("text/plain", componentType);
		e.dataTransfer.effectAllowed = "copy";
		setDraggedComponent(componentType);
		setErrorMessage(null);
	};

	const handleDragEnd = () => {
		setDraggedComponent(null);
	};

	// Gestion du drop sur le canvas vide
	const handleCanvasDrop = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();

		const componentType = e.dataTransfer.getData("text/plain");
		if (!componentType) return;

		// Validation : canvas vide = Section seulement
		const validation = canDropComponent(componentType, null);

		if (!validation.allowed) {
			setErrorMessage(validation.message || "Drop non autorisé");
			setTimeout(() => setErrorMessage(null), 3000);
			return;
		}

		// Récupérer les props par défaut depuis la config
		const config = canDropComponent(componentType, null);
		const defaultProps = COMPONENT_CONFIG[componentType]?.defaultProps || {};
		
		// Créer le node Section
		dispatch(
			addNode({
				type: componentType,
				parentId: null,
				props: defaultProps,
			})
		);

		setDraggedComponent(null);
	};

	const handleCanvasDragOver = (e: React.DragEvent) => {
		e.preventDefault();
	};

	// Écouter l'événement custom dropComponent des NodeRenderer
	useEffect(() => {
		const handleDropComponent = (e: any) => {
			const { componentType, targetNodeId } = e.detail;

			if (!componentType || !targetNodeId) return;

			const targetNode = nodes[targetNodeId];
			if (!targetNode) return;

			// Validation
			const validation = canDropComponent(componentType, targetNode.type);

			if (!validation.allowed) {
				setErrorMessage(validation.message || "Drop non autorisé");
				setTimeout(() => setErrorMessage(null), 3000);
				return;
			}

			// Récupérer les props par défaut depuis la config
			const defaultProps = COMPONENT_CONFIG[componentType]?.defaultProps || {};
			
			// Créer le node enfant
			dispatch(
				addNode({
					type: componentType,
					parentId: targetNodeId,
					props: defaultProps,
				})
			);
		};

		document.addEventListener("dropComponent", handleDropComponent);

		return () => {
			document.removeEventListener("dropComponent", handleDropComponent);
		};
	}, [dispatch, nodes]);

	// Écouter les raccourcis clavier (Delete, Ctrl+Z, Ctrl+Y)
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Vérifier qu'on n'est pas en train d'écrire dans un input
			const target = e.target as HTMLElement;
			const isInputField =
				target.tagName === "INPUT" ||
				target.tagName === "TEXTAREA" ||
				target.isContentEditable;

			// Ctrl+Z (Undo)
			if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
				if (!isInputField && canUndo && !isPreviewMode) {
					e.preventDefault();
					dispatch(undo());
				}
				return;
			}

			// Ctrl+Y ou Ctrl+Shift+Z (Redo)
			if (
				((e.ctrlKey || e.metaKey) && e.key === "y") ||
				((e.ctrlKey || e.metaKey) && e.key === "z" && e.shiftKey)
			) {
				if (!isInputField && canRedo && !isPreviewMode) {
					e.preventDefault();
					dispatch(redo());
				}
				return;
			}

			// Delete ou Backspace (sur Mac)
			if (
				(e.key === "Delete" || e.key === "Backspace") &&
				selectedNodeId &&
				!isPreviewMode
			) {
				if (!isInputField) {
					e.preventDefault();
					// Déclencher l'événement de suppression via un custom event
					// pour que le NodeRenderer gère la confirmation
					const deleteEvent = new CustomEvent("deleteNode", {
						detail: { nodeId: selectedNodeId },
					});
					document.dispatchEvent(deleteEvent);
				}
			}
		};

		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [selectedNodeId, isPreviewMode, canUndo, canRedo, dispatch]);

	return (
		<div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
			{/* Header */}
			{!isFullscreen && (
				<header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm flex-shrink-0">
					<div className="flex items-center gap-4">
						<div className="w-16 h-16 rounded-full bg-white shadow-[0_6px_24px_rgba(15,23,42,0.12)] flex items-center justify-center">
							<Image
								src={AjiwLogo}
								alt="Logo Ajiw"
								className="w-10 h-10 object-contain"
								priority
							/>
						</div>
						<div>
							<h1 className="text-2xl font-semibold text-slate-900 leading-tight">SiteBuilder</h1>
							<p className="text-base text-slate-500">Créez, prévisualisez et publiez</p>
						</div>
					</div>

					<div className="flex items-center gap-4">
						<button
							className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
							type="button"
						>
							<Home className="w-4 h-4 text-slate-500" />
							<span className="font-semibold">Home</span>
						</button>

						<div className="flex items-center gap-2 text-slate-400">
							<button
								type="button"
								className="p-2 rounded-full hover:bg-slate-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
								title="Annuler"
								disabled={!canUndo}
								onClick={() => canUndo && dispatch(undo())}
							>
								<Undo2 className="w-5 h-5" />
							</button>
							<button
								type="button"
								className="p-2 rounded-full hover:bg-slate-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
								title="Rétablir"
								disabled={!canRedo}
								onClick={() => canRedo && dispatch(redo())}
							>
								<Redo2 className="w-5 h-5" />
							</button>
						</div>

						<Link
							href="/"
							className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition"
						>
							<X className="w-4 h-4" />
							<span>Cancel</span>
						</Link>

						<Link
							href={`/${locale}/website-builder/preview`}
							onClick={() => {
								// Sauvegarder l'état actuel avant de naviguer vers preview
								const currentState = {
									nodes,
									rootNodeId,
									selectedNodeId,
									hoveredNodeId,
									isDirty: false,
									history: { past: [], future: [] },
								};
								savePageStateToLocalStorage(currentState, "builder");
							}}
							className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full border border-slate-200 text-slate-700 hover:border-slate-300 transition"
						>
							<Eye className="w-4 h-4" />
							Preview
						</Link>

						<button
							className="flex items-center gap-2 px-6 py-2 rounded-full text-sm font-semibold text-white shadow-sm transition bg-[#E72858] hover:bg-[#cf2048]"
						>
							<Save className="w-4 h-4" />
							Publish
						</button>
					</div>
				</header>
			)}

			{/* Body */}
			<div className="flex flex-1 overflow-hidden min-h-0">
				{/* Sidebar */}
				<aside className="w-80 bg-white border-r border-slate-200 flex flex-col shadow-sm h-full overflow-hidden">
					{/* Sidebar Tabs */}
					<div className="border-b border-slate-200 px-4 py-3 flex-shrink-0">
						<div className="flex gap-2">
							<button
								onClick={() => setSelectedTab("components")}
								className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition ${
									selectedTab === "components"
										? "bg-[#E72858] text-white"
										: "text-slate-600 hover:bg-slate-100"
								}`}
							>
								Composants
							</button>
							<button
								onClick={() => setSelectedTab("layers")}
								className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition ${
									selectedTab === "layers"
										? "bg-[#E72858] text-white"
										: "text-slate-600 hover:bg-slate-100"
								}`}
							>
								Layers
							</button>
							<button
								onClick={() => setSelectedTab("styles")}
								className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition ${
									selectedTab === "styles"
										? "bg-[#E72858] text-white"
										: "text-slate-600 hover:bg-slate-100"
								}`}
							>
								Styles
							</button>
						</div>
					</div>

					{/* Sidebar Content */}
					<div className="flex-1 overflow-y-auto p-6 min-h-0">
						{selectedTab === "components" && (
							<>
								<div className="mb-6">
									<h2 className="text-sm font-semibold text-slate-900 mb-3">Bibliothèque de composants</h2>
									<p className="text-xs text-slate-500 mb-4">
										Glissez-déposez les composants sur le canvas pour construire votre site
									</p>
								</div>

								{componentLibrary.map((group) => (
									<div key={group.title} className="mb-6">
										<h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
											{group.title}
										</h3>
										<div className="grid grid-cols-2 gap-2">
											{group.items.map((item) => (
												<button
													key={item}
													draggable
													onDragStart={(e) => handleDragStart(e, item)}
													onDragEnd={handleDragEnd}
													className="p-3 bg-slate-50 border border-slate-200 hover:border-2 hover:border-[#0D318B] rounded-lg text-sm font-medium text-slate-700 transition-all cursor-move"
												>
													<div className="flex flex-col items-center gap-2">
														<div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center transition">
															<svg
																className="w-4 h-4 text-slate-500"
																fill="none"
																stroke="currentColor"
																viewBox="0 0 24 24"
															>
																<path
																	strokeLinecap="round"
																	strokeLinejoin="round"
																	strokeWidth={2}
																	d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
																/>
															</svg>
														</div>
														<span className="text-xs">{item}</span>
													</div>
												</button>
											))}
										</div>
									</div>
								))}
							</>
						)}

						{selectedTab === "layers" && (
							<div>
								<h2 className="text-sm font-semibold text-slate-900 mb-4">Structure de la page</h2>
								<div className="space-y-2">
									<div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
										<div className="flex items-center gap-2">
											<svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
											</svg>
											<span className="text-sm text-slate-600">Page Root</span>
										</div>
									</div>
									<p className="text-xs text-slate-500 text-center py-8">
										Aucun composant ajouté. Commencez par glisser des éléments depuis la bibliothèque.
									</p>
								</div>
							</div>
						)}

						{selectedTab === "styles" && (
							<>
								{selectedNodeId && nodes[selectedNodeId]?.type === "Navbar" ? (
									<NavbarEditor />
								) : selectedNodeId && nodes[selectedNodeId]?.type === "Container" ? (
									<ContainerEditor />
								) : selectedNodeId && nodes[selectedNodeId]?.type === "Image" ? (
									<ImageEditor />
								) : selectedNodeId && nodes[selectedNodeId]?.type === "Heading" ? (
									<HeadingEditor />
								) : (
									<SectionEditor />
								)}
							</>
						)}
					</div>
				</aside>

				{/* Canvas */}
				<main className="flex-1 bg-slate-100 overflow-hidden flex flex-col min-h-0">
					{/* Canvas Toolbar - Fixed */}
					<div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm flex-shrink-0 z-10">
						<div className="flex items-center gap-4">
							<span className="text-sm text-slate-600">Viewport:</span>
							<div className="flex gap-2">
								<button 
									onClick={() => handleViewportChange("desktop")}
									className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
										viewport === "desktop"
											? "bg-[#E72858] text-white"
											: "text-slate-600 hover:bg-slate-100"
									}`}
								>
									<Monitor className="w-4 h-4" />
									<span>Desktop</span>
								</button>
								<button 
									onClick={() => handleViewportChange("tablet")}
									className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
										viewport === "tablet"
											? "bg-[#E72858] text-white"
											: "text-slate-600 hover:bg-slate-100"
									}`}
								>
									<Tablet className="w-4 h-4" />
									<span>Tablet</span>
								</button>
								<button 
									onClick={() => handleViewportChange("mobile")}
									className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
										viewport === "mobile"
											? "bg-[#E72858] text-white"
											: "text-slate-600 hover:bg-slate-100"
									}`}
								>
									<Smartphone className="w-4 h-4" />
									<span>Mobile</span>
								</button>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<button 
								onClick={() => setIsFullscreen(!isFullscreen)}
								className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
								title={isFullscreen ? "Quitter le mode plein écran" : "Mode plein écran"}
							>
								<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
								</svg>
							</button>
						</div>
					</div>

					{/* Canvas Content - Scrollable */}
					<div className="flex-1 overflow-y-auto p-8 min-h-0">
						<div className="max-w-7xl mx-auto">

						{/* Canvas Area */}
						<div 
							className={`bg-white border-x border-b border-slate-200 shadow-lg min-h-[800px] transition-all ${getCanvasWidth()} mx-auto relative`}
							onDrop={handleCanvasDrop}
							onDragOver={handleCanvasDragOver}
							onClick={() => !isPreviewMode && dispatch(selectNode(null))}
						>
							{/* Message d'erreur */}
							{errorMessage && (
								<div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-bounce">
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									{errorMessage}
								</div>
							)}

							{/* Canvas vide : Placeholder */}
							{!rootNodeId && !isPreviewMode && (
								<div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-300 bg-slate-50/50 min-h-[800px]">
									<div className="text-center max-w-md">
										<div className="w-20 h-20 bg-gradient-to-br from-violet-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
											<svg className="w-10 h-10 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
											</svg>
										</div>
										<h3 className="text-xl font-bold text-slate-900 mb-3">Canvas vide</h3>
										<p className="text-slate-600 mb-6">
											Commencez par glisser-déposer une <span className="font-semibold text-violet-600">Section</span> depuis la sidebar
										</p>
										<div className="flex flex-col gap-2 text-sm text-slate-500">
											<div className="flex items-center gap-2 justify-center">
												<svg className="w-4 h-4 text-violet-500" fill="currentColor" viewBox="0 0 20 20">
													<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
												</svg>
												<span>Drag & Drop intuitif</span>
											</div>
											<div className="flex items-center gap-2 justify-center">
												<svg className="w-4 h-4 text-violet-500" fill="currentColor" viewBox="0 0 20 20">
													<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
												</svg>
												<span>Design responsive</span>
											</div>
											<div className="flex items-center gap-2 justify-center">
												<svg className="w-4 h-4 text-violet-500" fill="currentColor" viewBox="0 0 20 20">
													<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
												</svg>
												<span>Personnalisation complète</span>
											</div>
										</div>
									</div>
								</div>
							)}

							{/* Canvas avec composants */}
							<div className="w-full">
								<EditorCanvas isPreview={isPreviewMode} />
							</div>
						</div>

						{/* Canvas Footer */}
						<div className="mt-4 flex items-center justify-between">
							<div className="flex items-center gap-2 text-xs text-slate-500">
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								<span>{Object.keys(nodes).length} composant{Object.keys(nodes).length > 1 ? 's' : ''} • Dernière sauvegarde: jamais</span>
							</div>
							<div className="flex gap-2">
								<button className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition">
									Exporter JSON
								</button>
								<button className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition">
									Télécharger HTML
								</button>
							</div>
						</div>
						</div>
					</div>
				</main>
			</div>
		</div>
	);
}

