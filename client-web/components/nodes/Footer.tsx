"use client";

import { BuilderNode } from "@/types/builder";
import { stylesToTailwind } from "@/lib/stylesToTailwind";

interface NodeComponentProps {
	node: BuilderNode;
	renderChildren: (children: BuilderNode[]) => JSX.Element;
	isEditing: boolean;
}

export default function Footer({
	node,
	renderChildren: _renderChildren,
	isEditing,
}: NodeComponentProps) {
	const baseClassName = stylesToTailwind(node.style);

	const { layout } = node.props || {};

	const layoutClass =
		layout === "3-columns"
			? "grid grid-cols-1 md:grid-cols-3 gap-8"
			: "flex flex-col md:flex-row justify-between gap-4";

	// Couleur de fond par défaut : blanc si non définie
	const backgroundColor = node.style?.backgroundColor || "#ffffff";
	const inlineStyles: React.CSSProperties = {
		backgroundColor: backgroundColor !== "transparent" ? backgroundColor : "#ffffff",
	};

	const className = `${baseClassName} ${layoutClass}`.trim();

	return (
		<footer
			className={`${className} ${
				isEditing ? "outline outline-1 outline-blue-400" : ""
			}`}
			style={inlineStyles}
			data-node-id={node.id}
		>
			<div>
				<p className="font-semibold" style={{ color: "#1A2038" }}>À propos</p>
				<p className="text-sm mt-2" style={{ color: "#1A2038" }}>
					Ceci est un pied de page d&apos;exemple.
				</p>
			</div>
			<div>
				<p className="font-semibold" style={{ color: "#1A2038" }}>Liens</p>
				<ul className="mt-2 space-y-1 text-sm" style={{ color: "#1A2038" }}>
					<li>Mentions légales</li>
					<li>Conditions</li>
					<li>Contact</li>
				</ul>
			</div>
			<div>
				<p className="font-semibold" style={{ color: "#1A2038" }}>Newsletter</p>
				<p className="text-sm mt-2" style={{ color: "#1A2038" }}>Inscrivez-vous pour suivre.</p>
			</div>
		</footer>
	);
}


