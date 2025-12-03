"use client";

import { BuilderNode } from "@/types/builder";
import { stylesToTailwind } from "@/lib/stylesToTailwind";

interface NodeComponentProps {
	node: BuilderNode;
	renderChildren: (children: BuilderNode[]) => React.ReactElement;
	isEditing: boolean;
}

export default function Flexbox({
	node,
	renderChildren,
	isEditing,
}: NodeComponentProps) {
	const baseClassName = stylesToTailwind(node.style);

	const { direction, justify, align, gap } = node.props || {};

	const directionClass =
		direction === "column"
			? "flex-col"
			: direction === "row-reverse"
			? "flex-row-reverse"
			: direction === "column-reverse"
			? "flex-col-reverse"
			: "flex-row";

	const justifyClass =
		justify === "center"
			? "justify-center"
			: justify === "end"
			? "justify-end"
			: justify === "between"
			? "justify-between"
			: justify === "around"
			? "justify-around"
			: justify === "evenly"
			? "justify-evenly"
			: "justify-start";

	const alignClass =
		align === "center"
			? "items-center"
			: align === "end"
			? "items-end"
			: align === "stretch"
			? "items-stretch"
			: "items-start";

	const gapClass = gap ? `gap-${gap}` : "";

	const className = `${baseClassName} flex ${directionClass} ${justifyClass} ${alignClass} ${gapClass}`.trim();

	// Appliquer min-width et min-height par défaut pour garantir que le flexbox soit toujours sélectionnable
	// même s'il n'a pas de contenu ou de dimensions définies
	const flexboxStyles: React.CSSProperties = {
		minWidth: node.style?.minWidth || "50px",
		minHeight: node.style?.minHeight || "50px",
	};

	return (
		<div
			className={`${className} ${
				isEditing ? "outline outline-1 outline-blue-400" : ""
			}`}
			style={flexboxStyles}
			data-node-id={node.id}
		>
			{node.children && renderChildren(node.children)}
		</div>
	);
}


