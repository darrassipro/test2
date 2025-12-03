import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";

// Types
export type Breakpoint = "desktop" | "tablet" | "mobile";
export type ComponentCategory = "basic" | "container" | "advanced";

export interface StyleMeta {
	widthMode?: "auto" | "fixed";
	heightMode?: "auto" | "fixed";
}

export interface ResponsiveStyles {
	desktop: Record<string, string>;
	tablet?: Record<string, string>;
	mobile?: Record<string, string>;
	__meta?: {
		desktop?: StyleMeta;
		tablet?: StyleMeta;
		mobile?: StyleMeta;
	};
}

export interface Node {
	id: string;
	type: string;
	parentId: string | null;
	props: Record<string, any>;
	styles: ResponsiveStyles;
	children: string[]; // IDs des enfants
	orderIndex: number;
	locked?: boolean;
}

export interface PageTreeSnapshot {
	nodes: Record<string, Node>;
	rootNodeId: string | null;
	selectedNodeId: string | null;
	hoveredNodeId: string | null;
	isDirty: boolean;
}

export interface PageTreeState {
	nodes: Record<string, Node>; // Map d'ID -> Node
	rootNodeId: string | null;
	selectedNodeId: string | null;
	hoveredNodeId: string | null;
	isDirty: boolean;
	history: {
		past: PageTreeSnapshot[];
		future: PageTreeSnapshot[];
	};
}

const initialState: PageTreeState = {
	nodes: {},
	rootNodeId: null,
	selectedNodeId: null,
	hoveredNodeId: null,
	isDirty: false,
	history: {
		past: [],
		future: [],
	},
};

const HISTORY_LIMIT = 50;

const captureSnapshot = (state: PageTreeState): PageTreeSnapshot =>
	JSON.parse(
		JSON.stringify({
			nodes: state.nodes,
			rootNodeId: state.rootNodeId,
			selectedNodeId: state.selectedNodeId,
			hoveredNodeId: state.hoveredNodeId,
			isDirty: state.isDirty,
		})
	);

const pushHistoryEntry = (state: PageTreeState) => {
	const snapshot = captureSnapshot(state);
	state.history.past.push(snapshot);
	if (state.history.past.length > HISTORY_LIMIT) {
		state.history.past.shift();
	}
	state.history.future = [];
};

const applySnapshot = (state: PageTreeState, snapshot: PageTreeSnapshot) => {
	state.nodes = snapshot.nodes;
	state.rootNodeId = snapshot.rootNodeId;
	state.selectedNodeId = snapshot.selectedNodeId;
	state.hoveredNodeId = snapshot.hoveredNodeId;
	state.isDirty = snapshot.isDirty;
};

