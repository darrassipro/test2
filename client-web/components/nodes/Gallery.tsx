"use client";

import { BuilderNode } from "@/types/builder";
import { stylesToTailwind } from "@/lib/stylesToTailwind";

interface NodeComponentProps {
	node: BuilderNode;
	renderChildren: (children: BuilderNode[]) => JSX.Element;
	isEditing: boolean;
}

export default function Gallery({
	node,
	renderChildren: _renderChildren,
	isEditing,
}: NodeComponentProps) {
	const baseClassName = stylesToTailwind(node.style);

	const { columns, gap } = node.props || {};

	const cols = columns || 3;
	const gapClass = gap ? `gap-${gap}` : "gap-4";

	const className = `${baseClassName} grid grid-cols-2 md:grid-cols-${cols} ${gapClass}`.trim();

	return (
		<div
			className={`${className} ${
				isEditing ? "outline outline-1 outline-blue-400" : ""
			}`}
			data-node-id={node.id}
		>
			{Array.from({ length: cols * 2 }).map((_, index) => (
				<div
					key={index}
					className="aspect-video rounded-lg bg-slate-200/70 border border-slate-200"
				/>
			))}
		</div>
	);
}


