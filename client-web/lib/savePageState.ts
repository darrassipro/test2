import { PageTreeState, Node, ResponsiveStyles } from "services/slices/pageTreeSlice";

/**
 * Interface pour le format de sauvegarde dans localStorage
 * Structure prête pour être stockée en base de données
 */
export interface SavedPageState {
	version: string; // Version du format de sauvegarde
	timestamp: string; // Date de sauvegarde ISO
	rootNodeId: string | null;
	nodes: Array<{
		id: string; // UUID
		type: string;
		parentId: string | null;
		props: Record<string, any>; // Inclut hotelId si présent
		styles: {
			desktop: Record<string, string>;
			tablet: Record<string, string>;
			mobile: Record<string, string>;
			__meta?: {
				desktop?: { widthMode?: string; heightMode?: string };
				tablet?: { widthMode?: string; heightMode?: string };
				mobile?: { widthMode?: string; heightMode?: string };
			};
		};
		children: string[]; // IDs des enfants (UUIDs)
		orderIndex: number;
		locked?: boolean;
	}>;
}

/**
 * Types de sauvegarde dans localStorage
 */
export type PageStateType = "template" | "builder";

/**
 * Sauvegarde l'état actuel de la page dans localStorage
 * Format JSON structuré prêt pour être stocké en base de données
 * @param state - L'état Redux à sauvegarder
 * @param type - Le type de page : "template" pour les templates, "builder" pour les sites personnalisés
 */
export function savePageStateToLocalStorage(state: PageTreeState, type: PageStateType = "builder"): void {
	try {
		// Convertir l'objet nodes en tableau pour faciliter le stockage en base de données
		// IMPORTANT: Sauvegarder TOUS les styles pour les 3 breakpoints (desktop, tablet, mobile)
		// même s'ils sont vides, pour préserver l'état complet de chaque vue
		const nodesArray = Object.values(state.nodes).map((node) => {
			// S'assurer que tous les breakpoints sont présents, même s'ils sont vides
			const desktopStyles = node.styles.desktop || {};
			const tabletStyles = node.styles.tablet || {};
			const mobileStyles = node.styles.mobile || {};
			
			// S'assurer que __meta existe pour tous les breakpoints
			const meta = node.styles.__meta || {};
			const desktopMeta = meta.desktop || { widthMode: "auto", heightMode: "auto" };
			const tabletMeta = meta.tablet || { widthMode: "auto", heightMode: "auto" };
			const mobileMeta = meta.mobile || { widthMode: "auto", heightMode: "auto" };
			
			return {
				id: node.id, // UUID
				type: node.type,
				parentId: node.parentId,
				props: node.props, // Inclut hotelId si présent pour les templates hotel
				styles: {
					desktop: desktopStyles,
					tablet: tabletStyles,
					mobile: mobileStyles,
					__meta: {
						desktop: desktopMeta,
						tablet: tabletMeta,
						mobile: mobileMeta,
					},
				},
				children: node.children, // Array d'UUIDs
				orderIndex: node.orderIndex,
				locked: node.locked,
			};
		});

		const savedState: SavedPageState = {
			version: "1.0.0",
			timestamp: new Date().toISOString(),
			rootNodeId: state.rootNodeId,
			nodes: nodesArray,
		};

		// Sauvegarder dans localStorage avec la clé appropriée selon le type
		const key = type === "template" ? "ajiw-template-state" : "ajiw-builder-state";
		localStorage.setItem(key, JSON.stringify(savedState, null, 2));
		
		console.log("[savePageState] État sauvegardé dans localStorage:", {
			type,
			key,
			nodesCount: nodesArray.length,
			rootNodeId: state.rootNodeId,
			timestamp: savedState.timestamp,
		});
	} catch (error) {
		console.error("[savePageState] Erreur lors de la sauvegarde:", error);
	}
}

/**
 * Charge l'état sauvegardé depuis localStorage
 * @param type - Le type de page : "template" pour les templates, "builder" pour les sites personnalisés
 */
export function loadPageStateFromLocalStorage(type: PageStateType = "builder"): SavedPageState | null {
	try {
		const key = type === "template" ? "ajiw-template-state" : "ajiw-builder-state";
		let saved = localStorage.getItem(key);
		
		// Migration : Si la nouvelle clé n'existe pas, essayer l'ancienne clé "ajiw-page-state"
		// pour les templates (compatibilité avec les données existantes)
		if (!saved && type === "template") {
			const oldKey = "ajiw-page-state";
			const oldSaved = localStorage.getItem(oldKey);
			if (oldSaved) {
				console.log("[loadPageState] Migration: Chargement depuis l'ancienne clé 'ajiw-page-state'");
				saved = oldSaved;
				// Migrer vers la nouvelle clé
				localStorage.setItem(key, oldSaved);
				// Optionnel : supprimer l'ancienne clé après migration
				// localStorage.removeItem(oldKey);
			}
		}
		
		if (!saved) {
			return null;
		}
		
		const parsed = JSON.parse(saved) as SavedPageState;
		console.log("[loadPageState] État chargé depuis localStorage:", {
			type,
			key,
			nodesCount: parsed.nodes.length,
			rootNodeId: parsed.rootNodeId,
			timestamp: parsed.timestamp,
		});
		
		return parsed;
	} catch (error) {
		console.error("[loadPageState] Erreur lors du chargement:", error);
		return null;
	}
}

/**
 * Convertit SavedPageState en format Redux (PageTreeState)
 * Convertit le tableau de nodes en Record<string, Node>
 */
export function convertSavedStateToRedux(savedState: SavedPageState): PageTreeState {
	// Convertir le tableau de nodes en Record<string, Node>
	const nodesMap: Record<string, Node> = {};
	
	savedState.nodes.forEach((savedNode) => {
		// Reconstruire les ResponsiveStyles
		// IMPORTANT: Restaurer TOUS les styles (desktop, tablet, mobile) même s'ils sont vides
		// pour préserver l'état exact et éviter la perte de styles
		const responsiveStyles: ResponsiveStyles = {
			desktop: savedNode.styles.desktop || {},
		};
		
		// Toujours restaurer tablet et mobile, même s'ils sont vides
		// Cela préserve l'état exact sauvegardé
		if (savedNode.styles.tablet !== undefined) {
			responsiveStyles.tablet = savedNode.styles.tablet;
		}
		if (savedNode.styles.mobile !== undefined) {
			responsiveStyles.mobile = savedNode.styles.mobile;
		}
		
		// Ajouter __meta si présent
		if (savedNode.styles.__meta) {
			responsiveStyles.__meta = savedNode.styles.__meta;
		}
		
		const node: Node = {
			id: savedNode.id,
			type: savedNode.type,
			parentId: savedNode.parentId,
			props: savedNode.props,
			styles: responsiveStyles,
			children: savedNode.children,
			orderIndex: savedNode.orderIndex,
			locked: savedNode.locked,
		};
		
		nodesMap[savedNode.id] = node;
	});
	
	return {
		nodes: nodesMap,
		rootNodeId: savedState.rootNodeId,
		selectedNodeId: null, // Réinitialiser la sélection
		hoveredNodeId: null, // Réinitialiser le hover
		isDirty: false, // Marquer comme non modifié
		history: {
			past: [],
			future: [],
		},
	};
}

