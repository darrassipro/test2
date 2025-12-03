"use client";

import React, { useMemo } from 'react';
import Image from 'next/image';
import { Bed, Users, Star } from 'lucide-react';
import { useHotelData } from '@/contexts/HotelDataContext';

export default function HotelRoomsSection() {
	const { hotelData } = useHotelData();

	const groupedRates = useMemo(() => {
		if (!hotelData?.rates?.roomTypes) return {};
		const grouped: Record<string, any> = {};

		hotelData.rates.roomTypes.forEach((roomType: any) => {
			roomType.rates?.forEach((rate: any) => {
				const roomId = rate.mappedRoomId || roomType.roomTypeId || 'other';
				if (!grouped[roomId]) {
					grouped[roomId] = {
						roomName: rate.name || 'Chambre',
						roomImage: roomType.roomImage || hotelData.details?.rooms?.find((room: any) => room.id === roomId)?.photos?.[0]?.url,
						rates: []
					};
				}
				grouped[roomId].rates.push({
					...rate,
					offerId: roomType.offerId
				});
			});
		});

		return grouped;
	}, [hotelData]);

	if (!hotelData?.rates) {
		return (
			<div className="text-center py-12">
				<p className="text-gray-600">Aucune donnée de chambres disponible</p>
			</div>
		);
	}

	const rooms = Object.values(groupedRates);

	if (rooms.length === 0) {
		return (
			<div className="text-center py-12">
				<p className="text-gray-600">Aucune chambre disponible</p>
			</div>
		);
	}

	const formatCurrency = (amount: number, currency: string) => {
		if (!amount && amount !== 0) return 'N/A';
		return new Intl.NumberFormat('fr-FR', {
			style: 'currency',
			currency: currency || 'USD',
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		}).format(amount);
	};

	return (
		<div className="space-y-6">
			<h2 className="text-3xl font-bold text-gray-900 mb-6">Types de chambres</h2>
			<div className="space-y-6">
				{rooms.map((room: any, idx: number) => {
					const firstRate = room.rates[0];
					const totalPrice = firstRate?.retailRate?.total?.[0];
					const price = totalPrice?.amount;
					const currency = totalPrice?.currency || 'USD';

					return (
						<div
							key={idx}
							className="border border-gray-200 rounded-lg p-4 hover:border-[#E72858] hover:shadow-md transition-all"
						>
							<div className="flex gap-4">
								{room.roomImage && (
									<div className="w-32 h-24 relative flex-shrink-0">
										<Image
											src={room.roomImage}
											alt={room.roomName}
											fill
											className="object-cover rounded"
										/>
									</div>
								)}
								<div className="flex-1">
									<h3 className="font-semibold text-lg mb-2">{room.roomName}</h3>
									<div className="flex flex-wrap gap-2 mb-2">
										{firstRate?.maxOccupancy && (
											<span className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded flex items-center gap-1">
												<Users size={12} />
												Jusqu'à {firstRate.maxOccupancy} personnes
											</span>
										)}
										{firstRate?.adultCount && (
											<span className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
												{firstRate.adultCount} adulte{firstRate.adultCount > 1 ? 's' : ''}
											</span>
										)}
										{firstRate?.boardName && (
											<span className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
												{firstRate.boardName}
											</span>
										)}
									</div>
									<div className="text-lg font-bold text-[#E72858]">
										À partir de {formatCurrency(price || 0, currency)}
									</div>
									<div className="text-sm text-gray-600 mt-1">
										{room.rates.length} option{room.rates.length > 1 ? 's' : ''} disponible{room.rates.length > 1 ? 's' : ''}
									</div>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}

