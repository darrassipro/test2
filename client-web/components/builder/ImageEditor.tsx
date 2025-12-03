"use client";

import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { updateNodeStyles, updateNodeProps } from "services/slices/pageTreeSlice";
import { useState, useRef, useEffect } from "react";

export function ImageEditor() {
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

	// Forcer la mise à jour quand le node change
	useEffect(() => {
		// Réinitialiser l'état de drag quand le node change
		setIsDragging(false);
	}, [selectedNodeId, selectedNode?.styles]);

	if (!selectedNode || selectedNode.type !== "Image") {
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
						d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
					/>
				</svg>
				<p className="text-xs text-slate-500">
					Sélectionnez une Image pour modifier ses propriétés
				</p>
			</div>
		);
	}

	const currentStyles = selectedNode.styles[activeBreakpoint] || {};

	const handleStyleChange = (property: string, value: string) => {
		console.log(`[ImageEditor] Sauvegarde ${property} = ${value} pour breakpoint: ${activeBreakpoint}`, {
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
		const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
		if (!validTypes.includes(file.type)) {
			alert("Format de fichier non supporté. Veuillez sélectionner JPG, PNG, GIF ou WEBP.");
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
			console.log("[ImageEditor] Image uploadée, format:", base64String.substring(0, 100) + "...");
			// Stocker l'image en base64 dans les props
			handlePropChange("src", base64String);
			// Mettre à jour l'alt si nécessaire
			if (!selectedNode.props?.alt) {
				handlePropChange("alt", file.name);
			}
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

	const currentSrc = selectedNode.props?.src || "/placeholder.jpg";
	const currentAlt = selectedNode.props?.alt || "Image";

	return (
		<div className="space-y-6">
			{/* Image Upload */}
			<div>
				<label className="text-xs text-slate-600 mb-1 block">
					Image
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
								JPG, PNG, GIF or WEBP, file size no more than 10MB
							</p>
						</div>
					</div>
				</div>
				<input
					ref={fileInputRef}
					type="file"
					accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
					onChange={handleFileInputChange}
					className="hidden"
				/>

				{/* Aperçu de l'image */}
				{currentSrc && currentSrc !== "/placeholder.jpg" && (
					<div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
						<div className="flex items-center justify-between mb-2">
							<span className="text-xs font-semibold text-slate-700">
								Aperçu
							</span>
							<button
								onClick={(e) => {
									e.stopPropagation();
									handlePropChange("src", "/placeholder.jpg");
								}}
								className="text-xs text-red-600 hover:text-red-700"
							>
								Supprimer
							</button>
						</div>
						<img
							src={currentSrc}
							alt={currentAlt}
							className="w-full h-auto max-h-32 object-contain rounded"
						/>
					</div>
				)}
			</div>

			{/* Alt Text */}
			<div>
				<label className="text-xs text-slate-600 mb-1 block">
					Texte alternatif (Alt)
				</label>
				<input
					type="text"
					value={currentAlt}
					onChange={(e) => handlePropChange("alt", e.target.value)}
					className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
					placeholder="Description de l'image"
				/>
			</div>

			{/* Background Color with Opacity */}
			<div className="space-y-3 pt-3 border-t border-slate-200">
				<h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
					🎨 Couleur de fond
				</h4>

				<div>
					<label className="text-xs text-slate-600 mb-1 block">
						Couleur
					</label>
					<div className="flex gap-2">
						<input
							type="color"
							value={currentStyles.backgroundColor || "#ffffff"}
							onChange={(e) => handleStyleChange("backgroundColor", e.target.value)}
							className="w-12 h-10 border border-slate-300 rounded cursor-pointer"
						/>
						<input
							type="text"
							value={currentStyles.backgroundColor || "#ffffff"}
							onChange={(e) => handleStyleChange("backgroundColor", e.target.value)}
							className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
							placeholder="#ffffff"
						/>
					</div>
				</div>

				<div>
					<label className="text-xs text-slate-600 mb-1 block">
						Opacité ({currentStyles.backgroundColorOpacity || "100"}%)
					</label>
					<input
						type="range"
						min="0"
						max="100"
						value={currentStyles.backgroundColorOpacity || "100"}
						onChange={(e) => handleStyleChange("backgroundColorOpacity", e.target.value)}
						className="w-full"
					/>
				</div>
			</div>

			{/* Object Fit (Cover/Contain/Repeat) */}
			<div className="space-y-3 pt-3 border-t border-slate-200">
				<h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
					📐 Ajustement de l'image
				</h4>

				<div>
					<label className="text-xs text-slate-600 mb-1 block">
						Mode d'ajustement
					</label>
					<select
						value={currentStyles.objectFit || "cover"}
						onChange={(e) => handleStyleChange("objectFit", e.target.value)}
						className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
					>
						<option value="cover">Cover (couvrir)</option>
						<option value="contain">Contain (contenir)</option>
						<option value="fill">Fill (remplir)</option>
						<option value="none">None (aucun)</option>
						<option value="scale-down">Scale Down (réduire)</option>
					</select>
				</div>
			</div>

			{/* Blur */}
			<div className="space-y-3 pt-3 border-t border-slate-200">
				<h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
					🌫️ Flou (Blur)
				</h4>

				<div>
					<label className="text-xs text-slate-600 mb-1 block">
						Niveau de flou ({currentStyles.filterBlur || "0"}px)
					</label>
					<input
						type="range"
						min="0"
						max="20"
						value={currentStyles.filterBlur || "0"}
						onChange={(e) => handleStyleChange("filterBlur", e.target.value)}
						className="w-full"
					/>
					<div className="flex justify-between text-xs text-slate-500 mt-1">
						<span>0px</span>
						<span>20px</span>
					</div>
				</div>
			</div>

			{/* Shadow */}
			<div className="space-y-3 pt-3 border-t border-slate-200">
				<h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
					✨ Ombre (Shadow)
				</h4>

				<div>
					<label className="text-xs text-slate-600 mb-1 block">
						Couleur de l'ombre
					</label>
					<div className="flex gap-2">
						<input
							type="color"
							value={currentStyles.boxShadowColor || "#000000"}
							onChange={(e) => handleStyleChange("boxShadowColor", e.target.value)}
							className="w-12 h-10 border border-slate-300 rounded cursor-pointer"
						/>
						<input
							type="text"
							value={currentStyles.boxShadowColor || "#000000"}
							onChange={(e) => handleStyleChange("boxShadowColor", e.target.value)}
							className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
							placeholder="#000000"
						/>
					</div>
				</div>

				<div>
					<label className="text-xs text-slate-600 mb-1 block">
						Offset X ({currentStyles.boxShadowX || "0"}px)
					</label>
					<input
						type="range"
						min="-20"
						max="20"
						value={currentStyles.boxShadowX || "0"}
						onChange={(e) => handleStyleChange("boxShadowX", e.target.value)}
						className="w-full"
					/>
				</div>

				<div>
					<label className="text-xs text-slate-600 mb-1 block">
						Offset Y ({currentStyles.boxShadowY || "0"}px)
					</label>
					<input
						type="range"
						min="-20"
						max="20"
						value={currentStyles.boxShadowY || "0"}
						onChange={(e) => handleStyleChange("boxShadowY", e.target.value)}
						className="w-full"
					/>
				</div>

				<div>
					<label className="text-xs text-slate-600 mb-1 block">
						Flou ({currentStyles.boxShadowBlur || "0"}px)
					</label>
					<input
						type="range"
						min="0"
						max="50"
						value={currentStyles.boxShadowBlur || "0"}
						onChange={(e) => handleStyleChange("boxShadowBlur", e.target.value)}
						className="w-full"
					/>
				</div>

				<div>
					<label className="text-xs text-slate-600 mb-1 block">
						Étendue ({currentStyles.boxShadowSpread || "0"}px)
					</label>
					<input
						type="range"
						min="-20"
						max="20"
						value={currentStyles.boxShadowSpread || "0"}
						onChange={(e) => handleStyleChange("boxShadowSpread", e.target.value)}
						className="w-full"
					/>
				</div>

				<div>
					<label className="text-xs text-slate-600 mb-1 block">
						Opacité ({currentStyles.boxShadowOpacity || "0"}%)
					</label>
					<input
						type="range"
						min="0"
						max="100"
						value={currentStyles.boxShadowOpacity || "0"}
						onChange={(e) => handleStyleChange("boxShadowOpacity", e.target.value)}
						className="w-full"
					/>
				</div>
			</div>

			{/* Border */}
			<div className="space-y-3 pt-3 border-t border-slate-200">
				<h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
					🔲 Bordure
				</h4>

				<div>
					<label className="text-xs text-slate-600 mb-1 block">
						Type de bordure
					</label>
					<select
						value={currentStyles.borderStyle || "none"}
						onChange={(e) => handleStyleChange("borderStyle", e.target.value)}
						className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
					>
						<option value="none">Aucune</option>
						<option value="solid">Solid (pleine)</option>
						<option value="dashed">Dashed (tirets)</option>
						<option value="dotted">Dotted (pointillés)</option>
						<option value="double">Double</option>
					</select>
				</div>

						{currentStyles.borderStyle && currentStyles.borderStyle !== "none" && (
					<>
						<div>
							<label className="text-xs text-slate-600 mb-1 block">
								Épaisseur ({currentStyles.borderWidth ? currentStyles.borderWidth.replace("px", "") : "1"}px)
							</label>
							<input
								type="range"
								min="0"
								max="20"
								value={currentStyles.borderWidth ? currentStyles.borderWidth.replace("px", "") : "1"}
								onChange={(e) => handleStyleChange("borderWidth", e.target.value + "px")}
								className="w-full"
							/>
						</div>

						<div>
							<label className="text-xs text-slate-600 mb-1 block">
								Couleur
							</label>
							<div className="flex gap-2">
								<input
									type="color"
									value={currentStyles.borderColor || "#000000"}
									onChange={(e) => handleStyleChange("borderColor", e.target.value)}
									className="w-12 h-10 border border-slate-300 rounded cursor-pointer"
								/>
								<input
									type="text"
									value={currentStyles.borderColor || "#000000"}
									onChange={(e) => handleStyleChange("borderColor", e.target.value)}
									className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
									placeholder="#000000"
								/>
							</div>
						</div>
					</>
				)}
			</div>

			{/* Border Radius */}
			<div className="space-y-3 pt-3 border-t border-slate-200">
				<h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
					⭕ Border Radius
				</h4>

				<div>
					<label className="text-xs text-slate-600 mb-1 block">
						Rayon ({currentStyles.borderRadius ? currentStyles.borderRadius.replace("px", "") : "0"}px)
					</label>
					<input
						type="range"
						min="0"
						max="50"
						value={currentStyles.borderRadius ? currentStyles.borderRadius.replace("px", "") : "0"}
						onChange={(e) => handleStyleChange("borderRadius", e.target.value + "px")}
						className="w-full"
					/>
					<div className="flex justify-between text-xs text-slate-500 mt-1">
						<span>0px</span>
						<span>50px</span>
					</div>
				</div>
			</div>
		</div>
	);
}

