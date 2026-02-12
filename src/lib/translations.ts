export type Locale = 'pt' | 'en' | 'es'

export const translations = {
  pt: {
    nav: {
      home: 'Início',
      search: 'Pesquisar',
      discover: 'Descubra',
      guides: 'Guias',
      cameras: 'Câmeras',
      foztv: 'FozTV',
      portal: 'Portal',
    },
    searchPlaceholder: 'Buscar empresa...',
    messages: 'Mensagens',
    notifications: 'Notificações',
    profile: 'Perfil',
    myProfile: 'Meu Perfil',
    myCompanies: 'Minhas Empresas',
    dashboard: 'Dashboard',
    logout: 'Sair',
    login: 'Entrar',
    register: 'Cadastrar',
    language: 'Idioma',
  },
  en: {
    nav: {
      home: 'Home',
      search: 'Search',
      discover: 'Discover',
      guides: 'Guides',
      cameras: 'Cameras',
      foztv: 'FozTV',
      portal: 'Portal',
    },
    searchPlaceholder: 'Search business...',
    messages: 'Messages',
    notifications: 'Notifications',
    profile: 'Profile',
    myProfile: 'My Profile',
    myCompanies: 'My Businesses',
    dashboard: 'Dashboard',
    logout: 'Log out',
    login: 'Log in',
    register: 'Sign up',
    language: 'Language',
  },
  es: {
    nav: {
      home: 'Inicio',
      search: 'Buscar',
      discover: 'Descubrir',
      guides: 'Guías',
      cameras: 'Cámaras',
      foztv: 'FozTV',
      portal: 'Portal',
    },
    searchPlaceholder: 'Buscar empresa...',
    messages: 'Mensajes',
    notifications: 'Notificaciones',
    profile: 'Perfil',
    myProfile: 'Mi Perfil',
    myCompanies: 'Mis Empresas',
    dashboard: 'Panel',
    logout: 'Salir',
    login: 'Entrar',
    register: 'Registrarse',
    language: 'Idioma',
  },
} as const

export function getTranslations(locale: Locale) {
  return translations[locale] ?? translations.pt
}
