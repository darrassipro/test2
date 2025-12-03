"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar, Users } from "lucide-react";
import { BuilderNode } from "@/types/builder";
import { stylesToTailwind } from "@/lib/stylesToTailwind";

interface NodeComponentProps {
	node: BuilderNode;
	renderChildren: (children: BuilderNode[]) => JSX.Element;
	isEditing: boolean;
}

export default function SearchForm({
	node,
	renderChildren: _renderChildren,
	isEditing,
}: NodeComponentProps) {
	const [checkin, setCheckin] = useState("");
	const [checkout, setCheckout] = useState("");
	const [adults, setAdults] = useState(2);
	const [children, setChildren] = useState(0);
	const [childrenAges, setChildrenAges] = useState<number[]>([]);
	const [showCalendar, setShowCalendar] = useState(false);
	const [showGuests, setShowGuests] = useState(false);
	const calendarRef = useRef<HTMLDivElement>(null);
	const guestsRef = useRef<HTMLDivElement>(null);

	// Dates minimales
	const today = new Date().toISOString().split("T")[0];
	const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

	// Formatage des dates pour l'affichage
	const formatDate = (dateString: string) => {
		if (!dateString) return "";
		const date = new Date(dateString);
		return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
	};

	const getDateRange = () => {
		if (checkin && checkout) {
			return `${formatDate(checkin)} - ${formatDate(checkout)}`;
		}
		if (checkin) {
			return `À partir du ${formatDate(checkin)}`;
		}
		return "Dates";
	};

	// Fermer les popovers en cliquant à l'extérieur
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
				setShowCalendar(false);
			}
			if (guestsRef.current && !guestsRef.current.contains(event.target as Node)) {
				setShowGuests(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleSearch = () => {
		// Validation des dates
		if (!checkin || !checkout) {
			alert("Veuillez sélectionner les dates d'arrivée et de départ.");
			return;
		}

		// Ici, vous pouvez ajouter la logique de recherche
		// Par exemple, rediriger vers une page de résultats ou appeler une API
		const searchParams = new URLSearchParams({
			checkin,
			checkout,
			adults: adults.toString(),
			children: children.toString(),
			childrenAges: childrenAges.join(","),
		});

		console.log("Recherche avec paramètres:", searchParams.toString());
		// Exemple: router.push(`/reservation?${searchParams.toString()}`);
	};

	const baseClassName = stylesToTailwind(node.style);

	return (
		<div
			className={`${baseClassName} ${
				isEditing ? "outline outline-1 outline-blue-400" : ""
			}`}
			data-node-id={node.id}
		>
			<div className="w-full max-w-3xl mx-auto">
				{/* Barre de recherche - responsive: colonne sur mobile, ligne sur desktop */}
				<div className="bg-white rounded-full md:rounded-full shadow-xl px-4 py-2 md:py-1.5 flex flex-col md:flex-row items-stretch md:items-center gap-3">
					{/* Section paramètres - en bas sur mobile, à droite sur desktop */}
					<div className="flex items-center gap-2 md:gap-3 justify-between md:justify-start border-t md:border-t-0 pt-3 md:pt-0">
						{/* Calendrier cliquable */}
						<div className="relative flex-shrink-0 flex-1 md:flex-initial" ref={calendarRef}>
							<button
								onClick={() => {
									setShowCalendar(!showCalendar);
									setShowGuests(false);
								}}
								className="flex items-center gap-2 px-2 md:px-3 py-2 hover:bg-gray-50 rounded cursor-pointer w-full md:w-auto justify-center"
							>
								<Calendar className="text-gray-700" size={18} />
								<span className="text-gray-700 text-xs md:text-sm whitespace-nowrap hidden sm:inline">
									{getDateRange()}
								</span>
								<span className="text-gray-700 text-xs md:text-sm whitespace-nowrap sm:hidden">
									Dates
								</span>
							</button>
							{showCalendar && (
								<div className="absolute z-20 top-full left-0 md:right-0 md:left-auto mt-2 bg-white border border-gray-300 rounded-lg shadow-xl p-4 w-[calc(100vw-2rem)] md:w-auto md:min-w-[400px]">
									<div className="grid grid-cols-2 gap-4">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Arrivée
											</label>
											<input
												type="date"
												value={checkin}
												onChange={(e) => {
													setCheckin(e.target.value);
													if (e.target.value && checkout && e.target.value >= checkout) {
														setCheckout("");
													}
												}}
												min={today}
												className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E72858] focus:border-transparent"
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Départ
											</label>
											<input
												type="date"
												value={checkout}
												onChange={(e) => setCheckout(e.target.value)}
												min={checkin || tomorrow}
												className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E72858] focus:border-transparent"
											/>
										</div>
									</div>
									<button
										onClick={() => setShowCalendar(false)}
										className="mt-4 w-full bg-[#E72858] text-white py-2 rounded-lg hover:bg-[#cf2048] transition-colors"
									>
										Valider
									</button>
								</div>
							)}
						</div>

						{/* Compteur de personnes cliquable */}
						<div className="relative flex-shrink-0 flex-1 md:flex-initial" ref={guestsRef}>
							<button
								onClick={() => {
									setShowGuests(!showGuests);
									setShowCalendar(false);
								}}
								className="flex items-center gap-2 px-2 md:px-3 py-2 hover:bg-gray-50 rounded cursor-pointer w-full md:w-auto justify-center"
							>
								<Users className="text-gray-700" size={18} />
								<span className="text-gray-700 text-xs md:text-sm font-medium">
									{adults + children}
								</span>
							</button>
							{showGuests && (
								<div className="absolute z-20 top-full right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-xl p-4 w-[calc(100vw-2rem)] md:w-auto md:min-w-[250px]">
									<div className="mb-3">
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Nombre d'adultes
										</label>
										<div className="flex items-center justify-between">
											<button
												onClick={() => setAdults(Math.max(1, adults - 1))}
												className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100 font-semibold"
											>
												-
											</button>
											<span className="text-lg font-medium w-12 text-center">{adults}</span>
											<button
												onClick={() => setAdults(adults + 1)}
												className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100 font-semibold"
											>
												+
											</button>
										</div>
									</div>
									<div className="mb-3">
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Nombre d'enfants
										</label>
										<div className="flex items-center justify-between">
											<button
												onClick={() => {
													const newCount = Math.max(0, children - 1);
													setChildren(newCount);
													setChildrenAges(childrenAges.slice(0, newCount));
												}}
												className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100 font-semibold"
											>
												-
											</button>
											<span className="text-lg font-medium w-12 text-center">{children}</span>
											<button
												onClick={() => {
													setChildren(children + 1);
													setChildrenAges([...childrenAges, 5]); // Age par défaut: 5 ans
												}}
												className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100 font-semibold"
											>
												+
											</button>
										</div>
									</div>
									{children > 0 && (
										<div className="mb-3">
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Âges des enfants
											</label>
											<div className="space-y-2">
												{childrenAges.map((age, index) => (
													<div key={index} className="flex items-center gap-2">
														<span className="text-sm text-gray-600 w-20">Enfant {index + 1}:</span>
														<select
															value={age}
															onChange={(e) => {
																const newAges = [...childrenAges];
																newAges[index] = parseInt(e.target.value);
																setChildrenAges(newAges);
															}}
															className="flex-1 px-2 py-1 border border-gray-300 rounded-lg text-sm"
														>
															{Array.from({ length: 18 }, (_, i) => i).map((age) => (
																<option key={age} value={age}>
																	{age} ans
																</option>
															))}
														</select>
													</div>
												))}
											</div>
										</div>
									)}
									<button
										onClick={() => setShowGuests(false)}
										className="w-full bg-[#E72858] text-white py-2 rounded-lg hover:bg-[#cf2048] transition-colors"
									>
										Valider
									</button>
								</div>
							)}
						</div>

						{/* Bouton de recherche (rose/magenta) - visible sur desktop */}
						<button
							onClick={handleSearch}
							className="hidden md:flex bg-[#E72858] hover:bg-[#cf2048] text-white px-6 py-3 rounded-full font-semibold transition-colors flex-shrink-0 whitespace-nowrap"
						>
							Rechercher
						</button>
					</div>

					{/* Bouton de recherche (rose/magenta) - visible sur mobile */}
					<button
						onClick={handleSearch}
						className="md:hidden bg-[#E72858] hover:bg-[#cf2048] text-white px-4 py-2 rounded-full font-semibold transition-colors flex-shrink-0 w-full justify-center"
					>
						Rechercher
					</button>
				</div>
			</div>
		</div>
	);
}

