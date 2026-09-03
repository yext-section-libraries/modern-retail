import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import type { PuckComponent } from "@puckeditor/core";
import {
  AnalyticsScopeProvider,
  HoursStatus,
  type HoursType,
  Link,
} from "@yext/pages-components";
import {
  ComprehensiveCTA,
  EntityField,
  getAnalyticsScopeHash,
  getDefaultRTF,
  getDefaultForegroundColor,
  getThemeColorCssValue as resolveThemeColorCssValue,
  Image,
  MaybeRTF,
  resolveComponentData,
  type ComprehensiveCTAValue,
  type RichText,
  type StyledImageValue,
  type StyledTextValue,
  type ThemeColor,
  ThemeOptions,
  type TranslatableAssetImage,
  type TranslatableRichText,
  type TranslatableString,
  type YextComponentConfig,
  type YextEntityField,
  type YextFields,
  useDocument,
  VisibilityWrapper,
} from "@yext/visual-editor";

type StreamDocumentShape = {
  businessId?: string | number;
  uid?: string | number;
  name?: string;
  geomodifier?: string;
  hours?: HoursType;
  locale?: string;
  _yext?: {
    platformDomain?: string;
  };
};

type SharedTextFieldValue = {
  text: YextEntityField<TranslatableString>;
  styles: StyledTextValue;
  fontColor?: ThemeColor;
};

type SharedRichTextFieldValue = {
  text: YextEntityField<TranslatableRichText>;
  styles: StyledTextValue;
  fontColor?: ThemeColor;
};

type SharedImageFieldValue = {
  image: YextEntityField<TranslatableAssetImage>;
  aspectRatio: number;
  imageConstrain: "fixed" | "filled";
  styles?: StyledImageValue;
};

type HeroBackground = {
  type: "image" | "color";
  solidColor: ThemeColor;
  image: SharedImageFieldValue;
};

type HeroReviewsRatingAndCount = {
  rating: string;
  showStarsLabel: boolean;
  fontColor?: ThemeColor;
  starColor?: ThemeColor;
  dividerColor?: ThemeColor;
  reviewCountLabel: string;
};

type HoursStyles = {
  showCurrentStatus: boolean;
  timeFormat: "12h" | "24h";
};

type ModernRetailHeroProps = {
  section: {
    backgroundColor: ThemeColor;
    visibleOnLivePage: boolean;
  };
  background: HeroBackground;
  header: SharedTextFieldValue;
  additionalHeader: SharedTextFieldValue;
  reviewsRatingAndCount: HeroReviewsRatingAndCount;
  description: SharedRichTextFieldValue;
  hours: YextEntityField<HoursType>;
  hoursStyles: HoursStyles;
  ctas: Array<{ item: ComprehensiveCTAValue }>;
};

const heroBackgroundImageUrl =
  "https://a.mktgcdn.com/p/vQqhmnexQfZueJGyh5M_j5W4EcTkTyZlW93eIoqjjvQ/1900x1267.jpg";

const editorFieldStackStyle: React.CSSProperties = {
  display: "grid",
  gap: "12px",
  width: "100%",
  minWidth: 0,
  boxSizing: "border-box",
};

const editorFieldHeadingStyle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: 600,
  color: "#4b5563",
};

const disabledFieldBoxStyle: React.CSSProperties = {
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  minHeight: "44px",
  width: "100%",
  minWidth: 0,
  display: "flex",
  alignItems: "flex-start",
  padding: "10px 14px",
  boxSizing: "border-box",
  fontSize: "14px",
  color: "#4b5563",
  background: "#f9fafb",
  opacity: 0.9,
  pointerEvents: "none",
  whiteSpace: "normal",
  overflowWrap: "anywhere",
  wordBreak: "break-word",
};

const editorNoteStyle: React.CSSProperties = {
  fontSize: "12px",
  lineHeight: 1.45,
  color: "#6b7280",
};

const SegmentedSourceField = ({
  label = "Source",
  value,
  onChange,
}: {
  label?: string;
  value?: "entity" | "custom";
  onChange: (value: "entity" | "custom") => void;
}) => {
  const currentValue = value ?? "entity";
  const buttonStyle = (isActive: boolean): React.CSSProperties => ({
    flex: "1 1 0",
    minWidth: 0,
    minHeight: "56px",
    border: "1px solid #d1d5db",
    background: isActive ? "#eef3ff" : "#ffffff",
    color: isActive ? "#0b5fc1" : "#4b5563",
    fontWeight: isActive ? 600 : 500,
    fontSize: "14px",
    lineHeight: 1.2,
    cursor: "pointer",
    padding: "8px 10px",
    whiteSpace: "normal",
    overflowWrap: "break-word",
    wordBreak: "normal",
  });

  return (
    <div style={editorFieldStackStyle}>
      <div style={editorFieldHeadingStyle}>{label}</div>
      <div
        role="group"
        aria-label={label}
        style={{
          display: "flex",
          flexWrap: "nowrap",
          width: "100%",
          minWidth: 0,
        }}
      >
        <button
          type="button"
          onClick={() => onChange("entity")}
          aria-pressed={currentValue === "entity"}
          aria-label={`${label}: Knowledge Graph`}
          style={buttonStyle(currentValue === "entity")}
        >
          Knowledge Graph
        </button>
        <button
          type="button"
          onClick={() => onChange("custom")}
          aria-pressed={currentValue === "custom"}
          aria-label={`${label}: Custom`}
          style={buttonStyle(currentValue === "custom")}
        >
          Custom
        </button>
      </div>
    </div>
  );
};