const pageTreeSlice = createSlice({
	name: "pageTree",
	initialState,
	reducers: {
		// Ajouter un node
		addNode(
			state,
			action: PayloadAction<{
				type: string;
				parentId: string | null;
				props?: Record<string, any>;
				styles?: ResponsiveStyles;
			}>
		) {
			const { type, parentId, props = {}, styles } = action.payload;
			const nodeId = uuidv4();

			pushHistoryEntry(state);

			// Styles par défaut selon le type de composant
			// IMPORTANT: Les propriétés responsive (width, height, justifyContent, alignItems)
			// ne doivent PAS être dans les styles par défaut car elles doivent être définies
			// indépendamment pour chaque breakpoint
			let defaultStyles: ResponsiveStyles;

			if (type === "Section") {
				// Styles par défaut pour Section
				defaultStyles = {
					desktop: {
						paddingTop: "40px",
						paddingBottom: "40px",
						backgroundColor: "#ffffff",
						backgroundColorOpacity: "50", // 50% par défaut
						display: "flex",
						flexDirection: "column",
						flexWrap: "nowrap",
						justifyContent: "flex-start",
						alignItems: "center",
						gap: "16px",
						minHeight: "600px", // Section a une hauteur minimale de 600px par défaut
						// rowGap et columnGap sont optionnels, utilisent gap par défaut
					},
					tablet: {},
					mobile: {},
					__meta: {
						desktop: {
							widthMode: "auto",
							heightMode: "auto",
						},
						tablet: {
							widthMode: "auto",
							heightMode: "auto",
						},
						mobile: {
							widthMode: "auto",
							heightMode: "auto",
						},
					},
				};
			} else if (type === "Container") {
				// Styles par défaut pour Container
				defaultStyles = {
					desktop: {
						display: "flex",
						flexDirection: "column",
						flexWrap: "nowrap",
						minWidth: "50px", // Container a une largeur minimale de 50px par défaut
						minHeight: "50px", // Container a une hauteur minimale de 50px par défaut
					},
					tablet: {},
					mobile: {},
					__meta: {
						desktop: {
							widthMode: "auto",
							heightMode: "auto",
						},
						tablet: {
							widthMode: "auto",
							heightMode: "auto",
						},
						mobile: {
							widthMode: "auto",
							heightMode: "auto",
						},
					},
				};
			} else if (type === "Flexbox") {
				// Styles par défaut pour Flexbox
				defaultStyles = {
					desktop: {
						display: "flex",
						minWidth: "50px", // Flexbox a une largeur minimale de 50px par défaut
						minHeight: "50px", // Flexbox a une hauteur minimale de 50px par défaut
					},
					tablet: {},
					mobile: {},
					__meta: {
						desktop: {
							widthMode: "auto",
							heightMode: "auto",
						},
						tablet: {
							widthMode: "auto",
							heightMode: "auto",
						},
						mobile: {
							widthMode: "auto",
							heightMode: "auto",
						},
					},
				};
			} else if (type === "Grid") {
				// Styles par défaut pour Grid
				defaultStyles = {
					desktop: {
						display: "grid",
						minWidth: "50px", // Grid a une largeur minimale de 50px par défaut
						minHeight: "50px", // Grid a une hauteur minimale de 50px par défaut
					},
					tablet: {},
					mobile: {},
					__meta: {
						desktop: {
							widthMode: "auto",
							heightMode: "auto",
						},
						tablet: {
							widthMode: "auto",
							heightMode: "auto",
						},
						mobile: {
							widthMode: "auto",
							heightMode: "auto",
						},
					},
				};
			} else {
				// Styles par défaut pour les autres composants
				defaultStyles = {
					desktop: {},
					tablet: {},
					mobile: {},
					__meta: {
						desktop: {
							widthMode: "auto",
							heightMode: "auto",
						},
						tablet: {
							widthMode: "auto",
							heightMode: "auto",
						},
						mobile: {
							widthMode: "auto",
							heightMode: "auto",
						},
					},
				};
			}

			const newNode: Node = {
				id: nodeId,
				type,
				parentId,
				props,
				styles: styles || defaultStyles,
				children: [],
				orderIndex: parentId
					? state.nodes[parentId]?.children.length || 0
					: 0,
			};

			state.nodes[nodeId] = newNode;

			// Si c'est le premier node (Section racine)
			if (!parentId) {
				state.rootNodeId = nodeId;
			} else if (parentId && state.nodes[parentId]) {
				// Ajouter à la liste des enfants du parent
				state.nodes[parentId].children.push(nodeId);
			}

			state.isDirty = true;
			state.selectedNodeId = nodeId; // Sélectionner automatiquement le nouveau node
		},

		// Supprimer un node
		removeNode(state, action: PayloadAction<string>) {
			const nodeId = action.payload;
			const node = state.nodes[nodeId];

			if (!node) return;

			pushHistoryEntry(state);

			// Supprimer récursivement tous les enfants
			const deleteRecursive = (id: string) => {
				const n = state.nodes[id];
				if (!n) return;

				n.children.forEach((childId) => deleteRecursive(childId));
				delete state.nodes[id];
			};

			deleteRecursive(nodeId);

			// Retirer du parent
			if (node.parentId && state.nodes[node.parentId]) {
				state.nodes[node.parentId].children = state.nodes[
					node.parentId
				].children.filter((id) => id !== nodeId);
			}

			// Si c'était la racine
			if (state.rootNodeId === nodeId) {
				state.rootNodeId = null;
			}

			// Désélectionner si c'était le node sélectionné
			if (state.selectedNodeId === nodeId) {
				state.selectedNodeId = null;
			}

			state.isDirty = true;
		},

		// Mettre à jour les props d'un node
		updateNodeProps(
			state,
			action: PayloadAction<{ nodeId: string; props: Record<string, any> }>
		) {
			const { nodeId, props } = action.payload;
			if (state.nodes[nodeId]) {
				pushHistoryEntry(state);
				state.nodes[nodeId].props = {
					...state.nodes[nodeId].props,
					...props,
				};
				state.isDirty = true;
			}
		},

		// Mettre à jour les styles d'un node
		updateNodeStyles(
			state,
			action: PayloadAction<{
				nodeId: string;
				breakpoint: Breakpoint;
				styles: Record<string, string>;
				markAsFixed?: { width?: boolean; height?: boolean };
			}>
		) {
			const { nodeId, breakpoint, styles, markAsFixed } = action.payload;
			if (state.nodes[nodeId]) {
				pushHistoryEntry(state);
				
				// S'assurer que styles[breakpoint] existe avant de le modifier
				if (!state.nodes[nodeId].styles[breakpoint]) {
					state.nodes[nodeId].styles[breakpoint] = {};
				}
				
				// Mettre à jour les styles pour le breakpoint spécifique
				console.log(`[Redux] Sauvegarde styles pour breakpoint ${breakpoint}:`, styles);
				state.nodes[nodeId].styles[breakpoint] = {
					...state.nodes[nodeId].styles[breakpoint],
					...styles,
				};
				console.log(`[Redux] Styles ${breakpoint} après sauvegarde:`, state.nodes[nodeId].styles[breakpoint]);
				console.log(`[Redux] Tous les styles du node:`, state.nodes[nodeId].styles);

				// Initialiser __meta si nécessaire
				if (!state.nodes[nodeId].styles.__meta) {
					state.nodes[nodeId].styles.__meta = {};
				}
				if (!state.nodes[nodeId].styles.__meta[breakpoint]) {
					state.nodes[nodeId].styles.__meta[breakpoint] = {
						widthMode: "auto",
						heightMode: "auto",
					};
				}

				// Marquer les dimensions comme "fixed" si demandé (lors du resize)
				if (markAsFixed) {
					if (markAsFixed.width && styles.width) {
						state.nodes[nodeId].styles.__meta[breakpoint]!.widthMode = "fixed";
					}
					if (markAsFixed.height && styles.height) {
						state.nodes[nodeId].styles.__meta[breakpoint]!.heightMode = "fixed";
					}
				}

				state.isDirty = true;
			}
		},

		// Sélectionner un node
		selectNode(state, action: PayloadAction<string | null>) {
			state.selectedNodeId = action.payload;
		},

		// Hover un node
		hoverNode(state, action: PayloadAction<string | null>) {
			state.hoveredNodeId = action.payload;
		},

		// Réinitialiser l'arbre
		resetTree(state) {
			pushHistoryEntry(state);
			state.nodes = {};
			state.rootNodeId = null;
			state.selectedNodeId = null;
			state.hoveredNodeId = null;
			state.isDirty = false;
		},

		// Charger un arbre complet (depuis localStorage ou DB)
		loadTree(state, action: PayloadAction<{ nodes: Record<string, Node>; rootNodeId: string | null }>) {
			state.nodes = action.payload.nodes;
			state.rootNodeId = action.payload.rootNodeId;
			state.selectedNodeId = null;
			state.hoveredNodeId = null;
			state.isDirty = false;
			state.history = { past: [], future: [] };
		},

		// Dupliquer un node et tous ses enfants récursivement
		duplicateNode(state, action: PayloadAction<string>) {
			const nodeId = action.payload;
			const node = state.nodes[nodeId];
			if (!node) return;

			pushHistoryEntry(state);

			// Mapping des anciens IDs vers les nouveaux IDs
			const idMapping: Record<string, string> = {};

			// Fonction récursive pour dupliquer un node et ses enfants
			const duplicateRecursive = (originalNodeId: string, newParentId: string | null): string => {
				const originalNode = state.nodes[originalNodeId];
				if (!originalNode) return "";

				// Créer un nouvel ID
				const newNodeId = uuidv4();

				// Créer le nouveau node
				const newNode: Node = {
					id: newNodeId,
					type: originalNode.type,
					parentId: newParentId,
					props: { ...originalNode.props },
					styles: {
						desktop: { ...originalNode.styles.desktop },
						tablet: originalNode.styles.tablet ? { ...originalNode.styles.tablet } : undefined,
						mobile: originalNode.styles.mobile ? { ...originalNode.styles.mobile } : undefined,
					},
					children: [],
					orderIndex: newParentId
						? state.nodes[newParentId]?.children.length || 0
						: 0,
				};

				// Ajouter le node au state
				state.nodes[newNodeId] = newNode;

				// Si c'est un root node
				if (!newParentId) {
					state.rootNodeId = newNodeId;
				} else if (state.nodes[newParentId]) {
					// Ajouter à la liste des enfants du parent
					state.nodes[newParentId].children.push(newNodeId);
				}

				// Stocker le mapping
				idMapping[originalNodeId] = newNodeId;

				// Dupliquer récursivement tous les enfants
				originalNode.children.forEach((childId) => {
					duplicateRecursive(childId, newNodeId);
				});

				return newNodeId;
			};

			// Démarrer la duplication
			const newId = duplicateRecursive(nodeId, node.parentId);

			// Sélectionner le nouveau node
			state.selectedNodeId = newId;
			state.isDirty = true;
		},

		undo(state) {
			if (!state.history.past.length) return;
			state.history.future.push(captureSnapshot(state));
			const previousSnapshot = state.history.past.pop();
			if (previousSnapshot) {
				applySnapshot(state, previousSnapshot);
			}
		},

		redo(state) {
			if (!state.history.future.length) return;
			state.history.past.push(captureSnapshot(state));
			const nextSnapshot = state.history.future.pop();
			if (nextSnapshot) {
				applySnapshot(state, nextSnapshot);
			}
		},
	},
});

export const {
	addNode,
	removeNode,
	updateNodeProps,
	updateNodeStyles,
	selectNode,
	hoverNode,
	resetTree,
	loadTree,
	duplicateNode,
	undo,
	redo,
} = pageTreeSlice.actions;

export default pageTreeSlice.reducer;

