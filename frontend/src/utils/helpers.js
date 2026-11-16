export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
};

export const generateWhatsAppUrl = (phone, items, total) => {
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '919893369932';
  let message = `Hi! I would like to place an order:\n\n`;
  items.forEach((item, index) => {
    message += `${index + 1}. ${item.name}\n   Qty: ${item.quantity} x ${formatPrice(item.price)} = ${formatPrice(item.subtotal)}\n\n`;
  });
  message += `Total: ${formatPrice(total)}\n\nPlease confirm the order. Thank you!`;
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
};

export const getStockStatus = (stock) => {
  if (stock === 0) return { label: 'Out of Stock', color: 'text-danger', available: false };
  if (stock <= 10) return { label: `Only ${stock} left`, color: 'text-brand-600', available: true };
  return { label: 'In Stock', color: 'text-success', available: true };
};

export const truncate = (str, len = 50) => str?.length > len ? str.substring(0, len) + '...' : str;
