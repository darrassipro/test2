"use client";

import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { updateNodeStyles, updateNodeProps } from "services/slices/pageTreeSlice";

export function HeadingEditor() {
	const dispatch = useAppDispatch();
	const selectedNodeId = useAppSelector((state) => state.pageTree.selectedNodeId);
	const selectedNode = useAppSelector((state) =>
		selectedNodeId ? state.pageTree.nodes[selectedNodeId] : null
	);
	// Utiliser le breakpoint du canvas au lieu d'un state local
	const viewport = useAppSelector((state) => state.editor.activeBreakpoint);
	const activeBreakpoint: "desktop" | "tablet" | "mobile" =
		viewport === "base" ? "desktop" : viewport === "tablet" ? "tablet" : "mobile";

	if (!selectedNode || selectedNode.type !== "Heading") {
		return (
			<div className="p-6 bg-slate-50 rounded-lg border border-slate-200 text-center">
				<svg
					className="w-12 h-12 text-slate-300 mx-auto mb-3"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M4 6h16M4 12h16M4 18h7"
					/>
				</svg>
				<p className="text-xs text-slate-500">
					Sélectionnez un Heading pour modifier ses propriétés
				</p>
			</div>
		);
	}

	const currentStyles = selectedNode.styles[activeBreakpoint] || {};

	const handleStyleChange = (property: string, value: string) => {
		console.log(`[HeadingEditor] Sauvegarde ${property} = ${value} pour breakpoint: ${activeBreakpoint}`, {
			nodeId: selectedNodeId,
			currentStyles: currentStyles
		});
		dispatch(
			updateNodeStyles({
				nodeId: selectedNodeId!,
				breakpoint: activeBreakpoint,
				styles: { [property]: value },
			})
		);
	};

	const handlePropChange = (property: string, value: any) => {
		dispatch(
			updateNodeProps({
				nodeId: selectedNodeId!,
				props: { [property]: value },
			})
		);
	};

	const currentText = selectedNode.props?.text || "Titre";
	const currentLevel = selectedNode.props?.level || "h2";
	const currentLink = selectedNode.props?.link || "";
	const currentLinkId = selectedNode.props?.linkId || "";

	return (
		<div className="space-y-6">
			{/* TEXTE */}
			<div className="space-y-3">
				<h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-2">
					TEXTE
				</h3>
				<div>
					<label className="text-xs text-slate-600 mb-1 block">
						Texte
					</label>
					<input
						type="text"
						value={currentText}
						onChange={(e) => handlePropChange("text", e.target.value)}
						className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
						placeholder="Votre titre"
					/>
				</div>

				<div>
					<label className="text-xs text-slate-600 mb-1 block">
						Niveau (h1-h6)
					</label>
					<select
						value={currentLevel}
						onChange={(e) => handlePropChange("level", e.target.value)}
						className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
					>
						<option value="h1">H1</option>
						<option value="h2">H2</option>
						<option value="h3">H3</option>
						<option value="h4">H4</option>
						<option value="h5">H5</option>
						<option value="h6">H6</option>
					</select>
				</div>
			</div>

			{/* Typographie */}
			<div className="space-y-3 pt-3 border-t border-slate-300">
				<h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-2">
					TYPOGRAPHIE
				</h3>

				{/* Famille de police */}
				<div>
					<label className="text-xs text-slate-600 mb-1 block">
						Famille de police
					</label>
					<select
						value={currentStyles.fontFamily || "inherit"}
						onChange={(e) => handleStyleChange("fontFamily", e.target.value)}
						className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
					>
						<option value="inherit">Héritée</option>
						<option value="Arial, sans-serif">Arial</option>
						<option value="'Helvetica Neue', Helvetica, sans-serif">Helvetica</option>
						<option value="'Times New Roman', Times, serif">Times New Roman</option>
						<option value="Georgia, serif">Georgia</option>
						<option value="'Courier New', Courier, monospace">Courier New</option>
						<option value="Verdana, sans-serif">Verdana</option>
						<option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
						<option value="Impact, sans-serif">Impact</option>
						<option value="'Comic Sans MS', cursive">Comic Sans MS</option>
					</select>
				</div>

				{/* Taille de police */}
				<div>
					<label className="text-xs text-slate-600 mb-1 block">
						Taille de police
					</label>
					<div className="flex gap-2">
						<input
							type="number"
							value={currentStyles.fontSize ? currentStyles.fontSize.replace(/px|rem|em/, "") : "16"}
							onChange={(e) => {
								const unit = currentStyles.fontSize?.match(/(px|rem|em)/)?.[0] || "px";
								handleStyleChange("fontSize", e.target.value + unit);
							}}
							className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
							placeholder="16"
						/>
						<select
							value={currentStyles.fontSize?.match(/(px|rem|em)/)?.[0] || "px"}
							onChange={(e) => {
								const value = currentStyles.fontSize?.replace(/(px|rem|em)/, "") || "16";
								handleStyleChange("fontSize", value + e.target.value);
							}}
							className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
						>
							<option value="px">px</option>
							<option value="rem">rem</option>
							<option value="em">em</option>
						</select>
					</div>
				</div>

				{/* Poids de police */}
				<div>
					<label className="text-xs text-slate-600 mb-1 block">
						Poids (Weight)
					</label>
					<select
						value={currentStyles.fontWeight || "normal"}
						onChange={(e) => handleStyleChange("fontWeight", e.target.value)}
						className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
					>
						<option value="normal">Normal (400)</option>
						<option value="100">Thin (100)</option>
						<option value="200">Extra Light (200)</option>
						<option value="300">Light (300)</option>
						<option value="400">Regular (400)</option>
						<option value="500">Medium (500)</option>
						<option value="600">Semi Bold (600)</option>
						<option value="700">Bold (700)</option>
						<option value="800">Extra Bold (800)</option>
						<option value="900">Black (900)</option>
					</select>
				</div>

				{/* Style (normal, italic) */}
				<div>
					<label className="text-xs text-slate-600 mb-1 block">
						Style
					</label>
					<select
						value={currentStyles.fontStyle || "normal"}
						onChange={(e) => handleStyleChange("fontStyle", e.target.value)}
						className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
					>
						<option value="normal">Normal</option>
						<option value="italic">Italique</option>
						<option value="oblique">Oblique</option>
					</select>
				</div>

				{/* Transformation du texte */}
				<div>
					<label className="text-xs text-slate-600 mb-1 block">
						Transformation
					</label>
					<select
						value={currentStyles.textTransform || "none"}
						onChange={(e) => handleStyleChange("textTransform", e.target.value)}
						className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
					>
						<option value="none">Aucune</option>
						<option value="uppercase">Uppercase (MAJUSCULES)</option>
						<option value="lowercase">Lowercase (minuscules)</option>
						<option value="capitalize">Capitalize (Première Lettre)</option>
					</select>
				</div>

				{/* Décoration */}
				<div>
					<label className="text-xs text-slate-600 mb-1 block">
						Décoration
					</label>
					<select
						value={currentStyles.textDecoration || "none"}
						onChange={(e) => handleStyleChange("textDecoration", e.target.value)}
						className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
					>
						<option value="none">Aucune</option>
						<option value="underline">Underline (souligné)</option>
						<option value="line-through">Line-through (barré)</option>
						<option value="overline">Overline (ligne au-dessus)</option>
					</select>
				</div>

				{/* Hauteur de ligne */}
				<div>
					<label className="text-xs text-slate-600 mb-1 block">
						Hauteur de ligne ({currentStyles.lineHeight || "1.5"})
					</label>
					<input
						type="range"
						min="0.5"
						max="3"
						step="0.1"
						value={currentStyles.lineHeight || "1.5"}
						onChange={(e) => handleStyleChange("lineHeight", e.target.value)}
						className="w-full"
					/>
					<div className="flex justify-between text-xs text-slate-500 mt-1">
						<span>0.5</span>
						<span>3.0</span>
					</div>
				</div>

				{/* Espacement des lettres */}
				<div>
					<label className="text-xs text-slate-600 mb-1 block">
						Espacement des lettres ({currentStyles.letterSpacing ? currentStyles.letterSpacing.replace("px", "") : "0"}px)
					</label>
					<input
						type="range"
						min="-5"
						max="10"
						step="0.5"
						value={currentStyles.letterSpacing ? currentStyles.letterSpacing.replace("px", "") : "0"}
						onChange={(e) => handleStyleChange("letterSpacing", e.target.value + "px")}
						className="w-full"
					/>
					<div className="flex justify-between text-xs text-slate-500 mt-1">
						<span>-5px</span>
						<span>10px</span>
					</div>
				</div>
			</div>

			{/* Couleurs de texte */}
			<div className="space-y-3 pt-3 border-t border-slate-300">
				<h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-2">
					COULEURS DE TEXTE
				</h3>

				{/* Couleur du texte */}
				<div>
					<label className="text-xs text-slate-600 mb-1 block">
						Couleur du texte
					</label>
					<div className="flex gap-2">
						<input
							type="color"
							value={currentStyles.color || "#000000"}
							onChange={(e) => {
								handleStyleChange("color", e.target.value);
								// Désactiver le gradient si on choisit une couleur unie
								if (currentStyles.gradientColor1 || currentStyles.gradientColor2) {
									handleStyleChange("gradientColor1", "");
									handleStyleChange("gradientColor2", "");
									handleStyleChange("backgroundImage", "");
								}
							}}
							className="w-12 h-10 border border-slate-300 rounded cursor-pointer"
						/>
						<input
							type="text"
							value={currentStyles.color || "#000000"}
							onChange={(e) => {
								handleStyleChange("color", e.target.value);
								// Désactiver le gradient si on choisit une couleur unie
								if (currentStyles.gradientColor1 || currentStyles.gradientColor2) {
									handleStyleChange("gradientColor1", "");
									handleStyleChange("gradientColor2", "");
									handleStyleChange("backgroundImage", "");
								}
							}}
							className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
							placeholder="#000000"
						/>
					</div>
				</div>
			</div>

			{/* Gradient */}
			<div className="space-y-3 pt-3 border-t border-slate-300">
				<h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-2">
					GRADIENT
				</h3>

				{/* Gradient text */}
				<div>
					<label className="text-xs text-slate-600 mb-1 block">
						Gradient text (optionnel)
					</label>
					
					{/* Deux palettes de couleur pour le gradient */}
					<div className="space-y-2">
						<div>
							<label className="text-xs text-slate-500 mb-1 block">
								Couleur de début
							</label>
							<div className="flex gap-2">
								<input
									type="color"
									value={currentStyles.gradientColor1 || "#ff0000"}
									onChange={(e) => {
										const color1 = e.target.value;
										handleStyleChange("gradientColor1", color1);
										const color2 = currentStyles.gradientColor2 || "#0000ff";
										const angle = currentStyles.gradientAngle || "45";
										handleStyleChange("backgroundImage", `linear-gradient(${angle}deg, ${color1}, ${color2})`);
										// Désactiver la couleur unie si on utilise un gradient
										if (currentStyles.color) {
											handleStyleChange("color", "");
										}
									}}
									className="w-12 h-10 border border-slate-300 rounded cursor-pointer"
								/>
								<input
									type="text"
									value={currentStyles.gradientColor1 || "#ff0000"}
									onChange={(e) => {
										const color1 = e.target.value;
										handleStyleChange("gradientColor1", color1);
										const color2 = currentStyles.gradientColor2 || "#0000ff";
										const angle = currentStyles.gradientAngle || "45";
										handleStyleChange("backgroundImage", `linear-gradient(${angle}deg, ${color1}, ${color2})`);
										// Désactiver la couleur unie si on utilise un gradient
										if (currentStyles.color) {
											handleStyleChange("color", "");
										}
									}}
									className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
									placeholder="#ff0000"
								/>
							</div>
						</div>

						<div>
							<label className="text-xs text-slate-500 mb-1 block">
								Couleur de fin
							</label>
							<div className="flex gap-2">
								<input
									type="color"
									value={currentStyles.gradientColor2 || "#0000ff"}
									onChange={(e) => {
										const color2 = e.target.value;
										handleStyleChange("gradientColor2", color2);
										const color1 = currentStyles.gradientColor1 || "#ff0000";
										const angle = currentStyles.gradientAngle || "45";
										handleStyleChange("backgroundImage", `linear-gradient(${angle}deg, ${color1}, ${color2})`);
										// Désactiver la couleur unie si on utilise un gradient
										if (currentStyles.color) {
											handleStyleChange("color", "");
										}
									}}
									className="w-12 h-10 border border-slate-300 rounded cursor-pointer"
								/>
								<input
									type="text"
									value={currentStyles.gradientColor2 || "#0000ff"}
									onChange={(e) => {
										const color2 = e.target.value;
										handleStyleChange("gradientColor2", color2);
										const color1 = currentStyles.gradientColor1 || "#ff0000";
										const angle = currentStyles.gradientAngle || "45";
										handleStyleChange("backgroundImage", `linear-gradient(${angle}deg, ${color1}, ${color2})`);
										// Désactiver la couleur unie si on utilise un gradient
										if (currentStyles.color) {
											handleStyleChange("color", "");
										}
									}}
									className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
									placeholder="#0000ff"
								/>
							</div>
						</div>

						<div>
							<label className="text-xs text-slate-500 mb-1 block">
								Angle du gradient ({currentStyles.gradientAngle || "45"}°)
							</label>
							<input
								type="range"
								min="0"
								max="360"
								value={currentStyles.gradientAngle || "45"}
								onChange={(e) => {
									const angle = e.target.value;
									handleStyleChange("gradientAngle", angle);
									const color1 = currentStyles.gradientColor1 || "#ff0000";
									const color2 = currentStyles.gradientColor2 || "#0000ff";
									handleStyleChange("backgroundImage", `linear-gradient(${angle}deg, ${color1}, ${color2})`);
								}}
								className="w-full"
							/>
							<div className="flex justify-between text-xs text-slate-500 mt-1">
								<span>0°</span>
								<span>360°</span>
							</div>
						</div>

						{/* Prévisualisation du gradient */}
						{(currentStyles.gradientColor1 || currentStyles.gradientColor2) && (
							<div>
								<label className="text-xs text-slate-500 mb-1 block">
									Prévisualisation
								</label>
								<div
									className="w-full h-16 rounded-lg border border-slate-300"
									style={{
										backgroundImage: currentStyles.backgroundImage || `linear-gradient(${currentStyles.gradientAngle || "45"}deg, ${currentStyles.gradientColor1 || "#ff0000"}, ${currentStyles.gradientColor2 || "#0000ff"})`
									}}
								/>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Hover Interactions */}
			<div className="space-y-3 pt-3 border-t border-slate-300">
				<h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-2">
					HOVER INTERACTIONS
				</h3>

				{/* Hover color */}
				<div>
					<label className="text-xs text-slate-500 mb-1 block">
						Couleur au survol
					</label>
					<div className="flex gap-2">
						<input
							type="color"
							value={currentStyles.hoverColor || "#000000"}
							onChange={(e) => handleStyleChange("hoverColor", e.target.value)}
							className="w-12 h-10 border border-slate-300 rounded cursor-pointer"
						/>
						<input
							type="text"
							value={currentStyles.hoverColor || "#000000"}
							onChange={(e) => handleStyleChange("hoverColor", e.target.value)}
							className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
							placeholder="#000000"
						/>
					</div>
					<p className="text-xs text-slate-400 mt-1">
						Durée de transition : 0.1s (fixe)
					</p>
				</div>
			</div>

			{/* Clic Interactions */}
			<div className="space-y-3 pt-3 border-t border-slate-300">
				<h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-2">
					CLIC INTERACTIONS
				</h3>

				{/* Active color */}
				<div>
					<label className="text-xs text-slate-500 mb-1 block">
						Couleur au clic
					</label>
					<div className="flex gap-2">
						<input
							type="color"
							value={currentStyles.activeColor || "#000000"}
							onChange={(e) => handleStyleChange("activeColor", e.target.value)}
							className="w-12 h-10 border border-slate-300 rounded cursor-pointer"
						/>
						<input
							type="text"
							value={currentStyles.activeColor || "#000000"}
							onChange={(e) => handleStyleChange("activeColor", e.target.value)}
							className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
							placeholder="#000000"
						/>
					</div>
					<p className="text-xs text-slate-400 mt-1">
						Durée de transition : 0.05s (fixe)
					</p>
				</div>
			</div>

			{/* Animation au scroll */}
			<div className="space-y-3 pt-3 border-t border-slate-300">
				<h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-2">
					ANIMATION AU SCROLL
				</h3>

				<div>
					<label className="text-xs text-slate-600 mb-1 block">
						Type d'animation
					</label>
					<select
						value={currentStyles.animationOnScroll || "none"}
						onChange={(e) => handleStyleChange("animationOnScroll", e.target.value)}
						className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
					>
						<option value="none">Aucune</option>
						<option value="fade">Fade (fondu)</option>
						<option value="slide-up">Slide Up (glisser vers le haut)</option>
						<option value="slide-down">Slide Down (glisser vers le bas)</option>
						<option value="slide-left">Slide Left (glisser vers la gauche)</option>
						<option value="slide-right">Slide Right (glisser vers la droite)</option>
						<option value="zoom-in">Zoom In (agrandir)</option>
						<option value="zoom-out">Zoom Out (réduire)</option>
					</select>
				</div>
			</div>

			{/* Options avancées */}
			<div className="space-y-3 pt-3 border-t border-slate-300">
				<h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-2">
					OPTIONS AVANCÉES
				</h3>

				{/* Lien */}
				<div>
					<label className="text-xs text-slate-600 mb-1 block">
						Lien (URL)
					</label>
					<input
						type="text"
						value={currentLink}
						onChange={(e) => handlePropChange("link", e.target.value)}
						className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
						placeholder="https://example.com ou #section-id"
					/>
				</div>

				{/* ID de section */}
				<div>
					<label className="text-xs text-slate-600 mb-1 block">
						ID de section (pour ancrage)
					</label>
					<input
						type="text"
						value={currentLinkId}
						onChange={(e) => handlePropChange("linkId", e.target.value)}
						className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
						placeholder="section-id"
					/>
				</div>
			</div>
		</div>
	);
}

