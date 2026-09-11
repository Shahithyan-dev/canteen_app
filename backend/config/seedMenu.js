const MenuItem = require('../models/MenuItem');

const menuItems = [
  // SNACKS
  { name: 'Samosa (2 pcs)', description: 'Crispy fried pastry filled with spiced potatoes & peas', price: 20, category: 'snacks', rating: 4.7, prepTime: 5, imageUrl: 'https://source.unsplash.com/400x300/?samosa' },
  { name: 'Vada Pav', description: 'Mumbai-style spicy potato fritter in a soft bun', price: 25, category: 'snacks', rating: 4.8, prepTime: 5, imageUrl: 'https://source.unsplash.com/400x300/?vadapav' },
  { name: 'Bread Pakora', description: 'Golden fried bread stuffed with spiced potato filling', price: 30, category: 'snacks', rating: 4.5, prepTime: 8, imageUrl: 'https://source.unsplash.com/400x300/?pakora' },
  { name: 'Poha', description: 'Flattened rice cooked with mustard, onion & spices', price: 30, category: 'snacks', rating: 4.3, prepTime: 10, imageUrl: 'https://source.unsplash.com/400x300/?poha' },
  { name: 'Upma', description: 'Semolina cooked with vegetables and spices', price: 30, category: 'snacks', rating: 4.2, prepTime: 10, imageUrl: 'https://source.unsplash.com/400x300/?upma' },
  { name: 'Aloo Tikki', description: 'Crispy potato patties served with chutneys', price: 35, category: 'snacks', rating: 4.6, prepTime: 7, imageUrl: 'https://source.unsplash.com/400x300/?alootikki' },

  // MEALS
  { name: 'Full Meals (Veg)', description: 'Rice, dal, 2 sabzis, roti, salad & papad — complete South Indian thali', price: 80, category: 'meals', rating: 4.5, prepTime: 10, imageUrl: 'https://source.unsplash.com/400x300/?thali' },
  { name: 'Chole Bhature', description: 'Spiced chickpeas with fluffy deep-fried bread (2 pcs)', price: 70, category: 'meals', rating: 4.7, prepTime: 12, imageUrl: 'https://source.unsplash.com/400x300/?cholebhature' },
  { name: 'Rajma Chawal', description: 'Kidney bean curry with steamed basmati rice', price: 70, category: 'meals', rating: 4.6, prepTime: 10, imageUrl: 'https://source.unsplash.com/400x300/?rajmachawal' },
  { name: 'Masala Dosa', description: 'Crispy rice crepe filled with spiced potato, served with sambar & chutney', price: 60, category: 'meals', rating: 4.8, prepTime: 15, imageUrl: 'https://source.unsplash.com/400x300/?masaladosa' },
  { name: 'Paneer Butter Masala + Roti', description: 'Creamy tomato-based paneer curry with 3 rotis', price: 90, category: 'meals', rating: 4.9, prepTime: 15, imageUrl: 'https://source.unsplash.com/400x300/?paneer' },
  { name: 'Fried Rice (Veg)', description: 'Indo-Chinese style vegetable fried rice', price: 65, category: 'meals', rating: 4.4, prepTime: 12, imageUrl: 'https://source.unsplash.com/400x300/?friedrice' },

  // DRINKS
  { name: 'Masala Chai', description: 'Strong Indian spiced milk tea', price: 15, category: 'drinks', rating: 4.9, prepTime: 5, imageUrl: 'https://source.unsplash.com/400x300/?tea' },
  { name: 'Cold Coffee', description: 'Chilled blended coffee with milk and ice cream', price: 50, category: 'drinks', rating: 4.7, prepTime: 7, imageUrl: 'https://source.unsplash.com/400x300/?coldcoffee' },
  { name: 'Lassi (Sweet)', description: 'Chilled creamy yogurt drink with sugar', price: 40, category: 'drinks', rating: 4.6, prepTime: 5, imageUrl: 'https://source.unsplash.com/400x300/?lassi' },
  { name: 'Fresh Lime Soda', description: 'Refreshing lime juice with soda & a pinch of salt', price: 30, category: 'drinks', rating: 4.5, prepTime: 3, imageUrl: 'https://source.unsplash.com/400x300/?limelemonade' },
  { name: 'Mango Juice', description: 'Chilled Alphonso mango juice (250ml)', price: 35, category: 'drinks', rating: 4.4, prepTime: 3, imageUrl: 'https://source.unsplash.com/400x300/?mangojuice' },
  { name: 'Buttermilk (Chaas)', description: 'Seasoned chilled buttermilk with cumin & coriander', price: 20, category: 'drinks', rating: 4.3, prepTime: 3, imageUrl: 'https://source.unsplash.com/400x300/?buttermilk' },

  // COMBOS
  { name: 'Student Special Combo', description: 'Masala Dosa + Masala Chai + 2 Samosa — best value!', price: 85, category: 'combos', rating: 4.9, prepTime: 15, imageUrl: 'https://source.unsplash.com/400x300/?indianfood' },
  { name: 'Morning Starter', description: 'Poha + Masala Chai + Bread Pakora', price: 65, category: 'combos', rating: 4.6, prepTime: 10, imageUrl: 'https://source.unsplash.com/400x300/?breakfast' },
  { name: 'Lunch Feast', description: 'Full Meals + Cold Coffee + Aloo Tikki', price: 120, category: 'combos', rating: 4.7, prepTime: 15, imageUrl: 'https://source.unsplash.com/400x300/?lunch' },
  { name: 'Snack Attack', description: 'Vada Pav + Samosa (2) + Lassi — evening special', price: 75, category: 'combos', rating: 4.8, prepTime: 8, imageUrl: 'https://source.unsplash.com/400x300/?snacks' },
];

const seedMenu = async () => {
  try {
    const count = await MenuItem.countDocuments();
    if (count === 0) {
      await MenuItem.insertMany(menuItems);
      console.log(`🍱 Seeded ${menuItems.length} menu items successfully!`);
    } else {
      console.log(`🍱 Menu already has ${count} items — skipping seed.`);
    }
  } catch (error) {
    console.error('❌ Menu seeding failed:', error.message);
  }
};

module.exports = seedMenu;
