"use client";

import { BuilderNode } from "@/types/builder";
import { stylesToTailwind } from "@/lib/stylesToTailwind";

interface NodeComponentProps {
	node: BuilderNode;
	renderChildren: (children: BuilderNode[]) => JSX.Element;
	isEditing: boolean;
}

export default function Hero({
	node,
	renderChildren: _renderChildren,
	isEditing,
}: NodeComponentProps) {
	const baseClassName = stylesToTailwind(node.style);

	const { layout, height } = node.props || {};

	const layoutClass =
		layout === "left"
			? "items-center md:items-start text-left"
			: "items-center text-center";

	const heightClass =
		height === "screen" ? "min-h-screen" : height === "large" ? "min-h-[480px]" : "";

	// Couleur de fond par défaut : blanc si non définie
	const backgroundColor = node.style?.backgroundColor || "#ffffff";
	const inlineStyles: React.CSSProperties = {
		backgroundColor: backgroundColor !== "transparent" ? backgroundColor : "#ffffff",
	};

	const className = `${baseClassName} flex flex-col justify-center ${layoutClass} ${heightClass}`.trim();

	const title = node.props?.title || "Titre de Hero";
	const subtitle = node.props?.subtitle || "Sous-titre ou description.";
	const ctaLabel = node.props?.ctaLabel || "Appel à l'action";

	return (
		<section
			className={`${className} ${
				isEditing ? "outline outline-1 outline-blue-400" : ""
			}`}
			style={inlineStyles}
			data-node-id={node.id}
		>
			<h1 className="text-3xl md:text-5xl font-bold tracking-tight" style={{ color: "#1A2038" }}>{title}</h1>
			<p className="mt-4 text-base md:text-lg" style={{ color: "#1A2038" }}>{subtitle}</p>
			<div className="mt-6 flex flex-wrap items-center gap-3 justify-center md:justify-start">
				<button className="px-5 py-2.5 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition">
					{ctaLabel}
				</button>
			</div>
		</section>
	);
}


