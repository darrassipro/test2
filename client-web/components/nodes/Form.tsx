"use client";

import { BuilderNode } from "@/types/builder";
import { stylesToTailwind } from "@/lib/stylesToTailwind";

interface NodeComponentProps {
	node: BuilderNode;
	renderChildren: (children: BuilderNode[]) => JSX.Element;
	isEditing: boolean;
}

export default function Form({
	node,
	renderChildren: _renderChildren,
	isEditing,
}: NodeComponentProps) {
	const baseClassName = stylesToTailwind(node.style);

	const method = (node.props?.method || "post") as "get" | "post";
	const action = node.props?.action || "#";

	const className = `${baseClassName} space-y-4`.trim();

	return (
		<form
			method={method}
			action={action}
			className={`${className} ${
				isEditing ? "outline outline-1 outline-blue-400" : ""
			}`}
			data-node-id={node.id}
			onSubmit={(e) => {
				// En mode builder, on évite le vrai submit
				e.preventDefault();
			}}
		>
			<div className="grid gap-4 md:grid-cols-2">
				<div className="flex flex-col gap-1">
					<label className="text-sm font-medium text-slate-700">Nom</label>
					<input
						type="text"
						className="px-3 py-2 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
						placeholder="Votre nom"
					/>
				</div>
				<div className="flex flex-col gap-1">
					<label className="text-sm font-medium text-slate-700">Email</label>
					<input
						type="email"
						className="px-3 py-2 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
						placeholder="vous@exemple.com"
					/>
				</div>
			</div>
			<div className="flex flex-col gap-1">
				<label className="text-sm font-medium text-slate-700">Message</label>
				<textarea
					className="px-3 py-2 rounded-md border border-slate-300 text-sm min-h-[120px] resize-y focus:outline-none focus:ring-2 focus:ring-violet-500"
					placeholder="Votre message..."
				/>
			</div>
			<button
				type="submit"
				className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition"
			>
				Envoyer
			</button>
		</form>
	);
}


