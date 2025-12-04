"use client";

import { createContext, type ReactNode, useContext, useMemo } from "react";
import { getStrings, type Locale, type Strings } from "./strings";

const LanguageContext = createContext<Strings>(getStrings());

interface LanguageProviderProps {
	children: ReactNode;
	locale?: Locale;
}

export const LanguageProvider = ({
	children,
	locale = "en",
}: LanguageProviderProps) => {
	const value = useMemo(() => getStrings(locale), [locale]);
	return (
		<LanguageContext.Provider value={value}>
			{children}
		</LanguageContext.Provider>
	);
};

export const useStrings = () => useContext(LanguageContext);