const EditorNoteLink = ({
  href,
  children,
}: React.PropsWithChildren<{ href: string }>) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    style={{
      color: "#2563eb",
      textDecoration: "underline",
      textUnderlineOffset: "2px",
    }}
  >
    {children}
  </a>
);

const resolveSurfaceForegroundColor = (
  surfaceColor?: ThemeColor,
): string | undefined =>
  resolveThemeColorCssValue(getDefaultForegroundColor(surfaceColor));

const REVIEW_RATING_FIELD_PATH = "ref_reviewsAgg.averageRating" as const;
const REVIEW_COUNT_FIELD_PATH = "ref_reviewsAgg.reviewCount" as const;
const REVIEW_PUBLISHER_VALUE = "FIRSTPARTY" as const;
const FALLBACK_RATING_VALUE = "5.0";
const FALLBACK_REVIEW_COUNT_VALUE = "400";

const getValueAtPath = (value: unknown, path: string): unknown =>
  path.split(".").reduce<unknown>((current, part) => {
    if (current == null) return undefined;
    if (Array.isArray(current)) {
      const index = Number(part);
      return Number.isInteger(index) ? current[index] : undefined;
    }
    if (typeof current === "object") {
      return (current as Record<string, unknown>)[part];
    }
    return undefined;
  }, value);

const getFirstPartyReviewsAggregate = (streamDocument: any) => {
  const aggregates = getValueAtPath(streamDocument, "ref_reviewsAgg");
  if (!Array.isArray(aggregates)) return null;

  const match = aggregates.find((item) => {
    return (
      item &&
      typeof item === "object" &&
      (item as Record<string, unknown>).publisher === REVIEW_PUBLISHER_VALUE
    );
  });

  return match && typeof match === "object"
    ? (match as Record<string, unknown>)
    : null;
};

const getEntityRatingField = (streamDocument: any) => {
  const firstPartyAggregate = getFirstPartyReviewsAggregate(streamDocument);
  const candidateValue =
    firstPartyAggregate?.averageRating ??
    getValueAtPath(streamDocument, REVIEW_RATING_FIELD_PATH);

  if (
    typeof candidateValue === "string" ||
    typeof candidateValue === "number"
  ) {
    const trimmedValue = String(candidateValue).trim();
    if (trimmedValue.length > 0) {
      return { path: REVIEW_RATING_FIELD_PATH, value: trimmedValue };
    }
  }

  return null;
};

const getEntityReviewCountField = (streamDocument: any) => {
  const firstPartyAggregate = getFirstPartyReviewsAggregate(streamDocument);
  const candidateValue =
    firstPartyAggregate?.reviewCount ??
    getValueAtPath(streamDocument, REVIEW_COUNT_FIELD_PATH);

  if (
    typeof candidateValue === "string" ||
    typeof candidateValue === "number"
  ) {
    const trimmedValue = String(candidateValue).trim();
    if (trimmedValue.length > 0) {
      return { path: REVIEW_COUNT_FIELD_PATH, value: trimmedValue };
    }
  }

  return null;
};

const formatReviewCountLabel = (value: string) => {
  const numericValue = Number.parseInt(value, 10);
  if (!Number.isFinite(numericValue)) return value.trim();
  return `${numericValue} ${numericValue === 1 ? "Review" : "Reviews"}`;
};

const EntityMetricFieldFromDocument = ({
  label,
  path,
}: {
  label: string;
  path: string;
}) => (
  <div style={editorFieldStackStyle}>
    <div style={editorFieldHeadingStyle}>{label}</div>
    <div style={disabledFieldBoxStyle}>{path}</div>
  </div>
);

const ReviewSummaryDescription = () => {
  const streamDocument = useDocument<any>();
  const hasRating = Boolean(getEntityRatingField(streamDocument));
  const hasReviewCount = Boolean(getEntityReviewCountField(streamDocument));
  const hasCompleteReviewData = hasRating && hasReviewCount;

  return (
    <div
      style={{
        display: "grid",
        gap: "8px",
        fontSize: "12px",
        lineHeight: 1.45,
        color: "#6b7280",
      }}
    >
      <div>
        Ratings and review count are automatically populated using first-party
        review data for this account.
      </div>
      {!hasCompleteReviewData ? (
        <div>
          <strong>Please Note:</strong> First-party review rating and count data
          aren&apos;t currently available for this account. Sample content is
          being shown for preview purposes only and will not appear on the
          published page.
        </div>
      ) : null}
    </div>
  );
};

