// Mock data for ShelfIQ Dashboard

export interface Product {
  sku: string;
  name: string;
  category: string;
  price: number;
  shelfSpace: number;
  salesPercentage: number;
  score: number; // 0-10 score for classification
  classification: 'core' | 'average' | 'tail';
  monthlySales: number[];
  storeId: string;
}

export interface Category {
  id: string;
  name: string;
  currentSpace: number;
  salesPercentage: number;
  recommendedSpace: number;
  productCount: number;
  efficiency: number;
}

export interface Store {
  id: string;
  name: string;
  location: string;
}

export interface SalesSummary {
  totalSKUs: number;
  coreItemsPercentage: number;
  averageItemsPercentage: number;
  tailItemsPercentage: number;
  totalSalesValue: number;
  avgSalesPerSKU: number;
}

export interface HeatmapZone {
  zone: string;
  category: string;
  traffic: 'high' | 'medium' | 'low';
  trafficScore: number;
  performance: number;
  x: number;
  y: number;
}

export const stores: Store[] = [
  { id: '1', name: 'Downtown Central', location: 'New York, NY' },
  { id: '2', name: 'Westside Market', location: 'Los Angeles, CA' },
  { id: '3', name: 'Harbor View', location: 'San Francisco, CA' },
  { id: '4', name: 'Riverside Plaza', location: 'Chicago, IL' },
  { id: '5', name: 'Metro Hub', location: 'Houston, TX' },
];

export const categories: Category[] = [
  { id: '1', name: 'Groceries', currentSpace: 45, salesPercentage: 38, recommendedSpace: 42, productCount: 156, efficiency: 84 },
  { id: '2', name: 'Household', currentSpace: 25, salesPercentage: 22, recommendedSpace: 24, productCount: 89, efficiency: 88 },
  { id: '3', name: 'Personal Care', currentSpace: 18, salesPercentage: 18, recommendedSpace: 20, productCount: 67, efficiency: 100 },
  { id: '4', name: 'Beverages', currentSpace: 20, salesPercentage: 15, recommendedSpace: 17, productCount: 45, efficiency: 75 },
  { id: '5', name: 'Snacks', currentSpace: 12, salesPercentage: 5, recommendedSpace: 6, productCount: 38, efficiency: 42 },
  { id: '6', name: 'Frozen Foods', currentSpace: 10, salesPercentage: 2, recommendedSpace: 3, productCount: 25, efficiency: 20 },
];

// Helper to calculate classification based on score
const getClassification = (score: number): 'core' | 'average' | 'tail' => {
  if (score >= 7) return 'core';
  if (score >= 4) return 'average';
  return 'tail';
};

// Generate random monthly sales data
const generateMonthlySales = (baseValue: number): number[] => {
  return Array(6).fill(0).map(() => Math.round(baseValue * (0.8 + Math.random() * 0.4)));
};

