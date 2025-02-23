const elementColors: Record<string, string> = {
    "Hidro": "#a3c7d2",
    "Group 1": "#FF6666", // Đỏ nhạt
    "Group 2": "#FFCC66", // Vàng cam
    "Group 3": "#FFD700", // Vàng
    "Group 4": "#DAA520", // Vàng đậm
    "Group 5": "#B8860B", // Nâu vàng
    "Group 6": "#CD5C5C", // Đỏ gạch
    "Group 7": "#A52A2A", // Nâu
    "Group 8": "#4682B4", // Xanh dương thép
    "Group 9": "#4169E1", // Xanh hoàng gia
    "Group 10": "#1E90FF", // Xanh dương sáng
    "Group 11": "#00CED1", // Xanh ngọc
    "Group 12": "#20B2AA", // Xanh biển
    "Group 13": "#32CD32", // Xanh lá tươi
    "Group 14": "#228B22", // Xanh lá đậm
    "Group 15": "#2E8B57", // Xanh lục thẫm
    "Group 16": "#8FBC8F", // Xanh lá nhạt
    "Group 17": "#00FF7F", // Xanh lục sáng
    "Group 18": "#40E0D0", // Xanh ngọc lam
    "Lanthanide": "#70587C", // Tím hồng đất
    "Actinide": "#8D626A" // Hồng đỏ trầm
};


export const getElementColor = (type: string): string => {
    return elementColors[type] || "#CCCCCC";
};

  