const ReviewGenerationNotice = () => {
  const [isDismissed, setIsDismissed] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    setIsDismissed(
      window.sessionStorage.getItem(
        "ps-hero-review-generation-notice-dismissed",
      ) === "true",
    );
  }, []);

  if (isDismissed) {
    return null;
  }

  return (
    <div
      style={{
        position: "relative",
        fontSize: "12px",
        lineHeight: 1.45,
        color: "#6b7280",
        background: "#f8fafc",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        padding: "10px 36px 10px 12px",
      }}
    >
      <button
        type="button"
        aria-label="Dismiss review generation notice"
        onClick={() => {
          if (typeof window !== "undefined") {
            window.sessionStorage.setItem(
              "ps-hero-review-generation-notice-dismissed",
              "true",
            );
          }
          setIsDismissed(true);
        }}
        style={{
          position: "absolute",
          top: "8px",
          right: "8px",
          width: "20px",
          height: "20px",
          border: 0,
          padding: 0,
          background: "transparent",
          color: "#6b7280",
          cursor: "pointer",
          fontSize: "14px",
          lineHeight: 1,
        }}
      >
        ×
      </button>
      <a
        href="https://www.yext.com/platform/features/review-generation"
        target="_blank"
        rel="noreferrer"
        style={{
          color: "#2563eb",
          textDecoration: "underline",
          textUnderlineOffset: "2px",
        }}
      >
        Review Generation
      </a>{" "}
      can help collect more first-party reviews and improve average rating and
      review count over time. Contact your account manager to learn more.
    </div>
  );
};

const toRenderableText = (value: unknown, fallback = "") => {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (value && typeof value === "object") {
    if ("text" in (value as Record<string, unknown>)) {
      const text = (value as Record<string, unknown>).text;
      if (typeof text === "string" || typeof text === "number") {
        return String(text);
      }
    }

    if ("defaultValue" in (value as Record<string, unknown>)) {
      const defaultValue = (value as Record<string, unknown>).defaultValue;
      if (
        typeof defaultValue === "string" ||
        typeof defaultValue === "number"
      ) {
        return String(defaultValue);
      }
    }
  }

  return fallback;
};

const resolveTextConstantValue = (
  field: YextEntityField<TranslatableString>,
  locale: string,
  streamDocument: StreamDocumentShape,
) =>
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
    toRenderableText(field.constantValue, ""),
  ).trim();

const resolveTextFieldValue = (
  field: YextEntityField<TranslatableString>,
  locale: string,
  streamDocument: StreamDocumentShape,
) =>
  toRenderableText(
    resolveComponentData(field, locale, streamDocument),
    resolveTextConstantValue(field, locale, streamDocument),
  ).trim();

const resolveImageConstantValue = (
  field: YextEntityField<TranslatableAssetImage>,
  locale: string,
  streamDocument: StreamDocumentShape,
) =>
  (resolveComponentData(
    {
      field: "",
      constantValue: field.constantValue,
      constantValueEnabled: true,
    } as YextEntityField<TranslatableAssetImage>,
    locale,
    streamDocument,
  ) ??
    field.constantValue) as
    | Exclude<TranslatableAssetImage, undefined>
    | undefined;

const resolveImageFieldValue = (
  field: YextEntityField<TranslatableAssetImage>,
  locale: string,
  streamDocument: StreamDocumentShape,
) =>
  (resolveComponentData(field, locale, streamDocument) ??
    resolveImageConstantValue(field, locale, streamDocument)) as
    | Exclude<TranslatableAssetImage, undefined>
    | undefined;

const getKnowledgeGraphEntityHref = (streamDocument: StreamDocumentShape) => {
  const base =
    typeof streamDocument?._yext?.platformDomain === "string" &&
    streamDocument._yext.platformDomain.trim().length > 0
      ? streamDocument._yext.platformDomain.replace(/\/$/, "")
      : "https://yext.com";
  const accountId =
    typeof streamDocument?.businessId === "string" ||
    typeof streamDocument?.businessId === "number"
      ? String(streamDocument.businessId).trim()
      : "";
  const entityId =
    typeof streamDocument?.uid === "string" ||
    typeof streamDocument?.uid === "number"
      ? String(streamDocument.uid).trim()
      : "";

  if (!accountId) return base;
  if (!entityId) return `${base}/s/${encodeURIComponent(accountId)}`;

  const params = new URLSearchParams({ entityIds: entityId });
  return `${base}/s/${encodeURIComponent(accountId)}/entity/edit3?${params.toString()}`;
};

const hasHoursValue = (value: unknown): value is HoursType =>
  Boolean(
    value &&
    typeof value === "object" &&
    Object.keys(value as Record<string, unknown>).length > 0,
  );

const KnowledgeGraphHoursNotice = () => {
  const streamDocument =
    (useDocument() as StreamDocumentShape | undefined) ?? {};
  const href = getKnowledgeGraphEntityHref(streamDocument);

  return !hasHoursValue(streamDocument.hours) ? (
    <div style={editorNoteStyle}>
      <strong>Please Note:</strong> Hours are linked to Knowledge Graph data,
      which is currently unavailable for this entity. Update the entity&apos;s{" "}
      <strong>Hours</strong> field in{" "}
      <EditorNoteLink href={href}>Knowledge Graph</EditorNoteLink>.
    </div>
  ) : null;
};

