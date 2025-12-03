"use client";

import React from "react";
import { BuilderNode, NodeType } from "@/types/builder";

import Section from "./nodes/Section";
import Container from "./nodes/Container";
import Flexbox from "./nodes/Flexbox";
import Grid from "./nodes/Grid";
import Heading from "./nodes/Heading";
import Paragraph from "./nodes/Paragraph";
import Image from "./nodes/Image";
import Button from "./nodes/Button";
import Divider from "./nodes/Divider";
import Link from "./nodes/Link";
import Navbar from "./nodes/Navbar";
import Footer from "./nodes/Footer";
import Hero from "./nodes/Hero";
import Gallery from "./nodes/Gallery";
import Form from "./nodes/Form";
import SearchForm from "./nodes/SearchForm";

type Mode = "edit" | "preview";

// Même shape que les props de tous les composants dans components/nodes
interface NodeComponentProps {
	node: BuilderNode;
	renderChildren: (children: BuilderNode[]) => JSX.Element;
	isEditing: boolean;
}

type NodeComponent = React.ComponentType<NodeComponentProps>;

const componentMap: Record<NodeType, NodeComponent> = {
	Section,
	Container,
	Flexbox,
	Grid,
	Heading,
	Paragraph,
	Image,
	Button,
	Divider,
	Link,
	Navbar,
	Footer,
	Hero,
	Gallery,
	Form,
	SearchForm,
};

// Callbacks optionnels pour les interactions (préparés pour plus tard)
export interface RenderNodeCallbacks {
	onSelectNode?: (nodeId: string) => void;
	onAddChild?: (parentId: string, childType: string) => void;
	onDuplicate?: (nodeId: string) => void;
	onDelete?: (nodeId: string) => void;
	onUpdateStyle?: (nodeId: string, style: Record<string, string>) => void;
	onUpdateProps?: (nodeId: string, props: Record<string, any>) => void;
}

interface RenderNodeProps {
	node: BuilderNode;
	mode: Mode;
	callbacks?: RenderNodeCallbacks;
	renderChildren?: (children: BuilderNode[]) => JSX.Element;
}

export function RenderNode({ node, mode, callbacks, renderChildren: customRenderChildren }: RenderNodeProps) {
	const Tag = componentMap[node.type as NodeType];

	// Fallback si le type n'existe pas (sécurité)
	if (!Tag) {
		return (
			<div className="p-4 border border-dashed border-amber-400 text-xs text-amber-700 rounded bg-amber-50">
				Type de composant inconnu : <span className="font-mono">{node.type}</span>
			</div>
		);
	}

	const isEditing = mode === "edit";

	// Utiliser le renderChildren personnalisé si fourni, sinon comportement par défaut
	const renderChildren = customRenderChildren || ((children: BuilderNode[]) => (
		<>
			{children.map((child) => (
				<RenderNode key={child.id} node={child} mode={mode} callbacks={callbacks} />
			))}
		</>
	));

	return <Tag node={node} renderChildren={renderChildren} isEditing={isEditing} />;
}

export default RenderNode;


