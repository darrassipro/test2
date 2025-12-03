"use client";

import React, { useMemo } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useHotelData } from '@/contexts/HotelDataContext';

export default function HotelReviewsSection() {
	const { hotelData } = useHotelData();
	const [currentIndex, setCurrentIndex] = React.useState(0);

	const positiveReviews = useMemo(() => {
		if (!hotelData?.reviews || !Array.isArray(hotelData.reviews)) return [];
		return hotelData.reviews.filter((review: any) => review.pros && review.pros.trim());
	}, [hotelData]);

	if (positiveReviews.length === 0) {
		return (
			<div className="text-center py-12">
				<p className="text-gray-600">Aucun avis positif disponible</p>
			</div>
		);
	}

	const nextReview = () => {
		setCurrentIndex((prev) => (prev + 1) % positiveReviews.length);
	};

	const prevReview = () => {
		setCurrentIndex((prev) => (prev - 1 + positiveReviews.length) % positiveReviews.length);
	};

	const currentReview = positiveReviews[currentIndex];

	const getRatingStatus = (rating: number) => {
		if (rating >= 9.5) return { text: 'Excellent', color: 'bg-green-600' };
		if (rating >= 8.4) return { text: 'Très bien', color: 'bg-pink-600' };
		if (rating >= 7.0) return { text: 'Bien', color: 'bg-pink-500' };
		if (rating >= 6.0) return { text: 'Moyen', color: 'bg-yellow-500' };
		return { text: 'Faible', color: 'bg-orange-500' };
	};

	const rating = currentReview.averageScore || currentReview.rating || 0;
	const ratingStatus = getRatingStatus(rating);

	return (
		<div className="relative">
			<h2 className="text-3xl font-bold text-gray-900 mb-6">Avis des clients</h2>
			
			<div className="relative bg-white rounded-lg shadow-md p-6 border border-gray-200">
				{/* Navigation */}
				{positiveReviews.length > 1 && (
					<>
						<button
							onClick={prevReview}
							className="absolute left-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors z-10"
							aria-label="Avis précédent"
						>
							<ChevronLeft size={24} className="text-gray-700" />
						</button>
						<button
							onClick={nextReview}
							className="absolute right-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors z-10"
							aria-label="Avis suivant"
						>
							<ChevronRight size={24} className="text-gray-700" />
						</button>
					</>
				)}

				{/* Contenu de l'avis */}
				<div className="px-12">
					<div className="flex items-center justify-between mb-4">
						<div className="flex items-center gap-3">
							{rating > 0 && (
								<div className="flex items-center gap-1">
									<Star className="text-yellow-500 fill-yellow-500" size={20} />
									<span className="font-bold text-lg">{rating}</span>
								</div>
							)}
							{currentReview.name && (
								<span className="text-gray-900 font-semibold">{currentReview.name}</span>
							)}
							{currentReview.country && (
								<span className="text-gray-500 text-sm">({currentReview.country.toUpperCase()})</span>
							)}
						</div>
						{rating > 0 && (
							<div className={`${ratingStatus.color} text-white px-3 py-1 rounded-full text-xs font-semibold`}>
								{ratingStatus.text}
							</div>
						)}
					</div>

					{currentReview.headline && (
						<h3 className="text-xl font-semibold text-gray-900 mb-3">{currentReview.headline}</h3>
					)}

					{currentReview.pros && (
						<div className="bg-green-50 rounded-lg p-4 mb-4">
							<div className="text-sm font-semibold text-green-700 mb-2">Points positifs</div>
							<p className="text-sm text-gray-700 whitespace-pre-line">{currentReview.pros}</p>
						</div>
					)}

					{currentReview.date && (
						<div className="text-sm text-gray-500">
							Séjour le {new Date(currentReview.date).toLocaleDateString('fr-FR', {
								year: 'numeric',
								month: 'long',
								day: 'numeric'
							})}
						</div>
					)}
				</div>

				{/* Indicateurs de pagination */}
				{positiveReviews.length > 1 && (
					<div className="flex justify-center gap-2 mt-6">
						{positiveReviews.map((_, idx) => (
							<button
								key={idx}
								onClick={() => setCurrentIndex(idx)}
								className={`h-2 rounded-full transition-all ${
									idx === currentIndex ? 'bg-[#E72858] w-8' : 'bg-gray-300 w-2'
								}`}
								aria-label={`Aller à l'avis ${idx + 1}`}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

