// using this component in the server side in `listingPage` to fix the form flickering bug
'use client';

import { useQueryClient } from '@tanstack/react-query';

export default function RefetchKBar() {
  const queryClient = useQueryClient();

  queryClient.invalidateQueries({ queryKey: ['nestedData'] });

  return null; // nothing rendered
}
