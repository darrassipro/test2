"use client";

import { BuilderNode } from "@/types/builder";
import { stylesToTailwind } from "@/lib/stylesToTailwind";

interface NodeComponentProps {
	node: BuilderNode;
	renderChildren: (children: BuilderNode[]) => JSX.Element;
	isEditing: boolean;
}

export default function Button({
	node,
	renderChildren: _renderChildren,
	isEditing,
}: NodeComponentProps) {
	const baseClassName = stylesToTailwind(node.style);

	const text = node.props?.text || "Cliquez ici";
	const variant = node.props?.variant || "primary";
	const url = node.props?.url;

	const variantClass =
		variant === "secondary"
			? "bg-slate-600 hover:bg-slate-700"
			: "bg-violet-600 hover:bg-violet-700";

	const className = `${baseClassName} inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium text-white transition ${variantClass}`;

	// Gestion du scroll smooth vers les ancres
	const handleClick = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
		if (url && url.startsWith("#")) {
			e.preventDefault();
			const targetId = url.substring(1);
			const targetElement = document.getElementById(targetId);
			if (targetElement) {
				targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
			}
		}
	};

	// Si une URL est fournie, utiliser un lien <a> au lieu d'un bouton
	if (url) {
		return (
			<a
				href={url}
				onClick={handleClick}
				className={`${className} ${
					isEditing ? "outline outline-1 outline-blue-400" : ""
				} cursor-pointer`}
				data-node-id={node.id}
			>
				{text}
			</a>
		);
	}

	return (
		<button
			className={`${className} ${
				isEditing ? "outline outline-1 outline-blue-400" : ""
			}`}
			data-node-id={node.id}
			type="button"
		>
			{text}
		</button>
	);
}


