"use client";

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, Play } from 'lucide-react';
import { useHotelData } from '@/contexts/HotelDataContext';

export default function HotelGallerySection() {
	const { hotelData } = useHotelData();
	const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

	const allMedia = useMemo(() => {
		if (!hotelData?.details) return [];
		const media: Array<{ type: 'image' | 'video'; url: string; thumbnail?: string }> = [];

		// Images de l'hôtel
		if (Array.isArray(hotelData.details.hotelImages)) {
			hotelData.details.hotelImages.forEach((img: any) => {
				if (img?.url) {
					media.push({ type: 'image', url: img.url });
				}
			});
		}

		// Photos des chambres
		if (Array.isArray(hotelData.details.rooms)) {
			hotelData.details.rooms.forEach((room: any) => {
				if (Array.isArray(room.photos)) {
					room.photos.forEach((photo: any) => {
						if (photo?.url) {
							media.push({ type: 'image', url: photo.url });
						}
					});
				}
			});
		}

		// Vidéos
		if (Array.isArray(hotelData.details.videos)) {
			hotelData.details.videos.forEach((video: any) => {
				if (video?.url) {
					media.push({
						type: 'video',
						url: video.url,
						thumbnail: video.thumbnail || hotelData.details.hotelImages?.[0]?.url
					});
				}
			});
		}

		return media;
	}, [hotelData]);

	if (allMedia.length === 0) {
		return (
			<div className="text-center py-12">
				<p className="text-gray-600">Aucune photo disponible</p>
			</div>
		);
	}

	const mainImage = allMedia[0]?.url || '/placeholder-hotel.jpg';
	const thumbnailImages = allMedia.slice(1, 5);
	const remainingCount = allMedia.length - 5;

	return (
		<>
			<div className="relative max-w-7xl mx-auto">
				{allMedia.length > 0 ? (
					<div className="grid grid-cols-4 gap-2 h-[500px]">
						{/* Image principale */}
						<div
							className="col-span-4 md:col-span-2 row-span-2 relative cursor-pointer group overflow-hidden rounded-tl-lg rounded-bl-lg"
							onClick={() => setSelectedImageIndex(0)}
						>
							{allMedia[0].type === 'video' ? (
								<>
									<Image
										src={allMedia[0].thumbnail || mainImage}
										alt="Video thumbnail"
										fill
										className="object-cover group-hover:scale-105 transition-transform duration-300"
									/>
									<div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
										<div className="bg-white bg-opacity-90 rounded-full p-4">
											<Play className="text-[#E72858]" size={48} fill="#E72858" />
										</div>
									</div>
								</>
							) : (
								<Image
									src={mainImage}
									alt="Hôtel"
									fill
									className="object-cover group-hover:scale-105 transition-transform duration-300"
								/>
							)}
						</div>

						{/* Miniatures */}
						{thumbnailImages.map((media, idx) => (
							<div
								key={idx}
								className="relative cursor-pointer group overflow-hidden rounded"
								onClick={() => setSelectedImageIndex(idx + 1)}
							>
								{media.type === 'video' ? (
									<>
										<Image
											src={media.thumbnail || mainImage}
											alt="Video thumbnail"
											fill
											className="object-cover group-hover:scale-110 transition-transform duration-300"
										/>
										<div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
											<Play className="text-white" size={24} fill="white" />
										</div>
									</>
								) : (
									<Image
										src={media.url}
										alt={`Image ${idx + 2}`}
										fill
										className="object-cover group-hover:scale-110 transition-transform duration-300"
									/>
								)}
								{idx === 3 && remainingCount > 0 && (
									<div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center text-white font-bold text-lg hover:bg-opacity-80 transition-all">
										+{remainingCount} photos
									</div>
								)}
							</div>
						))}
					</div>
				) : (
					<div className="relative h-[500px] w-full">
						<Image
							src={mainImage}
							alt="Hôtel"
							fill
							className="object-cover"
						/>
					</div>
				)}
			</div>

			{/* Modal de galerie */}
			{selectedImageIndex !== null && (
				<div
					className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4"
					onClick={() => setSelectedImageIndex(null)}
				>
					<div className="relative max-w-7xl w-full h-full flex items-center justify-center">
						<button
							onClick={() => setSelectedImageIndex(null)}
							className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 transition-all"
						>
							<X size={28} />
						</button>
						{selectedImageIndex > 0 && (
							<button
								onClick={(e) => {
									e.stopPropagation();
									setSelectedImageIndex(selectedImageIndex - 1);
								}}
								className="absolute left-4 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-3 hover:bg-opacity-70 transition-all"
							>
								<ChevronLeft size={28} />
							</button>
						)}
						{selectedImageIndex < allMedia.length - 1 && (
							<button
								onClick={(e) => {
									e.stopPropagation();
									setSelectedImageIndex(selectedImageIndex + 1);
								}}
								className="absolute right-4 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-3 hover:bg-opacity-70 transition-all"
							>
								<ChevronRight size={28} />
							</button>
						)}
						<div className="relative w-full h-full max-h-[90vh] flex items-center justify-center">
							{allMedia[selectedImageIndex]?.type === 'video' ? (
								<video
									src={allMedia[selectedImageIndex].url}
									controls
									autoPlay
									className="w-full h-full max-h-[90vh] object-contain"
									onClick={(e) => e.stopPropagation()}
								/>
							) : (
								<Image
									src={allMedia[selectedImageIndex]?.url || mainImage}
									alt={`Image ${selectedImageIndex + 1}`}
									fill
									className="object-contain"
									onClick={(e) => e.stopPropagation()}
								/>
							)}
						</div>
						<div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
							{selectedImageIndex + 1} / {allMedia.length}
						</div>
					</div>
				</div>
			)}
		</>
	);
}

