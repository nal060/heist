export const strings = {
  // Tab names
  tabs: {
    discover: 'Descubrir',
    browse: 'Buscar',
    favorites: 'Favoritos',
    profile: 'Perfil',
  },

  // Discover screen
  discover: {
    locationLabel: 'Ubicacion actual',
    defaultLocation: 'Ciudad de Panama',
    nearbyOffers: 'Ofertas cerca de ti',
    neighborhoodFavorites: 'Favoritos del barrio',
    recommended: 'Recomendados para ti',
    seeAll: 'Ver todo',
    greeting: 'Hola',
  },

  // Browse screen
  browse: {
    searchPlaceholder: 'Buscar bolsas o restaurantes...',
    listView: 'Lista',
    mapView: 'Mapa',
    sortBy: 'Ordenar por',
    sortOptions: {
      relevance: 'Relevancia',
      distance: 'Distancia',
      price: 'Precio',
      rating: 'Calificacion',
    },
    filters: 'Filtros',
    clearAll: 'Limpiar todo',
    apply: 'Aplicar',
    pickupToday: 'Recoger hoy',
    pickupTomorrow: 'Recoger manana',
    noResults: 'No se encontraron resultados',
    noResultsSubtitle: 'Intenta ajustar tus filtros o buscar otra cosa',
    results: 'resultados',
  },

  // Bag detail
  bagDetail: {
    aboutBag: 'Acerca de esta Bolsa Sorpresa',
    pickupWindow: 'Horario de recogida',
    today: 'Hoy',
    tomorrow: 'Manana',
    remaining: 'Quedan',
    soldOut: 'Agotado',
    reserve: 'Reservar',
    address: 'Direccion',
    reviews: 'Resenas',
    pickupInstructions: 'Instrucciones de recogida',
    whatToKnow: 'Lo que debes saber',
    whatToKnowDescription: 'El contenido de la bolsa es sorpresa. No sabras exactamente que incluye hasta que la recojas.',
    ratingCategories: {
      pickup: 'Recogida',
      quality: 'Calidad',
      variety: 'Variedad',
      quantity: 'Cantidad',
    },
  },

  // Checkout
  checkout: {
    title: 'Tu pedido',
    pickupWindow: 'Recogida',
    paymentMethod: 'Metodo de pago',
    creditCard: 'Tarjeta de credito',
    quantity: 'Cantidad',
    subtotal: 'Subtotal',
    tax: 'Impuesto',
    total: 'Total',
    pay: 'Pagar',
    orderSummary: 'Resumen del pedido',
  },

  // Order confirmation
  orderConfirmation: {
    title: 'Pedido confirmado',
    subtitle: 'Tu bolsa sorpresa te espera',
    pickupReminder: 'Recuerda recoger tu pedido',
    pickupCode: 'Codigo de recogida',
    viewOrders: 'Ver mis pedidos',
    keepExploring: 'Seguir explorando',
  },

  // Favorites
  favorites: {
    title: 'Favoritos',
    emptyTitle: 'Aun no tienes favoritos',
    emptySubtitle: 'Guarda tus bolsas favoritas tocando el corazon',
  },

  // Profile
  profile: {
    title: 'Perfil',
    myOrders: 'Mis pedidos',
    impact: 'Tu impacto',
    co2Saved: 'CO2e evitado',
    moneySaved: 'Dinero ahorrado',
    mealsSaved: 'Comidas rescatadas',
    settings: 'Configuracion',
    noOrders: 'Aun no tienes pedidos',
    noOrdersSubtitle: 'Descubre bolsas sorpresa cerca de ti',
    startExploring: 'Empezar a explorar',
  },

  // Settings
  settings: {
    title: 'Configuracion',
    accountDetails: 'Detalles de cuenta',
    notifications: 'Notificaciones',
    paymentMethods: 'Metodos de pago',
    legalInfo: 'Informacion legal',
    help: 'Ayuda',
    logout: 'Cerrar sesion',
    version: 'Version',
  },

  // Order history
  orderHistory: {
    title: 'Mis pedidos',
    emptyTitle: 'Sin pedidos',
    emptySubtitle: 'Cuando hagas tu primer pedido, aparecera aqui',
    status: {
      pending: 'Pendiente',
      confirmed: 'Confirmado',
      ready: 'Listo',
      picked_up: 'Recogido',
      cancelled: 'Cancelado',
      no_show: 'No recogido',
    },
  },

  // Common
  common: {
    loading: 'Cargando...',
    error: 'Algo salio mal',
    retry: 'Reintentar',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    save: 'Guardar',
    close: 'Cerrar',
    back: 'Atras',
    km: 'km',
  },

  // Categories
  categories: {
    all: 'Todas',
    meals: 'Comidas',
    bakery: 'Panaderia',
    grocery: 'Supermercado',
    cafe: 'Cafe',
    restaurant: 'Restaurante',
    other: 'Otros',
  },
} as const;
