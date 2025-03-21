import { navItems } from '@/constants/data';
import { signOut } from '@/lib/actions';
import { nestedArray } from 'types';

export function kbarActions(
  navigateTo: (url: string) => void,
  apiData: nestedArray
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
            icon: navItem.icon,
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
        icon: navItem.icon,
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

  // api data
  const productActions =
    apiData.products?.map((product) => ({
      id: `${product.title.toLowerCase()}Action`,
      name: product.title,
      keywords: product.title.toLowerCase(),
      section: 'Products',
      subtitle: `View ${product.title}`,
      imgUrl: product.img_url,
      perform: () => navigateTo(`/dashboard/products/${product.id}`)
    })) ?? [];

  const categoryActions =
    apiData.categories?.map((category) => ({
      id: `${category.title.toLowerCase()}Action`,
      name: category.title,
      keywords: category.title.toLowerCase(),
      section: 'Categories',
      subtitle: `View ${category.title}`,
      perform: () => navigateTo(`/dashboard/categories/${category.id}`)
    })) ?? [];

  const brandActions =
    apiData.brands?.map((brand) => ({
      id: `${brand.title.toLowerCase()}Action`,
      name: brand.title,
      keywords: brand.title.toLowerCase(),
      section: 'Brands',
      subtitle: `View ${brand.title}`,
      perform: () => navigateTo(`/dashboard/brands/${brand.id}`)
    })) ?? [];

  return [
    ...navigationActions,
    signOutAction,
    ...productActions,
    ...brandActions,
    ...categoryActions
  ];
}
