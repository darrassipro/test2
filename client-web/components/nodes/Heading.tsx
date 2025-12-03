"use client";

import { BuilderNode } from "@/types/builder";
import { stylesToTailwind } from "@/lib/stylesToTailwind";
import { useEffect, useRef } from "react";

interface NodeComponentProps {
	node: BuilderNode;
	renderChildren: (children: BuilderNode[]) => React.ReactElement;
	isEditing: boolean;
}

export default function Heading({
	node,
	renderChildren: _renderChildren,
	isEditing,
}: NodeComponentProps) {
	const className = stylesToTailwind(node.style);
	const headingRef = useRef<HTMLElement>(null);

	const level = (node.props?.level || "h2") as keyof JSX.IntrinsicElements;
	const text = node.props?.text || "Titre";
	const link = node.props?.link || "";
	const linkId = node.props?.linkId || "";

	// Créer les styles inline pour les propriétés non gérées par Tailwind
	const headingStyles: React.CSSProperties = {};

	// Typographie
	if (node.style?.fontFamily) {
		headingStyles.fontFamily = node.style.fontFamily;
	}
	if (node.style?.fontSize) {
		headingStyles.fontSize = node.style.fontSize;
	}
	if (node.style?.fontWeight) {
		headingStyles.fontWeight = node.style.fontWeight;
	}
	if (node.style?.fontStyle) {
		headingStyles.fontStyle = node.style.fontStyle as "normal" | "italic" | "oblique";
	}
	if (node.style?.textTransform) {
		headingStyles.textTransform = node.style.textTransform as "none" | "uppercase" | "lowercase" | "capitalize";
	}
	if (node.style?.textDecoration) {
		headingStyles.textDecoration = node.style.textDecoration as "none" | "underline" | "line-through" | "overline";
	}
	if (node.style?.lineHeight) {
		headingStyles.lineHeight = node.style.lineHeight;
	}
	if (node.style?.letterSpacing) {
		headingStyles.letterSpacing = node.style.letterSpacing;
	}

	// Couleurs
	if (node.style?.color) {
		headingStyles.color = node.style.color;
	}

	// Gradient text
	if (node.style?.backgroundImage && node.style.backgroundImage.startsWith("linear-gradient")) {
		headingStyles.backgroundImage = node.style.backgroundImage;
		headingStyles.WebkitBackgroundClip = "text";
		headingStyles.backgroundClip = "text";
		headingStyles.WebkitTextFillColor = "transparent";
		headingStyles.color = "transparent";
	}

	// Récupérer les couleurs hover/active avant de les utiliser
	const hoverColor = node.style?.hoverColor;
	const activeColor = node.style?.activeColor;
	const hasGradient = node.style?.backgroundImage && node.style.backgroundImage.startsWith("linear-gradient");

	// Durées statiques pour les transitions
	const transitionDurationHover = "0.1s"; // 100ms
	const transitionDurationActive = "0.05s"; // 50ms

	// Appliquer la transition de base si hover ou active est défini
	// Si gradient est actif, on doit gérer la transition différemment
	if (hoverColor || activeColor) {
		if (hasGradient) {
			// Pour le gradient, on transitionne backgroundImage au lieu de color
			headingStyles.transitionProperty = "background-image";
			headingStyles.transitionTimingFunction = "ease";
			headingStyles.transitionDuration = transitionDurationHover;
		} else {
			// Pour la couleur normale, on transitionne color
			headingStyles.transitionProperty = "color";
			headingStyles.transitionTimingFunction = "ease";
			headingStyles.transitionDuration = transitionDurationHover;
		}
	}

	// Animation on scroll
	useEffect(() => {
		if (!headingRef.current || !node.style?.animationOnScroll || node.style.animationOnScroll === "none") {
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						const animation = node.style.animationOnScroll;
						const element = entry.target as HTMLElement;

						// Réinitialiser les classes d'animation
						element.classList.remove("animate-fade", "animate-slide-up", "animate-slide-down", "animate-slide-left", "animate-slide-right", "animate-zoom-in", "animate-zoom-out");

						// Ajouter la classe d'animation appropriée
						switch (animation) {
							case "fade":
								element.classList.add("animate-fade");
								break;
							case "slide-up":
								element.classList.add("animate-slide-up");
								break;
							case "slide-down":
								element.classList.add("animate-slide-down");
								break;
							case "slide-left":
								element.classList.add("animate-slide-left");
								break;
							case "slide-right":
								element.classList.add("animate-slide-right");
								break;
							case "zoom-in":
								element.classList.add("animate-zoom-in");
								break;
							case "zoom-out":
								element.classList.add("animate-zoom-out");
								break;
						}
					}
				});
			},
			{ threshold: 0.1 }
		);

		observer.observe(headingRef.current);

		return () => {
			if (headingRef.current) {
				observer.unobserve(headingRef.current);
			}
		};
	}, [node.style?.animationOnScroll]);

	const Tag = level;
	const content = text;

	// Gestion des interactions hover et active
	const headingId = linkId || `heading-${node.id}`;
	// hoverColor et activeColor sont déjà déclarés plus haut
	// Durées statiques : hover = 0.1s, active = 0.05s

	// Injecter les styles CSS pour hover et active dans le head
	useEffect(() => {
		if (!hoverColor && !activeColor) {
			// Nettoyer le style si les couleurs sont supprimées
			const styleId = `heading-interactions-${node.id}`;
			const element = document.getElementById(styleId);
			if (element) {
				element.remove();
			}
			return;
		}

		const styleId = `heading-interactions-${node.id}`;
		let styleElement = document.getElementById(styleId) as HTMLStyleElement;

		if (!styleElement) {
			styleElement = document.createElement("style");
			styleElement.id = styleId;
			document.head.appendChild(styleElement);
		}

		// Construire le CSS avec durées statiques
		let css = "";
		
		// Styles hover (durée fixe : 0.1s)
		if (hoverColor) {
			css += `#${headingId}:hover {`;
			if (hasGradient) {
				// Si gradient est actif, créer un gradient avec la couleur hover
				// On garde le même angle et on remplace les couleurs
				const gradientMatch = node.style?.backgroundImage?.match(/linear-gradient\((\d+)deg/);
				const angle = gradientMatch ? gradientMatch[1] : "45";
				css += `background-image: linear-gradient(${angle}deg, ${hoverColor}, ${hoverColor}) !important;`;
				css += `-webkit-background-clip: text !important;`;
				css += `background-clip: text !important;`;
				css += `-webkit-text-fill-color: transparent !important;`;
			} else {
				// Si pas de gradient, utiliser color normalement
				css += `color: ${hoverColor} !important;`;
			}
			css += `transition-duration: ${transitionDurationHover} !important; transition-timing-function: ease !important;`;
			css += "}\n";
		}

		// Styles active (durée fixe : 0.05s)
		if (activeColor) {
			css += `#${headingId}:active {`;
			if (hasGradient) {
				// Si gradient est actif, créer un gradient avec la couleur active
				const gradientMatch = node.style?.backgroundImage?.match(/linear-gradient\((\d+)deg/);
				const angle = gradientMatch ? gradientMatch[1] : "45";
				css += `background-image: linear-gradient(${angle}deg, ${activeColor}, ${activeColor}) !important;`;
				css += `-webkit-background-clip: text !important;`;
				css += `background-clip: text !important;`;
				css += `-webkit-text-fill-color: transparent !important;`;
			} else {
				// Si pas de gradient, utiliser color normalement
				css += `color: ${activeColor} !important;`;
			}
			css += `transition-duration: ${transitionDurationActive} !important; transition-timing-function: ease !important;`;
			css += "}\n";
		}

		styleElement.textContent = css;

		return () => {
			const element = document.getElementById(styleId);
			if (element) {
				element.remove();
			}
		};
	}, [headingId, hoverColor, activeColor, node.id, transitionDurationHover, transitionDurationActive, hasGradient, node.style?.backgroundImage]);

	// Si un lien est défini, envelopper dans un <a>
	if (link) {
		const href = link.startsWith("#") ? link : link;
		return (
			<Tag
				ref={headingRef}
				id={headingId}
				className={`${className} ${
					isEditing ? "outline outline-1 outline-blue-400" : ""
				}`}
				style={Object.keys(headingStyles).length > 0 ? headingStyles : undefined}
				data-node-id={node.id}
			>
				<a href={href} style={{ color: "inherit", textDecoration: "inherit" }}>
					{content}
				</a>
			</Tag>
		);
	}

	// Si un linkId est défini, créer un ancrage
	if (linkId) {
		return (
			<Tag
				ref={headingRef}
				id={linkId}
				className={`${className} ${
					isEditing ? "outline outline-1 outline-blue-400" : ""
				}`}
				style={Object.keys(headingStyles).length > 0 ? headingStyles : undefined}
				data-node-id={node.id}
			>
				{content}
			</Tag>
		);
	}

	// Cas par défaut
	return (
		<Tag
			ref={headingRef}
			id={headingId}
			className={`${className} ${
				isEditing ? "outline outline-1 outline-blue-400" : ""
			}`}
			style={Object.keys(headingStyles).length > 0 ? headingStyles : undefined}
			data-node-id={node.id}
		>
			{content}
		</Tag>
	);
}


