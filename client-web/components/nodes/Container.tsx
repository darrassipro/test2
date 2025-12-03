"use client";

import { BuilderNode } from "@/types/builder";
import { stylesToTailwind } from "@/lib/stylesToTailwind";

interface NodeComponentProps {
	node: BuilderNode;
	renderChildren: (children: BuilderNode[]) => React.ReactElement;
	isEditing: boolean;
}

export default function Container({ node, renderChildren, isEditing }: NodeComponentProps) {
	// Créer un style object pour les styles inline (backgroundImage, etc.)
	const containerStyles: React.CSSProperties = {};
	const overlayStyles: React.CSSProperties = {};
	
	const hasBackgroundImage = node.style?.backgroundImage && 
		node.style.backgroundImage.trim() !== "" && 
		node.style.backgroundImage !== "undefined" &&
		node.style.backgroundImage !== "null";
	const hasBackgroundColor = node.style?.backgroundColor;
	const backgroundColorOpacity = node.style?.backgroundColorOpacity 
		? parseFloat(node.style.backgroundColorOpacity) / 100 
		: 1;
	
	// Appliquer backgroundImage et ses propriétés associées en style inline sur le container
	// IMPORTANT: Appliquer backgroundImage AVANT les autres styles pour éviter les conflits
	if (hasBackgroundImage) {
		// Utiliser directement la valeur stockée (elle est déjà au format url(...))
		// React/CSS accepte le format url(data:image/...) sans guillemets
		containerStyles.backgroundImage = node.style.backgroundImage;
		
		// Propriétés de configuration de l'image de fond
		if (node.style?.backgroundSize) {
			containerStyles.backgroundSize = node.style.backgroundSize;
		} else {
			// Valeur par défaut si non définie
			containerStyles.backgroundSize = "cover";
		}
		if (node.style?.backgroundRepeat) {
			containerStyles.backgroundRepeat = node.style.backgroundRepeat;
		} else {
			// Valeur par défaut si non définie
			containerStyles.backgroundRepeat = "no-repeat";
		}
		if (node.style?.backgroundPosition) {
			containerStyles.backgroundPosition = node.style.backgroundPosition;
		} else {
			// Valeur par défaut si non définie
			containerStyles.backgroundPosition = "center";
		}
	}
	
	// Si on a une image ET une couleur, utiliser un overlay pour la couleur avec opacité
	// Sinon, appliquer la couleur directement sur le container
	if (hasBackgroundColor) {
		if (hasBackgroundImage && backgroundColorOpacity < 1) {
			// Overlay avec opacité pour superposer la couleur sur l'image
			const bgColor = node.style.backgroundColor;
			
			// Convertir la couleur en rgba pour appliquer l'opacité
			if (bgColor.startsWith("#")) {
				const hex = bgColor.replace("#", "");
				const r = parseInt(hex.substring(0, 2), 16);
				const g = parseInt(hex.substring(2, 4), 16);
				const b = parseInt(hex.substring(4, 6), 16);
				overlayStyles.backgroundColor = `rgba(${r}, ${g}, ${b}, ${backgroundColorOpacity})`;
			} else if (bgColor.startsWith("rgb(")) {
				// Convertir rgb en rgba
				overlayStyles.backgroundColor = bgColor.replace("rgb(", "rgba(").replace(")", `, ${backgroundColorOpacity})`);
			} else if (bgColor.startsWith("rgba(")) {
				// Remplacer l'opacité existante
				overlayStyles.backgroundColor = bgColor.replace(/rgba\(([^)]+)\)/, (match, content) => {
					const parts = content.split(",").map((s: string) => s.trim());
					if (parts.length >= 4) {
						return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${backgroundColorOpacity})`;
					}
					return match;
				});
			} else {
				// Pour les noms de couleurs CSS, utiliser opacity CSS
				overlayStyles.backgroundColor = bgColor;
				overlayStyles.opacity = backgroundColorOpacity;
			}
		} else if (!hasBackgroundImage) {
			// Pas d'image, appliquer la couleur directement sur le container
			containerStyles.backgroundColor = node.style.backgroundColor;
		} else {
			// Image + couleur avec opacité 100% = couleur opaque sur l'image
			const bgColor = node.style.backgroundColor;
			if (bgColor.startsWith("#")) {
				const hex = bgColor.replace("#", "");
				const r = parseInt(hex.substring(0, 2), 16);
				const g = parseInt(hex.substring(2, 4), 16);
				const b = parseInt(hex.substring(4, 6), 16);
				overlayStyles.backgroundColor = `rgba(${r}, ${g}, ${b}, 1)`;
			} else {
				overlayStyles.backgroundColor = bgColor;
			}
		}
	}

	const className = stylesToTailwind(node.style);
	
	// Appliquer w-full si width est "100%" ou "auto" (mode responsive)
	// Ne pas appliquer w-full si width est en pixels (mode fixed)
	const hasFixedWidth = node.style?.width && 
		node.style.width !== "auto" && 
		node.style.width !== "100%" &&
		node.style.width.includes("px");
	const widthClass = hasFixedWidth ? "" : "w-full";

	// Déterminer si on a besoin d'un overlay (couleur de fond sur une image)
	const needsOverlay = hasBackgroundColor && hasBackgroundImage;

	// Forcer les styles flex en inline pour garantir leur application et éviter les conflits
	// Ces styles inline ont la priorité sur les classes Tailwind
	// IMPORTANT: Toujours appliquer display: flex si flexDirection est défini
	const flexDirection = node.style?.flexDirection || "column";
	const flexWrap = node.style?.flexWrap || "nowrap";
	
	// Toujours appliquer les styles flex en inline avec !important via CSS custom properties
	// Cela garantit qu'ils ont la priorité absolue
	containerStyles.display = "flex";
	containerStyles.flexDirection = flexDirection as "row" | "column" | "row-reverse" | "column-reverse";
	containerStyles.flexWrap = flexWrap as "wrap" | "nowrap" | "wrap-reverse";

	// Appliquer min-width et min-height par défaut pour garantir que le container soit toujours sélectionnable
	// même s'il n'a pas de contenu ou de dimensions définies
	containerStyles.minWidth = node.style?.minWidth || "50px";
	containerStyles.minHeight = node.style?.minHeight || "50px";

	// Props pour maxWidth et centered
	const { maxWidth, centered } = node.props || {};
	const maxWidthClass = maxWidth ? `max-w-${maxWidth}` : "";
	const centeredClass = centered ? "mx-auto" : "";

	return (
		<div
			className={`${className} ${widthClass} ${maxWidthClass} ${centeredClass} ${
				isEditing ? "outline outline-1 outline-blue-400" : ""
			} ${needsOverlay ? "relative" : ""}`.trim()}
			style={containerStyles}
			data-node-id={node.id}
		>
			{/* Overlay pour la couleur de fond avec opacité - se superpose à l'image */}
			{needsOverlay && (
				<div
					className="absolute inset-0 pointer-events-none"
					style={overlayStyles}
				/>
			)}
			
			{/* Contenu avec position relative pour être au-dessus de l'overlay */}
			{/* Note: Les styles flex (flexDirection, flexWrap, etc.) sont appliqués directement sur le container */}
			{/* IMPORTANT: Cette div ne doit PAS avoir de styles flex pour ne pas interférer */}
			<div 
				className={needsOverlay ? "relative z-10" : ""}
				style={{
					// S'assurer que cette div n'a pas de styles flex qui pourraient interférer
					// display: contents permet aux enfants d'hériter directement des styles flex du container
					display: needsOverlay ? "block" : "contents"
				}}
			>
				{node.children && renderChildren(node.children)}
			</div>
		</div>
	);
}


