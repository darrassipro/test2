"use client";

import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { updateNodeStyles, updateNodeProps } from "services/slices/pageTreeSlice";
import { useState, useRef, useEffect } from "react";

export function SectionEditor() {
	const dispatch = useAppDispatch();
	const selectedNodeId = useAppSelector((state) => state.pageTree.selectedNodeId);
	const selectedNode = useAppSelector((state) =>
		selectedNodeId ? state.pageTree.nodes[selectedNodeId] : null
	);
	// Utiliser le breakpoint du canvas au lieu d'un state local
	const viewport = useAppSelector((state) => state.editor.activeBreakpoint);
	const activeBreakpoint: "desktop" | "tablet" | "mobile" =
		viewport === "base" ? "desktop" : viewport === "tablet" ? "tablet" : "mobile";
	const [isDragging, setIsDragging] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Récupérer tous les nodes pour trouver les Navbar et leurs liens
	// IMPORTANT: Tous les hooks doivent être appelés avant tout return conditionnel
	const nodes = useAppSelector((state) => state.pageTree.nodes);

	// Forcer la mise à jour quand le node change
	useEffect(() => {
		// Réinitialiser l'état de drag quand le node change
		setIsDragging(false);
	}, [selectedNodeId, selectedNode?.styles]);

	if (!selectedNode || selectedNode.type !== "Section") {
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
						d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
					/>
				</svg>
				<p className="text-xs text-slate-500">
					Sélectionnez une Section pour modifier ses propriétés
				</p>
			</div>
		);
	}

	const currentStyles = selectedNode.styles[activeBreakpoint] || {};

	const handleStyleChange = (property: string, value: string) => {
		console.log(`[SectionEditor] Sauvegarde ${property} = ${value} pour breakpoint: ${activeBreakpoint}`, {
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

	const handleFileSelect = (file: File) => {
		if (!file) return;

		// Vérifier le type de fichier
		const validTypes = ["image/jpeg", "image/jpg", "image/png", "video/mp4"];
		if (!validTypes.includes(file.type)) {
			alert("Format de fichier non supporté. Veuillez sélectionner JPG, PNG ou MP4.");
			return;
		}

		// Vérifier la taille (10MB max)
		const maxSize = 10 * 1024 * 1024; // 10MB
		if (file.size > maxSize) {
			alert("Le fichier est trop volumineux. Taille maximale : 10MB.");
			return;
		}

		// Convertir en base64
		const reader = new FileReader();
		reader.onload = (e) => {
			const base64String = e.target?.result as string;
			// Formater correctement pour CSS: pour les chaînes base64, on peut utiliser url() sans guillemets
			// Le format url(data:image/...) fonctionne bien avec React
			const formattedValue = `url(${base64String})`;
			console.log("[SectionEditor] Image uploadée, format:", formattedValue.substring(0, 100) + "...");
			handleStyleChange("backgroundImage", formattedValue);
		};
		reader.readAsDataURL(file);
	};

	const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			handleFileSelect(file);
		}
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(true);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);

		const file = e.dataTransfer.files?.[0];
		if (file) {
			handleFileSelect(file);
		}
	};

	const handleClick = () => {
		fileInputRef.current?.click();
	};

	// Extraire l'URL ou base64 de backgroundImage pour l'aperçu
	const getBackgroundImageUrl = () => {
		const bgImage = currentStyles.backgroundImage || "";
		if (!bgImage) return "";
		// Retirer url(...), url('...') ou url("...") pour obtenir l'URL/base64
		return bgImage.replace(/url\(['"]?|['"]?\)/g, "");
	};

	const backgroundImageUrl = getBackgroundImageUrl();
	const hasBackgroundImage = backgroundImageUrl && backgroundImageUrl.trim() !== "";

	// Trouver tous les nodes de type Navbar et collecter leurs liens
	const navbarLinks: Array<{ text: string; url: string }> = [];
	Object.values(nodes).forEach((node) => {
		if (node.type === "Navbar" && node.props?.links) {
			const links = Array.isArray(node.props.links) ? node.props.links : [];
			links.forEach((link: { text: string; url: string }) => {
				// Éviter les doublons
				if (!navbarLinks.find((l) => l.text === link.text && l.url === link.url)) {
					navbarLinks.push(link);
				}
			});
		}
	});

	// Récupérer le lien actuellement lié à cette section
	const currentLinkedLink = selectedNode.props?.linkedNavbarLink || "";
	const currentHtmlId = selectedNode.props?.htmlId || "";

	// Fonction pour gérer le changement de lien navbar
	const handleNavbarLinkChange = (linkText: string) => {
		const selectedLink = navbarLinks.find((link) => link.text === linkText);
		if (selectedLink) {
			// Extraire l'ID depuis l'URL (ex: "#reservation" -> "reservation")
			const htmlId = selectedLink.url.startsWith("#") 
				? selectedLink.url.substring(1) 
				: selectedLink.url;
			
			// Mettre à jour à la fois le linkedNavbarLink et l'htmlId
			handlePropChange("linkedNavbarLink", linkText);
			handlePropChange("htmlId", htmlId);
		} else if (linkText === "") {
			// Si aucun lien n'est sélectionné, supprimer la liaison
			handlePropChange("linkedNavbarLink", "");
			handlePropChange("htmlId", "");
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h2 className="text-sm font-semibold text-slate-900 mb-2">
					Section - Propriétés
				</h2>
				<p className="text-xs text-slate-500">
					Personnalisez l'apparence de votre section
				</p>
			</div>

			{/* Liaison avec Navbar */}
			<div className="space-y-3">
				<h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
					🔗 Liaison Navbar
				</h3>
				<div>
					<label className="text-xs text-slate-600 mb-1 block">
						Lier à un lien de navbar
					</label>
					<select
						value={currentLinkedLink}
						onChange={(e) => handleNavbarLinkChange(e.target.value)}
						className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
					>
						<option value="">Aucun lien</option>
						{navbarLinks.map((link, index) => (
							<option key={index} value={link.text}>
								{link.text}
							</option>
						))}
					</select>
					{currentLinkedLink && (
						<p className="text-xs text-slate-500 mt-1">
							ID de section: <span className="font-mono text-slate-700">{currentHtmlId || "non défini"}</span>
						</p>
					)}
				</div>
			</div>

			{/* Layout - Structure Flexbox */}
			<div className="space-y-3">
				<h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
					📐 Layout
				</h3>

				{/* Direction du flux */}
				<div>
					<label className="text-xs text-slate-600 mb-1 block">
						Direction du flux
					</label>
					<select
						value={currentStyles.flexDirection || "column"}
						onChange={(e) => {
							handleStyleChange("flexDirection", e.target.value);
							// S'assurer que display est flex
							handleStyleChange("display", "flex");
						}}
						className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
					>
						<option value="column">Vertical (column)</option>
						<option value="row">Horizontal (row)</option>
					</select>
				</div>

				{/* Wrap */}
				<div>
					<label className="text-xs text-slate-600 mb-1 block">
						Retour à la ligne (Wrap)
					</label>
					<select
						value={currentStyles.flexWrap || "nowrap"}
						onChange={(e) => handleStyleChange("flexWrap", e.target.value)}
						className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
					>
						<option value="nowrap">Pas de retour à la ligne</option>
						<option value="wrap">Retour à la ligne automatique</option>
					</select>
				</div>
			</div>

			{/* Padding */}
			<div className="space-y-3">
				<h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
					📏 Padding
				</h3>

				{/* Padding Top */}
				<div>
					<label className="text-xs text-slate-600 mb-1 block">
						Padding haut
					</label>
					<select
						value={currentStyles.paddingTop || "0px"}
						onChange={(e) => handleStyleChange("paddingTop", e.target.value)}
						className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
					>
						<option value="0px">0</option>
						<option value="8px">8px</option>
						<option value="16px">16px</option>
						<option value="24px">24px</option>
						<option value="32px">32px</option>
						<option value="40px">40px</option>
						<option value="48px">48px</option>
						<option value="64px">64px</option>
						<option value="80px">80px</option>
						<option value="96px">96px</option>
					</select>
				</div>

				{/* Padding Bottom */}
				<div>
					<label className="text-xs text-slate-600 mb-1 block">
						Padding bas
					</label>
					<select
						value={currentStyles.paddingBottom || "40px"}
						onChange={(e) => handleStyleChange("paddingBottom", e.target.value)}
						className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
					>
						<option value="0px">0</option>
						<option value="8px">8px</option>
						<option value="16px">16px</option>
						<option value="24px">24px</option>
						<option value="32px">32px</option>
						<option value="40px">40px</option>
						<option value="48px">48px</option>
						<option value="64px">64px</option>
						<option value="80px">80px</option>
						<option value="96px">96px</option>
					</select>
				</div>
			</div>

			{/* Alignement */}
			<div className="space-y-3">
				<h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
					↔️ Alignement
				</h3>

				{/* Alignement vertical (Main Axis - avec flexDirection column, l'axe principal est vertical) */}
				<div>
					<label className="text-xs text-slate-600 mb-1 block">
						Alignement vertical (Main Axis)
					</label>
					<select
						value={currentStyles.justifyContent || "flex-start"}
						onChange={(e) => handleStyleChange("justifyContent", e.target.value)}
						className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
					>
						<option value="flex-start">Début (flex-start)</option>
						<option value="center">Centre</option>
						<option value="flex-end">Fin (flex-end)</option>
						<option value="space-between">Espacement entre (space-between)</option>
						<option value="space-around">Espacement autour (space-around)</option>
					</select>
				</div>

				{/* Alignement horizontal (Cross Axis - avec flexDirection column, l'axe secondaire est horizontal) */}
				<div>
					<label className="text-xs text-slate-600 mb-1 block">
						Alignement horizontal (Cross Axis)
					</label>
					<select
						value={currentStyles.alignItems || "center"}
						onChange={(e) => handleStyleChange("alignItems", e.target.value)}
						className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
					>
						<option value="flex-start">Gauche (flex-start)</option>
						<option value="center">Centre</option>
						<option value="flex-end">Droite (flex-end)</option>
						<option value="stretch">Étiré (stretch)</option>
					</select>
				</div>
			</div>

			{/* Espacement (Gap) */}
			<div className="space-y-3">
				<h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
					📏 Espacement
				</h3>

				{/* Gap général */}
				<div>
					<label className="text-xs text-slate-600 mb-1 block">
						Espacement général (gap)
					</label>
					<select
						value={currentStyles.gap || "24px"}
						onChange={(e) => handleStyleChange("gap", e.target.value)}
						className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
					>
						<option value="0px">0</option>
						<option value="4px">4px</option>
						<option value="8px">8px</option>
						<option value="12px">12px</option>
						<option value="16px">16px</option>
						<option value="24px">24px</option>
						<option value="32px">32px</option>
						<option value="48px">48px</option>
						<option value="64px">64px</option>
					</select>
				</div>

				{/* Row Gap */}
				<div>
					<label className="text-xs text-slate-600 mb-1 block">
						Espacement vertical (rowGap)
					</label>
					<select
						value={currentStyles.rowGap || ""}
						onChange={(e) => handleStyleChange("rowGap", e.target.value || "")}
						className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
					>
						<option value="">Par défaut (utilise gap)</option>
						<option value="0px">0</option>
						<option value="4px">4px</option>
						<option value="8px">8px</option>
						<option value="12px">12px</option>
						<option value="16px">16px</option>
						<option value="24px">24px</option>
						<option value="32px">32px</option>
						<option value="48px">48px</option>
						<option value="64px">64px</option>
					</select>
				</div>

				{/* Column Gap */}
				<div>
					<label className="text-xs text-slate-600 mb-1 block">
						Espacement horizontal (columnGap)
					</label>
					<select
						value={currentStyles.columnGap || ""}
						onChange={(e) => handleStyleChange("columnGap", e.target.value || "")}
						className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
					>
						<option value="">Par défaut (utilise gap)</option>
						<option value="0px">0</option>
						<option value="4px">4px</option>
						<option value="8px">8px</option>
						<option value="12px">12px</option>
						<option value="16px">16px</option>
						<option value="24px">24px</option>
						<option value="32px">32px</option>
						<option value="48px">48px</option>
						<option value="64px">64px</option>
					</select>
				</div>
			</div>

			{/* Background */}
			<div className="space-y-3">
				<h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
					🎨 Arrière-plan
				</h3>

				{/* Background Color */}
				<div>
					<label className="text-xs text-slate-600 mb-1 block">
						Couleur de fond
					</label>
					<div className="flex gap-2">
						<input
							type="color"
							value={currentStyles.backgroundColor || "#ffffff"}
							onChange={(e) =>
								handleStyleChange("backgroundColor", e.target.value)
							}
							className="w-12 h-10 border border-slate-300 rounded cursor-pointer"
						/>
						<input
							type="text"
							value={currentStyles.backgroundColor || "#ffffff"}
							onChange={(e) =>
								handleStyleChange("backgroundColor", e.target.value)
							}
							className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
							placeholder="#ffffff"
						/>
					</div>
					{/* Opacité de la couleur de fond - utile pour superposer sur l'image */}
					<div 
						className={`mt-2 p-3 rounded-lg border-2 ${
							hasBackgroundImage ? "" : "border-transparent"
						}`}
						style={hasBackgroundImage ? {
							animation: "blink-border 5s ease-in-out infinite",
							borderColor: "#e2e8f0" // Couleur initiale
						} : {}}
					>
						<label className="text-xs text-slate-600 mb-1 block">
							Opacité de la couleur ({currentStyles.backgroundColorOpacity || 50}%)
						</label>
						<input
							type="range"
							min="0"
							max="100"
							value={currentStyles.backgroundColorOpacity || 50}
							onChange={(e) =>
								handleStyleChange("backgroundColorOpacity", e.target.value)
							}
							className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
						/>
						<div className="flex justify-between text-xs text-slate-500 mt-1">
							<span>0%</span>
							<span>50%</span>
							<span>100%</span>
						</div>
					</div>
				</div>

				{/* Background Image */}
				<div>
					<label className="text-xs text-slate-600 mb-1 block">
						Image de fond
					</label>
					<div
						onClick={handleClick}
						onDragOver={handleDragOver}
						onDragLeave={handleDragLeave}
						onDrop={handleDrop}
						className={`
							w-full border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors
							${isDragging 
								? "border-[#E72858] bg-rose-50" 
								: "border-blue-400 bg-white hover:bg-slate-50"
							}
						`}
					>
						<div className="flex items-center gap-4">
							{/* Icône cloud avec flèche */}
							<div className="flex-shrink-0">
								<svg
									className="w-12 h-12 text-[#E72858]"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
									/>
								</svg>
							</div>
							<div className="flex-1">
								<p className="text-sm font-semibold text-slate-900 mb-1">
									Select a file or drag and drop here
								</p>
								<p className="text-xs text-slate-500">
									JPG, PNG or Mp4, file size no more than 10MB
								</p>
							</div>
						</div>
					</div>
					<input
						ref={fileInputRef}
						type="file"
						accept="image/jpeg,image/jpg,image/png,video/mp4"
						onChange={handleFileInputChange}
						className="hidden"
					/>

					{/* Aperçu de l'image */}
					{hasBackgroundImage && (
						<div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
							<div className="flex items-center justify-between mb-2">
								<span className="text-xs font-semibold text-slate-700">
									Aperçu
								</span>
								<button
									onClick={(e) => {
										e.stopPropagation();
										handleStyleChange("backgroundImage", "");
									}}
									className="text-xs text-red-600 hover:text-red-700"
								>
									Supprimer
								</button>
							</div>
							{backgroundImageUrl.startsWith("data:image") ? (
								<img
									src={backgroundImageUrl}
									alt="Aperçu image de fond"
									className="w-full h-auto max-h-32 object-contain rounded"
								/>
							) : (
								<div className="text-xs text-slate-500 italic">
									Image externe : {backgroundImageUrl.substring(0, 50)}...
								</div>
							)}
						</div>
					)}
				</div>

				{/* Configuration de l'image de fond - Affichée uniquement si une image est définie */}
				{hasBackgroundImage && (
					<div className="space-y-3 pt-3 border-t border-slate-200">
						<h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
							⚙️ Configuration de l'image
						</h4>

						{/* Background Size */}
						<div>
							<label className="text-xs text-slate-600 mb-1 block">
								Taille (Size)
							</label>
							<select
								value={currentStyles.backgroundSize || "cover"}
								onChange={(e) => handleStyleChange("backgroundSize", e.target.value)}
								className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
							>
								<option value="cover">Cover (couvrir)</option>
								<option value="contain">Contain (contenir)</option>
								<option value="auto">Auto</option>
								<option value="100% 100%">100% 100% (étirer)</option>
							</select>
						</div>

						{/* Background Repeat */}
						<div>
							<label className="text-xs text-slate-600 mb-1 block">
								Répétition (Repeat)
							</label>
							<select
								value={currentStyles.backgroundRepeat || "no-repeat"}
								onChange={(e) => handleStyleChange("backgroundRepeat", e.target.value)}
								className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
							>
								<option value="no-repeat">No Repeat (pas de répétition)</option>
								<option value="repeat">Repeat (répéter)</option>
								<option value="repeat-x">Repeat X (horizontal)</option>
								<option value="repeat-y">Repeat Y (vertical)</option>
							</select>
						</div>

						{/* Background Position */}
						<div>
							<label className="text-xs text-slate-600 mb-1 block">
								Position
							</label>
							<select
								value={currentStyles.backgroundPosition || "center"}
								onChange={(e) => handleStyleChange("backgroundPosition", e.target.value)}
								className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
							>
								<option value="center">Centre</option>
								<option value="top">Haut</option>
								<option value="bottom">Bas</option>
								<option value="left">Gauche</option>
								<option value="right">Droite</option>
								<option value="top left">Haut gauche</option>
								<option value="top right">Haut droite</option>
								<option value="bottom left">Bas gauche</option>
								<option value="bottom right">Bas droite</option>
							</select>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

