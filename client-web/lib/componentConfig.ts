import { ComponentCategory } from "services/slices/pageTreeSlice";

export interface ComponentConfig {
	canHaveChildren: boolean;
	category: ComponentCategory;
	hasSlots?: boolean;
	icon?: string;
	defaultProps?: Record<string, any>;
}

export const COMPONENT_CONFIG: Record<string, ComponentConfig> = {
	// ===== BASICS - Leaf nodes (pas d'enfants) =====
	Heading: {
		canHaveChildren: false,
		category: "basic",
		icon: "📝",
		defaultProps: {
			level: "h2",
			text: "Titre",
		},
	},
	Paragraph: {
		canHaveChildren: false,
		category: "basic",
		icon: "📄",
		defaultProps: {
			text: "Votre texte ici...",
		},
	},
	Image: {
		canHaveChildren: false,
		category: "basic",
		icon: "🖼️",
		defaultProps: {
			src: "/placeholder.jpg",
			alt: "Image",
			width: "100%",
		},
	},
	Button: {
		canHaveChildren: false,
		category: "basic",
		icon: "🔘",
		defaultProps: {
			text: "Cliquez ici",
			variant: "primary",
		},
	},
	Icon: {
		canHaveChildren: false,
		category: "basic",
		icon: "⭐",
		defaultProps: {
			name: "star",
			size: "24",
		},
	},
	Divider: {
		canHaveChildren: false,
		category: "basic",
		icon: "➖",
		defaultProps: {
			thickness: "1px",
			color: "#e5e7eb",
		},
	},
	Link: {
		canHaveChildren: false,
		category: "basic",
		icon: "🔗",
		defaultProps: {
			text: "Lien",
			url: "#",
		},
	},

	// ===== CONTAINERS - Parent nodes (acceptent des enfants) =====
	Section: {
		canHaveChildren: true,
		category: "container",
		icon: "📦",
		defaultProps: {
			width: "full",
			maxWidth: "7xl",
		},
	},
	Container: {
		canHaveChildren: true,
		category: "container",
		icon: "📋",
		defaultProps: {
			maxWidth: "lg",
			centered: true,
		},
	},
	Flexbox: {
		canHaveChildren: true,
		category: "container",
		icon: "↔️",
		defaultProps: {
			direction: "row",
			justify: "start",
			align: "start",
			gap: "4",
		},
	},
	Grid: {
		canHaveChildren: true,
		category: "container",
		icon: "⊞",
		defaultProps: {
			columns: { desktop: 3, tablet: 2, mobile: 1 },
			gap: "4",
		},
	},

	// ===== ADVANCED - Composants complexes avec slots =====
	Navbar: {
		canHaveChildren: false,
		category: "advanced",
		hasSlots: true,
		icon: "🧭",
		defaultProps: {
			logoType: "image", // "image" ou "text"
			logoSrc: "",
			logoAlt: "Logo",
			logoText: "",
			links: [
				{ text: "Accueil", url: "#" },
				{ text: "À propos", url: "#" },
				{ text: "Contact", url: "#" },
			],
		},
	},
	Footer: {
		canHaveChildren: false,
		category: "advanced",
		hasSlots: true,
		icon: "🦶",
		defaultProps: {
			layout: "3-columns",
		},
	},
	Hero: {
		canHaveChildren: false,
		category: "advanced",
		hasSlots: true,
		icon: "🦸",
		defaultProps: {
			layout: "centered",
			height: "screen",
		},
	},
	Gallery: {
		canHaveChildren: false,
		category: "advanced",
		hasSlots: true,
		icon: "🖼️",
		defaultProps: {
			columns: 3,
			gap: "4",
		},
	},
	Form: {
		canHaveChildren: false,
		category: "advanced",
		hasSlots: true,
		icon: "📝",
		defaultProps: {
			method: "post",
		},
	},
	SearchForm: {
		canHaveChildren: false,
		category: "advanced",
		hasSlots: false,
		icon: "🔍",
		defaultProps: {},
	},
};

// Fonction de validation du drop
export function canDropComponent(
	draggedType: string,
	targetNodeType: string | null
): { allowed: boolean; message?: string } {
	const draggedConfig = COMPONENT_CONFIG[draggedType];

	if (!draggedConfig) {
		return { allowed: false, message: "Composant inconnu" };
	}

	// Règle 1 : Canvas vide → Seule "Section" acceptée
	if (!targetNodeType && draggedType !== "Section") {
		return {
			allowed: false,
			message: "❌ Vous devez d'abord ajouter une Section",
		};
	}

	// Règle 2 : Canvas vide → "Section" OK
	if (!targetNodeType && draggedType === "Section") {
		return { allowed: true };
	}

	// Règle 3 : Drop sur un composant
	if (targetNodeType) {
		const targetConfig = COMPONENT_CONFIG[targetNodeType];

		if (!targetConfig) {
			return { allowed: false, message: "Cible inconnue" };
		}

		// Vérifier si la cible peut avoir des enfants
		if (!targetConfig.canHaveChildren) {
			return {
				allowed: false,
				message: `❌ ${targetNodeType} ne peut pas contenir d'autres composants`,
			};
		}

		// OK - Drop dans un container
		return { allowed: true };
	}

	return { allowed: false };
}