const defaultBackground: HeroBackground = {
  type: "image",
  solidColor: {
    selectedColor: "palette-primary",
    contrastingColor: "palette-primary-contrast",
  },
  image: {
    image: {
      field: "",
      constantValue: {
        url: heroBackgroundImageUrl,
        width: 1900,
        height: 1267,
        alternateText: {
          defaultValue: "Retail storefront hero image",
          hasLocalizedValue: "true",
        },
      },
      constantValueEnabled: true,
    },
    aspectRatio: 0,
    imageConstrain: "filled",
    styles: {
      borderRadius: "default",
    },
  },
};

const defaultHeader: SharedTextFieldValue = {
  text: {
    field: "name",
    constantValue: {
      defaultValue: "",
      hasLocalizedValue: "true",
    },
    constantValueEnabled: false,
  },
  styles: {
    fontFamily: "default",
    fontSize: "48px",
    fontWeight: "700",
    fontStyle: "default",
    textTransform: "uppercase",
  },
};

const defaultAdditionalHeader: SharedTextFieldValue = {
  text: {
    field: "geomodifier",
    constantValue: {
      defaultValue: "",
      hasLocalizedValue: "true",
    },
    constantValueEnabled: false,
  },
  styles: {
    fontFamily: "default",
    fontSize: "48px",
    fontWeight: "700",
    fontStyle: "default",
    textTransform: "uppercase",
  },
};

const defaultDescription: SharedRichTextFieldValue = {
  text: {
    field: "",
    constantValue: {
      defaultValue: getDefaultRTF(
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur feugiat, sem quis blandit gravida, eros lacus volutpat lorem, vitae viverra magna arcu non neque.",
      ),
      hasLocalizedValue: "true",
    },
    constantValueEnabled: true,
  },
  styles: {
    fontFamily: "default",
    fontSize: "16px",
    fontWeight: "default",
    fontStyle: "default",
    textTransform: "default",
  },
};

const defaultPrimaryCta: ComprehensiveCTAValue = {
  data: {
    actionType: "link",
    cta: {
      field: "",
      constantValue: {
        label: {
          defaultValue: "Get Directions",
          hasLocalizedValue: "true",
        },
        link: {
          defaultValue: "#",
          hasLocalizedValue: "true",
        },
        normalizeLink: false,
        openInNewTab: false,
      },
      constantValueEnabled: true,
      selectedType: "textAndLink",
    },
    openInNewTab: false,
  },
  styles: {
    variant: "primary",
    button: {
      fontFamily: "default",
      fontSize: "13px",
      fontWeight: "400",
      fontStyle: "default",
      textTransform: "uppercase",
      borderRadius: "default",
      letterSpacing: "0.08em",
    },
  },
};

const defaultSecondaryCta: ComprehensiveCTAValue = {
  data: {
    actionType: "link",
    cta: {
      field: "",
      constantValue: {
        label: {
          defaultValue: "Learn More",
          hasLocalizedValue: "true",
        },
        link: {
          defaultValue: "#",
          hasLocalizedValue: "true",
        },
        normalizeLink: false,
        openInNewTab: false,
      },
      constantValueEnabled: true,
      selectedType: "textAndLink",
    },
    openInNewTab: false,
  },
  styles: {
    variant: "secondary",
    button: {
      fontFamily: "default",
      fontSize: "13px",
      fontWeight: "400",
      fontStyle: "default",
      textTransform: "uppercase",
      borderRadius: "default",
      letterSpacing: "0.08em",
    },
  },
};

