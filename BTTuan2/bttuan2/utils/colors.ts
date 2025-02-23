const elementColors: Record<string, string> = {
    "Hidro": "#a3c7d2",
    "Group 1": "#ebbfd8", 
    "Group 2": "#910048", 
    "Group 3": "#5bc2e7",
    "Group 4": "#5bc2e7",
    "Group 5": "#5bc2e7", 
    "Group 6": "#5bc2e7", 
    "Group 7": "#5bc2e7", 
    "Group 8": "#5bc2e7",
    "Group 9": "#5bc2e7",
    "Group 10": "#5bc2e7",
    "Group 11": "#5bc2e7",
    "Group 12": "#5bc2e7", 
    "Group 13": "#cedc00", 
    "Group 14": "#d1a2cb",
    "Group 15": "#e84393",
    "Group 16": "#f0b323", 
    "Group 17": "#eab37f", 
    "Group 18": "#eada24",  
    "Lanthanide": "#00b894", 
    "Actinide": "#8D626A"
};


export const getElementColor = (type: string): string => {
    return elementColors[type] || "#CCCCCC";
};

  