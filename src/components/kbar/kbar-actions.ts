import { navItems } from '@/constants/data';
import {
  formatTitle,
  getRoleBasedNavItems,
  handleSignOut
} from '@/utils/utils';
import { itemTable, nestedArray } from 'types';

export function kbarActions(
  navigateTo: (url: string) => void,
  apiData: nestedArray,
  currentRole: string
) {
  const roleBasedNavItems = getRoleBasedNavItems(navItems, currentRole);

  const navigationActions = roleBasedNavItems
    .filter(
      (navItem) =>
        !(navItem.title === 'Dashboard' && currentRole !== 'super_admin')
    )
    .flatMap((navItem) => {
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

      return baseAction ? [baseAction, ...childActions] : childActions;
    });

  const newActions = navItems
    .filter(
      (navItem) =>
        navItem.title !== 'Dashboard' && navItem.title !== 'Super Dashboard'
    ) // Exclude "Dashboard"
    .flatMap((navItem) => {
      return {
        id: `new${navItem.title.toLowerCase()}Action`,
        name: `New ${navItem.title}`,
        shortcut: ['n', navItem.shortcut?.[1]], // Example: ['n', 'p'] for products
        keywords: `new ${navItem.title.toLowerCase()}`,
        section: 'Create Actions',
        subtitle: formatTitle(
          'Create new',
          navItem.title.toLowerCase() as itemTable
        ),
        icon: navItem.icon,
        perform: () => navigateTo(`${navItem.url}/new`)
      };
    });

  // sign-out action
  const signOutAction = {
    id: 'signOutAction',
    name: 'Sign Out',
    shortcut: ['s', 'o'],
    keywords: 'logout signout exit',
    section: 'Account',
    subtitle: 'Sign out of your account',
    perform: handleSignOut
  };

  // api data
  const productActions =
    apiData.products?.map((product) => ({
      id: `${product.title?.toLowerCase()}Action`,
      name: product.title,
      keywords: product.title?.toLowerCase() && product.product_code,
      section: 'Products',
      subtitle: `View this product`,
      imgUrl: product.img_url,
      perform: () => navigateTo(`/dashboard/products/${product.id}`)
    })) ?? [];

  const categoryActions =
    apiData.categories?.map((category) => ({
      id: `${category.title.toLowerCase()}Action`,
      name: category.title,
      keywords: category.title.toLowerCase(),
      section: 'Categories',
      subtitle: `View this category`,
      perform: () => navigateTo(`/dashboard/categories/${category.id}`)
    })) ?? [];

  const brandActions =
    apiData.brands?.map((brand) => ({
      id: `${brand.title.toLowerCase()}Action`,
      name: brand.title,
      keywords: brand.title.toLowerCase(),
      section: 'Brands',
      subtitle: `View this brand`,
      perform: () => navigateTo(`/dashboard/brands/${brand.id}`)
    })) ?? [];

  return [
    ...navigationActions,
    ...(currentRole === 'super_admin' ? newActions : []),
    ...productActions,
    ...brandActions,
    ...categoryActions,
    signOutAction
  ];
}
