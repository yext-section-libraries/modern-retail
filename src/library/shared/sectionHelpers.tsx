import * as React from "react";
import type { ComplexImageType, ImageType } from "@yext/pages-components";
import {
  MaybeRTF,
  getThemeColorCssValue,
  resolveComponentData,
  type MaybeRTFProps,
  type RichText,
  type StyledTextValue,
  type ThemeColor,
  type TranslatableAssetImage,
  type TranslatableString,
  type YextEntityField,
} from "@yext/visual-editor";

type TextStyles = Pick<
  StyledTextValue,
  "fontFamily" | "fontSize" | "fontWeight" | "fontStyle" | "textTransform"
> & { letterSpacing?: string };

/** Options formerly exposed as ThemeOptions.ASPECT_RATIO. */
export const aspectRatioOptions = [
  { label: "1:1", value: 1 },
  { label: "5:4", value: 1.25 },
  { label: "4:3", value: 1.33 },
  { label: "3:2", value: 1.5 },
  { label: "5:3", value: 1.67 },
  { label: "16:9", value: 1.78 },
  { label: "2:1", value: 2 },
  { label: "3:1", value: 3 },
  { label: "4:1", value: 4 },
  { label: "4:5", value: 0.8 },
  { label: "3:4", value: 0.75 },
  { label: "2:3", value: 0.67 },
];

export const getTextStyles = (
  styles: TextStyles,
  color?: ThemeColor,
  fallbackColor?: string,
): React.CSSProperties => ({
  color: getThemeColorCssValue(color) ?? fallbackColor,
  fontFamily: styles.fontFamily === "default" ? undefined : styles.fontFamily,
  fontSize: styles.fontSize === "default" ? undefined : styles.fontSize,
  fontWeight: styles.fontWeight === "default" ? undefined : styles.fontWeight,
  fontStyle: styles.fontStyle === "default" ? undefined : styles.fontStyle,
  textTransform:
    styles.textTransform === "default" ? undefined : styles.textTransform,
  letterSpacing:
    !styles.letterSpacing || styles.letterSpacing === "default"
      ? undefined
      : styles.letterSpacing,
});

export const hasExplicitThemeColor = (
  color?: ThemeColor,
): color is ThemeColor =>
  Boolean(color?.selectedColor && color.selectedColor !== "default");

export const renderResolvedRichText = (
  value: unknown,
  richTextStyleOverrides?: MaybeRTFProps["richTextStyleOverrides"],
): React.ReactNode => {
  if (React.isValidElement(value)) {
    if (!richTextStyleOverrides) {
      return value;
    }

    return React.cloneElement(
      value as React.ReactElement<{ style?: React.CSSProperties }>,
      {
        style: {
          ...(value.props as { style?: React.CSSProperties }).style,
          ...richTextStyleOverrides,
          color:
            typeof richTextStyleOverrides.color === "string"
              ? richTextStyleOverrides.color
              : getThemeColorCssValue(richTextStyleOverrides.color),
        },
      },
    );
  }

  const data =
    typeof value === "string" ||
    (typeof value === "object" && value !== null && "html" in value)
      ? (value as RichText | string)
      : undefined;

  return (
    <MaybeRTF
      data={data}
      richTextStyleOverrides={richTextStyleOverrides}
    />
  );
};

export const isRichTextEmpty = (value: unknown): boolean => {
  if (!value) {
    return true;
  }

  if (typeof value === "string") {
    return value.trim() === "";
  }

  if (typeof value === "object" && "html" in value) {
    const html = (value as { html?: unknown }).html;
    return typeof html !== "string" || html.trim() === "";
  }

  return false;
};

export const toRenderableText = (value: unknown, fallback = ""): string => {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (typeof record.text === "string" || typeof record.text === "number") {
      return String(record.text);
    }
    if (
      typeof record.defaultValue === "string" ||
      typeof record.defaultValue === "number"
    ) {
      return String(record.defaultValue);
    }
  }

  return fallback;
};

export const resolveTextConstantValue = (
  field: YextEntityField<TranslatableString>,
  locale: string,
  streamDocument: Record<string, any>,
): string =>
  toRenderableText(
    resolveComponentData(
      {
        field: "",
        constantValue: field.constantValue,
        constantValueEnabled: true,
      } as YextEntityField<TranslatableString>,
      locale,
      streamDocument,
    ),
    toRenderableText(field.constantValue),
  ).trim();

export const resolveTextFieldValue = (
  field: YextEntityField<TranslatableString>,
  locale: string,
  streamDocument: Record<string, any>,
): string =>
  toRenderableText(
    resolveComponentData(field, locale, streamDocument),
    resolveTextConstantValue(field, locale, streamDocument),
  ).trim();

export const resolveImageConstantValue = (
  field: YextEntityField<TranslatableAssetImage>,
  locale: string,
  streamDocument: Record<string, any>,
): Exclude<TranslatableAssetImage, undefined> | undefined =>
  (resolveComponentData(
    {
      field: "",
      constantValue: field.constantValue,
      constantValueEnabled: true,
    } as YextEntityField<TranslatableAssetImage>,
    locale,
    streamDocument,
  ) ?? field.constantValue) as
    | Exclude<TranslatableAssetImage, undefined>
    | undefined;

export const resolveImageFieldValue = (
  field: YextEntityField<TranslatableAssetImage>,
  locale: string,
  streamDocument: Record<string, any>,
): Exclude<TranslatableAssetImage, undefined> | undefined =>
  (resolveComponentData(field, locale, streamDocument) ??
    resolveImageConstantValue(field, locale, streamDocument)) as
    | Exclude<TranslatableAssetImage, undefined>
    | undefined;

export const hasImageSource = (
  image: ImageType | ComplexImageType | TranslatableAssetImage | undefined,
): image is ImageType | ComplexImageType | TranslatableAssetImage => {
  if (!image || typeof image !== "object") {
    return false;
  }

  if ("url" in image && typeof image.url === "string" && image.url.trim()) {
    return true;
  }

  return Boolean(
    "image" in image &&
      image.image &&
      typeof image.image === "object" &&
      "url" in image.image &&
      typeof image.image.url === "string" &&
      image.image.url.trim(),
  );
};

export const resolveBorderRadius = (value?: string): string | undefined =>
  !value || value === "default" ? undefined : value;
