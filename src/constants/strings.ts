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
    locationLabel: 'Ubicacion actual',
    defaultLocation: 'Ciudad de Panama',
    latitude: 8.95300000,
    longitude: -79.53400000,
    nearbyOffers: 'Ofertas cerca de ti',
    neighborhoodFavorites: 'Favoritos del barrio',
    recommended: 'Recomendados para ti',
    seeAll: 'Ver todo',
    greeting: 'Hola',
    noNearbyTitle: 'No hay ofertas cerca',
    noNearbySubtitle: 'Intenta cambiar tu ubicacion para ver mas opciones.',
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
      reserved: 'Reservado',
      collected: 'Recogido',
      cancelled: 'Cancelado',
    },
  },

  // Change location
  changeLocation: {
    title: 'Cambiar ubicacion',
    searchPlaceholder: 'Buscar direccion...',
    locateMe: 'Ubicarme',
    confirm: 'Confirmar ubicacion',
    permissionDenied: 'Permiso denegado',
    permissionMessage: 'Necesitamos acceso a tu ubicacion para esta funcion.',
    myCurrentLocation: 'Mi ubicacion actual',
    locationError: 'No se pudo obtener tu ubicacion.',
    noResults: 'No se encontraron resultados',
  },

  // Common
  common: {
    loading: 'Cargando...',
    error: 'Algo salio mal',
    retry: 'Reintentar',
    bagNotFound: 'Bolsa no encontrada',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    save: 'Guardar',
    close: 'Cerrar',
    back: 'Atras',
    km: 'km',
    continue: 'Continuar',
    next: 'Siguiente',
    skip: 'Omitir',
    required: 'Requerido',
    edit: 'Editar',
    deleteAccount: 'Eliminar cuenta',
    deleteAccountTitle: 'Eliminar cuenta',
    deleteAccountMessage: 'Esta accion es permanente y eliminara todos tus datos, incluyendo historial de pedidos, favoritos y configuracion. Si eres negocio, asegurate de haber cobrado todas tus ganancias antes de continuar.',
    deleteAccountConfirm: 'Eliminar',
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

  // Auth - Welcome
  welcome: {
    tagline: 'Rescata comida, ahorra dinero',
    subtitle: `Compra bolsas sorpresa de comida a precios increibles y ayuda a reducir el desperdicio`,
    getStarted: 'Comenzar',
    haveAccount: 'Ya tengo cuenta',
  },

  // Auth - Role selection (now BEFORE email)
  roleSelect: {
    title: `Como quieres usar ${APP_NAME}?`,
    subtitle: 'Puedes cambiar esto despues',
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
    subtitle: 'Te enviaremos un codigo de verificacion',
    businessSubtitle: 'Usa el correo de tu negocio. Te enviaremos un codigo de verificacion.',
    emailPlaceholder: 'correo@ejemplo.com',
    continue: 'Continuar',
    invalidEmail: 'Ingresa un correo valido',
  },

  // Auth - Verify email
  verify: {
    title: 'Verifica tu correo',
    subtitle: 'Ingresa el codigo de 6 digitos que enviamos a',
    resend: 'Reenviar codigo',
    resendIn: 'Reenviar en',
    expiresIn: 'El codigo expira en 1 hora',
    invalidCode: 'Codigo invalido. Intenta de nuevo.',
    expiredCode: 'El codigo ha expirado. Solicita uno nuevo.',
  },

  // Auth - Country selection (after OTP, for BOTH users and businesses)
  countrySelect: {
    title: 'Comencemos',
    chooseCountry: 'Selecciona tu pais',
    termsPrefix: 'Acepto los ',
    termsLink: 'terminos y condiciones',
    termsMiddle: ' y la ',
    privacyLink: 'politica de privacidad',
    signMeUp: 'Registrarme',
    noCountries: 'No hay paises disponibles',
  },

  // User onboarding - What brings you here
  userPreferences: {
    whatBringsTitle: 'QUE TE TRAE POR AQUI?',
    whatBringsSubtitle: `Saber lo que te importa nos ayuda a personalizar tus recomendaciones y mejorar tu experiencia en ${APP_NAME}.`,
    selectAll: 'Selecciona todo lo que aplique',
    options: {
      groceries: 'Complementar mis compras de supermercado',
      saveMoney: 'Ahorrar dinero en comida',
      treats: 'Conseguir algo rico para mi o para otros',
      mealOptions: 'Encontrar opciones faciles para complementar mis comidas',
      immediateMeal: 'Encontrar una comida inmediata',
      explore: 'Explorar nuevas tiendas y cocinas',
    },
  },

  // User onboarding - Pickup time preferences
  pickupPreferences: {
    title: 'CUANDO PREFIERES RECOGER?',
    subtitle: `Dinos tu horario preferido y te recomendaremos Bolsas Sorpresa que se ajusten a tu rutina.`,
    selectAll: 'Selecciona todo lo que aplique',
    options: {
      earlyMorning: 'Manana temprano (06:00 - 09:00)',
      lateMorning: 'Manana tarde (09:00 - 12:00)',
      midday: 'Mediodia (12:00 - 15:00)',
      afternoon: 'Tarde (15:00 - 18:00)',
      evening: 'Noche (18:00 - 21:00)',
      lateNight: 'Noche tarde (21:00 - 00:00)',
    },
  },

  // User onboarding - Location
  userLocation: {
    title: 'Donde quieres encontrar tus Bolsas Sorpresa?',
    useCurrentLocation: 'Usar mi ubicacion actual',
    selectLocation: 'Seleccionar ubicacion',
  },

  // Auth - Business registration (Google Maps search)
  businessSearch: {
    title: 'Registra tu negocio',
    subtitle: 'Encontremos tu tienda y te ayudamos a comenzar. Solo tomara unos minutos!',
    searchPlaceholder: 'Busca tu negocio...',
    noResults: 'No encontramos tu negocio',
    addManually: 'Agregar datos del negocio manualmente',
    reviewTitle: 'Revisa los datos de tu negocio',
    reviewSubtitle: 'Confirma que la informacion sea correcta. Puedes editarla cuando quieras.',
  },

  // Auth - Manual business entry
  businessManualEntry: {
    title: 'Datos de tu negocio',
    subtitle: 'Completa la informacion de tu tienda.',
    nameLabel: 'Nombre del negocio',
    namePlaceholder: 'Ej: Panaderia Don Pan',
    storeType: 'Tipo de negocio',
    addressLabel: 'Direccion',
    addressPlaceholder: 'Calle y numero',
    cityLabel: 'Ciudad',
    cityPlaceholder: 'Ej: Ciudad de Panama',
    phoneLabel: 'Telefono',
    phonePlaceholder: '+507 ',
    continue: 'Continuar',
  },

  // Auth - Business registration (kept for backward compat, redirects to search)
  businessRegister: {
    title: 'Registra tu negocio',
    subtitle: 'Completa la informacion de tu tienda',
    nameLabel: 'Nombre del negocio',
    namePlaceholder: 'Ej: Panaderia Don Pan',
    descriptionLabel: 'Descripcion',
    descriptionPlaceholder: 'Describe tu negocio brevemente...',
    addressLabel: 'Direccion',
    addressPlaceholder: 'Ej: Calle 50, Ciudad de Panama',
    phoneLabel: 'Telefono',
    phonePlaceholder: '+507 ',
    continue: 'Continuar',
  },

  // Auth - Business category selection
  businessCategory: {
    title: 'Tipo de negocio',
    subtitle: 'Selecciona la categoria que mejor describe tu excedente de comida. Esto ayuda a los clientes a saber que esperar de tus Bolsas Sorpresa.',
    continue: 'Continuar',
  },

  // Bag creation - Name & Description
  bagNameSetup: {
    title: 'Agrega un nombre y descripcion',
    subtitle: 'Te lo hemos facilitado! Aqui tienes nuestra sugerencia. Puedes hacer cambios cuando quieras.',
    nameLabel: 'Nombre',
    nameDefault: 'Bolsa Sorpresa',
    descriptionLabel: 'Descripcion',
    descriptionDefault: 'Rescata una Bolsa Sorpresa con una seleccion de comida deliciosa que la tienda tiene al final del dia.',
    continue: 'Continuar',
  },

  // Bag creation - Size selection
  bagSizeSetup: {
    title: 'Elige el tamano de tu Bolsa Sorpresa',
    subtitle: 'El tamano determina el valor minimo y el precio en la app. Estos son valores sugeridos que puedes editar.',
    small: 'Pequena',
    medium: 'Mediana',
    large: 'Grande',
    minValue: 'valor minimo',
    priceInApp: 'precio en app',
    recommendedForYou: 'Recomendado para ti',
    recommendationMessage: 'Basado en tu tipo de Bolsa Sorpresa, recomendamos comenzar con el tamano Mediano. Puedes cambiar esto despues.',
    continue: 'Continuar',
    helpItems: {
      sizeQuestion: 'Que tamano debo elegir para mis Bolsas Sorpresa?',
      sizeAnswer: 'Al crear una Bolsa Sorpresa, piensa en el tamano en terminos del valor original de su contenido. Si tienes una gran cantidad y variedad de alimentos no vendidos, recomendamos Mediana o Grande. La Pequena funciona mejor para cantidades menores del mismo articulo.',
      earningsQuestion: 'Cuanto ganare por Bolsa Sorpresa vendida?',
      earningsAnswer: `Por cada Bolsa Sorpresa vendida en ${APP_NAME}, cobramos una pequena comision de USD 1.50 - USD 2.10 segun el tamano. El resto es tuyo! Una vez que configures tu primera bolsa, veras el monto exacto.`,
      valueQuestion: 'Cual es la diferencia entre precio en app y valor por Bolsa Sorpresa?',
      valueAnswer: 'El precio en app es lo que los usuarios pagan por cada Bolsa Sorpresa. El valor es el precio original de los articulos que pones en la bolsa. El valor original siempre debe ser mayor que el precio en la app.',
      payoutsQuestion: 'Como funcionan los pagos?',
      payoutsAnswer: `Transferimos tus ganancias alrededor del dia 20 de cada mes, despues de deducir la comision mensual y las tarifas de las Bolsas Sorpresa.`,
      costQuestion: `Cuanto cuesta ${APP_NAME}?`,
      costAnswer: `${APP_NAME} cobra una pequena comision por cada Bolsa Sorpresa vendida. No hay costos fijos mensuales. Solo pagas cuando vendes.`,
    },
  },

  // Bag creation - Daily quantity
  bagQuantitySetup: {
    title: 'Cantidad diaria de Bolsas Sorpresa',
    subtitle: 'Cuantas bolsas quieres vender por dia?',
    recommendationTitle: 'Recomendado para ti',
    recommendationMessage: 'Recomendamos comenzar con 2-3 Bolsas Sorpresa por dia. Puedes cambiar esto despues.',
    continue: 'Continuar',
    helpItems: {
      noFoodQuestion: 'Que pasa si no me sobra comida?',
      noFoodAnswer: 'No te preocupes! Puedes pausar tus Bolsas Sorpresa en cualquier momento desde tu panel. Si un dia no tienes excedente, simplemente desactiva la bolsa para ese dia.',
      earningsQuestion: 'Cuanto ganare por Bolsa Sorpresa vendida?',
      earningsAnswer: `Por cada Bolsa Sorpresa vendida en ${APP_NAME}, cobramos una pequena comision. El resto es tuyo!`,
    },
  },

  // Bag creation - Weekly pickup schedule
  bagScheduleSetup: {
    title: 'Configura el horario semanal de recogida',
    subtitle: 'Este horario se repetira semanalmente y lo puedes editar cuando quieras.',
    editForAllDays: 'Editar para todos los dias',
    earningsPerWeek: 'Ganancias por semana',
    continue: 'Continuar',
    recommendationTitle: 'Recomendado para ti',
    recommendationMessage: 'Recomendamos permitir al menos 30 minutos para la recogida. Asi tus clientes tendran mas oportunidad de llegar. Puedes cambiar esto despues.',
    helpItems: {
      howSaleWorks: 'Como se ponen a la venta las Bolsas Sorpresa?',
      howSaleAnswer: `Las Bolsas Sorpresa se publican automaticamente segun el horario que configures. Los clientes pueden reservar durante el horario de recogida.`,
      earningsQuestion: 'Cuanto ganare por Bolsa Sorpresa vendida?',
      earningsAnswer: `Por cada Bolsa vendida en ${APP_NAME}, cobramos una pequena comision de USD 1.50 - USD 2.10. El resto es tuyo!`,
      pickupWindowQuestion: 'Que es el horario de recogida?',
      pickupWindowAnswer: 'Es el periodo de tiempo en el que los clientes pueden pasar a recoger su Bolsa Sorpresa. Recomendamos un minimo de 30 minutos.',
      noFoodQuestion: 'Que pasa si no me sobra comida?',
      noFoodAnswer: 'Puedes pausar o desactivar cualquier dia desde tu calendario. Tus clientes seran notificados automaticamente.',
    },
  },

  // Bag creation - Review & Confirm
  bagReviewSetup: {
    title: 'Confirma y empieza a vender',
    subtitle: 'Revisa los detalles de tu Bolsa Sorpresa. Puedes cambiarlos despues.',
    startDate: 'Fecha de inicio',
    startDateDescription: `En esta fecha, los clientes podran ver tu tienda y tus Bolsas Sorpresa disponibles en ${APP_NAME}.`,
    earningsAndFees: 'Ganancias y comisiones',
    confirmAndSell: 'Confirmar y empezar a vender',
    maybeLater: 'Quizas despues',
  },

  // Bag creation - What's Next
  bagWhatsNext: {
    title: 'Fantastico!',
    subtitle: 'Has creado tu primera Bolsa Sorpresa.',
    perDay: 'Bolsas Sorpresa por dia',
    whatsNextTitle: 'Que sigue?',
    whatsNextSubtitle: 'Todo lo que necesitas para recibir tu primer pago.',
    step1Title: 'Empieza a vender',
    step1Description: `Proporciona tus datos para empezar a vender Bolsas Sorpresa en ${APP_NAME}.`,
    step2Title: 'Agrega tus datos de pago',
    step2Description: 'Proporciona y verifica tus datos de pago para empezar a recibir tus ganancias.',
    step3Title: 'Recibe tu primer pago',
    step3Description: 'Transferimos tus ganancias alrededor del dia 20 de cada mes, despues de deducir la comision mensual.',
    startSelling: 'Empezar a vender',
    maybeLater: 'Quizas despues',
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
    noBags: 'Aun no tienes bolsas',
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
    headerTitle: 'Mis Bolsos',
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
    emptySubtitle: 'Los pedidos de tus clientes apareceran aqui',
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
    businessInfo: 'Informacion del negocio',
    hours: 'Horario',
    calendar: 'Calendario',
    payoutSettings: 'Configuracion de pagos',
    help: 'Ayuda',
    logout: 'Cerrar sesion',
  },

  // Business profile edit
  businessProfileEdit: {
    title: 'Informacion del negocio',
    subtitle: 'Aqui puedes ver y editar la informacion registrada de tu negocio.',
    descriptionLabel: 'Descripcion del negocio',
    nameLabel: 'Nombre',
    addressLabel: 'Direccion',
    phoneLabel: 'Telefono',
    save: 'Guardar cambios',
  },

  // Collect screen
  collect: {
    title: 'Recoger Pedido',
    enterCode: 'Introduce el codigo de recogida',
    notFound: 'No se encontro ningun pedido para este codigo.',
    alreadyCollected: 'ya ha sido recogido.',
    success: 'Listo! Introduce otro codigo para continuar.',
    outsideWindow: 'Este pedido esta fuera de la ventana de recogida',
    clear: 'Borrar',
    confirmPickup: 'Confirmar Recogida',
  },

  // Business calendar
  businessCalendar: {
    title: 'Calendario',
    overview: 'Vista general',
    schedule: 'Horario',
    calendarDescription: 'El calendario muestra los dias en que los clientes pueden pasar por tu tienda a recoger una Bolsa Sorpresa. Los dias mostrados siguen tu horario semanal.',
    tapToEdit: 'Toca una fecha para ver detalles o hacer cambios.',
    pickup: 'Recogida',
    noPickup: 'Sin recogida',
    specialDay: 'Recogida (dia especial)',
    noPickupSpecial: 'Sin recogida (dia especial)',
    confirmationNeeded: 'Confirmacion necesaria',
  },

  // Bag form (shared between create & edit)
  bagForm: {
    newBag: 'Nueva bolsa',
    editBag: 'Editar bolsa',
    relistBag: 'Volver a publicar bolsa',
    bagDetails: 'Detalles de la bolsa',
    bagName: 'Nombre de la bolsa',
    bagNameDefault: 'Bolsa Sorpresa',
    bagDescription: 'Descripcion',
    bagDescriptionDefault: 'Rescata una Bolsa Sorpresa con una seleccion de comida deliciosa que la tienda tiene al final del dia.',
    size: 'Tamano',
    pricing: 'Precio',
    value: 'Valor',
    priceInApp: 'Precio en app',
    pricingError: 'El precio en app debe ser menor que el valor original.',
    savingsMessage: 'Clientes ahorran {pct}% sobre el valor original',
    schedule: 'Horario de recogida',
    quantity: 'Cantidad diaria',
    quantityLabel: 'Bolsas disponibles por dia',
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
    maxPhotosAlert: 'Maximo {max} fotos permitidas.',
    permissionsTitle: 'Permisos',
    permissionsGallery: 'Se necesitan permisos para acceder a la galeria.',
  },
} as const;
