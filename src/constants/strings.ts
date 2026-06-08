import { APP_NAME } from './app';

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
    locationLabel: 'Ubicación actual',
    defaultLocation: 'Ciudad de Panamá',
    latitude: 8.95300000,
    longitude: -79.53400000,
    nearbyOffers: 'Ofertas cerca de ti',
    neighborhoodFavorites: 'Favoritos del barrio',
    recommended: 'Recomendados para ti',
    seeAll: 'Ver todo',
    greeting: 'Hola',
    noNearbyTitle: 'No hay ofertas cerca',
    noNearbySubtitle: 'Intenta cambiar tu ubicación para ver más opciones.',
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
      rating: 'Calificación',
    },
    filters: 'Filtros',
    clearAll: 'Limpiar todo',
    apply: 'Aplicar',
    pickupToday: 'Recoger hoy',
    pickupTomorrow: 'Recoger mañana',
    noResults: 'No se encontraron resultados',
    noResultsSubtitle: 'Intenta ajustar tus filtros o buscar otra cosa',
    results: 'resultados',
  },

  // Bag detail
  bagDetail: {
    aboutBag: 'Acerca de esta Bolsa Sorpresa',
    pickupWindow: 'Horario de recogida',
    today: 'Hoy',
    tomorrow: 'Mañana',
    remaining: 'Quedan',
    soldOut: 'Agotado',
    reserve: 'Reservar',
    address: 'Dirección',
    reviews: 'Reseñas',
    pickupInstructions: 'Instrucciones de recogida',
    whatToKnow: 'Lo que debes saber',
    whatToKnowDescription: 'El contenido de la bolsa es sorpresa. No sabrás exactamente qué incluye hasta que la recojas.',
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
    paymentMethod: 'Método de pago',
    creditCard: 'Tarjeta de crédito',
    quantity: 'Cantidad',
    subtotal: 'Subtotal',
    tax: 'Impuesto',
    total: 'Total',
    pay: 'Pagar',
    orderSummary: 'Resumen del pedido',
    addPaymentMethod: 'Agregar método de pago',
    changeMethod: 'Cambiar',
    processing: 'Procesando pago...',
    payButton: 'Pagar {amount}',
    paymentFailed: 'Pago fallido',
    paymentFailedMessage: 'No se pudo procesar el pago. Intenta de nuevo.',
    tryAgain: 'Intentar de nuevo',
  },

  // Order confirmation
  orderConfirmation: {
    title: 'Pedido confirmado',
    subtitle: 'Tu bolsa sorpresa te espera',
    pickupReminder: 'Recuerda recoger tu pedido',
    pickupCode: 'Código de recogida',
    viewOrders: 'Ver mis pedidos',
    keepExploring: 'Seguir explorando',
  },

  // Favorites
  favorites: {
    title: 'Favoritos',
    tabBags: 'Bolsas',
    tabStores: 'Tiendas',
    emptyTitle: 'Aún no tienes favoritos',
    emptySubtitle: 'Guarda tus bolsas favoritas tocando el corazón',
    emptyBagsTitle: 'Aún no tienes bolsas guardadas',
    emptyBagsSubtitle: 'Guarda bolsas individuales tocando el corazón',
    emptyStoresTitle: 'Aún no tienes tiendas guardadas',
    emptyStoresSubtitle: 'Guarda tiendas completas para ver todas sus bolsas',
  },

  // Favorite bottom sheet
  favoriteSheet: {
    title: 'Elige qué quieres guardar',
    subtitle: 'Puedes quitar de favoritos en cualquier momento',
    saveBag: 'Guardar esta bolsa',
    saveStore: 'Guardar esta tienda',
    notifyBag: 'Notificarme sobre esta bolsa',
    notifyStore: 'Notificarme sobre esta tienda',
    save: 'Guardar',
  },

  // Consumer-facing business profile
  consumerBusinessProfile: {
    activeBags: 'bolsas activas',
    directions: 'Direcciones',
    getDirections: 'Obtener direcciones',
    googleMaps: 'Google Maps',
    appleMaps: 'Apple Maps',
    copyAddress: 'Copiar dirección',
    addressCopied: 'Dirección copiada',
    selectNavApp: 'Selecciona app de navegación',
    noBagsTitle: 'Sin bolsas activas',
    noBagsSubtitle: 'Esta tienda no tiene bolsas disponibles en este momento',
    activeBagsSection: 'Bolsas activas',
  },

  // Profile
  profile: {
    title: 'Perfil',
    myOrders: 'Mis pedidos',
    impact: 'Tu impacto',
    co2Saved: 'CO2e evitado',
    moneySaved: 'Dinero ahorrado',
    mealsSaved: 'Comidas rescatadas',
    settings: 'Configuración',
    noOrders: 'Aún no tienes pedidos',
    noOrdersSubtitle: 'Descubre bolsas sorpresa cerca de ti',
    startExploring: 'Empezar a explorar',
  },

  // Settings
  settings: {
    title: 'Configuración',
    accountDetails: 'Detalles de cuenta',
    notifications: 'Notificaciones',
    paymentMethods: 'Métodos de pago',
    legalInfo: 'Información legal',
    help: 'Ayuda',
    logout: 'Cerrar sesión',
    version: 'Versión',
  },

  // Order history
  orderHistory: {
    title: 'Mis pedidos',
    emptyTitle: 'Sin pedidos',
    emptySubtitle: 'Cuando hagas tu primer pedido, aparecerá aquí',
    status: {
      reserved: 'Reservado',
      collected: 'Recogido',
      cancelled: 'Cancelado',
    },
  },

  // Change location
  changeLocation: {
    title: 'Cambiar ubicación',
    searchPlaceholder: 'Buscar dirección...',
    locateMe: 'Ubicarme',
    confirm: 'Confirmar ubicación',
    permissionDenied: 'Permiso denegado',
    permissionMessage: 'Necesitamos acceso a tu ubicación para esta función.',
    myCurrentLocation: 'Mi ubicación actual',
    locationError: 'No se pudo obtener tu ubicación.',
    noResults: 'No se encontraron resultados',
  },

  // Common
  common: {
    loading: 'Cargando...',
    error: 'Algo salió mal',
    retry: 'Reintentar',
    bagNotFound: 'Bolsa no encontrada',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    save: 'Guardar',
    close: 'Cerrar',
    back: 'Atrás',
    km: 'km',
    continue: 'Continuar',
    next: 'Siguiente',
    skip: 'Omitir',
    required: 'Requerido',
    edit: 'Editar',
    deleteAccount: 'Eliminar cuenta',
    deleteAccountTitle: 'Eliminar cuenta',
    deleteAccountMessage: 'Esta acción es permanente y eliminará todos tus datos, incluyendo historial de pedidos, favoritos y configuración. Si eres negocio, asegúrate de haber cobrado todas tus ganancias antes de continuar.',
    deleteAccountConfirm: 'Eliminar',
  },

  // Categories
  categories: {
    all: 'Todas',
    meals: 'Comidas',
    bakery: 'Panadería',
    grocery: 'Supermercado',
    cafe: 'Café',
    restaurant: 'Restaurante',
    other: 'Otros',
  },

  // Dev-only simulate login
  simulate: {
    label: 'Acceso rápido',
    consumer: 'Quiero comprar',
    business: 'Tengo un negocio',
    noConsumer: 'No hay consumidores en el sistema. Crea uno primero.',
    noBusiness: 'No hay negocios en el sistema. Crea uno primero.',
  },

  // Auth - Welcome
  welcome: {
    tagline: 'Rescata comida, ahorra dinero',
    subtitle: `Compra bolsas sorpresa de comida a precios increíbles y ayuda a reducir el desperdicio`,
    getStarted: 'Comenzar',
    haveAccount: 'Ya tengo cuenta',
  },

  // Auth - Role selection (now BEFORE email)
  roleSelect: {
    title: `¿Cómo quieres usar ${APP_NAME}?`,
    subtitle: 'Puedes cambiar esto después',
    consumer: {
      title: 'Quiero comprar',
      description: 'Descubre bolsas sorpresa de negocios cerca de ti',
    },
    business: {
      title: 'Tengo un negocio',
      description: 'Vende tu excedente de comida y reduce el desperdicio',
    },
  },

  // Auth - Sign in
  signIn: {
    title: 'Ingresa tu correo',
    subtitle: 'Te enviaremos un código de verificación',
    businessSubtitle: 'Usa el correo de tu negocio. Te enviaremos un código de verificación.',
    emailPlaceholder: 'correo@ejemplo.com',
    continue: 'Continuar',
    invalidEmail: 'Ingresa un correo válido',
  },

  // Auth - Verify email
  verify: {
    title: 'Verifica tu correo',
    subtitle: 'Ingresa el código de 6 dígitos que enviamos a',
    resend: 'Reenviar código',
    resendIn: 'Reenviar en',
    expiresIn: 'El código expira en 1 hora',
    invalidCode: 'Código inválido. Intenta de nuevo.',
    expiredCode: 'El código ha expirado. Solicita uno nuevo.',
  },

  // User onboarding - What brings you here
  userPreferences: {
    whatBringsTitle: '¿QUÉ TE TRAE POR AQUÍ?',
    whatBringsSubtitle: `Saber lo que te importa nos ayuda a personalizar tus recomendaciones y mejorar tu experiencia en ${APP_NAME}.`,
    selectAll: 'Selecciona todo lo que aplique',
    options: {
      groceries: 'Complementar mis compras de supermercado',
      saveMoney: 'Ahorrar dinero en comida',
      treats: 'Conseguir algo rico para mí o para otros',
      mealOptions: 'Encontrar opciones fáciles para complementar mis comidas',
      immediateMeal: 'Encontrar una comida inmediata',
      explore: 'Explorar nuevas tiendas y cocinas',
    },
  },

  // User onboarding - Pickup time preferences
  pickupPreferences: {
    title: '¿CUÁNDO PREFIERES RECOGER?',
    subtitle: `Dinos tu horario preferido y te recomendaremos Bolsas Sorpresa que se ajusten a tu rutina.`,
    selectAll: 'Selecciona todo lo que aplique',
    options: {
      earlyMorning: 'Mañana temprano (06:00 - 09:00)',
      lateMorning: 'Mañana tarde (09:00 - 12:00)',
      midday: 'Mediodía (12:00 - 15:00)',
      afternoon: 'Tarde (15:00 - 18:00)',
      evening: 'Noche (18:00 - 21:00)',
      lateNight: 'Noche tarde (21:00 - 00:00)',
    },
  },

  // User onboarding - Location
  userLocation: {
    title: '¿Dónde quieres encontrar tus Bolsas Sorpresa?',
    useCurrentLocation: 'Usar mi ubicación actual',
    selectLocation: 'Seleccionar ubicación',
  },

  // Auth - Business registration (Google Maps search)
  businessSearch: {
    title: 'Registra tu negocio',
    subtitle: 'Encontremos tu tienda y te ayudamos a comenzar. ¡Solo tomará unos minutos!',
    searchPlaceholder: 'Busca tu negocio...',
    noResults: 'No encontramos tu negocio',
    addManually: 'Agregar datos del negocio manualmente',
    reviewTitle: 'Revisa los datos de tu negocio',
    reviewSubtitle: 'Confirma que la información sea correcta. Puedes editarla cuando quieras.',
  },

  // Auth - Manual business entry
  businessManualEntry: {
    title: 'Datos de tu negocio',
    subtitle: 'Completa la información de tu tienda.',
    nameLabel: 'Nombre del negocio',
    namePlaceholder: 'Ej: Panadería Don Pan',
    storeType: 'Tipo de negocio',
    addressLabel: 'Dirección',
    addressPlaceholder: 'Calle y número',
    cityLabel: 'Ciudad',
    cityPlaceholder: 'Ej: Ciudad de Panamá',
    phoneLabel: 'Teléfono',
    phonePlaceholder: '+507 ',
    addressNotFound: 'No se pudo verificar la dirección. Intenta con otra.',
    continue: 'Continuar',
  },

  // Auth - Business registration (kept for backward compat, redirects to search)
  businessRegister: {
    title: 'Registra tu negocio',
    subtitle: 'Completa la información de tu tienda',
    nameLabel: 'Nombre del negocio',
    namePlaceholder: 'Ej: Panadería Don Pan',
    descriptionLabel: 'Descripción',
    descriptionPlaceholder: 'Describe tu negocio brevemente...',
    addressLabel: 'Dirección',
    addressPlaceholder: 'Ej: Calle 50, Ciudad de Panamá',
    phoneLabel: 'Teléfono',
    phonePlaceholder: '+507 ',
    continue: 'Continuar',
  },

  // Auth - Business photo upload
  businessPhoto: {
    title: 'Foto de tu negocio',
    subtitle: 'Agrega una foto del exterior o interior de tu negocio. Esto ayuda a los clientes a identificarlo fácilmente.',
    pickFromLibrary: 'Elegir de la galería',
    takePhoto: 'Tomar foto',
    changePhoto: 'Cambiar foto',
    continue: 'Continuar',
    photoRequired: 'Agrega una foto para continuar',
    uploading: 'Subiendo foto...',
  },

  // Auth - Business category selection
  businessCategory: {
    title: 'Tipo de negocio',
    subtitle: 'Selecciona la categoría que mejor describe tu excedente de comida. Esto ayuda a los clientes a saber qué esperar de tus Bolsas Sorpresa.',
    continue: 'Continuar',
  },

  // Bag creation - Name & Description
  bagNameSetup: {
    title: 'Agrega un nombre y descripción',
    subtitle: '¡Te lo hemos facilitado! Aquí tienes nuestra sugerencia. Puedes hacer cambios cuando quieras.',
    nameLabel: 'Nombre',
    nameDefault: 'Bolsa Sorpresa',
    descriptionLabel: 'Descripción',
    descriptionDefault: 'Rescata una Bolsa Sorpresa con una selección de comida deliciosa que la tienda tiene al final del día.',
    continue: 'Continuar',
  },

  // Bag creation - Size selection
  bagSizeSetup: {
    title: 'Elige el tamaño de tu Bolsa Sorpresa',
    subtitle: 'El tamaño determina el valor mínimo y el precio en la app. Estos son valores sugeridos que puedes editar.',
    small: 'Pequeña',
    medium: 'Mediana',
    large: 'Grande',
    minValue: 'valor mínimo',
    priceInApp: 'precio en app',
    recommendedForYou: 'Recomendado para ti',
    recommendationMessage: 'Basado en tu tipo de Bolsa Sorpresa, recomendamos comenzar con el tamaño Mediano. Puedes cambiar esto después.',
    continue: 'Continuar',
    helpItems: {
      sizeQuestion: '¿Qué tamaño debo elegir para mis Bolsas Sorpresa?',
      sizeAnswer: 'Al crear una Bolsa Sorpresa, piensa en el tamaño en términos del valor original de su contenido. Si tienes una gran cantidad y variedad de alimentos no vendidos, recomendamos Mediana o Grande. La Pequeña funciona mejor para cantidades menores del mismo artículo.',
      earningsQuestion: '¿Cuánto ganaré por Bolsa Sorpresa vendida?',
      earningsAnswer: `Por cada Bolsa Sorpresa vendida en ${APP_NAME}, cobramos una pequeña comisión de USD 1.50 - USD 2.10 según el tamaño. El resto es tuyo. Una vez que configures tu primera bolsa, verás el monto exacto.`,
      valueQuestion: '¿Cuál es la diferencia entre precio en app y valor por Bolsa Sorpresa?',
      valueAnswer: 'El precio en app es lo que los usuarios pagan por cada Bolsa Sorpresa. El valor es el precio original de los artículos que pones en la bolsa. El valor original siempre debe ser mayor que el precio en la app.',
      payoutsQuestion: '¿Cómo funcionan los pagos?',
      payoutsAnswer: `Transferimos tus ganancias alrededor del día 20 de cada mes, después de deducir la comisión mensual y las tarifas de las Bolsas Sorpresa.`,
      costQuestion: `¿Cuánto cuesta ${APP_NAME}?`,
      costAnswer: `${APP_NAME} cobra una pequeña comisión por cada Bolsa Sorpresa vendida. No hay costos fijos mensuales. Solo pagas cuando vendes.`,
    },
  },

  // Bag creation - Daily quantity
  bagQuantitySetup: {
    title: 'Cantidad diaria de Bolsas Sorpresa',
    subtitle: '¿Cuántas bolsas quieres vender por día?',
    recommendationTitle: 'Recomendado para ti',
    recommendationMessage: 'Recomendamos comenzar con 2-3 Bolsas Sorpresa por día. Puedes cambiar esto después.',
    continue: 'Continuar',
    helpItems: {
      noFoodQuestion: '¿Qué pasa si no me sobra comida?',
      noFoodAnswer: '¡No te preocupes! Puedes pausar tus Bolsas Sorpresa en cualquier momento desde tu panel. Si un día no tienes excedente, simplemente desactiva la bolsa para ese día.',
      earningsQuestion: '¿Cuánto ganaré por Bolsa Sorpresa vendida?',
      earningsAnswer: `Por cada Bolsa Sorpresa vendida en ${APP_NAME}, cobramos una pequeña comisión. El resto es tuyo.`,
    },
  },

  // Bag creation - Weekly pickup schedule
  bagScheduleSetup: {
    title: 'Configura el horario semanal de recogida',
    subtitle: 'Este horario se repetirá semanalmente y lo puedes editar cuando quieras.',
    editForAllDays: 'Editar para todos los días',
    earningsPerWeek: 'Ganancias por semana',
    continue: 'Continuar',
    recommendationTitle: 'Recomendado para ti',
    recommendationMessage: 'Recomendamos permitir al menos 30 minutos para la recogida. Así tus clientes tendrán más oportunidad de llegar. Puedes cambiar esto después.',
    helpItems: {
      howSaleWorks: '¿Cómo se ponen a la venta las Bolsas Sorpresa?',
      howSaleAnswer: `Las Bolsas Sorpresa se publican automáticamente según el horario que configures. Los clientes pueden reservar durante el horario de recogida.`,
      earningsQuestion: '¿Cuánto ganaré por Bolsa Sorpresa vendida?',
      earningsAnswer: `Por cada Bolsa vendida en ${APP_NAME}, cobramos una pequeña comisión de USD 1.50 - USD 2.10. El resto es tuyo.`,
      pickupWindowQuestion: '¿Qué es el horario de recogida?',
      pickupWindowAnswer: 'Es el periodo de tiempo en el que los clientes pueden pasar a recoger su Bolsa Sorpresa. Recomendamos un mínimo de 30 minutos.',
      noFoodQuestion: '¿Qué pasa si no me sobra comida?',
      noFoodAnswer: 'Puedes pausar o desactivar cualquier día desde tu calendario. Tus clientes serán notificados automáticamente.',
    },
  },

  // Bag creation - Review & Confirm
  bagReviewSetup: {
    title: 'Confirma y empieza a vender',
    subtitle: 'Revisa los detalles de tu Bolsa Sorpresa. Puedes cambiarlos después.',
    startDate: 'Fecha de inicio',
    startDateDescription: `En esta fecha, los clientes podrán ver tu tienda y tus Bolsas Sorpresa disponibles en ${APP_NAME}.`,
    earningsAndFees: 'Ganancias y comisiones',
    confirmAndSell: 'Confirmar y empezar a vender',
    maybeLater: 'Quizás después',
  },

  // Bag creation - What's Next
  bagWhatsNext: {
    title: '¡Fantástico!',
    subtitle: 'Has creado tu primera Bolsa Sorpresa.',
    perDay: 'Bolsas Sorpresa por día',
    whatsNextTitle: '¿Qué sigue?',
    whatsNextSubtitle: 'Todo lo que necesitas para recibir tu primer pago.',
    step1Title: 'Empieza a vender',
    step1Description: `Proporciona tus datos para empezar a vender Bolsas Sorpresa en ${APP_NAME}.`,
    step2Title: 'Agrega tus datos de pago',
    step2Description: 'Proporciona y verifica tus datos de pago para empezar a recibir tus ganancias.',
    step3Title: 'Recibe tu primer pago',
    step3Description: 'Transferimos tus ganancias alrededor del día 20 de cada mes, después de deducir la comisión mensual.',
    startSelling: 'Empezar a vender',
    maybeLater: 'Quizás después',
  },

  // Business tabs
  businessTabs: {
    dashboard: 'Inicio',
    bags: 'Bolsas',
    orders: 'Pedidos',
    profile: 'Perfil',
  },

  // Business dashboard
  businessDashboard: {
    welcome: 'Bienvenido',
    todaySummary: 'Resumen de hoy',
    activeBags: 'Bolsas activas',
    pendingOrders: 'Pedidos pendientes',
    totalEarnings: 'Ganancias totales',
    noBags: 'Aún no tienes bolsas',
    noBagsSubtitle: 'Crea tu primera Bolsa Sorpresa para empezar a vender',
    createBag: 'Crear bolsa',
    greetingMorning: 'Buenos días',
    greetingAfternoon: 'Buenas tardes',
    greetingEvening: 'Buenas noches',
    recentPickups: 'Recolecciones recientes',
    noPickupsYet: 'Sin recolecciones aún',
    collectAction: 'Recoger',
    errorLoading: 'No se pudo cargar el panel',
    orderStatus: {
      reserved: 'Reservado',
      collected: 'Recogido',
      cancelled: 'Cancelado',
    },
  },

  // Business bags management
  businessBags: {
    title: 'Mis bolsas',
    headerTitle: 'Mis Bolsas',
    addBag: 'Nueva bolsa',
    emptyTitle: 'Sin bolsas',
    emptySubtitle: 'Crea tu primera Bolsa Sorpresa',
    status: {
      draft: 'Pendiente',
      active: 'Activa',
      sold_out: 'Agotada',
      expired: 'Expirada',
      cancelled: 'Cancelada',
    },
    filters: {
      all: 'Todos',
      active: 'Activos',
      draft: 'Pendientes',
      sold_out: 'Agotados',
      expired: 'Expirados',
      cancelled: 'Cancelados',
    },
    statusLabels: {
      active: 'Activo',
      draft: 'Borrador',
      sold_out: 'Agotado',
      expired: 'Expirado',
      cancelled: 'Cancelado',
    },
    emptyMessages: {
      all: 'Aún no has creado ninguna bolsa.',
      active: 'No hay bolsas activas en este momento.',
      draft: 'No hay bolsas pendientes.',
      sold_out: 'No hay bolsas agotadas.',
      expired: 'No hay bolsas vencidas.',
      cancelled: 'No hay bolsas canceladas.',
    },
    cancelAction: 'Cancelar',
    relistAction: 'Volver a publicar',
  },

  // Business orders
  businessOrders: {
    title: 'Pedidos',
    emptyTitle: 'Sin pedidos',
    emptySubtitle: 'Los pedidos de tus clientes aparecerán aquí',
    status: {
      reserved: 'Reservado',
      collected: 'Recogido',
      cancelled: 'Cancelado',
    },
    filters: {
      all: 'Todo',
      reserved: 'Reservado',
      collected: 'Recogido',
      cancelled: 'Cancelado',
    },
    statusLabels: {
      reserved: 'Reservado',
      collected: 'Recogido',
      cancelled: 'Cancelado',
    },
    summaryReserved: 'Reservado',
    summaryCollected: 'Recogido',
    summaryRevenue: 'Ingresos',
    dateFilterToday: 'Hoy',
    dateFilterAll: 'Total',
    emptyMessages: {
      all: 'Aún no hay pedidos hoy.',
      reserved: 'No hay pedidos reservados en este momento.',
      collected: 'Aún no hay pedidos recogidos.',
      cancelled: 'No hay pedidos cancelados.',
    },
    cancelAction: 'Cancelar',
    collectAction: 'Recogido',
    codeLabel: 'CÓDIGO',
  },

  // Business profile
  businessProfile: {
    title: 'Mi negocio',
    editProfile: 'Editar perfil',
    businessInfo: 'Información del negocio',
    hours: 'Horario',
    calendar: 'Calendario',
    payoutSettings: 'Configuración de pagos',
    help: 'Ayuda',
    logout: 'Cerrar sesión',
  },

  // Business profile edit
  businessProfileEdit: {
    title: 'Información del negocio',
    subtitle: 'Aquí puedes ver y editar la información registrada de tu negocio.',
    descriptionLabel: 'Descripción del negocio',
    nameLabel: 'Nombre',
    addressLabel: 'Dirección',
    phoneLabel: 'Teléfono',
    save: 'Guardar cambios',
    changePhoto: 'Cambiar foto',
    photoSheetTitle: 'Foto del negocio',
    photoSheetLibrary: 'Galería de fotos',
    photoSheetCamera: 'Tomar foto',
  },

  // Collect screen
  collect: {
    title: 'Recoger Pedido',
    enterCode: 'Introduce el código de recogida',
    notFound: 'No se encontró ningún pedido para este código.',
    alreadyCollected: 'ya ha sido recogido.',
    success: '¡Listo! Introduce otro código para continuar.',
    outsideWindow: 'Este pedido está fuera de la ventana de recogida',
    clear: 'Borrar',
    confirmPickup: 'Confirmar Recogida',
  },

  // Business calendar
  businessCalendar: {
    title: 'Calendario',
    overview: 'Vista general',
    schedule: 'Horario',
    calendarDescription: 'El calendario muestra los días en que los clientes pueden pasar por tu tienda a recoger una Bolsa Sorpresa. Los días mostrados siguen tu horario semanal.',
    tapToEdit: 'Toca una fecha para ver detalles o hacer cambios.',
    pickup: 'Recogida',
    noPickup: 'Sin recogida',
    specialDay: 'Recogida (día especial)',
    noPickupSpecial: 'Sin recogida (día especial)',
    confirmationNeeded: 'Confirmación necesaria',
  },

  // Bag form (shared between create & edit)
  bagForm: {
    newBag: 'Nueva bolsa',
    editBag: 'Editar bolsa',
    relistBag: 'Volver a publicar bolsa',
    bagDetails: 'Detalles de la bolsa',
    bagName: 'Nombre de la bolsa',
    bagNameDefault: 'Bolsa Sorpresa',
    bagDescription: 'Descripción',
    bagDescriptionDefault: 'Rescata una Bolsa Sorpresa con una selección de comida deliciosa que la tienda tiene al final del día.',
    size: 'Tamaño',
    pricing: 'Precio',
    value: 'Valor',
    priceInApp: 'Precio en app',
    pricingError: 'El precio en app debe ser menor que el valor original.',
    savingsMessage: 'Clientes ahorran {pct}% sobre el valor original',
    schedule: 'Horario de recogida',
    quantity: 'Cantidad diaria',
    quantityLabel: 'Bolsas disponibles por día',
    photos: 'Fotos',
    addPhotos: 'Agregar fotos',
    publish: 'Publicar',
    publishing: 'Publicando...',
    saveDraft: 'Guardar borrador',
    savingDraft: 'Guardando...',
    saveChanges: 'Guardar cambios',
    saving: 'Guardando...',
    deactivate: 'Desactivar',
    activate: 'Activar',
    edit: 'Editar',
    timeError: 'La hora de fin debe ser posterior a la hora de inicio.',
    maxPhotosAlert: 'Máximo {max} fotos permitidas.',
    permissionsTitle: 'Permisos',
    permissionsGallery: 'Se necesitan permisos para acceder a la galería.',
  },

  paymentMethods: {
    title: 'Métodos de pago',
    addCard: 'Agregar tarjeta',
    emptyTitle: 'Sin métodos de pago',
    emptySubtitle: 'Agrega una tarjeta para pagar más rápido.',
    defaultBadge: 'Predeterminada',
    setDefault: 'Establecer como predeterminada',
    deleteTitle: 'Eliminar tarjeta',
    deleteMessage: '¿Estás seguro de que deseas eliminar esta tarjeta?',
    deleteConfirm: 'Eliminar',
    deleteCancel: 'Cancelar',
    expires: 'Vence',
    expirySeparator: '/',
    maskedPrefix: '•••• ',
    addingCard: 'Agregando tarjeta...',
    removingCard: 'Eliminando tarjeta...',
  },

  mockCardForm: {
    simulationBanner: 'MODO SIMULACIÓN',
    cardNumber: 'Número de tarjeta',
    expiry: 'Vencimiento',
    cvv: 'CVV',
    pay: 'Pagar',
    saveCard: 'Guardar tarjeta',
    simulateError: 'Simular error',
    processing: 'Procesando...',
  },

  tilopayWebView: {
    title: 'Pago seguro',
  },

  businessPayoutSettings: {
    title: 'Configuración de pagos',
    noAccountTitle: 'Cuenta no registrada',
    noAccountSubtitle: 'Tu cuenta aún no está configurada para recibir pagos.',
    step1: '1. Regístrate en tilopay.com',
    step2: '2. Contacta al soporte de Heist para completar la configuración.',
    contactSupport: 'Contactar soporte',
    pendingTitle: 'Cuenta en revisión',
    pendingSubtitle: 'Tu cuenta está siendo revisada. Esto puede tardar 1-3 días hábiles.',
    activeTitle: 'Cuenta activa',
    activeSubtitle: 'Tu cuenta está lista para recibir pagos.',
    affiliateId: 'ID de afiliado',
    bankEditNote: 'Para actualizar información bancaria, visita admin.tilopay.com',
    suspendedTitle: 'Cuenta suspendida',
    suspendedSubtitle: 'Tu cuenta ha sido suspendida. Contacta a soporte para resolverlo.',
    offboardedTitle: 'Cuenta desactivada',
    offboardedSubtitle: 'Tu cuenta ya no está activa en la plataforma.',
    copyAffiliateId: 'Copiar ID',
    copied: 'Copiado',
  },
} as const;
