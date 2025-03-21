import { useKBar, useRegisterActions } from 'kbar';
import { useTheme } from 'next-themes';

const useThemeSwitching = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const { query } = useKBar();

  const themeAction = [
    {
      id: 'toggleTheme',
      name: 'Toggle Theme',
      shortcut: ['t', 't'],
      section: 'Theme',
      perform: toggleTheme
    },

    {
      id: 'setTheme',
      name: 'Set Theme',
      section: 'Theme',
      subtitle: 'Choose specific theme',
      keywords: 'theme mode',
      shortcut: ['s', 't']
    },
    {
      id: 'lightTheme',
      name: `Light ${theme === 'light' ? '(Current)' : ''}`,
      parent: 'setTheme',
      section: 'Theme',
      perform: () => {
        setTheme('light');
        // Reset KBar state after selection
        query.setCurrentRootAction(null);
      }
    },
    {
      id: 'darkTheme',
      name: `Dark ${theme === 'dark' ? '(Current)' : ''}`,
      parent: 'setTheme',
      section: 'Theme',
      perform: () => {
        setTheme('dark');
        // Reset KBar state after selection
        query.setCurrentRootAction(null);
      }
    }
  ];

  useRegisterActions(themeAction, [theme]);
};

export default useThemeSwitching;
