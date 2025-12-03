"use client";

import { BuilderNode } from "@/types/builder";
import { stylesToTailwind } from "@/lib/stylesToTailwind";
import HotelRoomsSection from "@/components/hotel/HotelRoomsSection";
import HotelReviewsSection from "@/components/hotel/HotelReviewsSection";
import HotelGallerySection from "@/components/hotel/HotelGallerySection";
import HotelAboutSection from "@/components/hotel/HotelAboutSection";

interface NodeComponentProps {
	node: BuilderNode;
	renderChildren: (children: BuilderNode[]) => React.ReactNode;
	isEditing: boolean;
}

export default function Section({ node, renderChildren, isEditing }: NodeComponentProps) {
	// Créer un style object pour les styles inline (backgroundImage, etc.)
	const sectionStyles: React.CSSProperties = {};
	const overlayStyles: React.CSSProperties = {};
	
	// Debug: Log complet du node.style pour voir ce qui est reçu
	console.log("[Section] Node reçu:", {
		nodeId: node.id,
		nodeType: node.type,
		nodeStyle: node.style,
		backgroundImage: node.style?.backgroundImage,
		backgroundImageType: typeof node.style?.backgroundImage,
		backgroundImageLength: node.style?.backgroundImage?.length
	});
	
	const hasBackgroundImage = node.style?.backgroundImage && 
		node.style.backgroundImage.trim() !== "" && 
		node.style.backgroundImage !== "undefined" &&
		node.style.backgroundImage !== "null";
	
	const hasBackgroundColor = node.style?.backgroundColor;
	const backgroundColorOpacity = node.style?.backgroundColorOpacity 
		? parseFloat(node.style.backgroundColorOpacity) / 100 
		: 0.5; // 50% par défaut au lieu de 100%
	
	// Valeurs par défaut pour les styles
	const defaultGap = "24px";
	const defaultMinHeight = "600px";
	const defaultPaddingTop = "0px";
	const defaultAlignItems = "center";
	const defaultJustifyContent = "flex-start";
	
	// Appliquer backgroundImage et ses propriétés associées en style inline sur la section
	// IMPORTANT: Appliquer backgroundImage AVANT les autres styles pour éviter les conflits
	if (hasBackgroundImage) {
		// Utiliser directement la valeur stockée (elle est déjà au format url(...))
		// React/CSS accepte le format url(data:image/...) sans guillemets
		sectionStyles.backgroundImage = node.style.backgroundImage;
		
		// Propriétés de configuration de l'image de fond
		if (node.style?.backgroundSize) {
			sectionStyles.backgroundSize = node.style.backgroundSize;
		} else {
			// Valeur par défaut si non définie
			sectionStyles.backgroundSize = "cover";
		}
		if (node.style?.backgroundRepeat) {
			sectionStyles.backgroundRepeat = node.style.backgroundRepeat;
		} else {
			// Valeur par défaut si non définie
			sectionStyles.backgroundRepeat = "no-repeat";
		}
		if (node.style?.backgroundPosition) {
			sectionStyles.backgroundPosition = node.style.backgroundPosition;
		} else {
			// Valeur par défaut si non définie
			sectionStyles.backgroundPosition = "center";
		}
		
		// Debug: Log pour vérifier le format
		console.log("[Section] BackgroundImage appliqué:", {
			original: node.style.backgroundImage,
			hasBackgroundImage,
			nodeId: node.id,
			sectionStylesBackgroundImage: sectionStyles.backgroundImage,
			backgroundSize: sectionStyles.backgroundSize,
			backgroundRepeat: sectionStyles.backgroundRepeat,
			backgroundPosition: sectionStyles.backgroundPosition
		});
	} else {
		console.log("[Section] PAS de backgroundImage:", {
			nodeId: node.id,
			backgroundImageValue: node.style?.backgroundImage,
			hasBackgroundImage
		});
	}
	
	// Si on a une image ET une couleur, utiliser un overlay pour la couleur avec opacité
	// Sinon, appliquer la couleur directement sur la section
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
			// Pas d'image, appliquer la couleur directement sur la section
			sectionStyles.backgroundColor = node.style.backgroundColor;
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
	sectionStyles.display = "flex";
	sectionStyles.flexDirection = flexDirection as "row" | "column" | "row-reverse" | "column-reverse";
	sectionStyles.flexWrap = flexWrap as "wrap" | "nowrap" | "wrap-reverse";
	
	// Appliquer le padding en style inline pour garantir qu'il fonctionne en mode Edit
	// Les styles inline ont la priorité sur les classes Tailwind
	// Appliquer paddingTop par défaut (0px) si non défini
	if (node.style?.paddingTop) {
		sectionStyles.paddingTop = node.style.paddingTop;
	} else {
		// Appliquer la valeur par défaut même si paddingTop n'est pas défini
		sectionStyles.paddingTop = defaultPaddingTop;
	}
	if (node.style?.paddingBottom) {
		sectionStyles.paddingBottom = node.style.paddingBottom;
	}
	if (node.style?.paddingLeft) {
		sectionStyles.paddingLeft = node.style.paddingLeft;
	}
	if (node.style?.paddingRight) {
		sectionStyles.paddingRight = node.style.paddingRight;
	}
	// Si padding général est défini, l'appliquer (mais les valeurs individuelles ont la priorité)
	if (node.style?.padding && !node.style?.paddingTop && !node.style?.paddingBottom && 
		!node.style?.paddingLeft && !node.style?.paddingRight) {
		sectionStyles.padding = node.style.padding;
	}
	
	// Appliquer gap par défaut (24px) en style inline si non défini
	if (node.style?.gap) {
		sectionStyles.gap = node.style.gap;
	} else {
		sectionStyles.gap = defaultGap;
	}
	
	// Appliquer alignItems par défaut (center) en style inline si non défini
	if (node.style?.alignItems) {
		sectionStyles.alignItems = node.style.alignItems as "flex-start" | "flex-end" | "center" | "stretch" | "baseline";
	} else {
		sectionStyles.alignItems = defaultAlignItems as "flex-start" | "flex-end" | "center" | "stretch" | "baseline";
	}
	
	// Appliquer justifyContent par défaut (flex-start) en style inline si non défini
	if (node.style?.justifyContent) {
		sectionStyles.justifyContent = node.style.justifyContent as "flex-start" | "flex-end" | "center" | "space-between" | "space-around" | "space-evenly";
	} else {
		sectionStyles.justifyContent = defaultJustifyContent as "flex-start" | "flex-end" | "center" | "space-between" | "space-around" | "space-evenly";
	}
	
	// Appliquer minHeight par défaut (600px) si non défini
	if (!node.style?.minHeight && !node.style?.height) {
		sectionStyles.minHeight = defaultMinHeight;
	} else if (node.style?.minHeight) {
		sectionStyles.minHeight = node.style.minHeight;
	}
	// Si height est définie, elle sera appliquée via stylesToTailwind
	
	// Debug: Log les styles appliqués
	console.log("[Section] Styles appliqués:", {
		display: sectionStyles.display,
		flexDirection: sectionStyles.flexDirection,
		flexWrap: sectionStyles.flexWrap,
		backgroundImage: sectionStyles.backgroundImage,
		backgroundSize: sectionStyles.backgroundSize,
		nodeStyle: node.style,
		nodeId: node.id,
		allSectionStyles: sectionStyles
	});

	// Debug final: Vérifier les styles qui seront appliqués
	console.log("[Section] Rendu final:", {
		nodeId: node.id,
		sectionStyles,
		className,
		hasBackgroundImage,
		backgroundImageInStyles: sectionStyles.backgroundImage
	});

	// Récupérer l'ID HTML si fourni dans les props
	const htmlId = node.props?.htmlId;
	
	// Détecter si c'est une section hotel spécifique
	const sectionType = node.props?.sectionType;
	
	// Rendre le contenu spécifique selon le type de section hotel
	const renderHotelSectionContent = () => {
		switch (sectionType) {
			case "hotel-rooms":
				return <HotelRoomsSection />;
			case "hotel-reviews":
				return <HotelReviewsSection />;
			case "hotel-gallery":
				return <HotelGallerySection />;
			case "hotel-about":
				return <HotelAboutSection />;
			default:
				return null;
		}
	};
	
	const hotelContent = renderHotelSectionContent();

	return (
		<section
			id={htmlId}
			className={`${className} ${widthClass} ${
				isEditing ? "outline outline-1 outline-blue-400" : ""
			} ${needsOverlay ? "relative" : ""}`.trim()}
			style={sectionStyles}
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
			{/* Note: Les styles flex (flexDirection, flexWrap, etc.) sont appliqués directement sur la section */}
			{/* IMPORTANT: Cette div ne doit PAS avoir de styles flex pour ne pas interférer */}
			<div 
				className={needsOverlay ? "relative z-10" : ""}
				style={{
					// S'assurer que cette div n'a pas de styles flex qui pourraient interférer
					// display: contents permet aux enfants d'hériter directement des styles flex de la section
					display: needsOverlay ? "block" : "contents"
				}}
			>
				{/* Afficher le contenu hotel si c'est une section hotel, sinon afficher les enfants */}
				{hotelContent ? (
					<div className="w-full max-w-7xl mx-auto px-4">
						{hotelContent}
					</div>
				) : (
					node.children && renderChildren(node.children)
				)}
			</div>
		</section>
	);
}
