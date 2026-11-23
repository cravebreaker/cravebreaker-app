const map = (query: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

const clinic = (name: string, address: string) => ({
  name,
  address,
  mapUrl: map(`${name}، ${address}، الأردن`),
});

export const ministryDirectory = "https://www.moh.gov.jo/AR/Pages/smoking";
export const khccClinic = clinic("عيادة الإقلاع عن التدخين · مركز الحسين للسرطان", "الجبيهة، شارع الملكة رانيا، عمّان");
export const khccDirectory = "https://www.khcc.jo/ar/tobacco-dependence-treatment-clinic";

// Suggested options from the official directory, not GPS-based distances.
export const regions = [
  { id: "jubeiha", label: "عمّان · الجبيهة", clinic: khccClinic },
  { id: "seventh", label: "عمّان · الدوار السابع", clinic: clinic("مركز صحي مرج الحمام الشامل", "مرج الحمام، عمّان") },
  { id: "abdali", label: "عمّان · العبدلي", clinic: clinic("مركز صحي عمّان الشامل", "عمّان") },
  { id: "irbid", label: "إربد", clinic: clinic("مركز صحي الصريح", "الصريح، إربد") },
  { id: "zarqa", label: "الزرقاء", clinic: clinic("مركز صحي وادي الحجر", "وادي الحجر، الزرقاء") },
  { id: "ajloun", label: "عجلون", clinic: clinic("مركز صحي عجلون الشامل", "عجلون") },
];
