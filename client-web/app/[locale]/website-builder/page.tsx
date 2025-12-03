"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Search, X, MapPin, Star, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useLazyListHotelsQuery } from "@/services/api/bookingApi";

export default function HomePage() {
	const router = useRouter();
	const params = useParams();
	const locale = params.locale as string || 'fr';
	const [showHotelSearchDialog, setShowHotelSearchDialog] = useState(false);
	const [hotelSearchFilters, setHotelSearchFilters] = useState({
		countryCode: "",
		cityName: "",
		hotelName: "",
	});
	const [hotelSearchResults, setHotelSearchResults] = useState<any[]>([]);
	const [hotelSearchError, setHotelSearchError] = useState("");
	const [triggerListHotels, { isFetching: hotelSearchLoading }] = useLazyListHotelsQuery();
	const [loadingHotelId, setLoadingHotelId] = useState<string | null>(null);

	// Liste des pays principaux pour la recherche d'hôtel
	const countries = [
		{ code: 'MA', name: 'Maroc' },
		{ code: 'FR', name: 'France' },
		{ code: 'US', name: 'États-Unis' },
		{ code: 'GB', name: 'Royaume-Uni' },
		{ code: 'ES', name: 'Espagne' },
		{ code: 'IT', name: 'Italie' },
		{ code: 'DE', name: 'Allemagne' },
		{ code: 'PT', name: 'Portugal' },
		{ code: 'EG', name: 'Égypte' },
		{ code: 'AE', name: 'Émirats arabes unis' },
		{ code: 'SA', name: 'Arabie saoudite' },
		{ code: 'TN', name: 'Tunisie' },
		{ code: 'DZ', name: 'Algérie' },
		{ code: 'BE', name: 'Belgique' },
		{ code: 'CH', name: 'Suisse' },
		{ code: 'NL', name: 'Pays-Bas' },
		{ code: 'CA', name: 'Canada' },
		{ code: 'AU', name: 'Australie' },
		{ code: 'JP', name: 'Japon' },
		{ code: 'CN', name: 'Chine' }
	];

	// Fonction pour obtenir le statut de la note
	const getRatingStatus = (rating: number) => {
		if (rating >= 9.5) return { text: 'Excellent', color: 'bg-green-600', textColor: 'text-white' };
		if (rating >= 8.4) return { text: 'Très bien', color: 'bg-pink-600', textColor: 'text-white' };
		if (rating >= 7.0) return { text: 'Bien', color: 'bg-pink-500', textColor: 'text-white' };
		if (rating >= 6.0) return { text: 'Moyen', color: 'bg-yellow-500', textColor: 'text-white' };
		return { text: 'Faible', color: 'bg-orange-500', textColor: 'text-white' };
	};

	// Fonction pour rechercher des hôtels
	const searchHotels = async () => {
		try {
			setHotelSearchError("");
			
			// Validation : les 3 champs sont requis
			if (!hotelSearchFilters.countryCode || !hotelSearchFilters.cityName || !hotelSearchFilters.hotelName) {
				setHotelSearchError("Veuillez remplir tous les champs (code pays, ville et nom de l'hôtel)");
				return;
			}

			const params: Record<string, string> = {
				countryCode: hotelSearchFilters.countryCode,
				cityName: hotelSearchFilters.cityName,
				hotelName: hotelSearchFilters.hotelName,
			};

			const data = await triggerListHotels(params).unwrap();

			if (data.success) {
				setHotelSearchResults(data.data?.data || []);
			} else {
				const errorMessage = data.error?.description || data.error?.message || data.message || 'Erreur lors de la recherche';
				setHotelSearchError(errorMessage);
				setHotelSearchResults([]);
			}
		} catch (err: any) {
			setHotelSearchError(err.message || 'Erreur lors de la recherche');
			setHotelSearchResults([]);
		}
	};

	// Fonction pour sélectionner un hôtel et rediriger
	const selectHotel = (hotelId: string) => {
		setLoadingHotelId(hotelId);
		// Rediriger vers la page de template avec l'ID de l'hôtel
		router.push(`/${locale}/website-builder/templates/hotel?hotelId=${hotelId}`);
	};

	// Fonction pour ouvrir le dialog de recherche
	const handleHotelTemplateClick = (e: React.MouseEvent) => {
		e.preventDefault();
		setShowHotelSearchDialog(true);
		setHotelSearchResults([]);
		setHotelSearchError("");
		setHotelSearchFilters({
			countryCode: "",
			cityName: "",
			hotelName: "",
		});
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex flex-col">
			{/* Header */}
			<header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4 sticky top-0 z-40">
				<div className="max-w-7xl mx-auto flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-lg">
							W
						</div>
						<span className="text-xl font-bold text-slate-900">Website Builder</span>
					</div>
					<nav className="flex items-center gap-6">
						<a href="#features" className="text-sm text-slate-600 hover:text-slate-900 transition">
							Fonctionnalités
						</a>
						<a href="#templates" className="text-sm text-slate-600 hover:text-slate-900 transition">
							Templates
						</a>
						<a href="#pricing" className="text-sm text-slate-600 hover:text-slate-900 transition">
							Tarifs
						</a>
						<button className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg transition">
							Connexion
						</button>
					</nav>
				</div>
			</header>

			{/* Hero Section */}
			<main className="flex-1 flex items-center justify-center px-6 py-20">
				<div className="max-w-4xl mx-auto text-center">
					{/* Badge */}
					<div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-100 text-violet-700 rounded-full text-sm font-medium mb-8">
						<span className="w-2 h-2 bg-violet-500 rounded-full animate-pulse"></span>
						Nouveau : Drag & Drop Builder
					</div>

					{/* Title */}
					<h1 className="text-6xl font-bold text-slate-900 mb-6 leading-tight">
						Créez votre site web
						<span className="block text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600">
							en quelques minutes
						</span>
					</h1>

					{/* Description */}
					<p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
						Un éditeur visuel puissant et intuitif pour créer des sites web professionnels sans écrire une seule ligne de code.
					</p>

					{/* CTA Buttons */}
					<div className="flex items-center justify-center gap-4 mb-16">
						<Link
							href="/website-builder/builder"
							className="group px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 flex items-center gap-3"
						>
							<span>Créer mon site</span>
							<svg
								className="w-5 h-5 group-hover:translate-x-1 transition-transform"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
							</svg>
						</Link>
						<button className="px-8 py-4 bg-white text-slate-700 rounded-xl font-semibold text-lg border-2 border-slate-200 hover:border-violet-300 hover:bg-slate-50 transition-all duration-200">
							Voir la démo
						</button>
					</div>

					{/* Features Grid */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
						<div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
							<div className="w-12 h-12 bg-violet-100 text-violet-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
								</svg>
							</div>
							<h3 className="font-semibold text-slate-900 mb-2">Drag & Drop</h3>
							<p className="text-sm text-slate-600">
								Glissez-déposez vos composants pour créer votre site
							</p>
						</div>

						<div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
							<div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
								</svg>
							</div>
							<h3 className="font-semibold text-slate-900 mb-2">Responsive</h3>
							<p className="text-sm text-slate-600">
								Design adaptatif pour mobile, tablette et desktop
							</p>
						</div>

						<div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
							<div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
								</svg>
							</div>
							<h3 className="font-semibold text-slate-900 mb-2">Rapide</h3>
							<p className="text-sm text-slate-600">
								Créez votre site en quelques minutes seulement
							</p>
						</div>
					</div>
				</div>
			</main>

			{/* Templates Section */}
			<section id="templates" className="bg-white py-20 px-6">
				<div className="max-w-7xl mx-auto">
					{/* Section Title */}
					<h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
						Pick a stunning template and personalize it in minutes — no coding required.
					</h2>

					{/* Templates Grid */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
						{/* Custom your website - Top Left */}
						<Link
							href="/website-builder/builder"
							className="bg-white rounded-xl p-8 flex flex-col items-center justify-center min-h-[400px] hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer border border-slate-200"
						>
							<div className="w-16 h-16 border-2 border-slate-300 rounded-lg flex items-center justify-center mb-4">
								<svg
									className="w-8 h-8 text-slate-700"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
									/>
								</svg>
							</div>
							<h3 className="text-xl font-semibold text-slate-900">Custom your website</h3>
						</Link>

						{/* Hotels - Top Middle */}
						<div
							onClick={handleHotelTemplateClick}
							className="bg-white rounded-xl p-8 flex flex-col items-center justify-center min-h-[400px] hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer border border-slate-200 relative overflow-hidden group"
						>
							{/* Preview du template Hotel */}
							<div className="w-full h-full flex flex-col">
								{/* Header preview */}
								<div className="bg-[#1A2038] px-4 py-3 flex items-center justify-between mb-4 rounded-t-lg">
									<div className="flex items-center gap-2">
										<div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center">
											<svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
											</svg>
										</div>
										<span className="text-white text-xs font-medium">Logoipsum</span>
									</div>
									<div className="flex gap-1">
										<div className="w-1 h-1 bg-white/40 rounded-full"></div>
										<div className="w-1 h-1 bg-white/40 rounded-full"></div>
										<div className="w-1 h-1 bg-white/40 rounded-full"></div>
									</div>
								</div>
								
								{/* Hero preview */}
								<div className="bg-gradient-to-br from-slate-200 to-slate-300 h-24 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
									<div className="absolute inset-0 bg-gradient-to-br from-slate-400/20 to-slate-600/20"></div>
									<div className="text-center z-10">
										<div className="w-16 h-2 bg-white/60 rounded mb-2 mx-auto"></div>
										<div className="w-24 h-1.5 bg-white/40 rounded mx-auto"></div>
									</div>
								</div>
								
								{/* Gallery preview */}
								<div className="grid grid-cols-2 gap-2">
									<div className="bg-slate-200 h-16 rounded"></div>
									<div className="bg-slate-200 h-16 rounded"></div>
									<div className="bg-slate-200 h-16 rounded"></div>
									<div className="bg-slate-200 h-16 rounded"></div>
								</div>
							</div>
							
							{/* Label */}
							<div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-3">
								<h3 className="text-xl font-bold text-[#1A2038] text-center">Hotels</h3>
							</div>
						</div>

						{/* Restaurants - Top Right (Placeholder) */}
						<div className="bg-white rounded-xl p-8 flex flex-col items-center justify-center min-h-[400px] opacity-50 border border-slate-200">
							<div className="w-full h-full flex items-center justify-center">
								<span className="text-slate-400 text-sm">Template à venir</span>
							</div>
						</div>

						{/* Travel Agency - Bottom Left (Placeholder) */}
						<div className="bg-white rounded-xl p-8 flex flex-col items-center justify-center min-h-[400px] opacity-50 border border-slate-200">
							<div className="w-full h-full flex items-center justify-center">
								<span className="text-slate-400 text-sm">Template à venir</span>
							</div>
						</div>

						{/* Empty space - Bottom Middle */}
						<div></div>

						{/* Influencer - Bottom Right (Placeholder) */}
						<div className="bg-white rounded-xl p-8 flex flex-col items-center justify-center min-h-[400px] opacity-50 border border-slate-200">
							<div className="w-full h-full flex items-center justify-center">
								<span className="text-slate-400 text-sm">Template à venir</span>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="bg-white border-t border-slate-200 px-6 py-8">
				<div className="max-w-7xl mx-auto text-center text-sm text-slate-600">
					<p>© 2024 Website Builder. Tous droits réservés.</p>
				</div>
			</footer>

			{/* Dialog de recherche d'hôtel */}
			{showHotelSearchDialog && (
				<div
					className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
					onClick={() => setShowHotelSearchDialog(false)}
				>
					<div
						className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
						onClick={(e) => e.stopPropagation()}
					>
						{/* Header du Dialog */}
						<div className="flex items-center justify-between p-6 border-b border-gray-200">
							<h2 className="text-2xl font-bold text-gray-900">
								Rechercher votre hôtel
							</h2>
							<button
								onClick={() => setShowHotelSearchDialog(false)}
								className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
							>
								<X className="w-5 h-5 text-gray-600" />
							</button>
						</div>

						{/* Formulaire de recherche */}
						<div className="p-6 border-b border-gray-200">
							<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Code pays <span className="text-[#E72858]">*</span>
									</label>
									<select
										value={hotelSearchFilters.countryCode}
										onChange={(e) => setHotelSearchFilters({ ...hotelSearchFilters, countryCode: e.target.value })}
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E72858] focus:border-transparent text-sm"
									>
										<option value="">Sélectionner un pays</option>
										{countries.map((country) => (
											<option key={country.code} value={country.code}>
												{country.name} ({country.code})
											</option>
										))}
									</select>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Ville <span className="text-[#E72858]">*</span>
									</label>
									<input
										type="text"
										value={hotelSearchFilters.cityName}
										onChange={(e) => setHotelSearchFilters({ ...hotelSearchFilters, cityName: e.target.value })}
										placeholder="Ex: Casablanca, Paris..."
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E72858] focus:border-transparent text-sm"
										onKeyPress={(e) => {
											if (e.key === 'Enter') {
												searchHotels();
											}
										}}
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Nom de l'hôtel <span className="text-[#E72858]">*</span>
									</label>
									<div className="relative">
										<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
										<input
											type="text"
											value={hotelSearchFilters.hotelName}
											onChange={(e) => setHotelSearchFilters({ ...hotelSearchFilters, hotelName: e.target.value })}
											placeholder="Ex: Marriott, Hilton..."
											className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E72858] focus:border-transparent text-sm"
											onKeyPress={(e) => {
												if (e.key === 'Enter') {
													searchHotels();
												}
											}}
										/>
									</div>
								</div>
								<div className="flex items-end">
									<button
										onClick={searchHotels}
										disabled={hotelSearchLoading || !hotelSearchFilters.countryCode || !hotelSearchFilters.cityName || !hotelSearchFilters.hotelName}
										className="w-full px-6 py-2 bg-[#E72858] text-white rounded-lg font-semibold hover:bg-[#d6204a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
									>
										{hotelSearchLoading ? (
											<>
												<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
												<span>Recherche...</span>
											</>
										) : (
											<>
												<Search size={18} />
												<span>Rechercher</span>
											</>
										)}
									</button>
								</div>
							</div>
							{hotelSearchError && (
								<div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
									<p className="text-sm text-red-800">{hotelSearchError}</p>
								</div>
							)}
						</div>

						{/* Liste des résultats avec scroll */}
						<div className="flex-1 overflow-y-auto p-6">
							{hotelSearchLoading ? (
								<div className="text-center py-12">
									<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E72858] mx-auto mb-4"></div>
									<p className="text-gray-600">Recherche en cours...</p>
								</div>
							) : hotelSearchResults.length === 0 ? (
								<div className="text-center py-12">
									<p className="text-gray-600">
										{hotelSearchFilters.countryCode || hotelSearchFilters.cityName || hotelSearchFilters.hotelName
											? "Aucun hôtel trouvé. Essayez de modifier vos critères de recherche."
											: "Remplissez les champs ci-dessus et cliquez sur Rechercher pour trouver des hôtels."}
									</p>
								</div>
							) : (
								<div className="space-y-4">
									<p className="text-sm text-gray-600 mb-4">
										{hotelSearchResults.length} résultat{hotelSearchResults.length > 1 ? 's' : ''} trouvé{hotelSearchResults.length > 1 ? 's' : ''}
									</p>
									{hotelSearchResults.map((hotel: any) => (
										<div
											key={hotel.id}
											className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group border border-gray-200"
											onClick={() => selectHotel(hotel.id)}
										>
											<div className="flex flex-col md:flex-row">
												{/* Image */}
												<div className="relative h-48 md:h-auto md:w-64 overflow-hidden">
													<Image
														src={hotel.main_photo || '/placeholder-hotel.jpg'}
														alt={hotel.name || 'Hôtel'}
														width={256}
														height={192}
														className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
													/>
													{hotel.stars && (
														<div className="absolute top-4 right-4 bg-[#E72858] text-white px-3 py-1 rounded-lg shadow-lg flex items-center gap-1">
															<Star size={16} className="fill-white" />
															<span className="font-bold">{hotel.stars}</span>
														</div>
													)}
												</div>

												{/* Contenu */}
												<div className="flex-1 p-6">
													<div className="mb-3">
														<h3 className="text-xl font-bold text-gray-900 mb-2">
															{hotel.name}
														</h3>
														<div className="flex items-center gap-4 text-gray-600 mb-2 flex-wrap">
															{hotel.address && (
																<div className="flex items-center">
																	<MapPin size={16} className="mr-1 text-[#E72858]" />
																	<span className="text-sm">
																		{hotel.address}
																		{hotel.city && `, ${hotel.city}`}
																		{hotel.country && `, ${hotel.country.toUpperCase()}`}
																	</span>
																</div>
															)}
															{hotel.rating && (() => {
																const ratingStatus = getRatingStatus(hotel.rating);
																return (
																	<div className="flex items-center gap-2">
																		<div className="flex items-center">
																			<Star size={16} className="mr-1 fill-[#E72858] text-[#E72858]" />
																			<span className="text-sm font-semibold">{hotel.rating}</span>
																		</div>
																		<div className={`flex items-center ${ratingStatus.color} ${ratingStatus.textColor} px-2 py-1 rounded-full`}>
																			<span className="text-xs font-medium">{ratingStatus.text}</span>
																		</div>
																	</div>
																);
															})()}
														</div>
													</div>

													{/* Description */}
													{hotel.hotelDescription && (
														<p
															className="text-sm text-gray-600 mb-4 line-clamp-2"
															dangerouslySetInnerHTML={{
																__html: hotel.hotelDescription.replace(/<[^>]*>/g, '').substring(0, 200) + '...'
															}}
														/>
													)}

													{/* Tags */}
													<div className="flex flex-wrap gap-2 mb-4">
														{hotel.chain && (
															<span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs rounded-md">
																{hotel.chain}
															</span>
														)}
														{hotel.city && (
															<span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-md">
																{hotel.city}
															</span>
														)}
														{hotel.stars && (
															<span className="px-3 py-1 bg-yellow-50 text-yellow-700 text-xs rounded-md">
																{hotel.stars} étoiles
															</span>
														)}
													</div>

													{/* Informations supplémentaires */}
													<div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
														{hotel.reviewCount && (
															<span>{hotel.reviewCount} avis</span>
														)}
														{hotel.currency && (
															<span>Devise: {hotel.currency}</span>
														)}
													</div>

													{/* Bouton Sélectionner */}
													<button
														onClick={(e) => {
															e.stopPropagation();
															selectHotel(hotel.id);
														}}
														disabled={loadingHotelId === hotel.id}
														className="w-full md:w-auto bg-[#E72858] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#d6204a] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
													>
														{loadingHotelId === hotel.id ? (
															<>
																<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
																<span>Redirection...</span>
															</>
														) : (
															<>
																<span>Sélectionner cet hôtel</span>
																<ArrowRight size={18} />
															</>
														)}
													</button>
												</div>
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

