export type Language = "ru" | "uk" | "en";

export interface Translations {
  common: {
    loading: string;
    error: string;
    save: string;
    cancel: string;
    delete: string;
    confirm: string;
    back: string;
    search: string;
    filter: string;
    noData: string;
  };
  auth: {
    login: string;
    logout: string;
    username: string;
    password: string;
    signIn: string;
    welcome: string;
    invalidCredentials: string;
  };
  status: {
    online: string;
    offline: string;
    new: string;
    accepted: string;
    inTransit: string;
    delivered: string;
    allStatuses: string;
  };
  order: {
    orderNumber: string;
    customer: string;
    address: string;
    restaurant: string;
    phone: string;
    items: string;
    total: string;
    payment: string;
    cash: string;
    card: string;
    comment: string;
    accept: string;
    pickedUp: string;
    confirmDelivery: string;
    newOrder: string;
    addOrder: string;
    noActiveOrders: string;
    waitingForOrders: string;
  };
  history: {
    title: string;
    searchCustomer: string;
    noOrders: string;
    changeFilters: string;
    emptyHistory: string;
  };
  earnings: {
    title: string;
    today: string;
    week: string;
    month: string;
    totalEarnings: string;
    deliveredOrders: string;
    totalOrders: string;
    completionRate: string;
    details: string;
    inProgress: string;
    averageCheck: string;
    noData: string;
  };
  menu: {
    addOrder: string;
    settings: string;
    history: string;
    earnings: string;
    addRestaurant: string;
    deleteRestaurant: string;
    addCustomer: string;
    deleteCustomer: string;
  };
  settings: {
    title: string;
    name: string;
    language: string;
    savedMarkers: string;
    restaurants: string;
    customers: string;
    noMarkers: string;
  };
  map: {
    yourLocation: string;
    restaurantMarker: string;
    customerMarker: string;
    navigate: string;
  };
  notifications: {
    newOrder: string;
    orderUpdated: string;
    statusChanged: string;
  };
}

