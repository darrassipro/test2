export type NodeType =
	| "Section"
	| "Container"
	| "Flexbox"
	| "Grid"
	| "Heading"
	| "Paragraph"
	| "Image"
	| "Button"
	| "Divider"
	| "Link"
	| "Navbar"
	| "Footer"
	| "Hero"
	| "Gallery"
	| "Form"
	| "SearchForm";

// Style d'un composant (déjà "résolu" pour le rendu, converti ensuite en classes Tailwind)
export interface StyleObject {
	[key: string]: string;
}

// Props génériques d'un composant (texte, src, etc.)
export interface PropsObject {
	[key: string]: any;
}

// Nœud de l'arbre du builder
export interface BuilderNode {
	id: string;
	type: NodeType;
	// Style unique (non responsive à ce niveau, géré en amont si besoin)
	style: StyleObject;
	props: PropsObject;
	children?: BuilderNode[];
}