const heroFields: YextFields<ModernRetailHeroProps> = {
  section: {
    label: "Section",
    type: "object",
    objectFields: {
      visibleOnLivePage: {
        label: "Visible on Live Page",
        type: "radio",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      },
      backgroundColor: {
        label: "Card Background Color",
        type: "basicSelector",
        options: "BACKGROUND_COLOR",
      },
    },
  },
  background: {
    label: "Background",
    type: "object",
    objectFields: {
      type: {
        label: "Type",
        type: "radio",
        options: [
          { label: "Image", value: "image" },
          { label: "Solid Color", value: "color" },
        ],
      },
      solidColor: {
        label: "Fill",
        type: "basicSelector",
        options: "BACKGROUND_COLOR",
      },
      image: {
        label: "Background Image",
        type: "object",
        objectFields: {
          image: {
            type: "entityField",
            label: "Image",
            filter: {
              types: ["type.image"],
            },
          },
          aspectRatio: {
            label: "Aspect Ratio",
            type: "basicSelector",
            options: ThemeOptions.ASPECT_RATIO,
          },
          imageConstrain: {
            label: "Image Constrain",
            type: "select",
            options: [
              { label: "Fixed", value: "fixed" },
              { label: "Filled", value: "filled" },
            ],
          },
          styles: {
            label: "Image Styles",
            type: "styledImage",
          },
        },
      },
    },
  },
  header: {
    label: "Header",
    type: "object",
    objectFields: {
      text: {
        type: "entityField",
        label: "Text",
        filter: {
          types: ["type.string"],
        },
      },
      styles: {
        label: "Text Styles",
        type: "styledText",
      },
      fontColor: {
        label: "Font Color",
        type: "basicSelector",
        options: "SITE_COLOR",
      },
    },
  },
  additionalHeader: {
    label: "Additional Header",
    type: "object",
    objectFields: {
      text: {
        type: "entityField",
        label: "Text",
        filter: {
          types: ["type.string"],
        },
      },
      styles: {
        label: "Text Styles",
        type: "styledText",
      },
      fontColor: {
        label: "Font Color",
        type: "basicSelector",
        options: "SITE_COLOR",
      },
    },
  },
  reviewsRatingAndCount: {
    label: "First-Party Reviews Rating and Count",
    type: "object",
    objectFields: {
      description: {
        type: "custom",
        render: () => <ReviewSummaryDescription />,
      },
      rating: {
        type: "custom",
        render: () => (
          <EntityMetricFieldFromDocument
            label="Rating"
            path={REVIEW_RATING_FIELD_PATH}
          />
        ),
      },
      showStarsLabel: {
        label: "Show Star Label",
        type: "radio",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      },
      fontColor: {
        label: "Rating and Count Font Color",
        type: "basicSelector",
        options: "SITE_COLOR",
      },
      starColor: {
        label: "Star Rating Fill",
        type: "basicSelector",
        options: "SITE_COLOR",
      },
      dividerColor: {
        label: "Divider Color",
        type: "basicSelector",
        options: "SITE_COLOR",
      },
      reviewCountLabel: {
        type: "custom",
        render: () => (
          <EntityMetricFieldFromDocument
            label="Review Count"
            path={REVIEW_COUNT_FIELD_PATH}
          />
        ),
      },
      reviewDataNotice: {
        type: "custom",
        render: () => <ReviewGenerationNotice />,
      },
    },
  },
  description: {
    label: "Description",
    type: "object",
    objectFields: {
      text: {
        type: "entityField",
        label: "Text",
        filter: {
          types: ["type.rich_text_v2"],
        },
      },
      styles: {
        label: "Text Styles",
        type: "styledText",
      },
      fontColor: {
        label: "Font Color",
        type: "basicSelector",
        options: "SITE_COLOR",
      },
    },
  },
  hours: {
    type: "entityField",
    label: "Hours",
    filter: {
      types: ["type.hours"],
    },
    disableConstantValueToggle: true,
  },
  hoursStyles: {
    label: "Hours Styles",
    type: "object",
    objectFields: {
      notice: {
        type: "custom",
        render: () => <KnowledgeGraphHoursNotice />,
      },
      showCurrentStatus: {
        label: "Show Current Status",
        type: "radio",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      },
      timeFormat: {
        label: "Time Format",
        type: "select",
        options: [
          { label: "12 Hour", value: "12h" },
          { label: "24 Hour", value: "24h" },
        ],
      },
    },
  },
  ctas: {
    label: "Buttons",
    type: "array",
    arrayFields: {
      item: {
        label: "Button",
        type: "comprehensiveCTA",
      },
    },
    defaultItemProps: {
      item: defaultPrimaryCta,
    },
    getItemSummary: (row) => {
      const labelValue = row.item?.data?.cta?.constantValue?.label;
      if (typeof labelValue === "string") return labelValue;
      if (
        labelValue &&
        typeof labelValue === "object" &&
        typeof labelValue.defaultValue === "string"
      ) {
        return labelValue.defaultValue;
      }
      return "Button";
    },
    max: 2,
  },
};

