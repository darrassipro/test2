"use client";

import { useAppSelector } from "@/lib/hooks";
import EditorCanvas from "@/components/builder/EditorCanvas";
import { HotelDataProvider } from "@/contexts/HotelDataContext";
import { useSearchParams, useParams } from "next/navigation";
import { 
	useLazySearchRatesQuery,
	useLazyGetHotelDetailsQuery,
	useLazyGetHotelReviewsQuery
} from "@/services/api/bookingApi";
import { useEffect, useState } from "react";

export default function PreviewPage() {
	const params = useParams();
	const locale = params.locale as string;
	const searchParams = useSearchParams();
	const hotelIdFromQuery = searchParams.get("hotelId");
	const templateId = searchParams.get("templateId");
	
	// État pour stocker l'hôtel sélectionné et ses données (uniquement pour template hotel)
	const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null);
	const [selectedHotelData, setSelectedHotelData] = useState<{
		details: any;
		reviews: any[];
		rates: any;
	} | null>(null);
	const [selectedLanguage, setSelectedLanguage] = useState<string>('fr');
	const [loadingHotelId, setLoadingHotelId] = useState<string | null>(null);
	
	// Hooks pour les appels API lors de la sélection d'un hôtel
	const [fetchHotelDetails, { isFetching: hotelDetailsLoading }] = useLazyGetHotelDetailsQuery();
	const [fetchHotelReviews, { isFetching: hotelReviewsLoading }] = useLazyGetHotelReviewsQuery();
	const [fetchRates, { isFetching: ratesLoading }] = useLazySearchRatesQuery();
	
	const isHotelTemplate = templateId === "hotel";
	
	// Appeler les 3 endpoints automatiquement si hotelId est présent dans les query params
	useEffect(() => {
		if (isHotelTemplate && hotelIdFromQuery && !selectedHotelData && !loadingHotelId) {
			selectHotel(hotelIdFromQuery);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isHotelTemplate, hotelIdFromQuery]);
	
	// Fonction pour sélectionner un hôtel et récupérer ses données
	const selectHotel = async (hotelId: string) => {
		try {
			setLoadingHotelId(hotelId);
			setSelectedHotelId(hotelId);
			
			// Dates par défaut (aujourd'hui + 2 jours pour checkout)
			const today = new Date();
			const checkoutDate = new Date(today);
			checkoutDate.setDate(checkoutDate.getDate() + 2);
			
			const checkin = today.toISOString().split('T')[0];
			const checkout = checkoutDate.toISOString().split('T')[0];
			const adultsCount = 2;
			
			// Appel parallèle des 3 endpoints
			const [detailsResult, reviewsResult, ratesResult] = await Promise.all([
				// 1. getHotelDetails
				fetchHotelDetails({
					hotelId,
					language: selectedLanguage
				}).unwrap(),
				
				// 2. getHotelReviews
				fetchHotelReviews({
					hotelId,
					limit: 50,
					language: selectedLanguage
				}).unwrap(),
				
				// 3. searchRates
				fetchRates({
					hotelIds: [hotelId],
					occupancies: [{ adults: adultsCount }],
					currency: 'USD',
					guestNationality: 'US',
					checkin,
					checkout,
					roomMapping: true,
					includeHotelData: true,
					language: selectedLanguage
				}).unwrap()
			]);
			
			// Stocker les données récupérées
			setSelectedHotelData({
				details: detailsResult?.data?.data || detailsResult?.data || null,
				reviews: reviewsResult?.data?.data || reviewsResult?.data || [],
				rates: ratesResult?.data?.data?.[0] || null
			});
			
		} catch (error: any) {
			console.error("Erreur lors de la récupération des données de l'hôtel:", error);
		} finally {
			setLoadingHotelId(null);
		}
	};

	return (
		<div className="w-full min-h-screen bg-white">
			{/* Preview en plein écran avec tous les styles appliqués */}
			<div className="w-full">
				{isHotelTemplate ? (
					<HotelDataProvider hotelData={selectedHotelData} hotelId={selectedHotelId}>
						<EditorCanvas isPreview={true} />
					</HotelDataProvider>
				) : (
					<EditorCanvas isPreview={true} />
				)}
			</div>
		</div>
	);
}

