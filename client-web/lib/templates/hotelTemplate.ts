import { Node, ResponsiveStyles } from "services/slices/pageTreeSlice";
import { v4 as uuidv4 } from "uuid";

/**
 * Configuration du template Hotel
 * Structure JSON pour stockage en base de données
 */
export interface HotelTemplateConfig {
	nodes: Record<string, Node>;
	rootNodeId: string | null;
}

/**
 * Helper pour créer des styles de section par défaut
 */
function createDefaultSectionStyles(): ResponsiveStyles {
	return {
		desktop: {
			paddingTop: "80px",
			paddingBottom: "80px",
			paddingLeft: "24px",
			paddingRight: "24px",
			backgroundColor: "#ffffff",
			backgroundColorOpacity: "100",
			display: "flex",
			flexDirection: "column",
			flexWrap: "nowrap",
			justifyContent: "flex-start",
			alignItems: "center",
			gap: "24px",
		},
		tablet: {
			paddingTop: "60px",
			paddingBottom: "60px",
			paddingLeft: "20px",
			paddingRight: "20px",
		},
		mobile: {
			paddingTop: "40px",
			paddingBottom: "40px",
			paddingLeft: "16px",
			paddingRight: "16px",
		},
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

/**
 * Crée la configuration du template Hotel avec Navbar et toutes les sections
 */
export function createHotelTemplate(): HotelTemplateConfig {
	const rootNodeId = uuidv4();
	const navbarNodeId = uuidv4();
	
	// IDs pour toutes les sections
	const heroSectionId = uuidv4();
	const reservationSectionId = uuidv4();
	const galerieSectionId = uuidv4();
	const chambresSectionId = uuidv4();
	const reviewsSectionId = uuidv4();
	const aproposSectionId = uuidv4();
	const contactSectionId = uuidv4();
	const footerSectionId = uuidv4();
	
	// IDs pour les composants de la section Hero
	const heroContainerId = uuidv4();
	const heroHeadingId = uuidv4();
	const heroParagraphId = uuidv4();
	const heroSearchFormId = uuidv4();
	const heroButtonId = uuidv4();

	// Styles responsive pour la Section racine
	const rootSectionStyles: ResponsiveStyles = {
		desktop: {
			paddingTop: "0px",
			paddingBottom: "0px",
			paddingLeft: "0px",
			paddingRight: "0px",
			backgroundColor: "#ffffff",
			backgroundColorOpacity: "100",
			display: "flex",
			flexDirection: "column",
			flexWrap: "nowrap",
			justifyContent: "flex-start",
			alignItems: "stretch",
			gap: "0px",
		},
		tablet: {
			paddingTop: "0px",
			paddingBottom: "0px",
			paddingLeft: "0px",
			paddingRight: "0px",
		},
		mobile: {
			paddingTop: "0px",
			paddingBottom: "0px",
			paddingLeft: "0px",
			paddingRight: "0px",
		},
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

	// Styles responsive pour le Navbar
	const navbarStyles: ResponsiveStyles = {
		desktop: {
			backgroundColor: "#ffffff",
			backgroundColorOpacity: "100",
			linkColor: "#1A2038", // Couleur des liens en noir pour contraste avec fond blanc
			paddingTop: "16px",
			paddingBottom: "16px",
			paddingLeft: "24px",
			paddingRight: "24px",
			display: "flex",
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
			borderRadius: "0px",
			boxShadow: "none",
		},
		tablet: {
			linkColor: "#1A2038",
			paddingTop: "14px",
			paddingBottom: "14px",
			paddingLeft: "20px",
			paddingRight: "20px",
		},
		mobile: {
			linkColor: "#1A2038",
			paddingTop: "12px",
			paddingBottom: "12px",
			paddingLeft: "16px",
			paddingRight: "16px",
		},
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

	// Section racine
	const rootSection: Node = {
		id: rootNodeId,
		type: "Section",
		parentId: null,
		props: {
			width: "full",
			maxWidth: "full",
		},
		styles: rootSectionStyles,
		children: [
			navbarNodeId,
			heroSectionId,
			reservationSectionId,
			galerieSectionId,
			chambresSectionId,
			reviewsSectionId,
			aproposSectionId,
			contactSectionId,
			footerSectionId,
		],
		orderIndex: 0,
	};

	// Navbar avec les liens spécifiques au template Hotel
	const navbar: Node = {
		id: navbarNodeId,
		type: "Navbar",
		parentId: rootNodeId,
		props: {
			logoType: "text", // ou "image" si on veut utiliser une image
			logoSrc: "",
			logoAlt: "Logo Hotel",
			logoText: "Logoipsum",
			positionType: "sticky", // normal, sticky, ou fixed
			sticky: true, // Rétrocompatibilité
			links: [
				{ text: "Accueil", url: "#accueil" },
				{ text: "Chambres & Suites", url: "#chambres" },
				{ text: "Réservation", url: "#reservation" },
				{ text: "Galerie", url: "#galerie" },
				{ text: "À propos / L'hôtel", url: "#apropos" },
				{ text: "Contact", url: "#contact" },
			],
		},
		styles: navbarStyles,
		children: [],
		orderIndex: 0,
	};

	// ========== SECTION HERO ==========
	const heroSectionStyles: ResponsiveStyles = {
		desktop: {
			paddingTop: "0px",
			paddingBottom: "0px",
			paddingLeft: "0px",
			paddingRight: "0px",
			backgroundColor: "#ffffff",
			backgroundColorOpacity: "100",
			display: "flex",
			flexDirection: "column",
			flexWrap: "nowrap",
			justifyContent: "center",
			alignItems: "center",
			gap: "0px",
			minHeight: "600px",
		},
		tablet: {
			minHeight: "500px",
		},
		mobile: {
			minHeight: "400px",
		},
		__meta: {
			desktop: { widthMode: "auto", heightMode: "auto" },
			tablet: { widthMode: "auto", heightMode: "auto" },
			mobile: { widthMode: "auto", heightMode: "auto" },
		},
	};

	const heroSection: Node = {
		id: heroSectionId,
		type: "Section",
		parentId: rootNodeId,
		props: {
			width: "full",
			maxWidth: "full",
			htmlId: "accueil",
			linkedNavbarLink: "Accueil",
		},
		styles: heroSectionStyles,
		children: [heroContainerId],
		orderIndex: 1,
	};

	// Container Hero avec background image
	const heroContainerStyles: ResponsiveStyles = {
		desktop: {
			paddingTop: "120px",
			paddingBottom: "120px",
			paddingLeft: "24px",
			paddingRight: "24px",
			backgroundColor: "transparent",
			display: "flex",
			flexDirection: "column",
			justifyContent: "center",
			alignItems: "center",
			gap: "32px",
			width: "100%",
		},
		tablet: {
			paddingTop: "100px",
			paddingBottom: "100px",
		},
		mobile: {
			paddingTop: "80px",
			paddingBottom: "80px",
		},
		__meta: {
			desktop: { widthMode: "auto", heightMode: "auto" },
			tablet: { widthMode: "auto", heightMode: "auto" },
			mobile: { widthMode: "auto", heightMode: "auto" },
		},
	};

	const heroContainer: Node = {
		id: heroContainerId,
		type: "Container",
		parentId: heroSectionId,
		props: {
			maxWidth: "7xl",
			centered: true,
		},
		styles: heroContainerStyles,
		children: [heroHeadingId, heroParagraphId, heroSearchFormId, heroButtonId],
		orderIndex: 0,
	};

	// Heading - Slogan
	const heroHeading: Node = {
		id: heroHeadingId,
		type: "Heading",
		parentId: heroContainerId,
		props: {
			level: "h1",
			text: "Bienvenue dans notre hôtel de luxe",
		},
		styles: {
			desktop: {
				color: "#1A2038",
				fontSize: "48px",
				fontWeight: "bold",
				textAlign: "center",
			},
			tablet: {
				fontSize: "36px",
			},
			mobile: {
				fontSize: "28px",
			},
			__meta: {
				desktop: { widthMode: "auto", heightMode: "auto" },
				tablet: { widthMode: "auto", heightMode: "auto" },
				mobile: { widthMode: "auto", heightMode: "auto" },
			},
		},
		children: [],
		orderIndex: 0,
	};

	// Paragraph - Description
	const heroParagraph: Node = {
		id: heroParagraphId,
		type: "Paragraph",
		parentId: heroContainerId,
		props: {
			text: "Découvrez un séjour inoubliable dans un cadre d'exception",
		},
		styles: {
			desktop: {
				color: "#1A2038",
				fontSize: "20px",
				textAlign: "center",
			},
			tablet: {
				fontSize: "18px",
			},
			mobile: {
				fontSize: "16px",
			},
			__meta: {
				desktop: { widthMode: "auto", heightMode: "auto" },
				tablet: { widthMode: "auto", heightMode: "auto" },
				mobile: { widthMode: "auto", heightMode: "auto" },
			},
		},
		children: [],
		orderIndex: 1,
	};

	// SearchForm - Formulaire de recherche de réservation
	const heroSearchForm: Node = {
		id: heroSearchFormId,
		type: "SearchForm",
		parentId: heroContainerId,
		props: {},
		styles: {
			desktop: {
				width: "100%",
				paddingTop: "24px",
				paddingBottom: "24px",
			},
			tablet: {
				paddingTop: "20px",
				paddingBottom: "20px",
			},
			mobile: {
				paddingTop: "16px",
				paddingBottom: "16px",
			},
			__meta: {
				desktop: { widthMode: "auto", heightMode: "auto" },
				tablet: { widthMode: "auto", heightMode: "auto" },
				mobile: { widthMode: "auto", heightMode: "auto" },
			},
		},
		children: [],
		orderIndex: 2,
	};

	// Button - Réserver (scroll vers #reservation)
	const heroButton: Node = {
		id: heroButtonId,
		type: "Button",
		parentId: heroContainerId,
		props: {
			text: "Réserver",
			variant: "primary",
			url: "#reservation",
		},
		styles: {
			desktop: {
				backgroundColor: "#E72858",
				color: "#ffffff",
				paddingTop: "16px",
				paddingBottom: "16px",
				paddingLeft: "32px",
				paddingRight: "32px",
				borderRadius: "8px",
				fontSize: "18px",
				fontWeight: "600",
			},
			tablet: {},
			mobile: {},
			__meta: {
				desktop: { widthMode: "auto", heightMode: "auto" },
				tablet: { widthMode: "auto", heightMode: "auto" },
				mobile: { widthMode: "auto", heightMode: "auto" },
			},
		},
		children: [],
		orderIndex: 3,
	};

	// ========== SECTION RÉSERVATION ==========
	const reservationSection: Node = {
		id: reservationSectionId,
		type: "Section",
		parentId: rootNodeId,
		props: {
			width: "full",
			maxWidth: "7xl",
			htmlId: "reservation", // ID HTML pour le scroll
			linkedNavbarLink: "Réservation",
		},
		styles: createDefaultSectionStyles(),
		children: [],
		orderIndex: 2,
	};

	// Ajouter un Paragraph initialisé
	const reservationParagraphId = uuidv4();
	const reservationParagraph: Node = {
		id: reservationParagraphId,
		type: "Paragraph",
		parentId: reservationSectionId,
		props: {
			text: "section de reservation",
		},
		styles: {
			desktop: { fontSize: "16px", color: "#1A2038" },
			tablet: {},
			mobile: {},
			__meta: {
				desktop: { widthMode: "auto", heightMode: "auto" },
				tablet: { widthMode: "auto", heightMode: "auto" },
				mobile: { widthMode: "auto", heightMode: "auto" },
			},
		},
		children: [],
		orderIndex: 0,
	};
	reservationSection.children = [reservationParagraphId];

	// ========== SECTION GALERIE ==========
	const galerieSection: Node = {
		id: galerieSectionId,
		type: "Section",
		parentId: rootNodeId,
		props: {
			width: "full",
			maxWidth: "7xl",
			sectionType: "hotel-gallery",
			htmlId: "galerie",
			linkedNavbarLink: "Galerie",
		},
		styles: createDefaultSectionStyles(),
		children: [],
		orderIndex: 3,
	};

	const galerieParagraphId = uuidv4();
	const galerieParagraph: Node = {
		id: galerieParagraphId,
		type: "Paragraph",
		parentId: galerieSectionId,
		props: {
			text: "section de galerie",
		},
		styles: {
			desktop: { fontSize: "16px", color: "#1A2038" },
			tablet: {},
			mobile: {},
			__meta: {
				desktop: { widthMode: "auto", heightMode: "auto" },
				tablet: { widthMode: "auto", heightMode: "auto" },
				mobile: { widthMode: "auto", heightMode: "auto" },
			},
		},
		children: [],
		orderIndex: 0,
	};
	galerieSection.children = [galerieParagraphId];

	// ========== SECTION CHAMBRES & SUITES ==========
	const chambresSection: Node = {
		id: chambresSectionId,
		type: "Section",
		parentId: rootNodeId,
		props: {
			width: "full",
			maxWidth: "7xl",
			sectionType: "hotel-rooms",
			htmlId: "chambres",
			linkedNavbarLink: "Chambres & Suites",
		},
		styles: createDefaultSectionStyles(),
		children: [],
		orderIndex: 4,
	};

	const chambresParagraphId = uuidv4();
	const chambresParagraph: Node = {
		id: chambresParagraphId,
		type: "Paragraph",
		parentId: chambresSectionId,
		props: {
			text: "section de chambres & suites",
		},
		styles: {
			desktop: { fontSize: "16px", color: "#1A2038" },
			tablet: {},
			mobile: {},
			__meta: {
				desktop: { widthMode: "auto", heightMode: "auto" },
				tablet: { widthMode: "auto", heightMode: "auto" },
				mobile: { widthMode: "auto", heightMode: "auto" },
			},
		},
		children: [],
		orderIndex: 0,
	};
	chambresSection.children = [chambresParagraphId];

	// ========== SECTION REVIEWS ==========
	const reviewsSection: Node = {
		id: reviewsSectionId,
		type: "Section",
		parentId: rootNodeId,
		props: {
			width: "full",
			maxWidth: "7xl",
			sectionType: "hotel-reviews",
		},
		styles: createDefaultSectionStyles(),
		children: [],
		orderIndex: 5,
	};

	const reviewsParagraphId = uuidv4();
	const reviewsParagraph: Node = {
		id: reviewsParagraphId,
		type: "Paragraph",
		parentId: reviewsSectionId,
		props: {
			text: "section de reviews",
		},
		styles: {
			desktop: { fontSize: "16px", color: "#1A2038" },
			tablet: {},
			mobile: {},
			__meta: {
				desktop: { widthMode: "auto", heightMode: "auto" },
				tablet: { widthMode: "auto", heightMode: "auto" },
				mobile: { widthMode: "auto", heightMode: "auto" },
			},
		},
		children: [],
		orderIndex: 0,
	};
	reviewsSection.children = [reviewsParagraphId];

	// ========== SECTION À PROPOS ==========
	const aproposSection: Node = {
		id: aproposSectionId,
		type: "Section",
		parentId: rootNodeId,
		props: {
			width: "full",
			maxWidth: "7xl",
			sectionType: "hotel-about",
			htmlId: "apropos",
			linkedNavbarLink: "À propos / L'hôtel",
		},
		styles: createDefaultSectionStyles(),
		children: [],
		orderIndex: 6,
	};

	const aproposParagraphId = uuidv4();
	const aproposParagraph: Node = {
		id: aproposParagraphId,
		type: "Paragraph",
		parentId: aproposSectionId,
		props: {
			text: "section de à propos",
		},
		styles: {
			desktop: { fontSize: "16px", color: "#1A2038" },
			tablet: {},
			mobile: {},
			__meta: {
				desktop: { widthMode: "auto", heightMode: "auto" },
				tablet: { widthMode: "auto", heightMode: "auto" },
				mobile: { widthMode: "auto", heightMode: "auto" },
			},
		},
		children: [],
		orderIndex: 0,
	};
	aproposSection.children = [aproposParagraphId];

	// ========== SECTION CONTACT ==========
	const contactSection: Node = {
		id: contactSectionId,
		type: "Section",
		parentId: rootNodeId,
		props: {
			width: "full",
			maxWidth: "7xl",
			htmlId: "contact",
			linkedNavbarLink: "Contact",
		},
		styles: createDefaultSectionStyles(),
		children: [],
		orderIndex: 7,
	};

	const contactParagraphId = uuidv4();
	const contactParagraph: Node = {
		id: contactParagraphId,
		type: "Paragraph",
		parentId: contactSectionId,
		props: {
			text: "section de Contact",
		},
		styles: {
			desktop: { fontSize: "16px", color: "#1A2038" },
			tablet: {},
			mobile: {},
			__meta: {
				desktop: { widthMode: "auto", heightMode: "auto" },
				tablet: { widthMode: "auto", heightMode: "auto" },
				mobile: { widthMode: "auto", heightMode: "auto" },
			},
		},
		children: [],
		orderIndex: 0,
	};
	contactSection.children = [contactParagraphId];

	// ========== SECTION FOOTER ==========
	const footerSectionStyles: ResponsiveStyles = {
		desktop: {
			paddingTop: "60px",
			paddingBottom: "60px",
			paddingLeft: "24px",
			paddingRight: "24px",
			backgroundColor: "#1A2038",
			backgroundColorOpacity: "100",
			display: "flex",
			flexDirection: "column",
			flexWrap: "nowrap",
			justifyContent: "flex-start",
			alignItems: "center",
			gap: "24px",
		},
		tablet: {
			paddingTop: "50px",
			paddingBottom: "50px",
		},
		mobile: {
			paddingTop: "40px",
			paddingBottom: "40px",
		},
		__meta: {
			desktop: { widthMode: "auto", heightMode: "auto" },
			tablet: { widthMode: "auto", heightMode: "auto" },
			mobile: { widthMode: "auto", heightMode: "auto" },
		},
	};

	const footerSection: Node = {
		id: footerSectionId,
		type: "Section",
		parentId: rootNodeId,
		props: {
			width: "full",
			maxWidth: "full",
		},
		styles: footerSectionStyles,
		children: [],
		orderIndex: 8,
	};

	const footerParagraphId = uuidv4();
	const footerParagraph: Node = {
		id: footerParagraphId,
		type: "Paragraph",
		parentId: footerSectionId,
		props: {
			text: "section de footer",
		},
		styles: {
			desktop: { fontSize: "16px", color: "#ffffff" },
			tablet: {},
			mobile: {},
			__meta: {
				desktop: { widthMode: "auto", heightMode: "auto" },
				tablet: { widthMode: "auto", heightMode: "auto" },
				mobile: { widthMode: "auto", heightMode: "auto" },
			},
		},
		children: [],
		orderIndex: 0,
	};
	footerSection.children = [footerParagraphId];

	return {
		nodes: {
			[rootNodeId]: rootSection,
			[navbarNodeId]: navbar,
			// Hero section
			[heroSectionId]: heroSection,
			[heroContainerId]: heroContainer,
			[heroHeadingId]: heroHeading,
			[heroParagraphId]: heroParagraph,
			[heroSearchFormId]: heroSearchForm,
			[heroButtonId]: heroButton,
			// Autres sections
			[reservationSectionId]: reservationSection,
			[reservationParagraphId]: reservationParagraph,
			[galerieSectionId]: galerieSection,
			[galerieParagraphId]: galerieParagraph,
			[chambresSectionId]: chambresSection,
			[chambresParagraphId]: chambresParagraph,
			[reviewsSectionId]: reviewsSection,
			[reviewsParagraphId]: reviewsParagraph,
			[aproposSectionId]: aproposSection,
			[aproposParagraphId]: aproposParagraph,
			[contactSectionId]: contactSection,
			[contactParagraphId]: contactParagraph,
			[footerSectionId]: footerSection,
			[footerParagraphId]: footerParagraph,
		},
		rootNodeId,
	};
}

/**
 * Convertit la configuration du template en format compatible avec Redux loadTree
 */
export function hotelTemplateToRedux(): { nodes: Record<string, Node>; rootNodeId: string | null } {
	const template = createHotelTemplate();
	return {
		nodes: template.nodes,
		rootNodeId: template.rootNodeId,
	};
}