// Generate 120+ products with realistic data
export const products: Product[] = [
  // CORE Products (Score 7-10) - High performers
  { sku: 'GRO-001', name: 'Organic Whole Milk', category: 'Groceries', price: 5.99, shelfSpace: 0.8, salesPercentage: 4.2, score: 9.5, classification: 'core', monthlySales: generateMonthlySales(1200), storeId: '1' },
  { sku: 'GRO-002', name: 'Whole Wheat Bread', category: 'Groceries', price: 3.49, shelfSpace: 0.6, salesPercentage: 3.8, score: 9.2, classification: 'core', monthlySales: generateMonthlySales(980), storeId: '1' },
  { sku: 'GRO-003', name: 'Free Range Eggs (12pk)', category: 'Groceries', price: 4.99, shelfSpace: 0.5, salesPercentage: 3.5, score: 9.0, classification: 'core', monthlySales: generateMonthlySales(850), storeId: '1' },
  { sku: 'BEV-001', name: 'Premium Orange Juice', category: 'Beverages', price: 6.49, shelfSpace: 0.7, salesPercentage: 3.2, score: 8.8, classification: 'core', monthlySales: generateMonthlySales(720), storeId: '1' },
  { sku: 'HOU-001', name: 'Multi-Surface Cleaner', category: 'Household', price: 4.29, shelfSpace: 0.4, salesPercentage: 2.8, score: 8.5, classification: 'core', monthlySales: generateMonthlySales(620), storeId: '1' },
  { sku: 'PER-001', name: 'Natural Shampoo', category: 'Personal Care', price: 8.99, shelfSpace: 0.3, salesPercentage: 2.6, score: 8.3, classification: 'core', monthlySales: generateMonthlySales(450), storeId: '1' },
  { sku: 'GRO-004', name: 'Greek Yogurt', category: 'Groceries', price: 1.29, shelfSpace: 0.4, salesPercentage: 2.4, score: 8.1, classification: 'core', monthlySales: generateMonthlySales(1800), storeId: '1' },
  { sku: 'SNK-001', name: 'Tortilla Chips', category: 'Snacks', price: 3.99, shelfSpace: 0.5, salesPercentage: 2.2, score: 7.9, classification: 'core', monthlySales: generateMonthlySales(380), storeId: '1' },
  { sku: 'BEV-002', name: 'Sparkling Water (6pk)', category: 'Beverages', price: 5.99, shelfSpace: 0.8, salesPercentage: 2.0, score: 7.8, classification: 'core', monthlySales: generateMonthlySales(520), storeId: '1' },
  { sku: 'HOU-002', name: 'Dish Soap', category: 'Household', price: 3.49, shelfSpace: 0.3, salesPercentage: 1.9, score: 7.6, classification: 'core', monthlySales: generateMonthlySales(480), storeId: '1' },
  { sku: 'GRO-005', name: 'Butter Unsalted', category: 'Groceries', price: 4.99, shelfSpace: 0.3, salesPercentage: 1.8, score: 7.5, classification: 'core', monthlySales: generateMonthlySales(340), storeId: '1' },
  { sku: 'PER-002', name: 'Body Lotion', category: 'Personal Care', price: 7.49, shelfSpace: 0.25, salesPercentage: 1.7, score: 7.4, classification: 'core', monthlySales: generateMonthlySales(280), storeId: '1' },
  { sku: 'GRO-006', name: 'Cheddar Cheese', category: 'Groceries', price: 5.49, shelfSpace: 0.35, salesPercentage: 1.6, score: 7.3, classification: 'core', monthlySales: generateMonthlySales(420), storeId: '1' },
  { sku: 'HOU-003', name: 'Paper Towels (6 roll)', category: 'Household', price: 8.99, shelfSpace: 1.2, salesPercentage: 1.5, score: 7.2, classification: 'core', monthlySales: generateMonthlySales(220), storeId: '1' },
  { sku: 'BEV-003', name: 'Almond Milk', category: 'Beverages', price: 4.49, shelfSpace: 0.5, salesPercentage: 1.4, score: 7.1, classification: 'core', monthlySales: generateMonthlySales(380), storeId: '1' },
  { sku: 'GRO-007', name: 'Sliced Turkey Deli', category: 'Groceries', price: 7.99, shelfSpace: 0.25, salesPercentage: 1.3, score: 7.0, classification: 'core', monthlySales: generateMonthlySales(290), storeId: '1' },
  { sku: 'SNK-002', name: 'Potato Chips Classic', category: 'Snacks', price: 4.29, shelfSpace: 0.45, salesPercentage: 1.35, score: 7.2, classification: 'core', monthlySales: generateMonthlySales(350), storeId: '1' },
  { sku: 'PER-003', name: 'Toothpaste Whitening', category: 'Personal Care', price: 5.99, shelfSpace: 0.2, salesPercentage: 1.25, score: 7.1, classification: 'core', monthlySales: generateMonthlySales(400), storeId: '1' },
  { sku: 'HOU-004', name: 'Laundry Detergent', category: 'Household', price: 12.99, shelfSpace: 0.6, salesPercentage: 1.55, score: 7.4, classification: 'core', monthlySales: generateMonthlySales(180), storeId: '1' },
  { sku: 'BEV-004', name: 'Coffee Ground Medium', category: 'Beverages', price: 9.99, shelfSpace: 0.35, salesPercentage: 1.45, score: 7.3, classification: 'core', monthlySales: generateMonthlySales(220), storeId: '1' },

  // AVERAGE Products (Score 4-6.9) - Moderate performers
  { sku: 'GRO-008', name: 'Pasta Penne', category: 'Groceries', price: 2.49, shelfSpace: 0.3, salesPercentage: 0.85, score: 6.8, classification: 'average', monthlySales: generateMonthlySales(280), storeId: '1' },
  { sku: 'GRO-009', name: 'Marinara Sauce', category: 'Groceries', price: 4.99, shelfSpace: 0.35, salesPercentage: 0.82, score: 6.7, classification: 'average', monthlySales: generateMonthlySales(250), storeId: '1' },
  { sku: 'HOU-005', name: 'Trash Bags (50ct)', category: 'Household', price: 9.99, shelfSpace: 0.4, salesPercentage: 0.78, score: 6.5, classification: 'average', monthlySales: generateMonthlySales(150), storeId: '1' },
  { sku: 'PER-004', name: 'Deodorant Sport', category: 'Personal Care', price: 6.49, shelfSpace: 0.15, salesPercentage: 0.75, score: 6.4, classification: 'average', monthlySales: generateMonthlySales(180), storeId: '1' },
  { sku: 'BEV-005', name: 'Green Tea Bags', category: 'Beverages', price: 5.49, shelfSpace: 0.2, salesPercentage: 0.72, score: 6.3, classification: 'average', monthlySales: generateMonthlySales(160), storeId: '1' },
  { sku: 'SNK-003', name: 'Pretzels Salted', category: 'Snacks', price: 3.79, shelfSpace: 0.35, salesPercentage: 0.68, score: 6.1, classification: 'average', monthlySales: generateMonthlySales(140), storeId: '1' },
  { sku: 'GRO-010', name: 'Rice Basmati', category: 'Groceries', price: 6.99, shelfSpace: 0.4, salesPercentage: 0.65, score: 6.0, classification: 'average', monthlySales: generateMonthlySales(120), storeId: '1' },
  { sku: 'FRZ-001', name: 'Ice Cream Vanilla', category: 'Frozen Foods', price: 5.99, shelfSpace: 0.5, salesPercentage: 0.62, score: 5.9, classification: 'average', monthlySales: generateMonthlySales(130), storeId: '1' },
  { sku: 'HOU-006', name: 'Sponges (6pk)', category: 'Household', price: 4.49, shelfSpace: 0.15, salesPercentage: 0.58, score: 5.7, classification: 'average', monthlySales: generateMonthlySales(100), storeId: '1' },
  { sku: 'PER-005', name: 'Hand Soap Liquid', category: 'Personal Care', price: 3.99, shelfSpace: 0.2, salesPercentage: 0.55, score: 5.5, classification: 'average', monthlySales: generateMonthlySales(170), storeId: '1' },
  { sku: 'GRO-011', name: 'Honey Organic', category: 'Groceries', price: 8.99, shelfSpace: 0.15, salesPercentage: 0.52, score: 5.4, classification: 'average', monthlySales: generateMonthlySales(70), storeId: '1' },
  { sku: 'BEV-006', name: 'Apple Juice', category: 'Beverages', price: 3.99, shelfSpace: 0.5, salesPercentage: 0.48, score: 5.2, classification: 'average', monthlySales: generateMonthlySales(150), storeId: '1' },
  { sku: 'SNK-004', name: 'Popcorn Butter', category: 'Snacks', price: 4.49, shelfSpace: 0.3, salesPercentage: 0.45, score: 5.0, classification: 'average', monthlySales: generateMonthlySales(80), storeId: '1' },
  { sku: 'FRZ-002', name: 'Frozen Pizza', category: 'Frozen Foods', price: 7.99, shelfSpace: 0.6, salesPercentage: 0.42, score: 4.8, classification: 'average', monthlySales: generateMonthlySales(65), storeId: '1' },
  { sku: 'GRO-012', name: 'Olive Oil Extra Virgin', category: 'Groceries', price: 9.99, shelfSpace: 0.25, salesPercentage: 0.4, score: 4.7, classification: 'average', monthlySales: generateMonthlySales(50), storeId: '1' },
  { sku: 'HOU-007', name: 'Air Freshener', category: 'Household', price: 5.99, shelfSpace: 0.2, salesPercentage: 0.38, score: 4.5, classification: 'average', monthlySales: generateMonthlySales(80), storeId: '1' },
  { sku: 'PER-006', name: 'Razors (4pk)', category: 'Personal Care', price: 12.99, shelfSpace: 0.1, salesPercentage: 0.36, score: 4.4, classification: 'average', monthlySales: generateMonthlySales(35), storeId: '1' },
  { sku: 'GRO-013', name: 'Cereal Granola', category: 'Groceries', price: 5.49, shelfSpace: 0.4, salesPercentage: 0.35, score: 4.3, classification: 'average', monthlySales: generateMonthlySales(80), storeId: '1' },
  { sku: 'BEV-007', name: 'Lemonade', category: 'Beverages', price: 2.99, shelfSpace: 0.4, salesPercentage: 0.33, score: 4.2, classification: 'average', monthlySales: generateMonthlySales(140), storeId: '1' },
  { sku: 'SNK-005', name: 'Trail Mix', category: 'Snacks', price: 6.99, shelfSpace: 0.25, salesPercentage: 0.32, score: 4.1, classification: 'average', monthlySales: generateMonthlySales(55), storeId: '1' },
  { sku: 'FRZ-003', name: 'Frozen Vegetables Mix', category: 'Frozen Foods', price: 3.49, shelfSpace: 0.35, salesPercentage: 0.3, score: 4.0, classification: 'average', monthlySales: generateMonthlySales(110), storeId: '1' },
  { sku: 'GRO-014', name: 'Peanut Butter', category: 'Groceries', price: 4.99, shelfSpace: 0.25, salesPercentage: 0.58, score: 5.6, classification: 'average', monthlySales: generateMonthlySales(140), storeId: '1' },
  { sku: 'GRO-015', name: 'Jelly Grape', category: 'Groceries', price: 3.49, shelfSpace: 0.2, salesPercentage: 0.42, score: 4.8, classification: 'average', monthlySales: generateMonthlySales(150), storeId: '1' },
  { sku: 'HOU-008', name: 'Fabric Softener', category: 'Household', price: 7.99, shelfSpace: 0.35, salesPercentage: 0.48, score: 5.1, classification: 'average', monthlySales: generateMonthlySales(75), storeId: '1' },
  { sku: 'PER-007', name: 'Conditioner', category: 'Personal Care', price: 7.99, shelfSpace: 0.25, salesPercentage: 0.52, score: 5.3, classification: 'average', monthlySales: generateMonthlySales(80), storeId: '1' },
  { sku: 'BEV-008', name: 'Soda Cola (12pk)', category: 'Beverages', price: 6.99, shelfSpace: 0.8, salesPercentage: 0.75, score: 6.4, classification: 'average', monthlySales: generateMonthlySales(130), storeId: '1' },
  { sku: 'SNK-006', name: 'Crackers Saltine', category: 'Snacks', price: 2.99, shelfSpace: 0.3, salesPercentage: 0.38, score: 4.5, classification: 'average', monthlySales: generateMonthlySales(160), storeId: '1' },
  { sku: 'GRO-016', name: 'Flour All Purpose', category: 'Groceries', price: 3.99, shelfSpace: 0.4, salesPercentage: 0.35, score: 4.3, classification: 'average', monthlySales: generateMonthlySales(110), storeId: '1' },
  { sku: 'GRO-017', name: 'Sugar White', category: 'Groceries', price: 2.99, shelfSpace: 0.35, salesPercentage: 0.32, score: 4.1, classification: 'average', monthlySales: generateMonthlySales(135), storeId: '1' },
  { sku: 'HOU-009', name: 'Bleach', category: 'Household', price: 4.49, shelfSpace: 0.4, salesPercentage: 0.42, score: 4.7, classification: 'average', monthlySales: generateMonthlySales(120), storeId: '1' },
  { sku: 'FRZ-004', name: 'Frozen Fries', category: 'Frozen Foods', price: 4.49, shelfSpace: 0.45, salesPercentage: 0.38, score: 4.5, classification: 'average', monthlySales: generateMonthlySales(105), storeId: '1' },

  // TAIL Products (Score below 4) - Low performers
  { sku: 'GRO-018', name: 'Artisanal Olive Oil', category: 'Groceries', price: 18.99, shelfSpace: 0.3, salesPercentage: 0.15, score: 3.8, classification: 'tail', monthlySales: generateMonthlySales(8), storeId: '1' },
  { sku: 'PER-008', name: 'Organic Face Cream', category: 'Personal Care', price: 24.99, shelfSpace: 0.15, salesPercentage: 0.12, score: 3.5, classification: 'tail', monthlySales: generateMonthlySales(5), storeId: '1' },
  { sku: 'HOU-010', name: 'Eco Laundry Pods', category: 'Household', price: 15.99, shelfSpace: 0.4, salesPercentage: 0.1, score: 3.2, classification: 'tail', monthlySales: generateMonthlySales(12), storeId: '1' },
  { sku: 'FRZ-005', name: 'Acai Bowls', category: 'Frozen Foods', price: 8.99, shelfSpace: 0.35, salesPercentage: 0.08, score: 2.9, classification: 'tail', monthlySales: generateMonthlySales(6), storeId: '1' },
  { sku: 'BEV-009', name: 'Coconut Water Premium', category: 'Beverages', price: 3.99, shelfSpace: 0.25, salesPercentage: 0.06, score: 2.5, classification: 'tail', monthlySales: generateMonthlySales(18), storeId: '1' },
  { sku: 'SNK-007', name: 'Kale Chips', category: 'Snacks', price: 5.99, shelfSpace: 0.25, salesPercentage: 0.05, score: 2.2, classification: 'tail', monthlySales: generateMonthlySales(8), storeId: '1' },
  { sku: 'GRO-019', name: 'Truffle Salt', category: 'Groceries', price: 12.99, shelfSpace: 0.1, salesPercentage: 0.04, score: 1.8, classification: 'tail', monthlySales: generateMonthlySales(3), storeId: '1' },
  { sku: 'FRZ-006', name: 'Cauliflower Rice', category: 'Frozen Foods', price: 4.49, shelfSpace: 0.3, salesPercentage: 0.03, score: 1.5, classification: 'tail', monthlySales: generateMonthlySales(4), storeId: '1' },
  { sku: 'PER-009', name: 'Bamboo Toothbrush Set', category: 'Personal Care', price: 9.99, shelfSpace: 0.1, salesPercentage: 0.02, score: 1.2, classification: 'tail', monthlySales: generateMonthlySales(2), storeId: '1' },
  { sku: 'HOU-011', name: 'Beeswax Wraps', category: 'Household', price: 14.99, shelfSpace: 0.15, salesPercentage: 0.015, score: 0.8, classification: 'tail', monthlySales: generateMonthlySales(1), storeId: '1' },
  { sku: 'SNK-008', name: 'Rice Cakes Plain', category: 'Snacks', price: 2.99, shelfSpace: 0.35, salesPercentage: 0.2, score: 3.9, classification: 'tail', monthlySales: generateMonthlySales(22), storeId: '1' },
  { sku: 'SNK-009', name: 'Seaweed Snacks', category: 'Snacks', price: 4.49, shelfSpace: 0.2, salesPercentage: 0.18, score: 3.7, classification: 'tail', monthlySales: generateMonthlySales(15), storeId: '1' },
  { sku: 'FRZ-007', name: 'Organic Peas (frozen)', category: 'Frozen Foods', price: 3.99, shelfSpace: 0.4, salesPercentage: 0.25, score: 3.9, classification: 'tail', monthlySales: generateMonthlySales(45), storeId: '1' },
  { sku: 'FRZ-008', name: 'Veggie Burgers', category: 'Frozen Foods', price: 6.99, shelfSpace: 0.5, salesPercentage: 0.22, score: 3.6, classification: 'tail', monthlySales: generateMonthlySales(32), storeId: '1' },
  { sku: 'GRO-020', name: 'Quinoa Organic', category: 'Groceries', price: 7.99, shelfSpace: 0.25, salesPercentage: 0.18, score: 3.5, classification: 'tail', monthlySales: generateMonthlySales(28), storeId: '1' },
  { sku: 'GRO-021', name: 'Chia Seeds', category: 'Groceries', price: 8.99, shelfSpace: 0.15, salesPercentage: 0.14, score: 3.2, classification: 'tail', monthlySales: generateMonthlySales(20), storeId: '1' },
  { sku: 'BEV-010', name: 'Kombucha Original', category: 'Beverages', price: 4.49, shelfSpace: 0.3, salesPercentage: 0.16, score: 3.4, classification: 'tail', monthlySales: generateMonthlySales(45), storeId: '1' },
  { sku: 'BEV-011', name: 'Oat Milk Barista', category: 'Beverages', price: 5.99, shelfSpace: 0.4, salesPercentage: 0.28, score: 3.9, classification: 'tail', monthlySales: generateMonthlySales(58), storeId: '1' },
  { sku: 'PER-010', name: 'Charcoal Face Mask', category: 'Personal Care', price: 14.99, shelfSpace: 0.1, salesPercentage: 0.08, score: 2.8, classification: 'tail', monthlySales: generateMonthlySales(7), storeId: '1' },
  { sku: 'PER-011', name: 'Essential Oil Set', category: 'Personal Care', price: 19.99, shelfSpace: 0.15, salesPercentage: 0.06, score: 2.4, classification: 'tail', monthlySales: generateMonthlySales(4), storeId: '1' },
  { sku: 'HOU-012', name: 'Reusable Straws Set', category: 'Household', price: 8.99, shelfSpace: 0.1, salesPercentage: 0.05, score: 2.1, classification: 'tail', monthlySales: generateMonthlySales(7), storeId: '1' },
  { sku: 'HOU-013', name: 'Bamboo Cutting Board', category: 'Household', price: 22.99, shelfSpace: 0.3, salesPercentage: 0.04, score: 1.8, classification: 'tail', monthlySales: generateMonthlySales(2), storeId: '1' },
  { sku: 'SNK-010', name: 'Dried Mango Organic', category: 'Snacks', price: 6.99, shelfSpace: 0.2, salesPercentage: 0.12, score: 3.1, classification: 'tail', monthlySales: generateMonthlySales(22), storeId: '1' },
  { sku: 'SNK-011', name: 'Veggie Straws', category: 'Snacks', price: 4.49, shelfSpace: 0.3, salesPercentage: 0.15, score: 3.3, classification: 'tail', monthlySales: generateMonthlySales(42), storeId: '1' },
  { sku: 'FRZ-009', name: 'Dairy-Free Ice Cream', category: 'Frozen Foods', price: 7.99, shelfSpace: 0.45, salesPercentage: 0.18, score: 3.5, classification: 'tail', monthlySales: generateMonthlySales(28), storeId: '1' },
  { sku: 'FRZ-010', name: 'Gluten-Free Waffles', category: 'Frozen Foods', price: 5.49, shelfSpace: 0.35, salesPercentage: 0.1, score: 2.8, classification: 'tail', monthlySales: generateMonthlySales(23), storeId: '1' },

  // More products to reach 100+
  { sku: 'GRO-022', name: 'Almond Butter', category: 'Groceries', price: 9.99, shelfSpace: 0.2, salesPercentage: 0.42, score: 4.7, classification: 'average', monthlySales: generateMonthlySales(52), storeId: '1' },
  { sku: 'GRO-023', name: 'Maple Syrup Pure', category: 'Groceries', price: 11.99, shelfSpace: 0.15, salesPercentage: 0.35, score: 4.2, classification: 'average', monthlySales: generateMonthlySales(36), storeId: '1' },
  { sku: 'GRO-024', name: 'Coconut Oil', category: 'Groceries', price: 8.49, shelfSpace: 0.2, salesPercentage: 0.32, score: 4.0, classification: 'average', monthlySales: generateMonthlySales(48), storeId: '1' },
  { sku: 'GRO-025', name: 'Avocado Oil', category: 'Groceries', price: 12.99, shelfSpace: 0.2, salesPercentage: 0.18, score: 3.5, classification: 'tail', monthlySales: generateMonthlySales(17), storeId: '1' },
  { sku: 'GRO-026', name: 'Tahini', category: 'Groceries', price: 6.99, shelfSpace: 0.15, salesPercentage: 0.12, score: 3.0, classification: 'tail', monthlySales: generateMonthlySales(22), storeId: '1' },
  { sku: 'GRO-027', name: 'Soy Sauce', category: 'Groceries', price: 3.99, shelfSpace: 0.15, salesPercentage: 0.55, score: 5.4, classification: 'average', monthlySales: generateMonthlySales(175), storeId: '1' },
  { sku: 'GRO-028', name: 'Sriracha Sauce', category: 'Groceries', price: 4.49, shelfSpace: 0.15, salesPercentage: 0.48, score: 5.0, classification: 'average', monthlySales: generateMonthlySales(135), storeId: '1' },
  { sku: 'GRO-029', name: 'Mayonnaise', category: 'Groceries', price: 4.99, shelfSpace: 0.25, salesPercentage: 0.72, score: 6.3, classification: 'average', monthlySales: generateMonthlySales(180), storeId: '1' },
  { sku: 'GRO-030', name: 'Mustard Yellow', category: 'Groceries', price: 2.49, shelfSpace: 0.15, salesPercentage: 0.58, score: 5.6, classification: 'average', monthlySales: generateMonthlySales(290), storeId: '1' },
  { sku: 'GRO-031', name: 'Ketchup', category: 'Groceries', price: 3.49, shelfSpace: 0.2, salesPercentage: 0.85, score: 6.9, classification: 'average', monthlySales: generateMonthlySales(310), storeId: '1' },
  { sku: 'GRO-032', name: 'BBQ Sauce', category: 'Groceries', price: 3.99, shelfSpace: 0.2, salesPercentage: 0.62, score: 5.8, classification: 'average', monthlySales: generateMonthlySales(195), storeId: '1' },
  { sku: 'BEV-012', name: 'Energy Drink', category: 'Beverages', price: 2.99, shelfSpace: 0.15, salesPercentage: 0.68, score: 6.1, classification: 'average', monthlySales: generateMonthlySales(285), storeId: '1' },
  { sku: 'BEV-013', name: 'Sports Drink', category: 'Beverages', price: 1.99, shelfSpace: 0.2, salesPercentage: 0.55, score: 5.4, classification: 'average', monthlySales: generateMonthlySales(345), storeId: '1' },
  { sku: 'BEV-014', name: 'Iced Tea', category: 'Beverages', price: 2.49, shelfSpace: 0.25, salesPercentage: 0.45, score: 4.9, classification: 'average', monthlySales: generateMonthlySales(225), storeId: '1' },
  { sku: 'BEV-015', name: 'Vitamin Water', category: 'Beverages', price: 2.29, shelfSpace: 0.2, salesPercentage: 0.35, score: 4.2, classification: 'average', monthlySales: generateMonthlySales(190), storeId: '1' },
  { sku: 'HOU-014', name: 'Hand Sanitizer', category: 'Household', price: 3.99, shelfSpace: 0.15, salesPercentage: 0.62, score: 5.8, classification: 'average', monthlySales: generateMonthlySales(195), storeId: '1' },
  { sku: 'HOU-015', name: 'Disinfecting Wipes', category: 'Household', price: 5.49, shelfSpace: 0.25, salesPercentage: 0.72, score: 6.3, classification: 'average', monthlySales: generateMonthlySales(165), storeId: '1' },
  { sku: 'HOU-016', name: 'Glass Cleaner', category: 'Household', price: 3.99, shelfSpace: 0.3, salesPercentage: 0.48, score: 5.0, classification: 'average', monthlySales: generateMonthlySales(150), storeId: '1' },
  { sku: 'HOU-017', name: 'Toilet Bowl Cleaner', category: 'Household', price: 3.49, shelfSpace: 0.25, salesPercentage: 0.55, score: 5.4, classification: 'average', monthlySales: generateMonthlySales(195), storeId: '1' },
  { sku: 'HOU-018', name: 'Mop Refills', category: 'Household', price: 8.99, shelfSpace: 0.2, salesPercentage: 0.22, score: 3.8, classification: 'tail', monthlySales: generateMonthlySales(30), storeId: '1' },
  { sku: 'PER-012', name: 'Lip Balm', category: 'Personal Care', price: 2.99, shelfSpace: 0.1, salesPercentage: 0.45, score: 4.9, classification: 'average', monthlySales: generateMonthlySales(185), storeId: '1' },
  { sku: 'PER-013', name: 'Sunscreen SPF50', category: 'Personal Care', price: 9.99, shelfSpace: 0.2, salesPercentage: 0.58, score: 5.6, classification: 'average', monthlySales: generateMonthlySales(72), storeId: '1' },
  { sku: 'PER-014', name: 'Band-Aids', category: 'Personal Care', price: 4.99, shelfSpace: 0.15, salesPercentage: 0.42, score: 4.7, classification: 'average', monthlySales: generateMonthlySales(105), storeId: '1' },
  { sku: 'PER-015', name: 'Cotton Balls', category: 'Personal Care', price: 2.49, shelfSpace: 0.15, salesPercentage: 0.35, score: 4.2, classification: 'average', monthlySales: generateMonthlySales(175), storeId: '1' },
  { sku: 'PER-016', name: 'Facial Tissues', category: 'Personal Care', price: 1.99, shelfSpace: 0.25, salesPercentage: 0.65, score: 5.9, classification: 'average', monthlySales: generateMonthlySales(410), storeId: '1' },
  { sku: 'SNK-012', name: 'Granola Bars', category: 'Snacks', price: 4.99, shelfSpace: 0.3, salesPercentage: 0.58, score: 5.6, classification: 'average', monthlySales: generateMonthlySales(145), storeId: '1' },
  { sku: 'SNK-013', name: 'Fruit Snacks', category: 'Snacks', price: 3.99, shelfSpace: 0.25, salesPercentage: 0.48, score: 5.0, classification: 'average', monthlySales: generateMonthlySales(150), storeId: '1' },
  { sku: 'SNK-014', name: 'Cheese Crackers', category: 'Snacks', price: 3.49, shelfSpace: 0.3, salesPercentage: 0.55, score: 5.4, classification: 'average', monthlySales: generateMonthlySales(195), storeId: '1' },
  { sku: 'SNK-015', name: 'Cookies Chocolate', category: 'Snacks', price: 4.29, shelfSpace: 0.35, salesPercentage: 0.72, score: 6.3, classification: 'average', monthlySales: generateMonthlySales(210), storeId: '1' },
  { sku: 'SNK-016', name: 'Beef Jerky', category: 'Snacks', price: 7.99, shelfSpace: 0.2, salesPercentage: 0.42, score: 4.7, classification: 'average', monthlySales: generateMonthlySales(65), storeId: '1' },
  { sku: 'FRZ-011', name: 'Frozen Berries', category: 'Frozen Foods', price: 5.99, shelfSpace: 0.35, salesPercentage: 0.35, score: 4.2, classification: 'average', monthlySales: generateMonthlySales(73), storeId: '1' },
  { sku: 'FRZ-012', name: 'Chicken Nuggets', category: 'Frozen Foods', price: 7.49, shelfSpace: 0.45, salesPercentage: 0.48, score: 5.0, classification: 'average', monthlySales: generateMonthlySales(80), storeId: '1' },
  { sku: 'FRZ-013', name: 'Fish Sticks', category: 'Frozen Foods', price: 6.99, shelfSpace: 0.4, salesPercentage: 0.38, score: 4.5, classification: 'average', monthlySales: generateMonthlySales(68), storeId: '1' },
  { sku: 'FRZ-014', name: 'Frozen Waffles', category: 'Frozen Foods', price: 3.99, shelfSpace: 0.35, salesPercentage: 0.42, score: 4.7, classification: 'average', monthlySales: generateMonthlySales(130), storeId: '1' },
  { sku: 'FRZ-015', name: 'Ice Pops', category: 'Frozen Foods', price: 4.49, shelfSpace: 0.4, salesPercentage: 0.28, score: 3.9, classification: 'tail', monthlySales: generateMonthlySales(78), storeId: '1' },

  // Additional products for diversity
  { sku: 'GRO-033', name: 'Cream Cheese', category: 'Groceries', price: 3.99, shelfSpace: 0.2, salesPercentage: 0.72, score: 6.3, classification: 'average', monthlySales: generateMonthlySales(225), storeId: '1' },
  { sku: 'GRO-034', name: 'Sour Cream', category: 'Groceries', price: 2.99, shelfSpace: 0.2, salesPercentage: 0.58, score: 5.6, classification: 'average', monthlySales: generateMonthlySales(245), storeId: '1' },
  { sku: 'GRO-035', name: 'Cottage Cheese', category: 'Groceries', price: 3.49, shelfSpace: 0.25, salesPercentage: 0.42, score: 4.7, classification: 'average', monthlySales: generateMonthlySales(150), storeId: '1' },
  { sku: 'GRO-036', name: 'String Cheese', category: 'Groceries', price: 4.99, shelfSpace: 0.2, salesPercentage: 0.55, score: 5.4, classification: 'average', monthlySales: generateMonthlySales(138), storeId: '1' },
  { sku: 'GRO-037', name: 'Bacon', category: 'Groceries', price: 6.99, shelfSpace: 0.3, salesPercentage: 0.85, score: 6.9, classification: 'average', monthlySales: generateMonthlySales(152), storeId: '1' },
  { sku: 'GRO-038', name: 'Sausages', category: 'Groceries', price: 5.49, shelfSpace: 0.35, salesPercentage: 0.68, score: 6.1, classification: 'average', monthlySales: generateMonthlySales(155), storeId: '1' },
  { sku: 'GRO-039', name: 'Hot Dogs', category: 'Groceries', price: 4.49, shelfSpace: 0.3, salesPercentage: 0.62, score: 5.8, classification: 'average', monthlySales: generateMonthlySales(173), storeId: '1' },
  { sku: 'GRO-040', name: 'Ground Beef', category: 'Groceries', price: 7.99, shelfSpace: 0.4, salesPercentage: 1.15, score: 7.3, classification: 'core', monthlySales: generateMonthlySales(180), storeId: '1' },
  { sku: 'GRO-041', name: 'Chicken Breast', category: 'Groceries', price: 8.99, shelfSpace: 0.45, salesPercentage: 1.35, score: 7.6, classification: 'core', monthlySales: generateMonthlySales(188), storeId: '1' },
  { sku: 'GRO-042', name: 'Salmon Fillet', category: 'Groceries', price: 12.99, shelfSpace: 0.3, salesPercentage: 0.85, score: 6.9, classification: 'average', monthlySales: generateMonthlySales(82), storeId: '1' },
  { sku: 'GRO-043', name: 'Shrimp', category: 'Groceries', price: 11.99, shelfSpace: 0.25, salesPercentage: 0.68, score: 6.1, classification: 'average', monthlySales: generateMonthlySales(71), storeId: '1' },
  { sku: 'GRO-044', name: 'Bananas', category: 'Groceries', price: 0.59, shelfSpace: 0.6, salesPercentage: 1.8, score: 8.5, classification: 'core', monthlySales: generateMonthlySales(3800), storeId: '1' },
  { sku: 'GRO-045', name: 'Apples', category: 'Groceries', price: 1.49, shelfSpace: 0.5, salesPercentage: 1.45, score: 7.8, classification: 'core', monthlySales: generateMonthlySales(1220), storeId: '1' },
  { sku: 'GRO-046', name: 'Oranges', category: 'Groceries', price: 1.29, shelfSpace: 0.45, salesPercentage: 1.25, score: 7.5, classification: 'core', monthlySales: generateMonthlySales(1210), storeId: '1' },
  { sku: 'GRO-047', name: 'Grapes', category: 'Groceries', price: 3.99, shelfSpace: 0.35, salesPercentage: 0.82, score: 6.7, classification: 'average', monthlySales: generateMonthlySales(258), storeId: '1' },
  { sku: 'GRO-048', name: 'Strawberries', category: 'Groceries', price: 4.99, shelfSpace: 0.3, salesPercentage: 0.75, score: 6.4, classification: 'average', monthlySales: generateMonthlySales(188), storeId: '1' },
  { sku: 'GRO-049', name: 'Blueberries', category: 'Groceries', price: 5.99, shelfSpace: 0.25, salesPercentage: 0.58, score: 5.6, classification: 'average', monthlySales: generateMonthlySales(122), storeId: '1' },
  { sku: 'GRO-050', name: 'Avocados', category: 'Groceries', price: 1.99, shelfSpace: 0.35, salesPercentage: 0.92, score: 6.8, classification: 'average', monthlySales: generateMonthlySales(580), storeId: '1' },
];

