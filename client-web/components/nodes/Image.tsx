"use client";

import { BuilderNode } from "@/types/builder";
import { stylesToTailwind } from "@/lib/stylesToTailwind";

interface NodeComponentProps {
	node: BuilderNode;
	renderChildren: (children: BuilderNode[]) => React.ReactElement;
	isEditing: boolean;
}

export default function Image({
	node,
	renderChildren: _renderChildren,
	isEditing,
}: NodeComponentProps) {
	const className = stylesToTailwind(node.style);

	const src = node.props?.src || "/placeholder.jpg";
	const alt = node.props?.alt || "Image";

	// Créer les styles inline pour les propriétés non gérées par Tailwind
	const imageStyles: React.CSSProperties = {};

	// Background color avec opacity
	if (node.style?.backgroundColor) {
		const bgColor = node.style.backgroundColor;
		const opacity = node.style.backgroundColorOpacity 
			? parseFloat(node.style.backgroundColorOpacity) / 100 
			: 1;

		// Convertir la couleur en rgba pour appliquer l'opacité
		if (bgColor.startsWith("#")) {
			const hex = bgColor.replace("#", "");
			const r = parseInt(hex.substring(0, 2), 16);
			const g = parseInt(hex.substring(2, 4), 16);
			const b = parseInt(hex.substring(4, 6), 16);
			imageStyles.backgroundColor = `rgba(${r}, ${g}, ${b}, ${opacity})`;
		} else if (bgColor.startsWith("rgb(")) {
			imageStyles.backgroundColor = bgColor.replace("rgb(", "rgba(").replace(")", `, ${opacity})`);
		} else if (bgColor.startsWith("rgba(")) {
			imageStyles.backgroundColor = bgColor.replace(/rgba\(([^)]+)\)/, (match, content) => {
				const parts = content.split(",").map((s: string) => s.trim());
				if (parts.length >= 4) {
					return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${opacity})`;
				}
				return match;
			});
		} else {
			imageStyles.backgroundColor = bgColor;
			imageStyles.opacity = opacity;
		}
	}

	// Object fit (cover, contain, etc.)
	if (node.style?.objectFit) {
		imageStyles.objectFit = node.style.objectFit as "cover" | "contain" | "fill" | "none" | "scale-down";
	}

	// Blur filter
	if (node.style?.filterBlur) {
		const blurValue = node.style.filterBlur;
		imageStyles.filter = `blur(${blurValue}px)`;
	}

	// Box shadow
	if (node.style?.boxShadowX !== undefined || node.style?.boxShadowY !== undefined) {
		const x = node.style.boxShadowX || "0";
		const y = node.style.boxShadowY || "0";
		const blur = node.style.boxShadowBlur || "0";
		const spread = node.style.boxShadowSpread || "0";
		const color = node.style.boxShadowColor || "#000000";
		const opacity = node.style.boxShadowOpacity 
			? parseFloat(node.style.boxShadowOpacity) / 100 
			: 0.5;

		// Convertir la couleur en rgba si nécessaire
		let shadowColor = color;
		if (color.startsWith("#")) {
			const hex = color.replace("#", "");
			const r = parseInt(hex.substring(0, 2), 16);
			const g = parseInt(hex.substring(2, 4), 16);
			const b = parseInt(hex.substring(4, 6), 16);
			shadowColor = `rgba(${r}, ${g}, ${b}, ${opacity})`;
		} else if (color.startsWith("rgb(")) {
			shadowColor = color.replace("rgb(", "rgba(").replace(")", `, ${opacity})`);
		}

		imageStyles.boxShadow = `${x}px ${y}px ${blur}px ${spread}px ${shadowColor}`;
	}

	// Border
	if (node.style?.borderStyle && node.style.borderStyle !== "none") {
		imageStyles.borderStyle = node.style.borderStyle as "solid" | "dashed" | "dotted" | "double";
		if (node.style?.borderWidth) {
			imageStyles.borderWidth = node.style.borderWidth;
		}
		if (node.style?.borderColor) {
			imageStyles.borderColor = node.style.borderColor;
		}
	}

	// Border radius
	if (node.style?.borderRadius) {
		imageStyles.borderRadius = node.style.borderRadius;
	}

	return (
		<img
			className={`${className} ${
				isEditing ? "outline outline-1 outline-blue-400" : ""
			}`}
			style={Object.keys(imageStyles).length > 0 ? imageStyles : undefined}
			src={src}
			alt={alt}
			data-node-id={node.id}
		/>
	);
}


