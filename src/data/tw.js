export const TW = {
    blue: {
      text600: "text-blue-600",
      text400: "text-blue-400",
      bg50: "bg-blue-50",
      bg100: "bg-blue-100",
      bg600: "bg-blue-600",
      bg700: "bg-blue-700",
      border200: "border-blue-200",
      border300: "border-blue-300",
      ring100: "ring-blue-100",
      shadow200: "shadow-blue-200",
      fill: "fill-blue-600",
    },
    indigo: {
      text600: "text-indigo-600",
      text400: "text-indigo-400",
      bg50: "bg-indigo-50",
      bg100: "bg-indigo-100",
      bg600: "bg-indigo-600",
      bg700: "bg-indigo-700",
      border200: "border-indigo-200",
      border300: "border-indigo-300",
      ring100: "ring-indigo-100",
      shadow200: "shadow-indigo-200",
      fill: "fill-indigo-600",
    },
    red: {
      text600: "text-red-600",
      text400: "text-red-400",
      bg50: "bg-red-50",
      bg100: "bg-red-100",
      bg600: "bg-red-600",
      bg700: "bg-red-700",
      border200: "border-red-200",
      border300: "border-red-300",
      ring100: "ring-red-100",
      shadow200: "shadow-red-200",
      fill: "fill-red-600",
    },
  };
  
  export const tw = (color = "blue") => TW[color] || TW.blue;
  