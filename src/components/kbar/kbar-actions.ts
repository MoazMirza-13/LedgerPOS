import { navItems } from '@/constants/data';
import { signOut } from '@/lib/actions';
import { Product } from 'types';

export function kbarActions(
  navigateTo: (url: string) => void,
  apiData: Product[]
) {
  const navigationActions = navItems.flatMap((navItem) => {
    const baseAction =
      navItem.url !== '#'
        ? {
            id: `${navItem.title.toLowerCase()}Action`,
            name: navItem.title,
            shortcut: navItem.shortcut,
            keywords: navItem.title.toLowerCase(),
            section: 'Navigation',
            subtitle: `Go to ${navItem.title}`,
            perform: () => navigateTo(navItem.url)
          }
        : null;

    // Map child items into actions
    const childActions =
      navItem.items?.map((childItem) => ({
        id: `${childItem.title.toLowerCase()}Action`,
        name: childItem.title,
        shortcut: childItem.shortcut,
        keywords: childItem.title.toLowerCase(),
        section: navItem.title,
        subtitle: `Go to ${childItem.title}`,
        perform: () => navigateTo(childItem.url)
      })) ?? [];

    // Return only valid actions (ignoring null base actions for containers)
    return baseAction ? [baseAction, ...childActions] : childActions;
  });

  // sign-out action
  const signOutAction = {
    id: 'signOutAction',
    name: 'Sign Out',
    shortcut: ['s', 'o'],
    keywords: 'logout signout exit',
    section: 'Account',
    subtitle: 'Sign out of your account',
    perform: signOut
  };

  const productActions =
    apiData?.map((product) => ({
      id: `${product.title.toLowerCase()}Action`,
      name: product.title,
      keywords: product.title.toLowerCase(),
      section: 'Products',
      subtitle: `Go to ${product.title}`,
      perform: () => navigateTo(`/dashboard/products/${product.id}`)
    })) ?? [];

  return [...navigationActions, signOutAction, ...productActions];
}
