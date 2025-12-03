"use client";

import { BuilderNode } from "@/types/builder";
import { stylesToTailwind } from "@/lib/stylesToTailwind";

interface NodeComponentProps {
	node: BuilderNode;
	renderChildren: (children: BuilderNode[]) => JSX.Element;
	isEditing: boolean;
}

export default function Paragraph({
	node,
	renderChildren: _renderChildren,
	isEditing,
}: NodeComponentProps) {
	const className = stylesToTailwind(node.style);
	const text = node.props?.text || "Votre texte ici...";

	return (
		<p
			className={`${className} ${
				isEditing ? "outline outline-1 outline-blue-400" : ""
			}`}
			data-node-id={node.id}
		>
			{text}
		</p>
	);
}


