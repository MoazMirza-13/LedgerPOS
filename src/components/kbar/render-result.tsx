import { ActionImpl, KBarResults, useMatches } from 'kbar';
import ResultItem from './result-item';

export default function RenderResults() {
  type SectionKey = 'Products' | 'Categories' | 'Brands';

  type ProcessedResults = {
    filtered: (string | ActionImpl)[];
    sections: Record<SectionKey, ActionImpl[]>;
  };

  const { results, rootActionId } = useMatches();
  const sectionOrder: SectionKey[] = ['Products', 'Categories', 'Brands'];

  const processedResults: ProcessedResults = results.reduce<ProcessedResults>(
    (acc, item) => {
      if (
        typeof item === 'string' ||
        (typeof item === 'object' &&
          'section' in item &&
          typeof item.section === 'string' &&
          !sectionOrder.includes(item.section as SectionKey))
      ) {
        acc.filtered.push(item as string | ActionImpl);
      } else if (
        typeof item === 'object' &&
        'section' in item &&
        sectionOrder.includes(item.section as SectionKey)
      ) {
        acc.sections[item.section as SectionKey].push(item as ActionImpl);
      }

      return acc;
    },
    {
      filtered: [],
      sections: { Products: [], Categories: [], Brands: [] }
    }
  );

  // Create final items list with modified sections
  const finalResults = processedResults.filtered.flatMap((item) =>
    typeof item === 'string' && sectionOrder.includes(item as SectionKey)
      ? [
          item,
          ...processedResults.sections[item as SectionKey].reverse().slice(0, 5)
        ]
      : [item]
  );

  return (
    <KBarResults
      items={finalResults}
      onRender={({ item, active }) =>
        typeof item === 'string' ? (
          <div className='px-4 py-2 text-sm uppercase text-primary-foreground opacity-50'>
            {item}
          </div>
        ) : (
          <ResultItem
            action={item}
            active={active}
            currentRootActionId={rootActionId ?? ''}
          />
        )
      }
    />
  );
}
