"use client";

import { BuilderNode } from "@/types/builder";
import { stylesToTailwind } from "@/lib/stylesToTailwind";

interface NodeComponentProps {
	node: BuilderNode;
	renderChildren: (children: BuilderNode[]) => JSX.Element;
	isEditing: boolean;
}

export default function Divider({
	node,
	renderChildren: _renderChildren,
	isEditing,
}: NodeComponentProps) {
	const className = stylesToTailwind(node.style);

	return (
		<hr
			className={`${className} ${
				isEditing ? "outline outline-1 outline-blue-400" : ""
			}`}
			data-node-id={node.id}
		/>
	);
}


