import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.restaurantTable.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.foodItem.deleteMany();
  await prisma.category.deleteMany();


  // Create Categories
  const mainCourse = await prisma.category.create({
    data: { name: 'Main Course', description: 'Delicious curries and gravies' },
  });
  const breads = await prisma.category.create({
    data: { name: 'Breads', description: 'Freshly baked Indian breads' },
  });
  const starters = await prisma.category.create({
    data: { name: 'Starters', description: 'Appetizers and quick bites' },
  });
  const desserts = await prisma.category.create({
    data: { name: 'Desserts', description: 'Sweet treats' },
  });
  const beverages = await prisma.category.create({
    data: { name: 'Beverages', description: 'Refreshing drinks' },
  });

  // Create Food Items with images from Stitch UI
  const foodItems = [
    {
      name: 'Murgh Makhani',
      categoryId: mainCourse.id,
      price: 450,
      description: 'Rich orange creamy chicken curry served with cilantro',
      isVeg: false,
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuA_KKvjJIn1I6dsUovZkMvqNMMv1VaiZpZQ9EhbDjqPHheP-ShY2Y1DeNgHOOCtH_XIkkUh2CTlfGjNqot60pxAZy7j1_DoSGGMIyzCXJHJXq27LXFaOQlL6mRT1_mP8K9bVYnLy6XFO71D-PHCeYemZ3jTVNe_dxDyCP8Joqd5QZeLAQVY_KuFxmEBwOvLmAZe5_QT2I5v4rxg-bAxPi4WsPLvCYvDfDNHFWsvfhoyj3nF0judrNfTXA',
      isAvailable: true,
      totalSold: 1245,
    },
    {
      name: 'Paneer Tikka Masala',
      categoryId: mainCourse.id,
      price: 380,
      description: 'Cottage cheese cubes cooked in spicy red tomato gravy',
      isVeg: true,
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBRdloxiUSZvzaTjAJrNvzH8mQNBqBfCdgh8SjyaYmHCJyCkqytfFqpkCU1mzSyEI5l5N5oIKwZDROBft3MfSLjypKdAPcDYbHsn2i19L5IguDiwyCxC_qIBZK5VJJHfMkzBoBWBEB9a8M3myli-jRylp-BS0HVOdshE5hU9vRUdsEuJYESNRkybqmAwxz8zhCgb8bO5JDE2SlcFMvHqEkhjtGRSIF5pnOVkBU_jUQ-fko2CLVOvic7mg',
      isAvailable: true,
      totalSold: 982,
    },
    {
      name: 'Chicken Biryani',
      categoryId: mainCourse.id,
      price: 180,
      description: 'Authentic aromatic basmati rice dum biryani with spices',
      isVeg: false,
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuA_KKvjJIn1I6dsUovZkMvqNMMv1VaiZpZQ9EhbDjqPHheP-ShY2Y1DeNgHOOCtH_XIkkUh2CTlfGjNqot60pxAZy7j1_DoSGGMIyzCXJHJXq27LXFaOQlL6mRT1_mP8K9bVYnLy6XFO71D-PHCeYemZ3jTVNe_dxDyCP8Joqd5QZeLAQVY_KuFxmEBwOvLmAZe5_QT2I5v4rxg-bAxPi4WsPLvCYvDfDNHFWsvfhoyj3nF0judrNfTXA',
      isAvailable: true,
      totalSold: 2150,
    },
    {
      name: 'Veg Meals',
      categoryId: mainCourse.id,
      price: 120,
      description: 'Traditional South Indian thali meal served on banana leaf',
      isVeg: true,
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBgN3zv8rwKgaq8Y-2QdataHBIFpGwE6EPjKQr0nqYjZ6U-eUtMibcXwVvAQSt4vsprAKnKxsZXYa7VG-AxsbEg6LPPVHsTQ5ub_aAOpAVjssVQmxLExL9R7bUxHqXjstwv66cWZ4OPAlN5yYVDtDAJ_e5Bfyb0vWDNbJ87gVYTPQzSYdipGF9_HmUZc8we7CJ4AAKzcfPOMgh4mYKhApx29iSC2ivsfnON5TxQ6VJ38EpUMStAGoN9cQ',
      isAvailable: true,
      totalSold: 1890,
    },
    {
      name: 'Garlic Naan',
      categoryId: breads.id,
      price: 80,
      description: 'Oven-baked flatbread infused with minced garlic & butter',
      isVeg: true,
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBBpso5HMXNpLWQaatwcL8fqxMwfnigOBMKk7syymXhPYQEOENbYKWXGOP_WQecLfMb9OKjXQDxuGFXeXCZKqn9k6XseVaf8CL9Xr0odbmroP8WscEKKidBhmzOzgaDe5ScztZfhpP2ukkiKYO7I5KW0NNLJYg3nOnb5yxQ-CR-jimHSweFwcBvIkcuM5l-G95tZX4FkUt5Ijkf3W0TEt8d7iZG5G_BEbPC71l_vq3ugpUXfIsnf-Xfew',
      isAvailable: true,
      totalSold: 3102,
    },
    {
      name: 'Parotta',
      categoryId: breads.id,
      price: 15,
      description: 'Flaky multi-layered South Indian flatbread',
      isVeg: true,
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBBpso5HMXNpLWQaatwcL8fqxMwfnigOBMKk7syymXhPYQEOENbYKWXGOP_WQecLfMb9OKjXQDxuGFXeXCZKqn9k6XseVaf8CL9Xr0odbmroP8WscEKKidBhmzOzgaDe5ScztZfhpP2ukkiKYO7I5KW0NNLJYg3nOnb5yxQ-CR-jimHSweFwcBvIkcuM5l-G95tZX4FkUt5Ijkf3W0TEt8d7iZG5G_BEbPC71l_vq3ugpUXfIsnf-Xfew',
      isAvailable: true,
      totalSold: 5400,
    },
    {
      name: 'Paneer Tikka',
      categoryId: starters.id,
      price: 150,
      description: 'Grilled paneer cubes marinated in yogurt and spices',
      isVeg: true,
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCqI-zKLFZeziwzauGB5qE_JSDO2HAyx77u_x59CyPNIqSWhGv2TMdc9U07BcMHkQeIJsFo0ujQwRgzazi34OYb4iZA5uQgUpOnEHe3Jxh9pchxplTpBZML0QdRV-qwPvT11wIRevjkwaRFGaMqjVgPzQrvlNEKohHEvKOtLpbktHYM8BmkuwdA9G33CQBALcj4IK_aYbIOjtdQLXKLEII5NBSrkX5VQHuABoLzb86_rrEFbFnV75Tj6w',
      isAvailable: true,
      totalSold: 840,
    },
    {
      name: 'Butter Chicken',
      categoryId: mainCourse.id,
      price: 220,
      description: 'Tender chicken pieces in rich spiced butter curry',
      isVeg: false,
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCpiIgIs5khgPC77W_KslND87tlHx8Rx3KBB-QtWc73JudFExURk4xbnym2dhDbwk7jUBx22NV4t2KqERnB5Vv_3G_LUSJilnilGsCqp2nK-HQ025dzIoGRhWGaOqj_PhngruwB-t4NFkTRHGL2SMJ42cv12O_RvOxM3K_GSwl-FjT5l61WKpR9_lk3towmLwjlTBbTjCz5qBhJjwHYEVpA2zjQDQk4c5Vj03Acl5xTQESgYqCkRtapdg',
      isAvailable: true,
      totalSold: 1420,
    },
    {
      name: 'Fruit Salad',
      categoryId: desserts.id,
      price: 80,
      description: 'Fresh seasonal fruit salad with honey dressing',
      isVeg: true,
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDpJZutfIXHhajEACbzauqAe3puB6-SoeLA-kylB_yJUJzAB9zF9o7Pby_5k-M-EJNbacEIht7CFowGK4Fk71G2snK1o4gx_eDs_-OPPWl2O3cZKn8vwUgPxgCB_hr0F_YHP8Ep8QxcKOBv7unJz1vvjxyujCx3umHMuYB4090sd3BFb9peNIhCuSwHdNNG0tc06_AvY8t7dG9q9Vz4DmPx0X4T9ZmxOpkNRaWawomMr5p0v679I7lpBA',
      isAvailable: true,
      totalSold: 620,
    },
  ];

  const createdFoodItems = [];
  for (const item of foodItems) {
    const created = await prisma.foodItem.create({ data: item });
    createdFoodItems.push(created);
  }

  // Create Tables matching Stitch design
  const tablesData = [
    { tableNumber: 'T-01', capacity: 4, status: 'AVAILABLE' },
    { tableNumber: 'T-02', capacity: 2, status: 'RESERVED' },
    { tableNumber: 'T-03', capacity: 6, status: 'OCCUPIED' },
    { tableNumber: 'T-04', capacity: 4, status: 'CLEANING' },
    { tableNumber: 'T-05', capacity: 4, status: 'OCCUPIED' },
    { tableNumber: 'T-06', capacity: 8, status: 'AVAILABLE' },
    { tableNumber: 'T-07', capacity: 2, status: 'AVAILABLE' },
    { tableNumber: 'T-08', capacity: 4, status: 'RESERVED' },
  ];

  const createdTables = [];
  for (const t of tablesData) {
    const created = await prisma.restaurantTable.create({ data: t });
    createdTables.push(created);
  }

  // Create Customers
  const customer1 = await prisma.customer.create({
    data: {
      name: 'Prakashraj R',
      phone: '+91 98765 43210',
      email: 'prakashraj@example.com',
      address: '123 Heritage Lane, City Center',
      totalVisits: 14,
      totalSpent: 12450,
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      name: 'Eleanor Vance',
      phone: '+91 98765 11111',
      email: 'eleanor@example.com',
      address: '45 Park View, Metro',
      totalVisits: 5,
      totalSpent: 4200,
    },
  });

  const customer3 = await prisma.customer.create({
    data: {
      name: 'Robert Langdon',
      phone: '+91 91234 56789',
      email: 'robert@example.com',
      address: '78 University Ave',
      totalVisits: 2,
      totalSpent: 1800,
    },
  });

  const customer4 = await prisma.customer.create({
    data: {
      name: 'Sarah Connor',
      phone: '+91 99887 76655',
      email: 'sarah@example.com',
      address: '12 Tech Park Road',
      totalVisits: 8,
      totalSpent: 6500,
    },
  });

  // Create Bookings
  await prisma.booking.create({
    data: {
      bookingNumber: '#BK-8892',
      customerId: customer2.id,
      tableId: createdTables[1].id, // T-02
      date: '2026-08-13',
      time: '19:30',
      guests: 2,
      notes: 'Anniversary table preference',
      status: 'RESERVED',
    },
  });

  await prisma.booking.create({
    data: {
      bookingNumber: '#BK-8893',
      customerId: customer3.id,
      tableId: null,
      date: '2026-08-14',
      time: '20:00',
      guests: 4,
      notes: 'High chair required',
      status: 'PENDING',
    },
  });

  await prisma.booking.create({
    data: {
      bookingNumber: '#BK-8891',
      customerId: customer4.id,
      tableId: createdTables[2].id, // T-03
      date: '2026-08-13',
      time: '18:00',
      guests: 6,
      notes: 'Birthday dinner',
      status: 'SEATED',
    },
  });

  // Create Invoices / Sales History
  const invoice1 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-1024',
      customerId: customer1.id,
      tableId: createdTables[4].id, // T-05
      subtotal: 690,
      discount: 50,
      tax: 64,
      total: 704,
      paymentMethod: 'UPI',
      paymentStatus: 'PAID',
      amountReceived: 1000,
      changeGiven: 296,
      items: {
        create: [
          {
            foodItemId: createdFoodItems[2].id, // Chicken Biryani
            quantity: 2,
            unitPrice: 180,
            totalPrice: 360,
          },
          {
            foodItemId: createdFoodItems[5].id, // Parotta
            quantity: 4,
            unitPrice: 15,
            totalPrice: 60,
          },
          {
            foodItemId: createdFoodItems[7].id, // Butter Chicken
            quantity: 1,
            unitPrice: 270,
            totalPrice: 270,
          },
        ],
      },
    },
  });

  await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-1023',
      customerId: customer4.id,
      tableId: createdTables[2].id, // T-03
      subtotal: 1250,
      discount: 100,
      tax: 115,
      total: 1265,
      paymentMethod: 'CARD',
      paymentStatus: 'PAID',
      amountReceived: 1265,
      changeGiven: 0,
      items: {
        create: [
          {
            foodItemId: createdFoodItems[0].id, // Murgh Makhani
            quantity: 2,
            unitPrice: 450,
            totalPrice: 900,
          },
          {
            foodItemId: createdFoodItems[1].id, // Paneer Tikka Masala
            quantity: 1,
            unitPrice: 350,
            totalPrice: 350,
          },
        ],
      },
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
