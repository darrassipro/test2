"use client";

import React from 'react';
import { Star, MapPin, CheckCircle, X } from 'lucide-react';
import { useHotelData } from '@/contexts/HotelDataContext';

export default function HotelAboutSection() {
	const { hotelData } = useHotelData();

	if (!hotelData?.details) {
		return (
			<div className="text-center py-12">
				<p className="text-gray-600">Aucune donnée disponible</p>
			</div>
		);
	}

	const hotelDetails = hotelData.details;

	const getRatingStatus = (rating: number) => {
		if (rating >= 9.5) return { text: 'Excellent', color: 'bg-green-600' };
		if (rating >= 8.4) return { text: 'Très bien', color: 'bg-pink-600' };
		if (rating >= 7.0) return { text: 'Bien', color: 'bg-pink-500' };
		if (rating >= 6.0) return { text: 'Moyen', color: 'bg-yellow-500' };
		return { text: 'Faible', color: 'bg-orange-500' };
	};

	return (
		<div className="space-y-6">
			{/* Informations */}
			<div className="bg-white rounded-lg shadow-sm p-6">
				<h2 className="text-2xl font-bold mb-4">Informations</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{hotelDetails.chain && (
						<div>
							<span className="text-sm text-gray-600">Chaîne hôtelière</span>
							<p className="font-semibold text-gray-900">{hotelDetails.chain}</p>
						</div>
					)}
					{hotelDetails.hotelType && (
						<div>
							<span className="text-sm text-gray-600">Type d'hôtel</span>
							<p className="font-semibold text-gray-900">{hotelDetails.hotelType}</p>
						</div>
					)}
					{hotelDetails.currency && (
						<div>
							<span className="text-sm text-gray-600">Devise</span>
							<p className="font-semibold text-gray-900">{hotelDetails.currency}</p>
						</div>
					)}
					{hotelDetails.starRating && (
						<div>
							<span className="text-sm text-gray-600">Classification</span>
							<p className="font-semibold text-gray-900">{hotelDetails.starRating} étoiles</p>
						</div>
					)}
					{hotelDetails.latitude && hotelDetails.longitude && (
						<div>
							<span className="text-sm text-gray-600">Coordonnées</span>
							<p className="font-semibold text-gray-900">
								{hotelDetails.latitude.toFixed(4)}, {hotelDetails.longitude.toFixed(4)}
							</p>
						</div>
					)}
					{hotelDetails.zip && (
						<div>
							<span className="text-sm text-gray-600">Code postal</span>
							<p className="font-semibold text-gray-900">{hotelDetails.zip}</p>
						</div>
					)}
				</div>
			</div>

			{/* Note et Classification */}
			<div className="bg-white rounded-lg shadow-sm p-6">
				<div className="flex items-center gap-6 flex-wrap">
					{hotelDetails.rating && (
						<div className="flex items-center gap-3">
							<div className="text-4xl font-bold text-gray-900">{hotelDetails.rating}</div>
							<div>
								{(() => {
									const ratingStatus = getRatingStatus(hotelDetails.rating);
									return (
										<div className={`${ratingStatus.color} text-white px-3 py-1 rounded-full text-sm font-semibold mb-2`}>
											{ratingStatus.text}
										</div>
									);
								})()}
								<div className="text-gray-600 text-sm">
									{hotelDetails.reviewCount || hotelData.reviews?.length || 0} avis
								</div>
							</div>
						</div>
					)}
					{hotelDetails.starRating && (
						<div className="flex items-center gap-2">
							{[...Array(Math.floor(hotelDetails.starRating))].map((_, i) => (
								<Star key={i} className="text-yellow-400 fill-yellow-400" size={24} />
							))}
							<span className="font-semibold text-lg ml-2">{hotelDetails.starRating} étoiles</span>
						</div>
					)}
				</div>
			</div>

			{/* À propos de cet établissement */}
			{hotelDetails.hotelDescription && (
				<div className="bg-white rounded-lg shadow-sm p-6">
					<h2 className="text-2xl font-bold mb-4">À propos de cet établissement</h2>
					<div
						className="text-gray-700 prose max-w-none"
						dangerouslySetInnerHTML={{ __html: hotelDetails.hotelDescription }}
					/>
				</div>
			)}

			{/* Ce que les clients adorent */}
			{hotelDetails.sentiment_analysis && (
				<div className="bg-white rounded-lg shadow-sm p-6">
					<h2 className="text-2xl font-bold mb-4">Ce que les clients adorent</h2>
					{hotelDetails.sentiment_analysis.pros && hotelDetails.sentiment_analysis.pros.length > 0 && (
						<div className="mb-4">
							<ul className="space-y-2">
								{hotelDetails.sentiment_analysis.pros.map((pro: string, idx: number) => (
									<li key={idx} className="flex items-start">
										<CheckCircle className="text-green-600 mr-2 mt-1 flex-shrink-0" size={20} />
										<span className="text-gray-700">{pro}</span>
									</li>
								))}
							</ul>
						</div>
					)}
					{hotelDetails.sentiment_analysis.cons && hotelDetails.sentiment_analysis.cons.length > 0 && (
						<div>
							<h3 className="font-semibold text-gray-900 mb-2">Points à améliorer</h3>
							<ul className="space-y-2">
								{hotelDetails.sentiment_analysis.cons.map((con: string, idx: number) => (
									<li key={idx} className="flex items-start">
										<X className="text-red-600 mr-2 mt-1 flex-shrink-0" size={20} />
										<span className="text-gray-700">{con}</span>
									</li>
								))}
							</ul>
						</div>
					)}
				</div>
			)}
		</div>
	);
}

