// Script para aplicar tema dark no HTML antes da hidratação
export const themeScript = `
  (function() {
    try {
      // Sempre remover classes existentes primeiro
      document.documentElement.classList.remove('light', 'dark');
      
      const theme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const shouldUseDark = theme === 'dark' || (!theme && prefersDark);
      
      // Aplicar tema
      if (shouldUseDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.add('light');
      }
    } catch (e) {
      // Fallback para tema claro
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add('light');
    }
  })();
`;