export const monthLabels = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'];

// Calculate summary based on products
const coreCount = products.filter(p => p.classification === 'core').length;
const averageCount = products.filter(p => p.classification === 'average').length;
const tailCount = products.filter(p => p.classification === 'tail').length;

export const salesSummary: SalesSummary = {
  totalSKUs: products.length,
  coreItemsPercentage: Math.round((coreCount / products.length) * 100),
  averageItemsPercentage: Math.round((averageCount / products.length) * 100),
  tailItemsPercentage: Math.round((tailCount / products.length) * 100),
  totalSalesValue: 1284500,
  avgSalesPerSKU: 42816,
};

export const heatmapData: HeatmapZone[] = [
  // Row 1 (Front of store - high traffic)
  { zone: 'A1', category: 'Groceries', traffic: 'high', trafficScore: 92, performance: 92, x: 0, y: 0 },
  { zone: 'A2', category: 'Beverages', traffic: 'high', trafficScore: 88, performance: 88, x: 1, y: 0 },
  { zone: 'A3', category: 'Snacks', traffic: 'high', trafficScore: 85, performance: 45, x: 2, y: 0 },
  { zone: 'A4', category: 'Personal Care', traffic: 'medium', trafficScore: 65, performance: 78, x: 3, y: 0 },
  
  // Row 2 (Middle aisles)
  { zone: 'B1', category: 'Groceries', traffic: 'medium', trafficScore: 72, performance: 85, x: 0, y: 1 },
  { zone: 'B2', category: 'Household', traffic: 'medium', trafficScore: 68, performance: 72, x: 1, y: 1 },
  { zone: 'B3', category: 'Frozen Foods', traffic: 'low', trafficScore: 35, performance: 25, x: 2, y: 1 },
  { zone: 'B4', category: 'Household', traffic: 'medium', trafficScore: 62, performance: 68, x: 3, y: 1 },
  
  // Row 3 (Back of store - low traffic)
  { zone: 'C1', category: 'Frozen Foods', traffic: 'low', trafficScore: 28, performance: 18, x: 0, y: 2 },
  { zone: 'C2', category: 'Beverages', traffic: 'low', trafficScore: 32, performance: 35, x: 1, y: 2 },
  { zone: 'C3', category: 'Snacks', traffic: 'low', trafficScore: 25, performance: 22, x: 2, y: 2 },
  { zone: 'C4', category: 'Personal Care', traffic: 'low', trafficScore: 38, performance: 42, x: 3, y: 2 },
];

export const categoryPerformanceTrend = categories.map(cat => ({
  name: cat.name,
  data: monthLabels.map((_, i) => ({
    month: monthLabels[i],
    value: Math.round(cat.salesPercentage * (0.9 + Math.random() * 0.2) * 10) / 10,
  })),
}));

// Date range multipliers for filtering
export const dateRangeMultipliers: Record<string, number> = {
  '7d': 0.85,
  '30d': 1.0,
  '90d': 1.15,
  '6m': 1.25,
};

// Store performance multipliers
export const storeMultipliers: Record<string, number> = {
  '1': 1.0,    // Downtown Central - base
  '2': 0.92,   // Westside Market
  '3': 1.08,   // Harbor View
  '4': 0.88,   // Riverside Plaza
  '5': 0.95,   // Metro Hub
};
