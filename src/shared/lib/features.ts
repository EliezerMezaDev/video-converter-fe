/**
 * Features configuration — mirrors NEXT_PUBLIC_FEATURES_SETTINGS from the env.
 *
 * Expected env format (JSON string):
 *   NEXT_PUBLIC_FEATURES_SETTINGS={"feats":{"converter":{"fileMaxSize":500}}}
 *
 * Values are merged with safe defaults so missing keys never throw.
 */

const DEFAULT_FEATURES = {
  feats: {
    converter: {
      fileMaxSize: 500, // MB
    },
  },
} as const;

export type ConverterFeatures = {
  fileMaxSize: number;
};

export type Features = {
  feats: {
    converter: ConverterFeatures;
  };
};

function parseFeatures(): Features {
  const raw = process.env.NEXT_PUBLIC_FEATURES_SETTINGS;

  if (!raw) return DEFAULT_FEATURES;

  try {
    const parsed = JSON.parse(raw) as Partial<Features>;

    return {
      feats: {
        converter: {
          ...DEFAULT_FEATURES.feats.converter,
          ...(parsed?.feats?.converter ?? {}),
        },
      },
    };
  } catch {
    return DEFAULT_FEATURES;
  }
}

/** Parsed feature settings — singleton, evaluated once at module load. */
export const features: Features = parseFeatures();

/** Shorthand for converter-specific settings. */
export const converterFeatures: ConverterFeatures = features.feats.converter;