export const translations: Record<Language, Translations> = {
  ru: {
    common: {
      loading: "Загрузка...",
      error: "Ошибка",
      save: "Сохранить",
      cancel: "Отмена",
      delete: "Удалить",
      confirm: "Подтвердить",
      back: "Назад",
      search: "Поиск",
      filter: "Фильтр",
      noData: "Нет данных",
    },
    auth: {
      login: "Вход",
      logout: "Выйти",
      username: "Имя пользователя",
      password: "Пароль",
      signIn: "Войти",
      welcome: "Добро пожаловать!",
      invalidCredentials: "Неверное имя пользователя или пароль",
    },
    status: {
      online: "На линии",
      offline: "Не на линии",
      new: "Новый",
      accepted: "Принят",
      inTransit: "В пути",
      delivered: "Доставлен",
      allStatuses: "Все статусы",
    },
    order: {
      orderNumber: "Номер заказа",
      customer: "Клиент",
      address: "Адрес",
      restaurant: "Ресторан",
      phone: "Телефон",
      items: "Товары",
      total: "Итого",
      payment: "Оплата",
      cash: "Наличные",
      card: "Карта",
      comment: "Комментарий",
      accept: "Принять заказ",
      pickedUp: "Забрал заказ",
      confirmDelivery: "Подтвердить доставку",
      newOrder: "Новый заказ!",
      addOrder: "Добавить заказ",
      noActiveOrders: "Нет активных заказов",
      waitingForOrders: "Ожидание новых заказов...",
    },
    history: {
      title: "История заказов",
      searchCustomer: "Поиск по имени клиента...",
      noOrders: "Нет заказов",
      changeFilters: "Измените фильтры для просмотра заказов",
      emptyHistory: "История заказов пуста",
    },
    earnings: {
      title: "Заработок",
      today: "Сегодня",
      week: "Неделя",
      month: "Месяц",
      totalEarnings: "Заработок",
      deliveredOrders: "Доставлено",
      totalOrders: "Всего заказов",
      completionRate: "Процент выполнения",
      details: "Детали",
      inProgress: "В обработке",
      averageCheck: "Средний чек",
      noData: "Нет данных за",
    },
    menu: {
      addOrder: "Добавить заказ",
      settings: "Изменить данные",
      history: "История заказов",
      earnings: "Заработок",
      addRestaurant: "Добавить маркер ресторана",
      deleteRestaurant: "Удалить маркер ресторана",
      addCustomer: "Добавить маркер клиента",
      deleteCustomer: "Удалить маркер клиента",
    },
    settings: {
      title: "Настройки",
      name: "Имя",
      language: "Язык",
      savedMarkers: "Сохраненные маркеры",
      restaurants: "Рестораны",
      customers: "Клиенты",
      noMarkers: "Нет сохраненных маркеров",
    },
    map: {
      yourLocation: "Ваше местоположение",
      restaurantMarker: "Маркер ресторана",
      customerMarker: "Маркер клиента",
      navigate: "Проложить маршрут",
    },
    notifications: {
      newOrder: "Новый заказ!",
      orderUpdated: "Обновление заказа",
      statusChanged: "Статус заказа изменен",
    },
  },
  uk: {
    common: {
      loading: "Завантаження...",
      error: "Помилка",
      save: "Зберегти",
      cancel: "Скасувати",
      delete: "Видалити",
      confirm: "Підтвердити",
      back: "Назад",
      search: "Пошук",
      filter: "Фільтр",
      noData: "Немає даних",
    },
    auth: {
      login: "Вхід",
      logout: "Вийти",
      username: "Ім'я користувача",
      password: "Пароль",
      signIn: "Увійти",
      welcome: "Ласкаво просимо!",
      invalidCredentials: "Невірне ім'я користувача або пароль",
    },
    status: {
      online: "На лінії",
      offline: "Не на лінії",
      new: "Новий",
      accepted: "Прийнято",
      inTransit: "В дорозі",
      delivered: "Доставлено",
      allStatuses: "Всі статуси",
    },
    order: {
      orderNumber: "Номер замовлення",
      customer: "Клієнт",
      address: "Адреса",
      restaurant: "Ресторан",
      phone: "Телефон",
      items: "Товари",
      total: "Разом",
      payment: "Оплата",
      cash: "Готівка",
      card: "Картка",
      comment: "Коментар",
      accept: "Прийняти замовлення",
      pickedUp: "Забрав замовлення",
      confirmDelivery: "Підтвердити доставку",
      newOrder: "Нове замовлення!",
      addOrder: "Додати замовлення",
      noActiveOrders: "Немає активних замовлень",
      waitingForOrders: "Очікування нових замовлень...",
    },
    history: {
      title: "Історія замовлень",
      searchCustomer: "Пошук за ім'ям клієнта...",
      noOrders: "Немає замовлень",
      changeFilters: "Змініть фільтри для перегляду замовлень",
      emptyHistory: "Історія замовлень порожня",
    },
    earnings: {
      title: "Заробіток",
      today: "Сьогодні",
      week: "Тиждень",
      month: "Місяць",
      totalEarnings: "Заробіток",
      deliveredOrders: "Доставлено",
      totalOrders: "Всього замовлень",
      completionRate: "Відсоток виконання",
      details: "Деталі",
      inProgress: "В обробці",
      averageCheck: "Середній чек",
      noData: "Немає даних за",
    },
    menu: {
      addOrder: "Додати замовлення",
      settings: "Змінити дані",
      history: "Історія замовлень",
      earnings: "Заробіток",
      addRestaurant: "Додати маркер ресторану",
      deleteRestaurant: "Видалити маркер ресторану",
      addCustomer: "Додати маркер клієнта",
      deleteCustomer: "Видалити маркер клієнта",
    },
    settings: {
      title: "Налаштування",
      name: "Ім'я",
      language: "Мова",
      savedMarkers: "Збережені маркери",
      restaurants: "Ресторани",
      customers: "Клієнти",
      noMarkers: "Немає збережених маркерів",
    },
    map: {
      yourLocation: "Ваше місцезнаходження",
      restaurantMarker: "Маркер ресторану",
      customerMarker: "Маркер клієнта",
      navigate: "Прокласти маршрут",
    },
    notifications: {
      newOrder: "Нове замовлення!",
      orderUpdated: "Оновлення замовлення",
      statusChanged: "Статус замовлення змінено",
    },
  },
  en: {
    common: {
      loading: "Loading...",
      error: "Error",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      confirm: "Confirm",
      back: "Back",
      search: "Search",
      filter: "Filter",
      noData: "No data",
    },
    auth: {
      login: "Login",
      logout: "Logout",
      username: "Username",
      password: "Password",
      signIn: "Sign In",
      welcome: "Welcome!",
      invalidCredentials: "Invalid username or password",
    },
    status: {
      online: "Online",
      offline: "Offline",
      new: "New",
      accepted: "Accepted",
      inTransit: "In Transit",
      delivered: "Delivered",
      allStatuses: "All Statuses",
    },
    order: {
      orderNumber: "Order Number",
      customer: "Customer",
      address: "Address",
      restaurant: "Restaurant",
      phone: "Phone",
      items: "Items",
      total: "Total",
      payment: "Payment",
      cash: "Cash",
      card: "Card",
      comment: "Comment",
      accept: "Accept Order",
      pickedUp: "Picked Up",
      confirmDelivery: "Confirm Delivery",
      newOrder: "New Order!",
      addOrder: "Add Order",
      noActiveOrders: "No active orders",
      waitingForOrders: "Waiting for new orders...",
    },
    history: {
      title: "Order History",
      searchCustomer: "Search by customer name...",
      noOrders: "No orders",
      changeFilters: "Change filters to view orders",
      emptyHistory: "Order history is empty",
    },
    earnings: {
      title: "Earnings",
      today: "Today",
      week: "Week",
      month: "Month",
      totalEarnings: "Earnings",
      deliveredOrders: "Delivered",
      totalOrders: "Total Orders",
      completionRate: "Completion Rate",
      details: "Details",
      inProgress: "In Progress",
      averageCheck: "Average Check",
      noData: "No data for",
    },
    menu: {
      addOrder: "Add Order",
      settings: "Edit Profile",
      history: "Order History",
      earnings: "Earnings",
      addRestaurant: "Add Restaurant Marker",
      deleteRestaurant: "Delete Restaurant Marker",
      addCustomer: "Add Customer Marker",
      deleteCustomer: "Delete Customer Marker",
    },
    settings: {
      title: "Settings",
      name: "Name",
      language: "Language",
      savedMarkers: "Saved Markers",
      restaurants: "Restaurants",
      customers: "Customers",
      noMarkers: "No saved markers",
    },
    map: {
      yourLocation: "Your Location",
      restaurantMarker: "Restaurant Marker",
      customerMarker: "Customer Marker",
      navigate: "Navigate",
    },
    notifications: {
      newOrder: "New Order!",
      orderUpdated: "Order Updated",
      statusChanged: "Order status changed",
    },
  },
};

export const languageNames: Record<Language, string> = {
  ru: "Русский",
  uk: "Українська",
  en: "English",
};
