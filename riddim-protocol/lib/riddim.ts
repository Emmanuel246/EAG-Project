export type ComponentSplit = {
  name: string;
  share: number;
  wallet: string;
};

export type RiddimRegistration = {
  id: number;
  title: string;
  components: ComponentSplit[];
  createdAt: string;
  total: number;
};

export function normalizeComponentSplits(
  components: Array<{ name: string; share: number }>,
) {
  const normalized = components.map((component) => ({
    ...component,
    share: Number(component.share) || 0,
  }));

  const total = normalized.reduce((sum, component) => sum + component.share, 0);

  return {
    components: normalized,
    total,
  };
}

export function calculateSplit(
  amount: number,
  shares: Array<{ wallet: string; share: number }>,
) {
  const total = shares.reduce((sum, share) => sum + share.share, 0);

  return shares.map((share) => ({
    wallet: share.wallet,
    share: share.share,
    amount: total > 0 ? Math.round((amount * share.share) / total) : 0,
  }));
}

export function parseRiddimRegistration(input: string): {
  title: string;
  components: Array<{ name: string; share: number; wallet: string }>;
} {
  const [title, ...rawParts] = input.split("|").map((part) => part.trim());

  const components = rawParts.map((part) => {
    const [name, shareString, wallet] = part
      .split(":")
      .map((value) => value.trim());
    return {
      name,
      share: Number(shareString) || 0,
      wallet: wallet || "0x0000000000000000000000000000000000000000",
    };
  });

  return {
    title: title || "Untitled riddim",
    components,
  };
}
