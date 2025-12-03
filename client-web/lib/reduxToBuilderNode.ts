import { Node, ResponsiveStyles } from "services/slices/pageTreeSlice";
import { BuilderNode, StyleObject } from "@/types/builder";

/**
 * Convertit un Node Redux (avec children: string[]) en BuilderNode (avec children: BuilderNode[])
 * @param nodeId - ID du node à convertir
 * @param nodesMap - Map de tous les nodes Redux
 * @param activeBreakpoint - Breakpoint actif pour fusionner les styles responsive
 * @returns BuilderNode ou null si le node n'existe pas
 */
export function reduxToBuilderNode(
	nodeId: string,
	nodesMap: Record<string, Node>,
	activeBreakpoint: "desktop" | "tablet" | "mobile" = "desktop"
): BuilderNode | null {
	const node = nodesMap[nodeId];
	if (!node) return null;

	// Fusionner les styles responsive selon le breakpoint actif
	const mergedStyle = mergeResponsiveStyles(node.styles, activeBreakpoint);

	// Convertir les enfants (IDs) en BuilderNode récursivement
	const children: BuilderNode[] = node.children
		.map((childId) => reduxToBuilderNode(childId, nodesMap, activeBreakpoint))
		.filter((child): child is BuilderNode => child !== null);

	const builderNode: BuilderNode = {
		id: node.id,
		type: node.type as any, // Type assertion car Node.type est string
		style: mergedStyle,
		props: node.props || {},
		children: children.length > 0 ? children : undefined,
	};

	// Debug pour backgroundImage
	if (mergedStyle.backgroundImage) {
		console.log("[reduxToBuilderNode] BuilderNode créé avec backgroundImage:", {
			nodeId: node.id,
			nodeType: node.type,
			backgroundImage: mergedStyle.backgroundImage,
			activeBreakpoint
		});
	}

	return builderNode;
}

/**
 * Fusionne les styles responsive en un seul StyleObject selon le breakpoint actif
 * 
 * IMPORTANT: Les propriétés responsive (width, height, justifyContent, alignItems) 
 * sont prises UNIQUEMENT du breakpoint actif, sans héritage.
 * Les autres propriétés (padding, background, etc.) héritent des breakpoints précédents.
 */
function mergeResponsiveStyles(
	styles: ResponsiveStyles,
	activeBreakpoint: "desktop" | "tablet" | "mobile"
): StyleObject {
	const merged: StyleObject = {};

	// Propriétés qui doivent être indépendantes par breakpoint (pas d'héritage)
	const responsiveProperties = ["width", "height", "justifyContent", "alignItems"];

	console.log("[mergeResponsiveStyles] Début fusion pour breakpoint:", activeBreakpoint, {
		desktop: styles.desktop,
		tablet: styles.tablet,
		mobile: styles.mobile
	});

	// Toujours commencer par desktop (base) pour les propriétés non-responsive
	// Utiliser un objet vide si desktop n'existe pas (ne pas muter l'objet original)
	const desktopStyles = styles.desktop || {};
	Object.keys(desktopStyles).forEach((key) => {
		if (!responsiveProperties.includes(key)) {
			merged[key] = desktopStyles[key];
			// Debug pour backgroundImage
			if (key === "backgroundImage") {
				console.log("[mergeResponsiveStyles] backgroundImage depuis desktop:", desktopStyles[key]);
			}
		}
	});

	// Appliquer tablet pour les propriétés non-responsive (écrase desktop)
	if (activeBreakpoint !== "desktop") {
		const tabletStyles = styles.tablet || {};
		Object.keys(tabletStyles).forEach((key) => {
			if (!responsiveProperties.includes(key)) {
				merged[key] = tabletStyles[key];
				if (key === "backgroundImage") {
					console.log("[mergeResponsiveStyles] backgroundImage depuis tablet (écrase desktop):", tabletStyles[key]);
				}
			}
		});
	}

	// Appliquer mobile pour les propriétés non-responsive (écrase tablet et desktop)
	if (activeBreakpoint === "mobile") {
		const mobileStyles = styles.mobile || {};
		Object.keys(mobileStyles).forEach((key) => {
			if (!responsiveProperties.includes(key)) {
				merged[key] = mobileStyles[key];
				if (key === "backgroundImage") {
					console.log("[mergeResponsiveStyles] backgroundImage depuis mobile (écrase tablet/desktop):", mobileStyles[key]);
				}
			}
		});
	}
	
	console.log("[mergeResponsiveStyles] Résultat fusionné:", merged);
	
	// S'assurer que les propriétés flex essentielles ont des valeurs par défaut si elles n'existent pas
	// Cela garantit que flexDirection et flexWrap sont toujours définis pour les Sections
	// IMPORTANT: Appliquer les valeurs par défaut depuis desktop si elles n'existent pas dans le breakpoint actif
	if (!merged.flexDirection) {
		// Chercher dans desktop d'abord, puis utiliser la valeur par défaut
		merged.flexDirection = styles.desktop?.flexDirection || "column";
	}
	if (!merged.flexWrap) {
		// Chercher dans desktop d'abord, puis utiliser la valeur par défaut
		merged.flexWrap = styles.desktop?.flexWrap || "nowrap";
	}
	// S'assurer que display est flex si flexDirection est défini
	if (merged.flexDirection && !merged.display) {
		merged.display = "flex";
	} else if (!merged.display && styles.desktop?.display) {
		merged.display = styles.desktop.display;
	}

	// Pour les propriétés responsive, prendre UNIQUEMENT du breakpoint actif
	// IMPORTANT: Ne pas appliquer de valeurs par défaut si elles n'existent pas
	const activeBreakpointStyles = styles[activeBreakpoint] || {};
	responsiveProperties.forEach((key) => {
		// Ne prendre la valeur QUE si elle existe explicitement dans le breakpoint actif
		if (activeBreakpointStyles[key] !== undefined && activeBreakpointStyles[key] !== null) {
			merged[key] = activeBreakpointStyles[key];
		}
	});

	// Appliquer la logique "auto" vs "fixed" pour width/height
	const meta = styles.__meta?.[activeBreakpoint];
	
	// Pour width: appliquer "100%" seulement si widthMode est explicitement "auto" ET qu'il n'y a pas de width défini
	// IMPORTANT: Si widthMode n'est pas défini, ne pas appliquer width: 100% par défaut
	// Cela permet aux enfants d'une Section flex d'avoir une largeur automatique
	if (meta?.widthMode === "auto") {
		// Si width n'est pas défini ou si c'est une valeur en px avec mode auto, appliquer "100%"
		if (!merged.width || (merged.width.includes("px"))) {
			merged.width = "100%";
		}
	} else if (meta?.widthMode === "fixed") {
		// Mode fixed: garder la valeur telle quelle (déjà dans merged si elle existe)
		// Ne rien faire si width n'existe pas
	}
	// Si widthMode n'est pas défini, ne pas appliquer de width par défaut
	// Cela permet aux enfants d'avoir une largeur automatique (flex-shrink, flex-grow)

	// Pour height: supprimer seulement si mode auto ET qu'il y a une valeur en px
	if (meta?.heightMode === "auto") {
		if (merged.height && merged.height.includes("px")) {
			// Si le mode est auto mais qu'il y a une valeur en px, la supprimer
			delete merged.height;
		}
	}
	// Si heightMode est "fixed", garder la valeur en pixels telle quelle (déjà dans merged si elle existe)

	return merged;
}
