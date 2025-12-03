"use client";

import { BuilderNode } from "@/types/builder";
import { stylesToTailwind } from "@/lib/stylesToTailwind";

interface NodeComponentProps {
	node: BuilderNode;
	renderChildren: (children: BuilderNode[]) => React.ReactElement;
	isEditing: boolean;
}

export default function Grid({ node, renderChildren, isEditing }: NodeComponentProps) {
	const baseClassName = stylesToTailwind(node.style);

	const { columns, gap } = node.props || {};

	const desktopCols = columns?.desktop || columns || 1;
	const tabletCols = columns?.tablet;
	const mobileCols = columns?.mobile;

	const gridColsDesktop = `grid-cols-${desktopCols}`;
	const gridColsTablet = tabletCols ? `md:grid-cols-${tabletCols}` : "";
	const gridColsMobile = mobileCols ? `sm:grid-cols-${mobileCols}` : "";

	const gapClass = gap ? `gap-${gap}` : "";

	const className = `${baseClassName} grid ${gridColsDesktop} ${gridColsTablet} ${gridColsMobile} ${gapClass}`.trim();

	// Appliquer min-width et min-height par défaut pour garantir que le grid soit toujours sélectionnable
	// même s'il n'a pas de contenu ou de dimensions définies
	const gridStyles: React.CSSProperties = {
		minWidth: node.style?.minWidth || "50px",
		minHeight: node.style?.minHeight || "50px",
	};

	return (
		<div
			className={`${className} ${
				isEditing ? "outline outline-1 outline-blue-400" : ""
			}`}
			style={gridStyles}
			data-node-id={node.id}
		>
			{node.children && renderChildren(node.children)}
		</div>
	);
}


