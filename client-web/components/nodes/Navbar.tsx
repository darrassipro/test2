"use client";

import { useState, useEffect } from "react";
import { BuilderNode } from "@/types/builder";
import { stylesToTailwind } from "@/lib/stylesToTailwind";
import { useAppSelector } from "@/lib/hooks";

interface NodeComponentProps {
	node: BuilderNode;
	renderChildren: (children: BuilderNode[]) => React.ReactNode;
	isEditing: boolean;
}

export default function Navbar({
	node,
	renderChildren: _renderChildren,
	isEditing,
}: NodeComponentProps) {
	const baseClassName = stylesToTailwind(node.style);
	
	// En mode preview, détecter la taille réelle de l'écran pour le responsive
	// En mode édition, utiliser le viewport sélectionné dans l'éditeur
	const viewport = useAppSelector((state) => state.editor.activeBreakpoint);
	const [windowWidth, setWindowWidth] = useState<number | null>(null);
	
	useEffect(() => {
		if (isEditing) return; // En mode édition, utiliser le viewport Redux
		
		// Fonction pour mettre à jour la largeur de l'écran
		const updateWindowWidth = () => {
			if (typeof window !== 'undefined') {
				setWindowWidth(window.innerWidth);
			}
		};
		
		// Initialiser
		updateWindowWidth();
		
		// Écouter les changements de taille
		window.addEventListener('resize', updateWindowWidth);
		
		return () => {
			window.removeEventListener('resize', updateWindowWidth);
		};
	}, [isEditing]);
	
	// Déterminer si c'est mobile/tablet : en mode preview, utiliser la taille réelle
	// En mode édition, utiliser le viewport Redux
	let isMobile: boolean;
	let isTablet: boolean;
	
	if (!isEditing && windowWidth !== null) {
		// En mode preview, utiliser la taille réelle de l'écran
		isMobile = windowWidth < 768;
		isTablet = windowWidth >= 768 && windowWidth < 1024;
	} else {
		// En mode édition, utiliser le viewport Redux
		isMobile = viewport === "mobile";
		isTablet = viewport === "tablet";
	}
	
	const isMobileOrTablet = isMobile || isTablet; // Menu responsive pour mobile ET tablet
	
	// État pour gérer l'ouverture/fermeture du menu mobile/tablet
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	// Récupérer les props avec valeurs par défaut
	const props = node.props || {};
	const links = Array.isArray(props.links) && props.links.length > 0
		? props.links
		: [
			{ text: "Accueil", url: "#" },
			{ text: "À propos", url: "#" },
			{ text: "Contact", url: "#" },
		];
	const logoType = props.logoType || "image";
	const logoSrc = props.logoSrc || "";
	const logoAlt = props.logoAlt || "Logo";
	const logoText = props.logoText || "";

	// Gérer le positionnement : normal, sticky, ou fixed
	const positionType = props.positionType || (props.sticky ? "sticky" : "normal"); // Rétrocompatibilité avec sticky
	let positionClass = "";
	if (positionType === "sticky") {
		positionClass = "sticky top-0 z-40";
	} else if (positionType === "fixed") {
		// En mode édition, utiliser absolute pour être relatif au Canvas
		// En mode preview, utiliser fixed pour être relatif au viewport
		if (isEditing) {
			positionClass = "absolute top-0 left-0 right-0 z-40";
		} else {
			positionClass = "fixed top-0 left-0 right-0 z-40";
		}
	}

	// Récupérer les styles depuis node.style (convertis depuis Redux)
	const backgroundColor = node.style?.backgroundColor || "#ffffff";
	const linkColor = node.style?.linkColor || "#1A2038";
	const borderRadius = node.style?.borderRadius || "0px";
	const boxShadow = node.style?.boxShadow || "none";

	// Styles inline pour les propriétés non-Tailwind
	const inlineStyles: React.CSSProperties = {
		backgroundColor,
		borderRadius,
		boxShadow: boxShadow !== "none" ? boxShadow : undefined,
	};

	const className = `${baseClassName} ${positionClass} w-full flex items-center px-6 py-4 border-b border-slate-200`.trim();

	// Toggle du menu mobile
	const toggleMenu = () => {
		setIsMenuOpen(!isMenuOpen);
	};

	// Gestion du scroll smooth vers les ancres
	const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
		if (url && url.startsWith("#")) {
			e.preventDefault();
			const targetId = url.substring(1);
			const targetElement = document.getElementById(targetId);
			if (targetElement) {
				targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
			}
		}
		// Fermer le menu mobile après le clic
		if (isMobileOrTablet) {
			setIsMenuOpen(false);
		}
	};

		return (
		<nav
			className={`${className} ${
				isEditing ? "outline outline-1 outline-blue-400" : ""
			} ${isMobileOrTablet ? "relative" : ""}`}
			style={inlineStyles}
			data-node-id={node.id}
		>
			{/* Logo à gauche */}
			<div className={`flex-shrink-0 ${isMobileOrTablet ? "flex-1" : ""}`} style={!isMobileOrTablet ? { width: "30%" } : undefined}>
				{logoType === "image" && logoSrc ? (
					<img
						src={logoSrc}
						alt={logoAlt}
						className="h-10 w-auto object-contain"
					/>
				) : (
					<span
						className="text-xl font-bold"
						style={{
							color: backgroundColor && backgroundColor.toLowerCase() === "#ffffff"
								? "#111827" // noir pour fond blanc
								: "#ffffff" // blanc pour fond sombre ou autre
						}}
					>
						{logoText || "Logo"}
					</span>
				)}
			</div>
			
			{/* Version Desktop : liens horizontaux */}
			{!isMobileOrTablet && (
				<div className="flex justify-end items-center gap-6" style={{ width: "70%" }}>
					{links.map((link: { text: string; url: string }, index: number) => (
						<a
							key={index}
							href={link.url || "#"}
							onClick={(e) => handleLinkClick(e, link.url || "#")}
							className="font-medium transition-colors hover:text-violet-600 cursor-pointer"
							style={{ color: linkColor }}
						>
							{link.text || `Lien ${index + 1}`}
						</a>
					))}
				</div>
			)}

			{/* Version Mobile/Tablet : icône de menu à droite */}
			{isMobileOrTablet && (
				<>
					<button
						onClick={toggleMenu}
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
										onClick={(e) => handleLinkClick(e, link.url || "#")}
										className="font-medium transition-colors hover:bg-slate-50 px-6 py-3 cursor-pointer"
										style={{ color: linkColor }}
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


