export interface MenuItem {
    id: string;
    name: string;
    price: number;
    calories?: number;
    image: string;
    category: string;
    featured?: boolean;
    rating?: number;
    isNew?: boolean;
    available?: boolean;
}

export const menuItems: MenuItem[] = [
    // MAINS
    {
        id: 'mains-1',
        name: 'Jollof Rice',
        price: 400,
        image: '/jollof-rice.jpg.jpg',
        category: 'Mains',
        featured: false,
        isNew: false,
        rating: 5
    },
    {
        id: 'mains-2',
        name: 'Fried Rice',
        price: 400,
        image: '/fried-rice.jpg.jpg',
        category: 'Mains',
        rating: 4
    },
    {
        id: 'mains-3',
        name: 'Steamed Rice',
        price: 300,
        image: '/WhatsApp Image 2026-02-05 at 6.44.36 PM.jpeg',
        category: 'Mains',
        featured: true,
        rating: 5
    },
    {
        id: 'mains-4-mini',
        name: 'Basmati Rice (Mini)',
        price: 2000,
        image: '/special basmati-rice.jpg.jpeg',
        category: 'Mains',
        rating: 5
    },
    {
        id: 'mains-4-maxi',
        name: 'Basmati Rice (Maxi)',
        price: 3500,
        image: '/special basmati-rice.jpg.jpeg',
        category: 'Mains',
        rating: 5
    },
    {
        id: 'mains-5',
        name: 'Stir Fry Pasta',
        price: 1500,
        image: '/WhatsApp Image 2026-02-05 at 6.45.21 PM.jpeg',
        category: 'Mains',
        featured: true,
        rating: 4
    },
    {
        id: 'mains-6',
        name: 'Special Stir Fry Pasta',
        price: 3000,
        image: '/special stairfry-pasta.jpg.jpeg',
        category: 'Mains',
        featured: false,
        rating: 5
    },
    {
        id: 'mains-7',
        name: 'Tomato Pasta',
        price: 1200,
        image: '/tomato-pasta.jpg.jpg',
        category: 'Mains'
    },
    {
        id: 'mains-8',
        name: 'Noodles',
        price: 800,
        image: '/WhatsApp Image 2026-02-01 at 5.06.06 AM.jpeg',
        category: 'Mains',
        featured: true,
        rating: 5
    },

    // PROTEIN & SAUCES
    {
        id: 'protein-1',
        name: 'Beef',
        price: 300,
        image: '/beef-image.jpg.jpg',
        category: 'Protein & Sauces'
    },
    {
        id: 'protein-2',
        name: 'Goat',
        price: 500,
        image: '/goat-meat.jpg.jpg',
        category: 'Protein & Sauces'
    },
    {
        id: 'protein-3',
        name: 'Sausages',
        price: 300,
        image: '/susage-image.jpg.jpg',
        category: 'Protein & Sauces'
    },
    {
        id: 'protein-4',
        name: 'Fish',
        price: 600,
        image: '/fish-image.jpg.jpg',
        category: 'Protein & Sauces'
    },
    {
        id: 'protein-5',
        name: 'Chicken',
        price: 2000,
        image: '/chicken-image.jpg.jpg',
        category: 'Protein & Sauces'
    },
    {
        id: 'protein-6',
        name: 'Egg (Boiled)',
        price: 300,
        image: '/boiled-egg.jpg.jpg',
        category: 'Protein & Sauces'
    },
    {
        id: 'protein-7',
        name: 'Egg (Fried)',
        price: 500,
        image: '/fried-egg.jpg.jpeg',
        category: 'Protein & Sauces'
    },
    {
        id: 'protein-8',
        name: 'Egg Sauce',
        price: 1200,
        image: '/egg-sauce.jpg.jpeg',
        category: 'Protein & Sauces'
    },

    // SPECIAL SAUCES
    {
        id: 'sauces-1',
        name: 'Schezwan’s Beef Sauce',
        price: 1500,
        image: '/hero-food.png',
        category: 'Special Sauces'
    },
    {
        id: 'sauces-2',
        name: 'Chicken Curry Sauce',
        price: 2000,
        image: '/hero-food.png',
        category: 'Special Sauces'
    },

    // SIDES
    {
        id: 'sides-1',
        name: 'Plantain',
        price: 300,
        image: '/plaintain-image.jpg.jpeg',
        category: 'Sides'
    },
    {
        id: 'sides-2',
        name: 'Coleslaw',
        price: 300,
        image: '/coleslaw-image.jpg.jpg',
        category: 'Sides'
    },
    {
        id: 'sides-3',
        name: 'Special Salad',
        price: 1500,
        image: '/special-salad.jpg.jpg',
        category: 'Sides'
    },

    // FRIES
    {
        id: 'fries-1',
        name: 'Yam Strips',
        price: 2000,
        image: '/yam-stripe.jpg.jpeg',
        category: 'Fries'
    },
    {
        id: 'fries-2',
        name: 'French Fries',
        price: 2000,
        image: '/french-fries.jpg.jpeg',
        category: 'Fries'
    },
    {
        id: 'fries-3',
        name: 'Plantain (Full Portion)',
        price: 1500,
        image: '/plaintain-fullportion.jpg.jpeg',
        category: 'Fries'
    },

    // PIZZA
    {
        id: 'pizza-1',
        name: '12" Pizza (Medium)',
        price: 10500,
        image: '/pizza-medium image.jpg.jpeg',
        category: 'Pizza'
    },
    {
        id: 'pizza-2',
        name: '14" Pizza (Large)',
        price: 12500,
        image: '/pizza-medium image.jpg.jpeg',
        category: 'Pizza'
    },

    // SPECIALS
    {
        id: 'specials-1',
        name: 'Hot Dog',
        price: 1000,
        image: '/hot-dog.jpg.jpeg',
        category: 'Specials'
    },
    {
        id: 'specials-2',
        name: 'Beef Shawarma',
        price: 3000,
        image: '/beef-sharwama.jpg.jpg',
        category: 'Specials'
    },
    {
        id: 'specials-3',
        name: 'Chicken Shawarma',
        price: 3300,
        image: '/chicken-Shawarma.jpg.jpg',
        category: 'Specials'
    },
    {
        id: 'specials-4',
        name: 'Regular Burger',
        price: 3500,
        image: '/regular-burger.jpg.jpg',
        category: 'Specials'
    },
    {
        id: 'specials-5',
        name: 'Cheese Burger',
        price: 4500,
        image: '/cheese-burger.jpg.jpg',
        category: 'Specials'
    },
    {
        id: 'specials-6',
        name: 'Loaded Fries',
        price: 6000,
        image: '/loaded-fries.jpg.jpeg',
        category: 'Specials'
    },
    {
        id: 'specials-7',
        name: 'Chicken Wings',
        price: 4000,
        image: '/chicken-wings.jpg.jpeg',
        category: 'Specials'
    },
    {
        id: 'takeaway-small',
        name: 'Takeaway (Small)',
        price: 200,
        image: '/hero-food.png',
        category: 'Packaging'
    },
    {
        id: 'takeaway-big',
        name: 'Takeaway (Big)',
        price: 300,
        image: '/hero-food.png',
        category: 'Packaging'
    }
];

export const categories = ['Mains', 'Protein & Sauces', 'Special Sauces', 'Sides', 'Fries', 'Pizza', 'Specials'];
