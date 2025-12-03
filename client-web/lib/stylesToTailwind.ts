// Conversion des styles CSS en classes Tailwind

// Mapping des valeurs de padding/margin en unités Tailwind
const spacingMap: Record<string, string> = {
	"0px": "0",
	"4px": "1",
	"8px": "2",
	"12px": "3",
	"16px": "4",
	"20px": "5",
	"24px": "6",
	"32px": "8",
	"40px": "10",
	"48px": "12",
	"64px": "16",
	"80px": "20",
	"96px": "24",
};

// Mapping des couleurs communes
const colorMap: Record<string, string> = {
	"#ffffff": "white",
	"#000000": "black",
	"#f3f4f6": "gray-100",
	"#e5e7eb": "gray-200",
	"#d1d5db": "gray-300",
	"#9ca3af": "gray-400",
	"#6b7280": "gray-500",
	"#4b5563": "gray-600",
	"#374151": "gray-700",
	"#1f2937": "gray-800",
	"#111827": "gray-900",
};

// Convertir une valeur de spacing
function convertSpacing(value: string): string {
	return spacingMap[value] || value.replace("px", "");
}

// Convertir une couleur
function convertColor(value: string): string {
	const lowerValue = value.toLowerCase();
	return colorMap[lowerValue] || `[${value}]`;
}

