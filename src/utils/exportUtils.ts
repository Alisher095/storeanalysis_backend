// Export utility functions for CSV and PDF generation

export const downloadCSV = (data: Record<string, any>[], filename: string): void => {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadPDF = (title: string, content: string): void => {
  // Create a simple HTML-based PDF download (printable format)
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
        h1 { color: #0F766E; border-bottom: 2px solid #0F766E; padding-bottom: 10px; }
        h2 { color: #1F2937; margin-top: 30px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #E5E7EB; padding: 12px; text-align: left; }
        th { background-color: #F8FAFC; font-weight: bold; }
        tr:nth-child(even) { background-color: #F9FAFB; }
        .summary { background: #F0FDF4; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .generated { color: #6B7280; font-size: 12px; margin-top: 40px; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <h1>ShelfIQ - ${title}</h1>
      ${content}
      <p class="generated">Generated on ${new Date().toLocaleString()}</p>
    </body>
    </html>
  `;

  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(url, '_blank');
  
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print();
    };
  }
};

export const generateTableHTML = (
  headers: string[],
  rows: string[][]
): string => {
  return `
    <table>
      <thead>
        <tr>
          ${headers.map(h => `<th>${h}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${rows.map(row => `
          <tr>
            ${row.map(cell => `<td>${cell}</td>`).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
};

export const generateSummaryHTML = (items: { label: string; value: string }[]): string => {
  return `
    <div class="summary">
      ${items.map(item => `<p><strong>${item.label}:</strong> ${item.value}</p>`).join('')}
    </div>
  `;
};

// Template CSV generators
export const generateProductsTemplate = (): string => {
  const headers = ['SKU', 'Product Name', 'Category', 'Price', 'Shelf Space (m)', 'Sales Percentage'];
  const sampleRows = [
    ['GRO-001', 'Organic Whole Milk', 'Groceries', '5.99', '0.8', '4.2'],
    ['BEV-001', 'Premium Orange Juice', 'Beverages', '6.49', '0.7', '3.2'],
    ['HOU-001', 'Multi-Surface Cleaner', 'Household', '4.29', '0.4', '2.8'],
  ];
  
  return [headers.join(','), ...sampleRows.map(row => row.join(','))].join('\n');
};

export const generateSalesTemplate = (): string => {
  const headers = ['Date', 'SKU', 'Quantity', 'Total Amount', 'Store ID'];
  const sampleRows = [
    ['2024-01-15', 'GRO-001', '25', '149.75', '1'],
    ['2024-01-15', 'BEV-001', '18', '116.82', '1'],
    ['2024-01-16', 'GRO-001', '30', '179.70', '1'],
  ];
  
  return [headers.join(','), ...sampleRows.map(row => row.join(','))].join('\n');
};

export const generateCategoriesTemplate = (): string => {
  const headers = ['Category ID', 'Category Name', 'Current Space (m)', 'Target Space (m)'];
  const sampleRows = [
    ['1', 'Groceries', '45', '42'],
    ['2', 'Household', '25', '24'],
    ['3', 'Personal Care', '18', '20'],
  ];
  
  return [headers.join(','), ...sampleRows.map(row => row.join(','))].join('\n');
};

export const downloadTemplate = (type: 'products' | 'sales' | 'categories'): void => {
  let content: string;
  let filename: string;
  
  switch (type) {
    case 'products':
      content = generateProductsTemplate();
      filename = 'products_template';
      break;
    case 'sales':
      content = generateSalesTemplate();
      filename = 'sales_template';
      break;
    case 'categories':
      content = generateCategoriesTemplate();
      filename = 'categories_template';
      break;
  }
  
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
