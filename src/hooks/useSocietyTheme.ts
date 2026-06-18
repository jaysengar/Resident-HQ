import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

// Function to convert hex to HSL for Tailwind CSS variables
function hexToHSL(hex: string) {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex[1] + hex[2], 16);
    g = parseInt(hex[3] + hex[4], 16);
    b = parseInt(hex[5] + hex[6], 16);
  }
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function useSocietyTheme(slug: string | undefined) {
  const { data: society } = useQuery({
    queryKey: ["societyTheme", slug],
    queryFn: async () => {
      if (!slug) return null;
      const { data } = await supabase
        .from("societies")
        .select("primary_color, logo_url, name")
        .eq("slug", slug)
        .single();
      return data;
    },
    enabled: !!slug,
  });

  useEffect(() => {
    if (society?.primary_color) {
      const hsl = hexToHSL(society.primary_color);
      document.documentElement.style.setProperty("--primary", hsl);
    } else {
      // Revert to default primary color if not set (violet-700)
      document.documentElement.style.removeProperty("--primary");
    }
  }, [society?.primary_color]);

  return society;
}
