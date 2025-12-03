"use client";

import React, { createContext, useContext, ReactNode } from 'react';

interface HotelData {
	details: any;
	reviews: any[];
	rates: any;
}

interface HotelDataContextType {
	hotelData: HotelData | null;
	hotelId: string | null;
}

const HotelDataContext = createContext<HotelDataContextType>({
	hotelData: null,
	hotelId: null,
});

export const useHotelData = () => useContext(HotelDataContext);

interface HotelDataProviderProps {
	children: ReactNode;
	hotelData: HotelData | null;
	hotelId: string | null;
}

export function HotelDataProvider({ children, hotelData, hotelId }: HotelDataProviderProps) {
	return (
		<HotelDataContext.Provider value={{ hotelData, hotelId }}>
			{children}
		</HotelDataContext.Provider>
	);
}