// Convertir les styles CSS en classes Tailwind
export function stylesToTailwind(styles: Record<string, string>, excludeInlineStyles = true): string {
	const classes: string[] = [];

	Object.entries(styles).forEach(([key, value]) => {
		// Exclure flexDirection et flexWrap car ils sont appliqués en inline pour garantir leur priorité
		// Cela évite les conflits entre classes Tailwind et styles inline
		if (key === "flexDirection" || key === "flexWrap") {
			return; // Ignorer - sera appliqué en style inline
		}
		
		// Exclure le padding car il est appliqué en style inline pour garantir qu'il fonctionne en mode Edit
		// Les styles inline ont la priorité sur les classes Tailwind
		if (key === "padding" || key === "paddingTop" || key === "paddingBottom" || 
			key === "paddingLeft" || key === "paddingRight") {
			return; // Ignorer - sera appliqué en style inline
		}
		
		// Ne plus exclure width et height - ils sont maintenant gérés via Tailwind
		// Le paramètre excludeInlineStyles est conservé pour compatibilité mais width/height sont toujours convertis
		// if (excludeInlineStyles && (key === "width" || key === "height")) {
		// 	return; // SUPPRIMÉ : width/height doivent être convertis en classes Tailwind
		// }

		switch (key) {
			// Display
			case "display":
				if (value === "flex") classes.push("flex");
				if (value === "grid") classes.push("grid");
				if (value === "block") classes.push("block");
				if (value === "inline-block") classes.push("inline-block");
				if (value === "none") classes.push("hidden");
				break;

			// Flexbox Direction
			case "flexDirection":
				if (value === "row") classes.push("flex-row");
				if (value === "column") classes.push("flex-col");
				if (value === "row-reverse") classes.push("flex-row-reverse");
				if (value === "column-reverse") classes.push("flex-col-reverse");
				break;

			// Flexbox Wrap
			case "flexWrap":
				if (value === "wrap") classes.push("flex-wrap");
				if (value === "nowrap") classes.push("flex-nowrap");
				if (value === "wrap-reverse") classes.push("flex-wrap-reverse");
				break;

			// Justify Content
			case "justifyContent":
				if (value === "flex-start" || value === "start")
					classes.push("justify-start");
				if (value === "flex-end" || value === "end") classes.push("justify-end");
				if (value === "center") classes.push("justify-center");
				if (value === "space-between") classes.push("justify-between");
				if (value === "space-around") classes.push("justify-around");
				if (value === "space-evenly") classes.push("justify-evenly");
				break;

			// Align Items
			case "alignItems":
				if (value === "flex-start" || value === "start")
					classes.push("items-start");
				if (value === "flex-end" || value === "end") classes.push("items-end");
				if (value === "center") classes.push("items-center");
				if (value === "stretch") classes.push("items-stretch");
				if (value === "baseline") classes.push("items-baseline");
				break;

			// Gap
			case "gap":
				const gapValue = convertSpacing(value);
				classes.push(`gap-${gapValue}`);
				break;
			case "rowGap":
				if (value && value.trim() !== "") {
					const rowGapValue = convertSpacing(value);
					classes.push(`gap-y-${rowGapValue}`);
				}
				break;
			case "columnGap":
				if (value && value.trim() !== "") {
					const columnGapValue = convertSpacing(value);
					classes.push(`gap-x-${columnGapValue}`);
				}
				break;

			// Padding
			case "padding":
				const paddingValue = convertSpacing(value);
				classes.push(`p-${paddingValue}`);
				break;
			case "paddingTop":
				const ptValue = convertSpacing(value);
				classes.push(`pt-${ptValue}`);
				break;
			case "paddingRight":
				const prValue = convertSpacing(value);
				classes.push(`pr-${prValue}`);
				break;
			case "paddingBottom":
				const pbValue = convertSpacing(value);
				classes.push(`pb-${pbValue}`);
				break;
			case "paddingLeft":
				const plValue = convertSpacing(value);
				classes.push(`pl-${plValue}`);
				break;

			// Margin
			case "margin":
				const marginValue = convertSpacing(value);
				classes.push(`m-${marginValue}`);
				break;
			case "marginTop":
				const mtValue = convertSpacing(value);
				classes.push(`mt-${mtValue}`);
				break;
			case "marginRight":
				const mrValue = convertSpacing(value);
				classes.push(`mr-${mrValue}`);
				break;
			case "marginBottom":
				const mbValue = convertSpacing(value);
				classes.push(`mb-${mbValue}`);
				break;
			case "marginLeft":
				const mlValue = convertSpacing(value);
				classes.push(`ml-${mlValue}`);
				break;

			// Background Color - Ne plus convertir en classe Tailwind
			// backgroundColor est maintenant appliqué en style inline pour supporter toutes les couleurs
			case "backgroundColor":
				// Ignorer - sera appliqué en style inline
				break;
			
			// Background Image - Ne plus convertir en classe Tailwind
			// backgroundImage est maintenant appliqué en style inline
			case "backgroundImage":
				// Ignorer - sera appliqué en style inline
				break;

			// Width
			case "width":
				if (!value || value === "undefined" || value === "null") break;
				if (value === "100%") classes.push("w-full");
				else if (value === "auto") classes.push("w-auto");
				else if (typeof value === "string" && value.includes("%")) {
					// Gérer les pourcentages (ex: "50%", "75%")
					const percentValue = value.replace("%", "").trim();
					if (percentValue && !isNaN(Number(percentValue))) {
						classes.push(`w-[${value}]`);
					}
				} else if (typeof value === "string" && value.includes("px")) {
					const widthValue = value.replace("px", "").trim();
					if (widthValue && !isNaN(Number(widthValue))) {
						classes.push(`w-[${widthValue}px]`);
					}
				}
				break;

			// Max Width
			case "maxWidth":
				if (value === "none") classes.push("max-w-none");
				else if (value === "sm") classes.push("max-w-sm");
				else if (value === "md") classes.push("max-w-md");
				else if (value === "lg") classes.push("max-w-lg");
				else if (value === "xl") classes.push("max-w-xl");
				else if (value === "2xl") classes.push("max-w-2xl");
				else if (value === "4xl") classes.push("max-w-4xl");
				else if (value === "7xl") classes.push("max-w-7xl");
				else classes.push(`max-w-[${value}]`);
				break;

			// Height
			case "height":
				if (!value || value === "undefined" || value === "null") break;
				if (value === "100vh") classes.push("h-screen");
				else if (value === "auto") classes.push("h-auto");
				else if (value === "100%") classes.push("h-full");
				else if (typeof value === "string" && value.includes("px")) {
					const heightValue = value.replace("px", "").trim();
					if (heightValue && !isNaN(Number(heightValue))) {
						classes.push(`h-[${heightValue}px]`);
					}
				}
				break;

			// Min Height
			case "minHeight":
				if (value === "100vh") classes.push("min-h-screen");
				else if (value.includes("px")) {
					const minHeightValue = value.replace("px", "");
					classes.push(`min-h-[${minHeightValue}px]`);
				}
				break;

			// Border Radius
			case "borderRadius":
				if (value === "0") classes.push("rounded-none");
				else if (value === "4px") classes.push("rounded");
				else if (value === "8px") classes.push("rounded-lg");
				else if (value === "12px") classes.push("rounded-xl");
				else if (value === "9999px") classes.push("rounded-full");
				break;

			// Text Color
			case "color":
				const textColor = convertColor(value);
				classes.push(`text-${textColor}`);
				break;

			// Font Size
			case "fontSize":
				if (value === "12px") classes.push("text-xs");
				else if (value === "14px") classes.push("text-sm");
				else if (value === "16px") classes.push("text-base");
				else if (value === "18px") classes.push("text-lg");
				else if (value === "20px") classes.push("text-xl");
				else if (value === "24px") classes.push("text-2xl");
				else if (value === "30px") classes.push("text-3xl");
				break;

			// Font Weight
			case "fontWeight":
				if (value === "300") classes.push("font-light");
				else if (value === "400") classes.push("font-normal");
				else if (value === "500") classes.push("font-medium");
				else if (value === "600") classes.push("font-semibold");
				else if (value === "700") classes.push("font-bold");
				break;

			// Text Align
			case "textAlign":
				if (value === "left") classes.push("text-left");
				else if (value === "center") classes.push("text-center");
				else if (value === "right") classes.push("text-right");
				break;

			default:
				// Ignorer les propriétés non supportées pour l'instant
				break;
		}
	});

	return classes.join(" ");
}

// Combiner les styles de plusieurs breakpoints
export function getResponsiveClasses(
	styles: Record<string, Record<string, string>>,
	currentBreakpoint: "desktop" | "tablet" | "mobile"
): string {
	const baseClasses = stylesToTailwind(styles.desktop || {});
	const tabletClasses = styles.tablet
		? stylesToTailwind(styles.tablet)
				.split(" ")
				.map((c) => `md:${c}`)
				.join(" ")
		: "";
	const mobileClasses = styles.mobile
		? stylesToTailwind(styles.mobile)
				.split(" ")
				.map((c) => `sm:${c}`)
				.join(" ")
		: "";

	return `${baseClasses} ${tabletClasses} ${mobileClasses}`.trim();
}

