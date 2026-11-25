import { useQuery } from "@tanstack/react-query";
import type { Printing } from "./data";
import { useCatalogue } from "./catalogue-provider";
import {
  artworkLanguage,
  loadArtworkSets,
  loadArtworkSet,
  matchArtworkSet,
  matchArtwork,
} from "./artwork";
const cache = {
  staleTime: 6 * 60 * 60 * 1000,
  gcTime: 30 * 60 * 1000,
  retry: 1,
  refetchOnWindowFocus: false,
};
export function useArtwork(card: Printing | undefined) {
  const { records } = useCatalogue();
  const source = records.find((record) => record.id === card?.setId);
  const language = card ? artworkLanguage(card.language) : null;
  const index = useQuery({
    ...cache,
    queryKey: ["tcgdex", "sets", language],
    queryFn: ({ signal }) => loadArtworkSets(language!, signal),
    enabled: !!language,
  });
  const match =
    card && source && index.data ? matchArtworkSet(index.data, source, card.language) : null;
  const detail = useQuery({
    ...cache,
    queryKey: ["tcgdex", "set", language, match?.id],
    queryFn: ({ signal }) => loadArtworkSet(language!, match!.id, signal),
    enabled: !!language && !!match,
  });
  const artwork =
    card && match && detail.data && language
      ? matchArtwork(card, match, detail.data, language)
      : null;
  return {
    artwork,
    pending: !!language && (index.isFetching || (!!match && detail.isFetching)),
    failed: index.isError || detail.isError,
  };
}
