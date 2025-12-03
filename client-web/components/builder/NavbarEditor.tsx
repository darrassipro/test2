"use client";

import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { updateNodeProps, updateNodeStyles } from "services/slices/pageTreeSlice";
import { useState, useRef, useEffect } from "react";

export function NavbarEditor() {
	const dispatch = useAppDispatch();
	const selectedNodeId = useAppSelector((state) => state.pageTree.selectedNodeId);
	const selectedNode = useAppSelector((state) =>
		selectedNodeId ? state.pageTree.nodes[selectedNodeId] : null
	);
	const viewport = useAppSelector((state) => state.editor.activeBreakpoint);
	const activeBreakpoint: "desktop" | "tablet" | "mobile" =
		viewport === "base" ? "desktop" : viewport === "tablet" ? "tablet" : "mobile";
	const [isDragging, setIsDragging] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	if (!selectedNode || selectedNode.type !== "Navbar") {
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
						d="M4 6h16M4 12h16M4 18h16"
					/>
				</svg>
				<p className="text-xs text-slate-500">
					Sélectionnez un Navbar pour modifier ses propriétés
				</p>
			</div>
		);
	}

	// Utiliser les props avec valeurs par défaut
	const links = Array.isArray(selectedNode.props.links) && selectedNode.props.links.length > 0
		? selectedNode.props.links
		: [
			{ text: "Accueil", url: "#" },
			{ text: "À propos", url: "#" },
			{ text: "Contact", url: "#" },
		];

	const logoType = selectedNode.props.logoType || "image"; // "image" ou "text"
	const logoSrc = selectedNode.props.logoSrc || "";
	const logoAlt = selectedNode.props.logoAlt || "Logo";
	const logoText = selectedNode.props.logoText || "";
	
	// Récupérer le type de positionnement (normal, sticky, fixed)
	// Rétrocompatibilité : si sticky existe, l'utiliser, sinon utiliser positionType
	const positionType = selectedNode.props.positionType || (selectedNode.props.sticky ? "sticky" : "normal");

	// Forcer la mise à jour quand le node change
	useEffect(() => {
		// Réinitialiser l'état de drag quand le node change
		setIsDragging(false);
	}, [selectedNodeId, selectedNode?.props]);

	const currentStyles = selectedNode?.styles[activeBreakpoint] || {};

	const handlePropChange = (property: string, value: any) => {
		dispatch(
			updateNodeProps({
				nodeId: selectedNodeId!,
				props: { [property]: value },
			})
		);
	};

	const handleStyleChange = (property: string, value: string) => {
		dispatch(
			updateNodeStyles({
				nodeId: selectedNodeId!,
				breakpoint: activeBreakpoint,
				styles: { [property]: value },
			})
		);
	};

	const handleLinkChange = (index: number, field: "text" | "url", value: string) => {
		const updatedLinks = [...links];
		updatedLinks[index] = { ...updatedLinks[index], [field]: value };
		handlePropChange("links", updatedLinks);
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
			handlePropChange("logoSrc", base64String);
			handlePropChange("logoType", "image");
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

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h2 className="text-sm font-semibold text-slate-900 mb-2">
					Navbar - Propriétés
				</h2>
				<p className="text-xs text-slate-500">
					Personnalisez le logo et les liens de votre navbar
				</p>
			</div>

			{/* Logo */}
			<div className="space-y-3">
				<h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
					🖼️ Logo
				</h3>

				{/* Type de logo : Image ou Texte */}
				<div>
					<label className="text-xs text-slate-600 mb-1 block">
						Type de logo
					</label>
					<select
						value={logoType}
						onChange={(e) => {
							handlePropChange("logoType", e.target.value);
							if (e.target.value === "text") {
								handlePropChange("logoSrc", "");
							}
						}}
						className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
					>
						<option value="image">Image</option>
						<option value="text">Texte</option>
					</select>
				</div>

				{logoType === "image" ? (
					<>
						{/* Zone d'upload de fichier */}
						<div>
							<label className="text-xs text-slate-600 mb-1 block">
								Image du logo
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
							{logoSrc && (
								<div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
									<div className="flex items-center justify-between mb-2">
										<span className="text-xs font-semibold text-slate-700">
											Aperçu
										</span>
										<button
											onClick={(e) => {
												e.stopPropagation();
												handlePropChange("logoSrc", "");
											}}
											className="text-xs text-red-600 hover:text-red-700"
										>
											Supprimer
										</button>
									</div>
									<img
										src={logoSrc}
										alt="Aperçu logo"
										className="w-full h-auto max-h-32 object-contain rounded"
									/>
								</div>
							)}
						</div>

						{/* Logo Alt */}
						<div>
							<label className="text-xs text-slate-600 mb-1 block">
								Texte alternatif (Alt)
							</label>
							<input
								type="text"
								value={logoAlt}
								onChange={(e) => handlePropChange("logoAlt", e.target.value)}
								className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
								placeholder="Logo"
							/>
						</div>
					</>
				) : (
					/* Logo texte */
					<div>
						<label className="text-xs text-slate-600 mb-1 block">
							Texte du logo
						</label>
						<input
							type="text"
							value={logoText}
							onChange={(e) => handlePropChange("logoText", e.target.value)}
							className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
							placeholder="Mon Logo"
						/>
					</div>
				)}
			</div>

			{/* Positionnement */}
			<div className="space-y-3">
				<h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
					📍 Positionnement
				</h3>
				<div>
					<label className="text-xs text-slate-600 mb-1 block">
						Type de positionnement
					</label>
					<select
						value={positionType}
						onChange={(e) => {
							const newPositionType = e.target.value;
							handlePropChange("positionType", newPositionType);
							// Rétrocompatibilité : mettre à jour sticky aussi
							if (newPositionType === "sticky") {
								handlePropChange("sticky", true);
							} else {
								handlePropChange("sticky", false);
							}
						}}
						className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
					>
						<option value="normal">Normal (défile avec la page)</option>
						<option value="sticky">Sticky (reste visible lors du scroll)</option>
						<option value="fixed">Fixed (fixe en haut de la page)</option>
					</select>
					<p className="text-xs text-slate-500 mt-1">
						{positionType === "normal" && "La navbar défile normalement avec la page"}
						{positionType === "sticky" && "La navbar reste visible lors du scroll"}
						{positionType === "fixed" && "La navbar est fixe en haut de la page"}
					</p>
				</div>
			</div>

			{/* Liens */}
			<div className="space-y-3">
				<h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
					🔗 Liens de navigation
				</h3>

				{links.map((link: { text: string; url: string }, index: number) => (
					<div
						key={index}
						className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3"
					>
						<div className="flex items-center justify-between">
							<span className="text-xs font-semibold text-slate-700">
								Lien {index + 1}
							</span>
						</div>

						{/* Texte du lien */}
						<div>
							<label className="text-xs text-slate-600 mb-1 block">
								Texte du lien
							</label>
							<input
								type="text"
								value={link.text || ""}
								onChange={(e) => handleLinkChange(index, "text", e.target.value)}
								className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
								placeholder={`Lien ${index + 1}`}
							/>
						</div>

						{/* URL du lien */}
						<div>
							<label className="text-xs text-slate-600 mb-1 block">
								URL du lien
							</label>
							<input
								type="text"
								value={link.url || "#"}
								onChange={(e) => handleLinkChange(index, "url", e.target.value)}
								className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
								placeholder="# ou https://..."
							/>
						</div>
					</div>
				))}
			</div>

			{/* Styles */}
			<div className="space-y-3">
				<h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
					🎨 Styles
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
				</div>

				{/* Link Color */}
				<div>
					<label className="text-xs text-slate-600 mb-1 block">
						Couleur des liens
					</label>
					<div className="flex gap-2">
						<input
							type="color"
							value={currentStyles.linkColor || "#475569"}
							onChange={(e) =>
								handleStyleChange("linkColor", e.target.value)
							}
							className="w-12 h-10 border border-slate-300 rounded cursor-pointer"
						/>
						<input
							type="text"
							value={currentStyles.linkColor || "#475569"}
							onChange={(e) =>
								handleStyleChange("linkColor", e.target.value)
							}
							className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
							placeholder="#475569"
						/>
					</div>
				</div>

				{/* Border Radius */}
				<div>
					<label className="text-xs text-slate-600 mb-1 block">
						Border Radius
					</label>
					<select
						value={currentStyles.borderRadius || "0px"}
						onChange={(e) => handleStyleChange("borderRadius", e.target.value)}
						className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
					>
						<option value="0px">Aucun (0px)</option>
						<option value="4px">Petit (4px)</option>
						<option value="8px">Moyen (8px)</option>
						<option value="12px">Grand (12px)</option>
						<option value="16px">Très grand (16px)</option>
						<option value="24px">Extra large (24px)</option>
					</select>
				</div>

				{/* Shadow */}
				<div>
					<label className="text-xs text-slate-600 mb-1 block">
						Ombre (Shadow)
					</label>
					<select
						value={currentStyles.boxShadow || "none"}
						onChange={(e) => handleStyleChange("boxShadow", e.target.value)}
						className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
					>
						<option value="none">Aucune</option>
						<option value="0 1px 2px 0 rgb(0 0 0 / 0.05)">Petite (sm)</option>
						<option value="0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)">Moyenne (md)</option>
						<option value="0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)">Grande (lg)</option>
						<option value="0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)">Très grande (xl)</option>
						<option value="0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)">Extra large (2xl)</option>
					</select>
				</div>
			</div>
		</div>
	);
}