const ModernRetailHeroComponent: PuckComponent<ModernRetailHeroProps> = (
  props,
) => {
  const streamDocument =
    (useDocument() as StreamDocumentShape | undefined) ?? {};
  const locale = streamDocument.locale ?? "en";
  const sectionFill =
    resolveThemeColorCssValue(props.section.backgroundColor);
  const sectionForeground =
    resolveSurfaceForegroundColor(props.section.backgroundColor);
  const heroBackgroundFill =
    resolveThemeColorCssValue(props.background.solidColor);
  const resolvedBackgroundImage =
    props.background.type === "image"
      ? resolveImageFieldValue(props.background.image.image, locale, streamDocument)
      : undefined;
  const hasBackgroundImage = Boolean(
    resolvedBackgroundImage &&
      typeof resolvedBackgroundImage === "object" &&
      "url" in resolvedBackgroundImage &&
      resolvedBackgroundImage.url,
  );
  const headerText =
    resolveTextFieldValue(props.header.text, locale, streamDocument) ||
    streamDocument.name ||
    "";
  const additionalHeaderText =
    resolveTextFieldValue(props.additionalHeader.text, locale, streamDocument) || "";
  const entityRatingField = getEntityRatingField(streamDocument);
  const entityReviewCountField = getEntityReviewCountField(streamDocument);
  const hasEntityRating = Boolean(entityRatingField?.value.trim());
  const hasEntityReviewCount = Boolean(entityReviewCountField?.value.trim());
  const isPreviewMode = props.puck.isEditing;
  const previewRatingFallback =
    props.reviewsRatingAndCount?.rating?.trim() || FALLBACK_RATING_VALUE;
  const previewReviewCountFallback =
    props.reviewsRatingAndCount?.reviewCountLabel?.trim() ||
    FALLBACK_REVIEW_COUNT_VALUE;
  const rating = hasEntityRating
    ? (entityRatingField?.value.trim() ?? "")
    : isPreviewMode
      ? previewRatingFallback
      : "";
  const hasRating = rating.length > 0;
  const reviewCountValue = hasEntityReviewCount
    ? (entityReviewCountField?.value.trim() ?? "")
    : isPreviewMode
      ? previewReviewCountFallback
      : "";
  const hasReviewCount = reviewCountValue.length > 0;
  const showStarLabel = Boolean(props.reviewsRatingAndCount?.showStarsLabel);
  const ratingAndCountFontColor =
    resolveThemeColorCssValue(props.reviewsRatingAndCount.fontColor) ??
    sectionForeground;
  const starRatingColor =
    resolveThemeColorCssValue(props.reviewsRatingAndCount.starColor) ??
    "currentColor";
  const filledStars = Number.isFinite(Number.parseFloat(rating))
    ? Math.max(0, Math.min(5, Math.floor(Number.parseFloat(rating))))
    : 0;
  const dividerColor =
    resolveThemeColorCssValue(props.reviewsRatingAndCount.dividerColor) ??
    "currentColor";
  const reviewCountLabel = hasReviewCount
    ? formatReviewCountLabel(reviewCountValue)
    : "";
  const resolvedDescription = resolveComponentData(
    props.description.text,
    locale,
    streamDocument,
    {
      richTextStyleOverrides: {
        ...props.description.styles,
      },
    },
  );
  const descriptionContent = React.isValidElement(resolvedDescription) ? (
    resolvedDescription
  ) : (
    <MaybeRTF
      data={resolvedDescription as string | RichText | undefined}
      richTextStyleOverrides={{
        ...props.description.styles,
      }}
    />
  );
  const resolvedHours = resolveComponentData(
    props.hours,
    locale,
    streamDocument,
  ) as HoursType | undefined;
  const timezone =
    Intl.DateTimeFormat().resolvedOptions().timeZone || "America/New_York";
  const timeOptions: Intl.DateTimeFormatOptions =
    props.hoursStyles.timeFormat === "24h"
      ? { hour: "2-digit", minute: "2-digit", hour12: false }
      : { hour: "numeric", minute: "2-digit" };
  const ctas = (props.ctas ?? []).slice(0, 2).map((row, index) => {
    const usesSurfaceDefaultColor =
      row.item.styles?.variant !== "primary" &&
      !row.item.styles?.color;

    return {
      entityField: row.item.data.cta,
      value: {
        data: row.item.data,
        styles: {
          ...row.item.styles,
          color: usesSurfaceDefaultColor
            ? props.section.backgroundColor.contrastingColor
              ? {
                  selectedColor: props.section.backgroundColor.contrastingColor,
                  contrastingColor: props.section.backgroundColor.selectedColor,
                }
              : undefined
            : row.item.styles?.color,
        },
        className: row.item.className,
        eventName: row.item.eventName,
        sx: row.item.sx,
      } as Partial<ComprehensiveCTAValue>,
      eventName: index === 0 ? "primaryCta" : "secondaryCta",
    };
  });
  const backgroundImageWrapperStyle: React.CSSProperties = {
    aspectRatio:
      props.background.image.aspectRatio > 0
        ? props.background.image.aspectRatio
        : undefined,
    height: "100%",
    overflow:
      props.background.image.imageConstrain === "filled" ? "hidden" : undefined,
    position: "absolute",
    inset: 0,
    width: "100%",
  };
  const backgroundImageStyle: React.CSSProperties = {
    display: "block",
    height: "100%",
    objectFit:
      props.background.image.imageConstrain === "filled" ? "cover" : "contain",
    width: "100%",
  };

  return (
    <AnalyticsScopeProvider
      name={`ModernRetailHero${getAnalyticsScopeHash(props.id)}`}
    >
      <VisibilityWrapper
        liveVisibility={props.section.visibleOnLivePage}
        isEditing={props.puck.isEditing}
      >
        <style>{`
          .ps-hero-shell { position: relative; overflow: hidden; }
          .ps-hero-card { box-shadow: 0 16px 40px rgba(17, 17, 17, 0.06); }
          .ps-hero-title {
            font-family: "Roboto", sans-serif;
            font-size: 48px;
            font-style: normal;
            font-weight: 700;
            letter-spacing: -0.04em;
            line-height: 0.96;
            text-transform: uppercase;
          }
          .ps-hero-cta {
            align-items: center;
            display: inline-flex;
            font-family: "Roboto Mono", "Courier New", monospace;
            font-size: 13px;
            font-weight: 400;
            justify-content: center;
            letter-spacing: 0.08em;
            line-height: 1;
            min-height: 44px;
            padding: 10px 24px;
            text-decoration: none;
            text-transform: uppercase;
            transition: transform 180ms ease, background-color 180ms ease, color 180ms ease;
          }
          .ps-hero-cta:hover,
          .ps-hero-cta:focus-visible {
            transform: translateY(-1px);
          }
          .ps-hero-description,
          .ps-hero-description p {
            margin: 0;
          }
          .ps-hero-description p + p {
            margin-top: 1em;
          }
          @media (min-width: 1440px) {
            .ps-hero-layout {
              min-height: 620px !important;
            }
            .ps-hero-overlay {
              padding: 24px 0 !important;
            }
          }
          @media (max-width: 1024px) {
            .ps-hero-layout {
              min-height: 700px !important;
            }
            .ps-hero-title {
              font-size: 30px;
            }
          }
          @media (max-width: 749px) {
            .ps-hero-layout {
              min-height: 620px !important;
            }
            .ps-hero-card {
              margin: 0 16px 24px !important;
              max-width: 320px !important;
              padding: 24px !important;
            }
            .ps-hero-actions {
              align-items: stretch !important;
              display: grid !important;
              width: 100%;
            }
            .ps-hero-title {
              font-size: 30px;
            }
            .ps-hero-cta {
              width: 100%;
            }
          }
        `}</style>
        <section
          className="ps-hero-shell"
          style={{}}
        >
          <div
            className="ps-hero-layout"
            style={{
              backgroundColor: heroBackgroundFill,
              maxHeight: "900px",
              minHeight: "780px",
              position: "relative",
            }}
          >
            {hasBackgroundImage && resolvedBackgroundImage ? (
              <EntityField
                displayName="Background Image"
                fieldId={props.background.image.image.field}
                constantValueEnabled={props.background.image.image.constantValueEnabled}
              >
                <div style={backgroundImageWrapperStyle}>
                  <Image
                    image={resolvedBackgroundImage}
                    className="ps-hero-background-image"
                    style={backgroundImageStyle}
                  />
                </div>
              </EntityField>
            ) : (
              <div
                aria-hidden="true"
                style={{
                  backgroundColor: heroBackgroundFill,
                  height: "100%",
                  inset: 0,
                  position: "absolute",
                  width: "100%",
                }}
              />
            )}
            <div
              className="ps-hero-overlay"
              style={{
                alignItems: "flex-end",
                display: "flex",
                inset: 0,
                padding: "32px 0",
                position: "absolute",
              }}
            >
              <div
                className="ps-hero-content"
                style={{
                  margin: "0 auto",
                  maxWidth: "1200px",
                  padding: "0 16px",
                  width: "100%",
                }}
              >
                <div
                  className="ps-hero-card"
                  style={{
                    backgroundColor: sectionFill,
                    color: sectionForeground,
                    maxWidth: "420px",
                    padding: "28px 28px 24px",
                  }}
                >
                  {hasHoursValue(resolvedHours) && props.hoursStyles.showCurrentStatus ? (
                    <EntityField
                      displayName="Hours"
                      fieldId={props.hours.field}
                      constantValueEnabled={props.hours.constantValueEnabled}
                    >
                      <div
                        style={{
                          alignItems: "center",
                          display: "flex",
                          fontFamily: undefined,
                          fontSize: "16px",
                          fontWeight: 400,
                          gap: "8px",
                          lineHeight: 1.45,
                          marginBottom: "18px",
                        }}
                      >
                        <span
                          style={{
                            backgroundColor: "#22c55e",
                            borderRadius: "999px",
                            boxShadow: "0 0 0 2.5px rgba(34,197,94,0.18)",
                            display: "inline-block",
                            flex: "0 0 auto",
                            height: "4px",
                            width: "4px",
                          }}
                        />
                        <span>
                          <HoursStatus
                            hours={resolvedHours}
                            timezone={timezone}
                            timeOptions={timeOptions}
                            statusTemplate={({
                              isOpen,
                              currentInterval,
                              futureInterval,
                            }) => {
                              if (isOpen && currentInterval) {
                                return `Open Now: Closes at ${currentInterval.getEndTime(
                                  locale,
                                  timeOptions,
                                )}`;
                              }
                              if (!isOpen && futureInterval) {
                                return `Opens Today: ${futureInterval.getStartTime(
                                  locale,
                                  timeOptions,
                                )}`;
                              }
                              return "Closed Today";
                            }}
                          />
                        </span>
                      </div>
                    </EntityField>
                  ) : null}
                  <h1 className="ps-hero-title" style={{ margin: 0 }}>
                    <EntityField
                      displayName="Header"
                      fieldId={props.header.text.field}
                      constantValueEnabled={props.header.text.constantValueEnabled}
                    >
                      <span
                        style={{
                          fontFamily:
                            props.header.styles.fontFamily === "default"
                              ? undefined
                              : props.header.styles.fontFamily,
                          fontSize:
                            props.header.styles.fontSize === "default"
                              ? undefined
                              : props.header.styles.fontSize,
                          fontStyle:
                            props.header.styles.fontStyle === "default"
                              ? undefined
                              : props.header.styles.fontStyle,
                          fontWeight:
                            props.header.styles.fontWeight === "default"
                              ? undefined
                              : props.header.styles.fontWeight,
                          textTransform:
                            props.header.styles.textTransform === "default"
                              ? undefined
                              : props.header.styles.textTransform,
                        }}
                      >
                        {headerText}
                      </span>
                    </EntityField>
                  </h1>
                  {additionalHeaderText ? (
                    <EntityField
                      displayName="Additional Header"
                      fieldId={props.additionalHeader.text.field}
                      constantValueEnabled={props.additionalHeader.text.constantValueEnabled}
                    >
                      <p
                        style={{
                          margin: "8px 0 0",
                          fontFamily:
                            props.additionalHeader.styles.fontFamily === "default"
                              ? undefined
                              : props.additionalHeader.styles.fontFamily,
                          fontSize:
                            props.additionalHeader.styles.fontSize === "default"
                              ? undefined
                              : props.additionalHeader.styles.fontSize,
                          fontStyle:
                            props.additionalHeader.styles.fontStyle === "default"
                              ? undefined
                              : props.additionalHeader.styles.fontStyle,
                          fontWeight:
                            props.additionalHeader.styles.fontWeight === "default"
                              ? undefined
                              : props.additionalHeader.styles.fontWeight,
                          textTransform:
                            props.additionalHeader.styles.textTransform === "default"
                              ? undefined
                              : props.additionalHeader.styles.textTransform,
                        }}
                      >
                        {additionalHeaderText}
                      </p>
                    </EntityField>
                  ) : null}
                  <div
                    style={{
                      alignItems: "center",
                      color: ratingAndCountFontColor,
                      display: "flex",
                      flexWrap: "wrap",
                      fontFamily: undefined,
                      fontSize: "16px",
                      fontWeight: 400,
                      gap: "8px",
                      lineHeight: 1.2,
                      marginTop: "14px",
                    }}
                  >
                    {hasRating ? <span>{rating}</span> : null}
                    {hasRating && showStarLabel ? <span>Stars</span> : null}
                    {hasRating ? (
                      <span
                        aria-hidden="true"
                        style={{ display: "inline-flex", gap: "2px" }}
                      >
                        {Array.from({ length: 5 }, (_, index) => (
                          <span
                            key={`star-${index}`}
                            style={{
                              color:
                                index < filledStars
                                  ? starRatingColor
                                  : "currentColor",
                              fontSize: "16px",
                              lineHeight: 1,
                            }}
                          >
                            ★
                          </span>
                        ))}
                      </span>
                    ) : null}
                    {reviewCountLabel ? (
                      <>
                        {hasRating ? (
                          <span style={{ color: dividerColor }}>|</span>
                        ) : null}
                        <span>{reviewCountLabel}</span>
                      </>
                    ) : null}
                  </div>
                  <EntityField
                    displayName="Description"
                    fieldId={props.description.text.field}
                    constantValueEnabled={props.description.text.constantValueEnabled}
                  >
                    <div
                      className="ps-hero-description"
                      style={{
                        margin: "18px 0 0",
                      }}
                    >
                      {descriptionContent}
                    </div>
                  </EntityField>
                  <div
                    className="ps-hero-actions"
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "16px",
                      marginTop: "22px",
                    }}
                  >
                    {ctas.map((cta, index) => (
                      <EntityField
                        key={`${cta.eventName}-${index}`}
                        displayName={
                          index === 0
                            ? "Primary Call to Action"
                            : "Secondary Call to Action"
                        }
                        fieldId={cta.entityField.field}
                        constantValueEnabled={
                          cta.entityField.constantValueEnabled
                        }
                      >
                        <ComprehensiveCTA
                          value={cta.value}
                          className="ps-hero-cta"
                          eventName={cta.eventName}
                          onClick={
                            props.puck.isEditing
                              ? (event) => {
                                  event.preventDefault();
                                }
                              : undefined
                          }
                        />
                      </EntityField>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </VisibilityWrapper>
    </AnalyticsScopeProvider>
  );
};

export const ModernRetailHero: YextComponentConfig<ModernRetailHeroProps> =
  {
    label: "Hero",
    fields: heroFields,
    resolveFields: (data) => ({
      ...heroFields,
      background: {
        ...heroFields.background,
        objectFields: {
          ...heroFields.background.objectFields,
          solidColor: {
            ...heroFields.background.objectFields.solidColor,
            visible: true,
          },
          image: {
            ...heroFields.background.objectFields.image,
            visible: data.props.background?.type === "image",
          },
        },
      },
    }),
    defaultProps: {
      section: {
        visibleOnLivePage: true,
        backgroundColor: {
          selectedColor: "palette-primary",
          contrastingColor: "palette-primary-contrast",
        },
      },
      background: defaultBackground,
      header: defaultHeader,
      additionalHeader: defaultAdditionalHeader,
      reviewsRatingAndCount: {
        showStarsLabel: true,
        rating: "",
        reviewCountLabel: "",
      },
      description: defaultDescription,
      hours: {
        field: "hours",
        constantValue: {},
        constantValueEnabled: false,
      },
      hoursStyles: {
        showCurrentStatus: true,
        timeFormat: "12h",
      },
      ctas: [
        { item: defaultPrimaryCta },
        { item: defaultSecondaryCta },
      ],
    },
    render: (props) => <ModernRetailHeroComponent {...props} />,
  };

export const config: SectionConfig = {
  id: "ModernRetailHero",
  displayName: "Hero",
  description: "Hero",
  pageSetTypes: ["ENTITY"],
};
