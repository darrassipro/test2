"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, use } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Home, Undo2, Redo2, X, Eye, Save, Monitor, Tablet, Smartphone } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { selectNode, undo, redo, loadTree } from "services/slices/pageTreeSlice";
import { setBreakpoint } from "services/slices/editorSlice";
import { savePageStateToLocalStorage, loadPageStateFromLocalStorage, convertSavedStateToRedux } from "@/lib/savePageState";
import { hotelTemplateToRedux } from "@/lib/templates/hotelTemplate";
import EditorCanvas from "@/components/builder/EditorCanvas";
import { SectionEditor } from "@/components/builder/SectionEditor";
import { NavbarEditor } from "@/components/builder/NavbarEditor";
import { ContainerEditor } from "@/components/builder/ContainerEditor";
import { ImageEditor } from "@/components/builder/ImageEditor";
import { HeadingEditor } from "@/components/builder/HeadingEditor";
import AjiwLogo from "@/assets/Logo-05 1.png";
import { 
	useLazySearchRatesQuery,
	useLazyGetHotelDetailsQuery,
	useLazyGetHotelReviewsQuery
} from "@/services/api/bookingApi";
import { HotelDataProvider } from "@/contexts/HotelDataContext";

export default function TemplatePage({ params }: { params: Promise<{ id: string; locale: string }> }) {
	const dispatch = useAppDispatch();
	const router = useRouter();
	const resolvedParams = use(params);
	const searchParams = useSearchParams();
	const [selectedTab, setSelectedTab] = useState<"styles">("styles");
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [isPreviewMode, setIsPreviewMode] = useState(false);
	
	// État pour la recherche d'hôtel (uniquement pour template hotel)
	const isHotelTemplate = resolvedParams.id === "hotel";
	const hotelIdFromQuery = searchParams.get("hotelId");
	
	// Hooks pour les appels API lors de la sélection d'un hôtel
	const [fetchHotelDetails, { isFetching: hotelDetailsLoading }] = useLazyGetHotelDetailsQuery();
	const [fetchHotelReviews, { isFetching: hotelReviewsLoading }] = useLazyGetHotelReviewsQuery();
	const [fetchRates, { isFetching: ratesLoading }] = useLazySearchRatesQuery();
	
	// État pour stocker l'hôtel sélectionné et ses données
	const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null);
	const [selectedHotelData, setSelectedHotelData] = useState<{
		details: any;
		reviews: any[];
		rates: any;
	} | null>(null);
	const [selectedLanguage, setSelectedLanguage] = useState<string>('fr');
	const [loadingHotelId, setLoadingHotelId] = useState<string | null>(null);

	// Redux state
	const rootNodeId = useAppSelector((state) => state.pageTree.rootNodeId);
	const nodes = useAppSelector((state) => state.pageTree.nodes);
	const selectedNodeId = useAppSelector((state) => state.pageTree.selectedNodeId);
	const hoveredNodeId = useAppSelector((state) => state.pageTree.hoveredNodeId);
	const canUndo = useAppSelector((state) => state.pageTree.history.past.length > 0);
	const canRedo = useAppSelector((state) => state.pageTree.history.future.length > 0);
	const activeBreakpoint = useAppSelector((state) => state.editor.activeBreakpoint);

	// Convertir le breakpoint Redux ("base" | "tablet" | "mobile") en format d'affichage
	const viewport = activeBreakpoint === "base" ? "desktop" : activeBreakpoint;

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

	// Charger l'état depuis localStorage ou le template par défaut au montage
	useEffect(() => {
		// D'abord, vérifier s'il y a un état sauvegardé dans localStorage pour les templates
		const savedState = loadPageStateFromLocalStorage("template");
		
		if (savedState) {
			// Charger l'état sauvegardé depuis localStorage
			console.log("[TemplatePage] Chargement de l'état sauvegardé depuis localStorage", {
				nodesCount: savedState.nodes.length,
				rootNodeId: savedState.rootNodeId,
			});
			const reduxState = convertSavedStateToRedux(savedState);
			console.log("[TemplatePage] État converti pour Redux:", {
				nodesCount: Object.keys(reduxState.nodes).length,
				rootNodeId: reduxState.rootNodeId,
			});
			dispatch(loadTree({
				nodes: reduxState.nodes,
				rootNodeId: reduxState.rootNodeId,
			}));
			console.log("[TemplatePage] État chargé dans Redux");
		} else if (resolvedParams.id === "hotel") {
			// Si pas d'état sauvegardé, charger le template par défaut
			console.log("[TemplatePage] Aucun état sauvegardé trouvé, chargement du template par défaut");
			const templateData = hotelTemplateToRedux();
			dispatch(loadTree(templateData));
		}
	}, [resolvedParams.id, dispatch]);

	// Appeler les 3 endpoints automatiquement si hotelId est présent dans les query params
	useEffect(() => {
		if (isHotelTemplate && hotelIdFromQuery && !selectedHotelData && !loadingHotelId) {
			selectHotel(hotelIdFromQuery);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isHotelTemplate, hotelIdFromQuery]);

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


	// Fonction pour sélectionner un hôtel et récupérer ses données
	const selectHotel = async (hotelId: string) => {
		try {
			setLoadingHotelId(hotelId);
			setSelectedHotelId(hotelId);
			
			// Dates par défaut (aujourd'hui + 2 jours pour checkout)
			const today = new Date();
			const checkoutDate = new Date(today);
			checkoutDate.setDate(checkoutDate.getDate() + 2);
			
			const checkin = today.toISOString().split('T')[0];
			const checkout = checkoutDate.toISOString().split('T')[0];
			const adultsCount = 2;
			
			// Appel parallèle des 3 endpoints
			const [detailsResult, reviewsResult, ratesResult] = await Promise.all([
				// 1. getHotelDetails
				fetchHotelDetails({
					hotelId,
					language: selectedLanguage
				}).unwrap(),
				
				// 2. getHotelReviews
				fetchHotelReviews({
					hotelId,
					limit: 50,
					language: selectedLanguage
				}).unwrap(),
				
				// 3. searchRates
				fetchRates({
					hotelIds: [hotelId],
					occupancies: [{ adults: adultsCount }],
					currency: 'USD',
					guestNationality: 'US',
					checkin,
					checkout,
					roomMapping: true,
					includeHotelData: true,
					language: selectedLanguage
				}).unwrap()
			]);
			
			// Stocker les données récupérées
			// Structure: { success: true, data: { data: ... } }
			setSelectedHotelData({
				details: detailsResult?.data?.data || detailsResult?.data || null,
				reviews: reviewsResult?.data?.data || reviewsResult?.data || [],
				rates: ratesResult?.data?.data?.[0] || null // Premier élément du tableau (comme dans hotel details page)
			});
			
			console.log("Données de l'hôtel récupérées:", {
				hotelId,
				details: detailsResult,
				reviews: reviewsResult,
				rates: ratesResult
			});
			
			// TODO: Lier l'ID de l'hôtel et ses données au template dans Redux
			// On pourra stocker l'ID de l'hôtel dans les props du template ou dans un slice Redux dédié
			
		} catch (error: any) {
			console.error("Erreur lors de la récupération des données de l'hôtel:", error);
		} finally {
			setLoadingHotelId(null);
		}
	};

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
							<h1 className="text-2xl font-semibold text-[#1A2038] leading-tight">Template Editor</h1>
							<p className="text-base text-[#1A2038]/70">Personnalisez votre template</p>
						</div>
					</div>

					<div className="flex items-center gap-4">
						<Link
							href="/"
							className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#1A2038]/20 text-sm font-medium text-[#1A2038] hover:bg-[#1A2038]/5 transition"
						>
							<Home className="w-4 h-4 text-[#1A2038]" />
							<span className="font-semibold">Home</span>
						</Link>

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
							className="flex items-center gap-1.5 text-sm font-medium text-[#1A2038] hover:text-[#1A2038]/80 transition"
						>
							<X className="w-4 h-4" />
							<span>Cancel</span>
						</Link>

						<Link
							href={`/${resolvedParams.locale || 'fr'}/website-builder/preview?templateId=${resolvedParams.id}${hotelIdFromQuery ? `&hotelId=${hotelIdFromQuery}` : ''}`}
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
								savePageStateToLocalStorage(currentState, "template");
							}}
							className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full border border-[#1A2038]/20 text-[#1A2038] hover:border-[#1A2038]/40 transition"
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
					{/* Sidebar Tabs - Only Styles */}
					<div className="border-b border-slate-200 px-4 py-3 flex-shrink-0">
						<div className="flex gap-2">
							<button
								className="flex-1 px-4 py-2 text-sm font-medium rounded-lg transition bg-[#E72858] text-white"
								disabled
							>
								Styles
							</button>
						</div>
					</div>

					{/* Sidebar Content - Only Styles */}
					<div className="flex-1 overflow-y-auto p-6 min-h-0">
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
					{/* Section d'information pour template hotel avec hotelId */}
					{isHotelTemplate && hotelIdFromQuery && (
						<div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm flex-shrink-0">
							<div className="max-w-7xl mx-auto">
								<div className="flex items-center justify-between">
									<div>
										<h2 className="text-lg font-semibold text-[#1A2038] mb-1">Hôtel sélectionné</h2>
										<p className="text-sm text-gray-600">ID: {hotelIdFromQuery}</p>
									</div>
									{(hotelDetailsLoading || hotelReviewsLoading || ratesLoading) && (
										<div className="flex items-center gap-2 text-sm text-gray-600">
											<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#E72858]"></div>
											<span>Chargement des données...</span>
										</div>
									)}
									{selectedHotelData && !hotelDetailsLoading && !hotelReviewsLoading && !ratesLoading && (
										<div className="flex items-center gap-2 text-sm text-green-600">
											<span>✓ Données chargées</span>
										</div>
									)}
								</div>
							</div>
						</div>
					)}
					
					{/* Canvas Toolbar - Fixed */}
					<div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm flex-shrink-0 z-10">
						<div className="flex items-center gap-4">
							<span className="text-sm text-[#1A2038]">Viewport:</span>
							<div className="flex gap-2">
								<button 
									onClick={() => handleViewportChange("desktop")}
									className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
										viewport === "desktop"
											? "bg-[#E72858] text-white"
											: "text-[#1A2038] hover:bg-[#1A2038]/5"
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
											: "text-[#1A2038] hover:bg-[#1A2038]/5"
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
											: "text-[#1A2038] hover:bg-[#1A2038]/5"
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
								className="p-2 text-[#1A2038] hover:bg-[#1A2038]/5 rounded-lg transition"
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
								onClick={() => !isPreviewMode && dispatch(selectNode(null))}
							>
							{/* Canvas avec composants du template */}
							<div className="w-full">
								<HotelDataProvider hotelData={selectedHotelData} hotelId={selectedHotelId}>
									<EditorCanvas isPreview={isPreviewMode} />
								</HotelDataProvider>
							</div>
							</div>

							{/* Canvas Footer */}
							<div className="mt-4 flex items-center justify-between">
								<div className="flex items-center gap-2 text-xs text-[#1A2038]/70">
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									<span>{Object.keys(nodes).length} composant{Object.keys(nodes).length > 1 ? 's' : ''} • Dernière sauvegarde: jamais</span>
								</div>
								<div className="flex gap-2">
									<button className="px-4 py-2 text-sm text-[#1A2038] hover:text-[#1A2038]/80 hover:bg-white rounded-lg transition">
										Exporter JSON
									</button>
									<button className="px-4 py-2 text-sm text-[#1A2038] hover:text-[#1A2038]/80 hover:bg-white rounded-lg transition">
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

